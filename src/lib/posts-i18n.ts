import type { Post } from "#site/content";
import type { Locale } from "@/i18n/routing";

const DEFAULT_LOCALE: Locale = "pt-BR";
const PUBLISH_TIME_ZONE = "America/Campo_Grande";

function todayIso(timeZone = PUBLISH_TIME_ZONE): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function getPostLanguage(post: Pick<Post, "language">): Locale {
  if (post.language === "en") return "en";
  return DEFAULT_LOCALE;
}

export function isPostVisible(post: Pick<Post, "published" | "date">): boolean {
  return post.published && post.date <= todayIso();
}

export function getPostsForLocale<
  T extends Pick<Post, "language" | "published" | "date">
>(
  posts: readonly T[],
  locale: Locale
): T[] {
  return posts.filter(
    (p) => isPostVisible(p) && getPostLanguage(p) === locale
  );
}

export function getTranslationPair<
  T extends Pick<Post, "language" | "translationKey" | "slug" | "published" | "date">
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
