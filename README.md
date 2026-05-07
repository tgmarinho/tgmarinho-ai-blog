# TG Marinho — Agentic Futurist Website

> Personal platform + technical blog crafted as a living AI interface.

![Next.js](https://img.shields.io/badge/Next.js-16.1.6-000000?style=flat&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.3-20232a?style=flat&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-4.x-0b1120?style=flat&logo=tailwind-css)
![Velite](https://img.shields.io/badge/Content-Velite-111827?style=flat)

## ✦ Vision

This repo powers two layers of the same digital system:
- **Institutional layer**: `/about`, `/projects`, `/contact`, `/community`, `/cv`
- **Editorial layer**: `/blog` and `/blog/[slug]` with MDX long-form content

The visual direction is **Minimalismo Futurista + IA Agentic**:
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
- Responsive navigation (desktop + sheet mobile nav)
- Performance-oriented App Router architecture

## 🧠 Tech Stack

### Core
- [Next.js 16](https://nextjs.org/)
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)

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
- [Upstash Redis](https://upstash.com/) (optional)

## 🛰️ Architecture

```txt
tgmarinho-ai-website/
├── content/
│   └── posts/                    # MDX sources
├── docs/
│   └── redesign-2026-agentic-futurist.md
├── public/
├── src/
│   ├── app/                      # Next.js routes
│   │   ├── blog/
│   │   ├── about/
│   │   ├── projects/
│   │   ├── contact/
│   │   ├── community/
│   │   └── cv/
│   ├── components/
│   │   ├── fx/                   # particle-field, liquid-orb, glow-card, cursor-aurora
│   │   ├── blog/
│   │   ├── home/
│   │   ├── layout/
│   │   └── ui/
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
- Node.js 20+
- npm

### Install

```bash
git clone <repository-url>
cd tgmarinho-ai-website
npm install
```

### Dev

```bash
npm run dev
```

Pipeline:
1. `velite` processes content
2. `next dev` serves app at [http://localhost:3000](http://localhost:3000)

### Build & Run

```bash
npm run build
npm run start
```

## 🧩 Scripts

- `npm run dev` → Velite + Next.js dev
- `npm run build` → clean Velite + production build
- `npm run start` → production server
- `npm run velite` → content only
- `npm run lint` → ESLint

## ✍️ MDX Authoring

Posts live in `content/posts/*.mdx`.

```mdx
---
title: "Post Title"
description: "Post description"
date: "2026-05-07"
published: true
categories: ["AI", "Career"]
image: "/images/example.png"
---

Post content...
```

Velite validates frontmatter and outputs typed content consumed from `#site/content`.

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
