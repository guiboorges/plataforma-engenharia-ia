import React, { useMemo, useState } from "react";
import { Chip } from "../../ui";
import { TRAIN_X, TRAIN_Y, newPoints } from "./data";
import { Plot, num, pts } from "./Plot";
import { polyEval, polyFit, rmse } from "./poly";

// Sobreajuste (secção 3): os 15 pontos de treino e os 1000 pontos novos da aula, um polinómio de grau 1 a 14
// ajustado como o Polynomial.fit do NumPy, e os erros de treino e nos dados novos por grau (a curva em U).
// Os números são os da aula: grau 3 → 0,195 e 0,32; grau 14 → 0,0 e 21 113,44.

const DEGREES = Array.from({ length: 14 }, (_, i) => i + 1);
const PRESETS = [1, 3, 9, 14];
const NOISE = 0.3;
// eixo do erro em escala log, de 0,03 a 30 (como a figura da aula); os valores fora ficam presos à margem, com etiqueta
const LOG_LO = Math.log10(0.03);
const LOG_HI = Math.log10(30);

type Row = { g: number; train: number; test: number };

function diagnosis(r: Row): { tone: "ok" | "warn" | "bad"; label: string; text: string } {
  if (r.train > 0.3)
    return {
      tone: "warn",
      label: "Subajuste",
      text: "Demasiado simples para o padrão: erra no treino e nos dados novos (viés alto).",
    };
  if (r.test > 0.45)
    return {
      tone: "bad",
      label: "Sobreajuste",
      text: "Erra pouco no treino e muito nos dados novos: segue o ruído dos 15 pontos (variância alta).",
    };
  return {
    tone: "ok",
    label: "Bom equilíbrio",
    text: `O erro nos dados novos fica perto do ruído (${num(NOISE, 1)}), que nenhum modelo elimina.`,
  };
}

export function Overfit() {
  const [g, setG] = useState(3);
  const rows = useMemo<Row[]>(() => {
    const nw = newPoints();
    return DEGREES.map((d) => {
      const p = polyFit(TRAIN_X, TRAIN_Y, d);
      return { g: d, train: rmse(TRAIN_Y, TRAIN_X.map((x) => polyEval(p, x))), test: rmse(nw.y, nw.x.map((x) => polyEval(p, x))) };
    });
  }, []);
  const fit = useMemo(() => polyFit(TRAIN_X, TRAIN_Y, g), [g]);
  const cur = rows[g - 1];
  const best = rows.reduce((a, b) => (b.test < a.test ? b : a));
  const dx = diagnosis(cur);

  const curve: [number, number][] = [];
  const truth: [number, number][] = [];
  for (let i = 0; i <= 200; i++) {
    const x = i / 200;
    curve.push([x, Math.max(-6, Math.min(6, polyEval(fit, x)))]);
    truth.push([x, Math.sin(2 * Math.PI * x)]);
  }
  const ly = (v: number) => Math.max(LOG_LO, Math.min(LOG_HI, v > 0 ? Math.log10(v) : LOG_LO));
  const logTicks = [0.03, 0.1, 0.3, 1, 3, 10, 30].map((v) => ({ at: Math.log10(v), label: num(v, 2) }));

  return (
    <div className="m7-of">
      <label className="m7-slider">
        <span className="small muted">
          Grau do polinómio: <strong className="m7-strong mono">{g}</strong>
        </span>
        <input type="range" className="m7-range" min={1} max={14} step={1} value={g} onChange={(e) => setG(Number(e.target.value))} aria-label="Grau do polinómio" />
      </label>
      <div className="m7-pills" role="group" aria-label="Graus da aula">
        {PRESETS.map((p) => (
          <button key={p} type="button" className={`pill mono ${p === g ? "is-on" : ""}`} aria-pressed={p === g} onClick={() => setG(p)}>
            grau {p}
          </button>
        ))}
      </div>

      <div className="m7-two">
        <figure className="m7-fig">
          <Plot
            label={`Os 15 pontos de treino, o padrão verdadeiro sin(2πx) e o polinómio de grau ${g}`}
            x={[0, 1]}
            y={[-2, 2]}
            xTicks={[0, 0.2, 0.4, 0.6, 0.8, 1].map((v) => ({ at: v, label: num(v, 1) }))}
            yTicks={[-2, -1, 0, 1, 2].map((v) => ({ at: v, label: num(v, 0) }))}
            xLabel="x"
            yLabel="y"
          >
            {(sx, sy) => (
              <>
                <polyline className="m7-line is-ref" points={pts(truth, sx, sy)} />
                <polyline className="m7-line is-main" points={pts(curve, sx, sy)} />
                {TRAIN_X.map((x, i) => (
                  <circle key={i} className="m7-dot" cx={sx(x)} cy={sy(TRAIN_Y[i])} r={3.2} />
                ))}
              </>
            )}
          </Plot>
          <figcaption className="small muted">
            <span className="m7-key m7-key-dot" aria-hidden="true" /> 15 pontos de treino · <span className="m7-key m7-key-ref" aria-hidden="true" /> padrão verdadeiro ·{" "}
            <span className="m7-key m7-key-main" aria-hidden="true" /> grau {g}
          </figcaption>
        </figure>

        <figure className="m7-fig">
          <Plot
            label={`Erro (RMSE) de treino e nos dados novos por grau, em escala log. Grau ${g}: ${num(cur.train, 3)} no treino e ${num(cur.test, 2)} nos dados novos`}
            x={[0.5, 14.5]}
            y={[LOG_LO, LOG_HI]}
            xTicks={DEGREES.filter((d) => d % 2 === 1 || d === 14).map((d) => ({ at: d, label: String(d) }))}
            yTicks={logTicks}
            xLabel="grau"
            yLabel="RMSE (log)"
            overlay={(sx, sy) =>
              rows
                .filter((r) => r.test > 30)
                .map((r) => (
                  <text key={r.g} className="m7-plot-note" x={sx(r.g)} y={sy(LOG_HI) - 2} textAnchor="middle">
                    ↑
                  </text>
                ))
            }
          >
            {(sx, sy) => (
              <>
                <line className="m7-hline" x1={sx(0.5)} x2={sx(14.5)} y1={sy(Math.log10(NOISE))} y2={sy(Math.log10(NOISE))} />
                <line className="m7-vline" x1={sx(g)} x2={sx(g)} y1={sy(LOG_LO)} y2={sy(LOG_HI)} />
                <polyline className="m7-line is-s2" points={pts(rows.map((r) => [r.g, ly(r.train)]), sx, sy)} />
                <polyline className="m7-line is-main" points={pts(rows.map((r) => [r.g, ly(r.test)]), sx, sy)} />
                {rows.map((r) => (
                  <React.Fragment key={r.g}>
                    <circle className={`m7-mark is-s2 ${r.g === g ? "is-on" : ""}`} cx={sx(r.g)} cy={sy(ly(r.train))} r={r.g === g ? 4 : 2.6} />
                    <circle className={`m7-mark is-main ${r.g === g ? "is-on" : ""}`} cx={sx(r.g)} cy={sy(ly(r.test))} r={r.g === g ? 4 : 2.6} />
                  </React.Fragment>
                ))}
              </>
            )}
          </Plot>
          <figcaption className="small muted">
            <span className="m7-key m7-key-s2" aria-hidden="true" /> treino · <span className="m7-key m7-key-main" aria-hidden="true" /> dados novos ·{" "}
            <span className="m7-key m7-key-hline" aria-hidden="true" /> ruído (0,3). Nos dados novos, os graus 13 e 14 saem do gráfico (↑):{" "}
            {rows
              .filter((r) => r.test > 30)
              .map((r) => num(r.test, 2))
              .join(" e ")}
            .
          </figcaption>
        </figure>
      </div>

      <div className="widget-detail" aria-live="polite">
        <div className="row gap-sm wrap center-y">
          <Chip tone={dx.tone}>{dx.label}</Chip>
          <span className="small muted">
            Grau {g}: RMSE de <span className="mono">{num(cur.train, 3)}</span> no treino e <span className="mono">{num(cur.test, 2)}</span> nos 1000 pontos novos.
          </span>
        </div>
        <p className="small">{dx.text}</p>
        <p className="small muted">
          O erro de treino desce sempre que o grau sobe; o erro nos dados novos é mínimo no grau {best.g} ({num(best.test, 2)}) e depois sobe. Por isso escolhe-se o modelo pelo erro de
          validação, nunca pelo de treino.
        </p>
      </div>
    </div>
  );
}
