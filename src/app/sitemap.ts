import { MetadataRoute } from "next";
import { posts } from "#site/content";
import { routing } from "@/i18n/routing";
import { getPostLanguage, getTranslationPair } from "@/lib/posts-i18n";
import { buildAlternates, localizedUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    "/",
    "/blog",
    "/about",
    "/projects",
    "/contact",
    "/community",
    "/cv",
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPaths.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: localizedUrl(locale, path),
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "/" ? 1.0 : 0.8,
      alternates: { languages: buildAlternates(locale, path).languages },
    }))
  );

  const seenKeys = new Set<string>();
  const postEntries: MetadataRoute.Sitemap = [];
  for (const post of posts) {
    if (!post.published) continue;
    const pair = getTranslationPair(posts, post);
    const key = post.translationKey ?? post.slug;
    if (seenKeys.has(key)) continue;
    seenKeys.add(key);

    const languages: Record<string, string> = {};
    for (const loc of routing.locales) {
      const tr = pair[loc];
      if (tr) {
        languages[loc] = localizedUrl(loc, `/blog/${tr.slug}`);
      }
    }

    for (const loc of routing.locales) {
      const tr = pair[loc];
      if (!tr) continue;
      // Prefer an explicit `updated` field if Velite ever exposes one; fall back
      // to `date` from the post frontmatter.
      const updatedRaw =
        (tr as unknown as { updated?: string }).updated ?? tr.date;
      const lastModified = new Date(updatedRaw);
      postEntries.push({
        url: localizedUrl(loc, `/blog/${tr.slug}`),
        lastModified,
        changeFrequency: "monthly" as const,
        priority: 0.7,
        alternates: { languages },
      });
    }

    void getPostLanguage(post);
  }

  return [...staticEntries, ...postEntries];
}
