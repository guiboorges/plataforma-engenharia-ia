// DBSCAN (secção 3), com a mesma ordem de exploração do scikit-learn (dbscan_inner): percorrem-se os pontos pela
// ordem; cada ponto central ainda sem grupo começa um grupo novo, que cresce pelos vizinhos dos pontos centrais.
// Um ponto de fronteira ao alcance de dois grupos fica no primeiro que lá chega, como no scikit-learn.
// Vizinhos: distância euclidiana ≤ eps, contando com o próprio ponto; central: pelo menos min_samples vizinhos.
// Testado contra DBSCAN(eps, min_samples).fit(X).labels_ e core_sample_indices_ do scikit-learn 1.9 nas duas luas
// (eps de 0,02 a 0,40 e min_samples de 2 a 20): rótulos iguais, incluindo a numeração dos grupos.

export type P2 = [number, number];

export type DbscanResult = {
  /** −1 = ruído; 0, 1, … = grupos, pela ordem em que são encontrados */
  labels: Int32Array;
  core: Uint8Array;
  nClusters: number;
  nNoise: number;
  nCore: number;
};

const dist = (a: P2, b: P2) => Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);

/** Matriz de distâncias (n × n), calculada uma vez por conjunto de pontos. */
export function distances(pts: P2[]): Float64Array[] {
  return pts.map((p) => Float64Array.from(pts, (q) => dist(p, q)));
}

export function dbscan(D: Float64Array[], eps: number, minSamples: number): DbscanResult {
  const n = D.length;
  const neigh: number[][] = D.map((row) => {
    const out: number[] = [];
    for (let j = 0; j < n; j++) if (row[j] <= eps) out.push(j);
    return out;
  });
  const core = Uint8Array.from(neigh, (nb) => (nb.length >= minSamples ? 1 : 0));
  const labels = new Int32Array(n).fill(-1);
  let label = 0;
  const stack: number[] = [];
  for (let start = 0; start < n; start++) {
    if (labels[start] !== -1 || !core[start]) continue;
    let i = start;
    for (;;) {
      if (labels[i] === -1) {
        labels[i] = label;
        if (core[i]) for (const v of neigh[i]) if (labels[v] === -1) stack.push(v);
      }
      if (stack.length === 0) break;
      i = stack.pop()!;
    }
    label++;
  }
  let nNoise = 0;
  let nCore = 0;
  for (let i = 0; i < n; i++) {
    if (labels[i] === -1) nNoise++;
    nCore += core[i];
  }
  return { labels, core, nClusters: label, nNoise, nCore };
}

/** Distância de cada ponto ao seu vizinho número k, contando com ele próprio (como kneighbors(n_neighbors=k)[0][:, -1]). */
export function kDistances(D: Float64Array[], k: number): number[] {
  return D.map((row) => Float64Array.from(row).sort()[k - 1]);
}

/** np.percentile com interpolação linear (a predefinição), sobre valores já ordenados. */
export function percentile(sorted: ArrayLike<number>, q: number): number {
  const pos = ((sorted.length - 1) * q) / 100;
  const lo = Math.floor(pos);
  const hi = Math.min(lo + 1, sorted.length - 1);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}
