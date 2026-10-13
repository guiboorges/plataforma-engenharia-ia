import React, { useRef, useState } from "react";
import { COURSE } from "../content/course";
import { DOCS, DOCS_SYNCED_AT, isInteractive } from "../content";
import { fmtDateTime, fmtShort, mondayOf, todayYMD } from "../lib/dates";
import { saveFile } from "../lib/claude";
import { computeSchedule } from "../lib/schedule";
import { useCore, useStore } from "../lib/store";
import { Button, Card, Checkbox, ConfirmButton, Icon, PageHeader } from "../components/ui";

export function Settings() {
  const [core, setCore] = useCore();
  const { docs, replaceAll, resetAll, sync } = useStore();
  const [msg, setMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const s = computeSchedule(core.settings.startDate);

  const exportJson = async () => {
    const data = JSON.stringify({ app: "engenharia-ia", version: 1, exportedAt: new Date().toISOString(), docs }, null, 1);
    const r = await saveFile(`engenharia-ia-progresso-${todayYMD()}.json`, data, "application/json");
    setMsg(r === "saved" ? "Cópia de segurança guardada." : r === "declined" ? "" : "Não foi possível guardar o ficheiro aqui.");
  };

  const importJson = (f: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (parsed?.app !== "engenharia-ia" || typeof parsed.docs !== "object") throw new Error();
        replaceAll(parsed.docs);
        setMsg("Progresso importado.");
      } catch {
        setMsg("Este ficheiro não é uma cópia de segurança da plataforma.");
      }
    };
    reader.readAsText(f);
  };

  return (
    <div className="page">
      <PageHeader crumbs={[{ label: "Definições", icon: "settings" }]} title="Plano e dados" />

      <div className="set-cards">
        <Card title="Plano">
          <div className="set-rows">
            <div className="set-row">
              <div className="set-text">
                <label className="set-label" htmlFor="set-start">
                  Data de início do curso
                </label>
                <p className="set-help">
                  O calendário começa na segunda-feira dessa semana: {fmtShort(s.start)} a {fmtShort(s.end)} ({s.totalWeeks} semanas). Por omissão: {fmtShort(COURSE.defaultStart)}.
                </p>
              </div>
              <div className="set-control">
                <input
                  id="set-start"
                  type="date"
                  className="input set-date"
                  value={core.settings.startDate}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (!v) return;
                    setCore((c) => {
                      c.settings.startDate = mondayOf(v);
                    });
                  }}
                />
              </div>
            </div>
            <div className="set-row">
              <div className="set-text">
                <label className="set-label" htmlFor="set-target">
                  Meta semanal de estudo (minutos)
                </label>
                <p className="set-help">O plano conta com até 3 horas por semana (180 minutos).</p>
              </div>
              <div className="set-control">
                <input
                  id="set-target"
                  type="number"
                  min={30}
                  max={900}
                  step={15}
                  className="input set-num"
                  value={core.settings.weeklyTargetMin}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (v >= 30 && v <= 900)
                      setCore((c) => {
                        c.settings.weeklyTargetMin = v;
                      });
                  }}
                />
              </div>
            </div>
            <div className="set-row set-row-check">
              <Checkbox
                id="set-retake"
                checked={core.settings.allowEarlyRetake}
                onChange={(v) =>
                  setCore((c) => {
                    c.settings.allowEarlyRetake = v;
                  })
                }
                label="Permitir repetir uma prova antes de passar uma semana (o plano pede uma semana de revisão)"
              />
            </div>
          </div>
        </Card>

        <Card title="Dados">
          <p className="set-desc">
            {sync === "cloud"
              ? "O progresso fica guardado na sua conta Claude, numa área privada deste Artifact, e também neste browser."
              : "O progresso fica guardado neste browser. Dentro do Artifact publicado fica também na sua conta."}
          </p>
          <div className="set-actions">
            <Button variant="secondary" icon="download" onClick={exportJson}>
              Guardar cópia de segurança (.json)
            </Button>
            <Button variant="secondary" icon="refresh" onClick={() => fileRef.current?.click()}>
              Importar cópia
            </Button>
            <input
              ref={fileRef}
              id="set-import"
              type="file"
              accept="application/json,.json"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) importJson(f);
                e.target.value = "";
              }}
            />
            <ConfirmButton variant="danger" icon="trash" label="Apagar todo o progresso" confirmLabel="Apagar" question="Apagar tudo? Não dá para desfazer." onConfirm={resetAll} />
          </div>
          {msg && (
            <p className="set-msg" role="status">
              {msg}
            </p>
          )}
        </Card>

        <Card title="Material do curso">
          <ul className="tasks">
            {Object.entries(DOCS).map(([id, d]) => (
              <li key={id} className="row-item">
                <Icon name="file" size={14} />
                <span className="set-doc-id">{id}</span>
                <span className="set-doc-folder">{d.folder}</span>
                <span className="set-doc-kind">{isInteractive(id) ? "versão interativa" : Object.keys(d.files).length ? "modo documento" : "só código"}</span>
              </li>
            ))}
          </ul>
          <p className="set-note">
            Última sincronização com a pasta do curso: {DOCS_SYNCED_AT ? fmtDateTime(Date.parse(DOCS_SYNCED_AT)) : "nunca"}. Para acrescentar um módulo, ver o README do projeto.
          </p>
        </Card>
      </div>
    </div>
  );
}
