import { addDays, todayYMD, type YMD } from "./dates";

// Revisão espaçada à moda de Leitner: cada caixa duplica o intervalo.
// "Não sabia" volta à caixa 1 e reaparece na mesma sessão; "Difícil" mantém a caixa; "Sabia" sobe uma.

export type CardState = { box: number; due: YMD; reviews: number; lapses: number; last?: YMD };
export type Rating = "again" | "hard" | "good";

export const INTERVALS = [0, 1, 2, 4, 8, 16, 32]; // dias por caixa (0 = nova)
export const MAX_BOX = INTERVALS.length - 1;

export function newCard(): CardState {
  return { box: 0, due: todayYMD(), reviews: 0, lapses: 0 };
}

export function rate(c: CardState, r: Rating): CardState {
  const today = todayYMD();
  const n: CardState = { ...c, reviews: c.reviews + 1, last: today };
  if (r === "again") {
    n.box = 1;
    n.lapses = c.lapses + 1;
    n.due = today;
  } else if (r === "hard") {
    n.box = Math.max(1, c.box);
    n.due = addDays(today, Math.max(1, Math.ceil(INTERVALS[n.box] / 2)));
  } else {
    n.box = Math.min(MAX_BOX, c.box + 1);
    n.due = addDays(today, INTERVALS[n.box]);
  }
  return n;
}

export function isDue(c: CardState | undefined, today = todayYMD()): boolean {
  return !c || c.due <= today;
}

export function nextLabel(c: CardState, r: Rating): string {
  const n = rate(c, r);
  if (r === "again") return "agora";
  const days = INTERVALS[n.box] && r === "good" ? INTERVALS[n.box] : Math.max(1, Math.ceil(INTERVALS[n.box] / 2));
  return days === 1 ? "amanhã" : `${days} dias`;
}
