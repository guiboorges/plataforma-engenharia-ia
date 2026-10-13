import type React from "react";
import { Caminhos } from "./Caminhos";
import { Geometria } from "./GeometriaL1L2";
import { Logistica } from "./ExploradorLogistica";

// Widgets do M8: cada entrada é o nome usado em { t: "widget", name } no conteúdo do módulo.
// A lógica (logistica.ts, regularizacao.ts, geometria.ts) não depende de React e foi testada com `node`
// contra o scikit-learn 1.9 (regressão logística, Ridge e Lasso) e o SciPy 1.18 (geometria L1/L2).
export const M8_WIDGETS: Record<string, React.FC<{ moduleId: string }>> = {
  "m8-logistica": Logistica,
  "m8-caminhos": Caminhos,
  "m8-geometria": Geometria,
};
