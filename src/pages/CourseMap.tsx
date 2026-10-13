import React from "react";
import { COURSE, MODULES, MODULE_PARTS, PHASES } from "../content/course";
import { isDocOnly, isInteractive } from "../content";
import { fmtDayMonth, fmtShort } from "../lib/dates";
import { closingAttempts, lastDone } from "../lib/exam";
import { STATUS_LABEL, moduleParts, moduleStatus, phaseClosingState, phaseClosingSummary, phaseFraction } from "../lib/progress";
import { useRouter } from "../lib/router";
import { computeSchedule } from "../lib/schedule";
import { readMod, useCore, useStore } from "../lib/store";
import { Bar, Button, Card, Chip, FolderCard, PageHeader, PartsStack } from "../components/ui";

export function CourseMap() {
  const { docs } = useStore();
  const [core] = useCore();
  const { navigate } = useRouter();
  const s = computeSchedule(core.settings.startDate);

  return (
    <div className="page">
      <PageHeader crumbs={[{ label: "Percurso", icon: "route" }]} title="Percurso" subtitle={COURSE.summary} />

      <Card className="course-how">
        <div className="course-how-grid">
          <div className="course-how-col">
            <div className="course-how-head">
              <h2 className="card-title">Como é cada módulo</h2>
              <p className="course-how-note">Cerca de 6 horas, ou 2 semanas.</p>
            </div>
            <ul className="tasks">
              {MODULE_PARTS.map((p) => (
                <li key={p.id} className="row-item course-part">
                  <span className="course-part-name">{p.label}</span>
                  <span className="course-part-what">{p.what}</span>
                  <span className="course-part-time">{p.time}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="course-how-col">
            <div className="course-how-head">
              <h2 className="card-title">Avaliação</h2>
            </div>
            <ul className="course-rules">
              <li>
                <strong>Prova de módulo</strong>, de 0 a 20 valores: avançar com 14 ou mais. Abaixo disso, rever a apostila e repetir a prova uma semana depois.
              </li>
              <li>
                <strong>Exame de fase</strong>, no fim de cada fase, com perguntas de todos os módulos dela. Passa-se à fase seguinte com 14 ou mais no exame e 12 ou mais no mini-projeto.
              </li>
              <li>
                <strong>Mini-projeto de fase</strong>, avaliado com uma grelha de critérios.
              </li>
              <li>
                <strong>Projeto final</strong>: um sistema de IA completo, documentado e publicado.
              </li>
            </ul>
            <p className="course-how-note">
              Até à Fase 3 trabalha-se no Google Colab; a partir da Fase 4 entram Python local, APIs de modelos e a cloud.
            </p>
          </div>
        </div>
      </Card>

      {PHASES.map((p) => {
        const f = phaseFraction(p.id, docs);
        const range = s.phases[p.id];
        const exams = core.phaseExams[p.id] ?? [];
        const examDone = lastDone(closingAttempts(p.id, exams));
        const proj = core.projects[p.id];
        const closing = p.id === "F6" ? null : phaseClosingSummary(phaseClosingState(p.id, core));
        return (
          <section key={p.id} className="card course-phase" aria-labelledby={`ph-${p.id}`}>
            <header className="course-phase-head">
              <div className="course-phase-id">
                <svg className={`icon course-phase-icon fc-${p.num}`} width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M1.5 4A1.5 1.5 0 0 1 3 2.5h3l1.5 1.5H13A1.5 1.5 0 0 1 14.5 5.5v6.5A1.5 1.5 0 0 1 13 13.5H3A1.5 1.5 0 0 1 1.5 12z" fill="currentColor" />
                </svg>
                <div className="course-phase-text">
                  <h2 id={`ph-${p.id}`} className="course-phase-title">
                    Fase {p.num} · {p.title}
                  </h2>
                  <p className="course-phase-meta">
                    {p.weeks} semanas · {fmtShort(range.start)} – {fmtShort(range.end)}
                  </p>
                  <p className="course-phase-goal">{p.goal}</p>
                </div>
              </div>
              <div className="course-phase-progress">
                <span className="course-pct">{Math.round(f * 100)}%</span>
                <Bar value={f} thin label={`Progresso da Fase ${p.num}`} />
              </div>
            </header>

            <div className="course-grid">
              {p.modules.map((mid) => {
                const meta = MODULES.find((m) => m.id === mid)!;
                const m = readMod(docs, mid);
                const st = moduleStatus(mid, m);
                const slot = s.modules[mid];
                const parts = moduleParts(mid, m);
                const kind = isInteractive(mid) ? "Interativo" : isDocOnly(mid) ? "Documento" : null;
                const open = () => navigate({ page: "modulo", id: mid, tab: "plano" });
                return (
                  <FolderCard
                    key={mid}
                    muted={st === "sem-material"}
                    onOpen={open}
                    meta={
                      <span className="course-meta">
                        <span className="course-meta-top">
                          <Chip>{mid}</Chip>
                          {st !== "sem-material" && (
                            <PartsStack
                              parts={[
                                { label: "Aula", value: parts.aula },
                                { label: "Apostila", value: parts.apostila },
                                { label: "Exercícios", value: parts.exercicios },
                                { label: "Prova", value: parts.prova },
                              ]}
                            />
                          )}
                        </span>
                        <span className="course-meta-line">
                          {meta.weeks} sem · {fmtDayMonth(slot.start)}
                        </span>
                        {kind && <span className="course-meta-line">{kind}</span>}
                      </span>
                    }
                    title={meta.title}
                    desc={meta.learn}
                    footer={
                      <>
                        <Button variant="secondary" onClick={open} aria-label={`Abrir ${mid}: ${meta.title}`}>
                          Abrir
                        </Button>
                        <Chip tone={st === "concluido" ? "ok" : st === "em-curso" ? "accent" : "neutral"}>
                          {st === "concluido" && m.best !== undefined ? `${String(m.best).replace(".", ",")} valores` : STATUS_LABEL[st]}
                        </Chip>
                      </>
                    }
                  />
                );
              })}

              <FolderCard
                muted={!closing}
                onOpen={p.id === "F6" ? undefined : () => navigate({ page: "fase", phase: p.id, tab: "plano" })}
                meta={
                  <span className="course-meta">
                    <span className="course-meta-top">
                      <Chip>{p.id === "F6" ? "Fim" : "Fecho"}</Chip>
                      {closing && <Chip tone={closing.tone}>{closing.label}</Chip>}
                    </span>
                    <span className="course-meta-line">{fmtDayMonth(range.end)}</span>
                  </span>
                }
                title={p.id === "F6" ? "Projeto final e certificação" : "Exame da fase e mini-projeto"}
                desc={p.closing.project.description}
                footer={
                  <div className="course-close-actions">
                    {p.id !== "F6" && (
                      <Button variant="secondary" size="sm" onClick={() => navigate({ page: "fase", phase: p.id, tab: "exame" })}>
                        {`Exame da fase${examDone ? ` · ${String(examDone.score).replace(".", ",")}` : ""}`}
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(p.id === "F6" ? { page: "projetos" } : { page: "fase", phase: p.id, tab: "projeto" })}
                    >
                      {`${p.id === "F6" ? "Projeto final" : "Mini-projeto"}${proj?.status === "entregue" ? " · entregue" : ""}`}
                    </Button>
                  </div>
                }
              />
            </div>
          </section>
        );
      })}
    </div>
  );
}
