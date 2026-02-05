import { MetadataRoute } from "next";
import { posts } from "#site/content";
import { siteConfig } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const postUrls = posts
    .filter((post) => post.published)
    .map((post) => ({
      url: `${siteConfig.url}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

  const staticPages = [
    { url: siteConfig.url, priority: 1.0 },
    { url: `${siteConfig.url}/blog`, priority: 0.9 },
    { url: `${siteConfig.url}/about`, priority: 0.8 },
    { url: `${siteConfig.url}/projects`, priority: 0.8 },
    { url: `${siteConfig.url}/contact`, priority: 0.7 },
    { url: `${siteConfig.url}/community`, priority: 0.6 },
  ].map((page) => ({
    ...page,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
  }));

  return [...staticPages, ...postUrls];
}
