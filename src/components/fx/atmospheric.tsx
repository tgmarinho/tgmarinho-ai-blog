"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const CursorAurora = dynamic(
  () => import("./cursor-aurora").then((m) => m.CursorAurora),
  { ssr: false }
);

const ShootingStars = dynamic(
  () => import("./shooting-stars").then((m) => m.ShootingStars),
  { ssr: false }
);

/**
 * Mounts decorative atmospheric FX only when they're worth the cost:
 * - skipped under `prefers-reduced-motion: reduce`
 * - skipped on viewports below 768px (mobile)
 *
 * Both components are lazy-loaded client-side so they don't add weight
 * to the initial server-rendered payload of any route.
 */
export function Atmospheric() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktop = window.matchMedia("(min-width: 768px)");

    const update = () => setEnabled(!motion.matches && desktop.matches);
    update();

    motion.addEventListener("change", update);
    desktop.addEventListener("change", update);
    return () => {
      motion.removeEventListener("change", update);
      desktop.removeEventListener("change", update);
    };
  }, []);

  if (!enabled) return null;
  return (
    <>
      <CursorAurora />
      <ShootingStars />
    </>
  );
}
