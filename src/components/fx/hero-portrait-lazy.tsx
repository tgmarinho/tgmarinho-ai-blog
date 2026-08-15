"use client";

import dynamic from "next/dynamic";

// The portrait is pure atmosphere: a canvas effect plus two client-loaded PNGs.
// We never want it competing with the hero copy for LCP, so it is code-split and
// mounted only after hydration (ssr: false). The wrapper reserves the final
// footprint up front so deferring the paint costs nothing in layout shift.
const HeroPortraitInner = dynamic(
  () => import("./hero-portrait").then((m) => m.HeroPortrait),
  { ssr: false },
);

interface HeroPortraitLazyProps {
  size?: number;
  className?: string;
}

export function HeroPortraitLazy({
  size = 540,
  className,
}: HeroPortraitLazyProps) {
  return (
    <div
      className={`aspect-square w-full ${className ?? ""}`}
      style={{ maxWidth: size }}
    >
      <HeroPortraitInner size={size} />
    </div>
  );
}
