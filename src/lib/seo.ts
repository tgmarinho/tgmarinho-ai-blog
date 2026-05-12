import { siteConfig } from "@/lib/constants";
import { routing, type Locale } from "@/i18n/routing";

/**
 * Builds a locale-prefixed path. The default locale (pt-BR) is served at the root
 * thanks to next-intl's `as-needed` strategy, so we omit its prefix.
 */
export function localePath(locale: Locale, path: string = "/"): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (locale === routing.defaultLocale) return normalized;
  return `/${locale === "en" ? "en" : locale}${normalized === "/" ? "" : normalized}` || "/";
}

/**
 * Absolute URL for a given locale + path.
 */
export function localizedUrl(locale: Locale, path: string = "/"): string {
  return `${siteConfig.url}${localePath(locale, path)}`;
}

/**
 * Builds the `alternates.languages` map for a shared logical path
 * (one entry per supported locale).
 */
export function buildAlternates(path: string = "/"): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const loc of routing.locales) {
    languages[loc] = localizedUrl(loc, path);
  }
  return languages;
}

/**
 * Open Graph locale tag for a given app locale.
 */
export function ogLocale(locale: Locale): string {
  return locale === "en" ? "en_US" : "pt_BR";
}
