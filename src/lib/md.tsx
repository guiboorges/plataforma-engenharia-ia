import React from "react";

// Marcação mínima do conteúdo: **negrito**, *itálico*, `código`, [texto](url) e [texto](#s3) para secções da aula.
// Também um leitor de Markdown simples para o "modo documento" dos módulos ainda não interativos.

export type InlineCtx = { onSection?: (id: string) => void; images?: Record<string, string> };

const INLINE = /(`[^`]+`)|(\*\*[^*]+?\*\*)|(\*[^*\s][^*]*?\*)|(\[[^\]]+\]\([^)\s]+\))/g;

export function Inline({ text, ctx }: { text: string; ctx?: InlineCtx }) {
  return <>{renderInline(text, ctx)}</>;
}

export function renderInline(text: string, ctx?: InlineCtx, keyPrefix = "i"): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let last = 0;
  let k = 0;
  text.replace(INLINE, (m, code, bold, ital, link, offset: number) => {
    if (offset > last) out.push(text.slice(last, offset));
    const key = `${keyPrefix}${k++}`;
    if (code) out.push(<code key={key}>{code.slice(1, -1)}</code>);
    else if (bold) out.push(<strong key={key}>{renderInline(bold.slice(2, -2), ctx, key)}</strong>);
    else if (ital) out.push(<em key={key}>{renderInline(ital.slice(1, -1), ctx, key)}</em>);
    else if (link) {
      const mm = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(link)!;
      const label = mm[1];
      const href = mm[2];
      if (href.startsWith("#")) {
        out.push(
          <a
            key={key}
            href={href}
            className="xref"
            onClick={(e) => {
              e.preventDefault();
              ctx?.onSection?.(href.slice(1));
            }}
          >
            {renderInline(label, ctx, key)}
          </a>,
        );
      } else if (/^https?:\/\//.test(href)) {
        out.push(
          <a key={key} href={href} target="_blank" rel="noopener noreferrer">
            {renderInline(label, ctx, key)}
          </a>,
        );
      } else {
        out.push(<span key={key}>{label}</span>);
      }
    }
    last = offset + m.length;
    return m;
  });
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/** Texto simples, sem marcação (para enviar ao tutor). */
export function plain(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}

// ---------- realce de Python

const PY_KW = new Set([
  "def", "return", "if", "elif", "else", "for", "while", "in", "not", "and", "or", "import", "from", "as",
  "class", "with", "try", "except", "finally", "lambda", "yield", "pass", "break", "continue", "None", "True",
  "False", "is", "raise", "global", "assert",
]);
const PY_BUILTIN = new Set(["print", "len", "range", "any", "all", "zip", "int", "str", "list", "dict", "sum", "min", "max", "sorted", "enumerate"]);
const PY_TOKEN = /(#[^\n]*)|("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][A-Za-z0-9_]*)/g;

export function highlightPython(code: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let last = 0;
  let k = 0;
  code.replace(PY_TOKEN, (m, com, str, num, word, offset: number) => {
    if (offset > last) out.push(code.slice(last, offset));
    let cls = "";
    if (com) cls = "syn-com";
    else if (str) cls = "syn-str";
    else if (num) cls = "syn-num";
    else if (word && PY_KW.has(word)) cls = "syn-kw";
    else if (word && PY_BUILTIN.has(word)) cls = "syn-fn";
    out.push(cls ? <span key={k++} className={cls}>{m}</span> : m);
    last = offset + m.length;
    return m;
  });
  if (last < code.length) out.push(code.slice(last));
  return out;
}

// ---------- Markdown em blocos

export type MdBlock =
  | { t: "h"; level: number; text: string; id: string }
  | { t: "p"; text: string }
  | { t: "list"; ordered: boolean; items: { text: string; children?: MdBlock }[] }
  | { t: "table"; head: string[]; rows: string[][] }
  | { t: "code"; lang: string; code: string }
  | { t: "img"; alt: string; src: string }
  | { t: "quote"; text: string }
  | { t: "hr" };

export function slug(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

const splitRow = (line: string) =>
  line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());

export function parseMarkdown(src: string): MdBlock[] {
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  const out: MdBlock[] = [];
  let i = 0;
  let para: string[] = [];
  const flush = () => {
    if (para.length) out.push({ t: "p", text: para.join(" ").trim() });
    para = [];
  };
  while (i < lines.length) {
    const line = lines[i];
    const fence = /^```(\w*)/.exec(line);
    if (fence) {
      flush();
      const buf: string[] = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
      i++;
      out.push({ t: "code", lang: fence[1], code: buf.join("\n") });
      continue;
    }
    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) {
      flush();
      out.push({ t: "h", level: h[1].length, text: h[2].trim(), id: slug(h[2]) });
      i++;
      continue;
    }
    if (/^\s*\|/.test(line) && i + 1 < lines.length && /^\s*\|?\s*:?-{2,}/.test(lines[i + 1])) {
      flush();
      const head = splitRow(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && /^\s*\|/.test(lines[i])) rows.push(splitRow(lines[i++]));
      out.push({ t: "table", head, rows });
      continue;
    }
    const img = /^!\[([^\]]*)\]\(([^)\s]+)\)\s*$/.exec(line.trim());
    if (img) {
      flush();
      out.push({ t: "img", alt: img[1], src: img[2] });
      i++;
      continue;
    }
    if (/^\s*(-{3,}|\*{3,})\s*$/.test(line)) {
      flush();
      out.push({ t: "hr" });
      i++;
      continue;
    }
    if (/^>\s?/.test(line)) {
      flush();
      const buf: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ""));
      out.push({ t: "quote", text: buf.join(" ") });
      continue;
    }
    const li = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/.exec(line);
    if (li) {
      flush();
      const ordered = /\d/.test(li[2]);
      const baseIndent = li[1].length;
      const items: { text: string; children?: MdBlock }[] = [];
      while (i < lines.length) {
        const l = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/.exec(lines[i]);
        if (l && l[1].length <= baseIndent) {
          items.push({ text: l[3] });
          i++;
          continue;
        }
        if (l && l[1].length > baseIndent) {
          // sublista
          const sub: string[] = [];
          while (i < lines.length) {
            const s = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/.exec(lines[i]);
            if (!s || s[1].length <= baseIndent) break;
            sub.push(lines[i].slice(baseIndent + 2));
            i++;
          }
          const parsed = parseMarkdown(sub.join("\n"))[0];
          if (items.length && parsed) items[items.length - 1].children = parsed;
          continue;
        }
        if (lines[i].trim() && /^\s{2,}\S/.test(lines[i]) && items.length) {
          items[items.length - 1].text += " " + lines[i].trim();
          i++;
          continue;
        }
        break;
      }
      out.push({ t: "list", ordered, items });
      continue;
    }
    if (!line.trim()) {
      flush();
      i++;
      continue;
    }
    para.push(line.trim());
    i++;
  }
  flush();
  return out;
}

export function Markdown({ src, ctx, skipTitle }: { src: string; ctx?: InlineCtx; skipTitle?: boolean }) {
  let blocks = parseMarkdown(src);
  if (skipTitle && blocks[0]?.t === "h" && blocks[0].level === 1) blocks = blocks.slice(1);
  return <div className="md">{blocks.map((b, i) => <MdBlockView key={i} b={b} ctx={ctx} />)}</div>;
}

function MdBlockView({ b, ctx }: { b: MdBlock; ctx?: InlineCtx }) {
  switch (b.t) {
    case "h": {
      const Tag = (`h${Math.min(6, b.level + 1)}` as unknown) as keyof JSX.IntrinsicElements;
      return <Tag id={b.id}>{renderInline(b.text, ctx)}</Tag>;
    }
    case "p":
      return <p>{renderInline(b.text, ctx)}</p>;
    case "list": {
      const L = b.ordered ? "ol" : "ul";
      return (
        <L>
          {b.items.map((it, i) => (
            <li key={i}>
              {renderInline(it.text, ctx)}
              {it.children && <MdBlockView b={it.children} ctx={ctx} />}
            </li>
          ))}
        </L>
      );
    }
    case "table":
      return (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>{b.head.map((h, i) => <th key={i}>{renderInline(h, ctx)}</th>)}</tr>
            </thead>
            <tbody>
              {b.rows.map((r, i) => (
                <tr key={i}>{r.map((c, j) => <td key={j}>{renderInline(c, ctx)}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "code":
      return (
        <pre className="code-block">
          <code>{b.lang === "python" || b.lang === "py" ? highlightPython(b.code) : b.code}</code>
        </pre>
      );
    case "img": {
      const src = ctx?.images?.[b.src] ?? (b.src.startsWith("data:") ? b.src : "");
      return src ? (
        <figure className="md-figure">
          <img src={src} alt={b.alt} />
          {b.alt && <figcaption>{b.alt}</figcaption>}
        </figure>
      ) : null;
    }
    case "quote":
      return <blockquote>{renderInline(b.text, ctx)}</blockquote>;
    case "hr":
      return <hr />;
  }
}
