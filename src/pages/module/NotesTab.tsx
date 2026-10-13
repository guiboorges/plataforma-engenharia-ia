import React from "react";
import { moduleMeta } from "../../content/course";
import { useMod } from "../../lib/store";
import { Card } from "../../components/ui";

export function NotesTab({ id }: { id: string }) {
  const [mod, setMod] = useMod(id);
  const words = mod.notes.trim() ? mod.notes.trim().split(/\s+/).length : 0;
  return (
    <div className="tab-body narrow">
      <Card
        className="mod-notes"
        title={`Notas do ${id}`}
        actions={
          <span className="mod-notes-count">
            <span className="mono">{words}</span> {words === 1 ? "palavra" : "palavras"} · guardado automaticamente
          </span>
        }
      >
        <label htmlFor={`notes-${id}`} className="sr-only">
          Notas sobre {moduleMeta(id).title}
        </label>
        <textarea
          id={`notes-${id}`}
          className="input mod-notes-area"
          rows={18}
          value={mod.notes}
          placeholder={"O que aprendi, dúvidas para o tutor, ligações a outros módulos…\n\nDica: no fim de cada sessão, escreva três frases sobre o que aprendeu."}
          onChange={(e) => {
            const v = e.target.value;
            setMod((m) => {
              m.notes = v;
            });
          }}
        />
      </Card>
    </div>
  );
}
