import React, { useEffect, useState } from "react";
import type { ModuleContent } from "../../content/types";
import { allQuestions, lastDone, questionPoints } from "../../lib/exam";
import { fmtScore } from "../../lib/dates";
import { renderInline } from "../../lib/md";
import { useRouter } from "../../lib/router";
import { useMod } from "../../lib/store";
import { Blocks, type BlocksCtx } from "../../components/Blocks";
import { Button, Chip, ConfirmButton, Icon } from "../../components/ui";

export function GabaritoTab({ c }: { c: ModuleContent }) {
  const [mod] = useMod(c.id);
  const { route, navigate } = useRouter();
  const [peek, setPeek] = useState<Record<string, boolean>>({});
  const ctx: BlocksCtx = { moduleId: c.id, onSection: (id) => navigate({ page: "modulo", id: c.id, tab: "aula", anchor: id }) };
  const anchor = route.page === "modulo" ? route.anchor : undefined;
  const examDone = lastDone(mod.attempts);
  const examOpen = !!examDone || mod.attempts.some((a) => a.status === "grading");

  useEffect(() => {
    if (anchor) window.setTimeout(() => document.getElementById(anchor)?.scrollIntoView({ block: "start" }), 40);
  }, [anchor]);

  return (
    <div className="tab-body narrow gab-tab">
      <aside className="callout callout-warn">
        <p className="callout-title">Gabarito</p>
        <p>
          {renderInline(c.goldenRule)} Cada solução abre quando entregar a sua tentativa. Nas perguntas abertas o que conta é o raciocínio: as respostas-modelo são uma das formas
          certas de responder.
        </p>
      </aside>

      <section className="gab-section" aria-labelledby="gab-ex-title">
        <h2 className="gab-section-title" id="gab-ex-title">
          Exercícios
        </h2>
        {c.exercises.map((ex) => {
          const st = mod.exercises[ex.id];
          const open = !!st?.submittedAt || peek[ex.id];
          return (
            <article key={ex.id} id={`g-${ex.id}`} className={`card gab ${open ? "" : "is-locked"}`}>
              <header className="gab-head">
                <div className="gab-head-text">
                  <p className="eyebrow">Exercício {ex.num}</p>
                  <h3 className="gab-title">{ex.title}</h3>
                </div>
                {!open ? <Icon name="lock" size={16} /> : !st?.submittedAt && <Chip>Aberto sem tentativa</Chip>}
              </header>
              {open ? (
                <div className="prose">
                  <Blocks blocks={ex.solution} ctx={ctx} />
                </div>
              ) : (
                <div className="gab-locked-row">
                  <span className="gab-locked-text">Tente primeiro o exercício.</span>
                  <Button size="sm" variant="secondary" onClick={() => navigate({ page: "modulo", id: c.id, tab: "exercicios", anchor: `ex-${ex.id}` })}>
                    Ir ao exercício {ex.num}
                  </Button>
                  <ConfirmButton
                    size="sm"
                    variant="ghost"
                    label="Mostrar mesmo assim"
                    confirmLabel="Mostrar"
                    question="Sem tentar, aprende menos. Mostrar?"
                    onConfirm={() => setPeek({ ...peek, [ex.id]: true })}
                  />
                </div>
              )}
            </article>
          );
        })}
      </section>

      <section className="gab-section" aria-labelledby="g-prova">
        <h2 className="gab-section-title" id="g-prova">
          Prova
        </h2>
        {!examOpen ? (
          <article className="card gab is-locked">
            <div className="gab-locked-row">
              <Icon name="lock" size={16} />
              <span className="gab-locked-text">As soluções da prova abrem depois de a entregar.</span>
              <Button size="sm" variant="secondary" onClick={() => navigate({ page: "modulo", id: c.id, tab: "prova" })}>
                Ir à prova
              </Button>
            </div>
          </article>
        ) : (
          <>
            {c.exam.groups.map((g) => (
              <section key={g.title} className="card gab-exam">
                <h3 className="card-title">{g.title}</h3>
                <ol className="gab-qs">
                  {g.questions.map((q) => {
                    const my = examDone ? examDone.answers[q.id] : undefined;
                    const pts = examDone ? questionPoints(q, examDone) : undefined;
                    return (
                      <li key={q.id} className="gab-q">
                        <div className="gab-q-head">
                          <p className="gab-q-text">
                            <span className="gab-q-num">{q.num}.</span> {renderInline(q.q)}
                          </p>
                          {pts !== undefined && (
                            <Chip tone={pts >= q.points ? "ok" : "bad"}>
                              <span className="mono">
                                {fmtScore(pts)}/{fmtScore(q.points)}
                              </span>
                            </Chip>
                          )}
                        </div>
                        {q.context && q.context.length > 0 && (
                          <div className="prose exam-ctx">
                            <Blocks blocks={q.context} ctx={ctx} />
                          </div>
                        )}
                        {q.kind === "mcq" ? (
                          <p className="gab-answer">
                            Resposta certa: <strong>{String.fromCharCode(65 + q.answer)})</strong> {renderInline(q.options[q.answer])}
                            {typeof my === "number" && my !== q.answer && <span className="c-bad"> · respondeu {String.fromCharCode(65 + my)})</span>}
                            {q.explain && <span className="gab-explain"> — {renderInline(q.explain)}</span>}
                          </p>
                        ) : (
                          <div className="gab-answer">
                            <p>
                              <strong>Resposta-modelo:</strong> {renderInline(q.model)}
                            </p>
                            {q.modelBlocks && q.modelBlocks.length > 0 && (
                              <div className="prose exam-model-blocks">
                                <Blocks blocks={q.modelBlocks} ctx={ctx} />
                              </div>
                            )}
                            <ul className="crit-list">
                              {q.criteria.map((cr) => (
                                <li key={cr.id}>
                                  {cr.text} <span className="gab-crit-pts">({fmtScore(cr.points)})</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </section>
            ))}
            <section className="card gab-review" aria-labelledby="gab-review-title">
              <h3 className="card-title" id="gab-review-title">
                Se a nota ficar abaixo de {c.exam.pass}
              </h3>
              <p className="gab-review-note">{renderInline(c.examReviewNote ?? "Rever as secções ligadas às perguntas falhadas e repetir a prova uma semana depois.")}</p>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Perguntas</th>
                      <th scope="col">Secção da aula</th>
                    </tr>
                  </thead>
                  <tbody>
                    {c.lesson
                      .map((s) => ({ s, qs: allQuestions(c.exam).filter((q) => q.section === s.id).map((q) => q.num) }))
                      .filter((x) => x.qs.length)
                      .map(({ s, qs }) => (
                        <tr key={s.id}>
                          <td className="mono gab-review-qs">{qs.join(", ")}</td>
                          <td>
                            <button type="button" className="link-btn" onClick={() => navigate({ page: "modulo", id: c.id, tab: "aula", anchor: s.id })}>
                              {s.num}. {s.title}
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </section>
    </div>
  );
}
