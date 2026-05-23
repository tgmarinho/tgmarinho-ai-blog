"use client";

import { forwardRef, useEffect, useRef } from "react";

interface StageProps {
  width: number;
  height: number;
  /**
   * Runs every frame. Receives the 2D context and a delta-time-style frame counter.
   * Return false to stop the loop.
   */
  draw: (ctx: CanvasRenderingContext2D, frame: number) => boolean | void;
  /** Called once when the canvas is ready. */
  init?: (ctx: CanvasRenderingContext2D) => void;
  /**
   * Continuous scenes run every animation frame. Static scenes draw only when
   * `redrawKey` changes, which keeps blog-post embeds from burning CPU.
   */
  animate?: boolean;
  redrawKey?: string | number;
  className?: string;
  onPointerMove?: (x: number, y: number, ctx: CanvasRenderingContext2D) => void;
  onPointerLeave?: () => void;
}

export const Stage = forwardRef<HTMLCanvasElement, StageProps>(function Stage(
  {
    width,
    height,
    draw,
    init,
    animate = true,
    redrawKey = 0,
    className,
    onPointerMove,
    onPointerLeave,
  },
  ref,
) {
  const internalRef = useRef<HTMLCanvasElement>(null);
  const drawRef = useRef(draw);
  const initRef = useRef(init);

  useEffect(() => {
    drawRef.current = draw;
    initRef.current = init;
  }, [draw, init]);

  // expose ref
  useEffect(() => {
    if (typeof ref === "function") ref(internalRef.current);
    else if (ref) ref.current = internalRef.current;
  }, [ref]);

  useEffect(() => {
    const canvas = internalRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = "100%";
    canvas.style.aspectRatio = `${width} / ${height}`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (initRef.current) initRef.current(ctx);
  }, [width, height]);

  useEffect(() => {
    const canvas = internalRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let frame = 0;
    let stopped = false;

    const drawFrame = () => {
      if (stopped) return;
      const cont = drawRef.current(ctx, frame++);
      if (cont === false) {
        stopped = true;
        return;
      }
      return cont;
    };

    if (!animate) {
      raf = requestAnimationFrame(() => {
        drawFrame();
      });
      return () => {
        stopped = true;
        cancelAnimationFrame(raf);
      };
    }

    const tick = () => {
      drawFrame();
      if (stopped) return;
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
    };
  }, [animate, redrawKey]);

  return (
    <canvas
      ref={internalRef}
      className={[
        "block w-full rounded-xl border border-border bg-[color:var(--card)]/60 backdrop-blur-sm",
        className ?? "",
      ].join(" ")}
      onMouseMove={(e) => {
        if (!onPointerMove) return;
        const canvas = internalRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;
        const rect = canvas.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * width;
        const y = ((e.clientY - rect.top) / rect.height) * height;
        onPointerMove(x, y, ctx);
      }}
      onMouseLeave={onPointerLeave}
    />
  );
});

export const PALETTE = {
  // matches src/app/globals.css :root tokens
  bg: "#05060a",
  panel: "#0b0d14",
  panel2: "#11141d",
  text: "#e6f0ff",
  dim: "#7e8aa3",
  border: "rgba(255,255,255,0.10)",
  primary: "#22d3ee", // cyan electric
  accent: "#d946ef", // magenta
  warn: "#f59e0b", // amber
  ok: "#34d399", // emerald
  bad: "#f43f5e",
  purple: "#a78bfa",
  blue: "#3b82f6",
} as const;

export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  ctx.lineTo(x + rr, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
  ctx.lineTo(x, y + rr);
  ctx.quadraticCurveTo(x, y, x + rr, y);
  ctx.closePath();
}

export function arrowHead(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  ang: number,
  color: string,
  size = 8,
) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - size * Math.cos(ang - 0.4), y - size * Math.sin(ang - 0.4));
  ctx.lineTo(x - size * Math.cos(ang + 0.4), y - size * Math.sin(ang + 0.4));
  ctx.closePath();
  ctx.fill();
}
