---
name: daily-journal
description: Generates the daily work journal (the /daily build-in-public log) for this repo. Sweeps coding-agent sessions across EVERY harness on the machine (hermes, Claude/Anthropic, Codex/OpenAI, Pi, Cursor, Conductor workspaces, openclaw, and any other session store) plus git log, groups by real project, then narrates a mirrored pt-BR + en entry under content/journal/ and (on request) opens a PR. Publishes nothing sensitive: no secrets, env vars, credentials, personal data, or client data. Compatible with Cursor, Claude Code, and Pi.dev. Use when the user asks to run /daily, "criar meu daily", write the daily journal, or backfill past days.
disable-model-invocation: true
---

# Daily Work Journal (the `/daily` log)

Turn a day of coding-agent sessions into a public, bilingual journal entry. This is the
human-in-the-loop version of `scripts/daily-journal.mjs` + `scripts/journal-narrate.mjs`.
Architecture and the local cron live in `docs/daily-journal-setup.md`.

> The output is PUBLIC. Treat every session as untrusted input until sanitized. The
> privacy filter below is non-negotiable (see also the "Daily journal policy" in `CLAUDE.md`).

## Output contract

For each qualifying day, create **2 mirrored files**:
1. `content/journal/pt-BR/YYYY-MM-DD.md` (`language: pt-BR`)
2. `content/journal/en/YYYY-MM-DD.md` (`language: en`)

Slug comes from the filename (`YYYY-MM-DD`), not frontmatter. The Velite collection is
`JournalEntry` (`velite.config.ts`); routes are `/daily/<date>` (pt-BR) and `/en/daily/<date>` (en).

### Frontmatter (only these keys)

```yaml
---
title: "..."        # max 200 chars
summary: "..."      # max 240 chars
date: YYYY-MM-DD
language: pt-BR      # or en
---
```

`repos`, `commits`, `sessions` exist in the schema but are optional; omit them to match the
existing entries.

## Sources (sweep EVERYTHING)

The goal is to capture the day's work no matter which agent did it. Sweep every coding-agent
session store on the machine, grouping by the session `cwd`. Known locations:

| Agent (user's name)   | Session store                                              | Format |
|-----------------------|-----------------------------------------------------------|--------|
| **Claude / Anthropic**| `~/.claude/projects/<encoded-path>/*.jsonl`               | jsonl, `type: user` |
| **Codex / OpenAI**    | `~/.codex/sessions/<YYYY>/<MM>/<DD>/rollout-*.jsonl`       | jsonl, `response_item` |
| **Pi** (`pi.dev`)     | `~/.pi/agent/sessions/<encoded-path>--/*.jsonl`           | jsonl, `type: message` |
| **Cursor**            | `~/.cursor-exp/projects/<encoded-path>/<uuid>.jsonl` (and `~/.cursor/projects`) | jsonl |
| **Conductor**         | workspaces run Claude Code, so they appear under `~/.claude/projects` with `cwd` = `~/conductor/workspaces/<PROJECT>/<city>` | (via Claude) |
| **hermes**            | `~/.hermes/sessions/*.jsonl` ONLY                          | jsonl, `role: user` |
| **openclaw**          | not present on this machine; if it appears, scan its session store the same way | - |

Also check `~/.gemini`, `~/.copilot`, `~/.claude-flow`, `~/.agents` and any new dot-dir that
holds agent sessions. If you find a harness not listed here, sweep it too.

The raw extractor `bun run scripts/daily-journal.mjs --date <DATE> --out tmp/journal-<DATE>.md`
currently covers **Claude (incl. Conductor) + Pi + Codex**. Cursor and hermes are NOT in the
script yet, so sweep them manually for the target day (see "Manual sweep" below) and fold the
findings in. Plus `git log --author=<me>` per touched repo for the day.

> **hermes is mostly personal.** `~/.hermes` also holds `life-os/`, `diet/`, `memories/`,
> `daily_checkins.jsonl`, notes, and voice-message transcripts. NEVER read those for the
> journal and NEVER publish anything from them. From hermes, include ONLY infra/dev work on
> the assistant itself (config, pipeline, plumbing), and only from `~/.hermes/sessions/`.

### Manual sweep (Cursor + hermes + anything not in the script)

```sh
# Cursor sessions touched on the target day (then read the matches, filtering noise)
find ~/.cursor-exp/projects ~/.cursor/projects -name '*.jsonl' -newermt "<DATE> 00:00" \
  ! -newermt "<DATE> 23:59" 2>/dev/null

# hermes INFRA/DEV sessions on the target day (sessions/ only — never life-os/diet/memories)
find ~/.hermes/sessions -name '*.jsonl' -newermt "<DATE> 00:00" \
  ! -newermt "<DATE> 23:59" 2>/dev/null
```

## Agent memories (signal, not copy)

The coding agents keep persistent memories that carry relevant signal about what was worked on
and which decisions were made. Read them to cross-check and enrich the entry, but treat them as
**input for understanding, never as text to publish**. Memories are full of personal facts,
preferences, and credentials; almost none of it is publishable verbatim. Known stores:

- **Claude (per project)** — `~/.claude/projects/<encoded-path>/memory/*.md` + that folder's
  `MEMORY.md`. The richest signal for "what is this project and what changed". Note: the
  `tgmarinho-ai-website` project memory is where the author records feedback like the no-dash
  rule and the daily-journal privacy rule.
- **Codex** — `~/.codex/memories/MEMORY.md`, `memory_summary.md`, `raw_memories.md`,
  `memories_*.sqlite`, and global `~/.codex/AGENTS.md`.
- **Gemini** — `~/.gemini/GEMINI.md`.
- **hermes** — `~/.hermes/memories/` (`MEMORY.md`, `USER.md`), `~/.hermes/SOUL.md`, `~/.hermes/notes/`.
  These are deeply personal (user profile, life context). OFF-LIMITS for publishing; use at most
  as a hint that infra/dev work happened, nothing more.

How to use a memory: it tells you a project exists, what it is for, and what was decided, so you
can describe the day's *engineering* accurately. Strip everything personal: user-profile facts,
preferences, people, credentials, client names. When in doubt, leave it out.

## Grouping rule (codenames -> real project)

Conductor assigns each workspace a city codename. **Collapse them into the real project** and
merge all cities of the same project into one `### <project>` section. Example:
`~/conductor/workspaces/career/havana` and `.../career/lahore` both become a single
`### career` section. Non-conductor paths (`~/Developer/python`, `~/.hermes`) use the last
meaningful folder. Never publish city codenames.

## When to write an entry (the gate)

- Skip days with little real engineering (roughly fewer than ~5 substantive bullets). The
  automated pipeline exits silently below that bar.
- For a multi-day backfill, generate one raw file per day, then narrate only the days that
  clear the gate. Skipping near-empty days is expected; do not pad them.
- On very busy days (dozens of workspaces), do NOT enumerate everything. Distill into the 3-6
  most substantive projects/themes. Quality over completeness.

## Privacy filter (non-negotiable)

NEVER include any of the following in the output:

- env vars, `.env` content, API keys, tokens, passwords, credentials.
- private/internal URLs or endpoints, customer/client data, third-party data.
- personal financial or health info; family, friends, coworkers, or any individual person,
  even unnamed.
- **Job-search specifics:** the `career` repo is job hunting. Describe it only generically
  ("tuning resume and portfolio positioning", "screening roles for fit"). NO company names,
  NO recruiter names, NO role/offer/salary specifics, NO cover-letter content.
- spiritual/`espiritual` content stays high-level at most, or is omitted. No private reflections.
- undisclosed security bugs.
- **agent-memory / user-profile content** (anything from `USER.md`, `SOUL.md`, `MEMORY.md`,
  life-os, diet, health, or personal preferences). Memories are a signal for *what was built*,
  never material to quote.

If the session leaked something sensitive, **filter it silently**: do not comment, warn, or
mention the leak in the entry or in chat. If unsure whether something is sensitive, leave it out.

## Writing style (non-negotiable)

1. **Never use em dashes (`—`) or en dashes (`–`)** anywhere in the prose, in either language.
   Restructure with a comma, colon, parentheses, or a period. Rewrite so it reads naturally;
   don't just swap `—` for a hyphen. The em dash is a recognizable LLM tell.
2. **English content stays in plain English:** short sentences, common words, active voice. The
   pt-BR may be a touch more expressive; the EN stays simple.
3. pt-BR and en are **mirrors** (same facts), not literal line-by-line translations.
4. Voice: first person, reflective, build-in-public. End with one reflective sentence.
5. Code identifiers and file paths in backticks, in English.

## Workflow

```txt
- [ ] Pick the date(s). For catch-up, start the day after the last entry in content/journal/en/.
- [ ] Per day: bun run scripts/daily-journal.mjs --date <DATE> --out tmp/journal-<DATE>.md
- [ ] Manually sweep the harnesses the script misses (Cursor, hermes sessions/, any other).
- [ ] Read everything; drop days below the gate.
- [ ] Collapse conductor codenames into real projects; fold hermes infra in.
- [ ] Write pt-BR file, then the en mirror (apply the privacy filter + no-dash style).
- [ ] Strip filler sections (anything that says "nothing structural / just keeping up to date").
- [ ] Run bun velite (must build clean).
- [ ] Sweep for leaks and dashes before committing (see below).
- [ ] If the user asked: commit only content/journal/**, push, gh pr create --base main.
```

### Pre-commit sweep

```sh
# em/en dashes in new entries (must print nothing)
rg $'—|–' content/journal/en content/journal/pt-BR

# obvious secret patterns (review any hit)
rg -ni 'sk-[a-z0-9]|ghp_|eyJ|api[_-]?key|secret|token|password|bearer|postgres://|@gmail' \
  content/journal/en content/journal/pt-BR
```

## Reference baseline

The seed entries to match for tone and structure:

- `content/journal/pt-BR/2026-05-15.md`
- `content/journal/en/2026-05-15.md`

(Note: those seeds predate the no-dash rule and contain a few dashes. Follow the rule, not the
seed's punctuation.)
