import React from "react";
import { useMod } from "../../lib/store";
import { Bar, Checkbox, Icon } from "../ui";
import { NotebookButton } from "../NotebookButton";
import { renderInline } from "../../lib/md";

const STEPS = [
  "Abrir [colab.research.google.com](https://colab.research.google.com) com uma conta Google.",
  "Criar um notebook novo e dar-lhe o nome \"M1 — exercícios\". Fica guardado no Google Drive, na pasta Colab Notebooks.",
  "Na primeira célula de código, escrever `print(\"Olá, IA\")` e carregar em Shift+Enter para correr.",
  "Acrescentar uma célula de texto (botão \"+ Texto\") para notas. Aceita Markdown: títulos com `#`, listas com `-`.",
  "Colar os dois exemplos da secção 4, cada um na sua célula, e confirmar que o resultado é igual ao da aula.",
  "A GPU só será precisa na Fase 3: Ambiente de execução → Alterar tipo de ambiente de execução → GPU. A versão gratuita tem limites de utilização que variam.",
];

export function ColabChecklist({ moduleId }: { moduleId: string }) {
  const [mod, setMod] = useMod(moduleId);
  const done = STEPS.filter((_, i) => mod.colab[String(i)]).length;
  return (
    <div className="colab">
      <div className="colab-head">
        <div className="colab-title">
          <p className="widget-detail-title">Configurar o Colab</p>
          <div className="colab-count">
            <span className="mono">
              {done} de {STEPS.length}
            </span>
            <Bar value={done / STEPS.length} thin label="Passos do Colab feitos" />
          </div>
        </div>
        <div className="colab-actions">
          <a className="btn btn-secondary btn-sm" href="https://colab.research.google.com" target="_blank" rel="noopener noreferrer">
            <Icon name="external" size={14} />
            <span>Abrir o Colab</span>
          </a>
          <NotebookButton moduleId={moduleId} size="sm" />
        </div>
      </div>
      <ol className="colab-steps">
        {STEPS.map((s, i) => (
          <li key={i} className="row-item colab-step">
            <Checkbox
              id={`colab-${moduleId}-${i}`}
              checked={!!mod.colab[String(i)]}
              onChange={(v) =>
                setMod((m) => {
                  if (v) m.colab[String(i)] = true;
                  else delete m.colab[String(i)];
                })
              }
              label={<span>{renderInline(s)}</span>}
            />
          </li>
        ))}
      </ol>
    </div>
  );
}
