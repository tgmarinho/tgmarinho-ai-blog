"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const LAUNCH_INTERVAL_MS = 30_000;
const FIRST_DELAY_MS = 3_000;

/**
 * A wireframe constellation rocket that periodically rises through
 * the hero — fires once shortly after mount and then every 60s.
 *
 * The PNG is a true alpha-channel asset (the dark generated background
 * was processed out via `scripts/transparentize-rocket.mjs`), so it
 * floats cleanly over the page with no blending tricks needed.
 */
export function RocketLaunch() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) return;

    const first = window.setTimeout(() => {
      setTick((t) => t + 1);
    }, FIRST_DELAY_MS);

    const id = window.setInterval(
      () => setTick((t) => t + 1),
      LAUNCH_INTERVAL_MS,
    );

    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, []);

  if (tick === 0) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-y-0 left-[24%] z-[5] hidden items-end md:flex lg:left-[37%]"
    >
      <div
        key={tick}
        className="relative animate-[rocket-rise_11s_cubic-bezier(0.32,0,0.4,1)_forwards]"
        style={{
          filter:
            "drop-shadow(0 0 22px rgba(34,211,238,0.55)) drop-shadow(0 0 40px rgba(217,70,239,0.25))",
        }}
      >
        <Image
          src="/images/hero/rocket-alpha.png"
          alt=""
          width={1536}
          height={1024}
          className="h-auto w-56 select-none"
          priority={false}
        />
      </div>
    </div>
  );
}
