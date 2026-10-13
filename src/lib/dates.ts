// Datas como "AAAA-MM-DD" em hora local, para não haver saltos de fuso horário.

export type YMD = string;

const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const MONTHS_LONG = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];
const WEEKDAYS = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];

export function toYMD(d: Date): YMD {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function parseYMD(s: YMD): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function todayYMD(): YMD {
  return toYMD(new Date());
}

export function addDays(s: YMD, n: number): YMD {
  const d = parseYMD(s);
  d.setDate(d.getDate() + n);
  return toYMD(d);
}

/** Segunda-feira da semana que contém a data. */
export function mondayOf(s: YMD): YMD {
  const d = parseYMD(s);
  const dow = (d.getDay() + 6) % 7; // 0 = segunda
  d.setDate(d.getDate() - dow);
  return toYMD(d);
}

export function diffDays(a: YMD, b: YMD): number {
  return Math.round((parseYMD(b).getTime() - parseYMD(a).getTime()) / 86400000);
}

export function fmtShort(s: YMD): string {
  const d = parseYMD(s);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function fmtDayMonth(s: YMD): string {
  const d = parseYMD(s);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function fmtMonth(s: YMD): string {
  const d = parseYMD(s);
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function fmtLong(s: YMD): string {
  const d = parseYMD(s);
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} de ${MONTHS_LONG[d.getMonth()]}`;
}

export function monthShort(i: number): string {
  return MONTHS[i];
}

export function fmtDateTime(ms: number): string {
  const d = new Date(ms);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${fmtShort(toYMD(d))}, ${hh}:${mm}`;
}

/** "1h 30" / "45 min" */
export function fmtMinutes(min: number): string {
  const m = Math.round(min);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h}h ${String(r).padStart(2, "0")}` : `${h}h`;
}

/** Valores com vírgula decimal: 15,5 */
export function fmtScore(v: number): string {
  return (Math.round(v * 100) / 100).toLocaleString("pt-PT", { maximumFractionDigits: 2 });
}

export function greeting(): string {
  const h = new Date().getHours();
  if (h < 6) return "Boa noite";
  if (h < 13) return "Bom dia";
  if (h < 20) return "Boa tarde";
  return "Boa noite";
}
