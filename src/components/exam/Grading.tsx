import React, { useState } from "react";
import type { Block, ExamQuestion, ExamSpec, ModuleContent } from "../../content/types";
import { allQuestions, mcqScore, totalScore } from "../../lib/exam";
import { fmtScore } from "../../lib/dates";
import { renderInline, Markdown } from "../../lib/md";
import type { Attempt } from "../../lib/store";
import { blocksText, examGradingPrompt, type OpenGrade } from "../../lib/tutor";
import { sampleErrorText } from "../../lib/claude";
import { Blocks } from "../Blocks";
import { Button, Chip, Icon } from "../ui";
import { reportSampleError, useSample } from "../Tutor";

// Correção das perguntas abertas com os critérios do gabarito: o aluno pontua cada critério,
// ou pede ao Claude uma proposta, que pode ajustar antes de concluir.

const steps = (max: number) => Array.from({ length: Math.round(max / 0.25) + 1 }, (_, i) => i * 0.25);

/**
 * Texto dos blocos para o prompt. O examGradingPrompt passa o enunciado e a resposta-modelo por plain(), que come
 * as crases das cercas ``` — por isso o código vai indentado (e o resultado também), sem cercas.
 */
function promptBlocks(blocks: Block[]): string {
  const ind = (t: string) => t.split("\n").map((l) => "    " + l).join("\n");
  return blocks
    .map((b) => (b.t === "code" ? `Código${b.title ? ` (${b.title})` : ""}:\n${ind(b.code)}${b.output ? `\nResultado:\n${ind(b.output)}` : ""}` : blocksText([b])))
    .filter(Boolean)
    .join("\n");
}

/** Para o Claude: o enunciado com os blocos de contexto (código, dados) e a resposta-modelo com o código da solução. */
function withBlocksText(spec: ExamSpec): ExamSpec {
  const full = (q: ExamQuestion): ExamQuestion => {
    const qText = q.context?.length ? `${q.q}\n${promptBlocks(q.context)}` : q.q;
    if (q.kind === "mcq") return { ...q, q: qText };
    return { ...q, q: qText, model: q.modelBlocks?.length ? `${q.model}\n${promptBlocks(q.modelBlocks)}` : q.model };
  };
  return { ...spec, groups: spec.groups.map((g) => ({ ...g, questions: g.questions.map(full) })) };
}

export function Grading({
  title,
  spec,
  attempt,
  content,
  save,
  onFinish,
  moduleId,
}: {
  title: string;
  spec: ExamSpec;
  attempt: Attempt;
  content: ModuleContent | null;
  save: (recipe: (a: Attempt) => void) => void;
  onFinish: () => void;
  /** módulo ou fase das perguntas (para os blocos de contexto); por omissão, o de `content` */
  moduleId?: string;
}) {
  const ctx = { moduleId: moduleId ?? content?.id ?? "" };
  const sample = useSample();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const qs = allQuestions(spec);
  const mcqs = qs.filter((q) => q.kind === "mcq");
  const opens = qs.filter((q) => q.kind === "open");
  const mcqPts = mcqScore(spec, attempt);
  const mcqMax = mcqs.reduce((a, q) => a + q.points, 0);
  const total = totalScore(spec, attempt);
  const mcqOk = mcqs.filter((q) => q.kind === "mcq" && attempt.answers[q.id] === q.answer).length;

  const askClaude = async () => {
    if (!sample) return;
    setBusy(true);
    setErr("");
    try {
      const res = await sample.json<OpenGrade>(examGradingPrompt(content, title, withBlocksText(spec), attempt), { modelTier: "default" });
      save((a) => {
        a.grading = { ...(a.grading ?? {}) };
        a.aiNotes = { ...(a.aiNotes ?? {}) };
        for (const q of opens) {
          if (q.kind !== "open") continue;
          const r = res?.[q.id];
          if (!r) continue;
          const g: Record<string, number> = {};
          for (const cr of q.criteria) {
            const v = Number(r.criterios?.[cr.id] ?? 0);
            g[cr.id] = Math.max(0, Math.min(cr.points, Math.round((isFinite(v) ? v : 0) * 4) / 4));
          }
          a.grading[q.id] = g;
          if (r.comentario) a.aiNotes[q.id] = String(r.comentario);
        }
      });
    } catch (e: any) {
      reportSampleError(e);
      setErr(sampleErrorText(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="grade" aria-label="Correção da prova">
      <section className="card grade-summary" aria-labelledby="grade-summary-title">
        <div className="grade-summary-row">
          <div className="grade-summary-text">
            <p className="eyebrow">Correção · {title}</p>
            <h2 id="grade-summary-title">Falta corrigir as perguntas abertas</h2>
            <p className="grade-summary-desc">
              A escolha múltipla já está corrigida: <strong>{fmtScore(mcqPts)}</strong> de {mcqMax} valores. Para as abertas, compare a sua resposta com a resposta-modelo e dê a
              cotação de cada critério do gabarito.
            </p>
          </div>
          <div className="grade-total">
            <span className="grade-total-label">Nota provisória</span>
            <span className="big-score mono grade-total-score">{fmtScore(total)}</span>
            <span className="grade-total-label">de {spec.total}</span>
          </div>
        </div>

        {sample && (
          <div className="grading-ai">
            <Button variant="secondary" icon="sparkle" onClick={askClaude} disabled={busy}>
              {busy ? "O Claude está a corrigir…" : attempt.aiNotes ? "Pedir nova correção ao Claude" : "Corrigir com o Claude"}
            </Button>
            <span className="grade-ai-hint">Usa os critérios e as respostas-modelo do gabarito. Pode ajustar as cotações antes de concluir.</span>
            {err && <p className="tutor-err">{err}</p>}
          </div>
        )}
      </section>

      {mcqs.length > 0 && (
        <section className="card grade-mcq" aria-labelledby="grade-mcq-title">
          <header className="card-head">
            <h3 id="grade-mcq-title" className="card-title">
              Escolha múltipla
            </h3>
            <span className="grade-mcq-count">
              {mcqOk}/{mcqs.length} certas
            </span>
          </header>
          <ol className="grade-mcq-list">
            {mcqs.map((q) => {
              if (q.kind !== "mcq") return null;
              const a = attempt.answers[q.id];
              const ok = a === q.answer;
              return (
                <li key={q.id} title={`Pergunta ${q.num}: ${ok ? "certa" : "errada"}`}>
                  <Chip tone={ok ? "ok" : "bad"} icon={ok ? "check" : "x"}>
                    <span className="mono">{q.num}</span>
                    <span className="sr-only">{ok ? " certa" : " errada"}</span>
                  </Chip>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {opens.map((q) => {
        if (q.kind !== "open") return null;
        const g = attempt.grading?.[q.id] ?? {};
        const got = q.criteria.reduce((acc, c) => acc + (g[c.id] ?? 0), 0);
        return (
          <article key={q.id} className="card grade-q">
            <header className="grade-q-head">
              <p className="grade-q-text">
                <span className="grade-q-num">{q.num}.</span> {renderInline(q.q)}
              </p>
              <span className="grade-pts">
                {fmtScore(got)}/{fmtScore(q.points)}
              </span>
            </header>
            {q.context && q.context.length > 0 && (
              <div className="prose exam-ctx">
                <Blocks blocks={q.context} ctx={ctx} />
              </div>
            )}
            <div className="grade-answer">
              <p className="eyebrow">A sua resposta</p>
              <p className="answer-text">{String(attempt.answers[q.id] ?? "").trim() || <em className="muted">(em branco)</em>}</p>
            </div>
            <details className="grade-model">
              <summary>
                <Icon name="caret" size={14} />
                Resposta-modelo do gabarito
              </summary>
              <p>{renderInline(q.model)}</p>
              {q.modelBlocks && q.modelBlocks.length > 0 && (
                <div className="prose exam-model-blocks">
                  <Blocks blocks={q.modelBlocks} ctx={ctx} />
                </div>
              )}
            </details>
            <ul className="criteria">
              {q.criteria.map((cr) => (
                <li key={cr.id}>
                  <label htmlFor={`g-${attempt.id}-${q.id}-${cr.id}`}>{cr.text}</label>
                  <select
                    id={`g-${attempt.id}-${q.id}-${cr.id}`}
                    className="input input-sm"
                    value={g[cr.id] ?? 0}
                    onChange={(e) =>
                      save((a) => {
                        a.grading = { ...(a.grading ?? {}), [q.id]: { ...(a.grading?.[q.id] ?? {}), [cr.id]: Number(e.target.value) } };
                      })
                    }
                  >
                    {steps(cr.points).map((v) => (
                      <option key={v} value={v}>
                        {fmtScore(v)} / {fmtScore(cr.points)}
                      </option>
                    ))}
                  </select>
                </li>
              ))}
            </ul>
            {attempt.aiNotes?.[q.id] && (
              <div className="tutor-note">
                <p className="eyebrow">
                  <Icon name="sparkle" size={13} /> Comentário do Claude
                </p>
                <Markdown src={attempt.aiNotes[q.id]} />
              </div>
            )}
          </article>
        );
      })}

      <div className="grading-foot">
        <span>
          Nota final: <strong className="mono">{fmtScore(total)}</strong> valores · {total >= spec.pass ? "aprovado" : `abaixo de ${spec.pass}`}
        </span>
        <Button variant="primary" icon="check" onClick={onFinish}>
          Concluir correção
        </Button>
      </div>
    </section>
  );
}
