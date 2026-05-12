import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  Geist,
  Manrope,
  JetBrains_Mono,
  Fraunces,
  Source_Serif_4,
} from "next/font/google";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CursorAurora } from "@/components/fx/cursor-aurora";
import { ShootingStars } from "@/components/fx/shooting-stars";
import { siteConfig } from "@/lib/constants";
import { routing, type Locale } from "@/i18n/routing";
import { buildAlternates, localizedUrl, ogLocale } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
  axes: ["opsz", "SOFT"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "home.hero" });

  const rssHref = localizedUrl(locale, "/rss.xml");

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: siteConfig.name,
      template: `%s · ${siteConfig.name}`,
    },
    description: t("subtitle"),
    authors: [{ name: siteConfig.author }],
    creator: siteConfig.author,
    alternates: {
      canonical: localizedUrl(locale, "/"),
      languages: buildAlternates("/"),
      types: {
        "application/rss+xml": [
          { url: rssHref, title: `${siteConfig.name} RSS` },
        ],
      },
    },
    openGraph: {
      type: "website",
      locale: ogLocale(locale),
      url: localizedUrl(locale, "/"),
      title: siteConfig.shareTitle,
      description: siteConfig.shareDescription,
      siteName: siteConfig.name,
    },
    twitter: {
      card: "summary_large_image",
      title: siteConfig.shareTitle,
      description: siteConfig.shareDescription,
      creator: "@tgmarinho",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const homeUrl = localizedUrl(locale as Locale, "/");
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteConfig.author,
    alternateName: siteConfig.username,
    url: siteConfig.url,
    email: `mailto:${siteConfig.email}`,
    jobTitle: siteConfig.role,
    description: siteConfig.description,
    image: `${siteConfig.url}${siteConfig.defaultOgImage}`,
    sameAs: [
      siteConfig.links.github,
      siteConfig.links.twitter,
      siteConfig.links.linkedin,
      siteConfig.links.youtube,
    ],
  };
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: homeUrl,
    description: siteConfig.shareDescription,
    inLanguage: locale,
    publisher: { "@type": "Person", name: siteConfig.author, url: siteConfig.url },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${localizedUrl(locale as Locale, "/blog")}?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang={locale} className="dark">
      <body
        className={`${geistSans.variable} ${manrope.variable} ${jetbrainsMono.variable} ${fraunces.variable} ${sourceSerif.variable} font-sans min-h-screen flex flex-col antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <NextIntlClientProvider>
          <CursorAurora />
          <ShootingStars />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
