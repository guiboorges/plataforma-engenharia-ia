import React, { useState } from "react";
import { Chip, Seg } from "../../ui";
import {
  CURV_PERDA,
  descidaPerda,
  descidaQuad,
  fnc,
  naoConvexa,
  passosAte,
  perda,
  verdict,
  type Verdict,
} from "./descida";
import { pr, pt, pyRepr } from "./fmt";
import { Plot, clampTo, curvePath } from "./Plot";

// Descida do gradiente (secção 5): a taxa de aprendizagem em f(x) = x² e na perda da secção 1, e o ponto de partida
// numa função não convexa. Os passos são os do código da aula (descida.ts), testados contra NumPy 2.5.

type Tab = "quad" | "perda" | "nc";

const TABS = [
  { id: "quad", label: "f(x) = x²" },
  { id: "perda", label: "Perda da secção 1" },
  { id: "nc", label: "Não convexa" },
];

const VERDICT: Record<Verdict, { tone: "ok" | "warn" | "bad"; label: string }> = {
  "um-passo": { tone: "ok", label: "Chega ao mínimo num passo" },
  converge: { tone: "ok", label: "Converge" },
  "oscila-converge": { tone: "warn", label: "Muda de sinal, mas converge" },
  preso: { tone: "warn", label: "Oscila para sempre" },
  diverge: { tone: "bad", label: "Diverge" },
};

function verdictText(v: Verdict, fator: number, n: number | null, dist: string): string {
  const pct = Math.round((1 - Math.abs(fator)) * 100);
  switch (v) {
    case "um-passo":
      return "O fator é 0: o primeiro passo cai exatamente no mínimo (só acontece numa função como esta, com uma só curvatura).";
    case "converge":
      return `Cada passo multiplica a distância ao mínimo por ${pt(fator, 3)}: tira ${pct}%. ${dist} em ${n} passos${n !== null && n > 30 ? ": converge, mas devagar" : ""}.`;
    case "oscila-converge":
      return `O fator é negativo (${pt(fator, 3)}): cada passo salta para o outro lado do mínimo, mas fica mais perto. ${dist} em ${n} passos.`;
    case "preso":
      return "O fator é −1: cada passo salta para o outro lado, à mesma distância. Nem converge nem diverge.";
    case "diverge":
      return `O fator é ${pt(fator, 3)}, maior do que 1 em valor absoluto: cada passo salta mais longe do mínimo. A taxa é grande demais.`;
  }
}

/** Curva da perda em escala log (como a da aula), com os zeros presos ao fundo do gráfico. */
function LossCurve({ losses, label }: { losses: number[]; label: string }) {
  const lg = losses.map((l) => (l > 0 ? Math.log10(l) : -Infinity));
  const finite = lg.filter((v) => Number.isFinite(v));
  const hi = Math.min(30, Math.max(2, Math.ceil(Math.max(...finite, 0))));
  const lo = Math.max(-12, Math.min(-2, Math.floor(Math.min(...finite, 0))));
  const step = hi - lo > 12 ? 4 : hi - lo > 6 ? 2 : 1;
  const ticks: number[] = [];
  for (let t = lo; t <= hi; t += step) ticks.push(t);
  const n = losses.length - 1;
  const xt = n <= 10 ? [0, 2, 4, 6, 8, 10] : [0, 10, 20, 30, 40, 50];
  return (
    <Plot
      label={label}
      x={[0, n]}
      y={[lo, hi]}
      xTicks={xt}
      yTicks={ticks}
      xLabel="passo"
      yLabel="perda (escala log)"
      fmtY={(t) => `1e${t}`}
      h={170}
    >
      {(sx, sy) => {
        const pts = lg.map((v, k) => [sx(k), sy(Number.isFinite(v) ? Math.min(hi + 5, v) : lo - 1)] as const);
        return (
          <>
            <path className="m5-path" d={pts.map(([a, b], k) => `${k ? "L" : "M"}${a.toFixed(2)},${b.toFixed(2)}`).join("")} />
            {n <= 10 && pts.map(([a, b], k) => <circle key={k} className="m5-dot-sm" cx={a} cy={b} r={2.5} />)}
          </>
        );
      }}
    </Plot>
  );
}

function EtaControl({
  value,
  min,
  max,
  scale,
  presets,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  scale: number;
  presets: number[];
  onChange: (i: number) => void;
}) {
  return (
    <div className="m5-col">
      <label className="m5-slider">
        <span className="small muted">
          Taxa de aprendizagem <span className="mono">η = {pyRepr(value / scale)}</span>
        </span>
        <input
          type="range"
          className="m5-range"
          min={min}
          max={max}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label="Taxa de aprendizagem η"
        />
      </label>
      <div className="m5-pills" role="group" aria-label="Taxas de exemplo">
        {presets.map((p) => (
          <button key={p} type="button" className={`pill mono ${p === value ? "is-on" : ""}`} aria-pressed={p === value} onClick={() => onChange(p)}>
            {pyRepr(p / scale)}
          </button>
        ))}
      </div>
    </div>
  );
}

function QuadTab() {
  const [i, setI] = useState(5); // η = i / 100
  const eta = i / 100;
  const xs = descidaQuad(eta);
  const fator = 1 - 2 * eta;
  const v = verdict(fator);
  const n = passosAte(fator, 0.01 / 4);
  const xr: [number, number] = [-6, 6];
  const yr: [number, number] = [-2, 40];
  return (
    <>
      <EtaControl value={i} min={1} max={120} scale={100} presets={[5, 30, 50, 75, 110]} onChange={setI} />
      <div className="m5-verdict">
        <Chip tone={VERDICT[v].tone}>{VERDICT[v].label}</Chip>
        <span className="mono small">fator 1 − 2η = {pr(fator, 3)}</span>
      </div>
      <p className="m5-text">{verdictText(v, fator, n, "Chega a |x| < 0,01")}</p>
      <div className="m5-grid">
        <div className="m5-col">
          <Plot label={`Dez passos em f(x) = x² a partir de x = 4, com η = ${pyRepr(eta)}`} x={xr} y={yr} xTicks={[-6, -4, -2, 0, 2, 4, 6]} yTicks={[0, 10, 20, 30, 40]} xLabel="x" yLabel="f(x) = x²">
            {(sx, sy) => {
              const pts = xs.map((x) => [sx(clampTo(x, xr)), sy(clampTo(x * x, yr))] as const);
              return (
                <>
                  <path className="m5-curve" d={curvePath((t) => t * t, xr, yr, sx, sy)} />
                  <path className="m5-path" d={pts.map(([a, b], k) => `${k ? "L" : "M"}${a.toFixed(2)},${b.toFixed(2)}`).join("")} />
                  {pts.map(([a, b], k) => (
                    <circle key={k} className={k === 0 ? "m5-dot" : "m5-dot-sm"} cx={a} cy={b} r={k === 0 ? 4.5 : 3} />
                  ))}
                </>
              );
            }}
          </Plot>
          <LossCurve losses={xs.map((x) => x * x)} label="Curva da perda f(x) ao longo dos dez passos, em escala logarítmica" />
        </div>
        <div className="m5-col">
          <div className="table-wrap">
            <table className="m5-tbl">
              <thead>
                <tr>
                  <th scope="col">Passo</th>
                  <th scope="col" className="m5-num">
                    x
                  </th>
                  <th scope="col" className="m5-num">
                    f(x) = x²
                  </th>
                </tr>
              </thead>
              <tbody>
                {xs.map((x, k) => (
                  <tr key={k}>
                    <td className="mono muted">{k}</td>
                    <td className="mono m5-num">{pr(x, 4)}</td>
                    <td className="mono m5-num">{pr(x * x, 4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="small muted">Cada passo faz x ← x − η·2x = (1 − 2η)·x. Valores com 4 casas, como <span className="mono">round(x, 4)</span>.</p>
        </div>
      </div>
    </>
  );
}

const CHECKPOINTS = [1, 5, 10, 20, 50];

function PerdaTab() {
  const [i, setI] = useState(10); // η = i / 1000
  const eta = i / 1000;
  const ws = descidaPerda(eta);
  const fator = 1 - CURV_PERDA * eta;
  const v = verdict(fator);
  const wOtimo = 2.0036;
  const n = passosAte(fator, 0.01 / wOtimo);
  const xr: [number, number] = [-1, 5];
  const yr: [number, number] = [-3, 60];
  return (
    <>
      <EtaControl value={i} min={1} max={100} scale={1000} presets={[1, 10, 40, 80, 95]} onChange={setI} />
      <div className="m5-verdict">
        <Chip tone={VERDICT[v].tone}>{VERDICT[v].label}</Chip>
        <span className="mono small">fator 1 − 22η = {pr(fator, 3)}</span>
      </div>
      <p className="m5-text">{verdictText(v, fator, n, "Chega a menos de 0,01 do w ótimo (2,0036)")}</p>
      <div className="m5-grid">
        <div className="m5-col">
          <Plot label={`Cinquenta passos na perda L(w) a partir de w = 0, com η = ${pyRepr(eta)}`} x={xr} y={yr} xTicks={[-1, 0, 1, 2, 3, 4, 5]} yTicks={[0, 20, 40, 60]} xLabel="w" yLabel="L(w)">
            {(sx, sy) => {
              const pts = ws.map((w) => [sx(clampTo(w, xr)), sy(clampTo(perda(w), yr))] as const);
              return (
                <>
                  <path className="m5-curve" d={curvePath(perda, xr, yr, sx, sy)} />
                  <path className="m5-path" d={pts.map(([a, b], k) => `${k ? "L" : "M"}${a.toFixed(2)},${b.toFixed(2)}`).join("")} />
                  {pts.map(([a, b], k) => (
                    <circle key={k} className={k === 0 ? "m5-dot" : "m5-dot-sm"} cx={a} cy={b} r={k === 0 ? 4.5 : 2.5} />
                  ))}
                </>
              );
            }}
          </Plot>
          <LossCurve losses={ws.map(perda)} label="Curva da perda L(w) ao longo dos cinquenta passos, em escala logarítmica" />
        </div>
        <div className="m5-col">
          <pre className="m5-pre">
            {`w = 0.0\neta = ${pyRepr(eta)}\nfor passo in range(1, 51):\n    w = w - eta * dperda(w)\n    if passo in (1, 5, 10, 20, 50):\n        print(passo, round(w, 4), round(perda(w), 4))`}
          </pre>
          <pre className="m5-pre m5-out" aria-live="polite">
            {CHECKPOINTS.map((k) => `${k} ${pr(ws[k], 4)} ${pr(perda(ws[k]), 4)}`).join("\n")}
          </pre>
          <p className="small muted">
            A perda da secção 1 tem curvatura L''(w) = 2 · média(x²) = 22, por isso cada passo multiplica a distância ao mínimo por 1 − 22η.
            Acima de η = 2/22 ≈ 0,091, diverge.
          </p>
        </div>
      </div>
    </>
  );
}

function NcTab() {
  const [i, setI] = useState(-20); // x0 = i / 10
  const x0 = i / 10;
  const res = naoConvexa(x0);
  const xr: [number, number] = [-2.1, 2.1];
  const yr: [number, number] = [-5, 8];
  const where = {
    global: { tone: "ok" as const, label: "Mínimo global" },
    local: { tone: "warn" as const, label: "Mínimo local" },
    "a-caminho": { tone: "warn" as const, label: "100 passos não chegam" },
  }[res.where];
  return (
    <>
      <div className="m5-col">
        <label className="m5-slider">
          <span className="small muted">
            Ponto de partida <span className="mono">x0 = {pyRepr(x0)}</span>
          </span>
          <input type="range" className="m5-range" min={-20} max={20} step={1} value={i} onChange={(e) => setI(Number(e.target.value))} aria-label="Ponto de partida x0" />
        </label>
        <div className="m5-pills" role="group" aria-label="Pontos de partida da aula">
          {[-20, 20].map((p) => (
            <button key={p} type="button" className={`pill mono ${p === i ? "is-on" : ""}`} aria-pressed={p === i} onClick={() => setI(p)}>
              {pyRepr(p / 10)}
            </button>
          ))}
        </div>
      </div>
      <div className="m5-verdict">
        <Chip tone={where.tone}>{where.label}</Chip>
        <span className="mono small">
          {pyRepr(x0)} {pr(res.final, 4)} {pr(fnc(res.final), 4)}
        </span>
      </div>
      <p className="m5-text">
        {res.where === "global"
          ? "Acaba no vale mais fundo, o mínimo global."
          : res.where === "local"
            ? "Acaba no vale da direita: a derivada é zero, mas há um vale mais fundo à esquerda. A descida do gradiente só vê a inclinação local."
            : "Começou perto do topo entre os dois vales, onde a inclinação é quase zero: em 100 passos ainda não chegou a nenhum mínimo."}
      </p>
      <Plot label={`Cem passos com η = 0,01 em f(x) = x⁴ − 3x² + x a partir de x = ${pyRepr(x0)}`} x={xr} y={yr} xTicks={[-2, -1, 0, 1, 2]} yTicks={[-4, 0, 4, 8]} xLabel="x" yLabel="f(x) = x⁴ − 3x² + x">
        {(sx, sy) => (
          <>
            <path className="m5-curve" d={curvePath(fnc, xr, yr, sx, sy)} />
            {res.xs
              .filter((_, k) => k % 4 === 0)
              .map((x, k) => (
                <circle key={k} className="m5-dot-sm" cx={sx(x)} cy={sy(fnc(x))} r={2.5} />
              ))}
            <circle className="m5-dot" cx={sx(res.final)} cy={sy(fnc(res.final))} r={5} />
          </>
        )}
      </Plot>
      <p className="small muted">Um ponto a cada 4 passos; o ponto maior é onde acaba. η = 0,01 e 100 passos, como na aula.</p>
    </>
  );
}

export function DescentPlayground() {
  const [tab, setTab] = useState<Tab>("quad");
  return (
    <div className="m5-wid">
      <Seg label="Função" options={TABS} value={tab} onChange={(id) => setTab(id as Tab)} scroll />
      {tab === "quad" ? <QuadTab /> : tab === "perda" ? <PerdaTab /> : <NcTab />}
    </div>
  );
}
