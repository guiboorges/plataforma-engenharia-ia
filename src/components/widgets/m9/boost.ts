// Gradient boosting à mão, numa só variável (secção 3), sem dependências (corre no browser e com `node`).
// Os dados são as médias de utilizadores por hora do Bikeshare (as duas curvas da figura 02-bikeshare-horas.png),
// bk[bk["workingday"] == w].groupby("hr")["bikers"].mean().round(1).
// Cada árvore tem um só corte e ajusta-se aos resíduos; F_m = F_{m−1} + η·h_m. Testado contra
// GradientBoostingRegressor(max_depth=1, learning_rate=η) do scikit-learn 1.9 com staged_predict:
// as previsões coincidem (diferenças abaixo de 1e-12) nas 200 etapas, para as duas curvas e as 100 taxas do controlo (0,01 a 1).

export const HOURS = Array.from({ length: 24 }, (_, h) => h);

export const BIKES: Record<"util" | "fds", number[]> = {
  util: [29.3, 13.7, 7.5, 4.4, 4.8, 17.8, 77.5, 214.7, 349.5, 180.6, 101.4, 117.7, 148.2, 146.5, 137.4, 146.7, 215.0, 394.9, 367.5, 259.0, 187.9, 143.6, 108.0, 68.6],
  fds: [72.8, 54.2, 43.1, 21.6, 6.6, 7.2, 14.0, 32.1, 76.4, 127.7, 194.4, 238.3, 280.7, 285.8, 280.7, 278.9, 277.1, 251.3, 223.6, 186.9, 140.7, 115.0, 94.6, 70.5],
};

/** Uma árvore de um só corte: prevê `left` se x ≤ t, senão `right` (valores antes de multiplicar por η). */
export type Stump = { t: number; left: number; right: number };

/** Ajusta um corte aos resíduos r: o que minimiza a soma dos quadrados dos erros, com cada lado a prever a sua média.
 *  Em caso de empate fica o primeiro limiar (o mais à esquerda), como no scikit-learn. */
export function fitStump(x: number[], r: number[]): Stump {
  const order = x.map((_, i) => i).sort((a, b) => x[a] - x[b]);
  const n = order.length;
  let total = 0;
  for (const i of order) total += r[i];
  let best = -Infinity;
  let out: Stump = { t: Infinity, left: total / n, right: 0 };
  let sl = 0;
  for (let k = 0; k < n - 1; k++) {
    sl += r[order[k]];
    const a = x[order[k]];
    const b = x[order[k + 1]];
    if (b <= a) continue;
    const nl = k + 1;
    const nr = n - nl;
    const sr = total - sl;
    // reduzir a soma dos quadrados é o mesmo que maximizar sl²/nl + sr²/nr
    const proxy = (sl * sl) / nl + (sr * sr) / nr;
    if (proxy > best) {
      best = proxy;
      out = { t: (a + b) / 2, left: sl / nl, right: sr / nr };
    }
  }
  return out;
}

export const stumpAt = (s: Stump, v: number) => (v <= s.t ? s.left : s.right);

export type BoostRun = {
  f0: number;
  stumps: Stump[];
  /** preds[m][i]: previsão para x[i] depois de m árvores (preds[0] = F₀) */
  preds: number[][];
  /** RMSE de treino depois de m árvores */
  rmse: number[];
};

export function rmseOf(y: number[], p: number[]): number {
  let s = 0;
  for (let i = 0; i < y.length; i++) s += (y[i] - p[i]) ** 2;
  return Math.sqrt(s / y.length);
}

export function boost(x: number[], y: number[], eta: number, trees: number): BoostRun {
  const f0 = y.reduce((a, b) => a + b, 0) / y.length;
  let F = y.map(() => f0);
  const preds = [F];
  const rmse = [rmseOf(y, F)];
  const stumps: Stump[] = [];
  for (let m = 0; m < trees; m++) {
    const r = y.map((v, i) => v - F[i]);
    const s = fitStump(x, r);
    stumps.push(s);
    F = F.map((f, i) => f + eta * stumpAt(s, x[i]));
    preds.push(F);
    rmse.push(rmseOf(y, F));
  }
  return { f0, stumps, preds, rmse };
}
