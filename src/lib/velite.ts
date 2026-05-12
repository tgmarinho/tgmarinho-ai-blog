// Helper layer over Velite output. The default `posts` export from
// `#site/content` includes heavy `body`/`code` strings — callers that only
// need metadata should reach for the slim selectors below to keep route
// bundles small.

import readingTime from "reading-time";
import { posts, type Post } from "#site/content";
import type { Locale } from "@/i18n/routing";
import { getPostLanguage } from "@/lib/posts-i18n";

export function sortPostsByDate<T extends { date: string; published: boolean }>(
  posts: T[]
): T[] {
  return posts
    .filter((post) => post.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getAllCategories(
  posts: Array<{ categories: string[]; published: boolean }>
): string[] {
  const categories = new Set<string>();
  posts
    .filter((p) => p.published)
    .forEach((post) =>
      post.categories.forEach((cat) => categories.add(cat))
    );
  return Array.from(categories).sort();
}

// Slim shape — intentionally excludes `body`/`code`/`plainBody` so route
// bundles don't drag the full markdown payload of every post.
export interface PostMeta {
  title: string;
  description?: string;
  date: string;
  slug: string;
  language: Post["language"];
  translationKey: string;
  image?: string;
  categories: string[];
  published: boolean;
  /** Pre-computed so consumers don't have to ship `body` to the client. */
  readingTimeMinutes: number;
  readingTimeText: string;
}

function toMeta(post: Post): PostMeta {
  const stats = readingTime(post.body || "");
  return {
    title: post.title,
    description: post.description,
    date: post.date,
    slug: post.slug,
    language: post.language,
    translationKey: post.translationKey,
    image: post.image,
    categories: post.categories,
    published: post.published,
    readingTimeMinutes: Math.ceil(stats.minutes),
    readingTimeText: stats.text,
  };
}

export function getPostsMeta(locale?: Locale): PostMeta[] {
  const filtered = locale
    ? posts.filter((p) => p.published && getPostLanguage(p) === locale)
    : posts.filter((p) => p.published);
  return sortPostsByDate(filtered.map(toMeta));
}

export function getRecentPosts(n: number, locale?: Locale): PostMeta[] {
  return getPostsMeta(locale).slice(0, n);
}

export function getPostBySlug(locale: Locale, slug: string): Post | undefined {
  return posts.find(
    (p) =>
      p.published &&
      p.slug === slug &&
      getPostLanguage(p) === locale
  );
}
