import React, { useMemo, useState } from "react";
import { Seg } from "../../ui";
import { LineChart, type Tick } from "./Chart";
import { atCapacity, atThreshold, averagePrecision, CARAVAN, gainsCurve, prCurve, profit, rocAuc } from "./limiar";
import { fmt, pct } from "./fmt";

// Limiar e capacidade no Caravan (secção 4): as probabilidades reais que a regressão logística da aula dá aos
// 1747 clientes do teste. Mexer no limiar (ou no número de contactos) muda a precisão e a revocação, mas não a
// ordenação dos clientes: a curva de precisão e revocação e a curva de ganhos ficam iguais.

type Mode = "limiar" | "capacidade";
const LIMIARES = [0.5, 0.2, 0.1, 0.06];
const CAPS = [0.05, 0.1, 0.2, 0.5];

const N = CARAVAN.y.length;
const POS = CARAVAN.y.reduce((a, b) => a + b, 0);
const BASE = POS / N;
const AP = averagePrecision(CARAVAN);
const AUC = rocAuc(CARAVAN);
const PR = prCurve(CARAVAN);
// como o precision_recall_curve, junta o ponto (revocação 0, precisão 1) no início
const PR_POINTS: [number, number][] = [[0, 1], ...PR.map((p): [number, number] => [p.recall, p.precision])];
const GAINS = gainsCurve(CARAVAN);
// a curva de ganhos tem 1748 pontos; 1 em cada 4 chega para o desenho (o último entra sempre)
const GAINS_POINTS = GAINS.filter((_, i) => i % 4 === 0 || i === GAINS.length - 1);

const T01: Tick[] = [0, 0.2, 0.4, 0.6, 0.8, 1].map((v) => ({ at: v, label: fmt(v, 1) }));
const T100: Tick[] = [0, 0.2, 0.4, 0.6, 0.8, 1].map((v) => ({ at: v, label: fmt(v * 100) }));

/** "0,06" ou "0.06" → 0,06; null se não for um número ≥ 0. */
function parseNum(s: string): number | null {
  const t = s.trim().replace(",", ".");
  if (!/^\d+(\.\d+)?$/.test(t)) return null;
  return Number(t);
}

export function ThresholdExplorer() {
  const [mode, setMode] = useState<Mode>("limiar");
  const [t, setT] = useState(0.5);
  const [cap, setCap] = useState(0.1);
  const [costS, setCostS] = useState("5");
  const [marginS, setMarginS] = useState("40");
  const cost = parseNum(costS);
  const margin = parseNum(marginS);

  const c = useMemo(() => (mode === "limiar" ? atThreshold(CARAVAN, t) : atCapacity(CARAVAN, cap)), [mode, t, cap]);
  const contactAll = atThreshold(CARAVAN, 0);
  const costThreshold = cost !== null && margin !== null && margin > 0 ? cost / margin : null;

  const stats: { label: string; value: string; note: string }[] = [
    { label: "Marcados", value: fmt(c.marked), note: `de ${fmt(N)} clientes` },
    { label: "Compradores apanhados", value: fmt(c.tp), note: `de ${POS}` },
    { label: "Precisão", value: c.marked ? fmt(c.precision, 3) : "—", note: "compram, entre os marcados" },
    { label: "Revocação", value: fmt(c.recall, 3), note: "dos compradores, apanhados" },
    { label: "Exatidão", value: pct(c.accuracy), note: "acertos em todos" },
    { label: "Lift", value: c.marked ? fmt(c.lift, 1) : "—", note: `precisão / ${fmt(BASE, 2)}` },
  ];

  return (
    <div className="m11-th">
      <Seg
        options={[
          { id: "limiar", label: "Por limiar" },
          { id: "capacidade", label: "Por capacidade" },
        ]}
        value={mode}
        onChange={(v) => setMode(v as Mode)}
        label="Como escolher quem contactar"
      />

      {mode === "limiar" ? (
        <div className="m11-controls">
          <label className="m11-ctl m11-ctl-wide">
            <span className="small muted">
              Marcar como comprador quem tem p ≥ <span className="mono">{fmt(t, 2)}</span>
            </span>
            <input type="range" min={0.01} max={0.55} step={0.01} value={t} onChange={(e) => setT(Number(e.target.value))} aria-label="Limiar" />
          </label>
          <div className="m11-pills" role="group" aria-label="Limiares da aula">
            {LIMIARES.map((v) => (
              <button key={v} type="button" className={`pill mono ${Math.abs(t - v) < 1e-9 ? "is-on" : ""}`} aria-pressed={Math.abs(t - v) < 1e-9} onClick={() => setT(v)}>
                {fmt(v, 2)}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="m11-controls">
          <label className="m11-ctl m11-ctl-wide">
            <span className="small muted">
              Contactar os <span className="mono">{fmt(cap * 100)}%</span> de clientes com maior probabilidade
            </span>
            <input type="range" min={0.01} max={1} step={0.01} value={cap} onChange={(e) => setCap(Number(e.target.value))} aria-label="Fração de clientes contactados" />
          </label>
          <div className="m11-pills" role="group" aria-label="Capacidades">
            {CAPS.map((v) => (
              <button key={v} type="button" className={`pill mono ${Math.abs(cap - v) < 1e-9 ? "is-on" : ""}`} aria-pressed={Math.abs(cap - v) < 1e-9} onClick={() => setCap(v)}>
                {fmt(v * 100)}%
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="m11-stats">
        {stats.map((s) => (
          <div key={s.label} className="m11-stat">
            <span className="small muted">{s.label}</span>
            <span className="m11-stat-v mono">{s.value}</span>
            <span className="small muted">{s.note}</span>
          </div>
        ))}
      </div>

      <div className="m11-charts">
        <LineChart
          lines={[
            { points: [[0, BASE], [1, BASE]], cls: "is-ref" },
            { points: PR_POINTS, cls: "is-main" },
          ]}
          point={c.marked ? [c.recall, c.precision] : undefined}
          xTicks={T01}
          yTicks={T01}
          xLabel="Revocação"
          yLabel={`Precisão (AP = ${fmt(AP, 3)})`}
          label={`Curva de precisão e revocação; ponto atual: revocação ${fmt(c.recall, 3)}, precisão ${fmt(c.precision, 3)}`}
        />
        <LineChart
          lines={[
            { points: [[0, 0], [1, 1]], cls: "is-ref" },
            { points: GAINS_POINTS, cls: "is-main" },
          ]}
          point={[c.marked / N, c.recall]}
          xTicks={T100}
          yTicks={T100}
          xLabel="% de clientes contactados"
          yLabel="% dos compradores apanhados"
          label={`Curva de ganhos; ponto atual: ${pct(c.marked / N)} dos clientes contactados, ${pct(c.recall)} dos compradores`}
        />
      </div>
      <p className="small muted m11-legend">
        <span className="m11-key-line is-main" aria-hidden="true" /> regressão logística da aula (AUC {fmt(AUC, 3)}) ·{" "}
        <span className="m11-key-line is-ref" aria-hidden="true" /> ao acaso ({pct(BASE, 0)} de compradores; na curva de ganhos, a diagonal) · o ponto é a
        escolha atual.
      </p>

      <fieldset className="m11-cost">
        <legend className="small muted">Custos (valores de exemplo; mude-os)</legend>
        <div className="m11-controls">
          <label className="m11-ctl">
            <span className="small muted">Custo de contactar um cliente</span>
            <span className="m11-inline">
              <input className="input input-sm mono m11-money" inputMode="decimal" value={costS} onChange={(e) => setCostS(e.target.value)} aria-invalid={cost === null} />
              <span className="small muted">€</span>
            </span>
          </label>
          <label className="m11-ctl">
            <span className="small muted">Margem de cada venda</span>
            <span className="m11-inline">
              <input className="input input-sm mono m11-money" inputMode="decimal" value={marginS} onChange={(e) => setMarginS(e.target.value)} aria-invalid={margin === null} />
              <span className="small muted">€</span>
            </span>
          </label>
        </div>
        {cost === null || margin === null ? (
          <p className="small muted">Escreva dois números, por exemplo 5 e 40.</p>
        ) : (
          <div className="widget-detail">
            <span>
              Lucro com esta escolha: <strong className="mono">{fmt(profit(c, cost, margin))} €</strong> ({fmt(c.tp)} × {fmt(margin, Number.isInteger(margin) ? 0 : 2)} € −{" "}
              {fmt(c.marked)} × {fmt(cost, Number.isInteger(cost) ? 0 : 2)} €). Contactar toda a gente: {fmt(profit(contactAll, cost, margin))} €.
            </span>
            {costThreshold !== null && (
              <span>
                Contactar compensa quando p × {fmt(margin, Number.isInteger(margin) ? 0 : 2)} &gt; {fmt(cost, Number.isInteger(cost) ? 0 : 2)}, ou seja, com p
                acima de <span className="mono">{fmt(costThreshold, 3)}</span>.{" "}
                {costThreshold >= 0.01 && costThreshold <= 0.55 && (
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => {
                      setMode("limiar");
                      setT(Math.round(costThreshold * 100) / 100);
                    }}
                  >
                    Usar o limiar {fmt(Math.round(costThreshold * 100) / 100, 2)}
                  </button>
                )}
              </span>
            )}
            <span className="muted">
              Isto é o conjunto de teste. Num projeto, o limiar escolhe-se no treino, com probabilidades fora da amostra (<code className="mono">cross_val_predict</code>), e o teste
              só confirma.
            </span>
          </div>
        )}
      </fieldset>
    </div>
  );
}
