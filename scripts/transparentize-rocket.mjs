#!/usr/bin/env node
/**
 * One-shot utility: convert a rocket image with a near-black background
 * into a true alpha-channel PNG. Pixels darker than the threshold become
 * fully transparent; brighter pixels get alpha proportional to luminance
 * for soft edge feathering.
 *
 *   node scripts/transparentize-rocket.mjs
 */
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const INPUT = resolve(__dirname, "../public/images/hero/rocket.png");
const OUTPUT = resolve(__dirname, "../public/images/hero/rocket-alpha.png");

// Anything below this luminance becomes fully transparent.
const HARD_CUTOFF = 18;
// Pixels brighter than this become fully opaque. In between → linear alpha.
const FULL_OPAQUE = 60;

async function main() {
  const { data, info } = await sharp(INPUT)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  if (channels !== 4) {
    throw new Error(`Expected 4 channels (RGBA), got ${channels}`);
  }

  const out = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // Perceptual luminance (Rec. 709 weights).
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    let alpha;
    if (lum <= HARD_CUTOFF) {
      alpha = 0;
    } else if (lum >= FULL_OPAQUE) {
      alpha = 255;
    } else {
      alpha = Math.round(((lum - HARD_CUTOFF) / (FULL_OPAQUE - HARD_CUTOFF)) * 255);
    }

    out[i] = r;
    out[i + 1] = g;
    out[i + 2] = b;
    out[i + 3] = alpha;
  }

  await sharp(out, { raw: { width, height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(OUTPUT);

  console.log(`✔ Wrote ${OUTPUT} (${width}x${height})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
