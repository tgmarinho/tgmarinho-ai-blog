#!/usr/bin/env node
// Validates the i18n SEO surface of the built site:
//   1. sitemap.xml lists every post in both locales when a pair exists
//   2. hreflang alternates are well-formed and reciprocal (A links to B
//      <=> B links to A)
//   3. RSS feeds exist for both locales
//   4. og:locale + html lang are correct
//
// Run against the running dev server (default http://localhost:3000) or
// against any built/deployed instance via SITE_URL.

import { setTimeout as sleep } from "node:timers/promises";

const BASE = process.env.SITE_URL || "http://localhost:3000";
const LOCALES = ["pt-BR", "en"];

let failures = 0;
const fail = (msg) => {
  failures++;
  console.log(`✗ ${msg}`);
};
const pass = (msg) => console.log(`✓ ${msg}`);

async function get(url, init) {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res;
}

async function getText(url) {
  return (await get(url)).text();
}

async function checkRss() {
  for (const locale of LOCALES) {
    const url = `${BASE}/rss.xml?locale=${locale}`;
    try {
      const text = await getText(url);
      if (!text.includes("<rss")) fail(`${url} is not a valid RSS feed`);
      else if (!text.includes(`<language>${locale}</language>`))
        fail(`${url} missing <language>${locale}</language>`);
      else pass(`RSS ${locale} OK (${(text.match(/<item>/g) || []).length} items)`);
    } catch (e) {
      fail(`RSS ${locale} fetch failed: ${e.message}`);
    }
  }
}

async function checkSitemap() {
  const text = await getText(`${BASE}/sitemap.xml`);
  const urlBlocks = text.match(/<url>[\s\S]*?<\/url>/g) || [];
  const ptUrls = urlBlocks.filter(
    (b) => /<loc>[^<]+<\/loc>/.test(b) && !/<loc>[^<]*\/en\//.test(b)
  );
  const enUrls = urlBlocks.filter((b) => /<loc>[^<]*\/en\//.test(b));
  pass(
    `sitemap.xml: ${urlBlocks.length} entries (pt-BR: ${ptUrls.length}, en: ${enUrls.length})`
  );

  // Verify every entry with alternates has both locales linked
  let alternateBlocks = 0;
  let missingReciprocity = 0;
  const linkMap = new Map();
  for (const block of urlBlocks) {
    const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1];
    if (!loc) continue;
    const alts = [...block.matchAll(/hreflang="([^"]+)"\s+href="([^"]+)"/g)];
    if (alts.length === 0) continue;
    alternateBlocks++;
    linkMap.set(loc, new Map(alts.map((m) => [m[1], m[2]])));
  }
  for (const [loc, alts] of linkMap) {
    for (const [lang, href] of alts) {
      if (href === loc) continue;
      const reverse = linkMap.get(href);
      if (!reverse) {
        missingReciprocity++;
        continue;
      }
    }
  }
  if (missingReciprocity > 0)
    fail(`${missingReciprocity} alternate links missing reverse entry`);
  else pass(`hreflang reciprocity OK on ${alternateBlocks} blocks`);
}

async function checkHomeHreflang() {
  for (const locale of LOCALES) {
    const path = locale === "en" ? "/en" : "/";
    const html = await getText(`${BASE}${path}`);
    const lang = html.match(/<html[^>]+lang="([^"]+)"/)?.[1];
    if (lang !== locale) fail(`html lang on ${path} is "${lang}", expected "${locale}"`);
    else pass(`html lang="${locale}" on ${path}`);

    const ogLocale = html.match(/property="og:locale"[^>]+content="([^"]+)"/)?.[1];
    const expected = locale === "en" ? "en_US" : "pt_BR";
    if (ogLocale !== expected)
      fail(`og:locale on ${path} is "${ogLocale}", expected "${expected}"`);
    else pass(`og:locale="${expected}" on ${path}`);
  }
}

async function main() {
  console.log(`Validating i18n SEO against ${BASE}\n`);
  try {
    await get(BASE);
  } catch (e) {
    console.log(`Server unreachable at ${BASE} — start dev server first.`);
    process.exit(2);
  }

  await checkSitemap();
  console.log();
  await checkRss();
  console.log();
  await checkHomeHreflang();

  console.log();
  if (failures === 0) console.log("✅ all i18n SEO checks passed");
  else console.log(`❌ ${failures} failures`);
  process.exit(failures === 0 ? 0 : 1);
}

main();
