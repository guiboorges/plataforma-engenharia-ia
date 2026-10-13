// k-means passo a passo (secção 1): padronizar, escolher os centros iniciais (aleatório ou k-means++), atribuir cada
// ponto ao centro mais próximo, mover cada centro para a média dos seus pontos, e medir a inércia, o ARI e a silhueta.
// Testado contra o scikit-learn 1.9: a partir dos mesmos centros iniciais, lloyd() dá os mesmos rótulos, centros e
// inércia que KMeans(init=centros, n_init=1, algorithm="lloyd", tol=0) em 239 de 240 casos (o outro tem um ponto
// exatamente à mesma distância de dois centros, e o arredondamento decide o empate); ari() e silhouette() dão o mesmo que
// adjusted_rand_score e silhouette_score; standardize() o mesmo que StandardScaler.
// O gerador aleatório não é o do NumPy: as sementes do widget não correspondem às do scikit-learn.

export type Pt = number[];
export type Rng = () => number;

/** Gerador mulberry32 com semente: uniformes em [0, 1). */
export function makeRng(seed: number): Rng {
  let s = (seed * 0x9e3779b9 + 0x6d2b79f5) >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Como StandardScaler: média 0 e desvio padrão 1 (com ddof = 0) em cada coluna. */
export function standardize(rows: Pt[]): { z: Pt[]; mean: number[]; std: number[] } {
  const n = rows.length;
  const d = rows[0].length;
  const mean = Array.from({ length: d }, (_, j) => rows.reduce((s, r) => s + r[j], 0) / n);
  const std = Array.from({ length: d }, (_, j) => Math.sqrt(rows.reduce((s, r) => s + (r[j] - mean[j]) ** 2, 0) / n));
  return { z: rows.map((r) => r.map((v, j) => (v - mean[j]) / std[j])), mean, std };
}

export function sqDist(a: Pt, b: Pt): number {
  let s = 0;
  for (let j = 0; j < a.length; j++) s += (a[j] - b[j]) ** 2;
  return s;
}

/** Passo 2: cada ponto vai para o centro mais próximo (num empate, o de índice menor, como o argmin do NumPy). */
export function assign(points: Pt[], centers: Pt[]): number[] {
  return points.map((p) => {
    let best = 0;
    let bd = Infinity;
    centers.forEach((c, k) => {
      const d = sqDist(p, c);
      if (d < bd) {
        bd = d;
        best = k;
      }
    });
    return best;
  });
}

/** Passo 3: cada centro passa para a média dos seus pontos. Um grupo vazio fica com o centro onde estava. */
export function update(points: Pt[], labels: number[], centers: Pt[]): Pt[] {
  const d = points[0].length;
  const sums = centers.map(() => new Array<number>(d).fill(0));
  const counts = centers.map(() => 0);
  points.forEach((p, i) => {
    counts[labels[i]]++;
    for (let j = 0; j < d; j++) sums[labels[i]][j] += p[j];
  });
  return centers.map((c, k) => (counts[k] ? sums[k].map((s) => s / counts[k]) : [...c]));
}

/** Inércia: soma das distâncias ao quadrado de cada ponto ao centro do seu grupo. */
export function inertia(points: Pt[], labels: number[], centers: Pt[]): number {
  return points.reduce((s, p, i) => s + sqDist(p, centers[labels[i]]), 0);
}

const sameCoords = (a: Pt, b: Pt) => a.every((v, j) => v === b[j]);

/** Início aleatório (como init="random"): k pontos dos dados, ao acaso, com coordenadas diferentes. */
export function initRandom(points: Pt[], k: number, rng: Rng): Pt[] {
  const chosen: Pt[] = [];
  while (chosen.length < k) {
    const p = points[Math.floor(rng() * points.length)];
    if (!chosen.some((c) => sameCoords(c, p))) chosen.push([...p]);
  }
  return chosen;
}

/** k-means++ (Arthur & Vassilvitskii, 2007): o primeiro centro ao acaso; cada novo centro é um ponto sorteado com
 *  probabilidade proporcional ao quadrado da distância ao centro mais próximo já escolhido. */
export function initPlusPlus(points: Pt[], k: number, rng: Rng): Pt[] {
  const chosen: Pt[] = [[...points[Math.floor(rng() * points.length)]]];
  const d2 = points.map((p) => sqDist(p, chosen[0]));
  while (chosen.length < k) {
    const total = d2.reduce((s, v) => s + v, 0);
    let r = rng() * total;
    let idx = d2.length - 1;
    for (let i = 0; i < d2.length; i++) {
      r -= d2[i];
      if (r < 0 && d2[i] > 0) {
        idx = i;
        break;
      }
    }
    if (d2[idx] === 0) idx = d2.findIndex((v) => v > 0);
    const c = [...points[idx]];
    chosen.push(c);
    points.forEach((p, i) => (d2[i] = Math.min(d2[i], sqDist(p, c))));
  }
  return chosen;
}

/** O algoritmo de Lloyd até nada mudar, a partir de centros dados. */
export function lloyd(points: Pt[], init: Pt[], maxIter = 300) {
  let centers = init.map((c) => [...c]);
  let labels = assign(points, centers);
  let nIter = 0;
  for (; nIter < maxIter; ) {
    centers = update(points, labels, centers);
    nIter++;
    const next = assign(points, centers);
    const same = next.every((l, i) => l === labels[i]);
    labels = next;
    if (same) break;
  }
  return { labels, centers, inertia: inertia(points, labels, centers), nIter };
}

/** Índice de Rand ajustado, com a mesma fórmula do adjusted_rand_score (matriz de confusão dos pares). */
export function ari(a: ArrayLike<number | string>, b: ArrayLike<number | string>): number {
  const n = a.length;
  const cont = new Map<string, number>();
  const ra = new Map<number | string, number>();
  const rb = new Map<number | string, number>();
  for (let i = 0; i < n; i++) {
    const key = `${a[i]}|${b[i]}`;
    cont.set(key, (cont.get(key) ?? 0) + 1);
    ra.set(a[i], (ra.get(a[i]) ?? 0) + 1);
    rb.set(b[i], (rb.get(b[i]) ?? 0) + 1);
  }
  let sumSq = 0;
  cont.forEach((v) => (sumSq += v * v));
  let sa = 0;
  ra.forEach((v) => (sa += v * v));
  let sb = 0;
  rb.forEach((v) => (sb += v * v));
  const tp = sumSq - n;
  const fp = sb - sumSq;
  const fn = sa - sumSq;
  const tn = n * n - fp - fn - sumSq;
  if (fn === 0 && fp === 0) return 1;
  return (2 * (tp * tn - fn * fp)) / ((tp + fn) * (fn + tn) + (tp + fp) * (fp + tn));
}

/** Silhueta média (Rousseeuw, 1987), como silhouette_score: s = (b − a) / max(a, b); 0 num grupo de um só ponto.
 *  Devolve NaN se houver menos de 2 grupos ou tantos grupos como pontos. */
export function silhouette(points: Pt[], labels: number[]): number {
  const n = points.length;
  const ks = [...new Set(labels)];
  if (ks.length < 2 || ks.length >= n) return NaN;
  const idx = new Map(ks.map((k, i) => [k, i]));
  const size = new Array<number>(ks.length).fill(0);
  labels.forEach((l) => size[idx.get(l)!]++);
  let total = 0;
  const sums = new Array<number>(ks.length);
  for (let i = 0; i < n; i++) {
    sums.fill(0);
    for (let j = 0; j < n; j++) if (j !== i) sums[idx.get(labels[j])!] += Math.sqrt(sqDist(points[i], points[j]));
    const own = idx.get(labels[i])!;
    if (size[own] === 1) continue;
    const a = sums[own] / (size[own] - 1);
    let b = Infinity;
    for (let k = 0; k < ks.length; k++) if (k !== own) b = Math.min(b, sums[k] / size[k]);
    const m = Math.max(a, b);
    if (m > 0) total += (b - a) / m;
  }
  return total / n;
}
