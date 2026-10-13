import React, { useId, useMemo, useState } from "react";
import { Checkbox, Seg } from "../../ui";
import { PENGUINS, SPECIES } from "./data";
import { ari, assign, inertia, initPlusPlus, initRandom, makeRng, silhouette, standardize, update, type Pt } from "./kmeans";
import { bounds, equalScale, groupStyle, markerPath, pt, Swatch } from "./plot";

// k-means passo a passo nos 342 pinguins da secção 1, com duas medidas de cada vez (para se poder desenhar).
// Escolhe-se k e o início (k-means++ ou aleatório); depois alterna-se "atribuir" e "mover os centros" e vê-se a
// inércia descer até nada mudar. Cada início diferente pode acabar noutro mínimo local: os resultados ficam numa
// tabela, com o ARI em relação às espécies. Sem padronizar, o k-means mede em milímetros e gramas; o desenho
// usa sempre as variáveis padronizadas, para se ver a forma dos grupos.

const PAIRS = [
  { id: "bico", label: "Comprimento × profundidade do bico", cols: [0, 1], names: ["Comprimento do bico (mm)", "Profundidade do bico (mm)"] },
  { id: "massa", label: "Comprimento do bico × massa", cols: [0, 3], names: ["Comprimento do bico (mm)", "Massa corporal (g)"] },
];
const SP_NAMES: Record<string, string> = { A: "Adelie", C: "Chinstrap", G: "Gentoo" };
const SP_ORDER = ["A", "C", "G"];
const W = 480;
const PAD = 14;

type Run = {
  key: string;
  centers: Pt[];
  trail: Pt[][];
  labels: number[] | null;
  /** inércia depois de cada passo */
  steps: { what: "atribuir" | "mover"; w: number }[];
  next: "atribuir" | "mover";
  iter: number;
  done: boolean;
};
type Result = { seed: number; init: string; w: number; ari: number; iter: number };

function initRun(key: string, pts: Pt[], k: number, kind: string, seed: number): Run {
  const rng = makeRng(seed);
  const centers = kind === "pp" ? initPlusPlus(pts, k, rng) : initRandom(pts, k, rng);
  return { key, centers, trail: centers.map((c) => [c]), labels: null, steps: [], next: "atribuir", iter: 0, done: false };
}

function step(run: Run, pts: Pt[]): Run {
  if (run.done) return run;
  if (run.next === "atribuir") {
    const labels = assign(pts, run.centers);
    if (run.labels && labels.every((l, i) => l === run.labels![i])) return { ...run, done: true };
    return { ...run, labels, steps: [...run.steps, { what: "atribuir", w: inertia(pts, labels, run.centers) }], next: "mover" };
  }
  const centers = update(pts, run.labels!, run.centers);
  return {
    ...run,
    centers,
    trail: run.trail.map((t, k) => [...t, centers[k]]),
    steps: [...run.steps, { what: "mover", w: inertia(pts, run.labels!, centers) }],
    next: "atribuir",
    iter: run.iter + 1,
  };
}

export function KMeansStepper() {
  const uid = useId().replace(/:/g, "");
  const [pairId, setPairId] = useState("bico");
  const [stdz, setStdz] = useState(true);
  const [k, setK] = useState(3);
  const [kind, setKind] = useState("pp");
  const [seed, setSeed] = useState(0);
  const [showSp, setShowSp] = useState(false);
  const pair = PAIRS.find((p) => p.id === pairId)!;

  const data = useMemo(() => {
    const raw: Pt[] = PENGUINS.map((r) => pair.cols.map((c) => r[c]));
    const s = standardize(raw);
    return { raw, ...s };
  }, [pair]);
  const pts = stdz ? data.z : data.raw;
  // centros para o desenho (sempre em unidades padronizadas)
  const toStd = (c: Pt): Pt => (stdz ? c : c.map((v, j) => (v - data.mean[j]) / data.std[j]));

  const key = `${pairId}|${stdz}|${k}|${kind}|${seed}`;
  const groupKey = `${pairId}|${stdz}|${k}`;
  const fresh = useMemo(() => initRun(key, pts, k, kind, seed), [key]); // pts, k, kind e seed entram na chave
  const [runState, setRun] = useState<Run>(fresh);
  const run = runState.key === key ? runState : fresh;
  const [results, setResults] = useState<{ key: string; list: Result[] }>({ key: groupKey, list: [] });
  const list = results.key === groupKey ? results.list : [];

  const finish = (r: Run) => {
    setRun(r);
    if (r.done && r.labels) {
      const res: Result = { seed, init: kind, w: r.steps[r.steps.length - 1].w, ari: ari(SPECIES, r.labels), iter: r.iter };
      setResults({ key: groupKey, list: [...list.filter((x) => !(x.seed === seed && x.init === kind)), res] });
    }
  };
  const doStep = () => finish(step(run, pts));
  const doAll = () => {
    let r = run;
    for (let i = 0; i < 1000 && !r.done; i++) r = step(r, pts);
    finish(r);
  };

  const sil = useMemo(() => (run.done && run.labels ? silhouette(pts, run.labels) : NaN), [run.done, key]);
  const lastW = run.steps.length ? run.steps[run.steps.length - 1].w : null;
  // padronizado: duas casas (há soluções diferentes com inércias quase iguais); sem padronizar, mm² + g², inteiros
  const fmtW = (w: number) => (stdz ? pt(w, 2) : Math.round(w).toLocaleString("pt-PT"));

  // ---- desenho
  const xs = bounds(data.z.map((p) => p[0]));
  const ys = bounds(data.z.map((p) => p[1]));
  const sc = equalScale(xs, ys, W, PAD);
  const counts = run.labels ? Array.from({ length: k }, (_, g) => run.labels!.filter((l) => l === g).length) : null;
  const best = list.length ? Math.min(...list.map((r) => r.w)) : null;

  const sortedList = [...list].sort((a, b) => a.w - b.w || a.seed - b.seed);
  const nextLabel = run.next === "atribuir" ? "Atribuir os pontos" : "Mover os centros";

  return (
    <div className="m10-km">
      <div className="m10-controls">
        <Seg label="Medidas" value={pairId} onChange={setPairId} options={PAIRS.map((p) => ({ id: p.id, label: p.label }))} />
        <div className="row gap-sm wrap center-y">
          <span className="small muted">Número de grupos</span>
          <Seg label="Número de grupos, k" value={String(k)} onChange={(v) => setK(Number(v))} options={[2, 3, 4, 5, 6].map((n) => ({ id: String(n), label: `k = ${n}` }))} />
        </div>
        <div className="row gap-sm wrap center-y">
          <span className="small muted">Início</span>
          <Seg
            label="Centros iniciais"
            value={kind}
            onChange={setKind}
            options={[
              { id: "pp", label: "k-means++" },
              { id: "random", label: "Aleatório" },
            ]}
          />
        </div>
        <div className="row gap-sm wrap">
          <Checkbox id={`${uid}-std`} checked={stdz} onChange={setStdz} label="Padronizar as duas medidas" />
          <Checkbox id={`${uid}-sp`} checked={showSp} onChange={setShowSp} label="Mostrar as espécies" />
        </div>
      </div>

      <div className="m10-plotwrap">
        <svg
          className="m10-plot"
          viewBox={`0 0 ${W} ${sc.height}`}
          role="img"
          aria-label={`Os 342 pinguins: ${pair.names[0]} no eixo horizontal e ${pair.names[1]} no vertical, padronizados. ${
            showSp ? "Forma de cada ponto: a espécie." : run.labels ? `Forma de cada ponto: o grupo do k-means (${k} grupos).` : "Ainda sem grupos."
          } Os centros estão marcados com um ×.`}
        >
          <line className="m10-axis0" x1={sc.X(0)} x2={sc.X(0)} y1={0} y2={sc.height} />
          <line className="m10-axis0" x1={0} x2={W} y1={sc.Y(0)} y2={sc.Y(0)} />
          {data.z.map((p, i) => {
            const g = showSp ? SP_ORDER.indexOf(SPECIES[i]) : run.labels ? run.labels[i] : -1;
            const st = g >= 0 ? groupStyle(g) : { shape: 0, tone: 2 };
            return <path key={i} d={markerPath(st.shape, sc.X(p[0]), sc.Y(p[1]), g >= 0 ? 3.4 : 2.6)} className={`m10-pt m10-t${st.tone} ${g < 0 ? "is-idle" : ""}`} />;
          })}
          {run.trail.map((t, g) =>
            t.length > 1 ? (
              <polyline key={g} className="m10-trail" points={t.map((c) => toStd(c)).map((c) => `${sc.X(c[0]).toFixed(1)},${sc.Y(c[1]).toFixed(1)}`).join(" ")} />
            ) : null,
          )}
          {run.centers.map((c0, g) => {
            const c = toStd(c0);
            const x = sc.X(c[0]);
            const y = sc.Y(c[1]);
            return (
              <g key={g} className="m10-center">
                <path d={`M${x - 7} ${y - 7}L${x + 7} ${y + 7}M${x + 7} ${y - 7}L${x - 7} ${y + 7}`} className="m10-center-halo" />
                <path d={`M${x - 7} ${y - 7}L${x + 7} ${y + 7}M${x + 7} ${y - 7}L${x - 7} ${y + 7}`} className="m10-center-x" />
              </g>
            );
          })}
        </svg>
        <div className="m10-axes small muted">
          <span>→ {pair.names[0]}</span>
          <span>↑ {pair.names[1]}</span>
          <span>padronizados no desenho</span>
        </div>
      </div>

      <div className="m10-legend small">
        {showSp
          ? SP_ORDER.map((s, g) => (
              <span key={s} className="m10-leg">
                <Swatch g={g} /> {SP_NAMES[s]} ({SPECIES.split(s).length - 1})
              </span>
            ))
          : counts
            ? counts.map((n, g) => (
                <span key={g} className="m10-leg">
                  <Swatch g={g} /> Grupo {g} ({n})
                </span>
              ))
            : <span className="muted">Os centros iniciais (×) já foram escolhidos. Falta atribuir os pontos.</span>}
      </div>

      <div className="row gap-sm wrap center-y">
        <button type="button" className="btn btn-primary btn-sm" onClick={doStep} disabled={run.done}>
          {run.done ? "Convergiu" : nextLabel}
        </button>
        <button type="button" className="btn btn-secondary btn-sm" onClick={doAll} disabled={run.done}>
          Até nada mudar
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSeed(seed + 1)}>
          Novo início
        </button>
        <span className="small muted">semente {seed}</span>
      </div>

      <div className="widget-detail" aria-live="polite">
        {run.done ? (
          <>
            <p className="widget-detail-title">
              Nada mudou: convergiu ao fim de {run.iter} {run.iter === 1 ? "iteração" : "iterações"}.
            </p>
            <p>
              Inércia {fmtW(lastW!)} · ARI em relação às espécies {pt(ari(SPECIES, run.labels!), 3)} · silhueta {pt(sil, 3)}
            </p>
            <p className="small muted">Experimente "Novo início": outro ponto de partida pode acabar noutro mínimo local, com outra inércia.</p>
          </>
        ) : (
          <>
            <p className="widget-detail-title">
              {run.next === "atribuir"
                ? run.labels
                  ? `Iteração ${run.iter + 1}: cada ponto vai para o centro mais próximo.`
                  : "Passo 2: atribuir cada ponto ao centro mais próximo."
                : "Passo 3: cada centro vai para a média dos pontos que lhe calharam."}
            </p>
            <p className="small muted">
              {lastW === null ? "A inércia só se pode calcular depois de haver grupos." : `Inércia agora: ${fmtW(lastW)}.`}
            </p>
          </>
        )}
        {run.steps.length > 0 && (
          <p className="m10-seq mono small" aria-label="Inércia depois de cada passo">
            {run.steps.map((s, i) => (
              <span key={i}>
                {i > 0 && <span className="muted"> → </span>}
                {fmtW(s.w)}
              </span>
            ))}
          </p>
        )}
      </div>

      {sortedList.length > 0 && (
        <div className="table-wrap">
          <table className="m10-tbl">
            <caption className="small muted">
              Inícios experimentados com k = {k}{stdz ? "" : ", sem padronizar"}, do melhor para o pior
            </caption>
            <thead>
              <tr>
                <th scope="col">Início</th>
                <th scope="col">Semente</th>
                <th scope="col" className="m10-num">Iterações</th>
                <th scope="col" className="m10-num">Inércia</th>
                <th scope="col" className="m10-num">ARI</th>
              </tr>
            </thead>
            <tbody>
              {sortedList.map((r) => (
                <tr key={`${r.init}${r.seed}`} className={r.w === best ? "is-best" : ""}>
                  <td>{r.init === "pp" ? "k-means++" : "aleatório"}</td>
                  <td className="mono">{r.seed}</td>
                  <td className="m10-num mono">{r.iter}</td>
                  <td className="m10-num mono">{fmtW(r.w)}</td>
                  <td className="m10-num mono">{pt(r.ari, 3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
