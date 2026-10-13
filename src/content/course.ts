import type { Book, Certification, Criterion, ModuleMeta, PhaseMeta } from "./types";

// Transcrição de "Engenharia de IA — Plano do Curso" (9 out 2026).
// As grelhas dos mini-projetos das Fases 0 a 5 são propostas da plataforma; o plano só define a do projeto final.

export const COURSE = {
  title: "Engenharia de IA",
  summary:
    "Da base até sistemas em produção: 30 módulos em 7 fases, até 3 horas por semana, cerca de 19 meses já com 6 semanas de pausa.",
  weeklyTargetMin: 180,
  passMark: 14,
  defaultStart: "2026-10-12",
};

export const MODULE_PARTS = [
  { id: "aula", label: "Aula", what: "Explicação completa do tema, com exemplos e as fontes citadas", time: "~2h" },
  { id: "apostila", label: "Apostila", what: "Resumo de 2 a 3 páginas para rever e consultar", time: "~30 min" },
  { id: "exercicios", label: "Exercícios", what: "Prática guiada, de perguntas de conceito a código", time: "~2h" },
  { id: "prova", label: "Prova", what: "Teste de 20 valores, sem consulta", time: "~1h" },
  { id: "gabarito", label: "Gabarito", what: "Soluções comentadas, à parte para não espreitar", time: "~30 min" },
] as const;

export const PHASES: PhaseMeta[] = [
  {
    id: "F0",
    num: 0,
    title: "Arranque",
    weeks: 7,
    goal: "Perceber o mapa da área e ficar à vontade com Python, a língua franca da IA.",
    modules: ["M1", "M2", "M3"],
    closing: {
      exam: "Exame da Fase 0: 90 minutos, 20 valores, aprovação com 14, com perguntas de M1 a M3.",
      project: {
        title: "Análise exploratória dos pinguins de Palmer",
        description:
          "Uma análise exploratória completa, num notebook do Colab, com dados científicos reais: medidas de 344 pinguins de três espécies da estação Palmer, na Antártida. Cinco perguntas, cada uma com código, um gráfico e uma resposta com os números que a sustentam. Aprovação com 12.",
        rubric: [
          { id: "inspecao", text: "Inspeção e limpeza", points: 3 },
          { id: "respostas", text: "Respostas certas", points: 5 },
          { id: "graficos", text: "Gráficos", points: 4 },
          { id: "p5", text: "Pergunta 5", points: 3 },
          { id: "codigo", text: "Código", points: 3 },
          { id: "conclusoes", text: "Conclusões", points: 2 },
        ],
      },
    },
  },
  {
    id: "F1",
    num: 1,
    title: "Matemática para IA",
    weeks: 10,
    goal:
      "A matemática entra só na medida em que é usada depois: vetores para representar dados, gradientes para treinar modelos e probabilidade para medir incerteza. Cada conceito é acompanhado de código NumPy.",
    modules: ["M4", "M5", "M6"],
    closing: {
      exam: "Exame da Fase 1: 90 minutos, 20 valores, aprovação com 14, com perguntas de M4 a M6 e um problema integrador.",
      project: {
        title: "Regressão linear de raiz: publicidade e vendas",
        description:
          "Uma regressão linear programada de raiz, num notebook do Colab, que junta os três módulos da fase: a álgebra linear resolve o problema de uma vez (M4), a descida do gradiente resolve-o passo a passo (M5) e a estatística diz quanto confiar no resultado (M6). Dados de publicidade e vendas de 200 mercados; seis perguntas, cada uma com código, os números pedidos e uma resposta. Aprovação com 12.",
        rubric: [
          { id: "exploracao", text: "Exploração", points: 2 },
          { id: "minimos", text: "Mínimos quadrados", points: 3 },
          { id: "descida", text: "Descida do gradiente", points: 5 },
          { id: "multipla", text: "Regressão múltipla", points: 3 },
          { id: "bootstrap", text: "Bootstrap", points: 3 },
          { id: "recomendacao", text: "Recomendação", points: 2 },
          { id: "codigo", text: "Código", points: 2 },
        ],
      },
    },
  },
  {
    id: "F2",
    num: 2,
    title: "Machine Learning clássico",
    weeks: 11,
    goal:
      "Aqui nasce o hábito mais importante do curso: medir bem. Os modelos clássicos continuam a ganhar em muitos problemas de dados em tabela e são a base para perceber tudo o que vem depois.",
    modules: ["M7", "M8", "M9", "M10", "M11"],
    closing: {
      exam: "Exame da Fase 2: 90 minutos, 20 valores, aprovação com 14, com perguntas de M7 a M11 e um problema de programação.",
      project: {
        title: "Retenção de clientes: quem vai sair e a quem ligar",
        description:
          "Um projeto de machine learning completo, num notebook do Colab, do ficheiro em bruto até uma recomendação para a direção, que junta os módulos da fase: avaliação honesta (M7), modelos lineares (M8), ensembles de árvores (M9) e pipelines, classes desequilibradas e interpretação (M11). Dados de 7043 clientes de uma operadora de telecomunicações: prever quem vai sair, decidir a quem ligar com uma oferta e explicar porque saem. Sete perguntas, cada uma com código, os números pedidos e uma resposta. Aprovação com 12.",
        rubric: [
          { id: "exploracao", text: "Exploração", points: 2 },
          { id: "preparacao", text: "Preparação", points: 2 },
          { id: "comparacao", text: "Comparação de modelos", points: 3 },
          { id: "afinacao", text: "Afinação e teste", points: 3 },
          { id: "decisao", text: "Decisão de negócio", points: 4 },
          { id: "interpretacao", text: "Interpretação", points: 3 },
          { id: "recomendacao", text: "Recomendação e código", points: 3 },
        ],
      },
    },
  },
  {
    id: "F3",
    num: 3,
    title: "Deep Learning",
    weeks: 11,
    goal:
      "Do neurónio artificial até ao Transformer, a arquitetura por trás de todos os LLMs atuais. A regra é construir de raiz antes de usar bibliotecas prontas.",
    modules: ["M12", "M13", "M14", "M15", "M16"],
    closing: {
      exam: "Exame da Fase 3, com perguntas de M12 a M16.",
      project: {
        title: "Mini-GPT em português",
        description:
          "Treinar um mini-GPT ao nível do carácter com um texto português em domínio público (por exemplo, Os Lusíadas) e analisar o que ele aprendeu.",
        rubric: [
          { id: "a", text: "Texto preparado e tokenização ao nível do carácter", points: 3 },
          { id: "b", text: "Transformer implementado e explicado (atenção, posições)", points: 5 },
          { id: "c", text: "Treino com curvas de perda de treino e de validação", points: 4 },
          { id: "d", text: "Amostras geradas a várias temperaturas, comentadas", points: 3 },
          { id: "e", text: "Análise do que o modelo aprendeu e dos seus limites", points: 3 },
          { id: "f", text: "Código organizado e reprodutível", points: 2 },
        ],
      },
    },
  },
  {
    id: "F4",
    num: 4,
    title: "LLMs e IA generativa",
    weeks: 17,
    goal:
      "A fase mais longa e o coração da engenharia de IA atual: perceber como os LLMs são feitos e construir aplicações fiáveis em cima deles. A referência transversal é Huyen, AI Engineering (2025).",
    modules: ["M17", "M18", "M19", "M20", "M21", "M22", "M23", "M24"],
    closing: {
      exam: "Exame da Fase 4, com perguntas de M17 a M24.",
      project: {
        title: "Assistente RAG avaliado",
        description:
          "Um assistente RAG sobre documentos reais (por exemplo, um catálogo de produtos), com um conjunto de 50 perguntas de teste e métricas de qualidade.",
        rubric: [
          { id: "a", text: "Documentos reais preparados e divididos em blocos com critério", points: 3 },
          { id: "b", text: "Recuperação vetorial ou híbrida, avaliada (por exemplo, recall@k)", points: 4 },
          { id: "c", text: "Geração com prompt estruturado e citação das fontes", points: 3 },
          { id: "d", text: "50 perguntas de teste com respostas de referência", points: 4 },
          { id: "e", text: "Métricas de qualidade das respostas e análise de erros", points: 4 },
          { id: "f", text: "Custo e latência por pergunta medidos", points: 2 },
        ],
      },
    },
  },
  {
    id: "F5",
    num: 5,
    title: "Produção, segurança e cloud",
    weeks: 9,
    goal:
      "Um modelo só vale alguma coisa quando funciona para utilizadores reais, com custo controlado e sem abrir buracos de segurança. Esta fase transforma protótipos em sistemas.",
    modules: ["M25", "M26", "M27", "M28"],
    closing: {
      exam: "Exame da Fase 5, com perguntas de M25 a M28.",
      project: {
        title: "Assistente RAG em produção",
        description:
          "Pôr o assistente RAG da Fase 4 em produção, com API em Docker, monitorização, avaliação contínua, testes de injeção de prompts e custo por pedido medido.",
        rubric: [
          { id: "a", text: "API em Docker, com instruções para a pôr a correr", points: 4 },
          { id: "b", text: "Monitorização e traces dos pedidos", points: 3 },
          { id: "c", text: "Avaliação contínua com o conjunto de teste (testes de regressão)", points: 4 },
          { id: "d", text: "Testes de injeção de prompts e mitigações", points: 4 },
          { id: "e", text: "Custo por pedido medido e otimizado", points: 3 },
          { id: "f", text: "Documentação e model card", points: 2 },
        ],
      },
    },
  },
  {
    id: "F6",
    num: 6,
    title: "Projeto final e certificação",
    weeks: 12,
    goal:
      "O curso fecha com duas provas do mundo real: um sistema de IA completo, feito de raiz, e a primeira certificação técnica de nível associado.",
    modules: ["M29", "M30"],
    closing: {
      exam: "Exame de certificação (MLA-C02 ou a alternativa escolhida).",
      project: {
        title: "Projeto final",
        description:
          "Um sistema de IA escolhido pelo aluno, resolvendo um problema real: dados, modelo ou LLM, avaliação, deploy, monitorização, model card e uma apresentação de 10 minutos.",
        rubric: [],
      },
    },
  },
];

export const FINAL_PROJECT_CRITERIA: Criterion[] = [
  { id: "p1", text: "Problema bem definido, com métrica de sucesso", points: 3 },
  { id: "p2", text: "Dados e preparação documentados", points: 3 },
  { id: "p3", text: "Escolha do modelo justificada com comparação", points: 3 },
  { id: "p4", text: "Avaliação rigorosa, com conjunto de teste próprio", points: 4 },
  { id: "p5", text: "Sistema publicado e monitorizado", points: 4 },
  { id: "p6", text: "Segurança, custos e limitações discutidos", points: 3 },
];

export const MODULES: ModuleMeta[] = [
  {
    id: "M1", num: 1, phase: "F0", weeks: 2,
    title: "Introdução à IA e à engenharia de IA",
    learn: "IA, ML, deep learning e IA generativa; história de 1950 a hoje; tipos de aprendizagem; o que faz um engenheiro de IA; ambiente Colab",
    readings: [
      "Russell & Norvig, Artificial Intelligence: A Modern Approach, 4.ª ed. (2020), cap. 1",
      "Turing (1950), \"Computing Machinery and Intelligence\"",
      "Huyen, AI Engineering (2025), cap. 1",
    ],
  },
  {
    id: "M2", num: 2, phase: "F0", weeks: 2,
    title: "Python para IA I",
    learn: "Tipos, controlo de fluxo, funções, listas e dicionários, ficheiros, módulos, ambientes virtuais, notebooks",
    readings: ["Matthes, Python Crash Course, 3.ª ed. (2023), parte I", "Tutorial oficial do Python"],
  },
  {
    id: "M3", num: 3, phase: "F0", weeks: 2,
    title: "Python para IA II",
    learn: "NumPy (arrays, vetorização, broadcasting), pandas (limpeza, agrupamentos, junções), gráficos com Matplotlib",
    readings: [
      "McKinney, Python for Data Analysis, 3.ª ed. (2022)",
      "VanderPlas, Python Data Science Handbook, 2.ª ed. (2022)",
      "Harris et al. (2020), \"Array programming with NumPy\", Nature",
    ],
  },
  {
    id: "M4", num: 4, phase: "F1", weeks: 3,
    title: "Álgebra linear",
    learn: "Vetores, matrizes, produto escalar e semelhança do cosseno, normas, transformações lineares, valores próprios, SVD intuitivo",
    readings: [
      "Deisenroth, Faisal & Ong, Mathematics for Machine Learning (2020), caps. 2–4 (gratuito)",
      "Strang, Introduction to Linear Algebra, 6.ª ed. (2023)",
      "Vídeos \"Essence of Linear Algebra\" (3Blue1Brown)",
    ],
    note: "Sobrepõe-se à cadeira de Álgebra Linear do roteiro de engenharia de software: quem já a tiver feito pode ler só a apostila e fazer a prova.",
  },
  {
    id: "M5", num: 5, phase: "F1", weeks: 3,
    title: "Cálculo e otimização",
    learn: "Derivadas e derivadas parciais, gradiente, regra da cadeia, descida do gradiente, convexidade",
    readings: [
      "Deisenroth et al. (2020), caps. 5 e 7",
      "Vídeos \"Essence of Calculus\" (3Blue1Brown)",
      "Opcional: Boyd & Vandenberghe, Convex Optimization (2004), cap. 9",
    ],
    note: "Sobrepõe-se à cadeira de Cálculo do roteiro de engenharia de software: quem já a tiver feito pode ler só a apostila e fazer a prova.",
  },
  {
    id: "M6", num: 6, phase: "F1", weeks: 3,
    title: "Probabilidade e estatística",
    learn: "Variáveis aleatórias, distribuições, esperança e variância, teorema de Bayes, máxima verosimilhança, intervalos de confiança, testes A/B",
    readings: [
      "Deisenroth et al. (2020), caps. 6 e 8",
      "Blitzstein & Hwang, Introduction to Probability, 2.ª ed. (2019) (gratuito)",
    ],
    note: "Sobrepõe-se à cadeira de Estatística do roteiro de engenharia de software: quem já a tiver feito pode ler só a apostila e fazer a prova.",
  },
  {
    id: "M7", num: 7, phase: "F2", weeks: 2,
    title: "Fundamentos de ML",
    learn: "Formular um problema, treino, validação e teste, generalização, sobreajuste, compromisso viés-variância, métricas (precisão, revocação, F1, ROC-AUC, MAE, RMSE)",
    readings: [
      "James, Witten, Hastie, Tibshirani & Taylor, An Introduction to Statistical Learning with Applications in Python (2023), caps. 1, 2 e 5 (gratuito)",
      "Géron, Hands-On Machine Learning, 3.ª ed. (2022), caps. 1–3",
      "Domingos (2012), \"A Few Useful Things to Know About Machine Learning\"",
    ],
  },
  {
    id: "M8", num: 8, phase: "F2", weeks: 2,
    title: "Modelos lineares",
    learn: "Regressão linear e logística, regularização Ridge e Lasso, seleção de modelos",
    readings: [
      "James et al. (2023), caps. 3, 4 e 6",
      "Tibshirani (1996), \"Regression Shrinkage and Selection via the Lasso\"",
    ],
  },
  {
    id: "M9", num: 9, phase: "F2", weeks: 2,
    title: "Árvores, ensembles e outros",
    learn: "Árvores de decisão, random forests, gradient boosting (XGBoost, LightGBM), k-NN, SVM",
    readings: [
      "James et al. (2023), caps. 8–9",
      "Breiman (2001), \"Random Forests\"",
      "Chen & Guestrin (2016), \"XGBoost\"",
      "Grinsztajn et al. (2022), \"Why do tree-based models still outperform deep learning on tabular data?\"",
    ],
  },
  {
    id: "M10", num: 10, phase: "F2", weeks: 2,
    title: "Aprendizagem não supervisionada",
    learn: "k-means, clustering hierárquico, DBSCAN, PCA, t-SNE e UMAP, deteção de anomalias",
    readings: [
      "James et al. (2023), cap. 12",
      "van der Maaten & Hinton (2008), \"Visualizing Data using t-SNE\"",
      "McInnes et al. (2018), \"UMAP\"",
    ],
  },
  {
    id: "M11", num: 11, phase: "F2", weeks: 2,
    title: "Pipelines e avaliação rigorosa",
    learn: "Engenharia de variáveis, validação cruzada, fugas de dados, pipelines no scikit-learn, classes desequilibradas, interpretabilidade com SHAP",
    readings: [
      "Pedregosa et al. (2011), \"Scikit-learn: Machine Learning in Python\"",
      "Kaufman et al. (2012), \"Leakage in Data Mining\"",
      "Lundberg & Lee (2017), \"A Unified Approach to Interpreting Model Predictions\"",
    ],
  },
  {
    id: "M12", num: 12, phase: "F3", weeks: 2,
    title: "Redes neuronais e retropropagação",
    learn: "Perceptrão, funções de ativação, redes multicamada, funções de perda, retropropagação programada à mão",
    readings: [
      "Rosenblatt (1958), \"The Perceptron\"",
      "Rumelhart, Hinton & Williams (1986), \"Learning representations by back-propagating errors\"",
      "Goodfellow, Bengio & Courville, Deep Learning (2016), cap. 6",
      "Prince, Understanding Deep Learning (2023), caps. 3–7 (gratuito)",
    ],
  },
  {
    id: "M13", num: 13, phase: "F3", weeks: 2,
    title: "Treinar redes profundas com PyTorch",
    learn: "Tensores e autograd, ciclo de treino, SGD e Adam, inicialização, dropout, normalização, uso de GPU",
    readings: [
      "Paszke et al. (2019), \"PyTorch\"",
      "Kingma & Ba (2014), \"Adam\"",
      "Srivastava et al. (2014), \"Dropout\"",
      "Ioffe & Szegedy (2015), \"Batch Normalization\"",
      "Zhang, Lipton, Li & Smola, Dive into Deep Learning (2023) (gratuito)",
    ],
  },
  {
    id: "M14", num: 14, phase: "F3", weeks: 2,
    title: "Visão computacional",
    learn: "Convoluções, CNNs, LeNet, AlexNet e ResNet, transferência de aprendizagem, aumento de dados",
    readings: [
      "LeCun et al. (1998), \"Gradient-Based Learning Applied to Document Recognition\"",
      "Krizhevsky, Sutskever & Hinton (2012), \"ImageNet Classification with Deep Convolutional Neural Networks\"",
      "He et al. (2016), \"Deep Residual Learning\"",
    ],
  },
  {
    id: "M15", num: 15, phase: "F3", weeks: 2,
    title: "Sequências e texto",
    learn: "Tokenização, embeddings (word2vec), RNN e LSTM, modelos seq2seq, o primeiro mecanismo de atenção",
    readings: [
      "Mikolov et al. (2013), \"Efficient Estimation of Word Representations\"",
      "Hochreiter & Schmidhuber (1997), \"Long Short-Term Memory\"",
      "Bahdanau, Cho & Bengio (2014), \"Neural Machine Translation by Jointly Learning to Align and Translate\"",
      "Jurafsky & Martin, Speech and Language Processing, 3.ª ed. (rascunho online)",
    ],
  },
  {
    id: "M16", num: 16, phase: "F3", weeks: 2,
    title: "Transformers",
    learn: "Autoatenção, atenção multi-cabeça, codificação posicional, encoder e decoder, um mini-GPT de raiz",
    readings: [
      "Vaswani et al. (2017), \"Attention Is All You Need\"",
      "Alammar (2018), \"The Illustrated Transformer\"",
      "Raschka, Build a Large Language Model (From Scratch) (2024), caps. 2–4",
    ],
  },
  {
    id: "M17", num: 17, phase: "F4", weeks: 2,
    title: "Como se constrói um LLM",
    learn: "Pré-treino, tokenização BPE, previsão do próximo token, BERT vs. GPT, leis de escala, dados de treino, mistura de especialistas",
    readings: [
      "Devlin et al. (2019), \"BERT\"",
      "Brown et al. (2020), \"Language Models are Few-Shot Learners\"",
      "Sennrich, Haddow & Birch (2016), \"Subword Units\"",
      "Kaplan et al. (2020), \"Scaling Laws\"",
      "Hoffmann et al. (2022), \"Training Compute-Optimal LLMs\"",
      "Alammar & Grootendorst, Hands-On Large Language Models (2024)",
    ],
  },
  {
    id: "M18", num: 18, phase: "F4", weeks: 2,
    title: "Pós-treino e alinhamento",
    learn: "Ajuste por instruções, RLHF, Constitutional AI, DPO, modelos de raciocínio treinados por reforço",
    readings: [
      "Ouyang et al. (2022), \"Training language models to follow instructions with human feedback\"",
      "Bai et al. (2022), \"Constitutional AI\"",
      "Rafailov et al. (2023), \"Direct Preference Optimization\"",
      "DeepSeek-AI (2025), \"DeepSeek-R1\"",
    ],
  },
  {
    id: "M19", num: 19, phase: "F4", weeks: 2,
    title: "Engenharia de prompts e APIs",
    learn: "Papéis e mensagens, exemplos no prompt, cadeia de pensamento, saídas estruturadas em JSON, uso de ferramentas, cache, custo e latência",
    readings: [
      "Wei et al. (2022), \"Chain-of-Thought Prompting\"",
      "Kojima et al. (2022), \"Large Language Models are Zero-Shot Reasoners\"",
      "Schulhoff et al. (2024), \"The Prompt Report\"",
      "Huyen (2025), cap. 5",
      "Documentação de prompts da Anthropic",
    ],
  },
  {
    id: "M20", num: 20, phase: "F4", weeks: 2,
    title: "RAG (geração aumentada por recuperação)",
    learn: "Embeddings, bases vetoriais (pgvector), divisão em blocos, pesquisa híbrida BM25 + vetores, reordenação, avaliação da recuperação",
    readings: [
      "Lewis et al. (2020), \"Retrieval-Augmented Generation\"",
      "Karpukhin et al. (2020), \"Dense Passage Retrieval\"",
      "Robertson & Zaragoza (2009), \"BM25 and Beyond\"",
      "Liu et al. (2024), \"Lost in the Middle\"",
      "Huyen (2025), cap. 6",
    ],
  },
  {
    id: "M21", num: 21, phase: "F4", weeks: 2,
    title: "Agentes e ferramentas",
    learn: "Chamada de ferramentas, ciclo ReAct, planeamento, memória, Model Context Protocol, multiagentes e quando não usar agentes",
    readings: [
      "Yao et al. (2023), \"ReAct\"",
      "Schick et al. (2023), \"Toolformer\"",
      "Anthropic (2024), \"Building effective agents\"",
      "Especificação do Model Context Protocol",
    ],
  },
  {
    id: "M22", num: 22, phase: "F4", weeks: 2,
    title: "Fine-tuning",
    learn: "Quando ajustar em vez de usar prompts ou RAG, LoRA e QLoRA, quantização, preparação de dados, destilação",
    readings: [
      "Hu et al. (2021), \"LoRA\"",
      "Dettmers et al. (2023), \"QLoRA\"",
      "Hinton, Vinyals & Dean (2015), \"Distilling the Knowledge in a Neural Network\"",
      "Huyen (2025), caps. 7–8",
    ],
  },
  {
    id: "M23", num: 23, phase: "F4", weeks: 2,
    title: "Avaliação de sistemas de IA",
    learn: "Benchmarks e os seus limites, LLM como juiz e os seus vieses, conjuntos de teste próprios, avaliação de RAG e de agentes, testes de regressão",
    readings: [
      "Hendrycks et al. (2021), \"MMLU\"",
      "Liang et al. (2022), \"Holistic Evaluation of Language Models\"",
      "Zheng et al. (2023), \"Judging LLM-as-a-Judge\"",
      "Huyen (2025), caps. 3–4",
    ],
  },
  {
    id: "M24", num: 24, phase: "F4", weeks: 2,
    title: "Multimodal e difusão",
    learn: "Vision Transformers, CLIP, modelos de difusão, texto para imagem, voz para texto",
    readings: [
      "Dosovitskiy et al. (2021), \"An Image is Worth 16x16 Words\"",
      "Radford et al. (2021), \"CLIP\"",
      "Ho, Jain & Abbeel (2020), \"Denoising Diffusion Probabilistic Models\"",
      "Rombach et al. (2022), \"Latent Diffusion Models\"",
    ],
  },
  {
    id: "M25", num: 25, phase: "F5", weeks: 2,
    title: "MLOps e sistemas em produção",
    learn: "Ciclo de vida, versionamento de dados e modelos, CI/CD para ML, monitorização, deriva de dados, observabilidade de LLMs com traces, ciclos de feedback",
    readings: [
      "Sculley et al. (2015), \"Hidden Technical Debt in Machine Learning Systems\"",
      "Huyen, Designing Machine Learning Systems (2022)",
      "Breck et al. (2017), \"The ML Test Score\"",
      "Huyen (2025), cap. 10",
    ],
  },
  {
    id: "M26", num: 26, phase: "F5", weeks: 2,
    title: "Inferência e otimização",
    learn: "Latência e débito, batching, cache KV, quantização, servidores de inferência como o vLLM, descodificação especulativa, custo por pedido",
    readings: [
      "Kwon et al. (2023), \"PagedAttention\"",
      "Dao et al. (2022), \"FlashAttention\"",
      "Leviathan, Kalman & Matias (2023), \"Speculative Decoding\"",
      "Huyen (2025), cap. 9",
    ],
  },
  {
    id: "M27", num: 27, phase: "F5", weeks: 2,
    title: "Segurança e IA responsável",
    learn: "Injeção de prompts, fuga de dados, OWASP Top 10 para LLMs, red teaming, vieses, model cards, RGPD e Regulamento Europeu da IA",
    readings: [
      "Greshake et al. (2023), \"Indirect Prompt Injection\"",
      "Carlini et al. (2021), \"Extracting Training Data from Large Language Models\"",
      "Bender et al. (2021), \"Stochastic Parrots\"",
      "Mitchell et al. (2019), \"Model Cards\"",
      "Regulamento (UE) 2024/1689",
    ],
  },
  {
    id: "M28", num: 28, phase: "F5", weeks: 2,
    title: "Cloud para IA",
    learn: "Amazon Bedrock e SageMaker AI (AWS), Gemini Enterprise Agent Platform, a antiga Vertex AI (Google Cloud), Microsoft Foundry (Azure); quando usar cloud ou servidor próprio; arquiteturas de referência",
    readings: [
      "Documentação oficial de cada plataforma",
      "AWS Well-Architected, lentes de Machine Learning e de IA Generativa",
    ],
  },
  {
    id: "M29", num: 29, phase: "F6", weeks: 6,
    title: "Projeto final",
    learn: "Um sistema de IA escolhido pelo aluno, resolvendo um problema real: dados, modelo ou LLM, avaliação, deploy, monitorização, model card e uma apresentação de 10 minutos",
    readings: [],
  },
  {
    id: "M30", num: 30, phase: "F6", weeks: 6,
    title: "Preparação para certificação",
    learn: "Guia oficial do exame, mapeamento dos domínios para os módulos do curso, laboratórios na cloud escolhida, dois simulados cronometrados e o exame",
    readings: [],
  },
];

export const CERTIFICATIONS: Certification[] = [
  {
    id: "aif-c01", provider: "AWS", level: "Fundamental", role: "opcional",
    name: "AWS Certified AI Practitioner (AIF-C01)",
    format: "90 min, 65 perguntas, 100 USD; existe em português (Brasil); válida 3 anos",
    when: "Opcional, logo após o M19",
    url: "https://aws.amazon.com/certification/certified-ai-practitioner/",
  },
  {
    id: "ai-901", provider: "Microsoft", level: "Fundamental", role: "alternativa",
    name: "Microsoft Azure AI Fundamentals (AI-901)",
    format: "Substituiu o AI-900 em 30/06/2026; preço varia por país",
    when: "Alternativa à AIF-C01, se a escolha for Azure",
    url: "https://learn.microsoft.com/en-gb/credentials/certifications/azure-ai-fundamentals/",
  },
  {
    id: "gcp-genai-leader", provider: "Google Cloud", level: "Fundamental", role: "opcional",
    name: "Google Cloud Generative AI Leader",
    format: "90 min, 99 USD; não avalia programação",
    when: "Opcional, pelo lado de estratégia e marketing",
  },
  {
    id: "nca-genl", provider: "NVIDIA", level: "Associado", role: "recomendada",
    name: "NVIDIA-Certified Associate: Generative AI LLMs (NCA-GENL)",
    format: "1 h, 50–60 perguntas, 125 USD; válida 2 anos",
    when: "Fim da Fase 4: os temas coincidem com os módulos M15 a M23",
    url: "https://www.nvidia.com/en-us/learn/certification/generative-ai-llm-associate/",
  },
  {
    id: "mla-c02", provider: "AWS", level: "Associado", role: "principal",
    name: "AWS Certified Machine Learning Engineer – Associate (MLA-C02)",
    format: "Nova versão com IA generativa e agentes; beta desde 01/09/2026, versão final no início de 2027",
    when: "Fase 6 — a principal",
    url: "https://aws.amazon.com/blogs/training-and-certification/updates-to-aws-certified-machine-learning-engineer-associate-mla-c02/",
  },
  {
    id: "ai-103", provider: "Microsoft", level: "Associado", role: "alternativa",
    name: "Microsoft Azure AI Apps and Agents Developer Associate (AI-103)",
    format: "120 min; existe em português (Brasil); substituiu o AI-102",
    when: "Fase 6, se a escolha for Azure",
    url: "https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-apps-and-agents-developer-associate/",
  },
  {
    id: "databricks-genai", provider: "Databricks", level: "Associado", role: "opcional",
    name: "Databricks Certified Generative AI Engineer Associate",
    format: "Recomenda 6+ meses de prática na plataforma; renovação a cada 2 anos",
    when: "Só se trabalhar com Databricks",
    url: "https://www.databricks.com/learn/certification/genai-engineer-associate",
  },
  {
    id: "aip-c01", provider: "AWS", level: "Profissional", role: "depois",
    name: "AWS Certified Generative AI Developer – Professional (AIP-C01)",
    format: "180 min, 75 perguntas, 300 USD; recomenda 2+ anos a construir aplicações e 1 ano com IA generativa",
    when: "6 a 12 meses depois do curso",
    url: "https://aws.amazon.com/certification/certified-generative-ai-developer-professional/",
  },
  {
    id: "gcp-pmle", provider: "Google Cloud", level: "Profissional", role: "depois",
    name: "Google Cloud Professional Machine Learning Engineer",
    format: "2 h, 50–60 perguntas, 200 USD; só em inglês e japonês; recomenda 3+ anos de experiência",
    when: "Depois do curso, se a escolha for Google Cloud",
    url: "https://cloud.google.com/learn/certification/machine-learning-engineer",
  },
];

export const CERT_WARNING =
  "Cuidado com material antigo: a AWS Machine Learning – Specialty teve o último exame em 31/03/2026, e o AI-102 e o AI-900 da Microsoft foram retirados em 30/06/2026. Preços e versões mudam com frequência; confirmar na página oficial antes de marcar o exame.";

export const BOOKS: Book[] = [
  { title: "Russell & Norvig, *Artificial Intelligence: A Modern Approach*, 4.ª ed. (2020)", purpose: "Visão geral da IA", modules: "M1" },
  { title: "McKinney, *Python for Data Analysis*, 3.ª ed. (2022)", purpose: "NumPy e pandas", modules: "M3" },
  { title: "Deisenroth, Faisal & Ong, *Mathematics for Machine Learning* (2020)", purpose: "Matemática", modules: "M4–M6", href: "https://mml-book.github.io/" },
  { title: "James, Witten, Hastie, Tibshirani & Taylor, *An Introduction to Statistical Learning with Applications in Python* (2023)", purpose: "ML clássico", modules: "M7–M11", href: "https://www.statlearning.com/" },
  { title: "Géron, *Hands-On Machine Learning*, 3.ª ed. (2022)", purpose: "ML na prática", modules: "M7–M13" },
  { title: "Prince, *Understanding Deep Learning* (2023)", purpose: "Deep learning", modules: "M12–M16, M24", href: "https://udlbook.github.io/udlbook/" },
  { title: "Goodfellow, Bengio & Courville, *Deep Learning* (2016)", purpose: "Referência teórica", modules: "M12–M13", href: "https://www.deeplearningbook.org/" },
  { title: "Raschka, *Build a Large Language Model (From Scratch)* (2024)", purpose: "LLMs por dentro", modules: "M16–M17" },
  { title: "Alammar & Grootendorst, *Hands-On Large Language Models* (2024)", purpose: "Aplicações com LLMs", modules: "M17–M22" },
  { title: "Huyen, *AI Engineering* (2025)", purpose: "Engenharia de IA aplicada", modules: "M19–M26" },
  { title: "Huyen, *Designing Machine Learning Systems* (2022)", purpose: "Sistemas em produção", modules: "M25" },
];

export const FREE_COURSES: { title: string; href?: string; modules: string }[] = [
  { title: "Andrej Karpathy, Neural Networks: Zero to Hero — redes e um GPT programados de raiz", href: "https://karpathy.ai/zero-to-hero.html", modules: "M12–M16" },
  { title: "fast.ai, Practical Deep Learning for Coders", href: "https://course.fast.ai/", modules: "M13–M14" },
  { title: "Hugging Face, LLM Course", href: "https://huggingface.co/learn/llm-course", modules: "M17–M22" },
  { title: "Stanford CS229, CS231n e CS224n, aulas gravadas de ML, visão e linguagem", modules: "Fases 2 a 4" },
  { title: "Preparação oficial de exames: AWS Skill Builder, Microsoft Learn, Google Cloud Skills Boost e NVIDIA Deep Learning Institute", modules: "M30" },
];

export const PAID_OPTIONAL =
  "Pagos e opcionais: Machine Learning Specialization e Deep Learning Specialization, da DeepLearning.AI no Coursera.";

export function moduleMeta(id: string): ModuleMeta {
  const m = MODULES.find((x) => x.id === id);
  if (!m) throw new Error(`Módulo desconhecido: ${id}`);
  return m;
}

export function phaseMeta(id: string): PhaseMeta {
  const p = PHASES.find((x) => x.id === id);
  if (!p) throw new Error(`Fase desconhecida: ${id}`);
  return p;
}
