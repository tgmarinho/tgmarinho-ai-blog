"use client";

import { FaXTwitter as Twitter } from "react-icons/fa6";
import { cn } from "@/lib/utils";

interface ShareButtonProps {
  title?: string;
  url?: string;
  className?: string;
}

export function ShareButton({ title, url, className }: ShareButtonProps) {
  const handleShare = () => {
    const shareUrl =
      url || (typeof window !== "undefined" ? window.location.href : "");
    const shareText = title || "Check out this post!";
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      shareText
    )}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label="Share on X / Twitter"
      className={cn(
        "group inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.025] px-4 py-2 font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground backdrop-blur-md transition-all hover:border-cyan-300/30 hover:text-cyan-200",
        className
      )}
    >
      <Twitter className="h-3 w-3" />
      share
    </button>
  );
}
