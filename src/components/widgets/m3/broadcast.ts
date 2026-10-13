// Regra de broadcasting do NumPy, passo a passo (sem dependências, para poder ser testada com `node`).
// As dimensões comparam-se da direita para a esquerda; são compatíveis se forem iguais ou se uma delas for 1.
// A dimensão que falta num array com menos dimensões conta como 1.
// Testado contra NumPy 2.5: forma do resultado de np.ones(a) + np.ones(b) e a mensagem do ValueError.

export type Shape = number[];

export type BroadcastStep = {
  /** Posição a contar da direita: 1 = última dimensão. */
  fromRight: number;
  a: number | null;
  b: number | null;
  ok: boolean;
  out: number | null;
  why: string;
};

export type BroadcastResult = { ok: true; shape: Shape; steps: BroadcastStep[] } | { ok: false; error: string; steps: BroadcastStep[]; failAt: number };

/** "(3, 4)", "3,4", "3 4", "(4,)", "()" → [3, 4] … ; null se não for uma forma válida.
 *  Como no Python: uma só vírgula final é permitida ("(4,)"), vírgulas seguidas e zeros à esquerda ("03") não. */
export function parseShape(text: string): Shape | null {
  const t = text.trim().replace(/^\(/, "").replace(/\)$/, "").trim();
  if (t === "") return [];
  let parts: string[];
  if (t.includes(",")) {
    parts = t.split(",").map((x) => x.trim());
    if (parts.length > 1 && parts[parts.length - 1] === "") parts.pop();
  } else {
    parts = t.split(/\s+/);
  }
  if (parts.length === 0 || parts.length > 6) return null;
  const out: number[] = [];
  for (const p of parts) {
    if (!/^(0|[1-9]\d{0,3})$/.test(p)) return null;
    out.push(Number(p));
  }
  return out;
}

/** Como o Python escreve um tuplo: (), (3,), (3, 4). */
export function pyShape(s: Shape): string {
  if (s.length === 0) return "()";
  if (s.length === 1) return `(${s[0]},)`;
  return `(${s.join(", ")})`;
}

/** Como o NumPy escreve a forma nas mensagens de erro: (3,4), (3,). */
function npShape(s: Shape): string {
  if (s.length === 0) return "()";
  if (s.length === 1) return `(${s[0]},)`;
  return `(${s.join(",")})`;
}

export function broadcast(a: Shape, b: Shape): BroadcastResult {
  const n = Math.max(a.length, b.length);
  const steps: BroadcastStep[] = [];
  const out: number[] = [];
  for (let k = 1; k <= n; k++) {
    const da = a.length - k >= 0 ? a[a.length - k] : null;
    const db = b.length - k >= 0 ? b[b.length - k] : null;
    let step: BroadcastStep;
    if (da === null || db === null) {
      const v = (da ?? db) as number;
      step = { fromRight: k, a: da, b: db, ok: true, out: v, why: `falta num dos arrays: conta como 1, fica ${v}` };
    } else if (da === db) {
      step = { fromRight: k, a: da, b: db, ok: true, out: da, why: `iguais: fica ${da}` };
    } else if (da === 1) {
      step = { fromRight: k, a: da, b: db, ok: true, out: db, why: db === 0 ? "a de A vale 1: fica 0" : `a de A vale 1: é repetida ${db} vezes` };
    } else if (db === 1) {
      step = { fromRight: k, a: da, b: db, ok: true, out: da, why: da === 0 ? "a de B vale 1: fica 0" : `a de B vale 1: é repetida ${da} vezes` };
    } else {
      step = { fromRight: k, a: da, b: db, ok: false, out: null, why: `${da} ≠ ${db} e nenhuma vale 1: incompatíveis` };
      steps.push(step);
      return {
        ok: false,
        steps,
        failAt: k,
        error: `operands could not be broadcast together with shapes ${npShape(a)} ${npShape(b)} `,
      };
    }
    steps.push(step);
    out.unshift(step.out as number);
  }
  return { ok: true, shape: out, steps };
}
