import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ModuleTab } from "../content/types";
import { MODULES, PHASES } from "../content/course";

// Navegação por âncora simples (#painel, #M1-aula, #M1-aula-s4, #F0-plano, #F0-exame): só letras, dígitos e hífens,
// o único formato que chega do link de um Artifact.

/** Separadores da página de fecho de fase. */
export type PhaseTab = "plano" | "exame" | "projeto" | "gabarito";
export const PHASE_TABS: PhaseTab[] = ["plano", "exame", "projeto", "gabarito"];

export type Route =
  | { page: "painel" | "percurso" | "revisao" | "projetos" | "calendario" | "certificacoes" | "biblioteca" | "definicoes" }
  | { page: "modulo"; id: string; tab: ModuleTab; anchor?: string }
  | { page: "fase"; phase: string; tab: PhaseTab };

const SIMPLE = ["painel", "percurso", "revisao", "projetos", "calendario", "certificacoes", "biblioteca", "definicoes"] as const;
const TABS: ModuleTab[] = ["plano", "aula", "apostila", "exercicios", "prova", "gabarito", "notas"];

export function routeToHash(r: Route): string {
  if (r.page === "modulo") return [r.id, r.tab, r.anchor].filter(Boolean).join("-");
  if (r.page === "fase") return `${r.phase}-${r.tab}`;
  return r.page;
}

export function hashToRoute(h: string): Route {
  const s = h.replace(/^#/, "");
  if ((SIMPLE as readonly string[]).includes(s)) return { page: s as (typeof SIMPLE)[number] };
  // fecho de fase (a F6 fecha com o projeto final e a certificação, que têm páginas próprias)
  const fm = /^(F\d)(?:-([a-z]+))?$/.exec(s);
  if (fm && fm[1] !== "F6" && PHASES.some((p) => p.id === fm[1])) {
    const tab = (PHASE_TABS as string[]).includes(fm[2] ?? "") ? (fm[2] as PhaseTab) : "plano";
    return { page: "fase", phase: fm[1], tab };
  }
  const m = /^(M\d{1,2})(?:-([a-z]+))?(?:-([\w.~-]+))?$/.exec(s);
  if (m && MODULES.some((x) => x.id === m[1])) {
    const tab = (TABS as string[]).includes(m[2] ?? "") ? (m[2] as ModuleTab) : "plano";
    return { page: "modulo", id: m[1], tab, anchor: m[3] };
  }
  return { page: "painel" };
}

type RouterApi = { route: Route; navigate: (r: Route) => void };
const Ctx = createContext<RouterApi | null>(null);

function readHash(): string {
  try {
    return window.location.hash;
  } catch {
    return "";
  }
}

export function RouterProvider({ children }: { children: React.ReactNode }) {
  const [route, setRoute] = useState<Route>(() => hashToRoute(readHash()));

  useEffect(() => {
    const on = () => setRoute(hashToRoute(readHash()));
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);

  const navigate = useCallback((r: Route) => {
    setRoute(r);
    const h = "#" + routeToHash(r);
    try {
      if (window.location.hash !== h) window.history.pushState(null, "", h);
    } catch {
      /* sem histórico: fica só o estado */
    }
    if (r.page === "modulo" && r.anchor) {
      window.setTimeout(() => document.getElementById(r.anchor!)?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
    } else {
      window.scrollTo({ top: 0 });
    }
  }, []);

  useEffect(() => {
    const on = () => setRoute(hashToRoute(readHash()));
    window.addEventListener("popstate", on);
    return () => window.removeEventListener("popstate", on);
  }, []);

  return <Ctx.Provider value={{ route, navigate }}>{children}</Ctx.Provider>;
}

export function useRouter(): RouterApi {
  const r = useContext(Ctx);
  if (!r) throw new Error("RouterProvider em falta");
  return r;
}
