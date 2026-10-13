// Lógica do laboratório "duas variáveis, a mesma lista" (M2, secção 3).
// Modela o que o Python faz: os nomes apontam para objetos; `=` só muda para onde um nome aponta;
// append, += e atribuição a um índice alteram o objeto no sítio; `x = x + [...]`, copy(), list() e [:]
// criam um objeto novo. Sem dependências: testado contra o Python real com `node`.

export type Name = "a" | "b";
export type CopyMode = "alias" | "copy" | "list" | "slice";
export type OpKind = "append" | "iadd" | "concat" | "setitem";

export type Op = { target: Name; kind: OpKind; value: number };

export type MemState = {
  /** objetos vivos (com pelo menos um nome a apontar), por ordem de criação */
  objects: { id: number; items: number[] }[];
  names: Record<Name, number>;
};

export const COPY_LINE: Record<CopyMode, string> = {
  alias: "b = a",
  copy: "b = a.copy()",
  list: "b = list(a)",
  slice: "b = a[:]",
};

export function opLine(op: Op): string {
  const t = op.target;
  switch (op.kind) {
    case "append":
      return `${t}.append(${op.value})`;
    case "iadd":
      return `${t} += [${op.value}]`;
    case "concat":
      return `${t} = ${t} + [${op.value}]`;
    case "setitem":
      return `${t}[0] = ${op.value}`;
  }
}

/** Corre `a = [1, 2, 3]`, a linha que cria `b` e as operações, e devolve a memória no fim. */
export function simulate(mode: CopyMode, ops: Op[]): MemState {
  const heap = new Map<number, number[]>();
  let next = 1;
  const make = (items: number[]) => {
    const id = next++;
    heap.set(id, items);
    return id;
  };
  const names: Record<Name, number> = { a: make([1, 2, 3]), b: 0 };
  names.b = mode === "alias" ? names.a : make([...heap.get(names.a)!]);
  for (const op of ops) {
    const obj = heap.get(names[op.target])!;
    switch (op.kind) {
      case "append":
      case "iadd": // list += altera a lista no sítio (list.__iadd__)
        obj.push(op.value);
        break;
      case "concat": // + cria uma lista nova; o nome passa a apontar para ela
        names[op.target] = make([...obj, op.value]);
        break;
      case "setitem":
        obj[0] = op.value;
        break;
    }
  }
  const live = new Set([names.a, names.b]);
  const objects = [...heap.entries()].filter(([id]) => live.has(id)).map(([id, items]) => ({ id, items: [...items] }));
  return { objects, names };
}

export const listRepr = (xs: number[]) => `[${xs.join(", ")}]`;

/** O que imprimem print(a, b) e print(a is b). */
export function printed(s: MemState): { ab: string; is: string } {
  const get = (n: Name) => s.objects.find((o) => o.id === s.names[n])!.items;
  return { ab: `${listRepr(get("a"))} ${listRepr(get("b"))}`, is: s.names.a === s.names.b ? "True" : "False" };
}
