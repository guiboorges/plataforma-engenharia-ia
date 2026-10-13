// Escrever números como o Python e o NumPy os imprimem (sem dependências, para poder ser testado com `node`).
// - pyFloat: print() de um float (ou de um escalar np.float64): o repr mais curto, "5.0", "0.9999999999999998", "1e-05".
// - npArray / npMatrix: print() de um array com np.set_printoptions(precision=3, suppress=True), como na aula:
//   "[2. 0.]", "[0.866 0.5  ]", "[[-0.707  0.707]\n [ 0.707  0.707]]"; arrays de inteiros: "[ 3 -1]".
// - pyFixed: f"{x:.2f}" (arredondamento do valor exato, empates para o par, como o Python).
// Testado contra Python 3.13 e NumPy 2.5.

/** O repr de um float do Python: dígitos mais curtos; notação científica se o expoente for < −4 ou ≥ 16. */
export function pyFloat(x: number): string {
  if (Number.isNaN(x)) return "nan";
  if (!Number.isFinite(x)) return x > 0 ? "inf" : "-inf";
  if (x === 0) return Object.is(x, -0) ? "-0.0" : "0.0";
  const [mant, expStr] = x.toExponential().split("e");
  const exp = Number(expStr);
  const neg = mant.startsWith("-");
  const digits = mant.replace("-", "").replace(".", "");
  const sign = neg ? "-" : "";
  if (exp < -4 || exp >= 16) {
    const m = digits.length > 1 ? `${digits[0]}.${digits.slice(1)}` : digits;
    const e = Math.abs(exp);
    return `${sign}${m}e${exp < 0 ? "-" : "+"}${e < 10 ? "0" : ""}${e}`;
  }
  if (exp >= 0) {
    const intLen = exp + 1;
    if (digits.length <= intLen) return `${sign}${digits.padEnd(intLen, "0")}.0`;
    return `${sign}${digits.slice(0, intLen)}.${digits.slice(intLen)}`;
  }
  return `${sign}0.${"0".repeat(-exp - 1)}${digits}`;
}

/** Casas decimais exatas de um double (até 30), para detetar empates verdadeiros. */
function exactFixed(x: number, d: number): string {
  return Math.abs(x).toFixed(Math.min(100, d));
}

/** Arredonda |x| a `d` casas a partir do valor exato; empates para o par (como o Python e o Dragon4 do NumPy). */
function roundAbs(x: number, d: number): string {
  const ax = Math.abs(x);
  const wide = exactFixed(ax, d + 30); // o valor exato com 30 casas a mais
  const tail = wide.slice(wide.length - 30);
  let s = ax.toFixed(d); // toFixed arredonda o valor exato, empates para cima
  if (tail === "5" + "0".repeat(29)) {
    // empate exato: o toFixed subiu; o Python fica com o dígito par
    const down = wide.slice(0, wide.length - 30);
    const lastDigit = Number(down[down.length - 1]);
    if (lastDigit % 2 === 0) s = down;
  }
  return s;
}

/** f"{x:.{d}f}" do Python. */
export function pyFixed(x: number, d = 2): string {
  if (Number.isNaN(x)) return "nan";
  const s = roundAbs(x, d);
  return (x < 0 || Object.is(x, -0)) ? `-${s}` : s;
}

/** Um float como o Dragon4 do NumPy o escreve com precision=3, unique=True, trim='.': "0.866", "0.5", "2.", "-0.707". */
function npDragon(x: number, precision = 3): string {
  const neg = x < 0 || Object.is(x, -0);
  const ax = Math.abs(x);
  // dígitos mais curtos que identificam o número; se tiver mais casas do que `precision`, arredonda-se o valor exato
  const short = pyFloat(ax);
  let body: string;
  if (!/e/.test(short) && (short.split(".")[1] ?? "").length <= precision) {
    body = short;
  } else {
    body = roundAbs(ax, precision);
  }
  let [ip, fp = ""] = body.split(".");
  fp = fp.replace(/0+$/, "");
  if (ip === "") ip = "0";
  return `${neg ? "-" : ""}${ip}.${fp}`;
}

function fmtFloats(xs: number[]): string[] {
  const strs = xs.map((x) => npDragon(x));
  const parts = strs.map((s) => s.split("."));
  const padLeft = Math.max(...parts.map((p) => p[0].length));
  const padRight = Math.max(...parts.map((p) => p[1].length));
  return parts.map(([i, f]) => `${i.padStart(padLeft)}.${f.padEnd(padRight)}`);
}

function fmtInts(xs: number[]): string[] {
  const strs = xs.map((x) => String(Math.round(x) === 0 ? 0 : Math.round(x)));
  const w = Math.max(...strs.map((s) => s.length));
  return strs.map((s) => s.padStart(w));
}

/** print() de um array 1D (precision=3, suppress=True). `ints` = array de inteiros (dtype int64). */
export function npArray(xs: number[], ints = false): string {
  const cells = ints ? fmtInts(xs) : fmtFloats(xs);
  return `[${cells.join(" ")}]`;
}

/** print() de um array 2D (precision=3, suppress=True): todos os elementos com a mesma largura. */
export function npMatrix(rows: number[][], ints = false): string {
  const flat = rows.flat();
  const cells = ints ? fmtInts(flat) : fmtFloats(flat);
  const n = rows[0]?.length ?? 0;
  const lines = rows.map((_, i) => `[${cells.slice(i * n, i * n + n).join(" ")}]`);
  return `[${lines.join("\n ")}]`;
}

/** Um número curto para texto corrido, com vírgula decimal (pt-PT): 0,707; 2; −0,5. */
export function ptNum(x: number, d = 3): string {
  const r = Number(x.toFixed(d));
  const v = Object.is(r, -0) ? 0 : r;
  return String(v).replace("-", "−").replace(".", ",");
}
