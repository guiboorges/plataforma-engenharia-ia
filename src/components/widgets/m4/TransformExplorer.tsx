import React, { useId, useState } from "react";
import { allInts, apply, det, eig2, isSymmetric, lerpFromIdentity, type Mat2, type Vec2 } from "./mat2";
import { npArray, ptNum } from "./npfmt";

// Explorador de transformações 2 × 2 (secções 4 e 5): edita-se a matriz e vê-se a grelha, o quadrado unitário e as
// imagens de (1, 0) e (0, 1), o determinante e, quando são reais, os valores e vetores próprios.
// Os resultados dos produtos são escritos como o NumPy os imprime (ver npfmt.ts); a lógica está em mat2.ts.

type Preset = { id: string; name: string; label: string; m: Mat2 };

const PRESETS: Preset[] = [
  { id: "S", name: "S", label: "S: inclinação", m: [[2, 1], [0, 1]] },
  { id: "R", name: "R", label: "R: rotação de 90°", m: [[0, -1], [1, 0]] },
  { id: "C", name: "C", label: "C: simétrica", m: [[2, 1], [1, 2]] },
  { id: "E", name: "A", label: "Estica e encolhe", m: [[2, 0], [0, 0.5]] },
  { id: "F", name: "A", label: "Espelho", m: [[-1, 0], [0, 1]] },
  { id: "Z", name: "A", label: "Achata (det = 0)", m: [[1, 2], [2, 4]] },
  { id: "I", name: "I", label: "Identidade", m: [[1, 0], [0, 1]] },
];

const toText = (m: Mat2) => m.map((r) => r.map((x) => String(x)));

function parse(s: string): number | null {
  const t = s.trim().replace(",", ".").replace("−", "-");
  if (t === "" || t === "-" || t === ".") return null;
  const x = Number(t);
  return Number.isFinite(x) && Math.abs(x) <= 10 ? x : null;
}

const SIZE = 320;

export function TransformExplorer({ initial = "S", eigenFirst = false }: { initial?: string; eigenFirst?: boolean }) {
  const start = PRESETS.find((p) => p.id === initial) ?? PRESETS[0];
  const [txt, setTxt] = useState<string[][]>(toText(start.m));
  const [name, setName] = useState(start.name);
  const [t, setT] = useState(1);
  const [showEig, setShowEig] = useState(eigenFirst);
  const uid = useId().replace(/:/g, "");

  const vals = txt.map((r) => r.map(parse));
  const valid = vals.every((r) => r.every((x) => x !== null));
  const m: Mat2 = valid ? (vals as Mat2) : [[1, 0], [0, 1]];
  const shown = lerpFromIdentity(m, t);
  // como o NumPy: np.array([[2, 1], [0, 1]]) é de inteiros, mas basta um "2.0" ou "0.5" para ser de floats
  const ints = valid && allInts(m) && txt.every((r) => r.every((x) => /^[-−]?\d+$/.test(x.trim())));
  const d = det(m);
  const e = eig2(m);
  const sym = isSymmetric(m);

  const setCell = (i: number, j: number, v: string) => {
    const next = txt.map((r) => [...r]);
    next[i][j] = v;
    setTxt(next);
    setName("A");
  };
  const choose = (p: Preset) => {
    setTxt(toText(p.m));
    setName(p.name);
    setT(1);
  };
  const activePreset = PRESETS.find((p) => valid && p.m.every((r, i) => r.every((x, j) => x === m[i][j])));

  // ---- desenho: coordenadas do mundo → SVG
  const reach = Math.max(
    3,
    ...[apply(shown, [1, 0]), apply(shown, [0, 1]), apply(shown, [1, 1])].flatMap((v) => v.map((x) => Math.abs(x))),
  );
  const R = Math.min(10, Math.ceil(reach + 1));
  const sc = SIZE / 2 / R;
  const X = (x: number) => SIZE / 2 + x * sc;
  const Y = (y: number) => SIZE / 2 - y * sc;
  const P = (v: Vec2) => `${X(v[0]).toFixed(2)},${Y(v[1]).toFixed(2)}`;
  const N = 12;
  const gridLines: [Vec2, Vec2][] = [];
  for (let k = -N; k <= N; k++) {
    gridLines.push([apply(shown, [k, -N]), apply(shown, [k, N])]);
    gridLines.push([apply(shown, [-N, k]), apply(shown, [N, k])]);
  }
  const plainLines: [Vec2, Vec2][] = [];
  for (let k = -R; k <= R; k++) {
    plainLines.push([[k, -R], [k, R]]);
    plainLines.push([[-R, k], [R, k]]);
  }
  const e1 = apply(shown, [1, 0]);
  const e2 = apply(shown, [0, 1]);
  const e12 = apply(shown, [1, 1]);
  const arrow = (to: Vec2, cls: string, label: string) => {
    const len = Math.hypot(to[0], to[1]) * sc;
    if (len < 1) return <circle cx={X(0)} cy={Y(0)} r={3} className={cls} />;
    return (
      <g className={cls}>
        <line x1={X(0)} y1={Y(0)} x2={X(to[0])} y2={Y(to[1])} markerEnd={`url(#${uid}-${cls})`} />
        <text x={X(to[0]) + (to[0] >= 0 ? 6 : -6)} y={Y(to[1]) + (to[1] >= 0 ? -6 : 14)} textAnchor={to[0] >= 0 ? "start" : "end"}>
          {label}
        </text>
      </g>
    );
  };
  const eigLines = showEig && e.kind === "real" && !e.allVectors && t === 1 ? e.pairs : [];

  const fmtVec = (v: Vec2) => npArray(v, ints);
  const nm = name;

  return (
    <div className="m4-tr">
      <div className="m4-presets" role="group" aria-label="Matrizes de exemplo">
        {PRESETS.map((p) => (
          <button key={p.id} type="button" className={`pill ${activePreset?.id === p.id ? "is-on" : ""}`} aria-pressed={activePreset?.id === p.id} onClick={() => choose(p)}>
            {p.label}
          </button>
        ))}
      </div>

      <div className="m4-tr-main">
        <div className="m4-tr-side">
          <div className="m4-mat" role="group" aria-label={`Matriz ${nm}`}>
            <span className="m4-mat-name mono">{nm} =</span>
            <div className="m4-mat-grid">
              {[0, 1].map((i) =>
                [0, 1].map((j) => (
                  <input
                    key={`${i}${j}`}
                    className="input input-sm mono m4-mat-cell"
                    inputMode="decimal"
                    value={txt[i][j]}
                    aria-label={`Linha ${i + 1}, coluna ${j + 1}`}
                    aria-invalid={vals[i][j] === null}
                    onChange={(ev) => setCell(i, j, ev.target.value)}
                  />
                )),
              )}
            </div>
          </div>
          {!valid && <p className="small c-bad">Cada entrada tem de ser um número entre −10 e 10.</p>}

          <label className="m4-range">
            <span className="small muted">Da identidade até {nm}: {Math.round(t * 100)}%</span>
            <input type="range" min={0} max={1} step={0.05} value={t} onChange={(ev) => setT(Number(ev.target.value))} aria-label="Passo da animação" />
          </label>

          <pre className="m4-pre" aria-label="Resultados">
            {`${nm} @ [1, 0] = ${fmtVec(apply(m, [1, 0]))}\n${nm} @ [0, 1] = ${fmtVec(apply(m, [0, 1]))}\n${nm} @ [1, 1] = ${fmtVec(apply(m, [1, 1]))}`}
          </pre>

          <div className="widget-detail">
            <p className="widget-detail-title">{detTitle(d)}</p>
            <p className="small">{detText(d)}</p>
          </div>

          <div>
            <button type="button" className={`pill ${showEig ? "is-on" : ""}`} aria-pressed={showEig} onClick={() => setShowEig(!showEig)}>
              Vetores próprios
            </button>
          </div>
          {showEig && <EigenPanel e={e} sym={sym} name={nm} />}
        </div>

        <svg className="m4-plane" viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={`O plano depois de aplicar ${nm}: (1, 0) vai para (${ptNum(e1[0])}, ${ptNum(e1[1])}) e (0, 1) vai para (${ptNum(e2[0])}, ${ptNum(e2[1])}).`}>
          <defs>
            <clipPath id={`${uid}-clip`}>
              <rect x={0} y={0} width={SIZE} height={SIZE} />
            </clipPath>
            {["m4-v1", "m4-v2"].map((c) => (
              <marker key={c} id={`${uid}-${c}`} viewBox="0 0 10 10" refX={8} refY={5} markerWidth={7} markerHeight={7} orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" className={`${c}-head`} />
              </marker>
            ))}
          </defs>
          <g clipPath={`url(#${uid}-clip)`}>
            {plainLines.map(([a, b], i) => (
              <line key={`p${i}`} className="m4-grid0" x1={X(a[0])} y1={Y(a[1])} x2={X(b[0])} y2={Y(b[1])} />
            ))}
            <line className="m4-axis" x1={0} y1={Y(0)} x2={SIZE} y2={Y(0)} />
            <line className="m4-axis" x1={X(0)} y1={0} x2={X(0)} y2={SIZE} />
            {gridLines.map(([a, b], i) => (
              <line key={`g${i}`} className="m4-grid1" x1={X(a[0])} y1={Y(a[1])} x2={X(b[0])} y2={Y(b[1])} />
            ))}
            {eigLines.map((p, i) => (
              <g key={`e${i}`} className="m4-eig">
                <line x1={X(-p.vector[0] * 3 * R)} y1={Y(-p.vector[1] * 3 * R)} x2={X(p.vector[0] * 3 * R)} y2={Y(p.vector[1] * 3 * R)} />
                <text x={X(p.vector[0] * R * 0.78)} y={Y(p.vector[1] * R * 0.78) - 6} textAnchor="middle">
                  λ = {ptNum(p.value)}
                </text>
              </g>
            ))}
            <polygon className="m4-square" points={[P([0, 0]), P(e1), P(e12), P(e2)].join(" ")} />
            {arrow(e2, "m4-v2", `(${ptNum(e2[0], 2)}, ${ptNum(e2[1], 2)})`)}
            {arrow(e1, "m4-v1", `(${ptNum(e1[0], 2)}, ${ptNum(e1[1], 2)})`)}
          </g>
        </svg>
      </div>
      <p className="small muted m4-legend">
        <span className="m4-key m4-key-v1" aria-hidden="true" /> para onde vai (1, 0) · <span className="m4-key m4-key-v2" aria-hidden="true" /> para onde vai (0, 1) · área sombreada: o quadrado de área 1 depois da transformação
        {eigLines.length > 0 ? " · tracejado: direções próprias" : ""}
      </p>
    </div>
  );
}

/** det como número curto: 2, −1, 0,5 (o np.linalg.det pode dar 1.9999999999999998 por arredondamento). */
function ptDet(d: number): string {
  return ptNum(Math.abs(d) < 1e-12 ? 0 : d);
}

function detTitle(d: number): string {
  if (Math.abs(d) < 1e-12) return "Determinante 0: o plano fica achatado numa reta";
  if (Math.abs(d + 1) < 1e-12) return "Determinante −1: as áreas não mudam, mas o plano é espelhado";
  if (d < 0) return `Determinante ${ptDet(d)}: as áreas ficam × ${ptNum(Math.abs(d))} e o plano é espelhado`;
  if (Math.abs(d - 1) < 1e-12) return "Determinante 1: as áreas não mudam";
  return `Determinante ${ptDet(d)}: as áreas ficam × ${ptNum(d)}`;
}

function detText(d: number): string {
  if (Math.abs(d) < 1e-12) return "A matriz perde informação: pontos diferentes vão parar ao mesmo sítio, por isso não tem inversa. Um sistema Ax = b com esta matriz não tem solução ou tem infinitas.";
  if (d < 0) return `O quadrado de área 1 passa a um paralelogramo de área ${ptNum(Math.abs(d))}. O sinal negativo indica que a orientação se inverte, como num espelho. A matriz tem inversa.`;
  return `O quadrado de área 1 passa a um paralelogramo de área ${ptNum(d)}. A matriz tem inversa: a transformação pode ser desfeita.`;
}

function stretch(l: number): string {
  if (Math.abs(l) < 1e-12) return "é achatada até à origem";
  if (Math.abs(l - 1) < 1e-12) return "fica igual";
  if (Math.abs(l + 1) < 1e-12) return "troca de sentido, com o mesmo comprimento";
  const k = ptNum(Math.abs(l));
  const what = Math.abs(l) > 1 ? `é esticada ${k} vezes` : `é encolhida para ${k} do comprimento`;
  return l < 0 ? `troca de sentido e ${what}` : what;
}

function EigenPanel({ e, sym, name }: { e: ReturnType<typeof eig2>; sym: boolean; name: string }) {
  if (e.kind === "complex") {
    return (
      <div className="widget-detail">
        <p className="widget-detail-title">Sem vetores próprios reais</p>
        <p className="small">
          Os valores próprios são complexos ({ptNum(e.re)} ± {ptNum(e.im)}i): nenhuma direção fica na sua reta, porque a transformação roda todas. O{" "}
          <code>np.linalg.eig</code> devolveria números complexos.
        </p>
      </div>
    );
  }
  if (e.allVectors) {
    return (
      <div className="widget-detail">
        <p className="widget-detail-title">Todas as direções são próprias</p>
        <p className="small">
          {Math.abs(e.pairs[0].value - 1) < 1e-12
            ? `${name} é a identidade: todos os vetores ficam iguais (λ = 1).`
            : `${name} é ${ptNum(e.pairs[0].value)} vezes a identidade: todos os vetores são multiplicados por λ = ${ptNum(e.pairs[0].value)}, sem sair da sua reta.`}
        </p>
      </div>
    );
  }
  return (
    <div className="widget-detail">
      <p className="widget-detail-title">{e.defective ? "Uma só direção própria" : "Duas direções próprias"}</p>
      <ul className="m4-eig-list small">
        {e.pairs.map((p, i) => (
          <li key={i}>
            <span className="mono">λ = {ptNum(p.value)}</span>: a direção ({ptNum(p.vector[0])}, {ptNum(p.vector[1])}) {stretch(p.value)}.
          </li>
        ))}
      </ul>
      <p className="small muted">
        {e.defective
          ? "O valor próprio é repetido e só há uma direção que não roda: as outras são inclinadas."
          : sym
            ? `${name} é simétrica: as duas direções são perpendiculares e o np.linalg.eigh dá os valores por ordem crescente. Os vetores têm comprimento 1; o sinal pode sair trocado (v e −v são o mesmo vetor próprio).`
            : "Os vetores têm comprimento 1; o sinal pode sair trocado (v e −v são o mesmo vetor próprio). Para matrizes não simétricas, o np.linalg.eig pode dar os valores por outra ordem."}
      </p>
    </div>
  );
}

export function TransformWidget() {
  return <TransformExplorer initial="S" />;
}

export function EigenWidget() {
  return <TransformExplorer initial="C" eigenFirst />;
}
