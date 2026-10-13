import React, { useId } from "react";

// Gráfico SVG mínimo para os widgets do M8: grelha, marcas, rótulos e uma área recortada onde se desenha.
// As cores vêm dos tokens, via classes em widgets-m8.css.

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
  /** escala logarítmica no eixo x (x e xTicks em valores reais) */
  logX?: boolean;
  w?: number;
  h?: number;
  /** margem esquerda (para rótulos do eixo y mais compridos) */
  left?: number;
  children: (sx: Scale, sy: Scale) => React.ReactNode;
};

const R = 10;
const T = 10;
const B = 30;

/** Número em português: vírgula decimal e sinal de menos tipográfico. */
export function pt(v: number, d: number): string {
  const s = v.toFixed(d);
  const t = Number(s) === 0 ? s.replace(/^-/, "") : s;
  return t.replace(".", ",").replace(/^-/, "−");
}

/** Inteiro com espaço a separar os milhares (10 000). */
export function ptInt(v: number): string {
  return Math.round(v)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ")
    .replace(/^-/, "−");
}

const dflt = (v: number) => pt(v, Math.abs(v) < 10 && !Number.isInteger(v) ? 1 : 0);

export function Plot({ label, x, y, xTicks, yTicks, xLabel, yLabel, fmtX = dflt, fmtY = dflt, logX, w = 360, h = 220, left = 40, children }: PlotProps) {
  const clip = `m8c${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const L = left;
  const tx = (v: number) => (logX ? Math.log10(v) : v);
  const x0 = tx(x[0]);
  const x1 = tx(x[1]);
  const sx: Scale = (v) => L + ((tx(v) - x0) / (x1 - x0)) * (w - L - R);
  const sy: Scale = (v) => h - B - ((v - y[0]) / (y[1] - y[0])) * (h - T - B);
  return (
    <svg className="m8-plot" viewBox={`0 0 ${w} ${h}`} role="img" aria-label={label}>
      <defs>
        <clipPath id={clip}>
          <rect x={L} y={T} width={w - L - R} height={h - T - B} />
        </clipPath>
      </defs>
      {xTicks.map((t) => (
        <g key={`x${t}`}>
          <line className={!logX && t === 0 ? "m8-plot-zero" : "m8-plot-grid"} x1={sx(t)} x2={sx(t)} y1={T} y2={h - B} />
          <text className="m8-plot-tick" x={sx(t)} y={h - B + 13} textAnchor="middle">
            {fmtX(t)}
          </text>
        </g>
      ))}
      {yTicks.map((t) => (
        <g key={`y${t}`}>
          <line className={t === 0 ? "m8-plot-zero" : "m8-plot-grid"} x1={L} x2={w - R} y1={sy(t)} y2={sy(t)} />
          <text className="m8-plot-tick" x={L - 5} y={sy(t) + 3.5} textAnchor="end">
            {fmtY(t)}
          </text>
        </g>
      ))}
      {xLabel && (
        <text className="m8-plot-label" x={w - R} y={h - 3} textAnchor="end">
          {xLabel}
        </text>
      )}
      {yLabel && (
        <text className="m8-plot-label" x={L + 4} y={T + 11}>
          {yLabel}
        </text>
      )}
      <g clipPath={`url(#${clip})`}>{children(sx, sy)}</g>
    </svg>
  );
}

/** Caminho SVG de uma lista de pontos já em coordenadas do ecrã. */
export function pathOf(pts: [number, number][]): string {
  return pts.map(([a, b], k) => `${k ? "L" : "M"}${a.toFixed(2)},${b.toFixed(2)}`).join("");
}

/** Controlo deslizante com rótulo e valor. */
export function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  display,
  aria,
}: {
  label: React.ReactNode;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  display: string;
  aria: string;
}) {
  return (
    <label className="m8-slider">
      <span className="m8-slider-head">
        <span className="small muted">{label}</span>
        <span className="mono small m8-val">{display}</span>
      </span>
      <input
        type="range"
        className="m8-range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={aria}
        aria-valuetext={display}
      />
    </label>
  );
}
