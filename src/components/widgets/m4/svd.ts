// SVD de uma matriz pequena e reconstrução com as k primeiras camadas (secção 6), sem dependências, para poder ser
// testada com `node`. Os valores singulares são as raízes dos valores próprios de AᵀA (método de Jacobi, que é exato
// até ao arredondamento para matrizes simétricas pequenas), e a aproximação com k camadas é A·Vₖ·Vₖᵀ, que é igual a
// U[:, :k] @ np.diag(s[:k]) @ Vt[:k, :] e não depende dos sinais escolhidos para U e V.
// Testado contra np.linalg.svd (NumPy 2.5): valores singulares, matriz reconstruída e erro relativo.

export type Matrix = number[][];

/** Valores e vetores próprios de uma matriz simétrica (Jacobi cíclico). Colunas de `vectors` = vetores próprios. */
export function eigSym(S: Matrix): { values: number[]; vectors: Matrix } {
  const n = S.length;
  const a = S.map((r) => [...r]);
  const v: Matrix = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
  for (let sweep = 0; sweep < 100; sweep++) {
    let off = 0;
    for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) off += a[p][q] * a[p][q];
    if (off < 1e-30) break;
    for (let p = 0; p < n; p++) {
      for (let q = p + 1; q < n; q++) {
        if (Math.abs(a[p][q]) < 1e-300) continue;
        const theta = (a[q][q] - a[p][p]) / (2 * a[p][q]);
        const t = Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1));
        const c = 1 / Math.sqrt(t * t + 1);
        const s = t * c;
        for (let k = 0; k < n; k++) {
          const akp = a[k][p];
          const akq = a[k][q];
          a[k][p] = c * akp - s * akq;
          a[k][q] = s * akp + c * akq;
        }
        for (let k = 0; k < n; k++) {
          const apk = a[p][k];
          const aqk = a[q][k];
          a[p][k] = c * apk - s * aqk;
          a[q][k] = s * apk + c * aqk;
        }
        for (let k = 0; k < n; k++) {
          const vkp = v[k][p];
          const vkq = v[k][q];
          v[k][p] = c * vkp - s * vkq;
          v[k][q] = s * vkp + c * vkq;
        }
      }
    }
  }
  return { values: a.map((r, i) => r[i]), vectors: v };
}

export type Svd = {
  /** valores singulares, do maior para o menor (como `s` do np.linalg.svd) */
  s: number[];
  /** linhas = vetores singulares direitos vᵢ (como `Vt`), pela mesma ordem */
  Vt: Matrix;
  rows: number;
  cols: number;
};

export function svd(A: Matrix): Svd {
  const m = A.length;
  const n = A[0].length;
  const AtA: Matrix = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => {
      let s = 0;
      for (let k = 0; k < m; k++) s += A[k][i] * A[k][j];
      return s;
    }),
  );
  const { values, vectors } = eigSym(AtA);
  const order = values.map((_, i) => i).sort((i, j) => values[j] - values[i]);
  const r = Math.min(m, n);
  const keep = order.slice(0, r);
  // As raízes de valores próprios de AᵀA perto de 0 têm um erro de cerca de 1e-8 × σ₁ (o NumPy dá ~1e-16): abaixo
  // disso, são zeros e a matriz não tem mais camadas.
  const top = Math.sqrt(Math.max(0, values[order[0]] ?? 0));
  return {
    s: keep.map((i) => {
      const sv = Math.sqrt(Math.max(0, values[i]));
      return sv < 1e-6 * top ? 0 : sv;
    }),
    Vt: keep.map((i) => vectors.map((row) => row[i])),
    rows: m,
    cols: n,
  };
}

/** A aproximação com as k primeiras camadas: A·Vₖ·Vₖᵀ = σ₁u₁v₁ᵀ + … + σₖuₖvₖᵀ. */
export function reconstruct(A: Matrix, d: Svd, k: number): Matrix {
  const m = A.length;
  const n = A[0].length;
  const V = d.Vt.slice(0, k);
  // B = A·Vₖ (m × k)
  const B = A.map((row) => V.map((vi) => row.reduce((s, x, j) => s + x * vi[j], 0)));
  return Array.from({ length: m }, (_, i) => Array.from({ length: n }, (_, j) => B[i].reduce((s, b, l) => s + b * V[l][j], 0)));
}

/** ‖A‖ de Frobenius: np.linalg.norm de uma matriz. */
export function frob(A: Matrix): number {
  return Math.sqrt(A.reduce((s, r) => s + r.reduce((t, x) => t + x * x, 0), 0));
}

/** Erro relativo ‖A − Aₖ‖ / ‖A‖, calculado só com os valores singulares (o atalho do exercício 10). */
export function relError(s: number[], k: number): number {
  const tot = s.reduce((a, x) => a + x * x, 0);
  const rest = s.slice(k).reduce((a, x) => a + x * x, 0);
  return tot === 0 ? 0 : Math.sqrt(rest / tot);
}

/** Fração da "energia" (soma dos σ²) guardada pelas k primeiras camadas. */
export function energy(s: number[], k: number): number {
  const tot = s.reduce((a, x) => a + x * x, 0);
  return tot === 0 ? 1 : s.slice(0, k).reduce((a, x) => a + x * x, 0) / tot;
}

/** Números guardados com k camadas: k colunas de U, k linhas de Vᵀ e k valores singulares. */
export function stored(rows: number, cols: number, k: number): number {
  return k * (rows + cols + 1);
}

// ---------------------------------------------------------------- imagens de 16 × 16 (0 = escuro, 1 = claro)

/** Pixel art: '.' céu, 'g' relva, 'p' mastro, 'f' bandeira, 'b' bola, 'h' buraco. */
const FLAG_ART = [
  "................",
  "......pffff.....",
  "......pffffff...",
  "......pfffffff..",
  "......pffff.....",
  "......p.........",
  "......p.........",
  "......p.........",
  "......p.........",
  "......p.........",
  "......p.........",
  "gggggghgggbbgggg",
  "ggggggggggbbgggg",
  "gggggggggggggggg",
  "gggggggggggggggg",
  "gggggggggggggggg",
];
const LEVEL: Record<string, number> = { ".": 0.85, g: 0.3, p: 0.1, f: 0.55, b: 1, h: 0 };

export const FLAG: Matrix = FLAG_ART.map((r) => [...r].map((ch) => LEVEL[ch]));

/** Degradé: produto de uma coluna por uma linha, por isso tem uma só camada (característica 1). */
export const GRADIENT: Matrix = Array.from({ length: 16 }, (_, i) => Array.from({ length: 16 }, (_, j) => ((i + 1) * (j + 1)) / 256));

/** Ruído: números pseudoaleatórios fixos entre 0 e 1 (gerador de Park e Miller com semente 2026, 2 casas decimais). */
export const NOISE: Matrix = (() => {
  let x = 2026;
  const next = () => {
    x = (x * 16807) % 2147483647;
    return x / 2147483647;
  };
  return Array.from({ length: 16 }, () => Array.from({ length: 16 }, () => Math.round(next() * 100) / 100));
})();
