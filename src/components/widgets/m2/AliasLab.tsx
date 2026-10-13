import React, { useState } from "react";
import { Icon, Seg } from "../../ui";
import { COPY_LINE, opLine, printed, simulate, type CopyMode, type Name, type Op, type OpKind } from "./aliasing";

// "Duas variáveis, a mesma lista" (secção 3): os nomes são etiquetas que apontam para objetos.

const MODES: { id: CopyMode; label: string }[] = [
  { id: "alias", label: "b = a" },
  { id: "copy", label: "b = a.copy()" },
  { id: "list", label: "b = list(a)" },
  { id: "slice", label: "b = a[:]" },
];

const KINDS: { kind: OpKind; hint: string }[] = [
  { kind: "append", hint: "altera a lista no sítio" },
  { kind: "iadd", hint: "também altera no sítio" },
  { kind: "concat", hint: "cria uma lista nova" },
  { kind: "setitem", hint: "altera a lista no sítio" },
];

export function AliasLab() {
  const [mode, setMode] = useState<CopyMode>("alias");
  const [target, setTarget] = useState<Name>("b");
  const [ops, setOps] = useState<Op[]>([]);

  const nextValue = 4 + ops.filter((o) => o.kind !== "setitem").length;
  const opFor = (kind: OpKind): Op => ({ target, kind, value: kind === "setitem" ? 99 : nextValue });
  const state = simulate(mode, ops);
  const out = printed(state);
  const lines = ["a = [1, 2, 3]", COPY_LINE[mode], ...ops.map(opLine)];

  return (
    <div className="m2-alias">
      <div className="m2-alias-controls">
        <div className="field">
          <span className="m2-label">1. Como nasce o b</span>
          <Seg
            label="Como nasce o b"
            options={MODES.map((m) => ({ id: m.id, label: m.label }))}
            value={mode}
            onChange={(id) => {
              setMode(id as CopyMode);
              setOps([]);
            }}
            scroll
          />
        </div>
        <div className="field">
          <span className="m2-label">2. Mudar uma das variáveis</span>
          <div className="row gap-sm wrap center-y">
            <Seg
              label="Variável a mudar"
              options={[
                { id: "a", label: "a" },
                { id: "b", label: "b" },
              ]}
              value={target}
              onChange={(id) => setTarget(id as Name)}
            />
            {KINDS.map((k) => (
              <button
                key={k.kind}
                type="button"
                className="btn btn-secondary btn-sm mono"
                title={k.hint}
                disabled={ops.length >= 8}
                onClick={() => setOps([...ops, opFor(k.kind)])}
              >
                {opLine(opFor(k.kind))}
              </button>
            ))}
            <button type="button" className="btn btn-ghost btn-sm" disabled={ops.length === 0} onClick={() => setOps([])}>
              <Icon name="refresh" size={14} />
              <span>Recomeçar</span>
            </button>
          </div>
        </div>
      </div>

      <div className="m2-alias-grid">
        <div className="m2-alias-code">
          <p className="m2-label">Programa</p>
          <pre className="mono">
            {lines.map((l, i) => (
              <span key={i} className={i === lines.length - 1 && i > 1 ? "m2-line-new" : undefined}>
                {l}
                {"\n"}
              </span>
            ))}
            <span className="m2-line-print">{"print(a, b)\nprint(a is b)"}</span>
          </pre>
        </div>

        <div className="m2-alias-mem">
          <p className="m2-label">Memória</p>
          <ul className="m2-objs" aria-live="polite">
            {state.objects.map((o) => {
              const owners = (["a", "b"] as Name[]).filter((n) => state.names[n] === o.id);
              return (
                <li key={o.id} className="m2-obj">
                  <span className="m2-obj-names">
                    {owners.map((n) => (
                      <span key={n} className="m2-name mono">
                        {n}
                      </span>
                    ))}
                    <Icon name="right" size={14} />
                  </span>
                  <span className="m2-obj-box">
                    <span className="m2-obj-tag">lista n.º {o.id}</span>
                    <span className="m2-obj-items">
                      {o.items.map((v, k) => (
                        <span key={k} className="m2-obj-item mono">
                          {v}
                        </span>
                      ))}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="small muted">
            {state.objects.length === 1
              ? "Uma só lista com dois nomes: o que se muda por um nome vê-se pelo outro."
              : "Duas listas independentes: cada nome aponta para a sua."}
          </p>
        </div>
      </div>

      <div className="widget-detail m2-console" aria-live="polite">
        <p className="m2-label">Resultado</p>
        <p className="mono m2-console-out">{out.ab}</p>
        <p className="mono m2-console-out">{out.is}</p>
        <p className="muted small">
          <code>a is b</code> diz se os dois nomes apontam para o mesmo objeto. Depois de <code>{COPY_LINE[mode]}</code>
          {mode === "alias" ? ", é True até um dos nomes ser reatribuído com =." : ", é sempre False."}
        </p>
      </div>
    </div>
  );
}

