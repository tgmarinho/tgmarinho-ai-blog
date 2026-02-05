"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Loader2, Check } from "lucide-react";

interface FeedbackFormProps {
  slug: string;
}

export function FeedbackForm({ slug }: FeedbackFormProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "sent">("idle");

  const handleFeedback = async (type: "like" | "dislike") => {
    setStatus("loading");

    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, type }),
      });
      setStatus("sent");
    } catch {
      setStatus("idle");
    }
  };

  if (status === "sent") {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
        <Check className="h-4 w-4 text-green-400" />
        Thanks for your feedback!
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 py-4">
      <span className="text-sm text-muted-foreground">Was this helpful?</span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleFeedback("like")}
        disabled={status === "loading"}
      >
        {status === "loading" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ThumbsUp className="h-4 w-4" />
        )}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleFeedback("dislike")}
        disabled={status === "loading"}
      >
        <ThumbsDown className="h-4 w-4" />
      </Button>
    </div>
  );
}
