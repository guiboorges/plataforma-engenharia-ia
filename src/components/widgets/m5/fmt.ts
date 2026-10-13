// Números escritos como o Python os escreve (sem dependências, para poder ser testado com `node`).
// Testado contra Python 3.13: repr(float), round(x, d) e f"{x:.1e}".

/** repr(x) de um float do Python: dígitos mínimos; notação científica abaixo de 1e-4 e a partir de 1e16. */
export function pyRepr(x: number): string {
  if (Number.isNaN(x)) return "nan";
  if (!Number.isFinite(x)) return x > 0 ? "inf" : "-inf";
  if (x === 0) return Object.is(x, -0) ? "-0.0" : "0.0";
  const sign = x < 0 ? "-" : "";
  const [mant, expS] = Math.abs(x).toExponential().split("e");
  const exp = Number(expS);
  const digits = mant.replace(".", "");
  if (exp < -4 || exp >= 16) {
    const m = digits.length > 1 ? `${digits[0]}.${digits.slice(1)}` : digits;
    return `${sign}${m}e${exp < 0 ? "-" : "+"}${String(Math.abs(exp)).padStart(2, "0")}`;
  }
  if (exp >= 0) {
    if (digits.length <= exp + 1) return `${sign}${digits}${"0".repeat(exp + 1 - digits.length)}.0`;
    return `${sign}${digits.slice(0, exp + 1)}.${digits.slice(exp + 1)}`;
  }
  return `${sign}0.${"0".repeat(-exp - 1)}${digits}`;
}

/** round(x, d) do Python: arredonda o valor exato do float, com empates para o par. */
export function pyRound(x: number, d: number): number {
  if (x === 0 || !Number.isFinite(x) || Math.abs(x) >= 1e15) return x;
  const r = Number(x.toFixed(d));
  // toFixed desempata para cima; o Python desempata para o par. Só muda nos empates exatos.
  const long = Math.abs(x).toFixed(Math.min(100, d + 30));
  const dot = long.indexOf(".");
  const head = long.slice(0, dot + 1 + d);
  const tail = long.slice(dot + 1 + d);
  if (/^50*$/.test(tail)) {
    const digits = head.replace(".", "");
    if (Number(digits[digits.length - 1]) % 2 === 0) {
      const v = Number(head);
      return x < 0 ? -v : v;
    }
  }
  return r;
}

/** print(round(x, d)) */
export function pr(x: number, d: number): string {
  return pyRepr(pyRound(x, d));
}

/** f"{x:.1e}" (ou outra precisão) do Python: expoente com pelo menos dois dígitos. */
export function pyExp(x: number, digits = 1): string {
  if (Number.isNaN(x)) return "nan";
  if (!Number.isFinite(x)) return x > 0 ? "inf" : "-inf";
  const [m, e] = x.toExponential(digits).split("e");
  const n = Number(e);
  return `${m}e${n < 0 ? "-" : "+"}${String(Math.abs(n)).padStart(2, "0")}`;
}

/** Texto em português: vírgula decimal (para frases, não para resultados de código). */
export function pt(x: number, d: number): string {
  return pyRepr(pyRound(x, d)).replace(/\.0$/, "").replace(".", ",").replace(/^-/, "−");
}
