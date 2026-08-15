"use client";

import { useEffect, useRef, useState } from "react";

interface HeroPortraitProps {
  size?: number;
  className?: string;
}

// Transparent-background portraits. The human photo is the base; the agent
// portrait is revealed locally, under the cursor, as a "regeneration brush".
const HUMAN_SRC = "/images/hero/portrait-human-v2-removebg.png";
const AGENT_SRC = "/images/hero/portrait-agent-v2-removebg.png";

// Source images are 1536x1024 (3:2). We show a centered square crop, so the
// sample window is the middle 1024x1024 block.
const SRC_W = 1536;
const SRC_H = 1024;
const SRC_SQUARE = SRC_H; // 1024
const SRC_CROP_X = (SRC_W - SRC_SQUARE) / 2; // 256

// Aggressive radial alpha mask — only the central face stays fully opaque,
// the rest dissolves into the page atmosphere so the canvas has no hard edge.
const EDGE_FEATHER =
  "radial-gradient(ellipse 58% 66% at 50% 44%, black 24%, rgba(0,0,0,0.92) 50%, rgba(0,0,0,0.55) 72%, rgba(0,0,0,0.18) 88%, transparent 100%)";

const ALPHA_THRESHOLD = 24; // keep a cell if either portrait paints it

// Brush geometry, in canvas-normalized units (0..1). BRUSH_R is the radius the
// human reveal fills to; BRUSH_BAND is the thickness of the granulating ring at
// its edge — where the crisp image breaks into fine dots, like the reference.
const BRUSH_R = 0.3;
const BRUSH_BAND = 0.13;

type Particles = {
  count: number;
  homeX: Float32Array; // 0..1
  homeY: Float32Array; // 0..1
  dirX: Float32Array; // scatter direction, biased down-left
  dirY: Float32Array;
  dist: Float32Array; // per-particle scatter amplitude factor
  hr: Uint8Array;
  hg: Uint8Array;
  hb: Uint8Array;
  ha: Uint8Array;
  ar: Uint8Array;
  ag: Uint8Array;
  ab: Uint8Array;
  aa: Uint8Array;
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// Deterministic pseudo-random so the scatter pattern is stable across frames
// without touching Math.random inside the hot loop.
function hash(n: number) {
  const s = Math.sin(n * 12.9898) * 43758.5453;
  return s - Math.floor(s);
}

function sampleToGrid(img: HTMLImageElement, grid: number): ImageData {
  const off = document.createElement("canvas");
  off.width = grid;
  off.height = grid;
  const ctx = off.getContext("2d", { willReadFrequently: true })!;
  ctx.clearRect(0, 0, grid, grid);
  ctx.drawImage(img, SRC_CROP_X, 0, SRC_SQUARE, SRC_SQUARE, 0, 0, grid, grid);
  return ctx.getImageData(0, 0, grid, grid);
}

function buildParticles(
  human: ImageData,
  agent: ImageData,
  grid: number,
): Particles {
  const cap = grid * grid;
  const homeX = new Float32Array(cap);
  const homeY = new Float32Array(cap);
  const dirX = new Float32Array(cap);
  const dirY = new Float32Array(cap);
  const dist = new Float32Array(cap);
  const hr = new Uint8Array(cap);
  const hg = new Uint8Array(cap);
  const hb = new Uint8Array(cap);
  const ha = new Uint8Array(cap);
  const ar = new Uint8Array(cap);
  const ag = new Uint8Array(cap);
  const ab = new Uint8Array(cap);
  const aa = new Uint8Array(cap);

  const hd = human.data;
  const ad = agent.data;
  let n = 0;

  for (let gy = 0; gy < grid; gy++) {
    for (let gx = 0; gx < grid; gx++) {
      const idx = (gy * grid + gx) * 4;
      const hA = hd[idx + 3];
      const aA = ad[idx + 3];
      if (hA < ALPHA_THRESHOLD && aA < ALPHA_THRESHOLD) continue;

      homeX[n] = (gx + 0.5) / grid;
      homeY[n] = (gy + 0.5) / grid;

      // Scatter biased toward down-left, mirroring the reference stream, with
      // a stable per-particle jitter so the ring looks organic, not radial.
      const r1 = hash(n + 1.3);
      const r2 = hash(n * 1.7 + 4.1);
      const ang = (-0.62 + r1 * 0.55) * Math.PI; // roughly SW quadrant
      dirX[n] = Math.cos(ang);
      dirY[n] = Math.abs(Math.sin(ang)) * 0.7 + 0.25; // mostly downward
      dist[n] = 0.35 + Math.pow(r2, 1.6) * 1.0; // a few particles fly far

      hr[n] = hd[idx];
      hg[n] = hd[idx + 1];
      hb[n] = hd[idx + 2];
      ha[n] = hA;
      ar[n] = ad[idx];
      ag[n] = ad[idx + 1];
      ab[n] = ad[idx + 2];
      aa[n] = aA;
      n++;
    }
  }

  return {
    count: n,
    homeX: homeX.subarray(0, n),
    homeY: homeY.subarray(0, n),
    dirX: dirX.subarray(0, n),
    dirY: dirY.subarray(0, n),
    dist: dist.subarray(0, n),
    hr: hr.subarray(0, n),
    hg: hg.subarray(0, n),
    hb: hb.subarray(0, n),
    ha: ha.subarray(0, n),
    ar: ar.subarray(0, n),
    ag: ag.subarray(0, n),
    ab: ab.subarray(0, n),
    aa: aa.subarray(0, n),
  };
}

/**
 * Hero portrait that "regenerates" from human to agent locally under the
 * cursor, mimicking the Relay reference.
 *
 * The agent portrait is the base (dense tiled cells read as a continuous
 * image). A soft brush follows the pointer: cells inside it reveal the human
 * photo underneath, cells in the ring at its edge break into big chunky
 * particles that glow and stream down-left, and everything outside stays agent.
 * So only the part the cursor touches transforms, and it changes as the pointer
 * moves — never a whole-image flip. One canvas, no stacked <Image>.
 */
export function HeroPortrait({ size = 540, className }: HeroPortraitProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particles | null>(null);
  // Crisp source images, drawn full-resolution as the base (agent) and the
  // revealed layer (human). The particle grid is only used for the dissolve
  // ring, so the base stays sharp — no visible tiling.
  const imagesRef = useRef<{
    human: HTMLImageElement;
    agent: HTMLImageElement;
  } | null>(null);
  const rafRef = useRef<number | null>(null);
  // Pointer position in canvas-normalized coords, plus an eased "strength" that
  // fades the brush in on enter and out on leave.
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const strengthRef = useRef(0);
  const strengthTargetRef = useRef(0);
  const lastTsRef = useRef(0);
  const autoRef = useRef(0); // low-power auto-brush clock
  // Restarts the parked rAF loop with the effect's real `draw` closure.
  const resumeRef = useRef<(() => void) | null>(null);

  const [hovered, setHovered] = useState(false);
  const [phase, setPhase] = useState<0 | 1>(0); // 0 human, 1 agent (for HUD)
  const [isLowPower, setIsLowPower] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(
      "(max-width: 768px), (prefers-reduced-motion: reduce)",
    );
    const update = () => setIsLowPower(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  // Load both portraits: keep the elements for crisp full-res drawing, and
  // sample them on a fine grid for the dissolve-ring particles.
  useEffect(() => {
    let cancelled = false;
    const grid = isLowPower ? 120 : 160;
    Promise.all([loadImage(HUMAN_SRC), loadImage(AGENT_SRC)])
      .then(([human, agent]) => {
        if (cancelled) return;
        imagesRef.current = { human, agent };
        particlesRef.current = buildParticles(
          sampleToGrid(human, grid),
          sampleToGrid(agent, grid),
          grid,
        );
        setReady(true);
      })
      .catch(() => {
        /* keep the ambient halos; portrait just won't paint */
      });
    return () => {
      cancelled = true;
    };
  }, [isLowPower]);

  // Render loop.
  useEffect(() => {
    if (!ready) return;
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d")!;
    // Offscreen buffer used to feather the human reveal before compositing it
    // over the agent base (avoids a hard circle edge and transparent holes).
    const buf = document.createElement("canvas");
    const bctx = buf.getContext("2d")!;

    let W = 0;
    let H = 0;
    let dpr = 1;

    const grid = isLowPower ? 120 : 160;
    // Center-square crop of the 3:2 source, mapped onto the square canvas.
    const sx = SRC_CROP_X;
    const sw = SRC_SQUARE;

    // Forward reference so `resize` can wake a parked loop without depending on
    // `draw` being declared yet (draw is defined below and assigned here).
    const loop: { draw: ((ts: number) => void) | null } = { draw: null };
    const schedule = () => {
      if (rafRef.current == null && loop.draw) {
        lastTsRef.current = 0;
        rafRef.current = requestAnimationFrame(loop.draw);
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
      // Setting canvas.width clears it — repaint even if the loop had parked
      // (fixes the base only appearing after the first hover on hard refresh).
      schedule();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const draw = (ts: number) => {
      const p = particlesRef.current!;
      const dt = lastTsRef.current
        ? Math.min(0.05, (ts - lastTsRef.current) / 1000)
        : 0.016;
      lastTsRef.current = ts;

      // Low-power / touch devices have no pointer: drift the brush on a slow
      // Lissajous path so the effect is still visible.
      let mx: number;
      let my: number;
      let strength: number;
      if (isLowPower) {
        autoRef.current += dt;
        const a = autoRef.current;
        mx = 0.5 + Math.cos(a * 0.6) * 0.22;
        my = 0.42 + Math.sin(a * 0.9) * 0.26;
        strength = 1;
      } else {
        const k = 1 - Math.pow(0.0016, dt); // ~fast ease in/out
        strengthRef.current +=
          (strengthTargetRef.current - strengthRef.current) * k;
        strength = strengthRef.current;
        mx = mouseRef.current.x;
        my = mouseRef.current.y;
      }

      // Inverted: agent is the base (at rest), the brush reveals the human.
      const nextPhase = strength > 0.35 ? 0 : 1;
      setPhase((cur) => (cur === nextPhase ? cur : nextPhase));

      const imgs = imagesRef.current!;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.imageSmoothingEnabled = true;

      // 1) Crisp base: the agent portrait at full resolution.
      ctx.drawImage(imgs.agent, sx, 0, sw, sw, 0, 0, W, H);

      const cx = mx * W;
      const cy = my * H;
      const rReveal = BRUSH_R * Math.min(W, H);

      // 2) Reveal the human photo crisply inside the brush. Painted into the
      //    offscreen buffer, feathered with a radial alpha mask, then blitted
      //    over the agent so its edge dissolves into the base (no hard circle).
      if (strength > 0.01) {
        bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        bctx.globalCompositeOperation = "source-over";
        bctx.globalAlpha = 1;
        bctx.clearRect(0, 0, W, H);
        bctx.drawImage(imgs.human, sx, 0, sw, sw, 0, 0, W, H);
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

      // 3) Dissolve ring: fine particles peel off the moving edge, streaming
      //    down-left and glowing. Only ring cells are drawn — the base image
      //    stays sharp everywhere else.
      const cell = W / grid;
      const maxDisp = W * 0.15;
      ctx.globalCompositeOperation = "lighter";

      const {
        count,
        homeX,
        homeY,
        dirX,
        dirY,
        dist,
        hr,
        hg,
        hb,
        ha,
        ar,
        ag,
        ab,
        aa,
      } = p;

      for (let i = 0; i < count; i++) {
        const hx = homeX[i];
        const hy = homeY[i];
        const dx = hx - mx;
        const dy = hy - my;
        const d = Math.sqrt(dx * dx + dy * dy);
        const ed = d - BRUSH_R;
        if (ed <= -BRUSH_BAND || ed >= BRUSH_BAND) continue; // ring only

        const fn = (1 - Math.abs(ed) / BRUSH_BAND) * strength;
        if (fn < 0.02) continue;

        // Reveal amount across the ring (agent outside -> human inside).
        const u = (BRUSH_BAND - ed) / (2 * BRUSH_BAND);
        const b = u * u * (3 - 2 * u);

        const alpha = (aa[i] / 255) * (1 - b) + (ha[i] / 255) * b;
        if (alpha < 0.04) continue;

        const ds = cell * (0.9 + fn * 0.5); // fine, not chunky
        const disp = fn * maxDisp * dist[i];
        const x = hx * W + dirX[i] * disp;
        const y = hy * H + dirY[i] * disp;

        const r = ar[i] + (hr[i] - ar[i]) * b;
        const g = ag[i] + (hg[i] - ag[i]) * b;
        const bl = ab[i] + (hb[i] - ab[i]) * b;
        const glow = fn * 0.55;
        const rr = (r + (170 - r) * glow) | 0;
        const gg = (g + (240 - g) * glow) | 0;
        const bb = (bl + (255 - bl) * glow) | 0;

        ctx.globalAlpha = Math.min(1, alpha) * (0.55 + fn * 0.45);
        ctx.fillStyle = `rgb(${rr},${gg},${bb})`;
        const h = ds / 2;
        ctx.fillRect(x - h, y - h, ds, ds);
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";

      // Park the loop when the brush is fully gone (human photo is static);
      // resume instantly on the next pointer enter.
      const idle =
        !isLowPower &&
        strengthTargetRef.current === 0 &&
        strength < 0.002;
      if (idle) {
        rafRef.current = null;
        lastTsRef.current = 0;
        return;
      }
      rafRef.current = requestAnimationFrame(draw);
    };

    loop.draw = draw;
    resumeRef.current = schedule;
    schedule();

    return () => {
      ro.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      resumeRef.current = null;
      lastTsRef.current = 0;
    };
  }, [ready, isLowPower]);

  const ensureLoop = () => resumeRef.current?.();

  const updateMouse = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseRef.current.x = (e.clientX - rect.left) / rect.width;
    mouseRef.current.y = (e.clientY - rect.top) / rect.height;
  };

  const onEnter = (e: React.MouseEvent) => {
    setHovered(true);
    updateMouse(e);
    strengthTargetRef.current = 1;
    ensureLoop();
  };
  const onMove = (e: React.MouseEvent) => {
    updateMouse(e);
    strengthTargetRef.current = 1;
    ensureLoop();
  };
  const onLeave = () => {
    setHovered(false);
    strengthTargetRef.current = 0;
    ensureLoop();
  };

  const dotClass =
    phase === 1
      ? "bg-emerald-400 shadow-[0_0_10px_2px_rgba(52,211,153,0.7)]"
      : "bg-cyan-300 shadow-[0_0_10px_2px_rgba(34,211,238,0.7)]";
  const label = phase === 1 ? "MODE · agent" : "MODE · human";

  return (
    <div
      className={`group relative aspect-square w-full select-none ${className ?? ""}`}
      style={{ maxWidth: size, WebkitUserSelect: "none" }}
      onMouseEnter={onEnter}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onDragStart={(e) => e.preventDefault()}
      aria-label="Thiago Marinho agent portrait; move the cursor over it to reveal the human face underneath"
    >
      {/* Wide ambient aurora */}
      <div
        aria-hidden
        className={`pointer-events-none absolute -inset-[18%] -z-20 rounded-full transition-opacity duration-700 ${isLowPower ? "blur-[40px]" : "blur-[90px]"}`}
        style={{
          background:
            "radial-gradient(circle at 30% 35%, rgba(34,211,238,0.35), transparent 55%), radial-gradient(circle at 70% 70%, rgba(217,70,239,0.28), transparent 55%), radial-gradient(circle at 50% 50%, rgba(8,12,30,0.55), transparent 70%)",
          opacity: hovered ? 1 : 0.85,
        }}
      />

      {/* Inner halo */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 -z-10 rounded-full transition-opacity duration-700 ${isLowPower ? "blur-[28px]" : "blur-[60px]"}`}
        style={{
          background:
            "radial-gradient(circle at 30% 40%, rgba(34,211,238,0.4), transparent 60%), radial-gradient(circle at 70% 60%, rgba(217,70,239,0.28), transparent 60%)",
          opacity: hovered ? 1 : 0.7,
        }}
      />

      {/* Rotating conic ring */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-x-[6%] -top-[6%] bottom-[6%] -z-[5] transition-opacity duration-500"
        style={{
          background:
            "conic-gradient(from 0deg, rgba(34,211,238,0) 0deg, rgba(34,211,238,0.55) 90deg, rgba(217,70,239,0.45) 200deg, rgba(34,211,238,0) 360deg)",
          mask: "radial-gradient(circle at 50% 42%, transparent 52%, black 55%, black 56.5%, transparent 60%)",
          WebkitMask:
            "radial-gradient(circle at 50% 42%, transparent 52%, black 55%, black 56.5%, transparent 60%)",
          animation: isLowPower ? undefined : "orb-rotate 22s linear infinite",
          opacity: isLowPower ? 0.35 : hovered ? 0.85 : 0.45,
          filter: "blur(0.5px)",
        }}
      />

      {/* Particle regeneration canvas */}
      <div
        ref={wrapRef}
        className="absolute inset-0"
        style={{ maskImage: EDGE_FEATHER, WebkitMaskImage: EDGE_FEATHER }}
      >
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      </div>

      {/* HUD chip */}
      <div className="pointer-events-none absolute -bottom-2 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/[0.08] bg-black/55 px-3 py-1.5 backdrop-blur-xl">
        <span className="flex items-center gap-2">
          <span
            className={`h-1.5 w-1.5 rounded-full transition-colors duration-500 ${dotClass}`}
          />
          <span className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-muted-foreground">
            {label}
          </span>
        </span>
        <span className="flex items-center gap-1.5 border-l border-white/10 pl-3">
          {[0, 1].map((i) => (
            <span
              key={i}
              className={`h-1 w-3 rounded-full transition-colors duration-300 ${
                i === phase ? "bg-cyan-300" : "bg-white/15"
              }`}
            />
          ))}
        </span>
      </div>
    </div>
  );
}
