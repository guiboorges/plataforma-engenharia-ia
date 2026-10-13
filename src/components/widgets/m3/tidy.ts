// Formato largo ↔ longo com a tabela da secção 4 da aula (sem dependências, para poder ser testada com `node`).
// melt empilha as colunas de meses pela ordem em que aparecem; pivot volta ao largo e ordena linhas e colunas
// alfabeticamente (fev, jan, mar). Testado contra pandas 3.0.

export type WideRow = { loja: string; jan: number; fev: number; mar: number };
export type LongRow = { i: number; loja: string; mes: string; valor: number };

export const MONTHS = ["jan", "fev", "mar"] as const;
export type Month = (typeof MONTHS)[number];

export const LARGO: WideRow[] = [
  { loja: "Lisboa", jan: 1500, fev: 1720, mar: 1610 },
  { loja: "Porto", jan: 980, fev: 1120, mar: 1290 },
  { loja: "Faro", jan: 410, fev: 640, mar: 700 },
];

/** largo.melt(id_vars="loja", var_name="mes", value_name="valor") */
export function melt(rows: WideRow[]): LongRow[] {
  const out: LongRow[] = [];
  for (const m of MONTHS) for (const r of rows) out.push({ i: out.length, loja: r.loja, mes: m, valor: r[m] });
  return out;
}

const byText = (x: string, y: string) => (x < y ? -1 : x > y ? 1 : 0);

/** longo.pivot(index="loja", columns="mes", values="valor") — linhas e colunas ordenadas. */
export function pivot(rows: LongRow[]): { index: string[]; columns: string[]; values: number[][] } {
  const index = [...new Set(rows.map((r) => r.loja))].sort(byText);
  const columns = [...new Set(rows.map((r) => r.mes))].sort(byText);
  const values = index.map((l) => columns.map((c) => rows.find((r) => r.loja === l && r.mes === c)!.valor));
  return { index, columns, values };
}

/** longo.groupby(col, sort=?)["valor"].sum() */
export function groupSum(rows: LongRow[], col: "loja" | "mes", sort: boolean): { key: string; value: number }[] {
  const keys: string[] = [];
  const sums = new Map<string, number>();
  for (const r of rows) {
    const k = r[col];
    if (!sums.has(k)) {
      keys.push(k);
      sums.set(k, 0);
    }
    sums.set(k, sums.get(k)! + r.valor);
  }
  if (sort) keys.sort(byText);
  return keys.map((key) => ({ key, value: sums.get(key)! }));
}
