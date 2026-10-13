// groupby do pandas sobre o conjunto de vendas da aula (secção 2), já limpo:
// df.drop_duplicates() tira a linha 12 (Faro, fev, Vestuário repetida) e fillna(415.0) preenche a linha 9.
// Reproduz df.groupby(col)["valor"].<agg>() e o texto que o print mostra (repr da Series), com e sem .round(1).
// Testado contra pandas 3.0 (sem dependências, para poder ser corrido com `node`).

export type SaleRow = { i: number; mes: string; loja: string; categoria: string; valor: number; filled?: boolean };
export type GroupCol = "loja" | "mes" | "categoria";
export type Agg = "sum" | "mean" | "count" | "min" | "max" | "median";

export const SALES: SaleRow[] = [
  { i: 0, mes: "2026-01", loja: "Lisboa", categoria: "Equipamento", valor: 980 },
  { i: 1, mes: "2026-01", loja: "Lisboa", categoria: "Vestuário", valor: 520 },
  { i: 2, mes: "2026-01", loja: "Porto", categoria: "Equipamento", valor: 610 },
  { i: 3, mes: "2026-01", loja: "Porto", categoria: "Vestuário", valor: 370 },
  { i: 4, mes: "2026-01", loja: "Faro", categoria: "Equipamento", valor: 250 },
  { i: 5, mes: "2026-01", loja: "Faro", categoria: "Vestuário", valor: 160 },
  { i: 6, mes: "2026-02", loja: "Lisboa", categoria: "Equipamento", valor: 1100 },
  { i: 7, mes: "2026-02", loja: "Lisboa", categoria: "Vestuário", valor: 620 },
  { i: 8, mes: "2026-02", loja: "Porto", categoria: "Equipamento", valor: 705 },
  { i: 9, mes: "2026-02", loja: "Porto", categoria: "Vestuário", valor: 415, filled: true },
  { i: 10, mes: "2026-02", loja: "Faro", categoria: "Equipamento", valor: 420 },
  { i: 11, mes: "2026-02", loja: "Faro", categoria: "Vestuário", valor: 220 },
  { i: 13, mes: "2026-03", loja: "Lisboa", categoria: "Equipamento", valor: 990 },
  { i: 14, mes: "2026-03", loja: "Lisboa", categoria: "Vestuário", valor: 620 },
  { i: 15, mes: "2026-03", loja: "Porto", categoria: "Equipamento", valor: 830 },
  { i: 16, mes: "2026-03", loja: "Porto", categoria: "Vestuário", valor: 460 },
  { i: 17, mes: "2026-03", loja: "Faro", categoria: "Equipamento", valor: 450 },
  { i: 18, mes: "2026-03", loja: "Faro", categoria: "Vestuário", valor: 250 },
];

export const AGGS: Agg[] = ["sum", "mean", "count", "min", "max", "median"];

/** 1. Dividir: um grupo por valor distinto da coluna, ordenados como o pandas (sort=True). */
export function split(rows: SaleRow[], col: GroupCol): { key: string; rows: SaleRow[] }[] {
  const map = new Map<string, SaleRow[]>();
  for (const r of rows) {
    const k = r[col];
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(r);
  }
  // O Python ordena texto por ponto de código; para estes nomes é igual à comparação do JavaScript.
  return [...map.keys()].sort((x, y) => (x < y ? -1 : x > y ? 1 : 0)).map((key) => ({ key, rows: map.get(key)! }));
}

/** 2. Aplicar: o cálculo sobre os valores de um grupo. */
export function apply(values: number[], agg: Agg): number {
  const n = values.length;
  switch (agg) {
    case "sum":
      return values.reduce((s, v) => s + v, 0);
    case "mean":
      return values.reduce((s, v) => s + v, 0) / n;
    case "count":
      return n;
    case "min":
      return Math.min(...values);
    case "max":
      return Math.max(...values);
    case "median": {
      const s = [...values].sort((x, y) => x - y);
      return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
    }
  }
}

/** np.round(x, 1): arredonda x·10 ao inteiro mais próximo, com empates para o par. */
export function round1(x: number): number {
  const y = x * 10;
  const f = Math.floor(y);
  const d = y - f;
  const r = d > 0.5 ? f + 1 : d < 0.5 ? f : f % 2 === 0 ? f : f + 1;
  return r / 10;
}

function isDecimal(x: string): boolean {
  return /^\s*[+-]?\d+\.\d*$/.test(x);
}

/** Formatação de uma coluna de floats como o pandas (6 casas, depois corta zeros finais em todos ao mesmo tempo). */
export function formatFloats(vals: number[]): string[] {
  let t = vals.map((v) => v.toFixed(6));
  const shouldTrim = (xs: string[]) => {
    const nums = xs.filter(isDecimal);
    return nums.length > 0 && nums.every((x) => x.endsWith("0"));
  };
  while (shouldTrim(t)) t = t.map((x) => (isDecimal(x) ? x.slice(0, -1) : x));
  return t.map((x) => (isDecimal(x) && x.endsWith(".") ? x + "0" : x));
}

export function seriesRepr(indexName: string, labels: string[], values: string[], name: string, dtype: string): string {
  const wi = Math.max(...labels.map((l) => l.length));
  const wv = Math.max(...values.map((v) => v.length));
  const lines = [indexName];
  labels.forEach((l, k) => lines.push(`${l.padEnd(wi)}    ${values[k].padStart(wv)}`));
  lines.push(`Name: ${name}, dtype: ${dtype}`);
  return lines.join("\n");
}

export type GroupByResult = {
  code: string;
  groups: { key: string; rows: SaleRow[]; value: number; shown: string }[];
  repr: string;
};

/** df.groupby(col)["valor"].agg() — e, se round, .round(1). */
export function groupBy(col: GroupCol, agg: Agg, round: boolean): GroupByResult {
  const groups = split(SALES, col).map((g) => {
    const v = apply(
      g.rows.map((r) => r.valor),
      agg,
    );
    // .round(1) numa Series de inteiros (count) não muda nada: continua int64.
    return { key: g.key, rows: g.rows, value: round && agg !== "count" ? round1(v) : v };
  });
  const isInt = agg === "count";
  const shown = isInt ? groups.map((g) => String(g.value)) : formatFloats(groups.map((g) => g.value));
  const repr = seriesRepr(
    col,
    groups.map((g) => g.key),
    shown,
    "valor",
    isInt ? "int64" : "float64",
  );
  const code = `df.groupby("${col}")["valor"].${agg}()${round ? ".round(1)" : ""}`;
  return { code, groups: groups.map((g, k) => ({ ...g, shown: shown[k] })), repr };
}
