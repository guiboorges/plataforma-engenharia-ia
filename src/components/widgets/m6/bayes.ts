// Árvore de frequências naturais do teorema de Bayes (secção 2), com o exemplo do alerta de fraude:
// 1% de fraude, o detetor apanha 95% das fraudes e dá alarme falso em 5% das legítimas → P(fraude | alerta) ≈ 0,161.
// As contagens são as da figura 01-arvore-bayes.png (de 10 000 transações: 95 + 495 = 590 alertas).

export type BayesInput = {
  /** P(fraude): a proporção de base, o a priori */
  prior: number;
  /** P(alerta | fraude): a fração das fraudes que o detetor apanha */
  sens: number;
  /** P(alerta | legítima): a taxa de alarmes falsos */
  fpr: number;
  /** quantas transações imaginar (frequências naturais) */
  total: number;
};

export type BayesTree = {
  fraud: number;
  legit: number;
  /** fraudes com alerta */
  tp: number;
  /** fraudes sem alerta */
  fn: number;
  /** legítimas com alerta (alarmes falsos) */
  fp: number;
  /** legítimas sem alerta */
  tn: number;
  alerts: number;
  /** P(alerta), pela probabilidade total */
  pAlert: number;
  /** P(fraude | alerta), o a posteriori; NaN se nunca houver alertas */
  posterior: number;
};

export const LESSON: BayesInput = { prior: 0.01, sens: 0.95, fpr: 0.05, total: 10_000 };

export function bayesTree({ prior, sens, fpr, total }: BayesInput): BayesTree {
  const fraud = total * prior;
  const legit = total * (1 - prior);
  const tp = fraud * sens;
  const fp = legit * fpr;
  const pAlert = sens * prior + fpr * (1 - prior);
  return {
    fraud,
    legit,
    tp,
    fn: fraud - tp,
    fp,
    tn: legit - fp,
    alerts: tp + fp,
    pAlert,
    posterior: pAlert > 0 ? (sens * prior) / pAlert : NaN,
  };
}
