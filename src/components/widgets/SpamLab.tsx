import React, { useMemo, useState } from "react";
import { DEFAULT_RULE_WORDS, TEST_MESSAGES, TRAIN_MESSAGES, explainNB, fitNB, ruleSpam } from "../../lib/nb";
import { useMod } from "../../lib/store";
import { Icon } from "../ui";

// Laboratório da secção 4: regras escritas à mão contra Naive Bayes, com o mesmo cálculo do scikit-learn.

const PRESETS = [
  ...TEST_MESSAGES.map((t) => t.text),
  "prémio grátis para si",
  "oferta de jantar no sábado",
  "dinheiro da fatura",
  "olá tudo bem",
];

const fmtP = (p: number) => p.toFixed(2);
const pct = (p: number) => `${Math.round(p * 100)}%`;

export function SpamLab({ moduleId }: { moduleId: string }) {
  const [mod, setMod] = useMod(moduleId);
  const extra = mod.lab?.extra ?? [];
  const rules = mod.lab?.rules ?? DEFAULT_RULE_WORDS;
  const [text, setText] = useState(PRESETS[2]);
  const [newRule, setNewRule] = useState("");
  const [newEx, setNewEx] = useState("");
  const [newLabel, setNewLabel] = useState<0 | 1>(0);
  const [showData, setShowData] = useState(false);

  const train = useMemo(() => [...TRAIN_MESSAGES, ...extra], [extra]);
  const model = useMemo(() => fitNB(train.map((t) => t.text), train.map((t) => t.label)), [train]);
  const nb = explainNB(model, text);
  const rule = ruleSpam(text, rules);
  const maxW = Math.max(0.5, ...nb.known.map((k) => Math.abs(k.weight)));

  const saveLab = (next: { extra?: typeof extra; rules?: string[] }) =>
    setMod((m) => {
      m.lab = { extra: next.extra ?? extra, rules: next.rules ?? rules };
    });

  const verdict = (spam: boolean) => (
    <span className={`verdict ${spam ? "is-spam" : "is-ok"}`}>{spam ? "spam" : "normal"}</span>
  );

  return (
    <div className="lab">
      <div className="field">
        <label htmlFor={`lab-text-${moduleId}`}>Mensagem a classificar</label>
        <input
          id={`lab-text-${moduleId}`}
          className="input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escreva uma mensagem"
        />
      </div>
      <div className="lab-presets" role="group" aria-label="Mensagens de exemplo">
        {PRESETS.map((p) => (
          <button key={p} type="button" className={`pill ${p === text ? "is-on" : ""}`} onClick={() => setText(p)}>
            {p}
          </button>
        ))}
      </div>

      <div className="lab-cols">
        <section className="lab-card" aria-label="Abordagem 1: regras">
          <header className="lab-card-head">
            <p className="lab-card-title">Abordagem 1 · regras</p>
            {verdict(rule.spam)}
          </header>
          <p className="muted small">
            {rule.spam ? (
              <>
                Encontrou {rule.hits.map((h, i) => (
                  <React.Fragment key={h}>
                    {i > 0 && ", "}
                    <code>{h}</code>
                  </React.Fragment>
                ))}
                .
              </>
            ) : (
              "Nenhuma palavra suspeita encontrada."
            )}
          </p>
          <p className="lab-sub mono">palavras_suspeitas</p>
          <div className="lab-rules">
            {rules.map((w) => (
              <span key={w} className="tag">
                <code>{w}</code>
                <button type="button" aria-label={`Remover ${w}`} onClick={() => saveLab({ rules: rules.filter((x) => x !== w) })}>
                  <Icon name="x" size={12} />
                </button>
              </span>
            ))}
          </div>
          <form
            className="lab-form"
            onSubmit={(e) => {
              e.preventDefault();
              const w = newRule.trim().toLowerCase();
              if (w && !rules.includes(w)) saveLab({ rules: [...rules, w] });
              setNewRule("");
            }}
          >
            <input
              id={`lab-rule-${moduleId}`}
              className="input input-sm lab-grow"
              value={newRule}
              onChange={(e) => setNewRule(e.target.value)}
              placeholder="nova palavra"
              aria-label="Nova palavra suspeita"
            />
            <button type="submit" className="btn btn-secondary btn-sm">
              Acrescentar
            </button>
            {rules.join() !== DEFAULT_RULE_WORDS.join() && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => saveLab({ rules: DEFAULT_RULE_WORDS })}>
                Repor
              </button>
            )}
          </form>
        </section>

        <section className="lab-card" aria-label="Abordagem 2: Naive Bayes">
          <header className="lab-card-head">
            <p className="lab-card-title">Abordagem 2 · Naive Bayes</p>
            {verdict(nb.label === 1)}
          </header>
          <div className="lab-proba" aria-label={`Probabilidade de spam ${pct(nb.proba[1])}`}>
            <div className="lab-proba-bar">
              <span className="lab-proba-normal" style={{ width: pct(nb.proba[0]) }} />
              <span className="lab-proba-spam" style={{ width: pct(nb.proba[1]) }} />
            </div>
            <div className="lab-proba-legend">
              <span>normal {pct(nb.proba[0])}</span>
              <code>
                predict_proba → [{fmtP(nb.proba[0])} {fmtP(nb.proba[1])}]
              </code>
              <span>spam {pct(nb.proba[1])}</span>
            </div>
          </div>
          {nb.known.length > 0 ? (
            <ul className="lab-weights">
              {nb.known.map((k) => (
                <li key={k.word}>
                  <code className="lab-w-word">{k.word}</code>
                  <span className="lab-w-track" aria-hidden="true">
                    <span
                      className={`lab-w-fill ${k.weight > 0 ? "is-spam" : "is-normal"}`}
                      style={{ width: `${(Math.abs(k.weight) / maxW) * 50}%`, [k.weight > 0 ? "left" : "right"]: "50%" } as React.CSSProperties}
                    />
                  </span>
                  <span className="lab-w-count">
                    {k.inSpam}× spam · {k.inNormal}× normal
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted small">Nenhuma palavra conhecida: o modelo só tem a proporção de cada classe no treino.</p>
          )}
          {nb.unknown.length > 0 && (
            <p className="muted small">
              Ignoradas (fora do vocabulário): {nb.unknown.map((w) => <code key={w}>{w} </code>)}
            </p>
          )}
          <p className="muted small">
            Vocabulário: {model.vocab.length} palavras · {train.length} exemplos ({train.filter((t) => t.label === 1).length} spam, {train.filter((t) => t.label === 0).length} normais)
          </p>
        </section>
      </div>

      <div className="lab-table">
        <p className="lab-card-title">As quatro mensagens da aula</p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">Mensagem</th>
                <th scope="col">Certo</th>
                <th scope="col">Regras</th>
                <th scope="col">Modelo</th>
              </tr>
            </thead>
            <tbody>
              {TEST_MESSAGES.map((t) => {
                const r = ruleSpam(t.text, rules).spam ? 1 : 0;
                const m = explainNB(model, t.text).label;
                const cell = (p: number) => {
                  const ok = p === t.label;
                  const tag = ok ? "" : p === 1 ? "falso positivo" : "falso negativo";
                  return (
                    <td className={ok ? "lab-ok" : "lab-bad"}>
                      <Icon name={ok ? "check" : "x"} size={14} /> {p === 1 ? "spam" : "normal"}
                      {tag && <span className="small"> · {tag}</span>}
                    </td>
                  );
                };
                return (
                  <tr key={t.text}>
                    <td>
                      <button type="button" className="link-btn" onClick={() => setText(t.text)}>
                        {t.text}
                      </button>
                    </td>
                    <td>{t.label ? "spam" : "normal"}</td>
                    {cell(r)}
                    {cell(m)}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="lab-data">
        <button type="button" className="link-btn lab-toggle" aria-expanded={showData} onClick={() => setShowData(!showData)}>
          <Icon name={showData ? "down" : "right"} size={14} /> Dados de treino ({train.length}) e novos exemplos
        </button>
        {showData && (
          <div className="lab-data-body">
            <ul className="lab-train">
              {train.map((t, i) => (
                <li key={i} className="row-item">
                  <span className={`verdict mono ${t.label ? "is-spam" : "is-ok"}`}>{t.label ? "1" : "0"}</span>
                  <span className="lab-train-text">{t.text}</span>
                  {i >= TRAIN_MESSAGES.length && (
                    <button
                      type="button"
                      className="icon-btn"
                      aria-label="Remover exemplo"
                      onClick={() => saveLab({ extra: extra.filter((_, k) => k !== i - TRAIN_MESSAGES.length) })}
                    >
                      <Icon name="trash" size={14} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
            <form
              className="lab-form"
              onSubmit={(e) => {
                e.preventDefault();
                if (!newEx.trim()) return;
                saveLab({ extra: [...extra, { text: newEx.trim(), label: newLabel }] });
                setNewEx("");
              }}
            >
              <input
                id={`lab-ex-${moduleId}`}
                className="input lab-grow-wide"
                value={newEx}
                onChange={(e) => setNewEx(e.target.value)}
                placeholder="Novo exemplo de treino"
                aria-label="Novo exemplo de treino"
              />
              <select
                id={`lab-label-${moduleId}`}
                className="input input-sm"
                value={newLabel}
                onChange={(e) => setNewLabel(Number(e.target.value) as 0 | 1)}
                aria-label="Rótulo"
              >
                <option value={0}>0 · normal</option>
                <option value={1}>1 · spam</option>
              </select>
              <button type="submit" className="btn btn-secondary btn-sm">
                Treinar com este exemplo
              </button>
              {extra.length > 0 && (
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => saveLab({ extra: [] })}>
                  Voltar aos 8 exemplos
                </button>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
