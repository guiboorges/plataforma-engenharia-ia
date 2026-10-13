// Métricas de classificação e de regressão da aula (secções 4 e 5), sem dependências.
// As probabilidades chegam em milionésimos inteiros e ordenadas por classe; prever "falha" é p ≥ limiar, como na aula.
// Testado contra scikit-learn 1.9 (confusion_matrix, accuracy/precision/recall/f1_score, roc_auc_score,
// average_precision_score) com as probabilidades do conjunto de teste da aula.

export type Counts = { vn: number; fp: number; fn: number; vp: number };
export type Metrics = { acc: number; prec: number | null; rec: number | null; f1: number | null; fpr: number | null };

/** Quantos valores de `sorted` (ordenado por ordem crescente) são menores do que t (ou ≤ t, com orEqual). */
function below(sorted: number[], t: number, orEqual = false): number {
  let lo = 0;
  let hi = sorted.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (sorted[mid] < t || (orEqual && sorted[mid] === t)) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/** Matriz de confusão com o limiar t (na mesma unidade das probabilidades). */
export function countsAt(pos: number[], neg: number[], t: number): Counts {
  const fn = below(pos, t);
  const vn = below(neg, t);
  return { vn, fp: neg.length - vn, fn, vp: pos.length - fn };
}

/** Métricas a partir das quatro contagens; null quando a divisão não está definida (0 / 0). */
export function metrics(c: Counts): Metrics {
  const total = c.vn + c.fp + c.fn + c.vp;
  const prec = c.vp + c.fp > 0 ? c.vp / (c.vp + c.fp) : null;
  const rec = c.vp + c.fn > 0 ? c.vp / (c.vp + c.fn) : null;
  const f1 = prec !== null && rec !== null ? (prec + rec > 0 ? (2 * prec * rec) / (prec + rec) : 0) : null;
  const fpr = c.fp + c.vn > 0 ? c.fp / (c.fp + c.vn) : null;
  return { acc: total > 0 ? (c.vp + c.vn) / total : 0, prec, rec, f1, fpr };
}

export function cost(c: Counts, custoFn: number, custoFp: number): number {
  return c.fn * custoFn + c.fp * custoFp;
}

/** Valores distintos das duas classes, do maior para o menor (os limiares da curva ROC). */
function thresholds(pos: number[], neg: number[]): number[] {
  return Array.from(new Set([...pos, ...neg])).sort((a, b) => b - a);
}

/** Curva ROC: (taxa de falsos positivos, revocação) para todos os limiares, de (0, 0) a (1, 1). */
export function rocPoints(pos: number[], neg: number[]): [number, number][] {
  const out: [number, number][] = [[0, 0]];
  for (const t of thresholds(pos, neg)) {
    const c = countsAt(pos, neg, t);
    out.push([c.fp / neg.length, c.vp / pos.length]);
  }
  return out;
}

/** AUC = P(pontuação de um positivo > pontuação de um negativo), com os empates a valer metade. */
export function auc(pos: number[], neg: number[]): number {
  let s = 0;
  for (const p of pos) {
    const lt = below(neg, p);
    const le = below(neg, p, true);
    s += lt + 0.5 * (le - lt);
  }
  return s / (pos.length * neg.length);
}

/** Precisão média, como average_precision_score: Σ (Rₙ − Rₙ₋₁) · Pₙ, pelos limiares do maior para o menor. */
export function averagePrecision(pos: number[], neg: number[]): number {
  let ap = 0;
  let prevRec = 0;
  for (const t of thresholds(pos, neg)) {
    const c = countsAt(pos, neg, t);
    const rec = c.vp / pos.length;
    const prec = c.vp / (c.vp + c.fp);
    ap += (rec - prevRec) * prec;
    prevRec = rec;
  }
  return ap;
}

// ---------------------------------------------------------------- regressão

export function mae(err: number[]): number {
  return err.reduce((s, e) => s + Math.abs(e), 0) / err.length;
}

export function rmseErr(err: number[]): number {
  return Math.sqrt(err.reduce((s, e) => s + e * e, 0) / err.length);
}
