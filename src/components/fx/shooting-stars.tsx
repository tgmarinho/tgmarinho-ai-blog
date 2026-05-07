"use client";

import { useEffect, useState } from "react";

interface StarConfig {
  top: number;
  left: number;
  angle: number;
  travel: number;
  hueA: string;
  hueB: string;
  tick: number;
}

const HUES = [
  { a: "rgba(34,211,238,0.9)", b: "rgba(34,211,238,0.0)" }, // cyan
  { a: "rgba(217,70,239,0.9)", b: "rgba(217,70,239,0.0)" }, // magenta
  { a: "rgba(255,255,255,0.95)", b: "rgba(255,255,255,0.0)" }, // white
];

function pickStar(): StarConfig {
  const hue = HUES[Math.floor(Math.random() * HUES.length)];
  return {
    top: Math.random() * 45 + 5, // upper 50% of viewport
    left: Math.random() * 30 + 55, // start from right half
    angle: 18 + Math.random() * 14, // diagonal down-left
    travel: 70 + Math.random() * 30, // vw distance traveled
    hueA: hue.a,
    hueB: hue.b,
    tick: Date.now(),
  };
}

/**
 * Shooting stars in the page background — fires a new diagonal streak
 * every 5 seconds with randomized position, angle, and accent color
 * (cyan / magenta / white). Mounted globally in the layout.
 */
export function ShootingStars() {
  const [star, setStar] = useState<StarConfig | null>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduceMotion) return;

    // Defer the first shot to the next tick so we don't call setState
    // synchronously inside the effect body.
    const first = window.setTimeout(() => setStar(pickStar()), 0);
    const id = window.setInterval(() => setStar(pickStar()), 5000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, []);

  if (!star) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <div
        key={star.tick}
        className="absolute"
        style={{
          top: `${star.top}%`,
          left: `${star.left}%`,
          transform: `rotate(${star.angle}deg)`,
          transformOrigin: "left center",
          // CSS custom property consumed by the keyframe.
          ["--travel" as string]: `${star.travel}vw`,
        }}
      >
        <div
          className="h-[1.5px] w-56 animate-[shooting-star_2.2s_cubic-bezier(0.22,1,0.36,1)_forwards] rounded-full"
          style={{
            background: `linear-gradient(90deg, ${star.hueB} 0%, ${star.hueA} 80%, white 100%)`,
            boxShadow: `0 0 12px ${star.hueA}, 0 0 24px ${star.hueA}`,
          }}
        />
        {/* Sparkle head */}
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 animate-[shooting-star_2.2s_cubic-bezier(0.22,1,0.36,1)_forwards]"
        >
          <div
            className="h-2 w-2 rounded-full bg-white"
            style={{
              boxShadow: `0 0 14px white, 0 0 24px ${star.hueA}, 0 0 44px ${star.hueA}`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
