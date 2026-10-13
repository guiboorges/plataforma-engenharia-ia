import type React from "react";
import { SliceExplorer } from "./SliceExplorer";
import { AliasLab } from "./AliasLab";
import { LoopStepper } from "./LoopStepper";

// Widgets do M2: cada entrada é o nome usado em { t: "widget", name } no conteúdo do módulo.
// A lógica de cada um está num ficheiro .ts à parte (slicing, aliasing, loops), testada contra o Python real.
export const M2_WIDGETS: Record<string, React.FC<{ moduleId: string }>> = {
  "m2-slicing": SliceExplorer,
  "m2-aliasing": AliasLab,
  "m2-loops": LoopStepper,
};
