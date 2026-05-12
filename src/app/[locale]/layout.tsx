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
import { buildAlternates, localizedUrl, ogLocale } from "@/lib/seo";
import { routing, type Locale } from "@/i18n/routing";

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

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: siteConfig.name,
      template: `%s · ${siteConfig.name}`,
    },
    description: t("subtitle"),
    authors: [{ name: siteConfig.author }],
    creator: siteConfig.author,
    alternates: buildAlternates(locale, "/"),
    openGraph: {
      type: "website",
      locale: ogLocale(locale),
      url: localizedUrl(locale, "/"),
      title: siteConfig.shareTitle,
      description: siteConfig.shareDescription,
      siteName: siteConfig.name,
      images: [
        {
          url: siteConfig.defaultOgImage,
          width: 612,
          height: 408,
          alt: `${siteConfig.name} — hybrid human · AI portrait`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: siteConfig.shareTitle,
      description: siteConfig.shareDescription,
      creator: "@tgmarinho",
      images: [siteConfig.defaultOgImage],
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

  return (
    <html lang={locale} className="dark">
      <body
        className={`${geistSans.variable} ${manrope.variable} ${jetbrainsMono.variable} ${fraunces.variable} ${sourceSerif.variable} font-sans min-h-screen flex flex-col antialiased`}
      >
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
