import React, { useEffect, useRef } from "react";
import { CONTENT, isDocOnly } from "../../content";
import { MODULES, moduleMeta, phaseMeta } from "../../content/course";
import type { ModuleTab } from "../../content/types";
import { fmtShort } from "../../lib/dates";
import { STATUS_LABEL, moduleFraction, moduleStatus } from "../../lib/progress";
import { useRouter } from "../../lib/router";
import { computeSchedule } from "../../lib/schedule";
import { useCore, useMod } from "../../lib/store";
import { Chip, Icon, PageHeader, Ring, Seg } from "../../components/ui";
import { TutorDock } from "../../components/Tutor";
import { PlanTab } from "./PlanTab";
import { LessonTab } from "./LessonTab";
import { ApostilaTab } from "./ApostilaTab";
import { ExercisesTab } from "./ExercisesTab";
import { ExamTab } from "./ExamTab";
import { GabaritoTab } from "./GabaritoTab";
import { NotesTab } from "./NotesTab";
import { DocTab } from "./DocTabs";

const TABS: { id: ModuleTab; label: string; icon: string }[] = [
  { id: "plano", label: "Plano", icon: "list" },
  { id: "aula", label: "Aula", icon: "book" },
  { id: "apostila", label: "Apostila", icon: "file" },
  { id: "exercicios", label: "Exercícios", icon: "target" },
  { id: "prova", label: "Prova", icon: "timer" },
  { id: "gabarito", label: "Gabarito", icon: "eye" },
  { id: "notas", label: "Notas", icon: "pencil" },
];

export function ModulePage({ id, tab, anchor }: { id: string; tab: ModuleTab; anchor?: string }) {
  const { navigate } = useRouter();
  const [core] = useCore();
  const [mod] = useMod(id);
  const meta = moduleMeta(id);
  const ph = phaseMeta(meta.phase);
  const c = CONTENT[id];
  const doc = isDocOnly(id);
  const slot = computeSchedule(core.settings.startDate).modules[id];
  const status = moduleStatus(id, mod);
  const frac = moduleFraction(id, mod);
  const hasTabs = !!c || doc;
  const idx = MODULES.findIndex((m) => m.id === id);
  const prev = MODULES[idx - 1];
  const next = MODULES[idx + 1];

  const done: Partial<Record<ModuleTab, boolean>> = c
    ? {
        aula: c.lesson.every((s) => mod.sections[s.id]),
        apostila: !!mod.apostilaReviewedAt,
        exercicios: c.exercises.every((e) => mod.exercises[e.id]?.submittedAt),
        prova: !!mod.passedAt,
        plano: c.sessions.every((s) => s.tasks.every((t) => mod.tasks[`${s.id}.${t.id}`])),
      }
    : {};

  const go = (t: ModuleTab) => navigate({ page: "modulo", id, tab: t });
  const toCourse = () => navigate({ page: "percurso" });
  const pct = Math.round(frac * 100);

  // No telemóvel os separadores deslizam na horizontal: manter o ativo à vista (só desliza a barra, não a página).
  const tabsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const bar = tabsRef.current?.querySelector<HTMLElement>(".seg");
    const on = bar?.querySelector<HTMLElement>(".is-on");
    if (!bar || !on) return;
    const b = bar.getBoundingClientRect();
    const r = on.getBoundingClientRect();
    if (r.left < b.left || r.right > b.right) bar.scrollLeft += r.left - b.left - (b.width - r.width) / 2;
  }, [tab, id]);

  return (
    <div className="page mod-page">
      <PageHeader
        crumbs={[
          { label: "Percurso", icon: "route", onClick: toCourse },
          { label: `Fase ${ph.num} · ${ph.title}`, onClick: toCourse },
          { label: meta.id },
        ]}
        title={meta.title}
        subtitle={
          <>
            <Chip>
              <span className="mono">{meta.id}</span>
            </Chip>
            <span className="mod-meta">{meta.weeks} semanas</span>
            <span className="mod-meta">~{meta.weeks * 3} h</span>
            <span className="mod-meta">
              Previsto de {fmtShort(slot.start)} a {fmtShort(slot.end)}
            </span>
            <Chip tone={status === "concluido" ? "ok" : status === "em-curso" ? "accent" : "neutral"}>
              {status === "concluido" && mod.best !== undefined ? `Concluído · ${String(mod.best).replace(".", ",")} valores` : STATUS_LABEL[status]}
            </Chip>
          </>
        }
        actions={
          hasTabs ? (
            <div className="mod-progress">
              <span className="mod-progress-label">Progresso</span>
              <Ring value={frac} size={44} stroke={4} label={<span className="mono">{pct}%</span>} />
            </div>
          ) : undefined
        }
      />

      {hasTabs && (
        <div className="mod-tabs" ref={tabsRef}>
          <Seg
            scroll
            label="Partes do módulo"
            value={tab}
            onChange={(t) => go(t as ModuleTab)}
            options={TABS.map((t) => ({ id: t.id, label: t.label, icon: t.icon, done: !!done[t.id] }))}
          />
        </div>
      )}

      {c ? (
        <>
          {tab === "plano" && <PlanTab c={c} />}
          {tab === "aula" && <LessonTab c={c} anchor={anchor} />}
          {tab === "apostila" && <ApostilaTab c={c} />}
          {tab === "exercicios" && <ExercisesTab c={c} />}
          {tab === "prova" && <ExamTab c={c} />}
          {tab === "gabarito" && <GabaritoTab c={c} />}
          {tab === "notas" && <NotesTab id={id} />}
          <TutorDock moduleId={id} section={tab === "aula" ? anchor : undefined} />
        </>
      ) : doc ? (
        tab === "plano" ? <PlanTab c={null} id={id} /> : tab === "notas" ? <NotesTab id={id} /> : <DocTab id={id} tab={tab} />
      ) : (
        <PlanTab c={null} id={id} />
      )}

      <nav className="mod-pager" aria-label="Outros módulos">
        {prev && (
          <button type="button" className="mod-pager-btn" onClick={() => navigate({ page: "modulo", id: prev.id, tab: "plano" })}>
            <span className="mod-pager-ico" aria-hidden="true">
              <Icon name="left" />
            </span>
            <span className="mod-pager-text">
              <span className="mod-pager-dir">Anterior</span>
              <span className="mod-pager-title">
                {prev.id} — {prev.title}
              </span>
            </span>
          </button>
        )}
        {next && (
          <button type="button" className="mod-pager-btn is-next" onClick={() => navigate({ page: "modulo", id: next.id, tab: "plano" })}>
            <span className="mod-pager-text">
              <span className="mod-pager-dir">Seguinte</span>
              <span className="mod-pager-title">
                {next.id} — {next.title}
              </span>
            </span>
            <span className="mod-pager-ico" aria-hidden="true">
              <Icon name="right" />
            </span>
          </button>
        )}
      </nav>
    </div>
  );
}
