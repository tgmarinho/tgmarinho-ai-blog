import { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { AskThiago } from "@/components/ask/ask-thiago";
import { buildAlternates, localizedUrl, ogLocale } from "@/lib/seo";
import { routing, type Locale } from "@/i18n/routing";
import { featureFlags } from "@/lib/feature-flags";

export const revalidate = 3600;

type AskPageProps = {
  params: Promise<{ locale: Locale }>;
};

const COPY = {
  "pt-BR": {
    metaTitle: "Ask Thiago",
    metaDescription:
      "Pergunte ao corpus público de Thiago Marinho: posts, projetos e diário de trabalho, com fontes citadas.",
    kicker: "━ ask · corpus público",
    title: "Pergunte ao",
    titleAccent: "site.",
    subtitle:
      "Um RAG público sobre meus posts, projetos e diário. Ele usa apenas conteúdo publicado e mostra as fontes que sustentam a resposta.",
    inputLabel: "sua pergunta",
    placeholder: "Ex: O que Thiago escreveu sobre RAG e agentes de IA?",
    submit: "Perguntar",
    loading: "Buscando",
    examplesTitle: "Perguntas prontas",
    sourcesTitle: "Fontes usadas",
    emptySources: "Nenhuma fonte encontrada.",
    guardrail: "Somente corpus público. Sem memórias, sessões locais ou segredos.",
    searchMode: "busca",
    error: "Não consegui responder agora.",
    examples: [
      "O que Thiago escreveu sobre RAG e agentes de IA?",
      "Quais projetos mostram experiência com Next.js e Vercel?",
      "Como o diário descreve o trabalho com iTOP?",
      "Quais posts ajudam a entender performance em Next.js?",
    ],
  },
  en: {
    metaTitle: "Ask Thiago",
    metaDescription:
      "Ask Thiago Marinho's public corpus: posts, projects, and work journal entries, with cited sources.",
    kicker: "━ ask · public corpus",
    title: "Ask the",
    titleAccent: "site.",
    subtitle:
      "A public RAG over my posts, projects, and work journal. It only uses published content and shows the sources behind the answer.",
    inputLabel: "your question",
    placeholder: "Example: What has Thiago written about RAG and AI agents?",
    submit: "Ask",
    loading: "Searching",
    examplesTitle: "Try these",
    sourcesTitle: "Sources used",
    emptySources: "No sources found.",
    guardrail: "Public corpus only. No memories, local sessions, or secrets.",
    searchMode: "search",
    error: "I could not answer right now.",
    examples: [
      "What has Thiago written about RAG and AI agents?",
      "Which projects show experience with Next.js and Vercel?",
      "How does the journal describe the iTOP work?",
      "Which posts explain Next.js performance?",
    ],
  },
} as const;

export async function generateMetadata({
  params,
}: AskPageProps): Promise<Metadata> {
  if (!featureFlags.ask) notFound();

  const { locale } = await params;
  const copy = COPY[locale];
  const url = localizedUrl(locale, "/ask");

  return {
    title: copy.metaTitle,
    description: copy.metaDescription,
    alternates: buildAlternates(locale, "/ask"),
    openGraph: {
      title: copy.metaTitle,
      description: copy.metaDescription,
      url,
      locale: ogLocale(locale),
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function AskPage({ params }: AskPageProps) {
  if (!featureFlags.ask) notFound();

  const { locale } = await params;
  setRequestLocale(locale);
  const copy = COPY[locale];

  return (
    <div className="relative mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
      <div className="mb-10 max-w-2xl">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-cyan-300/80">
          {copy.kicker}
        </span>
        <h1 className="mt-3 font-display text-[44px] font-bold leading-[1.05] tracking-[-0.035em] text-foreground md:text-[60px]">
          {copy.title}{" "}
          <span className="text-gradient-cm">{copy.titleAccent}</span>
        </h1>
        <p className="mt-5 max-w-xl text-[15.5px] leading-[1.7] text-muted-foreground">
          {copy.subtitle}
        </p>
      </div>

      <AskThiago locale={locale} copy={copy} />
    </div>
  );
}
