import React, { useState } from "react";
import type { ModuleContent } from "../../content/types";
import { allQuestions, buildPractice, gradingAttempt, lastDone, newAttempt, retakeLockedUntil, totalScore, weakSections, type PracticeItem } from "../../lib/exam";
import { fmtDateTime, fmtScore } from "../../lib/dates";
import { renderInline } from "../../lib/md";
import { useRouter } from "../../lib/router";
import { useCore, useMod, type Attempt, type ModProg } from "../../lib/store";
import { Grading } from "../../components/exam/Grading";
import { Button, Card, Chip, ConfirmButton, Icon } from "../../components/ui";

/** Ações sobre as tentativas da prova de um módulo. */
export function useModuleExam(c: ModuleContent) {
  const [mod, setMod] = useMod(c.id);
  const save = (id: string, recipe: (a: Attempt) => void) =>
    setMod((m) => {
      const a = m.attempts.find((x) => x.id === id);
      if (a) recipe(a);
    });
  const finish = (id: string) =>
    setMod((m) => {
      const a = m.attempts.find((x) => x.id === id);
      if (!a) return;
      a.score = Math.round(totalScore(c.exam, a) * 100) / 100;
      a.passed = a.score >= c.exam.pass;
      a.status = "done";
      m.best = Math.max(m.best ?? 0, a.score);
      if (a.passed && !m.passedAt) m.passedAt = Date.now();
    });
  const submit = (id: string) => {
    const hasOpen = allQuestions(c.exam).some((q) => q.kind === "open");
    setMod((m) => {
      const a = m.attempts.find((x) => x.id === id);
      if (!a || a.status !== "running") return;
      a.submittedAt = Date.now();
      a.status = hasOpen ? "grading" : "done";
    });
    if (!hasOpen) finish(id);
  };
  const start = () =>
    setMod((m) => {
      if (m.attempts.some((a) => a.status === "running")) return;
      m.attempts.push(newAttempt(c.exam));
    });
  return { mod, save, submit, finish, start };
}

export function ExamTab({ c }: { c: ModuleContent }) {
  const { mod, save, finish, start } = useModuleExam(c);
  const [core] = useCore();
  const { navigate } = useRouter();
  const grading = gradingAttempt(mod.attempts);
  const last = lastDone(mod.attempts);
  const locked = retakeLockedUntil(mod, core.settings.allowEarlyRetake);
  const qs = allQuestions(c.exam);
  const read = c.lesson.filter((s) => mod.sections[s.id]).length;
  const exDone = c.exercises.filter((e) => mod.exercises[e.id]?.submittedAt).length;

  if (grading) {
    return (
      <div className="tab-body narrow exam-tab">
        <Grading title={`prova do ${c.id}`} spec={c.exam} attempt={grading} content={c} save={(r) => save(grading.id, r)} onFinish={() => finish(grading.id)} />
      </div>
    );
  }

  return (
    <div className="tab-body narrow exam-tab">
      {last && <ExamResult c={c} a={last} mod={mod} />}

      <section className="card exam-card" aria-labelledby="exam-card-title">
        <header className="card-head">
          <div className="exam-card-head">
            <h2 id="exam-card-title" className="card-title">
              Prova do {c.id}
            </h2>
            <p className="exam-card-meta">
              {c.exam.minutes} minutos · sem consulta · {c.exam.total} valores · {qs.length} perguntas
            </p>
          </div>
          <Chip tone="neutral">Aprovação com {c.exam.pass}</Chip>
        </header>
        <ul className="tasks" aria-label="Grupos da prova">
          {c.exam.groups.map((g) => (
            <li key={g.title} className="row-item">
              <Icon name="file" size={15} />
              <span className="exam-row-main">{g.title}</span>
              <span className="exam-row-meta">
                {g.questions.length} {g.questions.length === 1 ? "pergunta" : "perguntas"}
              </span>
            </li>
          ))}
        </ul>
        <p className="exam-rules">
          Durante a prova não há acesso à aula, à apostila, às notas nem ao tutor. A escolha múltipla corrige-se sozinha; as perguntas abertas corrige-as com os critérios do
          gabarito, por si ou com a ajuda do Claude. Abaixo de {c.exam.pass}: rever a apostila e repetir a prova uma semana depois.
        </p>
        <div className="exam-pre">
          <p className="eyebrow">Antes de começar</p>
          <ul className="exam-pre-list">
            <li className={`row-item ${read === c.lesson.length ? "is-ok" : ""}`}>
              <Icon name={read === c.lesson.length ? "check" : "info"} size={15} />
              <span className="exam-row-main">Aula</span>
              <span className="exam-row-meta">
                {read}/{c.lesson.length} secções lidas
              </span>
            </li>
            <li className={`row-item ${exDone === c.exercises.length ? "is-ok" : ""}`}>
              <Icon name={exDone === c.exercises.length ? "check" : "info"} size={15} />
              <span className="exam-row-main">Exercícios</span>
              <span className="exam-row-meta">
                {exDone}/{c.exercises.length} entregues
              </span>
            </li>
            <li className={`row-item ${mod.apostilaReviewedAt ? "is-ok" : ""}`}>
              <Icon name={mod.apostilaReviewedAt ? "check" : "info"} size={15} />
              <span className="exam-row-main">Apostila</span>
              <span className="exam-row-meta">{mod.apostilaReviewedAt ? "revista" : "por rever"}</span>
            </li>
          </ul>
        </div>
        {locked ? (
          <div className="exam-locked">
            <Icon name="lock" size={16} />
            <div className="exam-locked-body">
              <p>
                <strong>Pode repetir a prova a partir de {fmtDateTime(locked)}.</strong> Até lá: rever a apostila e as secções das perguntas falhadas, e fazer simulados de treino.
              </p>
              <Button variant="secondary" size="sm" onClick={() => navigate({ page: "modulo", id: c.id, tab: "apostila" })}>
                Rever a apostila
              </Button>
            </div>
          </div>
        ) : (
          <div className="exam-start">
            <ConfirmButton
              label={mod.passedAt ? "Fazer a prova outra vez" : last ? "Repetir a prova" : "Começar a prova"}
              confirmLabel={`Começar agora (${c.exam.minutes} min)`}
              question="O cronómetro começa já e a aula fica fechada."
              onConfirm={start}
              variant={mod.passedAt ? "secondary" : "primary"}
              icon="timer"
            />
          </div>
        )}
      </section>

      {mod.attempts.filter((a) => a.status === "done").length > 0 && <History mod={mod} />}

      <Practice c={c} />
    </div>
  );
}

function ExamResult({ c, a, mod }: { c: ModuleContent; a: Attempt; mod: ModProg }) {
  const { navigate } = useRouter();
  const weak = weakSections(c.exam, a);
  const secTitle = (id: string) => c.lesson.find((s) => s.id === id);
  return (
    <section className={`card result ${a.passed ? "is-pass" : "is-fail"}`} aria-label="Última prova">
      <div className="result-score">
        <span className="big-score mono">{fmtScore(a.score ?? 0)}</span>
        <span className="muted">de {c.exam.total} valores</span>
      </div>
      <div className="result-body">
        <p className="eyebrow">Última prova · {fmtDateTime(a.submittedAt ?? a.startedAt)}</p>
        <h2 className="exam-result-title">{a.passed ? (mod.passedAt ? "Aprovado. Pode avançar para o módulo seguinte." : "Aprovado.") : `Abaixo de ${c.exam.pass}. Reveja e repita daqui a uma semana.`}</h2>
        {weak.length > 0 && (
          <>
            <p className="exam-result-note">Secções da aula a rever, pelas perguntas que não tiveram a cotação toda:</p>
            <ul className="tasks">
              {weak.map((w) => {
                const s = secTitle(w.section);
                return (
                  <li key={w.section}>
                    <button type="button" className="row-item" onClick={() => navigate({ page: "modulo", id: c.id, tab: "aula", anchor: w.section })}>
                      <Icon name="book" size={15} />
                      <span className="exam-row-main">{s ? `${s.num}. ${s.title}` : w.section}</span>
                      <span className="exam-row-meta">
                        {w.questions.length === 1 ? "pergunta" : "perguntas"} {w.questions.join(", ")}
                      </span>
                      <Icon name="right" size={14} />
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}
        {c.examReviewNote && !a.passed && <p className="exam-result-note">{renderInline(c.examReviewNote)}</p>}
        <div className="row gap-sm wrap">
          <Button size="sm" variant="secondary" icon="eye" onClick={() => navigate({ page: "modulo", id: c.id, tab: "gabarito", anchor: "g-prova" })}>
            Ver a correção no gabarito
          </Button>
        </div>
      </div>
    </section>
  );
}

function History({ mod }: { mod: ModProg }) {
  const done = mod.attempts.filter((a) => a.status === "done");
  return (
    <Card title="Tentativas">
      <ol className="tasks exam-history">
        {done.map((a, i) => (
          <li key={a.id} className="row-item">
            <span className="exam-hist-n">{i + 1}</span>
            <span className="exam-row-main">{fmtDateTime(a.submittedAt ?? a.startedAt)}</span>
            <span className="exam-hist-score">{fmtScore(a.score ?? 0)} valores</span>
            <Chip tone={a.passed ? "ok" : "warn"}>{a.passed ? "aprovado" : "abaixo de 14"}</Chip>
          </li>
        ))}
      </ol>
    </Card>
  );
}

// ---------- simulado de treino (não conta para a nota)

function Practice({ c }: { c: ModuleContent }) {
  const [mod, setMod] = useMod(c.id);
  const [items, setItems] = useState<PracticeItem[] | null>(null);
  const [ans, setAns] = useState<Record<number, number | boolean>>({});
  const [done, setDone] = useState(false);
  const n = c.practice.mcq.length + c.practice.tf.length;
  if (!n) return null;

  const begin = (size: number) => {
    const nMcq = Math.round(size * 0.65);
    setItems(buildPractice([c.id], nMcq, size - nMcq));
    setAns({});
    setDone(false);
  };
  const correct = items ? items.filter((it, i) => (it.kind === "mcq" ? ans[i] === it.q.answer : ans[i] === it.q.answer)).length : 0;
  const finish = () => {
    setDone(true);
    setMod((m) => {
      m.practiceRuns.push({ at: Date.now(), correct, total: items!.length });
    });
  };
  const lastRuns = mod.practiceRuns.slice(-5);

  return (
    <section className="card practice" aria-label="Simulado de treino">
      <header className="card-head">
        <div className="practice-head">
          <p className="eyebrow">Simulado de treino · não conta para a nota</p>
          <h2 className="card-title">Perguntas rápidas sobre a aula</h2>
        </div>
        {!items && (
          <div className="row gap-sm">
            <Button size="sm" variant="secondary" onClick={() => begin(10)}>
              10 perguntas
            </Button>
            <Button size="sm" variant="ghost" onClick={() => begin(20)}>
              20 perguntas
            </Button>
          </div>
        )}
      </header>
      {!items && (
        <p className="practice-desc">
          Um banco de {n} perguntas de escolha múltipla e verdadeiro ou falso, escritas pela plataforma a partir da aula. Bom para a semana antes da prova ou de uma repetição.
          {lastRuns.length > 0 && <> Últimos simulados: {lastRuns.map((r) => `${r.correct}/${r.total}`).join(" · ")}.</>}
        </p>
      )}
      {items && (
        <>
          <ol className="practice-list">
            {items.map((it, i) => {
              const a = ans[i];
              const right = it.kind === "mcq" ? a === it.q.answer : a === it.q.answer;
              return (
                <li key={i} className={`cl-item ${done ? (right ? "is-right" : "is-wrong") : ""}`}>
                  <p className="cl-text">
                    <span className="cl-num">{i + 1}.</span>
                    <span className="cl-body">{renderInline(it.q.q)}</span>
                  </p>
                  <div className="cl-opts" role="group" aria-label={`Resposta à pergunta ${i + 1}`}>
                    {it.kind === "mcq"
                      ? it.order.map((oi) => (
                          <button
                            key={oi}
                            type="button"
                            disabled={done}
                            className={`pill ${a === oi ? "is-on" : ""} ${done && oi === it.q.answer ? "is-answer" : ""}`}
                            onClick={() => setAns({ ...ans, [i]: oi })}
                          >
                            {renderInline(it.q.options[oi])}
                          </button>
                        ))
                      : [true, false].map((v) => (
                          <button
                            key={String(v)}
                            type="button"
                            disabled={done}
                            className={`pill ${a === v ? "is-on" : ""} ${done && v === it.q.answer ? "is-answer" : ""}`}
                            onClick={() => setAns({ ...ans, [i]: v })}
                          >
                            {v ? "Verdadeiro" : "Falso"}
                          </button>
                        ))}
                  </div>
                  {done && (
                    <p className={`cl-feedback ${right ? "is-ok" : "is-bad"}`}>
                      <Icon name={right ? "check" : "x"} size={14} />
                      <span className="cl-explain">{renderInline(it.q.explain)}</span>
                    </p>
                  )}
                </li>
              );
            })}
          </ol>
          <div className="practice-foot">
            {!done ? (
              <Button variant="primary" onClick={finish} disabled={Object.keys(ans).length < items.length}>
                Corrigir ({Object.keys(ans).length}/{items.length})
              </Button>
            ) : (
              <>
                <strong className="practice-score">
                  {correct} de {items.length} certas
                </strong>
                <Button variant="secondary" onClick={() => begin(items.length)}>
                  Outro simulado
                </Button>
                <Button variant="ghost" onClick={() => setItems(null)}>
                  Fechar
                </Button>
              </>
            )}
          </div>
        </>
      )}
    </section>
  );
}
