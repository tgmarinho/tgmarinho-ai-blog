# Daily Work Journal — local automation

A local pipeline that turns each day's Claude Code sessions + git activity into
a narrated markdown entry under `content/journal/`.

## Architecture

```mermaid
flowchart TD
  subgraph LOCAL["🖥️  Local Mac (only place this can run)"]
    direction TB

    SESSIONS["~/.claude/projects/*/*.jsonl<br/><i>Claude Code session logs</i>"]
    REPOS["Local git repos<br/><i>git log --author=me</i>"]

    subgraph PIPE["scripts/journal-cron.sh — orchestrator"]
      direction TB
      S1["1. daily-journal.mjs<br/>parse sessions + git log<br/>filter personal repos"]
      GATE{"≥ 5 bullets?"}
      S2PT["2a. journal-narrate.mjs<br/>--lang pt-BR<br/>via claude CLI"]
      S2EN["2b. journal-narrate.mjs<br/>--lang en<br/>via claude CLI"]
      S3["3. validate frontmatter<br/>(title, summary, date)"]
      S4["4. git commit on<br/>branch journal/&lt;DATE&gt;"]
      S5["5. push + gh pr create --draft"]
    end

    RAW["tmp/journal-&lt;DATE&gt;.md<br/><i>raw bullets, gitignored</i>"]
    OUT_PT["content/journal/pt-BR/&lt;DATE&gt;.md"]
    OUT_EN["content/journal/en/&lt;DATE&gt;.md"]
    CLAUDE["claude CLI<br/><i>uses your Claude Code session,<br/>no API key needed</i>"]
    LAUNCHD["launchd @ 23:00<br/>(catch-up on wake)"]
  end

  subgraph REMOTE["☁️  GitHub"]
    direction TB
    BRANCH["branch journal/&lt;DATE&gt;"]
    PR["Draft PR → main<br/><b>manual review gate</b>"]
    MAIN["main"]
  end

  subgraph PROD["🚀 Production (Vercel)"]
    direction TB
    VELITE["Velite build<br/>JournalEntry collection<br/>(slug from filename,<br/>language from frontmatter)"]
    PAGES["/daily/&lt;slug&gt; (PT-BR)<br/>/en/daily/&lt;slug&gt; (EN)"]
  end

  LAUNCHD -.fires.-> PIPE
  SESSIONS --> S1
  REPOS --> S1
  S1 --> RAW
  RAW --> GATE
  GATE -- no --> EXIT(["exit 0"])
  GATE -- yes --> S2PT
  GATE -- yes --> S2EN
  S2PT <-.prompt PT.-> CLAUDE
  S2EN <-.prompt EN.-> CLAUDE
  S2PT --> OUT_PT
  S2EN --> OUT_EN
  OUT_PT --> S3
  OUT_EN --> S3
  S3 --> S4
  S4 --> S5
  S5 ==> BRANCH
  BRANCH ==> PR
  PR -- ✅ you merge --> MAIN
  MAIN --> VELITE
  VELITE --> PAGES

  classDef gate fill:#1e293b,stroke:#22d3ee,color:#e2e8f0
  classDef ai fill:#1e1b4b,stroke:#a78bfa,color:#e2e8f0
  classDef out fill:#064e3b,stroke:#34d399,color:#e2e8f0
  class GATE,PR gate
  class CLAUDE,S2PT,S2EN ai
  class OUT_PT,OUT_EN,PAGES out
```

### Why local-only?

The Claude Code session files (`~/.claude/projects/*/*.jsonl`) only exist on
your Mac. GitHub Actions / Vercel Cron can't see them — so the pipeline must
run where the data lives.

### Privacy boundaries

```mermaid
flowchart LR
  subgraph PRIVATE["🔒 Private (stays local)"]
    A["Raw .jsonl sessions"]
    B["tmp/journal-&lt;DATE&gt;.md<br/>(gitignored)"]
    C["Excluded repos:<br/>career, private,<br/>finance, health"]
  end

  subgraph FILTERED["🧹 Filtered by narrator prompt"]
    D["No people<br/>(family, friends, peers)"]
    E["No job applications<br/>or company names"]
    F["No credentials,<br/>tokens, client data"]
  end

  subgraph PUBLIC["🌍 Public (only after PR merge)"]
    G["content/journal/&lt;lang&gt;/<br/>&lt;DATE&gt;.md"]
    H["/daily on the blog"]
  end

  A --> B
  C -. skipped .-> B
  B --> FILTERED
  FILTERED --> G
  G --> H

  classDef priv fill:#7f1d1d,stroke:#fca5a5,color:#fee2e2
  classDef filt fill:#78350f,stroke:#fbbf24,color:#fef3c7
  classDef pub fill:#064e3b,stroke:#34d399,color:#d1fae5
  class A,B,C priv
  class D,E,F filt
  class G,H pub
```

## What it does

`scripts/journal-cron.sh` orchestrates three steps:

1. `scripts/daily-journal.mjs` reads `~/.claude/projects/*/*.jsonl` + git log
   and writes raw bullets to `tmp/journal-<DATE>.md`.
2. If the raw file has fewer than 5 bullet lines, the run exits silently.
3. `scripts/journal-narrate.mjs` runs the local `claude` CLI (no API key
   needed) to produce `content/journal/<DATE>.md` with a single `## Diário`
   section + frontmatter (`title`, `summary`, `date`, `language: pt-BR`).
4. The result is committed on branch `journal/<DATE>`, pushed to origin, and a
   **draft PR** is opened against `main`. Nothing goes to prod until you
   approve and merge the PR.

### Privacy filter

Personal repos are excluded by default (substring match against the repo path):
`career`, `private`, `personal`, `finance`, `health`. Extend the list via env:

```bash
JOURNAL_EXCLUDE_REPOS=clientx,clienty bash scripts/journal-cron.sh
```

The narrator prompt also enforces a strict rule to omit job applications,
financial info, credentials, and other sensitive topics — but the draft PR
review is your final safety net.

The sessions live on your local Mac, so this **must** run locally. GitHub
Actions can't see them.

## Manual run

```bash
# today (America/Campo_Grande) — designed to be run at 23:00
bash scripts/journal-cron.sh

# specific day
bash scripts/journal-cron.sh 2026-05-12
```

> Narration runs through the local `claude` CLI (uses your Claude Code session),
> so **no `ANTHROPIC_API_KEY` is required**. Override the binary with
> `CLAUDE_BIN=/path/to/claude` if needed.

## Schedule with launchd (recommended on macOS)

Save as `~/Library/LaunchAgents/com.tgmarinho.journal.daily.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>            <string>com.tgmarinho.journal.daily</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string>
    <string>-lc</string>
    <string>cd /Users/tgmarinho/Developer/tgmarinho-ai-website &amp;&amp; bash scripts/journal-cron.sh</string>
  </array>
  <key>StartCalendarInterval</key>
  <dict>
    <key>Hour</key>    <integer>23</integer>
    <key>Minute</key>  <integer>0</integer>
  </dict>
  <key>StandardOutPath</key>  <string>/tmp/journal-cron.log</string>
  <key>StandardErrorPath</key><string>/tmp/journal-cron.log</string>
  <key>RunAtLoad</key>        <false/>
</dict>
</plist>
```

Then:

```bash
launchctl load   ~/Library/LaunchAgents/com.tgmarinho.journal.daily.plist
launchctl list | grep tgmarinho.journal      # confirm it's registered
tail -f /tmp/journal-cron.log                # watch output
```

`launchd` fires at 23:00 local time daily, covering work done since 00:00 of
the current day. If the Mac is asleep at 23:00, the job runs as soon as the
machine wakes up.

## Alternative: crontab

```bash
crontab -e
# add:
0 23 * * * cd /Users/tgmarinho/Developer/tgmarinho-ai-website && /bin/bash scripts/journal-cron.sh >> /tmp/journal-cron.log 2>&1
```

## Uninstall

```bash
launchctl unload ~/Library/LaunchAgents/com.tgmarinho.journal.daily.plist
rm           ~/Library/LaunchAgents/com.tgmarinho.journal.daily.plist
# or, for cron: crontab -e and remove the line
```
