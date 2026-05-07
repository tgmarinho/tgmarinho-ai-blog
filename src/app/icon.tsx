import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

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
          background:
            "radial-gradient(120% 120% at 100% 0%, rgba(34,211,238,0.35) 0%, rgba(232,121,249,0.18) 35%, #0a0a0c 75%)",
          borderRadius: 7,
          boxShadow:
            "inset 0 0 0 1px rgba(255,255,255,0.10), 0 0 0 1px rgba(34,211,238,0.18)",
          color: "transparent",
          backgroundClip: "padding-box",
        }}
      >
        <span
          style={{
            fontSize: 16,
            fontWeight: 800,
            letterSpacing: 1.5,
            color: "#f4f4f5",
            textShadow:
              "0 0 6px rgba(34,211,238,0.55), 0 0 1px rgba(255,255,255,0.9)",
            lineHeight: 1,
            transform: "translateY(0.5px)",
          }}
        >
          TG
        </span>
        {/* corner cyan dot */}
        <div
          style={{
            position: "absolute",
            top: 3,
            right: 3,
            width: 5,
            height: 5,
            borderRadius: 999,
            background: "#22d3ee",
            boxShadow: "0 0 6px 2px rgba(34,211,238,0.85)",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
