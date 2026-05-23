"use client";

import { useEffect, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Stage, PALETTE, roundRect, arrowHead } from "./stage";

export interface CosineMessages {
  title: string;
  subtitle: string;
  rotate: string;
  length: string;
  nextPreset: string;
  calculation: string;
  interp: {
    verySimilar: string;
    similar: string;
    weakSimilar: string;
    unrelated: string;
    weakOpposite: string;
    opposite: string;
  };
  expected: string;
  presets: {
    p1A: string;
    p1B: string;
    p1Exp: string;
    p2A: string;
    p2B: string;
    p2Exp: string;
    p3A: string;
    p3B: string;
    p3Exp: string;
    p4A: string;
    p4B: string;
    p4Exp: string;
  };
}

const W = 1280;
const H = 620;

export function SceneCosine({ messages }: { messages: CosineMessages }) {
  const PRESETS = [
    { angA: -Math.PI / 4, angB: -Math.PI / 6, labelA: messages.presets.p1A, labelB: messages.presets.p1B, expected: messages.presets.p1Exp },
    { angA: -Math.PI / 4, angB: Math.PI / 2 - 0.3, labelA: messages.presets.p2A, labelB: messages.presets.p2B, expected: messages.presets.p2Exp },
    { angA: -Math.PI / 4, angB: Math.PI - Math.PI / 4, labelA: messages.presets.p3A, labelB: messages.presets.p3B, expected: messages.presets.p3Exp },
    { angA: -Math.PI / 4, angB: -Math.PI / 4 + 0.001, labelA: messages.presets.p4A, labelB: messages.presets.p4B, expected: messages.presets.p4Exp },
  ];

  const [presetIdx, setPresetIdx] = useState(0);
  const [angleA, setAngleA] = useState(PRESETS[0].angA);
  const [angleB, setAngleB] = useState(PRESETS[0].angB);
  const [lenB, setLenB] = useState(1);
  const lenA = 1;

  const stateRef = useRef({ angleA, angleB, lenA, lenB, presetIdx });
  useEffect(() => {
    stateRef.current = { angleA, angleB, lenA, lenB, presetIdx };
  }, [angleA, angleB, lenA, lenB, presetIdx]);

  function applyPreset(idx: number) {
    const p = PRESETS[idx];
    setPresetIdx(idx);
    setAngleA(p.angA);
    setAngleB(p.angB);
    setLenB(1);
  }

  function draw(ctx: CanvasRenderingContext2D) {
    const { angleA, angleB, lenA, lenB, presetIdx } = stateRef.current;
    ctx.clearRect(0, 0, W, H);

    const CX = 460;
    const CY = 320;
    const SCALE = 200;

    // header
    ctx.textAlign = "left";
    ctx.fillStyle = PALETTE.text;
    ctx.font = '700 13px "Manrope", system-ui, sans-serif';
    ctx.fillText(messages.title, 36, 28);
    ctx.font = '11px "JetBrains Mono", ui-monospace, monospace';
    ctx.fillStyle = PALETTE.dim;
    ctx.fillText(messages.subtitle, 36, 46);

    // concentric circles
    ctx.strokeStyle = PALETTE.border;
    ctx.lineWidth = 0.6;
    for (let i = 1; i <= 6; i++) {
      const r = (i / 6) * SCALE;
      ctx.beginPath();
      ctx.arc(CX, CY, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    // axes
    ctx.strokeStyle = PALETTE.dim;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 4]);
    ctx.beginPath();
    ctx.moveTo(CX - SCALE - 20, CY);
    ctx.lineTo(CX + SCALE + 20, CY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(CX, CY - SCALE - 20);
    ctx.lineTo(CX, CY + SCALE + 20);
    ctx.stroke();
    ctx.setLineDash([]);

    // arc theta
    const arcR = 60;
    ctx.strokeStyle = PALETTE.accent;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.arc(CX, CY, arcR, angleA, angleB, angleB < angleA);
    ctx.stroke();
    ctx.setLineDash([]);

    const midAng = (angleA + angleB) / 2;
    ctx.fillStyle = PALETTE.accent;
    ctx.font = '700 14px "Manrope", system-ui, sans-serif';
    ctx.textAlign = "center";
    ctx.fillText("θ", CX + Math.cos(midAng) * (arcR + 18), CY + Math.sin(midAng) * (arcR + 18) + 5);

    const ax = Math.cos(angleA) * SCALE * lenA;
    const ay = Math.sin(angleA) * SCALE * lenA;
    const bx = Math.cos(angleB) * SCALE * lenB;
    const by = Math.sin(angleB) * SCALE * lenB;

    // glow vectors
    ctx.save();
    ctx.shadowColor = PALETTE.primary;
    ctx.shadowBlur = 12;
    ctx.strokeStyle = PALETTE.primary;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(CX, CY);
    ctx.lineTo(CX + ax, CY + ay);
    ctx.stroke();
    arrowHead(ctx, CX + ax, CY + ay, angleA, PALETTE.primary, 12);
    ctx.restore();

    ctx.save();
    ctx.shadowColor = PALETTE.warn;
    ctx.shadowBlur = 12;
    ctx.strokeStyle = PALETTE.warn;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(CX, CY);
    ctx.lineTo(CX + bx, CY + by);
    ctx.stroke();
    arrowHead(ctx, CX + bx, CY + by, angleB, PALETTE.warn, 12);
    ctx.restore();

    const preset = PRESETS[presetIdx];
    ctx.fillStyle = PALETTE.primary;
    ctx.font = '600 13px "JetBrains Mono", ui-monospace, monospace';
    ctx.textAlign = "left";
    ctx.fillText("A " + preset.labelA, CX + ax + 12, CY + ay + 4);
    ctx.fillStyle = PALETTE.warn;
    ctx.fillText("B " + preset.labelB, CX + bx + 12, CY + by + 4);

    // right panel
    const dotAB = ax * bx + ay * by;
    const normA = Math.hypot(ax, ay);
    const normB = Math.hypot(bx, by);
    const cosCalc = dotAB / (normA * normB);
    const c = cosCalc > 0.7 ? PALETTE.ok : cosCalc < 0 ? PALETTE.bad : PALETTE.dim;

    const px = 880;
    const py = 80;
    const pw = 360;
    roundRect(ctx, px, py, pw, 440, 14);
    ctx.fillStyle = "rgba(11,13,20,0.85)";
    ctx.fill();
    ctx.strokeStyle = PALETTE.border;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = PALETTE.text;
    ctx.font = '600 14px "Manrope", system-ui, sans-serif';
    ctx.fillText(messages.calculation, px + 18, py + 28);

    ctx.font = '12px "JetBrains Mono", ui-monospace, monospace';
    ctx.fillStyle = PALETTE.dim;
    ctx.fillText("        A · B", px + 18, py + 58);
    ctx.fillText("cos(θ) = ─────────", px + 18, py + 76);
    ctx.fillText("        |A| · |B|", px + 18, py + 94);

    ctx.fillStyle = PALETTE.text;
    ctx.font = '13px "JetBrains Mono", ui-monospace, monospace';
    ctx.fillText(`A = (${(Math.cos(angleA) * lenA).toFixed(2)}, ${(Math.sin(angleA) * lenA).toFixed(2)})`, px + 18, py + 134);
    ctx.fillText(`B = (${(Math.cos(angleB) * lenB).toFixed(2)}, ${(Math.sin(angleB) * lenB).toFixed(2)})`, px + 18, py + 154);
    ctx.fillText(`A · B   = ${(dotAB / SCALE / SCALE).toFixed(3)}`, px + 18, py + 184);
    ctx.fillText(`|A|     = ${(normA / SCALE).toFixed(3)}`, px + 18, py + 202);
    ctx.fillText(`|B|     = ${(normB / SCALE).toFixed(3)}`, px + 18, py + 220);

    ctx.font = '700 30px "Manrope", system-ui, sans-serif';
    ctx.fillStyle = c;
    ctx.textAlign = "center";
    ctx.fillText(`cos(θ) = ${cosCalc.toFixed(3)}`, px + pw / 2, py + 280);

    // bar
    const barW = pw - 60;
    const barX = px + 30;
    const barY = py + 304;
    roundRect(ctx, barX, barY, barW, 10, 5);
    ctx.fillStyle = PALETTE.panel2;
    ctx.fill();
    const markerX = barX + ((cosCalc + 1) / 2) * barW;
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(markerX, barY + 5, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = c;
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(markerX, barY + 5, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = PALETTE.dim;
    ctx.font = '10px "JetBrains Mono", ui-monospace, monospace';
    ctx.textAlign = "left";
    ctx.fillText("-1", barX, barY + 30);
    ctx.textAlign = "center";
    ctx.fillText("0", barX + barW / 2, barY + 30);
    ctx.textAlign = "right";
    ctx.fillText("+1", barX + barW, barY + 30);

    let interp = messages.interp.unrelated;
    if (cosCalc > 0.9) interp = messages.interp.verySimilar;
    else if (cosCalc > 0.6) interp = messages.interp.similar;
    else if (cosCalc > 0.3) interp = messages.interp.weakSimilar;
    else if (cosCalc > -0.1) interp = messages.interp.unrelated;
    else if (cosCalc > -0.6) interp = messages.interp.weakOpposite;
    else interp = messages.interp.opposite;
    ctx.textAlign = "center";
    ctx.fillStyle = c;
    ctx.font = '600 14px "Manrope", system-ui, sans-serif';
    ctx.fillText("→ " + interp, px + pw / 2, py + 370);

    ctx.fillStyle = PALETTE.dim;
    ctx.font = '11px "JetBrains Mono", ui-monospace, monospace';
    ctx.fillText(messages.expected, px + pw / 2, py + 398);
    ctx.fillStyle = PALETTE.text;
    ctx.fillText(preset.expected, px + pw / 2, py + 416);
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-2xl border border-border bg-card/60 p-3 backdrop-blur sm:grid-cols-[1fr_1fr_auto]">
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          <span className="font-mono uppercase tracking-wide">
            {messages.rotate} · {((angleB * 180) / Math.PI).toFixed(0)}°
          </span>
          <input
            type="range"
            min={-Math.PI}
            max={Math.PI}
            step={0.01}
            value={angleB}
            onChange={(e) => setAngleB(parseFloat(e.target.value))}
            className="accent-[color:var(--primary)]"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          <span className="font-mono uppercase tracking-wide">
            {messages.length} · {lenB.toFixed(2)}
          </span>
          <input
            type="range"
            min={0.3}
            max={2}
            step={0.05}
            value={lenB}
            onChange={(e) => setLenB(parseFloat(e.target.value))}
            className="accent-[color:var(--accent)]"
          />
        </label>
        <button
          type="button"
          onClick={() => applyPreset((presetIdx + 1) % PRESETS.length)}
          className="inline-flex items-center gap-2 self-end rounded-lg bg-[color:var(--primary)]/15 px-3.5 py-1.5 text-sm font-medium text-[color:var(--primary)] ring-1 ring-[color:var(--primary)]/30 transition hover:bg-[color:var(--primary)]/25"
        >
          <RefreshCw className="size-3.5" />
          {messages.nextPreset}
        </button>
      </div>

      <Stage
        width={W}
        height={H}
        draw={draw}
        animate={false}
        redrawKey={`${angleA}:${angleB}:${lenB}:${presetIdx}`}
      />
    </div>
  );
}
