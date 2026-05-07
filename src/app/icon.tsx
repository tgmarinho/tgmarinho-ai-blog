import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Agentic Futurism mark — high-contrast at 16/32px favicon sizes.
// Letters are sharp white over a deep canvas; cyan/magenta wash is in the
// corners only, so the glyph stays legible even on browser tab strips.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          background: "#0a0a0c",
          borderRadius: 8,
          boxShadow:
            "inset 0 0 0 1px rgba(34,211,238,0.35), 0 0 0 1px rgba(0,0,0,0.4)",
          overflow: "hidden",
        }}
      >
        {/* cyan corner wash (top-right) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(70% 70% at 100% 0%, rgba(34,211,238,0.55) 0%, rgba(34,211,238,0) 60%)",
          }}
        />
        {/* magenta corner wash (bottom-left) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(70% 70% at 0% 100%, rgba(232,121,249,0.45) 0%, rgba(232,121,249,0) 60%)",
          }}
        />

        <span
          style={{
            fontSize: 18,
            fontWeight: 900,
            letterSpacing: -0.5,
            color: "#ffffff",
            lineHeight: 1,
            transform: "translateY(0.5px)",
            textShadow: "0 0 1px rgba(255,255,255,0.9)",
          }}
        >
          tg
        </span>

        {/* corner cyan accent dot */}
        <div
          style={{
            position: "absolute",
            top: 4,
            right: 4,
            width: 4,
            height: 4,
            borderRadius: 999,
            background: "#22d3ee",
            boxShadow: "0 0 4px 1px rgba(34,211,238,0.95)",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
