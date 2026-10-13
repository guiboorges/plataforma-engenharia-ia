import type { PhaseClosing } from "../types";

// Fecho da Fase 1: transcrição de fase-01-exame-e-mini-projeto/ (01-exame.md, 02-mini-projeto.md, 03-gabarito.md),
// versão de 9 de outubro de 2026. Respostas, critérios e valores de referência do gabarito.
// O código do Grupo III e os valores do mini-projeto foram corridos com Python 3.13, NumPy 2.5 e pandas 3.0.

const G3_DATA = `inv = np.array([1, 2, 2, 3, 4, 4, 5, 6, 6, 7, 8, 9])
enc = np.array([12, 15, 14, 18, 21, 20, 24, 26, 27, 28, 33, 35])`;

const G3_SOLUTION = `inv = np.array([1, 2, 2, 3, 4, 4, 5, 6, 6, 7, 8, 9])
enc = np.array([12, 15, 14, 18, 21, 20, 24, 26, 27, 28, 33, 35])

X = np.column_stack([np.ones(len(inv)), inv])                       # (a)
beta, *_ = np.linalg.lstsq(X, enc, rcond=None)
print(beta, round(np.mean((X @ beta - enc) ** 2), 4))              # [8.94  2.907] 0.3665

m, s = inv.mean(), inv.std()                                        # (b)
Z = np.column_stack([np.ones(len(inv)), (inv - m) / s])
w = np.zeros(2)
for _ in range(300):
    w = w - 0.1 * 2 * Z.T @ (Z @ w - enc) / len(enc)
print(w, round(w[0] - w[1] * m / s, 3), round(w[1] / s, 3))       # [22.75   7.035] 8.94 2.907

rng = np.random.default_rng(0)                                      # (c)
incl = []
for _ in range(2000):
    i = rng.integers(0, len(inv), len(inv))
    b, *_ = np.linalg.lstsq(X[i], enc[i], rcond=None)
    incl.append(b[1])
print(np.percentile(incl, [2.5, 97.5]).round(3))                   # [2.747 3.052]`;

const G3_OUTPUT = `[8.93950178 2.90747331] 0.3665
[22.75        7.03474368] 8.94 2.907
[2.747 3.052]`;

const LOAD = `import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

URL = "https://raw.githubusercontent.com/selva86/datasets/master/Advertising.csv"
ad = pd.read_csv(URL, index_col=0)
ad.columns = ad.columns.str.lower()      # tv, radio, newspaper, sales`;

const FUNCS = `def eqm(X, y, beta):
    return np.mean((X @ beta - y) ** 2)

def descida_gradiente(X, y, eta, passos):
    beta = np.zeros(X.shape[1])
    perdas = []
    for _ in range(passos):
        gradiente = 2 * X.T @ (X @ beta - y) / len(y)
        beta = beta - eta * gradiente
        perdas.append(eqm(X, y, beta))
    return beta, np.array(perdas)

def padronizar(X):
    media, desvio = X.mean(axis=0), X.std(axis=0)
    return (X - media) / desvio, media, desvio`;

const LOSS_PLOT = `for eta in [0.01, 0.1, 1.05]:
    beta, perdas = descida_gradiente(Z, y, eta, 200)
    plt.plot(perdas, label=f"η = {eta}")
plt.yscale("log"); plt.ylim(1, 1e4)
plt.xlabel("Passo"); plt.ylabel("EQM"); plt.legend(); plt.show()`;

const FUNCS_STUB = `def eqm(X, y, beta):
    ...

def descida_gradiente(X, y, eta, passos):
    # devolve os coeficientes e a lista das perdas
    ...

def padronizar(X):
    ...
`;

const Q1 = "Verifique a forma, os tipos e os valores em falta. Faça três gráficos de dispersão, vendas contra cada meio, e calcule a matriz de correlações. Que meio parece mais ligado às vendas? Há meios correlacionados entre si?";
const Q2 =
  "Ajuste o modelo sales ≈ b₀ + b₁·tv:\n- monte a matriz X com uma coluna de uns e a coluna `tv`;\n- resolva com `np.linalg.lstsq(X, y, rcond=None)` e, separadamente, com as **equações normais** (XᵀX)β = Xᵀy e `np.linalg.solve`;\n- calcule o erro quadrático médio (EQM) e o R² = 1 − EQM / Var(y), a fração da variação das vendas que o modelo explica.\n\nInterprete b₁ em linguagem de negócio, com as unidades certas.";
const Q3 =
  "Ajuste o mesmo modelo com a sua própria descida do gradiente sobre o EQM.\n- (a) Use os dados sem transformação, com η = 10⁻⁴ e com η = 10⁻⁵, durante 1000 passos. O que acontece em cada caso?\n- (b) **Padronize** `tv` (subtrair a média e dividir pelo desvio padrão) e repita durante 200 passos com três taxas: η = 0,01, η = 0,1 e η = 1,05. Desenhe as três curvas da perda no mesmo gráfico, com o eixo y em escala logarítmica.\n- (c) Converta os coeficientes obtidos com η = 0,1 para a escala original e compare com a pergunta 2.\n- (d) Explique, com a ideia de curvatura do M5, porque é que a padronização ajuda, e porque é que η = 1,05 diverge.";
const Q4 =
  "Ajuste sales ≈ b₀ + b₁·tv + b₂·radio + b₃·newspaper, com `lstsq` e com descida do gradiente nas três variáveis padronizadas. Os dois métodos coincidem? Quanto desce o EQM face à regressão só com TV? Agora o ponto principal: ajuste também sales ≈ b₀ + b₁·newspaper sozinho. O coeficiente dos jornais muda muito entre o modelo simples e o múltiplo. Porquê? Use a matriz de correlações da pergunta 1 e a secção 7 do M6.";
const Q5 =
  "Calcule intervalos de confiança de 95% para os quatro coeficientes da regressão múltipla por bootstrap: 2000 reamostragens dos 200 mercados, com `np.random.default_rng(0)`, voltando a ajustar com `lstsq` em cada uma. Mostre a distribuição bootstrap do coeficiente dos jornais num histograma. Que meios têm um efeito claramente diferente de zero?";
const Q6 =
  "Escreva à direção de marketing, em 6 a 10 linhas e sem jargão, o que os dados mostram e o que recomenda. Inclua pelo menos duas limitações. Uma delas tem de ser sobre causalidade: os orçamentos não foram sorteados entre mercados.";

export const F1: PhaseClosing = {
  phase: "F1",
  source: "curso-engenharia-ia/fase-01-exame-e-mini-projeto",
  intro:
    "A Fase 1 fecha com uma semana e meia de avaliação: um exame sobre os três módulos de matemática e um mini-projeto que os junta todos num só problema, a regressão linear programada de raiz. Passa-se à Fase 2 com **14 ou mais valores no exame e 12 ou mais no mini-projeto**.",
  passRule: { exam: 14, project: 12 },
  sessions: [
    { label: "Sessão 1", what: "Rever as três apostilas e refazer as perguntas falhadas nas provas do M4, M5 e M6", time: "1h30" },
    { label: "Sessão 2", what: "Fazer o exame, cronometrado e sem consulta (ver as regras abaixo)", time: "1h30" },
    { label: "Sessões 3 e 4", what: "Mini-projeto: perguntas 1 a 3", time: "3h" },
    { label: "Sessão 5", what: "Mini-projeto: perguntas 4 a 6 e conclusões", time: "1h30 a 2h" },
  ],
  retakeNote:
    "Se o exame ficar abaixo de 14: rever as secções indicadas no gabarito durante uma semana e repetir o exame. O mini-projeto pode ser melhorado e entregue de novo as vezes que for preciso.",
  examRules:
    "**Duração:** 90 minutos. **Sem consulta e sem correr código** nos Grupos I e II (pode usar calculadora); no Grupo III pode usar o Colab, mas não a internet nem assistentes de IA. Cotação total: 20 valores; aprovação com 14. O exame vale 20 valores, distribuídos assim: M4 5 valores, M5 5 valores, M6 6 valores e um problema integrador de 4 valores, que usa os três módulos ao mesmo tempo.",

  exam: {
    minutes: 90,
    total: 20,
    pass: 14,
    groups: [
      {
        title: "Grupo I — Escolha múltipla (9 valores)",
        note: "Uma só resposta certa por pergunta. 1 valor cada.",
        questions: [
          {
            kind: "mcq", id: "q1", num: 1, section: "M4", points: 1,
            q: "Qual é o cosseno do ângulo entre u = (2, 0) e v = (1, 1)?",
            options: ["0", "0,5", "0,707", "1"],
            answer: 2,
            explain: "2 / (2 × √2) ≈ 0,707.",
          },
          {
            kind: "mcq", id: "q2", num: 2, section: "M4", points: 1,
            q: "X é uma matriz com forma (200, 3) e w um vetor com forma (3,). Qual é a forma de `X @ w`?",
            options: ["(200,)", "(3,)", "(200, 3)", "Dá erro."],
            answer: 0,
          },
          {
            kind: "mcq", id: "q3", num: 3, section: "M4", points: 1,
            q: "A SVD de uns dados padronizados tem valores singulares 4, 2 e 1. Que fração da variância explica a primeira componente principal?",
            options: ["Cerca de 57%", "100%", "Cerca de 67%", "Cerca de 76%"],
            answer: 3,
            explain: "16 / (16 + 4 + 1) ≈ 0,76.",
          },
          {
            kind: "mcq", id: "q4", num: 4, section: "M5", points: 1,
            q: "Quanto vale a derivada de f(x) = (3x − 1)² em x = 1?",
            options: ["4", "12", "6", "2"],
            answer: 1,
            explain: "2(3x − 1)·3 em x = 1 dá 12.",
          },
          {
            kind: "mcq", id: "q5", num: 5, section: "M5", points: 1,
            q: "Seja f(x, y) = x² + 2y². A partir do ponto (1, −1), um passo de descida do gradiente com η = 0,1 leva a:",
            options: ["(1,2; −1,4)", "(0,9; −0,9)", "(0,8; −0,6)", "(0,8; −1,4)"],
            answer: 2,
            explain: "O gradiente em (1, −1) é (2, −4), e (1, −1) − 0,1 × (2, −4) = (0,8; −0,6).",
          },
          {
            kind: "mcq", id: "q6", num: 6, section: "M5", points: 1,
            q: "Durante um treino, a curva da perda sobe e oscila de passo para passo. A causa mais provável é:",
            options: [
              "A taxa de aprendizagem é grande demais.",
              "A taxa de aprendizagem é pequena demais.",
              "O modelo já convergiu.",
              "Os dados não foram baralhados.",
            ],
            answer: 0,
          },
          {
            kind: "mcq", id: "q7", num: 7, section: "M6", points: 1,
            q: "P(A e B) = 0,12 e P(B) = 0,4. Quanto vale P(A | B)?",
            options: ["0,048", "0,3", "0,52", "3,33"],
            answer: 1,
          },
          {
            kind: "mcq", id: "q8", num: 8, section: "M6", points: 1,
            q: "Em 100 visitas houve 50 compras. O intervalo de confiança de 95% para a taxa de compra é, aproximadamente:",
            options: ["De 0,45 a 0,55", "De 0,40 a 0,60", "De 0,30 a 0,70", "De 0,49 a 0,51"],
            answer: 1,
            explain: "Erro padrão √(0,25/100) = 0,05, e 0,5 ± 0,098.",
          },
          {
            kind: "mcq", id: "q9", num: 9, section: "M6", points: 1,
            q: "Um teste A/A, com limiar de 0,05, é repetido 100 vezes. Quantos resultados \"significativos\" se esperam?",
            options: ["Nenhum", "Cerca de 50", "Exatamente 1", "Cerca de 5"],
            answer: 3,
          },
        ],
      },
      {
        title: "Grupo II — Resposta curta (7 valores)",
        note: "3 a 6 linhas por resposta.",
        questions: [
          {
            kind: "open", id: "q10", num: 10, section: "M4", points: 2, rows: 6,
            q: "O que é um vetor próprio de uma matriz? Que papel têm os vetores próprios da matriz de covariância na PCA?",
            criteria: [
              { id: "c1", text: "Definição", points: 1 },
              { id: "c2", text: "Papel na PCA", points: 1 },
            ],
            model:
              "Um vetor próprio v de A é uma direção que a matriz só estica, sem rodar: Av = λv, e λ é o valor próprio. Na PCA, os vetores próprios da matriz de covariância são as componentes principais, as direções de maior variação dos dados, e os valores próprios dizem quanta variância há em cada uma. Guardam-se as de maior valor próprio.",
          },
          {
            kind: "open", id: "q11", num: 11, section: "M5", points: 2, rows: 6,
            q: "Porque se padronizam as variáveis antes de usar a descida do gradiente? Use a ideia de um vale alongado, ou de curvaturas diferentes em cada direção.",
            criteria: [
              { id: "c1", text: "Vale alongado ou curvaturas", points: 1 },
              { id: "c2", text: "Consequência para a taxa e a convergência", points: 1 },
            ],
            model:
              "Com variáveis em escalas muito diferentes, a perda tem curvaturas muito diferentes em cada direção: um vale estreito e comprido. A taxa de aprendizagem fica limitada pela direção mais curva (η < 2/λ máximo), e na direção suave o progresso é lentíssimo, com ziguezague. Padronizar torna as curvaturas parecidas e permite uma taxa maior, que funciona em todas as direções.",
          },
          {
            kind: "open", id: "q12", num: 12, section: "M6", points: 3, rows: 8,
            q: "Um modelo de previsão de abandono marca 80% dos clientes que vão sair, mas também marca 10% dos que ficam. Todos os meses sai 5% dos clientes. (a) Desenhe a árvore de frequências naturais para 1000 clientes. (b) Que fração dos clientes marcados vai mesmo sair? (c) Que conclusão tira para a equipa que telefona aos clientes marcados?",
            criteria: [
              { id: "c1", text: "Árvore", points: 1 },
              { id: "c2", text: "Cálculo", points: 1 },
              { id: "c3", text: "Conclusão prática", points: 1 },
            ],
            model:
              "(a) De 1000 clientes, 50 saem: 40 marcados e 10 não. 950 ficam: 95 marcados e 855 não. (b) 40 / (40 + 95) = 40/135 ≈ 30%. (c) Sete em cada dez chamadas vão para clientes que ficariam de qualquer forma. Mesmo assim, a lista marcada concentra o risco: 30% contra 5% na base. Vale a pena se o custo de uma chamada for baixo face ao valor de um cliente retido; também se pode ajustar o limiar do modelo.",
          },
        ],
      },
      {
        title: "Grupo III — Problema integrador (4 valores)",
        questions: [
          {
            // Pergunta 13 → os três módulos e o mini-projeto (ver examReview).
            kind: "open", id: "q13", num: 13, section: "M4", points: 4, rows: 18,
            q: "Uma loja registou, durante 12 semanas, o investimento em anúncios online (em centenas de euros) e o número de encomendas:",
            context: [
              { t: "code", code: G3_DATA },
              {
                t: "p",
                text: "(a) **Álgebra linear.** Ajuste o modelo enc ≈ b₀ + b₁·inv com `np.linalg.lstsq` e indique os coeficientes e o erro quadrático médio. (b) **Otimização.** Ajuste o mesmo modelo com descida do gradiente: padronize `inv`, use η = 0,1 e 300 passos a partir de zeros, e converta os coeficientes para a escala original. Coincidem com (a)? (c) **Estatística.** Calcule um intervalo de confiança de 95% para b₁ por bootstrap, com 2000 reamostragens das semanas e `np.random.default_rng(0)`. (d) Interprete b₁ numa frase, com o intervalo. Pode a loja concluir que cada 100 € a mais em anúncios *causam* esse aumento? Porquê?",
              },
            ],
            criteria: [
              { id: "c1", text: "(a) Coeficientes e EQM certos", points: 1 },
              { id: "c2", text: "(b) Descida do gradiente com padronização e conversão de escala certas", points: 1 },
              { id: "c3", text: "(c) Intervalo bootstrap certo", points: 1 },
              { id: "c4", text: "(d) Interpretação com o intervalo e ressalva causal justificada", points: 1 },
            ],
            model:
              "(a) b₀ ≈ 8,94 e b₁ ≈ 2,907, com EQM 0,3665. (b) Coeficientes padronizados (22,75; 7,035), que na escala original dão 8,94 e 2,907: coincidem com (a). (c) Intervalo de 95% para b₁: 2,747 a 3,052. (d) Cada 100 € a mais em anúncios estão associados a cerca de 2,9 encomendas a mais por semana (intervalo de 95%: 2,7 a 3,1), dentro da gama observada, de 100 a 900 €. Não se pode concluir causalidade: o investimento não foi sorteado, e as semanas com mais investimento podem coincidir com épocas de mais procura ou com promoções. Para medir o efeito causal, seria preciso uma experiência, por exemplo sortear as semanas ou as regiões com mais e menos investimento.",
            modelBlocks: [{ t: "code", title: "Solução do gabarito, alíneas (a) a (c)", code: G3_SOLUTION, output: G3_OUTPUT }],
          },
        ],
      },
    ],
  },

  // Gabarito: perguntas 1 a 3 e 10 → M4 (secções 3, 4, 5 e 7); 4 a 6 e 11 → M5 (secções 2, 3, 5 e 6);
  // 7 a 9 e 12 → M6 (secções 2 e 6); 13 → os três módulos e o mini-projeto.
  examReview: [
    { questions: [1, 2, 3, 10, 13], module: "M4", sections: [3, 4, 5, 7] },
    { questions: [4, 5, 6, 11, 13], module: "M5", sections: [2, 3, 5, 6] },
    { questions: [7, 8, 9, 12, 13], module: "M6", sections: [2, 6] },
  ],

  project: {
    title: "Regressão linear de raiz: publicidade e vendas",
    intro: [
      {
        t: "p",
        text: "Uma regressão linear programada de raiz, num notebook do Colab, que junta os três módulos da fase: a álgebra linear resolve o problema de uma vez (M4), a descida do gradiente resolve-o passo a passo (M5) e a estatística diz quanto confiar no resultado (M6). Tempo previsto: 4 a 5 horas.",
      },
      {
        t: "p",
        text: "O problema é de marketing. Uma empresa vende um produto em 200 mercados e, em cada um, investiu um orçamento diferente em publicidade na televisão, na rádio e nos jornais. A direção quer saber que meios estão associados a mais vendas e quanto. Os dados são os do livro de James, Witten, Hastie, Tibshirani & Taylor (2023, caps. 2 e 3), que se estuda na Fase 2.",
      },
      { t: "h3", text: "Os dados" },
      { t: "code", code: LOAD },
      {
        t: "table",
        head: ["Coluna", "O que é"],
        rows: [
          ["`tv`", "Orçamento de publicidade na televisão (milhares de dólares)"],
          ["`radio`", "Orçamento na rádio (milhares de dólares)"],
          ["`newspaper`", "Orçamento nos jornais (milhares de dólares)"],
          ["`sales`", "Vendas do produto (milhares de unidades)"],
        ],
      },
      {
        t: "p",
        text: "O endereço acima é uma cópia pública no GitHub do ficheiro original, que está em [statlearning.com](https://www.statlearning.com/), na secção de dados. Se o endereço deixar de funcionar, descarregue o ficheiro do site oficial e carregue-o no Colab.",
      },
      {
        t: "p",
        text: "**Regra do projeto:** os ajustes fazem-se com NumPy, não com o scikit-learn. No fim, pode usar o `LinearRegression` do scikit-learn só para confirmar.",
      },
      { t: "h3", text: "As seis perguntas" },
      {
        t: "p",
        text: "Cada pergunta tem de ser respondida com código, os números pedidos e uma resposta de 2 a 4 frases. As perguntas 1, 3 e 5 pedem também um gráfico.",
      },
    ],
    // As alíneas das perguntas 2 e 3 vêm em lista no original: linhas "- …" (a PhasePage mostra-as em lista).
    questions: [
      { n: 1, title: "Explorar (M3 e M6).", text: Q1 },
      {
        n: 2,
        title: "Mínimos quadrados com álgebra linear (M4).",
        text: Q2,
      },
      {
        n: 3,
        title: "Descida do gradiente (M5).",
        text: Q3,
      },
      { n: 4, title: "Regressão múltipla (M4 e M5).", text: Q4 },
      { n: 5, title: "Incerteza (M6).", text: Q5 },
      { n: 6, title: "Recomendação.", text: Q6 },
    ],
    deliverables: [
      { t: "p", text: "Um notebook que corre de cima a baixo sem erros (Ambiente de execução → Executar tudo), organizado assim:" },
      {
        t: "list",
        ordered: true,
        items: [
          "**Título e objetivo**, numa célula de texto.",
          "**Funções reutilizáveis**: `eqm(X, y, beta)`, `descida_gradiente(X, y, eta, passos)` (que devolve os coeficientes e a lista das perdas) e `padronizar(X)`.",
          "**As seis perguntas**, cada uma com código, números, gráfico quando pedido e resposta.",
          "**Conclusões**: as três descobertas principais.",
        ],
      },
    ],
    extra: {
      title: "Para ir mais longe (opcional)",
      blocks: [
        {
          t: "list",
          items: [
            "Acrescente o termo tv × radio ao modelo múltiplo. O EQM desce? James et al. (2023, sec. 3.3) discutem esta sinergia entre meios.",
            "Separe 50 mercados para teste antes de ajustar, e compare o EQM no treino e no teste. É a ideia central do M7.",
          ],
        },
      ],
    },
    rubric: [
      { id: "exploracao", text: "Exploração", detail: "Inspeção, gráficos de dispersão e correlações certos e comentados", points: 2 },
      { id: "minimos", text: "Mínimos quadrados", detail: "Coeficientes, EQM e R² certos pelos dois métodos; interpretação com unidades", points: 3 },
      {
        id: "descida",
        text: "Descida do gradiente",
        detail: "Implementação própria; efeito das taxas e da padronização mostrado e explicado; conversão de escala certa; curvas da perda",
        points: 5,
      },
      { id: "multipla", text: "Regressão múltipla", detail: "Coeficientes certos pelos dois métodos; explicação da mudança no coeficiente dos jornais", points: 3 },
      { id: "bootstrap", text: "Bootstrap", detail: "Intervalos certos e bem interpretados", points: 3 },
      { id: "recomendacao", text: "Recomendação", detail: "Clara, sustentada pelos números, com as limitações pedidas", points: 2 },
      { id: "codigo", text: "Código", detail: "Corre de cima a baixo, funções reutilizadas, nomes claros", points: 2 },
    ],
    references: [
      {
        text: "James, G., Witten, D., Hastie, T., Tibshirani, R. & Taylor, J. (2023). *An Introduction to Statistical Learning with Applications in Python*. Springer. Caps. 2 e 3.",
        href: "https://www.statlearning.com/",
      },
    ],
  },

  projectKey: [
    { t: "p", text: "Todo o código foi corrido com NumPy 2.5 e pandas 3.0, e os valores são os reais." },
    { t: "p", text: "Funções usadas na solução de referência:" },
    { t: "code", code: FUNCS },
    { t: "h3", text: "1. Explorar" },
    {
      t: "p",
      text: "200 mercados, 4 colunas numéricas, nenhum valor em falta. Correlações com as vendas: TV 0,782, rádio 0,576, jornais 0,228. Entre meios, a mais alta é rádio com jornais, 0,354: os mercados que investem em rádio também tendem a investir em jornais. A TV parece a mais ligada às vendas.",
    },
    { t: "h3", text: "2. Mínimos quadrados" },
    {
      t: "p",
      text: "`lstsq` e equações normais dão o mesmo: b₀ = 7,0326 e b₁ = 0,0475. EQM = 10,5127; R² = 0,612. Interpretação: cada 1000 dólares a mais em TV estão associados a cerca de 47,5 unidades vendidas a mais; sem nenhum investimento em TV, o modelo prevê cerca de 7000 unidades. A TV sozinha explica 61% da variação das vendas.",
    },
    { t: "h3", text: "3. Descida do gradiente" },
    {
      t: "table",
      head: ["Caso", "Resultado"],
      rows: [
        ["Sem padronizar, η = 10⁻⁴", "Diverge: a perda passa de 4630 para 8 × 10¹⁵ em 10 passos e depois dá `nan`"],
        ["Sem padronizar, η = 10⁻⁵, 1000 passos", "Não diverge, mas fica parada: β = (0,036; 0,0831), EQM 22,91, o dobro do ótimo"],
        ["Padronizado, η = 0,01, 200 passos", "Ainda a descer: EQM 10,5786"],
        ["Padronizado, η = 0,1", "Chega a 10,5127 antes do passo 50"],
        ["Padronizado, η = 1,05", "Diverge: EQM de 7,7 × 10¹⁸ ao passo 200"],
      ],
    },
    {
      t: "p",
      text: "(c) Com η = 0,1, os coeficientes padronizados são (14,0225; 4,0710). Na escala original: b₁ = 4,0710 / 85,64 = 0,0475 e b₀ = 14,0225 − 0,0475 × 147,04 = 7,0326, iguais aos da pergunta 2. Atenção: o desvio padrão que entra na conversão é o de `np.std` (85,64), que divide por n; o `describe()` do pandas mostra 85,85, porque divide por n − 1.",
    },
    {
      t: "p",
      text: "(d) Sem padronizar, a hessiana da perda tem valores próprios 0,51 e 57 913: uma direção mais de cem mil vezes mais curva do que a outra. A taxa máxima é 2 / 57 913 ≈ 3,5 × 10⁻⁵, o que explica que 10⁻⁴ diverja; e com uma taxa abaixo disso, a direção suave, que é sobretudo a do b₀, quase não anda. Depois de padronizar, a hessiana é 2I, com os dois valores próprios iguais a 2: a taxa máxima passa a 2/2 = 1, e por isso 1,05 diverge e 0,1 converge depressa.",
    },
    { t: "code", code: LOSS_PLOT },
    { t: "h3", text: "4. Regressão múltipla" },
    {
      t: "p",
      text: "Com as três variáveis: b₀ = 2,9389, TV 0,0458, rádio 0,1885, jornais −0,0010. EQM 2,7841 (contra 10,5127 só com TV); R² = 0,897. A descida do gradiente nas variáveis padronizadas, com η = 0,1 e 500 passos, dá os mesmos coeficientes depois de convertidos; a taxa máxima aqui é 0,729. Só com TV e rádio: (2,9211; 0,0458; 0,1880) e EQM 2,7846, praticamente igual: os jornais não acrescentam nada.",
    },
    {
      t: "p",
      text: "O ponto principal: sozinhos, os jornais têm coeficiente 0,0547, positivo. No modelo múltiplo, ficam em −0,001, praticamente zero. Os mercados que investem em jornais também investem mais em rádio (correlação 0,354), e é a rádio que está associada às vendas. O modelo simples atribuía aos jornais um efeito que era da rádio: a rádio é uma variável de confusão, a mesma ideia do paradoxo de Simpson (M6, secção 7). James et al. (2023, sec. 3.2) discutem este exemplo.",
    },
    { t: "h3", text: "5. Bootstrap" },
    { t: "p", text: "Intervalos de 95% (2000 reamostragens, `default_rng(0)`):" },
    {
      t: "table",
      head: ["Coeficiente", "Estimativa", "Intervalo de 95%"],
      rows: [
        ["b₀", "2,9389", "2,2661 a 3,5818"],
        ["TV", "0,0458", "0,0419 a 0,0494"],
        ["Rádio", "0,1885", "0,1671 a 0,2091"],
        ["Jornais", "−0,0010", "−0,0128 a 0,0122"],
      ],
    },
    { t: "p", text: "TV e rádio têm efeitos claramente positivos; o intervalo dos jornais está centrado no zero." },
    { t: "h3", text: "6. Recomendação" },
    {
      t: "p",
      text: "Exemplo: \"Nos 200 mercados, a TV e a rádio estão claramente associadas a mais vendas; os jornais não, depois de se ter em conta a rádio. Por cada 1000 dólares, a rádio está associada a cerca de 190 unidades a mais e a TV a cerca de 46. Recomendo testar a passagem de parte do orçamento de jornais para rádio. Duas cautelas: os orçamentos não foram sorteados, por isso isto mostra associação e não causa, e o ideal é confirmar com uma experiência em alguns mercados; e o modelo é linear e só vale dentro dos orçamentos observados.\"",
    },
    {
      t: "p",
      text: "A comparação 190 contra 46 não quer dizer que a rádio seja quatro vezes melhor em qualquer escala: os orçamentos de rádio observados são muito menores (até 50 mil) do que os de TV (até 300 mil), e o efeito pode não se manter muito acima disso.",
    },
  ],

  notebook: {
    filename: "F1 — mini-projeto",
    cells: [
      {
        type: "md",
        source:
          "# Título\n\n**Objetivo:** \n\nMini-projeto da Fase 1: uma regressão linear programada de raiz, com os dados de publicidade e vendas de 200 mercados (James, Witten, Hastie, Tibshirani & Taylor, 2023, caps. 2 e 3).\n\n**Regra do projeto:** os ajustes fazem-se com NumPy, não com o scikit-learn. No fim, pode usar o `LinearRegression` do scikit-learn só para confirmar.\n\nAntes de entregar: Ambiente de execução → Executar tudo, e confirmar que corre de cima a baixo sem erros.",
      },
      { type: "md", source: "## Os dados" },
      { type: "code", source: LOAD + "\n" },
      {
        type: "md",
        source:
          "## Funções reutilizáveis\n\n`eqm(X, y, beta)`, `descida_gradiente(X, y, eta, passos)` (que devolve os coeficientes e a lista das perdas) e `padronizar(X)`.",
      },
      { type: "code", source: FUNCS_STUB },
      {
        type: "md",
        source:
          "## As seis perguntas\n\nCada pergunta tem de ser respondida com código, os números pedidos e uma resposta de 2 a 4 frases. As perguntas 1, 3 e 5 pedem também um gráfico.\n\n### 1. Explorar (M3 e M6)\n\n" + Q1,
      },
      { type: "code", source: "" },
      { type: "md", source: "**Resposta:** " },
      {
        type: "md",
        source:
          "### 2. Mínimos quadrados com álgebra linear (M4)\n\n" + Q2.replace(":\n- ", ":\n\n- "),
      },
      { type: "code", source: "" },
      { type: "md", source: "**Resposta:** " },
      {
        type: "md",
        source:
          "### 3. Descida do gradiente (M5)\n\n" + Q3.replace("EQM.\n- ", "EQM.\n\n- "),
      },
      { type: "code", source: "" },
      { type: "md", source: "**Resposta:** " },
      { type: "md", source: "### 4. Regressão múltipla (M4 e M5)\n\n" + Q4 },
      { type: "code", source: "" },
      { type: "md", source: "**Resposta:** " },
      { type: "md", source: "### 5. Incerteza (M6)\n\n" + Q5 },
      { type: "code", source: "" },
      { type: "md", source: "**Resposta:** " },
      { type: "md", source: "### 6. Recomendação\n\n" + Q6 },
      { type: "md", source: "**Recomendação à direção de marketing:** " },
      { type: "md", source: "## Conclusões\n\n**As três descobertas principais**\n\n1. \n2. \n3. " },
    ],
  },
};
