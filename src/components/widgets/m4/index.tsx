import type React from "react";
import { TransformWidget, EigenWidget } from "./TransformExplorer";
import { CosineExplorer } from "./CosineExplorer";
import { SvdDemo } from "./SvdDemo";

// Widgets do M4: cada entrada é o nome usado em { t: "widget", name } no conteúdo do módulo.
// A lógica (mat2.ts, cosine.ts, svd.ts e a escrita dos números em npfmt.ts) não depende de React e foi testada contra
// NumPy 2.5 e scikit-learn. "m4-transform" e "m4-eigen" são o mesmo explorador, a começar em S (secção 4) ou em C (secção 5).
export const M4_WIDGETS: Record<string, React.FC<{ moduleId: string }>> = {
  "m4-cosine": CosineExplorer,
  "m4-transform": TransformWidget,
  "m4-eigen": EigenWidget,
  "m4-svd": SvdDemo,
};
