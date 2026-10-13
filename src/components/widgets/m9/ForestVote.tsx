import React, { useMemo, useState } from "react";
import { Seg } from "../../ui";
import { Plot, pathOf, pct } from "./charts";
import { accuracyCurve, agreement, growForest, leaves, oobCurve, predictions, unpack, type Point, type Tree } from "./forest";
import { MOONS_TEST, MOONS_TRAIN } from "./moons";

// Bagging e random forests (secção 2) nas duas luas da figura 04-fronteiras.png: 300 pontos de treino e 400 de teste.
// Cada árvore cresce sem limite numa reamostragem bootstrap; a floresta faz votar as árvores. As árvores e os sorteios
// são calculados no browser (o gerador não é o do NumPy), com resultados médios iguais aos do RandomForestClassifier.

const N_TREES = 200;
const X0 = -2;
const X1 = 3;
const Y0 = -1.6;
const Y1 = 2.1;
const NX = 75;
const NY = 56;
const W = 360;
const H = Math.round((W * (Y1 - Y0)) / (X1 - X0));

type Mode = "bag" | "rf";
const MODES: { id: Mode; label: string; mf: number }[] = [
  { id: "bag", label: "Bagging", mf: 2 },
  { id: "rf", label: "Random forest", mf: 1 },
];

const TRAIN = unpack(MOONS_TRAIN);
const TEST = unpack(MOONS_TEST);
const GRID: Point[] = [];
for (let r = 0; r < NY; r++) for (let c = 0; c < NX; c++) GRID.push([X0 + ((c + 0.5) * (X1 - X0)) / NX, Y1 - ((r + 0.5) * (Y1 - Y0)) / NY]);

type Built = {
  trees: Tree[];
  /** previsões de cada árvore na grelha do mapa: só se calculam quando o modo é mostrado (ver gridOf) */
  grid: Uint8Array[] | null;
  test: Uint8Array[];
  acc: number[];
  oob: number[];
  single: number;
  agree: number;
};

function build(mf: number, seed: number): Built {
  const trees = growForest(TRAIN, N_TREES, mf, seed);
  const test = predictions(trees, TEST.X);
  const acc = accuracyCurve(test, TEST.y);
  const single = test.reduce((s, p) => s + p.reduce((a, v, j) => a + (v === TEST.y[j] ? 1 : 0), 0) / TEST.y.length, 0) / N_TREES;
  return { trees, grid: null, test, acc, oob: oobCurve(trees, TRAIN), single, agree: agreement(test.slice(0, 50)) };
}

// A grelha do mapa custa tanto como crescer a floresta (200 árvores × 4200 células): calcula-se só para o modo que
// está a ser mostrado, uma vez, e fica guardada no próprio objeto (que é o mesmo enquanto a semente não muda).
function gridOf(b: Built): Uint8Array[] {
  if (b.grid === null) b.grid = predictions(b.trees, GRID);
  return b.grid;
}

export function ForestVote() {
  const [mode, setMode] = useState<Mode>("rf");
  const [view, setView] = useState("one");
  const [k, setK] = useState(25);
  const [t, setT] = useState(0);
  const [seed, setSeed] = useState(1);
  const both = useMemo(() => ({ bag: build(2, seed * 7919 + 2), rf: build(1, seed * 7919 + 1) }), [seed]);
  const cur = both[mode];
  const tree = cur.trees[t];

  // classe de cada célula da grelha: uma árvore, ou a votação das primeiras k
  const cells = useMemo(() => {
    const grid = gridOf(cur);
    if (view === "one") return grid[t];
    const out = new Uint8Array(GRID.length);
    for (let j = 0; j < GRID.length; j++) {
      let v = 0;
      for (let q = 0; q < k; q++) v += grid[q][j];
      out[j] = v * 2 > k ? 1 : 0;
    }
    return out;
  }, [cur, view, k, t]);

  const distinct = tree.counts.filter((c) => c > 0).length;
  const treeAcc = cur.test[t].reduce((a, v, j) => a + (v === TEST.y[j] ? 1 : 0), 0) / TEST.y.length;

  return (
    <div className="m9-wid">
      <div className="m9-controls">
        <Seg label="Tipo de ensemble" value={mode} onChange={(v) => setMode(v as Mode)} options={MODES.map((m) => ({ id: m.id, label: m.label }))} />
        <Seg
          label="O que mostrar"
          value={view}
          onChange={setView}
          options={[
            { id: "one", label: "Uma árvore" },
            { id: "vote", label: "A votação" },
          ]}
        />
      </div>
      <p className="small muted">
        {mode === "bag"
          ? "Bagging: cada árvore cresce numa reamostragem bootstrap e, em cada nó, pode escolher entre as duas variáveis."
          : "Random forest: além da reamostragem, cada nó só pode usar uma variável sorteada (√2 arredondado para baixo, como no scikit-learn)."}
      </p>

      <RegionMap cells={cells} counts={view === "one" ? tree.counts : null} />
      <p className="small muted">
        <span className="m9-key m9-key-c1" aria-hidden="true" /> classe 1 · <span className="m9-key m9-key-c0" aria-hidden="true" /> classe 0 · as zonas
        sombreadas são a previsão {view === "one" ? `da árvore ${t + 1}` : `da votação de ${k} ${k === 1 ? "árvore" : "árvores"}`}
        {view === "one" && (
          <>
            {" "}
            · <span className="m9-key m9-key-oob" aria-hidden="true" /> pontos fora do saco (a árvore não os viu)
          </>
        )}
      </p>

      {view === "one" ? (
        <>
          <label className="m9-slider">
            <span className="small muted">
              Árvore <span className="mono">{t + 1}</span> de {N_TREES}
            </span>
            <input
              type="range"
              className="m9-range"
              min={0}
              max={N_TREES - 1}
              step={1}
              value={t}
              onChange={(e) => setT(Number(e.target.value))}
              aria-label="Árvore a mostrar"
              aria-valuetext={`Árvore ${t + 1}`}
            />
          </label>
          <div className="row gap-sm wrap">
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setT((t + 1) % N_TREES)}>
              Outra árvore
            </button>
          </div>
          <div className="m9-stats">
            <Stat label="Exemplos distintos na reamostragem" value={`${distinct} de ${TRAIN.y.length}`} />
            <Stat label="Fora do saco" value={pct(1 - distinct / TRAIN.y.length, 0)} />
            <Stat label="Folhas" value={String(leaves(tree.root))} />
            <Stat label="Exatidão no teste" value={pct(treeAcc)} />
          </div>
          <p className="small muted">
            Cada árvore decora a sua reamostragem: fronteiras em degraus, com pequenas ilhas à volta de pontos isolados. Mude de árvore e veja como a fronteira
            muda de uma reamostragem para a outra: é a variância das árvores.
          </p>
        </>
      ) : (
        <>
          <label className="m9-slider">
            <span className="small muted">
              Número de árvores a votar <span className="mono">{k}</span>
            </span>
            <input
              type="range"
              className="m9-range"
              min={1}
              max={N_TREES}
              step={1}
              value={k}
              onChange={(e) => setK(Number(e.target.value))}
              aria-label="Número de árvores a votar"
            />
          </label>
          <div className="m9-pills" role="group" aria-label="Números de árvores de exemplo">
            {[1, 5, 25, 200].map((v) => (
              <button key={v} type="button" className={`pill mono ${v === k ? "is-on" : ""}`} aria-pressed={v === k} onClick={() => setK(v)}>
                {v}
              </button>
            ))}
          </div>
          <div className="m9-stats">
            <Stat label="Exatidão no teste" value={pct(cur.acc[k - 1])} />
            <Stat label="Exatidão fora do saco" value={Number.isNaN(cur.oob[k - 1]) ? "—" : pct(cur.oob[k - 1])} />
            <Stat label="Uma árvore, em média" value={pct(cur.single)} />
          </div>
          <AccPlot both={both} mode={mode} k={k} />
          <p className="small muted">
            <span className="m9-key m9-key-fit" aria-hidden="true" /> {mode === "rf" ? "random forest" : "bagging"} ·{" "}
            <span className="m9-key m9-key-ref r1" aria-hidden="true" /> {mode === "rf" ? "bagging" : "random forest"}. Com poucas árvores, a exatidão salta; com
            mais, estabiliza. Juntar árvores não piora: só torna o treino mais lento.
          </p>
        </>
      )}

      <div className="table-wrap">
        <table className="m9-tbl">
          <caption className="sr-only">Bagging e random forest com 200 árvores, nos 400 pontos de teste</caption>
          <thead>
            <tr>
              <th scope="col" />
              <th scope="col" className="m9-num">
                Uma árvore, em média
              </th>
              <th scope="col" className="m9-num">
                Concordância entre árvores
              </th>
              <th scope="col" className="m9-num">
                Floresta de 200
              </th>
              <th scope="col" className="m9-num">
                Fora do saco
              </th>
            </tr>
          </thead>
          <tbody>
            {MODES.map((m) => {
              const b = both[m.id];
              return (
                <tr key={m.id} className={m.id === mode ? "is-win" : ""}>
                  <td>{m.label}</td>
                  <td className="m9-num mono">{pct(b.single)}</td>
                  <td className="m9-num mono">{pct(b.agree)}</td>
                  <td className="m9-num mono">{pct(b.acc[N_TREES - 1])}</td>
                  <td className="m9-num mono">{pct(b.oob[N_TREES - 1])}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="small muted">
        Exatidões no teste (400 pontos novos) e fora do saco. A concordância é a fração de pontos de teste em que duas árvores dão a mesma classe, em média, entre
        as primeiras 50. Na random forest, cada árvore sozinha é um pouco pior e as árvores concordam menos entre si, mas a votação fica melhor: a média de
        coisas menos correlacionadas reduz mais a variância. O fora do saco usa só os 300 pontos de treino, cada um previsto por cerca de 37% das árvores: é uma estimativa com mais ruído do que o teste e pode ordenar os dois ao contrário.
      </p>
      <div className="row gap-sm wrap">
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSeed(seed + 1)}>
          Novas reamostragens
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="m9-stat">
      <span className="small muted">{label}</span>
      <span className="m9-stat-val mono">{value}</span>
    </div>
  );
}

function RegionMap({ cells, counts }: { cells: Uint8Array; counts: number[] | null }) {
  const cw = W / NX;
  const ch = H / NY;
  const sx = (v: number) => ((v - X0) / (X1 - X0)) * W;
  const sy = (v: number) => ((Y1 - v) / (Y1 - Y0)) * H;
  // um caminho por classe, juntando as células seguidas de cada linha (um só elemento por classe, para a
  // transparência não se somar onde as células se tocam)
  const d = ["", ""];
  for (let r = 0; r < NY; r++) {
    let c = 0;
    while (c < NX) {
      const cls = cells[r * NX + c];
      let e = c + 1;
      while (e < NX && cells[r * NX + e] === cls) e++;
      d[cls] += `M${(c * cw).toFixed(2)},${(r * ch).toFixed(2)}h${((e - c) * cw).toFixed(2)}v${(ch + 0.05).toFixed(2)}h${(-(e - c) * cw).toFixed(2)}z`;
      c = e;
    }
  }
  return (
    <svg
      className="m9-plot"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="As duas luas: 300 pontos de treino de duas classes e as zonas que o modelo atribui a cada classe"
    >
      <path className="m9-region c0" d={d[0]} />
      <path className="m9-region c1" d={d[1]} />
      {TRAIN.X.map((p, i) => {
        const oob = counts !== null && counts[i] === 0;
        const cls = TRAIN.y[i];
        const cn = `m9-dot ${cls ? "is-hi" : "is-lo"} ${oob ? "is-oob" : ""}`;
        return cls ? (
          <circle key={i} className={cn} cx={sx(p[0])} cy={sy(p[1])} r={2.6} />
        ) : (
          <rect key={i} className={cn} x={sx(p[0]) - 2.3} y={sy(p[1]) - 2.3} width={4.6} height={4.6} />
        );
      })}
    </svg>
  );
}

function AccPlot({ both, mode, k }: { both: Record<Mode, Built>; mode: Mode; k: number }) {
  const other: Mode = mode === "rf" ? "bag" : "rf";
  const series = (a: number[]) => a.map((v, i) => [i + 1, v] as [number, number]);
  return (
    <Plot
      label="Exatidão no teste em função do número de árvores que votam, para a random forest e para o bagging"
      x={[1, N_TREES]}
      y={[0.75, 0.95]}
      logX
      xTicks={[1, 10, 100, 200]}
      yTicks={[0.75, 0.8, 0.85, 0.9, 0.95]}
      fmtY={(v) => pct(v, 0)}
      xLabel="árvores a votar (escala log)"
      yLabel="exatidão no teste"
      h={180}
    >
      {(sx, sy) => (
        <>
          <path className="m9-ref-line r1" d={pathOf(series(both[other].acc), sx, sy)} />
          <path className="m9-fit" d={pathOf(series(both[mode].acc), sx, sy)} />
          <circle className="m9-pt is-cur" cx={sx(k)} cy={sy(both[mode].acc[k - 1])} r={4.5} />
        </>
      )}
    </Plot>
  );
}

