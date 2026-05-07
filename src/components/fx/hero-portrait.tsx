"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface HeroPortraitProps {
  size?: number;
  className?: string;
}

const STAGES = [
  {
    src: "/images/hero/portrait-human-v2.png",
    label: "MODE · human",
    dot: "cyan",
  },
  {
    src: "/images/hero/portrait-hybrid-v2.png",
    label: "MODE · hybrid",
    dot: "magenta",
  },
  {
    src: "/images/hero/portrait-agent-v2.png",
    label: "MODE · agent",
    dot: "emerald",
  },
] as const;

const IDLE_INTERVAL_MS = 3600;
const HOVER_INTERVAL_MS = 1600;
const REVEAL_DURATION_MS = 900;

// Soft radial alpha mask — keeps the subject's center fully opaque and
// dissolves the backdrop edges into the page. Works on both Webkit and
// modern browsers (mask-image / -webkit-mask-image).
const EDGE_FEATHER =
  "radial-gradient(ellipse 70% 75% at 50% 48%, black 55%, rgba(0,0,0,0.85) 75%, transparent 100%)";

/**
 * Hero portrait with a "landonorris.com"-style morph.
 *
 * Three cinematic portraits (human → hybrid → agent) are stacked. Each
 * stage is revealed top-to-bottom via animated clip-path with a slight
 * translateY drop, as if a new layer of the suit physically dropped on
 * top of the previous portrait. There is no visible card frame — the
 * portraits float, masked into the page by a soft radial alpha gradient.
 */
export function HeroPortrait({ size = 540, className }: HeroPortraitProps) {
  const [stage, setStage] = useState(0);
  const [prevStage, setPrevStage] = useState(0);
  const [hovered, setHovered] = useState(false);
  const reduceMotionRef = useRef(false);

  useEffect(() => {
    reduceMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
  }, []);

  const advance = () => {
    setPrevStage(stage);
    setStage((s) => (s + 1) % STAGES.length);
  };

  // Auto-cycle through stages. Hover accelerates the cycle.
  useEffect(() => {
    if (reduceMotionRef.current) return;
    const interval = hovered ? HOVER_INTERVAL_MS : IDLE_INTERVAL_MS;
    const id = window.setInterval(advance, interval);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hovered]);

  const current = STAGES[stage];
  const dotClass = {
    cyan: "bg-cyan-300 shadow-[0_0_10px_2px_rgba(34,211,238,0.7)]",
    magenta: "bg-fuchsia-400 shadow-[0_0_10px_2px_rgba(217,70,239,0.7)]",
    emerald: "bg-emerald-400 shadow-[0_0_10px_2px_rgba(52,211,153,0.7)]",
  }[current.dot];

  return (
    <div
      className={`group relative aspect-square w-full ${className ?? ""}`}
      style={{ maxWidth: size }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={advance}
      onTouchStart={advance}
      role="button"
      tabIndex={0}
      aria-label={`Portrait morph — ${current.label}. Click to advance.`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          advance();
        }
      }}
    >
      {/* Wide ambient aurora — bleeds far beyond the portrait so the figure
          dissolves into the page atmosphere. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-[18%] -z-20 rounded-full blur-[90px] transition-opacity duration-700"
        style={{
          background:
            "radial-gradient(circle at 30% 35%, rgba(34,211,238,0.35), transparent 55%), radial-gradient(circle at 70% 70%, rgba(217,70,239,0.28), transparent 55%), radial-gradient(circle at 50% 50%, rgba(8,12,30,0.55), transparent 70%)",
          opacity: hovered ? 1 : 0.85,
        }}
      />

      {/* Inner halo (closer to the figure) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 rounded-full blur-[60px] transition-opacity duration-700"
        style={{
          background:
            "radial-gradient(circle at 30% 40%, rgba(34,211,238,0.4), transparent 60%), radial-gradient(circle at 70% 60%, rgba(217,70,239,0.28), transparent 60%)",
          opacity: hovered ? 1 : 0.7,
        }}
      />

      {/* Rotating conic ring — the only "frame" the portrait gets. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-2 rounded-full transition-opacity duration-500"
        style={{
          background:
            "conic-gradient(from 0deg, rgba(34,211,238,0.0), rgba(34,211,238,0.55), rgba(217,70,239,0.45), rgba(34,211,238,0.0))",
          mask: "radial-gradient(circle, transparent 58%, black 60%, black 62%, transparent 64%)",
          WebkitMask:
            "radial-gradient(circle, transparent 58%, black 60%, black 62%, transparent 64%)",
          animation: "orb-rotate 18s linear infinite",
          opacity: hovered ? 0.95 : 0.55,
        }}
      />

      {/* Portrait stack — no card, no border, just the masked figures. */}
      <div
        className="absolute inset-0"
        style={{
          maskImage: EDGE_FEATHER,
          WebkitMaskImage: EDGE_FEATHER,
        }}
      >
        {STAGES.map((s, i) => {
          const isActive = i === stage;
          const isPrev = i === prevStage && i !== stage;
          const clipPath =
            isActive || isPrev ? "inset(0 0 0 0)" : "inset(100% 0 0 0)";
          const zIndex = isActive ? 30 : isPrev ? 20 : 10;
          const transform = isActive ? "translateY(0)" : "translateY(-1.5%)";
          const transition = isActive
            ? `clip-path ${REVEAL_DURATION_MS}ms cubic-bezier(0.16, 1, 0.3, 1), transform ${REVEAL_DURATION_MS}ms cubic-bezier(0.16, 1, 0.3, 1)`
            : "none";
          return (
            <div
              key={s.src}
              className="absolute inset-0"
              style={{
                clipPath,
                WebkitClipPath: clipPath,
                zIndex,
                transform,
                transition,
              }}
            >
              <Image
                src={s.src}
                alt={`Thiago Marinho — ${s.label}`}
                fill
                priority={i === 0}
                sizes="(max-width: 768px) 80vw, 540px"
                className="object-cover object-center"
              />
            </div>
          );
        })}

        {/* Reveal seam — neon line tracing the descending clip edge. */}
        <div
          key={`seam-${stage}`}
          aria-hidden
          className="pointer-events-none absolute inset-x-[8%] z-35 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(34,211,238,0.85), rgba(217,70,239,0.7), transparent)",
            boxShadow:
              "0 0 18px 2px rgba(34,211,238,0.6), 0 0 28px 6px rgba(217,70,239,0.35)",
            animation: `reveal-seam ${REVEAL_DURATION_MS}ms cubic-bezier(0.16, 1, 0.3, 1) forwards`,
          }}
        />
      </div>

      {/* HUD chip — below the portrait, outside the alpha mask. */}
      <div className="pointer-events-none absolute -bottom-2 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/[0.08] bg-black/55 px-3 py-1.5 backdrop-blur-xl">
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
                i === stage ? "bg-cyan-300" : "bg-white/15"
              }`}
            />
          ))}
        </span>
      </div>
    </div>
  );
}
