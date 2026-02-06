"use client";

import { Button } from "@/components/ui/button";
import { Twitter } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShareButtonProps {
  title?: string;
  url?: string;
  className?: string;
}

export function ShareButton({ title, url, className }: ShareButtonProps) {
  const handleShare = () => {
    const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
    const shareText = title || "Check out this post!";
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      shareText
    )}&url=${encodeURIComponent(shareUrl)}`;

    window.open(twitterUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className={cn("flex justify-center my-8", className)}>
      <Button
        onClick={handleShare}
        variant="outline"
        className="gap-2 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-600 transition-colors"
        aria-label="Share on Twitter/X"
      >
        <Twitter className="h-4 w-4" />
        Share on X
      </Button>
    </div>
  );
}
