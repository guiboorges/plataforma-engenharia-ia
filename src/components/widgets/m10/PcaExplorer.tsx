import React, { useId, useMemo, useState } from "react";
import { Checkbox } from "../../ui";
import { eigSym2, projVar, shape, toCorr, whiteSample, type Sym2, type V2 } from "./pca";
import { pt } from "./plot";

// PCA em duas dimensões (secção 4): uma nuvem de 150 pontos com a matriz de covariância escolhida (exata), a direção
// da 1.ª componente principal, e uma direção qualquer, θ, onde os pontos são projetados (a "sombra" numa reta).
// A variância da projeção, uᵀΣu, é máxima na 1.ª componente e mínima na 2.ª; a fração explicada é λ₁ / (λ₁ + λ₂).
// "Padronizar" troca a covariância pela matriz de correlações, como antes de uma PCA com unidades diferentes.
// Escolhem-se as duas variâncias e a correlação r (em passos de 0,05); a covariância é r·√(Var(x)·Var(y)). Assim o
// widget não reproduz as contas do exercício 5 (variâncias 4 e 3, covariância 2, r = 1/√3), que se fazem à mão.

type Shape = { a: number; r: number; c: number };
const PRESETS: { label: string; s: Shape }[] = [
  { label: "Correlação positiva", s: { a: 3, r: 0.6, c: 2 } },
  { label: "Quase uma reta", s: { a: 4, r: 0.95, c: 2.25 } },
  { label: "Correlação negativa", s: { a: 2, r: -0.5, c: 3 } },
  { label: "Sem correlação", s: { a: 5, r: 0, c: 1 } },
  { label: "Unidades muito diferentes", s: { a: 6, r: 0.5, c: 0.25 } },
];
const N = 150;
const S = 300; // lado do desenho
const R = 7.5; // meio lado, em unidades dos dados
const sc = S / 2 / R;
const X = (x: number) => S / 2 + x * sc;
const Y = (y: number) => S / 2 - y * sc;
const deg = (rad: number) => (rad * 180) / Math.PI;
const angleOf = (v: V2) => {
  const a = deg(Math.atan2(v[1], v[0]));
  return ((a % 180) + 180) % 180;
};
const round2 = (x: number) => Math.round(x * 100) / 100;
const cell = (x: number) => pt(x, 3).padStart(7);

export function PcaExplorer() {
  const uid = useId().replace(/:/g, "");
  const [s, setS] = useState<Shape>(PRESETS[0].s);
  const [stdz, setStdz] = useState(false);
  const [theta, setTheta] = useState(0);
  const white = useMemo(() => whiteSample(N, 7), []);

  const cov: Sym2 = { a: s.a, b: s.r * Math.sqrt(s.a * s.c), c: s.c };
  const sig = stdz ? toCorr(cov) : cov;
  const e = eigSym2(sig);
  const pts = useMemo(() => shape(white, sig), [white, sig.a, sig.b, sig.c]);
  const total = sig.a + sig.c;
  const frac1 = e.l1 / total;
  const th = (theta * Math.PI) / 180;
  const u: V2 = [Math.cos(th), Math.sin(th)];
  const v = projVar(sig, th);
  const pcAngle = angleOf(e.v1);
  const aligned = Math.abs(((((theta - pcAngle + 90) % 180) + 180) % 180) - 90) < 0.05;
  const isotropic = e.l1 - e.l2 < 1e-9;

  const setVar = (key: "a" | "c") => (ev: React.ChangeEvent<HTMLInputElement>) => setS({ ...s, [key]: Number(ev.target.value) });
  const active = PRESETS.find((p) => p.s.a === s.a && p.s.r === s.r && p.s.c === s.c);

  // projeções na reta de direção u
  const proj = pts.map((p) => p[0] * u[0] + p[1] * u[1]);
  const L = R * 1.5;
  const line = (d: V2) => ({ x1: X(-L * d[0]), y1: Y(-L * d[1]), x2: X(L * d[0]), y2: Y(L * d[1]) });

  // variância da projeção em função de θ
  const curve = Array.from({ length: 181 }, (_, a) => projVar(sig, (a * Math.PI) / 180));
  const vmax = Math.max(...curve) * 1.1;
  const CW = 300;
  const CH = 90;

  return (
    <div className="m10-pca">
      <div className="m10-presets" role="group" aria-label="Exemplos de nuvens">
        {PRESETS.map((p) => (
          <button key={p.label} type="button" className={`pill ${active === p ? "is-on" : ""}`} aria-pressed={active === p} onClick={() => setS(p.s)}>
            {p.label}
          </button>
        ))}
      </div>

      <div className="m10-sliders">
        <label className="m10-range" htmlFor={`${uid}-a`}>
          <span className="small">
            <span className="muted">Var(x):</span> <span className="mono">{pt(s.a, 2)}</span>
          </span>
          <input id={`${uid}-a`} type="range" min={0.25} max={6} step={0.25} value={s.a} onChange={setVar("a")} />
        </label>
        <label className="m10-range" htmlFor={`${uid}-c`}>
          <span className="small">
            <span className="muted">Var(y):</span> <span className="mono">{pt(s.c, 2)}</span>
          </span>
          <input id={`${uid}-c`} type="range" min={0.25} max={6} step={0.25} value={s.c} onChange={setVar("c")} />
        </label>
        <label className="m10-range" htmlFor={`${uid}-r`}>
          <span className="small">
            <span className="muted">Correlação r:</span> <span className="mono">{pt(s.r, 2)}</span>{" "}
            <span className="muted">(Cov(x, y) = {pt(cov.b, 3)})</span>
          </span>
          <input
            id={`${uid}-r`}
            type="range"
            min={-0.95}
            max={0.95}
            step={0.05}
            value={s.r}
            onChange={(ev) => setS({ ...s, r: round2(Number(ev.target.value)) })}
          />
        </label>
      </div>
      <Checkbox id={`${uid}-std`} checked={stdz} onChange={setStdz} label="Padronizar (a PCA passa a ver a matriz de correlações)" />

      <div className="m10-pca-main">
        <svg
          className="m10-plot m10-pca-svg"
          viewBox={`0 0 ${S} ${S}`}
          role="img"
          aria-label={`Nuvem de ${N} pontos. A 1.ª componente principal faz ${pt(pcAngle, 0)} graus com o eixo x e explica ${pt(frac1 * 100, 1)}% da variância. A reta escolhida faz ${pt(theta, 0)} graus; a variância da projeção nela é ${pt(v, 3)}.`}
        >
          <line className="m10-axis0" x1={0} x2={S} y1={Y(0)} y2={Y(0)} />
          <line className="m10-axis0" x1={X(0)} x2={X(0)} y1={0} y2={S} />
          {!isotropic && <line className="m10-pc1" {...line(e.v1)} />}
          {!isotropic && <line className="m10-pc2" {...line(e.v2)} />}
          {pts.map((p, i) => (
            <line key={`s${i}`} className="m10-drop" x1={X(p[0])} y1={Y(p[1])} x2={X(proj[i] * u[0])} y2={Y(proj[i] * u[1])} />
          ))}
          <line className="m10-dir" {...line(u)} />
          {pts.map((p, i) => (
            <circle key={i} className="m10-cloud" cx={X(p[0])} cy={Y(p[1])} r={2.4} />
          ))}
          {proj.map((q, i) => (
            <circle key={`p${i}`} className="m10-shadow" cx={X(q * u[0])} cy={Y(q * u[1])} r={1.8} />
          ))}
        </svg>

        <div className="m10-pca-side">
          <pre className="m10-pre" aria-label="Matriz e componentes">
            {`${stdz ? "Matriz de correlações" : "Matriz de covariância"}
${cell(sig.a)}  ${cell(sig.b)}
${cell(sig.b)}  ${cell(sig.c)}

λ₁ = ${pt(e.l1, 3)}   λ₂ = ${pt(e.l2, 3)}
1.ª componente: (${pt(e.v1[0], 3)}; ${pt(e.v1[1], 3)})
explica ${pt(frac1 * 100, 1)}% da variância`}
          </pre>
          <label className="m10-range" htmlFor={`${uid}-th`}>
            <span className="small">
              <span className="muted">Direção da reta, θ:</span> <span className="mono">{pt(theta, 0)}°</span>
            </span>
            <input id={`${uid}-th`} type="range" min={0} max={179} step={1} value={Math.round(theta) % 180} onChange={(ev) => setTheta(Number(ev.target.value))} />
          </label>
          <div className="row gap-sm wrap">
            <button type="button" className="btn btn-secondary btn-sm" disabled={isotropic} onClick={() => setTheta(pcAngle)}>
              Pôr na 1.ª componente
            </button>
            <button type="button" className="btn btn-ghost btn-sm" disabled={isotropic} onClick={() => setTheta(angleOf(e.v2))}>
              Na 2.ª
            </button>
          </div>
          <div className="widget-detail" aria-live="polite">
            <p className="widget-detail-title">
              Variância da sombra na reta: {pt(v, 3)} ({pt((v / total) * 100, 1)}% do total)
            </p>
            <p className="small muted">
              {isotropic
                ? "As duas variâncias são iguais e não há covariância: todas as direções têm a mesma variância, e a 1.ª componente não está definida."
                : aligned
                  ? "É a maior possível: esta reta é a 1.ª componente principal."
                  : `A maior possível é λ₁ = ${pt(e.l1, 3)}, na direção de ${pt(pcAngle, 1)}°.`}
            </p>
          </div>
        </div>
      </div>

      <div className="m10-curve">
        <p className="small muted">Variância da projeção para cada direção θ (de 0° a 180°): o máximo é λ₁, o mínimo λ₂.</p>
        <svg className="m10-curve-svg" viewBox={`0 0 ${CW} ${CH}`} preserveAspectRatio="none" role="img" aria-label="Variância da projeção em função do ângulo">
          <polyline
            className="m10-kd-line"
            points={curve.map((c, a) => `${((a / 180) * CW).toFixed(1)},${(CH - (c / vmax) * CH).toFixed(1)}`).join(" ")}
            vectorEffect="non-scaling-stroke"
          />
          <line className="m10-kd-eps" x1={(theta / 180) * CW} x2={(theta / 180) * CW} y1={0} y2={CH} vectorEffect="non-scaling-stroke" />
          <line className="m10-axis0" x1={0} x2={CW} y1={CH} y2={CH} vectorEffect="non-scaling-stroke" />
        </svg>
        <div className="m10-kd-foot small muted">
          <span>0°</span>
          <span>90°</span>
          <span>180°</span>
        </div>
      </div>
    </div>
  );
}
