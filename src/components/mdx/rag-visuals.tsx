import {
  ArrowRight,
  BookOpenCheck,
  Brain,
  Database,
  FileText,
  MessageSquareText,
  Search,
  Sparkles,
  Split,
} from "lucide-react";
import React from "react";

type RagVisualLanguage = "pt-BR" | "en";

interface RagVisualProps {
  language?: RagVisualLanguage;
}

const copy = {
  "pt-BR": {
    bridge: {
      llmTitle: "LLM puro",
      llmGood: "escreve texto fluido",
      llmBadA: "preenche lacunas",
      llmBadB: "não vê dados privados",
      retrievalTitle: "Busca pura",
      retrievalGood: "encontra conteúdo",
      retrievalBadA: "não sintetiza",
      retrievalBadB: "devolve lista crua",
      resultTitle: "RAG",
      resultText: "busca evidência primeiro, depois gera uma resposta contextualizada",
      source: "fonte rastreável",
      grounded: "menos resposta inventada",
      precise: "mais precisão",
    },
    letters: {
      retrievalTitle: "Retrieval",
      retrievalSub: "buscar evidência",
      retrievalText: "Busca os trechos de evidência mais relevantes em uma base externa: documentos, páginas, tickets, PDFs, base interna.",
      augmentedTitle: "Augmented",
      augmentedSub: "aumentado por contexto",
      augmentedText: "Anexa esses trechos ao prompt para que o modelo tenha evidência disponível antes de responder.",
      generationTitle: "Generation",
      generationSub: "escrever resposta",
      generationText: "O LLM escreve a resposta final usando a pergunta do usuário mais o contexto recuperado.",
    },
    architecture: {
      input: "Input Query",
      inputSub: "pergunta do usuário",
      retriever: "Retriever",
      retrieverSub: "busca chunks relevantes",
      generator: "Generator",
      generatorSub: "LLM com contexto",
      answer: "Resposta",
      answerSub: "síntese com fonte",
    },
    pipelines: {
      ingestion: "Ingestão",
      ingestionSub: "offline · roda quando o corpus muda",
      sources: "Fontes",
      loader: "Text Loader",
      splitter: "Splitter",
      embedding: "Embedding",
      vectorDb: "Vector DB",
      query: "Consulta",
      querySub: "online · roda a cada pergunta",
      user: "Usuário",
      queryText: "Query",
      search: "Busca",
      topK: "Top-K",
      prompt: "Prompt",
      llm: "LLM",
      answer: "Resposta",
    },
    embedding: {
      chunkLabel: "chunk",
      chunkText: "Thiago Marinho é Senior AI Engineer.",
      model: "Embedding Model",
      modelSub: "ex.: text-embedding-3-small",
      vectorLabel: "vetor de 1536 dimensões",
      meaning: "números que representam significado",
    },
  },
  en: {
    bridge: {
      llmTitle: "Pure LLM",
      llmGood: "writes fluent text",
      llmBadA: "fills missing context",
      llmBadB: "cannot see private data",
      retrievalTitle: "Pure search",
      retrievalGood: "finds content",
      retrievalBadA: "does not synthesize",
      retrievalBadB: "returns a raw list",
      resultTitle: "RAG",
      resultText: "retrieves evidence first, then generates a contextual answer",
      source: "traceable source",
      grounded: "less invented output",
      precise: "more precision",
    },
    letters: {
      retrievalTitle: "Retrieval",
      retrievalSub: "find evidence",
      retrievalText: "Find the most relevant evidence chunks from an external knowledge base: docs, pages, tickets, PDFs, or internal data.",
      augmentedTitle: "Augmented",
      augmentedSub: "add context",
      augmentedText: "Attach those chunks to the prompt so the model has evidence available before answering.",
      generationTitle: "Generation",
      generationSub: "write answer",
      generationText: "The LLM writes the final answer using the user question plus the retrieved context.",
    },
    architecture: {
      input: "Input Query",
      inputSub: "user question",
      retriever: "Retriever",
      retrieverSub: "finds relevant chunks",
      generator: "Generator",
      generatorSub: "LLM with context",
      answer: "Answer",
      answerSub: "synthesis with sources",
    },
    pipelines: {
      ingestion: "Ingestion",
      ingestionSub: "offline · runs when corpus changes",
      sources: "Sources",
      loader: "Text Loader",
      splitter: "Splitter",
      embedding: "Embedding",
      vectorDb: "Vector DB",
      query: "Query",
      querySub: "online · runs on every question",
      user: "User",
      queryText: "Query",
      search: "Search",
      topK: "Top-K",
      prompt: "Prompt",
      llm: "LLM",
      answer: "Answer",
    },
    embedding: {
      chunkLabel: "chunk",
      chunkText: "Thiago Marinho is a Senior AI Engineer.",
      model: "Embedding Model",
      modelSub: "e.g. text-embedding-3-small",
      vectorLabel: "1536-dimensional vector",
      meaning: "numbers that represent meaning",
    },
  },
} as const;

function Arrow() {
  return (
    <div className="flex items-center justify-center text-muted-foreground/70">
      <ArrowRight className="size-5" />
    </div>
  );
}

function Surface({ children }: { children: React.ReactNode }) {
  return (
    <div className="not-prose my-10 -mx-4 overflow-hidden rounded-2xl border border-cyan-400/25 bg-[radial-gradient(circle_at_12%_0%,rgba(34,211,238,0.13),transparent_34%),radial-gradient(circle_at_88%_12%,rgba(217,70,239,0.12),transparent_32%),rgba(5,6,10,0.88)] p-4 shadow-[0_0_48px_-30px_rgba(34,211,238,0.9)] sm:-mx-6 sm:p-5 md:-mx-10">
      {children}
    </div>
  );
}

function Node({
  icon: Icon,
  title,
  subtitle,
  tone = "cyan",
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  tone?: "cyan" | "magenta" | "amber" | "green";
}) {
  const tones = {
    cyan: "border-cyan-300/30 bg-cyan-300/10 text-cyan-200",
    magenta: "border-fuchsia-300/30 bg-fuchsia-300/10 text-fuchsia-200",
    amber: "border-amber-300/30 bg-amber-300/10 text-amber-200",
    green: "border-emerald-300/30 bg-emerald-300/10 text-emerald-200",
  };

  return (
    <div className={`min-w-0 rounded-xl border p-4 ${tones[tone]}`}>
      <Icon className="mb-3 size-5" />
      <div className="font-mono text-xs uppercase tracking-[0.16em] text-current/80">
        {title}
      </div>
      <div className="mt-2 text-sm leading-snug text-foreground">{subtitle}</div>
    </div>
  );
}

export function RagLettersDiagram({ language = "pt-BR" }: RagVisualProps) {
  const t = copy[language].letters;
  const letters = [
    {
      letter: "R",
      title: t.retrievalTitle,
      subtitle: t.retrievalSub,
      text: t.retrievalText,
      tone: "border-cyan-300/30 bg-cyan-300/10 text-cyan-200",
    },
    {
      letter: "A",
      title: t.augmentedTitle,
      subtitle: t.augmentedSub,
      text: t.augmentedText,
      tone: "border-fuchsia-300/30 bg-fuchsia-300/10 text-fuchsia-200",
    },
    {
      letter: "G",
      title: t.generationTitle,
      subtitle: t.generationSub,
      text: t.generationText,
      tone: "border-emerald-300/30 bg-emerald-300/10 text-emerald-200",
    },
  ];

  return (
    <Surface>
      <div className="grid gap-4 md:grid-cols-3">
        {letters.map((item) => (
          <div
            key={item.letter}
            className={`min-w-0 rounded-xl border p-4 ${item.tone}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-mono text-xs uppercase tracking-[0.16em] text-current/75">
                  {item.title}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {item.subtitle}
                </div>
              </div>
              <div className="font-mono text-5xl leading-none text-current/90">
                {item.letter}
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-foreground">
              {item.text}
            </p>
          </div>
        ))}
      </div>
    </Surface>
  );
}

export function RagBridgeDiagram({ language = "pt-BR" }: RagVisualProps) {
  const t = copy[language].bridge;

  return (
    <Surface>
      <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr]">
        <div className="rounded-xl border border-cyan-300/25 bg-cyan-300/10 p-4">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-cyan-200">
            <Brain className="size-4" />
            {t.llmTitle}
          </div>
          <ul className="mt-4 space-y-2 text-sm text-foreground">
            <li className="text-emerald-200">+ {t.llmGood}</li>
            <li className="text-muted-foreground">- {t.llmBadA}</li>
            <li className="text-muted-foreground">- {t.llmBadB}</li>
          </ul>
        </div>

        <div className="hidden items-center justify-center px-2 text-cyan-200 lg:flex">
          <Sparkles className="size-6" />
        </div>

        <div className="rounded-xl border border-fuchsia-300/25 bg-fuchsia-300/10 p-4">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-fuchsia-200">
            <Search className="size-4" />
            {t.retrievalTitle}
          </div>
          <ul className="mt-4 space-y-2 text-sm text-foreground">
            <li className="text-emerald-200">+ {t.retrievalGood}</li>
            <li className="text-muted-foreground">- {t.retrievalBadA}</li>
            <li className="text-muted-foreground">- {t.retrievalBadB}</li>
          </ul>
        </div>
      </div>

      <div className="mx-auto my-5 h-8 w-px bg-gradient-to-b from-cyan-300/60 to-emerald-300/70" />

      <div className="mx-auto max-w-2xl rounded-2xl border border-emerald-300/35 bg-emerald-300/10 p-5 text-center">
        <div className="font-mono text-xs uppercase tracking-[0.18em] text-emerald-200">
          {t.resultTitle}
        </div>
        <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-foreground">
          {t.resultText}
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
          {[t.precise, t.source, t.grounded].map((item) => (
            <span
              key={item}
              className="rounded-full border border-emerald-300/20 bg-background/35 px-3 py-1"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </Surface>
  );
}

export function RagArchitectureDiagram({ language = "pt-BR" }: RagVisualProps) {
  const t = copy[language].architecture;
  const nodes = [
    { icon: MessageSquareText, title: t.input, subtitle: t.inputSub, tone: "cyan" as const },
    { icon: Search, title: t.retriever, subtitle: t.retrieverSub, tone: "magenta" as const },
    { icon: Brain, title: t.generator, subtitle: t.generatorSub, tone: "amber" as const },
    { icon: BookOpenCheck, title: t.answer, subtitle: t.answerSub, tone: "green" as const },
  ];

  return (
    <Surface>
      <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr]">
        {nodes.map((node, index) => (
          <React.Fragment key={node.title}>
            <Node {...node} />
            {index < nodes.length - 1 && <Arrow />}
          </React.Fragment>
        ))}
      </div>
    </Surface>
  );
}

export function RagEmbeddingDiagram({ language = "pt-BR" }: RagVisualProps) {
  const t = copy[language].embedding;
  const vector = ["0.12", "-0.34", "0.87", "…", "0.05"];

  return (
    <Surface>
      <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
        <div className="rounded-xl border border-cyan-300/25 bg-cyan-300/10 p-4">
          <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-cyan-200">
            {t.chunkLabel}
          </div>
          <p className="mt-3 text-base leading-relaxed text-foreground">
            “{t.chunkText}”
          </p>
        </div>

        <Arrow />

        <div className="rounded-xl border border-fuchsia-300/30 bg-fuchsia-300/10 p-4">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-fuchsia-200">
            <Sparkles className="size-4" />
            {t.model}
          </div>
          <div className="mt-3 text-sm text-muted-foreground">{t.modelSub}</div>
        </div>
      </div>

      <div className="mx-auto my-5 h-8 w-px bg-gradient-to-b from-fuchsia-300/60 to-emerald-300/70" />

      <div className="rounded-2xl border border-emerald-300/30 bg-emerald-300/10 p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-emerald-200">
            {t.vectorLabel}
          </div>
          <div className="text-xs text-muted-foreground">{t.meaning}</div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {vector.map((value, index) => (
            <div
              key={`${value}-${index}`}
              className="rounded-lg border border-emerald-300/20 bg-background/35 px-3 py-2 text-center font-mono text-sm text-foreground"
            >
              {value}
            </div>
          ))}
        </div>
      </div>
    </Surface>
  );
}

export function RagPipelinesDiagram({ language = "pt-BR" }: RagVisualProps) {
  const t = copy[language].pipelines;
  const ingestion = [
    { icon: FileText, title: t.sources, subtitle: "PDF · HTML · DOCX", tone: "magenta" as const },
    { icon: FileText, title: t.loader, subtitle: "raw → text", tone: "magenta" as const },
    { icon: Split, title: t.splitter, subtitle: "chunks + meta", tone: "magenta" as const },
    { icon: Sparkles, title: t.embedding, subtitle: "text → vector", tone: "magenta" as const },
    { icon: Database, title: t.vectorDb, subtitle: "HNSW index", tone: "amber" as const },
  ];
  const query = [
    { icon: MessageSquareText, title: t.user, subtitle: t.queryText, tone: "cyan" as const },
    { icon: Sparkles, title: t.embedding, subtitle: "query → vector", tone: "cyan" as const },
    { icon: Search, title: t.search, subtitle: "similarity", tone: "cyan" as const },
    { icon: Database, title: t.topK, subtitle: "chunks", tone: "amber" as const },
    { icon: Brain, title: t.prompt, subtitle: "query + context", tone: "green" as const },
    { icon: BookOpenCheck, title: t.answer, subtitle: t.llm, tone: "green" as const },
  ];

  return (
    <Surface>
      <div className="space-y-5">
        {[
          { title: t.ingestion, subtitle: t.ingestionSub, nodes: ingestion },
          { title: t.query, subtitle: t.querySub, nodes: query },
        ].map((row) => (
          <div key={row.title} className="rounded-xl border border-white/10 bg-background/25 p-4">
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
              <div className="font-mono text-xs uppercase tracking-[0.18em] text-cyan-200">
                {row.title}
              </div>
              <div className="font-mono text-[11px] text-muted-foreground">
                {row.subtitle}
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-[repeat(11,minmax(0,auto))]">
              {row.nodes.map((node, index) => (
                <React.Fragment key={`${row.title}-${node.title}-${index}`}>
                  <Node {...node} />
                  {index < row.nodes.length - 1 && <Arrow />}
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Surface>
  );
}
