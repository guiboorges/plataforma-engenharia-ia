// PCA em duas dimensões (secção 4): valores e vetores próprios de uma matriz de covariância 2 × 2,
// fração da variância explicada, variância da projeção numa direção qualquer e uma nuvem de pontos com essa
// covariância exata. Testado contra np.linalg.eigh e PCA do scikit-learn 1.9 (explained_variance_ratio_ e
// components_, a menos do sinal), e np.cov da nuvem gerada.

export type V2 = [number, number];
/** Matriz simétrica [[a, b], [b, c]]: a = Var(x), b = Cov(x, y), c = Var(y). */
export type Sym2 = { a: number; b: number; c: number };

export type Eig2 = { l1: number; l2: number; v1: V2; v2: V2 };

/** Valores próprios (l1 ≥ l2) e vetores próprios de norma 1. O sinal é arbitrário; aqui, a 1.ª coordenada de v1 é ≥ 0. */
export function eigSym2({ a, b, c }: Sym2): Eig2 {
  const m = (a + c) / 2;
  const r = Math.hypot((a - c) / 2, b);
  const l1 = m + r;
  const l2 = m - r;
  let v1: V2;
  if (Math.abs(b) > 1e-12 * Math.max(1, Math.abs(a), Math.abs(c))) {
    // (A − l1·I)v = 0  →  (a − l1)x + b·y = 0  →  v ∝ (b, l1 − a)
    const x = b;
    const y = l1 - a;
    const nrm = Math.hypot(x, y);
    v1 = [x / nrm, y / nrm];
  } else {
    v1 = a >= c ? [1, 0] : [0, 1];
  }
  if (v1[0] < 0 || (v1[0] === 0 && v1[1] < 0)) v1 = [-v1[0], -v1[1]];
  const v2: V2 = [-v1[1], v1[0]];
  return { l1, l2, v1, v2 };
}

/** Variância dos dados projetados na direção do ângulo theta (em radianos): uᵀΣu, com u = (cos θ, sin θ). */
export function projVar({ a, b, c }: Sym2, theta: number): number {
  const x = Math.cos(theta);
  const y = Math.sin(theta);
  return a * x * x + 2 * b * x * y + c * y * y;
}

/** Matriz de correlações: o que a PCA vê depois de padronizar. */
export function toCorr(s: Sym2): Sym2 {
  return { a: 1, b: s.b / Math.sqrt(s.a * s.c), c: 1 };
}

/** Covariância amostral (com n − 1, como np.cov e a PCA do scikit-learn). */
export function sampleCov(pts: V2[]): Sym2 {
  const n = pts.length;
  const mx = pts.reduce((s, p) => s + p[0], 0) / n;
  const my = pts.reduce((s, p) => s + p[1], 0) / n;
  let a = 0;
  let b = 0;
  let c = 0;
  for (const [x, y] of pts) {
    a += (x - mx) ** 2;
    b += (x - mx) * (y - my);
    c += (y - my) ** 2;
  }
  return { a: a / (n - 1), b: b / (n - 1), c: c / (n - 1) };
}

/** Gerador mulberry32 + Box-Muller: normais padrão com semente. */
function normals(n: number, seed: number): number[] {
  let s = seed >>> 0;
  const u = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return (((t ^ (t >>> 14)) >>> 0) + 0.5) / 4294967296;
  };
  const out: number[] = [];
  while (out.length < n) {
    const r = Math.sqrt(-2 * Math.log(u()));
    const th = 2 * Math.PI * u();
    out.push(r * Math.cos(th), r * Math.sin(th));
  }
  return out.slice(0, n);
}

/** n pontos com média 0 e covariância amostral exatamente igual à identidade (normais "branqueadas"). */
export function whiteSample(n: number, seed: number): V2[] {
  const z = normals(2 * n, seed);
  let pts: V2[] = Array.from({ length: n }, (_, i) => [z[2 * i], z[2 * i + 1]]);
  const mx = pts.reduce((s, p) => s + p[0], 0) / n;
  const my = pts.reduce((s, p) => s + p[1], 0) / n;
  pts = pts.map(([x, y]) => [x - mx, y - my]);
  // dividir pela raiz de Cholesky da covariância: L⁻¹ p tem covariância I
  const S = sampleCov(pts);
  const l11 = Math.sqrt(S.a);
  const l21 = S.b / l11;
  const l22 = Math.sqrt(S.c - l21 * l21);
  return pts.map(([x, y]) => {
    const u = x / l11;
    return [u, (y - l21 * u) / l22];
  });
}

/** Leva pontos com covariância I para pontos com covariância Σ (multiplica pela raiz de Cholesky de Σ). */
export function shape(white: V2[], s: Sym2): V2[] {
  const l11 = Math.sqrt(s.a);
  const l21 = s.b / l11;
  const l22 = Math.sqrt(Math.max(s.c - l21 * l21, 0));
  return white.map(([u, v]) => [l11 * u, l21 * u + l22 * v]);
}
