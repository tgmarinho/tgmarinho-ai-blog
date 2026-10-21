import { ImageResponse } from "next/og";
import { allPosts as posts } from "@/lib/all-posts";
import { siteConfig } from "@/lib/constants";
import { formatIsoDateForDisplay } from "@/lib/format-iso-date";
import { getPostLanguage, isPostVisible } from "@/lib/posts-i18n";
import { type Locale } from "@/i18n/routing";

export const alt = `${siteConfig.name}, blog post`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateImageMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug && isPostVisible(p));
  return [{ id: "main", alt: post?.title ?? alt, contentType, size }];
}

export default async function PostOpengraphImage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { slug, locale } = await params;
  const post = posts.find((p) => p.slug === slug && isPostVisible(p));

  if (!post) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#05060a",
            color: "#ffffff",
            fontSize: 48,
          }}
        >
          {siteConfig.name}
        </div>
      ),
      { ...size }
    );
  }

  const postLocale = getPostLanguage(post);
  const dateLabel = formatIsoDateForDisplay(
    post.date,
    postLocale === "en" ? "en-US" : "pt-BR",
    { year: "numeric", month: "long", day: "numeric" }
  );
  const category = post.categories?.[0] ?? "post";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: 72,
          background: "#05060a",
          position: "relative",
          color: "#ffffff",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(800px 540px at 100% 0%, rgba(34,211,238,0.22) 0%, rgba(34,211,238,0) 60%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(800px 540px at 0% 100%, rgba(232,121,249,0.18) 0%, rgba(232,121,249,0) 60%)",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            fontSize: 20,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "rgba(34,211,238,0.9)",
            fontFamily: "monospace",
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 999,
              background: "#22d3ee",
              boxShadow: "0 0 10px 2px rgba(34,211,238,0.85)",
            }}
          />
          {category}
          <span style={{ color: "rgba(255,255,255,0.25)" }}>·</span>
          <span style={{ color: "rgba(255,255,255,0.55)" }}>{dateLabel}</span>
        </div>

        <div
          style={{
            marginTop: 48,
            display: "flex",
            fontSize: post.title.length > 80 ? 60 : 76,
            fontWeight: 700,
            lineHeight: 1.06,
            letterSpacing: -2,
            color: "#ffffff",
            maxWidth: 1056,
          }}
        >
          {post.title}
        </div>

        <div style={{ flex: 1 }} />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 22,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.6)",
            fontFamily: "monospace",
          }}
        >
          <span>{siteConfig.author}</span>
          <span style={{ color: "rgba(232,121,249,0.9)" }}>
            {locale === "en" ? "EN" : "PT-BR"}
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
