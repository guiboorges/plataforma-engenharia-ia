import type React from "react";
import { DerivativeExplorer } from "./DerivativeExplorer";
import { NeuronGraph } from "./NeuronGraph";
import { DescentPlayground } from "./DescentPlayground";

// Widgets do M5: cada entrada é o nome usado em { t: "widget", name } no conteúdo do módulo.
// A lógica de cada um (derivada.ts, neuronio.ts, descida.ts, fmt.ts) não depende de React e foi testada contra NumPy 2.5.
export const M5_WIDGETS: Record<string, React.FC<{ moduleId: string }>> = {
  "m5-derivada": DerivativeExplorer,
  "m5-grafo": NeuronGraph,
  "m5-descida": DescentPlayground,
};
