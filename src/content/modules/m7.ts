import type { ModuleContent } from "../types";

// Módulo 7 — Fundamentos de machine learning.
// Fonte: curso-engenharia-ia 2/modulo-07-fundamentos-ml (01-aula, 02-apostila, 03-exercicios, 04-prova, 05-gabarito,
// codigo/exemplos_m7.py e img/). As três imagens da aula entram como figuras; a decomposição viés-variância, escrita em
// LaTeX na aula e na apostila, passa a texto Unicode (não há renderizador de LaTeX). O sobreajuste (polinómios de grau 1
// a 14 nos 15 pontos da aula), o limiar de decisão com a matriz de confusão e a curva ROC (as probabilidades do conjunto
// de teste do Default) e o MAE contra o RMSE têm widgets interativos (src/components/widgets/m7), com a lógica testada
// contra NumPy 2.5 e scikit-learn 1.9. As verificações rápidas, os cartões de revisão e o banco do simulado foram escritos
// pela plataforma a partir da aula, com todo o código corrido em Python 3.13, NumPy 2.5, pandas 3.0 e scikit-learn 1.9
// (dados do repositório do ISLP). O campo `output` de cada bloco da aula e do gabarito tem o resultado real, igual ao dos
// comentários do código.

// ---------------------------------------------------------------- código da aula

const SPLIT_CODE = `import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split

URL = "https://raw.githubusercontent.com/intro-stat-learning/ISLP/main/ISLP/data/"
df = pd.read_csv(URL + "Default.csv")
print(df.shape)                                                      # (10000, 4)
print(df["default"].value_counts(normalize=True).round(4).to_dict())  # {'No': 0.9667, 'Yes': 0.0333}

X = df[["balance", "income"]].assign(student=(df["student"] == "Yes").astype(int))
y = (df["default"] == "Yes").astype(int)                             # 1 = falhou o pagamento

# 1.º corte: 20% para teste, guardados até ao fim
X_resto, X_teste, y_resto, y_teste = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)
# 2.º corte: dos 80% que sobram, 25% (20% do total) para validação
X_treino, X_val, y_treino, y_val = train_test_split(X_resto, y_resto, test_size=0.25, stratify=y_resto, random_state=42)
print(len(X_treino), len(X_val), len(X_teste))                      # 6000 2000 2000
print(round(y_treino.mean(), 4), round(y_val.mean(), 4), round(y_teste.mean(), 4))   # 0.0333 0.033 0.0335`;

const BASE_CODE = `from sklearn.dummy import DummyClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
from sklearn.metrics import accuracy_score

base = DummyClassifier(strategy="most_frequent").fit(X_treino, y_treino)
print(accuracy_score(y_val, base.predict(X_val)))                   # 0.967: "ninguém falha"

modelo = make_pipeline(StandardScaler(), LogisticRegression()).fit(X_treino, y_treino)
print(round(accuracy_score(y_val, modelo.predict(X_val)), 4))       # 0.974`;

const CV_CODE = `from sklearn.model_selection import cross_val_score

auc = cross_val_score(make_pipeline(StandardScaler(), LogisticRegression()),
                      X_resto, y_resto, cv=5, scoring="roc_auc")
print(auc.round(3), round(auc.mean(), 3), round(auc.std(), 3))
# [0.937 0.945 0.945 0.96  0.96 ] 0.949 0.009`;

const POLY_CODE = `from numpy.polynomial import Polynomial

rng = np.random.default_rng(0)
def gerar(n):
    x = rng.uniform(0, 1, n)
    return x, np.sin(2 * np.pi * x) + rng.normal(0, 0.3, n)

x_amostra, y_amostra = gerar(15)      # treino
x_novos, y_novos = gerar(1000)        # dados novos

def rmse(y, previsto):
    return np.sqrt(np.mean((y - previsto) ** 2))

for grau in [1, 3, 9, 14]:
    p = Polynomial.fit(x_amostra, y_amostra, grau)
    print(grau, round(rmse(y_amostra, p(x_amostra)), 3), round(rmse(y_novos, p(x_novos)), 2))
# 1 0.41 0.67          <- subajuste: erra no treino e nos dados novos
# 3 0.195 0.32         <- certo: erro nos dados novos perto do ruído (0,3)
# 9 0.151 1.3          <- sobreajuste: melhor no treino, pior nos dados novos
# 14 0.0 21113.44      <- passa por todos os 15 pontos e é inútil fora deles`;

const BV_CODE = `rng = np.random.default_rng(1)
x_fixo = np.linspace(0, 1, 20)
grelha = np.linspace(0.05, 0.95, 50)              # pontos onde se avaliam as previsões
verdade = np.sin(2 * np.pi * grelha)
for grau in [1, 3, 5, 9, 15]:
    previsoes = []
    for _ in range(500):
        y_sim = np.sin(2 * np.pi * x_fixo) + rng.normal(0, 0.3, 20)
        previsoes.append(Polynomial.fit(x_fixo, y_sim, grau)(grelha))
    previsoes = np.array(previsoes)                 # 500 × 50
    vies2 = np.mean((previsoes.mean(axis=0) - verdade) ** 2)
    variancia = np.mean(previsoes.var(axis=0))
    print(grau, round(vies2, 4), round(variancia, 4), round(vies2 + variancia + 0.09, 3))
# 1 0.1829 0.0077 0.281
# 3 0.0055 0.0131 0.109
# 5 0.0001 0.0203 0.11
# 9 0.0001 0.0376 0.128
# 15 0.0002 0.1015 0.192`;

const THR_CODE = `from sklearn.metrics import confusion_matrix, precision_score, recall_score, f1_score, roc_auc_score

p_teste = modelo.predict_proba(X_teste)[:, 1]      # probabilidade de falhar
for limiar in [0.5, 0.2]:
    previsto = (p_teste >= limiar).astype(int)
    vn, fp, fn, vp = confusion_matrix(y_teste, previsto).ravel()
    print(limiar, vn, fp, fn, vp, round(accuracy_score(y_teste, previsto), 3),
          round(precision_score(y_teste, previsto), 3), round(recall_score(y_teste, previsto), 3),
          round(f1_score(y_teste, previsto), 3))
# 0.5 1924 9 45 22 0.973 0.71 0.328 0.449
# 0.2 1867 66 25 42 0.955 0.389 0.627 0.48`;

const COST_CODE = `def custo(y, p, limiar, custo_fn=1000, custo_fp=50):
    vn, fp, fn, vp = confusion_matrix(y, (p >= limiar).astype(int)).ravel()
    return fn * custo_fn + fp * custo_fp

p_val = modelo.predict_proba(X_val)[:, 1]
limiares = np.arange(0.01, 1.0, 0.01)
melhor = limiares[np.argmin([custo(y_val, p_val, l) for l in limiares])]
print(round(melhor, 2))                                          # 0.05
print(custo(y_teste, p_teste, 0.5), custo(y_teste, p_teste, melhor))   # 45450 20600`;

const AUC_CODE = `print(round(roc_auc_score(y_teste, p_teste), 3))     # 0.947`;

const ERR_CODE = `erros = np.array([1, 1, 1, 1, 10])
print(np.mean(np.abs(erros)), round(np.sqrt(np.mean(erros ** 2)), 2))   # 2.8 4.56`;

const CARSEATS_CODE = `from sklearn.dummy import DummyRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, root_mean_squared_error, r2_score

cs = pd.read_csv(URL + "Carseats.csv")
Xc = pd.get_dummies(cs.drop(columns="Sales"), drop_first=True, dtype=int)   # texto -> colunas 0/1
yc = cs["Sales"]
Xc_treino, Xc_teste, yc_treino, yc_teste = train_test_split(Xc, yc, test_size=0.25, random_state=42)
for nome, m in [("média", DummyRegressor()), ("linear", LinearRegression())]:
    previsto = m.fit(Xc_treino, yc_treino).predict(Xc_teste)
    print(nome, round(mean_absolute_error(yc_teste, previsto), 3),
          round(root_mean_squared_error(yc_teste, previsto), 3), round(r2_score(yc_teste, previsto), 3))
# média 2.418 3.061 -0.017
# linear 0.845 1.036 0.883`;

// ---------------------------------------------------------------- fórmulas (LaTeX na aula, aqui em Unicode)

const F_BV = `E[(y − f̂(x))²] = (E[f̂(x)] − f(x))² + Var(f̂(x)) + σ²
                = viés² + variância + ruído`;

// ---------------------------------------------------------------- código do gabarito

const EX6_CODE = `for estratificar in [False, True]:
    taxas = []
    for semente in range(5):
        _, _, _, y_te = train_test_split(X, y, test_size=0.2, random_state=semente,
                                         stratify=y if estratificar else None)
        taxas.append(round(float(y_te.mean()), 4))
    print(estratificar, taxas)
# False [0.037, 0.0295, 0.0285, 0.0295, 0.0345]
# True [0.0335, 0.0335, 0.0335, 0.0335, 0.0335]`;

const EX7_CODE = `rng = np.random.default_rng(0)
x_amostra, y_amostra = gerar(100)     # primeiro os 100 de treino
x_novos, y_novos = gerar(1000)        # depois os 1000 novos
for grau in [1, 3, 9, 14]:
    p = Polynomial.fit(x_amostra, y_amostra, grau)
    print(grau, round(rmse(y_amostra, p(x_amostra)), 3), round(rmse(y_novos, p(x_novos)), 3))
# 1 0.584 0.538
# 3 0.299 0.318
# 9 0.276 0.322
# 14 0.271 0.324`;

const EX8_CODE = `from sklearn.metrics import PrecisionRecallDisplay, average_precision_score

p_val = modelo.predict_proba(X_val)[:, 1]
for limiar in [0.1, 0.3, 0.5]:
    previsto = (p_val >= limiar).astype(int)
    print(limiar, previsto.sum(), round(precision_score(y_val, previsto), 3),
          round(recall_score(y_val, previsto), 3), round(f1_score(y_val, previsto), 3))
# 0.1 142 0.303 0.652 0.413
# 0.3 68 0.485 0.5 0.493
# 0.5 38 0.684 0.394 0.5
print(round(average_precision_score(y_val, p_val), 3))      # 0.513
PrecisionRecallDisplay.from_predictions(y_val, p_val)`;

const EX9_CODE = `for nome, colunas in [("Price + Advertising", ["Price", "Advertising"]), ("todas", list(Xc.columns))]:
    rmse = -cross_val_score(LinearRegression(), Xc[colunas], yc, cv=5, scoring="neg_root_mean_squared_error")
    print(nome, rmse.round(3), round(rmse.mean(), 3), round(rmse.std(), 3))
# Price + Advertising [2.701 2.439 2.13  2.364 2.383] 2.403 0.183
# todas [1.069 0.984 0.931 1.045 1.151] 1.036 0.075`;

const P13_CODE = `for nome, colunas in [("só balance", ["balance"]), ("três", ["balance", "income", "student"])]:
    auc = cross_val_score(make_pipeline(StandardScaler(), LogisticRegression()),
                          X_resto[colunas], y_resto, cv=5, scoring="roc_auc")
    print(nome, round(auc.mean(), 4), round(auc.std(), 4))
# só balance 0.9482 0.0091
# três 0.9494 0.0091

limiares = np.arange(0.05, 0.96, 0.01)
f1s = [f1_score(y_val, (p_val >= l).astype(int)) for l in limiares]
melhor = limiares[np.argmax(f1s)]
print(round(melhor, 2), round(max(f1s), 3))                        # 0.42 0.539

previsto = (modelo.predict_proba(X_teste)[:, 1] >= melhor).astype(int)
print(previsto.sum(), round(precision_score(y_teste, previsto), 3),
      round(recall_score(y_teste, previsto), 3), round(f1_score(y_teste, previsto), 3))
# 47 0.532 0.373 0.439`;

const ISLR = "https://www.statlearning.com/";

export const M7: ModuleContent = {
  id: "M7",
  duration: "2 semanas, cerca de 6 horas",
  intro:
    "No fim deste módulo deve saber transformar uma pergunta de negócio num problema de machine learning, dividir os dados em treino, validação e teste, reconhecer o sobreajuste e explicar o compromisso viés-variância, e escolher e calcular as métricas certas para classificação e regressão.",
  outcomes: [
    "Transformar uma pergunta de negócio num problema de machine learning",
    "Dividir os dados em treino, validação e teste",
    "Reconhecer o sobreajuste e explicar o compromisso viés-variância",
    "Escolher e calcular as métricas certas para classificação e regressão",
  ],
  goldenRule:
    "Tentar cada exercício antes de abrir o gabarito. Usar um assistente de IA para explicar um erro é válido; pedir-lhe a resposta não é.",
  sessions: [
    {
      id: "w1s1",
      label: "Semana 1 · sessão 1",
      minutes: 90,
      tasks: [
        { id: "t1", text: "Ler as secções 1 e 2", link: { kind: "section", id: "s1" } },
        { id: "t2", text: "Ler James et al. (2023), sec. 2.1", link: { kind: "url", href: ISLR } },
      ],
    },
    {
      id: "w1s2",
      label: "Semana 1 · sessão 2",
      minutes: 90,
      tasks: [
        { id: "t1", text: "Ler a secção 3", link: { kind: "section", id: "s3" } },
        { id: "t2", text: "Ler James et al. (2023), sec. 2.2", link: { kind: "url", href: ISLR } },
        { id: "t3", text: "Exercícios 1 a 4", link: { kind: "tab", tab: "exercicios" } },
      ],
    },
    {
      id: "w2s1",
      label: "Semana 2 · sessão 1",
      minutes: 90,
      tasks: [
        { id: "t1", text: "Ler as secções 4 e 5", link: { kind: "section", id: "s4" } },
        { id: "t2", text: "Exercícios 5 a 8", link: { kind: "tab", tab: "exercicios" } },
      ],
    },
    {
      id: "w2s2",
      label: "Semana 2 · sessão 2",
      minutes: 90,
      tasks: [
        { id: "t1", text: "Exercícios 9 e 10", link: { kind: "tab", tab: "exercicios" } },
        { id: "t2", text: "Rever a apostila", link: { kind: "tab", tab: "apostila" } },
        { id: "t3", text: "Fazer a prova", link: { kind: "tab", tab: "prova" } },
      ],
    },
  ],

  // ---------------------------------------------------------------- AULA
  lesson: [
    {
      id: "s1",
      num: 1,
      title: "Formular um problema de ML: alvo, dados, métrica e linha de base",
      minutes: 20,
      blocks: [
        {
          t: "callout",
          tone: "info",
          title: "Como estudar este módulo",
          text: "A Fase 2 é a mais prática até agora: cada ideia vem com dados reais e código do scikit-learn. As técnicas de estudo da Fase 1 continuam a valer (recuperação no início de cada sessão, sessões espaçadas, explicar cada passo por palavras suas). Este módulo tem duas semanas, com quatro sessões.",
        },
        {
          t: "callout",
          tone: "info",
          title: "O livro e o código desta fase",
          text: "O livro principal desta fase é *An Introduction to Statistical Learning with Applications in Python* (James, Witten, Hastie, Tibshirani & Taylor, 2023), gratuito em [statlearning.com](https://www.statlearning.com/). Os conjuntos de dados vêm do repositório oficial do livro no GitHub, por isso os números que vai obter são comparáveis com os do livro. O código foi testado com scikit-learn 1.9. No Colab, confirme a versão com `import sklearn; print(sklearn.__version__)`. Todo o código deste módulo funciona a partir da versão 1.4.",
        },
        {
          t: "p",
          text: "A maior parte dos projetos de ML que falham não falham no algoritmo: falham antes, na forma como o problema foi posto. \"Usar IA para reduzir o crédito mal parado\" não é um problema de ML. \"Prever, no fim de cada mês, quais os clientes de cartão de crédito que vão falhar o pagamento seguinte, para a equipa de risco os contactar\" já é.",
        },
        { t: "h3", text: "Seis perguntas antes de escrever código" },
        {
          t: "table",
          head: ["Pergunta", "No exemplo do cartão de crédito"],
          rows: [
            ["Que decisão a previsão vai apoiar?", "Contactar ou não um cliente antes de ele falhar"],
            ["Qual é o alvo, exatamente?", "`default`: falhou o pagamento seguinte (sim ou não). É classificação binária"],
            ["Qual é a unidade e o momento da previsão?", "Um cliente, no fim de cada mês"],
            ["Que dados existem **nesse momento**?", "Saldo do cartão, rendimento, se é estudante. Não vale usar nada que só se saiba depois"],
            ["Quanto custa cada tipo de erro?", "Um incumpridor não detetado custa muito mais do que um telefonema escusado"],
            ["Qual é a linha de base?", "A regra mais simples possível, que qualquer modelo tem de bater"],
          ],
        },
        {
          t: "p",
          text: "A quarta pergunta é a que mais vezes se esquece. Se um modelo usar uma variável que só existe depois do acontecimento, como \"número de cartas de cobrança enviadas\", terá resultados excelentes nos dados históricos e inúteis na prática. Chama-se **fuga de dados** e é o tema central do M11.",
        },
        { t: "h3", text: "O que um bom praticante sabe" },
        {
          t: "p",
          text: "Domingos (2012) resumiu, num artigo curto que vale a pena ler inteiro, as lições que os livros costumam deixar implícitas. Quatro delas guiam este módulo:",
        },
        {
          t: "list",
          ordered: true,
          items: [
            "**O que conta é a generalização.** Acertar nos dados de treino é fácil; o objetivo é acertar em casos novos (secções 2 e 3).",
            "**O sobreajuste tem muitas caras.** Um modelo pode decorar o ruído dos dados em vez de aprender o padrão (secção 3).",
            "**As variáveis certas valem mais do que o algoritmo.** Conhecer o negócio para escolher e construir boas variáveis é metade do trabalho (M11).",
            "**Mais dados costumam bater um algoritmo mais esperto.** Antes de complicar o modelo, vale a pena perguntar se há mais ou melhores dados.",
          ],
        },
        { t: "h3", text: "Os dados deste módulo" },
        {
          t: "p",
          text: "O conjunto `Default`, do livro de James et al. (2023), tem 10 000 clientes de cartão de crédito, simulados mas realistas: saldo médio no cartão (`balance`), rendimento anual (`income`), se é estudante (`student`) e se falhou o pagamento (`default`). Só 3,3% falharam.",
        },
        { t: "h3", text: "A linha de base" },
        {
          t: "p",
          text: "A linha de base mais simples para classificação é prever sempre a classe mais frequente. Aqui, dizer \"ninguém vai falhar\" acerta em 96,7% dos casos, e não serve para nada: não apanha um único incumpridor. Guarde este número. Vai mostrar, na secção 4, porque é que a percentagem de acertos pode enganar, e liga diretamente à proporção de base do M6.",
        },
        {
          t: "p",
          text: "Para regressão, a linha de base equivalente é prever sempre a média do treino. Um modelo que não bate a sua linha de base não está a aprender nada útil, por mais sofisticado que seja.",
        },
        {
          t: "check",
          id: "qc1",
          q: "Um modelo de risco de crédito usa a variável \"número de cartas de cobrança enviadas no mês seguinte\" e tem resultados excelentes nos dados históricos. Qual é o problema?",
          options: [
            "É uma variável de contagem e o modelo precisa de variáveis contínuas.",
            "Os resultados são excelentes, por isso não há problema.",
            "Só existe depois do acontecimento que se quer prever: é fuga de dados.",
            "Faltava comparar com a linha de base da média do treino.",
          ],
          answer: 2,
          explain:
            "No momento da previsão (fim do mês) essa variável ainda não existe: é uma consequência do incumprimento. O modelo parece excelente nos dados históricos e é inútil na prática. A linha de base da média é a de regressão; aqui o problema é de classificação.",
        },
      ],
    },
    {
      id: "s2",
      num: 2,
      title: "Treino, validação e teste, e validação cruzada",
      minutes: 35,
      blocks: [
        {
          t: "p",
          text: "Para saber se um modelo generaliza, é preciso testá-lo em dados que ele nunca viu. A forma mais simples é dividir os dados em três partes, cada uma com o seu papel:",
        },
        {
          t: "table",
          head: ["Conjunto", "Para quê", "Analogia"],
          rows: [
            ["Treino (60%)", "O modelo aprende com estes dados", "Os exercícios das aulas"],
            ["Validação (20%)", "Comparar modelos e escolher parâmetros", "O teste de preparação"],
            ["Teste (20%)", "Medir o desempenho final, **uma única vez**, no fim", "O exame"],
          ],
        },
        {
          t: "p",
          text: "Se o teste for usado para escolher entre modelos, deixa de ser um exame: as escolhas acabam afinadas para esses dados em particular, e a estimativa final fica otimista.",
        },
        {
          t: "code",
          title: "Dividir o Default em treino, validação e teste",
          code: SPLIT_CODE,
          output: "(10000, 4)\n{'No': 0.9667, 'Yes': 0.0333}\n6000 2000 2000\n0.0333 0.033 0.0335",
        },
        {
          t: "p",
          text: "Dois pormenores importantes. `stratify=y` garante que os três conjuntos têm a mesma proporção de incumpridores; sem isso, com uma classe tão rara, um dos conjuntos podia ficar com muito poucos. `random_state=42` fixa o sorteio, para que os resultados sejam reprodutíveis.",
        },
        { t: "h3", text: "A interface do scikit-learn" },
        {
          t: "p",
          text: "O scikit-learn (Pedregosa et al., 2011) tornou-se a biblioteca padrão de ML clássico em Python, em boa parte por causa de uma interface uniforme (Buitinck et al., 2013). Todos os modelos funcionam da mesma forma:",
        },
        {
          t: "list",
          items: [
            "`modelo.fit(X, y)` treina;",
            "`modelo.predict(X)` dá previsões;",
            "`modelo.predict_proba(X)` dá probabilidades, nos classificadores;",
            "os **transformadores**, como o `StandardScaler`, que padroniza as colunas como no M5, têm `fit` e `transform`;",
            "`make_pipeline` encadeia transformadores e um modelo num só objeto, que se usa como um modelo. O M11 explica porque é que isto evita erros graves.",
          ],
        },
        { t: "code", title: "Linha de base e regressão logística", code: BASE_CODE, output: "0.967\n0.974" },
        {
          t: "p",
          text: "A regressão logística, que se estuda no M8, passa de 96,7% para 97,4% de acertos na validação. Parece pouco, e a secção 4 mostra que a percentagem de acertos é a métrica errada para este problema.",
        },
        { t: "h3", text: "Validação cruzada" },
        {
          t: "p",
          text: "Um único conjunto de validação tem dois problemas: deixa de fora dados que podiam servir para treinar e dá uma estimativa que depende de quais casos calharam lá. A **validação cruzada com k partes** (*k-fold cross-validation*) resolve os dois (James et al., 2023, sec. 5.1):",
        },
        {
          t: "list",
          ordered: true,
          items: [
            "dividir os dados em k partes iguais (tipicamente 5 ou 10);",
            "treinar k vezes, de cada vez com k − 1 partes, e avaliar na parte que ficou de fora;",
            "reportar a média e o desvio padrão das k avaliações.",
          ],
        },
        { t: "p", text: "Cada exemplo é usado para avaliar exatamente uma vez, e o desvio padrão mostra quanto a estimativa varia." },
        { t: "code", title: "Validação cruzada com 5 partes", code: CV_CODE, output: "[0.937 0.945 0.945 0.96  0.96 ] 0.949 0.009" },
        {
          t: "p",
          text: "A validação cruzada usa `X_resto` (treino mais validação); o teste continua guardado. A métrica `roc_auc` explica-se na secção 4. Com classificadores, `cv=5` usa automaticamente divisões estratificadas.",
        },
        {
          t: "p",
          text: "Na prática: com muitos dados (centenas de milhares de linhas), uma divisão simples em treino, validação e teste chega e é mais rápida. Com poucos dados, use validação cruzada para comparar modelos e guarde mesmo assim um teste final. O M11 trata dos casos especiais: dados com ordem temporal, vários registos do mesmo cliente e afinação de parâmetros.",
        },
        {
          t: "check",
          id: "qc2",
          q: "A validação cruzada da aula corre em `X_resto`, que tem 8000 clientes, com `cv=5`. Em cada uma das cinco rondas, com quantos clientes treina o modelo e em quantos é avaliado?",
          options: ["Treina com 6400 e avalia em 1600", "Treina com 8000 e avalia em 1600", "Treina com 1600 e avalia em 6400", "Treina com 6000 e avalia em 2000"],
          answer: 0,
          explain:
            "As 8000 linhas dividem-se em 5 partes de 1600. Em cada ronda treina-se com k − 1 = 4 partes (6400) e avalia-se na que ficou de fora (1600). No fim, cada cliente foi usado para avaliar exatamente uma vez. 6000 e 2000 são o treino e a validação da divisão simples.",
        },
      ],
    },
    {
      id: "s3",
      num: 3,
      title: "Generalização, sobreajuste e o compromisso viés-variância",
      minutes: 40,
      blocks: [
        { t: "p", text: "Um modelo **generaliza** quando acerta em casos novos, não só nos de treino. As duas formas de falhar têm nome:" },
        {
          t: "list",
          items: [
            "**Subajuste** (*underfitting*): o modelo é demasiado simples para o padrão e erra tanto no treino como em dados novos.",
            "**Sobreajuste** (*overfitting*): o modelo é tão flexível que decora o ruído do treino. Erra pouco no treino e muito em dados novos.",
          ],
        },
        { t: "h3", text: "Uma experiência controlada" },
        {
          t: "p",
          text: "Para ver isto com clareza, usam-se dados simulados, em que se conhece a verdade: o padrão é y = sin(2πx), mais ruído normal com desvio padrão 0,3. Há 15 pontos para treinar e 1000 pontos novos para testar. O modelo é um polinómio, ajustado por mínimos quadrados como no mini-projeto da Fase 1; o grau controla a flexibilidade.",
        },
        {
          t: "code",
          title: "Polinómios de grau 1, 3, 9 e 14",
          code: POLY_CODE,
          output: "1 0.41 0.67\n3 0.195 0.32\n9 0.151 1.3\n14 0.0 21113.44",
        },
        {
          t: "p",
          text: "`Polynomial.fit` é a forma numérica estável de ajustar polinómios no NumPy: reescala x antes de calcular as potências, o que evita os problemas de arredondamento do M2.",
        },
        {
          t: "figure",
          src: "img/01-sobreajuste.png",
          alt: "Pouco, certo e demasiado flexível: ajustes de grau 1, 3 e 9, e erros de treino e de teste por grau",
        },
        {
          t: "p",
          text: "O gráfico da direita resume a lição mais importante desta fase. O erro de treino desce sempre que o modelo fica mais flexível. O erro em dados novos desce até certo ponto e depois sobe. Por isso nunca se escolhe um modelo pelo erro de treino; escolhe-se pelo erro de validação.",
        },
        {
          t: "widget",
          name: "m7-sobreajuste",
          caption:
            "Os 15 pontos de treino e os 1000 pontos novos do código acima, com polinómios de grau 1 a 14 ajustados como o `Polynomial.fit`. Os erros são os do NumPy; o gráfico da direita está em escala log.",
        },
        { t: "h3", text: "O compromisso viés-variância" },
        {
          t: "p",
          text: "O erro esperado de um modelo num ponto novo decompõe-se em três partes (James et al., 2023, sec. 2.2.2; Geman, Bienenstock & Doursat, 1992):",
        },
        { t: "code", title: "Fórmula", code: F_BV },
        {
          t: "list",
          items: [
            "O **viés** é o erro sistemático: quanto o modelo médio, treinado em muitas amostras diferentes, fica longe da verdade. Um modelo demasiado simples tem viés alto.",
            "A **variância** é quanto o modelo muda de amostra para amostra. Um modelo demasiado flexível tem variância alta: segue o ruído de cada amostra.",
            "O **ruído** é o erro irredutível: nenhum modelo o elimina. Aqui é 0,3² = 0,09.",
          ],
        },
        {
          t: "p",
          text: "As duas primeiras partes medem-se por simulação: treinar o mesmo tipo de modelo em 500 amostras diferentes e ver como variam as previsões. Para isolar o efeito do ruído, os 20 valores de x ficam fixos e só o ruído muda de amostra para amostra.",
        },
        {
          t: "code",
          title: "Viés e variância por simulação",
          code: BV_CODE,
          output: "1 0.1829 0.0077 0.281\n3 0.0055 0.0131 0.109\n5 0.0001 0.0203 0.11\n9 0.0001 0.0376 0.128\n15 0.0002 0.1015 0.192",
        },
        {
          t: "figure",
          src: "img/02-vies-variancia.png",
          alt: "Viés ao quadrado, variância e erro esperado por grau do polinómio",
        },
        {
          t: "p",
          text: "O viés cai a pique até ao grau 3 e fica praticamente zero; a variância sobe sempre. O erro total é mínimo entre os graus 3 e 5. Ganhar flexibilidade troca viés por variância, e o melhor modelo é o que equilibra as duas.",
        },
        { t: "h3", text: "O que fazer com isto" },
        {
          t: "table",
          head: ["Sintoma", "Diagnóstico", "O que ajuda"],
          rows: [
            ["Erro alto no treino e na validação", "Viés alto (subajuste)", "Modelo mais flexível; melhores variáveis"],
            ["Erro baixo no treino, alto na validação", "Variância alta (sobreajuste)", "Mais dados; modelo mais simples; regularização (M8); ensembles (M9)"],
            ["Erros parecidos e perto do ruído", "Bom equilíbrio", "Parar de afinar e testar"],
          ],
        },
        {
          t: "p",
          text: "Uma curiosidade para mais tarde: redes neuronais muito grandes podem ter, depois da subida, uma segunda descida do erro de teste, o fenómeno a que Belkin et al. (2019) chamaram *double descent*. Isso não anula o compromisso viés-variância; mostra que, em modelos enormes, há mais coisas em jogo. Volta-se a isto no M13.",
        },
        {
          t: "check",
          id: "qc3",
          q: "Num problema com ruído de cerca de 0,3, um modelo tem RMSE de 0,05 no treino e de 0,9 na validação. O que tem mais probabilidade de ajudar?",
          options: [
            "Um modelo mais flexível.",
            "Acrescentar potências mais altas das variáveis.",
            "Parar de afinar e avaliar no teste.",
            "Mais dados, um modelo mais simples ou regularização.",
          ],
          answer: 3,
          explain:
            "Treino muito abaixo do ruído e validação muito acima: variância alta (sobreajuste). Ajuda mais dados, um modelo mais simples, regularização (M8) ou ensembles (M9). Um modelo mais flexível ou mais potências agravariam o problema; parar de afinar é para quando os dois erros estão perto do ruído.",
        },
      ],
    },
    {
      id: "s4",
      num: 4,
      title: "Métricas de classificação",
      minutes: 50,
      blocks: [
        {
          t: "p",
          text: "Na secção 2, prever \"ninguém falha\" acertava 96,7% e a regressão logística 97,4%. A percentagem de acertos, a **exatidão** (*accuracy*), esconde o que interessa: quantos incumpridores o modelo apanha, e a que custo.",
        },
        { t: "h3", text: "A matriz de confusão" },
        { t: "p", text: "Toda a avaliação de um classificador binário parte de quatro contagens:" },
        {
          t: "table",
          head: ["", "Previsto: não falha", "Previsto: falha"],
          rows: [
            ["**Real: não falha**", "Verdadeiro negativo (VN)", "Falso positivo (FP)"],
            ["**Real: falha**", "Falso negativo (FN)", "Verdadeiro positivo (VP)"],
          ],
        },
        { t: "p", text: "Delas saem as métricas principais:" },
        {
          t: "table",
          head: ["Métrica", "Fórmula", "Pergunta a que responde"],
          rows: [
            ["Exatidão", "(VP + VN) / total", "Que fração das previsões está certa?"],
            ["Precisão", "VP / (VP + FP)", "Dos que o modelo marcou, quantos falham mesmo?"],
            ["Revocação (sensibilidade)", "VP / (VP + FN)", "Dos que falham, quantos o modelo apanhou?"],
            ["F1", "2 · precisão · revocação / (precisão + revocação)", "Um equilíbrio entre as duas"],
          ],
        },
        {
          t: "p",
          text: "Repare na ligação ao M6: a precisão é P(falha | alerta) e a revocação é P(alerta | falha). Quando a classe positiva é rara, as duas podem ser muito diferentes.",
        },
        { t: "h3", text: "O limiar de decisão" },
        {
          t: "p",
          text: "A regressão logística dá uma probabilidade; `predict` usa o limiar 0,5 para a transformar em sim ou não. Esse limiar não tem nada de especial, e mudá-lo muda tudo:",
        },
        {
          t: "code",
          title: "Matriz de confusão e métricas com os limiares 0,5 e 0,2",
          code: THR_CODE,
          output: "0.5 1924 9 45 22 0.973 0.71 0.328 0.449\n0.2 1867 66 25 42 0.955 0.389 0.627 0.48",
        },
        {
          t: "p",
          text: "Com o limiar 0,5, o modelo apanha só 22 dos 67 incumpridores do teste: revocação de 33%. Baixando o limiar para 0,2, apanha 42 (63%), à custa de mais falsos alarmes (66 em vez de 9). A exatidão até desce, e o modelo ficou mais útil.",
        },
        { t: "h3", text: "Escolher o limiar pelo custo" },
        {
          t: "p",
          text: "O limiar certo depende do custo de cada erro, uma decisão de negócio. Suponha que um incumpridor não detetado custa 1000 € e que um telefonema escusado custa 50 €. O limiar escolhe-se na **validação**, nunca no teste:",
        },
        { t: "code", title: "O limiar com menor custo, escolhido na validação", code: COST_CODE, output: "0.05\n45450 20600" },
        {
          t: "p",
          text: "No teste, o limiar escolhido corta o custo para menos de metade. Há uma fórmula que confirma o resultado: se as probabilidades forem fiáveis, o limiar ótimo é custo_FP / (custo_FP + custo_FN) = 50 / 1050 ≈ 0,048. Quando um erro é 20 vezes mais caro do que o outro, vale a pena agir mesmo com uma probabilidade de 5%.",
        },
        { t: "h3", text: "Curva ROC e AUC" },
        {
          t: "p",
          text: "Para avaliar o modelo sem escolher um limiar, olha-se para todos ao mesmo tempo. A **curva ROC** desenha a taxa de verdadeiros positivos (a revocação) contra a taxa de falsos positivos (FP / (FP + VN)), para todos os limiares. A **AUC** é a área debaixo dela, e tem uma leitura simples: é a probabilidade de o modelo dar uma pontuação maior a um incumpridor escolhido ao acaso do que a um cumpridor escolhido ao acaso (Fawcett, 2006). Vale 0,5 para um modelo ao acaso e 1 para um perfeito.",
        },
        { t: "code", title: "AUC no teste", code: AUC_CODE, output: "0.947" },
        {
          t: "figure",
          src: "img/03-roc-e-limiar.png",
          alt: "À esquerda, a curva ROC com os limiares 0,5 e 0,2 marcados; à direita, precisão e revocação em função do limiar",
        },
        {
          t: "p",
          text: "Com classes muito desequilibradas, a AUC pode parecer excelente enquanto a precisão é fraca, porque os muitos verdadeiros negativos tornam a taxa de falsos positivos pequena. Nesses casos, a curva de precisão-revocação e o seu resumo, a precisão média (`average_precision_score`), são mais informativos (Saito & Rehmsmeier, 2015). Aqui, a precisão média é 0,507, para uma linha de base de 0,034 (a proporção de incumpridores).",
        },
        {
          t: "widget",
          name: "m7-limiar",
          caption:
            "As 2000 probabilidades que o modelo da aula dá ao conjunto de teste (`p_teste`). Mude o limiar e veja a matriz de confusão, as métricas, o ponto na curva ROC e o custo. Com 0,5 e 0,2 obtém as duas linhas do código acima.",
        },
        { t: "h3", text: "Que métrica usar" },
        {
          t: "table",
          head: ["Situação", "Métrica principal"],
          rows: [
            ["Classes equilibradas, erros com custo parecido", "Exatidão ou F1"],
            ["Falhar um positivo é caro (fraude, doença, abandono)", "Revocação, com um mínimo de precisão"],
            ["Um falso alarme é caro (bloquear um cliente bom)", "Precisão"],
            ["Comparar modelos sem escolher limiar", "AUC; com classes raras, precisão média"],
            ["Há custos conhecidos", "O custo total, como acima"],
          ],
        },
        {
          t: "p",
          text: "Com mais de duas classes, calcula-se cada métrica por classe e faz-se a média: `average=\"macro\"` dá o mesmo peso a todas as classes; `average=\"weighted\"` pesa-as pelo tamanho.",
        },
        {
          t: "check",
          id: "qc4",
          q: "No teste da aula, com o limiar 0,2: VN = 1867, FP = 66, FN = 25 e VP = 42. Qual é a precisão?",
          options: ["0,627", "0,389", "0,955", "0,48"],
          answer: 1,
          explain:
            "Precisão = VP / (VP + FP) = 42 / 108 ≈ 0,389: dos 108 clientes marcados, só 39% falham mesmo. 0,627 é a revocação (42 / 67), 0,955 a exatidão e 0,48 o F1.",
        },
      ],
    },
    {
      id: "s5",
      num: 5,
      title: "Métricas de regressão",
      minutes: 30,
      blocks: [
        {
          t: "p",
          text: "Em regressão, o erro de cada previsão é uma distância: o valor real menos o previsto. As métricas diferem na forma de juntar esses erros:",
        },
        {
          t: "table",
          head: ["Métrica", "Fórmula", "Leitura"],
          rows: [
            ["MAE (erro absoluto médio)", "média de |y − ŷ|", "O erro típico, nas unidades do alvo"],
            ["RMSE (raiz do erro quadrático médio)", "√(média de (y − ŷ)²)", "Também nas unidades do alvo, mas pesa mais os erros grandes"],
            ["R²", "1 − EQM / Var(y)", "Fração da variação explicada; 0 é a linha de base da média"],
          ],
        },
        { t: "p", text: "A diferença entre MAE e RMSE vê-se com cinco erros, um deles grande:" },
        { t: "code", title: "MAE e RMSE", code: ERR_CODE, output: "2.8 4.56" },
        {
          t: "p",
          text: "O RMSE eleva os erros ao quadrado antes de fazer a média, por isso um erro de 10 pesa 100 vezes mais do que um erro de 1. Use o RMSE quando um erro grande é desproporcionadamente mau (rupturas de stock, por exemplo); use o MAE quando o custo cresce em linha reta com o erro, ou quando há valores extremos nos dados que não devem dominar a avaliação.",
        },
        {
          t: "widget",
          name: "m7-mae-rmse",
          caption: "Os cinco erros do código acima, ou outros à escolha. As barras mostram quanto cada erro pesa na soma dos erros absolutos (MAE) e na soma dos quadrados (RMSE).",
        },
        { t: "h3", text: "Exemplo: vendas de cadeiras de bebé para o carro" },
        {
          t: "p",
          text: "O conjunto `Carseats`, também de James et al. (2023), tem as vendas, simuladas mas realistas, de cadeirinhas de bebé para o carro em 400 lojas, em milhares de unidades, com o preço, o investimento em publicidade, o preço da concorrência, a qualidade da posição na prateleira e dados da população local:",
        },
        {
          t: "code",
          title: "Linha de base e regressão linear no Carseats",
          code: CARSEATS_CODE,
          output: "média 2.418 3.061 -0.017\nlinear 0.845 1.036 0.883",
        },
        {
          t: "p",
          text: "`pd.get_dummies` transforma as colunas de texto (posição na prateleira, zona urbana, EUA) em colunas de zeros e uns, um tema que o M8 e o M11 aprofundam. A regressão linear erra, em média, 845 cadeiras por loja, contra 2418 da linha de base, e explica 88% da variação das vendas. O R² da linha de base é ligeiramente negativo: no teste, a média do treino é um pouco pior do que a média do próprio teste, que é a referência do R².",
        },
        { t: "h3", text: "Cuidados" },
        {
          t: "list",
          items: [
            "**Reportar sempre nas unidades do negócio.** \"Erramos, em média, 845 unidades por loja\" diz mais a um gestor do que \"R² = 0,88\".",
            "**Comparar sempre com a linha de base**, nos mesmos dados.",
            "**Desconfiar do erro percentual médio (MAPE)** quando há valores reais perto de zero: dividir por um número pequeno faz o erro explodir.",
            "**O R² só se compara entre modelos no mesmo conjunto de dados.** Um R² de 0,3 pode ser excelente num problema difícil e um de 0,9 pode ser fraco num fácil.",
          ],
        },
        {
          t: "check",
          id: "qc5",
          q: "Os erros de um modelo eram 2, 2, 2, 2 e 2 unidades. Numa semana má, o último passa a 12 (os outros ficam iguais). O que acontece ao MAE e ao RMSE?",
          options: [
            "O MAE sobe de 2 para 4 e o RMSE fica igual.",
            "Os dois sobem o mesmo, de 2 para 4.",
            "O MAE sobe de 2 para 4 e o RMSE de 2 para cerca de 5,66.",
            "O RMSE sobe de 2 para 4 e o MAE de 2 para cerca de 5,66.",
          ],
          answer: 2,
          explain:
            "MAE = (2 + 2 + 2 + 2 + 12) / 5 = 4. RMSE = √((4 + 4 + 4 + 4 + 144) / 5) = √32 ≈ 5,66. Com os cinco erros iguais, os dois valiam 2; o erro grande pesa muito mais no RMSE, porque se eleva ao quadrado antes da média.",
        },
      ],
    },
  ],

  readings: {
    required: [
      {
        text: "James, G., Witten, D., Hastie, T., Tibshirani, R. & Taylor, J. (2023). [*An Introduction to Statistical Learning with Applications in Python*](https://www.statlearning.com/). Springer. Cap. 2 (o que é aprendizagem estatística, viés e variância), sec. 4.4 (matriz de confusão e ROC) e sec. 5.1 (validação cruzada). Gratuito.",
        href: "https://www.statlearning.com/",
      },
      {
        text: "Géron, A. (2022). *Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow* (3.ª ed.). O'Reilly. Caps. 1 a 3: o panorama do ML, um projeto completo de ponta a ponta e as métricas de classificação.",
      },
      {
        text: "Domingos, P. (2012). A few useful things to know about machine learning. *Communications of the ACM*, 55(10), 78–87.",
      },
    ],
    complementary: [
      { text: "StatQuest (Josh Starmer): \"Machine Learning Fundamentals: Bias and Variance\" e \"ROC and AUC, Clearly Explained!\"." },
      {
        text: "Hastie, T., Tibshirani, R. & Friedman, J. (2009). [*The Elements of Statistical Learning*](https://hastie.su.domains/ElemStatLearn/) (2.ª ed.). Springer. Cap. 7 (avaliação e seleção de modelos). Gratuito.",
        href: "https://hastie.su.domains/ElemStatLearn/",
      },
      {
        text: "Documentação do scikit-learn: [Model evaluation](https://scikit-learn.org/stable/modules/model_evaluation.html), com todas as métricas e quando usar cada uma.",
        href: "https://scikit-learn.org/stable/modules/model_evaluation.html",
      },
    ],
    cited: [
      "Geman, S., Bienenstock, E. & Doursat, R. (1992). Neural networks and the bias/variance dilemma. *Neural Computation*, 4(1), 1–58.",
      "Fawcett, T. (2006). An introduction to ROC analysis. *Pattern Recognition Letters*, 27(8), 861–874.",
      "Pedregosa, F. et al. (2011). Scikit-learn: machine learning in Python. *Journal of Machine Learning Research*, 12, 2825–2830.",
      "Buitinck, L. et al. (2013). [API design for machine learning software: experiences from the scikit-learn project](https://arxiv.org/abs/1309.0238). arXiv:1309.0238.",
      "Saito, T. & Rehmsmeier, M. (2015). The precision-recall plot is more informative than the ROC plot when evaluating binary classifiers on imbalanced datasets. *PLoS ONE*, 10(3), e0118432.",
      "Belkin, M., Hsu, D., Ma, S. & Mandal, S. (2019). Reconciling modern machine-learning practice and the classical bias–variance trade-off. *Proceedings of the National Academy of Sciences*, 116(32), 15849–15854.",
    ],
  },

  // ---------------------------------------------------------------- APOSTILA (02-apostila.md)
  apostila: {
    intro:
      "Resumo para rever antes da prova. Use-o também para a prática de recuperação: tape a coluna da direita das tabelas e tente lembrar-se.",
    sections: [
      {
        title: "Formular o problema",
        blocks: [
          {
            t: "list",
            ordered: true,
            items: [
              "Que decisão a previsão apoia?",
              "Qual é o alvo exato, e é classificação ou regressão?",
              "Qual é a unidade e o momento da previsão?",
              "Que dados existem nesse momento? (Nada que só se saiba depois: fuga de dados.)",
              "Quanto custa cada tipo de erro?",
              "Qual é a linha de base? (Classe mais frequente; média.)",
            ],
          },
        ],
      },
      {
        title: "Conceitos",
        blocks: [
          {
            t: "table",
            head: ["Conceito", "Em poucas palavras"],
            rows: [
              ["Treino / validação / teste", "Aprender / escolher / medir uma vez no fim"],
              ["Estratificar", "Manter a proporção das classes em cada parte"],
              ["Validação cruzada k-fold", "k treinos, cada parte avalia uma vez; média e desvio padrão"],
              ["Generalização", "Desempenho em dados novos"],
              ["Subajuste", "Demasiado simples: erra no treino e na validação (viés alto)"],
              ["Sobreajuste", "Demasiado flexível: decora o ruído; treino bom, validação má (variância alta)"],
              ["Viés", "Erro sistemático do modelo médio"],
              ["Variância", "Quanto o modelo muda de amostra para amostra"],
              ["Ruído irredutível", "Erro que nenhum modelo elimina"],
            ],
          },
          { t: "code", title: "Fórmula", code: "E[(y − f̂(x))²] = viés² + variância + σ²" },
        ],
      },
      {
        title: "Métricas de classificação",
        blocks: [
          {
            t: "table",
            head: ["Métrica", "Fórmula"],
            rows: [
              ["Exatidão", "(VP + VN) / total"],
              ["Precisão", "VP / (VP + FP)"],
              ["Revocação", "VP / (VP + FN)"],
              ["Taxa de falsos positivos", "FP / (FP + VN)"],
              ["F1", "2PR / (P + R)"],
              ["AUC", "P(pontuação de um positivo > pontuação de um negativo); 0,5 = acaso"],
              ["Limiar ótimo pelo custo", "custo_FP / (custo_FP + custo_FN), se as probabilidades forem fiáveis"],
            ],
          },
          { t: "p", text: "Com classes raras: a exatidão engana; prefira revocação e precisão, precisão média ou custo total." },
        ],
      },
      {
        title: "Métricas de regressão",
        blocks: [
          {
            t: "table",
            head: ["Métrica", "Quando usar"],
            rows: [
              ["MAE", "Custo linear no erro; robusta a valores extremos"],
              ["RMSE", "Erros grandes são desproporcionadamente maus"],
              ["R²", "Fração explicada; só se compara no mesmo conjunto de dados"],
            ],
          },
        ],
      },
      {
        title: "Código",
        blocks: [
          {
            t: "code",
            title: "Código",
            code: `from sklearn.model_selection import train_test_split, cross_val_score
X_resto, X_teste, y_resto, y_teste = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)
modelo = make_pipeline(StandardScaler(), LogisticRegression()).fit(X_treino, y_treino)
p = modelo.predict_proba(X_val)[:, 1]             # probabilidade da classe 1
previsto = (p >= limiar).astype(int)
cross_val_score(modelo, X_resto, y_resto, cv=5, scoring="roc_auc")
# métricas: accuracy_score, precision_score, recall_score, f1_score, roc_auc_score,
# average_precision_score, confusion_matrix(...).ravel() -> vn, fp, fn, vp,
# mean_absolute_error, root_mean_squared_error, r2_score
# linhas de base: DummyClassifier(strategy="most_frequent"), DummyRegressor()`,
          },
        ],
      },
      {
        title: "Seis erros comuns",
        blocks: [
          {
            t: "list",
            ordered: true,
            items: [
              "Escolher o modelo, ou o limiar, olhando para o teste.",
              "Avaliar só com a exatidão num problema com classes raras.",
              "Não comparar com uma linha de base.",
              "Usar variáveis que só se conhecem depois do momento da previsão.",
              "Esquecer `stratify` quando uma classe é rara.",
              "Reportar métricas sem as traduzir para unidades e custos do negócio.",
            ],
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------- EXERCÍCIOS (03-exercicios.md + 05-gabarito.md)
  exerciseParts: [
    {
      id: "A",
      title: "Parte A — Conceitos",
      note: "Dez exercícios, cerca de 3 horas no total. Os da Parte A fazem-se à mão (pode usar calculadora).",
    },
    {
      id: "B",
      title: "Parte B — Colab",
      note: "Os da Parte B partem do código da aula, no Colab, num notebook chamado \"M7 — exercícios\". Corra primeiro os exemplos da aula no mesmo notebook: as soluções usam as variáveis da aula (`X`, `y`, `X_resto`, `X_treino`, `X_val`, `X_teste`, `modelo`, `URL`, `Xc`, `yc`).",
    },
    { id: "C", title: "Parte C — Aplicação" },
  ],
  exercises: [
    {
      id: "e1",
      num: 1,
      part: "A",
      session: "w1s2",
      kind: "text",
      title: "Três perguntas de negócio",
      minutes: 20,
      sections: ["s1", "s4", "s5"],
      prompt: [
        {
          t: "p",
          text: "Para cada pergunta de negócio, indique o alvo exato, se é classificação ou regressão, o momento da previsão, uma métrica adequada e a linha de base. (a) \"Que clientes da loja online vão deixar de comprar nos próximos 90 dias?\" (b) \"Quantas unidades de cada produto vamos vender na próxima semana?\" (c) \"Que pedidos de apoio ao cliente são urgentes?\"",
        },
      ],
      fields: [
        { id: "a", label: "(a) Clientes que deixam de comprar", rows: 5 },
        { id: "b", label: "(b) Unidades vendidas por produto", rows: 5 },
        { id: "c", label: "(c) Pedidos de apoio urgentes", rows: 5 },
      ],
      criteria: [
        "(a) Alvo: o cliente não faz nenhuma compra nos 90 dias seguintes (sim ou não); classificação; previsão no início de cada mês, só com o histórico até essa data",
        "(a) Métrica: revocação com um mínimo de precisão, ou o custo das campanhas de retenção; linha de base: \"ninguém sai\" ou \"sai quem não compra há mais de 60 dias\"",
        "(b) Alvo: unidades vendidas por produto na semana seguinte; regressão; previsão no fim de cada semana; MAE ou RMSE, em unidades; linha de base: as vendas da semana anterior, ou a média das últimas quatro",
        "(c) Alvo: o pedido é urgente (sim ou não, segundo a classificação feita pela equipa); classificação; previsão quando o pedido chega",
        "(c) Métrica: revocação dos urgentes, porque falhar um urgente é caro; linha de base: palavras-chave como \"urgente\" ou \"reembolso\"",
      ],
      solution: [
        {
          t: "p",
          text: "Respostas-modelo. (a) Alvo: o cliente não faz nenhuma compra nos 90 dias seguintes (sim ou não); classificação; previsão no início de cada mês, só com o histórico até essa data; métrica: revocação com um mínimo de precisão, ou o custo das campanhas de retenção; linha de base: \"ninguém sai\" ou \"sai quem não compra há mais de 60 dias\".",
        },
        {
          t: "p",
          text: "(b) Alvo: unidades vendidas por produto na semana seguinte; regressão; previsão no fim de cada semana; MAE ou RMSE (secção 5), em unidades; linha de base: as vendas da semana anterior, ou a média das últimas quatro.",
        },
        {
          t: "p",
          text: "(c) Alvo: o pedido é urgente (sim ou não, segundo a classificação feita pela equipa); classificação; previsão quando o pedido chega; revocação dos urgentes, porque falhar um urgente é caro; linha de base: palavras-chave como \"urgente\" ou \"reembolso\".",
        },
      ],
    },
    {
      id: "e2",
      num: 2,
      part: "A",
      session: "w1s2",
      kind: "classify",
      title: "Que variáveis se podem usar?",
      minutes: 10,
      sections: ["s1"],
      prompt: [
        {
          t: "p",
          text: "Um banco quer prever, no fim de cada mês, se um cliente vai falhar o pagamento no mês seguinte. Quais destas variáveis pode usar? Justifique cada uma.",
        },
      ],
      categories: ["Pode usar", "Não pode usar"],
      justify: "Justificação",
      items: [
        { id: "a", text: "(a) Saldo atual do cartão.", answer: 0, explain: "Sim: conhece-se no fim do mês." },
        { id: "b", text: "(b) Rendimento declarado na abertura da conta.", answer: 0, explain: "Sim, embora possa estar desatualizado." },
        {
          id: "c",
          text: "(c) Número de cartas de cobrança enviadas no mês seguinte.",
          answer: 1,
          explain: "Não: só existe depois do momento da previsão, é uma consequência do incumprimento.",
        },
        {
          id: "d",
          text: "(d) Se o cliente renegociou a dívida depois de falhar.",
          answer: 1,
          explain: "Não: acontece depois de falhar, é fuga de dados óbvia.",
        },
        { id: "e", text: "(e) Antiguidade da conta, em meses.", answer: 0, explain: "Sim." },
      ],
      solution: [
        {
          t: "p",
          text: "(a) Sim: conhece-se no fim do mês. (b) Sim, embora possa estar desatualizado. (c) Não: só existe depois do momento da previsão, é uma consequência do incumprimento. (d) Não: acontece depois de falhar, é fuga de dados óbvia. (e) Sim.",
        },
      ],
    },
    {
      id: "e3",
      num: 3,
      part: "A",
      session: "w1s2",
      kind: "classify",
      title: "Diagnosticar três modelos",
      minutes: 10,
      sections: ["s3"],
      prompt: [
        { t: "p", text: "O ruído irredutível de um problema é cerca de 0,20 (RMSE). Diagnostique cada modelo e diga o que faria a seguir." },
        {
          t: "table",
          head: ["Modelo", "RMSE no treino", "RMSE na validação"],
          rows: [
            ["A", "0,45", "0,47"],
            ["B", "0,04", "0,41"],
            ["C", "0,21", "0,23"],
          ],
        },
      ],
      categories: ["Viés alto (subajuste)", "Variância alta (sobreajuste)", "Bom equilíbrio"],
      justify: "O que faria a seguir",
      items: [
        {
          id: "A",
          text: "Modelo A: 0,45 no treino, 0,47 na validação.",
          answer: 0,
          explain: "Viés alto (subajuste), erra muito no treino e na validação; usar um modelo mais flexível ou melhores variáveis.",
        },
        {
          id: "B",
          text: "Modelo B: 0,04 no treino, 0,41 na validação.",
          answer: 1,
          explain: "Variância alta (sobreajuste), o treino está muito abaixo do ruído, o que só é possível decorando; simplificar, regularizar ou arranjar mais dados.",
        },
        {
          id: "C",
          text: "Modelo C: 0,21 no treino, 0,23 na validação.",
          answer: 2,
          explain: "Bom equilíbrio, os dois erros estão perto do ruído; parar de afinar e avaliar no teste.",
        },
      ],
      solution: [
        {
          t: "p",
          text: "A: viés alto (subajuste), erra muito no treino e na validação; usar um modelo mais flexível ou melhores variáveis. B: variância alta (sobreajuste), o treino está muito abaixo do ruído, o que só é possível decorando; simplificar, regularizar ou arranjar mais dados. C: bom equilíbrio, os dois erros estão perto do ruído; parar de afinar e avaliar no teste.",
        },
      ],
    },
    {
      id: "e4",
      num: 4,
      part: "A",
      session: "w1s2",
      kind: "text",
      title: "Métricas a partir da matriz de confusão",
      minutes: 15,
      sections: ["s4"],
      prompt: [
        {
          t: "p",
          text: "Um classificador, num teste com 1000 casos, tem VN = 850, FP = 50, FN = 30 e VP = 70. Calcule a exatidão, a precisão, a revocação, o F1 e a taxa de falsos positivos. Que exatidão teria a linha de base que prevê sempre negativo?",
        },
      ],
      fields: [
        { id: "m", label: "Exatidão, precisão, revocação, F1 e taxa de falsos positivos, com os cálculos", rows: 6 },
        { id: "base", label: "Exatidão da linha de base \"sempre negativo\", e comparação", rows: 3 },
      ],
      criteria: [
        "Exatidão = 920/1000 = 0,92",
        "Precisão = 70/120 = 0,583 e revocação = 70/100 = 0,70",
        "F1 = 2 × 0,583 × 0,70 / 1,283 = 0,636",
        "Taxa de falsos positivos = 50/900 = 0,056",
        "Linha de base: 900/1000 = 0,90; o modelo só ganha 2 pontos de exatidão, mas apanha 70% dos positivos, que a linha de base não apanha nenhum",
      ],
      solution: [
        {
          t: "p",
          text: "Exatidão = 920/1000 = 0,92. Precisão = 70/120 = 0,583. Revocação = 70/100 = 0,70. F1 = 2 × 0,583 × 0,70 / 1,283 = 0,636. Taxa de falsos positivos = 50/900 = 0,056. A linha de base acerta 900/1000 = 0,90: o modelo só ganha 2 pontos de exatidão, mas apanha 70% dos positivos, que a linha de base não apanha nenhum.",
        },
      ],
    },
    {
      id: "e5",
      num: 5,
      part: "A",
      session: "w2s1",
      kind: "text",
      title: "O limiar ótimo pelo custo",
      minutes: 10,
      sections: ["s4"],
      prompt: [
        {
          t: "p",
          text: "Use a fórmula do limiar ótimo pelo custo. (a) Um falso negativo custa 200 € e um falso positivo 10 €. (b) Um falso negativo custa 10 € e um falso positivo 40 €. Para cada caso, qual é o limiar? Explique em palavras porque é tão baixo num caso e tão alto no outro.",
        },
      ],
      fields: [
        { id: "a", label: "(a) Limiar", rows: 2 },
        { id: "b", label: "(b) Limiar", rows: 2 },
        { id: "porque", label: "Porque é tão baixo num caso e tão alto no outro", rows: 4 },
      ],
      criteria: [
        "(a) 10 / (10 + 200) ≈ 0,048",
        "(b) 40 / (40 + 10) = 0,8",
        "No caso (a), falhar um positivo é 20 vezes mais caro do que um falso alarme, por isso vale a pena agir mesmo com probabilidades baixas",
        "No caso (b), o falso alarme é que é caro, e só se age quando o modelo tem muita certeza",
      ],
      solution: [
        {
          t: "p",
          text: "(a) 10 / (10 + 200) ≈ 0,048. (b) 40 / (40 + 10) = 0,8. No caso (a), falhar um positivo é 20 vezes mais caro do que um falso alarme, por isso vale a pena agir mesmo com probabilidades baixas. No caso (b), o falso alarme é que é caro, e só se age quando o modelo tem muita certeza.",
        },
      ],
    },
    {
      id: "e6",
      num: 6,
      part: "B",
      session: "w2s1",
      kind: "text",
      title: "Estratificar ou não",
      minutes: 15,
      sections: ["s2"],
      prompt: [
        {
          t: "p",
          text: "Divida os dados `Default` em treino e teste (20% para teste) cinco vezes, com `random_state` de 0 a 4, primeiro sem `stratify` e depois com `stratify=y`. Registe a proporção de incumpridores no teste em cada caso. O que conclui?",
        },
      ],
      fields: [
        { id: "code", label: "Código e resultados", rows: 10, mono: true, placeholder: "for estratificar in [False, True]:\n    …" },
        { id: "concl", label: "O que conclui", rows: 3 },
      ],
      criteria: [
        "Sem estratificar: [0.037, 0.0295, 0.0285, 0.0295, 0.0345], entre 2,85% e 3,7% de incumpridores no teste (57 a 74 casos)",
        "Com `stratify=y`: sempre 0.0335 (67 casos)",
        "Conclui que, sem estratificar, as métricas de dois sorteios não seriam comparáveis",
      ],
      solution: [
        {
          t: "code",
          code: EX6_CODE,
          output: "False [0.037, 0.0295, 0.0285, 0.0295, 0.0345]\nTrue [0.0335, 0.0335, 0.0335, 0.0335, 0.0335]",
        },
        {
          t: "p",
          text: "Sem estratificar, o teste tem entre 2,85% e 3,7% de incumpridores, ou seja, entre 57 e 74 casos: as métricas de dois sorteios não seriam comparáveis. Estratificando, é sempre 3,35% (67 casos).",
        },
      ],
    },
    {
      id: "e7",
      num: 7,
      part: "B",
      session: "w2s1",
      kind: "text",
      title: "Os polinómios com 100 pontos",
      minutes: 20,
      sections: ["s3"],
      prompt: [
        {
          t: "p",
          text: "Repita a experiência dos polinómios da secção 3 com 100 pontos de treino em vez de 15 (mesma semente, `default_rng(0)`, gerando primeiro os 100 de treino e depois os 1000 novos). Calcule o RMSE de treino e nos dados novos para os graus 1, 3, 9 e 14. O que aconteceu ao sobreajuste, e porquê?",
        },
      ],
      fields: [
        { id: "code", label: "Código e resultados", rows: 10, mono: true, placeholder: "rng = np.random.default_rng(0)\n…" },
        { id: "concl", label: "O que aconteceu ao sobreajuste, e porquê", rows: 4 },
      ],
      criteria: [
        "Treino / dados novos: grau 1 → 0.584 / 0.538; grau 3 → 0.299 / 0.318; grau 9 → 0.276 / 0.322; grau 14 → 0.271 / 0.324",
        "Nota que o sobreajuste praticamente desaparece: com muitos dados, mesmo um modelo flexível não consegue seguir o ruído de cada ponto",
        "Liga ao viés-variância: mais dados reduzem a variância (a quarta lição de Domingos, 2012)",
      ],
      solution: [
        {
          t: "p",
          text: "Com 100 pontos: grau 1 → 0.584 / 0.538; grau 3 → 0.299 / 0.318; grau 9 → 0.276 / 0.322; grau 14 → 0.271 / 0.324 (treino / dados novos). O sobreajuste praticamente desaparece: com muitos dados, mesmo um modelo flexível não consegue seguir o ruído de cada ponto. Mais dados reduzem a variância, que é a quarta lição de Domingos (2012).",
        },
        {
          t: "code",
          title: "Uma forma de o fazer (usa gerar e rmse da secção 3)",
          code: EX7_CODE,
          output: "1 0.584 0.538\n3 0.299 0.318\n9 0.276 0.322\n14 0.271 0.324",
        },
      ],
    },
    {
      id: "e8",
      num: 8,
      part: "B",
      session: "w2s1",
      kind: "text",
      title: "Limiares na validação e curva de precisão-revocação",
      minutes: 25,
      sections: ["s4"],
      prompt: [
        {
          t: "p",
          text: "Com o modelo logístico da aula (treinado em `X_treino`), calcule na **validação** o número de clientes marcados, a precisão, a revocação e o F1 para os limiares 0,1, 0,3 e 0,5. Calcule também a precisão média e desenhe a curva de precisão-revocação com `PrecisionRecallDisplay.from_predictions(y_val, p_val)`.",
        },
      ],
      fields: [
        { id: "code", label: "Código e resultados", rows: 12, mono: true, placeholder: "p_val = modelo.predict_proba(X_val)[:, 1]\n…" },
        { id: "leitura", label: "O que muda de um limiar para o outro", rows: 4 },
      ],
      criteria: [
        "Limiar 0,1: 142 marcados, precisão 0.303, revocação 0.652, F1 0.413",
        "Limiar 0,3: 68 marcados, 0.485, 0.5, 0.493; limiar 0,5: 38 marcados, 0.684, 0.394, 0.5",
        "Precisão média 0.513 e curva desenhada com `PrecisionRecallDisplay`",
        "Lê a troca: de 0,5 para 0,1 os marcados quase quadruplicam, a revocação sobe e a precisão cai; o F1 varia pouco entre 0,3 e 0,5, mas as consequências para a equipa de risco são muito diferentes",
      ],
      solution: [
        {
          t: "code",
          code: EX8_CODE,
          output: "0.1 142 0.303 0.652 0.413\n0.3 68 0.485 0.5 0.493\n0.5 38 0.684 0.394 0.5\n0.513",
        },
        {
          t: "p",
          text: "De 0,5 para 0,1, o número de marcados quase quadruplica (38 → 142), a revocação passa de 39% para 65% e a precisão cai de 68% para 30%. O F1 varia pouco entre 0,3 e 0,5, mas as consequências para a equipa de risco são muito diferentes.",
        },
      ],
    },
    {
      id: "e9",
      num: 9,
      part: "B",
      session: "w2s2",
      kind: "text",
      title: "Duas regressões no Carseats por validação cruzada",
      minutes: 20,
      sections: ["s2", "s5"],
      prompt: [
        {
          t: "p",
          text: "Com os dados `Carseats`, compare por validação cruzada com 5 partes (`scoring=\"neg_root_mean_squared_error\"`) uma regressão linear só com `Price` e `Advertising` e outra com todas as variáveis. Indique a média e o desvio padrão do RMSE de cada uma. Porque é que o scikit-learn devolve o RMSE com sinal negativo?",
        },
      ],
      fields: [
        { id: "code", label: "Código e resultados", rows: 8, mono: true, placeholder: "for nome, colunas in [...]:\n    …" },
        { id: "sinal", label: "Comparação e porque é que o sinal é negativo", rows: 4 },
      ],
      criteria: [
        "Price + Advertising: RMSE médio 2.403, desvio padrão 0.183",
        "Todas as variáveis: RMSE médio 1.036, desvio padrão 0.075; erra menos de metade, muito para além da variação entre partes",
        "Sinal: o scikit-learn assume sempre que um valor maior de `scoring` é melhor; para erros devolve o simétrico, e o sinal troca-se à mão",
      ],
      solution: [
        {
          t: "code",
          code: EX9_CODE,
          output: "Price + Advertising [2.701 2.439 2.13  2.364 2.383] 2.403 0.183\ntodas [1.069 0.984 0.931 1.045 1.151] 1.036 0.075",
        },
        {
          t: "p",
          text: "O modelo com todas as variáveis erra menos de metade (1,04 contra 2,40 mil unidades), muito para além da variação entre partes. O sinal negativo existe porque o scikit-learn assume sempre que um valor maior de `scoring` é melhor; para erros, devolve o simétrico, e o sinal troca-se à mão.",
        },
      ],
    },
    {
      id: "e10",
      num: 10,
      part: "C",
      session: "w2s2",
      kind: "text",
      title: "Um problema real da sua empresa",
      minutes: 35,
      sections: ["s1", "s2"],
      prompt: [
        {
          t: "p",
          text: "Escolha um problema real da empresa onde trabalha que poderia ser resolvido com ML (por exemplo, prever as vendas de cada loja, ou que clientes respondem a uma campanha). Numa página, responda às seis perguntas da secção 1, diga que dados existem hoje e onde estão, e proponha como dividiria os dados para avaliar o modelo.",
        },
      ],
      fields: [
        { id: "seis", label: "As seis perguntas da secção 1", rows: 12 },
        { id: "dados", label: "Que dados existem hoje e onde estão", rows: 5 },
        { id: "divisao", label: "Como dividiria os dados para avaliar o modelo", rows: 5 },
      ],
      criteria: [
        "As seis perguntas respondidas de forma concreta (2 de 5)",
        "Fontes de dados reais identificadas, com o que está disponível no momento da previsão (1 de 5)",
        "Métrica ligada a um custo ou ganho do negócio (1 de 5)",
        "Divisão dos dados justificada, incluindo se há ordem temporal ou vários registos do mesmo cliente (1 de 5)",
      ],
      solution: [
        { t: "p", text: "Resposta aberta. Grelha (5 pontos):" },
        {
          t: "table",
          head: ["Critério", "Pontos (em 5)"],
          rows: [
            ["As seis perguntas respondidas de forma concreta", "2"],
            ["Fontes de dados reais identificadas, com o que está disponível no momento da previsão", "1"],
            ["Métrica ligada a um custo ou ganho do negócio", "1"],
            ["Divisão dos dados justificada, incluindo se há ordem temporal ou vários registos do mesmo cliente", "1"],
          ],
        },
      ],
    },
  ],

  // ---------------------------------------------------------------- PROVA (04-prova.md + 05-gabarito.md)
  exam: {
    minutes: 75,
    total: 20,
    pass: 14,
    groups: [
      {
        title: "Grupo I — Escolha múltipla (8 valores)",
        note: "Sem consulta e sem correr código (pode usar calculadora). Uma só resposta certa por pergunta. 1 valor cada; respostas erradas não descontam.",
        questions: [
          {
            kind: "mcq", id: "p1", num: 1, section: "s2", points: 1,
            q: "Para que serve o conjunto de teste?",
            options: ["Escolher os parâmetros do modelo.", "Treinar o modelo final.", "Medir o desempenho final, uma única vez, no fim.", "Padronizar as variáveis."],
            answer: 2,
            explain: "Escolher parâmetros é o papel da validação; o teste mede o que se escolheu, uma única vez, no fim.",
          },
          {
            kind: "mcq", id: "p2", num: 2, section: "s3", points: 1,
            q: "Um modelo tem RMSE de 0,02 no treino e de 0,35 na validação, num problema em que o ruído é cerca de 0,1. O diagnóstico mais provável é:",
            options: ["Sobreajuste.", "Subajuste.", "Bom equilíbrio.", "O ruído é zero."],
            answer: 0,
            explain: "O treino está muito abaixo do ruído, o que só é possível decorando, e a validação muito acima: variância alta.",
          },
          {
            kind: "mcq", id: "p3", num: 3, section: "s3", points: 1,
            q: "Em geral, tornar um modelo mais flexível:",
            options: [
              "Aumenta o viés e reduz a variância.",
              "Reduz o viés e a variância.",
              "Não muda nem o viés nem a variância.",
              "Reduz o viés e aumenta a variância.",
            ],
            answer: 3,
            explain: "Ganhar flexibilidade troca viés por variância: na simulação da aula, o viés cai a pique até ao grau 3 e a variância sobe sempre.",
          },
          {
            kind: "mcq", id: "p4", num: 4, section: "s4", points: 1,
            q: "Em 1000 clientes, 20 cancelaram. Um modelo que prevê sempre \"não cancela\" tem uma exatidão de:",
            options: ["2%", "50%", "98%", "100%"],
            answer: 2,
            explain: "Acerta os 980 que não cancelaram: 980 / 1000 = 98%, sem apanhar nenhum dos 20.",
          },
          {
            kind: "mcq", id: "p5", num: 5, section: "s4", points: 1,
            q: "Um classificador tem VP = 30, FP = 10 e FN = 20. A revocação é:",
            options: ["0,75", "0,6", "0,4", "0,3"],
            answer: 1,
            explain: "Revocação = VP / (VP + FN) = 30 / (30 + 20) = 0,6. 0,75 seria a precisão, 30 / (30 + 10).",
          },
          {
            kind: "mcq", id: "p6", num: 6, section: "s4", points: 1,
            q: "Uma AUC de 0,5 significa que o modelo:",
            options: ["É perfeito.", "Erra sempre.", "Tem 50% de exatidão.", "Não ordena melhor do que o acaso."],
            answer: 3,
            explain: "A AUC é a probabilidade de um positivo ao acaso ter pontuação maior do que um negativo ao acaso: 0,5 é o acaso, 1 é perfeito. Não é uma exatidão.",
          },
          {
            kind: "mcq", id: "p7", num: 7, section: "s5", points: 1,
            q: "Num conjunto de erros de previsão, um único erro muito grande:",
            options: ["Aumenta mais o RMSE do que o MAE.", "Aumenta mais o MAE do que o RMSE.", "Não afeta nenhum dos dois.", "Só afeta o R²."],
            answer: 0,
            explain: "O RMSE eleva os erros ao quadrado antes da média: com [1, 1, 1, 1, 10], o MAE é 2,8 e o RMSE 4,56.",
          },
          {
            kind: "mcq", id: "p8", num: 8, section: "s2", points: 1,
            q: "Numa validação cruzada com 5 partes, cada exemplo é usado para avaliar o modelo:",
            options: ["5 vezes.", "1 vez.", "4 vezes.", "Nunca."],
            answer: 1,
            explain: "Cada parte fica de fora uma vez: cada exemplo avalia exatamente uma vez (e é usado para treinar nas outras 4 rondas).",
          },
        ],
      },
      {
        title: "Grupo II — Resposta curta (8 valores)",
        note: "Sem consulta e sem correr código (pode usar calculadora). 2 valores cada, 3 a 6 linhas por resposta.",
        questions: [
          {
            kind: "open", id: "p9", num: 9, section: "s2", points: 2, rows: 6,
            q: "Explique a diferença entre o papel do conjunto de validação e o do conjunto de teste. Porque não se deve escolher o modelo, ou o limiar, olhando para o teste?",
            criteria: [
              { id: "c1", text: "Papéis", points: 1 },
              { id: "c2", text: "Consequência de usar o teste", points: 1 },
            ],
            model:
              "A validação serve para escolher: modelos, parâmetros, limiares. O teste serve para medir, uma vez, o desempenho do que se escolheu. Se o teste for usado para escolher, as escolhas ficam afinadas para esses dados e a estimativa final fica otimista: deixa de haver um exame independente.",
          },
          {
            kind: "open", id: "p10", num: 10, section: "s3", points: 2, rows: 6,
            q: "O que é o compromisso viés-variância? Dê um exemplo de um modelo com viés alto e um com variância alta.",
            criteria: [
              { id: "c1", text: "Definição", points: 1 },
              { id: "c2", text: "Exemplo de um modelo com viés alto", points: 0.5 },
              { id: "c3", text: "Exemplo de um modelo com variância alta", points: 0.5 },
            ],
            model:
              "O erro esperado é viés² + variância + ruído. Modelos simples têm viés alto e variância baixa; modelos flexíveis o contrário; o melhor equilibra os dois. Viés alto: uma reta para um padrão curvo. Variância alta: um polinómio de grau 14 em 15 pontos.",
          },
          {
            kind: "open", id: "p11", num: 11, section: "s4", points: 2, rows: 6,
            q: "Um modelo de deteção de fraude anuncia 99% de exatidão. Porque é que este número pode não dizer nada? Que métricas pediria, e porquê?",
            criteria: [
              { id: "c1", text: "Problema da proporção de base", points: 1 },
              { id: "c2", text: "Métricas justificadas", points: 1 },
            ],
            model:
              "Se a fraude for rara (por exemplo 1%), dizer sempre \"não é fraude\" dá 99% sem apanhar nenhuma fraude. Pediria a revocação (que fração das fraudes apanha), a precisão (quantos alertas são fraude), a matriz de confusão e, se possível, o custo total ou a precisão média.",
          },
          {
            kind: "open", id: "p12", num: 12, section: "s5", points: 2, rows: 6,
            q: "Uma loja quer prever as vendas semanais de cada produto. (a) Se um erro de 100 unidades custar o mesmo para cima ou para baixo, e o custo crescer em linha reta com o erro, usaria o MAE ou o RMSE? (b) E se uma rutura de stock grande for desastrosa? Justifique.",
            criteria: [
              { id: "c1", text: "(a) MAE, justificado", points: 1 },
              { id: "c2", text: "(b) RMSE, justificado", points: 1 },
            ],
            model:
              "(a) MAE: o custo cresce em linha reta com o erro, e o MAE mede exatamente o erro médio em unidades. (b) RMSE: eleva os erros ao quadrado, por isso penaliza muito mais os erros grandes, que são os que causam as ruturas.",
          },
        ],
      },
      {
        title: "Grupo III — Programação (4 valores)",
        note: "Pode usar o Colab, mas não a internet nem assistentes de IA.",
        questions: [
          {
            kind: "open", id: "p13", num: 13, section: "s4", points: 4, rows: 18,
            q: "Use os dados `Default` e a divisão da aula (o mesmo código, com `random_state=42`).",
            context: [
              {
                t: "list",
                items: [
                  "(a) Compare por validação cruzada com 5 partes, em `X_resto`, a AUC de dois modelos `make_pipeline(StandardScaler(), LogisticRegression())`: um só com `balance` e outro com as três variáveis. A diferença é relevante?",
                  "(b) Treine o modelo das três variáveis em `X_treino` e encontre, na validação, o limiar entre 0,05 e 0,95 (passos de 0,01) que maximiza o F1.",
                  "(c) Com esse limiar, calcule a precisão, a revocação e o F1 no teste.",
                  "(d) Interprete os resultados em 3 a 4 linhas, para a equipa de risco.",
                ],
              },
            ],
            criteria: [
              { id: "c1", text: "(a) AUC dos dois modelos e conclusão com base na variação entre partes", points: 1 },
              { id: "c2", text: "(b) Limiar escolhido na validação, não no teste", points: 1 },
              { id: "c3", text: "(c) Métricas no teste certas", points: 1 },
              { id: "c4", text: "(d) Interpretação para o negócio, incluindo a queda da validação para o teste", points: 1 },
            ],
            model:
              "(a) A diferença de AUC (0,001) é dez vezes menor do que o desvio padrão entre partes (0,009): na prática, o saldo carrega quase toda a informação, e um modelo só com o saldo seria defensável por ser mais simples. (d) Interpretação-modelo: \"Com este limiar, o modelo marca 47 clientes em 2000; cerca de metade (53%) falha mesmo, mas só apanhamos 37% dos incumpridores. O F1 no teste (0,44) é mais baixo do que na validação (0,54), o que é normal: o limiar foi escolhido nos dados de validação. Se falhar um incumpridor custar muito mais do que um telefonema, devemos baixar o limiar e aceitar mais falsos alarmes.\"",
            modelBlocks: [
              {
                t: "code",
                code: P13_CODE,
                output: "só balance 0.9482 0.0091\ntrês 0.9494 0.0091\n0.42 0.539\n47 0.532 0.373 0.439",
              },
            ],
          },
        ],
      },
    ],
  },
  examReviewNote:
    "Se a nota ficar abaixo de 14: rever as secções das perguntas falhadas (1, 8 e 9 → secção 2, treino, validação e teste; 2, 3 e 10 → secção 3, sobreajuste e viés-variância; 4, 5, 6, 11 e 13 → secção 4, métricas de classificação; 7 e 12 → secção 5, métricas de regressão) e repetir a prova uma semana depois.",

  // ---------------------------------------------------------------- SIMULADO DE TREINO (banco extra da plataforma)
  practice: {
    mcq: [
      {
        id: "q1", section: "s1",
        q: "Qual é a linha de base mais simples para um problema de classificação?",
        options: ["Uma regressão logística sem variáveis", "Prever sempre a classe mais frequente", "Prever ao acaso, com 50% para cada classe", "Uma árvore de decisão com um só nível"],
        answer: 1,
        explain: "No Default, prever sempre \"ninguém falha\" acerta 96,7%. Qualquer modelo tem de bater esta regra.",
      },
      {
        id: "q2", section: "s1",
        q: "E qual é a linha de base equivalente para um problema de regressão?",
        options: ["Prever sempre zero", "Prever o último valor do teste", "Uma regressão linear com todas as variáveis", "Prever sempre a média do treino"],
        answer: 3,
        explain: "É o que faz o `DummyRegressor()`. No Carseats, erra em média 2418 cadeiras por loja, contra 845 da regressão linear.",
      },
      {
        id: "q3", section: "s1",
        q: "Que lição de Domingos (2012) diz que, antes de complicar o modelo, vale a pena perguntar se há mais ou melhores dados?",
        options: [
          "O que conta é a generalização",
          "O sobreajuste tem muitas caras",
          "Mais dados costumam bater um algoritmo mais esperto",
          "As variáveis certas valem mais do que o algoritmo",
        ],
        answer: 2,
        explain: "É a quarta das lições que a aula destaca: antes de complicar o modelo, vale a pena perguntar se há mais ou melhores dados.",
      },
      {
        id: "q4", section: "s1",
        q: "No conjunto `Default`, que fração dos 10 000 clientes falhou o pagamento?",
        options: ["3,3%", "33%", "0,33%", "96,7%"],
        answer: 0,
        explain: "`value_counts(normalize=True)` dá 0.0333 para \"Yes\". 96,7% é a fração dos que não falharam.",
      },
      {
        id: "q5", section: "s2",
        q: "Para que serve `stratify=y` em `train_test_split`?",
        options: [
          "Para baralhar os dados antes de dividir",
          "Para fixar o sorteio e tornar os resultados reprodutíveis",
          "Para padronizar as colunas",
          "Para manter a mesma proporção de cada classe em todas as partes",
        ],
        answer: 3,
        explain: "Com uma classe tão rara, sem estratificar uma parte podia ficar com muito poucos incumpridores. Fixar o sorteio é o papel de `random_state`.",
      },
      {
        id: "q6", section: "s2",
        q: "Na divisão da aula, porque é que o segundo corte usa `test_size=0.25`?",
        options: [
          "Porque 25% dos 80% que sobram são 20% do total",
          "Porque a validação deve ser maior do que o teste",
          "Porque é o valor por omissão do scikit-learn",
          "Para a validação ficar com 25% de todos os dados",
        ],
        answer: 0,
        explain: "0,25 × 0,8 = 0,2: fica 60% para treino, 20% para validação e 20% para teste (6000, 2000 e 2000 clientes).",
      },
      {
        id: "q7", section: "s2",
        q: "Além de `fit`, que método têm os transformadores do scikit-learn, como o `StandardScaler`?",
        options: ["`predict`", "`transform`", "`predict_proba`", "`cross_val_score`"],
        answer: 1,
        explain: "Os transformadores têm `fit` e `transform`; os modelos têm `fit` e `predict` (e `predict_proba`, nos classificadores). `make_pipeline` encadeia os dois.",
      },
      {
        id: "q8", section: "s2",
        q: "A validação cruzada da aula deu as AUC `[0.937 0.945 0.945 0.96 0.96]`. O que se reporta?",
        options: [
          "Só o melhor valor, 0,96",
          "Só o valor da última parte",
          "A soma das cinco",
          "A média (0,949) e o desvio padrão (0,009)",
        ],
        answer: 3,
        explain: "A média é a estimativa; o desvio padrão mostra quanto ela varia de parte para parte.",
      },
      {
        id: "q9", section: "s2",
        q: "Segundo a aula, quando é que uma divisão simples em treino, validação e teste chega?",
        options: [
          "Com poucos dados",
          "Com muitos dados (centenas de milhares de linhas)",
          "Quando os dados têm ordem temporal",
          "Nunca: é sempre preciso validação cruzada",
        ],
        answer: 1,
        explain: "Com muitos dados chega e é mais rápida. Com poucos, usa-se validação cruzada para comparar modelos e guarda-se mesmo assim um teste final.",
      },
      {
        id: "q10", section: "s3",
        q: "Na experiência da aula, o polinómio de grau 14 tem RMSE de treino 0,0. Porquê?",
        options: ["Porque o ruído é zero", "Porque passa por todos os 15 pontos", "Porque é o modelo certo", "Porque o grau é par"],
        answer: 1,
        explain: "Com 15 coeficientes e 15 pontos, o polinómio interpola-os todos. Nos dados novos, o RMSE é 21 113: é inútil fora deles.",
      },
      {
        id: "q11", section: "s3",
        q: "No compromisso viés-variância, o que mede a variância?",
        options: [
          "O erro sistemático do modelo médio",
          "O erro irredutível",
          "Quanto o modelo muda de amostra para amostra",
          "A variância do alvo y",
        ],
        answer: 2,
        explain: "Um modelo demasiado flexível segue o ruído de cada amostra, por isso muda muito. O erro sistemático é o viés.",
      },
      {
        id: "q12", section: "s3",
        q: "Na simulação da aula, o ruído tem desvio padrão 0,3. Quanto vale o ruído irredutível na decomposição do erro quadrático?",
        options: ["0,3", "0,6", "0,09", "0,03"],
        answer: 2,
        explain: "O termo é σ² = 0,3² = 0,09. Por isso o código soma `vies2 + variancia + 0.09`.",
      },
      {
        id: "q13", section: "s3",
        q: "Na simulação de viés e variância, onde é mínimo o erro esperado?",
        options: ["No grau 1", "No grau 15", "No grau 9", "Entre os graus 3 e 5"],
        answer: 3,
        explain: "Grau 3: 0,109; grau 5: 0,11; grau 1: 0,281 (viés alto); grau 15: 0,192 (variância alta).",
      },
      {
        id: "q14", section: "s3",
        q: "O que é o *double descent* (Belkin et al., 2019)?",
        options: [
          "Uma segunda descida do erro de teste em modelos muito grandes, depois da subida",
          "Dois passos seguidos da descida do gradiente",
          "Um erro que desce ao mesmo tempo no treino e na validação",
          "A prova de que o compromisso viés-variância está errado",
        ],
        answer: 0,
        explain: "Aparece em redes neuronais muito grandes. Não anula o compromisso viés-variância; mostra que, em modelos enormes, há mais coisas em jogo (M13).",
      },
      {
        id: "q15", section: "s4",
        q: "Em 1000 casos: VN = 900, FP = 40, FN = 20 e VP = 40. Qual é a revocação?",
        options: ["0,5", "0,667", "0,94", "0,04"],
        answer: 1,
        explain: "VP / (VP + FN) = 40 / 60 ≈ 0,667. 0,5 é a precisão (40 / 80) e 0,94 a exatidão (940 / 1000).",
      },
      {
        id: "q16", section: "s4",
        q: "Com a mesma matriz (VN = 900, FP = 40, FN = 20, VP = 40), qual é a taxa de falsos positivos?",
        options: ["Cerca de 0,043", "0,5", "0,333", "0,06"],
        answer: 0,
        explain: "FP / (FP + VN) = 40 / 940 ≈ 0,043. 0,06 seria a fração de erros no total (60 / 1000).",
      },
      {
        id: "q17", section: "s4",
        q: "Um falso negativo custa 300 € e um falso positivo 100 €. Qual é o limiar ótimo pela fórmula, se as probabilidades forem fiáveis?",
        options: ["0,75", "0,333", "0,5", "0,25"],
        answer: 3,
        explain: "custo_FP / (custo_FP + custo_FN) = 100 / 400 = 0,25. Como falhar um positivo é mais caro, o limiar fica abaixo de 0,5.",
      },
      {
        id: "q18", section: "s4",
        q: "No teste da aula, o que aconteceu quando o limiar baixou de 0,5 para 0,2?",
        options: [
          "A precisão e a exatidão subiram",
          "A revocação desceu e houve menos falsos alarmes",
          "A revocação subiu de 33% para 63% e a exatidão desceu de 97,3% para 95,5%",
          "Nada mudou, porque o modelo é o mesmo",
        ],
        answer: 2,
        explain: "Passou a apanhar 42 dos 67 incumpridores em vez de 22, com 66 falsos alarmes em vez de 9. A exatidão desceu e o modelo ficou mais útil.",
      },
      {
        id: "q19", section: "s4",
        q: "Com classes muito raras, que resumo é mais informativo do que a AUC para comparar modelos sem escolher limiar?",
        options: ["A exatidão", "A taxa de falsos positivos", "A precisão média", "O R²"],
        answer: 2,
        explain: "A precisão média resume a curva de precisão-revocação. Os muitos verdadeiros negativos tornam a taxa de falsos positivos pequena e a AUC parece excelente (Saito & Rehmsmeier, 2015). Na aula: AUC 0,947, precisão média 0,507.",
      },
      {
        id: "q20", section: "s4",
        q: "Num problema com três classes, o que faz `average=\"macro\"` numa métrica como o F1?",
        options: [
          "Pesa cada classe pelo seu tamanho",
          "Dá o mesmo peso a todas as classes",
          "Usa só a classe maior",
          "Transforma o F1 em exatidão",
        ],
        answer: 1,
        explain: "Calcula a métrica por classe e faz a média simples. `average=\"weighted\"` pesa as classes pelo tamanho.",
      },
      {
        id: "q21", section: "s5",
        q: "O R² de um modelo de regressão, no teste, é ligeiramente negativo. O que quer dizer?",
        options: [
          "Que o modelo é pior do que prever a média do próprio teste",
          "Que há um erro de cálculo",
          "Que o MAE é negativo",
          "Que o modelo é perfeito",
        ],
        answer: 0,
        explain: "A referência do R² é a média do próprio teste. No Carseats, a linha de base (média do treino) tem R² de −0,017.",
      },
      {
        id: "q22", section: "s5",
        q: "No Carseats, a regressão linear tem MAE 0,845 (as vendas estão em milhares de unidades). Como se reporta a um gestor?",
        options: ["\"R² = 0,88\"", "\"Erramos, em média, 845 cadeiras por loja\"", "\"RMSE = 1,036\"", "\"O modelo tem 88% de exatidão\""],
        answer: 1,
        explain: "Reportar sempre nas unidades do negócio. \"88% de exatidão\" é ainda pior: o R² não é uma exatidão.",
      },
      {
        id: "q23", section: "s5",
        q: "Quando é que se deve desconfiar do erro percentual médio (MAPE)?",
        options: [
          "Quando os erros são todos pequenos",
          "Quando há muitas lojas",
          "Sempre que se usa regressão linear",
          "Quando há valores reais perto de zero",
        ],
        answer: 3,
        explain: "Dividir por um número pequeno faz o erro explodir.",
      },
      {
        id: "q24", section: "s5",
        q: "Que faz `pd.get_dummies(..., drop_first=True, dtype=int)` no código do Carseats?",
        options: [
          "Remove as colunas de texto",
          "Padroniza as colunas numéricas",
          "Transforma as colunas de texto em colunas de zeros e uns",
          "Preenche os valores em falta",
        ],
        answer: 2,
        explain: "Posição na prateleira, zona urbana e EUA passam a colunas 0/1 (`ShelveLoc_Good`, `ShelveLoc_Medium`, `Urban_Yes`, `US_Yes`). O M8 e o M11 aprofundam.",
      },
    ],
    tf: [
      { id: "v1", section: "s1", q: "No Default, um modelo com 96,7% de exatidão é necessariamente útil.", answer: false, explain: "Prever \"ninguém falha\" acerta 96,7% e não apanha um único incumpridor." },
      { id: "v2", section: "s1", q: "Pode usar-se uma variável que só se conhece depois do acontecimento, desde que esteja nos dados históricos.", answer: false, explain: "É fuga de dados: resultados excelentes nos dados históricos e inúteis na prática (M11)." },
      { id: "v3", section: "s2", q: "Pode usar-se o conjunto de teste para escolher entre dois modelos, desde que seja uma só vez.", answer: false, explain: "Escolher é o papel da validação. Se o teste servir para escolher, a estimativa final fica otimista." },
      { id: "v4", section: "s2", q: "Na validação cruzada com k partes, cada exemplo é usado para avaliar exatamente uma vez.", answer: true, explain: "Cada parte fica de fora uma vez; nas outras k − 1 rondas, o exemplo serve para treinar." },
      { id: "v5", section: "s2", q: "Com classificadores, `cross_val_score(..., cv=5)` usa automaticamente divisões estratificadas.", answer: true, explain: "Dito na aula: com classificadores, `cv=5` usa automaticamente divisões estratificadas." },
      { id: "v6", section: "s3", q: "Na experiência da aula, o erro de treino desce sempre que o grau do polinómio sobe.", answer: true, explain: "O erro de treino desce sempre; o erro em dados novos desce até certo ponto e depois sobe." },
      { id: "v7", section: "s3", q: "Um modelo demasiado simples tem variância alta.", answer: false, explain: "Tem viés alto (subajuste). A variância alta é dos modelos demasiado flexíveis." },
      { id: "v8", section: "s4", q: "A precisão é P(alerta | falha) e a revocação é P(falha | alerta).", answer: false, explain: "É ao contrário: precisão = P(falha | alerta), revocação = P(alerta | falha)." },
      { id: "v9", section: "s4", q: "A AUC é a probabilidade de o modelo dar uma pontuação maior a um positivo escolhido ao acaso do que a um negativo escolhido ao acaso.", answer: true, explain: "É a leitura de Fawcett (2006): 0,5 para um modelo ao acaso, 1 para um perfeito." },
      { id: "v10", section: "s4", q: "O limiar 0,5 do `predict` é o melhor limiar na maioria dos problemas.", answer: false, explain: "Não tem nada de especial. Com custos de 1000 € e 50 €, o limiar escolhido na validação foi 0,05." },
      { id: "v11", section: "s5", q: "O RMSE é sempre maior ou igual ao MAE.", answer: true, explain: "Elevar ao quadrado dá mais peso aos erros grandes; os dois só são iguais quando todos os erros têm o mesmo tamanho." },
      { id: "v12", section: "s5", q: "Um R² de 0,9 é sempre melhor do que um R² de 0,3.", answer: false, explain: "O R² só se compara entre modelos no mesmo conjunto de dados: 0,3 pode ser excelente num problema difícil." },
    ],
  },

  // ---------------------------------------------------------------- CARTÕES
  flashcards: [
    { id: "f1", section: "s1", tag: "Formular", front: "As seis perguntas antes de escrever código", back: "Que decisão apoia? Qual é o alvo exato (classificação ou regressão)? Unidade e momento da previsão? Que dados existem nesse momento? Quanto custa cada erro? Qual é a linha de base?" },
    { id: "f2", section: "s1", tag: "Formular", front: "Fuga de dados", back: "Usar uma variável que só existe depois do acontecimento (por exemplo, cartas de cobrança enviadas): resultados excelentes nos dados históricos e inúteis na prática. Tema central do M11." },
    { id: "f3", section: "s1", tag: "Formular", front: "As quatro lições de Domingos (2012) que guiam o M7", back: "O que conta é a generalização; o sobreajuste tem muitas caras; as variáveis certas valem mais do que o algoritmo; mais dados costumam bater um algoritmo mais esperto." },
    { id: "f4", section: "s1", tag: "Formular", front: "Linhas de base", back: "Classificação: prever sempre a classe mais frequente (`DummyClassifier(strategy=\"most_frequent\")`). Regressão: prever sempre a média do treino (`DummyRegressor()`)." },
    { id: "f5", section: "s1", tag: "Dados", front: "O conjunto `Default`", back: "10 000 clientes de cartão de crédito: `balance`, `income`, `student` e `default`. Só 3,3% falharam, por isso \"ninguém falha\" acerta 96,7%." },
    { id: "f6", section: "s2", tag: "Divisão", front: "Treino, validação e teste", back: "Treino (60%): aprender. Validação (20%): comparar modelos e escolher parâmetros. Teste (20%): medir o desempenho final, uma única vez, no fim." },
    { id: "f7", section: "s2", tag: "Divisão", front: "Porque não se escolhe nada olhando para o teste", back: "As escolhas ficam afinadas para esses dados em particular e a estimativa final fica otimista: deixa de haver um exame independente." },
    { id: "f8", section: "s2", tag: "Divisão", front: "`stratify=y` e `random_state=42`", back: "`stratify` mantém a proporção das classes em cada parte (essencial com classes raras); `random_state` fixa o sorteio, para resultados reprodutíveis." },
    { id: "f9", section: "s2", tag: "scikit-learn", front: "A interface do scikit-learn", back: "`fit(X, y)` treina; `predict(X)` prevê; `predict_proba(X)` dá probabilidades; os transformadores têm `fit` e `transform`; `make_pipeline` encadeia-os com um modelo." },
    { id: "f10", section: "s2", tag: "Divisão", front: "Validação cruzada com k partes", back: "Dividir em k partes; treinar k vezes com k − 1 partes e avaliar na que fica de fora; reportar média e desvio padrão. Cada exemplo avalia exatamente uma vez." },
    { id: "f11", section: "s2", tag: "Divisão", front: "Divisão simples ou validação cruzada?", back: "Com muitos dados (centenas de milhares de linhas), a divisão simples chega e é mais rápida. Com poucos, validação cruzada para comparar modelos, e mesmo assim um teste final." },
    { id: "f12", section: "s3", tag: "Generalização", front: "Subajuste e sobreajuste", back: "Subajuste: demasiado simples, erra no treino e em dados novos (viés alto). Sobreajuste: decora o ruído, erra pouco no treino e muito em dados novos (variância alta)." },
    { id: "f13", section: "s3", tag: "Generalização", front: "Os polinómios da aula (15 pontos, ruído 0,3)", back: "Grau 1: 0,41 / 0,67 (subajuste). Grau 3: 0,195 / 0,32 (certo). Grau 9: 0,151 / 1,3 (sobreajuste). Grau 14: 0,0 / 21 113 (treino / dados novos)." },
    { id: "f14", section: "s3", tag: "Generalização", front: "A lição mais importante da Fase 2", back: "O erro de treino desce sempre que o modelo fica mais flexível; o erro em dados novos desce até certo ponto e depois sobe. Escolhe-se o modelo pelo erro de validação." },
    { id: "f15", section: "s3", tag: "Viés-variância", front: "Decomposição do erro esperado", back: "E[(y − f̂(x))²] = viés² + variância + σ². Viés: erro sistemático do modelo médio. Variância: quanto muda de amostra para amostra. σ²: ruído irredutível." },
    { id: "f16", section: "s3", tag: "Viés-variância", front: "O que a simulação de viés e variância mostrou", back: "O viés cai a pique até ao grau 3 e fica praticamente zero; a variância sobe sempre; o erro total é mínimo entre os graus 3 e 5." },
    { id: "f17", section: "s3", tag: "Viés-variância", front: "Sintoma → diagnóstico → o que ajuda", back: "Erro alto no treino e na validação → viés alto → modelo mais flexível, melhores variáveis. Treino baixo, validação alta → variância alta → mais dados, modelo mais simples, regularização, ensembles. Erros parecidos e perto do ruído → parar e testar." },
    { id: "f18", section: "s3", tag: "Viés-variância", front: "*Double descent* (Belkin et al., 2019)", back: "Em redes muito grandes, o erro de teste pode voltar a descer depois da subida. Não anula o compromisso viés-variância (M13)." },
    { id: "f19", section: "s4", tag: "Classificação", front: "Matriz de confusão", back: "Linhas: real (não falha, falha). Colunas: previsto. VN e FP na primeira linha; FN e VP na segunda. `confusion_matrix(...).ravel()` dá vn, fp, fn, vp." },
    { id: "f20", section: "s4", tag: "Classificação", front: "Exatidão, precisão, revocação e F1", back: "(VP + VN) / total; VP / (VP + FP); VP / (VP + FN); 2 · P · R / (P + R)." },
    { id: "f21", section: "s4", tag: "Classificação", front: "Precisão e revocação como probabilidades (M6)", back: "Precisão = P(falha | alerta); revocação = P(alerta | falha). Com a classe positiva rara, podem ser muito diferentes." },
    { id: "f22", section: "s4", tag: "Limiar", front: "Limiar 0,5 contra 0,2 no teste da aula", back: "0,5: apanha 22 de 67 (revocação 0,328), 9 falsos alarmes, exatidão 0,973. 0,2: apanha 42 (0,627), 66 falsos alarmes, exatidão 0,955. Menos exatidão, mais útil." },
    { id: "f23", section: "s4", tag: "Limiar", front: "Limiar ótimo pelo custo", back: "custo_FP / (custo_FP + custo_FN), se as probabilidades forem fiáveis. Com 50 € e 1000 €: ≈ 0,048. Na prática escolhe-se na validação: deu 0,05, e o custo no teste caiu de 45 450 € para 20 600 €." },
    { id: "f24", section: "s4", tag: "ROC", front: "Curva ROC", back: "A revocação (taxa de verdadeiros positivos) contra a taxa de falsos positivos, FP / (FP + VN), para todos os limiares." },
    { id: "f25", section: "s4", tag: "ROC", front: "AUC (Fawcett, 2006)", back: "Área debaixo da curva ROC: a probabilidade de um positivo ao acaso ter pontuação maior do que um negativo ao acaso. 0,5 = acaso; 1 = perfeito. Na aula: 0,947." },
    { id: "f26", section: "s4", tag: "ROC", front: "Precisão média (Saito & Rehmsmeier, 2015)", back: "Resumo da curva de precisão-revocação (`average_precision_score`). Com classes raras é mais informativa do que a AUC. Na aula: 0,507, para uma linha de base de 0,034." },
    { id: "f27", section: "s4", tag: "Classificação", front: "Que métrica usar", back: "Classes equilibradas: exatidão ou F1. Falhar um positivo é caro: revocação com mínimo de precisão. Falso alarme caro: precisão. Sem limiar: AUC (classes raras: precisão média). Custos conhecidos: custo total." },
    { id: "f28", section: "s4", tag: "Classificação", front: "`average=\"macro\"` e `average=\"weighted\"`", back: "Com mais de duas classes, a métrica calcula-se por classe e faz-se a média: \"macro\" dá o mesmo peso a todas; \"weighted\" pesa-as pelo tamanho." },
    { id: "f29", section: "s5", tag: "Regressão", front: "MAE, RMSE e R²", back: "MAE: média de |y − ŷ|, o erro típico. RMSE: √(média de (y − ŷ)²), pesa mais os erros grandes. R² = 1 − EQM / Var(y): fração explicada; 0 é a linha de base da média." },
    { id: "f30", section: "s5", tag: "Regressão", front: "Erros [1, 1, 1, 1, 10]", back: "MAE 2,8; RMSE 4,56. Ao quadrado, o erro de 10 pesa 100 vezes mais do que um erro de 1." },
    { id: "f31", section: "s5", tag: "Regressão", front: "MAE ou RMSE?", back: "RMSE quando um erro grande é desproporcionadamente mau (ruturas de stock). MAE quando o custo cresce em linha reta com o erro, ou quando há valores extremos que não devem dominar." },
    { id: "f32", section: "s5", tag: "Regressão", front: "O Carseats da aula", back: "Linha de base (média): MAE 2,418, RMSE 3,061, R² −0,017. Regressão linear: 0,845, 1,036, 0,883: erra em média 845 cadeiras por loja e explica 88% da variação." },
    { id: "f33", section: "s5", tag: "Regressão", front: "Quatro cuidados com métricas de regressão", back: "Reportar nas unidades do negócio; comparar com a linha de base nos mesmos dados; desconfiar do MAPE com valores perto de zero; o R² só se compara no mesmo conjunto de dados." },
  ],

  // ---------------------------------------------------------------- NOTEBOOK
  notebook: {
    filename: "M7 — exercícios",
    cells: [
      {
        type: "md",
        source:
          "# M7 — Fundamentos de machine learning\n\nExemplos da aula (correr pela ordem, no mesmo notebook) e os exercícios 6 a 9. Os exercícios 1 a 5 fazem-se à mão e o 10 é uma página de texto. O código lê os dados do repositório do ISLP no GitHub, por isso precisa de internet. Guardar no Drive, na pasta da Fase 2.",
      },
      { type: "code", source: "import sklearn; print(sklearn.__version__)" },
      { type: "md", source: "## 2. Treino, validação e teste, e validação cruzada" },
      { type: "code", source: SPLIT_CODE },
      { type: "code", source: BASE_CODE },
      { type: "code", source: CV_CODE },
      { type: "md", source: "## 3. Generalização, sobreajuste e o compromisso viés-variância" },
      { type: "code", source: POLY_CODE },
      { type: "code", source: BV_CODE },
      { type: "md", source: "## 4. Métricas de classificação" },
      { type: "code", source: THR_CODE },
      { type: "code", source: COST_CODE },
      { type: "code", source: AUC_CODE },
      { type: "md", source: "## 5. Métricas de regressão" },
      { type: "code", source: ERR_CODE },
      { type: "code", source: CARSEATS_CODE },
      {
        type: "md",
        source:
          "## Exercício 6\n\nDividir o `Default` em treino e teste (20% para teste) com `random_state` de 0 a 4, sem e com `stratify=y`, e registar a proporção de incumpridores no teste.",
      },
      { type: "code", source: "for estratificar in [False, True]:\n    taxas = []\n    # …\n" },
      { type: "md", source: "Conclusão:\n\n" },
      {
        type: "md",
        source:
          "## Exercício 7\n\nOs polinómios da secção 3 com 100 pontos de treino (`default_rng(0)`, primeiro os 100 de treino, depois os 1000 novos): RMSE de treino e nos dados novos para os graus 1, 3, 9 e 14.",
      },
      { type: "code", source: "rng = np.random.default_rng(0)\n" },
      { type: "md", source: "O que aconteceu ao sobreajuste, e porquê:\n\n" },
      {
        type: "md",
        source:
          "## Exercício 8\n\nNa **validação**: marcados, precisão, revocação e F1 para os limiares 0,1, 0,3 e 0,5; precisão média; curva de precisão-revocação com `PrecisionRecallDisplay.from_predictions(y_val, p_val)`.",
      },
      { type: "code", source: "from sklearn.metrics import PrecisionRecallDisplay, average_precision_score\n\np_val = modelo.predict_proba(X_val)[:, 1]\n" },
      {
        type: "md",
        source:
          "## Exercício 9\n\nCarseats: validação cruzada com 5 partes (`scoring=\"neg_root_mean_squared_error\"`) de uma regressão linear só com `Price` e `Advertising` e de outra com todas as variáveis. Média e desvio padrão do RMSE; porque é que o sinal é negativo?",
      },
      { type: "code", source: "# Xc e yc vêm da secção 5\n" },
      { type: "md", source: "## Notas\n\nO que aprendi neste módulo, em três frases:" },
    ],
  },
  source: "curso-engenharia-ia 2/modulo-07-fundamentos-ml",
};
