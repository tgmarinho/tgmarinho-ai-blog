#!/usr/bin/env node
// Audits all MDX posts for broken image references (local paths that don't
// resolve under public/ or content/posts/) and reports them.

import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const POSTS_DIR = "content/posts";
const PUBLIC_DIR = "public";

const issues = [];

function resolveLocal(ref) {
  // Strip query/hash
  ref = ref.split("?")[0].split("#")[0];
  if (!ref || ref.startsWith("http://") || ref.startsWith("https://")) {
    return { type: "external", ok: true };
  }
  if (ref.startsWith("data:") || ref.startsWith("mailto:")) {
    return { type: "scheme", ok: true };
  }
  if (ref.startsWith("/")) {
    // Absolute → public/
    const p = join(PUBLIC_DIR, ref);
    return { type: "abs", ok: existsSync(p), tried: p };
  }
  if (ref.startsWith("./") || ref.startsWith("../") || /^[a-z]/i.test(ref)) {
    // Relative → resolved against content/posts/ (Velite quirk)
    const p = ref.startsWith("./") ? ref.slice(2) : ref;
    const tried = join(POSTS_DIR, p);
    return { type: "rel", ok: existsSync(tried), tried };
  }
  return { type: "unknown", ok: false };
}

const imgRegex = /!\[[^\]]*\]\(([^)\s]+)/g;
const linkRegex = /(?<!!)\[[^\]]+\]\(([^)\s]+)/g;
const htmlImgRegex = /<img[^>]+src=["']([^"']+)/g;

for (const file of readdirSync(POSTS_DIR)) {
  if (!file.endsWith(".mdx")) continue;
  const raw = readFileSync(join(POSTS_DIR, file), "utf8");
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) continue;
  const fm = m[1];
  const body = m[2];

  // Frontmatter image
  const fmImg = fm.match(/^image:\s*"?([^"\n]+)"?/m)?.[1]?.trim();
  if (fmImg) {
    const r = resolveLocal(fmImg);
    if (!r.ok && r.type !== "external" && r.type !== "scheme") {
      issues.push({ file, kind: "frontmatter:image", ref: fmImg, type: r.type, tried: r.tried });
    }
  }

  // Body: markdown images
  let match;
  imgRegex.lastIndex = 0;
  while ((match = imgRegex.exec(body)) !== null) {
    const ref = match[1];
    const r = resolveLocal(ref);
    if (!r.ok && r.type !== "external" && r.type !== "scheme") {
      issues.push({ file, kind: "body:image", ref, type: r.type, tried: r.tried });
    }
  }

  // Body: HTML img tags
  htmlImgRegex.lastIndex = 0;
  while ((match = htmlImgRegex.exec(body)) !== null) {
    const ref = match[1];
    const r = resolveLocal(ref);
    if (!r.ok && r.type !== "external" && r.type !== "scheme") {
      issues.push({ file, kind: "body:html-img", ref, type: r.type, tried: r.tried });
    }
  }

  // Body: regular markdown links (non-image)
  linkRegex.lastIndex = 0;
  while ((match = linkRegex.exec(body)) !== null) {
    const ref = match[1];
    if (ref.startsWith("#")) continue;
    const r = resolveLocal(ref);
    if (!r.ok && r.type !== "external" && r.type !== "scheme") {
      issues.push({ file, kind: "body:link", ref, type: r.type, tried: r.tried });
    }
  }
}

if (issues.length === 0) {
  console.log("✓ no broken local refs found");
  process.exit(0);
}

const byFile = {};
for (const i of issues) (byFile[i.file] ??= []).push(i);

for (const [file, list] of Object.entries(byFile)) {
  console.log(`\n${file}`);
  for (const i of list) {
    console.log(`  [${i.kind}] ${i.ref}  →  ${i.tried ?? "?"}`);
  }
}
console.log(`\nTotal: ${issues.length} broken refs across ${Object.keys(byFile).length} files`);
