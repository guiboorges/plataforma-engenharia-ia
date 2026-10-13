// A geometria do Lasso e do Ridge (secção 3, figura 03), sem dependências (testado com `node` contra o SciPy 1.18).
// Com dois coeficientes, o erro de treino é uma taça cujas curvas de nível são elipses à volta da solução dos mínimos
// quadrados c: RSS(β) = (β − c)ᵀ A (β − c) (mais uma constante). A forma A e o centro c = (2,2; 1,0) são os da figura
// (codigo/figuras_m8.py: 1,2·(β₁ − 2,2)² + 0,9·(β₂ − 1)² + 1,1·(β₁ − 2,2)(β₂ − 1)).
// Ridge e Lasso na forma de restrição: o melhor β com ‖β‖₂ ≤ t (círculo) ou ‖β‖₁ ≤ t (losango).

export type Vec = [number, number];
export type Mat = [[number, number], [number, number]];

export const A_FIG: Mat = [
  [1.2, 0.55],
  [0.55, 0.9],
];
export const C_FIG: Vec = [2.2, 1.0];

/** RSS(β) − RSS(c) = (β − c)ᵀ A (β − c). */
export function rss(b: Vec, c: Vec, A: Mat = A_FIG): number {
  const d0 = b[0] - c[0];
  const d1 = b[1] - c[1];
  return A[0][0] * d0 * d0 + 2 * A[0][1] * d0 * d1 + A[1][1] * d1 * d1;
}

const norm2 = (b: Vec) => Math.hypot(b[0], b[1]);
const norm1 = (b: Vec) => Math.abs(b[0]) + Math.abs(b[1]);

/** Ridge na forma de restrição: (A + λI) β = A c, com λ ≥ 0 tal que ‖β‖₂ = t (bisseção; ‖β(λ)‖ desce com λ). */
export function ridgeConstrained(t: number, c: Vec, A: Mat = A_FIG): { beta: Vec; lambda: number } {
  if (norm2(c) <= t) return { beta: [c[0], c[1]], lambda: 0 };
  const Ac: Vec = [A[0][0] * c[0] + A[0][1] * c[1], A[1][0] * c[0] + A[1][1] * c[1]];
  const at = (lam: number): Vec => {
    const a = A[0][0] + lam;
    const d = A[1][1] + lam;
    const b = A[0][1];
    const det = a * d - b * b;
    return [(d * Ac[0] - b * Ac[1]) / det, (a * Ac[1] - b * Ac[0]) / det];
  };
  if (t <= 0) return { beta: [0, 0], lambda: Infinity };
  let lo = 0;
  let hi = 1;
  while (norm2(at(hi)) > t) hi *= 2;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (norm2(at(mid)) > t) lo = mid;
    else hi = mid;
  }
  return { beta: at(hi), lambda: hi };
}

/** Lasso na forma de restrição: o mínimo da taça no losango |β₁| + |β₂| ≤ t. Se c estiver fora, o mínimo está na
 *  fronteira: em cada um dos quatro lados a função é uma parábola, minimizada de forma exata. */
export function lassoConstrained(t: number, c: Vec, A: Mat = A_FIG): { beta: Vec; corner: boolean } {
  if (norm1(c) <= t) return { beta: [c[0], c[1]], corner: false };
  if (t <= 0) return { beta: [0, 0], corner: true };
  const V: Vec[] = [
    [t, 0],
    [0, t],
    [-t, 0],
    [0, -t],
  ];
  let best: Vec = V[0];
  let bestF = Infinity;
  for (let e = 0; e < 4; e++) {
    const P = V[e];
    const Q = V[(e + 1) % 4];
    const d: Vec = [Q[0] - P[0], Q[1] - P[1]];
    const pc: Vec = [P[0] - c[0], P[1] - c[1]];
    const Ad: Vec = [A[0][0] * d[0] + A[0][1] * d[1], A[1][0] * d[0] + A[1][1] * d[1]];
    const s = Math.min(1, Math.max(0, -(pc[0] * Ad[0] + pc[1] * Ad[1]) / (d[0] * Ad[0] + d[1] * Ad[1])));
    const b: Vec = [P[0] + s * d[0], P[1] + s * d[1]];
    const f = rss(b, c, A);
    if (f < bestF - 1e-15) {
      bestF = f;
      best = b;
    }
  }
  // num canto do losango, um dos coeficientes é exatamente zero
  const corner = Math.abs(Math.abs(best[0]) - t) < 1e-12 || Math.abs(Math.abs(best[1]) - t) < 1e-12;
  if (corner) best = Math.abs(best[0]) > Math.abs(best[1]) ? [Math.sign(best[0]) * t, 0] : [0, Math.sign(best[1]) * t];
  return { beta: best, corner };
}

/** Pontos da curva de nível RSS = k (uma elipse à volta de c), para desenhar. */
export function ellipse(c: Vec, k: number, A: Mat = A_FIG, m = 96): Vec[] {
  // A = V diag(l1, l2) Vᵀ; os pontos são c + √k · V diag(1/√l1, 1/√l2) u, com u no círculo unitário
  const a = A[0][0];
  const b = A[0][1];
  const d = A[1][1];
  const tr = a + d;
  const disc = Math.sqrt(((a - d) / 2) ** 2 + b * b);
  const l1 = tr / 2 + disc;
  const l2 = tr / 2 - disc;
  const v1: Vec = Math.abs(b) > 1e-15 ? [l1 - d, b] : a >= d ? [1, 0] : [0, 1];
  const n1 = Math.hypot(v1[0], v1[1]);
  const e1: Vec = [v1[0] / n1, v1[1] / n1];
  const e2: Vec = [-e1[1], e1[0]];
  const r1 = Math.sqrt(k / l1);
  const r2 = Math.sqrt(k / l2);
  const pts: Vec[] = [];
  for (let i = 0; i <= m; i++) {
    const th = (2 * Math.PI * i) / m;
    const u = r1 * Math.cos(th);
    const v = r2 * Math.sin(th);
    pts.push([c[0] + u * e1[0] + v * e2[0], c[1] + u * e1[1] + v * e2[1]]);
  }
  return pts;
}
