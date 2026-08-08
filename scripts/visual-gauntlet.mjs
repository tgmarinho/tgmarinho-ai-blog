#!/usr/bin/env node
/**
 * Visual QA gauntlet.
 *
 * Screenshots the site's key routes across a set of breakpoints so visual
 * regressions are easy to eyeball (or diff) before shipping. Output goes to
 * `.gauntlet/<timestamp>/<route>__<breakpoint>.png` (gitignored).
 *
 * Usage:
 *   bun visual:gauntlet                  # against http://localhost:3000
 *   BASE_URL=http://localhost:3001 bun visual:gauntlet
 *   bun visual:gauntlet --routes /,/blog # only these routes
 *
 * Requires the dev/prod server to be running and Playwright's chromium
 * (`bunx playwright install chromium`).
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";

// Note: /ask is feature-flagged (NEXT_PUBLIC_FF_ASK_ENABLED); add it with
// `--routes /ask` when the flag is on.
const DEFAULT_ROUTES = [
  "/",
  "/blog",
  "/projects",
  "/about",
  "/cv",
  "/community",
  "/contact",
];

const BREAKPOINTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
];

function parseRoutes() {
  const flagIndex = process.argv.indexOf("--routes");
  if (flagIndex !== -1 && process.argv[flagIndex + 1]) {
    return process.argv[flagIndex + 1]
      .split(",")
      .map((r) => r.trim())
      .filter(Boolean);
  }
  return DEFAULT_ROUTES;
}

function slugForRoute(route) {
  const clean = route.replace(/^\/+|\/+$/g, "");
  return clean === "" ? "home" : clean.replace(/\//g, "_");
}

// A stable-ish folder name without Date.now(): use the ISO minute.
function runStamp() {
  return new Date().toISOString().replace(/[:.]/g, "-").slice(0, 16);
}

async function main() {
  const routes = parseRoutes();
  const outDir = resolve(process.cwd(), ".gauntlet", runStamp());
  await mkdir(outDir, { recursive: true });

  console.log(`[gauntlet] base: ${BASE_URL}`);
  console.log(`[gauntlet] output: ${outDir}`);
  console.log(
    `[gauntlet] ${routes.length} routes x ${BREAKPOINTS.length} breakpoints\n`
  );

  const browser = await chromium.launch();
  const failures = [];
  let shot = 0;

  try {
    for (const bp of BREAKPOINTS) {
      const context = await browser.newContext({
        viewport: { width: bp.width, height: bp.height },
        deviceScaleFactor: 2,
        colorScheme: "dark",
        reducedMotion: "reduce",
      });
      const page = await context.newPage();

      for (const route of routes) {
        const url = `${BASE_URL}${route}`;
        const file = resolve(outDir, `${slugForRoute(route)}__${bp.name}.png`);
        try {
          const response = await page.goto(url, {
            waitUntil: "networkidle",
            timeout: 30_000,
          });
          const status = response?.status() ?? 0;
          if (status >= 400) {
            failures.push(`${route} [${bp.name}] → HTTP ${status}`);
          }
          // Let entrance animations settle before capturing.
          await page.waitForTimeout(600);
          await page.screenshot({ path: file, fullPage: true });
          shot += 1;
          console.log(`  ✓ ${route} [${bp.name}] (HTTP ${status})`);
        } catch (error) {
          failures.push(`${route} [${bp.name}] → ${error.message}`);
          console.log(`  ✗ ${route} [${bp.name}] → ${error.message}`);
        }
      }

      await context.close();
    }
  } finally {
    await browser.close();
  }

  console.log(`\n[gauntlet] captured ${shot} screenshots → ${outDir}`);

  if (failures.length) {
    console.error(`\n[gauntlet] ${failures.length} issue(s):`);
    for (const f of failures) console.error(`  - ${f}`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(
    "[gauntlet] fatal:",
    error instanceof Error ? error.message : error
  );
  console.error(
    "[gauntlet] is the server running? did you run `bunx playwright install chromium`?"
  );
  process.exit(1);
});
