// Números à portuguesa para os widgets do M11: vírgula decimal, espaço fino nos milhares.

export function fmt(x: number, digits = 0): string {
  const s = Math.abs(x).toFixed(digits);
  const [int, dec] = s.split(".");
  const intSp = int.length > 4 ? int.replace(/\B(?=(\d{3})+(?!\d))/g, " ") : int;
  const neg = x < 0 && Number(s) !== 0;
  return `${neg ? "−" : ""}${intSp}${dec ? "," + dec : ""}`;
}

/** Com sinal explícito: +3,3 ou −76,9. */
export const fmtSigned = (x: number, digits = 1) => (x > 0 && Number(Math.abs(x).toFixed(digits)) !== 0 ? "+" : "") + fmt(x, digits);

/** 0,162 → "16,2%". */
export const pct = (x: number, digits = 1) => `${fmt(x * 100, digits)}%`;
