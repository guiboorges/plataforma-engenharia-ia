import type React from "react";
import { MaeRmse } from "./MaeRmse";
import { Overfit } from "./Overfit";
import { Threshold } from "./Threshold";

// Widgets do M7: cada entrada é o nome usado em { t: "widget", name } no conteúdo do módulo.
// A lógica (poly.ts, metrics.ts) não depende de React e foi testada contra NumPy 2.5 e scikit-learn 1.9, com os dados
// da aula guardados em data.ts (os 15 + 1000 pontos da secção 3 e as probabilidades do conjunto de teste da secção 4).
export const M7_WIDGETS: Record<string, React.FC<{ moduleId: string }>> = {
  "m7-sobreajuste": Overfit,
  "m7-limiar": Threshold,
  "m7-mae-rmse": MaeRmse,
};
