import React, { useMemo, useState } from "react";
import { Seg, Checkbox } from "../../ui";
import { consecutiveGroups, splitScheme, TITANIC_40, type Fold, type Scheme } from "./cv";

// Esquemas de validação (secção 3): que linhas ficam no treino e no teste em cada divisão, com os mesmos
// índices do scikit-learn 1.9 para o mesmo n, k e random_state. As linhas são os primeiros n passageiros do
// Titanic da aula (para ver a estratificação de `survived`), lidos como se estivessem por ordem de tempo.

const SCHEMES: { id: Scheme; label: string }[] = [
  { id: "kfold", label: "KFold" },
  { id: "stratified", label: "StratifiedKFold" },
  { id: "group", label: "GroupKFold" },
  { id: "time", label: "TimeSeriesSplit" },
];

const NS = [12, 20, 30, 40];

const NOTES: Record<Scheme, string> = {
  kfold:
    "Serve quando as linhas são independentes. Com shuffle=True as linhas são sorteadas antes de cortar em k partes; sem baralhar, cada parte é um bloco seguido, o que só é seguro se a ordem dos dados não quiser dizer nada.",
  stratified:
    "Como o KFold, mas cada parte de teste fica com a mesma proporção de cada classe (aqui, de sobreviventes). É o cv da aula: StratifiedKFold(5, shuffle=True, random_state=0). Compare a coluna da direita com a do KFold.",
  group:
    "Cada grupo (as horas do mesmo dia, as compras do mesmo cliente, as fotografias do mesmo doente) fica inteiro de um só lado. Os grupos maiores são distribuídos primeiro, cada um para a divisão com menos linhas. É o que se usou no M9 e no Bikeshare por dia.",
  time:
    "Quando o modelo vai prever o futuro: treina-se sempre no passado e testa-se no período seguinte. As primeiras linhas nunca são teste e o treino cresce de divisão para divisão; no Bikeshare foi esta a validação que deu 55 em vez de 31.",
};

function code(s: Scheme, k: number, shuffle: boolean, seed: number): string {
  if (s === "kfold") return shuffle ? `KFold(${k}, shuffle=True, random_state=${seed})` : `KFold(${k})`;
  if (s === "stratified") return shuffle ? `StratifiedKFold(${k}, shuffle=True, random_state=${seed})` : `StratifiedKFold(${k})`;
  if (s === "group") return `GroupKFold(${k})`;
  return `TimeSeriesSplit(${k})`;
}

export function CvSchemes() {
  const [scheme, setScheme] = useState<Scheme>("kfold");
  const [n, setN] = useState(40);
  const [k, setK] = useState(5);
  const [shuffle, setShuffle] = useState(true);
  const [seed, setSeed] = useState(0);
  const [groupSize, setGroupSize] = useState(4);
  const y = TITANIC_40.slice(0, n);

  const result = useMemo((): { folds: Fold[] } | { error: string } => {
    try {
      return { folds: splitScheme(scheme, { n, k, shuffle, seed, groupSize, y: TITANIC_40 }) };
    } catch (e) {
      return { error: (e as Error).message };
    }
  }, [scheme, n, k, shuffle, seed, groupSize]);

  const groups = consecutiveGroups(n, groupSize);
  const groupSpans: number[] = [];
  for (let i = 0; i < n; i++) if (i === 0 || groups[i] !== groups[i - 1]) groupSpans.push(1);
  else groupSpans[groupSpans.length - 1]++;

  const cols = { gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` };
  const shuffles = scheme === "kfold" || scheme === "stratified";
  const base = y.reduce((a, b) => a + b, 0);

  return (
    <div className="m11-cv">
      <Seg options={SCHEMES} value={scheme} onChange={(v) => setScheme(v as Scheme)} label="Esquema de validação" scroll />

      <div className="m11-controls">
        <div className="m11-ctl">
          <span className="small muted" id="m11-cv-n">Linhas (n)</span>
          <div className="m11-pills" role="group" aria-labelledby="m11-cv-n">
            {NS.map((v) => (
              <button key={v} type="button" className={`pill mono ${n === v ? "is-on" : ""}`} aria-pressed={n === v} onClick={() => setN(v)}>
                {v}
              </button>
            ))}
          </div>
        </div>
        <label className="m11-ctl">
          <span className="small muted">
            Divisões (k): <span className="mono">{k}</span>
          </span>
          <input type="range" min={2} max={10} step={1} value={k} onChange={(e) => setK(Number(e.target.value))} aria-label="Número de divisões" />
        </label>
        {shuffles && (
          <div className="m11-ctl">
            <Checkbox id="m11-cv-shuffle" checked={shuffle} onChange={setShuffle} label="shuffle=True" />
            {shuffle && (
              <label className="m11-inline small muted">
                random_state
                <input
                  className="input input-sm mono m11-seed"
                  type="number"
                  min={0}
                  max={9999}
                  value={seed}
                  onChange={(e) => setSeed(Math.max(0, Math.min(9999, Math.floor(Number(e.target.value) || 0))))}
                />
              </label>
            )}
          </div>
        )}
        {scheme === "group" && (
          <label className="m11-ctl">
            <span className="small muted">
              Linhas por grupo (por exemplo, horas por dia): <span className="mono">{groupSize}</span>
            </span>
            <input type="range" min={2} max={6} step={1} value={groupSize} onChange={(e) => setGroupSize(Number(e.target.value))} aria-label="Linhas por grupo" />
          </label>
        )}
      </div>

      <code className="m11-code mono small">{code(scheme, k, shuffle, seed)}</code>

      {"error" in result ? (
        <p className="widget-detail small">O scikit-learn também recusa esta combinação: {result.error}</p>
      ) : (
        <div className="m11-strip-wrap">
          <div className="m11-strip" role="table" aria-label={`Divisões de ${code(scheme, k, shuffle, seed)} com ${n} linhas`}>
            <div className="m11-strip-row" role="row">
              <span className="m11-strip-lab small muted" role="rowheader">
                <span className="m11-wide">{scheme === "group" ? "grupo" : "sobreviveu"}</span>
                <span className="m11-narrow mono">{scheme === "group" ? "g" : "y"}</span>
              </span>
              {scheme === "group" ? (
                <div className="m11-cells" style={cols} role="cell" aria-label={`${groupSpans.length} grupos de ${groupSize} linhas seguidas`}>
                  {groupSpans.map((s, gi) => (
                    <span key={gi} className={`m11-group ${gi % 2 ? "is-odd" : ""}`} style={{ gridColumn: `span ${s}` }} />
                  ))}
                </div>
              ) : (
                <div className="m11-cells" style={cols} role="cell" aria-label={`${base} de ${n} sobreviveram`}>
                  {y.map((v, i) => (
                    <span key={i} className={`m11-lab ${v ? "is-one" : ""}`} />
                  ))}
                </div>
              )}
              <span className="m11-strip-sum small muted mono" role="cell">
                {scheme === "group" ? "" : `${base}/${n}`}
              </span>
            </div>
            {result.folds.map((f, fi) => {
              const inTest = new Set(f.test);
              const inTrain = new Set(f.train);
              const ones = f.test.reduce((a, i) => a + y[i], 0);
              return (
                <div key={fi} className="m11-strip-row" role="row">
                  <span className="m11-strip-lab small muted" role="rowheader">
                    <span className="m11-wide">divisão </span>
                    {fi + 1}
                  </span>
                  <div
                    className="m11-cells"
                    style={cols}
                    role="cell"
                    aria-label={`treino: ${f.train.length} linhas; teste: linhas ${f.test.map((i) => i + 1).join(", ")}`}
                  >
                    {Array.from({ length: n }, (_, i) => (
                      <span key={i} className={`m11-cell ${inTest.has(i) ? "is-test" : inTrain.has(i) ? "is-train" : "is-off"}`} />
                    ))}
                  </div>
                  <span className="m11-strip-sum small muted mono" role="cell" title={scheme === "group" ? "Linhas no teste" : "Sobreviventes no teste"}>
                    {scheme === "group" ? f.test.length : `${ones}/${f.test.length}`}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="small muted m11-legend">
            <span className="m11-key is-train" aria-hidden="true" /> treino · <span className="m11-key is-test" aria-hidden="true" /> teste ·{" "}
            <span className="m11-key is-off" aria-hidden="true" /> não usado ·{" "}
            {scheme === "group" ? (
              <>a primeira linha mostra os grupos, por ordem; à direita, linhas no teste de cada divisão</>
            ) : (
              <>
                <span className="m11-key is-one" aria-hidden="true" /> sobreviveu; à direita, sobreviventes no teste de cada divisão
              </>
            )}
            . Linhas por ordem de tempo, da esquerda para a direita.
          </p>
        </div>
      )}

      <div className="widget-detail">
        <span className="widget-detail-title">{SCHEMES.find((s) => s.id === scheme)!.label}</span>
        <span>{NOTES[scheme]}</span>
      </div>
    </div>
  );
}
