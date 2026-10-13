import { SHAP_COLS, type ShapRow } from "./shap-data";

// Gráfico em cascata do SHAP (shap.plots.waterfall), em JavaScript: as variáveis por ordem de |contribuição|,
// as que não cabem juntas numa linha "N outras variáveis", e cada barra a começar onde a anterior acabou.
// Como no shap, a linha de baixo começa no valor de base E[f(X)] e a de cima acaba na previsão f(x).

export type WaterStep = {
  name: string; // "hr" ou "17 outras variáveis"
  value: string | null; // valor da variável nesta linha (null para o grupo)
  phi: number;
  from: number; // valor acumulado antes desta contribuição
  to: number; // depois
};

/** Valor da variável como o shap o mostra (inteiros sem casas, o resto com até 3), mas com vírgula decimal. */
export function fmtFeature(v: number): string {
  return (Number.isInteger(v) ? String(v) : String(Number(v.toFixed(3)))).replace(".", ",").replace("-", "−");
}

/**
 * Linhas da cascata, de cima para baixo (a maior contribuição primeiro).
 * maxDisplay conta a linha do grupo, como no shap: 8 dá 7 variáveis + "17 outras variáveis".
 */
export function waterfall(row: ShapRow, maxDisplay: number): WaterStep[] {
  const order = row.phi.map((_, i) => i).sort((a, b) => Math.abs(row.phi[b]) - Math.abs(row.phi[a]) || a - b);
  const n = order.length;
  const shown = maxDisplay >= n ? order : order.slice(0, maxDisplay - 1);
  const rest = maxDisplay >= n ? [] : order.slice(maxDisplay - 1);
  const items: { name: string; value: string | null; phi: number }[] = shown.map((i) => ({
    name: SHAP_COLS[i],
    value: fmtFeature(row.x[i]),
    phi: row.phi[i],
  }));
  if (rest.length) items.push({ name: `${rest.length} outras variáveis`, value: null, phi: rest.reduce((s, i) => s + row.phi[i], 0) });
  // acumular de baixo (valor de base) para cima (previsão)
  const steps: WaterStep[] = new Array(items.length);
  let acc = row.base;
  for (let k = items.length - 1; k >= 0; k--) {
    const it = items[k];
    steps[k] = { ...it, from: acc, to: acc + it.phi };
    acc += it.phi;
  }
  return steps;
}

/** Valor de base mais todas as contribuições: deve dar a previsão do modelo. */
export const shapSum = (row: ShapRow) => row.base + row.phi.reduce((s, v) => s + v, 0);
