import type { Metadata } from "next";
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
import "./globals.css";

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

// Editorial display serif — used inside long-form posts (titles, lede)
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
  axes: ["opsz", "SOFT"],
});

// Editorial body serif — used inside long-form posts (paragraphs)
const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  authors: [{ name: siteConfig.author }],
  creator: siteConfig.author,
  // Favicon + apple-touch icon are auto-detected from src/app/icon.tsx and src/app/apple-icon.tsx
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${manrope.variable} ${jetbrainsMono.variable} ${fraunces.variable} ${sourceSerif.variable} font-sans min-h-screen flex flex-col antialiased`}
      >
        <CursorAurora />
        <ShootingStars />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
