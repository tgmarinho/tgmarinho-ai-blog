"use client";

import { useEffect, useRef } from "react";

/**
 * Cursor Aurora — a soft, electric-blue radial halo that follows the
 * pointer with smooth lerp damping. Sits on a fixed layer with
 * `mix-blend-mode: screen` so it only adds light (never blocks
 * interactions or darkens content).
 *
 * - Skipped on touch devices (no useful cursor to follow).
 * - Skipped under prefers-reduced-motion.
 * - Updates CSS variables (no React re-renders) — 60fps safe.
 */
export function CursorAurora() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Skip touch & reduced-motion
    const isTouch = window.matchMedia("(hover: none)").matches;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (isTouch || reduceMotion) {
      el.style.opacity = "0";
      return;
    }

    let raf = 0;
    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const current = { ...target };
    let visible = false;

    const onMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!visible) {
        visible = true;
        el.style.opacity = "1";
      }
    };

    const onLeave = () => {
      visible = false;
      el.style.opacity = "0";
    };

    const tick = () => {
      // smooth follow — lerp factor controls how "liquid" it feels
      current.x += (target.x - current.x) * 0.12;
      current.y += (target.y - current.y) * 0.12;
      el.style.setProperty("--mx", `${current.x}px`);
      el.style.setProperty("--my", `${current.y}px`);
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[1] opacity-0 transition-opacity duration-700"
      style={{
        mixBlendMode: "screen",
        background:
          "radial-gradient(620px circle at var(--mx, 50vw) var(--my, 50vh), rgba(59, 130, 246, 0.16), rgba(34, 211, 238, 0.10) 25%, rgba(217, 70, 239, 0.04) 55%, transparent 75%)",
      }}
    />
  );
}
