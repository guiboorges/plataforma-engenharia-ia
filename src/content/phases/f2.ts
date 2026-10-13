import type { PhaseClosing } from "../types";

// Fecho da Fase 2: transcrição de fase-02-exame-e-mini-projeto/ (01-exame.md, 02-mini-projeto.md, 03-gabarito.md
// e codigo/mini_projeto_referencia.py), versão de 9 de outubro de 2026. Respostas, critérios e valores de referência do gabarito.
// O código do Grupo III e a solução de referência do mini-projeto foram corridos com Python 3.13, scikit-learn 1.9,
// XGBoost 3.4, shap 0.53, pandas 3.0 e NumPy 2.5.

const G3_SOLUTION = `import numpy as np
import pandas as pd
from sklearn.datasets import load_diabetes
from sklearn.model_selection import KFold, cross_val_score, train_test_split
from sklearn.linear_model import LinearRegression, RidgeCV
from sklearn.ensemble import RandomForestRegressor, HistGradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
from sklearn.dummy import DummyRegressor
from sklearn.inspection import permutation_importance
from sklearn.metrics import root_mean_squared_error

diab = load_diabetes(as_frame=True, scaled=False)
X, y = diab.data, diab.target
cv = KFold(5, shuffle=True, random_state=0)
modelos = {"média": DummyRegressor(),
           "linear": make_pipeline(StandardScaler(), LinearRegression()),
           "ridge": make_pipeline(StandardScaler(), RidgeCV(alphas=np.logspace(-3, 3, 50))),
           "random forest": RandomForestRegressor(n_estimators=500, min_samples_leaf=5, random_state=0),
           "boosting": HistGradientBoostingRegressor(random_state=0)}
for nome, modelo in modelos.items():                                     # (a)
    rmse = -cross_val_score(modelo, X, y, cv=cv, scoring="neg_root_mean_squared_error")
    print(nome, round(rmse.mean(), 1), round(rmse.std(), 1))
# média 76.9 4.1
# linear 54.5 2.1
# ridge 54.6 2.1
# random forest 56.9 3.2
# boosting 58.8 5.0

X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, random_state=0)    # (c)
linear = make_pipeline(StandardScaler(), LinearRegression()).fit(X_tr, y_tr)
print(round(root_mean_squared_error(y_te, linear.predict(X_te)), 1))   # 56.4
imp = permutation_importance(linear, X_te, y_te, n_repeats=20, random_state=0, scoring="neg_root_mean_squared_error")
print(pd.Series(imp.importances_mean, index=X.columns).sort_values(ascending=False).round(1).head(3).to_string())
# s5     11.5
# s1     10.3
# bmi     7.2
print(pd.Series(linear[-1].coef_, index=X.columns).round(1).sort_values(key=abs, ascending=False).head(5).to_string())
# s5     34.5
# bmi    28.9
# s1    -26.5
# bp     14.3
# s2     12.4`;

const G3_OUTPUT = `média 76.9 4.1
linear 54.5 2.1
ridge 54.6 2.1
random forest 56.9 3.2
boosting 58.8 5.0
56.4
s5     11.5
s1     10.3
bmi     7.2
s5     34.5
bmi    28.9
s1    -26.5
bp     14.3
s2     12.4`;

const LOAD = `import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

URL = "https://raw.githubusercontent.com/IBM/telco-customer-churn-on-icp4d/master/data/Telco-Customer-Churn.csv"
tc = pd.read_csv(URL)`;

const LUCRO = `custo, aceita, meses = 40, 0.3, 12
def lucro(contactar, reais, mensal):
    return float((aceita * meses * mensal * (contactar & (reais == 1))).sum() - custo * contactar.sum())`;

// codigo/mini_projeto_referencia.py, sem alterações.
const REFERENCE = `"""Fase 2 — solução de referência do mini-projeto (abrir só depois de terminar).

Correr com:  python3 mini_projeto_referencia.py
Requer:      pip install numpy pandas matplotlib scikit-learn xgboost shap
"""
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import warnings
warnings.filterwarnings("ignore")
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, HistGradientBoostingClassifier
from sklearn.dummy import DummyClassifier
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_validate, GridSearchCV, cross_val_predict
from sklearn.metrics import roc_auc_score, average_precision_score, brier_score_loss
from sklearn.inspection import permutation_importance
from xgboost import XGBClassifier
import shap

URL = "https://raw.githubusercontent.com/IBM/telco-customer-churn-on-icp4d/master/data/Telco-Customer-Churn.csv"
tc = pd.read_csv(URL)
print("=== 1")
print(tc.shape, tc["TotalCharges"].dtype)
total = pd.to_numeric(tc["TotalCharges"], errors="coerce")
print(total.isna().sum(), tc.loc[total.isna(), "tenure"].unique())
churn = (tc["Churn"] == "Yes")
print(round(churn.mean(), 3))
for col in ["Contract", "InternetService", "PaymentMethod"]:
    print(col, tc.groupby(col)["Churn"].apply(lambda s: (s == "Yes").mean()).round(3).to_dict())
print(churn.groupby(pd.cut(tc["tenure"], [-1, 6, 12, 24, 48, 72])).mean().round(3).to_dict())

print("=== 2")
tc["TotalCharges"] = total.fillna(0)
print(round(np.corrcoef(tc["TotalCharges"], tc["tenure"] * tc["MonthlyCharges"])[0, 1], 4))
y = churn.astype(int)
X = tc.drop(columns=["customerID", "Churn"])
numericas = ["tenure", "MonthlyCharges", "TotalCharges"]
categoricas = [c for c in X.columns if c not in numericas]
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, stratify=y, random_state=0)
print(X_tr.shape, X_te.shape)
preparar = ColumnTransformer([("num", StandardScaler(), numericas),
                              ("cat", OneHotEncoder(handle_unknown="ignore"), categoricas)],
                             sparse_threshold=0)
cv = StratifiedKFold(5, shuffle=True, random_state=0)

print("=== 3")
modelos = {"linha de base": DummyClassifier(),
           "regressão logística": LogisticRegression(max_iter=2000),
           "random forest": RandomForestClassifier(n_estimators=500, min_samples_leaf=5, random_state=0, n_jobs=-1),
           "gradient boosting": HistGradientBoostingClassifier(random_state=0),
           "XGBoost": XGBClassifier(n_estimators=300, learning_rate=0.05, max_depth=3, random_state=0)}
for nome, modelo in modelos.items():
    r = cross_validate(Pipeline([("prep", preparar), ("modelo", modelo)]), X_tr, y_tr, cv=cv,
                       scoring=["roc_auc", "average_precision", "neg_brier_score"])
    print(f"{nome:22s} {r['test_roc_auc'].mean():.3f} {r['test_average_precision'].mean():.3f} {-r['test_neg_brier_score'].mean():.3f}")

print("=== 4")
logistica = Pipeline([("prep", preparar), ("modelo", LogisticRegression(max_iter=2000))])
g_log = GridSearchCV(logistica, {"modelo__C": [0.01, 0.1, 1, 10]}, cv=cv, scoring="roc_auc").fit(X_tr, y_tr)
print(g_log.best_params_, round(g_log.best_score_, 3))
boosting = Pipeline([("prep", preparar), ("modelo", HistGradientBoostingClassifier(random_state=0))])
g_hgb = GridSearchCV(boosting, {"modelo__learning_rate": [0.03, 0.1], "modelo__max_depth": [2, 3, None],
                                "modelo__min_samples_leaf": [20, 100]}, cv=cv, scoring="roc_auc").fit(X_tr, y_tr)
print({k: v for k, v in g_hgb.best_params_.items()}, round(g_hgb.best_score_, 3))
final = g_hgb.best_estimator_
for nome, m in [("logística", g_log.best_estimator_), ("boosting afinado", final)]:
    p = m.predict_proba(X_te)[:, 1]
    print(nome, round(roc_auc_score(y_te, p), 3), round(average_precision_score(y_te, p), 3), round(brier_score_loss(y_te, p), 3))

print("=== 5")
custo, aceita, meses = 40, 0.3, 12
def lucro(contactar, reais, mensal):
    return float((aceita * meses * mensal * (contactar & (reais == 1))).sum() - custo * contactar.sum())
p_oof = cross_val_predict(final, X_tr, y_tr, cv=cv, method="predict_proba")[:, 1]
limiares = np.round(np.arange(0.05, 0.81, 0.05), 2)
lucros = [lucro(p_oof >= t, y_tr.to_numpy(), X_tr["MonthlyCharges"].to_numpy()) for t in limiares]
melhor = float(limiares[int(np.argmax(lucros))])
print(melhor, {float(t): round(l) for t, l in zip(limiares, lucros) if t in (0.1, 0.2, 0.3, 0.5)})
p_te = final.predict_proba(X_te)[:, 1]
mensal = X_te["MonthlyCharges"].to_numpy(); reais = y_te.to_numpy()
valor_esperado = p_te * aceita * meses * mensal - custo
estrategias = {"ninguém": np.zeros(len(reais), bool), "todos": np.ones(len(reais), bool),
               "limiar 0,5": p_te >= 0.5, f"limiar {melhor}": p_te >= melhor, "valor esperado > 0": valor_esperado > 0}
for nome, c in estrategias.items():
    print(nome, int(c.sum()), int((c & (reais == 1)).sum()), round(lucro(c, reais, mensal)))

print("=== 6")
imp = permutation_importance(final, X_te, y_te, n_repeats=10, random_state=0, scoring="roc_auc")
print(pd.Series(imp.importances_mean, index=X.columns).sort_values(ascending=False).round(3).head(5).to_string())
X_prep = pd.DataFrame(final.named_steps["prep"].transform(X_te), columns=final.named_steps["prep"].get_feature_names_out())
valores = shap.TreeExplainer(final.named_steps["modelo"])(X_prep)
print(pd.Series(np.abs(valores.values).mean(axis=0), index=X_prep.columns).sort_values(ascending=False).round(3).head(6).to_string())
i = int(np.argmax(p_te))
print(X_te.iloc[i][["tenure", "Contract", "InternetService", "PaymentMethod", "MonthlyCharges"]].to_dict(), round(p_te[i], 3))
print(pd.Series(valores.values[i], index=X_prep.columns).sort_values(key=abs, ascending=False).round(2).head(4).to_dict())`;

const RULES = [
  "Todo o pré-processamento vive dentro de pipelines.",
  "Separe 20% dos clientes para teste logo no início (`train_test_split(..., test_size=0.2, stratify=y, random_state=0)`). O teste só se usa uma vez, na pergunta 4, e depois para as contas finais das perguntas 5 e 6. Todas as escolhas (modelo, parâmetros, limiar) fazem-se com validação cruzada no treino, com `StratifiedKFold(5, shuffle=True, random_state=0)`.",
  "Todos os números vêm de código que corre de cima a baixo.",
];

const Q1 =
  "Verifique a forma, os tipos e os valores em falta. Há uma coluna numérica que o pandas leu como texto: qual, porquê, e que clientes são esses? Calcule a taxa de churn global e por tipo de contrato, tipo de internet, forma de pagamento e faixa de antiguidade (0–6, 7–12, 13–24, 25–48 e 49–72 meses). Faça dois gráficos. Que perfis de cliente saem mais?";
const Q2 =
  "Corrija a coluna da pergunta 1 e justifique o que fez com os valores em falta. Retire o que não deve entrar no modelo. Calcule a correlação entre `TotalCharges` e `tenure × MonthlyCharges`: o que conclui? Faça a divisão treino-teste e monte um `ColumnTransformer` que padronize as numéricas e aplique `OneHotEncoder(handle_unknown=\"ignore\")` às categóricas.";
const Q3 =
  "Com validação cruzada no treino, compare a linha de base (`DummyClassifier`), a regressão logística, uma random forest (500 árvores, `min_samples_leaf=5`), o `HistGradientBoostingClassifier` e um `XGBClassifier(n_estimators=300, learning_rate=0.05, max_depth=3)`, todos com `random_state=0` quando aplicável. Use três métricas: AUC, precisão média e erro de Brier. Apresente uma tabela. As diferenças são maiores do que o ruído?";
const Q4 =
  "Afine dois candidatos com `GridSearchCV`: o C da logística (0,01; 0,1; 1; 10) e, no `HistGradientBoostingClassifier`, `learning_rate` (0,03; 0,1), `max_depth` (2; 3; None) e `min_samples_leaf` (20; 100). Escolha o modelo final e explique porquê. Só então avalie os dois no teste (AUC, AP, Brier). O `best_score_` foi otimista?";
const Q5 =
  "Pressupostos da equipa comercial: cada ligação com oferta custa 40 dólares; 30% dos clientes que iam sair aceitam a oferta e ficam; um cliente que fica vale 12 mensalidades (`12 × MonthlyCharges`). Os clientes que não iam sair não dão lucro extra.\n- (a) Escreva uma função `lucro(contactar, reais, mensal)` com estas regras.\n- (b) Com `cross_val_predict` no treino, calcule o lucro para limiares de 0,05 a 0,80 (passos de 0,05) e escolha o melhor.\n- (c) No teste, compare cinco estratégias: não ligar a ninguém, ligar a todos, limiar de 0,5, o limiar de (b), e ligar a quem tem valor esperado positivo, p × 0,3 × 12 × mensalidade − 40 > 0. Qual ganha, e porquê?";
const Q6 =
  "Calcule a importância por permutação do modelo final no teste e os valores SHAP (se o modelo final for de árvores; se for a logística, use os coeficientes padronizados). Faça o gráfico resumo. Explique a previsão do cliente com maior risco. Há alguma variável suspeita de fuga? Pense em *quando* foram medidas as variáveis de quem saiu.";
const Q7 =
  "Escreva à direção comercial, em 8 a 12 linhas e sem jargão: a quem ligar, quanto se espera ganhar, porque saem os clientes e o que mais podia ser feito além das ligações. Inclua pelo menos três limitações; uma delas tem de ser sobre causalidade (o modelo diz quem vai sair, não quem vai ficar *por causa* da oferta).";

export const F2: PhaseClosing = {
  phase: "F2",
  source: "curso-engenharia-ia/fase-02-exame-e-mini-projeto",
  intro:
    "A Fase 2 fecha com uma semana e meia de avaliação: um exame sobre os cinco módulos de machine learning clássico e um mini-projeto que os junta num problema de negócio completo, prever que clientes vão sair e decidir a quem ligar. Passa-se à Fase 3 com **14 ou mais valores no exame e 12 ou mais no mini-projeto**.",
  passRule: { exam: 14, project: 12 },
  sessions: [
    { label: "Sessão 1", what: "Rever as cinco apostilas e refazer as perguntas falhadas nas provas do M7 ao M11", time: "1h30" },
    { label: "Sessão 2", what: "Fazer o exame, cronometrado e sem consulta (ver as regras abaixo)", time: "1h30" },
    { label: "Sessões 3 e 4", what: "Mini-projeto: perguntas 1 a 4", time: "3h" },
    { label: "Sessão 5", what: "Mini-projeto: perguntas 5 a 7 e relatório", time: "2h" },
  ],
  retakeNote:
    "Se o exame ficar abaixo de 14: rever as secções indicadas no gabarito durante uma semana e repetir o exame. O mini-projeto pode ser melhorado e entregue de novo as vezes que for preciso.",
  examRules:
    "**Duração:** 90 minutos. **Sem consulta e sem correr código** nos Grupos I e II (pode usar calculadora); no Grupo III pode usar o Colab e a documentação do scikit-learn, mas não assistentes de IA. Cotação total: 20 valores; aprovação com 14. O exame vale 20 valores: 10 perguntas de escolha múltipla (duas por módulo), 3 perguntas de resposta curta que cruzam módulos e um problema de programação de 4 valores.",

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
            kind: "mcq", id: "q1", num: 1, section: "M7", points: 1,
            q: "Num problema com 2% de positivos, um classificador tem 98% de exatidão no teste. Pode concluir-se que:",
            options: [
              "É um bom modelo.",
              "Pode não ter aprendido nada: prever sempre \"negativo\" dá o mesmo.",
              "Tem revocação de 98%.",
              "Tem AUC de 0,98.",
            ],
            answer: 1,
          },
          {
            kind: "mcq", id: "q2", num: 2, section: "M7", points: 1,
            q: "Um modelo tem erro de treino muito baixo e erro de validação muito mais alto. O mais provável é:",
            options: [
              "Viés alto: deve usar um modelo mais flexível.",
              "Uma fuga de dados.",
              "Variância alta (sobreajuste): deve simplificar, regularizar ou juntar dados.",
              "Classes desequilibradas.",
            ],
            answer: 2,
          },
          {
            kind: "mcq", id: "q3", num: 3, section: "M8", points: 1,
            q: "Numa regressão logística que prevê uma compra, a variável binária \"tem cartão de cliente\" tem coeficiente 0,7. Mantendo o resto igual, ter o cartão:",
            options: [
              "Multiplica as odds de compra por cerca de 2.",
              "Aumenta a probabilidade de compra em 0,7.",
              "Aumenta a probabilidade de compra em 70%.",
              "Multiplica a probabilidade de compra por 0,7.",
            ],
            answer: 0,
            explain: "As odds multiplicam por e^0,7 ≈ 2,01; a mudança na probabilidade depende do ponto de partida.",
          },
          {
            kind: "mcq", id: "q4", num: 4, section: "M8", points: 1,
            q: "Qual é a diferença essencial entre a regressão Ridge e o Lasso?",
            options: [
              "O Ridge só serve para classificação.",
              "O Lasso não precisa de variáveis padronizadas.",
              "O Ridge escolhe o α por validação cruzada e o Lasso não.",
              "O Lasso pode pôr coeficientes exatamente a zero; o Ridge só os encolhe.",
            ],
            answer: 3,
          },
          {
            kind: "mcq", id: "q5", num: 5, section: "M9", points: 1,
            q: "Qual destas afirmações é verdadeira?",
            options: [
              "Numa random forest, mais árvores aumentam o sobreajuste.",
              "As árvores de decisão precisam de variáveis padronizadas.",
              "No gradient boosting, uma taxa de aprendizagem menor pede mais árvores.",
              "O k-NN funciona melhor com muitas variáveis.",
            ],
            answer: 2,
          },
          {
            kind: "mcq", id: "q6", num: 6, section: "M9", points: 1,
            q: "Uma SVM com kernel RBF tem 100% de exatidão no treino, e quase todos os pontos de treino são vetores de suporte. O mais provável é que:",
            options: ["O γ esteja demasiado alto.", "O γ esteja demasiado baixo.", "O C esteja demasiado baixo.", "Os dados sejam linearmente separáveis."],
            answer: 0,
          },
          {
            kind: "mcq", id: "q7", num: 7, section: "M10", points: 1,
            q: "Porque é que o k-means falha com grupos em forma de lua?",
            options: [
              "Porque precisa de variáveis categóricas.",
              "Porque não padroniza os dados.",
              "Porque escolhe mal o k.",
              "Porque cada ponto vai para o centro mais próximo, o que dá fronteiras retas e grupos arredondados.",
            ],
            answer: 3,
          },
          {
            kind: "mcq", id: "q8", num: 8, section: "M10", points: 1,
            q: "Numa PCA de dados padronizados, a primeira componente principal é:",
            options: [
              "A variável com maior variância.",
              "A direção, combinação das variáveis, em que os dados variam mais.",
              "A variável mais correlacionada com o alvo.",
              "O centro do maior grupo.",
            ],
            answer: 1,
          },
          {
            kind: "mcq", id: "q9", num: 9, section: "M11", points: 1,
            q: "Calcular a média do alvo em cada categoria com todos os dados e usá-la como variável antes da validação cruzada:",
            options: [
              "É uma fuga de dados, sobretudo com categorias com poucos exemplos.",
              "É a forma correta de fazer *target encoding*.",
              "Só é um problema com modelos lineares.",
              "Dá uma estimativa pessimista.",
            ],
            answer: 0,
          },
          {
            kind: "mcq", id: "q10", num: 10, section: "M11", points: 1,
            q: "Para escolher o limiar de decisão de um classificador, o mais correto é usar:",
            options: [
              "Sempre 0,5.",
              "As previsões no conjunto de teste.",
              "Previsões fora da amostra no treino (por exemplo, com `cross_val_predict`) e os custos do negócio.",
              "O limiar que maximiza a exatidão no treino.",
            ],
            answer: 2,
          },
        ],
      },
      {
        title: "Grupo II — Resposta curta (6 valores)",
        note: "2 valores cada, 4 a 6 linhas por resposta.",
        questions: [
          {
            // Pergunta 11 → M7 e M9 (ver examReview).
            kind: "open", id: "q11", num: 11, section: "M7", points: 2, rows: 6,
            q: "Explique o compromisso entre viés e variância e mostre-o com dois parâmetros que estudou: a profundidade de uma árvore de decisão e o k do k-NN. Como se escolhe o valor certo?",
            criteria: [
              { id: "c1", text: "Viés e variância", points: 1 },
              { id: "c2", text: "Os dois exemplos no sentido certo e a escolha por validação", points: 1 },
            ],
            model:
              "O erro em dados novos tem duas partes que puxam em sentidos contrários: o viés (o modelo é demasiado simples para a relação verdadeira) e a variância (o modelo muda muito com os dados de treino e aprende ruído). Numa árvore, mais profundidade baixa o viés e sobe a variância: sem limite, decora o treino (100% no `Carseats`, 72% no teste). No k-NN é ao contrário: k = 1 tem variância alta, k muito grande aproxima-se de prever sempre a classe maior (viés alto). O valor certo escolhe-se por validação cruzada, de preferência com a regra de um erro padrão.",
          },
          {
            kind: "open", id: "q12", num: 12, section: "M11", points: 2, rows: 6,
            q: "Uma cadeia de 12 lojas quer prever as vendas diárias de cada loja nas duas semanas seguintes, e tem três anos de histórico. Descreva o plano de avaliação: como dividir os dados, que linha de base usar, que métrica, e dois cuidados para evitar fugas de dados.",
            criteria: [
              { id: "c1", text: "Divisão temporal e linha de base", points: 1 },
              { id: "c2", text: "Métrica e dois cuidados concretos", points: 1 },
            ],
            model:
              "Divisão temporal: treinar no passado e testar em períodos seguintes de duas semanas (`TimeSeriesSplit` ou janelas deslizantes), nunca ao acaso. Linha de base ingénua: as vendas do mesmo dia da semana anterior, ou a média das últimas semanas por loja. Métrica: MAE ou RMSE por loja e no total, em unidades de vendas, ou um erro percentual se as lojas tiverem tamanhos muito diferentes. Cuidados: só usar variáveis conhecidas no momento da previsão (por exemplo, não usar as vendas do próprio dia nem médias que incluam o futuro; o tempo do dia seguinte só se houver previsão meteorológica); calcular médias e outras transformações só com o treino, num pipeline; atenção a feriados e promoções que só se conhecem depois.",
          },
          {
            kind: "open", id: "q13", num: 13, section: "M10", points: 2, rows: 6,
            q: "A equipa de marketing pede \"os segmentos naturais dos nossos clientes\". Descreva como faria a segmentação com k-means e que cuidados teria ao apresentar o resultado.",
            criteria: [
              { id: "c1", text: "Processo com padronização e escolha do k", points: 1 },
              { id: "c2", text: "Cuidados de interpretação", points: 1 },
            ],
            model:
              "Escolher variáveis de comportamento com sentido para o negócio (valor gasto, frequência, recência, categorias compradas), tratar valores extremos, padronizar, experimentar vários k com inércia e silhueta, e escolher um k que dê grupos interpretáveis e acionáveis. Descrever cada grupo pelo perfil nas unidades originais e dar-lhe um nome. Cuidados ao apresentar: os grupos não são \"naturais\" (com silhuetas baixas, são uma divisão útil de uma nuvem contínua); verificar se se mantêm com outra semente ou outra amostra; o k-means assume grupos arredondados; testar as ações de marketing em cada segmento antes de as generalizar.",
          },
        ],
      },
      {
        title: "Grupo III — Programação (4 valores)",
        questions: [
          {
            kind: "open", id: "q14", num: 14, section: "M8", points: 4, rows: 18,
            q: "O conjunto `load_diabetes(as_frame=True, scaled=False)` do scikit-learn tem 442 doentes com diabetes, 10 variáveis medidas no início do estudo (idade, sexo, índice de massa corporal `bmi`, pressão arterial `bp` e seis análises ao sangue, `s1` a `s6`) e, como alvo, uma medida da progressão da doença um ano depois.",
            context: [
              {
                t: "p",
                text: "(a) Compare, com `KFold(5, shuffle=True, random_state=0)` e o RMSE: a previsão pela média (`DummyRegressor`), uma regressão linear com padronização num pipeline, um `RidgeCV(alphas=np.logspace(-3, 3, 50))` também padronizado, uma `RandomForestRegressor(n_estimators=500, min_samples_leaf=5, random_state=0)` e um `HistGradientBoostingRegressor(random_state=0)`. (b) Que modelo escolheria, e porquê? (c) Separe 25% para teste (`random_state=0`), treine a regressão linear no resto e calcule o RMSE no teste e a importância por permutação (`n_repeats=20`, `random_state=0`). Compare as três variáveis mais importantes com os maiores coeficientes do modelo (nas variáveis padronizadas). (d) As variáveis `s1` e `s2` têm correlação de 0,90. Que cuidado isto pede ao ler os coeficientes?",
              },
            ],
            criteria: [
              { id: "c1", text: "(a) Os cinco modelos com as mesmas divisões, resultados certos", points: 1.5 },
              { id: "c2", text: "(b) Escolha justificada, com a leitura do ruído", points: 0.75 },
              { id: "c3", text: "(c) RMSE no teste, importâncias e coeficientes comparados", points: 1 },
              { id: "c4", text: "(d) Colinearidade explicada", points: 0.75 },
            ],
            model:
              "(a) RMSE médio nas cinco dobras (desvio padrão): média 76,9 (4,1), linear 54,5 (2,1), Ridge 54,6 (2,1), random forest 56,9 (3,2), boosting 58,8 (5,0). (b) A regressão linear (54,5), ou a Ridge, que dá o mesmo (o α escolhido é cerca de 2, uma regularização leve). Com 442 doentes e relações quase lineares, os ensembles têm mais variância e não ganham nada: é o caso do `Carseats` do M9, e não o do `Bikeshare`. As diferenças entre linear e Ridge são ruído; para os ensembles, são de 2 a 4 pontos, com desvios padrão de 2 a 5. (c) No teste, RMSE de 56,4. A permutação põe `s5`, `s1` e `bmi` à frente; os maiores coeficientes são `s5`, `bmi` e `s1` (este com sinal negativo), seguidos de `bp` e `s2`. Concordam no essencial. (d) Com `s1` e `s2` tão correlacionadas, o modelo pode compensar uma com a outra: `s1` recebe um coeficiente grande e negativo e `s2` um positivo, e pequenas mudanças nos dados podem trocar estes valores. O efeito de cada uma não se lê isoladamente; lê-se o efeito conjunto, ou usa-se Ridge para estabilizar, ou fica-se só com uma delas. É também por isso que a importância por permutação de `s1` é alta: baralhá-la sozinha desfaz a compensação.",
            modelBlocks: [{ t: "code", title: "Solução do gabarito, alíneas (a) e (c)", code: G3_SOLUTION, output: G3_OUTPUT }],
          },
        ],
      },
    ],
  },

  // Gabarito: 1, 2 e 11 → M7 (secções 2 a 4); 3, 4 e 14 → M8 (secções 3 a 5); 5, 6 e 11 → M9 (secções 1 a 4);
  // 7, 8 e 13 → M10 (secções 1 e 4); 9, 10 e 12 → M11 (secções 3 e 4).
  examReview: [
    { questions: [1, 2, 11], module: "M7", sections: [2, 3, 4] },
    { questions: [3, 4, 14], module: "M8", sections: [3, 4, 5] },
    { questions: [5, 6, 11], module: "M9", sections: [1, 2, 3, 4] },
    { questions: [7, 8, 13], module: "M10", sections: [1, 4] },
    { questions: [9, 10, 12], module: "M11", sections: [3, 4] },
  ],

  project: {
    title: "Retenção de clientes: quem vai sair e a quem ligar",
    intro: [
      {
        t: "p",
        text: "Um projeto de machine learning completo, num notebook do Colab, do ficheiro em bruto até uma recomendação para a direção. Junta os cinco módulos da fase: avaliação honesta (M7), modelos lineares (M8), ensembles de árvores (M9) e pipelines, classes desequilibradas e interpretação (M11). O M10 aparece como extensão opcional. Tempo previsto: 5 a 6 horas.",
      },
      {
        t: "p",
        text: "O problema é de retenção de clientes. Uma operadora de telecomunicações perde, todos os meses, uma parte dos clientes para a concorrência (o *churn*). A equipa comercial pode ligar aos clientes em risco e oferecer um desconto, mas cada ligação custa dinheiro. A direção quer saber a quem ligar, quanto se ganha com isso e porque é que os clientes saem.",
      },
      { t: "h3", text: "Os dados" },
      { t: "code", code: LOAD },
      { t: "p", text: "É um conjunto de exemplo publicado pela IBM: 7043 clientes fictícios mas realistas de uma operadora, com 21 colunas." },
      {
        t: "table",
        head: ["Colunas", "O que são"],
        rows: [
          ["`customerID`", "Identificador do cliente"],
          ["`gender`, `SeniorCitizen`, `Partner`, `Dependents`", "Dados demográficos"],
          ["`tenure`", "Meses como cliente"],
          [
            "`PhoneService`, `MultipleLines`, `InternetService`, `OnlineSecurity`, `OnlineBackup`, `DeviceProtection`, `TechSupport`, `StreamingTV`, `StreamingMovies`",
            "Serviços contratados",
          ],
          ["`Contract`, `PaperlessBilling`, `PaymentMethod`", "Tipo de contrato, faturação e forma de pagamento"],
          ["`MonthlyCharges`, `TotalCharges`", "Mensalidade atual e total pago até hoje (dólares)"],
          ["`Churn`", "Saiu no último mês? (`Yes` / `No`)"],
        ],
      },
      { t: "p", text: "**Regras do projeto:**" },
      { t: "list", ordered: true, items: RULES },
      { t: "h3", text: "As sete perguntas" },
      { t: "p", text: "Cada pergunta tem de ser respondida com código, os números pedidos e uma resposta de 2 a 4 frases." },
    ],
    // As alíneas da pergunta 5 vêm em lista no original: linhas "- …" (a PhasePage mostra-as em lista).
    questions: [
      { n: 1, title: "Explorar (M3, M7).", text: Q1 },
      { n: 2, title: "Preparar (M11).", text: Q2 },
      { n: 3, title: "Comparar modelos (M7, M8, M9).", text: Q3 },
      { n: 4, title: "Afinar e testar (M11).", text: Q4 },
      { n: 5, title: "Decidir a quem ligar (M7, M11).", text: Q5 },
      { n: 6, title: "Explicar (M11).", text: Q6 },
      { n: 7, title: "Recomendação.", text: Q7 },
    ],
    deliverables: [
      { t: "p", text: "Um notebook que corre de cima a baixo sem erros (Ambiente de execução → Executar tudo), organizado assim:" },
      {
        t: "list",
        ordered: true,
        items: [
          "**Título, objetivo e pressupostos de negócio**, numa célula de texto.",
          "**Preparação**: carregar, limpar, dividir, `ColumnTransformer`.",
          "**As sete perguntas**, cada uma com código, números, gráfico quando pedido e resposta.",
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
            "**Segmentar quem sai (M10).** Aplique o k-means aos clientes do treino que saíram (variáveis padronizadas) e descreva os perfis. Uma oferta única serve todos?",
            "**Calibração.** Desenhe a curva de calibração do modelo final (`CalibrationDisplay` do scikit-learn): quando o modelo diz 30%, saem mesmo 30%?",
            "**Uplift.** O modelo prevê quem vai sair, mas o que interessa é quem fica *por causa* da ligação. Os modelos de *uplift* estimam esse efeito, e precisam de dados de uma experiência com grupo de controlo (Gutierrez & Gérardy, 2017). Desenhe, em 5 linhas, o teste A/B que permitiria treinar um.",
          ],
        },
      ],
    },
    rubric: [
      {
        id: "exploracao",
        text: "Exploração",
        detail: "Problema do `TotalCharges` encontrado e explicado; taxas de churn certas e comentadas; gráficos",
        points: 2,
      },
      { id: "preparacao", text: "Preparação", detail: "Limpeza justificada; `customerID` fora; divisão estratificada; pipeline correto", points: 2 },
      {
        id: "comparacao",
        text: "Comparação de modelos",
        detail: "Os cinco modelos com as mesmas divisões e três métricas; leitura honesta das diferenças",
        points: 3,
      },
      { id: "afinacao", text: "Afinação e teste", detail: "Procuras corretas; teste usado uma só vez; otimismo comentado", points: 3 },
      {
        id: "decisao",
        text: "Decisão de negócio",
        detail: "Função de lucro certa; limiar escolhido no treino; as cinco estratégias comparadas no teste",
        points: 4,
      },
      {
        id: "interpretacao",
        text: "Interpretação",
        detail: "Importâncias e SHAP certos e bem lidos; discussão de fugas e de causalidade",
        points: 3,
      },
      {
        id: "recomendacao",
        text: "Recomendação e código",
        detail: "Texto claro e sustentado, com as limitações; notebook que corre, organizado",
        points: 3,
      },
    ],
    references: [
      {
        text: "IBM, Telco Customer Churn, conjunto de dados de exemplo.",
        href: "https://github.com/IBM/telco-customer-churn-on-icp4d",
      },
      {
        text: "Gutierrez, P. & Gérardy, J.-Y. (2017). Causal inference and uplift modelling: a review of the literature. *Proceedings of The 3rd International Conference on Predictive Applications and APIs*, PMLR 67, 1–13.",
      },
      {
        text: "Kapoor, S. & Narayanan, A. (2023). Leakage and the reproducibility crisis in machine-learning-based science. *Patterns*, 4(9), 100804.",
      },
    ],
  },

  projectKey: [
    { t: "p", text: "Todo o código foi corrido com scikit-learn 1.9, XGBoost 3.4, shap 0.53, pandas 3.0 e NumPy 2.5, e os valores são os reais." },
    {
      t: "p",
      text: "O código de referência usa `TotalCharges` com os 11 valores em falta trocados por 0, um `ColumnTransformer` com `StandardScaler` e `OneHotEncoder(handle_unknown=\"ignore\")` e `sparse_threshold=0` (para os valores SHAP), e as sementes do enunciado. Outras escolhas razoáveis dão números um pouco diferentes; o que conta é a lógica.",
    },
    { t: "h3", text: "1. Explorar" },
    {
      t: "p",
      text: "7043 clientes e 21 colunas. `TotalCharges` foi lido como texto porque 11 clientes têm um espaço em branco: são todos clientes com `tenure` = 0, que ainda não pagaram nenhuma fatura. Churn global: 26,5%.",
    },
    {
      t: "table",
      head: ["Grupo", "Churn"],
      rows: [
        ["Contrato mensal / 1 ano / 2 anos", "42,7% / 11,3% / 2,8%"],
        ["Internet por fibra / DSL / sem internet", "41,9% / 19,0% / 7,4%"],
        ["Pagamento por cheque eletrónico / outros métodos", "45,3% / 15 a 19%"],
        ["Antiguidade 0–6 / 7–12 / 13–24 / 25–48 / 49–72 meses", "52,9% / 35,9% / 28,7% / 20,4% / 9,5%"],
      ],
    },
    { t: "p", text: "Saem mais os clientes recentes, com contrato mensal, internet por fibra e pagamento por cheque eletrónico." },
    { t: "h3", text: "2. Preparar" },
    {
      t: "p",
      text: "Converter com `pd.to_numeric(..., errors=\"coerce\")` e preencher os 11 com 0, porque não pagaram nada (preencher com a mediana seria errado aqui). Retirar `customerID` (identificador, sem informação e com risco de decorar clientes) e `Churn` das variáveis. A correlação entre `TotalCharges` e `tenure × MonthlyCharges` é 0,9996: o total é quase só antiguidade vezes mensalidade, informação redundante mas não uma fuga. Treino com 5634 clientes, teste com 1409.",
    },
    { t: "h3", text: "3. Comparar modelos" },
    {
      t: "table",
      head: ["Modelo", "AUC", "AP", "Brier"],
      rows: [
        ["Linha de base", "0,500", "0,265", "0,195"],
        ["Regressão logística", "0,844", "0,654", "0,136"],
        ["Random forest", "0,845", "0,664", "0,135"],
        ["Gradient boosting", "0,838", "0,653", "0,139"],
        ["XGBoost", "0,847", "0,673", "0,134"],
      ],
    },
    {
      t: "p",
      text: "Todos ganham muito à linha de base, e entre si as diferenças são de um centil de AUC, dentro do ruído. É um resultado típico deste conjunto: as relações são quase lineares e a logística é tão boa como os ensembles.",
    },
    { t: "h3", text: "4. Afinar e testar" },
    {
      t: "p",
      text: "Logística: C = 10, AUC em validação cruzada 0,844 (os quatro valores de C dão entre 0,840 e 0,844). Boosting: `learning_rate` 0,1, `max_depth` 3, `min_samples_leaf` 100, AUC 0,849. No teste:",
    },
    {
      t: "table",
      head: ["Modelo", "AUC", "AP", "Brier"],
      rows: [
        ["Logística (C = 10)", "0,852", "0,654", "0,134"],
        ["Boosting afinado", "0,850", "0,652", "0,134"],
      ],
    },
    {
      t: "p",
      text: "O `best_score_` não se revelou otimista: com 5600 clientes no treino e grelhas pequenas, o otimismo do vencedor é menor do que o ruído do teste (cerca de 0,01 de AUC). Ambos os modelos são defensáveis; a referência usa o boosting afinado, que permite valores SHAP exatos, mas a logística é igualmente boa e mais simples de explicar.",
    },
    { t: "h3", text: "5. Decidir a quem ligar" },
    { t: "code", code: LUCRO },
    {
      t: "p",
      text: "(b) Com as previsões fora da amostra do treino, o lucro é máximo com o limiar de 0,20 (245 170 dólares no treino; 240 405 com 0,10, 230 191 com 0,30 e 178 897 com 0,50). (c) No teste:",
    },
    {
      t: "table",
      head: ["Estratégia", "Contactados", "Dos quais saíam", "Lucro (dólares)"],
      rows: [
        ["Ninguém", "0", "0", "0"],
        ["Todos", "1409", "374", "46 496"],
        ["Limiar 0,5", "285", "194", "43 357"],
        ["Limiar 0,2", "664", "322", "63 746"],
        ["Valor esperado > 0", "688", "321", "65 619"],
      ],
    },
    {
      t: "p",
      text: "Ganha a regra do valor esperado, logo seguida do limiar de 0,2. O limiar de 0,5 é demasiado conservador: deixa de fora muitos clientes que valia a pena contactar, porque a ligação é barata face ao valor de um cliente. A regra do valor esperado ganha porque usa também a mensalidade: vale mais a pena ligar a um cliente com risco médio e mensalidade alta do que a um com risco igual e mensalidade baixa. Ligar a todos dá lucro, mas gasta 40 dólares em mais de mil clientes que não iam sair.",
    },
    { t: "h3", text: "6. Explicar" },
    {
      t: "p",
      text: "Importância por permutação (AUC) no teste: `Contract` 0,078, `tenure` 0,043, `MonthlyCharges` 0,012, `InternetService` 0,010, `TotalCharges` 0,008. Maiores |SHAP| médios: contrato mensal (0,70), antiguidade (0,39), mensalidade (0,29), sem segurança online (0,23), sem apoio técnico (0,21), contrato de 2 anos (0,19). O cliente com maior risco (91,7%) tem 1 mês de antiguidade, contrato mensal, fibra, pagamento por cheque eletrónico e 94 dólares de mensalidade; o contrato mensal soma 0,83 aos log-odds, a antiguidade 0,65, o total pago 0,64 e a falta de apoio técnico 0,30.",
    },
    {
      t: "p",
      text: "Sobre fugas: nenhuma variável é a resposta disfarçada, mas não se sabe quando foram medidas. Se, para quem saiu, os serviços e a mensalidade forem os do momento da saída (por exemplo, depois de cancelar serviços antes de sair), há uma fuga temporal. Num projeto real, confirma-se com a equipa de dados que as variáveis são uma fotografia tirada antes do período de previsão.",
    },
    { t: "h3", text: "7. Recomendação" },
    {
      t: "p",
      text: "Recomendação-modelo: \"O modelo identifica com boa fiabilidade os clientes com maior risco de sair. Recomendamos ligar aos cerca de 690 clientes (em cada 1400) em que a oferta compensa, tendo em conta o risco e a mensalidade: com os pressupostos da equipa comercial, isto rende cerca de 65 mil dólares por cada 1400 clientes, contra 47 mil se ligássemos a todos. Os clientes que mais saem são os recentes, com contrato mensal, internet por fibra, sem segurança online nem apoio técnico e que pagam por cheque eletrónico. Além das ligações, vale a pena testar incentivos à passagem para contratos anuais, ao débito automático e à inclusão do apoio técnico, e investigar a satisfação com o serviço de fibra. Limitações: o modelo diz quem vai sair, não quem fica por causa da oferta, por isso a taxa de aceitação de 30% tem de ser medida num teste com grupo de controlo; não sabemos se as variáveis foram medidas antes da saída dos clientes; e o modelo foi avaliado num só período, por isso deve ser monitorizado e retreinado.\"",
    },
    { t: "h3", text: "Solução de referência" },
    {
      t: "p",
      text: "O ficheiro `codigo/mini_projeto_referencia.py` da pasta da fase imprime todos os valores acima, pergunta a pergunta.",
    },
    { t: "code", title: "mini_projeto_referencia.py", code: REFERENCE },
  ],

  notebook: {
    filename: "F2 — mini-projeto",
    cells: [
      {
        type: "md",
        source:
          "# Título\n\n**Objetivo:** \n\n**Pressupostos de negócio:** \n\nMini-projeto da Fase 2: prever que clientes de uma operadora de telecomunicações vão sair (o *churn*) e decidir a quem ligar com uma oferta. Dados de exemplo da IBM: 7043 clientes, 21 colunas.\n\n**Regras do projeto:**\n\n" +
          RULES.map((r, i) => `${i + 1}. ${r}`).join("\n") +
          "\n\nAntes de entregar: Ambiente de execução → Executar tudo, e confirmar que corre de cima a baixo sem erros.",
      },
      { type: "md", source: "## Preparação\n\nCarregar, limpar, dividir, `ColumnTransformer`." },
      { type: "code", source: LOAD + "\n" },
      { type: "code", source: "" },
      {
        type: "md",
        source:
          "## As sete perguntas\n\nCada pergunta tem de ser respondida com código, os números pedidos e uma resposta de 2 a 4 frases.\n\n### 1. Explorar (M3, M7)\n\n" + Q1,
      },
      { type: "code", source: "" },
      { type: "md", source: "**Resposta:** " },
      { type: "md", source: "### 2. Preparar (M11)\n\n" + Q2 },
      { type: "code", source: "" },
      { type: "md", source: "**Resposta:** " },
      { type: "md", source: "### 3. Comparar modelos (M7, M8, M9)\n\n" + Q3 },
      { type: "code", source: "" },
      { type: "md", source: "**Resposta:** " },
      { type: "md", source: "### 4. Afinar e testar (M11)\n\n" + Q4 },
      { type: "code", source: "" },
      { type: "md", source: "**Resposta:** " },
      { type: "md", source: "### 5. Decidir a quem ligar (M7, M11)\n\n" + Q5.replace("extra.\n- ", "extra.\n\n- ") },
      { type: "code", source: "def lucro(contactar, reais, mensal):\n    ...\n" },
      { type: "md", source: "**Resposta:** " },
      { type: "md", source: "### 6. Explicar (M11)\n\n" + Q6 },
      { type: "code", source: "" },
      { type: "md", source: "**Resposta:** " },
      { type: "md", source: "### 7. Recomendação\n\n" + Q7 },
      { type: "md", source: "**Recomendação à direção comercial:** " },
      { type: "md", source: "## Conclusões\n\n**As três descobertas principais**\n\n1. \n2. \n3. " },
    ],
  },
};
