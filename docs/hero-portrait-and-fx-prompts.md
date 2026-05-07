# Hero portrait morph, shooting stars & rocket — prompts log

> Session: **2026-05-07** — pair-programming with Cursor (Claude Opus 4.7).
> Goal: replace the hero `LiquidOrb` with a Tony Stark-flavored portrait morph
> inspired by [landonorris.com](https://landonorris.com), then add ambient page
> effects (shooting stars + a periodic rocket).
>
> This doc captures **every image-generation prompt** used to produce the assets
> currently shipping on the home page, plus the design/UX decisions baked into
> the components. Treat it as a "rebuild this from scratch" runbook.

---

## 1. Visual concept

Trigger inspiration:
- `landonorris.com` — a hover effect where helmet pieces drop onto Lando's face.
- `Iron Man` / `Tony Stark` — half-human / half-armored cinematic vibe.
- The site's existing **Agentic Futurism** language (deep black, electric cyan,
  soft magenta, glassmorphism — see `docs/redesign-2026-agentic-futurist.md`).

What we wanted on screen:
1. A **hero portrait** that morphs through three stages:
   - `human` — Thiago, slightly cyber-tinted but recognizable.
   - `hybrid` — half cybernetic plating across the face.
   - `agent` — fully sealed armored helmet (no face visible).
2. The morph **auto-cycles** and **accelerates on hover**, with a click/tap to
   advance manually on touch devices.
3. **Shooting stars** crossing the page background every ~5 seconds.
4. A **wireframe/constellation rocket** rising through the hero column gap once
   per minute.

---

## 2. Image-generation prompts

> All images were produced with Cursor's `GenerateImage` tool (DALL-E-class
> diffusion model). The reference image used as anchor for facial features was
> the user's own selfie:
> `assets/WhatsApp_Image_2026-05-07_at_13.11.39-….png`
>
> **Important caveat:** the model does **not** reliably output true alpha PNGs.
> Asking for "transparent background" frequently bakes in a checkerboard
> pattern as opaque pixels. The fallback strategy was either:
> - generate with a **solid dark cinematic backdrop** that visually matches the
>   page (used for the 3 portraits), or
> - generate with a **pure black** backdrop and post-process via `sharp` to
>   threshold the dark pixels into real alpha (used for the rocket).

### 2.1 Portrait — `human` (v2 — currently shipping)

File: `public/images/hero/portrait-human-v2.png`
Reference: user's selfie.

```
Hyper-realistic futuristic portrait of the same man from the reference photo,
preserving exact facial features: dark hair, full dark beard, round wire-framed
glasses, brown eyes, same nose and face structure. Cinematic AI engineer / Tony
Stark vibe, sleek black high-tech turtleneck or carbon-fiber collar with subtle
cyan circuit lines glowing softly on the shoulders. Skin shows faint
holographic scan lines and minimal cybernetic detailing on one cheekbone.
IMPORTANT: NO checkerboard pattern, NO transparent background, NO white
background. Instead the background is a solid cinematic atmospheric gradient:
deep rich obsidian black at the top fading into dark navy / cobalt blue smoke
in the middle, with a faint cyan rim glow on the upper left and a soft magenta
haze on the lower right. Very moody, cinematic, like a hero key art on a dark
studio backdrop. Centered head and shoulders, looking directly at camera with
calm confident expression. Square 1:1 composition, photorealistic, ultra
detailed, 4k, depth of field, professional cinematic key art quality.
```

### 2.2 Portrait — `hybrid` (v2 — currently shipping)

File: `public/images/hero/portrait-hybrid-v2.png`
Reference: `hero-portrait-human.png` (the previous v1 portrait, used to keep
composition and head pose consistent across stages).

```
Cinematic key art of the same man as the reference (preserve dark hair, full
dark beard, round wire-framed glasses, brown eyes), now in a half-cybernetic /
half-human state. The right half of his face shows polished dark metallic
cybernetic plating with cyan circuit traces, while the left half remains human.
He wears a sleek dark exosuit collar with cyan accent lines. Subtle cyan HUD
reflections on his glasses. Same head pose, framing and shoulder crop as the
reference portrait. IMPORTANT: NO checkerboard pattern, NO transparent
background, NO white background. Background is a solid cinematic atmospheric
gradient — deep obsidian black at the top fading into dark navy / cobalt blue
smoke, with cyan rim light from the upper left and magenta haze in the lower
right. Photorealistic, ultra detailed, 4k, blockbuster cinematic hero shot.
Square 1:1 composition.
```

### 2.3 Portrait — `agent` (v2 — currently shipping)

File: `public/images/hero/portrait-agent-v2.png`
Reference: none (generated from prompt only — earlier IP-flavored prompts were
blocked by safety policies, so the final palette pivoted to the site's own
black + cyan + magenta colorway, which arguably ended up better aligned with
the Agentic Futurism aesthetic anyway).

```
Cinematic portrait of a futuristic agentic AI avatar in full closed sci-fi
battle helmet — same shoulder framing and head position as a centered 1:1
portrait. Sleek angular metallic faceplate in matte black and brushed graphite
with electric cyan trim along the panel seams; the face is fully concealed by
the helmet (no human skin visible). A long horizontal slit visor across the
eye area glows with intense bright cyan light, casting a soft cool cyan halo.
Streamlined collar gorget with carbon-fiber details below the chin. The chest
shows a layered black and graphite exosuit chestplate with a circular glowing
cyan reactor core in the center, surrounded by hexagonal carbon panels with
magenta accent lines. IMPORTANT: NO checkerboard pattern, NO transparent
background, NO white background. Background is a solid cinematic atmospheric
gradient — deep obsidian black at the top fading into dark navy / cobalt blue
smoke in the middle, with a soft cyan rim light from the upper left and a
magenta haze on the lower right. Photorealistic, ultra detailed, 4k,
blockbuster cinematic hero shot. Square 1:1 composition.
```

### 2.4 Rocket — wireframe constellation (currently shipping)

File: `public/images/hero/rocket-alpha.png`
Pre-processing source: `public/images/hero/rocket.png` (raw generation).

Generation prompt:

```
A futuristic sci-fi rocket in low-poly wireframe constellation style —
translucent crystalline body covered with a fine geometric mesh of triangular
polygons connected by thin glowing lines and tiny bright dots at each vertex
(like a constellation network or 3D wireframe). The rocket has a luminous
electric cyan / electric blue glow with brighter cyan light radiating from
inside. Classic rocket silhouette: pointed nose cone, cylindrical body with
two circular portholes on the side, two triangular fins at the base, and
bright blue exhaust thrusters firing downward with intense cyan light beams.
Subtle magenta accent highlights on the edges and fin tips. Centered
composition, vertical orientation, rocket pointing straight up. CRITICAL: the
entire background must be a solid pure black to deep midnight black color
(#05060a / very dark navy with minimal subtle dark blue radial atmosphere
directly behind the rocket). NO checkered pattern, NO transparent background,
NO white or light areas — only solid deep black surrounding the rocket so it
visually floats on a dark website. The rocket should fill most of the canvas
vertically. Hyper detailed digital art, cinematic lighting, 4k, premium tech
vibe.
```

Post-processing → true alpha PNG (`rocket-alpha.png`):

Run `node scripts/transparentize-rocket.mjs`. The script:
- reads `rocket.png` raw via `sharp`,
- computes Rec. 709 luminance per pixel
  (`0.2126·R + 0.7152·G + 0.0722·B`),
- maps luminance to alpha:
  - `≤ 18` → fully transparent,
  - `≥ 60` → fully opaque,
  - linear ramp in between → soft feathered edges,
- writes RGBA PNG to `rocket-alpha.png`.

Why this works for the rocket but not the portraits: the rocket is bright
pixels against pure black, so a luminance threshold cleanly separates it.
Portraits have dark regions on the subject (hair, beard, dark suit) which a
naïve luminance threshold would carve into — proper portrait cutouts would
need a background-removal model (rembg / remove.bg / U²-Net) which is out of
scope for this session.

### 2.5 Generations that did **not** ship (kept here for posterity)

- **`hero-portrait-ironman.png`** (v1 hybrid) — original "MCU red+gold" version.
  The "Iron Man / Tony Stark / MCU armor" wording tripped the model's content
  policy. Pivoted to a black + cyan + magenta exosuit description (same
  composition) which the model accepted and which actually fits the site's
  palette better.
- **`hero-portrait-ironman-closedmask.png`** — same story; first attempts with
  "crimson red and gold helmet" were blocked, the agentic black/cyan helmet
  passed.
- **`hero-portrait-human.png`** (v1) — first cinematic portrait, replaced by v2
  because v1 carried a baked-in checkerboard "transparency" pattern that
  looked broken on the dark page.

These files have been removed from `public/images/hero/`; only the v2 trio
ships now.

---

## 3. Components

All client-side. All under `src/components/fx/`.

### 3.1 `hero-portrait.tsx` — the morph

- **Stages:** array of 3 portraits (`human`, `hybrid`, `agent`) each with a
  label and dot color (cyan / magenta / emerald).
- **Auto-cycle:** `setInterval` every `IDLE_INTERVAL_MS` (3.6 s), accelerated
  to `HOVER_INTERVAL_MS` (1.6 s) when `hovered`.
- **Manual advance:** `onClick` / `onTouchStart` / Enter / Space → next stage.
- **Reduced motion:** `matchMedia("(prefers-reduced-motion: reduce)")` skips
  all auto-cycling and animations.
- **Reveal animation:** each new stage drops in via animated `clip-path:
  inset(100% 0 0 0)` → `inset(0 0 0 0)` over `REVEAL_DURATION_MS` (900 ms),
  with a subtle `translateY(-1.5%) → translateY(0)` to add a "drop" feel.
- **Previous stage** stays fully visible underneath with `clipPath: inset(0)`,
  no transition (zIndex 20). The new stage takes zIndex 30. Inactive stages
  go zIndex 10 with `inset(100% 0 0 0)` and `transition: none` so they don't
  visually retract on the way out.
- **Reveal seam:** a thin neon line tracing the descending clip edge,
  re-triggered via `key={seam-${stage}}`, animated by `@keyframes reveal-seam`
  (top: 0% → 100%).
- **No card frame.** The portraits sit inside a container with a soft
  `mask-image: radial-gradient(ellipse 70% 75% at 50% 48%, black 55%,
  rgba(0,0,0,0.85) 75%, transparent 100%)` — this dissolves the cinematic
  backdrop edges into the page so it doesn't sit on a hard rectangle.
- **Frame replacement:** instead of a border, the portrait gets:
  - a wide aurora glow (`-inset-[18%]`, blurred 90 px),
  - an inner halo (blurred 60 px),
  - a rotating conic ring at 18 s/turn,
  - and a tiny HUD chip below showing `MODE · human|hybrid|agent` plus stage
    indicators.

### 3.2 `shooting-stars.tsx` — global background streaks

- Mounted in `src/app/layout.tsx` (between `<CursorAurora />` and `<Header />`).
- Picks a new `StarConfig` every 5 s (random `top` 5–50 vh, random `left`
  55–85 vw, random `angle` 18–32°, random `travel` 70–100 vw, random hue from
  cyan / magenta / white).
- Streak = a 224 px × 1.5 px linear-gradient bar with a 8 px sparkle "head"
  at the leading edge. Both elements run `@keyframes shooting-star`
  (translateX 0 → `var(--travel)`) over 2.2 s.
- `react-hooks/set-state-in-effect`: first shot is deferred to a 0-ms
  `setTimeout` to avoid the new React rule.

### 3.3 `rocket-launch.tsx` — the 60-second rocket

- Mounted inside `src/components/home/hero.tsx`, absolutely positioned at
  `left-1/2`, full hero height. Hidden on mobile.
- `setInterval` every 60 s, plus an initial `setTimeout` at 8 s so the first
  launch happens shortly after the page settles.
- The `<Image>` source is the alpha-channel `rocket-alpha.png` (no blend
  tricks needed). Two `drop-shadow` filters (cyan + magenta) reinforce the
  glow during the rise.
- Animation: `@keyframes rocket-rise` translates the rocket from
  `translateY(110%)` to `translateY(-130%)` over 8 s with a slight rotation
  wobble.

---

## 4. CSS additions to `globals.css`

New keyframes added during this session (all live in `globals.css`):

```css
@keyframes sweep {
  0% { transform: translateX(0); opacity: 0; }
  20% { opacity: 1; }
  100% { transform: translateX(400%); opacity: 0; }
}

@keyframes reveal-seam {
  0% { top: 0%; opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { top: 100%; opacity: 0; }
}

@keyframes shooting-star {
  0% { transform: translateX(0); opacity: 0; }
  6% { opacity: 1; }
  85% { opacity: 1; }
  100% { transform: translateX(var(--travel, 80vw)); opacity: 0; }
}

@keyframes rocket-rise {
  0% { transform: translateY(110%) rotate(-3deg); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(-130%) rotate(2deg); opacity: 0; }
}

@keyframes rocket-flame {
  0%, 100% { transform: scaleY(0.9) scaleX(1); opacity: 0.75; }
  50% { transform: scaleY(1.25) scaleX(0.85); opacity: 1; }
}
```

`prefers-reduced-motion` is honored at the component level via
`matchMedia` — no global overrides were needed.

---

## 5. Files added / modified

```
content/                                                    (untouched)

docs/
  hero-portrait-and-fx-prompts.md                           ← THIS FILE

public/images/hero/
  portrait-human-v2.png                                     ← new
  portrait-hybrid-v2.png                                    ← new
  portrait-agent-v2.png                                     ← new
  rocket.png                                                ← new (raw)
  rocket-alpha.png                                          ← new (post-processed)

scripts/
  transparentize-rocket.mjs                                 ← new

src/app/
  layout.tsx                                                ← +ShootingStars import + mount
  globals.css                                               ← +5 keyframes

src/components/fx/
  hero-portrait.tsx                                         ← new
  rocket-launch.tsx                                         ← new
  shooting-stars.tsx                                        ← new

src/components/home/
  hero.tsx                                                  ← LiquidOrb → HeroPortrait, +RocketLaunch
```

`liquid-orb.tsx` was kept in the codebase (not deleted) — it's no longer used
on the home page but stays around as a reusable agentic visual primitive.

---

## 6. Cache invalidation gotcha

When the v1 portraits were overwritten in place, `next/image` continued serving
the cached optimized version (the URL was unchanged so the optimizer
considered the entry valid). Symptom: the page kept rendering the old
checkerboard-baked PNG even though the file on disk was the cinematic v2.

The fix was to **rename** the assets (`*.png` → `*-v2.png`) and update the
imports. New URL → fresh optimization run → fresh CDN cache entry.

Lesson: when iterating on `public/` images consumed by `next/image`, prefer
renaming over overwriting in place, or accept that you'll need to bust the
optimizer cache another way.

---

## 7. Known limitations / future work

- **True portrait cutouts.** The portraits ship with their cinematic backdrop
  baked into the PNG, softened at the edges via CSS radial mask. For a 100%
  faithful "Lando floats on the page" effect, the portraits would need to be
  run through a background-removal model (rembg / remove.bg). Not done in
  this session; tracked as an option the user can pursue manually.
- **Helmet pieces.** Landonorris's effect technically uses *separate* helmet
  pieces (visor band, crown, lower jaw) sliding in over a static face. Our
  implementation crossfades whole portraits via clip-path drop. If we ever
  want the literal piece-by-piece animation, we'd need transparent helmet-
  only assets and a different layered animation timeline.
- **Rocket launchpad on mobile.** The rocket is currently desktop-only
  (`hidden md:block` on its wrapper) because it's positioned at the column
  gap. A mobile variant would need to anchor differently (e.g. bottom-left
  edge of the hero) to avoid colliding with the text or the portrait.
- **`/images/hero/rocket.png`** is no longer referenced by any component
  (only `rocket-alpha.png` is) — kept as the source artifact for re-running
  the transparentize script.
