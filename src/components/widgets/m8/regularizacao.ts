// Ridge e Lasso nos dados Hitters (secção 3), sem dependências (testado com `node` contra o scikit-learn 1.9).
// Em vez dos 263 × 19 valores, guarda-se o que os dois métodos precisam com as variáveis padronizadas
// (StandardScaler, ddof = 0) e o salário centrado: a matriz de correlações R = ZᵀZ / n e o vetor r = Zᵀ(y − ȳ) / n.
// Com isto, os coeficientes são exatamente os do scikit-learn:
//   Ridge(alpha):  minimiza ‖y − Zβ‖² + α‖β‖²            →  (nR + αI) β = n r
//   Lasso(alpha):  minimiza ‖y − Zβ‖² / (2n) + α‖β‖₁     →  descida por coordenadas: βⱼ = S(rⱼ − Σₖ≠ⱼ Rⱼₖ βₖ, α)
// O termo constante não é penalizado: é sempre a média do salário (535,9 mil dólares).

export const HITTERS = {
  names: ["AtBat", "Hits", "HmRun", "Runs", "RBI", "Walks", "Years", "CAtBat", "CHits", "CHmRun", "CRuns", "CRBI", "CWalks", "PutOuts", "Assists", "Errors", "League_N", "Division_W", "NewLeague_N"],
  n: 263,
  yMean: 535.9259,
  yVar: 202734.2692,
  R: [
    [1.0, 0.963969, 0.555102, 0.899829, 0.796015, 0.624448, 0.012725, 0.207166, 0.225341, 0.212422, 0.237278, 0.221393, 0.132926, 0.309607, 0.342117, 0.325577, -0.153176, -0.056341, -0.089838],
    [0.963969, 1.0, 0.530627, 0.91063, 0.788478, 0.587311, 0.018598, 0.206678, 0.235606, 0.189364, 0.238896, 0.219384, 0.122971, 0.299688, 0.303975, 0.279876, -0.153522, -0.083266, -0.09499],
    [0.555102, 0.530627, 1.0, 0.631076, 0.849107, 0.440454, 0.113488, 0.217464, 0.217496, 0.492526, 0.258347, 0.349858, 0.227183, 0.250931, -0.161602, -0.009743, -0.222965, -0.034851, -0.199424],
    [0.899829, 0.91063, 0.631076, 1.0, 0.778692, 0.697015, -0.011975, 0.171811, 0.191327, 0.229701, 0.237831, 0.202335, 0.1637, 0.27116, 0.179258, 0.192609, -0.206001, -0.107672, -0.154911],
    [0.796015, 0.788478, 0.849107, 0.778692, 1.0, 0.569505, 0.129668, 0.278126, 0.292137, 0.44219, 0.307226, 0.387777, 0.233619, 0.312065, 0.062902, 0.150155, -0.185858, -0.090157, -0.143549],
    [0.624448, 0.587311, 0.440454, 0.697015, 0.569505, 1.0, 0.134793, 0.26945, 0.270795, 0.349582, 0.332977, 0.312697, 0.42914, 0.280855, 0.102523, 0.081937, -0.06576, -0.072732, -0.028461],
    [0.012725, 0.018598, 0.113488, -0.011975, 0.129668, 0.134793, 1.0, 0.915681, 0.897844, 0.722371, 0.876649, 0.863809, 0.837524, -0.020019, -0.085118, -0.156512, -0.032893, -0.020316, -0.023964],
    [0.207166, 0.206678, 0.217464, 0.171811, 0.278126, 0.26945, 0.915681, 1.0, 0.995057, 0.801676, 0.982747, 0.95073, 0.906712, 0.053393, -0.007897, -0.070478, -0.023704, -0.018623, -0.004294],
    [0.225341, 0.235606, 0.217496, 0.191327, 0.292137, 0.270795, 0.897844, 0.995057, 1.0, 0.786652, 0.984542, 0.946797, 0.890718, 0.067348, -0.013144, -0.068036, -0.022853, -0.023642, 0.000887],
    [0.212422, 0.189364, 0.492526, 0.229701, 0.44219, 0.349582, 0.722371, 0.801676, 0.786652, 1.0, 0.825625, 0.927903, 0.810878, 0.093822, -0.188886, -0.165369, -0.107299, -0.026987, -0.100298],
    [0.237278, 0.238896, 0.258347, 0.237831, 0.307226, 0.332977, 0.876649, 0.982747, 0.984542, 0.825625, 1.0, 0.945677, 0.927768, 0.059087, -0.038895, -0.094081, -0.054318, -0.046812, -0.034618],
    [0.221393, 0.219384, 0.349858, 0.202335, 0.387777, 0.312697, 0.863809, 0.95073, 0.946797, 0.927903, 0.945677, 1.0, 0.889137, 0.095375, -0.096559, -0.115316, -0.051421, -0.021564, -0.037184],
    [0.132926, 0.122971, 0.227183, 0.1637, 0.233619, 0.42914, 0.837524, 0.906712, 0.890718, 0.810878, 0.927768, 0.889137, 1.0, 0.05816, -0.066243, -0.129936, -0.028988, -0.050494, -0.025703],
    [0.309607, 0.299688, 0.250931, 0.27116, 0.312065, 0.280855, -0.020019, 0.053393, 0.067348, 0.093822, 0.059087, 0.095375, 0.05816, 1.0, -0.04339, 0.075306, 0.039525, -0.025351, 0.055048],
    [0.342117, 0.303975, -0.161602, 0.179258, 0.062902, 0.102523, -0.085118, -0.007897, -0.013144, -0.188886, -0.038895, -0.096559, -0.066243, -0.04339, 1.0, 0.703505, 0.05206, -0.017486, 0.044136],
    [0.325577, 0.279876, -0.009743, 0.192609, 0.150155, 0.081937, -0.156512, -0.070478, -0.068036, -0.165369, -0.094081, -0.115316, -0.129936, 0.075306, 0.703505, 1.0, 0.091774, -0.000557, 0.063173],
    [-0.153176, -0.153522, -0.222965, -0.206001, -0.185858, -0.06576, -0.032893, -0.023704, -0.022853, -0.107299, -0.054318, -0.051421, -0.028988, 0.039525, 0.05206, 0.091774, 1.0, -0.002723, 0.862652],
    [-0.056341, -0.083266, -0.034851, -0.107672, -0.090157, -0.072732, -0.020316, -0.018623, -0.023642, -0.026987, -0.046812, -0.021564, -0.050494, -0.025351, -0.017486, -0.000557, -0.002723, 1.0, -0.002436],
    [-0.089838, -0.09499, -0.199424, -0.154911, -0.143549, -0.028461, -0.023964, -0.004294, 0.000887, -0.100298, -0.034618, -0.037184, -0.025703, 0.055048, 0.044136, 0.063173, 0.862652, -0.002436, 1.0],
  ],
  r: [177.7497, 197.5178, 154.4519, 189.0456, 202.3726, 199.8558, 180.3999, 236.8978, 247.1521, 236.3554, 253.3514, 255.2821, 220.5474, 135.2944, 11.4529, -2.4317, -6.4305, -86.6816, -1.2762],
};

export const P = HITTERS.names.length;

/** Resolve A x = b por eliminação de Gauss com pivô parcial (A simétrica definida positiva, 19 × 19). */
function solve(A: number[][], b: number[]): number[] {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let c = 0; c < n; c++) {
    let piv = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[piv][c])) piv = r;
    [M[c], M[piv]] = [M[piv], M[c]];
    for (let r = c + 1; r < n; r++) {
      const f = M[r][c] / M[c][c];
      if (f === 0) continue;
      for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
    }
  }
  const x = new Array<number>(n).fill(0);
  for (let r = n - 1; r >= 0; r--) {
    let s = M[r][n];
    for (let k = r + 1; k < n; k++) s -= M[r][k] * x[k];
    x[r] = s / M[r][r];
  }
  return x;
}

/** Coeficientes do Ridge (escala de α do scikit-learn: `Ridge(alpha)`); α = 0 dá os mínimos quadrados. */
export function ridge(alpha: number): number[] {
  const { n, R, r } = HITTERS;
  const A = R.map((row, i) => row.map((v, j) => n * v + (i === j ? alpha : 0)));
  return solve(A, r.map((v) => n * v));
}

function soft(z: number, g: number): number {
  return z > g ? z - g : z < -g ? z + g : 0;
}

/** Coeficientes do Lasso (escala de α do scikit-learn: `Lasso(alpha)`), por descida por coordenadas.
 *  `start` permite partir da solução de um α vizinho (caminho com arranque a quente, como o `lasso_path`). */
export function lasso(alpha: number, start?: number[], tol = 1e-10, maxIter = 100_000): number[] {
  const { R, r } = HITTERS;
  const b = start ? [...start] : new Array<number>(P).fill(0);
  for (let it = 0; it < maxIter; it++) {
    let maxDelta = 0;
    for (let j = 0; j < P; j++) {
      let z = r[j];
      const Rj = R[j];
      for (let k = 0; k < P; k++) if (k !== j) z -= Rj[k] * b[k];
      const nb = soft(z, alpha) / Rj[j];
      maxDelta = Math.max(maxDelta, Math.abs(nb - b[j]));
      b[j] = nb;
    }
    if (maxDelta < tol) break;
  }
  return b;
}

/** α em escala logarítmica entre 10^lo e 10^hi, `count` valores (como `np.logspace(lo, hi, count)`). */
export function logspace(lo: number, hi: number, count: number): number[] {
  return Array.from({ length: count }, (_, i) => 10 ** (lo + ((hi - lo) * i) / (count - 1)));
}

/** Caminho dos coeficientes para cada α (cada linha: os 19 coeficientes). O Lasso percorre os α do maior para o menor. */
export function ridgePath(alphas: number[]): number[][] {
  return alphas.map((a) => ridge(a));
}

export function lassoPath(alphas: number[]): number[][] {
  const out: number[][] = new Array(alphas.length);
  let prev: number[] | undefined;
  for (let i = alphas.length - 1; i >= 0; i--) {
    prev = lasso(alphas[i], prev);
    out[i] = prev;
  }
  return out;
}

/** Erro quadrático médio de treino (em milhares de dólares ao quadrado) e R² de treino para uns coeficientes. */
export function trainFit(beta: number[]): { mse: number; r2: number } {
  const { R, r, yVar } = HITTERS;
  // ‖yc − Zβ‖²/n = Var(y) − 2 βᵀr + βᵀRβ
  let quad = 0;
  let lin = 0;
  for (let i = 0; i < P; i++) {
    lin += beta[i] * r[i];
    for (let j = 0; j < P; j++) quad += beta[i] * R[i][j] * beta[j];
  }
  const mse = yVar - 2 * lin + quad;
  return { mse, r2: 1 - mse / yVar };
}
