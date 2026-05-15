import { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { journal } from "#site/content";
import { Link } from "@/i18n/navigation";
import { MdxContent } from "@/components/mdx/mdx-content";
import { siteConfig } from "@/lib/constants";
import { formatIsoDateForDisplay } from "@/lib/format-iso-date";
import { buildAlternates, localizedUrl, ogLocale } from "@/lib/seo";
import { routing, type Locale } from "@/i18n/routing";

export const revalidate = 3600;

interface EntryPageProps {
  params: Promise<{ locale: Locale; slug: string }>;
}

function getEntry(locale: Locale, slug: string) {
  return journal.find((e) => e.slug === slug && e.language === locale);
}

const COPY = {
  "pt-BR": {
    back: "Voltar para o diário",
    sessions: (n: number) => `${n} ${n === 1 ? "sessão" : "sessões"}`,
    commits: (n: number) => `${n} ${n === 1 ? "commit" : "commits"}`,
  },
  en: {
    back: "Back to the journal",
    sessions: (n: number) => `${n} ${n === 1 ? "session" : "sessions"}`,
    commits: (n: number) => `${n} ${n === 1 ? "commit" : "commits"}`,
  },
} as const;

export async function generateMetadata({
  params,
}: EntryPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const entry = getEntry(locale, slug);
  if (!entry) return {};
  const url = localizedUrl(locale, `/daily/${slug}`);
  return {
    title: entry.title,
    description: entry.summary,
    alternates: buildAlternates(locale, `/daily/${slug}`),
    openGraph: {
      title: entry.title,
      description: entry.summary,
      type: "article",
      publishedTime: entry.date,
      url,
      siteName: siteConfig.name,
      locale: ogLocale(locale),
    },
  };
}

export function generateStaticParams() {
  const params: Array<{ locale: Locale; slug: string }> = [];
  for (const locale of routing.locales) {
    for (const entry of journal) {
      if (entry.language === locale) {
        params.push({ locale, slug: entry.slug });
      }
    }
  }
  return params;
}

export default async function JournalEntryPage({ params }: EntryPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const entry = getEntry(locale, slug);
  if (!entry) notFound();

  const copy = COPY[locale];
  const formattedDate = formatIsoDateForDisplay(
    entry.date,
    locale === "en" ? "en-US" : "pt-BR",
    { year: "numeric", month: "long", day: "numeric" }
  );

  return (
    <article
      lang={entry.language}
      className="relative mx-auto px-5 py-14 md:py-20"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] opacity-50 blur-3xl"
        style={{
          background:
            "radial-gradient(700px 380px at 50% 0%, rgba(34,211,238,0.08), transparent 60%)",
        }}
      />

      <div className="mx-auto max-w-[720px]">
        <Link
          href="/daily"
          className="group inline-flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-cyan-300"
        >
          <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" />
          {copy.back}
        </Link>
      </div>

      <header className="mx-auto mt-10 max-w-[720px]">
        <time
          dateTime={entry.date}
          className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-cyan-300/85"
        >
          {formattedDate}
        </time>
        <h1 className="mt-4 text-balance font-display text-[36px] font-bold leading-[1.08] tracking-[-0.025em] text-foreground md:text-[48px]">
          {entry.title}
        </h1>
        <p className="mt-5 font-mono text-[13px] leading-[1.65] text-muted-foreground">
          {entry.summary}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-white/[0.06] pt-5 font-mono text-[10px] uppercase tracking-[0.2em]">
          {entry.repos?.map((repo) => (
            <span
              key={repo}
              className="rounded-full border border-white/[0.08] bg-white/[0.02] px-2.5 py-0.5 text-muted-foreground"
            >
              {repo}
            </span>
          ))}
          {(entry.sessions ?? 0) > 0 && (
            <span className="text-cyan-300/85">
              {copy.sessions(entry.sessions ?? 0)}
            </span>
          )}
          {(entry.sessions ?? 0) > 0 && (entry.commits ?? 0) > 0 && (
            <span className="text-white/15">·</span>
          )}
          {(entry.commits ?? 0) > 0 && (
            <span className="text-muted-foreground">
              {copy.commits(entry.commits ?? 0)}
            </span>
          )}
        </div>
      </header>

      <div className="prose prose-daily mx-auto mt-12 max-w-[720px]">
        <MdxContent code={entry.body || ""} />
      </div>

      <div className="mx-auto mt-16 max-w-[720px]">
        <Link
          href="/daily"
          className="group inline-flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-cyan-300"
        >
          <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" />
          {copy.back}
        </Link>
      </div>
    </article>
  );
}
