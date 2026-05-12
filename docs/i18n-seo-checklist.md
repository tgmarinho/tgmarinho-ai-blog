# i18n SEO checklist

Reference for validating the bilingual setup (PT-BR ↔ EN) and tracking Google Search Console after deploy.

## Automated checks (run anytime)

```bash
# Verifies sitemap, hreflang reciprocity, RSS feeds, og:locale, html lang.
# Requires `npm run dev` (or any SITE_URL=...) running.
npm run audit:i18n-seo

# Lists broken local image/link refs (Next fallbacks silently for hero images).
npm run audit:refs
```

What the validator covers:

- `sitemap.xml` lists every post in both locales when a translation pair exists
- Every `<url>` block with alternates has reciprocal `hreflang` (A↔B)
- RSS feeds at `/rss.xml?locale=pt-BR` and `/rss.xml?locale=en`
- `<html lang="pt-BR">` on `/`, `<html lang="en">` on `/en`
- `og:locale` matches the page locale (`pt_BR` / `en_US`)

## Google Search Console — post-deploy checklist

After the i18n changes are deployed to production:

1. **Submit both sitemaps**
   - `https://tgmarinhopro.com/sitemap.xml` (unified — already lists both locales)
   - Optional: a dedicated `https://tgmarinhopro.com/rss.xml?locale=en`

2. **Verify International Targeting / hreflang**
   - GSC → *Legacy tools and reports → International targeting* (if still available) or *Indexing → Sitemaps*
   - Confirm no "no return tags" errors. Our sitemap includes `<xhtml:link rel="alternate" hreflang="…" />` for every paired post.
   - Expected: 0 errors. If any appear, run `npm run audit:i18n-seo` against production.

3. **URL inspection (spot checks)**
   - Inspect `/` → confirm `pt-BR` is detected as the page locale.
   - Inspect `/en` → confirm `en` is detected.
   - Inspect one paired post (e.g. `/blog/hero-luz-volumetrica-paralax-3d` and `/en/blog/hero-volumetric-light-3d-parallax`) → both should be indexed within ~30 days.

4. **Coverage report**
   - Watch for spikes in "Excluded — Page with redirect" — that's normal for `/pt-BR/*` → `/*` (the `as-needed` prefix logic).
   - Watch for "Duplicate without user-selected canonical" between paired posts. Our `<link rel="canonical">` should prevent this; each post canonicalizes itself in its own locale.

5. **Performance**
   - After 4-6 weeks, compare clicks/impressions for `/en/*` vs `/*` to ensure both are indexed and ranking.

## Re-run schedule

- **Every PR that touches `velite.config.ts`, `src/i18n/*`, `src/app/sitemap.ts`, or `src/proxy.ts`** → run `npm run audit:i18n-seo`.
- **Monthly** → spot-check GSC.

## Known fallbacks (intentional)

- Hero images on legacy 2011-2022 posts may show fallback (no `image:` frontmatter after Phase 2 cleanup). Acceptable — `audit:refs` lists them if you want to repopulate.
- Posts originally written in one locale and translated by an agent always exist as a pair via shared `translationKey` (enforced by the Velite schema).
