// Helper layer over Velite output. The default `posts` export from
// `#site/content` includes heavy `body`/`code` strings — callers that only
// need metadata should reach for the slim selectors below to keep route
// bundles small.

import readingTime from "reading-time";
import { allPosts as posts, type AnyPost as Post } from "@/lib/all-posts";
import type { Locale } from "@/i18n/routing";
import { getPostLanguage, isPostVisible } from "@/lib/posts-i18n";
import { categoryLabel, normalizeCategories } from "@/lib/categories";

export function sortPostsByDate<T extends { date: string; published: boolean }>(
  posts: T[]
): T[] {
  return posts
    .filter((post) => isPostVisible(post))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Expects already-normalized categories (see `toMeta`). When a locale is
// passed, the list is ordered by the localized display label so the filter
// reads naturally; otherwise it falls back to a stable key sort.
export function getAllCategories(
  posts: Array<{ categories: string[]; date: string; published: boolean }>,
  locale?: Locale
): string[] {
  const categories = new Set<string>();
  posts
    .filter((post) => isPostVisible(post))
    .forEach((post) =>
      post.categories.forEach((cat) => categories.add(cat))
    );
  const list = Array.from(categories);
  if (locale) {
    return list.sort((a, b) =>
      categoryLabel(a, locale).localeCompare(categoryLabel(b, locale), locale)
    );
  }
  return list.sort();
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
    categories: normalizeCategories(post.categories),
    published: post.published,
    readingTimeMinutes: Math.ceil(stats.minutes),
    readingTimeText: stats.text,
  };
}

export function getPostsMeta(locale?: Locale): PostMeta[] {
  const filtered = locale
    ? posts.filter((p) => isPostVisible(p) && getPostLanguage(p) === locale)
    : posts.filter((post) => isPostVisible(post));
  return sortPostsByDate(filtered.map(toMeta));
}

export function getRecentPosts(n: number, locale?: Locale): PostMeta[] {
  return getPostsMeta(locale).slice(0, n);
}

export function getPostBySlug(locale: Locale, slug: string): Post | undefined {
  return posts.find(
    (p) =>
      isPostVisible(p) &&
      p.slug === slug &&
      getPostLanguage(p) === locale
  );
}
