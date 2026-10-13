import React, { useId, useMemo, useRef, useState } from "react";
import { MOONS, MOONS_Y } from "./data";
import { dbscan, distances, kDistances, percentile } from "./dbscan";
import { ari } from "./kmeans";
import { bounds, equalScale, groupStyle, markerPath, NoiseSwatch, pt, Swatch } from "./plot";

// DBSCAN nas duas luas da secção 3 (make_moons com 400 pontos, noise=0.08, random_state=0). Os rótulos são os do
// scikit-learn para os mesmos pontos (ver dbscan.ts). Pontos centrais cheios, de fronteira vazios, ruído com ×.
// Por baixo, o gráfico das distâncias ao vizinho número min_samples: os pontos abaixo da linha do eps são
// exatamente os centrais. Clicar num ponto mostra a sua vizinhança de raio eps.

const W = 480;
const PAD = 12;
const Y_TRUE = MOONS_Y.split("").map(Number);
const PRESETS = [
  { eps: 0.05, m: 5, note: "raio pequeno" },
  { eps: 0.1, m: 5, note: "" },
  { eps: 0.15, m: 5, note: "as duas luas" },
  { eps: 0.2, m: 5, note: "raio grande" },
];

export function DbscanExplorer() {
  const uid = useId().replace(/:/g, "");
  const [eps, setEps] = useState(0.15);
  const [m, setM] = useState(5);
  const [sel, setSel] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const D = useMemo(() => distances(MOONS), []);
  const r = useMemo(() => dbscan(D, eps, m), [D, eps, m]);
  const kd = useMemo(() => kDistances(D, m), [D, m]);
  const kdSorted = useMemo(() => Float64Array.from(kd).sort(), [kd]);
  const score = useMemo(() => ari(Y_TRUE, r.labels), [r]);

  const sc = useMemo(() => equalScale(bounds(MOONS.map((p) => p[0]), 0.04), bounds(MOONS.map((p) => p[1]), 0.08), W, PAD), []);
  const nBorder = MOONS.length - r.nCore - r.nNoise;

  const pick = (ev: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    const ctm = svg?.getScreenCTM();
    if (!svg || !ctm) return;
    const p = new DOMPoint(ev.clientX, ev.clientY).matrixTransform(ctm.inverse());
    let best = -1;
    let bd = Infinity;
    MOONS.forEach(([x, y], i) => {
      const d = Math.hypot(sc.X(x) - p.x, sc.Y(y) - p.y);
      if (d < bd) {
        bd = d;
        best = i;
      }
    });
    setSel(bd < 14 ? best : null);
  };

  const neigh = sel === null ? [] : D[sel].reduce<number[]>((acc, d, j) => (d <= eps ? [...acc, j] : acc), []);
  const kind = (i: number) => (r.core[i] ? "central" : r.labels[i] === -1 ? "ruído" : "de fronteira");
  const active = PRESETS.find((p) => p.eps === eps && p.m === m);

  // gráfico das k distâncias
  const KH = 120;
  const kMax = Math.max(kdSorted[kdSorted.length - 1], eps) * 1.08;
  const ky = (v: number) => KH - (v / kMax) * KH;
  const kx = (i: number) => (i / (kdSorted.length - 1)) * W;
  const p50 = percentile(kdSorted, 50);
  const p90 = percentile(kdSorted, 90);
  const p95 = percentile(kdSorted, 95);

  return (
    <div className="m10-db">
      <div className="m10-presets" role="group" aria-label="Valores da aula, com min_samples = 5">
        {PRESETS.map((p) => (
          <button
            key={p.eps}
            type="button"
            className={`pill ${active === p ? "is-on" : ""}`}
            aria-pressed={active === p}
            onClick={() => {
              setEps(p.eps);
              setM(p.m);
            }}
          >
            eps = {String(p.eps).replace(".", ",")}
            {p.note && <span className="m10-pill-note">{p.note}</span>}
          </button>
        ))}
      </div>

      <div className="m10-sliders">
        <label className="m10-range" htmlFor={`${uid}-eps`}>
          <span className="small">
            <span className="muted">eps, o raio da vizinhança:</span> <span className="mono">{pt(eps, 2)}</span>
          </span>
          <input id={`${uid}-eps`} type="range" min={2} max={40} step={1} value={Math.round(eps * 100)} onChange={(e) => setEps(Math.round(Number(e.target.value)) / 100)} />
        </label>
        <label className="m10-range" htmlFor={`${uid}-m`}>
          <span className="small">
            <span className="muted">min_samples, contando com o próprio ponto:</span> <span className="mono">{m}</span>
          </span>
          <input id={`${uid}-m`} type="range" min={2} max={20} step={1} value={m} onChange={(e) => setM(Number(e.target.value))} />
        </label>
      </div>

      <div className="m10-stats" aria-live="polite">
        <div>
          <span className="small muted">Grupos</span>
          <span className="m10-big">{r.nClusters}</span>
        </div>
        <div>
          <span className="small muted">Centrais</span>
          <span className="m10-big">{r.nCore}</span>
        </div>
        <div>
          <span className="small muted">Fronteira</span>
          <span className="m10-big">{nBorder}</span>
        </div>
        <div>
          <span className="small muted">Ruído (−1)</span>
          <span className="m10-big">{r.nNoise}</span>
        </div>
        <div>
          <span className="small muted">ARI com as luas</span>
          <span className="m10-big">{pt(score, 3)}</span>
        </div>
      </div>

      <div className="m10-plotwrap">
        <svg
          ref={svgRef}
          className="m10-plot is-clickable"
          viewBox={`0 0 ${W} ${sc.height}`}
          onClick={pick}
          role="img"
          aria-label={`As duas luas com eps = ${pt(eps, 2)} e min_samples = ${m}: ${r.nClusters} grupos, ${r.nCore} pontos centrais, ${nBorder} de fronteira e ${r.nNoise} de ruído. Clique num ponto para ver a sua vizinhança.`}
        >
          {sel !== null && <circle className="m10-eps" cx={sc.X(MOONS[sel][0])} cy={sc.Y(MOONS[sel][1])} r={eps * sc.k} />}
          {MOONS.map(([x, y], i) => {
            const lab = r.labels[i];
            if (lab === -1) {
              const cx = sc.X(x);
              const cy = sc.Y(y);
              return <path key={i} d={`M${cx - 2.6} ${cy - 2.6}L${cx + 2.6} ${cy + 2.6}M${cx + 2.6} ${cy - 2.6}L${cx - 2.6} ${cy + 2.6}`} className="m10-noise" />;
            }
            const st = groupStyle(lab);
            return <path key={i} d={markerPath(st.shape, sc.X(x), sc.Y(y), 3.2)} className={`m10-pt m10-t${st.tone} ${r.core[i] ? "" : "is-hollow"}`} />;
          })}
          {neigh.map((j) => (
            <circle key={j} className="m10-ring" cx={sc.X(MOONS[j][0])} cy={sc.Y(MOONS[j][1])} r={5.5} />
          ))}
          {sel !== null && <circle className="m10-sel" cx={sc.X(MOONS[sel][0])} cy={sc.Y(MOONS[sel][1])} r={7} />}
        </svg>
      </div>

      <div className="m10-legend small">
        {Array.from({ length: Math.min(r.nClusters, 18) }, (_, g) => (
          <span key={g} className="m10-leg">
            <Swatch g={g} /> {g}
          </span>
        ))}
        {r.nClusters > 18 && <span className="muted">(as formas repetem-se a partir do grupo 18)</span>}
        <span className="m10-leg">
          <Swatch g={0} hollow /> fronteira
        </span>
        <span className="m10-leg">
          <NoiseSwatch /> ruído
        </span>
      </div>

      <div className="widget-detail" aria-live="polite">
        {sel === null ? (
          <p className="small muted">Clique num ponto para ver o círculo de raio eps à volta dele e os vizinhos que lá caem.</p>
        ) : (
          <>
            <p className="widget-detail-title">
              Este ponto tem {neigh.length} {neigh.length === 1 ? "ponto" : "pontos"} a distância ≤ {pt(eps, 2)}, contando com ele: é {kind(sel)}.
            </p>
            <p className="small muted">
              {r.core[sel]
                ? `Tem pelo menos min_samples = ${m}, por isso é central e pertence ao grupo ${r.labels[sel]}.`
                : r.labels[sel] !== -1
                  ? `Tem menos de ${m}, mas está ao alcance de um ponto central: entra no grupo ${r.labels[sel]} como fronteira.`
                  : `Tem menos de ${m} e nenhum dos vizinhos é central: fica como ruído, com o rótulo −1.`}
            </p>
          </>
        )}
      </div>

      <div className="m10-kd">
        <p className="small">
          Distância de cada ponto ao seu vizinho número {m} (contando com ele), por ordem crescente. Percentis 50, 90 e 95:{" "}
          <span className="mono">
            {pt(p50, 3)}, {pt(p90, 3)} e {pt(p95, 3)}
          </span>
          .
        </p>
        <svg
          className="m10-kd-svg"
          viewBox={`0 0 ${W} ${KH}`}
          preserveAspectRatio="none"
          role="img"
          aria-label={`Distâncias ao vizinho número ${m}, ordenadas; ${r.nCore} dos 400 pontos ficam abaixo de eps = ${pt(eps, 2)} e são os centrais.`}
        >
          <rect className="m10-kd-core" x={0} y={0} width={kx(Math.max(r.nCore - 1, 0))} height={KH} />
          <polyline className="m10-kd-line" points={Array.from(kdSorted, (v, i) => `${kx(i).toFixed(1)},${ky(v).toFixed(1)}`).join(" ")} vectorEffect="non-scaling-stroke" />
          <line className="m10-kd-eps" x1={0} x2={W} y1={ky(eps)} y2={ky(eps)} vectorEffect="non-scaling-stroke" />
          <line className="m10-axis0" x1={0} x2={W} y1={KH} y2={KH} vectorEffect="non-scaling-stroke" />
        </svg>
        <div className="m10-kd-foot small muted">
          <span>0</span>
          <span>
            linha tracejada: eps = {pt(eps, 2)} · abaixo dela, {r.nCore} pontos centrais
          </span>
          <span>400</span>
        </div>
      </div>
    </div>
  );
}
