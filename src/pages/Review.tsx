import React, { useMemo, useState } from "react";
import { CONTENT } from "../content";
import { addDays, fmtShort, todayYMD } from "../lib/dates";
import { renderInline } from "../lib/md";
import { availableCards, dueCards, type CardRef } from "../lib/progress";
import { useRouter } from "../lib/router";
import { MAX_BOX, newCard, nextLabel, rate, type Rating } from "../lib/srs";
import { useCore, useStore } from "../lib/store";
import { Button, Card, Empty, Icon, PageHeader, StatTile } from "../components/ui";

export function Review() {
  const { docs } = useStore();
  const [core, setCore] = useCore();
  const { navigate } = useRouter();
  const all = availableCards(docs);
  const due = dueCards(docs, core);
  const [queue, setQueue] = useState<string[] | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [doneCount, setDoneCount] = useState(0);

  const byKey = useMemo(() => new Map(all.map((r) => [r.key, r])), [all]);
  const current: CardRef | undefined = queue && queue.length ? byKey.get(queue[0]) : undefined;

  const start = () => {
    const keys = due.map((r) => r.key);
    // novos por último, para começar pelo que já se viu
    keys.sort((a, b) => (core.srs[a] ? 0 : 1) - (core.srs[b] ? 0 : 1));
    setQueue(keys);
    setFlipped(false);
    setDoneCount(0);
  };

  const answer = (r: Rating) => {
    if (!current || !queue) return;
    const st = core.srs[current.key] ?? newCard();
    const next = rate(st, r);
    setCore((c) => {
      c.srs[current.key] = next;
    });
    const rest = queue.slice(1);
    setQueue(r === "again" ? [...rest, current.key] : rest);
    if (r !== "again") setDoneCount((n) => n + 1);
    setFlipped(false);
  };

  const boxes = Array.from({ length: MAX_BOX + 1 }, (_, b) => all.filter((r) => (core.srs[r.key]?.box ?? 0) === b).length);
  const maxBox = Math.max(0, ...boxes);
  const mastered = all.filter((r) => (core.srs[r.key]?.box ?? 0) >= 4).length;
  const upcoming = [1, 2, 3, 4, 5, 6, 7].map((d) => {
    const day = addDays(todayYMD(), d);
    return { day, n: all.filter((r) => core.srs[r.key]?.due === day).length };
  });

  return (
    <div className="page">
      <PageHeader
        crumbs={[{ label: "Revisão", icon: "cards" }]}
        title="Revisão espaçada"
        subtitle="Cada secção lida da aula acrescenta os seus cartões. Um cartão que sabe volta cada vez mais tarde (1, 2, 4, 8, 16, 32 dias); um que falha volta já."
      />

      <div className="review-stats">
        <StatTile label="Cartões para hoje" value={due.length} illus="cards" />
        <StatTile label="Disponíveis" value={all.length} note="das secções já lidas" illus="docs" />
        <StatTile label="Dominados" value={mastered} note="caixa 4 ou mais" illus="check" />
      </div>

      {all.length === 0 ? (
        <Empty icon="cards" title="Ainda não há cartões">
          <p>Marque secções da aula como lidas e os cartões dessas secções aparecem aqui.</p>
          <Button variant="secondary" onClick={() => navigate({ page: "modulo", id: Object.keys(CONTENT)[0], tab: "aula" })}>
            Abrir a aula
          </Button>
        </Empty>
      ) : queue && current ? (
        <section className="review-session" aria-live="polite" aria-label="Cartão em revisão">
          <div className="review-progress">
            <span>
              {doneCount} feitos · {queue.length} por rever
            </span>
            <span className="review-where">
              {current.module} · {current.card.tag}
            </span>
          </div>
          <button
            type="button"
            className={`card review-flash ${flipped ? "is-flipped" : ""}`}
            onClick={() => setFlipped(true)}
            aria-label={flipped ? "Resposta" : "Mostrar a resposta"}
          >
            <span className="review-front">{renderInline(current.card.front)}</span>
            {flipped ? <span className="review-back">{renderInline(current.card.back)}</span> : <span className="review-hint">Pense na resposta e toque para ver</span>}
          </button>
          {flipped ? (
            <div className="review-rate">
              {(["again", "hard", "good"] as Rating[]).map((r) => (
                <Button key={r} variant={r === "good" ? "primary" : r === "again" ? "danger" : "secondary"} onClick={() => answer(r)}>
                  <span className="review-rate-label">{r === "again" ? "Não sabia" : r === "hard" ? "Difícil" : "Sabia"}</span>
                  <span className="review-rate-next">{nextLabel(core.srs[current.key] ?? newCard(), r)}</span>
                </Button>
              ))}
            </div>
          ) : (
            <div className="review-rate">
              <Button variant="secondary" icon="eye" onClick={() => setFlipped(true)}>
                Mostrar a resposta
              </Button>
            </div>
          )}
        </section>
      ) : (
        <Card
          title={queue && queue.length === 0 ? `Revisão de hoje feita: ${doneCount} cartões.` : due.length ? `${due.length} cartões à espera` : "Nada para rever hoje."}
          actions={
            due.length > 0 && (
              <Button variant="primary" icon="play" onClick={start}>
                Começar a revisão
              </Button>
            )
          }
        >
          <div className="review-idle-grid">
            <div className="review-block">
              <h3 className="review-block-title">Cartões por caixa</h3>
              <ol className="review-boxes">
                {boxes.map((n, b) => (
                  <li key={b} className={maxBox > 0 && n === maxBox ? "is-max" : ""}>
                    <span className="review-box-n">{n}</span>
                    <span className="review-box-track">
                      <span className="review-box-bar" style={{ height: `${Math.max(3, (n / Math.max(1, maxBox)) * 96)}px` }} />
                    </span>
                    <span className="review-box-label">{b === 0 ? "novos" : `cx ${b}`}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="review-block">
              <h3 className="review-block-title">Próximos dias</h3>
              <ul className="tasks">
                {upcoming.map((u) => (
                  <li key={u.day} className="row-item">
                    <Icon name="calendar" size={14} />
                    <span className="review-day">{fmtShort(u.day)}</span>
                    <span className={`review-day-n ${u.n === 0 ? "is-zero" : ""}`}>
                      {u.n} {u.n === 1 ? "cartão" : "cartões"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
