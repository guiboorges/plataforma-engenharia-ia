// Lê a pasta do curso (course.config.json → courseDir, ou a variável COURSE_DIR) e gera
// src/content/generated/course-docs.json com o material de cada módulo.
//
// - Todos os módulos levam o código de `codigo/` e as imagens de `img/` (data URI), usadas pelos blocos "figure".
// - Os que ainda não têm versão interativa (src/content/modules/mN.ts) levam também os .md (aula, apostila,
//   exercícios, prova, gabarito), e a plataforma mostra-os em "modo documento".
// - As pastas fase-NN-exame-e-mini-projeto levam os .md quando ainda não há src/content/phases/fN.ts.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "src/content/generated/course-docs.json");
const cfgPath = path.join(root, "course.config.json");
const cfg = fs.existsSync(cfgPath) ? JSON.parse(fs.readFileSync(cfgPath, "utf8")) : {};
const courseDir = process.env.COURSE_DIR || cfg.courseDir || "";
const forceDocs = process.env.FORCE_DOCS === "1";

const PARTS = { "01": "aula", "02": "apostila", "03": "exercicios", "04": "prova", "05": "gabarito" };
const MIME = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".svg": "image/svg+xml", ".gif": "image/gif", ".webp": "image/webp" };

const result = { syncedAt: new Date().toISOString(), courseDir, modules: {}, phases: {} };
const PHASE_PARTS = { "01": "exame", "02": "miniprojeto", "03": "gabarito" };

function readImages(dir) {
  const out = {};
  if (!fs.existsSync(dir)) return out;
  for (const f of fs.readdirSync(dir).sort()) {
    const mime = MIME[path.extname(f).toLowerCase()];
    if (!mime) continue;
    out[`img/${f}`] = `data:${mime};base64,${fs.readFileSync(path.join(dir, f)).toString("base64")}`;
  }
  return out;
}

if (!courseDir || !fs.existsSync(courseDir)) {
  console.warn(`[sync-course] pasta do curso não encontrada (${courseDir || "não configurada"}); a usar só o conteúdo interativo.`);
  if (!fs.existsSync(out)) fs.writeFileSync(out, JSON.stringify(result, null, 1));
  process.exit(0);
}

for (const dir of fs.readdirSync(courseDir).sort()) {
  const m = /^modulo-(\d+)/.exec(dir);
  if (!m) continue;
  const id = `M${Number(m[1])}`;
  const full = path.join(courseDir, dir);
  if (!fs.statSync(full).isDirectory()) continue;
  const interactive = fs.existsSync(path.join(root, `src/content/modules/m${Number(m[1])}.ts`));
  const entry = { folder: dir, interactive, files: {}, images: {}, code: {} };

  const codeDir = path.join(full, "codigo");
  if (fs.existsSync(codeDir)) {
    for (const f of fs.readdirSync(codeDir).sort()) {
      const p = path.join(codeDir, f);
      if (fs.statSync(p).isFile() && fs.statSync(p).size < 200_000) entry.code[`codigo/${f}`] = fs.readFileSync(p, "utf8");
    }
  }

  entry.images = readImages(path.join(full, "img"));
  if (!interactive || forceDocs) {
    for (const f of fs.readdirSync(full).sort()) {
      const k = PARTS[f.slice(0, 2)];
      if (k && f.endsWith(".md")) entry.files[k] = fs.readFileSync(path.join(full, f), "utf8");
    }
  }
  result.modules[id] = entry;
}

for (const dir of fs.readdirSync(courseDir).sort()) {
  const m = /^fase-(\d+)/.exec(dir);
  if (!m) continue;
  const id = `F${Number(m[1])}`;
  const full = path.join(courseDir, dir);
  if (!fs.statSync(full).isDirectory()) continue;
  const interactive = fs.existsSync(path.join(root, `src/content/phases/f${Number(m[1])}.ts`));
  const entry = { folder: dir, interactive, files: {}, images: readImages(path.join(full, "img")) };
  if (!interactive || forceDocs) {
    for (const f of fs.readdirSync(full).sort()) {
      const k = PHASE_PARTS[f.slice(0, 2)];
      if (k && f.endsWith(".md")) entry.files[k] = fs.readFileSync(path.join(full, f), "utf8");
    }
  }
  result.phases[id] = entry;
}

fs.writeFileSync(out, JSON.stringify(result));
const summary = Object.entries(result.modules)
  .map(([id, e]) => `${id}${e.interactive ? " (interativo)" : ""}: ${Object.keys(e.files).length} docs, ${Object.keys(e.images).length} imagens, ${Object.keys(e.code).length} ficheiros de código`)
  .join("\n  ");
const phases = Object.entries(result.phases)
  .map(([id, e]) => `${id}${e.interactive ? " (interativo)" : ""}: ${Object.keys(e.files).length} docs`)
  .join("\n  ");
console.log(`[sync-course] ${courseDir}\n  ${summary || "nenhum módulo encontrado"}${phases ? "\n  " + phases : ""}`);
