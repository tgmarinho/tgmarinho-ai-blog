import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  Bot,
  Database,
  Layers,
  Smartphone,
  FileCode2,
  CreditCard,
  ArrowUpRight,
  Mail,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/lib/constants";
import { HeroPortraitLazy } from "@/components/fx/hero-portrait-lazy";
import { buildAlternates, localizedUrl, ogLocale } from "@/lib/seo";
import {
  jsonLdGraph,
  profilePageNode,
  faqPageNode,
} from "@/lib/structured-data";
import { routing, type Locale } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "lp" });
  const title = t("metaTitle");
  const description = t("metaDescription");
  const url = localizedUrl(locale, "/lp");
  return {
    title,
    description,
    alternates: buildAlternates(locale, "/lp"),
    openGraph: {
      title,
      description,
      url,
      locale: ogLocale(locale),
    },
  };
}

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("lp");

  const services = [
    { icon: Bot, key: "agents" },
    { icon: Database, key: "rag" },
    { icon: Layers, key: "fullstack" },
    { icon: Smartphone, key: "mobile" },
    { icon: FileCode2, key: "spec" },
    { icon: CreditCard, key: "payments" },
  ] as const;

  const proof = [
    { value: "R$6M", key: "revenue" },
    { value: "25%", key: "dropoff" },
    { value: "60%", key: "sdk" },
    { value: "99.9%", key: "indexer" },
    { value: "50k+", key: "devs" },
    { value: `${siteConfig.yearsOfExperience}+`, key: "years" },
  ] as const;

  const experience = ["popstand", "unicrow", "rocketseat"] as const;
  const process = ["discovery", "build", "ship"] as const;
  const faqIds = [
    "build",
    "availability",
    "stack",
    "remote",
    "pricing",
  ] as const;

  const faqs = faqIds.map((id) => ({
    q: t(`faq.items.${id}.q`),
    a: t(`faq.items.${id}.a`),
  }));

  const jsonLd = jsonLdGraph([
    profilePageNode(locale, "/lp", {
      name: t("metaTitle"),
      description: t("metaDescription"),
    }),
    faqPageNode(faqs),
  ]);

  return (
    <div className="relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Ambient hero halo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[720px] opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(760px 420px at 68% 6%, rgba(34,211,238,0.16), transparent 62%), radial-gradient(560px 340px at 20% 12%, rgba(217,70,239,0.12), transparent 66%)",
        }}
      />

      <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
        {/* ── Hero ── */}
        <section className="grid items-center gap-12 md:grid-cols-[1.05fr_0.95fr] md:gap-8">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.025] px-3 py-1 font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground backdrop-blur-md">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              {t("status")}
            </span>

            <p className="mt-7 font-mono text-[11px] uppercase tracking-[0.24em] text-cyan-300/80">
              {t("heroKicker")}
            </p>
            <h1 className="mt-3 font-display text-[46px] font-bold leading-[1.02] tracking-[-0.035em] text-foreground md:text-[68px]">
              {t("heroName")}
            </h1>
            <p className="mt-5 max-w-xl text-[16px] leading-[1.7] text-muted-foreground md:text-[17px]">
              {t("heroLead")}
            </p>

            <div className="mt-7 flex flex-wrap gap-2.5">
              {(["years", "ai", "stack"] as const).map((k) => (
                <span
                  key={k}
                  className="rounded-full border border-white/[0.07] bg-white/[0.02] px-3.5 py-1.5 text-[12px] text-foreground/80 backdrop-blur-md"
                >
                  {t(`facts.${k}`)}
                </span>
              ))}
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/contact"
                className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-cyan-400 px-6 py-3 text-[13px] font-semibold tracking-wide text-[#05060a] transition-transform hover:scale-[1.02]"
                style={{
                  boxShadow:
                    "0 14px 36px -10px rgba(34,211,238,0.6), inset 0 1px 0 rgba(255,255,255,0.25)",
                }}
              >
                {t("ctaPrimary")}
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </Link>
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.025] px-6 py-3 text-[13px] tracking-wide text-foreground/90 backdrop-blur-md transition-colors hover:border-white/20 hover:bg-white/[0.05]"
              >
                {t("ctaSecondary")}
                <span className="text-muted-foreground">↗</span>
              </Link>
            </div>
          </div>

          <div className="mx-auto w-full max-w-[420px] md:max-w-none">
            <HeroPortraitLazy size={460} className="mx-auto" />
          </div>
        </section>

        {/* ── Services ── */}
        <section className="mt-28 md:mt-36">
          <div className="mb-10 max-w-2xl">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-cyan-300/80">
              {t("servicesKicker")}
            </span>
            <h2 className="mt-3 font-display text-[30px] font-bold leading-[1.12] tracking-[-0.025em] text-foreground md:text-[40px]">
              {t("servicesTitle")}
            </h2>
            <p className="mt-4 text-[15px] leading-[1.7] text-muted-foreground">
              {t("servicesLead")}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <div
                key={s.key}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-cyan-300/25"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-cyan-300/10 blur-2xl opacity-0 transition-opacity group-hover:opacity-100"
                />
                <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-cyan-300/90">
                  <s.icon className="h-4 w-4" />
                </span>
                <h3 className="mt-5 font-display text-[18px] font-semibold tracking-tight text-foreground">
                  {t(`services.${s.key}.title`)}
                </h3>
                <p className="mt-2 text-[13.5px] leading-[1.6] text-muted-foreground">
                  {t(`services.${s.key}.description`)}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Proof / numbers ── */}
        <section className="mt-28 md:mt-36">
          <div className="mb-10 max-w-2xl">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-fuchsia-300/80">
              {t("proofKicker")}
            </span>
            <h2 className="mt-3 font-display text-[30px] font-bold leading-[1.12] tracking-[-0.025em] text-foreground md:text-[40px]">
              {t("proofTitle")}
            </h2>
          </div>

          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.04] md:grid-cols-3">
            {proof.map((p) => (
              <div
                key={p.key}
                className="bg-background/80 px-6 py-7 backdrop-blur-md"
              >
                <dd className="font-display text-[30px] font-bold tracking-tight text-gradient-cm">
                  {p.value}
                </dd>
                <dt className="mt-2 text-[13px] leading-[1.5] text-muted-foreground">
                  {t(`proof.${p.key}`)}
                </dt>
              </div>
            ))}
          </dl>
        </section>

        {/* ── Experience ── */}
        <section className="mt-28 md:mt-36">
          <div className="mb-10 max-w-2xl">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-cyan-300/80">
              {t("experienceKicker")}
            </span>
            <h2 className="mt-3 font-display text-[30px] font-bold leading-[1.12] tracking-[-0.025em] text-foreground md:text-[40px]">
              {t("experienceTitle")}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {experience.map((k) => (
              <div
                key={k}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-md"
              >
                <h3 className="font-display text-[16px] font-semibold tracking-tight text-foreground">
                  {t(`experience.${k}.role`)}
                </h3>
                <p className="mt-3 text-[13.5px] leading-[1.65] text-muted-foreground">
                  {t(`experience.${k}.detail`)}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Process ── */}
        <section className="mt-28 md:mt-36">
          <div className="mb-10 max-w-2xl">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-fuchsia-300/80">
              {t("processKicker")}
            </span>
            <h2 className="mt-3 font-display text-[30px] font-bold leading-[1.12] tracking-[-0.025em] text-foreground md:text-[40px]">
              {t("processTitle")}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {process.map((k) => (
              <div
                key={k}
                className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-md"
              >
                <span className="font-display text-[34px] font-bold leading-none text-white/[0.09]">
                  {t(`process.${k}.step`)}
                </span>
                <h3 className="mt-4 font-display text-[18px] font-semibold tracking-tight text-foreground">
                  {t(`process.${k}.title`)}
                </h3>
                <p className="mt-2 text-[13.5px] leading-[1.6] text-muted-foreground">
                  {t(`process.${k}.description`)}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="mt-28 md:mt-36">
          <div className="mb-10 max-w-2xl">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-cyan-300/80">
              {t("faq.faqKicker")}
            </span>
            <h2 className="mt-3 font-display text-[30px] font-bold leading-[1.12] tracking-[-0.025em] text-foreground md:text-[40px]">
              {t("faq.faqTitle")}
            </h2>
          </div>

          <div className="divide-y divide-white/[0.06] overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-md">
            {faqs.map((f) => (
              <details key={f.q} className="group px-6 py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-[15.5px] font-semibold tracking-tight text-foreground">
                  {f.q}
                  <span className="text-cyan-300/70 transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-[14px] leading-[1.7] text-muted-foreground">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="relative mt-28 overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.02] px-6 py-16 text-center backdrop-blur-md md:mt-36 md:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 opacity-70 blur-3xl"
            style={{
              background:
                "radial-gradient(500px 240px at 50% 0%, rgba(34,211,238,0.18), transparent 60%), radial-gradient(400px 220px at 70% 100%, rgba(217,70,239,0.14), transparent 65%)",
            }}
          />
          <h2 className="mx-auto max-w-xl font-display text-[30px] font-bold leading-[1.12] tracking-[-0.025em] text-foreground md:text-[42px]">
            {t("finalTitle")}
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[15.5px] leading-[1.7] text-muted-foreground">
            {t("finalSubtitle")}
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/contact"
              className="group inline-flex items-center gap-2.5 rounded-full bg-cyan-400 px-6 py-3 text-[13px] font-semibold tracking-wide text-[#05060a] transition-transform hover:scale-[1.02]"
              style={{
                boxShadow: "0 14px 36px -10px rgba(34,211,238,0.6)",
              }}
            >
              {t("finalCta")}
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
            <a
              href={`mailto:${siteConfig.email}`}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.025] px-6 py-3 text-[13px] tracking-wide text-foreground/90 backdrop-blur-md transition-colors hover:border-cyan-300/40 hover:text-cyan-200"
            >
              <Mail className="h-3.5 w-3.5" />
              {t("emailCta")}
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
