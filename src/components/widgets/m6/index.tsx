import type React from "react";
import { AbTest } from "./AbTest";
import { BayesTree } from "./BayesTree";
import { LlnClt } from "./LlnClt";

// Widgets do M6: cada entrada é o nome usado em { t: "widget", name } no conteúdo do módulo.
// A lógica (stats.ts, bayes.ts, clt.ts, ab.ts) não depende de React: as partes determinísticas foram testadas
// contra NumPy 2.5 e SciPy 1.18, as simulações estatisticamente (o gerador não é o do NumPy).
export const M6_WIDGETS: Record<string, React.FC<{ moduleId: string }>> = {
  "m6-bayes": BayesTree,
  "m6-lgn-tlc": LlnClt,
  "m6-ab": AbTest,
};
