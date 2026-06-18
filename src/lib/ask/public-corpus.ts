import Fuse from "fuse.js";
import { journal } from "#site/content";
import { allPosts } from "@/lib/all-posts";
import { localizedUrl } from "@/lib/seo";
import { getPostLanguage } from "@/lib/posts-i18n";
import type { Locale } from "@/i18n/routing";

export type PublicCorpusKind = "post" | "journal";

export type PublicCorpusDocument = {
  id: string;
  kind: PublicCorpusKind;
  locale: Locale;
  title: string;
  description: string;
  date: string;
  url: string;
  categories: string[];
  text: string;
};

export type PublicCorpusSearchResult = {
  document: PublicCorpusDocument;
  score: number;
  excerpt: string;
};

const MAX_EXCERPT_LENGTH = 520;
const COMPILED_MDX_MARKERS = [
  "function _createMdxContent",
  "arguments[0]",
  "jsxDEV",
  "Fragment",
];

function compactText(value: string | undefined): string {
  return (value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isCompiledMdx(value: string): boolean {
  return COMPILED_MDX_MARKERS.some((marker) => value.includes(marker));
}

function safePublishedBody(value: string | undefined): string {
  const clean = compactText(value);
  return clean && !isCompiledMdx(clean) ? clean : "";
}

function excerptAroundQuery(text: string, query: string): string {
  const clean = compactText(text);
  if (clean.length <= MAX_EXCERPT_LENGTH) return clean;

  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .map((term) => term.replace(/[^\p{L}\p{N}]/gu, ""))
    .filter((term) => term.length > 3);

  const lower = clean.toLowerCase();
  const firstHit = terms
    .map((term) => lower.indexOf(term))
    .filter((index) => index >= 0)
    .sort((a, b) => a - b)[0];

  const start = Math.max(0, (firstHit ?? 0) - 160);
  const end = Math.min(clean.length, start + MAX_EXCERPT_LENGTH);
  const prefix = start > 0 ? "... " : "";
  const suffix = end < clean.length ? " ..." : "";

  return `${prefix}${clean.slice(start, end).trim()}${suffix}`;
}

let corpusCache: PublicCorpusDocument[] | null = null;
let fuseCache: Fuse<PublicCorpusDocument> | null = null;

export function getPublicCorpus(): PublicCorpusDocument[] {
  if (corpusCache) return corpusCache;

  const posts = allPosts
    .filter((post) => post.published)
    .map((post): PublicCorpusDocument => {
      const locale = getPostLanguage(post);
      const description = compactText(post.description);
      const body = safePublishedBody(post.plainBody);
      return {
        id: `post:${locale}:${post.slug}`,
        kind: "post",
        locale,
        title: post.title,
        description,
        date: post.date,
        url: localizedUrl(locale, `/blog/${post.slug}`),
        categories: post.categories ?? [],
        text: compactText(
          [post.title, description, post.categories?.join(", "), body].join("\n")
        ),
      };
    });

  const entries = journal.map((entry): PublicCorpusDocument => {
    const locale = entry.language;
    const description = compactText(entry.summary);
    const body = safePublishedBody(entry.plainBody);
    return {
      id: `journal:${locale}:${entry.slug}`,
      kind: "journal",
      locale,
      title: entry.title,
      description,
      date: entry.date,
      url: localizedUrl(locale, `/daily/${entry.slug}`),
      categories: entry.repos ?? [],
      text: compactText(
        [entry.title, description, entry.repos?.join(", "), body].join("\n")
      ),
    };
  });

  corpusCache = [...posts, ...entries].sort((a, b) =>
    a.date < b.date ? 1 : -1
  );

  return corpusCache;
}

function getFuse(): Fuse<PublicCorpusDocument> {
  if (fuseCache) return fuseCache;

  fuseCache = new Fuse(getPublicCorpus(), {
    includeScore: true,
    ignoreLocation: true,
    threshold: 0.42,
    keys: [
      { name: "title", weight: 0.42 },
      { name: "description", weight: 0.24 },
      { name: "categories", weight: 0.16 },
      { name: "text", weight: 0.18 },
    ],
  });

  return fuseCache;
}

export function searchPublicCorpus(
  query: string,
  locale: Locale,
  limit = 6
): PublicCorpusSearchResult[] {
  const cleanQuery = compactText(query);
  if (!cleanQuery) return [];

  const fuse = getFuse();
  const sameLocale: PublicCorpusSearchResult[] = [];
  const otherLocale: PublicCorpusSearchResult[] = [];

  for (const result of fuse.search(cleanQuery, { limit: limit * 3 })) {
    const item = result.item;
    const mapped = {
      document: item,
      score: 1 - (result.score ?? 1),
      excerpt: excerptAroundQuery(item.text, cleanQuery),
    };

    if (item.locale === locale) sameLocale.push(mapped);
    else otherLocale.push(mapped);
  }

  return [...sameLocale, ...otherLocale].slice(0, limit);
}

export function buildGroundingContext(
  results: PublicCorpusSearchResult[]
): string {
  return results
    .map((result, index) => {
      const doc = result.document;
      return [
        `[${index + 1}] ${doc.title}`,
        `Type: ${doc.kind}`,
        `Language: ${doc.locale}`,
        `Date: ${doc.date.slice(0, 10)}`,
        `URL: ${doc.url}`,
        `Excerpt: ${result.excerpt}`,
      ].join("\n");
    })
    .join("\n\n");
}
