"use client";

import { useEffect, useRef, useState } from "react";
import { Play, RefreshCw, Repeat } from "lucide-react";
import { Stage, PALETTE, roundRect, arrowHead } from "./stage";

export interface RagFlowMessages {
  title: string;
  subtitle: string;
  offline: string;
  online: string;
  question: string;
  parallel: string;
  chunks: string;
  fire: string;
  reingest: string;
  autoplay: string;
  speed: string;
  points: string;
  answer: string;
  nodes: Record<
    | "docs"
    | "docling"
    | "chunker"
    | "meta"
    | "embOff"
    | "qdrant"
    | "user"
    | "embOn"
    | "search"
    | "ctx"
    | "llm"
    | "answer",
    string
  >;
  descs: Record<
    | "docs"
    | "docling"
    | "chunker"
    | "meta"
    | "embOff"
    | "qdrant"
    | "user"
    | "embOn"
    | "search"
    | "ctx"
    | "llm"
    | "answer",
    string
  >;
}

interface NodeDef {
  x: number;
  y: number;
  label: string;
  desc: string;
  color: keyof typeof PALETTE;
  big?: boolean;
}

type ParticleKind = "doc" | "chunk" | "vec" | "qvec" | "query" | "token";
interface PathStep {
  x: number;
  y: number;
  transform?: "doc" | "chunk" | "vec" | "qvec" | "absorb" | "searchHit" | "consumed" | "done";
  text?: string;
  c?: string;
}
interface Particle {
  kind: ParticleKind;
  x: number;
  y: number;
  path: PathStep[];
  step: number;
  speed: number;
  text?: string;
  c?: string;
}

const W = 1280;
const H = 620;
const Y_OFF = 110;
const Y_ON = 420;
const Y_DB = 265;

export function SceneRagFlow({ messages }: { messages: RagFlowMessages }) {
  const [speed, setSpeed] = useState(1);
  const [autoplay, setAutoplay] = useState(false);

  const stateRef = useRef({
    particles: [] as Particle[],
    qdrantCount: 0,
    qdrantPulse: 0,
    llmCharging: 0,
    answerBubble: null as { t: number } | null,
    speed: 1,
    autoplay: false,
    lastAutoplayFire: 0,
  });

  // sync controls into ref
  useEffect(() => {
    stateRef.current.speed = speed;
  }, [speed]);
  useEffect(() => {
    stateRef.current.autoplay = autoplay;
    stateRef.current.lastAutoplayFire = 0;
  }, [autoplay]);

  const NODES: Record<string, NodeDef> = {
    docs: { x: 80, y: Y_OFF, label: messages.nodes.docs, desc: messages.descs.docs, color: "accent" },
    docling: { x: 250, y: Y_OFF, label: messages.nodes.docling, desc: messages.descs.docling, color: "accent" },
    chunker: { x: 430, y: Y_OFF, label: messages.nodes.chunker, desc: messages.descs.chunker, color: "accent" },
    meta: { x: 610, y: Y_OFF, label: messages.nodes.meta, desc: messages.descs.meta, color: "accent" },
    embOff: { x: 800, y: Y_OFF, label: messages.nodes.embOff, desc: messages.descs.embOff, color: "accent" },
    qdrant: { x: 1040, y: Y_DB, label: messages.nodes.qdrant, desc: messages.descs.qdrant, color: "warn", big: true },
    user: { x: 80, y: Y_ON, label: messages.nodes.user, desc: messages.descs.user, color: "primary" },
    embOn: { x: 250, y: Y_ON, label: messages.nodes.embOn, desc: messages.descs.embOn, color: "primary" },
    search: { x: 430, y: Y_ON, label: messages.nodes.search, desc: messages.descs.search, color: "primary" },
    ctx: { x: 610, y: Y_ON, label: messages.nodes.ctx, desc: messages.descs.ctx, color: "primary" },
    llm: { x: 800, y: Y_ON, label: messages.nodes.llm, desc: messages.descs.llm, color: "primary" },
    answer: { x: 1040, y: Y_ON, label: messages.nodes.answer, desc: messages.descs.answer, color: "ok" },
  };

  const SAMPLE_CHUNKS = [
    { c: "rgba(245,158,11,0.32)", text: "Curitiba 14-19°C · 65% chuva às 15h" },
    { c: "rgba(245,158,11,0.32)", text: "Frente fria do RS chega 14h" },
    { c: "rgba(245,158,11,0.32)", text: "Maio: 18 dias de chuva (histórico)" },
  ];
  const FINAL_ANSWER = messages.answer;

  function ingest() {
    const s = stateRef.current;
    s.qdrantCount = 0;
    s.answerBubble = null;
    for (let i = 0; i < 3; i++) {
      setTimeout(() => spawnDoc(i), i * 700);
    }
  }

  function spawnDoc(idx: number) {
    const item = SAMPLE_CHUNKS[idx];
    stateRef.current.particles.push({
      kind: "doc",
      x: NODES.docs.x,
      y: NODES.docs.y,
      path: [
        { x: NODES.docling.x, y: NODES.docling.y, transform: "doc" },
        { x: NODES.chunker.x, y: NODES.chunker.y, transform: "chunk", text: item.text, c: item.c },
        { x: NODES.meta.x, y: NODES.meta.y, transform: "chunk", text: item.text, c: item.c },
        { x: NODES.embOff.x, y: NODES.embOff.y, transform: "vec" },
        { x: NODES.qdrant.x, y: NODES.qdrant.y, transform: "absorb" },
      ],
      step: 0,
      speed: 2.5,
    });
  }

  function fireQuery() {
    stateRef.current.answerBubble = null;
    stateRef.current.particles.push({
      kind: "query",
      x: NODES.user.x,
      y: NODES.user.y,
      path: [
        { x: NODES.embOn.x, y: NODES.embOn.y, transform: "qvec" },
        { x: NODES.search.x, y: NODES.search.y, transform: "qvec" },
        { x: NODES.qdrant.x, y: NODES.qdrant.y, transform: "searchHit" },
      ],
      step: 0,
      speed: 3,
    });
  }

  function spawnTopK() {
    SAMPLE_CHUNKS.forEach((ck, i) => {
      setTimeout(() => {
        stateRef.current.particles.push({
          kind: "chunk",
          x: NODES.qdrant.x,
          y: NODES.qdrant.y + 30,
          text: ck.text,
          c: ck.c,
          path: [
            { x: NODES.ctx.x, y: NODES.ctx.y, transform: undefined },
            { x: NODES.llm.x, y: NODES.llm.y, transform: "consumed" },
          ],
          step: 0,
          speed: 2.5,
        });
      }, i * 250);
    });
  }

  function spawnAnswerTokens() {
    for (let i = 0; i < 16; i++) {
      setTimeout(() => {
        stateRef.current.particles.push({
          kind: "token",
          x: NODES.llm.x + 30,
          y: NODES.llm.y + (Math.random() * 12 - 6),
          path: [{ x: NODES.answer.x, y: NODES.answer.y, transform: "done" }],
          step: 0,
          speed: 3.5,
        });
      }, i * 45);
    }
    setTimeout(() => {
      stateRef.current.answerBubble = { t: 0 };
    }, 900);
  }

  // start sequence on mount
  useEffect(() => {
    ingest();
    const id = setTimeout(fireQuery, 3200);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function drawNode(ctx: CanvasRenderingContext2D, node: NodeDef) {
    const w = node.big ? 160 : 130;
    const h = node.big ? 84 : 72;
    const c = PALETTE[node.color] as string;
    const x = node.x - w / 2;
    const y = node.y - h / 2;
    // glow background for big nodes
    if (node.big) {
      ctx.save();
      ctx.shadowColor = c;
      ctx.shadowBlur = 22;
      roundRect(ctx, x, y, w, h, 14);
      ctx.fillStyle = PALETTE.panel;
      ctx.fill();
      ctx.restore();
    } else {
      roundRect(ctx, x, y, w, h, 12);
      ctx.fillStyle = "rgba(11,13,20,0.85)";
      ctx.fill();
    }
    ctx.strokeStyle = c;
    ctx.lineWidth = node.big ? 1.8 : 1.4;
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.fillStyle = PALETTE.text;
    ctx.font = `${node.big ? 700 : 600} ${node.big ? 14 : 13}px "Manrope", system-ui, sans-serif`;
    ctx.fillText(node.label, node.x, node.y - 4);
    ctx.fillStyle = PALETTE.dim;
    ctx.font = '11px "JetBrains Mono", ui-monospace, monospace';
    ctx.fillText(node.desc, node.x, node.y + 14);
  }

  function drawArrow(
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: string,
    dashed = false,
    width = 1.6,
  ) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.setLineDash(dashed ? [4, 5] : []);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.setLineDash([]);
    arrowHead(ctx, x2, y2, Math.atan2(y2 - y1, x2 - x1), color, 7);
  }

  function bezierArrow(
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: string,
  ) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    const mx = (x1 + x2) / 2;
    ctx.bezierCurveTo(mx, y1, mx, y2, x2, y2);
    ctx.stroke();
    arrowHead(ctx, x2, y2, Math.atan2(y2 - (y1 + y2) / 2, x2 - mx), color, 7);
  }

  function drawChunkBox(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    text: string,
    fill: string,
  ) {
    const w = 150;
    const h = 18;
    roundRect(ctx, x - w / 2, y - h / 2, w, h, 4);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = PALETTE.warn;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = PALETTE.text;
    ctx.font = '10px "JetBrains Mono", ui-monospace, monospace';
    ctx.textAlign = "center";
    const t = text.length > 30 ? text.slice(0, 28) + "…" : text;
    ctx.fillText(t, x, y + 3);
  }

  function step() {
    const s = stateRef.current;
    s.particles = s.particles.filter((p) => {
      const target = p.path[p.step];
      if (!target) return false;
      const dx = target.x - p.x;
      const dy = target.y - p.y;
      const dist = Math.hypot(dx, dy);
      const v = p.speed * s.speed;
      if (dist < v) {
        p.x = target.x;
        p.y = target.y;
        const tr = target.transform;
        if (tr === "doc") p.kind = "doc";
        else if (tr === "chunk") {
          p.kind = "chunk";
          p.text = target.text;
          p.c = target.c;
        } else if (tr === "vec") p.kind = "vec";
        else if (tr === "qvec") p.kind = "qvec";
        else if (tr === "absorb") {
          s.qdrantCount++;
          s.qdrantPulse = 30;
          return false;
        } else if (tr === "searchHit") {
          s.qdrantPulse = 30;
          spawnTopK();
          return false;
        } else if (tr === "consumed") {
          s.llmCharging++;
          if (s.llmCharging >= SAMPLE_CHUNKS.length) {
            s.llmCharging = 0;
            setTimeout(spawnAnswerTokens, 350);
          }
          return false;
        } else if (tr === "done") {
          return false;
        }
        p.step++;
        if (p.step >= p.path.length) return false;
        return true;
      }
      p.x += (dx / dist) * v;
      p.y += (dy / dist) * v;
      return true;
    });

    if (s.answerBubble) s.answerBubble.t++;
    if (s.autoplay) {
      const now = performance.now();
      if (now - s.lastAutoplayFire > 6000 / s.speed && s.particles.length === 0) {
        s.lastAutoplayFire = now;
        if (s.qdrantCount === 0) setTimeout(ingest, 100);
        else if (!s.answerBubble) setTimeout(fireQuery, 100);
        else {
          s.qdrantCount = 0;
          s.answerBubble = null;
          setTimeout(ingest, 200);
        }
      }
    }
  }

  function draw(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, W, H);
    step();

    // OFFLINE band
    roundRect(ctx, 20, 60, W - 40, 130, 14);
    ctx.fillStyle = "rgba(217, 70, 239, 0.06)";
    ctx.fill();
    ctx.strokeStyle = "rgba(217, 70, 239, 0.35)";
    ctx.setLineDash([4, 6]);
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = PALETTE.accent;
    ctx.font = '700 11px "JetBrains Mono", ui-monospace, monospace';
    ctx.textAlign = "left";
    ctx.fillText(messages.offline.toUpperCase(), 36, 50);

    // ONLINE band
    roundRect(ctx, 20, 370, W - 40, 130, 14);
    ctx.fillStyle = "rgba(34,211,238,0.05)";
    ctx.fill();
    ctx.strokeStyle = "rgba(34,211,238,0.35)";
    ctx.setLineDash([4, 6]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = PALETTE.primary;
    ctx.fillText(messages.online.toUpperCase(), 36, 360);

    // Connections offline
    const off = ["docs", "docling", "chunker", "meta", "embOff"];
    for (let i = 0; i < off.length - 1; i++) {
      const a = NODES[off[i]];
      const b = NODES[off[i + 1]];
      drawArrow(ctx, a.x + 65, a.y, b.x - 65, b.y, PALETTE.accent, false, 1.5);
    }
    bezierArrow(ctx, NODES.embOff.x + 65, NODES.embOff.y, NODES.qdrant.x - 80, NODES.qdrant.y, PALETTE.accent);

    // Connections online
    const on = ["user", "embOn", "search"];
    for (let i = 0; i < on.length - 1; i++) {
      const a = NODES[on[i]];
      const b = NODES[on[i + 1]];
      drawArrow(ctx, a.x + 65, a.y, b.x - 65, b.y, PALETTE.primary, false, 1.5);
    }
    bezierArrow(ctx, NODES.search.x + 65, NODES.search.y, NODES.qdrant.x - 80, NODES.qdrant.y + 30, PALETTE.primary);
    bezierArrow(ctx, NODES.qdrant.x - 80, NODES.qdrant.y + 38, NODES.ctx.x, NODES.ctx.y - 36, PALETTE.warn);
    drawArrow(ctx, NODES.ctx.x + 65, NODES.ctx.y, NODES.llm.x - 65, NODES.llm.y, PALETTE.primary, false, 1.5);
    drawArrow(ctx, NODES.llm.x + 65, NODES.llm.y, NODES.answer.x - 80, NODES.answer.y, PALETTE.ok, false, 2);

    // parallel question line
    ctx.save();
    ctx.strokeStyle = PALETTE.primary;
    ctx.setLineDash([3, 5]);
    ctx.lineWidth = 1.2;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.moveTo(NODES.user.x, NODES.user.y + 38);
    ctx.bezierCurveTo(
      NODES.user.x,
      NODES.user.y + 110,
      NODES.llm.x - 250,
      NODES.llm.y + 110,
      NODES.llm.x,
      NODES.llm.y + 38,
    );
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
    ctx.fillStyle = PALETTE.primary;
    ctx.font = '11px "JetBrains Mono", ui-monospace, monospace';
    ctx.textAlign = "center";
    ctx.fillText(messages.parallel, (NODES.user.x + NODES.llm.x) / 2, NODES.user.y + 132);
    ctx.restore();

    Object.values(NODES).forEach((n) => drawNode(ctx, n));

    // Qdrant fill bar
    const s = stateRef.current;
    const dbBarY = NODES.qdrant.y + 52;
    const dbW = 130;
    const dbX = NODES.qdrant.x - dbW / 2;
    roundRect(ctx, dbX, dbBarY, dbW, 6, 3);
    ctx.fillStyle = PALETTE.panel2;
    ctx.fill();
    const fill = Math.min(1, s.qdrantCount / 3);
    roundRect(ctx, dbX, dbBarY, dbW * fill, 6, 3);
    ctx.fillStyle = PALETTE.warn;
    ctx.fill();
    ctx.fillStyle = PALETTE.dim;
    ctx.font = '10px "JetBrains Mono", ui-monospace, monospace';
    ctx.textAlign = "center";
    ctx.fillText(`${s.qdrantCount} ${messages.points}`, NODES.qdrant.x, dbBarY + 18);

    if (s.qdrantPulse > 0) {
      ctx.save();
      ctx.globalAlpha = s.qdrantPulse / 30;
      ctx.strokeStyle = PALETTE.warn;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(NODES.qdrant.x, NODES.qdrant.y, 64 + (30 - s.qdrantPulse) * 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      s.qdrantPulse--;
    }

    if (s.answerBubble) {
      const a = Math.min(1, s.answerBubble.t / 25);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.font = '600 12px "Geist", system-ui, sans-serif';
      const tw = ctx.measureText(FINAL_ANSWER).width;
      const bx = NODES.answer.x - tw / 2 - 14;
      const by = NODES.answer.y + 58;
      roundRect(ctx, bx, by, tw + 28, 30, 14);
      ctx.fillStyle = "rgba(52, 211, 153, 0.16)";
      ctx.fill();
      ctx.strokeStyle = PALETTE.ok;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = PALETTE.ok;
      ctx.textAlign = "center";
      ctx.fillText(FINAL_ANSWER, NODES.answer.x, by + 19);
      ctx.restore();
    }

    // particles
    s.particles.forEach((p) => {
      if (p.kind === "doc") {
        ctx.fillStyle = PALETTE.accent;
        ctx.shadowColor = PALETTE.accent;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      } else if (p.kind === "chunk") {
        drawChunkBox(ctx, p.x, p.y, p.text ?? "", p.c ?? "rgba(245,158,11,0.32)");
      } else if (p.kind === "vec" || p.kind === "qvec") {
        const c = p.kind === "vec" ? PALETTE.accent : PALETTE.primary;
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = c;
        ctx.lineWidth = 1;
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          const ang = (i / 4) * Math.PI * 2;
          ctx.lineTo(p.x + Math.cos(ang) * 8, p.y + Math.sin(ang) * 8);
          ctx.stroke();
        }
      } else if (p.kind === "query") {
        ctx.fillStyle = PALETTE.primary;
        ctx.shadowColor = PALETTE.primary;
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      } else if (p.kind === "token") {
        ctx.fillStyle = PALETTE.ok;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // header
    ctx.textAlign = "left";
    ctx.fillStyle = PALETTE.text;
    ctx.font = '700 13px "Manrope", system-ui, sans-serif';
    ctx.fillText(messages.title, 36, 28);
    ctx.font = '11px "JetBrains Mono", ui-monospace, monospace';
    ctx.fillStyle = PALETTE.dim;
    ctx.fillText(`${messages.question} "${"Devo levar guarda-chuva às 15h em Curitiba?"}"`, 36, 540);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card/60 p-3 backdrop-blur">
        <button
          type="button"
          onClick={() => (stateRef.current.qdrantCount === 0 ? (ingest(), setTimeout(fireQuery, 3000 / stateRef.current.speed)) : fireQuery())}
          className="inline-flex items-center gap-2 rounded-lg bg-[color:var(--primary)]/15 px-3.5 py-1.5 text-sm font-medium text-[color:var(--primary)] ring-1 ring-[color:var(--primary)]/30 transition hover:bg-[color:var(--primary)]/25"
        >
          <Play className="size-3.5 fill-current" />
          {messages.fire}
        </button>
        <button
          type="button"
          onClick={() => ingest()}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary/60 px-3.5 py-1.5 text-sm text-secondary-foreground hover:bg-secondary"
        >
          <RefreshCw className="size-3.5" />
          {messages.reingest}
        </button>
        <label className="ml-2 inline-flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={autoplay}
            onChange={(e) => setAutoplay(e.target.checked)}
            className="accent-[color:var(--primary)]"
          />
          <Repeat className="size-3.5" />
          {messages.autoplay}
        </label>
        <div className="ml-auto flex items-center gap-2 font-mono text-xs text-muted-foreground">
          <span>{messages.speed}</span>
          {[0.5, 1, 2, 4].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setSpeed(v)}
              className={[
                "rounded px-2 py-1",
                speed === v ? "bg-[color:var(--primary)]/15 text-[color:var(--primary)]" : "hover:bg-secondary",
              ].join(" ")}
            >
              {v}×
            </button>
          ))}
        </div>
      </div>

      <Stage width={W} height={H} draw={draw} />

      <p className="text-sm text-muted-foreground">{messages.subtitle}</p>
    </div>
  );
}
