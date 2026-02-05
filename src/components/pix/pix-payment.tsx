"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { siteConfig } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";

export function PixPayment() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(siteConfig.pix.emv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-border/50 bg-card/50 p-6">
      <div className="flex flex-col items-center gap-4">
        <div className="rounded-lg bg-white p-3">
          <QRCodeSVG value={siteConfig.pix.emv} size={200} />
        </div>

        <p className="text-sm text-muted-foreground text-center">
          Scan the QR Code or copy the Pix key below
        </p>

        <div className="flex items-center gap-2 w-full max-w-sm">
          <code className="flex-1 rounded bg-secondary px-3 py-2 text-xs truncate">
            {siteConfig.pix.chaveAleatoria}
          </code>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="flex-shrink-0"
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
