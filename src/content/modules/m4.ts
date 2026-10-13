import type { ModuleContent } from "../types";

// Módulo 4 — Álgebra linear para IA.
// Fonte: curso-engenharia-ia 3/modulo-04-algebra-linear (01-aula, 02-apostila, 03-exercicios, 04-prova, 05-gabarito,
// codigo/exemplos_m4.py e img/). As três imagens da aula entram como figuras; o produto escalar e o cosseno (com a pesquisa
// em miniatura), as transformações 2 × 2 com os vetores próprios e a compressão com a SVD têm widgets interativos
// (src/components/widgets/m4), com a lógica testada contra NumPy 2.5 e scikit-learn.
// As fórmulas em LaTeX da aula aparecem em notação Unicode, em blocos "Notação" (não há renderizador de LaTeX).
// As verificações rápidas, os cartões de revisão e o banco do simulado foram escritos pela plataforma a partir da aula,
// com todo o código corrido em Python 3.13, NumPy 2.5, pandas 3.0 e scikit-learn.

// ---------------------------------------------------------------- código da aula

const VEC_CODE = `import numpy as np
np.set_printoptions(precision=3, suppress=True)   # mostrar 3 casas decimais, como nesta aula

v = np.array([2, 1])
w = np.array([1, 3])
print(v + w, 3 * v, 2 * v - w)    # [3 4] [6 3] [ 3 -1]`;

const CESTOS_CODE = `cesto1 = np.array([2, 1, 0])   # 2 bolas, 1 luva, 0 bonés
cesto2 = np.array([0, 1, 3])
print(4 * cesto1 + 2 * cesto2)  # [8 6 6]`;

const DOT_CODE = `cesto1 = np.array([2, 1, 0])           # bolas, luvas, bonés
precos = np.array([12.5, 19.5, 22.0])
print(cesto1 @ precos)                 # 44.5  (2×12.5 + 1×19.5 + 0×22)`;

const NORM_CODE = `a = np.array([3, 4])
print(np.linalg.norm(a), np.abs(a).sum())   # 5.0 7`;

const COS_FN = `def cosseno(u, v):
    return (u @ v) / (np.linalg.norm(u) * np.linalg.norm(v))`;

const COS_CODE = `${COS_FN}

print(cosseno(np.array([1, 0]), np.array([0, 1])))    # 0.0
print(cosseno(np.array([1, 1]), np.array([2, 2])))    # 0.9999999999999998: é 1, com o erro de arredondamento do M2
print(cosseno(np.array([1, 0]), np.array([-1, 0])))   # -1.0`;

const SEARCH_CODE = `from sklearn.feature_extraction.text import CountVectorizer

docs = ["devolução de uma encomenda com defeito",
        "prazo de entrega da encomenda",
        "como trocar o tamanho de uma luva",
        "a luva chegou com defeito e quero devolver"]
pergunta = "quero devolver uma luva com defeito"

vec = CountVectorizer()
D = vec.fit_transform(docs).toarray()      # 4 documentos × 16 palavras
q = vec.transform([pergunta]).toarray()[0]
for d, s in sorted(zip(docs, [cosseno(q, x) for x in D]), key=lambda t: -t[1]):
    print(f"{s:.2f}  {d}")
# 0.83  a luva chegou com defeito e quero devolver
# 0.50  devolução de uma encomenda com defeito
# 0.33  como trocar o tamanho de uma luva
# 0.00  prazo de entrega da encomenda`;

const LOJAS_CODE = `vendas = np.array([[2, 1, 0],     # loja 1
                   [0, 1, 3],     # loja 2
                   [5, 2, 1]])    # loja 3
precos = np.array([12.5, 19.5, 22.0])
print(vendas @ precos)            # [ 44.5  85.5 123.5]`;

const MATMUL_CODE = `A = np.array([[1, 2], [3, 4]])
B = np.array([[0, 1], [1, 0]])
print(A @ B)    # [[2 1] [4 3]]
print(B @ A)    # [[3 4] [1 2]]   -> AB é diferente de BA!
print(A * B)    # [[0 2] [3 0]]   -> * multiplica elemento a elemento: outra operação

X = np.ones((200, 3))    # 200 clientes, 3 características
W = np.ones((3, 1))      # pesos de um modelo
print((X @ W).shape)     # (200, 1): uma previsão por cliente`;

const TRANSF_CODE = `S = np.array([[2, 1],
              [0, 1]])
print(S @ np.array([1, 0]), S @ np.array([0, 1]), S @ np.array([1, 1]))   # [2 0] [1 1] [3 1]
R = np.array([[0, -1],
              [1,  0]])          # rotação de 90°
print(R @ np.array([1, 0]))      # [0 1]`;

const SOLVE_CODE = `M = np.array([[2, 1], [1, 3]])
b = np.array([44.5, 71.0])
print(np.linalg.solve(M, b))     # [12.5 19.5]: bola 12,50 €, luva 19,50 €`;

const EIG_CODE = `C = np.array([[2, 1],
              [1, 2]])
valores, vetores = np.linalg.eigh(C)    # eigh: para matrizes simétricas
print(valores)     # [1. 3.]
print(vetores)     # [[-0.707  0.707]
                   #  [ 0.707  0.707]]   (cada COLUNA é um vetor próprio)

v = vetores[:, 1]                      # o vetor próprio do valor 3
print(C @ v, 3 * v)                    # [2.121 2.121] [2.121 2.121]: iguais`;

const SVD_CODE = `import matplotlib.pyplot as plt
import matplotlib.cbook as cbook

with cbook.get_sample_data("grace_hopper.jpg") as f:
    foto = plt.imread(f)              # (600, 512, 3): altura, largura, cores
img = foto.mean(axis=2) / 255         # média das 3 cores: matriz 600 × 512 entre 0 e 1

U, s, Vt = np.linalg.svd(img, full_matrices=False)
print(U.shape, s.shape, Vt.shape)     # (600, 512) (512,) (512, 512)
print(s[:5].round(1))                 # [198.9  50.2  47.4  37.2  34.9]

def aproximar(k):
    """Reconstrói a imagem só com as k primeiras camadas da SVD."""
    return U[:, :k] @ np.diag(s[:k]) @ Vt[:k, :]

for k in [5, 20, 50]:
    guardados = k * (img.shape[0] + img.shape[1] + 1)
    erro = np.linalg.norm(img - aproximar(k)) / np.linalg.norm(img)
    print(k, guardados, f"{guardados / img.size:.1%}", f"erro {erro:.1%}")
# 5 5565 1.8% erro 33.0%
# 20 22260 7.2% erro 18.5%
# 50 55650 18.1% erro 10.6%

fig, eixos = plt.subplots(1, 3, figsize=(10, 4))
for ax, k in zip(eixos, [5, 20, 50]):
    ax.imshow(np.clip(aproximar(k), 0, 1), cmap="gray")
    ax.set_title(f"k = {k}")
    ax.axis("off")
plt.show()`;

const PENGUINS = `pg = pd.read_csv("https://raw.githubusercontent.com/mwaskom/seaborn-data/master/penguins.csv")
colunas = ["bill_length_mm", "bill_depth_mm", "flipper_length_mm", "body_mass_g"]
pg = pg.dropna(subset=colunas)
X = pg[colunas].to_numpy()                    # (342, 4)`;

const PCA_CODE = `import pandas as pd

${PENGUINS}

Z = (X - X.mean(axis=0)) / X.std(axis=0)      # 1. padronizar
U, s, Vt = np.linalg.svd(Z, full_matrices=False)   # 2. SVD
var_explicada = s**2 / np.sum(s**2)           # 3. variância por componente
print(var_explicada.round(3))                 # [0.688 0.193 0.091 0.027]
print(Vt[0])                                  # [ 0.455 -0.4    0.576  0.548]
P = Z @ Vt[:2].T                              # 4. projetar em 2 dimensões: (342, 2)

fig, ax = plt.subplots(figsize=(7, 5))
for especie in ["Adelie", "Chinstrap", "Gentoo"]:
    m = (pg["species"] == especie).to_numpy()
    ax.scatter(P[m, 0], P[m, 1], label=especie, alpha=0.7)
ax.set_xlabel(f"Componente principal 1 ({var_explicada[0]:.0%} da variância)")
ax.set_ylabel(f"Componente principal 2 ({var_explicada[1]:.0%} da variância)")
ax.legend()
plt.show()`;

// ---------------------------------------------------------------- dados dos exercícios e da prova

const FAQ = `faq = ["quanto tempo demora a entrega de uma encomenda",
       "como devolver um produto com defeito",
       "quais são os métodos de pagamento aceites",
       "posso trocar o tamanho de uma peça de roupa",
       "a entrega é gratuita para encomendas acima de 50 euros"]`;

const AVALIACOES = `avaliacoes = np.array([[5, 4, 0, 1],
                       [4, 5, 1, 0],
                       [1, 0, 5, 4],
                       [0, 1, 4, 5]])   # linhas: clientes; colunas: produtos`;

const EX7_SOL = `K = np.array([[1, 2, 1],
              [0, 3, 2],
              [2, 0, 1]])
b = np.array([241, 102.5, 382])
print(np.linalg.solve(K, b))     # [180.   19.5  22. ]: saco 180 €, luva 19,50 €, boné 22 €`;

const EX8_SOL = `t = np.radians(30)
R = np.array([[np.cos(t), -np.sin(t)],
              [np.sin(t),  np.cos(t)]])
r = R @ np.array([1, 0])
print(r, np.linalg.norm(r))           # [0.866 0.5  ] 1.0
print(np.linalg.det(R))               # 1.0 (com arredondamento: 0.9999999999999999 ou 1.0)
print(R @ R @ R @ np.array([1, 0]))   # [0. 1.]: 3 × 30° = 90°`;

const EX9_SOL = `from sklearn.feature_extraction.text import CountVectorizer

def mais_parecidos(pergunta, docs, k=2):
    """Devolve os k documentos com maior semelhança do cosseno com a pergunta."""
    vec = CountVectorizer()
    D = vec.fit_transform(docs).toarray()
    q = vec.transform([pergunta]).toarray()[0]
    sims = np.array([cosseno(q, d) if np.linalg.norm(q) > 0 else 0.0 for d in D])
    ordem = np.argsort(-sims)[:k]
    return [(docs[i], round(float(sims[i]), 2)) for i in ordem]

print(mais_parecidos("quanto tempo demora a entrega", faq))
# [('quanto tempo demora a entrega de uma encomenda', 0.76),
#  ('a entrega é gratuita para encomendas acima de 50 euros', 0.18)]
print(mais_parecidos("aceitam pagamento por mbway", faq))
# [('quais são os métodos de pagamento aceites', 0.38), (... , 0.0)]`;

const EX10_SOL = `erros = []
for k in range(1, 201):
    aprox = U[:, :k] @ np.diag(s[:k]) @ Vt[:k, :]
    erros.append(np.linalg.norm(img - aprox) / np.linalg.norm(img))
erros = np.array(erros)
k5 = np.argmax(erros < 0.05) + 1
print(k5, erros[k5 - 1])                        # 123 0.0497
print(k5 * (600 + 512 + 1) / img.size)          # 0.446: 44,6% dos números

plt.plot(range(1, 201), erros)
plt.xlabel("k (número de camadas)")
plt.ylabel("Erro relativo")
plt.title("O erro cai depressa nas primeiras camadas e devagar depois")
plt.show()`;

const EX12_SOL = `from sklearn.decomposition import PCA
p = PCA(n_components=2).fit(Z)
print(p.explained_variance_ratio_)    # [0.688 0.193]: iguais
print(p.components_)
# [[ 0.455 -0.4    0.576  0.548]
#  [ 0.597  0.798  0.002  0.084]]`;

const P13_SOL = `N = avaliacoes / np.linalg.norm(avaliacoes, axis=1, keepdims=True)   # (a) linhas com norma 1
S = N @ N.T
print(S)
# [[1.    0.952 0.214 0.214]
#  [0.952 1.    0.214 0.214]
#  [0.214 0.214 1.    0.952]
#  [0.214 0.214 0.952 1.   ]]
print(np.argsort(-S[0])[1])          # (b) 1: o cliente 1

U, s, Vt = np.linalg.svd(avaliacoes)
print(s)                             # [10.     8.     1.414  1.414]
print((s[:2]**2).sum() / (s**2).sum())   # (c) 0.976

A2 = U[:, :2] @ np.diag(s[:2]) @ Vt[:2, :]
print(A2)                            # (d) [[4.5 4.5 0.5 0.5] ... [0.5 0.5 4.5 4.5]]
print(np.linalg.norm(avaliacoes - A2) / np.linalg.norm(avaliacoes))   # 0.154`;

const IMPORTS = `import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
np.set_printoptions(precision=3, suppress=True)   # mostrar 3 casas decimais, como na aula

${COS_FN}`;

export const M4: ModuleContent = {
  id: "M4",
  duration: "3 semanas, cerca de 9 horas",
  intro:
    "No fim deste módulo deve saber operar com vetores e matrizes em NumPy, calcular semelhanças entre vetores, perceber uma matriz como uma transformação, explicar o que são valores e vetores próprios, e usar a SVD e a PCA para comprimir e resumir dados.",
  outcomes: [
    "Operar com vetores e matrizes em NumPy",
    "Calcular semelhanças entre vetores",
    "Perceber uma matriz como uma transformação",
    "Explicar o que são valores e vetores próprios",
    "Usar a SVD e a PCA para comprimir e resumir dados",
  ],
  goldenRule:
    "Tentar cada exercício antes de abrir o gabarito. Os da Parte A fazem-se primeiro à mão, em papel, e só depois se confirmam em NumPy. Usar um assistente de IA para explicar um erro é válido; pedir-lhe a resposta não é.",
  sessions: [
    {
      id: "w1s1",
      label: "Semana 1 · sessão 1",
      minutes: 90,
      tasks: [
        { id: "t1", text: "Ler as secções 1 e 2", link: { kind: "section", id: "s1" } },
        {
          id: "t2",
          text: "Ver os vídeos 1 e 2 de \"Essence of Linear Algebra\" (3Blue1Brown)",
          link: { kind: "url", href: "https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab" },
        },
      ],
    },
    {
      id: "w1s2",
      label: "Semana 1 · sessão 2",
      minutes: 90,
      tasks: [
        { id: "t1", text: "Ler a secção 3", link: { kind: "section", id: "s3" } },
        {
          id: "t2",
          text: "Ver o vídeo 9 (produto escalar)",
          link: { kind: "url", href: "https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab" },
        },
        { id: "t3", text: "Exercícios 1 a 3", link: { kind: "tab", tab: "exercicios" } },
      ],
    },
    {
      id: "w2s1",
      label: "Semana 2 · sessão 1",
      minutes: 90,
      tasks: [
        { id: "t1", text: "Ler a secção 4", link: { kind: "section", id: "s4" } },
        {
          id: "t2",
          text: "Ver os vídeos 3, 4 e 6",
          link: { kind: "url", href: "https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab" },
        },
        { id: "t3", text: "Exercícios 4 a 6", link: { kind: "tab", tab: "exercicios" } },
      ],
    },
    {
      id: "w2s2",
      label: "Semana 2 · sessão 2",
      minutes: 90,
      tasks: [
        { id: "t1", text: "Ler a secção 5", link: { kind: "section", id: "s5" } },
        {
          id: "t2",
          text: "Ver os vídeos 14 e 15 (vetores próprios)",
          link: { kind: "url", href: "https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab" },
        },
        { id: "t3", text: "Exercícios 7 e 8", link: { kind: "tab", tab: "exercicios" } },
      ],
    },
    {
      id: "w3s1",
      label: "Semana 3 · sessão 1",
      minutes: 90,
      tasks: [
        { id: "t1", text: "Ler as secções 6 e 7", link: { kind: "section", id: "s6" } },
        { id: "t2", text: "Exercícios 9 a 11", link: { kind: "tab", tab: "exercicios" } },
      ],
    },
    {
      id: "w3s2",
      label: "Semana 3 · sessão 2",
      minutes: 90,
      tasks: [
        { id: "t1", text: "Exercício 12", link: { kind: "tab", tab: "exercicios" } },
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
      title: "Porquê álgebra linear: em IA, tudo é vetor ou matriz",
      minutes: 15,
      blocks: [
        {
          t: "callout",
          tone: "info",
          title: "Como estudar este módulo",
          text: "A Fase 1 é a mais abstrata do curso, e a forma de estudar faz diferença. Três técnicas têm forte apoio na investigação (Dunlosky et al., 2013):",
        },
        {
          t: "list",
          items: [
            "**Prática de recuperação.** Tentar lembrar é mais eficaz do que reler: estudantes que se testaram recordavam bastante mais uma semana depois do que os que releram, apesar de se sentirem menos confiantes (Roediger & Karpicke, 2006). Abra cada sessão com 5 minutos a escrever, de memória, o que aprendeu na anterior.",
            "**Prática espaçada.** Três sessões de uma hora rendem mais do que uma de três (Cepeda et al., 2006). Os exercícios do M5 e do M6 voltam a usar o que se aprende aqui.",
            "**Exemplos resolvidos.** No início, estudar um exemplo resolvido passo a passo ensina mais do que tentar sozinho (Sweller & Cooper, 1985). Cada secção tem um exemplo; refaça-o à mão antes de o correr no Colab.",
          ],
        },
        {
          t: "p",
          text: "Reler e sublinhar, as técnicas mais usadas, estão entre as de menor utilidade (Dunlosky et al., 2013). A matemática aparece sempre com o código NumPy ao lado. Os resultados nos comentários do código são os reais.",
        },
        {
          t: "p",
          text: "Um modelo de IA não vê clientes, frases nem fotografias: vê listas de números. A álgebra linear é a matemática dessas listas e tabelas, e é a língua em que estão escritos praticamente todos os algoritmos do curso (Deisenroth, Faisal & Ong, 2020, cap. 2).",
        },
        {
          t: "table",
          head: ["Objeto real", "Como o modelo o vê", "Forma típica"],
          rows: [
            ["Um cliente", "Um vetor de características: idade, compras por ano, gasto médio", "(3,)"],
            ["Uma tabela de 200 clientes", "Uma matriz, uma linha por cliente", "(200, 3)"],
            ["Uma foto a preto e branco", "Uma matriz de intensidades de píxeis", "(600, 512)"],
            ["Uma foto a cores", "Um tensor: três matrizes, uma por cor", "(600, 512, 3)"],
            ["Uma frase num LLM", "Um vetor de *embedding* com centenas ou milhares de números", "(1536,), por exemplo"],
            ["Uma camada de uma rede neuronal", "Uma matriz de pesos que transforma vetores", "(entradas, saídas)"],
          ],
        },
        { t: "p", text: "Três ideias deste módulo voltam ao longo do curso inteiro:" },
        {
          t: "list",
          ordered: true,
          items: [
            "**Semelhança entre vetores** ([secção 3](#s3)): é assim que um sistema RAG encontra os documentos que respondem a uma pergunta (M20).",
            "**Matrizes como transformações** ([secção 4](#s4)): cada camada de uma rede neuronal é uma multiplicação de matrizes seguida de uma função simples (M12).",
            "**Decomposições** (secções [5](#s5) a [7](#s7)): partir uma matriz em peças mais simples permite comprimir, resumir e visualizar dados (M10) e está por trás do fine-tuning com LoRA (M22).",
          ],
        },
        {
          t: "check",
          id: "qc1",
          q: "Uma tabela de 200 clientes, cada um descrito pela idade, pelas compras por ano e pelo gasto médio. Como a vê um modelo?",
          options: ["Um vetor de forma (3,)", "Um vetor de forma (200,)", "Uma matriz de forma (200, 3)", "Um tensor de forma (200, 3, 3)"],
          answer: 2,
          explain:
            "Uma linha por cliente e uma coluna por característica: (200, 3). Cada linha sozinha é o vetor (3,) de um cliente.",
        },
      ],
    },
    {
      id: "s2",
      num: 2,
      title: "Vetores e combinações lineares",
      minutes: 20,
      blocks: [
        {
          t: "p",
          text: "Um **vetor** é uma lista ordenada de números. Há duas formas úteis de o imaginar: como uma seta que parte da origem (a visão geométrica, que funciona em 2 e 3 dimensões) e como uma lista de características de alguma coisa (a visão de dados, que funciona em qualquer número de dimensões). Escreve-se em coluna:",
        },
        {
          t: "code",
          title: "Notação",
          code: `v = [2]      w = [1]
    [1]          [3]`,
        },
        {
          t: "p",
          text: "As duas operações básicas fazem-se elemento a elemento: **somar** vetores e **multiplicar por um escalar** (um número).",
        },
        {
          t: "code",
          title: "Notação",
          code: `v + w = [3]      3v = [6]
        [4]           [3]`,
        },
        { t: "code", title: "Somar e multiplicar por um escalar", code: VEC_CODE },
        {
          t: "p",
          text: "Geometricamente, somar é pôr as setas uma a seguir à outra; multiplicar por 3 é esticar a seta três vezes; multiplicar por um número negativo inverte-lhe o sentido.",
        },
        { t: "h3", text: "Combinações lineares" },
        {
          t: "p",
          text: "Juntar as duas operações dá uma **combinação linear**: c₁v₁ + c₂v₂ + … Exemplo com dados: cada cesto de compras é um vetor (bolas, luvas, bonés). Quatro clientes que compram o cesto 1 e dois que compram o cesto 2 compram, no total:",
        },
        { t: "code", title: "Combinação linear de dois cestos", code: CESTOS_CODE },
        {
          t: "p",
          text: "O conjunto de todas as combinações lineares de alguns vetores chama-se o seu **espaço gerado** (*span*). Dois vetores no plano que não estão na mesma reta geram o plano inteiro: qualquer ponto se escreve como c₁v + c₂w. Se estiverem na mesma reta, são **linearmente dependentes**: um deles não acrescenta nenhuma direção nova. Esta ideia volta na PCA, que procura as poucas direções que realmente contam num conjunto de dados.",
        },
        {
          t: "p",
          text: "A dimensão de um vetor de dados não tem limite: um cliente pode ter 3 características e um embedding 1536. Nada no código muda; só deixamos de conseguir desenhar. A intuição geométrica de 2 e 3 dimensões continua a valer, e é por isso que se treina com setas no plano.",
        },
        {
          t: "check",
          id: "qc2",
          q: "Qual destes pares de vetores do plano **não** gera o plano inteiro?",
          options: ["(1, 2) e (−2, −4)", "(1, 0) e (0, 1)", "(2, 1) e (1, 3)", "(1, 1) e (1, −1)"],
          answer: 0,
          explain:
            "(−2, −4) = −2·(1, 2): os dois estão na mesma reta, são linearmente dependentes, e todas as combinações c₁(1, 2) + c₂(−2, −4) ficam nessa reta. Os outros pares apontam em direções diferentes.",
        },
      ],
    },
    {
      id: "s3",
      num: 3,
      title: "Produto escalar, normas e semelhança do cosseno",
      minutes: 35,
      blocks: [
        { t: "h3", text: "Produto escalar" },
        {
          t: "p",
          text: "O **produto escalar** de dois vetores multiplica-os elemento a elemento e soma tudo. O resultado é um número:",
        },
        { t: "code", title: "Notação", code: "u · v = Σᵢ₌₁ⁿ uᵢvᵢ = u₁v₁ + u₂v₂ + … + uₙvₙ" },
        { t: "p", text: "Exemplo prático: o valor de um cesto é o produto escalar entre as quantidades e os preços." },
        { t: "code", title: "Produto escalar", code: DOT_CODE },
        {
          t: "p",
          text: "Em NumPy, `@` é o operador do produto escalar e do produto de matrizes. Um neurónio artificial faz exatamente isto: multiplica as entradas pelos pesos, soma, e aplica uma função simples ao resultado (M12).",
        },
        { t: "h3", text: "Normas: o tamanho de um vetor" },
        {
          t: "p",
          text: "A **norma** mede o comprimento de um vetor. A mais usada é a euclidiana (norma L2), o teorema de Pitágoras em n dimensões; a norma L1 soma os valores absolutos.",
        },
        { t: "code", title: "Notação", code: "‖v‖₂ = √(Σᵢ vᵢ²)        ‖v‖₁ = Σᵢ |vᵢ|" },
        { t: "code", title: "Normas L2 e L1", code: NORM_CODE },
        {
          t: "p",
          text: "As normas medem distâncias (a distância entre u e v é a norma de u − v) e aparecem nos erros dos modelos e na regularização Ridge (L2) e Lasso (L1) do M8.",
        },
        { t: "h3", text: "Semelhança do cosseno" },
        {
          t: "p",
          text: "O produto escalar também mede o ângulo entre dois vetores. Dividindo-o pelas normas obtém-se o **cosseno do ângulo**, um número entre −1 e 1 que mede se dois vetores apontam para o mesmo lado, independentemente do seu tamanho:",
        },
        { t: "code", title: "Notação", code: "cos(θ) = (u · v) / (‖u‖ ‖v‖)" },
        {
          t: "table",
          head: ["Cosseno", "Ângulo", "Significado"],
          rows: [
            ["1", "0°", "Mesma direção: muito parecidos"],
            ["0", "90°", "Perpendiculares: nada em comum"],
            ["−1", "180°", "Direções opostas"],
          ],
        },
        { t: "code", title: "Semelhança do cosseno", code: COS_CODE },
        { t: "h3", text: "Exemplo: uma pesquisa semântica em miniatura" },
        {
          t: "p",
          text: "A semelhança do cosseno é o coração da pesquisa em sistemas RAG: perguntas e documentos são transformados em vetores e devolvem-se os documentos com maior cosseno. Mikolov et al. (2013) mostraram que vetores aprendidos a partir de texto (*word embeddings*) põem palavras de significado parecido em direções parecidas. Aqui usa-se uma versão simples: cada texto vira o vetor das contagens das suas palavras, como o `CountVectorizer` do M1.",
        },
        { t: "code", title: "Pesquisa semântica em miniatura", code: SEARCH_CODE },
        {
          t: "p",
          text: "Funciona, mas tem um limite: para este método, \"devolução\" e \"devolver\" são palavras sem nada em comum. Os embeddings de um modelo de linguagem resolvem isso, porque aprendem o significado e não só a forma das palavras. O cálculo do cosseno é exatamente o mesmo: só mudam os vetores.",
        },
        {
          t: "widget",
          name: "m4-cosine",
          caption:
            "Produto escalar e cosseno: arraste as setas e veja o que o Python imprime. Na segunda parte, a pesquisa da aula com outra pergunta: o vocabulário, as contagens e os cossenos são os do CountVectorizer e do NumPy.",
        },
        {
          t: "check",
          id: "qc3",
          q: "Um texto tem o vetor de contagens (1, 2, 0); outro, que é o primeiro repetido duas vezes, tem (2, 4, 0). Quanto vale a semelhança do cosseno entre os dois?",
          options: ["0,5", "2", "10", "1"],
          answer: 3,
          explain:
            "(2, 4, 0) = 2·(1, 2, 0): a mesma direção, com o dobro do tamanho. O cosseno ignora o tamanho e dá 1 (o NumPy imprime 0.9999999999999998, por arredondamento). 10 é só o produto escalar.",
        },
      ],
    },
    {
      id: "s4",
      num: 4,
      title: "Matrizes, multiplicação e transformações lineares",
      minutes: 40,
      blocks: [
        {
          t: "p",
          text: "Uma **matriz** é uma tabela de números com m linhas e n colunas. Tal como os vetores, tem duas leituras: uma tabela de dados (cada linha um exemplo, cada coluna uma característica) e uma **transformação** que pega num vetor e devolve outro.",
        },
        { t: "h3", text: "Multiplicar uma matriz por um vetor" },
        {
          t: "p",
          text: "Cada linha da matriz faz um produto escalar com o vetor. Exemplo: três lojas venderam quantidades diferentes de bolas, luvas e bonés; multiplicando pela tabela de preços obtém-se a faturação de cada loja numa só operação.",
        },
        { t: "code", title: "Matriz × vetor", code: LOJAS_CODE },
        {
          t: "p",
          text: "Há uma segunda leitura, mais profunda: **A**x é uma combinação linear das colunas de **A**, com os elementos de x como pesos (Strang, 2023, secção 1.3).",
        },
        { t: "h3", text: "Multiplicar matrizes" },
        {
          t: "p",
          text: "O produto **AB** só existe se o número de colunas de **A** for igual ao número de linhas de **B**: (m × n) por (n × p) dá (m × p). O elemento (i, j) do resultado é o produto escalar da linha i de **A** com a coluna j de **B**.",
        },
        { t: "code", title: "Produto de matrizes", code: MATMUL_CODE },
        {
          t: "p",
          text: "Duas armadilhas clássicas: a ordem conta (**AB** ≠ **BA** em geral) e `*` não é o produto de matrizes. Verificar as formas antes de multiplicar evita a maioria dos erros: as dimensões \"de dentro\" têm de coincidir.",
        },
        { t: "h3", text: "Transformações lineares" },
        {
          t: "p",
          text: "Vista como transformação, uma matriz 2 × 2 deforma o plano inteiro: rodando, esticando ou inclinando, mas mantendo as retas retas e a origem fixa. As colunas da matriz dizem para onde vão os vetores (1, 0) e (0, 1), e isso chega para saber para onde vai qualquer outro (3Blue1Brown, \"Essence of Linear Algebra\", vídeo 3).",
        },
        {
          t: "figure",
          src: "img/01-transformacao.png",
          alt: "Uma matriz transforma o plano: as colunas dizem para onde vão (1, 0) e (0, 1)",
        },
        { t: "code", title: "Transformações", code: TRANSF_CODE },
        {
          t: "p",
          text: "O **determinante** mede quanto a transformação multiplica as áreas: `np.linalg.det(S)` dá 2, porque o quadrado de área 1 passa a um paralelogramo de área 2. Um determinante 0 significa que a matriz achata o plano numa reta: perde informação e não tem inversa.",
        },
        {
          t: "widget",
          name: "m4-transform",
          caption:
            "Explorador de transformações: edite a matriz ou escolha um exemplo. A grelha, o quadrado unitário e as imagens de (1, 0) e (0, 1) mudam com ela; os produtos aparecem como o NumPy os imprime.",
        },
        { t: "h3", text: "Identidade, transposta, inversa e sistemas de equações" },
        {
          t: "list",
          items: [
            "A **identidade** `np.eye(n)` não muda nada: **I**x = x.",
            "A **transposta** `A.T` troca linhas com colunas.",
            "A **inversa** desfaz a transformação: **A**⁻¹**A** = **I**. Só existe se o determinante não for 0.",
          ],
        },
        {
          t: "p",
          text: "Uma aplicação: num dia, uma loja vendeu 2 bolas e 1 luva por 44,50 €; noutro, 1 bola e 3 luvas por 71 €. Quanto custa cada uma?",
        },
        {
          t: "code",
          title: "Notação",
          code: `[2  1] [b]   [44.5]
[1  3] [l] = [71  ]`,
        },
        { t: "code", title: "Resolver o sistema", code: SOLVE_CODE },
        {
          t: "p",
          text: "Na prática usa-se `np.linalg.solve` e não `np.linalg.inv(M) @ b`: dá o mesmo resultado, mas é mais rápido e mais preciso (Goodfellow, Bengio & Courville, 2016, cap. 4). A regressão linear do mini-projeto da fase é um sistema destes, com mais equações do que incógnitas.",
        },
        {
          t: "check",
          id: "qc4",
          q: "Qual destas matrizes achata o plano numa reta e, por isso, não tem inversa?",
          options: ["`[[2, 1], [0, 1]]`", "`[[1, 2], [2, 4]]`", "`[[0, -1], [1, 0]]`", "`[[2, 1], [1, 3]]`"],
          answer: 1,
          explain:
            "O determinante de `[[1, 2], [2, 4]]` é 1×4 − 2×2 = 0: a segunda coluna é o dobro da primeira, e as duas vão parar à mesma reta. As outras têm determinante 2, 1 e 5.",
        },
      ],
    },
    {
      id: "s5",
      num: 5,
      title: "Valores e vetores próprios",
      minutes: 30,
      blocks: [
        {
          t: "p",
          text: "Quando uma matriz transforma o plano, quase todos os vetores mudam de direção. Mas alguns só são esticados ou encolhidos, sem rodar. Esses são os **vetores próprios** da matriz, e o fator de esticamento é o **valor próprio** (λ, \"lambda\"):",
        },
        { t: "code", title: "Notação", code: "Av = λv" },
        {
          t: "p",
          text: "Os vetores próprios são as \"direções naturais\" de uma transformação. Descrever a matriz nessas direções torna-a simples: em vez de uma mistura de rotações e inclinações, passa a ser só esticar cada direção pelo seu valor próprio.",
        },
        { t: "h3", text: "Exemplo" },
        { t: "code", title: "Valores e vetores próprios", code: EIG_CODE },
        {
          t: "p",
          text: "A direção (1, 1) é esticada 3 vezes e a direção (−1, 1) fica igual (valor próprio 1). O NumPy devolve vetores de comprimento 1, por isso aparece 0,707 = 1/√2. O sinal pode sair trocado noutro computador: v e −v são o mesmo vetor próprio.",
        },
        {
          t: "p",
          text: "**`eigh` ou `eig`?** Para matrizes simétricas (iguais à sua transposta), como as matrizes de covariância, usa-se `np.linalg.eigh`: é mais rápida, devolve números reais e ordena os valores do menor para o maior. `np.linalg.eig` serve para qualquer matriz quadrada, mas pode devolver números complexos (com `+0.j`), mesmo quando a parte imaginária é zero.",
        },
        {
          t: "widget",
          name: "m4-eigen",
          caption:
            "O mesmo explorador, a começar na matriz C: as linhas tracejadas são as direções próprias, que a transformação só estica. Experimente a rotação: não tem vetores próprios reais.",
        },
        { t: "h3", text: "À mão, para uma matriz 2 × 2" },
        { t: "p", text: "Os valores próprios são as soluções de det(**A** − λ**I**) = 0. Para a matriz **C**:" },
        {
          t: "code",
          title: "Notação",
          code: `det [2−λ   1 ] = (2−λ)² − 1 = 0   ⇒   λ = 1 ou λ = 3
    [ 1   2−λ]`,
        },
        { t: "h3", text: "Onde aparecem em IA" },
        {
          t: "list",
          items: [
            "**PCA** ([secção 7](#s7)): os vetores próprios da matriz de covariância de um conjunto de dados são as direções de maior variação; os valores próprios dizem quanta variação há em cada uma.",
            "**PageRank**: o algoritmo original do Google ordenava as páginas pelo vetor próprio principal da matriz de ligações da web (Brin & Page, 1998).",
            "**Otimização** (M5): os valores próprios da matriz de segundas derivadas dizem se um ponto é um mínimo e por que razão a descida do gradiente fica lenta quando as variáveis têm escalas muito diferentes.",
          ],
        },
        {
          t: "check",
          id: "qc5",
          q: "Com `C = np.array([[2, 1], [1, 2]])`, o que imprime `C @ np.array([1, -1])`?",
          options: ["`[3 3]`", "`[ 3 -3]`", "`[ 1 -1]`", "`[0 0]`"],
          answer: 2,
          explain:
            "(1, −1) é a direção (−1, 1) com o sinal trocado: um vetor próprio de C com valor próprio 1. A matriz deixa-o igual: 2×1 + 1×(−1) = 1 e 1×1 + 2×(−1) = −1.",
        },
      ],
    },
    {
      id: "s6",
      num: 6,
      title: "SVD: comprimir uma imagem",
      minutes: 30,
      blocks: [
        {
          t: "p",
          text: "Os vetores próprios só existem para matrizes quadradas. A **decomposição em valores singulares** (SVD) generaliza a ideia a qualquer matriz, e é provavelmente a decomposição mais útil da álgebra linear aplicada (Strang, 2023, cap. 7):",
        },
        { t: "code", title: "Notação", code: "A = UΣVᵀ" },
        {
          t: "list",
          items: [
            "**V**ᵀ roda o espaço de entrada;",
            "**Σ** estica cada direção por um **valor singular** (σ₁ ≥ σ₂ ≥ … ≥ 0), ordenados do maior para o menor;",
            "**U** roda para o espaço de saída.",
          ],
        },
        {
          t: "p",
          text: "Dito de outra forma, a SVD escreve **A** como uma soma de camadas simples, cada uma com o seu peso σᵢ: **A** = σ₁u₁v₁ᵀ + σ₂u₂v₂ᵀ + … As primeiras camadas têm os pesos maiores e carregam quase toda a informação. Guardar só as k primeiras dá a melhor aproximação possível de **A** com essa quantidade de camadas: é o teorema de Eckart & Young (1936).",
        },
        { t: "h3", text: "Exemplo: comprimir uma fotografia" },
        {
          t: "p",
          text: "Uma fotografia a preto e branco é uma matriz. O Matplotlib traz um retrato de Grace Hopper, pioneira da programação, que serve de exemplo:",
        },
        { t: "code", title: "Comprimir uma fotografia com a SVD", code: SVD_CODE },
        {
          t: "figure",
          src: "img/02-svd-compressao.png",
          alt: "Compressão com SVD: k = 5, 20 e 50 camadas, ao lado do original",
        },
        {
          t: "p",
          text: "Com 50 camadas, guardam-se 18% dos números e a imagem já é perfeitamente reconhecível. Cada camada custa 600 + 512 + 1 números (uma coluna de **U**, uma linha de **V**ᵀ e um valor singular).",
        },
        {
          t: "p",
          text: "O primeiro valor singular (198,9) é quatro vezes maior do que o segundo: muita da imagem é \"brilho médio\". Os dados reais têm quase sempre esta estrutura, com poucas direções importantes e muitas quase irrelevantes. É por isso que a compressão funciona, e é a mesma ideia por trás do LoRA, que ajusta LLMs enormes mudando apenas matrizes de baixa característica (M22).",
        },
        {
          t: "widget",
          name: "m4-svd",
          caption:
            "A mesma ideia numa imagem de 16 × 16: escolha k e compare a reconstrução com o original. Os valores singulares, o erro relativo e a reconstrução são os do np.linalg.svd.",
        },
        {
          t: "check",
          id: "qc6",
          q: "Na fotografia de 600 × 512, quantos números é preciso guardar com k = 10 camadas?",
          options: ["11 130", "5 120", "307 200", "1 113"],
          answer: 0,
          explain:
            "Cada camada custa 600 + 512 + 1 = 1113 números; 10 camadas são 11 130, cerca de 3,6% dos 307 200 píxeis da imagem.",
        },
      ],
    },
    {
      id: "s7",
      num: 7,
      title: "PCA: reduzir dimensões",
      minutes: 30,
      blocks: [
        {
          t: "p",
          text: "A **análise de componentes principais** (PCA) procura as direções em que os dados variam mais e reescreve-os nessas direções. Ficando só com as primeiras, resume-se um conjunto de muitas variáveis em poucas, perdendo o mínimo de informação. Pearson (1901) propô-la como o problema de encontrar a reta ou o plano mais próximos de uma nuvem de pontos; Hotelling (1933) deu-lhe a formulação estatística, em termos de variância.",
        },
        { t: "p", text: "A receita usa tudo o que se viu até aqui:" },
        {
          t: "list",
          ordered: true,
          items: [
            "**Padronizar** cada coluna (subtrair a média, dividir pelo desvio padrão), para que variáveis em gramas não dominem as que estão em milímetros.",
            "Calcular a **SVD** dos dados padronizados. As linhas de **V**ᵀ são as componentes principais, que também são os vetores próprios da matriz de covariância.",
            "A **fração da variância** explicada por cada componente é σᵢ² / Σσⱼ².",
            "**Projetar** os dados nas k primeiras componentes: **Z** **V**ₖ.",
          ],
        },
        { t: "h3", text: "Exemplo: os pinguins da Fase 0" },
        { t: "code", title: "PCA dos pinguins", code: PCA_CODE },
        {
          t: "figure",
          src: "img/03-pca-pinguins.png",
          alt: "PCA dos pinguins: quatro medidas resumidas em duas componentes",
        },
        {
          t: "p",
          text: "Duas componentes guardam 88% da variação das quatro medidas. A primeira (69%) dá peso parecido à barbatana, à massa e ao comprimento do bico, e peso negativo à profundidade: funciona como um eixo de \"tamanho e forma do corpo\", e separa os Gentoo das outras espécies sem que o algoritmo saiba que espécies existem. Adelie e Chinstrap continuam misturados: com estas medidas são parecidos.",
        },
        { t: "p", text: "Três avisos práticos:" },
        {
          t: "list",
          items: [
            "Sem padronizar, a massa (em gramas, valores na casa dos milhares) dominaria a primeira componente sozinha.",
            "O sinal das componentes é arbitrário: noutro computador o gráfico pode aparecer espelhado, e isso não muda nada.",
            "A PCA só encontra estrutura **linear**. Para visualizar estrutura curva usam-se t-SNE ou UMAP, que se estudam no M10.",
          ],
        },
        {
          t: "p",
          text: "Na prática, o scikit-learn faz tudo isto com `PCA(n_components=2).fit_transform(Z)`. Vale a pena fazê-lo uma vez à mão, como aqui, para saber o que essa linha esconde.",
        },
        {
          t: "check",
          id: "qc7",
          q: "Com `var_explicada = [0.688 0.193 0.091 0.027]`, que fração da variação das quatro medidas guardam as duas primeiras componentes?",
          options: ["69%", "19%", "100%", "88%"],
          answer: 3,
          explain:
            "0,688 + 0,193 = 0,881: 88%. As quatro componentes juntas guardam 100%, mas a ideia da PCA é ficar com poucas e perder o mínimo.",
        },
      ],
    },
  ],

  readings: {
    required: [
      {
        text: "Deisenroth, M. P., Faisal, A. A. & Ong, C. S. (2020). [*Mathematics for Machine Learning*](https://mml-book.github.io/). Cambridge University Press. Caps. 2 (álgebra linear), 3 (geometria analítica: normas, produto escalar, ângulos), 4 (decomposições: valores próprios, SVD) e 10 (PCA). PDF gratuito para uso pessoal.",
        href: "https://mml-book.github.io/",
      },
      {
        text: "3Blue1Brown, [\"Essence of Linear Algebra\"](https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab): vídeos 1 a 4, 6, 9, 14 e 15. Curtos e excelentes para a intuição geométrica.",
        href: "https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab",
      },
    ],
    complementary: [
      {
        text: "Strang, G. (2023). *Introduction to Linear Algebra* (6.ª ed.). Wellesley-Cambridge Press. Secções 1.1 a 1.4, 6.1 a 6.3 e 7.1 a 7.3 (SVD, processamento de imagem e PCA).",
      },
      {
        text: "Strang, G. [MIT 18.06 Linear Algebra](https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/) (MIT OpenCourseWare, 2010): as aulas gravadas clássicas.",
        href: "https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/",
      },
      {
        text: "Goodfellow, I., Bengio, Y. & Courville, A. (2016). [*Deep Learning*](https://www.deeplearningbook.org/). MIT Press. Cap. 2.",
        href: "https://www.deeplearningbook.org/",
      },
      { text: "Coursera: especialização \"Mathematics for Machine Learning\" do Imperial College London, curso 1 (Linear Algebra) e curso 3 (PCA)." },
    ],
    cited: [
      "Pearson, K. (1901). On lines and planes of closest fit to systems of points in space. *The London, Edinburgh, and Dublin Philosophical Magazine and Journal of Science*, 2(11), 559–572.",
      "Hotelling, H. (1933). Analysis of a complex of statistical variables into principal components. *Journal of Educational Psychology*, 24(6), 417–441.",
      "Eckart, C. & Young, G. (1936). The approximation of one matrix by another of lower rank. *Psychometrika*, 1(3), 211–218.",
      "Brin, S. & Page, L. (1998). The anatomy of a large-scale hypertextual Web search engine. *Computer Networks and ISDN Systems*, 30(1–7), 107–117.",
      "Mikolov, T., Chen, K., Corrado, G. & Dean, J. (2013). [Efficient estimation of word representations in vector space](https://arxiv.org/abs/1301.3781). arXiv:1301.3781.",
      "Roediger, H. L. & Karpicke, J. D. (2006). Test-enhanced learning: taking memory tests improves long-term retention. *Psychological Science*, 17(3), 249–255.",
      "Cepeda, N. J., Pashler, H., Vul, E., Wixted, J. T. & Rohrer, D. (2006). Distributed practice in verbal recall tasks: a review and quantitative synthesis. *Psychological Bulletin*, 132(3), 354–380.",
      "Sweller, J. & Cooper, G. A. (1985). The use of worked examples as a substitute for problem solving in learning algebra. *Cognition and Instruction*, 2(1), 59–89.",
      "Dunlosky, J., Rawson, K. A., Marsh, E. J., Nathan, M. J. & Willingham, D. T. (2013). Improving students' learning with effective learning techniques. *Psychological Science in the Public Interest*, 14(1), 4–58.",
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
          { t: "code", title: "Notação", code: "u · v = Σᵢ uᵢvᵢ        ‖v‖₂ = √(Σᵢ vᵢ²)        cos θ = (u · v) / (‖u‖ ‖v‖)" },
          { t: "code", title: "Notação", code: "Av = λv        det(A − λI) = 0        A = UΣVᵀ" },
        ],
      },
      {
        title: "Conceitos",
        blocks: [
          {
            t: "table",
            head: ["Conceito", "Em poucas palavras"],
            rows: [
              ["Vetor", "Lista de números: uma seta ou as características de um exemplo"],
              ["Combinação linear", "Soma de vetores multiplicados por números"],
              ["Produto escalar", "Multiplicar elemento a elemento e somar; dá um número"],
              ["Norma L2 / L1", "Comprimento euclidiano / soma dos valores absolutos"],
              ["Semelhança do cosseno", "Cosseno do ângulo: 1 iguais, 0 perpendiculares, −1 opostos; ignora o tamanho"],
              ["Matriz", "Tabela de dados ou transformação de vetores"],
              ["Produto AB", "(m×n)(n×p) = (m×p); AB ≠ BA em geral"],
              ["Determinante", "Fator de mudança de área; 0 = achata e não tem inversa"],
              ["Vetor e valor próprio", "Direção que a matriz só estica; o fator de esticamento"],
              ["SVD", "Qualquer matriz = rotação · esticamento · rotação; k camadas = melhor aproximação (Eckart & Young, 1936)"],
              ["PCA", "Direções de maior variância; padronizar antes; SVD dos dados padronizados"],
            ],
          },
        ],
      },
      {
        title: "NumPy",
        blocks: [
          {
            t: "code",
            title: "NumPy",
            code: `u @ v                          # produto escalar
A @ B                          # produto de matrizes (não confundir com A * B)
np.linalg.norm(v)              # norma L2
A.T, np.eye(n), np.linalg.det(A)
np.linalg.solve(A, b)          # resolver Ax = b (melhor do que inv(A) @ b)
np.linalg.eigh(S)              # valores e vetores próprios de matriz simétrica
np.linalg.eig(A)               # para qualquer matriz quadrada (pode dar complexos)
U, s, Vt = np.linalg.svd(A, full_matrices=False)
A_k = U[:, :k] @ np.diag(s[:k]) @ Vt[:k, :]   # aproximação com k camadas
Z = (X - X.mean(axis=0)) / X.std(axis=0)       # padronizar para a PCA`,
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
              ["Cosseno entre embeddings", "M20 (RAG)"],
              ["Camada = matriz de pesos", "M12 e M13 (redes neuronais)"],
              ["Ridge (L2) e Lasso (L1)", "M8"],
              ["PCA, t-SNE, UMAP", "M10"],
              ["Matrizes de baixa característica (LoRA)", "M22"],
              ["Sistemas lineares e mínimos quadrados", "Mini-projeto da Fase 1"],
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
              "Usar `*` em vez de `@` para multiplicar matrizes.",
              "Assumir que AB = BA.",
              "Multiplicar matrizes sem verificar as formas.",
              "Calcular o cosseno sem dividir pelas normas: isso é só o produto escalar.",
              "Usar `inv(A) @ b` em vez de `solve(A, b)`.",
              "Fazer PCA sem padronizar variáveis com escalas diferentes.",
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
      note: "Doze exercícios, cerca de 4 horas no total. Os da Parte A fazem-se primeiro à mão, em papel, e só depois se confirmam em NumPy: é a prática de recuperação em ação.",
    },
    {
      id: "B",
      title: "Parte B — NumPy",
      note: "Comece o notebook com `import numpy as np` e `np.set_printoptions(precision=3, suppress=True)`, como na aula.",
    },
    {
      id: "C",
      title: "Parte C — SVD e PCA",
      note: "Os exercícios 10 a 12 usam a fotografia da secção 6 e os pinguins da secção 7.",
    },
  ],
  exercises: [
    {
      id: "e1",
      num: 1,
      part: "A",
      session: "w1s2",
      kind: "text",
      title: "Operações, normas e cosseno à mão",
      minutes: 15,
      sections: ["s2", "s3"],
      prompt: [
        {
          t: "p",
          text: "Com u = (1, 2, −1) e v = (3, 0, 2), calcule u + v, 2u − v, u · v, ‖u‖, ‖v‖ e o cosseno do ângulo entre eles. Os dois vetores são parecidos?",
        },
      ],
      fields: [
        { id: "calc", label: "Cálculos", rows: 7, placeholder: "u + v = …\n2u − v = …\nu · v = …\n‖u‖ = …" },
        { id: "r", label: "São parecidos? Porquê?", rows: 2 },
      ],
      criteria: [
        "u + v = (4, 2, 1) e 2u − v = (−1, 4, −4)",
        "u · v = 3 + 0 − 2 = 1",
        "‖u‖ = √6 ≈ 2,449 e ‖v‖ = √13 ≈ 3,606",
        "cos = 1 / (2,449 × 3,606) ≈ 0,113",
        "Conclusão: o cosseno é próximo de 0, os vetores são quase perpendiculares e pouco parecidos",
      ],
      solution: [
        {
          t: "p",
          text: "u + v = (4, 2, 1); 2u − v = (−1, 4, −4); u · v = 3 + 0 − 2 = 1; ‖u‖ = √6 ≈ 2,449; ‖v‖ = √13 ≈ 3,606; cos = 1 / (2,449 × 3,606) ≈ 0,113. O cosseno é próximo de 0: os vetores são quase perpendiculares, pouco parecidos.",
        },
      ],
    },
    {
      id: "e2",
      num: 2,
      part: "A",
      session: "w1s2",
      kind: "classify",
      title: "Perpendiculares ou não?",
      minutes: 5,
      sections: ["s3"],
      prompt: [{ t: "p", text: "Sem calcular ângulos, diga se cada par é perpendicular." }],
      categories: ["Perpendiculares", "Não perpendiculares"],
      justify: "Cálculo",
      items: [
        { id: "a", text: "(a) (2, −1) e (1, 2)", answer: 0, explain: "2×1 + (−1)×2 = 0: o produto escalar é 0." },
        { id: "b", text: "(b) (3, 1) e (1, 3)", answer: 1, explain: "3×1 + 1×3 = 6 ≠ 0." },
      ],
      solution: [
        {
          t: "p",
          text: "(a) 2×1 + (−1)×2 = 0: **perpendiculares**. (b) 3×1 + 1×3 = 6 ≠ 0: **não são**. Dois vetores são perpendiculares quando o produto escalar é 0, e o produto escalar faz-se sem ângulos.",
        },
      ],
    },
    {
      id: "e3",
      num: 3,
      part: "A",
      session: "w1s2",
      kind: "classify",
      title: "Que produtos existem?",
      minutes: 10,
      sections: ["s4"],
      prompt: [
        {
          t: "p",
          text: "A tem forma (3, 2), B (2, 4) e C (4, 3). Quais destes produtos existem, e com que forma: AB, BA, BC, CA, ABC?",
        },
      ],
      categories: ["Não existe", "(3, 4)", "(2, 3)", "(4, 2)", "(3, 3)", "(2, 4)", "(4, 3)"],
      items: [
        { id: "ab", text: "AB", answer: 1, explain: "(3, 2)(2, 4): as de dentro são iguais, fica (3, 4)." },
        { id: "ba", text: "BA", answer: 0, explain: "(2, 4)(3, 2): 4 colunas de B ≠ 3 linhas de A." },
        { id: "bc", text: "BC", answer: 2, explain: "(2, 4)(4, 3) = (2, 3)." },
        { id: "ca", text: "CA", answer: 3, explain: "(4, 3)(3, 2) = (4, 2)." },
        { id: "abc", text: "ABC", answer: 4, explain: "AB é (3, 4) e (3, 4)(4, 3) = (3, 3)." },
      ],
      solution: [
        {
          t: "p",
          text: "AB: (3, 4). BA: não existe (4 colunas de B ≠ 3 linhas de A). BC: (2, 3). CA: (4, 2). ABC: (3, 3). A regra: as dimensões de dentro têm de ser iguais e o resultado fica com as de fora.",
        },
      ],
    },
    {
      id: "e4",
      num: 4,
      part: "A",
      session: "w2s1",
      kind: "text",
      title: "AB e BA à mão",
      minutes: 10,
      sections: ["s4"],
      prompt: [{ t: "p", text: "Calcule à mão AB e BA, com A = [[1, 0], [2, 1]] e B = [[3, 1], [0, 2]]. São iguais?" }],
      fields: [
        { id: "ab", label: "AB", rows: 3, mono: true },
        { id: "ba", label: "BA", rows: 3, mono: true },
        { id: "r", label: "São iguais?", rows: 1 },
      ],
      criteria: ["AB = [[3, 1], [6, 4]]", "BA = [[5, 1], [4, 2]]", "Conclui que não são iguais"],
      solution: [{ t: "p", text: "AB = [[3, 1], [6, 4]] e BA = [[5, 1], [4, 2]]. Não são iguais." }],
    },
    {
      id: "e5",
      num: 5,
      part: "A",
      session: "w2s1",
      kind: "text",
      title: "Valores próprios à mão",
      minutes: 20,
      sections: ["s5"],
      prompt: [
        {
          t: "p",
          text: "Encontre os valores próprios de M = [[4, 1], [2, 3]] resolvendo det(M − λI) = 0. Depois verifique que (1, 1) e (1, −2) são vetores próprios, calculando M·v.",
        },
      ],
      fields: [
        { id: "det", label: "det(M − λI) = 0 e os valores próprios", rows: 4 },
        { id: "ver", label: "Verificação com M·v", rows: 3 },
      ],
      criteria: [
        "det(M − λI) = (4 − λ)(3 − λ) − 2 = λ² − 7λ + 10 = 0",
        "Valores próprios: λ = 2 ou λ = 5",
        "M·(1, 1) = (5, 5) = 5·(1, 1)",
        "M·(1, −2) = (2, −4) = 2·(1, −2)",
      ],
      solution: [
        {
          t: "code",
          title: "Notação",
          code: `det [4−λ   1 ] = (4−λ)(3−λ) − 2 = λ² − 7λ + 10 = 0   ⇒   λ = 2 ou λ = 5
    [ 2   3−λ]`,
        },
        {
          t: "p",
          text: "M·(1, 1) = (5, 5) = 5·(1, 1) e M·(1, −2) = (2, −4) = 2·(1, −2). Com `np.linalg.eig(M)` saem os valores `[5.+0.j 2.+0.j]` e os mesmos vetores normalizados: (0,707, 0,707) e (−0,447, 0,894), que é (1, −2) dividido pelo comprimento e com o sinal trocado.",
        },
      ],
    },
    {
      id: "e6",
      num: 6,
      part: "B",
      session: "w2s1",
      kind: "text",
      title: "`A @ I` contra `A * I`",
      minutes: 10,
      sections: ["s4"],
      prompt: [
        {
          t: "p",
          text: "Com A = [[1, 2], [3, 4]] e I = `np.eye(2)`, calcule `A @ I` e `A * I`. Explique a diferença dos resultados.",
        },
      ],
      fields: [
        { id: "code", label: "Código e resultados", rows: 6, mono: true, placeholder: "A = np.array([[1, 2], [3, 4]])\nI = np.eye(2)\nprint(A @ I)\nprint(A * I)" },
        { id: "r", label: "A diferença", rows: 3 },
      ],
      criteria: [
        "`A @ I` dá [[1, 2], [3, 4]]: a identidade não muda nada",
        "`A * I` dá [[1, 0], [0, 4]]: multiplica elemento a elemento e apaga tudo fora da diagonal",
      ],
      solution: [
        {
          t: "p",
          text: "`A @ I` dá [[1, 2], [3, 4]]: a identidade não muda nada. `A * I` dá [[1, 0], [0, 4]]: multiplica elemento a elemento e apaga tudo fora da diagonal.",
        },
      ],
    },
    {
      id: "e7",
      num: 7,
      part: "B",
      session: "w2s2",
      kind: "text",
      title: "Preços a partir de três compras",
      minutes: 20,
      sections: ["s4"],
      prompt: [
        {
          t: "p",
          text: "Uma cliente comprou 1 saco, 2 luvas e 1 boné por 241 €; outra, 3 luvas e 2 bonés por 102,50 €; uma terceira, 2 sacos e 1 boné por 382 €. Escreva o sistema em forma matricial e descubra o preço de cada produto com `np.linalg.solve`.",
        },
      ],
      fields: [
        { id: "code", label: "Sistema em forma matricial, código e resultado", rows: 8, mono: true, placeholder: "K = np.array([[…], [...], [...]])   # saco, luva, boné\nb = np.array([…])\nprint(np.linalg.solve(K, b))" },
      ],
      criteria: [
        "Matriz K = [[1, 2, 1], [0, 3, 2], [2, 0, 1]] (colunas: saco, luva, boné) e b = (241, 102,5, 382)",
        "Resolve com `np.linalg.solve(K, b)`, não com a inversa",
        "Saco 180 €, luva 19,50 €, boné 22 €",
      ],
      solution: [{ t: "code", code: EX7_SOL }],
    },
    {
      id: "e8",
      num: 8,
      part: "B",
      session: "w2s2",
      kind: "text",
      title: "A matriz de rotação",
      minutes: 25,
      sections: ["s4"],
      prompt: [
        {
          t: "p",
          text: "A matriz de rotação de um ângulo θ é [[cos θ, −sin θ], [sin θ, cos θ]]. (a) Rode (1, 0) 30° e confirme que o comprimento não muda. (b) Quanto vale o determinante? Porquê? (c) Aplique a rotação três vezes seguidas: onde vai parar (1, 0)?",
        },
      ],
      fields: [
        { id: "code", label: "(a) e (c) Código e resultados", rows: 8, mono: true, placeholder: "t = np.radians(30)\nR = np.array([[np.cos(t), -np.sin(t)],\n              [np.sin(t),  np.cos(t)]])\n…" },
        { id: "b", label: "(b) O determinante e porquê", rows: 3 },
      ],
      criteria: [
        "(a) R @ (1, 0) = [0.866 0.5], com norma 1.0: o comprimento não muda",
        "(b) det(R) = 1 (com arredondamento, 0.9999999999999999 ou 1.0): uma rotação não muda áreas",
        "(c) Três rotações de 30° são 90°: (1, 0) vai parar a (0, 1)",
      ],
      solution: [
        { t: "code", code: EX8_SOL },
        { t: "p", text: "(b) O determinante é 1 porque uma rotação não muda áreas." },
      ],
    },
    {
      id: "e9",
      num: 9,
      part: "B",
      session: "w3s1",
      kind: "text",
      title: "Pesquisa nas perguntas frequentes",
      minutes: 35,
      sections: ["s3"],
      prompt: [
        {
          t: "p",
          text: "Escreva a função `mais_parecidos(pergunta, docs, k=2)`, que devolve os k documentos mais parecidos com a pergunta e a semelhança de cada um, usando o `CountVectorizer` e o cosseno da secção 3. Teste com estas perguntas frequentes e as perguntas \"quanto tempo demora a entrega\" e \"aceitam pagamento por mbway\":",
        },
        { t: "code", code: FAQ },
      ],
      fields: [
        { id: "code", label: "Função e testes", rows: 14, mono: true, placeholder: "def mais_parecidos(pergunta, docs, k=2):\n    vec = CountVectorizer()\n    …" },
        { id: "r", label: "Resultados e comentário", rows: 4 },
      ],
      criteria: [
        "`CountVectorizer` ajustado aos documentos (`fit_transform`) e a pergunta transformada com o mesmo vocabulário (`transform`)",
        "Ordena pelo cosseno (por exemplo com `np.argsort(-sims)`) e devolve os k primeiros com a semelhança",
        "\"quanto tempo demora a entrega\": 0,76 para a primeira pergunta frequente e 0,18 para a da entrega gratuita",
        "\"aceitam pagamento por mbway\": 0,38 para os métodos de pagamento (só \"pagamento\" coincide: \"aceitam\" e \"aceites\" não contam como iguais)",
        "Evita dividir por zero quando a pergunta não tem nenhuma palavra conhecida",
      ],
      solution: [
        { t: "code", code: EX9_SOL },
        {
          t: "p",
          text: "O `if` evita dividir por zero quando a pergunta não tem nenhuma palavra conhecida. Repare que \"aceitam\" e \"aceites\" não contam como iguais: só \"pagamento\" coincide.",
        },
      ],
    },
    {
      id: "e10",
      num: 10,
      part: "C",
      session: "w3s1",
      kind: "text",
      title: "Quantas camadas para 5% de erro?",
      minutes: 30,
      sections: ["s6"],
      prompt: [
        {
          t: "p",
          text: "Com a fotografia da secção 6, calcule o erro relativo para k de 1 a 200 e faça o gráfico do erro em função de k. Qual é o menor k com erro abaixo de 5%? Que percentagem dos números originais é preciso guardar?",
        },
      ],
      fields: [
        { id: "code", label: "Código", rows: 12, mono: true, placeholder: "erros = []\nfor k in range(1, 201):\n    …" },
        { id: "r", label: "Menor k, percentagem guardada e o que mostra o gráfico", rows: 4 },
      ],
      criteria: [
        "Calcula o erro relativo para k de 1 a 200 e faz o gráfico do erro em função de k",
        "Menor k com erro abaixo de 5%: 123 (erro 0,0497)",
        "123 × (600 + 512 + 1) / (600 × 512) = 0,446: é preciso guardar 44,6% dos números",
        "Explica a forma da curva: as primeiras camadas captam a forma geral; o pormenor fino está espalhado por muitas camadas pequenas",
      ],
      solution: [
        { t: "code", code: EX10_SOL },
        {
          t: "p",
          text: "Para 5% de erro são precisas 123 camadas, 44,6% dos números. As primeiras camadas captam a forma geral; o pormenor fino (texturas, contornos) está espalhado por muitas camadas pequenas. Atalho: o erro também se calcula só com os valores singulares, `np.sqrt(np.sum(s[k:]**2) / np.sum(s**2))`.",
        },
      ],
    },
    {
      id: "e11",
      num: 11,
      part: "C",
      session: "w3s1",
      kind: "text",
      title: "A PCA sem padronizar",
      minutes: 25,
      sections: ["s7"],
      prompt: [
        {
          t: "p",
          text: "Repita a PCA dos pinguins **sem padronizar** (só subtraindo a média). Que fração da variância fica na primeira componente, e que variável a domina? Explique com os desvios padrão das quatro colunas.",
        },
      ],
      fields: [
        { id: "code", label: "Código e resultados", rows: 8, mono: true, placeholder: "Xc = X - X.mean(axis=0)\nU, s, Vt = np.linalg.svd(Xc, full_matrices=False)\n…" },
        { id: "r", label: "Fração, variável dominante e explicação", rows: 4 },
      ],
      criteria: [
        "Subtrai só a média, sem dividir pelo desvio padrão",
        "A primeira componente fica com praticamente 100% da variância",
        "É quase só a massa: `Vt[0]` ≈ (0,004, −0,001, 0,015, 1,000)",
        "Desvios padrão 5,5 mm, 2,0 mm, 14,0 mm e 800,8 g: a massa, em gramas, varia centenas de vezes mais do que as outras",
      ],
      solution: [
        {
          t: "p",
          text: "Sem padronizar, a primeira componente fica com praticamente 100% da variância e é quase só a massa: `Vt[0]` ≈ (0,004, −0,001, 0,015, 1,000). Os desvios padrão são 5,5 mm, 2,0 mm, 14,0 mm e 800,8 g: medida em gramas, a massa varia centenas de vezes mais do que as outras e a PCA \"vê\" só essa variável.",
        },
      ],
    },
    {
      id: "e12",
      num: 12,
      part: "C",
      session: "w3s2",
      kind: "text",
      title: "A PCA à mão contra o scikit-learn",
      minutes: 20,
      sections: ["s7"],
      prompt: [
        {
          t: "p",
          text: "Compare a sua PCA padronizada com a do scikit-learn (`from sklearn.decomposition import PCA`; `PCA(n_components=2).fit(Z)`). As frações de variância e as componentes coincidem? Se algum sinal aparecer trocado, explique porque não é um erro.",
        },
      ],
      fields: [
        { id: "code", label: "Código e resultados", rows: 7, mono: true, placeholder: "from sklearn.decomposition import PCA\np = PCA(n_components=2).fit(Z)\n…" },
        { id: "r", label: "Coincidem? E os sinais?", rows: 3 },
      ],
      criteria: [
        "As frações de variância coincidem: [0.688 0.193]",
        "A primeira componente coincide: [0.455 −0.4 0.576 0.548]",
        "A segunda tem os sinais todos trocados face à SVD manual",
        "Explica que não é erro: uma direção e a direção oposta são a mesma reta, e cada implementação escolhe o sinal à sua maneira",
      ],
      solution: [
        { t: "code", code: EX12_SOL },
        {
          t: "p",
          text: "As frações e a primeira componente coincidem. A segunda tem os sinais todos trocados face à SVD manual (−0,597, −0,798, …). Não é erro: uma direção e a direção oposta são a mesma reta, e cada implementação escolhe o sinal à sua maneira.",
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
        note: "Sem consulta e sem correr código. Uma só resposta certa por pergunta. 1 valor cada; respostas erradas não descontam.",
        questions: [
          {
            kind: "mcq", id: "p1", num: 1, section: "s3", points: 1,
            q: "Quanto vale o produto escalar de (1, 2) e (3, 4)?",
            options: ["(3, 8)", "10", "11", "24"],
            answer: 2,
            explain: "1×3 + 2×4 = 11. (3, 8) é o produto elemento a elemento, antes de somar.",
          },
          {
            kind: "mcq", id: "p2", num: 2, section: "s3", points: 1,
            q: "Qual é a norma euclidiana de (6, 8)?",
            options: ["14", "10", "100", "48"],
            answer: 1,
            explain: "√(36 + 64) = √100 = 10. 14 é a norma L1 e 100 o quadrado da norma.",
          },
          {
            kind: "mcq", id: "p3", num: 3, section: "s3", points: 1,
            q: "A semelhança do cosseno entre dois vetores é 0. Isso significa que:",
            options: ["São iguais.", "Um deles é o vetor nulo.", "São perpendiculares.", "Apontam em sentidos opostos."],
            answer: 2,
            explain: "Cosseno 0 corresponde a 90°: nada em comum. Sentidos opostos dão −1; com o vetor nulo o cosseno nem está definido.",
          },
          {
            kind: "mcq", id: "p4", num: 4, section: "s4", points: 1,
            q: "Qual é a forma do resultado de uma matriz (3, 2) `@` uma matriz (2, 5)?",
            options: ["(2, 2)", "(3, 5)", "(5, 3)", "Não é possível multiplicar."],
            answer: 1,
            explain: "As dimensões de dentro (2 e 2) coincidem e o resultado fica com as de fora: (3, 5).",
          },
          {
            kind: "mcq", id: "p5", num: 5, section: "s4", points: 1,
            q: "Para duas matrizes quadradas A e B:",
            options: ["AB = BA sempre.", "AB = BA nunca.", "Em geral AB ≠ BA.", "AB = BA se tiverem o mesmo tamanho."],
            answer: 2,
            explain: "A ordem conta. Há casos em que AB = BA (por exemplo, com a identidade), mas não em geral.",
          },
          {
            kind: "mcq", id: "p6", num: 6, section: "s5", points: 1,
            q: "Se Av = 3v, então:",
            options: ["v é um vetor próprio de A, com valor próprio 3.", "A é três vezes a matriz identidade.", "O determinante de A é 3.", "v tem norma 3."],
            answer: 0,
            explain: "É a definição Av = λv: A só estica v, 3 vezes, sem lhe mudar a direção.",
          },
          {
            kind: "mcq", id: "p7", num: 7, section: "s5", points: 1,
            q: "Para calcular os valores próprios de uma matriz de covariância, que é simétrica, a função mais adequada é:",
            options: ["`np.linalg.det`", "`np.linalg.solve`", "`np.linalg.inv`", "`np.linalg.eigh`"],
            answer: 3,
            explain: "`eigh` é para matrizes simétricas: mais rápida, devolve números reais e ordena os valores do menor para o maior.",
          },
          {
            kind: "mcq", id: "p8", num: 8, section: "s6", points: 1,
            q: "O teorema de Eckart & Young (1936) garante que guardar os k maiores valores singulares de uma SVD:",
            options: ["Reconstrói a matriz sem erro.", "Dá a melhor aproximação possível com k camadas.", "Só funciona para imagens.", "Dá os vetores próprios da matriz."],
            answer: 1,
            explain: "Nenhuma outra matriz com k camadas fica mais perto da original. Só é exata se a matriz tiver no máximo k camadas.",
          },
        ],
      },
      {
        title: "Grupo II — Resposta curta (8 valores)",
        note: "Sem consulta e sem correr código. 2 valores cada, 3 a 5 linhas por resposta.",
        questions: [
          {
            kind: "open", id: "p9", num: 9, section: "s4", points: 2, rows: 5,
            q: "Qual é a diferença entre `A @ B` e `A * B` em NumPy? Dê um exemplo com matrizes 2 × 2.",
            criteria: [
              { id: "c1", text: "Diferença", points: 1 },
              { id: "c2", text: "Exemplo certo", points: 1 },
            ],
            model:
              "`@` é o produto de matrizes: cada elemento é o produto escalar de uma linha por uma coluna. `*` multiplica elemento a elemento. Com A = [[1, 2], [3, 4]] e I: `A @ I` = A; `A * I` = [[1, 0], [0, 4]].",
          },
          {
            kind: "open", id: "p10", num: 10, section: "s3", points: 2, rows: 5,
            q: "Porque se usa a semelhança do cosseno, e não a distância euclidiana, para comparar textos representados por contagens de palavras ou por embeddings?",
            criteria: [
              { id: "c1", text: "Ideia de direção vs. tamanho", points: 1 },
              { id: "c2", text: "Exemplo ou consequência", points: 1 },
            ],
            model:
              "O cosseno compara a direção e ignora o tamanho. Um texto longo e um curto sobre o mesmo assunto têm vetores com direções parecidas mas normas muito diferentes: a distância euclidiana diria que são diferentes, o cosseno que são parecidos.",
          },
          {
            kind: "open", id: "p11", num: 11, section: "s7", points: 2, rows: 5,
            q: "Porque se deve padronizar as variáveis antes de uma PCA? Use o exemplo dos pinguins, em que a massa tem desvio padrão de 801 g e a profundidade do bico de 2 mm.",
            criteria: [
              { id: "c1", text: "Explicação", points: 1 },
              { id: "c2", text: "Uso do exemplo", points: 1 },
            ],
            model:
              "A PCA procura as direções de maior variância, e a variância depende das unidades. Com desvio de 801 g contra 2 mm, a massa domina a primeira componente só por estar em gramas. Padronizar põe todas as variáveis na mesma escala.",
          },
          {
            kind: "open", id: "p12", num: 12, section: "s4", points: 2, rows: 5,
            q: "O que mede o determinante de uma matriz 2 × 2? O que significa um determinante igual a 0 para o sistema Ax = b?",
            criteria: [
              { id: "c1", text: "Significado", points: 1 },
              { id: "c2", text: "Consequência para o sistema", points: 1 },
            ],
            model:
              "O fator pelo qual a transformação multiplica as áreas (com sinal, se inverte a orientação). Determinante 0: a matriz achata o plano numa reta, não tem inversa, e o sistema não tem solução ou tem infinitas.",
          },
        ],
      },
      {
        title: "Grupo III — Programação (4 valores)",
        note: "Pode usar o Colab, mas não a internet nem assistentes de IA.",
        questions: [
          {
            kind: "open", id: "p13", num: 13, section: "s6", points: 4, rows: 16,
            q: "Quatro clientes avaliaram quatro produtos de 0 a 5:",
            context: [
              { t: "code", code: AVALIACOES },
              {
                t: "p",
                text: "(a) Calcule a matriz 4 × 4 das semelhanças do cosseno entre clientes, sem ciclos: normalize as linhas e use `@`. (b) Qual é o cliente mais parecido com o cliente 0? (c) Calcule a SVD e a fração da \"energia\" (soma dos σ²) guardada pelos 2 primeiros valores singulares. (d) Reconstrua a matriz só com 2 camadas, calcule o erro relativo e interprete a matriz obtida numa frase.",
              },
            ],
            criteria: [
              { id: "c1", text: "Matriz de semelhanças certa e sem ciclos", points: 1 },
              { id: "c2", text: "Cliente mais parecido identificado (excluindo o próprio)", points: 0.5 },
              { id: "c3", text: "SVD e fração de energia certas", points: 1 },
              { id: "c4", text: "Reconstrução, erro e interpretação dos dois grupos", points: 1.5 },
            ],
            model:
              "Há dois \"gostos\": os clientes 0 e 1 preferem os produtos 0 e 1, os clientes 2 e 3 os produtos 2 e 3. A aproximação com 2 camadas guarda 97,6% da energia e mostra só esse padrão, sem as pequenas diferenças individuais. É a ideia dos sistemas de recomendação baseados em fatorização de matrizes.",
            modelBlocks: [{ t: "code", code: P13_SOL }],
          },
        ],
      },
    ],
  },
  examReviewNote:
    "Se a nota ficar abaixo de 14: rever as secções das perguntas falhadas (1, 2, 3, 10, 13a e 13b → secção 3, produto escalar, normas e cosseno; 4, 5, 9 e 12 → secção 4, matrizes e transformações; 6 e 7 → secção 5, valores e vetores próprios; 8, 13c e 13d → secção 6, SVD; 11 → secção 7, PCA) e repetir a prova uma semana depois.",

  // ---------------------------------------------------------------- SIMULADO DE TREINO (banco extra da plataforma)
  practice: {
    mcq: [
      { id: "q1", section: "s1", q: "Que forma tem a foto a cores de 600 × 512 píxeis da aula?", options: ["`(600, 512)`", "`(600, 512, 3)`", "`(3, 600)`", "`(1536,)`"], answer: 1, explain: "Um tensor: três matrizes de 600 × 512, uma por cor. A preto e branco seria só (600, 512)." },
      { id: "q2", section: "s1", q: "Segundo a aula, como vê um modelo uma camada de uma rede neuronal?", options: ["Como um vetor de embedding", "Como uma decomposição SVD", "Como uma tabela de clientes", "Como uma matriz de pesos que transforma vetores"], answer: 3, explain: "Cada camada é uma multiplicação de matrizes seguida de uma função simples (M12)." },
      { id: "q3", section: "s2", q: "Com `v = np.array([2, 1])` e `w = np.array([1, 3])`, o que imprime `v + 2 * w`?", options: ["`[3 4]`", "`[6 8]`", "`[4 7]`", "`[ 0 -5]`"], answer: 2, explain: "2 * w = [2 6] e v + [2 6] = [4 7]: tudo elemento a elemento." },
      { id: "q4", section: "s2", q: "Quatro clientes compram o cesto 1 = (2, 1, 0) e dois o cesto 2 = (0, 1, 3). O total `4 * cesto1 + 2 * cesto2` é…", options: ["uma combinação linear dos dois cestos", "um produto escalar", "uma transformação linear", "um valor próprio"], answer: 0, explain: "Somar vetores multiplicados por números (4 e 2) é uma combinação linear: dá [8 6 6]." },
      { id: "q5", section: "s2", q: "Dois vetores do plano estão na mesma reta. O que se pode dizer deles?", options: ["Geram o plano inteiro", "São perpendiculares", "Têm cosseno 0", "São linearmente dependentes: um não acrescenta nenhuma direção nova"], answer: 3, explain: "Todas as suas combinações lineares ficam nessa reta. A PCA procura precisamente as poucas direções que contam." },
      { id: "q6", section: "s3", q: "Quanto vale `np.array([1, 2, 3]) @ np.array([4, -5, 6])`?", options: ["`12`", "`32`", "`[  4 -10  18]`", "`0`"], answer: 0, explain: "4 − 10 + 18 = 12. `[  4 -10  18]` seria o `*`, elemento a elemento, sem somar." },
      { id: "q7", section: "s3", q: "Quanto vale a norma L1 de (3, −4)?", options: ["5", "−1", "7", "25"], answer: 2, explain: "|3| + |−4| = 7. A norma L2 seria 5." },
      { id: "q8", section: "s3", q: "Qual é a distância euclidiana entre (1, 1) e (4, 5)?", options: ["7", "5", "25", "√7"], answer: 1, explain: "É a norma de (1, 1) − (4, 5) = (−3, −4): √(9 + 16) = 5." },
      { id: "q9", section: "s3", q: "Na pesquisa em miniatura da aula, porque é que \"prazo de entrega da encomenda\" tem cosseno 0 com a pergunta?", options: ["Porque é o documento mais curto", "Porque o CountVectorizer o ignora", "Porque não partilha nenhuma palavra com a pergunta", "Por um erro de arredondamento"], answer: 2, explain: "O produto escalar só soma as palavras que aparecem nos dois textos; sem nenhuma em comum, dá 0." },
      { id: "q10", section: "s3", q: "Porque é que, para o CountVectorizer, \"devolução\" e \"devolver\" nada têm em comum?", options: ["Porque uma tem acento", "Porque conta palavras pela forma escrita, sem saber o significado", "Porque estão em documentos diferentes", "Porque o cosseno ignora verbos"], answer: 1, explain: "Os embeddings de um modelo de linguagem aprendem o significado; o cálculo do cosseno é o mesmo, só mudam os vetores." },
      { id: "q11", section: "s4", q: "O que imprime `np.array([[1, 2], [3, 4]]) @ np.array([1, 1])`?", options: ["`[3 7]`", "`[4 6]`", "`[[1 2] [3 4]]`", "`10`"], answer: 0, explain: "Cada linha faz um produto escalar com o vetor: 1 + 2 = 3 e 3 + 4 = 7. `[4 6]` seria somar as colunas." },
      { id: "q12", section: "s4", q: "X tem forma (200, 3) e W forma (3, 1). Qual destes produtos dá erro?", options: ["`X @ W`", "`W.T @ X.T`", "`X.T @ X`", "`W @ X`"], answer: 3, explain: "(3, 1) por (200, 3): as dimensões de dentro (1 e 200) não coincidem. Os outros dão (200, 1), (1, 200) e (3, 3)." },
      { id: "q13", section: "s4", q: "A matriz `R = [[0, -1], [1, 0]]` roda 90°. Para onde vai (0, 1)?", options: ["(1, 0)", "(0, −1)", "(0, 1)", "(−1, 0)"], answer: 3, explain: "É a segunda coluna de R: (−1, 0). As colunas dizem para onde vão (1, 0) e (0, 1)." },
      { id: "q14", section: "s4", q: "Para resolver Mx = b, a aula recomenda:", options: ["`np.linalg.inv(M) @ b`", "`np.linalg.solve(M, b)`", "`M * b`", "`b / M`"], answer: 1, explain: "Dá o mesmo resultado que a inversa, mas é mais rápido e mais preciso (Goodfellow, Bengio & Courville, 2016)." },
      { id: "q15", section: "s4", q: "Uma matriz 2 × 2 tem determinante −2. O que faz ao plano?", options: ["Achata-o numa reta", "Multiplica as áreas por 2 e espelha-o", "Divide as áreas por 2", "Roda-o 90°"], answer: 1, explain: "O valor absoluto é o fator das áreas; o sinal negativo diz que a orientação se inverte, como num espelho." },
      { id: "q16", section: "s5", q: "Com `C = [[2, 1], [1, 2]]`, que valores imprime `np.linalg.eigh(C)[0]`?", options: ["`[1. 3.]`", "`[3. 1.]`", "`[2. 2.]`", "`[0. 4.]`"], answer: 0, explain: "O `eigh` ordena os valores do menor para o maior: 1 e 3." },
      { id: "q17", section: "s5", q: "Porque aparece 0,707 nos vetores próprios de C?", options: ["Porque é um valor próprio", "Por erro de arredondamento", "Porque o NumPy devolve vetores de comprimento 1: 1/√2 ≈ 0,707", "Porque C é simétrica"], answer: 2, explain: "(1, 1) dividido pelo seu comprimento √2 dá (0,707, 0,707)." },
      { id: "q18", section: "s5", q: "Quais são os valores próprios de D = [[3, 0], [0, 5]]?", options: ["0 e 8", "15", "Não tem", "3 e 5"], answer: 3, explain: "Numa matriz diagonal, (1, 0) é esticado 3 vezes e (0, 1) 5 vezes: os valores próprios são os da diagonal." },
      { id: "q19", section: "s5", q: "O que pode aparecer na saída do `np.linalg.eig` e não aparece na do `eigh`?", options: ["Números complexos, com `+0.j`", "Vetores de comprimento 1", "O determinante", "Valores negativos"], answer: 0, explain: "O `eig` serve para qualquer matriz quadrada e pode devolver complexos mesmo quando a parte imaginária é zero." },
      { id: "q20", section: "s6", q: "Com `img` de forma (600, 512), que forma tem `s` em `U, s, Vt = np.linalg.svd(img, full_matrices=False)`?", options: ["`(600,)`", "`(512,)`", "`(600, 512)`", "`(512, 512)`"], answer: 1, explain: "Há min(600, 512) = 512 valores singulares; `U` é (600, 512) e `Vt` (512, 512)." },
      { id: "q21", section: "s6", q: "Porque é que a compressão com a SVD funciona em fotografias reais?", options: ["Porque os valores singulares são todos iguais", "Porque o determinante da imagem é 0", "Porque a imagem é quadrada", "Porque há poucas direções importantes e muitas quase irrelevantes"], answer: 3, explain: "Na fotografia, σ₁ = 198,9 é quatro vezes maior do que σ₂: as primeiras camadas carregam quase toda a informação." },
      { id: "q22", section: "s7", q: "Qual é o primeiro passo da receita da PCA da aula?", options: ["Calcular a SVD", "Padronizar cada coluna", "Projetar os dados", "Escolher o número de componentes"], answer: 1, explain: "Subtrair a média e dividir pelo desvio padrão, para que variáveis em gramas não dominem as que estão em milímetros." },
      { id: "q23", section: "s7", q: "Como se calcula a fração da variância explicada pela componente i?", options: ["σᵢ / Σσⱼ", "1 / σᵢ", "σᵢ² / Σσⱼ²", "σᵢ²"], answer: 2, explain: "Na aula: `var_explicada = s**2 / np.sum(s**2)`." },
      { id: "q24", section: "s7", q: "Para visualizar estrutura curva, que a PCA não apanha, a aula aponta:", options: ["Mais componentes da PCA", "t-SNE ou UMAP (M10)", "A SVD sem padronizar", "O determinante"], answer: 1, explain: "A PCA só encontra estrutura linear." },
    ],
    tf: [
      { id: "v1", section: "s1", q: "Para um LLM, uma frase é um vetor de embedding com centenas ou milhares de números.", answer: true, explain: "Por exemplo, um vetor (1536,)." },
      { id: "v2", section: "s2", q: "Multiplicar um vetor por um número negativo inverte-lhe o sentido.", answer: true, explain: "E o valor absoluto do número estica ou encolhe a seta." },
      { id: "v3", section: "s3", q: "A semelhança do cosseno depende do tamanho dos vetores.", answer: false, explain: "Divide pelas normas: só conta a direção. (1, 1) e (2, 2) têm cosseno 1." },
      { id: "v4", section: "s3", q: "O produto escalar de dois vetores é outro vetor.", answer: false, explain: "É um número: multiplica-se elemento a elemento e soma-se tudo." },
      { id: "v5", section: "s4", q: "Em NumPy, `A * B` é o produto de matrizes.", answer: false, explain: "`*` multiplica elemento a elemento; o produto de matrizes é `@`." },
      { id: "v6", section: "s4", q: "Uma transformação linear mantém as retas retas e a origem fixa.", answer: true, explain: "Pode rodar, esticar ou inclinar, mas não dobrar nem deslocar a origem." },
      { id: "v7", section: "s4", q: "Uma matriz com determinante 0 tem inversa.", answer: false, explain: "Achata o plano numa reta e perde informação: não há forma de desfazer a transformação." },
      { id: "v8", section: "s4", q: "`A @ x` é uma combinação linear das colunas de A, com os elementos de x como pesos.", answer: true, explain: "É a segunda leitura do produto (Strang, 2023, secção 1.3)." },
      { id: "v9", section: "s5", q: "Se v é um vetor próprio de A, −v também é.", answer: true, explain: "Por isso o sinal dos vetores próprios pode sair trocado noutro computador." },
      { id: "v10", section: "s5", q: "Os vetores próprios existem para qualquer matriz, quadrada ou não.", answer: false, explain: "Só para matrizes quadradas; a SVD generaliza a ideia a qualquer matriz." },
      { id: "v11", section: "s6", q: "Na SVD, os valores singulares vêm ordenados do maior para o menor.", answer: true, explain: "σ₁ ≥ σ₂ ≥ … ≥ 0: as primeiras camadas são as que pesam mais." },
      { id: "v12", section: "s7", q: "Sem padronizar, a primeira componente da PCA dos pinguins seria dominada pela profundidade do bico.", answer: false, explain: "Seria dominada pela massa, que está em gramas e tem valores na casa dos milhares." },
      { id: "v13", section: "s7", q: "Se o gráfico da PCA aparecer espelhado noutro computador, há um erro no código.", answer: false, explain: "O sinal das componentes é arbitrário: uma direção e a oposta são a mesma reta." },
    ],
  },

  // ---------------------------------------------------------------- CARTÕES
  flashcards: [
    { id: "f1", section: "s1", tag: "Porquê", front: "Como vê um modelo um cliente, uma tabela de clientes e uma foto a cores?", back: "Um vetor de características (3,); uma matriz, uma linha por cliente (200, 3); um tensor de três matrizes, uma por cor (600, 512, 3)." },
    { id: "f2", section: "s1", tag: "Porquê", front: "As três ideias do M4 que voltam no curso", back: "Semelhança entre vetores (RAG, M20); matrizes como transformações (redes neuronais, M12); decomposições (PCA no M10, LoRA no M22)." },
    { id: "f3", section: "s2", tag: "Vetores", front: "Vetor: as duas leituras", back: "Uma seta que parte da origem (visão geométrica, 2 e 3 dimensões) ou uma lista de características (visão de dados, qualquer número de dimensões)." },
    { id: "f4", section: "s2", tag: "Vetores", front: "Combinação linear", back: "Soma de vetores multiplicados por números: c₁v₁ + c₂v₂ + … Exemplo: `4 * cesto1 + 2 * cesto2` → [8 6 6]." },
    { id: "f5", section: "s2", tag: "Vetores", front: "Espaço gerado (span) e dependência linear", back: "O espaço gerado é o conjunto de todas as combinações lineares. Dois vetores na mesma reta são linearmente dependentes: um não acrescenta nenhuma direção nova." },
    { id: "f6", section: "s3", tag: "Produto escalar", front: "Produto escalar", back: "u · v = u₁v₁ + u₂v₂ + … + uₙvₙ: multiplicar elemento a elemento e somar; dá um número. Em NumPy: `u @ v`." },
    { id: "f7", section: "s3", tag: "Produto escalar", front: "Norma L2 e norma L1", back: "L2: √(Σ vᵢ²), o comprimento euclidiano (`np.linalg.norm`). L1: Σ |vᵢ|. A distância entre u e v é a norma de u − v." },
    { id: "f8", section: "s3", tag: "Produto escalar", front: "Semelhança do cosseno", back: "cos θ = (u · v) / (‖u‖ ‖v‖), entre −1 e 1: 1 mesma direção, 0 perpendiculares, −1 opostos. Ignora o tamanho." },
    { id: "f9", section: "s3", tag: "Produto escalar", front: "Porque dá `0.9999999999999998` o cosseno de (1, 1) e (2, 2)?", back: "É 1, com o erro de arredondamento dos números de vírgula flutuante (M2)." },
    { id: "f10", section: "s3", tag: "Produto escalar", front: "Pesquisa semântica com o cosseno", back: "Perguntas e documentos viram vetores e devolvem-se os documentos com maior cosseno. Com contagens de palavras, \"devolução\" e \"devolver\" nada têm em comum; os embeddings resolvem isso." },
    { id: "f11", section: "s4", tag: "Matrizes", front: "Matriz × vetor: as duas leituras", back: "Cada linha faz um produto escalar com o vetor; ou Ax é uma combinação linear das colunas de A, com os elementos de x como pesos." },
    { id: "f12", section: "s4", tag: "Matrizes", front: "Quando existe o produto AB, e que forma tem?", back: "Se as colunas de A forem tantas como as linhas de B: (m × n)(n × p) = (m × p). As dimensões de dentro coincidem; ficam as de fora." },
    { id: "f13", section: "s4", tag: "Matrizes", front: "As duas armadilhas do produto de matrizes", back: "A ordem conta (AB ≠ BA em geral) e `*` não é o produto de matrizes: multiplica elemento a elemento." },
    { id: "f14", section: "s4", tag: "Matrizes", front: "O que dizem as colunas de uma matriz 2 × 2?", back: "Para onde vão (1, 0) e (0, 1). Isso chega para saber para onde vai qualquer outro vetor." },
    { id: "f15", section: "s4", tag: "Matrizes", front: "Determinante", back: "Fator pelo qual a transformação multiplica as áreas (`np.linalg.det`). 0: achata o plano numa reta, perde informação, não tem inversa." },
    { id: "f16", section: "s4", tag: "Matrizes", front: "Identidade, transposta e inversa", back: "`np.eye(n)`: Ix = x. `A.T`: troca linhas com colunas. A⁻¹A = I: desfaz a transformação, só existe se det ≠ 0." },
    { id: "f17", section: "s4", tag: "Matrizes", front: "Resolver Ax = b em NumPy", back: "`np.linalg.solve(A, b)`: o mesmo resultado que `inv(A) @ b`, mas mais rápido e mais preciso." },
    { id: "f18", section: "s5", tag: "Valores próprios", front: "Vetor próprio e valor próprio", back: "Av = λv: uma direção que a matriz só estica ou encolhe, sem rodar; λ é o fator de esticamento." },
    { id: "f19", section: "s5", tag: "Valores próprios", front: "`eigh` ou `eig`?", back: "`eigh` para matrizes simétricas (covariância): mais rápida, números reais, valores do menor para o maior. `eig` para qualquer matriz quadrada; pode dar complexos." },
    { id: "f20", section: "s5", tag: "Valores próprios", front: "Valores próprios de uma matriz 2 × 2 à mão", back: "Resolver det(A − λI) = 0. Para C = [[2, 1], [1, 2]]: (2 − λ)² − 1 = 0, λ = 1 ou λ = 3." },
    { id: "f21", section: "s5", tag: "Valores próprios", front: "Porque pode o sinal de um vetor próprio sair trocado?", back: "v e −v são o mesmo vetor próprio; o NumPy devolve-os com comprimento 1 e escolhe um dos sinais." },
    { id: "f22", section: "s5", tag: "Valores próprios", front: "Onde aparecem os valores próprios em IA", back: "PCA (direções de maior variação), PageRank (vetor próprio principal da web) e otimização (M5: mínimos e descida do gradiente lenta)." },
    { id: "f23", section: "s6", tag: "SVD", front: "SVD", back: "A = UΣVᵀ, para qualquer matriz: Vᵀ roda, Σ estica pelos valores singulares σ₁ ≥ σ₂ ≥ … ≥ 0, U roda para o espaço de saída." },
    { id: "f24", section: "s6", tag: "SVD", front: "A SVD como soma de camadas", back: "A = σ₁u₁v₁ᵀ + σ₂u₂v₂ᵀ + … Em NumPy: `U[:, :k] @ np.diag(s[:k]) @ Vt[:k, :]` reconstrói com as k primeiras." },
    { id: "f25", section: "s6", tag: "SVD", front: "Teorema de Eckart & Young (1936)", back: "Guardar as k primeiras camadas da SVD dá a melhor aproximação possível da matriz com essa quantidade de camadas." },
    { id: "f26", section: "s6", tag: "SVD", front: "Quanto custa cada camada da SVD de uma imagem 600 × 512?", back: "600 + 512 + 1 números: uma coluna de U, uma linha de Vᵀ e um valor singular. Com k = 50, 18% dos números e erro de 10,6%." },
    { id: "f27", section: "s6", tag: "SVD", front: "Porque funciona a compressão com a SVD (e o LoRA)?", back: "Os dados reais têm poucas direções importantes e muitas quase irrelevantes. O LoRA ajusta LLMs mudando só matrizes de baixa característica (M22)." },
    { id: "f28", section: "s7", tag: "PCA", front: "A receita da PCA", back: "1. Padronizar cada coluna. 2. SVD dos dados padronizados (linhas de Vᵀ = componentes). 3. Variância explicada σᵢ² / Σσⱼ². 4. Projetar: Z Vₖ." },
    { id: "f29", section: "s7", tag: "PCA", front: "Porque se padroniza antes da PCA?", back: "A variância depende das unidades: sem padronizar, a massa dos pinguins (em gramas) dominaria sozinha a primeira componente." },
    { id: "f30", section: "s7", tag: "PCA", front: "PCA dos pinguins: o resultado", back: "Duas componentes guardam 88% da variação; a primeira (69%) é um eixo de tamanho e forma do corpo e separa os Gentoo." },
    { id: "f31", section: "s7", tag: "PCA", front: "Os limites da PCA", back: "O sinal das componentes é arbitrário e só encontra estrutura linear: para estrutura curva usam-se t-SNE ou UMAP (M10)." },
  ],

  // ---------------------------------------------------------------- NOTEBOOK
  notebook: {
    filename: "M4 — exercícios",
    cells: [
      {
        type: "md",
        source:
          "# M4 — Álgebra linear para IA\n\nExemplos da aula (correr pela ordem, no mesmo notebook) e os exercícios 1 a 12. Os exercícios 1 a 5 fazem-se primeiro à mão, em papel. Guardar no Drive, na pasta da Fase 1.",
      },
      { type: "code", source: IMPORTS },
      { type: "md", source: "## 2. Vetores e combinações lineares" },
      { type: "code", source: VEC_CODE.replace("import numpy as np\nnp.set_printoptions(precision=3, suppress=True)   # mostrar 3 casas decimais, como nesta aula\n\n", "") },
      { type: "code", source: CESTOS_CODE },
      { type: "md", source: "## 3. Produto escalar, normas e semelhança do cosseno" },
      { type: "code", source: DOT_CODE },
      { type: "code", source: NORM_CODE },
      { type: "code", source: COS_CODE.replace(`${COS_FN}\n\n`, "") },
      { type: "code", source: SEARCH_CODE },
      { type: "md", source: "## 4. Matrizes, multiplicação e transformações lineares" },
      { type: "code", source: LOJAS_CODE },
      { type: "code", source: MATMUL_CODE },
      { type: "code", source: `${TRANSF_CODE}\nprint(np.linalg.det(S))` },
      { type: "code", source: SOLVE_CODE },
      { type: "md", source: "## 5. Valores e vetores próprios" },
      { type: "code", source: EIG_CODE },
      { type: "md", source: "## 6. SVD: comprimir uma imagem" },
      { type: "code", source: SVD_CODE.replace("import matplotlib.pyplot as plt\n", "") },
      { type: "md", source: "## 7. PCA: reduzir dimensões" },
      { type: "code", source: PCA_CODE.replace("import pandas as pd\n\n", "") },
      { type: "md", source: "## Exercícios 1 a 5 (Parte A)\n\nFazer primeiro à mão; usar as células seguintes só para confirmar.\n\n1. u = (1, 2, −1), v = (3, 0, 2): u + v, 2u − v, u · v, ‖u‖, ‖v‖ e o cosseno.\n2. (2, −1) e (1, 2); (3, 1) e (1, 3): perpendiculares?\n3. A (3, 2), B (2, 4), C (4, 3): AB, BA, BC, CA, ABC.\n4. AB e BA com A = [[1, 0], [2, 1]] e B = [[3, 1], [0, 2]].\n5. Valores próprios de M = [[4, 1], [2, 3]] e verificação com (1, 1) e (1, −2)." },
      { type: "code", source: "# Exercício 1\nu = np.array([1, 2, -1])\nv = np.array([3, 0, 2])\n" },
      { type: "code", source: "# Exercício 4\n" },
      { type: "code", source: "# Exercício 5\nM = np.array([[4, 1], [2, 3]])\n" },
      { type: "md", source: "## Exercício 6\n\n`A @ I` contra `A * I`, com A = [[1, 2], [3, 4]] e I = `np.eye(2)`." },
      { type: "code", source: "A = np.array([[1, 2], [3, 4]])\nI = np.eye(2)\n" },
      { type: "md", source: "## Exercício 7\n\n1 saco + 2 luvas + 1 boné = 241 €; 3 luvas + 2 bonés = 102,50 €; 2 sacos + 1 boné = 382 €. Forma matricial e `np.linalg.solve`." },
      { type: "code", source: "# Exercício 7\n" },
      { type: "md", source: "## Exercício 8\n\nRotação de 30°: (a) rodar (1, 0) e confirmar o comprimento; (b) o determinante; (c) três rotações seguidas." },
      { type: "code", source: "t = np.radians(30)\n" },
      { type: "md", source: "## Exercício 9\n\n`mais_parecidos(pergunta, docs, k=2)` com o `CountVectorizer` e o cosseno. Testar com \"quanto tempo demora a entrega\" e \"aceitam pagamento por mbway\"." },
      { type: "code", source: `${FAQ}\n\ndef mais_parecidos(pergunta, docs, k=2):\n    ...\n` },
      { type: "md", source: "## Exercício 10\n\nErro relativo para k de 1 a 200, gráfico, menor k com erro abaixo de 5% e percentagem dos números guardados. A secção 7 reutilizou os nomes `U`, `s` e `Vt`: a primeira linha volta a calcular a SVD da fotografia." },
      { type: "code", source: "U, s, Vt = np.linalg.svd(img, full_matrices=False)   # a SVD da fotografia da secção 6\n\nerros = []\n" },
      { type: "md", source: "## Exercício 11\n\nPCA dos pinguins sem padronizar (só subtraindo a média): fração da primeira componente, variável dominante e desvios padrão." },
      { type: "code", source: "Xc = X - X.mean(axis=0)\n" },
      { type: "md", source: "## Exercício 12\n\nComparar com `PCA(n_components=2).fit(Z)` do scikit-learn: frações, componentes e sinais." },
      { type: "code", source: "from sklearn.decomposition import PCA\n" },
      { type: "md", source: "## Notas\n\nO que aprendi neste módulo, em três frases:" },
    ],
  },
  source: "curso-engenharia-ia 3/modulo-04-algebra-linear",
};
