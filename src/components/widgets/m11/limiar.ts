import { CARAVAN_P, CARAVAN_Y } from "./caravan-data";

// Métricas de um classificador com uma classe rara, calculadas sobre as probabilidades do Caravan da aula
// (secção 4). As fórmulas seguem o scikit-learn: precision_recall_curve e average_precision_score com
// limiares distintos, roc_auc_score com empates a contar meio. Testado contra o scikit-learn 1.9.1.

export type Scored = { p: number[]; y: number[] };

/** Os dados da aula: probabilidades (0 a 1) por ordem decrescente e os rótulos (1 = comprou). */
export const CARAVAN: Scored = {
  p: CARAVAN_P.map((v) => v / 1e6),
  y: CARAVAN_Y.split("").map(Number),
};

export type Confusion = {
  threshold: number;
  marked: number;
  tp: number;
  fp: number;
  fn: number;
  tn: number;
  precision: number; // 0 quando não se marca ninguém (zero_division=0)
  recall: number;
  accuracy: number;
  lift: number; // precisão / proporção de base
};

const positives = (d: Scored) => d.y.reduce((a, b) => a + b, 0);

function confusion(d: Scored, isMarked: (i: number) => boolean, threshold: number): Confusion {
  const n = d.y.length;
  const pos = positives(d);
  let marked = 0;
  let tp = 0;
  for (let i = 0; i < n; i++) {
    if (isMarked(i)) {
      marked++;
      tp += d.y[i];
    }
  }
  const fp = marked - tp;
  const fn = pos - tp;
  const tn = n - pos - fp;
  const precision = marked ? tp / marked : 0;
  return {
    threshold,
    marked,
    tp,
    fp,
    fn,
    tn,
    precision,
    recall: pos ? tp / pos : 0,
    accuracy: (tp + tn) / n,
    lift: precision / (pos / n),
  };
}

/** Marca quem tem probabilidade ≥ limiar, como `(p >= limiar).astype(int)` na aula. */
export const atThreshold = (d: Scored, t: number): Confusion => confusion(d, (i) => d.p[i] >= t, t);

/** Contacta os primeiros `int(frac * n)` clientes, por ordem decrescente de probabilidade (dados já ordenados). */
export function atCapacity(d: Scored, frac: number): Confusion {
  const k = Math.floor(frac * d.y.length + 1e-9);
  return confusion(d, (i) => i < k, k > 0 ? d.p[k - 1] : 1);
}

/** Lucro de uma campanha: margem por cada comprador contactado menos o custo de cada contacto. */
export const profit = (c: Confusion, cost: number, margin: number) => margin * c.tp - cost * c.marked;

/** Pontos da curva de precisão e revocação, um por limiar distinto (do mais alto para o mais baixo). */
export function prCurve(d: Scored): { precision: number; recall: number; threshold: number }[] {
  const pos = positives(d);
  const out: { precision: number; recall: number; threshold: number }[] = [];
  let tp = 0;
  let marked = 0;
  for (let i = 0; i < d.p.length; i++) {
    tp += d.y[i];
    marked++;
    if (i === d.p.length - 1 || d.p[i + 1] !== d.p[i]) out.push({ precision: tp / marked, recall: tp / pos, threshold: d.p[i] });
  }
  return out;
}

/** average_precision_score: Σ (Rₙ − Rₙ₋₁) · Pₙ, sobre os limiares distintos. */
export function averagePrecision(d: Scored): number {
  let prev = 0;
  let ap = 0;
  for (const pt of prCurve(d)) {
    ap += (pt.recall - prev) * pt.precision;
    prev = pt.recall;
  }
  return ap;
}

/** roc_auc_score: probabilidade de um comprador ao acaso ter p maior do que um não comprador (empates contam meio). */
export function rocAuc(d: Scored): number {
  const pos = positives(d);
  const neg = d.y.length - pos;
  let negBelow = neg; // não compradores com p estritamente menor do que o grupo atual
  let sum = 0;
  let i = 0;
  while (i < d.p.length) {
    let j = i;
    let gp = 0;
    let gn = 0;
    while (j < d.p.length && d.p[j] === d.p[i]) {
      if (d.y[j]) gp++;
      else gn++;
      j++;
    }
    negBelow -= gn;
    sum += gp * (negBelow + gn / 2);
    i = j;
  }
  return sum / (pos * neg);
}

/** Curva de ganhos: fração dos compradores apanhados ao contactar os primeiros x% (x de 0 a 1). */
export function gainsCurve(d: Scored): [number, number][] {
  const pos = positives(d);
  const n = d.y.length;
  const pts: [number, number][] = [[0, 0]];
  let tp = 0;
  for (let i = 0; i < n; i++) {
    tp += d.y[i];
    pts.push([(i + 1) / n, tp / pos]);
  }
  return pts;
}
