import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";
import { siteConfig } from "@/lib/constants";
import { type Locale } from "@/i18n/routing";

export const alt = `${siteConfig.name}, ${siteConfig.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  let tagline = siteConfig.shareDescription;
  try {
    const t = await getTranslations({ locale, namespace: "home.hero" });
    tagline = t("subtitle");
  } catch {
    // fall back to shareDescription
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "#05060a",
          position: "relative",
          fontFamily: "system-ui, sans-serif",
          color: "#ffffff",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(900px 600px at 100% 0%, rgba(34,211,238,0.28) 0%, rgba(34,211,238,0) 60%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(900px 600px at 0% 100%, rgba(232,121,249,0.22) 0%, rgba(232,121,249,0) 60%)",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 22,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "rgba(34,211,238,0.9)",
            fontFamily: "monospace",
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: "#22d3ee",
              boxShadow: "0 0 12px 2px rgba(34,211,238,0.8)",
            }}
          />
          tgmarinhopro.com
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 96,
              fontWeight: 800,
              letterSpacing: -3,
              lineHeight: 1.02,
              color: "#ffffff",
            }}
          >
            {siteConfig.name}
          </div>
          <div
            style={{
              fontSize: 36,
              lineHeight: 1.25,
              color: "rgba(255,255,255,0.78)",
              maxWidth: 980,
            }}
          >
            {tagline}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 22,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.55)",
            fontFamily: "monospace",
          }}
        >
          <span>{siteConfig.role}</span>
          <span style={{ color: "rgba(232,121,249,0.9)" }}>
            {locale === "en" ? "EN" : "PT-BR"}
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
