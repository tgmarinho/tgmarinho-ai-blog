import { readFileSync } from "node:fs";
import path from "node:path";
import Fuse from "fuse.js";
import { journal } from "#site/content";
import { allPosts } from "@/lib/all-posts";
import { projects } from "@/lib/projects";
import { localizedUrl } from "@/lib/seo";
import { getPostLanguage, isPostVisible } from "@/lib/posts-i18n";
import type { Locale } from "@/i18n/routing";
import enMessages from "../../../messages/en.json";
import ptMessages from "../../../messages/pt-BR.json";

export type PublicCorpusKind = "about" | "cv" | "project" | "post" | "journal";

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
const PROFILE_DOC_DATE = "2026-06-18";
const KIND_SCORE_BOOST: Record<PublicCorpusKind, number> = {
  about: 0,
  cv: 0.3,
  project: 0.1,
  post: 0,
  journal: 0,
};
const COMPILED_MDX_MARKERS = [
  "function _createMdxContent",
  "arguments[0]",
  "jsxDEV",
  "Fragment",
];
const SEARCH_STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "as",
  "about",
  "do",
  "does",
  "he",
  "him",
  "it",
  "know",
  "knows",
  "marinho",
  "of",
  "on",
  "or",
  "sobre",
  "the",
  "what",
  "with",
  "thiago",
  "trabalha",
  "trabalhou",
  "ele",
  "ela",
  "que",
  "sabe",
  "tem",
  "uma",
  "uns",
  "das",
  "dos",
  "com",
  "por",
  "para",
]);

const aboutDocuments: Record<
  Locale,
  {
    title: string;
    description: string;
    categories: string[];
    text: string;
  }
> = {
  "pt-BR": {
    title: "Sobre Thiago Marinho",
    description:
      "AI Product Engineer com 12+ anos em web, mobile, IA, Web3 e sistemas em produção.",
    categories: [
      "TypeScript",
      "React",
      "Next.js",
      "React Native",
      "Node.js",
      "RAG",
      "AI Agents",
      "PostgreSQL",
      "MongoDB",
      "Vercel",
    ],
    text: [
      "Thiago Marinho é AI Product Engineer do Brasil.",
      "Tem 12+ anos construindo sistemas web, mobile, IA e Web3.",
      "Habilidades públicas no about: TypeScript, JavaScript, SQL, GraphQL, React, Next.js, React Native, Node.js, Prisma, PostgreSQL, MongoDB, Redis, pgvector, AWS, Vercel, Cloudflare, Firebase, Docker e Turborepo.",
      "Foco atual: sistemas agênticos, LLMs, RAG, agentes de IA, MCP, eval loops e spec-driven development.",
      "O about também cita experiência em saúde, fintech, Web3 e plataformas de eventos.",
    ].join("\n"),
  },
  en: {
    title: "About Thiago Marinho",
    description:
      "AI Product Engineer with 12+ years across web, mobile, AI, Web3, and production systems.",
    categories: [
      "TypeScript",
      "React",
      "Next.js",
      "React Native",
      "Node.js",
      "RAG",
      "AI Agents",
      "PostgreSQL",
      "MongoDB",
      "Vercel",
    ],
    text: [
      "Thiago Marinho is an AI Product Engineer from Brazil.",
      "He has 12+ years building web, mobile, AI, and Web3 systems.",
      "Public about skills: TypeScript, JavaScript, SQL, GraphQL, React, Next.js, React Native, Node.js, Prisma, PostgreSQL, MongoDB, Redis, pgvector, AWS, Vercel, Cloudflare, Firebase, Docker, and Turborepo.",
      "Current focus: agentic systems, LLMs, RAG, AI agents, MCP, eval loops, and spec-driven development.",
      "The about page also mentions experience in healthcare, fintech, Web3, and event platforms.",
    ].join("\n"),
  },
};

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

function readPublicMarkdown(filename: string): string {
  try {
    return readFileSync(path.join(process.cwd(), "public", "content", filename), "utf8");
  } catch {
    return "";
  }
}

function searchTerms(query: string): string[] {
  return query
    .toLowerCase()
    .split(/\s+/)
    .map((term) => term.replace(/[^\p{L}\p{N}.+#-]/gu, ""))
    .filter((term) => term.length > 2 && !SEARCH_STOP_WORDS.has(term));
}

function isProfileIntent(query: string): boolean {
  const normalized = query.toLowerCase();
  return (
    /\b(quem|who|about|sobre|perfil|profile)\b/.test(normalized) &&
    /\b(thiago|marinho)\b/.test(normalized)
  );
}

function literalScore(doc: PublicCorpusDocument, terms: string[]): number {
  const title = doc.title.toLowerCase();
  const description = doc.description.toLowerCase();
  const categories = doc.categories.join(" ").toLowerCase();
  const text = doc.text.toLowerCase();

  return terms.reduce((score, term) => {
    const exact = new RegExp(`(^|\\W)${escapeRegExp(term)}($|\\W)`, "i");
    if (exact.test(title)) return score + 8;
    if (exact.test(description)) return score + 6;
    if (exact.test(categories)) return score + 5;
    if (exact.test(text)) return score + 2;
    if (title.includes(term)) return score + 5;
    if (description.includes(term)) return score + 4;
    if (categories.includes(term)) return score + 3;
    if (text.includes(term)) return score + 1;
    return score;
  }, 0);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function projectDescription(locale: Locale, key: string): string {
  const items =
    locale === "en" ? enMessages.projects.items : ptMessages.projects.items;
  const item = items[key as keyof typeof items];
  return item?.description ?? "";
}

function buildAboutDocuments(): PublicCorpusDocument[] {
  return Object.entries(aboutDocuments).map(([locale, doc]) => {
    const typedLocale = locale as Locale;
    return {
      id: `about:${typedLocale}`,
      kind: "about",
      locale: typedLocale,
      title: doc.title,
      description: doc.description,
      date: PROFILE_DOC_DATE,
      url: localizedUrl(typedLocale, "/about"),
      categories: doc.categories,
      text: compactText(
        [doc.title, doc.description, doc.categories.join(", "), doc.text].join("\n")
      ),
    };
  });
}

function buildProjectDocuments(): PublicCorpusDocument[] {
  return projects.flatMap((project) =>
    (["pt-BR", "en"] as const).map((locale) => {
      const description = compactText(projectDescription(locale, project.key));
      return {
        id: `project:${locale}:${project.key}`,
        kind: "project",
        locale,
        title: project.title,
        description,
        date: project.year,
        url: localizedUrl(locale, "/projects"),
        categories: project.tags,
        text: compactText(
          [
            project.title,
            description,
            project.status,
            project.group,
            project.year,
            project.tags.join(", "),
            project.github,
            project.live,
          ].join("\n")
        ),
      };
    })
  );
}

function cvSectionTitle(section: string, index: number, locale: Locale): string {
  if (section.includes("SwitchCare")) {
    return locale === "en"
      ? "Popstand / SwitchCare (TypeScript, React Native)"
      : "Popstand / SwitchCare (TypeScript, React Native)";
  }

  if (section.includes("### iTOP")) {
    return "iTOP (Next.js, TypeScript)";
  }

  if (section.includes("Unicrow")) {
    return "Unicrow (TypeScript SDK, GraphQL, PostgreSQL)";
  }

  if (
    section.includes("Technical Skills") ||
    section.includes("Habilidades Técnicas")
  ) {
    return locale === "en"
      ? "Technical Skills (TypeScript, React, React Native, Node.js)"
      : "Habilidades Técnicas (TypeScript, React, React Native, Node.js)";
  }

  const heading = section.match(/^#{2,3}\s+(.+)$/m)?.[1];
  if (heading) return compactText(heading);
  return locale === "en" ? `CV section ${index + 1}` : `Seção do CV ${index + 1}`;
}

function buildCvDocuments(): PublicCorpusDocument[] {
  return [
    { locale: "pt-BR" as const, filename: "cv_pt.md" },
    { locale: "en" as const, filename: "cv.md" },
  ].flatMap(({ locale, filename }) => {
    const markdown = readPublicMarkdown(filename);
    if (!markdown) return [];

    return markdown
      .replace(/\r\n/g, "\n")
      .split(/\n(?=#{2,3}\s)/g)
      .map((section, index): PublicCorpusDocument => {
        const title = cvSectionTitle(section, index, locale);
        const description =
          locale === "en"
            ? "Public CV section with Thiago Marinho's experience, skills, projects, and career evidence."
            : "Seção do currículo público com experiência, habilidades, projetos e evidências de carreira de Thiago Marinho.";

        return {
          id: `cv:${locale}:${index}`,
          kind: "cv",
          locale,
          title: `CV: ${title}`,
          description,
          date: PROFILE_DOC_DATE,
          url: localizedUrl(locale, "/cv"),
          categories: ["CV", "Experience", "Skills", "Career"],
          text: compactText([title, description, section].join("\n")),
        };
      });
  });
}

function diversifyByKind(
  results: PublicCorpusSearchResult[],
  limit: number
): PublicCorpusSearchResult[] {
  const selected: PublicCorpusSearchResult[] = [];
  const deferred: PublicCorpusSearchResult[] = [];
  const counts = new Map<PublicCorpusKind, number>();
  const maxPerKind = 2;

  for (const result of results) {
    const kind = result.document.kind;
    const current = counts.get(kind) ?? 0;

    if (current < maxPerKind) {
      selected.push(result);
      counts.set(kind, current + 1);
    } else {
      deferred.push(result);
    }

    if (selected.length === limit) return selected;
  }

  return [...selected, ...deferred].slice(0, limit);
}

function excerptAroundQuery(text: string, query: string): string {
  const clean = compactText(text);
  if (clean.length <= MAX_EXCERPT_LENGTH) return clean;

  const terms = searchTerms(query);

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
    .filter((post) => isPostVisible(post))
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

  const profileDocs = [
    ...buildAboutDocuments(),
    ...buildCvDocuments(),
    ...buildProjectDocuments(),
  ];

  corpusCache = [...profileDocs, ...posts, ...entries].sort((a, b) =>
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
  const terms = searchTerms(cleanQuery);
  const byId = new Map<string, PublicCorpusSearchResult>();
  const sameLocale: PublicCorpusSearchResult[] = [];
  const otherLocale: PublicCorpusSearchResult[] = [];

  for (const result of fuse.search(cleanQuery, { limit: limit * 3 })) {
    const item = result.item;
    const mapped = {
      document: item,
      score: 1 - (result.score ?? 1),
      excerpt: excerptAroundQuery(item.text, cleanQuery),
    };

    byId.set(item.id, mapped);
  }

  if (terms.length > 0) {
    for (const document of getPublicCorpus()) {
      const score = literalScore(document, terms);
      if (score === 0) continue;

      const existing = byId.get(document.id);
      const mapped = {
        document,
        score: Math.max(existing?.score ?? 0, Math.min(0.98, 0.5 + score / 20)),
        excerpt: excerptAroundQuery(document.text, cleanQuery),
      };

      byId.set(document.id, mapped);
    }
  }

  if (isProfileIntent(cleanQuery)) {
    for (const document of getPublicCorpus()) {
      if (document.kind !== "about" && document.kind !== "cv") continue;
      if (
        document.kind === "cv" &&
        !/(resumo|summary|objetivos|goals)/i.test(document.title)
      ) {
        continue;
      }

      const profileScore = document.kind === "about" ? 0.99 : 0.66;
      const existing = byId.get(document.id);
      byId.set(document.id, {
        document,
        score: Math.max(existing?.score ?? 0, profileScore),
        excerpt: excerptAroundQuery(document.text, cleanQuery),
      });
    }
  }

  const merged = Array.from(byId.values()).sort(
    (a, b) =>
      b.score +
      KIND_SCORE_BOOST[b.document.kind] -
      (a.score + KIND_SCORE_BOOST[a.document.kind])
  );

  for (const result of merged) {
    if (result.document.locale === locale) sameLocale.push(result);
    else otherLocale.push(result);
  }

  const diversifiedSameLocale = diversifyByKind(sameLocale, limit);
  if (diversifiedSameLocale.length === limit) return diversifiedSameLocale;

  return [
    ...diversifiedSameLocale,
    ...diversifyByKind(otherLocale, limit - diversifiedSameLocale.length),
  ].slice(0, limit);
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
