import React from "react";
import type { ModuleContent } from "../../content/types";
import { fmtDateTime } from "../../lib/dates";
import { renderInline } from "../../lib/md";
import { useRouter } from "../../lib/router";
import { useMod } from "../../lib/store";
import { Blocks, type BlocksCtx } from "../../components/Blocks";
import { Button, Chip } from "../../components/ui";

export function ApostilaTab({ c }: { c: ModuleContent }) {
  const [mod, setMod] = useMod(c.id);
  const { navigate } = useRouter();
  const ctx: BlocksCtx = { moduleId: c.id, onSection: (id) => navigate({ page: "modulo", id: c.id, tab: "aula", anchor: id }) };
  return (
    <div className="tab-body narrow">
      <article className="card doc-card">
        <header className="doc-head">
          <div className="doc-head-text">
            <p className="card-title">Apostila</p>
            <p className="small muted">
              <span className="mono">{c.id}</span> · {c.apostila.sections.length} {c.apostila.sections.length === 1 ? "secção" : "secções"}
            </p>
          </div>
          {mod.apostilaReviewedAt && (
            <Chip tone="ok" icon="check">
              Revista
            </Chip>
          )}
        </header>
        <div className="prose doc-body">
          {c.apostila.intro && <p className="doc-intro">{renderInline(c.apostila.intro)}</p>}
          {c.apostila.sections.map((s) => (
            <section key={s.title} className="doc-sec">
              <h2 className="doc-sec-title">{s.title}</h2>
              <Blocks blocks={s.blocks} ctx={ctx} />
            </section>
          ))}
        </div>
      </article>
      <div className="doc-actions">
        <div className="doc-actions-main">
          <Button
            variant={mod.apostilaReviewedAt ? "secondary" : "primary"}
            icon="check"
            onClick={() =>
              setMod((m) => {
                m.apostilaReviewedAt = Date.now();
              })
            }
          >
            {mod.apostilaReviewedAt ? "Revista outra vez agora" : "Marcar apostila como revista"}
          </Button>
          {mod.apostilaReviewedAt && <span className="muted small">Última revisão: {fmtDateTime(mod.apostilaReviewedAt)}</span>}
        </div>
        <Button variant="ghost" iconRight="right" onClick={() => navigate({ page: "modulo", id: c.id, tab: "prova" })}>
          Prova
        </Button>
      </div>
    </div>
  );
}
