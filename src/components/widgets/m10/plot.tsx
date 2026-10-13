import React from "react";

// Peças partilhadas pelos widgets do M10: marcadores por grupo (forma + tom de cinza, sem cores de marca),
// escala com a mesma unidade nos dois eixos (as distâncias no ecrã são as distâncias que os algoritmos usam)
// e números em português.

/** Número com vírgula decimal e sinal de menos tipográfico: pt(-0.1234, 3) → "−0,123". */
export function pt(x: number, d: number): string {
  if (!Number.isFinite(x)) return "—";
  const s = (Math.abs(x) < 0.5 * 10 ** -d ? 0 : x).toFixed(d);
  return s.replace(".", ",").replace(/^-/, "−");
}

/** Grupo g → forma (6) e tom (3): 18 combinações diferentes antes de se repetirem. */
export function groupStyle(g: number): { shape: number; tone: number } {
  return { shape: g % 6, tone: (g + Math.floor(g / 6)) % 3 };
}

const TRI = 1.25;

/** Caminho SVG de um marcador centrado em (x, y). Formas: círculo, quadrado, triângulo, losango, triângulo invertido, estrela. */
export function markerPath(shape: number, x: number, y: number, r: number): string {
  const f = (n: number) => n.toFixed(1);
  switch (shape) {
    case 1: {
      const s = r * 0.9;
      return `M${f(x - s)} ${f(y - s)}h${f(2 * s)}v${f(2 * s)}h${f(-2 * s)}z`;
    }
    case 2: {
      const s = r * TRI;
      return `M${f(x)} ${f(y - s)}L${f(x + s * 0.87)} ${f(y + s * 0.5)}L${f(x - s * 0.87)} ${f(y + s * 0.5)}z`;
    }
    case 3: {
      const s = r * 1.2;
      return `M${f(x)} ${f(y - s)}L${f(x + s)} ${f(y)}L${f(x)} ${f(y + s)}L${f(x - s)} ${f(y)}z`;
    }
    case 4: {
      const s = r * TRI;
      return `M${f(x)} ${f(y + s)}L${f(x + s * 0.87)} ${f(y - s * 0.5)}L${f(x - s * 0.87)} ${f(y - s * 0.5)}z`;
    }
    case 5: {
      // estrela de quatro pontas
      const s = r * 1.35;
      const i = s * 0.4;
      return `M${f(x)} ${f(y - s)}L${f(x + i)} ${f(y - i)}L${f(x + s)} ${f(y)}L${f(x + i)} ${f(y + i)}L${f(x)} ${f(y + s)}L${f(x - i)} ${f(y + i)}L${f(x - s)} ${f(y)}L${f(x - i)} ${f(y - i)}z`;
    }
    default:
      return `M${f(x - r)} ${f(y)}a${f(r)} ${f(r)} 0 1 0 ${f(2 * r)} 0a${f(r)} ${f(r)} 0 1 0 ${f(-2 * r)} 0`;
  }
}

/** Marcador de legenda (um pequeno SVG). */
export function Swatch({ g, hollow }: { g: number; hollow?: boolean }) {
  const { shape, tone } = groupStyle(g);
  return (
    <svg className="m10-swatch" viewBox="0 0 14 14" aria-hidden="true">
      <path d={markerPath(shape, 7, 7, 4)} className={`m10-pt m10-t${tone} ${hollow ? "is-hollow" : ""}`} />
    </svg>
  );
}

export function NoiseSwatch() {
  return (
    <svg className="m10-swatch" viewBox="0 0 14 14" aria-hidden="true">
      <path d="M4 4L10 10M10 4L4 10" className="m10-noise" />
    </svg>
  );
}

/** Escala com a mesma unidade nos dois eixos: devolve as funções de conversão e a altura do desenho. */
export function equalScale(xs: [number, number], ys: [number, number], width: number, pad: number) {
  const [x0, x1] = xs;
  const [y0, y1] = ys;
  const k = (width - 2 * pad) / (x1 - x0);
  const height = Math.round((y1 - y0) * k + 2 * pad);
  return {
    k,
    height,
    X: (x: number) => pad + (x - x0) * k,
    Y: (y: number) => height - pad - (y - y0) * k,
  };
}

/** Limites dos dados com uma margem relativa. */
export function bounds(vals: number[], margin = 0.06): [number, number] {
  let lo = Infinity;
  let hi = -Infinity;
  for (const v of vals) {
    if (v < lo) lo = v;
    if (v > hi) hi = v;
  }
  const m = (hi - lo) * margin;
  return [lo - m, hi + m];
}
