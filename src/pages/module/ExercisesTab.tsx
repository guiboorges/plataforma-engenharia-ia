import React from "react";
import type { ModuleContent } from "../../content/types";
import { renderInline } from "../../lib/md";
import { useRouter } from "../../lib/router";
import { useMod, type ExState } from "../../lib/store";
import type { BlocksCtx } from "../../components/Blocks";
import { ExerciseCard } from "../../components/exercises/Exercise";
import { NotebookButton } from "../../components/NotebookButton";
import { Bar } from "../../components/ui";

export function ExercisesTab({ c }: { c: ModuleContent }) {
  const [mod, setMod] = useMod(c.id);
  const { navigate } = useRouter();
  const done = c.exercises.filter((e) => mod.exercises[e.id]?.submittedAt).length;
  const ctx: BlocksCtx = { moduleId: c.id, onSection: (id) => navigate({ page: "modulo", id: c.id, tab: "aula", anchor: id }) };
  const sessionLabel = (sid: string) => c.sessions.find((s) => s.id === sid)?.label ?? "";

  return (
    <div className="tab-body narrow ex-tab">
      <section className="card ex-intro" aria-labelledby="ex-intro-title">
        <div className="ex-intro-row">
          <div className="ex-intro-progress">
            <div className="ex-intro-line">
              <h2 id="ex-intro-title" className="card-title">
                {done} de {c.exercises.length} entregues
              </h2>
              <span className="ex-intro-meta">{c.exercises.length} exercícios · cerca de {Math.max(1, Math.round(c.exercises.reduce((a, e) => a + e.minutes, 0) / 60))} {Math.round(c.exercises.reduce((a, e) => a + e.minutes, 0) / 60) > 1 ? "horas" : "hora"}</span>
            </div>
            <Bar value={done / c.exercises.length} label="Exercícios entregues" />
          </div>
          <NotebookButton moduleId={c.id} />
        </div>
        <aside className="callout callout-key">
          <p className="callout-title">Regra de ouro</p>
          <p>{renderInline(c.goldenRule)}</p>
        </aside>
        <p className="ex-intro-help">
          O gabarito de cada exercício abre quando entregar a sua tentativa. Nos exercícios escritos, compare com o gabarito, marque os critérios que cumpriu e, se quiser,
          peça ao tutor que explique o que falta.
        </p>
      </section>

      {c.exerciseParts.map((p) => {
        const list = c.exercises.filter((e) => e.part === p.id);
        if (!list.length) return null;
        return (
          <section key={p.id} className="ex-part" aria-labelledby={`part-${p.id}`}>
            <header className="ex-part-head">
              <h2 id={`part-${p.id}`} className="ex-part-title">
                {p.title}
              </h2>
              <span className="ex-part-session">{sessionLabel(list[0].session)}</span>
            </header>
            {p.note && <p className="ex-part-note">{renderInline(p.note, ctx)}</p>}
            {list.map((ex) => (
              <ExerciseCard
                key={ex.id}
                c={c}
                ex={ex}
                st={mod.exercises[ex.id]}
                setSt={(recipe) =>
                  setMod((m) => {
                    const cur: ExState = m.exercises[ex.id] ?? { answers: {} };
                    recipe(cur);
                    m.exercises[ex.id] = cur;
                  })
                }
                ctx={ctx}
                onOpenSolution={() => navigate({ page: "modulo", id: c.id, tab: "gabarito", anchor: `g-${ex.id}` })}
              />
            ))}
          </section>
        );
      })}
    </div>
  );
}
