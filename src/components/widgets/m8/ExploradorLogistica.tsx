import React, { useMemo, useState } from "react";
import { BINS, fitLinear, fitLogistic, logLoss, odds, sigmoid, TOTAL } from "./logistica";
import { Plot, Slider, pathOf, pt, ptInt } from "./Plot";

// Explorador da regressão logística (secção 2) com os dados Default: β₀ e β₁ mexem na sigmoide, a entropia cruzada
// mede o ajuste aos 10 000 clientes, e as chances e a razão de chances e^(100·β₁) leem-se para um saldo à escolha.
// O ajuste de máxima verosimilhança (logistica.ts) foi testado contra o LogisticRegression(C=np.inf) do scikit-learn.

const X_RANGE: [number, number] = [0, 2700];
const Y_RANGE: [number, number] = [-0.15, 1.05];
const START = { b0: -8, b1: 0.004 };

const fmtOdds = (o: number) => (!Number.isFinite(o) ? "∞" : o >= 100 ? ptInt(o) : o >= 10 ? pt(o, 1) : pt(o, 3));
const fmtP = (p: number) => `${pt(p, 3)} (${pt(100 * p, 1)}%)`;

export function Logistica() {
  const fit = useMemo(() => fitLogistic(), []);
  const lin = useMemo(() => fitLinear(), []);
  const lossMin = useMemo(() => logLoss(fit.b0, fit.b1), [fit]);
  const [b0, setB0] = useState(START.b0);
  const [b1, setB1] = useState(START.b1);
  const [x, setX] = useState(1500);
  const [showLin, setShowLin] = useState(false);

  const z = b0 + b1 * x;
  const p = sigmoid(z);
  const o = odds(p);
  const or100 = Math.exp(100 * b1);
  const p2 = sigmoid(z + 100 * b1);
  const loss = logLoss(b0, b1);
  const isFit = Math.abs(b0 - fit.b0) < 0.006 && Math.abs(b1 - fit.b1) < 0.000006;

  return (
    <div className="m8-wid">
      <div className="m8-pills" role="group" aria-label="Coeficientes de exemplo">
        <button
          type="button"
          className={`pill ${isFit ? "is-on" : ""}`}
          aria-pressed={isFit}
          onClick={() => {
            setB0(Math.round(fit.b0 * 100) / 100);
            setB1(Math.round(fit.b1 * 100000) / 100000);
          }}
        >
          Máxima verosimilhança
        </button>
        <button
          type="button"
          className="pill"
          onClick={() => {
            setB0(START.b0);
            setB1(START.b1);
          }}
        >
          Repor
        </button>
        <button type="button" className={`pill ${showLin ? "is-on" : ""}`} aria-pressed={showLin} onClick={() => setShowLin(!showLin)}>
          Reta da regressão linear
        </button>
      </div>

      <div className="m8-grid">
        <div className="m8-col">
          <Plot
            label={`Fração de clientes em incumprimento por saldo e a curva σ(${pt(b0, 2)} + ${pt(b1, 5)} × saldo)`}
            x={X_RANGE}
            y={Y_RANGE}
            xTicks={[0, 500, 1000, 1500, 2000, 2500]}
            yTicks={[0, 0.25, 0.5, 0.75, 1]}
            fmtX={(v) => ptInt(v)}
            fmtY={(v) => (v === 0 || v === 1 ? String(v) : pt(v, 2))}
            xLabel="saldo do cartão ($)"
            yLabel="probabilidade de incumprimento"
            h={230}
          >
            {(sx, sy) => {
              const curve: [number, number][] = [];
              for (let i = 0; i <= 180; i++) {
                const v = (X_RANGE[1] * i) / 180;
                curve.push([sx(v), sy(sigmoid(b0 + b1 * v))]);
              }
              return (
                <>
                  {BINS.balance.map((bal, i) => (
                    <circle key={bal} className="m8-pt" cx={sx(bal)} cy={sy(BINS.defaults[i] / BINS.n[i])} r={1.2 + Math.sqrt(BINS.n[i]) / 5} />
                  ))}
                  {showLin && <path className="m8-line-dash" d={pathOf([[sx(0), sy(lin.b0)], [sx(X_RANGE[1]), sy(lin.b0 + lin.b1 * X_RANGE[1])]])} />}
                  <path className="m8-curve" d={pathOf(curve)} />
                  <line className="m8-vline" x1={sx(x)} x2={sx(x)} y1={sy(Y_RANGE[0])} y2={sy(Y_RANGE[1])} />
                  <circle className="m8-mark" cx={sx(x)} cy={sy(p)} r={4.5} />
                </>
              );
            }}
          </Plot>
          <p className="small muted">
            Cada ponto é um grupo de clientes com saldos próximos (de 100 em 100 dólares): a altura é a fração que falhou e o tamanho cresce com o número de
            clientes. A curva é a da regressão logística com os β escolhidos.
            {showLin && (
              <>
                {" "}
                A reta tracejada é a regressão linear da mesma variável 0/1: para um saldo de 0 dá {pt(lin.b0, 3)}, uma probabilidade negativa.
              </>
            )}
          </p>
        </div>

        <div className="m8-col">
          <Slider label="β₀ (termo constante)" value={b0} min={-16} max={-4} step={0.01} onChange={setB0} display={pt(b0, 2)} aria="Coeficiente β₀" />
          <Slider label="β₁ (por dólar de saldo)" value={b1} min={0} max={0.012} step={0.00001} onChange={setB1} display={pt(b1, 5)} aria="Coeficiente β₁" />
          <Slider label="Saldo do cliente" value={x} min={0} max={2600} step={50} onChange={setX} display={`${ptInt(x)} $`} aria="Saldo do cliente em dólares" />

          <dl className="m8-readout">
            <div>
              <dt>z = β₀ + β₁ · saldo</dt>
              <dd className="mono">{pt(z, 3)}</dd>
            </div>
            <div>
              <dt>Probabilidade p = σ(z)</dt>
              <dd className="mono">{fmtP(p)}</dd>
            </div>
            <div>
              <dt>Chances p / (1 − p)</dt>
              <dd className="mono">{fmtOdds(o)}</dd>
            </div>
            <div>
              <dt>Razão de chances por +100 $: e^(100·β₁)</dt>
              <dd className="mono">{pt(or100, 3)}</dd>
            </div>
            <div>
              <dt>Com mais 100 $ de saldo</dt>
              <dd className="mono">
                chances {fmtOdds(odds(p2))} · p {pt(p2, 3)}
              </dd>
            </div>
            <div>
              <dt>Entropia cruzada média ({ptInt(TOTAL)} clientes)</dt>
              <dd className="mono">{pt(loss, 4)}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="widget-detail">
        <p className="widget-detail-title">
          {isFit
            ? `Este é o mínimo da entropia cruzada: β₀ = ${pt(fit.b0, 3)} e β₁ = ${pt(fit.b1, 5)}.`
            : `A entropia cruzada é ${pt(loss, 4)}; o mínimo, com máxima verosimilhança, é ${pt(lossMin, 4)}.`}
        </p>
        <p>
          Mais 100 dólares de saldo multiplicam as chances por {pt(or100, 3)}, seja qual for o saldo: com {ptInt(x)} $, as chances passam de {fmtOdds(o)} para{" "}
          {fmtOdds(odds(p2))}, e a probabilidade de {pt(100 * p, 1)}% para {pt(100 * p2, 1)}%. A razão de chances é constante; a variação da probabilidade
          não, porque depende de onde se está na sigmoide.
        </p>
      </div>
    </div>
  );
}
