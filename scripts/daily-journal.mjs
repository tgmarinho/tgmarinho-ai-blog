#!/usr/bin/env node
/**
 * Daily work journal generator.
 *
 * Reads coding-agent sessions across multiple harnesses (Claude Code, Pi, Codex)
 * plus git log across all repos touched on a given day, then emits a markdown
 * digest you can edit and publish as proof-of-work.
 *
 * Sources:
 *   - ~/.claude/projects/<encoded-path>/*.jsonl              (Claude Code)
 *   - ~/.pi/agent/sessions/<encoded-path>--/*.jsonl          (Pi — pi.dev)
 *   - ~/.codex/sessions/<YYYY>/<MM>/<DD>/rollout-*.jsonl     (OpenAI Codex CLI)
 *
 * Usage:
 *   node scripts/daily-journal.mjs                     # today
 *   node scripts/daily-journal.mjs --date 2026-05-12   # specific day
 *   node scripts/daily-journal.mjs --date 2026-05-12 --out tmp/journal.md
 */
import { readFileSync, readdirSync, statSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { resolve, join, dirname } from "node:path";
import { execSync } from "node:child_process";

const HOME = homedir();
const CLAUDE_PROJECTS_DIR = join(HOME, ".claude", "projects");
const PI_SESSIONS_DIR = join(HOME, ".pi", "agent", "sessions");
const CODEX_SESSIONS_DIR = join(HOME, ".codex", "sessions");

const args = process.argv.slice(2);
function flag(name) {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
}
const DATE = flag("--date") ?? new Date().toISOString().slice(0, 10);
const OUT = flag("--out");

const dayStart = new Date(`${DATE}T00:00:00`);
const dayEnd = new Date(`${DATE}T23:59:59.999`);

// Decode session dir name back into a filesystem path by walking the FS.
// Session dirs replace both "/" and "." with "-", so we resolve greedily:
// at each level, pick the longest child dir whose name (with "." stripped to "-")
// matches a prefix of the remaining segments.
function decodeProjectDir(name) {
  const segments = name.replace(/^-/, "").split("-");
  let path = "/";
  let i = 0;
  while (i < segments.length) {
    let children;
    try {
      children = readdirSync(path);
    } catch {
      return null;
    }
    let bestChild = null;
    let bestConsumed = 0;
    for (const child of children) {
      const childKey = child.replace(/\./g, "-");
      const childParts = childKey.split("-");
      if (childParts.length > segments.length - i) continue;
      let ok = true;
      for (let k = 0; k < childParts.length; k++) {
        if (childParts[k] !== segments[i + k]) {
          ok = false;
          break;
        }
      }
      if (ok && childParts.length > bestConsumed) {
        bestChild = child;
        bestConsumed = childParts.length;
      }
    }
    if (!bestChild) return null;
    path = join(path, bestChild);
    i += bestConsumed;
  }
  return path;
}

function* readJsonl(path) {
  const raw = readFileSync(path, "utf8");
  for (const line of raw.split("\n")) {
    if (!line.trim()) continue;
    try {
      yield JSON.parse(line);
    } catch {}
  }
}

function sanitize(text) {
  if (!text) return "";
  return String(text)
    .replace(new RegExp(HOME, "g"), "~")
    .replace(/sk-[A-Za-z0-9_-]{20,}/g, "[REDACTED_KEY]")
    .replace(/ghp_[A-Za-z0-9]{20,}/g, "[REDACTED_GH_TOKEN]")
    .replace(/(?:[A-Za-z0-9+/]{40,}={0,2})/g, (m) => (m.length > 60 ? "[REDACTED_BLOB]" : m));
}

function extractClaudeUserText(msg) {
  const c = msg?.message?.content;
  if (typeof c === "string") return c;
  if (Array.isArray(c)) {
    return c
      .filter((p) => p?.type === "text" || typeof p?.text === "string")
      .map((p) => p.text ?? "")
      .join(" ");
  }
  return "";
}

// Codex + Conductor inject system blocks (<system_instruction>, <environment_context>,
// <INSTRUCTIONS>, <user-prompt-submit-hook>, etc.) into the same user message as the
// real prompt. Strip those wrappers so the noise filter sees the actual text.
function stripSystemWrappers(text) {
  if (!text) return text;
  let s = text;
  for (let i = 0; i < 6; i++) {
    const before = s;
    s = s.replace(/<([a-zA-Z][\w-]*)\b[^>]*>[\s\S]*?<\/\1>\s*/g, "").trim();
    if (s === before) break;
  }
  return s;
}

function isNoisePrompt(text) {
  const t = (text || "").trim();
  return (
    !t ||
    t.length < 6 ||
    t.length > 600 ||
    t.startsWith("<") || // <task-notification>, <environment_context>, <system_instruction>, command-name, bash-input, etc.
    t.startsWith("# AGENTS.md") || // codex preamble
    t.includes("<INSTRUCTIONS>") ||
    t.includes('"tool_use_id"') ||
    t.includes("[REDACTED_BLOB]") ||
    /^\[Request interrupted/.test(t) ||
    /^\s*\$ /.test(t) ||
    /^You are an expert /i.test(t) ||
    /Screenshot \d{4}-\d{2}-\d{2}/.test(t)
  );
}

function inDayWindow(ts) {
  return ts && ts >= dayStart && ts <= dayEnd;
}

function scanClaude() {
  const out = [];
  if (!existsSync(CLAUDE_PROJECTS_DIR)) return out;
  for (const projDir of readdirSync(CLAUDE_PROJECTS_DIR)) {
    const full = join(CLAUDE_PROJECTS_DIR, projDir);
    let entries;
    try {
      entries = readdirSync(full);
    } catch {
      continue;
    }
    for (const f of entries) {
      if (!f.endsWith(".jsonl")) continue;
      const p = join(full, f);
      let st;
      try {
        st = statSync(p);
      } catch {
        continue;
      }
      if (st.mtime < dayStart || st.mtime > new Date(dayEnd.getTime() + 24 * 3600 * 1000)) continue;

      const prompts = [];
      let firstTs = null;
      let lastTs = null;
      let cwd = null;
      for (const entry of readJsonl(p)) {
        if (!cwd && typeof entry?.cwd === "string") cwd = entry.cwd;
        const ts = entry?.timestamp ? new Date(entry.timestamp) : null;
        if (!inDayWindow(ts)) continue;
        if (!firstTs || ts < firstTs) firstTs = ts;
        if (!lastTs || ts > lastTs) lastTs = ts;
        if (entry?.type === "user") {
          const t = stripSystemWrappers(extractClaudeUserText(entry).trim());
          if (!isNoisePrompt(t)) prompts.push(t);
        }
      }
      if (prompts.length === 0) continue;
      out.push({
        agent: "claude",
        projectDir: projDir,
        repoPath: cwd ?? decodeProjectDir(projDir),
        file: f,
        firstTs,
        lastTs,
        prompts: prompts.slice(0, 5),
      });
    }
  }
  return out;
}

function scanPi() {
  const out = [];
  if (!existsSync(PI_SESSIONS_DIR)) return out;
  for (const projDir of readdirSync(PI_SESSIONS_DIR)) {
    const full = join(PI_SESSIONS_DIR, projDir);
    let entries;
    try {
      entries = readdirSync(full);
    } catch {
      continue;
    }
    for (const f of entries) {
      if (!f.endsWith(".jsonl")) continue;
      const p = join(full, f);
      let st;
      try {
        st = statSync(p);
      } catch {
        continue;
      }
      if (st.mtime < dayStart || st.mtime > new Date(dayEnd.getTime() + 24 * 3600 * 1000)) continue;

      const prompts = [];
      let firstTs = null;
      let lastTs = null;
      let cwd = null;
      for (const entry of readJsonl(p)) {
        if (entry?.type === "session" && entry.cwd) cwd = entry.cwd;
        const ts = entry?.timestamp ? new Date(entry.timestamp) : null;
        if (!inDayWindow(ts)) continue;
        if (!firstTs || ts < firstTs) firstTs = ts;
        if (!lastTs || ts > lastTs) lastTs = ts;
        if (entry?.type === "message" && entry?.message?.role === "user") {
          const c = entry.message.content;
          const text = Array.isArray(c)
            ? c
                .filter((p) => p?.type === "text" && typeof p?.text === "string")
                .map((p) => p.text)
                .join(" ")
            : typeof c === "string"
              ? c
              : "";
          const t = stripSystemWrappers(text.trim());
          if (!isNoisePrompt(t)) prompts.push(t);
        }
      }
      if (prompts.length === 0) continue;
      out.push({
        agent: "pi",
        projectDir: projDir,
        repoPath: cwd,
        file: f,
        firstTs,
        lastTs,
        prompts: prompts.slice(0, 5),
      });
    }
  }
  return out;
}

function scanCodex() {
  const out = [];
  const dayDir = join(CODEX_SESSIONS_DIR, DATE.slice(0, 4), DATE.slice(5, 7), DATE.slice(8, 10));
  if (!existsSync(dayDir)) return out;
  for (const f of readdirSync(dayDir)) {
    if (!f.endsWith(".jsonl")) continue;
    const p = join(dayDir, f);

    const prompts = [];
    let firstTs = null;
    let lastTs = null;
    let cwd = null;
    for (const entry of readJsonl(p)) {
      if (entry?.type === "session_meta" && entry?.payload?.cwd) cwd = entry.payload.cwd;
      const ts = entry?.timestamp ? new Date(entry.timestamp) : null;
      if (!inDayWindow(ts)) continue;
      if (!firstTs || ts < firstTs) firstTs = ts;
      if (!lastTs || ts > lastTs) lastTs = ts;
      if (
        entry?.type === "response_item" &&
        entry?.payload?.type === "message" &&
        entry?.payload?.role === "user"
      ) {
        const c = entry.payload.content;
        // Codex prepends AGENTS.md, <environment_context>, <system_instruction> as
        // separate input_text items. The real user prompt is whichever item the
        // noise filter accepts.
        const items = Array.isArray(c)
          ? c
              .filter((p) => typeof p?.text === "string" || typeof p?.input_text === "string")
              .map((p) => stripSystemWrappers((p.text ?? p.input_text ?? "").trim()))
          : [];
        for (const t of items) {
          if (!isNoisePrompt(t)) {
            prompts.push(t);
            break; // one real prompt per user message
          }
        }
      }
    }
    if (prompts.length === 0) continue;
    out.push({
      agent: "codex",
      projectDir: cwd ?? f,
      repoPath: cwd,
      file: f,
      firstTs,
      lastTs,
      prompts: prompts.slice(0, 5),
    });
  }
  return out;
}

const sessions = [...scanClaude(), ...scanPi(), ...scanCodex()];

// Group by repo
const byRepo = new Map();
for (const s of sessions) {
  const key = s.repoPath ?? s.projectDir;
  if (!byRepo.has(key)) byRepo.set(key, []);
  byRepo.get(key).push(s);
}

// Exclude personal repos (env: JOURNAL_EXCLUDE_REPOS=substring1,substring2)
// Substring match against the repo path/name. Case-insensitive.
const DEFAULT_EXCLUDES = ["private", "finance", "health"];
const userExcludes = (process.env.JOURNAL_EXCLUDE_REPOS || "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);
const excludes = [...DEFAULT_EXCLUDES, ...userExcludes];
for (const key of [...byRepo.keys()]) {
  const haystack = (key || "").toLowerCase();
  if (excludes.some((needle) => haystack.includes(needle))) {
    byRepo.delete(key);
  }
}

function gitLogForRepo(repoPath) {
  if (!repoPath) return [];
  try {
    const out = execSync(
      `git -C "${repoPath}" log --no-merges --all --since="${DATE} 00:00" --until="${DATE} 23:59" --author="$(git -C "${repoPath}" config user.email)" --pretty=format:"%h|%s"`,
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    );
    return out
      .split("\n")
      .filter(Boolean)
      .map((l) => {
        const [hash, ...rest] = l.split("|");
        return { hash, subject: rest.join("|") };
      });
  } catch {
    return [];
  }
}

const lines = [];
lines.push(`# Daily work — ${DATE}`);
lines.push("");
lines.push(`> Auto-gerado de sessões Claude Code + git log. Edite antes de publicar.`);
lines.push("");

const repos = [...byRepo.entries()].sort((a, b) => a[0].localeCompare(b[0]));
let totalCommits = 0;
let totalSessions = 0;

for (const [repo, list] of repos) {
  const repoName = repo.split("/").pop();
  const commits = gitLogForRepo(repo);
  totalCommits += commits.length;
  totalSessions += list.length;

  const agents = [...new Set(list.map((s) => s.agent))].sort();
  lines.push(`## ${repoName}`);
  lines.push("");
  lines.push(
    `*${list.length} sessão(ões) [${agents.join(", ")}], ${commits.length} commit(s) — \`${sanitize(repo)}\`*`,
  );
  lines.push("");

  if (list.length) {
    lines.push("**Intenções (prompts):**");
    const seen = new Set();
    for (const s of list) {
      for (const p of s.prompts) {
        const key = p.slice(0, 80);
        if (seen.has(key)) continue;
        seen.add(key);
        lines.push(`- ${sanitize(p)}`);
      }
    }
    lines.push("");
  }

  // Dedup commits: when the same subject appears with and without "(#PR)" suffix,
  // keep the one with the PR reference.
  const bySubject = new Map();
  for (const c of commits) {
    const base = c.subject.replace(/\s*\(#\d+\)\s*$/, "").trim();
    const prev = bySubject.get(base);
    if (!prev || (/\(#\d+\)/.test(c.subject) && !/\(#\d+\)/.test(prev.subject))) {
      bySubject.set(base, c);
    }
  }
  const deduped = [...bySubject.values()];
  if (deduped.length) {
    lines.push("**Commits:**");
    for (const c of deduped) lines.push(`- \`${c.hash}\` ${sanitize(c.subject)}`);
    lines.push("");
  }
}

lines.push("---");
lines.push(`_${totalSessions} sessões, ${totalCommits} commits, ${repos.length} repos._`);

const output = lines.join("\n") + "\n";

if (OUT) {
  mkdirSync(dirname(resolve(OUT)), { recursive: true });
  writeFileSync(resolve(OUT), output, "utf8");
  console.error(`Wrote ${OUT}`);
} else {
  process.stdout.write(output);
}
