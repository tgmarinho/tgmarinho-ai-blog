# Technique: how the particle portrait reveal works

This is the design rationale and the list of non-obvious traps.
The runnable code is `PortraitReveal.tsx` in this folder.

## The mental model

Think of three layers, all painted onto **one** `<canvas>` every frame:

1. **Base image** — the whole figure, drawn crisp at full resolution with `drawImage`. This is what makes it read as a photo, not a pixel grid.
2. **Reveal image** — the second portrait, but only inside a soft circular brush at the pointer, feathered at its edge so it melts into the base.
3. **Dissolve ring** — a thin band of particles right at the brush boundary. Only here does the image "break apart" into dots that stream away and glow.

The trick that sells it: layers 1 and 2 are the actual images (sharp), and only the narrow ring (layer 3) is particles.
Early versions rendered the entire portrait as grid tiles, which looked checkered and low-res and was rejected.
Keeping the body crisp and confining the particles to the moving edge is the whole point.

## Per-frame algorithm

```
strength = eased toward 1 while hovering, 0 while not   (spring)
(mx, my) = pointer position in 0..1 canvas coords

clear canvas
drawImage(base)                       # layer 1, crisp, full-res

if strength > 0:                      # layer 2, crisp reveal
    into offscreen buffer:
        drawImage(reveal)
        destination-in a radial gradient (opaque center -> transparent edge)   # feather
    drawImage(buffer) onto main with globalAlpha = strength

set composite = "lighter"             # layer 3, glowing particles
for each sampled cell:
    d  = distance(cell.home, pointer)
    ed = d - brushRadius              # signed distance to the brush edge
    if |ed| >= brushBand: skip        # only the ring
    fn  = 1 - |ed| / brushBand        # 1 on the edge, 0 at the band limits
    rev = smoothstep across the band  # base-colour outside -> reveal-colour inside
    color = lerp(baseColor, revealColor, rev), then push toward glow by fn
    size  = ~1 cell, shrinking a touch with fn
    pos   = home + streamDir * (fn * streamDistance * perParticleDist)
    fillRect(pos, size)
```

### Why each piece

- **Sampling grid.** Once, at load, both images are drawn into a tiny `grid×grid` offscreen canvas and read back with `getImageData`. That gives a per-cell colour+alpha for the particles cheaply. A cell is kept only if either image is non-transparent there (`ALPHA_THRESHOLD`), so the transparent background contributes no particles. Higher `grid` = finer dots.
- **Typed arrays (`Float32Array` / `Uint8Array`).** The particle data lives in flat typed arrays, not objects, so the hot loop (tens of thousands of cells per frame) stays allocation-free and fast.
- **Ring-only loop.** Every cell computes its distance to the pointer, but the vast majority `continue` immediately (`|ed| >= brushBand`). Only the ring band actually draws. That keeps it smooth even at `grid = 160`.
- **`smoothstep` for the reveal blend.** `u*u*(3-2*u)` gives a soft S-curve across the ring instead of a linear seam, so the colour transition from base to reveal has no hard line.
- **`"lighter"` composite for particles.** Additive blending makes the dots glow against the dark background and lets the `glowRGB` push bright dots toward neon/white at the ring peak, matching the reference sparkle. The base and reveal images are drawn with normal `"source-over"`.
- **Stable per-particle randomness (`hash`).** Scatter direction and distance come from a deterministic hash of the cell index, not `Math.random()`, so the cloud is organic but does not shimmer/reshuffle every frame.
- **Streaming direction.** Each dot streams along `streamAngle ± streamSpread`. The default (~2.4 rad) sends them down-left into the background, like the reference. Displacement scales with `fn`, so dots move most exactly on the edge and settle as the ring passes.

## The feathered reveal (the subtle part)

You want the reveal circle to fade into the base at its rim, not show a hard disc and not punch a transparent hole.
The correct way is an **offscreen buffer**:

1. Draw the reveal image into the buffer.
2. `globalCompositeOperation = "destination-in"` and fill a radial gradient that is opaque in the center and transparent at the edge. This multiplies the reveal's alpha by the gradient, feathering only the reveal.
3. Blit the buffer over the base with `globalAlpha = strength`.

A tempting shortcut — clip a circle on the main canvas and `destination-out` a gradient — is wrong: it erases the base too, leaving a transparent ring hole. Use the offscreen approach.

## Tuning knobs

| Prop | Default | Effect |
|------|---------|--------|
| `brushRadius` | `0.3` | Size of the revealed area (fraction of canvas). Bigger = more of the second image shows. |
| `brushBand` | `0.13` | Thickness of the particle ring. Thin = a sharp dissolving edge; thick = a wide, cloudy transition. |
| `grid` | `160` | Sampling resolution. Higher = finer, denser dots (and more work). Drop it for low-power. |
| `streamDistance` | `0.15` | How far dots fly (fraction of width). |
| `streamAngle` | `2.4` | Direction dots stream (radians; 0 = right, PI/2 = down). |
| `streamSpread` | `0.9` | Angular spread of the stream. |
| `glowRGB` | `[170,240,255]` | Colour dots trend toward at the ring peak. |
| `edgeFeather` | radial mask | CSS mask fading the whole canvas edge into the page. |

Spring feel: `strength` is eased with `k = 1 - pow(0.0016, dt)` (fast, frame-rate independent). Lower the base (e.g. `0.0006`) for a snappier reveal, raise it for a lazier one.

## Traps that will waste your time (all handled in the reference)

1. **Resize clears the canvas → blank until first hover.**
   `ResizeObserver` fires an async initial callback. Setting `canvas.width`/`height` in it clears the canvas. If the render loop has already parked (idle optimization), nothing repaints and the base is invisible until you hover.
   Fix: call `schedule()` at the end of `resize()` so a repaint is always queued. This was a real reported bug ("image only appears on hover after a hard refresh").

2. **DPR / retina.**
   Size the drawing buffer to `cssSize * devicePixelRatio` (capped at 2) and `setTransform(dpr,...)` so 1 unit = 1 CSS px. Blit the offscreen buffer at identity transform (device pixels) to keep it 1:1. Forget this and it is blurry or misaligned.

3. **Cross-origin tainting.**
   `getImageData` on a canvas that drew a cross-origin image without CORS throws a `SecurityError`. Set `img.crossOrigin = "anonymous"` and serve the images with `Access-Control-Allow-Origin`, or keep them same-origin.

4. **Restarting a parked rAF loop from an event handler.**
   The `draw` closure lives inside the effect, so handlers cannot call it directly. Store a `schedule()` (or a forward-referenced `loopRef.draw`) in a ref and call that from `onPointerEnter` / `resize`. Do not try to restart via a state toggle — the effect will not re-run.

5. **No hover on touch.**
   Gate on `(hover: none)` / `prefers-reduced-motion` and drive the brush automatically (a slow Lissajous path) so mobile users still see the effect.

6. **Center crop for non-square sources.**
   Portraits are usually 3:2 or 4:3 but the element is square. Compute a centered square crop from each image's natural size and use the same crop for both the full-res `drawImage` and the grid sampling, so the particles line up with the image.

7. **HMR staleness while iterating.**
   Editing the component during dev can leave the previous canvas/rAF in a half-applied state (blank canvas). A hard reload fixes it; do not chase a "bug" that a refresh clears.

## History / provenance

Built for the hero of tgmarinho.ai, iterating from a full-image crossfade → a whole-portrait particle grid (rejected as "checkered") → this crisp-base + cursor-local reveal + fine dissolve ring.
Reference: the Relay landing page and landonorris.com regeneration transitions.
The canonical in-repo version (with the decorative aurora/HUD chrome) is `src/components/fx/hero-portrait.tsx`.
