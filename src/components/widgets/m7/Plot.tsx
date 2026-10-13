import React, { useId } from "react";

// Gráfico SVG mínimo para os widgets do M7: moldura, grelha, marcas e uma área recortada onde se desenha.
// O viewBox mantém as proporções (o SVG encolhe com o painel); as cores vêm dos tokens, via widgets-m7.css.

export type Scale = (v: number) => number;
export type Tick = { at: number; label: string };

type PlotProps = {
  label: string;
  x: [number, number];
  y: [number, number];
  xTicks: Tick[];
  yTicks: Tick[];
  xLabel?: string;
  yLabel?: string;
  w?: number;
  h?: number;
  children: (sx: Scale, sy: Scale) => React.ReactNode;
  /** Desenhado por cima, sem recorte (etiquetas de valores fora do gráfico). */
  overlay?: (sx: Scale, sy: Scale) => React.ReactNode;
};

const L = 44;
const R = 10;
const T = 12;
const B = 32;

export function Plot({ label, x, y, xTicks, yTicks, xLabel, yLabel, w = 360, h = 240, children, overlay }: PlotProps) {
  const clip = `m7c${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const sx: Scale = (v) => L + ((v - x[0]) / (x[1] - x[0])) * (w - L - R);
  const sy: Scale = (v) => h - B - ((v - y[0]) / (y[1] - y[0])) * (h - T - B);
  return (
    <svg className="m7-plot" viewBox={`0 0 ${w} ${h}`} role="img" aria-label={label}>
      <defs>
        <clipPath id={clip}>
          <rect x={L} y={T} width={w - L - R} height={h - T - B} />
        </clipPath>
      </defs>
      {xTicks.map((t) => (
        <g key={`x${t.at}`}>
          <line className="m7-plot-grid" x1={sx(t.at)} x2={sx(t.at)} y1={T} y2={h - B} />
          <text className="m7-plot-tick" x={sx(t.at)} y={h - B + 13} textAnchor="middle">
            {t.label}
          </text>
        </g>
      ))}
      {yTicks.map((t) => (
        <g key={`y${t.at}`}>
          <line className="m7-plot-grid" x1={L} x2={w - R} y1={sy(t.at)} y2={sy(t.at)} />
          <text className="m7-plot-tick" x={L - 5} y={sy(t.at) + 3.5} textAnchor="end">
            {t.label}
          </text>
        </g>
      ))}
      <rect className="m7-plot-frame" x={L} y={T} width={w - L - R} height={h - T - B} />
      {xLabel && (
        <text className="m7-plot-label" x={w - R} y={h - 4} textAnchor="end">
          {xLabel}
        </text>
      )}
      {yLabel && (
        <text className="m7-plot-label" x={L + 5} y={T + 12}>
          {yLabel}
        </text>
      )}
      <g clipPath={`url(#${clip})`}>{children(sx, sy)}</g>
      {overlay?.(sx, sy)}
    </svg>
  );
}

/** Pontos (x, y) → atributo `points` de uma polyline. */
export function pts(points: [number, number][], sx: Scale, sy: Scale): string {
  return points.map(([a, b]) => `${sx(a).toFixed(2)},${sy(b).toFixed(2)}`).join(" ");
}

/** Número em português, arredondado a d casas, sem zeros à direita: 0.3280 → "0,328"; 21113.44 → "21 113,44". */
export function num(x: number, d: number): string {
  if (!Number.isFinite(x)) return "—";
  const r = Number(x.toFixed(d));
  const [int, frac] = Math.abs(r).toString().split(".");
  const grouped = int.length > 4 ? int.replace(/\B(?=(\d{3})+(?!\d))/g, " ") : int;
  return `${r < 0 ? "−" : ""}${grouped}${frac ? `,${frac}` : ""}`;
}

/** Percentagem com uma casa: 0.3284 → "32,8%". */
export function pct(x: number): string {
  return `${num(x * 100, 1)}%`;
}
