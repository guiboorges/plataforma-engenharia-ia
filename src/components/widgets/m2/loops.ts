// Lógica do passo-a-passo de ciclos e compreensões (M2, secção 4).
// Cada exemplo é código da aula; cada passo diz que linha correu, como ficam as variáveis
// (no formato do repr do Python) e o que já foi impresso. Os valores decimais usam a mesma
// aritmética IEEE 754 do Python, com repr() e round() iguais aos do Python.
// Sem dependências: testado contra o Python real (sys.settrace) com `node`.

export type Step = {
  /** linha que acabou de correr (0 = primeira linha do código) */
  line: number;
  /** variáveis visíveis depois dessa linha, pela ordem em que foram criadas: [nome, repr] */
  vars: [string, string][];
  /** explicação curta do passo */
  note: string;
  /** tudo o que foi impresso até aqui */
  out: string;
};

export type LoopExample = { id: string; label: string; code: string[]; steps: Step[] };

// ---------------------------------------------------------------- repr e round como no Python

/** repr() de um float do Python (o mesmo "mais curto que volta ao mesmo número" do JavaScript). */
export function pyFloat(x: number): string {
  if (Object.is(x, -0)) return "-0.0";
  if (Number.isInteger(x) && Math.abs(x) < 1e16) return x.toFixed(1);
  const ax = Math.abs(x);
  if (ax >= 1e16 || ax < 1e-4) return x.toExponential().replace(/e([+-])(\d)$/, "e$10$2");
  return String(x);
}

function exactParts(x: number): { neg: boolean; mant: bigint; exp: number } {
  const dv = new DataView(new ArrayBuffer(8));
  dv.setFloat64(0, x);
  const hi = dv.getUint32(0);
  const lo = dv.getUint32(4);
  const e = (hi >>> 20) & 0x7ff;
  let mant = (BigInt(hi & 0xfffff) << BigInt(32)) | BigInt(lo);
  let exp = -1074;
  if (e !== 0) {
    mant |= BigInt(1) << BigInt(52);
    exp = e - 1075;
  }
  return { neg: hi >>> 31 === 1, mant, exp };
}

/** round(x, n) do Python: arredonda o valor binário exato, com empates para o par. */
export function pyRound(x: number, n: number): number {
  if (!Number.isFinite(x) || x === 0) return x;
  const { neg, mant, exp } = exactParts(x);
  let num = mant * BigInt(10) ** BigInt(n);
  let den = BigInt(1);
  if (exp >= 0) num <<= BigInt(exp);
  else den <<= BigInt(-exp);
  let q = num / den;
  const r = num % den;
  const two = BigInt(2);
  if (two * r > den || (two * r === den && q % two === BigInt(1))) q += BigInt(1);
  const s = q.toString().padStart(n + 1, "0");
  const txt = n > 0 ? `${s.slice(0, s.length - n)}.${s.slice(s.length - n)}` : s;
  return (neg ? -1 : 1) * parseFloat(txt);
}

const pyStr = (s: string) => `'${s}'`;
const listRepr = (xs: string[]) => `[${xs.join(", ")}]`;
const dictRepr = (kv: [string, string][]) => `{${kv.map(([k, v]) => `${k}: ${v}`).join(", ")}}`;

// ---------------------------------------------------------------- exemplos

/** Ajuda a construir os passos: guarda as variáveis pela ordem de criação. */
function recorder() {
  const vars = new Map<string, string>();
  const steps: Step[] = [];
  let out = "";
  return {
    set(name: string, repr: string) {
      vars.set(name, repr);
    },
    del(name: string) {
      vars.delete(name);
    },
    print(text: string) {
      out += text + "\n";
    },
    step(line: number, note: string) {
      steps.push({ line, vars: [...vars.entries()], note, out });
    },
    steps,
  };
}

function exContinue(): LoopExample {
  const code = [
    "vendas = [120, 80, 0, 200, 45]",
    "total = 0",
    "for v in vendas:",
    "    if v == 0:",
    "        continue          # salta para o elemento seguinte",
    "    total += v",
    "print(total)              # 445",
  ];
  const vendas = [120, 80, 0, 200, 45];
  const r = recorder();
  r.set("vendas", listRepr(vendas.map(String)));
  r.step(0, "Cria a lista com as vendas.");
  let total = 0;
  r.set("total", String(total));
  r.step(1, "O total começa em 0.");
  vendas.forEach((v, i) => {
    r.set("v", String(v));
    r.step(2, i === 0 ? `Primeira volta: v recebe o primeiro elemento da lista, ${v}.` : `Volta ${i + 1}: v recebe o elemento seguinte da lista, ${v}.`);
    r.step(3, `v == 0 é ${v === 0 ? "True" : "False"}.`);
    if (v === 0) {
      r.step(4, "continue: salta o resto do bloco e volta ao for, sem somar.");
    } else {
      total += v;
      r.set("total", String(total));
      r.step(5, `total += v: o total passa a ${total}.`);
    }
  });
  r.step(2, "Já não há elementos: o ciclo termina. O v fica com o último valor.");
  r.print(String(total));
  r.step(6, `Imprime o total: ${total}.`);
  return { id: "for", label: "for com continue", code, steps: r.steps };
}

function exWhile(): LoopExample {
  const code = ["saldo = 100", "meses = 0", "while saldo < 200:", "    saldo *= 1.10", "    meses += 1", "print(meses, round(saldo, 2))   # 8 214.36"];
  const r = recorder();
  let saldo = 100;
  let isFloat = false;
  const rep = () => (isFloat ? pyFloat(saldo) : String(saldo));
  let meses = 0;
  r.set("saldo", rep());
  r.step(0, "O saldo começa em 100 (um int).");
  r.set("meses", String(meses));
  r.step(1, "Ainda não passou nenhum mês.");
  while (saldo < 200) {
    r.step(2, `saldo < 200 é True (${rep()} < 200): entra no bloco.`);
    saldo *= 1.1;
    isFloat = true;
    r.set("saldo", rep());
    r.step(3, meses === 0 ? `saldo *= 1.10: passa a float, ${rep()}. Os dígitos a mais no fim vêm da representação em binário (secção 2).` : `saldo *= 1.10: ${rep()}.`);
    meses += 1;
    r.set("meses", String(meses));
    r.step(4, `meses += 1: ${meses}.`);
  }
  r.step(2, `saldo < 200 é False (${rep()}): o ciclo termina.`);
  const out = `${meses} ${pyFloat(pyRound(saldo, 2))}`;
  r.print(out);
  r.step(5, `Imprime os meses e o saldo arredondado a 2 casas: ${out}.`);
  return { id: "while", label: "while", code, steps: r.steps };
}

function exSquares(): LoopExample {
  const code = ["quadrados = [x ** 2 for x in range(6)]", "print(quadrados)                               # [0, 1, 4, 9, 16, 25]"];
  const r = recorder();
  const acc: string[] = [];
  for (let x = 0; x < 6; x++) {
    r.set("x", String(x));
    acc.push(String(x ** 2));
    r.set("(lista em construção)", listRepr(acc));
    r.step(0, `x = ${x}: x ** 2 = ${x ** 2}, que se junta à lista.`);
  }
  r.del("x");
  r.del("(lista em construção)");
  r.set("quadrados", listRepr(acc));
  r.step(0, "range(6) acabou no 5. A lista fica com o nome quadrados; o x só existia dentro da compreensão.");
  r.print(listRepr(acc));
  r.step(1, "Imprime a lista.");
  return { id: "squares", label: "compreensão", code, steps: r.steps };
}

function exEvens(): LoopExample {
  const code = ["pares = [x for x in range(10) if x % 2 == 0]", "print(pares)                                   # [0, 2, 4, 6, 8]"];
  const r = recorder();
  const acc: string[] = [];
  for (let x = 0; x < 10; x++) {
    r.set("x", String(x));
    const keep = x % 2 === 0;
    if (keep) acc.push(String(x));
    r.set("(lista em construção)", listRepr(acc));
    r.step(0, `x = ${x}: x % 2 == 0 é ${keep ? "True, guarda-se" : "False, fica de fora"}.`);
  }
  r.del("x");
  r.del("(lista em construção)");
  r.set("pares", listRepr(acc));
  r.step(0, "range(10) acabou no 9. Só ficaram os números que passaram no if.");
  r.print(listRepr(acc));
  r.step(1, "Imprime a lista.");
  return { id: "evens", label: "compreensão com if", code, steps: r.steps };
}

function exDict(): LoopExample {
  const code = [
    'precos = {"bola": 12.5, "luva": 25.0, "boné": 15.0}',
    "com_iva = {nome: round(p * 1.23, 2) for nome, p in precos.items()}",
    "print(com_iva)                     # {'bola': 15.38, 'luva': 30.75, 'boné': 18.45}",
  ];
  const precos: [string, number][] = [
    ["bola", 12.5],
    ["luva", 25.0],
    ["boné", 15.0],
  ];
  const r = recorder();
  r.set("precos", dictRepr(precos.map(([k, v]) => [pyStr(k), pyFloat(v)])));
  r.step(0, "Cria o dicionário nome → preço.");
  const acc: [string, string][] = [];
  for (const [nome, p] of precos) {
    r.set("nome", pyStr(nome));
    r.set("p", pyFloat(p));
    const v = pyFloat(pyRound(p * 1.23, 2));
    acc.push([pyStr(nome), v]);
    r.set("(dicionário em construção)", dictRepr(acc));
    r.step(1, `items() dá o par (${pyStr(nome)}, ${pyFloat(p)}): round(p * 1.23, 2) = ${v}.`);
  }
  r.del("nome");
  r.del("p");
  r.del("(dicionário em construção)");
  r.set("com_iva", dictRepr(acc));
  r.step(1, "Acabaram os pares. O dicionário novo fica com o nome com_iva, pela mesma ordem das chaves.");
  r.print(dictRepr(acc));
  r.step(2, "Imprime o dicionário.");
  return { id: "dict", label: "compreensão de dicionário", code, steps: r.steps };
}

export const LOOP_EXAMPLES: LoopExample[] = [exContinue(), exWhile(), exSquares(), exEvens(), exDict()];
