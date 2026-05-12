import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Users, MessageCircle, Rocket, ArrowUpRight } from "lucide-react";
import { FaDiscord } from "react-icons/fa6";
import { siteConfig } from "@/lib/constants";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "community" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function CommunityPage() {
  const t = await getTranslations("community");

  const benefits = [
    {
      icon: Users,
      title: t("benefits.networking.title"),
      description: t("benefits.networking.description"),
    },
    {
      icon: MessageCircle,
      title: t("benefits.deepDives.title"),
      description: t("benefits.deepDives.description"),
    },
    {
      icon: Rocket,
      title: t("benefits.growth.title"),
      description: t("benefits.growth.description"),
    },
  ];

  const stats = [
    { value: "Discord", label: t("stats.platform") },
    { value: t("stats.free"), label: t("stats.join") },
    { value: "~24/7", label: t("stats.active") },
    { value: t("stats.languagesValue"), label: t("stats.languages") },
  ];

  return (
    <div className="relative">
      {/* Discord-tinted halo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[600px] opacity-50 blur-3xl"
        style={{
          background:
            "radial-gradient(700px 380px at 50% 0%, rgba(88,101,242,0.18), transparent 60%), radial-gradient(500px 300px at 30% 20%, rgba(34,211,238,0.10), transparent 65%)",
        }}
      />

      <div className="mx-auto max-w-4xl px-5 py-20 md:px-8 md:py-28">
        {/* ── Hero ── */}
        <header className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.025] px-3 py-1 font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground backdrop-blur-md">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-75 animate-ping" />
              <span className="relative inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            {t("statusBadge")}
          </span>

          {/* Discord glyph centerpiece */}
          <div className="relative mx-auto mt-10 grid h-24 w-24 place-items-center">
            <div
              className="absolute inset-0 rounded-full blur-2xl opacity-80"
              style={{
                background:
                  "radial-gradient(circle, rgba(88,101,242,0.5), transparent 70%)",
              }}
            />
            <div className="relative grid h-20 w-20 place-items-center rounded-3xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl">
              <FaDiscord className="h-9 w-9 text-[#9aa6ff]" />
            </div>
          </div>

          <h1 className="mt-8 mx-auto max-w-2xl font-display text-[44px] font-bold leading-[1.05] tracking-[-0.035em] text-foreground md:text-[60px]">
            {t("title")} <span className="text-gradient-cm">{t("titleAccent")}</span>
            {t("titleTail")}
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-[15.5px] leading-[1.7] text-muted-foreground">
            {t("subtitle")}
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <a
              href={siteConfig.links.discord}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-[#5865F2] px-6 py-3 text-[13px] font-medium tracking-wide text-white transition-transform hover:scale-[1.02]"
              style={{
                boxShadow:
                  "0 14px 36px -10px rgba(88,101,242,0.7), inset 0 1px 0 rgba(255,255,255,0.18)",
              }}
            >
              <FaDiscord className="h-4 w-4" />
              {t("joinServer")}
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </a>
            <a
              href={siteConfig.links.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.025] px-6 py-3 text-[13px] tracking-wide text-foreground/90 backdrop-blur-md transition-colors hover:border-white/20 hover:bg-white/[0.05]"
            >
              {t("followX")}
              <span className="text-muted-foreground">↗</span>
            </a>
          </div>

          {/* Stats strip */}
          <dl className="mx-auto mt-14 grid max-w-2xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.04] sm:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="bg-background/80 px-5 py-4 text-center backdrop-blur-md"
              >
                <dd className="font-display text-[18px] font-semibold tracking-tight text-foreground">
                  {s.value}
                </dd>
                <dt className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.2em] text-muted-foreground">
                  {s.label}
                </dt>
              </div>
            ))}
          </dl>
        </header>

        {/* ── Benefits ── */}
        <section className="mt-24">
          <div className="mb-10 text-center">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-cyan-300/80">
              {t("benefitsKicker")}
            </span>
            <h2 className="mt-3 font-display text-[28px] font-bold leading-[1.15] tracking-[-0.025em] text-foreground md:text-[36px]">
              {t("benefitsTitle")}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-cyan-300/25"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-cyan-300/10 blur-2xl opacity-0 transition-opacity group-hover:opacity-100"
                />
                <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-cyan-300/90">
                  <b.icon className="h-4 w-4" />
                </span>
                <h3 className="mt-5 font-display text-[18px] font-semibold tracking-tight text-foreground">
                  {b.title}
                </h3>
                <p className="mt-2 text-[13.5px] leading-[1.6] text-muted-foreground">
                  {b.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="mt-20 text-center">
          <p className="mx-auto max-w-md font-[family-name:var(--font-fraunces)] text-[18px] italic leading-[1.5] text-muted-foreground">
            {t("quote")}
          </p>
          <div className="mt-8">
            <a
              href={siteConfig.links.discord}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.025] px-5 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.22em] text-foreground/85 backdrop-blur-md transition-colors hover:border-cyan-300/40 hover:text-cyan-200"
            >
              <FaDiscord className="h-3.5 w-3.5" />
              {t("imIn")}
              <ArrowUpRight className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
