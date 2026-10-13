import React, { useState } from "react";
import { Seg } from "../../ui";
import { AGGS, groupBy, type Agg, type GroupCol, type SaleRow } from "./groupby";

// Dividir, aplicar, combinar (secção 3) sobre a tabela de vendas da aula, já limpa (18 linhas).
// O cálculo e o texto do print são os do pandas 3.0 (ver groupby.ts).

const COLS: { id: GroupCol; label: string }[] = [
  { id: "loja", label: "loja" },
  { id: "mes", label: "mes" },
  { id: "categoria", label: "categoria" },
];

const AGG_LABEL: Record<Agg, string> = {
  sum: "soma",
  mean: "média",
  count: "contagem",
  min: "mínimo",
  max: "máximo",
  median: "mediana",
};

const OTHER: Record<GroupCol, [keyof SaleRow, keyof SaleRow]> = {
  loja: ["mes", "categoria"],
  mes: ["loja", "categoria"],
  categoria: ["mes", "loja"],
};

const f1 = (v: number) => v.toFixed(1);

function how(values: number[], agg: Agg): string {
  const n = values.length;
  const sum = values.reduce((s, v) => s + v, 0);
  switch (agg) {
    case "sum":
      return values.map((v) => String(v)).join(" + ");
    case "mean":
      return `${sum} ÷ ${n}`;
    case "count":
      return `${n} linhas com valor`;
    case "min":
      return `o menor de ${n} valores`;
    case "max":
      return `o maior de ${n} valores`;
    case "median": {
      const s = [...values].sort((x, y) => x - y);
      return n % 2 ? `ordenados: ${s.join(", ")} → o do meio` : `ordenados: ${s.join(", ")} → (${s[n / 2 - 1]} + ${s[n / 2]}) ÷ 2`;
    }
  }
}

export function GroupByDemo() {
  const [col, setCol] = useState<GroupCol>("loja");
  const [agg, setAgg] = useState<Agg>("sum");
  const [round, setRound] = useState(false);
  const res = groupBy(col, agg, round);
  const [c1, c2] = OTHER[col];

  return (
    <div className="m3-gb">
      <div className="m3-gb-controls">
        <div className="m3-gb-control">
          <span className="small muted">Agrupar por</span>
          <Seg label="Coluna para agrupar" options={COLS} value={col} onChange={(id) => setCol(id as GroupCol)} />
        </div>
        <div className="m3-gb-control">
          <span className="small muted">Cálculo</span>
          <div className="m3-presets" role="group" aria-label="Cálculo a aplicar">
            {AGGS.map((a) => (
              <button key={a} type="button" className={`pill mono ${agg === a ? "is-on" : ""}`} aria-pressed={agg === a} onClick={() => setAgg(a)}>
                {a}
              </button>
            ))}
            <button
              type="button"
              className={`pill mono ${round ? "is-on" : ""}`}
              aria-pressed={round}
              onClick={() => setRound(!round)}
              title="Arredondar a uma casa decimal"
            >
              .round(1)
            </button>
          </div>
        </div>
      </div>

      <pre className="m3-pre">{`print(${res.code})`}</pre>

      <div className="m3-gb-head" aria-hidden="true">
        <span>1. Dividir por {col}</span>
        <span>2. Aplicar: {AGG_LABEL[agg]}</span>
      </div>
      <ol className="m3-gb-groups">
        {res.groups.map((g) => (
          <li key={g.key} className="m3-gb-row">
            <div className="m3-gb-split">
              <p className="m3-gb-key">
                {g.key} <span className="muted small">· {g.rows.length} linhas</span>
              </p>
              <div className="table-wrap">
                <table className="m3-tbl">
                  <thead>
                    <tr>
                      <th scope="col" />
                      <th scope="col">{c1}</th>
                      <th scope="col">{c2}</th>
                      <th scope="col" className="m3-num">
                        valor
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.rows.map((r) => (
                      <tr key={r.i}>
                        <td className="mono muted">{r.i}</td>
                        <td>{r[c1]}</td>
                        <td>{r[c2]}</td>
                        <td className="m3-num mono" title={r.filled ? "Preenchido com a mediana do Vestuário (fillna)" : undefined}>
                          {f1(r.valor)}
                          {r.filled ? "*" : ""}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="m3-gb-apply">
              <span className="m3-gb-arrow" aria-hidden="true">
                →
              </span>
              <div>
                <p className="small muted m3-gb-how">
                  {how(
                    g.rows.map((r) => r.valor),
                    agg,
                  )}
                </p>
                <p className="m3-gb-val mono">
                  {agg}: {g.shown}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ol>

      <p className="sr-only" aria-live="polite">
        {`${res.code}: ${res.groups.map((g) => `${g.key} ${g.shown}`).join(", ")}.`}
      </p>
      <div className="widget-detail">
        <p className="widget-detail-title">3. Combinar: uma Series com uma linha por grupo</p>
        <pre className="m3-pre">{res.repr}</pre>
        <p className="muted small">
          As chaves ficam no índice, ordenadas ({res.groups.map((g) => g.key).join(", ")}).
          {res.groups.some((g) => g.rows.some((r) => r.filled)) ? " * Porto, fevereiro, Vestuário é o valor em falta preenchido com 415 (a mediana do Vestuário)." : ""}
        </p>
      </div>
    </div>
  );
}
