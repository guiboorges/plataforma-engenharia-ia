import React, { useState } from "react";
import { Icon, Seg } from "../../ui";
import { neuron } from "./neuronio";
import { pr, pyRepr } from "./fmt";

// Grafo computacional de um neurónio (secção 4): a ida calcula z, a e L e guarda-os; a volta multiplica derivadas
// locais da direita para a esquerda. As contas e os arredondamentos (round(…, 4)) são os do código da aula (neuronio.ts).

const LESSON = { x: 4, y: 1, w: 5, b: -5 }; // x = 4/2 = 2.0; w e b em décimos: 0.5 e −0.5

type NodeId = "in" | "z" | "a" | "L";
type Phase = "Início" | "Ida" | "Volta" | "Verificar";

/** Número como no print do Python, com o sinal de menos tipográfico e parênteses se for negativo. */
const num = (v: number, d = 4) => {
  const s = pr(v, d).replace(/^-/, "−");
  return s.startsWith("−") ? `(${s})` : s;
};
const val = (v: number, d = 4) => pr(v, d).replace(/^-/, "−");

export function NeuronGraph() {
  const [p, setP] = useState(LESSON);
  const [k, setK] = useState(0);
  const x = p.x / 2;
  const y = p.y;
  const w = p.w / 10;
  const b = p.b / 10;
  const n = neuron(x, y, w, b);
  const isLesson = p.x === LESSON.x && p.y === LESSON.y && p.w === LESSON.w && p.b === LESSON.b;

  const dir = (g: number, name: string) =>
    Math.abs(g) < 5e-5 ? `mexer ${name} quase não muda a perda` : g < 0 ? `aumentar ${name} faz a perda descer` : `diminuir ${name} faz a perda descer`;
  const confere = pr(n.num_w, 4) === pr(n.dL_dw, 4) && pr(n.num_b, 4) === pr(n.dL_db, 4);

  const steps: { phase: Phase; node: NodeId; eq: string; note: string }[] = [
    {
      phase: "Início",
      node: "in",
      eq: `x = ${val(x)}, y = ${val(y)}, w = ${val(w)}, b = ${val(b)}`,
      note: "Uma entrada x, a resposta certa y e os parâmetros atuais w e b. A ida vai da esquerda para a direita.",
    },
    { phase: "Ida", node: "z", eq: `z = w·x + b = ${num(w)} × ${num(x)} + ${num(b)} = ${val(n.z)}`, note: "Combinação linear. O resultado fica guardado para a volta." },
    { phase: "Ida", node: "a", eq: `a = σ(z) = 1 / (1 + e^(−z)) = ${val(n.a)}`, note: "Ativação sigmoide. Também fica guardado." },
    { phase: "Ida", node: "L", eq: `L = (a − y)² = (${val(n.a)} − ${val(y)})² = ${val(n.L)}`, note: "A perda deste exemplo. Acaba a ida; começa a volta, da direita para a esquerda." },
    { phase: "Volta", node: "L", eq: `∂L/∂a = 2(a − y) = ${val(n.dL_da)}`, note: "Derivada de (a − y)² em ordem a a." },
    { phase: "Volta", node: "a", eq: `∂a/∂z = a(1 − a) = ${val(n.da_dz)}`, note: "Derivada local da sigmoide, calculada com o a que a ida guardou." },
    {
      phase: "Volta",
      node: "z",
      eq: `∂L/∂z = ∂L/∂a · ∂a/∂z = ${val(n.dL_dz)}`,
      note: "Regra da cadeia: o nó recebe a derivada da perda em relação à sua saída e multiplica-a pela sua derivada local.",
    },
    {
      phase: "Volta",
      node: "in",
      eq: `∂L/∂w = ∂L/∂z · x = ${val(n.dL_dw)}    ∂L/∂b = ∂L/∂z · 1 = ${val(n.dL_db)}`,
      note: "Como z = wx + b, dz/dw = x e dz/db = 1. O gradiente completo saiu de uma ida e uma volta.",
    },
    {
      phase: "Verificar",
      node: "in",
      eq: `derivada numérica: ∂L/∂w ≈ ${val(n.num_w)}    ∂L/∂b ≈ ${val(n.num_b)}${confere ? ": confere" : ""}`,
      note: `A saída a = ${val(n.a)} está ${n.a < y ? "abaixo" : n.a > y ? "acima" : "em cima"} da resposta certa ${val(y)}: ${dir(n.dL_dw, "w")} e ${dir(n.dL_db, "b")}.`,
    },
  ];
  const last = steps.length - 1;
  const st = steps[k];
  const shown = (from: number) => k >= from;

  const node = (id: NodeId, title: string, fwd: React.ReactNode, back: React.ReactNode) => (
    <div className={`m5-node ${st.node === id ? "is-on" : ""}`} aria-current={st.node === id ? "step" : undefined}>
      <p className="m5-node-title mono">{title}</p>
      <div className="m5-node-fwd">{fwd}</div>
      <div className="m5-node-back">{back}</div>
    </div>
  );
  const kv = (label: string, v: string | null) => (
    <p className="m5-kv">
      <span>{label}</span>
      <span className="mono">{v ?? "·"}</span>
    </p>
  );

  const set = (key: keyof typeof LESSON, v: number) => setP({ ...p, [key]: v });

  return (
    <div className="m5-wid">
      <div className="m5-params">
        <label className="m5-slider">
          <span className="small muted">
            Entrada <span className="mono">x = {pyRepr(x)}</span>
          </span>
          <input type="range" className="m5-range" min={-6} max={6} step={1} value={p.x} onChange={(e) => set("x", Number(e.target.value))} aria-label="Entrada x" />
        </label>
        <label className="m5-slider">
          <span className="small muted">
            Peso <span className="mono">w = {pyRepr(w)}</span>
          </span>
          <input type="range" className="m5-range" min={-30} max={30} step={1} value={p.w} onChange={(e) => set("w", Number(e.target.value))} aria-label="Peso w" />
        </label>
        <label className="m5-slider">
          <span className="small muted">
            Viés <span className="mono">b = {pyRepr(b)}</span>
          </span>
          <input type="range" className="m5-range" min={-30} max={30} step={1} value={p.b} onChange={(e) => set("b", Number(e.target.value))} aria-label="Viés b" />
        </label>
        <div className="m5-control">
          <span className="small muted">Resposta certa y</span>
          <Seg
            label="Resposta certa y"
            options={[
              { id: "0", label: "0" },
              { id: "1", label: "1" },
            ]}
            value={String(p.y)}
            onChange={(id) => set("y", Number(id))}
          />
        </div>
      </div>
      {!isLesson && (
        <button type="button" className="link-btn m5-reset" onClick={() => setP(LESSON)}>
          <Icon name="refresh" size={14} />
          Voltar aos valores da aula (x = 2, y = 1, w = 0,5, b = −0,5)
        </button>
      )}

      <div className="m5-graph" role="group" aria-label="Grafo computacional">
        {node(
          "in",
          "x, w, b",
          <>
            {kv("x", val(x))}
            {kv("w", val(w))}
            {kv("b", val(b))}
          </>,
          <>
            {kv("∂L/∂w", shown(7) ? val(n.dL_dw) : null)}
            {kv("∂L/∂b", shown(7) ? val(n.dL_db) : null)}
          </>,
        )}
        <span className="m5-arrow" aria-hidden="true" />
        {node("z", "z = wx + b", kv("z", shown(1) ? val(n.z) : null), kv("∂L/∂z", shown(6) ? val(n.dL_dz) : null))}
        <span className="m5-arrow" aria-hidden="true" />
        {node(
          "a",
          "a = σ(z)",
          kv("a", shown(2) ? val(n.a) : null),
          <>
            {kv("∂L/∂a", shown(4) ? val(n.dL_da) : null)}
            {kv("∂a/∂z", shown(5) ? val(n.da_dz) : null)}
          </>,
        )}
        <span className="m5-arrow" aria-hidden="true" />
        {node(
          "L",
          "L = (a − y)²",
          <>
            {kv("y", val(y))}
            {kv("L", shown(3) ? val(n.L) : null)}
          </>,
          kv("∂L/∂L", shown(4) ? "1" : null),
        )}
      </div>
      <p className="small muted m5-legend">Em cima, os valores da ida; em baixo, as derivadas da volta.</p>

      <div className="row gap-sm wrap" role="group" aria-label="Avançar no grafo">
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

      <div className="widget-detail" aria-live="polite">
        <p className="m5-label">
          Passo {k + 1} de {steps.length} · {st.phase}
        </p>
        <p className="mono m5-eq">{st.eq}</p>
        <p>{st.note}</p>
      </div>
    </div>
  );
}
