import React, { useState } from "react";
import { Seg } from "../../ui";
import { FUNCTIONS, HS, readAt, type FnId } from "./derivada";
import { pr, pyExp, pyRepr } from "./fmt";
import { Plot, curvePath } from "./Plot";

// Derivada exata e derivada numérica (secção 2): a reta tangente, o sinal da derivada e o erro das diferenças centrais
// para cada h. As contas são as da aula (derivada.ts), testadas contra NumPy 2.5.

const TICKS: Record<FnId, { x: number[]; y: number[] }> = {
  quad: { x: [-1, 0, 1, 2, 3, 4, 5], y: [0, 2, 4, 6, 8, 10] },
  exp: { x: [-2, -1, 0, 1, 2], y: [0, 2, 4, 6, 8] },
  perda: { x: [0, 1, 2, 3, 4], y: [0, 10, 20, 30, 40] },
};

const SIGN_TEXT = (v: string) => ({
  pos: `Positiva: a função sobe quando ${v} aumenta. Para descer, mexer ${v} para a esquerda (diminuir ${v}).`,
  neg: `Negativa: a função desce quando ${v} aumenta. Para descer, mexer ${v} para a direita (aumentar ${v}).`,
  zero: "Zero: a função está plana aqui. Pode ser um mínimo, um máximo ou um patamar; não há informação para onde ir.",
});

function hNote(h: number, parabola: boolean): string {
  if (parabola && h >= 1e-5)
    return "Numa parábola, as diferenças centrais dão a derivada exata para qualquer h: o erro que sobra é só arredondamento. Experimente eˣ para ver o efeito de h.";
  if (h >= 1e-1) return "h grande: a aproximação é grosseira.";
  if (h >= 1e-3) return "h mais pequeno: o erro de aproximação desce depressa.";
  if (h >= 1e-5) return "h à volta de 10⁻⁵: um bom compromisso entre os dois erros.";
  if (h >= 1e-8) return "O erro de arredondamento já começa a pesar mais do que o de aproximação.";
  return "h minúsculo: subtraem-se dois números quase iguais e o arredondamento dos números de vírgula flutuante toma conta do resultado.";
}

export function DerivativeExplorer() {
  const [fnId, setFnId] = useState<FnId>("quad");
  const fn = FUNCTIONS.find((f) => f.id === fnId) ?? FUNCTIONS[0];
  const [pos, setPos] = useState<Record<FnId, number>>({ quad: 30, exp: 10, perda: 10 });
  const [hIdx, setHIdx] = useState(2);
  const i = pos[fnId];
  const h = HS[hIdx];
  const r = readAt(fn, i, h);
  const v = fn.v;
  const xs = pyRepr(r.x);
  const xr: [number, number] = [fn.min / 10, fn.max / 10];
  const yr: [number, number] = [fn.yMin, fn.yMax];
  const parabola = fn.id !== "exp";

  return (
    <div className="m5-wid">
      <Seg
        label="Função"
        options={FUNCTIONS.map((f) => ({ id: f.id, label: f.label }))}
        value={fnId}
        onChange={(id) => setFnId(id as FnId)}
        scroll
      />

      <div className="m5-grid">
        <div className="m5-col">
          <Plot
            label={`Gráfico de ${fn.formula} com a reta tangente em ${v} = ${xs}`}
            x={xr}
            y={yr}
            xTicks={TICKS[fn.id].x}
            yTicks={TICKS[fn.id].y}
            xLabel={v}
          >
            {(sx, sy) => (
              <>
                <path className="m5-curve" d={curvePath(fn.f, xr, yr, sx, sy)} />
                <line
                  className="m5-tangent"
                  x1={sx(xr[0])}
                  y1={sy(r.fx + r.exact * (xr[0] - r.x))}
                  x2={sx(xr[1])}
                  y2={sy(r.fx + r.exact * (xr[1] - r.x))}
                />
                {h >= 1e-1 && (
                  <>
                    <circle className="m5-dot-sm" cx={sx(r.x - h)} cy={sy(fn.f(r.x - h))} r={3} />
                    <circle className="m5-dot-sm" cx={sx(r.x + h)} cy={sy(fn.f(r.x + h))} r={3} />
                  </>
                )}
                <circle className="m5-dot" cx={sx(r.x)} cy={sy(r.fx)} r={4.5} />
              </>
            )}
          </Plot>
          <p className="small muted">
            {fn.formula} · {fn.dformula}. A reta tracejada é a tangente: a sua inclinação é a derivada.
            {h >= 1e-1 ? ` Os dois pontos pequenos são ${v} − h e ${v} + h, usados pelas diferenças centrais.` : ""}
          </p>
        </div>

        <div className="m5-col">
          <label className="m5-slider">
            <span className="small muted">
              Ponto: <span className="mono">{v} = {xs}</span>
            </span>
            <input
              type="range"
              className="m5-range"
              min={fn.min}
              max={fn.max}
              step={1}
              value={i}
              onChange={(e) => setPos({ ...pos, [fnId]: Number(e.target.value) })}
              aria-label={`Valor de ${v}`}
            />
          </label>
          <div className="m5-control">
            <span className="small muted">Passo h da derivada numérica</span>
            <div className="m5-pills" role="group" aria-label="Valor de h">
              {HS.map((hv, k) => (
                <button key={hv} type="button" className={`pill mono ${k === hIdx ? "is-on" : ""}`} aria-pressed={k === hIdx} onClick={() => setHIdx(k)}>
                  {pyExp(hv, 0)}
                </button>
              ))}
            </div>
          </div>

          <dl className="m5-readout" aria-live="polite">
            <div>
              <dt>
                {fn.id === "perda" ? "L" : "f"}({xs})
              </dt>
              <dd className="mono">{pr(r.fx, 6)}</dd>
            </div>
            <div>
              <dt>Derivada exata, pela fórmula</dt>
              <dd className="mono">{pr(r.exact, 6)}</dd>
            </div>
            <div>
              <dt>
                Derivada numérica, <span className="mono">h = {pyExp(h, 0)}</span>
              </dt>
              <dd className="mono">{pr(r.numeric, 6)}</dd>
            </div>
            <div>
              <dt>Erro (diferença entre as duas)</dt>
              <dd className="mono">{pyExp(r.error)}</dd>
            </div>
          </dl>

          <div className="widget-detail">
            <p>{SIGN_TEXT(v)[r.sign]}</p>
            <p className="muted small">{hNote(h, parabola)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
