import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { FaGithub as Github } from "react-icons/fa6";
import { GlowCard } from "@/components/fx/glow-card";
import { buildAlternates, localizedUrl, ogLocale } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

type ProjectStatus = "shipped" | "open-source" | "archived";

type Project = {
  key: string;
  title: string;
  status: ProjectStatus;
  year: string;
  tags: string[];
  github?: string;
  live?: string;
  highlight?: boolean;
};

const projects: Project[] = [
  {
    key: "print3d",
    title: "3D Print Management System",
    status: "open-source",
    year: "2026",
    highlight: true,
    tags: [
      "Next.js 16",
      "React 19",
      "TypeScript",
      "Supabase",
      "Tailwind v4",
      "shadcn/ui",
      "dnd-kit",
      "PostgreSQL",
      "RLS",
      "Realtime",
      "Bun",
    ],
    github: "https://github.com/tgmarinho/3d-print-management-system",
  },
  {
    key: "itop",
    title: "iTOP — Inscrições TOP",
    status: "shipped",
    year: "2024",
    highlight: true,
    tags: [
      "Next.js 14",
      "TypeScript",
      "tRPC",
      "Prisma",
      "MongoDB",
      "NextAuth",
      "CASL",
      "Tailwind",
      "Inngest",
      "Resend",
    ],
    github: "https://github.com/tgmarinho/itop-lgnd",
    live: "https://itop-lgnd-inscricoestop.vercel.app/demo",
  },
  {
    key: "unicrow",
    title: "Unicrow",
    status: "shipped",
    year: "2023",
    highlight: true,
    tags: ["TypeScript", "Ethereum", "Smart Contracts", "GraphQL", "Node.js"],
    github: "https://github.com/unicrowio",
    live: "https://unicrow.io",
  },
  {
    key: "meetapp",
    title: "Meetapp",
    status: "open-source",
    year: "2020",
    tags: ["React", "React Native", "Node.js", "Redux"],
    github: "https://github.com/tgmarinho/meetapp",
  },
  {
    key: "be-the-hero",
    title: "Be the Hero",
    status: "open-source",
    year: "2020",
    tags: ["React", "React Native", "Node.js"],
    github: "https://github.com/tgmarinho/be-the-hero",
  },
  {
    key: "members",
    title: "Members",
    status: "open-source",
    year: "2021",
    tags: ["TypeScript", "React", "Open Source"],
    github: "https://github.com/tgmarinho/members",
  },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "projects" });
  const title = t("metaTitle");
  const description = t("metaDescription");
  const url = localizedUrl(locale, "/projects");
  return {
    title,
    description,
    alternates: buildAlternates(locale, "/projects"),
    openGraph: {
      title,
      description,
      url,
      locale: ogLocale(locale),
    },
  };
}

export default async function ProjectsPage() {
  const t = await getTranslations("projects");

  const statusLabel: Record<ProjectStatus, string> = {
    shipped: t("status.shipped"),
    "open-source": t("status.openSource"),
    archived: t("status.archived"),
  };
  const statusColor: Record<ProjectStatus, "emerald" | "cyan" | "neutral"> = {
    shipped: "emerald",
    "open-source": "cyan",
    archived: "neutral",
  };

  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[500px] opacity-50 blur-3xl"
        style={{
          background:
            "radial-gradient(700px 380px at 50% 0%, rgba(34,211,238,0.10), transparent 60%)",
        }}
      />

      <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
        {/* ── Header ── */}
        <header className="mb-14 max-w-3xl">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-cyan-300/80">
            {t("kicker", { count: projects.length })}
          </span>
          <h1 className="mt-3 font-display text-[44px] font-bold leading-[1.05] tracking-[-0.035em] text-foreground md:text-[60px]">
            {t("title")} <span className="text-gradient-cm">{t("titleAccent")}</span>
          </h1>
          <p className="mt-5 max-w-xl text-[15.5px] leading-[1.7] text-muted-foreground">
            {t("subtitle")}
          </p>
        </header>

        {/* ── Grid ── */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:[grid-auto-flow:dense]">
          {projects.map((p) => (
            <ProjectCard
              key={p.key}
              project={p}
              description={t(`items.${p.key}.description`)}
              statusLabel={statusLabel[p.status]}
              statusColor={statusColor[p.status]}
              sourceLabel={t("source")}
              liveLabel={t("live")}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ProjectCard({
  project,
  description,
  statusLabel,
  statusColor,
  sourceLabel,
  liveLabel,
}: {
  project: Project;
  description: string;
  statusLabel: string;
  statusColor: "emerald" | "cyan" | "neutral";
  sourceLabel: string;
  liveLabel: string;
}) {
  const dotColor = {
    emerald: "bg-emerald-400 shadow-[0_0_8px_2px_rgba(52,211,153,0.7)]",
    cyan: "bg-cyan-300 shadow-[0_0_8px_2px_rgba(34,211,238,0.7)]",
    neutral: "bg-white/40",
  }[statusColor];

  return (
    <GlowCard
      className={`border-conic flex flex-col p-7 hover-lift ${
        project.highlight ? "md:col-span-2" : ""
      }`}
      intensity={project.highlight ? "strong" : "subtle"}
    >
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
          {statusLabel}
          <span className="text-white/15">·</span>
          <span className="text-foreground/85">{project.year}</span>
        </span>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-all duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cyan-300" />
      </div>

      <h3
        className={`mt-6 font-display font-semibold tracking-[-0.02em] text-foreground ${
          project.highlight ? "text-[28px] md:text-[34px]" : "text-[22px]"
        }`}
      >
        {project.title}
      </h3>

      <p
        className={`mt-3 leading-[1.65] text-muted-foreground ${
          project.highlight ? "text-[15px]" : "text-[13.5px]"
        }`}
      >
        {description}
      </p>

      <div className="mt-6 flex flex-wrap gap-1.5">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center rounded-full border border-white/[0.06] bg-white/[0.02] px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/80"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-2 border-t border-white/[0.06] pt-5">
        {project.github && (
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:border-cyan-300/30 hover:text-cyan-200"
          >
            <Github className="h-3 w-3" />
            {sourceLabel}
          </a>
        )}
        {project.live && (
          <a
            href={project.live}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-cyan-300/25 bg-cyan-300/[0.06] px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.22em] text-cyan-200 transition-colors hover:border-cyan-300/50 hover:bg-cyan-300/[0.1]"
          >
            <ExternalLink className="h-3 w-3" />
            {liveLabel}
          </a>
        )}
      </div>
    </GlowCard>
  );
}
