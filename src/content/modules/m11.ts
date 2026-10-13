import type { ModuleContent } from "../types";

// Módulo 11 — Pipelines e avaliação rigorosa.
// Fonte: curso-engenharia-ia 2/modulo-11-pipelines-avaliacao (01-aula, 02-apostila, 03-exercicios, 04-prova, 05-gabarito,
// codigo/exemplos_m11.py e img/). As cinco imagens da aula entram como figuras; as fórmulas da apostila, escritas em
// LaTeX, passam a texto Unicode (não há renderizador de LaTeX). Os esquemas de validação (KFold, StratifiedKFold,
// GroupKFold e TimeSeriesSplit, com as mesmas divisões do scikit-learn), o limiar e a capacidade no Caravan e a cascata
// SHAP de uma previsão do Bikeshare têm widgets interativos (src/components/widgets/m11), com a lógica testada contra o
// scikit-learn 1.9.1 e os dados reais da aula. As verificações rápidas, os cartões de revisão e o banco do simulado foram
// escritos pela plataforma a partir da aula. Todo o código da aula e do gabarito foi corrido em Python 3.13 com NumPy 2.5,
// pandas 3.0, scikit-learn 1.9 e shap 0.53; o campo `output` de cada bloco tem o resultado real, igual ao dos comentários.

// ---------------------------------------------------------------- código da aula e do gabarito (tal como está nos .md)

const C_TITANIC = `import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold, cross_validate

ti = pd.read_csv("https://raw.githubusercontent.com/mwaskom/seaborn-data/master/titanic.csv")
print(ti.shape, round(ti["survived"].mean(), 3))                 # (891, 15) 0.384
print(ti[["age", "embarked", "deck"]].isna().sum().to_dict())    # {'age': 177, 'embarked': 2, 'deck': 688}

numericas = ["age", "fare", "sibsp", "parch"]
categoricas = ["pclass", "sex", "embarked"]
X = ti[numericas + categoricas]
y = ti["survived"]

preparar = ColumnTransformer([
    ("num", Pipeline([("imputar", SimpleImputer(strategy="median")),
                      ("escalar", StandardScaler())]), numericas),
    ("cat", Pipeline([("imputar", SimpleImputer(strategy="most_frequent")),
                      ("codificar", OneHotEncoder(handle_unknown="ignore"))]), categoricas),
])
modelo = Pipeline([("prep", preparar), ("modelo", LogisticRegression(max_iter=1000))])

cv = StratifiedKFold(5, shuffle=True, random_state=0)
r = cross_validate(modelo, X, y, cv=cv, scoring=["accuracy", "roc_auc"])
print(round(r["test_accuracy"].mean(), 3), round(r["test_roc_auc"].mean(), 3))   # 0.796 0.847`;

const C_FIT = `modelo.fit(X, y)
print(modelo.named_steps["prep"].get_feature_names_out())
# ['num__age' 'num__fare' 'num__sibsp' 'num__parch' 'cat__pclass_1' 'cat__pclass_2' 'cat__pclass_3'
#  'cat__sex_female' 'cat__sex_male' 'cat__embarked_C' 'cat__embarked_Q' 'cat__embarked_S']
passageira = pd.DataFrame([{"age": 30, "fare": 20, "sibsp": 0, "parch": 0,
                            "pclass": 2, "sex": "female", "embarked": None}])
print(modelo.predict_proba(passageira)[:, 1].round(3))   # [0.856]`;

const C_GRID = `from sklearn.model_selection import GridSearchCV
from sklearn.ensemble import HistGradientBoostingClassifier

grelha = GridSearchCV(modelo, [
    {"modelo": [LogisticRegression(max_iter=1000)], "modelo__C": [0.1, 1, 10]},
    {"modelo": [HistGradientBoostingClassifier(random_state=0)],
     "modelo__learning_rate": [0.03, 0.1], "modelo__max_depth": [3, None]},
], cv=cv, scoring="roc_auc")
grelha.fit(X, y)
print(grelha.best_params_["modelo"], round(grelha.best_score_, 3))   # HistGradientBoostingClassifier(random_state=0) 0.863
print(pd.DataFrame(grelha.cv_results_)["mean_test_score"].round(3).tolist())
# [0.847, 0.847, 0.846, 0.863, 0.862, 0.863, 0.861]`;

const C_NESTED = `from sklearn.model_selection import cross_val_score
from sklearn.svm import SVC
from sklearn.pipeline import make_pipeline

parametros = {"svc__C": np.logspace(-2, 3, 6), "svc__gamma": np.logspace(-4, 1, 6)}   # 36 combinações
interno = StratifiedKFold(5, shuffle=True, random_state=0)
externo = StratifiedKFold(5, shuffle=True, random_state=1)
rng = np.random.default_rng(0)
X_ruido = rng.normal(size=(100, 20))
y_ruido = rng.integers(0, 2, size=100)              # rótulos ao acaso
procura = GridSearchCV(make_pipeline(StandardScaler(), SVC()), parametros, cv=interno)
procura.fit(X_ruido, y_ruido)
aninhada = cross_val_score(procura, X_ruido, y_ruido, cv=externo)
print(round(procura.best_score_, 3), round(aninhada.mean(), 3))   # 0.58 0.55`;

const C_ALIVE = `X_vivo = ti[numericas + categoricas + ["alive"]]
modelo_vivo = Pipeline([("prep", ColumnTransformer([
    ("num", Pipeline([("imputar", SimpleImputer(strategy="median")), ("escalar", StandardScaler())]), numericas),
    ("cat", Pipeline([("imputar", SimpleImputer(strategy="most_frequent")),
                      ("codificar", OneHotEncoder(handle_unknown="ignore"))]), categoricas + ["alive"])])),
    ("modelo", LogisticRegression(max_iter=1000))])
print(round(cross_val_score(modelo_vivo, X_vivo, y, cv=cv).mean(), 3))   # 1.0`;

const C_GENES = `from sklearn.feature_selection import SelectKBest, f_classif

rng = np.random.default_rng(0)
X_genes = rng.normal(size=(50, 5000))                    # ruído puro
y_genes = np.r_[np.zeros(25), np.ones(25)].astype(int)

X_escolhidas = SelectKBest(f_classif, k=100).fit_transform(X_genes, y_genes)   # escolhe com TODOS os dados
errado = cross_val_score(LogisticRegression(max_iter=1000), X_escolhidas, y_genes, cv=cv).mean()
certo = cross_val_score(make_pipeline(SelectKBest(f_classif, k=100), LogisticRegression(max_iter=1000)),
                        X_genes, y_genes, cv=cv).mean()
print(round(errado, 3), round(certo, 3))   # 1.0 0.42`;

const C_BIKE = `from sklearn.model_selection import KFold, GroupKFold, TimeSeriesSplit
from sklearn.ensemble import HistGradientBoostingRegressor

URL = "https://raw.githubusercontent.com/intro-stat-learning/ISLP/main/ISLP/data/"
bk = pd.read_csv(URL + "Bikeshare.csv")
Xb = pd.get_dummies(bk.drop(columns=["casual", "registered", "bikers"]),
                    columns=["mnth", "weathersit"], drop_first=True, dtype=int).astype(float)
yb = bk["bikers"]
gb = HistGradientBoostingRegressor(random_state=0)
for nome, divisoes, grupos in [("KFold aleatório", KFold(5, shuffle=True, random_state=0), None),
                               ("GroupKFold por dia", GroupKFold(5), bk["day"]),
                               ("TimeSeriesSplit", TimeSeriesSplit(5), None)]:
    rmse = -cross_val_score(gb, Xb, yb, cv=divisoes, groups=grupos, scoring="neg_root_mean_squared_error")
    print(nome, rmse.round(1), round(rmse.mean(), 1))
# KFold aleatório [29.6 30.9 31.  28.9 33.8] 30.9
# GroupKFold por dia [37.  33.2 37.  33.7 34. ] 35.0
# TimeSeriesSplit [69.6 56.5 49.6 46.6 54.9] 55.4

fuga = Xb.assign(casual=bk["casual"], registered=bk["registered"])
print(round(-cross_val_score(gb, fuga, yb, cv=GroupKFold(5), groups=bk["day"],
                             scoring="neg_root_mean_squared_error").mean(), 1))   # 3.0`;

const C_CARAVAN = `from sklearn.model_selection import train_test_split
from sklearn.metrics import (precision_score, recall_score, roc_auc_score,
                             average_precision_score, brier_score_loss)

ca = pd.read_csv(URL + "Caravan.csv")
y_ca = (ca["Purchase"] == "Yes").astype(int)
X_ca = ca.drop(columns="Purchase")
print(X_ca.shape, round(y_ca.mean(), 3))                  # (5822, 85) 0.06
X_tr, X_te, y_tr, y_te = train_test_split(X_ca, y_ca, test_size=0.3, stratify=y_ca, random_state=0)

normal = make_pipeline(StandardScaler(), LogisticRegression(C=0.01, max_iter=2000)).fit(X_tr, y_tr)
p = normal.predict_proba(X_te)[:, 1]
previsto = normal.predict(X_te)
print(round((previsto == y_te).mean(), 3), round(recall_score(y_te, previsto), 3))   # 0.939 0.01`;

const C_LIMIAR = `for limiar in [0.5, 0.2, 0.1, 0.06]:
    prev = (p >= limiar).astype(int)
    print(limiar, prev.sum(), round(precision_score(y_te, prev, zero_division=0), 3), round(recall_score(y_te, prev), 3))
# 0.5 4 0.25 0.01
# 0.2 47 0.191 0.087
# 0.1 265 0.162 0.413
# 0.06 566 0.124 0.673`;

const C_PESADO = `pesado = make_pipeline(StandardScaler(),
                       LogisticRegression(C=0.01, max_iter=2000, class_weight="balanced")).fit(X_tr, y_tr)
p_pesado = pesado.predict_proba(X_te)[:, 1]
prev_pesado = pesado.predict(X_te)
print(round(precision_score(y_te, prev_pesado), 3), round(recall_score(y_te, prev_pesado), 3))   # 0.128 0.635
for nome, prob in [("normal", p), ("balanced", p_pesado)]:
    print(nome, round(roc_auc_score(y_te, prob), 3), round(average_precision_score(y_te, prob), 3),
          round(prob.mean(), 3), round(brier_score_loss(y_te, prob), 3))
# normal 0.752 0.151 0.059 0.054
# balanced 0.744 0.146 0.391 0.192`;

const C_GANHOS = `n_contactos = int(0.10 * len(p))                       # capacidade: 10% dos clientes
melhores = np.argsort(-p)[:n_contactos]
compradores = y_te.iloc[melhores].sum()
print(n_contactos, compradores, y_te.sum())             # 174 30 104
print(round(compradores / y_te.sum(), 2), round(compradores / n_contactos / y_te.mean(), 1))   # 0.29 2.9`;

const C_PERM = `from sklearn.model_selection import GroupShuffleSplit
from sklearn.inspection import permutation_importance, PartialDependenceDisplay

treino, teste = next(GroupShuffleSplit(n_splits=1, test_size=0.2, random_state=0).split(Xb, yb, groups=bk["day"]))
Xb_tr, Xb_te, yb_tr, yb_te = Xb.iloc[treino], Xb.iloc[teste], yb.iloc[treino], yb.iloc[teste]
gb = HistGradientBoostingRegressor(random_state=0).fit(Xb_tr, yb_tr)
perm = permutation_importance(gb, Xb_te, yb_te, n_repeats=10, random_state=0, scoring="neg_root_mean_squared_error")
print(pd.Series(perm.importances_mean, index=Xb.columns).sort_values(ascending=False).round(1).head(5).to_string())
# hr            121.8
# workingday     37.2
# day            16.9
# temp           12.8
# hum            12.5`;

const C_PDP = `PartialDependenceDisplay.from_estimator(gb, Xb_te, ["hr", "temp"], kind="both", subsample=60, random_state=0)`;

const C_SHAP = `import shap

explicador = shap.TreeExplainer(gb)
valores = explicador(Xb_te)
print(valores.values.shape, round(float(valores.base_values[0]), 1))   # (1710, 24) 144.5
print(np.allclose(valores.base_values + valores.values.sum(axis=1), gb.predict(Xb_te)))   # True
print(pd.Series(np.abs(valores.values).mean(axis=0), index=Xb.columns).sort_values(ascending=False).round(1).head(5).to_string())
# hr            75.9
# temp          18.2
# day           15.3
# workingday    14.4
# hum           12.4
shap.plots.waterfall(valores[0])     # uma previsão
shap.plots.beeswarm(valores)         # todas`;

const G_MONTAR = `def montar(nums, cats, imputar_indicador=False, extra=None):
    partes = [("num", Pipeline([("imputar", SimpleImputer(strategy="median", add_indicator=imputar_indicador)),
                                ("escalar", StandardScaler())]), nums),
              ("cat", Pipeline([("imputar", SimpleImputer(strategy="most_frequent")),
                                ("codificar", OneHotEncoder(handle_unknown="ignore"))]), cats)]
    if extra:
        partes.append(extra)
    return Pipeline([("prep", ColumnTransformer(partes)), ("modelo", LogisticRegression(max_iter=1000))])`;

const G_E2 = `ti2 = ti.assign(familia=ti["sibsp"] + ti["parch"] + 1, log_fare=np.log1p(ti["fare"]))
deck = ("deck", Pipeline([("imputar", SimpleImputer(strategy="constant", fill_value="desconhecido")),
                          ("codificar", OneHotEncoder(handle_unknown="ignore"))]), ["deck"])
versoes = [("base", montar(numericas, categoricas), numericas + categoricas),
           ("família e log da tarifa", montar(numericas + ["familia", "log_fare"], categoricas),
            numericas + ["familia", "log_fare"] + categoricas),
           ("indicador de falta e convés", montar(numericas, categoricas, True, deck), numericas + categoricas + ["deck"])]
for nome, modelo, cols in versoes:
    r = cross_validate(modelo, ti2[cols], y, cv=cv, scoring=["accuracy", "roc_auc"])
    print(nome, round(r["test_accuracy"].mean(), 3), round(r["test_roc_auc"].mean(), 3))
# base 0.796 0.847
# família e log da tarifa 0.788 0.851
# indicador de falta e convés 0.797 0.846`;

const G_E3 = `import time
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import RandomizedSearchCV
from scipy.stats import loguniform

X_cm, y_cm = load_breast_cancer(return_X_y=True)
grelha = GridSearchCV(make_pipeline(StandardScaler(), SVC()), parametros, cv=interno).fit(X_cm, y_cm)
aninhada = cross_val_score(GridSearchCV(make_pipeline(StandardScaler(), SVC()), parametros, cv=interno), X_cm, y_cm, cv=externo)
print(grelha.best_params_, round(grelha.best_score_, 3))   # C = 100, gamma = 0.001; 0.981
print(aninhada.round(3), round(aninhada.mean(), 3))          # [0.982 0.991 0.974 0.956 0.973] 0.975
sorteio = RandomizedSearchCV(make_pipeline(StandardScaler(), SVC()),
                             {"svc__C": loguniform(1e-2, 1e3), "svc__gamma": loguniform(1e-4, 1e1)},
                             n_iter=10, cv=interno, random_state=0).fit(X_cm, y_cm)
print(sorteio.best_params_, round(sorteio.best_score_, 3))   # C ≈ 10.3, gamma ≈ 0.053; 0.968`;

const G_E4 = `from sklearn.preprocessing import TargetEncoder

rng = np.random.default_rng(0)
ti4 = ti.assign(cabine_falsa=rng.integers(0, 400, size=len(ti)).astype(str))
ti4["cabine_media"] = ti4["cabine_falsa"].map(ti4.groupby("cabine_falsa")["survived"].mean())   # com todos os dados
for nome, modelo, cols in [
    ("sem a coluna", montar(numericas, categoricas), numericas + categoricas),
    ("média do alvo calculada antes", montar(numericas + ["cabine_media"], categoricas),
     numericas + ["cabine_media"] + categoricas),
    ("TargetEncoder no pipeline", montar(numericas, categoricas, extra=("te", TargetEncoder(random_state=0), ["cabine_falsa"])),
     numericas + categoricas + ["cabine_falsa"])]:
    r = cross_validate(modelo, ti4[cols], y, cv=cv, scoring=["accuracy", "roc_auc"])
    print(nome, round(r["test_accuracy"].mean(), 3), round(r["test_roc_auc"].mean(), 3))
# sem a coluna 0.796 0.847
# média do alvo calculada antes 0.863 0.935
# TargetEncoder no pipeline 0.799 0.846`;

const G_E5 = `from sklearn.model_selection import cross_val_predict

custo, margem = 10, 100
logistica = make_pipeline(StandardScaler(), LogisticRegression(C=0.01, max_iter=2000))
p_oof = cross_val_predict(logistica, X_tr, y_tr, cv=cv, method="predict_proba")[:, 1]
def lucro(prob, reais, limiar):
    contactados = prob >= limiar
    return margem * (contactados & (reais == 1)).sum() - custo * contactados.sum()
limiares = np.round(np.arange(0.02, 0.31, 0.01), 2)
lucros = [lucro(p_oof, y_tr.to_numpy(), t) for t in limiares]
melhor = float(limiares[int(np.argmax(lucros))])
print(melhor, max(lucros))                              # 0.1 3900
p_te = logistica.fit(X_tr, y_tr).predict_proba(X_te)[:, 1]
for t in [0.5, melhor]:
    print(t, int((p_te >= t).sum()), int(((p_te >= t) & (y_te == 1)).sum()), lucro(p_te, y_te.to_numpy(), t))
# 0.5 4 1 60
# 0.1 265 43 1650
print(lucro(np.ones(len(y_te)), y_te.to_numpy(), 0.5))  # -7070  (contactar todos)`;

const G_E6 = `from sklearn.ensemble import HistGradientBoostingClassifier

for C in [0.001, 0.01, 0.1, 1]:
    ap = cross_val_score(make_pipeline(StandardScaler(), LogisticRegression(C=C, max_iter=2000)),
                         X_tr, y_tr, cv=cv, scoring="average_precision").mean()
    print(C, round(ap, 3))
# 0.001 0.169
# 0.01 0.17
# 0.1 0.167
# 1 0.162
boosting = HistGradientBoostingClassifier(learning_rate=0.05, max_depth=3, random_state=0)
print(round(cross_val_score(boosting, X_tr, y_tr, cv=cv, scoring="average_precision").mean(), 3))   # 0.184
for nome, m in [("logística", logistica), ("boosting", boosting)]:
    p = m.fit(X_tr, y_tr).predict_proba(X_te)[:, 1]
    print(nome, round(roc_auc_score(y_te, p), 3), round(average_precision_score(y_te, p), 3))
# logística 0.752 0.151
# boosting 0.756 0.149`;

const G_E8 = `import shap

prep_arvore = ColumnTransformer([
    ("num", "passthrough", numericas),
    ("cat", Pipeline([("imputar", SimpleImputer(strategy="most_frequent")),
                      ("codificar", OneHotEncoder(handle_unknown="ignore", sparse_output=False))]), categoricas)])
arvores = Pipeline([("prep", prep_arvore),
                    ("modelo", HistGradientBoostingClassifier(learning_rate=0.03, max_depth=3, random_state=0))])
X_ti = ti[numericas + categoricas]
print(round(cross_val_score(arvores, X_ti, y, cv=cv, scoring="roc_auc").mean(), 3))   # 0.864
arvores.fit(X_ti, y)
X_prep = pd.DataFrame(arvores.named_steps["prep"].transform(X_ti),
                      columns=arvores.named_steps["prep"].get_feature_names_out())
valores = shap.TreeExplainer(arvores.named_steps["modelo"])(X_prep)
print(round(float(valores.base_values[0]), 3))          # -0.538
print(pd.Series(np.abs(valores.values).mean(axis=0), index=X_prep.columns).sort_values(ascending=False).round(3).head(5).to_string())
# cat__sex_female    1.125
# cat__pclass_3      0.439
# num__age           0.204
# num__fare          0.182
# cat__pclass_1      0.143
for i in [2, 1]:
    contrib = pd.Series(valores.values[i], index=X_prep.columns).sort_values(key=abs, ascending=False).round(2).head(3)
    print(i, round(arvores.predict_proba(X_ti.iloc[[i]])[0, 1], 3), contrib.to_dict())
# 2 0.533 {'cat__sex_female': 1.42, 'cat__pclass_3': -0.72, 'num__fare': 0.15}
# 1 0.937 {'cat__sex_female': 1.8, 'cat__pclass_3': 1.01, 'cat__pclass_1': 0.21}
shap.plots.beeswarm(valores)`;

const G_E9 = `from sklearn.metrics import root_mean_squared_error

print(round(Xb["temp"].corr(Xb["atemp"]), 3))          # 0.992
for nome, cols in [("com atemp", list(Xb.columns)), ("sem atemp", [c for c in Xb.columns if c != "atemp"])]:
    gb = HistGradientBoostingRegressor(random_state=0).fit(Xb.iloc[treino][cols], yb.iloc[treino])
    imp = permutation_importance(gb, Xb.iloc[teste][cols], yb.iloc[teste], n_repeats=10, random_state=0,
                                 scoring="neg_root_mean_squared_error")
    imp = pd.Series(imp.importances_mean, index=cols)
    print(nome, round(root_mean_squared_error(yb.iloc[teste], gb.predict(Xb.iloc[teste][cols])), 1),
          round(imp["temp"], 1), round(imp.get("atemp", float("nan")), 1))
# com atemp 35.8 12.8 6.1
# sem atemp 36.0 27.9 nan`;

const G_E10 = `from sklearn.feature_selection import SelectKBest, f_classif

def avaliacao_honesta(X, y):
    pipe = Pipeline([("escalar", StandardScaler()), ("escolher", SelectKBest(f_classif, k=20)),
                     ("modelo", LogisticRegression(max_iter=2000))])
    procura = GridSearchCV(pipe, {"modelo__C": np.logspace(-3, 2, 12)}, cv=5, scoring="roc_auc")
    return cross_val_score(procura, X, y, cv=StratifiedKFold(5, shuffle=True, random_state=1), scoring="roc_auc").mean()

print(round(avaliacao_com_fugas(X_ca, y_ca), 3), round(avaliacao_honesta(X_ca, y_ca), 3))   # 0.747 0.742
X_peq, _, y_peq, _ = train_test_split(X_ca, y_ca, train_size=1000, stratify=y_ca, random_state=0)
print(round(avaliacao_com_fugas(X_peq, y_peq), 3), round(avaliacao_honesta(X_peq, y_peq), 3))   # 0.73 0.662`;

const G_P13 = `from sklearn.linear_model import LinearRegression
from sklearn.model_selection import KFold

wg = pd.read_csv(URL + "Wage.csv")
num_w = ["age", "year"]
cat_w = ["maritl", "education", "jobclass", "health", "health_ins"]
y_w = wg["wage"]
def pipeline_salario(modelo, extra=[]):                                          # (a)
    prep = ColumnTransformer([("num", StandardScaler(), num_w + extra),
                              ("cat", OneHotEncoder(handle_unknown="ignore"), cat_w)])
    return Pipeline([("prep", prep), ("modelo", modelo)])
cv_w = KFold(5, shuffle=True, random_state=0)
print(round(y_w.std(), 1))                                                       # 41.7

r = -cross_val_score(pipeline_salario(HistGradientBoostingRegressor(random_state=0), ["logwage"]),   # (b)
                     wg[num_w + cat_w + ["logwage"]], y_w, cv=cv_w, scoring="neg_root_mean_squared_error").mean()
print(round(r, 2))                                                                # 1.93

X_w = wg[num_w + cat_w]                                                          # (c)
for nome, m in [("linear", LinearRegression()), ("boosting", HistGradientBoostingRegressor(random_state=0))]:
    r = -cross_val_score(pipeline_salario(m), X_w, y_w, cv=cv_w, scoring="neg_root_mean_squared_error")
    print(nome, round(r.mean(), 1))
# linear 34.0
# boosting 34.9

antes = wg["year"] <= 2007                                                       # (d)
for nome, m in [("linear", LinearRegression()), ("boosting", HistGradientBoostingRegressor(random_state=0))]:
    p = pipeline_salario(m).fit(X_w[antes], y_w[antes])
    print(nome, round(root_mean_squared_error(y_w[~antes], p.predict(X_w[~antes])), 1))
# linear 34.6
# boosting 36.1

final = pipeline_salario(LinearRegression()).fit(X_w[antes], y_w[antes])         # (e)
imp = permutation_importance(final, X_w[~antes], y_w[~antes], n_repeats=20, random_state=0,
                             scoring="neg_root_mean_squared_error")
print(pd.Series(imp.importances_mean, index=X_w.columns).sort_values(ascending=False).round(2).head(3).to_string())
# education     7.90
# health_ins    2.07
# maritl        1.56`;

const APO_CODE = `preparar = ColumnTransformer([
    ("num", Pipeline([("imputar", SimpleImputer(strategy="median")), ("escalar", StandardScaler())]), numericas),
    ("cat", Pipeline([("imputar", SimpleImputer(strategy="most_frequent")),
                      ("codificar", OneHotEncoder(handle_unknown="ignore"))]), categoricas)])
modelo = Pipeline([("prep", preparar), ("modelo", LogisticRegression(max_iter=1000))])

procura = GridSearchCV(modelo, {"modelo__C": [0.1, 1, 10]}, cv=cv, scoring="roc_auc")
aninhada = cross_val_score(procura, X, y, cv=externo, scoring="roc_auc")      # avaliação honesta

cross_val_score(modelo, X, y, cv=GroupKFold(5), groups=cliente)               # grupos
cross_val_score(modelo, X, y, cv=TimeSeriesSplit(5))                          # tempo (dados ordenados)

p_oof = cross_val_predict(modelo, X, y, cv=cv, method="predict_proba")[:, 1]   # para escolher o limiar
explicador = shap.TreeExplainer(modelo_de_arvores); valores = explicador(X_teste)
shap.plots.waterfall(valores[0]); shap.plots.beeswarm(valores)
joblib.dump(modelo, "modelo.joblib")`;

const E10_CODE = `def avaliacao_com_fugas(X, y):
    Z = StandardScaler().fit_transform(X)
    Z = SelectKBest(f_classif, k=20).fit_transform(Z, y)
    procura = GridSearchCV(LogisticRegression(max_iter=2000), {"C": np.logspace(-3, 2, 12)},
                           cv=5, scoring="roc_auc").fit(Z, y)
    return procura.best_score_`;

// ---------------------------------------------------------------- resultados reais do gabarito

const O_E2 = `base 0.796 0.847
família e log da tarifa 0.788 0.851
indicador de falta e convés 0.797 0.846`;

const O_E3 = `{'svc__C': np.float64(100.0), 'svc__gamma': np.float64(0.001)} 0.981
[0.982 0.991 0.974 0.956 0.973] 0.975
{'svc__C': np.float64(10.323260351976563), 'svc__gamma': np.float64(0.05301709347576828)} 0.968`;

const O_E4 = `sem a coluna 0.796 0.847
média do alvo calculada antes 0.863 0.935
TargetEncoder no pipeline 0.799 0.846`;

const O_E5 = `0.1 3900
0.5 4 1 60
0.1 265 43 1650
-7070`;

const O_E6 = `0.001 0.169
0.01 0.17
0.1 0.167
1 0.162
0.184
logística 0.752 0.151
boosting 0.756 0.149`;

const O_E8 = `0.864
-0.538
cat__sex_female    1.125
cat__pclass_3      0.439
num__age           0.204
num__fare          0.182
cat__pclass_1      0.143
2 0.533 {'cat__sex_female': 1.42, 'cat__pclass_3': -0.72, 'num__fare': 0.15}
1 0.937 {'cat__sex_female': 1.8, 'cat__pclass_3': 1.01, 'cat__pclass_1': 0.21}`;

const O_E9 = `0.992
com atemp 35.8 12.8 6.1
sem atemp 36.0 27.9 nan`;

const O_E10 = `0.747 0.742
0.73 0.662`;

const O_P13 = `41.7
1.93
linear 34.0
boosting 34.9
linear 34.6
boosting 36.1
education     7.90
health_ins    2.07
maritl        1.56`;


// ---------------------------------------------------------------- resultados reais da aula (iguais aos comentários do código)

const O_TITANIC = `(891, 15) 0.384
{'age': 177, 'embarked': 2, 'deck': 688}
0.796 0.847`;
const O_FIT = `['num__age' 'num__fare' 'num__sibsp' 'num__parch' 'cat__pclass_1'
 'cat__pclass_2' 'cat__pclass_3' 'cat__sex_female' 'cat__sex_male'
 'cat__embarked_C' 'cat__embarked_Q' 'cat__embarked_S']
[0.856]`;
const O_GRID = `HistGradientBoostingClassifier(random_state=0) 0.863
[0.847, 0.847, 0.846, 0.863, 0.862, 0.863, 0.861]`;
const O_NESTED = `0.58 0.55`;
const O_ALIVE = `1.0`;
const O_GENES = `1.0 0.42`;
const O_BIKE = `KFold aleatório [29.6 30.9 31.  28.9 33.8] 30.9
GroupKFold por dia [37.  33.2 37.  33.7 34. ] 35.0
TimeSeriesSplit [69.6 56.5 49.6 46.6 54.9] 55.4
3.0`;
const O_CARAVAN = `(5822, 85) 0.06
0.939 0.01`;
const O_LIMIAR = `0.5 4 0.25 0.01
0.2 47 0.191 0.087
0.1 265 0.162 0.413
0.06 566 0.124 0.673`;
const O_PESADO = `0.128 0.635
normal 0.752 0.151 0.059 0.054
balanced 0.744 0.146 0.391 0.192`;
const O_GANHOS = `174 30 104
0.29 2.9`;
const O_PERM = `hr            121.8
workingday     37.2
day            16.9
temp           12.8
hum            12.5`;
const O_SHAP = `(1710, 24) 144.5
True
hr            75.9
temp          18.2
day           15.3
workingday    14.4
hum           12.4`;

// ---------------------------------------------------------------- ligações


const T_COMPOSE = "https://scikit-learn.org/stable/modules/compose.html";
const T_KAPOOR = "https://doi.org/10.1016/j.patter.2023.100804";
const T_MOLNAR = "https://christophm.github.io/interpretable-ml-book/";
const T_MOOC = "https://inria.github.io/scikit-learn-mooc/";

export const M11: ModuleContent = {
  id: "M11",
  duration: "2 semanas, cerca de 6 horas",
  intro:
    "No fim deste módulo deve saber montar pipelines do scikit-learn que preparam os dados e treinam o modelo num só objeto, escolher parâmetros sem enganar a avaliação, reconhecer e evitar fugas de dados, trabalhar com classes muito desequilibradas e explicar as previsões de um modelo com importância por permutação, dependência parcial e SHAP.",
  outcomes: [
    "Montar pipelines do scikit-learn que preparam os dados e treinam o modelo num só objeto",
    "Escolher parâmetros sem enganar a avaliação",
    "Reconhecer e evitar fugas de dados",
    "Trabalhar com classes muito desequilibradas",
    "Explicar as previsões de um modelo com importância por permutação, dependência parcial e SHAP",
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
        { id: "t2", text: "Ler o guia do scikit-learn \"Pipelines and composite estimators\"", link: { kind: "url", href: T_COMPOSE } },
      ],
    },
    {
      id: "w1s2",
      label: "Semana 1 · sessão 2",
      minutes: 90,
      tasks: [
        { id: "t1", text: "Ler a secção 3", link: { kind: "section", id: "s3" } },
        { id: "t2", text: "Ler Kapoor & Narayanan (2023)", link: { kind: "url", href: T_KAPOOR } },
        { id: "t3", text: "Exercícios 1 a 4", link: { kind: "tab", tab: "exercicios" } },
      ],
    },
    {
      id: "w2s1",
      label: "Semana 2 · sessão 1",
      minutes: 90,
      tasks: [
        { id: "t1", text: "Ler a secção 4", link: { kind: "section", id: "s4" } },
        { id: "t2", text: "Exercícios 5 a 7", link: { kind: "tab", tab: "exercicios" } },
      ],
    },
    {
      id: "w2s2",
      label: "Semana 2 · sessão 2",
      minutes: 90,
      tasks: [
        { id: "t1", text: "Ler a secção 5", link: { kind: "section", id: "s5" } },
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
      title: "Pipelines: o pré-processamento dentro do modelo",
      minutes: 30,
      blocks: [
        {
          t: "callout",
          tone: "info",
          title: "Como estudar este módulo",
          text: "Os módulos anteriores ensinaram modelos. Este ensina a usá-los sem se enganar. A maior parte dos projetos de machine learning que falham não falham por causa do algoritmo, mas por causa de uma avaliação otimista: uma fuga de dados, uma divisão mal feita, uma métrica que esconde o problema. É também o módulo que fecha a Fase 2 e prepara o mini-projeto.",
        },
        {
          t: "callout",
          tone: "info",
          title: "O código deste módulo",
          text: "Além do scikit-learn, usa-se a biblioteca SHAP, que já vem no Colab (localmente: `pip install shap`). O código foi testado com scikit-learn 1.9 e shap 0.53. Os dados são o Titanic (do repositório do seaborn, como os pinguins do M10) e dois conjuntos do ISLP: `Bikeshare`, que já conhece, e `Caravan`, novo.",
        },
        {
          t: "p",
          text: "Até aqui, os dados chegaram quase sempre limpos: sem valores em falta, com as categorias já transformadas por `pd.get_dummies`. Os dados reais têm buracos, categorias novas que aparecem depois do treino e variáveis em escalas diferentes. Tratar disso fora do modelo cria três problemas: é fácil aplicar transformações diferentes no treino e em produção, é fácil deixar informação do teste entrar no treino ([secção 3](#s3)), e no fim há vários objetos para guardar em vez de um.",
        },
        {
          t: "p",
          text: "A solução do scikit-learn é o **pipeline**: uma sequência de passos que se comporta como um só modelo, com `fit`, `predict` e tudo o resto (Pedregosa et al., 2011; Buitinck et al., 2013).",
        },
        { t: "h3", text: "Os dados: o Titanic" },
        {
          t: "p",
          text: "O conjunto do Titanic tem os 891 passageiros da lista de treino do concurso do Kaggle, com classe, sexo, idade, tarifa, número de familiares a bordo e porto de embarque. 38,4% sobreviveram. Tem valores em falta: 177 idades, 2 portos de embarque e 688 conveses (`deck`).",
        },
        { t: "h3", text: "Preparar colunas diferentes de maneiras diferentes" },
        { t: "p", text: "O `ColumnTransformer` aplica um pré-processamento a cada grupo de colunas e junta o resultado:" },
        { t: "code", title: "Pipeline com ColumnTransformer", code: C_TITANIC, output: O_TITANIC },
        {
          t: "p",
          text: "O pipeline tem dois passos, e o primeiro tem dois ramos. Nas numéricas, as idades em falta passam a ser a mediana e depois padroniza-se. Nas categóricas, os portos em falta passam a ser o mais frequente e depois cada categoria vira uma coluna de zeros e uns (o one-hot do M8). A linha de base, prever sempre \"não sobreviveu\", acerta 61,6%; o modelo acerta 79,6%.",
        },
        {
          t: "p",
          text: "O essencial é o que acontece dentro do `cross_validate`: em cada divisão, a mediana das idades, as médias e desvios padrão da padronização e a lista de categorias são calculados **só com a parte de treino**. A parte de teste é transformada com esses valores, como seriam os passageiros novos.",
        },
        { t: "h3", text: "O modelo completo" },
        { t: "p", text: "Depois de treinado, o pipeline recebe dados em bruto, com buracos e texto, e faz tudo sozinho:" },
        { t: "code", title: "Treinar e prever com dados em bruto", code: C_FIT, output: O_FIT },
        {
          t: "p",
          text: "A passageira não tem porto de embarque, e o pipeline trata disso como aprendeu no treino. Para usar o modelo noutro programa, guarda-se um único ficheiro com `joblib.dump(modelo, \"modelo.joblib\")` e carrega-se com `joblib.load`. É o que a Fase 5 (M25) vai pôr em produção.",
        },
        { t: "h3", text: "Peças úteis" },
        {
          t: "table",
          head: ["Peça", "Para quê"],
          rows: [
            ["`SimpleImputer(strategy=...)`", "Preencher valores em falta com a média, a mediana, o mais frequente ou uma constante"],
            ["`SimpleImputer(add_indicator=True)`", "Juntar uma coluna 0/1 a dizer onde faltava o valor; às vezes faltar é informação"],
            ["`OneHotEncoder(handle_unknown=\"ignore\")`", "Categorias em colunas 0/1; uma categoria nunca vista fica com tudo a zero em vez de dar erro"],
            ["`OrdinalEncoder`", "Categorias em números inteiros; serve para árvores"],
            ["`TargetEncoder`", "Cada categoria vira a média do alvo nessa categoria, calculada com validação cruzada interna; útil com centenas de categorias"],
            ["`FunctionTransformer(np.log1p)`", "Aplicar uma função qualquer, como o logaritmo de valores com cauda longa"],
          ],
        },
        {
          t: "p",
          text: "Criar variáveis novas a partir do conhecimento do problema (*feature engineering*) costuma valer mais do que trocar de algoritmo. Nem sempre resulta: no Titanic, juntar o tamanho da família e o logaritmo da tarifa não mudou quase nada (exercício 2). Experimenta-se, e a validação cruzada decide.",
        },
        {
          t: "check",
          id: "qc1",
          q: "Num `cross_validate` com o pipeline da aula, com que dados se calcula a mediana que preenche as idades em falta da parte de teste de cada divisão?",
          options: [
            "Com os 891 passageiros, antes de dividir",
            "Com a parte de teste dessa divisão",
            "Só com a parte de treino dessa divisão",
            "Com a mediana do conjunto de treino do Kaggle, fixada à mão",
          ],
          answer: 2,
          explain:
            "Em cada divisão, a mediana das idades, as médias e desvios padrão e a lista de categorias são calculados só com a parte de treino; a parte de teste é transformada com esses valores, como seriam os passageiros novos.",
        },
      ],
    },
    {
      id: "s2",
      num: 2,
      title: "Escolher parâmetros sem se enganar",
      minutes: 30,
      blocks: [
        { t: "h3", text: "Procurar dentro do pipeline" },
        {
          t: "p",
          text: "O `GridSearchCV` do M9 funciona com pipelines inteiros. Os parâmetros chamam-se pelo caminho até eles, com dois traços baixos: `modelo__C` é o C do passo `modelo`; `prep__num__imputar__strategy` é a estratégia do imputador das numéricas. Até o próprio modelo pode ser um parâmetro, o que permite comparar famílias diferentes numa só procura:",
        },
        { t: "code", title: "GridSearchCV com dois modelos", code: C_GRID, output: O_GRID },
        {
          t: "p",
          text: "As três logísticas dão AUC de 0,847; os quatro boostings, entre 0,861 e 0,863. O boosting ganha porque apanha interações que a logística não vê sem ajuda, como a de sexo com classe: as mulheres da terceira classe sobreviveram muito menos do que as da primeira. Depois do `fit`, `grelha.best_estimator_` é o pipeline vencedor, retreinado com todos os dados.",
        },
        {
          t: "p",
          text: "Quando há muitos parâmetros, a grelha completa explode: 5 valores para cada um de 6 parâmetros são 15 625 combinações. O `RandomizedSearchCV` experimenta um número fixo de combinações sorteadas, e Bergstra e Bengio (2012) mostraram que, com o mesmo orçamento, isso costuma ser melhor do que a grelha, porque normalmente só alguns parâmetros importam e o sorteio experimenta mais valores diferentes de cada um. Bibliotecas como o Optuna fazem procuras ainda mais inteligentes.",
        },
        { t: "h3", text: "O vencedor tem sorte" },
        {
          t: "p",
          text: "Há um problema subtil. O `best_score_` é a melhor de várias médias de validação cruzada, e o melhor de muitos candidatos beneficia sempre de alguma sorte: a mesma validação que escolheu o vencedor não pode, depois, avaliá-lo de forma isenta. Um exemplo extremo, com dados de puro ruído, onde a exatidão verdadeira de qualquer modelo é 50%:",
        },
        { t: "code", title: "Validação cruzada aninhada em dados de ruído", code: C_NESTED, output: O_NESTED },
        {
          t: "p",
          text: "O `best_score_` promete 58% em dados onde não há nada para aprender. A **validação cruzada aninhada** resolve isto: um ciclo exterior separa partes de teste; dentro de cada parte de treino, um ciclo interior faz a procura completa; o modelo escolhido é avaliado na parte de teste exterior, que a procura nunca viu (Varma & Simon, 2006; Cawley & Talbot, 2010). No scikit-learn basta passar o `GridSearchCV` ao `cross_val_score`, como acima. Dá 55%, mais perto da verdade.",
        },
        {
          t: "p",
          text: "Com dados reais e uma diferença real, o otimismo é menor mas existe: nos dados de cancro da mama do scikit-learn, a mesma procura promete 98,1% e a validação aninhada dá 97,5% (exercício 3). A regra prática:",
        },
        {
          t: "list",
          items: [
            "Para **escolher** o modelo e os parâmetros, use a validação cruzada (ou o `GridSearchCV`).",
            "Para **reportar** quanto vale o processo todo, use a validação aninhada ou um conjunto de teste guardado desde o início e usado uma só vez, como no M7.",
            "Quantos mais candidatos se experimentam, e quanto menos dados há, maior o otimismo do vencedor.",
          ],
        },
        {
          t: "check",
          id: "qc2",
          q: "Nos dados de puro ruído, o `best_score_` da grelha de 36 combinações promete 58%. Porque é que este número é otimista?",
          options: [
            "Porque é a melhor de 36 médias de validação cruzada, e o melhor de muitos candidatos beneficia sempre de alguma sorte",
            "Porque o SVC sobreajusta sempre os dados de treino",
            "Porque a validação interior usa `shuffle=True`",
            "Porque as duas classes do ruído estão desequilibradas",
          ],
          answer: 0,
          explain:
            "A mesma validação que escolheu o vencedor não o pode avaliar de forma isenta. A validação aninhada avalia o processo todo em partes que a procura nunca viu e dá 55%, mais perto dos 50% verdadeiros.",
        },
      ],
    },
    {
      id: "s3",
      num: 3,
      title: "Fugas de dados",
      minutes: 40,
      blocks: [
        {
          t: "p",
          text: "Há uma **fuga de dados** (*data leakage*) quando o modelo usa, no treino ou na avaliação, informação que não vai ter quando for usado a sério (Kaufman, Rosset, Perlich & Stitelman, 2012). O resultado é sempre o mesmo: uma avaliação brilhante e um modelo que falha em produção. Não é um problema de principiantes: Kapoor e Narayanan (2023) encontraram fugas em 294 artigos científicos de 17 áreas que usavam machine learning, muitas vezes com conclusões que não sobreviviam à correção.",
        },
        { t: "p", text: "Há três famílias, todas com exemplos neste curso." },
        { t: "h3", text: "1. Variáveis que trazem a resposta" },
        { t: "p", text: "O conjunto do Titanic tem uma coluna `alive`, com \"yes\" ou \"no\". É a resposta escrita de outra maneira:" },
        { t: "code", title: "Uma variável que é a resposta", code: C_ALIVE, output: O_ALIVE },
        {
          t: "p",
          text: "100% de exatidão é o sinal mais claro de todos. Mas a maior parte das fugas destas é menos óbvia: no `Bikeshare`, as colunas `casual` e `registered` somam o alvo (o RMSE cai de 35 para 3, como se vê mais abaixo); num modelo de cancelamento de clientes, uma coluna \"data do último contacto do serviço de retenção\" só existe para quem já quis cancelar; num modelo de fraude, \"conta bloqueada\" é consequência da fraude, não causa. A pergunta a fazer a cada variável é: **no momento em que vou fazer a previsão, já sei isto?**",
        },
        { t: "h3", text: "2. Preparar ou escolher com os dados todos" },
        {
          t: "p",
          text: "Qualquer passo que aprende com os dados (imputar, padronizar, escolher variáveis, reduzir dimensões) tem de aprender só com a parte de treino de cada divisão. O caso mais grave é a seleção de variáveis, e o exemplo clássico vem de Hastie, Tibshirani e Friedman (2009, sec. 7.10.2): 50 doentes, 5000 \"genes\" de puro ruído, e um rótulo que não depende de nada.",
        },
        { t: "code", title: "Escolher variáveis antes e dentro da validação", code: C_GENES, output: O_GENES },
        {
          t: "p",
          text: "Escolher as 100 variáveis mais associadas ao rótulo com todos os dados, e só depois validar, dá **100%** em ruído puro: entre 5000 variáveis ao acaso há sempre 100 que, por sorte, separam bem estes 50 doentes, e a validação já não tem como o descobrir. Com a seleção dentro do pipeline, refeita em cada divisão, o resultado é o que deve ser: perto de 50% (aqui 42%; com outras sementes anda à volta de 49%). Com padronização ou imputação fora do pipeline o efeito costuma ser pequeno, mas não há razão para arriscar: com o pipeline, fica certo por construção.",
        },
        { t: "h3", text: "3. Dividir mal" },
        {
          t: "p",
          text: "A validação tem de imitar a forma como o modelo vai ser usado. Se as linhas não são independentes, uma divisão ao acaso põe informação \"do futuro\" ou \"do mesmo grupo\" no treino.",
        },
        {
          t: "figure",
          src: "img/01-esquemas-validacao.png",
          alt: "Três esquemas de validação cruzada: aleatório, por grupos e por tempo",
        },
        {
          t: "list",
          items: [
            "**`KFold` aleatório**: serve quando as linhas são independentes.",
            "**`GroupKFold`**: quando há grupos de linhas parecidas (as horas do mesmo dia, as compras do mesmo cliente, as fotografias do mesmo doente), cada grupo fica inteiro de um só lado. É o que se usou no M9.",
            "**`TimeSeriesSplit`**: quando o modelo vai prever o futuro, treina-se sempre no passado e testa-se no período seguinte.",
          ],
        },
        {
          t: "widget",
          name: "m11-validacao",
          caption:
            "Os esquemas da figura, para outros n e k. As divisões são as mesmas do scikit-learn 1.9 (com shuffle=True, as do random_state escolhido); com n = 40, KFold(5, shuffle=True, random_state=0) é a primeira faixa da figura. As linhas são os primeiros n passageiros do Titanic, para ver o efeito da estratificação.",
        },
        { t: "p", text: "No `Bikeshare`, os três esquemas dão respostas muito diferentes para o mesmo modelo:" },
        { t: "code", title: "Três validações no Bikeshare", code: C_BIKE, output: O_BIKE },
        {
          t: "p",
          text: "(O `.astype(float)` passa todas as colunas a decimais; vai ser preciso na [secção 5](#s5).) Qual é o número certo? Depende do uso. Se o modelo serve para preencher horas em falta em dias que já se conhecem em parte, 31 é honesto. Se serve para prever dias inteiros que não se viram, 35. Se serve para prever o mês que vem, a resposta é 55: com um só ano de dados, o modelo nunca viu o mês seguinte e tem de extrapolar a sazonalidade e o crescimento do sistema. Escolher a validação é decidir para que serve o modelo.",
        },
        { t: "h3", text: "Uma lista de verificação" },
        {
          t: "list",
          ordered: true,
          items: [
            "Para cada variável: já a conheço no momento da previsão?",
            "Todo o pré-processamento que aprende com os dados está dentro do pipeline?",
            "As linhas são independentes? Se não, que grupos ou que ordem temporal tenho de respeitar?",
            "Há linhas duplicadas, ou quase, entre treino e teste?",
            "O resultado é bom demais para ser verdade? Então provavelmente não é: vá à procura da fuga antes de celebrar.",
          ],
        },
        {
          t: "check",
          id: "qc3",
          q: "O modelo de boosting do `Bikeshare` vai servir para prever a procura do mês que vem. Que validação da aula dá a estimativa honesta do erro?",
          options: [
            "`KFold` aleatório: RMSE de 31",
            "`GroupKFold` por dia: RMSE de 35",
            "Qualquer uma: as três medem o mesmo modelo",
            "`TimeSeriesSplit`: RMSE de 55",
          ],
          answer: 3,
          explain:
            "Para prever o futuro, treina-se sempre no passado e testa-se no período seguinte. Com um só ano de dados, o modelo nunca viu o mês seguinte e tem de extrapolar: 55. Escolher a validação é decidir para que serve o modelo.",
        },
      ],
    },
    {
      id: "s4",
      num: 4,
      title: "Classes desequilibradas",
      minutes: 40,
      blocks: [
        {
          t: "p",
          text: "Muitos problemas de negócio têm uma classe rara: clientes que vão cancelar, transações fraudulentas, visitantes que vão comprar. O M7 já mostrou o primeiro sintoma no `Default`: com 3% de incumprimento, prever sempre \"não\" acerta 97%.",
        },
        { t: "h3", text: "Os dados: quem compra um seguro de caravana?" },
        {
          t: "p",
          text: "O `Caravan` (James et al., 2023) vem de um concurso de 2000, o CoIL Challenge, com dados de uma seguradora holandesa (van der Putten & van Someren, 2004): 5822 clientes, 85 variáveis sociodemográficas (do código postal) e de produtos que já têm, e se compraram um seguro de caravana. Só 6% compraram. É um problema de marketing típico: a quem enviar a campanha?",
        },
        { t: "code", title: "Caravan: exatidão e revocação", code: C_CARAVAN, output: O_CARAVAN },
        {
          t: "p",
          text: "(O C = 0,01, uma regularização forte, foi escolhido por validação cruzada: com 85 variáveis e poucos compradores, ajuda; ver exercício 6.) Exatidão de 93,9% e revocação de 1%: o modelo só encontra um dos 104 compradores do teste. Com o limiar de 0,5, quase ninguém tem probabilidade suficiente para ser \"comprador\". Isto não quer dizer que o modelo seja inútil, só que a exatidão e o limiar de 0,5 são as ferramentas erradas.",
        },
        { t: "h3", text: "Primeira solução: mudar o limiar" },
        { t: "code", title: "Quatro limiares", code: C_LIMIAR, output: O_LIMIAR },
        {
          t: "p",
          text: "As colunas são: limiar, clientes marcados, precisão e revocação. Com um limiar de 0,06 (a proporção de base), marca-se 566 clientes, encontra-se dois terços dos compradores, e um em cada oito contactados compra, o dobro dos 6% ao acaso. O limiar certo vem dos custos, como no M7: quanto custa contactar um cliente e quanto vale uma venda.",
        },
        { t: "h3", text: "Segunda solução: pesar as classes" },
        {
          t: "p",
          text: "Muitos modelos aceitam `class_weight=\"balanced\"`, que dá a cada exemplo da classe rara um peso maior na perda, aqui cerca de 16 vezes:",
        },
        { t: "code", title: "class_weight=\"balanced\"", code: C_PESADO, output: O_PESADO },
        {
          t: "p",
          text: "Com o limiar de 0,5, o modelo pesado dá quase o mesmo que o normal com limiar de 0,06 (precisão 0,128, revocação 0,635). A ordenação dos clientes é praticamente a mesma (AUC de 0,744 contra 0,752; AP de 0,146 contra 0,151): pesar as classes é, no essencial, outra forma de mexer no limiar. Mas tem um custo escondido. A probabilidade média prevista passa de 5,9%, igual à realidade, para 39%: as probabilidades deixam de querer dizer o que dizem. O **erro de Brier** (a média de (p − y)², menor é melhor) triplica. Se as probabilidades vão ser usadas como probabilidades (para calcular o valor esperado de uma campanha, por exemplo), isto é um problema sério, e van den Goorbergh et al. (2022) mostraram-no em modelos médicos. O mesmo vale para reamostrar os dados, como o SMOTE (Chawla et al., 2002), que cria exemplos sintéticos da classe rara e está na biblioteca `imbalanced-learn`.",
        },
        {
          t: "p",
          text: "A recomendação prática: treine o modelo normalmente, avalie-o com métricas que não dependem do limiar e escolha o limiar pelo custo ou pela capacidade. Use pesos ou reamostragem só se a validação mostrar que melhoram a ordenação, o que com modelos fortes é raro.",
        },
        { t: "h3", text: "As métricas certas" },
        {
          t: "p",
          text: "Com classes raras, a curva ROC pode parecer boa enquanto a precisão é má, porque há muitos negativos a diluir os falsos positivos. A **curva de precisão e revocação** e a sua área, a **precisão média** (AP, M7), olham só para a classe rara; o valor ao acaso é a proporção de base (0,06), por isso uma AP de 0,151 é 2,5 vezes o acaso. Em marketing, a forma mais clara de mostrar o valor é a **curva de ganhos**: ordenam-se os clientes pela probabilidade e vê-se que fração dos compradores se apanha contactando os primeiros x%.",
        },
        { t: "code", title: "Contactar 10% dos clientes", code: C_GANHOS, output: O_GANHOS },
        {
          t: "figure",
          src: "img/02-caravan-pr-e-ganhos.png",
          alt: "Curva de precisão e revocação e curva de ganhos no Caravan",
        },
        {
          t: "p",
          text: "Contactando os 10% de clientes com maior probabilidade, apanha-se 29% dos compradores. Entre os contactados, 17% compram, contra 6% ao acaso: um **lift** de 2,9. É esta frase, e não a exatidão, que se leva à equipa de marketing.",
        },
        {
          t: "widget",
          name: "m11-limiar",
          caption:
            "As probabilidades reais que a regressão logística da aula dá aos 1747 clientes do teste. Mude o limiar ou o número de contactos: a precisão e a revocação mudam, as curvas não. Os custos são um exemplo para experimentar; o exercício 5 faz a conta a sério, com o limiar escolhido no treino.",
        },
        {
          t: "check",
          id: "qc4",
          q: "No `Caravan`, com o limiar de 0,1, marcam-se 265 clientes, com precisão de 0,162. Quantos compradores se apanham, e qual é o lift, com uma proporção de base de 0,06?",
          options: [
            "43 compradores e um lift de cerca de 1,6",
            "43 compradores e um lift de cerca de 2,7",
            "16 compradores e um lift de cerca de 2,7",
            "104 compradores e um lift de cerca de 4,1",
          ],
          answer: 1,
          explain:
            "265 × 0,162 ≈ 43 compradores (é a revocação de 0,413 dos 104). O lift é a precisão a dividir pela proporção de base: 0,162 / 0,06 ≈ 2,7.",
        },
      ],
    },
    {
      id: "s5",
      num: 5,
      title: "Interpretar modelos: importância, dependência parcial e SHAP",
      minutes: 45,
      blocks: [
        {
          t: "p",
          text: "Um modelo de boosting com centenas de árvores não se lê como uma regressão linear. Mas há boas razões para querer perceber o que ele faz: confirmar que aprendeu coisas sensatas e não uma fuga, explicar uma decisão a um cliente ou a um regulador, e descobrir o que move o resultado. Há três ferramentas que respondem a três perguntas diferentes.",
        },
        { t: "h3", text: "Que variáveis pesam? Importância por permutação" },
        { t: "p", text: "A ferramenta do M9, agora no `Bikeshare`, com um modelo treinado em 80% dos dias:" },
        { t: "code", title: "Importância por permutação", code: C_PERM, output: O_PERM },
        {
          t: "p",
          text: "Baralhar a hora faz o RMSE subir 122 bicicletas; o tipo de dia, 37. É uma resposta global, para o modelo todo, e não diz em que sentido cada variável atua.",
        },
        { t: "h3", text: "Como é que uma variável muda a previsão? Dependência parcial" },
        {
          t: "p",
          text: "O **gráfico de dependência parcial** (Friedman, 2001) responde à pergunta \"se eu mudar só esta variável, o que acontece à previsão, em média?\". Para cada valor da hora, põe-se essa hora em todas as linhas do conjunto, preveem-se as bicicletas e faz-se a média. As curvas **ICE** (Goldstein, Kapelner, Bleich & Pitkin, 2015) fazem o mesmo, mas uma linha de cada vez, sem a média:",
        },
        { t: "code", title: "Dependência parcial e curvas ICE", code: C_PDP },
        {
          t: "figure",
          src: "img/03-dependencia-parcial.png",
          alt: "Dependência parcial e curvas ICE da hora e da temperatura",
        },
        {
          t: "p",
          text: "A média (vermelho) mostra os picos das 8h e das 17h, e a temperatura a fazer subir a procura até cerca de metade da escala, ficando depois estável. As curvas individuais da hora mostram mais: separam-se em duas famílias, uma com os dois picos (dias úteis) e outra com uma bossa larga a meio do dia (fins de semana). É a interação do M9, encontrada sem ninguém a procurar; a média sozinha escondia-a. Era por isto que o `Xb` precisava de ser decimal: o scikit-learn recusa calcular estes gráficos com colunas inteiras.",
        },
        { t: "h3", text: "Porque é que o modelo previu isto? SHAP" },
        {
          t: "p",
          text: "O **SHAP** (Lundberg & Lee, 2017) explica cada previsão individual. Parte do valor médio das previsões e reparte a diferença entre essa média e a previsão pelas variáveis, usando os valores de Shapley da teoria dos jogos (Shapley, 1953): a contribuição de cada variável é a média do que ela acrescenta, em todas as ordens possíveis de juntar as variáveis. As contribuições somam exatamente a previsão, e para modelos de árvores há um algoritmo exato e rápido (Lundberg et al., 2020).",
        },
        { t: "code", title: "Valores SHAP do modelo de boosting", code: C_SHAP, output: O_SHAP },
        {
          t: "p",
          text: "Cada uma das 1710 horas de teste tem 24 contribuições, uma por variável, que somadas ao valor de base (144,5 bicicletas, a previsão média) dão a previsão, como confirma o `True`. A primeira hora do teste é a meia-noite do dia 6 de janeiro:",
        },
        {
          t: "figure",
          src: "img/04-shap-uma-previsao.png",
          alt: "Explicação SHAP de uma previsão: a hora tira 77 bicicletas",
        },
        {
          t: "p",
          text: "O modelo começa nas 144,5 bicicletas de média. Ser meia-noite tira 77; ser o início do ano (`day` = 6) tira 20; o frio tira 19; o inverno (`season` = 1) tira 10; e assim por diante, até à previsão de 10,8. Na realidade foram 11. O gráfico de todas as horas junta estas explicações:",
        },
        {
          t: "figure",
          src: "img/05-shap-resumo.png",
          alt: "Resumo SHAP: cada ponto é uma hora; a cor é o valor da variável",
        },
        {
          t: "p",
          text: "Cada linha é uma variável; cada ponto, uma hora do teste; a posição é a contribuição, e a cor o valor da variável (vermelho alto, azul baixo; as legendas da biblioteca são em inglês). A temperatura alta empurra para cima, a humidade alta e a chuva para baixo. E há uma surpresa: `day` é a terceira variável mais importante. O modelo aprendeu que o uso das bicicletas cresceu ao longo de 2011, o que é verdade, mas não serve para 2012: num dia 6 de janeiro do ano seguinte, o modelo vai prever como se fosse o início de 2011. É a mesma razão por que o `TimeSeriesSplit` deu um erro tão maior. Explicar o modelo serviu para encontrar um problema.",
        },
        {
          t: "widget",
          name: "m11-shap",
          caption:
            "A explicação de uma previsão (a primeira figura SHAP), para cinco horas do teste; a primeira é a meia-noite de 6 de janeiro da aula. Os valores são os do TreeExplainer em Python; o widget só os desenha e soma.",
        },
        { t: "h3", text: "Cuidados" },
        {
          t: "list",
          items: [
            "**Explica o modelo, não o mundo.** Uma contribuição SHAP grande quer dizer que o modelo usa a variável, não que mudá-la muda o resultado real. Para causas, são precisas experiências (M6).",
            "**Variáveis correlacionadas repartem o mérito.** `temp` e `atemp` (a temperatura sentida) medem quase o mesmo; cada uma recebe parte do efeito, e qualquer das três ferramentas pode subestimar as duas.",
            "**A dependência parcial inventa combinações.** Pôr 35 °C numa linha de janeiro cria uma hora que nunca existiu; com variáveis muito correlacionadas, a curva pode refletir zonas sem dados.",
            "**As unidades são as da previsão.** Num classificador, os valores SHAP do `TreeExplainer` costumam estar em log-odds (M8), não em probabilidade.",
          ],
        },
        {
          t: "check",
          id: "qc5",
          q: "Numa hora do teste do `Bikeshare`, o valor de base é 144,5 bicicletas e as 24 contribuições SHAP somam −133,7. Que previsão deu o modelo?",
          options: ["144,5 bicicletas", "−133,7 bicicletas", "10,8 bicicletas", "278,2 bicicletas"],
          answer: 2,
          explain:
            "A previsão é o valor de base mais a soma das contribuições: 144,5 − 133,7 = 10,8. É a meia-noite do dia 6 de janeiro da figura; na realidade foram 11.",
        },
      ],
    },
  ],

  readings: {
    required: [
      {
        text: "Documentação do scikit-learn: [\"Pipelines and composite estimators\"](https://scikit-learn.org/stable/modules/compose.html) e [\"Common pitfalls and recommended practices\"](https://scikit-learn.org/stable/common_pitfalls.html). O segundo é curto e trata exatamente das fugas de dados desta aula.",
        href: T_COMPOSE,
      },
      {
        text: "Kapoor, S. & Narayanan, A. (2023). Leakage and the reproducibility crisis in machine-learning-based science. *Patterns*, 4(9), 100804. Inclui uma taxonomia de oito tipos de fuga e uma lista de verificação.",
        href: T_KAPOOR,
      },
      {
        text: "Molnar, C. (2022). [*Interpretable Machine Learning*](https://christophm.github.io/interpretable-ml-book/) (2.ª ed.). Capítulos sobre dependência parcial, ICE, importância por permutação e SHAP. Gratuito online.",
        href: T_MOLNAR,
      },
    ],
    complementary: [
      {
        text: "Curso em vídeo: Inria, [\"Machine learning in Python with scikit-learn\"](https://inria.github.io/scikit-learn-mooc/). O curso gratuito feito pela equipa do scikit-learn; os módulos sobre pipelines, avaliação e afinação de parâmetros acompanham bem este módulo.",
        href: T_MOOC,
      },
      {
        text: "Huyen, C. (2022). *Designing Machine Learning Systems*. O'Reilly. Caps. 4 a 6 (dados de treino, engenharia de variáveis com uma boa secção sobre fugas, e avaliação de modelos).",
      },
      {
        text: "Géron, A. (2022). *Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow* (3.ª ed.). O'Reilly. Cap. 2 (um projeto completo, do início ao fim, com pipelines).",
      },
    ],
    cited: [
      "Shapley, L. S. (1953). A value for n-person games. Em H. W. Kuhn & A. W. Tucker (eds.), *Contributions to the Theory of Games II* (pp. 307–317). Princeton University Press.",
      "Friedman, J. H. (2001). Greedy function approximation: a gradient boosting machine. *The Annals of Statistics*, 29(5), 1189–1232.",
      "Chawla, N. V., Bowyer, K. W., Hall, L. O. & Kegelmeyer, W. P. (2002). SMOTE: synthetic minority over-sampling technique. *Journal of Artificial Intelligence Research*, 16, 321–357.",
      "van der Putten, P. & van Someren, M. (2004). A bias-variance analysis of a real world learning problem: the CoIL Challenge 2000. *Machine Learning*, 57(1–2), 177–195.",
      "Varma, S. & Simon, R. (2006). Bias in error estimation when using cross-validation for model selection. *BMC Bioinformatics*, 7, 91.",
      "Hastie, T., Tibshirani, R. & Friedman, J. (2009). *The Elements of Statistical Learning* (2.ª ed.). Springer. Sec. 7.10.2, \"The wrong and right way to do cross-validation\".",
      "Cawley, G. C. & Talbot, N. L. C. (2010). On over-fitting in model selection and subsequent selection bias in performance evaluation. *Journal of Machine Learning Research*, 11, 2079–2107.",
      "Pedregosa, F. et al. (2011). Scikit-learn: machine learning in Python. *Journal of Machine Learning Research*, 12, 2825–2830.",
      "Bergstra, J. & Bengio, Y. (2012). Random search for hyper-parameter optimization. *Journal of Machine Learning Research*, 13, 281–305.",
      "Kaufman, S., Rosset, S., Perlich, C. & Stitelman, O. (2012). Leakage in data mining: formulation, detection, and avoidance. *ACM Transactions on Knowledge Discovery from Data*, 6(4), 15.",
      "Buitinck, L. et al. (2013). API design for machine learning software: experiences from the scikit-learn project. *ECML PKDD Workshop: Languages for Data Mining and Machine Learning*, 108–122.",
      "Goldstein, A., Kapelner, A., Bleich, J. & Pitkin, E. (2015). Peeking inside the black box: visualizing statistical learning with plots of individual conditional expectation. *Journal of Computational and Graphical Statistics*, 24(1), 44–65.",
      "Lundberg, S. M. & Lee, S.-I. (2017). A unified approach to interpreting model predictions. *Advances in Neural Information Processing Systems*, 30.",
      "Lundberg, S. M., Erion, G., Chen, H., DeGrave, A., Prutkin, J. M., Nair, B., Katz, R., Himmelfarb, J., Bansal, N. & Lee, S.-I. (2020). From local explanations to global understanding with explainable AI for trees. *Nature Machine Intelligence*, 2(1), 56–67.",
      "van den Goorbergh, R., van Smeden, M., Timmerman, D. & Van Calster, B. (2022). The harm of class imbalance corrections for risk prediction models: illustration and simulation using logistic regression. *Journal of the American Medical Informatics Association*, 29(9), 1525–1534.",
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
            code: `lift = precisão entre os contactados / proporção de base
Brier = (1/n) · Σᵢ (pᵢ − yᵢ)²
f̂(x) = φ₀ + Σⱼ φⱼ(x)
limiar = c_FP / (c_FP + c_FN)`,
          },
          {
            t: "p",
            text: "Lift: quantas vezes melhor do que contactar ao acaso. Brier: erro das probabilidades (menor é melhor). SHAP: a previsão é o valor de base φ₀ mais as contribuições φⱼ de cada variável. O limiar de custo vem do M7: contactar compensa quando p × ganho > custo.",
          },
        ],
      },
      {
        title: "Peças do scikit-learn",
        blocks: [
          {
            t: "table",
            head: ["Peça", "Para quê"],
            rows: [
              ["`Pipeline`, `make_pipeline`", "Encadear passos num só modelo, com `fit` e `predict`"],
              ["`ColumnTransformer`", "Preparar grupos de colunas de maneiras diferentes"],
              ["`SimpleImputer`", "Preencher valores em falta; `add_indicator=True` junta uma coluna \"faltava\""],
              ["`OneHotEncoder(handle_unknown=\"ignore\")`", "Categorias em colunas 0/1, sem erro com categorias novas"],
              ["`TargetEncoder`", "Média do alvo por categoria, com validação cruzada interna (sem fuga)"],
              ["`GridSearchCV`, `RandomizedSearchCV`", "Procurar parâmetros; nomes com `passo__parametro`"],
              ["`GroupKFold`, `TimeSeriesSplit`", "Validação com grupos ou com ordem temporal"],
              ["`cross_val_predict`", "Previsões fora da amostra para todo o treino (para escolher limiares)"],
              ["`permutation_importance`", "Importância global, medida em dados novos"],
              ["`PartialDependenceDisplay`", "Dependência parcial e curvas ICE (colunas decimais)"],
              ["`shap.TreeExplainer`", "Valores SHAP exatos para modelos de árvores"],
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
              ["Fuga de dados", "O modelo usa informação que não terá no momento da previsão; avaliação otimista"],
              ["Fuga pelo alvo", "Uma variável que é a resposta disfarçada ou uma consequência dela"],
              ["Fuga pelo pré-processamento", "Imputar, padronizar, codificar ou escolher variáveis com os dados todos"],
              ["Fuga pela divisão", "Grupos ou tempo misturados entre treino e teste"],
              ["Validação aninhada", "Procura de parâmetros dentro de cada parte de treino; avaliação na parte exterior"],
              ["Otimismo do vencedor", "O melhor de muitos candidatos parece melhor do que é"],
              ["Paradoxo da exatidão", "Com uma classe rara, prever sempre a outra dá exatidão alta e revocação zero"],
              ["`class_weight=\"balanced\"`", "Pesa a classe rara; parecido com baixar o limiar, mas descalibra as probabilidades"],
              ["SMOTE", "Cria exemplos sintéticos da classe rara; mesmas ressalvas"],
              ["Precisão média (AP)", "Área da curva de precisão e revocação; ao acaso vale a proporção de base"],
              ["Curva de ganhos", "Fração dos positivos apanhados ao contactar os primeiros x%"],
              ["Dependência parcial", "Efeito médio de mudar uma variável; as curvas ICE mostram cada linha"],
              ["SHAP", "Reparte cada previsão pelas variáveis com valores de Shapley; soma exata"],
            ],
          },
        ],
      },
      {
        title: "Código",
        blocks: [{ t: "code", title: "Código", code: APO_CODE }],
      },
      {
        title: "Resultados para lembrar",
        blocks: [
          {
            t: "table",
            head: ["Experiência", "Resultado"],
            rows: [
              ["Variáveis escolhidas com todos os dados, em ruído puro", "100% de exatidão; dentro do pipeline, cerca de 50%"],
              ["`Bikeshare` com três validações", "Aleatória 31, por dia 35, temporal 55"],
              ["Grelha em dados de ruído", "`best_score_` 0,58; aninhada 0,55"],
              ["`Caravan`, limiar 0,5", "Exatidão 93,9%, revocação 1%"],
              ["`Caravan`, `class_weight`", "Mesma AUC; probabilidade média 39% em vez de 6%"],
              ["`Caravan`, contactar 10%", "Apanha 29% dos compradores; lift de 2,9"],
              ["SHAP no `Bikeshare`", "`day` em terceiro: o modelo aprendeu a tendência de 2011"],
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
              ["Mini-projeto de churn com pipeline, limiar de custo e SHAP", "Fim da Fase 2"],
              ["Conjuntos de validação e de teste no treino de redes", "M13"],
              ["Contaminação de benchmarks de LLMs (uma fuga em grande escala)", "M23"],
              ["Guardar, versionar e servir pipelines", "M25"],
              ["Explicabilidade, regulação e model cards", "M27"],
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
              "Preparar os dados (imputar, padronizar, escolher variáveis) antes de dividir.",
              "Usar variáveis que só se conhecem depois do acontecimento que se quer prever.",
              "Dividir ao acaso dados com grupos ou com tempo.",
              "Reportar o `best_score_` como se fosse o desempenho em dados novos.",
              "Avaliar um problema de classe rara com a exatidão e o limiar de 0,5.",
              "Ler valores SHAP ou importâncias como efeitos causais.",
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
      title: "Parte A — À mão",
      note: "Dez exercícios, cerca de 4 horas no total, na ordem das sessões do plano de estudo: 1 a 4 depois da secção 3, 5 a 7 depois da secção 4, 8 a 10 no fim. Os da Parte A fazem-se com papel e calculadora.",
    },
    {
      id: "B",
      title: "Parte B — Colab",
      note: "No Colab, num notebook chamado \"M11 — exercícios\", com os dados e as variáveis da aula (`ti`, `y`, `numericas`, `categoricas`, `cv`; `X_tr`, `X_te`, `y_tr`, `y_te` do `Caravan`; `Xb`, `yb`, `bk` do `Bikeshare`). Corra primeiro o código da aula, pela ordem.",
    },
    { id: "C", title: "Parte C — Aplicação" },
  ],
  exercises: [
    {
      id: "e1",
      num: 1,
      part: "A",
      session: "w1s2",
      kind: "classify",
      title: "Há fuga de dados?",
      minutes: 20,
      sections: ["s2", "s3"],
      prompt: [{ t: "p", text: "Em cada caso, diga se há fuga de dados, de que tipo, e como a corrigiria." }],
      categories: [
        "Fuga pelo alvo ou temporal: a variável traz a resposta ou informação que ainda não se conhece no momento da previsão",
        "Fuga pelo pré-processamento",
        "Fuga pela divisão",
        "Não há fuga",
        "Não é fuga em sentido estrito, mas é o mesmo erro de avaliação",
      ],
      justify: "Como a corrigiria",
      items: [
        {
          id: "1",
          text: "1. Um modelo prevê que clientes de um ginásio vão cancelar no próximo mês. Uma das variáveis é \"visitas nos 30 dias antes do cancelamento\"; para quem não cancelou, conta os 30 dias antes de hoje.",
          answer: 0,
          explain:
            "Fuga temporal: para quem cancelou, a variável olha para o período que antecede o cancelamento, que no momento da previsão ainda não aconteceu (e quem vai cancelar costuma ir menos ao ginásio nesse período). Correção: fixar uma data de corte igual para todos e calcular as variáveis só com o que se sabia nessa data, prevendo o que acontece depois.",
        },
        {
          id: "2",
          text: "2. Padronizam-se todos os dados com `StandardScaler` e só depois se faz `train_test_split`.",
          answer: 1,
          explain:
            "A média e o desvio padrão incluem o teste. Normalmente o efeito é pequeno, mas corrige-se pondo o `StandardScaler` num pipeline e dividindo primeiro.",
        },
        {
          id: "3",
          text: "3. Um modelo de vendas semanais de cada loja é avaliado com `KFold(5, shuffle=True)` sobre as semanas.",
          answer: 2,
          explain: "Treina-se com semanas posteriores às do teste. Correção: `TimeSeriesSplit` ou um corte temporal.",
        },
        {
          id: "4",
          text: "4. Um classificador de radiografias tem várias imagens de cada doente, divididas ao acaso entre treino e teste.",
          answer: 2,
          explain: "O modelo pode reconhecer o doente em vez da doença. Correção: `GroupKFold` por doente.",
        },
        {
          id: "5",
          text: "5. Um modelo de fraude usa a variável \"reembolso emitido\".",
          answer: 0,
          explain: "O reembolso é consequência de se ter detetado a fraude. Correção: retirar a variável.",
        },
        {
          id: "6",
          text: "6. As idades em falta são preenchidas com a média calculada só no treino, dentro de um pipeline.",
          answer: 3,
          explain: "Não há fuga: é a forma correta.",
        },
        {
          id: "7",
          text: "7. Experimentam-se 200 combinações de parâmetros com validação cruzada, e reporta-se o melhor `best_score_` como o desempenho esperado.",
          answer: 4,
          explain:
            "Não é uma fuga de dados no sentido estrito, mas é o mesmo erro de avaliação: o melhor de 200 candidatos é otimista. Correção: validação aninhada ou um conjunto de teste guardado.",
        },
      ],
      solution: [
        {
          t: "p",
          text: "(1) Fuga temporal: para quem cancelou, a variável olha para o período que antecede o cancelamento, que no momento da previsão ainda não aconteceu (e quem vai cancelar costuma ir menos ao ginásio nesse período). Correção: fixar uma data de corte igual para todos e calcular as variáveis só com o que se sabia nessa data, prevendo o que acontece depois. (2) Fuga pelo pré-processamento: a média e o desvio padrão incluem o teste. Normalmente o efeito é pequeno, mas corrige-se pondo o `StandardScaler` num pipeline e dividindo primeiro. (3) Fuga pela divisão: treina-se com semanas posteriores às do teste. Correção: `TimeSeriesSplit` ou um corte temporal. (4) Fuga pela divisão: o modelo pode reconhecer o doente em vez da doença. Correção: `GroupKFold` por doente. (5) Fuga pelo alvo: o reembolso é consequência de se ter detetado a fraude. Correção: retirar a variável. (6) Não há fuga: é a forma correta. (7) Não é uma fuga de dados no sentido estrito, mas é o mesmo erro de avaliação: o melhor de 200 candidatos é otimista. Correção: validação aninhada ou um conjunto de teste guardado.",
        },
      ],
    },
    {
      id: "e2",
      num: 2,
      part: "B",
      session: "w1s2",
      kind: "text",
      title: "Engenharia de variáveis no Titanic",
      minutes: 25,
      sections: ["s1"],
      prompt: [
        {
          t: "p",
          text: "Compare, com `cv` e as métricas exatidão e AUC, três versões do pipeline logístico da aula: (a) a da aula; (b) com duas numéricas novas, `familia = sibsp + parch + 1` e `log_fare = np.log1p(fare)`; (c) com `SimpleImputer(add_indicator=True)` nas numéricas e a coluna `deck` como categoria, preenchendo as faltas com a constante \"desconhecido\". Valeu a pena? Porquê?",
        },
      ],
      fields: [
        { id: "code", label: "Código e resultados das três versões", rows: 12, mono: true, placeholder: "ti2 = ti.assign(familia=ti[\"sibsp\"] + ti[\"parch\"] + 1, log_fare=np.log1p(ti[\"fare\"]))\n…" },
        { id: "r", label: "Valeu a pena? Porquê?", rows: 4 },
      ],
      criteria: [
        "Base 0,796 / 0,847; família e log da tarifa 0,788 / 0,851; indicador de falta e convés 0,797 / 0,846 (exatidão / AUC)",
        "Conclui que nenhuma versão muda o resultado mais do que alguns milésimos, dentro do ruído",
        "Explica que as variáveis novas repetem informação que o modelo já tinha (a família é a soma de duas colunas; o convés conhece-se para 81% da primeira classe e quase ninguém das outras)",
        "Refere que a engenharia de variáveis vale a pena quando traz informação nova ou uma forma que o modelo não constrói sozinho (por exemplo, a interação sexo × classe)",
      ],
      solution: [
        {
          t: "p",
          text: "O gabarito usa uma função `montar` para não repetir o pipeline do Titanic:",
        },
        { t: "code", code: G_MONTAR },
        { t: "code", code: G_E2, output: O_E2 },
        {
          t: "p",
          text: "Nenhuma das versões muda o resultado mais do que alguns milésimos, dentro do ruído. As variáveis novas repetem informação que o modelo já tinha (a família é a soma de duas colunas que já lá estavam; o convés conhece-se para 81% da primeira classe e quase ninguém das outras, por isso diz pouco mais do que a classe, que o modelo já tem). Engenharia de variáveis vale a pena quando traz informação nova ou uma forma que o modelo não consegue construir sozinho, como as interações para um modelo linear; aqui, a interação sexo × classe teria mais efeito (o boosting da aula, que a apanha, chega a uma AUC de 0,863).",
        },
      ],
    },
    {
      id: "e3",
      num: 3,
      part: "B",
      session: "w1s2",
      kind: "text",
      title: "Grelha, sorteio e validação aninhada",
      minutes: 25,
      sections: ["s2"],
      prompt: [
        {
          t: "p",
          text: "Nos dados de cancro da mama do scikit-learn (`load_breast_cancer(return_X_y=True)`), use a grelha de SVM da aula (`parametros`, `interno`, `externo`). (a) Calcule o `best_score_` e a validação aninhada. (b) Repita a procura com `RandomizedSearchCV`, 10 combinações sorteadas de `loguniform(1e-2, 1e3)` para o C e `loguniform(1e-4, 1e1)` para o γ (`from scipy.stats import loguniform`), `random_state=0`. (c) Compare e comente.",
        },
      ],
      fields: [
        { id: "code", label: "(a) e (b) Código e resultados", rows: 12, mono: true, placeholder: "from sklearn.datasets import load_breast_cancer\nX_cm, y_cm = load_breast_cancer(return_X_y=True)\n…" },
        { id: "c", label: "(c) Comparação e comentário", rows: 4 },
      ],
      criteria: [
        "(a) Grelha: C = 100, γ = 0,001, `best_score_` 0,981; validação aninhada 0,975, com divisões entre 0,956 e 0,991",
        "(a) Nota que o otimismo é pequeno porque os dados têm sinal forte e a grelha é modesta",
        "(b) Sorteio: C ≈ 10,3, γ ≈ 0,053, 0,968",
        "(c) Explica que aqui a grelha estava bem centrada e tinha mais candidatos (36 contra 10); a vantagem da procura aleatória aparece com muitos parâmetros",
      ],
      solution: [
        { t: "code", code: G_E3, output: O_E3 },
        {
          t: "p",
          text: "(a) A procura promete 98,1%; a validação aninhada dá 97,5%, com divisões entre 95,6% e 99,1%. O otimismo é pequeno, porque os dados têm sinal forte e a grelha é modesta. (b) e (c) Com 10 combinações sorteadas, a melhor dá 96,8%, abaixo da grelha de 36. Aqui, a grelha estava bem centrada e tinha mais candidatos. A vantagem da procura aleatória aparece com muitos parâmetros, em que a grelha completa é impossível; com dois parâmetros e orçamento para 36 tentativas, a grelha é uma escolha razoável.",
        },
      ],
    },
    {
      id: "e4",
      num: 4,
      part: "B",
      session: "w1s2",
      kind: "text",
      title: "Uma fuga escondida",
      minutes: 25,
      sections: ["s1", "s3"],
      prompt: [
        {
          t: "p",
          text: "Junte ao Titanic uma coluna de puro ruído com 400 categorias, `cabine_falsa = rng.integers(0, 400, size=891).astype(str)` com `rng = np.random.default_rng(0)`. (a) Calcule, com todos os dados, a taxa de sobrevivência média de cada \"cabine\" e use-a como variável numérica no pipeline da aula. Que exatidão e AUC obtém? (b) Faça o mesmo com um `TargetEncoder(random_state=0)` dentro do `ColumnTransformer`. (c) Explique a diferença.",
        },
      ],
      fields: [
        { id: "code", label: "(a) e (b) Código e resultados", rows: 12, mono: true, placeholder: "from sklearn.preprocessing import TargetEncoder\nrng = np.random.default_rng(0)\n…" },
        { id: "c", label: "(c) Porque é que os resultados diferem?", rows: 5 },
      ],
      criteria: [
        "(a) Com a média do alvo calculada antes: 0,863 de exatidão e AUC de 0,935 (contra 0,796 e 0,847 sem a coluna)",
        "(b) Com o `TargetEncoder` no pipeline: 0,799 e 0,846, a coluna não serve para nada",
        "(c) Explica que, com 2 ou 3 pessoas por \"cabine\", a média calculada com todos os dados inclui o próprio passageiro: a variável contém, em parte, a resposta",
        "(c) Explica que o `TargetEncoder` calcula as médias só com a parte de treino e, dentro dela, com validação cruzada interna, para que nenhuma linha veja o seu próprio alvo",
      ],
      solution: [
        { t: "code", code: G_E4, output: O_E4 },
        {
          t: "p",
          text: "(a) Uma coluna de puro ruído faz a AUC saltar de 0,847 para 0,935. (b) Com o `TargetEncoder` no pipeline, fica nos 0,846: a coluna não serve para nada, como devia. (c) Com 400 categorias e 891 passageiros, cada \"cabine\" tem 2 ou 3 pessoas, e a média do alvo calculada com todos os dados inclui o próprio passageiro: a variável contém, em parte, a resposta. O `TargetEncoder` calcula as médias só com a parte de treino de cada divisão e, dentro do treino, com validação cruzada interna, para que nenhuma linha veja o seu próprio alvo. É uma das fugas mais comuns em competições e em projetos reais.",
        },
      ],
    },
    {
      id: "e5",
      num: 5,
      part: "B",
      session: "w2s1",
      kind: "text",
      title: "Lucro da campanha do seguro de caravana",
      minutes: 30,
      sections: ["s4"],
      prompt: [
        {
          t: "p",
          text: "Contactar um cliente custa 10 € e cada venda dá uma margem de 100 €. (a) Com `cross_val_predict(..., method=\"predict_proba\")` no treino, obtenha probabilidades fora da amostra para a logística da aula e calcule o lucro para limiares de 0,02 a 0,30, em passos de 0,01. Qual é o melhor limiar? Compare com o limiar teórico do M7. (b) Aplique-o ao teste e calcule o lucro. Compare com o limiar de 0,5 e com contactar toda a gente.",
        },
      ],
      fields: [
        { id: "code", label: "Código e resultados", rows: 14, mono: true, placeholder: "from sklearn.model_selection import cross_val_predict\ncusto, margem = 10, 100\n…" },
        { id: "a", label: "(a) Melhor limiar e comparação com o limiar teórico", rows: 3 },
        { id: "b", label: "(b) Lucro no teste: o limiar escolhido, 0,5 e contactar todos", rows: 3 },
      ],
      criteria: [
        "(a) Probabilidades fora da amostra com `cross_val_predict` só no treino",
        "(a) Melhor limiar 0,10, com 3900 € no treino",
        "(a) Liga ao limiar teórico: contactar compensa quando p × 100 > 10, ou seja, p > 0,10; funciona porque as probabilidades da logística sem pesos estão bem calibradas",
        "(b) No teste: 265 contactados, 43 compram, 1650 €; com 0,5, 4 contactados e 60 €; contactar os 1747 dá −7070 €",
      ],
      solution: [
        { t: "code", code: G_E5, output: O_E5 },
        {
          t: "p",
          text: "(a) No treino, o lucro é máximo com o limiar de 0,10 (3900 €); a 0,06 dá 2780 € e a 0,20 dá 1640 €. É exatamente o limiar teórico: contactar compensa quando p × 100 > 10, ou seja, p > 0,10. Funciona porque as probabilidades da logística sem pesos estão bem calibradas; com `class_weight=\"balanced\"` esta conta deixava de valer. (b) No teste: com 0,10, contactam-se 265 clientes, 43 compram, lucro de 1650 €. Com 0,5, contactam-se 4 e o lucro é de 60 €. Contactar os 1747 dá um prejuízo de 7070 €.",
        },
      ],
    },
    {
      id: "e6",
      num: 6,
      part: "B",
      session: "w2s1",
      kind: "text",
      title: "Logística ou boosting no Caravan?",
      minutes: 25,
      sections: ["s2", "s4"],
      prompt: [
        {
          t: "p",
          text: "Ainda no `Caravan`: (a) escolha o C da logística entre 0,001, 0,01, 0,1 e 1 pela precisão média em validação cruzada no treino. (b) Compare com um `HistGradientBoostingClassifier(learning_rate=0.05, max_depth=3, random_state=0)`, em validação cruzada e no teste (AUC e AP). Qual escolheria?",
        },
      ],
      fields: [
        { id: "code", label: "Código e resultados", rows: 12, mono: true, placeholder: "for C in [0.001, 0.01, 0.1, 1]:\n    …" },
        { id: "r", label: "Qual escolheria, e porquê?", rows: 4 },
      ],
      criteria: [
        "(a) C = 0,01, com AP de 0,170, mas com diferenças mínimas até C = 0,1 (0,169; 0,17; 0,167; 0,162)",
        "(b) Em validação cruzada o boosting parece melhor (AP 0,184 contra 0,170); no teste empatam (AUC 0,756 e 0,752; AP 0,149 e 0,151)",
        "Nota que, com 104 compradores no teste, estas diferenças são ruído",
        "Escolhe a logística: igual desempenho, probabilidades bem calibradas (essenciais no exercício 5), mais rápida e fácil de explicar",
      ],
      solution: [
        { t: "code", code: G_E6, output: O_E6 },
        {
          t: "p",
          text: "(a) C = 0,01 (AP de 0,170), mas com diferenças mínimas até C = 0,1. (b) Em validação cruzada o boosting parece melhor (0,184 contra 0,170); no teste, empatam (AUC de 0,756 e 0,752; AP de 0,149 e 0,151). Com 104 compradores no teste, estas diferenças são ruído. Escolheria a logística: igual desempenho, probabilidades bem calibradas (essenciais no exercício 5), mais rápida e fácil de explicar.",
        },
      ],
    },
    {
      id: "e7",
      num: 7,
      part: "A",
      session: "w2s1",
      kind: "text",
      title: "A operadora e os 500 clientes marcados",
      minutes: 20,
      sections: ["s4"],
      prompt: [
        {
          t: "p",
          text: "Uma operadora tem 10 000 clientes, dos quais 2% vão cancelar. Um modelo marca 500 clientes, e 80 deles cancelam mesmo. (a) Monte a matriz de confusão. (b) Calcule a exatidão, a precisão, a revocação e o lift. (c) Que exatidão teria um modelo que nunca marca ninguém? (d) Uma oferta de retenção custa 5 € por cliente contactado e convence a ficar 25% dos que iam cancelar; cada cliente retido vale 200 €. A campanha nos 500 marcados compensa?",
        },
      ],
      fields: [
        { id: "a", label: "(a) Matriz de confusão", rows: 4, mono: true, placeholder: "VP = …   FP = …\nFN = …   VN = …" },
        { id: "b", label: "(b) Exatidão, precisão, revocação e lift", rows: 4 },
        { id: "c", label: "(c) Modelo que nunca marca ninguém", rows: 2 },
        { id: "d", label: "(d) A campanha compensa?", rows: 4 },
      ],
      criteria: [
        "(a) VP 80, FP 420, FN 200 − 80 = 120, VN 9800 − 420 = 9380",
        "(b) Exatidão (80 + 9380) / 10 000 = 94,6%; precisão 80 / 500 = 16%; revocação 80 / 200 = 40%; lift 0,16 / 0,02 = 8",
        "(c) Nunca marcar ninguém dá 98% de exatidão, mais do que o modelo, e revocação zero",
        "(d) Retidos: 25% de 80 = 20, que valem 4000 €; custo 500 × 5 = 2500 €; ganho líquido de 1500 €: compensa",
      ],
      solution: [
        {
          t: "p",
          text: "(a) Verdadeiros positivos 80, falsos positivos 420, falsos negativos 200 − 80 = 120, verdadeiros negativos 9800 − 420 = 9380. (b) Exatidão (80 + 9380) / 10 000 = 94,6%. Precisão 80 / 500 = 16%. Revocação 80 / 200 = 40%. Lift 0,16 / 0,02 = 8. (c) Nunca marcar ninguém dá 98% de exatidão, mais do que o modelo, e revocação zero. (d) Clientes retidos: 25% de 80 = 20, que valem 20 × 200 = 4000 €; custo: 500 × 5 = 2500 €. Ganho líquido de 1500 €: compensa. Contactar todos os 10 000 custaria 50 000 € para reter 50 clientes (10 000 €): prejuízo de 40 000 €.",
        },
      ],
    },
    {
      id: "e8",
      num: 8,
      part: "B",
      session: "w2s2",
      kind: "text",
      title: "SHAP no Titanic",
      minutes: 30,
      sections: ["s1", "s5"],
      prompt: [
        {
          t: "p",
          text: "(a) Monte um pipeline com as numéricas sem alterações (`\"passthrough\"`; o boosting aceita valores em falta) e as categóricas com imputação e `OneHotEncoder(handle_unknown=\"ignore\", sparse_output=False)`, seguido de `HistGradientBoostingClassifier(learning_rate=0.03, max_depth=3, random_state=0)`; calcule a AUC em `cv`. (b) Treine-o com todos os dados, transforme `X` com o passo `prep` e calcule os valores SHAP do passo `modelo`. Quais as variáveis com maior |SHAP| médio? (c) Compare as explicações das passageiras nas linhas 1 (primeira classe) e 2 (terceira classe). Em que unidades estão os valores?",
        },
      ],
      fields: [
        { id: "code", label: "(a) e (b) Código e resultados", rows: 14, mono: true, placeholder: "import shap\nprep_arvore = ColumnTransformer([\n    (\"num\", \"passthrough\", numericas),\n    …" },
        { id: "c", label: "(c) As duas passageiras e as unidades", rows: 5 },
      ],
      criteria: [
        "(a) AUC de 0,864",
        "(b) Valor de base −0,538; o sexo domina (`cat__sex_female` 1,125), seguido de `cat__pclass_3` (0,439), da idade (0,204) e da tarifa (0,182)",
        "(c) Linha 2 (26 anos, terceira classe): 53%, ser mulher soma 1,42 e ser da terceira classe tira 0,72; linha 1 (38 anos, primeira classe): 94%, ser mulher soma 1,80 e não ser da terceira soma 1,01",
        "(c) Nota que o mesmo \"ser mulher\" vale mais na primeira classe: é a interação que o boosting aprendeu",
        "(c) Unidades em log-odds: o valor de base −0,538 corresponde a 1 / (1 + e^0,538) ≈ 0,37; a probabilidade obtém-se aplicando a função logística à soma",
      ],
      solution: [
        { t: "code", code: G_E8, output: O_E8 },
        {
          t: "p",
          text: "(a) AUC de 0,864. (b) O sexo domina, seguido de ser ou não da terceira classe, da idade e da tarifa. (c) A passageira da linha 2 (26 anos, terceira classe) tem probabilidade de 53%: ser mulher soma 1,42, ser da terceira classe tira 0,72. A da linha 1 (38 anos, primeira classe) tem 94%: ser mulher soma 1,80 e *não* ser da terceira classe soma 1,01. O mesmo \"ser mulher\" vale mais na primeira classe: é a interação que o boosting aprendeu. As unidades são log-odds (M8): o valor de base −0,538 corresponde a uma probabilidade de 1 / (1 + e^0,538) ≈ 0,37, e a previsão final em probabilidade obtém-se aplicando a função logística à soma.",
        },
      ],
    },
    {
      id: "e9",
      num: 9,
      part: "B",
      session: "w2s2",
      kind: "text",
      title: "Variáveis correlacionadas",
      minutes: 20,
      sections: ["s5"],
      prompt: [
        {
          t: "p",
          text: "No `Bikeshare`, com a divisão por dias da secção 5: (a) calcule a correlação entre `temp` e `atemp`. (b) Treine o boosting com e sem `atemp`, e compare o RMSE no teste e a importância por permutação de `temp`. (c) O que conclui sobre ler importâncias com variáveis correlacionadas?",
        },
      ],
      fields: [
        { id: "code", label: "(a) e (b) Código e resultados", rows: 12, mono: true, placeholder: "print(round(Xb[\"temp\"].corr(Xb[\"atemp\"]), 3))\n…" },
        { id: "c", label: "(c) Conclusão", rows: 4 },
      ],
      criteria: [
        "(a) Correlação de 0,992: são praticamente a mesma variável",
        "(b) RMSE 35,8 com `atemp` e 36,0 sem; importância de `temp` 12,8 com `atemp` e 27,9 sem",
        "Explica que, com as duas, baralhar uma custa pouco porque a outra continua lá com a mesma informação",
        "(c) A importância de cada variável correlacionada subestima a do grupo: medir o grupo inteiro (baralhar as duas ao mesmo tempo) ou ficar só com uma",
      ],
      solution: [
        { t: "code", code: G_E9, output: O_E9 },
        {
          t: "p",
          text: "(a) 0,992: são praticamente a mesma variável. (b) Tirar `atemp` quase não muda o erro (35,8 para 36,0), mas a importância de `temp` mais do que duplica (12,8 para 27,9). Com as duas, baralhar uma não custa muito, porque a outra continua lá com a mesma informação. (c) Com variáveis correlacionadas, a importância de cada uma subestima a importância do grupo. Ou se mede o grupo inteiro (baralhando as duas ao mesmo tempo), ou se fica só com uma delas.",
        },
      ],
    },
    {
      id: "e10",
      num: 10,
      part: "C",
      session: "w2s2",
      kind: "text",
      title: "Auditoria",
      minutes: 40,
      sections: ["s2", "s3"],
      prompt: [
        { t: "p", text: "Um colega avaliou um modelo para o `Caravan` assim:" },
        { t: "code", code: E10_CODE },
        {
          t: "p",
          text: "(a) Encontre os três problemas. (b) Escreva `avaliacao_honesta(X, y)`, com um pipeline e validação aninhada (exterior: `StratifiedKFold(5, shuffle=True, random_state=1)`). (c) Compare as duas com todos os dados e com uma amostra estratificada de 1000 clientes (`train_test_split(..., train_size=1000, stratify=y_ca, random_state=0)`). (d) Escreva ao colega 4 a 6 linhas, construtivas, a explicar o que encontrou.",
        },
      ],
      fields: [
        { id: "a", label: "(a) Os três problemas", rows: 4 },
        { id: "code", label: "(b) e (c) Código e resultados", rows: 14, mono: true, placeholder: "def avaliacao_honesta(X, y):\n    pipe = Pipeline([…])\n    …" },
        { id: "c", label: "(c) Comparação", rows: 3 },
        { id: "d", label: "(d) Mensagem ao colega", rows: 6 },
      ],
      criteria: [
        "(a) A padronização com todos os dados; a escolha das 20 variáveis com todos os dados (a mais grave); o resultado reportado é o `best_score_`, o melhor de 12 candidatos",
        "(b) Pipeline com `StandardScaler`, `SelectKBest(f_classif, k=20)` e a logística, dentro de um `GridSearchCV`, avaliado com `cross_val_score` exterior",
        "(c) Todos os dados: 0,747 contra 0,742; 1000 clientes: 0,73 contra 0,662, quase 7 pontos de AUC de otimismo",
        "(c) Conclui que as fugas crescem quando os dados são poucos e as escolhas muitas",
        "(d) Mensagem construtiva, com os números e a proposta do pipeline com validação aninhada",
      ],
      solution: [
        { t: "code", code: G_E10, output: O_E10 },
        {
          t: "p",
          text: "(a) Três problemas: a padronização é feita com todos os dados; a escolha das 20 variáveis também (a mais grave); e o resultado reportado é o `best_score_`, o melhor de 12 candidatos. (c) Com os 5822 clientes, a diferença é pequena (0,747 contra 0,742): com muitos dados e poucas variáveis, as fugas pesam pouco. Com 1000 clientes (60 compradores), o colega reportaria 0,73 e o valor honesto é 0,662: quase 7 pontos de AUC de otimismo. As fugas crescem quando os dados são poucos e as escolhas muitas.",
        },
        {
          t: "p",
          text: "(d) Mensagem-modelo: \"Revi a avaliação do modelo do seguro de caravana. A padronização e a escolha das 20 variáveis estão a ser feitas com todos os dados, antes da validação, e o valor reportado é o melhor da procura de parâmetros, que tende a ser otimista. Com os dados todos, o efeito é pequeno (0,747 contra 0,742), mas numa amostra de 1000 clientes chega a 7 pontos. Juntei tudo num pipeline com validação aninhada; fica certo por construção, e sugiro usarmos este padrão daqui para a frente.\"",
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
            q: "A principal razão para pôr o `StandardScaler` dentro de um `Pipeline`, em vez de padronizar os dados antes da validação cruzada, é:",
            options: [
              "O treino fica mais rápido.",
              "A exatidão melhora sempre.",
              "A média e o desvio padrão passam a ser calculados só com a parte de treino de cada divisão.",
              "Passa a ser possível usar variáveis categóricas.",
            ],
            answer: 2,
            explain: "Dentro do pipeline, cada passo que aprende com os dados aprende só com a parte de treino de cada divisão; a parte de teste é transformada com esses valores, como seriam dados novos.",
          },
          {
            kind: "mcq", id: "p2", num: 2, section: "s3", points: 1,
            q: "Num modelo que prevê se um cliente vai cancelar a assinatura no próximo mês, qual destas variáveis é uma fuga de dados?",
            options: ["A data do pedido de cancelamento.", "A idade do cliente.", "O número de compras no ano anterior.", "A região onde vive."],
            answer: 0,
            explain: "No momento da previsão, o pedido de cancelamento ainda não existe: só existe para quem já cancelou. É a resposta disfarçada.",
          },
          {
            kind: "mcq", id: "p3", num: 3, section: "s3", points: 1,
            q: "Escolher as 50 melhores variáveis com `SelectKBest` usando todos os dados, e só depois fazer validação cruzada:",
            options: [
              "Não tem problema se o k for pequeno.",
              "Só é problema com modelos de árvores.",
              "Dá uma estimativa pessimista.",
              "Dá uma estimativa otimista, por vezes muito.",
            ],
            answer: 3,
            explain: "A seleção já viu os rótulos das partes de teste. No exemplo dos 5000 \"genes\" de ruído, dá 100% em vez de perto de 50%.",
          },
          {
            kind: "mcq", id: "p4", num: 4, section: "s3", points: 1,
            q: "Para avaliar um modelo que prevê as vendas da próxima semana a partir do histórico, a validação mais adequada é:",
            options: ["`KFold` com `shuffle=True`.", "`TimeSeriesSplit`.", "`StratifiedKFold`.", "`LeaveOneOut`."],
            answer: 1,
            explain: "Quando o modelo vai prever o futuro, treina-se sempre no passado e testa-se no período seguinte.",
          },
          {
            kind: "mcq", id: "p5", num: 5, section: "s2", points: 1,
            q: "O `best_score_` de um `GridSearchCV` que experimentou 200 combinações:",
            options: [
              "Tende a ser otimista como estimativa do desempenho em dados novos.",
              "É sempre igual ao resultado num conjunto de teste.",
              "Tende a ser pessimista.",
              "Só é otimista com classes desequilibradas.",
            ],
            answer: 0,
            explain: "É o melhor de 200 médias de validação cruzada, e o melhor de muitos candidatos beneficia sempre de alguma sorte.",
          },
          {
            kind: "mcq", id: "p6", num: 6, section: "s4", points: 1,
            q: "Com 1% de fraudes, um modelo que nunca prevê fraude tem:",
            options: ["AUC de 0,99.", "Revocação de 99%.", "Exatidão de 99% e revocação de 0%.", "Precisão de 99%."],
            answer: 2,
            explain: "Acerta todas as transações legítimas (99%) e não apanha nenhuma fraude: é o paradoxo da exatidão.",
          },
          {
            kind: "mcq", id: "p7", num: 7, section: "s4", points: 1,
            q: "Usar `class_weight=\"balanced\"` numa regressão logística com uma classe rara:",
            options: [
              "Melhora sempre a AUC.",
              "Não muda nada.",
              "Torna as probabilidades mais bem calibradas.",
              "Empurra as probabilidades da classe rara para cima, com um efeito parecido com baixar o limiar.",
            ],
            answer: 3,
            explain: "No Caravan, a AUC quase não mudou (0,744 contra 0,752), mas a probabilidade média passou de 5,9% para 39%: as probabilidades descalibram-se.",
          },
          {
            kind: "mcq", id: "p8", num: 8, section: "s5", points: 1,
            q: "Numa previsão, a variável \"idade\" tem um valor SHAP de +0,8. Isto quer dizer que:",
            options: [
              "Aumentar a idade deste cliente aumentaria a previsão em 0,8.",
              "A idade empurrou esta previsão 0,8 unidades acima do valor de base.",
              "A idade é a variável mais importante do modelo.",
              "A idade tem correlação de 0,8 com o alvo.",
            ],
            answer: 1,
            explain: "O SHAP reparte a diferença entre o valor de base e esta previsão pelas variáveis. Explica o modelo, não o mundo: não diz o que aconteceria se a idade mudasse.",
          },
        ],
      },
      {
        title: "Grupo II — Resposta curta (8 valores)",
        note: "Sem consulta e sem correr código. 2 valores cada, 3 a 5 linhas por resposta.",
        questions: [
          {
            kind: "open", id: "p9", num: 9, section: "s3", points: 2, rows: 5,
            q: "O que é uma fuga de dados? Dê dois exemplos de tipos diferentes e diga como evitaria cada um.",
            criteria: [
              { id: "c1", text: "Definição", points: 0.5 },
              { id: "c2", text: "Dois exemplos de tipos diferentes com a forma de evitar", points: 1.5 },
            ],
            model:
              "Uma fuga de dados é o uso, no treino ou na avaliação, de informação que não existirá no momento da previsão; a avaliação fica otimista e o modelo falha em produção. Exemplos: uma variável que é consequência do alvo (\"reembolso emitido\" num modelo de fraude; evita-se perguntando se a variável é conhecida no momento da previsão); escolher variáveis ou codificar o alvo com todos os dados (evita-se com um pipeline); dividir ao acaso dados com grupos ou tempo (evita-se com `GroupKFold` ou `TimeSeriesSplit`).",
          },
          {
            kind: "open", id: "p10", num: 10, section: "s2", points: 2, rows: 5,
            q: "O que é a validação cruzada aninhada, e quando é necessária?",
            criteria: [
              { id: "c1", text: "Mecanismo", points: 1 },
              { id: "c2", text: "Quando e porquê", points: 1 },
            ],
            model:
              "Tem dois ciclos: o exterior separa partes de teste; dentro de cada parte de treino, o interior faz a procura de parâmetros completa, e o modelo escolhido é avaliado na parte exterior. É necessária quando se quer reportar o desempenho de um processo que inclui escolhas feitas com validação cruzada (parâmetros, modelo, variáveis), porque o melhor de muitos candidatos é otimista, sobretudo com poucos dados e muitos candidatos. Alternativa: um conjunto de teste guardado desde o início.",
          },
          {
            kind: "open", id: "p11", num: 11, section: "s4", points: 2, rows: 5,
            q: "Um modelo de cancelamento de clientes tem exatidão de 96%, num negócio em que 4% dos clientes cancelam. O diretor comercial está satisfeito. O que lhe diria, e que métricas proporia?",
            criteria: [
              { id: "c1", text: "Problema da exatidão", points: 1 },
              { id: "c2", text: "Métricas adequadas ligadas ao negócio", points: 1 },
            ],
            model:
              "Prever \"ninguém cancela\" daria os mesmos 96%, por isso a exatidão não diz nada. Proporia a revocação (que fração dos cancelamentos o modelo apanha), a precisão (quantos dos marcados cancelam mesmo), a precisão média, e sobretudo uma curva de ganhos ou de lucro: contactando os X% com maior risco, quantos cancelamentos se evitam e quanto se ganha, com o limiar escolhido pelo custo da ação e pelo valor de um cliente retido.",
          },
          {
            kind: "open", id: "p12", num: 12, section: "s5", points: 2, rows: 5,
            q: "Em que diferem a importância por permutação, a dependência parcial e o SHAP? Dê um uso típico de cada.",
            criteria: [
              { id: "c1", text: "Distinção das três", points: 1.5 },
              { id: "c2", text: "Uso de cada uma", points: 0.5 },
            ],
            model:
              "A importância por permutação é global: quanto o erro piora ao baralhar cada variável em dados novos; serve para saber de que variáveis o modelo depende (e detetar fugas). A dependência parcial mostra o efeito médio de mudar uma variável na previsão, com as curvas ICE a mostrar cada linha; serve para ver a forma do efeito e interações. O SHAP reparte cada previsão individual pelas variáveis, com soma exata; serve para explicar uma decisão concreta e, juntando todas, ter um resumo global. Nenhuma das três mede efeitos causais.",
          },
        ],
      },
      {
        title: "Grupo III — Programação (4 valores)",
        note: "Pode usar o Colab e a documentação do scikit-learn, mas não assistentes de IA.",
        questions: [
          {
            kind: "open", id: "p13", num: 13, section: "s3", points: 4, rows: 18,
            q: "O conjunto `Wage` do ISLP (`URL + \"Wage.csv\"`) tem o salário (`wage`, em milhares de dólares por ano) de 3000 homens de uma região dos EUA, entre 2003 e 2009, com idade, ano, estado civil, escolaridade, tipo de emprego, saúde e seguro de saúde.",
            context: [
              {
                t: "p",
                text: "(a) Monte um pipeline com `ColumnTransformer` que padronize `age` e `year` e aplique `OneHotEncoder(handle_unknown=\"ignore\")` a `maritl`, `education`, `jobclass`, `health` e `health_ins`. (b) Um colega juntou também a coluna `logwage` às numéricas e obteve, com um `HistGradientBoostingRegressor`, um RMSE de cerca de 2. Confirme com `KFold(5, shuffle=True, random_state=0)` e explique. (c) Sem essa coluna, compare o RMSE em validação cruzada de uma regressão linear e de um `HistGradientBoostingRegressor(random_state=0)`. (d) Treine os dois com os anos até 2007 e teste em 2008 e 2009. Compare com (c). (e) Calcule a importância por permutação do melhor modelo de (d) nesse teste (`n_repeats=20`, `random_state=0`) e indique as três variáveis mais importantes.",
              },
            ],
            criteria: [
              { id: "c1", text: "(a) Pipeline correto", points: 0.5 },
              { id: "c2", text: "(b) Fuga confirmada e explicada", points: 1 },
              { id: "c3", text: "(c) Comparação com as mesmas divisões", points: 0.75 },
              { id: "c4", text: "(d) Teste temporal e comentário", points: 1 },
              { id: "c5", text: "(e) Importância por permutação", points: 0.75 },
            ],
            model:
              "(b) `logwage` é o logaritmo do salário: é o alvo escrito de outra maneira, uma fuga pelo alvo. O boosting aprende a função exponencial e o erro cai para 1,9 mil dólares, contra um desvio padrão de 41,7. (c) A regressão linear ganha (34,0 contra 34,9): o salário tem muito ruído e relações simples com estas variáveis. (d) No teste temporal, a linear dá 34,6, perto da validação cruzada: as relações mantiveram-se estáveis entre 2003 e 2009, e por isso a validação aleatória não enganou aqui. O boosting piora mais (36,1). Nem sempre a validação temporal dá resultados muito piores, mas só se sabe fazendo-a. (e) A escolaridade domina, seguida do seguro de saúde e do estado civil.",
            modelBlocks: [{ t: "code", code: G_P13, output: O_P13 }],
          },
        ],
      },
    ],
  },
  examReviewNote:
    "Se a nota ficar abaixo de 14: rever as secções das perguntas falhadas (1 → secção 1, pipelines; 5 e 10 → secção 2, escolher parâmetros sem se enganar; 2, 3, 4, 9 e 13 → secção 3, fugas de dados; 6, 7 e 11 → secção 4, classes desequilibradas; 8 e 12 → secção 5, interpretar modelos). Refaça os exercícios dessas secções sem olhar para o gabarito e repita a prova daqui a uma semana.",

  // ---------------------------------------------------------------- SIMULADO DE TREINO (banco extra da plataforma)
  practice: {
    mcq: [
      {
        id: "q1", section: "s1",
        q: "Qual destes NÃO é um dos três problemas de tratar o pré-processamento fora do modelo, segundo a aula?",
        options: [
          "É fácil aplicar transformações diferentes no treino e em produção.",
          "É fácil deixar informação do teste entrar no treino.",
          "No fim há vários objetos para guardar em vez de um.",
          "O modelo deixa de aceitar valores em falta.",
        ],
        answer: 3,
        explain: "Os três problemas da aula são as transformações diferentes em produção, a fuga do teste para o treino e os vários objetos para guardar. O pipeline resolve os três.",
      },
      {
        id: "q2", section: "s1",
        q: "No `OneHotEncoder(handle_unknown=\"ignore\")`, o que acontece a uma categoria que nunca apareceu no treino?",
        options: ["Dá erro.", "Passa a ser a categoria mais frequente.", "Fica com todas as colunas dessa variável a zero.", "Recebe uma coluna nova."],
        answer: 2,
        explain: "Uma categoria nunca vista fica com tudo a zero em vez de dar erro.",
      },
      {
        id: "q3", section: "s1",
        q: "Que peça junta uma coluna 0/1 a dizer onde faltava o valor?",
        options: ["`SimpleImputer(add_indicator=True)`", "`OrdinalEncoder`", "`FunctionTransformer(np.log1p)`", "`TargetEncoder`"],
        answer: 0,
        explain: "Às vezes faltar é informação; o `add_indicator=True` guarda-a numa coluna nova.",
      },
      {
        id: "q4", section: "s1",
        q: "No Titanic, que exatidão tem a linha de base \"prever sempre não sobreviveu\", e quanto acerta o pipeline logístico da aula?",
        options: ["38,4% e 79,6%", "61,6% e 79,6%", "61,6% e 84,7%", "50% e 79,6%"],
        answer: 1,
        explain: "38,4% sobreviveram, por isso prever sempre \"não\" acerta 61,6%. O pipeline acerta 79,6% (e tem AUC de 0,847).",
      },
      {
        id: "q5", section: "s1",
        q: "Como se guarda um pipeline treinado para o usar noutro programa?",
        options: ["Guardar cada passo num ficheiro diferente.", "`joblib.dump(modelo, \"modelo.joblib\")`", "Copiar os coeficientes da logística para um CSV.", "Não é possível: tem de se treinar outra vez."],
        answer: 1,
        explain: "Um único ficheiro com `joblib.dump`, carregado com `joblib.load`. É o que a Fase 5 (M25) vai pôr em produção.",
      },
      {
        id: "q6", section: "s2",
        q: "Num `GridSearchCV` sobre o pipeline da aula, como se chama a estratégia do imputador das numéricas?",
        options: ["`imputar__strategy`", "`prep.num.imputar.strategy`", "`prep__num__imputar__strategy`", "`num_imputar_strategy`"],
        answer: 2,
        explain: "O caminho até ao parâmetro, com dois traços baixos: passo `prep`, ramo `num`, passo `imputar`, parâmetro `strategy`.",
      },
      {
        id: "q7", section: "s2",
        q: "Porque é que, segundo Bergstra e Bengio (2012), a procura aleatória costuma ganhar à grelha com o mesmo orçamento?",
        options: [
          "Porque normalmente só alguns parâmetros importam e o sorteio experimenta mais valores diferentes de cada um.",
          "Porque o sorteio usa validação aninhada.",
          "Porque a grelha não funciona com pipelines.",
          "Porque o sorteio experimenta sempre mais combinações.",
        ],
        answer: 0,
        explain: "Com o mesmo número de tentativas, a grelha repete os mesmos poucos valores de cada parâmetro; o sorteio espalha-os.",
      },
      {
        id: "q8", section: "s2",
        q: "No Titanic, porque é que o boosting (AUC 0,863) ganhou às logísticas (0,847)?",
        options: [
          "Porque tem mais dados de treino.",
          "Porque apanha interações que a logística não vê sem ajuda, como a de sexo com classe.",
          "Porque não precisa de pré-processamento.",
          "Porque o `GridSearchCV` lhe deu mais combinações.",
        ],
        answer: 1,
        explain: "As mulheres da terceira classe sobreviveram muito menos do que as da primeira: uma interação que um modelo linear não constrói sozinho.",
      },
      {
        id: "q9", section: "s2",
        q: "Qual é a forma certa de reportar quanto vale o processo todo, incluindo a escolha de parâmetros?",
        options: [
          "O `best_score_` do `GridSearchCV`.",
          "A exatidão no treino.",
          "A média das 36 combinações da grelha.",
          "A validação aninhada, ou um conjunto de teste guardado desde o início e usado uma só vez.",
        ],
        answer: 3,
        explain: "Para escolher, validação cruzada; para reportar, validação aninhada ou um teste guardado.",
      },
      {
        id: "q10", section: "s3",
        q: "No `Bikeshare`, juntar as colunas `casual` e `registered` faz o RMSE cair de 35 para 3. Porquê?",
        options: [
          "Porque as duas colunas somam o alvo: é uma fuga pelo alvo.",
          "Porque são as variáveis mais importantes do tempo.",
          "Porque o `GroupKFold` deixa de funcionar.",
          "Porque passa a haver mais linhas.",
        ],
        answer: 0,
        explain: "`bikers` é `casual` + `registered`. No momento da previsão não se conhecem.",
      },
      {
        id: "q11", section: "s3",
        q: "No exemplo de Hastie, Tibshirani e Friedman (50 doentes, 5000 \"genes\" de ruído), que exatidão dá escolher as 100 melhores variáveis com todos os dados e só depois validar?",
        options: ["Cerca de 50%", "42%", "100%", "0%"],
        answer: 2,
        explain: "Entre 5000 variáveis ao acaso há sempre 100 que, por sorte, separam bem os 50 doentes. Dentro do pipeline dá 42% (perto de 50%, como deve ser).",
      },
      {
        id: "q12", section: "s3",
        q: "Um modelo classifica fotografias de doentes, com várias fotografias por doente. Que validação usar?",
        options: ["`KFold` aleatório", "`GroupKFold` por doente", "`TimeSeriesSplit`", "`StratifiedKFold` sem grupos"],
        answer: 1,
        explain: "Cada grupo (as fotografias do mesmo doente) tem de ficar inteiro de um só lado; senão o modelo pode reconhecer o doente em vez da doença.",
      },
      {
        id: "q13", section: "s3",
        q: "No `Bikeshare`, a validação `GroupKFold` por dia deu um RMSE de 35. Para que uso é esse o número honesto?",
        options: [
          "Para preencher horas em falta em dias que já se conhecem em parte.",
          "Para prever o mês que vem.",
          "Para prever dias inteiros que não se viram.",
          "Para nenhum: só o `TimeSeriesSplit` é honesto.",
        ],
        answer: 2,
        explain: "31 serve para preencher horas em dias conhecidos, 35 para prever dias inteiros novos e 55 para prever o mês que vem.",
      },
      {
        id: "q14", section: "s3",
        q: "Kapoor e Narayanan (2023) encontraram fugas de dados em quantos artigos científicos?",
        options: ["17", "294", "8", "Nenhum: as fugas são um problema de principiantes."],
        answer: 1,
        explain: "294 artigos de 17 áreas, muitas vezes com conclusões que não sobreviviam à correção.",
      },
      {
        id: "q15", section: "s4",
        q: "No `Caravan`, com o limiar de 0,5, a logística tem exatidão de 93,9%. Qual é a revocação?",
        options: ["93,9%", "6%", "41,3%", "1%"],
        answer: 3,
        explain: "Encontra um dos 104 compradores do teste: com o limiar de 0,5, quase ninguém tem probabilidade suficiente para ser \"comprador\".",
      },
      {
        id: "q16", section: "s4",
        q: "Qual é o valor da precisão média (AP) de um modelo ao acaso?",
        options: ["0,5", "A proporção de base", "1", "0"],
        answer: 1,
        explain: "A curva de precisão e revocação olha só para a classe rara; ao acaso, a precisão é a proporção de base (0,06 no Caravan).",
      },
      {
        id: "q17", section: "s4",
        q: "Com `class_weight=\"balanced\"` no Caravan, o que aconteceu ao erro de Brier?",
        options: ["Triplicou: de 0,054 para 0,192.", "Ficou igual.", "Desceu para metade.", "Ficou negativo."],
        answer: 0,
        explain: "As probabilidades deixaram de querer dizer o que dizem: a média prevista passou de 5,9% para 39%.",
      },
      {
        id: "q18", section: "s4",
        q: "Contactar uma pessoa custa 2 € e cada venda dá 50 €. Com probabilidades bem calibradas, a partir de que probabilidade compensa contactar?",
        options: ["0,5", "0,25", "0,04", "0,02"],
        answer: 2,
        explain: "Contactar compensa quando p × 50 > 2, ou seja, p > 2 / 50 = 0,04.",
      },
      {
        id: "q19", section: "s5",
        q: "Que pergunta responde a importância por permutação?",
        options: [
          "Porque é que o modelo fez esta previsão?",
          "De que variáveis depende o modelo, no todo?",
          "Como muda a previsão, em média, quando se muda uma variável?",
          "Que variável causa o resultado?",
        ],
        answer: 1,
        explain: "É uma resposta global, para o modelo todo, e não diz em que sentido cada variável atua.",
      },
      {
        id: "q20", section: "s5",
        q: "As curvas ICE da hora no `Bikeshare` separam-se em duas famílias. O que mostram?",
        options: [
          "Que o modelo tem uma fuga.",
          "Que a temperatura não importa.",
          "A interação da hora com o tipo de dia: dois picos nos dias úteis, uma bossa a meio do dia nos fins de semana.",
          "Que a média da dependência parcial está errada.",
        ],
        answer: 2,
        explain: "É a interação do M9, encontrada sem ninguém a procurar; a média sozinha escondia-a.",
      },
      {
        id: "q21", section: "s5",
        q: "Porque é que `day` aparecer em terceiro no SHAP do `Bikeshare` é um problema?",
        options: [
          "Porque o modelo aprendeu a tendência de crescimento de 2011, que não serve para prever 2012.",
          "Porque `day` é uma fuga pelo alvo.",
          "Porque o SHAP não funciona com inteiros.",
          "Porque `day` está correlacionado com `temp`.",
        ],
        answer: 0,
        explain: "Num 6 de janeiro do ano seguinte, o modelo vai prever como se fosse o início de 2011. É a mesma razão do erro maior no `TimeSeriesSplit`.",
      },
      {
        id: "q22", section: "s5",
        q: "Num classificador, em que unidades costumam estar os valores SHAP do `TreeExplainer`?",
        options: ["Probabilidade", "Percentagem de exatidão", "Unidades do alvo original", "Log-odds"],
        answer: 3,
        explain: "As unidades são as da previsão interna do modelo: log-odds (M8). A probabilidade obtém-se aplicando a função logística à soma.",
      },
    ],
    tf: [
      { id: "v1", section: "s1", q: "Num pipeline avaliado com `cross_validate`, a lista de categorias do `OneHotEncoder` é aprendida só com a parte de treino de cada divisão.", answer: true, explain: "Tudo o que aprende com os dados (mediana, médias, desvios padrão, categorias) aprende só com a parte de treino." },
      { id: "v2", section: "s1", q: "Criar variáveis novas melhora sempre o modelo.", answer: false, explain: "No Titanic, a família e o logaritmo da tarifa quase não mudaram nada. Experimenta-se, e a validação cruzada decide." },
      { id: "v3", section: "s2", q: "Depois do `fit`, `grelha.best_estimator_` é o pipeline vencedor retreinado com todos os dados.", answer: true, explain: "É o comportamento por omissão do `GridSearchCV` (refit=True)." },
      { id: "v4", section: "s2", q: "Quantos mais candidatos se experimentam, e quanto menos dados há, menor é o otimismo do vencedor.", answer: false, explain: "É ao contrário: mais candidatos e menos dados aumentam o otimismo." },
      { id: "v5", section: "s3", q: "Com padronização ou imputação fora do pipeline, o efeito na avaliação costuma ser pequeno, mas o pipeline torna-a certa por construção.", answer: true, explain: "O caso grave é a seleção de variáveis; mas não há razão para arriscar." },
      { id: "v6", section: "s3", q: "No `TimeSeriesSplit`, as primeiras linhas também acabam por ser usadas como teste numa das divisões.", answer: false, explain: "Treina-se sempre no passado e testa-se no período seguinte: as primeiras linhas só aparecem no treino." },
      { id: "v7", section: "s3", q: "Um resultado bom demais para ser verdade deve levar a procurar uma fuga antes de celebrar.", answer: true, explain: "É o último ponto da lista de verificação." },
      { id: "v8", section: "s4", q: "Com `class_weight=\"balanced\"`, a ordenação dos clientes do Caravan mudou muito.", answer: false, explain: "AUC de 0,744 contra 0,752 e AP de 0,146 contra 0,151: a ordenação é praticamente a mesma. Pesar as classes é, no essencial, outra forma de mexer no limiar." },
      { id: "v9", section: "s4", q: "Contactando os 10% de clientes com maior probabilidade, apanha-se 29% dos compradores do Caravan.", answer: true, explain: "30 dos 104 compradores em 174 contactos: um lift de 2,9." },
      { id: "v10", section: "s5", q: "Uma contribuição SHAP grande prova que mudar essa variável muda o resultado real.", answer: false, explain: "O SHAP explica o modelo, não o mundo. Para causas, são precisas experiências (M6)." },
      { id: "v11", section: "s5", q: "As contribuições SHAP de uma previsão, somadas ao valor de base, dão exatamente a previsão.", answer: true, explain: "No Bikeshare, o `np.allclose` da aula dá `True` para as 1710 horas do teste." },
      { id: "v12", section: "s5", q: "A dependência parcial pode refletir combinações que nunca existiram nos dados.", answer: true, explain: "Pôr 35 °C numa linha de janeiro cria uma hora que nunca existiu." },
    ],
  },

  // ---------------------------------------------------------------- CARTÕES
  flashcards: [
    { id: "f1", section: "s1", tag: "Pipelines", front: "Pipeline", back: "Uma sequência de passos que se comporta como um só modelo, com `fit`, `predict` e tudo o resto. Evita transformações diferentes em produção, fugas do teste para o treino e vários objetos para guardar." },
    { id: "f2", section: "s1", tag: "Pipelines", front: "`ColumnTransformer`", back: "Aplica um pré-processamento a cada grupo de colunas e junta o resultado: por exemplo, imputar com a mediana e padronizar as numéricas; imputar com o mais frequente e fazer one-hot nas categóricas." },
    { id: "f3", section: "s1", tag: "Pipelines", front: "O que acontece dentro do `cross_validate` com um pipeline", back: "Em cada divisão, medianas, médias, desvios padrão e listas de categorias são calculados só com a parte de treino; a parte de teste é transformada com esses valores, como dados novos." },
    { id: "f4", section: "s1", tag: "Pipelines", front: "`OneHotEncoder(handle_unknown=\"ignore\")`", back: "Categorias em colunas 0/1; uma categoria nunca vista fica com tudo a zero em vez de dar erro." },
    { id: "f5", section: "s1", tag: "Pipelines", front: "`SimpleImputer(add_indicator=True)` e `TargetEncoder`", back: "O primeiro junta uma coluna 0/1 a dizer onde faltava o valor (faltar pode ser informação). O segundo troca cada categoria pela média do alvo, calculada com validação cruzada interna; útil com centenas de categorias." },
    { id: "f6", section: "s1", tag: "Pipelines", front: "Guardar um pipeline treinado", back: "`joblib.dump(modelo, \"modelo.joblib\")` e `joblib.load`: um único ficheiro que recebe dados em bruto e faz tudo sozinho." },
    { id: "f7", section: "s2", tag: "Parâmetros", front: "Nomes dos parâmetros num pipeline", back: "O caminho até eles, com dois traços baixos: `modelo__C`, `prep__num__imputar__strategy`. Até o próprio passo `modelo` pode ser um parâmetro." },
    { id: "f8", section: "s2", tag: "Parâmetros", front: "`RandomizedSearchCV` (Bergstra & Bengio, 2012)", back: "Experimenta um número fixo de combinações sorteadas. Com o mesmo orçamento costuma ser melhor do que a grelha, porque só alguns parâmetros importam e o sorteio experimenta mais valores de cada um." },
    { id: "f9", section: "s2", tag: "Parâmetros", front: "Otimismo do vencedor", back: "O `best_score_` é a melhor de várias médias de validação cruzada; o melhor de muitos candidatos beneficia de sorte. Em ruído puro, prometeu 58% (a verdade é 50%)." },
    { id: "f10", section: "s2", tag: "Parâmetros", front: "Validação cruzada aninhada", back: "Ciclo exterior separa partes de teste; dentro de cada parte de treino, o interior faz a procura completa; o vencedor é avaliado na parte exterior. Basta `cross_val_score(GridSearchCV(...), X, y, cv=externo)`." },
    { id: "f11", section: "s2", tag: "Parâmetros", front: "Escolher e reportar", back: "Para escolher o modelo e os parâmetros: validação cruzada. Para reportar quanto vale o processo todo: validação aninhada ou um teste guardado desde o início e usado uma só vez." },
    { id: "f12", section: "s3", tag: "Fugas", front: "Fuga de dados (Kaufman et al., 2012)", back: "O modelo usa, no treino ou na avaliação, informação que não vai ter quando for usado a sério. Resultado: uma avaliação brilhante e um modelo que falha em produção." },
    { id: "f13", section: "s3", tag: "Fugas", front: "As três famílias de fugas", back: "Variáveis que trazem a resposta; preparar ou escolher com os dados todos; dividir mal (grupos ou tempo misturados)." },
    { id: "f14", section: "s3", tag: "Fugas", front: "A pergunta a fazer a cada variável", back: "No momento em que vou fazer a previsão, já sei isto? (`alive` no Titanic, `casual` e `registered` no Bikeshare, \"conta bloqueada\" na fraude)." },
    { id: "f15", section: "s3", tag: "Fugas", front: "Os 5000 \"genes\" de ruído (Hastie et al., 2009)", back: "Escolher as 100 melhores variáveis com todos os dados e depois validar: 100%. Com a seleção dentro do pipeline: 42% (perto de 50%, como deve ser)." },
    { id: "f16", section: "s3", tag: "Validação", front: "`KFold`, `GroupKFold`, `TimeSeriesSplit`", back: "Linhas independentes; grupos de linhas parecidas, cada grupo inteiro de um só lado; prever o futuro, treinar sempre no passado e testar no período seguinte." },
    { id: "f17", section: "s3", tag: "Validação", front: "Bikeshare com três validações", back: "Aleatória 31, por dia 35, temporal 55. Escolher a validação é decidir para que serve o modelo." },
    { id: "f18", section: "s3", tag: "Fugas", front: "Lista de verificação de fugas", back: "Já conheço a variável na previsão? O pré-processamento está no pipeline? As linhas são independentes? Há duplicados entre treino e teste? É bom demais para ser verdade?" },
    { id: "f19", section: "s4", tag: "Classes raras", front: "Paradoxo da exatidão", back: "Com uma classe rara, prever sempre a outra dá exatidão alta e revocação zero. No Caravan, o limiar de 0,5 deu 93,9% de exatidão e 1% de revocação." },
    { id: "f20", section: "s4", tag: "Classes raras", front: "Primeira solução: mudar o limiar", back: "Com 0,06 (a proporção de base) no Caravan: 566 marcados, dois terços dos compradores, precisão 0,124. O limiar certo vem dos custos: contactar compensa quando p × ganho > custo." },
    { id: "f21", section: "s4", tag: "Classes raras", front: "`class_weight=\"balanced\"`", back: "Pesa a classe rara (cerca de 16 vezes no Caravan). Quase a mesma ordenação (AUC 0,744 contra 0,752), mas a probabilidade média passa de 5,9% para 39%: descalibra as probabilidades." },
    { id: "f22", section: "s4", tag: "Classes raras", front: "Erro de Brier", back: "A média de (p − y)²; menor é melhor. Mede se as probabilidades querem dizer o que dizem. Com `class_weight` no Caravan, triplicou (0,054 → 0,192)." },
    { id: "f23", section: "s4", tag: "Classes raras", front: "Recomendação prática para classes raras", back: "Treinar normalmente, avaliar com métricas que não dependem do limiar, escolher o limiar pelo custo ou pela capacidade. Pesos ou SMOTE só se a validação mostrar que melhoram a ordenação." },
    { id: "f24", section: "s4", tag: "Métricas", front: "Precisão média (AP)", back: "Área da curva de precisão e revocação; olha só para a classe rara. Ao acaso vale a proporção de base: no Caravan, 0,151 é 2,5 vezes o acaso." },
    { id: "f25", section: "s4", tag: "Métricas", front: "Curva de ganhos e lift", back: "Ordenam-se os clientes pela probabilidade e vê-se que fração dos positivos se apanha contactando os primeiros x%. Caravan: 10% dos clientes apanham 29% dos compradores; lift = precisão / proporção de base = 2,9." },
    { id: "f26", section: "s5", tag: "Interpretação", front: "Importância por permutação", back: "Global: quanto o erro piora ao baralhar cada variável em dados novos. No Bikeshare, a hora faz o RMSE subir 122 bicicletas. Não diz o sentido do efeito." },
    { id: "f27", section: "s5", tag: "Interpretação", front: "Dependência parcial e curvas ICE", back: "Dependência parcial (Friedman, 2001): o efeito médio de mudar uma variável. ICE (Goldstein et al., 2015): o mesmo, linha a linha; mostraram as duas famílias de dias no Bikeshare." },
    { id: "f28", section: "s5", tag: "Interpretação", front: "SHAP (Lundberg & Lee, 2017)", back: "Reparte cada previsão pelas variáveis com valores de Shapley: f̂(x) = φ₀ + Σ φⱼ, com soma exata. O `TreeExplainer` tem um algoritmo exato e rápido para árvores." },
    { id: "f29", section: "s5", tag: "Interpretação", front: "A meia-noite de 6 de janeiro no Bikeshare", back: "Base 144,5; a hora tira 77, `day` tira 20, o frio 19, o inverno 10… previsão 10,8. Na realidade foram 11." },
    { id: "f30", section: "s5", tag: "Interpretação", front: "Quatro cuidados ao interpretar", back: "Explica o modelo, não o mundo; variáveis correlacionadas repartem o mérito; a dependência parcial inventa combinações; as unidades são as da previsão (log-odds num classificador)." },
  ],

  // ---------------------------------------------------------------- NOTEBOOK
  notebook: {
    filename: "M11 — exercícios",
    cells: [
      {
        type: "md",
        source:
          "# M11 — Pipelines e avaliação rigorosa\n\nExemplos da aula (correr pela ordem, no mesmo notebook) e os exercícios 2 a 6 e 8 a 10. Os exercícios 1 e 7 fazem-se à mão. Precisa de internet para ler os dados; o SHAP já vem no Colab (localmente: `pip install shap`). Guardar no Drive, na pasta da Fase 2.",
      },
      { type: "md", source: "## 1. Pipelines: o pré-processamento dentro do modelo" },
      { type: "code", source: C_TITANIC },
      { type: "code", source: C_FIT },
      { type: "md", source: "## 2. Escolher parâmetros sem se enganar" },
      { type: "code", source: C_GRID },
      { type: "code", source: C_NESTED },
      { type: "md", source: "## 3. Fugas de dados" },
      { type: "code", source: C_ALIVE },
      { type: "code", source: C_GENES },
      { type: "code", source: C_BIKE },
      { type: "md", source: "## 4. Classes desequilibradas" },
      { type: "code", source: C_CARAVAN },
      { type: "code", source: C_LIMIAR },
      { type: "code", source: C_PESADO },
      { type: "code", source: C_GANHOS },
      { type: "md", source: "## 5. Interpretar modelos" },
      { type: "code", source: C_PERM },
      { type: "code", source: C_PDP },
      { type: "code", source: C_SHAP },
      { type: "md", source: "## Exercício 2\n\nEngenharia de variáveis no Titanic: a versão da aula, (b) com `familia` e `log_fare`, (c) com `add_indicator=True` e `deck`." },
      { type: "code", source: "ti2 = ti.assign(familia=ti[\"sibsp\"] + ti[\"parch\"] + 1, log_fare=np.log1p(ti[\"fare\"]))\n" },
      { type: "md", source: "## Exercício 3\n\nGrelha, validação aninhada e `RandomizedSearchCV` nos dados de cancro da mama." },
      { type: "code", source: "from sklearn.datasets import load_breast_cancer\nfrom sklearn.model_selection import RandomizedSearchCV\nfrom scipy.stats import loguniform\n\nX_cm, y_cm = load_breast_cancer(return_X_y=True)\n" },
      { type: "md", source: "## Exercício 4\n\nUma fuga escondida: a média do alvo por \"cabine\" calculada antes, e o `TargetEncoder` no pipeline." },
      { type: "code", source: "from sklearn.preprocessing import TargetEncoder\n\nrng = np.random.default_rng(0)\nti4 = ti.assign(cabine_falsa=rng.integers(0, 400, size=len(ti)).astype(str))\n" },
      { type: "md", source: "## Exercício 5\n\nLucro da campanha: custo de 10 € por contacto, margem de 100 € por venda." },
      { type: "code", source: "from sklearn.model_selection import cross_val_predict\n\ncusto, margem = 10, 100\n" },
      { type: "md", source: "## Exercício 6\n\nO C da logística pela precisão média, e o boosting." },
      { type: "code", source: "for C in [0.001, 0.01, 0.1, 1]:\n    pass\n" },
      { type: "md", source: "## Exercício 8\n\nSHAP no Titanic, com `HistGradientBoostingClassifier(learning_rate=0.03, max_depth=3, random_state=0)`." },
      { type: "code", source: "import shap\n" },
      { type: "md", source: "## Exercício 9\n\nVariáveis correlacionadas: `temp` e `atemp`, com a divisão por dias da secção 5." },
      { type: "code", source: "from sklearn.metrics import root_mean_squared_error\n\nprint(round(Xb[\"temp\"].corr(Xb[\"atemp\"]), 3))\n" },
      { type: "md", source: "## Exercício 10\n\nAuditoria: a avaliação do colega e a `avaliacao_honesta`." },
      { type: "code", source: `${E10_CODE}\n\n\ndef avaliacao_honesta(X, y):\n    pass\n` },
      { type: "md", source: "(d) Mensagem ao colega:\n\n" },
      { type: "md", source: "## Notas\n\nO que aprendi neste módulo, em três frases:" },
    ],
  },
  source: "curso-engenharia-ia 2/modulo-11-pipelines-avaliacao",
};
