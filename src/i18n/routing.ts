import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["pt-BR", "en"] as const,
  defaultLocale: "pt-BR",
  localePrefix: {
    mode: "as-needed",
    prefixes: {
      en: "/en",
    },
  },
  localeCookie: {
    name: "NEXT_LOCALE",
    maxAge: 60 * 60 * 24 * 365,
  },
});

export type Locale = (typeof routing.locales)[number];
