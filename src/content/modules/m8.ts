import type { ModuleContent } from "../types";

// Módulo 8 — Modelos lineares.
// Fonte: curso-engenharia-ia 2/modulo-08-modelos-lineares (01-aula, 02-apostila, 03-exercicios, 04-prova, 05-gabarito,
// codigo/exemplos_m8.py e img/). As três imagens da aula entram como figuras; as fórmulas, escritas em LaTeX na aula,
// passam a texto Unicode (não há renderizador de LaTeX). A regressão logística com os dados Default, os caminhos do
// Ridge e do Lasso nos dados Hitters e a geometria L1/L2 têm widgets interativos (src/components/widgets/m8), com a
// lógica testada contra o scikit-learn 1.9 e o SciPy 1.18. As verificações rápidas, os cartões de revisão e o banco do
// simulado foram escritos pela plataforma a partir da aula. Todo o código da aula e do gabarito foi corrido em
// Python 3.13, NumPy 2.5, pandas 3.0 e scikit-learn 1.9, com os ficheiros do ISLP; o campo `output` de cada bloco tem o
// resultado real, igual ao dos comentários do código.

// ---------------------------------------------------------------- código da aula

const URL_LINE = `URL = "https://raw.githubusercontent.com/intro-stat-learning/ISLP/main/ISLP/data/"`;

const C_CARSEATS = `import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression

${URL_LINE}
cs = pd.read_csv(URL + "Carseats.csv")
X = pd.get_dummies(cs.drop(columns="Sales"), drop_first=True, dtype=int)
print(list(X.columns))
# ['CompPrice', 'Income', 'Advertising', 'Population', 'Price', 'Age', 'Education',
#  'ShelveLoc_Good', 'ShelveLoc_Medium', 'Urban_Yes', 'US_Yes']

lin = LinearRegression().fit(X, cs["Sales"])
print(round(lin.intercept_, 3))                                    # 5.661
print(pd.Series(lin.coef_, index=X.columns).round(3).to_string())
# CompPrice           0.093
# Income              0.016
# Advertising         0.123
# Population          0.000
# Price              -0.095
# Age                -0.046
# Education          -0.021
# ShelveLoc_Good      4.850
# ShelveLoc_Medium    1.957
# Urban_Yes           0.123
# US_Yes             -0.184`;

const O_CARSEATS = `['CompPrice', 'Income', 'Advertising', 'Population', 'Price', 'Age', 'Education', 'ShelveLoc_Good', 'ShelveLoc_Medium', 'Urban_Yes', 'US_Yes']
5.661
CompPrice           0.093
Income              0.016
Advertising         0.123
Population          0.000
Price              -0.095
Age                -0.046
Education          -0.021
ShelveLoc_Good      4.850
ShelveLoc_Medium    1.957
Urban_Yes           0.123
US_Yes             -0.184`;

const C_PADRONIZAR = `Z = (X - X.mean()) / X.std(ddof=0)
lin_z = LinearRegression().fit(Z, cs["Sales"])
print(pd.Series(lin_z.coef_, index=X.columns).round(2).sort_values(key=abs, ascending=False).head(5).to_string())
# Price              -2.25
# ShelveLoc_Good      1.98
# CompPrice           1.42
# ShelveLoc_Medium    0.97
# Advertising         0.82`;

const O_PADRONIZAR = `Price              -2.25
ShelveLoc_Good      1.98
CompPrice           1.42
ShelveLoc_Medium    0.97
Advertising         0.82`;

const C_ESTUDANTES = `from sklearn.linear_model import LogisticRegression

df = pd.read_csv(URL + "Default.csv")
y = (df["default"] == "Yes").astype(int)
df["estudante"] = (df["student"] == "Yes").astype(int)
print(df.groupby("student")["default"].apply(lambda s: (s == "Yes").mean()).round(4).to_dict())
# {'No': 0.0292, 'Yes': 0.0431}

so_estudante = LogisticRegression(C=np.inf).fit(df[["estudante"]], y)
com_saldo = LogisticRegression(C=np.inf, max_iter=1000).fit(df[["balance", "estudante"]], y)
print(f"{so_estudante.coef_[0][0]:.3f}")                                # 0.401
print(f"{com_saldo.coef_[0][0]:.5f} {com_saldo.coef_[0][1]:.3f}")       # 0.00574 -0.715
print(round(np.exp(so_estudante.coef_[0][0]), 2), round(np.exp(com_saldo.coef_[0][1]), 2),
      round(np.exp(100 * com_saldo.coef_[0][0]), 2))                    # 1.49 0.49 1.78`;

const C_NOVOS = `novos = pd.DataFrame({"balance": [1500, 1500], "estudante": [0, 1]})
print(com_saldo.predict_proba(novos)[:, 1].round(3))                # [0.105 0.054]
print(df.groupby("student")["balance"].mean().round(0).to_dict())   # {'No': 772.0, 'Yes': 988.0}`;

const C_EXPERIENCIA = `from sklearn.linear_model import RidgeCV, LassoCV
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
from sklearn.model_selection import ShuffleSplit, cross_val_score

hi = pd.read_csv(URL + "Hitters.csv").dropna(subset=["Salary"])     # 263 jogadores com salário
Xh = pd.get_dummies(hi.drop(columns="Salary"), drop_first=True, dtype=int)
yh = hi["Salary"]
print(Xh.shape)                                                       # (263, 19)

modelos = {
    "mínimos quadrados": make_pipeline(StandardScaler(), LinearRegression()),
    "Ridge": make_pipeline(StandardScaler(), RidgeCV(alphas=np.logspace(-2, 4, 60))),
    "Lasso": make_pipeline(StandardScaler(), LassoCV(alphas=np.logspace(-1, 3, 60), max_iter=50_000)),
}
for n_treino in [40, 180]:
    divisoes = ShuffleSplit(n_splits=30, train_size=n_treino, random_state=0)
    for nome, m in modelos.items():
        rmse = -cross_val_score(m, Xh, yh, cv=divisoes, scoring="neg_root_mean_squared_error")
        print(n_treino, nome, round(rmse.mean(), 1))
# 40 mínimos quadrados 485.9
# 40 Ridge 377.8
# 40 Lasso 410.7
# 180 mínimos quadrados 348.7
# 180 Ridge 350.7
# 180 Lasso 350.4`;

const O_EXPERIENCIA = `(263, 19)
40 mínimos quadrados 485.9
40 Ridge 377.8
40 Lasso 410.7
180 mínimos quadrados 348.7
180 Ridge 350.7
180 Lasso 350.4`;

const C_LASSO = `lasso = make_pipeline(StandardScaler(), LassoCV(alphas=np.logspace(-1, 3, 60), max_iter=50_000)).fit(Xh, yh)
coef = pd.Series(lasso[-1].coef_, index=Xh.columns)
print(round(lasso[-1].alpha_, 2), (coef != 0).sum(), list(coef[coef == 0].index))
# 2.65 13 ['HmRun', 'Runs', 'RBI', 'CAtBat', 'CHits', 'NewLeague_N']`;

const C_UM_EP = `from sklearn.linear_model import Lasso
from sklearn.model_selection import KFold

divisoes = KFold(10, shuffle=True, random_state=0)
lasso = make_pipeline(StandardScaler(),
                      LassoCV(alphas=np.logspace(-1, 3, 60), cv=divisoes, max_iter=50_000)).fit(Xh, yh)
lc = lasso[-1]
media = lc.mse_path_.mean(axis=1)                    # EQM médio de validação para cada α
ep = lc.mse_path_.std(axis=1) / np.sqrt(10)          # erro padrão dessa média
i = np.argmin(media)
alpha_1ep = lc.alphas_[media <= media[i] + ep[i]].max()
print(round(lc.alpha_, 2), round(np.sqrt(media[i]), 1), (lc.coef_ != 0).sum())   # 3.1 334.2 13

simples = Lasso(alpha=alpha_1ep, max_iter=50_000).fit(StandardScaler().fit_transform(Xh), yh)
print(round(alpha_1ep, 2), round(np.sqrt(media[lc.alphas_ == alpha_1ep][0]), 1),
      list(Xh.columns[simples.coef_ != 0]))
# 60.21 350.2 ['Hits', 'Walks', 'CRuns', 'CRBI', 'PutOuts', 'Division_W']`;

// ---------------------------------------------------------------- fórmulas (LaTeX na aula, aqui em Unicode)

const F_LIN = `y ≈ β₀ + β₁x₁ + β₂x₂ + … + βₚxₚ`;
const F_SIG = `p(x) = σ(β₀ + β₁x₁ + … + βₚxₚ) = 1 / (1 + e^−(β₀ + β₁x₁ + … + βₚxₚ))`;
const F_LOGIT = `log [ p / (1 − p) ] = β₀ + β₁x₁ + … + βₚxₚ`;
const F_PEN = `Ridge:  min_β  Σᵢ (yᵢ − ŷᵢ)² + α Σⱼ βⱼ²

Lasso:  min_β  Σᵢ (yᵢ − ŷᵢ)² + α Σⱼ |βⱼ|`;

// ---------------------------------------------------------------- notebook

const EX_IMPORTS = `from sklearn.linear_model import ElasticNetCV
from sklearn.model_selection import StratifiedKFold
import matplotlib.pyplot as plt`;

const T_ISLP = "https://www.statlearning.com/";

export const M8: ModuleContent = {
  id: "M8",
  duration: "2 semanas, cerca de 6 horas",
  intro:
    "No fim deste módulo deve saber ajustar e interpretar regressões lineares e logísticas no scikit-learn, incluindo variáveis categóricas, ler coeficientes como efeitos e como razões de chances, usar Ridge e Lasso para controlar o sobreajuste e escolher entre modelos com validação cruzada.",
  outcomes: [
    "Ajustar e interpretar regressões lineares e logísticas no scikit-learn, incluindo variáveis categóricas",
    "Ler coeficientes como efeitos e como razões de chances",
    "Usar Ridge e Lasso para controlar o sobreajuste",
    "Escolher entre modelos com validação cruzada",
  ],
  goldenRule:
    "Tentar cada exercício antes de abrir o gabarito. Usar um assistente de IA para explicar um erro é válido; pedir-lhe a resposta não é.",
  sessions: [
    {
      id: "w1s1",
      label: "Semana 1 · sessão 1",
      minutes: 90,
      tasks: [
        { id: "t1", text: "Ler a secção 1", link: { kind: "section", id: "s1" } },
        { id: "t2", text: "Ler James et al. (2023), sec. 3.3", link: { kind: "url", href: T_ISLP } },
      ],
    },
    {
      id: "w1s2",
      label: "Semana 1 · sessão 2",
      minutes: 90,
      tasks: [
        { id: "t1", text: "Ler a secção 2", link: { kind: "section", id: "s2" } },
        { id: "t2", text: "Ler James et al. (2023), sec. 4.3", link: { kind: "url", href: T_ISLP } },
        { id: "t3", text: "Exercícios 1 a 4", link: { kind: "tab", tab: "exercicios" } },
      ],
    },
    {
      id: "w2s1",
      label: "Semana 2 · sessão 1",
      minutes: 90,
      tasks: [
        { id: "t1", text: "Ler as secções 3 e 4", link: { kind: "section", id: "s3" } },
        { id: "t2", text: "Ler James et al. (2023), sec. 6.2", link: { kind: "url", href: T_ISLP } },
        { id: "t3", text: "Exercícios 5 a 8", link: { kind: "tab", tab: "exercicios" } },
      ],
    },
    {
      id: "w2s2",
      label: "Semana 2 · sessão 2",
      minutes: 90,
      tasks: [
        { id: "t1", text: "Ler a secção 5", link: { kind: "section", id: "s5" } },
        { id: "t2", text: "Exercícios 9 e 10", link: { kind: "tab", tab: "exercicios" } },
        { id: "t3", text: "Rever a apostila", link: { kind: "tab", tab: "apostila" } },
        { id: "t4", text: "Fazer a prova", link: { kind: "tab", tab: "prova" } },
      ],
    },
  ],

  // ---------------------------------------------------------------- AULA
  lesson: [
    {
      id: "s1",
      num: 1,
      title: "Regressão linear com scikit-learn: coeficientes e variáveis categóricas",
      minutes: 25,
      blocks: [
        {
          t: "callout",
          tone: "info",
          title: "Como estudar este módulo",
          text: "Os modelos lineares são velhos conhecidos: a regressão linear foi programada de raiz no mini-projeto da Fase 1, e a regressão logística apareceu no M7. Aqui aprende-se a usá-los bem: interpretar os coeficientes, lidar com variáveis de texto e controlar o sobreajuste. Todo o código foi testado com scikit-learn 1.9 e funciona a partir da versão 1.4. Os resultados nos comentários são os reais.",
        },
        { t: "p", text: "O modelo é o do mini-projeto da Fase 1, agora com qualquer número de variáveis:" },
        { t: "code", title: "Fórmula", code: F_LIN },
        {
          t: "p",
          text: "No scikit-learn, `LinearRegression` faz o mesmo que o `np.linalg.lstsq` da Fase 1; depois do `fit`, os coeficientes ficam em `coef_` e o termo constante em `intercept_`.",
        },
        { t: "h3", text: "Variáveis categóricas" },
        {
          t: "p",
          text: "Um modelo linear só trabalha com números. Uma variável de texto com k categorias, como a posição na prateleira em `Carseats` (Bad, Medium, Good), transforma-se em k − 1 colunas de zeros e uns, a **codificação one-hot**. A categoria que fica sem coluna é a **referência**: os coeficientes das outras medem a diferença em relação a ela (James et al., 2023, sec. 3.3.1).",
        },
        {
          t: "p",
          text: "Porquê k − 1 e não k? Com as três colunas, a sua soma seria sempre 1, igual à coluna do termo constante: as colunas seriam linearmente dependentes (M4) e os coeficientes deixariam de ter uma solução única. É o que faz `drop_first=True`.",
        },
        { t: "code", title: "Regressão linear com Carseats", code: C_CARSEATS, output: O_CARSEATS },
        {
          t: "p",
          text: "O objetivo aqui é interpretar, não prever, por isso o modelo é ajustado com os 400 casos. As vendas estão em milhares de unidades, o preço em dólares e a publicidade em milhares de dólares.",
        },
        {
          t: "table",
          head: ["Coeficiente", "Leitura, mantendo as outras variáveis iguais"],
          rows: [
            ["Price = −0,095", "Cada dólar a mais no preço está associado a menos 95 unidades vendidas"],
            ["Advertising = 0,123", "Cada mil dólares de publicidade estão associados a mais 123 unidades"],
            ["ShelveLoc_Good = 4,850", "Uma boa posição na prateleira está associada a mais 4850 unidades do que uma má (a referência)"],
            ["ShelveLoc_Medium = 1,957", "Uma posição média, a mais 1957 unidades do que uma má"],
          ],
        },
        {
          t: "p",
          text: "Dois cuidados. \"Mantendo as outras variáveis iguais\" é uma condição forte: se duas variáveis andam juntas, como preço e preço da concorrência, um coeficiente sozinho conta só parte da história. E \"associado a\" não é \"causa\": com dados observacionais, aplica-se tudo o que o M6 disse sobre variáveis de confusão.",
        },
        { t: "h3", text: "Que variável pesa mais?" },
        {
          t: "p",
          text: "Os coeficientes acima estão em unidades diferentes (dólares, anos, milhares de habitantes), por isso o seu tamanho não se compara diretamente. Padronizando as variáveis, cada coeficiente passa a ser o efeito de um desvio padrão de variação:",
        },
        { t: "code", title: "Coeficientes padronizados", code: C_PADRONIZAR, output: O_PADRONIZAR },
        {
          t: "p",
          text: "O preço e a posição na prateleira são as alavancas que mais pesam nas vendas; a publicidade vem em quinto. Padronizar colunas de zeros e uns é discutível (um \"desvio padrão\" de uma variável binária é pouco intuitivo), mas serve para uma primeira ordenação.",
        },
        { t: "h3", text: "Para além de retas" },
        {
          t: "p",
          text: "Um modelo linear é linear nos coeficientes, não necessariamente nas variáveis. Pode acrescentar colunas transformadas, como o preço ao quadrado ou o logaritmo do rendimento, e **interações**, o produto de duas variáveis, quando o efeito de uma depende da outra (por exemplo, se a publicidade rende mais em lojas com boa posição na prateleira). Cada coluna nova deve justificar-se na validação cruzada, como no exercício 4.",
        },
        {
          t: "p",
          text: "O scikit-learn não dá erros padrão nem valores-p para os coeficientes. Para isso usa-se a biblioteca `statsmodels`, como fazem os laboratórios do livro de James et al. (2023).",
        },
        {
          t: "check",
          id: "qc1",
          q: "No modelo de `Carseats`, a posição na prateleira (Bad, Medium, Good) entra com `drop_first=True`. O que mede o coeficiente `ShelveLoc_Medium` = 1,957?",
          options: [
            "As vendas médias das lojas com posição média: 1957 unidades",
            "A diferença em relação a uma posição má (a referência): mais 1957 unidades, mantendo o resto igual",
            "A diferença em relação a uma posição boa: mais 1957 unidades",
            "O efeito causal de passar uma loja para uma posição média",
          ],
          answer: 1,
          explain:
            "Bad é a categoria sem coluna, a referência; o coeficiente de cada outra categoria é a diferença face a ela, com as outras variáveis iguais. É uma associação em dados observacionais, não um efeito causal.",
        },
      ],
    },
    {
      id: "s2",
      num: 2,
      title: "Regressão logística: probabilidades, chances e o paradoxo dos estudantes",
      minutes: 30,
      blocks: [
        { t: "p", text: "Para prever um sim ou não, a regressão linear tem um problema óbvio: a reta não respeita os limites de uma probabilidade." },
        {
          t: "figure",
          src: "img/01-linear-vs-logistica.png",
          alt: "Com os dados Default, a regressão linear dá probabilidades negativas; a logística fica sempre entre 0 e 1",
        },
        {
          t: "p",
          text: "A **regressão logística** passa a combinação linear pela sigmoide do M5, que transforma qualquer número num valor entre 0 e 1:",
        },
        { t: "code", title: "Fórmula", code: F_SIG },
        {
          t: "p",
          text: "Os coeficientes estimam-se por máxima verosimilhança, ou seja, minimizando a entropia cruzada binária do M6, com um método de otimização baseado no gradiente como os do M5.",
        },
        { t: "h3", text: "Chances e razões de chances" },
        {
          t: "p",
          text: "A melhor forma de ler os coeficientes passa pelas **chances** (*odds*): a probabilidade de acontecer a dividir pela de não acontecer, p / (1 − p). Uma probabilidade de 20% corresponde a chances de 0,2 / 0,8 = 0,25, \"uma para quatro\". Fazendo as contas, a regressão logística é linear no logaritmo das chances:",
        },
        { t: "code", title: "Fórmula", code: F_LOGIT },
        {
          t: "p",
          text: "Daqui sai a interpretação: aumentar xⱼ numa unidade, mantendo o resto igual, multiplica as chances por e^βⱼ, a **razão de chances** (*odds ratio*). Um coeficiente de 0,4 dá e^0,4 ≈ 1,49: chances 49% maiores. Um coeficiente negativo dá uma razão abaixo de 1.",
        },
        {
          t: "widget",
          name: "m8-logistica",
          caption:
            "A regressão logística só com o saldo, nos 10 000 clientes do Default (agrupados de 100 em 100 dólares de saldo). Mexa em β₀ e β₁ e veja a entropia cruzada; \"Máxima verosimilhança\" dá a curva da figura (β₀ ≈ −10,65, β₁ ≈ 0,0055). A razão de chances lê-se por cada 100 dólares, como na aula: só com o saldo dá cerca de 1,73; o 1,78 da aula é do modelo com o saldo e o estudante.",
        },
        { t: "h3", text: "O paradoxo dos estudantes" },
        {
          t: "p",
          text: "Os estudantes do conjunto `Default` falham mais vezes: 4,3% contra 2,9%. Ser estudante aumenta o risco? O livro de James et al. (2023, sec. 4.3.4) usa este exemplo, e a resposta surpreende:",
        },
        {
          t: "code",
          title: "Estudantes, com e sem o saldo",
          code: C_ESTUDANTES,
          output: "{'No': 0.0292, 'Yes': 0.0431}\n0.401\n0.00574 -0.715\n1.49 0.49 1.78",
        },
        {
          t: "p",
          text: "`C=np.inf` desliga a penalização que o scikit-learn aplica por omissão (a da secção 3), para obter os coeficientes de máxima verosimilhança puros, como nos livros. Para prever, o valor por omissão `C=1.0` é geralmente bom.",
        },
        {
          t: "table",
          head: ["Modelo", "Coeficiente de estudante", "Razão de chances", "Leitura"],
          rows: [
            ["Só estudante", "+0,401", "1,49", "Os estudantes têm chances 49% maiores de falhar"],
            ["Estudante e saldo", "−0,715", "0,49", "**Com o mesmo saldo**, os estudantes têm metade das chances"],
          ],
        },
        {
          t: "p",
          text: "O coeficiente mudou de sinal. Cada 100 dólares a mais de saldo multiplicam as chances por 1,78, e os estudantes têm saldos mais altos:",
        },
        { t: "code", title: "O mesmo saldo e os saldos médios", code: C_NOVOS, output: "[0.105 0.054]\n{'No': 772.0, 'Yes': 988.0}" },
        {
          t: "p",
          text: "É o paradoxo de Simpson do M6, agora dentro de um modelo: o saldo é uma variável de confusão. Para um banco, as duas leituras são verdadeiras e servem para coisas diferentes. Sem saber o saldo, um estudante é um cliente de mais risco; sabendo o saldo, é de menos risco do que um não estudante com o mesmo saldo.",
        },
        { t: "h3", text: "Mais de duas classes" },
        {
          t: "p",
          text: "Com k classes, a regressão logística generaliza-se para a **regressão softmax** (ou multinomial): um conjunto de coeficientes por classe, e a função softmax a transformar as k pontuações em probabilidades que somam 1. O `LogisticRegression` faz isto automaticamente quando `y` tem mais de duas classes. A mesma softmax está na última camada dos classificadores neuronais (M12) e dos LLMs (M17).",
        },
        {
          t: "check",
          id: "qc2",
          q: "No modelo com o saldo, o coeficiente de estudante é −0,715 (e^−0,715 ≈ 0,49). Para dois clientes com o mesmo saldo, isto quer dizer que o estudante tem:",
          options: [
            "Exatamente metade da probabilidade de falhar, seja qual for o saldo",
            "Uma probabilidade de falhar 0,715 menor",
            "Chances de falhar 71,5% menores",
            "Cerca de metade das chances de falhar",
          ],
          answer: 3,
          explain:
            "A razão de chances é e^−0,715 ≈ 0,49: as chances, p / (1 − p), ficam a cerca de metade. A probabilidade não muda por um fator fixo; com 1500 dólares de saldo passa de 0,105 para 0,054, perto de metade porque as probabilidades são pequenas.",
        },
      ],
    },
    {
      id: "s3",
      num: 3,
      title: "Regularização: Ridge e Lasso",
      minutes: 35,
      blocks: [
        {
          t: "p",
          text: "Os mínimos quadrados escolhem os coeficientes que melhor se ajustam ao treino. Com muitas variáveis, poucas observações ou variáveis muito correlacionadas entre si, isso dá coeficientes enormes e instáveis: variância alta, no sentido do M7. A **regularização** troca um pouco de viés por muito menos variância, penalizando coeficientes grandes.",
        },
        { t: "code", title: "Fórmula", code: F_PEN },
        {
          t: "p",
          text: "O **Ridge** (Hoerl & Kennard, 1970) penaliza os quadrados dos coeficientes, a norma L2 do M4. O **Lasso** (Tibshirani, 1996) penaliza os valores absolutos, a norma L1. O parâmetro α controla a força: com α = 0 volta-se aos mínimos quadrados; com α muito grande, todos os coeficientes vão para zero. O termo constante não é penalizado.",
        },
        {
          t: "p",
          text: "Duas regras práticas: **padronizar sempre** as variáveis antes (a penalização depende das unidades: um coeficiente em euros e outro em cêntimos seriam penalizados de forma muito diferente) e **escolher α por validação cruzada**. No scikit-learn, `RidgeCV` e `LassoCV` fazem as duas coisas de uma vez. As escalas de α não são comparáveis entre Ridge e Lasso, porque o scikit-learn escreve as duas funções com constantes diferentes.",
        },
        { t: "h3", text: "Os dados: salários de basebol" },
        {
          t: "p",
          text: "O conjunto `Hitters` (James et al., 2023, sec. 6.5) tem o salário de 263 jogadores de basebol da liga norte-americana em 1987, em milhares de dólares, e 19 variáveis sobre o seu desempenho na época anterior (1986) e ao longo da carreira. Muitas destas variáveis andam juntas (quem tem mais tacadas tem mais pontos), o terreno ideal para a regularização.",
        },
        {
          t: "figure",
          src: "img/02-caminhos-regularizacao.png",
          alt: "Caminhos dos coeficientes no Ridge e no Lasso, em função da força da penalização",
        },
        {
          t: "p",
          text: "Os caminhos mostram a diferença essencial. No Ridge, os coeficientes encolhem todos juntos para zero, sem nunca lá chegar. No Lasso, vão chegando a zero um a um: o Lasso faz **seleção de variáveis**.",
        },
        {
          t: "widget",
          name: "m8-caminhos",
          caption:
            "Os caminhos da figura, com os 263 jogadores e as variáveis padronizadas: mude α e veja os 19 coeficientes. Os valores são os de `Ridge(alpha)` e `Lasso(alpha)` do scikit-learn; α = 2,65 é o que o `LassoCV` da aula escolhe e α = 60,21 o da regra de um erro padrão (secção 4).",
        },
        { t: "h3", text: "Porque é que o Lasso põe coeficientes a zero" },
        {
          t: "p",
          text: "As duas penalizações podem ler-se como uma restrição: encontrar os melhores coeficientes dentro de uma região à volta da origem (James et al., 2023, sec. 6.2.2). A do Ridge é um círculo; a do Lasso é um losango, com cantos em cima dos eixos. As curvas de nível do erro (elipses) tocam a região pela primeira vez muitas vezes num canto do losango, onde um dos coeficientes é exatamente zero:",
        },
        {
          t: "figure",
          src: "img/03-geometria-l1-l2.png",
          alt: "À esquerda, o losango do Lasso toca as curvas de nível num canto; à direita, o círculo do Ridge toca numa curva",
        },
        {
          t: "widget",
          name: "m8-geometria",
          caption:
            "A figura com as mesmas elipses, para qualquer tamanho da região e qualquer solução dos mínimos quadrados. A solução de cada método é o ponto da região com o menor erro.",
        },
        { t: "h3", text: "Quando é que a regularização ajuda?" },
        {
          t: "p",
          text: "A experiência seguinte treina os três modelos 30 vezes, cada uma com uma amostra aleatória de jogadores, e avalia nos restantes. Primeiro com só 40 jogadores de treino, depois com 180:",
        },
        { t: "code", title: "Mínimos quadrados, Ridge e Lasso com 40 e 180 jogadores", code: C_EXPERIENCIA, output: O_EXPERIENCIA },
        {
          t: "p",
          text: "Com 40 jogadores para 19 variáveis, os mínimos quadrados sobreajustam e o Ridge reduz o erro em mais de 100 mil dólares (22%). Com 180 jogadores, os três empatam: com dados suficientes, a variância dos mínimos quadrados já é baixa e não há o que ganhar. A regularização é um remédio contra a variância, e ajuda na medida em que ela existe. Repare que `RidgeCV` e `LassoCV`, dentro de cada uma das 30 divisões, escolhem o seu α só com os dados de treino dessa divisão, como deve ser.",
        },
        { t: "p", text: "Nos dados completos, o Lasso fica com 13 das 19 variáveis:" },
        { t: "code", title: "O Lasso nos dados completos", code: C_LASSO, output: "2.65 13 ['HmRun', 'Runs', 'RBI', 'CAtBat', 'CHits', 'NewLeague_N']" },
        {
          t: "p",
          text: "`lasso[-1]` é o último passo do pipeline, o próprio `LassoCV`. As variáveis eliminadas são, na maioria, redundantes com outras que ficaram: por exemplo, `CHits` (tacadas certeiras na carreira) diz quase o mesmo que `CRuns` e `CRBI`.",
        },
        { t: "h3", text: "Variantes e ligações" },
        {
          t: "list",
          items: [
            "A **Elastic Net** (Zou & Hastie, 2005) mistura as duas penalizações: seleciona variáveis como o Lasso, mas lida melhor com grupos de variáveis correlacionadas. No scikit-learn: `ElasticNetCV`.",
            "A regressão logística do scikit-learn já vem regularizada, com uma penalização do tipo Ridge. O parâmetro `C` é o inverso de α: **um C menor penaliza mais**.",
            "A penalização L2 reaparece no treino de redes neuronais com o nome de *weight decay* (M13), e foi o que o AdamW do M5 separou do Adam.",
          ],
        },
        {
          t: "check",
          id: "qc3",
          q: "Com 40 jogadores de treino, o Ridge baixou o RMSE médio de 485,9 para 377,8 mil dólares; com 180 jogadores, os três modelos empataram. Porquê?",
          options: [
            "Com 180 jogadores, a variância dos mínimos quadrados já é baixa, e a regularização não tem o que corrigir",
            "Com 180 jogadores, o RidgeCV escolhe sempre α = 0",
            "A regularização reduz o viés, e com mais dados o viés desaparece",
            "Com 180 jogadores, o Lasso elimina todas as variáveis",
          ],
          answer: 0,
          explain:
            "A regularização troca um pouco de viés por menos variância. Com 40 jogadores para 19 variáveis, os mínimos quadrados sobreajustam (variância alta); com 180, essa variância já é baixa e não há o que ganhar.",
        },
      ],
    },
    {
      id: "s4",
      num: 4,
      title: "Seleção de modelos: validação cruzada e a regra de um erro padrão",
      minutes: 25,
      blocks: [
        {
          t: "p",
          text: "Escolher as variáveis, o valor de α ou o tipo de modelo é sempre o mesmo problema: estimar qual das opções vai errar menos em dados novos. O erro de treino não serve, porque desce sempre com a complexidade (M7). Restam duas famílias de métodos (James et al., 2023, sec. 6.1.3):",
        },
        {
          t: "list",
          items: [
            "**Estimar o erro diretamente**, com validação ou validação cruzada. É o método geral, e o único usado neste curso.",
            "**Corrigir o erro de treino** com uma penalização pela complexidade: os critérios AIC, BIC e o R² ajustado. São rápidos e clássicos em estatística, mas assumem um modelo correto e servem só para alguns tipos de modelos.",
          ],
        },
        { t: "h3", text: "A regra de um erro padrão" },
        {
          t: "p",
          text: "A validação cruzada dá uma média e uma incerteza (M6). Quando vários modelos têm erros que diferem menos do que essa incerteza, não há razão para preferir o mais complexo. A **regra de um erro padrão** (Hastie, Tibshirani & Friedman, 2009, sec. 7.10) escolhe o modelo mais simples cujo erro de validação cruzada fica a menos de um erro padrão do melhor. No Lasso, \"mais simples\" quer dizer α maior, com menos variáveis:",
        },
        {
          t: "code",
          title: "Regra de um erro padrão no Lasso",
          code: C_UM_EP,
          output: "3.1 334.2 13\n60.21 350.2 ['Hits', 'Walks', 'CRuns', 'CRBI', 'PutOuts', 'Division_W']",
        },
        {
          t: "p",
          text: "O melhor α usa 13 variáveis, com um erro de 334 mil dólares. A regra de um erro padrão fica com 6, com um erro de 350 mil: estatisticamente indistinguível, e muito mais fácil de explicar e de manter. Para um modelo que vai ser usado por pessoas, as seis variáveis (tacadas certeiras e bases por bolas na época anterior, corridas e corridas impulsionadas na carreira, eliminações defensivas e a divisão) contam uma história clara.",
        },
        { t: "h3", text: "Métodos clássicos de seleção de variáveis" },
        {
          t: "p",
          text: "Antes do Lasso, a seleção fazia-se por procura: a **seleção progressiva** (*forward stepwise*) começa sem variáveis e acrescenta, uma a uma, a que mais melhora o modelo; a **regressiva** (*backward*) começa com todas e vai tirando. No scikit-learn, `SequentialFeatureSelector` faz as duas, avaliando cada passo por validação cruzada. São úteis com poucas variáveis; com muitas, o Lasso é mais rápido e mais estável.",
        },
        { t: "h3", text: "Um procedimento que funciona" },
        {
          t: "list",
          ordered: true,
          items: [
            "Fixar as divisões da validação cruzada (`KFold(..., shuffle=True, random_state=...)`) e usá-las para todos os candidatos, para que a comparação seja justa.",
            "Comparar poucos candidatos razoáveis, sempre com uma linha de base.",
            "Olhar para a média e para o desvio padrão. Diferenças menores do que a variação entre partes não são diferenças.",
            "Em caso de empate, escolher o mais simples.",
            "Só no fim, avaliar o escolhido no teste.",
          ],
        },
        {
          t: "check",
          id: "qc4",
          q: "No Lasso da secção 4, o melhor α dá 13 variáveis e um RMSE de validação cruzada de 334,2 mil dólares; a regra de um erro padrão escolhe α = 60,21, com 6 variáveis e 350,2. Porque se prefere o segundo?",
          options: [
            "Porque tem o menor erro de treino",
            "Porque o seu erro de validação cruzada é o menor",
            "Porque fica a menos de um erro padrão do melhor, o que o torna estatisticamente indistinguível, e é muito mais simples",
            "Porque um Lasso com α grande nunca sobreajusta",
          ],
          answer: 2,
          explain:
            "O erro de 350,2 é maior do que 334,2, mas a diferença é menor do que a incerteza da validação cruzada. Em caso de empate, escolhe-se o mais simples: seis variáveis são mais fáceis de explicar e de manter.",
        },
      ],
    },
    {
      id: "s5",
      num: 5,
      title: "Quando usar modelos lineares",
      minutes: 15,
      blocks: [
        {
          t: "p",
          text: "Os modelos lineares são os mais antigos da caixa de ferramentas e continuam entre os mais usados. Vale a pena saber exatamente porquê, e quando passar a outra coisa.",
        },
        {
          t: "table",
          head: ["Pontos fortes", "Pontos fracos"],
          rows: [
            ["Interpretáveis: cada coeficiente tem uma leitura direta", "Só captam relações não lineares e interações se alguém as criar à mão"],
            ["Rápidos de treinar e de usar, mesmo com milhões de linhas", "Os mínimos quadrados são sensíveis a valores extremos"],
            ["Precisam de poucos dados, sobretudo com regularização", "Extrapolam em linha reta para fora dos dados, muitas vezes mal"],
            ["A regressão logística dá probabilidades geralmente fiáveis", "Com regularização, exigem variáveis padronizadas"],
            [
              "Funcionam muito bem com milhares de variáveis esparsas, como as contagens de palavras do M1",
              "Em dados com muita estrutura não linear, perdem para árvores e ensembles (M9)",
            ],
          ],
        },
        { t: "h3", text: "Onde aparecem na prática" },
        {
          t: "list",
          items: [
            "**Linha de base.** Antes de um modelo complexo, um linear bem feito diz quanto há para ganhar.",
            "**Risco de crédito.** Os modelos de pontuação bancária são muitas vezes regressões logísticas, porque a regulação exige explicar cada decisão ao cliente.",
            "**Marketing mix.** Os modelos usados para repartir o orçamento entre canais (*marketing mix models*) são, no essencial, regressões com variáveis transformadas para captar o efeito acumulado e a saturação da publicidade. O Robyn, da Meta, por exemplo, usa uma regressão Ridge.",
            "**Texto e dados esparsos.** Classificação de documentos com milhares de palavras como variáveis.",
            "**Dentro das redes neuronais.** Cada camada de uma rede é uma transformação linear seguida de uma função simples, e a última camada de um classificador é uma regressão logística (M12).",
          ],
        },
        { t: "h3", text: "Sinais de que é preciso outro modelo" },
        {
          t: "p",
          text: "Depois de ajustar um modelo linear, desenhe os **resíduos** (real menos previsto) contra as previsões e contra cada variável importante. Se aparecer uma curva, um funil ou grupos, há estrutura que o modelo não capta. Pode acrescentar transformações e interações, ou passar aos modelos do M9, que encontram essas relações sozinhos.",
        },
        {
          t: "check",
          id: "qc5",
          q: "Desenhou os resíduos de uma regressão linear contra as previsões e apareceu uma curva em forma de U. O que indica?",
          options: [
            "Que o modelo está bem: os resíduos são só ruído",
            "Que há estrutura não linear que o modelo não capta: acrescentar transformações ou interações, ou passar aos modelos do M9",
            "Que falta regularização: aumentar o α",
            "Que as variáveis não foram padronizadas",
          ],
          answer: 1,
          explain:
            "Resíduos sem padrão parecem ruído; uma curva, um funil ou grupos mostram estrutura que o modelo linear não capta. A regularização trata a variância, não a falta de flexibilidade.",
        },
      ],
    },
  ],

  readings: {
    required: [
      {
        text: "James, G., Witten, D., Hastie, T., Tibshirani, R. & Taylor, J. (2023). [*An Introduction to Statistical Learning with Applications in Python*](https://www.statlearning.com/). Springer. Cap. 3 (regressão linear, variáveis categóricas, interações), cap. 4 (regressão logística) e cap. 6 (seleção de variáveis, Ridge e Lasso). Gratuito.",
        href: "https://www.statlearning.com/",
      },
    ],
    complementary: [
      { text: "StatQuest (Josh Starmer): \"Logistic Regression\", \"Regularization Part 1: Ridge (L2) Regression\" e \"Regularization Part 2: Lasso (L1) Regression\"." },
      {
        text: "Hastie, T., Tibshirani, R. & Friedman, J. (2009). [*The Elements of Statistical Learning*](https://hastie.su.domains/ElemStatLearn/) (2.ª ed.). Springer. Caps. 3 e 4, e sec. 7.10 (validação cruzada e regra de um erro padrão). Gratuito.",
        href: "https://hastie.su.domains/ElemStatLearn/",
      },
      {
        text: "Documentação do scikit-learn: [Linear Models](https://scikit-learn.org/stable/modules/linear_model.html).",
        href: "https://scikit-learn.org/stable/modules/linear_model.html",
      },
      {
        text: "[Robyn](https://github.com/facebookexperimental/Robyn), da Meta: código aberto de *marketing mix modeling*.",
        href: "https://github.com/facebookexperimental/Robyn",
      },
    ],
    cited: [
      "Hoerl, A. E. & Kennard, R. W. (1970). Ridge regression: biased estimation for nonorthogonal problems. *Technometrics*, 12(1), 55–67.",
      "Tibshirani, R. (1996). Regression shrinkage and selection via the lasso. *Journal of the Royal Statistical Society: Series B*, 58(1), 267–288.",
      "Zou, H. & Hastie, T. (2005). Regularization and variable selection via the elastic net. *Journal of the Royal Statistical Society: Series B*, 67(2), 301–320.",
    ],
  },

  // ---------------------------------------------------------------- APOSTILA (02-apostila.md)
  apostila: {
    intro:
      "Resumo para rever antes da prova. Use-o também para a prática de recuperação: tape a coluna da direita das tabelas e tente lembrar-se.",
    sections: [
      {
        title: "Fórmulas essenciais",
        blocks: [
          {
            t: "code",
            title: "Fórmulas",
            code: "linear:  y ≈ β₀ + Σⱼ βⱼxⱼ        logística:  log [p / (1 − p)] = β₀ + Σⱼ βⱼxⱼ        razão de chances = e^βⱼ\n\nRidge:  RSS + α Σⱼ βⱼ²        Lasso:  RSS + α Σⱼ |βⱼ|",
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
              ["One-hot com k − 1 colunas", "Uma categoria fica como referência; os coeficientes são diferenças face a ela"],
              ["Coeficiente linear", "Variação de y por unidade de x, mantendo o resto igual; associação, não causa"],
              ["Coeficientes padronizados", "Efeito de um desvio padrão; permitem comparar variáveis"],
              ["Interação", "Produto de duas variáveis: o efeito de uma depende da outra"],
              ["Chances (odds)", "p / (1 − p)"],
              ["Razão de chances", "e^β: fator pelo qual as chances se multiplicam por unidade de x"],
              ["Paradoxo dos estudantes", "O sinal de um coeficiente muda quando se junta uma variável de confusão (o saldo)"],
              ["Softmax", "Regressão logística com mais de duas classes"],
              ["Ridge (L2)", "Encolhe todos os coeficientes; nenhum chega a zero"],
              ["Lasso (L1)", "Põe coeficientes a zero: seleciona variáveis"],
              ["Elastic Net", "Mistura L1 e L2; boa com grupos de variáveis correlacionadas"],
              ["α (e C = 1/α na logística)", "Força da penalização; escolhe-se por validação cruzada"],
              ["Regra de um erro padrão", "O modelo mais simples a menos de um erro padrão do melhor"],
            ],
          },
          {
            t: "p",
            text: "A regularização ajuda quando a variância é alta: poucas observações para o número de variáveis, ou variáveis muito correlacionadas.",
          },
        ],
      },
      {
        title: "Código",
        blocks: [
          {
            t: "code",
            title: "scikit-learn",
            code: `X = pd.get_dummies(df, drop_first=True, dtype=int)          # categorias -> colunas 0/1
LinearRegression().fit(X, y).coef_
LogisticRegression(C=np.inf).fit(X, y)                      # sem penalização, para interpretar
np.exp(modelo.coef_)                                        # razões de chances
make_pipeline(StandardScaler(), RidgeCV(alphas=np.logspace(-2, 4, 60)))
make_pipeline(StandardScaler(), LassoCV(alphas=..., cv=KFold(10, shuffle=True, random_state=0)))
pipeline[-1].alpha_, pipeline[-1].coef_, pipeline[-1].mse_path_   # o último passo do pipeline`,
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
              "Criar k colunas para k categorias, em vez de k − 1, num modelo com termo constante.",
              "Ler um coeficiente como efeito causal.",
              "Comparar tamanhos de coeficientes de variáveis em unidades diferentes.",
              "Aplicar Ridge ou Lasso sem padronizar.",
              "Esquecer que a `LogisticRegression` do scikit-learn vem regularizada (C = 1).",
              "Escolher α pelo erro de treino.",
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
      title: "Parte A — Conceitos e contas",
      note: "Dez exercícios, cerca de 3 horas no total.",
    },
    {
      id: "B",
      title: "Parte B — Colab",
      note: "Partem do código da aula, no Colab: as soluções usam as variáveis da aula (`cs`, `X`, `df`, `y`, `Xh`, `yh`, `URL`) e os imports das secções 1 a 4.",
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
      title: "Codificação one-hot do canal",
      minutes: 10,
      sections: ["s1"],
      prompt: [
        {
          t: "p",
          text: "A variável `canal` toma os valores Loja, Online e Telefone. (a) Com `pd.get_dummies(..., drop_first=True)`, que colunas aparecem, e qual é a categoria de referência? (b) Escreva essas colunas para três clientes: um de cada canal. (c) Porque é que, num modelo com termo constante, não se usam as três colunas?",
        },
      ],
      fields: [
        { id: "a", label: "(a) Colunas e categoria de referência", rows: 2 },
        { id: "b", label: "(b) As colunas para um cliente de cada canal", rows: 4, mono: true, placeholder: "Loja:     (…, …)\nOnline:   (…, …)\nTelefone: (…, …)" },
        { id: "c", label: "(c) Porque não as três colunas", rows: 3 },
      ],
      criteria: [
        "(a) `canal_Online` e `canal_Telefone`; Loja é a referência (a primeira por ordem alfabética)",
        "(b) Loja: (0, 0); Online: (1, 0); Telefone: (0, 1)",
        "(c) A soma das três colunas seria sempre 1, igual à coluna do termo constante: ficavam linearmente dependentes e os coeficientes não teriam solução única",
      ],
      solution: [
        {
          t: "p",
          text: "(a) `canal_Online` e `canal_Telefone`; Loja é a referência (a primeira por ordem alfabética). (b) Loja: (0, 0); Online: (1, 0); Telefone: (0, 1). (c) Com as três colunas, a sua soma seria sempre 1, igual à coluna do termo constante: as colunas ficavam linearmente dependentes e os coeficientes não teriam solução única.",
        },
      ],
    },
    {
      id: "e2",
      num: 2,
      part: "A",
      session: "w1s2",
      kind: "text",
      title: "Ler um modelo de vendas",
      minutes: 10,
      sections: ["s1"],
      prompt: [
        {
          t: "p",
          text: "Um modelo para as vendas semanais de uma loja (em milhares de unidades) é: vendas = 12 + 0,12 × publicidade − 0,09 × preço + 4,8 × boa_prateleira, com a publicidade em milhares de euros e o preço em euros. (a) Quanto prevê para publicidade = 10, preço = 120 e boa prateleira? (b) Quanto mudam as vendas se o preço subir 10 €, mantendo o resto? (c) Este modelo prova que baixar o preço aumenta as vendas? Porquê?",
        },
      ],
      fields: [
        { id: "a", label: "(a) Previsão, com a conta", rows: 2 },
        { id: "b", label: "(b) Efeito de subir o preço 10 €", rows: 2 },
        { id: "c", label: "(c) Prova causalidade? Porquê?", rows: 4 },
      ],
      criteria: [
        "(a) 12 + 0,12 × 10 − 0,09 × 120 + 4,8 = 12 + 1,2 − 10,8 + 4,8 = 7,2 mil unidades",
        "(b) −0,09 × 10 = −0,9: menos 900 unidades",
        "(c) Não: o coeficiente mede uma associação em dados observacionais; o preço pode estar ligado a outras coisas (por exemplo, lojas mais caras em zonas com menos procura)",
        "(c) Para medir o efeito causal do preço seria preciso uma experiência, como os testes A/B do M6",
      ],
      solution: [
        {
          t: "p",
          text: "(a) 12 + 0,12 × 10 − 0,09 × 120 + 4,8 = 12 + 1,2 − 10,8 + 4,8 = 7,2 mil unidades. (b) −0,09 × 10 = −0,9: menos 900 unidades. (c) Não. O coeficiente mede uma associação em dados observacionais; o preço pode estar ligado a outras coisas (lojas mais caras em zonas com menos procura, por exemplo). Para medir o efeito causal do preço seria preciso uma experiência, como os testes A/B do M6.",
        },
      ],
    },
    {
      id: "e3",
      num: 3,
      part: "A",
      session: "w1s2",
      kind: "text",
      title: "Abrir o email: razão de chances",
      minutes: 15,
      sections: ["s2"],
      prompt: [
        {
          t: "p",
          text: "Uma regressão logística para a compra de um produto tem coeficiente 0,7 para a variável \"abriu o email\" (0 ou 1). (a) Qual é a razão de chances? (b) Um cliente que não abriu o email tem probabilidade de compra de 0,2. Que probabilidade teria se o tivesse aberto, mantendo o resto igual? (c) E se o coeficiente fosse −0,5?",
        },
      ],
      fields: [
        { id: "a", label: "(a) Razão de chances", rows: 2 },
        { id: "b", label: "(b) Nova probabilidade, com as contas", rows: 4 },
        { id: "c", label: "(c) Com coeficiente −0,5", rows: 2 },
      ],
      criteria: [
        "(a) e^0,7 ≈ 2,01: as chances duplicam",
        "(b) Chances iniciais 0,2 / 0,8 = 0,25; novas chances 0,25 × 2,01 = 0,503; probabilidade 0,503 / 1,503 ≈ 0,335",
        "(b) Nota que a probabilidade sobe de 20% para 33,5%, e não para o dobro: é a chance que duplica",
        "(c) e^−0,5 ≈ 0,61: as chances descem 39%",
      ],
      solution: [
        {
          t: "p",
          text: "(a) e^0,7 ≈ 2,01: as chances duplicam. (b) Chances iniciais 0,2 / 0,8 = 0,25; novas chances 0,25 × 2,01 = 0,503; probabilidade 0,503 / 1,503 ≈ 0,335. A probabilidade sobe de 20% para 33,5%, e não para o dobro: é a chance que duplica. (c) e^−0,5 ≈ 0,61: as chances descem 39%.",
        },
      ],
    },
    {
      id: "e4",
      num: 4,
      part: "A",
      session: "w1s2",
      kind: "text",
      title: "Ridge, Lasso ou Elastic Net?",
      minutes: 15,
      sections: ["s3"],
      prompt: [
        {
          t: "p",
          text: "Ridge, Lasso ou Elastic Net? Justifique cada escolha. (a) 500 variáveis, das quais se suspeita que só umas dez importam. (b) 20 variáveis muito correlacionadas entre si, todas provavelmente relevantes. (c) A equipa quer um modelo com poucas variáveis, fácil de explicar. Diga também porque é que, em qualquer dos casos, é preciso padronizar.",
        },
      ],
      fields: [
        { id: "a", label: "(a) 500 variáveis, umas dez importam", rows: 2 },
        { id: "b", label: "(b) 20 variáveis muito correlacionadas, todas relevantes", rows: 3 },
        { id: "c", label: "(c) Poucas variáveis, fácil de explicar", rows: 2 },
        { id: "p", label: "Porque é preciso padronizar", rows: 3 },
      ],
      criteria: [
        "(a) Lasso: faz a seleção e deixa as poucas variáveis relevantes",
        "(b) Ridge (ou Elastic Net): o Lasso tende a ficar com uma variável de cada grupo correlacionado e a eliminar as outras de forma algo arbitrária; o Ridge reparte o peso por todas",
        "(c) Lasso, com a regra de um erro padrão para ficar com ainda menos variáveis",
        "A penalização soma coeficientes de variáveis diferentes, e o tamanho de cada coeficiente depende das unidades da sua variável: sem padronizar, a penalização seria arbitrária",
      ],
      solution: [
        {
          t: "p",
          text: "(a) Lasso: faz a seleção e deixa as poucas variáveis relevantes. (b) Ridge (ou Elastic Net): o Lasso tende a ficar com uma variável de cada grupo correlacionado e a eliminar as outras de forma algo arbitrária; o Ridge reparte o peso por todas. (c) Lasso, com a regra de um erro padrão para ficar com ainda menos variáveis. Em todos os casos, a penalização soma coeficientes de variáveis diferentes, e o tamanho de cada coeficiente depende das unidades da sua variável: sem padronizar, a penalização seria arbitrária.",
        },
      ],
    },
    {
      id: "e5",
      num: 5,
      part: "B",
      session: "w2s1",
      kind: "text",
      title: "Interações em Carseats",
      minutes: 25,
      sections: ["s1", "s4"],
      prompt: [
        {
          t: "p",
          text: "Com `Carseats`, compare por validação cruzada (`KFold(5, shuffle=True, random_state=0)`, RMSE) três regressões lineares: com as variáveis da aula; com a interação `Price × ShelveLoc_Good` acrescentada; e com a interação `Income × Advertising` acrescentada. Alguma interação vale a pena?",
        },
      ],
      fields: [
        { id: "code", label: "Código e resultados", rows: 10, mono: true, placeholder: "divisoes = KFold(5, shuffle=True, random_state=0)\n…" },
        { id: "r", label: "Alguma interação vale a pena?", rows: 4 },
      ],
      criteria: [
        "Usa as mesmas divisões `KFold(5, shuffle=True, random_state=0)` para as três variantes, com `scoring=\"neg_root_mean_squared_error\"`",
        "RMSE médio (desvio padrão): aula 1.0416 (0.0957); Price x Good 1.0424 (0.0957); Income x Advertising 1.0322 (0.1025)",
        "Conclui que a interação preço × boa prateleira não ajuda",
        "Conclui que a interação rendimento × publicidade reduz o erro em 0,009, dez vezes menos do que o desvio padrão entre partes: um ganho muito pequeno e incerto, que só fica se tiver uma leitura de negócio",
      ],
      solution: [
        {
          t: "code",
          code: `divisoes = KFold(5, shuffle=True, random_state=0)
variantes = {"aula": X,
             "Price x Good": X.assign(PxG=X["Price"] * X["ShelveLoc_Good"]),
             "Income x Advertising": X.assign(IxA=X["Income"] * X["Advertising"])}
for nome, Xi in variantes.items():
    rmse = -cross_val_score(LinearRegression(), Xi, cs["Sales"], cv=divisoes, scoring="neg_root_mean_squared_error")
    print(nome, round(rmse.mean(), 4), round(rmse.std(), 4))
# aula 1.0416 0.0957
# Price x Good 1.0424 0.0957
# Income x Advertising 1.0322 0.1025`,
          output: "aula 1.0416 0.0957\nPrice x Good 1.0424 0.0957\nIncome x Advertising 1.0322 0.1025",
        },
        {
          t: "p",
          text: "A interação preço × boa prateleira não ajuda. A interação rendimento × publicidade reduz o erro em 0,009, dez vezes menos do que o desvio padrão entre partes: um ganho muito pequeno e incerto. Pode ficar se tiver uma leitura de negócio (a publicidade rende mais em zonas de maior rendimento), que é a mesma conclusão de James et al. (2023), no laboratório do cap. 3.",
        },
      ],
    },
    {
      id: "e6",
      num: 6,
      part: "B",
      session: "w2s1",
      kind: "text",
      title: "Default com saldo, rendimento e estudante",
      minutes: 20,
      sections: ["s2"],
      prompt: [
        {
          t: "p",
          text: "Com `Default`, ajuste uma regressão logística sem penalização com o saldo, o rendimento em milhares de dólares (`income / 1000`) e o indicador de estudante. Indique o termo constante, os três coeficientes e as razões de chances. Compare com a tabela 4.3 de James et al. (2023). Como interpreta a razão de chances do rendimento?",
        },
      ],
      fields: [
        { id: "code", label: "Código e resultados", rows: 6, mono: true, placeholder: "df[\"rendimento_mil\"] = df[\"income\"] / 1000\n…" },
        { id: "r", label: "Comparação com o livro e leitura da razão de chances do rendimento", rows: 4 },
      ],
      criteria: [
        "Ajusta `LogisticRegression(C=np.inf, ...)` com `balance`, `income / 1000` e `estudante`",
        "Termo constante −10.869; coeficientes 0.00574, 0.00303 e −0.64678; razões de chances 1.006, 1.003 e 0.524",
        "Nota que os valores coincidem com a tabela 4.3 do livro (−10,869; 0,0057; 0,0030; −0,6468)",
        "Cada mil dólares de rendimento multiplicam as chances por 1,003, mais 0,3%: um efeito desprezível, depois de se ter em conta o saldo e o estatuto de estudante",
      ],
      solution: [
        {
          t: "code",
          code: `df["rendimento_mil"] = df["income"] / 1000
m = LogisticRegression(C=np.inf, max_iter=5000).fit(df[["balance", "rendimento_mil", "estudante"]], y)
print(round(m.intercept_[0], 3), [f"{c:.5f}" for c in m.coef_[0]], np.exp(m.coef_[0]).round(3))
# -10.869 ['0.00574', '0.00303', '-0.64678'] [1.006 1.003 0.524]`,
          output: "-10.869 ['0.00574', '0.00303', '-0.64678'] [1.006 1.003 0.524]",
        },
        {
          t: "p",
          text: "Os valores coincidem com a tabela 4.3 do livro (−10,869; 0,0057; 0,0030; −0,6468). Cada mil dólares de rendimento multiplicam as chances por 1,003, mais 0,3%: um efeito desprezível, depois de se ter em conta o saldo e o estatuto de estudante.",
        },
      ],
    },
    {
      id: "e7",
      num: 7,
      part: "B",
      session: "w2s1",
      kind: "text",
      title: "O parâmetro C da regressão logística",
      minutes: 25,
      sections: ["s2", "s3"],
      prompt: [
        {
          t: "p",
          text: "Ainda com `Default`, ajuste `make_pipeline(StandardScaler(), LogisticRegression(C=C))` com C = 0,0001, 0,01, 1 e 100. Para cada C, registe os coeficientes e a AUC média de uma validação cruzada com `StratifiedKFold(5, shuffle=True, random_state=0)`. O que acontece aos coeficientes? E à AUC? Porque é que a AUC muda tão pouco?",
        },
      ],
      fields: [
        { id: "code", label: "Código e resultados", rows: 9, mono: true, placeholder: "Xd = df[[\"balance\", \"income\", \"estudante\"]]\nfor C in [0.0001, 0.01, 1, 100]:\n    …" },
        { id: "r", label: "Coeficientes, AUC e porque muda tão pouco", rows: 5 },
      ],
      criteria: [
        "Coeficientes e AUC: C = 0,0001 → [0.061 −0.003 0.006], 0.9418; C = 0,01 → [1.578 0.056 −0.062], 0.9489; C = 1 → [2.735 0.042 −0.289], 0.9491; C = 100 → [2.772 0.039 −0.298], 0.9491",
        "Com C muito pequeno (penalização forte), os coeficientes encolhem quase para zero; a partir de C = 1, quase não mudam",
        "A AUC muda pouco porque só depende da ordem das pontuações: enquanto o coeficiente do saldo for positivo e dominante, os clientes ficam ordenados quase da mesma forma",
        "Nota que as probabilidades ficam muito encolhidas para C pequeno, o que estragaria a escolha de um limiar pelo custo",
      ],
      solution: [
        {
          t: "code",
          code: `Xd = df[["balance", "income", "estudante"]]
for C in [0.0001, 0.01, 1, 100]:
    pipe = make_pipeline(StandardScaler(), LogisticRegression(C=C))
    coefs = pipe.fit(Xd, y)[-1].coef_[0].round(3)
    auc = cross_val_score(pipe, Xd, y, cv=StratifiedKFold(5, shuffle=True, random_state=0), scoring="roc_auc")
    print(C, coefs, round(auc.mean(), 4))
# 0.0001 [ 0.061 -0.003  0.006] 0.9418
# 0.01 [ 1.578  0.056 -0.062] 0.9489
# 1 [ 2.735  0.042 -0.289] 0.9491
# 100 [ 2.772  0.039 -0.298] 0.9491`,
          output: "0.0001 [ 0.061 -0.003  0.006] 0.9418\n0.01 [ 1.578  0.056 -0.062] 0.9489\n1 [ 2.735  0.042 -0.289] 0.9491\n100 [ 2.772  0.039 -0.298] 0.9491",
        },
        {
          t: "p",
          text: "Com C muito pequeno (penalização forte), os coeficientes encolhem quase para zero; a partir de C = 1, quase não mudam. A AUC muda pouco porque só depende da **ordem** das pontuações: enquanto o coeficiente do saldo for positivo e dominante, os clientes ficam ordenados quase da mesma forma. As probabilidades, essas, ficam muito encolhidas para C pequeno, o que estragaria a escolha de um limiar pelo custo.",
        },
      ],
    },
    {
      id: "e8",
      num: 8,
      part: "B",
      session: "w2s1",
      kind: "text",
      title: "Quatro candidatos em Hitters",
      minutes: 20,
      sections: ["s3", "s4"],
      prompt: [
        {
          t: "p",
          text: "Com `Hitters`, compare por validação cruzada com `KFold(10, shuffle=True, random_state=0)` os mínimos quadrados, o Ridge, o Lasso e a Elastic Net (`ElasticNetCV(l1_ratio=[0.1, 0.5, 0.9], alphas=np.logspace(-2, 3, 60), max_iter=50_000)`), todos padronizados. Com os 263 jogadores, há algum vencedor claro? Que `l1_ratio` escolhe a Elastic Net nos dados completos?",
        },
      ],
      fields: [
        { id: "code", label: "Código e resultados", rows: 12, mono: true, placeholder: "div10 = KFold(10, shuffle=True, random_state=0)\ncandidatos = {\n    …\n}" },
        { id: "r", label: "Há um vencedor? Que l1_ratio escolhe a Elastic Net?", rows: 4 },
      ],
      criteria: [
        "Os quatro candidatos com `StandardScaler` num pipeline e as mesmas divisões `KFold(10, shuffle=True, random_state=0)`",
        "RMSE médio (desvio padrão): mínimos quadrados 336.4 (55.6); Ridge 337.6 (67.5); Lasso 331.9 (67.4); Elastic Net 335.7 (65.4)",
        "Conclui que não há vencedor: as diferenças são muito menores do que o desvio padrão entre partes (55 a 68 mil dólares)",
        "Explica que com os 263 jogadores e o treino em 90% deles a variância dos mínimos quadrados já é pequena, como na experiência com 180",
        "A Elastic Net escolhe l1_ratio = 0,1 (quase Ridge) e α = 0,012, sem eliminar variáveis (19 coeficientes diferentes de zero)",
      ],
      solution: [
        {
          t: "code",
          code: `div10 = KFold(10, shuffle=True, random_state=0)
candidatos = {
    "mínimos quadrados": make_pipeline(StandardScaler(), LinearRegression()),
    "Ridge": make_pipeline(StandardScaler(), RidgeCV(alphas=np.logspace(-2, 4, 60))),
    "Lasso": make_pipeline(StandardScaler(), LassoCV(alphas=np.logspace(-1, 3, 60), max_iter=50_000)),
    "Elastic Net": make_pipeline(StandardScaler(), ElasticNetCV(l1_ratio=[0.1, 0.5, 0.9],
                                                                alphas=np.logspace(-2, 3, 60), max_iter=50_000)),
}
for nome, m in candidatos.items():
    rmse = -cross_val_score(m, Xh, yh, cv=div10, scoring="neg_root_mean_squared_error")
    print(nome, round(rmse.mean(), 1), round(rmse.std(), 1))
# mínimos quadrados 336.4 55.6
# Ridge 337.6 67.5
# Lasso 331.9 67.4
# Elastic Net 335.7 65.4
en = candidatos["Elastic Net"].fit(Xh, yh)[-1]
print(en.l1_ratio_, round(en.alpha_, 3), (en.coef_ != 0).sum())   # 0.1 0.012 19`,
          output: "mínimos quadrados 336.4 55.6\nRidge 337.6 67.5\nLasso 331.9 67.4\nElastic Net 335.7 65.4\n0.1 0.012 19",
        },
        {
          t: "p",
          text: "Não há vencedor: as diferenças (menos de 5 mil dólares) são muito menores do que o desvio padrão entre partes (55 a 68 mil). Com os 263 jogadores e o treino em 90% deles, a variância dos mínimos quadrados já é pequena, como na experiência com 180. A Elastic Net escolhe l1_ratio = 0,1 (quase Ridge) e um α pequeno, sem eliminar variáveis.",
        },
      ],
    },
    {
      id: "e9",
      num: 9,
      part: "B",
      session: "w2s2",
      kind: "text",
      title: "A partir de quantos jogadores deixa de valer a pena regularizar?",
      minutes: 25,
      sections: ["s3"],
      prompt: [
        {
          t: "p",
          text: "Repita a experiência da secção 3 (30 divisões aleatórias, `random_state=0`) só com mínimos quadrados e Ridge, para 60, 80, 120 e 150 jogadores de treino. Faça um gráfico do RMSE médio dos dois modelos em função do tamanho do treino. A partir de quantos jogadores deixa de valer a pena regularizar?",
        },
      ],
      fields: [
        { id: "code", label: "Código, resultados e gráfico", rows: 12, mono: true, placeholder: "tamanhos = [60, 80, 120, 150]\n…" },
        { id: "r", label: "A partir de quantos jogadores deixa de valer a pena?", rows: 4 },
      ],
      criteria: [
        "`ShuffleSplit(n_splits=30, train_size=n, random_state=0)` para cada tamanho, com os pipelines padronizados da aula",
        "RMSE médio: mínimos quadrados 429.9, 386.7, 361.1, 358.3; Ridge 380.6, 362.7, 354.0, 354.0",
        "Gráfico do RMSE médio dos dois modelos contra o número de jogadores no treino, com eixos e legenda",
        "A vantagem do Ridge passa de 49 mil dólares com 60 jogadores para 24 mil com 80 e 4 a 7 mil com 120 e 150: a partir de cerca de 120 jogadores (umas seis observações por variável), o ganho já é pequeno face à incerteza",
        "Nota que a regra não é universal: depende do ruído e da correlação entre variáveis",
      ],
      solution: [
        {
          t: "code",
          code: `tamanhos = [60, 80, 120, 150]
resultados = {"mínimos quadrados": [], "Ridge": []}
for n in tamanhos:
    d = ShuffleSplit(n_splits=30, train_size=n, random_state=0)
    for nome in resultados:
        rmse = -cross_val_score(candidatos[nome], Xh, yh, cv=d, scoring="neg_root_mean_squared_error")
        resultados[nome].append(float(round(rmse.mean(), 1)))
print(resultados)
# {'mínimos quadrados': [429.9, 386.7, 361.1, 358.3], 'Ridge': [380.6, 362.7, 354.0, 354.0]}
for nome, valores in resultados.items():
    plt.plot(tamanhos, valores, "o-", label=nome)
plt.xlabel("Jogadores no treino"); plt.ylabel("RMSE médio (milhares de $)"); plt.legend(); plt.show()`,
          output: "{'mínimos quadrados': [429.9, 386.7, 361.1, 358.3], 'Ridge': [380.6, 362.7, 354.0, 354.0]}",
        },
        {
          t: "p",
          text: "A vantagem do Ridge passa de 49 mil dólares com 60 jogadores para 24 mil com 80 e 4 a 7 mil com 120 e 150. A partir de cerca de 120 jogadores (umas seis observações por variável), o ganho já é pequeno face à incerteza. A regra não é universal: depende do ruído e da correlação entre variáveis.",
        },
      ],
    },
    {
      id: "e10",
      num: 10,
      part: "C",
      session: "w2s2",
      kind: "text",
      title: "Nota para o diretor de crédito",
      minutes: 15,
      sections: ["s2"],
      prompt: [
        {
          t: "p",
          text: "Escreva uma nota de meia página para um diretor de crédito, sem fórmulas, a explicar o paradoxo dos estudantes: porque é que os estudantes parecem mais arriscados no total e menos arriscados para o mesmo saldo, e que decisão do banco deve usar cada uma das duas leituras.",
        },
      ],
      fields: [{ id: "nota", label: "Nota para o diretor de crédito", rows: 10 }],
      criteria: [
        "Explicação pela variável de confusão (os estudantes têm saldos mais altos, e o saldo é o que mais pesa no risco), sem jargão (2 pontos)",
        "Números certos: 4,3% contra 2,9% no total; com 1500 dólares de saldo, 5% contra 10% (1 ponto)",
        "Uma decisão adequada para cada leitura: sem saber o saldo (a quem oferecer um cartão) e com o saldo (gerir clientes existentes) (2 pontos)",
      ],
      solution: [
        {
          t: "p",
          text: "Resposta aberta. Exemplo: \"No total, 4,3% dos estudantes falham contra 2,9% dos restantes, porque os estudantes têm, em média, saldos mais altos, e o saldo é o que mais pesa no risco. Comparando clientes com o mesmo saldo, os estudantes falham menos: com 1500 dólares de saldo, 5% contra 10%. A primeira leitura serve quando o saldo ainda não é conhecido, por exemplo ao decidir a quem oferecer um cartão. A segunda serve para gerir clientes existentes: para o mesmo saldo, um estudante merece um limite igual ou mais favorável.\"",
        },
        {
          t: "table",
          head: ["Critério", "Pontos (em 5)"],
          rows: [
            ["Explicação pela variável de confusão, sem jargão", "2"],
            ["Números certos", "1"],
            ["Uma decisão adequada para cada leitura", "2"],
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
            kind: "mcq", id: "p1", num: 1, section: "s1", points: 1,
            q: "Uma variável categórica tem 4 categorias. Num modelo linear com termo constante, quantas colunas de zeros e uns se usam?",
            options: ["4", "3", "2", "1"],
            answer: 1,
            explain: "k − 1 = 3: a categoria que fica sem coluna é a referência. Com as 4 colunas, a sua soma seria sempre 1, igual à coluna do termo constante.",
          },
          {
            kind: "mcq", id: "p2", num: 2, section: "s1", points: 1,
            q: "Num modelo para as vendas (em milhares de unidades), o coeficiente de `ShelveLoc_Good` é 4,85, com Bad como referência. Isto significa que:",
            options: [
              "Uma boa posição causa sempre mais 4850 vendas.",
              "Uma boa posição vende 4,85 vezes mais do que uma má.",
              "Mantendo o resto igual, uma boa posição está associada a mais cerca de 4850 unidades do que uma má.",
              "4,85% das lojas têm boa posição.",
            ],
            answer: 2,
            explain: "É uma diferença face à referência (Bad), em milhares de unidades, com as outras variáveis iguais; e é uma associação, não uma causa.",
          },
          {
            kind: "mcq", id: "p3", num: 3, section: "s2", points: 1,
            q: "Numa regressão logística, uma variável tem coeficiente 0,69. Aumentar essa variável numa unidade:",
            options: [
              "Multiplica as chances por cerca de 2.",
              "Aumenta a probabilidade em 0,69.",
              "Aumenta a probabilidade em 69%.",
              "Multiplica a probabilidade por 0,69.",
            ],
            answer: 0,
            explain: "e^0,69 ≈ 2: a razão de chances. O coeficiente atua sobre o logaritmo das chances, não sobre a probabilidade.",
          },
          {
            kind: "mcq", id: "p4", num: 4, section: "s2", points: 1,
            q: "Na `LogisticRegression` do scikit-learn, diminuir o parâmetro C:",
            options: ["Desliga a regularização.", "Aumenta o número de iterações.", "Não muda nada.", "Aumenta a regularização."],
            answer: 3,
            explain: "C é o inverso de α: um C menor penaliza mais. `C=np.inf` é que desliga a penalização.",
          },
          {
            kind: "mcq", id: "p5", num: 5, section: "s3", points: 1,
            q: "Qual destes métodos pode pôr coeficientes exatamente a zero?",
            options: ["Mínimos quadrados.", "Lasso.", "Ridge.", "Regressão logística sem penalização."],
            answer: 1,
            explain: "A penalização L1 do Lasso tem cantos em cima dos eixos; o Ridge encolhe os coeficientes sem nunca os pôr a zero.",
          },
          {
            kind: "mcq", id: "p6", num: 6, section: "s3", points: 1,
            q: "Porque se padronizam as variáveis antes de um Ridge ou de um Lasso?",
            options: [
              "Porque a penalização depende das unidades de cada variável.",
              "Para o modelo treinar mais depressa, apenas.",
              "Porque o scikit-learn dá erro sem isso.",
              "Para as previsões ficarem entre 0 e 1.",
            ],
            answer: 0,
            explain: "Um coeficiente em euros e outro em cêntimos seriam penalizados de forma muito diferente; padronizando, a penalização trata todas as variáveis da mesma forma.",
          },
          {
            kind: "mcq", id: "p7", num: 7, section: "s3", points: 1,
            q: "Em que situação é que a regularização costuma ajudar mais?",
            options: [
              "Muitas observações e poucas variáveis independentes.",
              "Quando o modelo tem viés alto.",
              "Poucas observações para o número de variáveis, ou variáveis muito correlacionadas.",
              "Quando não há ruído nos dados.",
            ],
            answer: 2,
            explain: "A regularização é um remédio contra a variância, que é alta com poucas observações por variável ou com variáveis muito correlacionadas. Com viés alto, encolher os coeficientes só piora.",
          },
          {
            kind: "mcq", id: "p8", num: 8, section: "s4", points: 1,
            q: "A regra de um erro padrão escolhe:",
            options: [
              "O modelo com o menor erro de treino.",
              "O modelo com o menor erro de validação cruzada.",
              "O modelo mais complexo possível.",
              "O modelo mais simples cujo erro de validação cruzada fica a menos de um erro padrão do melhor.",
            ],
            answer: 3,
            explain: "Diferenças menores do que a incerteza da validação cruzada não são diferenças; em caso de empate, escolhe-se o mais simples.",
          },
        ],
      },
      {
        title: "Grupo II — Resposta curta (8 valores)",
        note: "Sem consulta e sem correr código (pode usar calculadora). 2 valores cada, 3 a 6 linhas por resposta.",
        questions: [
          {
            kind: "open", id: "p9", num: 9, section: "s2", points: 2, rows: 6,
            q: "Explique como se interpreta um coeficiente numa regressão logística, usando chances e razão de chances, com um exemplo numérico.",
            criteria: [
              { id: "c1", text: "Chances e razão de chances", points: 1 },
              { id: "c2", text: "Exemplo numérico certo", points: 1 },
            ],
            model:
              "A regressão logística é linear no logaritmo das chances, p / (1 − p). Um coeficiente β diz que aumentar a variável numa unidade, mantendo o resto, multiplica as chances por e^β. Exemplo: β = 0,7 dá e^0,7 ≈ 2; uma probabilidade de 20% (chances 0,25) passa a chances 0,5, ou seja, 33%.",
          },
          {
            kind: "open", id: "p10", num: 10, section: "s2", points: 2, rows: 6,
            q: "Descreva o paradoxo dos estudantes nos dados `Default` e explique a sua relação com o paradoxo de Simpson do M6.",
            criteria: [
              { id: "c1", text: "Descrição com a mudança de sinal", points: 1 },
              { id: "c2", text: "Explicação pela variável de confusão e ligação a Simpson", points: 1 },
            ],
            model:
              "No total, os estudantes falham mais (4,3% contra 2,9%) e o coeficiente de estudante sozinho é positivo. Juntando o saldo, fica negativo: para o mesmo saldo, os estudantes falham menos. Acontece porque os estudantes têm saldos maiores, e o saldo aumenta muito o risco. O saldo é uma variável de confusão, tal como o departamento nas admissões de Berkeley.",
          },
          {
            kind: "open", id: "p11", num: 11, section: "s3", points: 2, rows: 6,
            q: "Qual é a diferença entre o Ridge e o Lasso? Dê uma situação em que escolheria cada um.",
            criteria: [
              { id: "c1", text: "Diferença", points: 1 },
              { id: "c2", text: "Uma situação adequada para o Ridge", points: 0.5 },
              { id: "c3", text: "Uma situação adequada para o Lasso", points: 0.5 },
            ],
            model:
              "Os dois penalizam coeficientes grandes. O Ridge (L2) encolhe todos e nenhum chega a zero; o Lasso (L1) põe alguns exatamente a zero, selecionando variáveis. Ridge: muitas variáveis correlacionadas, todas úteis. Lasso: muitas variáveis das quais poucas importam, ou quando se quer um modelo simples.",
          },
          {
            kind: "open", id: "p12", num: 12, section: "s4", points: 2, rows: 6,
            q: "Porque é que o erro de treino não serve para escolher o α de um Lasso? Como se escolhe, e que cuidado há a ter para a estimativa final do erro ser honesta?",
            criteria: [
              { id: "c1", text: "Porque não o erro de treino", points: 1 },
              { id: "c2", text: "Escolha por validação cruzada e cuidado com a estimativa final", points: 1 },
            ],
            model:
              "O erro de treino desce sempre que a penalização diminui, por isso escolheria sempre α = 0. Escolhe-se por validação cruzada (`LassoCV`). Para o erro final ser honesto, o α deve ser escolhido só com os dados de treino, e o teste avaliado no fim; se se quiser estimar o erro por validação cruzada, a escolha de α tem de ficar dentro de cada divisão, como acontece ao pôr o `LassoCV` dentro do pipeline.",
          },
        ],
      },
      {
        title: "Grupo III — Programação (4 valores)",
        note: "Pode usar o Colab, mas não a internet nem assistentes de IA.",
        questions: [
          {
            kind: "open", id: "p13", num: 13, section: "s3", points: 4, rows: 18,
            q: "Use os dados `Carseats`, com as variáveis da aula (`pd.get_dummies(..., drop_first=True, dtype=int)`) e `divisoes = KFold(5, shuffle=True, random_state=0)`.",
            context: [
              {
                t: "p",
                text: "(a) Compare por validação cruzada o RMSE de `make_pipeline(StandardScaler(), LinearRegression())` e de `make_pipeline(StandardScaler(), LassoCV(alphas=np.logspace(-3, 1, 50), cv=divisoes, max_iter=50_000))`. (b) Ajuste o Lasso com todos os dados e indique o α escolhido e as variáveis postas a zero. (c) Liste os coeficientes do Lasso (padronizados) por ordem de valor absoluto. (d) Ajuste uma regressão linear só com as sete variáveis cujo coeficiente padronizado é maior do que 0,4 em valor absoluto, compare o seu RMSE de validação cruzada e diga que modelo recomendaria, e porquê.",
              },
            ],
            criteria: [
              { id: "c1", text: "(a) RMSE dos dois modelos certos e comparados", points: 1 },
              { id: "c2", text: "(b) α e variáveis eliminadas, com a explicação de porque o Lasso não ajuda aqui", points: 1 },
              { id: "c3", text: "(c) Coeficientes ordenados", points: 0.5 },
              { id: "c4", text: "(d) Modelo reduzido, RMSE e recomendação justificada", points: 1.5 },
            ],
            model:
              "(a) e (b) O Lasso escolhe um α muito pequeno, não elimina nenhuma variável e fica igual aos mínimos quadrados: com 400 lojas e 11 variáveis não há variância a corrigir. (d) Recomendação-modelo: o modelo de sete variáveis (preço, prateleira boa e média, preço da concorrência, publicidade, idade média e rendimento) tem um erro igual ou ligeiramente menor (1,026 contra 1,042, diferença muito menor do que o desvio padrão) e é mais simples de explicar. Escolhia esse, pela regra de preferir o mais simples em caso de empate.",
            modelBlocks: [
              {
                t: "code",
                code: `divisoes = KFold(5, shuffle=True, random_state=0)
r1 = -cross_val_score(make_pipeline(StandardScaler(), LinearRegression()), X, cs["Sales"],
                      cv=divisoes, scoring="neg_root_mean_squared_error")
lasso = make_pipeline(StandardScaler(), LassoCV(alphas=np.logspace(-3, 1, 50), cv=divisoes, max_iter=50_000))
r2 = -cross_val_score(lasso, X, cs["Sales"], cv=divisoes, scoring="neg_root_mean_squared_error")
print(round(r1.mean(), 4), round(r2.mean(), 4))                        # (a) 1.0416 1.0412

lasso.fit(X, cs["Sales"])
coef = pd.Series(lasso[-1].coef_, index=X.columns)
print(round(lasso[-1].alpha_, 4), list(coef[coef == 0].index))       # (b) 0.0168 []
print(coef.round(3).sort_values(key=abs, ascending=False).to_string())  # (c)
# Price -2.211 · ShelveLoc_Good 1.941 · CompPrice 1.378 · ShelveLoc_Medium 0.933 · Advertising 0.768
# Age -0.728 · Income 0.421 · Education -0.039 · Urban_Yes 0.037 · US_Yes -0.034 · Population 0.02

sete = list(coef[coef.abs() > 0.4].index)                              # (d)
r3 = -cross_val_score(LinearRegression(), X[sete], cs["Sales"], cv=divisoes, scoring="neg_root_mean_squared_error")
print(round(r3.mean(), 4), round(r3.std(), 4))                         # 1.0261 0.0923`,
                output: `1.0416 1.0412
0.0168 []
Price              -2.211
ShelveLoc_Good      1.941
CompPrice           1.378
ShelveLoc_Medium    0.933
Advertising         0.768
Age                -0.728
Income              0.421
Education          -0.039
Urban_Yes           0.037
US_Yes             -0.034
Population          0.020
1.0261 0.0923`,
              },
            ],
          },
        ],
      },
    ],
  },
  examReviewNote:
    "Se a nota ficar abaixo de 14: rever as secções das perguntas falhadas (1 e 2 → secção 1, regressão linear e variáveis categóricas; 3, 4, 9 e 10 → secção 2, regressão logística; 5, 6, 7, 11 e 13 → secção 3, regularização; 8 e 12 → secção 4, seleção de modelos) e repetir a prova uma semana depois.",

  // ---------------------------------------------------------------- SIMULADO DE TREINO (banco extra da plataforma)
  practice: {
    mcq: [
      {
        id: "q1", section: "s1",
        q: "Depois do `fit`, onde ficam os coeficientes e o termo constante de um `LinearRegression`?",
        options: ["Em `params_` e `bias_`", "Em `coef_` e `intercept_`", "Em `weights_` e `b_`", "Em `beta_` e `const_`"],
        answer: 1,
        explain: "`coef_` tem um coeficiente por coluna de X e `intercept_` o termo constante.",
      },
      {
        id: "q2", section: "s1",
        q: "Com `pd.get_dummies(cs.drop(columns=\"Sales\"), drop_first=True, dtype=int)`, que categoria de `ShelveLoc` (Bad, Good, Medium) fica como referência?",
        options: ["Good", "Medium", "Nenhuma: ficam as três colunas", "Bad"],
        answer: 3,
        explain: "`drop_first=True` tira a primeira categoria por ordem alfabética, Bad. Por isso aparecem `ShelveLoc_Good` e `ShelveLoc_Medium`.",
      },
      {
        id: "q3", section: "s1",
        q: "No modelo de `Carseats`, Price = −0,095, com as vendas em milhares de unidades e o preço em dólares. Subir o preço 10 dólares, mantendo o resto igual, está associado a:",
        options: ["Menos 95 unidades vendidas", "Menos 9,5 unidades vendidas", "Menos 950 unidades vendidas", "Menos 0,95% das vendas"],
        answer: 2,
        explain: "−0,095 × 10 = −0,95 mil unidades, ou seja, menos 950 unidades.",
      },
      {
        id: "q4", section: "s1",
        q: "Porque é que não se pode dizer que `ShelveLoc_Good` (4,850) pesa 40 vezes mais do que `Advertising` (0,123) nas vendas?",
        options: [
          "Porque os coeficientes estão em unidades diferentes; padronizando, cada um passa a ser o efeito de um desvio padrão",
          "Porque um dos coeficientes é negativo",
          "Porque os coeficientes de variáveis binárias são sempre maiores",
          "Porque o scikit-learn arredonda os coeficientes",
        ],
        answer: 0,
        explain: "Uma unidade de publicidade (mil dólares) e passar de má para boa prateleira não são variações comparáveis. Padronizados, o preço (−2,25) e a prateleira boa (1,98) vêm à frente e a publicidade em quinto (0,82).",
      },
      {
        id: "q5", section: "s1",
        q: "Num modelo linear, uma interação entre publicidade e boa posição na prateleira é:",
        options: [
          "A soma das duas variáveis",
          "O produto das duas variáveis, para quando o efeito de uma depende da outra",
          "A correlação entre as duas",
          "Uma variável categórica com as duas combinações",
        ],
        answer: 1,
        explain: "Acrescenta-se a coluna publicidade × boa_prateleira: o efeito da publicidade passa a ser diferente nas lojas com boa posição. Cada coluna nova deve justificar-se na validação cruzada.",
      },
      {
        id: "q6", section: "s1",
        q: "Precisa de erros padrão e valores-p para os coeficientes de uma regressão linear. Que biblioteca usa?",
        options: ["matplotlib", "scikit-learn", "statsmodels", "NumPy"],
        answer: 2,
        explain: "O scikit-learn não dá erros padrão nem valores-p; os laboratórios de James et al. (2023) usam o `statsmodels`.",
      },
      {
        id: "q7", section: "s2",
        q: "Uma probabilidade de 20% corresponde a chances de:",
        options: ["0,25", "0,2", "4", "0,8"],
        answer: 0,
        explain: "Chances = p / (1 − p) = 0,2 / 0,8 = 0,25, \"uma para quatro\".",
      },
      {
        id: "q8", section: "s2",
        q: "Na regressão logística, o que é linear nas variáveis?",
        options: [
          "A probabilidade p",
          "As chances p / (1 − p)",
          "A entropia cruzada",
          "O logaritmo das chances, log(p / (1 − p))",
        ],
        answer: 3,
        explain: "log(p / (1 − p)) = β₀ + β₁x₁ + … + βₚxₚ. Por isso cada coeficiente multiplica as chances por e^βⱼ.",
      },
      {
        id: "q9", section: "s2",
        q: "Para que serve `C=np.inf` nos exemplos da aula?",
        options: [
          "Desliga a penalização, para obter os coeficientes de máxima verosimilhança puros, como nos livros",
          "Aumenta o número máximo de iterações",
          "Aplica a penalização mais forte possível",
          "Permite usar mais de duas classes",
        ],
        answer: 0,
        explain: "A `LogisticRegression` vem regularizada por omissão (C = 1); C é o inverso de α, por isso C infinito quer dizer α = 0.",
      },
      {
        id: "q10", section: "s2",
        q: "No modelo com saldo e estudante, para um saldo de 1500 dólares, a probabilidade de incumprimento de um não estudante é 0,105. E a de um estudante com o mesmo saldo?",
        options: ["0,149", "0,054", "0,105", "0,043"],
        answer: 1,
        explain: "`predict_proba` dá [0.105 0.054]: com o mesmo saldo, o estudante tem cerca de metade do risco, como diz a razão de chances 0,49.",
      },
      {
        id: "q11", section: "s2",
        q: "Cada 100 dólares a mais de saldo multiplicam as chances de incumprimento por 1,78. E 200 dólares a mais, mantendo o resto?",
        options: ["Multiplicam as chances por 3,56", "Multiplicam as chances por 2,78", "Multiplicam as chances por cerca de 3,17 (1,78²)", "Multiplicam a probabilidade por 3,56"],
        answer: 2,
        explain: "Os efeitos multiplicam-se: e^(200β) = (e^(100β))² = 1,78² ≈ 3,17.",
      },
      {
        id: "q12", section: "s2",
        q: "Com mais de duas classes, a regressão logística generaliza-se para:",
        options: ["Uma regressão Ridge", "Uma regressão linear por classe", "Um Lasso com uma coluna por classe", "A regressão softmax (multinomial)"],
        answer: 3,
        explain: "Um conjunto de coeficientes por classe e a softmax a transformar as k pontuações em probabilidades que somam 1. O `LogisticRegression` faz isto sozinho quando `y` tem mais de duas classes.",
      },
      {
        id: "q13", section: "s3",
        q: "No Ridge e no Lasso, o que acontece com α = 0?",
        options: ["Todos os coeficientes vão para zero", "Volta-se aos mínimos quadrados", "Só o termo constante é estimado", "O Lasso passa a Ridge"],
        answer: 1,
        explain: "Sem penalização, fica só a soma dos quadrados dos erros. Com α muito grande é que todos os coeficientes vão para zero.",
      },
      {
        id: "q14", section: "s3",
        q: "Na experiência da secção 3, com 40 jogadores de treino, quanto reduziu o Ridge o RMSE médio face aos mínimos quadrados?",
        options: ["Cerca de 8 mil dólares", "Nada: empataram", "Cerca de 75 mil dólares", "Cerca de 108 mil dólares (22%)"],
        answer: 3,
        explain: "485,9 − 377,8 = 108,1 mil dólares, 22% de 485,9. Com 180 jogadores, os três modelos empataram (348,7, 350,7 e 350,4).",
      },
      {
        id: "q15", section: "s3",
        q: "Na `LogisticRegression` do scikit-learn, que penalização se aplica por omissão, e como se controla?",
        options: [
          "Nenhuma; liga-se com `penalty`",
          "Do tipo Lasso, com α",
          "Do tipo Ridge, com C = 1/α: um C menor penaliza mais",
          "Do tipo Ridge, com C: um C maior penaliza mais",
        ],
        answer: 2,
        explain: "Vem regularizada com uma penalização do tipo Ridge, e C é o inverso de α.",
      },
      {
        id: "q16", section: "s3",
        q: "O que é a Elastic Net?",
        options: [
          "Uma mistura das penalizações L1 e L2: seleciona variáveis como o Lasso, mas lida melhor com grupos de variáveis correlacionadas",
          "Um Ridge com o α escolhido por validação cruzada",
          "Um Lasso sem termo constante",
          "Uma regressão logística com mais de duas classes",
        ],
        answer: 0,
        explain: "A Elastic Net (Zou & Hastie, 2005) mistura L1 e L2. No scikit-learn: `ElasticNetCV`.",
      },
      {
        id: "q17", section: "s3",
        q: "Nos dados `Hitters` completos, o Lasso da aula (α = 2,65) eliminou `CHits`. A explicação mais provável é:",
        options: [
          "`CHits` não tem nenhuma relação com o salário",
          "`CHits` diz quase o mesmo que `CRuns` e `CRBI`, que ficaram: é redundante",
          "`CHits` não foi padronizada",
          "O Lasso elimina sempre as variáveis da carreira",
        ],
        answer: 1,
        explain: "As variáveis eliminadas são, na maioria, redundantes com outras que ficaram: `CHits` (tacadas certeiras na carreira) diz quase o mesmo que `CRuns` e `CRBI`.",
      },
      {
        id: "q18", section: "s4",
        q: "Porque é que o erro de treino não serve para escolher entre modelos de complexidade diferente?",
        options: [
          "Porque é difícil de calcular",
          "Porque depende da semente aleatória",
          "Porque só existe para a regressão linear",
          "Porque desce sempre com a complexidade",
        ],
        answer: 3,
        explain: "O modelo mais complexo ajusta-se sempre melhor ao treino (M7). É preciso estimar o erro em dados novos, com validação cruzada.",
      },
      {
        id: "q19", section: "s4",
        q: "Segundo a aula, AIC, BIC e R² ajustado:",
        options: [
          "Corrigem o erro de treino com uma penalização pela complexidade; são rápidos, mas assumem um modelo correto e servem só para alguns tipos de modelos",
          "Estimam o erro diretamente em dados novos",
          "São variantes da validação cruzada",
          "Só se usam com o Lasso",
        ],
        answer: 0,
        explain: "São a segunda família de métodos (James et al., 2023, sec. 6.1.3). O curso usa só a primeira: estimar o erro diretamente, com validação cruzada.",
      },
      {
        id: "q20", section: "s4",
        q: "Na regra de um erro padrão aplicada ao Lasso, \"mais simples\" quer dizer:",
        options: ["α menor, com mais variáveis", "Menos divisões na validação cruzada", "α maior, com menos variáveis", "O menor erro de treino"],
        answer: 2,
        explain: "Escolhe-se o maior α cujo erro de validação cruzada fica a menos de um erro padrão do melhor. Em `Hitters`, α = 60,21, com 6 variáveis.",
      },
      {
        id: "q21", section: "s4",
        q: "Porque se fixam as divisões (`KFold(..., shuffle=True, random_state=...)`) e se usam as mesmas para todos os candidatos?",
        options: [
          "Para o treino ser mais rápido",
          "Para que a comparação seja justa: todos os candidatos são avaliados nas mesmas partes",
          "Porque o `LassoCV` não aceita outras divisões",
          "Para o erro de teste ficar mais baixo",
        ],
        answer: 1,
        explain: "É o primeiro passo do procedimento da secção 4. Com divisões diferentes, parte da diferença entre modelos seria só sorte na divisão.",
      },
      {
        id: "q22", section: "s5",
        q: "Porque é que os modelos de pontuação bancária (risco de crédito) são muitas vezes regressões logísticas?",
        options: [
          "Porque são os mais precisos em todos os dados",
          "Porque não precisam de dados de treino",
          "Porque a regulação exige explicar cada decisão ao cliente",
          "Porque não podem sobreajustar",
        ],
        answer: 2,
        explain: "Cada coeficiente tem uma leitura direta (uma razão de chances), o que permite explicar a decisão.",
      },
      {
        id: "q23", section: "s5",
        q: "Qual destes **não** é um ponto fraco dos modelos lineares, segundo a aula?",
        options: [
          "Extrapolam em linha reta para fora dos dados, muitas vezes mal",
          "Os mínimos quadrados são sensíveis a valores extremos",
          "Só captam interações se alguém as criar à mão",
          "Precisam de muitos dados para funcionar",
        ],
        answer: 3,
        explain: "É ao contrário: precisam de poucos dados, sobretudo com regularização. Os outros três estão na coluna dos pontos fracos.",
      },
    ],
    tf: [
      { id: "v1", section: "s1", q: "Com `drop_first=True`, uma variável com 3 categorias dá 2 colunas de zeros e uns.", answer: true, explain: "k − 1 = 2; a categoria sem coluna é a referência." },
      {
        id: "v2", section: "s1",
        q: "Num modelo ajustado a dados observacionais, o coeficiente de uma variável mede o seu efeito causal.",
        answer: false,
        explain: "Mede uma associação, mantendo as outras variáveis iguais. Pode haver variáveis de confusão (M6); para medir causas é preciso uma experiência.",
      },
      {
        id: "v3", section: "s1",
        q: "Um modelo linear pode ter o preço ao quadrado como variável: é linear nos coeficientes, não necessariamente nas variáveis.",
        answer: true,
        explain: "Colunas transformadas (quadrados, logaritmos) e interações cabem num modelo linear.",
      },
      { id: "v4", section: "s2", q: "Um coeficiente positivo numa regressão logística dá uma razão de chances maior do que 1.", answer: true, explain: "e^β > 1 quando β > 0; um coeficiente negativo dá uma razão abaixo de 1." },
      {
        id: "v5", section: "s2",
        q: "Nos dados `Default`, o coeficiente de estudante é positivo com e sem o saldo no modelo.",
        answer: false,
        explain: "Sozinho é +0,401; com o saldo passa a −0,715. O sinal muda porque o saldo é uma variável de confusão.",
      },
      {
        id: "v6", section: "s2",
        q: "Uma razão de chances de 2 quer dizer que a probabilidade duplica.",
        answer: false,
        explain: "São as chances que duplicam. De 50% (chances 1) passa-se a chances 2, ou seja, 67%, e não 100%.",
      },
      {
        id: "v7", section: "s3",
        q: "No Ridge, com α suficientemente grande, alguns coeficientes ficam exatamente a zero.",
        answer: false,
        explain: "No Ridge, os coeficientes encolhem para zero sem nunca lá chegar. Só o Lasso os põe exatamente a zero.",
      },
      {
        id: "v8", section: "s3",
        q: "No scikit-learn, as escalas de α do Ridge e do Lasso são diretamente comparáveis.",
        answer: false,
        explain: "As duas funções estão escritas com constantes diferentes; por isso a aula usa grelhas de α diferentes para cada um.",
      },
      { id: "v9", section: "s3", q: "No Ridge e no Lasso, o termo constante não é penalizado.", answer: true, explain: "Penalizam-se só os coeficientes das variáveis." },
      {
        id: "v10", section: "s4",
        q: "Para o erro estimado por validação cruzada ser honesto, o α do Lasso tem de ser escolhido dentro de cada divisão, como acontece ao pôr o `LassoCV` dentro do pipeline.",
        answer: true,
        explain: "Assim, cada divisão escolhe o seu α só com os dados de treino dessa divisão.",
      },
      {
        id: "v11", section: "s5",
        q: "A última camada de um classificador neuronal é uma regressão logística.",
        answer: true,
        explain: "Cada camada é uma transformação linear seguida de uma função simples; a última de um classificador é uma regressão logística (softmax com várias classes), M12.",
      },
    ],
  },

  // ---------------------------------------------------------------- CARTÕES DE REVISÃO
  flashcards: [
    { id: "f1", section: "s1", tag: "Regressão linear", front: "`LinearRegression` depois do `fit`", back: "Os coeficientes ficam em `coef_` e o termo constante em `intercept_`. Faz o mesmo que o `np.linalg.lstsq` da Fase 1." },
    { id: "f2", section: "s1", tag: "Regressão linear", front: "Codificação one-hot de uma variável com k categorias", back: "k − 1 colunas de zeros e uns (`pd.get_dummies(..., drop_first=True, dtype=int)`). A categoria sem coluna é a referência." },
    { id: "f3", section: "s1", tag: "Regressão linear", front: "Porquê k − 1 colunas e não k?", back: "Com k colunas, a sua soma seria sempre 1, igual à coluna do termo constante: ficavam linearmente dependentes e os coeficientes não teriam solução única." },
    { id: "f4", section: "s1", tag: "Regressão linear", front: "Ler um coeficiente linear", back: "Variação de y por unidade de x, mantendo as outras variáveis iguais. É uma associação, não uma causa." },
    { id: "f5", section: "s1", tag: "Regressão linear", front: "`Carseats`: Price = −0,095 e ShelveLoc_Good = 4,850", back: "Cada dólar a mais no preço: menos 95 unidades. Boa prateleira: mais 4850 unidades do que uma má (a referência)." },
    { id: "f6", section: "s1", tag: "Regressão linear", front: "Coeficientes padronizados", back: "Ajustar com as variáveis padronizadas: cada coeficiente é o efeito de um desvio padrão. Permitem comparar variáveis em unidades diferentes. Em `Carseats`: preço −2,25, prateleira boa 1,98." },
    { id: "f7", section: "s1", tag: "Regressão linear", front: "Interação", back: "O produto de duas variáveis, para quando o efeito de uma depende da outra. Um modelo linear é linear nos coeficientes, não necessariamente nas variáveis." },
    { id: "f8", section: "s2", tag: "Regressão logística", front: "Regressão logística", back: "p(x) = σ(β₀ + β₁x₁ + … + βₚxₚ). Coeficientes por máxima verosimilhança: minimizar a entropia cruzada binária." },
    { id: "f9", section: "s2", tag: "Regressão logística", front: "Chances (odds)", back: "p / (1 − p). 20% → 0,2 / 0,8 = 0,25, \"uma para quatro\"." },
    { id: "f10", section: "s2", tag: "Regressão logística", front: "O que é linear na regressão logística", back: "O logaritmo das chances: log(p / (1 − p)) = β₀ + β₁x₁ + … + βₚxₚ." },
    { id: "f11", section: "s2", tag: "Regressão logística", front: "Razão de chances (odds ratio)", back: "e^βⱼ: aumentar xⱼ numa unidade multiplica as chances por e^βⱼ. β = 0,4 → 1,49 (chances 49% maiores); β negativo → razão abaixo de 1." },
    { id: "f12", section: "s2", tag: "Regressão logística", front: "β = 0,4 e probabilidade inicial de 50%", back: "e^0,4 ≈ 1,49: chances 1 → 1,49 → probabilidade 1,49 / 2,49 ≈ 60%. As chances sobem 49%; a probabilidade não." },
    { id: "f13", section: "s2", tag: "Regressão logística", front: "`C=np.inf` na `LogisticRegression`", back: "Desliga a penalização por omissão (C = 1), para obter os coeficientes de máxima verosimilhança puros. Para prever, `C=1.0` é geralmente bom." },
    { id: "f14", section: "s2", tag: "Regressão logística", front: "O paradoxo dos estudantes (`Default`)", back: "Sozinho, estudante tem coeficiente +0,401 (chances 1,49×); com o saldo, −0,715 (0,49×). Os estudantes têm saldos mais altos: o saldo é uma variável de confusão (Simpson, M6)." },
    { id: "f15", section: "s2", tag: "Regressão logística", front: "Estudante e não estudante com 1500 dólares de saldo", back: "Probabilidades 0,054 e 0,105: com o mesmo saldo, o estudante tem cerca de metade do risco. Cada 100 dólares de saldo multiplicam as chances por 1,78." },
    { id: "f16", section: "s2", tag: "Regressão logística", front: "Regressão softmax (multinomial)", back: "Regressão logística com k classes: um conjunto de coeficientes por classe e a softmax a dar probabilidades que somam 1. Está na última camada dos classificadores neuronais (M12) e dos LLMs (M17)." },
    { id: "f17", section: "s3", tag: "Regularização", front: "Regularização", back: "Trocar um pouco de viés por muito menos variância, penalizando coeficientes grandes. Ajuda com muitas variáveis, poucas observações ou variáveis muito correlacionadas." },
    { id: "f18", section: "s3", tag: "Regularização", front: "Ridge (Hoerl & Kennard, 1970)", back: "min Σ(yᵢ − ŷᵢ)² + α Σ βⱼ²: norma L2. Os coeficientes encolhem todos juntos para zero, sem nunca lá chegar." },
    { id: "f19", section: "s3", tag: "Regularização", front: "Lasso (Tibshirani, 1996)", back: "min Σ(yᵢ − ŷᵢ)² + α Σ |βⱼ|: norma L1. Os coeficientes chegam a zero um a um: faz seleção de variáveis." },
    { id: "f20", section: "s3", tag: "Regularização", front: "O parâmetro α", back: "Força da penalização: α = 0 dá os mínimos quadrados; α muito grande põe todos os coeficientes a zero. O termo constante não é penalizado. Escolhe-se por validação cruzada." },
    { id: "f21", section: "s3", tag: "Regularização", front: "As duas regras práticas do Ridge e do Lasso", back: "Padronizar sempre (a penalização depende das unidades) e escolher α por validação cruzada: `make_pipeline(StandardScaler(), RidgeCV(...))` ou `LassoCV(...)`." },
    { id: "f22", section: "s3", tag: "Regularização", front: "Porque é que o Lasso põe coeficientes a zero", back: "Como restrição, o Lasso é um losango com cantos em cima dos eixos e o Ridge um círculo. As elipses do erro tocam muitas vezes o losango num canto, onde um coeficiente é zero." },
    { id: "f23", section: "s3", tag: "Regularização", front: "Hitters: 40 contra 180 jogadores de treino", back: "Com 40: mínimos quadrados 485,9, Ridge 377,8, Lasso 410,7 (mil dólares de RMSE). Com 180, os três empatam (cerca de 350). A regularização ajuda na medida em que há variância." },
    { id: "f24", section: "s3", tag: "Regularização", front: "Elastic Net (Zou & Hastie, 2005)", back: "Mistura L1 e L2: seleciona variáveis como o Lasso, mas lida melhor com grupos de variáveis correlacionadas. `ElasticNetCV`." },
    { id: "f25", section: "s3", tag: "Regularização", front: "C na `LogisticRegression`", back: "C = 1/α, com uma penalização do tipo Ridge: um C menor penaliza mais. Esquecer que vem regularizada (C = 1) é um erro comum." },
    { id: "f26", section: "s3", tag: "Regularização", front: "Weight decay", back: "A penalização L2 no treino de redes neuronais (M13); o AdamW do M5 separa-a do Adam." },
    { id: "f27", section: "s4", tag: "Seleção de modelos", front: "Duas famílias de métodos para escolher modelos", back: "Estimar o erro diretamente (validação cruzada, o método geral) ou corrigir o erro de treino pela complexidade (AIC, BIC, R² ajustado: assumem um modelo correto)." },
    { id: "f28", section: "s4", tag: "Seleção de modelos", front: "Regra de um erro padrão (Hastie et al., 2009, sec. 7.10)", back: "Escolher o modelo mais simples cujo erro de validação cruzada fica a menos de um erro padrão do melhor. No Lasso: o maior α nessa condição." },
    { id: "f29", section: "s4", tag: "Seleção de modelos", front: "Hitters: melhor α contra regra de um erro padrão", back: "Melhor α (3,1): 13 variáveis, RMSE 334,2. Um erro padrão (α = 60,21): 6 variáveis (Hits, Walks, CRuns, CRBI, PutOuts, Division_W), 350,2. Estatisticamente indistinguíveis." },
    { id: "f30", section: "s4", tag: "Seleção de modelos", front: "Seleção progressiva e regressiva", back: "Acrescentar (forward) ou tirar (backward) variáveis uma a uma, avaliando por validação cruzada: `SequentialFeatureSelector`. Útil com poucas variáveis; com muitas, o Lasso é mais rápido e estável." },
    { id: "f31", section: "s4", tag: "Seleção de modelos", front: "Um procedimento de seleção que funciona", back: "Fixar as divisões; poucos candidatos e uma linha de base; olhar para média e desvio padrão; em empate, o mais simples; só no fim, o teste." },
    { id: "f32", section: "s5", tag: "Quando usar", front: "Pontos fortes dos modelos lineares", back: "Interpretáveis, rápidos, precisam de poucos dados, a logística dá probabilidades fiáveis, ótimos com milhares de variáveis esparsas." },
    { id: "f33", section: "s5", tag: "Quando usar", front: "Pontos fracos dos modelos lineares", back: "Não linearidades e interações só à mão; mínimos quadrados sensíveis a extremos; extrapolam em linha reta; com regularização exigem padronizar; perdem para árvores e ensembles (M9) em dados muito não lineares." },
    { id: "f34", section: "s5", tag: "Quando usar", front: "Sinal de que é preciso outro modelo", back: "Resíduos (real menos previsto) contra as previsões ou as variáveis com uma curva, um funil ou grupos: há estrutura que o modelo não capta." },
  ],

  // ---------------------------------------------------------------- NOTEBOOK
  notebook: {
    filename: "M8 — exercícios",
    cells: [
      {
        type: "md",
        source:
          "# M8 — Modelos lineares\n\nExemplos da aula (correr pela ordem, no mesmo notebook) e os exercícios 5 a 9. Os exercícios 1 a 4 fazem-se à mão e o 10 é uma nota escrita. Guardar no Drive, na pasta da Fase 2.",
      },
      { type: "md", source: "## 1. Regressão linear com scikit-learn: coeficientes e variáveis categóricas" },
      { type: "code", source: C_CARSEATS },
      { type: "code", source: C_PADRONIZAR },
      { type: "md", source: "## 2. Regressão logística: probabilidades, chances e o paradoxo dos estudantes" },
      { type: "code", source: C_ESTUDANTES },
      { type: "code", source: C_NOVOS },
      { type: "md", source: "## 3. Regularização: Ridge e Lasso" },
      { type: "code", source: C_EXPERIENCIA },
      { type: "code", source: C_LASSO },
      { type: "md", source: "## 4. Seleção de modelos: validação cruzada e a regra de um erro padrão" },
      { type: "code", source: C_UM_EP },
      { type: "md", source: "## Exercícios\n\nImports que faltam para os exercícios 7 a 9:" },
      { type: "code", source: EX_IMPORTS },
      {
        type: "md",
        source:
          "## Exercício 5\n\n`Carseats`, `KFold(5, shuffle=True, random_state=0)`, RMSE: as variáveis da aula; com `Price × ShelveLoc_Good`; com `Income × Advertising`. Alguma interação vale a pena?",
      },
      { type: "code", source: "divisoes = KFold(5, shuffle=True, random_state=0)\n" },
      {
        type: "md",
        source:
          "## Exercício 6\n\n`Default`: regressão logística sem penalização com `balance`, `income / 1000` e `estudante`. Termo constante, coeficientes e razões de chances; comparar com a tabela 4.3 de James et al. (2023).",
      },
      { type: "code", source: "df[\"rendimento_mil\"] = df[\"income\"] / 1000\n" },
      {
        type: "md",
        source:
          "## Exercício 7\n\n`make_pipeline(StandardScaler(), LogisticRegression(C=C))` com C = 0,0001, 0,01, 1 e 100: coeficientes e AUC média com `StratifiedKFold(5, shuffle=True, random_state=0)`.",
      },
      { type: "code", source: "Xd = df[[\"balance\", \"income\", \"estudante\"]]\nfor C in [0.0001, 0.01, 1, 100]:\n    ...\n" },
      {
        type: "md",
        source:
          "## Exercício 8\n\n`Hitters`, `KFold(10, shuffle=True, random_state=0)`: mínimos quadrados, Ridge, Lasso e Elastic Net (`ElasticNetCV(l1_ratio=[0.1, 0.5, 0.9], alphas=np.logspace(-2, 3, 60), max_iter=50_000)`), todos padronizados. Há vencedor? Que `l1_ratio` escolhe a Elastic Net nos dados completos?",
      },
      { type: "code", source: "div10 = KFold(10, shuffle=True, random_state=0)\ncandidatos = {\n    ...\n}\n" },
      {
        type: "md",
        source:
          "## Exercício 9\n\nA experiência da secção 3 (30 divisões, `random_state=0`) só com mínimos quadrados e Ridge, para 60, 80, 120 e 150 jogadores de treino, com o gráfico do RMSE médio.",
      },
      { type: "code", source: "tamanhos = [60, 80, 120, 150]\n" },
      { type: "md", source: "## Exercício 10\n\nNota de meia página para um diretor de crédito, sem fórmulas, sobre o paradoxo dos estudantes:\n\n" },
      { type: "md", source: "## Notas\n\nO que aprendi neste módulo, em três frases:" },
    ],
  },
  source: "curso-engenharia-ia 2/modulo-08-modelos-lineares",
};
