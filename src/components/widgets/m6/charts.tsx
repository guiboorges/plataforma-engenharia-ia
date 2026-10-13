import React from "react";

// Gráficos simples em SVG para os widgets do M6. O SVG estica para a largura do painel (preserveAspectRatio="none")
// e as linhas mantêm 1,5 px (vector-effect); as etiquetas dos eixos são HTML, para não deformarem.

export type Tick = { at: number; label: string };
export type VLine = { at: number; kind: "zero" | "obs" | "ref" };

const W = 100;
const H = 100;

export function HistChart({
  edges,
  heights,
  lo,
  hi,
  yMax,
  curve,
  band,
  vlines = [],
  hiBins,
  ticks,
  label,
}: {
  edges: number[];
  heights: number[];
  lo: number;
  hi: number;
  yMax: number;
  /** pontos (x, y) de uma curva sobreposta, por exemplo a normal prevista */
  curve?: [number, number][];
  /** intervalo sombreado no eixo x */
  band?: [number, number];
  vlines?: VLine[];
  /** índices das barras a destacar */
  hiBins?: (i: number) => boolean;
  ticks: Tick[];
  label: string;
}) {
  const sx = (x: number) => ((x - lo) / (hi - lo)) * W;
  const sy = (y: number) => H - (Math.min(y, yMax) / yMax) * H;
  return (
    <div className="m6-chart">
      <svg className="m6-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={label}>
        {band && <rect className="m6-band" x={sx(band[0])} y={0} width={Math.max(0, sx(band[1]) - sx(band[0]))} height={H} />}
        {heights.map((h, i) =>
          h > 0 ? (
            <rect
              key={i}
              className={`m6-bar ${hiBins?.(i) ? "is-hi" : ""}`}
              x={sx(edges[i])}
              y={sy(h)}
              width={Math.max(0, sx(edges[i + 1]) - sx(edges[i]) - 0.15)}
              height={H - sy(h)}
            />
          ) : null,
        )}
        {curve && <polyline className="m6-curve" points={curve.map(([x, y]) => `${sx(x)},${sy(y)}`).join(" ")} vectorEffect="non-scaling-stroke" />}
        {vlines.map((v, i) =>
          v.at >= lo && v.at <= hi ? (
            <line key={i} className={`m6-vline is-${v.kind}`} x1={sx(v.at)} x2={sx(v.at)} y1={0} y2={H} vectorEffect="non-scaling-stroke" />
          ) : null,
        )}
        <line className="m6-axis" x1={0} x2={W} y1={H} y2={H} vectorEffect="non-scaling-stroke" />
      </svg>
      <Ticks ticks={ticks.filter((t) => t.at >= lo && t.at <= hi).map((t) => ({ at: sx(t.at), label: t.label }))} />
    </div>
  );
}

export type Series = { points: [number, number][]; cls: string; label: string };

/** Linhas com o eixo x em escala logarítmica (de xMin a xMax) e o y entre 0 e yMax (os valores acima ficam cortados). */
export function LogLineChart({
  series,
  xMin,
  xMax,
  yMax,
  refLine: refY,
  xTicks,
  yTicks,
  label,
}: {
  series: Series[];
  xMin: number;
  xMax: number;
  yMax: number;
  refLine?: number;
  xTicks: Tick[];
  yTicks: Tick[];
  label: string;
}) {
  const lx0 = Math.log10(xMin);
  const lx1 = Math.log10(xMax);
  const sx = (x: number) => ((Math.log10(x) - lx0) / (lx1 - lx0)) * W;
  const sy = (y: number) => H - (Math.min(Math.max(y, 0), yMax) / yMax) * H;
  return (
    <div className="m6-chart m6-chart-y">
      <div className="m6-yticks" aria-hidden="true">
        {yTicks.map((t) => (
          <span key={t.label} style={{ top: `${(sy(t.at) / H) * 100}%` }}>
            {t.label}
          </span>
        ))}
      </div>
      <div className="m6-plot">
        <svg className="m6-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={label}>
          {yTicks.map((t) => (
            <line key={t.label} className="m6-grid" x1={0} x2={W} y1={sy(t.at)} y2={sy(t.at)} vectorEffect="non-scaling-stroke" />
          ))}
          {refY !== undefined && <line className="m6-vline is-ref" x1={0} x2={W} y1={sy(refY)} y2={sy(refY)} vectorEffect="non-scaling-stroke" />}
          {series.map((s) => (
            <polyline
              key={s.label}
              className={`m6-line ${s.cls}`}
              points={s.points.map(([x, y]) => `${sx(x)},${sy(y)}`).join(" ")}
              vectorEffect="non-scaling-stroke"
            />
          ))}
          <line className="m6-axis" x1={0} x2={W} y1={H} y2={H} vectorEffect="non-scaling-stroke" />
        </svg>
        <Ticks ticks={xTicks.map((t) => ({ at: sx(t.at), label: t.label }))} />
      </div>
    </div>
  );
}

function Ticks({ ticks }: { ticks: Tick[] }) {
  return (
    <div className="m6-ticks" aria-hidden="true">
      {ticks.map((t) => (
        <span key={t.label + t.at} style={{ left: `${t.at}%` }} className={t.at < 4 ? "is-start" : t.at > 96 ? "is-end" : ""}>
          {t.label}
        </span>
      ))}
    </div>
  );
}

/** Escolhe cerca de `count` marcas "redondas" entre lo e hi; `fmt` recebe o valor e o passo (para escolher as casas decimais). */
export function niceTicks(lo: number, hi: number, fmt: (x: number, step: number) => string, count = 5): Tick[] {
  const span = hi - lo;
  if (!(span > 0)) return [];
  const mag = 10 ** Math.floor(Math.log10(span / count));
  const steps = [1, 2, 2.5, 5, 10].map((m) => m * mag);
  const step = steps.reduce((best, s) => (Math.abs(span / s - count) < Math.abs(span / best - count) ? s : best));
  const out: Tick[] = [];
  for (let k = Math.ceil(lo / step - 1e-9); k * step <= hi + 1e-9; k++) {
    const v = k === 0 ? 0 : k * step;
    out.push({ at: v, label: fmt(v, step) });
  }
  return out;
}

/** Casas decimais para marcas com este passo (0,25 → 2; 5 → 0). */
export const stepDigits = (step: number) =>
  Math.max(0, Math.ceil(-Math.log10(step) - 1e-9) + (Math.abs(step / 10 ** Math.floor(Math.log10(step)) - 2.5) < 1e-9 ? 1 : 0));
