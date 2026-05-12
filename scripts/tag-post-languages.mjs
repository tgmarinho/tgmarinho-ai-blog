#!/usr/bin/env node
// Tags MDX posts in content/posts/*.mdx that are missing `language` and/or
// `translationKey` in their frontmatter. Language is detected from the body
// (PT-BR vs EN by stopword frequency); translationKey is derived from the
// slug, stripping language suffixes. Idempotent — runs against any orphan.

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, basename } from "node:path";

const POSTS_DIR = "content/posts";

const PT_STOPWORDS = [
  "que", "para", "uma", "como", "não", "com", "por", "mais", "está",
  "vamos", "também", "então", "isso", "aqui", "você", "está", "são",
  "ção", "ções", "ões", "ã", "õ",
];
const EN_STOPWORDS = [
  "the", "and", "with", "this", "that", "from", "for", "you", "your",
  "into", "have", "will", "what", "when", "which", "about", "their",
  "there", "here",
];

function detectLanguage(body) {
  const lower = body.toLowerCase();
  let pt = 0;
  let en = 0;
  for (const w of PT_STOPWORDS) {
    const re = new RegExp(`\\b${w}\\b`, "g");
    pt += (lower.match(re) || []).length;
  }
  for (const w of EN_STOPWORDS) {
    const re = new RegExp(`\\b${w}\\b`, "g");
    en += (lower.match(re) || []).length;
  }
  if (pt === 0 && en === 0) return "pt-BR";
  return pt >= en ? "pt-BR" : "en";
}

function slugToTranslationKey(slug) {
  return slug
    .replace(/-pt-br$/i, "")
    .replace(/-en$/i, "")
    .replace(/-ptbr$/i, "")
    .toLowerCase();
}

function parseFrontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return null;
  return { fm: m[1], body: m[2] };
}

function hasField(fm, key) {
  return new RegExp(`^${key}:`, "m").test(fm);
}

function readSlug(fm, file) {
  const m = fm.match(/^slug:\s*"?([^"\n]+)"?/m);
  if (m) return m[1].trim();
  return basename(file, ".mdx");
}

function patchFrontmatter(fm, additions) {
  let out = fm;
  for (const [k, v] of additions) {
    if (!out.endsWith("\n")) out += "\n";
    out += `${k}: "${v}"\n`;
  }
  return out.replace(/\n+$/, "");
}

const files = readdirSync(POSTS_DIR).filter((f) => f.endsWith(".mdx"));
let patched = 0;
let skipped = 0;
const summary = { "pt-BR": 0, en: 0 };

for (const file of files) {
  const path = join(POSTS_DIR, file);
  const raw = readFileSync(path, "utf8");
  const parsed = parseFrontmatter(raw);
  if (!parsed) {
    console.warn(`! no frontmatter: ${file}`);
    continue;
  }

  const hasLang = hasField(parsed.fm, "language");
  const hasKey = hasField(parsed.fm, "translationKey");
  if (hasLang && hasKey) {
    skipped++;
    continue;
  }

  const slug = readSlug(parsed.fm, file);
  const language = hasLang
    ? parsed.fm.match(/^language:\s*"?([^"\n]+)"?/m)?.[1].trim()
    : detectLanguage(parsed.body);
  const translationKey = hasKey
    ? parsed.fm.match(/^translationKey:\s*"?([^"\n]+)"?/m)?.[1].trim()
    : slugToTranslationKey(slug);

  const additions = [];
  if (!hasLang) additions.push(["language", language]);
  if (!hasKey) additions.push(["translationKey", translationKey]);

  const newFm = patchFrontmatter(parsed.fm, additions);
  const output = `---\n${newFm}\n---\n${parsed.body}`;
  writeFileSync(path, output);

  summary[language] = (summary[language] || 0) + 1;
  patched++;
  console.log(`✓ ${file} → language=${language} translationKey=${translationKey}`);
}

console.log(
  `\nDone. patched=${patched} skipped=${skipped} | pt-BR=${summary["pt-BR"]} en=${summary.en}`
);
