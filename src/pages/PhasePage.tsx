import React, { useEffect, useRef, useState } from "react";
import { CLOSINGS, CONTENT, PHASE_DOCS } from "../content";
import { moduleMeta, phaseMeta } from "../content/course";
import type { PhaseClosing, PhaseMeta } from "../content/types";
import {
  allQuestions,
  closingAttempts,
  closingWeakModules,
  gradingAttempt,
  lastDone,
  newAttempt,
  phaseExam,
  phaseRetakeLockedUntil,
  phaseSpecFor,
  questionPoints,
  totalScore,
} from "../lib/exam";
import { fmtDateTime, fmtScore, fmtShort } from "../lib/dates";
import { Markdown, renderInline } from "../lib/md";
import { phaseClosingState, phasePassRule, phaseRubric, type PhaseClosingState } from "../lib/progress";
import { useRouter, type PhaseTab } from "../lib/router";
import { computeSchedule } from "../lib/schedule";
import { readMod, useCore, useStore, type Attempt } from "../lib/store";
import { Blocks, type BlocksCtx } from "../components/Blocks";
import { Grading } from "../components/exam/Grading";
import { NotebookButton } from "../components/NotebookButton";
import { Button, Card, Chip, ConfirmButton, Empty, Icon, PageHeader, Seg, StatTile } from "../components/ui";
import { ProjectForm, rubricMax, rubricTotal, useProject } from "./Projects";

// Fecho de fase: plano da semana, exame, mini-projeto e gabarito.
// Fases com fecho oficial (CLOSINGS) usam o exame e o mini-projeto da pasta do curso; as outras usam
// o exame gerado com perguntas das provas dos módulos e, se houver, os documentos da pasta da fase.

const TABS: { id: PhaseTab; label: string; icon: string }[] = [
  { id: "plano", label: "Plano", icon: "list" },
  { id: "exame", label: "Exame", icon: "timer" },
  { id: "projeto", label: "Mini-projeto", icon: "folder" },
  { id: "gabarito", label: "Gabarito", icon: "eye" },
];

/** Ações sobre as tentativas do exame de uma fase (core.phaseExams[fase]). */
export function usePhaseExam(phase: string) {
  const [core, setCore] = useCore();
  const attempts = core.phaseExams[phase] ?? [];
  const save = (id: string, recipe: (a: Attempt) => void) =>
    setCore((c) => {
      const a = (c.phaseExams[phase] ?? []).find((x) => x.id === id);
      if (a) recipe(a);
    });
  const finish = (id: string) =>
    setCore((c) => {
      const a = (c.phaseExams[phase] ?? []).find((x) => x.id === id);
      if (!a) return;
      const spec = phaseSpecFor(phase, a);
      a.score = Math.round(totalScore(spec, a) * 100) / 100;
      a.passed = a.score >= spec.pass;
      a.status = "done";
    });
  const submit = (id: string) =>
    setCore((c) => {
      const a = (c.phaseExams[phase] ?? []).find((x) => x.id === id);
      if (!a || a.status !== "running") return;
      const spec = phaseSpecFor(phase, a);
      a.submittedAt = Date.now();
      if (allQuestions(spec).some((q) => q.kind === "open")) {
        a.status = "grading";
      } else {
        a.score = Math.round(totalScore(spec, a) * 100) / 100;
        a.passed = a.score >= spec.pass;
        a.status = "done";
      }
    });
  const start = () => {
    const cl = CLOSINGS[phase];
    if (cl) {
      setCore((c) => {
        const list = c.phaseExams[phase] ?? [];
        if (list.some((a) => a.status === "running")) return;
        c.phaseExams[phase] = [...list, newAttempt(cl.exam)];
      });
      return;
    }
    const info = phaseExam(phase, Date.now());
    if (!info.ready) return;
    const picked = allQuestions(info.spec).map((q) => q.id);
    setCore((c) => {
      const list = c.phaseExams[phase] ?? [];
      if (list.some((a) => a.status === "running")) return;
      c.phaseExams[phase] = [...list, newAttempt(info.spec, picked)];
    });
  };
  return { attempts, save, finish, submit, start };
}

export function PhasePage({ phase, tab }: { phase: string; tab: PhaseTab }) {
  const { navigate } = useRouter();
  const [core] = useCore();
  const ph = phaseMeta(phase);
  const cl = CLOSINGS[phase];
  const st = phaseClosingState(phase, core);
  const end = computeSchedule(core.settings.startDate).phases[phase]?.end;
  const toCourse = () => navigate({ page: "percurso" });
  const go = (t: PhaseTab) => navigate({ page: "fase", phase, tab: t });

  // No telemóvel os separadores deslizam na horizontal: manter o ativo à vista.
  const tabsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const bar = tabsRef.current?.querySelector<HTMLElement>(".seg");
    const on = bar?.querySelector<HTMLElement>(".is-on");
    if (!bar || !on) return;
    const b = bar.getBoundingClientRect();
    const r = on.getBoundingClientRect();
    if (r.left < b.left || r.right > b.right) bar.scrollLeft += r.left - b.left - (b.width - r.width) / 2;
  }, [tab, phase]);

  const done: Partial<Record<PhaseTab, boolean>> = { plano: st.done, exame: st.examPassed, projeto: st.projectPassed };

  return (
    <div className="page phase-page">
      <PageHeader
        crumbs={[
          { label: "Percurso", icon: "route", onClick: toCourse },
          { label: `Fase ${ph.num} · ${ph.title}`, onClick: toCourse },
          { label: "Fecho da fase" },
        ]}
        title={`Fecho da Fase ${ph.num}`}
        subtitle={
          <>
            <Chip>
              <span className="mono">{ph.id}</span>
            </Chip>
            <span className="phase-meta">Exame e mini-projeto</span>
            {end && <span className="phase-meta">Previsto até {fmtShort(end)}</span>}
            <StateChip st={st} />
          </>
        }
      />

      <div className="phase-tabs" ref={tabsRef}>
        <Seg
          scroll
          label="Partes do fecho da fase"
          value={tab}
          onChange={(t) => go(t as PhaseTab)}
          options={TABS.map((t) => ({ id: t.id, label: t.label, icon: t.icon, done: !!done[t.id] }))}
        />
      </div>

      {tab === "plano" && <PlanTab ph={ph} cl={cl} st={st} />}
      {tab === "exame" && (cl ? <ClosingExamTab ph={ph} cl={cl} /> : <GeneratedExamTab ph={ph} />)}
      {tab === "projeto" && (cl ? <ClosingProjectTab ph={ph} cl={cl} /> : <DocProjectTab ph={ph} />)}
      {tab === "gabarito" && (cl ? <ClosingKeyTab ph={ph} cl={cl} /> : <DocKeyTab ph={ph} />)}
    </div>
  );
}

function StateChip({ st }: { st: PhaseClosingState }) {
  if (st.done) return <Chip tone="ok">Fase concluída</Chip>;
  if (st.examBest !== undefined || st.projectScore > 0) return <Chip tone="accent">Em curso</Chip>;
  return <Chip>Por começar</Chip>;
}

// ---------- Plano

function PlanTab({ ph, cl, st }: { ph: PhaseMeta; cl?: PhaseClosing; st: PhaseClosingState }) {
  const { navigate } = useRouter();
  const rule = phasePassRule(ph.id);
  const go = (t: PhaseTab) => navigate({ page: "fase", phase: ph.id, tab: t });
  const next = `Fase ${ph.num + 1}`;
  const missing: string[] = [];
  if (!st.examPassed) missing.push(`${rule.exam} ou mais no exame`);
  if (!st.projectPassed) missing.push(`o mini-projeto entregue com ${rule.project} ou mais`);

  return (
    <div className="tab-body narrow">
      <Card title="Como funciona o fecho da fase">
        <p className="phase-lede">
          {cl
            ? renderInline(cl.intro)
            : `${ph.closing.exam} Mini-projeto: ${ph.closing.project.title}. Passa-se à ${next} com ${rule.exam} ou mais valores no exame e ${rule.project} ou mais no mini-projeto.`}
        </p>
        {cl && (
          <ul className="tasks" aria-label="Sessões da semana de fecho">
            {cl.sessions.map((s) => (
              <li key={s.label} className="row-item phase-session">
                <span className="phase-session-name">{s.label}</span>
                <span className="phase-session-what">{renderInline(s.what)}</span>
                <span className="phase-session-time">{s.time}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Regra de passagem" ariaLabel="Regra de passagem">
        <div className="grid-2">
          <StatTile
            label="Exame · melhor nota"
            value={st.examBest !== undefined ? fmtScore(st.examBest) : "—"}
            unit="/ 20"
            note={`Aprovação com ${rule.exam} · ${st.examPassed ? "aprovado" : st.examBest === undefined ? "por fazer" : `abaixo de ${rule.exam}`}`}
            illus="clock"
            onClick={() => go("exame")}
          />
          <StatTile
            label="Mini-projeto · autoavaliação"
            value={fmtScore(st.projectScore)}
            unit={`/ ${st.projectMax}`}
            note={`Aprovação com ${rule.project} · ${st.projectPassed ? "entregue e aprovado" : st.projectScore >= rule.project ? "falta marcar como entregue" : "por concluir"}`}
            illus="folder"
            onClick={() => go("projeto")}
          />
        </div>
        <div className={`phase-verdict ${st.done ? "is-done" : ""}`} role="status">
          <Icon name={st.done ? "check" : "flag"} size={16} />
          {st.done ? (
            <p>
              <strong>Fase concluída.</strong> Pode passar à {next}.
            </p>
          ) : (
            <p>
              <strong>Para passar à {next}</strong> falta {missing.join(" e ")}.
            </p>
          )}
        </div>
      </Card>

      {cl && (
        <>
          <aside className="callout callout-info">
            <p className="callout-title">Repetir</p>
            <p>{renderInline(cl.retakeNote)}</p>
          </aside>
          {cl.portfolioNote && (
            <aside className="callout callout-key">
              <p className="callout-title">Portfólio</p>
              <p>{renderInline(cl.portfolioNote)}</p>
            </aside>
          )}
        </>
      )}
    </div>
  );
}

// ---------- Exame oficial

function ClosingExamTab({ ph, cl }: { ph: PhaseMeta; cl: PhaseClosing }) {
  const { docs } = useStore();
  const [core] = useCore();
  const { navigate } = useRouter();
  const { attempts, save, finish, start } = usePhaseExam(ph.id);
  const spec = cl.exam;
  const grading = gradingAttempt(attempts);
  const official = closingAttempts(ph.id, attempts);
  const last = lastDone(official);
  const passed = official.some((a) => a.status === "done" && a.passed);
  const locked = phaseRetakeLockedUntil(official, core.settings.allowEarlyRetake);
  const qs = allQuestions(spec);

  if (grading) {
    return (
      <div className="tab-body narrow exam-tab">
        <Grading
          title={`exame da Fase ${ph.num}`}
          spec={phaseSpecFor(ph.id, grading)}
          attempt={grading}
          content={null}
          moduleId={ph.id}
          save={(r) => save(grading.id, r)}
          onFinish={() => finish(grading.id)}
        />
      </div>
    );
  }

  return (
    <div className="tab-body narrow exam-tab">
      {last && <ClosingResult ph={ph} cl={cl} a={last} />}

      <section className="card exam-card" aria-labelledby="phase-exam-title">
        <header className="card-head">
          <div className="exam-card-head">
            <h2 id="phase-exam-title" className="card-title">
              Exame da Fase {ph.num}
            </h2>
            <p className="exam-card-meta">
              {spec.minutes} minutos · {spec.total} valores · {qs.length} perguntas
            </p>
          </div>
          <Chip tone="neutral">Aprovação com {spec.pass}</Chip>
        </header>
        <ul className="tasks" aria-label="Grupos do exame">
          {spec.groups.map((g) => (
            <li key={g.title} className="row-item">
              <Icon name="file" size={15} />
              <span className="exam-row-main">{g.title}</span>
              <span className="exam-row-meta">
                {g.questions.length} {g.questions.length === 1 ? "pergunta" : "perguntas"}
              </span>
            </li>
          ))}
        </ul>
        <p className="exam-rules">{renderInline(cl.examRules)}</p>
        <p className="exam-rules">
          Durante o exame só se vê o exame: a aula, as apostilas, as notas e o tutor ficam fechados. A escolha múltipla corrige-se sozinha; as perguntas abertas corrige-as
          com os critérios do gabarito, por si ou com a ajuda do Claude.
        </p>
        <div className="exam-pre">
          <p className="eyebrow">Antes de começar: as provas dos módulos da fase</p>
          <ul className="exam-pre-list">
            {ph.modules.map((m) => {
              const mod = readMod(docs, m);
              const ok = !!mod.passedAt;
              return (
                <li key={m} className={`row-item ${ok ? "is-ok" : ""}`}>
                  <Icon name={ok ? "check" : "info"} size={15} />
                  <span className="exam-row-main">{m}</span>
                  <span className="exam-row-meta">{ok ? `aprovado${mod.best !== undefined ? ` · ${fmtScore(mod.best)}` : ""}` : "prova por passar"}</span>
                </li>
              );
            })}
          </ul>
        </div>
        {locked ? (
          <div className="exam-locked">
            <Icon name="lock" size={16} />
            <div className="exam-locked-body">
              <p>
                <strong>Pode repetir o exame a partir de {fmtDateTime(locked)}.</strong> Até lá: rever as secções indicadas no gabarito e refazer as perguntas falhadas nas provas
                dos módulos.
              </p>
              <Button variant="secondary" size="sm" onClick={() => navigate({ page: "fase", phase: ph.id, tab: "gabarito" })}>
                Ver o gabarito
              </Button>
            </div>
          </div>
        ) : (
          <div className="exam-start">
            <ConfirmButton
              label={passed ? "Fazer o exame outra vez" : last ? "Repetir o exame" : "Começar o exame"}
              confirmLabel={`Começar agora (${spec.minutes} min)`}
              question="O cronómetro começa já e o resto da plataforma fica fechado."
              onConfirm={start}
              variant={passed ? "secondary" : "primary"}
              icon="timer"
            />
          </div>
        )}
      </section>

      <History attempts={official} pass={spec.pass} />
    </div>
  );
}

function ClosingResult({ ph, cl, a }: { ph: PhaseMeta; cl: PhaseClosing; a: Attempt }) {
  const { navigate } = useRouter();
  const weak = closingWeakModules(ph.id, a);
  return (
    <section className={`card result ${a.passed ? "is-pass" : "is-fail"}`} aria-label="Último exame">
      <div className="result-score">
        <span className="big-score mono">{fmtScore(a.score ?? 0)}</span>
        <span className="muted">de {cl.exam.total} valores</span>
      </div>
      <div className="result-body">
        <p className="eyebrow">Último exame · {fmtDateTime(a.submittedAt ?? a.startedAt)}</p>
        <h2 className="exam-result-title">{a.passed ? "Exame aprovado." : `Abaixo de ${cl.exam.pass}. Reveja durante uma semana e repita o exame.`}</h2>
        {weak.length > 0 && (
          <>
            <p className="exam-result-note">Módulos a rever, pelas perguntas que não tiveram a cotação toda (tabela do gabarito):</p>
            <ul className="tasks">
              {weak.map((w) => (
                <li key={w.module}>
                  <button type="button" className="row-item" onClick={() => navigate({ page: "modulo", id: w.module, tab: "apostila" })}>
                    <Icon name="book" size={15} />
                    <span className="exam-row-main">
                      {w.module} — {moduleMeta(w.module).title}
                    </span>
                    <span className="exam-row-meta">
                      {w.questions.length === 1 ? "pergunta" : "perguntas"} {w.questions.join(", ")}
                    </span>
                    <Icon name="right" size={14} />
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
        {!a.passed && <p className="exam-result-note">{renderInline(cl.retakeNote)}</p>}
        <div className="row gap-sm wrap">
          <Button size="sm" variant="secondary" icon="eye" onClick={() => navigate({ page: "fase", phase: ph.id, tab: "gabarito" })}>
            Ver a correção no gabarito
          </Button>
        </div>
      </div>
    </section>
  );
}

function History({ attempts, pass }: { attempts: Attempt[]; pass: number }) {
  const done = attempts.filter((a) => a.status === "done");
  if (!done.length) return null;
  return (
    <Card title="Tentativas">
      <ol className="tasks exam-history">
        {done.map((a, i) => (
          <li key={a.id} className="row-item">
            <span className="exam-hist-n">{i + 1}</span>
            <span className="exam-row-main">{fmtDateTime(a.submittedAt ?? a.startedAt)}</span>
            <span className="exam-hist-score">{fmtScore(a.score ?? 0)} valores</span>
            <Chip tone={a.passed ? "ok" : "warn"}>{a.passed ? "aprovado" : `abaixo de ${pass}`}</Chip>
          </li>
        ))}
      </ol>
    </Card>
  );
}

// ---------- Exame gerado (fases sem fecho oficial)

function GeneratedExamTab({ ph }: { ph: PhaseMeta }) {
  const { docs } = useStore();
  const [core] = useCore();
  const { navigate } = useRouter();
  const { attempts, save, finish, start } = usePhaseExam(ph.id);
  const info = phaseExam(ph.id);
  const grading = gradingAttempt(attempts);
  const last = lastDone(attempts);
  const locked = phaseRetakeLockedUntil(attempts, core.settings.allowEarlyRetake);
  const notPassed = ph.modules.filter((m) => !readMod(docs, m).passedAt);
  const pd = PHASE_DOCS[ph.id];

  return (
    <div className="tab-body narrow exam-tab">
      {grading ? (
        <Grading
          title={`exame da Fase ${ph.num}`}
          spec={phaseSpecFor(ph.id, grading)}
          attempt={grading}
          content={null}
          moduleId={ph.id}
          save={(r) => save(grading.id, r)}
          onFinish={() => finish(grading.id)}
        />
      ) : !info.ready ? (
        <Empty icon="lock" title="O exame fica disponível quando todos os módulos da fase tiverem versão interativa">
          <p>Em falta: {info.missing.map((m) => `${m} (${moduleMeta(m).title})`).join(", ")}.</p>
          <Button variant="secondary" onClick={() => navigate({ page: "percurso" })}>
            Ver o percurso
          </Button>
        </Empty>
      ) : (
        <section className="card exam-card" aria-labelledby="phase-exam-title">
          <header className="card-head">
            <div className="exam-card-head">
              <h2 className="card-title" id="phase-exam-title">
                Fase {ph.num} · {ph.title}
              </h2>
              <p className="exam-card-meta">90 minutos · sem consulta · 20 valores</p>
            </div>
            {last ? <Chip tone={last.passed ? "ok" : "warn"}>{last.passed ? "aprovado" : "abaixo de 14"}</Chip> : <Chip>Aprovação com 14</Chip>}
          </header>
          <p className="exam-rules">
            {ph.closing.exam} As perguntas são sorteadas das provas de todos os módulos da fase ({ph.modules.filter((m) => CONTENT[m]).join(", ")}).
          </p>
          {last && (
            <p className="muted small">
              Última tentativa: <span className="mono">{fmtScore(last.score ?? 0)}</span> valores a {fmtDateTime(last.submittedAt ?? last.startedAt)}
            </p>
          )}
          {notPassed.length > 0 && <p className="muted small">Recomendado antes do exame: passar nas provas de {notPassed.join(", ")}.</p>}
          {locked ? (
            <div className="exam-locked">
              <Icon name="lock" size={16} />
              <div className="exam-locked-body">
                <p>
                  <strong>Pode repetir o exame a partir de {fmtDateTime(locked)}.</strong> Até lá: rever as apostilas e as provas dos módulos da fase.
                </p>
              </div>
            </div>
          ) : (
            <div className="exam-start">
              <ConfirmButton
                label={last ? "Fazer outra vez" : "Começar o exame"}
                confirmLabel="Começar agora (90 min)"
                question="O cronómetro começa já."
                onConfirm={start}
                variant="primary"
                icon="timer"
              />
            </div>
          )}
        </section>
      )}
      {!grading && <History attempts={attempts} pass={14} />}
      {pd?.files.exame && (
        <details className="card phase-doc">
          <summary className="phase-doc-summary">
            <Icon name="caret" size={14} />
            Enunciado do exame oficial (documento da pasta do curso)
          </summary>
          <Markdown src={pd.files.exame} ctx={{ images: pd.images }} skipTitle />
        </details>
      )}
    </div>
  );
}

// ---------- Mini-projeto

/** Título da nota das perguntas: "Pergunta N" quando a nota fala de uma pergunta (F0: "A pergunta 5 é…"). */
function noteTitle(note: string): string {
  const m = /\bpergunta (\d+)/i.exec(note);
  return m ? `Pergunta ${m[1]}` : "Nota";
}

const NUM_WORDS = ["", "uma", "duas", "três", "quatro", "cinco", "seis", "sete", "oito", "nove", "dez"];

/** Legenda do notebook inicial, com o número de partes da lista ordenada de "O que entregar". */
function notebookCaption(cl: PhaseClosing): string {
  const list = cl.project.deliverables.find((b) => b.t === "list" && b.ordered);
  const n = list && list.t === "list" ? list.items.length : 0;
  const parts = n > 0 ? `pelas ${NUM_WORDS[n] ?? n} partes` : "pelas partes do que entregar";
  return `Já organizado ${parts}, com o carregamento dos dados e uma célula por pergunta.`;
}

/** Enunciado de uma pergunta do mini-projeto. Linhas "- …" no texto viram uma lista (alíneas do original). */
function ProjectQuestionText({ title, text }: { title: string; text: string }) {
  const lines = text.split("\n");
  if (lines.length === 1) {
    return (
      <>
        <strong>{title}</strong> {renderInline(text)}
      </>
    );
  }
  const out: React.ReactNode[] = [];
  let items: string[] = [];
  let first = true;
  const flush = () => {
    if (items.length === 0) return;
    out.push(
      <ul key={`l${out.length}`}>
        {items.map((it, i) => (
          <li key={i}>{renderInline(it)}</li>
        ))}
      </ul>,
    );
    items = [];
  };
  for (const line of lines) {
    if (line.startsWith("- ")) {
      items.push(line.slice(2));
      continue;
    }
    flush();
    if (!line.trim()) continue;
    out.push(
      <p key={`p${out.length}`}>
        {first && (
          <>
            <strong>{title}</strong>{" "}
          </>
        )}
        {renderInline(line)}
      </p>,
    );
    first = false;
  }
  flush();
  return <>{out}</>;
}

function ClosingProjectTab({ ph, cl }: { ph: PhaseMeta; cl: PhaseClosing }) {
  const { navigate } = useRouter();
  const [st] = useProject(ph.id);
  const ctx: BlocksCtx = { moduleId: ph.id };
  const rubric = cl.project.rubric;
  const total = rubricTotal(rubric, st);
  const max = rubricMax(rubric);
  const ok = st.status === "entregue" && total >= cl.passRule.project;

  return (
    <div className="tab-body narrow">
      <Card title={cl.project.title} ariaLabel="Enunciado do mini-projeto">
        <div className="prose phase-prose">
          <Blocks blocks={cl.project.intro} ctx={ctx} />
          <ol className="phase-questions">
            {cl.project.questions.map((q) => (
              <li key={q.n}>
                <ProjectQuestionText title={q.title} text={q.text} />
              </li>
            ))}
          </ol>
          {cl.project.questionsNote && (
            <aside className="callout callout-key">
              <p className="callout-title">{noteTitle(cl.project.questionsNote)}</p>
              <p>{renderInline(cl.project.questionsNote)}</p>
            </aside>
          )}
        </div>
      </Card>

      <Card title="O que entregar" ariaLabel="O que entregar">
        <div className="prose phase-prose">
          <Blocks blocks={cl.project.deliverables} ctx={ctx} />
        </div>
        {cl.notebook && (
          <div className="phase-notebook">
            <NotebookButton notebook={cl.notebook} label="Notebook inicial" />
            <span className="phase-notebook-note">{notebookCaption(cl)}</span>
          </div>
        )}
      </Card>

      {cl.project.extra && (
        <Card title={cl.project.extra.title} ariaLabel={cl.project.extra.title}>
          <div className="prose phase-prose">
            <Blocks blocks={cl.project.extra.blocks} ctx={ctx} />
          </div>
        </Card>
      )}

      <Card
        title={`Grelha de avaliação (${max} valores)`}
        ariaLabel="Grelha de avaliação"
        actions={
          <>
            <Chip tone={ok ? "ok" : "neutral"}>Aprovação com {cl.passRule.project}</Chip>
            <span className="phase-total mono">
              {fmtScore(total)}
              <span className="phase-total-max">/{max}</span>
            </span>
          </>
        }
      >
        <p className="phase-note">
          Autoavaliação com a grelha oficial. Conta para a regra de passagem quando o estado for "Entregue". O mini-projeto pode ser melhorado e entregue de novo as vezes que for
          preciso.
        </p>
        <ProjectForm id={ph.id} rubric={rubric} />
        <div className="phase-key-hint">
          <Icon name="lock" size={14} />
          <span>Os valores de referência para conferir as respostas estão no gabarito. Abrir só depois de terminar.</span>
          <Button size="sm" variant="ghost" iconRight="arrowRight" onClick={() => navigate({ page: "fase", phase: ph.id, tab: "gabarito" })}>
            Gabarito
          </Button>
        </div>
      </Card>

      {cl.project.references.length > 0 && (
        <Card title="Referências" ariaLabel="Referências">
          <ul className="phase-refs">
            {cl.project.references.map((r, i) => (
              <li key={i}>
                {renderInline(r.text)}
                {r.href && (
                  <>
                    {" "}
                    <a href={r.href} target="_blank" rel="noopener noreferrer" className="phase-ref-link">
                      Abrir <Icon name="external" size={12} />
                    </a>
                  </>
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

function DocProjectTab({ ph }: { ph: PhaseMeta }) {
  const pd = PHASE_DOCS[ph.id];
  const rule = phasePassRule(ph.id);
  const rubric = phaseRubric(ph.id);
  return (
    <div className="tab-body narrow">
      <Card title={ph.closing.project.title} ariaLabel="Mini-projeto">
        <p className="phase-lede">{ph.closing.project.description}</p>
        {pd?.files.miniprojeto ? (
          <Markdown src={pd.files.miniprojeto} ctx={{ images: pd.images }} skipTitle />
        ) : (
          <p className="phase-note">O enunciado oficial chega com o material da fase. Até lá, a grelha abaixo é uma proposta da plataforma.</p>
        )}
      </Card>
      {rubric.length > 0 && (
        <Card title="Grelha de avaliação" ariaLabel="Grelha de avaliação" actions={<Chip>Aprovação com {rule.project}</Chip>}>
          <ProjectForm id={ph.id} rubric={rubric} />
        </Card>
      )}
    </div>
  );
}

// ---------- Gabarito

function ClosingKeyTab({ ph, cl }: { ph: PhaseMeta; cl: PhaseClosing }) {
  const [core] = useCore();
  const { navigate } = useRouter();
  const [st] = useProject(ph.id);
  const [peek, setPeek] = useState(false);
  const attempts = closingAttempts(ph.id, core.phaseExams[ph.id] ?? []);
  const examOpen = attempts.some((a) => a.status !== "running");
  const examDone = lastDone(attempts);
  const keyOpen = st.status === "entregue" || peek;
  const ctx: BlocksCtx = { moduleId: ph.id };
  const go = (t: PhaseTab) => navigate({ page: "fase", phase: ph.id, tab: t });

  return (
    <div className="tab-body narrow gab-tab">
      <aside className="callout callout-warn">
        <p className="callout-title">Gabarito</p>
        <p>
          As soluções do exame abrem depois de o entregar; os valores de referência do mini-projeto, depois de o marcar como entregue. Nas perguntas abertas o que conta é o
          raciocínio: as respostas-modelo são uma das formas certas de responder.
        </p>
      </aside>

      <section className="gab-section" aria-labelledby="g-exame">
        <h2 className="gab-section-title" id="g-exame">
          Exame
        </h2>
        {!examOpen ? (
          <article className="card gab is-locked">
            <div className="gab-locked-row">
              <Icon name="lock" size={16} />
              <span className="gab-locked-text">As soluções do exame abrem depois de o entregar.</span>
              <Button size="sm" variant="secondary" onClick={() => go("exame")}>
                Ir ao exame
              </Button>
            </div>
          </article>
        ) : (
          <>
            {cl.exam.groups.map((g) => (
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
                Se a nota ficar abaixo de {cl.exam.pass}
              </h3>
              <p className="gab-review-note">{renderInline(cl.retakeNote)}</p>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Perguntas</th>
                      <th scope="col">Módulo a rever</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cl.examReview.map((r) => (
                      <tr key={r.module}>
                        <td className="mono gab-review-qs">{r.questions.join(", ")}</td>
                        <td>
                          <button type="button" className="link-btn" onClick={() => navigate({ page: "modulo", id: r.module, tab: "apostila" })}>
                            {r.module} — {moduleMeta(r.module).title}
                          </button>
                          {r.sections && r.sections.length > 0 && (
                            <span className="muted small">
                              {" "}
                              · secções {r.sections.slice(0, -1).join(", ")}
                              {r.sections.length > 1 ? " e " : ""}
                              {r.sections[r.sections.length - 1]}
                            </span>
                          )}
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

      <section className="gab-section" aria-labelledby="g-projeto">
        <h2 className="gab-section-title" id="g-projeto">
          Mini-projeto: valores de referência
        </h2>
        {keyOpen ? (
          <article className="card gab">
            {st.status !== "entregue" && (
              <header className="gab-head">
                <div className="gab-head-text">
                  <h3 className="gab-title">{cl.project.title}</h3>
                </div>
                <Chip>Aberto antes de entregar</Chip>
              </header>
            )}
            <div className="prose phase-prose">
              <Blocks blocks={cl.projectKey} ctx={ctx} />
            </div>
          </article>
        ) : (
          <article className="card gab is-locked">
            <div className="gab-locked-row">
              <Icon name="lock" size={16} />
              <span className="gab-locked-text">Abrem quando marcar o mini-projeto como entregue.</span>
              <Button size="sm" variant="secondary" onClick={() => go("projeto")}>
                Ir ao mini-projeto
              </Button>
              <ConfirmButton
                size="sm"
                variant="ghost"
                label="Mostrar mesmo assim"
                confirmLabel="Mostrar"
                question="Sem terminar, aprende menos. Mostrar?"
                onConfirm={() => setPeek(true)}
              />
            </div>
          </article>
        )}
      </section>
    </div>
  );
}

function DocKeyTab({ ph }: { ph: PhaseMeta }) {
  const [core] = useCore();
  const { navigate } = useRouter();
  const [peek, setPeek] = useState(false);
  const pd = PHASE_DOCS[ph.id];
  const submitted = (core.phaseExams[ph.id] ?? []).some((a) => a.status !== "running");
  if (!pd?.files.gabarito) {
    return (
      <div className="tab-body narrow">
        <Empty icon="eye" title="Sem gabarito em documento">
          <p>A correção do exame gerado faz-se no separador Exame, com as respostas-modelo e os critérios das provas dos módulos.</p>
        </Empty>
      </div>
    );
  }
  return (
    <div className="tab-body narrow gab-tab">
      {submitted || peek ? (
        <article className="card gab">
          <Markdown src={pd.files.gabarito} ctx={{ images: pd.images }} skipTitle />
        </article>
      ) : (
        <article className="card gab is-locked">
          <div className="gab-locked-row">
            <Icon name="lock" size={16} />
            <span className="gab-locked-text">O gabarito abre depois de entregar o exame.</span>
            <Button size="sm" variant="secondary" onClick={() => navigate({ page: "fase", phase: ph.id, tab: "exame" })}>
              Ir ao exame
            </Button>
            <ConfirmButton size="sm" variant="ghost" label="Mostrar mesmo assim" confirmLabel="Mostrar" question="Sem tentar, aprende menos. Mostrar?" onConfirm={() => setPeek(true)} />
          </div>
        </article>
      )}
    </div>
  );
}
