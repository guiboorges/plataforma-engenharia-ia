import React, { useState } from "react";
import { SHAP_COLS, SHAP_ROWS } from "./shap-data";
import { shapSum, waterfall } from "./shap";
import { fmt, fmtSigned } from "./fmt";

// Cascata SHAP de uma previsão do Bikeshare (secção 5), com os valores reais do TreeExplainer: começa no valor de
// base E[f(X)] (a previsão média, 144,5 bicicletas) e cada variável empurra para cima ou para baixo até à previsão.

const GLOSSARY: [string, string][] = [
  ["hr", "hora do dia (0 a 23)"],
  ["day", "dia do ano de 2011 (1 a 365)"],
  ["temp, atemp", "temperatura e temperatura sentida, normalizadas (0 a 1)"],
  ["hum, windspeed", "humidade e vento, normalizados"],
  ["season", "estação: 1 inverno, 2 primavera, 3 verão, 4 outono"],
  ["workingday, holiday, weekday", "dia útil (1 = sim), feriado, dia da semana (0 = domingo)"],
  ["mnth_…, weathersit_…", "mês e tempo em colunas 0/1 (o one-hot da aula)"],
];

export function ShapWaterfall() {
  const [ri, setRi] = useState(0);
  const [maxDisplay, setMaxDisplay] = useState(8);
  const row = SHAP_ROWS[ri];
  const steps = waterfall(row, maxDisplay);
  const total = shapSum(row) - row.base;

  // escala comum a todas as barras, com uma folga de 4% de cada lado
  const ends = steps.flatMap((s) => [s.from, s.to]);
  let lo = Math.min(...ends);
  let hi = Math.max(...ends);
  const pad = (hi - lo) * 0.04 || 1;
  lo -= pad;
  hi += pad;
  const sx = (v: number) => ((v - lo) / (hi - lo)) * 100;
  const step = [10, 20, 25, 50, 100].find((s) => (hi - lo) / s <= 6) ?? 100;
  const ticks: number[] = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) ticks.push(v);

  return (
    <div className="m11-sh">
      <div className="m11-pills" role="group" aria-label="Hora do conjunto de teste">
        {SHAP_ROWS.map((r, i) => (
          <button key={r.label} type="button" className={`pill ${ri === i ? "is-on" : ""}`} aria-pressed={ri === i} onClick={() => setRi(i)}>
            {r.label}
          </button>
        ))}
      </div>

      <label className="m11-ctl">
        <span className="small muted">
          Variáveis mostradas (<span className="mono">max_display={maxDisplay}</span>; as outras juntam-se numa linha)
        </span>
        <input type="range" min={3} max={SHAP_COLS.length} step={1} value={maxDisplay} onChange={(e) => setMaxDisplay(Number(e.target.value))} aria-label="Variáveis mostradas" />
      </label>

      <div className="m11-wf" role="table" aria-label={`Contribuições SHAP: de ${fmt(row.base, 1)} bicicletas (base) a ${fmt(row.pred, 1)} (previsão)`}>
        <div className="m11-wf-row m11-wf-end" role="row">
          <span className="m11-wf-name small mono" role="rowheader">
            f(x) = {fmt(row.pred, 3)}
          </span>
          <div className="m11-wf-track" role="cell">
            <span className="m11-wf-mark" style={{ left: `${sx(row.pred)}%` }} aria-hidden="true" />
          </div>
        </div>
        {steps.map((s) => {
          const a = sx(Math.min(s.from, s.to));
          const b = sx(Math.max(s.from, s.to));
          const up = s.phi >= 0;
          // etiqueta à direita da barra; se não couber, à esquerda; se a barra ocupar quase tudo, por dentro
          const place = b < 80 ? "right" : a > 20 ? "left" : "inside";
          return (
            <div key={s.name} className="m11-wf-row" role="row">
              <span className="m11-wf-name small" role="rowheader">
                {s.value !== null && <span className="muted mono">{s.value} = </span>}
                <span className="mono">{s.name}</span>
              </span>
              <div className="m11-wf-track" role="cell" aria-label={`${s.name}: ${fmtSigned(s.phi, 2)}`}>
                <span className="m11-wf-guide" style={{ left: `${sx(s.to)}%` }} aria-hidden="true" />
                <span className={`m11-wf-bar ${up ? "is-up" : "is-down"}`} style={{ left: `${a}%`, width: `${Math.max(b - a, 0.4)}%` }} aria-hidden="true" />
                <span
                  className={`m11-wf-val small mono ${place === "inside" ? `is-inside ${up ? "is-up" : "is-down"}` : ""}`}
                  style={place === "right" ? { left: `calc(${b}% + 4px)` } : place === "left" ? { right: `calc(${100 - a}% + 4px)` } : { left: `calc(${a}% + 6px)` }}
                  aria-hidden="true"
                >
                  {fmtSigned(s.phi, 2)}
                </span>
              </div>
            </div>
          );
        })}
        <div className="m11-wf-row m11-wf-end" role="row">
          <span className="m11-wf-name small mono" role="rowheader">
            E[f(X)] = {fmt(row.base, 3)}
          </span>
          <div className="m11-wf-track m11-wf-axis" role="cell">
            <span className="m11-wf-mark" style={{ left: `${sx(row.base)}%` }} aria-hidden="true" />
            {ticks.map((v) => (
              <span key={v} className="m11-wf-tick small muted mono" style={{ left: `${sx(v)}%` }} aria-hidden="true">
                {fmt(v)}
              </span>
            ))}
          </div>
        </div>
      </div>
      <p className="small muted m11-legend">
        <span className="m11-key is-up" aria-hidden="true" /> empurra a previsão para cima · <span className="m11-key is-down" aria-hidden="true" /> para baixo ·
        cada barra começa onde a de baixo acabou. Bicicletas por hora.
      </p>

      <div className="widget-detail">
        <span>
          Valor de base <strong className="mono">{fmt(row.base, 1)}</strong> + soma das {SHAP_COLS.length} contribuições{" "}
          <strong className="mono">{fmtSigned(total, 1)}</strong> = previsão <strong className="mono">{fmt(row.base + total, 1)}</strong> bicicletas. Na
          realidade foram <strong className="mono">{row.real}</strong>.
        </span>
        <span className="muted">
          Mudar o número de variáveis mostradas só muda o que fica agrupado: as contribuições somam sempre exatamente a previsão, como confirmou o True
          da aula.
        </span>
      </div>

      <details className="m11-gloss small">
        <summary>As variáveis</summary>
        <ul>
          {GLOSSARY.map(([k, v]) => (
            <li key={k}>
              <span className="mono">{k}</span>: {v}
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
