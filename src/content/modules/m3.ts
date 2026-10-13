import type { ModuleContent } from "../types";

// Módulo 3 — Python para IA II: NumPy, pandas e Matplotlib.
// Fonte: curso-engenharia-ia 2/modulo-03-numpy-pandas-matplotlib (01-aula, 02-apostila, 03-exercicios, 04-prova, 05-gabarito,
// codigo/exemplos_m3.py e img/). As duas imagens da aula entram como figuras; o broadcasting, o groupby e o formato
// largo ↔ longo têm widgets interativos (src/components/widgets/m3), com a lógica testada contra NumPy 2.5 e pandas 3.0.
// As verificações rápidas, os cartões de revisão e o banco do simulado foram escritos pela plataforma a partir da aula,
// com todo o código corrido em Python 3.13, NumPy 2.5 e pandas 3.0.

// ---------------------------------------------------------------- código da aula

const NP_VET = `import numpy as np

precos = np.array([19.9, 45.0, 120.5, 8.75])
print(precos * 1.23)                  # [ 24.477   55.35   148.215   10.7625]
print(precos.mean(), precos.max(), precos.sum())   # 48.5375 120.5 194.15
print(precos[precos > 20])            # [ 45.  120.5]`;

const NP_ND = `m = np.array([[1, 2, 3],
              [4, 5, 6]])
print(m.shape, m.ndim, m.dtype)       # (2, 3) 2 int64
print(m[1, 2], m[:, 0], m[0])         # 6 [1 4] [1 2 3]
print(m.sum(axis=0), m.sum(axis=1))   # [5 7 9] [ 6 15]
print(m.reshape(3, 2))                # [[1 2] [3 4] [5 6]]`;

const NP_CREATE = `print(np.zeros(3))              # [0. 0. 0.]
print(np.ones((2, 2)))          # [[1. 1.] [1. 1.]]
print(np.arange(0, 10, 3))      # [0 3 6 9]
print(np.linspace(0, 1, 5))     # [0.   0.25 0.5  0.75 1.  ]`;

const NP_BC = `vendas = np.array([[1500,  980, 410],
                   [1720, 1105, 640],
                   [1610, 1290, 700]])   # linhas: jan, fev, mar; colunas: Lisboa, Porto, Faro

quota = vendas / vendas.sum(axis=0)    # cada valor a dividir pelo total da sua coluna
print(quota.round(2))
# [[0.31 0.29 0.23]
#  [0.36 0.33 0.37]
#  [0.33 0.38 0.4 ]]`;

const VENDAS_CSV = `VENDAS_CSV = """mes,loja,categoria,valor
2026-01,Lisboa,Equipamento,980
2026-01,Lisboa,Vestuário,520
2026-01,Porto,Equipamento,610
2026-01,Porto,Vestuário,370
2026-01,Faro,Equipamento,250
2026-01,Faro,Vestuário,160
2026-02,Lisboa,Equipamento,1100
2026-02,Lisboa,Vestuário,620
2026-02,Porto,Equipamento,705
2026-02,Porto,Vestuário,
2026-02,Faro,Equipamento,420
2026-02,Faro,Vestuário,220
2026-02,Faro,Vestuário,220
2026-03,Lisboa,Equipamento,990
2026-03,Lisboa,Vestuário,620
2026-03,Porto,Equipamento,830
2026-03,Porto,Vestuário,460
2026-03,Faro,Equipamento,450
2026-03,Faro,Vestuário,250
"""`;

const PD_DATA = `import io
import pandas as pd

${VENDAS_CSV}

df = pd.read_csv(io.StringIO(VENDAS_CSV))   # com um ficheiro real: pd.read_csv("vendas.csv")`;

const PD_INSPECT = `print(df.shape)            # (19, 4): 19 linhas, 4 colunas
print(df.head(3))
#        mes    loja    categoria  valor
# 0  2026-01  Lisboa  Equipamento  980.0
# 1  2026-01  Lisboa    Vestuário  520.0
# 2  2026-01   Porto  Equipamento  610.0
print(df["valor"].describe().round(1))   # contagem, média, desvio padrão, mínimo, quartis, máximo
print(df.isna().sum())     # valores em falta por coluna: valor tem 1
print(df.duplicated().sum())   # 1 linha repetida`;

const PD_CLEAN = `df = df.drop_duplicates()                     # remove a linha repetida de Faro: ficam 18
mediana = df.loc[df["categoria"] == "Vestuário", "valor"].median()   # 415.0
df["valor"] = df["valor"].fillna(mediana)     # preenche o valor em falta`;

const PD_SELECT = `print(df.loc[df["loja"] == "Faro", ["mes", "categoria", "valor"]])   # por condição e por nome
print(df.iloc[0:2, 1:3])                                             # por posição
#      loja    categoria
# 0  Lisboa  Equipamento
# 1  Lisboa    Vestuário

grandes = df[(df["valor"] > 600) & (df["categoria"] == "Vestuário")]
print(grandes)
#         mes    loja  categoria  valor
# 7   2026-02  Lisboa  Vestuário  620.0
# 14  2026-03  Lisboa  Vestuário  620.0`;

const PD_COLS = `df["data"] = pd.to_datetime(df["mes"])        # texto → data
df["trimestre"] = df["data"].dt.quarter       # extrair partes da data
df["com_iva"] = (df["valor"] * 1.23).round(2)  # operação vetorizada, como no NumPy`;

const GB_CODE = `print(df.groupby("loja")["valor"].sum())
# loja
# Faro      1750.0
# Lisboa    4830.0
# Porto     3390.0

print(df.groupby("loja")["valor"].agg(["sum", "mean", "count"]).round(1))
#            sum   mean  count
# Faro    1750.0  291.7      6
# Lisboa  4830.0  805.0      6
# Porto   3390.0  565.0      6

print(df.groupby("loja")["valor"].sum().sort_values(ascending=False))
# Lisboa 4830.0, Porto 3390.0, Faro 1750.0`;

const PIVOT_CODE = `tabela = df.pivot_table(index="mes", columns="loja", values="valor", aggfunc="sum")
print(tabela)
# loja      Faro  Lisboa   Porto
# mes
# 2026-01  410.0  1500.0   980.0
# 2026-02  640.0  1720.0  1120.0
# 2026-03  700.0  1610.0  1290.0

print(tabela.pct_change().round(3))   # variação de um mês para o seguinte
# 2026-02  0.561   0.147  0.143
# 2026-03  0.094  -0.064  0.152`;

const LOJAS_CSV = `LOJAS_CSV = """loja,regiao,area_m2
Lisboa,Centro,420
Porto,Norte,310
Faro,Sul,180
"""`;

const MERGE_CODE = `${LOJAS_CSV}
lojas = pd.read_csv(io.StringIO(LOJAS_CSV))

completo = df.merge(lojas, on="loja", how="left")
por_loja = completo.groupby(["loja", "area_m2"])["valor"].sum().reset_index()
por_loja["valor_por_m2"] = (por_loja["valor"] / por_loja["area_m2"]).round(2)
print(por_loja.sort_values("valor_por_m2", ascending=False))
#      loja  area_m2   valor  valor_por_m2
# 1  Lisboa      420  4830.0         11.50
# 2   Porto      310  3390.0         10.94
# 0    Faro      180  1750.0          9.72`;

const MELT_CODE = `largo = pd.DataFrame({
    "loja": ["Lisboa", "Porto", "Faro"],
    "jan": [1500, 980, 410],
    "fev": [1720, 1120, 640],
    "mar": [1610, 1290, 700],
})

longo = largo.melt(id_vars="loja", var_name="mes", value_name="valor")
print(longo.head(4))
#      loja  mes  valor
# 0  Lisboa  jan   1500
# 1   Porto  jan    980
# 2    Faro  jan    410
# 3  Lisboa  fev   1720
print(longo.shape)    # (9, 3)`;

const PLOT_CODE = `import matplotlib.pyplot as plt

tabela = df.pivot_table(index="mes", columns="loja", values="valor", aggfunc="sum")
totais = df.groupby("loja")["valor"].sum().sort_values()
por_loja = df.groupby("loja")["valor"].sum().reset_index().merge(lojas, on="loja")

fig, eixos = plt.subplots(2, 2, figsize=(11, 8))

# 1. Linha: evolução ao longo do tempo
for loja in tabela.columns:
    eixos[0, 0].plot(tabela.index, tabela[loja], marker="o", label=loja)
eixos[0, 0].set_title("Vendas mensais por loja")
eixos[0, 0].set_ylabel("Vendas (€)")
eixos[0, 0].set_ylim(0, 2100)
eixos[0, 0].legend(ncols=3, loc="upper center")

# 2. Barras: comparar categorias
eixos[0, 1].barh(totais.index, totais.values)
eixos[0, 1].set_title("Vendas do trimestre por loja")
eixos[0, 1].set_xlabel("Vendas (€)")

# 3. Histograma: distribuição de uma variável
eixos[1, 0].hist(df["valor"], bins=6, edgecolor="white")
eixos[1, 0].set_title("Distribuição dos valores mensais")
eixos[1, 0].set_xlabel("Valor (€)")
eixos[1, 0].set_ylabel("N.º de registos")

# 4. Dispersão: relação entre duas variáveis
eixos[1, 1].scatter(por_loja["area_m2"], por_loja["valor"])
for _, linha in por_loja.iterrows():
    eixos[1, 1].annotate(linha["loja"], (linha["area_m2"], linha["valor"]),
                         textcoords="offset points", xytext=(6, 4))
eixos[1, 1].margins(0.15)
eixos[1, 1].set_title("Área da loja e vendas")
eixos[1, 1].set_xlabel("Área (m²)")
eixos[1, 1].set_ylabel("Vendas do trimestre (€)")

fig.tight_layout()
fig.savefig("quatro_graficos.png", dpi=120)
plt.show()`;

const DADOS_CSV = `DADOS = """loja,mes,valor
Lisboa,jan,1500
Porto,jan,980
Faro,jan,410
Lisboa,fev,1720
Porto,fev,1105
Faro,fev,640
Lisboa,mar,1610
Porto,mar,1290
Faro,mar,700
"""`;

const REPORT_CODE = `import io
import pandas as pd

${DADOS_CSV}
vendas = pd.read_csv(io.StringIO(DADOS))

tabela = vendas.pivot_table(index="loja", columns="mes", values="valor", aggfunc="sum")
tabela = tabela[["jan", "fev", "mar"]]                      # pôr os meses por ordem
tabela["total"] = tabela.sum(axis=1)
tabela["crescimento_%"] = ((tabela["mar"] - tabela["jan"]) / tabela["jan"] * 100).round(1)
tabela = tabela.sort_values("total", ascending=False)

print(tabela)
print(f"Melhor loja: {tabela['total'].idxmax()} · Total da rede: {tabela['total'].sum():.2f} €")
tabela.to_csv("relatorio_t1.csv")`;

const REPORT_OUT = `mes      jan   fev   mar  total  crescimento_%
loja
Lisboa  1500  1720  1610   4830            7.3
Porto    980  1105  1290   3375           31.6
Faro     410   640   700   1750           70.7
Melhor loja: Lisboa · Total da rede: 9955.00 €`;

// ---------------------------------------------------------------- dados dos exercícios e da prova

const IMPORTS = `import io
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt`;

const EX1_DATA = `vendas = np.array([820, 760, 910, 1050, 1200, 1340, 1480, 1510, 1190, 980, 870, 1300])
meses = np.array(["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"])`;

const EX3_DATA = `notas = np.array([[14, 12, 16, 15],
                  [10, 11,  9, 13],
                  [18, 17, 19, 16]])`;

const PRODUTOS = `PRODUTOS = """codigo,nome,categoria,loja,preco,stock
P01,Bola de golfe (12),Acessórios,Lisboa,24.90,120
P02,Luva,Acessórios,lisboa ,19.50,45
P03,Driver,Tacos,Porto,349.00,6
P04,Ferro 7,Tacos,Porto,129.00,
P05,Saco de golfe,Sacos,Faro,189.00,8
P06,Polo técnico,Vestuário,Lisboa,49.90,60
P07,Boné,Vestuário, Porto,22.00,80
P08,Putter,Tacos,Lisboa,,10
P03,Driver,Tacos,Porto,349.00,6
P09,Carrinho,Sacos,Faro,229.00,3
"""
p = pd.read_csv(io.StringIO(PRODUTOS))`;

const FORN = `FORN = """categoria,fornecedor
Acessórios,GolfPro
Tacos,SwingTech
Vestuário,FairWay Wear
"""`;

const VISITAS = `visitas = pd.DataFrame({"semana": [1, 2, 3], "seg": [120, 135, 128], "ter": [98, 110, 104],
                        "sab": [310, 290, 335], "dom": [260, 240, 275]})`;

const TIPS = `tips = pd.read_csv("https://raw.githubusercontent.com/mwaskom/seaborn-data/master/tips.csv")`;

const ENCOMENDAS = `ENCOMENDAS = """data,cliente,produto,quantidade,preco_unit
2026-09-01,Ana,Bola de golfe (12),2,24.90
2026-09-01,Rui,Luva,1,19.50
2026-09-02,Ana,Luva,1,19.50
2026-09-03,Marta,Driver,1,349.00
2026-09-03,Rui,Bola de golfe (12),3,24.90
2026-09-04,Ana,Polo técnico,2,49.90
2026-09-05,Marta,Bola de golfe (12),1,24.90
2026-09-05,Tiago,Saco de golfe,1,189.00
2026-09-06,Rui,Polo técnico,1,49.90
2026-09-06,Ana,Bola de golfe (12),4,24.90
"""`;

export const M3: ModuleContent = {
  id: "M3",
  duration: "2 semanas, cerca de 6 horas",
  intro:
    "No fim deste módulo deve saber fazer cálculos vetoriais com NumPy, carregar, limpar, filtrar, agrupar e juntar tabelas com pandas, e fazer gráficos claros com Matplotlib. São as três ferramentas que preparam os dados de qualquer projeto de IA.",
  outcomes: [
    "Fazer cálculos vetoriais com NumPy",
    "Carregar, limpar e filtrar tabelas com pandas",
    "Agrupar e juntar tabelas com pandas",
    "Fazer gráficos claros com Matplotlib",
  ],
  goldenRule:
    "Tentar cada exercício antes de abrir o gabarito. Usar um assistente de IA para explicar um erro é válido; pedir-lhe a resposta não é.",
  sessions: [
    {
      id: "w1s1",
      label: "Semana 1 · sessão 1",
      minutes: 90,
      tasks: [
        { id: "t1", text: "Ler a secção 1 (NumPy) e correr os exemplos", link: { kind: "section", id: "s1" } },
        { id: "t2", text: "Exercícios 1 a 3", link: { kind: "tab", tab: "exercicios" } },
      ],
    },
    {
      id: "w1s2",
      label: "Semana 1 · sessão 2",
      minutes: 90,
      tasks: [
        { id: "t1", text: "Ler as secções 2 e 3 (pandas)", link: { kind: "section", id: "s2" } },
        { id: "t2", text: "Exercícios 4 a 7", link: { kind: "tab", tab: "exercicios" } },
      ],
    },
    {
      id: "w2s1",
      label: "Semana 2 · sessão 1",
      minutes: 90,
      tasks: [
        { id: "t1", text: "Ler as secções 4 a 6", link: { kind: "section", id: "s4" } },
        { id: "t2", text: "Exercícios 8 a 10", link: { kind: "tab", tab: "exercicios" } },
      ],
    },
    {
      id: "w2s2",
      label: "Semana 2 · sessão 2",
      minutes: 90,
      tasks: [
        { id: "t1", text: "Exercícios 11 e 12", link: { kind: "tab", tab: "exercicios" } },
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
      title: "NumPy: cálculo com arrays",
      minutes: 30,
      blocks: [
        {
          t: "callout",
          tone: "info",
          title: "Como estudar este módulo",
          text: "Todos os exemplos usam o mesmo pequeno conjunto de dados de vendas, por isso devem ser corridos pela ordem, no mesmo notebook. O código foi testado com NumPy 2.5 e pandas 3.0; no Colab, com o pandas 2, os resultados são iguais e só muda a forma como alguns tipos de dados aparecem escritos. Referência principal: McKinney, *Python for Data Analysis* (2022), escrito pelo criador do pandas. A versão online é gratuita.",
        },
        {
          t: "p",
          text: "O NumPy é a base numérica de todo o ecossistema de IA em Python: o pandas, o scikit-learn e o PyTorch assentam nele ou imitam a sua forma de trabalhar (Harris et al., 2020). A ideia central é o **array**: uma tabela de números, todos do mesmo tipo, guardados lado a lado na memória, sobre a qual se fazem operações de uma vez só.",
        },
        { t: "h3", text: "Vetorização: operações sem ciclos" },
        { t: "code", title: "Vetorização", code: NP_VET },
        {
          t: "p",
          text: "Com uma lista seria preciso um ciclo ou uma compreensão; com um array, `precos * 1.23` multiplica todos os elementos. A última linha é uma **máscara booleana**: `precos > 20` dá um array de `True`/`False`, e usá-lo como índice guarda só os elementos verdadeiros. Esta forma de filtrar repete-se no pandas.",
        },
        {
          t: "p",
          text: "A vetorização não é só mais curta: é mais rápida, porque o ciclo corre em C e não em Python. Num teste feito para esta aula, multiplicar um milhão de números por 2 demorou cerca de 37 ms com uma compreensão de lista e 3 ms com NumPy, cerca de 12 vezes menos. O exercício 2 pede para repetir a medição.",
        },
        { t: "h3", text: "Arrays com várias dimensões" },
        { t: "code", title: "Arrays com várias dimensões", code: NP_ND },
        {
          t: "list",
          items: [
            "`shape` dá as dimensões: 2 linhas e 3 colunas.",
            "`m[1, 2]` é a linha 1, coluna 2; `m[:, 0]` é a coluna 0 inteira.",
            "`axis=0` percorre as linhas e dá um resultado por coluna; `axis=1` dá um resultado por linha. É o pormenor que mais confunde no início, e vale a pena testar até ficar claro.",
          ],
        },
        {
          t: "p",
          text: "Uma imagem a cores é um array com forma (altura, largura, 3); um lote de 32 imagens é um array (32, altura, largura, 3). As redes neuronais da Fase 3 trabalham só com arrays destes, a que o PyTorch chama **tensores**.",
        },
        { t: "h3", text: "Criar arrays" },
        { t: "code", title: "Criar arrays", code: NP_CREATE },
        { t: "h3", text: "Broadcasting" },
        {
          t: "p",
          text: "Quando se opera com arrays de formas diferentes, o NumPy \"estica\" o mais pequeno para encaixar no maior, sem copiar dados. Chama-se **broadcasting**.",
        },
        { t: "code", title: "Broadcasting", code: NP_BC },
        {
          t: "p",
          text: "`vendas.sum(axis=0)` tem forma (3,) e `vendas` tem forma (3, 3): o NumPy repete os totais em cada linha e divide elemento a elemento. O resultado diz que peso teve cada mês nas vendas do trimestre de cada loja: em Faro, março valeu 40%. A regra geral: as dimensões comparam-se da direita para a esquerda e são compatíveis se forem iguais ou se uma delas for 1 (VanderPlas, 2022, cap. 8).",
        },
        {
          t: "widget",
          name: "m3-broadcast",
          caption: "Verificador de broadcasting: duas formas, comparadas da direita para a esquerda como faz o NumPy. O resultado e a mensagem de erro são os do NumPy 2.5.",
        },
        {
          t: "check",
          id: "qc1",
          q: "Com `m = np.array([[1, 2, 3], [4, 5, 6]])`, o que dá `m.mean(axis=1)`?",
          options: ["`[2. 5.]`", "`[2.5 3.5 4.5]`", "`3.5`", "Dá erro."],
          answer: 0,
          explain:
            "`axis=1` dá um resultado por linha: a média de 1, 2, 3 é 2 e a de 4, 5, 6 é 5. `[2.5 3.5 4.5]` seria `axis=0`, um resultado por coluna.",
        },
      ],
    },
    {
      id: "s2",
      num: 2,
      title: "pandas: tabelas de dados",
      minutes: 35,
      blocks: [
        {
          t: "p",
          text: "O pandas foi criado por Wes McKinney em 2008 para analisar dados financeiros e apresentado em McKinney (2010). Traz duas estruturas: a **Series**, uma coluna de valores com um índice, e o **DataFrame**, uma tabela de várias Series que partilham o mesmo índice. É como uma folha de cálculo controlada por código: tudo o que se faz fica registado e pode ser repetido.",
        },
        { t: "h3", text: "Os dados desta aula" },
        {
          t: "p",
          text: "Vendas mensais de três lojas, por categoria, no primeiro trimestre. O conjunto tem dois problemas de propósito, tal como os dados reais: um valor em falta e uma linha repetida.",
        },
        { t: "code", title: "Os dados desta aula", code: PD_DATA },
        {
          t: "p",
          text: "`io.StringIO` faz o texto comportar-se como um ficheiro, para o exemplo correr sem downloads. Com dados reais usa-se o caminho do ficheiro, ou um URL.",
        },
        { t: "h3", text: "Inspecionar: o primeiro passo de qualquer análise" },
        { t: "code", title: "Inspecionar", code: PD_INSPECT },
        {
          t: "p",
          text: "`df.info()` também vale a pena: mostra o tipo de cada coluna e quantos valores não estão em falta. Antes de qualquer gráfico ou modelo, responder sempre a quatro perguntas: quantas linhas e colunas há, de que tipo é cada coluna, onde faltam valores e se há duplicados.",
        },
        { t: "h3", text: "Limpar" },
        { t: "code", title: "Limpar", code: PD_CLEAN },
        {
          t: "p",
          text: "Há três formas de tratar um valor em falta: apagar a linha (`dropna`), preenchê-lo com uma estimativa (`fillna`), ou ir buscar o valor certo à fonte. Aqui preenche-se com a mediana do Vestuário, que é menos sensível a valores extremos do que a média. Mas é uma estimativa: no M2, o valor real de Porto em fevereiro era 400 €, e com 415 € o total de Porto passa de 3375 € para 3390 €. Qualquer preenchimento deve ficar registado no relatório.",
        },
        { t: "h3", text: "Selecionar linhas e colunas" },
        { t: "code", title: "Selecionar linhas e colunas", code: PD_SELECT },
        {
          t: "list",
          items: [
            "`loc` seleciona pelos **nomes** (rótulos do índice e nomes das colunas); `iloc` pelas **posições** (0, 1, 2…).",
            "Para combinar condições usa-se `&` (e), `|` (ou) e `~` (não), com cada condição entre parênteses. `and` e `or` dão erro.",
          ],
        },
        { t: "h3", text: "Criar colunas" },
        { t: "code", title: "Criar colunas", code: PD_COLS },
        {
          t: "p",
          text: "Nunca se percorre um DataFrame com um `for` para calcular uma coluna: as operações aplicam-se à coluna inteira, como os arrays NumPy.",
        },
        {
          t: "check",
          id: "qc2",
          q: "Depois de `df.drop_duplicates()` e do `fillna(mediana)`, quantas linhas tem `df` e quantos valores faltam em `valor`?",
          options: ["19 linhas, 1 em falta", "18 linhas, 0 em falta", "18 linhas, 1 em falta", "17 linhas, 0 em falta"],
          answer: 1,
          explain:
            "`drop_duplicates` tira a linha repetida de Faro (19 → 18) e `fillna` preenche o valor de Porto em fevereiro com 415.0. Confirma-se com `df.shape` e `df[\"valor\"].isna().sum()`.",
        },
      ],
    },
    {
      id: "s3",
      num: 3,
      title: "Agrupar e juntar tabelas",
      minutes: 30,
      blocks: [
        { t: "h3", text: "Agrupar: dividir, aplicar, combinar" },
        {
          t: "p",
          text: "Quase todas as perguntas de negócio têm a forma \"qual é o total (ou a média) por X?\". Wickham (2011) descreveu a estratégia que as resolve: **dividir** os dados em grupos, **aplicar** um cálculo a cada grupo e **combinar** os resultados. No pandas, isto é o `groupby`.",
        },
        {
          t: "figure",
          src: "img/01-dividir-aplicar-combinar.png",
          alt: "groupby divide a tabela por loja, soma cada grupo e junta os resultados",
        },
        { t: "code", title: "groupby", code: GB_CODE },
        {
          t: "p",
          text: "A mesma linha resolve o que no M2 levou uma função inteira. `agg` aplica vários cálculos de uma vez, e pode agrupar-se por mais de uma coluna: `df.groupby([\"mes\", \"categoria\"])`.",
        },
        {
          t: "widget",
          name: "m3-groupby",
          caption: "Dividir, aplicar, combinar com a tabela da aula, já limpa (18 linhas). Escolha a coluna e o cálculo: o resultado é o que o pandas 3.0 imprime.",
        },
        { t: "h3", text: "Tabelas dinâmicas" },
        { t: "code", title: "Tabelas dinâmicas", code: PIVOT_CODE },
        {
          t: "p",
          text: "É a tabela dinâmica do Excel, em código. A primeira linha de `pct_change` fica vazia (`NaN`) porque janeiro não tem mês anterior.",
        },
        { t: "h3", text: "Juntar tabelas" },
        {
          t: "p",
          text: "Os dados úteis raramente estão numa só tabela. Aqui, as vendas estão numa e as características das lojas noutra:",
        },
        { t: "code", title: "Juntar tabelas", code: MERGE_CODE },
        {
          t: "p",
          text: "`merge` junta as linhas das duas tabelas que têm o mesmo valor na coluna `loja`, como um `JOIN` em SQL. O parâmetro `how` decide o que acontece às linhas sem par: `\"left\"` mantém todas as da tabela da esquerda, `\"inner\"` só as que têm par nas duas. Depois de juntar, vale a pena confirmar que o número de linhas é o esperado: chaves repetidas na tabela da direita multiplicam linhas sem aviso.",
        },
        {
          t: "check",
          id: "qc3",
          q: "Com os dados já limpos, quanto dá `df.groupby(\"categoria\")[\"valor\"].sum()` para o Vestuário?",
          options: ["`3635.0`", "`3220.0`", "`6335.0`", "`403.9`"],
          answer: 0,
          explain:
            "São as 9 linhas de Vestuário, incluindo os 415 preenchidos. Sem o `fillna`, a soma ignoraria o valor em falta e daria 3220.0; 6335.0 é o Equipamento e 403.9 é a média do Vestuário.",
        },
      ],
    },
    {
      id: "s4",
      num: 4,
      title: "Dados arrumados (tidy data)",
      minutes: 15,
      blocks: [
        {
          t: "p",
          text: "Os mesmos dados podem ser escritos em tabelas com formas diferentes, e algumas formas tornam a análise muito mais fácil. Wickham (2014) chamou **dados arrumados** (*tidy data*) aos que seguem três regras:",
        },
        {
          t: "list",
          ordered: true,
          items: [
            "Cada variável é uma coluna.",
            "Cada observação é uma linha.",
            "Cada tipo de unidade observada tem a sua tabela (aqui: vendas numa, lojas noutra).",
          ],
        },
        {
          t: "p",
          text: "Uma tabela de Excel típica tem os meses em colunas. É boa para ler, mas \"mês\" é uma variável e está espalhada por três colunas:",
        },
        { t: "code", title: "Largo → longo", code: MELT_CODE },
        {
          t: "p",
          text: "`melt` passa do formato **largo** ao formato **longo** (arrumado); `pivot` ou `pivot_table` fazem o caminho inverso. No formato longo, \"total por mês\" e \"total por loja\" são o mesmo `groupby` com outra coluna, os gráficos fazem-se diretamente e os modelos de ML recebem os dados como esperam: uma linha por exemplo, uma coluna por característica.",
        },
        {
          t: "p",
          text: "Regra prática: arrumar os dados logo no início; voltar ao formato largo só para apresentar uma tabela a pessoas.",
        },
        {
          t: "widget",
          name: "m3-tidy",
          caption: "Formato largo e longo com a tabela desta secção. Toque num valor para o ver nas duas formas; a ordem das linhas e das colunas é a do pandas 3.0.",
        },
        {
          t: "check",
          id: "qc4",
          q: "Uma tabela tem 3 alunos (coluna `aluno`) e uma coluna por teste (`t1` a `t4`). Que forma tem `melt(id_vars=\"aluno\", var_name=\"teste\", value_name=\"nota\")`?",
          options: ["`(3, 5)`", "`(12, 3)`", "`(4, 3)`", "`(15, 2)`"],
          answer: 1,
          explain: "Cada aluno dá uma linha por teste: 3 × 4 = 12 linhas, com as colunas `aluno`, `teste` e `nota`.",
        },
      ],
    },
    {
      id: "s5",
      num: 5,
      title: "Gráficos com Matplotlib",
      minutes: 30,
      blocks: [
        {
          t: "p",
          text: "O Matplotlib (Hunter, 2007) é a biblioteca de gráficos de base do Python; o pandas e o seaborn usam-no por baixo. Um gráfico tem duas peças: a **figura** (`fig`), que é a imagem inteira, e os **eixos** (`ax`), cada um dos gráficos dentro dela.",
        },
        { t: "h3", text: "Os quatro gráficos essenciais" },
        { t: "p", text: "Quatro tipos de gráfico cobrem a maior parte das análises. A escolha depende da pergunta:" },
        {
          t: "table",
          head: ["Pergunta", "Gráfico", "Função"],
          rows: [
            ["Como evoluiu ao longo do tempo?", "Linha", "`ax.plot`"],
            ["Qual é maior?", "Barras (horizontais se os nomes forem longos)", "`ax.bar`, `ax.barh`"],
            ["Como se distribuem os valores?", "Histograma", "`ax.hist`"],
            ["As duas variáveis andam juntas?", "Dispersão", "`ax.scatter`"],
          ],
        },
        { t: "code", title: "Os quatro gráficos essenciais", code: PLOT_CODE },
        { t: "p", text: "Resultado esperado:" },
        { t: "figure", src: "img/02-quatro-graficos.png", alt: "Os quatro gráficos essenciais: linha, barras, histograma e dispersão" },
        { t: "h3", text: "Boas práticas" },
        {
          t: "p",
          text: "Um gráfico serve para responder a uma pergunta sem obrigar quem o vê a decifrá-lo. As regras vêm de Tufte (2001) e de Wilke (2019), cujo livro está gratuito online:",
        },
        {
          t: "list",
          ordered: true,
          items: [
            "**Título que diz o que se vê** e eixos com unidades: \"Vendas (€)\", não \"valor\".",
            "**Barras começam sempre no zero.** Uma barra cortada exagera as diferenças. As linhas podem não começar no zero, mas aqui começa para não exagerar o crescimento de Faro.",
            "**Ordenar as barras pelo valor**, não por ordem alfabética, para a comparação ser imediata.",
            "**Nada de 3D, sombras ou cores sem significado.** Cada elemento que não é dado distrai.",
            "**Cuidado com a dispersão com poucos pontos.** Três lojas alinhadas não provam que mais área dá mais vendas: as lojas maiores também estão nas cidades maiores. Correlação não é causalidade; o tema volta no M6.",
          ],
        },
        {
          t: "p",
          text: "O pandas tem um atalho para gráficos rápidos de exploração: `tabela.plot(marker=\"o\")` ou `totais.plot.barh()`. Para gráficos que vão ser mostrados a alguém, o controlo do Matplotlib compensa.",
        },
        {
          t: "check",
          id: "qc5",
          q: "Quer mostrar se as lojas com mais área vendem mais. Que gráfico responde à pergunta?",
          options: ["Linha", "Barras", "Histograma", "Dispersão"],
          answer: 3,
          explain:
            "\"As duas variáveis andam juntas?\" pede uma dispersão (`ax.scatter`). Com só três lojas, porém, não se pode concluir que a área causa as vendas.",
        },
      ],
    },
    {
      id: "s6",
      num: 6,
      title: "Exemplo completo: o relatório do M2 refeito com pandas",
      minutes: 15,
      blocks: [
        {
          t: "p",
          text: "No M2, o relatório de vendas por loja levou quatro funções e cerca de 40 linhas. Com pandas, o mesmo resultado, e mais completo, cabe em poucas linhas:",
        },
        { t: "code", title: "Relatório do M2 com pandas", code: REPORT_CODE, output: REPORT_OUT },
        {
          t: "p",
          text: "Os números são exatamente os do M2, o que é uma boa forma de verificar o código: quando se reescreve uma análise com outra ferramenta, os resultados têm de coincidir. A tabela final ainda se grava num CSV que abre no Excel.",
        },
        {
          t: "p",
          text: "Este é o fluxo de qualquer análise e, mais tarde, da preparação de dados para um modelo: **carregar → inspecionar → limpar → transformar → resumir → mostrar**. O mini-projeto da Fase 0 pede exatamente isto, com um conjunto de dados real.",
        },
        {
          t: "check",
          id: "qc6",
          q: "Para que serve a linha `tabela = tabela[[\"jan\", \"fev\", \"mar\"]]`?",
          options: [
            "Para remover a coluna `total`",
            "Porque o `pivot_table` ordena as colunas por ordem alfabética (fev, jan, mar)",
            "Porque sem ela o `sum(axis=1)` dá erro",
            "Para converter os valores em números",
          ],
          answer: 1,
          explain:
            "O `pivot_table` ordena as colunas: sem esta linha ficariam `fev`, `jan`, `mar`. Selecionar uma lista de colunas devolve-as pela ordem pedida.",
        },
      ],
    },
  ],

  readings: {
    required: [
      {
        text: "McKinney, W. (2022). [*Python for Data Analysis*](https://wesmckinney.com/book/) (3.ª ed.). O'Reilly. Caps. 4 (NumPy), 5 (pandas), 7 (limpeza), 8 (juntar e remodelar), 9 (gráficos) e 10 (agrupar). Gratuito online.",
        href: "https://wesmckinney.com/book/",
      },
    ],
    complementary: [
      {
        text: "VanderPlas, J. (2022). [*Python Data Science Handbook*](https://jakevdp.github.io/PythonDataScienceHandbook/) (2.ª ed.). O'Reilly. Partes II e III. A 1.ª edição está gratuita online.",
        href: "https://jakevdp.github.io/PythonDataScienceHandbook/",
      },
      { text: "Wilke, C. O. (2019). [*Fundamentals of Data Visualization*](https://clauswilke.com/dataviz/). O'Reilly. Gratuito online.", href: "https://clauswilke.com/dataviz/" },
      {
        text: "Documentação oficial: [10 minutes to pandas](https://pandas.pydata.org/docs/user_guide/10min.html) e [NumPy: the absolute basics for beginners](https://numpy.org/doc/stable/user/absolute_beginners.html).",
        href: "https://pandas.pydata.org/docs/user_guide/10min.html",
      },
    ],
    cited: [
      "Harris, C. R. et al. (2020). Array programming with NumPy. *Nature*, 585, 357–362.",
      "McKinney, W. (2010). Data structures for statistical computing in Python. *Proceedings of the 9th Python in Science Conference*, 56–61.",
      "Hunter, J. D. (2007). Matplotlib: A 2D graphics environment. *Computing in Science & Engineering*, 9(3), 90–95.",
      "Wickham, H. (2011). The split-apply-combine strategy for data analysis. *Journal of Statistical Software*, 40(1), 1–29.",
      "Wickham, H. (2014). Tidy data. *Journal of Statistical Software*, 59(10), 1–23.",
      "Tufte, E. R. (2001). *The Visual Display of Quantitative Information* (2.ª ed.). Graphics Press.",
    ],
  },

  // ---------------------------------------------------------------- APOSTILA (02-apostila.md)
  apostila: {
    intro: "Resumo para rever antes da prova e para ter ao lado enquanto analisa dados.",
    sections: [
      {
        title: "NumPy",
        blocks: [
          {
            t: "code",
            title: "NumPy",
            code: `import numpy as np
a = np.array([1, 2, 3])            # criar
np.zeros((2, 3)), np.ones(3), np.arange(0, 10, 2), np.linspace(0, 1, 5)
a.shape, a.ndim, a.dtype           # forma, n.º de dimensões, tipo
a * 2, a + a, a ** 2               # operações vetorizadas
a.sum(), a.mean(), a.max(), a.argmax(), a.cumsum()
a[a > 1]                           # máscara booleana
m[1, 2], m[:, 0], m[0]             # elemento, coluna, linha
m.sum(axis=0)                      # um resultado por coluna
m.sum(axis=1)                      # um resultado por linha
m.reshape(3, 2)`,
          },
          {
            t: "p",
            text: "**Broadcasting:** as formas comparam-se da direita para a esquerda; cada dimensão tem de ser igual ou valer 1. (3, 4) com (4,) funciona; (3, 4) com (3,) não.",
          },
        ],
      },
      {
        title: "pandas",
        blocks: [
          {
            t: "table",
            head: ["Tarefa", "Código"],
            rows: [
              ["Ler", "`pd.read_csv(\"f.csv\")`"],
              ["Inspecionar", "`df.shape`, `df.head()`, `df.info()`, `df.describe()`"],
              ["Valores em falta", "`df.isna().sum()`, `df.dropna()`, `df.fillna(valor)`"],
              ["Duplicados", "`df.duplicated().sum()`, `df.drop_duplicates()`"],
              ["Limpar texto", "`df[\"col\"].str.strip().str.title()`"],
              ["Selecionar por nome", "`df.loc[condição, [\"col1\", \"col2\"]]`"],
              ["Selecionar por posição", "`df.iloc[0:5, 0:2]`"],
              ["Filtrar", "`df[(df[\"a\"] > 5) & (df[\"b\"] == \"x\")]`"],
              ["Nova coluna", "`df[\"c\"] = df[\"a\"] * df[\"b\"]`"],
              ["Datas", "`pd.to_datetime(df[\"d\"])`, `.dt.month`, `.dt.quarter`"],
              ["Agrupar", "`df.groupby(\"g\")[\"v\"].agg([\"sum\", \"mean\", \"count\"])`"],
              ["Contar categorias", "`df[\"col\"].value_counts()`"],
              ["Ordenar", "`df.sort_values(\"v\", ascending=False)`"],
              ["Tabela dinâmica", "`df.pivot_table(index=, columns=, values=, aggfunc=)`"],
              ["Largo → longo", "`df.melt(id_vars=, var_name=, value_name=)`"],
              ["Juntar", "`df.merge(outra, on=\"chave\", how=\"left\")`"],
              ["Gravar", "`df.to_csv(\"f.csv\")`"],
            ],
          },
          {
            t: "p",
            text: "**Dados arrumados:** cada variável numa coluna, cada observação numa linha, cada tipo de unidade na sua tabela.",
          },
        ],
      },
      {
        title: "Matplotlib",
        blocks: [
          {
            t: "code",
            title: "Matplotlib",
            code: `import matplotlib.pyplot as plt
fig, ax = plt.subplots(figsize=(8, 4))
ax.plot(x, y, marker="o", label="...")   # linha: evolução
ax.barh(nomes, valores)                  # barras: comparar
ax.hist(valores, bins=10)                # histograma: distribuição
ax.scatter(x, y)                         # dispersão: relação
ax.set_title("..."); ax.set_xlabel("... (unidade)"); ax.legend()
fig.tight_layout(); fig.savefig("grafico.png")`,
          },
          {
            t: "p",
            text: "Regras: título que diz o que se vê · eixos com unidades · barras desde o zero · barras ordenadas pelo valor · sem 3D nem cores sem significado.",
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
              "Confundir `axis=0` (resultado por coluna) com `axis=1` (resultado por linha).",
              "Usar `and`/`or` em vez de `&`/`|` nos filtros, ou esquecer os parênteses de cada condição.",
              "Calcular colunas com um `for` linha a linha, em vez de operações vetorizadas.",
              "Preencher valores em falta sem o registar no relatório.",
              "Fazer um `merge` sem confirmar o número de linhas antes e depois.",
              "Ler uma relação num gráfico de dispersão com poucos pontos como causa e efeito.",
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
      title: "Parte A — NumPy",
      note: "Doze exercícios, cerca de 3 horas no total, num notebook do Colab chamado \"M3 — exercícios\". Comece todas as células com `import io`, `import numpy as np`, `import pandas as pd` e `import matplotlib.pyplot as plt`.",
    },
    {
      id: "B",
      title: "Parte B — pandas",
      note: "Os exercícios 4 a 7 usam o catálogo do exercício 4, que tem problemas de propósito.",
    },
    { id: "C", title: "Parte C — Gráficos" },
    { id: "D", title: "Parte D — Análise completa" },
  ],
  exercises: [
    {
      id: "e1",
      num: 1,
      part: "A",
      session: "w1s1",
      kind: "text",
      title: "Vendas mensais sem ciclos",
      minutes: 15,
      sections: ["s1"],
      prompt: [
        { t: "p", text: "As vendas mensais de 2025 de uma loja foram:" },
        { t: "code", code: EX1_DATA },
        {
          t: "p",
          text: "Sem ciclos, calcule: (a) a média e o máximo; (b) o mês do máximo, com `argmax`; (c) os meses acima da média, com uma máscara; (d) as vendas acumuladas, com `cumsum`; (e) quanto cresceu, em percentagem, o segundo semestre face ao primeiro.",
        },
      ],
      fields: [
        {
          id: "code",
          label: "Código e resultados de (a) a (e)",
          rows: 10,
          mono: true,
          placeholder: "print(vendas.mean(), vendas.max())   # …\nprint(meses[vendas.argmax()])          # …\n…",
        },
      ],
      criteria: [
        "(a) Média 1117.5 e máximo 1510, sem ciclos",
        "(b) Mês do máximo com `meses[vendas.argmax()]`: ago",
        "(c) Meses acima da média com uma máscara: mai, jun, jul, ago, set, dez",
        "(d) `cumsum`: o último valor é o total do ano, 13 410 €",
        "(e) O segundo semestre vendeu mais 20,6% do que o primeiro (`vendas[6:]` contra `vendas[:6]`)",
      ],
      solution: [
        {
          t: "code",
          code: `print(vendas.mean(), vendas.max(), meses[vendas.argmax()])   # 1117.5 1510 ago
print(meses[vendas > vendas.mean()])     # ['mai' 'jun' 'jul' 'ago' 'set' 'dez']
print(vendas.cumsum())
# [  820  1580  2490  3540  4740  6080  7560  9070 10260 11240 12110 13410]
print(round((vendas[6:].sum() - vendas[:6].sum()) / vendas[:6].sum() * 100, 1))   # 20.6`,
        },
        { t: "p", text: "O segundo semestre vendeu mais 20,6% do que o primeiro. O total do ano (13 410 €) é o último valor do `cumsum`." },
      ],
    },
    {
      id: "e2",
      num: 2,
      part: "A",
      session: "w1s1",
      kind: "text",
      title: "Medir a velocidade da vetorização",
      minutes: 15,
      sections: ["s1"],
      prompt: [
        {
          t: "p",
          text: "Meça a diferença de velocidade entre `sum(lista)` e `arr.sum()` para um milhão de números, usando `time.perf_counter()`. Repita três vezes. Quantas vezes mais rápido foi o NumPy no seu computador ou no Colab?",
        },
      ],
      fields: [
        {
          id: "code",
          label: "Código",
          rows: 8,
          mono: true,
          placeholder: "import time\nlista = list(range(1_000_000))\narr = np.arange(1_000_000)\n…",
        },
        { id: "r", label: "Tempos das três medições e quantas vezes mais rápido", rows: 4 },
      ],
      criteria: [
        "Mede `sum(lista)` e `arr.sum()` com `time.perf_counter()` para um milhão de números",
        "Repete a medição três vezes",
        "Indica quantas vezes mais rápido foi o NumPy: qualquer resultado entre 5 e 50 vezes é normal",
        "Conclui pela ordem de grandeza, não pelo valor exato",
      ],
      solution: [
        {
          t: "p",
          text: "Os valores dependem da máquina. No teste feito para este gabarito: `sum(lista)` 7,8 ms; `arr.sum()` 0,76 ms, cerca de 10 vezes mais rápido. Qualquer resultado entre 5 e 50 vezes é normal; o que importa é a ordem de grandeza.",
        },
      ],
    },
    {
      id: "e3",
      num: 3,
      part: "A",
      session: "w1s1",
      kind: "text",
      title: "Notas: eixos e broadcasting",
      minutes: 20,
      sections: ["s1"],
      prompt: [
        { t: "p", text: "As notas de 3 alunos (linhas) em 4 testes (colunas):" },
        { t: "code", code: EX3_DATA },
        {
          t: "p",
          text: "Calcule (a) a média de cada teste; (b) a média de cada aluno; (c) a diferença de cada nota para a média do seu teste, numa só operação. (d) Explique, com as formas dos arrays, porque é que (c) funciona.",
        },
      ],
      fields: [
        { id: "code", label: "(a) a (c) Código e resultados", rows: 8, mono: true, placeholder: "print(notas.mean(axis=…).round(2))\n…" },
        { id: "d", label: "(d) Porque é que (c) funciona", rows: 4 },
      ],
      criteria: [
        "(a) Média de cada teste com `axis=0`: [14. 13.33 14.67 14.67]",
        "(b) Média de cada aluno com `axis=1`: [14.25 10.75 17.5]",
        "(c) `notas - notas.mean(axis=0)`, numa só operação",
        "(d) `notas` tem forma (3, 4) e as médias (4,): comparando da direita, 4 = 4, e a dimensão em falta é tratada como 1; a linha das médias é repetida para cada aluno",
      ],
      solution: [
        {
          t: "code",
          code: `print(notas.mean(axis=0).round(2))   # [14.   13.33 14.67 14.67]  média de cada teste
print(notas.mean(axis=1).round(2))   # [14.25 10.75 17.5 ]       média de cada aluno
print((notas - notas.mean(axis=0)).round(2))
# [[ 0.   -1.33  1.33  0.33]
#  [-4.   -2.33 -5.67 -1.67]
#  [ 4.    3.67  4.33  1.33]]`,
        },
        {
          t: "p",
          text: "(d) `notas` tem forma (3, 4) e `notas.mean(axis=0)` tem forma (4,). Comparando da direita, 4 = 4, e a dimensão em falta é tratada como 1: o NumPy repete a linha das médias para cada aluno. O segundo aluno ficou abaixo da média em todos os testes.",
        },
      ],
    },
    {
      id: "e4",
      num: 4,
      part: "B",
      session: "w1s2",
      kind: "text",
      title: "Inspecionar e limpar o catálogo",
      minutes: 20,
      sections: ["s2"],
      prompt: [
        { t: "p", text: "Os exercícios 4 a 7 usam este catálogo, que tem problemas de propósito:" },
        { t: "code", code: PRODUTOS },
        {
          t: "p",
          text: "Inspecione e limpe: (a) quantas linhas e colunas há, quantos valores faltam em cada coluna e quantas linhas estão repetidas; (b) veja os valores distintos da coluna `loja` com `unique()` e corrija-os com `.str.strip().str.title()`; (c) remova os duplicados; (d) considere stock em falta como 0 e remova os produtos sem preço. Quantas linhas ficam?",
        },
      ],
      fields: [
        { id: "code", label: "Código e resultados", rows: 12, mono: true, placeholder: "print(p.shape, p.isna().sum().to_dict(), p.duplicated().sum())\n…" },
        { id: "r", label: "Quantas linhas ficam e o que saiu", rows: 3 },
      ],
      criteria: [
        "(a) (10, 6); falta 1 valor em `preco` e 1 em `stock`; 1 linha repetida",
        "(b) `unique()` mostra 5 variantes de loja; com `.str.strip().str.title()` ficam Lisboa, Porto e Faro",
        "(c) `drop_duplicates()` remove o Driver repetido",
        "(d) `fillna(0)` no stock e `dropna(subset=[\"preco\"])`: ficam 8 linhas (saiu o Putter, sem preço)",
      ],
      solution: [
        {
          t: "code",
          code: `print(p.shape, p.isna().sum().to_dict(), p.duplicated().sum())
# (10, 6) {'codigo': 0, 'nome': 0, 'categoria': 0, 'loja': 0, 'preco': 1, 'stock': 1} 1
print(p["loja"].unique())        # ['Lisboa', 'lisboa ', 'Porto', 'Faro', ' Porto']
p = p.drop_duplicates()
p["loja"] = p["loja"].str.strip().str.title()
print(p["loja"].unique())        # ['Lisboa', 'Porto', 'Faro']
p["stock"] = p["stock"].fillna(0)
p = p.dropna(subset=["preco"])
print(p.shape)                   # (8, 6)`,
        },
        {
          t: "p",
          text: "Ficam 8 produtos: saiu o Driver repetido e o Putter sem preço. Sem limpar o texto, o pandas contaria cinco lojas em vez de três.",
        },
      ],
    },
    {
      id: "e5",
      num: 5,
      part: "B",
      session: "w1s2",
      kind: "text",
      title: "Selecionar com loc, iloc e filtros",
      minutes: 15,
      sections: ["s2"],
      prompt: [
        {
          t: "p",
          text: "Com a tabela limpa: (a) mostre o nome e o preço dos produtos da categoria Tacos, com `loc`; (b) mostre as 3 primeiras linhas e as 2 primeiras colunas, com `iloc`; (c) mostre os produtos acima de 100 € com menos de 10 unidades em stock.",
        },
      ],
      fields: [{ id: "code", label: "Código e resultados", rows: 10, mono: true, placeholder: "print(p.loc[…, [\"nome\", \"preco\"]])\n…" }],
      criteria: [
        "(a) `loc` com a condição e a lista de colunas: Driver 349.0 e Ferro 7 129.0",
        "(b) `iloc[:3, :2]`: P01, P02 e P03 com código e nome",
        "(c) Duas condições com `&` e parênteses: Driver, Ferro 7, Saco de golfe e Carrinho",
      ],
      solution: [
        {
          t: "code",
          code: `print(p.loc[p["categoria"] == "Tacos", ["nome", "preco"]])   # Driver 349.0, Ferro 7 129.0
print(p.iloc[:3, :2])                                         # P01, P02, P03 com código e nome
print(p[(p["preco"] > 100) & (p["stock"] < 10)][["nome", "preco", "stock"]])
#             nome  preco  stock
# 2         Driver  349.0    6.0
# 3        Ferro 7  129.0    0.0
# 4  Saco de golfe  189.0    8.0
# 9       Carrinho  229.0    3.0`,
        },
      ],
    },
    {
      id: "e6",
      num: 6,
      part: "B",
      session: "w1s2",
      kind: "text",
      title: "Valor em stock por categoria",
      minutes: 15,
      sections: ["s2", "s3"],
      prompt: [
        {
          t: "p",
          text: "Crie a coluna `valor_stock = preco × stock`. Por categoria, calcule o número de produtos, o preço médio e o valor total em stock, ordenado do maior para o menor valor. Dica: `agg(produtos=(\"nome\", \"count\"), ...)`.",
        },
      ],
      fields: [{ id: "code", label: "Código e resultado", rows: 10, mono: true, placeholder: "p[\"valor_stock\"] = …\nres = (p.groupby(\"categoria\")\n        .agg(produtos=(\"nome\", \"count\"), …)" }],
      criteria: [
        "Coluna `valor_stock` calculada de forma vetorizada, sem `for`",
        "`groupby` por categoria com `agg` nomeado: produtos, preço médio e valor em stock",
        "Ordenado do maior para o menor: Vestuário 4754.0, Acessórios 3865.5, Sacos 2199.0, Tacos 2094.0",
      ],
      solution: [
        {
          t: "code",
          code: `p["valor_stock"] = p["preco"] * p["stock"]
res = (p.groupby("categoria")
        .agg(produtos=("nome", "count"), preco_medio=("preco", "mean"), valor_stock=("valor_stock", "sum"))
        .round(2)
        .sort_values("valor_stock", ascending=False))
print(res)
#             produtos  preco_medio  valor_stock
# Vestuário          2        35.95       4754.0
# Acessórios         2        22.20       3865.5
# Sacos              2       209.00       2199.0
# Tacos              2       239.00       2094.0`,
        },
        { t: "p", text: "Os Tacos têm o preço médio mais alto mas o menor valor em stock, porque há poucas unidades." },
      ],
    },
    {
      id: "e7",
      num: 7,
      part: "B",
      session: "w1s2",
      kind: "text",
      title: "Juntar os fornecedores",
      minutes: 15,
      sections: ["s3"],
      prompt: [
        {
          t: "p",
          text: "Junte o catálogo a esta tabela de fornecedores com `how=\"left\"`. Confirme o número de linhas antes e depois, e encontre os produtos sem fornecedor.",
        },
        { t: "code", code: FORN },
      ],
      fields: [{ id: "code", label: "Código e resultados", rows: 8, mono: true, placeholder: "f = pd.read_csv(io.StringIO(FORN))\nj = p.merge(…)\n…" }],
      criteria: [
        "`merge` com `on=\"categoria\"` e `how=\"left\"`",
        "Confirma o número de linhas: 8 antes e 8 depois",
        "Encontra os produtos sem fornecedor com `isna()`: Saco de golfe e Carrinho, da categoria Sacos",
      ],
      solution: [
        {
          t: "code",
          code: `f = pd.read_csv(io.StringIO(FORN))
j = p.merge(f, on="categoria", how="left")
print(len(p), len(j))                                 # 8 8
print(j[j["fornecedor"].isna()][["nome", "categoria"]])
#             nome categoria
# 4  Saco de golfe     Sacos
# 7       Carrinho     Sacos`,
        },
        { t: "p", text: "Com `how=\"inner\"` os dois produtos da categoria Sacos teriam desaparecido sem aviso." },
      ],
    },
    {
      id: "e8",
      num: 8,
      part: "B",
      session: "w2s1",
      kind: "text",
      title: "Arrumar as visitas ao site",
      minutes: 15,
      sections: ["s4", "s3"],
      prompt: [
        {
          t: "p",
          text: "Esta tabela de visitas a um site não está arrumada. Passe-a para o formato longo e calcule a média de visitas por dia da semana.",
        },
        { t: "code", code: VISITAS },
      ],
      fields: [{ id: "code", label: "Código e resultados", rows: 8, mono: true, placeholder: "longo = visitas.melt(…)\n…" }],
      criteria: [
        "`melt` com `id_vars=\"semana\"`: forma (12, 3), com colunas semana, dia e visitas",
        "Média por dia: seg 127.7, ter 104.0, sab 311.7, dom 258.3",
      ],
      solution: [
        {
          t: "code",
          code: `longo = visitas.melt(id_vars="semana", var_name="dia", value_name="visitas")
print(longo.shape)   # (12, 3)
print(longo.groupby("dia", sort=False)["visitas"].mean().round(1))
# seg 127.7 · ter 104.0 · sab 311.7 · dom 258.3`,
        },
      ],
    },
    {
      id: "e9",
      num: 9,
      part: "C",
      session: "w2s1",
      kind: "text",
      title: "Dois gráficos com título e unidades",
      minutes: 20,
      sections: ["s5"],
      prompt: [
        {
          t: "p",
          text: "Faça dois gráficos, com título e unidades: (a) barras horizontais do valor em stock por categoria (exercício 6), ordenadas; (b) linha das vendas mensais do exercício 1, com uma linha horizontal tracejada na média (`ax.axhline`).",
        },
      ],
      fields: [
        { id: "a", label: "(a) Barras horizontais", rows: 6, mono: true, placeholder: "fig, ax = plt.subplots(figsize=(7, 4))\nax.barh(…)\n…" },
        { id: "b", label: "(b) Linha com a média", rows: 8, mono: true, placeholder: "fig, ax = plt.subplots(figsize=(8, 4))\nax.plot(meses, vendas, marker=\"o\")\n…" },
      ],
      criteria: [
        "(a) Barras horizontais ordenadas pelo valor, com a maior em cima",
        "(a) Título e eixo com unidade, por exemplo \"Valor (€)\"",
        "(b) Linha das vendas mensais, com uma linha horizontal tracejada na média (`ax.axhline`)",
        "(b) Título e eixo vertical com unidade, por exemplo \"Vendas (€)\"",
      ],
      solution: [
        {
          t: "code",
          code: `fig, ax = plt.subplots(figsize=(7, 4))
ax.barh(res.index[::-1], res["valor_stock"][::-1])   # invertido para o maior ficar em cima
ax.set_title("Valor do stock por categoria")
ax.set_xlabel("Valor (€)")
fig.tight_layout()

fig, ax = plt.subplots(figsize=(8, 4))
ax.plot(meses, vendas, marker="o")
ax.axhline(vendas.mean(), linestyle="--", color="gray", label=f"Média: {vendas.mean():.0f} €")
ax.set_title("Vendas mensais em 2025")
ax.set_ylabel("Vendas (€)")
ax.set_ylim(0, 1700)
ax.legend()
fig.tight_layout()`,
        },
      ],
    },
    {
      id: "e10",
      num: 10,
      part: "C",
      session: "w2s1",
      kind: "text",
      title: "O gráfico do colega",
      minutes: 10,
      sections: ["s5"],
      prompt: [
        {
          t: "p",
          text: "Um colega mostra um gráfico de barras em 3D com as vendas de cinco lojas por ordem alfabética, cada barra de uma cor, o eixo vertical a começar nos 900 e o título \"Dados\". Identifique quatro problemas e diga como corrigir cada um.",
        },
      ],
      fields: [
        { id: "p1", label: "Problema 1 e correção", rows: 2 },
        { id: "p2", label: "Problema 2 e correção", rows: 2 },
        { id: "p3", label: "Problema 3 e correção", rows: 2 },
        { id: "p4", label: "Problema 4 e correção", rows: 2 },
      ],
      criteria: [
        "O eixo a começar nos 900 exagera as diferenças: as barras têm de começar no zero",
        "O 3D distorce o tamanho das barras: usar barras planas",
        "A ordem alfabética obriga a procurar a maior: ordenar pelo valor",
        "As cores não significam nada: uma só cor, ou destacar apenas a loja que interessa",
        "\"Dados\" não diz nada: título com a mensagem e eixo com unidade (quatro dos cinco chegam)",
      ],
      solution: [
        {
          t: "p",
          text: "(1) O eixo a começar nos 900 exagera as diferenças: as barras têm de começar no zero. (2) O 3D distorce o tamanho das barras: usar barras planas. (3) A ordem alfabética obriga a procurar a maior: ordenar pelo valor. (4) As cores não significam nada: usar uma só cor, ou destacar apenas a loja que interessa. (5) \"Dados\" não diz nada: título com a mensagem e eixo com unidade, como \"Vendas por loja, 1.º trimestre (€)\". Quatro destes cinco chegam para a cotação completa.",
        },
      ],
    },
    {
      id: "e11",
      num: 11,
      part: "D",
      session: "w2s2",
      kind: "text",
      title: "Análise das gorjetas (tips)",
      minutes: 40,
      sections: ["s2", "s3", "s5"],
      prompt: [
        {
          t: "p",
          text: "O conjunto *tips* tem 244 contas de um restaurante, registadas por um empregado de mesa (Bryant & Smith, 1995). Carregue-o com:",
        },
        { t: "code", code: TIPS },
        {
          t: "p",
          text: "Responda com código e uma frase cada: (a) há valores em falta? (b) crie a coluna `pct_gorjeta` (gorjeta em % da conta) e descreva a sua distribuição; (c) em que dia da semana a gorjeta percentual média é maior, e em qual é menor? (d) fumadores dão mais gorjeta? Compare média e mediana; (e) encontre a maior gorjeta percentual e diga se é um caso típico; (f) faça o gráfico que melhor mostra a resposta à alínea (b).",
        },
      ],
      fields: [
        { id: "code", label: "Código", rows: 14, mono: true, placeholder: "print(tips.shape, tips.isna().sum().sum())\ntips[\"pct_gorjeta\"] = …\n…" },
        { id: "r", label: "Uma frase por alínea, de (a) a (f)", rows: 8 },
      ],
      criteria: [
        "(a) Não há valores em falta: (244, 7) e 0",
        "(b) `pct_gorjeta = tip / total_bill * 100`; gorjeta típica entre 13% e 19% (quartis), mediana 15,5%, poucos valores altos puxam a média (16,1%) para cima",
        "(c) Maior à sexta (17,0%), menor ao sábado (15,3%), com a ressalva de que só há 19 contas de sexta",
        "(d) A média dos fumadores é maior (16,3 contra 15,9) mas a mediana é menor (15,4 contra 15,6): a diferença vem de valores extremos",
        "(e) 71%: uma conta de 7,25 € com 5,15 € de gorjeta, um caso atípico",
        "(f) Um histograma de `pct_gorjeta`",
      ],
      solution: [
        {
          t: "code",
          code: `print(tips.shape, tips.isna().sum().sum())     # (244, 7) 0  -> sem valores em falta
tips["pct_gorjeta"] = tips["tip"] / tips["total_bill"] * 100
print(tips["pct_gorjeta"].describe().round(1))
# média 16.1, mediana 15.5, mínimo 3.6, máximo 71.0
print(tips.groupby("day")["pct_gorjeta"].mean().round(1).sort_values())
# Sat 15.3 · Thur 16.1 · Sun 16.7 · Fri 17.0
print(tips.groupby("smoker")["pct_gorjeta"].agg(["mean", "median", "count"]).round(1))
#         mean  median  count
# No      15.9    15.6    151
# Yes     16.3    15.4     93
print(tips.loc[tips["pct_gorjeta"].idxmax()])  # conta de 7.25 com gorjeta de 5.15: 71%`,
        },
        {
          t: "p",
          text: "(a) Não há valores em falta. (b) A gorjeta típica anda entre 13% e 19% da conta (quartis), com mediana de 15,5%; há poucos valores muito altos que puxam a média para cima. (c) Maior à sexta (17,0%), menor ao sábado (15,3%); mas só há 19 contas de sexta, por isso essa média é pouco fiável. (d) A média dos fumadores é maior, mas a mediana é menor: a diferença vem de alguns valores extremos, não de um padrão geral. (e) Os 71% são uma conta de 7,25 € com 5,15 € de gorjeta: um caso atípico, que não representa o padrão. (f) Um histograma de `pct_gorjeta`.",
        },
      ],
    },
    {
      id: "e12",
      num: 12,
      part: "D",
      session: "w2s2",
      kind: "text",
      title: "O exercício 11 do M2 com pandas",
      minutes: 20,
      sections: ["s3", "s6"],
      prompt: [
        {
          t: "p",
          text: "Refaça o exercício 11 do M2 (média mensal por loja e mês com mais vendas) com pandas, em cinco linhas no máximo, e confirme que os resultados são iguais aos do M2.",
        },
      ],
      fields: [
        { id: "code", label: "Código (cinco linhas no máximo) e resultados", rows: 7, mono: true, placeholder: "v = pd.read_csv(io.StringIO(DADOS))   # os dados da secção 6\n…" },
      ],
      criteria: [
        "No máximo cinco linhas de pandas, sem ciclos",
        "Média mensal por loja: Faro 583.33, Lisboa 1610.0, Porto 1125.0",
        "Mês com mais vendas: mar (jan 2890, fev 3465, mar 3600)",
        "Confirma que os resultados são iguais aos do M2",
      ],
      solution: [
        {
          t: "code",
          code: `v = pd.read_csv(io.StringIO(DADOS))                       # os dados da secção 6
print(v.groupby("loja")["valor"].mean().round(2))         # Faro 583.33, Lisboa 1610.0, Porto 1125.0
por_mes = v.groupby("mes", sort=False)["valor"].sum()     # jan 2890, fev 3465, mar 3600
print(por_mes.idxmax())                                   # mar`,
        },
        { t: "p", text: "Os resultados são iguais aos do M2." },
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
            kind: "mcq", id: "p1", num: 1, section: "s1", points: 1,
            q: "O que dá `np.array([1, 2, 3]) * 2`?",
            options: ["`[1, 2, 3, 1, 2, 3]`", "`[2 4 6]`", "`12`", "Dá erro."],
            answer: 1,
            explain: "A operação é vetorizada: multiplica cada elemento. Repetir a lista é o que faz `[1, 2, 3] * 2` com uma lista.",
          },
          {
            kind: "mcq", id: "p2", num: 2, section: "s1", points: 1,
            q: "Qual é o `shape` de `np.zeros((3, 4))`?",
            options: ["`(4, 3)`", "`12`", "`(3, 4)`", "`(3,)`"],
            answer: 2,
            explain: "3 linhas e 4 colunas.",
          },
          {
            kind: "mcq", id: "p3", num: 3, section: "s1", points: 1,
            q: "Com `m = np.array([[1, 2], [3, 4]])`, o que dá `m.sum(axis=0)`?",
            options: ["`[4 6]`", "`[3 7]`", "`10`", "`[1 2]`"],
            answer: 0,
            explain: "`axis=0` dá um resultado por coluna: 1 + 3 = 4 e 2 + 4 = 6. `[3 7]` seria `axis=1`.",
          },
          {
            kind: "mcq", id: "p4", num: 4, section: "s2", points: 1,
            q: "Qual é a diferença entre `df.loc` e `df.iloc`?",
            options: [
              "`loc` é mais rápido.",
              "`loc` seleciona por nomes e rótulos; `iloc` por posições.",
              "`loc` só seleciona linhas; `iloc` só colunas.",
              "Não há diferença.",
            ],
            answer: 1,
            explain: "`loc` usa os rótulos do índice e os nomes das colunas; `iloc` as posições 0, 1, 2…",
          },
          {
            kind: "mcq", id: "p5", num: 5, section: "s2", points: 1,
            q: "Que linha conta os valores em falta de cada coluna?",
            options: ["`df.count()`", "`df.dropna()`", "`df.isna().sum()`", "`df.describe()`"],
            answer: 2,
            explain: "`isna()` marca cada valor em falta com `True` e `sum()` conta-os por coluna.",
          },
          {
            kind: "mcq", id: "p6", num: 6, section: "s2", points: 1,
            q: "Qual destes filtros está escrito corretamente?",
            options: [
              "`df[df[\"a\"] > 5 and df[\"b\"] == \"x\"]`",
              "`df[(df[\"a\"] > 5) & (df[\"b\"] == \"x\")]`",
              "`df[df[\"a\"] > 5 & df[\"b\"] == \"x\"]`",
              "`df.filter(a > 5, b == \"x\")`",
            ],
            answer: 1,
            explain: "Combina-se com `&`, com cada condição entre parênteses. `and` dá erro, e sem parênteses o `&` é avaliado antes das comparações.",
          },
          {
            kind: "mcq", id: "p7", num: 7, section: "s3", points: 1,
            q: "O que devolve `df.groupby(\"loja\")[\"valor\"].mean()`?",
            options: [
              "A média de todos os valores da tabela.",
              "Uma tabela com as linhas ordenadas por loja.",
              "Uma Series com a média de `valor` para cada loja.",
              "O número de lojas.",
            ],
            answer: 2,
            explain: "Dividir por loja, aplicar a média e combinar: uma Series com uma linha por loja.",
          },
          {
            kind: "mcq", id: "p8", num: 8, section: "s5", points: 1,
            q: "Que gráfico mostra melhor como se distribuem os valores de uma só variável?",
            options: ["Histograma", "Linha", "Circular", "Dispersão"],
            answer: 0,
            explain: "\"Como se distribuem os valores?\" pede um histograma (`ax.hist`).",
          },
        ],
      },
      {
        title: "Grupo II — Resposta curta (8 valores)",
        note: "Sem consulta e sem correr código. 2 valores cada, 3 a 5 linhas por resposta.",
        questions: [
          {
            kind: "open", id: "p9", num: 9, section: "s1", points: 2, rows: 5,
            q: "O que é a vetorização no NumPy e porque é mais rápida do que um ciclo em Python?",
            criteria: [
              { id: "c1", text: "Definição", points: 1 },
              { id: "c2", text: "Razão da velocidade", points: 1 },
            ],
            model:
              "Aplicar uma operação a um array inteiro de uma vez, sem ciclos escritos em Python. É mais rápida porque o ciclo corre em código C compilado, sobre dados do mesmo tipo guardados lado a lado na memória.",
          },
          {
            kind: "open", id: "p10", num: 10, section: "s1", points: 2, rows: 5,
            q: "Explique o broadcasting com um exemplo: o que acontece ao somar um array de forma (3, 4) com um de forma (4,)? E com um de forma (3,)?",
            criteria: [
              { id: "c1", text: "Caso que funciona explicado", points: 1 },
              { id: "c2", text: "Caso que falha", points: 1 },
            ],
            model:
              "(3, 4) + (4,): funciona, porque a última dimensão é igual; o array (4,) é repetido em cada uma das 3 linhas. (3, 4) + (3,): dá erro, porque 4 ≠ 3. Para somar por linha usa-se a forma (3, 1).",
          },
          {
            kind: "open", id: "p11", num: 11, section: "s2", points: 2, rows: 5,
            q: "Indique três formas de tratar valores em falta e um risco de cada uma.",
            criteria: [
              { id: "c1", text: "Três formas", points: 1 },
              { id: "c2", text: "Um risco de cada", points: 1 },
            ],
            model:
              "Apagar a linha (`dropna`): perde informação e pode enviesar se as faltas não forem aleatórias. Preencher com média ou mediana (`fillna`): inventa um valor e reduz a variabilidade. Ir buscar o valor certo à fonte: é o melhor, mas custa tempo e nem sempre é possível.",
          },
          {
            kind: "open", id: "p12", num: 12, section: "s4", points: 2, rows: 5,
            q: "Quais são as três regras dos dados arrumados (Wickham, 2014)? Dê um exemplo de uma tabela que não as cumpre.",
            criteria: [
              { id: "c1", text: "Três regras", points: 1 },
              { id: "c2", text: "Exemplo adequado", points: 1 },
            ],
            model:
              "Cada variável numa coluna; cada observação numa linha; cada tipo de unidade observada na sua tabela. Exemplo: vendas com uma coluna por mês (jan, fev, mar), em que \"mês\" é uma variável espalhada por várias colunas.",
          },
        ],
      },
      {
        title: "Grupo III — Análise de dados (4 valores)",
        note: "Pode usar o Colab, mas não a internet nem assistentes de IA.",
        questions: [
          {
            kind: "open", id: "p13", num: 13, section: "s3", points: 4, rows: 16,
            q: "Encomendas de uma loja online em setembro de 2026:",
            context: [
              { t: "code", code: ENCOMENDAS },
              {
                t: "p",
                text: "Com pandas: (a) calcule a receita total; (b) a receita por produto, ordenada; (c) o cliente com mais encomendas e o cliente com mais receita, comentando a diferença numa frase; (d) faça um gráfico de barras da receita por produto, com título e unidades.",
              },
            ],
            criteria: [
              { id: "c1", text: "Coluna de receita e total certo", points: 1 },
              { id: "c2", text: "Receita por produto agrupada e ordenada", points: 1 },
              { id: "c3", text: "Cliente com mais encomendas e com mais receita, com comentário", points: 1 },
              { id: "c4", text: "Gráfico de barras ordenado, com título e unidades", points: 1 },
            ],
            model:
              "A Ana faz mais encomendas, mas a Marta gera mais receita, com uma só compra grande (o Driver). Quem compra mais vezes nem sempre é quem vale mais.",
            modelBlocks: [
              {
                t: "code",
                code: `e = pd.read_csv(io.StringIO(ENCOMENDAS))
e["receita"] = e["quantidade"] * e["preco_unit"]
print(round(e["receita"].sum(), 2))                       # 975.7

por_produto = e.groupby("produto")["receita"].sum().sort_values(ascending=False).round(2)
print(por_produto)
# Driver 349.0 · Bola de golfe (12) 249.0 · Saco de golfe 189.0 · Polo técnico 149.7 · Luva 39.0

print(e["cliente"].value_counts().idxmax())               # Ana (4 encomendas)
print(e.groupby("cliente")["receita"].sum().idxmax())     # Marta (373.90 €)

fig, ax = plt.subplots(figsize=(7, 4))
ax.barh(por_produto.index[::-1], por_produto.values[::-1])
ax.set_title("Receita por produto, setembro de 2026")
ax.set_xlabel("Receita (€)")
fig.tight_layout()`,
              },
            ],
          },
        ],
      },
    ],
  },
  examReviewNote:
    "Se a nota ficar abaixo de 14: rever as secções das perguntas falhadas (1, 2, 3, 9 e 10 → secção 1, NumPy; 4, 5, 6 e 11 → secção 2, pandas; 7 e 13 → secção 3, agrupar e juntar tabelas; 12 → secção 4, dados arrumados; 8 e 13 → secção 5, gráficos com Matplotlib) e repetir a prova uma semana depois.",

  // ---------------------------------------------------------------- SIMULADO DE TREINO (banco extra da plataforma)
  practice: {
    mcq: [
      { id: "q1", section: "s1", q: "O que dá `np.arange(0, 10, 3)`?", options: ["`[0 3 6 9]`", "`[3 6 9]`", "`[0 3 6]`", "`[0 3 6 9 12]`"], answer: 0, explain: "Começa em 0, avança de 3 em 3 e para antes de 10, como o `range`." },
      { id: "q2", section: "s1", q: "Com `m = np.array([[1, 2, 3], [4, 5, 6]])`, o que dá `m.sum(axis=1)`?", options: ["`[5 7 9]`", "`[ 6 15]`", "`21`", "`[1 4]`"], answer: 1, explain: "`axis=1` dá um resultado por linha: 1 + 2 + 3 = 6 e 4 + 5 + 6 = 15. `[5 7 9]` é `axis=0`." },
      { id: "q3", section: "s1", q: "Quantos elementos tem `np.linspace(0, 1, 5)`?", options: ["4", "5", "6", "10"], answer: 1, explain: "O terceiro argumento é o número de pontos: `[0. 0.25 0.5 0.75 1.]`, com as duas pontas incluídas." },
      { id: "q4", section: "s1", q: "Que forma tem `np.ones((3, 4)) + np.ones((3, 1))`?", options: ["`(3, 4)`", "`(3, 1)`", "`(3, 5)`", "Dá erro."], answer: 0, explain: "Da direita: 4 e 1 → 4 (a coluna é repetida); 3 e 3 → 3. É a forma certa para juntar um valor a cada linha." },
      { id: "q5", section: "s1", q: "Que forma tem um lote de 32 imagens a cores de 64 × 64 píxeis?", options: ["`(64, 64, 32)`", "`(32, 64, 64)`", "`(32, 64, 64, 3)`", "`(3, 64, 64)`"], answer: 2, explain: "Uma imagem a cores é (altura, largura, 3); um lote acrescenta a dimensão do número de imagens à frente." },
      { id: "q6", section: "s1", q: "Em `precos[precos > 20]`, o que é `precos > 20`?", options: ["Um número", "Uma máscara booleana: um array de `True`/`False`", "Uma lista de posições", "Um erro, porque não se compara um array com um número"], answer: 1, explain: "Usada como índice, a máscara guarda só os elementos verdadeiros. O pandas filtra da mesma forma." },
      { id: "q7", section: "s1", q: "Porque é que a vetorização é mais rápida do que um ciclo em Python?", options: ["Porque usa a GPU", "Porque o ciclo corre em C, sobre dados do mesmo tipo guardados lado a lado", "Porque arredonda os números", "Porque corre em paralelo em vários computadores"], answer: 1, explain: "No teste da aula, multiplicar um milhão de números por 2 foi cerca de 12 vezes mais rápido com NumPy." },
      { id: "q8", section: "s2", q: "Nos dados da aula, antes de limpar, quanto dá `df.duplicated().sum()`?", options: ["0", "1", "2", "19"], answer: 1, explain: "A linha de Faro, fevereiro, Vestuário, 220 aparece duas vezes; `duplicated` marca só a segunda." },
      { id: "q9", section: "s2", q: "Qual é a diferença entre uma Series e um DataFrame?", options: ["Uma Series é uma coluna de valores com um índice; um DataFrame é uma tabela de várias Series que partilham o índice", "Uma Series só guarda texto", "Um DataFrame não tem índice", "Não há diferença"], answer: 0, explain: "São as duas estruturas que o pandas traz (McKinney, 2010)." },
      { id: "q10", section: "s2", q: "Com os dados da aula, que colunas mostra `df.iloc[0:2, 1:3]`?", options: ["`mes` e `loja`", "`loja` e `categoria`", "`loja`, `categoria` e `valor`", "`categoria` e `valor`"], answer: 1, explain: "As posições 1 e 2 (o 3 fica de fora, como numa fatia de lista): `loja` e `categoria`." },
      { id: "q11", section: "s2", q: "Porque é que a aula preenche o valor em falta com a mediana do Vestuário e não com a média?", options: ["Porque a mediana é sempre igual ao valor real", "Porque a mediana é menos sensível a valores extremos", "Porque o `fillna` só aceita medianas", "Porque a média dá erro com valores em falta"], answer: 1, explain: "E mesmo assim é uma estimativa: o valor real era 400 €, não 415 €, e o preenchimento deve ficar no relatório." },
      { id: "q12", section: "s2", q: "Para o mês `2026-02`, quanto dá `pd.to_datetime(df[\"mes\"]).dt.quarter`?", options: ["2", "1", "4", "Dá erro, porque falta o dia"], answer: 1, explain: "Fevereiro está no 1.º trimestre. O `to_datetime` lê \"2026-02\" como 1 de fevereiro de 2026." },
      { id: "q13", section: "s3", q: "Se a aula não tivesse preenchido o valor em falta, quanto daria `df.groupby(\"loja\")[\"valor\"].count()` para o Porto?", options: ["6", "5", "0", "Dá erro"], answer: 1, explain: "`count` conta só os valores que não estão em falta. Depois do `fillna`, dá 6 para as três lojas." },
      { id: "q14", section: "s3", q: "Porque é que a primeira linha de `tabela.pct_change()` fica `NaN`?", options: ["Porque há valores em falta em janeiro", "Porque janeiro não tem mês anterior com que comparar", "Porque o pivot_table não soma janeiro", "Por um erro de arredondamento"], answer: 1, explain: "`pct_change` compara cada linha com a anterior." },
      { id: "q15", section: "s3", q: "Num `merge`, o que faz `how=\"left\"`?", options: ["Mantém só as linhas com par nas duas tabelas", "Mantém todas as linhas da tabela da esquerda, com ou sem par", "Mantém todas as linhas da tabela da direita", "Junta as tabelas lado a lado pela posição"], answer: 1, explain: "`\"inner\"` é que mantém só as que têm par nas duas." },
      { id: "q16", section: "s3", q: "A tabela da direita de um `merge` tem a loja Lisboa repetida duas vezes. O que acontece às 6 linhas de Lisboa da tabela de vendas?", options: ["Ficam 6, o pandas ignora a repetição", "Passam a 12, sem aviso", "O merge dá erro", "Ficam 3"], answer: 1, explain: "Cada linha junta-se a cada par: com os dados da aula, 18 linhas passam a 24. Por isso se confirma o número de linhas depois de juntar." },
      { id: "q17", section: "s4", q: "A tabela `largo` da aula tem 3 lojas e 3 colunas de meses. Que forma tem `largo.melt(id_vars=\"loja\")`?", options: ["`(3, 4)`", "`(9, 3)`", "`(12, 2)`", "`(3, 3)`"], answer: 1, explain: "Uma linha por loja e mês (3 × 3 = 9). Sem `var_name` nem `value_name`, as colunas chamam-se `loja`, `variable` e `value`." },
      { id: "q18", section: "s4", q: "Qual destas tabelas **não** está arrumada?", options: ["Uma linha por venda, com colunas mês, loja e valor", "Uma linha por aluno e uma coluna por teste (t1, t2, t3)", "Uma tabela de lojas com região e área", "Uma linha por encomenda, com cliente, produto e quantidade"], answer: 1, explain: "\"Teste\" é uma variável espalhada por várias colunas, como os meses na tabela larga da aula." },
      { id: "q19", section: "s5", q: "Que gráfico escolher para mostrar como evoluíram as vendas mês a mês?", options: ["Linha", "Histograma", "Dispersão", "Circular"], answer: 0, explain: "\"Como evoluiu ao longo do tempo?\" pede uma linha (`ax.plot`)." },
      { id: "q20", section: "s5", q: "Em `fig, eixos = plt.subplots(2, 2)`, o que é `eixos[1, 0]`?", options: ["A figura inteira", "O gráfico da linha 1, coluna 0 da grelha", "O eixo horizontal do primeiro gráfico", "A legenda"], answer: 1, explain: "A figura é a imagem inteira; cada eixo (`ax`) é um dos gráficos dentro dela. Na aula, `eixos[1, 0]` é o histograma." },
      { id: "q21", section: "s5", q: "Qual destas regras vem das boas práticas da aula?", options: ["Ordenar as barras por ordem alfabética", "Começar as barras no valor mínimo para realçar diferenças", "Ordenar as barras pelo valor e começá-las no zero", "Dar uma cor diferente a cada barra"], answer: 2, explain: "Barras cortadas exageram diferenças; a ordem pelo valor torna a comparação imediata; cores sem significado distraem." },
      { id: "q22", section: "s6", q: "Qual é a ordem do fluxo de qualquer análise, segundo a aula?", options: ["Limpar → carregar → mostrar → resumir", "Carregar → inspecionar → limpar → transformar → resumir → mostrar", "Mostrar → inspecionar → carregar → limpar", "Carregar → resumir → limpar → mostrar"], answer: 1, explain: "É também o fluxo da preparação de dados para um modelo, e o que pede o mini-projeto da Fase 0." },
      { id: "q23", section: "s6", q: "No relatório da secção 6, o Porto soma 3375 €; na secção 3 somava 3390 €. Porquê?", options: ["Erro de arredondamento", "Na secção 3, o valor em falta de fevereiro foi preenchido com 415 € em vez do valor real, 400 €", "A secção 6 ignora março", "O pivot_table soma de forma diferente do groupby"], answer: 1, explain: "Os dados da secção 6 são os do M2, com o valor real. É o risco de qualquer preenchimento." },
    ],
    tf: [
      { id: "v1", section: "s1", q: "`axis=0` dá um resultado por linha.", answer: false, explain: "`axis=0` percorre as linhas e dá um resultado por coluna; `axis=1` dá um por linha." },
      { id: "v2", section: "s1", q: "No broadcasting, o NumPy copia o array mais pequeno para a memória até ter o tamanho do maior.", answer: false, explain: "Estica-o sem copiar dados." },
      { id: "v3", section: "s1", q: "Todos os elementos de um array NumPy têm o mesmo tipo.", answer: true, explain: "É o que permite guardá-los lado a lado na memória e calcular depressa." },
      { id: "v4", section: "s1", q: "Somar arrays de formas (3, 4) e (3,) funciona, porque ambos têm 3 linhas.", answer: false, explain: "As formas comparam-se da direita: 4 ≠ 3 e nenhuma vale 1, por isso dá erro. Funcionaria com (3, 1)." },
      { id: "v5", section: "s2", q: "Num filtro do pandas, pode combinar-se condições com `and` e `or`.", answer: false, explain: "Dá `ValueError` (\"The truth value of a Series is ambiguous\"). Usa-se `&`, `|` e `~`, com cada condição entre parênteses." },
      { id: "v6", section: "s2", q: "`loc` seleciona pelos nomes e rótulos; `iloc` pelas posições.", answer: true, explain: "Por isso `df.iloc[0:2, 1:3]` usa números e `df.loc[condição, [\"mes\"]]` usa nomes." },
      { id: "v7", section: "s2", q: "Para calcular uma coluna nova, o normal é percorrer o DataFrame com um `for`.", answer: false, explain: "As operações aplicam-se à coluna inteira, como nos arrays NumPy." },
      { id: "v8", section: "s2", q: "Depois de `drop_duplicates()`, a tabela de vendas da aula fica com 18 linhas.", answer: true, explain: "Sai a linha repetida de Faro: 19 → 18." },
      { id: "v9", section: "s3", q: "`df.pivot_table(index=\"mes\", columns=\"loja\", values=\"valor\", aggfunc=\"sum\")` faz o mesmo que uma tabela dinâmica do Excel.", answer: true, explain: "Uma linha por mês, uma coluna por loja e a soma em cada célula." },
      { id: "v10", section: "s4", q: "Em dados arrumados, cada observação é uma linha e cada variável é uma coluna.", answer: true, explain: "A terceira regra: cada tipo de unidade observada tem a sua tabela (Wickham, 2014)." },
      { id: "v11", section: "s5", q: "Um gráfico de barras pode começar no valor mínimo para as diferenças se verem melhor.", answer: false, explain: "As barras começam sempre no zero: uma barra cortada exagera as diferenças." },
      { id: "v12", section: "s5", q: "Três lojas alinhadas num gráfico de dispersão provam que mais área dá mais vendas.", answer: false, explain: "As lojas maiores também estão nas cidades maiores. Correlação não é causalidade." },
    ],
  },

  // ---------------------------------------------------------------- CARTÕES
  flashcards: [
    { id: "f1", section: "s1", tag: "NumPy", front: "Array NumPy", back: "Uma tabela de números, todos do mesmo tipo, guardados lado a lado na memória, sobre a qual se fazem operações de uma vez só." },
    { id: "f2", section: "s1", tag: "NumPy", front: "Vetorização", back: "Aplicar uma operação ao array inteiro, sem ciclos em Python: `precos * 1.23`. É mais rápida porque o ciclo corre em C." },
    { id: "f3", section: "s1", tag: "NumPy", front: "Máscara booleana", back: "`precos > 20` dá um array de `True`/`False`; `precos[precos > 20]` guarda só os verdadeiros. O pandas filtra da mesma forma." },
    { id: "f4", section: "s1", tag: "NumPy", front: "`shape`, `ndim`, `dtype`", back: "Forma (dimensões), número de dimensões e tipo dos elementos. `np.array([[1, 2, 3], [4, 5, 6]])` → (2, 3), 2, int64." },
    { id: "f5", section: "s1", tag: "NumPy", front: "`axis=0` vs `axis=1`", back: "`axis=0` percorre as linhas e dá um resultado por coluna; `axis=1` dá um resultado por linha." },
    { id: "f6", section: "s1", tag: "NumPy", front: "`m[1, 2]`, `m[:, 0]`, `m[0]`", back: "Elemento da linha 1, coluna 2; a coluna 0 inteira; a linha 0 inteira." },
    { id: "f7", section: "s1", tag: "NumPy", front: "Criar arrays: `zeros`, `ones`, `arange`, `linspace`", back: "`np.zeros(3)` → [0. 0. 0.]; `np.arange(0, 10, 3)` → [0 3 6 9] (passo); `np.linspace(0, 1, 5)` → 5 pontos de 0 a 1, pontas incluídas." },
    { id: "f8", section: "s1", tag: "NumPy", front: "Regra do broadcasting", back: "As dimensões comparam-se da direita para a esquerda; são compatíveis se forem iguais ou se uma delas for 1. (3, 4) com (4,) funciona; com (3,) não." },
    { id: "f9", section: "s1", tag: "NumPy", front: "Tensor", back: "Nome que o PyTorch dá aos arrays. Uma imagem a cores é (altura, largura, 3); um lote de 32 é (32, altura, largura, 3)." },
    { id: "f10", section: "s2", tag: "pandas", front: "Series e DataFrame", back: "Series: uma coluna de valores com um índice. DataFrame: uma tabela de várias Series que partilham o mesmo índice." },
    { id: "f11", section: "s2", tag: "pandas", front: "As quatro perguntas antes de qualquer análise", back: "Quantas linhas e colunas há (`shape`), de que tipo é cada coluna (`info`), onde faltam valores (`isna().sum()`) e se há duplicados (`duplicated().sum()`)." },
    { id: "f12", section: "s2", tag: "pandas", front: "Três formas de tratar um valor em falta", back: "Apagar a linha (`dropna`), preencher com uma estimativa (`fillna`) ou ir buscar o valor certo à fonte. Qualquer preenchimento fica registado no relatório." },
    { id: "f13", section: "s2", tag: "pandas", front: "`loc` vs `iloc`", back: "`loc` seleciona pelos nomes (rótulos do índice e nomes das colunas); `iloc` pelas posições (0, 1, 2…)." },
    { id: "f14", section: "s2", tag: "pandas", front: "Combinar condições num filtro", back: "`&` (e), `|` (ou), `~` (não), com cada condição entre parênteses: `df[(df[\"valor\"] > 600) & (df[\"categoria\"] == \"Vestuário\")]`. `and`/`or` dão erro." },
    { id: "f15", section: "s2", tag: "pandas", front: "Colunas de datas", back: "`pd.to_datetime(df[\"mes\"])` converte texto em data; `.dt.quarter`, `.dt.month` extraem partes." },
    { id: "f16", section: "s2", tag: "pandas", front: "`io.StringIO`", back: "Faz um texto comportar-se como um ficheiro, para `pd.read_csv` o ler sem downloads." },
    { id: "f17", section: "s3", tag: "Agrupar", front: "Dividir, aplicar, combinar (Wickham, 2011)", back: "Dividir os dados em grupos, aplicar um cálculo a cada grupo e combinar os resultados. No pandas: `df.groupby(\"loja\")[\"valor\"].sum()`." },
    { id: "f18", section: "s3", tag: "Agrupar", front: "`agg`", back: "Aplica vários cálculos de uma vez: `df.groupby(\"loja\")[\"valor\"].agg([\"sum\", \"mean\", \"count\"])`. Com nomes: `agg(produtos=(\"nome\", \"count\"))`." },
    { id: "f19", section: "s3", tag: "Agrupar", front: "`pivot_table`", back: "A tabela dinâmica do Excel em código: `df.pivot_table(index=\"mes\", columns=\"loja\", values=\"valor\", aggfunc=\"sum\")`." },
    { id: "f20", section: "s3", tag: "Agrupar", front: "`pct_change`", back: "Variação de cada linha face à anterior. A primeira linha fica `NaN` porque não tem anterior." },
    { id: "f21", section: "s3", tag: "Juntar", front: "`merge` e `how`", back: "Junta as linhas com o mesmo valor na chave, como um `JOIN` em SQL. `\"left\"` mantém todas as da esquerda; `\"inner\"` só as que têm par nas duas." },
    { id: "f22", section: "s3", tag: "Juntar", front: "O cuidado depois de um `merge`", back: "Confirmar o número de linhas antes e depois: chaves repetidas na tabela da direita multiplicam linhas sem aviso." },
    { id: "f23", section: "s4", tag: "Arrumar", front: "As três regras dos dados arrumados (Wickham, 2014)", back: "Cada variável é uma coluna; cada observação é uma linha; cada tipo de unidade observada tem a sua tabela." },
    { id: "f24", section: "s4", tag: "Arrumar", front: "`melt` vs `pivot`", back: "`melt` passa do formato largo ao longo (arrumado); `pivot` ou `pivot_table` fazem o caminho inverso." },
    { id: "f25", section: "s4", tag: "Arrumar", front: "Regra prática do formato", back: "Arrumar os dados logo no início; voltar ao formato largo só para apresentar uma tabela a pessoas." },
    { id: "f26", section: "s5", tag: "Gráficos", front: "Figura e eixos", back: "A figura (`fig`) é a imagem inteira; os eixos (`ax`) são cada um dos gráficos dentro dela. `fig, ax = plt.subplots()`." },
    { id: "f27", section: "s5", tag: "Gráficos", front: "Os quatro gráficos essenciais", back: "Evolução no tempo → linha (`plot`); qual é maior → barras (`bar`, `barh`); distribuição → histograma (`hist`); relação entre duas variáveis → dispersão (`scatter`)." },
    { id: "f28", section: "s5", tag: "Gráficos", front: "Boas práticas (Tufte, 2001; Wilke, 2019)", back: "Título que diz o que se vê e eixos com unidades; barras desde o zero; barras ordenadas pelo valor; nada de 3D, sombras ou cores sem significado." },
    { id: "f29", section: "s5", tag: "Gráficos", front: "Dispersão com poucos pontos", back: "Três lojas alinhadas não provam que mais área dá mais vendas. Correlação não é causalidade (M6)." },
    { id: "f30", section: "s6", tag: "Fluxo", front: "O fluxo de qualquer análise", back: "Carregar → inspecionar → limpar → transformar → resumir → mostrar." },
    { id: "f31", section: "s6", tag: "Fluxo", front: "Verificar uma análise reescrita", back: "Quando se refaz uma análise com outra ferramenta, os resultados têm de coincidir: o relatório do M2 com pandas dá os mesmos 9955.00 €." },
  ],

  // ---------------------------------------------------------------- NOTEBOOK
  notebook: {
    filename: "M3 — exercícios",
    cells: [
      {
        type: "md",
        source:
          "# M3 — NumPy, pandas e Matplotlib\n\nExemplos da aula (correr pela ordem, no mesmo notebook) e os exercícios 1 a 12. Guardar no Drive, na pasta da Fase 0.",
      },
      { type: "code", source: IMPORTS },
      { type: "md", source: "## 1. NumPy" },
      { type: "code", source: NP_VET.replace("import numpy as np\n\n", "") },
      { type: "code", source: NP_ND },
      { type: "code", source: NP_CREATE },
      { type: "code", source: NP_BC },
      { type: "md", source: "## 2. pandas: os dados, inspecionar, limpar, selecionar, criar colunas" },
      { type: "code", source: `${VENDAS_CSV}\n\ndf = pd.read_csv(io.StringIO(VENDAS_CSV))` },
      { type: "code", source: `${PD_INSPECT}\ndf.info()` },
      { type: "code", source: PD_CLEAN },
      { type: "code", source: PD_SELECT },
      { type: "code", source: PD_COLS },
      { type: "md", source: "## 3. Agrupar e juntar tabelas" },
      { type: "code", source: GB_CODE },
      { type: "code", source: PIVOT_CODE },
      { type: "code", source: MERGE_CODE },
      { type: "md", source: "## 4. Dados arrumados" },
      { type: "code", source: MELT_CODE },
      { type: "md", source: "## 5. Os quatro gráficos essenciais" },
      { type: "code", source: PLOT_CODE.replace("import matplotlib.pyplot as plt\n\n", "") },
      { type: "md", source: "## 6. O relatório do M2 refeito com pandas" },
      { type: "code", source: REPORT_CODE.replace("import io\nimport pandas as pd\n\n", "") },
      { type: "md", source: "## Exercício 1\n\nSem ciclos: (a) média e máximo; (b) mês do máximo com `argmax`; (c) meses acima da média; (d) `cumsum`; (e) crescimento do 2.º semestre face ao 1.º, em %." },
      { type: "code", source: `${EX1_DATA}\n\n# (a)\n# (b)\n# (c)\n# (d)\n# (e)\n` },
      { type: "md", source: "## Exercício 2\n\n`sum(lista)` contra `arr.sum()` para um milhão de números, com `time.perf_counter()`, três vezes." },
      { type: "code", source: "import time\n\nlista = list(range(1_000_000))\narr = np.arange(1_000_000)\n\nfor _ in range(3):\n    ...\n" },
      { type: "md", source: "## Exercício 3\n\n(a) média de cada teste; (b) média de cada aluno; (c) diferença de cada nota para a média do seu teste, numa só operação; (d) porque funciona." },
      { type: "code", source: `${EX3_DATA}\n\n# (a)\n# (b)\n# (c)\n` },
      { type: "md", source: "## Exercícios 4 a 7 — o catálogo\n\n4. Inspecionar e limpar. 5. `loc`, `iloc` e filtros. 6. Valor em stock por categoria. 7. Juntar os fornecedores." },
      { type: "code", source: `${PRODUTOS}\n\n# Exercício 4\n` },
      { type: "code", source: "# Exercício 5\n" },
      { type: "code", source: "# Exercício 6\n" },
      { type: "code", source: `${FORN}\n\n# Exercício 7\n` },
      { type: "md", source: "## Exercício 8\n\nPassar para o formato longo e calcular a média de visitas por dia da semana." },
      { type: "code", source: `${VISITAS}\n` },
      { type: "md", source: "## Exercício 9\n\n(a) Barras horizontais do valor em stock por categoria, ordenadas; (b) linha das vendas mensais do exercício 1 com a média tracejada (`ax.axhline`). Título e unidades nos dois." },
      { type: "code", source: "# (a)\n\n# (b)\n" },
      { type: "md", source: "## Exercício 10\n\nQuatro problemas do gráfico do colega e como corrigir cada um (resposta em texto):\n\n1. \n2. \n3. \n4. " },
      { type: "md", source: "## Exercício 11 — tips\n\n(a) valores em falta; (b) `pct_gorjeta` e a sua distribuição; (c) dia com a maior e a menor média; (d) fumadores: média e mediana; (e) a maior gorjeta percentual; (f) o gráfico certo para (b)." },
      { type: "code", source: `${TIPS}\n` },
      { type: "md", source: "## Exercício 12\n\nO exercício 11 do M2 com pandas, em cinco linhas no máximo." },
      { type: "code", source: `${DADOS_CSV}\n\nv = pd.read_csv(io.StringIO(DADOS))\n` },
      { type: "md", source: "## Notas\n\nO que aprendi neste módulo, em três frases:" },
    ],
  },
  source: "curso-engenharia-ia 2/modulo-03-numpy-pandas-matplotlib",
};
