import React from "react";
import { CERTIFICATIONS, CERT_WARNING } from "../content/course";
import { fmtShort } from "../lib/dates";
import { computeSchedule } from "../lib/schedule";
import { useCore, type CertStatus } from "../lib/store";
import { Chip, Icon, PageHeader } from "../components/ui";

const ROLE: Record<string, { label: string; tone: "accent" | "marker" | "neutral" | "ok" }> = {
  principal: { label: "A principal", tone: "marker" },
  recomendada: { label: "Recomendada", tone: "accent" },
  opcional: { label: "Opcional", tone: "neutral" },
  alternativa: { label: "Alternativa", tone: "neutral" },
  depois: { label: "Depois do curso", tone: "neutral" },
};

const STATUS: { v: CertStatus; label: string }[] = [
  { v: "por-decidir", label: "Por decidir" },
  { v: "planeada", label: "Planeada" },
  { v: "marcada", label: "Exame marcado" },
  { v: "obtida", label: "Obtida" },
  { v: "fora", label: "Não vou fazer" },
];

export function Certifications() {
  const [core, setCore] = useCore();
  const s = computeSchedule(core.settings.startDate);
  const levels = ["Fundamental", "Associado", "Profissional"] as const;
  return (
    <div className="page">
      <PageHeader
        crumbs={[{ label: "Certificações", icon: "award" }]}
        title="Mapa de certificações"
        subtitle="A escada mais completa (fundamental, associado, profissional), e o Amazon Bedrock dá acesso aos modelos da Anthropic. Ordem sugerida: NCA-GENL no fim da Fase 4, MLA-C02 na Fase 6 e AIP-C01 depois de alguns meses de projetos reais."
      />

      <section className="cert-section" aria-labelledby="cert-track-title">
        <h2 className="cert-section-title" id="cert-track-title">
          Trilha principal: AWS
        </h2>
        <ol className="cert-track">
          <li className="card cert-step">
            <span className="cert-when">{fmtShort(s.phases.F4.end)}</span>
            <strong className="cert-step-name">NCA-GENL</strong>
            <span className="cert-step-note">fim da Fase 4 · opcional</span>
          </li>
          <li className="card cert-step is-main">
            <span className="cert-when">{fmtShort(s.phases.F6.end)}</span>
            <strong className="cert-step-name">MLA-C02</strong>
            <span className="cert-step-note">Fase 6 · a principal</span>
          </li>
          <li className="card cert-step">
            <span className="cert-when">+6 a 12 meses</span>
            <strong className="cert-step-name">AIP-C01</strong>
            <span className="cert-step-note">depois de projetos reais</span>
          </li>
        </ol>
      </section>

      <aside className="callout callout-warn">
        <p>{CERT_WARNING}</p>
      </aside>

      {levels.map((lvl) => {
        const list = CERTIFICATIONS.filter((c) => c.level === lvl);
        return (
          <section key={lvl} className="cert-section" aria-labelledby={`cert-lvl-${lvl}`}>
            <h2 className="cert-section-title" id={`cert-lvl-${lvl}`}>
              {lvl} <span className="cert-count">{list.length}</span>
            </h2>
            <div className="cert-grid">
              {list.map((c) => {
                const st = core.certs[c.id] ?? { status: "por-decidir" as CertStatus };
                return (
                  <article key={c.id} className={`card cert-card ${c.role === "principal" ? "is-main" : ""}`}>
                    <header className="cert-top">
                      <span className="cert-provider">{c.provider}</span>
                      <Chip tone={ROLE[c.role].tone}>{ROLE[c.role].label}</Chip>
                    </header>
                    <h3 className="cert-name">
                      {c.url ? (
                        <a href={c.url} target="_blank" rel="noopener noreferrer">
                          {c.name} <Icon name="external" size={13} />
                        </a>
                      ) : (
                        c.name
                      )}
                    </h3>
                    <p className="cert-text">{c.format}</p>
                    <p className="cert-text">
                      <strong>Quando:</strong> {c.when}
                    </p>
                    <div className="cert-state">
                      <select
                        id={`cert-${c.id}`}
                        aria-label={`Estado de ${c.name}`}
                        className="input input-sm"
                        value={st.status}
                        onChange={(e) =>
                          setCore((cc) => {
                            cc.certs[c.id] = { ...(cc.certs[c.id] ?? {}), status: e.target.value as CertStatus };
                          })
                        }
                      >
                        {STATUS.map((x) => (
                          <option key={x.v} value={x.v}>
                            {x.label}
                          </option>
                        ))}
                      </select>
                      {(st.status === "marcada" || st.status === "obtida") && (
                        <input
                          id={`cert-date-${c.id}`}
                          aria-label="Data"
                          type="date"
                          className="input input-sm"
                          value={st.date ?? ""}
                          onChange={(e) =>
                            setCore((cc) => {
                              cc.certs[c.id] = { ...(cc.certs[c.id] ?? { status: st.status }), date: e.target.value };
                            })
                          }
                        />
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}
      <p className="cert-foot">Fontes consultadas a 09/10/2026, segundo o plano do curso. Confirmar preços e versões na página oficial antes de marcar o exame.</p>
    </div>
  );
}
