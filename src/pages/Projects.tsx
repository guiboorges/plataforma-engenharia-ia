import React from "react";
import { CLOSINGS } from "../content";
import { FINAL_PROJECT_CRITERIA, PHASES } from "../content/course";
import { fmtScore, fmtShort } from "../lib/dates";
import { renderInline } from "../lib/md";
import { phaseRubric } from "../lib/progress";
import { useRouter } from "../lib/router";
import { computeSchedule } from "../lib/schedule";
import { useCore, type ProjectState } from "../lib/store";
import { Button, Chip, Icon, PageHeader } from "../components/ui";

const steps = (max: number) => Array.from({ length: Math.round(max / 0.5) + 1 }, (_, i) => i * 0.5);

export type RubricItem = { id: string; text: string; points: number; detail?: string };

const emptyProject = (): ProjectState => ({ scores: {}, notes: "", link: "", status: "por-comecar" });

/** Estado de um projeto (core.projects[id]) e a forma de o alterar. */
export function useProject(id: string): [ProjectState, (recipe: (p: ProjectState) => void) => void] {
  const [core, setCore] = useCore();
  const st: ProjectState = core.projects[id] ?? emptyProject();
  const set = (recipe: (p: ProjectState) => void) =>
    setCore((c) => {
      const cur = c.projects[id] ?? emptyProject();
      recipe(cur);
      c.projects[id] = cur;
    });
  return [st, set];
}

export const rubricTotal = (rubric: RubricItem[], st: ProjectState) => rubric.reduce((a, c) => a + Math.min(c.points, st.scores[c.id] ?? 0), 0);
export const rubricMax = (rubric: RubricItem[]) => rubric.reduce((a, c) => a + c.points, 0);

export function Projects() {
  const [core] = useCore();
  const { navigate } = useRouter();
  const s = computeSchedule(core.settings.startDate);
  return (
    <div className="page">
      <PageHeader
        crumbs={[{ label: "Projetos", icon: "folder" }]}
        title="Mini-projetos e projeto final"
        subtitle="Cada fase fecha com um exame e um mini-projeto avaliado com uma grelha de critérios. A grelha da Fase 0 é a oficial do curso; as das Fases 1 a 5 são propostas da plataforma até chegar o material de cada fase; a do projeto final é a do plano."
      />
      <div className="proj-list">
        {PHASES.filter((p) => p.id !== "F6").map((p) => {
          const cl = CLOSINGS[p.id];
          return (
            <ProjectCard
              key={p.id}
              id={p.id}
              eyebrow={`Fase ${p.num} · ${p.title} · fecho a ${fmtShort(s.phases[p.id].end)}`}
              title={cl?.project.title ?? p.closing.project.title}
              description={p.closing.project.description}
              rubric={phaseRubric(p.id)}
              phaseNum={p.num}
              pass={cl?.passRule.project}
              onOpen={() => navigate({ page: "fase", phase: p.id, tab: "projeto" })}
              openLabel={cl ? "Enunciado e gabarito" : "Fecho da fase"}
            />
          );
        })}
        <ProjectCard
          id="final"
          eyebrow={`Fase 6 · M29 · ${fmtShort(s.modules["M29"].start)} a ${fmtShort(s.modules["M29"].end)}`}
          title="Projeto final"
          description="Um sistema de IA escolhido pelo aluno, resolvendo um problema real: dados, modelo ou LLM, avaliação, deploy, monitorização, model card e uma apresentação de 10 minutos."
          rubric={FINAL_PROJECT_CRITERIA}
          phaseNum={6}
        />
      </div>
    </div>
  );
}

function ProjectCard({
  id,
  eyebrow,
  title,
  description,
  rubric,
  phaseNum,
  pass,
  onOpen,
  openLabel,
}: {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  rubric: RubricItem[];
  phaseNum: number;
  pass?: number;
  onOpen?: () => void;
  openLabel?: string;
}) {
  const [st] = useProject(id);
  const total = rubricTotal(rubric, st);
  const max = rubricMax(rubric);
  return (
    <section className="card proj" aria-labelledby={`pj-${id}-title`}>
      <header className="proj-head">
        <span className={`proj-ico fc-${phaseNum}`} aria-hidden="true">
          <Icon name="folder" size={16} />
        </span>
        <div className="proj-titles">
          <h2 className="card-title" id={`pj-${id}-title`}>
            {title}
          </h2>
          <p className="proj-meta">{eyebrow}</p>
        </div>
        <div className="proj-status">
          {pass !== undefined && <Chip tone={st.status === "entregue" && total >= pass ? "ok" : "neutral"}>Aprovação com {pass}</Chip>}
          <Chip tone={st.status === "entregue" ? "ok" : st.status === "em-curso" ? "accent" : "neutral"}>
            {st.status === "entregue" ? "Entregue" : st.status === "em-curso" ? "Em curso" : "Por começar"}
          </Chip>
          <span className="proj-total" title="Pontuação da autoavaliação">
            {fmtScore(total)}
            <span className="proj-max">/{max}</span>
          </span>
        </div>
      </header>
      <p className="proj-desc">{description}</p>
      <ProjectForm id={id} rubric={rubric} />
      {onOpen && (
        <div className="proj-actions">
          <Button size="sm" variant="ghost" iconRight="arrowRight" onClick={onOpen}>
            {openLabel ?? "Fecho da fase"}
          </Button>
        </div>
      )}
    </section>
  );
}

/** Grelha de autoavaliação (uma cotação por critério) com o estado, a ligação e as notas do projeto. */
export function ProjectForm({ id, rubric }: { id: string; rubric: RubricItem[] }) {
  const [st, set] = useProject(id);
  return (
    <div className="proj-grid">
      <div className="proj-rubric">
        <h3 className="proj-label">Grelha de critérios · autoavaliação</h3>
        <ul className="criteria">
          {rubric.map((cr) => (
            <li key={cr.id}>
              <label htmlFor={`pj-${id}-${cr.id}`} className={cr.detail ? "phase-crit" : undefined}>
                {cr.text}
                {cr.detail && <span className="phase-crit-detail">{renderInline(cr.detail)}</span>}
              </label>
              <select
                id={`pj-${id}-${cr.id}`}
                className="input input-sm"
                value={st.scores[cr.id] ?? 0}
                onChange={(e) =>
                  set((p) => {
                    p.scores = { ...p.scores, [cr.id]: Number(e.target.value) };
                    if (p.status === "por-comecar") p.status = "em-curso";
                  })
                }
              >
                {steps(cr.points).map((v) => (
                  <option key={v} value={v}>
                    {fmtScore(v)} / {cr.points}
                  </option>
                ))}
              </select>
            </li>
          ))}
        </ul>
      </div>
      <div className="proj-side">
        <div className="field">
          <label htmlFor={`pj-${id}-status`}>Estado</label>
          <select
            id={`pj-${id}-status`}
            className="input"
            value={st.status}
            onChange={(e) =>
              set((p) => {
                p.status = e.target.value as ProjectState["status"];
                if (p.status === "entregue") p.doneAt = Date.now();
              })
            }
          >
            <option value="por-comecar">Por começar</option>
            <option value="em-curso">Em curso</option>
            <option value="entregue">Entregue</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor={`pj-${id}-link`}>Ligação (notebook, repositório, app)</label>
          <input
            id={`pj-${id}-link`}
            className="input"
            value={st.link}
            placeholder="https://"
            onChange={(e) => {
              const v = e.target.value;
              set((p) => {
                p.link = v;
              });
            }}
          />
          {/^https?:\/\//.test(st.link) && (
            <a href={st.link} target="_blank" rel="noopener noreferrer" className="proj-open">
              Abrir <Icon name="external" size={12} />
            </a>
          )}
        </div>
        <div className="field">
          <label htmlFor={`pj-${id}-notes`}>Notas</label>
          <textarea
            id={`pj-${id}-notes`}
            className="input"
            rows={3}
            value={st.notes}
            onChange={(e) => {
              const v = e.target.value;
              set((p) => {
                p.notes = v;
              });
            }}
          />
        </div>
      </div>
    </div>
  );
}
