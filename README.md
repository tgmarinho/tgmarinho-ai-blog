<h1 align="center">
  <img alt="TG Marinho Agentic Futurist Website" title="TG Marinho Agentic Futurist Website" src="./public/images/readme/agentic-futurism-readme-hero.jpg" />
</h1>

<h1 align="center">
  TG Marinho Agentic Futurist Website
</h1>

<h3 align="center">
  Personal platform and technical blog crafted as a living AI interface.
</h3>

<p align="center">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16.2.6-000000?style=flat&logo=next.js" />
  <img alt="React" src="https://img.shields.io/badge/React-19.2.6-20232a?style=flat&logo=react" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat&logo=typescript" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind-4.x-0b1120?style=flat&logo=tailwind-css" />
  <img alt="Velite" src="https://img.shields.io/badge/Content-Velite-111827?style=flat" />
  <img alt="next-intl" src="https://img.shields.io/badge/i18n-next--intl-7c3aed?style=flat" />
</p>

<p align="center">
  <img alt="Repository size" src="https://img.shields.io/github/repo-size/tgmarinho/tgmarinho-ai-blog" />
  <img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/tgmarinho/tgmarinho-ai-blog" />
  <img alt="Status" src="https://img.shields.io/badge/status-active-22c55e" />
</p>

<h4 align="center">
  Status: Active
</h4>

<p align="center">
  <a href="#-vision">Vision</a> •
  <a href="#-experience-highlights">Highlights</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-author">Author</a>
</p>

## ✦ Vision

This repo powers two layers of the same digital system, **bilingual (pt-BR default + en)** via `next-intl`:
- **Institutional layer**: `/about`, `/projects`, `/contact`, `/community`, `/cv`
- **Editorial layer**: `/blog` and `/blog/[slug]` with MDX long-form content

All routes live under `src/app/[locale]/...`. UI strings come from `messages/{pt-BR,en}.json`. Posts carry `language` + `translationKey` in frontmatter so PT/EN versions are linked.

The visual direction is **Agentic Futurism**:
- rich dark canvas (`#05060a`)
- cyan + magenta accent system
- glassmorphism surfaces
- atmospheric motion (particle field, liquid orb, cursor aurora)
- editorial reading mode for articles (Fraunces + Source Serif 4)

## ⚡ Experience Highlights

- Reusable FX primitives in `src/components/fx`
- Asymmetric blog cards with `feature/default/compact` variants
- Fast fuzzy search with `Fuse.js`
- Reading-time and rich MDX prose
- Browser-native text-to-speech for blog posts, with bilingual voice filtering and speed control
- Responsive navigation (desktop + sheet mobile nav)
- Performance-oriented App Router architecture

## 🧠 Tech Stack

### Core
- [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [next-intl](https://next-intl.dev/) — bilingual routing + messages

### Content & Rendering
- [Velite](https://velite.js.org/) + MDX
- `rehype-slug`
- `rehype-autolink-headings`
- [rehype-pretty-code](https://rehype-pretty-code.netlify.app/)
- [Shiki](https://shiki.matsu.io/)

### UI
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Lucide React](https://lucide.dev/)
- [React Icons](https://react-icons.github.io/react-icons/)
- Radix primitives (via local UI composition)

### Features
- [Fuse.js](https://fusejs.io/)
- [reading-time](https://github.com/ngryman/reading-time)
- Browser Web Speech API for article text-to-speech
- [Upstash Redis](https://upstash.com/) (optional)

## 🛰️ Architecture

```txt
tgmarinho-ai-website/
├── content/
│   ├── posts/                    # MDX sources (bilingual: language + translationKey)
│   └── journal/                  # the /daily build-in-public log (pt-BR/ + en/, one YYYY-MM-DD.md each)
├── docs/
│   ├── daily-journal-setup.md    # how the /daily pipeline works (sources, privacy, cron)
│   └── redesign-2026-agentic-futurist.md
├── messages/                     # next-intl: pt-BR.json, en.json
├── public/
│   ├── llms.txt                  # generated at build (SEO for LLMs)
│   └── llms-full.txt             # generated at build (full corpus)
├── scripts/
│   ├── generate-llms-txt.mjs     # runs in `bun run build`
│   ├── audit-broken-refs.mjs     # `bun audit:refs`
│   ├── validate-i18n-seo.mjs     # `bun audit:i18n-seo`
│   ├── daily-journal.mjs         # extracts the day's coding-agent sessions + git log
│   ├── journal-narrate.mjs       # narrates the raw log into a bilingual /daily entry
│   └── journal-cron.sh           # local orchestrator (runs the two above, opens a draft PR)
├── src/
│   ├── app/
│   │   ├── [locale]/             # bilingual routes (blog, about, projects, contact, community, cv)
│   │   ├── api/
│   │   ├── sitemap.ts
│   │   └── robots.ts
│   ├── components/
│   │   ├── fx/                   # particle-field, liquid-orb, glow-card, cursor-aurora
│   │   ├── blog/
│   │   ├── home/
│   │   ├── layout/
│   │   └── ui/
│   ├── i18n/                     # routing + request config for next-intl
│   └── lib/
├── velite.config.ts
└── package.json
```

## 🎨 Design System Entry Points

- `src/app/globals.css`
- `src/components/fx/particle-field.tsx`
- `src/components/fx/liquid-orb.tsx`
- `src/components/fx/glow-card.tsx`
- `src/components/fx/cursor-aurora.tsx`

Deep context + lessons learned:
- `docs/redesign-2026-agentic-futurist.md`

## 🚀 Quick Start

### Requirements
- Node.js 20+ (Vercel runtime is Node 24 LTS / Fluid Compute)
- Bun

### Install

```bash
git clone <repository-url>
cd tgmarinho-ai-website
bun install
```

### Dev

```bash
bun dev
```

Pipeline:
1. `velite` processes content
2. `next dev` serves app at [http://localhost:3000](http://localhost:3000)

### Build & Run

```bash
bun run build
bun start
```

## 🧩 Scripts

- `bun dev` → Velite + Next.js dev
- `bun run build` → clean Velite + generate llms.txt + production build
- `bun start` → production server
- `bun velite` → content only
- `bun lint` → ESLint
- `bun llms` → regenerate `public/llms.txt` + `public/llms-full.txt`
- `bun audit:refs` → scan posts/pages for broken internal references
- `bun audit:i18n-seo` → validate bilingual SEO (hreflang, translationKey pairs, canonical)

## ✍️ MDX Authoring

Posts live in `content/posts/*.mdx`, named `YYYY-MM-DD-<slug>-<lang>.mdx` (the `date` as prefix, then the slug, then `-pt-br`/`-en`). The prefix keeps the folder sorted by date and does **not** affect the URL (the slug comes from frontmatter). Both files of a bilingual pair share the same date prefix.

**One article per calendar day** (a bilingual pair counts as one; drafts reserve their day too). Pick a free date — `grep -rhoE '^date: "[0-9-]+"' content/posts | sort | uniq -d` must print nothing.

```mdx
---
title: "Post Title"
description: "Post description"
date: "2026-05-07"
published: true
language: "en"                                  # or "pt-BR"
translationKey: "shared-slug-across-locales"    # links pt-BR ↔ en versions
categories: ["AI", "Career"]
image: "/images/example.png"
---

Post content...
```

Velite validates frontmatter and outputs typed content consumed from `#site/content`.

## 📓 Daily Journal (`/daily`)

A bilingual build-in-public log at `/daily` (pt-BR) and `/en/daily` (en). Each entry lives in
`content/journal/{pt-BR,en}/YYYY-MM-DD.md` (Velite collection `JournalEntry`).

Entries are generated from the day's coding-agent work, not written from memory. The pipeline
sweeps sessions across every harness on the machine (Claude Code / Anthropic, Codex / OpenAI,
Pi, Cursor, Conductor workspaces, hermes infra, and others), reads agent memories for context,
adds the git log, groups everything by real project, and narrates a mirrored pt-BR + en entry.

It runs locally because the session logs only exist on the author's machine. Everything is
privacy-filtered before publishing: no secrets, env vars, credentials, client data, or personal
data ever reaches a `content/journal/` file. Details and the local cron setup are in
[`docs/daily-journal-setup.md`](docs/daily-journal-setup.md). Agents use the project skill
`daily-journal` (`.cursor/skills/daily-journal/`).

## 🌐 Deploy

Recommended: [Vercel](https://vercel.com/).  
Any host with Next.js support works.

### Env Vars

No required environment variables for the core experience.  
Redis-related variables are optional and only needed if Upstash features are enabled.

## 🛠️ Troubleshooting

- **Velite ENOENT on image assets**
  - Happens when old MDX posts reference missing files.
  - Fix paths in post frontmatter/body or restore files under `content/posts` or `public`.

- **Variable font config with `next/font/google`**
  - When using font `axes`, avoid conflicting `weight` arrays on the same font config.

## 👤 Author

**Thiago Marinho**
- Website: [tgmarinhopro.com](https://tgmarinhopro.com)
- GitHub: [@tgmarinho](https://github.com/tgmarinho)
- X/Twitter: [@tgmarinho](https://twitter.com/tgmarinho)
- LinkedIn: [Thiago Marinho](https://linkedin.com/in/tgmarinho)

---

Private personal project.
