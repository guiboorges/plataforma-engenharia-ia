import React, { useMemo, useState } from "react";
import { Seg } from "../../ui";
import { HistChart, LogLineChart, niceTicks, stepDigits, type Series } from "./charts";
import { DISTS, logPoints, meanBins, runningRate, sampleMeans, type DistId } from "./clt";
import { fmt, histogram, mean, normPdf, pct, skew, std } from "./stats";

// Lei dos grandes números e teorema do limite central (secção 4), simulados no browser com sementes fixas.
// LGN: três lojas com 100 000 visitas cada, cada visita compra com probabilidade 3% (como a figura 02-lgn-tlc.png).
// TLC: 10 000 médias de n observações, com a normal prevista N(μ, σ²/n) por cima.

const TOTAL = 100_000;
const CHECK = [10, 100, 1_000, 10_000, 100_000];
const LINES = ["is-s1", "is-s2", "is-s3"];
const NS = [1, 2, 5, 10, 30, 100];
const REPS = 10_000;

export function LlnClt() {
  const [tab, setTab] = useState("lgn");
  return (
    <div className="m6-lc">
      <Seg
        label="Teorema"
        value={tab}
        onChange={setTab}
        options={[
          { id: "lgn", label: "Lei dos grandes números" },
          { id: "tlc", label: "Limite central" },
        ]}
      />
      {tab === "lgn" ? <Lln /> : <Clt />}
    </div>
  );
}

function Lln() {
  const [round, setRound] = useState(0);
  const pts = useMemo(() => logPoints(TOTAL, 40), []);
  const runs = useMemo(
    () =>
      [1, 2, 3].map((k) => {
        const seed = 100 + round * 3 + k;
        const all = runningRate(0.03, TOTAL, seed, pts);
        return { seed, points: pts.map((x, i) => [x, all[i]] as [number, number]), check: CHECK.map((c) => all[pts.indexOf(c)]) };
      }),
    [round, pts],
  );
  const series: Series[] = runs.map((r, i) => ({ points: r.points, cls: LINES[i], label: `Loja ${i + 1}` }));
  return (
    <>
      <LogLineChart
        series={series}
        xMin={1}
        xMax={TOTAL}
        yMax={0.1}
        refLine={0.03}
        xTicks={[1, 10, 100, 1_000, 10_000, 100_000].map((x) => ({ at: x, label: fmt(x) }))}
        yTicks={[0, 0.05, 0.1].map((y) => ({ at: y, label: pct(y, 0) }))}
        label="Taxa de conversão observada ao longo de 100 000 visitas, em três lojas; a linha tracejada é a probabilidade real, 3%"
      />
      <p className="small muted">
        Eixo horizontal: número de visitas, em escala logarítmica. <span className="m6-key m6-key-ref" aria-hidden="true" /> probabilidade real: 3%. Acima de
        10% a linha fica cortada.
      </p>
      <div className="table-wrap">
        <table className="m6-tbl">
          <thead>
            <tr>
              <th scope="col">Visitas</th>
              {runs.map((_, i) => (
                <th key={i} scope="col" className="m6-num">
                  <span className={`m6-key m6-key-line ${LINES[i]}`} aria-hidden="true" /> Loja {i + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CHECK.map((c, j) => (
              <tr key={c}>
                <td className="mono">{fmt(c)}</td>
                {runs.map((r, i) => (
                  <td key={i} className="m6-num mono">
                    {pct(r.check[j], 2)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="row gap-sm wrap">
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setRound(round + 1)}>
          Outras três lojas
        </button>
      </div>
      <p className="small muted">Com 10 ou 100 visitas, as lojas parecem muito diferentes; só com milhares de visitas a taxa observada se aproxima dos 3%.</p>
    </>
  );
}

function Clt() {
  const [dist, setDist] = useState<DistId>("encomendas");
  const [n, setN] = useState(1);
  const [seed, setSeed] = useState(3);
  const d = DISTS[dist];
  const se = d.sigma / Math.sqrt(n);
  const sim = useMemo(() => {
    const m = sampleMeans(d, n, REPS, seed * 1009 + n);
    const b = meanBins(d, n);
    const h = histogram(m, b.lo, b.hi, b.bins);
    return { mean: mean(m), sd: std(m), skew: skew(m), h, b };
  }, [d, n, seed]);
  const curve: [number, number][] = Array.from({ length: 121 }, (_, i) => {
    const x = sim.b.lo + ((sim.b.hi - sim.b.lo) * i) / 120;
    return [x, normPdf(x, d.mu, se)];
  });
  const yMax = Math.max(...sim.h.density, normPdf(d.mu, d.mu, se)) * 1.08;
  const dig = dist === "compra" ? 3 : 2;
  const unit = d.unit ? ` ${d.unit}` : "";
  const xfmt = (x: number, step: number) => (dist === "compra" ? pct(x, Math.max(0, stepDigits(step * 100))) : fmt(x, stepDigits(step)));
  return (
    <>
      <div className="m6-presets" role="group" aria-label="Distribuição de partida">
        {(Object.keys(DISTS) as DistId[]).map((k) => (
          <button key={k} type="button" className={`pill ${dist === k ? "is-on" : ""}`} aria-pressed={dist === k} onClick={() => setDist(k)}>
            {DISTS[k].label}
          </button>
        ))}
      </div>
      <div className="m6-ns">
        <span className="small muted">Média de n observações:</span>
        <div className="m6-presets" role="group" aria-label="n">
          {NS.map((k) => (
            <button key={k} type="button" className={`pill mono ${n === k ? "is-on" : ""}`} aria-pressed={n === k} onClick={() => setN(k)}>
              n = {k}
            </button>
          ))}
        </div>
      </div>
      <HistChart
        edges={sim.h.edges}
        heights={sim.h.density}
        lo={sim.b.lo}
        hi={sim.b.hi}
        yMax={yMax}
        curve={curve}
        ticks={niceTicks(sim.b.lo, sim.b.hi, xfmt).filter((t) => t.at >= d.min && t.at <= d.max)}
        label={`Histograma de ${fmt(REPS)} médias de ${n} observações, com a normal prevista pelo teorema do limite central`}
      />
      <p className="small muted">
        <span className="m6-key m6-key-bar" aria-hidden="true" /> {fmt(REPS)} médias simuladas · <span className="m6-key m6-key-curve" aria-hidden="true" />{" "}
        normal prevista pelo TLC, com média {fmt(d.mu, dig)} e erro padrão σ/√n = {fmt(se, dig)}
        {unit}
      </p>
      <div className="table-wrap">
        <table className="m6-tbl">
          <thead>
            <tr>
              <th scope="col" />
              <th scope="col" className="m6-num">
                Simulado
              </th>
              <th scope="col" className="m6-num">
                Previsto
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Média das médias</td>
              <td className="m6-num mono">{fmt(sim.mean, dig)}</td>
              <td className="m6-num mono">μ = {fmt(d.mu, dig)}</td>
            </tr>
            <tr>
              <td>Desvio padrão das médias</td>
              <td className="m6-num mono">{fmt(sim.sd, dig)}</td>
              <td className="m6-num mono">σ/√n = {fmt(se, dig)}</td>
            </tr>
            <tr>
              <td>Assimetria</td>
              <td className="m6-num mono">{fmt(sim.skew, 2)}</td>
              <td className="m6-num mono">0 numa normal</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="row gap-sm wrap">
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSeed(seed + 1)}>
          Nova simulação
        </button>
      </div>
      <p className="small muted">{NOTE[dist]}</p>
    </>
  );
}

const NOTE: Record<DistId, string> = {
  encomendas: "Uma encomenda sozinha é muito assimétrica: muitas pequenas e algumas grandes. A média de 30 já é quase normal, e o desvio padrão cai como σ/√n.",
  compra:
    "Com um acontecimento raro (3%), a média de 30 visitas ainda é muito assimétrica: na maior parte das vezes 0 ou 1 compra. Quanto mais rara a compra, mais observações o TLC precisa.",
};
