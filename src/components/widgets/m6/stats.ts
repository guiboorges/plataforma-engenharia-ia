// Funções estatísticas e gerador aleatório para os widgets do M6, sem dependências (correm no browser e com `node`).
// normCdf/normSf/normPpf e binomPmf reproduzem scipy.stats (SciPy 1.18) com erro relativo abaixo de 1e-12;
// percentile e skew reproduzem np.percentile (interpolação linear) e scipy.stats.skew (enviesada, a de omissão).
// O gerador não é o PCG64 do NumPy: as simulações têm as mesmas propriedades, mas não os mesmos números.

const LN_SQRT_PI = 0.5723649429247001; // lgamma(0.5) = log(√π)
const FPMIN = 1e-300;
const EPS = 1e-16;

const LANCZOS = [
  0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012,
  9.9843695780195716e-6, 1.5056327351493116e-7,
];

/** log Γ(x) para x ≥ 0,5 (aproximação de Lanczos, g = 7). */
export function lgamma(x: number): number {
  if (x < 0.5) return Math.log(Math.PI / Math.abs(Math.sin(Math.PI * x))) - lgamma(1 - x);
  const xx = x - 1;
  let a = LANCZOS[0];
  const t = xx + 7.5;
  for (let i = 1; i < 9; i++) a += LANCZOS[i] / (xx + i);
  return 0.5 * Math.log(2 * Math.PI) + (xx + 0.5) * Math.log(t) - t + Math.log(a);
}

/** erfc(t), pela função gama incompleta Q(1/2, t²): série abaixo de t² = 1,5, fração contínua acima. */
export function erfc(t: number): number {
  if (t < 0) return 2 - erfc(-t);
  if (t === 0) return 1;
  const a = 0.5;
  const x = t * t;
  const pre = Math.exp(-x + a * Math.log(x) - LN_SQRT_PI);
  if (x < a + 1) {
    let ap = a;
    let del = 1 / a;
    let sum = del;
    for (let i = 0; i < 500; i++) {
      ap += 1;
      del *= x / ap;
      sum += del;
      if (Math.abs(del) < Math.abs(sum) * EPS) break;
    }
    return 1 - sum * pre;
  }
  let b = x + 1 - a;
  let c = 1 / FPMIN;
  let d = 1 / b;
  let h = d;
  for (let i = 1; i < 500; i++) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = b + an / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  return pre * h;
}

/** stats.norm.cdf(z) */
export const normCdf = (z: number) => 0.5 * erfc(-z / Math.SQRT2);
/** stats.norm.sf(z) = P(Z > z) */
export const normSf = (z: number) => 0.5 * erfc(z / Math.SQRT2);
/** stats.norm.pdf(x, mu, sigma) */
export const normPdf = (x: number, mu = 0, sigma = 1) => Math.exp(-0.5 * ((x - mu) / sigma) ** 2) / (sigma * Math.sqrt(2 * Math.PI));

const PA = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2, -3.066479806614716e1, 2.506628277459239];
const PB = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1];
const PC = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
const PD = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416];

/** stats.norm.ppf(p): algoritmo de Acklam, refinado com dois passos de Halley. */
export function normPpf(p: number): number {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  const plow = 0.02425;
  let x: number;
  if (p < plow) {
    const q = Math.sqrt(-2 * Math.log(p));
    x = (((((PC[0] * q + PC[1]) * q + PC[2]) * q + PC[3]) * q + PC[4]) * q + PC[5]) / ((((PD[0] * q + PD[1]) * q + PD[2]) * q + PD[3]) * q + 1);
  } else if (p <= 1 - plow) {
    const q = p - 0.5;
    const r = q * q;
    x =
      ((((((PA[0] * r + PA[1]) * r + PA[2]) * r + PA[3]) * r + PA[4]) * r + PA[5]) * q) /
      (((((PB[0] * r + PB[1]) * r + PB[2]) * r + PB[3]) * r + PB[4]) * r + 1);
  } else {
    const q = Math.sqrt(-2 * Math.log(1 - p));
    x = -(((((PC[0] * q + PC[1]) * q + PC[2]) * q + PC[3]) * q + PC[4]) * q + PC[5]) / ((((PD[0] * q + PD[1]) * q + PD[2]) * q + PD[3]) * q + 1);
  }
  for (let k = 0; k < 2; k++) {
    // e = Φ(x) − p; para p > 0,5 calcula-se pela cauda de cima, para não perder precisão
    const e = p > 0.5 ? 1 - p - normSf(x) : normCdf(x) - p;
    const u = e * Math.sqrt(2 * Math.PI) * Math.exp((x * x) / 2);
    x = x - u / (1 + (x * u) / 2);
  }
  return x;
}

/** stats.binom.logpmf(k, n, p) */
export function binomLogPmf(k: number, n: number, p: number): number {
  if (k < 0 || k > n) return -Infinity;
  if (p === 0) return k === 0 ? 0 : -Infinity;
  if (p === 1) return k === n ? 0 : -Infinity;
  return lgamma(n + 1) - lgamma(k + 1) - lgamma(n - k + 1) + k * Math.log(p) + (n - k) * Math.log1p(-p);
}
export const binomPmf = (k: number, n: number, p: number) => Math.exp(binomLogPmf(k, n, p));

// ---------------------------------------------------------------- gerador aleatório com semente

/** Gerador xoshiro128** com semente (inicializado por splitmix32). Devolve uniformes em [0, 1) com 53 bits. */
export type Rng = () => number;

export function makeRng(seed: number): Rng {
  let s = seed >>> 0;
  const split = () => {
    s = (s + 0x9e3779b9) >>> 0;
    let z = s;
    z = Math.imul(z ^ (z >>> 16), 0x85ebca6b) >>> 0;
    z = Math.imul(z ^ (z >>> 13), 0xc2b2ae35) >>> 0;
    return (z ^ (z >>> 16)) >>> 0;
  };
  let a = split();
  let b = split();
  let c = split();
  let d = split();
  if ((a | b | c | d) === 0) a = 1;
  const next = () => {
    const r = Math.imul(rotl(Math.imul(b, 5) >>> 0, 7), 9) >>> 0;
    const t = (b << 9) >>> 0;
    c ^= a;
    d ^= b;
    b ^= c;
    a ^= d;
    c ^= t;
    d = rotl(d, 11);
    return r;
  };
  return () => ((next() >>> 5) * 67108864 + (next() >>> 6)) / 9007199254740992;
}
const rotl = (x: number, k: number) => ((x << k) | (x >>> (32 - k))) >>> 0;

/** Uma amostra de uma binomial(n, p), exata: inversão a partir da moda, alternando para baixo e para cima. */
export function binomial(rng: Rng, n: number, p: number): number {
  if (n <= 0 || p <= 0) return 0;
  if (p >= 1) return n;
  const q = 1 - p;
  const m = Math.min(n, Math.floor((n + 1) * p));
  const pm = binomPmf(m, n, p);
  let u = rng() - pm;
  if (u < 0) return m;
  let lo = m;
  let hi = m;
  let plo = pm;
  let phi = pm;
  const down = q / p;
  const up = p / q;
  while (lo > 0 || hi < n) {
    if (lo > 0) {
      plo *= (lo / (n - lo + 1)) * down;
      lo--;
      u -= plo;
      if (u < 0) return lo;
    }
    if (hi < n) {
      phi *= ((n - hi) / (hi + 1)) * up;
      hi++;
      u -= phi;
      if (u < 0) return hi;
    }
  }
  return m; // só por arredondamento (a soma das probabilidades ficou um pouco abaixo de 1)
}

/** Uma amostra de uma exponencial com a média dada (rng.exponential(scale)). */
export const exponential = (rng: Rng, scale: number) => -scale * Math.log(1 - rng());

// ---------------------------------------------------------------- resumos

export const mean = (x: ArrayLike<number>) => {
  let s = 0;
  for (let i = 0; i < x.length; i++) s += x[i];
  return s / x.length;
};

/** Desvio padrão com ddof = 0, como `np.std`. */
export function std(x: ArrayLike<number>): number {
  const m = mean(x);
  let s = 0;
  for (let i = 0; i < x.length; i++) s += (x[i] - m) ** 2;
  return Math.sqrt(s / x.length);
}

/** scipy.stats.skew(x): m3 / m2^1,5 (enviesada). */
export function skew(x: ArrayLike<number>): number {
  const m = mean(x);
  let m2 = 0;
  let m3 = 0;
  for (let i = 0; i < x.length; i++) {
    const d = x[i] - m;
    m2 += d * d;
    m3 += d * d * d;
  }
  m2 /= x.length;
  m3 /= x.length;
  return m2 === 0 ? NaN : m3 / m2 ** 1.5;
}

/** np.percentile(x, q) com a interpolação linear de omissão. `sorted` tem de estar ordenado. */
export function percentile(sorted: ArrayLike<number>, q: number): number {
  const pos = (q / 100) * (sorted.length - 1);
  const i = Math.floor(pos);
  const f = pos - i;
  return i + 1 < sorted.length ? sorted[i] + (sorted[i + 1] - sorted[i]) * f : sorted[i];
}

/** Histograma de densidade: `bins` intervalos iguais entre lo e hi (os valores fora ficam de fora, como `range=` no Matplotlib). */
export function histogram(x: ArrayLike<number>, lo: number, hi: number, bins: number): { edges: number[]; density: number[]; counts: number[] } {
  const counts = new Array(bins).fill(0);
  const w = (hi - lo) / bins;
  for (let i = 0; i < x.length; i++) {
    const v = x[i];
    if (v < lo || v > hi) continue;
    let k = Math.floor((v - lo) / w);
    if (k === bins) k = bins - 1;
    counts[k]++;
  }
  const edges = Array.from({ length: bins + 1 }, (_, k) => lo + k * w);
  const density = counts.map((c) => c / (x.length * w));
  return { edges, density, counts };
}

// ---------------------------------------------------------------- formatação em português

/** 0.161 → "16,1%"; `digits` casas decimais na percentagem. */
export const pct = (x: number, digits = 1) => `${fmt(x * 100, digits)}%`;

/** Número com vírgula decimal e espaço fino nos milhares (10 000), como no texto da aula. */
export function fmt(x: number, digits = 0): string {
  if (!Number.isFinite(x)) return x > 0 ? "∞" : x < 0 ? "−∞" : "—";
  const s = Math.abs(x).toFixed(digits);
  const [int, dec] = s.split(".");
  const intS = int.length > 4 ? int.replace(/\B(?=(\d{3})+(?!\d))/g, " ") : int;
  const neg = x < 0 && Number(s) !== 0;
  return `${neg ? "−" : ""}${intS}${dec ? "," + dec : ""}`;
}

/** Contagem que pode não ser inteira (29,4 peças): mostra só as casas necessárias, até 2. */
export function fmtCount(x: number): string {
  for (const d of [0, 1, 2]) if (Math.abs(x - Number(x.toFixed(d))) < 1e-9) return fmt(x, d);
  return fmt(x, 2);
}

/** Percentagem sem zeros inúteis, até `digits` casas: 0.01 → "1%", 0.001 → "0,1%", 0.0525 → "5,25%". */
export function pctTrim(x: number, digits = 2): string {
  const s = fmt(x * 100, digits);
  return (s.includes(",") ? s.replace(/0+$/, "").replace(/,$/, "") : s) + "%";
}
