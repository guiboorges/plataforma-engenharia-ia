// Produto escalar, normas, semelhança do cosseno e a pesquisa semântica em miniatura da secção 3.
// Sem dependências, para poder ser testado com `node`. O vocabulário e as contagens são os do CountVectorizer do
// scikit-learn com as opções por omissão (minúsculas, palavras com 2 ou mais carateres de palavra, vocabulário por
// ordem alfabética), e o cosseno faz as contas pela mesma ordem que a função `cosseno` da aula.
// Testado contra Python 3.13, NumPy 2.5 e scikit-learn.

export function dot(u: number[], v: number[]): number {
  let s = 0;
  for (let i = 0; i < u.length; i++) s += u[i] * v[i];
  return s;
}

export function norm(v: number[]): number {
  return Math.sqrt(dot(v, v));
}

/** (u @ v) / (‖u‖ ‖v‖): NaN se um dos vetores for nulo (o NumPy dá nan, com um aviso de divisão por zero). */
export function cosine(u: number[], v: number[]): number {
  return dot(u, v) / (norm(u) * norm(v));
}

/** Ângulo em graus, a partir do cosseno (limitado a [−1, 1] por causa do arredondamento). */
export function angleDeg(c: number): number {
  return (Math.acos(Math.max(-1, Math.min(1, c))) * 180) / Math.PI;
}

/** O token_pattern por omissão do CountVectorizer, r"(?u)\b\w\w+\b", depois de passar a minúsculas. */
export function tokenize(text: string): string[] {
  return text.toLowerCase().match(/[\p{L}\p{N}_]{2,}/gu) ?? [];
}

/** vocabulário ordenado (como get_feature_names_out) */
export function vocabulary(docs: string[]): string[] {
  const set = new Set<string>();
  for (const d of docs) for (const t of tokenize(d)) set.add(t);
  return [...set].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
}

/** Contagens de cada palavra do vocabulário no texto; palavras fora do vocabulário são ignoradas (como o transform). */
export function countVector(text: string, vocab: string[]): number[] {
  const idx = new Map(vocab.map((w, i) => [w, i]));
  const out = new Array(vocab.length).fill(0);
  for (const t of tokenize(text)) {
    const i = idx.get(t);
    if (i !== undefined) out[i] += 1;
  }
  return out;
}

export type Ranked = { doc: string; index: number; score: number; vector: number[] };

/** Os documentos ordenados pelo cosseno com a pergunta, do maior para o menor (ordenação estável, como o sorted). */
export function rank(query: string, docs: string[]): { vocab: string[]; q: number[]; ranked: Ranked[]; unknown: string[] } {
  const vocab = vocabulary(docs);
  const q = countVector(query, vocab);
  const known = new Set(vocab);
  const unknown = [...new Set(tokenize(query).filter((t) => !known.has(t)))];
  const rows = docs.map((d, index) => {
    const vector = countVector(d, vocab);
    return { doc: d, index, vector, score: cosine(q, vector) };
  });
  const ranked = [...rows].sort((a, b) => -a.score - -b.score || 0);
  return { vocab, q, ranked, unknown };
}

/** Os documentos e a pergunta da secção 3. */
export const DOCS = [
  "devolução de uma encomenda com defeito",
  "prazo de entrega da encomenda",
  "como trocar o tamanho de uma luva",
  "a luva chegou com defeito e quero devolver",
];
export const PERGUNTA = "quero devolver uma luva com defeito";
