import type React from "react";
import { BoostByHand } from "./BoostByHand";
import { ForestVote } from "./ForestVote";
import { SplitExplorer } from "./SplitExplorer";

// Widgets do M9: cada entrada é o nome usado em { t: "widget", name } no conteúdo do módulo.
// A lógica (split.ts, forest.ts, boost.ts) não depende de React e foi testada contra o scikit-learn 1.9: os cortes e o
// boosting coincidem exatamente; as florestas usam outro gerador aleatório e foram comparadas em média.
export const M9_WIDGETS: Record<string, React.FC<{ moduleId: string }>> = {
  "m9-corte": SplitExplorer,
  "m9-floresta": ForestVote,
  "m9-boosting": BoostByHand,
};
