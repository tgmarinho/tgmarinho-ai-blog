"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { CVViewer } from "@/components/cv/cv-viewer";
import { Download, Printer } from "lucide-react";
import { siteConfig } from "@/lib/constants";

export default function CVPage() {
  const t = useTranslations("cv");
  const [language, setLanguage] = useState<"en" | "pt">("en");
  const [cvContent, setCvContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCV = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          language === "en" ? "/content/cv.md" : "/content/cv_pt.md"
        );
        if (response.ok) {
          const text = await response.text();
          setCvContent(text);
        } else {
          console.error("Failed to load CV");
        }
      } catch (error) {
        console.error("Error loading CV:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCV();
  }, [language]);

  const handleDownloadPDF = () => {
    const content = document.getElementById("cv-content");
    if (!content) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const cvElement = content.querySelector(".cv-content");
    if (!cvElement) return;

    const clonedContent = cvElement.cloneNode(true) as HTMLElement;
    const buttons = clonedContent.querySelectorAll("button, .no-print");
    buttons.forEach((btn) => btn.remove());

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="${language}">
        <head>
          <title>CV — ${siteConfig.name}${language === "en" ? "" : " (PT-BR)"}</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>${getPDFStyles()}</style>
        </head>
        <body>${clonedContent.innerHTML}</body>
      </html>
    `);

    printWindow.document.close();

    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 500);
  };

  return (
    <div className="relative">
      {/* Halo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[500px] opacity-50 blur-3xl"
        style={{
          background:
            "radial-gradient(700px 380px at 50% 0%, rgba(34,211,238,0.10), transparent 60%)",
        }}
      />

      <div className="mx-auto max-w-4xl px-5 py-16 md:px-8 md:py-24">
        {/* ── Header ── */}
        <header className="mb-10 grid grid-cols-1 gap-8 md:grid-cols-[auto_1fr_auto] md:items-end">
          {/* Avatar */}
          <div className="relative flex shrink-0">
            <div className="relative h-20 w-20 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-1 backdrop-blur-md">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-300/20 via-transparent to-fuchsia-400/20" />
              <Image
                src="https://avatars.githubusercontent.com/u/380327?v=4"
                alt={siteConfig.name}
                width={80}
                height={80}
                className="relative h-full w-full rounded-xl object-cover"
                priority
                unoptimized
              />
            </div>
            <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_2px_rgba(52,211,153,0.7)] animate-pulse-soft" />
          </div>

          {/* Title */}
          <div className="min-w-0">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-cyan-300/80">
              {t("documentKicker")}
            </span>
            <h1 className="mt-2 font-display text-[34px] font-bold leading-[1.05] tracking-[-0.025em] text-foreground md:text-[44px]">
              {siteConfig.name}
            </h1>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              {siteConfig.role} · {siteConfig.location}
            </p>
          </div>

          {/* Controls */}
          <div className="no-print flex flex-wrap items-center gap-2.5">
            {/* Language toggle */}
            <div className="inline-flex rounded-full border border-white/[0.08] bg-white/[0.025] p-0.5 backdrop-blur-md">
              <LangButton
                active={language === "en"}
                onClick={() => setLanguage("en")}
                label="EN"
              />
              <LangButton
                active={language === "pt"}
                onClick={() => setLanguage("pt")}
                label="PT-BR"
              />
            </div>

            {/* Download */}
            <button
              type="button"
              onClick={handleDownloadPDF}
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-cyan-300 px-4 py-2 font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#05060a] transition-transform hover:scale-[1.02]"
              style={{
                boxShadow:
                  "0 8px 24px -8px rgba(34,211,238,0.6), inset 0 1px 0 rgba(255,255,255,0.4)",
              }}
            >
              <Download className="h-3 w-3" />
              {t("downloadPdf")}
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </button>
          </div>
        </header>

        {/* ── Meta strip ── */}
        <div className="mb-10 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-full border border-white/[0.06] bg-white/[0.015] px-5 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-75 animate-ping" />
              <span className="relative inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            {t("updated")}
          </span>
          <span className="text-white/15">·</span>
          <span>{t("yearsExp", { years: siteConfig.yearsOfExperience })}</span>
          <span className="text-white/15">·</span>
          <span>
            {t("languageLabel")} · {language.toUpperCase()}
          </span>
          <span className="text-white/15">·</span>
          <button
            type="button"
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-1.5 transition-colors hover:text-cyan-300"
          >
            <Printer className="h-3 w-3" />
            {t("printVersion")}
          </button>
        </div>

        {/* ── Content ── */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              {t("loading")}
            </p>
          </div>
        ) : (
          <div id="cv-content">
            <CVViewer content={cvContent} />
          </div>
        )}
      </div>
    </div>
  );
}

function LangButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        "rounded-full px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.22em] transition-colors " +
        (active
          ? "bg-cyan-300/15 text-cyan-200"
          : "text-muted-foreground hover:text-foreground")
      }
    >
      {label}
    </button>
  );
}

/**
 * PDF stylesheet — intentionally light & formal.
 * The on-screen CV is dark/cyan (matches site design),
 * but the printed PDF is a traditional black-on-white CV
 * for ATS / recruiter friendliness.
 */
function getPDFStyles() {
  return `
    @page { margin: 1.5cm; size: A4; }
    * { box-sizing: border-box; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #1a1a1a;
      max-width: 100%;
      margin: 0;
      padding: 0;
      background: #ffffff;
    }
    h1 { font-size: 24pt; font-weight: 700; margin: 0 0 0.5em; color: #000; page-break-after: avoid; }
    h2 {
      font-size: 14pt; font-weight: 700; margin: 1.5em 0 0.6em; color: #000;
      border-bottom: 1.5px solid #1a1a1a; padding-bottom: 0.25em;
      text-transform: none; letter-spacing: 0; page-break-after: avoid;
    }
    h2 > span:first-child { display: none; }
    h3 { font-size: 12pt; font-weight: 600; margin: 1em 0 0.4em; color: #000; page-break-after: avoid; }
    p { margin: 0.4em 0; orphans: 3; widows: 3; color: #1a1a1a; }
    ul, ol { margin: 0.5em 0; padding-left: 1.5em; }
    ul { list-style: disc; }
    ul li::before { content: none !important; }
    ul li { padding-left: 0 !important; position: static !important; }
    li { margin: 0.2em 0; color: #1a1a1a; page-break-inside: avoid; }
    strong { font-weight: 700; color: #000; }
    em { font-style: italic; color: #1a1a1a; }
    blockquote { margin: 1em 0; padding-left: 1em; border-left: 3px solid #d1d5db; color: #4b5563; }
    hr { border: none; border-top: 1px solid #d1d5db; margin: 1.2em 0; background: none !important; }
    table { width: 100%; border-collapse: collapse; margin: 1em 0; page-break-inside: avoid; }
    th, td { padding: 0.5em; text-align: left; border-bottom: 1px solid #d1d5db; color: #1a1a1a; }
    th {
      font-weight: 700; background: #f5f5f5; color: #000;
      text-transform: none; letter-spacing: 0; font-family: inherit; font-size: inherit;
    }
    code {
      background: #f3f4f6; color: #1a1a1a; border: 1px solid #e5e7eb;
      padding: 0.1em 0.35em; border-radius: 3px;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; font-size: 0.88em;
    }
    pre { background: #f9fafb; padding: 1rem; border-radius: 0.4rem; overflow-x: auto; page-break-inside: avoid; border: 1px solid #e5e7eb; }
    pre code { background: transparent; padding: 0; border: 0; }
    a { color: #0369a1; text-decoration: none; }
    .cv-content { background: #ffffff !important; border: 0 !important; padding: 0 !important; backdrop-filter: none !important; }
    .cv-content > span { display: none !important; }
    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
      .no-print { display: none !important; }
    }
  `;
}
