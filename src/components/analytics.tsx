import { GoogleAnalytics as NextGoogleAnalytics } from "@next/third-parties/google";
import { siteConfig } from "@/lib/constants";

/**
 * Loads GA4 only in production so local dev and preview traffic never pollute
 * the property. The @next/third-parties component handles SPA route-change
 * pageviews automatically.
 */
export function Analytics() {
  if (process.env.NODE_ENV !== "production") return null;
  return <NextGoogleAnalytics gaId={siteConfig.gaId} />;
}
