# SPEC — Internacionalização do site (EN / PT-BR)

> **Issue:** [#43 — internacionalizar o site](https://github.com/tgmarinho/tgmarinho-ai-blog/issues/43)
> **Status:** proposta
> **Autor:** Thiago Marinho
> **Última atualização:** 2026-05-12
> **Locales no escopo:** `pt-BR` (default), `en`. Espanhol fica fora desta entrega.

---

## 1. Objetivo

Permitir que o visitante escolha o idioma do site inteiro — UI, navegação, metadados e **todo o conteúdo de blog** — entre **PT-BR** (default) e **EN**.

Critérios de aceite:

1. Toggle de idioma visível no header (e no mobile nav), persistente entre páginas.
2. Toda string de UI (header, footer, hero, projects, about, contact, cv, community, 404) traduzida.
3. **Blog**: listagem, busca, categorias, leitura individual e RSS respeitam o locale ativo.
4. **Cada post existe nas duas línguas.** Posts órfãos (só PT ou só EN) recebem uma versão traduzida (commit dentro do repo, não tradução runtime).
5. URLs canônicas por locale: `/{slug}` para PT-BR (default, sem prefixo) e `/en/{slug}` para EN — ou esquema equivalente decidido na §4.
6. SEO: `hreflang`, `<link rel="alternate">`, `sitemap.xml` cobrindo as duas versões, `og:locale`.
7. Detecção inicial: `Accept-Language` → fallback PT-BR; preferência do usuário salva em cookie (`NEXT_LOCALE`).
8. Build do Velite continua passando; `npm run lint` e `npm run build` verdes.

Não-objetivos:

- Espanhol (fica para uma segunda fase).
- Tradução automática em runtime (Google Translate widget etc.).
- Tradução de comentários de código dentro dos posts.

---

## 2. Estado atual

- **75 posts** em `content/posts/*.mdx` (pipeline Velite, `body` como markdown — não MDX/JSX).
- Apenas **13 posts** com frontmatter `language` / `translationKey` (7 `pt-BR`, 6 `en`); restante (~62) é legado em PT-BR sem marcação.
- Velite schema já tem `language` e `translationKey` opcionais (`velite.config.ts:14-15`) — base de bilinguismo no MDX existe, mas não está universal nem ligada a roteamento.
- `src/app/blog/[slug]/page.tsx` já tem labels `EN`/`PT` e ordenação por `languageOrder`, mas a página de leitura **não** filtra pelo locale do usuário — exibe todos.
- `src/app/blog/page.tsx` lista **todos** os posts publicados; `BlogSearch` indexa todos.
- UI strings 100% hard-coded em inglês (header, hero, blog title "The signal, not the noise", projects "Things I've shipped" etc.).
- Não há `middleware.ts`, nem `next-intl`, nem detecção de locale.
- Existe skill `blog-post-bilingual` (mencionada no CLAUDE.md) — vamos reaproveitar como base do workflow de tradução.

---

## 3. Decisões a tomar (antes da implementação)

| # | Decisão | Recomendação |
|---|---------|--------------|
| D1 | Biblioteca de i18n | **`next-intl`** (canonical para App Router, RSC-friendly, suporta `setRequestLocale`, alternates automáticos) |
| D2 | Esquema de URL | **PT-BR sem prefixo (`/blog/foo`), EN com prefixo (`/en/blog/foo`)** — preserva SEO existente e mantém PT-BR como cidadão de 1ª classe |
| D3 | Storage da preferência | Cookie `NEXT_LOCALE` (1 ano) + redirect em primeiro acesso baseado em `Accept-Language` |
| D4 | Posts órfãos | Tradução assistida por IA, **commitada como MDX** (não runtime), revisada antes do merge |
| D5 | Slug por locale | Slug livre em cada idioma (ex.: `nova-identidade-visual-website` ↔ `new-website-visual-identity`) ligado por `translationKey` |
| D6 | RSS / sitemap | Dois feeds: `/rss.xml` (PT-BR) e `/en/rss.xml` (EN). Sitemap único listando ambos com `xhtml:link rel="alternate"` |

Pontos abertos para confirmar com o usuário antes do código:

- [ ] D2 confirma? (alternativa: `/pt-br/...` + `/en/...`, ambos prefixados)
- [ ] D4: aceita tradução assistida por LLM (Claude Opus 4.7) com pass de revisão humana, ou prefere tradução manual?
- [ ] Em posts cuja tradução não exista ainda, mostrar fallback no outro idioma com banner ("English version coming soon — read in Portuguese") ou esconder?

---

## 4. Arquitetura proposta

### 4.1 Roteamento

```
src/app/
├── [locale]/                       ← novo segmento dinâmico
│   ├── layout.tsx                  ← NextIntlClientProvider + setRequestLocale(locale)
│   ├── page.tsx                    ← home (move src/app/page.tsx pra cá)
│   ├── about/page.tsx
│   ├── blog/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── contact/page.tsx
│   ├── community/page.tsx
│   ├── cv/page.tsx
│   ├── projects/page.tsx
│   └── not-found.tsx
├── api/...                         ← permanece fora do [locale]
├── rss.xml/route.ts                ← gera os dois (com query ?locale=en) ou dois arquivos
├── sitemap.ts                      ← bi-locale
└── layout.tsx                      ← root, define html lang dinâmico
```

`middleware.ts` (novo) usa `createMiddleware` do `next-intl` com:

```ts
locales: ['pt-BR', 'en'],
defaultLocale: 'pt-BR',
localePrefix: { mode: 'as-needed' }, // PT-BR sem prefixo, EN com /en
localeDetection: true,                // primeira visita: Accept-Language
```

### 4.2 Mensagens de UI

```
messages/
├── pt-BR.json
└── en.json
```

Namespaces por seção: `common`, `nav`, `home.hero`, `home.cta`, `blog.list`, `blog.post`, `projects`, `about`, `contact`, `community`, `cv`, `footer`, `notFound`.

Uso típico em RSC:

```tsx
import { getTranslations } from 'next-intl/server';
const t = await getTranslations('blog.list');
<h1>{t('title')}</h1>
```

### 4.3 Velite + posts

**Frontmatter obrigatório** (passa de opcional para required no schema):

```yaml
language: "pt-BR" | "en"
translationKey: "kebab-case-stable-id"   # mesmo nos dois pares
```

Atualizar `velite.config.ts`:

- `language: s.enum(['pt-BR', 'en'])` (obrigatório)
- `translationKey: s.string()` (obrigatório)
- Transform adiciona `localizedSlug = ${language === 'en' ? '/en' : ''}/blog/${slug}`

### 4.4 Helpers (`src/lib/i18n-posts.ts` — novo)

```ts
filterByLocale(posts, locale)
getTranslation(post, targetLocale)   // via translationKey
buildAlternates(post)                // { canonical, languages: { 'pt-BR':…, en:… } }
```

### 4.5 Componentes novos / alterados

- `src/components/layout/locale-switcher.tsx` (novo) — botão `PT | EN` no header, troca via `useRouter().replace(pathname, { locale })`.
- `src/components/layout/header.tsx` — receber `locale`, importar strings via `useTranslations`.
- `src/components/layout/mobile-nav.tsx` — idem + entrada de seletor de idioma.
- `src/components/blog/search.tsx` — filtrar input por locale antes de indexar; aceitar locale-aware placeholders.
- `src/components/home/*` — substituir literais hard-coded.
- `src/components/footer.tsx` — strings + ano/copy.

### 4.6 SEO

Em cada `page.tsx` com `generateMetadata`:

```ts
alternates: {
  canonical: ...,
  languages: { 'pt-BR': '/blog/foo', en: '/en/blog/foo-en' },
},
openGraph: { locale: locale === 'en' ? 'en_US' : 'pt_BR' }
```

`sitemap.ts` itera cada post e emite duas entradas com `<xhtml:link rel="alternate" hreflang>`.

`rss.xml` vira `app/rss.xml/route.ts` parametrizado, ou dois arquivos `app/rss.xml/route.ts` + `app/en/rss.xml/route.ts`.

---

## 5. Migração de conteúdo (posts legados → bilíngue)

### 5.1 Inventário

Script `scripts/audit-posts.ts` (novo) que produz:

- Posts por idioma (detectado por frontmatter `language` ou heurística no body).
- Posts sem `translationKey`.
- Pares já completos vs. órfãos.

Estimativa: ~62 posts precisam ser classificados; **a maior parte é PT-BR legado** que precisa de uma versão EN.

### 5.2 Workflow de tradução (skill `blog-post-bilingual`)

Para cada post órfão:

1. Determinar `translationKey` estável (kebab do título original, sem datas).
2. Garantir frontmatter `language` no original.
3. Gerar par traduzido (Claude Opus 4.7) em `content/posts/{slug}-{en|pt-br}.mdx`, mantendo:
   - Code blocks intocados (só comentários traduzem).
   - Imagens e paths inalterados.
   - Categorias replicadas; adicionar tag `en` ou `pt-br`.
   - Mesmo `translationKey`.
4. `npm run velite` para validar.
5. Revisão humana antes do merge (PR de lotes pequenos — 5–10 posts por PR).

### 5.3 Lotes de migração

| Lote | Critério | Tamanho aprox. |
|------|----------|----------------|
| L1 | Posts "evergreen" / mais acessados (top GA) | 10 |
| L2 | Posts de 2024–2026 (recentes) | ~20 |
| L3 | Posts legados Rocketseat / 2018–2020 | ~30 |
| L4 | Resto + revisão final | resto |

PRs separados para evitar diffs gigantes.

---

## 6. Fases de entrega

> Cada fase termina com PR mergeável e site estável. Nada de big-bang.

### Fase 1 — Fundação i18n (sem migrar conteúdo ainda)

- Instalar `next-intl`.
- Criar `[locale]` layout, middleware, mensagens `pt-BR.json`/`en.json` (apenas chaves de UI já existentes).
- Mover páginas estáticas (home, about, projects, contact, community, cv, 404) para `[locale]/`.
- Locale switcher no header.
- Cookies + detecção `Accept-Language`.
- **Blog ainda mostra tudo no fallback** (sem filtro por locale) — entrega visível mas conservadora.
- SEO básico: `html lang`, `og:locale`.

**Critério de aceite:** PT-BR e EN navegáveis no header; `/en/about` mostra inglês; `/about` mostra português.

### Fase 2 — Blog bilíngue

- Schema Velite com `language` e `translationKey` obrigatórios.
- Migração das 62 posts (em lotes — §5.3) com tradução assistida + revisão.
- Listagem `/blog` e `/en/blog` filtram por locale.
- Busca por locale.
- Página individual: link "Read in English / Ler em português" quando há par.
- Fallback: se acessar `/en/blog/foo` e só existir PT, redirect para `/blog/foo` com banner.
- RSS por locale.

**Critério de aceite:** 100% dos posts publicados disponíveis nos dois idiomas; busca não vaza posts do outro idioma.

### Fase 3 — Polimento SEO + analytics

- `alternates.languages` completo em todas as páginas.
- Sitemap bi-locale.
- Verificar Google Search Console (hreflang válido).
- Snapshot de Lighthouse antes/depois.
- Atualizar `CLAUDE.md` / `AGENTS.md` com a nova convenção de posts.

---

## 7. Riscos & mitigações

| Risco | Probabilidade | Mitigação |
|-------|---------------|-----------|
| Tradução LLM altera sentido técnico | média | Revisão humana obrigatória; glossário de termos (em `messages/glossary.md`) |
| Quebra de links externos para PT (mudança de URL) | baixa (mantemos `/blog/...`) | Decisão D2 preserva URLs existentes |
| Conteúdo dentro de code blocks vira "traduzido" | média | Prompt da skill restringe tradução a prose; QA de diff |
| Velite quebra com schema mais estrito | média | Migrar campo a campo: primeiro `optional`, popular, depois `required` em PR separado |
| Carga extra de 60+ novos arquivos MDX | baixa | Build de Velite é incremental; aceitável |
| `og:image` por locale | baixa | Reutilizar mesma imagem por enquanto |

---

## 8. Métricas de sucesso

- **Cobertura:** 100% das páginas e posts publicados disponíveis nos dois locales.
- **SEO:** Google Search Console sem erros de `hreflang`; ambas versões indexadas em ≤30 dias.
- **UX:** taxa de troca de idioma rastreada no Plausible/Umami (instrumentar evento `locale_change`).
- **Build:** sem regressão de tempo de build > 30%.

---

## 9. Trabalho relacionado / fora do escopo

- Espanhol (`es`) — Fase 4 futura. Estrutura já comporta (`locales: [...]`).
- Tradução do feed do RSS no formato OPML — não.
- Tradução dinâmica de comentários do blog (não há sistema de comentários).
- Tradução do código-fonte ou READMEs do GitHub.

---

## 10. Apêndice — Snippets de referência

### `middleware.ts`

```ts
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['pt-BR', 'en'],
  defaultLocale: 'pt-BR',
  localePrefix: { mode: 'as-needed', prefixes: { en: '/en' } },
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|static|.*\\..*).*)'],
};
```

### Frontmatter padrão para posts (após Fase 2)

```yaml
---
title: "..."
description: "..."
date: "YYYY-MM-DD"
published: true
slug: "..."
language: "pt-BR"          # obrigatório
translationKey: "..."      # obrigatório, mesmo nos dois pares
categories: [...]
image: "..."
---
```

### Locale switcher (esqueleto)

```tsx
'use client';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next-intl/client';

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const next = locale === 'pt-BR' ? 'en' : 'pt-BR';
  return (
    <button onClick={() => router.replace(pathname, { locale: next })}>
      {next === 'en' ? 'EN' : 'PT'}
    </button>
  );
}
```
