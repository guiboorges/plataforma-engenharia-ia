import type { ModuleContent, PhaseClosing } from "./types";
import { M1 } from "./modules/m1";
import { M2 } from "./modules/m2";
import { M3 } from "./modules/m3";
import { M4 } from "./modules/m4";
import { M5 } from "./modules/m5";
import { M6 } from "./modules/m6";
import { M7 } from "./modules/m7";
import { M8 } from "./modules/m8";
import { M9 } from "./modules/m9";
import { M10 } from "./modules/m10";
import { M11 } from "./modules/m11";
import { F0 } from "./phases/f0";
import { F1 } from "./phases/f1";
import { F2 } from "./phases/f2";
import generated from "./generated/course-docs.json";

// Módulos com versão interativa. Para acrescentar o M2: criar modules/m2.ts e registá-lo aqui.
export const CONTENT: Record<string, ModuleContent> = { M1, M2, M3, M4, M5, M6, M7, M8, M9, M10, M11 };

export type DocPart = "aula" | "apostila" | "exercicios" | "prova" | "gabarito";

export type ModuleDocs = {
  folder: string;
  interactive: boolean;
  files: Partial<Record<DocPart, string>>;
  images: Record<string, string>;
  code: Record<string, string>;
};

export type PhaseDocPart = "exame" | "miniprojeto" | "gabarito";

export type PhaseDocs = {
  folder: string;
  interactive: boolean;
  files: Partial<Record<PhaseDocPart, string>>;
  images: Record<string, string>;
};

const g = generated as unknown as { syncedAt: string; courseDir: string; modules: Record<string, ModuleDocs>; phases?: Record<string, PhaseDocs> };

export const DOCS: Record<string, ModuleDocs> = g.modules ?? {};
export const PHASE_DOCS: Record<string, PhaseDocs> = g.phases ?? {};

// Fechos de fase com versão interativa (exame oficial, mini-projeto, gabarito). Registar aqui: { F0, … }.
export const CLOSINGS: Record<string, PhaseClosing> = { F0, F1, F2 };
export const DOCS_SYNCED_AT = g.syncedAt;

/** Tem versão interativa. */
export const isInteractive = (id: string) => !!CONTENT[id];

/** Tem material em documento (pasta do curso) mas ainda não versão interativa. */
export const isDocOnly = (id: string) => !CONTENT[id] && !!DOCS[id] && Object.keys(DOCS[id].files).length > 0;

export const hasMaterial = (id: string) => isInteractive(id) || isDocOnly(id);
