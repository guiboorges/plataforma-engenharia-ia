import type { PhaseClosing } from "../types";

// Fecho da Fase 0: transcrição de fase-00-exame-e-mini-projeto/ (01-exame.md, 02-mini-projeto.md, 03-gabarito.md),
// versão de 9 de outubro de 2026. Respostas, critérios e valores de referência do gabarito.
// O código do Grupo III e os valores do mini-projeto foram corridos com Python 3.13, NumPy 2.5 e pandas 3.0.

const PEDIDOS = `PEDIDOS = """data,canal,categoria,tempo_resposta_h,resolvido
2026-09-01,Email,Encomendas,5.0,sim
2026-09-01,chat,Encomendas,0.5,sim
2026-09-02,Telefone,Devoluções,1.0,sim
2026-09-02,Email,Devoluções,9.5,não
2026-09-03, Chat,Produto,0.8,sim
2026-09-03,Email,Produto,,sim
2026-09-04,Telefone,Encomendas,1.5,não
2026-09-04,Chat,Devoluções,1.2,sim
2026-09-05,Email,Encomendas,6.5,sim
2026-09-05,email,Produto,4.0,não
2026-09-06,Chat,Produto,0.6,sim
2026-09-06,Telefone,Devoluções,2.0,sim
"""`;

const G3_SOLUTION = `import io
import pandas as pd
import matplotlib.pyplot as plt

p = pd.read_csv(io.StringIO(PEDIDOS))
print(p.shape, p.isna().sum().to_dict())
# (12, 5) {'data': 0, 'canal': 0, 'categoria': 0, 'tempo_resposta_h': 1, 'resolvido': 0}
p["canal"] = p["canal"].str.strip().str.title()     # 'chat', ' Chat', 'email' → Chat, Email
print(p["canal"].value_counts().to_dict())          # {'Email': 5, 'Chat': 4, 'Telefone': 3}

# (b) só este cálculo precisa de ignorar o pedido sem tempo
tempos = (p.dropna(subset=["tempo_resposta_h"])
           .groupby("canal")["tempo_resposta_h"].mean().round(2).sort_values())
print(tempos)          # Chat 0.78 · Telefone 1.50 · Email 6.25

# (c) todos os pedidos contam
p["resolvido"] = p["resolvido"] == "sim"
print((p.groupby("canal")["resolvido"].mean() * 100).round(1).sort_values(ascending=False))
# Chat 100.0 · Telefone 66.7 · Email 60.0

# (d)
fig, ax = plt.subplots(figsize=(6, 3))
ax.barh(tempos.index[::-1], tempos.values[::-1])
ax.set_title("O chat responde mais depressa")
ax.set_xlabel("Tempo médio de resposta (horas)")
fig.tight_layout()`;

const G3_OUTPUT = `(12, 5) {'data': 0, 'canal': 0, 'categoria': 0, 'tempo_resposta_h': 1, 'resolvido': 0}
{'Email': 5, 'Chat': 4, 'Telefone': 3}
canal
Chat        0.78
Telefone    1.50
Email       6.25
Name: tempo_resposta_h, dtype: float64
canal
Chat        100.0
Telefone     66.7
Email        60.0
Name: resolvido, dtype: float64`;

const LOAD = `import pandas as pd
import matplotlib.pyplot as plt

pg = pd.read_csv("https://raw.githubusercontent.com/mwaskom/seaborn-data/master/penguins.csv")`;

const BILL = `print(round(pg["bill_length_mm"].corr(pg["bill_depth_mm"]), 2))     # -0.24
for especie, grupo in pg.groupby("species"):
    print(especie, round(grupo["bill_length_mm"].corr(grupo["bill_depth_mm"]), 2))
# Adelie 0.39 · Chinstrap 0.65 · Gentoo 0.64

fig, ax = plt.subplots(figsize=(7, 5))
for especie, grupo in pg.groupby("species"):
    ax.scatter(grupo["bill_length_mm"], grupo["bill_depth_mm"], label=especie, alpha=0.7)
ax.set_title("Dentro de cada espécie, bicos mais compridos são mais profundos")
ax.set_xlabel("Comprimento do bico (mm)")
ax.set_ylabel("Profundidade do bico (mm)")
ax.legend()`;

const BILL_OUTPUT = `-0.24
Adelie 0.39
Chinstrap 0.65
Gentoo 0.64`;

export const F0: PhaseClosing = {
  phase: "F0",
  source: "curso-engenharia-ia/fase-00-exame-e-mini-projeto",
  intro:
    "A Fase 0 fecha com uma semana de avaliação: um exame sobre os três módulos e um mini-projeto com dados reais. Passa-se à Fase 1 com **14 ou mais valores no exame e 12 ou mais no mini-projeto**.",
  passRule: { exam: 14, project: 12 },
  sessions: [
    { label: "Sessão 1", what: "Rever as três apostilas e refazer as perguntas falhadas nas provas dos módulos", time: "1h" },
    { label: "Sessão 2", what: "Fazer o exame, cronometrado e sem consulta (ver as regras abaixo)", time: "1h30" },
    { label: "Sessões 3 e 4", what: "Fazer o mini-projeto (`02-mini-projeto.md`)", time: "3h a 4h" },
  ],
  retakeNote:
    "Se o exame ficar abaixo de 14: rever as secções indicadas no gabarito durante uma semana e repetir o exame. O mini-projeto pode ser melhorado e entregue de novo as vezes que for preciso.",
  portfolioNote: "O mini-projeto é a primeira peça do portfólio. Vale a pena publicá-lo no GitHub quando chegar a Fase 4.",
  examRules:
    "**Duração:** 90 minutos. **Sem consulta e sem correr código** nos Grupos I e II; no Grupo III pode usar o Colab, mas não a internet nem assistentes de IA. Cotação total: 20 valores; aprovação com 14.",

  exam: {
    minutes: 90,
    total: 20,
    pass: 14,
    groups: [
      {
        title: "Grupo I — Escolha múltipla (10 valores)",
        note: "Uma só resposta certa por pergunta. 1 valor cada.",
        questions: [
          {
            kind: "mcq", id: "q1", num: 1, section: "M1", points: 1,
            q: "Na definição de machine learning de Mitchell (1997), aplicada a um filtro de spam, o que é o P?",
            options: [
              "Os emails marcados como spam pelos utilizadores.",
              "A tarefa de classificar emails.",
              "A percentagem de emails bem classificados.",
              "O programa que filtra os emails.",
            ],
            answer: 2,
          },
          {
            kind: "mcq", id: "q2", num: 2, section: "M1", points: 1,
            q: "Qual destes problemas **não** é de aprendizagem supervisionada?",
            options: [
              "Prever o preço de uma casa a partir de vendas anteriores.",
              "Agrupar clientes por hábitos de compra, sem categorias definidas.",
              "Detetar fraude com um histórico de transações marcadas.",
              "Classificar emails como spam com exemplos marcados.",
            ],
            answer: 1,
          },
          {
            kind: "mcq", id: "q3", num: 3, section: "M1", points: 1,
            q: "Em que década começou o primeiro \"inverno da IA\"?",
            options: ["Anos 50", "Anos 70", "Anos 90", "Anos 2000"],
            answer: 1,
          },
          {
            kind: "mcq", id: "q4", num: 4, section: "M1", points: 1,
            q: "Em que ano foi publicado o artigo que apresentou o Transformer?",
            options: ["1986", "2012", "2017", "2022"],
            answer: 2,
          },
          {
            kind: "mcq", id: "q5", num: 5, section: "M2", points: 1,
            q: "O que imprime este código?",
            context: [{ t: "code", code: "x = [3, 1, 2]\nx.sort()\nprint(x[0])" }],
            options: ["`3`", "`1`", "`[1, 2, 3]`", "`None`"],
            answer: 1,
          },
          {
            kind: "mcq", id: "q6", num: 6, section: "M2", points: 1,
            q: "O que devolve `{\"a\": 1, \"b\": 2}.get(\"c\")`?",
            options: ["`None`", "`0`", "`KeyError`", "`\"c\"`"],
            answer: 0,
          },
          {
            kind: "mcq", id: "q7", num: 7, section: "M2", points: 1,
            q: "Quanto vale `len({1, 1, 2, 3})`?",
            options: ["4", "2", "1", "3"],
            answer: 3,
          },
          {
            kind: "mcq", id: "q8", num: 8, section: "M3", points: 1,
            q: "O que dá `np.arange(6).reshape(2, 3).sum(axis=1)`?",
            options: ["`[3 5 7]`", "`[ 3 12]`", "`15`", "`[0 1 2]`"],
            answer: 1,
          },
          {
            kind: "mcq", id: "q9", num: 9, section: "M3", points: 1,
            q: "Que método do pandas passa uma tabela do formato largo para o formato longo?",
            options: ["`pivot_table`", "`merge`", "`groupby`", "`melt`"],
            answer: 3,
          },
          {
            kind: "mcq", id: "q10", num: 10, section: "M3", points: 1,
            q: "Para comparar as vendas totais de cinco lojas, o gráfico mais adequado é:",
            options: [
              "Barras ordenadas pelo valor, a começar no zero.",
              "Linha, com as lojas no eixo horizontal.",
              "Histograma.",
              "Barras em 3D por ordem alfabética.",
            ],
            answer: 0,
          },
        ],
      },
      {
        title: "Grupo II — Resposta curta (6 valores)",
        note: "2 valores cada, 3 a 6 linhas por resposta.",
        questions: [
          {
            kind: "open", id: "q11", num: 11, section: "M1", points: 2, rows: 6,
            q: "Explique a diferença entre resolver um problema com regras escritas à mão e com aprendizagem a partir de dados. Dê um exemplo em que as regras são a melhor escolha e outro em que o machine learning é melhor.",
            criteria: [
              { id: "c1", text: "Diferença", points: 1 },
              { id: "c2", text: "Exemplo adequado em que as regras são a melhor escolha", points: 0.5 },
              { id: "c3", text: "Exemplo adequado em que o machine learning é melhor", points: 0.5 },
            ],
            model:
              "Com regras, uma pessoa decide e escreve cada passo; com ML, dão-se exemplos com respostas certas e o algoritmo encontra o padrão. Regras: validar um NIF ou calcular o IVA, problemas exatos, estáveis e auditáveis. ML: filtrar spam ou prever vendas, onde os padrões são muitos, mudam e ninguém os consegue escrever todos.",
          },
          {
            kind: "open", id: "q12", num: 12, section: "M2", points: 2, rows: 6,
            q: "Porque é que `b = a` não copia uma lista? Acontece o mesmo com um DataFrame? Como se faz uma cópia verdadeira em cada caso?",
            criteria: [
              { id: "c1", text: "Explicação", points: 1 },
              { id: "c2", text: "DataFrame e cópias certas", points: 1 },
            ],
            model:
              "`b = a` dá outro nome ao mesmo objeto; alterar um altera o outro. Com um DataFrame acontece o mesmo. Cópias verdadeiras: `b = a.copy()` na lista e `df2 = df.copy()` no DataFrame.",
          },
          {
            kind: "open", id: "q13", num: 13, section: "M3", points: 2, rows: 6,
            q: "Uma tabela de 100 encomendas foi juntada com `merge` a uma tabela de clientes, e o resultado ficou com 130 linhas. O que aconteceu, como se confirma e como se resolve?",
            criteria: [
              { id: "c1", text: "Causa", points: 1 },
              { id: "c2", text: "Verificação e solução", points: 1 },
            ],
            model:
              "A tabela de clientes tem chaves repetidas (o mesmo cliente em mais de uma linha), e cada encomenda foi juntada a todas as linhas desse cliente. Confirma-se com `clientes[\"id\"].duplicated().sum()`. Resolve-se removendo ou consolidando os duplicados antes do `merge`; `merge(..., validate=\"many_to_one\")` faz o pandas avisar com um erro.",
          },
        ],
      },
      {
        title: "Grupo III — Programação e análise (4 valores)",
        questions: [
          {
            kind: "open", id: "q14", num: 14, section: "M3", points: 4, rows: 18,
            q: "Pedidos de apoio ao cliente de uma loja online:",
            context: [
              { t: "code", code: PEDIDOS },
              {
                t: "p",
                text: "(a) Carregue os dados, identifique os problemas e limpe a coluna `canal`. (b) Calcule o tempo médio de resposta por canal, ordenado do mais rápido para o mais lento, ignorando apenas o pedido sem tempo. (c) Calcule a percentagem de pedidos resolvidos por canal, usando todos os pedidos. (d) Faça um gráfico com a resposta à alínea (b) e escreva, em duas frases, a recomendação que faria à equipa.",
              },
            ],
            criteria: [
              { id: "c1", text: "Problemas identificados (canal inconsistente, valor em falta) e canal limpo", points: 1 },
              { id: "c2", text: "Tempo médio por canal certo, retirando só o pedido sem tempo", points: 1 },
              { id: "c3", text: "Percentagem de resolvidos por canal certa, com todos os pedidos", points: 1 },
              { id: "c4", text: "Gráfico adequado e recomendação sustentada, com a ressalva do tamanho da amostra", points: 1 },
            ],
            model:
              "O chat responde em menos de uma hora e resolveu todos os pedidos, enquanto o email demora mais de seis horas e resolve 60%. Vale a pena encaminhar mais clientes para o chat e rever o processo do email; com 12 pedidos, convinha confirmar com mais dados antes de mudar tudo.",
            modelBlocks: [{ t: "code", title: "Solução do gabarito", code: G3_SOLUTION, output: G3_OUTPUT }],
          },
        ],
      },
    ],
  },

  examReview: [
    { questions: [1, 2, 3, 4, 11], module: "M1" },
    { questions: [5, 6, 7, 12], module: "M2" },
    { questions: [8, 9, 10, 13, 14], module: "M3" },
  ],

  project: {
    title: "Análise exploratória dos pinguins de Palmer",
    intro: [
      {
        t: "p",
        text: "Uma análise exploratória completa, num notebook do Colab, com dados científicos reais: medidas de 344 pinguins de três espécies, recolhidas entre 2007 e 2009 na estação Palmer, na Antártida, por Kristen Gorman (Gorman, Williams & Fraser, 2014) e publicadas como conjunto de dados aberto por Horst, Hill & Gorman (2020). Tempo previsto: 3 a 4 horas.",
      },
      { t: "h3", text: "Os dados" },
      { t: "code", code: LOAD },
      {
        t: "table",
        head: ["Coluna", "O que é"],
        rows: [
          ["`species`", "Espécie: Adelie, Chinstrap ou Gentoo"],
          ["`island`", "Ilha onde foi medido: Biscoe, Dream ou Torgersen"],
          ["`bill_length_mm`", "Comprimento do bico (mm)"],
          ["`bill_depth_mm`", "Profundidade, ou altura, do bico (mm)"],
          ["`flipper_length_mm`", "Comprimento da barbatana (mm)"],
          ["`body_mass_g`", "Massa corporal (g)"],
          ["`sex`", "Sexo"],
        ],
      },
      { t: "h3", text: "As cinco perguntas" },
      { t: "p", text: "Cada pergunta tem de ser respondida com código, **um gráfico** e uma resposta de 2 a 3 frases, com os números que a sustentam." },
    ],
    questions: [
      {
        n: 1,
        title: "Quem está nos dados?",
        text: "Quantos pinguins há de cada espécie, em que ilhas vivem e que dados faltam? Decida o que fazer com as linhas incompletas e justifique.",
      },
      { n: 2, title: "Como se distribui a massa corporal?", text: "É diferente entre espécies? Compare médias e medianas." },
      { n: 3, title: "Machos e fêmeas são diferentes?", text: "Dentro de cada espécie, que diferença de massa há entre sexos?" },
      {
        n: 4,
        title: "Barbatanas maiores vêm com mais massa?",
        text: "Mostre a relação e calcule a correlação com `pg[\"flipper_length_mm\"].corr(pg[\"body_mass_g\"])`.",
      },
      {
        n: 5,
        title: "O bico engana.",
        text: "Calcule a correlação entre comprimento e profundidade do bico em todos os pinguins juntos e depois dentro de cada espécie. O que acontece, e porquê? Mostre-o num gráfico de dispersão com uma cor por espécie.",
      },
    ],
    questionsNote: "A pergunta 5 é a mais importante do projeto: o resultado surpreende e é uma lição que vai voltar no M6 e na Fase 2.",
    deliverables: [
      { t: "p", text: "Um notebook que corre de cima a baixo sem erros (Ambiente de execução → Executar tudo), organizado assim:" },
      {
        t: "list",
        ordered: true,
        items: [
          "**Título e objetivo**, numa célula de texto.",
          "**Carregamento e inspeção**: forma, tipos, valores em falta.",
          "**Limpeza**, com cada decisão explicada.",
          "**As cinco perguntas**, cada uma com código, gráfico e resposta.",
          "**Conclusões**: as três descobertas principais e duas limitações dos dados ou da análise.",
        ],
      },
    ],
    rubric: [
      { id: "inspecao", text: "Inspeção e limpeza", detail: "Forma, tipos e valores em falta verificados; decisões de limpeza justificadas", points: 3 },
      { id: "respostas", text: "Respostas certas", detail: "Os números de cada pergunta estão certos e respondem ao que foi perguntado", points: 5 },
      { id: "graficos", text: "Gráficos", detail: "Tipo adequado à pergunta, título que diz o que se vê, eixos com unidades, sem distrações", points: 4 },
      { id: "p5", text: "Pergunta 5", detail: "Identifica a inversão da correlação e explica-a pela espécie", points: 3 },
      { id: "codigo", text: "Código", detail: "Corre de cima a baixo, sem repetições desnecessárias, com nomes claros", points: 3 },
      { id: "conclusoes", text: "Conclusões", detail: "Descobertas sustentadas por números; limitações pertinentes", points: 2 },
    ],
    references: [
      {
        text: "Gorman, K. B., Williams, T. D. & Fraser, W. R. (2014). Ecological sexual dimorphism and environmental variability within a community of Antarctic penguins (genus *Pygoscelis*). *PLoS ONE*, 9(3), e90081.",
      },
      {
        text: "Horst, A. M., Hill, A. P. & Gorman, K. B. (2020). palmerpenguins: Palmer Archipelago (Antarctica) penguin data. R package, versão 0.1.0.",
        href: "https://allisonhorst.github.io/palmerpenguins/",
      },
    ],
  },

  projectKey: [
    { t: "p", text: "Não há uma única resposta certa para a forma, mas os números devem coincidir com estes." },
    { t: "h3", text: "1. Quem está nos dados" },
    {
      t: "p",
      text: "344 pinguins: 152 Adelie, 124 Gentoo e 68 Chinstrap. Os Gentoo só aparecem em Biscoe e os Chinstrap só em Dream; os Adelie estão nas três ilhas (44, 56 e 52). Faltam 2 valores em cada medida do corpo (os mesmos 2 pinguins) e 11 no sexo. Decisão razoável: retirar os 2 pinguins sem medidas (ficam 342) e retirar os sem sexo só na pergunta 3.",
    },
    { t: "h3", text: "2. Massa corporal" },
    {
      t: "table",
      head: ["Espécie", "Média (g)", "Mediana (g)", "Desvio padrão (g)"],
      rows: [
        ["Gentoo", "5076", "5000", "504"],
        ["Chinstrap", "3733", "3700", "384"],
        ["Adelie", "3701", "3700", "459"],
      ],
    },
    {
      t: "p",
      text: "Os Gentoo são cerca de 1,3 kg mais pesados; Adelie e Chinstrap têm massas quase iguais. Gráfico adequado: histogramas sobrepostos por espécie, ou um boxplot.",
    },
    { t: "h3", text: "3. Machos e fêmeas" },
    {
      t: "p",
      text: "Massa média em gramas: Adelie 3369 (f) e 4043 (m); Chinstrap 3527 e 3939; Gentoo 4680 e 5485. Os machos são mais pesados nas três espécies, entre cerca de 400 g e 800 g. Gráfico adequado: barras agrupadas por espécie.",
    },
    { t: "h3", text: "4. Barbatana e massa" },
    { t: "p", text: "Correlação de 0,87: relação forte e positiva, visível num gráfico de dispersão." },
    { t: "h3", text: "5. O bico engana" },
    {
      t: "p",
      text: "Com todos os pinguins juntos, a correlação entre comprimento e profundidade do bico é **−0,24**: parece que bicos mais compridos são menos profundos. Dentro de cada espécie é **positiva**: 0,39 nos Adelie, 0,65 nos Chinstrap e 0,64 nos Gentoo. A inversão acontece porque os Gentoo têm bicos compridos e pouco profundos (47,5 mm por 15,0 mm, em média) e os Adelie bicos curtos e profundos (38,8 mm por 18,3 mm): misturar grupos diferentes cria uma tendência que não existe em nenhum deles. Este fenómeno chama-se **paradoxo de Simpson** e é a razão para olhar sempre para os subgrupos antes de tirar conclusões.",
    },
    { t: "code", code: BILL, output: BILL_OUTPUT },
    {
      t: "callout",
      tone: "key",
      title: "Limitações que vale a pena referir",
      text: "Os dados são de três ilhas e três anos, por isso não representam todas as colónias; correlação não é causalidade; as espécies não estão repartidas por igual pelas ilhas, por isso espécie e ilha confundem-se.",
    },
  ],

  notebook: {
    filename: "F0 — mini-projeto",
    cells: [
      {
        type: "md",
        source:
          "# Título\n\n**Objetivo:** \n\nMini-projeto da Fase 0: análise exploratória das medidas de 344 pinguins de três espécies da estação Palmer, na Antártida (Gorman, Williams & Fraser, 2014; Horst, Hill & Gorman, 2020).\n\nAntes de entregar: Ambiente de execução → Executar tudo, e confirmar que corre de cima a baixo sem erros.",
      },
      { type: "md", source: "## Carregamento e inspeção\n\nForma, tipos, valores em falta." },
      { type: "code", source: LOAD + "\n" },
      { type: "code", source: "# forma, tipos e valores em falta\n" },
      { type: "md", source: "## Limpeza\n\nCada decisão, explicada." },
      { type: "code", source: "" },
      {
        type: "md",
        source:
          "## As cinco perguntas\n\nCada pergunta tem de ser respondida com código, **um gráfico** e uma resposta de 2 a 3 frases, com os números que a sustentam.\n\n### 1. Quem está nos dados?\n\nQuantos pinguins há de cada espécie, em que ilhas vivem e que dados faltam? Decida o que fazer com as linhas incompletas e justifique.",
      },
      { type: "code", source: "" },
      { type: "md", source: "**Resposta:** " },
      { type: "md", source: "### 2. Como se distribui a massa corporal?\n\nÉ diferente entre espécies? Compare médias e medianas." },
      { type: "code", source: "" },
      { type: "md", source: "**Resposta:** " },
      { type: "md", source: "### 3. Machos e fêmeas são diferentes?\n\nDentro de cada espécie, que diferença de massa há entre sexos?" },
      { type: "code", source: "" },
      { type: "md", source: "**Resposta:** " },
      {
        type: "md",
        source: '### 4. Barbatanas maiores vêm com mais massa?\n\nMostre a relação e calcule a correlação com `pg["flipper_length_mm"].corr(pg["body_mass_g"])`.',
      },
      { type: "code", source: "" },
      { type: "md", source: "**Resposta:** " },
      {
        type: "md",
        source:
          "### 5. O bico engana.\n\nCalcule a correlação entre comprimento e profundidade do bico em todos os pinguins juntos e depois dentro de cada espécie. O que acontece, e porquê? Mostre-o num gráfico de dispersão com uma cor por espécie.",
      },
      { type: "code", source: "" },
      { type: "md", source: "**Resposta:** " },
      {
        type: "md",
        source: "## Conclusões\n\n**Três descobertas principais**\n\n1. \n2. \n3. \n\n**Duas limitações dos dados ou da análise**\n\n1. \n2. ",
      },
    ],
  },
};
