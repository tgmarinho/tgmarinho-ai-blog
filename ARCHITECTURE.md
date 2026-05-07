# Architecture — `tgmarinho-ai-website`

> Technical architecture document for **Thiago Marinho's** personal site and blog.
> Companion to `README.md` (overview) and `AGENTS.md` (rules for AI agents).
>
> **Stack in one sentence:** Next.js 16 (App Router) + React 19 + Tailwind v4 + Velite (MDX) with the "Agentic Futurism" aesthetic (dark + cyan/magenta).

---

## 1. Overview

`tgmarinho-ai-website` is a **statically generated personal site** with:

- **Institutional landing pages** (`/`, `/about`, `/projects`, `/contact`, `/community`, `/cv`)
- **Technical blog** (`/blog`, `/blog/[slug]`) with 70+ MDX posts, fuzzy search, i18n support (EN / PT-BR), and RSS
- **Lightweight APIs** (`/api/page-views`, `/api/feedback`, `/api/subscribe`) running as Vercel Functions
- **Aesthetic system** ("Agentic Futurism") described in `docs/redesign-2026-agentic-futurist.md`

The philosophy is simple:

> **content-first** (MDX in the repo, no CMS) → **build-time pipeline** (Velite) → **static-first rendering** (App Router) → **progressive enhancement** (client islands for search, animations, share, CV viewer).

---

## 2. Stack

| Layer | Tech | Version |
|---|---|---|
| Framework | Next.js (App Router, Turbopack) | `16.1.6` |
| UI runtime | React + React DOM | `19.2.3` |
| Language | TypeScript (strict) | `^5` |
| Styling | Tailwind CSS v4 + `tw-animate-css` | `^4` |
| Motion | Framer Motion | `^12` |
| Base components | Radix UI (`radix-ui`) + local shadcn-style | `^1.4` |
| Icons | `lucide-react` + `react-icons` | — |
| Content | Velite (MDX → typed JSON) | `^0.3` |
| Highlight | `rehype-pretty-code` + `shiki` (`github-dark`) | — |
| Headings/anchors | `rehype-slug` + `rehype-autolink-headings` | — |
| Search | Fuse.js (fuzzy) | `^7` |
| Reading time | `reading-time` | `^1.5` |
| QR code (PIX) | `qrcode.react` | `^4` |
| KV / cache | Upstash Redis (optional, currently in-memory stub) | `^1.36` |
| Newsletter | Buttondown (HTTP) | — |

**Target runtime:** Node.js 24 LTS (Vercel default). **Deploy target:** Vercel (Fluid Compute).

---

## 3. Folder topology

```
tgmarinho-ai-website/
├── content/
│   ├── posts/           # 70+ MDX posts (blog source of truth)
│   └── old/             # Historical archive (not published)
│
├── public/
│   ├── content/         # Static markdown served by /cv (cv.md, cv_pt.md)
│   ├── images/          # Shared images
│   ├── fonts/           # Self-hosted fonts (fallback)
│   └── static/          # Velite-generated assets (hashed)
│
├── src/
│   ├── app/             # App Router — routes, layouts, route handlers
│   │   ├── layout.tsx   # Root layout (fonts, header, footer, cursor aurora)
│   │   ├── page.tsx     # Home (Hero + RecentPosts)
│   │   ├── globals.css  # Design tokens + utilities + editorial prose
│   │   ├── blog/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── about|projects|contact|community|cv/
│   │   ├── api/
│   │   │   ├── page-views/route.ts
│   │   │   ├── feedback/route.ts
│   │   │   └── subscribe/route.ts
│   │   ├── rss.xml/     # Dynamic RSS feed
│   │   ├── sitemap.ts   # MetadataRoute.Sitemap
│   │   └── robots.ts
│   │
│   ├── components/
│   │   ├── layout/      # header, footer, mobile-nav
│   │   ├── home/        # hero, recent-posts
│   │   ├── blog/        # post-card, search (Fuse.js)
│   │   ├── cv/          # cv-viewer (local markdown parser)
│   │   ├── mdx/         # mdx-content, callout, copy-button, share-button, video, markdown-parser
│   │   ├── forms/       # newsletter, feedback
│   │   ├── pix/         # pix-payment (QR code)
│   │   ├── fx/          # cursor-aurora, glow-card, liquid-orb, particle-field
│   │   └── ui/          # shadcn-style primitives (button, card, input, badge, sheet, separator)
│   │
│   └── lib/
│       ├── constants.ts # siteConfig + navLinks
│       ├── utils.ts     # cn() helper
│       └── velite.ts    # sortPostsByDate, getAllCategories
│
├── docs/
│   └── redesign-2026-agentic-futurist.md  # design decisions + visual changelog
│
├── velite.config.ts     # Schema + content pipeline
├── next.config.ts       # Turbopack root + remote images allowlist
├── tsconfig.json        # paths: @/* → src/*  ·  #site/content → .velite
├── eslint.config.mjs
├── postcss.config.mjs
├── components.json      # shadcn config
└── .velite/             # Generated output (gitignored or committed depending on deploy)
```

---

## 4. Content pipeline (Velite)

```
content/posts/*.mdx
        │
        ▼  (npm run velite)
┌──────────────────────────────────────────────┐
│ velite.config.ts                              │
│  • Frontmatter schema (zod-like)              │
│  • Slug derived from title if omitted         │
│  • plainBody = body without HTML (full-text)  │
│  • rehype-slug → IDs on headings              │
│  • rehype-pretty-code (shiki "github-dark")   │
│  • rehype-autolink-headings (wrap)            │
└──────────────────────────────────────────────┘
        │
        ▼
.velite/
  ├── posts.json         # Typed Array<Post>
  ├── posts.d.ts         # Exported types
  └── index.ts           # Reexport (#site/content)
        │
        ▼  (import)
src/app/**/page.tsx  and  src/components/**
  import { posts, type Post } from "#site/content";
```

### Post schema

```ts
{
  title: string,
  description?: string,
  date: ISODate,           // YYYY-MM-DD
  published: boolean,      // default true
  slug?: string,           // auto-derived if absent
  language?: "en" | "pt-BR",
  translationKey?: string, // groups translations
  categories: string[],    // default []
  image?: string,
  body: string,            // markdown compiled to HTML
  plainBody: string,       // body without tags (full-text search)
}
```

### Why Velite (and not next-mdx-remote / contentlayer)?

- **End-to-end type-safe** without running zod in the app's runtime
- **Single build-time pass** — no SSR parse cost
- **Schema-first** — invalid frontmatter breaks the build, not the user
- **JSON output** — easy to treat as a data layer (`sortPostsByDate`, `getAllCategories`)

### Deliberate decision: `s.markdown()` instead of `s.mdx()`

`velite.config.ts` uses `body: s.markdown()` (line 20) — the output is **pre-rendered HTML**, not JSX. This:

- Avoids MDX compilation bugs in older posts with invalid JSX
- Trade-off: **custom MDX components don't work inside posts** (`<Callout/>`, `<Video/>`, etc. exist but are only usable outside the body)
- The renderer (`MdxContent`) injects HTML via `dangerouslySetInnerHTML`

> If JSX in posts is reactivated: switch to `s.mdx()`, ensure all 70+ posts in `content/posts/*` parse without error, and re-implement `MdxContent` with `useMDXComponent` or similar.

---

## 5. Application layer (App Router)

### Rendering

| Route | Strategy | Notes |
|---|---|---|
| `/` | Static (RSC) | Reads `.velite/posts.json`, renders Hero + 5 recent posts |
| `/blog` | Static (RSC) + client island | Server passes `posts[]` to `<BlogSearch/>` (client-side Fuse.js) |
| `/blog/[slug]` | SSG via `generateStaticParams` | Each post pre-rendered at build, inline JSON-LD |
| `/about`, `/projects`, `/community`, `/contact` | Static | Content in JSX (no MDX) |
| `/cv` | Client component | `useState` + `fetch('/content/cv.md')` at runtime |
| `/api/*` | Route handlers | Node runtime (Fluid Compute) |
| `/rss.xml`, `/sitemap.ts`, `/robots.ts` | Metadata routes | Generated at build |

### Import convention

```ts
import { posts, type Post } from "#site/content";   // Velite output
import { siteConfig, navLinks } from "@/lib/constants";
import { sortPostsByDate, getAllCategories } from "@/lib/velite";
import { Header } from "@/components/layout/header";
```

`@/*` maps to `./src/*`. `#site/content` maps to `./.velite/`. No long relative imports (`../../../`).

### i18n

There's no `next-intl` and no localized routes. The strategy is **per-post**:

- Each post defines `language: "en" | "pt-BR"` and a shared `translationKey`
- The `[slug]` page groups translations and shows an EN/PT switch in the article header
- The site UI is mostly in English; posts and editorial copy mix EN/PT by authorial intent

---

## 6. Presentation layer

### Design system — "Agentic Futurism"

The full system is described in `docs/redesign-2026-agentic-futurist.md` and the tokens live in `src/app/globals.css`. Summary:

- **Canvas:** rich black `#05060a` with cool blue tinge
- **Accents:** electric cyan `#22d3ee`, magenta `#d946ef`, blue `#3b82f6`
- **Typography:**
  - `--font-geist-sans` — UI
  - `--font-manrope` (display) — section headlines
  - `--font-jetbrains-mono` — meta strips, numbers, technical labels
  - `--font-fraunces` — editorial display **inside posts** (h1–h4, blockquote, drop-cap)
  - `--font-source-serif` — editorial body **inside posts**
- **Ambient atmosphere:**
  - `body::before` — three radial gradients (cyan/magenta/blue)
  - `body::after` — 56px grid with radial mask
  - `<CursorAurora/>` global (in `layout.tsx`)
- **Utilities (in `globals.css`):** `.glass`, `.glass-strong`, `.text-gradient-cm`, `.glow-cyan`, `.glow-magenta`, `.ring-glow`, `.mesh-divider`, `.scanline`, `.hover-lift`, `.border-conic`, `.noise`
- **Editorial prose** (`.prose`): redefines `--tw-prose-*` variables, forces Source Serif 4 with line-height 1.78, drop-cap on `:first-of-type::first-letter`, blockquote with cyan border, code with `bg: rgba(34,211,238,0.08)`
- **Reduced motion:** all keyframes are neutralized in `@media (prefers-reduced-motion: reduce)`

### FX components (`src/components/fx/`)

| Component | Purpose |
|---|---|
| `cursor-aurora.tsx` | Cyan/magenta halo that follows the mouse globally (mounted in the root layout) |
| `liquid-orb.tsx` | Animated organic orb for hero / feature sections |
| `particle-field.tsx` | Particle field (canvas/svg) — suggests "agent in motion" |
| `glow-card.tsx` | Wrapper with conic border + cyan/magenta halo on hover |

These components are opt-in and should be used sparingly so they don't compete with the editorial typography.

---

## 7. APIs and state

### `/api/page-views` (GET, POST)

- Today: `Map<string, number>` in memory (resets on each cold start)
- Documented TODO: switch to Upstash Redis (`@upstash/redis`)
- Contract: `?slug=xyz` (GET) → `{ views }`. `POST { slug }` → increment

### `/api/feedback` (POST)

- Today: in-memory array (volatile)
- TODO: Upstash Redis or Vercel Postgres / Neon (via Marketplace)
- Contract: `POST { slug, type, message? }` → `{ success: true }`

### `/api/subscribe` (POST)

- Integrates with **Buttondown** (`https://api.buttondown.email/v1/subscribers`)
- Requires `BUTTONDOWN_API_KEY` (env)
- Treats 409 as success ("already subscribed")

> ⚠️ **Important:** the first two routes carry "TODO Upstash" — any real traffic is lost between invocations. Do not treat as persistent until the integration lands.

---

## 8. Environment variables

| Var | Use | Required |
|---|---|---|
| `BUTTONDOWN_API_KEY` | `/api/subscribe` | Yes for newsletter to work |
| `UPSTASH_REDIS_REST_URL` | (future) page-views, feedback | No (in-memory today) |
| `UPSTASH_REDIS_REST_TOKEN` | (future) idem | No |

In development: `.env.local`. In production: use `vercel env pull` / the Vercel dashboard.

---

## 9. Build & deploy

```bash
npm run dev      # velite + next dev (Turbopack)
npm run velite   # only regenerates .velite/
npm run build    # velite --clean + next build
npm run start    # serve build locally
npm run lint     # eslint
```

### Build-critical points

1. **`velite` must run before `next build`.** The `build` script already enforces this (`velite --clean && next build`).
2. **`tsconfig.json` excludes `.velite`** but the `paths` map `#site/content` → `./.velite`. Next resolves this through its plugin.
3. **Turbopack** is configured with `root: process.cwd()` to avoid warnings in monorepo-like setups.
4. **External images** are allowlisted: only `images.unsplash.com`. Add new hosts in `next.config.ts → images.remotePatterns`.

### Deploy

- **Platform:** Vercel (`framework: nextjs`, automatic build)
- **Functions runtime:** Node 24 (Fluid Compute, default)
- **Regions:** Vercel default (multi-region edge cache)
- **ISR:** not configured — the entire blog is SSG at build time

---

## 10. SEO & metadata

- `siteConfig` in `src/lib/constants.ts` is the single source of truth for author, canonical URL, OG defaults
- `metadataBase` is set in the root layout — all URLs are absolute via `new URL(path, siteConfig.url)`
- `/blog/[slug]` generates:
  - `<title>` template `%s · Thiago Marinho`
  - OpenGraph type `article` with `publishedTime`, `tags`, `authors`
  - Twitter Card `summary_large_image`
  - **Inline JSON-LD `BlogPosting`** in `<script>` for rich results
- `sitemap.ts` lists every published post + static pages
- `rss.xml` generated in a dynamic route (not static)
- `robots.ts` permissive

---

## 11. Extension points (known roadmap)

| Item | Where |
|---|---|
| Migrate `/api/page-views` and `/api/feedback` to Upstash Redis | `src/app/api/{page-views,feedback}/route.ts` (explicit TODOs) |
| Reactivate MDX with components (`<Callout/>`, `<Video/>`) | `velite.config.ts` (`s.mdx()`), `src/components/mdx/mdx-content.tsx` |
| Vercel AI Gateway for chat / explainer in the blog | (not implemented) |
| Cache Components / `use cache` (Next 16) | (opportunity — everything is SSG today) |
| Full UI translation (not just posts) | (pending decision — UI is currently English-only) |

---

## 12. Architecture decisions (light ADR)

1. **Velite > MDX runtime** — performance and type-safety beat the flexibility of JSX in posts.
2. **No CMS** — content in Git, reviews via PR, zero vendor lock-in.
3. **Static-first** — 90% of routes are SSG, APIs are the exception.
4. **Editorial fonts inside posts only** — Fraunces/Source Serif live only in `.prose`, keeping the technical UI in sans.
5. **`docs/redesign-2026-agentic-futurist.md` is the visual changelog** — any substantive design change must update it.
6. **In-memory APIs are intentionally provisional** — flagged with `// TODO` to avoid a false sense of persistence.

---

## 13. Quick conventions

- **Server Components by default**, `"use client"` only for interactivity (search, CV viewer, share, forms)
- **No `useEffect` for data fetching** — except `/cv`, which is deliberately client-side
- **Next `Image`** for everything except the GitHub avatar in the header (fixed external URL)
- **Tailwind utility-first**, but extract to `globals.css` when a pattern repeats 3+ times
- **Categories** are free-form strings in frontmatter — no centralized enum (deliberate, to avoid authoring friction)

---

**Last updated:** 2026-05.
**Maintainer:** Thiago Marinho (`tgmarinho@gmail.com`).
