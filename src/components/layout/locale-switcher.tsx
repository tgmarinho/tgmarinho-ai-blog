"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";

export function LocaleSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("localeSwitcher");
  const [isPending, startTransition] = useTransition();

  const onSelect = (next: Locale) => {
    if (next === locale) return;
    trackEvent("locale_switch", { from: locale, to: next });
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  };

  return (
    <div
      role="group"
      aria-label={t("label")}
      className="inline-flex items-center gap-0.5 rounded-full border border-white/[0.06] bg-white/[0.025] p-0.5 font-mono text-[10px] uppercase tracking-[0.18em] backdrop-blur-md"
    >
      {routing.locales.map((loc) => {
        const active = loc === locale;
        return (
          <button
            key={loc}
            type="button"
            onClick={() => onSelect(loc)}
            disabled={isPending}
            aria-label={t("switchTo", { locale: t(loc) })}
            aria-pressed={active}
            className={cn(
              "rounded-full px-2.5 py-1 transition-colors",
              active
                ? "bg-cyan-300/10 text-cyan-200"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t(loc)}
          </button>
        );
      })}
    </div>
  );
}
