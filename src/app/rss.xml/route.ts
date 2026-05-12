import { posts } from "#site/content";
import { sortPostsByDate } from "@/lib/velite";
import { siteConfig } from "@/lib/constants";
import { getPostsForLocale } from "@/lib/posts-i18n";
import { routing, type Locale } from "@/i18n/routing";

function buildFeed(locale: Locale, feedUrl: string) {
  const localePosts = sortPostsByDate(getPostsForLocale(posts, locale));
  const blogBase = locale === routing.defaultLocale ? "/blog" : `/en/blog`;

  const items = localePosts
    .map(
      (post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${siteConfig.url}${blogBase}/${post.slug}</link>
      <guid>${siteConfig.url}${blogBase}/${post.slug}</guid>
      <description><![CDATA[${post.description ?? ""}]]></description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
    </item>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${siteConfig.name}${locale === "pt-BR" ? "" : " (EN)"}</title>
    <link>${siteConfig.url}${locale === "pt-BR" ? "" : "/en"}</link>
    <description>${siteConfig.description}</description>
    <language>${locale}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;
}

export function GET(request: Request) {
  const url = new URL(request.url);
  const localeParam = url.searchParams.get("locale");
  const locale: Locale = localeParam === "en" ? "en" : routing.defaultLocale;
  const feed = buildFeed(locale, url.toString());

  return new Response(feed, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
