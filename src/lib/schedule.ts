import { MODULES, PHASES } from "../content/course";
import { addDays, mondayOf, parseYMD, type YMD } from "./dates";

// Calendário do curso a partir da data de início.
// Regras do plano: cada módulo ocupa as suas semanas; as Fases 0 a 5 fecham com uma semana de exame e mini-projeto;
// 6 semanas de pausa: as duas semanas de Natal de cada ano (as que contêm 25 de dezembro e 1 de janeiro)
// e 2 semanas de verão entre as Fases 3 e 4.

export type Slot = {
  kind: "module" | "closing" | "break";
  id: string; // "M1", "F0-fecho", "pausa-natal-2026"
  phase?: string;
  label: string;
  start: YMD; // segunda-feira
  end: YMD; // domingo
  weeks: number; // semanas de trabalho (pausas: semanas de pausa)
};

export type Schedule = {
  slots: Slot[];
  modules: Record<string, Slot>;
  phases: Record<string, { start: YMD; end: YMD }>;
  breaks: Slot[];
  start: YMD;
  end: YMD;
  totalWeeks: number;
  milestones: { id: string; date: YMD; label: string; optional?: boolean }[];
};

function isChristmasWeek(monday: YMD): boolean {
  for (let i = 0; i < 7; i++) {
    const d = parseYMD(addDays(monday, i));
    if ((d.getMonth() === 11 && d.getDate() === 25) || (d.getMonth() === 0 && d.getDate() === 1)) return true;
  }
  return false;
}

export function computeSchedule(startDate: YMD): Schedule {
  const slots: Slot[] = [];
  const breaks: Slot[] = [];
  let cursor = mondayOf(startDate);

  const pushBreak = (monday: YMD, label: string, id: string) => {
    const last = breaks[breaks.length - 1];
    if (last && addDays(last.end, 1) === monday && last.id === id) {
      last.end = addDays(monday, 6);
      last.weeks += 1;
      return;
    }
    const b: Slot = { kind: "break", id, label, start: monday, end: addDays(monday, 6), weeks: 1 };
    breaks.push(b);
    slots.push(b);
  };

  // reserva n semanas de trabalho, saltando as semanas de Natal
  const allocate = (n: number): { start: YMD; end: YMD } => {
    let start: YMD | null = null;
    let end: YMD = cursor;
    let left = n;
    while (left > 0) {
      if (isChristmasWeek(cursor)) {
        const year = parseYMD(addDays(cursor, 3)).getFullYear();
        const y = parseYMD(cursor).getMonth() === 11 ? year : year - 1;
        pushBreak(cursor, `Pausa de Natal ${y}`, `pausa-natal-${y}`);
      } else {
        if (!start) start = cursor;
        end = addDays(cursor, 6);
        left -= 1;
      }
      cursor = addDays(cursor, 7);
    }
    return { start: start!, end };
  };

  const modules: Record<string, Slot> = {};
  const phases: Record<string, { start: YMD; end: YMD }> = {};

  for (const ph of PHASES) {
    let phStart: YMD | null = null;
    let phEnd: YMD = cursor;
    for (const mid of ph.modules) {
      const meta = MODULES.find((m) => m.id === mid)!;
      const r = allocate(meta.weeks);
      const s: Slot = { kind: "module", id: mid, phase: ph.id, label: `${mid} — ${meta.title}`, start: r.start, end: r.end, weeks: meta.weeks };
      slots.push(s);
      modules[mid] = s;
      if (!phStart) phStart = r.start;
      phEnd = r.end;
    }
    if (ph.id !== "F6") {
      const r = allocate(1);
      slots.push({ kind: "closing", id: `${ph.id}-fecho`, phase: ph.id, label: `Fecho da Fase ${ph.num}: exame e mini-projeto`, start: r.start, end: r.end, weeks: 1 });
      phEnd = r.end;
    }
    phases[ph.id] = { start: phStart!, end: phEnd };
    if (ph.id === "F3") {
      for (let i = 0; i < 2; i++) {
        const y = parseYMD(cursor).getFullYear();
        pushBreak(cursor, `Pausa de verão ${y}`, `pausa-verao-${y}`);
        cursor = addDays(cursor, 7);
      }
    }
  }

  slots.sort((a, b) => (a.start < b.start ? -1 : a.start > b.start ? 1 : 0));
  const start = slots[0].start;
  const end = slots[slots.length - 1].end;
  const totalWeeks = Math.round((parseYMD(addDays(end, 1)).getTime() - parseYMD(start).getTime()) / (7 * 86400000));

  const milestones: Schedule["milestones"] = [
    { id: "aif", date: modules["M19"].end, label: "AIF-C01 (opcional)", optional: true },
    { id: "ncagenl", date: phases["F4"].end, label: "NCA-GENL (opcional)", optional: true },
    { id: "mlac02", date: phases["F6"].end, label: "MLA-C02" },
  ];

  return { slots, modules, phases, breaks, start, end, totalWeeks, milestones };
}

/** Em que bloco do calendário cai uma data. */
export function slotAt(s: Schedule, day: YMD): Slot | null {
  for (const sl of s.slots) if (day >= sl.start && day <= sl.end) return sl;
  return null;
}

/** Semana n de N (1-based) a contar do início do plano. */
export function weekNumber(s: Schedule, day: YMD): number {
  const d = (parseYMD(day).getTime() - parseYMD(s.start).getTime()) / (7 * 86400000);
  return Math.floor(d) + 1;
}
