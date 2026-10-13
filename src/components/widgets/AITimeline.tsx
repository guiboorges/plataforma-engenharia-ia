import React, { useState } from "react";

// Reproduz o diagrama 02-historia-ia.png da aula: 11 marcos (losangos) e 2 invernos (barras), 1943 a 2024.

type Row = { label: string; from: number; to?: number; detail: string; winter?: boolean; highlight?: boolean };

const ROWS: Row[] = [
  { label: "Primeiro neurónio artificial", from: 1943, detail: "McCulloch & Pitts descrevem um modelo matemático do neurónio." },
  { label: "Turing propõe o jogo da imitação", from: 1950, detail: "\"Computing Machinery and Intelligence\", na revista Mind. Na secção 7 propõe educar uma \"mente de criança\"." },
  { label: "Dartmouth dá nome à IA", from: 1956, detail: "A proposta de 1955 (McCarthy, Minsky, Rochester e Shannon) cria o nome; a conferência de 1956 lança a área." },
  { label: "Perceptrão de Rosenblatt", from: 1958, detail: "Uma rede de uma camada que aprende a partir de exemplos." },
  { label: "1.º inverno da IA", from: 1974, to: 1980, winter: true, detail: "Promessas não cumpridas; Minsky & Papert (1969) mostram que um perceptrão de uma camada nem o XOR aprende; o relatório Lighthill (1973) leva a cortes no Reino Unido, e a DARPA também reduz." },
  { label: "Retropropagação popularizada", from: 1986, detail: "Rumelhart, Hinton & Williams: permite treinar redes com várias camadas." },
  { label: "2.º inverno da IA", from: 1987, to: 1993, winter: true, detail: "Os sistemas periciais revelam-se caros de manter e frágeis fora do seu domínio; o mercado das máquinas LISP colapsa em 1987." },
  { label: "Deep Blue vence Kasparov", from: 1997, detail: "Com pesquisa massiva e funções de avaliação afinadas por especialistas, não com aprendizagem." },
  { label: "AlexNet vence o ImageNet", from: 2012, detail: "15,3% de erro, contra 26,2% do segundo classificado: arranque do deep learning moderno." },
  { label: "AlphaGo vence Lee Sedol", from: 2016, detail: "4–1 no Go, combinando aprendizagem supervisionada com jogos humanos e reforço com milhões de jogos contra si próprio." },
  { label: "Nasce o Transformer", from: 2017, detail: "\"Attention Is All You Need\" (Vaswani et al.), a arquitetura por trás de todos os LLMs atuais." },
  { label: "ChatGPT chega ao público", from: 2022, highlight: true, detail: "Novembro de 2022: a IA generativa chega ao grande público. Seguem-se o Claude e o GPT-4 (2023)." },
  { label: "Modelos de raciocínio", from: 2024, detail: "Modelos treinados para pensar antes de responder (2024–2025). No mesmo ano, Nobel da Física para Hopfield e Hinton e da Química para Hassabis, Jumper e Baker." },
];

const MIN = 1940;
const MAX = 2027;
const x = (y: number) => ((y - MIN) / (MAX - MIN)) * 100;
const DECADES = [1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020];

export function AITimeline() {
  const [sel, setSel] = useState(11);
  const cur = ROWS[sel];
  return (
    <div className="tl">
      <p className="tl-legend">
        <span className="tl-legend-item">
          <span className="tl-key tl-key-ms" aria-hidden="true" /> marcos
        </span>
        <span className="tl-legend-item">
          <span className="tl-key tl-key-winter" aria-hidden="true" /> invernos, períodos de cortes no financiamento
        </span>
      </p>
      <div className="tl-chart">
        <div className="tl-axis" aria-hidden="true">
          <span className="tl-labelcol" />
          <span className="tl-track">
            {DECADES.map((d) => (
              <span key={d} className="tl-tick mono" style={{ left: `${x(d)}%` }}>
                {d}
              </span>
            ))}
          </span>
        </div>
        {ROWS.map((r, i) => (
          <button
            key={r.label}
            type="button"
            className={`tl-row ${sel === i ? "is-sel" : ""} ${r.highlight ? "is-hl" : ""}`}
            aria-pressed={sel === i}
            onClick={() => setSel(i)}
          >
            <span className="tl-labelcol">{r.label}</span>
            <span className="tl-track">
              {DECADES.map((d) => (
                <span key={d} className="tl-grid" style={{ left: `${x(d)}%` }} aria-hidden="true" />
              ))}
              {r.winter ? (
                <span className="tl-winter" style={{ left: `${x(r.from)}%`, width: `${x(r.to!) - x(r.from)}%` }} />
              ) : (
                <span className="tl-diamond" style={{ left: `${x(r.from)}%` }} />
              )}
              <span className="tl-year mono" style={x(r.to ?? r.from) > 82 ? { right: `calc(${100 - x(r.from)}% + 12px)` } : { left: `calc(${x(r.to ?? r.from)}% + 12px)` }}>
                {r.to ? `${r.from}–${r.to}` : r.from}
              </span>
            </span>
          </button>
        ))}
      </div>
      <div className="widget-detail" aria-live="polite">
        <p className="eyebrow">
          <span className="mono">{cur.to ? `${cur.from}–${cur.to}` : cur.from}</span>
        </p>
        <p className="widget-detail-title">{cur.label}</p>
        <p>{cur.detail}</p>
      </div>
    </div>
  );
}
