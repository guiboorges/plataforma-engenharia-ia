import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { COURSE } from "../content/course";
import type { CardState } from "./srs";
import { capability, inArtifact } from "./claude";

// Estado do aluno, em documentos pequenos:
//   "core"     definições, revisão espaçada, registo de estudo, certificações, projetos, exames de fase
//   "mod-M1"…  progresso de cada módulo
// Guardado já no localStorage; dentro do Artifact também no `db`, em data/users/<id>/ (privado para cada pessoa).

export type ExState = {
  answers: Record<string, any>;
  submittedAt?: number;
  auto?: { correct: number; total: number };
  criteria?: Record<number, boolean>;
  tutor?: string;
};

export type Attempt = {
  id: string;
  startedAt: number;
  deadline: number;
  submittedAt?: number;
  answers: Record<string, number | string>;
  grading?: Record<string, Record<string, number>>;
  aiNotes?: Record<string, string>;
  status: "running" | "grading" | "done";
  score?: number;
  passed?: boolean;
  /** perguntas sorteadas (exames de fase): ids qualificados "M1:p3" */
  picked?: string[];
};

export type ModProg = {
  updatedAt: number;
  tasks: Record<string, boolean>;
  sections: Record<string, string>;
  checks: Record<string, number>;
  readings: Record<string, boolean>;
  colab: Record<string, boolean>;
  exercises: Record<string, ExState>;
  attempts: Attempt[];
  passedAt?: number;
  best?: number;
  notes: string;
  apostilaReviewedAt?: number;
  practiceRuns: { at: number; correct: number; total: number }[];
  lab?: { extra: { text: string; label: 0 | 1 }[]; rules: string[] };
  doc?: {
    answers?: string;
    triedAt?: number;
    examAnswers?: string;
    examStartedAt?: number;
    manualScore?: number;
    aiGrade?: string;
  };
};

export type CertStatus = "por-decidir" | "planeada" | "marcada" | "obtida" | "fora";

export type ProjectState = {
  scores: Record<string, number>;
  notes: string;
  link: string;
  status: "por-comecar" | "em-curso" | "entregue";
  doneAt?: number;
};

export type Core = {
  updatedAt: number;
  settings: { startDate: string; weeklyTargetMin: number; allowEarlyRetake: boolean };
  srs: Record<string, CardState>;
  log: { id: string; date: string; minutes: number; moduleId?: string; note?: string }[];
  timer?: { startedAt: number; moduleId?: string };
  certs: Record<string, { status: CertStatus; date?: string; note?: string }>;
  projects: Record<string, ProjectState>;
  phaseExams: Record<string, Attempt[]>;
};

export function emptyCore(): Core {
  return {
    updatedAt: 0,
    settings: { startDate: COURSE.defaultStart, weeklyTargetMin: COURSE.weeklyTargetMin, allowEarlyRetake: false },
    srs: {},
    log: [],
    certs: {},
    projects: {},
    phaseExams: {},
  };
}

export function emptyMod(): ModProg {
  return {
    updatedAt: 0,
    tasks: {},
    sections: {},
    checks: {},
    readings: {},
    colab: {},
    exercises: {},
    attempts: [],
    notes: "",
    practiceRuns: [],
  };
}

export type SyncStatus = "local" | "connecting" | "cloud" | "offline";

type Docs = Record<string, any>;

const LS_PREFIX = "eia1.";
const LS_INDEX = "eia1.__keys";

function lsRead(): Docs {
  const out: Docs = {};
  try {
    const keys: string[] = JSON.parse(localStorage.getItem(LS_INDEX) || "[]");
    for (const k of keys) {
      const raw = localStorage.getItem(LS_PREFIX + k);
      if (raw) out[k] = JSON.parse(raw);
    }
  } catch {
    /* sem armazenamento local: começa vazio */
  }
  return out;
}

function lsWrite(key: string, doc: any) {
  try {
    localStorage.setItem(LS_PREFIX + key, JSON.stringify(doc));
    const keys: string[] = JSON.parse(localStorage.getItem(LS_INDEX) || "[]");
    if (!keys.includes(key)) localStorage.setItem(LS_INDEX, JSON.stringify([...keys, key]));
  } catch {
    /* ignorar */
  }
}

function lsClear() {
  try {
    const keys: string[] = JSON.parse(localStorage.getItem(LS_INDEX) || "[]");
    keys.forEach((k) => localStorage.removeItem(LS_PREFIX + k));
    localStorage.removeItem(LS_INDEX);
  } catch {
    /* ignorar */
  }
}

/** Preenche campos que faltem em documentos antigos. */
function normalize(key: string, doc: any): any {
  if (key === "core") {
    const base = emptyCore();
    return { ...base, ...doc, settings: { ...base.settings, ...(doc?.settings ?? {}) } };
  }
  return { ...emptyMod(), ...doc };
}

type StoreApi = {
  docs: Docs;
  sync: SyncStatus;
  update: (key: string, recipe: (draft: any) => void) => void;
  replaceAll: (docs: Docs) => void;
  resetAll: () => void;
};

const Ctx = createContext<StoreApi | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [docs, setDocs] = useState<Docs>(() => lsRead());
  const [sync, setSync] = useState<SyncStatus>(inArtifact() ? "connecting" : "local");
  const dirty = useRef<Set<string>>(new Set());
  const cloud = useRef<{ col: any } | null>(null);
  const timers = useRef<Record<string, number>>({});
  const writing = useRef<Record<string, Promise<void>>>({});
  const docsRef = useRef(docs);
  docsRef.current = docs;

  const pushCloud = useCallback((key: string) => {
    const c = cloud.current;
    if (!c) return;
    window.clearTimeout(timers.current[key]);
    timers.current[key] = window.setTimeout(() => {
      const prev = writing.current[key] ?? Promise.resolve();
      writing.current[key] = prev
        .then(async () => {
          const body = docsRef.current[key];
          if (!body) return;
          await c.col.doc(key).set(JSON.parse(JSON.stringify(body)));
          setSync("cloud");
        })
        .catch((e: any) => {
          setSync("offline");
          if (e?.code === "unavailable") window.setTimeout(() => pushCloud(key), 4000 + Math.random() * 3000);
        });
    }, 1200);
  }, []);

  // ligar ao db do Artifact
  useEffect(() => {
    if (!inArtifact()) return;
    let cancelled = false;
    (async () => {
      const [db, user] = await Promise.all([capability<any>("db"), capability<any>("user")]);
      const uid = user ? await user.id() : null;
      if (cancelled) return;
      if (!db || !uid) {
        setSync("local");
        return;
      }
      try {
        const col = db.collection(`data/users/${uid}`);
        const snap = await col.get();
        if (cancelled) return;
        const remote: Docs = {};
        for (const d of snap.docs) if (d.exists) remote[d.id] = d.data();
        cloud.current = { col };
        const local = docsRef.current;
        const merged: Docs = { ...local };
        const toPush: string[] = [];
        for (const k of new Set([...Object.keys(local), ...Object.keys(remote)])) {
          const l = local[k];
          const r = remote[k];
          if (r && (!l || (r.updatedAt ?? 0) > (l.updatedAt ?? 0))) {
            merged[k] = r;
            lsWrite(k, r);
          } else if (l && (!r || (l.updatedAt ?? 0) > (r.updatedAt ?? 0))) {
            toPush.push(k);
          }
        }
        setDocs(merged);
        setSync("cloud");
        toPush.forEach(pushCloud);
      } catch {
        setSync("offline");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pushCloud]);

  // gravar o que mudou
  useEffect(() => {
    if (dirty.current.size === 0) return;
    const keys = [...dirty.current];
    dirty.current.clear();
    for (const k of keys) {
      lsWrite(k, docs[k]);
      pushCloud(k);
    }
  }, [docs, pushCloud]);

  const update = useCallback((key: string, recipe: (draft: any) => void) => {
    setDocs((prev) => {
      const cur = normalize(key, prev[key] ?? {});
      const draft = JSON.parse(JSON.stringify(cur));
      recipe(draft);
      draft.updatedAt = Date.now();
      dirty.current.add(key);
      return { ...prev, [key]: draft };
    });
  }, []);

  const replaceAll = useCallback((incoming: Docs) => {
    const now = Date.now();
    const next: Docs = {};
    for (const [k, v] of Object.entries(incoming)) {
      if (k !== "core" && !k.startsWith("mod-")) continue;
      next[k] = { ...v, updatedAt: now };
      dirty.current.add(k);
    }
    setDocs((prev) => ({ ...prev, ...next }));
  }, []);

  const resetAll = useCallback(() => {
    lsClear();
    const now = Date.now();
    setDocs((prev) => {
      const next: Docs = {};
      for (const k of Object.keys(prev)) {
        next[k] = { ...(k === "core" ? emptyCore() : emptyMod()), updatedAt: now };
        dirty.current.add(k);
      }
      return next;
    });
  }, []);

  const api = useMemo(() => ({ docs, sync, update, replaceAll, resetAll }), [docs, sync, update, replaceAll, resetAll]);
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useStore(): StoreApi {
  const s = useContext(Ctx);
  if (!s) throw new Error("StoreProvider em falta");
  return s;
}

export function useCore(): [Core, (recipe: (c: Core) => void) => void] {
  const { docs, update } = useStore();
  const core = useMemo(() => normalize("core", docs.core ?? {}) as Core, [docs.core]);
  const set = useCallback((recipe: (c: Core) => void) => update("core", recipe), [update]);
  return [core, set];
}

export function useMod(id: string): [ModProg, (recipe: (m: ModProg) => void) => void] {
  const { docs, update } = useStore();
  const key = `mod-${id}`;
  const mod = useMemo(() => normalize(key, docs[key] ?? {}) as ModProg, [docs, key]);
  const set = useCallback((recipe: (m: ModProg) => void) => update(key, recipe), [update, key]);
  return [mod, set];
}

export function readMod(docs: Docs, id: string): ModProg {
  return normalize(`mod-${id}`, docs[`mod-${id}`] ?? {}) as ModProg;
}

export function readCore(docs: Docs): Core {
  return normalize("core", docs.core ?? {}) as Core;
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}
