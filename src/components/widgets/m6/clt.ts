// Lei dos grandes números e teorema do limite central (secção 4), por simulação.
// LGN: a taxa observada de compras (probabilidade 3%) ao longo de 100 000 visitas, para várias "lojas" (sementes).
// TLC: a distribuição da média de n observações das duas distribuições da aula: valores de encomendas
// (exponencial, média 50 €, desvio padrão 50 €) e compra ou não (Bernoulli, 3%). O dado fica para o exercício 11.

import { binomial, exponential, makeRng, type Rng } from "./stats";

export type DistId = "encomendas" | "compra";

export type Dist = {
  id: DistId;
  label: string;
  unit: string;
  mu: number;
  sigma: number;
  /** se os valores são inteiros, a média de n vive na grelha k/n */
  lattice: boolean;
  /** limites possíveis de uma observação */
  min: number;
  max: number;
  /** soma de n observações (mais rápido do que n sorteios quando há uma fórmula exata) */
  sumOf: (rng: Rng, n: number) => number;
};

export const DISTS: Record<DistId, Dist> = {
  encomendas: {
    id: "encomendas",
    label: "Valor de encomendas",
    unit: "€",
    mu: 50,
    sigma: 50,
    lattice: false,
    min: 0,
    max: Infinity,
    sumOf: (rng, n) => {
      let s = 0;
      for (let i = 0; i < n; i++) s += exponential(rng, 50);
      return s;
    },
  },
  compra: {
    id: "compra",
    label: "Compra ou não (3%)",
    unit: "",
    mu: 0.03,
    sigma: Math.sqrt(0.03 * 0.97),
    lattice: true,
    min: 0,
    max: 1,
    // a soma de n Bernoullis independentes é uma binomial(n, p)
    sumOf: (rng, n) => binomial(rng, n, 0.03),
  },
};

/** `reps` médias de n observações independentes. */
export function sampleMeans(dist: Dist, n: number, reps: number, seed: number): Float64Array {
  const rng = makeRng(seed);
  const out = new Float64Array(reps);
  for (let i = 0; i < reps; i++) out[i] = dist.sumOf(rng, n) / n;
  return out;
}

/**
 * Intervalos do histograma das médias: à volta de μ ± 4,5 erros padrão, dentro dos valores possíveis.
 * Para valores inteiros, os intervalos seguem a grelha k/n (cada intervalo junta o mesmo número de valores possíveis),
 * senão o histograma fica com dentes que não existem nos dados.
 */
export function meanBins(dist: Dist, n: number, maxBins = 48): { lo: number; hi: number; bins: number } {
  const se = dist.sigma / Math.sqrt(n);
  let lo = Math.max(dist.min, dist.mu - 4.5 * se);
  let hi = Math.min(dist.max, dist.mu + 4.5 * se);
  if (dist.id === "encomendas" && n <= 2) hi = dist.mu + 3 * dist.sigma; // n pequeno: cauda longa, cortar como a figura (0 a 200 €)
  if (!dist.lattice) return { lo, hi, bins: maxBins };
  const h = 1 / n;
  const kLo = Math.floor(lo / h + 1e-9);
  const kHi = Math.ceil(hi / h - 1e-9);
  const values = kHi - kLo + 1;
  const per = Math.max(1, Math.ceil(values / maxBins));
  const bins = Math.ceil(values / per);
  lo = (kLo - 0.5) * h;
  hi = lo + bins * per * h;
  return { lo, hi, bins };
}

/** Taxa observada ao fim de cada k visitas (média acumulada), só nos pontos pedidos. */
export function runningRate(p: number, total: number, seed: number, at: number[]): number[] {
  const rng = makeRng(seed);
  const want = [...at].sort((a, b) => a - b);
  const out: number[] = [];
  let hits = 0;
  let j = 0;
  for (let k = 1; k <= total && j < want.length; k++) {
    if (rng() < p) hits++;
    while (j < want.length && want[j] === k) {
      out.push(hits / k);
      j++;
    }
  }
  return out;
}

/** Pontos em escala logarítmica de 1 a total (≈ `perDecade` por década, sem repetidos). */
export function logPoints(total: number, perDecade = 40): number[] {
  const pts = new Set<number>();
  const steps = Math.round(Math.log10(total) * perDecade);
  for (let i = 0; i <= steps; i++) pts.add(Math.min(total, Math.round(10 ** (i / perDecade))));
  return [...pts].sort((a, b) => a - b);
}
