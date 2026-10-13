import type React from "react";
import { CvSchemes } from "./CvSchemes";
import { ThresholdExplorer } from "./ThresholdExplorer";
import { ShapWaterfall } from "./ShapWaterfall";

// Widgets do M11: cada entrada é o nome usado em { t: "widget", name } no conteúdo do módulo.
// A lógica (cv.ts, limiar.ts, shap.ts) não depende de React e foi testada contra o scikit-learn 1.9.1, o NumPy 2.5.3
// e o shap 0.53: as divisões são as mesmas do Python, e os dados do Caravan e do Bikeshare são os da aula.
export const M11_WIDGETS: Record<string, React.FC<{ moduleId: string }>> = {
  "m11-validacao": CvSchemes,
  "m11-limiar": ThresholdExplorer,
  "m11-shap": ShapWaterfall,
};
