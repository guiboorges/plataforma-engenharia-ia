import type React from "react";
import { BroadcastChecker } from "./BroadcastChecker";
import { GroupByDemo } from "./GroupByDemo";
import { TidyDemo } from "./TidyDemo";

// Widgets do M3: cada entrada é o nome usado em { t: "widget", name } no conteúdo do módulo.
// A lógica de cada um (broadcast.ts, groupby.ts, tidy.ts) não depende de React e foi testada contra NumPy 2.5 e pandas 3.0.
export const M3_WIDGETS: Record<string, React.FC<{ moduleId: string }>> = {
  "m3-broadcast": BroadcastChecker,
  "m3-groupby": GroupByDemo,
  "m3-tidy": TidyDemo,
};
