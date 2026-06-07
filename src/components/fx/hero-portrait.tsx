"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";

interface HeroPortraitProps {
  size?: number;
  className?: string;
}

const STAGES = [
  {
    src: "/images/hero/portrait-human-v2-removebg.png",
    label: "MODE · human",
    dot: "cyan",
  },
  {
    src: "/images/hero/portrait-hybrid-v2-removebg.png",
    label: "MODE · hybrid",
    dot: "magenta",
  },
  {
    src: "/images/hero/portrait-agent-v2-removebg.png",
    label: "MODE · agent",
    dot: "emerald",
  },
] as const;

// Step / hold timing — calibrated to match the landonorris.com cadence
// (slow build-up, brief pause at the peak, slow tear-down).
const STEP_INTERVAL_MS = 2400;
const HOVER_INTERVAL_MS = 1400;
const REVEAL_DURATION_MS = 1100;

// Aggressive radial alpha mask — only the central face stays fully opaque,
// the rest dissolves into the page atmosphere on a long tail so the
// photograph's rectangular boundary is completely gone.
const EDGE_FEATHER =
  "radial-gradient(ellipse 56% 64% at 50% 44%, black 22%, rgba(0,0,0,0.92) 48%, rgba(0,0,0,0.55) 70%, rgba(0,0,0,0.18) 86%, transparent 100%)";

/**
 * Hero portrait with a "landonorris.com"-style materialization.
 *
 * Three transparent-background portraits (human → hybrid → agent) crossfade
 * into each other — only the active mode is opaque at any moment, so we
 * never see one silhouette bleeding through another (the agent helmet has
 * a much wider/different outline than the bare face). The cinematic
 * "materialize" feel is delivered by an overlaid neon scan line + a brief
 * top-down clip wipe on the incoming layer, replayed on each transition.
 * The cycle is a ping-pong (0 → 1 → 2 → 1 → 0 …) with a natural beat of
 * pause at each extreme, mirroring the build / hold / dismantle cadence
 * of the reference site.
 */
export function HeroPortrait({ size = 540, className }: HeroPortraitProps) {
  const [mode, setMode] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [isLowPower, setIsLowPower] = useState(false);
  const directionRef = useRef<1 | -1>(1);
  const uid = useId().replace(/:/g, "");

  // Detect mobile / reduced-motion. The SVG turbulence + displacement filter
  // and stacked blur layers crash WebKit-based mobile browsers (OOM/GPU) after
  // a few seconds. We gate the heaviest effects behind this flag.
  useEffect(() => {
    const mql = window.matchMedia(
      "(max-width: 768px), (prefers-reduced-motion: reduce)",
    );
    const update = () => setIsLowPower(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  // Ping-pong auto-cycle. Runs unconditionally (including on mobile and
  // with prefers-reduced-motion — the morph itself is gentle opacity work).
  useEffect(() => {
    const interval = hovered ? HOVER_INTERVAL_MS : STEP_INTERVAL_MS;
    const id = window.setInterval(() => {
      setMode((m) => {
        const next = m + directionRef.current;
        if (next > STAGES.length - 1) {
          directionRef.current = -1;
          return m - 1;
        }
        if (next < 0) {
          directionRef.current = 1;
          return m + 1;
        }
        return next;
      });
    }, interval);
    return () => window.clearInterval(id);
  }, [hovered]);

  const current = STAGES[mode];
  const dotClass = {
    cyan: "bg-cyan-300 shadow-[0_0_10px_2px_rgba(34,211,238,0.7)]",
    magenta: "bg-fuchsia-400 shadow-[0_0_10px_2px_rgba(217,70,239,0.7)]",
    emerald: "bg-emerald-400 shadow-[0_0_10px_2px_rgba(52,211,153,0.7)]",
  }[current.dot];

  return (
    <div
      className={`group relative aspect-square w-full select-none ${className ?? ""}`}
      style={{
        maxWidth: size,
        WebkitUserSelect: "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onDragStart={(e) => e.preventDefault()}
      aria-label="Thiago Marinho portrait, morphing between human, hybrid, and agent modes"
    >
      {/* Wide ambient aurora — bleeds far beyond the portrait so the figure
          dissolves into the page atmosphere. */}
      <div
        aria-hidden
        className={`pointer-events-none absolute -inset-[18%] -z-20 rounded-full transition-opacity duration-700 ${isLowPower ? "blur-[40px]" : "blur-[90px]"}`}
        style={{
          background:
            "radial-gradient(circle at 30% 35%, rgba(34,211,238,0.35), transparent 55%), radial-gradient(circle at 70% 70%, rgba(217,70,239,0.28), transparent 55%), radial-gradient(circle at 50% 50%, rgba(8,12,30,0.55), transparent 70%)",
          opacity: hovered ? 1 : 0.85,
        }}
      />

      {/* Inner halo (closer to the figure) */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 -z-10 rounded-full transition-opacity duration-700 ${isLowPower ? "blur-[28px]" : "blur-[60px]"}`}
        style={{
          background:
            "radial-gradient(circle at 30% 40%, rgba(34,211,238,0.4), transparent 60%), radial-gradient(circle at 70% 60%, rgba(217,70,239,0.28), transparent 60%)",
          opacity: hovered ? 1 : 0.7,
        }}
      />

      {/* Rotating conic ring — a wider, softer halo orbiting the figure.
          Sits behind the portrait and is offset upward so it centers on
          the face rather than the geometric middle of the square. */}
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

      {/* Portrait stack — transparent PNGs, each new stage materializes on
          top of the previous one. */}
      <div
        className="absolute inset-0"
        style={{
          maskImage: EDGE_FEATHER,
          WebkitMaskImage: EDGE_FEATHER,
        }}
      >
        {STAGES.map((s, i) => {
          const isActive = i === mode;
          // Each active layer plays a fresh top-down clip wipe via the
          // `key` (forces the inner wrapper to remount, replaying the
          // animation). Inactive layers crossfade out smoothly via opacity.
          return (
            <div
              key={s.src}
              className="absolute inset-0"
              style={{
                zIndex: isActive ? 30 : 20,
                opacity: isActive ? 1 : 0,
                transition: `opacity ${REVEAL_DURATION_MS}ms cubic-bezier(0.16, 1, 0.3, 1)`,
              }}
            >
              <div
                key={`wipe-${i}-${mode}`}
                className="absolute inset-0"
                style={{
                  animation: isActive
                    ? `portrait-wipe ${REVEAL_DURATION_MS}ms cubic-bezier(0.16, 1, 0.3, 1) both`
                    : undefined,
                }}
              >
                <Image
                  src={s.src}
                  alt={`Thiago Marinho, ${s.label}`}
                  fill
                  priority={i === 0}
                  loading={i === 0 ? undefined : "lazy"}
                  draggable={false}
                  onDragStart={(e) => e.preventDefault()}
                  sizes="(max-width: 640px) 90vw, (max-width: 1024px) 60vw, 540px"
                  className="select-none object-cover object-center"
                />
              </div>
            </div>
          );
        })}

        {/* Reveal seam — neon line tracing the descending clip edge. */}
        <div
          key={`seam-${mode}`}
          aria-hidden
          className="pointer-events-none absolute inset-x-[8%] z-[60] h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(34,211,238,0.85), rgba(217,70,239,0.7), transparent)",
            boxShadow:
              "0 0 18px 2px rgba(34,211,238,0.6), 0 0 28px 6px rgba(217,70,239,0.35)",
            animation: `reveal-seam ${REVEAL_DURATION_MS}ms cubic-bezier(0.16, 1, 0.3, 1) forwards`,
          }}
        />
      </div>

      {/* Dissolve fog — turbulent cyan/white vapor painted as a ring
          around the silhouette boundary. Sits over the portrait stack
          with screen blend, hiding any residual hard edge from the
          photograph and reinforcing the "emerging from the cosmos" feel.
          Skipped on mobile / reduced-motion: feTurbulence + feDisplacementMap
          on a large surface OOM-crashes WebKit mobile browsers. */}
      {!isLowPower && (
      <svg
        aria-hidden
        className="pointer-events-none absolute -inset-[10%] z-[55]"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ mixBlendMode: "screen", opacity: 0.7 }}
      >
        <defs>
          <radialGradient id={`${uid}-fog-ring`} cx="50%" cy="46%" r="50%">
            <stop offset="0%" stopColor="rgba(186,230,253,0)" />
            <stop offset="56%" stopColor="rgba(186,230,253,0)" />
            <stop offset="70%" stopColor="rgba(186,230,253,0.38)" />
            <stop offset="84%" stopColor="rgba(34,211,238,0.14)" />
            <stop offset="100%" stopColor="rgba(34,211,238,0)" />
          </radialGradient>
          <filter
            id={`${uid}-fog-warp`}
            x="-10%"
            y="-10%"
            width="120%"
            height="120%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.02 0.026"
              numOctaves="2"
              seed="9"
              result="n"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="n"
              scale="32"
              xChannelSelector="R"
              yChannelSelector="G"
              result="w"
            />
            <feGaussianBlur in="w" stdDeviation="1.4" />
          </filter>
        </defs>
        <rect
          x="0"
          y="0"
          width="100"
          height="100"
          fill={`url(#${uid}-fog-ring)`}
          filter={`url(#${uid}-fog-warp)`}
        />
      </svg>
      )}

      {/* HUD chip — below the portrait, outside the alpha mask. */}
      <div className="pointer-events-none absolute -bottom-2 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/[0.08] bg-black/55 px-3 py-1.5 backdrop-blur-xl">
        <span className="flex items-center gap-2">
          <span
            className={`h-1.5 w-1.5 rounded-full transition-colors duration-500 ${dotClass}`}
          />
          <span className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-muted-foreground">
            {current.label}
          </span>
        </span>
        <span className="flex items-center gap-1.5 border-l border-white/10 pl-3">
          {STAGES.map((_, i) => (
            <span
              key={i}
              className={`h-1 w-3 rounded-full transition-colors duration-300 ${
                i === mode ? "bg-cyan-300" : "bg-white/15"
              }`}
            />
          ))}
        </span>
      </div>
    </div>
  );
}
