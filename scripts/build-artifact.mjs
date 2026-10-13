// Junta o build (dist/app.js + dist/app.css) numa página única para publicar como Artifact.
// O Artifact embrulha o ficheiro num esqueleto <!doctype html>…<body>, por isso a página começa no <title>.
// O React vem do cdnjs (versão fixa); tudo o resto vai embutido.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const outDir = path.join(root, "artifact");
const js = fs.readFileSync(path.join(dist, "app.js"), "utf8");
const cssFile = fs.readdirSync(dist).find((f) => f.endsWith(".css"));
const css = cssFile ? fs.readFileSync(path.join(dist, cssFile), "utf8") : "";

const REACT = "https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js";
const REACT_DOM = "https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js";
const FONTS =
  "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500&display=swap";

const safeJs = js.replace(/<\/script/gi, "<\\/script");
const safeCss = css.replace(/<\/style/gi, "<\\/style");

const html = `<title>Curso de Engenharia de IA</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS}">
<style>${safeCss}</style>
<div id="root"><div style="padding:40px 20px;font-family:var(--font-display);color:var(--ink-2)">A abrir a plataforma do curso…</div></div>
<script src="${REACT}"></script>
<script src="${REACT_DOM}"></script>
<script>${safeJs}</script>
`;

fs.mkdirSync(outDir, { recursive: true });
const out = path.join(outDir, "plataforma.html");
fs.writeFileSync(out, html);
console.log(`[build-artifact] ${path.relative(root, out)} — ${(Buffer.byteLength(html) / 1024).toFixed(0)} KB`);
