import React from "react";

// Gráfico de linhas em SVG para os widgets do M11: o SVG estica à largura do painel (preserveAspectRatio="none"),
// as linhas mantêm a espessura (vector-effect) e as etiquetas dos eixos são HTML, para não deformarem.

export type Tick = { at: number; label: string };
export type Line = { points: [number, number][]; cls: "is-main" | "is-ref" };

const W = 100;
const H = 100;

export function LineChart({
  lines,
  point,
  xMax = 1,
  yMax = 1,
  xTicks,
  yTicks,
  xLabel,
  yLabel,
  label,
}: {
  lines: Line[];
  /** ponto destacado (a escolha atual) */
  point?: [number, number];
  xMax?: number;
  yMax?: number;
  xTicks: Tick[];
  yTicks: Tick[];
  xLabel: string;
  yLabel: string;
  label: string;
}) {
  const sx = (x: number) => (x / xMax) * W;
  const sy = (y: number) => H - (Math.min(Math.max(y, 0), yMax) / yMax) * H;
  return (
    <figure className="m11-chart">
      <figcaption className="m11-chart-y small muted">{yLabel}</figcaption>
      <div className="m11-chart-body">
        <div className="m11-yticks" aria-hidden="true">
          {yTicks.map((t) => (
            <span key={t.label} style={{ top: `${(sy(t.at) / H) * 100}%` }}>
              {t.label}
            </span>
          ))}
        </div>
        <div className="m11-plot">
          <svg className="m11-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={label}>
            {yTicks.map((t) => (
              <line key={t.label} className="m11-grid" x1={0} x2={W} y1={sy(t.at)} y2={sy(t.at)} vectorEffect="non-scaling-stroke" />
            ))}
            {lines.map((l, i) => (
              <polyline key={i} className={`m11-line ${l.cls}`} points={l.points.map(([x, y]) => `${sx(x)},${sy(y)}`).join(" ")} vectorEffect="non-scaling-stroke" />
            ))}
            {point && (
              <>
                <line className="m11-guide" x1={sx(point[0])} x2={sx(point[0])} y1={sy(point[1])} y2={H} vectorEffect="non-scaling-stroke" />
                <line className="m11-guide" x1={0} x2={sx(point[0])} y1={sy(point[1])} y2={sy(point[1])} vectorEffect="non-scaling-stroke" />
              </>
            )}
            <line className="m11-axis" x1={0} x2={W} y1={H} y2={H} vectorEffect="non-scaling-stroke" />
            <line className="m11-axis" x1={0} x2={0} y1={0} y2={H} vectorEffect="non-scaling-stroke" />
          </svg>
          {point && <span className="m11-dot" style={{ left: `${sx(point[0])}%`, top: `${(sy(point[1]) / H) * 100}%` }} aria-hidden="true" />}
          <div className="m11-xticks" aria-hidden="true">
            {xTicks.map((t) => (
              <span key={t.label} style={{ left: `${sx(t.at)}%` }} className={t.at <= 0 ? "is-start" : t.at >= xMax ? "is-end" : ""}>
                {t.label}
              </span>
            ))}
          </div>
          <div className="m11-xlabel small muted">{xLabel}</div>
        </div>
      </div>
    </figure>
  );
}
