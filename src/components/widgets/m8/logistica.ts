// Regressão logística com os dados Default (secção 2), sem dependências (testado com `node` contra o scikit-learn 1.9).
// Os 10 000 clientes estão agrupados pelo saldo, de 100 em 100 dólares: em cada grupo, o saldo médio (arredondado ao
// dólar), o número de clientes e quantos falharam. O ajuste de máxima verosimilhança destes grupos dá
// β₀ = −10,647 e β₁ = 0,005500, quase igual ao dos dados completos (−10,651 e 0,005499, a curva da figura 01).

export const BINS = {
  balance: [17, 152, 254, 351, 450, 551, 650, 752, 850, 949, 1049, 1149, 1247, 1348, 1448, 1548, 1646, 1747, 1842, 1946, 2047, 2142, 2241, 2353, 2447, 2541, 2654],
  n: [758, 316, 423, 530, 586, 668, 755, 783, 770, 779, 722, 616, 555, 471, 357, 277, 189, 157, 118, 64, 47, 28, 14, 10, 4, 2, 1],
  defaults: [0, 0, 0, 0, 0, 0, 2, 1, 0, 3, 5, 11, 10, 20, 23, 37, 23, 36, 50, 31, 33, 22, 13, 6, 4, 2, 1],
};

export const TOTAL = BINS.n.reduce((a, b) => a + b, 0);

export function sigmoid(z: number): number {
  return z >= 0 ? 1 / (1 + Math.exp(-z)) : Math.exp(z) / (1 + Math.exp(z));
}

/** log(1 + e^z) sem transbordar. */
function softplus(z: number): number {
  return z > 0 ? z + Math.log1p(Math.exp(-z)) : Math.log1p(Math.exp(z));
}

/** Entropia cruzada binária média (a perda que a máxima verosimilhança minimiza) nos 10 000 clientes agrupados. */
export function logLoss(b0: number, b1: number): number {
  let s = 0;
  for (let i = 0; i < BINS.n.length; i++) {
    const z = b0 + b1 * BINS.balance[i];
    const k = BINS.defaults[i];
    // −log σ(z) = softplus(−z); −log(1 − σ(z)) = softplus(z)
    s += k * softplus(-z) + (BINS.n[i] - k) * softplus(z);
  }
  return s / TOTAL;
}

/** Máxima verosimilhança pelo método de Newton (como o lbfgs do scikit-learn com C = ∞, mas exato em poucos passos). */
export function fitLogistic(): { b0: number; b1: number; iterations: number } {
  // escala o saldo para milhares de dólares para a matriz ficar bem condicionada
  const sc = 1000;
  let a = 0;
  let b = 0;
  let it = 0;
  for (; it < 100; it++) {
    let g0 = 0, g1 = 0, h00 = 0, h01 = 0, h11 = 0;
    for (let i = 0; i < BINS.n.length; i++) {
      const x = BINS.balance[i] / sc;
      const p = sigmoid(a + b * x);
      const r = BINS.n[i] * p - BINS.defaults[i];
      const w = BINS.n[i] * p * (1 - p);
      g0 += r;
      g1 += r * x;
      h00 += w;
      h01 += w * x;
      h11 += w * x * x;
    }
    const det = h00 * h11 - h01 * h01;
    const da = (h11 * g0 - h01 * g1) / det;
    const db = (h00 * g1 - h01 * g0) / det;
    a -= da;
    b -= db;
    if (Math.abs(da) < 1e-12 && Math.abs(db) < 1e-12) break;
  }
  return { b0: a, b1: b / sc, iterations: it + 1 };
}

/** Regressão linear (mínimos quadrados) da variável 0/1 no saldo, com os mesmos grupos: a reta da figura 01. */
export function fitLinear(): { b0: number; b1: number } {
  let sw = 0, sx = 0, sy = 0, sxx = 0, sxy = 0;
  for (let i = 0; i < BINS.n.length; i++) {
    const w = BINS.n[i];
    const x = BINS.balance[i];
    sw += w;
    sx += w * x;
    sy += BINS.defaults[i];
    sxx += w * x * x;
    sxy += BINS.defaults[i] * x;
  }
  const mx = sx / sw;
  const my = sy / sw;
  const b1 = (sxy - sw * mx * my) / (sxx - sw * mx * mx);
  return { b0: my - b1 * mx, b1 };
}

/** Chances p / (1 − p). */
export function odds(p: number): number {
  return p / (1 - p);
}
