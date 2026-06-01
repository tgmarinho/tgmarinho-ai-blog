"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Stage, PALETTE, roundRect } from "./stage";

export interface ChunkingMessages {
  title: string;
  subtitle: string;
  strategy: string;
  fixed: string;
  recursive: string;
  hybrid: string;
  chunkSize: string;
  overlap: string;
  docLabel: string;
  chunksLabel: string;
  chars: string;
  cleanCut: string;
  badCut: string;
  document: string;
}

const W = 1280;
const H = 620;

type Strategy = "fixed" | "recursive" | "hybrid";

interface Chunk {
  start: number;
  end: number;
  badCuts: string[];
}

function detectBadCuts(text: string, start: number, end: number): string[] {
  const bad: string[] = [];
  const wordRe = /\w/;
  if (start > 0 && wordRe.test(text[start - 1]) && wordRe.test(text[start])) bad.push("mid-word-start");
  if (end < text.length && wordRe.test(text[end - 1]) && wordRe.test(text[end])) bad.push("mid-word-end");
  const seg = text.slice(start, end);
  if (/^#+\s+[^\n]+\s*$/.test(seg)) bad.push("title-isolated");
  return bad;
}

function chunkFixed(text: string, size: number, ov: number): Chunk[] {
  const out: Chunk[] = [];
  const step = Math.max(1, size - Math.min(ov, size - 1));
  let i = 0;
  while (i < text.length) {
    const end = Math.min(text.length, i + size);
    out.push({ start: i, end, badCuts: detectBadCuts(text, i, end) });
    i += step;
  }
  return out;
}

function chunkRecursive(text: string, size: number): Chunk[] {
  const out: Chunk[] = [];
  const paragraphs = text.split(/\n\n+/);
  let chunk = "";
  let chunkStart = 0;
  let cursor = 0;
  paragraphs.forEach((p, idx) => {
    const sep = idx > 0 ? "\n\n" : "";
    if (chunk.length + sep.length + p.length <= size + 30) {
      chunk += sep + p;
    } else {
      if (chunk.length > 0) out.push({ start: chunkStart, end: chunkStart + chunk.length, badCuts: [] });
      chunk = p;
      chunkStart = cursor + sep.length;
    }
    cursor += sep.length + p.length;
  });
  if (chunk.length > 0) out.push({ start: chunkStart, end: chunkStart + chunk.length, badCuts: [] });
  return out;
}

function chunkHybrid(text: string): Chunk[] {
  const out: Chunk[] = [];
  const sections = text.split(/(?=^## )/m);
  let cursor = 0;
  sections.forEach((sec) => {
    if (sec.trim().length === 0) {
      cursor += sec.length;
      return;
    }
    out.push({ start: cursor, end: cursor + sec.length, badCuts: [] });
    cursor += sec.length;
  });
  return out;
}

const CHUNK_COLORS = [
  "rgba(34,211,238,",
  "rgba(217,70,239,",
  "rgba(167,139,250,",
  "rgba(52,211,153,",
  "rgba(245,158,11,",
];

export function SceneChunking({ messages }: { messages: ChunkingMessages }) {
  const [strategy, setStrategy] = useState<Strategy>("hybrid");
  const [chunkSize, setChunkSize] = useState(60);
  const [overlap, setOverlap] = useState(10);
  const [highlight, setHighlight] = useState<number>(-1);
  const chunks = useMemo(() => {
    if (strategy === "fixed") return chunkFixed(messages.document, chunkSize, overlap);
    if (strategy === "recursive") return chunkRecursive(messages.document, chunkSize);
    return chunkHybrid(messages.document);
  }, [messages.document, strategy, chunkSize, overlap]);

  const stateRef = useRef({ strategy, chunkSize, overlap, highlight, chunks });
  useEffect(() => {
    stateRef.current = { strategy, chunkSize, overlap, highlight, chunks };
  }, [strategy, chunkSize, overlap, highlight, chunks]);

  function chunkBoxRects(chunks: Chunk[]) {
    const startX = 720;
    const startY = 110;
    const boxW = 530;
    const gap = 8;
    const available = 510 - (startY - 80);
    const n = Math.max(1, chunks.length);
    const boxH = Math.max(56, Math.min(96, Math.floor((available - (n - 1) * gap) / n)));
    return chunks.map((_c, i) => ({ x: startX, y: startY + i * (boxH + gap), w: boxW, h: boxH }));
  }

  function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxW: number, maxLines: number) {
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let line = "";
    for (let i = 0; i < words.length; i++) {
      const t = line ? line + " " + words[i] : words[i];
      if (ctx.measureText(t).width > maxW && line) {
        lines.push(line);
        line = words[i];
        if (lines.length >= maxLines - 1) {
          const rest = words.slice(i).join(" ");
          let truncated = rest;
          while (truncated.length > 0 && ctx.measureText(truncated + "…").width > maxW) {
            truncated = truncated.slice(0, -1);
          }
          lines.push(truncated + "…");
          return lines;
        }
      } else {
        line = t;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  function wrapDocumentLine(ctx: CanvasRenderingContext2D, line: string, maxW: number) {
    if (line.length === 0) return [{ text: "", start: 0 }];

    const segments: { text: string; start: number }[] = [];
    let start = 0;

    while (start < line.length) {
      let end = line.length;
      while (end > start + 1 && ctx.measureText(line.slice(start, end)).width > maxW) {
        end--;
      }

      const space = line.lastIndexOf(" ", end);
      const canBreakAtSpace = space > start && end < line.length;
      const segmentEnd = canBreakAtSpace ? space : end;
      segments.push({ text: line.slice(start, segmentEnd), start });
      start = canBreakAtSpace ? space + 1 : segmentEnd;
    }

    return segments;
  }

  function draw(ctx: CanvasRenderingContext2D) {
    const s = stateRef.current;
    ctx.clearRect(0, 0, W, H);

    // header
    ctx.textAlign = "left";
    ctx.fillStyle = PALETTE.text;
    ctx.font = '700 13px "Manrope", system-ui, sans-serif';
    ctx.fillText(messages.title, 36, 28);
    ctx.font = '11px "JetBrains Mono", ui-monospace, monospace';
    ctx.fillStyle = PALETTE.dim;
    const stratLabel =
      s.strategy === "fixed"
        ? `${messages.strategy}: ${messages.fixed} · ${s.chunkSize} chars · overlap ${s.overlap}`
        : s.strategy === "recursive"
          ? `${messages.strategy}: ${messages.recursive} · ${s.chunkSize} chars`
          : `${messages.strategy}: ${messages.hybrid} · Markdown headers`;
    ctx.fillText(stratLabel, 36, 48);

    // doc panel
    const docX = 30;
    const docY = 80;
    const docW = 660;
    const docH = 510;
    roundRect(ctx, docX, docY, docW, docH, 12);
    ctx.fillStyle = "rgba(11,13,20,0.85)";
    ctx.fill();
    ctx.strokeStyle = PALETTE.border;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = PALETTE.dim;
    ctx.font = '600 12px "Manrope", system-ui, sans-serif';
    ctx.fillText(messages.docLabel, docX + 16, docY + 22);

    const chunks = s.chunks;
    const padding = 16;
    const lineHeight = 18;
    ctx.font = '12px "JetBrains Mono", ui-monospace, monospace';
    const cx = docX + padding;
    let cy = docY + 50;

    const documentText = messages.document;
    const charToChunk = new Array(documentText.length).fill(-1);
    chunks.forEach((ch, i) => {
      for (let k = ch.start; k < ch.end && k < documentText.length; k++) {
        if (charToChunk[k] === -1) charToChunk[k] = i;
        else if (s.overlap > 0) charToChunk[k] = -2;
      }
    });

    const maxDocTextW = docW - padding * 2;
    const lines = documentText.split("\n");
    let charPos = 0;
    lines.forEach((line) => {
      const visualLines = wrapDocumentLine(ctx, line, maxDocTextW);
      visualLines.forEach((visual) => {
        if (cy > docY + docH - 20) return;
        let lx = cx;
        for (let k = 0; k < visual.text.length; k++) {
          const ci = charToChunk[charPos + visual.start + k];
          const charW = ctx.measureText(visual.text[k]).width;
          if (ci >= 0) {
            const baseColor = CHUNK_COLORS[ci % CHUNK_COLORS.length];
            const alpha = ci === s.highlight ? "0.55)" : "0.22)";
            ctx.fillStyle = baseColor + alpha;
            ctx.fillRect(lx, cy - 13, charW + 0.5, lineHeight - 2);
          } else if (ci === -2) {
            ctx.fillStyle = "rgba(245,158,11,0.4)";
            ctx.fillRect(lx, cy - 13, charW + 0.5, lineHeight - 2);
          }
          lx += charW;
        }
        ctx.fillStyle = PALETTE.text;
        ctx.fillText(visual.text, cx, cy);
        cy += lineHeight;
      });
      charPos += line.length + 1;
    });

    // right panel
    const boxes = chunkBoxRects(chunks);
    ctx.font = '600 12px "Manrope", system-ui, sans-serif';
    ctx.fillStyle = PALETTE.dim;
    ctx.fillText(`${messages.chunksLabel} (${chunks.length})`, 720, 95);

    boxes.forEach((box, i) => {
      const ch = chunks[i];
      const baseColor = CHUNK_COLORS[i % CHUNK_COLORS.length];
      const isHover = i === s.highlight;
      const hasBad = ch.badCuts && ch.badCuts.length > 0;

      roundRect(ctx, box.x, box.y, box.w, box.h, 8);
      ctx.fillStyle = baseColor + (isHover ? "0.4)" : "0.18)");
      ctx.fill();
      ctx.strokeStyle = hasBad ? PALETTE.bad : PALETTE.ok;
      ctx.lineWidth = isHover ? 2 : 1;
      ctx.stroke();

      const fullTxt = `#${i + 1}: ${documentText.slice(ch.start, ch.end).replace(/\n/g, " ")}`;
      const lineH = 14;
      const padX = 12;
      const maxLines = Math.max(1, Math.floor((box.h - 22) / lineH));
      ctx.fillStyle = PALETTE.text;
      ctx.font = '11px "JetBrains Mono", ui-monospace, monospace';
      ctx.textAlign = "left";
      const wrapped = wrapLines(ctx, fullTxt, box.w - padX * 2, maxLines);
      wrapped.forEach((ln, idx) => {
        ctx.fillText(ln, box.x + padX, box.y + 16 + idx * lineH);
      });

      ctx.fillStyle = hasBad ? PALETTE.bad : PALETTE.dim;
      ctx.font = '10px "JetBrains Mono", ui-monospace, monospace';
      ctx.fillText(
        `${messages.chars}: ${ch.end - ch.start}  ${hasBad ? "⚠ " + messages.badCut : "✓ " + messages.cleanCut}`,
        box.x + padX,
        box.y + box.h - 6,
      );
    });
  }

  function onPointerMove(x: number, y: number) {
    const chunks = stateRef.current.chunks;
    const boxes = chunkBoxRects(chunks);
    let found = -1;
    boxes.forEach((box, i) => {
      if (x >= box.x && x <= box.x + box.w && y >= box.y && y <= box.y + box.h) found = i;
    });
    if (found !== highlight) setHighlight(found);
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-2xl border border-border bg-card/60 p-3 backdrop-blur sm:grid-cols-[auto_1fr_1fr]">
        <div className="flex items-center gap-1 rounded-lg border border-border bg-secondary/40 p-1 text-xs">
          {(["fixed", "recursive", "hybrid"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStrategy(s)}
              className={[
                "rounded-md px-2.5 py-1.5 font-medium transition",
                strategy === s
                  ? "bg-[color:var(--primary)]/15 text-[color:var(--primary)]"
                  : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {s === "fixed" ? messages.fixed : s === "recursive" ? messages.recursive : messages.hybrid}
            </button>
          ))}
        </div>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          <span className="font-mono uppercase tracking-wide">
            {messages.chunkSize} · {chunkSize}
          </span>
          <input
            type="range"
            min={30}
            max={200}
            step={10}
            value={chunkSize}
            disabled={strategy === "hybrid"}
            onChange={(e) => setChunkSize(parseInt(e.target.value, 10))}
            className="accent-[color:var(--primary)] disabled:opacity-40"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          <span className="font-mono uppercase tracking-wide">
            {messages.overlap} · {overlap}
          </span>
          <input
            type="range"
            min={0}
            max={50}
            step={5}
            value={overlap}
            disabled={strategy !== "fixed"}
            onChange={(e) => setOverlap(parseInt(e.target.value, 10))}
            className="accent-[color:var(--accent)] disabled:opacity-40"
          />
        </label>
      </div>

      <Stage
        width={W}
        height={H}
        draw={draw}
        animate={false}
        redrawKey={`${strategy}:${chunkSize}:${overlap}:${highlight}`}
        onPointerMove={onPointerMove}
        onPointerLeave={() => setHighlight(-1)}
      />

      <p className="text-sm text-muted-foreground">{messages.subtitle}</p>
    </div>
  );
}
