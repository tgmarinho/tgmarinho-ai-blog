#!/usr/bin/env node
/**
 * Daily work journal generator.
 *
 * Reads Claude Code sessions (~/.claude/projects/<repo>/*.jsonl) and git log
 * across all repos touched on a given day, then emits a markdown digest you
 * can edit and publish as proof-of-work.
 *
 * Usage:
 *   node scripts/daily-journal.mjs                     # today
 *   node scripts/daily-journal.mjs --date 2026-05-12   # specific day
 *   node scripts/daily-journal.mjs --date 2026-05-12 --out tmp/journal.md
 */
import { readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { resolve, join, dirname } from "node:path";
import { execSync } from "node:child_process";

const HOME = homedir();
const PROJECTS_DIR = join(HOME, ".claude", "projects");

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

function extractUserText(msg) {
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

const sessions = [];
for (const projDir of readdirSync(PROJECTS_DIR)) {
  const full = join(PROJECTS_DIR, projDir);
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
    if (st.mtime < dayStart || st.mtime > new Date(dayEnd.getTime() + 24 * 3600 * 1000))
      continue;

    const prompts = [];
    let firstTs = null;
    let lastTs = null;
    for (const entry of readJsonl(p)) {
      const ts = entry?.timestamp ? new Date(entry.timestamp) : null;
      if (ts && ts >= dayStart && ts <= dayEnd) {
        if (!firstTs || ts < firstTs) firstTs = ts;
        if (!lastTs || ts > lastTs) lastTs = ts;
        if (entry?.type === "user") {
          const text = extractUserText(entry);
          const trimmed = text.trim();
          const isNoise =
            !trimmed ||
            trimmed.length < 6 ||
            trimmed.length > 600 ||
            trimmed.startsWith("<") || // task-notification, command-name, bash-input, local-command-caveat, etc.
            trimmed.includes('"tool_use_id"') ||
            trimmed.includes("[REDACTED_BLOB]") ||
            /^\[Request interrupted/.test(trimmed) ||
            /^\s*\$ /.test(trimmed) ||
            /^You are an expert /i.test(trimmed) ||
            /Screenshot \d{4}-\d{2}-\d{2}/.test(trimmed);
          if (!isNoise) prompts.push(trimmed);
        }
      }
    }
    if (prompts.length === 0) continue;
    sessions.push({
      projectDir: projDir,
      repoPath: decodeProjectDir(projDir),
      file: f,
      firstTs,
      lastTs,
      prompts: prompts.slice(0, 5),
    });
  }
}

// Group by repo
const byRepo = new Map();
for (const s of sessions) {
  const key = s.repoPath ?? s.projectDir;
  if (!byRepo.has(key)) byRepo.set(key, []);
  byRepo.get(key).push(s);
}

// Exclude personal repos (env: JOURNAL_EXCLUDE_REPOS=substring1,substring2)
// Substring match against the repo path/name. Case-insensitive.
const DEFAULT_EXCLUDES = ["career", "private", "personal", "finance", "health"];
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

  lines.push(`## ${repoName}`);
  lines.push("");
  lines.push(`*${list.length} sessão(ões), ${commits.length} commit(s) — \`${sanitize(repo)}\`*`);
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
