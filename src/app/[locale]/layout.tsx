import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Geist, Manrope, JetBrains_Mono } from "next/font/google";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Atmospheric } from "@/components/fx/atmospheric";
import { SmoothScroll } from "@/components/fx/smooth-scroll";
import { Analytics } from "@/components/analytics";
import { getEnabledNavLinks, siteConfig } from "@/lib/constants";
import { buildAlternates, localizedUrl, ogLocale } from "@/lib/seo";
import {
  jsonLdGraph,
  personNode,
  organizationNode,
  websiteNode,
} from "@/lib/structured-data";
import { routing, type Locale } from "@/i18n/routing";

export const viewport: Viewport = {
  themeColor: "#05060a",
  colorScheme: "dark",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
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
    authors: [{ name: siteConfig.author, url: siteConfig.url }],
    creator: siteConfig.author,
    publisher: siteConfig.author,
    keywords: [
      "AI Product Engineer",
      "AI agents",
      "RAG",
      "LLMs",
      "Next.js",
      "TypeScript",
      "React",
      "React Native",
      "Node.js",
      "full-stack developer",
      "spec-driven development",
      "Thiago Marinho",
    ],
    alternates: {
      ...buildAlternates(locale, "/"),
      types: {
        "application/rss+xml": [
          { url: rssHref, title: `${siteConfig.name} RSS` },
        ],
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      type: "website",
      locale: ogLocale(locale),
      alternateLocale: locale === "en" ? "pt_BR" : "en_US",
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

  const enabledNavLinks = getEnabledNavLinks();
  const siteJsonLd = jsonLdGraph([
    personNode(),
    organizationNode(),
    websiteNode(locale as Locale),
  ]);

  return (
    <html lang={locale} className="dark">
      <body
        className={`${geistSans.variable} ${manrope.variable} ${jetbrainsMono.variable} font-sans min-h-screen flex flex-col antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
        <NextIntlClientProvider>
          <SmoothScroll>
            <Atmospheric />
            <Header navLinks={enabledNavLinks} />
            <main className="flex-1">{children}</main>
            <Footer />
          </SmoothScroll>
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
