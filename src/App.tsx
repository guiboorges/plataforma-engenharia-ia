import React from "react";
import { CLOSINGS, CONTENT, DOCS, isDocOnly } from "./content";
import { moduleMeta, phaseMeta } from "./content/course";
import type { ModuleContent } from "./content/types";
import { phaseSpecFor, runningAttempt } from "./lib/exam";
import { RouterProvider, useRouter } from "./lib/router";
import { StoreProvider, readMod, useCore, useMod, useStore, type Attempt } from "./lib/store";
import { Shell } from "./components/Shell";
import { ExamRunner } from "./components/exam/ExamRunner";
import { Dashboard } from "./pages/Dashboard";
import { CourseMap } from "./pages/CourseMap";
import { Review } from "./pages/Review";
import { Projects } from "./pages/Projects";
import { Calendar } from "./pages/Calendar";
import { Certifications } from "./pages/Certifications";
import { Library } from "./pages/Library";
import { Settings } from "./pages/Settings";
import { PhasePage, usePhaseExam } from "./pages/PhasePage";
import { ModulePage } from "./pages/module/ModulePage";
import { useModuleExam } from "./pages/module/ExamTab";
import { DocExamRunner } from "./pages/module/DocTabs";

export function App() {
  return (
    <StoreProvider>
      <RouterProvider>
        <ExamGate>
          <Shell>
            <Page />
          </Shell>
        </ExamGate>
      </RouterProvider>
    </StoreProvider>
  );
}

function Page() {
  const { route } = useRouter();
  switch (route.page) {
    case "painel":
      return <Dashboard />;
    case "percurso":
      return <CourseMap />;
    case "revisao":
      return <Review />;
    case "projetos":
      return <Projects />;
    case "calendario":
      return <Calendar />;
    case "certificacoes":
      return <Certifications />;
    case "biblioteca":
      return <Library />;
    case "definicoes":
      return <Settings />;
    case "modulo":
      return <ModulePage key={route.id} id={route.id} tab={route.tab} anchor={route.anchor} />;
    case "fase":
      return <PhasePage key={route.phase} phase={route.phase} tab={route.tab} />;
  }
}

/** Enquanto houver uma prova a decorrer, só se vê a prova (sem consulta). */
function ExamGate({ children }: { children: React.ReactNode }) {
  const { docs } = useStore();
  const [core] = useCore();
  for (const id of Object.keys(CONTENT)) {
    const a = runningAttempt(readMod(docs, id).attempts);
    if (a) return <ModuleExamRun c={CONTENT[id]} a={a} />;
  }
  for (const id of Object.keys(DOCS)) {
    if (!isDocOnly(id)) continue;
    const a = runningAttempt(readMod(docs, id).attempts);
    if (a) return <DocExamRun id={id} a={a} />;
  }
  for (const [ph, list] of Object.entries(core.phaseExams)) {
    const a = runningAttempt(list);
    if (a) return <PhaseExamRun phase={ph} a={a} />;
  }
  return <>{children}</>;
}

function ModuleExamRun({ c, a }: { c: ModuleContent; a: Attempt }) {
  const { save, submit } = useModuleExam(c);
  const { navigate } = useRouter();
  return (
    <ExamRunner
      title={`${c.id} — ${moduleMeta(c.id).title}`}
      spec={c.exam}
      moduleId={c.id}
      attempt={a}
      save={(r) => save(a.id, r)}
      onSubmit={() => {
        submit(a.id);
        navigate({ page: "modulo", id: c.id, tab: "prova" });
      }}
    />
  );
}

function DocExamRun({ id, a }: { id: string; a: Attempt }) {
  const [, setMod] = useMod(id);
  const { navigate } = useRouter();
  const save = (r: (x: Attempt) => void) =>
    setMod((m) => {
      const x = m.attempts.find((y) => y.id === a.id);
      if (x) r(x);
    });
  return (
    <DocExamRunner
      id={id}
      attempt={a}
      save={save}
      onSubmit={() => {
        save((x) => {
          if (x.status !== "running") return;
          x.status = "grading";
          x.submittedAt = Date.now();
        });
        navigate({ page: "modulo", id, tab: "prova" });
      }}
    />
  );
}

function PhaseExamRun({ phase, a }: { phase: string; a: Attempt }) {
  const { save, submit } = usePhaseExam(phase);
  const { navigate } = useRouter();
  const ph = phaseMeta(phase);
  return (
    <ExamRunner
      title={`Exame da Fase ${ph.num} — ${ph.title}`}
      spec={phaseSpecFor(phase, a)}
      rules={a.picked?.length ? undefined : CLOSINGS[phase]?.examRules}
      moduleId={phase}
      attempt={a}
      save={(r) => save(a.id, r)}
      onSubmit={() => {
        submit(a.id);
        navigate({ page: "fase", phase, tab: "exame" });
      }}
    />
  );
}
