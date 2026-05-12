import { siteConfig } from "@/lib/constants";
import { routing, type Locale } from "@/i18n/routing";

/**
 * Build the localized path for a given route.
 * Routing uses `localePrefix: "as-needed"` and `pt-BR` as default,
 * so pt-BR has no prefix while `en` does.
 */
export function localizedPath(locale: Locale, path: string = "/"): string {
  const normalized = path === "" ? "/" : path.startsWith("/") ? path : `/${path}`;
  if (locale === routing.defaultLocale) {
    return normalized;
  }
  return normalized === "/" ? `/${locale}` : `/${locale}${normalized}`;
}

/**
 * Absolute URL for a given locale + path, based on `siteConfig.url`.
 */
export function localizedUrl(locale: Locale, path: string = "/"): string {
  return `${siteConfig.url}${localizedPath(locale, path)}`;
}

/**
 * Build the `alternates` block for `Metadata` — canonical for the current
 * locale plus `languages` with one entry per locale and an `x-default`
 * pointing to `pt-BR` (per AGENTS.md / CLAUDE.md).
 */
export function buildAlternates(locale: Locale, path: string = "/") {
  const languages: Record<string, string> = {};
  for (const loc of routing.locales) {
    languages[loc] = localizedUrl(loc, path);
  }
  languages["x-default"] = localizedUrl(routing.defaultLocale, path);
  return {
    canonical: localizedUrl(locale, path),
    languages,
  };
}

/** Map our locale tag to the OG `locale` convention. */
export function ogLocale(locale: Locale): string {
  return locale === "en" ? "en_US" : "pt_BR";
}
