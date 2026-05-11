import { useId } from "react";
import { cn } from "@/lib/utils";

interface VolumetricLightProps {
  className?: string;
}

/**
 * Volumetric backlight — bright white volumetric haze coming from the
 * right edge, modeled after grok.com. Pure SVG + CSS, no assets.
 *
 * Approach: many overlapping soft radial blooms (creates a non-uniform,
 * fibrous-looking distribution without banding) + a low-displacement
 * feTurbulence layer that introduces organic wisp texture without
 * producing the "splattered" artifacts that high-scale displacement does.
 */
export function VolumetricLight({ className }: VolumetricLightProps) {
  const uid = useId().replace(/:/g, "");

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
    >
      <div
        className="absolute"
        style={{
          top: "-30%",
          right: "-25%",
          width: "95%",
          height: "160%",
          background:
            "radial-gradient(ellipse 55% 55% at 80% 50%, rgba(255,255,255,0.55) 0%, rgba(235,245,255,0.32) 18%, rgba(186,230,253,0.14) 38%, rgba(125,211,252,0.06) 58%, transparent 78%)",
          animation: "vlight-breathe 11s ease-in-out infinite",
          filter: "blur(40px)",
        }}
      />

      <div
        className="absolute"
        style={{
          top: "-10%",
          right: "5%",
          width: "55%",
          height: "100%",
          background:
            "radial-gradient(ellipse 50% 60% at 65% 40%, rgba(255,255,255,0.40), rgba(219,234,254,0.16) 35%, transparent 65%)",
          animation: "vlight-drift 14s ease-in-out infinite",
          filter: "blur(50px)",
          mixBlendMode: "screen",
        }}
      />

      <div
        className="absolute"
        style={{
          top: "20%",
          right: "-10%",
          width: "60%",
          height: "80%",
          background:
            "radial-gradient(circle at 75% 60%, rgba(255,255,255,0.30), rgba(186,230,253,0.10) 40%, transparent 65%)",
          animation: "vlight-drift 17s ease-in-out infinite reverse",
          filter: "blur(60px)",
          mixBlendMode: "screen",
        }}
      />

      <div
        className="absolute inset-y-0 right-0 w-[42%]"
        style={{
          background:
            "linear-gradient(to left, rgba(255,255,255,0.22) 0%, rgba(219,234,254,0.08) 30%, transparent 75%)",
          filter: "blur(35px)",
          mixBlendMode: "screen",
        }}
      />

      <svg
        className="absolute inset-0 h-full w-full"
        style={{ mixBlendMode: "screen", opacity: 0.72 }}
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <defs>
          <radialGradient
            id={`${uid}-wisps`}
            cx="85%"
            cy="50%"
            r="55%"
          >
            <stop offset="0%" stopColor="rgba(255,255,255,0.42)" />
            <stop offset="35%" stopColor="rgba(235,245,255,0.22)" />
            <stop offset="65%" stopColor="rgba(186,230,253,0.08)" />
            <stop offset="100%" stopColor="rgba(186,230,253,0)" />
          </radialGradient>
          <filter
            id={`${uid}-fiber`}
            x="-10%"
            y="-10%"
            width="120%"
            height="120%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.013 0.021"
              numOctaves="2"
              seed="11"
              result="n"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="n"
              scale="14"
              xChannelSelector="R"
              yChannelSelector="G"
              result="w"
            />
            <feGaussianBlur in="w" stdDeviation="0.8" />
          </filter>
        </defs>
        <rect
          x="0"
          y="0"
          width="100"
          height="100"
          fill={`url(#${uid}-wisps)`}
          filter={`url(#${uid}-fiber)`}
          style={{ animation: "vlight-noise-shift 22s ease-in-out infinite" }}
        />
      </svg>

      <div
        className="absolute"
        style={{
          top: "30%",
          right: "15%",
          width: "30%",
          height: "45%",
          background:
            "radial-gradient(circle at 50% 50%, rgba(217,70,239,0.10), transparent 60%)",
          animation: "vlight-drift 21s ease-in-out infinite",
          filter: "blur(70px)",
          mixBlendMode: "screen",
        }}
      />
    </div>
  );
}
