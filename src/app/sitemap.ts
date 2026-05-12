import { MetadataRoute } from "next";
import { posts } from "#site/content";
import { siteConfig } from "@/lib/constants";
import { routing, type Locale } from "@/i18n/routing";
import { getPostLanguage, getTranslationPair } from "@/lib/posts-i18n";

function localePath(locale: Locale, path: string) {
  if (locale === routing.defaultLocale) return path;
  return `/${locale === "en" ? "en" : locale}${path}`;
}

function buildAlternates(path: string) {
  const languages: Record<string, string> = {};
  for (const loc of routing.locales) {
    languages[loc] = `${siteConfig.url}${localePath(loc, path)}`;
  }
  return languages;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = ["", "/blog", "/about", "/projects", "/contact", "/community", "/cv"];

  const staticEntries: MetadataRoute.Sitemap = staticPaths.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: `${siteConfig.url}${localePath(locale, path || "/")}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1.0 : 0.8,
      alternates: { languages: buildAlternates(path || "/") },
    }))
  );

  const seenKeys = new Set<string>();
  const postEntries: MetadataRoute.Sitemap = [];
  for (const post of posts) {
    if (!post.published) continue;
    const postLocale = getPostLanguage(post);
    const pair = getTranslationPair(posts, post);
    const key = post.translationKey ?? post.slug;
    if (seenKeys.has(key)) continue;
    seenKeys.add(key);

    const languages: Record<string, string> = {};
    for (const loc of routing.locales) {
      const tr = pair[loc];
      if (tr) {
        languages[loc] = `${siteConfig.url}${localePath(loc, `/blog/${tr.slug}`)}`;
      }
    }

    for (const loc of routing.locales) {
      const tr = pair[loc];
      if (!tr) continue;
      postEntries.push({
        url: `${siteConfig.url}${localePath(loc, `/blog/${tr.slug}`)}`,
        lastModified: new Date(tr.date),
        changeFrequency: "monthly" as const,
        priority: 0.7,
        alternates: { languages },
      });
    }
    // Fallback: post without language frontmatter still gets indexed under defaultLocale via getPostLanguage
    void postLocale;
  }

  return [...staticEntries, ...postEntries];
}
