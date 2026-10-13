import type { ModuleContent } from "../types";

// Módulo 1 — Introdução à IA e à engenharia de IA.
// Fonte: curso-engenharia-ia/modulo-01-introducao-ia (01-aula, 02-apostila, 03-exercicios, 04-prova, 05-gabarito).
// Os diagramas da aula são widgets interativos (src/components/widgets). As verificações rápidas, os cartões
// de revisão e o banco do simulado foram escritos pela plataforma a partir da aula, com o código verificado no scikit-learn.

const SPAM_RULES = `def e_spam(mensagem):
    palavras_suspeitas = ["grátis", "prémio", "clique aqui", "urgente"]
    texto = mensagem.lower()
    return any(p in texto for p in palavras_suspeitas)

print(e_spam("Ganhou um PRÉMIO! Clique aqui"))      # True  (certo)
print(e_spam("Reunião amanhã às 10h"))                # False (certo)
print(e_spam("Tenho o prémio do sorteio do clube para lhe entregar"))  # True  (errado)
print(e_spam("Ganhe d1nheiro f@cil"))                 # False (errado)`;

const SPAM_NB = `from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB

mensagens = [
    "ganhe um prémio grátis agora", "clique aqui para receber dinheiro",
    "oferta urgente só hoje", "parabéns, foi selecionado para um prémio",
    "reunião amanhã às 10h", "envio o relatório em anexo",
    "jantar no sábado?", "a fatura de outubro está paga",
]
rotulos = [1, 1, 1, 1, 0, 0, 0, 0]   # 1 = spam, 0 = normal

vetorizador = CountVectorizer()             # transforma texto em contagens de palavras
X = vetorizador.fit_transform(mensagens)
modelo = MultinomialNB().fit(X, rotulos)    # o treino: aprende com os exemplos

testes = ["prémio grátis para si", "relatório da reunião"]
print(modelo.predict(vetorizador.transform(testes)))   # [1 0]`;

export const M1: ModuleContent = {
  id: "M1",
  duration: "2 semanas, cerca de 6 horas",
  intro:
    "No fim deste módulo deve saber distinguir IA, machine learning, deep learning e IA generativa, contar a história da área pelos seus marcos, reconhecer os tipos de aprendizagem e descrever o trabalho de um engenheiro de IA.",
  outcomes: [
    "Distinguir IA, machine learning, deep learning e IA generativa",
    "Contar a história da área pelos seus marcos e pelos dois invernos",
    "Reconhecer os quatro tipos de aprendizagem e como um LLM combina três deles",
    "Descrever o trabalho de um engenheiro de IA e o seu ciclo de trabalho",
    "Correr código Python no Google Colab",
  ],
  goldenRule:
    "Tentar cada exercício antes de abrir o gabarito. Usar um assistente de IA para explicar um erro é válido; pedir-lhe a resposta não é.",
  sessions: [
    {
      id: "w1s1",
      label: "Semana 1 · sessão 1",
      minutes: 90,
      tasks: [
        { id: "t1", text: "Ler as secções 1 a 3 da aula", link: { kind: "section", id: "s1" } },
        {
          id: "t2",
          text: "Ler Turing (1950), secções 1 e 7",
          link: { kind: "url", href: "https://doi.org/10.1093/mind/LIX.236.433" },
        },
      ],
    },
    {
      id: "w1s2",
      label: "Semana 1 · sessão 2",
      minutes: 90,
      tasks: [
        { id: "t1", text: "Ler as secções 4 e 5", link: { kind: "section", id: "s4" } },
        { id: "t2", text: "Correr os dois exemplos de código no Colab", link: { kind: "section", id: "s7" } },
      ],
    },
    {
      id: "w2s1",
      label: "Semana 2 · sessão 1",
      minutes: 90,
      tasks: [
        { id: "t1", text: "Ler as secções 6 e 7", link: { kind: "section", id: "s6" } },
        { id: "t2", text: "Fazer os exercícios 1 a 8", link: { kind: "tab", tab: "exercicios" } },
      ],
    },
    {
      id: "w2s2",
      label: "Semana 2 · sessão 2",
      minutes: 90,
      tasks: [
        { id: "t1", text: "Fazer os exercícios 9 a 12", link: { kind: "tab", tab: "exercicios" } },
        { id: "t2", text: "Rever a apostila", link: { kind: "tab", tab: "apostila" } },
        { id: "t3", text: "Fazer a prova, sem consulta", link: { kind: "tab", tab: "prova" } },
      ],
    },
  ],

  // ---------------------------------------------------------------- AULA
  lesson: [
    {
      id: "s1",
      num: 1,
      title: "O que é inteligência artificial",
      minutes: 20,
      blocks: [
        {
          t: "p",
          text: "Não existe uma definição única de IA. O manual de referência da área, de Russell & Norvig (2020, cap. 1), arruma as definições conhecidas segundo duas perguntas: o objetivo é *pensar* ou *agir*? E o padrão de sucesso é *imitar o ser humano* ou *ser racional*?",
        },
        { t: "widget", name: "rn-grid", caption: "As quatro abordagens à IA segundo Russell & Norvig. Toque num quadrante." },
        {
          t: "p",
          text: "O livro adota a última abordagem. Um **agente** é qualquer coisa que perceciona o ambiente através de sensores e age sobre ele através de atuadores. Um **agente racional** escolhe, em cada momento, a ação que se espera que maximize o seu desempenho, tendo em conta o que perceciona e o que sabe.",
        },
        {
          t: "p",
          text: "Exemplos de agentes, do mais simples ao mais complexo: um termóstato (sensor: temperatura; ação: ligar o aquecimento), um filtro de spam (sensor: o texto do email; ação: mover para a pasta de spam), um carro autónomo e um assistente como o Claude, que lê uma conversa e decide o que responder ou que ferramenta usar.",
        },
        { t: "widget", name: "agent-explorer", caption: "Quatro agentes, do mais simples ao mais complexo." },
        { t: "h3", text: "O jogo da imitação de Turing" },
        {
          t: "p",
          text: "Em 1950, Alan Turing publicou \"Computing Machinery and Intelligence\" na revista *Mind*. Em vez de discutir se \"as máquinas podem pensar\", uma pergunta que achava demasiado vaga, propôs um teste concreto: um interrogador conversa por texto com uma pessoa e com uma máquina, sem as ver, e tenta descobrir qual é qual. Se não conseguir distinguir de forma fiável, a máquina passa no teste.",
        },
        {
          t: "p",
          text: "O artigo é notável por duas razões. Primeiro, Turing responde antecipadamente a nove objeções à ideia de máquinas inteligentes. Segundo, na secção 7 (\"Learning Machines\") propõe que, em vez de programar uma mente adulta, se programe uma \"mente de criança\" e se a eduque. É a ideia central do machine learning, 70 anos antes dos LLMs.",
        },
        {
          t: "p",
          text: "Hoje o teste é visto como histórico e insuficiente: mede a capacidade de imitar conversa humana, não a inteligência em geral, e os LLMs atuais conversam de forma convincente sem que isso resolva a questão.",
        },
        { t: "h3", text: "IA estreita e IA geral" },
        {
          t: "p",
          text: "Todos os sistemas em uso são, em rigor, especializados: mesmo um LLM que escreve, programa e resume continua a falhar em tarefas que uma pessoa resolve facilmente. **IA geral** (em inglês, AGI) designa uma capacidade ampla e flexível comparável à humana. Não há definição consensual nem acordo sobre quando ou se será atingida.",
        },
        {
          t: "callout",
          tone: "key",
          title: "Ideia-chave",
          text: "Para um engenheiro, IA é sobretudo uma forma de construir software. Em vez de escrever todas as regras, constrói-se um sistema que aprende o comportamento a partir de dados, e esse comportamento tem de ser medido.",
        },
        {
          t: "check",
          id: "qc1",
          q: "Um filtro de spam que move um email para a pasta de spam está a usar…",
          options: ["um sensor", "um atuador", "uma medida de desempenho", "o teste de Turing"],
          answer: 1,
          explain:
            "Mover o email é a ação sobre o ambiente, logo um atuador. O texto do email que o filtro lê é o que entra pelo sensor.",
        },
      ],
    },
    {
      id: "s2",
      num: 2,
      title: "IA, machine learning, deep learning e IA generativa",
      minutes: 20,
      blocks: [
        {
          t: "p",
          text: "Os quatro termos são usados como sinónimos nas notícias, mas não o são: cada um é uma parte do anterior.",
        },
        { t: "widget", name: "ai-nesting", caption: "IA, machine learning, deep learning e IA generativa · 4 níveis" },
        {
          t: "p",
          text: "**Inteligência artificial** é o campo inteiro. Inclui sistemas sem qualquer aprendizagem, como os sistemas periciais dos anos 70 e 80 (o MYCIN, que sugeria antibióticos a partir de centenas de regras escritas por médicos) e programas de pesquisa como o Deep Blue, que venceu Kasparov no xadrez em 1997.",
        },
        {
          t: "p",
          text: "**Machine learning** (ML, aprendizagem automática) é a parte da IA em que o comportamento é aprendido a partir de dados. A definição clássica é de Tom Mitchell (1997, cap. 1): um programa aprende com a experiência **E**, numa tarefa **T** e segundo uma medida de desempenho **P**, se o seu desempenho em T, medido por P, melhora com E. Num filtro de spam, T é classificar emails, P é a percentagem de emails bem classificados e E são os emails que os utilizadores marcaram como spam (Géron, 2022, cap. 1, usa este mesmo exemplo).",
        },
        {
          t: "p",
          text: "**Deep learning** (aprendizagem profunda) é a parte do ML que usa redes neuronais com muitas camadas. A diferença prática: no ML clássico, uma pessoa escolhe as características a dar ao modelo (por exemplo, \"número de palavras em maiúsculas\"); no deep learning, a rede aprende sozinha as representações úteis a partir dos dados brutos, como os píxeis de uma imagem (LeCun, Bengio & Hinton, 2015).",
        },
        {
          t: "p",
          text: "**IA generativa** designa os modelos que criam conteúdo novo: texto, imagem, áudio, vídeo, código. Os atuais assentam quase todos em deep learning, sobretudo Transformers e modelos de difusão. Os **LLMs** (*large language models*) são modelos generativos de texto treinados com enormes quantidades de dados. Como servem de base a muitas aplicações diferentes, Bommasani et al. (2021) chamaram-lhes **modelos de fundação**.",
        },
        {
          t: "table",
          head: ["Tipo", "Exemplo", "Como sabe o que fazer"],
          rows: [
            ["IA baseada em regras", "Termóstato; sistema pericial MYCIN", "Regras escritas por pessoas"],
            ["ML clássico", "Previsão de vendas com regressão; deteção de fraude com árvores de decisão", "Padrões estatísticos aprendidos de dados em tabela"],
            ["Deep learning", "Desbloqueio facial do telemóvel; tradução automática", "Representações aprendidas por redes neuronais profundas"],
            ["IA generativa", "Claude, ChatGPT, geradores de imagem", "Modelos treinados para produzir conteúdo novo"],
          ],
        },
        {
          t: "check",
          id: "qc2",
          q: "Na definição de Mitchell aplicada a um filtro de spam, o que é **P**?",
          options: [
            "Classificar emails",
            "A percentagem de emails bem classificados",
            "Os emails marcados como spam pelos utilizadores",
            "O número de camadas da rede",
          ],
          answer: 1,
          explain: "T é a tarefa (classificar), P é a medida de desempenho (a percentagem de acertos) e E é a experiência (os emails marcados).",
        },
      ],
    },
    {
      id: "s3",
      num: 3,
      title: "Breve história da IA",
      minutes: 25,
      blocks: [
        {
          t: "p",
          text: "A IA não cresceu em linha reta. Avançou por vagas de entusiasmo, e duas delas terminaram em \"invernos\": anos de cortes no financiamento depois de promessas que a tecnologia não cumpriu.",
        },
        { t: "widget", name: "ai-timeline", caption: "História da IA · 11 marcos e 2 invernos, 1943 a 2024" },
        {
          t: "table",
          head: ["Época", "O que aconteceu", "Porque acabou ou mudou"],
          rows: [
            [
              "**Fundação** (1943–1973)",
              "McCulloch & Pitts descrevem um neurónio artificial (1943); Turing propõe o jogo da imitação (1950); a proposta de Dartmouth (1955), de McCarthy, Minsky, Rochester e Shannon, cria o nome \"inteligência artificial\" e a conferência de 1956 lança a área; Rosenblatt cria o perceptrão (1958); o ELIZA (1966) imita um terapeuta com regras simples",
              "As promessas, como tradução automática perfeita em poucos anos, não se cumpriram; Minsky & Papert (1969) mostraram que um perceptrão de uma camada nem a função XOR consegue aprender",
            ],
            [
              "**1.º inverno** (1974–1980)",
              "O relatório Lighthill (1973) critica a falta de resultados e o Reino Unido corta o financiamento; nos EUA, a DARPA também reduz",
              "A área volta a crescer com os sistemas periciais",
            ],
            [
              "**Sistemas periciais** (1980–1987)",
              "Regras escritas por especialistas chegam às empresas (o XCON da DEC configurava encomendas de computadores); em 1986, Rumelhart, Hinton & Williams popularizam a retropropagação, que permite treinar redes com várias camadas",
              "Sistemas caros de manter e frágeis fora do seu domínio; o mercado das máquinas LISP colapsa em 1987",
            ],
            [
              "**2.º inverno** (1987–1993)",
              "Cortes de investimento; \"IA\" passa a ser uma palavra evitada nas propostas",
              "A área renasce com métodos estatísticos",
            ],
            [
              "**ML estatístico** (1993–2011)",
              "Aprendizagem a partir de dados e probabilidade: SVM, random forests; a LeNet (1998) lê cheques bancários; o Deep Blue vence Kasparov (1997) com pesquisa massiva, não com aprendizagem",
              "GPUs e grandes conjuntos de dados tornam viáveis redes muito maiores",
            ],
            [
              "**Deep learning** (2012–2017)",
              "A AlexNet vence o desafio ImageNet de 2012 com 15,3% de erro, contra 26,2% do segundo classificado; o AlphaGo vence Lee Sedol no Go por 4–1 (2016)",
              "O Transformer muda a forma de processar texto",
            ],
            [
              "**Modelos de fundação** (2017–hoje)",
              "Transformer (2017), BERT e GPT (2018), GPT-3 (2020); o ChatGPT (novembro de 2022) leva a IA generativa ao grande público; seguem-se o Claude e o GPT-4 (2023) e os modelos de raciocínio (2024–2025)",
              "Em curso",
            ],
          ],
        },
        {
          t: "p",
          text: "O peso da área ficou claro em 2024: o Nobel da Física foi para John Hopfield e Geoffrey Hinton, pelo trabalho em redes neuronais, e o da Química foi partilhado por Demis Hassabis e John Jumper (AlphaFold, que prevê a estrutura de proteínas) com David Baker.",
        },
        {
          t: "callout",
          tone: "lesson",
          title: "Lição para um engenheiro",
          text: "As duas quedas vieram de promessas maiores do que a tecnologia entregava. Medir com dados o que um sistema faz de facto é a melhor defesa contra o entusiasmo; o tema volta no M23, sobre avaliação.",
        },
        {
          t: "check",
          id: "qc3",
          q: "O Deep Blue venceu Kasparov em 1997. Como?",
          options: [
            "Com uma rede neuronal profunda",
            "Com pesquisa massiva, não com aprendizagem",
            "Com aprendizagem por reforço, como o AlphaGo",
            "Com um LLM",
          ],
          answer: 1,
          explain: "O Deep Blue avaliava milhões de posições por segundo com regras e pesquisa. O AlphaGo (2016) é que combinou aprendizagem supervisionada e por reforço.",
        },
      ],
    },
    {
      id: "s4",
      num: 4,
      title: "Como uma máquina aprende: regras contra dados",
      minutes: 30,
      blocks: [
        {
          t: "p",
          text: "Na programação tradicional, uma pessoa escreve as regras e o programa aplica-as aos dados para chegar às respostas. No machine learning, dão-se ao programa dados e respostas certas, e ele descobre as regras sozinho (Chollet, 2021, cap. 1). O resultado dessa descoberta chama-se **modelo**.",
        },
        {
          t: "p",
          text: "O melhor modo de perceber a diferença é resolver o mesmo problema das duas maneiras. Os dois exemplos seguintes correm no Google Colab tal como estão (ver a [secção 7](#s7)). Também estão em `codigo/exemplos_m1.py`.",
        },
        { t: "h3", text: "Abordagem 1: regras escritas à mão" },
        { t: "code", title: "Regras escritas à mão", code: SPAM_RULES, output: "True\nFalse\nTrue\nFalse" },
        {
          t: "p",
          text: "As regras funcionam nos casos óbvios e falham nos outros. A terceira mensagem é legítima mas foi marcada como spam: um **falso positivo**. A quarta é spam e passou: um **falso negativo**. Cada nova regra cria novas exceções, e quem envia spam adapta-se mais depressa do que conseguimos escrever regras.",
        },
        { t: "h3", text: "Abordagem 2: aprender com exemplos" },
        { t: "code", title: "Aprender com exemplos (Naive Bayes)", code: SPAM_NB, output: "[1 0]" },
        {
          t: "p",
          text: "Ninguém escreveu a regra \"prémio é suspeito\". O modelo contou com que frequência cada palavra aparece em cada classe e, perante uma mensagem que nunca viu, calculou qual das classes é mais provável. Este algoritmo chama-se *Naive Bayes* e volta no M6, sobre probabilidade.",
        },
        {
          t: "p",
          text: "Oito exemplos são muito poucos; um filtro real usa milhões. Mas a lógica é a mesma, e corrigir um erro passa a ser acrescentar exemplos certos, não escrever mais regras.",
        },
        {
          t: "widget",
          name: "spam-lab",
          caption: "Laboratório: as duas abordagens lado a lado, com o mesmo cálculo do scikit-learn a correr no browser.",
        },
        { t: "h3", text: "Vocabulário essencial" },
        {
          t: "table",
          head: ["Termo", "Significado", "No exemplo"],
          rows: [
            ["Dados de treino", "Exemplos a partir dos quais o modelo aprende", "As 8 mensagens"],
            ["Rótulo", "A resposta certa de cada exemplo", "1 = spam, 0 = normal"],
            ["Característica (feature)", "Cada informação usada pelo modelo", "A contagem de cada palavra"],
            ["Treino", "O processo de ajustar o modelo aos dados", "`fit`"],
            ["Inferência ou previsão", "Usar o modelo treinado em dados novos", "`predict`"],
            ["Generalização", "Acertar em exemplos que o modelo nunca viu", "Classificar \"prémio grátis para si\""],
            ["Métrica", "O número que diz se o modelo é bom", "Percentagem de mensagens bem classificadas"],
          ],
        },
        {
          t: "p",
          text: "A generalização é o objetivo de todo o machine learning: acertar nos dados de treino é fácil, acertar nos dados novos é o que interessa. O M7 dedica-se a medir isso bem.",
        },
        {
          t: "check",
          id: "qc4",
          q: "\"Ganhe d1nheiro f@cil\" é spam e passou pelo filtro de regras. É um…",
          options: ["falso positivo", "falso negativo", "verdadeiro positivo", "verdadeiro negativo"],
          answer: 1,
          explain: "\"Negativo\" porque o filtro disse \"não é spam\"; \"falso\" porque errou. Um falso positivo é o contrário: marcar como spam uma mensagem legítima.",
        },
      ],
    },
    {
      id: "s5",
      num: 5,
      title: "Tipos de aprendizagem",
      minutes: 20,
      blocks: [
        {
          t: "p",
          text: "A forma de aprender depende do tipo de dados disponíveis. Há quatro grandes famílias, e os LLMs usam três delas.",
        },
        {
          t: "table",
          head: ["Tipo", "Com que dados aprende", "Pergunta típica", "Exemplos"],
          rows: [
            ["**Supervisionada**", "Exemplos com a resposta certa (rótulo)", "\"Isto é spam?\" · \"Quanto vamos vender?\"", "Filtro de spam, previsão de vendas, diagnóstico por imagem"],
            ["**Não supervisionada**", "Dados sem rótulos", "\"Que grupos existem nos clientes?\"", "Segmentação de clientes, deteção de transações invulgares"],
            ["**Por reforço**", "Recompensas e penalizações de um ambiente", "\"Que ação leva à maior recompensa?\"", "AlphaGo, robôs, ajuste de LLMs com feedback humano"],
            ["**Auto-supervisionada**", "Rótulos tirados dos próprios dados", "\"Qual é a palavra seguinte?\"", "Pré-treino de LLMs"],
          ],
        },
        {
          t: "p",
          text: "**Supervisionada.** É a mais usada em produção. Divide-se em dois tipos de problema: **classificação**, quando a resposta é uma categoria (spam ou não, cliente vai sair ou não), e **regressão**, quando a resposta é um número (preço, vendas, temperatura). O custo está nos rótulos: alguém tem de os produzir, muitas vezes à mão.",
        },
        {
          t: "p",
          text: "**Não supervisionada.** Procura estrutura sem que ninguém diga o que é certo: grupos parecidos (clustering), dimensões que resumem os dados, pontos que não encaixam em nenhum padrão. É tema do M10.",
        },
        {
          t: "p",
          text: "**Por reforço.** Um agente experimenta ações num ambiente e recebe recompensas; aprende a política que maximiza a recompensa acumulada. A referência clássica é Sutton & Barto (2018). O AlphaGo combinou aprendizagem supervisionada com jogos humanos e milhões de jogos contra si próprio (Silver et al., 2016).",
        },
        {
          t: "p",
          text: "**Auto-supervisionada.** Os rótulos vêm do próprio texto: esconde-se a palavra seguinte e o modelo tenta adivinhá-la. Não precisa de anotação humana, por isso pode usar quantidades enormes de texto. É assim que começa o treino de qualquer LLM.",
        },
        { t: "h3", text: "Como um LLM combina três tipos" },
        { t: "widget", name: "llm-pipeline", caption: "Os três passos de treino de um LLM. Os M17 e M18 explicam-nos em detalhe." },
        {
          t: "check",
          id: "qc5",
          q: "Prever a temperatura de amanhã a partir de anos de registos meteorológicos é…",
          options: [
            "classificação supervisionada",
            "regressão supervisionada",
            "aprendizagem não supervisionada",
            "aprendizagem por reforço",
          ],
          answer: 1,
          explain: "Há exemplos com a resposta certa (a temperatura que se registou) e a resposta é um número: regressão supervisionada.",
        },
      ],
    },
    {
      id: "s6",
      num: 6,
      title: "O que faz um engenheiro de IA",
      minutes: 20,
      blocks: [
        {
          t: "p",
          text: "Huyen (2025, cap. 1) descreve a engenharia de IA como a construção de aplicações sobre modelos de fundação já existentes. Como já não é preciso treinar um modelo de raiz para cada problema, o trabalho desloca-se do treino para a **adaptação** (prompts, RAG, fine-tuning) e, sobretudo, para a **avaliação**: saber se o sistema funciona bem o suficiente para ser usado.",
        },
        {
          t: "p",
          text: "Um aviso antigo continua válido. Sculley et al. (2015) mostraram que, num sistema real de ML, o código do modelo é uma pequena parte; o resto é recolha e verificação de dados, configuração, infraestrutura para servir o modelo e monitorização. É aí que nasce a maior parte da \"dívida técnica\".",
        },
        { t: "widget", name: "engineer-cycle", caption: "Ciclo de trabalho de um engenheiro de IA · 6 passos" },
        {
          t: "p",
          text: "O passo 4 decide tudo: um modelo que não passa nos testes do próprio caso volta ao passo 3, e o que se aprende em produção volta a alimentar os dados.",
        },
        {
          t: "table",
          head: ["Papel", "Foco principal", "Entrega típica"],
          rows: [
            ["Cientista de dados", "Responder a perguntas de negócio com dados e estatística", "Análises, relatórios, modelos de previsão"],
            ["Engenheiro de ML", "Treinar modelos e pô-los a funcionar de forma fiável", "Pipelines de treino, modelos em produção"],
            ["Engenheiro de IA", "Construir produtos sobre modelos de fundação: prompts, RAG, agentes, avaliação", "Aplicações e funcionalidades com IA"],
            ["Investigador", "Criar novos métodos e modelos", "Artigos, novos algoritmos e arquiteturas"],
          ],
        },
        {
          t: "p",
          text: "As fronteiras são difusas e, em equipas pequenas, a mesma pessoa faz quase tudo. Por isso o curso cobre o caminho inteiro: Python (Fase 0), matemática para perceber o que os modelos fazem (Fase 1), ML e deep learning (Fases 2 e 3), LLMs e avaliação (Fase 4) e produção na cloud (Fase 5).",
        },
        {
          t: "check",
          id: "qc6",
          q: "Um modelo falhou os testes do próprio caso no passo 4. Para onde volta?",
          options: [
            "Para o passo 1, definir o problema",
            "Para o passo 3, escolher e adaptar o modelo",
            "Segue para produção e corrige-se depois",
            "Para o passo 6, monitorizar",
          ],
          answer: 1,
          explain: "Volta ao passo 3: muda-se o prompt, os dados recuperados, o modelo ou o ajuste, e volta a avaliar-se.",
        },
      ],
    },
    {
      id: "s7",
      num: 7,
      title: "Ambiente de trabalho: Google Colab",
      minutes: 15,
      blocks: [
        {
          t: "p",
          text: "Até à Fase 3, todo o código corre no Google Colab: notebooks Python no browser, gratuitos, com as bibliotecas de ML já instaladas e acesso a GPU quando for preciso. Não é preciso instalar nada no computador.",
        },
        { t: "widget", name: "colab-checklist" },
        {
          t: "callout",
          tone: "info",
          title: "Dois hábitos para todo o curso",
          text: "Uma pasta no Drive por fase, e um notebook por módulo com os exercícios resolvidos. Esse arquivo vai servir de portfólio.",
        },
        {
          t: "check",
          id: "qc7",
          q: "Que atalho corre a célula de código atual no Colab?",
          options: ["Ctrl+S", "Shift+Enter", "Alt+F4", "Ctrl+Z"],
          answer: 1,
          explain: "Shift+Enter corre a célula e passa para a seguinte.",
        },
      ],
    },
  ],

  readings: {
    required: [
      { text: "Russell, S. & Norvig, P. (2020). *Artificial Intelligence: A Modern Approach* (4.ª ed.). Pearson. Cap. 1." },
      {
        text: "Turing, A. M. (1950). Computing Machinery and Intelligence. *Mind*, 59(236), 433–460. Secções 1 e 7.",
        href: "https://doi.org/10.1093/mind/LIX.236.433",
      },
      { text: "Huyen, C. (2025). *AI Engineering: Building Applications with Foundation Models*. O'Reilly. Cap. 1." },
    ],
    complementary: [
      { text: "Géron, A. (2022). *Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow* (3.ª ed.). O'Reilly. Cap. 1." },
      { text: "Chollet, F. (2021). *Deep Learning with Python* (2.ª ed.). Manning. Cap. 1." },
      { text: "Mitchell, T. (1997). *Machine Learning*. McGraw-Hill. Cap. 1." },
    ],
    cited: [
      "McCulloch, W. & Pitts, W. (1943). A logical calculus of the ideas immanent in nervous activity. *Bulletin of Mathematical Biophysics*, 5, 115–133.",
      "McCarthy, J., Minsky, M., Rochester, N. & Shannon, C. (1955). *A Proposal for the Dartmouth Summer Research Project on Artificial Intelligence*.",
      "Rosenblatt, F. (1958). The perceptron: a probabilistic model for information storage and organization in the brain. *Psychological Review*, 65(6), 386–408.",
      "Weizenbaum, J. (1966). ELIZA. *Communications of the ACM*, 9(1), 36–45.",
      "Minsky, M. & Papert, S. (1969). *Perceptrons*. MIT Press.",
      "Lighthill, J. (1973). *Artificial Intelligence: A General Survey*. Science Research Council.",
      "Rumelhart, D., Hinton, G. & Williams, R. (1986). Learning representations by back-propagating errors. *Nature*, 323, 533–536.",
      "LeCun, Y., Bottou, L., Bengio, Y. & Haffner, P. (1998). Gradient-based learning applied to document recognition. *Proceedings of the IEEE*, 86(11), 2278–2324.",
      "Campbell, M., Hoane, A. J. & Hsu, F. (2002). Deep Blue. *Artificial Intelligence*, 134, 57–83.",
      "Krizhevsky, A., Sutskever, I. & Hinton, G. (2012). ImageNet classification with deep convolutional neural networks. *NeurIPS*, 25.",
      "LeCun, Y., Bengio, Y. & Hinton, G. (2015). Deep learning. *Nature*, 521, 436–444.",
      "Sculley, D. et al. (2015). Hidden technical debt in machine learning systems. *NeurIPS*, 28.",
      "Silver, D. et al. (2016). Mastering the game of Go with deep neural networks and tree search. *Nature*, 529, 484–489.",
      "Vaswani, A. et al. (2017). Attention is all you need. *NeurIPS*, 30.",
      "Sutton, R. & Barto, A. (2018). *Reinforcement Learning: An Introduction* (2.ª ed.). MIT Press.",
      "Bommasani, R. et al. (2021). On the opportunities and risks of foundation models. arXiv:2108.07258.",
      "Ouyang, L. et al. (2022). Training language models to follow instructions with human feedback. *NeurIPS*, 35.",
    ],
  },

  // ---------------------------------------------------------------- APOSTILA (02-apostila.md)
  apostila: {
    intro: "Resumo para rever antes da prova. Tudo o que está aqui foi explicado na aula, com as fontes.",
    sections: [
      {
        title: "Definições essenciais",
        blocks: [
          {
            t: "list",
            items: [
              "**Inteligência artificial:** o campo que estuda como construir agentes que agem de forma inteligente. Russell & Norvig (2020) adotam a ideia de **agente racional**: escolhe a ação que se espera que dê o melhor resultado.",
              "**Machine learning (Mitchell, 1997):** um programa aprende com a experiência **E**, numa tarefa **T**, segundo uma medida **P**, se o desempenho em T, medido por P, melhora com E.",
              "**Deep learning:** ML com redes neuronais de muitas camadas, que aprendem as próprias representações.",
              "**IA generativa:** modelos que criam conteúdo novo. **LLM:** modelo generativo de texto treinado com enormes quantidades de dados. **Modelo de fundação:** modelo geral que serve de base a muitas aplicações (Bommasani et al., 2021).",
              "**Relação:** IA generativa ⊂ deep learning ⊂ machine learning ⊂ IA.",
            ],
          },
        ],
      },
      {
        title: "As quatro abordagens à IA (Russell & Norvig)",
        blocks: [
          {
            t: "table",
            head: ["", "Imitar o ser humano", "Ser racional"],
            rows: [
              ["**Pensar**", "Ciência cognitiva", "Lógica formal"],
              ["**Agir**", "Teste de Turing", "Agente racional"],
            ],
          },
        ],
      },
      {
        title: "Dez datas para saber",
        blocks: [
          {
            t: "table",
            head: ["Ano", "Marco"],
            rows: [
              ["1943", "McCulloch & Pitts: modelo matemático do neurónio"],
              ["1950", "Turing: jogo da imitação"],
              ["1956", "Conferência de Dartmouth: nasce a área com o nome IA"],
              ["1958", "Perceptrão de Rosenblatt"],
              ["1974–1980", "1.º inverno da IA"],
              ["1986", "Retropropagação popularizada (Rumelhart, Hinton & Williams)"],
              ["1987–1993", "2.º inverno da IA"],
              ["2012", "AlexNet vence o ImageNet: arranque do deep learning moderno"],
              ["2017", "Transformer (\"Attention Is All You Need\")"],
              ["2022", "ChatGPT leva a IA generativa ao grande público"],
            ],
          },
        ],
      },
      {
        title: "Tipos de aprendizagem",
        blocks: [
          {
            t: "table",
            head: ["Tipo", "Dados", "Exemplo"],
            rows: [
              ["Supervisionada", "Com rótulos", "Spam (classificação), preço de casas (regressão)"],
              ["Não supervisionada", "Sem rótulos", "Grupos de clientes, anomalias"],
              ["Por reforço", "Recompensas", "AlphaGo, ajuste de LLMs com feedback"],
              ["Auto-supervisionada", "Rótulos tirados dos dados", "Prever a palavra seguinte"],
            ],
          },
          { t: "p", text: "Um LLM passa por três: pré-treino auto-supervisionado, ajuste supervisionado e reforço com feedback humano." },
        ],
      },
      {
        title: "Vocabulário",
        blocks: [
          {
            t: "table",
            head: ["Termo", "Significado"],
            rows: [
              ["Dados de treino", "Exemplos usados para aprender"],
              ["Rótulo", "A resposta certa de um exemplo"],
              ["Característica (feature)", "Uma informação que o modelo usa"],
              ["Modelo", "O resultado do treino: regras aprendidas a partir dos dados"],
              ["Treino", "Ajustar o modelo aos dados"],
              ["Inferência", "Usar o modelo em dados novos"],
              ["Generalização", "Acertar em exemplos nunca vistos"],
              ["Falso positivo / negativo", "Alarme sem razão / caso que escapa"],
            ],
          },
        ],
      },
      {
        title: "Cinco erros de raciocínio comuns",
        blocks: [
          {
            t: "list",
            ordered: true,
            items: [
              "**\"IA é o ChatGPT.\"** A IA generativa é apenas uma parte da IA.",
              "**\"Acertar nos dados de treino chega.\"** O que conta é acertar em dados novos.",
              "**\"O Deep Blue aprendeu a jogar xadrez.\"** Usava sobretudo pesquisa massiva e funções de avaliação afinadas por especialistas.",
              "**\"O teste de Turing mede inteligência.\"** Mede a capacidade de imitar conversa humana.",
              "**\"Mais dados resolvem sempre.\"** A qualidade e a representatividade dos dados contam tanto como a quantidade.",
            ],
          },
        ],
      },
      {
        title: "Para lembrar",
        blocks: [
          {
            t: "list",
            items: [
              "ML é trocar regras escritas à mão por exemplos com respostas certas.",
              "A engenharia de IA atual adapta modelos de fundação e vive da avaliação (Huyen, 2025).",
              "A história da IA ensina a desconfiar de promessas que não vêm com medições.",
            ],
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------- EXERCÍCIOS (03-exercicios.md + 05-gabarito.md)
  exerciseParts: [
    { id: "A", title: "Parte A — Conceitos" },
    { id: "B", title: "Parte B — História" },
    {
      id: "C",
      title: "Parte C — Programação no Colab",
      note: "Fazem-se no Colab (ou localmente, a partir de `codigo/exemplos_m1.py`). O laboratório da [secção 4](#s4) faz o mesmo cálculo que o scikit-learn e serve para confirmar resultados.",
    },
    { id: "D", title: "Parte D — Aplicação" },
  ],
  exercises: [
    {
      id: "e1",
      num: 1,
      part: "A",
      session: "w2s1",
      kind: "classify",
      title: "Que tipo de sistema?",
      minutes: 10,
      sections: ["s2"],
      prompt: [
        { t: "p", text: "Classifique cada sistema como (a) IA baseada em regras, (b) ML clássico, (c) deep learning ou (d) IA generativa, e justifique numa frase." },
      ],
      categories: ["(a) IA baseada em regras", "(b) ML clássico", "(c) Deep learning", "(d) IA generativa"],
      justify: "Justificação",
      items: [
        { id: "1", text: "Um termóstato que liga o aquecimento abaixo dos 19 °C.", answer: 0, explain: "Regra fixa de limiar." },
        { id: "2", text: "Um modelo de regressão que prevê as vendas do mês a partir do histórico.", answer: 1, explain: "Aprende padrões de dados em tabela." },
        { id: "3", text: "O desbloqueio facial do telemóvel.", answer: 2, explain: "Redes neuronais profundas a partir dos píxeis da imagem." },
        { id: "4", text: "Um assistente que escreve descrições de produtos para uma loja online.", answer: 3, explain: "Gera texto novo." },
        { id: "5", text: "Um corretor ortográfico que compara cada palavra com um dicionário.", answer: 0, explain: "Compara com uma lista; os corretores modernos também usam ML, mas o descrito é só regras." },
      ],
      solution: [
        { t: "p", text: "(1) **a** — regra fixa de limiar. (2) **b** — aprende padrões de dados em tabela. (3) **c** — redes neuronais profundas a partir dos píxeis da imagem. (4) **d** — gera texto novo. (5) **a** — compara com uma lista; os corretores modernos também usam ML, mas o descrito é só regras." },
      ],
    },
    {
      id: "e2",
      num: 2,
      part: "A",
      session: "w2s1",
      kind: "text",
      title: "T, P e E de Mitchell",
      minutes: 10,
      sections: ["s2"],
      prompt: [
        { t: "p", text: "Para um filtro de spam, identifique T, P e E na definição de Mitchell (1997). Faça o mesmo para um sistema que recomenda filmes." },
      ],
      fields: [
        { id: "spam", label: "Filtro de spam", rows: 4, placeholder: "T = …\nP = …\nE = …" },
        { id: "filmes", label: "Recomendação de filmes", rows: 4, placeholder: "T = …\nP = …\nE = …" },
      ],
      criteria: [
        "Spam: T = classificar emails como spam ou normais; P = percentagem de emails bem classificados; E = emails marcados pelos utilizadores",
        "Filmes: T = recomendar filmes que o utilizador vai querer ver",
        "Filmes: P é um número mensurável (percentagem de recomendações vistas até ao fim, ou avaliação média dada)",
        "Filmes: E = histórico de visualizações e avaliações",
      ],
      solution: [
        { t: "p", text: "**Spam:** T = classificar emails como spam ou normais; P = percentagem de emails bem classificados; E = emails marcados pelos utilizadores." },
        { t: "p", text: "**Filmes:** T = recomendar filmes que o utilizador vai querer ver; P = percentagem de recomendações vistas até ao fim, ou a avaliação média dada; E = histórico de visualizações e avaliações." },
      ],
    },
    {
      id: "e3",
      num: 3,
      part: "A",
      session: "w2s1",
      kind: "classify",
      title: "As quatro abordagens de Russell & Norvig",
      minutes: 6,
      sections: ["s1"],
      prompt: [{ t: "p", text: "Coloque cada exemplo numa das quatro abordagens de Russell & Norvig." }],
      categories: ["Pensar como um humano", "Pensar racionalmente", "Agir como um humano", "Agir racionalmente"],
      items: [
        { id: "a", text: "Um programa que tenta passar por humano num chat.", answer: 2 },
        { id: "b", text: "Um GPS que escolhe a rota mais rápida.", answer: 3 },
        { id: "c", text: "Um modelo computacional da memória humana usado em psicologia.", answer: 0 },
        { id: "d", text: "Um provador automático de teoremas baseado em lógica.", answer: 1 },
      ],
      solution: [
        { t: "p", text: "(a) agir como um humano; (b) agir racionalmente; (c) pensar como um humano; (d) pensar racionalmente." },
      ],
    },
    {
      id: "e4",
      num: 4,
      part: "A",
      session: "w2s1",
      kind: "classify",
      title: "Tipo de aprendizagem",
      minutes: 8,
      sections: ["s5"],
      prompt: [
        { t: "p", text: "Para cada problema, indique o tipo de aprendizagem e, se for supervisionada, se é classificação ou regressão." },
      ],
      categories: [
        "Supervisionada · classificação",
        "Supervisionada · regressão",
        "Não supervisionada",
        "Por reforço",
        "Auto-supervisionada",
      ],
      items: [
        { id: "1", text: "Prever o preço de uma casa.", answer: 1 },
        { id: "2", text: "Agrupar clientes por hábitos de compra, sem categorias definidas.", answer: 2, explain: "Clustering." },
        { id: "3", text: "Ensinar um robô a andar por tentativas e recompensas.", answer: 3 },
        { id: "4", text: "Treinar um modelo a prever a palavra seguinte em milhões de textos.", answer: 4 },
        { id: "5", text: "Detetar se uma transação é fraudulenta, com um histórico já marcado.", answer: 0 },
        { id: "6", text: "Encontrar transações invulgares sem nenhum exemplo marcado.", answer: 2, explain: "Deteção de anomalias." },
      ],
      solution: [
        { t: "p", text: "(1) supervisionada, regressão; (2) não supervisionada (clustering); (3) por reforço; (4) auto-supervisionada; (5) supervisionada, classificação; (6) não supervisionada (deteção de anomalias)." },
      ],
    },
    {
      id: "e5",
      num: 5,
      part: "A",
      session: "w2s1",
      kind: "classify",
      title: "Verdadeiro ou falso",
      minutes: 8,
      sections: ["s2", "s3"],
      prompt: [{ t: "p", text: "Verdadeiro ou falso? Corrija as falsas." }],
      categories: ["Verdadeiro", "Falso"],
      justify: "Correção (se for falsa)",
      items: [
        { id: "1", text: "Todo o deep learning é machine learning.", answer: 0 },
        { id: "2", text: "Todo o machine learning usa redes neuronais.", answer: 1, explain: "Regressão linear, árvores de decisão ou Naive Bayes são ML sem redes neuronais." },
        { id: "3", text: "O Deep Blue venceu Kasparov graças ao deep learning.", answer: 1, explain: "Usava pesquisa massiva em hardware dedicado e funções de avaliação afinadas por especialistas (Campbell et al., 2002)." },
        { id: "4", text: "Os LLMs são um tipo de IA generativa.", answer: 0 },
        { id: "5", text: "A expressão \"inteligência artificial\" surgiu na proposta da conferência de Dartmouth.", answer: 0, explain: "A proposta de 1955, de McCarthy e colegas." },
      ],
      solution: [
        { t: "p", text: "(1) Verdadeiro. (2) Falso: regressão linear, árvores de decisão ou Naive Bayes são ML sem redes neuronais. (3) Falso: o Deep Blue usava pesquisa massiva em hardware dedicado e funções de avaliação afinadas por especialistas (Campbell et al., 2002). (4) Verdadeiro. (5) Verdadeiro: a proposta de 1955, de McCarthy e colegas." },
      ],
    },
    {
      id: "e6",
      num: 6,
      part: "A",
      session: "w2s1",
      kind: "text",
      title: "Programar regras ou aprender com dados",
      minutes: 10,
      sections: ["s4"],
      prompt: [
        { t: "p", text: "Em 3 a 5 linhas, explique por palavras suas a diferença entre \"programar regras\" e \"aprender com dados\". Dê um exemplo em que as regras são a melhor escolha." },
      ],
      fields: [{ id: "r", label: "Resposta", rows: 6 }],
      criteria: [
        "Com regras, é a pessoa que decide como resolver o problema e escreve cada passo; o programa só executa",
        "Com dados, a pessoa dá exemplos com respostas certas e o algoritmo encontra o padrão",
        "Exemplo em que as regras são melhores: problema simples, estável e que tem de ser auditável",
      ],
      solution: [
        { t: "p", text: "Resposta-modelo: ao programar regras, a pessoa decide como resolver o problema e escreve cada passo; o programa só executa. Ao aprender com dados, a pessoa dá exemplos com respostas certas e o algoritmo encontra o padrão. As regras são melhores quando o problema é simples, estável e tem de ser auditável: calcular o IVA, validar o formato de um NIF, aplicar uma regra legal." },
      ],
    },
    {
      id: "e7",
      num: 7,
      part: "B",
      session: "w2s1",
      kind: "order",
      title: "Ordem cronológica",
      minutes: 6,
      sections: ["s3"],
      prompt: [{ t: "p", text: "Ordene cronologicamente, do mais antigo para o mais recente. Use as setas para mover cada linha." }],
      items: [
        { id: "a", text: "Conferência de Dartmouth", detail: "1956" },
        { id: "b", text: "Perceptrão", detail: "1958" },
        { id: "c", text: "Retropropagação popularizada", detail: "1986" },
        { id: "d", text: "Deep Blue", detail: "1997" },
        { id: "e", text: "AlexNet", detail: "2012" },
        { id: "f", text: "AlphaGo", detail: "2016" },
        { id: "g", text: "Transformer", detail: "2017" },
        { id: "h", text: "ChatGPT", detail: "2022" },
      ],
      solution: [
        { t: "p", text: "Dartmouth (1956) → perceptrão (1958) → retropropagação (1986) → Deep Blue (1997) → AlexNet (2012) → AlphaGo (2016) → Transformer (2017) → ChatGPT (2022)." },
      ],
    },
    {
      id: "e8",
      num: 8,
      part: "B",
      session: "w2s1",
      kind: "text",
      title: "Os invernos e o momento atual",
      minutes: 15,
      sections: ["s3"],
      prompt: [
        { t: "p", text: "Os dois invernos da IA tiveram causas parecidas. (a) Que padrão se repetiu? (b) Que sinais desse padrão encontra, ou não encontra, no momento atual da IA generativa? Argumente em 5 a 8 linhas, com pelo menos um argumento de cada lado." },
      ],
      fields: [
        { id: "a", label: "(a) O padrão que se repetiu", rows: 3 },
        { id: "b", label: "(b) Sinais no momento atual, dos dois lados", rows: 8 },
      ],
      criteria: [
        "(a) Promessas maiores do que a tecnologia entregava, seguidas de desilusão de quem financiava e de cortes",
        "(b) Pelo menos um sinal parecido (expectativas muito altas, investimento enorme, projetos-piloto que não chegam a produção)",
        "(b) Pelo menos uma diferença (uso real por centenas de milhões de pessoas, receitas, ganhos medidos em tarefas concretas)",
        "Argumentos concretos dos dois lados, não só opinião",
      ],
      solution: [
        { t: "p", text: "(a) Promessas maiores do que a tecnologia entregava, seguidas de desilusão de quem financiava e de cortes." },
        { t: "p", text: "(b) Resposta aberta. Uma boa resposta pesa os dois lados. Sinais parecidos: expectativas muito altas, investimento enorme, muitos projetos-piloto que não chegam a produção. Diferenças: uso real por centenas de milhões de pessoas, receitas, ganhos medidos em tarefas concretas como programação. Critério: argumentos concretos dos dois lados, não só opinião." },
      ],
    },
    {
      id: "e9",
      num: 9,
      part: "C",
      session: "w2s2",
      kind: "text",
      title: "O filtro de regras e os seus erros",
      minutes: 25,
      sections: ["s4"],
      prompt: [
        { t: "p", text: "Corra o filtro baseado em regras da [secção 4](#s4) da aula. Escreva três mensagens novas: um falso positivo, um falso negativo e uma bem classificada. Explique porque é difícil resolver os erros apenas com mais regras." },
      ],
      fields: [
        { id: "msgs", label: "As três mensagens e o resultado de e_spam", rows: 6, mono: true, placeholder: "e_spam(\"…\")  # True  — falso positivo\ne_spam(\"…\")  # False — falso negativo\ne_spam(\"…\")  # …     — bem classificada" },
        { id: "why", label: "Porque é difícil resolver os erros só com mais regras", rows: 4 },
      ],
      criteria: [
        "Um falso positivo: mensagem legítima que dá True",
        "Um falso negativo: spam que dá False",
        "Uma mensagem bem classificada",
        "Explica que cada regra nova cria exceções novas, que quem envia spam muda a escrita e que a lista nunca acaba",
      ],
      solution: [
        { t: "p", text: "Exemplos testados: \"Tenho o prémio do sorteio do clube para lhe entregar\" dá `True` (falso positivo); \"Ganhe d1nheiro f@cil\" dá `False` (falso negativo)." },
        { t: "p", text: "Explicação: cada regra nova cria exceções novas, quem envia spam muda a escrita para fugir às regras e a lista nunca acaba. Com ML, corrige-se acrescentando exemplos marcados." },
      ],
    },
    {
      id: "e10",
      num: 10,
      part: "C",
      session: "w2s2",
      kind: "text",
      title: "Probabilidades do Naive Bayes",
      minutes: 25,
      sections: ["s4"],
      prompt: [
        { t: "p", text: "Corra o modelo Naive Bayes da [secção 4](#s4)." },
        {
          t: "list",
          ordered: true,
          items: [
            "Use `modelo.predict_proba(vetorizador.transform([...]))` para ver as probabilidades de \"oferta de jantar no sábado\" e \"dinheiro da fatura\". A primeira coluna é a probabilidade de ser normal; a segunda, de ser spam. O que mostram os valores?",
            "Acrescente 4 mensagens novas (2 spam e 2 normais) com os rótulos certos e treine de novo. As probabilidades mudaram? Porquê?",
          ],
        },
      ],
      fields: [
        { id: "p1", label: "1. Probabilidades e o que mostram", rows: 5 },
        { id: "p2", label: "2. Mensagens novas, novas probabilidades e porquê", rows: 7, mono: true },
      ],
      criteria: [
        "\"oferta de jantar no sábado\" dá cerca de [0,92 0,08] e \"dinheiro da fatura\" cerca de [0,54 0,46]",
        "Explica a indecisão: \"dinheiro\" só apareceu em spam e \"fatura\" só em mensagens normais",
        "Conclui que um valor perto de 50% deve ser tratado com cuidado",
        "As probabilidades mudam porque o modelo é apenas o resumo estatístico dos exemplos",
      ],
      solution: [
        { t: "p", text: "(1) Resultado: \"oferta de jantar no sábado\" dá `[0.92 0.08]`, ou seja, 92% normal; \"dinheiro da fatura\" dá `[0.54 0.46]`, quase empate. \"Dinheiro\" só apareceu em spam e \"fatura\" só em mensagens normais, por isso o modelo fica indeciso; \"jantar\", \"no\" e \"sábado\" só apareceram em mensagens normais e pesam mais do que \"oferta\". A lição: o modelo dá graus de confiança, e um valor perto de 50% deve ser tratado com cuidado." },
        { t: "p", text: "(2) As probabilidades mudam porque o modelo é apenas o resumo estatístico dos exemplos: mudar os exemplos muda o modelo." },
      ],
    },
    {
      id: "e11",
      num: 11,
      part: "C",
      session: "w2s2",
      kind: "text",
      title: "O que o modelo não conhece",
      minutes: 15,
      sections: ["s4"],
      prompt: [
        { t: "p", text: "Veja quantas palavras o modelo conhece com `len(vetorizador.vocabulary_)`. Depois classifique \"olá tudo bem\" e veja as probabilidades. Explique o resultado." },
      ],
      fields: [{ id: "r", label: "Resultados e explicação", rows: 6 }],
      criteria: [
        "O vocabulário tem 33 palavras (o CountVectorizer ignora palavras de uma só letra)",
        "\"olá tudo bem\" não tem nenhuma palavra conhecida: o vetor fica a zeros e o resultado é [0,5 0,5]",
        "O predict devolve 0 por desempate; um modelo não sabe nada para além do que viu nos dados",
      ],
      solution: [
        { t: "p", text: "O vocabulário tem 33 palavras (o `CountVectorizer` ignora palavras de uma só letra, como \"a\" e \"o\"). \"Olá tudo bem\" não tem nenhuma palavra conhecida: o vetor fica a zeros e o modelo só tem a proporção inicial de cada classe, 4 spam e 4 normais. Resultado: `[0.5 0.5]`, e o `predict` devolve 0 por desempate. A lição: um modelo não sabe nada para além do que viu nos dados." },
      ],
    },
    {
      id: "e12",
      num: 12,
      part: "D",
      session: "w2s2",
      kind: "text",
      title: "Um processo da sua empresa",
      minutes: 30,
      sections: ["s6"],
      prompt: [
        { t: "p", text: "Escolha um processo de uma empresa que conheça bem. Descreva, numa página no máximo:" },
      ],
      fields: [
        { id: "a", label: "(a) Uma parte que hoje funciona com regras ou trabalho manual", rows: 3 },
        { id: "b", label: "(b) Como poderia ser feita com ML ou IA generativa", rows: 3 },
        { id: "c", label: "(c) Que dados seriam precisos", rows: 3 },
        { id: "d", label: "(d) Que métrica provaria que funciona", rows: 2 },
        { id: "e", label: "(e) Um risco e como o reduzir", rows: 3 },
      ],
      criteria: [
        "(a) Uma parte concreta do processo que hoje é feita com regras ou à mão",
        "(b) Uma forma plausível de a fazer com ML ou IA generativa",
        "(c) Os dados necessários, e de onde viriam",
        "(d) Uma métrica concreta e mensurável",
        "(e) Um risco pertinente e uma medida para o reduzir",
      ],
      solution: [
        { t: "p", text: "Resposta aberta. Grelha: cada alínea vale 1 ponto em 5." },
        { t: "p", text: "Exemplo de boa resposta: triagem dos emails de apoio ao cliente. (a) Hoje uma pessoa lê e reencaminha cada email. (b) Um modelo classifica o assunto e um LLM propõe um rascunho de resposta. (c) Histórico de emails com o departamento que os tratou. (d) Percentagem de emails bem encaminhados e tempo médio de resposta. (e) Respostas erradas enviadas a clientes; reduz-se com revisão humana antes de enviar." },
      ],
    },
  ],

  // ---------------------------------------------------------------- PROVA (04-prova.md + 05-gabarito.md)
  exam: {
    minutes: 60,
    total: 20,
    pass: 14,
    groups: [
      {
        title: "Grupo I — Escolha múltipla (8 valores)",
        note: "Uma só resposta certa por pergunta. 1 valor cada; respostas erradas não descontam.",
        questions: [
          {
            kind: "mcq", id: "p1", num: 1, section: "s2", points: 1,
            q: "Qual das afirmações descreve melhor a relação entre IA, machine learning e deep learning?",
            options: ["São três nomes para a mesma coisa.", "O deep learning é parte do ML, que é parte da IA.", "O ML é parte do deep learning, que é parte da IA.", "A IA é parte do ML, que é parte do deep learning."],
            answer: 1,
            explain: "Cada campo está contido no anterior: IA ⊃ ML ⊃ deep learning ⊃ IA generativa.",
          },
          {
            kind: "mcq", id: "p2", num: 2, section: "s1", points: 1,
            q: "Em 1950, Turing propôs substituir a pergunta \"as máquinas podem pensar?\" por:",
            options: ["Um teste de cálculo numérico.", "Um jogo de xadrez contra um campeão.", "Uma prova de lógica formal.", "Um jogo em que um interrogador tenta distinguir, por texto, uma máquina de uma pessoa."],
            answer: 3,
            explain: "É o jogo da imitação, hoje conhecido como teste de Turing.",
          },
          {
            kind: "mcq", id: "p3", num: 3, section: "s1", points: 1,
            q: "Segundo Russell & Norvig, a abordagem do agente racional procura:",
            options: ["Agir de forma a obter o melhor resultado esperado.", "Imitar exatamente o raciocínio humano.", "Passar no teste de Turing.", "Seguir apenas regras de lógica."],
            answer: 0,
            explain: "Agir racionalmente: a ação que se espera que maximize o desempenho.",
          },
          {
            kind: "mcq", id: "p4", num: 4, section: "s5", points: 1,
            q: "Um modelo que prevê quantos clientes vão entrar numa loja amanhã resolve um problema de:",
            options: ["Classificação.", "Clustering.", "Regressão.", "Aprendizagem por reforço."],
            answer: 2,
            explain: "A resposta é um número.",
          },
          {
            kind: "mcq", id: "p5", num: 5, section: "s5", points: 1,
            q: "O pré-treino de um LLM a prever a palavra seguinte é aprendizagem:",
            options: ["Supervisionada, com rótulos escritos por pessoas.", "Não supervisionada, por clustering.", "Por reforço.", "Auto-supervisionada."],
            answer: 3,
            explain: "Os rótulos (a palavra seguinte) vêm do próprio texto.",
          },
          {
            kind: "mcq", id: "p6", num: 6, section: "s3", points: 1,
            q: "Que acontecimento é considerado o arranque da era moderna do deep learning?",
            options: ["A AlexNet vence o desafio ImageNet (2012).", "O Deep Blue vence Kasparov (1997).", "O lançamento do ChatGPT (2022).", "A conferência de Dartmouth (1956)."],
            answer: 0,
            explain: "15,3% de erro, contra 26,2% do segundo classificado.",
          },
          {
            kind: "mcq", id: "p7", num: 7, section: "s3", points: 1,
            q: "O artigo \"Attention Is All You Need\" (2017) apresentou:",
            options: ["A retropropagação.", "O Transformer.", "O perceptrão.", "As redes convolucionais."],
            answer: 1,
            explain: "Vaswani et al. (2017), a arquitetura por trás dos LLMs atuais.",
          },
          {
            kind: "mcq", id: "p8", num: 8, section: "s6", points: 1,
            q: "Segundo Huyen (2025), a principal mudança da engenharia de IA em relação ao ML tradicional é:",
            options: ["Treinar sempre modelos de raiz.", "Deixar de precisar de dados.", "Adaptar modelos de fundação existentes, com mais peso na avaliação.", "Usar só regras escritas à mão."],
            answer: 2,
            explain: "O trabalho passa do treino para a adaptação e a avaliação.",
          },
        ],
      },
      {
        title: "Grupo II — Resposta curta (8 valores)",
        note: "2 valores cada, 3 a 5 linhas por resposta.",
        questions: [
          {
            kind: "open", id: "p9", num: 9, section: "s2", points: 2, rows: 5,
            q: "Defina machine learning usando T, P e E, e aplique a definição a um exemplo à sua escolha.",
            criteria: [
              { id: "c1", text: "Definição completa", points: 1 },
              { id: "c2", text: "Exemplo com T, P e E corretos", points: 1 },
            ],
            model: "Um programa aprende com a experiência E, numa tarefa T, segundo a medida P, se o desempenho em T medido por P melhora com E. Exemplo: prever vendas (T), erro médio em euros (P), histórico de vendas (E).",
          },
          {
            kind: "open", id: "p10", num: 10, section: "s5", points: 2, rows: 5,
            q: "Explique a diferença entre classificação e regressão, com um exemplo de cada.",
            criteria: [
              { id: "c1", text: "Diferença: categoria contra número", points: 1 },
              { id: "c2", text: "Exemplo certo de classificação", points: 0.5 },
              { id: "c3", text: "Exemplo certo de regressão", points: 0.5 },
            ],
            model: "Classificação prevê uma categoria (spam ou normal); regressão prevê um número (preço de uma casa).",
          },
          {
            kind: "open", id: "p11", num: 11, section: "s3", points: 2, rows: 5,
            q: "Indique duas causas do primeiro inverno da IA.",
            criteria: [
              { id: "c1", text: "Primeira causa correta", points: 1 },
              { id: "c2", text: "Segunda causa correta", points: 1 },
            ],
            model: "Duas de: promessas exageradas que não se cumpriram; limites técnicos (pouco poder de cálculo, limites do perceptrão mostrados por Minsky & Papert); o relatório Lighthill e os cortes de financiamento no Reino Unido e na DARPA.",
          },
          {
            kind: "open", id: "p12", num: 12, section: "s4", points: 2, rows: 5,
            q: "Num filtro de spam, o que é um falso positivo? Porque pode ser mais grave do que um falso negativo?",
            criteria: [
              { id: "c1", text: "Definição de falso positivo", points: 1 },
              { id: "c2", text: "Justificação de porque pode ser mais grave", points: 1 },
            ],
            model: "Falso positivo: um email legítimo marcado como spam. Pode ser mais grave porque o utilizador perde uma mensagem importante sem saber, enquanto um spam que passa só incomoda.",
          },
        ],
      },
      {
        title: "Grupo III — Desenvolvimento (4 valores)",
        questions: [
          {
            kind: "open", id: "p13", num: 13, section: "s6", points: 4, rows: 14,
            q: "Uma loja online quer \"usar IA\" para responder aos emails dos clientes. Em 10 a 15 linhas, descreva como um engenheiro de IA abordaria o problema, seguindo os seis passos do ciclo da secção 6 da aula. Indique pelo menos um risco e como o reduziria.",
            criteria: [
              { id: "c1", text: "Os seis passos do ciclo, pela ordem certa", points: 1.5 },
              { id: "c2", text: "Métrica concreta e mensurável", points: 1 },
              { id: "c3", text: "Avaliação com casos do próprio negócio", points: 0.5 },
              { id: "c4", text: "Risco pertinente com medida para o reduzir", points: 0.5 },
              { id: "c5", text: "Clareza e concisão", points: 0.5 },
            ],
            model: "(1) Problema e métrica — responder mais depressa sem baixar a qualidade, medido pelo tempo de resposta e pela percentagem de respostas aprovadas sem alterações; (2) dados — histórico de emails e respostas, políticas da loja, catálogo; (3) modelo — um LLM com prompts e RAG sobre as políticas e o catálogo, sem treinar nada de raiz; (4) avaliação — um conjunto de 100 emails reais com respostas de referência, avaliado antes de lançar; (5) produção — começar com rascunhos revistos por uma pessoa, controlar custo e dados pessoais; (6) monitorização — registar as correções feitas pelos humanos e usá-las para melhorar. Risco: o modelo inventar uma política de devoluções; reduz-se com RAG sobre as políticas reais e revisão humana.",
          },
        ],
      },
    ],
  },
  examReviewNote: "Se a nota ficar abaixo de 14: rever as secções ligadas às perguntas falhadas e repetir a prova uma semana depois.",

  // ---------------------------------------------------------------- SIMULADO DE TREINO (banco extra da plataforma)
  practice: {
    mcq: [
          { id: "q1", section: "s1", q: "Na grelha de Russell & Norvig, que abordagem adota o manual?", options: ["Pensar como um ser humano", "Agir como um ser humano (teste de Turing)", "Seguir as leis do pensamento (lógica formal)", "Construir agentes racionais"], answer: 3, explain: "O manual adota a abordagem do agente racional: agir para obter o melhor resultado esperado." },
          { id: "q2", section: "s1", q: "Um agente racional é aquele que…", options: ["imita o comportamento humano tão fielmente quanto possível", "escolhe a ação que se espera que maximize o seu desempenho, dado o que perceciona e sabe", "nunca se engana", "aprende sempre a partir de dados"], answer: 1, explain: "Racional não quer dizer infalível: escolhe a melhor ação esperada com a informação que tem." },
          { id: "q3", section: "s1", q: "O que propôs Turing na secção 7 de \"Computing Machinery and Intelligence\"?", options: ["Um teste para medir o QI das máquinas", "Programar uma \"mente de criança\" e educá-la", "A primeira rede neuronal", "Que as máquinas nunca poderiam pensar"], answer: 1, explain: "Em \"Learning Machines\", Turing antecipa a ideia central do machine learning." },
          { id: "q4", section: "s1", q: "Porque é que o teste de Turing é hoje visto como insuficiente?", options: ["Porque nenhuma máquina conversa de forma convincente", "Porque mede a capacidade de imitar conversa humana, não a inteligência em geral", "Porque obriga a ver o interlocutor", "Porque foi provado matematicamente falso"], answer: 1, explain: "Os LLMs conversam de forma convincente sem que isso resolva a questão da inteligência." },
          { id: "q5", section: "s2", q: "Qual destas relações entre os termos está correta?", options: ["IA generativa ⊂ deep learning ⊂ machine learning ⊂ IA", "Machine learning e IA são sinónimos", "Deep learning inclui todos os sistemas de IA", "A IA generativa não usa redes neuronais"], answer: 0, explain: "Cada termo é uma parte do anterior." },
          { id: "q6", section: "s2", q: "O Deep Blue, que venceu Kasparov em 1997, é um exemplo de…", options: ["deep learning", "IA generativa", "IA sem aprendizagem, baseada em pesquisa massiva", "aprendizagem por reforço"], answer: 2, explain: "Ganhou com pesquisa massiva, não com aprendizagem." },
          { id: "q7", section: "s2", q: "Na definição de Mitchell aplicada a um filtro de spam, o que é a experiência E?", options: ["Classificar emails", "A percentagem de emails bem classificados", "Os emails que os utilizadores marcaram como spam", "O código do filtro"], answer: 2, explain: "T = classificar, P = percentagem de acertos, E = emails marcados." },
          { id: "q8", section: "s2", q: "A diferença prática entre ML clássico e deep learning é que, no deep learning…", options: ["não são precisos dados", "a rede aprende sozinha as representações úteis a partir dos dados brutos", "as regras são escritas por especialistas", "os modelos são sempre mais pequenos"], answer: 1, explain: "No ML clássico, uma pessoa escolhe as características; no deep learning, a rede aprende-as." },
          { id: "q9", section: "s2", q: "Porque é que se chama \"modelos de fundação\" aos LLMs (Bommasani et al., 2021)?", options: ["Porque foram os primeiros modelos de IA", "Porque servem de base a muitas aplicações diferentes", "Porque são treinados por fundações sem fins lucrativos", "Porque usam as regras fundamentais da lógica"], answer: 1, explain: "Um mesmo modelo serve de base a muitas aplicações." },
          { id: "q10", section: "s3", q: "O que provocou o primeiro inverno da IA (1974–1980)?", options: ["O colapso do mercado das máquinas LISP", "Promessas não cumpridas, críticas como o relatório Lighthill e cortes de financiamento", "A vitória do Deep Blue", "A falta de GPUs"], answer: 1, explain: "As máquinas LISP colapsaram em 1987, no segundo inverno." },
          { id: "q11", section: "s3", q: "Minsky & Papert (1969) mostraram que um perceptrão de uma camada…", options: ["consegue aprender qualquer função", "não consegue aprender a função XOR", "é equivalente a uma rede profunda", "só funciona com imagens"], answer: 1, explain: "Este resultado contribuiu para o primeiro inverno." },
          { id: "q12", section: "s3", q: "No desafio ImageNet de 2012, a AlexNet ganhou com…", options: ["26,2% de erro", "15,3% de erro, contra 26,2% do segundo classificado", "0% de erro", "um sistema pericial"], answer: 1, explain: "Uma diferença enorme que marcou o início da era do deep learning." },
          { id: "q13", section: "s3", q: "Que sequência está em ordem cronológica?", options: ["Transformer → AlexNet → ChatGPT", "Perceptrão → retropropagação popularizada → AlexNet → Transformer", "Deep Blue → perceptrão → Transformer", "Dartmouth → Turing → ELIZA"], answer: 1, explain: "1958 → 1986 → 2012 → 2017." },
          { id: "q14", section: "s4", q: "Na programação tradicional, regras + dados dão respostas. No machine learning…", options: ["regras + respostas dão dados", "dados + respostas certas dão as regras (o modelo)", "não há dados", "as respostas são escritas à mão"], answer: 1, explain: "É a inversão descrita por Chollet (2021)." },
          { id: "q15", section: "s4", q: "\"Tenho o prémio do sorteio do clube para lhe entregar\" é legítima mas foi marcada como spam. É um…", options: ["falso negativo", "verdadeiro positivo", "falso positivo", "verdadeiro negativo"], answer: 2, explain: "O sistema disse \"positivo\" (spam) e errou." },
          { id: "q16", section: "s4", q: "Generalização é…", options: ["acertar em todos os exemplos de treino", "acertar em exemplos que o modelo nunca viu", "usar mais características", "escrever regras mais gerais"], answer: 1, explain: "É o objetivo de todo o machine learning." },
          { id: "q17", section: "s4", q: "No exemplo do scikit-learn, o que faz `modelo.predict(...)`?", options: ["Treina o modelo", "Transforma o texto em contagens", "Usa o modelo treinado em dados novos (inferência)", "Calcula a métrica"], answer: 2, explain: "`fit` treina; `predict` faz inferência." },
          { id: "q18", section: "s5", q: "Prever o número de vendas do próximo mês a partir do histórico é um problema de…", options: ["classificação supervisionada", "regressão supervisionada", "clustering", "aprendizagem por reforço"], answer: 1, explain: "A resposta é um número e há exemplos com a resposta certa." },
          { id: "q19", section: "s5", q: "O pré-treino de um LLM, a prever a palavra seguinte, é aprendizagem…", options: ["supervisionada com rótulos humanos", "não supervisionada por clustering", "auto-supervisionada", "por reforço"], answer: 2, explain: "Os rótulos vêm do próprio texto." },
          { id: "q20", section: "s5", q: "O AlphaGo aprendeu combinando…", options: ["só regras escritas por mestres de Go", "aprendizagem supervisionada com jogos humanos e milhões de jogos contra si próprio", "só pesquisa massiva, como o Deep Blue", "auto-supervisão em texto"], answer: 1, explain: "Silver et al. (2016): supervisionada + reforço (com pesquisa em árvore)." },
          { id: "q21", section: "s6", q: "Segundo Huyen (2025), o trabalho do engenheiro de IA desloca-se sobretudo para…", options: ["treinar modelos de raiz", "a adaptação de modelos de fundação e a avaliação", "desenhar chips", "escrever regras"], answer: 1, explain: "Prompts, RAG, fine-tuning e, sobretudo, avaliação." },
          { id: "q22", section: "s6", q: "Sculley et al. (2015) mostraram que, num sistema real de ML…", options: ["o código do modelo é a maior parte", "o código do modelo é uma pequena parte; o resto é dados, configuração, infraestrutura e monitorização", "não existe dívida técnica", "a monitorização é desnecessária"], answer: 1, explain: "É aí que nasce a maior parte da dívida técnica." },
          { id: "q23", section: "s6", q: "No ciclo de trabalho, o que acontece a um modelo que não passa nos testes do próprio caso?", options: ["Vai para produção na mesma", "Volta ao passo de escolher e adaptar o modelo", "O projeto é cancelado", "Apaga-se o conjunto de testes"], answer: 1, explain: "O passo 4 decide tudo; falhar devolve ao passo 3." },
          { id: "q24", section: "s7", q: "Até à Fase 3 do curso, onde corre o código?", options: ["Num servidor próprio", "No Google Colab", "Na AWS", "Só no papel"], answer: 1, explain: "Python local e cloud só entram a partir da Fase 4." },
    ],
    tf: [
          { id: "v1", section: "s2", q: "IA, machine learning, deep learning e IA generativa são sinónimos.", answer: false, explain: "Cada um é uma parte do anterior." },
          { id: "v2", section: "s2", q: "O MYCIN sugeria antibióticos com base em regras escritas por médicos.", answer: true, explain: "Um sistema pericial clássico, sem aprendizagem." },
          { id: "v3", section: "s3", q: "O nome \"inteligência artificial\" surgiu na proposta de Dartmouth, de 1955.", answer: true, explain: "De McCarthy, Minsky, Rochester e Shannon." },
          { id: "v4", section: "s3", q: "O ELIZA (1966) usava deep learning para imitar um terapeuta.", answer: false, explain: "Usava regras simples." },
          { id: "v5", section: "s5", q: "A aprendizagem não supervisionada precisa de rótulos produzidos por pessoas.", answer: false, explain: "Trabalha com dados sem rótulos." },
          { id: "v6", section: "s5", q: "Na aprendizagem supervisionada, o custo principal está muitas vezes em produzir os rótulos.", answer: true, explain: "Alguém tem de os produzir, muitas vezes à mão." },
          { id: "v7", section: "s3", q: "Em 2024, Hopfield e Hinton receberam o Nobel da Física pelo trabalho em redes neuronais.", answer: true, explain: "E o da Química foi para Hassabis, Jumper e Baker." },
          { id: "v8", section: "s3", q: "A retropropagação foi popularizada em 1986 por Rumelhart, Hinton & Williams.", answer: true, explain: "Permitiu treinar redes com várias camadas." },
          { id: "v9", section: "s5", q: "Um LLM é treinado apenas com aprendizagem supervisionada.", answer: false, explain: "Combina auto-supervisionada, supervisionada e por reforço." },
          { id: "v10", section: "s3", q: "O ChatGPT foi lançado em novembro de 2022.", answer: true, explain: "Levou a IA generativa ao grande público." },
          { id: "v11", section: "s6", q: "Num sistema real de ML, a maior parte da dívida técnica está no código do modelo.", answer: false, explain: "Está à volta: dados, configuração, infraestrutura, monitorização." },
          { id: "v12", section: "s4", q: "Corrigir um erro de um modelo de ML passa, muitas vezes, por acrescentar exemplos certos aos dados de treino.", answer: true, explain: "Em vez de escrever mais regras." },
          { id: "v13", section: "s1", q: "A IA geral (AGI) tem uma definição consensual e uma data prevista.", answer: false, explain: "Não há definição consensual nem acordo sobre quando ou se será atingida." },
    ],
  },


  // ---------------------------------------------------------------- CARTÕES
  flashcards: [
    { id: "f1", section: "s1", tag: "Conceitos", front: "Agente", back: "Qualquer coisa que perceciona o ambiente através de sensores e age sobre ele através de atuadores." },
    { id: "f2", section: "s1", tag: "Conceitos", front: "Agente racional", back: "Escolhe, em cada momento, a ação que se espera que maximize o seu desempenho, tendo em conta o que perceciona e o que sabe." },
    { id: "f3", section: "s1", tag: "Conceitos", front: "As duas perguntas da grelha de Russell & Norvig", back: "O objetivo é **pensar** ou **agir**? O padrão é **imitar o ser humano** ou **ser racional**? O manual adota *agir racionalmente*." },
    { id: "f4", section: "s1", tag: "Conceitos", front: "Teste de Turing (jogo da imitação)", back: "Um interrogador conversa por texto com uma pessoa e uma máquina e tenta distingui-las. Mede imitação de conversa, não inteligência em geral." },
    { id: "f5", section: "s1", tag: "Conceitos", front: "O que propõe Turing na secção 7 (\"Learning Machines\")?", back: "Programar uma \"mente de criança\" e educá-la, em vez de programar uma mente adulta: a ideia central do ML." },
    { id: "f6", section: "s1", tag: "Conceitos", front: "IA geral (AGI)", back: "Capacidade ampla e flexível comparável à humana. Sem definição consensual nem data prevista." },
    { id: "f7", section: "s2", tag: "Conceitos", front: "Definição de ML de Mitchell (1997)", back: "Um programa aprende com a experiência E, numa tarefa T, segundo a medida P, se o desempenho em T medido por P melhora com E." },
    { id: "f8", section: "s2", tag: "Conceitos", front: "Deep learning vs. ML clássico", back: "No clássico, uma pessoa escolhe as características; no deep learning, a rede aprende as representações a partir dos dados brutos." },
    { id: "f9", section: "s2", tag: "Conceitos", front: "Modelo de fundação", back: "Modelo treinado com enormes quantidades de dados que serve de base a muitas aplicações diferentes (Bommasani et al., 2021)." },
    { id: "f10", section: "s2", tag: "Conceitos", front: "Sistema pericial (exemplo)", back: "Regras escritas por especialistas, sem aprendizagem. Ex.: MYCIN (antibióticos), XCON da DEC (encomendas de computadores)." },
    { id: "f11", section: "s4", tag: "Vocabulário", front: "Rótulo", back: "A resposta certa de cada exemplo. No filtro de spam: 1 = spam, 0 = normal." },
    { id: "f12", section: "s4", tag: "Vocabulário", front: "Característica (feature)", back: "Cada informação usada pelo modelo. No exemplo: a contagem de cada palavra." },
    { id: "f13", section: "s4", tag: "Vocabulário", front: "Treino vs. inferência", back: "Treino (`fit`): ajustar o modelo aos dados. Inferência (`predict`): usar o modelo treinado em dados novos." },
    { id: "f14", section: "s4", tag: "Vocabulário", front: "Generalização", back: "Acertar em exemplos que o modelo nunca viu. É o objetivo de todo o ML." },
    { id: "f15", section: "s4", tag: "Vocabulário", front: "Falso positivo", back: "O sistema diz \"sim\" (spam) e erra: uma mensagem legítima marcada como spam." },
    { id: "f16", section: "s4", tag: "Vocabulário", front: "Falso negativo", back: "O sistema diz \"não\" e erra: spam que passa pelo filtro." },
    { id: "f17", section: "s4", tag: "Vocabulário", front: "Classificação vs. regressão", back: "Classificação: a resposta é uma categoria. Regressão: a resposta é um número." },
    { id: "f18", section: "s5", tag: "Tipos", front: "Aprendizagem supervisionada", back: "Aprende com exemplos que têm a resposta certa (rótulo). O custo está nos rótulos." },
    { id: "f19", section: "s5", tag: "Tipos", front: "Aprendizagem não supervisionada", back: "Procura estrutura em dados sem rótulos: grupos, dimensões, anomalias (M10)." },
    { id: "f20", section: "s5", tag: "Tipos", front: "Aprendizagem por reforço", back: "Um agente experimenta ações, recebe recompensas e aprende a política que maximiza a recompensa acumulada (Sutton & Barto, 2018)." },
    { id: "f21", section: "s5", tag: "Tipos", front: "Aprendizagem auto-supervisionada", back: "Os rótulos vêm dos próprios dados, por exemplo esconder a palavra seguinte. É o pré-treino dos LLMs." },
    { id: "f22", section: "s5", tag: "Tipos", front: "Os três passos de treino de um LLM", back: "1) Pré-treino auto-supervisionado · 2) ajuste supervisionado com pedidos e boas respostas · 3) reforço com feedback (Ouyang et al., 2022)." },
    { id: "f23", section: "s3", tag: "História", front: "1943", back: "McCulloch & Pitts descrevem um neurónio artificial." },
    { id: "f24", section: "s3", tag: "História", front: "1956", back: "Conferência de Dartmouth lança a área (o nome vem da proposta de 1955, de McCarthy, Minsky, Rochester e Shannon)." },
    { id: "f25", section: "s3", tag: "História", front: "1958 e 1969", back: "Rosenblatt cria o perceptrão (1958); Minsky & Papert mostram que um perceptrão de uma camada não aprende o XOR (1969)." },
    { id: "f26", section: "s3", tag: "História", front: "1.º inverno da IA", back: "1974–1980. Relatório Lighthill (1973), cortes no Reino Unido e na DARPA, depois de promessas não cumpridas." },
    { id: "f27", section: "s3", tag: "História", front: "2.º inverno da IA", back: "1987–1993. Sistemas periciais caros e frágeis; colapso das máquinas LISP em 1987." },
    { id: "f28", section: "s3", tag: "História", front: "1986", back: "Rumelhart, Hinton & Williams popularizam a retropropagação." },
    { id: "f29", section: "s3", tag: "História", front: "2012 — AlexNet", back: "Vence o ImageNet com 15,3% de erro, contra 26,2% do segundo classificado." },
    { id: "f30", section: "s3", tag: "História", front: "2016 e 2017", back: "AlphaGo vence Lee Sedol por 4–1 (2016); o Transformer é publicado (2017)." },
    { id: "f31", section: "s3", tag: "História", front: "Nobel de 2024", back: "Física: Hopfield e Hinton (redes neuronais). Química: Hassabis e Jumper (AlphaFold) com Baker." },
    { id: "f32", section: "s6", tag: "Engenharia", front: "Engenheiro de IA segundo Huyen (2025)", back: "Constrói aplicações sobre modelos de fundação; o trabalho passa do treino para a adaptação (prompts, RAG, fine-tuning) e para a avaliação." },
    { id: "f33", section: "s6", tag: "Engenharia", front: "Sculley et al. (2015)", back: "Num sistema real de ML, o código do modelo é uma pequena parte; a dívida técnica nasce nos dados, configuração, infraestrutura e monitorização." },
    { id: "f34", section: "s6", tag: "Engenharia", front: "Os 6 passos do ciclo do engenheiro de IA", back: "1 Problema e métrica · 2 Dados · 3 Escolher e adaptar o modelo · 4 Avaliar · 5 Produção · 6 Monitorizar e recolher feedback." },
  ],


  // ---------------------------------------------------------------- NOTEBOOK
  notebook: {
    filename: "M1 — exercícios",
    cells: [
      { type: "md", source: "# M1 — Introdução à IA e à engenharia de IA\n\nExemplos da secção 4 e exercícios 9 a 11 (Parte C). Guardar no Drive, na pasta da Fase 0." },
      { type: "code", source: 'print("Olá, IA")' },
      { type: "md", source: "## Abordagem 1: regras escritas à mão" },
      { type: "code", source: SPAM_RULES },
      { type: "md", source: "## Abordagem 2: aprender com exemplos" },
      { type: "code", source: SPAM_NB },
      { type: "md", source: "## Exercício 9\n\nEscreva três mensagens novas: um falso positivo, um falso negativo e uma bem classificada. Explique porque é difícil resolver os erros apenas com mais regras." },
      { type: "code", source: "print(e_spam(\"...\"))  # falso positivo\nprint(e_spam(\"...\"))  # falso negativo\nprint(e_spam(\"...\"))  # bem classificada\n" },
      { type: "md", source: "## Exercício 10\n\n1. Probabilidades de \"oferta de jantar no sábado\" e \"dinheiro da fatura\" (1.ª coluna: normal; 2.ª: spam).\n2. Acrescente 4 mensagens (2 spam, 2 normais), treine de novo e compare." },
      { type: "code", source: "print(modelo.predict_proba(vetorizador.transform([\"oferta de jantar no sábado\", \"dinheiro da fatura\"])))\n" },
      { type: "md", source: "## Exercício 11\n\nQuantas palavras conhece o modelo? Como classifica \"olá tudo bem\"?" },
      { type: "code", source: "print(len(vetorizador.vocabulary_))\nprint(modelo.predict_proba(vetorizador.transform([\"olá tudo bem\"])))\n" },
      { type: "md", source: "## Notas\n\nO que aprendi neste módulo, em três frases:" },
    ],
  },
  source: "curso-engenharia-ia/modulo-01-introducao-ia",
};
