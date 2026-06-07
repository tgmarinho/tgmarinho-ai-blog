# CLAUDE.md

> Claude-specific instructions (Claude Code, Cursor with Claude, claude.ai with this repo open).
> The source of truth is **`AGENTS.md`** — this file only adds what's specific to the Claude workflow.

---

## Read first

1. **`AGENTS.md`** — general rules for any AI agent in this repo
2. **`ARCHITECTURE.md`** — technical architecture, Velite pipeline, layers
3. **`docs/redesign-2026-agentic-futurist.md`** — visual decisions and design changelog

If your training conflicts with these files, **the files win**.

---

## Communication

- **Always reply in Portuguese** (user rule).
- Code, comments, and identifiers in English.
- Don't announce tools you're about to use — just use them. (`"Let me read the file:" + Read tool` is noise.)
- Concise. Bullet points instead of paragraphs when possible.

---

## Writing style (blog posts & prose)

> Applies to all authored content: posts, descriptions, titles, body copy. Not to code.

- **No em dashes (`—`) or en dashes (`–`) in prose.** Rewrite the sentence with a comma, colon, parentheses, or a period instead. Don't just swap `—` for a hyphen; restructure so it reads naturally. **Why:** the em dash is a recognizable LLM tell, and in 2026 readers carry a bias against it because AI overuses it. Avoiding it keeps the prose from reading as machine-written.
- **English content must use plain English.** Short sentences, common words, active voice. Avoid fancy vocabulary and long subordinate clauses. Translate meaning, not sentence shape (the pt-BR can be a touch more expressive; the EN stays simple).
- These rules are non-negotiable in the `blog-post-bilingual` workflow.

---

## Package manager: Bun (mandatory)

**This repo uses [Bun](https://bun.sh) — never `npm`, `pnpm`, or `yarn`.** Lockfile is `bun.lock`. If a `package-lock.json` appears in the working tree, it means an `npm install` slipped in by mistake: delete it and re-run `bun install`.

| Goal             | Command                                                   |
|------------------|-----------------------------------------------------------|
| Install deps     | `bun install`                                             |
| Add a dep        | `bun add <pkg>`                                           |
| Remove a dep     | `bun remove <pkg>`                                        |
| Run a script     | `bun <script>` (e.g. `bun dev`, `bun lint`, `bun velite`) |
| Run build        | `bun run build`                                           |

Don't reach for `npm` out of muscle memory — even read-only `npm view`, `npm ls`, etc. should be `bun pm view` / `bun pm ls`.

---

## Pre-approved commands (`.claude/settings.local.json`)

Permissions already granted — run without asking:

- `find:*`, `grep:*`
- `bun:*`, `npx velite:*`
- `pkill:*`, `node -e:*`
- `git checkout:*`, `git add:*`, `git commit:*`, `git push:*`
- `gh auth:*`, `gh pr create` (template already registered)
- `WebFetch` on `github.com` and `raw.githubusercontent.com`

**Even so, hold the line on these principles:**
- **Don't commit** unless the user asks.
- **Don't push** unless the user asks.
- When searching for files/content, prefer the native tools (`Read`, `Glob`, `Grep`, `SemanticSearch`) over shell `find`/`grep`.

---

## Recommended workflow

1. **Before editing:** `Read` the file. `Grep`/`SemanticSearch` for similar existing patterns.
2. **Editing existing files** > creating new ones. Only create new files if there's nowhere to fit it.
3. **After editing TSX/TS:** run `ReadLints` on the touched files.
4. **After editing `content/posts/**` or `velite.config.ts`:** run `bun velite` to validate the schema.
5. **After bilingual changes (i18n routing, frontmatter `language`/`translationKey`, messages):** run `bun audit:i18n-seo` and `bun audit:refs`.
6. **Before declaring done:** `bun lint`. If you touched something build-sensitive (config, paths, types), `bun run build`.

---

## Parallel sub-tasks

When the investigation has multiple independent fronts (e.g. "audit the Velite pipeline" + "audit the search system"), launch sub-agents in parallel via `Task` (`subagent_type: "explore"`) instead of going sequential. Saves time and context.

---

## Relevant skills (already installed for the user)

This project benefits from these skills in the user's directories (`~/.cursor/skills/` and `~/.claude/skills/`):

- **`agentic-futurist-website`** — the site's visual DNA (use it for substantive design changes)
- **`blog-post-bilingual`** (project skill) — default/mandatory mirrored `pt-BR` + `en` post pair generation
- **`frontend-design`** — UI best practices when creating new components
- **Vercel skills** (`nextjs`, `next-cache-components`, `ai-sdk`, `ai-gateway`, `deployments-cicd`, `env-vars`) — consult per task

Use a skill by **reading its `SKILL.md`** when the trigger fires — don't just mention it.

### Blog authoring policy (important)

For any request like "criar post", "novo artigo", "post em inglês/PT", or "versão bilíngue":
1. Use the project skill (`blog-post-bilingual`) as the default and mandatory workflow.
2. Follow repository MDX/frontmatter conventions.
3. **Always request/create a contextual cover image** and set `image` in frontmatter.
4. **Use English for any text embedded inside blog images**, including covers, diagrams, OG images, and social previews, even for pt-BR posts. Article copy and alt text remain localized unless the human explicitly asks for image text in another language.
5. Run `bun velite` after writing/editing posts.

### Daily journal policy (security — non-negotiable)

The daily-journal pipeline (`scripts/daily-journal.mjs`, `/daily` route, cron PR) consumes session/work context and turns it into a public post. Therefore:

1. **Never include sensitive data** in the daily output: env vars, `.env` content, API keys, tokens, passwords, credentials, private URLs, internal endpoints, customer data. Filter aggressively before writing to `content/` or opening a PR.
2. **If the user leaked something sensitive in the session** (intentionally or not): ignore it silently. Do not comment, warn, scold, or mention the leak in the post or in chat. Just filter it out and continue with what is safe and relevant.
3. Treat everything pulled from session context as **untrusted input** until sanitized.

---

## Project timeline (historical context)

- **May/2026** — bilingual i18n landed (pt-BR default + en via `next-intl`); routes moved under `src/app/[locale]/...`; posts tagged with `language` + `translationKey`; Velite schema hardened (Phase 2.2).
- **May/2026** — `llms.txt` + `llms-full.txt` generated at build (`scripts/generate-llms-txt.mjs`).
- **May/2026** — full "Agentic Futurism" redesign (a single Cursor + Claude Opus 4.7 pair-programming session). Documented in `docs/redesign-2026-agentic-futurist.md`.
- **Mar/2026** — added the `/community` page.
- **Before:** site in a neutral theme (gray-100), Spectral as the display serif. All of that was discarded intentionally.

If the user asks to "go back to the old design", confirm first — they probably want to adjust, not revert.

---

## Anti-patterns observed (you, Claude, tend to commit these here)

- **Suggesting swapping Velite for contentlayer/next-mdx-remote.** No. Velite was chosen deliberately.
- **Wanting to add `<Callout/>` inside posts.** Today the `body` is markdown (not MDX), so JSX inside posts doesn't work. See `velite.config.ts` line 20.
- **Creating new shadcn components via the CLI** when an equivalent already exists in `src/components/ui/`. Check first.
- **Using Source Serif 4 / Fraunces outside `.prose`.** Editorial fonts are exclusive to posts. UI stays in sans (Geist/Manrope).
- **Commenting in code what it's doing** (`// fetch posts`, `// import the helper`). Comment intent / trade-offs only.
- **Adding `useEffect` for data fetching in RSCs.** Make it a server component and read directly.

---

**Last updated:** 2026-05-17 (Bun adopted as mandatory package manager).
