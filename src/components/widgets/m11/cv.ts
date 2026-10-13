// Esquemas de validação do scikit-learn 1.9, reproduzidos índice a índice (secção 3 da aula).
// KFold e StratifiedKFold com shuffle=True usam o RandomState(semente) do NumPy (MT19937 com o shuffle
// "legacy"), por isso as divisões são as mesmas do Python para o mesmo n, k e random_state.
// Testado contra o scikit-learn 1.9.1 e o NumPy 2.5.3 (ver o relatório da conversão do M11).

/** Gerador MT19937 com a semente "legacy" de np.random.RandomState(seed). */
export class MT19937 {
  private mt = new Uint32Array(624);
  private mti = 624;
  constructor(seed: number) {
    let s = seed >>> 0;
    for (let i = 0; i < 624; i++) {
      this.mt[i] = s;
      // s = (1812433253 * (s ^ (s >>> 30)) + i + 1) mod 2^32
      const x = (s ^ (s >>> 30)) >>> 0;
      s = (Math.imul(1812433253, x) + i + 1) >>> 0;
    }
    this.mti = 624;
  }
  nextU32(): number {
    const mt = this.mt;
    if (this.mti >= 624) {
      for (let k = 0; k < 624; k++) {
        const y = (mt[k] & 0x80000000) | (mt[(k + 1) % 624] & 0x7fffffff);
        let v = mt[(k + 397) % 624] ^ (y >>> 1);
        if (y & 1) v ^= 0x9908b0df;
        mt[k] = v >>> 0;
      }
      this.mti = 0;
    }
    let y = mt[this.mti++];
    y ^= y >>> 11;
    y ^= (y << 7) & 0x9d2c5680;
    y ^= (y << 15) & 0xefc60000;
    y ^= y >>> 18;
    return y >>> 0;
  }
}

/** random_interval da numpy legacy: inteiro uniforme em [0, max], por rejeição com máscara. */
function randomInterval(rng: MT19937, max: number): number {
  if (max === 0) return 0;
  let mask = max;
  mask |= mask >>> 1;
  mask |= mask >>> 2;
  mask |= mask >>> 4;
  mask |= mask >>> 8;
  mask |= mask >>> 16;
  mask >>>= 0;
  let v: number;
  do v = (rng.nextU32() & mask) >>> 0;
  while (v > max);
  return v;
}

/** RandomState.shuffle de um vetor 1-D (Fisher–Yates do fim para o início). */
export function rsShuffle<T>(a: T[], rng: MT19937): void {
  for (let i = a.length - 1; i >= 1; i--) {
    const j = randomInterval(rng, i);
    const t = a[i];
    a[i] = a[j];
    a[j] = t;
  }
}

export type Fold = { train: number[]; test: number[] };
export type Scheme = "kfold" | "stratified" | "group" | "time";

const range = (n: number) => Array.from({ length: n }, (_, i) => i);
const sortNum = (a: number[]) => a.slice().sort((x, y) => x - y);

/** Junta as divisões a partir dos índices de teste (como o _BaseKFold.split: treino = o resto). */
function fromTests(n: number, tests: number[][]): Fold[] {
  return tests.map((t) => {
    const inTest = new Set(t);
    return { train: range(n).filter((i) => !inTest.has(i)), test: sortNum(t) };
  });
}

/** KFold(k, shuffle, random_state). */
export function kfold(n: number, k: number, shuffle: boolean, seed = 0): Fold[] {
  if (k < 2 || k > n) throw new Error(`k=${k} não pode ser maior do que n=${n}.`);
  const idx = range(n);
  if (shuffle) rsShuffle(idx, new MT19937(seed));
  const tests: number[][] = [];
  let cur = 0;
  for (let f = 0; f < k; f++) {
    const size = Math.floor(n / k) + (f < n % k ? 1 : 0);
    tests.push(idx.slice(cur, cur + size));
    cur += size;
  }
  return fromTests(n, tests);
}

/** StratifiedKFold(k, shuffle, random_state): as classes são codificadas pela ordem em que aparecem. */
export function stratifiedKfold(y: number[], k: number, shuffle: boolean, seed = 0): Fold[] {
  const n = y.length;
  const order: number[] = [];
  for (const v of y) if (!order.includes(v)) order.push(v);
  const enc = y.map((v) => order.indexOf(v));
  const nClasses = order.length;
  const counts = range(nClasses).map((c) => enc.filter((e) => e === c).length);
  if (counts.every((c) => k > c)) throw new Error(`k=${k} é maior do que o número de exemplos de cada classe.`);
  const sorted = sortNum(enc);
  // allocation[f][c]: quantos exemplos da classe c vão para o teste da divisão f (round robin sobre y ordenado)
  const allocation = range(k).map((f) => {
    const row = new Array(nClasses).fill(0);
    for (let i = f; i < n; i += k) row[sorted[i]]++;
    return row;
  });
  const rng = new MT19937(seed);
  const testFolds = new Array(n).fill(-1);
  for (let c = 0; c < nClasses; c++) {
    const folds: number[] = [];
    for (let f = 0; f < k; f++) for (let r = 0; r < allocation[f][c]; r++) folds.push(f);
    if (shuffle) rsShuffle(folds, rng);
    let j = 0;
    for (let i = 0; i < n; i++) if (enc[i] === c) testFolds[i] = folds[j++];
  }
  return fromTests(
    n,
    range(k).map((f) => range(n).filter((i) => testFolds[i] === f)),
  );
}

/** GroupKFold(k) sem baralhar: os grupos maiores primeiro, cada um para a divisão com menos exemplos. */
export function groupKfold(groups: number[], k: number): Fold[] {
  const n = groups.length;
  const uniq = sortNum([...new Set(groups)]);
  if (k > uniq.length) throw new Error(`k=${k} é maior do que o número de grupos (${uniq.length}).`);
  const gIdx = groups.map((g) => uniq.indexOf(g));
  const perGroup = uniq.map((_, i) => gIdx.filter((x) => x === i).length);
  // np.argsort(perGroup, kind="stable")[::-1]
  const asc = range(uniq.length).sort((a, b) => perGroup[a] - perGroup[b] || a - b);
  const indices = asc.reverse();
  const perFold = new Array(k).fill(0);
  const groupToFold = new Array(uniq.length).fill(0);
  for (const gi of indices) {
    let lightest = 0;
    for (let f = 1; f < k; f++) if (perFold[f] < perFold[lightest]) lightest = f; // np.argmin: o primeiro mínimo
    perFold[lightest] += perGroup[gi];
    groupToFold[gi] = lightest;
  }
  return fromTests(
    n,
    range(k).map((f) => range(n).filter((i) => groupToFold[gIdx[i]] === f)),
  );
}

/** TimeSeriesSplit(k): teste com n // (k + 1) exemplos, treino com tudo o que vem antes. */
export function timeSeriesSplit(n: number, k: number): Fold[] {
  const nFolds = k + 1;
  if (nFolds > n) throw new Error(`Com n=${n} não há exemplos para ${k} divisões.`);
  const testSize = Math.floor(n / nFolds);
  if (n - testSize * k <= 0) throw new Error("Divisões demasiado grandes para estes dados.");
  const out: Fold[] = [];
  for (let start = n - k * testSize; start < n; start += testSize) {
    out.push({ train: range(start), test: range(testSize).map((i) => start + i) });
  }
  return out;
}

/** Grupos consecutivos de tamanho g (como as horas de um mesmo dia): 0,0,0,0,1,1,1,1,… */
export const consecutiveGroups = (n: number, g: number) => range(n).map((i) => Math.floor(i / g));

/** Os primeiros 40 valores de `survived` do Titanic da aula (1 = sobreviveu). */
export const TITANIC_40 = "0111000011110001010101110100100110001001".split("").map(Number);

export function splitScheme(
  scheme: Scheme,
  opts: { n: number; k: number; shuffle: boolean; seed: number; groupSize: number; y: number[] },
): Fold[] {
  const { n, k, shuffle, seed, groupSize, y } = opts;
  if (scheme === "kfold") return kfold(n, k, shuffle, seed);
  if (scheme === "stratified") return stratifiedKfold(y.slice(0, n), k, shuffle, seed);
  if (scheme === "group") return groupKfold(consecutiveGroups(n, groupSize), k);
  return timeSeriesSplit(n, k);
}
