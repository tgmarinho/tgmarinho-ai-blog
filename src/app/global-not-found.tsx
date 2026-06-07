import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Manrope, JetBrains_Mono } from "next/font/google";

// `global-not-found` renders for URLs that match no route at all. It runs
// OUTSIDE every layout (including the locale layout that normally owns
// <html>/<body> and the fonts/providers), so this file must ship a complete
// document on its own. Copy is in the default locale (pt-BR).

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

export const metadata: Metadata = {
  title: "404 · Página não encontrada",
  robots: { index: false, follow: false },
};

export default function GlobalNotFound() {
  return (
    <html lang="pt-BR" className="dark">
      <body
        className={`${geistSans.variable} ${manrope.variable} ${jetbrainsMono.variable} font-sans min-h-screen antialiased`}
      >
        <main className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[500px] opacity-50 blur-3xl"
            style={{
              background:
                "radial-gradient(700px 380px at 50% 0%, rgba(34,211,238,0.10), transparent 60%)",
            }}
          />
          <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-cyan-300/80">
            erro · 404
          </span>
          <h1 className="mt-4 font-display text-[72px] font-bold leading-none tracking-[-0.04em] text-gradient-cm md:text-[112px]">
            404
          </h1>
          <h2 className="mt-4 font-display text-[22px] font-semibold tracking-[-0.02em] text-foreground md:text-[28px]">
            Página não encontrada
          </h2>
          <p className="mt-3 max-w-md text-[15px] leading-[1.7] text-muted-foreground">
            A página que você está procurando não existe ou foi movida.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-cyan-300 px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.22em] text-[#05060a] transition-transform hover:scale-[1.02]"
            style={{
              boxShadow:
                "0 8px 24px -8px rgba(34,211,238,0.6), inset 0 1px 0 rgba(255,255,255,0.4)",
            }}
          >
            Voltar para o início
          </Link>
        </main>
      </body>
    </html>
  );
}
