import { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ArrowUpRight, FileText } from "lucide-react";
import {
  FaGithub,
  FaXTwitter,
  FaLinkedin,
  FaDiscord,
  FaYoutube,
} from "react-icons/fa6";
import { siteConfig } from "@/lib/constants";
import { buildAlternates, localizedUrl, ogLocale } from "@/lib/seo";
import { Link } from "@/i18n/navigation";
import { GlowCard } from "@/components/fx/glow-card";
import type { Locale } from "@/i18n/routing";

const skills = {
  ai: ["LLMs", "RAG", "AI Agents", "MCP", "Eval loops", "Spec-Driven Dev"],
  languages: ["TypeScript", "JavaScript", "SQL", "GraphQL"],
  frameworks: ["React", "Next.js", "React Native", "Node.js", "Prisma"],
  data: ["PostgreSQL", "MongoDB", "Redis", "pgvector"],
  cloud: ["AWS", "Vercel", "Cloudflare", "Firebase", "Docker", "Turborepo"],
  web3: ["Ethereum", "WAX", "Smart Contracts", "Web3 / NFTs"],
} as const;

type SkillCategory = keyof typeof skills;

const experienceKeys = ["popstand", "unicrow", "rocketseat"] as const;
type ExpKey = (typeof experienceKeys)[number];

const experienceHighlights: Record<ExpKey, ("h1" | "h2" | "h3" | "h4")[]> = {
  popstand: ["h1", "h2", "h3", "h4"],
  unicrow: ["h1", "h2", "h3"],
  rocketseat: ["h1", "h2", "h3"],
};

const experienceCompany: Record<ExpKey, string> = {
  popstand: "Popstand",
  unicrow: "Unicrow",
  rocketseat: "Rocketseat",
};

const achievementMetrics = [
  { metric: "40%", key: "nurseOnboarding" },
  { metric: "25%", key: "mobileDropoff" },
  { metric: "60%", key: "sdkIntegration" },
  { metric: "99.9%", key: "indexerAccuracy" },
  { metric: "50k+", key: "devsReached" },
  { metric: "1.1k+", key: "githubFollowers" },
] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  const title = t("metaTitle");
  const description = t("metaDescription", {
    name: siteConfig.name,
    role: siteConfig.role,
  });
  const url = localizedUrl(locale, "/about");
  return {
    title,
    description,
    alternates: buildAlternates(locale, "/about"),
    openGraph: {
      title,
      description,
      url,
      locale: ogLocale(locale),
    },
  };
}

export default async function AboutPage() {
  const t = await getTranslations("about");

  const socialLinks = [
    { href: siteConfig.links.github, icon: FaGithub, label: "GitHub", handle: "tgmarinho" },
    { href: siteConfig.links.linkedin, icon: FaLinkedin, label: "LinkedIn", handle: "in/tgmarinho" },
    { href: siteConfig.links.twitter, icon: FaXTwitter, label: "X / Twitter", handle: "@tgmarinho" },
    { href: siteConfig.links.youtube, icon: FaYoutube, label: "YouTube", handle: "@tgmarinho" },
    {
      href: siteConfig.links.discord,
      icon: FaDiscord,
      label: "Discord",
      handle: t("social.discordHandle"),
    },
  ];

  return (
    <div className="relative">
      {/* Halo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[600px] opacity-50 blur-3xl"
        style={{
          background:
            "radial-gradient(700px 380px at 30% 0%, rgba(34,211,238,0.10), transparent 60%), radial-gradient(600px 320px at 80% 0%, rgba(217,70,239,0.08), transparent 65%)",
        }}
      />

      <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
        {/* ── Header ── */}
        <header className="mb-16 grid grid-cols-1 gap-10 md:grid-cols-[auto_1fr] md:items-end">
          <div className="relative">
            <div className="relative h-32 w-32 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-1 backdrop-blur-md">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-300/20 via-transparent to-fuchsia-400/20" />
              <Image
                src="https://avatars.githubusercontent.com/u/380327?v=4"
                alt={siteConfig.name}
                width={128}
                height={128}
                className="relative h-full w-full rounded-xl object-cover"
                priority
                unoptimized
              />
            </div>
            <span className="absolute -right-1.5 -top-1.5 h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_2px_rgba(52,211,153,0.7)] animate-pulse-soft" />
          </div>

          <div>
            <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-cyan-300/80">
              {t("profileKicker", { year: new Date().getFullYear() })}
            </span>
            <h1 className="mt-3 font-display text-[44px] font-bold leading-[1.05] tracking-[-0.035em] text-foreground md:text-[60px]">
              {siteConfig.name.split(" ")[0]}{" "}
              <span className="text-gradient-cm">
                {siteConfig.name.split(" ").slice(1).join(" ")}
              </span>
            </h1>
            <p className="mt-3 max-w-2xl text-[15.5px] leading-[1.7] text-muted-foreground">
              {t("intro", {
                role: siteConfig.role,
                location: siteConfig.location,
                years: siteConfig.yearsOfExperience,
              })}
            </p>

            <div className="mt-5 flex flex-wrap gap-2.5">
              <Link
                href="/cv"
                className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.025] px-4 py-2 font-mono text-[10.5px] uppercase tracking-[0.22em] text-foreground/85 backdrop-blur-md transition-colors hover:border-cyan-300/40 hover:text-cyan-200"
              >
                <FileText className="h-3.5 w-3.5" />
                {t("fullCv")}
                <ArrowUpRight className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/contact"
                className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.025] px-4 py-2 font-mono text-[10.5px] uppercase tracking-[0.22em] text-foreground/85 backdrop-blur-md transition-colors hover:border-cyan-300/40 hover:text-cyan-200"
              >
                {t("letsTalk")}
                <ArrowUpRight className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </header>

        {/* ── Bio ── */}
        <section className="mb-20 grid grid-cols-1 gap-10 md:grid-cols-[1fr_1fr] md:gap-16">
          <div>
            <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-cyan-300/80">
              {t("bioKicker")}
            </span>
            <h2 className="mt-3 font-display text-[28px] font-bold leading-[1.15] tracking-[-0.025em] text-foreground md:text-[34px]">
              {t("bioTitleLine1")}
              <br />
              <span className="text-gradient-cyan">{t("bioTitleLine2")}</span>.
            </h2>
          </div>

          <div className="space-y-4 text-[15px] leading-[1.75] text-muted-foreground">
            <p>
              {t("bioP1Prefix")}{" "}
              <strong className="text-foreground">{t("bioP1Role")}</strong>{" "}
              {t("bioP1Middle")}{" "}
              <strong className="text-foreground">{t("bioP1Years")}</strong>{" "}
              {t("bioP1Tail")}{" "}
              <em className="text-foreground/95 not-italic">{t("bioP1Em")}</em>
              {t("bioP1End")}
            </p>
            <p>
              {t("bioP2Prefix")}{" "}
              <strong className="text-foreground">{t("bioP2Strong")}</strong>
              {t("bioP2Tail")}
            </p>
            <p>
              {t("bioP3Prefix")}{" "}
              <strong className="text-foreground">{t("bioP3Strong")}</strong>{" "}
              {t("bioP3Tail")}
            </p>
          </div>
        </section>

        {/* ── Achievements grid ── */}
        <section className="mb-20">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-cyan-300/80">
            {t("achievementsKicker")}
          </span>
          <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.04] sm:grid-cols-3 lg:grid-cols-6">
            {achievementMetrics.map((a) => (
              <div
                key={a.key}
                className="bg-background/80 p-6 backdrop-blur-md transition-colors hover:bg-white/[0.02]"
              >
                <p className="font-display text-[28px] font-bold leading-none tracking-tight text-foreground md:text-[32px]">
                  {a.metric}
                </p>
                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {t(`achievements.${a.key}` as const)}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Experience timeline ── */}
        <section className="mb-20">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-cyan-300/80">
                {t("experienceKicker")}
              </span>
              <h2 className="mt-3 font-display text-[28px] font-bold leading-[1.15] tracking-[-0.025em] text-foreground md:text-[34px]">
                {t("experienceTitle")}
              </h2>
            </div>
            <Link
              href="/cv"
              className="group inline-flex shrink-0 items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-cyan-300"
            >
              {t("fullTimeline")}
              <ArrowUpRight className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>

          <ol className="relative space-y-5 border-l border-white/[0.06] pl-6 md:pl-10">
            {experienceKeys.map((key, i) => (
              <li key={key} className="relative">
                <span className="absolute -left-[29px] top-2 h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_10px_2px_rgba(34,211,238,0.6)] md:-left-[45px]" />
                <span className="absolute -left-[40px] top-1 hidden font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70 md:-left-[68px] md:block">
                  0{i + 1}
                </span>
                <GlowCard className="p-6 md:p-7">
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <div>
                      <h3 className="font-display text-[18px] font-semibold tracking-tight text-foreground">
                        {t(`experiences.${key}.title` as const)}{" "}
                        <span className="text-cyan-300/85">
                          @ {experienceCompany[key]}
                        </span>
                      </h3>
                      <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                        {t(`experiences.${key}.location` as const)}
                      </p>
                    </div>
                    <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                      {t(`experiences.${key}.period` as const)}
                      <span className="mx-2 text-white/15">·</span>
                      <span className="text-foreground/80">
                        {t(`experiences.${key}.duration` as const)}
                      </span>
                    </span>
                  </div>

                  <ul className="mt-5 space-y-2.5 border-t border-white/[0.06] pt-4">
                    {experienceHighlights[key].map((h) => (
                      <li
                        key={h}
                        className="flex items-start gap-3 text-[14px] leading-[1.6] text-muted-foreground"
                      >
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-cyan-300/70 shadow-[0_0_5px_rgba(34,211,238,0.6)]" />
                        <span>{t(`experiences.${key}.${h}` as const)}</span>
                      </li>
                    ))}
                  </ul>
                </GlowCard>
              </li>
            ))}
          </ol>
        </section>

        {/* ── Skills ── */}
        <section className="mb-20">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-cyan-300/80">
            {t("stackKicker")}
          </span>
          <h2 className="mt-3 font-display text-[28px] font-bold leading-[1.15] tracking-[-0.025em] text-foreground md:text-[34px]">
            {t("stackTitle")}
          </h2>

          <div className="mt-8 space-y-5">
            {(Object.entries(skills) as [SkillCategory, readonly string[]][]).map(
              ([category, items]) => (
                <div
                  key={category}
                  className="grid grid-cols-1 items-baseline gap-3 border-t border-white/[0.06] py-5 md:grid-cols-[140px_1fr] md:gap-8"
                >
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground">
                    {t(`skillCategories.${category}` as const)}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {items.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1 text-[12px] text-foreground/85 backdrop-blur-md transition-colors hover:border-cyan-300/30 hover:text-cyan-200"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ),
            )}
          </div>
        </section>

        {/* ── Connect ── */}
        <section>
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-cyan-300/80">
                {t("connectKicker")}
              </span>
              <h2 className="mt-3 font-display text-[28px] font-bold leading-[1.15] tracking-[-0.025em] text-foreground md:text-[34px]">
                {t("connectTitle")}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-cyan-300/25"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/[0.06] bg-white/[0.03] text-foreground/80 transition-colors group-hover:border-cyan-300/30 group-hover:text-cyan-300">
                  <link.icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium tracking-tight text-foreground">
                    {link.label}
                  </p>
                  <p className="truncate font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">
                    {link.handle}
                  </p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cyan-300" />
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
