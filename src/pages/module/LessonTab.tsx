import React, { useEffect, useState } from "react";
import type { ModuleContent } from "../../content/types";
import { todayYMD } from "../../lib/dates";
import { renderInline } from "../../lib/md";
import { useRouter } from "../../lib/router";
import { useMod } from "../../lib/store";
import { Blocks, type BlocksCtx } from "../../components/Blocks";
import { Bar, Button, Icon } from "../../components/ui";

export function LessonTab({ c, anchor }: { c: ModuleContent; anchor?: string }) {
  const [mod, setMod] = useMod(c.id);
  const { navigate } = useRouter();
  const [active, setActive] = useState(anchor ?? c.lesson[0].id);
  const readCount = c.lesson.filter((s) => mod.sections[s.id]).length;
  const totalMin = c.lesson.reduce((a, s) => a + s.minutes, 0);

  useEffect(() => {
    if (anchor) window.setTimeout(() => document.getElementById(anchor)?.scrollIntoView({ block: "start" }), 30);
  }, [anchor]);

  useEffect(() => {
    const els = c.lesson.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id);
      },
      { rootMargin: "-20% 0px -60% 0px" },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [c]);

  const ctx: BlocksCtx = {
    moduleId: c.id,
    checks: mod.checks,
    onCheck: (id, choice) =>
      setMod((m) => {
        if (choice < 0) delete m.checks[id];
        else m.checks[id] = choice;
      }),
    onSection: (id) => navigate({ page: "modulo", id: c.id, tab: "aula", anchor: id }),
  };

  const toggleRead = (id: string, v: boolean) =>
    setMod((m) => {
      if (v) m.sections[id] = todayYMD();
      else delete m.sections[id];
    });

  return (
    <div className="lesson">
      <nav className="lesson-toc" aria-label="Secções da aula">
        <div className="lesson-toc-head">
          <p className="eyebrow">
            Aula · {readCount}/{c.lesson.length} lidas · ~{totalMin} min
          </p>
          <Bar value={readCount / c.lesson.length} thin label="Secções lidas" />
        </div>
        <ol className="lesson-toc-list">
          {c.lesson.map((s) => {
            const read = !!mod.sections[s.id];
            return (
              <li key={s.id}>
                <a
                  href={`#${c.id}-aula-${s.id}`}
                  className={`lesson-toc-link ${active === s.id ? "is-active" : ""}`}
                  aria-current={active === s.id ? "location" : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate({ page: "modulo", id: c.id, tab: "aula", anchor: s.id });
                  }}
                >
                  <span className="lesson-toc-n mono">{s.num}</span>
                  <span className="lesson-toc-title">{s.title}</span>
                  {read && (
                    <span className="lesson-toc-check">
                      <Icon name="check" size={14} />
                      <span className="sr-only">lida</span>
                    </span>
                  )}
                </a>
              </li>
            );
          })}
        </ol>
      </nav>

      <article className="lesson-body">
        <p className="lede lesson-lede">{renderInline(c.intro)}</p>
        {c.lesson.map((s, i) => {
          const read = !!mod.sections[s.id];
          const next = c.lesson[i + 1];
          return (
            <section key={s.id} id={s.id} className="lesson-section" aria-labelledby={`${s.id}-h`}>
              <header className="lesson-sec-head">
                <p className="eyebrow">
                  Secção {s.num} · {s.minutes} min
                </p>
                <h2 id={`${s.id}-h`}>{s.title}</h2>
              </header>
              <div className="prose lesson-sec-body">
                <Blocks blocks={s.blocks} ctx={ctx} />
              </div>
              <footer className="lesson-sec-foot">
                <Button variant={read ? "ghost" : "secondary"} icon={read ? "check" : undefined} onClick={() => toggleRead(s.id, !read)}>
                  {read ? "Secção lida" : "Marcar como lida"}
                </Button>
                {next ? (
                  <Button
                    variant="quiet"
                    iconRight="right"
                    onClick={() => {
                      if (!read) toggleRead(s.id, true);
                      navigate({ page: "modulo", id: c.id, tab: "aula", anchor: next.id });
                    }}
                  >
                    {next.num}. {next.title}
                  </Button>
                ) : (
                  <Button
                    variant="quiet"
                    iconRight="right"
                    onClick={() => {
                      if (!read) toggleRead(s.id, true);
                      navigate({ page: "modulo", id: c.id, tab: "exercicios" });
                    }}
                  >
                    Exercícios
                  </Button>
                )}
              </footer>
            </section>
          );
        })}
        {readCount > 0 && (
          <aside className="callout callout-info lesson-note">
            <p>
              Cada secção marcada como lida acrescenta cartões à <strong>Revisão</strong>. Rever um pouco todos os dias fixa melhor do que reler tudo na véspera da prova.
            </p>
          </aside>
        )}
      </article>
    </div>
  );
}
