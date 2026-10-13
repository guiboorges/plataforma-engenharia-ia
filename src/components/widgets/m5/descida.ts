// Descida do gradiente (secção 5 da aula) em três funções: x², a perda da secção 1 e uma função não convexa.
// Sem dependências, para poder ser testada com `node`. Testado contra NumPy 2.5.

const XS = [1, 2, 3, 4, 5];
const YS = [2.1, 3.9, 6.2, 7.8, 10.1];

function mean(v: number[]): number {
  let s = 0;
  for (const t of v) s += t;
  return s / v.length;
}

export function perda(w: number): number {
  return mean(XS.map((x, i) => (w * x - YS[i]) ** 2));
}

export function dperda(w: number): number {
  return mean(XS.map((x, i) => 2 * (w * x - YS[i]) * x));
}

/** Curvatura da perda: L''(w) = 2 · média(x²) = 22. */
export const CURV_PERDA = 2 * mean(XS.map((x) => x * x));

/** descida(eta, x0=4.0, passos=10) da aula, em f(x) = x². */
export function descidaQuad(eta: number, x0 = 4.0, passos = 10): number[] {
  const xs = [x0];
  for (let k = 0; k < passos; k++) xs.push(xs[xs.length - 1] - eta * 2 * xs[xs.length - 1]);
  return xs;
}

/** w = w - eta * dperda(w), a partir de w = 0: devolve w depois de cada passo (índice 0 = início). */
export function descidaPerda(eta: number, w0 = 0.0, passos = 50): number[] {
  const ws = [w0];
  for (let k = 0; k < passos; k++) {
    const w = ws[ws.length - 1];
    ws.push(w - eta * dperda(w));
  }
  return ws;
}

export function fnc(x: number): number {
  return x ** 4 - 3 * x ** 2 + x;
}

export function dfnc(x: number): number {
  return 4 * x ** 3 - 6 * x + 1;
}

/** Os dois mínimos de fnc (x com 4 casas, como na aula). */
export const MIN_GLOBAL = -1.3008;
export const MIN_LOCAL = 1.1309;

/** xk = xk - 0.01 * dfnc(xk), 100 vezes. */
export function descidaNC(x0: number, eta = 0.01, passos = 100): number[] {
  const xs = [x0];
  for (let k = 0; k < passos; k++) {
    const x = xs[xs.length - 1];
    xs.push(x - eta * dfnc(x));
  }
  return xs;
}

export type Verdict = "um-passo" | "converge" | "oscila-converge" | "preso" | "diverge";

/** Cada passo multiplica a distância ao mínimo pelo fator (1 − η·curvatura). */
export function verdict(fator: number): Verdict {
  if (Math.abs(fator) < 1e-12) return "um-passo";
  if (fator > 0 && fator < 1) return "converge";
  if (fator < 0 && fator > -1) return "oscila-converge";
  if (Math.abs(fator + 1) < 1e-12) return "preso";
  return "diverge";
}

/** Passos até a distância ao mínimo ficar abaixo de `tol` vezes a inicial (null se nunca). */
export function passosAte(fator: number, tol: number): number | null {
  const r = Math.abs(fator);
  if (r === 0) return 1;
  if (r >= 1) return null;
  return Math.ceil(Math.log(tol) / Math.log(r));
}

export type NCResult = { xs: number[]; final: number; where: "global" | "local" | "a-caminho" };

export function naoConvexa(x0: number): NCResult {
  const xs = descidaNC(x0);
  const final = xs[xs.length - 1];
  const where = Math.abs(final - MIN_GLOBAL) < 0.005 ? "global" : Math.abs(final - MIN_LOCAL) < 0.005 ? "local" : "a-caminho";
  return { xs, final, where };
}
