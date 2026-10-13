import React from "react";
import type { Block } from "../content/types";
import { highlightPython, renderInline, type InlineCtx } from "../lib/md";
import { CopyButton, Icon } from "./ui";
import { Widget } from "./widgets";
import { DOCS, PHASE_DOCS } from "../content";

export type BlocksCtx = InlineCtx & {
  moduleId: string;
  checks?: Record<string, number>;
  onCheck?: (id: string, choice: number) => void;
};

export function Blocks({ blocks, ctx }: { blocks: Block[]; ctx: BlocksCtx }) {
  return (
    <>
      {blocks.map((b, i) => (
        <BlockView key={i} b={b} ctx={ctx} />
      ))}
    </>
  );
}

function BlockView({ b, ctx }: { b: Block; ctx: BlocksCtx }) {
  switch (b.t) {
    case "p":
      return <p>{renderInline(b.text, ctx)}</p>;
    case "h3":
      return <h3>{renderInline(b.text, ctx)}</h3>;
    case "list": {
      const L = b.ordered ? "ol" : "ul";
      return (
        <L>
          {b.items.map((it, i) => (
            <li key={i}>{renderInline(it, ctx)}</li>
          ))}
        </L>
      );
    }
    case "table":
      return (
        <div className="table-wrap">
          <table>
            {b.caption && <caption className="lesson-cap">{b.caption}</caption>}
            <thead>
              <tr>
                {b.head.map((h, i) => (
                  <th key={i} scope="col">
                    {renderInline(h, ctx)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {b.rows.map((r, i) => (
                <tr key={i}>
                  {r.map((c, j) => (
                    <td key={j}>{renderInline(c, ctx)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "code":
      return <CodeBlock code={b.code} title={b.title} output={b.output} />;
    case "callout":
      return (
        <aside className={`callout callout-${b.tone}`}>
          {b.title && <p className="callout-title">{b.title}</p>}
          <p>{renderInline(b.text, ctx)}</p>
        </aside>
      );
    case "widget":
      return (
        <figure className="widget">
          <div className="widget-body">
            <Widget name={b.name} moduleId={ctx.moduleId} />
          </div>
          {b.caption && <figcaption className="widget-cap">{b.caption}</figcaption>}
        </figure>
      );
    case "figure": {
      const src = ctx.images?.[b.src] ?? DOCS[ctx.moduleId]?.images[b.src] ?? PHASE_DOCS[ctx.moduleId]?.images[b.src];
      if (!src) return null;
      return (
        <figure className="md-figure">
          <img src={src} alt={b.alt} loading="lazy" />
          {(b.caption ?? b.alt) && <figcaption>{b.caption ?? b.alt}</figcaption>}
        </figure>
      );
    }
    case "check":
      return <QuickCheck b={b} ctx={ctx} />;
  }
}

export function CodeBlock({ code, title, output }: { code: string; title?: string; output?: string }) {
  return (
    <div className="code">
      <div className="code-head">
        <span className="code-title">
          <Icon name="code" size={14} />
          {title ?? "Python"}
        </span>
        <CopyButton text={code} />
      </div>
      <pre className="code-block">
        <code>{highlightPython(code)}</code>
      </pre>
      {output && (
        <div className="code-out">
          <span className="code-out-label">Resultado esperado</span>
          <pre>{output}</pre>
        </div>
      )}
    </div>
  );
}

function QuickCheck({ b, ctx }: { b: Extract<Block, { t: "check" }>; ctx: BlocksCtx }) {
  const chosen = ctx.checks?.[b.id];
  const answered = chosen !== undefined;
  return (
    <section className="qc" aria-label="Verificação rápida">
      <p className="eyebrow qc-label">
        <Icon name="target" size={14} />
        Verificação rápida
      </p>
      <p className="qc-q">{renderInline(b.q, ctx)}</p>
      <div className="qc-options" role="radiogroup" aria-label="Opções">
        {b.options.map((o, i) => {
          const state = !answered ? "" : i === b.answer ? "is-right" : i === chosen ? "is-wrong" : "is-dim";
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={chosen === i}
              className={`qc-opt ${state}`}
              onClick={() => ctx.onCheck?.(b.id, i)}
              disabled={answered}
            >
              <span className="qc-letter mono">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="qc-text">{renderInline(o, ctx)}</span>
              {state === "is-right" && <Icon name="check" size={14} className="qc-mark" />}
              {state === "is-wrong" && <Icon name="x" size={14} className="qc-mark" />}
            </button>
          );
        })}
      </div>
      {answered && (
        <div className={`qc-feedback ${chosen === b.answer ? "is-ok" : "is-bad"}`} role="status">
          <p>
            <strong>{chosen === b.answer ? "Certo." : "Ainda não."}</strong> {renderInline(b.explain, ctx)}
          </p>
          {chosen !== b.answer && (
            <button type="button" className="link-btn" onClick={() => ctx.onCheck?.(b.id, -1)}>
              <Icon name="refresh" size={14} />
              Tentar outra vez
            </button>
          )}
        </div>
      )}
    </section>
  );
}
