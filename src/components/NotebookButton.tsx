import React, { useEffect, useState } from "react";
import { CONTENT, DOCS } from "../content";
import type { NotebookCell } from "../content/types";
import { canSaveFiles, inArtifact, saveFile } from "../lib/claude";
import { zipFiles } from "../lib/zip";
import { Button } from "./ui";

// Gera um notebook (.ipynb) para abrir no Colab: Ficheiro → Carregar notebook.
// Dentro do Artifact só se podem gravar alguns formatos, por isso o .ipynb vai dentro de um .zip.

export type NotebookSpec = { filename: string; cells: NotebookCell[] };

function toLines(src: string): string[] {
  const lines = src.split("\n");
  return lines.map((l, i) => (i < lines.length - 1 ? l + "\n" : l));
}

/** Monta o .ipynb a partir de { filename, cells }. */
export function notebookFile(spec: NotebookSpec): { name: string; json: string } {
  const cells = spec.cells.map((cell, i) =>
    cell.type === "md"
      ? { cell_type: "markdown", id: `c${i}`, metadata: {}, source: toLines(cell.source) }
      : { cell_type: "code", id: `c${i}`, metadata: {}, execution_count: null, outputs: [], source: toLines(cell.source) },
  );
  const nb = {
    nbformat: 4,
    nbformat_minor: 5,
    metadata: {
      kernelspec: { name: "python3", display_name: "Python 3" },
      language_info: { name: "python" },
      colab: { name: `${spec.filename}.ipynb` },
    },
    cells,
  };
  return { name: `${spec.filename}.ipynb`, json: JSON.stringify(nb, null, 1) };
}

/** Notebook de um módulo interativo. */
export function buildNotebook(moduleId: string): { name: string; json: string } | null {
  const c = CONTENT[moduleId];
  if (!c) return null;
  return notebookFile(c.notebook);
}

/**
 * Botão de download. Com `moduleId`: o notebook do módulo e os ficheiros de `codigo/` (comportamento original).
 * Com `notebook`: qualquer { filename, cells } (por exemplo, o notebook inicial do mini-projeto de uma fase).
 */
export function NotebookButton({
  moduleId,
  notebook,
  files,
  label,
  size = "md",
}: {
  moduleId?: string;
  notebook?: NotebookSpec;
  /** ficheiros extra para o .zip (por omissão, os de `codigo/` do módulo) */
  files?: Record<string, string>;
  label?: string;
  size?: "sm" | "md";
}) {
  const [can, setCan] = useState(true);
  const [msg, setMsg] = useState("");
  useEffect(() => {
    canSaveFiles().then(setCan);
  }, []);
  const nb = notebook ? notebookFile(notebook) : moduleId ? buildNotebook(moduleId) : null;
  if (!nb || !can) return null;
  const code = files ?? (moduleId ? DOCS[moduleId]?.code ?? {} : {});
  return (
    <span className="row gap-sm wrap">
      <Button
        size={size}
        variant="secondary"
        icon="download"
        onClick={async () => {
          setMsg("");
          let r;
          if (inArtifact()) {
            const list = [{ name: nb.name, data: nb.json }, ...Object.entries(code).map(([name, data]) => ({ name, data }))];
            r = await saveFile(nb.name.replace(/\.ipynb$/, ".zip"), zipFiles(list));
          } else {
            r = await saveFile(nb.name, nb.json, "application/x-ipynb+json");
          }
          if (r === "saved") setMsg(inArtifact() ? "Descompacte o .zip e carregue o .ipynb no Colab." : "Carregue o ficheiro no Colab: Ficheiro → Carregar notebook.");
          else if (r === "error" || r === "unavailable") setMsg("Não foi possível descarregar aqui.");
        }}
      >
        {label ?? (notebook ? "Notebook" : "Notebook do módulo")}
      </Button>
      {msg && (
        <span className="muted small" role="status">
          {msg}
        </span>
      )}
    </span>
  );
}
