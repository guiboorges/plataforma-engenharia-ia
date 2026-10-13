import type { ModuleContent } from "../types";

// Módulo 9 — Árvores, ensembles e outros modelos.
// Fonte: curso-engenharia-ia 2/modulo-09-arvores-ensembles (01-aula, 02-apostila, 03-exercicios, 04-prova, 05-gabarito,
// codigo/exemplos_m9.py e img/). As quatro imagens da aula entram como figuras; as fórmulas, escritas em LaTeX na aula,
// passam a texto Unicode (não há renderizador de LaTeX). A escolha de um corte pelo CART, o bagging e as random forests, e o
// gradient boosting à mão têm widgets interativos (src/components/widgets/m9): os cortes e o boosting dão exatamente os
// resultados do scikit-learn 1.9 (DecisionTreeClassifier e GradientBoostingRegressor com max_depth=1); as florestas usam
// outro gerador aleatório e foram comparadas em média com o RandomForestClassifier. As verificações rápidas, os cartões de
// revisão e o banco do simulado foram escritos pela plataforma a partir da aula.
// Todo o código da aula (exemplos_m9.py) foi corrido em Python 3.13 com scikit-learn 1.9.1, XGBoost 3.4.1 e LightGBM 4.7.0:
// os resultados coincidem com os comentários, e o campo `output` de cada bloco tem o resultado real.
// No gabarito, os exercícios 5, 6, 9 e 10 (dados OJ) e o Grupo I e II da prova coincidem. Onde o gabarito difere do que
// se obteve, ficam os valores oficiais com uma "Nota da plataforma" na solução: exercício 3 (validação das profundidades
// 5 a 12 e sem limite; 0,740 e não 0,738 na 5, 0,742 e não 0,732 a partir da 11; o mesmo com o scikit-learn 1.6.1, e
// nenhuma semente de 0 a 199 nem ordem de colunas reproduz a tabela oficial, por isso a resposta (b) muda), exercício 4
// (max_features=2 dá 0,81 e não 0,82 no teste), exercício 8 (floresta 0,808, 0,787, 0,75 e 0,722) e Grupo III da prova
// (floresta 0,433; permutação 0,328, 0,191, 0,078, 0,055).

// ---------------------------------------------------------------- código da aula

const CART_CODE = `import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier

URL = "https://raw.githubusercontent.com/intro-stat-learning/ISLP/main/ISLP/data/"
cs = pd.read_csv(URL + "Carseats.csv")
y = (cs["Sales"] > 8).astype(int)                 # 1 = vendas altas
X = pd.get_dummies(cs.drop(columns="Sales"), drop_first=True, dtype=int)
print(round(y.mean(), 2))                          # 0.41
X_treino, X_teste, y_treino, y_teste = train_test_split(X, y, test_size=0.25, stratify=y, random_state=0)

for profundidade in [None, 3, 5]:
    arvore = DecisionTreeClassifier(max_depth=profundidade, random_state=0).fit(X_treino, y_treino)
    print(profundidade, arvore.get_depth(), arvore.get_n_leaves(),
          round(arvore.score(X_treino, y_treino), 3), round(arvore.score(X_teste, y_teste), 3))
# None 10 44 1.0 0.72       <- sem limite: decora o treino
# 3 3 8 0.813 0.73
# 5 5 22 0.883 0.73`;

const RF_CODE = `from sklearn.ensemble import RandomForestClassifier
from sklearn.inspection import permutation_importance

floresta = RandomForestClassifier(n_estimators=500, oob_score=True, random_state=0).fit(X_treino, y_treino)
print(round(floresta.oob_score_, 3), round(floresta.score(X_teste, y_teste), 3))   # 0.807 0.82`;

const IMP_CODE = `imp_impureza = pd.Series(floresta.feature_importances_, index=X.columns)
perm = permutation_importance(floresta, X_teste, y_teste, n_repeats=20, random_state=0)
imp_permutacao = pd.Series(perm.importances_mean, index=X.columns)
print(pd.DataFrame({"impureza": imp_impureza, "permutação": imp_permutacao}).round(3)
      .sort_values("permutação", ascending=False).head(6).to_string())
#                 impureza  permutação
# Price              0.221       0.151
# ShelveLoc_Good     0.116       0.108
# Advertising        0.121       0.065
# CompPrice          0.110       0.053
# Income             0.106       0.028
# Age                0.115       0.020`;

const O_IMP = `                impureza  permutação
Price              0.221       0.151
ShelveLoc_Good     0.116       0.108
Advertising        0.121       0.065
CompPrice          0.110       0.053
Income             0.106       0.028
Age                0.115       0.020`;

const BIKE_CODE = `from sklearn.model_selection import GroupKFold, cross_val_score
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor, HistGradientBoostingRegressor

bk = pd.read_csv(URL + "Bikeshare.csv")
print(bk.shape)                                                    # (8645, 15)
Xb = pd.get_dummies(bk.drop(columns=["casual", "registered", "bikers"]),
                    columns=["mnth", "weathersit"], drop_first=True, dtype=int)
yb = bk["bikers"]                                                  # bicicletas por hora
Xb_lin = pd.get_dummies(Xb, columns=["hr"], drop_first=True, dtype=int)   # o linear precisa da hora como categoria

divisoes = GroupKFold(5)                                           # cada dia fica inteiro num só lado
candidatos = [
    ("linear (hora como categoria)", LinearRegression(), Xb_lin),
    ("árvore (profundidade 6)", DecisionTreeRegressor(max_depth=6, random_state=0), Xb),
    ("random forest", RandomForestRegressor(n_estimators=300, n_jobs=-1, random_state=0), Xb),
    ("gradient boosting", HistGradientBoostingRegressor(random_state=0), Xb),
]
for nome, modelo, Xc in candidatos:
    rmse = -cross_val_score(modelo, Xc, yb, cv=divisoes, groups=bk["day"], scoring="neg_root_mean_squared_error")
    print(nome, round(rmse.mean(), 1))
# linear (hora como categoria) 75.6
# árvore (profundidade 6) 65.4
# random forest 38.9
# gradient boosting 35.0`;

const RATES_CODE = `from sklearn.model_selection import GroupShuffleSplit
from sklearn.metrics import root_mean_squared_error

treino, teste = next(GroupShuffleSplit(n_splits=1, test_size=0.2, random_state=0).split(Xb, yb, groups=bk["day"]))
for taxa in [0.3, 0.1, 0.03]:
    gb = HistGradientBoostingRegressor(learning_rate=taxa, max_iter=1000, early_stopping=False, random_state=0)
    gb.fit(Xb.iloc[treino], yb.iloc[treino])
    erros = [root_mean_squared_error(yb.iloc[teste], p) for p in gb.staged_predict(Xb.iloc[teste])]
    print(taxa, int(np.argmin(erros)) + 1, round(min(erros), 1), round(erros[-1], 1))
# 0.3 86 36.3 38.5
# 0.1 207 35.1 35.8
# 0.03 985 34.9 34.9`;

const XGB_CODE = `from xgboost import XGBRegressor
from lightgbm import LGBMRegressor

for nome, modelo in [("XGBoost", XGBRegressor(n_estimators=500, learning_rate=0.05, max_depth=6, random_state=0)),
                     ("LightGBM", LGBMRegressor(n_estimators=500, learning_rate=0.05, random_state=0, verbose=-1))]:
    rmse = -cross_val_score(modelo, Xb, yb, cv=divisoes, groups=bk["day"], scoring="neg_root_mean_squared_error")
    print(nome, round(rmse.mean(), 1))
# XGBoost 35.5
# LightGBM 34.4`;

const KNN_CODE = `from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline

cv = StratifiedKFold(5, shuffle=True, random_state=0)
for k in [1, 5, 15, 51, 151]:
    sem = cross_val_score(KNeighborsClassifier(n_neighbors=k), X, y, cv=cv).mean()
    com = cross_val_score(make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=k)), X, y, cv=cv).mean()
    print(k, round(sem, 3), round(com, 3))
# 1 0.59 0.738
# 5 0.653 0.753
# 15 0.648 0.775     <- o melhor, com padronização
# 51 0.572 0.76
# 151 0.59 0.648`;

const DIM_CODE = `rng = np.random.default_rng(0)
for d in [2, 10, 100, 1000]:
    pontos = rng.uniform(size=(1000, d))                    # 1000 pontos num cubo de d dimensões
    dist = np.linalg.norm(pontos[1:] - pontos[0], axis=1)   # distâncias do primeiro a todos os outros
    print(d, round(dist.min() / dist.max(), 2))
# 2 0.01
# 10 0.29
# 100 0.7
# 1000 0.9`;

const SVM_CODE = `from sklearn.svm import SVC
from sklearn.model_selection import GridSearchCV

print(round(cross_val_score(SVC(), X, y, cv=cv).mean(), 3))      # 0.612  <- sem padronizar
grelha = GridSearchCV(make_pipeline(StandardScaler(), SVC()),
                      {"svc__C": [0.1, 1, 10, 100], "svc__gamma": [0.001, 0.01, 0.1, 1]}, cv=cv)
grelha.fit(X, y)
print(grelha.best_params_, round(grelha.best_score_, 3))   # {'svc__C': 100, 'svc__gamma': 0.001} 0.883`;

const CMP_CODE = `from sklearn.model_selection import cross_validate
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import HistGradientBoostingClassifier

modelos = {
    "regressão logística": make_pipeline(StandardScaler(), LogisticRegression()),
    "árvore (profundidade 3)": DecisionTreeClassifier(max_depth=3, random_state=0),
    "random forest": RandomForestClassifier(n_estimators=500, random_state=0),
    "gradient boosting": HistGradientBoostingClassifier(random_state=0),
    "k-NN (k = 15)": make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=15)),
    "SVM (kernel RBF)": make_pipeline(StandardScaler(), SVC()),
}
for nome, modelo in modelos.items():
    r = cross_validate(modelo, X, y, cv=cv, scoring=["accuracy", "roc_auc"])
    print(f"{nome:25s} {r['test_accuracy'].mean():.3f} {r['test_roc_auc'].mean():.3f}")
#                           exatidão  AUC
# regressão logística       0.880 0.957
# árvore (profundidade 3)   0.720 0.710
# random forest             0.800 0.880
# gradient boosting         0.828 0.911
# k-NN (k = 15)             0.775 0.850
# SVM (kernel RBF)          0.857 0.935`;

const O_CMP = `regressão logística       0.880 0.957
árvore (profundidade 3)   0.720 0.710
random forest             0.800 0.880
gradient boosting         0.828 0.911
k-NN (k = 15)             0.775 0.850
SVM (kernel RBF)          0.857 0.935`;

// ---------------------------------------------------------------- fórmulas (LaTeX na aula, aqui em Unicode)

const F_GINI = `G = Σₖ pₖ (1 − pₖ)`;
const F_BOOST = `Fₘ(x) = Fₘ₋₁(x) + η · hₘ(x)`;
const F_RBF = `K(x, x′) = exp(−γ · ‖x − x′‖²)`;

// ---------------------------------------------------------------- gabarito: preparação comum e soluções

const PREP = `import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_validate, cross_val_score
URL = "https://raw.githubusercontent.com/intro-stat-learning/ISLP/main/ISLP/data/"
cs = pd.read_csv(URL + "Carseats.csv")
y = (cs["Sales"] > 8).astype(int)
X = pd.get_dummies(cs.drop(columns="Sales"), drop_first=True, dtype=int)
X_treino, X_teste, y_treino, y_teste = train_test_split(X, y, test_size=0.25, stratify=y, random_state=0)
cv = StratifiedKFold(5, shuffle=True, random_state=0)`;

const E3_CODE = `import matplotlib.pyplot as plt
from sklearn.tree import DecisionTreeClassifier

profundidades = list(range(1, 13)) + [None]
linhas = []
for d in profundidades:
    r = cross_validate(DecisionTreeClassifier(max_depth=d, random_state=0), X, y, cv=cv, return_train_score=True)
    linhas.append((str(d), r["train_score"].mean(), r["test_score"].mean(), r["test_score"].std()))
tab = pd.DataFrame(linhas, columns=["profundidade", "treino", "validação", "dp"]).round(3)
print(tab.to_string(index=False))

fig, ax = plt.subplots(figsize=(7, 4))
ax.plot(tab["profundidade"], tab["treino"], "o-", label="treino")
ax.plot(tab["profundidade"], tab["validação"], "o-", label="validação cruzada")
ax.set_xlabel("max_depth"); ax.set_ylabel("Exatidão"); ax.legend()
plt.show()`;

const E4_CODE = `from sklearn.ensemble import RandomForestClassifier

for mf in [1, 2, 3, 5, 8, None]:
    rf = RandomForestClassifier(n_estimators=500, max_features=mf, oob_score=True, random_state=0, n_jobs=-1)
    rf.fit(X_treino, y_treino)
    print(mf, round(rf.oob_score_, 3), round(rf.score(X_teste, y_teste), 3))
print(round(np.sqrt(0.8 * 0.2 / 100), 3))   # 0.04`;

const E5_CODE = `from sklearn.ensemble import GradientBoostingRegressor

x5 = np.array([[1], [2], [3], [4]])
y5 = np.array([3, 5, 9, 11])
gb5 = GradientBoostingRegressor(n_estimators=40, learning_rate=0.5, max_depth=1).fit(x5, y5)
for i, p in enumerate(gb5.staged_predict(x5), start=1):
    if i in (1, 2, 10, 40):
        print(i, p.round(3), round(np.mean((y5 - p) ** 2), 4))
# 1 [5.5 5.5 8.5 8.5] 3.25
# 2 [4.75 4.75 9.25 9.25] 1.5625
# 10 [ 3.117  4.763  9.19  10.929] 0.0278
# 40 [ 3.013  4.98   9.018 10.989] 0.0002`;

const E6_CODE = `from sklearn.model_selection import GroupShuffleSplit
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.metrics import root_mean_squared_error

bk = pd.read_csv(URL + "Bikeshare.csv")
Xb = pd.get_dummies(bk.drop(columns=["casual", "registered", "bikers"]),
                    columns=["mnth", "weathersit"], drop_first=True, dtype=int)
yb = bk["bikers"]
treino, teste = next(GroupShuffleSplit(n_splits=1, test_size=0.2, random_state=0).split(Xb, yb, groups=bk["day"]))
Xb_tr, yb_tr, Xb_te, yb_te = Xb.iloc[treino], yb.iloc[treino], Xb.iloc[teste], yb.iloc[teste]

for taxa in [0.1, 0.05]:                                              # (a)
    gb = HistGradientBoostingRegressor(learning_rate=taxa, max_iter=3000, early_stopping=True,
                                       validation_fraction=0.1, n_iter_no_change=20, random_state=0)
    gb.fit(Xb_tr, yb_tr)
    print(taxa, gb.n_iter_, round(root_mean_squared_error(yb_te, gb.predict(Xb_te)), 1))
# 0.1 185 35.7
# 0.05 508 35.8

sub, val = next(GroupShuffleSplit(n_splits=1, test_size=0.1, random_state=0)
                .split(Xb_tr, groups=bk["day"].iloc[treino]))               # (c) validação por dias
for taxa in [0.1, 0.05]:
    gb = HistGradientBoostingRegressor(learning_rate=taxa, max_iter=3000, early_stopping=False, random_state=0)
    gb.fit(Xb_tr.iloc[sub], yb_tr.iloc[sub])
    erros = [root_mean_squared_error(yb_tr.iloc[val], p) for p in gb.staged_predict(Xb_tr.iloc[val])]
    n_arvores = int(np.argmin(erros)) + 1
    final = HistGradientBoostingRegressor(learning_rate=taxa, max_iter=n_arvores, early_stopping=False, random_state=0)
    final.fit(Xb_tr, yb_tr)
    print(taxa, n_arvores, round(root_mean_squared_error(yb_te, final.predict(Xb_te)), 1))
# 0.1 206 35.1
# 0.05 440 35.2`;

const E8_CODE = `from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline

rng = np.random.default_rng(0)
ruido = pd.DataFrame(rng.normal(size=(len(X), 100)), columns=[f"ruido_{i}" for i in range(100)])
modelos = {"logística": make_pipeline(StandardScaler(), LogisticRegression()),
           "random forest": RandomForestClassifier(n_estimators=300, random_state=0, n_jobs=-1),
           "k-NN": make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=15))}
for m in [0, 10, 50, 100]:
    Xr = pd.concat([X, ruido.iloc[:, :m]], axis=1)
    print(m, [round(float(cross_val_score(mod, Xr, y, cv=cv).mean()), 3) for mod in modelos.values()])`;

const E9_CODE = `from sklearn.datasets import make_moons
from sklearn.svm import SVC
from sklearn.model_selection import GridSearchCV

Xm, ym = make_moons(n_samples=500, noise=0.3, random_state=1)
Xm_tr, Xm_te, ym_tr, ym_te = train_test_split(Xm, ym, test_size=0.3, random_state=0)
for g in [0.1, 1, 10, 100]:                                           # (a)
    svm = SVC(C=1, gamma=g).fit(Xm_tr, ym_tr)
    print(g, round(svm.score(Xm_tr, ym_tr), 3), round(svm.score(Xm_te, ym_te), 3), svm.n_support_.sum())

xx, yy = np.meshgrid(np.linspace(-2, 3, 300), np.linspace(-1.6, 2.1, 300))   # (b)
fig, eixos = plt.subplots(1, 3, figsize=(13, 4))
for ax, g in zip(eixos, [0.1, 1, 100]):
    z = SVC(C=1, gamma=g).fit(Xm_tr, ym_tr).predict(np.c_[xx.ravel(), yy.ravel()]).reshape(xx.shape)
    ax.contourf(xx, yy, z, alpha=0.25, cmap="coolwarm")
    ax.scatter(Xm_tr[:, 0], Xm_tr[:, 1], c=ym_tr, cmap="coolwarm", s=10)
    ax.set_title(f"γ = {g}")
plt.show()

grelha = GridSearchCV(SVC(), {"C": [0.1, 1, 10, 100], "gamma": [0.1, 0.3, 1, 3, 10]}, cv=5).fit(Xm_tr, ym_tr)   # (c)
print(grelha.best_params_, round(grelha.best_score_, 3), round(grelha.score(Xm_te, ym_te), 3))
print(round(LogisticRegression().fit(Xm_tr, ym_tr).score(Xm_te, ym_te), 3))`;

const E10_CODE = `from sklearn.dummy import DummyClassifier
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.inspection import permutation_importance
from xgboost import XGBClassifier

oj = pd.read_csv(URL + "OJ.csv")
print(oj.shape, oj["Purchase"].value_counts(normalize=True).round(2).to_dict())   # (1070, 18) {'CH': 0.61, 'MM': 0.39}
y_oj = (oj["Purchase"] == "MM").astype(int)
X_oj = pd.get_dummies(oj.drop(columns=["Purchase", "STORE", "Store7"]), columns=["StoreID"], drop_first=True, dtype=int)

modelos = {"linha de base": DummyClassifier(),
           "regressão logística": make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000)),
           "random forest": RandomForestClassifier(n_estimators=500, random_state=0, n_jobs=-1),
           "gradient boosting": HistGradientBoostingClassifier(random_state=0),
           "XGBoost": XGBClassifier(n_estimators=300, learning_rate=0.05, max_depth=3, random_state=0)}
for nome, modelo in modelos.items():
    r = cross_validate(modelo, X_oj, y_oj, cv=cv, scoring=["accuracy", "roc_auc"])
    print(f"{nome:22s} {r['test_accuracy'].mean():.3f} {r['test_roc_auc'].mean():.3f}")
# linha de base          0.610 0.500
# regressão logística    0.834 0.897
# random forest          0.788 0.863
# gradient boosting      0.795 0.877
# XGBoost                0.823 0.894

Xo_tr, Xo_te, yo_tr, yo_te = train_test_split(X_oj, y_oj, test_size=0.25, stratify=y_oj, random_state=0)
melhor = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000)).fit(Xo_tr, yo_tr)
perm = permutation_importance(melhor, Xo_te, yo_te, n_repeats=20, random_state=0, scoring="roc_auc")
print(pd.Series(perm.importances_mean, index=X_oj.columns).sort_values(ascending=False).round(3).head(5).to_string())
# LoyalCH      0.317
# PctDiscCH    0.010
# StoreID_7    0.009
# PctDiscMM    0.008
# PriceDiff    0.007
print(oj.groupby("Purchase")["LoyalCH"].mean().round(2).to_dict())   # {'CH': 0.72, 'MM': 0.32}`;

const P13_CODE = `from sklearn.model_selection import KFold, cross_val_score, train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor, HistGradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
from sklearn.inspection import permutation_importance

hi = pd.read_csv(URL + "Hitters.csv").dropna(subset=["Salary"])                       # (a)
X = pd.get_dummies(hi.drop(columns="Salary"), drop_first=True, dtype=int)
y = np.log(hi["Salary"])
print(X.shape, round(y.std(), 3))                                                     # (263, 19) 0.889

cv = KFold(5, shuffle=True, random_state=0)                                           # (b)
modelos = {"regressão linear": make_pipeline(StandardScaler(), LinearRegression()),
           "árvore (profundidade 4)": DecisionTreeRegressor(max_depth=4, random_state=0),
           "random forest": RandomForestRegressor(n_estimators=500, random_state=0),
           "gradient boosting": HistGradientBoostingRegressor(random_state=0)}
for nome, m in modelos.items():
    rmse = -cross_val_score(m, X, y, cv=cv, scoring="neg_root_mean_squared_error")
    print(f"{nome:25s} {rmse.mean():.3f}")
# regressão linear          0.662
# árvore (profundidade 4)   0.549
# random forest             0.432
# gradient boosting         0.469

X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, random_state=0)       # (c)
rf = RandomForestRegressor(n_estimators=500, random_state=0).fit(X_tr, y_tr)
perm = permutation_importance(rf, X_te, y_te, n_repeats=20, random_state=0, scoring="neg_root_mean_squared_error")
print(pd.Series(perm.importances_mean, index=X.columns).sort_values(ascending=False).round(3).head(4).to_string())
# CAtBat    0.327
# CRBI      0.189
# CHits     0.078
# CRuns     0.054`;

const STATLEARNING = "https://www.statlearning.com/";

export const M9: ModuleContent = {
  id: "M9",
  duration: "2 semanas, cerca de 6 horas",
  intro:
    "No fim deste módulo deve saber como uma árvore de decisão divide os dados, porque é que juntar muitas árvores (random forests e gradient boosting) funciona tão bem, usar o XGBoost e o LightGBM, perceber a ideia do k-NN e das SVM, e escolher o modelo certo para dados em tabela.",
  outcomes: [
    "Explicar como uma árvore de decisão divide os dados",
    "Explicar porque é que juntar muitas árvores (random forests e gradient boosting) funciona tão bem",
    "Usar o XGBoost e o LightGBM",
    "Perceber a ideia do k-NN e das SVM",
    "Escolher o modelo certo para dados em tabela",
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
        { id: "t2", text: "Ler James et al. (2023), sec. 8.1", link: { kind: "url", href: STATLEARNING } },
      ],
    },
    {
      id: "w1s2",
      label: "Semana 1 · sessão 2",
      minutes: 90,
      tasks: [
        { id: "t1", text: "Ler a secção 2", link: { kind: "section", id: "s2" } },
        { id: "t2", text: "Ler James et al. (2023), sec. 8.2.1 e 8.2.2", link: { kind: "url", href: STATLEARNING } },
        { id: "t3", text: "Exercícios 1 a 4", link: { kind: "tab", tab: "exercicios" } },
      ],
    },
    {
      id: "w2s1",
      label: "Semana 2 · sessão 1",
      minutes: 90,
      tasks: [
        { id: "t1", text: "Ler a secção 3", link: { kind: "section", id: "s3" } },
        { id: "t2", text: "Ler James et al. (2023), sec. 8.2.3", link: { kind: "url", href: STATLEARNING } },
        { id: "t3", text: "Exercícios 5 a 7", link: { kind: "tab", tab: "exercicios" } },
      ],
    },
    {
      id: "w2s2",
      label: "Semana 2 · sessão 2",
      minutes: 90,
      tasks: [
        { id: "t1", text: "Ler as secções 4 e 5", link: { kind: "section", id: "s4" } },
        { id: "t2", text: "Exercícios 8 a 10", link: { kind: "tab", tab: "exercicios" } },
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
      title: "Árvores de decisão",
      minutes: 35,
      blocks: [
        {
          t: "callout",
          tone: "info",
          title: "Como estudar este módulo",
          text: "Este é o módulo com mais aplicação direta no trabalho: os ensembles de árvores são, ainda hoje, a melhor escolha para a maioria dos problemas com dados em tabela, como vendas, clientes ou transações.",
        },
        {
          t: "callout",
          tone: "info",
          title: "O código deste módulo",
          text: "Além do scikit-learn, usam-se as bibliotecas XGBoost e LightGBM, que já vêm instaladas no Colab (localmente: `pip install xgboost lightgbm`). O código foi testado com scikit-learn 1.9, XGBoost 3.4 e LightGBM 4.7. Alguns blocos demoram dezenas de segundos: as florestas têm centenas de árvores.",
        },
        {
          t: "p",
          text: "Uma árvore de decisão prevê fazendo uma sequência de perguntas de sim ou não sobre as variáveis: \"a posição na prateleira é boa?\", \"o preço é menor do que 97?\". Cada caminho até ao fim da árvore acaba numa **folha**, que prevê a classe mais frequente dos exemplos de treino que lá caem (em classificação) ou a sua média (em regressão).",
        },
        { t: "h3", text: "Como a árvore cresce" },
        {
          t: "p",
          text: "O algoritmo clássico, o CART (Breiman, Friedman, Olshen & Stone, 1984), é guloso: em cada nó, experimenta todas as variáveis e todos os pontos de corte, e escolhe o que deixa os dois grupos resultantes mais **puros**, ou seja, mais dominados por uma só classe. A medida de impureza mais usada é o índice de Gini:",
        },
        { t: "code", title: "Fórmula", code: F_GINI },
        {
          t: "p",
          text: "onde pₖ é a proporção da classe k no nó. Um nó com uma só classe tem G = 0; um nó meio-meio com duas classes tem G = 0,5. Depois repete-se o processo em cada grupo, até a uma regra de paragem.",
        },
        { t: "h3", text: "Exemplo: que lojas vendem muito?" },
        {
          t: "p",
          text: "Nos dados `Carseats`, uma loja tem vendas altas se vender mais de 8 mil cadeirinhas, como em James et al. (2023, sec. 8.3.1). 41% das lojas estão nesse caso.",
        },
        {
          t: "code",
          title: "Árvores de profundidades diferentes",
          code: CART_CODE,
          output: "0.41\nNone 10 44 1.0 0.72\n3 3 8 0.813 0.73\n5 5 22 0.883 0.73",
        },
        {
          t: "p",
          text: "As colunas são: profundidade pedida, profundidade real, número de folhas, exatidão no treino e no teste. Sem limite, a árvore cresce até cada folha ser pura: 100% no treino, 72% no teste. É o sobreajuste do M7 na sua forma mais pura. Com profundidade 3, perde no treino e ganha no teste.",
        },
        {
          t: "figure",
          src: "img/01-arvore-carseats.png",
          alt: "Árvore de profundidade 3 para as vendas altas: a posição na prateleira e o preço decidem quase tudo",
        },
        {
          t: "p",
          text: "A árvore lê-se de cima para baixo. A primeira pergunta é se a prateleira é boa: nas lojas com boa prateleira (22,7% do treino), 76,5% vendem muito; nas outras, só 30,6%. Depois entram o preço, a publicidade e o rendimento local. Para desenhar uma árvore assim, use `sklearn.tree.plot_tree(arvore, feature_names=list(X.columns), filled=True)`, ou `export_text` para a ver em texto.",
        },
        {
          t: "widget",
          name: "m9-corte",
          caption:
            "Como o CART escolhe a primeira pergunta, com 30 lojas do Carseats (`cs.sample(30, random_state=47)`) e quatro variáveis. Desloque o corte, compare a impureza de cada lado e a média pesada, e veja qual é o melhor corte de cada variável. Os números são os do `DecisionTreeClassifier(max_depth=1)` do scikit-learn.",
        },
        { t: "h3", text: "Controlar o tamanho" },
        {
          t: "table",
          head: ["Parâmetro", "O que faz"],
          rows: [
            ["`max_depth`", "Limita o número de perguntas seguidas"],
            ["`min_samples_leaf`", "Exige um número mínimo de exemplos em cada folha"],
            [
              "`ccp_alpha`",
              "Poda por custo-complexidade: cresce a árvore toda e corta os ramos que pouco melhoram, com uma penalização por folha, como o α do Lasso (James et al., 2023, sec. 8.1.1)",
            ],
          ],
        },
        { t: "p", text: "Todos se escolhem por validação cruzada." },
        { t: "h3", text: "Forças e fraquezas" },
        {
          t: "p",
          text: "As árvores são fáceis de explicar, não precisam de variáveis padronizadas, apanham relações não lineares e interações sem ninguém as programar, e lidam bem com variáveis de tipos diferentes. O problema é a **variância**: mudar um pouco os dados de treino pode mudar a primeira pergunta e, com ela, a árvore inteira. Sozinhas, são raramente o modelo mais exato. A solução é juntá-las.",
        },
        {
          t: "check",
          id: "qc1",
          q: "Um nó tem 30 exemplos: 24 de uma classe e 6 da outra. Qual é o seu índice de Gini?",
          options: ["0,2", "0,16", "0,32", "0,5"],
          answer: 2,
          explain:
            "p = 24/30 = 0,8. G = Σ pₖ(1 − pₖ) = 0,8 × 0,2 + 0,2 × 0,8 = 0,32, o mesmo que 1 − (0,8² + 0,2²). 0,5 seria um nó meio-meio; 0,16 é só uma das duas parcelas.",
        },
      ],
    },
    {
      id: "s2",
      num: 2,
      title: "Bagging e random forests",
      minutes: 35,
      blocks: [
        {
          t: "p",
          text: "O M6 mostrou que a média de n observações independentes tem variância σ²/n. A mesma ideia aplica-se a modelos: a média de muitas árvores instáveis é muito mais estável do que qualquer uma delas. Juntar modelos chama-se fazer um **ensemble**.",
        },
        { t: "h3", text: "Bagging" },
        {
          t: "p",
          text: "O problema é que só há um conjunto de treino. O **bagging** (*bootstrap aggregating*, Breiman, 1996) usa o bootstrap do M6: treina cada árvore numa reamostragem com reposição dos dados e, no fim, faz votar as árvores (classificação) ou a média das previsões (regressão). As árvores crescem sem limite: cada uma sobreajusta à sua maneira, e a votação cancela os erros.",
        },
        { t: "h3", text: "Random forests" },
        {
          t: "p",
          text: "Se houver uma variável muito forte, quase todas as árvores do bagging começam por ela e ficam parecidas entre si. Ora, a média de coisas correlacionadas reduz pouco a variância. As **random forests** (Breiman, 2001) resolvem isto com um segundo sorteio: em cada nó, a árvore só pode escolher entre uma parte aleatória das variáveis (por omissão, √p em classificação). As árvores ficam mais diferentes entre si, e o conjunto melhora.",
        },
        {
          t: "p",
          text: "Há um bónus. Cada reamostragem deixa de fora cerca de 37% dos exemplos (a probabilidade de um exemplo nunca sair em n sorteios é (1 − 1/n)ⁿ ≈ 1/e ≈ 0,37). Avaliar cada exemplo só com as árvores que não o viram dá uma estimativa do erro sem precisar de um conjunto de validação: o **erro fora do saco** (*out-of-bag*, OOB).",
        },
        { t: "code", title: "Random forest com erro fora do saco", code: RF_CODE, output: "0.807 0.82" },
        { t: "p", text: "O OOB (80,7%) está perto da exatidão no teste (82%), e a floresta ganha 9 pontos à árvore de profundidade 3." },
        {
          t: "widget",
          name: "m9-floresta",
          caption:
            "Bagging e random forest nas duas luas da secção 5 (300 pontos de treino, 400 de teste). Veja uma árvore de cada vez, com os pontos que ficaram fora da sua reamostragem, e depois a votação de 1 a 200 árvores. As árvores são calculadas no browser, com outro gerador aleatório: os resultados médios são os do `RandomForestClassifier`, as árvores concretas não.",
        },
        { t: "h3", text: "Que variáveis pesam?" },
        {
          t: "p",
          text: "Uma floresta de 500 árvores já não se lê como uma árvore. Há duas formas clássicas de medir a importância das variáveis:",
        },
        {
          t: "list",
          items: [
            "**Pela impureza**: quanto cada variável reduz o Gini, somado em todas as árvores. É grátis (vem em `feature_importances_`), mas favorece variáveis contínuas e com muitos valores, que oferecem mais pontos de corte (Strobl, Boulesteix, Zeileis & Hothorn, 2007).",
            "**Por permutação**: baralhar os valores de uma variável no conjunto de teste e medir quanto a exatidão cai. Se a variável importa, baralhá-la estraga as previsões. É mais lenta e mais fiável.",
          ],
        },
        { t: "code", title: "Importância por impureza e por permutação", code: IMP_CODE, output: O_IMP },
        {
          t: "p",
          text: "As duas concordam no preço, mas a impureza põe a idade e o rendimento (contínuas) quase ao nível da boa prateleira (binária), e a permutação mostra que a prateleira pesa quatro a cinco vezes mais. Use a importância por permutação, calculada em dados que o modelo não viu. E lembre-se de que é uma importância para as **previsões do modelo**, não um efeito causal.",
        },
        { t: "h3", text: "Na prática" },
        {
          t: "p",
          text: "As random forests funcionam bem com os valores por omissão, o que as torna uma excelente segunda tentativa, logo a seguir à linha de base e ao modelo linear. Mais árvores nunca pioram o resultado, só tornam o treino mais lento; 300 a 500 costumam chegar. Os parâmetros que mais vale a pena afinar são `max_features` e `min_samples_leaf`.",
        },
        {
          t: "check",
          id: "qc2",
          q: "Faz-se bagging com 500 árvores de **regressão**, para prever as vendas de cada loja. Como se obtém a previsão final para uma loja?",
          options: [
            "Fica a previsão da árvore com menor erro fora do saco",
            "Faz-se a média das previsões das 500 árvores",
            "Faz-se votar as árvores e fica o valor mais votado",
            "Soma-se a previsão de todas as árvores",
          ],
          answer: 1,
          explain:
            "Em regressão, o bagging faz a média das previsões; em classificação, faz votar as árvores. Somar as árvores (cada uma multiplicada por η) é o que faz o boosting, não o bagging.",
        },
      ],
    },
    {
      id: "s3",
      num: 3,
      title: "Gradient boosting: XGBoost e LightGBM",
      minutes: 40,
      blocks: [
        {
          t: "p",
          text: "Na random forest, as árvores crescem independentes e votam. No **boosting**, crescem uma a seguir à outra, e cada árvore nova tenta corrigir os erros das anteriores. As árvores são pequenas (poucas perguntas cada), e cada uma contribui só com uma fração η da sua previsão:",
        },
        { t: "code", title: "Fórmula", code: F_BOOST },
        {
          t: "p",
          text: "Com o erro quadrático, cada árvore nova hₘ ajusta-se aos resíduos do modelo atual. Em geral, ajusta-se ao **gradiente negativo** da perda em relação às previsões (Friedman, 2001): é a descida do gradiente do M5, feita não nos parâmetros mas nas próprias previsões, e η é a taxa de aprendizagem. Daí o nome *gradient boosting*.",
        },
        { t: "h3", text: "Um problema à medida: o aluguer de bicicletas" },
        {
          t: "p",
          text: "O conjunto `Bikeshare` (James et al., 2023) tem o número de bicicletas alugadas em cada hora de 2011 no sistema partilhado de Washington: 8645 horas, com a hora do dia, o mês, o tipo de dia, o tempo, a temperatura e a humidade. O padrão tem uma interação forte, que um modelo linear não capta sem ajuda:",
        },
        {
          t: "figure",
          src: "img/02-bikeshare-horas.png",
          alt: "Utilizadores por hora: dois picos nos dias úteis, uma curva em bossa nos fins de semana",
        },
        {
          t: "p",
          text: "Nos dias úteis há os picos das deslocações para o trabalho às 8h e às 17h-18h; ao fim de semana, a procura concentra-se a meio do dia. Um modelo linear soma um efeito da hora e um efeito do tipo de dia; as árvores fazem uma pergunta e depois outra, e capturam combinações destas sem esforço.",
        },
        {
          t: "code",
          title: "Quatro modelos no Bikeshare",
          code: BIKE_CODE,
          output: "(8645, 15)\nlinear (hora como categoria) 75.6\nárvore (profundidade 6) 65.4\nrandom forest 38.9\ngradient boosting 35.0",
        },
        {
          t: "p",
          text: "Três pormenores. As colunas `casual` e `registered` somam exatamente o alvo: deixá-las seria uma fuga de dados (M7, M11). O `GroupKFold` com `groups=bk[\"day\"]` põe as 24 horas de cada dia sempre do mesmo lado, porque horas seguidas são muito parecidas e avaliar com horas \"vizinhas\" das de treino daria uma estimativa otimista. E o desvio padrão do alvo é de 134 bicicletas: o boosting erra, em média, cerca de um quarto disso, metade do erro do melhor modelo linear.",
        },
        { t: "h3", text: "Taxa de aprendizagem e número de árvores" },
        {
          t: "p",
          text: "Os dois parâmetros principais do boosting trabalham em conjunto. Uma taxa pequena dá passos pequenos, precisa de mais árvores e sobreajusta mais devagar:",
        },
        { t: "code", title: "Três taxas de aprendizagem", code: RATES_CODE, output: "0.3 86 36.3 38.5\n0.1 207 35.1 35.8\n0.03 985 34.9 34.9" },
        {
          t: "p",
          text: "`staged_predict` dá as previsões depois de cada árvore, o que permite ver a curva inteira. As colunas são: taxa, número de árvores com o menor erro, esse erro, e o erro com as 1000 árvores.",
        },
        {
          t: "figure",
          src: "img/03-boosting-taxas.png",
          alt: "RMSE em dias novos em função do número de árvores, para três taxas de aprendizagem",
        },
        {
          t: "p",
          text: "Com taxa 0,3, o melhor ponto chega às 86 árvores e depois o erro sobe: sobreajuste. Com 0,03, ainda está a melhorar às 1000. Na prática, fixa-se uma taxa entre 0,03 e 0,1 e usa-se **paragem antecipada** (*early stopping*): o treino pára quando o erro numa parte de validação deixa de melhorar durante um certo número de árvores. No `HistGradientBoostingRegressor` é o parâmetro `early_stopping=True`; no XGBoost e no LightGBM, `early_stopping_rounds`.",
        },
        {
          t: "widget",
          name: "m9-boosting",
          caption:
            "O boosting passo a passo, com a procura média por hora da figura do Bikeshare e uma só variável, a hora. Cada árvore tem um só corte e ajusta-se aos resíduos do modelo atual. Junte árvores uma a uma e mude a taxa de aprendizagem; as previsões são as do `GradientBoostingRegressor(max_depth=1)` do scikit-learn.",
        },
        { t: "h3", text: "XGBoost, LightGBM e companhia" },
        {
          t: "table",
          head: ["Biblioteca", "O que a distingue"],
          rows: [
            ["`HistGradientBoosting` (scikit-learn)", "Agrupa os valores de cada variável em histogramas, o que o torna muito rápido; aceita valores em falta"],
            ["XGBoost (Chen & Guestrin, 2016)", "Penaliza a complexidade das árvores e foi durante anos a arma principal nas competições do Kaggle"],
            ["LightGBM (Ke et al., 2017)", "Cresce as árvores folha a folha e é muito rápido em dados grandes"],
            ["CatBoost (Prokhorenkova et al., 2018)", "Trata variáveis categóricas de forma especialmente cuidada"],
          ],
        },
        { t: "p", text: "Todas têm a interface do scikit-learn:" },
        { t: "code", title: "XGBoost e LightGBM", code: XGB_CODE, output: "XGBoost 35.5\nLightGBM 34.4" },
        {
          t: "p",
          text: "As três implementações dão resultados muito parecidos. Escolha uma, aprenda bem os seus parâmetros e passe o tempo nas variáveis e na avaliação, que é onde estão os ganhos maiores.",
        },
        {
          t: "check",
          id: "qc3",
          q: "Numa loja, o modelo de boosting prevê F₂(x) = 10. A árvore seguinte prevê h₃(x) = +4 para essa loja, e a taxa de aprendizagem é η = 0,1. Quanto vale F₃(x)?",
          options: ["14", "10,1", "4", "10,4"],
          answer: 3,
          explain:
            "F₃(x) = F₂(x) + η · h₃(x) = 10 + 0,1 × 4 = 10,4. Cada árvore só contribui com uma fração η da sua previsão; 14 seria η = 1.",
        },
      ],
    },
    {
      id: "s4",
      num: 4,
      title: "k-NN e SVM",
      minutes: 40,
      blocks: [
        {
          t: "p",
          text: "Antes de os ensembles de árvores dominarem, havia outras duas famílias clássicas. Continuam a aparecer em entrevistas, em bibliotecas e em problemas específicos, e ambas ensinam uma lição que vale para todo o resto do curso: a escala das variáveis importa.",
        },
        { t: "h3", text: "k vizinhos mais próximos" },
        {
          t: "p",
          text: "O **k-NN** (*k-nearest neighbors*; Cover & Hart, 1967) é o modelo mais simples que existe. Não treina nada: guarda os dados. Para classificar uma loja nova, procura as k lojas de treino mais parecidas, medindo a distância euclidiana do M4 entre as variáveis, e faz votar as suas classes.",
        },
        {
          t: "p",
          text: "O k controla a flexibilidade. Com k = 1, cada ponto de treino manda numa pequena ilha à sua volta: variância alta, como a árvore sem limite. Com k muito grande, a previsão aproxima-se da classe mais frequente em todo o lado: viés alto. O k escolhe-se por validação cruzada.",
        },
        {
          t: "p",
          text: "Como tudo depende de distâncias, as variáveis com números grandes mandam. No `Carseats`, a população varia entre 10 e 509 (milhares de pessoas) e a escolaridade entre 10 e 18 anos: sem padronizar, uma diferença de 5 mil habitantes pesa tanto como uma de 5 anos de escolaridade, e as variáveis 0/1 quase não contam.",
        },
        {
          t: "code",
          title: "k-NN com e sem padronização",
          code: KNN_CODE,
          output: "1 0.59 0.738\n5 0.653 0.753\n15 0.648 0.775\n51 0.572 0.76\n151 0.59 0.648",
        },
        {
          t: "p",
          text: "Sem padronizar, o k-NN nunca passa dos 65%, pouco acima dos 59% de prever sempre \"vendas baixas\". Padronizado, chega aos 77,5% com k = 15. O `make_pipeline` junta os dois passos num só modelo, para que a média e o desvio padrão sejam calculados só com a parte de treino de cada divisão; o porquê disto é o tema do M11.",
        },
        { t: "h3", text: "A maldição da dimensionalidade" },
        {
          t: "p",
          text: "O k-NN tem um segundo problema, mais profundo. Com muitas variáveis, o espaço fica tão vazio que todos os pontos ficam quase à mesma distância uns dos outros, e \"o vizinho mais próximo\" deixa de querer dizer \"parecido\" (James et al., 2023, sec. 3.5; Hastie, Tibshirani & Friedman, 2009, sec. 2.5). Uma experiência mostra-o: espalhar 1000 pontos ao acaso num cubo e comparar a distância ao mais próximo com a distância ao mais afastado.",
        },
        { t: "code", title: "Distâncias em muitas dimensões", code: DIM_CODE, output: "2 0.01\n10 0.29\n100 0.7\n1000 0.9" },
        {
          t: "p",
          text: "Em 2 dimensões, o mais próximo está 100 vezes mais perto do que o mais afastado. Em 1000, está só 10% mais perto. Por isso o k-NN funciona com poucas variáveis e muitos dados, e falha com muitas variáveis. A ideia de procurar vizinhos voltou em força noutra forma: no M20 (Fase 4), a pesquisa semântica dos sistemas RAG procura os documentos mais próximos de uma pergunta, só que em representações aprendidas (*embeddings*) onde a distância tem significado.",
        },
        { t: "h3", text: "Máquinas de vetores de suporte" },
        {
          t: "p",
          text: "As **SVM** (*support vector machines*; Cortes & Vapnik, 1995) partem de uma ideia geométrica. Se as duas classes se podem separar com um hiperplano (uma reta, em 2 dimensões), há infinitas maneiras de o fazer. A SVM escolhe a que deixa a maior **margem**, ou seja, a maior distância até aos pontos mais próximos de cada lado. Esses pontos chamam-se **vetores de suporte**, e só eles definem a fronteira: os outros podiam mudar ou desaparecer sem a alterar.",
        },
        {
          t: "p",
          text: "Os dados reais quase nunca se separam na perfeição, por isso a SVM aceita alguns pontos do lado errado, com um custo. O parâmetro **C** controla esse custo: C grande castiga muito os erros de treino (margem estreita, mais variância); C pequeno tolera-os (margem larga, mais viés). É o mesmo C da regressão logística do M8: o inverso da força da regularização.",
        },
        {
          t: "p",
          text: "Para fronteiras curvas, a SVM usa o **truque do kernel**: em vez de criar à mão milhares de variáveis novas (quadrados, produtos, etc.), substitui o produto interno entre dois pontos por uma função de semelhança, o kernel, e o resultado equivale a trabalhar num espaço de dimensão muito maior sem nunca o construir. O kernel mais usado é o RBF, que mede a semelhança pela distância:",
        },
        { t: "code", title: "Fórmula", code: F_RBF },
        {
          t: "p",
          text: "O γ diz até onde chega a influência de cada ponto de treino: γ grande dá fronteiras muito recortadas (variância), γ pequeno dá fronteiras suaves, quase lineares (viés). Como o kernel usa distâncias, a padronização é, outra vez, obrigatória.",
        },
        {
          t: "code",
          title: "SVM e procura em grelha",
          code: SVM_CODE,
          output: "0.612\n{'svc__C': 100, 'svc__gamma': 0.001} 0.883",
        },
        {
          t: "p",
          text: "O `GridSearchCV` experimenta as 16 combinações de C e γ com validação cruzada e fica com a melhor; o nome `svc__C` quer dizer \"o parâmetro C do passo `svc` do pipeline\" (o M11 volta a isto). A exatidão média de cada combinação:",
        },
        {
          t: "table",
          head: ["C ↓ / γ →", "0,001", "0,01", "0,1", "1"],
          rows: [
            ["0,1", "0,590", "0,590", "0,680", "0,590"],
            ["1", "0,595", "0,852", "0,845", "0,605"],
            ["10", "0,868", "0,873", "0,830", "0,610"],
            ["100", "**0,883**", "0,867", "0,818", "0,610"],
          ],
        },
        {
          t: "p",
          text: "Com γ = 1, cada loja só \"vê\" as vizinhas muito próximas e a SVM fica perto do mínimo de 59%, faça-se o que se fizer ao C. A melhor combinação tem γ muito pequeno, ou seja, uma fronteira quase reta. É uma pista sobre estes dados, que a secção seguinte confirma.",
        },
        {
          t: "p",
          text: "Na prática, as SVM foram o estado da arte nos anos 2000, mas escalam mal: o tempo de treino cresce entre n² e n³, e com centenas de milhares de linhas tornam-se lentas. Também não dão probabilidades diretamente (`SVC(probability=True)` calibra-as à parte, com um custo extra). Hoje usam-se sobretudo em conjuntos pequenos ou médios com muitas variáveis.",
        },
        {
          t: "check",
          id: "qc4",
          q: "Sem padronizar, o k-NN no `Carseats` nunca passa dos 65%; padronizado, chega aos 77,5%. Qual é a explicação?",
          options: [
            "As variáveis com números grandes, como a população, dominam as distâncias e as variáveis 0/1 quase não contam.",
            "O k usado sem padronizar era pequeno demais.",
            "O k-NN não aceita variáveis 0/1 sem padronização.",
            "Sem padronizar, o k-NN sobreajusta como uma árvore sem limite.",
          ],
          answer: 0,
          explain:
            "O k-NN decide tudo por distâncias. Sem padronizar, uma diferença de 5 mil habitantes pesa tanto como 5 anos de escolaridade, e as variáveis 0/1, como a boa prateleira, quase não entram na distância.",
        },
      ],
    },
    {
      id: "s5",
      num: 5,
      title: "Qual escolher? Comparação e fronteiras de decisão",
      minutes: 30,
      blocks: [
        {
          t: "p",
          text: "Cada família de modelos tem uma forma própria de dividir o espaço. A figura mostra seis modelos treinados nos mesmos 300 pontos, duas \"luas\" entrelaçadas com ruído (`make_moons` do scikit-learn):",
        },
        {
          t: "figure",
          src: "img/04-fronteiras.png",
          alt: "Fronteiras de decisão de seis modelos nos mesmos dados: reta, degraus, curvas suaves",
        },
        {
          t: "p",
          text: "A regressão logística só sabe traçar uma reta. As árvores cortam o plano em retângulos, sempre paralelos aos eixos, porque cada pergunta usa uma só variável; a floresta e o boosting juntam muitos desses degraus. O k-NN e a SVM com kernel RBF desenham curvas suaves. Nenhuma forma é melhor em geral: depende da forma verdadeira da fronteira, que nunca se conhece de antemão.",
        },
        { t: "h3", text: "A comparação honesta" },
        { t: "p", text: "Por isso, compara-se. Os seis modelos no `Carseats`, com as mesmas cinco divisões:" },
        { t: "code", title: "Seis modelos no Carseats", code: CMP_CODE, output: O_CMP },
        {
          t: "p",
          text: "O `cross_validate` é como o `cross_val_score`, mas aceita várias métricas de uma vez. E o resultado talvez surpreenda: o modelo mais simples ganha, com folga. Não é acaso. O `Carseats` foi gerado por simulação, e as vendas dependem do preço, da prateleira e da publicidade de forma quase linear. Quando a fronteira verdadeira é quase uma reta, um modelo que só traça retas tem viés quase nulo e muito menos variância do que os outros. Foi o que a grelha da SVM já sugeria: a melhor SVM era a mais \"reta\".",
        },
        {
          t: "p",
          text: "No `Bikeshare` passou-se o contrário: o modelo linear errava o dobro do boosting, porque o efeito da hora muda com o tipo de dia. Os mesmos modelos, ordens opostas. Não existe um algoritmo melhor do que os outros em todos os problemas (Wolpert, 1996, chamou a isto o teorema *no free lunch*); existe o melhor para estes dados, e descobre-se com validação cruzada.",
        },
        { t: "h3", text: "O que dizem os estudos" },
        {
          t: "p",
          text: "Mesmo assim, há regularidades. Grinsztajn, Oyallon e Varoquaux (2022) compararam modelos em 45 conjuntos de dados em tabela de tamanho médio (cerca de 10 mil linhas) e concluíram que os ensembles de árvores, como o XGBoost e as random forests, continuam à frente das redes neuronais. Apontam três razões: as funções a aprender em dados de negócio são irregulares e as redes tendem para soluções demasiado suaves; as variáveis inúteis atrapalham mais as redes; e cada coluna tem um significado próprio, que as árvores respeitam ao fazer perguntas uma variável de cada vez.",
        },
        { t: "h3", text: "Um guia prático" },
        {
          t: "table",
          head: ["Situação", "Começar por"],
          rows: [
            ["Qualquer problema", "Linha de base ingénua e um modelo linear ou logístico regularizado (M7, M8)"],
            ["Dados em tabela, de milhares a milhões de linhas", "Gradient boosting: LightGBM, XGBoost ou `HistGradientBoosting`"],
            ["Um bom resultado sem quase nada para afinar", "Random forest"],
            ["Ter de explicar cada decisão a uma pessoa", "Árvore pequena ou modelo linear"],
            ["Poucas linhas e muitas variáveis", "Modelo linear regularizado ou SVM"],
            ["Imagens, som ou texto livre", "Redes neuronais (Fase 3)"],
          ],
        },
        {
          t: "p",
          text: "Um problema típico de uma loja on-line, como prever que clientes vão voltar a comprar ou que encomendas vão ser devolvidas, cai na segunda linha. Mas a ordem de trabalho é sempre a mesma: linha de base, modelo linear, ensemble de árvores, comparação justa com as mesmas divisões. E quase sempre os ganhos maiores estão em boas variáveis e numa avaliação sem fugas, os temas do M11, e não na troca de algoritmo.",
        },
        {
          t: "check",
          id: "qc5",
          q: "Na figura das fronteiras, que modelo só consegue dividir o plano em retângulos paralelos aos eixos?",
          options: ["Regressão logística", "SVM com kernel RBF", "Árvore de decisão", "k-NN"],
          answer: 2,
          explain:
            "Cada pergunta de uma árvore usa uma só variável (\"x₁ ≤ 0,4?\"), por isso cada corte é paralelo a um eixo. A regressão logística traça uma reta; o k-NN e a SVM com kernel RBF desenham curvas suaves.",
        },
      ],
    },
  ],

  readings: {
    required: [
      {
        text: "James, G., Witten, D., Hastie, T., Tibshirani, R. & Taylor, J. (2023). [*An Introduction to Statistical Learning with Applications in Python*](https://www.statlearning.com/). Springer. Cap. 8 (árvores, bagging, random forests e boosting) e cap. 9 (SVM); para o k-NN, sec. 2.2.3 e 3.5. Os laboratórios no fim de cada capítulo usam os mesmos dados desta aula. Gratuito online.",
        href: STATLEARNING,
      },
      {
        text: "Géron, A. (2022). *Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow* (3.ª ed.). O'Reilly. Caps. 5 (SVM), 6 (árvores de decisão) e 7 (ensembles e random forests). Mais prático, com muito código.",
      },
    ],
    complementary: [
      { text: "StatQuest, \"Decision and Classification Trees, Clearly Explained\"." },
      { text: "StatQuest, \"Random Forests Part 1\"." },
      { text: "StatQuest, \"Gradient Boost Part 1 (of 4)\" e a série \"XGBoost\"." },
      { text: "StatQuest, \"Support Vector Machines Part 1 (of 3)\"." },
      {
        text: "Hastie, T., Tibshirani, R. & Friedman, J. (2009). [*The Elements of Statistical Learning*](https://hastie.su.domains/ElemStatLearn/) (2.ª ed.). Springer. Sec. 9.2 (árvores) e caps. 10 (boosting), 12 (SVM), 13 (vizinhos mais próximos) e 15 (random forests). Mais matemático; gratuito online.",
        href: "https://hastie.su.domains/ElemStatLearn/",
      },
      {
        text: "Documentação do XGBoost, \"Introduction to Boosted Trees\", e do LightGBM, \"Parameters Tuning\". As melhores explicações práticas dos parâmetros de cada biblioteca.",
      },
    ],
    cited: [
      "Cover, T. M. & Hart, P. E. (1967). Nearest neighbor pattern classification. *IEEE Transactions on Information Theory*, 13(1), 21–27.",
      "Breiman, L., Friedman, J. H., Olshen, R. A. & Stone, C. J. (1984). *Classification and Regression Trees*. Wadsworth.",
      "Cortes, C. & Vapnik, V. (1995). Support-vector networks. *Machine Learning*, 20(3), 273–297.",
      "Breiman, L. (1996). Bagging predictors. *Machine Learning*, 24(2), 123–140.",
      "Wolpert, D. H. (1996). The lack of a priori distinctions between learning algorithms. *Neural Computation*, 8(7), 1341–1390.",
      "Breiman, L. (2001). Random forests. *Machine Learning*, 45(1), 5–32.",
      "Friedman, J. H. (2001). Greedy function approximation: a gradient boosting machine. *The Annals of Statistics*, 29(5), 1189–1232.",
      "Strobl, C., Boulesteix, A.-L., Zeileis, A. & Hothorn, T. (2007). Bias in random forest variable importance measures: illustrations, sources and a solution. *BMC Bioinformatics*, 8, 25.",
      "Chen, T. & Guestrin, C. (2016). XGBoost: a scalable tree boosting system. *Proceedings of the 22nd ACM SIGKDD International Conference on Knowledge Discovery and Data Mining*, 785–794.",
      "Ke, G., Meng, Q., Finley, T., Wang, T., Chen, W., Ma, W., Ye, Q. & Liu, T.-Y. (2017). LightGBM: a highly efficient gradient boosting decision tree. *Advances in Neural Information Processing Systems*, 30.",
      "Prokhorenkova, L., Gusev, G., Vorobev, A., Dorogush, A. V. & Gulin, A. (2018). CatBoost: unbiased boosting with categorical features. *Advances in Neural Information Processing Systems*, 31.",
      "Grinsztajn, L., Oyallon, E. & Varoquaux, G. (2022). Why do tree-based models still outperform deep learning on typical tabular data? *Advances in Neural Information Processing Systems*, 35 (Datasets and Benchmarks Track).",
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
            code: `G = Σₖ pₖ(1 − pₖ)
Fₘ(x) = Fₘ₋₁(x) + η · hₘ(x)
K(x, x′) = exp(−γ · ‖x − x′‖²)
P(fora do saco) = (1 − 1/n)ⁿ ≈ 1/e ≈ 0,37`,
          },
          {
            t: "p",
            text: "Gini: 0 num nó puro, 0,5 num nó meio-meio com duas classes. No boosting com erro quadrático, cada árvore nova hₘ ajusta-se aos resíduos; em geral, ao gradiente negativo da perda.",
          },
        ],
      },
      {
        title: "Os modelos",
        blocks: [
          {
            t: "table",
            head: ["Modelo", "Ideia", "Parâmetros principais", "Precisa de padronizar?"],
            rows: [
              ["Árvore de decisão", "Perguntas de sim ou não, escolhidas de forma gulosa para tornar os grupos mais puros", "`max_depth`, `min_samples_leaf`, `ccp_alpha`", "Não"],
              ["Bagging", "Muitas árvores sem limite, cada uma num bootstrap; votam", "`n_estimators`", "Não"],
              ["Random forest", "Bagging + sorteio de variáveis em cada nó, para as árvores ficarem diferentes", "`n_estimators`, `max_features`, `min_samples_leaf`", "Não"],
              ["Gradient boosting", "Árvores pequenas em sequência, cada uma corrige as anteriores", "`learning_rate`, número de árvores, profundidade, paragem antecipada", "Não"],
              ["k-NN", "Votam os k exemplos de treino mais próximos", "k", "Sim"],
              ["SVM", "Hiperplano com a maior margem; kernel para fronteiras curvas", "C, kernel, γ", "Sim"],
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
              ["CART", "O algoritmo clássico das árvores: cortes binários gulosos (Breiman et al., 1984)"],
              ["Folha", "Fim de um caminho; prevê a classe mais frequente ou a média dos exemplos que lá caem"],
              ["Poda por custo-complexidade", "Crescer a árvore toda e cortar ramos, com uma penalização por folha"],
              ["Variância das árvores", "Mudar um pouco os dados pode mudar a árvore inteira; é o ponto fraco que os ensembles corrigem"],
              ["Ensemble", "Juntar muitos modelos; a média de modelos instáveis e pouco correlacionados é estável"],
              ["Erro fora do saco (OOB)", "Avaliar cada exemplo só com as árvores que não o viram; validação grátis"],
              ["Importância por impureza", "Soma das reduções de Gini; rápida, mas favorece variáveis contínuas e com muitos valores"],
              ["Importância por permutação", "Quanto o desempenho cai ao baralhar uma variável, em dados novos; mais fiável. Não é causal"],
              ["Taxa de aprendizagem (η)", "Fração de cada árvore que entra no modelo; menor = mais árvores e sobreajuste mais lento"],
              ["Paragem antecipada", "Parar de juntar árvores quando o erro de validação deixa de melhorar"],
              ["Maldição da dimensionalidade", "Com muitas variáveis, todos os pontos ficam quase à mesma distância"],
              ["Margem e vetores de suporte", "A SVM maximiza a distância aos pontos mais próximos, e só esses definem a fronteira"],
              ["C", "Custo dos erros de treino; C grande = mais variância (também na regressão logística)"],
              ["Truque do kernel", "Trabalhar num espaço de dimensão enorme sem o construir, trocando o produto interno por um kernel"],
              ["γ do kernel RBF", "Alcance de cada ponto; γ grande = fronteira recortada"],
              ["*No free lunch*", "Nenhum algoritmo é o melhor em todos os problemas (Wolpert, 1996)"],
              ["GroupKFold", "Validação cruzada que mantém cada grupo (por exemplo, um dia) inteiro do mesmo lado"],
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
            code: `from sklearn.tree import DecisionTreeClassifier, plot_tree, export_text
from sklearn.ensemble import RandomForestClassifier, HistGradientBoostingClassifier
from sklearn.inspection import permutation_importance
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from xgboost import XGBClassifier
from lightgbm import LGBMClassifier

arvore = DecisionTreeClassifier(max_depth=3).fit(X_treino, y_treino)
print(export_text(arvore, feature_names=list(X.columns)))
floresta = RandomForestClassifier(n_estimators=500, oob_score=True, random_state=0).fit(X_treino, y_treino)
floresta.oob_score_
perm = permutation_importance(floresta, X_teste, y_teste, n_repeats=20, random_state=0)

gb = HistGradientBoostingClassifier(learning_rate=0.1, early_stopping=True, random_state=0)
make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=15))      # k-NN: sempre padronizar
make_pipeline(StandardScaler(), SVC(C=1, gamma="scale"))                   # SVM: sempre padronizar

cross_validate(modelo, X, y, cv=StratifiedKFold(5, shuffle=True, random_state=0), scoring=["accuracy", "roc_auc"])
cross_val_score(modelo, X, y, cv=GroupKFold(5), groups=dia)                  # grupos inteiros de um só lado`,
          },
        ],
      },
      {
        title: "Resultados para lembrar",
        blocks: [
          {
            t: "table",
            head: ["Dados", "Melhor", "Porquê"],
            rows: [
              ["`Carseats` (simulado, quase linear)", "Regressão logística: 88% de exatidão, AUC 0,957", "A fronteira verdadeira é quase uma reta"],
              ["`Bikeshare` (procura por hora)", "Boosting: RMSE de cerca de 35, contra 76 do linear", "Interação forte entre a hora e o tipo de dia"],
            ],
          },
        ],
      },
      {
        title: "Onde isto aparece no curso",
        blocks: [
          {
            t: "table",
            head: ["Ideia", "Módulo"],
            rows: [
              ["Pipelines, procura de parâmetros, fugas de dados", "M11"],
              ["SHAP para explicar ensembles de árvores", "M11"],
              ["Mini-projeto de churn com boosting", "Fim da Fase 2"],
              ["Descida do gradiente e taxa de aprendizagem em redes", "M12, M13"],
              ["Pesquisa por vizinhos mais próximos em embeddings", "M20 (RAG)"],
            ],
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
              "Deixar uma árvore crescer sem limite e confiar na exatidão de treino.",
              "Ler a importância por impureza como se fosse a verdade, ou qualquer importância como um efeito causal.",
              "Usar uma taxa de aprendizagem alta com muitas árvores e sem paragem antecipada.",
              "Usar k-NN ou SVM sem padronizar as variáveis.",
              "Avaliar dados com grupos (dias, clientes, lojas) com divisões aleatórias simples.",
              "Saltar o modelo linear e ir direto ao boosting: às vezes o simples ganha.",
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
      title: "Exercícios 1 a 4 — depois da secção 2",
      note: "Dez exercícios, cerca de 4 horas no total, na ordem das sessões do plano de estudo. Os tipos estão misturados de propósito (prática intercalada): os marcados com *à mão* fazem-se com papel e calculadora, os outros no Colab. Salvo indicação em contrário, use os dados `Carseats` preparados como na aula (`X`, `y`, `X_treino`, `X_teste`, `y_treino`, `y_teste`) e `cv = StratifiedKFold(5, shuffle=True, random_state=0)`.",
    },
    { id: "B", title: "Exercícios 5 a 7 — depois da secção 3" },
    { id: "C", title: "Exercícios 8 a 10 — no fim" },
  ],
  exercises: [
    {
      id: "e1",
      num: 1,
      part: "A",
      session: "w1s2",
      kind: "text",
      title: "Dois cortes possíveis (à mão)",
      minutes: 15,
      sections: ["s1"],
      prompt: [
        { t: "p", text: "*(à mão)* Um nó de uma árvore tem 100 lojas: 60 com vendas baixas e 40 com vendas altas. Há dois cortes possíveis." },
        {
          t: "list",
          items: [
            "Corte A: à esquerda ficam 50 lojas (45 baixas, 5 altas); à direita, 50 (15 baixas, 35 altas).",
            "Corte B: à esquerda ficam 30 lojas, todas com vendas baixas; à direita, 70 (30 baixas, 40 altas).",
          ],
        },
        {
          t: "p",
          text: "(a) Calcule o índice de Gini do nó. (b) Calcule o Gini médio de cada corte, pesando cada lado pelo número de lojas. (c) Que corte escolhe o CART? O corte B cria uma folha pura: porque é que isso não chega?",
        },
      ],
      fields: [
        { id: "a", label: "(a) Gini do nó", rows: 2 },
        { id: "b", label: "(b) Gini médio dos cortes A e B, com os cálculos", rows: 5 },
        { id: "c", label: "(c) Que corte escolhe o CART, e porque é que a folha pura não chega", rows: 4 },
      ],
      criteria: [
        "(a) G = 1 − (0,6² + 0,4²) = 0,48, o mesmo que 2 × 0,6 × 0,4",
        "(b) Corte A: 2 × 0,9 × 0,1 = 0,18 à esquerda, 2 × 0,3 × 0,7 = 0,42 à direita; média 0,5 × 0,18 + 0,5 × 0,42 = 0,30",
        "(b) Corte B: 0 à esquerda, 2 × (3/7) × (4/7) ≈ 0,490 à direita; média 0,3 × 0 + 0,7 × 0,490 ≈ 0,343",
        "(c) O CART escolhe o A, que reduz o Gini em 0,18, contra 0,137 do B",
        "(c) A folha pura do B arruma só 30 lojas e deixa as outras 70 tão misturadas como antes (0,49, até pior do que os 0,48 do nó): conta a pureza média de todos os exemplos",
      ],
      solution: [
        {
          t: "p",
          text: "(a) G = 1 − (0,6² + 0,4²) = 0,48, o mesmo que 2 × 0,6 × 0,4. (b) Corte A: à esquerda, 10% de altas, G = 2 × 0,9 × 0,1 = 0,18; à direita, 70%, G = 2 × 0,3 × 0,7 = 0,42; média 0,5 × 0,18 + 0,5 × 0,42 = 0,30. Corte B: à esquerda G = 0; à direita G = 2 × (3/7) × (4/7) ≈ 0,490; média 0,3 × 0 + 0,7 × 0,490 ≈ 0,343. (c) O CART escolhe o corte A, que reduz o Gini em 0,18, contra 0,137 do B. A folha pura do B arruma só 30 lojas e deixa as outras 70 tão misturadas como antes (0,49, até pior do que os 0,48 do nó). O que conta é a pureza média de todos os exemplos, não a de um dos lados.",
        },
      ],
    },
    {
      id: "e2",
      num: 2,
      part: "A",
      session: "w1s2",
      kind: "text",
      title: "Fora do saco (à mão)",
      minutes: 15,
      sections: ["s2"],
      prompt: [
        {
          t: "p",
          text: "*(à mão)* (a) Qual é a probabilidade de um exemplo ficar fora de uma reamostragem bootstrap quando n = 10? E quando n = 1000? (b) Numa floresta de 500 árvores, quantas árvores, em média, não viram um dado exemplo? (c) Porque é que o erro fora do saco é uma estimativa honesta do erro em dados novos?",
        },
      ],
      fields: [
        { id: "a", label: "(a) Probabilidade com n = 10 e com n = 1000", rows: 3 },
        { id: "b", label: "(b) Árvores que não viram um exemplo, em média", rows: 2 },
        { id: "c", label: "(c) Porque é honesta", rows: 4 },
      ],
      criteria: [
        "(a) n = 10: 0,9¹⁰ = 0,349; n = 1000: (1 − 1/1000)¹⁰⁰⁰ = 0,368, praticamente 1/e",
        "(b) 500 × 0,368 ≈ 184 árvores",
        "(c) Cada exemplo é previsto só por árvores que não o viram, como num conjunto de validação, e todos os exemplos são avaliados",
        "(c) Ressalvas: usa cerca de 184 árvores e não 500 (ligeiramente pessimista); se servir para escolher parâmetros, deixa de ser uma estimativa final",
      ],
      solution: [
        {
          t: "p",
          text: "(a) Com n = 10: 0,9¹⁰ = 0,349. Com n = 1000: (1 − 1/1000)¹⁰⁰⁰ = 0,368, já praticamente igual a 1/e = 0,368. (b) 500 × 0,368 ≈ 184 árvores. (c) Cada exemplo é previsto só por árvores que não o viram, como num conjunto de validação, e todos os exemplos são avaliados. Duas ressalvas: cada previsão OOB usa cerca de 184 árvores e não 500, por isso a estimativa é ligeiramente pessimista; e, se o OOB servir para escolher parâmetros, deixa de ser uma estimativa final, como qualquer validação.",
        },
      ],
    },
    {
      id: "e3",
      num: 3,
      part: "A",
      session: "w1s2",
      kind: "text",
      title: "Profundidade da árvore e regra de um erro padrão",
      minutes: 30,
      sections: ["s1"],
      prompt: [
        {
          t: "p",
          text: "Para `max_depth` de 1 a 12 e sem limite (`None`), calcule a exatidão média de treino e de validação de uma árvore (`random_state=0`) com `cross_validate(..., cv=cv, return_train_score=True)` em `X` e `y`, e o desvio padrão da validação. (a) Faça o gráfico das duas curvas. (b) Que profundidade tem a melhor validação? (c) Aplique a regra de um erro padrão do M8. Que profundidade escolheria, e porquê?",
        },
      ],
      fields: [
        { id: "code", label: "(a) Código, tabela e gráfico", rows: 12, mono: true, placeholder: "from sklearn.tree import DecisionTreeClassifier\n\nprofundidades = list(range(1, 13)) + [None]\n…" },
        { id: "b", label: "(b) Profundidade com a melhor validação", rows: 2 },
        { id: "c", label: "(c) Regra de um erro padrão: que profundidade, e porquê", rows: 4 },
      ],
      criteria: [
        "(a) `cross_validate` com `return_train_score=True` para as 13 profundidades; gráfico das curvas de treino e de validação",
        "(a) O treino sobe sempre até 100%; a validação sobe até à profundidade 2 ou 3 e depois anda aos solavancos entre 0,70 e 0,74",
        "(b) A melhor é a profundidade 5 (0,738), com a 6 praticamente igual (com o scikit-learn 1.9.1: a árvore sem limite, 0,742, com a 5 praticamente igual, 0,740; ver a nota da plataforma na solução)",
        "(c) Erro padrão 0,070 / √5 ≈ 0,031; serve qualquer profundidade acima de 0,738 − 0,031 = 0,707; a mais simples é a 2 (0,712) (com o scikit-learn 1.9.1, o mesmo raciocínio com os seus números)",
        "(c) Escolhe a profundidade 2 ou 3: quase tão boas, com 4 a 8 folhas, fáceis de explicar; as diferenças entre as outras são ruído",
      ],
      solution: [
        { t: "code", code: E3_CODE },
        {
          t: "table",
          head: ["Profundidade", "Treino", "Validação", "Desvio padrão"],
          rows: [
            ["1", "0,707", "0,678", "0,046"],
            ["2", "0,754", "0,712", "0,056"],
            ["3", "0,781", "0,720", "0,042"],
            ["4", "0,828", "0,702", "0,059"],
            ["5", "0,890", "**0,738**", "0,070"],
            ["6", "0,922", "0,737", "0,027"],
            ["7", "0,961", "0,720", "0,041"],
            ["8", "0,979", "0,705", "0,048"],
            ["9", "0,988", "0,712", "0,034"],
            ["10", "0,996", "0,725", "0,061"],
            ["11, 12 e sem limite", "1,000", "0,732", "0,065"],
          ],
        },
        {
          t: "p",
          text: "(a) O treino sobe sempre até 100%; a validação sobe até à profundidade 2 ou 3 e depois anda aos solavancos entre 0,70 e 0,74. É a mesma forma do gráfico de sobreajuste do M7. (b) A melhor é a profundidade 5 (0,738), com a 6 praticamente igual. (c) O erro padrão da média das 5 divisões na profundidade 5 é 0,070 / √5 ≈ 0,031. Serve qualquer profundidade com validação acima de 0,738 − 0,031 = 0,707, e a mais simples é a 2 (0,712). Escolheria a profundidade 2 ou 3: quase tão boas, com 4 a 8 folhas em vez de mais de 20, fáceis de explicar. As diferenças entre as outras são ruído.",
        },
        {
          t: "callout",
          tone: "warn",
          title: "Nota da plataforma",
          text: "Com o scikit-learn 1.9.1 (e também com o 1.6), este mesmo código dá a tabela acima até à profundidade 4, mas não a partir da 5: treino 0,889, validação 0,740 e desvio padrão 0,068 na 5; validação 0,730, 0,720, 0,722 e 0,732 nas 7 a 10; e 0,742 (desvio padrão 0,050) nas 11, 12 e sem limite. Como o enunciado fixa as sementes, os seus números devem ser estes. Então (b) a melhor validação passa a ser a da árvore sem limite (0,742), com a 5 praticamente igual (0,740). Em (c), a partir da 5, como no gabarito, o limiar é 0,740 − 0,068 / √5 ≈ 0,710 e a escolha continua a ser a 2 (0,712); a partir da árvore sem limite, o limiar é 0,742 − 0,050 / √5 ≈ 0,720, e a 3 fica mesmo em cima dele (0,7200 contra 0,7203, sem arredondar). A conclusão não muda: entre as profundidades 2 e 12 as diferenças estão dentro do ruído das cinco divisões, e uma árvore de profundidade 2 ou 3 é quase tão boa e muito mais fácil de explicar.",
        },
      ],
    },
    {
      id: "e4",
      num: 4,
      part: "A",
      session: "w1s2",
      kind: "text",
      title: "Random forests com max_features diferentes",
      minutes: 25,
      sections: ["s2"],
      prompt: [
        {
          t: "p",
          text: "Treine random forests de 500 árvores (`random_state=0`, `oob_score=True`) em `X_treino` com `max_features` igual a 1, 2, 3, 5, 8 e `None` (todas as 11 variáveis, ou seja, bagging). (a) Registe a exatidão fora do saco e no teste. (b) O OOB e o teste concordam sobre a melhor escolha? (c) O teste tem 100 lojas. Calcule o erro padrão de uma exatidão de 80% com n = 100 (M6). O que conclui das diferenças que encontrou?",
        },
      ],
      fields: [
        { id: "code", label: "(a) Código e resultados", rows: 10, mono: true, placeholder: "from sklearn.ensemble import RandomForestClassifier\n\nfor mf in [1, 2, 3, 5, 8, None]:\n    …" },
        { id: "b", label: "(b) O OOB e o teste concordam?", rows: 2 },
        { id: "c", label: "(c) Erro padrão e conclusão", rows: 4 },
      ],
      criteria: [
        "(a) OOB 0,803, 0,810, 0,807, 0,817, 0,820, 0,810 e teste 0,80, 0,82, 0,82, 0,79, 0,79, 0,78 para 1, 2, 3, 5, 8 e None",
        "(b) Não: o OOB prefere 8, o teste prefere 2 ou 3",
        "(c) Erro padrão √(0,8 × 0,2 / 100) = 0,04, um intervalo de 95% de cerca de ±8 pontos",
        "(c) Diferenças de 1 a 4 pontos são 1 a 4 lojas, puro ruído: as escolhas equivalem-se e o valor por omissão (√11 ≈ 3) serve",
      ],
      solution: [
        { t: "code", code: E4_CODE },
        {
          t: "table",
          head: ["`max_features`", "OOB", "Teste"],
          rows: [
            ["1", "0,803", "0,80"],
            ["2", "0,810", "**0,82**"],
            ["3", "0,807", "**0,82**"],
            ["5", "0,817", "0,79"],
            ["8", "**0,820**", "0,79"],
            ["None (bagging)", "0,810", "0,78"],
          ],
        },
        {
          t: "p",
          text: "(b) Não: o OOB prefere 8, o teste prefere 2 ou 3. (c) O erro padrão é √(0,8 × 0,2 / 100) = 0,04, ou seja, um intervalo de 95% de cerca de ±8 pontos. Diferenças de 1 a 4 pontos são 1 a 4 lojas: puro ruído. Conclusão: com estes dados, todas as escolhas se equivalem e o valor por omissão (√11 ≈ 3) serve. Só se diz que um modelo é melhor quando a diferença passa o ruído.",
        },
        {
          t: "callout",
          tone: "warn",
          title: "Nota da plataforma",
          text: "Com o scikit-learn 1.9.1, todos os valores coincidem menos um: com `max_features=2`, o teste dá 0,81 e não 0,82. Então o teste prefere só o 3 (0,82). A resposta a (b) continua a ser não (o OOB prefere 8, o teste prefere 3), e a conclusão de (c) não muda: uma ou duas lojas de diferença são ruído.",
        },
      ],
    },
    {
      id: "e5",
      num: 5,
      part: "B",
      session: "w2s1",
      kind: "text",
      title: "Gradient boosting à mão",
      minutes: 25,
      sections: ["s3"],
      prompt: [
        {
          t: "p",
          text: "*(à mão)* Quatro exemplos têm x = 1, 2, 3, 4 e y = 3, 5, 9, 11. Aplica-se gradient boosting com erro quadrático, árvores de um só corte e taxa η = 0,5. (a) O modelo começa com F₀ igual à média de y. Calcule F₀, os resíduos e o erro quadrático médio. (b) A primeira árvore ajusta-se aos resíduos e pode cortar em x < 1,5, x < 2,5 ou x < 3,5. Que corte escolhe? Que valor prevê de cada lado? Calcule F₁ e o novo erro. (c) Repita para F₂. (d) No Colab, confirme com `GradientBoostingRegressor(n_estimators=40, learning_rate=0.5, max_depth=1)` e `staged_predict`. O erro de treino chega a zero? Isso é bom?",
        },
      ],
      fields: [
        { id: "a", label: "(a) F₀, resíduos e erro quadrático médio", rows: 3 },
        { id: "b", label: "(b) Primeiro corte, valores de cada lado, F₁ e novo erro", rows: 5 },
        { id: "c", label: "(c) F₂ e o erro", rows: 4 },
        { id: "d", label: "(d) Código no Colab e comentário", rows: 8, mono: true, placeholder: "from sklearn.ensemble import GradientBoostingRegressor\n\nx5 = np.array([[1], [2], [3], [4]])\ny5 = np.array([3, 5, 9, 11])\n…" },
      ],
      criteria: [
        "(a) F₀ = 7; resíduos −4, −2, 2, 4; EQM = 10",
        "(b) Soma dos quadrados dos resíduos: 18,67 para x < 1,5 e x < 3,5, 4 para x < 2,5; escolhe x < 2,5 e prevê −3 e +3",
        "(b) F₁ = 5,5 para x = 1 e 2, 8,5 para x = 3 e 4; resíduos −2,5, −0,5, 0,5, 2,5; EQM = 3,25",
        "(c) Volta a ganhar x < 2,5 (soma 4, contra 4,67), com −1,5 e +1,5; F₂ = 4,75 e 9,25; EQM = 1,5625",
        "(d) `staged_predict` confirma 3,25 e 1,5625; com 40 árvores o erro de treino fica praticamente em zero (0,0002)",
        "(d) Explica que, com dados reais, isso é decorar o ruído: é preciso limitar o número de árvores por validação (paragem antecipada) e usar uma taxa moderada",
      ],
      solution: [
        {
          t: "p",
          text: "(a) F₀ = 7. Resíduos: −4, −2, 2, 4. EQM = (16 + 4 + 4 + 16) / 4 = 10.",
        },
        {
          t: "p",
          text: "(b) Soma dos quadrados dos resíduos depois de cada corte (cada lado prevê a média dos seus resíduos): x < 1,5 deixa {−4} e {−2, 2, 4}, com média 4/3 e soma 18,67; x < 2,5 deixa {−4, −2}, média −3, e {2, 4}, média 3, com soma 4; x < 3,5 dá 18,67 por simetria. Escolhe x < 2,5 e prevê −3 e +3. F₁ = 7 + 0,5 × (−3) = 5,5 para x = 1 e 2, e 7 + 0,5 × 3 = 8,5 para x = 3 e 4. Resíduos: −2,5, −0,5, 0,5, 2,5. EQM = (6,25 + 0,25 + 0,25 + 6,25) / 4 = 3,25.",
        },
        {
          t: "p",
          text: "(c) Volta a ganhar x < 2,5 (soma 4, contra 4,67 dos outros), com previsões −1,5 e +1,5. F₂ = 5,5 − 0,75 = 4,75 e 8,5 + 0,75 = 9,25. Resíduos: −1,75, 0,25, −0,25, 1,75. EQM = 1,5625.",
        },
        {
          t: "code",
          code: E5_CODE,
          output: "1 [5.5 5.5 8.5 8.5] 3.25\n2 [4.75 4.75 9.25 9.25] 1.5625\n10 [ 3.117  4.763  9.19  10.929] 0.0278\n40 [ 3.013  4.98   9.018 10.989] 0.0002",
        },
        {
          t: "p",
          text: "(d) As duas primeiras linhas confirmam as contas à mão. Com 40 árvores, o erro de treino fica praticamente em zero: a partir da terceira árvore, os cortes em 1,5 e 3,5 passam a compensar e o modelo acerta cada ponto. Com dados reais, isto é decorar o ruído. É por isso que o boosting precisa de um limite ao número de árvores, escolhido por validação (paragem antecipada), e de uma taxa de aprendizagem moderada.",
        },
      ],
    },
    {
      id: "e6",
      num: 6,
      part: "B",
      session: "w2s1",
      kind: "text",
      title: "Paragem antecipada no Bikeshare",
      minutes: 35,
      sections: ["s3"],
      prompt: [
        {
          t: "p",
          text: "Use os dados `Bikeshare` e a divisão de treino e teste por dias da aula (`GroupShuffleSplit`, `random_state=0`). (a) Treine `HistGradientBoostingRegressor(learning_rate=0.1, max_iter=3000, early_stopping=True, validation_fraction=0.1, n_iter_no_change=20, random_state=0)`. Com quantas árvores ficou (`n_iter_`) e qual é o RMSE no teste? Repita com taxa 0,05. (b) A parte de validação que o modelo usa para parar é sorteada hora a hora. Porque é que isso pode ser um problema nestes dados? (c) Desafio: escolha o número de árvores com uma validação por dias (um `GroupShuffleSplit` com `test_size=0.1` e `random_state=0` dentro do treino, e `staged_predict`), retreine com esse número no treino todo e compare.",
        },
      ],
      fields: [
        { id: "code", label: "(a) e (c) Código e resultados", rows: 14, mono: true, placeholder: "from sklearn.model_selection import GroupShuffleSplit\nfrom sklearn.ensemble import HistGradientBoostingRegressor\n…" },
        { id: "b", label: "(b) Porque é que a validação hora a hora é um problema", rows: 4 },
        { id: "c", label: "(c) Comparação", rows: 3 },
      ],
      criteria: [
        "(a) Taxa 0,1: 185 árvores e RMSE 35,7; taxa 0,05: 508 árvores e RMSE 35,8",
        "(a) Nota que ambas são melhores do que as 1000 árvores com taxa 0,3 da aula (38,5), sem escolher o número à mão",
        "(b) Horas do mesmo dia ficam umas no treino e outras na validação; são muito parecidas, por isso a validação fica otimista e o ponto de paragem pode não ser o certo para dias novos",
        "(b) Regra geral: a validação deve imitar o teste, e o teste aqui é por dias",
        "(c) Validação por dias: 206 e 440 árvores, RMSE 35,1 e 35,2; ganho pequeno, mas o método é o correto",
      ],
      solution: [
        { t: "code", code: E6_CODE, output: "0.1 185 35.7\n0.05 508 35.8\n0.1 206 35.1\n0.05 440 35.2" },
        {
          t: "p",
          text: "(a) Com taxa 0,1, a paragem antecipada fica com 185 árvores e um RMSE de 35,7; com 0,05, precisa de 508 árvores para o mesmo erro. Ambas muito melhores do que as 1000 árvores com taxa 0,3 da aula (38,5), sem ter de escolher o número à mão. (b) Com um sorteio hora a hora, as horas de um mesmo dia ficam umas no treino e outras na validação. Horas do mesmo dia são muito parecidas, por isso a validação fica otimista e o ponto de paragem pode não ser o certo para dias novos. A regra geral: a validação deve imitar o teste, e o teste aqui é por dias. (c) Com a validação por dias, 206 e 440 árvores e RMSE de 35,1 e 35,2. O ganho é pequeno neste caso, mas o método é o correto; com dependências mais fortes, como várias compras do mesmo cliente, a diferença pode ser grande (M11).",
        },
      ],
    },
    {
      id: "e7",
      num: 7,
      part: "B",
      session: "w2s1",
      kind: "classify",
      title: "Verdadeiro ou falso? (à mão)",
      minutes: 15,
      sections: ["s1", "s2", "s3"],
      prompt: [{ t: "p", text: "*(à mão)* Verdadeiro ou falso? Corrija as falsas." }],
      categories: ["Verdadeiro", "Falso"],
      justify: "Correção (se for falsa)",
      items: [
        {
          id: "1",
          text: "1. Uma árvore sem limite de profundidade chega quase sempre a 100% de exatidão no treino.",
          answer: 0,
          explain: "Só não chega se houver exemplos com as mesmas variáveis e classes diferentes.",
        },
        {
          id: "2",
          text: "2. Numa random forest, juntar mais árvores acaba por causar sobreajuste.",
          answer: 1,
          explain: "Numa random forest, mais árvores não aumentam o sobreajuste; o erro estabiliza e só se perde tempo.",
        },
        { id: "3", text: "3. No gradient boosting, juntar mais árvores pode causar sobreajuste.", answer: 0, explain: "Cada árvore nova ajusta-se mais ao treino." },
        {
          id: "4",
          text: "4. As árvores de decisão precisam de variáveis padronizadas.",
          answer: 1,
          explain: "Cada pergunta compara uma variável com um corte, e mudar a escala muda o corte mas não a pergunta.",
        },
        {
          id: "5",
          text: "5. Se o preço tem a maior importância por permutação, baixar o preço vai aumentar as vendas.",
          answer: 1,
          explain:
            "A importância diz quanto o modelo depende do preço para prever, não o que acontece se o preço mudar, nem sequer em que sentido. Para isso é preciso uma experiência, como um teste A/B de preços (M6).",
        },
        { id: "6", text: "6. No boosting, baixar a taxa de aprendizagem obriga a usar mais árvores para chegar ao mesmo erro.", answer: 0 },
        {
          id: "7",
          text: "7. Numa random forest, cada nó de cada árvore pode escolher entre todas as variáveis.",
          answer: 1,
          explain: "Cada nó só pode escolher entre um subconjunto sorteado de variáveis (√p por omissão, em classificação); quem vê todas é o bagging.",
        },
        { id: "8", text: "8. O erro fora do saco avalia cada exemplo só com as árvores que não o usaram no treino.", answer: 0 },
      ],
      solution: [
        {
          t: "p",
          text: "(1) **Verdadeiro**: só não chega se houver exemplos com as mesmas variáveis e classes diferentes. (2) **Falso**: numa random forest, mais árvores não aumentam o sobreajuste; o erro estabiliza e só se perde tempo. (3) **Verdadeiro**: cada árvore nova ajusta-se mais ao treino. (4) **Falso**: cada pergunta compara uma variável com um corte, e mudar a escala muda o corte mas não a pergunta. (5) **Falso**: a importância diz quanto o modelo depende do preço para prever, não o que acontece se o preço mudar, nem sequer em que sentido. Para isso é preciso uma experiência, como um teste A/B de preços (M6). (6) **Verdadeiro**. (7) **Falso**: cada nó só pode escolher entre um subconjunto sorteado de variáveis (√p por omissão, em classificação); quem vê todas é o bagging. (8) **Verdadeiro**.",
        },
      ],
    },
    {
      id: "e8",
      num: 8,
      part: "C",
      session: "w2s2",
      kind: "text",
      title: "Colunas de ruído e a maldição da dimensionalidade",
      minutes: 25,
      sections: ["s4", "s2"],
      prompt: [
        {
          t: "p",
          text: "Junte ao `Carseats` colunas de puro ruído: crie uma tabela de 100 colunas normais padrão com `default_rng(0)` (`rng.normal(size=(400, 100))`) e use as primeiras m, com m = 0, 10, 50 e 100. (a) Para cada m, calcule a exatidão em validação cruzada de uma regressão logística e de um k-NN com k = 15 (ambos padronizados, como na aula) e de uma random forest de 300 árvores (`random_state=0`). (b) Que modelo sofre mais? Relacione com a maldição da dimensionalidade. (c) O que isto diz sobre a ideia de \"meter todas as colunas que houver\" num modelo?",
        },
      ],
      fields: [
        { id: "code", label: "(a) Código e resultados", rows: 12, mono: true, placeholder: "rng = np.random.default_rng(0)\nruido = pd.DataFrame(rng.normal(size=(len(X), 100)), …)\n…" },
        { id: "b", label: "(b) Que modelo sofre mais, e porquê", rows: 4 },
        { id: "c", label: "(c) \"Meter todas as colunas que houver\"", rows: 3 },
      ],
      criteria: [
        "(a) Logística 0,880, 0,865, 0,865, 0,825; floresta 0,810, 0,787, 0,755, 0,725; k-NN 0,775, 0,700, 0,635, 0,615",
        "(b) O k-NN sofre mais: com 100 colunas inúteis contra 11 úteis, a distância passa a ser quase só ruído e a exatidão cai para perto dos 59% de prever sempre a classe maior",
        "(b) Liga à maldição da dimensionalidade; nota que a floresta perde 8,5 pontos (corta por variáveis de ruído) e a logística resiste melhor mas começa a sobreajustar",
        "(c) Juntar colunas não é grátis: escolher variáveis com critério e confirmar com validação; uma seleção automática tem de ser feita dentro da validação cruzada (M11)",
      ],
      solution: [
        { t: "code", code: E8_CODE },
        {
          t: "table",
          head: ["Colunas de ruído", "Logística", "Random forest", "k-NN"],
          rows: [
            ["0", "0,880", "0,810", "0,775"],
            ["10", "0,865", "0,787", "0,700"],
            ["50", "0,865", "0,755", "0,635"],
            ["100", "0,825", "0,725", "0,615"],
          ],
        },
        {
          t: "p",
          text: "(a) Ver a tabela. A floresta dá aqui 0,81 contra 0,80 na aula, com 300 árvores em vez de 500: diferença de ruído. (b) O k-NN sofre mais: com 100 colunas inúteis contra 11 úteis, a distância passa a ser quase só ruído, os \"vizinhos\" ficam ao acaso, e a exatidão cai para perto dos 59% de prever sempre a classe maior. É a maldição da dimensionalidade com variáveis que não ajudam. A floresta perde 8,5 pontos: em muitos nós, as variáveis sorteadas são só ruído, e a árvore corta por elas. A logística resiste melhor, porque dá coeficientes pequenos ao ruído, mas com 111 variáveis e 320 lojas de treino por divisão começa a sobreajustar (a regularização do M8 ajuda). (c) Juntar colunas não é grátis: as inúteis estragam, sobretudo os modelos baseados em distâncias. As variáveis escolhem-se com critério e confirmam-se com validação; e, se houver seleção automática, tem de ser feita dentro da validação cruzada (M11).",
        },
        {
          t: "callout",
          tone: "warn",
          title: "Nota da plataforma",
          text: "Com o scikit-learn 1.9.1, a logística e o k-NN coincidem, mas a random forest dá 0,808, 0,787, 0,750 e 0,722 (e não 0,810, 0,787, 0,755 e 0,725): perde 8,6 pontos em vez de 8,5. As conclusões não mudam.",
        },
      ],
    },
    {
      id: "e9",
      num: 9,
      part: "C",
      session: "w2s2",
      kind: "text",
      title: "SVM nas duas luas",
      minutes: 25,
      sections: ["s4"],
      prompt: [
        {
          t: "p",
          text: "Gere `make_moons(n_samples=500, noise=0.3, random_state=1)` e divida em 70% de treino e 30% de teste (`random_state=0`). As duas variáveis já estão na mesma escala, por isso aqui não é preciso padronizar. (a) Treine `SVC(C=1)` com γ = 0,1, 1, 10 e 100. Registe a exatidão de treino e de teste e o número de vetores de suporte (`n_support_.sum()`). (b) Desenhe as fronteiras para γ = 0,1, 1 e 100. (c) Use `GridSearchCV` com C em {0,1; 1; 10; 100}, γ em {0,1; 0,3; 1; 3; 10} e `cv=5` no treino. Qual é a melhor combinação e quanto dá no teste? Compare com uma regressão logística. (d) O que diz o número de vetores de suporte com γ = 100?",
        },
      ],
      fields: [
        { id: "code", label: "(a) a (c) Código e resultados", rows: 14, mono: true, placeholder: "from sklearn.datasets import make_moons\nfrom sklearn.svm import SVC\n…" },
        { id: "b", label: "(b) Como são as três fronteiras", rows: 3 },
        { id: "cd", label: "(c) Melhor combinação e comparação; (d) vetores de suporte com γ = 100", rows: 5 },
      ],
      criteria: [
        "(a) γ = 0,1: 0,883 / 0,827 / 131; γ = 1: 0,914 / 0,873 / 98; γ = 10: 0,914 / 0,860 / 143; γ = 100: 0,969 / 0,827 / 309",
        "(b) γ = 0,1 quase reta; γ = 1 segue as duas luas; γ = 100 é uma manta de pequenas ilhas à volta dos pontos de treino",
        "(c) A grelha escolhe C = 0,1 e γ = 3, com 0,920 em validação cruzada e 0,873 no teste; a regressão logística fica nos 0,827",
        "(c) Nota que os 0,920 da validação são otimistas (o melhor de 20 candidatos); a validação cruzada aninhada é tema do M11",
        "(d) 309 dos 350 pontos de treino são vetores de suporte: cada ponto define a sua ilha, o modelo decora o treino (0,969 contra 0,827): sobreajuste",
      ],
      solution: [
        {
          t: "code",
          code: E9_CODE,
          output: "0.1 0.883 0.827 131\n1 0.914 0.873 98\n10 0.914 0.86 143\n100 0.969 0.827 309\n{'C': 0.1, 'gamma': 3} 0.92 0.873\n0.827",
        },
        {
          t: "table",
          head: ["γ", "Treino", "Teste", "Vetores de suporte"],
          rows: [
            ["0,1", "0,883", "0,827", "131"],
            ["1", "0,914", "**0,873**", "98"],
            ["10", "0,914", "0,860", "143"],
            ["100", "0,969", "0,827", "309"],
          ],
        },
        {
          t: "p",
          text: "(b) Com γ = 0,1, a fronteira é quase uma reta; com 1, segue as duas luas; com 100, é uma manta de pequenas ilhas à volta dos pontos de treino. (c) A grelha escolhe C = 0,1 e γ = 3, com 0,920 em validação cruzada e 0,873 no teste. A regressão logística fica nos 0,827, o mesmo que a SVM com γ = 0,1, como seria de esperar de duas fronteiras quase retas. Repare que os 0,920 da validação são otimistas: escolheu-se o melhor de 20 candidatos, e o melhor de muitos beneficia sempre de alguma sorte. A forma correta de medir isto, a validação cruzada aninhada, é tema do M11. (d) Com γ = 100, 309 dos 350 pontos de treino são vetores de suporte: cada ponto define a sua própria ilha, o modelo está a decorar o treino. É sobreajuste (0,969 no treino, 0,827 no teste).",
        },
      ],
    },
    {
      id: "e10",
      num: 10,
      part: "C",
      session: "w2s2",
      kind: "text",
      title: "Sumo de laranja: CH ou MM? (aplicação)",
      minutes: 40,
      sections: ["s5", "s2"],
      prompt: [
        {
          t: "p",
          text: "*(aplicação)* Os dados `OJ` (James et al., 2023), no mesmo endereço dos outros, registam 1070 compras de sumo de laranja em cinco lojas: o cliente levou Citrus Hill (`CH`) ou Minute Maid (`MM`)? Há os preços e descontos das duas marcas, se estavam em promoção, a loja e `LoyalCH`, a fidelidade do cliente à marca CH, calculada a partir das compras anteriores. (a) Que percentagem comprou MM? Prepare `X` sem as colunas `Purchase`, `STORE` e `Store7` (repetem a loja) e com `StoreID` como categoria, e `y` = 1 para MM. (b) Compare, com `cv` e as métricas exatidão e AUC, a linha de base (`DummyClassifier`), a regressão logística padronizada, uma random forest de 500 árvores, o `HistGradientBoostingClassifier` e um `XGBClassifier(n_estimators=300, learning_rate=0.05, max_depth=3)`, todos com `random_state=0` quando aplicável. (c) Separe 25% para teste (estratificado, `random_state=0`), treine o melhor modelo e calcule a importância por permutação com `scoring=\"roc_auc\"`. (d) Escreva ao gestor da categoria de sumos uma mensagem de 5 a 8 linhas, sem jargão: o que pesa na escolha da marca, e o que isso sugere para as promoções?",
        },
      ],
      fields: [
        { id: "code", label: "(a) a (c) Código e resultados", rows: 16, mono: true, placeholder: "oj = pd.read_csv(URL + \"OJ.csv\")\n…" },
        { id: "c", label: "(c) O que mostra a importância por permutação", rows: 4 },
        { id: "d", label: "(d) Mensagem para o gestor da categoria (5 a 8 linhas)", rows: 8 },
      ],
      criteria: [
        "(a) 39% compraram Minute Maid; `X` sem `Purchase`, `STORE` e `Store7`, com `StoreID` como categoria",
        "(b) Ganha a regressão logística (83,4%, AUC 0,897), com o XGBoost logo atrás (0,823, 0,894); a random forest fica em último dos modelos a sério (0,788, 0,863)",
        "(c) A fidelidade à Citrus Hill domina: baralhá-la faz a AUC cair 0,32; nenhuma outra variável passa de 0,01",
        "(c) Nota que as variáveis de preço e desconto são redundantes (`PriceDiff` = `SalePriceMM − SalePriceCH`), por isso cada uma parece pouco importante; isso não prova que o preço não conta",
        "(d) Mensagem sem jargão: o hábito do cliente pesa mais do que os descontos; sugere promoções dirigidas a clientes sem marca habitual; testar antes, porque os dados mostram associações e não o efeito de uma promoção",
      ],
      solution: [
        {
          t: "code",
          code: E10_CODE,
          output: `(1070, 18) {'CH': 0.61, 'MM': 0.39}
linha de base          0.610 0.500
regressão logística    0.834 0.897
random forest          0.788 0.863
gradient boosting      0.795 0.877
XGBoost                0.823 0.894
LoyalCH      0.317
PctDiscCH    0.010
StoreID_7    0.009
PctDiscMM    0.008
PriceDiff    0.007
{'CH': 0.72, 'MM': 0.32}`,
        },
        {
          t: "p",
          text: "(a) 39% compraram Minute Maid. (b) Ganha outra vez a regressão logística (83,4%, AUC 0,897), com o XGBoost logo atrás; a random forest fica em último dos modelos a sério. (c) A fidelidade à Citrus Hill domina: baralhá-la faz a AUC cair 0,32; nenhuma outra variável passa de 0,01. Os compradores de CH têm, em média, fidelidade 0,72; os de MM, 0,32. Um cuidado: há muitas variáveis de preço e desconto que medem quase a mesma coisa (por exemplo, `PriceDiff` é exatamente `SalePriceMM − SalePriceCH`, e `PctDiscMM` acompanha `DiscMM` quase na perfeição). Quando se baralha uma, as outras dão a mesma informação ao modelo, e a importância de cada uma parece pequena. Isto não prova que o preço não conta; para o saber, baralha-se o grupo inteiro de uma vez, ou fica-se com uma só variável de preço.",
        },
        {
          t: "p",
          text: "(d) Mensagem-modelo: \"Analisámos 1070 compras de sumo de laranja. O que mais prevê a marca escolhida é o hábito do cliente: quem costuma levar Citrus Hill volta a levá-la, e com isso e os preços acertamos em 83% das escolhas. Os descontos e a diferença de preço contam, mas bastante menos do que a fidelidade. Sugiro concentrar as promoções nos clientes sem marca habitual, onde podem fazer diferença, em vez de descontos gerais. Antes de mudar a política, testava a ideia numa ou duas lojas, porque estes dados mostram associações, não o efeito de uma promoção.\"",
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
            q: "Um nó com 50 exemplos da classe A e 50 da classe B tem um índice de Gini igual a:",
            options: ["0", "0,25", "1", "0,5"],
            answer: 3,
            explain: "1 − (0,5² + 0,5²) = 0,5. Um nó puro teria 0.",
          },
          {
            kind: "mcq", id: "p2", num: 2, section: "s2", points: 1,
            q: "Qual é a principal diferença entre o bagging de árvores e uma random forest?",
            options: [
              "A random forest usa árvores mais pequenas.",
              "A random forest sorteia, em cada nó, um subconjunto das variáveis que a árvore pode usar.",
              "O bagging não usa reamostragens bootstrap.",
              "A random forest treina as árvores em sequência, cada uma a corrigir a anterior.",
            ],
            answer: 1,
            explain: "As duas usam bootstrap e árvores sem limite; a random forest junta o sorteio de variáveis em cada nó. Treinar em sequência é o boosting.",
          },
          {
            kind: "mcq", id: "p3", num: 3, section: "s3", points: 1,
            q: "No gradient boosting com erro quadrático, cada árvore nova é treinada para prever:",
            options: [
              "Os resíduos do modelo atual.",
              "O alvo original, numa reamostragem bootstrap.",
              "A classe dos exemplos mal classificados, com pesos iguais.",
              "A importância de cada variável.",
            ],
            answer: 0,
            explain: "Com o erro quadrático, o gradiente negativo da perda são os resíduos. O alvo original numa reamostragem é o bagging.",
          },
          {
            kind: "mcq", id: "p4", num: 4, section: "s1", points: 1,
            q: "Uma árvore sem limite de profundidade tem 100% de exatidão no treino e 70% no teste. Isto é sinal de:",
            options: ["Viés alto.", "Uma fuga de dados.", "Variância alta, ou seja, sobreajuste.", "Classes desequilibradas."],
            answer: 2,
            explain: "A árvore decorou o treino e generaliza mal: variância alta. Uma fuga de dados daria um teste otimista, não um teste mau.",
          },
          {
            kind: "mcq", id: "p5", num: 5, section: "s4", points: 1,
            q: "Num k-NN, aumentar muito o k:",
            options: [
              "Torna a fronteira mais suave: menos variância e mais viés.",
              "Torna a fronteira mais recortada: mais variância.",
              "Torna o treino muito mais lento.",
              "Dispensa a padronização das variáveis.",
            ],
            answer: 0,
            explain: "Com k muito grande, a previsão aproxima-se da classe mais frequente em todo o lado: viés alto. k = 1 é que dá ilhas e variância alta.",
          },
          {
            kind: "mcq", id: "p6", num: 6, section: "s4", points: 1,
            q: "Qual destes modelos dispensa a padronização das variáveis?",
            options: ["k-NN.", "SVM com kernel RBF.", "Regressão logística regularizada.", "Random forest."],
            answer: 3,
            explain: "As árvores comparam uma variável com um corte; mudar a escala muda o corte, não a pergunta. O k-NN e a SVM usam distâncias, e a regularização depende da escala dos coeficientes.",
          },
          {
            kind: "mcq", id: "p7", num: 7, section: "s4", points: 1,
            q: "Numa SVM com kernel RBF, aumentar muito o γ tende a:",
            options: [
              "Dar uma fronteira quase reta.",
              "Dar uma fronteira muito recortada, com risco de sobreajuste.",
              "Reduzir o número de vetores de suporte a zero.",
              "Não mudar nada, se os dados estiverem padronizados.",
            ],
            answer: 1,
            explain: "γ grande encurta o alcance de cada ponto de treino: a fronteira fica recortada (variância). γ pequeno dá fronteiras quase lineares.",
          },
          {
            kind: "mcq", id: "p8", num: 8, section: "s2", points: 1,
            q: "A importância por impureza (`feature_importances_`) de uma random forest:",
            options: [
              "É calculada em dados de teste.",
              "Mede o efeito causal de cada variável.",
              "Tende a favorecer variáveis contínuas e com muitos valores diferentes.",
              "É sempre igual à importância por permutação.",
            ],
            answer: 2,
            explain: "Soma as reduções de Gini no treino; as variáveis com muitos valores oferecem mais pontos de corte (Strobl et al., 2007). Nenhuma importância é causal.",
          },
        ],
      },
      {
        title: "Grupo II — Resposta curta (8 valores)",
        note: "Sem consulta e sem correr código (pode usar calculadora). 2 valores cada, 3 a 5 linhas por resposta.",
        questions: [
          {
            kind: "open", id: "p9", num: 9, section: "s2", points: 2, rows: 5,
            q: "Porque é que a média de muitas árvores é mais estável do que uma árvore sozinha? E porque é que a random forest sorteia variáveis em cada nó, em vez de deixar cada árvore usar todas?",
            criteria: [
              { id: "c1", text: "Estabilidade da média", points: 1 },
              { id: "c2", text: "Descorrelação pelo sorteio", points: 1 },
            ],
            model:
              "Cada árvore tem variância alta: pequenas mudanças nos dados mudam-na muito. A média de muitas previsões com erros diferentes cancela parte desses erros, como a média de n observações tem variância σ²/n. Mas a média de coisas correlacionadas reduz pouco a variância: se houver uma variável muito forte, todas as árvores começam por ela e ficam parecidas. Sortear variáveis em cada nó obriga as árvores a serem diferentes, e a média melhora.",
          },
          {
            kind: "open", id: "p10", num: 10, section: "s3", points: 2, rows: 5,
            q: "No gradient boosting, como se relacionam a taxa de aprendizagem e o número de árvores? O que é a paragem antecipada e porque é necessária?",
            criteria: [
              { id: "c1", text: "Relação taxa e número de árvores", points: 1 },
              { id: "c2", text: "Paragem antecipada e porquê", points: 1 },
            ],
            model:
              "A taxa diz quanto de cada árvore entra no modelo. Taxa menor dá passos menores: precisa de mais árvores, mas sobreajusta mais devagar e costuma chegar a um erro igual ou um pouco melhor. Como cada árvore nova se ajusta mais ao treino, a partir de certo ponto o erro em dados novos volta a subir. A paragem antecipada vigia o erro numa parte de validação e pára quando deixa de melhorar durante um número fixo de árvores, escolhendo o número de árvores automaticamente.",
          },
          {
            kind: "open", id: "p11", num: 11, section: "s5", points: 2, rows: 5,
            q: "Um colega diz: \"Nos dados da minha loja, o XGBoost é sempre melhor do que a regressão logística, por isso nem vale a pena testar o modelo linear.\" Comente, com base nos resultados da aula.",
            criteria: [
              { id: "c1", text: "No free lunch ou exemplos da aula", points: 1 },
              { id: "c2", text: "Papel do modelo linear como referência e comparação justa", points: 1 },
            ],
            model:
              "Nenhum modelo é sempre melhor (no free lunch, Wolpert, 1996). Na aula, a regressão logística ganhou a todos os ensembles no Carseats (relações quase lineares), e o boosting ganhou com folga no Bikeshare (interação hora e tipo de dia). O modelo linear é rápido de treinar, fácil de explicar e serve de referência: se o XGBoost só ganha por pouco, talvez não compense. Deve-se comparar sempre, com as mesmas divisões.",
          },
          {
            kind: "open", id: "p12", num: 12, section: "s4", points: 2, rows: 5,
            q: "O que é a maldição da dimensionalidade e porque afeta especialmente o k-NN? Dê uma consequência prática.",
            criteria: [
              { id: "c1", text: "Definição", points: 1 },
              { id: "c2", text: "Ligação ao k-NN e consequência prática", points: 1 },
            ],
            model:
              "Com muitas variáveis, o espaço fica tão vazio que todos os pontos ficam quase à mesma distância uns dos outros (na aula, com 1000 dimensões o mais próximo estava só 10% mais perto do que o mais afastado). O k-NN decide tudo pelas distâncias, por isso os \"vizinhos\" deixam de ser parecidos. Consequências: o k-NN só funciona bem com poucas variáveis e muitos dados; colunas inúteis estragam-no; é preciso escolher variáveis ou reduzir a dimensão (PCA, M10).",
          },
        ],
      },
      {
        title: "Grupo III — Programação (4 valores)",
        note: "Pode usar o Colab e a documentação do scikit-learn, mas não assistentes de IA.",
        questions: [
          {
            kind: "open", id: "p13", num: 13, section: "s5", points: 4, rows: 18,
            q: "Os dados `Hitters` (os do M8, no mesmo endereço) têm o salário de jogadores de basebol e as suas estatísticas.",
            context: [
              {
                t: "p",
                text: "(a) Carregue os dados, retire as linhas sem salário, crie `X` com `pd.get_dummies(..., drop_first=True, dtype=int)` e use como alvo `y = np.log(hi[\"Salary\"])`. (b) Com `KFold(5, shuffle=True, random_state=0)`, compare o RMSE médio de uma regressão linear padronizada, de uma árvore de profundidade 4, de uma random forest de 500 árvores e de um `HistGradientBoostingRegressor` (`random_state=0` em todos os que o aceitam). (c) Separe 25% para teste (`random_state=0`), treine o melhor modelo no resto e calcule a importância por permutação (`n_repeats=20`, `random_state=0`, `scoring=\"neg_root_mean_squared_error\"`). Indique as quatro variáveis mais importantes. (d) Em 3 a 5 linhas: que modelo escolheria, o que quer dizer o seu erro em termos de salário (lembre-se de que o alvo está em logaritmo) e que história contam as variáveis mais importantes?",
              },
            ],
            criteria: [
              { id: "c1", text: "(a) Dados, variáveis e alvo em logaritmo", points: 0.5 },
              { id: "c2", text: "(b) Os quatro modelos comparados com as mesmas divisões, resultados certos", points: 1.5 },
              { id: "c3", text: "(c) Importância por permutação no teste, com o modelo certo", points: 1 },
              { id: "c4", text: "(d) Escolha justificada, erro traduzido em salário, leitura das variáveis", points: 1 },
            ],
            model:
              "\"Escolho a random forest, com um RMSE de 0,43 no logaritmo do salário, contra 0,66 da regressão linear. Como o alvo está em logaritmo, o erro é multiplicativo: e^0,43 ≈ 1,54, ou seja, uma previsão típica pode estar cerca de 50% acima ou um terço abaixo do salário real. As variáveis mais importantes são os totais da carreira (vezes ao bastão, corridas impulsionadas, batidas, corridas), que medem sobretudo a experiência: os jogadores em início de carreira ganham muito menos, e o salário dá um salto a partir de certo ponto, um efeito de limiar que as árvores apanham e o modelo linear não.\" Nota: com só 263 jogadores, a floresta bate o boosting com os valores por omissão. Em dados pequenos, o boosting não ganha sempre.",
            modelBlocks: [
              {
                t: "code",
                code: P13_CODE,
                output: `(263, 19) 0.889
regressão linear          0.662
árvore (profundidade 4)   0.549
random forest             0.432
gradient boosting         0.469
CAtBat    0.327
CRBI      0.189
CHits     0.078
CRuns     0.054`,
              },
              {
                t: "callout",
                tone: "warn",
                title: "Nota da plataforma",
                text: "Com o scikit-learn 1.9.1, a random forest dá 0,433 e não 0,432, e as importâncias são 0,328, 0,191, 0,078 e 0,055. As mesmas quatro variáveis, pela mesma ordem; o resto coincide.",
              },
            ],
          },
        ],
      },
    ],
  },
  examReviewNote:
    "Se a nota ficar abaixo de 14: rever as secções das perguntas falhadas (1 e 4 → secção 1, árvores de decisão; 2, 8 e 9 → secção 2, bagging e random forests; 3 e 10 → secção 3, gradient boosting; 5, 6, 7 e 12 → secção 4, k-NN e SVM; 11 e 13 → secção 5, qual escolher?). Refaça os exercícios dessas secções sem olhar para o gabarito e repita a prova daqui a uma semana.",

  // ---------------------------------------------------------------- SIMULADO DE TREINO (banco extra da plataforma)
  practice: {
    mcq: [
      {
        id: "q1", section: "s1",
        q: "Numa árvore de classificação, o que prevê uma folha?",
        options: ["A média das variáveis dos exemplos que lá caem", "A classe mais frequente dos exemplos de treino que lá caem", "O índice de Gini do nó", "A probabilidade de cada corte"],
        answer: 1,
        explain: "Em classificação, a classe mais frequente; em regressão, a média do alvo dos exemplos de treino que lá caem.",
      },
      {
        id: "q2", section: "s1",
        q: "Como escolhe o CART cada corte?",
        options: [
          "Ao acaso, entre as variáveis disponíveis",
          "Pela variável com mais valores diferentes",
          "De forma gulosa: em cada nó, o corte que deixa os dois grupos mais puros",
          "Olhando para a árvore inteira de uma vez, para minimizar o erro final",
        ],
        answer: 2,
        explain: "Experimenta todas as variáveis e todos os pontos de corte, e fica com o melhor nesse nó, sem olhar para os passos seguintes: é um algoritmo guloso.",
      },
      {
        id: "q3", section: "s1",
        q: "Na aula, a árvore sem limite teve 100% no treino e 72% no teste. E a de profundidade 3?",
        options: ["81,3% no treino e 73% no teste", "100% no treino e 73% no teste", "73% no treino e 81,3% no teste", "72% no treino e no teste"],
        answer: 0,
        explain: "Com profundidade 3 (8 folhas), perde no treino (0,813) e ganha no teste (0,73).",
      },
      {
        id: "q4", section: "s1",
        q: "Que parâmetro do scikit-learn faz a poda por custo-complexidade?",
        options: ["`max_depth`", "`min_samples_leaf`", "`n_estimators`", "`ccp_alpha`"],
        answer: 3,
        explain: "`ccp_alpha` cresce a árvore toda e corta os ramos que pouco melhoram, com uma penalização por folha, como o α do Lasso.",
      },
      {
        id: "q5", section: "s1",
        q: "Qual é o ponto fraco das árvores de decisão sozinhas?",
        options: [
          "Precisam de variáveis padronizadas",
          "Não apanham interações entre variáveis",
          "Variância alta: mudar um pouco os dados pode mudar a árvore inteira",
          "Só funcionam com variáveis numéricas",
        ],
        answer: 2,
        explain: "Mudar um pouco os dados de treino pode mudar a primeira pergunta e, com ela, a árvore toda. Os ensembles corrigem isto.",
      },
      {
        id: "q6", section: "s1",
        q: "Um nó tem três classes em partes iguais. Qual é o seu índice de Gini?",
        options: ["0,5", "Cerca de 0,667", "1", "Cerca de 0,333"],
        answer: 1,
        explain: "G = Σ pₖ(1 − pₖ) = 3 × (1/3) × (2/3) = 2/3. Com duas classes meio-meio seria 0,5.",
      },
      {
        id: "q7", section: "s2",
        q: "No bagging, cada árvore é treinada…",
        options: ["numa reamostragem com reposição dos dados", "nos resíduos da árvore anterior", "numa só variável, diferente para cada árvore", "numa parte dos dados de teste"],
        answer: 0,
        explain: "Bootstrap aggregating: cada árvore numa reamostragem bootstrap; no fim, votam (classificação) ou faz-se a média (regressão).",
      },
      {
        id: "q8", section: "s2",
        q: "No `Carseats`, quantos pontos de exatidão no teste ganhou a floresta de 500 árvores à árvore de profundidade 3?",
        options: ["Cerca de 1 ponto", "Cerca de 5 pontos", "Cerca de 9 pontos", "Nenhum: empataram"],
        answer: 2,
        explain: "82% contra 73%: 9 pontos. E o erro fora do saco (80,7%) ficou perto dos 82% do teste.",
      },
      {
        id: "q9", section: "s2",
        q: "Como se calcula a importância por permutação de uma variável?",
        options: [
          "Retira-se a variável, treina-se o modelo outra vez e mede-se a diferença",
          "Baralham-se os valores dessa variável em dados que o modelo não viu e mede-se quanto o desempenho cai",
          "Soma-se quanto essa variável reduz o Gini em todas as árvores",
          "Mede-se a correlação dessa variável com o alvo",
        ],
        answer: 1,
        explain: "Se a variável importa, baralhá-la estraga as previsões. Somar as reduções do Gini é a importância por impureza; retreinar sem a variável é outro método, muito mais caro.",
      },
      {
        id: "q10", section: "s2",
        q: "Que argumento do `RandomForestClassifier` pede o cálculo da exatidão fora do saco?",
        options: ["`bootstrap=False`", "`max_features=\"sqrt\"`", "`warm_start=True`", "`oob_score=True`"],
        answer: 3,
        explain: "Com `oob_score=True`, o resultado fica em `floresta.oob_score_`. `bootstrap=False` desligaria a reamostragem e, com ela, os exemplos fora do saco.",
      },
      {
        id: "q11", section: "s2",
        q: "Segundo a aula, que parâmetros de uma random forest mais vale a pena afinar?",
        options: ["`learning_rate` e `n_estimators`", "`max_features` e `min_samples_leaf`", "`C` e `gamma`", "`max_depth` e `ccp_alpha`"],
        answer: 1,
        explain: "As random forests funcionam bem com os valores por omissão; os parâmetros que mais vale a pena afinar são `max_features` e `min_samples_leaf`.",
      },
      {
        id: "q12", section: "s3",
        q: "No boosting, as árvores…",
        options: [
          "crescem em sequência, pequenas, e cada uma tenta corrigir os erros das anteriores",
          "crescem independentes, sem limite, e votam",
          "crescem todas na mesma reamostragem",
          "crescem sem limite e fazem a média",
        ],
        answer: 0,
        explain: "Na random forest as árvores são independentes e votam; no boosting crescem uma a seguir à outra, e cada uma contribui só com uma fração η.",
      },
      {
        id: "q13", section: "s3",
        q: "Com uma perda qualquer, a que se ajusta cada árvore nova do gradient boosting?",
        options: ["Ao alvo original", "Aos pesos dos exemplos mal classificados", "Ao gradiente negativo da perda em relação às previsões", "À importância das variáveis"],
        answer: 2,
        explain: "É a descida do gradiente do M5, feita não nos parâmetros mas nas próprias previsões (Friedman, 2001), com η como taxa de aprendizagem. Daí o nome *gradient boosting*.",
      },
      {
        id: "q14", section: "s3",
        q: "Porque se retiram as colunas `casual` e `registered` do `Bikeshare`?",
        options: ["Têm muitos valores em falta", "São categóricas", "Não ajudam a prever", "Somam exatamente o alvo: deixá-las seria uma fuga de dados"],
        answer: 3,
        explain: "`bikers` = `casual` + `registered`. Com elas, o modelo \"preveria\" o alvo a partir dele próprio (M7, M11).",
      },
      {
        id: "q15", section: "s3",
        q: "Porque é que a aula usa `GroupKFold(5)` com `groups=bk[\"day\"]` no `Bikeshare`?",
        options: [
          "Para pôr as 24 horas de cada dia do mesmo lado, porque horas seguidas são muito parecidas",
          "Para equilibrar as classes em cada divisão",
          "Para acelerar o treino do boosting",
          "Porque o `HistGradientBoostingRegressor` o exige",
        ],
        answer: 0,
        explain: "Avaliar com horas \"vizinhas\" das de treino daria uma estimativa otimista. A validação deve imitar o uso real: prever dias novos.",
      },
      {
        id: "q16", section: "s3",
        q: "Com taxa 0,3, o erro em dias novos foi 36,3 às 86 árvores e 38,5 às 1000. O que aconteceu?",
        options: ["Faltaram árvores", "A taxa era pequena demais", "Sobreajuste: as árvores a mais ajustaram-se ao treino", "Uma fuga de dados"],
        answer: 2,
        explain: "Depois do melhor ponto, cada árvore nova ajusta-se mais ao treino e o erro em dados novos sobe. A paragem antecipada evita isto.",
      },
      {
        id: "q17", section: "s3",
        q: "Que biblioteca cresce as árvores folha a folha e é muito rápida em dados grandes?",
        options: ["XGBoost", "CatBoost", "`HistGradientBoosting`", "LightGBM"],
        answer: 3,
        explain: "LightGBM (Ke et al., 2017). O XGBoost penaliza a complexidade das árvores; o CatBoost cuida das categóricas.",
      },
      {
        id: "q18", section: "s3",
        q: "Como se liga a paragem antecipada no `HistGradientBoostingRegressor`?",
        options: ["`early_stopping=True`", "`early_stopping_rounds=20`", "`max_iter=None`", "`n_estimators=\"auto\"`"],
        answer: 0,
        explain: "No `HistGradientBoostingRegressor` é `early_stopping=True`; no XGBoost e no LightGBM, `early_stopping_rounds`.",
      },
      {
        id: "q19", section: "s4",
        q: "Com k = 1, o k-NN tem…",
        options: ["viés alto e fronteira suave", "variância alta, como a árvore sem limite", "sempre a melhor exatidão", "uma fronteira reta"],
        answer: 1,
        explain: "Cada ponto de treino manda numa pequena ilha à sua volta, e um só vizinho ruidoso muda a previsão. O k escolhe-se por validação cruzada.",
      },
      {
        id: "q20", section: "s4",
        q: "Na experiência dos 1000 pontos ao acaso num cubo de 1000 dimensões, o ponto mais próximo estava…",
        options: ["100 vezes mais perto do que o mais afastado", "à mesma distância de todos os outros", "só cerca de 10% mais perto do que o mais afastado", "a metade da distância do mais afastado"],
        answer: 2,
        explain: "A razão mínimo/máximo foi 0,9. Em 2 dimensões foi 0,01: 100 vezes mais perto. É a maldição da dimensionalidade.",
      },
      {
        id: "q21", section: "s4",
        q: "O que são os vetores de suporte de uma SVM?",
        options: [
          "Todos os pontos de treino",
          "As variáveis mais importantes",
          "Os pontos mal classificados",
          "Os pontos mais próximos da fronteira, os únicos que a definem",
        ],
        answer: 3,
        explain: "Os outros pontos podiam mudar ou desaparecer sem alterar a fronteira.",
      },
      {
        id: "q22", section: "s4",
        q: "Numa SVM, um C grande…",
        options: [
          "castiga muito os erros de treino: margem estreita, mais variância",
          "tolera os erros de treino: margem larga, mais viés",
          "aumenta o alcance de cada ponto",
          "dispensa a padronização",
        ],
        answer: 0,
        explain: "É o mesmo C da regressão logística do M8: o inverso da força da regularização.",
      },
      {
        id: "q23", section: "s4",
        q: "Na grelha da aula, que combinação deu a melhor SVM no `Carseats`?",
        options: ["C = 0,1 e γ = 1", "C = 100 e γ = 0,001, uma fronteira quase reta", "C = 1 e γ = 0,1", "C = 10 e γ = 1"],
        answer: 1,
        explain: "0,883 com C = 100 e γ = 0,001. Com γ = 1 a SVM fica perto dos 59%, faça-se o que se fizer ao C.",
      },
      {
        id: "q24", section: "s5",
        q: "Na comparação dos seis modelos no `Carseats`, qual teve a melhor exatidão?",
        options: ["Gradient boosting (0,828)", "Random forest (0,800)", "SVM com kernel RBF (0,857)", "Regressão logística (0,880)"],
        answer: 3,
        explain: "O `Carseats` foi simulado com relações quase lineares: um modelo que só traça retas tem viés quase nulo e muito menos variância.",
      },
      {
        id: "q25", section: "s5",
        q: "O que concluíram Grinsztajn, Oyallon e Varoquaux (2022) sobre dados em tabela de tamanho médio?",
        options: [
          "As redes neuronais já ganham aos ensembles de árvores",
          "Os ensembles de árvores continuam à frente das redes neuronais",
          "O k-NN é o melhor modelo",
          "Todos os modelos empatam",
        ],
        answer: 1,
        explain: "Em 45 conjuntos de dados: as funções a aprender são irregulares, as variáveis inúteis atrapalham mais as redes, e cada coluna tem um significado próprio.",
      },
      {
        id: "q26", section: "s5",
        q: "Segundo o guia prático da aula, por onde começar com imagens, som ou texto livre?",
        options: ["Random forest", "Gradient boosting", "Redes neuronais (Fase 3)", "SVM"],
        answer: 2,
        explain: "Os ensembles de árvores são a escolha para dados em tabela; para imagens, som ou texto livre, redes neuronais.",
      },
    ],
    tf: [
      { id: "v1", section: "s1", q: "O CART experimenta todas as variáveis e todos os pontos de corte em cada nó.", answer: true, explain: "E escolhe o que deixa os dois grupos mais puros: é guloso." },
      { id: "v2", section: "s1", q: "Um nó com uma só classe tem índice de Gini 0.", answer: true, explain: "pₖ = 1 para essa classe e 0 para as outras: Σ pₖ(1 − pₖ) = 0." },
      { id: "v3", section: "s1", q: "Na árvore da aula, 76,5% das lojas com boa prateleira vendem muito.", answer: true, explain: "Contra 30,6% nas outras; a boa prateleira é a primeira pergunta da árvore." },
      { id: "v4", section: "s2", q: "Cada reamostragem bootstrap deixa de fora cerca de 37% dos exemplos.", answer: true, explain: "(1 − 1/n)ⁿ ≈ 1/e ≈ 0,37 para n grande." },
      { id: "v5", section: "s2", q: "A importância por impureza vem grátis em `feature_importances_`.", answer: true, explain: "É grátis, mas favorece variáveis contínuas e com muitos valores. A permutação é mais fiável." },
      { id: "v6", section: "s2", q: "No bagging, as árvores são pequenas, de poucas perguntas.", answer: false, explain: "Crescem sem limite: cada uma sobreajusta à sua maneira, e a votação cancela os erros. As árvores pequenas são as do boosting." },
      { id: "v7", section: "s3", q: "No boosting, cada árvore contribui só com uma fração η da sua previsão.", answer: true, explain: "Fₘ(x) = Fₘ₋₁(x) + η · hₘ(x)." },
      { id: "v8", section: "s3", q: "No Bikeshare, o XGBoost, o LightGBM e o `HistGradientBoostingRegressor` deram erros muito diferentes.", answer: false, explain: "35,5, 34,4 e 35,0: resultados muito parecidos. Os ganhos maiores estão nas variáveis e na avaliação." },
      { id: "v9", section: "s3", q: "O desvio padrão do alvo do Bikeshare é de cerca de 134 bicicletas, e o boosting erra cerca de um quarto disso.", answer: true, explain: "RMSE de 35,0, metade do erro do melhor modelo linear (75,6)." },
      { id: "v10", section: "s4", q: "O k-NN não treina nada: guarda os dados.", answer: true, explain: "Para prever, procura os k exemplos de treino mais parecidos e faz votar as suas classes." },
      { id: "v11", section: "s4", q: "A `SVC` do scikit-learn dá probabilidades diretamente, sem custo extra.", answer: false, explain: "As SVM não dão probabilidades diretamente: `SVC(probability=True)` calibra-as à parte, com um custo extra." },
      { id: "v12", section: "s4", q: "As SVM escalam bem para centenas de milhares de linhas.", answer: false, explain: "O tempo de treino cresce entre n² e n³; hoje usam-se sobretudo em conjuntos pequenos ou médios com muitas variáveis." },
      { id: "v13", section: "s5", q: "Há um algoritmo que é o melhor em todos os problemas, se for bem afinado.", answer: false, explain: "O teorema *no free lunch* (Wolpert, 1996): existe o melhor para estes dados, e descobre-se com validação cruzada." },
      { id: "v14", section: "s5", q: "As árvores cortam o plano em retângulos sempre paralelos aos eixos.", answer: true, explain: "Cada pergunta usa uma só variável; a floresta e o boosting juntam muitos desses degraus." },
    ],
  },

  // ---------------------------------------------------------------- CARTÕES
  flashcards: [
    { id: "f1", section: "s1", tag: "Árvores", front: "Árvore de decisão", back: "Prevê com uma sequência de perguntas de sim ou não sobre as variáveis. Cada caminho acaba numa folha, que prevê a classe mais frequente (classificação) ou a média (regressão) dos exemplos de treino que lá caem." },
    { id: "f2", section: "s1", tag: "Árvores", front: "CART (Breiman et al., 1984)", back: "O algoritmo clássico das árvores: guloso, com cortes binários. Em cada nó experimenta todas as variáveis e todos os cortes e escolhe o que deixa os dois grupos mais puros." },
    { id: "f3", section: "s1", tag: "Árvores", front: "Índice de Gini", back: "G = Σₖ pₖ(1 − pₖ). 0 num nó puro, 0,5 num nó meio-meio com duas classes." },
    { id: "f4", section: "s1", tag: "Árvores", front: "A árvore sem limite no Carseats", back: "Profundidade 10, 44 folhas, 100% no treino e 72% no teste: decora o treino. Com profundidade 3: 81,3% e 73%." },
    { id: "f5", section: "s1", tag: "Árvores", front: "`max_depth`, `min_samples_leaf`, `ccp_alpha`", back: "Limitam o número de perguntas seguidas; exigem um mínimo de exemplos por folha; fazem a poda por custo-complexidade (penalização por folha, como o α do Lasso). Escolhem-se por validação cruzada." },
    { id: "f6", section: "s1", tag: "Árvores", front: "Forças e fraquezas das árvores", back: "Fáceis de explicar, sem padronização, apanham não linearidades e interações. Fraqueza: variância alta; mudar um pouco os dados pode mudar a árvore inteira." },
    { id: "f7", section: "s2", tag: "Ensembles", front: "Porque funciona um ensemble", back: "A média de n observações independentes tem variância σ²/n: a média de muitas árvores instáveis é muito mais estável do que qualquer uma." },
    { id: "f8", section: "s2", tag: "Ensembles", front: "Bagging (Breiman, 1996)", back: "Bootstrap aggregating: cada árvore, sem limite, numa reamostragem com reposição; no fim votam (classificação) ou faz-se a média (regressão)." },
    { id: "f9", section: "s2", tag: "Ensembles", front: "Random forest (Breiman, 2001)", back: "Bagging + um segundo sorteio: em cada nó só uma parte aleatória das variáveis (√p em classificação). As árvores ficam menos correlacionadas e a média melhora." },
    { id: "f10", section: "s2", tag: "Ensembles", front: "Erro fora do saco (OOB)", back: "Cada reamostragem deixa de fora cerca de 37% dos exemplos ((1 − 1/n)ⁿ ≈ 1/e). Avaliar cada exemplo só com as árvores que não o viram: validação grátis. Na aula, 80,7% contra 82% no teste." },
    { id: "f11", section: "s2", tag: "Importância", front: "Importância por impureza", back: "Soma das reduções de Gini em todas as árvores (`feature_importances_`). Grátis, mas favorece variáveis contínuas e com muitos valores (Strobl et al., 2007)." },
    { id: "f12", section: "s2", tag: "Importância", front: "Importância por permutação", back: "Quanto a exatidão cai ao baralhar uma variável em dados que o modelo não viu. Mais lenta e mais fiável. Mede o que pesa nas previsões, não um efeito causal." },
    { id: "f13", section: "s2", tag: "Ensembles", front: "Random forests na prática", back: "Funcionam bem por omissão: excelente segunda tentativa. Mais árvores nunca pioram (300 a 500 chegam). Afinar `max_features` e `min_samples_leaf`." },
    { id: "f14", section: "s3", tag: "Boosting", front: "Boosting", back: "Árvores pequenas em sequência, cada uma a corrigir os erros das anteriores: Fₘ(x) = Fₘ₋₁(x) + η · hₘ(x)." },
    { id: "f15", section: "s3", tag: "Boosting", front: "Porquê \"gradient\" boosting (Friedman, 2001)", back: "Cada árvore ajusta-se ao gradiente negativo da perda em relação às previsões (os resíduos, com o erro quadrático): descida do gradiente nas previsões, com η como taxa." },
    { id: "f16", section: "s3", tag: "Boosting", front: "A interação no Bikeshare", back: "Dias úteis: picos às 8h e às 17h-18h; fins de semana: procura a meio do dia. O efeito da hora depende do tipo de dia, e as árvores apanham isso sem ajuda." },
    { id: "f17", section: "s3", tag: "Avaliação", front: "Bikeshare: fuga e divisões por dia", back: "`casual` + `registered` = alvo: retirá-las (fuga de dados). `GroupKFold` com `groups=bk[\"day\"]` põe cada dia inteiro de um só lado, para não avaliar com horas vizinhas." },
    { id: "f18", section: "s3", tag: "Boosting", front: "Resultados no Bikeshare (RMSE)", back: "Linear 75,6; árvore de profundidade 6 65,4; random forest 38,9; gradient boosting 35,0; XGBoost 35,5; LightGBM 34,4. Desvio padrão do alvo: 134." },
    { id: "f19", section: "s3", tag: "Boosting", front: "Taxa de aprendizagem e número de árvores", back: "Taxa pequena: passos pequenos, mais árvores, sobreajuste mais lento. Na aula: 0,3 → melhor às 86 árvores e depois sobe; 0,03 ainda a melhorar às 1000." },
    { id: "f20", section: "s3", tag: "Boosting", front: "Paragem antecipada", back: "Parar de juntar árvores quando o erro numa parte de validação deixa de melhorar durante um certo número de árvores. `early_stopping=True` no `HistGradientBoosting`; `early_stopping_rounds` no XGBoost e no LightGBM." },
    { id: "f21", section: "s3", tag: "Bibliotecas", front: "HistGradientBoosting, XGBoost, LightGBM, CatBoost", back: "Histogramas (rápido, aceita valores em falta); penaliza a complexidade das árvores (Kaggle); cresce folha a folha (rápido em dados grandes); categóricas tratadas com cuidado. Resultados muito parecidos." },
    { id: "f22", section: "s4", tag: "k-NN", front: "k-NN (Cover & Hart, 1967)", back: "Não treina: guarda os dados. Para prever, faz votar os k exemplos de treino mais próximos (distância euclidiana). k = 1: variância alta; k muito grande: viés alto." },
    { id: "f23", section: "s4", tag: "k-NN", front: "k-NN e a escala das variáveis", back: "As variáveis com números grandes dominam as distâncias. No Carseats, sem padronizar nunca passa dos 65%; padronizado, 77,5% com k = 15. Usar `make_pipeline(StandardScaler(), …)`." },
    { id: "f24", section: "s4", tag: "k-NN", front: "Maldição da dimensionalidade", back: "Com muitas variáveis, todos os pontos ficam quase à mesma distância. 1000 pontos ao acaso: razão mais próximo/mais afastado 0,01 em 2 dimensões e 0,9 em 1000." },
    { id: "f25", section: "s4", tag: "SVM", front: "Margem e vetores de suporte (Cortes & Vapnik, 1995)", back: "A SVM escolhe o hiperplano com a maior distância aos pontos mais próximos de cada lado. Esses pontos, os vetores de suporte, são os únicos que definem a fronteira." },
    { id: "f26", section: "s4", tag: "SVM", front: "O parâmetro C", back: "Custo dos erros de treino. C grande: margem estreita, mais variância; C pequeno: margem larga, mais viés. É o inverso da força da regularização, como na regressão logística." },
    { id: "f27", section: "s4", tag: "SVM", front: "Truque do kernel", back: "Trocar o produto interno por um kernel equivale a trabalhar num espaço de dimensão muito maior sem o construir. RBF: K(x, x′) = exp(−γ · ‖x − x′‖²)." },
    { id: "f28", section: "s4", tag: "SVM", front: "γ do kernel RBF", back: "Até onde chega a influência de cada ponto de treino. γ grande: fronteira recortada (variância); γ pequeno: quase linear (viés). No Carseats, a melhor foi C = 100, γ = 0,001 (0,883)." },
    { id: "f29", section: "s4", tag: "SVM", front: "SVM na prática", back: "Estado da arte nos anos 2000; treino entre n² e n³; sem probabilidades diretas (`probability=True` calibra à parte). Hoje: conjuntos pequenos ou médios com muitas variáveis. Padronizar sempre." },
    { id: "f30", section: "s5", tag: "Escolher", front: "Fronteiras de decisão de cada família", back: "Logística: uma reta. Árvores: retângulos paralelos aos eixos (floresta e boosting juntam muitos degraus). k-NN e SVM RBF: curvas suaves." },
    { id: "f31", section: "s5", tag: "Escolher", front: "Carseats: quem ganhou e porquê", back: "Regressão logística (0,880, AUC 0,957), à frente da SVM (0,857) e do boosting (0,828). Os dados foram simulados quase lineares: o modelo que só traça retas tem viés quase nulo e menos variância." },
    { id: "f32", section: "s5", tag: "Escolher", front: "No free lunch (Wolpert, 1996)", back: "Nenhum algoritmo é o melhor em todos os problemas. Carseats e Bikeshare: os mesmos modelos, ordens opostas. Descobre-se com validação cruzada." },
    { id: "f33", section: "s5", tag: "Escolher", front: "Grinsztajn, Oyallon & Varoquaux (2022)", back: "Em 45 conjuntos de dados em tabela de tamanho médio, os ensembles de árvores continuam à frente das redes neuronais: funções irregulares, variáveis inúteis, colunas com significado próprio." },
    { id: "f34", section: "s5", tag: "Escolher", front: "A ordem de trabalho", back: "Linha de base, modelo linear, ensemble de árvores, comparação justa com as mesmas divisões. Os ganhos maiores costumam estar em boas variáveis e numa avaliação sem fugas (M11)." },
  ],

  // ---------------------------------------------------------------- NOTEBOOK
  notebook: {
    filename: "M9 — exercícios",
    cells: [
      {
        type: "md",
        source:
          "# M9 — Árvores, ensembles e outros modelos\n\nExemplos da aula (correr pela ordem, no mesmo notebook) e os exercícios 3, 4, 5(d), 6, 8, 9 e 10. Os exercícios 1, 2, 5 (a a c) e 7 fazem-se à mão. Alguns blocos demoram dezenas de segundos. Guardar no Drive, na pasta da Fase 2.",
      },
      { type: "md", source: "## 1. Árvores de decisão" },
      { type: "code", source: CART_CODE },
      { type: "md", source: "## 2. Bagging e random forests" },
      { type: "code", source: RF_CODE },
      { type: "code", source: IMP_CODE },
      { type: "md", source: "## 3. Gradient boosting: XGBoost e LightGBM" },
      { type: "code", source: BIKE_CODE },
      { type: "code", source: RATES_CODE },
      { type: "code", source: XGB_CODE },
      { type: "md", source: "## 4. k-NN e SVM" },
      { type: "code", source: KNN_CODE },
      { type: "code", source: DIM_CODE },
      { type: "code", source: SVM_CODE },
      { type: "md", source: "## 5. Qual escolher?" },
      { type: "code", source: CMP_CODE },
      {
        type: "md",
        source:
          "## Preparação para os exercícios\n\nOs dados `Carseats` preparados como na aula e as divisões `cv` usadas em quase todos os exercícios.",
      },
      { type: "code", source: PREP },
      {
        type: "md",
        source:
          "## Exercício 3\n\nPara `max_depth` de 1 a 12 e sem limite: exatidão média de treino e de validação (`cross_validate(..., cv=cv, return_train_score=True)`, `random_state=0`) e desvio padrão da validação. (a) Gráfico; (b) melhor profundidade; (c) regra de um erro padrão.",
      },
      { type: "code", source: "import matplotlib.pyplot as plt\nfrom sklearn.tree import DecisionTreeClassifier\n\nprofundidades = list(range(1, 13)) + [None]\n" },
      { type: "md", source: "(b) e (c):\n\n" },
      {
        type: "md",
        source:
          "## Exercício 4\n\nRandom forests de 500 árvores (`random_state=0`, `oob_score=True`) com `max_features` = 1, 2, 3, 5, 8 e `None`: exatidão fora do saco e no teste; erro padrão de 80% com n = 100.",
      },
      { type: "code", source: "from sklearn.ensemble import RandomForestClassifier\n\nfor mf in [1, 2, 3, 5, 8, None]:\n    pass\n" },
      { type: "md", source: "(b) e (c):\n\n" },
      {
        type: "md",
        source:
          "## Exercício 5 (d)\n\nConfirmar as contas à mão com `GradientBoostingRegressor(n_estimators=40, learning_rate=0.5, max_depth=1)` e `staged_predict`.",
      },
      { type: "code", source: "from sklearn.ensemble import GradientBoostingRegressor\n\nx5 = np.array([[1], [2], [3], [4]])\ny5 = np.array([3, 5, 9, 11])\n" },
      {
        type: "md",
        source:
          "## Exercício 6\n\n`Bikeshare` com a divisão por dias da aula. (a) `HistGradientBoostingRegressor` com paragem antecipada, taxas 0,1 e 0,05: `n_iter_` e RMSE no teste; (b) porque é que a validação hora a hora é um problema; (c) desafio: escolher o número de árvores com uma validação por dias.",
      },
      { type: "code", source: "from sklearn.model_selection import GroupShuffleSplit\nfrom sklearn.ensemble import HistGradientBoostingRegressor\nfrom sklearn.metrics import root_mean_squared_error\n\n# (a)\n# (c)\n" },
      { type: "md", source: "(b):\n\n" },
      {
        type: "md",
        source:
          "## Exercício 8\n\n100 colunas de ruído com `default_rng(0)`; para m = 0, 10, 50 e 100, exatidão em validação cruzada da regressão logística e do k-NN (k = 15), ambos padronizados, e de uma random forest de 300 árvores.",
      },
      { type: "code", source: "from sklearn.linear_model import LogisticRegression\nfrom sklearn.neighbors import KNeighborsClassifier\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.pipeline import make_pipeline\n\nrng = np.random.default_rng(0)\n" },
      { type: "md", source: "(b) e (c):\n\n" },
      {
        type: "md",
        source:
          "## Exercício 9\n\n`make_moons(n_samples=500, noise=0.3, random_state=1)`, 70% de treino (`random_state=0`). (a) `SVC(C=1)` com γ = 0,1, 1, 10 e 100; (b) fronteiras; (c) `GridSearchCV` e regressão logística; (d) vetores de suporte com γ = 100.",
      },
      { type: "code", source: "from sklearn.datasets import make_moons\nfrom sklearn.svm import SVC\nfrom sklearn.model_selection import GridSearchCV\n\nXm, ym = make_moons(n_samples=500, noise=0.3, random_state=1)\n" },
      { type: "md", source: "(b) a (d):\n\n" },
      {
        type: "md",
        source:
          "## Exercício 10\n\nDados `OJ`: (a) percentagem de MM, `X` e `y`; (b) cinco modelos com `cv`, exatidão e AUC; (c) importância por permutação do melhor com `scoring=\"roc_auc\"`; (d) mensagem de 5 a 8 linhas para o gestor da categoria.",
      },
      { type: "code", source: "oj = pd.read_csv(URL + \"OJ.csv\")\n" },
      { type: "md", source: "(d) Mensagem:\n\n" },
      { type: "md", source: "## Notas\n\nO que aprendi neste módulo, em três frases:" },
    ],
  },
  source: "curso-engenharia-ia 2/modulo-09-arvores-ensembles",
};
