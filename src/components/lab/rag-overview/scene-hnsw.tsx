"use client";

import { useRef, useState } from "react";
import { Crosshair, Shuffle } from "lucide-react";
import { Stage, PALETTE, roundRect, arrowHead } from "./stage";

export interface HnswMessages {
  title: string;
  subtitle: string;
  search: string;
  regenerate: string;
  currentLayer: string;
  comparisons: string;
  layerLabel: string;
  top: string;
  base: string;
  nearest: string;
}

const W = 1280;
const H = 620;
const LAYERS = 4;
const LAYER_H = 110;
const LAYER_Y0 = 80;

interface HNode {
  id: number;
  vecX: number;
  vecY: number;
  layers: boolean[];
}

interface HEdge {
  layer: number;
  from: number;
  to: number;
}

interface HGraph {
  nodes: HNode[];
  edges: HEdge[];
}

interface HnswStatus {
  layer: number | string;
  comparisons: number | string;
}

function distSq(a: { vecX: number; vecY: number }, b: { vecX: number; vecY: number }) {
  const dx = a.vecX - b.vecX;
  const dy = a.vecY - b.vecY;
  return dx * dx + dy * dy;
}

function generateNodes(n: number): HNode[] {
  const arr: HNode[] = [];
  for (let i = 0; i < n; i++) {
    const x = 80 + Math.random() * 1100;
    const layers = new Array(LAYERS).fill(false);
    layers[LAYERS - 1] = true;
    for (let L = LAYERS - 2; L >= 0; L--) {
      if (Math.random() < 0.4) layers[L] = true;
      else break;
    }
    arr.push({ id: i, vecX: x, vecY: 200 + Math.random() * 240, layers });
  }
  return arr;
}

function generateGraph(n: number): HGraph {
  const nodes = generateNodes(n);
  const edges: HEdge[] = [];

  for (let L = 0; L < LAYERS; L++) {
    const layerNodes = nodes.filter((node) => node.layers[L]);
    layerNodes.forEach((node) => {
      const near = layerNodes
        .filter((other) => other.id !== node.id)
        .map((other) => ({ other, d: distSq(other, node) }))
        .sort((a, b) => a.d - b.d)
        .slice(0, L === LAYERS - 1 ? 4 : 3);
      near.forEach(({ other }) => {
        if (node.id < other.id) edges.push({ layer: L, from: node.id, to: other.id });
      });
    });
  }

  return { nodes, edges };
}

function nodeScreenPos(node: { vecX: number }, layer: number) {
  const x = 60 + (node.vecX - 80) * 0.92;
  const y = LAYER_Y0 + layer * LAYER_H + 40;
  return { x, y };
}

export function SceneHnsw({ messages }: { messages: HnswMessages }) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [redrawKey, setRedrawKey] = useState(0);
  const [status, setStatus] = useState<HnswStatus>({
    layer: "—",
    comparisons: "—",
  });
  const stateRef = useRef({
    graph: generateGraph(60),
    query: null as { vecX: number; vecY: number } | null,
    path: [] as { layer: number; nodeId: number }[],
    cursor: 0,
    animT: 0,
    searching: false,
    result: null as { nodeId: number; comparisons: number } | null,
  });

  function regenerateDataset() {
    stateRef.current.graph = generateGraph(60);
    stateRef.current.query = null;
    stateRef.current.path = [];
    stateRef.current.result = null;
    stateRef.current.searching = false;
    setStatus({ layer: "—", comparisons: "—" });
    setIsAnimating(false);
    setRedrawKey((value) => value + 1);
  }

  function startRandomQuery() {
    const qx = 80 + Math.random() * 1100;
    const qy = 200 + Math.random() * 240;
    const s = stateRef.current;
    const { nodes } = s.graph;
    s.query = { vecX: qx, vecY: qy };
    s.path = [];

    const topNodes = nodes.filter((n) => n.layers[0]);
    if (topNodes.length === 0) return;
    let currentNode = topNodes[0];
    let currentLayerIdx = 0;
    let comparisons = 0;

    while (currentLayerIdx < LAYERS) {
      s.path.push({ layer: currentLayerIdx, nodeId: currentNode.id });
      let improved = true;
      let iter = 0;
      while (improved && iter < 20) {
        improved = false;
        iter++;
        const candidates = nodes.filter((n) => n.layers[currentLayerIdx] && n.id !== currentNode.id);
        let best = currentNode;
        let bestDist = distSq(currentNode, s.query);
        const nearK = candidates
          .map((n) => ({ n, d: distSq(n, currentNode) }))
          .sort((a, b) => a.d - b.d)
          .slice(0, 6);
        nearK.forEach(({ n }) => {
          comparisons++;
          const d = distSq(n, s.query!);
          if (d < bestDist) {
            best = n;
            bestDist = d;
            improved = true;
          }
        });
        if (improved) {
          currentNode = best;
          s.path.push({ layer: currentLayerIdx, nodeId: currentNode.id });
        }
      }
      currentLayerIdx++;
    }
    s.result = { nodeId: currentNode.id, comparisons };
    s.cursor = 0;
    s.animT = 0;
    s.searching = true;
    setStatus({
      layer: s.path[0]?.layer ?? "—",
      comparisons,
    });
    setIsAnimating(true);
    setRedrawKey((value) => value + 1);
  }

  function draw(ctx: CanvasRenderingContext2D) {
    const s = stateRef.current;
    const { nodes, edges } = s.graph;
    ctx.clearRect(0, 0, W, H);

    if (s.searching) {
      s.animT++;
      if (s.animT > 25) {
        s.animT = 0;
        s.cursor++;
        if (s.cursor >= s.path.length) {
          s.searching = false;
          setIsAnimating(false);
        }
        const active = s.path[Math.min(s.cursor, s.path.length - 1)];
        setStatus({
          layer: active?.layer ?? "—",
          comparisons: s.result?.comparisons ?? "—",
        });
      }
    }

    // header
    ctx.textAlign = "left";
    ctx.fillStyle = PALETTE.text;
    ctx.font = '700 13px "Manrope", system-ui, sans-serif';
    ctx.fillText(messages.title, 36, 28);
    ctx.font = '11px "JetBrains Mono", ui-monospace, monospace';
    ctx.fillStyle = PALETTE.dim;
    ctx.fillText(messages.subtitle, 36, 48);

    // layer bands
    for (let L = 0; L < LAYERS; L++) {
      const y = LAYER_Y0 + L * LAYER_H;
      const tint =
        L === 0 ? "rgba(217,70,239,0.06)" : L === LAYERS - 1 ? "rgba(34,211,238,0.05)" : "rgba(120,120,150,0.03)";
      roundRect(ctx, 20, y + 10, W - 40, LAYER_H - 20, 12);
      ctx.fillStyle = tint;
      ctx.fill();
      ctx.strokeStyle = PALETTE.border;
      ctx.setLineDash([3, 4]);
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = PALETTE.dim;
      ctx.font = '11px "JetBrains Mono", ui-monospace, monospace';
      ctx.textAlign = "left";
      let label = `${messages.layerLabel} ${L}`;
      if (L === 0) label += " · " + messages.top;
      if (L === LAYERS - 1) label += " · " + messages.base;
      ctx.fillText(label, 36, y + 26);
    }

    // nodes
    nodes.forEach((node) => {
      node.layers.forEach((present, L) => {
        if (!present) return;
        const pos = nodeScreenPos(node, L);
        ctx.fillStyle = "rgba(126,138,163,0.55)";
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });
    });

    // edges per layer
    edges.forEach((edge) => {
      const from = nodes[edge.from];
      const to = nodes[edge.to];
      if (!from || !to) return;
      const p1 = nodeScreenPos(from, edge.layer);
      const p2 = nodeScreenPos(to, edge.layer);
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    });

    // path
    if (s.path.length > 0) {
      for (let i = 0; i < Math.min(s.cursor, s.path.length - 1); i++) {
        const a = s.path[i];
        const b = s.path[i + 1];
        const na = nodes[a.nodeId];
        const nb = nodes[b.nodeId];
        if (!na || !nb) continue;
        const pa = nodeScreenPos(na, a.layer);
        const pb = nodeScreenPos(nb, b.layer);
        ctx.strokeStyle = PALETTE.warn;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pb.x, pb.y);
        ctx.stroke();
        arrowHead(ctx, pb.x, pb.y, Math.atan2(pb.y - pa.y, pb.x - pa.x), PALETTE.warn, 8);
      }
      if (s.cursor > 0 && s.cursor < s.path.length) {
        const a = s.path[s.cursor - 1];
        const b = s.path[s.cursor];
        const na = nodes[a.nodeId];
        const nb = nodes[b.nodeId];
        if (na && nb) {
          const pa = nodeScreenPos(na, a.layer);
          const pb = nodeScreenPos(nb, b.layer);
          const t = Math.min(1, s.animT / 25);
          const cx = pa.x + (pb.x - pa.x) * t;
          const cy = pa.y + (pb.y - pa.y) * t;
          ctx.fillStyle = PALETTE.warn;
          ctx.shadowColor = PALETTE.warn;
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(cx, cy, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
      s.path.slice(0, s.cursor + 1).forEach((p) => {
        const n = nodes[p.nodeId];
        if (!n) return;
        const pos = nodeScreenPos(n, p.layer);
        ctx.strokeStyle = PALETTE.warn;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 7, 0, Math.PI * 2);
        ctx.stroke();
      });
    }

    if (s.result && !s.searching) {
      const n = nodes[s.result.nodeId];
      if (n) {
        const pos = nodeScreenPos(n, LAYERS - 1);
        ctx.fillStyle = PALETTE.ok;
        ctx.shadowColor = PALETTE.ok;
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = PALETTE.ok;
        ctx.font = '600 12px "Manrope", system-ui, sans-serif';
        ctx.textAlign = "center";
        ctx.fillText(messages.nearest, pos.x, pos.y - 14);
      }
    }

    if (s.query) {
      for (let L = 0; L < LAYERS; L++) {
        const pos = nodeScreenPos(s.query, L);
        ctx.strokeStyle = PALETTE.primary;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([2, 3]);
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 11, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      const qpos = nodeScreenPos(s.query, LAYERS - 1);
      ctx.fillStyle = PALETTE.primary;
      ctx.shadowColor = PALETTE.primary;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(qpos.x, qpos.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card/60 p-3 backdrop-blur">
        <button
          type="button"
          onClick={startRandomQuery}
          className="inline-flex items-center gap-2 rounded-lg bg-[color:var(--primary)]/15 px-3.5 py-1.5 text-sm font-medium text-[color:var(--primary)] ring-1 ring-[color:var(--primary)]/30 transition hover:bg-[color:var(--primary)]/25"
        >
          <Crosshair className="size-3.5" />
          {messages.search}
        </button>
        <button
          type="button"
          onClick={regenerateDataset}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary/60 px-3.5 py-1.5 text-sm text-secondary-foreground hover:bg-secondary"
        >
          <Shuffle className="size-3.5" />
          {messages.regenerate}
        </button>
        <div className="ml-auto flex items-center gap-4 font-mono text-xs text-muted-foreground">
          <span>
            {messages.currentLayer}{" "}
            <span className="text-[color:var(--primary)]">{String(status.layer)}</span>
          </span>
          <span>
            {messages.comparisons}{" "}
            <span className="text-[color:var(--accent)]">{String(status.comparisons)}</span>
          </span>
        </div>
      </div>

      <Stage width={W} height={H} draw={draw} animate={isAnimating} redrawKey={redrawKey} />
    </div>
  );
}
