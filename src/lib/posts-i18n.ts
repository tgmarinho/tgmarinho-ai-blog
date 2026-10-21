import type { Post } from "#site/content";
import type { Locale } from "@/i18n/routing";

const DEFAULT_LOCALE: Locale = "pt-BR";

export function isPostVisible(
  post: Pick<Post, "date" | "published">,
  now = new Date()
): boolean {
  if (!post.published) return false;
  const publishedAt = new Date(post.date).getTime();
  return Number.isFinite(publishedAt) && publishedAt <= now.getTime();
}

export function getPostLanguage(post: Pick<Post, "language">): Locale {
  if (post.language === "en") return "en";
  return DEFAULT_LOCALE;
}

export function getPostsForLocale<
  T extends Pick<Post, "date" | "language" | "published">
>(
  posts: readonly T[],
  locale: Locale
): T[] {
  return posts.filter(
    (p) => isPostVisible(p) && getPostLanguage(p) === locale
  );
}

export function getTranslationPair<
  T extends Pick<
    Post,
    "date" | "language" | "translationKey" | "slug" | "published"
  >
>(posts: readonly T[], post: T): Partial<Record<Locale, T>> {
  const pair: Partial<Record<Locale, T>> = {
    [getPostLanguage(post)]: post,
  };
  if (!post.translationKey) return pair;
  for (const p of posts) {
    if (!isPostVisible(p)) continue;
    if (p.translationKey !== post.translationKey) continue;
    const lang = getPostLanguage(p);
    if (!pair[lang]) pair[lang] = p;
  }
  return pair;
}
