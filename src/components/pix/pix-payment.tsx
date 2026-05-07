"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Check, Copy } from "lucide-react";
import { siteConfig } from "@/lib/constants";

export function PixPayment() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(siteConfig.pix.emv);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-7 backdrop-blur-md">
      <span
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-cyan-300/15 blur-3xl"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent"
      />

      <div className="relative flex flex-col items-center gap-5">
        <div className="rounded-xl border border-white/[0.06] bg-white p-3 shadow-[0_18px_40px_-12px_rgba(34,211,238,0.4)]">
          <QRCodeSVG
            value={siteConfig.pix.emv}
            size={180}
            bgColor="#ffffff"
            fgColor="#05060a"
            level="M"
          />
        </div>

        <p className="text-center font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground">
          scan · or copy the key
        </p>

        <div className="flex w-full items-center gap-2">
          <code className="flex-1 truncate rounded-lg border border-white/[0.06] bg-black/40 px-3 py-2 font-mono text-[12px] text-foreground/90">
            {siteConfig.pix.chaveAleatoria}
          </code>
          <button
            type="button"
            onClick={handleCopy}
            aria-label={copied ? "Copied" : "Copy Pix key"}
            className={
              "inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 font-mono text-[10.5px] uppercase tracking-[0.22em] transition-all " +
              (copied
                ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                : "border-white/[0.08] bg-white/[0.025] text-muted-foreground hover:border-cyan-300/30 hover:text-cyan-200")
            }
          >
            {copied ? (
              <>
                <Check className="h-3 w-3" />
                copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                copy
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
