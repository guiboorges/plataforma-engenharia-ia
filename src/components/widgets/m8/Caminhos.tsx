import React, { useMemo, useState } from "react";
import { Chip, Seg } from "../../ui";
import { HITTERS, lasso, lassoPath, logspace, ridge, ridgePath, trainFit } from "./regularizacao";
import { Plot, Slider, pathOf, pt } from "./Plot";

// Caminhos do Ridge e do Lasso nos dados Hitters (secção 3, figura 02): o α escolhe-se num controlo em escala log e
// os 19 coeficientes (variáveis padronizadas) aparecem no caminho e numa lista. Os coeficientes (regularizacao.ts) são
// os de Ridge(alpha) e Lasso(alpha) do scikit-learn, testados com `node` contra o scikit-learn 1.9.

type Method = "ridge" | "lasso";

const RANGE: Record<Method, [number, number]> = { ridge: [-2, 5], lasso: [-1, 2.6] };

const PRESETS: Record<Method, { label: string; alpha: number }[]> = {
  ridge: [
    { label: "α = 0,01: quase mínimos quadrados", alpha: 0.01 },
    { label: "α = 3,49: o do RidgeCV", alpha: 3.4863652276780877 },
    { label: "α = 1000", alpha: 1000 },
  ],
  lasso: [
    { label: "α = 0,1: quase mínimos quadrados", alpha: 0.1 },
    { label: "α = 2,65: o do LassoCV", alpha: 2.65 },
    { label: "α = 60,21: regra de um erro padrão", alpha: 60.21 },
  ],
};

const DESC: Record<string, string> = {
  AtBat: "vezes ao bastão em 1986",
  Hits: "tacadas certeiras em 1986",
  HmRun: "home runs em 1986",
  Runs: "corridas em 1986",
  RBI: "corridas impulsionadas em 1986",
  Walks: "bases por bolas em 1986",
  Years: "anos na liga principal",
  CAtBat: "vezes ao bastão na carreira",
  CHits: "tacadas certeiras na carreira",
  CHmRun: "home runs na carreira",
  CRuns: "corridas na carreira",
  CRBI: "corridas impulsionadas na carreira",
  CWalks: "bases por bolas na carreira",
  PutOuts: "eliminações defensivas em 1986",
  Assists: "assistências em 1986",
  Errors: "erros em 1986",
  League_N: "liga N em 1986 (referência: A)",
  Division_W: "divisão W em 1986 (referência: E)",
  NewLeague_N: "liga N em 1987 (referência: A)",
};

const SCALE = 500; // maior |coeficiente| dos mínimos quadrados: 480,75 (CRuns)
const fmtAlpha = (a: number) => (a >= 100 ? pt(a, 0) : a >= 10 ? pt(a, 1) : pt(a, 2));

export function Caminhos() {
  const [method, setMethod] = useState<Method>("lasso");
  const [logA, setLogA] = useState<Record<Method, number>>({ ridge: Math.log10(3.4863652276780877), lasso: Math.log10(2.65) });
  const [sel, setSel] = useState("CRuns");

  const paths = useMemo(() => {
    const ra = logspace(RANGE.ridge[0], RANGE.ridge[1], 120);
    const la = logspace(RANGE.lasso[0], RANGE.lasso[1], 120);
    return { ridge: { alphas: ra, coefs: ridgePath(ra) }, lasso: { alphas: la, coefs: lassoPath(la) } };
  }, []);
  const ols = useMemo(() => trainFit(ridge(0)), []);

  const alpha = 10 ** logA[method];
  const beta = useMemo(() => {
    if (method === "ridge") return ridge(alpha);
    const { alphas, coefs } = paths.lasso;
    let k = 0;
    for (let i = 1; i < alphas.length; i++) if (Math.abs(Math.log(alphas[i] / alpha)) < Math.abs(Math.log(alphas[k] / alpha))) k = i;
    return lasso(alpha, coefs[k]);
  }, [method, alpha, paths]);
  const fitNow = trainFit(beta);
  const nonZero = beta.filter((b) => b !== 0).length;
  const zeros = HITTERS.names.filter((_, j) => beta[j] === 0);
  const selIdx = HITTERS.names.indexOf(sel);
  const path = paths[method];

  const setAlpha = (a: number) => setLogA({ ...logA, [method]: Math.log10(a) });
  const xTicks = method === "ridge" ? [0.01, 0.1, 1, 10, 100, 1000, 10000, 100000] : [0.1, 1, 10, 100];
  const fmtTick = (v: number) => (v >= 1000 ? `10^${Math.round(Math.log10(v))}` : v < 1 ? pt(v, v < 0.1 ? 2 : 1) : String(v));

  return (
    <div className="m8-wid">
      <Seg
        label="Método"
        value={method}
        onChange={(id) => setMethod(id as Method)}
        options={[
          { id: "lasso", label: "Lasso (L1)" },
          { id: "ridge", label: "Ridge (L2)" },
        ]}
      />
      <Slider
        label="Força da penalização α (escala log)"
        value={logA[method]}
        min={RANGE[method][0]}
        max={RANGE[method][1]}
        step={0.01}
        onChange={(v) => setLogA({ ...logA, [method]: v })}
        display={`α = ${fmtAlpha(alpha)}`}
        aria="Força da penalização α, em escala logarítmica"
      />
      <div className="m8-pills" role="group" aria-label="Valores de α de exemplo">
        {PRESETS[method].map((p) => {
          const on = Math.abs(Math.log10(p.alpha) - logA[method]) < 0.004;
          return (
            <button key={p.label} type="button" className={`pill ${on ? "is-on" : ""}`} aria-pressed={on} onClick={() => setAlpha(p.alpha)}>
              {p.label}
            </button>
          );
        })}
      </div>

      <div className="m8-verdict">
        <Chip tone={method === "lasso" && nonZero < 19 ? "info" : "neutral"}>
          {nonZero} de 19 variáveis no modelo
        </Chip>
        <span className="small muted">
          R² de treino {pt(fitNow.r2, 3)} (mínimos quadrados: {pt(ols.r2, 3)})
        </span>
      </div>

      <div className="m8-grid">
        <div className="m8-col">
          <Plot
            label={`Caminhos dos 19 coeficientes do ${method === "ridge" ? "Ridge" : "Lasso"} em função de α, com ${sel} destacado e α = ${fmtAlpha(alpha)} marcado`}
            x={[path.alphas[0], path.alphas[path.alphas.length - 1]]}
            y={[-420, 500]}
            logX
            xTicks={xTicks}
            yTicks={[-400, -200, 0, 200, 400]}
            fmtX={fmtTick}
            fmtY={(v) => pt(v, 0)}
            xLabel="α (escala log)"
            yLabel="coeficiente (mil $)"
            h={240}
            left={44}
          >
            {(sx, sy) => (
              <>
                {HITTERS.names.map((name, j) =>
                  j === selIdx ? null : <path key={name} className="m8-path" d={pathOf(path.alphas.map((a, i) => [sx(a), sy(path.coefs[i][j])]))} />,
                )}
                <path className="m8-path is-on" d={pathOf(path.alphas.map((a, i) => [sx(a), sy(path.coefs[i][selIdx])]))} />
                <line className="m8-vline" x1={sx(alpha)} x2={sx(alpha)} y1={sy(-420)} y2={sy(500)} />
                <circle className="m8-mark" cx={sx(alpha)} cy={sy(beta[selIdx])} r={4} />
              </>
            )}
          </Plot>
          <p className="small muted">
            {method === "ridge"
              ? "No Ridge, os coeficientes encolhem todos juntos para zero, sem nunca lá chegar."
              : "No Lasso, os coeficientes vão chegando a zero um a um: o Lasso faz seleção de variáveis."}{" "}
            Toque numa variável da lista para destacar o seu caminho.
          </p>
        </div>

        <div className="m8-col">
          <ul className="m8-coefs" aria-label={`Coeficientes com α = ${fmtAlpha(alpha)}`}>
            {HITTERS.names.map((name, j) => {
              const b = beta[j];
              const w = Math.min(50, (Math.abs(b) / SCALE) * 50);
              const zero = b === 0;
              return (
                <li key={name}>
                  <button
                    type="button"
                    className={`m8-coef ${j === selIdx ? "is-on" : ""} ${zero ? "is-zero" : ""}`}
                    aria-pressed={j === selIdx}
                    aria-label={`${name}, ${DESC[name]}: ${zero ? "zero, fora do modelo" : pt(b, 1)}`}
                    title={DESC[name]}
                    onClick={() => setSel(name)}
                  >
                    <span className="m8-coef-name mono">{name}</span>
                    <span className="m8-coef-track" aria-hidden="true">
                      <span className="m8-coef-bar" style={b >= 0 ? { left: "50%", width: `${w}%` } : { left: `${50 - w}%`, width: `${w}%` }} />
                    </span>
                    <span className="m8-coef-val mono">{zero ? "0" : pt(b, 1)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="widget-detail">
        <p className="widget-detail-title">
          {sel}: {DESC[sel]}. Coeficiente {beta[selIdx] === 0 ? "exatamente zero" : pt(beta[selIdx], 1)}, em milhares de dólares por desvio padrão.
        </p>
        <p>
          {method === "lasso"
            ? zeros.length === 0
              ? "Com este α, o Lasso ainda não pôs nenhum coeficiente a zero."
              : zeros.length === 19
                ? "Com este α, todos os coeficientes são zero: o modelo prevê sempre o salário médio, 535,9 mil dólares."
                : `Fora do modelo: ${zeros.join(", ")}.`
            : "Nenhum coeficiente do Ridge é exatamente zero, mesmo com α muito grande: ficam só muito pequenos."}{" "}
          O R² de treino só desce quando α sobe: por isso o erro de treino não serve para escolher α, que se escolhe por validação cruzada.
        </p>
      </div>
    </div>
  );
}
