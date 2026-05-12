"use client";

import { useTranslations } from "next-intl";
import { Quote } from "lucide-react";
import { recommendations } from "@/data/recommendations";

export function Recommendations() {
  const t = useTranslations("cv.recommendations");

  return (
    <section
      aria-labelledby="cv-recommendations-title"
      className="no-print mt-16"
    >
      <header className="mb-8">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-cyan-300/80">
          {t("kicker")}
        </span>
        <h2
          id="cv-recommendations-title"
          className="mt-2 font-display text-[26px] font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-[32px]"
        >
          {t("title")}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          {t("subtitle")}
        </p>
      </header>

      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {recommendations.map((r) => (
          <li
            key={`${r.name}-${r.date}`}
            className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-md transition-colors hover:border-cyan-300/20"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              style={{
                background:
                  "radial-gradient(420px 220px at 0% 0%, rgba(34,211,238,0.08), transparent 60%)",
              }}
            />

            <Quote
              aria-hidden
              className="mb-3 h-4 w-4 text-cyan-300/70"
              strokeWidth={2.25}
            />

            <blockquote className="whitespace-pre-line text-[14.5px] leading-relaxed text-foreground/90">
              {r.body}
            </blockquote>

            <footer className="mt-5 border-t border-white/[0.06] pt-4">
              <p className="text-sm font-semibold tracking-tight text-foreground">
                {r.name}
              </p>
              <p className="mt-0.5 line-clamp-2 text-[12.5px] text-muted-foreground">
                {r.role}
              </p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">
                {r.relationship} · {r.date}
              </p>
            </footer>
          </li>
        ))}
      </ul>
    </section>
  );
}
