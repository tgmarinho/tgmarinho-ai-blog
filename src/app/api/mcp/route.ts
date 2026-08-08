import { NextRequest, NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { searchPublicCorpus } from "@/lib/ask/public-corpus";
import { answerPublicQuestion } from "@/lib/ask/answer";
import { projects } from "@/lib/projects";
import { recommendations } from "@/data/recommendations";
import { siteConfig } from "@/lib/constants";
import { routing, type Locale } from "@/i18n/routing";

export const runtime = "nodejs";
export const maxDuration = 30;

const PROTOCOL_VERSION = "2025-06-18";
const SERVER_INFO = {
  name: "thiago-marinho-portfolio",
  version: "1.0.0",
  title: "Thiago Marinho — Portfolio MCP",
} as const;

type JsonRpcId = string | number | null;

type JsonRpcRequest = {
  jsonrpc: "2.0";
  id?: JsonRpcId;
  method: string;
  params?: Record<string, unknown>;
};

function toLocale(value: unknown): Locale {
  if (typeof value === "string") {
    if (value.toLowerCase().startsWith("pt")) return "pt-BR";
    if (value.toLowerCase().startsWith("en")) return "en";
  }
  return routing.defaultLocale;
}

function textResult(text: string) {
  return { content: [{ type: "text", text }], isError: false };
}

function absoluteUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  return `${siteConfig.url}${url.startsWith("/") ? "" : "/"}${url}`;
}

async function readCv(locale: Locale): Promise<string> {
  const file = locale === "en" ? "cv.md" : "cv_pt.md";
  const filePath = path.join(process.cwd(), "public", "content", file);
  try {
    return await readFile(filePath, "utf8");
  } catch {
    return `# ${siteConfig.name}\n\n${siteConfig.description}`;
  }
}

const TOOLS = [
  {
    name: "search_thiago",
    description:
      "Full-text search over Thiago Marinho's public corpus: blog posts, projects, CV, about page and daily journal. Returns ranked excerpts with source URLs.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "What to search for." },
        locale: {
          type: "string",
          enum: ["en", "pt-BR"],
          description: "Preferred language. Defaults to pt-BR.",
        },
        limit: {
          type: "number",
          description: "Max results (1-10). Defaults to 6.",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "ask_thiago",
    description:
      "Ask a natural-language question about Thiago. Returns a grounded answer synthesized from his public corpus, with cited sources. Falls back to search-only when the AI gateway is unavailable.",
    inputSchema: {
      type: "object",
      properties: {
        question: { type: "string", description: "The question to answer." },
        locale: {
          type: "string",
          enum: ["en", "pt-BR"],
          description: "Answer language. Defaults to pt-BR.",
        },
      },
      required: ["question"],
    },
  },
  {
    name: "get_cv",
    description:
      "Return Thiago Marinho's full CV / resume as Markdown, in English or Portuguese.",
    inputSchema: {
      type: "object",
      properties: {
        locale: {
          type: "string",
          enum: ["en", "pt-BR"],
          description: "CV language. Defaults to en.",
        },
      },
    },
  },
  {
    name: "list_projects",
    description:
      "List Thiago's projects with title, status, year, tech tags, and links (GitHub / live).",
    inputSchema: {
      type: "object",
      properties: {
        highlightOnly: {
          type: "boolean",
          description: "Return only highlighted projects. Defaults to false.",
        },
      },
    },
  },
  {
    name: "get_recommendations",
    description:
      "Return LinkedIn recommendations / testimonials written by people who worked with Thiago.",
    inputSchema: { type: "object", properties: {} },
  },
] as const;

async function callTool(
  name: string,
  args: Record<string, unknown>
): Promise<ReturnType<typeof textResult>> {
  switch (name) {
    case "search_thiago": {
      const query = String(args.query ?? "").trim();
      if (!query) return { ...textResult("Missing 'query'."), isError: true };
      const locale = toLocale(args.locale);
      const rawLimit = Number(args.limit);
      const limit = Number.isFinite(rawLimit)
        ? Math.min(Math.max(Math.trunc(rawLimit), 1), 10)
        : 6;
      const results = searchPublicCorpus(query, locale, limit).map((r) => ({
        title: r.document.title,
        kind: r.document.kind,
        url: absoluteUrl(r.document.url),
        date: r.document.date,
        excerpt: r.excerpt,
      }));
      return textResult(JSON.stringify({ query, results }, null, 2));
    }

    case "ask_thiago": {
      const question = String(args.question ?? "").trim();
      if (!question)
        return { ...textResult("Missing 'question'."), isError: true };
      const locale = toLocale(args.locale);
      const response = await answerPublicQuestion(question, locale);
      return textResult(
        JSON.stringify(
          {
            answer: response.answer,
            mode: response.mode,
            sources: response.sources.map((s) => ({
              title: s.title,
              url: absoluteUrl(s.url),
            })),
          },
          null,
          2
        )
      );
    }

    case "get_cv": {
      const locale = args.locale ? toLocale(args.locale) : "en";
      return textResult(await readCv(locale));
    }

    case "list_projects": {
      const highlightOnly = args.highlightOnly === true;
      const list = (highlightOnly
        ? projects.filter((p) => p.highlight)
        : projects
      ).map((p) => ({
        title: p.title,
        status: p.status,
        year: p.year,
        tags: p.tags,
        github: p.github,
        live: p.live,
      }));
      return textResult(JSON.stringify(list, null, 2));
    }

    case "get_recommendations": {
      const list = recommendations.map((r) => ({
        name: r.name,
        role: r.role,
        relationship: r.relationship,
        date: r.date,
        body: r.body,
      }));
      return textResult(JSON.stringify(list, null, 2));
    }

    default:
      return { ...textResult(`Unknown tool: ${name}`), isError: true };
  }
}

function rpcResult(id: JsonRpcId, result: unknown) {
  return NextResponse.json({ jsonrpc: "2.0", id, result });
}

function rpcError(id: JsonRpcId, code: number, message: string) {
  return NextResponse.json(
    { jsonrpc: "2.0", id, error: { code, message } },
    { status: 200 }
  );
}

async function handleRpc(req: JsonRpcRequest): Promise<NextResponse | null> {
  const id = req.id ?? null;

  switch (req.method) {
    case "initialize":
      return rpcResult(id, {
        protocolVersion: PROTOCOL_VERSION,
        capabilities: { tools: { listChanged: false } },
        serverInfo: SERVER_INFO,
        instructions:
          "Portfolio MCP server for Thiago Marinho. Use search_thiago and ask_thiago to explore his public work, get_cv for the resume, list_projects and get_recommendations for background.",
      });

    case "ping":
      return rpcResult(id, {});

    case "notifications/initialized":
    case "notifications/cancelled":
      // Notifications carry no id and expect no response.
      return null;

    case "tools/list":
      return rpcResult(id, { tools: TOOLS });

    case "tools/call": {
      const params = req.params ?? {};
      const name = String(params.name ?? "");
      const args = (params.arguments as Record<string, unknown>) ?? {};
      if (!name) return rpcError(id, -32602, "Missing tool name.");
      try {
        const result = await callTool(name, args);
        return rpcResult(id, result);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Tool execution failed.";
        return rpcResult(id, { ...textResult(message), isError: true });
      }
    }

    default:
      return rpcError(id, -32601, `Method not found: ${req.method}`);
  }
}

export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return rpcError(null, -32700, "Parse error.");
  }

  // Support JSON-RPC batches.
  if (Array.isArray(payload)) {
    const responses = await Promise.all(
      payload.map((item) => handleRpc(item as JsonRpcRequest))
    );
    const body = responses
      .filter((r): r is NextResponse => r !== null)
      .map((r) => r.json());
    return NextResponse.json(await Promise.all(body));
  }

  const response = await handleRpc(payload as JsonRpcRequest);
  return response ?? new NextResponse(null, { status: 202 });
}

export async function GET() {
  return NextResponse.json({
    server: SERVER_INFO,
    protocol: "JSON-RPC 2.0 (MCP)",
    protocolVersion: PROTOCOL_VERSION,
    transport: "HTTP POST to this endpoint",
    tools: TOOLS.map((t) => ({ name: t.name, description: t.description })),
    hint: `curl -X POST ${siteConfig.url}/api/mcp -H 'content-type: application/json' -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'`,
  });
}
