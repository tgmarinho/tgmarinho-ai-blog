---
name: particle-portrait-reveal
description: Builds a canvas hover effect that dissolves between two portraits. At rest one image is crisp; a soft brush follows the cursor, revealing the second image locally with a ring of fine particles that granulate off the edge and stream away (the "Relay" / landonorris.com regeneration look). Framework-agnostic React + Canvas 2D. Use when the user asks for a hover reveal, pixel/particle dissolve, image-morph-on-hover, cursor spotlight between two images, or a "human to agent/robot" portrait effect.
---

# Particle Portrait Reveal

A hover effect where a **crisp base portrait** dissolves, **locally under the cursor**, into a **second portrait**, with a ring of fine particles that break off the moving edge and stream away.
It is the effect used on the hero of this site (`src/components/fx/hero-portrait.tsx`) and modeled on the Relay / landonorris.com "regeneration" look.

The self-contained, parameterized implementation lives in `reference/PortraitReveal.tsx`.
The algorithm, tuning knobs, and the non-obvious bugs that must be handled are in `reference/technique.md`.
**Read `technique.md` before writing or modifying the code** — several details (the resize race, DPR, the offscreen feather, cross-origin tainting) are easy to get wrong and produce a blank or ugly result.

## When to use

Trigger on requests like: hover reveal, pixel/particle dissolve, disintegration, image morph on hover, cursor spotlight/brush between two images, "photo turns into robot/AI/agent", "reveal my face under the cursor", ASCII/dot-matrix portrait dissolve.

## Core idea (one paragraph)

Draw the base image at full resolution so it reads as a real photo (never a tiled/pixelated grid).
Keep a soft circular **brush** at the pointer.
Inside the brush, composite the second image, feathered at its edge so it dissolves into the base.
Only at the **thin ring** on the brush boundary do you draw particles: sample both images onto a grid, and for the cells whose distance to the pointer falls inside the ring, draw small squares that shrink slightly, glow, and stream outward.
Everything else stays the crisp base.
So only the touched region transforms, and it tracks the cursor — it is never a whole-image crossfade.

## Inputs the user must provide

1. **Two images, same pose and framing** — e.g. a photo of a person and an AI/robot version of the same shot.
   Transparent-background PNGs are strongly preferred so the figure dissolves into the page rather than sitting in a rectangle.
   If the user only has one image, offer to generate the second (an "agentic"/robot variant) or to reveal a stylized version.
2. Same-origin (or CORS-enabled) image URLs.
   `getImageData` taints cross-origin canvases and the particle sampling will throw; if the images are remote, they must send `Access-Control-Allow-Origin` and be loaded with `crossOrigin="anonymous"` (the reference already sets this).

## How to apply

1. Copy `reference/PortraitReveal.tsx` into the target project's components.
   It is plain React + Canvas 2D with no dependencies; keep the `"use client"` directive for Next.js App Router.
2. Render it with the two images:
   ```tsx
   <PortraitReveal
     baseSrc="/portrait-agent.png"     // shown at rest
     revealSrc="/portrait-human.png"   // revealed under the cursor
     size={560}
   />
   ```
3. Decide **which image is the base**.
   Base = what shows at rest; reveal = what the cursor uncovers.
   In this repo the agent/robot is the base and the human face is revealed (the user preferred that inversion), but either order works — just swap `baseSrc` / `revealSrc`.
4. Tune to taste with the props (all optional): `brushRadius`, `brushBand`, `grid`, `streamDistance`, `streamAngle`, `streamSpread`, `glowRGB`, `edgeFeather`.
   See `technique.md` for what each one does and good ranges.
5. Optional chrome (not part of the effect): the site wraps the canvas in ambient aurora/halo/`conic-gradient` rings and a "MODE · human/agent" HUD chip.
   These are decorative; add them only if the design calls for it.

## Guardrails (do not skip)

- **Keep the base crisp.** Draw it with `drawImage` at full resolution; do NOT render the whole portrait as grid tiles/dots — that "checkered" look was explicitly rejected. Particles are for the ring only.
- **Fine particles, not chunky.** The dissolving dots should be small (roughly one grid cell). Coarse blocks look bad.
- **Repaint after resize.** The `ResizeObserver` initial callback clears the canvas; if the render loop has parked, the base disappears until the first hover. The reference fixes this by calling `schedule()` inside `resize()`. Preserve that.
- **Handle no-hover devices.** On touch / `prefers-reduced-motion` / `hover: none`, there is no pointer, so the reference drifts the brush automatically on a slow path. Keep that fallback.
- **Respect the writing-style rule** for any user-facing copy you add (labels, alt text): no em/en dashes, plain English in EN.

## Verify

Run the app and check, in the browser:
1. On a hard refresh with the mouse NOT over the element, the crisp base image is visible immediately (not blank until hover).
2. Moving the cursor reveals the second image only around the pointer, with a fine particle ring at the boundary that streams away.
3. Leaving the element eases back to the base.
4. On a narrow viewport / touch emulation, the brush auto-drifts.
No console errors (a `cz-shortcut-listen` hydration warning, if present, is a browser extension, not this code).
