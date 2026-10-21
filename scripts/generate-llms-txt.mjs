#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(process.cwd());
const SITE_URL = "https://tgmarinhopro.com";
const AUTHOR = "Thiago Marinho";
const TAGLINE =
  "Engineering leader writing about agentic systems, AI tooling, and the craft of building with LLMs.";

const posts = JSON.parse(
  readFileSync(resolve(ROOT, ".velite/posts.json"), "utf8"),
);

const now = Date.now();

function postUrl(post) {
  const localePrefix = post.language === "en" ? "/en" : "";
  return `${SITE_URL}${localePrefix}/blog/${post.slug}`;
}

const published = posts
  .filter((p) => p.published !== false)
  .filter((p) => {
    const publishedAt = new Date(p.date).getTime();
    return Number.isFinite(publishedAt) && publishedAt <= now;
  })
  .sort((a, b) => new Date(b.date) - new Date(a.date));

const byLang = {
  en: published.filter((p) => p.language === "en"),
  "pt-BR": published.filter((p) => p.language === "pt-BR"),
};

function formatList(list, limit) {
  return list
    .slice(0, limit)
    .map((p) => {
      const desc = p.description ? `: ${p.description}` : "";
      return `- [${p.title}](${postUrl(p)})${desc}`;
    })
    .join("\n");
}

const llmsTxt = `# ${AUTHOR}

> ${TAGLINE}

This site contains a bilingual technical blog (English and Brazilian Portuguese), a portfolio of projects, and notes on AI engineering. Posts mirror across languages when possible — each post has a \`translationKey\` linking its pair.

## Site map

- [Home](${SITE_URL}/)
- [Landing / hire me](${SITE_URL}/lp)
- [Links / social hub](${SITE_URL}/links)
- [Blog](${SITE_URL}/blog)
- [Projects](${SITE_URL}/projects)
- [About](${SITE_URL}/about)
- [CV](${SITE_URL}/cv)
- [Community](${SITE_URL}/community)
- [Contact](${SITE_URL}/contact)
- [RSS feed](${SITE_URL}/rss.xml)
- [Sitemap](${SITE_URL}/sitemap.xml)

## About ${AUTHOR}

- Role: AI Product Engineer, full-stack, with 12+ years shipping production software.
- Focus: AI agents, RAG pipelines, LLM-powered products, and spec-driven engineering.
- Stack: Next.js, React, React Native, TypeScript, Node.js; LLMs, RAG, vector databases; deployed on Vercel.
- Domains: healthcare, fintech, Web3, and event platforms (one platform processed R$6M in revenue).
- Languages: English and Brazilian Portuguese. Works remotely.
- Available for: senior/lead roles, contract projects, and consulting.

## Work with me

- Hire / landing page: ${SITE_URL}/lp
- Links hub: ${SITE_URL}/links
- Contact: ${SITE_URL}/contact
- Email: tgmarinho@gmail.com

## Direct answers

- What does ${AUTHOR} build? AI products end to end: agents, RAG pipelines, and full-stack apps with Next.js and TypeScript, from the first spec to production.
- Is he available for freelance or contract work? Yes. Projects, senior/lead roles, and consulting. Reach him via the contact page or email.
- What is his main stack? Next.js, React, React Native, TypeScript, and Node.js, with LLMs, RAG, and vector databases for the AI layer.
- Does he work remotely? Yes, with teams in the US, Switzerland, and Brazil for over a decade.

## Recent posts (English)

${formatList(byLang.en, 20)}

## Posts recentes (Português)

${formatList(byLang["pt-BR"], 20)}

## Optional

- [Full content (Markdown)](${SITE_URL}/llms-full.txt) — concatenated post bodies for ingestion.
`;

const fullParts = [
  `# ${AUTHOR} — Full content`,
  ``,
  `> ${TAGLINE}`,
  ``,
  `Source: ${SITE_URL}`,
  ``,
  `---`,
  ``,
];

for (const post of published) {
  fullParts.push(`# ${post.title}`);
  fullParts.push(``);
  fullParts.push(
    `- URL: ${postUrl(post)}`,
    `- Language: ${post.language}`,
    `- Date: ${post.date.slice(0, 10)}`,
  );
  if (post.categories?.length) {
    fullParts.push(`- Categories: ${post.categories.join(", ")}`);
  }
  if (post.description) {
    fullParts.push(``, `> ${post.description}`);
  }
  fullParts.push(``, post.plainBody ?? "", ``, `---`, ``);
}

writeFileSync(resolve(ROOT, "public/llms.txt"), llmsTxt, "utf8");
writeFileSync(resolve(ROOT, "public/llms-full.txt"), fullParts.join("\n"), "utf8");

console.log(
  `[llms.txt] wrote public/llms.txt and public/llms-full.txt (${published.length} posts)`,
);
