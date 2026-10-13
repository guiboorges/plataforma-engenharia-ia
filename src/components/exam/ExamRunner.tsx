import React, { useEffect, useRef } from "react";
import type { ExamSpec, Inline } from "../../content/types";
import { allQuestions } from "../../lib/exam";
import { renderInline } from "../../lib/md";
import type { Attempt } from "../../lib/store";
import { Blocks } from "../Blocks";
import { ConfirmButton, Icon, fmtClock, useNow } from "../ui";

// Prova em curso: ecrã inteiro, sem acesso à aula, à apostila, às notas nem ao tutor.

export function ExamRunner({
  title,
  spec,
  attempt,
  save,
  onSubmit,
  moduleId = "",
  rules,
}: {
  title: string;
  spec: ExamSpec;
  attempt: Attempt;
  save: (recipe: (a: Attempt) => void) => void;
  onSubmit: () => void;
  /** módulo ou fase das perguntas (para os blocos de contexto) */
  moduleId?: string;
  /** regras próprias desta prova, mostradas no início (por exemplo, as do exame de fase) */
  rules?: Inline;
}) {
  const now = useNow(1000);
  const left = attempt.deadline - now;
  const qs = allQuestions(spec);
  const answered = qs.filter((q) => {
    const v = attempt.answers[q.id];
    return q.kind === "mcq" ? typeof v === "number" : String(v ?? "").trim().length > 0;
  }).length;
  const submitted = useRef(false);

  useEffect(() => {
    if (left <= 0 && !submitted.current) {
      submitted.current = true;
      onSubmit();
    }
  }, [left, onSubmit]);

  const setAns = (id: string, v: number | string) =>
    save((a) => {
      a.answers = { ...a.answers, [id]: v };
    });

  return (
    <div className="exam-shell">
      <header className="exam-bar">
        <div className="exam-bar-title">
          <span className="eyebrow">Prova em curso · sem consulta</span>
          <h1 className="exam-name">{title}</h1>
        </div>
        <div className={`exam-clock ${left < 5 * 60_000 ? "is-low" : ""}`} role="timer" aria-live="off">
          <Icon name="timer" size={16} />
          <span className="mono">{fmtClock(left)}</span>
        </div>
        <span className="exam-count">
          <span className="mono">
            {answered}/{qs.length}
          </span>
          <span className="exam-count-label"> respondidas</span>
        </span>
        <ConfirmButton
          label="Entregar"
          confirmLabel="Entregar agora"
          question={answered < qs.length ? `Faltam ${qs.length - answered} perguntas. Entregar?` : "Entregar a prova?"}
          onConfirm={() => {
            submitted.current = true;
            onSubmit();
          }}
          variant="primary"
          size="sm"
        />
      </header>

      <main className="exam-body">
        <p className="exam-note">
          {spec.minutes} minutos · {String(spec.total)} valores · aprovação com {spec.pass}. As respostas ficam guardadas à medida que escreve; se fechar a página, a prova continua
          quando voltar e o tempo não para.
        </p>
        {rules && <p className="exam-note">{renderInline(rules)}</p>}
        {spec.groups.map((g) => (
          <section key={g.title} className="exam-group">
            <header className="exam-group-head">
              <h2 className="exam-group-title">{g.title}</h2>
              {g.note && <p className="exam-group-note">{g.note}</p>}
            </header>
            {g.questions.map((q) => (
              <div key={q.id} className="card exam-q" id={`q-${q.id}`}>
                <div className="exam-q-head">
                  <p className="exam-q-text">
                    <span className="exam-q-num">{q.num}.</span> {renderInline(q.q)}
                  </p>
                  <span className="exam-q-pts">
                    {String(q.points).replace(".", ",")} {q.points === 1 ? "valor" : "valores"}
                  </span>
                </div>
                {q.context && q.context.length > 0 && (
                  <div className="prose exam-ctx">
                    <Blocks blocks={q.context} ctx={{ moduleId }} />
                  </div>
                )}
                {q.kind === "mcq" ? (
                  <div className="exam-opts" role="radiogroup" aria-label={`Pergunta ${q.num}`}>
                    {q.options.map((o, i) => (
                      <label key={i} className={`exam-opt ${attempt.answers[q.id] === i ? "is-on" : ""}`}>
                        <input type="radio" name={`q-${attempt.id}-${q.id}`} checked={attempt.answers[q.id] === i} onChange={() => setAns(q.id, i)} />
                        <span className="exam-letter">{String.fromCharCode(65 + i)}</span>
                        <span className="exam-opt-text">{renderInline(o)}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <textarea
                    id={`ans-${attempt.id}-${q.id}`}
                    className="input exam-answer"
                    rows={q.rows}
                    aria-label={`Resposta à pergunta ${q.num}`}
                    value={String(attempt.answers[q.id] ?? "")}
                    onChange={(e) => setAns(q.id, e.target.value)}
                  />
                )}
              </div>
            ))}
          </section>
        ))}
        <div className="exam-end">
          <span className="exam-end-count">
            {answered} de {qs.length} respondidas
          </span>
          <ConfirmButton
            label="Entregar a prova"
            confirmLabel="Entregar agora"
            question={answered < qs.length ? `Faltam ${qs.length - answered} perguntas. Entregar?` : "Entregar a prova?"}
            onConfirm={() => {
              submitted.current = true;
              onSubmit();
            }}
            variant="primary"
          />
        </div>
      </main>
    </div>
  );
}
