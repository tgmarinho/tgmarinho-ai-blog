import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { journal } from "#site/content";
import { Link } from "@/i18n/navigation";
import { buildAlternates, localizedUrl, ogLocale } from "@/lib/seo";
import { routing, type Locale } from "@/i18n/routing";
import { formatIsoDateForDisplay } from "@/lib/format-iso-date";

export const revalidate = 3600;

interface DailyPageProps {
  params: Promise<{ locale: Locale }>;
}

const COPY = {
  "pt-BR": {
    title: "Diário",
    titleAccent: "de trabalho.",
    subtitle:
      "Registro diário do que eu construí, quebrei e aprendi — gerado a partir de commits, sessões de pair-programming com agentes e notas de campo.",
    kicker: (n: number) =>
      `━ diário · ${n} ${n === 1 ? "entrada" : "entradas"}`,
    sessions: (n: number) => `${n} ${n === 1 ? "sessão" : "sessões"}`,
    commits: (n: number) => `${n} ${n === 1 ? "commit" : "commits"}`,
    empty: "Nenhuma entrada ainda.",
  },
  en: {
    title: "Work",
    titleAccent: "journal.",
    subtitle:
      "Daily log of what I built, broke, and learned — generated from commits, agent pair-programming sessions, and field notes.",
    kicker: (n: number) =>
      `━ journal · ${n} ${n === 1 ? "entry" : "entries"}`,
    sessions: (n: number) => `${n} ${n === 1 ? "session" : "sessions"}`,
    commits: (n: number) => `${n} ${n === 1 ? "commit" : "commits"}`,
    empty: "No entries yet.",
  },
} as const;

export async function generateMetadata({
  params,
}: DailyPageProps): Promise<Metadata> {
  const { locale } = await params;
  const copy = COPY[locale];
  const title = `${copy.title} ${copy.titleAccent}`.trim();
  const description = copy.subtitle;
  const url = localizedUrl(locale, "/daily");
  return {
    title,
    description,
    alternates: buildAlternates(locale, "/daily"),
    openGraph: {
      title,
      description,
      url,
      locale: ogLocale(locale),
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

function groupByMonth<T extends { date: string }>(
  items: T[],
  locale: Locale
): Array<{ key: string; label: string; items: T[] }> {
  const groups = new Map<string, { label: string; items: T[] }>();
  const intl = new Intl.DateTimeFormat(locale === "en" ? "en-US" : "pt-BR", {
    year: "numeric",
    month: "long",
  });
  for (const item of items) {
    const d = new Date(item.date);
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    const label = intl.format(d);
    const existing = groups.get(key);
    if (existing) existing.items.push(item);
    else groups.set(key, { label, items: [item] });
  }
  return Array.from(groups.entries())
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([key, value]) => ({ key, label: value.label, items: value.items }));
}

export default async function DailyPage({ params }: DailyPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  await getTranslations(); // ensure messages loaded for nested links

  const copy = COPY[locale];

  const entries = journal
    .filter((e) => e.language === locale)
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const groups = groupByMonth(entries, locale);

  return (
    <div className="relative mx-auto max-w-5xl px-5 py-20 md:px-8 md:py-28">
      <div className="mb-14 max-w-2xl">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-cyan-300/80">
          {copy.kicker(entries.length)}
        </span>
        <h1 className="mt-3 font-display text-[44px] font-bold leading-[1.05] tracking-[-0.035em] text-foreground md:text-[60px]">
          {copy.title}{" "}
          <span className="text-gradient-cm">{copy.titleAccent}</span>
        </h1>
        <p className="mt-5 max-w-lg text-[15.5px] leading-[1.7] text-muted-foreground">
          {copy.subtitle}
        </p>
      </div>

      {entries.length === 0 && (
        <p className="text-muted-foreground">{copy.empty}</p>
      )}

      <div className="space-y-14">
        {groups.map((group) => (
          <section key={group.key}>
            <h2 className="mb-6 font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground">
              ━ {group.label}
            </h2>
            <ul className="space-y-3">
              {group.items.map((entry) => {
                const day = formatIsoDateForDisplay(
                  entry.date,
                  locale === "en" ? "en-US" : "pt-BR",
                  { month: "short", day: "2-digit" }
                );
                return (
                  <li key={entry.slug}>
                    <Link
                      href={`/daily/${entry.slug}`}
                      className="group block rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-cyan-300/25"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <p className="font-display text-[18px] font-semibold leading-[1.25] tracking-[-0.01em] text-foreground transition-colors group-hover:text-cyan-100">
                          {entry.title}
                        </p>
                        <time
                          dateTime={entry.date}
                          className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground"
                        >
                          {day}
                        </time>
                      </div>
                      <p className="mt-2 text-[14px] leading-[1.6] text-muted-foreground">
                        {entry.summary}
                      </p>
                      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 font-mono text-[10px] uppercase tracking-[0.2em]">
                        {entry.repos?.slice(0, 4).map((repo) => (
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
                        {(entry.sessions ?? 0) > 0 &&
                          (entry.commits ?? 0) > 0 && (
                            <span className="text-white/15">·</span>
                          )}
                        {(entry.commits ?? 0) > 0 && (
                          <span className="text-muted-foreground">
                            {copy.commits(entry.commits ?? 0)}
                          </span>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
