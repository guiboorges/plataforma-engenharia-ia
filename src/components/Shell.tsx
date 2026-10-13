import React, { useEffect, useState } from "react";
import { MODULES, PHASES, moduleMeta } from "../content/course";
import { fmtMinutes, mondayOf, todayYMD } from "../lib/dates";
import { currentModuleId, dueCards, minutesByWeek, moduleStatus } from "../lib/progress";
import { useRouter, type Route } from "../lib/router";
import { readMod, uid, useCore, useStore } from "../lib/store";
import { CommandPalette } from "./CommandPalette";
import { Bar, Button, Icon, Kbd, fmtClock, useNow } from "./ui";

const MAIN: { page: Route["page"]; label: string; icon: string }[] = [
  { page: "painel", label: "Hoje", icon: "grid" },
  { page: "revisao", label: "Revisão", icon: "cards" },
  { page: "percurso", label: "Percurso", icon: "route" },
];
const MORE: { page: Route["page"]; label: string; icon: string }[] = [
  { page: "calendario", label: "Calendário", icon: "calendar" },
  { page: "projetos", label: "Projetos", icon: "folder" },
  { page: "certificacoes", label: "Certificações", icon: "award" },
  { page: "biblioteca", label: "Biblioteca", icon: "library" },
  { page: "definicoes", label: "Definições", icon: "settings" },
];

const OPEN_KEY = "eia1.ui.openPhases";

function readOpen(fallback: string): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(OPEN_KEY) || "null");
    if (Array.isArray(v)) return v;
  } catch {
    /* sem armazenamento */
  }
  return [fallback];
}

export function Shell({ children }: { children: React.ReactNode }) {
  const { route, navigate } = useRouter();
  const { docs } = useStore();
  const [core] = useCore();
  const [drawer, setDrawer] = useState(false);
  const [palette, setPalette] = useState(false);
  const cur = currentModuleId(docs);
  const curPhase = moduleMeta(cur).phase;
  const [openPhases, setOpenPhases] = useState<string[]>(() => readOpen(curPhase));
  const due = dueCards(docs, core).length;

  useEffect(() => setDrawer(false), [route]);
  useEffect(() => {
    try {
      localStorage.setItem(OPEN_KEY, JSON.stringify(openPhases));
    } catch {
      /* ignorar */
    }
  }, [openPhases]);

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const typing = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable);
      if ((e.key === "/" && !typing) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")) {
        e.preventDefault();
        setPalette(true);
      }
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, []);

  const go = (page: Route["page"]) => navigate({ page } as Route);
  const isOn = (page: string) => route.page === page;
  const togglePhase = (id: string) => setOpenPhases((o) => (o.includes(id) ? o.filter((x) => x !== id) : [...o, id]));

  const navItem = (n: { page: Route["page"]; label: string; icon: string }) => (
    <button key={n.page} type="button" className={`side-item ${isOn(n.page) ? "is-on" : ""}`} aria-current={isOn(n.page) ? "page" : undefined} onClick={() => go(n.page)}>
      <Icon name={n.icon} />
      <span>{n.label}</span>
      {n.page === "revisao" && due > 0 && <span className="side-count">{due}</span>}
    </button>
  );

  return (
    <div className="app">
      <header className="topbar">
        <button type="button" className="icon-btn" aria-label="Abrir menu" aria-expanded={drawer} onClick={() => setDrawer(!drawer)}>
          <Icon name={drawer ? "x" : "menu"} size={18} />
        </button>
        <span className="topbar-title">Engenharia de IA</span>
        <button type="button" className="icon-btn" aria-label="Pesquisar" onClick={() => setPalette(true)}>
          <Icon name="search" />
        </button>
        <TimerChip />
      </header>

      <aside className={`side ${drawer ? "is-open" : ""}`} aria-label="Menu">
        <button type="button" className="ws" onClick={() => go("painel")}>
          <Logo />
          <span className="ws-name">Engenharia de IA</span>
          <Icon name="updown" size={14} />
        </button>

        <button type="button" className="side-item side-search" onClick={() => setPalette(true)}>
          <Icon name="search" />
          <span>Pesquisar</span>
          <Kbd>/</Kbd>
        </button>

        <nav className="side-nav" aria-label="Navegação principal">
          {MAIN.map(navItem)}
          <hr className="side-sep" />
          {MORE.map(navItem)}
          <hr className="side-sep" />
          <p className="side-label">Fases</p>
          {PHASES.map((p) => {
            const open = openPhases.includes(p.id);
            return (
              <div key={p.id} className="side-phase">
                <button type="button" className={`side-item side-folder ${open ? "is-open" : ""}`} aria-expanded={open} onClick={() => togglePhase(p.id)}>
                  <svg className={`icon fc-${p.num}`} width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M1.5 4A1.5 1.5 0 0 1 3 2.5h3l1.5 1.5H13A1.5 1.5 0 0 1 14.5 5.5v6.5A1.5 1.5 0 0 1 13 13.5H3A1.5 1.5 0 0 1 1.5 12z" fill="currentColor" />
                  </svg>
                  <span>{p.title}</span>
                  <Icon name="caret" size={14} className="side-caret" />
                </button>
                {open && (
                  <ul className="side-mods">
                    {p.modules.map((mid) => {
                      const st = moduleStatus(mid, readMod(docs, mid));
                      const on = route.page === "modulo" && route.id === mid;
                      return (
                        <li key={mid}>
                          <button
                            type="button"
                            className={`side-mod ${on ? "is-on" : ""} ${mid === cur ? "is-current" : ""}`}
                            onClick={() => navigate({ page: "modulo", id: mid, tab: "plano" })}
                          >
                            <span className={`side-mod-dot is-${st}`} aria-hidden="true" />
                            <span className="side-mod-id">{mid}</span>
                            <span className="side-mod-title">{MODULES.find((m) => m.id === mid)!.title}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>

        <StudyCard />
      </aside>
      {drawer && <button type="button" className="scrim" aria-label="Fechar menu" onClick={() => setDrawer(false)} />}

      <main className="main" id="conteudo">
        {children}
      </main>
      <CommandPalette open={palette} onClose={() => setPalette(false)} />
    </div>
  );
}

function Logo() {
  return (
    <span className="ws-logo" aria-hidden="true">
      <svg viewBox="0 0 28 28" width="28" height="28">
        <rect x="0.5" y="0.5" width="27" height="27" rx="7" fill="var(--surface-3)" stroke="var(--border-2)" />
        <circle cx="10" cy="17.5" r="2.4" fill="var(--text-2)" />
        <circle cx="18" cy="10.5" r="2.4" fill="var(--text)" />
        <circle cx="19" cy="19" r="1.8" fill="var(--text-3)" />
        <path d="M10 17.5 18 10.5 M10 17.5 19 19 M18 10.5 19 19" stroke="var(--text-3)" strokeWidth="1.1" />
      </svg>
    </span>
  );
}

function useTimer() {
  const [core, setCore] = useCore();
  const { docs } = useStore();
  const start = () =>
    setCore((c) => {
      c.timer = { startedAt: Date.now(), moduleId: currentModuleId(docs) };
    });
  const stop = (save: boolean) =>
    setCore((c) => {
      if (!c.timer) return;
      const minutes = Math.min(240, Math.round((Date.now() - c.timer.startedAt) / 60000));
      if (save && minutes >= 1) c.log.push({ id: uid(), date: todayYMD(), minutes, moduleId: c.timer.moduleId });
      delete c.timer;
    });
  return { core, start, stop };
}

function TimerChip() {
  const { core, start, stop } = useTimer();
  const now = useNow(1000);
  return core.timer ? (
    <button type="button" className="timer-chip is-running" onClick={() => stop(true)} aria-label="Terminar sessão de estudo">
      <Icon name="stop" size={12} /> {fmtClock(now - core.timer.startedAt)}
    </button>
  ) : (
    <button type="button" className="timer-chip" onClick={start} aria-label="Começar sessão de estudo">
      <Icon name="play" size={12} /> Estudar
    </button>
  );
}

function StudyCard() {
  const { core, start, stop } = useTimer();
  const { sync } = useStore();
  const now = useNow(1000);
  const week = minutesByWeek(core).get(mondayOf(todayYMD())) ?? 0;
  const target = core.settings.weeklyTargetMin;
  const syncText: Record<string, string> = {
    cloud: "Guardado na sua conta",
    connecting: "A ligar à sua conta…",
    local: "Guardado neste browser",
    offline: "Sem ligação: guardado neste browser",
  };
  return (
    <section className="side-card" aria-label="Sessão de estudo">
      <span className="side-card-ico" aria-hidden="true">
        <Icon name="timer" size={18} />
      </span>
      <div className="side-card-text">
        <p className="side-card-title">Sessão de estudo</p>
        <p className="side-card-desc">
          {fmtMinutes(week)} de {fmtMinutes(target)} esta semana
        </p>
      </div>
      <Bar value={week / target} thin tone={week >= target ? "ok" : "accent"} label="Tempo de estudo desta semana" />
      {core.timer ? (
        <div className="side-card-run">
          <span className="side-card-clock mono">{fmtClock(now - core.timer.startedAt)}</span>
          <Button size="sm" variant="primary" icon="stop" onClick={() => stop(true)}>
            Terminar
          </Button>
          <button type="button" className="link-btn small" onClick={() => stop(false)}>
            Descartar
          </button>
        </div>
      ) : (
        <Button variant="secondary" className="side-card-btn" onClick={start}>
          Começar sessão
        </Button>
      )}
      <p className={`side-sync is-${sync}`}>
        <Icon name={sync === "cloud" ? "cloud" : "laptop"} size={12} />
        {syncText[sync] ?? syncText.local}
      </p>
    </section>
  );
}
