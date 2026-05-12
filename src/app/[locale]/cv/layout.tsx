import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { buildAlternates, localizedUrl, ogLocale } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cv" });
  const title = t("metaTitle");
  const description = t("metaDescription");
  const url = localizedUrl(locale, "/cv");
  return {
    title,
    description,
    alternates: buildAlternates(locale, "/cv"),
    openGraph: {
      title,
      description,
      url,
      locale: ogLocale(locale),
    },
  };
}

export default function CVLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
