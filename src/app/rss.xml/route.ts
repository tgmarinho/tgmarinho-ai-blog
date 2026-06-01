import { redirect } from "next/navigation";
import { siteConfig } from "@/lib/constants";

/**
 * Root RSS feed redirects to a per-locale feed.
 * Per-locale feeds live at `/[locale]/rss.xml`.
 *
 * We force an explicit `/pt-BR/rss.xml` here (rather than `localizedUrl` which
 * strips the prefix for the default locale under `as-needed`) so the redirect
 * target never resolves back to this same route.
 */
export function GET(request: Request) {
  const locale = new URL(request.url).searchParams.get("locale");
  const prefix = locale === "en" ? "en" : "pt-BR";
  redirect(`${siteConfig.url}/${prefix}/rss.xml`);
}
