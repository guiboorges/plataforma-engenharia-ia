import React, { useState } from "react";
import { Chip } from "../../ui";
import { C_FIG, ellipse, lassoConstrained, ridgeConstrained, rss, type Vec } from "./geometria";
import { Plot, Slider, pathOf, pt } from "./Plot";

// A geometria do Lasso e do Ridge (secção 3, figura 03): a taça do erro (elipses à volta da solução dos mínimos
// quadrados) e a região permitida, o losango |β₁| + |β₂| ≤ t ou o círculo β₁² + β₂² ≤ t². A solução é o primeiro ponto
// da região que as elipses tocam. Os cálculos (geometria.ts) foram testados com `node` contra o SciPy 1.18.

const DOM: [number, number] = [-1.5, 3.5];
const TICKS = [-1, 0, 1, 2, 3];

type Preset = { label: string; c: Vec; t: number };
const PRESETS: Preset[] = [
  { label: "Figura da aula", c: [C_FIG[0], C_FIG[1]], t: 1 },
  { label: "Lasso sem zeros", c: [1.2, 1.6], t: 1 },
  { label: "Restrição folgada", c: [C_FIG[0], C_FIG[1]], t: 3.3 },
];

const fmtV = (b: Vec) => `(${pt(b[0], 3)}; ${pt(b[1], 3)})`;

function Panel({ kind, c, t }: { kind: "l1" | "l2"; c: Vec; t: number }) {
  const l1 = kind === "l1";
  const sol = l1 ? lassoConstrained(t, c) : ridgeConstrained(t, c);
  const beta = sol.beta;
  const free = l1 ? Math.abs(c[0]) + Math.abs(c[1]) <= t : Math.hypot(c[0], c[1]) <= t;
  const k = rss(beta, c);
  const base = k > 1e-6 ? k : 0.25;
  const levels = [base, base * 2.2, base * 4, base * 6.5];
  const zeroCoef = !free && (beta[0] === 0 || beta[1] === 0);
  const title = l1 ? "Lasso: |β₁| + |β₂| ≤ t" : "Ridge: β₁² + β₂² ≤ t²";
  return (
    <div className="m8-col">
      <p className="m8-panel-title">{title}</p>
      <Plot
        label={`${title}, com t = ${pt(t, 2)}. Solução β = ${fmtV(beta)}; mínimos quadrados em ${fmtV(c)}`}
        x={DOM}
        y={DOM}
        xTicks={TICKS}
        yTicks={TICKS}
        fmtX={(v) => pt(v, 0)}
        fmtY={(v) => pt(v, 0)}
        xLabel="β₁"
        yLabel="β₂"
        w={290}
        h={280}
      >
        {(sx, sy) => (
          <>
            {l1 ? (
              <polygon
                className="m8-region"
                points={(
                  [
                    [t, 0],
                    [0, t],
                    [-t, 0],
                    [0, -t],
                  ] as Vec[]
                )
                  .map(([a, b]) => `${sx(a)},${sy(b)}`)
                  .join(" ")}
              />
            ) : (
              <circle className="m8-region" cx={sx(0)} cy={sy(0)} r={sx(t) - sx(0)} />
            )}
            {levels.map((lv, i) => (
              <path
                key={i}
                className={`m8-ell ${i === 0 && !free ? "is-touch" : ""}`}
                d={pathOf(ellipse(c, lv).map(([a, b]) => [sx(a), sy(b)]))}
              />
            ))}
            <circle className="m8-ols" cx={sx(c[0])} cy={sy(c[1])} r={4} />
            <text className="m8-plot-note" x={c[0] > 0.5 ? sx(c[0]) - 7 : sx(c[0]) + 7} y={c[1] > 2.8 ? sy(c[1]) + 16 : sy(c[1]) - 8} textAnchor={c[0] > 0.5 ? "end" : "start"}>
              mínimos quadrados
            </text>
            <circle className="m8-mark" cx={sx(beta[0])} cy={sy(beta[1])} r={5} />
          </>
        )}
      </Plot>
      <div className="m8-verdict">
        <span className="mono small">β = {fmtV(beta)}</span>
        {free ? (
          <Chip tone="neutral">A restrição não aperta</Chip>
        ) : zeroCoef ? (
          <Chip tone="info">
            {beta[1] === 0 ? "β₂" : "β₁"} = 0{l1 ? ": num canto" : ""}
          </Chip>
        ) : (
          <Chip tone="neutral">Nenhum coeficiente a zero</Chip>
        )}
      </div>
    </div>
  );
}

export function Geometria() {
  const [c, setC] = useState<Vec>([PRESETS[0].c[0], PRESETS[0].c[1]]);
  const [t, setT] = useState(PRESETS[0].t);
  const active = PRESETS.find((p) => p.c[0] === c[0] && p.c[1] === c[1] && p.t === t);
  const l1 = lassoConstrained(t, c);
  const l1Free = Math.abs(c[0]) + Math.abs(c[1]) <= t;
  const l1Zero = !l1Free && (l1.beta[0] === 0 || l1.beta[1] === 0);

  return (
    <div className="m8-wid">
      <div className="m8-pills" role="group" aria-label="Exemplos">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            className={`pill ${active === p ? "is-on" : ""}`}
            aria-pressed={active === p}
            onClick={() => {
              setC([p.c[0], p.c[1]]);
              setT(p.t);
            }}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="m8-params">
        <Slider label="Tamanho da região t" value={t} min={0.1} max={3.4} step={0.05} onChange={setT} display={pt(t, 2)} aria="Tamanho da região permitida, t" />
        <Slider
          label="Mínimos quadrados: β₁"
          value={c[0]}
          min={-1}
          max={3}
          step={0.1}
          onChange={(v) => setC([Math.round(v * 10) / 10, c[1]])}
          display={pt(c[0], 1)}
          aria="Coeficiente β₁ dos mínimos quadrados"
        />
        <Slider
          label="Mínimos quadrados: β₂"
          value={c[1]}
          min={-1}
          max={3}
          step={0.1}
          onChange={(v) => setC([c[0], Math.round(v * 10) / 10])}
          display={pt(c[1], 1)}
          aria="Coeficiente β₂ dos mínimos quadrados"
        />
      </div>
      <div className="m8-panels">
        <Panel kind="l1" c={c} t={t} />
        <Panel kind="l2" c={c} t={t} />
      </div>
      <div className="widget-detail">
        <p className="widget-detail-title">
          {l1Free
            ? "A região contém a solução dos mínimos quadrados: as duas penalizações não mudam nada."
            : l1Zero
              ? "As elipses tocam o losango num canto, em cima de um eixo: o Lasso põe um coeficiente exatamente a zero."
              : "Aqui as elipses tocam o losango num lado, não num canto: o Lasso encolhe os dois coeficientes sem zerar nenhum."}
        </p>
        <p>
          Um t menor corresponde a um α maior. O círculo do Ridge não tem cantos, por isso o ponto de contacto quase nunca cai num eixo. Com o centro da
          figura, o Lasso fica no canto (β₂ = 0) para qualquer t até cerca de 1,66; só com uma região maior é que β₂ entra no modelo.
        </p>
      </div>
    </div>
  );
}
