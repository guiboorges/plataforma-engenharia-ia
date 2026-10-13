import React, { useState } from "react";
import type { ClassifyExercise, Exercise, ModuleContent, OrderExercise, TextExercise } from "../../content/types";
import type { ExState } from "../../lib/store";
import { rng, shuffle } from "../../lib/exam";
import { renderInline, Markdown, type InlineCtx } from "../../lib/md";
import { exerciseFeedbackPrompt } from "../../lib/tutor";
import { sampleErrorText } from "../../lib/claude";
import { Blocks, type BlocksCtx } from "../Blocks";
import { Button, Checkbox, Chip, Icon } from "../ui";
import { reportSampleError, useSample } from "../Tutor";

type Props = {
  c: ModuleContent;
  ex: Exercise;
  st: ExState | undefined;
  setSt: (recipe: (s: ExState) => void) => void;
  ctx: BlocksCtx;
  onOpenSolution: () => void;
};

export function exerciseStatus(ex: Exercise, st: ExState | undefined): { label: string; tone: "neutral" | "ok" | "warn" | "accent" } {
  if (!st?.submittedAt) {
    const started = st && Object.values(st.answers ?? {}).some((v) => (Array.isArray(v) ? v.length : v !== "" && v !== undefined));
    return started ? { label: "Em curso", tone: "accent" } : { label: "Por fazer", tone: "neutral" };
  }
  if (st.auto) return { label: `${st.auto.correct}/${st.auto.total} certos`, tone: st.auto.correct === st.auto.total ? "ok" : "warn" };
  if (ex.kind === "text") {
    const met = Object.values(st.criteria ?? {}).filter(Boolean).length;
    if (st.criteria && Object.keys(st.criteria).length) return { label: `${met}/${ex.criteria.length} critérios`, tone: met === ex.criteria.length ? "ok" : "warn" };
  }
  return { label: "Entregue", tone: "ok" };
}

export function ExerciseCard({ c, ex, st, setSt, ctx, onOpenSolution }: Props) {
  const submitted = !!st?.submittedAt;
  const answers = st?.answers ?? {};
  const status = exerciseStatus(ex, st);
  const setAnswer = (k: string, v: any) =>
    setSt((s) => {
      s.answers = { ...(s.answers ?? {}), [k]: v };
    });

  const submit = () => {
    setSt((s) => {
      s.submittedAt = Date.now();
      if (ex.kind === "classify") {
        const correct = ex.items.filter((it) => s.answers?.[it.id] === it.answer).length;
        s.auto = { correct, total: ex.items.length };
      } else if (ex.kind === "order") {
        const order: string[] = s.answers?.order ?? initialOrder(ex);
        s.answers = { ...(s.answers ?? {}), order };
        const correct = order.filter((id, i) => ex.items[i].id === id).length;
        s.auto = { correct, total: ex.items.length };
      }
    });
  };

  const reset = () =>
    setSt((s) => {
      delete s.submittedAt;
      delete s.auto;
      delete s.criteria;
      delete s.tutor;
    });

  const canSubmit =
    ex.kind === "classify"
      ? ex.items.every((it) => typeof answers[it.id] === "number")
      : ex.kind === "order"
        ? true
        : ex.fields.some((f) => String(answers[f.id] ?? "").trim().length > 0);

  return (
    <article className="card ex-card" id={`ex-${ex.id}`}>
      <header className="ex-head">
        <div className="ex-head-text">
          <p className="eyebrow">
            Exercício {ex.num} · ~{ex.minutes} min
          </p>
          <h3 className="ex-title">{ex.title}</h3>
        </div>
        <Chip tone={status.tone}>{status.label}</Chip>
      </header>
      <div className="ex-prompt prose">
        <Blocks blocks={ex.prompt} ctx={ctx} />
      </div>

      {ex.kind === "classify" && <ClassifyInput ex={ex} answers={answers} setAnswer={setAnswer} submitted={submitted} ctx={ctx} />}
      {ex.kind === "order" && <OrderInput ex={ex} answers={answers} setAnswer={setAnswer} submitted={submitted} />}
      {ex.kind === "text" && <TextInput ex={ex} answers={answers} setAnswer={setAnswer} submitted={submitted} />}

      {!submitted ? (
        <div className="ex-actions">
          <Button variant="primary" icon="check" onClick={submit} disabled={!canSubmit}>
            Entregar tentativa
          </Button>
          {!canSubmit && <span className="ex-hint">{ex.kind === "classify" ? "Classifique todos os itens para entregar." : "Escreva a sua resposta para entregar."}</span>}
        </div>
      ) : (
        <div className="ex-after">
          {ex.kind === "text" && <SelfCheck ex={ex} st={st!} setSt={setSt} />}
          {ex.kind !== "text" && st?.auto && (
            <p className={`ex-score ${st.auto.correct === st.auto.total ? "is-ok" : "is-warn"}`}>
              <Icon name={st.auto.correct === st.auto.total ? "check" : "info"} size={15} />
              {st.auto.correct === st.auto.total ? "Tudo certo." : `${st.auto.correct} de ${st.auto.total} certos. Veja as explicações acima e o gabarito.`}
            </p>
          )}
          <div className="ex-actions">
            <Button variant="secondary" icon="eye" onClick={onOpenSolution}>
              Ver no gabarito
            </Button>
            <Button variant="ghost" icon="refresh" onClick={reset}>
              Tentar de novo
            </Button>
          </div>
          <TutorFeedback c={c} ex={ex} st={st!} setSt={setSt} />
        </div>
      )}
    </article>
  );
}

// ---------- classificar

function ClassifyInput({
  ex,
  answers,
  setAnswer,
  submitted,
  ctx,
}: {
  ex: ClassifyExercise;
  answers: Record<string, any>;
  setAnswer: (k: string, v: any) => void;
  submitted: boolean;
  ctx: InlineCtx;
}) {
  return (
    <ol className="cl-list">
      {ex.items.map((it, n) => {
        const a = answers[it.id];
        const right = submitted && a === it.answer;
        const wrong = submitted && a !== it.answer;
        return (
          <li key={it.id} className={`cl-item ${right ? "is-right" : ""} ${wrong ? "is-wrong" : ""}`}>
            <p className="cl-text">
              <span className="cl-num">{ex.categories.length === 2 ? n + 1 : it.id}.</span>
              <span className="cl-body">{renderInline(it.text, ctx)}</span>
            </p>
            <div className="cl-opts" role="radiogroup" aria-label={`Resposta para ${it.id}`}>
              {ex.categories.map((cat, i) => (
                <button
                  key={cat}
                  type="button"
                  role="radio"
                  aria-checked={a === i}
                  disabled={submitted}
                  className={`pill ${a === i ? "is-on" : ""} ${submitted && i === it.answer ? "is-answer" : ""}`}
                  onClick={() => setAnswer(it.id, i)}
                >
                  {cat}
                </button>
              ))}
            </div>
            {ex.justify && (
              <input
                id={`j-${ex.id}-${it.id}`}
                className="input input-sm cl-justify"
                placeholder={ex.justify}
                aria-label={`${ex.justify} (${it.id})`}
                value={answers[`${it.id}:j`] ?? ""}
                disabled={submitted}
                onChange={(e) => setAnswer(`${it.id}:j`, e.target.value)}
              />
            )}
            {submitted && (
              <p className={`cl-feedback ${right ? "is-ok" : "is-bad"}`}>
                <Icon name={right ? "check" : "x"} size={14} />
                <span>
                  <span className="cl-verdict">{right ? "Certo" : `Resposta: ${ex.categories[it.answer]}`}</span>
                  {it.explain && <span className="cl-explain"> — {renderInline(it.explain, ctx)}</span>}
                </span>
              </p>
            )}
          </li>
        );
      })}
    </ol>
  );
}

// ---------- ordenar

function initialOrder(ex: OrderExercise): string[] {
  let seed = 0;
  for (const ch of ex.id) seed = seed * 31 + ch.charCodeAt(0);
  const ids = ex.items.map((i) => i.id);
  let s = shuffle(ids, rng(seed));
  if (s.join() === ids.join()) s = [...ids].reverse();
  return s;
}

function OrderInput({ ex, answers, setAnswer, submitted }: { ex: OrderExercise; answers: Record<string, any>; setAnswer: (k: string, v: any) => void; submitted: boolean }) {
  const order: string[] = answers.order ?? initialOrder(ex);
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= order.length) return;
    const next = [...order];
    [next[i], next[j]] = [next[j], next[i]];
    setAnswer("order", next);
  };
  return (
    <ol className="order-list">
      {order.map((id, i) => {
        const it = ex.items.find((x) => x.id === id)!;
        const right = submitted && ex.items[i].id === id;
        return (
          <li key={id} className={`row-item order-item ${submitted ? (right ? "is-right" : "is-wrong") : ""}`}>
            <span className="order-pos">{i + 1}</span>
            <span className="order-text">{it.text}</span>
            {submitted && <span className="order-detail">{it.detail}</span>}
            {!submitted ? (
              <span className="order-btns">
                <button type="button" className="icon-btn" aria-label={`Subir ${it.text}`} disabled={i === 0} onClick={() => move(i, -1)}>
                  <Icon name="up" size={16} />
                </button>
                <button type="button" className="icon-btn" aria-label={`Descer ${it.text}`} disabled={i === order.length - 1} onClick={() => move(i, 1)}>
                  <Icon name="down" size={16} />
                </button>
              </span>
            ) : (
              <Icon name={right ? "check" : "x"} size={16} className={right ? "c-ok" : "c-bad"} />
            )}
          </li>
        );
      })}
    </ol>
  );
}

// ---------- texto

function TextInput({ ex, answers, setAnswer, submitted }: { ex: TextExercise; answers: Record<string, any>; setAnswer: (k: string, v: any) => void; submitted: boolean }) {
  return (
    <div className="ex-fields">
      {ex.fields.map((f) => (
        <div key={f.id} className="field">
          <label htmlFor={`f-${ex.id}-${f.id}`}>{f.label}</label>
          <textarea
            id={`f-${ex.id}-${f.id}`}
            className={`input ${f.mono ? "mono" : ""}`}
            rows={f.rows}
            placeholder={f.placeholder}
            value={answers[f.id] ?? ""}
            readOnly={submitted}
            spellCheck={!f.mono}
            onChange={(e) => setAnswer(f.id, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}

function SelfCheck({ ex, st, setSt }: { ex: TextExercise; st: ExState; setSt: Props["setSt"] }) {
  return (
    <div className="ex-selfcheck">
      <p className="eyebrow">Autocorreção · compare com o gabarito e marque o que a sua resposta cumpre</p>
      {ex.criteria.map((cr, i) => (
        <Checkbox
          key={i}
          id={`crit-${ex.id}-${i}`}
          checked={!!st.criteria?.[i]}
          onChange={(v) =>
            setSt((s) => {
              s.criteria = { ...(s.criteria ?? {}), [i]: v };
            })
          }
          label={cr}
        />
      ))}
    </div>
  );
}

function TutorFeedback({ c, ex, st, setSt }: { c: ModuleContent; ex: Exercise; st: ExState; setSt: Props["setSt"] }) {
  const sample = useSample();
  const [busy, setBusy] = useState(false);
  const [live, setLive] = useState("");
  const [err, setErr] = useState("");
  if (!sample) return null;
  const ask = async () => {
    setBusy(true);
    setErr("");
    setLive("");
    try {
      const { text } = await sample(exerciseFeedbackPrompt(c, ex, st.answers ?? {}), { cache: false, onText: ({ text }: { text: string }) => setLive(text) });
      setSt((s) => {
        s.tutor = text;
      });
    } catch (e: any) {
      reportSampleError(e);
      setErr(sampleErrorText(e));
    } finally {
      setBusy(false);
      setLive("");
    }
  };
  const text = busy ? live : st.tutor;
  return (
    <div className="ex-tutor">
      {!text && !busy && (
        <Button variant="quiet" icon="sparkle" className="ex-tutor-ask" onClick={ask}>
          Pedir ao tutor que explique o que está certo e errado
        </Button>
      )}
      {(text || busy) && (
        <div className="tutor-note">
          <p className="eyebrow">
            <Icon name="sparkle" size={13} /> Tutor
          </p>
          {text ? <Markdown src={text} /> : <p className="muted">A ler a sua resposta…</p>}
          {!busy && (
            <button type="button" className="link-btn" onClick={ask}>
              Pedir outra explicação
            </button>
          )}
        </div>
      )}
      {err && <p className="tutor-err">{err}</p>}
    </div>
  );
}
