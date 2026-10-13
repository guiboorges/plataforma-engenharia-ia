import { CLOSINGS, CONTENT, isDocOnly, hasMaterial } from "../content";
import { COURSE, MODULES, PHASES } from "../content/course";
import type { Flashcard } from "../content/types";
import { addDays, mondayOf, todayYMD, type YMD } from "./dates";
import { closingAttempts } from "./exam";
import { isDue } from "./srs";
import type { Core, ModProg } from "./store";
import { readMod } from "./store";

export type ModStatus = "concluido" | "em-curso" | "por-comecar" | "sem-material";

export function hasActivity(m: ModProg): boolean {
  return (
    Object.keys(m.tasks).length > 0 ||
    Object.keys(m.sections).length > 0 ||
    Object.keys(m.exercises).length > 0 ||
    m.attempts.length > 0 ||
    !!m.doc?.triedAt ||
    !!m.notes
  );
}

export function moduleStatus(id: string, m: ModProg): ModStatus {
  if (m.passedAt) return "concluido";
  if (hasActivity(m)) return "em-curso";
  if (!hasMaterial(id)) return "sem-material";
  return "por-comecar";
}

export const STATUS_LABEL: Record<ModStatus, string> = {
  concluido: "Concluído",
  "em-curso": "Em curso",
  "por-comecar": "Por começar",
  "sem-material": "Material por adicionar",
};

/** Partes do módulo e o que já está feito (0 a 1 cada). */
export function moduleParts(id: string, m: ModProg) {
  const c = CONTENT[id];
  if (c) {
    const secs = c.lesson.length;
    const read = c.lesson.filter((s) => m.sections[s.id]).length;
    const exTotal = c.exercises.length;
    const exDone = c.exercises.filter((e) => m.exercises[e.id]?.submittedAt).length;
    return {
      aula: secs ? read / secs : 0,
      apostila: m.apostilaReviewedAt ? 1 : 0,
      exercicios: exTotal ? exDone / exTotal : 0,
      prova: m.passedAt ? 1 : 0,
      detail: { read, secs, exDone, exTotal },
    };
  }
  if (isDocOnly(id)) {
    return {
      aula: m.sections.doc ? 1 : 0,
      apostila: m.apostilaReviewedAt ? 1 : 0,
      exercicios: m.doc?.triedAt ? 1 : 0,
      prova: m.passedAt ? 1 : 0,
      detail: { read: m.sections.doc ? 1 : 0, secs: 1, exDone: m.doc?.triedAt ? 1 : 0, exTotal: 1 },
    };
  }
  return { aula: 0, apostila: 0, exercicios: 0, prova: m.passedAt ? 1 : 0, detail: { read: 0, secs: 0, exDone: 0, exTotal: 0 } };
}

export function moduleFraction(id: string, m: ModProg): number {
  if (m.passedAt) return 1;
  const p = moduleParts(id, m);
  return p.aula * 0.35 + p.apostila * 0.1 + p.exercicios * 0.35 + p.prova * 0.2;
}

/** O primeiro módulo ainda não concluído. */
export function currentModuleId(docs: Record<string, any>): string {
  for (const m of MODULES) if (!readMod(docs, m.id).passedAt) return m.id;
  return MODULES[MODULES.length - 1].id;
}

export function completedCount(docs: Record<string, any>): number {
  return MODULES.filter((m) => readMod(docs, m.id).passedAt).length;
}

export function phaseFraction(phaseId: string, docs: Record<string, any>): number {
  const ph = PHASES.find((p) => p.id === phaseId)!;
  const fr = ph.modules.map((id) => moduleFraction(id, readMod(docs, id)));
  return fr.reduce((a, b) => a + b, 0) / fr.length;
}

// ---------- tempo de estudo

export function minutesByWeek(core: Core): Map<YMD, number> {
  const map = new Map<YMD, number>();
  for (const e of core.log) {
    const w = mondayOf(e.date);
    map.set(w, (map.get(w) ?? 0) + e.minutes);
  }
  return map;
}

export function lastWeeks(core: Core, n: number): { week: YMD; minutes: number }[] {
  const map = minutesByWeek(core);
  const thisWeek = mondayOf(todayYMD());
  const out: { week: YMD; minutes: number }[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const w = addDays(thisWeek, -7 * i);
    out.push({ week: w, minutes: map.get(w) ?? 0 });
  }
  return out;
}

export function totalMinutes(core: Core): number {
  return core.log.reduce((a, e) => a + e.minutes, 0);
}

/** Semanas seguidas (até à anterior, ou incluindo a atual se já cumprida) com a meta cumprida. */
export function weekStreak(core: Core): number {
  const map = minutesByWeek(core);
  const target = core.settings.weeklyTargetMin;
  let w = mondayOf(todayYMD());
  let streak = (map.get(w) ?? 0) >= target ? 1 : 0;
  w = addDays(w, -7);
  while ((map.get(w) ?? 0) >= target) {
    streak += 1;
    w = addDays(w, -7);
  }
  return streak;
}

// ---------- cartões de revisão

export type CardRef = { key: string; module: string; card: Flashcard };

/** Cartões disponíveis: os das secções já lidas. */
export function availableCards(docs: Record<string, any>): CardRef[] {
  const out: CardRef[] = [];
  for (const [mid, c] of Object.entries(CONTENT)) {
    const m = readMod(docs, mid);
    for (const card of c.flashcards) if (m.sections[card.section]) out.push({ key: `${mid}:${card.id}`, module: mid, card });
  }
  return out;
}

export function dueCards(docs: Record<string, any>, core: Core): CardRef[] {
  const today = todayYMD();
  return availableCards(docs).filter((r) => isDue(core.srs[r.key], today));
}

// ---------- fecho de fase: exame (14) e mini-projeto (12)

export type PhaseClosingState = {
  examBest?: number;
  examPassed: boolean;
  projectScore: number;
  projectMax: number;
  projectPassed: boolean;
  done: boolean;
};

/** Mínimos para passar à fase seguinte: os do fecho oficial, se existir; senão 14 no exame e 12 no mini-projeto. */
export function phasePassRule(phaseId: string): { exam: number; project: number } {
  return CLOSINGS[phaseId]?.passRule ?? { exam: COURSE.passMark, project: 12 };
}

/** Grelha do mini-projeto da fase (a oficial, se existir). */
export function phaseRubric(phaseId: string): { id: string; text: string; points: number; detail?: string }[] {
  const cl = CLOSINGS[phaseId];
  if (cl) return cl.project.rubric;
  return PHASES.find((p) => p.id === phaseId)?.closing.project.rubric ?? [];
}

/** Passa-se à fase seguinte com o exame aprovado e o mini-projeto entregue com nota suficiente. */
export function phaseClosingState(phaseId: string, core: Core): PhaseClosingState {
  const rule = phasePassRule(phaseId);
  const done = closingAttempts(phaseId, core.phaseExams[phaseId] ?? []).filter((a) => a.status === "done" && typeof a.score === "number");
  const examBest = done.length ? Math.max(...done.map((a) => a.score as number)) : undefined;
  const examPassed = examBest !== undefined && examBest >= rule.exam;
  const rubric = phaseRubric(phaseId);
  const proj = core.projects[phaseId];
  const projectScore = rubric.reduce((acc, c) => acc + Math.min(c.points, Math.max(0, proj?.scores[c.id] ?? 0)), 0);
  const projectMax = rubric.reduce((acc, c) => acc + c.points, 0);
  const projectPassed = proj?.status === "entregue" && projectScore >= rule.project;
  return { examBest, examPassed, projectScore, projectMax, projectPassed, done: examPassed && projectPassed };
}

/** Resumo curto para os cartões de fecho: "Fase concluída" ou "Exame 15,5 · Projeto 13" (null se ainda não há nada). */
export function phaseClosingSummary(st: PhaseClosingState): { label: string; tone: "ok" | "warn" | "neutral" } | null {
  if (st.done) return { label: "Fase concluída", tone: "ok" };
  const fmt = (v: number) => String(Math.round(v * 100) / 100).replace(".", ",");
  const parts: string[] = [];
  if (st.examBest !== undefined) parts.push(`Exame ${fmt(st.examBest)}`);
  if (st.projectScore > 0) parts.push(`Projeto ${fmt(st.projectScore)}`);
  if (!parts.length) return null;
  return { label: parts.join(" · "), tone: st.examBest !== undefined && !st.examPassed ? "warn" : "neutral" };
}
