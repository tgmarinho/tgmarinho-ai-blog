"use client";

import { useEffect, useRef, useState } from "react";

interface LiquidOrbProps {
  size?: number;
  className?: string;
}

/**
 * "Liquid glass" orb — pure SVG + CSS. The orb tracks pointer with
 * subtle parallax, has an inner refraction core, an animated conic
 * halo and 3 orbiting ions that suggest agentic activity.
 */
export function LiquidOrb({ size = 360, className }: LiquidOrbProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduceMotion) return;

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / window.innerWidth;
      const dy = (e.clientY - cy) / window.innerHeight;
      setTilt({ x: dx * 12, y: dy * 12 });
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div
      ref={ref}
      className={`relative grid place-items-center ${className ?? ""}`}
      style={{ width: size, height: size }}
    >
      {/* outer halo */}
      <div
        className="absolute inset-0 rounded-full blur-3xl opacity-70"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, rgba(34,211,238,0.55), transparent 60%), radial-gradient(circle at 70% 70%, rgba(217,70,239,0.45), transparent 65%)",
        }}
      />

      {/* rotating conic ring */}
      <div
        className="absolute rounded-full"
        style={{
          width: size * 1.05,
          height: size * 1.05,
          background:
            "conic-gradient(from 0deg, rgba(34,211,238,0.0), rgba(34,211,238,0.55), rgba(217,70,239,0.5), rgba(34,211,238,0.0))",
          mask: "radial-gradient(circle, transparent 58%, black 60%, black 64%, transparent 65%)",
          WebkitMask:
            "radial-gradient(circle, transparent 58%, black 60%, black 64%, transparent 65%)",
          animation: "orb-rotate 18s linear infinite",
        }}
      />

      {/* counter-rotating thin ring */}
      <div
        className="absolute rounded-full"
        style={{
          width: size * 1.18,
          height: size * 1.18,
          background:
            "conic-gradient(from 180deg, transparent, rgba(217,70,239,0.5), transparent 40%, transparent 60%, rgba(34,211,238,0.45), transparent)",
          mask: "radial-gradient(circle, transparent 70%, black 71%, black 72%, transparent 73%)",
          WebkitMask:
            "radial-gradient(circle, transparent 70%, black 71%, black 72%, transparent 73%)",
          animation: "orb-rotate 30s linear infinite reverse",
          opacity: 0.7,
        }}
      />

      {/* core sphere */}
      <div
        className="relative rounded-full overflow-hidden"
        style={{
          width: size * 0.55,
          height: size * 0.55,
          background:
            "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.65), rgba(34,211,238,0.55) 25%, rgba(59,130,246,0.4) 55%, rgba(8,12,24,0.95) 80%)",
          boxShadow:
            "inset 0 0 60px rgba(34,211,238,0.35), inset 0 -20px 40px rgba(217,70,239,0.25), 0 30px 80px -20px rgba(34,211,238,0.55)",
          transform: `translate3d(${tilt.x}px, ${tilt.y}px, 0)`,
          transition: "transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1)",
        }}
      >
        {/* inner refraction lines */}
        <svg
          viewBox="0 0 200 200"
          className="absolute inset-0 h-full w-full opacity-40 mix-blend-screen"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="orb-core" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
              <stop offset="60%" stopColor="#22d3ee" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#0b0d14" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="100" fill="url(#orb-core)" />
          {Array.from({ length: 14 }).map((_, i) => (
            <ellipse
              key={i}
              cx="100"
              cy="100"
              rx={30 + i * 6}
              ry={4 + i * 2}
              fill="none"
              stroke="rgba(165,243,252,0.18)"
              strokeWidth="0.4"
              transform={`rotate(${i * 9} 100 100)`}
            />
          ))}
        </svg>

        {/* highlight */}
        <div
          className="absolute rounded-full blur-2xl"
          style={{
            top: "10%",
            left: "18%",
            width: "40%",
            height: "30%",
            background:
              "radial-gradient(ellipse, rgba(255,255,255,0.85), transparent 70%)",
          }}
        />
      </div>

      {/* orbiting ions */}
      <div
        className="absolute"
        style={{
          width: size * 1.05,
          height: size * 1.05,
          animation: "orb-rotate 12s linear infinite",
        }}
      >
        <span
          className="absolute left-1/2 top-0 -translate-x-1/2 block h-2 w-2 rounded-full bg-cyan-300"
          style={{ boxShadow: "0 0 14px 4px rgba(34,211,238,0.85)" }}
        />
      </div>
      <div
        className="absolute"
        style={{
          width: size * 1.18,
          height: size * 1.18,
          animation: "orb-rotate 20s linear infinite reverse",
        }}
      >
        <span
          className="absolute left-1/2 top-0 -translate-x-1/2 block h-1.5 w-1.5 rounded-full bg-fuchsia-400"
          style={{ boxShadow: "0 0 12px 3px rgba(217,70,239,0.85)" }}
        />
      </div>
      <div
        className="absolute"
        style={{
          width: size * 0.9,
          height: size * 0.9,
          animation: "orb-rotate 16s linear infinite",
        }}
      >
        <span
          className="absolute left-1/2 top-0 -translate-x-1/2 block h-1 w-1 rounded-full bg-blue-300"
          style={{ boxShadow: "0 0 10px 3px rgba(96,165,250,0.7)" }}
        />
      </div>
    </div>
  );
}
