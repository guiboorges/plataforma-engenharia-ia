import React, { useState } from "react";
import { Seg } from "../../ui";
import { seriesRepr } from "./groupby";
import { LARGO, MONTHS, groupSum, melt, pivot } from "./tidy";

// Formato largo ↔ longo (secção 4): melt e pivot sobre a tabela da aula, com cada valor ligado entre as
// duas formas. Os resultados (ordem do melt, ordenação do pivot e do groupby) são os do pandas 3.0 (ver tidy.ts).

type Mode = "melt" | "pivot";
type Key = { loja: string; mes: string };

const LONGO = melt(LARGO);
const PIV = pivot(LONGO);

export function TidyDemo() {
  const [mode, setMode] = useState<Mode>("melt");
  const [sel, setSel] = useState<Key>({ loja: "Porto", mes: "fev" });
  const [by, setBy] = useState<"mes" | "loja">("mes");
  const isSel = (loja: string, mes: string) => sel.loja === loja && sel.mes === mes;

  const wideTable = (index: string[], columns: string[], value: (loja: string, mes: string) => number, caption: string) => (
    <div className="m3-td-panel">
      <p className="small muted">{caption}</p>
      <div className="table-wrap">
        <table className="m3-tbl">
          <thead>
            <tr>
              <th scope="col">loja</th>
              {columns.map((c) => (
                <th key={c} scope="col" className="m3-num">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {index.map((l) => (
              <tr key={l}>
                <th scope="row" className="m3-td-rowhead">
                  {l}
                </th>
                {columns.map((c) => (
                  <td key={c} className="m3-num">
                    <button type="button" className={`m3-td-cell mono ${isSel(l, c) ? "is-sel" : ""}`} aria-pressed={isSel(l, c)} aria-label={`${l}, ${c}: ${value(l, c)}`} onClick={() => setSel({ loja: l, mes: c })}>
                      {value(l, c)}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const longTable = (caption: string) => (
    <div className="m3-td-panel">
      <p className="small muted">{caption}</p>
      <div className="table-wrap">
        <table className="m3-tbl">
          <thead>
            <tr>
              <th scope="col" />
              <th scope="col">loja</th>
              <th scope="col">mes</th>
              <th scope="col" className="m3-num">
                valor
              </th>
            </tr>
          </thead>
          <tbody>
            {LONGO.map((r) => (
              <tr key={r.i} className={isSel(r.loja, r.mes) ? "m3-td-hit" : ""}>
                <td className="mono muted">{r.i}</td>
                <td>{r.loja}</td>
                <td>{r.mes}</td>
                <td className="m3-num">
                  <button type="button" className={`m3-td-cell mono ${isSel(r.loja, r.mes) ? "is-sel" : ""}`} aria-pressed={isSel(r.loja, r.mes)} aria-label={`Linha ${r.i}, ${r.loja}, ${r.mes}: ${r.valor}`} onClick={() => setSel({ loja: r.loja, mes: r.mes })}>
                    {r.valor}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const wideValue = (loja: string, mes: string) => LARGO.find((r) => r.loja === loja)![mes as (typeof MONTHS)[number]];
  const pivValue = (loja: string, mes: string) => PIV.values[PIV.index.indexOf(loja)][PIV.columns.indexOf(mes)];
  const sums = groupSum(LONGO, by, true);

  return (
    <div className="m3-td">
      <Seg
        label="Direção"
        options={[
          { id: "melt", label: "Largo → longo (melt)" },
          { id: "pivot", label: "Longo → largo (pivot)" },
        ]}
        value={mode}
        onChange={(id) => setMode(id as Mode)}
      />
      <pre className="m3-pre">
        {mode === "melt"
          ? 'longo = largo.melt(id_vars="loja", var_name="mes", value_name="valor")'
          : 'longo.pivot(index="loja", columns="mes", values="valor")'}
      </pre>
      <div className="m3-td-cols">
        {mode === "melt" ? (
          <>
            {wideTable(
              LARGO.map((r) => r.loja),
              [...MONTHS],
              wideValue,
              "largo · (3, 4): \"mês\" espalhado por três colunas",
            )}
            <span className="m3-td-arrow" aria-hidden="true">
              →
            </span>
            {longTable("longo · (9, 3): uma linha por loja e mês")}
          </>
        ) : (
          <>
            {longTable("longo · (9, 3)")}
            <span className="m3-td-arrow" aria-hidden="true">
              →
            </span>
            {wideTable(PIV.index, PIV.columns, pivValue, "resultado do pivot · (3, 3), índice loja")}
          </>
        )}
      </div>
      <p className="widget-detail small" aria-live="polite">
        {mode === "melt" ? (
          <>
            A célula <strong>{sel.loja}</strong> × <strong>{sel.mes}</strong> passa a ser a linha {LONGO.find((r) => isSel(r.loja, r.mes))!.i} do formato longo: o nome da coluna
            vira um valor da coluna <code>mes</code>. O <code>melt</code> empilha as colunas pela ordem em que aparecem: primeiro todo o jan, depois fev, depois mar.
          </>
        ) : (
          <>
            O <code>pivot</code> faz o caminho inverso e ordena as linhas e as colunas por ordem alfabética: fev aparece antes de jan, e Faro antes de Lisboa. Na
            secção 6, <code>tabela[["jan", "fev", "mar"]]</code> repõe a ordem dos meses.
          </>
        )}
      </p>
      <div className="m3-td-gb">
        <div className="row gap-sm wrap center-y">
          <span className="small muted">No formato longo, o total é o mesmo groupby com outra coluna:</span>
          <Seg
            label="Agrupar por"
            options={[
              { id: "mes", label: "por mês" },
              { id: "loja", label: "por loja" },
            ]}
            value={by}
            onChange={(id) => setBy(id as "mes" | "loja")}
          />
        </div>
        <pre className="m3-pre">
          {`print(longo.groupby("${by}")["valor"].sum())\n`}
          {seriesRepr(
            by,
            sums.map((s) => s.key),
            sums.map((s) => String(s.value)),
            "valor",
            "int64",
          )}
        </pre>
        {by === "mes" && <p className="muted small">O groupby também ordena as chaves (fev, jan, mar). Com <code>sort=False</code> fica a ordem em que aparecem, como no exercício 8.</p>}
      </div>
    </div>
  );
}
