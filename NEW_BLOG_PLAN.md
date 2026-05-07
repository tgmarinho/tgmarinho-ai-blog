# Plano: Novo Blog/Portfolio - tgmarinho-ai-website

## Tech Stack
- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **shadcn/ui** + **Tailwind CSS v4** (dark theme parecido com tarekdev.site)
- **Velite** para processar MDX (build-time, type-safe com Zod)
- **rehype-pretty-code** (Shiki) para syntax highlighting
- **fuse.js** para busca client-side (substitui Algolia)
- **Upstash Redis** para page views e feedback (substitui FaunaDB)
- **Buttondown** para newsletter (mantido)
- **framer-motion** para animacoes
- **Vercel** para deploy, **GitHub** para codigo

## Estrutura de Diretórios

```
tgmarinho-ai-website/
├── content/
│   └── posts/          # 67 MDX posts migrados
├── public/
│   ├── fonts/          # Recoleta, Spectral, JetBrains Mono
│   └── images/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout (fonts, theme, metadata)
│   │   ├── page.tsx                # Home (hero + posts recentes)
│   │   ├── globals.css             # Tailwind v4 + tema dark
│   │   ├── blog/
│   │   │   ├── page.tsx            # Listagem com busca
│   │   │   └── [slug]/page.tsx     # Post individual
│   │   ├── about/page.tsx
│   │   ├── projects/page.tsx
│   │   ├── contact/page.tsx        # Contato (canais)
│   │   ├── community/page.tsx      # Discord
│   │   ├── not-found.tsx
│   │   ├── sitemap.ts
│   │   ├── robots.ts
│   │   ├── rss.xml/route.ts
│   │   └── api/
│   │       ├── page-views/route.ts
│   │       ├── feedback/route.ts
│   │       └── subscribe/route.ts
│   ├── components/
│   │   ├── layout/                 # header, footer, mobile-nav
│   │   ├── home/                   # hero, recent-posts, skills
│   │   ├── blog/                   # post-card, search, category-filter
│   │   ├── mdx/                    # mdx-content, code-block, callout, video
│   │   ├── forms/                  # feedback, newsletter, contact
│   │   └── ui/                     # shadcn components
│   └── lib/
│       ├── utils.ts                # cn() do shadcn
│       ├── velite.ts               # helpers para acessar posts
│       └── constants.ts            # config do site, social links
├── velite.config.ts
├── next.config.ts
└── .env.local
```

## Fases de Implementacao

### Fase 1: Setup + Blog Funcional (MVP)
1. Criar projeto Next.js 15 com shadcn/ui
2. Configurar Velite com schema de posts (frontmatter Zod)
3. Configurar fonts custom + tema dark no globals.css
4. Criar root layout com Header (sticky, blur) e Footer
5. Criar Home page (hero com foto, nome, stats + posts recentes)
6. Criar pagina de listagem do Blog com busca (fuse.js)
7. Criar pagina de post individual com MDX rendering
8. Criar componentes MDX (code-block com copy, callout, video, headings)
9. Rodar script de migracao dos 67 posts MDX
10. Criar repo GitHub e deploy inicial na Vercel

### Fase 2: Paginas + Polish
1. Pagina About (bio, skills, social links)
2. Pagina Projects (showcase com cards)
3. Pagina Contact/Sponsor (form ou canais)
4. Pagina Community (Discord invite)
5. Pagina 404
6. Filtro por categorias no blog
7. Reading time display
8. Animacoes com framer-motion
9. Responsividade mobile completa

### Fase 3: Features de Engajamento
1. Setup Upstash Redis
2. API + componente de page views
3. API + form de feedback em cada post
4. API + form de newsletter (Buttondown)
5. RSS feed route
6. sitemap.ts e robots.ts
7. SEO metadata completo (OG tags por post)

### Fase 4: Extras
1. Table of contents nos posts
2. Posts relacionados
3. PWA manifest
4. Vercel Analytics
5. OG image generation (Vercel OG)

## Design (referencia tarekdev.site)
- **Tema dark**: fundo #09090b, texto #fafafa
- **Navbar sticky** com backdrop blur, links: Blog, About, Projects, Contact
- **Hero**: foto circular grande, nome, role, stats (posts, anos exp), CTAs
- **Cards de post**: titulo, descricao, data, reading time, categoria badge
- **Typography**: Recoleta (serif headings), Spectral (body), JetBrains Mono (code)
- **Accent color**: blue-500 (#3b82f6) para links e highlights

## Migracoes Tecnicas
| De (blog atual) | Para (novo site) |
|---|---|
| Next.js 11 Pages Router | Next.js 15 App Router |
| next-mdx-enhanced | Velite + MDX |
| prism-react-renderer | rehype-pretty-code (Shiki) |
| Algolia search | fuse.js client-side |
| FaunaDB | Upstash Redis |
| twin.macro + styled-components | Tailwind v4 + shadcn/ui |
| `<Head>` SEO | Next.js Metadata API |
| Netlify deploy | Vercel deploy |

## Verificacao
- `npm run dev` roda sem erros
- Todos os 67 posts MDX renderizam corretamente
- Busca encontra posts por titulo/descricao
- Code blocks tem syntax highlighting e botao de copiar
- Site responsivo em mobile
- Deploy na Vercel funciona
- Lighthouse score > 90 em performance e SEO
