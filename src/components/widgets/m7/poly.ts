// Ajuste de polinómios por mínimos quadrados, como o Polynomial.fit do NumPy (secção 3), sem dependências.
// O x é levado do domínio [min, max] dos dados para a janela [−1, 1]; as colunas da matriz de Vandermonde são
// divididas pela sua norma e o sistema resolve-se por QR (Householder). Testado contra NumPy 2.5 (graus 1 a 14).

export type Poly = { coef: number[]; off: number; scl: number };

export function polyFit(x: number[], y: number[], deg: number): Poly {
  const m = x.length;
  const n = deg + 1;
  const lo = Math.min(...x);
  const hi = Math.max(...x);
  const scl = 2 / (hi - lo);
  const off = (-hi - lo) / (hi - lo);
  // A = Vandermonde (m × n), em colunas
  const A: number[][] = [];
  for (let j = 0; j < n; j++) A.push(x.map((v) => (off + scl * v) ** j));
  const norms = A.map((col) => Math.sqrt(col.reduce((s, v) => s + v * v, 0)) || 1);
  A.forEach((col, j) => col.forEach((_, i) => (col[i] /= norms[j])));
  const b = y.slice();
  // QR por reflexões de Householder, aplicadas também a b
  const R: number[] = new Array(n).fill(0);
  for (let k = 0; k < n; k++) {
    const col = A[k];
    let nrm = 0;
    for (let i = k; i < m; i++) nrm += col[i] * col[i];
    nrm = Math.sqrt(nrm);
    if (nrm === 0) continue;
    const alpha = col[k] > 0 ? -nrm : nrm;
    const v = new Array(m).fill(0);
    for (let i = k; i < m; i++) v[i] = col[i];
    v[k] -= alpha;
    let vv = 0;
    for (let i = k; i < m; i++) vv += v[i] * v[i];
    if (vv === 0) continue;
    const reflect = (c: number[]) => {
      let d = 0;
      for (let i = k; i < m; i++) d += v[i] * c[i];
      const f = (2 * d) / vv;
      for (let i = k; i < m; i++) c[i] -= f * v[i];
    };
    for (let j = k; j < n; j++) reflect(A[j]);
    reflect(b);
    R[k] = A[k][k];
  }
  // substituição para trás: R c = Qᵀ b
  const c = new Array(n).fill(0);
  for (let k = n - 1; k >= 0; k--) {
    let s = b[k];
    for (let j = k + 1; j < n; j++) s -= A[j][k] * c[j];
    c[k] = R[k] === 0 ? 0 : s / R[k];
  }
  return { coef: c.map((v, j) => v / norms[j]), off, scl };
}

export function polyEval(p: Poly, x: number): number {
  const t = p.off + p.scl * x;
  let s = 0;
  for (let j = p.coef.length - 1; j >= 0; j--) s = s * t + p.coef[j];
  return s;
}

export function rmse(y: number[], yhat: number[]): number {
  let s = 0;
  for (let i = 0; i < y.length; i++) s += (y[i] - yhat[i]) ** 2;
  return Math.sqrt(s / y.length);
}
