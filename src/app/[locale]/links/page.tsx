import { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  FaGithub,
  FaXTwitter,
  FaLinkedin,
  FaYoutube,
  FaDiscord,
} from "react-icons/fa6";
import {
  Sparkles,
  User,
  FolderGit2,
  FileText,
  BookOpen,
  Mail,
  Globe,
  ArrowUpRight,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/lib/constants";
import { TrackedExternalLink } from "@/components/analytics-link";
import { buildAlternates, localizedUrl, ogLocale } from "@/lib/seo";
import { jsonLdGraph, profilePageNode } from "@/lib/structured-data";
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
  const t = await getTranslations({ locale, namespace: "links" });
  const title = t("metaTitle");
  const description = t("metaDescription");
  const url = localizedUrl(locale, "/links");
  return {
    title,
    description,
    alternates: buildAlternates(locale, "/links"),
    openGraph: {
      title,
      description,
      url,
      locale: ogLocale(locale),
    },
  };
}

export default async function LinksPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("links");

  const socials = [
    { href: siteConfig.links.github, icon: FaGithub, label: "GitHub" },
    { href: siteConfig.links.twitter, icon: FaXTwitter, label: "X / Twitter" },
    { href: siteConfig.links.linkedin, icon: FaLinkedin, label: "LinkedIn" },
    { href: siteConfig.links.youtube, icon: FaYoutube, label: "YouTube" },
    { href: siteConfig.links.discord, icon: FaDiscord, label: "Discord" },
  ];

  // Internal, locale-aware routes
  const routeItems = [
    { key: "about", href: "/about", icon: User },
    { key: "projects", href: "/projects", icon: FolderGit2 },
    { key: "cv", href: "/cv", icon: FileText },
    { key: "blog", href: "/blog", icon: BookOpen },
  ] as const;

  const jsonLd = jsonLdGraph([
    profilePageNode(locale, "/links", {
      name: t("metaTitle"),
      description: t("metaDescription"),
    }),
  ]);

  return (
    <div className="relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Ambient halo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px] opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(520px 320px at 50% 0%, rgba(34,211,238,0.16), transparent 62%), radial-gradient(420px 260px at 30% 14%, rgba(217,70,239,0.12), transparent 66%)",
        }}
      />

      <div className="mx-auto w-full max-w-[560px] px-5 py-16 md:py-24">
        {/* ── Profile header ── */}
        <header className="text-center">
          <div className="relative mx-auto grid h-28 w-28 place-items-center">
            <div
              aria-hidden
              className="absolute inset-0 rounded-full blur-2xl opacity-80"
              style={{
                background:
                  "radial-gradient(circle, rgba(34,211,238,0.4), rgba(217,70,239,0.28), transparent 70%)",
              }}
            />
            <div className="border-conic relative h-24 w-24 overflow-hidden rounded-full border border-white/10 bg-white/[0.03]">
              <Image
                src="/images/hero/portrait-hybrid-v2-removebg.png"
                alt={t("name")}
                fill
                priority
                sizes="96px"
                className="object-cover object-top"
              />
            </div>
          </div>

          <p className="mt-6 font-mono text-[10.5px] uppercase tracking-[0.22em] text-cyan-300/80">
            {t("eyebrow")}
          </p>
          <h1 className="mt-2 font-display text-[30px] font-bold leading-tight tracking-[-0.03em] text-foreground">
            {t("name")}
          </h1>
          <p className="mt-1 text-[14px] text-muted-foreground">{t("role")}</p>

          <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.025] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground backdrop-blur-md">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-75 animate-ping" />
              <span className="relative inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            {t("status")}
          </span>

          <p className="mx-auto mt-5 max-w-sm text-[14px] leading-[1.65] text-muted-foreground">
            {t("summary")}
          </p>
        </header>

        {/* ── Social icons row ── */}
        <nav
          aria-label={t("socialKicker")}
          className="mt-7 flex items-center justify-center gap-2.5"
        >
          {socials.map((s) => (
            <TrackedExternalLink
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              event="social_click"
              eventParams={{ network: s.label, location: "links" }}
              className="grid h-11 w-11 place-items-center rounded-full border border-white/[0.08] bg-white/[0.025] text-muted-foreground backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-cyan-300/40 hover:text-foreground"
            >
              <s.icon className="h-[18px] w-[18px]" />
            </TrackedExternalLink>
          ))}
          <a
            href={`mailto:${siteConfig.email}`}
            aria-label="E-mail"
            className="grid h-11 w-11 place-items-center rounded-full border border-white/[0.08] bg-white/[0.025] text-muted-foreground backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-cyan-300/40 hover:text-foreground"
          >
            <Mail className="h-[18px] w-[18px]" />
          </a>
        </nav>

        {/* ── Full-site CTA ── */}
        <Link
          href="/"
          className="group mt-6 flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-4 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-cyan-300/30"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-cyan-300/90">
            <Globe className="h-4 w-4" />
          </span>
          <span className="flex-1">
            <span className="block text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              {t("siteCtaSmall")}
            </span>
            <span className="block font-display text-[15px] font-semibold tracking-tight text-foreground">
              {t("siteCtaStrong")}
            </span>
          </span>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>

        {/* ── Link list ── */}
        <section className="mt-9">
          <div className="mb-4 text-center">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-300/80">
              {t("sectionKicker")}
            </span>
            <h2 className="mt-2 font-display text-[19px] font-semibold tracking-tight text-foreground">
              {t("sectionTitle")}
            </h2>
          </div>

          <div className="space-y-3">
            {/* Primary highlighted link */}
            <Link
              href="/contact"
              className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-cyan-300/30 bg-cyan-400/[0.08] px-5 py-4 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-cyan-300/50"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-cyan-300/20 blur-2xl"
              />
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-cyan-300/30 bg-cyan-400/10 text-cyan-200">
                <Sparkles className="h-4 w-4" />
              </span>
              <span className="flex-1">
                <span className="block font-display text-[15px] font-semibold tracking-tight text-foreground">
                  {t("items.hire.title")}
                </span>
                <span className="block text-[12.5px] text-muted-foreground">
                  {t("items.hire.subtitle")}
                </span>
              </span>
              <ArrowUpRight className="h-4 w-4 text-cyan-200 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>

            {routeItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="group flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] px-5 py-4 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.04]"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-foreground/80">
                  <item.icon className="h-4 w-4" />
                </span>
                <span className="flex-1">
                  <span className="block font-display text-[15px] font-semibold tracking-tight text-foreground">
                    {t(`items.${item.key}.title`)}
                  </span>
                  <span className="block text-[12.5px] text-muted-foreground">
                    {t(`items.${item.key}.subtitle`)}
                  </span>
                </span>
                <span className="text-muted-foreground transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </Link>
            ))}

            {/* Newsletter (external) */}
            <TrackedExternalLink
              href={siteConfig.newsletter.url}
              target="_blank"
              rel="noopener noreferrer"
              event="newsletter_subscribe_click"
              eventParams={{ location: "links" }}
              className="group flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] px-5 py-4 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.04]"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-foreground/80">
                <Mail className="h-4 w-4" />
              </span>
              <span className="flex-1">
                <span className="block font-display text-[15px] font-semibold tracking-tight text-foreground">
                  {t("items.newsletter.title")}
                </span>
                <span className="block text-[12.5px] text-muted-foreground">
                  {t("items.newsletter.subtitle")}
                </span>
              </span>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </TrackedExternalLink>
          </div>
        </section>

        {/* ── Contact note ── */}
        <section className="mt-10 text-center">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-fuchsia-300/80">
            {t("contactKicker")}
          </span>
          <h2 className="mt-2 font-display text-[22px] font-bold tracking-tight text-foreground">
            {t("contactTitle")}
          </h2>
          <p className="mx-auto mt-2 max-w-xs text-[13.5px] leading-[1.6] text-muted-foreground">
            {t("contactText")}
          </p>
          <a
            href={`mailto:${siteConfig.email}`}
            className="group mt-5 inline-flex items-center gap-2.5 rounded-full bg-cyan-400 px-6 py-3 text-[13px] font-semibold tracking-wide text-[#05060a] transition-transform hover:scale-[1.02]"
            style={{ boxShadow: "0 14px 36px -10px rgba(34,211,238,0.6)" }}
          >
            <Mail className="h-3.5 w-3.5" />
            {t("contactCta")}
          </a>
        </section>
      </div>
    </div>
  );
}
