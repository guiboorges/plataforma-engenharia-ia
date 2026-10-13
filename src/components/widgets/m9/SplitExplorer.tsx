import React, { useMemo, useState } from "react";
import { Chip, Seg } from "../../ui";
import { Plot, num } from "./charts";
import { FEATURES, STORES, bestPerFeature, column, labels, scan, winner, type Crit, type FeatureId } from "./split";

// Como o CART escolhe um corte (secção 1): 30 lojas do Carseats, uma variável de cada vez. Desloca-se o corte e vê-se a
// impureza de cada lado e a média pesada; o melhor corte de cada variável e o vencedor coincidem com o
// DecisionTreeClassifier(max_depth=1) do scikit-learn.

const CRITS: { id: Crit; label: string }[] = [
  { id: "gini", label: "Gini" },
  { id: "entropy", label: "Entropia" },
];

const W = 360;
const LEFT = 52;
const STEP = 9; // distância entre pontos empilhados

const fmtVal = (f: FeatureId, v: number) => (f === "good" ? (v ? "sim" : "não") : num(v, 0));
const fmtCut = (v: number) => num(v, Number.isInteger(v) ? 0 : 1);
const cutText = (f: FeatureId, t: number, side: "l" | "r") => {
  const lab = FEATURES.find((x) => x.id === f)!.label;
  if (f === "good") return side === "l" ? "Prateleira não boa" : "Prateleira boa";
  return `${lab} ${side === "l" ? "≤" : ">"} ${fmtCut(t)}`;
};

export function SplitExplorer() {
  const [feat, setFeat] = useState<FeatureId>("price");
  const [crit, setCrit] = useState<Crit>("gini");
  const ys = useMemo(() => labels(), []);
  const xs = useMemo(() => column(feat), [feat]);
  const { splits, best } = useMemo(() => scan(xs, ys, crit), [xs, ys, crit]);
  const [pos, setPos] = useState<Record<FeatureId, number>>({ price: 14, adv: 4, age: 12, good: 0 });
  const i = Math.min(pos[feat], splits.length - 1);
  const s = splits[i];
  const table = useMemo(() => bestPerFeature(crit), [crit]);
  const win = useMemo(() => winner(crit), [crit]);
  const lab = FEATURES.find((f) => f.id === feat)!;
  const setI = (k: number) => setPos({ ...pos, [feat]: k });
  const impName = crit === "gini" ? "Gini" : "entropia";

  return (
    <div className="m9-wid">
      <div className="m9-controls">
        <Seg label="Variável" value={feat} onChange={(v) => setFeat(v as FeatureId)} options={FEATURES.map((f) => ({ id: f.id, label: f.label }))} />
        <Seg label="Medida de impureza" value={crit} onChange={(v) => setCrit(v as Crit)} options={CRITS} />
      </div>

      <Strip feat={feat} xs={xs} ys={ys} cut={s.t} />

      <label className="m9-slider">
        <span className="small muted">
          Corte: <span className="mono">{cutText(feat, s.t, "l")}</span> à esquerda, <span className="mono">{cutText(feat, s.t, "r")}</span> à direita
          {i === best && (
            <>
              {" "}
              · <span className="m9-best-tag">o melhor para esta variável</span>
            </>
          )}
        </span>
        <input
          type="range"
          className="m9-range"
          min={0}
          max={splits.length - 1}
          step={1}
          value={i}
          disabled={splits.length < 2}
          onChange={(e) => setI(Number(e.target.value))}
          aria-label={`Posição do corte em ${lab.label}`}
          aria-valuetext={cutText(feat, s.t, "l")}
        />
      </label>
      <div className="row gap-sm wrap">
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0}>
          Corte anterior
        </button>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setI(Math.min(splits.length - 1, i + 1))} disabled={i >= splits.length - 1}>
          Corte seguinte
        </button>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setI(best)} disabled={i === best}>
          Ir para o melhor corte
        </button>
      </div>
      {feat === "good" && <p className="small muted">Uma variável de sim ou não só tem um corte possível.</p>}

      <div className="m9-sides">
        {(["l", "r"] as const).map((side) => {
          const d = side === "l" ? s.left : s.right;
          return (
            <div key={side} className="m9-side">
              <span className="m9-side-title">{cutText(feat, s.t, side)}</span>
              <span className="small muted">
                {d.n} lojas: {d.pos} com vendas altas, {d.n - d.pos} baixas
              </span>
              <span className="m9-side-val mono">
                {impName} = {num(d.imp, 3)}
              </span>
            </div>
          );
        })}
      </div>
      <p className="m9-text">
        Média pesada: ({s.left.n} × {num(s.left.imp, 3)} + {s.right.n} × {num(s.right.imp, 3)}) / {STORES.length} ={" "}
        <strong className="mono">{num(s.weighted, 3)}</strong>. O nó inteiro tem {impName} {num(s.parent, 3)}: este corte reduz a impureza em{" "}
        <strong className="mono">{num(s.gain, 3)}</strong>.
      </p>

      {splits.length > 1 && <Curve feat={feat} splits={splits} cur={i} best={best} crit={crit} onPick={setI} />}

      <div className="table-wrap">
        <table className="m9-tbl">
          <caption className="sr-only">O melhor corte de cada variável</caption>
          <thead>
            <tr>
              <th scope="col">Variável</th>
              <th scope="col">Melhor corte</th>
              <th scope="col" className="m9-num">
                Impureza média
              </th>
              <th scope="col" className="m9-num">
                Redução
              </th>
            </tr>
          </thead>
          <tbody>
            {table.map((r) => (
              <tr key={r.feature} className={r.feature === win ? "is-win" : ""}>
                <td>
                  {FEATURES.find((f) => f.id === r.feature)!.label}
                  {r.feature === win && (
                    <>
                      {" "}
                      <Chip tone="ok">escolha do CART</Chip>
                    </>
                  )}
                </td>
                <td className="mono">{cutText(r.feature, r.split.t, "l")}</td>
                <td className="m9-num mono">{num(r.split.weighted, 3)}</td>
                <td className="m9-num mono">{num(r.split.gain, 3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="small muted">
        O CART experimenta todos os cortes de todas as variáveis e fica com o de menor impureza média. Com estas 30 lojas, ganha o preço, com o Gini e com a
        entropia: o <code>DecisionTreeClassifier(max_depth=1)</code> do scikit-learn escolhe o mesmo corte.
      </p>
    </div>
  );
}

/** As lojas ao longo da variável: vendas altas numa faixa, baixas noutra; o corte é a linha vertical. */
function Strip({ feat, xs, ys, cut }: { feat: FeatureId; xs: number[]; ys: number[]; cut: number }) {
  const lo = Math.min(...xs);
  const hi = Math.max(...xs);
  const pad = feat === "good" ? 0.5 : (hi - lo) * 0.06;
  const x0 = lo - pad;
  const x1 = hi + pad;
  // pontos com o mesmo valor e a mesma classe empilham-se em linhas de até 5
  const groups = new Map<string, number[]>();
  xs.forEach((x, k) => {
    const key = `${ys[k]}|${x}`;
    groups.set(key, [...(groups.get(key) ?? []), k]);
  });
  const perRow = 5;
  const rowsOf = (cls: number) => Math.max(1, ...[...groups.entries()].filter(([k]) => k.startsWith(`${cls}|`)).map(([, v]) => Math.ceil(v.length / perRow)));
  const laneH = (cls: number) => rowsOf(cls) * STEP + 14;
  const hHigh = laneH(1);
  const hLow = laneH(0);
  const T = 8;
  const axisY = T + hHigh + hLow;
  const H = axisY + 22;
  const sx = (v: number) => LEFT + ((v - x0) / (x1 - x0)) * (W - LEFT - 10);
  const pts: { x: number; y: number; cls: number }[] = [];
  groups.forEach((idx, key) => {
    const cls = Number(key.split("|")[0]);
    const base = cls === 1 ? T + hHigh - 9 : T + hHigh + hLow - 9;
    idx.forEach((k, j) => {
      const row = Math.floor(j / perRow);
      const inRow = Math.min(perRow, idx.length - row * perRow);
      const col = j % perRow;
      pts.push({ x: sx(xs[k]) + (col - (inRow - 1) / 2) * STEP, y: base - row * STEP, cls });
    });
  });
  const ticks = feat === "good" ? [0, 1] : niceInts(lo, hi);
  const cx = sx(cut);
  const nHigh = ys.filter((v) => v === 1).length;
  return (
    <svg className="m9-plot" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`As 30 lojas ao longo da variável, ${nHigh} com vendas altas e ${30 - nHigh} com vendas baixas, e o corte em ${fmtCut(cut)}`}>
      <rect className="m9-left-zone" x={LEFT} y={T} width={Math.max(0, cx - LEFT)} height={axisY - T} />
      <line className="m9-grid" x1={LEFT} x2={W - 10} y1={T + hHigh} y2={T + hHigh} />
      <text className="m9-tick" x={LEFT - 6} y={T + hHigh / 2 + 3} textAnchor="end">
        altas
      </text>
      <text className="m9-tick" x={LEFT - 6} y={T + hHigh + hLow / 2 + 3} textAnchor="end">
        baixas
      </text>
      {pts.map((p, k) =>
        p.cls === 1 ? (
          <circle key={k} className="m9-dot is-hi" cx={p.x} cy={p.y} r={3.6} />
        ) : (
          <rect key={k} className="m9-dot is-lo" x={p.x - 3.2} y={p.y - 3.2} width={6.4} height={6.4} />
        ),
      )}
      <line className="m9-axis" x1={LEFT} x2={W - 10} y1={axisY} y2={axisY} />
      {ticks.map((t) => (
        <text key={t} className="m9-tick" x={sx(t)} y={axisY + 13} textAnchor="middle">
          {fmtVal(feat, t)}
        </text>
      ))}
      <line className="m9-cut" x1={cx} x2={cx} y1={T - 4} y2={axisY + 2} />
    </svg>
  );
}

function niceInts(lo: number, hi: number): number[] {
  const span = hi - lo;
  const step = span > 80 ? 20 : span > 40 ? 10 : 5;
  const out: number[] = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) out.push(v);
  return out;
}

/** Impureza média de cada corte candidato desta variável. */
function Curve({
  feat,
  splits,
  cur,
  best,
  crit,
  onPick,
}: {
  feat: FeatureId;
  splits: { t: number; weighted: number; parent: number }[];
  cur: number;
  best: number;
  crit: Crit;
  onPick: (i: number) => void;
}) {
  const ts = splits.map((s) => s.t);
  const lo = ts[0];
  const hi = ts[ts.length - 1];
  const pad = (hi - lo) * 0.04 || 1;
  const parent = splits[0].parent;
  const yMax = crit === "gini" ? 0.55 : 1.1;
  const yTicks = crit === "gini" ? [0, 0.1, 0.2, 0.3, 0.4, 0.5] : [0, 0.25, 0.5, 0.75, 1];
  const lab = FEATURES.find((f) => f.id === feat)!.label;
  return (
    <Plot
      label={`Impureza média de cada corte possível em ${lab}; a linha tracejada é a impureza do nó antes de cortar`}
      x={[lo - pad, hi + pad]}
      y={[0, yMax]}
      xTicks={niceInts(lo, hi)}
      yTicks={yTicks}
      fmtY={(v) => num(v, crit === "gini" ? 1 : 2)}
      xLabel={`limiar (${lab.toLowerCase()})`}
      yLabel={crit === "gini" ? "Gini médio depois do corte" : "entropia média depois do corte"}
      h={190}
    >
      {(sx, sy) => (
        <>
          <line className="m9-ref" x1={sx(lo - pad)} x2={sx(hi + pad)} y1={sy(parent)} y2={sy(parent)} />
          <polyline className="m9-line" points={splits.map((s) => `${sx(s.t)},${sy(s.weighted)}`).join(" ")} />
          {splits.map((s, k) => (
            <circle
              key={k}
              className={`m9-pt ${k === best ? "is-best" : ""} ${k === cur ? "is-cur" : ""}`}
              cx={sx(s.t)}
              cy={sy(s.weighted)}
              r={k === cur ? 4.5 : k === best ? 4 : 2.6}
              onClick={() => onPick(k)}
            />
          ))}
        </>
      )}
    </Plot>
  );
}
