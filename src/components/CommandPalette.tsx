import React, { useEffect, useMemo, useRef, useState } from "react";
import { CLOSINGS, CONTENT } from "../content";
import { MODULES, PHASES } from "../content/course";
import { plain } from "../lib/md";
import { useRouter, type Route } from "../lib/router";
import { matches } from "../lib/viewer";
import { Icon, Kbd } from "./ui";

// Pesquisa rápida (tecla "/" ou ⌘K): páginas, módulos, secções da aula e termos dos cartões.

type Item = { id: string; group: string; label: string; hint?: string; icon: string; route: Route };

const PAGES: { page: Route["page"]; label: string; icon: string }[] = [
  { page: "painel", label: "Hoje", icon: "grid" },
  { page: "revisao", label: "Revisão", icon: "cards" },
  { page: "percurso", label: "Percurso", icon: "route" },
  { page: "calendario", label: "Calendário", icon: "calendar" },
  { page: "projetos", label: "Projetos", icon: "folder" },
  { page: "certificacoes", label: "Certificações", icon: "award" },
  { page: "biblioteca", label: "Biblioteca", icon: "library" },
  { page: "definicoes", label: "Definições", icon: "settings" },
];

function buildIndex(): Item[] {
  const items: Item[] = PAGES.map((p) => ({ id: `p-${p.page}`, group: "Páginas", label: p.label, icon: p.icon, route: { page: p.page } as Route }));
  for (const m of MODULES) {
    const ph = PHASES.find((p) => p.id === m.phase)!;
    items.push({ id: `m-${m.id}`, group: "Módulos", label: `${m.id} — ${m.title}`, hint: `Fase ${ph.num}`, icon: "folder", route: { page: "modulo", id: m.id, tab: "plano" } });
  }
  for (const ph of PHASES) {
    if (ph.id === "F6") continue; // fecha com o projeto final e a certificação (páginas próprias)
    const cl = CLOSINGS[ph.id];
    items.push({
      id: `ph-${ph.id}`,
      group: "Fecho de fase",
      label: `Fecho da Fase ${ph.num} — ${ph.title}`,
      hint: "Exame e mini-projeto",
      icon: "layers",
      route: { page: "fase", phase: ph.id, tab: "plano" },
    });
    if (cl) {
      items.push({ id: `ph-${ph.id}-exame`, group: "Fecho de fase", label: `Exame da Fase ${ph.num}`, hint: `${cl.exam.minutes} min · ${cl.exam.total} valores`, icon: "timer", route: { page: "fase", phase: ph.id, tab: "exame" } });
      items.push({ id: `ph-${ph.id}-projeto`, group: "Fecho de fase", label: `Mini-projeto: ${cl.project.title}`, hint: `Fase ${ph.num}`, icon: "folder", route: { page: "fase", phase: ph.id, tab: "projeto" } });
    }
  }
  for (const [mid, c] of Object.entries(CONTENT)) {
    for (const s of c.lesson)
      items.push({ id: `s-${mid}-${s.id}`, group: "Secções da aula", label: `${s.num}. ${s.title}`, hint: mid, icon: "book", route: { page: "modulo", id: mid, tab: "aula", anchor: s.id } });
    for (const ex of c.exercises)
      items.push({ id: `e-${mid}-${ex.id}`, group: "Exercícios", label: `${ex.num}. ${ex.title}`, hint: mid, icon: "target", route: { page: "modulo", id: mid, tab: "exercicios", anchor: `ex-${ex.id}` } });
    for (const f of c.flashcards)
      items.push({ id: `f-${mid}-${f.id}`, group: "Termos", label: plain(f.front), hint: plain(f.back).slice(0, 80), icon: "cards", route: { page: "modulo", id: mid, tab: "aula", anchor: f.section } });
  }
  return items;
}

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { navigate } = useRouter();
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const index = useMemo(buildIndex, []);

  const results = useMemo(() => {
    const list = q.trim() ? index.filter((it) => matches(`${it.label} ${it.hint ?? ""} ${it.group}`, q)) : index.filter((it) => it.group === "Páginas" || it.id === "m-M1");
    return list.slice(0, 40);
  }, [q, index]);

  useEffect(() => {
    if (open) {
      setQ("");
      setSel(0);
      window.setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);
  useEffect(() => setSel(0), [q]);

  if (!open) return null;

  const go = (it: Item | undefined) => {
    if (!it) return;
    onClose();
    navigate(it.route);
  };

  let lastGroup = "";
  return (
    <div className="cmd-scrim" onMouseDown={onClose}>
      <div className="cmd" role="dialog" aria-modal="true" aria-label="Pesquisar" onMouseDown={(e) => e.stopPropagation()}>
        <div className="cmd-input">
          <Icon name="search" />
          <input
            ref={inputRef}
            id="cmd-q"
            value={q}
            placeholder="Pesquisar módulos, secções, exercícios e termos…"
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setSel((s) => Math.min(results.length - 1, s + 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSel((s) => Math.max(0, s - 1));
              } else if (e.key === "Enter") {
                e.preventDefault();
                go(results[sel]);
              } else if (e.key === "Escape") {
                onClose();
              }
            }}
          />
          <Kbd>esc</Kbd>
        </div>
        <ul className="cmd-list" role="listbox" aria-label="Resultados">
          {results.length === 0 && <li className="cmd-empty">Nada encontrado para "{q}".</li>}
          {results.map((it, i) => {
            const head = it.group !== lastGroup ? it.group : "";
            lastGroup = it.group;
            return (
              <React.Fragment key={it.id}>
                {head && <li className="cmd-group">{head}</li>}
                <li role="option" aria-selected={i === sel}>
                  <button type="button" className={`cmd-item ${i === sel ? "is-sel" : ""}`} onMouseEnter={() => setSel(i)} onClick={() => go(it)}>
                    <Icon name={it.icon} />
                    <span className="cmd-label">{it.label}</span>
                    {it.hint && <span className="cmd-hint">{it.hint}</span>}
                  </button>
                </li>
              </React.Fragment>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
