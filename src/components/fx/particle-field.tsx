"use client";

import { useEffect, useRef } from "react";

interface ParticleFieldProps {
  density?: number;
  className?: string;
  /** When true, particles drift slowly with subtle pointer parallax. */
  interactive?: boolean;
}

/**
 * Lightweight Canvas2D particle field — agentic data flow.
 * Pure JS, no deps, ~60fps, respects prefers-reduced-motion.
 */
export function ParticleField({
  density = 60,
  className,
  interactive = true,
}: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pointer = { x: 0.5, y: 0.5, active: false };

    type P = { x: number; y: number; vx: number; vy: number; r: number; hue: number };
    let particles: P[] = [];

    const palette = [195, 220, 295]; // cyan / blue / magenta hues

    const seed = () => {
      particles = Array.from({ length: density }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r: Math.random() * 1.2 + 0.4,
        hue: palette[Math.floor(Math.random() * palette.length)],
      }));
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = (e.clientX - rect.left) / rect.width;
      pointer.y = (e.clientY - rect.top) / rect.height;
      pointer.active = true;
    };
    const onLeave = () => {
      pointer.active = false;
    };

    let raf = 0;
    const tick = () => {
      ctx.clearRect(0, 0, width, height);

      const px = pointer.x * width;
      const py = pointer.y * height;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (interactive && pointer.active) {
          const dx = px - p.x;
          const dy = py - p.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 18000) {
            const f = (1 - d2 / 18000) * 0.04;
            p.vx += (dx / Math.sqrt(d2 || 1)) * f;
            p.vy += (dy / Math.sqrt(d2 || 1)) * f;
          }
        }

        // gentle damping & wrap
        p.vx *= 0.992;
        p.vy *= 0.992;
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        // dot
        ctx.beginPath();
        ctx.fillStyle = `hsla(${p.hue}, 90%, 70%, 0.55)`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // links between near particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 11000) {
            const alpha = (1 - d2 / 11000) * 0.18;
            ctx.beginPath();
            ctx.strokeStyle = `hsla(${(a.hue + b.hue) / 2}, 90%, 70%, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      if (!reduceMotion) raf = requestAnimationFrame(tick);
    };

    resize();
    window.addEventListener("resize", resize);
    if (interactive) {
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerleave", onLeave);
    }

    if (!reduceMotion) raf = requestAnimationFrame(tick);
    else tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, [density, interactive]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className ?? "pointer-events-none absolute inset-0 h-full w-full"}
    />
  );
}
