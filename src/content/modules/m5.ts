import type { ModuleContent } from "../types";

// Módulo 5 — Cálculo e otimização para IA.
// Fonte: curso-engenharia-ia 3/modulo-05-calculo-otimizacao (01-aula, 02-apostila, 03-exercicios, 04-prova, 05-gabarito,
// codigo/exemplos_m5.py, codigo/figuras_m5.py e img/). As seis imagens da aula entram como figuras. Não há renderizador de
// LaTeX: as fórmulas da aula estão em blocos "Fórmula", escritas em Unicode (com ′ em vez de ' para a derivada).
// A derivada e a tangente, o grafo computacional do neurónio e a descida do gradiente têm widgets interativos
// (src/components/widgets/m5), com a lógica testada contra NumPy 2.5. Todo o código da aula e do gabarito foi corrido em
// Python 3.13 e NumPy 2.5: o campo `output` de cada bloco tem o resultado real, igual ao dos comentários.
// As verificações rápidas, o banco do simulado e os cartões foram escritos pela plataforma a partir da aula.

// ---------------------------------------------------------------- código da aula (01-aula.md)

const C_PERDA = String.raw`import numpy as np
np.set_printoptions(precision=3, suppress=True)

x = np.array([1, 2, 3, 4, 5])
y = np.array([2.1, 3.9, 6.2, 7.8, 10.1])

def perda(w):
    return np.mean((w * x - y) ** 2)

for w in [1, 2, 3]:
    print(w, round(perda(w), 3))
# 1 11.102
# 2 0.022
# 3 10.942`;

const C_DERIVADA = String.raw`def derivada(f, x, h=1e-5):
    """Derivada aproximada por diferenças centrais."""
    return (f(x + h) - f(x - h)) / (2 * h)

def f(x):
    return x**2 - 4*x + 5          # derivada exata: 2x - 4

print(round(derivada(f, 3), 6), round(derivada(f, 2), 6))   # 2.0 0.0`;

const C_ERRO_H = String.raw`for h in [1e-1, 1e-5, 1e-12]:
    erro = abs(derivada(np.exp, 1.0, h) - np.e)
    print(f"h = {h:.0e}   erro = {erro:.1e}")
# h = 1e-01   erro = 4.5e-03
# h = 1e-05   erro = 5.9e-11
# h = 1e-12   erro = 2.1e-04`;

const C_DPERDA = String.raw`def dperda(w):
    return np.mean(2 * (w * x - y) * x)

print(round(dperda(1), 2), round(derivada(perda, 1.0), 2))   # -22.08 -22.08: confere
print(round(dperda(3), 2))                                     # 21.92`;

const C_WOTIMO = String.raw`w_otimo = (x @ y) / (x @ x)
print(round(w_otimo, 4), round(perda(w_otimo), 4))   # 2.0036 0.0219`;

const C_GRAD = String.raw`def g(v):
    x, y = v
    return x**2 + 3 * y**2

def grad_g(v):
    x, y = v
    return np.array([2 * x, 6 * y])

def gradiente_numerico(f, v, h=1e-5):
    """Uma derivada central por coordenada, mexendo uma de cada vez."""
    v = np.asarray(v, dtype=float)
    grad = np.zeros_like(v)
    for i in range(len(v)):
        passo = np.zeros_like(v)
        passo[i] = h
        grad[i] = (f(v + passo) - f(v - passo)) / (2 * h)
    return grad

print(grad_g([1, 1]), gradiente_numerico(g, [1, 1]))   # [2 6] [2. 6.]`;

const C_CADEIA = String.raw`def h_(x):
    return (3 * x + 1) ** 2

print(2 * (3 * 1 + 1) * 3, round(derivada(h_, 1.0), 6))   # 24 24.0`;

const C_IDA = String.raw`def sigmoide(z):
    return 1 / (1 + np.exp(-z))

xe, ye = 2.0, 1.0          # uma entrada e a resposta certa
w, b = 0.5, -0.5           # parâmetros atuais

z = w * xe + b
a = sigmoide(z)
L = (a - ye) ** 2
print(round(z, 4), round(a, 4), round(L, 4))    # 0.5 0.6225 0.1425`;

const C_VOLTA = String.raw`dL_da = 2 * (a - ye)       # derivada de (a - y)²
da_dz = a * (1 - a)        # derivada da sigmoide, já com o a da ida
dL_dz = dL_da * da_dz
dL_dw = dL_dz * xe         # z = wx + b: dz/dw = x
dL_db = dL_dz * 1          # dz/db = 1
print(round(dL_da, 4), round(da_dz, 4), round(dL_dz, 4), round(dL_dw, 4), round(dL_db, 4))
# -0.7551 0.235 -0.1774 -0.3549 -0.1774

# Verificação com a derivada numérica da secção 2
def perda_neuronio(w, b):
    return (sigmoide(w * xe + b) - ye) ** 2
print(round(derivada(lambda w_: perda_neuronio(w_, b), w), 4),
      round(derivada(lambda b_: perda_neuronio(w, b_), b), 4))   # -0.3549 -0.1774: confere`;

const C_GD = String.raw`w = 0.0
eta = 0.01                                   # taxa de aprendizagem
for passo in range(1, 51):
    w = w - eta * dperda(w)
    if passo in (1, 5, 10, 20, 50):
        print(passo, round(w, 4), round(perda(w), 4))
# 1 0.4408 26.8889
# 5 1.4252 3.7029
# 10 1.8366 0.3287
# 20 1.9897 0.024
# 50 2.0036 0.0219`;

const C_TAXAS = String.raw`def descida(eta, x0=4.0, passos=10):
    xs = [x0]
    for _ in range(passos):
        xs.append(xs[-1] - eta * 2 * xs[-1])      # derivada de x² é 2x
    return np.array(xs)

for eta in [0.05, 0.3, 1.1]:
    print(eta, descida(eta).round(2))
# 0.05 [4.   3.6  3.24 2.92 2.62 2.36 2.13 1.91 1.72 1.55 1.39]
# 0.3 [4.   1.6  0.64 0.26 0.1  0.04 0.02 0.01 0.   0.   0.  ]
# 1.1 [  4.    -4.8    5.76  -6.91   8.29  -9.95  11.94 -14.33  17.2  -20.64
#   24.77]`;

const C_NC = String.raw`def fnc(x):
    return x**4 - 3 * x**2 + x

def dfnc(x):
    return 4 * x**3 - 6 * x + 1

for x0 in [-2.0, 2.0]:
    xk = x0
    for _ in range(100):
        xk = xk - 0.01 * dfnc(xk)
    print(x0, round(xk, 4), round(fnc(xk), 4))
# -2.0 -1.3008 -3.5139    -> mínimo global
# 2.0 1.1309 -1.0702      -> mínimo local: a derivada é zero, mas há melhor`;

const C_LOTES = String.raw`rng = np.random.default_rng(0)
n = 10_000
xs = rng.normal(size=n)
ys = 3 * xs + 2 + rng.normal(scale=0.5, size=n)      # a verdade: w = 3, b = 2

def eqm(w, b):
    return np.mean((w * xs + b - ys) ** 2)

def treinar(tamanho_lote, eta, epocas, semente=0):
    rng = np.random.default_rng(semente)
    w, b = 0.0, 0.0
    for _ in range(epocas):
        ordem = rng.permutation(n)                     # baralhar em cada época
        for inicio in range(0, n, tamanho_lote):
            i = ordem[inicio:inicio + tamanho_lote]
            erro = w * xs[i] + b - ys[i]
            w = w - eta * np.mean(2 * erro * xs[i])
            b = b - eta * np.mean(2 * erro)
    return w, b

for lote, eta in [(n, 0.1), (32, 0.1), (1, 0.01)]:
    w, b = treinar(lote, eta, epocas=1)
    print(f"lote {lote:>5}: w = {w:.3f}  b = {b:.3f}  perda = {eqm(w, b):.3f}")
# lote 10000: w = 0.599  b = 0.404  perda = 8.557
# lote    32: w = 3.044  b = 2.029  perda = 0.250
# lote     1: w = 3.070  b = 2.010  perda = 0.253`;

const C_OTIM = String.raw`def Lv(p):
    return p[0]**2 + 50 * p[1]**2

def grad_v(p):
    return np.array([2 * p[0], 100 * p[1]])

def gd(eta, passos=300):
    p = np.array([-4.0, 1.0]); perdas = [Lv(p)]
    for _ in range(passos):
        p = p - eta * grad_v(p)
        perdas.append(Lv(p))
    return np.array(perdas)

def momento(eta, beta=0.9, passos=300):
    p = np.array([-4.0, 1.0]); v = np.zeros(2); perdas = [Lv(p)]
    for _ in range(passos):
        v = beta * v + grad_v(p)            # velocidade: acumula os gradientes recentes
        p = p - eta * v
        perdas.append(Lv(p))
    return np.array(perdas)

def adam(eta, b1=0.9, b2=0.999, eps=1e-8, passos=300):
    p = np.array([-4.0, 1.0]); m = np.zeros(2); v = np.zeros(2); perdas = [Lv(p)]
    for t in range(1, passos + 1):
        g_ = grad_v(p)
        m = b1 * m + (1 - b1) * g_                   # média dos gradientes
        v = b2 * v + (1 - b2) * g_**2                # média dos gradientes ao quadrado
        m_hat, v_hat = m / (1 - b1**t), v / (1 - b2**t)   # corrige o arranque a zero
        p = p - eta * m_hat / (np.sqrt(v_hat) + eps)       # passo à medida de cada coordenada
        perdas.append(Lv(p))
    return np.array(perdas)

def passos_ate(perdas, alvo=1e-3):
    ok = np.flatnonzero(perdas < alvo)
    if ok.size:
        return int(ok[0])
    return "diverge" if perdas[-1] > perdas[0] else "300 não chegam"

for eta in [0.005, 0.018, 0.021]:
    print("GD     ", eta, passos_ate(gd(eta)))
for eta in [0.002, 0.01, 0.03]:
    print("momento", eta, passos_ate(momento(eta)))
for eta in [0.05, 0.3, 1.0]:
    print("Adam   ", eta, passos_ate(adam(eta)))`;

const O_OTIM = `GD      0.005 300 não chegam
GD      0.018 133
GD      0.021 diverge
momento 0.002 105
momento 0.01 83
momento 0.03 82
Adam    0.05 165
Adam    0.3 61
Adam    1.0 87`;

// ---------------------------------------------------------------- código do gabarito (05-gabarito.md)

const G7 = String.raw`print(round(derivada(np.sin, np.pi / 3), 6))       # 0.5
for z in [0, 2, 5, 10]:
    s = sigmoide(z)
    print(z, round(derivada(sigmoide, float(z)), 6), round(s * (1 - s), 6))
# 0 0.25 0.25
# 2 0.104994 0.104994
# 5 0.006648 0.006648
# 10 4.5e-05 4.5e-05`;

const G8 = String.raw`def f(p):
    return (p[0] - 3)**2 + 2 * (p[1] + 1)**2

def grad(p):
    return np.array([2 * (p[0] - 3), 4 * (p[1] + 1)])

for eta in [0.1, 0.5]:
    p = np.array([0.0, 0.0])
    perdas = [f(p)]
    for _ in range(50):
        p = p - eta * grad(p)
        perdas.append(f(p))
    print(eta, p.round(4), f"{perdas[-1]:.1e}", np.round(perdas[:5], 3))
    plt.plot(perdas, label=f"η = {eta}")
plt.yscale("log"); plt.xlabel("Passo"); plt.ylabel("Perda"); plt.legend()
plt.show()
# 0.1 [ 3. -1.] 1.8e-09 [11.     6.48   3.946  2.453  1.544]
# 0.5 [3. 0.] 2.0e+00 [11.  2.  2.  2.  2.]`;

const G9 = String.raw`w, b = 0.0, 0.0
for passo in range(1, 2001):
    erro = w * x + b - y
    w = w - 0.02 * np.mean(2 * erro * x)
    b = b - 0.02 * np.mean(2 * erro)
    if passo in (100, 500, 2000):
        print(passo, round(w, 4), round(b, 4), round(np.mean((w * x + b - y)**2), 4))
# 100 1.9246 0.2862 0.0316
# 500 1.9857 0.0657 0.0214
# 2000 1.99 0.05 0.0214
print(np.polyfit(x, y, 1))     # [1.99 0.05]`;

const G11 = String.raw`def momento(eta, beta, passos=500):
    p = np.array([-4.0, 1.0]); v = np.zeros(2); perdas = [Lv(p)]
    for _ in range(passos):
        v = beta * v + grad_v(p)
        p = p - eta * v
        perdas.append(Lv(p))
    return np.array(perdas)

for beta in [0, 0.5, 0.9, 0.99]:
    perdas = momento(0.005, beta)
    abaixo = np.flatnonzero(perdas < 1e-3)
    print(beta, int(abaixo[0]) if abaixo.size else "não chega em 500")
# 0 482
# 0.5 236
# 0.9 91
# 0.99 não chega em 500`;

const HORAS = String.raw`horas = np.array([0.5, 1, 1.5, 2, 3, 3.5, 4, 5])
aprovado = np.array([0, 0, 0, 1, 0, 1, 1, 1])`;

const G13 = String.raw`def perda(w, b):
    a = sigmoide(w * horas + b)
    return np.mean((a - aprovado) ** 2)

def gradiente(w, b):
    a = sigmoide(w * horas + b)
    comum = 2 * (a - aprovado) * a * (1 - a)      # dL/da · da/dz, exemplo a exemplo
    return np.mean(comum * horas), np.mean(comum)  # dz/dw = horas, dz/db = 1

gw, gb = gradiente(0, 0)
print(round(gw, 4), round(gb, 4))                                     # (a) -0.2656 0.0
print(round(derivada(lambda w_: perda(w_, 0), 0.0), 4),
      round(derivada(lambda b_: perda(0, b_), 0.0), 4))               # (b) -0.2656 0.0

w, b = 0.0, 0.0
perdas = []
for _ in range(5000):
    gw, gb = gradiente(w, b)
    w, b = w - 1.0 * gw, b - 1.0 * gb
    perdas.append(perda(w, b))
print(round(w, 3), round(b, 3), round(perdas[-1], 4))                # (c) 1.214 -3.057 0.1238
plt.plot(perdas); plt.xlabel("Passo"); plt.ylabel("Perda"); plt.show()

print(round(sigmoide(w * 2.5 + b), 3), round(-b / w, 2))            # (d) 0.495 2.52`;

const IMPORTS = `import numpy as np
import matplotlib.pyplot as plt

np.set_printoptions(precision=3, suppress=True)`;

const T_VIDEOS_CALC = "https://www.3blue1brown.com/topics/calculus";
const T_VIDEOS_NN = "https://www.3blue1brown.com/topics/neural-networks";

export const M5: ModuleContent = {
  id: "M5",
  duration: "3 semanas, cerca de 9 horas",
  intro:
    "No fim deste módulo deve saber o que é uma derivada e um gradiente, aplicar a regra da cadeia como faz a retropropagação, programar a descida do gradiente de raiz, escolher uma taxa de aprendizagem e explicar porque se treinam redes com mini-lotes.",
  outcomes: [
    "Saber o que é uma derivada e um gradiente",
    "Aplicar a regra da cadeia como faz a retropropagação",
    "Programar a descida do gradiente de raiz",
    "Escolher uma taxa de aprendizagem",
    "Explicar porque se treinam redes com mini-lotes",
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
        { id: "t2", text: "Vídeos 1 e 2 de \"Essence of Calculus\" (3Blue1Brown)", link: { kind: "url", href: T_VIDEOS_CALC } },
      ],
    },
    {
      id: "w1s2",
      label: "Semana 1 · sessão 2",
      minutes: 90,
      tasks: [
        { id: "t1", text: "Ler a secção 3", link: { kind: "section", id: "s3" } },
        { id: "t2", text: "Vídeos 3 e 4 de \"Essence of Calculus\"", link: { kind: "url", href: T_VIDEOS_CALC } },
        { id: "t3", text: "Exercícios 1 a 3", link: { kind: "tab", tab: "exercicios" } },
      ],
    },
    {
      id: "w2s1",
      label: "Semana 2 · sessão 1",
      minutes: 90,
      tasks: [
        { id: "t1", text: "Ler a secção 4", link: { kind: "section", id: "s4" } },
        { id: "t2", text: "Capítulos 3 e 4 da série \"Neural networks\" (3Blue1Brown)", link: { kind: "url", href: T_VIDEOS_NN } },
        { id: "t3", text: "Exercícios 4 e 5", link: { kind: "tab", tab: "exercicios" } },
      ],
    },
    {
      id: "w2s2",
      label: "Semana 2 · sessão 2",
      minutes: 90,
      tasks: [
        { id: "t1", text: "Ler a secção 5", link: { kind: "section", id: "s5" } },
        { id: "t2", text: "Capítulo 2 da série \"Neural networks\"", link: { kind: "url", href: T_VIDEOS_NN } },
        { id: "t3", text: "Exercícios 6 a 9", link: { kind: "tab", tab: "exercicios" } },
      ],
    },
    {
      id: "w3s1",
      label: "Semana 3 · sessão 1",
      minutes: 90,
      tasks: [
        { id: "t1", text: "Ler a secção 6", link: { kind: "section", id: "s6" } },
        { id: "t2", text: "Exercícios 10 e 11", link: { kind: "tab", tab: "exercicios" } },
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
      title: "Porquê cálculo: treinar é minimizar uma perda",
      minutes: 15,
      blocks: [
        {
          t: "callout",
          tone: "info",
          title: "Como estudar este módulo",
          text: "As três técnicas do M4 continuam a valer: abrir cada sessão com 5 minutos de recuperação, espaçar as sessões e refazer à mão os exemplos resolvidos antes de os correr (Dunlosky et al., 2013). Neste módulo há uma quarta: **explicar por palavras suas** cada passo de um cálculo, em voz alta ou por escrito. Quem explica porque faz cada passo aprende mais do que quem só o executa (Chi et al., 1994). Não é preciso saber calcular derivadas complicadas à mão: o computador faz isso. É preciso perceber **o que é** uma derivada, **para onde aponta** um gradiente e **porque** a descida do gradiente funciona, ou falha. Os resultados nos comentários do código são os reais.",
        },
        {
          t: "p",
          text: "No M1 viu-se que um modelo aprende com exemplos. Falta dizer **como**. A resposta, para praticamente todos os modelos do curso, de uma regressão linear a um LLM, é sempre a mesma receita em três passos:",
        },
        {
          t: "list",
          ordered: true,
          items: [
            "O modelo tem **parâmetros** (números ajustáveis): os pesos de uma regressão, os milhões ou milhares de milhões de pesos de uma rede neuronal.",
            "Uma **função de perda** mede, com um só número, quanto o modelo erra nos dados de treino.",
            "**Treinar** é procurar os parâmetros que tornam a perda mínima.",
          ],
        },
        {
          t: "p",
          text: "O cálculo diferencial é a ferramenta do passo 3: a derivada diz para que lado mexer cada parâmetro para a perda descer (Deisenroth, Faisal & Ong, 2020, caps. 5 e 7).",
        },
        { t: "h3", text: "Exemplo: um modelo com um só parâmetro" },
        {
          t: "p",
          text: "Cinco lojas: x é o número de campanhas no mês e y as vendas extra, em milhares de euros. O modelo mais simples possível é y ≈ w·x, uma reta pela origem com inclinação w. A perda é o **erro quadrático médio** (EQM):",
        },
        { t: "code", title: "Fórmula", code: "L(w) = (1/n) · Σᵢ₌₁ⁿ (w·xᵢ − yᵢ)²" },
        { t: "code", title: "A perda para três valores de w", code: C_PERDA, output: "1 11.102\n2 0.022\n3 10.942" },
        {
          t: "p",
          text: "Com w = 2 a perda é quase zero; com 1 ou 3, o modelo erra muito. Aqui dá para experimentar valores à mão porque há um só parâmetro. Com um milhão de parâmetros, experimentar é impossível: é preciso um método que diga, a partir do ponto onde se está, **em que direção** a perda desce. É isso que a derivada dá.",
        },
        {
          t: "table",
          head: ["Ideia deste módulo", "Para que serve no treino"],
          rows: [
            ["Derivada (secção 2)", "Inclinação da perda em relação a um parâmetro"],
            ["Gradiente (secção 3)", "As inclinações em relação a todos os parâmetros de uma vez"],
            ["Regra da cadeia (secção 4)", "Calcular o gradiente de modelos feitos de camadas: é a retropropagação"],
            ["Descida do gradiente (secção 5)", "O algoritmo que usa o gradiente para baixar a perda, passo a passo"],
            ["SGD, momento, Adam (secção 6)", "As versões usadas na prática para treinar com muitos dados"],
          ],
        },
        {
          t: "check",
          id: "qc1",
          q: "Na receita da secção 1, o que é **treinar** um modelo?",
          options: [
            "Escolher a função de perda que dá o menor número",
            "Experimentar à mão todos os valores possíveis dos parâmetros",
            "Procurar os parâmetros que tornam a perda mínima",
            "Acrescentar parâmetros até o modelo deixar de errar",
          ],
          answer: 2,
          explain:
            "Os parâmetros são os números ajustáveis, a perda mede o erro com um só número, e treinar é procurar os parâmetros que a tornam mínima. Experimentar à mão só funciona com um parâmetro; com um milhão, é preciso a derivada.",
        },
      ],
    },
    {
      id: "s2",
      num: 2,
      title: "Derivadas: a inclinação, as regras e a derivada numérica",
      minutes: 35,
      blocks: [
        {
          t: "p",
          text: "A **derivada** de uma função num ponto é a inclinação da reta que toca a curva nesse ponto: diz quanto a função muda quando a entrada muda um bocadinho. Formalmente, é o limite da razão entre as duas mudanças quando a mudança na entrada tende para zero:",
        },
        { t: "code", title: "Fórmula", code: "f′(x) = lim (h → 0) [f(x + h) − f(x)] / h" },
        { t: "p", text: "Para treinar modelos, o que interessa é o **sinal** e o **tamanho** da derivada:" },
        {
          t: "table",
          head: ["Derivada", "A função...", "Para descer, mexer x..."],
          rows: [
            ["Positiva", "sobe quando x aumenta", "para a esquerda (diminuir x)"],
            ["Negativa", "desce quando x aumenta", "para a direita (aumentar x)"],
            ["Zero", "está plana: pode ser um mínimo, um máximo ou um patamar", "não há informação para onde ir"],
            ["Grande, em valor absoluto", "muda depressa", "a inclinação é forte; um passo pequeno chega"],
          ],
        },
        { t: "h3", text: "As regras que chegam" },
        {
          t: "p",
          text: "Não é preciso aplicar o limite de cada vez. Meia dúzia de regras cobrem quase tudo o que aparece em IA (3Blue1Brown, \"Essence of Calculus\", vídeos 3 e 4):",
        },
        {
          t: "table",
          head: ["Função", "Derivada", "Exemplo"],
          rows: [
            ["Constante c", "0", "(7)' = 0"],
            ["Potência xⁿ", "n·xⁿ⁻¹", "(x³)' = 3x²"],
            ["Soma f + g", "f' + g'", "(x² + x)' = 2x + 1"],
            ["Constante vezes função c·f", "c·f'", "(5x²)' = 10x"],
            ["Exponencial eˣ", "eˣ", "é a sua própria derivada"],
            ["Logaritmo ln x", "1/x", "usado nas perdas de classificação (M8)"],
            ["Produto f·g", "f'g + fg'", "(x·eˣ)' = eˣ + x·eˣ"],
            ["Sigmoide σ(z) = 1/(1 + e⁻ᶻ)", "σ(z)·(1 − σ(z))", "σ'(0) = 0,5 × 0,5 = 0,25"],
            ["ReLU max(0, z)", "0 se z < 0; 1 se z > 0", "a ativação mais usada em redes (M12)"],
          ],
        },
        {
          t: "p",
          text: "Exemplo resolvido: f(x) = x² − 4x + 5. Pela regra da potência e da soma, f'(x) = 2x − 4. Em x = 3, f'(3) = 2: a função sobe, para descer é preciso ir para a esquerda. Em x = 2, f'(2) = 0: é o mínimo, e f(2) = 1.",
        },
        { t: "h3", text: "A derivada numérica" },
        {
          t: "p",
          text: "Se a fórmula for difícil, aproxima-se a derivada com um h pequeno. As **diferenças centrais** olham para os dois lados do ponto e são bastante mais precisas do que a fórmula do limite com h fixo:",
        },
        { t: "code", title: "Derivada numérica", code: C_DERIVADA, output: "2.0 0.0" },
        { t: "p", text: "O h não pode ser grande nem pequeno demais. A derivada de eˣ em x = 1 é e = 2,71828…, e dá para medir o erro:" },
        {
          t: "code",
          title: "O erro para três valores de h",
          code: C_ERRO_H,
          output: "h = 1e-01   erro = 4.5e-03\nh = 1e-05   erro = 5.9e-11\nh = 1e-12   erro = 2.1e-04",
        },
        {
          t: "p",
          text: "Com h grande, a aproximação é grosseira. Com h minúsculo, subtrai-se dois números quase iguais e o erro de arredondamento dos números de vírgula flutuante (M2) toma conta do resultado. Um h à volta de 10⁻⁵ é um bom compromisso (Goodfellow, Bengio & Courville, 2016, cap. 4).",
        },
        {
          t: "p",
          text: "Na prática, as bibliotecas de deep learning não usam derivadas numéricas para treinar: seriam lentas e imprecisas. Usam a **diferenciação automática** da secção 4. A derivada numérica serve para **verificar** se um gradiente calculado à mão está certo, e é assim que se usa neste módulo.",
        },
        {
          t: "widget",
          name: "m5-derivada",
          caption:
            "Derivada exata e derivada numérica em três funções da aula: f(x) = x² − 4x + 5, eˣ e a perda L(w) da secção 1. Mude o ponto e o h: a tangente mostra o sinal da derivada e o quadro mostra o erro das diferenças centrais. As contas são as do código da aula. Em eˣ, o browser e o NumPy podem diferir no último bit da exponencial: com h = 1e-5 ou menor, o erro mostrado pode então diferir do NumPy em alguns pontos (no ponto da aula, x = 1, coincide).",
        },
        { t: "h3", text: "A derivada da perda" },
        {
          t: "p",
          text: "De volta ao exemplo da secção 1. Derivando L(w) termo a termo (cada termo é um quadrado, e a derivada de (wxᵢ − yᵢ)² em ordem a w é 2(wxᵢ − yᵢ)·xᵢ):",
        },
        { t: "code", title: "Fórmula", code: "L′(w) = (1/n) · Σᵢ₌₁ⁿ 2 (w·xᵢ − yᵢ)·xᵢ" },
        { t: "code", title: "A derivada da perda", code: C_DPERDA, output: "-22.08 -22.08\n21.92" },
        {
          t: "p",
          text: "Em w = 1 a derivada é negativa: a perda desce se w aumentar. Em w = 3 é positiva: a perda desce se w diminuir. O mínimo está onde a derivada é zero. Neste caso simples dá para resolver a equação L'(w) = 0 à mão, e sai w = Σxᵢyᵢ / Σxᵢ²:",
        },
        { t: "code", title: "O mínimo exato", code: C_WOTIMO, output: "2.0036 0.0219" },
        {
          t: "p",
          text: "Para uma rede neuronal não existe fórmula assim. Por isso se usa a descida do gradiente da secção 5, que só precisa de saber calcular a derivada no ponto onde se está.",
        },
        {
          t: "check",
          id: "qc2",
          q: "Em f(x) = x² − 4x + 5, quanto vale f'(1), e para que lado se deve mexer x para f descer?",
          options: ["f'(1) = −2: aumentar x", "f'(1) = −2: diminuir x", "f'(1) = 2: diminuir x", "f'(1) = 0: x = 1 é o mínimo"],
          answer: 0,
          explain:
            "f'(x) = 2x − 4, logo f'(1) = −2. A derivada é negativa: a função desce quando x aumenta, por isso anda-se para a direita, na direção do mínimo em x = 2. A derivada numérica confirma: `derivada(f, 1.0)` dá -2.0.",
        },
      ],
    },
    {
      id: "s3",
      num: 3,
      title: "Derivadas parciais e gradiente",
      minutes: 25,
      blocks: [
        {
          t: "p",
          text: "Um modelo real tem muitos parâmetros, e a perda é uma função de todos eles. A **derivada parcial** em ordem a um parâmetro mede a inclinação nessa direção, com todos os outros fixos. Calcula-se como uma derivada normal, tratando as outras variáveis como constantes.",
        },
        { t: "p", text: "Exemplo: g(x, y) = x² + 3y²." },
        { t: "code", title: "Fórmula", code: "∂g/∂x = 2x        ∂g/∂y = 6y" },
        { t: "p", text: "O **gradiente** junta todas as derivadas parciais num vetor, e escreve-se ∇g (lê-se \"nabla g\"):" },
        { t: "code", title: "Fórmula", code: "∇g(x, y) = (2x, 6y)        ∇g(1, 1) = (2, 6)" },
        { t: "code", title: "Gradiente exato e numérico", code: C_GRAD, output: "[2 6] [2. 6.]" },
        { t: "h3", text: "O que o gradiente diz" },
        {
          t: "p",
          text: "O gradiente tem duas propriedades que fazem dele a peça central do treino (Deisenroth, Faisal & Ong, 2020, secção 5.2):",
        },
        {
          t: "list",
          ordered: true,
          items: [
            "**Aponta para a subida mais íngreme.** De todas as direções possíveis a partir de um ponto, a do gradiente é a que faz a função subir mais depressa. Logo, −∇g aponta para a **descida** mais íngreme.",
            "**É perpendicular às curvas de nível.** Uma curva de nível junta os pontos com o mesmo valor da função, como as linhas de altitude de um mapa. Andar ao longo dela não muda nada; o gradiente aponta para fora dela, a direito.",
          ],
        },
        {
          t: "figure",
          src: "img/01-curvas-de-nivel.png",
          alt: "O gradiente é perpendicular às curvas de nível de g(x, y) = x² + 3y² e aponta para a subida",
        },
        {
          t: "p",
          text: "No ponto (1, 1), o gradiente (2, 6) aponta sobretudo para cima: a função sobe mais depressa em y do que em x, porque tem o fator 3 em y. Repare que −∇g não aponta exatamente para o mínimo (0, 0). Aponta para a descida mais íngreme **ali**, que não é o mesmo. É por isso que a descida do gradiente dá muitos passos pequenos e corrige a direção a cada passo.",
        },
        { t: "h3", text: "Ligar ao M4" },
        {
          t: "p",
          text: "As curvas de nível são elipses alongadas porque y pesa mais do que x. A matriz das segundas derivadas (a **hessiana**) de g é [[2, 0], [0, 6]], e os seus valores próprios, 2 e 6, medem a curvatura em cada direção. Quanto maior a diferença entre o maior e o menor, mais alongado é o \"vale\" e mais difícil fica a descida do gradiente: é o problema que a secção 6 resolve com o momento e o Adam.",
        },
        {
          t: "check",
          id: "qc3",
          q: "Qual é o gradiente de g(x, y) = x² + 3y² no ponto (2, −1)?",
          options: ["(2, 6)", "(4, 6)", "(2, −3)", "(4, −6)"],
          answer: 3,
          explain:
            "∂g/∂x = 2x = 4 e ∂g/∂y = 6y = −6. Para descer o mais depressa possível a partir desse ponto, anda-se na direção de −∇g = (−4, 6). (2, 6) é o gradiente no ponto (1, 1) da aula.",
        },
      ],
    },
    {
      id: "s4",
      num: 4,
      title: "Regra da cadeia e retropropagação",
      minutes: 35,
      blocks: [
        {
          t: "p",
          text: "Uma rede neuronal é uma função feita de funções: cada camada recebe o resultado da anterior. Para saber como a perda muda quando se mexe num peso lá do início, é preciso atravessar todas as camadas pelo meio. A ferramenta para isso é a **regra da cadeia**.",
        },
        { t: "h3", text: "A regra da cadeia" },
        {
          t: "p",
          text: "Se y = f(g(x)), a derivada de y em ordem a x é a derivada de fora (calculada no valor de dentro) vezes a derivada de dentro:",
        },
        { t: "code", title: "Fórmula", code: "dy/dx = f′(g(x)) · g′(x)\n\nou, com u = g(x):    dy/dx = dy/du · du/dx" },
        {
          t: "p",
          text: "A intuição: as taxas de variação multiplicam-se. Se u muda 3 vezes mais depressa do que x, e y muda 2 vezes mais depressa do que u, então y muda 6 vezes mais depressa do que x (3Blue1Brown, \"Essence of Calculus\", vídeo 4).",
        },
        {
          t: "p",
          text: "Exemplo resolvido: h(x) = (3x + 1)². Por fora é u², com derivada 2u; por dentro é u = 3x + 1, com derivada 3. Logo h'(x) = 2(3x + 1) · 3, e h'(1) = 2 × 4 × 3 = 24.",
        },
        { t: "code", title: "Regra da cadeia", code: C_CADEIA, output: "24 24.0" },
        { t: "h3", text: "Um neurónio como grafo computacional" },
        {
          t: "p",
          text: "Um neurónio artificial com uma entrada faz três contas seguidas: uma combinação linear z = wx + b, uma ativação a = σ(z) (a sigmoide da secção 2) e, no treino, a perda L = (a − y)². Escrever as contas como um **grafo computacional**, com um nó por operação, mostra o caminho que a regra da cadeia tem de percorrer. Exemplo com x = 2, resposta certa y = 1, e parâmetros atuais w = 0,5 e b = −0,5:",
        },
        {
          t: "figure",
          src: "img/02-grafo-computacional.png",
          alt: "Grafo computacional de um neurónio: a ida calcula a perda, a volta multiplica derivadas locais",
        },
        { t: "p", text: "Na **ida** (*forward*), calcula-se da esquerda para a direita e guarda-se cada resultado intermédio:" },
        { t: "code", title: "A ida", code: C_IDA, output: "0.5 0.6225 0.1425" },
        {
          t: "p",
          text: "Na **volta** (*backward*), aplica-se a regra da cadeia da direita para a esquerda. Cada nó recebe a derivada da perda em relação à sua saída, multiplica-a pela sua derivada local e passa o resultado para trás:",
        },
        { t: "code", title: "Fórmula", code: "∂L/∂w = ∂L/∂a · ∂a/∂z · ∂z/∂w = 2(a − y) · a(1 − a) · x" },
        {
          t: "code",
          title: "A volta",
          code: C_VOLTA,
          output: "-0.7551 0.235 -0.1774 -0.3549 -0.1774\n-0.3549 -0.1774",
        },
        {
          t: "p",
          text: "As duas derivadas são negativas: aumentar w e b faz a perda descer. Faz sentido, porque a saída a = 0,62 está abaixo da resposta certa 1, e aumentar w e b aumenta a saída.",
        },
        {
          t: "widget",
          name: "m5-grafo",
          caption:
            "O neurónio da aula como grafo computacional. Avance passo a passo: a ida calcula e guarda z, a e L; a volta multiplica as derivadas locais da direita para a esquerda. Mude x, y, w e b e veja os sinais do gradiente. Os valores são os do código da aula, com 4 casas.",
        },
        { t: "h3", text: "Retropropagação: a regra da cadeia bem organizada" },
        {
          t: "p",
          text: "A **retropropagação** (*backpropagation*) é exatamente o que se fez acima, aplicado a redes com milhões de nós: uma ida que guarda os resultados intermédios e uma volta que multiplica derivadas locais do fim para o início. Rumelhart, Hinton & Williams (1986) mostraram que treinar assim permitia às camadas escondidas de uma rede aprender representações úteis, e o método tornou-se a base do deep learning. A ideia matemática, o modo reverso da diferenciação automática, já tinha sido descrita antes (Linnainmaa, 1970).",
        },
        {
          t: "p",
          text: "A grande vantagem é o custo. A derivada numérica precisa de duas avaliações da perda **por parâmetro**: para um modelo com mil milhões de parâmetros, seriam dois mil milhões de idas para dar um só passo. A retropropagação calcula o gradiente completo com uma ida e uma volta, a um custo da mesma ordem de uma ida, seja qual for o número de parâmetros (Baydin et al., 2018). Sem isto, não haveria redes neuronais grandes.",
        },
        { t: "h3", text: "Na prática: diferenciação automática" },
        {
          t: "p",
          text: "Ninguém escreve a volta à mão para uma rede real. O PyTorch, o TensorFlow e o JAX constroem o grafo computacional enquanto a ida corre e aplicam a regra da cadeia sozinhos: no PyTorch, basta chamar `perda.backward()` e o gradiente de cada parâmetro fica guardado. Isso é usado a partir do M13. Saber fazer a volta à mão, como aqui, serve para perceber o que essa linha faz e para diagnosticar problemas como gradientes que desaparecem em redes profundas (M13).",
        },
        {
          t: "check",
          id: "qc4",
          q: "Com h(x) = (2x + 3)², quanto vale h'(1)?",
          options: ["10", "20", "25", "4"],
          answer: 1,
          explain:
            "Por fora é u², com derivada 2u = 2 × 5 = 10; por dentro é u = 2x + 3, com derivada 2. Multiplicam-se: 10 × 2 = 20. Esquecer a derivada de dentro dá 10, o erro mais comum. A derivada numérica em x = 1 dá 20.0.",
        },
      ],
    },
    {
      id: "s5",
      num: 5,
      title: "Descida do gradiente",
      minutes: 35,
      blocks: [
        {
          t: "p",
          text: "A ideia vem de Cauchy (1847): para descer uma montanha no nevoeiro, sem ver o vale, olha-se para o chão, dá-se um passo na direção mais inclinada para baixo, e repete-se. Em símbolos, com θ (teta) a representar todos os parâmetros e η (eta) a **taxa de aprendizagem**:",
        },
        { t: "code", title: "Fórmula", code: "θ ← θ − η ∇L(θ)" },
        { t: "p", text: "O algoritmo completo:" },
        {
          t: "list",
          ordered: true,
          items: [
            "Começar com parâmetros quaisquer (zeros, ou números aleatórios pequenos).",
            "Calcular o gradiente da perda no ponto atual.",
            "Dar um passo no sentido contrário, de tamanho η vezes o gradiente.",
            "Repetir até a perda deixar de descer, ou durante um número fixo de passos.",
          ],
        },
        { t: "p", text: "Aplicado à perda da secção 1, a partir de w = 0:" },
        {
          t: "code",
          title: "Descida do gradiente",
          code: C_GD,
          output: "1 0.4408 26.8889\n5 1.4252 3.7029\n10 1.8366 0.3287\n20 1.9897 0.024\n50 2.0036 0.0219",
        },
        {
          t: "p",
          text: "Em 50 passos, w chega a 2,0036, o mesmo valor que a fórmula exata da secção 2. A diferença é que este método só precisou de saber calcular a derivada, e por isso funciona também quando não há fórmula. Repare que os passos são grandes no início e pequenos no fim: o passo é η vezes o gradiente, e o gradiente encolhe à medida que a perda se aproxima do mínimo.",
        },
        { t: "h3", text: "A taxa de aprendizagem" },
        {
          t: "p",
          text: "A taxa de aprendizagem é talvez o hiperparâmetro mais importante de todo o treino (Goodfellow, Bengio & Courville, 2016, cap. 11). Para ver porquê, o caso mais simples: f(x) = x², com derivada 2x. Cada passo faz x ← x − η·2x = (1 − 2η)·x, ou seja, multiplica x pelo mesmo fator:",
        },
        {
          t: "table",
          head: ["Taxa η", "Fator (1 − 2η)", "O que acontece"],
          rows: [
            ["0,05", "0,9", "Converge, mas devagar: cada passo só tira 10%"],
            ["0,3", "0,4", "Converge depressa"],
            ["0,5", "0", "Chega ao mínimo num passo (só nesta função)"],
            ["0,75", "−0,5", "Passa para o outro lado a cada passo, mas converge"],
            ["1,1", "−1,2", "Cada passo salta mais longe: diverge"],
          ],
        },
        {
          t: "code",
          title: "Três taxas em f(x) = x²",
          code: C_TAXAS,
          output:
            "0.05 [4.   3.6  3.24 2.92 2.62 2.36 2.13 1.91 1.72 1.55 1.39]\n0.3 [4.   1.6  0.64 0.26 0.1  0.04 0.02 0.01 0.   0.   0.  ]\n1.1 [  4.    -4.8    5.76  -6.91   8.29  -9.95  11.94 -14.33  17.2  -20.64\n  24.77]",
        },
        {
          t: "figure",
          src: "img/03-taxas-de-aprendizagem.png",
          alt: "Dez passos de descida do gradiente em f(x) = x² com três taxas de aprendizagem",
        },
        {
          t: "p",
          text: "Na prática, não se sabe a fórmula do fator. Experimentam-se taxas numa escala logarítmica (0,001, 0,01, 0,1) e olha-se para a **curva da perda**, o gráfico da perda ao longo dos passos:",
        },
        {
          t: "list",
          items: [
            "a perda sobe, oscila muito ou aparece `nan` (\"not a number\", um número que rebentou): a taxa é grande demais;",
            "a perda desce, mas muito devagar: a taxa é pequena demais;",
            "a perda cai depressa no início e depois estabiliza: está bem.",
          ],
        },
        { t: "p", text: "O mini-projeto da Fase 1 pede exatamente esta experiência com três taxas, e o desenho da curva da perda." },
        { t: "h3", text: "Convexidade: quando há um só vale" },
        {
          t: "p",
          text: "Uma função é **convexa** quando tem a forma de uma taça: o segmento que une quaisquer dois pontos do gráfico fica sempre por cima do gráfico. Nas funções convexas, qualquer mínimo local é o mínimo global, e a descida do gradiente com uma taxa adequada chega lá seja qual for o ponto de partida (Boyd & Vandenberghe, 2004, caps. 3 e 9). O erro quadrático médio da regressão linear é convexo: é por isso que o mini-projeto chega sempre à mesma solução.",
        },
        {
          t: "p",
          text: "As perdas das redes neuronais **não** são convexas. Têm muitos vales, e o ponto de partida decide em qual se acaba. Um exemplo com dois mínimos, f(x) = x⁴ − 3x² + x:",
        },
        { t: "code", title: "Dois pontos de partida", code: C_NC, output: "-2.0 -1.3008 -3.5139\n2.0 1.1309 -1.0702" },
        {
          t: "figure",
          src: "img/04-funcao-nao-convexa.png",
          alt: "Numa função não convexa, o ponto de partida decide o mínimo",
        },
        {
          t: "p",
          text: "A descida do gradiente só vê a inclinação local e pára onde ela é zero, sem saber se existe um vale mais fundo. Em redes com milhões de parâmetros, o cenário é menos mau do que este desenho sugere: a investigação indica que os **pontos de sela** (que descem numas direções e sobem noutras) são um obstáculo mais frequente do que os maus mínimos locais, e que os mínimos encontrados por redes grandes costumam ter perdas parecidas e boas (Dauphin et al., 2014; Goodfellow, Bengio & Courville, 2016, sec. 8.2). É uma das razões por que o ruído da secção seguinte ajuda.",
        },
        {
          t: "widget",
          name: "m5-descida",
          caption:
            "Descida do gradiente com os números da aula: f(x) = x² a partir de x = 4 (dez passos), a perda da secção 1 a partir de w = 0 (cinquenta passos) e a função não convexa com η = 0,01 (cem passos). Mude a taxa ou o ponto de partida e veja o caminho e a curva da perda.",
        },
        {
          t: "check",
          id: "qc5",
          q: "Na descida do gradiente em f(x) = x², com η = 0,2, por quanto é multiplicado x em cada passo?",
          options: ["0,2", "0,4", "0,6", "−0,6"],
          answer: 2,
          explain:
            "Cada passo faz x ← x − η·2x = (1 − 2η)·x = 0,6·x: converge sem mudar de sinal, e cada passo tira 40% à distância ao mínimo.",
        },
      ],
    },
    {
      id: "s6",
      num: 6,
      title: "Descida do gradiente estocástica, mini-lotes, momento e Adam",
      minutes: 40,
      blocks: [
        {
          t: "p",
          text: "A descida do gradiente da secção 5 calcula o gradiente com **todos** os exemplos de treino em cada passo. Com 5 exemplos não há problema. Com 10 milhões de imagens, cada passo obrigaria a passar pelos 10 milhões, e seriam precisos milhares de passos.",
        },
        { t: "h3", text: "Mini-lotes e SGD" },
        {
          t: "p",
          text: "A solução é estimar o gradiente com uma amostra aleatória. Robbins & Monro (1951) mostraram que um método destes, com passos que vão diminuindo, converge mesmo usando estimativas com ruído. Hoje há três variantes:",
        },
        {
          t: "table",
          head: ["Variante", "Exemplos por passo", "Passos por época (n = 10 000)"],
          rows: [
            ["Lote completo (*batch*)", "Todos", "1"],
            ["Mini-lotes (*mini-batch*)", "32 a 512, tipicamente", "313, com lotes de 32"],
            ["Estocástica pura (SGD)", "1", "10 000"],
          ],
        },
        {
          t: "p",
          text: "Uma **época** é uma passagem completa pelos dados. Em cada época baralham-se os exemplos e dividem-se em lotes. Na linguagem do dia a dia de deep learning, \"SGD\" designa quase sempre a versão com mini-lotes.",
        },
        {
          t: "p",
          text: "Experiência: 10 000 pontos gerados com y = 3x + 2 mais ruído, e um modelo y ≈ wx + b. Cada método vê exatamente os mesmos exemplos, uma vez cada:",
        },
        {
          t: "code",
          title: "Lote completo, mini-lotes e SGD",
          code: C_LOTES,
          output:
            "lote 10000: w = 0.599  b = 0.404  perda = 8.557\nlote    32: w = 3.044  b = 2.029  perda = 0.250\nlote     1: w = 3.070  b = 2.010  perda = 0.253",
        },
        {
          t: "p",
          text: "Com o mesmo trabalho, uma época, o lote completo deu um passo e ainda está longe. Os mini-lotes deram 313 passos e já chegaram a w ≈ 3 e b ≈ 2. A perda de 0,25 é o mínimo possível aqui: é a variância do ruído que se pôs nos dados (0,5²).",
        },
        {
          t: "figure",
          src: "img/05-lote-minilotes-sgd.png",
          alt: "Lote completo, mini-lotes e SGD ao longo de cinco épocas",
        },
        {
          t: "p",
          text: "Porque não usar sempre um exemplo de cada vez? Duas razões. Primeiro, o gradiente de um só exemplo tem muito ruído, e a perda fica a saltar à volta do mínimo, como se vê na linha verde. Segundo, uma GPU processa 32 ou 256 exemplos em paralelo quase tão depressa como um: é a vetorização do M3 levada ao extremo. Os mini-lotes ficam com o melhor dos dois mundos (Bottou, Curtis & Nocedal, 2018). O ruído que sobra até ajuda: empurra os parâmetros para fora de pontos de sela.",
        },
        { t: "h3", text: "Momento" },
        {
          t: "p",
          text: "Num vale estreito e comprido, como o das elipses alongadas da secção 3, a descida do gradiente ziguezagueia: a direção mais inclinada aponta sobretudo para as paredes do vale e pouco ao longo dele. Além disso, a taxa tem de ser pequena o suficiente para a direção mais íngreme não divergir, e fica lenta na direção suave.",
        },
        {
          t: "p",
          text: "O **momento** (Polyak, 1964) junta-lhe inércia, como uma bola a rolar: em vez de seguir só o gradiente atual, segue uma média dos gradientes recentes.",
        },
        { t: "code", title: "Fórmula", code: "v ← βv + ∇L(θ)\nθ ← θ − η v" },
        {
          t: "p",
          text: "Com β = 0,9, o valor habitual, as componentes que mudam de sinal a cada passo (o ziguezague) anulam-se, e as que apontam sempre para o mesmo lado (ao longo do vale) acumulam-se.",
        },
        { t: "h3", text: "Adam" },
        {
          t: "p",
          text: "O **Adam** (Kingma & Ba, 2015) acrescenta ao momento uma segunda ideia: dar a cada parâmetro o seu próprio tamanho de passo. Guarda duas médias, a dos gradientes (m, como o momento) e a dos gradientes ao quadrado (v), e divide uma pela raiz da outra. Assim, uma direção com gradientes grandes leva passos mais curtos e uma com gradientes pequenos leva passos mais longos.",
        },
        { t: "code", title: "Fórmula", code: "m ← β₁m + (1 − β₁) g\nv ← β₂v + (1 − β₂) g²\nθ ← θ − η · m̂ / (√v̂ + ε)" },
        {
          t: "p",
          text: "O chapéu (m̂, v̂) é uma correção para os primeiros passos, porque as duas médias começam a zero. Os valores por omissão propostos pelos autores são η = 0,001, β₁ = 0,9, β₂ = 0,999 e ε = 10⁻⁸.",
        },
        { t: "h3", text: "Os três num vale estreito" },
        {
          t: "p",
          text: "A função L(x, y) = x² + 50y² tem curvatura 2 numa direção e 100 na outra. Para cada método, contam-se os passos até a perda ficar abaixo de 0,001, com três taxas diferentes:",
        },
        { t: "code", title: "GD, momento e Adam", code: C_OTIM, output: O_OTIM },
        {
          t: "table",
          head: ["Método", "Taxa η", "Passos até perda < 0,001"],
          rows: [
            ["GD", "0,005", "não chega em 300"],
            ["GD", "0,018", "133"],
            ["GD", "0,021", "diverge"],
            ["Momento (β = 0,9)", "0,002 · 0,01 · 0,03", "105 · 83 · 82"],
            ["Adam", "0,05 · 0,3 · 1,0", "165 · 61 · 87"],
          ],
        },
        {
          t: "figure",
          src: "img/06-otimizadores.png",
          alt: "Trajetórias de GD, momento e Adam em L(x, y) = x² + 50y²",
        },
        { t: "p", text: "Três lições:" },
        {
          t: "list",
          ordered: true,
          items: [
            "**O GD só funciona numa faixa estreita.** Acima de η = 0,02 diverge: é o limite 2/100 imposto pela direção mais curva, o maior valor próprio da hessiana (M4). Abaixo disso, a direção suave anda devagar.",
            "**O momento é mais rápido e mais tolerante:** funciona bem com taxas 15 vezes diferentes.",
            "**O Adam aguenta uma faixa ainda maior de taxas** (de 0,05 a 1,0 todas convergem), porque ajusta o passo de cada coordenada sozinho. Esta robustez é o motivo principal por que é o ponto de partida habitual em deep learning.",
          ],
        },
        {
          t: "p",
          text: "Um aviso: isto é um problema de brinquedo, e a ordem entre métodos muda de problema para problema. Em visão por computador, por exemplo, o SGD com momento bem afinado continua a ser usado e por vezes generaliza melhor (Wilson et al., 2017).",
        },
        { t: "h3", text: "Na prática" },
        {
          t: "table",
          head: ["Situação", "Escolha habitual"],
          rows: [
            ["Primeiro treino de uma rede, sem saber mais", "Adam com η = 0,001"],
            ["Treino de LLMs e Transformers", "AdamW, uma variante do Adam com decaimento de pesos (Loshchilov & Hutter, 2019)"],
            ["Redes de visão, afinadas com cuidado", "SGD com momento 0,9 e uma taxa que diminui ao longo do treino"],
            ["Regressão linear ou logística pequena", "Nem é preciso: o scikit-learn usa solucionadores próprios (M8)"],
          ],
        },
        {
          t: "p",
          text: "No PyTorch, mudar de otimizador é uma linha: `torch.optim.SGD(params, lr=0.01, momentum=0.9)` ou `torch.optim.Adam(params, lr=0.001)`. O que cada um faz por dentro é o que se programou nesta secção.",
        },
        {
          t: "check",
          id: "qc6",
          q: "Com os 10 000 exemplos da experiência e mini-lotes de 64, quantos passos dá uma época?",
          options: ["157", "156", "64", "10 000"],
          answer: 0,
          explain:
            "10 000 / 64 = 156,25: há 156 lotes cheios e um último com 16 exemplos, porque `range(0, n, 64)` também começa um lote em 9984. Com lotes de 32 são 313, como na tabela da aula.",
        },
      ],
    },
  ],

  readings: {
    required: [
      {
        text: "Deisenroth, M. P., Faisal, A. A. & Ong, C. S. (2020). [*Mathematics for Machine Learning*](https://mml-book.github.io/). Cambridge University Press. Caps. 5 (cálculo vetorial: derivadas parciais, gradientes, retropropagação e diferenciação automática) e 7 (otimização contínua: descida do gradiente, momento, SGD e convexidade). PDF gratuito para uso pessoal.",
        href: "https://mml-book.github.io/",
      },
    ],
    complementary: [
      { text: "3Blue1Brown, \"Essence of Calculus\": vídeos 1 a 4. A intuição de derivada, das regras e da regra da cadeia." },
      { text: "3Blue1Brown, \"Neural networks\": capítulos 2 (descida do gradiente), 3 e 4 (retropropagação e o seu cálculo)." },
      {
        text: "Goodfellow, I., Bengio, Y. & Courville, A. (2016). [*Deep Learning*](https://www.deeplearningbook.org/). MIT Press. Caps. 4 (computação numérica), 6.5 (retropropagação), 8 (otimização de modelos profundos) e 11 (metodologia prática).",
        href: "https://www.deeplearningbook.org/",
      },
      {
        text: "Boyd, S. & Vandenberghe, L. (2004). [*Convex Optimization*](https://web.stanford.edu/~boyd/cvxbook/). Cambridge University Press. Caps. 3 (funções convexas) e 9 (minimização sem restrições). PDF gratuito no site dos autores.",
        href: "https://web.stanford.edu/~boyd/cvxbook/",
      },
      {
        text: "Ruder, S. (2016). [An overview of gradient descent optimization algorithms](https://arxiv.org/abs/1609.04747). arXiv:1609.04747. Um resumo claro de momento, Adam e variantes.",
        href: "https://arxiv.org/abs/1609.04747",
      },
      {
        text: "Karpathy, A. (2022). \"The spelled-out intro to neural networks and backpropagation: building micrograd\" (vídeo). Constrói a diferenciação automática de raiz, em Python simples.",
      },
    ],
    cited: [
      "Cauchy, A. (1847). Méthode générale pour la résolution des systèmes d'équations simultanées. *Comptes Rendus de l'Académie des Sciences*, 25, 536–538.",
      "Robbins, H. & Monro, S. (1951). A stochastic approximation method. *The Annals of Mathematical Statistics*, 22(3), 400–407.",
      "Polyak, B. T. (1964). Some methods of speeding up the convergence of iteration methods. *USSR Computational Mathematics and Mathematical Physics*, 4(5), 1–17.",
      "Linnainmaa, S. (1970). *The representation of the cumulative rounding error of an algorithm as a Taylor expansion of the local rounding errors*. Tese de mestrado, Universidade de Helsínquia.",
      "Rumelhart, D. E., Hinton, G. E. & Williams, R. J. (1986). Learning representations by back-propagating errors. *Nature*, 323, 533–536.",
      "Dauphin, Y. N., Pascanu, R., Gulcehre, C., Cho, K., Ganguli, S. & Bengio, Y. (2014). Identifying and attacking the saddle point problem in high-dimensional non-convex optimization. *Advances in Neural Information Processing Systems*, 27.",
      "Kingma, D. P. & Ba, J. (2015). [Adam: a method for stochastic optimization](https://arxiv.org/abs/1412.6980). *ICLR 2015*.",
      "Wilson, A. C., Roelofs, R., Stern, M., Srebro, N. & Recht, B. (2017). The marginal value of adaptive gradient methods in machine learning. *Advances in Neural Information Processing Systems*, 30.",
      "Baydin, A. G., Pearlmutter, B. A., Radul, A. A. & Siskind, J. M. (2018). Automatic differentiation in machine learning: a survey. *Journal of Machine Learning Research*, 18(153), 1–43.",
      "Bottou, L., Curtis, F. E. & Nocedal, J. (2018). Optimization methods for large-scale machine learning. *SIAM Review*, 60(2), 223–311.",
      "Loshchilov, I. & Hutter, F. (2019). [Decoupled weight decay regularization](https://arxiv.org/abs/1711.05101). *ICLR 2019*.",
      "Chi, M. T. H., de Leeuw, N., Chiu, M.-H. & LaVancher, C. (1994). Eliciting self-explanations improves understanding. *Cognitive Science*, 18(3), 439–477.",
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
          {
            t: "code",
            title: "Fórmulas",
            code: "f′(x) = lim (h → 0) [f(x + h) − f(x)] / h  ≈  [f(x + h) − f(x − h)] / 2h\n∇f = (∂f/∂x₁, …, ∂f/∂xₙ)\n\ndy/dx = dy/du · du/dx\nθ ← θ − η ∇L(θ)\nσ′(z) = σ(z) (1 − σ(z))",
          },
        ],
      },
      {
        title: "Regras de derivação",
        blocks: [
          {
            t: "table",
            head: ["Função", "Derivada"],
            rows: [
              ["c", "0"],
              ["xⁿ", "n·xⁿ⁻¹"],
              ["eˣ", "eˣ"],
              ["ln x", "1/x"],
              ["f + g", "f' + g'"],
              ["f·g", "f'g + fg'"],
              ["f(g(x))", "f'(g(x))·g'(x)"],
              ["σ(z)", "σ(z)(1 − σ(z))"],
              ["ReLU(z)", "0 se z < 0; 1 se z > 0"],
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
              ["Função de perda", "Um número que mede quanto o modelo erra; treinar é minimizá-la"],
              ["Derivada", "Inclinação: quanto a função muda por cada unidade da entrada"],
              ["Derivada parcial", "Inclinação numa só variável, com as outras fixas"],
              ["Gradiente", "Vetor das derivadas parciais; aponta para a subida mais íngreme e é perpendicular às curvas de nível"],
              ["Regra da cadeia", "As taxas de variação multiplicam-se ao longo de funções encadeadas"],
              ["Retropropagação", "Ida que guarda resultados + volta que multiplica derivadas locais do fim para o início; custo da ordem de uma ida"],
              ["Diferenciação automática", "O PyTorch e companhia fazem a volta sozinhos (`perda.backward()`)"],
              ["Descida do gradiente", "Passo contrário ao gradiente, de tamanho η vezes o gradiente, repetido"],
              ["Taxa de aprendizagem η", "Pequena: lento. Grande: oscila ou diverge. Escolher numa escala log e ver a curva da perda"],
              ["Função convexa", "Uma taça: todo o mínimo local é global (ex.: EQM da regressão linear)"],
              ["Não convexa", "Vários vales; o ponto de partida decide onde se acaba (redes neuronais)"],
              ["Ponto de sela", "Gradiente zero, mas desce numas direções e sobe noutras"],
              ["Época", "Uma passagem completa pelos dados de treino"],
              ["Mini-lote", "Amostra de 32 a 512 exemplos usada para estimar o gradiente em cada passo"],
              ["Momento", "Média dos gradientes recentes: acelera ao longo do vale e trava o ziguezague (β = 0,9)"],
              ["Adam", "Momento + passo à medida de cada parâmetro; robusto à escolha de η (0,001 por omissão)"],
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
            code: `def derivada(f, x, h=1e-5):
    return (f(x + h) - f(x - h)) / (2 * h)        # verificar gradientes

# descida do gradiente
for passo in range(passos):
    theta = theta - eta * gradiente(theta)

# mini-lotes
for epoca in range(epocas):
    ordem = rng.permutation(n)                      # baralhar em cada época
    for inicio in range(0, n, lote):
        i = ordem[inicio:inicio + lote]
        theta = theta - eta * gradiente(theta, X[i], y[i])

# momento
v = beta * v + gradiente(theta)
theta = theta - eta * v`,
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
              ["Descida do gradiente na regressão linear", "Mini-projeto da Fase 1"],
              ["Perdas de classificação com logaritmos (regressão logística)", "M8"],
              ["Retropropagação programada à mão", "M12"],
              ["Autograd, SGD e Adam no PyTorch; gradientes que desaparecem", "M13"],
              ["AdamW no pré-treino e na afinação de LLMs", "M17 e M22"],
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
              "Dar o passo **no sentido do** gradiente, em vez do sentido contrário: a perda sobe.",
              "Escolher a taxa de aprendizagem sem olhar para a curva da perda.",
              "Esquecer a derivada de dentro na regra da cadeia (em (3x + 1)², o fator 3).",
              "Usar um h minúsculo (10⁻¹²) na derivada numérica: o arredondamento estraga o resultado.",
              "Não baralhar os dados em cada época quando se treina com mini-lotes.",
              "Achar que derivada zero significa mínimo global: pode ser um mínimo local, um máximo ou um ponto de sela.",
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
      note: "Doze exercícios, cerca de 4 horas no total. Os da Parte A fazem-se à mão, em papel, e só depois se confirmam com a derivada numérica no Colab.",
    },
    {
      id: "B",
      title: "Parte B — Colab",
      note: "As funções `derivada`, `sigmoide`, `treinar`, `Lv` e `grad_v` são as da aula; os dados `x` e `y` são os da secção 1.",
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
      title: "Quatro derivadas em x = 1",
      minutes: 15,
      sections: ["s2"],
      prompt: [
        {
          t: "p",
          text: "Derive e calcule o valor em x = 1: (a) f(x) = 3x⁴ − 2x + 7; (b) g(x) = eˣ + ln x; (c) h(x) = (2x + 1)³; (d) p(x) = x²·eˣ.",
        },
      ],
      fields: [
        { id: "a", label: "(a) f'(x) e f'(1)", rows: 2 },
        { id: "b", label: "(b) g'(x) e g'(1)", rows: 2 },
        { id: "c", label: "(c) h'(x) e h'(1)", rows: 2 },
        { id: "d", label: "(d) p'(x) e p'(1)", rows: 2 },
      ],
      criteria: [
        "(a) f'(x) = 12x³ − 2; f'(1) = 10",
        "(b) g'(x) = eˣ + 1/x; g'(1) = e + 1 ≈ 3,718",
        "(c) Regra da cadeia: h'(x) = 3(2x + 1)² · 2 = 6(2x + 1)²; h'(1) = 54",
        "(d) Regra do produto: p'(x) = 2x·eˣ + x²·eˣ = eˣ(x² + 2x); p'(1) = 3e ≈ 8,155",
        "Confirmado com a derivada numérica: 10.0, 3.7183, 54.0 e 8.1548",
      ],
      solution: [
        {
          t: "p",
          text: "(a) f'(x) = 12x³ − 2; f'(1) = 10. (b) g'(x) = eˣ + 1/x; g'(1) = e + 1 ≈ 3,718. (c) Regra da cadeia: h'(x) = 3(2x + 1)² · 2 = 6(2x + 1)²; h'(1) = 54. (d) Regra do produto: p'(x) = 2x·eˣ + x²·eˣ = eˣ(x² + 2x); p'(1) = 3e ≈ 8,155. A derivada numérica em x = 1 dá 10.0, 3.7183, 54.0 e 8.1548.",
        },
      ],
    },
    {
      id: "e2",
      num: 2,
      part: "A",
      session: "w1s2",
      kind: "text",
      title: "O mínimo de uma parábola",
      minutes: 10,
      sections: ["s2"],
      prompt: [
        {
          t: "p",
          text: "Seja f(x) = x² − 6x + 10. (a) Calcule f'(x). (b) Onde está o mínimo, e quanto vale f nesse ponto? (c) Calcule f'(1) e f'(5). Em cada um desses pontos, para que lado andaria a descida do gradiente?",
        },
      ],
      fields: [
        { id: "a", label: "(a) f'(x)", rows: 1 },
        { id: "b", label: "(b) Mínimo e valor de f", rows: 2 },
        { id: "c", label: "(c) f'(1), f'(5) e o sentido da descida", rows: 3 },
      ],
      criteria: [
        "(a) f'(x) = 2x − 6",
        "(b) f'(x) = 0 em x = 3; f(3) = 9 − 18 + 10 = 1",
        "(c) f'(1) = −4: a função desce para a direita, a descida do gradiente aumenta x",
        "(c) f'(5) = 4: a função sobe para a direita, a descida do gradiente diminui x; nos dois casos anda na direção de x = 3",
      ],
      solution: [
        {
          t: "p",
          text: "(a) f'(x) = 2x − 6. (b) f'(x) = 0 em x = 3; f(3) = 9 − 18 + 10 = 1. (c) f'(1) = −4: a função desce para a direita, a descida do gradiente aumenta x. f'(5) = 4: a função sobe para a direita, a descida do gradiente diminui x. Nos dois casos anda na direção de x = 3.",
        },
      ],
    },
    {
      id: "e3",
      num: 3,
      part: "A",
      session: "w1s2",
      kind: "text",
      title: "Derivadas parciais e gradiente",
      minutes: 15,
      sections: ["s3"],
      prompt: [
        {
          t: "p",
          text: "Seja g(x, y) = x²y + 3y² − 2x. (a) Calcule as duas derivadas parciais. (b) Calcule o gradiente no ponto (1, 2). (c) Em que direção se deve andar a partir desse ponto para descer o mais depressa possível?",
        },
      ],
      fields: [
        { id: "a", label: "(a) ∂g/∂x e ∂g/∂y", rows: 2 },
        { id: "b", label: "(b) ∇g(1, 2)", rows: 2 },
        { id: "c", label: "(c) Direção de descida mais rápida", rows: 2 },
      ],
      criteria: [
        "(a) ∂g/∂x = 2xy − 2 (y tratado como constante); ∂g/∂y = x² + 6y",
        "(b) Em (1, 2): (2·1·2 − 2, 1 + 12) = (2, 13); o gradiente numérico dá [ 2. 13.]",
        "(c) Na direção de −∇g = (−2, −13), ou seja, sobretudo a diminuir y",
      ],
      solution: [
        {
          t: "p",
          text: "(a) ∂g/∂x = 2xy − 2 (y tratado como constante); ∂g/∂y = x² + 6y. (b) Em (1, 2): (2·1·2 − 2, 1 + 12) = (2, 13). O gradiente numérico dá `[ 2. 13.]`. (c) Na direção de −∇g = (−2, −13), ou seja, sobretudo a diminuir y.",
        },
      ],
    },
    {
      id: "e4",
      num: 4,
      part: "A",
      session: "w2s1",
      kind: "text",
      title: "Um passo num modelo y ≈ wx",
      minutes: 15,
      sections: ["s4", "s5"],
      prompt: [
        {
          t: "p",
          text: "Um modelo y ≈ wx tem perda L(w) = (wx − y)² num único exemplo com x = 3 e y = 5. Com w = 1: (a) calcule L; (b) calcule dL/dw com a regra da cadeia; (c) dê um passo de descida do gradiente com η = 0,01 e calcule a nova perda. Desceu?",
        },
      ],
      fields: [
        { id: "a", label: "(a) L", rows: 1 },
        { id: "b", label: "(b) dL/dw, com a regra da cadeia", rows: 3 },
        { id: "c", label: "(c) Novo w, nova perda e se desceu", rows: 3 },
      ],
      criteria: [
        "(a) wx − y = 3 − 5 = −2; L = 4",
        "(b) Por fora u², por dentro u = wx − y: dL/dw = 2(wx − y)·x = 2 × (−2) × 3 = −12",
        "(c) w = 1 − 0,01 × (−12) = 1,12; nova perda (3,36 − 5)² = 2,6896: desceu de 4 para 2,69",
      ],
      solution: [
        {
          t: "p",
          text: "(a) wx − y = 3 − 5 = −2; L = 4. (b) Por fora u², por dentro u = wx − y: dL/dw = 2(wx − y)·x = 2 × (−2) × 3 = −12. (c) w = 1 − 0,01 × (−12) = 1,12; nova perda (3,36 − 5)² = 2,6896. Desceu de 4 para 2,69.",
        },
      ],
    },
    {
      id: "e5",
      num: 5,
      part: "A",
      session: "w2s1",
      kind: "text",
      title: "Ida e volta num neurónio",
      minutes: 25,
      sections: ["s4"],
      prompt: [
        {
          t: "p",
          text: "Um neurónio com sigmoide, como o da secção 4, recebe x = 1, deve responder y = 0, e tem w = 2 e b = −1. Com perda L = (a − y)²: (a) faça a ida (z, a, L); (b) faça a volta (∂L/∂a, ∂a/∂z, ∂L/∂w, ∂L/∂b), com 4 casas decimais; (c) os gradientes são positivos ou negativos? Porque faz sentido? Use uma calculadora para e⁻¹.",
        },
      ],
      fields: [
        { id: "a", label: "(a) Ida: z, a, L", rows: 3 },
        { id: "b", label: "(b) Volta: ∂L/∂a, ∂a/∂z, ∂L/∂w, ∂L/∂b", rows: 4 },
        { id: "c", label: "(c) Sinal dos gradientes e porquê", rows: 3 },
      ],
      criteria: [
        "(a) z = 2 × 1 − 1 = 1; a = σ(1) = 1/(1 + 0,3679) = 0,7311; L = 0,7311² = 0,5344",
        "(b) ∂L/∂a = 2(a − y) = 1,4621; ∂a/∂z = a(1 − a) = 0,1966; ∂L/∂z = 0,2875",
        "(b) ∂L/∂w = 0,2875 × x = 0,2875; ∂L/∂b = 0,2875 (a derivada numérica confirma)",
        "(c) Positivos: a descida do gradiente vai diminuir w e b; faz sentido porque a saída 0,73 está acima da resposta certa 0, e diminuir w e b diminui a saída",
      ],
      solution: [
        {
          t: "p",
          text: "(a) z = 2 × 1 − 1 = 1; a = σ(1) = 1/(1 + 0,3679) = 0,7311; L = 0,7311² = 0,5344. (b) ∂L/∂a = 2(a − y) = 1,4621; ∂a/∂z = a(1 − a) = 0,1966; ∂L/∂z = 0,2875; ∂L/∂w = 0,2875 × x = 0,2875; ∂L/∂b = 0,2875. A derivada numérica confirma os dois últimos. (c) Positivos: a descida do gradiente vai diminuir w e b. Faz sentido porque a saída 0,73 está acima da resposta certa 0, e diminuir w e b diminui a saída.",
        },
      ],
    },
    {
      id: "e6",
      num: 6,
      part: "A",
      session: "w2s2",
      kind: "classify",
      title: "Quatro taxas em f(x) = x²",
      minutes: 15,
      sections: ["s5"],
      prompt: [
        {
          t: "p",
          text: "Na descida do gradiente em f(x) = x², a partir de x = 1, sem correr código: calcule os três primeiros passos para η = 0,25, 0,5, 0,75 e 1,0, e diga em cada caso se converge, oscila ou fica preso.",
        },
      ],
      categories: ["Converge sem mudar de sinal", "Chega ao mínimo num passo", "Oscila, mas converge", "Oscila para sempre, sem convergir"],
      justify: "Fator e três primeiros passos (x₁, x₂, x₃)",
      items: [
        { id: "a", text: "η = 0,25", answer: 0, explain: "Fator 0,5: 1; 0,5; 0,25; 0,125." },
        { id: "b", text: "η = 0,5", answer: 1, explain: "Fator 0: 1; 0; 0; 0." },
        { id: "c", text: "η = 0,75", answer: 2, explain: "Fator −0,5: 1; −0,5; 0,25; −0,125." },
        { id: "d", text: "η = 1,0", answer: 3, explain: "Fator −1: 1; −1; 1; −1, entre 1 e −1 para sempre." },
      ],
      solution: [
        { t: "p", text: "Cada passo multiplica x por (1 − 2η)." },
        {
          t: "table",
          head: ["η", "Fator", "x₀ a x₃", "Comportamento"],
          rows: [
            ["0,25", "0,5", "1; 0,5; 0,25; 0,125", "Converge sem mudar de sinal"],
            ["0,5", "0", "1; 0; 0; 0", "Chega ao mínimo num passo"],
            ["0,75", "−0,5", "1; −0,5; 0,25; −0,125", "Oscila, mas converge"],
            ["1,0", "−1", "1; −1; 1; −1", "Oscila para sempre entre 1 e −1, sem convergir"],
          ],
        },
      ],
    },
    {
      id: "e7",
      num: 7,
      part: "B",
      session: "w2s2",
      kind: "text",
      title: "Derivada numérica do seno e da sigmoide",
      minutes: 20,
      sections: ["s2", "s4"],
      prompt: [
        {
          t: "p",
          text: "Com a função `derivada` da secção 2: (a) confirme que a derivada de sin x em x = π/3 é cos(π/3) = 0,5; (b) calcule a derivada da sigmoide em z = 0, 2, 5 e 10, e compare com a fórmula σ(z)(1 − σ(z)); (c) o que acontece à derivada quando z é grande? Que problema isso pode causar no treino de uma rede com muitas camadas?",
        },
      ],
      fields: [
        { id: "code", label: "(a) e (b) Código e resultados", rows: 8, mono: true, placeholder: "print(round(derivada(np.sin, np.pi / 3), 6))\nfor z in [0, 2, 5, 10]:\n    …" },
        { id: "c", label: "(c) Derivada para z grande e o problema no treino", rows: 4 },
      ],
      criteria: [
        "(a) `derivada(np.sin, np.pi / 3)` dá 0.5",
        "(b) Numérica e fórmula coincidem: 0.25, 0.104994, 0.006648 e 4.5e-05",
        "(c) Para z grande, a sigmoide fica quase plana e a derivada quase zero",
        "(c) Na retropropagação, essa derivada multiplica o gradiente que passa para trás; com muitas camadas, o gradiente das primeiras praticamente desaparece (gradientes que desaparecem; por isso se usa ReLU)",
      ],
      solution: [
        {
          t: "code",
          code: G7,
          output: "0.5\n0 0.25 0.25\n2 0.104994 0.104994\n5 0.006648 0.006648\n10 4.5e-05 4.5e-05",
        },
        {
          t: "p",
          text: "(c) Para z grande, a sigmoide fica quase plana e a derivada quase zero. Na retropropagação, essa derivada multiplica o gradiente que passa para trás; com muitas camadas, multiplicam-se muitos números pequenos e o gradiente das primeiras camadas praticamente desaparece. É o problema dos gradientes que desaparecem, uma das razões por que as redes modernas usam ReLU (M12 e M13).",
        },
      ],
    },
    {
      id: "e8",
      num: 8,
      part: "B",
      session: "w2s2",
      kind: "text",
      title: "Descida do gradiente em duas variáveis",
      minutes: 25,
      sections: ["s3", "s5"],
      prompt: [
        {
          t: "p",
          text: "Programe a descida do gradiente em f(x, y) = (x − 3)² + 2(y + 1)², a partir de (0, 0). (a) Com η = 0,1 e 50 passos, onde chega e qual é a perda final? Faça o gráfico da perda por passo, com o eixo y em escala logarítmica (`plt.yscale(\"log\")`). (b) Repita com η = 0,5. O que acontece a x e a y? Explique com o fator (1 − η·curvatura) de cada coordenada.",
        },
      ],
      fields: [
        { id: "code", label: "Código e resultados", rows: 14, mono: true, placeholder: "def f(p):\n    …\n\ndef grad(p):\n    …\n\nfor eta in [0.1, 0.5]:\n    …" },
        { id: "b", label: "(a) e (b) O que acontece e porquê", rows: 5 },
      ],
      criteria: [
        "Gradiente certo: (2(x − 3), 4(y + 1))",
        "(a) Com η = 0,1 chega a (3, −1), o mínimo, com perda 1,8 × 10⁻⁹; em escala log, a curva é uma reta a descer",
        "(b) Com η = 0,5, x chega a 3 num passo: o fator é 1 − 0,5 × 2 = 0",
        "(b) y fica a saltar entre −2 e 0 para sempre (fator 1 − 0,5 × 4 = −1) e a perda fica presa em 2: a direção mais curva limita a taxa",
      ],
      solution: [
        {
          t: "code",
          code: G8,
          output: "0.1 [ 3. -1.] 1.8e-09 [11.     6.48   3.946  2.453  1.544]\n0.5 [3. 0.] 2.0e+00 [11.  2.  2.  2.  2.]",
        },
        {
          t: "p",
          text: "(a) Com η = 0,1 chega a (3, −1), o mínimo, com perda 1,8 × 10⁻⁹; em escala log, a curva é uma reta a descer. (b) Com η = 0,5, x chega a 3 num passo: o fator é 1 − 0,5 × 2 = 0. Mas y fica a saltar entre −2 e 0 para sempre: o fator é 1 − 0,5 × 4 = −1. A perda fica presa em 2. A direção mais curva (y, curvatura 4) é a que limita a taxa.",
        },
      ],
    },
    {
      id: "e9",
      num: 9,
      part: "B",
      session: "w2s2",
      kind: "text",
      title: "Dois parâmetros: y ≈ wx + b",
      minutes: 30,
      sections: ["s3", "s5"],
      prompt: [
        {
          t: "p",
          text: "Com os dados da secção 1, ajuste agora o modelo y ≈ wx + b, com dois parâmetros. (a) Escreva as derivadas parciais da perda em ordem a w e a b. (b) Programe a descida do gradiente com η = 0,02 e 2000 passos, desde (0, 0), e mostre w, b e a perda aos 100, 500 e 2000 passos. (c) Compare com `np.polyfit(x, y, 1)`. (d) Experimente η = 0,1. O que acontece?",
        },
      ],
      fields: [
        { id: "a", label: "(a) ∂L/∂w e ∂L/∂b", rows: 2 },
        { id: "code", label: "(b) e (c) Código e resultados", rows: 12, mono: true, placeholder: "w, b = 0.0, 0.0\nfor passo in range(1, 2001):\n    …" },
        { id: "d", label: "(c) Comparação e (d) η = 0,1", rows: 4 },
      ],
      criteria: [
        "(a) ∂L/∂w = média de 2(wx + b − y)·x; ∂L/∂b = média de 2(wx + b − y)",
        "(b) Aos 100, 500 e 2000 passos: (1.9246, 0.2862, 0.0316), (1.9857, 0.0657, 0.0214), (1.99, 0.05, 0.0214)",
        "(c) Coincide com o `polyfit`: w = 1,99 e b = 0,05; a perda (0,0214) é um pouco menor do que só com w (0,0219)",
        "(d) Com η = 0,1 diverge (ao fim de 50 passos, w perto de −11 milhões): a taxa máxima é 2 a dividir pelo maior valor próprio da hessiana, 23,7, o que dá 0,085",
      ],
      solution: [
        { t: "p", text: "(a) ∂L/∂w = média de 2(wx + b − y)·x; ∂L/∂b = média de 2(wx + b − y)." },
        {
          t: "code",
          code: G9,
          output: "100 1.9246 0.2862 0.0316\n500 1.9857 0.0657 0.0214\n2000 1.99 0.05 0.0214\n[1.99 0.05]",
        },
        {
          t: "p",
          text: "(c) Coincide com o `polyfit`: w = 1,99 e b = 0,05. A perda (0,0214) é um pouco menor do que só com w (0,0219), porque o modelo tem mais um parâmetro. (d) Com η = 0,1 diverge: ao fim de 50 passos, w já está perto de −11 milhões. A taxa máxima é 2 a dividir pela maior curvatura da perda, o maior valor próprio da hessiana, que aqui é 23,7: dá 0,085. Com η = 0,084 converge; com 0,086 já diverge.",
        },
      ],
    },
    {
      id: "e10",
      num: 10,
      part: "B",
      session: "w3s1",
      kind: "text",
      title: "Tamanho do lote",
      minutes: 25,
      sections: ["s6"],
      prompt: [
        {
          t: "p",
          text: "Com os 10 000 pontos e a função `treinar` da secção 6, e η = 0,1: (a) treine uma época com lotes de 8, 32, 256 e 10 000, e faça uma tabela com o número de passos, w, b e a perda; (b) quantas épocas precisa o lote completo para chegar a uma perda de 0,25? Experimente 5 e 20. (c) Qual escolheria, e porquê?",
        },
      ],
      fields: [
        { id: "code", label: "Código", rows: 8, mono: true, placeholder: "for lote in [8, 32, 256, 10_000]:\n    w, b = treinar(lote, 0.1, epocas=1)\n    …" },
        { id: "a", label: "(a) Tabela: lote, passos por época, w, b, perda", rows: 5 },
        { id: "bc", label: "(b) Épocas do lote completo e (c) a escolha", rows: 4 },
      ],
      criteria: [
        "(a) Lote 8: 1250 passos, w 3,103, b 2,003, perda 0,259",
        "(a) Lote 32: 313 passos, 3,044, 2,029, 0,250; lote 256: 40 passos, 3,040, 2,017, 0,249",
        "(a) Lote 10 000: 1 passo, 0,599, 0,404, 8,557",
        "(b) Lote completo: perda 1,632 ao fim de 5 épocas e 0,249 ao fim de 20, cerca de 20 vezes mais trabalho",
        "(c) Um lote de 32 a 256: chega ao mínimo numa época, com poucos passos, e numa GPU cada lote custa quase o mesmo que um exemplo; com 8, o ruído é maior",
      ],
      solution: [
        {
          t: "table",
          head: ["Lote", "Passos por época", "w", "b", "Perda"],
          rows: [
            ["8", "1250", "3,103", "2,003", "0,259"],
            ["32", "313", "3,044", "2,029", "0,250"],
            ["256", "40", "3,040", "2,017", "0,249"],
            ["10 000", "1", "0,599", "0,404", "8,557"],
          ],
        },
        {
          t: "p",
          text: "(b) O lote completo, com η = 0,1, tem perda 1,632 ao fim de 5 épocas e 0,249 ao fim de 20: precisa de cerca de 20 vezes mais trabalho. (c) Um lote de 32 a 256: chega ao mínimo numa época, com poucos passos, e numa GPU cada lote custa quase o mesmo que um exemplo. Com 8, o ruído é maior (perda 0,259).",
        },
      ],
    },
    {
      id: "e11",
      num: 11,
      part: "B",
      session: "w3s1",
      kind: "text",
      title: "O valor de β no momento",
      minutes: 25,
      sections: ["s6"],
      prompt: [
        {
          t: "p",
          text: "Programe a descida do gradiente com momento na função L(x, y) = x² + 50y² da secção 6, a partir de (−4, 1), com η = 0,005 e até 500 passos. Para β = 0, 0,5, 0,9 e 0,99, conte os passos até a perda ficar abaixo de 0,001. (a) O que significa β = 0? (b) Qual é o melhor β? (c) Porque piora com 0,99?",
        },
      ],
      fields: [
        { id: "code", label: "Código e resultados", rows: 12, mono: true, placeholder: "def momento(eta, beta, passos=500):\n    …\n\nfor beta in [0, 0.5, 0.9, 0.99]:\n    …" },
        { id: "abc", label: "(a), (b) e (c)", rows: 5 },
      ],
      criteria: [
        "Passos até perda < 0,001: β = 0 → 482; 0,5 → 236; 0,9 → 91; 0,99 → não chega em 500",
        "(a) β = 0 é a descida do gradiente normal: a velocidade é só o gradiente atual",
        "(b) β = 0,9, cinco vezes mais rápido do que sem momento",
        "(c) Com 0,99 a inércia é tanta que os parâmetros passam muito para lá do mínimo e demoram a travar",
      ],
      solution: [
        { t: "code", code: G11, output: "0 482\n0.5 236\n0.9 91\n0.99 não chega em 500" },
        {
          t: "p",
          text: "(a) β = 0 é a descida do gradiente normal: a velocidade é só o gradiente atual. (b) β = 0,9, cinco vezes mais rápido do que sem momento. (c) Com 0,99 a inércia é tanta que os parâmetros passam muito para lá do mínimo e demoram a travar: a bola rola de um lado para o outro do vale durante centenas de passos.",
        },
      ],
    },
    {
      id: "e12",
      num: 12,
      part: "C",
      session: "w3s2",
      kind: "text",
      title: "Treinar um modelo, explicado ao marketing",
      minutes: 20,
      sections: ["s1", "s5", "s6"],
      prompt: [
        {
          t: "p",
          text: "Um colega do marketing pergunta-lhe o que quer dizer \"treinar um modelo\". Escreva-lhe uma explicação de meia página, sem fórmulas, que use corretamente as palavras perda, gradiente, taxa de aprendizagem, mini-lote e época. Use uma analogia do dia a dia dele, por exemplo afinar o orçamento de uma campanha semana a semana.",
        },
      ],
      fields: [{ id: "texto", label: "Explicação (meia página, sem fórmulas)", rows: 12 }],
      criteria: [
        "Perda usada corretamente: o indicador que se quer baixar (0,6 em 5)",
        "Gradiente usado corretamente: para cada alavanca, se mexer um bocadinho faz o indicador subir ou descer, e quanto (0,6)",
        "Taxa de aprendizagem usada corretamente: o tamanho de cada ajuste (0,6)",
        "Mini-lote usado corretamente: uma amostra recente dos dados, usada para ajustar logo (0,6)",
        "Época usada corretamente: uma passagem por todos os dados (0,6)",
        "Analogia coerente do princípio ao fim (1)",
        "Clareza para quem não sabe matemática (1)",
      ],
      solution: [
        {
          t: "p",
          text: "Resposta aberta. Exemplo de boa resposta: \"Treinar um modelo é como afinar uma campanha semana a semana. A *perda* é o indicador que queremos baixar, por exemplo o custo por venda. O *gradiente* diz, para cada alavanca (orçamento por canal, público, horário), se mexer um bocadinho para cima faz o custo subir ou descer, e quanto. A *taxa de aprendizagem* é o tamanho de cada ajuste: ajustes pequenos demoram meses; ajustes grandes fazem o resultado saltar de um lado para o outro. Em vez de esperar pelos dados do ano todo para cada ajuste, olha-se para uma amostra recente, um *mini-lote*, e ajusta-se logo. Quando já se olhou para todos os dados uma vez, passou uma *época*, e recomeça-se.\"",
        },
        {
          t: "table",
          head: ["Critério", "Pontos (em 5)"],
          rows: [
            ["Cada um dos cinco termos usado corretamente", "0,6 cada (3)"],
            ["Analogia coerente do princípio ao fim", "1"],
            ["Clareza para quem não sabe matemática", "1"],
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
        note: "Sem consulta e sem correr código. Uma só resposta certa por pergunta. 1 valor cada; respostas erradas não descontam.",
        questions: [
          {
            kind: "mcq", id: "p1", num: 1, section: "s2", points: 1,
            q: "Quanto vale a derivada de f(x) = 5x³ − 2x em x = 1?",
            options: ["3", "15", "13", "5"],
            answer: 2,
            explain: "f'(x) = 15x² − 2; em x = 1 dá 13.",
          },
          {
            kind: "mcq", id: "p2", num: 2, section: "s2", points: 1,
            q: "Num ponto x₀, f'(x₀) < 0. Para fazer f descer, deve-se:",
            options: ["Diminuir x.", "Aumentar x.", "Manter x: já se está no mínimo.", "Não há informação suficiente."],
            answer: 1,
            explain: "Com a derivada negativa, a função desce quando x aumenta: para descer, mexe-se x para a direita.",
          },
          {
            kind: "mcq", id: "p3", num: 3, section: "s3", points: 1,
            q: "Qual é o gradiente de g(x, y) = x² + 4xy no ponto (1, 1)?",
            options: ["(2, 4)", "(6, 1)", "(2, 8)", "(6, 4)"],
            answer: 3,
            explain: "∂g/∂x = 2x + 4y = 6 e ∂g/∂y = 4x = 4.",
          },
          {
            kind: "mcq", id: "p4", num: 4, section: "s3", points: 1,
            q: "O gradiente de uma função num ponto:",
            options: [
              "Aponta para a direção de subida mais íngreme.",
              "Aponta sempre para o mínimo global.",
              "É tangente à curva de nível que passa nesse ponto.",
              "É sempre um vetor de comprimento 1.",
            ],
            answer: 0,
            explain: "Aponta para a subida mais íngreme e é perpendicular, não tangente, às curvas de nível. Em geral não aponta para o mínimo.",
          },
          {
            kind: "mcq", id: "p5", num: 5, section: "s4", points: 1,
            q: "Se y = f(u) e u = g(x), a regra da cadeia diz que dy/dx é igual a:",
            options: ["f'(x) + g'(x)", "f'(x) · g'(x)", "f(g'(x))", "f'(g(x)) · g'(x)"],
            answer: 3,
            explain: "A derivada de fora, calculada no valor de dentro, vezes a derivada de dentro.",
          },
          {
            kind: "mcq", id: "p6", num: 6, section: "s5", points: 1,
            q: "Na descida do gradiente em f(x) = x², com taxa de aprendizagem η = 1,5, a sequência de valores de x:",
            options: [
              "Converge devagar para 0.",
              "Chega a 0 num passo.",
              "Muda de sinal a cada passo e afasta-se de 0.",
              "Muda de sinal a cada passo e aproxima-se de 0.",
            ],
            answer: 2,
            explain: "O fator é 1 − 2 × 1,5 = −2: cada passo muda o sinal de x e duplica a distância a 0.",
          },
          {
            kind: "mcq", id: "p7", num: 7, section: "s6", points: 1,
            q: "Uma época de treino é:",
            options: [
              "Uma passagem completa por todos os dados de treino.",
              "Um passo de descida do gradiente.",
              "O tempo que um mini-lote demora a processar.",
              "O número de parâmetros do modelo.",
            ],
            answer: 0,
            explain: "Uma época é uma passagem completa pelos dados; com mini-lotes, tem muitos passos.",
          },
          {
            kind: "mcq", id: "p8", num: 8, section: "s6", points: 1,
            q: "O que distingue o Adam da descida do gradiente com momento?",
            options: [
              "O Adam não usa gradientes.",
              "O Adam ajusta o tamanho do passo de cada parâmetro, usando a média dos gradientes ao quadrado.",
              "O Adam só funciona em funções convexas.",
              "O Adam usa sempre o lote completo.",
            ],
            answer: 1,
            explain: "Divide a média dos gradientes pela raiz da média dos gradientes ao quadrado: cada parâmetro tem o seu tamanho de passo.",
          },
        ],
      },
      {
        title: "Grupo II — Resposta curta (8 valores)",
        note: "Sem consulta e sem correr código. 2 valores cada, 3 a 5 linhas por resposta.",
        questions: [
          {
            kind: "open", id: "p9", num: 9, section: "s5", points: 2, rows: 5,
            q: "O que acontece na descida do gradiente quando a taxa de aprendizagem é pequena demais? E quando é grande demais? Como se reconhece cada caso na curva da perda?",
            criteria: [
              { id: "c1", text: "Caso da taxa pequena demais", points: 0.5 },
              { id: "c2", text: "Caso da taxa grande demais", points: 0.5 },
              { id: "c3", text: "Como se reconhecem na curva da perda", points: 1 },
            ],
            model:
              "Pequena demais: cada passo avança pouco e o treino demora muito; a curva da perda desce devagar, quase em linha reta. Grande demais: os passos passam para lá do mínimo, a perda oscila, sobe ou dá `nan`.",
          },
          {
            kind: "open", id: "p10", num: 10, section: "s4", points: 2, rows: 5,
            q: "Uma rede tem 100 milhões de parâmetros. Porque é que a retropropagação é muito mais rápida do que calcular o gradiente com derivadas numéricas?",
            criteria: [
              { id: "c1", text: "Custo da derivada numérica", points: 1 },
              { id: "c2", text: "Ida e volta, com reutilização dos resultados intermédios", points: 1 },
            ],
            model:
              "A derivada numérica precisa de duas avaliações da perda por parâmetro: 200 milhões de idas para um passo. A retropropagação calcula o gradiente todo com uma ida e uma volta, reutilizando os resultados intermédios, a um custo da mesma ordem de uma ida.",
          },
          {
            kind: "open", id: "p11", num: 11, section: "s5", points: 2, rows: 5,
            q: "O que é uma função convexa, e porque é importante para a descida do gradiente? Dê um exemplo de perda convexa e um de perda não convexa.",
            criteria: [
              { id: "c1", text: "Definição", points: 0.5 },
              { id: "c2", text: "Importância", points: 0.5 },
              { id: "c3", text: "Exemplo de perda convexa", points: 0.5 },
              { id: "c4", text: "Exemplo de perda não convexa", points: 0.5 },
            ],
            model:
              "Convexa: forma de taça, o segmento entre dois pontos do gráfico fica por cima dele. Todo o mínimo local é global, por isso a descida do gradiente chega ao melhor ponto de qualquer início. Convexa: EQM da regressão linear. Não convexa: a perda de uma rede neuronal.",
          },
          {
            kind: "open", id: "p12", num: 12, section: "s6", points: 2, rows: 5,
            q: "Porque se treinam as redes neuronais com mini-lotes, e não com o lote completo nem com um exemplo de cada vez? Dê duas razões.",
            criteria: [
              { id: "c1", text: "Primeira razão correta", points: 1 },
              { id: "c2", text: "Segunda razão correta", points: 1 },
            ],
            model:
              "Duas de: o lote completo dá um só passo por época, é lento; um exemplo de cada vez dá gradientes com muito ruído; uma GPU processa um lote de 32 a 256 quase tão depressa como um exemplo; algum ruído ajuda a sair de pontos de sela.",
          },
        ],
      },
      {
        title: "Grupo III — Programação (4 valores)",
        note: "Pode usar o Colab, mas não a internet nem assistentes de IA.",
        questions: [
          {
            kind: "open", id: "p13", num: 13, section: "s4", points: 4, rows: 16,
            q: "Oito alunos registaram as horas de estudo e se passaram no exame:",
            context: [
              { t: "code", code: HORAS },
              {
                t: "p",
                text: "O modelo é um neurónio: a = σ(w·horas + b), com a sigmoide da aula e perda L(w, b) = média de (a − aprovado)².",
              },
              {
                t: "p",
                text: "(a) Escreva as funções `perda(w, b)` e `gradiente(w, b)`, esta última com a regra da cadeia e sem derivadas numéricas. (b) Verifique o gradiente no ponto (0, 0) com derivadas numéricas. (c) Treine com descida do gradiente, η = 1 e 5000 passos, a partir de (0, 0). Indique w, b e a perda final, e faça o gráfico da curva da perda. (d) Que probabilidade de aprovação dá o modelo a quem estuda 2,5 horas? A partir de quantas horas prevê mais de 50%?",
              },
            ],
            criteria: [
              { id: "c1", text: "`perda` e `gradiente` certos, com a regra da cadeia", points: 1.5 },
              { id: "c2", text: "Verificação numérica a confirmar o gradiente", points: 0.5 },
              { id: "c3", text: "Treino, valores finais e curva da perda", points: 1 },
              { id: "c4", text: "Probabilidade para 2,5 horas e limiar de 50%", points: 1 },
            ],
            model:
              "Gradiente em (0, 0): (−0,2656, 0,0), confirmado pela derivada numérica. Depois de 5000 passos: w = 1,214, b = −3,057, perda 0,1238. Para 2,5 horas, o modelo dá 49,5%; a probabilidade passa os 50% quando w·horas + b > 0, ou seja, a partir de −b/w ≈ 2,52 horas.",
            modelBlocks: [
              { t: "code", code: G13, output: "-0.2656 0.0\n-0.2656 0.0\n1.214 -3.057 0.1238\n0.495 2.52" },
              {
                t: "p",
                text: "(d) Para 2,5 horas, o modelo dá 49,5%. A probabilidade passa os 50% quando w·horas + b > 0, ou seja, a partir de −b/w ≈ 2,52 horas. A perda começa em 0,25 (o modelo responde 0,5 a todos) e estabiliza em 0,124: o aluno que passou com 2 horas e o que chumbou com 3 não cabem numa regra simples.",
              },
            ],
          },
        ],
      },
    ],
  },
  examReviewNote:
    "Se a nota ficar abaixo de 14: rever as secções das perguntas falhadas (1 e 2 → secção 2, Derivadas; 3 e 4 → secção 3, Derivadas parciais e gradiente; 5, 10, 13a e 13b → secção 4, Regra da cadeia e retropropagação; 6, 9, 11 e 13c → secção 5, Descida do gradiente; 7, 8 e 12 → secção 6, SGD, mini-lotes, momento e Adam) e repetir a prova uma semana depois.",

  // ---------------------------------------------------------------- SIMULADO DE TREINO (banco extra da plataforma)
  practice: {
    mcq: [
      { id: "q1", section: "s1", q: "Com os dados da secção 1, quanto dá `perda(2)`, arredondado a 3 casas?", options: ["`0.022`", "`11.102`", "`2.0036`", "`10.942`"], answer: 0, explain: "Com w = 2 o modelo quase não erra. 11.102 e 10.942 são as perdas com w = 1 e w = 3; 2.0036 é o w ótimo, não uma perda." },
      { id: "q2", section: "s1", q: "Que ideia do módulo dá as inclinações da perda em relação a todos os parâmetros de uma vez?", options: ["A derivada", "O gradiente", "A regra da cadeia", "O momento"], answer: 1, explain: "A derivada é a inclinação em relação a um parâmetro; o gradiente junta-as todas num vetor." },
      { id: "q3", section: "s2", q: "Qual é a derivada de f(x) = x³ + 2x?", options: ["3x² + 2", "3x²", "x² + 2", "3x³ + 2"], answer: 0, explain: "Regra da potência e da soma: (x³)' = 3x² e (2x)' = 2." },
      { id: "q4", section: "s2", q: "Quanto vale σ'(0), a derivada da sigmoide em z = 0?", options: ["0", "0,5", "0,25", "1"], answer: 2, explain: "σ'(z) = σ(z)(1 − σ(z)) e σ(0) = 0,5: dá 0,5 × 0,5 = 0,25." },
      { id: "q5", section: "s2", q: "Qual é a derivada da ReLU, max(0, z), em z = 3?", options: ["0", "1", "3", "z"], answer: 1, explain: "Para z > 0 a ReLU é z, com derivada 1; para z < 0 é 0." },
      { id: "q6", section: "s2", q: "Porque é que a derivada numérica de eˣ em x = 1 tem mais erro com h = 10⁻¹² do que com h = 10⁻⁵?", options: ["Porque o limite só existe para h grandes", "Porque se subtraem dois números quase iguais e o arredondamento domina", "Porque as diferenças centrais só funcionam com h = 10⁻⁵", "Porque o NumPy não aceita números tão pequenos"], answer: 1, explain: "Com h minúsculo, f(x + h) e f(x − h) são quase iguais e o erro de arredondamento dos números de vírgula flutuante toma conta: 2,1 × 10⁻⁴ contra 5,9 × 10⁻¹¹." },
      { id: "q7", section: "s2", q: "Para que se usa a derivada numérica neste módulo?", options: ["Para treinar redes grandes", "Para substituir a retropropagação", "Para escolher a taxa de aprendizagem", "Para verificar se um gradiente calculado à mão está certo"], answer: 3, explain: "Para treinar seria lenta e imprecisa; as bibliotecas usam diferenciação automática." },
      { id: "q8", section: "s2", q: "Na perda da secção 1, `dperda(1)` dá -22.08. O que isso diz?", options: ["A perda desce se w aumentar", "A perda desce se w diminuir", "w = 1 é o mínimo", "A perda em w = 1 é negativa"], answer: 0, explain: "Derivada negativa: a perda desce quando w aumenta. O mínimo está em w = 2,0036." },
      { id: "q9", section: "s3", q: "Qual é a derivada parcial de g(x, y) = x²y em ordem a y?", options: ["2xy", "x²", "2x", "x²y"], answer: 1, explain: "Trata-se x como constante: x² vezes a derivada de y, que é 1." },
      { id: "q10", section: "s3", q: "Para descer o mais depressa possível a partir de um ponto, anda-se na direção de:", options: ["∇g", "uma curva de nível", "−∇g", "o mínimo global, em linha reta"], answer: 2, explain: "∇g aponta para a subida mais íngreme; −∇g para a descida mais íngreme ali, que em geral não aponta para o mínimo." },
      { id: "q11", section: "s3", q: "A hessiana de g(x, y) = x² + 3y² tem valores próprios 2 e 6. O que medem?", options: ["A curvatura em cada direção", "As coordenadas do mínimo", "O tamanho do gradiente em (1, 1)", "A taxa de aprendizagem ideal"], answer: 0, explain: "Quanto maior a diferença entre o maior e o menor, mais alongado é o vale e mais difícil fica a descida do gradiente." },
      { id: "q12", section: "s4", q: "Com y = f(u) e u = 3x + 1, se dy/du = 8, quanto vale dy/dx?", options: ["8", "11", "24", "3"], answer: 2, explain: "As taxas multiplicam-se: dy/dx = dy/du · du/dx = 8 × 3 = 24." },
      { id: "q13", section: "s4", q: "No neurónio da aula, porque é que ∂L/∂b é igual a ∂L/∂z?", options: ["Porque b = −0,5", "Porque dz/db = 1", "Porque a sigmoide é linear", "Porque a perda não depende de b"], answer: 1, explain: "z = wx + b, por isso dz/db = 1 e ∂L/∂b = ∂L/∂z · 1 = −0,1774." },
      { id: "q14", section: "s4", q: "Uma rede tem 10 milhões de parâmetros. Quantas avaliações da perda precisam as diferenças centrais para um gradiente completo?", options: ["1", "2", "10 milhões", "20 milhões"], answer: 3, explain: "Duas por parâmetro. A retropropagação faz o mesmo com uma ida e uma volta." },
      { id: "q15", section: "s4", q: "No PyTorch, que linha calcula o gradiente de cada parâmetro?", options: ["`perda.backward()`", "`perda.grad()`", "`torch.derivada(perda)`", "`perda.forward()`"], answer: 0, explain: "O PyTorch constrói o grafo enquanto a ida corre e `backward()` aplica a regra da cadeia sozinho (M13)." },
      { id: "q16", section: "s5", q: "Em f(x) = x², a partir de x = 4, com η = 0,25, onde está x depois de 2 passos?", options: ["2", "1", "0,5", "0"], answer: 1, explain: "O fator é 1 − 2 × 0,25 = 0,5: 4 → 2 → 1." },
      { id: "q17", section: "s5", q: "A curva da perda sobe e aparece `nan`. O que fazer?", options: ["Aumentar a taxa de aprendizagem", "Treinar durante mais passos", "Mudar para o lote completo", "Diminuir a taxa de aprendizagem"], answer: 3, explain: "Perda a subir, a oscilar muito ou `nan` é sinal de taxa grande demais." },
      { id: "q18", section: "s5", q: "Qual destas perdas é convexa?", options: ["O EQM da regressão linear", "A perda de uma rede neuronal", "f(x) = x⁴ − 3x² + x", "Nenhuma das três"], answer: 0, explain: "Por isso o mini-projeto chega sempre à mesma solução. As outras duas têm vários vales." },
      { id: "q19", section: "s5", q: "Em f(x) = x⁴ − 3x² + x, com η = 0,01 e 100 passos, onde acaba a descida do gradiente a partir de x = 2?", options: ["No mínimo global, x ≈ −1,30", "Em x = 0", "No mínimo local, x ≈ 1,13", "Diverge"], answer: 2, explain: "Pára onde a derivada é zero, sem saber que há um vale mais fundo à esquerda. A partir de −2 chega ao global." },
      { id: "q20", section: "s5", q: "Na perda da secção 1, com η = 0,01, porque são os passos grandes no início e pequenos no fim?", options: ["Porque η diminui sozinha", "Porque o passo é η vezes o gradiente, e o gradiente encolhe perto do mínimo", "Porque o NumPy arredonda", "Porque a perda é não convexa"], answer: 1, explain: "η é fixa; o que encolhe é a derivada, que é zero no mínimo." },
      { id: "q21", section: "s6", q: "Na experiência da secção 6, porque é que a perda dos mini-lotes fica à volta de 0,25 e não desce mais?", options: ["Porque η é pequena demais", "Porque não se baralharam os dados", "Porque o modelo só tem dois parâmetros", "Porque 0,25 é a variância do ruído posto nos dados (0,5²)"], answer: 3, explain: "Os dados são y = 3x + 2 mais ruído com desvio padrão 0,5: nenhum w e b o conseguem prever, e a perda mínima possível é a variância desse ruído." },
      { id: "q22", section: "s6", q: "Com β = 0,9, o que faz o momento às componentes do gradiente que mudam de sinal a cada passo?", options: ["Anula-as em grande parte, travando o ziguezague", "Acumula-as", "Duplica-as", "Não lhes faz nada"], answer: 0, explain: "As que mudam de sinal anulam-se na média; as que apontam sempre para o mesmo lado acumulam-se." },
      { id: "q23", section: "s6", q: "Em L(x, y) = x² + 50y², acima de que taxa diverge a descida do gradiente simples?", options: ["0,001", "0,02", "0,5", "1"], answer: 1, explain: "É o limite 2/100 imposto pela direção mais curva, o maior valor próprio da hessiana: com 0,021 já diverge." },
      { id: "q24", section: "s6", q: "Para que servem m̂ e v̂ (os chapéus) no Adam?", options: ["Guardam o melhor ponto encontrado", "Escolhem a taxa de aprendizagem", "Corrigem as médias nos primeiros passos, porque começam a zero", "Baralham os dados"], answer: 2, explain: "m e v começam a zero; dividir por (1 − β₁ᵗ) e (1 − β₂ᵗ) corrige esse arranque." },
      { id: "q25", section: "s6", q: "Segundo a tabela \"Na prática\", que otimizador é a escolha habitual para treinar LLMs e Transformers?", options: ["SGD sem momento", "AdamW", "Lote completo", "Adam com η = 1,0"], answer: 1, explain: "AdamW é uma variante do Adam com decaimento de pesos (Loshchilov & Hutter, 2019)." },
    ],
    tf: [
      { id: "v1", section: "s1", q: "A função de perda mede, com um só número, quanto o modelo erra nos dados de treino.", answer: true, explain: "Treinar é procurar os parâmetros que a tornam mínima." },
      { id: "v2", section: "s2", q: "Se f'(x₀) = 0, x₀ é sempre o mínimo global.", answer: false, explain: "Pode ser um mínimo local, um máximo, um patamar ou um ponto de sela." },
      { id: "v3", section: "s2", q: "A derivada de eˣ é eˣ.", answer: true, explain: "É a sua própria derivada." },
      { id: "v4", section: "s2", q: "As diferenças centrais olham para os dois lados do ponto e são mais precisas do que a fórmula do limite com h fixo.", answer: true, explain: "derivada(f, x, h) = (f(x + h) − f(x − h)) / 2h." },
      { id: "v5", section: "s3", q: "O gradiente é tangente às curvas de nível.", answer: false, explain: "É perpendicular: andar ao longo de uma curva de nível não muda o valor da função." },
      { id: "v6", section: "s3", q: "Em g(x, y) = x² + 3y², no ponto (1, 1), −∇g aponta exatamente para o mínimo (0, 0).", answer: false, explain: "−∇g = (−2, −6) aponta para a descida mais íngreme ali, não para o mínimo. Por isso a descida do gradiente corrige a direção a cada passo." },
      { id: "v7", section: "s4", q: "A retropropagação calcula o gradiente completo a um custo da mesma ordem de uma ida, seja qual for o número de parâmetros.", answer: true, explain: "Uma ida que guarda os resultados intermédios e uma volta (Baydin et al., 2018)." },
      { id: "v8", section: "s4", q: "Na regra da cadeia, as taxas de variação somam-se.", answer: false, explain: "Multiplicam-se: dy/dx = dy/du · du/dx." },
      { id: "v9", section: "s5", q: "Na descida do gradiente, o passo é dado no sentido do gradiente.", answer: false, explain: "No sentido contrário: θ ← θ − η∇L(θ). No sentido do gradiente, a perda sobe." },
      { id: "v10", section: "s5", q: "Nas funções convexas, qualquer mínimo local é o mínimo global.", answer: true, explain: "Com uma taxa adequada, a descida do gradiente chega lá de qualquer ponto de partida." },
      { id: "v11", section: "s5", q: "Em f(x) = x², com η = 0,75, x muda de sinal a cada passo mas converge.", answer: true, explain: "O fator é 1 − 2 × 0,75 = −0,5." },
      { id: "v12", section: "s6", q: "Na linguagem do dia a dia de deep learning, \"SGD\" designa quase sempre a versão com mini-lotes.", answer: true, explain: "A estocástica pura usa um exemplo por passo; os mini-lotes, tipicamente de 32 a 512 exemplos, são o que se usa." },
      { id: "v13", section: "s6", q: "Em L(x, y) = x² + 50y², o Adam converge com todas as taxas da aula, de 0,05 a 1,0.", answer: true, explain: "165, 61 e 87 passos: ajusta o passo de cada coordenada sozinho." },
    ],
  },

  // ---------------------------------------------------------------- CARTÕES
  flashcards: [
    { id: "f1", section: "s1", tag: "Perda", front: "A receita do treino em três passos", back: "O modelo tem parâmetros; uma função de perda mede quanto erra; treinar é procurar os parâmetros que tornam a perda mínima." },
    { id: "f2", section: "s1", tag: "Perda", front: "Erro quadrático médio (EQM)", back: "L(w) = (1/n) Σ (w·xᵢ − yᵢ)²: a média dos quadrados dos erros. Nos dados da aula, perda(2) = 0.022." },
    { id: "f3", section: "s2", tag: "Derivadas", front: "Derivada", back: "A inclinação da reta que toca a curva num ponto: quanto a função muda quando a entrada muda um bocadinho. f'(x) = lim (h → 0) [f(x + h) − f(x)] / h." },
    { id: "f4", section: "s2", tag: "Derivadas", front: "Sinal da derivada e sentido do passo", back: "Positiva: a função sobe, para descer diminui-se x. Negativa: aumenta-se x. Zero: plana (mínimo, máximo ou patamar), sem informação." },
    { id: "f5", section: "s2", tag: "Derivadas", front: "Regras: potência, soma, produto", back: "(xⁿ)' = n·xⁿ⁻¹; (f + g)' = f' + g'; (f·g)' = f'g + fg'. Ex.: (x·eˣ)' = eˣ + x·eˣ." },
    { id: "f6", section: "s2", tag: "Derivadas", front: "Derivada de eˣ e de ln x", back: "(eˣ)' = eˣ; (ln x)' = 1/x." },
    { id: "f7", section: "s2", tag: "Derivadas", front: "Derivada da sigmoide", back: "σ'(z) = σ(z)(1 − σ(z)). σ'(0) = 0,5 × 0,5 = 0,25; para z grande, quase zero." },
    { id: "f8", section: "s2", tag: "Derivadas", front: "Derivada da ReLU, max(0, z)", back: "0 se z < 0; 1 se z > 0." },
    { id: "f9", section: "s2", tag: "Derivadas", front: "Diferenças centrais", back: "derivada(f, x, h) = (f(x + h) − f(x − h)) / (2h). Mais precisas do que o limite com h fixo; servem para verificar gradientes." },
    { id: "f10", section: "s2", tag: "Derivadas", front: "Que h usar na derivada numérica?", back: "À volta de 10⁻⁵. Grande: aproximação grosseira. Minúsculo (10⁻¹²): o arredondamento toma conta do resultado." },
    { id: "f11", section: "s2", tag: "Derivadas", front: "O mínimo exato da perda y ≈ wx", back: "L'(w) = 0 dá w = Σxᵢyᵢ / Σxᵢ² = 2,0036 nos dados da aula, com perda 0,0219. Numa rede neuronal não há fórmula assim." },
    { id: "f12", section: "s3", tag: "Gradiente", front: "Derivada parcial", back: "A inclinação numa só variável, com as outras fixas: calcula-se tratando as outras como constantes." },
    { id: "f13", section: "s3", tag: "Gradiente", front: "Gradiente ∇g", back: "O vetor das derivadas parciais. Para g(x, y) = x² + 3y²: ∇g = (2x, 6y) e ∇g(1, 1) = (2, 6)." },
    { id: "f14", section: "s3", tag: "Gradiente", front: "As duas propriedades do gradiente", back: "Aponta para a subida mais íngreme (−∇g para a descida) e é perpendicular às curvas de nível." },
    { id: "f15", section: "s3", tag: "Gradiente", front: "Hessiana", back: "A matriz das segundas derivadas. Os valores próprios medem a curvatura em cada direção; muito diferentes → vale alongado, descida do gradiente difícil." },
    { id: "f16", section: "s4", tag: "Regra da cadeia", front: "Regra da cadeia", back: "dy/dx = f'(g(x)) · g'(x) = dy/du · du/dx: as taxas de variação multiplicam-se. (3x + 1)² → 2(3x + 1) · 3." },
    { id: "f17", section: "s4", tag: "Regra da cadeia", front: "Grafo computacional", back: "As contas escritas com um nó por operação (z = wx + b, a = σ(z), L = (a − y)²). Mostra o caminho que a regra da cadeia percorre." },
    { id: "f18", section: "s4", tag: "Regra da cadeia", front: "Ida e volta", back: "Ida (forward): da esquerda para a direita, guardando cada resultado. Volta (backward): cada nó multiplica a derivada que recebe pela sua derivada local e passa-a para trás." },
    { id: "f19", section: "s4", tag: "Regra da cadeia", front: "∂L/∂w num neurónio com sigmoide", back: "∂L/∂a · ∂a/∂z · ∂z/∂w = 2(a − y) · a(1 − a) · x. No exemplo da aula: −0,3549." },
    { id: "f20", section: "s4", tag: "Regra da cadeia", front: "Retropropagação", back: "A regra da cadeia bem organizada: uma ida e uma volta, a um custo da ordem de uma ida, seja qual for o número de parâmetros (Rumelhart, Hinton & Williams, 1986)." },
    { id: "f21", section: "s4", tag: "Regra da cadeia", front: "Diferenciação automática", back: "O PyTorch, o TensorFlow e o JAX constroem o grafo durante a ida e fazem a volta sozinhos: `perda.backward()`." },
    { id: "f22", section: "s5", tag: "Descida", front: "Descida do gradiente", back: "θ ← θ − η∇L(θ): começar em qualquer ponto, calcular o gradiente, dar um passo no sentido contrário e repetir (Cauchy, 1847)." },
    { id: "f23", section: "s5", tag: "Descida", front: "O fator em f(x) = x²", back: "Cada passo faz x ← (1 − 2η)·x. Entre 0 e 1 converge; 0 chega num passo; entre −1 e 0 oscila mas converge; −1 oscila para sempre; abaixo de −1 diverge." },
    { id: "f24", section: "s5", tag: "Descida", front: "Ler a curva da perda", back: "Sobe, oscila muito ou dá `nan`: taxa grande demais. Desce muito devagar: pequena demais. Cai depressa e estabiliza: está bem." },
    { id: "f25", section: "s5", tag: "Descida", front: "Função convexa", back: "Forma de taça: o segmento entre dois pontos do gráfico fica por cima dele. Todo o mínimo local é global (ex.: EQM da regressão linear)." },
    { id: "f26", section: "s5", tag: "Descida", front: "Função não convexa", back: "Vários vales; o ponto de partida decide onde se acaba. Em x⁴ − 3x² + x: de −2 chega a −1,3008 (global), de 2 a 1,1309 (local)." },
    { id: "f27", section: "s5", tag: "Descida", front: "Ponto de sela", back: "Gradiente zero, mas desce numas direções e sobe noutras. Em redes grandes, um obstáculo mais frequente do que os maus mínimos locais (Dauphin et al., 2014)." },
    { id: "f28", section: "s6", tag: "Otimizadores", front: "Época", back: "Uma passagem completa pelos dados de treino. Em cada época baralham-se os exemplos e dividem-se em lotes." },
    { id: "f29", section: "s6", tag: "Otimizadores", front: "Lote completo, mini-lotes e SGD", back: "Todos os exemplos por passo (1 passo por época); 32 a 512 (313 passos com lotes de 32 e n = 10 000); 1 exemplo (10 000 passos)." },
    { id: "f30", section: "s6", tag: "Otimizadores", front: "Porque mini-lotes?", back: "O lote completo dá um só passo por época; um exemplo dá gradientes com muito ruído; uma GPU processa 32 ou 256 exemplos quase tão depressa como um; algum ruído ajuda a sair de pontos de sela." },
    { id: "f31", section: "s6", tag: "Otimizadores", front: "Momento", back: "v ← βv + ∇L(θ); θ ← θ − ηv. Média dos gradientes recentes, como uma bola a rolar (Polyak, 1964); β = 0,9 é o habitual." },
    { id: "f32", section: "s6", tag: "Otimizadores", front: "Adam", back: "Momento + passo à medida de cada parâmetro: divide a média dos gradientes (m̂) pela raiz da média dos gradientes ao quadrado (v̂). Por omissão η = 0,001, β₁ = 0,9, β₂ = 0,999, ε = 10⁻⁸." },
    { id: "f33", section: "s6", tag: "Otimizadores", front: "Taxa máxima da descida do gradiente simples", back: "2 a dividir pela maior curvatura (o maior valor próprio da hessiana). Em x² + 50y²: 2/100 = 0,02." },
    { id: "f34", section: "s6", tag: "Otimizadores", front: "Que otimizador escolher?", back: "Primeiro treino: Adam com η = 0,001. LLMs e Transformers: AdamW. Visão afinada com cuidado: SGD com momento 0,9 e taxa a diminuir. Regressão pequena: o scikit-learn trata disso." },
  ],

  // ---------------------------------------------------------------- NOTEBOOK
  notebook: {
    filename: "M5 — exercícios",
    cells: [
      {
        type: "md",
        source:
          "# M5 — Cálculo e otimização\n\nExemplos da aula (correr pela ordem, no mesmo notebook) e os exercícios 1 a 12. Os da Parte A fazem-se primeiro em papel e só depois se confirmam aqui. Guardar no Drive, na pasta da Fase 1.",
      },
      { type: "code", source: IMPORTS },
      { type: "md", source: "## 1. Treinar é minimizar uma perda" },
      { type: "code", source: C_PERDA.replace("import numpy as np\nnp.set_printoptions(precision=3, suppress=True)\n\n", "") },
      { type: "md", source: "## 2. Derivadas" },
      { type: "code", source: C_DERIVADA },
      { type: "code", source: C_ERRO_H },
      { type: "code", source: C_DPERDA },
      { type: "code", source: C_WOTIMO },
      { type: "md", source: "## 3. Derivadas parciais e gradiente" },
      { type: "code", source: C_GRAD },
      { type: "md", source: "## 4. Regra da cadeia e retropropagação" },
      { type: "code", source: C_CADEIA },
      { type: "code", source: C_IDA },
      { type: "code", source: C_VOLTA },
      { type: "md", source: "## 5. Descida do gradiente" },
      { type: "code", source: C_GD },
      { type: "code", source: C_TAXAS },
      { type: "code", source: C_NC },
      { type: "md", source: "## 6. SGD, mini-lotes, momento e Adam" },
      { type: "code", source: C_LOTES },
      { type: "code", source: C_OTIM },
      {
        type: "md",
        source:
          "## Exercícios 1 a 6 — confirmar as contas feitas à mão\n\n1. Derivadas em x = 1 de 3x⁴ − 2x + 7, eˣ + ln x, (2x + 1)³ e x²·eˣ. 2. f(x) = x² − 6x + 10. 3. Gradiente de x²y + 3y² − 2x em (1, 2). 4. Um passo com x = 3, y = 5, w = 1, η = 0,01. 5. Neurónio com x = 1, y = 0, w = 2, b = −1. 6. Três passos em x², a partir de x = 1, com η = 0,25, 0,5, 0,75 e 1,0.",
      },
      { type: "code", source: "# Exercício 1\n\n# Exercício 2\n\n# Exercício 3\n\n# Exercício 4\n\n# Exercício 5\n\n# Exercício 6\n" },
      { type: "md", source: "## Exercício 7\n\n(a) Derivada de sin x em π/3; (b) derivada da sigmoide em z = 0, 2, 5 e 10, comparada com σ(z)(1 − σ(z)); (c) o que acontece para z grande?" },
      { type: "code", source: "# (a)\n\n# (b)\n" },
      { type: "md", source: "## Exercício 8\n\nDescida do gradiente em f(x, y) = (x − 3)² + 2(y + 1)², a partir de (0, 0): (a) η = 0,1 e 50 passos, com a curva da perda em escala log; (b) η = 0,5." },
      { type: "code", source: "def f(p):\n    ...\n\ndef grad(p):\n    ...\n" },
      { type: "md", source: "## Exercício 9\n\ny ≈ wx + b com os dados da secção 1: η = 0,02, 2000 passos; comparar com `np.polyfit(x, y, 1)`; experimentar η = 0,1." },
      { type: "code", source: "w, b = 0.0, 0.0\n" },
      { type: "md", source: "## Exercício 10\n\nUma época com lotes de 8, 32, 256 e 10 000 (η = 0,1); o lote completo com 5 e 20 épocas." },
      { type: "code", source: "for lote in [8, 32, 256, 10_000]:\n    ...\n" },
      { type: "md", source: "## Exercício 11\n\nMomento em L(x, y) = x² + 50y², a partir de (−4, 1), com η = 0,005 e até 500 passos, para β = 0, 0,5, 0,9 e 0,99." },
      { type: "code", source: "for beta in [0, 0.5, 0.9, 0.99]:\n    ...\n" },
      { type: "md", source: "## Exercício 12\n\nO que quer dizer \"treinar um modelo\", explicado a um colega do marketing (meia página, sem fórmulas, com perda, gradiente, taxa de aprendizagem, mini-lote e época):\n\n" },
      { type: "md", source: "## Notas\n\nO que aprendi neste módulo, em três frases:" },
    ],
  },
  source: "curso-engenharia-ia 3/modulo-05-calculo-otimizacao",
};
