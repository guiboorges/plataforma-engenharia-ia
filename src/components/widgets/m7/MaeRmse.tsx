import React, { useState } from "react";
import { mae, rmseErr } from "./metrics";
import { num, pct } from "./Plot";

// MAE contra RMSE (secção 5): cinco erros (real − previsto) e o peso de cada um nas duas médias. O exemplo da aula,
// [1, 1, 1, 1, 10], dá MAE 2,8 e RMSE 4,56: o erro de 10 pesa 10 vezes mais no MAE e 100 vezes mais no RMSE.

const PRESETS = [
  { label: "Exemplo da aula", vals: ["1", "1", "1", "1", "10"] },
  { label: "Sem o erro grande", vals: ["1", "1", "1", "1", "1"] },
  { label: "Erros iguais", vals: ["2,8", "2,8", "2,8", "2,8", "2,8"] },
  { label: "Um erro de 30", vals: ["1", "1", "1", "1", "30"] },
  { label: "Com sinais", vals: ["−2", "1", "−1", "3", "−10"] },
];

function parseNum(s: string): number | null {
  const t = s.trim().replace(/\s/g, "").replace("−", "-").replace(",", ".");
  if (!/^-?\d+(\.\d+)?$/.test(t)) return null;
  return Number(t);
}

export function MaeRmse() {
  const [vals, setVals] = useState<string[]>(PRESETS[0].vals);
  const parsed = vals.map(parseNum);
  const ok = parsed.every((v) => v !== null);
  const err = parsed.map((v) => v ?? 0);
  const active = PRESETS.find((p) => p.vals.every((v, i) => v === vals[i]));
  const sumAbs = err.reduce((s, e) => s + Math.abs(e), 0);
  const sumSq = err.reduce((s, e) => s + e * e, 0);
  const set = (i: number) => (e: React.ChangeEvent<HTMLInputElement>) => setVals(vals.map((v, j) => (j === i ? e.target.value : v)));
  const maeV = mae(err);
  const rmseV = rmseErr(err);
  const big = err.reduce((bi, e, i) => (Math.abs(e) > Math.abs(err[bi]) ? i : bi), 0);

  return (
    <div className="m7-mr">
      <div className="m7-pills" role="group" aria-label="Exemplos">
        {PRESETS.map((p) => (
          <button key={p.label} type="button" className={`pill ${active === p ? "is-on" : ""}`} aria-pressed={active === p} onClick={() => setVals(p.vals)}>
            {p.label}
          </button>
        ))}
      </div>

      <div className="m7-errs" role="group" aria-label="Cinco erros, real menos previsto">
        {vals.map((v, i) => (
          <label key={i} className="m7-field">
            <span className="small muted">Erro {i + 1}</span>
            <input className="input input-sm mono" inputMode="decimal" value={v} onChange={set(i)} aria-invalid={parsed[i] === null} spellCheck={false} />
          </label>
        ))}
      </div>

      {!ok ? (
        <p className="widget-detail small">Escreva cada erro como um número, por exemplo 1, −2 ou 2,8.</p>
      ) : (
        <>
          <div className="m7-compare" aria-live="polite">
            <div>
              <span className="small muted">MAE = média de |y − ŷ|</span>
              <span className="m7-big">{num(maeV, 2)}</span>
            </div>
            <div>
              <span className="small muted">RMSE = √(média de (y − ŷ)²)</span>
              <span className="m7-big">{num(rmseV, 2)}</span>
            </div>
          </div>

          {sumSq > 0 && (
            <div className="m7-shares">
              <p className="small">Peso de cada erro na soma:</p>
              {[
                { name: "MAE: |erro|", parts: err.map((e) => Math.abs(e) / sumAbs) },
                { name: "RMSE: erro²", parts: err.map((e) => (e * e) / sumSq) },
              ].map((row) => (
                <div key={row.name} className="m7-share-row">
                  <span className="small muted m7-share-name">{row.name}</span>
                  <div
                    className="m7-share"
                    role="img"
                    aria-label={`${row.name}: ${row.parts.map((p, i) => `erro ${i + 1} ${pct(p)}`).join(", ")}`}
                  >
                    {row.parts.map((p, i) => (
                      <span key={i} className={`m7-share-seg ${i === big ? "is-big" : ""}`} style={{ width: `${p * 100}%` }} title={`Erro ${i + 1}: ${pct(p)}`} />
                    ))}
                  </div>
                </div>
              ))}
              <p className="small muted">
                O erro {big + 1} ({num(err[big], 2)}) é {pct(Math.abs(err[big]) / sumAbs)} da soma dos erros absolutos e {pct((err[big] * err[big]) / sumSq)} da soma dos
                quadrados. {rmseV > maeV + 1e-9 ? `Por isso o RMSE fica ${num(rmseV / maeV, 2)} vezes maior do que o MAE.` : "Com erros todos do mesmo tamanho, o RMSE é igual ao MAE."}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
