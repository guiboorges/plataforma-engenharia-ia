import type { ModuleContent } from "../types";

// Módulo 10 — Aprendizagem não supervisionada.
// Fonte: curso-engenharia-ia 2/modulo-10-nao-supervisionada (01-aula, 02-apostila, 03-exercicios, 04-prova, 05-gabarito,
// codigo/exemplos_m10.py, codigo/figuras_m10.py e img/). As seis imagens da aula entram como figuras; as duas fórmulas,
// escritas em LaTeX na aula, passam a texto Unicode (não há renderizador de LaTeX). O k-means passo a passo nos pinguins,
// o DBSCAN nas duas luas e a PCA em duas dimensões têm widgets interativos (src/components/widgets/m10), com a lógica
// testada contra o scikit-learn 1.9 e o NumPy 2.5 nos mesmos pontos (os rótulos do DBSCAN são iguais aos do scikit-learn).
// Todo o código da aula e do gabarito foi corrido em Python 3.13, NumPy 2.5, pandas 3.0, SciPy 1.18, scikit-learn 1.9 e
// umap-learn 0.5.12: o campo `output` de cada bloco tem o resultado, igual ao dos comentários. Onde o resultado depende da
// máquina (UMAP e t-SNE) ou difere no último dígito, fica o valor do texto oficial: UMAP 0.979 em vez de 0.976 (aula);
// t-SNE 0.974 / 0.965 / 0.978 em vez de 0.976 / 0.964 / 0.973 (exercício 7); 0.824 em vez de 0.823 (exercício 6, k = 5).
// As verificações rápidas, o banco do simulado e os cartões foram escritos pela plataforma a partir da aula, com os
// números confirmados em Python.

// ---------------------------------------------------------------- código da aula (01-aula.md)

const C_KMEANS = String.raw`import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics import adjusted_rand_score

URL_PINGUINS = "https://raw.githubusercontent.com/mwaskom/seaborn-data/master/penguins.csv"
pg = pd.read_csv(URL_PINGUINS)
medidas = ["bill_length_mm", "bill_depth_mm", "flipper_length_mm", "body_mass_g"]
pg = pg.dropna(subset=medidas)
print(pg.shape, pg["species"].value_counts().to_dict())   # (342, 7) {'Adelie': 151, 'Gentoo': 123, 'Chinstrap': 68}

escala = StandardScaler().fit(pg[medidas])
Z = escala.transform(pg[medidas])
kmeans = KMeans(n_clusters=3, n_init=10, random_state=0).fit(Z)
print(pd.crosstab(pg["species"], kmeans.labels_))
# col_0        0    1   2
# species
# Adelie       0  127  24
# Chinstrap    0    5  63
# Gentoo     123    0   0
print(round(adjusted_rand_score(pg["species"], kmeans.labels_), 3))   # 0.793`;

const O_KMEANS = `(342, 7) {'Adelie': 151, 'Gentoo': 123, 'Chinstrap': 68}
col_0        0    1   2
species
Adelie       0  127  24
Chinstrap    0    5  63
Gentoo     123    0   0
0.793`;

const C_SEM_ESCALA = String.raw`sem_escala = KMeans(n_clusters=3, n_init=10, random_state=0).fit(pg[medidas])
print(round(adjusted_rand_score(pg["species"], sem_escala.labels_), 3))   # 0.331`;

const C_PERFIS = String.raw`print(pd.DataFrame(escala.inverse_transform(kmeans.cluster_centers_), columns=medidas).round(1))
#    bill_length_mm  bill_depth_mm  flipper_length_mm  body_mass_g
# 0            47.5           15.0              217.2       5076.0
# 1            38.2           18.1              188.4       3584.7
# 2            47.5           18.8              196.9       3902.0`;

const O_PERFIS = `   bill_length_mm  bill_depth_mm  flipper_length_mm  body_mass_g
0            47.5           15.0              217.2       5076.0
1            38.2           18.1              188.4       3584.7
2            47.5           18.8              196.9       3902.0`;

const C_QUANTOS = String.raw`from sklearn.metrics import silhouette_score

for k in range(2, 9):
    km = KMeans(n_clusters=k, n_init=10, random_state=0).fit(Z)
    print(k, round(km.inertia_, 1), round(silhouette_score(Z, km.labels_), 3))
# 2 565.7 0.532
# 3 379.4 0.447
# 4 300.4 0.4
# 5 232.6 0.378
# 6 204.3 0.372
# 7 187.1 0.335
# 8 171.0 0.296`;

const O_QUANTOS = `2 565.7 0.532
3 379.4 0.447
4 300.4 0.4
5 232.6 0.378
6 204.3 0.372
7 187.1 0.335
8 171.0 0.296`;

const C_ESTADOS = String.raw`from scipy.cluster.hierarchy import linkage, fcluster, dendrogram

us = pd.read_csv("https://raw.githubusercontent.com/vincentarelbundock/Rdatasets/master/csv/datasets/USArrests.csv",
                 index_col=0)
Zu = StandardScaler().fit_transform(us)
ligacoes = linkage(Zu, method="complete")                  # a história das 49 fusões
grupos = fcluster(ligacoes, t=4, criterion="maxclust")     # cortar em 4 grupos
print(us.assign(grupo=grupos).groupby("grupo").mean().round(1))
#        Murder  Assault  UrbanPop  Rape
# grupo
# 1         3.2     78.7      49.3  11.6
# 2         5.9    134.5      70.8  18.6
# 3        11.1    264.1      79.1  32.6
# 4        14.1    252.8      53.5  24.5
print(list(us.index[grupos == 4]))
# ['Alabama', 'Alaska', 'Georgia', 'Louisiana', 'Mississippi', 'North Carolina', 'South Carolina', 'Tennessee']`;

const O_ESTADOS = `       Murder  Assault  UrbanPop  Rape
grupo
1         3.2     78.7      49.3  11.6
2         5.9    134.5      70.8  18.6
3        11.1    264.1      79.1  32.6
4        14.1    252.8      53.5  24.5
['Alabama', 'Alaska', 'Georgia', 'Louisiana', 'Mississippi', 'North Carolina', 'South Carolina', 'Tennessee']`;

const C_LIGACAO = String.raw`from sklearn.cluster import AgglomerativeClustering

for metodo in ["ward", "complete", "average", "single"]:
    ag = AgglomerativeClustering(n_clusters=3, linkage=metodo).fit(Z)
    print(metodo, round(adjusted_rand_score(pg["species"], ag.labels_), 3), np.bincount(ag.labels_))
# ward 0.916 [162 123  57]
# complete 0.895 [123 165  54]
# average 0.637 [219 119   4]
# single 0.657 [218   1 123]`;

const O_LIGACAO = `ward 0.916 [162 123  57]
complete 0.895 [123 165  54]
average 0.637 [219 119   4]
single 0.657 [218   1 123]`;

const C_LUAS = String.raw`from sklearn.datasets import make_moons
from sklearn.cluster import DBSCAN, HDBSCAN
from sklearn.neighbors import NearestNeighbors

X_luas, y_luas = make_moons(n_samples=400, noise=0.08, random_state=0)
km = KMeans(n_clusters=2, n_init=10, random_state=0).fit(X_luas)
print(round(adjusted_rand_score(y_luas, km.labels_), 3))          # 0.269`;

const C_EPS = String.raw`dist, _ = NearestNeighbors(n_neighbors=5).fit(X_luas).kneighbors(X_luas)   # o 1.º vizinho é o próprio ponto
print(np.percentile(dist[:, -1], [50, 90, 95]).round(3))                # [0.075 0.122 0.145]

for eps in [0.05, 0.1, 0.15, 0.2]:
    rotulos = DBSCAN(eps=eps, min_samples=5).fit(X_luas).labels_
    n_grupos = len(set(rotulos)) - (1 if -1 in rotulos else 0)
    print(eps, n_grupos, (rotulos == -1).sum(), round(adjusted_rand_score(y_luas, rotulos), 3))
# 0.05 17 297 0.018     <- raio pequeno: quase tudo é ruído
# 0.1 7 31 0.296
# 0.15 2 1 0.995        <- as duas luas, e um ponto de ruído
# 0.2 1 0 0.0           <- raio grande: tudo num grupo`;

const O_EPS = `[0.075 0.122 0.145]
0.05 17 297 0.018
0.1 7 31 0.296
0.15 2 1 0.995
0.2 1 0 0.0`;

const C_HDBSCAN = String.raw`hd = HDBSCAN(min_cluster_size=20, copy=True).fit(X_luas)
print(len(set(hd.labels_)) - 1, (hd.labels_ == -1).sum(), round(adjusted_rand_score(y_luas, hd.labels_), 3))   # 2 13 0.927`;

const C_PCA = String.raw`from sklearn.datasets import load_digits
from sklearn.decomposition import PCA

digitos = load_digits()
X_dig, y_dig = digitos.data, digitos.target
print(X_dig.shape)                                     # (1797, 64)
pca = PCA().fit(X_dig)
acumulada = np.cumsum(pca.explained_variance_ratio_)
print(pca.explained_variance_ratio_[:3].round(3))      # [0.149 0.136 0.118]
print(acumulada[[1, 9]].round(3))                      # [0.285 0.738]
print(int(np.argmax(acumulada >= 0.9)) + 1)            # 21`;

const O_PCA = `(1797, 64)
[0.149 0.136 0.118]
[0.285 0.738]
21`;

const C_MAPAS = String.raw`from sklearn.manifold import TSNE
import umap                                            # !pip install umap-learn
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import cross_val_score

mapas = {"PCA": PCA(n_components=2).fit_transform(X_dig),
         "t-SNE": TSNE(n_components=2, perplexity=30, random_state=0).fit_transform(X_dig),
         "UMAP": umap.UMAP(n_neighbors=15, min_dist=0.1, random_state=0).fit_transform(X_dig)}
for nome, mapa in mapas.items():
    exatidao = cross_val_score(KNeighborsClassifier(n_neighbors=5), mapa, y_dig, cv=5).mean()
    print(nome, round(exatidao, 3))
# PCA 0.603
# t-SNE 0.976
# UMAP 0.976
print(round(cross_val_score(KNeighborsClassifier(n_neighbors=5), X_dig, y_dig, cv=5).mean(), 3))   # 0.963 nas 64 dimensões`;

const O_MAPAS = `PCA 0.603
t-SNE 0.976
UMAP 0.976
0.963`;

const C_ANOM = String.raw`from sklearn.ensemble import IsolationForest
from sklearn.neighbors import LocalOutlierFactor
from sklearn.metrics import roc_auc_score

rng = np.random.default_rng(0)
normais = np.vstack([rng.normal([0, 0], 0.5, size=(300, 2)), rng.normal([4, 4], 1.2, size=(300, 2))])
estranhos = rng.uniform(-3, 8, size=(30, 2))
X_anom = np.vstack([normais, estranhos])
e_estranho = np.r_[np.zeros(600), np.ones(30)]

pont_if = -IsolationForest(n_estimators=300, random_state=0).fit(X_anom).score_samples(X_anom)
pont_lof = -LocalOutlierFactor(n_neighbors=20).fit(X_anom).negative_outlier_factor_
for nome, pont in [("Isolation Forest", pont_if), ("LOF", pont_lof)]:
    top30 = np.argsort(-pont)[:30]
    print(nome, round(roc_auc_score(e_estranho, pont), 3), int(e_estranho[top30].sum()))
# Isolation Forest 0.922 17
# LOF 0.886 18`;

const O_ANOM = `Isolation Forest 0.922 17
LOF 0.886 18`;

const C_CREDIT = String.raw`URL = "https://raw.githubusercontent.com/intro-stat-learning/ISLP/main/ISLP/data/"
cr = pd.read_csv(URL + "Credit.csv")
numericas = ["Income", "Limit", "Rating", "Cards", "Age", "Education", "Balance"]
Zc = StandardScaler().fit_transform(cr[numericas])
cr["pont_if"] = -IsolationForest(n_estimators=300, random_state=0).fit(Zc).score_samples(Zc)
cr["pont_lof"] = -LocalOutlierFactor(n_neighbors=20).fit(Zc).negative_outlier_factor_
print(cr.sort_values("pont_if", ascending=False)[numericas].head(5).to_string())
#       Income  Limit  Rating  Cards  Age  Education  Balance
# 323  182.728  13913     982      4   98         17     1999
# 28   186.634  13414     949      2   41         14     1809
# 293  140.672  11200     817      7   46          9     1677
# 193  130.209  10088     730      7   39         19     1426
# 355  180.682  11966     832      2   58          8     1405
print(cr.sort_values("pont_lof", ascending=False)[numericas].head(5).to_string())
#       Income  Limit  Rating  Cards  Age  Education  Balance
# 383   14.292   3274     282      9   64          9      382
# 205   10.793   3878     321      8   29         13      638
# 323  182.728  13913     982      4   98         17     1999
# 193  130.209  10088     730      7   39         19     1426
# 293  140.672  11200     817      7   46          9     1677`;

const O_CREDIT = `      Income  Limit  Rating  Cards  Age  Education  Balance
323  182.728  13913     982      4   98         17     1999
28   186.634  13414     949      2   41         14     1809
293  140.672  11200     817      7   46          9     1677
193  130.209  10088     730      7   39         19     1426
355  180.682  11966     832      2   58          8     1405
      Income  Limit  Rating  Cards  Age  Education  Balance
383   14.292   3274     282      9   64          9      382
205   10.793   3878     321      8   29         13      638
323  182.728  13913     982      4   98         17     1999
193  130.209  10088     730      7   39         19     1426
293  140.672  11200     817      7   46          9     1677`;

// ---------------------------------------------------------------- fórmulas (LaTeX na aula, aqui em Unicode)

const F_INERCIA = `W = Σₖ₌₁ᴷ Σᵢ∈Cₖ ‖xᵢ − μₖ‖²`;
const F_SILHUETA = `s = (b − a) / max(a, b)`;

// ---------------------------------------------------------------- gabarito (05-gabarito.md)

const G_SETUP = String.raw`from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics import adjusted_rand_score, silhouette_score, silhouette_samples
from sklearn.datasets import load_digits

pg = pd.read_csv("https://raw.githubusercontent.com/mwaskom/seaborn-data/master/penguins.csv")
medidas = ["bill_length_mm", "bill_depth_mm", "flipper_length_mm", "body_mass_g"]
pg = pg.dropna(subset=medidas)
Z = StandardScaler().fit_transform(pg[medidas])
digitos = load_digits()
X_dig, y_dig = digitos.data, digitos.target`;

const G1 = String.raw`x1 = np.array([[1], [2], [4], [9], [10], [12]])
km1 = KMeans(n_clusters=2, init=np.array([[1], [2]]), n_init=1).fit(x1)
print(km1.cluster_centers_.ravel().round(3), round(km1.inertia_, 3), km1.n_iter_)   # [ 2.333 10.333] 9.333 3
print(silhouette_samples(x1, km1.labels_).round(3))   # [0.786 0.82  0.605 0.7   0.804 0.741]`;

const G2 = String.raw`from scipy.cluster.hierarchy import linkage

pontos = np.array([[1], [2], [6], [8], [15]])
for metodo in ["single", "complete"]:
    print(metodo, linkage(pontos, method=metodo)[:, 2])
# single [1. 2. 4. 7.]
# complete [ 1.  2.  7. 14.]`;

const G3 = String.raw`for inicio in ["random", "k-means++"]:
    res = []
    for s in range(20):
        km = KMeans(n_clusters=3, n_init=1, init=inicio, random_state=s).fit(Z)
        res.append((round(km.inertia_, 1), round(adjusted_rand_score(pg["species"], km.labels_), 3)))
    print(inicio, pd.Series(res).value_counts().sort_index().to_dict())`;

const O_G3 = `random {(379.4, 0.793): 9, (379.4, 0.799): 1, (381.1, 0.9): 1, (381.1, 0.908): 1, (381.3, 0.893): 3, (486.2, 0.512): 2, (486.3, 0.513): 3}
k-means++ {(379.4, 0.793): 8, (379.4, 0.799): 3, (381.1, 0.908): 3, (381.3, 0.893): 4, (486.2, 0.512): 1, (486.3, 0.513): 1}`;

const G4 = String.raw`from sklearn.neighbors import NearestNeighbors
from sklearn.cluster import DBSCAN, HDBSCAN

dist, _ = NearestNeighbors(n_neighbors=5).fit(Z).kneighbors(Z)
print(np.percentile(dist[:, -1], [50, 90, 95]).round(3))     # [0.466 0.721 0.794]
for eps in [0.3, 0.4, 0.5, 0.6, 0.7, 0.8]:
    rot = DBSCAN(eps=eps, min_samples=5).fit(Z).labels_
    print(eps, len(set(rot)) - (1 if -1 in rot else 0), (rot == -1).sum(), round(adjusted_rand_score(pg["species"], rot), 3))
for m in [5, 10, 20, 40]:
    rot = HDBSCAN(min_cluster_size=m, copy=True).fit(Z).labels_
    print(m, len(set(rot)) - (1 if -1 in rot else 0), (rot == -1).sum(), round(adjusted_rand_score(pg["species"], rot), 3))`;

const O_G4 = `[0.466 0.721 0.794]
0.3 4 317 -0.003
0.4 10 171 0.15
0.5 4 69 0.663
0.6 2 33 0.584
0.7 2 16 0.639
0.8 2 5 0.647
5 2 2 0.653
10 2 2 0.653
20 2 4 0.651
40 2 27 0.624`;

const G5 = String.raw`valores, vetores = np.linalg.eigh(np.array([[4, 2], [2, 3]]))
print(valores.round(3), (valores / valores.sum()).round(3), vetores[:, 1].round(3))   # [1.438 5.562] [0.205 0.795] [-0.788 -0.615]`;

const G6 = String.raw`from sklearn.decomposition import PCA
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.model_selection import cross_val_score

for k in [2, 5, 10, 21, 40, 64]:
    exatidao = cross_val_score(make_pipeline(PCA(n_components=k), LogisticRegression(max_iter=5000)), X_dig, y_dig, cv=5).mean()
    pca_k = PCA(n_components=k).fit(X_dig)
    erro = np.mean((X_dig - pca_k.inverse_transform(pca_k.transform(X_dig))) ** 2)
    print(k, round(exatidao, 3), round(erro, 2))

fig, eixos = plt.subplots(1, 4, figsize=(8, 2.3))
eixos[0].imshow(X_dig[0].reshape(8, 8), cmap="gray_r"); eixos[0].set_title("original")
for ax, k in zip(eixos[1:], [2, 10, 21]):
    p = PCA(n_components=k).fit(X_dig)
    ax.imshow(p.inverse_transform(p.transform(X_dig[:1])).reshape(8, 8), cmap="gray_r"); ax.set_title(f"{k} componentes")
for ax in eixos: ax.axis("off")
plt.show()`;

const O_G6 = `2 0.574 13.42
5 0.823 8.54
10 0.888 4.91
21 0.894 1.82
40 0.91 0.22
64 0.913 0.0`;

const G7 = String.raw`from sklearn.manifold import TSNE
from sklearn.neighbors import KNeighborsClassifier

for p in [5, 30, 100]:
    mapa = TSNE(perplexity=p, random_state=0).fit_transform(X_dig)
    print(p, round(cross_val_score(KNeighborsClassifier(n_neighbors=5), mapa, y_dig, cv=5).mean(), 3))
# 5 0.976
# 30 0.976
# 100 0.964
for s in [0, 1]:
    mapa = TSNE(perplexity=30, init="random", random_state=s).fit_transform(X_dig)
    print(s, round(cross_val_score(KNeighborsClassifier(n_neighbors=5), mapa, y_dig, cv=5).mean(), 3))
# 0 0.973
# 1 0.973
ruido = np.random.default_rng(0).normal(size=(500, 50))
fig, eixos = plt.subplots(1, 2, figsize=(9, 4))
for ax, p in zip(eixos, [2, 30]):
    m = TSNE(perplexity=p, random_state=0).fit_transform(ruido)
    ax.scatter(m[:, 0], m[:, 1], s=4); ax.set_title(f"ruído, perplexidade {p}")
plt.show()`;

const O_G7 = `5 0.976
30 0.976
100 0.964
0 0.973
1 0.973`;

const G8 = String.raw`from sklearn.ensemble import IsolationForest

pont = -IsolationForest(n_estimators=300, random_state=0).fit(X_dig).score_samples(X_dig)
ordem = np.argsort(-pont)                              # do mais anómalo para o mais normal
fig, eixos = plt.subplots(1, 10, figsize=(12, 1.8))
for ax, i in zip(eixos, ordem[:10]):
    ax.imshow(X_dig[i].reshape(8, 8), cmap="gray_r"); ax.set_title(str(y_dig[i])); ax.axis("off")
plt.show()
print(y_dig[ordem[:10]])                               # [9 7 7 7 5 1 4 7 4 5]
print(pd.Series(y_dig[ordem[:50]]).value_counts().to_dict())   # {7: 17, 4: 9, 9: 8, 5: 8, 1: 5, 2: 1, 6: 1, 0: 1}
print(y_dig[ordem[-10:]])                              # [1 1 1 1 1 1 5 1 1 8]`;

const O_G8 = `[9 7 7 7 5 1 4 7 4 5]
{7: 17, 4: 9, 9: 8, 5: 8, 1: 5, 2: 1, 6: 1, 0: 1}
[1 1 1 1 1 1 5 1 1 8]`;

const G9 = String.raw`from sklearn.neighbors import LocalOutlierFactor
from sklearn.metrics import roc_auc_score

rng = np.random.default_rng(0)
normais = np.vstack([rng.normal([0, 0], 0.5, size=(300, 2)), rng.normal([4, 4], 1.2, size=(300, 2))])
estranhos = rng.uniform(-3, 8, size=(30, 2))
X_anom = np.vstack([normais, estranhos])
e_estranho = np.r_[np.zeros(600), np.ones(30)]

for n in [5, 20, 50, 100]:                             # (a)
    p = -LocalOutlierFactor(n_neighbors=n).fit(X_anom).negative_outlier_factor_
    print(n, round(roc_auc_score(e_estranho, p), 3))
# 5 0.798
# 20 0.886
# 50 0.893
# 100 0.901
for extra in [2, 10, 50]:                              # (b)
    Xe = np.hstack([X_anom, np.random.default_rng(1).normal(size=(len(X_anom), extra))])
    p_if = -IsolationForest(n_estimators=300, random_state=0).fit(Xe).score_samples(Xe)
    p_lof = -LocalOutlierFactor(n_neighbors=20).fit(Xe).negative_outlier_factor_
    print(extra, round(roc_auc_score(e_estranho, p_if), 3), round(roc_auc_score(e_estranho, p_lof), 3))
# 2 0.826 0.856
# 10 0.649 0.808
# 50 0.524 0.74`;

const O_G9 = `5 0.798
20 0.886
50 0.893
100 0.901
2 0.826 0.856
10 0.649 0.808
50 0.524 0.74`;

const G10 = String.raw`URL = "https://raw.githubusercontent.com/intro-stat-learning/ISLP/main/ISLP/data/"
cr = pd.read_csv(URL + "Credit.csv")
print(cr[["Income", "Limit", "Rating", "Balance"]].corr().round(2))
#          Income  Limit  Rating  Balance
# Income     1.00   0.79    0.79     0.46
# Limit      0.79   1.00    1.00     0.86
# Rating     0.79   1.00    1.00     0.86
# Balance    0.46   0.86    0.86     1.00

variaveis = ["Income", "Limit", "Balance", "Age", "Cards"]
escala = StandardScaler().fit(cr[variaveis])
Zc = escala.transform(cr[variaveis])
for k in range(2, 9):
    km = KMeans(n_clusters=k, n_init=10, random_state=0).fit(Zc)
    print(k, round(km.inertia_, 1), round(silhouette_score(Zc, km.labels_), 3), np.bincount(km.labels_))
# 2 1373.1 0.34 [308  92]
# 3 1119.2 0.24 [191  54 155]
# 4 942.2 0.235 [127  59 115  99]
# 5 824.5 0.232 [ 63  97 113  84  43]
# 6 747.3 0.224 [58 87 38 67 87 63]
# 7 679.9 0.226 [83 53 69 22 70 50 53]
# 8 620.8 0.227 [50 22 49 72 68 54 46 39]

km4 = KMeans(n_clusters=4, n_init=10, random_state=0).fit(Zc)
perfil = pd.DataFrame(escala.inverse_transform(km4.cluster_centers_), columns=variaveis).round(1)
perfil["clientes"] = np.bincount(km4.labels_)
print(perfil)
#    Income   Limit  Balance   Age  Cards  clientes
# 0    31.1  3022.4    142.7  67.7    3.0       127
# 1   113.0  8695.9   1071.6  64.2    2.8        59
# 2    32.9  3822.2    342.7  38.0    2.2       115
# 3    37.3  5634.1    881.3  55.7    3.8        99`;

const O_G10 = `         Income  Limit  Rating  Balance
Income     1.00   0.79    0.79     0.46
Limit      0.79   1.00    1.00     0.86
Rating     0.79   1.00    1.00     0.86
Balance    0.46   0.86    0.86     1.00
2 1373.1 0.34 [308  92]
3 1119.2 0.24 [191  54 155]
4 942.2 0.235 [127  59 115  99]
5 824.5 0.232 [ 63  97 113  84  43]
6 747.3 0.224 [58 87 38 67 87 63]
7 679.9 0.226 [83 53 69 22 70 50 53]
8 620.8 0.227 [50 22 49 72 68 54 46 39]
   Income   Limit  Balance   Age  Cards  clientes
0    31.1  3022.4    142.7  67.7    3.0       127
1   113.0  8695.9   1071.6  64.2    2.8        59
2    32.9  3822.2    342.7  38.0    2.2       115
3    37.3  5634.1    881.3  55.7    3.8        99`;

const G_PROVA = String.raw`from sklearn.datasets import load_wine
from sklearn.decomposition import PCA
from sklearn.ensemble import IsolationForest

vinhos = load_wine(as_frame=True)
Xv, yv = vinhos.data, vinhos.target
Zv = StandardScaler().fit_transform(Xv)
for k in range(2, 7):                                                   # (a)
    km = KMeans(n_clusters=k, n_init=10, random_state=0).fit(Zv)
    print(k, round(km.inertia_, 1), round(silhouette_score(Zv, km.labels_), 3))
# 2 1659.0 0.268
# 3 1277.9 0.285
# 4 1180.7 0.246
# 5 1110.4 0.203
# 6 1044.5 0.196

km3 = KMeans(n_clusters=3, n_init=10, random_state=0).fit(Zv)            # (b)
print(pd.crosstab(yv, km3.labels_))
# col_0    0   1   2
# target
# 0        0   0  59
# 1       65   3   3
# 2        0  48   0
print(round(adjusted_rand_score(yv, km3.labels_), 3))                    # 0.897
sem = KMeans(n_clusters=3, n_init=10, random_state=0).fit(Xv)
print(round(adjusted_rand_score(yv, sem.labels_), 3))                    # 0.371
print(Xv.std().round(1).sort_values(ascending=False).head(3).to_dict())
# {'proline': 314.9, 'magnesium': 14.3, 'alcalinity_of_ash': 3.3}

pca = PCA(n_components=2).fit(Zv)                                       # (c)
print(pca.explained_variance_ratio_.round(3), round(pca.explained_variance_ratio_.sum(), 3))   # [0.362 0.192] 0.554
P = pca.transform(Zv)
plt.scatter(P[:, 0], P[:, 1], c=km3.labels_, s=15)
plt.xlabel("1.ª componente"); plt.ylabel("2.ª componente"); plt.show()

pont = -IsolationForest(n_estimators=300, random_state=0).fit(Zv).score_samples(Zv)   # (d)
zv = pd.DataFrame(Zv, columns=Xv.columns)
for i in np.argsort(-pont)[:3]:
    linha = zv.iloc[i]
    print(i, int(yv[i]), linha[linha.abs() > 2.5].round(1).to_dict())
# 121 1 {'ash': 3.2, 'alcalinity_of_ash': 2.7, 'flavanoids': 3.1}
# 59 1 {'ash': -3.7, 'alcalinity_of_ash': -2.7}
# 69 1 {'magnesium': 3.6}`;

const O_PROVA = `2 1659.0 0.268
3 1277.9 0.285
4 1180.7 0.246
5 1110.4 0.203
6 1044.5 0.196
col_0    0   1   2
target
0        0   0  59
1       65   3   3
2        0  48   0
0.897
0.371
{'proline': 314.9, 'magnesium': 14.3, 'alcalinity_of_ash': 3.3}
[0.362 0.192] 0.554
121 1 {'ash': 3.2, 'alcalinity_of_ash': 2.7, 'flavanoids': 3.1}
59 1 {'ash': -3.7, 'alcalinity_of_ash': -2.7}
69 1 {'magnesium': 3.6}`;

const IMPORTS = `import numpy as np
import pandas as pd
import matplotlib.pyplot as plt`;

const T_ISL = "https://www.statlearning.com/";

export const M10: ModuleContent = {
  id: "M10",
  duration: "2 semanas, cerca de 6 horas",
  intro:
    "No fim deste módulo deve saber agrupar dados sem rótulos com k-means, clustering hierárquico e DBSCAN, avaliar e questionar esses grupos, reduzir dimensões com PCA, t-SNE e UMAP para comprimir e visualizar, e encontrar registos anómalos com Isolation Forest e LOF.",
  outcomes: [
    "Agrupar dados sem rótulos com k-means, clustering hierárquico e DBSCAN",
    "Avaliar e questionar esses grupos",
    "Reduzir dimensões com PCA, t-SNE e UMAP para comprimir e visualizar",
    "Encontrar registos anómalos com Isolation Forest e LOF",
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
        { id: "t2", text: "Ler James et al. (2023), sec. 12.1 e 12.4.1", link: { kind: "url", href: T_ISL } },
      ],
    },
    {
      id: "w1s2",
      label: "Semana 1 · sessão 2",
      minutes: 90,
      tasks: [
        { id: "t1", text: "Ler as secções 2 e 3", link: { kind: "section", id: "s2" } },
        { id: "t2", text: "Ler James et al. (2023), sec. 12.4.2 e 12.4.3", link: { kind: "url", href: T_ISL } },
        { id: "t3", text: "Exercícios 1 a 4", link: { kind: "tab", tab: "exercicios" } },
      ],
    },
    {
      id: "w2s1",
      label: "Semana 2 · sessão 1",
      minutes: 90,
      tasks: [
        { id: "t1", text: "Ler a secção 4", link: { kind: "section", id: "s4" } },
        { id: "t2", text: "Ler James et al. (2023), sec. 12.2", link: { kind: "url", href: T_ISL } },
        { id: "t3", text: "Exercícios 5 a 7", link: { kind: "tab", tab: "exercicios" } },
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
      title: "Agrupar sem rótulos: k-means",
      minutes: 35,
      blocks: [
        {
          t: "callout",
          tone: "info",
          title: "Como estudar este módulo",
          text: "Até aqui, todos os problemas tinham uma resposta certa para aprender: vendas altas ou baixas, bicicletas por hora. Na aprendizagem não supervisionada não há `y`. Há só dados, e a pergunta é que estrutura têm: que grupos existem, que dimensões importam, que registos são estranhos. É o tipo de trabalho por trás da segmentação de clientes, da organização de catálogos e da deteção de fraudes, e é também o mais fácil de fazer mal, porque não há uma resposta certa contra a qual comparar.",
        },
        {
          t: "callout",
          tone: "info",
          title: "O código deste módulo",
          text: "Quase tudo está no scikit-learn e no SciPy. O UMAP vem de uma biblioteca à parte: no Colab, corra `!pip install umap-learn` uma vez por sessão. O código foi testado com scikit-learn 1.9, SciPy 1.18 e umap-learn 0.5.12. Os dados vêm de quatro sítios: os pinguins do repositório de dados do seaborn, os `USArrests` do repositório Rdatasets, o `Credit` do ISLP (o mesmo `URL` dos módulos anteriores) e dois conjuntos que vêm com o scikit-learn.",
        },
        {
          t: "p",
          text: "Fazer *clustering* é dividir os dados em grupos de exemplos parecidos entre si e diferentes dos dos outros grupos. O exemplo clássico no trabalho é a segmentação de clientes: em vez de uma campanha igual para todos, descobrir quatro ou cinco perfis de compra e falar com cada um à sua maneira.",
        },
        { t: "h3", text: "Os dados: pinguins" },
        {
          t: "p",
          text: "Os dados dos pinguins de Palmer (Horst, Hill & Gorman, 2020) têm 344 pinguins de três espécies, medidos na Antártida entre 2007 e 2009: comprimento e profundidade do bico, comprimento da barbatana e massa corporal. Tirando dois sem medidas, ficam 342. Conhecer a espécie é um luxo raro em problemas não supervisionados, e aqui serve só para verificar: esconde-se a espécie do algoritmo e vê-se se ele a redescobre.",
        },
        { t: "h3", text: "O algoritmo" },
        {
          t: "p",
          text: "O k-means (Lloyd, 1982) procura k grupos, cada um representado pelo seu centro (o *centróide*, a média dos seus pontos):",
        },
        {
          t: "list",
          ordered: true,
          items: [
            "Escolher k centros iniciais.",
            "Atribuir cada ponto ao centro mais próximo.",
            "Mover cada centro para a média dos pontos que lhe calharam.",
            "Repetir 2 e 3 até nada mudar.",
          ],
        },
        {
          t: "p",
          text: "Cada passo reduz a **inércia**, a soma das distâncias ao quadrado de cada ponto ao centro do seu grupo:",
        },
        { t: "code", title: "Fórmula", code: F_INERCIA },
        {
          t: "p",
          text: "Por isso o algoritmo converge sempre, mas para um mínimo local que depende do ponto de partida. O scikit-learn espalha os centros iniciais com o k-means++ (Arthur & Vassilvitskii, 2007) e repete tudo `n_init` vezes, ficando com a melhor solução.",
        },
        { t: "code", title: "k-means nos pinguins", code: C_KMEANS, output: O_KMEANS },
        {
          t: "p",
          text: "Sem saber nada de espécies, o k-means pôs todos os Gentoo no grupo 0, quase todos os Chinstrap no grupo 2 e a maioria dos Adelie no grupo 1. Os números dos grupos não querem dizer nada: outra semente pode trocá-los. Os 24 Adelie no grupo errado são quase todos machos (confirme com `pd.crosstab([pg[\"species\"], pg[\"sex\"]], kmeans.labels_)`), maiores do que as fêmeas: o k-means agrupa por tamanho e forma, e não sabe o que é uma espécie.",
        },
        {
          t: "figure",
          src: "img/01-pinguins-kmeans.png",
          alt: "Os pinguins por espécie e pelos grupos do k-means: os Gentoo isolados, Adelie e Chinstrap parcialmente misturados",
        },
        {
          t: "p",
          text: "Para comparar dois agrupamentos usa-se o **índice de Rand ajustado** (ARI; Hubert & Arabie, 1985): mede quantos pares de pontos ficam juntos ou separados da mesma maneira nas duas divisões, corrigido para o acaso. Vale 1 quando as divisões são iguais e perto de 0 quando a concordância é a de uma divisão ao calhas, e não liga aos nomes dos grupos. Aqui dá 0,793. Só se pode calcular quando há rótulos verdadeiros, o que no trabalho quase nunca acontece; aqui serve para aprender.",
        },
        {
          t: "widget",
          name: "m10-kmeans",
          caption:
            "Os 342 pinguins, com duas medidas de cada vez para se poderem desenhar. Alterne \"Atribuir os pontos\" e \"Mover os centros\" e veja a inércia descer até nada mudar; depois, com k = 4 ou mais, experimente outros inícios e compare as inércias e os ARI na tabela. Com o comprimento do bico e a massa, desligue a padronização. O gerador aleatório é do widget: as sementes não correspondem às do scikit-learn.",
        },
        { t: "h3", text: "A escala, outra vez" },
        { t: "code", title: "Sem padronizar", code: C_SEM_ESCALA, output: "0.331" },
        {
          t: "p",
          text: "Sem padronizar, o ARI cai para 0,331. A massa corporal está em gramas, com desvio padrão de cerca de 800, e o bico em milímetros, com desvio padrão de 2 a 5: as distâncias são quase só diferenças de peso, e os grupos também. É a lição do k-NN no M9: tudo o que usa distâncias precisa de variáveis na mesma escala.",
        },
        { t: "h3", text: "Perfis dos grupos" },
        { t: "p", text: "Num projeto real, o passo seguinte é descrever cada grupo, nas unidades originais:" },
        { t: "code", title: "Centros nas unidades originais", code: C_PERFIS, output: O_PERFIS },
        {
          t: "p",
          text: "O grupo 0 são pinguins grandes de bico comprido e fino; o 1, pequenos de bico curto; o 2, de bico comprido e grosso. Numa segmentação de clientes, esta tabela é o que se apresenta à equipa de marketing, com um nome para cada perfil.",
        },
        { t: "h3", text: "Quantos grupos?" },
        {
          t: "p",
          text: "O k-means precisa que se diga o k. Há duas ajudas clássicas. A inércia desce sempre com k (com um grupo por ponto, chega a zero), por isso procura-se o **cotovelo**, o ponto a partir do qual mais grupos já pouco a reduzem. A **silhueta** (Rousseeuw, 1987) mede, para cada ponto, a distância média a ao seu grupo e a distância média b ao grupo vizinho mais próximo:",
        },
        { t: "code", title: "Fórmula", code: F_SILHUETA },
        {
          t: "p",
          text: "s perto de 1 quer dizer bem dentro do grupo; perto de 0, na fronteira; negativo, provavelmente no grupo errado. Usa-se a média de todos os pontos.",
        },
        { t: "code", title: "Cotovelo e silhueta", code: C_QUANTOS, output: O_QUANTOS },
        {
          t: "figure",
          src: "img/02-cotovelo-silhueta.png",
          alt: "Inércia e silhueta em função do número de grupos",
        },
        {
          t: "p",
          text: "O cotovelo da inércia está em k = 3, mas pouco marcado. A silhueta prefere k = 2: Gentoo de um lado, o resto do outro, que é a separação geométrica mais clara. As espécies são três. Não há contradição: as métricas medem a separação geométrica, não a utilidade. No trabalho, o k escolhe-se com elas e com três perguntas: os grupos têm interpretação? A equipa consegue agir sobre tantos segmentos? Os grupos mantêm-se se mudar a semente ou uma parte dos dados?",
        },
        { t: "h3", text: "O que o k-means assume" },
        {
          t: "p",
          text: "Como cada ponto vai para o centro mais próximo, as fronteiras entre grupos são retas e os grupos tendem a sair redondos e de tamanhos parecidos. Grupos alongados, em forma de anel ou de lua enganam-no (secção 3). Além disso, só trabalha com variáveis numéricas e os valores extremos puxam as médias. Em compensação, é rápido e aguenta milhões de linhas (com `MiniBatchKMeans`, ainda mais).",
        },
        {
          t: "check",
          id: "qc1",
          q: "Numa reta, um grupo do k-means tem os pontos 1, 2 e 6, e o centro já está na média deles. Quanto contribui este grupo para a inércia?",
          options: ["3", "4,67", "14", "9"],
          answer: 2,
          explain:
            "O centro é a média, (1 + 2 + 6) / 3 = 3. A inércia soma as distâncias ao quadrado ao centro: 2² + 1² + 3² = 4 + 1 + 9 = 14. 4,67 seria a média dessas distâncias, não a soma.",
        },
      ],
    },
    {
      id: "s2",
      num: 2,
      title: "Clustering hierárquico",
      minutes: 25,
      blocks: [
        {
          t: "p",
          text: "O clustering hierárquico aglomerativo não pede o k à partida. Começa com cada ponto no seu próprio grupo e, a cada passo, junta os dois grupos mais próximos, até sobrar um só. O resultado é uma árvore de fusões, o **dendrograma**, que mostra a estrutura a todas as escalas; o k escolhe-se depois, ao cortar a árvore a uma certa altura.",
        },
        { t: "p", text: "Falta dizer o que é a distância entre dois *grupos*. É a **ligação** (*linkage*):" },
        {
          t: "table",
          head: ["Ligação", "Distância entre dois grupos", "Tendência"],
          rows: [
            ["Completa", "A maior distância entre um ponto de cada", "Grupos compactos"],
            ["Média", "A média de todas as distâncias entre pontos de um e de outro", "Meio-termo"],
            ["Simples", "A menor distância entre um ponto de cada", "Cadeias compridas; isola pontos estranhos"],
            ["Ward", "Junta o par que menos aumenta a inércia", "Grupos parecidos com os do k-means"],
          ],
        },
        { t: "h3", text: "Exemplo: os 50 estados" },
        {
          t: "p",
          text: "O conjunto `USArrests`, usado em James et al. (2023, cap. 12), tem, para cada estado dos EUA em 1973, as detensões por 100 mil habitantes por homicídio, agressão e violação, e a percentagem de população urbana. Com 50 linhas, o dendrograma lê-se bem.",
        },
        { t: "code", title: "Ligação completa nos 50 estados", code: C_ESTADOS, output: O_ESTADOS },
        { t: "p", text: "Para desenhar a árvore, `dendrogram(ligacoes, labels=list(us.index))`:" },
        {
          t: "figure",
          src: "img/03-dendrograma.png",
          alt: "Dendrograma dos 50 estados com ligação completa, cortado em 4 grupos",
        },
        {
          t: "p",
          text: "A altura de cada união é a distância a que os dois grupos se juntaram. Cortar na linha tracejada dá quatro grupos: estados rurais com pouca criminalidade (laranja), um grupo intermédio grande (verde), estados urbanos com criminalidade alta (vermelho) e estados sobretudo do Sul, menos urbanos, com as taxas de homicídio mais altas (roxo). Cortar mais acima dá dois grupos; mais abaixo, mais grupos. Dois estados lado a lado no fundo do dendrograma são parecidos; mas dois estados que só se juntam lá em cima podem estar desenhados lado a lado e ser muito diferentes. A ordem horizontal das folhas não tem significado; a altura das uniões tem.",
        },
        { t: "h3", text: "A ligação importa" },
        { t: "p", text: "Nos pinguins, com três grupos:" },
        { t: "code", title: "Quatro ligações nos pinguins", code: C_LIGACAO, output: O_LIGACAO },
        {
          t: "p",
          text: "Com Ward e ligação completa, o resultado bate o k-means (ARI de 0,916 e 0,895, contra 0,793). Com ligação média e simples, um dos três \"grupos\" tem 4 pinguins, ou mesmo 1: a ligação simples encadeia pontos vizinhos e acaba com um grupão e alguns isolados. É má para segmentar, mas útil para encontrar pontos estranhos.",
        },
        {
          t: "p",
          text: "O clustering hierárquico guarda as distâncias entre todos os pares de pontos, por isso a memória cresce com n²: funciona bem até algumas dezenas de milhares de linhas. Acima disso, usa-se o k-means ou faz-se o hierárquico sobre uma amostra.",
        },
        {
          t: "check",
          id: "qc2",
          q: "Numa reta, os grupos {3, 4} e {7, 12} vão ser comparados. Qual é a distância entre eles com ligação completa?",
          options: ["9", "3", "6", "8"],
          answer: 0,
          explain:
            "A ligação completa usa a maior distância entre um ponto de cada grupo: entre 3 e 12, 9. A ligação simples daria a menor, 3 (entre 4 e 7), e a média daria a média das quatro distâncias, (4 + 9 + 3 + 8) / 4 = 6.",
        },
      ],
    },
    {
      id: "s3",
      num: 3,
      title: "DBSCAN: grupos por densidade",
      minutes: 30,
      blocks: [
        {
          t: "p",
          text: "O k-means e o Ward procuram grupos redondos à volta de um centro. O **DBSCAN** (Ester, Kriegel, Sander & Xu, 1996) define um grupo de outra maneira: uma região onde os pontos estão densamente juntos, separada de outras por zonas vazias. Tem dois parâmetros:",
        },
        {
          t: "list",
          items: [
            "`eps`: o raio da vizinhança de cada ponto.",
            "`min_samples`: quantos pontos (contando com ele) tem de haver dentro desse raio para um ponto ser **central**.",
          ],
        },
        {
          t: "p",
          text: "Os pontos centrais vizinhos uns dos outros formam um grupo, e os pontos perto de um central entram como **fronteira**. Os restantes são **ruído**, com o rótulo −1. Assim, o DBSCAN encontra grupos de qualquer forma, decide sozinho quantos são e não obriga cada ponto a pertencer a um grupo.",
        },
        { t: "h3", text: "Duas luas" },
        { t: "code", title: "k-means nas duas luas", code: C_LUAS, output: "0.269" },
        {
          t: "p",
          text: "O k-means, preso às fronteiras retas, corta as luas ao meio (ARI de 0,269). Para o DBSCAN, o difícil é escolher o `eps`. Uma regra prática é olhar para a distância de cada ponto ao seu vizinho número `min_samples`, contando com ele próprio: um `eps` um pouco acima da maioria dessas distâncias deixa quase todos os pontos como centrais ou de fronteira.",
        },
        { t: "code", title: "Escolher o eps", code: C_EPS, output: O_EPS },
        {
          t: "p",
          text: "As colunas são: `eps`, número de grupos, pontos de ruído e ARI. Com `eps` = 0,15, perto do percentil 95 das distâncias, o DBSCAN acerta quase na perfeição. Mas repare como é sensível: 0,1 parte as luas em sete pedaços, 0,2 junta-as.",
        },
        {
          t: "widget",
          name: "m10-dbscan",
          caption:
            "As 400 luas da aula, com os rótulos que o scikit-learn dá para os mesmos pontos. Pontos centrais cheios, de fronteira vazios, ruído com ×; a forma indica o grupo. Mexa no eps e no min_samples, e clique num ponto para ver a sua vizinhança. No gráfico de baixo, os pontos abaixo da linha do eps são exatamente os centrais.",
        },
        { t: "h3", text: "HDBSCAN" },
        {
          t: "p",
          text: "O **HDBSCAN** (Campello, Moulavi & Sander, 2013) experimenta, na prática, todos os raios de uma vez e fica com os grupos mais estáveis. Só pede o tamanho mínimo de um grupo, que é muito mais fácil de escolher do que um raio:",
        },
        { t: "code", title: "HDBSCAN", code: C_HDBSCAN, output: "2 13 0.927" },
        {
          t: "p",
          text: "Encontra as duas luas sem ajuda, um pouco mais desconfiado: marca 13 pontos como ruído. O `copy=True` só evita um aviso das versões recentes do scikit-learn.",
        },
        { t: "figure", src: "img/04-luas-dbscan.png", alt: "k-means, DBSCAN e HDBSCAN nas duas luas" },
        {
          t: "p",
          text: "O DBSCAN e o HDBSCAN têm os seus limites: um raio único funciona mal quando há grupos de densidades muito diferentes (o HDBSCAN lida melhor com isso), e em muitas dimensões a noção de densidade perde sentido, pela maldição da dimensionalidade do M9. Funcionam melhor com poucas variáveis, por exemplo coordenadas geográficas, ou depois de reduzir as dimensões (secção seguinte).",
        },
        {
          t: "check",
          id: "qc3",
          q: "Cinco pontos numa reta: 0; 0,4; 0,8; 3; 3,3. Com `eps` = 0,5 e `min_samples` = 3, que tipo de ponto são o 0 e o 3?",
          options: [
            "Os dois são centrais.",
            "O 0 é ruído e o 3 é de fronteira.",
            "Os dois são ruído.",
            "O 0 é de fronteira e o 3 é ruído.",
          ],
          answer: 3,
          explain:
            "O 0 tem só 2 pontos a menos de 0,5 (ele e o 0,4), por isso não é central; mas o 0,4 tem 3 (0; 0,4; 0,8) e é central, e o 0 está ao seu alcance: fronteira. O 3 e o 3,3 têm 2 pontos cada, nenhum é central: os dois ficam como ruído, com rótulo −1. `DBSCAN(eps=0.5, min_samples=3)` dá `[0 0 0 -1 -1]`.",
        },
      ],
    },
    {
      id: "s4",
      num: 4,
      title: "Reduzir dimensões: PCA, t-SNE e UMAP",
      minutes: 35,
      blocks: [
        {
          t: "p",
          text: "Muitos dados têm dezenas ou milhares de variáveis: os píxeis de uma imagem, as palavras de um texto, os produtos comprados por um cliente. Reduzir as dimensões serve para três coisas: comprimir, tirar ruído antes de outro modelo, e conseguir **ver** os dados num gráfico de duas dimensões.",
        },
        {
          t: "p",
          text: "O exemplo é o conjunto `digits` do scikit-learn: 1797 imagens de algarismos escritos à mão, com 8 × 8 píxeis, ou seja, 64 variáveis com a intensidade de cada píxel (0 a 16).",
        },
        { t: "h3", text: "PCA" },
        {
          t: "p",
          text: "A análise de componentes principais (PCA) é a SVD do M4 aplicada aos dados centrados: encontra as direções em que os dados variam mais, por ordem. A primeira componente é a direção de maior variância; a segunda, a de maior variância entre as perpendiculares à primeira; e assim por diante (James et al., 2023, sec. 12.2).",
        },
        { t: "code", title: "PCA nos dígitos", code: C_PCA, output: O_PCA },
        {
          t: "p",
          text: "As duas primeiras componentes explicam 28,5% da variância; dez explicam 74%; são precisas 21 para chegar aos 90%. Ou seja, as 64 variáveis cabem razoavelmente em 21, mas não em 2. Os píxeis aqui não foram padronizados porque estão todos na mesma escala; com variáveis em unidades diferentes, padroniza-se antes, como sempre.",
        },
        {
          t: "widget",
          name: "m10-pca",
          caption:
            "A PCA em duas dimensões, onde se pode ver: uma nuvem de 150 pontos com as variâncias e a correlação escolhidas. Rode a reta e veja a variância da \"sombra\" dos pontos mudar; é máxima na 1.ª componente principal (tracejado) e mínima na 2.ª. Com \"Unidades muito diferentes\", ligue a padronização e veja a direção mudar.",
        },
        { t: "h3", text: "t-SNE e UMAP" },
        {
          t: "p",
          text: "A PCA é linear: projeta os dados num plano, como uma sombra. Para visualizar, há métodos não lineares que tentam outra coisa: manter juntos, no mapa de 2 dimensões, os pontos que eram vizinhos nas 64.",
        },
        {
          t: "list",
          items: [
            "O **t-SNE** (van der Maaten & Hinton, 2008) transforma as distâncias em probabilidades de dois pontos serem vizinhos e procura um mapa com probabilidades parecidas. O parâmetro principal, a *perplexidade*, é mais ou menos o número de vizinhos que cada ponto considera (5 a 50).",
            "O **UMAP** (McInnes, Healy & Melville, 2018) constrói um grafo de vizinhos e procura um mapa que o preserve. É mais rápido em dados grandes, tende a manter melhor a estrutura global e, ao contrário do t-SNE, sabe colocar pontos novos num mapa já feito (`transform`). Os parâmetros principais são `n_neighbors` e `min_dist`.",
          ],
        },
        { t: "code", title: "PCA, t-SNE e UMAP em duas dimensões", code: C_MAPAS, output: O_MAPAS },
        {
          t: "p",
          text: "O UMAP avisa que a semente obriga a usar um só processador; é normal. Para medir a qualidade de cada mapa, usou-se um k-NN: se os vizinhos no mapa forem do mesmo algarismo, o k-NN acerta. Nenhum método viu os rótulos; só entram nesta avaliação.",
        },
        { t: "figure", src: "img/05-digitos-pca-tsne-umap.png", alt: "Os dígitos em 2 dimensões com PCA, t-SNE e UMAP" },
        {
          t: "p",
          text: "Na PCA, os algarismos sobrepõem-se (60% no k-NN): duas direções lineares não chegam. O t-SNE e o UMAP separam quase todos os algarismos em ilhas, e o k-NN no mapa chega aos 97,6%, até mais do que nas 64 dimensões. Repare nos pormenores que fazem sentido: o 1 e o 8 ficam perto um do outro, e alguns 1 e 9 aparecem em pequenas ilhas à parte, provavelmente formas diferentes de os escrever.",
        },
        { t: "h3", text: "Como não ler um mapa de t-SNE" },
        {
          t: "p",
          text: "Estes mapas são ótimos para explorar e perigosos para concluir (Wattenberg, Viégas & Johnson, 2016):",
        },
        {
          t: "list",
          items: [
            "O tamanho de uma ilha não diz nada sobre a dispersão real do grupo: o t-SNE tende a dar tamanhos parecidos a tudo.",
            "A distância entre ilhas diz pouco. Duas ilhas afastadas podem não ser mais diferentes do que duas próximas.",
            "Mudar a perplexidade muda o desenho; com início aleatório (init=\"random\"), a semente também. Antes de concluir, experimente vários valores.",
            "Ruído puro pode parecer ter grupos.",
            "O t-SNE não tem `transform`: para pontos novos, refaz-se o mapa todo.",
          ],
        },
        {
          t: "p",
          text: "A regra prática: a PCA para comprimir e preparar dados para outros modelos, o t-SNE e o UMAP para olhar. Agrupar com DBSCAN em cima de um mapa de UMAP funciona muitas vezes, mas cada conclusão deve ser confirmada nos dados originais. A mesma ideia de \"pontos parecidos ficam perto\" volta no M15 e no M20, com os *embeddings* de palavras e de documentos.",
        },
        {
          t: "check",
          id: "qc4",
          q: "Num mapa de t-SNE, a ilha dos 1 ocupa o dobro da área da ilha dos 7. O que se pode concluir?",
          options: [
            "Que os 1 estão duas vezes mais dispersos do que os 7 nos dados originais.",
            "Que há o dobro de 1 nos dados.",
            "Pouco ou nada: o tamanho de uma ilha não diz nada sobre a dispersão real do grupo.",
            "Que a perplexidade está mal escolhida.",
          ],
          answer: 2,
          explain:
            "O t-SNE tende a dar tamanhos parecidos a tudo, e o tamanho de uma ilha não diz nada sobre a dispersão real do grupo. Para falar de dispersão, mede-se nos dados originais.",
        },
      ],
    },
    {
      id: "s5",
      num: 5,
      title: "Deteção de anomalias",
      minutes: 30,
      blocks: [
        {
          t: "p",
          text: "Uma anomalia é um registo que não se parece com os outros: uma transação fraudulenta, um sensor avariado, um erro de introdução de dados, uma encomenda que não bate certo. Quase nunca há rótulos (as fraudes só se confirmam semanas depois, se se confirmarem), por isso o problema é não supervisionado: ordenar os registos do mais estranho para o menos estranho, e entregar o topo da lista a uma pessoa.",
        },
        { t: "h3", text: "Dois métodos" },
        {
          t: "list",
          items: [
            "A **Isolation Forest** (Liu, Ting & Zhou, 2008) usa árvores com cortes totalmente ao acaso. Um ponto num sítio cheio precisa de muitos cortes para ficar sozinho; um ponto isolado fica sozinho depressa. A pontuação de anomalia vem do número médio de cortes até isolar cada ponto, em centenas de árvores.",
            "O **LOF** (*local outlier factor*; Breunig, Kriegel, Ng & Sander, 2000) compara a densidade à volta de cada ponto com a densidade à volta dos seus vizinhos. Um ponto numa zona muito menos densa do que a dos vizinhos é suspeito, mesmo que não esteja longe de tudo.",
          ],
        },
        { t: "h3", text: "Um teste com respostas conhecidas" },
        {
          t: "p",
          text: "Para saber se funcionam, planta-se anomalias em dados normais e vê-se se são encontradas: 600 pontos em duas nuvens (uma apertada, outra larga) e 30 pontos espalhados ao acaso por todo o espaço.",
        },
        { t: "code", title: "Anomalias plantadas", code: C_ANOM, output: O_ANOM },
        {
          t: "p",
          text: "No scikit-learn, as pontuações destes dois métodos são \"maior = mais normal\", por isso trocou-se o sinal. As colunas são a AUC (M7), usando as anomalias plantadas como resposta, e quantas das 30 plantadas ficaram entre os 30 pontos mais suspeitos.",
        },
        {
          t: "figure",
          src: "img/06-anomalias.png",
          alt: "As anomalias plantadas e os 30 pontos mais suspeitos para cada método",
        },
        {
          t: "p",
          text: "Os dois métodos apanham as anomalias que caem longe de tudo e falham as que, por acaso, caíram dentro das nuvens: dessas, nenhum método pode desconfiar, porque com estas duas variáveis são iguais aos pontos normais. Os erros têm feitios diferentes: a Isolation Forest suspeita dos pontos na periferia da nuvem larga, o LOF suspeita de pontos perto da nuvem apertada, onde a densidade cai de repente. Uma anomalia só se deteta se for diferente nas variáveis que se têm.",
        },
        { t: "h3", text: "Num caso real: clientes de cartão de crédito" },
        {
          t: "p",
          text: "O conjunto `Credit` (James et al., 2023) tem 400 clientes de um cartão, com rendimento (milhares de dólares), limite, *rating* de crédito, número de cartões, idade, anos de estudo e saldo.",
        },
        { t: "code", title: "Os clientes mais estranhos", code: C_CREDIT, output: O_CREDIT },
        {
          t: "p",
          text: "A Isolation Forest põe no topo os clientes extremos: rendimentos acima de 130 mil dólares, limites acima de 10 mil, saldos altos. O LOF concorda em três, mas põe à frente dois clientes de rendimento baixo com 8 e 9 cartões, que não são extremos em nenhuma variável sozinha, mas são estranhos ao lado dos vizinhos parecidos com eles.",
        },
        {
          t: "p",
          text: "Nada disto quer dizer que estes clientes sejam fraudes ou erros. \"Anómalo\" quer dizer \"diferente\", e muitas vezes os mais diferentes são simplesmente os melhores clientes. A deteção de anomalias produz uma lista ordenada para alguém investigar. O parâmetro `contamination` dos dois métodos só decide onde se corta essa lista: com `contamination=0.02`, os 2% mais estranhos recebem o rótulo −1 (com `predict` na Isolation Forest e `fit_predict` no LOF). Quando, com o tempo, as investigações produzirem rótulos, o problema pode passar a supervisionado, com as classes muito desequilibradas que o M11 trata.",
        },
        {
          t: "check",
          id: "qc5",
          q: "Nos 400 clientes do `Credit`, uma Isolation Forest com `contamination=0.05` marca 20 clientes com −1. O que quer dizer isso?",
          options: [
            "Que 20 clientes são fraudes confirmadas.",
            "Que os 20 clientes mais diferentes dos outros ficaram no topo de uma lista para alguém investigar.",
            "Que o modelo tem 5% de erro.",
            "Que 5% dos clientes têm dados errados.",
          ],
          answer: 1,
          explain:
            "O `contamination` só decide onde se corta a lista ordenada: 5% de 400 são 20. \"Anómalo\" quer dizer \"diferente\" nas variáveis que se têm, não fraude nem erro; muitas vezes os mais diferentes são simplesmente os melhores clientes.",
        },
      ],
    },
  ],

  readings: {
    required: [
      {
        text: "James, G., Witten, D., Hastie, T., Tibshirani, R. & Taylor, J. (2023). [*An Introduction to Statistical Learning with Applications in Python*](https://www.statlearning.com/). Springer. Cap. 12: sec. 12.1 (o desafio da aprendizagem não supervisionada), 12.2 (PCA) e 12.4 (k-means e clustering hierárquico), e o laboratório no fim do capítulo. Gratuito online.",
        href: T_ISL,
      },
      {
        text: "Géron, A. (2022). *Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow* (3.ª ed.). O'Reilly. Caps. 8 (redução da dimensionalidade) e 9 (clustering, DBSCAN e deteção de anomalias).",
      },
    ],
    complementary: [
      { text: "StatQuest, \"K-means clustering\"." },
      { text: "StatQuest, \"Hierarchical Clustering\"." },
      { text: "StatQuest, \"Principal Component Analysis (PCA), Step-by-Step\"." },
      { text: "StatQuest, \"t-SNE, Clearly Explained\" e \"UMAP Dimension Reduction, Main Ideas\"." },
      {
        text: "Wattenberg, M., Viégas, F. & Johnson, I. (2016). [How to use t-SNE effectively](https://distill.pub/2016/misread-tsne/). *Distill*. Interativo: mostra, com exemplos que se podem mexer, como o t-SNE engana.",
        href: "https://distill.pub/2016/misread-tsne/",
      },
      {
        text: "Documentação do scikit-learn, [\"Clustering\"](https://scikit-learn.org/stable/modules/clustering.html). Tem uma figura que compara todos os algoritmos em seis conjuntos de dados, com os tempos.",
        href: "https://scikit-learn.org/stable/modules/clustering.html",
      },
      {
        text: "Hastie, T., Tibshirani, R. & Friedman, J. (2009). [*The Elements of Statistical Learning*](https://hastie.su.domains/ElemStatLearn/) (2.ª ed.). Springer. Cap. 14 (aprendizagem não supervisionada).",
        href: "https://hastie.su.domains/ElemStatLearn/",
      },
      {
        text: "Chandola, V., Banerjee, A. & Kumar, V. (2009). Anomaly detection: a survey. *ACM Computing Surveys*, 41(3), 15. Uma visão geral dos tipos de anomalias e dos métodos.",
      },
    ],
    cited: [
      "Lloyd, S. P. (1982). Least squares quantization in PCM. *IEEE Transactions on Information Theory*, 28(2), 129–137.",
      "Hubert, L. & Arabie, P. (1985). Comparing partitions. *Journal of Classification*, 2(1), 193–218.",
      "Rousseeuw, P. J. (1987). Silhouettes: a graphical aid to the interpretation and validation of cluster analysis. *Journal of Computational and Applied Mathematics*, 20, 53–65.",
      "Ester, M., Kriegel, H.-P., Sander, J. & Xu, X. (1996). A density-based algorithm for discovering clusters in large spatial databases with noise. *Proceedings of the 2nd International Conference on Knowledge Discovery and Data Mining (KDD-96)*, 226–231.",
      "Breunig, M. M., Kriegel, H.-P., Ng, R. T. & Sander, J. (2000). LOF: identifying density-based local outliers. *Proceedings of the 2000 ACM SIGMOD International Conference on Management of Data*, 93–104.",
      "Arthur, D. & Vassilvitskii, S. (2007). k-means++: the advantages of careful seeding. *Proceedings of the 18th Annual ACM-SIAM Symposium on Discrete Algorithms*, 1027–1035.",
      "Liu, F. T., Ting, K. M. & Zhou, Z.-H. (2008). Isolation forest. *Proceedings of the 8th IEEE International Conference on Data Mining*, 413–422.",
      "van der Maaten, L. & Hinton, G. (2008). Visualizing data using t-SNE. *Journal of Machine Learning Research*, 9, 2579–2605.",
      "Campello, R. J. G. B., Moulavi, D. & Sander, J. (2013). Density-based clustering based on hierarchical density estimates. *Advances in Knowledge Discovery and Data Mining (PAKDD 2013)*, 160–172.",
      "McInnes, L., Healy, J. & Melville, J. (2018). UMAP: Uniform Manifold Approximation and Projection for dimension reduction. *arXiv*:1802.03426.",
      "Horst, A. M., Hill, A. P. & Gorman, K. B. (2020). palmerpenguins: Palmer Archipelago (Antarctica) penguin data. R package version 0.1.0. doi:10.5281/zenodo.3960218.",
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
            code: `W = Σₖ₌₁ᴷ Σᵢ∈Cₖ ‖xᵢ − μₖ‖²
s = (b − a) / max(a, b)
variância explicada pela componente j = λⱼ / Σₗ λₗ`,
          },
          {
            t: "p",
            text: "W: inércia do k-means. s: silhueta de um ponto (a = distância média ao próprio grupo, b = ao grupo vizinho mais próximo). λ: valores próprios da matriz de covariância (M4).",
          },
        ],
      },
      {
        title: "Os métodos",
        blocks: [
          {
            t: "table",
            head: ["Método", "Ideia", "Parâmetros", "Bom para", "Cuidado com"],
            rows: [
              ["k-means", "Cada ponto vai para o centro mais próximo; os centros vão para a média", "k, `n_init`", "Grupos redondos, dados grandes", "Escala, valores extremos, mínimos locais"],
              ["Hierárquico", "Juntar sempre os dois grupos mais próximos; dendrograma", "Ligação, onde cortar", "Ver a estrutura a várias escalas, até dezenas de milhares de linhas", "Memória n²; ligação simples encadeia"],
              ["DBSCAN", "Grupos = zonas densas; o resto é ruído", "`eps`, `min_samples`", "Formas irregulares, poucas dimensões", "`eps` sensível; densidades diferentes"],
              ["HDBSCAN", "DBSCAN para todos os raios; fica com os grupos estáveis", "`min_cluster_size`", "O mesmo, sem escolher o raio", "Muitas dimensões"],
              ["PCA", "Direções de maior variância (SVD)", "Número de componentes", "Comprimir, tirar ruído, preparar dados", "É linear; padronizar se as unidades diferem"],
              ["t-SNE", "Mapa 2D que preserva vizinhanças", "Perplexidade", "Visualizar", "Tamanhos e distâncias entre ilhas; sem `transform`"],
              ["UMAP", "Grafo de vizinhos preservado num mapa", "`n_neighbors`, `min_dist`", "Visualizar, dados grandes, pontos novos", "As mesmas ressalvas do t-SNE"],
              ["Isolation Forest", "Anomalias isolam-se com poucos cortes ao acaso", "`n_estimators`, `contamination`", "Anomalias globais, dados grandes", "Variáveis inúteis"],
              ["LOF", "Densidade local comparada com a dos vizinhos", "`n_neighbors`", "Anomalias locais", "Escala; custo em dados grandes"],
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
              ["Aprendizagem não supervisionada", "Encontrar estrutura em dados sem `y`"],
              ["Inércia", "Soma das distâncias ao quadrado de cada ponto ao centro do seu grupo; desce sempre com k"],
              ["k-means++", "Início com centros espalhados; menos mínimos locais maus"],
              ["Cotovelo", "O k a partir do qual a inércia deixa de cair muito"],
              ["Silhueta", "Quão bem cada ponto está no seu grupo, de −1 a 1"],
              ["ARI", "Concordância entre duas divisões, corrigida para o acaso; só com rótulos verdadeiros"],
              ["Dendrograma", "Árvore de fusões; a altura de cada união é a distância entre os grupos; a ordem horizontal não conta"],
              ["Ligação", "Como se mede a distância entre grupos: completa, média, simples, Ward"],
              ["Ponto central, de fronteira, ruído", "Os três tipos de ponto no DBSCAN; ruído tem rótulo −1"],
              ["Gráfico das k distâncias", "Distância ao vizinho número `min_samples`; ajuda a escolher o `eps`"],
              ["Componente principal", "Direção de maior variância, perpendicular às anteriores"],
              ["Perplexidade", "Número aproximado de vizinhos que o t-SNE considera"],
              ["Anomalia", "Registo diferente dos outros nas variáveis disponíveis; não é o mesmo que fraude ou erro"],
              ["`contamination`", "Só decide onde se corta a lista ordenada de suspeitos"],
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
            code: String.raw`from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans, AgglomerativeClustering, DBSCAN, HDBSCAN
from sklearn.metrics import silhouette_score, adjusted_rand_score
from scipy.cluster.hierarchy import linkage, fcluster, dendrogram
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE
import umap                                                   # !pip install umap-learn
from sklearn.ensemble import IsolationForest
from sklearn.neighbors import LocalOutlierFactor, NearestNeighbors

escala = StandardScaler().fit(dados); Z = escala.transform(dados)   # quase sempre primeiro
km = KMeans(n_clusters=4, n_init=10, random_state=0).fit(Z)
km.labels_, km.inertia_, silhouette_score(Z, km.labels_)
escala.inverse_transform(km.cluster_centers_)                 # perfis nas unidades originais
fcluster(linkage(Z, method="ward"), t=4, criterion="maxclust")
DBSCAN(eps=0.5, min_samples=5).fit(Z).labels_                  # -1 = ruído
PCA().fit(Z).explained_variance_ratio_.cumsum()
TSNE(perplexity=30, random_state=0).fit_transform(Z)
-IsolationForest(n_estimators=300, random_state=0).fit(Z).score_samples(Z)   # maior = mais estranho
-LocalOutlierFactor(n_neighbors=20).fit(Z).negative_outlier_factor_`,
          },
        ],
      },
      {
        title: "Resultados para lembrar",
        blocks: [
          {
            t: "table",
            head: ["Experiência", "Resultado"],
            rows: [
              ["k-means nos pinguins, padronizado", "ARI 0,793; sem padronizar, 0,331"],
              ["Escolha do k nos pinguins", "Silhueta prefere 2, as espécies são 3"],
              ["Hierárquico nos pinguins", "Ward 0,916; ligação simples deixa um grupo de 1 pinguim"],
              ["Duas luas", "k-means 0,269; DBSCAN com `eps` = 0,15, 0,995"],
              ["Dígitos em 2D", "k-NN: PCA 60%, t-SNE e UMAP 97,6%"],
              ["Anomalias plantadas", "Isolation Forest AUC 0,922, LOF 0,886; as que caem dentro das nuvens escapam a ambos"],
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
              ["Pipelines com PCA e padronização sem fugas de dados", "M11"],
              ["Classes desequilibradas, quando as anomalias passam a ter rótulos", "M11"],
              ["Embeddings: pontos parecidos ficam perto", "M15, M20"],
              ["Pesquisa por vizinhos em bases vetoriais", "M20"],
              ["Monitorização e deriva de dados em produção", "M25"],
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
              "Esquecer a padronização antes do k-means, do hierárquico, do DBSCAN ou do LOF.",
              "Escolher o k só pela silhueta ou pelo cotovelo, sem perguntar se os grupos servem para alguma coisa.",
              "Tratar grupos como verdades naturais, sem verificar se se mantêm com outra semente ou outra amostra.",
              "Ler tamanhos e distâncias entre ilhas num mapa de t-SNE.",
              "Tratar \"anómalo\" como sinónimo de \"fraude\" ou \"erro\".",
              "Juntar variáveis sem critério: as inúteis estragam as distâncias e escondem a estrutura.",
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
      title: "Parte A — Agrupar (exercícios 1 a 4)",
      note: "Dez exercícios, cerca de 4 horas no total, na ordem das sessões do plano de estudo: 1 a 4 depois da secção 3, 5 a 7 depois da secção 4, 8 a 10 no fim. Os marcados com *à mão* fazem-se com papel e calculadora; os outros no Colab, com os dados preparados como na aula (`pg`, `medidas`, `Z` dos pinguins; `X_dig`, `y_dig` dos dígitos). O código do gabarito assume `import numpy as np`, `import pandas as pd` e `import matplotlib.pyplot as plt`.",
    },
    { id: "B", title: "Parte B — Reduzir dimensões (exercícios 5 a 7)" },
    { id: "C", title: "Parte C — Anomalias e aplicação (exercícios 8 a 10)" },
  ],
  exercises: [
    {
      id: "e1",
      num: 1,
      part: "A",
      session: "w1s2",
      kind: "text",
      title: "k-means à mão numa reta",
      minutes: 20,
      sections: ["s1"],
      prompt: [
        {
          t: "p",
          text: "*(à mão)* Seis pontos numa reta: 1, 2, 4, 9, 10, 12. Aplique o k-means com k = 2, começando com os centros em 1 e 2. (a) Faça as iterações até nada mudar, indicando em cada uma os grupos e os novos centros. (b) Calcule a inércia final. (c) Calcule a silhueta do ponto 4.",
        },
      ],
      fields: [
        { id: "a", label: "(a) Iterações: grupos e novos centros em cada uma", rows: 6 },
        { id: "b", label: "(b) Inércia final", rows: 2 },
        { id: "c", label: "(c) Silhueta do ponto 4 (a, b e s)", rows: 3 },
      ],
      criteria: [
        "(a) Iteração 1: {1} e {2, 4, 9, 10, 12}, novos centros 1 e 7,4",
        "(a) Iteração 2: o 2 e o 4 passam para o primeiro grupo, {1, 2, 4} e {9, 10, 12}, centros 2,33 e 10,33; na iteração 3 nada muda",
        "(b) Inércia: (1,33² + 0,33² + 1,67²) × 2 = 4,67 × 2 = 9,33",
        "(c) a = (3 + 2) / 2 = 2,5; b = (5 + 6 + 8) / 3 = 6,33; s = (6,33 − 2,5) / 6,33 = 0,605",
      ],
      solution: [
        {
          t: "p",
          text: "(a) Iteração 1: com centros 1 e 2, o ponto 1 fica no primeiro grupo e todos os outros no segundo (mais perto de 2 do que de 1). Novos centros: 1 e (2 + 4 + 9 + 10 + 12) / 5 = 7,4. Iteração 2: o 2 (distâncias 1 e 5,4) e o 4 (3 e 3,4) passam para o primeiro grupo: {1, 2, 4} e {9, 10, 12}. Novos centros: 2,33 e 10,33. Iteração 3: nada muda. (b) Inércia: (1,33² + 0,33² + 1,67²) × 2 = 4,67 × 2 = 9,33. (c) Para o ponto 4: a = (3 + 2) / 2 = 2,5 (distância média a 1 e 2); b = (5 + 6 + 8) / 3 = 6,33; s = (6,33 − 2,5) / 6,33 = 0,605. Confirmação:",
        },
        { t: "code", code: G1, output: "[ 2.333 10.333] 9.333 3\n[0.786 0.82  0.605 0.7   0.804 0.741]" },
      ],
    },
    {
      id: "e2",
      num: 2,
      part: "A",
      session: "w1s2",
      kind: "text",
      title: "Ligação simples e completa à mão",
      minutes: 20,
      sections: ["s2"],
      prompt: [
        {
          t: "p",
          text: "*(à mão)* Cinco pontos numa reta: A = 1, B = 2, C = 6, D = 8, E = 15. (a) Faça o clustering hierárquico com ligação simples: indique a ordem das fusões e a altura de cada uma, e desenhe o dendrograma. (b) Repita com ligação completa. (c) Que grupos se obtêm ao cortar em 2 e em 3 grupos? (d) No Colab, confirme as alturas com `linkage(np.array([[1], [2], [6], [8], [15]]), method=...)`.",
        },
      ],
      fields: [
        { id: "a", label: "(a) Ligação simples: fusões e alturas (pode desenhar o dendrograma em texto)", rows: 6, mono: true },
        { id: "b", label: "(b) Ligação completa: fusões e alturas", rows: 5, mono: true },
        { id: "c", label: "(c) Cortes em 2 e em 3 grupos", rows: 2 },
        { id: "d", label: "(d) Confirmação no Colab", rows: 4, mono: true },
      ],
      criteria: [
        "(a) Simples: A e B a 1; C e D a 2; {A, B} e {C, D} a 4 (entre B = 2 e C = 6); E a 7 (entre D = 8 e E = 15)",
        "(b) Completa: as duas primeiras fusões iguais (1 e 2); {A, B} e {C, D} a 7 (entre A = 1 e D = 8), antes de {C, D} e E (9); E junta-se a 14",
        "Nota que a ordem das fusões é a mesma e só as alturas mudam",
        "(c) Em 2 grupos: {A, B, C, D} e {E}; em 3: {A, B}, {C, D} e {E}",
        "(d) `linkage` dá as alturas [1. 2. 4. 7.] (simples) e [1. 2. 7. 14.] (completa)",
      ],
      solution: [
        {
          t: "p",
          text: "(a) Ligação simples: junta A e B a 1; C e D a 2; {A, B} e {C, D} a 4 (distância mínima, entre B = 2 e C = 6); por fim E a 7 (entre D = 8 e E = 15). (b) Ligação completa: as duas primeiras fusões são iguais (1 e 2); {A, B} e {C, D} juntam-se a 7 (distância máxima, entre A = 1 e D = 8), antes de {C, D} e E (15 − 6 = 9); por fim E junta-se a 14 (15 − 1). A ordem é a mesma; as alturas mudam. (c) Em 2 grupos: {A, B, C, D} e {E}. Em 3: {A, B}, {C, D} e {E}. (d)",
        },
        { t: "code", code: G2, output: "single [1. 2. 4. 7.]\ncomplete [ 1.  2.  7. 14.]" },
      ],
    },
    {
      id: "e3",
      num: 3,
      part: "A",
      session: "w1s2",
      kind: "text",
      title: "Vinte inícios do k-means",
      minutes: 30,
      sections: ["s1"],
      prompt: [
        {
          t: "p",
          text: "Nos pinguins padronizados, corra `KMeans(n_clusters=3, n_init=1, init=\"random\", random_state=s)` para s de 0 a 19. (a) Registe a inércia e o ARI em relação às espécies. Quantas soluções diferentes aparecem, e com que frequência? (b) Repita com o início por omissão (k-means++), ainda com `n_init=1`. (c) A solução com menor inércia é a que melhor recupera as espécies? O que conclui?",
        },
      ],
      fields: [
        { id: "code", label: "Código", rows: 8, mono: true, placeholder: "for inicio in [\"random\", \"k-means++\"]:\n    …" },
        { id: "a", label: "(a) e (b) Soluções e frequências, com cada início", rows: 5 },
        { id: "c", label: "(c) Menor inércia e melhor ARI: o que conclui", rows: 4 },
      ],
      criteria: [
        "(a) Três soluções boas, com inércia de 379 a 381 (379,4 com ARI 0,793/0,799, 10 vezes; 381,1 com ARI 0,900/0,908, 2 vezes; 381,3 com ARI 0,893, 3 vezes) e uma má, com inércia 486 (ARI 0,51), 5 vezes em 20 com início aleatório",
        "(b) Com k-means++, a solução má aparece 2 vezes em 20: reduz, mas não elimina, e é por isso que se usa `n_init=10`",
        "(c) Não: a menor inércia (379,4) dá ARI de 0,793, e soluções com inércia só 0,5% maior chegam a 0,908",
        "(c) Conclui que o k-means otimiza a inércia, não \"as espécies\": o objetivo matemático e o real são diferentes, e soluções quase igualmente boas podem contar histórias diferentes",
      ],
      solution: [
        { t: "code", code: G3, output: O_G3 },
        {
          t: "table",
          head: ["Inércia", "ARI", "Vezes com início aleatório", "Vezes com k-means++"],
          rows: [
            ["379,4", "0,793 / 0,799", "10", "11"],
            ["381,1", "0,900 / 0,908", "2", "3"],
            ["381,3", "0,893", "3", "4"],
            ["486,2 / 486,3", "0,512 / 0,513", "5", "2"],
          ],
        },
        {
          t: "p",
          text: "(a) Há três soluções boas, muito parecidas na inércia (379 a 381; as variantes com ARI ligeiramente diferente diferem em um ou dois pinguins), e uma má (486), que aparece 5 vezes em 20 com início aleatório. (b) O k-means++ reduz a solução má a 2 em 20, mas não a elimina: é por isso que se usa `n_init=10`. (c) Não: a menor inércia (379,4) dá ARI de 0,793, e soluções com inércia só 0,5% maior chegam a 0,908. O k-means otimiza a inércia, não \"as espécies\". O objetivo matemático e o objetivo real são coisas diferentes; várias soluções quase igualmente boas podem contar histórias diferentes.",
        },
      ],
    },
    {
      id: "e4",
      num: 4,
      part: "A",
      session: "w1s2",
      kind: "text",
      title: "Densidade nos pinguins",
      minutes: 30,
      sections: ["s3"],
      prompt: [
        {
          t: "p",
          text: "Ainda nos pinguins padronizados. (a) Calcule os percentis 50, 90 e 95 da distância de cada pinguim ao seu 5.º vizinho (contando com ele próprio). (b) Corra o DBSCAN com `min_samples=5` e `eps` de 0,3 a 0,8, em passos de 0,1, e registe o número de grupos, os pontos de ruído e o ARI. (c) Corra o HDBSCAN com `min_cluster_size` igual a 5, 10, 20 e 40. (d) Porque é que os métodos de densidade não conseguem separar os Adelie dos Chinstrap, e o k-means com k = 3 consegue, em parte?",
        },
      ],
      fields: [
        { id: "code", label: "(a) a (c) Código e resultados", rows: 10, mono: true, placeholder: "from sklearn.neighbors import NearestNeighbors\nfrom sklearn.cluster import DBSCAN, HDBSCAN\n…" },
        { id: "d", label: "(d) Porque não separam os Adelie dos Chinstrap", rows: 4 },
      ],
      criteria: [
        "(a) Percentis [0.466 0.721 0.794]",
        "(b) DBSCAN: eps 0,3 → 4 grupos, 317 de ruído; 0,4 → 10 e 171; 0,5 → 4, 69, ARI 0,663 (o melhor); 0,6 a 0,8 → 2 grupos, com 33, 16 e 5 de ruído",
        "(c) HDBSCAN: sempre 2 grupos, com 2, 2, 4 e 27 pontos de ruído e ARI de 0,624 a 0,653",
        "(d) Os métodos de densidade encontram Gentoo e o resto: Adelie e Chinstrap tocam-se, não há um \"vale\" de baixa densidade entre eles",
        "(d) O k-means com k = 3 é obrigado a cortar em três e corta mais ou menos no sítio certo; cada método tem a sua definição de grupo",
      ],
      solution: [
        { t: "code", code: G4, output: O_G4 },
        {
          t: "table",
          head: ["Método", "Grupos", "Ruído", "ARI"],
          rows: [
            ["DBSCAN, eps 0,3", "4", "317", "−0,003"],
            ["DBSCAN, eps 0,4", "10", "171", "0,150"],
            ["DBSCAN, eps 0,5", "4", "69", "**0,663**"],
            ["DBSCAN, eps 0,6", "2", "33", "0,584"],
            ["DBSCAN, eps 0,7", "2", "16", "0,639"],
            ["DBSCAN, eps 0,8", "2", "5", "0,647"],
            ["HDBSCAN, 5 / 10 / 20 / 40", "2", "2 / 2 / 4 / 27", "0,653 / 0,653 / 0,651 / 0,624"],
          ],
        },
        {
          t: "p",
          text: "(d) A partir de `eps` = 0,6, e no HDBSCAN com qualquer tamanho mínimo, os métodos de densidade encontram dois grupos: Gentoo e o resto. Os Adelie e os Chinstrap tocam-se nestas quatro medidas: não há um \"vale\" de baixa densidade entre eles, e sem esse vale a densidade não os separa. O k-means com k = 3 é obrigado a cortar em três, e corta mais ou menos no sítio certo. Cada método tem a sua definição de grupo; aqui, a do DBSCAN não coincide com as espécies.",
        },
      ],
    },
    {
      id: "e5",
      num: 5,
      part: "B",
      session: "w2s1",
      kind: "text",
      title: "PCA à mão com duas variáveis",
      minutes: 20,
      sections: ["s4"],
      prompt: [
        {
          t: "p",
          text: "*(à mão)* Duas variáveis têm variâncias 4 e 3 e covariância 2. (a) Calcule os valores próprios da matriz de covariância. (b) Que fração da variância explica a primeira componente principal? (c) Qual é a sua direção (vetor próprio de norma 1)? (d) Se as variáveis estivessem em unidades diferentes, padronizar-se-iam primeiro. Calcule a correlação, os valores próprios da matriz de correlações e a nova fração explicada.",
        },
      ],
      fields: [
        { id: "a", label: "(a) Valores próprios, com o cálculo", rows: 3 },
        { id: "b", label: "(b) Fração explicada pela 1.ª componente", rows: 2 },
        { id: "c", label: "(c) Direção da 1.ª componente", rows: 3 },
        { id: "d", label: "(d) Correlação, valores próprios da matriz de correlações e nova fração", rows: 3 },
      ],
      criteria: [
        "(a) (4 − λ)(3 − λ) − 4 = 0, ou seja, λ² − 7λ + 8 = 0: λ = (7 ± √17) / 2 = 5,562 e 1,438",
        "(b) 5,562 / 7 = 0,795: 79,5%",
        "(c) De (4 − 5,562)v₁ + 2v₂ = 0 vem v₂ = 0,781v₁; com norma 1, (0,788; 0,615), ou o vetor oposto (o sinal é arbitrário)",
        "(d) r = 2 / √(4 × 3) = 0,577; valores próprios 1 ± r = 1,577 e 0,423; a 1.ª componente explica 1,577 / 2 = 78,9%",
      ],
      solution: [
        {
          t: "p",
          text: "(a) Os valores próprios resolvem (4 − λ)(3 − λ) − 4 = 0, ou seja, λ² − 7λ + 8 = 0: λ = (7 ± √17) / 2 = 5,562 e 1,438. (b) 5,562 / 7 = 0,795: a primeira componente explica 79,5%. (c) De (4 − 5,562)v₁ + 2v₂ = 0 vem v₂ = 0,781v₁; com norma 1, (0,788; 0,615), ou o vetor oposto (o sinal é arbitrário). (d) Correlação r = 2 / √(4 × 3) = 0,577. A matriz de correlações tem valores próprios 1 ± r = 1,577 e 0,423, e a primeira componente explica 1,577 / 2 = 78,9%.",
        },
        { t: "code", code: G5, output: "[1.438 5.562] [0.205 0.795] [-0.788 -0.615]" },
      ],
    },
    {
      id: "e6",
      num: 6,
      part: "B",
      session: "w2s1",
      kind: "text",
      title: "Quantas componentes nos dígitos?",
      minutes: 25,
      sections: ["s4"],
      prompt: [
        {
          t: "p",
          text: "Nos dígitos: (a) para k = 2, 5, 10, 21, 40 e 64, calcule a exatidão em validação cruzada (`cv=5`) de `make_pipeline(PCA(n_components=k), LogisticRegression(max_iter=5000))`. (b) Para os mesmos k, ajuste a PCA a todos os dígitos, reconstrua-os com `inverse_transform(transform(X_dig))` e calcule o erro quadrático médio por píxel. (c) Mostre o primeiro dígito original e as suas reconstruções com 2, 10 e 21 componentes. (d) Quantas componentes usaria, e porquê?",
        },
      ],
      fields: [
        { id: "code", label: "(a) a (c) Código e resultados", rows: 10, mono: true, placeholder: "for k in [2, 5, 10, 21, 40, 64]:\n    …" },
        { id: "c", label: "(c) O que se vê nas reconstruções", rows: 2 },
        { id: "d", label: "(d) Quantas componentes usaria, e porquê", rows: 3 },
      ],
      criteria: [
        "(a) Exatidão: 0,574 / 0,823 / 0,888 / 0,894 / 0,910 / 0,913 para 2, 5, 10, 21, 40 e 64 componentes",
        "(b) Erro de reconstrução por píxel: 13,42 / 8,54 / 4,91 / 1,82 / 0,22 / 0,00",
        "(c) Com 2 componentes o zero é uma mancha; com 10 já se reconhece; com 21 é quase igual ao original",
        "(d) Entre 20 e 40: com 21 (um terço das variáveis) perde-se menos de 2 pontos de exatidão, com 40 quase nada",
        "Nota que a PCA está dentro do pipeline, ajustada só com a parte de treino de cada divisão (ajustá-la antes seria uma pequena fuga de dados)",
      ],
      solution: [
        { t: "code", code: G6, output: O_G6 },
        {
          t: "table",
          head: ["Componentes", "Exatidão", "Erro de reconstrução por píxel"],
          rows: [
            ["2", "0,574", "13,42"],
            ["5", "0,823", "8,54"],
            ["10", "0,888", "4,91"],
            ["21", "0,894", "1,82"],
            ["40", "0,910", "0,22"],
            ["64", "0,913", "0,00"],
          ],
        },
        {
          t: "p",
          text: "(c) Com 2 componentes, o zero é uma mancha; com 10 já se reconhece; com 21 é quase igual ao original. (d) Entre 20 e 40: com 21 componentes (um terço das variáveis) perde-se menos de 2 pontos de exatidão, com 40 quase nada. Repare que a PCA está dentro do pipeline: em cada divisão da validação cruzada, é ajustada só com a parte de treino. Ajustá-la antes, a todos os dados, seria uma pequena fuga de dados (M11).",
        },
      ],
    },
    {
      id: "e7",
      num: 7,
      part: "B",
      session: "w2s1",
      kind: "text",
      title: "Perplexidade, sementes e ruído no t-SNE",
      minutes: 30,
      sections: ["s4"],
      prompt: [
        {
          t: "p",
          text: "(a) Faça o t-SNE dos dígitos com perplexidade 5, 30 e 100 (`random_state=0`), desenhe os três mapas e calcule a exatidão do k-NN com k = 5 em cada um, como na aula. (b) Com perplexidade 30, repita com `init=\"random\"` e `random_state` 0 e 1. O que muda entre os dois mapas, e o que fica igual? (c) Gere ruído puro, `np.random.default_rng(0).normal(size=(500, 50))`, e faça o t-SNE com perplexidade 2 e 30. O que vê? Que lição tira?",
        },
      ],
      fields: [
        { id: "code", label: "Código e resultados", rows: 10, mono: true, placeholder: "from sklearn.manifold import TSNE\n…" },
        { id: "a", label: "(a) O que muda com a perplexidade", rows: 3 },
        { id: "b", label: "(b) O que muda e o que fica igual com outra semente", rows: 3 },
        { id: "c", label: "(c) O que vê no ruído, e a lição", rows: 3 },
      ],
      criteria: [
        "(a) k-NN de 0,976 com perplexidade 5 e 30 e 0,964 com 100 (os valores exatos do t-SNE podem variar um pouco com a máquina)",
        "(a) Com 5, ilhas mais soltas e granulosas; com 100, mais compactas e encostadas; os grupos são os mesmos, a forma e as posições mudam",
        "(b) As duas sementes põem as ilhas em sítios diferentes do mapa, mas as vizinhanças ficam iguais (k-NN de 0,973 nas duas, no gabarito); com o início por omissão, pela PCA, a semente quase não muda nada",
        "(c) Com perplexidade 2, o ruído aparece como dezenas de pequenos aglomerados; com 30, como uma bola uniforme",
        "(c) Lição: grupos num mapa de t-SNE não provam que existam grupos nos dados, sobretudo com perplexidade baixa",
      ],
      solution: [
        { t: "code", code: G7, output: O_G7 },
        {
          t: "p",
          text: "(Os códigos de desenho dos mapas dos dígitos são como os da aula.) (a) Com perplexidade 5, as ilhas ficam mais soltas e granulosas; com 100, mais compactas e encostadas umas às outras, e o k-NN desce ligeiramente (0,964). Os grupos são os mesmos; a forma e as posições mudam. (b) Com início aleatório, as duas sementes põem as ilhas em sítios diferentes do mapa (o 0 em baixo num, em cima noutro), mas as vizinhanças ficam iguais: o k-NN dá 0,973 nos dois. Com o início por omissão, pela PCA, a semente quase não muda nada. (c) Com perplexidade 2, o ruído puro aparece como dezenas de pequenos aglomerados; com 30, como uma bola uniforme. Lição: grupos num mapa de t-SNE não provam que existam grupos nos dados, sobretudo com perplexidade baixa.",
        },
      ],
    },
    {
      id: "e8",
      num: 8,
      part: "C",
      session: "w2s2",
      kind: "text",
      title: "Os dígitos mais estranhos",
      minutes: 20,
      sections: ["s5"],
      prompt: [
        {
          t: "p",
          text: "(a) Aplique uma `IsolationForest(n_estimators=300, random_state=0)` aos dígitos e mostre as 10 imagens mais anómalas, com o algarismo verdadeiro por cima (`plt.imshow(X_dig[i].reshape(8, 8), cmap=\"gray_r\")`). (b) Que algarismos aparecem mais entre os 50 mais anómalos? (c) Mostre também os 10 mais normais. (d) Para que serviria esta lista num projeto real de reconhecimento de algarismos?",
        },
      ],
      fields: [
        { id: "code", label: "(a) a (c) Código e resultados", rows: 8, mono: true, placeholder: "from sklearn.ensemble import IsolationForest\n…" },
        { id: "ab", label: "(a) e (b) Como são os mais anómalos, e que algarismos aparecem mais", rows: 3 },
        { id: "c", label: "(c) Os mais normais", rows: 2 },
        { id: "d", label: "(d) Para que serviria a lista", rows: 3 },
      ],
      criteria: [
        "(a) Os 10 mais anómalos são [9 7 7 7 5 1 4 7 4 5]: algarismos escritos de forma pouco habitual (setes com traço, quatros abertos…)",
        "(b) Entre os 50 mais anómalos, 17 são setes (depois 4, 9 e 5), que se escrevem de várias maneiras",
        "(c) Os mais normais são quase todos uns, formas simples numa zona densa dos dados",
        "(d) Rever os dados: procurar rótulos errados, imagens estragadas e estilos de escrita mal representados, que podem merecer mais exemplos de treino",
      ],
      solution: [
        { t: "code", code: G8, output: O_G8 },
        {
          t: "p",
          text: "(a) e (b) Os mais anómalos são algarismos escritos de forma pouco habitual: setes com traço no meio, quatros abertos, um nove com a cauda torta, um um com um gancho grande em cima. Entre os 50 mais anómalos, 17 são setes, que se escrevem de várias maneiras. (c) Os mais normais são quase todos uns: formas simples, muito parecidas entre si, numa zona densa dos dados. (d) Num projeto real, esta lista serve para rever os dados: procurar rótulos errados, imagens estragadas e estilos de escrita mal representados, que podem merecer mais exemplos de treino.",
        },
      ],
    },
    {
      id: "e9",
      num: 9,
      part: "C",
      session: "w2s2",
      kind: "text",
      title: "Vizinhos e variáveis inúteis",
      minutes: 25,
      sections: ["s5"],
      prompt: [
        {
          t: "p",
          text: "Use os dados com anomalias plantadas da aula (`X_anom`, `e_estranho`). (a) Calcule a AUC do LOF com `n_neighbors` igual a 5, 20, 50 e 100. (b) Junte 2, 10 e 50 colunas de ruído normal padrão, geradas de cada vez com `np.random.default_rng(1)`, e calcule a AUC da Isolation Forest (300 árvores, `random_state=0`) e do LOF (`n_neighbors=20`). (c) Explique porque é que a Isolation Forest sofre tanto com as colunas inúteis.",
        },
      ],
      fields: [
        { id: "code", label: "(a) e (b) Código e resultados", rows: 10, mono: true, placeholder: "for n in [5, 20, 50, 100]:\n    …" },
        { id: "a", label: "(a) e (b) O que mostram os números", rows: 3 },
        { id: "c", label: "(c) Porque sofre a Isolation Forest", rows: 4 },
      ],
      criteria: [
        "(a) AUC do LOF: 0,798 / 0,886 / 0,893 / 0,901; com 5 vizinhos é instável, a partir de 20 estabiliza perto de 0,89 a 0,90",
        "(b) Isolation Forest: 0,826 / 0,649 / 0,524; LOF: 0,856 / 0,808 / 0,740, com 2, 10 e 50 colunas inúteis",
        "(c) A Isolation Forest escolhe ao acaso a variável de cada corte: com 2 úteis e 50 inúteis, quase todos os cortes são em ruído, onde as anomalias não se distinguem",
        "(c) O LOF sofre porque as distâncias passam a ser dominadas pelo ruído (maldição da dimensionalidade), mas aguenta um pouco melhor; lição: escolher as variáveis com critério",
      ],
      solution: [
        { t: "code", code: G9, output: O_G9 },
        {
          t: "p",
          text: "(a) Com 5 vizinhos, o LOF é instável (cada ponto compara-se com muito poucos); a partir de 20 estabiliza perto de 0,89 a 0,90. (b) Com 50 colunas inúteis, a Isolation Forest cai de 0,922 para 0,524, quase ao acaso; o LOF cai de 0,886 para 0,740. (c) A Isolation Forest escolhe ao acaso a variável de cada corte. Com 2 variáveis úteis e 50 inúteis, quase todos os cortes são feitos em ruído, onde as anomalias não se distinguem dos pontos normais, e deixam de ficar isoladas mais depressa. O LOF sofre porque as distâncias passam a ser dominadas pelo ruído (a maldição da dimensionalidade), mas aguenta um pouco melhor aqui. A lição é a de sempre: escolher as variáveis com critério.",
        },
      ],
    },
    {
      id: "e10",
      num: 10,
      part: "C",
      session: "w2s2",
      kind: "text",
      title: "Segmentar os clientes do Credit",
      minutes: 30,
      sections: ["s1"],
      prompt: [
        {
          t: "p",
          text: "*(aplicação)* A equipa de marketing de um banco quer segmentar os 400 clientes do `Credit`. (a) Calcule a correlação entre `Income`, `Limit`, `Rating` e `Balance`. Que variável é redundante? (b) Padronize `Income`, `Limit`, `Balance`, `Age` e `Cards` e corra o k-means (`n_init=10`, `random_state=0`) com k de 2 a 8, registando a inércia, a silhueta e o tamanho dos grupos. (c) Com k = 4, mostre o perfil de cada grupo nas unidades originais e dê-lhe um nome. (d) Escreva à equipa uma mensagem de 5 a 8 linhas, sem jargão: os segmentos, uma ação possível para cada um e um aviso honesto sobre o que a análise mostra e não mostra.",
        },
      ],
      fields: [
        { id: "code", label: "(a) a (c) Código e resultados", rows: 10, mono: true, placeholder: "URL = \"https://raw.githubusercontent.com/intro-stat-learning/ISLP/main/ISLP/data/\"\ncr = pd.read_csv(URL + \"Credit.csv\")\n…" },
        { id: "ab", label: "(a) Variável redundante; (b) o que diz a silhueta", rows: 3 },
        { id: "c", label: "(c) Nome de cada grupo", rows: 4 },
        { id: "d", label: "(d) Mensagem para a equipa de marketing", rows: 8 },
      ],
      criteria: [
        "(a) `Limit` e `Rating` têm correlação 1,00: fica só um, senão essa informação conta a dobrar nas distâncias",
        "(b) Silhueta baixa para qualquer k (0,34 com k = 2, perto de 0,23 a partir de 3): os clientes formam uma nuvem contínua, não grupos naturalmente separados",
        "(c) Perfis com k = 4 (127, 59, 115 e 99 clientes) e nomes coerentes: seniores prudentes; rendimento alto; jovens; usam muito o crédito",
        "(d) Mensagem sem jargão, com os quatro segmentos e uma ação para cada um",
        "(d) Aviso honesto: os grupos não estão naturalmente separados, são uma divisão útil e não tipos \"reais\"; sugere testar cada ação numa parte do segmento",
      ],
      solution: [
        { t: "code", code: G10, output: O_G10 },
        {
          t: "p",
          text: "(a) `Limit` e `Rating` têm correlação de 1,00: o *rating* é praticamente uma função do limite. Fica só um, senão essa informação conta a dobrar nas distâncias. (b) A silhueta é baixa para qualquer k (0,34 com k = 2, perto de 0,23 a partir de 3): os clientes não formam grupos naturalmente separados, formam uma nuvem contínua. (c) Nomes possíveis: grupo 0, \"seniores prudentes\" (68 anos em média, rendimento e saldo baixos); grupo 1, \"rendimento alto\" (113 mil, limite e saldo altos); grupo 2, \"jovens\" (38 anos, menos cartões, saldo moderado); grupo 3, \"usam muito o crédito\" (rendimento médio, mas saldo alto e mais cartões).",
        },
        {
          t: "callout",
          tone: "lesson",
          title: "(d) Mensagem-modelo",
          text: "\"Dividimos os 400 clientes em quatro perfis: seniores prudentes (127), clientes de rendimento alto (59), jovens (115) e clientes de rendimento médio que usam muito o crédito (99). Sugestões: produtos de poupança e seguros para os seniores, cartões premium para o rendimento alto, ofertas de entrada para os jovens e, para o último grupo, acompanhamento do risco antes de qualquer aumento de limite. Um aviso: os clientes não estão naturalmente separados em grupos; estes perfis são uma forma útil de os dividir, não tipos 'reais'. Sugiro testar cada ação numa parte do segmento antes de a alargar.\"",
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
            q: "No k-means, a inércia:",
            options: [
              "Aumenta sempre quando k aumenta.",
              "Diminui (ou fica igual) quando k aumenta, até chegar a zero com um grupo por ponto.",
              "É máxima no k certo.",
              "É o mesmo que a silhueta.",
            ],
            answer: 1,
            explain: "Mais grupos deixam cada ponto mais perto de um centro: a inércia desce sempre com k e chega a zero com um grupo por ponto. Por isso procura-se o cotovelo, não o mínimo.",
          },
          {
            kind: "mcq", id: "p2", num: 2, section: "s1", points: 1,
            q: "Um ponto tem silhueta igual a −0,3. Isto quer dizer que:",
            options: [
              "Está bem no centro do seu grupo.",
              "É ruído para o DBSCAN.",
              "Está exatamente na fronteira entre dois grupos.",
              "Está provavelmente no grupo errado.",
            ],
            answer: 3,
            explain: "s negativo quer dizer b < a: o ponto está, em média, mais perto do grupo vizinho do que do seu. Perto de 0 seria a fronteira; perto de 1, bem dentro do grupo.",
          },
          {
            kind: "mcq", id: "p3", num: 3, section: "s1", points: 1,
            q: "Antes de aplicar o k-means a clientes descritos pelo rendimento anual (em euros) e pela idade (em anos), deve-se:",
            options: ["Padronizar as variáveis.", "Aplicar o t-SNE.", "Retirar a idade.", "Usar a ligação simples."],
            answer: 0,
            explain: "Sem padronizar, as distâncias seriam quase só diferenças de rendimento, como a massa em gramas nos pinguins (ARI de 0,793 para 0,331).",
          },
          {
            kind: "mcq", id: "p4", num: 4, section: "s3", points: 1,
            q: "No DBSCAN, um ponto com rótulo −1 é:",
            options: ["O centro do primeiro grupo.", "Um ponto central.", "Ruído: não pertence a nenhum grupo.", "Um ponto mal classificado."],
            answer: 2,
            explain: "Os pontos que não são centrais nem estão perto de um central são ruído, com o rótulo −1.",
          },
          {
            kind: "mcq", id: "p5", num: 5, section: "s2", points: 1,
            q: "Num dendrograma, dois pontos desenhados lado a lado no fundo:",
            options: [
              "São sempre os dois pontos mais parecidos dos dados.",
              "Ficam no mesmo grupo seja qual for o corte.",
              "Têm distância zero entre si.",
              "Podem ser muito diferentes: o que conta é a altura a que se juntam.",
            ],
            answer: 3,
            explain: "A ordem horizontal das folhas não tem significado; a altura das uniões tem. Dois pontos que só se juntam lá em cima podem estar desenhados lado a lado.",
          },
          {
            kind: "mcq", id: "p6", num: 6, section: "s3", points: 1,
            q: "Qual destes métodos decide sozinho o número de grupos?",
            options: ["DBSCAN.", "k-means.", "`AgglomerativeClustering(n_clusters=3)`.", "`KMeans` com `n_init=10`."],
            answer: 0,
            explain: "O DBSCAN só pede o raio e o mínimo de pontos; o número de grupos sai dos dados. Os outros três recebem o número de grupos.",
          },
          {
            kind: "mcq", id: "p7", num: 7, section: "s4", points: 1,
            q: "Num mapa de t-SNE, duas ilhas muito afastadas uma da outra:",
            options: [
              "São os dois grupos mais diferentes dos dados.",
              "Têm, nos dados originais, a mesma dispersão.",
              "Não permitem concluir muito sobre quanto diferem nos dados originais.",
              "Indicam que a perplexidade está mal escolhida.",
            ],
            answer: 2,
            explain: "A distância entre ilhas diz pouco: duas ilhas afastadas podem não ser mais diferentes do que duas próximas (Wattenberg, Viégas & Johnson, 2016).",
          },
          {
            kind: "mcq", id: "p8", num: 8, section: "s5", points: 1,
            q: "A Isolation Forest considera um ponto anómalo quando:",
            options: [
              "Está longe da média de todas as variáveis.",
              "Fica isolado com poucos cortes ao acaso.",
              "Tem silhueta negativa.",
              "O LOF também o considera anómalo.",
            ],
            answer: 1,
            explain: "Um ponto num sítio cheio precisa de muitos cortes para ficar sozinho; um ponto isolado fica sozinho depressa. A pontuação vem do número médio de cortes.",
          },
        ],
      },
      {
        title: "Grupo II — Resposta curta (8 valores)",
        note: "Sem consulta e sem correr código (pode usar calculadora). 2 valores cada, 3 a 5 linhas por resposta.",
        questions: [
          {
            kind: "open", id: "p9", num: 9, section: "s1", points: 2, rows: 5,
            q: "Descreva o algoritmo do k-means. Porque é que se corre várias vezes (`n_init`) com inícios diferentes?",
            criteria: [
              { id: "c1", text: "Algoritmo", points: 1 },
              { id: "c2", text: "Mínimos locais e `n_init`", points: 1 },
            ],
            model:
              "Escolhem-se k centros; cada ponto vai para o centro mais próximo; cada centro passa para a média dos seus pontos; repete-se até nada mudar. Cada passo reduz a inércia, por isso converge, mas para um mínimo local que depende dos centros iniciais. Correr várias vezes com inícios diferentes (e o k-means++, que os espalha) e ficar com a menor inércia evita as soluções más, como as de inércia 486 nos pinguins.",
          },
          {
            kind: "open", id: "p10", num: 10, section: "s1", points: 2, rows: 5,
            q: "Nos pinguins, a silhueta preferiu k = 2, mas há três espécies. Numa segmentação de clientes real, sem rótulos, como escolheria o k?",
            criteria: [
              { id: "c1", text: "Limitação das métricas", points: 1 },
              { id: "c2", text: "Critérios de utilidade e estabilidade", points: 1 },
            ],
            model:
              "As métricas (cotovelo, silhueta) medem a separação geométrica, não a utilidade. Usa-se uma gama de k razoável segundo as métricas e escolhe-se pela utilidade: perfis interpretáveis e diferentes entre si, um número de segmentos sobre o qual a equipa consegue agir, e estabilidade (os grupos mantêm-se com outra semente ou outra amostra).",
          },
          {
            kind: "open", id: "p11", num: 11, section: "s4", points: 2, rows: 5,
            q: "Em que difere a PCA do t-SNE e do UMAP? Para que usaria cada um?",
            criteria: [
              { id: "c1", text: "Diferença", points: 1 },
              { id: "c2", text: "Uso de cada um", points: 1 },
            ],
            model:
              "A PCA é linear: projeta os dados nas direções de maior variância, preserva a estrutura global, pode aplicar-se a dados novos e as componentes têm significado (combinações das variáveis). O t-SNE e o UMAP são não lineares e preservam sobretudo as vizinhanças. Usa-se a PCA para comprimir, tirar ruído e preparar dados para outros modelos; o t-SNE e o UMAP para visualizar, sem ler tamanhos nem distâncias entre ilhas.",
          },
          {
            kind: "open", id: "p12", num: 12, section: "s5", points: 2, rows: 5,
            q: "Um colega corre uma Isolation Forest sobre as encomendas da loja online e quer bloquear automaticamente as 2% mais anómalas, por suspeita de fraude. Comente.",
            criteria: [
              { id: "c1", text: "Crítica", points: 1 },
              { id: "c2", text: "Alternativa concreta", points: 1 },
            ],
            model:
              "\"Anómalo\" não é \"fraudulento\": muitas encomendas estranhas são de bons clientes (valores altos, moradas no estrangeiro). Bloquear 2% automaticamente faria muitos falsos positivos e perderia vendas; o valor de 2% é arbitrário. Melhor: usar a lista para revisão manual, registar o resultado de cada revisão e, com esses rótulos, treinar mais tarde um modelo supervisionado e avaliar a precisão e a revocação (M7, M11).",
          },
        ],
      },
      {
        title: "Grupo III — Programação (4 valores)",
        note: "Pode usar o Colab e a documentação do scikit-learn, mas não assistentes de IA.",
        questions: [
          {
            kind: "open", id: "p13", num: 13, section: "s1", points: 4, rows: 18,
            q: "O conjunto `load_wine(as_frame=True)` do scikit-learn tem 178 vinhos da mesma região de Itália, feitos a partir de três cultivares, com 13 medidas químicas. A cultivar está em `target`; use-a só para avaliar.",
            context: [
              {
                t: "p",
                text: "(a) Padronize as 13 variáveis e corra o k-means (`n_init=10`, `random_state=0`) com k de 2 a 6. Registe a inércia e a silhueta. Que k escolheria? (b) Com k = 3, faça a tabela cruzada com a cultivar e calcule o ARI. Repita sem padronizar e explique a diferença, indicando a variável responsável. (c) Calcule a fração da variância explicada pelas duas primeiras componentes principais (nos dados padronizados) e desenhe os vinhos nessas duas componentes, com as cores dos grupos do k-means. (d) Aplique uma Isolation Forest (300 árvores, `random_state=0`) aos dados padronizados. Indique os três vinhos mais anómalos e, para cada um, as variáveis padronizadas com valor absoluto acima de 2,5. Em 3 a 5 linhas: o que faria com estes vinhos?",
              },
            ],
            criteria: [
              { id: "c1", text: "(a) Ciclo de k, métricas certas e escolha justificada", points: 1 },
              { id: "c2", text: "(b) Tabela, ARI com e sem padronização, prolina identificada", points: 1 },
              { id: "c3", text: "(c) Variância explicada e gráfico", points: 1 },
              { id: "c4", text: "(d) Três vinhos, variáveis extremas e decisão sensata", points: 1 },
            ],
            model:
              "(a) k = 3, onde a silhueta é máxima (0,285) e a inércia faz o cotovelo. (b) Com padronização, a cultivar 0 e a 2 ficam inteiras num grupo cada, e só 6 dos 71 vinhos da cultivar 1 saem do seu grupo: ARI de 0,897. Sem padronizar, cai para 0,371, porque a prolina tem desvio padrão de 315 (as outras têm no máximo 14) e domina as distâncias: os grupos passam a ser níveis de prolina. (c) As duas primeiras componentes explicam 55,4% da variância, e o gráfico mostra três nuvens quase sem sobreposição, com as cores do k-means. (d) Os vinhos 121, 59 e 69 (todos da cultivar 1) têm valores extremos de cinza, alcalinidade da cinza, flavonoides ou magnésio, a mais de 2,5 desvios padrão da média. Antes de os tirar, verificaria se são erros de medição ou de registo; se forem medições válidas, ficam, porque são informação real sobre a variedade dos vinhos.",
            modelBlocks: [{ t: "code", code: G_PROVA, output: O_PROVA }],
          },
        ],
      },
    ],
  },
  examReviewNote:
    "Se a nota ficar abaixo de 14: rever as secções das perguntas falhadas (1, 2, 3, 9 e 10 → secção 1, k-means; 5 → secção 2, clustering hierárquico; 4 e 6 → secção 3, DBSCAN; 7 e 11 → secção 4, PCA, t-SNE e UMAP; 8 e 12 → secção 5, deteção de anomalias; 13 → todas), refazer os exercícios dessas secções sem olhar para o gabarito e repetir a prova daqui a uma semana.",

  // ---------------------------------------------------------------- SIMULADO DE TREINO (banco extra da plataforma)
  practice: {
    mcq: [
      {
        id: "q1", section: "s1",
        q: "O que mede o índice de Rand ajustado (ARI)?",
        options: [
          "A inércia média de cada grupo",
          "Quantos pares de pontos ficam juntos ou separados da mesma maneira em duas divisões, corrigido para o acaso",
          "A distância média de cada ponto ao seu grupo",
          "A percentagem de pontos de ruído",
        ],
        answer: 1,
        explain: "Vale 1 quando as divisões são iguais e perto de 0 numa divisão ao calhas, e não liga aos nomes dos grupos. Só se calcula com rótulos verdadeiros.",
      },
      {
        id: "q2", section: "s1",
        q: "Nos pinguins, o k-means pôs os Gentoo no grupo 0. Com outra semente, apareceram no grupo 2. Isto quer dizer que…",
        options: [
          "O k-means está errado",
          "É preciso mais iterações",
          "Os números dos grupos não querem dizer nada: outra semente pode trocá-los",
          "Os Gentoo não formam um grupo",
        ],
        answer: 2,
        explain: "Os rótulos 0, 1, 2 são só nomes. Por isso o ARI não liga aos nomes dos grupos.",
      },
      {
        id: "q3", section: "s1",
        q: "Porque é que, nos pinguins, o ARI cai de 0,793 para 0,331 sem padronizar?",
        options: [
          "Porque a massa corporal, em gramas, tem desvio padrão de cerca de 800 e domina as distâncias",
          "Porque o k-means precisa de variáveis categóricas",
          "Porque a padronização junta as espécies",
          "Porque sem padronizar o k-means não converge",
        ],
        answer: 0,
        explain: "O bico, em milímetros, tem desvio padrão de 2 a 5: as distâncias são quase só diferenças de peso, e os grupos também.",
      },
      {
        id: "q4", section: "s1",
        q: "O que faz `n_init=10` no `KMeans`?",
        options: [
          "Faz 10 iterações de atribuir e mover",
          "Procura 10 grupos",
          "Padroniza os dados 10 vezes",
          "Corre o algoritmo com 10 inícios diferentes e fica com a solução de menor inércia",
        ],
        answer: 3,
        explain: "O k-means converge para um mínimo local que depende do início; repetir com inícios diferentes evita as soluções más.",
      },
      {
        id: "q5", section: "s1",
        q: "Que forma de grupos o k-means tende a encontrar?",
        options: [
          "Redondos e de tamanhos parecidos, separados por fronteiras retas",
          "Alongados e em forma de lua",
          "Em forma de anel",
          "De qualquer forma, desde que densos",
        ],
        answer: 0,
        explain: "Cada ponto vai para o centro mais próximo, por isso as fronteiras são retas. Grupos em forma de lua ou anel enganam-no.",
      },
      {
        id: "q6", section: "s1",
        q: "Nos pinguins, com k de 2 a 8, que k teve a maior silhueta média?",
        options: ["3, o número de espécies", "2", "8", "4"],
        answer: 1,
        explain: "0,532 com k = 2: Gentoo de um lado, o resto do outro, a separação geométrica mais clara. As métricas medem a separação, não a utilidade.",
      },
      {
        id: "q7", section: "s1",
        q: "Um ponto tem distância média 2 ao seu grupo e 6 ao grupo vizinho mais próximo. Qual é a sua silhueta?",
        options: ["0,33", "−0,67", "4", "0,67"],
        answer: 3,
        explain: "s = (b − a) / max(a, b) = (6 − 2) / 6 ≈ 0,67: está bem dentro do grupo.",
      },
      {
        id: "q8", section: "s1",
        q: "Para apresentar os grupos de clientes à equipa de marketing, o que se mostra?",
        options: [
          "Os centros nas unidades originais, com `escala.inverse_transform(km.cluster_centers_)`, e um nome para cada perfil",
          "A inércia final",
          "Os centros padronizados",
          "O ARI",
        ],
        answer: 0,
        explain: "Os centros padronizados não se leem; nas unidades originais, cada grupo vira um perfil (\"pequenos de bico curto\", \"rendimento alto\"…).",
      },
      {
        id: "q9", section: "s2",
        q: "Num dendrograma, o que tem significado?",
        options: [
          "A ordem horizontal das folhas",
          "A cor de cada ramo",
          "A altura a que cada par de grupos se junta",
          "A largura da árvore",
        ],
        answer: 2,
        explain: "A altura de cada união é a distância a que os dois grupos se juntaram. A ordem das folhas é arbitrária.",
      },
      {
        id: "q10", section: "s2",
        q: "Que ligação tende a fazer cadeias compridas, com um grupão e alguns pontos isolados?",
        options: ["Ward", "Completa", "Média", "Simples"],
        answer: 3,
        explain: "A ligação simples usa a menor distância entre um ponto de cada grupo e encadeia pontos vizinhos. É má para segmentar, mas útil para encontrar pontos estranhos.",
      },
      {
        id: "q11", section: "s2",
        q: "Porque é que o clustering hierárquico não serve para milhões de linhas?",
        options: [
          "Porque guarda as distâncias entre todos os pares de pontos: a memória cresce com n²",
          "Porque só aceita duas variáveis",
          "Porque precisa de saber o k à partida",
          "Porque não funciona com dados padronizados",
        ],
        answer: 0,
        explain: "Funciona bem até algumas dezenas de milhares de linhas. Acima disso, usa-se o k-means ou faz-se o hierárquico sobre uma amostra.",
      },
      {
        id: "q12", section: "s2",
        q: "A ligação Ward junta, a cada passo…",
        options: [
          "Os dois grupos com o ponto mais próximo",
          "O par de grupos que menos aumenta a inércia",
          "Os dois grupos maiores",
          "O par de grupos com a maior distância",
        ],
        answer: 1,
        explain: "Por isso dá grupos parecidos com os do k-means. Nos pinguins teve o melhor ARI, 0,916.",
      },
      {
        id: "q13", section: "s3",
        q: "No DBSCAN, um ponto de fronteira é…",
        options: [
          "Um ponto com pelo menos `min_samples` vizinhos",
          "Um ponto com rótulo −1",
          "Um ponto que não é central, mas está perto de um ponto central",
          "O ponto mais afastado de cada grupo",
        ],
        answer: 2,
        explain: "Entra no grupo do central que o alcança. Os pontos que não são centrais nem estão perto de um central são ruído.",
      },
      {
        id: "q14", section: "s3",
        q: "Porque é que o k-means falha nas duas luas (ARI de 0,269)?",
        options: [
          "Porque os dados não estão padronizados",
          "Porque as fronteiras entre os seus grupos são retas e corta as luas ao meio",
          "Porque k = 2 é pouco",
          "Porque há ruído a mais",
        ],
        answer: 1,
        explain: "Grupos em forma de lua enganam o k-means. O DBSCAN, que define grupos por densidade, chega a 0,995.",
      },
      {
        id: "q15", section: "s3",
        q: "Qual é a regra prática da aula para escolher o `eps` do DBSCAN?",
        options: [
          "Usar sempre 0,5, o valor por omissão",
          "Escolher o `eps` com maior silhueta",
          "Usar a distância média entre todos os pares de pontos",
          "Olhar para a distância de cada ponto ao seu vizinho número `min_samples` e escolher um valor um pouco acima da maioria dessas distâncias",
        ],
        answer: 3,
        explain: "Nas luas, os percentis 50, 90 e 95 dessas distâncias são 0,075, 0,122 e 0,145; com `eps` = 0,15 o DBSCAN acerta quase na perfeição.",
      },
      {
        id: "q16", section: "s3",
        q: "Que parâmetro principal pede o HDBSCAN?",
        options: ["O tamanho mínimo de um grupo (`min_cluster_size`)", "O raio `eps`", "O número de grupos", "A perplexidade"],
        answer: 0,
        explain: "Experimenta, na prática, todos os raios e fica com os grupos mais estáveis. Um tamanho mínimo é muito mais fácil de escolher do que um raio.",
      },
      {
        id: "q17", section: "s3",
        q: "Nas duas luas, com `min_samples=5`, o que acontece com `eps` = 0,2?",
        options: [
          "Dois grupos perfeitos",
          "Sete pedaços",
          "Tudo num só grupo, com ARI 0",
          "Quase tudo é ruído",
        ],
        answer: 2,
        explain: "Raio grande: as luas juntam-se. Com 0,05 quase tudo é ruído, com 0,1 há sete pedaços e com 0,15 aparecem as duas luas.",
      },
      {
        id: "q18", section: "s4",
        q: "A primeira componente principal é…",
        options: [
          "A variável com maior média",
          "A direção em que os dados variam mais",
          "A direção que melhor separa as classes",
          "A primeira coluna dos dados",
        ],
        answer: 1,
        explain: "A segunda é a de maior variância entre as perpendiculares à primeira, e assim por diante. A PCA não vê classes.",
      },
      {
        id: "q19", section: "s4",
        q: "Nos dígitos (64 variáveis), quantas componentes principais são precisas para chegar a 90% da variância?",
        options: ["2", "10", "64", "21"],
        answer: 3,
        explain: "Duas explicam 28,5% e dez 74%; são precisas 21 para os 90%. As 64 variáveis cabem razoavelmente em 21, mas não em 2.",
      },
      {
        id: "q20", section: "s4",
        q: "Ao contrário do t-SNE, qual destes métodos sabe colocar pontos novos num mapa já feito (`transform`)?",
        options: ["UMAP", "DBSCAN", "Ligação simples", "HDBSCAN"],
        answer: 0,
        explain: "O UMAP tem `transform`; o t-SNE não, e para pontos novos refaz-se o mapa todo. DBSCAN e HDBSCAN agrupam, não reduzem dimensões.",
      },
      {
        id: "q21", section: "s4",
        q: "A perplexidade do t-SNE é, mais ou menos…",
        options: [
          "O número de dimensões do mapa",
          "O número de iterações",
          "O número de vizinhos que cada ponto considera",
          "A distância mínima entre ilhas",
        ],
        answer: 2,
        explain: "Valores habituais entre 5 e 50. Mudá-la muda o desenho, por isso convém experimentar vários valores antes de concluir.",
      },
      {
        id: "q22", section: "s4",
        q: "Nos dígitos, porque é que o k-NN acerta só 60% no mapa da PCA e 97,6% no do t-SNE?",
        options: [
          "Porque a PCA viu os rótulos",
          "Porque duas direções lineares não chegam para separar os algarismos; o t-SNE mantém juntos os vizinhos",
          "Porque o t-SNE usa mais componentes",
          "Porque a PCA precisa de dados padronizados",
        ],
        answer: 1,
        explain: "A PCA projeta num plano, como uma sombra, e os algarismos sobrepõem-se. Nenhum método viu os rótulos.",
      },
      {
        id: "q23", section: "s5",
        q: "Porque é que na aula se trocou o sinal de `score_samples` e de `negative_outlier_factor_`?",
        options: [
          "Porque são distâncias negativas",
          "Para a AUC dar acima de 1",
          "Porque são logaritmos",
          "Porque no scikit-learn essas pontuações são \"maior = mais normal\"",
        ],
        answer: 3,
        explain: "Com o sinal trocado, maior quer dizer mais estranho, e a lista ordena-se do mais suspeito para o menos.",
      },
      {
        id: "q24", section: "s5",
        q: "Que método compara a densidade à volta de cada ponto com a densidade à volta dos seus vizinhos?",
        options: ["Isolation Forest", "LOF", "k-means", "PCA"],
        answer: 1,
        explain: "O LOF (Breunig et al., 2000): um ponto numa zona muito menos densa do que a dos vizinhos é suspeito, mesmo que não esteja longe de tudo.",
      },
      {
        id: "q25", section: "s5",
        q: "Nas anomalias plantadas, porque é que nenhum método apanha as que caíram dentro das nuvens?",
        options: [
          "Porque, com estas duas variáveis, são iguais aos pontos normais",
          "Porque `n_estimators` é pequeno",
          "Porque não se padronizou",
          "Porque a AUC está mal calculada",
        ],
        answer: 0,
        explain: "Uma anomalia só se deteta se for diferente nas variáveis que se têm.",
      },
    ],
    tf: [
      { id: "v1", section: "s1", q: "O ARI pode calcular-se sem rótulos verdadeiros.", answer: false, explain: "Compara a divisão encontrada com uma divisão conhecida; no trabalho quase nunca há rótulos, e aqui serve para aprender." },
      { id: "v2", section: "s1", q: "O k-means converge sempre, mas para um mínimo local que depende do ponto de partida.", answer: true, explain: "Cada passo reduz a inércia, por isso converge; o mínimo a que chega depende dos centros iniciais." },
      { id: "v3", section: "s1", q: "Nos pinguins, os Adelie que o k-means pôs no grupo errado são quase todos machos.", answer: true, explain: "Maiores do que as fêmeas: o k-means agrupa por tamanho e forma, e não sabe o que é uma espécie." },
      { id: "v4", section: "s1", q: "Se a silhueta prefere k = 2, a segmentação deve ter dois grupos.", answer: false, explain: "As métricas medem a separação geométrica, não a utilidade: o k escolhe-se também pela interpretação, pela capacidade de agir e pela estabilidade." },
      { id: "v5", section: "s2", q: "A ordem horizontal das folhas de um dendrograma tem significado.", answer: false, explain: "Só a altura das uniões tem significado." },
      { id: "v6", section: "s2", q: "Nos pinguins, a ligação Ward recuperou melhor as espécies do que o k-means.", answer: true, explain: "ARI de 0,916 contra 0,793." },
      { id: "v7", section: "s3", q: "O DBSCAN obriga cada ponto a pertencer a um grupo.", answer: false, explain: "Os pontos que não são centrais nem estão perto de um central ficam como ruído, com rótulo −1." },
      { id: "v8", section: "s3", q: "Em muitas dimensões, a noção de densidade perde sentido.", answer: true, explain: "É a maldição da dimensionalidade do M9. O DBSCAN funciona melhor com poucas variáveis ou depois de reduzir as dimensões." },
      { id: "v9", section: "s4", q: "A PCA é um método linear.", answer: true, explain: "Projeta os dados nas direções de maior variância, como uma sombra num plano." },
      { id: "v10", section: "s4", q: "Ruído puro, sem estrutura nenhuma, pode parecer ter grupos num mapa de t-SNE.", answer: true, explain: "Sobretudo com perplexidade baixa. Grupos num mapa de t-SNE não provam que existam grupos nos dados." },
      { id: "v11", section: "s4", q: "Nos dígitos, o k-NN no mapa de t-SNE acertou mais do que nas 64 dimensões originais.", answer: true, explain: "97,6% no mapa contra 96,3% nas 64 dimensões." },
      { id: "v12", section: "s5", q: "\"Anómalo\" quer dizer \"fraudulento\".", answer: false, explain: "Quer dizer \"diferente\". Muitas vezes os mais diferentes são simplesmente os melhores clientes." },
      { id: "v13", section: "s5", q: "O parâmetro `contamination` muda a ordem da lista de suspeitos.", answer: false, explain: "Só decide onde se corta a lista: com 0,02, os 2% mais estranhos recebem o rótulo −1." },
    ],
  },

  // ---------------------------------------------------------------- CARTÕES
  flashcards: [
    { id: "f1", section: "s1", tag: "Clustering", front: "Aprendizagem não supervisionada", back: "Encontrar estrutura em dados sem `y`: que grupos existem, que dimensões importam, que registos são estranhos." },
    { id: "f2", section: "s1", tag: "k-means", front: "Os quatro passos do k-means", back: "1. Escolher k centros iniciais. 2. Atribuir cada ponto ao centro mais próximo. 3. Mover cada centro para a média dos seus pontos. 4. Repetir 2 e 3 até nada mudar." },
    { id: "f3", section: "s1", tag: "k-means", front: "Inércia", back: "W = Σₖ Σᵢ∈Cₖ ‖xᵢ − μₖ‖²: soma das distâncias ao quadrado de cada ponto ao centro do seu grupo. Cada passo do k-means reduz-a; desce sempre com k." },
    { id: "f4", section: "s1", tag: "k-means", front: "k-means++ e `n_init`", back: "O k-means converge para um mínimo local. O k-means++ espalha os centros iniciais; `n_init` repete tudo várias vezes e fica com a menor inércia." },
    { id: "f5", section: "s1", tag: "Avaliação", front: "Índice de Rand ajustado (ARI)", back: "Concordância entre duas divisões (pares juntos ou separados da mesma maneira), corrigida para o acaso: 1 se iguais, perto de 0 ao calhas. Não liga aos nomes dos grupos; só com rótulos verdadeiros." },
    { id: "f6", section: "s1", tag: "k-means", front: "k-means nos pinguins: com e sem padronizar", back: "ARI de 0,793 padronizado e 0,331 sem padronizar: a massa, em gramas (desvio padrão ~800), domina as distâncias." },
    { id: "f7", section: "s1", tag: "k-means", front: "Perfis dos grupos", back: "`escala.inverse_transform(km.cluster_centers_)`: os centros nas unidades originais. É a tabela que se apresenta à equipa, com um nome para cada perfil." },
    { id: "f8", section: "s1", tag: "Avaliação", front: "Cotovelo", back: "O k a partir do qual mais grupos já pouco reduzem a inércia. Nos pinguins, em k = 3, mas pouco marcado." },
    { id: "f9", section: "s1", tag: "Avaliação", front: "Silhueta (Rousseeuw, 1987)", back: "s = (b − a) / max(a, b), com a a distância média ao próprio grupo e b ao grupo vizinho mais próximo. Perto de 1: bem dentro; perto de 0: fronteira; negativa: provavelmente no grupo errado." },
    { id: "f10", section: "s1", tag: "Avaliação", front: "Como escolher o k no trabalho", back: "Com as métricas e com três perguntas: os grupos têm interpretação? A equipa consegue agir sobre tantos segmentos? Os grupos mantêm-se com outra semente ou outra parte dos dados?" },
    { id: "f11", section: "s1", tag: "k-means", front: "O que o k-means assume", back: "Fronteiras retas, grupos redondos e de tamanhos parecidos, variáveis numéricas; os valores extremos puxam as médias. Em compensação, é rápido (`MiniBatchKMeans` para milhões de linhas)." },
    { id: "f12", section: "s2", tag: "Hierárquico", front: "Clustering hierárquico aglomerativo", back: "Começa com cada ponto no seu grupo e junta sempre os dois grupos mais próximos, até sobrar um. O k escolhe-se depois, ao cortar o dendrograma." },
    { id: "f13", section: "s2", tag: "Hierárquico", front: "As quatro ligações", back: "Completa: maior distância (grupos compactos). Média: média das distâncias. Simples: menor distância (cadeias; isola pontos estranhos). Ward: o par que menos aumenta a inércia (como o k-means)." },
    { id: "f14", section: "s2", tag: "Hierárquico", front: "Como ler um dendrograma", back: "A altura de cada união é a distância a que os grupos se juntaram. A ordem horizontal das folhas não tem significado." },
    { id: "f15", section: "s2", tag: "Hierárquico", front: "As ligações nos pinguins (k = 3)", back: "Ward 0,916, completa 0,895, média 0,637, simples 0,657; com média e simples, um \"grupo\" tem 4 pinguins, ou 1." },
    { id: "f16", section: "s2", tag: "Hierárquico", front: "Limite do clustering hierárquico", back: "Guarda as distâncias entre todos os pares: memória n². Até algumas dezenas de milhares de linhas; acima, k-means ou uma amostra." },
    { id: "f17", section: "s3", tag: "Densidade", front: "DBSCAN (Ester et al., 1996)", back: "Grupos = regiões densas separadas por zonas vazias. Parâmetros: `eps` (raio) e `min_samples` (pontos no raio, contando com ele, para ser central). Decide sozinho quantos grupos há." },
    { id: "f18", section: "s3", tag: "Densidade", front: "Pontos central, de fronteira e ruído", back: "Central: pelo menos `min_samples` pontos a menos de `eps`. Fronteira: não é central, mas está perto de um central. Ruído: o resto, com rótulo −1." },
    { id: "f19", section: "s3", tag: "Densidade", front: "Escolher o `eps`", back: "Distância de cada ponto ao vizinho número `min_samples` (contando com ele): um `eps` um pouco acima da maioria dessas distâncias. Nas luas, 0,15, perto do percentil 95." },
    { id: "f20", section: "s3", tag: "Densidade", front: "Duas luas: k-means contra DBSCAN", back: "k-means 0,269 (corta as luas ao meio); DBSCAN com eps 0,15: 0,995. Com 0,1, sete pedaços; com 0,2, tudo num grupo." },
    { id: "f21", section: "s3", tag: "Densidade", front: "HDBSCAN (Campello et al., 2013)", back: "Experimenta todos os raios e fica com os grupos mais estáveis; só pede `min_cluster_size`. Nas luas: 2 grupos, 13 de ruído, ARI 0,927." },
    { id: "f22", section: "s3", tag: "Densidade", front: "Limites do DBSCAN", back: "Um raio único funciona mal com densidades muito diferentes; em muitas dimensões, a densidade perde sentido. Melhor com poucas variáveis ou depois de reduzir dimensões." },
    { id: "f23", section: "s4", tag: "Dimensões", front: "Para que serve reduzir dimensões", back: "Comprimir, tirar ruído antes de outro modelo e conseguir ver os dados num gráfico de duas dimensões." },
    { id: "f24", section: "s4", tag: "Dimensões", front: "PCA", back: "A SVD aplicada aos dados centrados: direções de maior variância, por ordem, cada uma perpendicular às anteriores. Linear. Padronizar antes se as unidades diferem." },
    { id: "f25", section: "s4", tag: "Dimensões", front: "PCA nos dígitos", back: "2 componentes explicam 28,5%, 10 explicam 74%, 21 chegam aos 90%. Variância explicada pela componente j: λⱼ / Σ λ." },
    { id: "f26", section: "s4", tag: "Dimensões", front: "t-SNE (van der Maaten & Hinton, 2008)", back: "Transforma distâncias em probabilidades de vizinhança e procura um mapa 2D com probabilidades parecidas. Parâmetro: perplexidade (≈ número de vizinhos, 5 a 50). Sem `transform`." },
    { id: "f27", section: "s4", tag: "Dimensões", front: "UMAP (McInnes et al., 2018)", back: "Grafo de vizinhos preservado num mapa. Mais rápido, melhor estrutura global, tem `transform`. Parâmetros: `n_neighbors` e `min_dist`." },
    { id: "f28", section: "s4", tag: "Dimensões", front: "Como não ler um mapa de t-SNE", back: "Tamanho das ilhas e distância entre elas dizem pouco; perplexidade e semente mudam o desenho; ruído puro pode parecer ter grupos; não há `transform`." },
    { id: "f29", section: "s4", tag: "Dimensões", front: "PCA ou t-SNE/UMAP?", back: "PCA para comprimir e preparar dados para outros modelos; t-SNE e UMAP para olhar. Conclusões tiradas de um mapa confirmam-se nos dados originais." },
    { id: "f30", section: "s5", tag: "Anomalias", front: "Deteção de anomalias", back: "Quase nunca há rótulos: ordenar os registos do mais estranho para o menos estranho e entregar o topo da lista a uma pessoa." },
    { id: "f31", section: "s5", tag: "Anomalias", front: "Isolation Forest (Liu et al., 2008)", back: "Árvores com cortes totalmente ao acaso: um ponto isolado fica sozinho com poucos cortes, um ponto num sítio cheio precisa de muitos. A pontuação vem do número médio de cortes, em centenas de árvores." },
    { id: "f32", section: "s5", tag: "Anomalias", front: "LOF (Breunig et al., 2000)", back: "Compara a densidade à volta de cada ponto com a dos vizinhos: apanha anomalias locais, mesmo que não estejam longe de tudo. Precisa de escala." },
    { id: "f33", section: "s5", tag: "Anomalias", front: "Anomalias plantadas: resultados", back: "Isolation Forest AUC 0,922 (17 das 30 no top 30), LOF 0,886 (18). As que caem dentro das nuvens escapam a ambos." },
    { id: "f34", section: "s5", tag: "Anomalias", front: "\"Anómalo\" e `contamination`", back: "Anómalo = diferente, não fraude nem erro. `contamination` só decide onde se corta a lista (0,02: os 2% mais estranhos recebem −1)." },
  ],

  // ---------------------------------------------------------------- NOTEBOOK
  notebook: {
    filename: "M10 — exercícios",
    cells: [
      {
        type: "md",
        source:
          "# M10 — Aprendizagem não supervisionada\n\nExemplos da aula (correr pela ordem, no mesmo notebook) e os exercícios 2(d), 3, 4 e 6 a 10. Os exercícios 1 e 5 fazem-se à mão. Guardar no Drive, na pasta da Fase 2.",
      },
      { type: "code", source: "!pip install umap-learn" },
      { type: "code", source: IMPORTS },
      { type: "md", source: "## 1. Agrupar sem rótulos: k-means" },
      { type: "code", source: C_KMEANS.replace("import numpy as np\nimport pandas as pd\n", "") },
      { type: "code", source: C_SEM_ESCALA },
      { type: "code", source: C_PERFIS },
      { type: "code", source: C_QUANTOS },
      { type: "md", source: "## 2. Clustering hierárquico" },
      { type: "code", source: C_ESTADOS },
      { type: "code", source: C_LIGACAO },
      { type: "md", source: "## 3. DBSCAN: grupos por densidade" },
      { type: "code", source: C_LUAS },
      { type: "code", source: C_EPS },
      { type: "code", source: C_HDBSCAN },
      { type: "md", source: "## 4. Reduzir dimensões: PCA, t-SNE e UMAP" },
      { type: "code", source: C_PCA },
      { type: "code", source: C_MAPAS },
      { type: "md", source: "## 5. Deteção de anomalias" },
      { type: "code", source: C_ANOM },
      { type: "code", source: C_CREDIT },
      {
        type: "md",
        source:
          "## Exercícios\n\nO código do gabarito usa estes dados e importações (os mesmos da aula, com `silhouette_samples`).",
      },
      { type: "code", source: G_SETUP },
      { type: "md", source: "## Exercício 2(d)\n\nConfirmar as alturas das fusões com ligação simples e completa." },
      { type: "code", source: "from scipy.cluster.hierarchy import linkage\n\npontos = np.array([[1], [2], [6], [8], [15]])\n" },
      {
        type: "md",
        source:
          "## Exercício 3\n\n`KMeans(n_clusters=3, n_init=1, init=\"random\", random_state=s)` para s de 0 a 19, depois com k-means++: inércia e ARI de cada solução, e quantas vezes aparece cada uma.",
      },
      { type: "code", source: "for inicio in [\"random\", \"k-means++\"]:\n    res = []\n" },
      {
        type: "md",
        source:
          "## Exercício 4\n\n(a) Percentis 50, 90 e 95 da distância ao 5.º vizinho; (b) DBSCAN com `min_samples=5` e `eps` de 0,3 a 0,8; (c) HDBSCAN com `min_cluster_size` 5, 10, 20 e 40; (d) porque não separam os Adelie dos Chinstrap.",
      },
      { type: "code", source: "from sklearn.neighbors import NearestNeighbors\nfrom sklearn.cluster import DBSCAN, HDBSCAN\n" },
      { type: "md", source: "(d) Resposta:\n\n" },
      {
        type: "md",
        source:
          "## Exercício 6\n\nPara k = 2, 5, 10, 21, 40 e 64: (a) exatidão de `make_pipeline(PCA(n_components=k), LogisticRegression(max_iter=5000))` com `cv=5`; (b) erro quadrático médio de reconstrução por píxel; (c) o primeiro dígito e as reconstruções com 2, 10 e 21 componentes; (d) quantas componentes usaria.",
      },
      { type: "code", source: "from sklearn.linear_model import LogisticRegression\nfrom sklearn.pipeline import make_pipeline\n\nfor k in [2, 5, 10, 21, 40, 64]:\n    ...\n" },
      {
        type: "md",
        source:
          "## Exercício 7\n\n(a) t-SNE dos dígitos com perplexidade 5, 30 e 100 e o k-NN em cada mapa; (b) perplexidade 30 com `init=\"random\"` e sementes 0 e 1; (c) t-SNE de ruído puro com perplexidade 2 e 30.",
      },
      { type: "code", source: "ruido = np.random.default_rng(0).normal(size=(500, 50))\n" },
      {
        type: "md",
        source:
          "## Exercício 8\n\nIsolation Forest nos dígitos: (a) as 10 imagens mais anómalas, com o algarismo por cima; (b) os algarismos mais frequentes entre os 50 mais anómalos; (c) os 10 mais normais; (d) para que serviria a lista.",
      },
      { type: "code", source: "# pont = pontuação de anomalia de cada dígito, com o sinal trocado (maior = mais estranho)\n# ordem = np.argsort(-pont)\n" },
      {
        type: "md",
        source:
          "## Exercício 9\n\nCom `X_anom` e `e_estranho` da aula: (a) AUC do LOF com 5, 20, 50 e 100 vizinhos; (b) 2, 10 e 50 colunas de ruído (`np.random.default_rng(1)` de cada vez), AUC da Isolation Forest e do LOF; (c) porque sofre a Isolation Forest.",
      },
      { type: "code", source: "for n in [5, 20, 50, 100]:\n    ...\n" },
      {
        type: "md",
        source:
          "## Exercício 10\n\nSegmentar os 400 clientes do `Credit`: (a) correlações entre `Income`, `Limit`, `Rating` e `Balance`; (b) k-means com k de 2 a 8 em `Income`, `Limit`, `Balance`, `Age` e `Cards` padronizados; (c) perfis com k = 4 e um nome para cada; (d) mensagem para a equipa de marketing.",
      },
      { type: "code", source: "variaveis = [\"Income\", \"Limit\", \"Balance\", \"Age\", \"Cards\"]\n" },
      { type: "md", source: "(d) Mensagem:\n\n" },
      { type: "md", source: "## Notas\n\nO que aprendi neste módulo, em três frases:" },
    ],
  },
  source: "curso-engenharia-ia 2/modulo-10-nao-supervisionada",
};
