import React, { useState } from "react";
import { DOCS } from "../../content";
import { MODULE_PARTS, moduleMeta } from "../../content/course";
import type { ModuleContent, Reference } from "../../content/types";
import { fmtMinutes } from "../../lib/dates";
import { renderInline } from "../../lib/md";
import { moduleParts } from "../../lib/progress";
import { useMod } from "../../lib/store";
import { useRouter } from "../../lib/router";
import { CodeBlock } from "../../components/Blocks";
import { Card, Checkbox, Chip, Icon } from "../../components/ui";
import { TaskLinkButton } from "../Dashboard";

const PART_ICON: Record<string, string> = { aula: "book", apostila: "file", exercicios: "target", prova: "timer", gabarito: "eye" };

export function PlanTab({ c, id }: { c: ModuleContent | null; id?: string }) {
  const mid = c?.id ?? id!;
  const meta = moduleMeta(mid);
  const [mod, setMod] = useMod(mid);
  const { navigate } = useRouter();
  const [showCited, setShowCited] = useState(false);
  const code = DOCS[mid]?.code ?? {};
  const ctx = { onSection: (s: string) => navigate({ page: "modulo", id: mid, tab: "aula", anchor: s }) };

  const toggleReading = (key: string) => (v: boolean) =>
    setMod((m) => {
      if (v) m.readings[key] = true;
      else delete m.readings[key];
    });

  if (!c) {
    const docOnly = !!DOCS[mid] && Object.keys(DOCS[mid].files).length > 0;
    return (
      <div className="tab-body narrow">
        <Card title="O que se aprende">
          <p className="plan-learn">{meta.learn}.</p>
          {meta.note && (
            <aside className="callout callout-info">
              <p>{meta.note}</p>
            </aside>
          )}
          {meta.readings.length > 0 && (
            <div className="plan-group">
              <h3 className="eyebrow">Leituras principais</h3>
              <ul className="tasks">
                {meta.readings.map((r, i) => (
                  <li key={i} className="row-item plan-row">
                    <Checkbox id={`read-${mid}-${i}`} checked={!!mod.readings[`p${i}`]} onChange={toggleReading(`p${i}`)} label={r} />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
        {docOnly ? (
          <aside className="callout callout-info">
            <p className="callout-title">Modo documento</p>
            <p>
              O material deste módulo vem da pasta do curso ({DOCS[mid].folder}) e aparece nos separadores tal como foi escrito. A prova tem
              cronómetro e o gabarito só abre depois de tentar.
            </p>
          </aside>
        ) : (
          <aside className="callout callout-info">
            <p className="callout-title">Material por adicionar</p>
            <p>
              Quando a pasta <code>modulo-{String(meta.num).padStart(2, "0")}-…</code> existir na pasta do curso, a plataforma mostra-a aqui depois de
              sincronizar (ver o README do projeto). Pode marcar as leituras desde já.
            </p>
          </aside>
        )}
        {Object.keys(code).length > 0 && <CodeFiles code={code} />}
      </div>
    );
  }

  const totalTasks = c.sessions.reduce((a, s) => a + s.tasks.length, 0);
  const doneTasks = c.sessions.reduce((a, s) => a + s.tasks.filter((t) => mod.tasks[`${s.id}.${t.id}`]).length, 0);
  const parts = moduleParts(mid, mod) as Record<string, unknown>;

  return (
    <div className="tab-body plan">
      <div className="plan-grid">
        <Card
          className="plan-intro"
          title="No fim deste módulo deve saber"
          actions={
            <Chip icon="clock">
              Duração: {c.duration}
            </Chip>
          }
        >
          <ul className="plan-outcomes">
            {c.outcomes.map((o) => (
              <li key={o}>
                <Icon name="check" size={14} />
                <span>{o}</span>
              </li>
            ))}
          </ul>
          <aside className="callout callout-key">
            <p className="callout-title">Regra de ouro</p>
            <p>{renderInline(c.goldenRule)}</p>
          </aside>
          <div className="plan-group">
            <h3 className="eyebrow">Partes do módulo</h3>
            <ul className="tasks" aria-label="Partes do módulo">
              {MODULE_PARTS.map((p) => {
                const v = parts[p.id];
                const isDone = typeof v === "number" && v >= 1;
                return (
                  <li key={p.id}>
                    <button type="button" className="row-item plan-part" onClick={() => navigate({ page: "modulo", id: mid, tab: p.id })}>
                      <Icon name={PART_ICON[p.id] ?? "file"} size={15} />
                      <span className="plan-part-text">
                        <span className="plan-part-name">{p.label}</span>
                        <span className="plan-part-what">{p.what}</span>
                      </span>
                      {isDone && (
                        <span className="seg-done" aria-label="concluído">
                          <Icon name="check" size={9} />
                        </span>
                      )}
                      <span className="plan-part-time mono">{p.time}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </Card>

        <Card
          className="plan-sessions"
          ariaLabel="Sessões de estudo"
          title="Como estudar este módulo"
          actions={
            <Chip tone={doneTasks === totalTasks ? "ok" : "neutral"}>
              {doneTasks}/{totalTasks} tarefas
            </Chip>
          }
        >
          <p className="muted small">Quatro sessões de cerca de 1h30, duas por semana. A prova faz-se sem consulta, no fim da última sessão.</p>
          <ol className="plan-session-list">
            {c.sessions.map((s) => {
              const all = s.tasks.every((t) => mod.tasks[`${s.id}.${t.id}`]);
              return (
                <li key={s.id} className="plan-session">
                  <div className="plan-session-head">
                    <h3 className="plan-session-label">{s.label}</h3>
                    <span className="plan-session-min mono">{fmtMinutes(s.minutes)}</span>
                    {all && (
                      <Chip tone="ok" icon="check">
                        Feita
                      </Chip>
                    )}
                  </div>
                  <ul className="tasks">
                    {s.tasks.map((t) => {
                      const key = `${s.id}.${t.id}`;
                      return (
                        <li key={key} className="row-item plan-row">
                          <Checkbox
                            id={`task-${mid}-${key}`}
                            checked={!!mod.tasks[key]}
                            onChange={(v) =>
                              setMod((m) => {
                                if (v) m.tasks[key] = true;
                                else delete m.tasks[key];
                              })
                            }
                            label={renderInline(t.text, ctx)}
                          />
                          {t.link && (
                            <span className="plan-row-aside">
                              <TaskLinkButton moduleId={mid} link={t.link} />
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </li>
              );
            })}
          </ol>
        </Card>

        <Card className="plan-reads" title="Leituras e referências">
          <div className="plan-group">
            <h3 className="eyebrow">Leituras obrigatórias</h3>
            <ReadingList refs={c.readings.required} prefix="r" mid={mid} readings={mod.readings} onToggle={toggleReading} withLinks />
          </div>
          <div className="plan-group">
            <h3 className="eyebrow">Leituras complementares</h3>
            <ReadingList refs={c.readings.complementary} prefix="c" mid={mid} readings={mod.readings} onToggle={toggleReading} />
          </div>
          <div className="plan-group">
            <button type="button" className="link-btn small" aria-expanded={showCited} onClick={() => setShowCited(!showCited)}>
              <Icon name={showCited ? "down" : "right"} size={14} /> Estudos e documentos citados na aula ({c.readings.cited.length})
            </button>
            {showCited && (
              <ul className="plan-cited">
                {c.readings.cited.map((r, i) => (
                  <li key={i}>{renderInline(r)}</li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </div>

      {Object.keys(code).length > 0 && <CodeFiles code={code} />}
    </div>
  );
}

function ReadingList({
  refs,
  prefix,
  mid,
  readings,
  onToggle,
  withLinks,
}: {
  refs: Reference[];
  prefix: string;
  mid: string;
  readings: Record<string, unknown>;
  onToggle: (key: string) => (v: boolean) => void;
  withLinks?: boolean;
}) {
  return (
    <ul className="tasks">
      {refs.map((r, i) => (
        <li key={i} className="row-item plan-row">
          <Checkbox id={`read-${mid}-${prefix}${i}`} checked={!!readings[`${prefix}${i}`]} onChange={onToggle(`${prefix}${i}`)} label={renderInline(r.text)} />
          {withLinks && r.href && (
            <span className="plan-row-aside">
              <a href={r.href} target="_blank" rel="noopener noreferrer" className="link-btn small">
                abrir <Icon name="external" size={12} />
              </a>
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

function CodeFiles({ code }: { code: Record<string, string> }) {
  const [open, setOpen] = useState(false);
  return (
    <Card
      title="Código do módulo"
      actions={
        <button type="button" className="link-btn small" aria-expanded={open} onClick={() => setOpen(!open)}>
          <Icon name={open ? "down" : "right"} size={14} /> {open ? "Esconder" : "Mostrar"}
        </button>
      }
    >
      <p className="muted small">Exemplos testados, da pasta do curso. Correm no Colab ou localmente com Python 3 e scikit-learn.</p>
      {open && (
        <div className="stack">
          {Object.entries(code).map(([name, src]) => (
            <CodeBlock key={name} code={src} title={name} />
          ))}
        </div>
      )}
    </Card>
  );
}
