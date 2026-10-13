import type { ModuleContent } from "../types";

// Módulo 6 — Probabilidade e estatística para IA.
// Fonte: curso-engenharia-ia 3/modulo-06-probabilidade-estatistica (01-aula, 02-apostila, 03-exercicios, 04-prova, 05-gabarito,
// codigo/exemplos_m6.py e img/). As cinco imagens da aula entram como figuras; as fórmulas, escritas em LaTeX na aula,
// passam a texto Unicode (não há renderizador de LaTeX). O teorema de Bayes com frequências naturais, a lei dos grandes
// números e o limite central, e o teste A/B (fórmula, bootstrap, testes A/A e tamanho da amostra) têm widgets interativos
// (src/components/widgets/m6), com as partes determinísticas testadas contra NumPy 2.5 e SciPy 1.18 e as simulações
// testadas estatisticamente. As verificações rápidas, os cartões de revisão e o banco do simulado foram escritos pela
// plataforma a partir da aula, com todo o código corrido em Python 3.13, NumPy 2.5, pandas 3.0 e SciPy 1.18. O campo `output`
// de cada bloco da aula e do gabarito tem o resultado real, igual ao dos comentários do código.

// ---------------------------------------------------------------- código da aula

const BAYES_CODE = `import numpy as np
import pandas as pd
from scipy import stats
np.set_printoptions(precision=3, suppress=True)

p_fraude = 0.01               # 1% das transações são fraude
p_alerta_dado_fraude = 0.95   # o detetor apanha 95% das fraudes
p_alerta_dado_legit = 0.05    # e dá alarme falso em 5% das legítimas

p_alerta = p_alerta_dado_fraude * p_fraude + p_alerta_dado_legit * (1 - p_fraude)
p_fraude_dado_alerta = p_alerta_dado_fraude * p_fraude / p_alerta
print(round(p_alerta, 4), round(p_fraude_dado_alerta, 3))      # 0.059 0.161

# Confirmar por simulação, com um milhão de transações
rng = np.random.default_rng(42)
n = 1_000_000
fraude = rng.random(n) < p_fraude
alerta = np.where(fraude, rng.random(n) < p_alerta_dado_fraude, rng.random(n) < p_alerta_dado_legit)
print(alerta.sum(), round(fraude[alerta].mean(), 3))         # 59204 0.161`;

const BINOM_CODE = `n_vis, p_conv = 200, 0.03
X = stats.binom(n_vis, p_conv)
print(X.mean(), round(X.var(), 2), round(X.std(), 2))   # 6.0 5.82 2.41
print(round(X.pmf(6), 3), round(X.sf(9), 3))            # 0.163 0.081: P(X = 6) e P(X >= 10)

# A mesma coisa por simulação: 100 000 dias
rng = np.random.default_rng(1)
amostra = rng.binomial(n_vis, p_conv, size=100_000)
print(round(amostra.mean(), 2), round(amostra.std(), 2), round((amostra >= 10).mean(), 3))   # 6.0 2.41 0.081`;

const NORM_CODE = `Z = stats.norm(0, 1)                 # normal padrão: média 0, desvio padrão 1
for k in [1, 2, 3]:
    print(k, round(Z.cdf(k) - Z.cdf(-k), 4))
# 1 0.6827
# 2 0.9545
# 3 0.9973
print(round(Z.ppf(0.975), 3))        # 1.96`;

const LGN_CODE = `rng = np.random.default_rng(2)
visitas = rng.random(100_000) < 0.03          # cada visita compra com probabilidade 3%
media_acumulada = np.cumsum(visitas) / np.arange(1, visitas.size + 1)
for k in [10, 100, 1_000, 10_000, 100_000]:
    print(k, round(media_acumulada[k - 1], 4))
# 10 0.0
# 100 0.04
# 1000 0.021
# 10000 0.0301
# 100000 0.0298`;

const TLC_CODE = `rng = np.random.default_rng(3)
encomendas = rng.exponential(scale=50, size=(100_000, 30))   # média 50 €, desvio padrão 50 €
for n_enc in [1, 5, 30]:
    medias = encomendas[:, :n_enc].mean(axis=1)
    print(n_enc, round(medias.mean(), 2), round(medias.std(), 2), round(50 / np.sqrt(n_enc), 2),
          round(stats.skew(medias), 2))
# 1 50.02 49.85 50.0 1.99
# 5 50.11 22.36 22.36 0.89
# 30 50.05 9.17 9.13 0.38`;

const LOG_CODE = `print(np.prod(np.full(2000, 0.5)), round(np.sum(np.log(np.full(2000, 0.5))), 2))   # 0.0 -1386.29`;

const VERO_CODE = `dados = np.array([1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 1])   # 7 compras em 20

def log_vero(p):
    return np.sum(dados * np.log(p) + (1 - dados) * np.log(1 - p))

for p in [0.2, 0.35, 0.5]:
    print(p, round(log_vero(p), 3))
# 0.2 -14.167
# 0.35 -12.949
# 0.5 -13.863

ps = np.linspace(0.01, 0.99, 99)
lv = np.array([log_vero(p) for p in ps])
print(round(ps[np.argmax(lv)], 2), dados.mean())   # 0.35 0.35`;

const CE_CODE = `print(round(-lv.max() / len(dados), 4))   # 0.6474: a entropia cruzada no ótimo`;

const IC_CODE = `conv, vis = 120, 4_000
p_hat = conv / vis
ep = np.sqrt(p_hat * (1 - p_hat) / vis)
print(p_hat, round(ep, 5), round(p_hat - 1.96 * ep, 4), round(p_hat + 1.96 * ep, 4))
# 0.03 0.0027 0.0247 0.0353`;

const AB_CODE = `conv_a, vis_a = 120, 4_000
conv_b, vis_b = 150, 4_000
pa, pb = conv_a / vis_a, conv_b / vis_b
dif = pb - pa
ep_dif = np.sqrt(pa * (1 - pa) / vis_a + pb * (1 - pb) / vis_b)
z = dif / ep_dif                              # quantos erros padrão vale a diferença
valor_p = 2 * stats.norm.sf(abs(z))           # bilateral: B pior ou melhor
print(round(dif, 4), round(ep_dif, 5), round(z, 2), round(valor_p, 3))   # 0.0075 0.00404 1.86 0.063
print(round(dif - 1.96 * ep_dif, 4), round(dif + 1.96 * ep_dif, 4))     # -0.0004 0.0154`;

const BOOT_CODE = `a = np.r_[np.ones(conv_a), np.zeros(vis_a - conv_a)]    # 4000 visitas: 1 = comprou
b = np.r_[np.ones(conv_b), np.zeros(vis_b - conv_b)]
rng = np.random.default_rng(4)
difs = np.array([rng.choice(b, b.size).mean() - rng.choice(a, a.size).mean() for _ in range(5_000)])
lo, hi = np.percentile(difs, [2.5, 97.5])
print(f"{lo:.4f} {hi:.4f}", round((difs <= 0).mean(), 3))   # -0.0003 0.0153 0.032`;

const AA_CODE = `def teste_ab(conv_a, conv_b, n):
    pa, pb = conv_a / n, conv_b / n
    ep = np.sqrt(pa * (1 - pa) / n + pb * (1 - pb) / n)
    return 2 * stats.norm.sf(abs((pb - pa) / ep))

rng = np.random.default_rng(5)
conv_aa = rng.binomial(4_000, 0.03, size=(2_000, 2))       # duas versões iguais, 3%
p_aa = np.array([teste_ab(c[0], c[1], 4_000) for c in conv_aa])
print(round((p_aa < 0.05).mean(), 3))                      # 0.057`;

const N_CODE = `p1, p2 = 0.03, 0.0375
z_a, z_b = stats.norm.ppf(0.975), stats.norm.ppf(0.80)
n_grupo = (z_a + z_b)**2 * (p1 * (1 - p1) + p2 * (1 - p2)) / (p2 - p1)**2
print(int(np.ceil(n_grupo)))     # 9097 visitas por versão`;

const UCB_DATA = `ucb = pd.DataFrame({
    "dept":       list("AABBCCDDEEFF"),
    "sexo":       ["H", "M"] * 6,
    "admitidos":  [512, 89, 353, 17, 120, 202, 138, 131, 53, 94, 22, 24],
    "rejeitados": [313, 19, 207, 8, 205, 391, 279, 244, 138, 299, 351, 317],
})
ucb["candidatos"] = ucb["admitidos"] + ucb["rejeitados"]`;

const UCB_CODE = `${UCB_DATA}

total = ucb.groupby("sexo")[["admitidos", "candidatos"]].sum()
print((total["admitidos"] / total["candidatos"]).round(3))
# sexo
# H    0.445
# M    0.304
# dtype: float64

por_dept = ucb.assign(taxa=ucb["admitidos"] / ucb["candidatos"]).pivot(index="dept", columns="sexo", values="taxa")
print(por_dept.round(2))
# sexo     H     M
# dept            
# A     0.62  0.82
# B     0.63  0.68
# C     0.37  0.34
# D     0.33  0.35
# E     0.28  0.24
# F     0.06  0.07`;

const UCB_CAND = `print(ucb.pivot(index="dept", columns="sexo", values="candidatos"))
# sexo    H    M
# dept          
# A     825  108
# B     560   25
# C     325  593
# D     417  375
# E     191  393
# F     373  341`;

const O_UCB = `sexo
H    0.445
M    0.304
dtype: float64
sexo     H     M
dept            
A     0.62  0.82
B     0.63  0.68
C     0.37  0.34
D     0.33  0.35
E     0.28  0.24
F     0.06  0.07`;

const O_UCB_CAND = `sexo    H    M
dept          
A     825  108
B     560   25
C     325  593
D     417  375
E     191  393
F     373  341`;

// ---------------------------------------------------------------- fórmulas (LaTeX na aula, aqui em Unicode)

const F_COND = `P(A | B) = P(A e B) / P(B)`;
const F_BAYES = `P(A | B) = P(B | A) · P(A) / P(B)

P(B) = P(B | A) · P(A) + P(B | não A) · P(não A)`;
const F_EV = `E[X] = Σₓ x · P(X = x)

Var(X) = E[(X − E[X])²]

σ = √Var(X)`;
const F_TLC = `X̄ₙ ≈ N(μ, σ²/n)        erro padrão = σ / √n`;
const F_MLE = `θ̂ = argmax_θ log L(θ) = argmax_θ Σᵢ₌₁ⁿ log P(yᵢ | θ)`;
const F_CE = `perda(p) = −(1/n) · Σᵢ₌₁ⁿ [ yᵢ · log pᵢ + (1 − yᵢ) · log(1 − pᵢ) ]`;

// ---------------------------------------------------------------- dados dos exercícios e da prova

const IMPORTS = `import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from scipy import stats
np.set_printoptions(precision=3, suppress=True)`;

const CAMP = `camp = pd.DataFrame({"regiao": ["Lisboa", "Lisboa", "Interior", "Interior"],
                     "campanha": ["A", "B", "A", "B"],
                     "visitas": [250, 1000, 1000, 250],
                     "vendas": [25, 90, 30, 5]})`;

const VISITAS_POISSON = `visitas = np.array([3, 5, 2, 4, 6, 3, 4, 5, 2, 4])`;

const T_VIDEOS_PROB = "https://www.3blue1brown.com/topics/probability";

export const M6: ModuleContent = {
  id: "M6",
  duration: "3 semanas, cerca de 9 horas",
  intro:
    "No fim deste módulo deve saber calcular probabilidades condicionais e aplicar o teorema de Bayes, trabalhar com as distribuições mais usadas, explicar a lei dos grandes números e o teorema do limite central, perceber de onde vêm as funções de perda pela máxima verosimilhança, e analisar um teste A/B com um intervalo de confiança.",
  outcomes: [
    "Calcular probabilidades condicionais e aplicar o teorema de Bayes",
    "Trabalhar com as distribuições mais usadas",
    "Explicar a lei dos grandes números e o teorema do limite central",
    "Perceber de onde vêm as funções de perda pela máxima verosimilhança",
    "Analisar um teste A/B com um intervalo de confiança",
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
        { id: "t2", text: "Ver o vídeo \"Bayes theorem, the geometry of changing beliefs\" (3Blue1Brown)", link: { kind: "url", href: T_VIDEOS_PROB } },
      ],
    },
    {
      id: "w1s2",
      label: "Semana 1 · sessão 2",
      minutes: 90,
      tasks: [
        { id: "t1", text: "Ler a secção 3", link: { kind: "section", id: "s3" } },
        { id: "t2", text: "Exercícios 1 a 4", link: { kind: "tab", tab: "exercicios" } },
      ],
    },
    {
      id: "w2s1",
      label: "Semana 2 · sessão 1",
      minutes: 90,
      tasks: [
        { id: "t1", text: "Ler a secção 4", link: { kind: "section", id: "s4" } },
        { id: "t2", text: "Ver o vídeo \"But what is the Central Limit Theorem?\" (3Blue1Brown)", link: { kind: "url", href: T_VIDEOS_PROB } },
        { id: "t3", text: "Exercícios 8 e 11", link: { kind: "tab", tab: "exercicios" } },
      ],
    },
    {
      id: "w2s2",
      label: "Semana 2 · sessão 2",
      minutes: 90,
      tasks: [
        { id: "t1", text: "Ler a secção 5", link: { kind: "section", id: "s5" } },
        { id: "t2", text: "Exercícios 9 e 10", link: { kind: "tab", tab: "exercicios" } },
      ],
    },
    {
      id: "w3s1",
      label: "Semana 3 · sessão 1",
      minutes: 90,
      tasks: [
        { id: "t1", text: "Ler as secções 6 e 7", link: { kind: "section", id: "s6" } },
        { id: "t2", text: "Exercícios 5 a 7", link: { kind: "tab", tab: "exercicios" } },
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
      title: "Porquê probabilidade: a incerteza está em todo o lado",
      minutes: 10,
      blocks: [
        {
          t: "callout",
          tone: "info",
          title: "Como estudar este módulo",
          text: "As técnicas do M4 e do M5 continuam: recuperação no início de cada sessão, sessões espaçadas, exemplos resolvidos refeitos à mão e explicar cada passo por palavras suas. Este módulo junta uma quinta: a **prática intercalada**. Nos exercícios, os tipos de problema aparecem misturados de propósito, porque escolher o método certo faz parte do que se aprende. Alunos que treinaram com problemas misturados saíram-se muito melhor num teste posterior do que os que treinaram um tipo de cada vez (Rohrer & Taylor, 2007).",
        },
        {
          t: "callout",
          tone: "info",
          title: "O código deste módulo",
          text: "O código usa NumPy, pandas e SciPy (`from scipy import stats`). No Colab já estão instalados; num ambiente local, `pip install scipy`. Cada bloco de código cria o seu próprio gerador de números aleatórios com uma semente fixa, por isso os resultados nos comentários são os que vai obter.",
        },
        {
          t: "p",
          text: "A álgebra linear (M4) dá a língua dos dados e o cálculo (M5) dá a forma de treinar. Falta a terceira peça: os dados têm ruído, as amostras são pequenas e as previsões nunca são certas. A probabilidade é a matemática da incerteza, e a estatística é a arte de tirar conclusões fiáveis apesar dela (Deisenroth, Faisal & Ong, 2020, cap. 6).",
        },
        {
          t: "table",
          head: ["Onde aparece", "O que é, em probabilidade"],
          rows: [
            ["O filtro de spam do M1 dava `[0.92 0.08]`", "Uma distribuição de probabilidade sobre duas classes"],
            ["O Naive Bayes do M1", "O teorema de Bayes da secção 2, aplicado palavra a palavra"],
            ["Um LLM a escrever", "Em cada passo, escolhe o token seguinte a partir de uma distribuição sobre dezenas de milhares de tokens (M17)"],
            ["A perda de um classificador (M8)", "A máxima verosimilhança da secção 5"],
            ["\"O modelo B é melhor do que o A?\"", "Um intervalo de confiança ou um teste, secção 6"],
            ["\"Mudar o botão aumentou as vendas?\"", "Um teste A/B, secção 6"],
          ],
        },
        { t: "p", text: "Há duas formas de ler uma probabilidade, e as duas são úteis:" },
        {
          t: "list",
          items: [
            "**Frequência a longo prazo.** \"A probabilidade de conversão é 3%\" quer dizer que, em muitas visitas, cerca de 3 em cada 100 compram. É a leitura dos testes A/B e da secção 4.",
            "**Grau de crença.** \"Há 16% de probabilidade de esta transação ser fraude\" diz o que se deve acreditar com a informação disponível, e muda quando chega informação nova. É a leitura do teorema de Bayes.",
          ],
        },
        {
          t: "p",
          text: "A estatística também protege contra erros caros. Uma diferença de 0,75 pontos percentuais num teste A/B pode ser real ou pura sorte; uma tabela agregada pode contar a história ao contrário da realidade. As secções 6 e 7 mostram as duas coisas com números.",
        },
        {
          t: "check",
          id: "qc1",
          q: "\"Depois deste alerta, acredito que há 16% de probabilidade de a transação ser fraude.\" Que leitura da probabilidade é esta?",
          options: ["Frequência a longo prazo", "Grau de crença", "Proporção de base", "Valor-p"],
          answer: 1,
          explain:
            "Diz o que se deve acreditar com a informação disponível (o alerta), e muda quando chega informação nova: é a leitura do teorema de Bayes. \"Em muitas visitas, 3 em cada 100 compram\" seria a frequência a longo prazo.",
        },
      ],
    },
    {
      id: "s2",
      num: 2,
      title: "Probabilidade condicional e teorema de Bayes",
      minutes: 30,
      blocks: [
        { t: "h3", text: "O básico" },
        { t: "p", text: "Uma probabilidade é um número entre 0 (impossível) e 1 (certo). Três regras chegam para quase tudo:" },
        {
          t: "table",
          head: ["Regra", "Fórmula", "Exemplo"],
          rows: [
            ["Complementar", "P(não A) = 1 − P(A)", "Se 3% compram, 97% não compram"],
            ["União (\"ou\")", "P(A ou B) = P(A) + P(B) − P(A e B)", "Subtrai-se o que foi contado duas vezes"],
            ["Independência", "P(A e B) = P(A) · P(B), só se A e B forem independentes", "Duas visitas de pessoas diferentes"],
          ],
        },
        {
          t: "p",
          text: "A **probabilidade condicional** P(A | B) lê-se \"probabilidade de A sabendo que B aconteceu\". Restringe o universo aos casos em que B aconteceu:",
        },
        { t: "code", title: "Fórmula", code: F_COND },
        {
          t: "p",
          text: "A ordem importa muito: P(alerta | fraude) não é o mesmo que P(fraude | alerta). Confundir as duas é um dos erros de raciocínio mais comuns, em medicina, em tribunal e em IA.",
        },
        { t: "h3", text: "O teorema de Bayes" },
        {
          t: "p",
          text: "O **teorema de Bayes** diz como inverter uma probabilidade condicional, ou seja, como atualizar uma crença quando chega informação nova:",
        },
        { t: "code", title: "Fórmula", code: F_BAYES },
        { t: "p", text: "P(A) é a crença **a priori**, antes da informação; P(A | B) é a crença **a posteriori**, depois." },
        { t: "h3", text: "Exemplo: um alerta de fraude" },
        {
          t: "p",
          text: "Numa loja online, 1% das transações são fraude. Um detetor apanha 95% das fraudes, mas também dispara em 5% das transações legítimas. Dispara um alerta. Qual é a probabilidade de ser mesmo fraude?",
        },
        {
          t: "p",
          text: "A maioria das pessoas responde \"95%\". A resposta certa é 16%. Fica evidente quando se troca as percentagens por contagens, as **frequências naturais**, que tornam o raciocínio bayesiano muito mais fácil (Gigerenzer & Hoffrage, 1995):",
        },
        {
          t: "figure",
          src: "img/01-arvore-bayes.png",
          alt: "Árvore de frequências naturais: em 10 000 transações, só 95 dos 590 alertas são fraude",
        },
        {
          t: "p",
          text: "Há tantas transações legítimas que 5% delas (495) são cinco vezes mais do que todas as fraudes apanhadas (95). Ignorar a proporção de base, o 1% inicial, é o erro clássico descrito por Kahneman & Tversky (1973).",
        },
        { t: "code", title: "Teorema de Bayes e simulação", code: BAYES_CODE, output: "0.059 0.161\n59204 0.161" },
        {
          t: "p",
          text: "A simulação é uma ferramenta que vai usar o curso todo: quando uma fórmula parecer estranha, gera-se um milhão de casos e conta-se.",
        },
        {
          t: "widget",
          name: "m6-bayes",
          caption:
            "A árvore da figura, para quaisquer três percentagens. Mude a proporção de fraude e veja o que acontece a P(fraude | alerta) com o mesmo detetor. As contagens são de 10 000 transações imaginadas; podem não ser inteiras.",
        },
        { t: "h3", text: "Onde isto aparece em IA" },
        {
          t: "list",
          items: [
            "**Classificadores e proporções de base.** Um modelo de fraude com 95% de acerto em cada classe produz, neste cenário, 84% de alertas falsos. É por isso que o M7 ensina a precisão e a revocação, e não só a exatidão.",
            "**Naive Bayes.** O filtro de spam do M1 calcula P(spam | palavras) com o teorema de Bayes, assumindo, de forma \"ingénua\", que as palavras são independentes umas das outras.",
            "**Aprendizagem como atualização.** A estatística bayesiana trata os próprios parâmetros de um modelo como incertos, e atualiza essa incerteza com os dados (Bishop, 2006, cap. 1).",
          ],
        },
        {
          t: "check",
          id: "qc2",
          q: "5% das pessoas têm uma doença. Um teste deteta 80% dos doentes e dá positivo em 10% dos saudáveis. Em 1000 pessoas, quantos positivos há, e que fração deles está doente?",
          options: ["50 positivos, 80% doentes", "40 positivos, todos doentes", "135 positivos, cerca de 30% doentes", "135 positivos, 80% doentes"],
          answer: 2,
          explain:
            "50 doentes, 40 com positivo; 950 saudáveis, 95 com positivo. Positivos: 40 + 95 = 135, dos quais 40 doentes: 40 / 135 ≈ 0,296. Os 80% são P(positivo | doente), não P(doente | positivo).",
        },
      ],
    },
    {
      id: "s3",
      num: 3,
      title: "Variáveis aleatórias e distribuições",
      minutes: 30,
      blocks: [
        {
          t: "p",
          text: "Uma **variável aleatória** é um número cujo valor depende do acaso: o número de compras amanhã, o valor da próxima encomenda. A sua **distribuição** diz que valores pode tomar e com que probabilidade. Pode ser **discreta** (contagens: 0, 1, 2…) ou **contínua** (medidas: 37,42 €).",
        },
        { t: "h3", text: "Esperança e variância" },
        { t: "p", text: "Dois números resumem uma distribuição:" },
        {
          t: "list",
          items: [
            "a **esperança** (ou valor esperado) E[X], a média a longo prazo: cada valor pesado pela sua probabilidade;",
            "a **variância** Var(X), a distância quadrática média à esperança. A sua raiz quadrada é o **desvio padrão** σ, nas mesmas unidades de X.",
          ],
        },
        { t: "code", title: "Fórmula", code: F_EV },
        { t: "h3", text: "Três distribuições que aparecem em todo o lado" },
        {
          t: "table",
          head: ["Distribuição", "Descreve", "Parâmetros", "E[X]", "Var(X)"],
          rows: [
            ["Bernoulli", "Um sim ou não: uma visita compra ou não", "p", "p", "p(1 − p)"],
            ["Binomial", "Número de \"sins\" em n tentativas independentes", "n, p", "np", "np(1 − p)"],
            ["Normal (gaussiana)", "Medidas que resultam da soma de muitos efeitos pequenos", "μ, σ", "μ", "σ²"],
          ],
        },
        {
          t: "p",
          text: "Exemplo binomial: uma página tem 200 visitas por dia e cada visita compra com probabilidade 3%, independentemente das outras. Quantas vendas esperar?",
        },
        { t: "code", title: "Binomial", code: BINOM_CODE, output: "6.0 5.82 2.41\n0.163 0.081\n6.0 2.41 0.081" },
        {
          t: "p",
          text: "Espera-se 6 vendas por dia, com um desvio padrão de 2,4. Um dia com 10 ou mais vendas acontece 8% das vezes só por acaso: não é motivo para festejar uma campanha. E um dia com 6 vendas exatas só acontece em 16% dos dias, apesar de ser o valor mais provável. `sf(9)` é a \"função de sobrevivência\", P(X > 9), o mesmo que P(X ≥ 10) numa contagem.",
        },
        { t: "h3", text: "A distribuição normal" },
        {
          t: "p",
          text: "A normal tem a forma de sino, simétrica à volta da média μ, com largura σ. Aparece tanto por causa do teorema do limite central da secção 4. A regra que vale a pena decorar:",
        },
        { t: "code", title: "A regra 68-95-99,7", code: NORM_CODE, output: "1 0.6827\n2 0.9545\n3 0.9973\n1.96" },
        {
          t: "p",
          text: "Cerca de 68% dos valores ficam a menos de 1 desvio padrão da média, 95% a menos de 2 e 99,7% a menos de 3. O número 1,96 é o valor exato que deixa 95% no meio: vai reaparecer nos intervalos de confiança da secção 6.",
        },
        { t: "h3", text: "Na prática" },
        {
          t: "list",
          items: [
            "`stats.binom`, `stats.norm`, `stats.poisson`… têm todos os mesmos métodos: `pmf` ou `pdf` (probabilidade ou densidade num ponto), `cdf` (P(X ≤ x)), `sf` (P(X > x)), `ppf` (o inverso da `cdf`) e `rvs` (gerar amostras).",
            "Para gerar amostras dentro de um programa, prefira `rng = np.random.default_rng(semente)` e `rng.binomial`, `rng.normal`, etc. A semente fixa torna os resultados reprodutíveis.",
            "Muitos dados reais **não** são normais: valores de encomendas, rendimentos e visitas por página têm caudas longas à direita. Fazer um histograma antes de assumir uma distribuição evita surpresas.",
          ],
        },
        {
          t: "check",
          id: "qc3",
          q: "Uma campanha envia 50 emails e cada um gera uma compra com probabilidade 0,1, de forma independente. Qual é a esperança e o desvio padrão do número de compras?",
          options: ["5 e 4,5", "0,1 e 0,3", "5 e 5", "5 e cerca de 2,12"],
          answer: 3,
          explain:
            "Binomial com n = 50 e p = 0,1: E[X] = np = 5 e Var(X) = np(1 − p) = 4,5, por isso σ = √4,5 ≈ 2,12. O 4,5 é a variância, não o desvio padrão. Confirma-se com `stats.binom(50, 0.1).std()`.",
        },
      ],
    },
    {
      id: "s4",
      num: 4,
      title: "Lei dos grandes números e teorema do limite central",
      minutes: 30,
      blocks: [
        {
          t: "p",
          text: "Dois teoremas explicam porque é que a estatística funciona: porque uma amostra diz alguma coisa sobre o todo, e quanto se pode confiar nisso.",
        },
        { t: "h3", text: "Lei dos grandes números" },
        {
          t: "p",
          text: "A média de muitas observações independentes aproxima-se da esperança, à medida que o número de observações cresce. Jakob Bernoulli demonstrou-a no início do século XVIII, e é o que dá sentido à leitura da probabilidade como frequência.",
        },
        { t: "code", title: "Lei dos grandes números", code: LGN_CODE, output: "10 0.0\n100 0.04\n1000 0.021\n10000 0.0301\n100000 0.0298" },
        {
          t: "p",
          text: "Com 10 visitas, a taxa observada é 0%; com 100, é 4%; com 1000, 2,1%. Só a partir de alguns milhares se aproxima dos 3% reais. A lição prática: amostras pequenas variam muito, e as pessoas tendem a confiar nelas demasiado, um enviesamento a que Tversky & Kahneman (1971) chamaram, com ironia, a \"lei dos pequenos números\". Uma loja com 3 vendas em 50 visitas não tem \"6% de conversão\": tem dados insuficientes.",
        },
        { t: "h3", text: "Teorema do limite central" },
        {
          t: "p",
          text: "O **teorema do limite central** (TLC) diz como é que a média varia. Se X₁, …, Xₙ são independentes, com média μ e desvio padrão σ, a sua média tem, para n suficientemente grande, uma distribuição aproximadamente normal:",
        },
        { t: "code", title: "Fórmula", code: F_TLC },
        {
          t: "p",
          text: "O mais surpreendente é que isto vale **seja qual for** a distribuição original. Os valores de encomendas, por exemplo, são muito assimétricos: muitas pequenas e algumas grandes. A média de 30 encomendas já é quase normal:",
        },
        { t: "code", title: "Teorema do limite central", code: TLC_CODE, output: "1 50.02 49.85 50.0 1.99\n5 50.11 22.36 22.36 0.89\n30 50.05 9.17 9.13 0.38" },
        {
          t: "p",
          text: "As colunas são: n, média das médias, desvio padrão das médias, o valor previsto σ/√n e a assimetria (0 numa normal). A média fica sempre nos 50 €, o desvio padrão cai exatamente como σ/√n, e a assimetria desaparece aos poucos.",
        },
        {
          t: "figure",
          src: "img/02-lgn-tlc.png",
          alt: "À esquerda, a taxa observada converge para 3%; à direita, as médias de encomendas ficam normais",
        },
        {
          t: "widget",
          name: "m6-lgn-tlc",
          caption:
            "As duas experiências da secção, simuladas no browser: três lojas com 100 000 visitas cada, e 10 000 médias de n encomendas (ou de n visitas com compra ou não). O gerador aleatório não é o do NumPy: os números são parecidos com os da aula, não iguais.",
        },
        { t: "h3", text: "Porque isto importa" },
        {
          t: "list",
          items: [
            "**O erro padrão encolhe com √n, não com n.** Para reduzir o erro para metade, é preciso quatro vezes mais dados. É por isso que os testes A/B precisam de tantos visitantes (secção 6).",
            "**Dá os intervalos de confiança.** Como a média é aproximadamente normal, a regra dos 95% da secção 3 aplica-se: a média fica a menos de 1,96 erros padrão da verdadeira em 95% das amostras.",
            "**Explica o ruído dos mini-lotes do M5.** O gradiente de um mini-lote é uma média de gradientes de exemplos; o seu ruído cai com a raiz do tamanho do lote. Passar de 32 para 128 exemplos só reduz o ruído para metade.",
          ],
        },
        {
          t: "p",
          text: "Uma ressalva: o TLC exige observações independentes e variância finita. Com dados muito dependentes (visitas da mesma pessoa, dias seguidos de uma série temporal) ou com caudas extremas, a aproximação pode falhar.",
        },
        {
          t: "check",
          id: "qc4",
          q: "Com 25 observações, o erro padrão de uma média é 4 €. Quantas observações da mesma população são precisas para o baixar para 1 €?",
          options: ["400", "100", "50", "1600"],
          answer: 0,
          explain:
            "O erro padrão é σ/√n. Dividi-lo por 4 exige √n quatro vezes maior, ou seja, n 16 vezes maior: 25 × 16 = 400.",
        },
      ],
    },
    {
      id: "s5",
      num: 5,
      title: "Máxima verosimilhança: de onde vêm as funções de perda",
      minutes: 30,
      blocks: [
        {
          t: "p",
          text: "No M5, a perda era o erro quadrático médio, e aceitou-se sem discutir. Porquê essa perda, e não outra? A resposta vem da **máxima verosimilhança**, proposta por Fisher (1922): escolher os parâmetros que tornam os dados observados o mais prováveis possível.",
        },
        { t: "h3", text: "A ideia" },
        {
          t: "p",
          text: "A **verosimilhança** L(θ) é a probabilidade dos dados que se observaram, vista como função dos parâmetros θ. Com observações independentes, é o produto das probabilidades de cada uma. Na prática usa-se o seu logaritmo, a **log-verosimilhança**, que transforma o produto numa soma e tem o máximo no mesmo sítio:",
        },
        { t: "code", title: "Fórmula", code: F_MLE },
        {
          t: "p",
          text: "O logaritmo não é só conveniência matemática. Multiplicar milhares de probabilidades dá um número tão pequeno que o computador o arredonda para zero (os limites da vírgula flutuante, M2):",
        },
        { t: "code", title: "Produto e soma de logaritmos", code: LOG_CODE, output: "0.0 -1386.29" },
        { t: "h3", text: "Exemplo: a taxa de compra" },
        {
          t: "p",
          text: "Em 20 visitas houve 7 compras. Cada visita é uma Bernoulli com probabilidade p desconhecida. Que p torna estes dados mais prováveis?",
        },
        { t: "code", title: "Log-verosimilhança de uma Bernoulli", code: VERO_CODE, output: "0.2 -14.167\n0.35 -12.949\n0.5 -13.863\n0.35 0.35" },
        {
          t: "figure",
          src: "img/03-verosimilhanca.png",
          alt: "A log-verosimilhança de 7 compras em 20 visitas tem o máximo em p = 0,35",
        },
        {
          t: "p",
          text: "O máximo está em p = 7/20 = 0,35: a proporção observada, como a intuição diria. Dá para confirmá-lo com o M5: a derivada de log L(p) = k·log p + (n − k)·log(1 − p) é k/p − (n − k)/(1 − p), que se anula em p = k/n.",
        },
        { t: "h3", text: "Da verosimilhança à perda" },
        {
          t: "p",
          text: "Maximizar a log-verosimilhança é o mesmo que **minimizar o seu simétrico**, e é assim que nascem as funções de perda. A **log-verosimilhança negativa** média de dados sim ou não tem um nome próprio: **entropia cruzada binária**.",
        },
        { t: "code", title: "Fórmula", code: F_CE },
        { t: "code", title: "Entropia cruzada no ótimo", code: CE_CODE, output: "0.6474" },
        {
          t: "p",
          text: "Quando pᵢ deixa de ser uma constante e passa a ser a saída de um modelo, por exemplo σ(wx + b), esta é a perda da regressão logística (M8) e de quase todos os classificadores. Com mais de duas classes chama-se apenas entropia cruzada, e é a perda com que se pré-treinam os LLMs: a log-verosimilhança negativa do token seguinte (M17).",
        },
        {
          t: "p",
          text: "E o erro quadrático médio? Se os dados forem y = f(x) + ruído, com ruído normal de variância fixa, a log-verosimilhança é uma constante menos a soma dos erros ao quadrado a dividir por 2σ². Maximizá-la é exatamente minimizar o EQM (Bishop, 2006, sec. 3.1.1). A perda do M5 e do mini-projeto da fase é máxima verosimilhança com ruído normal.",
        },
        {
          t: "table",
          head: ["Hipótese sobre os dados", "Perda que resulta da máxima verosimilhança", "Onde se usa"],
          rows: [
            ["Ruído normal", "Erro quadrático médio (EQM)", "Regressão (M5, M8)"],
            ["Ruído de Laplace (caudas mais pesadas)", "Erro absoluto médio (MAE)", "Regressão robusta a valores extremos"],
            ["Sim ou não (Bernoulli)", "Entropia cruzada binária", "Classificação binária (M8)"],
            ["Uma de K classes (categórica)", "Entropia cruzada", "Classificação, LLMs (M12, M17)"],
          ],
        },
        {
          t: "p",
          text: "Escolher uma perda é, portanto, fazer uma hipótese sobre como os dados foram gerados. Quando os dados têm valores extremos frequentes, o EQM dá-lhes demasiado peso, e a tabela diz qual é a alternativa.",
        },
        {
          t: "check",
          id: "qc5",
          q: "Um modelo de regressão vai ser treinado com dados que têm valores extremos frequentes (caudas pesadas). Que perda resulta da máxima verosimilhança com a hipótese adequada?",
          options: ["Erro quadrático médio (EQM)", "Erro absoluto médio (MAE)", "Entropia cruzada binária", "Entropia cruzada"],
          answer: 1,
          explain:
            "Ruído de Laplace, com caudas mais pesadas do que a normal, dá o erro absoluto médio. O EQM vem do ruído normal e dá demasiado peso aos valores extremos; as entropias cruzadas são para classificação.",
        },
      ],
    },
    {
      id: "s6",
      num: 6,
      title: "Intervalos de confiança, testes de hipóteses e testes A/B",
      minutes: 45,
      blocks: [
        {
          t: "p",
          text: "Uma estimativa sem margem de erro vale pouco. \"A conversão é 3%\" pode querer dizer \"entre 2,9% e 3,1%\" ou \"entre 0% e 10%\", conforme o número de visitas. Esta secção usa o TLC para medir essa margem e para decidir se uma diferença é real.",
        },
        { t: "h3", text: "Intervalo de confiança de uma proporção" },
        {
          t: "p",
          text: "Pelo TLC, uma proporção observada p̂ em n casos é aproximadamente normal, com erro padrão √(p̂(1 − p̂)/n). Um **intervalo de confiança de 95%** é p̂ ± 1,96 erros padrão:",
        },
        { t: "code", title: "Intervalo de confiança", code: IC_CODE, output: "0.03 0.0027 0.0247 0.0353" },
        {
          t: "p",
          text: "Com 4000 visitas e 120 compras, a conversão está entre 2,5% e 3,5%. A interpretação exata: se a experiência se repetisse muitas vezes, 95% dos intervalos construídos assim conteriam o valor verdadeiro.",
        },
        { t: "h3", text: "Testes de hipóteses e valor-p" },
        {
          t: "p",
          text: "Um teste de hipóteses parte de uma hipótese cética, a **hipótese nula** H₀: \"não há diferença nenhuma\". O **valor-p** é a probabilidade de, se H₀ fosse verdadeira, observar uma diferença pelo menos tão grande como a que se observou. Se for pequeno (por convenção, abaixo de 0,05), a diferença dificilmente se explica só por acaso.",
        },
        {
          t: "p",
          text: "O valor-p é dos conceitos mais mal interpretados da ciência. A Associação Americana de Estatística sentiu necessidade de publicar uma declaração sobre ele (Wasserstein & Lazar, 2016). Três pontos dessa declaração:",
        },
        {
          t: "list",
          items: [
            "o valor-p **não** é a probabilidade de H₀ ser verdadeira;",
            "um valor-p pequeno não diz se o efeito é grande ou importante;",
            "decisões não devem depender só de o valor-p passar um limiar.",
          ],
        },
        { t: "h3", text: "Exemplo: um teste A/B" },
        { t: "p", text: "Uma loja testa um botão novo. Metade das visitas vê a versão A (atual) e metade a B (nova), por sorteio:" },
        {
          t: "table",
          head: ["Versão", "Visitas", "Compras", "Conversão"],
          rows: [
            ["A", "4000", "120", "3,00%"],
            ["B", "4000", "150", "3,75%"],
          ],
        },
        { t: "p", text: "A versão B converte mais 0,75 pontos percentuais, um aumento de 25%. Vale a pena mudar?" },
        { t: "code", title: "Teste A/B", code: AB_CODE, output: "0.0075 0.00404 1.86 0.063\n-0.0004 0.0154" },
        {
          t: "p",
          text: "O valor-p é 0,063 e o intervalo de 95% para a diferença vai de −0,04 a +1,54 pontos percentuais: inclui o zero. A conclusão honesta não é \"B não funciona\", é \"**ainda não se sabe**\". O efeito pode ser nulo ou pode ser de mais de 1,5 pontos. Faltam dados.",
        },
        { t: "h3", text: "Bootstrap: o intervalo sem fórmulas" },
        {
          t: "p",
          text: "O **bootstrap** (Efron, 1979) estima a incerteza por simulação: reamostra os próprios dados, com reposição, milhares de vezes, e vê quanto o resultado varia. Funciona para qualquer estatística, mesmo quando não há fórmula para o erro padrão.",
        },
        { t: "code", title: "Bootstrap", code: BOOT_CODE, output: "-0.0003 0.0153 0.032" },
        {
          t: "figure",
          src: "img/04-bootstrap-ab.png",
          alt: "Distribuição bootstrap da diferença entre B e A, com o intervalo de 95% a incluir o zero",
        },
        { t: "p", text: "O resultado coincide com a fórmula: o intervalo vai de −0,03 a 1,53 pontos." },
        { t: "h3", text: "Testes A/A: o acaso também dá \"vencedores\"" },
        {
          t: "p",
          text: "Um **teste A/A** compara uma versão consigo própria. Como não há diferença real, qualquer resultado \"significativo\" é um falso positivo. Simulando 2000 testes A/A:",
        },
        { t: "code", title: "Testes A/A", code: AA_CODE, output: "0.057" },
        {
          t: "p",
          text: "Cerca de 5% dos testes dão \"significativo\" sem haver nada: é exatamente o que o limiar de 0,05 promete. Isto tem duas consequências práticas. Quem corre 20 testes em paralelo deve esperar um \"vencedor\" falso. E quem espreita o teste todos os dias e o pára assim que o valor-p desce abaixo de 0,05 aumenta muito a taxa de falsos positivos: o tamanho da amostra decide-se **antes** de começar (Kohavi, Tang & Xu, 2020).",
        },
        { t: "h3", text: "Quantas visitas são precisas?" },
        { t: "p", text: "Para detetar uma subida de 3,00% para 3,75% em 80% das vezes (o **poder** do teste), com o limiar de 0,05:" },
        { t: "code", title: "Tamanho da amostra", code: N_CODE, output: "9097" },
        {
          t: "p",
          text: "O teste da loja tinha 4000 por versão, menos de metade do necessário. Por isso deu inconclusivo. Repare no denominador: o tamanho necessário cresce com o inverso do quadrado do efeito. Detetar metade do efeito exige quatro vezes mais visitas.",
        },
        {
          t: "widget",
          name: "m6-ab",
          caption:
            "O teste A/B da secção, com os seus números: fórmula, intervalo, tamanho da amostra, bootstrap e testes A/A. As fórmulas dão exatamente os valores do SciPy; o bootstrap e os testes A/A usam outro gerador aleatório, por isso os números variam um pouco em relação aos da aula.",
        },
        { t: "h3", text: "Para além do marketing" },
        {
          t: "p",
          text: "A mesma lógica serve para comparar modelos de IA. Se o modelo B acerta 86% e o A 84% num conjunto de teste de 500 exemplos, a diferença pode ser ruído. O M7 e o M23 voltam a isto com validação cruzada e intervalos de confiança para métricas.",
        },
        {
          t: "check",
          id: "qc6",
          q: "Um teste A/B dá valor-p 0,063 e um intervalo de 95% para a diferença de −0,04 a +1,54 pontos percentuais. Qual é a conclusão certa?",
          options: [
            "B é pior do que A.",
            "B não funciona: não há efeito.",
            "B funciona: a diferença é de 0,75 pontos.",
            "Ainda não se sabe: os dados são compatíveis com efeito nulo e com mais de 1,5 pontos.",
          ],
          answer: 3,
          explain:
            "O intervalo inclui o zero, mas também efeitos interessantes. Um valor-p acima de 0,05 não prova que não há efeito: o teste tinha 4000 visitas por versão, menos de metade das 9097 necessárias.",
        },
      ],
    },
    {
      id: "s7",
      num: 7,
      title: "Armadilhas: paradoxo de Simpson e correlação sem causalidade",
      minutes: 25,
      blocks: [
        {
          t: "p",
          text: "Os números podem estar todos certos e a conclusão estar errada. Esta secção mostra os dois erros mais caros na análise de dados.",
        },
        { t: "h3", text: "O paradoxo de Simpson: as admissões de Berkeley" },
        {
          t: "p",
          text: "Em 1973, a Universidade da Califórnia em Berkeley admitiu 44% dos homens e 35% das mulheres que se candidataram ao mestrado e doutoramento, e foi acusada de discriminação. Bickel, Hammel & O'Connell (1975) analisaram os dados por departamento e chegaram a uma conclusão surpreendente. Os dados dos seis maiores departamentos são um exemplo clássico:",
        },
        { t: "code", title: "Admissões de Berkeley", code: UCB_CODE, output: O_UCB },
        {
          t: "p",
          text: "No total, 45% dos homens e 30% das mulheres foram admitidos. Por departamento, a história muda: as mulheres têm taxas iguais ou maiores em quatro dos seis, e a maior diferença de todas (82% contra 62%, no A) é a favor delas. Como é possível?",
        },
        { t: "code", title: "Candidatos por departamento", code: UCB_CAND, output: O_UCB_CAND },
        {
          t: "p",
          text: "Os homens candidataram-se sobretudo aos departamentos A e B, que admitem mais de 60%. As mulheres candidataram-se sobretudo aos departamentos C a F, onde se admite muito menos gente, homens e mulheres. O total mistura duas coisas: o efeito do sexo e o efeito do departamento escolhido. O departamento é uma **variável de confusão**: está ligado às duas, ao sexo de quem se candidata e à taxa de admissão.",
        },
        {
          t: "figure",
          src: "img/05-simpson.png",
          alt: "Taxas de admissão por departamento e no total, com a área de cada ponto proporcional ao número de candidatos",
        },
        {
          t: "p",
          text: "Este é o **paradoxo de Simpson**: uma tendência que aparece nos dados agregados pode desaparecer ou inverter-se quando se separam os grupos. Num relatório de marketing acontece o mesmo: a campanha A pode ter melhor conversão em todas as lojas e pior conversão no total, se estiver concentrada nas lojas com menos movimento. Antes de comparar totais, compare por segmento.",
        },
        { t: "h3", text: "Correlação não é causalidade" },
        {
          t: "p",
          text: "Nos dias em que se vendem mais gelados, há mais afogamentos. Os gelados não afogam ninguém: o calor faz subir as duas coisas. Sempre que duas variáveis andam juntas, há quatro explicações possíveis: A causa B; B causa A; uma terceira variável causa as duas; ou foi coincidência, sobretudo quando se procuraram muitas relações ao mesmo tempo.",
        },
        {
          t: "table",
          head: ["Tipo de dados", "Mostra causalidade?", "Porquê"],
          rows: [
            ["Observacionais (histórico de vendas, registos)", "Não, por si só", "Os grupos podem diferir em variáveis de confusão que não se mediram"],
            ["Experimentais aleatorizados (teste A/B)", "Sim, dentro dos limites do teste", "O sorteio equilibra em média todas as variáveis, medidas ou não"],
          ],
        },
        {
          t: "p",
          text: "É por isso que os testes A/B da secção 6 sorteiam quem vê cada versão. Tirar conclusões causais de dados observacionais é possível, mas exige métodos próprios e hipóteses explícitas, o tema da inferência causal (Pearl & Mackenzie, 2018).",
        },
        { t: "h3", text: "Porque isto importa em IA" },
        {
          t: "p",
          text: "Um modelo de ML aprende correlações, não causas. Se nos dados de treino as fotografias de vacas tiverem quase sempre relva por trás, o modelo pode aprender a reconhecer a relva em vez da vaca, e falhar numa vaca na praia. Este fenómeno chama-se **aprendizagem por atalhos** e é uma das principais razões por que modelos com ótimos resultados no teste falham no mundo real (Geirhos et al., 2020). O M11 volta a isto com as fugas de dados, e o M23 com a avaliação fora da distribuição de treino.",
        },
        {
          t: "check",
          id: "qc7",
          q: "No departamento A de Berkeley, as mulheres foram admitidas com 82% e os homens com 62%; no total dos seis departamentos, 30% contra 45%. Porque é que o total inverte a comparação?",
          options: [
            "Porque há um erro de cálculo nos totais.",
            "Porque a diferença é pequena e é ruído.",
            "Porque as mulheres se candidataram sobretudo a departamentos que admitem pouca gente.",
            "Porque o sexo causa a taxa de admissão.",
          ],
          answer: 2,
          explain:
            "O departamento é a variável de confusão: está ligado ao sexo de quem se candidata e à taxa de admissão. Os homens concentraram-se em A e B (mais de 60% de admissões), as mulheres em C a F.",
        },
      ],
    },
  ],

  readings: {
    required: [
      {
        text: "Deisenroth, M. P., Faisal, A. A. & Ong, C. S. (2020). [*Mathematics for Machine Learning*](https://mml-book.github.io/). Cambridge University Press. Caps. 6 (probabilidade e distribuições) e 8 (estimação de parâmetros e máxima verosimilhança). PDF gratuito para uso pessoal.",
        href: "https://mml-book.github.io/",
      },
      {
        text: "Blitzstein, J. K. & Hwang, J. (2019). [*Introduction to Probability*](http://probabilitybook.net) (2.ª ed.). CRC Press. Caps. 2 (probabilidade condicional e Bayes), 3 a 5 (variáveis aleatórias, binomial, normal) e 10 (lei dos grandes números e teorema do limite central). Gratuito online.",
        href: "http://probabilitybook.net",
      },
    ],
    complementary: [
      { text: "3Blue1Brown, \"Bayes theorem, the geometry of changing beliefs\"." },
      { text: "3Blue1Brown, \"But what is the Central Limit Theorem?\"." },
      {
        text: "Kohavi, R., Tang, D. & Xu, Y. (2020). *Trustworthy Online Controlled Experiments: A Practical Guide to A/B Testing*. Cambridge University Press. A referência prática sobre testes A/B, escrita por quem os fez em grande escala.",
      },
      {
        text: "James, G., Witten, D., Hastie, T., Tibshirani, R. & Taylor, J. (2023). *An Introduction to Statistical Learning with Applications in Python*. Springer. Cap. 13 (testes múltiplos).",
      },
      {
        text: "Bishop, C. M. (2006). *Pattern Recognition and Machine Learning*. Springer. Caps. 1 e 2 (probabilidade para ML) e sec. 3.1.1 (mínimos quadrados como máxima verosimilhança).",
      },
      {
        text: "Pearl, J. & Mackenzie, D. (2018). *The Book of Why: The New Science of Cause and Effect*. Basic Books. Uma introdução acessível à inferência causal.",
      },
    ],
    cited: [
      "Bernoulli, J. (1713). *Ars Conjectandi*. Basileia.",
      "Fisher, R. A. (1922). On the mathematical foundations of theoretical statistics. *Philosophical Transactions of the Royal Society A*, 222, 309–368.",
      "Tversky, A. & Kahneman, D. (1971). Belief in the law of small numbers. *Psychological Bulletin*, 76(2), 105–110.",
      "Kahneman, D. & Tversky, A. (1973). On the psychology of prediction. *Psychological Review*, 80(4), 237–251.",
      "Bickel, P. J., Hammel, E. A. & O'Connell, J. W. (1975). Sex bias in graduate admissions: data from Berkeley. *Science*, 187(4175), 398–404.",
      "Efron, B. (1979). Bootstrap methods: another look at the jackknife. *The Annals of Statistics*, 7(1), 1–26.",
      "Gigerenzer, G. & Hoffrage, U. (1995). How to improve Bayesian reasoning without instruction: frequency formats. *Psychological Review*, 102(4), 684–704.",
      "Wasserstein, R. L. & Lazar, N. A. (2016). The ASA statement on p-values: context, process, and purpose. *The American Statistician*, 70(2), 129–133.",
      "Geirhos, R., Jacobsen, J.-H., Michaelis, C., Zemel, R., Brendel, W., Bethge, M. & Wichmann, F. A. (2020). Shortcut learning in deep neural networks. *Nature Machine Intelligence*, 2, 665–673.",
      "Rohrer, D. & Taylor, K. (2007). The shuffling of mathematics problems improves learning. *Instructional Science*, 35(6), 481–498.",
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
            code: `P(A | B) = P(A e B) / P(B)
P(A | B) = P(B | A) · P(A) / P(B)
P(B) = P(B | A) · P(A) + P(B | não A) · P(não A)`,
          },
          {
            t: "code",
            title: "Fórmulas",
            code: `E[X] = Σₓ x · P(X = x)
Var(X) = E[X²] − E[X]²
erro padrão = σ / √n
p̂ ± 1,96 · √(p̂(1 − p̂) / n)`,
          },
        ],
      },
      {
        title: "Distribuições",
        blocks: [
          {
            t: "table",
            head: ["Distribuição", "Para quê", "E[X]", "Var(X)", "SciPy"],
            rows: [
              ["Bernoulli(p)", "Um sim ou não", "p", "p(1 − p)", "`stats.bernoulli(p)`"],
              ["Binomial(n, p)", "Sins em n tentativas", "np", "np(1 − p)", "`stats.binom(n, p)`"],
              ["Poisson(λ)", "Contagens por intervalo de tempo", "λ", "λ", "`stats.poisson(lam)`"],
              ["Normal(μ, σ)", "Somas e médias de muitos efeitos", "μ", "σ²", "`stats.norm(mu, sigma)`"],
              ["Exponencial (média β)", "Tempos de espera, valores com cauda longa", "β", "β²", "`stats.expon(scale=beta)`"],
            ],
          },
          { t: "p", text: "Normal: 68% a menos de 1σ, 95% a menos de 2σ (1,96σ exatos), 99,7% a menos de 3σ." },
        ],
      },
      {
        title: "Conceitos",
        blocks: [
          {
            t: "table",
            head: ["Conceito", "Em poucas palavras"],
            rows: [
              ["Probabilidade condicional", "Probabilidade de A dentro do universo em que B aconteceu"],
              ["Teorema de Bayes", "Inverter uma condicional; atualizar o a priori com dados para obter o a posteriori"],
              ["Frequências naturais", "Trocar percentagens por contagens (de 10 000 casos…) torna Bayes intuitivo"],
              ["Esquecer a proporção de base", "Ignorar que o acontecimento é raro: muitos alertas são falsos"],
              ["Lei dos grandes números", "A média de muitas observações aproxima-se da esperança"],
              ["Teorema do limite central", "A média é aproximadamente normal, com erro padrão σ/√n, seja qual for a distribuição de partida"],
              ["Máxima verosimilhança", "Escolher os parâmetros que tornam os dados mais prováveis; usar o log"],
              ["Entropia cruzada", "Log-verosimilhança negativa média; perda dos classificadores e dos LLMs"],
              ["EQM", "Máxima verosimilhança com ruído normal"],
              ["Intervalo de confiança de 95%", "95% dos intervalos construídos assim contêm o valor verdadeiro"],
              ["Valor-p", "P(diferença tão grande ou maior | H₀ verdadeira). Não é P(H₀)"],
              ["Bootstrap", "Reamostrar os dados com reposição para medir a incerteza sem fórmulas"],
              ["Teste A/A", "Mesma versão dos dois lados: cerca de 5% de falsos \"vencedores\""],
              ["Poder", "Probabilidade de detetar um efeito que existe; fixa o tamanho da amostra antes de começar"],
              ["Paradoxo de Simpson", "O total pode contar a história ao contrário dos grupos, por causa de uma variável de confusão"],
              ["Correlação e causalidade", "Só a aleatorização (ou métodos causais próprios) permite falar de causa"],
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
            code: `from scipy import stats
X = stats.binom(200, 0.03)
X.mean(), X.var(), X.pmf(6), X.cdf(5), X.sf(9), X.ppf(0.5)
rng = np.random.default_rng(42)          # sempre com semente
rng.random(n) < p                         # n Bernoullis
rng.binomial(n, p, size=k); rng.normal(mu, sigma, size=k)

# teste A/B de duas proporções
ep = np.sqrt(pa * (1 - pa) / na + pb * (1 - pb) / nb)
z = (pb - pa) / ep
valor_p = 2 * stats.norm.sf(abs(z))
ic = (pb - pa - 1.96 * ep, pb - pa + 1.96 * ep)

# tamanho da amostra por versão (poder de 80%, limiar 0,05)
n = (stats.norm.ppf(0.975) + stats.norm.ppf(0.8))**2 * (p1*(1-p1) + p2*(1-p2)) / (p2 - p1)**2`,
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
              ["Precisão, revocação e proporções de base", "M7"],
              ["Regressão logística e entropia cruzada", "M8"],
              ["Fugas de dados e variáveis enganadoras", "M11"],
              ["Pré-treino de LLMs: entropia cruzada do token seguinte", "M17"],
              ["Comparar modelos com intervalos de confiança", "M23"],
              ["Monitorização e testes A/B em produção", "M25"],
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
              "Confundir P(A | B) com P(B | A).",
              "Esquecer a proporção de base quando o acontecimento é raro.",
              "Tirar conclusões de amostras pequenas.",
              "Ler um valor-p alto como prova de que não há efeito.",
              "Espreitar o teste A/B e pará-lo quando dá \"significativo\".",
              "Comparar só totais sem olhar para os segmentos.",
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
      note: "Doze exercícios, cerca de 4 horas no total. Os tipos de problema estão misturados de propósito (prática intercalada): parte do exercício é reconhecer que ferramenta usar. Os da Parte A fazem-se à mão, com calculadora.",
    },
    {
      id: "B",
      title: "Parte B — Colab",
      note: "Num notebook do Colab chamado \"M6 — exercícios\". O código assume `import numpy as np`, `import pandas as pd` e `from scipy import stats`; use as sementes indicadas para obter os mesmos resultados do gabarito.",
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
      title: "Instagram ou Google?",
      minutes: 10,
      sections: ["s2"],
      prompt: [
        {
          t: "p",
          text: "40% das visitas de uma loja online vêm do Instagram e 60% do Google. Quem vem do Instagram compra com probabilidade 2%; quem vem do Google, 4%. (a) Qual é a probabilidade de uma visita qualquer comprar? (b) Houve uma compra. Qual é a probabilidade de a visita ter vindo do Instagram?",
        },
      ],
      fields: [
        { id: "a", label: "(a) P(compra), com o cálculo", rows: 3 },
        { id: "b", label: "(b) P(Instagram | compra), com o cálculo", rows: 3 },
      ],
      criteria: [
        "(a) Probabilidade total: 0,4 × 0,02 + 0,6 × 0,04 = 0,008 + 0,024 = 0,032, ou seja, 3,2%",
        "(b) Bayes: P(Instagram | compra) = 0,008 / 0,032 = 0,25",
        "Nota que um quarto das compras vem do Instagram, apesar de 40% das visitas virem de lá",
      ],
      solution: [
        {
          t: "p",
          text: "(a) Probabilidade total: 0,4 × 0,02 + 0,6 × 0,04 = 0,008 + 0,024 = 0,032, ou seja, 3,2%. (b) Bayes: P(Instagram | compra) = 0,008 / 0,032 = 0,25. Um quarto das compras vem do Instagram, apesar de 40% das visitas virem de lá.",
        },
      ],
    },
    {
      id: "e2",
      num: 2,
      part: "A",
      session: "w1s2",
      kind: "text",
      title: "O cupão de raspar",
      minutes: 10,
      sections: ["s3"],
      prompt: [
        {
          t: "p",
          text: "Um cupão de raspar dá 0 € de desconto com probabilidade 0,7, 5 € com probabilidade 0,2 e 20 € com probabilidade 0,1. Calcule a esperança, a variância e o desvio padrão do desconto. Se a loja distribuir 1000 cupões, quanto espera gastar?",
        },
      ],
      fields: [
        { id: "calc", label: "Esperança, variância e desvio padrão, com os cálculos", rows: 5 },
        { id: "mil", label: "Gasto esperado com 1000 cupões", rows: 2 },
      ],
      criteria: [
        "E[X] = 0 × 0,7 + 5 × 0,2 + 20 × 0,1 = 3 €",
        "E[X²] = 25 × 0,2 + 400 × 0,1 = 45, logo Var(X) = 45 − 3² = 36",
        "σ = 6 €",
        "Com 1000 cupões, espera gastar 3000 €",
      ],
      solution: [
        {
          t: "p",
          text: "E[X] = 0 × 0,7 + 5 × 0,2 + 20 × 0,1 = 3 €. E[X²] = 25 × 0,2 + 400 × 0,1 = 45, logo Var(X) = 45 − 3² = 36 e σ = 6 €. Com 1000 cupões, espera gastar 3000 €. O desvio padrão é o dobro da média porque o prémio de 20 € é raro mas pesa muito.",
        },
      ],
    },
    {
      id: "e3",
      num: 3,
      part: "A",
      session: "w1s2",
      kind: "text",
      title: "Peças com defeito e proporção de base",
      minutes: 20,
      sections: ["s2"],
      prompt: [
        {
          t: "p",
          text: "Numa fábrica, 2% das peças têm defeito. Um modelo de visão deteta 90% das peças defeituosas, mas também marca 3% das boas. (a) Desenhe a árvore de frequências naturais para 1000 peças. (b) Uma peça foi marcada. Qual é a probabilidade de ter mesmo defeito? (c) A fábrica melhora e passa a ter só 0,5% de peças defeituosas. Com o mesmo modelo, quanto passa a valer a resposta da alínea (b)? Porquê?",
        },
      ],
      fields: [
        { id: "a", label: "(a) A árvore para 1000 peças (pode escrevê-la em texto)", rows: 5, mono: true, placeholder: "1000 peças\n├─ … com defeito\n│   ├─ … marcadas\n│   └─ …\n└─ … boas\n    ├─ …" },
        { id: "b", label: "(b) P(defeito | marcada)", rows: 2 },
        { id: "c", label: "(c) Com 0,5% de defeitos, e porquê", rows: 4 },
      ],
      criteria: [
        "(a) De 1000 peças, 20 têm defeito: 18 marcadas e 2 escapam; 980 são boas: 29,4 marcadas e 950,6 não",
        "(b) 18 / (18 + 29,4) = 18 / 47,4 ≈ 0,38",
        "(c) 4,5 defeituosas marcadas contra 29,85 boas marcadas: 4,5 / 34,35 ≈ 0,13",
        "(c) Explica pela proporção de base: quanto mais raro o defeito, maior a parte dos alertas que são falsos, mesmo com o mesmo modelo",
      ],
      solution: [
        {
          t: "p",
          text: "(a) De 1000 peças, 20 têm defeito: 18 são marcadas e 2 escapam. 980 são boas: 29,4 são marcadas e 950,6 não. (b) 18 / (18 + 29,4) = 18 / 47,4 ≈ 0,38. Uma peça marcada tem 38% de probabilidade de ter defeito. (c) Com 0,5%: 4,5 defeituosas marcadas contra 29,85 boas marcadas, 4,5 / 34,35 ≈ 0,13. Desce para 13%. Quanto mais raro é o defeito, maior a parte dos alertas que são falsos, mesmo com o mesmo modelo: é o efeito da proporção de base.",
        },
      ],
    },
    {
      id: "e4",
      num: 4,
      part: "A",
      session: "w1s2",
      kind: "text",
      title: "Cinco visitas",
      minutes: 10,
      sections: ["s2", "s3"],
      prompt: [
        {
          t: "p",
          text: "Chegam 5 visitas independentes, cada uma compra com probabilidade 0,2. (a) Qual é a probabilidade de nenhuma comprar? (b) E de pelo menos uma comprar? (c) Qual é a esperança e a variância do número de compras?",
        },
      ],
      fields: [
        { id: "a", label: "(a) Nenhuma compra", rows: 2 },
        { id: "b", label: "(b) Pelo menos uma compra", rows: 2 },
        { id: "c", label: "(c) Esperança e variância", rows: 2 },
      ],
      criteria: [
        "(a) 0,8⁵ = 0,328 (independência)",
        "(b) Complementar: 1 − 0,328 = 0,672",
        "(c) Binomial: E = np = 1 e Var = np(1 − p) = 0,8",
      ],
      solution: [
        {
          t: "p",
          text: "(a) 0,8⁵ = 0,328. (b) 1 − 0,328 = 0,672. (c) E = np = 1 e Var = np(1 − p) = 0,8. Em `stats.binom(5, 0.2)`: `pmf(0)` dá 0.32768.",
        },
      ],
    },
    {
      id: "e5",
      num: 5,
      part: "A",
      session: "w3s1",
      kind: "text",
      title: "Margem de erro de um inquérito",
      minutes: 15,
      sections: ["s4", "s6"],
      prompt: [
        {
          t: "p",
          text: "Num inquérito a 400 clientes, 60% dizem-se satisfeitos. (a) Calcule o erro padrão e o intervalo de confiança de 95%. (b) Quantos clientes seria preciso inquirir para a margem de erro ficar com metade do tamanho?",
        },
      ],
      fields: [
        { id: "a", label: "(a) Erro padrão e intervalo de 95%", rows: 3 },
        { id: "b", label: "(b) Clientes para metade da margem, e porquê", rows: 3 },
      ],
      criteria: [
        "(a) Erro padrão √(0,6 × 0,4 / 400) = 0,0245",
        "(a) Intervalo 0,6 ± 1,96 × 0,0245 = [0,552; 0,648], entre 55% e 65%",
        "(b) A margem cai com √n: 4 vezes mais clientes, 1600",
      ],
      solution: [
        {
          t: "p",
          text: "(a) Erro padrão: √(0,6 × 0,4 / 400) = 0,0245. Intervalo: 0,6 ± 1,96 × 0,0245 = [0,552; 0,648], entre 55% e 65%. (b) A margem cai com √n: para a reduzir a metade são precisos 4 vezes mais clientes, 1600.",
        },
      ],
    },
    {
      id: "e6",
      num: 6,
      part: "A",
      session: "w3s1",
      kind: "classify",
      title: "Verdadeiro ou falso?",
      minutes: 15,
      sections: ["s4", "s5", "s6", "s7"],
      prompt: [{ t: "p", text: "Verdadeiro ou falso? Corrija as falsas." }],
      categories: ["Verdadeiro", "Falso"],
      justify: "Correção (se for falsa)",
      items: [
        {
          id: "1",
          text: "1. Um valor-p de 0,03 quer dizer que há 3% de probabilidade de a hipótese nula ser verdadeira.",
          answer: 1,
          explain: "O valor-p é a probabilidade de dados tão extremos **se** H₀ for verdadeira, não a probabilidade de H₀.",
        },
        { id: "2", text: "2. O erro padrão de uma média diminui com a raiz quadrada do tamanho da amostra.", answer: 0, explain: "Erro padrão = σ/√n." },
        {
          id: "3",
          text: "3. Se duas variáveis têm uma correlação forte, uma causa a outra.",
          answer: 1,
          explain: "Pode haver causalidade inversa, uma variável de confusão ou coincidência.",
        },
        { id: "4", text: "4. Em muitos testes A/A com limiar de 0,05, cerca de 5% dão um resultado \"significativo\".", answer: 0, explain: "É o que o limiar promete: são falsos positivos." },
        {
          id: "5",
          text: "5. Um intervalo de confiança de 95% para a diferença entre B e A que inclui o zero prova que B e A são iguais.",
          answer: 1,
          explain: "O resultado é inconclusivo; os dados são compatíveis com zero mas também com todos os outros valores do intervalo.",
        },
        {
          id: "6",
          text: "6. Minimizar o erro quadrático médio equivale a maximizar a verosimilhança quando o ruído é normal.",
          answer: 0,
          explain: "Com ruído normal de variância fixa, a log-verosimilhança é uma constante menos a soma dos erros ao quadrado a dividir por 2σ².",
        },
      ],
      solution: [
        {
          t: "p",
          text: "(1) **Falso**: o valor-p é a probabilidade de dados tão extremos **se** H₀ for verdadeira, não a probabilidade de H₀. (2) **Verdadeiro**. (3) **Falso**: pode haver causalidade inversa, uma variável de confusão ou coincidência. (4) **Verdadeiro**. (5) **Falso**: o resultado é inconclusivo; os dados são compatíveis com zero mas também com todos os outros valores do intervalo. (6) **Verdadeiro**.",
        },
      ],
    },
    {
      id: "e7",
      num: 7,
      part: "B",
      session: "w3s1",
      kind: "text",
      title: "Teste A/B a dois assuntos de email",
      minutes: 35,
      sections: ["s6"],
      prompt: [
        {
          t: "p",
          text: "Um email foi enviado com dois assuntos diferentes, por sorteio. Assunto A: 5000 envios, 900 aberturas. Assunto B: 5000 envios, 990 aberturas. (a) Calcule a diferença entre as taxas de abertura, o erro padrão, o valor-p e o intervalo de confiança de 95%. (b) Confirme o intervalo com bootstrap (5000 reamostragens, `default_rng(3)`). (c) Quantos envios por versão seriam precisos para detetar esta diferença com poder de 80%? (d) Que recomenda?",
        },
      ],
      fields: [
        { id: "code", label: "(a) a (c) Código e resultados", rows: 14, mono: true, placeholder: "ca, na, cb, nb = 900, 5_000, 990, 5_000\n…" },
        { id: "d", label: "(d) Recomendação", rows: 4 },
      ],
      criteria: [
        "(a) Diferença 0,018, erro padrão 0,00783, z 2,3, valor-p 0,0215, intervalo de 0,0027 a 0,0333",
        "(b) Bootstrap com `default_rng(3)`: 0.0032 a 0.0332, praticamente o mesmo que a fórmula",
        "(c) 7423 envios por versão (o teste teve 5000)",
        "(d) Usar o assunto B, com a ressalva de que, com menos envios do que o planeado, o ganho real pode ser menor do que 1,8 pontos; continuar a medir",
      ],
      solution: [
        {
          t: "code",
          code: `ca, na, cb, nb = 900, 5_000, 990, 5_000
pa, pb = ca / na, cb / nb
dif = pb - pa
ep = np.sqrt(pa * (1 - pa) / na + pb * (1 - pb) / nb)
z = dif / ep
valor_p = 2 * stats.norm.sf(abs(z))
print(round(dif, 4), round(ep, 5), round(z, 2), round(valor_p, 4))   # 0.018 0.00783 2.3 0.0215
print(round(dif - 1.96 * ep, 4), round(dif + 1.96 * ep, 4))         # 0.0027 0.0333

a = np.r_[np.ones(ca), np.zeros(na - ca)]
b = np.r_[np.ones(cb), np.zeros(nb - cb)]
rng = np.random.default_rng(3)
difs = np.array([rng.choice(b, b.size).mean() - rng.choice(a, a.size).mean() for _ in range(5_000)])
lo, hi = np.percentile(difs, [2.5, 97.5])
print(f"{lo:.4f} {hi:.4f}")                                         # 0.0032 0.0332

z_a, z_b = stats.norm.ppf(0.975), stats.norm.ppf(0.80)
print(int(np.ceil((z_a + z_b)**2 * (pa * (1 - pa) + pb * (1 - pb)) / (pb - pa)**2)))   # 7423`,
          output: "0.018 0.00783 2.3 0.0215\n0.0027 0.0333\n0.0032 0.0332\n7423",
        },
        {
          t: "p",
          text: "(a) e (b) A taxa de abertura passa de 18,0% para 19,8%; o valor-p é 0,02 e o intervalo, de +0,3 a +3,3 pontos, não inclui o zero. O bootstrap dá praticamente o mesmo. (c) Seriam precisos 7423 envios por versão; o teste teve 5000. (d) Usar o assunto B: a diferença é significativa e mudar o assunto não custa nada. Mas, com menos envios do que o planeado, o ganho real pode ser menor do que 1,8 pontos; convém continuar a medir.",
        },
      ],
    },
    {
      id: "e8",
      num: 8,
      part: "B",
      session: "w2s1",
      kind: "text",
      title: "A regra 68-95-99,7 em dados assimétricos",
      minutes: 20,
      sections: ["s3", "s4"],
      prompt: [
        {
          t: "p",
          text: "Gere 10 000 valores de uma normal com média 50 e desvio padrão 10, e 10 000 de uma exponencial com média 50 (`default_rng(1)`, primeiro a normal). Para cada amostra, calcule a fração de valores a menos de 1, 2 e 3 desvios padrão da média. A regra 68-95-99,7 vale nas duas? O que conclui sobre dados reais como os valores de encomendas?",
        },
      ],
      fields: [
        { id: "code", label: "Código e resultados", rows: 10, mono: true, placeholder: "rng = np.random.default_rng(1)\nnormal = rng.normal(50, 10, size=10_000)\n…" },
        { id: "r", label: "A regra vale nas duas? O que conclui?", rows: 4 },
      ],
      criteria: [
        "Gera primeiro a normal e depois a exponencial com `default_rng(1)`",
        "Normal: [0.687 0.956 0.997], a regra confirma-se",
        "Exponencial: [0.859 0.948 0.982]: 86% a menos de 1 desvio padrão e 1,8% para lá de 3",
        "Conclui que em dados assimétricos, como valores de encomendas, as regras baseadas no desvio padrão enganam: melhor usar percentis ou bootstrap",
      ],
      solution: [
        {
          t: "code",
          code: `rng = np.random.default_rng(1)
normal = rng.normal(50, 10, size=10_000)
expo = rng.exponential(50, size=10_000)
for nome, x in [("normal", normal), ("exponencial", expo)]:
    m, s = x.mean(), x.std()
    print(nome, round(m, 2), round(s, 2), np.round([np.mean(np.abs(x - m) < k * s) for k in (1, 2, 3)], 3))
# normal 49.89 9.98 [0.687 0.956 0.997]
# exponencial 49.74 49.56 [0.859 0.948 0.982]`,
          output: "normal 49.89 9.98 [0.687 0.956 0.997]\nexponencial 49.74 49.56 [0.859 0.948 0.982]",
        },
        {
          t: "p",
          text: "Na normal, a regra confirma-se. Na exponencial não: 86% dos valores ficam a menos de 1 desvio padrão, e há 1,8% para lá de 3. Em dados assimétricos, como valores de encomendas, as regras baseadas no desvio padrão enganam: é melhor usar percentis ou bootstrap.",
        },
      ],
    },
    {
      id: "e9",
      num: 9,
      part: "B",
      session: "w2s2",
      kind: "text",
      title: "Confirmar o exercício 3 por simulação",
      minutes: 15,
      sections: ["s2"],
      prompt: [
        {
          t: "p",
          text: "Confirme a resposta do exercício 3(b) com uma simulação de um milhão de peças, como na secção 2 (`default_rng(0)`).",
        },
      ],
      fields: [
        { id: "code", label: "Código e resultado", rows: 8, mono: true, placeholder: "rng = np.random.default_rng(0)\nn = 1_000_000\n…" },
        { id: "r", label: "Comparação com o valor exato", rows: 2 },
      ],
      criteria: [
        "Simula um milhão de peças com `default_rng(0)`, como na secção 2 (`np.where` com os dois sorteios)",
        "Resultado: 47059 peças marcadas e 0.384",
        "Compara com os 38,0% exatos: a diferença é ruído da simulação",
      ],
      solution: [
        {
          t: "code",
          code: `rng = np.random.default_rng(0)
n = 1_000_000
defeito = rng.random(n) < 0.02
marcada = np.where(defeito, rng.random(n) < 0.90, rng.random(n) < 0.03)
print(marcada.sum(), round(defeito[marcada].mean(), 3))   # 47059 0.384`,
          output: "47059 0.384",
        },
        { t: "p", text: "38,4%, perto dos 38,0% exatos; a diferença é ruído da simulação." },
      ],
    },
    {
      id: "e10",
      num: 10,
      part: "B",
      session: "w2s2",
      kind: "text",
      title: "Máxima verosimilhança de uma Poisson",
      minutes: 25,
      sections: ["s5"],
      prompt: [
        {
          t: "p",
          text: "O número de visitas por minuto a uma página segue muitas vezes uma distribuição de Poisson, com um parâmetro λ que é a média. Em dez minutos observou-se `visitas = np.array([3, 5, 2, 4, 6, 3, 4, 5, 2, 4])`. (a) Calcule a log-verosimilhança para λ entre 0,5 e 10, em passos de 0,01, com `stats.poisson.logpmf(visitas, lam).sum()`. (b) Onde está o máximo? Compare com a média das visitas. (c) Faça o gráfico.",
        },
      ],
      fields: [
        { id: "code", label: "(a) a (c) Código e resultados", rows: 8, mono: true, placeholder: "visitas = np.array([3, 5, 2, 4, 6, 3, 4, 5, 2, 4])\nlams = …" },
        { id: "r", label: "(b) Onde está o máximo e comparação com a média", rows: 3 },
      ],
      criteria: [
        "(a) Log-verosimilhança para λ de 0,5 a 10 em passos de 0,01 (`np.arange(0.5, 10.001, 0.01)`)",
        "(b) Máximo em λ = 3,8, igual à média das visitas (log-verosimilhança máxima −17,928)",
        "(b) Conclui que, tal como na Bernoulli, a estimativa de máxima verosimilhança do parâmetro de uma Poisson é a média da amostra",
        "(c) Gráfico de λ contra a log-verosimilhança, com os eixos identificados",
      ],
      solution: [
        {
          t: "code",
          code: `visitas = np.array([3, 5, 2, 4, 6, 3, 4, 5, 2, 4])
lams = np.arange(0.5, 10.001, 0.01)
lv = np.array([stats.poisson.logpmf(visitas, lam).sum() for lam in lams])
print(round(lams[np.argmax(lv)], 2), visitas.mean(), round(lv.max(), 3))   # 3.8 3.8 -17.928
plt.plot(lams, lv); plt.xlabel("λ"); plt.ylabel("Log-verosimilhança"); plt.show()`,
          output: "3.8 3.8 -17.928",
        },
        {
          t: "p",
          text: "O máximo está em λ = 3,8, a média das visitas. Tal como na Bernoulli, a estimativa de máxima verosimilhança do parâmetro de uma Poisson é a média da amostra.",
        },
      ],
    },
    {
      id: "e11",
      num: 11,
      part: "B",
      session: "w2s1",
      kind: "text",
      title: "O limite central com dados",
      minutes: 25,
      sections: ["s4"],
      prompt: [
        {
          t: "p",
          text: "Simule 100 000 vezes o lançamento de 50 dados (`rng.integers(1, 7, size=(100_000, 50))`, `default_rng(2)`). Para a média dos primeiros k dados, com k = 1, 2, 10 e 50, calcule a média e o desvio padrão das médias, e compare com σ/√k, sabendo que um dado tem σ = √(35/12). Faça os histogramas. A partir de que k parece normal?",
        },
      ],
      fields: [
        { id: "code", label: "Código e resultados", rows: 10, mono: true, placeholder: "rng = np.random.default_rng(2)\ndados = rng.integers(1, 7, size=(100_000, 50))\n…" },
        { id: "r", label: "Comparação com σ/√k e a partir de que k parece normal", rows: 4 },
      ],
      criteria: [
        "Médias dos primeiros k dados com `dados[:, :k].mean(axis=1)`, para k = 1, 2, 10 e 50",
        "A média fica em 3,5 e o desvio padrão segue σ/√k: 1.708, 1.209, 0.54, 0.241 contra 1.708, 1.208, 0.54, 0.242",
        "Histogramas: plano com k = 1 (seis barras iguais), triângulo com k = 2",
        "Com k = 10 já parece um sino; com k = 50 é indistinguível de uma normal",
      ],
      solution: [
        {
          t: "code",
          code: `rng = np.random.default_rng(2)
dados = rng.integers(1, 7, size=(100_000, 50))
sigma = np.sqrt(35 / 12)
for k in [1, 2, 10, 50]:
    medias = dados[:, :k].mean(axis=1)
    print(k, round(medias.mean(), 3), round(medias.std(), 3), round(sigma / np.sqrt(k), 3))
    plt.hist(medias, bins=60, histtype="step", density=True, label=f"k = {k}")
plt.legend(); plt.show()
# 1 3.49 1.708 1.708
# 2 3.497 1.209 1.208
# 10 3.501 0.54 0.54
# 50 3.5 0.241 0.242`,
          output: "1 3.49 1.708 1.708\n2 3.497 1.209 1.208\n10 3.501 0.54 0.54\n50 3.5 0.241 0.242",
        },
        {
          t: "p",
          text: "A média fica em 3,5 e o desvio padrão segue σ/√k. Com k = 1 o histograma é plano (seis barras iguais); com k = 2 é um triângulo; com k = 10 já parece um sino; com k = 50 é indistinguível de uma normal.",
        },
      ],
    },
    {
      id: "e12",
      num: 12,
      part: "C",
      session: "w3s2",
      kind: "text",
      title: "Duas campanhas, duas regiões",
      minutes: 40,
      sections: ["s7", "s6"],
      prompt: [
        { t: "p", text: "Duas campanhas correram em duas regiões:" },
        { t: "code", code: CAMP },
        {
          t: "p",
          text: "(a) Calcule a taxa de conversão de cada campanha por região e no total. (b) A diretora comercial vê só o total e quer acabar com a campanha A. Escreva-lhe uma mensagem de 5 a 8 linhas, sem jargão, a explicar o que os dados mostram de facto. (c) Que experiência proporia para decidir com segurança?",
        },
      ],
      fields: [
        { id: "a", label: "(a) Código e taxas", rows: 8, mono: true, placeholder: "camp[\"taxa\"] = …" },
        { id: "b", label: "(b) Mensagem para a diretora comercial (5 a 8 linhas)", rows: 8 },
        { id: "c", label: "(c) Experiência que proporia", rows: 3 },
      ],
      criteria: [
        "Taxas por região e no total certas: A 10% e B 9% em Lisboa, A 3% e B 2% no Interior; no total A 4,4% e B 7,6% (1,5 de 5)",
        "Mensagem explica a inversão pela distribuição das visitas, sem jargão: A passou 80% das visitas no Interior, B 80% em Lisboa, e A ganha nas duas regiões (2 de 5)",
        "Experiência aleatorizada, por região, com amostra planeada antes de começar (1,5 de 5)",
      ],
      solution: [
        {
          t: "code",
          code: `camp["taxa"] = camp["vendas"] / camp["visitas"]
print(camp.pivot(index="regiao", columns="campanha", values="taxa"))
# campanha     A     B
# regiao              
# Interior  0.03  0.02
# Lisboa    0.10  0.09
total = camp.groupby("campanha")[["vendas", "visitas"]].sum()
print(total["vendas"] / total["visitas"])
# campanha
# A    0.044
# B    0.076
# dtype: float64`,
          output: `campanha     A     B
regiao              
Interior  0.03  0.02
Lisboa    0.10  0.09
campanha
A    0.044
B    0.076
dtype: float64`,
        },
        {
          t: "p",
          text: "(b) Exemplo de mensagem: \"No total, a campanha A converte 4,4% e a B 7,6%, mas a comparação não é justa. A campanha A passou 80% das visitas no Interior, onde se compra muito menos, e a B passou 80% em Lisboa. Comparando região a região, a A ganha nas duas: 10% contra 9% em Lisboa e 3% contra 2% no Interior. Não recomendo acabar com a A com base nestes números.\" (c) Um teste A/B: em cada região, sortear metade das visitas para cada campanha, com o tamanho da amostra calculado antes de começar.",
        },
        {
          t: "table",
          head: ["Critério", "Pontos (em 5)"],
          rows: [
            ["Taxas por região e no total certas", "1,5"],
            ["Mensagem explica a inversão pela distribuição das visitas, sem jargão", "2"],
            ["Experiência aleatorizada, por região, com amostra planeada", "1,5"],
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
            q: "A e B são acontecimentos independentes, com P(A) = 0,3 e P(B) = 0,5. Quanto vale P(A e B)?",
            options: ["0,8", "0,2", "0,15", "0,65"],
            answer: 2,
            explain: "Com independência, P(A e B) = P(A) · P(B) = 0,3 × 0,5 = 0,15. 0,8 seria somar; 0,65 é P(A ou B).",
          },
          {
            kind: "mcq", id: "p2", num: 2, section: "s2", points: 1,
            q: "Um teste deteta 99% dos doentes. Para calcular a probabilidade de uma pessoa com resultado positivo estar doente, o que mais é preciso saber?",
            options: ["Nada: é 99%.", "O tamanho da amostra do estudo.", "O valor-p do teste.", "A prevalência da doença e a taxa de falsos positivos."],
            answer: 3,
            explain: "Pelo teorema de Bayes, P(doente | positivo) depende da proporção de base (a prevalência) e de P(positivo | não doente), não só dos 99%.",
          },
          {
            kind: "mcq", id: "p3", num: 3, section: "s3", points: 1,
            q: "X segue uma binomial com n = 100 e p = 0,1. A esperança e a variância de X são:",
            options: ["10 e 9", "10 e 10", "1 e 0,9", "10 e 3"],
            answer: 0,
            explain: "np = 10 e np(1 − p) = 9.",
          },
          {
            kind: "mcq", id: "p4", num: 4, section: "s3", points: 1,
            q: "Numa distribuição normal, que fração dos valores fica a menos de 2 desvios padrão da média?",
            options: ["Cerca de 68%", "Cerca de 95%", "Cerca de 99,7%", "Cerca de 50%"],
            answer: 1,
            explain: "Regra 68-95-99,7: cerca de 95% a menos de 2 desvios padrão (1,96 exatos).",
          },
          {
            kind: "mcq", id: "p5", num: 5, section: "s4", points: 1,
            q: "Com 100 observações, o erro padrão de uma média é 2. Com 400 observações da mesma população, passa a ser cerca de:",
            options: ["0,5", "4", "1", "8"],
            answer: 2,
            explain: "O erro padrão cai com √n: 2 / √4 = 1.",
          },
          {
            kind: "mcq", id: "p6", num: 6, section: "s5", points: 1,
            q: "Houve 12 compras em 80 visitas independentes. A estimativa de máxima verosimilhança da probabilidade de compra é:",
            options: ["0,12", "0,0667", "0,8", "0,15"],
            answer: 3,
            explain: "Numa Bernoulli, a estimativa de máxima verosimilhança é a proporção observada: 12 / 80 = 0,15.",
          },
          {
            kind: "mcq", id: "p7", num: 7, section: "s5", points: 1,
            q: "Treinar um classificador binário a minimizar a entropia cruzada equivale a:",
            options: [
              "Maximizar a verosimilhança de um modelo de Bernoulli.",
              "Minimizar o erro quadrático médio.",
              "Maximizar o valor-p.",
              "Minimizar o desvio padrão das previsões.",
            ],
            answer: 0,
            explain: "A entropia cruzada binária é a log-verosimilhança negativa média de dados sim ou não (Bernoulli).",
          },
          {
            kind: "mcq", id: "p8", num: 8, section: "s7", points: 1,
            q: "O paradoxo de Simpson acontece quando:",
            options: [
              "Amostras pequenas dão estimativas muito variáveis.",
              "Uma tendência nos dados agregados desaparece ou se inverte dentro dos grupos, por causa de uma variável de confusão.",
              "O valor-p fica abaixo de 0,05 por acaso.",
              "A média de muitas observações se aproxima da esperança.",
            ],
            answer: 1,
            explain: "É uma inversão causada por uma variável de confusão, como o departamento em Berkeley. As outras opções descrevem a variabilidade das amostras pequenas, um falso positivo e a lei dos grandes números.",
          },
        ],
      },
      {
        title: "Grupo II — Resposta curta (8 valores)",
        note: "Sem consulta e sem correr código (pode usar calculadora). 2 valores cada, 3 a 5 linhas por resposta.",
        questions: [
          {
            kind: "open", id: "p9", num: 9, section: "s2", points: 2, rows: 5,
            q: "Explique a diferença entre P(alerta | fraude) e P(fraude | alerta), usando o exemplo da aula. Porque pode a segunda ser muito menor do que a primeira?",
            criteria: [
              { id: "c1", text: "Distinção", points: 1 },
              { id: "c2", text: "Papel da proporção de base", points: 1 },
            ],
            model:
              "P(alerta | fraude) = 95%: das fraudes, quantas dão alerta. P(fraude | alerta) ≈ 16%: dos alertas, quantos são fraude. A segunda depende da proporção de base: a fraude é rara (1%), e 5% de alarmes falsos sobre a enorme massa de transações legítimas (495 em 10 000) são mais do que todas as fraudes apanhadas (95).",
          },
          {
            kind: "open", id: "p10", num: 10, section: "s4", points: 2, rows: 5,
            q: "O que diz o teorema do limite central? Porque é importante para analisar um teste A/B?",
            criteria: [
              { id: "c1", text: "Enunciado", points: 1 },
              { id: "c2", text: "Aplicação ao A/B", points: 1 },
            ],
            model:
              "A média de n observações independentes é aproximadamente normal, com média μ e erro padrão σ/√n, seja qual for a distribuição original. Num teste A/B, a taxa de conversão é uma média de zeros e uns, por isso é aproximadamente normal: dá para calcular o erro padrão, o valor-p e o intervalo, e planear o tamanho da amostra.",
          },
          {
            kind: "open", id: "p11", num: 11, section: "s6", points: 2, rows: 5,
            q: "Um colega conclui: \"o teste A/B deu valor-p 0,20, portanto a versão nova não funciona\". O que está errado neste raciocínio? O que lhe sugeria?",
            criteria: [
              { id: "c1", text: "Erro identificado", points: 1 },
              { id: "c2", text: "Sugestão concreta", points: 1 },
            ],
            model:
              "Um valor-p alto diz que os dados são compatíveis com efeito nulo, não que o efeito é nulo. O teste pode ter pouco poder. Sugestão: ver o intervalo de confiança (pode incluir efeitos interessantes), calcular o tamanho da amostra necessário e repetir ou prolongar o teste de forma planeada.",
          },
          {
            kind: "open", id: "p12", num: 12, section: "s7", points: 2, rows: 5,
            q: "Dê um exemplo de correlação sem causalidade, diga qual é a variável de confusão e explique como um teste aleatorizado evitaria o problema.",
            criteria: [
              { id: "c1", text: "Exemplo e variável de confusão", points: 1 },
              { id: "c2", text: "Papel do sorteio", points: 1 },
            ],
            model:
              "Exemplo: clientes que recebem mais emails compram mais. Variável de confusão: o envolvimento do cliente (os mais ativos subscrevem mais e compram mais). Num teste aleatorizado, um sorteio decide quem recebe mais emails; os dois grupos ficam iguais, em média, em todas as variáveis, medidas ou não, e a diferença nas compras pode atribuir-se aos emails.",
          },
        ],
      },
      {
        title: "Grupo III — Programação (4 valores)",
        note: "Pode usar o Colab, mas não a internet nem assistentes de IA.",
        questions: [
          {
            kind: "open", id: "p13", num: 13, section: "s6", points: 4, rows: 18,
            q: "Uma loja testou uma nova página de pagamento, com as visitas distribuídas por sorteio. Versão A (atual): 2500 visitas, 75 compras. Versão B (nova): 2500 visitas, 105 compras.",
            context: [
              {
                t: "p",
                text: "(a) Calcule as duas taxas de conversão, a diferença, o erro padrão da diferença, o valor-p (bilateral) e o intervalo de confiança de 95%. (b) Calcule um intervalo de 95% por bootstrap, com 5000 reamostragens e `np.random.default_rng(0)`. (c) Simule 2000 testes A/A com 2500 visitas por versão e conversão de 3% (`np.random.default_rng(1)`), e indique a fração com valor-p abaixo de 0,05. (d) Quantas visitas por versão seriam precisas para detetar esta diferença com poder de 80%? Com base em tudo isto, que recomenda à loja, em 3 a 5 linhas?",
              },
            ],
            criteria: [
              { id: "c1", text: "(a) Taxas, diferença, erro padrão, valor-p e intervalo certos", points: 1.5 },
              { id: "c2", text: "(b) Bootstrap certo", points: 0.75 },
              { id: "c3", text: "(c) Simulação A/A e interpretação", points: 0.75 },
              { id: "c4", text: "(d) Tamanho da amostra e recomendação com as ressalvas", points: 1 },
            ],
            model:
              "\"A versão B converte mais (4,2% contra 3,0%) e a diferença é significativa: o intervalo de 95% vai de +0,2 a +2,2 pontos, e o bootstrap confirma. Recomendo adotar a B. O teste teve 2500 visitas por versão, menos do que as 3780 recomendadas, por isso o ganho real deve estar mais perto do limite de baixo do intervalo do que dos +1,2 pontos observados. A simulação A/A mostra que cerca de 4 a 5% dos testes dão 'vencedores' por acaso; vale a pena continuar a medir depois da mudança.\"",
            modelBlocks: [
              {
                t: "code",
                code: `ca, na, cb, nb = 75, 2_500, 105, 2_500
pa, pb = ca / na, cb / nb
dif = pb - pa
ep = np.sqrt(pa * (1 - pa) / na + pb * (1 - pb) / nb)
z = dif / ep
valor_p = 2 * stats.norm.sf(abs(z))
print(pa, pb, round(dif, 4), round(ep, 5), round(z, 2), round(valor_p, 4))   # 0.03 0.042 0.012 0.00527 2.28 0.0227
print(round(dif - 1.96 * ep, 4), round(dif + 1.96 * ep, 4))                # 0.0017 0.0223

a = np.r_[np.ones(ca), np.zeros(na - ca)]                                   # (b)
b = np.r_[np.ones(cb), np.zeros(nb - cb)]
rng = np.random.default_rng(0)
difs = np.array([rng.choice(b, b.size).mean() - rng.choice(a, a.size).mean() for _ in range(5_000)])
lo, hi = np.percentile(difs, [2.5, 97.5])
print(f"{lo:.4f} {hi:.4f}")                                                 # 0.0020 0.0224

def teste_ab(conv_a, conv_b, n):                                            # (c)
    pa, pb = conv_a / n, conv_b / n
    ep = np.sqrt(pa * (1 - pa) / n + pb * (1 - pb) / n)
    return 2 * stats.norm.sf(abs((pb - pa) / ep))
rng = np.random.default_rng(1)
conv = rng.binomial(2_500, 0.03, size=(2_000, 2))
pv = np.array([teste_ab(c[0], c[1], 2_500) for c in conv])
print(round((pv < 0.05).mean(), 3))                                         # 0.039

z_a, z_b = stats.norm.ppf(0.975), stats.norm.ppf(0.80)                      # (d)
print(int(np.ceil((z_a + z_b)**2 * (pa * (1 - pa) + pb * (1 - pb)) / (pb - pa)**2)))   # 3780`,
                output: "0.03 0.042 0.012 0.00527 2.28 0.0227\n0.0017 0.0223\n0.0020 0.0224\n0.039\n3780",
              },
            ],
          },
        ],
      },
    ],
  },
  examReviewNote:
    "Se a nota ficar abaixo de 14: rever as secções das perguntas falhadas (1, 2 e 9 → secção 2, probabilidade condicional e Bayes; 3 e 4 → secção 3, variáveis aleatórias e distribuições; 5 e 10 → secção 4, lei dos grandes números e TLC; 6 e 7 → secção 5, máxima verosimilhança; 11 e 13 → secção 6, intervalos de confiança e testes A/B; 8 e 12 → secção 7, Simpson e causalidade) e repetir a prova uma semana depois.",

  // ---------------------------------------------------------------- SIMULADO DE TREINO (banco extra da plataforma)
  practice: {
    mcq: [
      {
        id: "q1", section: "s1",
        q: "Em que leitura da probabilidade assenta a frase \"a probabilidade de conversão é 3%\" num teste A/B?",
        options: ["Grau de crença sobre uma visita concreta", "Frequência a longo prazo: em muitas visitas, cerca de 3 em cada 100 compram", "Probabilidade de a hipótese nula ser verdadeira", "Proporção de alertas falsos"],
        answer: 1,
        explain: "É a leitura dos testes A/B e da lei dos grandes números. O grau de crença é a leitura do teorema de Bayes.",
      },
      {
        id: "q2", section: "s1",
        q: "O filtro de spam do M1 devolvia `[0.92 0.08]`. Em probabilidade, isto é…",
        options: ["Um intervalo de confiança", "Um valor-p para cada classe", "Uma distribuição de probabilidade sobre duas classes", "A entropia cruzada do modelo"],
        answer: 2,
        explain: "Dois números entre 0 e 1 que somam 1: uma probabilidade para cada classe.",
      },
      {
        id: "q3", section: "s2",
        q: "P(A) = 0,4, P(B) = 0,5 e P(A e B) = 0,1. Quanto vale P(A ou B)?",
        options: ["0,9", "0,8", "0,2", "1,0"],
        answer: 1,
        explain: "Regra da união: 0,4 + 0,5 − 0,1 = 0,8. Subtrai-se o que foi contado duas vezes.",
      },
      {
        id: "q4", section: "s2",
        q: "P(A e B) = 0,12 e P(B) = 0,4. Quanto vale P(A | B)?",
        options: ["0,048", "0,52", "0,12", "0,3"],
        answer: 3,
        explain: "P(A | B) = P(A e B) / P(B) = 0,12 / 0,4 = 0,3.",
      },
      {
        id: "q5", section: "s2",
        q: "No exemplo do alerta de fraude, de 10 000 transações, quantas dão alerta?",
        options: ["590", "95", "495", "100"],
        answer: 0,
        explain: "95 fraudes apanhadas (95% de 100) mais 495 alarmes falsos (5% de 9900): 590. Só 95 delas são fraude.",
      },
      {
        id: "q6", section: "s2",
        q: "Com o mesmo detetor da aula (95% de fraudes apanhadas, 5% de alarmes falsos), se a fraude fosse 10% das transações, P(fraude | alerta) seria…",
        options: ["16%, como antes", "95%", "Cerca de 68%", "Cerca de 10%"],
        answer: 2,
        explain: "0,95 × 0,1 / (0,95 × 0,1 + 0,05 × 0,9) = 0,095 / 0,14 ≈ 0,68. Com uma proporção de base maior, os alertas são muito mais fiáveis.",
      },
      {
        id: "q7", section: "s3",
        q: "Uma Bernoulli com p = 0,3 tem variância…",
        options: ["0,21", "0,3", "0,09", "0,7"],
        answer: 0,
        explain: "Var(X) = p(1 − p) = 0,3 × 0,7 = 0,21.",
      },
      {
        id: "q8", section: "s3",
        q: "Em `X = stats.binom(200, 0.03)`, o que dá `X.sf(9)`?",
        options: ["P(X = 9)", "P(X ≤ 9)", "O valor x que deixa 9% abaixo", "P(X > 9), o mesmo que P(X ≥ 10)"],
        answer: 3,
        explain: "`sf` é a função de sobrevivência, 1 − `cdf`. Numa contagem, X > 9 é o mesmo que X ≥ 10: dá 0.081.",
      },
      {
        id: "q9", section: "s3",
        q: "Que método das distribuições do SciPy é o inverso da `cdf`?",
        options: ["`pmf`", "`ppf`", "`sf`", "`rvs`"],
        answer: 1,
        explain: "`ppf` dá o valor x com P(X ≤ x) = q. Por exemplo, `stats.norm(0, 1).ppf(0.975)` dá 1.96.",
      },
      {
        id: "q10", section: "s3",
        q: "X segue uma normal com μ = 100 e σ = 15. Que fração dos valores fica, aproximadamente, entre 70 e 130?",
        options: ["68%", "99,7%", "95%", "50%"],
        answer: 2,
        explain: "70 e 130 estão a 2 desvios padrão da média: cerca de 95% (0,9545).",
      },
      {
        id: "q11", section: "s4",
        q: "Uma loja nova teve 3 vendas em 50 visitas. Qual é a conclusão certa?",
        options: ["A conversão é 6%.", "A conversão é o dobro dos 3% do mercado.", "A lei dos grandes números garante que a conversão é 6%.", "Os dados são insuficientes para estimar bem a conversão."],
        answer: 3,
        explain: "Amostras pequenas variam muito: na aula, 100 visitas deram 4% com uma probabilidade real de 3%. Confiar nelas é a \"lei dos pequenos números\".",
      },
      {
        id: "q12", section: "s4",
        q: "Os valores das encomendas têm σ = 50 €. Qual é o erro padrão da média de 25 encomendas?",
        options: ["2 €", "10 €", "50 €", "25 €"],
        answer: 1,
        explain: "σ/√n = 50 / √25 = 10 €.",
      },
      {
        id: "q13", section: "s4",
        q: "Passar o mini-lote de 32 para 128 exemplos reduz o ruído do gradiente para…",
        options: ["metade", "um quarto", "um oitavo", "nada: o ruído não depende do lote"],
        answer: 0,
        explain: "O gradiente de um mini-lote é uma média; o ruído cai com a raiz do tamanho do lote: √(128/32) = 2.",
      },
      {
        id: "q14", section: "s4",
        q: "Em que caso a aproximação normal do TLC pode falhar?",
        options: [
          "Com 30 encomendas independentes de uma distribuição assimétrica",
          "Com médias de zeros e uns",
          "Com observações muito dependentes, como visitas da mesma pessoa",
          "Com uma distribuição de partida exponencial",
        ],
        answer: 2,
        explain: "O TLC exige observações independentes e variância finita. Com dados muito dependentes ou caudas extremas, a aproximação pode falhar.",
      },
      {
        id: "q15", section: "s5",
        q: "Porque é que `np.prod(np.full(2000, 0.5))` dá `0.0`?",
        options: [
          "Porque o NumPy arredonda 0,5 para 0",
          "Porque 0,5²⁰⁰⁰ é tão pequeno que a vírgula flutuante o arredonda para zero",
          "Porque o NumPy não multiplica mais de 1000 números",
          "Porque há um erro no código",
        ],
        answer: 1,
        explain: "É por isso que se usa a log-verosimilhança: a soma dos logaritmos dá −1386.29, um número perfeitamente representável.",
      },
      {
        id: "q16", section: "s5",
        q: "Com os dados da aula (7 compras em 20), qual destes valores tem a maior log-verosimilhança?",
        options: ["p = 0,2", "p = 0,5", "p = 0,35", "São iguais"],
        answer: 2,
        explain: "−12,949 para 0,35, contra −14,167 para 0,2 e −13,863 para 0,5. O máximo está na proporção observada, 7/20.",
      },
      {
        id: "q17", section: "s5",
        q: "A derivada de log L(p) = k·log p + (n − k)·log(1 − p) anula-se em…",
        options: ["p = k/n", "p = 0,5", "p = n/k", "p = (n − k)/n"],
        answer: 0,
        explain: "k/p − (n − k)/(1 − p) = 0 dá p = k/n: a estimativa de máxima verosimilhança é a proporção observada.",
      },
      {
        id: "q18", section: "s5",
        q: "Que perda resulta da máxima verosimilhança quando o ruído é normal, com variância fixa?",
        options: ["Entropia cruzada binária", "Erro absoluto médio", "Erro quadrático médio", "Entropia cruzada"],
        answer: 2,
        explain: "A log-verosimilhança é uma constante menos a soma dos erros ao quadrado a dividir por 2σ²: maximizá-la é minimizar o EQM.",
      },
      {
        id: "q19", section: "s6",
        q: "Com 400 visitas e 20 compras, qual é o erro padrão da proporção?",
        options: ["0,05", "0,0022", "0,0475", "Cerca de 0,0109"],
        answer: 3,
        explain: "p̂ = 0,05 e √(0,05 × 0,95 / 400) ≈ 0,0109. O intervalo de 95% é 0,05 ± 0,021.",
      },
      {
        id: "q20", section: "s6",
        q: "O que é o valor-p?",
        options: [
          "A probabilidade de, se H₀ fosse verdadeira, observar uma diferença pelo menos tão grande como a observada",
          "A probabilidade de H₀ ser verdadeira",
          "O tamanho do efeito",
          "A probabilidade de o efeito ser importante",
        ],
        answer: 0,
        explain: "Não é a probabilidade de H₀ e não diz se o efeito é grande ou importante (Wasserstein & Lazar, 2016).",
      },
      {
        id: "q21", section: "s6",
        q: "Para detetar 3,00% → 3,75% eram precisas 9097 visitas por versão. Para detetar 3,00% → 3,375% (metade do efeito), seriam precisas cerca de…",
        options: ["4500", "18 000", "34 000", "9100, as mesmas"],
        answer: 2,
        explain: "O tamanho cresce com o inverso do quadrado do efeito: metade do efeito, cerca de quatro vezes mais visitas. A conta exata dá 34 444 por versão.",
      },
      {
        id: "q22", section: "s6",
        q: "Uma equipa corre 20 testes A/A em paralelo, com o limiar de 0,05. Quantos \"vencedores\" falsos deve esperar?",
        options: ["Nenhum", "Cerca de 1", "Cerca de 5", "Cerca de 10"],
        answer: 1,
        explain: "Cerca de 5% de 20 testes: 1. Por isso um \"vencedor\" entre muitos testes não prova nada.",
      },
      {
        id: "q23", section: "s7",
        q: "Nos dados de Berkeley, qual é a variável de confusão?",
        options: ["O sexo de quem se candidata", "A taxa de admissão", "O ano da candidatura", "O departamento a que cada pessoa se candidatou"],
        answer: 3,
        explain: "Está ligado ao sexo de quem se candidata e à taxa de admissão: os homens concentraram-se nos departamentos que admitem mais.",
      },
      {
        id: "q24", section: "s7",
        q: "Porque é que um teste A/B aleatorizado permite falar de causa e um histórico de vendas não?",
        options: [
          "Porque o teste A/B tem mais observações",
          "Porque o sorteio equilibra em média todas as variáveis, medidas ou não",
          "Porque o teste A/B usa um valor-p",
          "Porque o histórico de vendas tem erros",
        ],
        answer: 1,
        explain: "Nos dados observacionais, os grupos podem diferir em variáveis de confusão que não se mediram.",
      },
      {
        id: "q25", section: "s7",
        q: "Um modelo de visão reconhece vacas pela relva que está por trás e falha numa vaca na praia. Como se chama o fenómeno?",
        options: ["Paradoxo de Simpson", "Lei dos pequenos números", "Aprendizagem por atalhos", "Proporção de base"],
        answer: 2,
        explain: "O modelo aprende correlações, não causas (Geirhos et al., 2020).",
      },
    ],
    tf: [
      { id: "v1", section: "s2", q: "P(alerta | fraude) e P(fraude | alerta) são sempre iguais.", answer: false, explain: "No exemplo da aula, a primeira é 95% e a segunda cerca de 16%. Confundi-las é um dos erros mais comuns." },
      { id: "v2", section: "s2", q: "Se A e B são independentes, P(A e B) = P(A) · P(B).", answer: true, explain: "É a regra da independência; sem independência, não vale." },
      { id: "v3", section: "s2", q: "No exemplo da aula, cerca de 84% dos alertas são falsos.", answer: true, explain: "495 dos 590 alertas são de transações legítimas: 495 / 590 = 1 − 0,161 ≈ 0,84." },
      { id: "v4", section: "s3", q: "Com 200 visitas e conversão de 3%, um dia com exatamente 6 vendas, o valor mais provável, acontece em cerca de 16% dos dias.", answer: true, explain: "`stats.binom(200, 0.03).pmf(6)` dá 0.163." },
      { id: "v5", section: "s3", q: "Os valores de encomendas costumam seguir uma distribuição normal.", answer: false, explain: "Têm caudas longas à direita: muitas pequenas e algumas grandes. Fazer um histograma antes de assumir uma distribuição." },
      { id: "v6", section: "s4", q: "Para reduzir o erro padrão de uma média para metade, basta o dobro dos dados.", answer: false, explain: "O erro padrão encolhe com √n: é preciso quatro vezes mais dados." },
      { id: "v7", section: "s4", q: "O teorema do limite central só vale se os dados de partida forem normais.", answer: false, explain: "Vale seja qual for a distribuição original, com observações independentes e variância finita." },
      { id: "v8", section: "s5", q: "A log-verosimilhança tem o máximo no mesmo sítio que a verosimilhança.", answer: true, explain: "O logaritmo é crescente: transforma o produto numa soma sem mudar onde está o máximo." },
      { id: "v9", section: "s5", q: "Com os dados da aula (7 compras em 20), a entropia cruzada binária no ótimo é cerca de 0,647.", answer: true, explain: "`-lv.max() / len(dados)` dá 0.6474." },
      { id: "v10", section: "s6", q: "Um valor-p pequeno quer dizer que o efeito é grande.", answer: false, explain: "Um valor-p pequeno não diz se o efeito é grande ou importante; com muitos dados, efeitos minúsculos dão valores-p pequenos." },
      { id: "v11", section: "s6", q: "O bootstrap reamostra os dados sem reposição.", answer: false, explain: "Reamostra com reposição, milhares de vezes, e vê quanto o resultado varia." },
      { id: "v12", section: "s6", q: "Espreitar um teste A/B todos os dias e pará-lo quando o valor-p desce abaixo de 0,05 aumenta a taxa de falsos positivos.", answer: true, explain: "O tamanho da amostra decide-se antes de começar (Kohavi, Tang & Xu, 2020)." },
      { id: "v13", section: "s7", q: "Dados observacionais, por si só, não mostram causalidade.", answer: true, explain: "Os grupos podem diferir em variáveis de confusão que não se mediram. É preciso aleatorizar ou usar métodos causais próprios." },
      { id: "v14", section: "s7", q: "No paradoxo de Simpson, a tendência dos dados agregados pode inverter-se quando se separam os grupos.", answer: true, explain: "Em Berkeley, os homens tinham mais admissões no total, mas as mulheres tinham taxas iguais ou maiores em quatro dos seis departamentos." },
    ],
  },

  // ---------------------------------------------------------------- CARTÕES
  flashcards: [
    { id: "f1", section: "s1", tag: "Probabilidade", front: "As duas leituras de uma probabilidade", back: "Frequência a longo prazo (em muitas visitas, 3 em 100 compram: testes A/B) e grau de crença (o que se deve acreditar com a informação disponível, que muda com informação nova: Bayes)." },
    { id: "f2", section: "s2", tag: "Probabilidade", front: "Regras do complementar, da união e da independência", back: "P(não A) = 1 − P(A); P(A ou B) = P(A) + P(B) − P(A e B); P(A e B) = P(A) · P(B), só se A e B forem independentes." },
    { id: "f3", section: "s2", tag: "Probabilidade", front: "Probabilidade condicional P(A | B)", back: "Probabilidade de A sabendo que B aconteceu: P(A e B) / P(B). Restringe o universo aos casos em que B aconteceu." },
    { id: "f4", section: "s2", tag: "Bayes", front: "Teorema de Bayes", back: "P(A | B) = P(B | A) · P(A) / P(B), com P(B) = P(B | A) · P(A) + P(B | não A) · P(não A). P(A) é o a priori; P(A | B) o a posteriori." },
    { id: "f5", section: "s2", tag: "Bayes", front: "O alerta de fraude da aula (1%, 95%, 5%)", back: "De 10 000 transações: 95 fraudes com alerta e 495 alarmes falsos. P(fraude | alerta) = 95 / 590 ≈ 16%, não 95%." },
    { id: "f6", section: "s2", tag: "Bayes", front: "Frequências naturais", back: "Trocar percentagens por contagens (de 10 000 casos…): torna o raciocínio bayesiano muito mais fácil (Gigerenzer & Hoffrage, 1995)." },
    { id: "f7", section: "s2", tag: "Bayes", front: "Esquecer a proporção de base", back: "Ignorar que o acontecimento é raro (Kahneman & Tversky, 1973): quando a fraude é rara, a maior parte dos alertas é falsa, mesmo com um bom detetor." },
    { id: "f8", section: "s3", tag: "Distribuições", front: "Esperança e variância", back: "E[X] = Σ x · P(X = x), a média a longo prazo. Var(X) = E[(X − E[X])²] = E[X²] − E[X]². O desvio padrão σ = √Var(X) tem as unidades de X." },
    { id: "f9", section: "s3", tag: "Distribuições", front: "Bernoulli e binomial", back: "Bernoulli(p): um sim ou não, E = p, Var = p(1 − p). Binomial(n, p): sins em n tentativas independentes, E = np, Var = np(1 − p)." },
    { id: "f10", section: "s3", tag: "Distribuições", front: "200 visitas por dia, conversão de 3%", back: "Binomial: espera-se 6 vendas, desvio padrão 2,41. P(X = 6) = 0,163; P(X ≥ 10) = 0,081, por isso um dia com 10 vendas não prova nada." },
    { id: "f11", section: "s3", tag: "Distribuições", front: "Regra 68-95-99,7", back: "Numa normal, 68% dos valores a menos de 1σ da média, 95% a menos de 2σ (1,96σ exatos) e 99,7% a menos de 3σ." },
    { id: "f12", section: "s3", tag: "SciPy", front: "`pmf`/`pdf`, `cdf`, `sf`, `ppf`, `rvs`", back: "Probabilidade ou densidade num ponto; P(X ≤ x); P(X > x); o inverso da `cdf`; gerar amostras. Iguais em `stats.binom`, `stats.norm`, `stats.poisson`…" },
    { id: "f13", section: "s3", tag: "SciPy", front: "Gerar números aleatórios num programa", back: "`rng = np.random.default_rng(semente)` e depois `rng.random`, `rng.binomial`, `rng.normal`… A semente fixa torna os resultados reprodutíveis." },
    { id: "f14", section: "s4", tag: "LGN e TLC", front: "Lei dos grandes números", back: "A média de muitas observações independentes aproxima-se da esperança. Com 10 visitas a taxa foi 0%, com 100 foi 4%; só com milhares se aproxima dos 3%." },
    { id: "f15", section: "s4", tag: "LGN e TLC", front: "\"Lei dos pequenos números\" (Tversky & Kahneman, 1971)", back: "A tendência de confiar demasiado em amostras pequenas. 3 vendas em 50 visitas não são \"6% de conversão\": são dados insuficientes." },
    { id: "f16", section: "s4", tag: "LGN e TLC", front: "Teorema do limite central", back: "A média de n observações independentes é aproximadamente normal, N(μ, σ²/n), seja qual for a distribuição original. Erro padrão = σ/√n." },
    { id: "f17", section: "s4", tag: "LGN e TLC", front: "O erro padrão encolhe com √n", back: "Para reduzir o erro para metade, é preciso quatro vezes mais dados. Por isso os testes A/B precisam de tantos visitantes." },
    { id: "f18", section: "s4", tag: "LGN e TLC", front: "Quando o TLC pode falhar", back: "O TLC exige observações independentes e variância finita. Pode falhar com dados muito dependentes (visitas da mesma pessoa, dias seguidos de uma série temporal) ou com caudas extremas." },
    { id: "f19", section: "s5", tag: "Verosimilhança", front: "Máxima verosimilhança (Fisher, 1922)", back: "Escolher os parâmetros que tornam os dados observados o mais prováveis possível: θ̂ = argmax Σ log P(yᵢ | θ)." },
    { id: "f20", section: "s5", tag: "Verosimilhança", front: "Porquê o logaritmo da verosimilhança", back: "Transforma o produto numa soma, tem o máximo no mesmo sítio e evita que o produto de milhares de probabilidades arredonde para zero." },
    { id: "f21", section: "s5", tag: "Verosimilhança", front: "Máxima verosimilhança de uma Bernoulli", back: "A proporção observada, p = k/n: 7 compras em 20 visitas dão p = 0,35. A derivada k/p − (n − k)/(1 − p) anula-se aí." },
    { id: "f22", section: "s5", tag: "Verosimilhança", front: "Entropia cruzada binária", back: "A log-verosimilhança negativa média de dados sim ou não: −(1/n) Σ [yᵢ log pᵢ + (1 − yᵢ) log(1 − pᵢ)]. A perda da regressão logística (M8); com K classes, a dos LLMs (M17)." },
    { id: "f23", section: "s5", tag: "Verosimilhança", front: "Hipótese sobre os dados → perda", back: "Ruído normal → EQM; ruído de Laplace → MAE; sim ou não → entropia cruzada binária; uma de K classes → entropia cruzada." },
    { id: "f24", section: "s6", tag: "Inferência", front: "Intervalo de confiança de 95% de uma proporção", back: "p̂ ± 1,96 · √(p̂(1 − p̂)/n). 120 compras em 4000 visitas: 2,5% a 3,5%. 95% dos intervalos construídos assim contêm o valor verdadeiro." },
    { id: "f25", section: "s6", tag: "Inferência", front: "Valor-p", back: "A probabilidade de, se H₀ fosse verdadeira, observar uma diferença pelo menos tão grande como a observada. Não é P(H₀) e não mede o tamanho do efeito." },
    { id: "f26", section: "s6", tag: "Testes A/B", front: "Teste A/B de duas proporções", back: "ep = √(pa(1 − pa)/na + pb(1 − pb)/nb); z = (pb − pa)/ep; valor-p = 2 · sf(|z|); IC = dif ± 1,96 · ep." },
    { id: "f27", section: "s6", tag: "Testes A/B", front: "O teste do botão da aula (120/4000 contra 150/4000)", back: "Valor-p 0,063 e intervalo de −0,04 a +1,54 pontos: inclui o zero. A conclusão honesta é \"ainda não se sabe\", não \"B não funciona\"." },
    { id: "f28", section: "s6", tag: "Testes A/B", front: "Bootstrap (Efron, 1979)", back: "Reamostrar os próprios dados, com reposição, milhares de vezes, e ver quanto o resultado varia. Dá intervalos sem fórmulas, para qualquer estatística." },
    { id: "f29", section: "s6", tag: "Testes A/B", front: "Teste A/A", back: "A mesma versão dos dois lados: cerca de 5% dão \"significativo\" por acaso. 20 testes em paralelo → espera-se um \"vencedor\" falso." },
    { id: "f30", section: "s6", tag: "Testes A/B", front: "Poder e tamanho da amostra", back: "Poder: probabilidade de detetar um efeito que existe (80% é o habitual). Para 3,00% → 3,75%: 9097 visitas por versão. Metade do efeito exige cerca de quatro vezes mais." },
    { id: "f31", section: "s7", tag: "Armadilhas", front: "Paradoxo de Simpson", back: "Uma tendência nos dados agregados desaparece ou inverte-se quando se separam os grupos, por causa de uma variável de confusão. Em Berkeley: o departamento." },
    { id: "f32", section: "s7", tag: "Armadilhas", front: "Variável de confusão", back: "Uma variável ligada às duas que se comparam: o departamento estava ligado ao sexo de quem se candidatava e à taxa de admissão; o calor, aos gelados e aos afogamentos." },
    { id: "f33", section: "s7", tag: "Armadilhas", front: "As quatro explicações de uma correlação", back: "A causa B; B causa A; uma terceira variável causa as duas; ou coincidência, sobretudo quando se procuraram muitas relações." },
    { id: "f34", section: "s7", tag: "Armadilhas", front: "Aprendizagem por atalhos (Geirhos et al., 2020)", back: "O modelo aprende uma correlação em vez da causa, como a relva em vez da vaca, e falha fora da distribuição de treino." },
  ],

  // ---------------------------------------------------------------- NOTEBOOK
  notebook: {
    filename: "M6 — exercícios",
    cells: [
      {
        type: "md",
        source:
          "# M6 — Probabilidade e estatística\n\nExemplos da aula (correr pela ordem, no mesmo notebook) e os exercícios 7 a 12. Os exercícios 1 a 6 fazem-se à mão. Guardar no Drive, na pasta da Fase 1.",
      },
      { type: "code", source: IMPORTS },
      { type: "md", source: "## 2. Probabilidade condicional e teorema de Bayes" },
      { type: "code", source: BAYES_CODE.replace("import numpy as np\nimport pandas as pd\nfrom scipy import stats\nnp.set_printoptions(precision=3, suppress=True)\n\n", "") },
      { type: "md", source: "## 3. Variáveis aleatórias e distribuições" },
      { type: "code", source: BINOM_CODE },
      { type: "code", source: NORM_CODE },
      { type: "md", source: "## 4. Lei dos grandes números e teorema do limite central" },
      { type: "code", source: LGN_CODE },
      { type: "code", source: TLC_CODE },
      { type: "md", source: "## 5. Máxima verosimilhança" },
      { type: "code", source: LOG_CODE },
      { type: "code", source: VERO_CODE },
      { type: "code", source: CE_CODE },
      { type: "md", source: "## 6. Intervalos de confiança, testes de hipóteses e testes A/B" },
      { type: "code", source: IC_CODE },
      { type: "code", source: AB_CODE },
      { type: "code", source: BOOT_CODE },
      { type: "code", source: AA_CODE },
      { type: "code", source: N_CODE },
      { type: "md", source: "## 7. Paradoxo de Simpson: as admissões de Berkeley" },
      { type: "code", source: UCB_CODE },
      { type: "code", source: UCB_CAND },
      {
        type: "md",
        source:
          "## Exercício 7\n\nAssunto A: 5000 envios, 900 aberturas. Assunto B: 5000 envios, 990 aberturas. (a) Diferença, erro padrão, valor-p e intervalo de 95%; (b) bootstrap com 5000 reamostragens e `default_rng(3)`; (c) envios por versão para poder de 80%; (d) recomendação.",
      },
      { type: "code", source: "ca, na, cb, nb = 900, 5_000, 990, 5_000\n\n# (a)\n# (b)\n# (c)\n" },
      { type: "md", source: "(d) Recomendação:\n\n" },
      {
        type: "md",
        source:
          "## Exercício 8\n\n10 000 valores de uma normal (média 50, desvio padrão 10) e 10 000 de uma exponencial (média 50), com `default_rng(1)`, primeiro a normal. Fração a menos de 1, 2 e 3 desvios padrão da média.",
      },
      { type: "code", source: "rng = np.random.default_rng(1)\n" },
      { type: "md", source: "## Exercício 9\n\nConfirmar o exercício 3(b) com um milhão de peças (`default_rng(0)`)." },
      { type: "code", source: "rng = np.random.default_rng(0)\nn = 1_000_000\n" },
      {
        type: "md",
        source:
          "## Exercício 10\n\n(a) Log-verosimilhança de uma Poisson para λ entre 0,5 e 10, em passos de 0,01, com `stats.poisson.logpmf(visitas, lam).sum()`; (b) onde está o máximo, comparado com a média; (c) o gráfico.",
      },
      { type: "code", source: `${VISITAS_POISSON}\n` },
      {
        type: "md",
        source:
          "## Exercício 11\n\n100 000 lançamentos de 50 dados (`rng.integers(1, 7, size=(100_000, 50))`, `default_rng(2)`). Para k = 1, 2, 10 e 50: média e desvio padrão das médias dos primeiros k dados, comparados com σ/√k (σ = √(35/12)), e os histogramas.",
      },
      { type: "code", source: "rng = np.random.default_rng(2)\n" },
      {
        type: "md",
        source:
          "## Exercício 12\n\n(a) Taxa de conversão de cada campanha por região e no total; (b) mensagem de 5 a 8 linhas para a diretora comercial; (c) a experiência que proporia.",
      },
      { type: "code", source: `${CAMP}\n\n# (a)\n` },
      { type: "md", source: "(b) Mensagem:\n\n(c) Experiência:\n" },
      { type: "md", source: "## Notas\n\nO que aprendi neste módulo, em três frases:" },
    ],
  },
  source: "curso-engenharia-ia 3/modulo-06-probabilidade-estatistica",
};
