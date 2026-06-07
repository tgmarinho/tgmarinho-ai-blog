// Category taxonomy normalization.
//
// Posts were authored over a long span with inconsistent frontmatter:
// mixed casing (`react`/`React`), pluralization (`database`/`databases`),
// punctuation (`nextjs`/`Next.js`) and even language inside the same locale
// (`career`/`carreira`). Rather than rewriting 100+ frontmatters, we fold
// every variant to one canonical, language-neutral key here and resolve a
// localized display label at render time.

import type { Locale } from "@/i18n/routing";

// Language frontmatter tags — metadata, not topics. Filtered out of the UI.
const LANGUAGE_TAGS = new Set(["pt-br", "en"]);

// variant (lowercased) -> canonical key
const CATEGORY_ALIASES: Record<string, string> = {
  "engenharia-de-software": "software-engineering",
  desenvolvimento: "development",
  miscelânea: "miscellaneous",
  miscelanea: "miscellaneous",
  js: "javascript",
  "next.js": "nextjs",
  databases: "database",
  carreira: "career",
  arquitetura: "architecture",
  infraestrutura: "infrastructure",
  aprendizado: "learning",
  validacao: "validation",
  validação: "validation",
  produtividade: "productivity",
  "boas-praticas": "best-practices",
  "boas-práticas": "best-practices",
};

// Localized labels for canonical keys. Tech keys fall back to a prettified
// slug (the pill styles uppercase it), so only list keys that need a
// translation or special punctuation.
const CATEGORY_LABELS: Record<string, Record<Locale, string>> = {
  "software-engineering": { "pt-BR": "Engenharia de Software", en: "Software Engineering" },
  development: { "pt-BR": "Desenvolvimento", en: "Development" },
  miscellaneous: { "pt-BR": "Miscelânea", en: "Miscellaneous" },
  career: { "pt-BR": "Carreira", en: "Career" },
  architecture: { "pt-BR": "Arquitetura", en: "Architecture" },
  infrastructure: { "pt-BR": "Infraestrutura", en: "Infrastructure" },
  learning: { "pt-BR": "Aprendizado", en: "Learning" },
  validation: { "pt-BR": "Validação", en: "Validation" },
  productivity: { "pt-BR": "Produtividade", en: "Productivity" },
  "best-practices": { "pt-BR": "Boas Práticas", en: "Best Practices" },
  tools: { "pt-BR": "Ferramentas", en: "Tools" },
  books: { "pt-BR": "Livros", en: "Books" },
  database: { "pt-BR": "Banco de Dados", en: "Database" },
  "knowledge-management": { "pt-BR": "Gestão de Conhecimento", en: "Knowledge Management" },
  nextjs: { "pt-BR": "Next.js", en: "Next.js" },
  nodejs: { "pt-BR": "Node.js", en: "Node.js" },
};

export function isLanguageTag(raw: string): boolean {
  return LANGUAGE_TAGS.has(raw.trim().toLowerCase());
}

export function normalizeCategory(raw: string): string {
  const key = raw.trim().toLowerCase();
  return CATEGORY_ALIASES[key] ?? key;
}

// Folds a post's categories to canonical keys: drops language tags and
// duplicates while preserving first-seen order.
export function normalizeCategories(raw: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const c of raw) {
    if (isLanguageTag(c)) continue;
    const key = normalizeCategory(c);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(key);
  }
  return out;
}

export function categoryLabel(canonical: string, locale: Locale): string {
  const entry = CATEGORY_LABELS[canonical];
  if (entry) return entry[locale] ?? entry.en;
  return canonical.replace(/-/g, " ");
}
