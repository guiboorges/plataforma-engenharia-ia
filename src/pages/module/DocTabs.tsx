import React, { useState } from "react";
import { DOCS, type DocPart } from "../../content";
import { moduleMeta } from "../../content/course";
import type { ModuleTab } from "../../content/types";
import { fmtDateTime, fmtScore, todayYMD } from "../../lib/dates";
import { lastDone, retakeLockedUntil } from "../../lib/exam";
import { Markdown } from "../../lib/md";
import { useCore, useMod, uid, type Attempt } from "../../lib/store";
import { docExamGradingPrompt } from "../../lib/tutor";
import { sampleErrorText } from "../../lib/claude";
import { Button, Card, Chip, ConfirmButton, Empty, Icon, fmtClock, useNow } from "../../components/ui";
import { reportSampleError, useSample } from "../../components/Tutor";

// "Modo documento": módulos que ainda só existem como .md na pasta do curso.

const DOC_EXAM_MIN = 60;
const PASS = 14;

export function DocTab({ id, tab }: { id: string; tab: ModuleTab }) {
  const d = DOCS[id];
  const [mod, setMod] = useMod(id);
  const [peek, setPeek] = useState(false);
  const ctx = { images: d.images };
  const part = tab as DocPart;
  const src = d.files[part];

  if (tab === "prova") return <DocExam id={id} />;

  if (!src)
    return (
      <div className="tab-body narrow">
        <Empty icon="file" title="Este ficheiro não existe na pasta do módulo." />
      </div>
    );

  if (tab === "gabarito") {
    const open = !!mod.doc?.triedAt || !!lastDone(mod.attempts) || mod.attempts.some((a) => a.status === "grading") || peek;
    return (
      <div className="tab-body narrow">
        {!open ? (
          <article className="card gab is-locked">
            <div className="doc-locked">
              <span className="doc-ico" aria-hidden="true">
                <Icon name="lock" size={16} />
              </span>
              <div className="doc-locked-body">
                <h2 className="card-title">Gabarito fechado</h2>
                <p className="muted small">O gabarito abre depois de tentar os exercícios (separador Exercícios) ou de entregar a prova.</p>
                <div className="doc-actions-main">
                  <ConfirmButton size="sm" variant="ghost" label="Mostrar mesmo assim" confirmLabel="Mostrar" question="Sem tentar, aprende menos. Mostrar?" onConfirm={() => setPeek(true)} />
                </div>
              </div>
            </div>
          </article>
        ) : (
          <article className="card prose doc-md">
            <Markdown src={src} ctx={ctx} />
          </article>
        )}
      </div>
    );
  }

  return (
    <div className="tab-body narrow">
      <article className="card prose doc-md">
        <Markdown src={src} ctx={ctx} />
      </article>
      {tab === "aula" && (
        <div className="doc-actions">
          <div className="doc-actions-main">
            <Button
              variant={mod.sections.doc ? "secondary" : "primary"}
              icon="check"
              onClick={() =>
                setMod((m) => {
                  if (m.sections.doc) delete m.sections.doc;
                  else m.sections.doc = todayYMD();
                })
              }
            >
              {mod.sections.doc ? "Aula lida" : "Marcar aula como lida"}
            </Button>
          </div>
        </div>
      )}
      {tab === "apostila" && (
        <div className="doc-actions">
          <div className="doc-actions-main">
            <Button
              variant={mod.apostilaReviewedAt ? "secondary" : "primary"}
              icon="check"
              onClick={() =>
                setMod((m) => {
                  m.apostilaReviewedAt = Date.now();
                })
              }
            >
              {mod.apostilaReviewedAt ? `Revista a ${fmtDateTime(mod.apostilaReviewedAt)}` : "Marcar apostila como revista"}
            </Button>
          </div>
        </div>
      )}
      {tab === "exercicios" && (
        <Card title="As suas respostas">
          <textarea
            id={`doc-ans-${id}`}
            className="input doc-answers-area"
            rows={14}
            aria-label="As suas respostas"
            value={mod.doc?.answers ?? ""}
            placeholder="Escreva aqui as respostas, numeradas como no enunciado. O código faz-se no Colab."
            onChange={(e) => {
              const v = e.target.value;
              setMod((m) => {
                m.doc = { ...(m.doc ?? {}), answers: v };
              });
            }}
          />
          <div className="doc-actions-main">
            {mod.doc?.triedAt ? (
              <Chip tone="ok" icon="check">
                Tentativa registada a {fmtDateTime(mod.doc.triedAt)}
              </Chip>
            ) : (
              <Button
                variant="primary"
                icon="check"
                disabled={!mod.doc?.answers?.trim()}
                onClick={() =>
                  setMod((m) => {
                    m.doc = { ...(m.doc ?? {}), triedAt: Date.now() };
                  })
                }
              >
                Já tentei: abrir o gabarito
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

function DocExam({ id }: { id: string }) {
  const d = DOCS[id];
  const [mod, setMod] = useMod(id);
  const [core] = useCore();
  const sample = useSample();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [manual, setManual] = useState("");
  const grading = mod.attempts.find((a) => a.status === "grading");
  const last = lastDone(mod.attempts);
  const locked = retakeLockedUntil(mod, core.settings.allowEarlyRetake);

  const finish = (aid: string, score: number, note?: string) =>
    setMod((m) => {
      const a = m.attempts.find((x) => x.id === aid);
      if (!a) return;
      a.score = Math.max(0, Math.min(20, Math.round(score * 100) / 100));
      a.passed = a.score >= PASS;
      a.status = "done";
      if (note) a.aiNotes = { resumo: note };
      m.best = Math.max(m.best ?? 0, a.score);
      if (a.passed && !m.passedAt) m.passedAt = Date.now();
    });

  if (grading) {
    const ask = async () => {
      if (!sample) return;
      setBusy(true);
      setErr("");
      try {
        const r = await sample.json<any>(docExamGradingPrompt(moduleMeta(id).title, d.files.prova ?? "", d.files.gabarito ?? "", String(grading.answers.all ?? "")));
        setMod((m) => {
          const a = m.attempts.find((x) => x.id === grading.id);
          if (a) a.aiNotes = { json: JSON.stringify(r) };
        });
        if (typeof r?.total === "number") setManual(String(r.total).replace(".", ","));
      } catch (e: any) {
        reportSampleError(e);
        setErr(sampleErrorText(e));
      } finally {
        setBusy(false);
      }
    };
    let ai: any = null;
    try {
      ai = grading.aiNotes?.json ? JSON.parse(grading.aiNotes.json) : null;
    } catch {
      ai = null;
    }
    return (
      <div className="tab-body narrow">
        <Card
          title={
            <div className="doc-head-text">
              <p className="eyebrow">Correção</p>
              <h2 className="card-title">Compare as suas respostas com o gabarito e lance a nota</h2>
            </div>
          }
        >
          <div className="doc-answers">
            <p className="eyebrow">As suas respostas</p>
            <p className="answer-text">{String(grading.answers.all ?? "")}</p>
          </div>
        </Card>
        <article className="card prose doc-md">
          <Markdown src={d.files.gabarito ?? ""} ctx={{ images: d.images }} />
        </article>
        {sample && (
          <div className="grading-ai">
            <Button variant="secondary" icon="sparkle" onClick={ask} disabled={busy}>
              {busy ? "O Claude está a corrigir…" : "Corrigir com o Claude"}
            </Button>
            {err && <p className="tutor-err">{err}</p>}
          </div>
        )}
        {ai?.perguntas && (
          <Card title={`Proposta do Claude: ${fmtScore(Number(ai.total) || 0)} valores`}>
            <ul className="tasks">
              {ai.perguntas.map((p: any, i: number) => (
                <li key={i} className="row-item doc-q">
                  <span className="doc-q-n mono">{p.numero}</span>
                  <span className="doc-q-text">{p.comentario}</span>
                  <span className="doc-q-pts mono">
                    {fmtScore(Number(p.valores) || 0)}/{fmtScore(Number(p.maximo) || 0)}
                  </span>
                </li>
              ))}
            </ul>
            {ai.resumo && <p className="doc-ai-sum">{ai.resumo}</p>}
            {Array.isArray(ai.rever) && ai.rever.length > 0 && <p className="muted small">Rever: {ai.rever.join("; ")}</p>}
          </Card>
        )}
        <form
          className="grading-foot"
          onSubmit={(e) => {
            e.preventDefault();
            const v = Number(manual.replace(",", "."));
            if (isFinite(v) && v >= 0 && v <= 20) finish(grading.id, v, ai?.resumo);
          }}
        >
          <div className="doc-score">
            <label htmlFor={`doc-score-${id}`}>Nota final (0 a 20)</label>
            <input id={`doc-score-${id}`} className="input input-sm doc-score-input mono" inputMode="decimal" value={manual} onChange={(e) => setManual(e.target.value)} />
          </div>
          <Button variant="primary" type="submit" icon="check">
            Concluir
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="tab-body narrow">
      {last && (
        <section className={`card result ${last.passed ? "is-pass" : "is-fail"}`}>
          <div className="result-score">
            <span className="big-score mono">{fmtScore(last.score ?? 0)}</span>
            <span className="muted small">de 20 valores</span>
          </div>
          <div className="result-body">
            <p className="eyebrow">Última prova · {fmtDateTime(last.submittedAt ?? last.startedAt)}</p>
            <h2>{last.passed ? "Aprovado." : "Abaixo de 14. Reveja a apostila e repita daqui a uma semana."}</h2>
          </div>
        </section>
      )}
      <section className="card exam-card">
        <div className="doc-start">
          <span className="doc-ico" aria-hidden="true">
            <Icon name="timer" size={16} />
          </span>
          <div className="doc-head-text">
            <p className="eyebrow">Prova do {id}</p>
            <h2 className="card-title">
              {DOC_EXAM_MIN} minutos · sem consulta · 20 valores
            </h2>
            <p className="muted small">O enunciado só aparece quando começar. Escreva as respostas numeradas; no fim, corrija com o gabarito (ou com o Claude) e lance a nota.</p>
          </div>
        </div>
        <div className="doc-actions-main">
          {locked ? (
            <p className="doc-lock-line">
              <Icon name="lock" size={14} /> Pode repetir a prova a partir de {fmtDateTime(locked)}.
            </p>
          ) : (
            <ConfirmButton
              label={last ? "Repetir a prova" : "Começar a prova"}
              confirmLabel={`Começar agora (${DOC_EXAM_MIN} min)`}
              question="O cronómetro começa já."
              icon="timer"
              variant="primary"
              onConfirm={() =>
                setMod((m) => {
                  const now = Date.now();
                  m.attempts.push({ id: uid(), startedAt: now, deadline: now + DOC_EXAM_MIN * 60_000, answers: { all: "" }, status: "running" });
                })
              }
            />
          )}
        </div>
      </section>
    </div>
  );
}

export function DocExamRunner({ id, attempt, save, onSubmit }: { id: string; attempt: Attempt; save: (r: (a: Attempt) => void) => void; onSubmit: () => void }) {
  const d = DOCS[id];
  const now = useNow(1000);
  const left = attempt.deadline - now;
  React.useEffect(() => {
    if (left <= 0) onSubmit();
  }, [left, onSubmit]);
  return (
    <div className="exam-shell">
      <header className="exam-bar">
        <div className="exam-bar-title">
          <span className="eyebrow">Prova em curso · sem consulta</span>
          <span className="exam-name">
            {id} — {moduleMeta(id).title}
          </span>
        </div>
        <div className={`exam-clock ${left < 5 * 60_000 ? "is-low" : ""}`} role="timer">
          <Icon name="timer" size={18} />
          <span className="mono">{fmtClock(left)}</span>
        </div>
        <ConfirmButton label="Entregar" confirmLabel="Entregar agora" question="Entregar a prova?" onConfirm={onSubmit} variant="primary" size="sm" />
      </header>
      <main className="exam-body exam-doc">
        <article className="card prose doc-md">
          <Markdown src={d.files.prova ?? ""} ctx={{ images: d.images }} />
        </article>
        <div className="exam-doc-answers">
          <label htmlFor={`doc-exam-${attempt.id}`} className="eyebrow">
            Respostas
          </label>
          <textarea
            id={`doc-exam-${attempt.id}`}
            className="input doc-exam-area"
            rows={24}
            value={String(attempt.answers.all ?? "")}
            placeholder={"1. B\n2. …\n9. …"}
            onChange={(e) => {
              const v = e.target.value;
              save((a) => {
                a.answers = { ...a.answers, all: v };
              });
            }}
          />
        </div>
      </main>
    </div>
  );
}
