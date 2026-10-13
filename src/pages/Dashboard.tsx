import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { CONTENT, hasMaterial, isDocOnly } from "../content";
import { MODULES, PHASES, moduleMeta, phaseMeta } from "../content/course";
import type { TaskLink } from "../content/types";
import { diffDays, fmtDayMonth, fmtLong, fmtMinutes, fmtMonth, fmtShort, greeting, todayYMD } from "../lib/dates";
import { renderInline } from "../lib/md";
import {
  STATUS_LABEL,
  completedCount,
  currentModuleId,
  dueCards,
  lastWeeks,
  moduleFraction,
  moduleParts,
  phaseClosingState,
  phaseClosingSummary,
  phaseFraction,
  totalMinutes,
  weekStreak,
} from "../lib/progress";
import { useRouter } from "../lib/router";
import { computeSchedule, slotAt, weekNumber, type Schedule } from "../lib/schedule";
import { readMod, uid, useCore, useMod, useStore } from "../lib/store";
import { useFirstName } from "../lib/viewer";
import { Bar, Button, Card, Checkbox, Chip, FolderCard, Icon, PageHeader, PartsStack, Seg, StatTile } from "../components/ui";

export function planStatus(startDate: string, cur: string) {
  const s = computeSchedule(startDate);
  const today = todayYMD();
  const planned = s.modules[cur];
  if (today < s.start) return { s, tone: "neutral" as const, label: `O plano começa a ${fmtShort(s.start)}`, weeks: 0 };
  if (today > planned.end) {
    const w = Math.ceil(diffDays(planned.end, today) / 7);
    return { s, tone: "warn" as const, label: w === 1 ? "1 semana de atraso" : `${w} semanas de atraso`, weeks: -w };
  }
  if (today < planned.start) {
    const w = Math.floor(diffDays(today, planned.start) / 7);
    if (w >= 1) return { s, tone: "ok" as const, label: w === 1 ? "1 semana adiantado" : `${w} semanas adiantado`, weeks: w };
  }
  return { s, tone: "ok" as const, label: "Em dia com o plano", weeks: 0 };
}

export function Dashboard() {
  const { docs } = useStore();
  const [core] = useCore();
  const { navigate } = useRouter();
  const name = useFirstName();
  const cur = currentModuleId(docs);
  const meta = moduleMeta(cur);
  const ph = phaseMeta(meta.phase);
  const status = planStatus(core.settings.startDate, cur);
  const sched = status.s;
  const today = todayYMD();
  const wk = weekNumber(sched, today);
  const due = dueCards(docs, core).length;
  const done = completedCount(docs);
  const overall = MODULES.reduce((a, m) => a + moduleFraction(m.id, readMod(docs, m.id)), 0) / MODULES.length;
  const thisWeek = lastWeeks(core, 1)[0].minutes;
  const target = core.settings.weeklyTargetMin;
  const streak = weekStreak(core);
  const phEnd = sched.phases[ph.id].end;
  const daysLeft = diffDays(today, phEnd);
  const longDate = fmtLong(today);

  return (
    <div className="page">
      <PageHeader
        crumbs={[{ label: "Hoje", icon: "grid" }]}
        title={`${greeting()}${name ? `, ${name}` : ""}!`}
        subtitle={
          <>
            <span>{longDate.charAt(0).toUpperCase() + longDate.slice(1)}</span>
            <span className="dash-sep" aria-hidden="true">
              ·
            </span>
            {today < sched.start ? (
              <span>
                O plano começa a {fmtShort(sched.start)} e termina em {fmtShort(sched.end)}
              </span>
            ) : wk <= sched.totalWeeks ? (
              <>
                <span>
                  Semana {wk} de {sched.totalWeeks} do plano
                </span>
                <Chip tone={status.tone === "warn" ? "warn" : "ok"}>{status.label}</Chip>
              </>
            ) : (
              <span>O calendário do plano terminou em {fmtShort(sched.end)}</span>
            )}
          </>
        }
        actions={
          <Button variant="secondary" icon="calendar" onClick={() => navigate({ page: "calendario" })}>
            Calendário
          </Button>
        }
      />

      <div className="dash">
        <section className="dash-stats" aria-label="Resumo">
          <StatTile
            label="Progresso do curso"
            value={Math.round(overall * 100)}
            unit="%"
            note={`${done} de ${MODULES.length} módulos concluídos`}
            illus="docs"
          />
          <StatTile
            label="Horas esta semana"
            value={fmtMinutes(thisWeek)}
            unit={`de ${fmtMinutes(target)}`}
            note={
              streak > 0
                ? streak === 1
                  ? "1 semana com a meta cumprida"
                  : `${streak} semanas seguidas com a meta`
                : `${fmtMinutes(totalMinutes(core))} no total`
            }
            illus="clock"
          />
          <StatTile
            label="Cartões para rever"
            value={due}
            note={
              due ? (
                <span className="dash-note-link">
                  Rever agora <Icon name="arrowRight" size={12} />
                </span>
              ) : (
                "Aparecem ao ler a aula"
              )
            }
            illus="cards"
            onClick={() => navigate({ page: "revisao" })}
          />
          <StatTile
            label={`Fecho da Fase ${ph.num}`}
            value={Math.abs(daysLeft)}
            unit={daysLeft >= 0 ? (daysLeft === 1 ? "dia" : "dias") : "dias de atraso"}
            note={daysLeft >= 0 ? `Previsto a ${fmtShort(phEnd)}` : `Era a ${fmtShort(phEnd)}`}
            illus="calendar"
          />
        </section>

        <div className="dash-main">
          <StudyHours />
          <NextSession moduleId={cur} />
        </div>

        <PhaseModules phaseId={ph.id} end={phEnd} />

        <div className="grid-2">
          <Milestones sched={sched} cur={cur} />
          <PhasesCard sched={sched} current={ph.id} />
        </div>
      </div>
    </div>
  );
}

function linkLabel(l?: TaskLink): string {
  if (!l) return "";
  if (l.kind === "section") return "Abrir a secção";
  if (l.kind === "url") return "Abrir";
  return { exercicios: "Ir aos exercícios", apostila: "Abrir a apostila", prova: "Ir à prova", aula: "Abrir a aula", plano: "Plano", gabarito: "Gabarito", notas: "Notas" }[l.tab];
}

export function useFollowLink(moduleId: string) {
  const { navigate } = useRouter();
  return (l?: TaskLink) => {
    if (!l || l.kind === "url") return;
    if (l.kind === "section") navigate({ page: "modulo", id: moduleId, tab: "aula", anchor: l.id });
    else navigate({ page: "modulo", id: moduleId, tab: l.tab });
  };
}

/** Ligação de uma tarefa: links externos são <a> normais (o viewer não garante window.open). */
export function TaskLinkButton({ moduleId, link }: { moduleId: string; link: TaskLink }) {
  const follow = useFollowLink(moduleId);
  if (link.kind === "url")
    return (
      <a className="link-btn small" href={link.href} target="_blank" rel="noopener noreferrer">
        {linkLabel(link)} <Icon name="external" size={13} />
      </a>
    );
  return (
    <button type="button" className="link-btn small" onClick={() => follow(link)}>
      {linkLabel(link)} <Icon name="right" size={13} />
    </button>
  );
}

// ---------- próxima sessão (como "Recent contracts")

function NextSession({ moduleId }: { moduleId: string }) {
  const [mod, setMod] = useMod(moduleId);
  const { navigate } = useRouter();
  const follow = useFollowLink(moduleId);
  const meta = moduleMeta(moduleId);
  const c = CONTENT[moduleId];

  const nextSession = c?.sessions.find((s) => s.tasks.some((t) => !mod.tasks[`${s.id}.${t.id}`]));
  const nextTask = nextSession?.tasks.find((t) => !mod.tasks[`${nextSession.id}.${t.id}`]);

  return (
    <Card
      ariaLabel="Próxima sessão"
      title={
        <div className="dash-head-text">
          <h2 className="card-title">Próxima sessão</h2>
          <p className="dash-head-sub">
            {meta.id} · {meta.title}
          </p>
        </div>
      }
      actions={
        c && nextSession ? (
          <Chip icon="clock">
            {nextSession.label} · {fmtMinutes(nextSession.minutes)}
          </Chip>
        ) : undefined
      }
    >
      {c && nextSession ? (
        <>
          <div className="dash-cols" aria-hidden="true">
            <span>Tarefa</span>
            <span>Abrir</span>
          </div>
          <ul className="dash-list">
            {nextSession.tasks.map((t) => {
              const key = `${nextSession.id}.${t.id}`;
              return (
                <li key={key} className="row-item dash-task">
                  <span className="dash-task-main">
                    <Checkbox
                      id={`dash-${moduleId}-${key}`}
                      checked={!!mod.tasks[key]}
                      onChange={(v) =>
                        setMod((m) => {
                          if (v) m.tasks[key] = true;
                          else delete m.tasks[key];
                        })
                      }
                      label={renderInline(t.text)}
                    />
                  </span>
                  {t.link && (
                    <span className="dash-task-link">
                      <TaskLinkButton moduleId={moduleId} link={t.link} />
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
          <div className="dash-next-actions">
            <Button
              variant="primary"
              iconRight="right"
              className="dash-btn-fit"
              onClick={() =>
                nextTask?.link && nextTask.link.kind !== "url"
                  ? follow(nextTask.link)
                  : navigate({ page: "modulo", id: moduleId, tab: nextTask?.link?.kind === "url" ? "plano" : "aula" })
              }
            >
              {nextTask ? `Continuar: ${nextTask.text.replace(/\*|`/g, "")}` : "Abrir a aula"}
            </Button>
            <Button variant="ghost" onClick={() => navigate({ page: "modulo", id: moduleId, tab: "plano" })}>
              Plano do módulo
            </Button>
          </div>
        </>
      ) : c ? (
        <>
          <p className="dash-next-text">Todas as sessões estão marcadas. {mod.passedAt ? "Módulo concluído." : "Falta passar na prova (14 valores)."}</p>
          <div className="dash-next-actions">
            <Button variant="primary" iconRight="right" onClick={() => navigate({ page: "modulo", id: moduleId, tab: mod.passedAt ? "plano" : "prova" })}>
              {mod.passedAt ? "Ver o módulo" : "Ir à prova"}
            </Button>
          </div>
        </>
      ) : isDocOnly(moduleId) ? (
        <>
          <p className="dash-next-text">O material deste módulo está em modo documento: aula, apostila, exercícios, prova e gabarito da pasta do curso.</p>
          <div className="dash-next-actions">
            <Button variant="primary" iconRight="right" onClick={() => navigate({ page: "modulo", id: moduleId, tab: "aula" })}>
              Abrir a aula
            </Button>
          </div>
        </>
      ) : (
        <>
          <p className="dash-next-text">O material deste módulo ainda não foi adicionado. Entretanto, pode ver o que se aprende e as leituras principais.</p>
          <div className="dash-next-actions">
            <Button variant="secondary" iconRight="right" onClick={() => navigate({ page: "modulo", id: moduleId, tab: "plano" })}>
              Ver o módulo
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}

// ---------- horas de estudo (como "Signed over time")

type WeekPoint = { week: string; minutes: number; actual: number; plan: number };

const RANGES = [
  { id: "12", label: "12 semanas" },
  { id: "26", label: "26 semanas" },
];

function StudyHours() {
  const [core, setCore] = useCore();
  const { docs } = useStore();
  const [range, setRange] = useState("12");
  const [open, setOpen] = useState(false);
  const [mins, setMins] = useState("");
  const [date, setDate] = useState(todayYMD());
  const target = core.settings.weeklyTargetMin;
  const n = Number(range);
  const sched = useMemo(() => computeSchedule(core.settings.startDate), [core.settings.startDate]);

  // horas acumuladas no intervalo: estudadas e previstas (a meta semanal, só em semanas de trabalho do plano)
  const series = useMemo<WeekPoint[]>(() => {
    let actual = 0;
    let plan = 0;
    return lastWeeks(core, n).map((w) => {
      actual += w.minutes;
      const slot = slotAt(sched, w.week);
      if (slot && slot.kind !== "break") plan += target;
      return { week: w.week, minutes: w.minutes, actual, plan };
    });
  }, [core, n, sched, target]);
  const last = series[series.length - 1];
  const recent = useMemo(() => [...core.log].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 4), [core.log]);

  return (
    <Card
      ariaLabel="Horas de estudo"
      title="Horas de estudo"
      actions={
        <>
          <span className="dash-legend">
            <span className="dash-key">
              <span className="dash-swatch" aria-hidden="true" />
              Estudadas
            </span>
            <span className="dash-key">
              <span className="dash-swatch is-plan" aria-hidden="true" />
              Plano
            </span>
          </span>
          <Seg label="Intervalo do gráfico" options={RANGES} value={range} onChange={setRange} />
        </>
      }
    >
      <HoursChart series={series} />

      <div className="dash-hours-foot">
        <span className="dash-hours-sum">
          {fmtMinutes(last.actual)} em {n} semanas · meta de {fmtMinutes(target)} por semana
        </span>
        <button type="button" className="link-btn small" aria-expanded={open} aria-controls="dash-log" onClick={() => setOpen((o) => !o)}>
          <Icon name={open ? "up" : "plus"} size={14} />
          Registar tempo
        </button>
      </div>

      <div id="dash-log" className="dash-log" hidden={!open}>
        <form
          className="dash-log-form"
          onSubmit={(e) => {
            e.preventDefault();
            const m = Math.round(Number(mins.replace(",", ".")));
            if (!m || m < 1 || m > 600) return;
            setCore((c) => {
              c.log.push({ id: uid(), date, minutes: m, moduleId: currentModuleId(docs) });
            });
            setMins("");
          }}
        >
          <label htmlFor="log-min" className="dash-log-label">
            Minutos
          </label>
          <input id="log-min" className="input input-sm dash-log-min" inputMode="numeric" placeholder="minutos" value={mins} onChange={(e) => setMins(e.target.value)} />
          <input id="log-date" className="input input-sm" type="date" value={date} max={todayYMD()} onChange={(e) => setDate(e.target.value)} aria-label="Data" />
          <Button size="sm" variant="secondary" type="submit" icon="plus">
            Registar
          </Button>
        </form>
        {recent.length > 0 && (
          <ul className="dash-list">
            {recent.map((e) => (
              <li key={e.id} className="row-item dash-log-row">
                <span className="dash-date mono">{fmtDayMonth(e.date)}</span>
                <span className="dash-log-mins">{fmtMinutes(e.minutes)}</span>
                <span className="dash-log-mod">{e.moduleId ?? ""}</span>
                <button
                  type="button"
                  className="icon-btn"
                  aria-label="Apagar registo"
                  onClick={() =>
                    setCore((c) => {
                      c.log = c.log.filter((x) => x.id !== e.id);
                    })
                  }
                >
                  <Icon name="trash" size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}

/** Largura do contentor em píxeis, para desenhar o SVG sem esticar o texto. */
function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(Math.round(el.clientWidth));
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      const w = Math.round(entries[0].contentRect.width);
      setWidth((prev) => (prev === w ? prev : w));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

/** Passo "redondo" para o eixo: 1, 2, 5, 10, 20, 50… (nunca abaixo de 1 hora). */
function niceStep(raw: number): number {
  const pow = Math.pow(10, Math.floor(Math.log10(Math.max(raw, 1))));
  for (const k of [1, 2, 5, 10]) if (k * pow >= raw) return Math.max(1, k * pow);
  return 10 * pow;
}

/** Curva monótona (Fritsch–Carlson): suave e sem ultrapassar os valores, como as linhas da referência. */
function monotonePath(pts: [number, number][]): string {
  const n = pts.length;
  const f = (v: number) => Math.round(v * 10) / 10;
  if (n === 0) return "";
  if (n === 1) return `M${f(pts[0][0])},${f(pts[0][1])}`;
  const dx: number[] = [];
  const m: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    dx[i] = pts[i + 1][0] - pts[i][0];
    m[i] = (pts[i + 1][1] - pts[i][1]) / dx[i];
  }
  const t: number[] = [m[0]];
  for (let i = 1; i < n - 1; i++) t[i] = m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2;
  t[n - 1] = m[n - 2];
  for (let i = 0; i < n - 1; i++) {
    if (m[i] === 0) {
      t[i] = 0;
      t[i + 1] = 0;
      continue;
    }
    const a = t[i] / m[i];
    const b = t[i + 1] / m[i];
    const s = a * a + b * b;
    if (s > 9) {
      const k = 3 / Math.sqrt(s);
      t[i] = k * a * m[i];
      t[i + 1] = k * b * m[i];
    }
  }
  let d = `M${f(pts[0][0])},${f(pts[0][1])}`;
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i] / 3;
    d += ` C${f(pts[i][0] + h)},${f(pts[i][1] + t[i] * h)} ${f(pts[i + 1][0] - h)},${f(pts[i + 1][1] - t[i + 1] * h)} ${f(pts[i + 1][0])},${f(pts[i + 1][1])}`;
  }
  return d;
}

const CHART_H = 220;
const PAD = { t: 10, r: 6, b: 26, l: 40 };

function HoursChart({ series }: { series: WeekPoint[] }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const hatchId = `dash-hatch-${useId().replace(/:/g, "")}`;
  const n = series.length;
  const last = series[n - 1];

  let body: React.ReactNode = null;
  if (width > 0 && n > 1) {
    const plotW = Math.max(40, width - PAD.l - PAD.r);
    const plotH = CHART_H - PAD.t - PAD.b;
    const y0 = PAD.t + plotH;
    const dataMax = Math.max(4, ...series.map((p) => Math.max(p.actual, p.plan) / 60));
    const step = niceStep(dataMax / 4);
    const yMax = Math.ceil(dataMax / step) * step;
    const ticks: number[] = [];
    for (let v = 0; v <= yMax + 1e-9; v += step) ticks.push(v);
    const x = (i: number) => PAD.l + (i / (n - 1)) * plotW;
    const y = (min: number) => y0 - (min / 60 / yMax) * plotH;

    // rótulos do eixo x a partir da semana atual, para trás, sem se atropelarem
    const wanted = Math.min(7, Math.max(2, Math.floor(plotW / 64)));
    const every = Math.max(1, Math.ceil((n - 1) / (wanted - 1)));
    const xLabels = series.map((_, i) => i).filter((i) => (n - 1 - i) % every === 0);

    const actualPts = series.map((p, i) => [x(i), y(p.actual)] as [number, number]);
    const planPts = series.map((p, i) => [x(i), y(p.plan)] as [number, number]);
    const actualLine = monotonePath(actualPts);
    const area = `${actualLine} L${x(n - 1)},${y0} L${x(0)},${y0} Z`;

    body = (
      <svg
        width={width}
        height={CHART_H}
        viewBox={`0 0 ${width} ${CHART_H}`}
        role="img"
        aria-label={`Horas acumuladas nas últimas ${n} semanas: ${fmtMinutes(last.actual)} estudadas, ${fmtMinutes(last.plan)} previstas no plano.`}
      >
        <defs>
          <pattern id={hatchId} className="dash-chart-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
            <line x1="3" y1="0" x2="3" y2="6" />
          </pattern>
        </defs>

        {ticks.map((v) => {
          const ty = Math.round(y0 - (v / yMax) * plotH) + 0.5;
          return (
            <g key={v}>
              <line className="dash-chart-grid" x1={PAD.l} x2={PAD.l + plotW} y1={ty} y2={ty} />
              <text className="dash-chart-axis" x={PAD.l - 8} y={ty} dy="0.32em" textAnchor="end">
                {v}h
              </text>
            </g>
          );
        })}

        {xLabels.map((i) => (
          <text key={i} className="dash-chart-axis" x={x(i)} y={CHART_H - 6} textAnchor={i === n - 1 ? "end" : i === 0 ? "start" : "middle"}>
            {fmtDayMonth(series[i].week)}
          </text>
        ))}

        {series.map((p, i) => {
          const x0 = i === 0 ? PAD.l : (x(i - 1) + x(i)) / 2;
          const x1 = i === n - 1 ? PAD.l + plotW : (x(i) + x(i + 1)) / 2;
          return (
            <rect key={p.week} className="dash-chart-hit" x={x0} y={PAD.t} width={Math.max(0, x1 - x0)} height={plotH}>
              <title>{`Semana de ${fmtShort(p.week)}: ${fmtMinutes(p.minutes)} · acumulado ${fmtMinutes(p.actual)} de ${fmtMinutes(p.plan)} previstas`}</title>
            </rect>
          );
        })}

        <path className="dash-chart-area" d={area} fill={`url(#${hatchId})`} />
        <path className="dash-chart-plan" d={monotonePath(planPts)} />
        <path className="dash-chart-actual" d={actualLine} />
        <circle className="dash-chart-dot" cx={x(n - 1)} cy={y(last.actual)} r={3.5} />
      </svg>
    );
  }

  return (
    <div ref={ref} className="dash-chart">
      {body}
    </div>
  );
}

// ---------- módulos da fase atual (como "Your Contacts")

function PhaseModules({ phaseId, end }: { phaseId: string; end: string }) {
  const { docs } = useStore();
  const { navigate } = useRouter();
  const ph = phaseMeta(phaseId);
  const pct = Math.round(phaseFraction(ph.id, docs) * 100);
  const isFinal = ph.id === "F6";
  const [core] = useCore();
  const closing = isFinal ? null : phaseClosingSummary(phaseClosingState(ph.id, core));

  return (
    <Card
      ariaLabel={`Fase ${ph.num}`}
      title={
        <div className="dash-head-text">
          <h2 className="card-title dash-title-dot">
            <span className={`phase-dot ph-${ph.num}`} aria-hidden="true" />
            Fase {ph.num} · {ph.title}
          </h2>
          <p className="dash-head-sub">
            {pct}% concluído · fecho previsto a {fmtShort(end)}
          </p>
        </div>
      }
      actions={
        <button type="button" className="link-btn small" onClick={() => navigate({ page: "percurso" })}>
          Ver percurso <Icon name="right" size={13} />
        </button>
      }
    >
      <div className="dash-folders">
        {ph.modules.map((id) => {
          const m = readMod(docs, id);
          const mm = moduleMeta(id);
          const title = (
            <>
              <span className="dash-mod-id">{id}</span>
              {mm.title}
            </>
          );
          if (!hasMaterial(id) && !m.passedAt)
            return (
              <FolderCard
                key={id}
                muted
                dot={ph.num}
                meta={<span className="dash-folder-note">{STATUS_LABEL["sem-material"]}</span>}
                title={title}
                desc={mm.learn}
                footer={
                  <Button variant="secondary" onClick={() => navigate({ page: "modulo", id, tab: "plano" })}>
                    Ver plano
                  </Button>
                }
              />
            );
          const parts = moduleParts(id, m);
          const d = parts.detail;
          return (
            <FolderCard
              key={id}
              dot={ph.num}
              meta={
                <>
                  <span className="dash-pct mono">{Math.round(moduleFraction(id, m) * 100)}%</span>
                  {/* o detalhe (secções lidas, exercícios feitos, melhor nota) fica na dica e no nome acessível */}
                  <PartsStack
                    parts={[
                      { label: d.secs ? `Aula ${d.read}/${d.secs}` : "Aula", value: parts.aula },
                      { label: "Apostila", value: parts.apostila },
                      { label: d.exTotal ? `Exercícios ${d.exDone}/${d.exTotal}` : "Exercícios", value: parts.exercicios },
                      { label: m.best !== undefined ? `Prova ${String(m.best).replace(".", ",")}` : "Prova", value: parts.prova },
                    ]}
                  />
                </>
              }
              title={title}
              desc={mm.learn}
              footer={
                <>
                  <Button variant="secondary" iconRight="arrowRight" onClick={() => navigate({ page: "modulo", id, tab: "plano" })}>
                    Abrir
                  </Button>
                  <Button variant="ghost" icon="timer" onClick={() => navigate({ page: "modulo", id, tab: "prova" })}>
                    Prova
                  </Button>
                </>
              }
            />
          );
        })}

        <FolderCard
          muted={!closing}
          dot={ph.num}
          onOpen={isFinal ? undefined : () => navigate({ page: "fase", phase: ph.id, tab: "plano" })}
          meta={
            <>
              <span className="dash-pct mono">{fmtDayMonth(end)}</span>
              {closing && <Chip tone={closing.tone}>{closing.label}</Chip>}
            </>
          }
          title={isFinal ? "Projeto final e certificação" : `Fecho da Fase ${ph.num}`}
          desc={isFinal ? ph.closing.project.description : `${ph.closing.exam} Mini-projeto: ${ph.closing.project.title}.`}
          footer={
            <>
              {isFinal ? (
                <Button variant="secondary" icon="award" onClick={() => navigate({ page: "certificacoes" })}>
                  Certificação
                </Button>
              ) : (
                <Button variant="secondary" icon="timer" onClick={() => navigate({ page: "fase", phase: ph.id, tab: "exame" })}>
                  Exame
                </Button>
              )}
              <Button
                variant="ghost"
                icon="folder"
                onClick={() => navigate(isFinal ? { page: "projetos" } : { page: "fase", phase: ph.id, tab: "projeto" })}
              >
                {isFinal ? "Projeto final" : "Mini-projeto"}
              </Button>
            </>
          }
        />
      </div>
    </Card>
  );
}

// ---------- marcos e fases

function Milestones({ sched, cur }: { sched: Schedule; cur: string }) {
  const s = sched;
  const meta = moduleMeta(cur);
  const ph = phaseMeta(meta.phase);
  const today = todayYMD();
  const items = [
    { date: s.modules[cur].end, label: `Fim previsto do ${cur}`, sub: "Prova de módulo: 14 valores para avançar", icon: "flag" },
    {
      date: s.phases[ph.id].end,
      label: `Fecho da Fase ${ph.num}`,
      sub: ph.id === "F6" ? "Projeto final e certificação" : `Exame da fase e mini-projeto: ${ph.closing.project.title.toLowerCase()}`,
      icon: "layers",
    },
    ...s.milestones.filter((m) => m.date >= today).map((m) => ({ date: m.date, label: `Certificação ${m.label}`, sub: "Data aproximada pelo calendário do plano", icon: "award" })),
  ]
    .filter((x, i, arr) => arr.findIndex((y) => y.label === x.label) === i)
    .slice(0, 4);
  return (
    <Card title="Próximos marcos" ariaLabel="Próximos marcos">
      <ol className="dash-list">
        {items.map((m) => (
          <li key={m.label} className="row-item dash-ms">
            <Icon name={m.icon} className="dash-ms-icon" />
            <span className="dash-ms-main">
              <span className="dash-ms-label">{m.label}</span>
              <span className="dash-ms-sub">{m.sub}</span>
            </span>
            <span className="dash-date mono">{fmtShort(m.date)}</span>
          </li>
        ))}
      </ol>
    </Card>
  );
}

function PhasesCard({ sched, current }: { sched: Schedule; current: string }) {
  const { docs } = useStore();
  const { navigate } = useRouter();
  return (
    <Card
      title="Fases"
      ariaLabel="Fases"
      actions={
        <button type="button" className="link-btn small" onClick={() => navigate({ page: "percurso" })}>
          Percurso <Icon name="right" size={13} />
        </button>
      }
    >
      <ul className="dash-list">
        {PHASES.map((p) => (
          <li key={p.id} className={`row-item dash-phase-row ${p.id === current ? "is-current" : ""}`}>
            <span className={`phase-dot ph-${p.num}`} aria-hidden="true" />
            <span className="dash-phase-name">
              <span className="dash-phase-num">F{p.num}</span>
              {p.title}
            </span>
            <span className="dash-phase-bar">
              <Bar value={phaseFraction(p.id, docs)} thin label={`Fase ${p.num}`} />
            </span>
            <span className="dash-date dash-phase-date mono">{fmtMonth(sched.phases[p.id].end)}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
