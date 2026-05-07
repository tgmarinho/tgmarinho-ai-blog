import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

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
          background:
            "radial-gradient(110% 110% at 100% 0%, rgba(34,211,238,0.45) 0%, rgba(232,121,249,0.22) 30%, #0a0a0c 70%)",
          borderRadius: 38,
          boxShadow:
            "inset 0 0 0 1px rgba(255,255,255,0.10), inset 0 -40px 80px rgba(232,121,249,0.10)",
        }}
      >
        {/* aurora wash */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 38,
            background:
              "radial-gradient(60% 60% at 20% 90%, rgba(232,121,249,0.18) 0%, rgba(232,121,249,0) 70%)",
          }}
        />

        <span
          style={{
            fontSize: 92,
            fontWeight: 800,
            letterSpacing: 6,
            color: "#fafafa",
            textShadow:
              "0 0 22px rgba(34,211,238,0.55), 0 0 2px rgba(255,255,255,0.9)",
            lineHeight: 1,
            transform: "translateY(2px)",
          }}
        >
          TG
        </span>

        {/* corner cyan dot */}
        <div
          style={{
            position: "absolute",
            top: 18,
            right: 18,
            width: 18,
            height: 18,
            borderRadius: 999,
            background: "#22d3ee",
            boxShadow: "0 0 22px 6px rgba(34,211,238,0.8)",
          }}
        />

        {/* mono caption */}
        <div
          style={{
            position: "absolute",
            bottom: 14,
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
