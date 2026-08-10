import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/constants";

/**
 * AI / answer-engine crawlers we explicitly welcome. Listing them (rather than
 * relying on the `*` rule alone) is an Answer Engine Optimization signal: it
 * makes the site's intent to be indexed by LLM search unambiguous, and pairs
 * with `/llms.txt` for models that read it.
 */
const AI_BOTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Amazonbot",
  "Bytespider",
  "meta-externalagent",
  "cohere-ai",
  "DuckAssistBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: AI_BOTS, allow: "/" },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
