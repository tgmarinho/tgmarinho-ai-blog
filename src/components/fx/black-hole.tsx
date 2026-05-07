import { cn } from "@/lib/utils";
import { useId } from "react";

interface BlackHoleProps {
  className?: string;
  size?: number;
  /** Tilt of the accretion disk in degrees. Defaults to a gentle 22°. */
  tiltDeg?: number;
}

/** Deterministic sparkle fields — annulus around the horizon, inside viewBox. */
const DUST = [
  { cx: -72, cy: -38, r: 0.9, f: "rgba(34,211,238,0.95)", d: 0, dur: 3.2 },
  { cx: -58, cy: 52, r: 0.55, f: "rgba(255,255,255,0.9)", d: 0.4, dur: 4.1 },
  { cx: 78, cy: -44, r: 0.7, f: "rgba(217,70,239,0.95)", d: 0.9, dur: 3.6 },
  { cx: 68, cy: 58, r: 0.65, f: "rgba(34,211,238,0.85)", d: 0.2, dur: 4.8 },
  { cx: -82, cy: 12, r: 0.45, f: "rgba(255,255,255,0.75)", d: 1.1, dur: 3.9 },
  { cx: 42, cy: -78, r: 0.5, f: "rgba(167,139,250,0.9)", d: 0.6, dur: 3.4 },
  { cx: -44, cy: -68, r: 0.75, f: "rgba(34,211,238,0.9)", d: 1.4, dur: 4.4 },
  { cx: 86, cy: 22, r: 0.4, f: "rgba(255,255,255,0.8)", d: 0.3, dur: 5.2 },
  { cx: -20, cy: 82, r: 0.55, f: "rgba(217,70,239,0.8)", d: 0.8, dur: 3.7 },
  { cx: 22, cy: 76, r: 0.6, f: "rgba(34,211,238,0.75)", d: 1.6, dur: 4.0 },
  { cx: -88, cy: -12, r: 0.5, f: "rgba(34,211,238,0.7)", d: 0.1, dur: 4.6 },
  { cx: 54, cy: -62, r: 0.85, f: "rgba(217,70,239,0.85)", d: 1.2, dur: 3.1 },
  { cx: -62, cy: 68, r: 0.4, f: "rgba(255,255,255,0.7)", d: 0.5, dur: 5.0 },
  { cx: 8, cy: -88, r: 0.45, f: "rgba(167,139,250,0.8)", d: 1.8, dur: 3.8 },
  { cx: -36, cy: -82, r: 0.5, f: "rgba(34,211,238,0.65)", d: 0.7, dur: 4.2 },
  { cx: 92, cy: -8, r: 0.35, f: "rgba(255,255,255,0.65)", d: 1.0, dur: 4.9 },
  { cx: -74, cy: 42, r: 0.7, f: "rgba(217,70,239,0.75)", d: 0.25, dur: 3.5 },
  { cx: 30, cy: 84, r: 0.4, f: "rgba(34,211,238,0.9)", d: 1.3, dur: 4.3 },
  { cx: -48, cy: -52, r: 0.55, f: "rgba(255,255,255,0.55)", d: 1.5, dur: 5.4 },
  { cx: 64, cy: 44, r: 0.5, f: "rgba(167,139,250,0.7)", d: 0.9, dur: 3.3 },
  { cx: -92, cy: 36, r: 0.38, f: "rgba(34,211,238,0.6)", d: 0.45, dur: 4.7 },
  { cx: 12, cy: 90, r: 0.42, f: "rgba(217,70,239,0.65)", d: 1.7, dur: 4.1 },
] as const;

/** Forked lightning arcs inside the horizon — hand-tuned for chaos. */
const BOLTS = [
  {
    d: "M -6 -2 C -2 -12 8 -14 12 -6",
    w: 0.55,
  },
  {
    d: "M 4 2 C 14 4 16 14 10 18",
    w: 0.45,
  },
  {
    d: "M -14 6 C -6 2 2 8 -2 16",
    w: 0.4,
  },
  {
    d: "M 8 -10 C 4 -4 -4 -6 -10 2",
    w: 0.5,
  },
  {
    d: "M 0 -18 C 3 -8 10 -4 16 4",
    w: 0.35,
  },
] as const;

/**
 * Decorative black hole with a bent accretion disk.
 *
 * Pure SVG, fully contained inside its bounding box. The event horizon
 * hides a subtle “storm” — displaced plasma, turbulent noise, and
 * strobing bolt arcs — clipped to the inner circle so it reads as weather
 * inside the black hole, not spill on the page.
 */
export function BlackHole({
  className,
  size = 240,
  tiltDeg = 22,
}: BlackHoleProps) {
  const uid = useId().replace(/:/g, "");

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute select-none overflow-hidden",
        className
      )}
      style={{ width: size, height: size }}
    >
      <div
        className="absolute inset-0 rounded-full blur-[36px]"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(34,211,238,0.32) 0%, rgba(217,70,239,0.18) 30%, transparent 60%)",
        }}
      />

      <svg
        viewBox="-100 -100 200 200"
        className="relative h-full w-full"
      >
        <defs>
          <clipPath id={`${uid}-horizon`}>
            <circle r="29.2" />
          </clipPath>

          <radialGradient
            id={`${uid}-inner-base`}
            cx="38%"
            cy="32%"
            r="75%"
            gradientUnits="objectBoundingBox"
          >
            <stop offset="0%" stopColor="#0a1522" />
            <stop offset="45%" stopColor="#03060c" />
            <stop offset="100%" stopColor="#000000" />
          </radialGradient>

          <radialGradient id={`${uid}-storm-plasma`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(34,211,238,0.35)" />
            <stop offset="35%" stopColor="rgba(8,20,40,0.5)" />
            <stop offset="65%" stopColor="rgba(217,70,239,0.15)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.9)" />
          </radialGradient>

          {/* Turbulence warps the plasma gradient = churning storm */}
          <filter
            id={`${uid}-storm-warp`}
            x="-40%"
            y="-40%"
            width="180%"
            height="180%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.07 0.1"
              numOctaves="4"
              seed="3"
              result="noise"
            >
              <animate
                attributeName="baseFrequency"
                dur="14s"
                values="0.06 0.09;0.11 0.15;0.07 0.11;0.06 0.09"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="22"
              xChannelSelector="R"
              yChannelSelector="G"
              result="warped"
            />
            <feGaussianBlur in="warped" stdDeviation="0.6" result="soft" />
            <feMerge>
              <feMergeNode in="soft" />
            </feMerge>
          </filter>

          {/* Faster fine-grain flicker (secondary layer) */}
          <filter
            id={`${uid}-storm-flicker`}
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="turbulence"
              baseFrequency="0.35"
              numOctaves="2"
              seed="11"
              result="fine"
            >
              <animate
                attributeName="seed"
                dur="2.8s"
                values="11;19;7;22;11"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feColorMatrix
              in="fine"
              type="matrix"
              values="0.15 0 0 0 0.15
                      0 0.25 0 0 0.45
                      0 0 0.35 0 0.55
                      0 0 0 0.4 0"
              result="tint"
            />
            <feGaussianBlur in="tint" stdDeviation="0.35" />
          </filter>

          <filter id="bh-nebula-soft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="10" result="b" />
            <feMerge>
              <feMergeNode in="b" />
            </feMerge>
          </filter>

          <linearGradient
            id="bh-disk"
            x1="-100"
            y1="0"
            x2="100"
            y2="0"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="rgba(34,211,238,0)" />
            <stop offset="22%" stopColor="rgba(34,211,238,0.85)" />
            <stop offset="50%" stopColor="rgba(167,139,250,0.95)" />
            <stop offset="78%" stopColor="rgba(217,70,239,0.85)" />
            <stop offset="100%" stopColor="rgba(217,70,239,0)" />
          </linearGradient>

          <radialGradient id="bh-photon-ring" cx="50%" cy="50%" r="50%">
            <stop offset="60%" stopColor="rgba(255,255,255,0)" />
            <stop offset="78%" stopColor="rgba(255,255,255,0.55)" />
            <stop offset="86%" stopColor="rgba(34,211,238,0.85)" />
            <stop offset="100%" stopColor="rgba(217,70,239,0)" />
          </radialGradient>
        </defs>

        {/* Nebulous smears — cosmic dust clouds */}
        <g opacity="0.55" style={{ mixBlendMode: "screen" }}>
          <ellipse
            cx="-12"
            cy="8"
            rx="86"
            ry="28"
            fill="rgba(34,211,238,0.12)"
            transform="rotate(-18)"
            filter="url(#bh-nebula-soft)"
          />
          <ellipse
            cx="14"
            cy="-6"
            rx="72"
            ry="36"
            fill="rgba(217,70,239,0.1)"
            transform="rotate(28)"
            filter="url(#bh-nebula-soft)"
          />
          <ellipse
            cx="0"
            cy="0"
            rx="92"
            ry="22"
            fill="rgba(167,139,250,0.08)"
            transform="rotate(8)"
            filter="url(#bh-nebula-soft)"
          />
        </g>

        <circle r="78" fill="url(#bh-photon-ring)" opacity="0.55" />

        {/* Space dust — twinkle + very slow group drift */}
        <g
          style={{
            transformOrigin: "center",
            transformBox: "fill-box",
            animation: "bh-dust-drift 28s ease-in-out infinite",
          }}
        >
          {DUST.map((p, i) => (
            <circle
              key={i}
              cx={p.cx}
              cy={p.cy}
              r={p.r}
              fill={p.f}
              style={{
                animation: `bh-dust-twinkle ${p.dur}s ease-in-out infinite`,
                animationDelay: `${p.d}s`,
              }}
            />
          ))}
        </g>

        <g
          style={{
            transformOrigin: "center",
            transformBox: "fill-box",
            animation: "bh-spin 28s linear infinite",
            mixBlendMode: "screen",
          }}
        >
          <g transform={`rotate(${tiltDeg})`}>
            <ellipse
              cx="0"
              cy="0"
              rx="62"
              ry="18"
              fill="none"
              stroke="url(#bh-disk)"
              strokeWidth="10"
              opacity="0.7"
            />
            <ellipse
              cx="0"
              cy="0"
              rx="44"
              ry="11"
              fill="none"
              stroke="rgba(255,255,255,0.85)"
              strokeWidth="0.7"
              opacity="0.65"
            />
          </g>
        </g>

        {/* Event horizon — storm inside the black disk (clipped) */}
        <g clipPath={`url(#${uid}-horizon)`}>
          <circle r="30" fill={`url(#${uid}-inner-base)`} />
          <circle
            r="30"
            fill={`url(#${uid}-storm-plasma)`}
            filter={`url(#${uid}-storm-warp)`}
            opacity={0.92}
            style={{ mixBlendMode: "screen" }}
          />
          <rect
            x="-35"
            y="-35"
            width="70"
            height="70"
            fill="white"
            filter={`url(#${uid}-storm-flicker)`}
            opacity={0.45}
            style={{ mixBlendMode: "overlay" }}
          />
          {/* Slow swirl — entire inner mass rotates like a gas torus */}
          <g
            style={{
              transformOrigin: "center",
              transformBox: "fill-box",
              animation: "bh-storm-swirl 22s linear infinite",
              mixBlendMode: "screen",
              opacity: 0.35,
            }}
          >
            <ellipse
              cx="0"
              cy="0"
              rx="22"
              ry="14"
              fill="rgba(34,211,238,0.25)"
              transform="rotate(-35)"
              style={{ filter: "blur(3px)" }}
            />
            <ellipse
              cx="0"
              cy="0"
              rx="18"
              ry="20"
              fill="rgba(217,70,239,0.18)"
              transform="rotate(48)"
              style={{ filter: "blur(4px)" }}
            />
          </g>
          {/* Lightning forks */}
          <g style={{ mixBlendMode: "screen" }}>
            {BOLTS.map((bolt, i) => (
              <path
                key={i}
                d={bolt.d}
                fill="none"
                stroke="rgba(190,240,255,0.85)"
                strokeWidth={bolt.w}
                strokeLinecap="round"
                opacity={0}
              >
                <animate
                  attributeName="opacity"
                  dur={`${2.4 + i * 0.35}s`}
                  values="0;0;0.95;0;0;0"
                  keyTimes="0;0.4;0.45;0.52;0.6;1"
                  repeatCount="indefinite"
                  begin={`${i * 0.45}s`}
                />
              </path>
            ))}
          </g>
        </g>

        <circle
          r="31"
          fill="none"
          stroke="rgba(34,211,238,0.9)"
          strokeWidth="0.7"
          opacity="0.9"
        />
        <circle
          r="33.5"
          fill="none"
          stroke="rgba(34,211,238,0.45)"
          strokeWidth="1.5"
          opacity="0.8"
          style={{ filter: "blur(2px)" }}
        />
      </svg>
    </div>
  );
}
