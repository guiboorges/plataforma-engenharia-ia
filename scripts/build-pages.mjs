// Junta o build (dist/app.js + dist/app.css) numa página index.html para o GitHub Pages.
// Igual ao build-artifact.mjs, mas com o documento completo e os ficheiros ao lado em vez de embutidos.
// Fora do claude.ai não há Tutor; o progresso fica no localStorage do browser.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");

const REACT = "https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js";
const REACT_DOM = "https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js";
const FONTS =
  "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500&display=swap";

const html = `<!doctype html>
<html lang="pt-PT">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Curso de Engenharia de IA</title>
<meta name="description" content="Plataforma de estudo autodidata de Engenharia de IA: aulas interativas, exercícios, provas e revisão espaçada.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS}">
<link rel="stylesheet" href="app.css">
</head>
<body>
<div id="root"><div style="padding:40px 20px;font-family:var(--font-display);color:var(--ink-2)">A abrir a plataforma do curso…</div></div>
<script src="${REACT}"></script>
<script src="${REACT_DOM}"></script>
<script src="app.js"></script>
</body>
</html>
`;

fs.writeFileSync(path.join(dist, "index.html"), html);
console.log("[build-pages] dist/index.html");
