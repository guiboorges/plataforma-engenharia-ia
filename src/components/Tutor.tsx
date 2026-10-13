import React, { useEffect, useRef, useState } from "react";
import { CONTENT } from "../content";
import { moduleMeta } from "../content/course";
import { getSample, isFatalSampleError, sampleErrorText, type SampleFn } from "../lib/claude";
import { Markdown } from "../lib/md";
import { TUTOR_RULES, moduleContext } from "../lib/tutor";
import { Button, Icon } from "./ui";

// Tutor do módulo: conversa com o Claude sobre a aula, seguindo a regra de ouro do curso.

let fatal = false;
const listeners = new Set<() => void>();

/** O Claude está disponível nesta página? (null enquanto não se sabe) */
export function useSample(): SampleFn | null {
  const [fn, setFn] = useState<SampleFn | null>(null);
  const [, force] = useState(0);
  useEffect(() => {
    let alive = true;
    getSample().then((s) => alive && setFn(() => s));
    const l = () => force((x) => x + 1);
    listeners.add(l);
    return () => {
      alive = false;
      listeners.delete(l);
    };
  }, []);
  return fatal ? null : fn;
}

export function reportSampleError(e: any) {
  if (isFatalSampleError(e)) {
    fatal = true;
    listeners.forEach((l) => l());
  }
}

type Msg = { role: "user" | "assistant"; content: string };

const STARTERS = [
  "Explica-me de outra forma a diferença entre IA, ML e deep learning.",
  "Faz-me 3 perguntas para eu testar o que li, uma de cada vez.",
  "Dá-me um exemplo do dia a dia de aprendizagem por reforço.",
  "Porque é que um falso positivo pode ser pior do que um falso negativo?",
];

export function TutorDock({ moduleId, section }: { moduleId: string; section?: string }) {
  const sample = useSample();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [live, setLive] = useState("");
  const [err, setErr] = useState("");
  const ctl = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);
  const c = CONTENT[moduleId];

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [msgs, live, open]);

  // Ao abrir, o foco passa para o painel; ao fechar, volta ao botão flutuante.
  useEffect(() => {
    if (open) panelRef.current?.focus({ preventScroll: true });
    else if (wasOpen.current) fabRef.current?.focus({ preventScroll: true });
    wasOpen.current = open;
  }, [open]);

  if (!sample || !c) return null;
  const meta = moduleMeta(moduleId);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || busy) return;
    setErr("");
    const next: Msg[] = [...msgs, { role: "user", content: q }];
    setMsgs(next);
    setDraft("");
    setBusy(true);
    setLive("");
    ctl.current = new AbortController();
    const where = section ? `\n(O aluno está a ler a secção ${section.replace("s", "")} da aula.)` : "";
    const intro: Msg = { role: "user", content: `${TUTOR_RULES}\n\n${moduleContext(c)}${where}\n\n---\nA conversa com o aluno começa a seguir.` };
    try {
      const turns = [intro, ...next.slice(-12)];
      const { text: answer } = await sample(turns, {
        cache: false,
        signal: ctl.current.signal,
        onText: ({ text }: { text: string }) => setLive(text),
      });
      setMsgs([...next, { role: "assistant", content: answer }]);
    } catch (e: any) {
      reportSampleError(e);
      if (e?.text) setMsgs([...next, { role: "assistant", content: e.text + "\n\n*(resposta interrompida)*" }]);
      const t = sampleErrorText(e);
      if (t) setErr(t);
    } finally {
      setBusy(false);
      setLive("");
    }
  };

  return (
    <>
      <button
        ref={fabRef}
        type="button"
        className={`tutor-fab ${open ? "is-open" : ""}`}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={`tutor-panel-${moduleId}`}
      >
        <Icon name={open ? "x" : "sparkle"} size={16} />
        <span>{open ? "Fechar" : "Tutor"}</span>
      </button>
      {open && (
        <aside
          ref={panelRef}
          id={`tutor-panel-${moduleId}`}
          className="tutor"
          aria-label="Tutor do módulo"
          tabIndex={-1}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
          }}
        >
          <header className="tutor-head">
            <div className="tutor-titles">
              <h2 className="tutor-title">Tutor · {meta.id}</h2>
              <p className="tutor-sub">Explica e dá pistas; não dá respostas de exercícios por fazer.</p>
            </div>
            <div className="tutor-actions">
              {msgs.length > 0 && (
                <Button size="sm" variant="ghost" onClick={() => setMsgs([])} disabled={busy}>
                  Nova conversa
                </Button>
              )}
              <button type="button" className="icon-btn" aria-label="Fechar o tutor" onClick={() => setOpen(false)}>
                <Icon name="x" size={16} />
              </button>
            </div>
          </header>
          <div className="tutor-body">
            {msgs.length === 0 && (
              <div className="tutor-starters">
                <p className="tutor-starters-label">Sugestões para começar</p>
                {STARTERS.map((s) => (
                  <button key={s} type="button" className="row-item tutor-starter" onClick={() => send(s)}>
                    <span className="tutor-starter-text">{s}</span>
                    <Icon name="arrowRight" size={14} />
                  </button>
                ))}
              </div>
            )}
            {msgs.map((m, i) =>
              m.role === "assistant" ? (
                <div key={i} className="bubble-row bubble-assistant">
                  <span className="bubble-avatar" aria-hidden="true">
                    <Icon name="sparkle" size={14} />
                  </span>
                  <div className="bubble-text">
                    <Markdown src={m.content} />
                  </div>
                </div>
              ) : (
                <div key={i} className="bubble-row bubble-user">
                  <p className="bubble-text">{m.content}</p>
                </div>
              ),
            )}
            {busy && (
              <div className="bubble-row bubble-assistant">
                <span className="bubble-avatar" aria-hidden="true">
                  <Icon name="sparkle" size={14} />
                </span>
                <div className="bubble-text">{live ? <Markdown src={live} /> : <p className="bubble-wait">A pensar…</p>}</div>
              </div>
            )}
            {err && <p className="tutor-err">{err}</p>}
            <div ref={endRef} />
          </div>
          <form
            className="tutor-form"
            onSubmit={(e) => {
              e.preventDefault();
              send(draft);
            }}
          >
            <div className="tutor-compose">
              <textarea
                id={`tutor-input-${moduleId}`}
                className="tutor-input"
                rows={2}
                value={draft}
                placeholder="Pergunte sobre a aula…"
                aria-label="Pergunta para o tutor"
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(draft);
                  }
                }}
              />
              {busy ? (
                <Button variant="secondary" icon="stop" className="tutor-send" aria-label="Parar" title="Parar" onClick={() => ctl.current?.abort()} />
              ) : (
                <Button variant="primary" icon="send" type="submit" className="tutor-send" aria-label="Enviar" title="Enviar" disabled={!draft.trim()} />
              )}
            </div>
          </form>
        </aside>
      )}
    </>
  );
}
