// Bagging e random forests (secção 2), sem dependências (corre no browser e com `node`).
// Árvores CART sem limite de profundidade, com o Gini e os exemplos repetidos do bootstrap contados como pesos, como no
// DecisionTreeClassifier do scikit-learn: numa árvore sem reamostragem, ou com os mesmos pesos, as previsões nos pontos de
// teste coincidem com as do scikit-learn 1.9 com random_state=0 (noutras sementes, um empate entre as duas variáveis pode
// mudar uma ou outra previsão, porque o scikit-learn as visita por uma ordem sorteada).
// O sorteio (bootstrap e variáveis por nó) usa outro gerador, por isso as florestas não são as mesmas árvores que as do
// RandomForestClassifier; as exatidões médias foram comparadas em 20 sementes de cada lado.

export type Point = [number, number];
export type Data = { X: Point[]; y: number[] };

export function unpack(flat: number[]): Data {
  const X: Point[] = [];
  const y: number[] = [];
  for (let i = 0; i + 2 < flat.length; i += 3) {
    X.push([flat[i], flat[i + 1]]);
    y.push(flat[i + 2]);
  }
  return { X, y };
}

/** Gerador pseudoaleatório pequeno e determinístico (mulberry32). */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Node = { leaf: true; cls: number } | { leaf: false; f: number; t: number; l: Node; r: Node };

type Best = { f: number; t: number; score: number; cut: number; order: number[] } | null;

/** Melhor corte de uma variável num nó: a menor soma ponderada de Gini dos dois lados (os empates ficam com o primeiro). */
function bestCut(X: Point[], y: number[], w: number[], idx: number[], f: number): Best {
  const order = [...idx].sort((a, b) => X[a][f] - X[b][f]);
  if (X[order[0]][f] === X[order[order.length - 1]][f]) return null; // variável constante neste nó
  let w1 = 0;
  let wt = 0;
  for (const i of order) {
    wt += w[i];
    w1 += w[i] * y[i];
  }
  let lw = 0;
  let l1 = 0;
  let best: Best = null;
  for (let k = 0; k < order.length - 1; k++) {
    const i = order[k];
    lw += w[i];
    l1 += w[i] * y[i];
    const a = X[i][f];
    const b = X[order[k + 1]][f];
    if (b <= a) continue;
    const rw = wt - lw;
    const r1 = w1 - l1;
    // n_esq · Gini_esq + n_dir · Gini_dir, com Gini = 2p(1 − p)
    const score = (2 * l1 * (lw - l1)) / lw + (2 * r1 * (rw - r1)) / rw;
    if (best === null || score < best.score - 1e-12) {
      let t = (a + b) / 2;
      if (t === b) t = a;
      best = { f, t, score, cut: k + 1, order };
    }
  }
  return best;
}

/** Cresce uma árvore sem limite. maxFeatures = 2: as duas variáveis em cada nó (bagging); 1: uma sorteada (random forest). */
export function buildTree(X: Point[], y: number[], w: number[], idx: number[], maxFeatures: number, rand: () => number): Node {
  let wt = 0;
  let w1 = 0;
  for (const i of idx) {
    wt += w[i];
    w1 += w[i] * y[i];
  }
  const cls = w1 > wt - w1 ? 1 : 0; // em empate, a classe 0 (o argmax do scikit-learn)
  if (w1 === 0 || w1 === wt || idx.length < 2) return { leaf: true, cls };
  const feats = maxFeatures >= 2 ? [0, 1] : rand() < 0.5 ? [0, 1] : [1, 0];
  let best: Best = null;
  let visited = 0;
  for (const f of feats) {
    if (visited >= maxFeatures) break;
    const b = bestCut(X, y, w, idx, f);
    if (b === null) continue; // como no scikit-learn, uma variável constante não conta e sorteia-se outra
    visited++;
    if (best === null || b.score < best.score - 1e-12) best = b;
  }
  if (best === null) return { leaf: true, cls };
  const left = best.order.slice(0, best.cut);
  const right = best.order.slice(best.cut);
  return { leaf: false, f: best.f, t: best.t, l: buildTree(X, y, w, left, maxFeatures, rand), r: buildTree(X, y, w, right, maxFeatures, rand) };
}

export function predict(node: Node, p: Point): number {
  let n = node;
  while (!n.leaf) n = p[n.f] <= n.t ? n.l : n.r;
  return n.cls;
}

export function leaves(node: Node): number {
  return node.leaf ? 1 : leaves(node.l) + leaves(node.r);
}

export type Tree = { root: Node; counts: number[] };

/** Uma árvore numa reamostragem bootstrap (n sorteios com reposição); counts[i] = vezes que o exemplo i saiu. */
export function bootstrapTree(data: Data, maxFeatures: number, rand: () => number): Tree {
  const n = data.y.length;
  const counts = new Array<number>(n).fill(0);
  for (let k = 0; k < n; k++) counts[Math.floor(rand() * n)]++;
  const idx = counts.map((c, i) => (c > 0 ? i : -1)).filter((i) => i >= 0);
  return { root: buildTree(data.X, data.y, counts, idx, maxFeatures, rand), counts };
}

export function growForest(data: Data, trees: number, maxFeatures: number, seed: number): Tree[] {
  const rand = rng(seed);
  return Array.from({ length: trees }, () => bootstrapTree(data, maxFeatures, rand));
}

/** Previsão de cada árvore em cada ponto: preds[k][j] é a classe que a árvore k dá ao ponto j. */
export function predictions(trees: Tree[], pts: Point[]): Uint8Array[] {
  return trees.map((t) => Uint8Array.from(pts, (p) => predict(t.root, p)));
}

/** Exatidão da votação das primeiras k árvores, para k = 1 … K (empate → classe 0, como no scikit-learn). */
export function accuracyCurve(preds: Uint8Array[], y: number[]): number[] {
  const votes = new Array<number>(y.length).fill(0);
  return preds.map((p, k) => {
    let ok = 0;
    for (let j = 0; j < y.length; j++) {
      votes[j] += p[j];
      const cls = votes[j] * 2 > k + 1 ? 1 : 0;
      if (cls === y[j]) ok++;
    }
    return ok / y.length;
  });
}

/** Exatidão fora do saco das primeiras k árvores, para k = 1 … K: cada exemplo só é previsto pelas árvores que não o viram. */
export function oobCurve(trees: Tree[], data: Data): number[] {
  const n = data.y.length;
  const ones = new Array<number>(n).fill(0);
  const seen = new Array<number>(n).fill(0);
  return trees.map((t) => {
    for (let i = 0; i < n; i++) {
      if (t.counts[i] === 0) {
        seen[i]++;
        ones[i] += predict(t.root, data.X[i]);
      }
    }
    let ok = 0;
    let m = 0;
    for (let i = 0; i < n; i++) {
      if (seen[i] === 0) continue;
      m++;
      if ((ones[i] * 2 > seen[i] ? 1 : 0) === data.y[i]) ok++;
    }
    return m ? ok / m : NaN;
  });
}

/** Concordância média entre pares de árvores (fração de pontos em que duas árvores dão a mesma classe). */
export function agreement(preds: Uint8Array[]): number {
  let s = 0;
  let c = 0;
  for (let a = 0; a < preds.length; a++)
    for (let b = a + 1; b < preds.length; b++) {
      let same = 0;
      for (let j = 0; j < preds[a].length; j++) if (preds[a][j] === preds[b][j]) same++;
      s += same / preds[a].length;
      c++;
    }
  return c ? s / c : 1;
}
