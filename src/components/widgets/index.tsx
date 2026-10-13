import React, { useState } from "react";
import type { WidgetName } from "../../content/types";
import { SpamLab } from "./SpamLab";
import { EngineerCycle } from "./EngineerCycle";
import { AITimeline } from "./AITimeline";
import { ColabChecklist } from "./ColabChecklist";
import { Seg } from "../ui";
import { M2_WIDGETS } from "./m2";
import { M3_WIDGETS } from "./m3";
import { M4_WIDGETS } from "./m4";
import { M5_WIDGETS } from "./m5";
import { M6_WIDGETS } from "./m6";
import { M7_WIDGETS } from "./m7";
import { M8_WIDGETS } from "./m8";
import { M9_WIDGETS } from "./m9";
import { M10_WIDGETS } from "./m10";
import { M11_WIDGETS } from "./m11";

export type ModuleWidget = React.FC<{ moduleId: string }>;
const EXTRA: Record<string, ModuleWidget> = { ...M2_WIDGETS, ...M3_WIDGETS, ...M4_WIDGETS, ...M5_WIDGETS, ...M6_WIDGETS, ...M7_WIDGETS, ...M8_WIDGETS, ...M9_WIDGETS, ...M10_WIDGETS, ...M11_WIDGETS };

export function Widget({ name, moduleId }: { name: WidgetName; moduleId: string }) {
  switch (name) {
    case "rn-grid":
      return <RNGrid />;
    case "agent-explorer":
      return <AgentExplorer />;
    case "ai-nesting":
      return <AINesting />;
    case "ai-timeline":
      return <AITimeline />;
    case "spam-lab":
      return <SpamLab moduleId={moduleId} />;
    case "llm-pipeline":
      return <LLMPipeline />;
    case "engineer-cycle":
      return <EngineerCycle />;
    case "colab-checklist":
      return <ColabChecklist moduleId={moduleId} />;
    default: {
      const W = EXTRA[name];
      return W ? <W moduleId={moduleId} /> : null;
    }
  }
}

// ---------------------------------------------------------------- Russell & Norvig

const RN = [
  { row: 0, col: 0, title: "Pensar como um humano", what: "Modelar a forma como as pessoas pensam.", field: "Ciência cognitiva", example: "Simular, passo a passo, como uma pessoa resolve um puzzle." },
  { row: 0, col: 1, title: "Pensar racionalmente", what: "Seguir as \"leis do pensamento\".", field: "Lógica formal", example: "Deduzir conclusões certas a partir de premissas." },
  { row: 1, col: 0, title: "Agir como um humano", what: "Comportar-se como uma pessoa.", field: "Teste de Turing", example: "O jogo da imitação de Turing (1950)." },
  { row: 1, col: 1, title: "Agir racionalmente", what: "Agir para obter o melhor resultado esperado.", field: "Agente racional", example: "Um termóstato que mantém a temperatura com o mínimo de energia." },
];

function RNGrid() {
  const [sel, setSel] = useState(3);
  const cur = RN[sel];
  return (
    <div className="rn">
      <div className="rn-grid" role="group" aria-label="Grelha de Russell & Norvig">
        <span />
        <span className="rn-axis">Imitar o ser humano</span>
        <span className="rn-axis">Ser racional</span>
        {[0, 1].map((row) => (
          <React.Fragment key={row}>
            <span className="rn-axis rn-axis-row">{row === 0 ? "Pensar" : "Agir"}</span>
            {[0, 1].map((col) => {
              const i = RN.findIndex((x) => x.row === row && x.col === col);
              const c = RN[i];
              return (
                <button
                  key={col}
                  type="button"
                  className={`rn-cell ${sel === i ? "is-sel" : ""}`}
                  aria-pressed={sel === i}
                  onClick={() => setSel(i)}
                >
                  <span className="rn-field">{c.field}</span>
                  {i === 3 && <span className="chip rn-badge">abordagem do manual</span>}
                </button>
              );
            })}
          </React.Fragment>
        ))}
      </div>
      <div className="widget-detail" aria-live="polite">
        <p className="widget-detail-title">{cur.title}</p>
        <p>{cur.what}</p>
        <p className="muted small">Exemplo: {cur.example}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Agentes

const AGENTS = [
  {
    name: "Termóstato",
    sensors: "Temperatura da sala",
    actuators: "Ligar ou desligar o aquecimento",
    measure: "Manter a temperatura pedida gastando pouca energia",
    env: "A sala",
  },
  {
    name: "Filtro de spam",
    sensors: "O texto do email e o remetente",
    actuators: "Mover para a pasta de spam ou deixar na caixa de entrada",
    measure: "Percentagem de emails bem classificados, sem esconder emails importantes",
    env: "A caixa de correio",
  },
  {
    name: "Carro autónomo",
    sensors: "Câmaras, radar, lidar e GPS",
    actuators: "Volante, acelerador, travões e sinais",
    measure: "Chegar com segurança e a horas, cumprindo as regras",
    env: "Estradas, outros carros e peões",
  },
  {
    name: "Claude",
    sensors: "A conversa: texto, imagens e resultados de ferramentas",
    actuators: "Escrever a resposta ou chamar uma ferramenta",
    measure: "Respostas úteis, corretas e seguras",
    env: "A conversa e as ferramentas a que tem acesso",
  },
];

function AgentExplorer() {
  const [i, setI] = useState(0);
  const a = AGENTS[i];
  return (
    <div className="agents">
      <Seg label="Agentes" options={AGENTS.map((x, k) => ({ id: String(k), label: x.name }))} value={String(i)} onChange={(id) => setI(Number(id))} />
      <div className="agents-scale" aria-hidden="true">
        <span>mais simples</span>
        <span className="agents-track">
          <span className="agents-dot" style={{ left: `${(i / (AGENTS.length - 1)) * 100}%` }} />
        </span>
        <span>mais complexo</span>
      </div>
      <dl className="agents-grid" aria-live="polite">
        <div className="agents-field">
          <dt>Sensores</dt>
          <dd>{a.sensors}</dd>
        </div>
        <div className="agents-field">
          <dt>Atuadores</dt>
          <dd>{a.actuators}</dd>
        </div>
        <div className="agents-field">
          <dt>Medida de desempenho</dt>
          <dd>{a.measure}</dd>
        </div>
        <div className="agents-field">
          <dt>Ambiente</dt>
          <dd>{a.env}</dd>
        </div>
      </dl>
    </div>
  );
}

// ---------------------------------------------------------------- IA ⊃ ML ⊃ DL ⊃ IA generativa

const LEVELS = [
  {
    name: "Inteligência artificial",
    def: "Qualquer técnica que faça uma máquina agir de forma inteligente, incluindo regras escritas à mão.",
    how: "Regras escritas por pessoas, pesquisa, ou aprendizagem",
    ex: "MYCIN (regras de médicos), Deep Blue (pesquisa massiva), termóstato",
  },
  {
    name: "Machine learning",
    def: "Sistemas que aprendem padrões a partir de dados, em vez de seguirem só regras.",
    how: "Padrões estatísticos aprendidos de dados em tabela",
    ex: "Previsão de vendas com regressão; deteção de fraude com árvores de decisão",
  },
  {
    name: "Deep learning",
    def: "Redes neuronais com muitas camadas, que aprendem as próprias representações.",
    how: "Representações aprendidas por redes neuronais profundas",
    ex: "Desbloqueio facial do telemóvel; tradução automática",
  },
  {
    name: "IA generativa",
    def: "Cria texto, imagem e código, incluindo os LLMs.",
    how: "Modelos treinados para produzir conteúdo novo",
    ex: "Claude, ChatGPT, geradores de imagem",
  },
];

function AINesting() {
  const [sel, setSel] = useState(3);
  const render = (i: number): React.ReactNode => {
    const l = LEVELS[i];
    return (
      <div className={`nest nest-${i} ${sel === i ? "is-sel" : ""}`}>
        <button type="button" className="nest-head" aria-pressed={sel === i} onClick={() => setSel(i)}>
          <span className="nest-name">{l.name}</span>
          <span className="nest-def">{l.def}</span>
        </button>
        {i < LEVELS.length - 1 && render(i + 1)}
      </div>
    );
  };
  const cur = LEVELS[sel];
  return (
    <div className="nesting">
      {render(0)}
      <div className="widget-detail" aria-live="polite">
        <p className="widget-detail-title">{cur.name}</p>
        <div className="nest-detail-cols">
          <div>
            <p className="eyebrow">Como sabe o que fazer</p>
            <p>{cur.how}</p>
          </div>
          <div>
            <p className="eyebrow">Exemplos</p>
            <p>{cur.ex}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Os três passos de um LLM

const NEXT_SENTENCE = ["A", "IA", "não", "cresceu", "em", "linha", "reta"];

function LLMPipeline() {
  const [k, setK] = useState(1);
  const steps = [
    { n: 1, name: "Pré-treino", type: "Auto-supervisionada", what: "Prever a palavra seguinte em biliões de palavras.", gets: "Aprende língua, factos e padrões de raciocínio." },
    { n: 2, name: "Ajuste supervisionado", type: "Supervisionada", what: "Treino com exemplos de pedidos e boas respostas escritos por pessoas.", gets: "Aprende a seguir instruções." },
    { n: 3, name: "Reforço com feedback", type: "Por reforço", what: "Pessoas, ou outro modelo, comparam respostas; o modelo é ajustado para preferir as melhores.", gets: "Respostas mais úteis e seguras (Ouyang et al., 2022)." },
  ];
  return (
    <div className="pipeline">
      <ol className="pipe-steps">
        {steps.map((s) => (
          <li key={s.n} className="pipe-step">
            <div className="pipe-head">
              <span className="pipe-n mono">{s.n}</span>
              <p className="pipe-name">{s.name}</p>
            </div>
            <span className="chip">{s.type}</span>
            <p>{s.what}</p>
            <p className="muted small">{s.gets}</p>
          </li>
        ))}
      </ol>
      <div className="pipe-demo">
        <p className="widget-detail-title">Como o texto dá os próprios rótulos</p>
        <p className="muted small">Da frase "{NEXT_SENTENCE.join(" ")}" saem, sem anotação humana, estes exemplos de treino:</p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">O modelo vê</th>
                <th scope="col">Tem de prever</th>
              </tr>
            </thead>
            <tbody>
              {NEXT_SENTENCE.slice(1, k + 1).map((w, i) => (
                <tr key={i}>
                  <td>{NEXT_SENTENCE.slice(0, i + 1).join(" ")}</td>
                  <td>
                    <strong>{w}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="row gap-sm wrap">
          <button type="button" className="btn btn-secondary btn-sm" disabled={k >= NEXT_SENTENCE.length - 1} onClick={() => setK(k + 1)}>
            Próximo exemplo
          </button>
          <button type="button" className="btn btn-ghost btn-sm" disabled={k <= 1} onClick={() => setK(1)}>
            Recomeçar
          </button>
        </div>
      </div>
    </div>
  );
}
