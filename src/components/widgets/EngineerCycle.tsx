import React, { useState } from "react";

// Reproduz o diagrama 03-ciclo-engenheiro-ia.png, com um percurso que se pode simular passo a passo.

const STEPS = [
  { n: 1, name: "Definir o problema", sub: "Que métrica prova o sucesso?", ex: "Responder a 80% das perguntas dos colaboradores sobre o manual interno sem ajuda humana, com 95% de respostas corretas." },
  { n: 2, name: "Reunir os dados", sub: "Recolher, limpar e rotular", ex: "O manual, as perguntas que já chegaram aos recursos humanos e as respostas que foram dadas." },
  { n: 3, name: "Escolher o modelo", sub: "Prompt, RAG, ajuste ou treino", ex: "Um LLM existente com RAG sobre o manual; nada é treinado de raiz." },
  { n: 4, name: "Avaliar", sub: "Com testes do próprio caso", ex: "60 perguntas reais com a resposta certa. É aqui que tudo se decide." },
  { n: 5, name: "Pôr em produção", sub: "API, custo e segurança", ex: "Integrar no portal interno, medir o custo por pergunta e não expor dados pessoais." },
  { n: 6, name: "Monitorizar", sub: "Erros, deriva e feedback real", ex: "Registar as perguntas falhadas: são os novos dados para o passo 2." },
];

export function EngineerCycle() {
  const [cur, setCur] = useState(0);
  const [trail, setTrail] = useState<string[]>([]);
  const go = (to: number, note: string) => {
    setTrail((t) => [...t.slice(-5), note]);
    setCur(to);
  };
  const s = STEPS[cur];
  // posição na grelha: em cima 1 2 3, em baixo 6 5 4
  const pos = (i: number) => (i < 3 ? { row: 1, col: i + 1 } : { row: 2, col: 6 - i });
  return (
    <div className="cycle">
      <p className="cycle-title">O ciclo não acaba no deploy: o que se aprende em produção volta aos dados</p>
      <div className="cycle-grid">
        {STEPS.map((st, i) => {
          const p = pos(i);
          return (
            <button
              key={st.n}
              type="button"
              className={`cycle-box ${cur === i ? "is-sel" : ""} cycle-b${st.n}`}
              style={{ gridRow: p.row * 2 - 1, gridColumn: p.col * 2 - 1 }}
              aria-pressed={cur === i}
              onClick={() => setCur(i)}
            >
              <span className="cycle-top">
                <span className="cycle-n mono">{st.n}</span>
                <span className="cycle-name">{st.name}</span>
              </span>
              <span className="cycle-sub">{st.sub}</span>
            </button>
          );
        })}
        <span className="cycle-arrow cycle-a12" aria-hidden="true">→</span>
        <span className="cycle-arrow cycle-a23" aria-hidden="true">→</span>
        <span className="cycle-arrow cycle-a34" aria-hidden="true">
          ↓ <em>avaliar</em> ↑ <em>não passa</em>
        </span>
        <span className="cycle-arrow cycle-a45" aria-hidden="true">
          ← <em>passa</em>
        </span>
        <span className="cycle-arrow cycle-a56" aria-hidden="true">←</span>
        <span className="cycle-loop" aria-hidden="true">
          <em>6 → 2: novos dados e erros reais</em>
        </span>
      </div>
      <div className="widget-detail" aria-live="polite">
        <p className="eyebrow">Passo {s.n}</p>
        <p className="widget-detail-title">{s.name}</p>
        <p>{s.ex}</p>
        <div className="row gap-sm wrap cycle-actions">
          {cur === 3 ? (
            <>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => go(2, "4 → 3: não passou nos testes")}>
                Não passa: volta ao 3
              </button>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => go(4, "4 → 5: passou nos testes")}>
                Passa: segue para o 5
              </button>
            </>
          ) : cur === 5 ? (
            <button type="button" className="btn btn-primary btn-sm" onClick={() => go(1, "6 → 2: novos dados e erros reais")}>
              Novos dados: volta ao 2
            </button>
          ) : (
            <button type="button" className="btn btn-primary btn-sm" onClick={() => go(cur + 1, `${cur + 1} → ${cur + 2}`)}>
              Seguinte
            </button>
          )}
        </div>
        {trail.length > 0 && <p className="cycle-trail">Percurso: {trail.join(" · ")}</p>}
      </div>
    </div>
  );
}
