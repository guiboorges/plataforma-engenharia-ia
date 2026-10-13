// Teste A/B de duas proporções (secção 6), com as fórmulas da aula:
//   ep = √(pa(1 − pa)/na + pb(1 − pb)/nb), z = (pb − pa)/ep, valor-p = 2·sf(|z|), IC = dif ± 1,96·ep
//   n por versão = (z_0,975 + z_0,8)² · (p1(1 − p1) + p2(1 − p2)) / (p2 − p1)²
// Com os dados da aula (A: 120 em 4000; B: 150 em 4000): 0.0075 0.00404 1.86 0.063, IC −0.0004 a 0.0154, 9097 visitas.
// O bootstrap e os testes A/A são simulações com o gerador de stats.ts.

import { binomial, makeRng, normPpf, normSf, percentile } from "./stats";

export type AbResult = {
  pa: number;
  pb: number;
  dif: number;
  ep: number;
  z: number;
  /** NaN quando o erro padrão é 0 (as duas taxas a 0 ou a 1), como o NumPy */
  p: number;
  lo: number;
  hi: number;
};

export function abTest(ca: number, na: number, cb: number, nb: number): AbResult {
  const pa = ca / na;
  const pb = cb / nb;
  const dif = pb - pa;
  const ep = Math.sqrt((pa * (1 - pa)) / na + (pb * (1 - pb)) / nb);
  const z = dif / ep;
  const p = ep > 0 ? 2 * normSf(Math.abs(z)) : NaN;
  return { pa, pb, dif, ep, z, p, lo: dif - 1.96 * ep, hi: dif + 1.96 * ep };
}

/** Visitas por versão para detetar a passagem de p1 para p2 com o poder dado (limiar bilateral alpha). */
export function sampleSize(p1: number, p2: number, alpha = 0.05, power = 0.8): number {
  if (p1 === p2) return Infinity;
  const za = normPpf(1 - alpha / 2);
  const zb = normPpf(power);
  return Math.ceil(((za + zb) ** 2 * (p1 * (1 - p1) + p2 * (1 - p2))) / (p2 - p1) ** 2);
}

export type BootResult = { difs: Float64Array; lo: number; hi: number; fracLe0: number };

/**
 * Bootstrap da diferença B − A: `reps` reamostragens com reposição de cada grupo.
 * Reamostrar n zeros e uns com reposição e contar os uns é exatamente uma binomial(n, conversões/n),
 * por isso não é preciso sortear visita a visita.
 */
export function bootstrap(ca: number, na: number, cb: number, nb: number, reps: number, seed: number): BootResult {
  const rng = makeRng(seed);
  const pa = ca / na;
  const pb = cb / nb;
  const difs = new Float64Array(reps);
  for (let i = 0; i < reps; i++) difs[i] = binomial(rng, nb, pb) / nb - binomial(rng, na, pa) / na;
  let le0 = 0;
  for (let i = 0; i < reps; i++) if (difs[i] <= 0) le0++;
  const sorted = Float64Array.from(difs).sort();
  return { difs, lo: percentile(sorted, 2.5), hi: percentile(sorted, 97.5), fracLe0: le0 / reps };
}

/** `reps` testes A/A: as duas versões com a mesma conversão p e n visitas cada. Devolve a fração com valor-p < alpha. */
export function aaTests(n: number, p: number, reps: number, seed: number, alpha = 0.05): { frac: number; pvals: Float64Array } {
  const rng = makeRng(seed);
  const pvals = new Float64Array(reps);
  let sig = 0;
  for (let i = 0; i < reps; i++) {
    const a = binomial(rng, n, p);
    const b = binomial(rng, n, p);
    pvals[i] = abTest(a, n, b, n).p;
    if (pvals[i] < alpha) sig++; // NaN < alpha é falso, como no NumPy
  }
  return { frac: sig / reps, pvals };
}
