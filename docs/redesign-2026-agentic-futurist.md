# Redesign 2026 — Agentic Futurist

> Registro histórico do redesign completo do `tgmarinho-ai-website`, executado em uma única sessão de pair-programming com Cursor (Claude Opus 4.7), em maio/2026. Também serve como changelog de decisões e lições aprendidas para futuros redesigns.
>
> A versão **generalizada e reutilizável** desse sistema de design está empacotada como skill pessoal em `~/.cursor/skills/agentic-futurist-website/` — use-a em qualquer outro projeto.

---

## 1. O briefing original (verbatim do usuário)

> Contexto do Projeto: Redesign do ecossistema digital TG Marinho (Site Institucional + Blog).
> Objetivo Visual: Criar uma identidade que comunique "Engenheiro de Software Senior + Product Engineer + AI Engineer". O design deve ser tecnológico, minimalista, futurista e exalar autoridade em Inteligência Artificial Agentic.
>
> Requisitos de Estilo:
>
> 1. **Paleta de Cores**: Deep Dark Mode (Rich Blacks, Grays) com toques de Neon sutis (Ciano, Azul Elétrico, Magenta suave) para destacar interatividade. Evitar paletas de "startup genérica".
> 2. **Tipografia**: Sans-Serif moderno, técnico e geométrico. Sugestões: Inter, Satoshi, ou Manrope. Headlines em pesos altos (Bold/Black).
> 3. **Elementos de IA**: Incluir formas orgânicas geradas (estilo "Liquid Glass" ou "Aurora"), partículas flutuantes ou microanimações que sugiram processamento de dados/agentes em ação.
> 4. **Layout do Site**: Hero section com elemento 3D ou interativo (algo que reaja ao mouse). Navegação minimalista (top bar fixa). Seções de "Glassmorphism" para os serviços de automação e consultoria.
> 5. **Layout do Blog**: Ultra-moderno. Grid assimétrico para os posts. Cards com efeito de profundidade (hover). Foco em UX de leitura, com bastante white space (ou black space, neste caso).
> 6. **Vibe Geral**: Sofisticado, autoritário, inovador e extremamente rápido.
>
> Referência Técnica: O site deve parecer uma mistura de uma interface do filme Minority Report com a elegância da Apple e a funcionalidade da Linear.app.

E ao longo da sessão, três pivôs importantes:

> *uma boa referencia https://ehabhussein.com/*

> *apenas a tipografia e tbm dentro dos artigos achei legal https://ehabhussein.com/p/hello-from-the-resident o design mas a nossa pagina atual com sua implementação já ficou excelente*

> *quero manter os mesmos menus … e mudar apenas o design*

> *eu quero que reestilize a pagina /cv /about /projects /contact*

> *add community to the header as menu*

---

## 2. Estado anterior do projeto

| Camada | Antes |
|---|---|
| **Cores** | Tema neutro, gray-100 background, sem accents marcantes |
| **Fontes** | Geist + Geist Mono + Spectral (serif) + JetBrains Mono — `Spectral` ocupava o papel de display, dando um tom "elegante editorial" que **conflitava** com o brief de "AI agentic" |
| **Hero** | Saudação + CTA simples, sem elemento 3D ou particles |
| **Cards de post** | Bordas sólidas, hover sem profundidade |
| **Blog post** | Prose default Tailwind, sem drop-cap, sem sign-off editorial |
| **Atmosfera** | Sem `body::before`/`::after`, sem cursor-aurora, sem partículas |
| **Header/Footer** | Funcionais, mas sem hierarquia visual marcante |
| **CV/About/Projects/Contact** | Existiam, mas com aesthetic disperso |
| **Community** | Página existia, mas **não estava no header** |

---

## 3. Conceito final: "Agentic Futurism"

Em uma frase: **dark theatre + technical density + editorial soul**.

Três tensões intencionais que dão a personalidade:

1. **Futurism × Editorial** — A casca é interface de IA (cyan, glass, particles, orb). Mas dentro dos posts, troca para tipografia editorial serif (Fraunces + Source Serif 4) com drop-cap. O contraste é o ponto.
2. **Density × White space** — Mono uppercase eyebrows, status pills, telemetry badges criam densidade técnica. Mas o layout respira: `max-w-6xl`, `py-32`, max-w-[680px] no body do post.
3. **Liveness × Restraint** — A página *vive* (cursor aurora, particles, orb tilting, blink cursors), mas nada é gratuito: cada animação é sutil, respeita reduced-motion, contribui pra narrativa "agentes estão trabalhando".

---

## 4. Decisões de design (com rationale)

### 4.1. Paleta

| Token | Valor | Por quê |
|---|---|---|
| `--background` | `#05060a` | Não é puro `#000` — tem tinge azulado quase imperceptível. Profundidade real. |
| `--foreground` | `#e6f0ff` | Off-white com tinge azul, dialoga com o background. |
| `--primary` (cyan) | `#22d3ee` | Cyan elétrico = brand mark. Single accent dominante. |
| `--accent` (magenta) | `#d946ef` | Magenta suave como contraponto. Usado **escassamente** — gradientes, pontos orbitais, hover spotlights. |
| `--border` | `rgba(255,255,255,0.06)` | Borders **sempre** com opacity baixa, nunca sólidos. |

**Decisão importante**: descartado o purple gradient sobre branco (cliché 2024 SaaS). Cyan + magenta sobre rich black = identidade.

### 4.2. Tipografia (5 fontes, papéis distintos)

| Variável | Fonte | Papel |
|---|---|---|
| `--font-sans` | Geist | Body UI, parágrafos, cards |
| `--font-display` | Manrope | Headlines, títulos, números grandes |
| `--font-mono` | JetBrains Mono | Eyebrows `━ section`, status pills, metas, terminal |
| `--font-editorial` | Fraunces (variable, opsz + SOFT) | Títulos de post, ledes em italic |
| `--font-reading` | Source Serif 4 | Body de blog post (prose) |

**Removido**: Spectral (era o `--font-serif` antigo) — substituído por **Fraunces** que tem mais caráter editorial.

**Pivô conceitual** (sugestão do usuário com `ehabhussein.com`): a princípio, tudo seria Manrope/Geist. Mas inserir Fraunces+Source Serif 4 **só dentro dos posts** criou o melhor contraste — o site é "AI interface", o post é "editorial publication". Os dois conversam sem se diluir.

### 4.3. Atmosfera global (ambient layer)

Quatro camadas sobrepostas em todas as páginas:

1. `body::before` — radial halos (cyan top-left, magenta top-right, blue bottom)
2. `body::after` — grid 56×56px com mask radial (some nas bordas)
3. `<CursorAurora />` — halo 620px que segue o mouse com lerp 0.12, `mix-blend-mode: screen`
4. Por-página: halo blurred no topo da seção (`absolute -top-40 h-[520px] blur-[120px]`)

Resultado: sensação de "câmara escura iluminada por algo abaixo da superfície".

### 4.4. Componentes primitivos (criados do zero)

| Componente | Stack | Decisão |
|---|---|---|
| `ParticleField` | Canvas2D puro | **Recusei** Three.js — Canvas2D + 60 partículas com links próximos = 5kb e ~60fps. Hue palette `[195, 220, 295]` (cyan/blue/magenta). |
| `LiquidOrb` | SVG + CSS conic-gradient | **Recusei** R3F — 4 layers (halo + 2 conic rings + core sphere com 14 ellipses). 5kb. Tilt sutil de até 12px com cursor. |
| `GlowCard` | React + CSS variables | Spotlight cursor inside card, atualizado via `el.style.setProperty('--mx',...)` — zero re-renders. |
| `CursorAurora` | RAF loop + lerp | Damping 0.12 = "liquid feel". Skipped em touch e reduced-motion. |

### 4.5. Padrão "section eyebrow" (a marca da casa)

Toda seção abre com:
```
━ section-name
Headline Display com uma palavra accent.
```

O `━` (U+2501) + `font-mono text-[10.5px] uppercase tracking-[0.22em] text-cyan-300/80` virou a **assinatura visual** do site.

### 4.6. Status pills (a narrativa "agentes ao vivo")

Espalhadas estrategicamente:
- Header: `agent · online`
- Footer: `system · operational`
- CV: `updated`
- Contact: `inbox · open · usually answers within 24h`
- Community: `community · live`
- MDX terminal in hero: `agent.run("ship_value") → ok` com blink cursor

Sempre com pinging green dot. Vendem a história "AI is working" sem ser cringe.

---

## 5. Arquivos criados

```
src/components/fx/
├── particle-field.tsx        ← Canvas2D agent network
├── liquid-orb.tsx            ← SVG + CSS hero centerpiece
├── glow-card.tsx             ← spotlight glassmorphic surface
└── cursor-aurora.tsx         ← global mouse-following halo

src/components/blog/
├── post-card.tsx             ← (reescrito) 3 variants (feature/default/compact)
└── search.tsx                ← (atualizado) Fuse.js + category pills mono

src/components/mdx/
└── share-button.tsx          ← (atualizado) pill cyan + hover shimmer

src/components/home/
├── hero.tsx                  ← (reescrito) orb + particles + terminal + telemetry
└── recent-posts.tsx          ← (reescrito) asymmetric grid 1-feature + 4-default

src/components/layout/
├── header.tsx                ← (reescrito) scroll-aware pill nav + logomark + status
├── footer.tsx                ← (reescrito) 4-col + mesh divider + brand column
└── mobile-nav.tsx            ← (reescrito) Sheet + numbered list 01..06

src/components/cv/
└── cv-viewer.tsx             ← (reescrito) Markdown render glassmorphic + print fallback
```

## 6. Arquivos modificados (substancialmente)

```
src/app/globals.css           ← refundado: tokens, atmosphere, utilities, prose editorial
src/app/layout.tsx            ← +Manrope/Fraunces/Source Serif, +CursorAurora
src/app/page.tsx              ← Hero + RecentPosts (estrutura preservada por pedido)
src/app/blog/page.tsx         ← hero header + asymmetric grid
src/app/blog/[slug]/page.tsx  ← editorial layout completo (Fraunces + drop-cap + sign-off)
src/app/about/page.tsx        ← achievements grid + timeline + skills + socials
src/app/projects/page.tsx     ← hero + GlowCard grid com highlight prop
src/app/contact/page.tsx      ← channels + inquiry hints
src/app/community/page.tsx    ← Discord-tinted hero + benefits + CTA
src/app/cv/page.tsx           ← screen futurist + print formal black-on-white
src/lib/constants.ts          ← +"Community" no navLinks
```

---

## 7. Lições aprendidas

### 7.1. Design

| Lição | Detalhe |
|---|---|
| **Single accent rule** | Headlines com **uma só** palavra em `text-gradient-cyan` ou `text-gradient-cm`. Se duas palavras competem, perde impacto. |
| **Não use neon na tipografia de body** | Cyan/magenta só em accents, hairlines, dots, halos, eyebrows. Texto principal sempre off-white. |
| **Borders ≠ sólidos** | Sempre `border-white/[0.06]`, `border-white/10`, `border-cyan-300/20`. Borders sólidos quebram a coesão. |
| **Glass ≠ apenas blur** | Glassmorphism real precisa: backdrop-blur + saturate(160-180%) + gradient sutil interno + border opacity-low + hairline highlight no topo. |
| **3D barato é melhor que 3D caro** | SVG + conic-gradient + CSS animation deu mais identidade que Three.js teria dado. 5kb vs 150kb+. |
| **`mix-blend-mode: screen`** | É o que faz o cursor aurora "iluminar" a página sem bloquear. Nunca use blend `normal` para halos. |
| **Asymmetric grids precisam de variantes** | Sem `variant: "feature" | "default" | "compact"` no PostCard, qualquer grid asym vira hack manual. Variants resolvem por composição. |
| **`prefers-reduced-motion` não é opcional** | Cada efeito (CursorAurora, ParticleField, LiquidOrb tilt, animações conic-border) checa essa media query e degrada. Critical. |

### 7.2. Tipográfica

| Lição | Detalhe |
|---|---|
| **5 fontes não é "demais"** se cada uma tem papel distinto | Geist (UI body), Manrope (display), JetBrains Mono (technical voice), Fraunces (editorial display), Source Serif (editorial body). Cada uma fala uma língua. |
| **Variable fonts + axes ≠ weight array** | `Fraunces({ axes: ["opsz","SOFT"] })` **não pode** ter `weight: [...]` simultaneamente — quebra com erro `Module not found: Can't resolve 'next/font/google/target.css'`. Ver §8. |
| **Font feature settings importam** | `font-feature-settings: "ss01", "kern", "liga"` no `.prose h1-h4` faz Fraunces brilhar (alternates estilísticos). |
| **Drop-cap funciona com gradient** | `.prose > p:first-of-type::first-letter` + `linear-gradient(180deg, #f4f6fb, #a5f3fc, #22d3ee)` + `background-clip: text` → drop-cap cyan-fade. Detalhe que vende o post. |
| **`text-balance` no `<h1>`** | Em títulos longos do post, `text-balance` evita órfãs ridículas. |

### 7.3. Técnicas / arquitetura

| Lição | Detalhe |
|---|---|
| **CSS variables > React state para cursor tracking** | `el.style.setProperty('--mx', ...)` no `pointermove` evita re-renders. 60fps garantidos. Aplicado no GlowCard, CursorAurora, ParticleField. |
| **`@property --angle`** | CSS Houdini permite animar custom properties com syntax tipada. É o que faz `.border-conic` rotacionar. Sem isso, animação de gradient-conic não funciona. |
| **Tailwind v4 `@theme inline`** | Converte custom properties em utility classes automaticamente. Significa que `bg-primary`, `text-cyan-glow`, `font-display` "just work" se mapeados em `@theme`. |
| **Velite warnings de assets ≠ build break** | `error ENOENT: no such file or directory, open 'content/posts/cmd_android.png'` foi pre-existente, não causado pelo redesign. Velite avisa mas continua. |
| **Sticky headers + backdrop-blur funcionam** | `sticky top-0 + backdrop-blur-xl + bg-background/65` cria o efeito Linear/Vercel sem JS pesado. Toggle de classe no scroll > 8px. |
| **Print styles devem nukear o futurismo** | `@media print` precisa: `display: none` em `body::before/after`, `all: unset` em `.glass`, `background: none !important; -webkit-text-fill-color: #000` em text gradients. Senão o PDF sai colorido e o ATS quebra. |
| **Logomark com 2 letters > SVG complexo** | TG em monospace + glass tile + cyan corner-dot transmite tudo. Não precisa logo elaborado. |

### 7.4. Processo / colaboração

| Lição | Detalhe |
|---|---|
| **Manter o briefing curto na hora de aplicar** | Não criar componentes que o brief não pediu (nas iterações, criei `AgenticServices`, `Capabilities`, `HomeCTA` — depois removi: o usuário pediu só redesign, não nova IA). |
| **Referências externas pedem fusion, não cópia** | `ehabhussein.com` foi referência só de **tipografia editorial dentro de artigos**. O resto continua "agentic futurist". Fusion > clone. |
| **Não copiar persona** | `ehabhussein.com` se vende como "AI resident". Manter identidade humana do usuário (Thiago Marinho). Cópia de persona é antiético + cringe. |
| **Reverter quando o usuário pedir** | Quando ele disse "quero manter os mesmos menus", reverter o `page.tsx` foi a coisa certa. Não argumentar. |
| **Confirmar pivôs explícitos** | "add community to the header" → editar `navLinks`, não criar nova arquitetura de menu. |

### 7.5. Copy / tom de voz

| Lição | Detalhe |
|---|---|
| **Mono uppercase como status signal** | `━ writing`, `━ services`, `━ archive · 12 entries`, `inbox · open · usually answers within 24h` — terminal/server vocabulary é coerente com o conceito. |
| **Headlines: short + declarative + 1 accent** | *"Building the **agentic layer** of software."* / *"Field notes from the **edge**."* / *"The **signal**, not the noise."* — short e direto. |
| **Bold para metrics, não para enfase genérica** | `R$6M revenue`, `50k+ developers`, `13+ years`. Bold só pra dado real. |
| **Italic Fraunces para sign-offs** | `— written by Thiago Marinho` em italic Fraunces no fim do post. Detalhe editorial que humaniza. |
| **"Powered by intent"** | Footer signoff. Substitui o cliché "Made with ❤️ in...". Mais alinhado com a identidade. |

---

## 8. Erros encontrados e fixes

### 8.1. `Module not found: Can't resolve 'next/font/google/target.css'`

**Causa**: configurei `Fraunces` com **ambos** `weight: [...]` e `axes: [...]`. Variable fonts com axes não aceitam weight array.

**Fix** em `src/app/layout.tsx`:

```ts
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  // weight: [...]  ← REMOVIDO
  style: ["normal", "italic"],
  display: "swap",
  axes: ["opsz", "SOFT"],
});
```

### 8.2. `(eval):1: command not found: curl`

**Causa**: shell do Cursor não tinha `curl` no PATH.

**Fix**: usar o caminho absoluto `/usr/bin/curl`. Lição: para smoke tests usar caminhos absolutos quando o tool depende de binário do sistema.

### 8.3. `post.location` não existia no schema do Velite

**Causa**: na primeira versão do blog post page, tentei renderizar `post.location` no sign-off. O schema do Velite não tinha esse campo.

**Fix**: removido, substituído por `siteConfig.location` (vem das constants).

### 8.4. Velite warnings de imagens MDX

**Mensagens**:
```
ENOENT: no such file or directory, open 'content/posts/cmd_android.png' body
ENOENT: no such file or directory, open 'content/posts/assets/img/duke256.png' body
```

**Causa**: posts antigos referenciam imagens que não estão no diretório esperado.

**Status**: **não corrigido** — pre-existente, fora do escopo do redesign. TODO documentado abaixo.

---

## 9. Próximos passos / open items

- [ ] Resolver os warnings de Velite (mover/copiar `cmd_android.png`, `duke256.png` para os paths esperados ou ajustar referências MDX)
- [ ] Adicionar OG images dinâmicas para posts (`/og/[slug]` route com Vercel OG) usando os tokens cyan/magenta
- [ ] Considerar `view-transitions-name` em headlines para slow page transitions
- [ ] Adicionar `Sign in with Vercel` se a área `/community` virar gated
- [ ] Migrar de fontes Google Fonts self-hosted para reduzir CLS no first paint (atualmente usando `next/font/google`)
- [ ] Criar variante "compact" do PostCard para uso em sidebars (já existe a variant, falta uso)

---

## 10. Pointer pra skill reutilizável

Toda a base de design empacotada como skill pessoal:

```
~/.cursor/skills/agentic-futurist-website/
├── SKILL.md         ← entry point (filosofia + tokens + padrões + checklist)
├── tokens.css       ← globals.css completo, copiável
├── primitives.md    ← código de CursorAurora, GlowCard, ParticleField, LiquidOrb
└── patterns.md      ← receitas: layout, header, hero, post-card, blog post, footer, etc.
```

Para usar em projeto novo, basta dizer ao agente: *"use a skill `agentic-futurist-website`"* — ou descrever o vibe ("redesign, futurist minimalism, agentic, glass, neon"), que a skill auto-dispara via description.

---

## 11. Referências usadas no caminho

- **[ehabhussein.com](https://ehabhussein.com/)** — tipografia editorial Fraunces + Source Serif 4 + drop-cap + sign-off italic. Aplicado **só em `/blog/[slug]`**.
- **[linear.app](https://linear.app)** — pill nav scroll-aware, status indicators, mono uppercase metas.
- **[vercel.com](https://vercel.com) / v0** — atmosfera dark, halos sutis, cyan accents, glass surfaces.
- **Apple** — restraint, white space (black space, neste caso), tipografia de display em peso bold tight-tracking.
- **Minority Report** — terminal aesthetic, telemetry badges flutuantes, gestos suaves.

A combinação dessas 5 referências, filtrada pela narrativa "AI Product Engineer", virou o conceito final.
