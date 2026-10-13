// Matrizes 2 × 2 como transformações do plano (secções 4 e 5), sem dependências, para poder ser testado com `node`.
// det, produto por um vetor, valores e vetores próprios (reais ou complexos), com vetores próprios de comprimento 1,
// como devolve o NumPy. Testado contra np.linalg.det, np.linalg.eig e np.linalg.eigh (NumPy 2.5), a menos do sinal
// dos vetores próprios, que é arbitrário (v e −v são o mesmo vetor próprio).

export type Vec2 = [number, number];
export type Mat2 = [[number, number], [number, number]];

export function apply(m: Mat2, v: Vec2): Vec2 {
  return [m[0][0] * v[0] + m[0][1] * v[1], m[1][0] * v[0] + m[1][1] * v[1]];
}

export function det(m: Mat2): number {
  return m[0][0] * m[1][1] - m[0][1] * m[1][0];
}

export function isSymmetric(m: Mat2): boolean {
  return m[0][1] === m[1][0];
}

/** (1 − t)·I + t·M: para animar a passagem da identidade para a transformação. */
export function lerpFromIdentity(m: Mat2, t: number): Mat2 {
  return [
    [1 - t + t * m[0][0], t * m[0][1]],
    [t * m[1][0], 1 - t + t * m[1][1]],
  ];
}

export type EigPair = { value: number; vector: Vec2 };

export type Eig2 =
  /** Valores próprios reais. `pairs` por ordem crescente do valor (como o eigh); `allVectors`: M = λI, todas as direções servem. */
  | { kind: "real"; pairs: EigPair[]; allVectors: boolean; defective: boolean }
  /** Valores próprios complexos re ± im·i: nenhuma direção real fica na mesma reta. */
  | { kind: "complex"; re: number; im: number };

const EPS = 1e-12;

function unit(v: Vec2): Vec2 {
  const n = Math.hypot(v[0], v[1]);
  const u: Vec2 = [v[0] / n, v[1] / n];
  // sinal escolhido para a 2.ª componente ficar positiva (ou a 1.ª, se a 2.ª for 0), como nos exemplos da aula e do
  // gabarito; o NumPy pode devolver o oposto noutros casos, e é o mesmo vetor próprio
  const ref = Math.abs(u[1]) > 1e-12 ? u[1] : u[0];
  return ref < 0 ? [-u[0] + 0, -u[1] + 0] : [u[0] + 0, u[1] + 0];
}

/** Uma direção v com (M − λI)v = 0, escolhendo a linha de M − λI com mais informação. */
function nullDir(m: Mat2, l: number): Vec2 | null {
  const a = m[0][0] - l;
  const b = m[0][1];
  const c = m[1][0];
  const d = m[1][1] - l;
  const r1 = Math.hypot(a, b);
  const r2 = Math.hypot(c, d);
  if (r1 < EPS && r2 < EPS) return null; // M − λI = 0: qualquer direção
  return r1 >= r2 ? unit([b, -a]) : unit([d, -c]);
}

export function eig2(m: Mat2): Eig2 {
  const tr = m[0][0] + m[1][1];
  const dt = det(m);
  const disc = tr * tr - 4 * dt;
  const scale = Math.max(1, tr * tr, Math.abs(4 * dt));
  if (disc < -1e-12 * scale) {
    return { kind: "complex", re: tr / 2, im: Math.sqrt(-disc) / 2 };
  }
  const sq = Math.sqrt(Math.max(0, disc));
  // forma estável das duas raízes de λ² − tr·λ + det = 0
  let l1: number;
  let l2: number;
  if (sq === 0) {
    l1 = l2 = tr / 2;
  } else {
    const q = tr >= 0 ? (tr + sq) / 2 : (tr - sq) / 2;
    l1 = q;
    l2 = q !== 0 ? dt / q : tr - q;
  }
  const lo = Math.min(l1, l2);
  const hi = Math.max(l1, l2);
  const repeated = Math.abs(hi - lo) <= 1e-9 * Math.max(1, Math.abs(hi));
  if (repeated) {
    const l = (lo + hi) / 2;
    const v = nullDir(m, l);
    if (!v) {
      return { kind: "real", pairs: [{ value: l, vector: [1, 0] }, { value: l, vector: [0, 1] }], allVectors: true, defective: false };
    }
    return { kind: "real", pairs: [{ value: l, vector: v }], allVectors: false, defective: true };
  }
  const pairs = [lo, hi].map((l) => ({ value: l, vector: nullDir(m, l) as Vec2 }));
  return { kind: "real", pairs, allVectors: false, defective: false };
}

/** Os números de uma matriz são todos inteiros? (np.array([[2, 1], [0, 1]]) fica com dtype int64.) */
export function allInts(m: Mat2): boolean {
  return m.flat().every((x) => Number.isInteger(x));
}
