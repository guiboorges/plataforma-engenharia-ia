import React from "react";
import { MODULES, PHASES, moduleMeta } from "../content/course";
import { addDays, diffDays, fmtShort, monthShort, parseYMD, todayYMD } from "../lib/dates";
import { STATUS_LABEL, currentModuleId, moduleStatus } from "../lib/progress";
import { useRouter } from "../lib/router";
import { computeSchedule } from "../lib/schedule";
import { readMod, useCore, useStore } from "../lib/store";
import { Card, Chip, PageHeader, StatTile } from "../components/ui";
import { planStatus } from "./Dashboard";

export function Calendar() {
  const [core] = useCore();
  const { docs } = useStore();
  const { navigate } = useRouter();
  const s = computeSchedule(core.settings.startDate);
  const total = diffDays(s.start, addDays(s.end, 1));
  const x = (d: string) => (diffDays(s.start, d) / total) * 100;
  const w = (a: string, b: string) => ((diffDays(a, b) + 1) / total) * 100;
  const today = todayYMD();
  const cur = currentModuleId(docs);
  const status = planStatus(core.settings.startDate, cur);
  const showToday = today >= s.start && today <= s.end;
  const pauseWeeks = s.breaks.reduce((n, b) => n + b.weeks, 0);
  const curSlot = s.modules[cur];

  // meses do eixo
  const months: { label: string; left: number; year?: number }[] = [];
  const d0 = parseYMD(s.start);
  let m = new Date(d0.getFullYear(), d0.getMonth() + 1, 1);
  while (m <= parseYMD(s.end)) {
    const ymd = `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, "0")}-01`;
    months.push({ label: monthShort(m.getMonth()), left: x(ymd), year: m.getMonth() === 0 ? m.getFullYear() : undefined });
    m = new Date(m.getFullYear(), m.getMonth() + 1, 1);
  }

  const legend = (
    <div className="cal-legend">
      <span className="cal-key">
        <span className="cal-sw cal-sw-bar" /> previsto
      </span>
      <span className="cal-key">
        <span className="cal-sw cal-sw-bar is-em-curso" /> em curso
      </span>
      <span className="cal-key">
        <span className="cal-sw cal-sw-bar is-concluido" /> concluído
      </span>
      <span className="cal-key">
        <span className="cal-sw cal-sw-break" /> pausas
      </span>
      <span className="cal-key">
        <span className="cal-sw cal-sw-today" /> hoje
      </span>
      <span className="cal-key">
        <span className="cal-sw cal-sw-ms" /> certificação
      </span>
    </div>
  );

  return (
    <div className="page">
      <PageHeader
        crumbs={[{ label: "Calendário", icon: "calendar" }]}
        title="Calendário"
        subtitle={
          <>
            <span className="cal-sub">
              {fmtShort(s.start)} a {fmtShort(s.end)} · {s.totalWeeks} semanas, já com 6 de pausa: Natal de 2026 na Fase 1, verão de 2027 entre as Fases 3 e 4, e Natal de 2027 na Fase 5. A data de início muda-se nas Definições.
            </span>
            <Chip tone={status.tone === "warn" ? "warn" : "ok"}>{status.label}</Chip>
          </>
        }
      />

      <div className="grid-3">
        <StatTile label="Duração total" value={s.totalWeeks} unit="semanas" note={`${fmtShort(s.start)} a ${fmtShort(s.end)}`} illus="calendar" />
        <StatTile
          label="Semanas de pausa"
          value={pauseWeeks}
          unit="semanas"
          note={s.breaks.map((b) => b.label.replace(/^Pausa de /, "")).join(", ")}
          illus="clock"
        />
        <StatTile
          label="Módulo atual"
          value={cur}
          note={`Fim previsto a ${fmtShort(curSlot.end)}`}
          illus="folder"
          onClick={() => navigate({ page: "modulo", id: cur, tab: "plano" })}
        />
      </div>

      <Card title="Cronograma" actions={legend}>
        <div className="cal-scroll">
          <div className="cal-gantt">
            <div className="cal-row cal-axis" aria-hidden="true">
              <span className="cal-label" />
              <span className="cal-track">
                {months.map((mm, i) => (
                  <span key={i} className={`cal-month ${mm.year ? "is-year" : ""}`} style={{ left: `${mm.left}%` }}>
                    {mm.year ?? mm.label}
                  </span>
                ))}
              </span>
            </div>

            <div className="cal-body">
              <div className="cal-under" aria-hidden="true">
                {months.map((mm, i) => (
                  <span key={i} className="cal-gridline" style={{ left: `${mm.left}%` }} />
                ))}
              </div>

              {PHASES.map((p) => (
                <React.Fragment key={p.id}>
                  <div className="cal-row cal-phase">
                    <span className="cal-label">
                      <span className={`phase-dot ph-${p.num}`} aria-hidden="true" />
                      <span className="cal-id">F{p.num}</span>
                      <span className="cal-label-text">{p.title}</span>
                    </span>
                    <span className="cal-track">
                      <span className="cal-pbar" style={{ left: `${x(s.phases[p.id].start)}%`, width: `${w(s.phases[p.id].start, s.phases[p.id].end)}%` }} />
                    </span>
                  </div>
                  {p.modules.map((mid) => {
                    const sl = s.modules[mid];
                    const st = moduleStatus(mid, readMod(docs, mid));
                    return (
                      <button key={mid} type="button" className="cal-row cal-mod" onClick={() => navigate({ page: "modulo", id: mid, tab: "plano" })}>
                        <span className="cal-label">
                          <span className="cal-id">{mid}</span>
                          <span className="cal-label-text">{moduleMeta(mid).title}</span>
                          <span className="sr-only">
                            , {fmtShort(sl.start)} a {fmtShort(sl.end)}, {STATUS_LABEL[st]}
                          </span>
                        </span>
                        <span className="cal-track">
                          <span className={`cal-mbar is-${st}`} style={{ left: `${x(sl.start)}%`, width: `${w(sl.start, sl.end)}%` }} />
                        </span>
                      </button>
                    );
                  })}
                </React.Fragment>
              ))}

              <div className="cal-row cal-phase">
                <span className="cal-label">
                  <span className="cal-sw cal-sw-ms" aria-hidden="true" />
                  <span className="cal-label-text">Certificações</span>
                </span>
                <span className="cal-track" />
              </div>
              {s.milestones.map((ms) => (
                <div key={ms.id} className="cal-row cal-ms">
                  <span className="cal-label">
                    <span className="cal-label-text">{ms.label}</span>
                  </span>
                  <span className="cal-track">
                    <span className="cal-ms-date" style={{ left: `${x(ms.date)}%` }}>
                      {fmtShort(ms.date)}
                    </span>
                    <span className={`cal-diamond ${ms.optional ? "is-opt" : ""}`} style={{ left: `${x(ms.date)}%` }} title={`${ms.label}: ${fmtShort(ms.date)}`} />
                  </span>
                </div>
              ))}

              <div className="cal-over" aria-hidden="true">
                {s.breaks.map((b) => (
                  <span key={b.id} className="cal-break" style={{ left: `${x(b.start)}%`, width: `${w(b.start, b.end)}%` }} title={b.label} />
                ))}
                {showToday && <span className="cal-today" style={{ left: `${x(today)}%` }} />}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Módulo a módulo">
        <div className="table-wrap">
          <table className="cal-table">
            <thead>
              <tr>
                <th scope="col">Módulo</th>
                <th scope="col">Semanas</th>
                <th scope="col">Previsto</th>
                <th scope="col">Estado</th>
              </tr>
            </thead>
            <tbody>
              {s.slots
                .filter((sl) => sl.kind !== "module" || MODULES.some((mm) => mm.id === sl.id))
                .map((sl) => {
                  if (sl.kind === "break")
                    return (
                      <tr key={sl.id} className="cal-tr-break">
                        <td colSpan={2}>{sl.label}</td>
                        <td className="cal-dates">
                          {fmtShort(sl.start)} – {fmtShort(sl.end)}
                        </td>
                        <td />
                      </tr>
                    );
                  if (sl.kind === "closing")
                    return (
                      <tr key={sl.id} className="cal-tr-closing">
                        <td>{sl.label}</td>
                        <td className="cal-num">1</td>
                        <td className="cal-dates">
                          {fmtShort(sl.start)} – {fmtShort(sl.end)}
                        </td>
                        <td />
                      </tr>
                    );
                  const st = moduleStatus(sl.id, readMod(docs, sl.id));
                  return (
                    <tr key={sl.id} className={sl.id === cur ? "cal-tr-current" : ""} aria-current={sl.id === cur ? "step" : undefined}>
                      <td>
                        <button type="button" className="cal-link" onClick={() => navigate({ page: "modulo", id: sl.id, tab: "plano" })}>
                          <span className="cal-id">{sl.id}</span>
                          <span>{moduleMeta(sl.id).title}</span>
                        </button>
                      </td>
                      <td className="cal-num">{sl.weeks}</td>
                      <td className="cal-dates">
                        {fmtShort(sl.start)} – {fmtShort(sl.end)}
                      </td>
                      <td>
                        <Chip tone={st === "concluido" ? "ok" : st === "em-curso" ? "accent" : "neutral"}>{STATUS_LABEL[st]}</Chip>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
