"use client";

import { useState } from "react";
import { Workflow, Sigma, Network, Scissors } from "lucide-react";
import { SceneRagFlow, type RagFlowMessages } from "./scene-rag-flow";
import { SceneCosine, type CosineMessages } from "./scene-cosine";
import { SceneHnsw, type HnswMessages } from "./scene-hnsw";
import { SceneChunking, type ChunkingMessages } from "./scene-chunking";

type TabKey = "flow" | "cosine" | "hnsw" | "chunking";

export interface RagLabMessages {
  tabs: Record<TabKey, string>;
  flow: RagFlowMessages;
  cosine: CosineMessages;
  hnsw: HnswMessages;
  chunking: ChunkingMessages;
}

export function RagOverviewLab({ messages }: { messages: RagLabMessages }) {
  const [tab, setTab] = useState<TabKey>("flow");

  const tabs: { key: TabKey; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: "flow", icon: Workflow },
    { key: "cosine", icon: Sigma },
    { key: "hnsw", icon: Network },
    { key: "chunking", icon: Scissors },
  ];

  return (
    <div className="relative">
      <nav className="flex flex-wrap gap-1.5 rounded-2xl border border-border bg-card/50 p-1.5 backdrop-blur">
        {tabs.map(({ key, icon: Icon }) => {
          const active = tab === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={[
                "group inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition",
                active
                  ? "bg-[color:var(--primary)]/15 text-[color:var(--primary)] ring-1 ring-[color:var(--primary)]/30 shadow-[0_0_24px_-12px_var(--cyan-glow)]"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              ].join(" ")}
            >
              <Icon className="size-4" />
              {messages.tabs[key]}
            </button>
          );
        })}
      </nav>

      <div className="mt-6">
        {tab === "flow" && <SceneRagFlow messages={messages.flow} />}
        {tab === "cosine" && <SceneCosine messages={messages.cosine} />}
        {tab === "hnsw" && <SceneHnsw messages={messages.hnsw} />}
        {tab === "chunking" && <SceneChunking messages={messages.chunking} />}
      </div>
    </div>
  );
}
