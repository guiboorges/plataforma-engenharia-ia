import React from "react";
import { BOOKS, FREE_COURSES, MODULES, PAID_OPTIONAL, PHASES } from "../content/course";
import { renderInline } from "../lib/md";
import { useRouter } from "../lib/router";
import { Card, Icon, PageHeader } from "../components/ui";

export function Library() {
  const { navigate } = useRouter();
  return (
    <div className="page">
      <PageHeader
        crumbs={[{ label: "Biblioteca", icon: "library" }]}
        title="Bibliografia de base e recursos"
        subtitle="Onze livros atravessam o curso; cinco têm versão online gratuita e oficial."
      />

      <Card title="Livros" className="lib-books">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">Livro</th>
                <th scope="col">Para quê</th>
                <th scope="col">Módulos</th>
              </tr>
            </thead>
            <tbody>
              {BOOKS.map((b) => (
                <tr key={b.title}>
                  <td>
                    <div className="lib-book">
                      <span>{renderInline(b.title)}</span>
                      {b.href && (
                        <a href={b.href} target="_blank" rel="noopener noreferrer" className="chip lib-free">
                          gratuito <Icon name="external" size={12} />
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="lib-purpose">{b.purpose}</td>
                  <td className="lib-mods-cell">{b.modules}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Cursos gratuitos complementares">
        <ul className="tasks">
          {FREE_COURSES.map((c) => (
            <li key={c.title}>
              {c.href ? (
                <a className="row-item lib-row" href={c.href} target="_blank" rel="noopener noreferrer">
                  <Icon name="cap" size={15} />
                  <span className="lib-row-title">{c.title}</span>
                  <span className="lib-row-meta">{c.modules}</span>
                  <Icon name="external" size={14} />
                </a>
              ) : (
                <div className="row-item lib-row">
                  <Icon name="cap" size={15} />
                  <span className="lib-row-title">{c.title}</span>
                  <span className="lib-row-meta">{c.modules}</span>
                </div>
              )}
            </li>
          ))}
        </ul>
        <p className="lib-note">{PAID_OPTIONAL}</p>
      </Card>

      <Card title="Leituras principais de cada módulo">
        <div className="lib-phases">
          {PHASES.map((p) => (
            <details key={p.id} className="lib-phase">
              <summary className="row-item lib-sum">
                <span className={`lib-sum-ico fc-${p.num}`} aria-hidden="true">
                  <Icon name="folder" size={15} />
                </span>
                <span className="lib-sum-id">F{p.num}</span>
                <span className="lib-row-title">{p.title}</span>
                <span className="lib-row-meta">
                  {p.modules.length} {p.modules.length === 1 ? "módulo" : "módulos"}
                </span>
                <Icon name="caret" size={14} className="lib-caret" />
              </summary>
              <ul className="lib-mods">
                {p.modules.map((mid) => {
                  const m = MODULES.find((x) => x.id === mid)!;
                  return (
                    <li key={mid} className="lib-mod">
                      <button type="button" className="link-btn lib-mod-link" onClick={() => navigate({ page: "modulo", id: mid, tab: "plano" })}>
                        <span className="lib-mod-id">{mid}</span>
                        <span>{m.title}</span>
                      </button>
                      {m.readings.length ? (
                        <ul className="lib-reads">
                          {m.readings.map((r) => (
                            <li key={r}>{r}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="lib-reads-none">Projeto e preparação: leituras escolhidas pelo aluno e guias oficiais do exame.</p>
                      )}
                    </li>
                  );
                })}
              </ul>
            </details>
          ))}
        </div>
      </Card>
    </div>
  );
}
