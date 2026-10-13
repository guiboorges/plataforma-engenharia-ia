import React, { useId } from "react";

// Gráfico SVG mínimo para os widgets do M5: eixos, grelha, rótulos e uma área recortada onde se desenha.
// As cores vêm dos tokens (--chart-1, --chart-2, --grid-line, --text-3), via classes em widgets-m5.css.

export type Scale = (v: number) => number;

type PlotProps = {
  label: string;
  x: [number, number];
  y: [number, number];
  xTicks: number[];
  yTicks: number[];
  xLabel?: string;
  yLabel?: string;
  fmtX?: (v: number) => string;
  fmtY?: (v: number) => string;
  w?: number;
  h?: number;
  children: (sx: Scale, sy: Scale) => React.ReactNode;
};

const L = 40;
const R = 10;
const T = 10;
const B = 30;

const dflt = (v: number) => String(Math.round(v * 1000) / 1000).replace(".", ",").replace(/^-/, "−");

export function Plot({ label, x, y, xTicks, yTicks, xLabel, yLabel, fmtX = dflt, fmtY = dflt, w = 360, h = 220, children }: PlotProps) {
  const clip = `m5c${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const sx: Scale = (v) => L + ((v - x[0]) / (x[1] - x[0])) * (w - L - R);
  const sy: Scale = (v) => h - B - ((v - y[0]) / (y[1] - y[0])) * (h - T - B);
  return (
    <svg className="m5-plot" viewBox={`0 0 ${w} ${h}`} role="img" aria-label={label}>
      <defs>
        <clipPath id={clip}>
          <rect x={L} y={T} width={w - L - R} height={h - T - B} />
        </clipPath>
      </defs>
      <rect className="m5-plot-frame" x={L} y={T} width={w - L - R} height={h - T - B} />
      {xTicks.map((t) => (
        <g key={`x${t}`}>
          <line className={t === 0 ? "m5-plot-zero" : "m5-plot-grid"} x1={sx(t)} x2={sx(t)} y1={T} y2={h - B} />
          <text className="m5-plot-tick" x={sx(t)} y={h - B + 13} textAnchor="middle">
            {fmtX(t)}
          </text>
        </g>
      ))}
      {yTicks.map((t) => (
        <g key={`y${t}`}>
          <line className={t === 0 ? "m5-plot-zero" : "m5-plot-grid"} x1={L} x2={w - R} y1={sy(t)} y2={sy(t)} />
          <text className="m5-plot-tick" x={L - 5} y={sy(t) + 3.5} textAnchor="end">
            {fmtY(t)}
          </text>
        </g>
      ))}
      {xLabel && (
        <text className="m5-plot-label" x={w - R} y={h - 3} textAnchor="end">
          {xLabel}
        </text>
      )}
      {yLabel && (
        <text className="m5-plot-label" x={L + 4} y={T + 11}>
          {yLabel}
        </text>
      )}
      <g clipPath={`url(#${clip})`}>{children(sx, sy)}</g>
    </svg>
  );
}

/** Caminho de uma função amostrada, com os valores fora do gráfico presos perto da margem (o recorte esconde-os). */
export function curvePath(f: (v: number) => number, x: [number, number], y: [number, number], sx: Scale, sy: Scale, n = 160): string {
  const span = y[1] - y[0];
  const pts: string[] = [];
  for (let i = 0; i <= n; i++) {
    const v = x[0] + ((x[1] - x[0]) * i) / n;
    const fv = Math.min(y[1] + span, Math.max(y[0] - span, f(v)));
    pts.push(`${i ? "L" : "M"}${sx(v).toFixed(2)},${sy(fv).toFixed(2)}`);
  }
  return pts.join("");
}

/** Prende um valor a uma faixa larga à volta do gráfico (para pontos que divergem). */
export function clampTo(v: number, r: [number, number]): number {
  const span = r[1] - r[0];
  if (!Number.isFinite(v)) return v > 0 ? r[1] + span : r[0] - span;
  return Math.min(r[1] + span, Math.max(r[0] - span, v));
}
