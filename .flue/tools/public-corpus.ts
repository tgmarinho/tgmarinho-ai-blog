import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { defineTool } from "@flue/runtime";
import * as v from "valibot";

type Source = {
  title: string;
  url: string;
  language: string;
  excerpt: string;
};

const ROOT = resolve(process.cwd());
const MAX_RESULTS = 6;

function compactText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function loadPublicContent(): Source[] {
  const full = readFileSync(resolve(ROOT, "public/llms-full.txt"), "utf8");
  const sections = full.split(/\n---\n/g);

  const posts = sections
    .map((section): Source | null => {
      const title = section.match(/^#\s+(.+)$/m)?.[1]?.trim();
      const url = section.match(/^- URL:\s+(.+)$/m)?.[1]?.trim();
      const language = section.match(/^- Language:\s+(.+)$/m)?.[1]?.trim();
      if (!title || !url || !language) return null;

      return {
        title,
        url,
        language,
        excerpt: compactText(section).slice(0, 1200),
      };
    })
    .filter((source): source is Source => Boolean(source));

  return [...posts, ...loadJournalContent()];
}

function loadJournalContent(): Source[] {
  const base = resolve(ROOT, "content/journal");
  if (!existsSync(base)) return [];

  return readdirSync(base, { withFileTypes: true }).flatMap((localeDir) => {
    if (!localeDir.isDirectory()) return [];

    const language = localeDir.name;
    const dir = join(base, language);

    return readdirSync(dir, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
      .map((entry): Source | null => {
        const slug = entry.name.replace(/\.md$/i, "");
        const raw = readFileSync(join(dir, entry.name), "utf8");
        const title = raw.match(/^title:\s+"(.+)"$/m)?.[1];
        const summary = raw.match(/^summary:\s+"(.+)"$/m)?.[1] ?? "";
        const body = raw.replace(/^---[\s\S]*?---/, "");
        if (!title) return null;

        return {
          title,
          url:
            language === "en"
              ? `https://tgmarinhopro.com/en/daily/${slug}`
              : `https://tgmarinhopro.com/daily/${slug}`,
          language,
          excerpt: compactText(`${title}. ${summary}. ${body}`).slice(0, 1200),
        };
      })
      .filter((source): source is Source => Boolean(source));
  });
}

function score(source: Source, terms: string[]): number {
  const haystack = `${source.title} ${source.excerpt}`.toLowerCase();
  return terms.reduce((total, term) => total + (haystack.includes(term) ? 1 : 0), 0);
}

export const searchPublicCorpus = defineTool({
  name: "search_public_corpus",
  description:
    "Search Thiago Marinho's public website corpus from public/llms-full.txt. Returns only public URLs and excerpts.",
  parameters: v.object({
    query: v.pipe(v.string(), v.minLength(3)),
    language: v.optional(v.picklist(["pt-BR", "en"])),
  }),
  execute: async ({ query, language }) => {
    const terms = query
      .toLowerCase()
      .split(/\s+/)
      .map((term) => term.replace(/[^\p{L}\p{N}]/gu, ""))
      .filter((term) => term.length > 2);

    const results = loadPublicContent()
      .filter((source) => !language || source.language === language)
      .map((source) => ({ source, score: score(source, terms) }))
      .filter((result) => result.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_RESULTS)
      .map(({ source }, index) => ({
        index: index + 1,
        ...source,
      }));

    return JSON.stringify(results, null, 2);
  },
});
