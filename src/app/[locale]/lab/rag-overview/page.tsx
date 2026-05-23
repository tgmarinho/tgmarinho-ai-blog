import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buildAlternates, localizedUrl, ogLocale } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";
import { RagOverviewLabAuto } from "@/components/lab/rag-overview/rag-overview-lab-auto";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ragLab" });
  const title = t("metaTitle");
  const description = t("metaDescription");
  const url = localizedUrl(locale, "/lab/rag-overview");
  return {
    title,
    description,
    alternates: buildAlternates(locale, "/lab/rag-overview"),
    openGraph: {
      title,
      description,
      url,
      locale: ogLocale(locale),
    },
  };
}

export default async function RagOverviewPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ragLab" });
  const postHref =
    locale === "en"
      ? "/en/blog/rag-overview-input-retriever-generator-en"
      : "/blog/rag-overview-input-retriever-generator-pt-br";

  return (
    <main className="relative mx-auto w-full max-w-7xl px-4 pb-24 pt-10 sm:px-6 lg:pt-16">
      <div className="mb-6 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--primary)] shadow-[0_0_8px_var(--cyan-glow)]" />
        {t("eyebrow")}
      </div>

      <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
        {t("title")}
      </h1>
      <p className="mt-4 max-w-3xl text-base text-muted-foreground sm:text-lg">
        {t("intro")}
      </p>

      <div className="mt-6">
        <Link
          href={postHref}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-2 text-sm text-secondary-foreground transition hover:border-[color:var(--primary)]/40 hover:text-[color:var(--primary)]"
        >
          <ArrowLeft className="size-3.5" />
          {t("readArticle")}
        </Link>
      </div>

      <div className="mt-12">
        <RagOverviewLabAuto />
      </div>
    </main>
  );
}
