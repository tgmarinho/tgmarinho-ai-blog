import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Apple touch icon — Agentic Futurism mark at iOS home-screen size.
// Same composition as the favicon, scaled up with extra editorial details:
// monogram "tg", cyan/magenta corner washes, mono caption, accent dot.
export default function AppleIcon() {
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
          borderRadius: 40,
          boxShadow:
            "inset 0 0 0 1.5px rgba(34,211,238,0.4), inset 0 -50px 100px rgba(232,121,249,0.10)",
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
              "radial-gradient(70% 70% at 0% 100%, rgba(232,121,249,0.5) 0%, rgba(232,121,249,0) 60%)",
          }}
        />
        {/* faint diagonal grid line for editorial detail */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, transparent 49.5%, rgba(255,255,255,0.04) 49.5%, rgba(255,255,255,0.04) 50.5%, transparent 50.5%)",
          }}
        />

        <span
          style={{
            fontSize: 108,
            fontWeight: 900,
            letterSpacing: -3,
            color: "#ffffff",
            lineHeight: 1,
            transform: "translateY(4px)",
            textShadow:
              "0 0 18px rgba(34,211,238,0.45), 0 0 2px rgba(255,255,255,0.95)",
          }}
        >
          tg
        </span>

        {/* corner cyan accent dot */}
        <div
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            width: 16,
            height: 16,
            borderRadius: 999,
            background: "#22d3ee",
            boxShadow: "0 0 18px 5px rgba(34,211,238,0.85)",
          }}
        />

        {/* mono caption */}
        <div
          style={{
            position: "absolute",
            bottom: 16,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            fontFamily: "monospace",
            fontSize: 11,
            letterSpacing: 4,
            color: "rgba(244,244,245,0.55)",
          }}
        >
          tgmarinho/ai
        </div>
      </div>
    ),
    { ...size }
  );
}
