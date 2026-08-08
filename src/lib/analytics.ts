"use client";

import { sendGAEvent } from "@next/third-parties/google";

/**
 * Thin wrapper over GA4's gtag. Centralizes event naming so tracked
 * interactions stay consistent and typo-free across the app.
 * No-ops when GA isn't loaded (dev, or missing NEXT_PUBLIC_GA_ID).
 */
export function trackEvent(
  name: string,
  params: Record<string, string | number | boolean> = {}
) {
  if (typeof window === "undefined") return;
  sendGAEvent("event", name, params);
}
