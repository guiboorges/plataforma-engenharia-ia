import type React from "react";
import { DbscanExplorer } from "./DbscanExplorer";
import { KMeansStepper } from "./KMeansStepper";
import { PcaExplorer } from "./PcaExplorer";

// Widgets do M10: cada entrada é o nome usado em { t: "widget", name } no conteúdo do módulo.
// A lógica (kmeans.ts, dbscan.ts, pca.ts) não depende de React e foi testada contra o scikit-learn 1.9 e o NumPy 2.5
// com os mesmos pontos (data.ts): k-means de Lloyd, ARI, silhueta, DBSCAN (rótulos iguais), distâncias aos vizinhos,
// percentis e PCA 2 × 2.
export const M10_WIDGETS: Record<string, React.FC<{ moduleId: string }>> = {
  "m10-kmeans": KMeansStepper,
  "m10-dbscan": DbscanExplorer,
  "m10-pca": PcaExplorer,
};
