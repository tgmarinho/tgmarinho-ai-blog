"use client";

import { FormEvent, useState } from "react";
import { ExternalLink, Loader2, Search, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/routing";
import type { AskThiagoResponse } from "@/lib/ask/answer";

type AskCopy = {
  inputLabel: string;
  placeholder: string;
  submit: string;
  loading: string;
  examplesTitle: string;
  sourcesTitle: string;
  emptySources: string;
  guardrail: string;
  searchMode: string;
  error: string;
  examples: readonly string[];
};

type AskThiagoProps = {
  locale: Locale;
  copy: AskCopy;
};

export function AskThiago({ locale, copy }: AskThiagoProps) {
  const [question, setQuestion] = useState(copy.examples[0] ?? "");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<AskThiagoResponse | null>(null);

  async function ask(nextQuestion: string) {
    const cleanQuestion = nextQuestion.trim();
    if (!cleanQuestion) return;

    setQuestion(cleanQuestion);
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: cleanQuestion, locale }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? copy.error);
      }

      setResult(data as AskThiagoResponse);
      setStatus("idle");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : copy.error);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void ask(question);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section className="min-w-0 rounded-lg border border-white/[0.06] bg-white/[0.025] p-4 backdrop-blur-xl md:p-5">
        <form onSubmit={onSubmit} className="space-y-4">
          <label
            htmlFor="ask-thiago-question"
            className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-cyan-300/80"
          >
            {copy.inputLabel}
          </label>
          <textarea
            id="ask-thiago-question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder={copy.placeholder}
            rows={5}
            maxLength={600}
            className="min-h-32 w-full resize-y rounded-lg border border-white/[0.08] bg-background/70 px-4 py-3 text-[15px] leading-7 text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-300/15"
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-[13px] leading-6 text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-emerald-300" />
              {copy.guardrail}
            </p>
            <Button type="submit" disabled={status === "loading"}>
              {status === "loading" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              {status === "loading" ? copy.loading : copy.submit}
            </Button>
          </div>
        </form>

        {message && (
          <p className="mt-4 rounded-lg border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
            {message}
          </p>
        )}

        {result && (
          <div className="mt-8 space-y-6">
            <div className="rounded-lg border border-cyan-300/15 bg-cyan-300/[0.04] p-5">
              <div className="mb-3 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-200/80">
                <Sparkles className="h-3.5 w-3.5" />
                <span>{result.mode === "llm" ? "answer" : copy.searchMode}</span>
                {result.model && <span className="text-white/25">· {result.model}</span>}
              </div>
              <p className="whitespace-pre-line text-[15.5px] leading-8 text-foreground/90">
                {result.answer}
              </p>
            </div>

            <div>
              <h2 className="mb-3 font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground">
                {copy.sourcesTitle}
              </h2>
              {result.sources.length === 0 ? (
                <p className="text-sm text-muted-foreground">{copy.emptySources}</p>
              ) : (
                <ul className="space-y-3">
                  {result.sources.map((source, index) => (
                    <li key={source.id}>
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="group block rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 transition-colors hover:border-cyan-300/25"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-300/80">
                              [{index + 1}] {source.kind} · {source.locale}
                            </p>
                            <h3 className="mt-1 text-[15px] font-semibold leading-6 text-foreground group-hover:text-cyan-100">
                              {source.title}
                            </h3>
                          </div>
                          <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                        </div>
                        <p className="mt-2 line-clamp-3 text-[13.5px] leading-6 text-muted-foreground">
                          {source.excerpt}
                        </p>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </section>

      <aside className="space-y-4">
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.025] p-4 backdrop-blur-xl">
          <h2 className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-cyan-300/80">
            {copy.examplesTitle}
          </h2>
          <div className="mt-4 space-y-2">
            {copy.examples.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => void ask(example)}
                className="block w-full rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-left text-[13.5px] leading-5 text-muted-foreground transition-colors hover:border-cyan-300/25 hover:text-foreground"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
