import React, { useState } from "react";
import { bayesTree, LESSON } from "./bayes";
import { fmt, fmtCount, pct, pctTrim } from "./stats";

// Calculadora de Bayes com frequências naturais (secção 2): três percentagens → a árvore de 10 000 transações,
// como na figura da aula, e P(fraude | alerta). O exemplo da aula dá 95 / 590 ≈ 16,1%.

type Preset = { label: string; prior: string; sens: string; fpr: string };
const PRESETS: Preset[] = [
  { label: "Exemplo da aula", prior: "1", sens: "95", fpr: "5" },
  { label: "Fraude mais rara (0,1%)", prior: "0,1", sens: "95", fpr: "5" },
  { label: "Menos alarmes falsos (1%)", prior: "1", sens: "95", fpr: "1" },
  { label: "Fraude frequente (20%)", prior: "20", sens: "95", fpr: "5" },
];

/** "0,5" ou "0.5" → 0,005; null se não for uma percentagem entre 0 e 100. */
function parsePct(s: string): number | null {
  const t = s.trim().replace(",", ".").replace("%", "");
  if (!/^\d+(\.\d+)?$|^\.\d+$/.test(t)) return null;
  const v = Number(t);
  return v >= 0 && v <= 100 ? v / 100 : null;
}

export function BayesTree() {
  const [vals, setVals] = useState({ prior: PRESETS[0].prior, sens: PRESETS[0].sens, fpr: PRESETS[0].fpr });
  const prior = parsePct(vals.prior);
  const sens = parsePct(vals.sens);
  const fpr = parsePct(vals.fpr);
  const ok = prior !== null && sens !== null && fpr !== null;
  const t = ok ? bayesTree({ prior, sens, fpr, total: LESSON.total }) : null;
  const set = (k: keyof typeof vals) => (e: React.ChangeEvent<HTMLInputElement>) => setVals({ ...vals, [k]: e.target.value });
  const active = PRESETS.find((p) => p.prior === vals.prior && p.sens === vals.sens && p.fpr === vals.fpr);

  const fields: { k: keyof typeof vals; label: string; hint: string }[] = [
    { k: "prior", label: "Transações que são fraude", hint: "P(fraude), o a priori" },
    { k: "sens", label: "Fraudes que o detetor apanha", hint: "P(alerta | fraude)" },
    { k: "fpr", label: "Legítimas com alarme falso", hint: "P(alerta | legítima)" },
  ];

  return (
    <div className="m6-by">
      <div className="m6-presets" role="group" aria-label="Exemplos">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            className={`pill ${active === p ? "is-on" : ""}`}
            aria-pressed={active === p}
            onClick={() => setVals({ prior: p.prior, sens: p.sens, fpr: p.fpr })}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="m6-fields">
        {fields.map((f) => {
          const bad = parsePct(vals[f.k]) === null;
          return (
            <label key={f.k} className="m6-field">
              <span className="small">{f.label}</span>
              <span className="m6-input-pct">
                <input className="input input-sm mono" inputMode="decimal" value={vals[f.k]} onChange={set(f.k)} aria-invalid={bad} spellCheck={false} />
                <span className="muted small">%</span>
              </span>
              <span className="small muted mono">{f.hint}</span>
            </label>
          );
        })}
      </div>

      {!t ? (
        <p className="widget-detail small">Escreva cada valor como uma percentagem entre 0 e 100, por exemplo 1 ou 0,5.</p>
      ) : (
        <>
          <div className="m6-tree" role="group" aria-label={`Árvore de frequências naturais para ${fmt(LESSON.total)} transações`}>
            <div className="m6-node m6-root">
              <strong>{fmt(LESSON.total)} transações</strong>
            </div>
            <div className="m6-edge m6-e1">{pctTrim(prior!)} são fraude</div>
            <div className="m6-edge m6-e2">{pctTrim(1 - prior!)} legítimas</div>
            <div className="m6-node m6-l1a">{fmtCount(t.fraud)} fraudes</div>
            <div className="m6-node m6-l1b">{fmtCount(t.legit)} legítimas</div>
            <div className="m6-edge m6-e3">{pctTrim(sens!)} apanhadas</div>
            <div className="m6-edge m6-e4">{pctTrim(1 - sens!)} escapam</div>
            <div className="m6-edge m6-e5">{pctTrim(fpr!)} alarme falso</div>
            <div className="m6-edge m6-e6">{pctTrim(1 - fpr!)} sem alarme</div>
            <div className="m6-node m6-l2a is-hit">
              <strong>{fmtCount(t.tp)}</strong> com alerta
            </div>
            <div className="m6-node m6-l2b">{fmtCount(t.fn)} sem alerta</div>
            <div className="m6-node m6-l2c is-hit">
              <strong>{fmtCount(t.fp)}</strong> com alerta
            </div>
            <div className="m6-node m6-l2d">{fmtCount(t.tn)} sem alerta</div>
          </div>

          <div className="widget-detail">
            {t.alerts > 0 ? (
              <>
                <p className="widget-detail-title">
                  Com alerta: {fmtCount(t.tp)} + {fmtCount(t.fp)} = {fmtCount(t.alerts)} transações. Destas, só {fmtCount(t.tp)} são fraude.
                </p>
                <div className="m6-split" role="img" aria-label={`Dos alertas, ${pct(t.posterior)} são fraude e ${pct(1 - t.posterior)} são alarmes falsos`}>
                  <span className="m6-split-a" style={{ width: `${t.posterior * 100}%` }} />
                  <span className="m6-split-b" style={{ width: `${(1 - t.posterior) * 100}%` }} />
                </div>
                <p className="small muted">
                  <span className="m6-key m6-split-a" aria-hidden="true" /> fraude · <span className="m6-key m6-split-b" aria-hidden="true" /> alarme falso
                </p>
                <div className="m6-compare">
                  <div>
                    <span className="small muted mono">P(alerta | fraude)</span>
                    <span className="m6-big">{pctTrim(sens!, 1)}</span>
                    <span className="small muted">das fraudes, quantas dão alerta</span>
                  </div>
                  <div>
                    <span className="small muted mono">P(fraude | alerta)</span>
                    <span className="m6-big">{pct(t.posterior)}</span>
                    <span className="small muted">
                      dos alertas, quantos são fraude: {fmtCount(t.tp)} / {fmtCount(t.alerts)}
                    </span>
                  </div>
                </div>
                <p className="small muted">
                  Pela fórmula: P(alerta) = {pctTrim(sens!)} × {pctTrim(prior!)} + {pctTrim(fpr!)} × {pctTrim(1 - prior!)} = {pctTrim(t.pAlert, 3)}, e P(fraude
                  | alerta) = {pctTrim(sens!)} × {pctTrim(prior!)} / {pctTrim(t.pAlert, 3)} = {pct(t.posterior)}.
                </p>
              </>
            ) : (
              <p className="widget-detail-title">Com estes valores o detetor nunca dá alerta: P(fraude | alerta) não está definida.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
