import React, { useState } from "react";
import { broadcast, parseShape, pyShape, type Shape } from "./broadcast";

// Verificador de broadcasting (secção 1): duas formas → a forma do resultado, ou o erro exato do NumPy,
// comparando as dimensões da direita para a esquerda, um passo de cada vez.

// O operador é só para mostrar: a regra de broadcasting é a mesma para +, -, *, / e as outras operações elemento a elemento.
const PRESETS: { a: string; b: string; op: string; label: string }[] = [
  { a: "(3, 3)", b: "(3,)", op: "/", label: "vendas / vendas.sum(axis=0)" },
  { a: "(3, 4)", b: "(4,)", op: "+", label: "(3, 4) + (4,)" },
  { a: "(3, 4)", b: "(3,)", op: "+", label: "(3, 4) + (3,)" },
  { a: "(3, 4)", b: "(3, 1)", op: "+", label: "(3, 4) + (3, 1)" },
  { a: "(2, 1)", b: "(1, 3)", op: "+", label: "(2, 1) + (1, 3)" },
  { a: "(32, 64, 64, 3)", b: "(3,)", op: "*", label: "lote de imagens * (3,)" },
];

const stepName = (k: number) => (k === 1 ? "última dimensão" : `${k}.ª dimensão a contar da direita`);

export function BroadcastChecker() {
  const [ta, setTa] = useState(PRESETS[0].a);
  const [tb, setTb] = useState(PRESETS[0].b);
  const [op, setOp] = useState(PRESETS[0].op);
  const [shown, setShown] = useState(0);
  const a = parseShape(ta);
  const b = parseShape(tb);
  const res = a && b ? broadcast(a, b) : null;

  const setBoth = (x: string, y: string, o?: string) => {
    setTa(x);
    setTb(y);
    if (o) setOp(o);
    setShown(0);
  };
  const total = res ? res.steps.length : 0;
  const done = shown >= total;
  const n = a && b ? Math.max(a.length, b.length) : 0;
  // posição k (1 = última dimensão) → coluna na grelha, da esquerda para a direita
  const cell = (s: Shape, k: number) => (s.length - k >= 0 ? String(s[s.length - k]) : null);
  const cur = !done && res ? res.steps[shown] : null;
  const active = done ? 0 : shown + 1;

  return (
    <div className="m3-bc">
      <div className="m3-bc-inputs">
        <label className="m3-bc-field">
          <span className="small muted">Forma de A</span>
          <input className="input input-sm mono" value={ta} spellCheck={false} onChange={(e) => setBoth(e.target.value, tb)} aria-invalid={!a} />
        </label>
        <span className="m3-bc-op mono" aria-hidden="true">
          {op}
        </span>
        <label className="m3-bc-field">
          <span className="small muted">Forma de B</span>
          <input className="input input-sm mono" value={tb} spellCheck={false} onChange={(e) => setBoth(ta, e.target.value)} aria-invalid={!b} />
        </label>
      </div>
      <div className="m3-presets" role="group" aria-label="Exemplos">
        {PRESETS.map((p) => (
          <button key={p.label} type="button" className={`pill ${p.a === ta && p.b === tb ? "is-on" : ""}`} aria-pressed={p.a === ta && p.b === tb} onClick={() => setBoth(p.a, p.b, p.op)}>
            {p.label}
          </button>
        ))}
      </div>

      {!a || !b ? (
        <p className="widget-detail small">Escreva cada forma como um tuplo do Python, por exemplo (3, 4) ou (4,). Até 6 dimensões.</p>
      ) : (
        res && (
          <>
            <div className="m3-bc-grid" style={{ gridTemplateColumns: `auto repeat(${n}, minmax(2.6rem, auto))` }} role="table" aria-label="Dimensões alinhadas à direita">
              {(["A", "B", "="] as const).map((row) => (
                <div key={row} className="m3-bc-gridrow" role="row">
                  <span className="m3-bc-rowlabel" role="rowheader">
                    {row === "=" ? "Resultado" : row}
                  </span>
                  {Array.from({ length: n }, (_, j) => {
                    const k = n - j; // posição a contar da direita
                    const step = res.steps[k - 1];
                    const revealed = k <= shown;
                    let txt: string | null;
                    if (row === "A") txt = cell(a, k);
                    else if (row === "B") txt = cell(b, k);
                    else txt = revealed && step ? (step.ok ? String(step.out) : "✗") : "";
                    const cls = [
                      "m3-bc-cell mono",
                      txt === null ? "is-missing" : "",
                      k === active ? "is-active" : "",
                      row === "=" && revealed && step && !step.ok ? "is-bad" : "",
                      row === "=" && revealed && step?.ok ? "is-out" : "",
                    ].join(" ");
                    const label = txt === null ? "falta, conta como 1" : txt === "✗" ? "incompatível" : txt === "" ? "por comparar" : undefined;
                    return (
                      <span key={j} className={cls} role="cell" aria-label={label}>
                        {txt === null ? "1" : txt}
                      </span>
                    );
                  })}
                </div>
              ))}
            </div>

            <ol className="m3-bc-steps">
              {res.steps.slice(0, shown).map((s) => (
                <li key={s.fromRight} className={s.ok ? "" : "is-bad"}>
                  <span className="m3-bc-k mono">{s.fromRight}</span>
                  <span>
                    {stepText(s.fromRight, s.a, s.b, s.why)}
                  </span>
                </li>
              ))}
            </ol>

            <div className="row gap-sm wrap">
              <button type="button" className="btn btn-primary btn-sm" disabled={done} onClick={() => setShown(shown + 1)}>
                {cur ? `Comparar a ${cur.fromRight === 1 ? "última dimensão" : `${cur.fromRight}.ª da direita`}` : "Comparação feita"}
              </button>
              <button type="button" className="btn btn-secondary btn-sm" disabled={done} onClick={() => setShown(total)}>
                Ver tudo
              </button>
              <button type="button" className="btn btn-ghost btn-sm" disabled={shown === 0} onClick={() => setShown(0)}>
                Recomeçar
              </button>
            </div>

            <p className="sr-only" aria-live="polite">
              {shown === 0 ? "" : done ? (res.ok ? `Funciona: o resultado tem forma ${pyShape(res.shape)}.` : `Não funciona: ValueError: ${res.error}`) : stepText(res.steps[shown - 1].fromRight, res.steps[shown - 1].a, res.steps[shown - 1].b, res.steps[shown - 1].why)}
            </p>

            {done && (
              <div className="widget-detail">
                {res.ok ? (
                  <>
                    <p className="widget-detail-title">
                      Funciona: o resultado tem forma <code>{pyShape(res.shape)}</code>
                    </p>
                    <Stretch a={a} b={b} out={res.shape} />
                  </>
                ) : (
                  <>
                    <p className="widget-detail-title c-bad">Não funciona</p>
                    <pre className="m3-pre m3-pre-bad">ValueError: {res.error}</pre>
                    <p className="muted small">
                      Ao comparar a {stepName(res.failAt)}, os tamanhos são diferentes e nenhum vale 1.
                      {rowHint(a, b) ? ` Para juntar um valor a cada linha, o array pequeno tem de ter forma ${rowHint(a, b)}.` : ""}
                    </p>
                  </>
                )}
              </div>
            )}
          </>
        )
      )}
    </div>
  );
}

function stepText(k: number, da: number | null, db: number | null, why: string): string {
  const name = stepName(k);
  return `${name[0].toUpperCase()}${name.slice(1)}: ${da ?? "—"} e ${db ?? "—"} → ${why}`;
}

/** (3, 4) com (3,): o (3,) tem o tamanho das linhas; com forma (3, 1) já funcionaria. Noutros casos não há dica. */
function rowHint(a: Shape, b: Shape): string | null {
  const [big, small] = a.length >= b.length ? [a, b] : [b, a];
  if (big.length !== 2 || small.length !== 1) return null;
  return small[0] === big[0] && big[0] !== big[1] ? pyShape([small[0], 1]) : null;
}

/** Para formas pequenas até 2 dimensões: cada operando desenhado na forma do resultado; as cópias ficam tracejadas. */
function Stretch({ a, b, out }: { a: Shape; b: Shape; out: Shape }) {
  if (a.length > 2 || b.length > 2 || out.some((d) => d > 6 || d === 0)) {
    return <p className="muted small">Nenhum dado é copiado: o NumPy repete os valores ao calcular.</p>;
  }
  const to2 = (s: Shape): [number, number] => (s.length === 2 ? [s[0], s[1]] : s.length === 1 ? [1, s[0]] : [1, 1]);
  const [R, C] = to2(out);
  const grid = (s: Shape, label: string) => {
    const [r, c] = to2(s);
    return (
      <div className="m3-st">
        <span className="small muted">
          {label} <span className="mono">{pyShape(s)}</span>
          {s.length < 2 && out.length === 2 ? <span className="mono"> → {pyShape([r, c])}</span> : null}
        </span>
        <div className="m3-st-grid" style={{ gridTemplateColumns: `repeat(${C}, 14px)` }} aria-hidden="true">
          {Array.from({ length: R * C }, (_, k) => {
            const i = Math.floor(k / C);
            const j = k % C;
            const real = (r === 1 ? i === 0 : true) && (c === 1 ? j === 0 : true);
            return <span key={k} className={`m3-st-c ${real ? "is-real" : "is-copy"}`} />;
          })}
        </div>
      </div>
    );
  };
  return (
    <div className="m3-st-row">
      {grid(a, "A")}
      {grid(b, "B")}
      <p className="muted small m3-st-legend">
        <span className="m3-st-c is-real" aria-hidden="true" /> valores do array · <span className="m3-st-c is-copy" aria-hidden="true" /> repetidos pelo broadcasting, sem cópia
      </p>
    </div>
  );
}
