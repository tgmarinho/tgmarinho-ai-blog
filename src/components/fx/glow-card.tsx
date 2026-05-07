"use client";

import { cn } from "@/lib/utils";
import { useRef } from "react";

interface GlowCardProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  intensity?: "subtle" | "strong";
}

/**
 * Glassmorphic surface that reveals a soft cyan/magenta spotlight
 * following the cursor on hover. Uses a CSS variable updated via
 * pointermove — zero re-renders.
 */
export function GlowCard({
  as: Tag = "div",
  className,
  intensity = "subtle",
  children,
  ...rest
}: GlowCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    el.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  return (
    <Tag
      ref={ref}
      onPointerMove={onMove}
      className={cn(
        "group relative overflow-hidden rounded-2xl",
        "border border-white/[0.06] bg-white/[0.02]",
        "backdrop-blur-xl",
        "transition-colors duration-300 hover:border-white/[0.12]",
        className
      )}
      {...rest}
    >
      {/* spotlight */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            intensity === "strong"
              ? "radial-gradient(380px circle at var(--mx) var(--my), rgba(34,211,238,0.18), rgba(217,70,239,0.10) 40%, transparent 70%)"
              : "radial-gradient(320px circle at var(--mx) var(--my), rgba(34,211,238,0.12), transparent 60%)",
        }}
      />
      {/* hairline highlight on top */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
      />
      {children}
    </Tag>
  );
}
