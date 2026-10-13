// Escolha de um corte numa árvore de decisão (secção 1), sem dependências (corre no browser e com `node`).
// Os dados são 30 lojas do Carseats, cs.sample(30, random_state=47), com vendas altas = Sales > 8.
// Testado contra o DecisionTreeClassifier(max_depth=1) do scikit-learn 1.9 (critérios "gini" e "entropy"):
// mesma variável, mesmo limiar e as mesmas impurezas em todos os cortes candidatos.

export type Store = { price: number; adv: number; age: number; good: number; high: number };

// [Price, Advertising, Age, ShelveLoc == "Good", Sales > 8]
const RAW: [number, number, number, number, number][] = [
  [159, 7, 28, 0, 0], [164, 0, 72, 1, 0], [99, 0, 65, 0, 0], [139, 19, 33, 0, 0], [123, 19, 29, 0, 1], [131, 11, 63, 0, 0],
  [162, 0, 57, 0, 0], [111, 1, 55, 0, 0], [72, 13, 78, 0, 1], [121, 19, 66, 0, 0], [144, 5, 76, 0, 1], [53, 0, 52, 1, 1],
  [118, 0, 62, 0, 0], [102, 6, 80, 0, 0], [129, 10, 71, 1, 0], [101, 10, 57, 0, 1], [100, 0, 26, 0, 1], [135, 8, 48, 0, 1],
  [125, 12, 36, 0, 0], [109, 12, 44, 0, 1], [110, 13, 74, 0, 0], [128, 13, 50, 1, 1], [101, 8, 36, 0, 0], [96, 17, 54, 0, 1],
  [120, 14, 32, 0, 1], [134, 12, 29, 1, 1], [117, 0, 75, 0, 0], [116, 3, 51, 0, 0], [54, 3, 66, 0, 1], [149, 15, 66, 0, 0],
];

export const STORES: Store[] = RAW.map(([price, adv, age, good, high]) => ({ price, adv, age, good, high }));

export type FeatureId = "price" | "adv" | "age" | "good";
export const FEATURES: { id: FeatureId; label: string; col: string }[] = [
  { id: "price", label: "Preço", col: "Price" },
  { id: "adv", label: "Publicidade", col: "Advertising" },
  { id: "age", label: "Idade média", col: "Age" },
  { id: "good", label: "Prateleira boa", col: "ShelveLoc_Good" },
];

export type Crit = "gini" | "entropy";

/** Impureza de um nó com `pos` exemplos da classe 1 em `n`: Gini = Σ pₖ(1 − pₖ); entropia = −Σ pₖ log₂ pₖ (em bits, como o scikit-learn). */
export function impurity(pos: number, n: number, crit: Crit): number {
  if (n === 0) return 0;
  const p = pos / n;
  if (crit === "gini") return 1 - (p * p + (1 - p) * (1 - p));
  if (p === 0 || p === 1) return 0;
  return -(p * Math.log2(p) + (1 - p) * Math.log2(1 - p));
}

/** Limiares candidatos: os pontos médios entre valores distintos consecutivos, como no scikit-learn. */
export function thresholds(xs: number[]): number[] {
  const u = [...new Set(xs)].sort((a, b) => a - b);
  const out: number[] = [];
  for (let i = 0; i + 1 < u.length; i++) out.push((u[i] + u[i + 1]) / 2);
  return out;
}

export type Side = { n: number; pos: number; imp: number };
export type SplitEval = { t: number; left: Side; right: Side; weighted: number; parent: number; gain: number };

/** Avalia o corte "x ≤ t" (esquerda) contra "x > t" (direita). */
export function evalSplit(xs: number[], ys: number[], t: number, crit: Crit): SplitEval {
  let nl = 0;
  let pl = 0;
  let nr = 0;
  let pr = 0;
  xs.forEach((x, i) => {
    if (x <= t) {
      nl++;
      pl += ys[i];
    } else {
      nr++;
      pr += ys[i];
    }
  });
  const n = nl + nr;
  const left = { n: nl, pos: pl, imp: impurity(pl, nl, crit) };
  const right = { n: nr, pos: pr, imp: impurity(pr, nr, crit) };
  const weighted = (nl * left.imp + nr * right.imp) / n;
  const parent = impurity(pl + pr, n, crit);
  return { t, left, right, weighted, parent, gain: parent - weighted };
}

/** Todos os cortes de uma variável e o índice do melhor (o primeiro com a menor impureza média, em caso de empate). */
export function scan(xs: number[], ys: number[], crit: Crit): { splits: SplitEval[]; best: number } {
  const splits = thresholds(xs).map((t) => evalSplit(xs, ys, t, crit));
  let best = 0;
  splits.forEach((s, i) => {
    if (s.weighted < splits[best].weighted - 1e-12) best = i;
  });
  return { splits, best };
}

export const column = (f: FeatureId) => STORES.map((s) => s[f]);
export const labels = () => STORES.map((s) => s.high);

/** O melhor corte de cada variável e o vencedor (a escolha do CART na raiz). */
export function bestPerFeature(crit: Crit): { feature: FeatureId; split: SplitEval }[] {
  const ys = labels();
  return FEATURES.map((f) => {
    const { splits, best } = scan(column(f.id), ys, crit);
    return { feature: f.id, split: splits[best] };
  });
}

export function winner(crit: Crit): FeatureId {
  const all = bestPerFeature(crit);
  let w = all[0];
  for (const a of all) if (a.split.weighted < w.split.weighted - 1e-12) w = a;
  return w.feature;
}
