import type { Post } from "#site/content";
import type { Locale } from "@/i18n/routing";

const DEFAULT_LOCALE: Locale = "pt-BR";

export function getPostLanguage(post: Pick<Post, "language">): Locale {
  if (post.language === "en") return "en";
  return DEFAULT_LOCALE;
}

export function getPostsForLocale<T extends Pick<Post, "language" | "published">>(
  posts: readonly T[],
  locale: Locale
): T[] {
  return posts.filter(
    (p) => p.published && getPostLanguage(p) === locale
  );
}

export function getTranslationPair<
  T extends Pick<Post, "language" | "translationKey" | "slug" | "published">
>(posts: readonly T[], post: T): Partial<Record<Locale, T>> {
  const pair: Partial<Record<Locale, T>> = {
    [getPostLanguage(post)]: post,
  };
  if (!post.translationKey) return pair;
  for (const p of posts) {
    if (!p.published) continue;
    if (p.translationKey !== post.translationKey) continue;
    const lang = getPostLanguage(p);
    if (!pair[lang]) pair[lang] = p;
  }
  return pair;
}
