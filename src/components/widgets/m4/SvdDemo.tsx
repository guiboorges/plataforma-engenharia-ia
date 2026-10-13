import React, { useMemo, useState } from "react";
import { Seg } from "../../ui";
import { FLAG, GRADIENT, NOISE, energy, reconstruct, relError, stored, svd, type Matrix } from "./svd";
import { ptNum } from "./npfmt";

// Compressão com a SVD (secção 6) numa imagem de 16 × 16: escolhe-se k e vê-se a reconstrução com as k primeiras
// camadas, os valores singulares, o erro relativo e quantos números é preciso guardar. A lógica está em svd.ts,
// testada contra np.linalg.svd (NumPy 2.5).

const IMAGES: { id: string; label: string; m: Matrix; note: string }[] = [
  {
    id: "flag",
    label: "Bandeira de golfe",
    m: FLAG,
    note: "Feita de zonas lisas e retângulos: tem poucas direções importantes, como as fotografias reais.",
  },
  {
    id: "grad",
    label: "Degradé",
    m: GRADIENT,
    note: "Cada píxel é (linha × coluna) / 256: uma coluna vezes uma linha. A matriz inteira é uma só camada.",
  },
  {
    id: "noise",
    label: "Ruído",
    m: NOISE,
    note: "Números ao acaso, sem estrutura: tirando a primeira camada (o brilho médio), os valores singulares descem devagar e o erro também.",
  },
];

const pct = (x: number) => `${ptNum(x * 100, 1)}%`;
// como np.clip(aproximar(k), 0, 1) na aula: 0 = preto, 1 = branco, em qualquer tema
const clip = (x: number) => Math.max(0, Math.min(1, x));

function Pixels({ m, label }: { m: Matrix; label: string }) {
  return (
    <figure className="m4-px-fig">
      <div className="m4-px" role="img" aria-label={label} style={{ gridTemplateColumns: `repeat(${m[0].length}, 1fr)` }}>
        {m.flatMap((row, i) => row.map((x, j) => <span key={`${i}-${j}`} style={{ opacity: 1 - clip(x) }} />))}
      </div>
      <figcaption className="small muted">{label}</figcaption>
    </figure>
  );
}

export function SvdDemo() {
  const [img, setImg] = useState("flag");
  const [k, setK] = useState(1);
  const cur = IMAGES.find((x) => x.id === img) ?? IMAGES[0];
  const A = cur.m;
  const d = useMemo(() => svd(A), [A]);
  const rows = A.length;
  const cols = A[0].length;
  const Ak = useMemo(() => reconstruct(A, d, k), [A, d, k]);
  const rank = d.s.filter((x) => x > 0).length;
  const err = relError(d.s, k);
  const en = energy(d.s, k);
  const keep = stored(rows, cols, k);
  const total = rows * cols;
  const top = d.s[0] || 1;

  return (
    <div className="m4-svd">
      <Seg label="Imagem" options={IMAGES.map((x) => ({ id: x.id, label: x.label }))} value={img} onChange={(id) => { setImg(id); setK(1); }} />
      <p className="small muted">{cur.note}</p>

      <div className="m4-svd-imgs">
        <Pixels m={A} label="Original (16 × 16)" />
        <Pixels m={Ak} label={`Com k = ${k} ${k === 1 ? "camada" : "camadas"}`} />
      </div>

      <label className="m4-range">
        <span className="small muted">
          Camadas guardadas: <span className="mono">k = {k}</span>
        </span>
        <input type="range" min={1} max={cols} step={1} value={k} onChange={(e) => setK(Number(e.target.value))} aria-label="Número de camadas k" />
      </label>

      <div className="m4-svd-stats">
        <div className="m4-stat">
          <span className="small muted">Erro relativo</span>
          <span className="m4-stat-n mono">{pct(err < 5e-10 ? 0 : err)}</span>
        </div>
        <div className="m4-stat">
          <span className="small muted">Energia guardada (σ²)</span>
          <span className="m4-stat-n mono">{pct(en)}</span>
        </div>
        <div className="m4-stat">
          <span className="small muted">Números guardados</span>
          <span className="m4-stat-n mono">
            {keep} de {total}
          </span>
          <span className={`small ${keep >= total ? "c-bad" : "muted"}`}>
            {k} × ({rows} + {cols} + 1){keep >= total ? ": mais do que a imagem" : `: ${pct(keep / total)}`}
          </span>
        </div>
      </div>

      <div>
        <p className="small muted">Valores singulares σ₁ ≥ σ₂ ≥ …, com as camadas usadas destacadas</p>
        <ol className="m4-sv" aria-label="Valores singulares">
          {d.s.map((s, i) => (
            <li key={i} className={i < k ? "is-on" : ""}>
              <span className="m4-sv-i mono">σ{sub(i + 1)}</span>
              <span className="m4-sv-bar" aria-hidden="true">
                <span style={{ width: `${(s / top) * 100}%` }} />
              </span>
              <span className="m4-sv-n mono">{ptNum(s, 2)}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="widget-detail">
        <p className="widget-detail-title">
          {rank < cols ? `Característica ${rank}: com k = ${rank} a reconstrução é exata` : `Característica ${cols}: são precisas todas as camadas`}
        </p>
        <p className="small">
          {k >= cols
            ? "Com todas as camadas, a reconstrução é exata (a menos do arredondamento)."
            : k >= rank
            ? "Os valores singulares que faltam são 0: não há mais nada a recuperar."
            : `A camada seguinte pesaria σ${sub(k + 1)} = ${ptNum(d.s[k], 2)}. Guardar só as k primeiras camadas é a melhor aproximação possível com k camadas (Eckart & Young, 1936).`}
        </p>
      </div>
    </div>
  );
}

const SUB = "₀₁₂₃₄₅₆₇₈₉";
function sub(n: number): string {
  return String(n)
    .split("")
    .map((c) => SUB[Number(c)])
    .join("");
}
