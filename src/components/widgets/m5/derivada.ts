// Derivada exata e derivada numérica por diferenças centrais (secção 2 da aula).
// Sem dependências, para poder ser testada com `node`. Testado contra NumPy 2.5 (ver o relatório do módulo).

export type FnId = "quad" | "exp" | "perda";

/** Os dados da secção 1: campanhas (x) e vendas extra (y). */
export const XS = [1, 2, 3, 4, 5];
export const YS = [2.1, 3.9, 6.2, 7.8, 10.1];

/** np.mean de um array pequeno: soma sequencial (como o NumPy com menos de 8 elementos) a dividir por n. */
function mean(v: number[]): number {
  let s = 0;
  for (const t of v) s += t;
  return s / v.length;
}

/** perda(w) = np.mean((w * x - y) ** 2) */
export function perda(w: number): number {
  return mean(XS.map((x, i) => (w * x - YS[i]) ** 2));
}

/** dperda(w) = np.mean(2 * (w * x - y) * x) */
export function dperda(w: number): number {
  return mean(XS.map((x, i) => 2 * (w * x - YS[i]) * x));
}

export type Fn1 = {
  id: FnId;
  label: string;
  /** Nome da variável no eixo horizontal. */
  v: string;
  formula: string;
  dformula: string;
  f: (x: number) => number;
  df: (x: number) => number;
  /** Intervalo do controlo, em décimos (x = i / 10), e valor inicial. */
  min: number;
  max: number;
  start: number;
  /** Eixo vertical do gráfico. */
  yMin: number;
  yMax: number;
};

export const FUNCTIONS: Fn1[] = [
  {
    id: "quad",
    label: "x² − 4x + 5",
    v: "x",
    formula: "f(x) = x² − 4x + 5",
    dformula: "f'(x) = 2x − 4",
    f: (x) => x ** 2 - 4 * x + 5,
    df: (x) => 2 * x - 4,
    min: -10,
    max: 50,
    start: 30,
    yMin: -1,
    yMax: 11,
  },
  {
    id: "exp",
    label: "eˣ",
    v: "x",
    formula: "f(x) = eˣ",
    dformula: "f'(x) = eˣ",
    f: Math.exp,
    df: Math.exp,
    min: -20,
    max: 20,
    start: 10,
    yMin: -0.5,
    yMax: 8,
  },
  {
    id: "perda",
    label: "perda L(w)",
    v: "w",
    formula: "L(w) = média de (w·xᵢ − yᵢ)²",
    dformula: "L'(w) = média de 2(w·xᵢ − yᵢ)·xᵢ",
    f: perda,
    df: dperda,
    min: 0,
    max: 40,
    start: 10,
    yMin: -2,
    yMax: 48,
  },
];

/** Os valores de h que se podem escolher (os três da aula e dois intermédios). */
export const HS = [1e-1, 1e-3, 1e-5, 1e-8, 1e-12];

/** derivada(f, x, h) da aula: (f(x + h) - f(x - h)) / (2 * h) */
export function central(f: (x: number) => number, x: number, h = 1e-5): number {
  return (f(x + h) - f(x - h)) / (2 * h);
}

export type DerivReading = {
  x: number;
  fx: number;
  exact: number;
  numeric: number;
  error: number;
  sign: "pos" | "neg" | "zero";
};

export function readAt(fn: Fn1, i: number, h: number): DerivReading {
  const x = i / 10;
  const exact = fn.df(x);
  const numeric = central(fn.f, x, h);
  return {
    x,
    fx: fn.f(x),
    exact,
    numeric,
    error: Math.abs(numeric - exact),
    sign: Math.abs(exact) < 1e-12 ? "zero" : exact > 0 ? "pos" : "neg",
  };
}
