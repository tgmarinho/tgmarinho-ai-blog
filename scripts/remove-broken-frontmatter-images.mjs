#!/usr/bin/env node
// Removes frontmatter `image:` lines from MDX posts whose target asset
// does not exist under public/. External URLs (http/https) are kept.
// Idempotent.

import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const POSTS_DIR = "content/posts";
const PUBLIC_DIR = "public";

function isExternal(ref) {
  return /^(https?:|data:|mailto:)/.test(ref);
}

function resolves(ref) {
  ref = ref.split("?")[0].split("#")[0];
  if (isExternal(ref)) return true;
  const path = ref.startsWith("/") ? join(PUBLIC_DIR, ref) : join(POSTS_DIR, ref.replace(/^\.\//, ""));
  return existsSync(path);
}

const files = readdirSync(POSTS_DIR).filter((f) => f.endsWith(".mdx"));
let removed = 0;
const offenders = [];

for (const file of files) {
  const path = join(POSTS_DIR, file);
  const raw = readFileSync(path, "utf8");
  const m = raw.match(/^(---\n)([\s\S]*?)(\n---\n[\s\S]*)$/);
  if (!m) continue;

  const fm = m[2];
  const imgMatch = fm.match(/^image:\s*"?([^"\n]+)"?$/m);
  if (!imgMatch) continue;

  const ref = imgMatch[1].trim();
  if (resolves(ref)) continue;

  const newFm = fm
    .split("\n")
    .filter((line) => !/^image:\s*"?[^"\n]+"?$/.test(line))
    .join("\n");

  writeFileSync(path, m[1] + newFm + m[3]);
  removed++;
  offenders.push({ file, ref });
}

console.log(`Removed image: from ${removed} files`);
for (const o of offenders.slice(0, 10)) console.log(`  - ${o.file}  (was: ${o.ref})`);
if (offenders.length > 10) console.log(`  ... and ${offenders.length - 10} more`);
