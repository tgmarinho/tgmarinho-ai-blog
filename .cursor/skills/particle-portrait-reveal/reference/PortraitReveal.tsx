"use client";

/**
 * PortraitReveal — a canvas hover effect that dissolves between two portraits.
 *
 * At rest it draws `baseSrc` at full resolution (a crisp photo). A soft brush
 * follows the pointer: inside it, `revealSrc` is shown; at the brush edge the
 * image granulates into a ring of fine dots that glow and stream away; outside
 * it stays the base. Only the part under the cursor transforms, and it tracks
 * the pointer — never a whole-image flip.
 *
 * Framework-agnostic React + Canvas 2D. No external deps. Drop into any React
 * app (add "use client" for Next.js App Router, already present above).
 *
 * The two images should share the SAME pose and framing (e.g. a photo of a
 * person and an AI/robot version of the same shot), ideally transparent-
 * background PNGs so the figure dissolves into the page. Same-origin (or CORS-
 * enabled) URLs are required — getImageData taints cross-origin canvases.
 */

import { useEffect, useRef, useState } from "react";

export interface PortraitRevealProps {
  /** Shown at rest. Transparent-bg PNG recommended. */
  baseSrc: string;
  /** Revealed under the cursor. Same pose/framing as baseSrc. */
  revealSrc: string;
  /** Rendered max width in px (the element is square). */
  size?: number;
  className?: string;
  /** Brush fill radius, as a fraction of the canvas (0..1). */
  brushRadius?: number;
  /** Thickness of the granulating dot ring at the brush edge (0..1). */
  brushBand?: number;
  /** Particle sampling grid. Higher = finer dots (and more work). */
  grid?: number;
  /** Max distance a dot streams, as a fraction of width. */
  streamDistance?: number;
  /** Direction dots stream toward, radians (0 = right, PI/2 = down). */
  streamAngle?: number;
  /** Angular spread of the stream, radians. */
  streamSpread?: number;
  /** Colour the ring dots glow toward at their brightest. */
  glowRGB?: [number, number, number];
  /** CSS mask that feathers the whole canvas edge into the page. */
  edgeFeather?: string;
  ariaLabel?: string;
}

type Loaded = {
  img: HTMLImageElement;
  sx: number;
  sy: number;
  sSize: number;
};

type Particles = {
  count: number;
  homeX: Float32Array;
  homeY: Float32Array;
  dirX: Float32Array;
  dirY: Float32Array;
  dist: Float32Array;
  // base + reveal colours and alpha (0..255)
  br: Uint8Array;
  bg: Uint8Array;
  bb: Uint8Array;
  ba: Uint8Array;
  rr: Uint8Array;
  rg: Uint8Array;
  rb: Uint8Array;
  ra: Uint8Array;
};

const ALPHA_THRESHOLD = 24;

const DEFAULT_FEATHER =
  "radial-gradient(ellipse 58% 66% at 50% 44%, black 24%, rgba(0,0,0,0.92) 50%, rgba(0,0,0,0.55) 72%, rgba(0,0,0,0.18) 88%, transparent 100%)";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    // Needed only for cross-origin sources; harmless for same-origin. Without
    // it (and matching CORS headers) getImageData throws a SecurityError.
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Centered square crop of an image of any aspect ratio. */
function squareCrop(img: HTMLImageElement): Loaded {
  const nw = img.naturalWidth;
  const nh = img.naturalHeight;
  const sSize = Math.min(nw, nh);
  return { img, sx: (nw - sSize) / 2, sy: (nh - sSize) / 2, sSize };
}

// Stable pseudo-random so per-particle scatter never shimmers between frames.
function hash(n: number) {
  const s = Math.sin(n * 12.9898) * 43758.5453;
  return s - Math.floor(s);
}

function sample(l: Loaded, grid: number): ImageData {
  const off = document.createElement("canvas");
  off.width = grid;
  off.height = grid;
  const ctx = off.getContext("2d", { willReadFrequently: true })!;
  ctx.clearRect(0, 0, grid, grid);
  ctx.drawImage(l.img, l.sx, l.sy, l.sSize, l.sSize, 0, 0, grid, grid);
  return ctx.getImageData(0, 0, grid, grid);
}

function buildParticles(
  base: ImageData,
  reveal: ImageData,
  grid: number,
  streamAngle: number,
  streamSpread: number,
): Particles {
  const cap = grid * grid;
  const homeX = new Float32Array(cap);
  const homeY = new Float32Array(cap);
  const dirX = new Float32Array(cap);
  const dirY = new Float32Array(cap);
  const dist = new Float32Array(cap);
  const br = new Uint8Array(cap);
  const bg = new Uint8Array(cap);
  const bb = new Uint8Array(cap);
  const ba = new Uint8Array(cap);
  const rr = new Uint8Array(cap);
  const rg = new Uint8Array(cap);
  const rb = new Uint8Array(cap);
  const ra = new Uint8Array(cap);

  const bd = base.data;
  const rd = reveal.data;
  let n = 0;

  for (let gy = 0; gy < grid; gy++) {
    for (let gx = 0; gx < grid; gx++) {
      const idx = (gy * grid + gx) * 4;
      const bA = bd[idx + 3];
      const rA = rd[idx + 3];
      if (bA < ALPHA_THRESHOLD && rA < ALPHA_THRESHOLD) continue;

      homeX[n] = (gx + 0.5) / grid;
      homeY[n] = (gy + 0.5) / grid;

      const j = hash(n + 1.3) - 0.5;
      const a = streamAngle + j * streamSpread;
      dirX[n] = Math.cos(a);
      dirY[n] = Math.sin(a);
      dist[n] = 0.35 + Math.pow(hash(n * 1.7 + 4.1), 1.6); // a few fly far

      br[n] = bd[idx];
      bg[n] = bd[idx + 1];
      bb[n] = bd[idx + 2];
      ba[n] = bA;
      rr[n] = rd[idx];
      rg[n] = rd[idx + 1];
      rb[n] = rd[idx + 2];
      ra[n] = rA;
      n++;
    }
  }

  const cut = <T extends { subarray(a: number, b: number): T }>(x: T) =>
    x.subarray(0, n);
  return {
    count: n,
    homeX: cut(homeX),
    homeY: cut(homeY),
    dirX: cut(dirX),
    dirY: cut(dirY),
    dist: cut(dist),
    br: cut(br),
    bg: cut(bg),
    bb: cut(bb),
    ba: cut(ba),
    rr: cut(rr),
    rg: cut(rg),
    rb: cut(rb),
    ra: cut(ra),
  };
}

export function PortraitReveal({
  baseSrc,
  revealSrc,
  size = 540,
  className,
  brushRadius = 0.3,
  brushBand = 0.13,
  grid = 160,
  streamDistance = 0.15,
  streamAngle = 2.4, // down-left
  streamSpread = 0.9,
  glowRGB = [170, 240, 255],
  edgeFeather = DEFAULT_FEATHER,
  ariaLabel = "Interactive portrait; move the cursor to reveal",
}: PortraitRevealProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particles | null>(null);
  const imagesRef = useRef<{ base: Loaded; reveal: Loaded } | null>(null);
  const rafRef = useRef<number | null>(null);
  const resumeRef = useRef<(() => void) | null>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const strengthRef = useRef(0);
  const strengthTargetRef = useRef(0);
  const lastTsRef = useRef(0);
  const autoRef = useRef(0);

  const [isLowPower, setIsLowPower] = useState(false);
  const [ready, setReady] = useState(false);

  // Detect no-hover / reduced-motion environments (touch, phones).
  useEffect(() => {
    const mql = window.matchMedia(
      "(max-width: 768px), (prefers-reduced-motion: reduce), (hover: none)",
    );
    const update = () => setIsLowPower(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  // Load both images: keep the elements for crisp drawing, sample for the ring.
  useEffect(() => {
    let cancelled = false;
    const g = isLowPower ? Math.round(grid * 0.75) : grid;
    Promise.all([loadImage(baseSrc), loadImage(revealSrc)])
      .then(([baseImg, revealImg]) => {
        if (cancelled) return;
        const base = squareCrop(baseImg);
        const reveal = squareCrop(revealImg);
        imagesRef.current = { base, reveal };
        particlesRef.current = buildParticles(
          sample(base, g),
          sample(reveal, g),
          g,
          streamAngle,
          streamSpread,
        );
        setReady(true);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [baseSrc, revealSrc, grid, isLowPower, streamAngle, streamSpread]);

  // Render loop.
  useEffect(() => {
    if (!ready) return;
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d")!;
    const buf = document.createElement("canvas");
    const bctx = buf.getContext("2d")!;

    let W = 0;
    let H = 0;
    let dpr = 1;
    const g = isLowPower ? Math.round(grid * 0.75) : grid;
    const [glowR, glowG, glowB] = glowRGB;

    // Forward reference so resize() can wake a parked loop.
    const loopRef: { draw: ((ts: number) => void) | null } = { draw: null };
    const schedule = () => {
      if (rafRef.current == null && loopRef.draw) {
        lastTsRef.current = 0;
        rafRef.current = requestAnimationFrame(loopRef.draw);
      }
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = wrap.getBoundingClientRect();
      W = Math.max(1, Math.round(rect.width));
      H = Math.max(1, Math.round(rect.height));
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      buf.width = canvas.width;
      buf.height = canvas.height;
      // Resizing clears the canvas — repaint even if the loop had parked.
      schedule();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const draw = (ts: number) => {
      const p = particlesRef.current!;
      const imgs = imagesRef.current!;
      const dt = lastTsRef.current
        ? Math.min(0.05, (ts - lastTsRef.current) / 1000)
        : 0.016;
      lastTsRef.current = ts;

      let mx: number;
      let my: number;
      let strength: number;
      if (isLowPower) {
        // No pointer: drift the brush on a slow Lissajous path.
        autoRef.current += dt;
        const a = autoRef.current;
        mx = 0.5 + Math.cos(a * 0.6) * 0.22;
        my = 0.42 + Math.sin(a * 0.9) * 0.26;
        strength = 1;
      } else {
        const k = 1 - Math.pow(0.0016, dt); // fast ease in/out
        strengthRef.current +=
          (strengthTargetRef.current - strengthRef.current) * k;
        strength = strengthRef.current;
        mx = mouseRef.current.x;
        my = mouseRef.current.y;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.imageSmoothingEnabled = true;

      // 1) Crisp base, full resolution.
      const b = imgs.base;
      ctx.drawImage(b.img, b.sx, b.sy, b.sSize, b.sSize, 0, 0, W, H);

      const cx = mx * W;
      const cy = my * H;
      const rReveal = brushRadius * Math.min(W, H);

      // 2) Reveal image inside the brush, feathered via an offscreen buffer so
      //    the circle edge dissolves into the base (no hard rim, no hole).
      if (strength > 0.01) {
        const rv = imgs.reveal;
        bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        bctx.globalCompositeOperation = "source-over";
        bctx.globalAlpha = 1;
        bctx.clearRect(0, 0, W, H);
        bctx.drawImage(rv.img, rv.sx, rv.sy, rv.sSize, rv.sSize, 0, 0, W, H);
        const grad = bctx.createRadialGradient(
          cx,
          cy,
          rReveal * 0.4,
          cx,
          cy,
          rReveal,
        );
        grad.addColorStop(0, "rgba(0,0,0,1)");
        grad.addColorStop(1, "rgba(0,0,0,0)");
        bctx.globalCompositeOperation = "destination-in";
        bctx.fillStyle = grad;
        bctx.fillRect(cx - rReveal, cy - rReveal, rReveal * 2, rReveal * 2);

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalAlpha = Math.min(1, strength);
        ctx.drawImage(buf, 0, 0);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.globalAlpha = 1;
      }

      // 3) Dissolve ring: only cells near the brush edge, streaming + glowing.
      const cell = W / g;
      const maxDisp = W * streamDistance;
      ctx.globalCompositeOperation = "lighter";

      const {
        count,
        homeX,
        homeY,
        dirX,
        dirY,
        dist,
        br,
        bg,
        bb,
        ba,
        rr,
        rg,
        rb,
        ra,
      } = p;

      for (let i = 0; i < count; i++) {
        const hx = homeX[i];
        const hy = homeY[i];
        const d = Math.hypot(hx - mx, hy - my);
        const ed = d - brushRadius;
        if (ed <= -brushBand || ed >= brushBand) continue; // ring only

        const fn = (1 - Math.abs(ed) / brushBand) * strength; // ring proximity
        if (fn < 0.02) continue;

        // reveal amount across the ring (base outside -> reveal inside)
        const u = (brushBand - ed) / (2 * brushBand);
        const rev = u * u * (3 - 2 * u); // smoothstep

        const alpha = (ba[i] / 255) * (1 - rev) + (ra[i] / 255) * rev;
        if (alpha < 0.04) continue;

        const ds = cell * (0.9 + fn * 0.5);
        const disp = fn * maxDisp * dist[i];
        const x = hx * W + dirX[i] * disp;
        const y = hy * H + dirY[i] * disp;

        let cr = br[i] + (rr[i] - br[i]) * rev;
        let cg = bg[i] + (rg[i] - bg[i]) * rev;
        let cb = bb[i] + (rb[i] - bb[i]) * rev;
        const glow = fn * 0.55;
        cr = (cr + (glowR - cr) * glow) | 0;
        cg = (cg + (glowG - cg) * glow) | 0;
        cb = (cb + (glowB - cb) * glow) | 0;

        ctx.globalAlpha = Math.min(1, alpha) * (0.55 + fn * 0.45);
        ctx.fillStyle = `rgb(${cr},${cg},${cb})`;
        const h = ds / 2;
        ctx.fillRect(x - h, y - h, ds, ds);
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";

      // Park when idle (static base) to save battery; resume on enter/resize.
      const idle =
        !isLowPower && strengthTargetRef.current === 0 && strength < 0.002;
      if (idle) {
        rafRef.current = null;
        lastTsRef.current = 0;
        return;
      }
      rafRef.current = requestAnimationFrame(draw);
    };

    loopRef.draw = draw;
    resumeRef.current = schedule;
    schedule();

    return () => {
      ro.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      resumeRef.current = null;
      lastTsRef.current = 0;
    };
  }, [
    ready,
    isLowPower,
    grid,
    brushRadius,
    brushBand,
    streamDistance,
    glowRGB,
  ]);

  const wake = () => resumeRef.current?.();
  const track = (e: React.PointerEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseRef.current.x = (e.clientX - rect.left) / rect.width;
    mouseRef.current.y = (e.clientY - rect.top) / rect.height;
  };

  return (
    <div
      className={className}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: size,
        aspectRatio: "1 / 1",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
      onPointerEnter={(e) => {
        track(e);
        strengthTargetRef.current = 1;
        wake();
      }}
      onPointerMove={(e) => {
        track(e);
        strengthTargetRef.current = 1;
        wake();
      }}
      onPointerLeave={() => {
        strengthTargetRef.current = 0;
        wake();
      }}
      onDragStart={(e) => e.preventDefault()}
      aria-label={ariaLabel}
    >
      <div
        ref={wrapRef}
        style={{
          position: "absolute",
          inset: 0,
          maskImage: edgeFeather,
          WebkitMaskImage: edgeFeather,
        }}
      >
        <canvas
          ref={canvasRef}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        />
      </div>
    </div>
  );
}
