import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getPostsMeta, getAllCategories } from "@/lib/velite";
import { BlogSearch } from "@/components/blog/search";
import { buildAlternates, localizedUrl, ogLocale } from "@/lib/seo";
import { routing, type Locale } from "@/i18n/routing";
import { siteConfig } from "@/lib/constants";

export const revalidate = 3600;

interface BlogPageProps {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({
  params,
}: BlogPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog.list" });
  const title = `${t("title")} ${t("titleAccent")}`;
  const description = t("subtitle");
  const url = localizedUrl(locale, "/blog");
  return {
    title,
    description,
    alternates: buildAlternates(locale, "/blog"),
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

export default async function BlogPage({ params }: BlogPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const localePosts = getPostsMeta(locale);
  const categories = getAllCategories(localePosts, locale);
  const t = await getTranslations("blog.list");

  const blogUrl = localizedUrl(locale, "/blog");
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: t("title") + " " + t("titleAccent"),
    description: t("subtitle"),
    url: blogUrl,
    inLanguage: locale,
    isPartOf: { "@type": "WebSite", name: siteConfig.name, url: siteConfig.url },
    hasPart: localePosts.slice(0, 50).map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: `${blogUrl}/${p.slug}`,
      datePublished: p.date,
      inLanguage: locale,
    })),
  };

  return (
    <div className="relative mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <div className="mb-14 max-w-2xl">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-cyan-300/80">
          {t("kicker", { count: localePosts.length })}
        </span>
        <h1 className="mt-3 font-display text-[44px] font-bold leading-[1.05] tracking-[-0.035em] text-foreground md:text-[60px]">
          {t("title")}{" "}
          <span className="text-gradient-cm">{t("titleAccent")}</span>
        </h1>
        <p className="mt-5 max-w-lg text-[15.5px] leading-[1.7] text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>

      <BlogSearch
        posts={localePosts}
        categories={categories}
        locale={locale}
        searchPlaceholder={t("searchPlaceholder")}
        emptyLabel={t("empty")}
        allLabel={t("categoriesAll")}
      />
    </div>
  );
}
