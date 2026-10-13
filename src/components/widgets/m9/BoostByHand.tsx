import React, { useMemo, useState } from "react";
import { Seg } from "../../ui";
import { BIKES, HOURS, boost, type BoostRun } from "./boost";
import { Plot, num, pathOf } from "./charts";

// Gradient boosting à mão (secção 3): a procura média por hora do Bikeshare, uma variável (a hora), árvores de um só
// corte ajustadas aos resíduos. As previsões são as do GradientBoostingRegressor(max_depth=1) do scikit-learn.

const MAX = 200;
const REF_RATES = [0.3, 0.1, 0.03];
const PRESETS = [3, 10, 30, 100]; // η × 100
type DataId = "util" | "fds";

export function BoostByHand() {
  const [data, setData] = useState<DataId>("util");
  const [etaI, setEtaI] = useState(30);
  const [m, setM] = useState(0);
  const eta = etaI / 100;
  const y = BIKES[data];
  const run = useMemo(() => boost(HOURS, y, eta, MAX), [y, eta]);
  const refs = useMemo(() => REF_RATES.map((r) => ({ r, run: boost(HOURS, y, r, MAX) })), [y]);
  const preds = run.preds[m];
  const last = m > 0 ? run.stumps[m - 1] : null;
  const shown = run.stumps.slice(Math.max(0, m - 4), m).map((s, k) => ({ s, n: Math.max(0, m - 4) + k + 1 })).reverse();

  return (
    <div className="m9-wid">
      <div className="m9-controls">
        <Seg
          label="Dados"
          value={data}
          onChange={(v) => {
            setData(v as DataId);
            setM(0);
          }}
          options={[
            { id: "util", label: "Dias úteis" },
            { id: "fds", label: "Fins de semana e feriados" },
          ]}
        />
      </div>

      <FitPlot y={y} preds={preds} cut={last?.t} />
      <p className="small muted">
        <span className="m9-key m9-key-dot" aria-hidden="true" /> utilizadores por hora (média de 2011) ·{" "}
        <span className="m9-key m9-key-fit" aria-hidden="true" /> modelo depois de {m} {m === 1 ? "árvore" : "árvores"} ·{" "}
        <span className="m9-key m9-key-res" aria-hidden="true" /> resíduos, que a árvore seguinte vai tentar prever
      </p>

      <div className="m9-two">
        <div className="m9-col">
          <label className="m9-slider">
            <span className="small muted">
              Taxa de aprendizagem <span className="mono">η = {num(eta, 2)}</span>
            </span>
            <input
              type="range"
              className="m9-range"
              min={1}
              max={100}
              step={1}
              value={etaI}
              onChange={(e) => setEtaI(Number(e.target.value))}
              aria-label="Taxa de aprendizagem η"
              aria-valuetext={num(eta, 2)}
            />
          </label>
          <div className="m9-pills" role="group" aria-label="Taxas de exemplo">
            {PRESETS.map((p) => (
              <button key={p} type="button" className={`pill mono ${p === etaI ? "is-on" : ""}`} aria-pressed={p === etaI} onClick={() => setEtaI(p)}>
                {num(p / 100, p < 10 ? 2 : p < 100 ? 1 : 0)}
              </button>
            ))}
          </div>
        </div>
        <div className="m9-col">
          <label className="m9-slider">
            <span className="small muted">
              Número de árvores <span className="mono">m = {m}</span>
            </span>
            <input
              type="range"
              className="m9-range"
              min={0}
              max={MAX}
              step={1}
              value={m}
              onChange={(e) => setM(Number(e.target.value))}
              aria-label="Número de árvores"
            />
          </label>
          <div className="row gap-sm wrap">
            <button type="button" className="btn btn-primary btn-sm" onClick={() => setM(Math.min(MAX, m + 1))} disabled={m >= MAX}>
              Mais uma árvore
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setM(Math.min(MAX, m + 10))} disabled={m >= MAX}>
              Mais 10
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setM(0)} disabled={m === 0}>
              Recomeçar
            </button>
          </div>
        </div>
      </div>

      <p className="m9-text">
        {m === 0 ? (
          <>
            O modelo começa com F₀ = média de todas as horas = <strong className="mono">{num(run.f0, 1)}</strong> utilizadores. Os resíduos são o que falta
            explicar. Junte a primeira árvore.
          </>
        ) : (
          <>
            Árvore {m}: <span className="mono">hora ≤ {num(last!.t, 1)}</span> prevê {num(last!.left, 1)} para a esquerda e {num(last!.right, 1)} para a
            direita, a média dos resíduos de cada lado; entra no modelo multiplicada por η = {num(eta, 2)}. Erro de treino (RMSE):{" "}
            <strong className="mono">{num(run.rmse[m], 1)}</strong>, contra {num(run.rmse[0], 1)} com F₀.
          </>
        )}
      </p>

      {shown.length > 0 && (
        <div className="table-wrap">
          <table className="m9-tbl">
            <caption className="sr-only">As últimas árvores juntadas ao modelo</caption>
            <thead>
              <tr>
                <th scope="col">Árvore</th>
                <th scope="col">Corte</th>
                <th scope="col" className="m9-num">
                  η · esquerda
                </th>
                <th scope="col" className="m9-num">
                  η · direita
                </th>
                <th scope="col" className="m9-num">
                  RMSE depois
                </th>
              </tr>
            </thead>
            <tbody>
              {shown.map(({ s, n }) => (
                <tr key={n}>
                  <td className="mono">{n}</td>
                  <td className="mono">hora ≤ {num(s.t, 1)}</td>
                  <td className="m9-num mono">{num(eta * s.left, 1)}</td>
                  <td className="m9-num mono">{num(eta * s.right, 1)}</td>
                  <td className="m9-num mono">{num(run.rmse[n], 1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <RmsePlot run={run} refs={refs} m={m} eta={eta} />
      <p className="small muted">
        <span className="m9-key m9-key-fit" aria-hidden="true" /> η = {num(eta, 2)} ·{" "}
        {REF_RATES.map((r, k) => (
          <React.Fragment key={r}>
            <span className={`m9-key m9-key-ref r${k}`} aria-hidden="true" /> {num(r, 2)}
            {k < REF_RATES.length - 1 ? " · " : ""}
          </React.Fragment>
        ))}
        . Com uma taxa pequena, cada árvore dá um passo pequeno e são precisas muitas mais árvores para o mesmo erro.
      </p>
      <p className="small muted">
        Aqui só se vê o erro de treino, que nunca sobe: cada árvore nova ajusta-se um pouco mais aos mesmos 24 pontos. Em dados novos, como na figura acima, o erro acaba por voltar
        a subir; é por isso que o número de árvores se escolhe por validação, com paragem antecipada. As previsões são as do{" "}
        <code>GradientBoostingRegressor(max_depth=1, learning_rate=η)</code> do scikit-learn, etapa a etapa.
      </p>
    </div>
  );
}

function FitPlot({ y, preds, cut }: { y: number[]; preds: number[]; cut?: number }) {
  const step: [number, number][] = [];
  HOURS.forEach((h, i) => {
    step.push([h - 0.5, preds[i]], [h + 0.5, preds[i]]);
  });
  return (
    <Plot
      label="Utilizadores por hora e o modelo de boosting, uma função em degraus da hora"
      x={[-0.5, 23.5]}
      y={[0, 420]}
      xTicks={[0, 4, 8, 12, 16, 20]}
      yTicks={[0, 100, 200, 300, 400]}
      xLabel="hora do dia"
      yLabel="utilizadores por hora"
      h={210}
    >
      {(sx, sy) => (
        <>
          {cut !== undefined && <line className="m9-cut" x1={sx(cut)} x2={sx(cut)} y1={sy(420)} y2={sy(0)} />}
          {HOURS.map((h, i) => (
            <line key={`r${h}`} className="m9-res" x1={sx(h)} x2={sx(h)} y1={sy(y[i])} y2={sy(preds[i])} />
          ))}
          <path className="m9-fit" d={pathOf(step, sx, sy)} />
          {HOURS.map((h, i) => (
            <circle key={h} className="m9-dot is-hi" cx={sx(h)} cy={sy(y[i])} r={3.2} />
          ))}
        </>
      )}
    </Plot>
  );
}

function RmsePlot({ run, refs, m, eta }: { run: BoostRun; refs: { r: number; run: BoostRun }[]; m: number; eta: number }) {
  const yMax = Math.ceil(run.rmse[0] / 20) * 20;
  const ticks = Array.from({ length: yMax / 20 + 1 }, (_, k) => k * 20).filter((_, k, a) => a.length <= 6 || k % 2 === 0);
  const series = (r: BoostRun) => r.rmse.slice(1).map((v, k) => [k + 1, v] as [number, number]);
  return (
    <Plot
      label={`Erro de treino em função do número de árvores, para η = ${num(eta, 2)} e para as três taxas da aula`}
      x={[1, MAX]}
      y={[0, yMax]}
      logX
      xTicks={[1, 10, 100, 200]}
      yTicks={ticks}
      xLabel="número de árvores (escala log)"
      yLabel="RMSE de treino"
      h={190}
    >
      {(sx, sy) => (
        <>
          {refs.map((f, k) => (
            <path key={f.r} className={`m9-ref-line r${k}`} d={pathOf(series(f.run), sx, sy)} />
          ))}
          <path className="m9-fit" d={pathOf(series(run), sx, sy)} />
          {m > 0 && <circle className="m9-pt is-cur" cx={sx(m)} cy={sy(run.rmse[m])} r={4.5} />}
        </>
      )}
    </Plot>
  );
}
