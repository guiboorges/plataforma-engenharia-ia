// Lógica do explorador de índices e fatias (M2, secção 3). Segue as regras do Python 3:
// - índice: os negativos contam a partir do fim; fora do intervalo dá IndexError;
// - fatia [início:fim:passo]: valores em falta ganham o valor por omissão, os negativos somam o
//   tamanho e os que ficam fora do intervalo são cortados (como slice.indices), por isso nunca dá erro,
//   exceto passo 0 (ValueError).
// Sem dependências: testado contra o Python real com `node` (ver o relatório do módulo).

export type SeqKind = "list" | "str";

/** Uma sequência de exemplo: `items` guarda o repr de cada elemento (lista) ou cada carácter (texto). */
export type Seq = { name: string; kind: SeqKind; items: string[] };

export type SliceResult =
  | { ok: true; picked: number[]; printed: string; clipped: boolean }
  | { ok: false; error: string };

/** Índices escolhidos por seq[start:stop:step], com null no lugar de um valor omitido. */
export function sliceIndices(len: number, start: number | null, stop: number | null, step: number | null): number[] | null {
  const st = step === null ? 1 : step;
  if (st === 0) return null;
  let a: number;
  let b: number;
  if (st > 0) {
    a = start === null ? 0 : clampPos(start, len);
    b = stop === null ? len : clampPos(stop, len);
  } else {
    a = start === null ? len - 1 : clampNeg(start, len);
    b = stop === null ? -1 : clampNeg(stop, len);
  }
  const out: number[] = [];
  if (st > 0) for (let i = a; i < b; i += st) out.push(i);
  else for (let i = a; i > b; i += st) out.push(i);
  return out;
}

// passo positivo: limites 0 e len
function clampPos(v: number, len: number): number {
  if (v < 0) {
    v += len;
    if (v < 0) v = 0;
  } else if (v > len) v = len;
  return v;
}
// passo negativo: limites -1 e len - 1
function clampNeg(v: number, len: number): number {
  if (v < 0) {
    v += len;
    if (v < 0) v = -1;
  } else if (v >= len) v = len - 1;
  return v;
}

/** O que imprime print(seq[start:stop:step]). */
export function runSlice(seq: Seq, start: number | null, stop: number | null, step: number | null): SliceResult {
  const len = seq.items.length;
  const picked = sliceIndices(len, start, stop, step);
  if (picked === null) return { ok: false, error: "ValueError: slice step cannot be zero" };
  // "cortado" só quando o Python tem mesmo de mudar o limite (por exemplo [1:100]); [1:5] numa lista de 5 não conta.
  const neg = step !== null && step < 0;
  const lo = neg ? -1 : 0;
  const hi = neg ? len - 1 : len;
  const cut = (v: number | null) => {
    if (v === null) return false;
    const n = v < 0 ? v + len : v;
    return n < lo || n > hi;
  };
  return { ok: true, picked, printed: show(seq, picked), clipped: cut(start) || cut(stop) };
}

/** O que imprime print(seq[i]). */
export function runIndex(seq: Seq, i: number): SliceResult {
  const len = seq.items.length;
  const k = i < 0 ? i + len : i;
  if (k < 0 || k >= len) return { ok: false, error: `IndexError: ${seq.kind === "list" ? "list" : "string"} index out of range` };
  return { ok: true, picked: [k], printed: seq.items[k], clipped: false };
}

/** print de uma lista mostra o repr dos elementos; print de um texto mostra os carateres. */
function show(seq: Seq, picked: number[]): string {
  const parts = picked.map((k) => seq.items[k]);
  return seq.kind === "list" ? `[${parts.join(", ")}]` : parts.join("");
}

/** Lê um campo de texto: vazio = omitido (null); inteiro com sinal; outra coisa = inválido (undefined).
 *  Zeros à esquerda (01) são recusados, porque em Python são um SyntaxError. */
export function parseSlot(s: string): number | null | undefined {
  const t = s.trim();
  if (t === "") return null;
  if (!/^[+-]?(0|[1-9]\d{0,3})$/.test(t)) return undefined;
  return Number(t);
}

/** Texto do código, como se escreveria em Python. */
export function sliceCode(seq: Seq, start: string, stop: string, step: string, mode: "slice" | "index"): string {
  const s = (x: string) => x.trim();
  if (mode === "index") return `print(${seq.name}[${s(start)}])`;
  const inner = `${s(start)}:${s(stop)}${s(step) !== "" ? `:${s(step)}` : ""}`;
  return `print(${seq.name}[${inner}])`;
}
