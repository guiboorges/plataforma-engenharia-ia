import type { ExamQuestion, ExamSpec, McqQuestion, ModuleContent, TfQuestion } from "../content/types";
import { CLOSINGS, CONTENT } from "../content";
import { phaseMeta } from "../content/course";
import type { Attempt, ModProg } from "./store";
import { uid } from "./store";

export const RETAKE_DAYS = 7;

export function allQuestions(spec: ExamSpec): ExamQuestion[] {
  return spec.groups.flatMap((g) => g.questions);
}

export function newAttempt(spec: ExamSpec, picked?: string[]): Attempt {
  const now = Date.now();
  return { id: uid(), startedAt: now, deadline: now + spec.minutes * 60_000, answers: {}, status: "running", picked };
}

export function mcqScore(spec: ExamSpec, a: Attempt): number {
  let s = 0;
  for (const q of allQuestions(spec)) if (q.kind === "mcq" && a.answers[q.id] === q.answer) s += q.points;
  return s;
}

export function openPoints(q: ExamQuestion, a: Attempt): number {
  if (q.kind !== "open") return 0;
  const g = a.grading?.[q.id] ?? {};
  const sum = q.criteria.reduce((acc, c) => acc + Math.min(c.points, Math.max(0, g[c.id] ?? 0)), 0);
  return Math.min(q.points, sum);
}

export function questionPoints(q: ExamQuestion, a: Attempt): number {
  if (q.kind === "mcq") return a.answers[q.id] === q.answer ? q.points : 0;
  return openPoints(q, a);
}

export function totalScore(spec: ExamSpec, a: Attempt): number {
  return allQuestions(spec).reduce((acc, q) => acc + questionPoints(q, a), 0);
}

/** Secções a rever: as das perguntas que não tiveram a cotação toda. */
export function weakSections(spec: ExamSpec, a: Attempt): { section: string; questions: number[] }[] {
  const map = new Map<string, number[]>();
  for (const q of allQuestions(spec)) {
    if (questionPoints(q, a) < q.points - 1e-9) {
      const k = q.section;
      map.set(k, [...(map.get(k) ?? []), q.num]);
    }
  }
  return [...map.entries()].map(([section, questions]) => ({ section, questions })).sort((x, y) => x.section.localeCompare(y.section));
}

export function lastDone(attempts: Attempt[]): Attempt | undefined {
  return [...attempts].reverse().find((a) => a.status === "done");
}

export function runningAttempt(attempts: Attempt[]): Attempt | undefined {
  return attempts.find((a) => a.status === "running");
}

export function gradingAttempt(attempts: Attempt[]): Attempt | undefined {
  return attempts.find((a) => a.status === "grading");
}

/** Data a partir da qual se pode repetir a prova (null = pode já). */
export function retakeLockedUntil(mod: ModProg, allowEarly: boolean): number | null {
  if (allowEarly || mod.passedAt) return null;
  const last = lastDone(mod.attempts);
  if (!last || last.passed) return null;
  const until = (last.submittedAt ?? last.startedAt) + RETAKE_DAYS * 86400_000;
  return until > Date.now() ? until : null;
}

// ---------- sorteio com semente

export function rng(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------- simulado de treino

export type PracticeItem =
  | { kind: "mcq"; module: string; q: McqQuestion; order: number[] }
  | { kind: "tf"; module: string; q: TfQuestion };

export function buildPractice(modules: string[], nMcq: number, nTf: number, seed = Date.now()): PracticeItem[] {
  const rand = rng(seed);
  const mcq: PracticeItem[] = [];
  const tf: PracticeItem[] = [];
  for (const id of modules) {
    const c = CONTENT[id];
    if (!c) continue;
    c.practice.mcq.forEach((q) => mcq.push({ kind: "mcq", module: id, q, order: shuffle(q.options.map((_, i) => i), rand) }));
    c.practice.tf.forEach((q) => tf.push({ kind: "tf", module: id, q }));
  }
  return shuffle([...shuffle(mcq, rand).slice(0, nMcq), ...shuffle(tf, rand).slice(0, nTf)], rand);
}

// ---------- exame de fase: perguntas das provas de todos os módulos da fase

export type PhaseExamInfo =
  | { ready: false; missing: string[] }
  | { ready: true; spec: ExamSpec; modules: string[] };

/** Monta a especificação a partir das perguntas sorteadas (ids "M1:p3"). */
export function phaseSpecFromPicked(phaseId: string, picked: string[]): ExamSpec {
  const mcq: ExamQuestion[] = [];
  const open: ExamQuestion[] = [];
  let n = 0;
  for (const key of picked) {
    const [mid, qid] = key.split(":");
    const c = CONTENT[mid];
    const q = c && allQuestions(c.exam).find((x) => x.id === qid);
    if (!q) continue;
    const copy = { ...q, id: key, section: `${mid}:${q.section}` } as ExamQuestion;
    (q.kind === "mcq" ? mcq : open).push(copy);
  }
  mcq.forEach((q) => (q.num = ++n));
  open.forEach((q) => (q.num = ++n));
  const ph = phaseMeta(phaseId);
  return {
    minutes: 90,
    total: 20,
    pass: 14,
    groups: [
      { title: "Grupo I — Escolha múltipla", note: "1 valor cada; respostas erradas não descontam.", questions: mcq },
      { title: "Grupo II — Resposta curta e desenvolvimento", note: `Perguntas das provas dos módulos da Fase ${ph.num}.`, questions: open },
    ],
  };
}

export function phaseExam(phaseId: string, seed?: number): PhaseExamInfo {
  const ph = phaseMeta(phaseId);
  const missing = ph.modules.filter((m) => !CONTENT[m]);
  if (missing.length) return { ready: false, missing };
  const rand = rng(seed ?? 1);
  const per = (n: number) => Math.max(1, Math.round(n / ph.modules.length));
  const picked: string[] = [];
  // 12 de escolha múltipla (1 valor) e 8 valores de perguntas abertas, distribuídos pelos módulos
  let mcqLeft = 12;
  for (const mid of ph.modules) {
    const qs = allQuestions(CONTENT[mid].exam).filter((q) => q.kind === "mcq");
    const take = shuffle(qs, rand).slice(0, Math.min(per(12), mcqLeft));
    take.forEach((q) => picked.push(`${mid}:${q.id}`));
    mcqLeft -= take.length;
  }
  let openLeft = 8;
  const opens = shuffle(
    ph.modules.flatMap((mid) => allQuestions(CONTENT[mid].exam).filter((q) => q.kind === "open" && q.points <= 2).map((q) => ({ mid, q }))),
    rand,
  );
  for (const { mid, q } of opens) {
    if (openLeft <= 0) break;
    picked.push(`${mid}:${q.id}`);
    openLeft -= q.points;
  }
  return { ready: true, spec: phaseSpecFromPicked(phaseId, picked), modules: ph.modules };
}

/** Especificação de uma tentativa de exame de fase: a oficial, se a fase tiver fecho interativo; senão a sorteada. */
export function phaseSpecFor(phaseId: string, a?: Pick<Attempt, "picked">): ExamSpec {
  const cl = CLOSINGS[phaseId];
  // uma tentativa com perguntas sorteadas é do exame gerado, mesmo que a fase já tenha o exame oficial
  if (!cl || a?.picked?.length) return phaseSpecFromPicked(phaseId, a?.picked ?? []);
  return cl.exam;
}

/**
 * Tentativas que contam para o exame de uma fase: com fecho oficial, só as do exame oficial
 * (as sorteadas antes de o fecho existir têm outras perguntas e não abrem nem corrigem o exame oficial).
 */
export function closingAttempts(phaseId: string, attempts: Attempt[]): Attempt[] {
  return CLOSINGS[phaseId] ? attempts.filter((a) => !a.picked?.length) : attempts;
}

/** Data a partir da qual se pode repetir o exame de fase (null = pode já). Como nas provas: uma semana abaixo de 14. */
export function phaseRetakeLockedUntil(attempts: Attempt[], allowEarly: boolean): number | null {
  if (allowEarly || attempts.some((a) => a.status === "done" && a.passed)) return null;
  const last = lastDone(attempts);
  if (!last || last.passed) return null;
  const until = (last.submittedAt ?? last.startedAt) + RETAKE_DAYS * 86400_000;
  return until > Date.now() ? until : null;
}

/** Módulos a rever no exame oficial de uma fase: os da tabela do gabarito com perguntas sem a cotação toda. */
export function closingWeakModules(phaseId: string, a: Attempt): { module: string; questions: number[] }[] {
  const cl = CLOSINGS[phaseId];
  if (!cl) return [];
  const lost = new Set(allQuestions(cl.exam).filter((q) => questionPoints(q, a) < q.points - 1e-9).map((q) => q.num));
  return cl.examReview.map((r) => ({ module: r.module, questions: r.questions.filter((n) => lost.has(n)) })).filter((r) => r.questions.length > 0);
}

export function moduleSpec(c: ModuleContent): ExamSpec {
  return c.exam;
}
