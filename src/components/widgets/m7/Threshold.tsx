import React, { useMemo, useState } from "react";
import { testScores } from "./data";
import { auc, averagePrecision, cost, countsAt, metrics, rocPoints } from "./metrics";
import { Plot, num, pct, pts } from "./Plot";

// Limiar de decisão, matriz de confusão e curva ROC (secção 4), com as 2000 probabilidades que o modelo logístico da
// aula dá ao conjunto de teste do Default. Os números batem com os da aula: limiar 0,5 → 1924 9 45 22;
// 0,2 → 1867 66 25 42; custo 45 450 € e 20 600 € (0,5 e 0,05); AUC 0,947; precisão média 0,507.

const PRESETS = [
  { k: 50, label: "0,5 (o predict)" },
  { k: 20, label: "0,2" },
  { k: 5, label: "0,05 (escolhido pelo custo na validação)" },
];

/** "1 000" ou "1000,5" → número ≥ 0; null se não for válido. */
function parseEuros(s: string): number | null {
  const t = s.replace(/\s/g, "").replace(",", ".");
  if (!/^\d+(\.\d+)?$/.test(t)) return null;
  return Number(t);
}

const euros = (v: number) => `${num(v, 0)} €`;

export function Threshold() {
  const { pos, neg } = testScores();
  const [k, setK] = useState(50);
  const [cfn, setCfn] = useState("1000");
  const [cfp, setCfp] = useState("50");

  const roc = useMemo(() => rocPoints(pos, neg), [pos, neg]);
  const aucV = useMemo(() => auc(pos, neg), [pos, neg]);
  const apV = useMemo(() => averagePrecision(pos, neg), [pos, neg]);
  const curves = useMemo(() => {
    const prec: [number, number][] = [];
    const rec: [number, number][] = [];
    for (let i = 1; i <= 99; i++) {
      const m = metrics(countsAt(pos, neg, i * 10000));
      if (m.prec !== null) prec.push([i / 100, m.prec]);
      rec.push([i / 100, m.rec ?? 0]);
    }
    return { prec, rec };
  }, [pos, neg]);

  const c = countsAt(pos, neg, k * 10000);
  const m = metrics(c);
  const total = pos.length + neg.length;
  const fnCost = parseEuros(cfn);
  const fpCost = parseEuros(cfp);
  const costsOk = fnCost !== null && fpCost !== null && fnCost + fpCost > 0;
  const t = k / 100;

  return (
    <div className="m7-th">
      <label className="m7-slider">
        <span className="small muted">
          Limiar de decisão: prever "falha" se p ≥ <strong className="m7-strong mono">{num(t, 2)}</strong>
        </span>
        <input type="range" className="m7-range" min={1} max={99} step={1} value={k} onChange={(e) => setK(Number(e.target.value))} aria-label="Limiar de decisão" />
      </label>
      <div className="m7-pills" role="group" aria-label="Limiares da aula">
        {PRESETS.map((p) => (
          <button key={p.k} type="button" className={`pill ${p.k === k ? "is-on" : ""}`} aria-pressed={p.k === k} onClick={() => setK(p.k)}>
            {p.label}
          </button>
        ))}
      </div>

      <div className="m7-two">
        <div className="m7-col">
          <div className="table-wrap">
            <table className="m7-cm" aria-label={`Matriz de confusão com o limiar ${num(t, 2)}`}>
              <thead>
                <tr>
                  <th scope="col">
                    <span className="sr-only">Real</span>
                  </th>
                  <th scope="col">Previsto: não falha</th>
                  <th scope="col">Previsto: falha</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Real: não falha</th>
                  <td className="m7-cell">
                    <span className="m7-cell-n">{c.vn}</span>
                    <span className="small muted">VN</span>
                  </td>
                  <td className="m7-cell is-bad">
                    <span className="m7-cell-n">{c.fp}</span>
                    <span className="small muted">FP</span>
                  </td>
                </tr>
                <tr>
                  <th scope="row">Real: falha</th>
                  <td className="m7-cell is-bad">
                    <span className="m7-cell-n">{c.fn}</span>
                    <span className="small muted">FN</span>
                  </td>
                  <td className="m7-cell is-ok">
                    <span className="m7-cell-n">{c.vp}</span>
                    <span className="small muted">VP</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <dl className="m7-stats" aria-live="polite">
            <div>
              <dt>Exatidão</dt>
              <dd className="mono">{num(m.acc, 3)}</dd>
            </div>
            <div>
              <dt>Precisão</dt>
              <dd className="mono">{m.prec === null ? "—" : num(m.prec, 3)}</dd>
            </div>
            <div>
              <dt>Revocação</dt>
              <dd className="mono">{m.rec === null ? "—" : num(m.rec, 3)}</dd>
            </div>
            <div>
              <dt>F1</dt>
              <dd className="mono">{m.f1 === null ? "—" : num(m.f1, 3)}</dd>
            </div>
            <div>
              <dt>Taxa de FP</dt>
              <dd className="mono">{m.fpr === null ? "—" : num(m.fpr, 3)}</dd>
            </div>
            <div>
              <dt>Marcados</dt>
              <dd className="mono">{c.vp + c.fp}</dd>
            </div>
          </dl>
          <p className="small muted">
            Apanha {c.vp} dos {pos.length} incumpridores ({pct(m.rec ?? 0)}), com {c.fp} {c.fp === 1 ? "falso alarme" : "falsos alarmes"}. A linha de base "ninguém falha"
            acerta {neg.length} em {total} ({num(neg.length / total, 3)}) e não apanha nenhum.
          </p>
        </div>

        <div className="m7-col">
          <figure className="m7-fig">
            <Plot
              label={`Curva ROC no conjunto de teste, AUC ${num(aucV, 3)}. Com o limiar ${num(t, 2)}: taxa de falsos positivos ${num(m.fpr ?? 0, 3)} e revocação ${num(m.rec ?? 0, 3)}`}
              x={[0, 1]}
              y={[0, 1]}
              w={300}
              h={260}
              xTicks={[0, 0.2, 0.4, 0.6, 0.8, 1].map((v) => ({ at: v, label: num(v, 1) }))}
              yTicks={[0, 0.2, 0.4, 0.6, 0.8, 1].map((v) => ({ at: v, label: num(v, 1) }))}
              xLabel="taxa de falsos positivos"
              yLabel="revocação"
            >
              {(sx, sy) => (
                <>
                  <line className="m7-diag" x1={sx(0)} y1={sy(0)} x2={sx(1)} y2={sy(1)} />
                  <polyline className="m7-line is-main" points={pts(roc, sx, sy)} />
                  <circle className="m7-point" cx={sx(m.fpr ?? 0)} cy={sy(m.rec ?? 0)} r={5} />
                </>
              )}
            </Plot>
            <figcaption className="small muted">
              AUC = <span className="mono">{num(aucV, 3)}</span> (0,5 é o acaso). O ponto é o limiar {num(t, 2)}.
            </figcaption>
          </figure>
          <figure className="m7-fig">
            <Plot
              label={`Precisão e revocação em função do limiar; o limiar atual é ${num(t, 2)}`}
              x={[0, 1]}
              y={[0, 1]}
              w={300}
              h={200}
              xTicks={[0, 0.2, 0.4, 0.6, 0.8, 1].map((v) => ({ at: v, label: num(v, 1) }))}
              yTicks={[0, 0.5, 1].map((v) => ({ at: v, label: num(v, 1) }))}
              xLabel="limiar"
            >
              {(sx, sy) => (
                <>
                  <line className="m7-vline" x1={sx(t)} x2={sx(t)} y1={sy(0)} y2={sy(1)} />
                  <polyline className="m7-line is-main" points={pts(curves.prec, sx, sy)} />
                  <polyline className="m7-line is-s2" points={pts(curves.rec, sx, sy)} />
                </>
              )}
            </Plot>
            <figcaption className="small muted">
              <span className="m7-key m7-key-main" aria-hidden="true" /> precisão · <span className="m7-key m7-key-s2" aria-hidden="true" /> revocação. Baixar o limiar troca precisão por
              revocação. Precisão média: <span className="mono">{num(apV, 3)}</span>, para uma linha de base de {num(pos.length / total, 3)}.
            </figcaption>
          </figure>
        </div>
      </div>

      <div className="widget-detail">
        <p className="widget-detail-title">Custo dos erros</p>
        <div className="m7-fields">
          <label className="m7-field">
            <span className="small">Incumpridor não detetado (FN)</span>
            <span className="m7-input-unit">
              <input className="input input-sm mono" inputMode="decimal" value={cfn} onChange={(e) => setCfn(e.target.value)} aria-invalid={fnCost === null} spellCheck={false} />
              <span className="muted small">€</span>
            </span>
          </label>
          <label className="m7-field">
            <span className="small">Telefonema escusado (FP)</span>
            <span className="m7-input-unit">
              <input className="input input-sm mono" inputMode="decimal" value={cfp} onChange={(e) => setCfp(e.target.value)} aria-invalid={fpCost === null} spellCheck={false} />
              <span className="muted small">€</span>
            </span>
          </label>
        </div>
        {costsOk ? (
          <div aria-live="polite" className="m7-col">
            <p className="small">
              Com o limiar {num(t, 2)}: {c.fn} × {euros(fnCost!)} + {c.fp} × {euros(fpCost!)} = <strong className="m7-strong">{euros(cost(c, fnCost!, fpCost!))}</strong> no teste.
            </p>
          </div>
        ) : (
          <p className="small muted">Escreva os dois custos em euros (números positivos).</p>
        )}
        <p className="small muted">
          Estas são as probabilidades do conjunto de teste da aula: servem para ver o efeito de cada limiar no custo. Num projeto, o limiar escolhe-se na validação, nunca no
          teste (na aula, com 1000 € e 50 €, deu 0,05; a fórmula da secção 4 dá ≈ 0,048).
        </p>
      </div>
    </div>
  );
}
