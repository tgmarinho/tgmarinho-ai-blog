import { generateText } from "ai";
import { buildGroundingContext, searchPublicCorpus } from "@/lib/ask/public-corpus";
import type { Locale } from "@/i18n/routing";

export type AskThiagoSource = {
  id: string;
  kind: "about" | "cv" | "project" | "post" | "journal";
  title: string;
  description: string;
  date: string;
  url: string;
  locale: Locale;
  excerpt: string;
};

export type AskThiagoResponse = {
  answer: string;
  sources: AskThiagoSource[];
  mode: "llm" | "search";
  model?: string;
};

const DEFAULT_MODEL = "openai/gpt-5.4";

function hasGatewayCredentials(): boolean {
  return Boolean(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN);
}

function sourceLabel(locale: Locale, index: number): string {
  return locale === "en" ? `Source ${index}` : `Fonte ${index}`;
}

function truncate(value: string, maxLength: number): string {
  const clean = value.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength - 3).trim()}...`;
}

function sourceSummary(locale: Locale, sources: AskThiagoSource[]): string {
  const labels = sources
    .slice(0, 3)
    .map((source, index) => {
      const excerpt = truncate(source.excerpt, 150);
      return `${sourceLabel(locale, index + 1)}: ${source.title}. ${excerpt}`;
    })
    .join("\n");

  return labels ? `\n\n${labels}` : "";
}

function fallbackAnswer(locale: Locale, sources: AskThiagoSource[]): string {
  if (sources.length === 0) {
    return locale === "en"
      ? "I could not find enough evidence in Thiago's public corpus to answer that. Try asking about posts, projects, AI agents, RAG, Next.js, Vercel, career notes, or the daily journal."
      : "Não encontrei evidência suficiente no corpus público do Thiago para responder isso. Tente perguntar sobre posts, projetos, agentes de IA, RAG, Next.js, Vercel, carreira ou o diário.";
  }

  return locale === "en"
    ? `Yes. I found ${sources.length} public sources that support this. Here is the short evidence from the public corpus.${sourceSummary(locale, sources)}`
    : `Sim. Encontrei ${sources.length} fontes públicas que sustentam isso. Aqui está a evidência curta do corpus público.${sourceSummary(locale, sources)}`;
}

function toSources(
  results: ReturnType<typeof searchPublicCorpus>
): AskThiagoSource[] {
  return results.map((result) => {
    const doc = result.document;
    return {
      id: doc.id,
      kind: doc.kind,
      title: doc.title,
      description: doc.description,
      date: doc.date,
      url: doc.url,
      locale: doc.locale,
      excerpt: result.excerpt,
    };
  });
}

export async function answerPublicQuestion(
  question: string,
  locale: Locale
): Promise<AskThiagoResponse> {
  const results = searchPublicCorpus(question, locale, 6);
  const sources = toSources(results);
  const model = process.env.ASK_THIAGO_MODEL ?? DEFAULT_MODEL;

  if (sources.length === 0 || !hasGatewayCredentials()) {
    return {
      answer: fallbackAnswer(locale, sources),
      sources,
      mode: "search",
    };
  }

  const language =
    locale === "en" ? "plain English" : "Brazilian Portuguese";
  const context = buildGroundingContext(results);

  try {
    const { text } = await generateText({
      model,
      system: [
        "You are Ask Thiago, a public guide to Thiago Marinho's published website.",
        "Use only the provided public corpus excerpts.",
        "Do not infer private facts, private clients, secrets, locations, health, finances, memories, or session details.",
        "If the excerpts do not support the answer, say that clearly.",
        "Cite sources inline with [1], [2], and so on.",
        `Answer in ${language}.`,
      ].join("\n"),
      prompt: [
        `Question: ${question}`,
        "",
        "Public corpus excerpts:",
        context,
      ].join("\n"),
    });

    return {
      answer: text.trim(),
      sources,
      mode: "llm",
      model,
    };
  } catch {
    return {
      answer: fallbackAnswer(locale, sources),
      sources,
      mode: "search",
    };
  }
}
