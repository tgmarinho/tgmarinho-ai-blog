"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Loader2, Check } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage("Thanks for subscribing!");
        setEmail("");
        trackEvent("newsletter_signup", { location: "newsletter_form" });
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="rounded-lg border border-border/50 bg-card/50 p-6">
      <div className="flex items-center gap-2 mb-2">
        <Mail className="h-5 w-5 text-blue-500" />
        <h3 className="font-semibold">Newsletter</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Get notified about new posts. No spam, unsubscribe anytime.
      </p>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={status === "loading" || status === "success"}
          className="bg-background"
        />
        <Button
          type="submit"
          disabled={status === "loading" || status === "success"}
        >
          {status === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
          {status === "success" && <Check className="h-4 w-4" />}
          {status === "idle" || status === "error" ? "Subscribe" : null}
        </Button>
      </form>

      {message && (
        <p
          className={`text-sm mt-2 ${
            status === "error" ? "text-red-400" : "text-green-400"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
