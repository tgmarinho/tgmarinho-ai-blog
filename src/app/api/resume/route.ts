import { NextRequest } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { siteConfig } from "@/lib/constants";

export const runtime = "nodejs";

const FILES = {
  en: "cv.md",
  "pt-BR": "cv_pt.md",
} as const;

type ResumeLocale = keyof typeof FILES;

function resolveLocale(request: NextRequest): ResumeLocale {
  const param = request.nextUrl.searchParams.get("lang");
  if (param?.toLowerCase().startsWith("pt")) return "pt-BR";
  if (param?.toLowerCase().startsWith("en")) return "en";

  const accept = request.headers.get("accept-language")?.toLowerCase() ?? "";
  return accept.startsWith("pt") ? "pt-BR" : "en";
}

const BANNER = [
  "",
  `  ${siteConfig.name} — ${siteConfig.role}`,
  `  ${siteConfig.url}  ·  ${siteConfig.links.github}`,
  "",
  "  You reached the plain-text resume. Nice — you read the headers.",
  `  Structured data for agents: ${siteConfig.url}/api/mcp`,
  `  Ask questions in the browser: ${siteConfig.url}/ask`,
  "",
  "  " + "-".repeat(60),
  "",
].join("\n");

export async function GET(request: NextRequest) {
  const locale = resolveLocale(request);
  const filePath = path.join(process.cwd(), "public", "content", FILES[locale]);

  let body: string;
  try {
    body = await readFile(filePath, "utf8");
  } catch {
    body = `# ${siteConfig.name}\n\n${siteConfig.description}\n\nContact: ${siteConfig.email}`;
  }

  return new Response(`${BANNER}${body}\n`, {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=86400",
      "x-thiago-hint": "try /api/mcp for the JSON-RPC MCP server",
    },
  });
}
