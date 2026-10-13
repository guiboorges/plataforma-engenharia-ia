import React, { useState } from "react";
import { Icon, Seg } from "../../ui";
import { highlightPython } from "../../../lib/md";
import { LOOP_EXAMPLES } from "./loops";

// Passo a passo de ciclos e compreensões (secção 4): que linha corre e como ficam as variáveis.

export function LoopStepper() {
  const [exId, setExId] = useState(LOOP_EXAMPLES[0].id);
  const [k, setK] = useState(0);
  const ex = LOOP_EXAMPLES.find((e) => e.id === exId) ?? LOOP_EXAMPLES[0];
  const st = ex.steps[k];
  const last = ex.steps.length - 1;

  return (
    <div className="m2-loop">
      <Seg
        label="Exemplo"
        options={LOOP_EXAMPLES.map((e) => ({ id: e.id, label: e.label }))}
        value={ex.id}
        onChange={(id) => {
          setExId(id);
          setK(0);
        }}
        scroll
      />

      <div className="row gap-sm wrap" role="group" aria-label="Avançar no código">
        <button type="button" className="btn btn-ghost btn-sm" disabled={k === 0} onClick={() => setK(k - 1)}>
          <Icon name="left" size={14} />
          <span>Anterior</span>
        </button>
        <button type="button" className="btn btn-primary btn-sm" disabled={k === last} onClick={() => setK(k + 1)}>
          <span>Passo seguinte</span>
          <Icon name="right" size={14} />
        </button>
        <button type="button" className="btn btn-secondary btn-sm" disabled={k === last} onClick={() => setK(last)}>
          Até ao fim
        </button>
        <button type="button" className="btn btn-ghost btn-sm" disabled={k === 0} onClick={() => setK(0)}>
          <Icon name="refresh" size={14} />
          <span>Recomeçar</span>
        </button>
      </div>

      <div className="m2-loop-grid">
        <ol className="m2-loop-code mono" aria-label="Código">
          {ex.code.map((l, i) => (
            <li key={i} className={i === st.line ? "is-on" : undefined} aria-current={i === st.line ? "step" : undefined}>
              <span className="m2-loop-ln" aria-hidden="true">
                {i + 1}
              </span>
              <span className="m2-loop-src">{highlightPython(l)}</span>
            </li>
          ))}
        </ol>

        <div className="m2-loop-side">
          <div className="widget-detail" aria-live="polite">
            <p className="m2-label">
              Passo {k + 1} de {ex.steps.length} · linha {st.line + 1}
            </p>
            <p>{st.note}</p>
          </div>
          <div className="m2-vars">
            <p className="m2-label">Variáveis</p>
            <dl>
              {st.vars.map(([n, v]) => (
                <div key={n} className="m2-var">
                  <dt className={n.startsWith("(") ? "m2-var-tmp" : "mono"}>{n}</dt>
                  <dd className="mono">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="m2-vars">
            <p className="m2-label">Impresso</p>
            <pre className="mono m2-loop-out">{st.out || " "}</pre>
          </div>
        </div>
      </div>

    </div>
  );
}
