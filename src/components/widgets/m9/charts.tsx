import React, { useId } from "react";

// Gráfico SVG mínimo para os widgets do M9: moldura, grelha, marcas e uma área recortada onde se desenha.
// O SVG escala por inteiro com a largura do painel (viewBox fixo); as cores vêm dos tokens, via widgets-m9.css.

export type Scale = (v: number) => number;

export const L = 40;
export const R = 10;
export const T = 10;
export const B = 26;

/** Número em português: vírgula decimal e sinal de menos tipográfico. */
export function num(x: number, d: number): string {
  const s = (Math.abs(x) < 0.5 * 10 ** -d ? 0 : x).toFixed(d);
  return s.replace(".", ",").replace(/^-/, "−");
}

export const pct = (x: number, d = 1) => `${num(100 * x, d)}%`;

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
  logX?: boolean;
  w?: number;
  h?: number;
  left?: number;
  className?: string;
  children: (sx: Scale, sy: Scale) => React.ReactNode;
};

export function Plot({
  label,
  x,
  y,
  xTicks,
  yTicks,
  xLabel,
  yLabel,
  fmtX = (v) => num(v, 0),
  fmtY = (v) => num(v, 0),
  logX = false,
  w = 360,
  h = 200,
  left = L,
  className,
  children,
}: PlotProps) {
  const clip = `m9c${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const tx = (v: number) => (logX ? Math.log10(v) : v);
  const x0 = tx(x[0]);
  const x1 = tx(x[1]);
  const sx: Scale = (v) => left + ((tx(v) - x0) / (x1 - x0)) * (w - left - R);
  const sy: Scale = (v) => h - B - ((v - y[0]) / (y[1] - y[0])) * (h - T - B);
  return (
    <svg className={`m9-plot ${className ?? ""}`} viewBox={`0 0 ${w} ${h}`} role="img" aria-label={label}>
      <defs>
        <clipPath id={clip}>
          <rect x={left} y={T} width={w - left - R} height={h - T - B} />
        </clipPath>
      </defs>
      {xTicks.map((t) => (
        <g key={`x${t}`}>
          <line className="m9-grid" x1={sx(t)} x2={sx(t)} y1={T} y2={h - B} />
          <text className="m9-tick" x={sx(t)} y={h - B + 13} textAnchor="middle">
            {fmtX(t)}
          </text>
        </g>
      ))}
      {yTicks.map((t) => (
        <g key={`y${t}`}>
          <line className="m9-grid" x1={left} x2={w - R} y1={sy(t)} y2={sy(t)} />
          <text className="m9-tick" x={left - 5} y={sy(t) + 3.5} textAnchor="end">
            {fmtY(t)}
          </text>
        </g>
      ))}
      <line className="m9-axis" x1={left} x2={w - R} y1={h - B} y2={h - B} />
      {xLabel && (
        <text className="m9-axis-label" x={w - R} y={h - 2} textAnchor="end">
          {xLabel}
        </text>
      )}
      {yLabel && (
        <text className="m9-axis-label" x={left + 4} y={T + 11}>
          {yLabel}
        </text>
      )}
      <g clipPath={`url(#${clip})`}>{children(sx, sy)}</g>
    </svg>
  );
}

/** Caminho de uma polilinha. */
export const pathOf = (pts: [number, number][], sx: Scale, sy: Scale) =>
  pts.map(([a, b], i) => `${i ? "L" : "M"}${sx(a).toFixed(2)},${sy(b).toFixed(2)}`).join("");
