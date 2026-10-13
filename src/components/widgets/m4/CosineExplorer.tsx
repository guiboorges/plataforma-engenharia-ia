import React, { useId, useRef, useState } from "react";
import { Seg } from "../../ui";
import { DOCS, PERGUNTA, angleDeg, cosine, dot, norm, rank } from "./cosine";
import { ptNum, pyFixed, pyFloat } from "./npfmt";

// Produto escalar e semelhança do cosseno (secção 3), em duas partes:
// 1. dois vetores do plano, arrastáveis, com u @ v, as normas, o cosseno e o ângulo, escritos como o Python os imprime;
// 2. a pesquisa semântica em miniatura da aula, com o vocabulário e as contagens do CountVectorizer.
// A lógica está em cosine.ts e npfmt.ts, testada contra NumPy 2.5 e scikit-learn.

type V2 = [number, number];

const PAIRS: { label: string; u: V2; v: V2 }[] = [
  { label: "v = (2, 1) e w = (1, 3)", u: [2, 1], v: [1, 3] },
  { label: "(1, 0) e (0, 1)", u: [1, 0], v: [0, 1] },
  { label: "(1, 1) e (2, 2)", u: [1, 1], v: [2, 2] },
  { label: "(1, 0) e (−1, 0)", u: [1, 0], v: [-1, 0] },
  { label: "(3, 4) e (4, 3)", u: [3, 4], v: [4, 3] },
];

const LIM = 5;
const SIZE = 280;

function meaning(c: number): string {
  if (Number.isNaN(c)) return "Um dos vetores é nulo: o cosseno não está definido (o NumPy dá nan, porque divide por zero).";
  if (c > 0.9999) return "Cosseno 1: a mesma direção. Muito parecidos, seja qual for o tamanho de cada um.";
  if (c < -0.9999) return "Cosseno −1: direções opostas.";
  if (Math.abs(c) < 1e-12) return "Cosseno 0: perpendiculares. Nada em comum.";
  if (c > 0) return c >= 0.7 ? "Apontam para lados parecidos." : "Têm alguma coisa em comum, mas apontam para lados bastante diferentes.";
  return "Apontam para lados mais opostos do que parecidos.";
}

function TwoVectors() {
  const [u, setU] = useState<V2>([2, 1]);
  const [v, setV] = useState<V2>([1, 3]);
  const drag = useRef<"u" | "v" | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const uid = useId().replace(/:/g, "");

  const sc = SIZE / 2 / (LIM + 0.5);
  const X = (x: number) => SIZE / 2 + x * sc;
  const Y = (y: number) => SIZE / 2 - y * sc;

  const toWorld = (ev: React.PointerEvent): V2 | null => {
    const el = svgRef.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const px = ((ev.clientX - r.left) / r.width) * SIZE;
    const py = ((ev.clientY - r.top) / r.height) * SIZE;
    const clamp = (z: number) => Math.max(-LIM, Math.min(LIM, Math.round(z)));
    return [clamp((px - SIZE / 2) / sc), clamp((SIZE / 2 - py) / sc)];
  };
  const onMove = (ev: React.PointerEvent) => {
    if (!drag.current) return;
    const w = toWorld(ev);
    if (!w) return;
    if (drag.current === "u") setU(w);
    else setV(w);
  };
  const handle = (which: "u" | "v", p: V2) => (
    <circle
      className={`m4-handle m4-handle-${which}`}
      cx={X(p[0])}
      cy={Y(p[1])}
      r={11}
      onPointerDown={(ev) => {
        drag.current = which;
        (ev.target as Element).setPointerCapture?.(ev.pointerId);
      }}
    />
  );

  const c = cosine(u, v);
  const ang = angleDeg(c);
  const zero = (p: V2) => p[0] === 0 && p[1] === 0;
  const a0 = Math.atan2(u[1], u[0]);
  const a1 = Math.atan2(v[1], v[0]);
  let da = a1 - a0;
  while (da > Math.PI) da -= 2 * Math.PI;
  while (da < -Math.PI) da += 2 * Math.PI;
  const rArc = 26;
  const arc = !zero(u) && !zero(v) && Math.abs(da) > 1e-9 && Math.abs(Math.abs(da) - Math.PI) > 1e-9
    ? `M ${X(0) + rArc * Math.cos(a0)} ${Y(0) - rArc * Math.sin(a0)} A ${rArc} ${rArc} 0 0 ${da > 0 ? 0 : 1} ${X(0) + rArc * Math.cos(a1)} ${Y(0) - rArc * Math.sin(a1)}`
    : null;

  const setComp = (which: "u" | "v", i: number, s: string) => {
    // campo vazio ou só "-" (a meio de escrever um negativo): não mexer no estado, para não apagar o que se escreve
    if (s.trim() === "" || !Number.isFinite(Number(s))) return;
    const n = Math.max(-LIM, Math.min(LIM, Math.round(Number(s))));
    const p: V2 = which === "u" ? [...u] : [...v];
    p[i] = n;
    (which === "u" ? setU : setV)(p);
  };
  const vecInputs = (which: "u" | "v", p: V2) => (
    <div className="m4-vec" role="group" aria-label={`Vetor ${which}`}>
      <span className={`m4-vec-name mono m4-txt-${which}`}>{which} = (</span>
      {[0, 1].map((i) => (
        <input
          key={i}
          type="number"
          min={-LIM}
          max={LIM}
          step={1}
          className="input input-sm mono m4-vec-cell"
          value={p[i]}
          aria-label={`${which}, componente ${i + 1}`}
          onChange={(ev) => setComp(which, i, ev.target.value)}
        />
      ))}
      <span className="mono m4-vec-name">)</span>
    </div>
  );

  const ticks = Array.from({ length: 2 * LIM + 1 }, (_, i) => i - LIM);
  const head = (p: V2, which: "u" | "v") =>
    zero(p) ? <circle cx={X(0)} cy={Y(0)} r={3} className={`m4-${which}`} /> : <line className={`m4-${which}`} x1={X(0)} y1={Y(0)} x2={X(p[0])} y2={Y(p[1])} markerEnd={`url(#${uid}-${which})`} />;

  return (
    <div className="m4-cos">
      <div className="m4-presets" role="group" aria-label="Pares de exemplo">
        {PAIRS.map((p) => {
          const on = p.u[0] === u[0] && p.u[1] === u[1] && p.v[0] === v[0] && p.v[1] === v[1];
          return (
            <button key={p.label} type="button" className={`pill ${on ? "is-on" : ""}`} aria-pressed={on} onClick={() => { setU(p.u); setV(p.v); }}>
              {p.label}
            </button>
          );
        })}
      </div>
      <div className="m4-cos-main">
        <svg
          ref={svgRef}
          className="m4-plane m4-plane-sm"
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          role="img"
          aria-label={`u = (${u[0]}, ${u[1]}) e v = (${v[0]}, ${v[1]}): cosseno ${Number.isNaN(c) ? "indefinido" : ptNum(c)}`}
          onPointerMove={onMove}
          onPointerUp={() => (drag.current = null)}
          onPointerLeave={() => (drag.current = null)}
        >
          <defs>
            {(["u", "v"] as const).map((w) => (
              <marker key={w} id={`${uid}-${w}`} viewBox="0 0 10 10" refX={8} refY={5} markerWidth={7} markerHeight={7} orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" className={`m4-${w}-head`} />
              </marker>
            ))}
          </defs>
          {ticks.map((k) => (
            <g key={k}>
              <line className="m4-grid0" x1={X(k)} y1={Y(-LIM)} x2={X(k)} y2={Y(LIM)} />
              <line className="m4-grid0" x1={X(-LIM)} y1={Y(k)} x2={X(LIM)} y2={Y(k)} />
            </g>
          ))}
          <line className="m4-axis" x1={X(-LIM - 0.5)} y1={Y(0)} x2={X(LIM + 0.5)} y2={Y(0)} />
          <line className="m4-axis" x1={X(0)} y1={Y(-LIM - 0.5)} x2={X(0)} y2={Y(LIM + 0.5)} />
          {arc && <path className="m4-arc" d={arc} />}
          {head(v, "v")}
          {head(u, "u")}
          {handle("v", v)}
          {handle("u", u)}
        </svg>
        <div className="m4-cos-side">
          {vecInputs("u", u)}
          {vecInputs("v", v)}
          <pre className="m4-pre" aria-label="Resultados como o Python os imprime">
            {`u @ v              ${dot(u, v)}\nnp.linalg.norm(u)  ${pyFloat(norm(u))}\nnp.linalg.norm(v)  ${pyFloat(norm(v))}\ncosseno(u, v)      ${pyFloat(c)}`}
          </pre>
          <div className="widget-detail">
            <p className="widget-detail-title">{Number.isNaN(c) ? "Cosseno indefinido" : `Ângulo de ${ptNum(ang, 1)}°`}</p>
            <p className="small">{meaning(c)}</p>
          </div>
          <p className="small muted">Arraste as pontas das setas ou escreva as coordenadas (inteiros de −5 a 5).</p>
        </div>
      </div>
    </div>
  );
}

const QUERIES = [PERGUNTA, "prazo de entrega da encomenda", "quero devolver uma encomenda", "trocar o tamanho"];

function MiniSearch() {
  const [q, setQ] = useState(PERGUNTA);
  const { vocab, q: qv, ranked, unknown } = rank(q, DOCS);
  const empty = qv.every((x) => x === 0);
  return (
    <div className="m4-search">
      <label className="m4-search-field">
        <span className="small muted">Pergunta</span>
        <input className="input mono" value={q} spellCheck={false} onChange={(e) => setQ(e.target.value)} />
      </label>
      <div className="m4-presets" role="group" aria-label="Perguntas de exemplo">
        {QUERIES.map((x) => (
          <button key={x} type="button" className={`pill ${q === x ? "is-on" : ""}`} aria-pressed={q === x} onClick={() => setQ(x)}>
            {x}
          </button>
        ))}
      </div>

      <div>
        <p className="small muted">Vetor da pergunta: contagem de cada uma das {vocab.length} palavras do vocabulário</p>
        <div className="m4-vocab">
          {vocab.map((w, i) => (
            <span key={w} className={`m4-word ${qv[i] ? "is-on" : ""}`}>
              <span className="mono">{w}</span>
              <span className="m4-word-n mono">{qv[i]}</span>
            </span>
          ))}
        </div>
        {unknown.length > 0 && (
          <p className="small muted m4-unknown">
            Fora do vocabulário (ignoradas): {unknown.map((w, i) => (
              <React.Fragment key={w}>
                {i > 0 && ", "}
                <span className="mono">{w}</span>
              </React.Fragment>
            ))}
            . Palavras de uma letra também são ignoradas.
          </p>
        )}
      </div>

      {empty ? (
        <div className="widget-detail">
          <p className="widget-detail-title">Nenhuma palavra conhecida</p>
          <p className="small">O vetor da pergunta só tem zeros, a sua norma é 0 e o cosseno divide por zero: o NumPy dá nan para todos os documentos.</p>
        </div>
      ) : (
        <ol className="m4-rank" aria-label="Documentos por ordem de semelhança">
          {ranked.map((r) => (
            <li key={r.index}>
              <span className="m4-rank-score mono">{pyFixed(r.score, 2)}</span>
              <span className="m4-rank-bar" aria-hidden="true">
                <span style={{ width: `${Math.max(0, r.score) * 100}%` }} />
              </span>
              <span className="m4-rank-doc">{r.doc}</span>
            </li>
          ))}
        </ol>
      )}
      <p className="small muted">
        Para este método, "devolução" e "devolver" são palavras diferentes. Os embeddings de um modelo de linguagem resolvem isso; o cálculo do cosseno é o mesmo.
      </p>
    </div>
  );
}

export function CosineExplorer() {
  const [tab, setTab] = useState("vec");
  return (
    <div className="m4-cosw">
      <Seg
        label="Parte do explorador"
        options={[
          { id: "vec", label: "Dois vetores" },
          { id: "search", label: "Pesquisa em miniatura" },
        ]}
        value={tab}
        onChange={setTab}
      />
      {tab === "vec" ? <TwoVectors /> : <MiniSearch />}
    </div>
  );
}
