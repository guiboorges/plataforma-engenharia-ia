// O mesmo cálculo que CountVectorizer() + MultinomialNB() do scikit-learn, com os valores por omissão:
// minúsculas, token_pattern r"(?u)\b\w\w+\b" (palavras de 2+ carateres) e alisamento alpha = 1.

const TOKEN = /[\p{L}\p{M}\p{N}_]{2,}/gu;

export function tokenize(text: string): string[] {
  return text.toLowerCase().match(TOKEN) ?? [];
}

export type NBModel = {
  vocab: string[];
  index: Map<string, number>;
  classCount: [number, number];
  featCount: [number[], number[]];
  logPrior: [number, number];
  logProb: [number[], number[]];
};

export function fitNB(docs: string[], labels: number[], alpha = 1): NBModel {
  const vocabSet = new Set<string>();
  const toks = docs.map((d) => tokenize(d));
  toks.forEach((t) => t.forEach((w) => vocabSet.add(w)));
  // o scikit-learn ordena o vocabulário alfabeticamente
  const vocab = [...vocabSet].sort();
  const index = new Map(vocab.map((w, i) => [w, i] as [string, number]));
  const V = vocab.length;
  const featCount: [number[], number[]] = [new Array(V).fill(0), new Array(V).fill(0)];
  const classCount: [number, number] = [0, 0];
  toks.forEach((t, i) => {
    const c = labels[i] === 1 ? 1 : 0;
    classCount[c] += 1;
    t.forEach((w) => (featCount[c][index.get(w)!] += 1));
  });
  const n = classCount[0] + classCount[1];
  const logPrior: [number, number] = [Math.log(classCount[0] / n), Math.log(classCount[1] / n)];
  const logProb: [number[], number[]] = [0, 1].map((c) => {
    const total = featCount[c].reduce((a, b) => a + b, 0) + alpha * V;
    return featCount[c].map((k) => Math.log((k + alpha) / total));
  }) as [number[], number[]];
  return { vocab, index, classCount, featCount, logPrior, logProb };
}

export type NBExplain = {
  proba: [number, number]; // [normal, spam], como predict_proba
  label: 0 | 1;
  known: { word: string; count: number; weight: number; inNormal: number; inSpam: number }[];
  unknown: string[];
};

export function explainNB(m: NBModel, text: string): NBExplain {
  const counts = new Map<string, number>();
  const unknown: string[] = [];
  for (const w of tokenize(text)) {
    if (m.index.has(w)) counts.set(w, (counts.get(w) ?? 0) + 1);
    else if (!unknown.includes(w)) unknown.push(w);
  }
  let j0 = m.logPrior[0];
  let j1 = m.logPrior[1];
  const known: NBExplain["known"] = [];
  counts.forEach((count, word) => {
    const i = m.index.get(word)!;
    j0 += count * m.logProb[0][i];
    j1 += count * m.logProb[1][i];
    known.push({
      word,
      count,
      weight: count * (m.logProb[1][i] - m.logProb[0][i]), // > 0 empurra para spam
      inNormal: m.featCount[0][i],
      inSpam: m.featCount[1][i],
    });
  });
  const mx = Math.max(j0, j1);
  const e0 = Math.exp(j0 - mx);
  const e1 = Math.exp(j1 - mx);
  const p1 = e1 / (e0 + e1);
  known.sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight));
  // em caso de empate, o argmax do numpy escolhe a primeira classe (0)
  return { proba: [1 - p1, p1], label: j1 > j0 ? 1 : 0, known, unknown };
}

export function ruleSpam(text: string, words: string[]): { spam: boolean; hits: string[] } {
  const t = text.toLowerCase();
  const hits = words.filter((w) => w.trim() && t.includes(w.trim().toLowerCase()));
  return { spam: hits.length > 0, hits };
}

export const DEFAULT_RULE_WORDS = ["grátis", "prémio", "clique aqui", "urgente"];

export const TRAIN_MESSAGES: { text: string; label: 0 | 1 }[] = [
  { text: "ganhe um prémio grátis agora", label: 1 },
  { text: "clique aqui para receber dinheiro", label: 1 },
  { text: "oferta urgente só hoje", label: 1 },
  { text: "parabéns, foi selecionado para um prémio", label: 1 },
  { text: "reunião amanhã às 10h", label: 0 },
  { text: "envio o relatório em anexo", label: 0 },
  { text: "jantar no sábado?", label: 0 },
  { text: "a fatura de outubro está paga", label: 0 },
];

export const TEST_MESSAGES: { text: string; label: 0 | 1 }[] = [
  { text: "Ganhou um PRÉMIO! Clique aqui", label: 1 },
  { text: "Reunião amanhã às 10h", label: 0 },
  { text: "Tenho o prémio do sorteio do clube para lhe entregar", label: 0 },
  { text: "Ganhe d1nheiro f@cil", label: 1 },
];
