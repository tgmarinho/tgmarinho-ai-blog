import { allPosts as posts } from "@/lib/all-posts";
import { sortPostsByDate } from "@/lib/velite";
import { siteConfig } from "@/lib/constants";
import { getPostsForLocale } from "@/lib/posts-i18n";
import { routing, type Locale } from "@/i18n/routing";
import { localizedUrl } from "@/lib/seo";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

function buildFeed(locale: Locale) {
  const localePosts = sortPostsByDate(getPostsForLocale(posts, locale));
  const homeUrl = localizedUrl(locale, "/");
  const feedUrl = localizedUrl(locale, "/rss.xml");

  const items = localePosts
    .map(
      (post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${localizedUrl(locale, `/blog/${post.slug}`)}</link>
      <guid>${localizedUrl(locale, `/blog/${post.slug}`)}</guid>
      <description><![CDATA[${post.description ?? ""}]]></description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
    </item>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${siteConfig.name}${locale === "pt-BR" ? "" : " (EN)"}</title>
    <link>${homeUrl}</link>
    <description>${siteConfig.description}</description>
    <language>${locale}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale: rawLocale } = await params;
  const locale: Locale =
    rawLocale === "en" ? "en" : routing.defaultLocale;

  return new Response(buildFeed(locale), {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
