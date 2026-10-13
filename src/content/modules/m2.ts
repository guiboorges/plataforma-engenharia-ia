import type { ModuleContent } from "../types";

// Módulo 2 — Python para IA I: a linguagem.
// Fonte: curso-engenharia-ia 2/modulo-02-python-i (01-aula, 02-apostila, 03-exercicios, 04-prova, 05-gabarito, codigo/, img/).
// O código da aula está tal como no original (com os resultados nos comentários); o campo `output` de cada
// bloco tem o resultado real, corrido em Python 3.13. A figura do ecossistema vem de img/. Os três widgets
// (src/components/widgets/m2: fatias, duas variáveis e a mesma lista, ciclos passo a passo) seguem a semântica
// do Python e foram testados contra o Python real. As verificações rápidas, o banco do simulado e os cartões
// foram escritos pela plataforma a partir da aula, com cada resultado de código confirmado no Python.

// ---------------------------------------------------------------- código da aula (01-aula.md)

const C_TIPOS = String.raw`idade = 26
altura = 1.78
nome = "Ana"
ativo = True
nada = None
print(type(idade), type(altura), type(nome), type(ativo), type(nada))
# <class 'int'> <class 'float'> <class 'str'> <class 'bool'> <class 'NoneType'>`;

const C_NUMEROS = String.raw`print(7 / 2, 7 // 2, 7 % 2, 2 ** 10)   # 3.5 3 1 1024
print(0.1 + 0.2)                       # 0.30000000000000004
print(round(0.1 + 0.2, 2))             # 0.3`;

const C_TEXTO = String.raw`preco = 49.9
print(f"{nome} pagou {preco:.2f} €")                 # Ana pagou 49.90 €
print(int("42") + 1, float("3.5") * 2, str(10) + "0")  # 43 7.0 100
print("Python"[0], "Python"[-1], "Python"[0:3], len("Python"))  # P n Pyt 6
print("  Olá Mundo  ".strip().lower())                  # olá mundo
print("a,b,c".split(","))                               # ['a', 'b', 'c']`;

const C_LISTAS = String.raw`precos = [19.9, 45.0, 120.5, 8.75]
precos.append(60.0)
print(precos[0], precos[-1], precos[1:3])                  # 19.9 60.0 [45.0, 120.5]
print(len(precos), sum(precos), max(precos), min(precos))  # 5 254.15 120.5 8.75
precos.sort()
print(precos)                                              # [8.75, 19.9, 45.0, 60.0, 120.5]`;

const C_TUPLOS = String.raw`ponto = (38.72, -9.14)
lat, lon = ponto      # desempacotar: cada valor vai para a sua variável
print(lat, lon)       # 38.72 -9.14`;

const C_DICIONARIOS = String.raw`produto = {"nome": "Bola", "preco": 12.5, "stock": 30}
produto["stock"] -= 1
produto["categoria"] = "Acessórios"
print(produto["nome"], produto.get("cor", "sem cor"))   # Bola sem cor
for chave, valor in produto.items():
    print(chave, "=", valor)
# nome = Bola
# preco = 12.5
# stock = 29
# categoria = Acessórios`;

const C_CONJUNTOS = String.raw`etiquetas = {"spam", "promo", "spam"}
print(etiquetas, "promo" in etiquetas)   # {'promo', 'spam'} True`;

const C_ALIAS = String.raw`a = [1, 2, 3]
b = a            # b não é uma cópia: é outro nome para a mesma lista
b.append(4)
print(a)         # [1, 2, 3, 4]
c = a.copy()     # agora sim, uma cópia
c.append(5)
print(a, c)      # [1, 2, 3, 4] [1, 2, 3, 4, 5]`;

const C_IF = String.raw`temperatura = 17
if temperatura < 19:
    print("Ligar aquecimento")
elif temperatura > 25:
    print("Ligar ar condicionado")
else:
    print("Nada a fazer")
# Ligar aquecimento`;

const C_FOR = String.raw`vendas = [120, 80, 0, 200, 45]
total = 0
for v in vendas:
    if v == 0:
        continue          # salta para o elemento seguinte
    total += v
print(total)              # 445

for i, v in enumerate(vendas):     # índice e valor ao mesmo tempo
    print(i, v)                    # 0 120, 1 80, 2 0, ...

lojas = ["Lisboa", "Porto", "Faro"]
valores = [1500, 980, 640]
for loja, valor in zip(lojas, valores):   # percorre duas listas em paralelo
    print(f"{loja}: {valor} €")           # Lisboa: 1500 €, ...

for i in range(3):
    print(i, end=" ")      # 0 1 2`;

const C_WHILE = String.raw`saldo = 100
meses = 0
while saldo < 200:
    saldo *= 1.10
    meses += 1
print(meses, round(saldo, 2))   # 8 214.36`;

const C_COMPREENSOES = String.raw`quadrados = [x ** 2 for x in range(6)]
print(quadrados)                               # [0, 1, 4, 9, 16, 25]
pares = [x for x in range(10) if x % 2 == 0]
print(pares)                                   # [0, 2, 4, 6, 8]
precos = {"bola": 12.5, "luva": 25.0, "boné": 15.0}
com_iva = {nome: round(p * 1.23, 2) for nome, p in precos.items()}
print(com_iva)                     # {'bola': 15.38, 'luva': 30.75, 'boné': 18.45}`;

const C_FUNCAO = String.raw`def preco_com_iva(preco, taxa=0.23):
    """Devolve o preço com IVA, arredondado a 2 casas."""
    return round(preco * (1 + taxa), 2)

print(preco_com_iva(100))             # 123.0
print(preco_com_iva(100, taxa=0.06))  # 106.0
print(preco_com_iva.__doc__)          # Devolve o preço com IVA, arredondado a 2 casas.`;

const C_ESTATISTICAS = String.raw`def estatisticas(numeros: list[float]) -> tuple[float, float, float]:
    """Devolve (mínimo, máximo, média) de uma lista de números."""
    media = sum(numeros) / len(numeros)
    return min(numeros), max(numeros), media

mn, mx, med = estatisticas([4, 8, 15, 16, 23, 42])
print(mn, mx, med)    # 4 42 18.0`;

const C_AMBITO = String.raw`contador = 0
def incrementa():
    contador = 1        # isto cria uma variável nova, local à função
    return contador
print(incrementa(), contador)   # 1 0`;

const C_LAMBDA = String.raw`itens = [("luva", 25.0), ("bola", 12.5), ("boné", 15.0)]
print(sorted(itens, key=lambda item: item[1]))
# [('bola', 12.5), ('boné', 15.0), ('luva', 25.0)]`;

const C_FICHEIROS = String.raw`import csv, json

# Criar um CSV de exemplo
with open("vendas.csv", "w", encoding="utf-8", newline="") as f:
    f.write("loja,mes,valor\nLisboa,jan,1500\nPorto,jan,980\nLisboa,fev,1720\nPorto,fev,1105\nFaro,fev,640\n")

# Ler: cada linha vira um dicionário
with open("vendas.csv", encoding="utf-8") as f:
    linhas = list(csv.DictReader(f))
print(len(linhas), linhas[0])   # 5 {'loja': 'Lisboa', 'mes': 'jan', 'valor': '1500'}

total = sum(float(l["valor"]) for l in linhas)
print(total)                    # 5945.0

# Escrever JSON
resumo = {"linhas": len(linhas), "total": total}
with open("resumo.json", "w", encoding="utf-8") as f:
    json.dump(resumo, f, ensure_ascii=False, indent=2)`;

const C_MODULOS = String.raw`import math
from statistics import mean, median
print(math.sqrt(16), mean([1, 2, 3, 4]), median([1, 2, 3, 4]))   # 4.0 2.5 2.5`;

const C_ERROS = String.raw`def para_numero(texto):
    try:
        return float(texto)
    except ValueError:
        print(f"Aviso: '{texto}' não é um número")
        return None

print(para_numero("12.5"), para_numero("doze"))
# Aviso: 'doze' não é um número
# 12.5 None

try:
    open("nao_existe.csv")
except FileNotFoundError as erro:
    print("Erro:", erro)
# Erro: [Errno 2] No such file or directory: 'nao_existe.csv'`;

const C_VENV = String.raw`cd ~/Developer/curso-engenharia-ia
python3 -m venv .venv                 # cria o ambiente na pasta .venv
source .venv/bin/activate             # ativa-o (o terminal mostra (.venv))
pip install numpy pandas matplotlib scikit-learn jupyter
pip freeze > requirements.txt         # regista as versões instaladas
jupyter notebook                      # abre notebooks no browser, como o Colab`;

// Igual a codigo/relatorio_vendas.py.
const C_RELATORIO = String.raw`"""Relatório de vendas por loja, só com Python (sem bibliotecas externas)."""
import csv

DADOS = """loja,mes,valor
Lisboa,jan,1500
Porto,jan,980
Faro,jan,410
Lisboa,fev,1720
Porto,fev,1105
Faro,fev,640
Lisboa,mar,1610
Porto,mar,1290
Faro,mar,700
"""

def criar_ficheiro(caminho):
    """Escreve os dados de exemplo num ficheiro CSV."""
    with open(caminho, "w", encoding="utf-8") as f:
        f.write(DADOS)

def ler_vendas(caminho):
    """Lê o CSV e devolve uma lista de dicionários com o valor já em número."""
    vendas = []
    with open(caminho, encoding="utf-8") as f:
        for linha in csv.DictReader(f):
            linha["valor"] = float(linha["valor"])
            vendas.append(linha)
    return vendas

def total_por_loja(vendas):
    """Soma as vendas de cada loja."""
    totais = {}
    for v in vendas:
        totais[v["loja"]] = totais.get(v["loja"], 0) + v["valor"]
    return totais

def crescimento(vendas, loja, mes_inicial, mes_final):
    """Variação percentual das vendas de uma loja entre dois meses."""
    valores = {v["mes"]: v["valor"] for v in vendas if v["loja"] == loja}
    return (valores[mes_final] - valores[mes_inicial]) / valores[mes_inicial] * 100

criar_ficheiro("vendas_t1.csv")
vendas = ler_vendas("vendas_t1.csv")
totais = total_por_loja(vendas)

print(f"Registos lidos: {len(vendas)}")
for loja, total in sorted(totais.items(), key=lambda par: par[1], reverse=True):
    print(f"{loja:<8} {total:>8.2f} €   crescimento jan→mar: {crescimento(vendas, loja, 'jan', 'mar'):+.1f}%")
melhor = max(totais, key=totais.get)
print(f"Melhor loja do trimestre: {melhor}")
print(f"Total da rede: {sum(totais.values()):.2f} €")`;

const O_RELATORIO = `Registos lidos: 9
Lisboa    4830.00 €   crescimento jan→mar: +7.3%
Porto     3375.00 €   crescimento jan→mar: +31.6%
Faro      1750.00 €   crescimento jan→mar: +70.7%
Melhor loja do trimestre: Lisboa
Total da rede: 9955.00 €`;

// ---------------------------------------------------------------- código dos exercícios e do gabarito

const X1 = String.raw`print(10 / 4, 10 // 4, 10 % 4)
x = [5, 3, 8]; x.append(1); print(x[-2], len(x))
s = "engenharia"; print(s[:3], s[-3:], s.upper()[0])
d = {"a": 1}; d["b"] = d.get("a", 0) + 5; print(d)
print([n * 2 for n in range(5) if n != 2])
a = [1, 2]; b = a; b += [3]; print(a)`;

const X1_OUT = `2.5 2 2
8 4
eng ria E
{'a': 1, 'b': 6}
[0, 2, 6, 8]
[1, 2, 3]`;

const X3 = String.raw`def media(valores)
    total = 0
    for v in valores:
    total += v
    return total / len(valores)
print(media([10, 20, "30"]))`;

const G3 = String.raw`def media(valores):
    total = 0
    for v in valores:
        total += float(v)
    return total / len(valores)
print(media([10, 20, "30"]))   # 20.0`;

const G4 = String.raw`def classificar_temperatura(t):
    """Classifica uma temperatura em °C como 'frio', 'ameno' ou 'quente'."""
    if t < 15:
        return "frio"
    elif t <= 25:
        return "ameno"
    else:
        return "quente"

print([classificar_temperatura(t) for t in [10, 15, 25, 30]])
# ['frio', 'ameno', 'ameno', 'quente']`;

const G5 = String.raw`def contar_palavras(texto):
    """Conta quantas vezes aparece cada palavra, sem distinguir maiúsculas."""
    for sinal in ".,!?;:":
        texto = texto.replace(sinal, "")
    contagem = {}
    for palavra in texto.lower().split():
        contagem[palavra] = contagem.get(palavra, 0) + 1
    return contagem

print(contar_palavras("O gato e o cão. O gato!"))
# {'o': 3, 'gato': 2, 'e': 1, 'cão': 1}`;

const G6 = String.raw`for n in range(1, 16):
    if n % 15 == 0:
        print("FizzBuzz", end=" ")
    elif n % 3 == 0:
        print("Fizz", end=" ")
    elif n % 5 == 0:
        print("Buzz", end=" ")
    else:
        print(n, end=" ")
# 1 2 Fizz 4 Buzz Fizz 7 8 Fizz Buzz 11 Fizz 13 14 FizzBuzz`;

const G7 = String.raw`capital, anos = 1000, 0
while capital < 2000:
    capital *= 1.04
    anos += 1
print(anos, round(capital, 2))   # 18 2025.82`;

const X8 = String.raw`produtos = [
    {"nome": "Bola", "preco": 12.5, "stock": 30},
    {"nome": "Luva", "preco": 25.0, "stock": 0},
    {"nome": "Driver", "preco": 299.0, "stock": 4},
    {"nome": "Saco", "preco": 180.0, "stock": 0},
]`;

const G8 = String.raw`esgotados = [p["nome"] for p in produtos if p["stock"] == 0]
promo = {p["nome"]: round(p["preco"] * 0.9, 2) for p in produtos if p["preco"] > 50}
print(esgotados, promo)
# ['Luva', 'Saco'] {'Driver': 269.1, 'Saco': 162.0}`;

const X9_CSV = `aluno,nota
Ana,16
Bruno,12.5
Carla,vinte
Diogo,18`;

const G9 = String.raw`import csv

def ler_notas(caminho):
    """Lê aluno,nota de um CSV e devolve a média das notas válidas."""
    notas = []
    with open(caminho, encoding="utf-8") as f:
        for linha in csv.DictReader(f):
            try:
                notas.append(float(linha["nota"]))
            except ValueError:
                print(f"Aviso: nota inválida para {linha['aluno']}: {linha['nota']}")
    return sum(notas) / len(notas)

print(round(ler_notas("notas.csv"), 2))
# Aviso: nota inválida para Carla: vinte
# 15.5`;

const G10 = String.raw`def palavras_suspeitas_encontradas(mensagem, suspeitas=("grátis", "prémio", "clique aqui", "urgente")):
    """Devolve a lista das palavras suspeitas que aparecem na mensagem."""
    texto = mensagem.lower()
    return [p for p in suspeitas if p in texto]

print(palavras_suspeitas_encontradas("URGENTE: prémio grátis!"))   # ['grátis', 'prémio', 'urgente']
print(palavras_suspeitas_encontradas("Reunião às 10h"))            # []
print(palavras_suspeitas_encontradas("Oferta exclusiva", suspeitas=["oferta", "exclusiva"]))
# ['oferta', 'exclusiva']`;

const G11 = String.raw`import json

def media_mensal_por_loja(vendas):
    """Média das vendas mensais de cada loja."""
    soma, meses = {}, {}
    for v in vendas:
        soma[v["loja"]] = soma.get(v["loja"], 0) + v["valor"]
        meses[v["loja"]] = meses.get(v["loja"], 0) + 1
    return {loja: round(soma[loja] / meses[loja], 2) for loja in soma}

def total_por_mes(vendas):
    """Soma as vendas da rede em cada mês."""
    totais = {}
    for v in vendas:
        totais[v["mes"]] = totais.get(v["mes"], 0) + v["valor"]
    return totais

medias = media_mensal_por_loja(vendas)
por_mes = total_por_mes(vendas)
melhor_mes = max(por_mes, key=por_mes.get)
print(medias)                # {'Lisboa': 1610.0, 'Porto': 1125.0, 'Faro': 583.33}
print(por_mes, melhor_mes)   # {'jan': 2890.0, 'fev': 3465.0, 'mar': 3600.0} mar

resumo = {"media_mensal": medias, "total_por_mes": por_mes, "melhor_mes": melhor_mes}
with open("resumo_t1.json", "w", encoding="utf-8") as f:
    json.dump(resumo, f, ensure_ascii=False, indent=2)`;

const G12 = String.raw`def nif_valido(nif):
    """Verifica se um NIF português tem 9 dígitos e o dígito de controlo certo."""
    nif = str(nif).strip()
    if len(nif) != 9 or not nif.isdigit():
        return False
    soma = sum(int(d) * peso for d, peso in zip(nif[:8], range(9, 1, -1)))
    resto = soma % 11
    controlo = 0 if resto < 2 else 11 - resto
    return int(nif[8]) == controlo

for n in ["123456789", "123456780", "12345678", "12345678A"]:
    print(n, nif_valido(n))
# 123456789 True
# 123456780 False
# 12345678 False
# 12345678A False`;

const P13_EXEMPLO = String.raw`print(resumo_precos(["10", "25.5", "abc", "4.5", ""]))
# {'validos': 3, 'minimo': 4.5, 'maximo': 25.5, 'media': 13.33}
print(resumo_precos(["x", ""]))
# {'validos': 0, 'minimo': None, 'maximo': None, 'media': None}`;

const G13 = String.raw`def resumo_precos(precos):
    """Resume uma lista de preços em texto, ignorando os inválidos."""
    validos = []
    for p in precos:
        try:
            validos.append(float(p))
        except ValueError:
            continue
    if not validos:
        return {"validos": 0, "minimo": None, "maximo": None, "media": None}
    return {
        "validos": len(validos),
        "minimo": min(validos),
        "maximo": max(validos),
        "media": round(sum(validos) / len(validos), 2),
    }`;

export const M2: ModuleContent = {
  id: "M2",
  duration: "2 semanas, cerca de 6 horas",
  intro:
    "No fim deste módulo deve saber escrever programas Python com variáveis, listas, dicionários, ciclos e funções, ler e escrever ficheiros, tratar erros e criar um ambiente de trabalho no Colab ou no computador.",
  outcomes: [
    "Escrever programas Python com variáveis, listas, dicionários, ciclos e funções",
    "Ler e escrever ficheiros",
    "Tratar erros",
    "Criar um ambiente de trabalho no Colab ou no computador",
  ],
  goldenRule:
    "Tentar sempre cada exercício antes de abrir as soluções do gabarito. Quando um exemplo der erro, ler a última linha da mensagem antes de mais nada: diz o tipo de erro e, quase sempre, a linha onde aconteceu.",
  sessions: [
    {
      id: "w1s1",
      label: "Semana 1 · sessão 1",
      minutes: 90,
      tasks: [
        { id: "t1", text: "Ler as secções 1 a 3", link: { kind: "section", id: "s1" } },
        { id: "t2", text: "Correr os exemplos das secções 1 a 3 no Colab", link: { kind: "section", id: "s2" } },
      ],
    },
    {
      id: "w1s2",
      label: "Semana 1 · sessão 2",
      minutes: 90,
      tasks: [
        { id: "t1", text: "Ler as secções 4 e 5", link: { kind: "section", id: "s4" } },
        { id: "t2", text: "Fazer os exercícios 1 a 6", link: { kind: "tab", tab: "exercicios" } },
      ],
    },
    {
      id: "w2s1",
      label: "Semana 2 · sessão 1",
      minutes: 90,
      tasks: [
        { id: "t1", text: "Ler as secções 6 a 8", link: { kind: "section", id: "s6" } },
        { id: "t2", text: "Fazer os exercícios 7 a 10", link: { kind: "tab", tab: "exercicios" } },
      ],
    },
    {
      id: "w2s2",
      label: "Semana 2 · sessão 2",
      minutes: 90,
      tasks: [
        { id: "t1", text: "Fazer os exercícios 11 e 12", link: { kind: "tab", tab: "exercicios" } },
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
      title: "Porquê Python para IA",
      minutes: 10,
      blocks: [
        {
          t: "callout",
          tone: "info",
          title: "Como estudar este módulo",
          text: "Este é um módulo de prática: aprende-se Python a escrever Python. Cada exemplo da aula deve ser corrido no Colab e alterado até se perceber o que cada linha faz. Todo o código foi testado e os resultados mostrados nos comentários são os reais. Quando um exemplo der erro, ler a última linha da mensagem antes de mais nada: diz o tipo de erro e, quase sempre, a linha onde aconteceu.",
        },
        {
          t: "p",
          text: "O Python não é a linguagem mais rápida, mas é a mais usada em IA por três razões: lê-se quase como pseudocódigo, tem as bibliotecas de referência de toda a área e funciona como \"cola\" sobre código compilado muito rápido. Em 2024, o relatório [Octoverse](https://github.blog/news-insights/octoverse/octoverse-2024/) do GitHub indicou que o Python passou a ser a linguagem mais usada na plataforma, puxado pelos projetos de IA.",
        },
        {
          t: "figure",
          src: "img/01-ecossistema-python.png",
          alt: "O Python organiza o trabalho; o cálculo pesado corre em código compilado",
        },
        {
          t: "p",
          text: "Quando se chama uma função do NumPy ou do PyTorch, o Python só dá a ordem; as contas correm em código C, C++ ou CUDA já compilado (Harris et al., 2020). Por isso, um programa de IA em Python pode ser tão rápido como um escrito em C, desde que o trabalho pesado seja entregue às bibliotecas. O M3 mostra isto na prática.",
        },
        {
          t: "p",
          text: "A filosofia da linguagem está resumida no \"Zen of Python\" (Peters, 2004). Para o ver, basta correr `import this`. Três das suas regras guiam este curso:",
        },
        {
          t: "list",
          items: [
            "*Beautiful is better than ugly* — código bonito é melhor do que feio.",
            "*Readability counts* — a legibilidade conta.",
            "*Errors should never pass silently* — os erros nunca devem passar em silêncio.",
          ],
        },
        {
          t: "p",
          text: "O estilo oficial de escrita de código Python está no PEP 8 (van Rossum, Warsaw & Coghlan, 2001): nomes de variáveis e funções em minúsculas com `_` (`preco_total`), indentação de 4 espaços, linhas curtas. Todo o código do curso segue estas regras.",
        },
        {
          t: "check",
          id: "qc1",
          q: "Porque é que um programa de IA em Python pode ser tão rápido como um escrito em C?",
          options: [
            "Porque o Python só dá a ordem: as contas das bibliotecas, como o NumPy, correm em código C, C++ ou CUDA já compilado",
            "Porque o Python é a linguagem mais rápida",
            "Porque o Python traduz cada programa para C antes de o correr",
            "Porque o Python usa sempre a GPU",
          ],
          answer: 0,
          explain: "O Python funciona como \"cola\": desde que o trabalho pesado seja entregue às bibliotecas, as contas correm em código compilado.",
        },
      ],
    },
    {
      id: "s2",
      num: 2,
      title: "Variáveis e tipos de dados",
      minutes: 20,
      blocks: [
        {
          t: "p",
          text: "Uma **variável** é um nome que aponta para um valor. Em Python não se declara o tipo: ele é deduzido do valor. A função `type()` mostra-o.",
        },
        {
          t: "code",
          code: C_TIPOS,
          output: "<class 'int'> <class 'float'> <class 'str'> <class 'bool'> <class 'NoneType'>",
        },
        {
          t: "table",
          head: ["Tipo", "O que guarda", "Exemplo"],
          rows: [
            ["`int`", "Números inteiros, sem limite de tamanho", "`42`, `-7`"],
            ["`float`", "Números decimais, com precisão limitada", "`3.14`, `1e-3`"],
            ["`str`", "Texto", "`\"Olá\"`"],
            ["`bool`", "Verdadeiro ou falso", "`True`, `False`"],
            ["`None`", "Ausência de valor", "`None`"],
          ],
        },
        { t: "h3", text: "Operações com números" },
        { t: "code", code: C_NUMEROS, output: "3.5 3 1 1024\n0.30000000000000004\n0.3" },
        {
          t: "p",
          text: "`/` é a divisão normal, `//` a divisão inteira, `%` o resto e `**` a potência. O `0.30000000000000004` não é um erro do Python: os computadores guardam decimais em binário e 0,1 não tem representação exata, tal como 1/3 não tem em decimal (Goldberg, 1991). Na prática: nunca comparar decimais com `==`, e arredondar só no fim. Para dinheiro em sistemas reais usa-se o módulo `decimal`.",
        },
        { t: "h3", text: "Texto" },
        {
          t: "code",
          title: "Python (usa a variável nome do primeiro exemplo desta secção)",
          code: C_TEXTO,
          output: "Ana pagou 49.90 €\n43 7.0 100\nP n Pyt 6\nolá mundo\n['a', 'b', 'c']",
        },
        {
          t: "p",
          text: "As **f-strings** (`f\"...\"`) são a forma moderna de juntar texto e valores; `:.2f` formata com duas casas decimais. As conversões `int()`, `float()` e `str()` são essenciais, porque tudo o que vem de um ficheiro ou de um formulário chega como texto. Os índices começam em 0, e os negativos contam a partir do fim.",
        },
        {
          t: "check",
          id: "qc2",
          q: "O que imprime `print(7 // 2, 7 % 2)`?",
          options: ["`3.5 1`", "`3 1`", "`3 0.5`", "`4 1`"],
          answer: 1,
          explain: "`//` é a divisão inteira (7 // 2 = 3) e `%` é o resto (7 % 2 = 1). A divisão normal, `7 / 2`, daria `3.5`.",
        },
      ],
    },
    {
      id: "s3",
      num: 3,
      title: "Estruturas de dados",
      minutes: 30,
      blocks: [
        {
          t: "p",
          text: "Quase todos os dados que um sistema de IA usa chegam numa de quatro estruturas. Escolher a certa torna o código mais simples e mais rápido.",
        },
        {
          t: "table",
          head: ["Estrutura", "Sintaxe", "Ordenada", "Pode mudar", "Para que serve"],
          rows: [
            ["Lista (`list`)", "`[1, 2, 3]`", "Sim", "Sim", "Sequências: preços, mensagens, linhas de um ficheiro"],
            ["Tuplo (`tuple`)", "`(38.72, -9.14)`", "Sim", "Não", "Grupos fixos: coordenadas, pares chave-valor"],
            ["Dicionário (`dict`)", "`{\"nome\": \"Bola\"}`", "Sim, pela ordem de inserção", "Sim", "Registos com campos e pesquisa rápida por chave"],
            ["Conjunto (`set`)", "`{\"spam\", \"promo\"}`", "Não", "Sim", "Valores únicos e testes \"está lá?\" rápidos"],
          ],
        },
        { t: "h3", text: "Listas" },
        {
          t: "code",
          code: C_LISTAS,
          output: "19.9 60.0 [45.0, 120.5]\n5 254.15 120.5 8.75\n[8.75, 19.9, 45.0, 60.0, 120.5]",
        },
        {
          t: "p",
          text: "O **fatiamento** (`precos[1:3]`) inclui o primeiro índice e exclui o último. Esta regra repete-se no NumPy e no pandas.",
        },
        {
          t: "widget",
          name: "m2-slicing",
          caption: "Índices e fatias: escolha início, fim e passo (ou um índice) e veja que posições entram e o que o Python imprime.",
        },
        { t: "h3", text: "Tuplos" },
        { t: "code", code: C_TUPLOS, output: "38.72 -9.14" },
        { t: "h3", text: "Dicionários" },
        {
          t: "code",
          code: C_DICIONARIOS,
          output: "Bola sem cor\nnome = Bola\npreco = 12.5\nstock = 29\ncategoria = Acessórios",
        },
        {
          t: "p",
          text: "O dicionário é a estrutura mais útil de todas: um registo de uma base de dados, uma resposta JSON de uma API ou a configuração de um modelo são dicionários. `get(chave, valor_por_omissão)` evita o erro `KeyError` quando a chave não existe.",
        },
        { t: "h3", text: "Conjuntos" },
        { t: "code", code: C_CONJUNTOS, output: "{'promo', 'spam'} True" },
        {
          t: "p",
          text: "O duplicado desaparece. A ordem em que o conjunto aparece pode variar de uma execução para outra.",
        },
        { t: "h3", text: "Cuidado: duas variáveis, a mesma lista" },
        { t: "code", code: C_ALIAS, output: "[1, 2, 3, 4]\n[1, 2, 3, 4] [1, 2, 3, 4, 5]" },
        {
          t: "p",
          text: "Este é um dos erros mais comuns de quem começa, e volta a aparecer com arrays NumPy e tabelas pandas. Atribuir (`=`) nunca copia; copiar tem de ser pedido.",
        },
        {
          t: "widget",
          name: "m2-aliasing",
          caption: "Duas variáveis, a mesma lista: escolha como nasce o b, altere a ou b e veja para onde aponta cada nome.",
        },
        {
          t: "check",
          id: "qc3",
          q: "Depois de `a = [1, 2]`, `c = a.copy()` e `c.append(3)`, o que imprime `print(a, c)`?",
          options: ["`[1, 2, 3] [1, 2, 3]`", "`[1, 2, 3] [1, 2]`", "`[1, 2] [1, 2]`", "`[1, 2] [1, 2, 3]`"],
          answer: 3,
          explain: "`a.copy()` cria uma lista nova: mudar `c` não mexe em `a`. Com `c = a`, os dois nomes seriam a mesma lista e daria `[1, 2, 3] [1, 2, 3]`.",
        },
      ],
    },
    {
      id: "s4",
      num: 4,
      title: "Controlo de fluxo",
      minutes: 30,
      blocks: [
        {
          t: "p",
          text: "Em Python, os blocos de código são definidos pela **indentação** (4 espaços), não por chavetas. Uma indentação errada muda o significado do programa ou dá `IndentationError`.",
        },
        { t: "h3", text: "Condições" },
        { t: "code", code: C_IF, output: "Ligar aquecimento" },
        {
          t: "p",
          text: "O termóstato do M1 em três linhas: é IA baseada em regras. Os operadores de comparação são `==`, `!=`, `<`, `<=`, `>`, `>=`, e combinam-se com `and`, `or` e `not`.",
        },
        { t: "h3", text: "Ciclos for" },
        {
          t: "code",
          code: C_FOR,
          output: "445\n0 120\n1 80\n2 0\n3 200\n4 45\nLisboa: 1500 €\nPorto: 980 €\nFaro: 640 €\n0 1 2",
        },
        {
          t: "p",
          text: "`break` termina o ciclo; `continue` passa à iteração seguinte. `enumerate` e `zip` evitam o padrão `for i in range(len(lista))`, que é mais difícil de ler.",
        },
        { t: "h3", text: "Ciclos while" },
        { t: "code", code: C_WHILE, output: "8 214.36" },
        {
          t: "p",
          text: "Um `while` repete enquanto a condição for verdadeira. Se a condição nunca ficar falsa, o ciclo nunca acaba; no Colab, interrompe-se com o botão de parar a célula.",
        },
        { t: "h3", text: "Compreensões de listas e dicionários" },
        {
          t: "code",
          code: C_COMPREENSOES,
          output: "[0, 1, 4, 9, 16, 25]\n[0, 2, 4, 6, 8]\n{'bola': 15.38, 'luva': 30.75, 'boné': 18.45}",
        },
        {
          t: "p",
          text: "Uma compreensão constrói uma lista ou um dicionário numa só linha: \"para cada x em…, se…, guarda…\". É a forma idiomática de transformar e filtrar dados em Python, e aparece em quase todo o código de IA. Se ficar difícil de ler, um `for` normal é melhor.",
        },
        {
          t: "widget",
          name: "m2-loops",
          caption: "Os exemplos desta secção, passo a passo: que linha corre, como ficam as variáveis e o que já foi impresso.",
        },
        {
          t: "check",
          id: "qc4",
          q: "O que imprime `print([x for x in range(5) if x % 2 == 1])`?",
          options: ["`[0, 2, 4]`", "`[1, 3, 5]`", "`[1, 3]`", "`[2, 4]`"],
          answer: 2,
          explain: "`range(5)` dá 0 a 4 e o `if` só guarda os ímpares (resto 1 na divisão por 2): `[1, 3]`. O 5 não entra, porque `range(5)` para antes dele.",
        },
      ],
    },
    {
      id: "s5",
      num: 5,
      title: "Funções",
      minutes: 25,
      blocks: [
        {
          t: "p",
          text: "Uma **função** dá nome a um bloco de código para o reutilizar. É a unidade básica de organização de qualquer programa: se o mesmo código aparece duas vezes, deve passar a ser uma função.",
        },
        { t: "code", code: C_FUNCAO, output: "123.0\n106.0\nDevolve o preço com IVA, arredondado a 2 casas." },
        {
          t: "list",
          items: [
            "**Parâmetros** são os nomes entre parênteses; `taxa=0.23` tem um **valor por omissão**, usado quando não se passa outro.",
            "**`return`** devolve o resultado. Uma função sem `return` devolve `None`.",
            "A **docstring** (o texto entre aspas triplas) explica o que a função faz. Os editores e os assistentes de IA usam-na para perceber o código.",
            "Passar `taxa=0.06` pelo nome torna a chamada mais clara do que `preco_com_iva(100, 0.06)`.",
          ],
        },
        { t: "h3", text: "Devolver vários valores e indicar tipos" },
        { t: "code", code: C_ESTATISTICAS, output: "4 42 18.0" },
        {
          t: "p",
          text: "As anotações `list[float]` e `-> tuple[...]` chamam-se **type hints**. O Python não as verifica ao correr, mas documentam o código e ferramentas como o `mypy` usam-nas para encontrar erros antes de o programa correr. As bibliotecas de IA modernas usam-nas por todo o lado.",
        },
        { t: "h3", text: "Âmbito: variáveis dentro e fora das funções" },
        { t: "code", code: C_AMBITO, output: "1 0" },
        {
          t: "p",
          text: "Uma variável criada dentro de uma função só existe lá dentro. A boa prática é as funções receberem tudo o que precisam por parâmetros e devolverem o resultado com `return`, sem mexer em variáveis de fora.",
        },
        { t: "h3", text: "Funções anónimas (lambda)" },
        { t: "code", code: C_LAMBDA, output: "[('bola', 12.5), ('boné', 15.0), ('luva', 25.0)]" },
        {
          t: "p",
          text: "Uma `lambda` é uma função curta sem nome, usada sobretudo para dizer a `sorted`, `max` ou `min` por que critério comparar.",
        },
        {
          t: "check",
          id: "qc5",
          q: "Com `def dobro(x): resultado = x * 2` (uma função sem `return`), o que imprime `print(dobro(4))`?",
          options: ["`None`", "`8`", "`4`", "Dá erro."],
          answer: 0,
          explain: "Uma função sem `return` devolve `None`. O `resultado` foi calculado, mas ficou dentro da função e perdeu-se.",
        },
      ],
    },
    {
      id: "s6",
      num: 6,
      title: "Ficheiros, módulos e erros",
      minutes: 30,
      blocks: [
        { t: "h3", text: "Ler e escrever ficheiros" },
        {
          t: "p",
          text: "Os dados de um projeto de IA chegam quase sempre em ficheiros CSV (tabelas em texto) ou JSON (dados estruturados, o formato das APIs). O Python lê os dois sem instalar nada.",
        },
        {
          t: "code",
          code: C_FICHEIROS,
          output: "5 {'loja': 'Lisboa', 'mes': 'jan', 'valor': '1500'}\n5945.0",
        },
        { t: "p", text: "Três pormenores importam:" },
        {
          t: "list",
          items: [
            "**`with open(...)`** fecha o ficheiro sozinho no fim, mesmo que haja um erro.",
            "**`encoding=\"utf-8\"`** garante que os acentos portugueses são lidos e escritos bem em qualquer sistema.",
            "O CSV devolve **sempre texto**: `'1500'` é uma string e tem de ser convertido com `float()` antes de se fazer contas.",
          ],
        },
        { t: "h3", text: "Módulos e pacotes" },
        { t: "code", code: C_MODULOS, output: "4.0 2.5 2.5" },
        {
          t: "p",
          text: "Um **módulo** é um ficheiro `.py` com funções; `import` torna-as disponíveis. A biblioteca padrão do Python já traz centenas (`csv`, `json`, `math`, `statistics`, `datetime`, `random`, `pathlib`). Os **pacotes externos**, como o NumPy ou o scikit-learn, instalam-se com `pip install nome`. No Colab, a maioria já vem instalada; para instalar outro, corre-se `!pip install nome` numa célula.",
        },
        { t: "h3", text: "Tratar erros" },
        {
          t: "code",
          code: C_ERROS,
          output: "Aviso: 'doze' não é um número\n12.5 None\nErro: [Errno 2] No such file or directory: 'nao_existe.csv'",
        },
        {
          t: "p",
          text: "Dados reais têm sempre linhas estragadas. `try`/`except` deixa o programa continuar e registar o problema, em vez de parar à primeira linha má. Mas deve apanhar-se só o erro esperado (`ValueError`, `FileNotFoundError`), nunca todos os erros com um `except:` vazio: isso esconde falhas verdadeiras, contra a regra *errors should never pass silently*.",
        },
        {
          t: "table",
          head: ["Erro", "Quando acontece"],
          rows: [
            ["`SyntaxError`", "O código está mal escrito: falta um `:` ou um parêntese"],
            ["`IndentationError`", "A indentação não está certa"],
            ["`NameError`", "Usou-se uma variável que não existe (muitas vezes, um erro de escrita)"],
            ["`TypeError`", "Operação entre tipos incompatíveis, como `\"10\" + 5`"],
            ["`ValueError`", "O tipo está certo mas o valor não, como `float(\"doze\")`"],
            ["`KeyError`", "A chave não existe no dicionário"],
            ["`IndexError`", "O índice está fora da lista"],
            ["`FileNotFoundError`", "O ficheiro não existe no caminho indicado"],
          ],
        },
        {
          t: "check",
          id: "qc6",
          q: "Uma linha lida com `csv.DictReader` é `{'loja': 'Porto', 'valor': '980'}`. O que acontece com `linha['valor'] + 1`?",
          options: ["Dá `981`", "Dá `'9801'`", "Dá `TypeError`", "Dá `ValueError`"],
          answer: 2,
          explain: "O CSV devolve sempre texto: `'980'` é uma string, e somar texto com um número dá `TypeError`. Primeiro converte-se: `float(linha['valor']) + 1` dá `981.0`.",
        },
      ],
    },
    {
      id: "s7",
      num: 7,
      title: "Ambientes: Colab, Python local e ambientes virtuais",
      minutes: 15,
      blocks: [
        {
          t: "p",
          text: "Os **notebooks** juntam código, resultados, gráficos e texto no mesmo documento. Nasceram do projeto Jupyter (Kluyver et al., 2016) e tornaram-se a ferramenta padrão de quem trabalha com dados (Perkel, 2018). O Colab é um Jupyter alojado pela Google.",
        },
        {
          t: "table",
          head: ["", "Google Colab", "Python no computador"],
          rows: [
            ["Instalação", "Nenhuma", "Python, um editor e as bibliotecas"],
            ["GPU", "Gratuita, com limites", "Só se o computador tiver"],
            ["Ficheiros", "Apagam-se ao fechar a sessão, exceto os guardados no Drive", "Ficam no disco"],
            ["Ideal para", "Fases 0 a 3: aprender e experimentar", "Fases 4 e 5: aplicações, APIs e projetos com Git e Claude Code"],
          ],
        },
        { t: "h3", text: "Preparar o Python no Mac" },
        {
          t: "p",
          text: "O macOS traz um Python do sistema que não deve ser usado para projetos. O caminho limpo é instalar uma versão recente (pelo [python.org](https://www.python.org/downloads/) ou com `brew install python`) e criar um **ambiente virtual** por projeto:",
        },
        { t: "code", title: "Terminal", code: C_VENV },
        {
          t: "p",
          text: "Um ambiente virtual é uma cópia isolada do Python com as suas próprias bibliotecas. Assim, um projeto que precise do pandas 2 não entra em conflito com outro que use o pandas 3. O `requirements.txt` permite recriar o mesmo ambiente noutro computador com `pip install -r requirements.txt`.",
        },
        { t: "h3", text: "Boas práticas desde já" },
        {
          t: "list",
          ordered: true,
          items: [
            "Nomes que dizem o que a coisa é: `total_vendas`, não `x2`.",
            "Uma função faz uma coisa só, e tem docstring.",
            "Nos notebooks, correr tudo de cima a baixo antes de dar o trabalho por terminado (no Colab: Ambiente de execução → Executar tudo). Células corridas fora de ordem são a causa mais comum de resultados que ninguém consegue repetir.",
            "Guardar o código em Git a partir da Fase 4.",
          ],
        },
        {
          t: "check",
          id: "qc7",
          q: "Para que serve `pip freeze > requirements.txt`?",
          options: [
            "Instala as bibliotecas do projeto",
            "Ativa o ambiente virtual",
            "Atualiza o Python para a última versão",
            "Regista as versões instaladas, para recriar o mesmo ambiente noutro computador",
          ],
          answer: 3,
          explain: "O `requirements.txt` guarda as versões; noutro computador, `pip install -r requirements.txt` recria o mesmo ambiente.",
        },
      ],
    },
    {
      id: "s8",
      num: 8,
      title: "Exemplo completo: relatório de vendas em Python puro",
      minutes: 20,
      blocks: [
        {
          t: "p",
          text: "Este programa junta tudo o que foi visto: lê um CSV de vendas de três lojas num trimestre, calcula o total de cada loja e o crescimento de janeiro a março, e imprime um relatório. Usa só a biblioteca padrão. No M3, o mesmo trabalho faz-se em quatro linhas com pandas; perceber primeiro a versão \"à mão\" ajuda a saber o que o pandas está a fazer.",
        },
        { t: "code", title: "codigo/relatorio_vendas.py", code: C_RELATORIO, output: O_RELATORIO },
        {
          t: "p",
          text: "Repare na estrutura: cada função faz uma coisa (criar, ler, somar, comparar) e o programa principal, no fim, só as encadeia. Lisboa vende mais, mas Faro cresce mais depressa: um bom relatório mostra as duas coisas. Na formatação, `:<8` alinha à esquerda em 8 caracteres, `:>8.2f` alinha à direita com 2 casas e `:+.1f` mostra sempre o sinal.",
        },
        {
          t: "check",
          id: "qc8",
          q: "O que imprime `print(f\"{31.6:+.1f}% {9955:.2f}\")`?",
          options: ["`+31.6% 9955.00`", "`31.6% 9955`", "`+31.60% 9955.0`", "`+32% 9955.00`"],
          answer: 0,
          explain: "`:+.1f` mostra sempre o sinal e uma casa decimal; `:.2f` mostra duas casas, mesmo num número inteiro.",
        },
      ],
    },
  ],

  readings: {
    required: [
      { text: "Matthes, E. (2023). *Python Crash Course* (3.ª ed.). No Starch Press. Parte I, caps. 1 a 8 e 10." },
      { text: "Python Software Foundation. *The Python Tutorial*, secções 3 a 8.", href: "https://docs.python.org/3/tutorial/" },
    ],
    complementary: [
      {
        text: "Sweigart, A. (2019). [*Automate the Boring Stuff with Python*](https://automatetheboringstuff.com/) (2.ª ed.). No Starch Press. Gratuito online; bom para praticar com tarefas do dia a dia.",
        href: "https://automatetheboringstuff.com/",
      },
      {
        text: "van Rossum, G., Warsaw, B. & Coghlan, N. (2001). [PEP 8 — Style Guide for Python Code](https://peps.python.org/pep-0008/).",
        href: "https://peps.python.org/pep-0008/",
      },
    ],
    cited: [
      "Peters, T. (2004). [PEP 20 — The Zen of Python](https://peps.python.org/pep-0020/).",
      "Goldberg, D. (1991). What every computer scientist should know about floating-point arithmetic. *ACM Computing Surveys*, 23(1), 5–48.",
      "Kluyver, T. et al. (2016). Jupyter Notebooks — a publishing format for reproducible computational workflows. In *Positioning and Power in Academic Publishing* (pp. 87–90). IOS Press.",
      "Perkel, J. M. (2018). Why Jupyter is data scientists' computational notebook of choice. *Nature*, 563, 145–146.",
      "Harris, C. R. et al. (2020). Array programming with NumPy. *Nature*, 585, 357–362.",
      "GitHub (2024). [Octoverse: AI leads Python to top language as the number of global developers surges](https://github.blog/news-insights/octoverse/octoverse-2024/).",
    ],
  },

  // ---------------------------------------------------------------- APOSTILA (02-apostila.md)
  apostila: {
    intro: "Resumo para rever antes da prova e para consultar enquanto programa.",
    sections: [
      {
        title: "Tipos básicos",
        blocks: [
          {
            t: "table",
            head: ["Tipo", "Exemplo", "Conversão"],
            rows: [
              ["`int`", "`42`", "`int(\"42\")`"],
              ["`float`", "`3.14`", "`float(\"3.14\")`"],
              ["`str`", "`\"Olá\"`", "`str(42)`"],
              ["`bool`", "`True`", "`bool(0)` → `False`"],
              ["`None`", "`None`", "—"],
            ],
          },
          {
            t: "p",
            text: "Operadores: `/` divisão · `//` divisão inteira · `%` resto · `**` potência. Decimais nunca se comparam com `==`: usar `math.isclose(a, b)` ou arredondar.",
          },
        ],
      },
      {
        title: "Texto",
        blocks: [
          {
            t: "code",
            code: String.raw`f"{nome} pagou {preco:.2f} €"   # f-string com 2 casas decimais
s[0], s[-1], s[0:3], len(s)       # primeiro, último, fatia, tamanho
s.lower(), s.upper(), s.strip(), s.split(","), s.replace("a", "b")`,
          },
        ],
      },
      {
        title: "Estruturas de dados",
        blocks: [
          {
            t: "table",
            head: ["Estrutura", "Criar", "Operações mais usadas"],
            rows: [
              ["Lista", "`[1, 2, 3]`", "`append`, `sort`, `len`, `sum`, `max`, `min`, `l[1:3]`"],
              ["Tuplo", "`(1, 2)`", "desempacotar: `a, b = t`"],
              ["Dicionário", "`{\"k\": v}`", "`d[\"k\"]`, `d.get(\"k\", omissão)`, `d.items()`, `d.keys()`"],
              ["Conjunto", "`{1, 2}`", "`x in s`, `add`, remove duplicados"],
            ],
          },
          { t: "p", text: "`b = a` não copia: `b` e `a` passam a ser a mesma lista. Para copiar: `b = a.copy()`." },
        ],
      },
      {
        title: "Controlo de fluxo",
        blocks: [
          {
            t: "code",
            code: String.raw`if cond: ... elif outra: ... else: ...
for x in lista: ...
for i, x in enumerate(lista): ...
for a, b in zip(lista1, lista2): ...
while cond: ...                    # break sai; continue salta
[f(x) for x in lista if cond]      # compreensão de lista
{k: f(v) for k, v in d.items()}    # compreensão de dicionário`,
          },
        ],
      },
      {
        title: "Funções",
        blocks: [
          {
            t: "code",
            code: String.raw`def nome(param, opcional=valor) -> tipo:
    """Docstring: o que faz."""
    return resultado

sorted(itens, key=lambda x: x[1])  # ordenar por um critério`,
          },
        ],
      },
      {
        title: "Ficheiros e erros",
        blocks: [
          {
            t: "code",
            code: String.raw`with open("f.csv", encoding="utf-8") as f:
    linhas = list(csv.DictReader(f))   # tudo chega como texto!

try:
    valor = float(texto)
except ValueError:
    valor = None`,
          },
        ],
      },
      {
        title: "Ambiente local",
        blocks: [
          {
            t: "code",
            title: "Terminal",
            code: String.raw`python3 -m venv .venv && source .venv/bin/activate
pip install numpy pandas matplotlib scikit-learn jupyter
pip freeze > requirements.txt`,
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
              "Esquecer o `:` no fim de `if`, `for`, `def`.",
              "Misturar espaços de indentação: usar sempre 4.",
              "Fazer contas com valores lidos de ficheiros sem os converter com `float()`.",
              "Pensar que `b = a` copia uma lista.",
              "Comparar decimais com `==`.",
              "Apanhar todos os erros com `except:` vazio.",
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
      title: "Parte A — Ler código",
      note: "Doze exercícios, cerca de 3 horas no total. Faça-os num notebook do Colab chamado \"M2 — exercícios\". As soluções testadas estão no gabarito: tentar sempre antes de as abrir.",
    },
    {
      id: "B",
      title: "Parte B — Programar",
      note: "Nos exercícios de programação há muitas soluções certas: o que conta é o resultado estar certo e o código ser legível.",
    },
    { id: "C", title: "Parte C — Mini-projetos" },
  ],
  exercises: [
    {
      id: "e1",
      num: 1,
      part: "A",
      session: "w1s2",
      kind: "text",
      title: "O que imprime cada linha?",
      minutes: 10,
      sections: ["s2", "s3", "s4"],
      prompt: [
        { t: "p", text: "Sem correr o código, escreva o que cada linha imprime. Depois confirme no Colab e explique as que errou." },
        { t: "code", code: X1 },
      ],
      fields: [
        { id: "prev", label: "O que imprime cada linha (antes de correr)", rows: 6, mono: true, placeholder: "linha 1: …\nlinha 2: …\nlinha 3: …\nlinha 4: …\nlinha 5: …\nlinha 6: …" },
        { id: "exp", label: "Depois de correr: as que errou e porquê", rows: 4 },
      ],
      criteria: [
        "Linha 1: `2.5 2 2`",
        "Linha 2: `8 4`",
        "Linha 3: `eng ria E`",
        "Linha 4: `{'a': 1, 'b': 6}`",
        "Linha 5: `[0, 2, 6, 8]`",
        "Linha 6: `[1, 2, 3]`, porque `b = a` faz das duas variáveis a mesma lista e `b += [3]` altera essa lista no sítio",
      ],
      solution: [
        { t: "code", code: X1, output: X1_OUT },
        {
          t: "p",
          text: "A última é a mais traiçoeira: `b = a` faz das duas variáveis a mesma lista, e `b += [3]` altera essa lista no sítio, tal como `append`.",
        },
      ],
    },
    {
      id: "e2",
      num: 2,
      part: "A",
      session: "w1s2",
      kind: "classify",
      title: "Que estrutura de dados?",
      minutes: 8,
      sections: ["s3"],
      prompt: [{ t: "p", text: "Que estrutura de dados usaria para cada caso, e porquê?" }],
      categories: ["Lista", "Tuplo", "Dicionário", "Conjunto"],
      justify: "Porquê",
      items: [
        { id: "a", text: "(a) Os preços de fecho de um produto em cada dia do mês.", answer: 0, explain: "Uma sequência ordenada que cresce todos os dias." },
        { id: "b", text: "(b) As coordenadas GPS de uma loja.", answer: 1, explain: "Um par fixo que não deve mudar." },
        { id: "c", text: "(c) A ficha de um cliente com nome, email e NIF.", answer: 2, explain: "Campos com nome." },
        { id: "d", text: "(d) Os emails únicos de uma lista que tem repetidos.", answer: 3, explain: "Elimina os repetidos sozinho, com `set(lista)`." },
      ],
      solution: [
        {
          t: "p",
          text: "(a) **Lista**: uma sequência ordenada que cresce todos os dias. (b) **Tuplo**: um par fixo que não deve mudar. (c) **Dicionário**: campos com nome. (d) **Conjunto**: elimina os repetidos sozinho, com `set(lista)`.",
        },
      ],
    },
    {
      id: "e3",
      num: 3,
      part: "A",
      session: "w1s2",
      kind: "text",
      title: "Três erros num programa",
      minutes: 10,
      sections: ["s4", "s5", "s6"],
      prompt: [
        { t: "p", text: "Este código tem três erros. Encontre-os, diga que tipo de erro cada um provoca e corrija o programa para que imprima `20.0`." },
        { t: "code", code: X3 },
      ],
      fields: [
        { id: "erros", label: "Os três erros e o tipo de erro de cada um", rows: 4 },
        { id: "codigo", label: "Programa corrigido", rows: 7, mono: true, placeholder: "def media(valores):\n    …" },
      ],
      criteria: [
        "Falta `:` no fim do `def` (`SyntaxError`)",
        "`total += v` não está indentado dentro do `for` (`IndentationError`)",
        "`\"30\"` é texto e não se soma a um número (`TypeError`)",
        "O programa corrigido imprime `20.0`",
      ],
      solution: [
        {
          t: "p",
          text: "Falta `:` no fim do `def` (`SyntaxError`); `total += v` não está indentado dentro do `for` (`IndentationError`); `\"30\"` é texto e não se soma a um número (`TypeError`). Corrigido:",
        },
        { t: "code", code: G3, output: "20.0" },
      ],
    },
    {
      id: "e4",
      num: 4,
      part: "B",
      session: "w1s2",
      kind: "text",
      title: "classificar_temperatura",
      minutes: 10,
      sections: ["s4", "s5"],
      prompt: [
        {
          t: "p",
          text: "Escreva a função `classificar_temperatura(t)`, que devolve `\"frio\"` abaixo de 15 °C, `\"ameno\"` de 15 a 25 °C (inclusive) e `\"quente\"` acima de 25 °C. Teste com 10, 15, 25 e 30.",
        },
      ],
      fields: [{ id: "codigo", label: "Código e resultado dos testes", rows: 12, mono: true, placeholder: "def classificar_temperatura(t):\n    …" }],
      criteria: [
        "Devolve \"frio\" abaixo de 15",
        "Devolve \"ameno\" de 15 a 25, com 15 e 25 incluídos",
        "Devolve \"quente\" acima de 25",
        "Os testes dão `['frio', 'ameno', 'ameno', 'quente']`",
      ],
      solution: [
        { t: "code", code: G4, output: "['frio', 'ameno', 'ameno', 'quente']" },
        { t: "p", text: "No `elif` não é preciso `t >= 15`: se o programa lá chegou, é porque `t < 15` foi falso." },
      ],
    },
    {
      id: "e5",
      num: 5,
      part: "B",
      session: "w1s2",
      kind: "text",
      title: "contar_palavras",
      minutes: 15,
      sections: ["s2", "s3", "s5"],
      prompt: [
        {
          t: "p",
          text: "Escreva a função `contar_palavras(texto)`, que devolve um dicionário com quantas vezes aparece cada palavra, sem distinguir maiúsculas e ignorando os sinais `. , ! ? ; :`. Com `\"O gato e o cão. O gato!\"` deve dar `{'o': 3, 'gato': 2, 'e': 1, 'cão': 1}`.",
        },
      ],
      fields: [{ id: "codigo", label: "Código e resultado", rows: 12, mono: true, placeholder: "def contar_palavras(texto):\n    …" }],
      criteria: [
        "Retira os sinais . , ! ? ; :",
        "Não distingue maiúsculas (por exemplo, com `lower()`)",
        "Conta com um dicionário (por exemplo, com `get(palavra, 0) + 1`)",
        "Com \"O gato e o cão. O gato!\" dá `{'o': 3, 'gato': 2, 'e': 1, 'cão': 1}`",
      ],
      solution: [
        { t: "code", code: G5, output: "{'o': 3, 'gato': 2, 'e': 1, 'cão': 1}" },
        { t: "p", text: "Contar palavras é o primeiro passo de muitos modelos de texto: é exatamente o que o `CountVectorizer` do M1 fazia." },
      ],
    },
    {
      id: "e6",
      num: 6,
      part: "B",
      session: "w1s2",
      kind: "text",
      title: "FizzBuzz",
      minutes: 10,
      sections: ["s4"],
      prompt: [
        {
          t: "p",
          text: "Imprima os números de 1 a 15, mas escreva `Fizz` nos múltiplos de 3, `Buzz` nos múltiplos de 5 e `FizzBuzz` nos múltiplos dos dois. É um exercício clássico de entrevistas; atenção à ordem das condições.",
        },
      ],
      fields: [{ id: "codigo", label: "Código e resultado", rows: 12, mono: true, placeholder: "for n in range(1, 16):\n    …" }],
      criteria: [
        "Percorre os números de 1 a 15 (`range(1, 16)`)",
        "Testa o caso \"múltiplo dos dois\" antes de Fizz e de Buzz",
        "Resultado: `1 2 Fizz 4 Buzz Fizz 7 8 Fizz Buzz 11 Fizz 13 14 FizzBuzz`",
      ],
      solution: [
        { t: "code", code: G6, output: "1 2 Fizz 4 Buzz Fizz 7 8 Fizz Buzz 11 Fizz 13 14 FizzBuzz" },
        { t: "p", text: "O caso \"múltiplo dos dois\" tem de vir primeiro; se viesse depois, o 15 cairia logo no `Fizz`." },
      ],
    },
    {
      id: "e7",
      num: 7,
      part: "B",
      session: "w2s1",
      kind: "text",
      title: "Juros compostos com while",
      minutes: 10,
      sections: ["s4"],
      prompt: [
        {
          t: "p",
          text: "Com um ciclo `while`, calcule quantos anos são precisos para 1000 € duplicarem a uma taxa de 4% ao ano, com juros compostos. Imprima os anos e o valor final.",
        },
      ],
      fields: [{ id: "codigo", label: "Código e resultado", rows: 8, mono: true, placeholder: "capital, anos = 1000, 0\nwhile …" }],
      criteria: [
        "Usa um ciclo `while` que para quando o capital chega a 2000",
        "Juros compostos: multiplica o capital por 1.04 em cada ano",
        "Resultado: 18 anos e 2025.82 €",
      ],
      solution: [
        { t: "code", code: G7, output: "18 2025.82" },
        { t: "p", text: "Confere com a \"regra do 72\" usada em finanças: 72 / 4 = 18 anos." },
      ],
    },
    {
      id: "e8",
      num: 8,
      part: "B",
      session: "w2s1",
      kind: "text",
      title: "Compreensões sobre produtos",
      minutes: 15,
      sections: ["s3", "s4"],
      prompt: [
        {
          t: "p",
          text: "Dada a lista abaixo, use compreensões para obter: (a) a lista dos nomes dos produtos esgotados; (b) um dicionário nome → preço com 10% de desconto, só para os produtos acima de 50 €.",
        },
        { t: "code", code: X8 },
      ],
      fields: [
        { id: "a", label: "(a) Produtos esgotados", rows: 3, mono: true, placeholder: "esgotados = [… for p in produtos if …]" },
        { id: "b", label: "(b) Preços com desconto acima de 50 €", rows: 3, mono: true, placeholder: "promo = {…: … for p in produtos if …}" },
      ],
      criteria: [
        "(a) Compreensão de lista com `if` sobre o stock: `['Luva', 'Saco']`",
        "(b) Compreensão de dicionário com `if` sobre o preço",
        "(b) Resultado: `{'Driver': 269.1, 'Saco': 162.0}`",
      ],
      solution: [{ t: "code", code: G8, output: "['Luva', 'Saco'] {'Driver': 269.1, 'Saco': 162.0}" }],
    },
    {
      id: "e9",
      num: 9,
      part: "B",
      session: "w2s1",
      kind: "text",
      title: "ler_notas com erros tratados",
      minutes: 20,
      sections: ["s6"],
      prompt: [
        {
          t: "p",
          text: "Crie um ficheiro `notas.csv` com o conteúdo abaixo. Escreva a função `ler_notas(caminho)`, que lê o ficheiro, mostra um aviso para cada nota inválida e devolve a média das notas válidas.",
        },
        { t: "code", title: "notas.csv", code: X9_CSV },
      ],
      fields: [{ id: "codigo", label: "Código e resultado", rows: 14, mono: true, placeholder: "import csv\n\ndef ler_notas(caminho):\n    …" }],
      criteria: [
        "Lê o CSV com `open(..., encoding=\"utf-8\")` e `csv.DictReader`",
        "Converte cada nota com `float()` dentro de `try`/`except ValueError`",
        "Mostra um aviso para a nota inválida da Carla (\"vinte\")",
        "Devolve a média das notas válidas: 15.5",
      ],
      solution: [{ t: "code", code: G9, output: "Aviso: nota inválida para Carla: vinte\n15.5" }],
    },
    {
      id: "e10",
      num: 10,
      part: "B",
      session: "w2s1",
      kind: "text",
      title: "Palavras suspeitas encontradas",
      minutes: 15,
      sections: ["s5"],
      prompt: [
        {
          t: "p",
          text: "Melhore o filtro de spam do M1: escreva `palavras_suspeitas_encontradas(mensagem, suspeitas=...)`, que recebe a lista de palavras suspeitas como parâmetro (com a lista do M1 como valor por omissão) e devolve a lista das que aparecem na mensagem, em vez de só `True` ou `False`.",
        },
      ],
      fields: [{ id: "codigo", label: "Código e testes", rows: 12, mono: true, placeholder: "def palavras_suspeitas_encontradas(mensagem, suspeitas=…):\n    …" }],
      criteria: [
        "O parâmetro `suspeitas` tem a lista do M1 como valor por omissão (\"grátis\", \"prémio\", \"clique aqui\", \"urgente\")",
        "Não distingue maiúsculas (passa a mensagem a minúsculas)",
        "Devolve a lista das palavras encontradas, por exemplo `['grátis', 'prémio', 'urgente']` para \"URGENTE: prémio grátis!\"",
        "Funciona com outra lista passada pelo nome: `suspeitas=[\"oferta\", \"exclusiva\"]`",
      ],
      solution: [
        { t: "code", code: G10, output: "['grátis', 'prémio', 'urgente']\n[]\n['oferta', 'exclusiva']" },
        {
          t: "p",
          text: "O valor por omissão é um tuplo e não uma lista de propósito: valores por omissão mutáveis são partilhados entre chamadas e causam erros difíceis de encontrar.",
        },
      ],
    },
    {
      id: "e11",
      num: 11,
      part: "C",
      session: "w2s2",
      kind: "text",
      title: "Mais resultados no relatório de vendas",
      minutes: 30,
      sections: ["s8", "s6"],
      prompt: [
        {
          t: "p",
          text: "Acrescente ao relatório de vendas da [secção 8](#s8) da aula: (a) a média mensal de cada loja; (b) o total da rede em cada mês e o mês com mais vendas; (c) a gravação destes resultados num ficheiro `resumo_t1.json`.",
        },
      ],
      fields: [
        { id: "codigo", label: "Código acrescentado", rows: 18, mono: true, placeholder: "import json\n\ndef media_mensal_por_loja(vendas):\n    …" },
        { id: "res", label: "Resultados obtidos", rows: 3, mono: true },
      ],
      criteria: [
        "(a) Média mensal de cada loja: `{'Lisboa': 1610.0, 'Porto': 1125.0, 'Faro': 583.33}`",
        "(b) Total da rede por mês: `{'jan': 2890.0, 'fev': 3465.0, 'mar': 3600.0}`; melhor mês: `mar`",
        "(c) Grava o resumo em `resumo_t1.json` com `json.dump` e `encoding=\"utf-8\"`",
        "Cada cálculo numa função com docstring, como no resto do programa",
      ],
      solution: [
        { t: "p", text: "Acrescentar ao programa da secção 8:" },
        {
          t: "code",
          code: G11,
          output: "{'Lisboa': 1610.0, 'Porto': 1125.0, 'Faro': 583.33}\n{'jan': 2890.0, 'fev': 3465.0, 'mar': 3600.0} mar",
        },
      ],
    },
    {
      id: "e12",
      num: 12,
      part: "C",
      session: "w2s2",
      kind: "text",
      title: "Validar um NIF",
      minutes: 25,
      sections: ["s5", "s2"],
      prompt: [
        {
          t: "p",
          text: "O NIF português tem 9 dígitos e o último é um dígito de controlo. Multiplicam-se os primeiros 8 dígitos pelos pesos 9, 8, 7, 6, 5, 4, 3, 2 e somam-se os resultados; calcula-se o resto da divisão dessa soma por 11. Se o resto for 0 ou 1, o dígito de controlo é 0; caso contrário, é 11 menos o resto. Escreva `nif_valido(nif)` e teste com `\"123456789\"` (válido), `\"123456780\"`, `\"12345678\"` e `\"12345678A\"` (inválidos). Este é um caso em que regras escritas à mão são a escolha certa, como se viu no M1: o problema é exato, estável e tem de ser auditável.",
        },
      ],
      fields: [{ id: "codigo", label: "Código e testes", rows: 14, mono: true, placeholder: "def nif_valido(nif):\n    …" }],
      criteria: [
        "Rejeita o que não tiver exatamente 9 dígitos (incluindo letras)",
        "Soma os 8 primeiros dígitos multiplicados pelos pesos 9 a 2",
        "Aplica a regra do resto: 0 ou 1 dá 0; senão, 11 menos o resto",
        "Testes: `123456789 True`, `123456780 False`, `12345678 False`, `12345678A False`",
      ],
      solution: [
        { t: "code", code: G12, output: "123456789 True\n123456780 False\n12345678 False\n12345678A False" },
        {
          t: "p",
          text: "Para `123456789`: 1×9 + 2×8 + 3×7 + 4×6 + 5×5 + 6×4 + 7×3 + 8×2 = 156; 156 a dividir por 11 dá resto 2; 11 − 2 = 9, que é o último dígito. A validação completa também confirma que o primeiro dígito corresponde a um tipo de contribuinte válido; aqui só se verifica o dígito de controlo.",
        },
      ],
    },
  ],

  // ---------------------------------------------------------------- PROVA (04-prova.md + 05-gabarito.md)
  exam: {
    minutes: 60,
    total: 20,
    pass: 14,
    groups: [
      {
        title: "Grupo I — Escolha múltipla (8 valores)",
        note: "Sem consulta e sem correr código. Uma só resposta certa por pergunta. 1 valor cada; respostas erradas não descontam.",
        questions: [
          {
            kind: "mcq", id: "p1", num: 1, section: "s2", points: 1,
            q: "O que imprime `print(type(3 / 1))`?",
            options: ["`<class 'int'>`", "`<class 'float'>`", "`<class 'str'>`", "Dá erro."],
            answer: 1,
            explain: "`/` dá sempre um `float`, mesmo quando a divisão é exata: `3 / 1` é `3.0`.",
          },
          {
            kind: "mcq", id: "p2", num: 2, section: "s3", points: 1,
            q: "Com `lista = [10, 20, 30, 40]`, o que imprime `print(lista[1:3])`?",
            options: ["`[10, 20, 30]`", "`[20, 30, 40]`", "`[20, 30]`", "`[10, 20]`"],
            answer: 2,
            explain: "O fatiamento inclui o índice 1 e exclui o 3.",
          },
          {
            kind: "mcq", id: "p3", num: 3, section: "s3", points: 1,
            q: "Que estrutura não guarda valores repetidos?",
            options: ["Lista", "Tuplo", "Dicionário, nos valores", "Conjunto"],
            answer: 3,
            explain: "Num conjunto, os duplicados desaparecem.",
          },
          {
            kind: "mcq", id: "p4", num: 4, section: "s3", points: 1,
            q: "Com `d = {\"x\": 1}`, o que imprime `print(d.get(\"y\", 0))`?",
            options: ["`0`", "`1`", "`None`", "Dá `KeyError`."],
            answer: 0,
            explain: "A chave \"y\" não existe e `get` devolve o valor por omissão, 0, sem `KeyError`.",
          },
          {
            kind: "mcq", id: "p5", num: 5, section: "s6", points: 1,
            q: "O que garante `with open(\"f.csv\") as f:`?",
            options: [
              "Que o ficheiro existe.",
              "Que o ficheiro é fechado no fim do bloco, mesmo se houver um erro.",
              "Que o ficheiro é lido em UTF-8.",
              "Que o conteúdo é convertido em números.",
            ],
            answer: 1,
            explain: "O UTF-8 tem de ser pedido com `encoding=\"utf-8\"`, e o conteúdo chega sempre como texto.",
          },
          {
            kind: "mcq", id: "p6", num: 6, section: "s4", points: 1,
            q: "O que imprime `print([x * x for x in range(4)])`?",
            options: ["`[1, 4, 9, 16]`", "`[0, 1, 4, 9, 16]`", "`[0, 2, 4, 6]`", "`[0, 1, 4, 9]`"],
            answer: 3,
            explain: "`range(4)` dá 0, 1, 2 e 3; os quadrados são 0, 1, 4 e 9.",
          },
          {
            kind: "mcq", id: "p7", num: 7, section: "s2", points: 1,
            q: "O que acontece com `int(\"3.5\")`?",
            options: ["Devolve `3`.", "Devolve `4`.", "Dá `ValueError`.", "Devolve `3.5`."],
            answer: 2,
            explain: "O texto \"3.5\" não é um inteiro válido: dá `ValueError`. `int(float(\"3.5\"))` daria 3.",
          },
          {
            kind: "mcq", id: "p8", num: 8, section: "s3", points: 1,
            q: "O que imprime este código?",
            context: [{ t: "code", code: "a = [1]\nb = a\nb.append(2)\nprint(a)" }],
            options: ["`[1]`", "`[1, 2]`", "`[2]`", "Dá erro."],
            answer: 1,
            explain: "`b = a` não copia: os dois nomes apontam para a mesma lista.",
          },
        ],
      },
      {
        title: "Grupo II — Resposta curta (8 valores)",
        note: "Sem consulta e sem correr código. 2 valores cada, 3 a 5 linhas por resposta.",
        questions: [
          {
            kind: "open", id: "p9", num: 9, section: "s3", points: 2, rows: 5,
            q: "Qual é a diferença entre uma lista e um tuplo? Dê um exemplo de quando usar cada um.",
            criteria: [
              { id: "c1", text: "Diferença: a lista pode mudar, o tuplo não", points: 1 },
              { id: "c2", text: "Exemplo adequado de lista", points: 0.5 },
              { id: "c3", text: "Exemplo adequado de tuplo", points: 0.5 },
            ],
            model:
              "A lista pode mudar (acrescentar, remover, ordenar); o tuplo não. Lista para uma sequência que cresce, como as vendas diárias; tuplo para um grupo fixo, como coordenadas (lat, lon).",
          },
          {
            kind: "open", id: "p10", num: 10, section: "s2", points: 2, rows: 5,
            q: "Porque é que `0.1 + 0.2 == 0.3` dá `False` em Python? Como se comparam decimais de forma segura?",
            criteria: [
              { id: "c1", text: "Causa: representação em binário, 0,1 não tem representação exata", points: 1 },
              { id: "c2", text: "Método seguro: `math.isclose(a, b)` ou arredondar os dois valores", points: 1 },
            ],
            model:
              "Os decimais são guardados em binário e 0,1 não tem representação exata, por isso a soma dá 0.30000000000000004. Compara-se com `math.isclose(a, b)` ou arredondando os dois valores.",
          },
          {
            kind: "open", id: "p11", num: 11, section: "s7", points: 2, rows: 5,
            q: "O que é um ambiente virtual e porque se deve criar um por projeto?",
            criteria: [
              { id: "c1", text: "Definição: instalação isolada do Python com as suas próprias bibliotecas", points: 1 },
              { id: "c2", text: "Vantagem: evita conflitos de versões entre projetos e permite recriar o ambiente com `requirements.txt`", points: 1 },
            ],
            model:
              "Uma instalação isolada do Python com as suas próprias bibliotecas. Um por projeto evita conflitos de versões entre projetos e permite recriar o ambiente com `requirements.txt`.",
          },
          {
            kind: "open", id: "p12", num: 12, section: "s6", points: 2, rows: 5,
            q: "Para que serve `try`/`except`? Porque é má prática usar um `except:` sem indicar o tipo de erro?",
            criteria: [
              { id: "c1", text: "Para que serve: tratar um erro esperado sem parar o programa", points: 1 },
              { id: "c2", text: "Problema do `except:` vazio: apanha todos os erros, incluindo os inesperados, e esconde falhas verdadeiras", points: 1 },
            ],
            model:
              "Permite tratar um erro esperado sem parar o programa, por exemplo uma linha com um valor inválido. Um `except:` vazio apanha todos os erros, incluindo os inesperados, e esconde falhas verdadeiras.",
          },
        ],
      },
      {
        title: "Grupo III — Programação (4 valores)",
        note: "Pode usar o Colab, mas não a internet nem assistentes de IA.",
        questions: [
          {
            kind: "open", id: "p13", num: 13, section: "s5", points: 4, rows: 18,
            q: "Escreva a função `resumo_precos(precos)`. Recebe uma lista de preços em texto, alguns inválidos, e devolve um dicionário com o número de preços válidos, o mínimo, o máximo e a média arredondada a 2 casas, ignorando os inválidos. Se não houver nenhum válido, os três últimos valores devem ser `None`. A função deve ter docstring.",
            context: [{ t: "code", code: P13_EXEMPLO }],
            criteria: [
              { id: "c1", text: "Converte com `float` e ignora os inválidos com `try`/`except ValueError`", points: 1 },
              { id: "c2", text: "Mínimo, máximo e média certos, com arredondamento", points: 1 },
              { id: "c3", text: "Trata o caso sem nenhum preço válido (sem dividir por zero)", points: 1 },
              { id: "c4", text: "Docstring, nomes claros e código legível", points: 1 },
            ],
            model:
              "Converte cada preço com `float` dentro de `try`/`except ValueError`, ignorando os inválidos; se não sobrar nenhum, devolve `validos` 0 e `None` nos outros três; senão, devolve o número de válidos, o mínimo, o máximo e a média arredondada a 2 casas.",
            modelBlocks: [{ t: "code", code: G13 }],
          },
        ],
      },
    ],
  },
  examReviewNote:
    "Se a nota ficar abaixo de 14, rever a secção da aula de cada pergunta falhada: 1, 7 e 10 — secção 2 (Variáveis e tipos); 2, 3, 4, 8 e 9 — secção 3 (Estruturas de dados); 6 — secção 4 (Controlo de fluxo); 13 — secções 5 (Funções) e 6 (Ficheiros, módulos e erros); 5 e 12 — secção 6 (Ficheiros, módulos e erros); 11 — secção 7 (Ambientes). Na pergunta 13 há muitas soluções certas: o que conta é o resultado estar certo e o código ser legível.",

  // ---------------------------------------------------------------- SIMULADO DE TREINO (banco extra da plataforma)
  practice: {
    mcq: [
      { id: "q1", section: "s1", q: "Segundo o relatório Octoverse de 2024 do GitHub…", options: ["o Python perdeu utilizadores para linguagens mais rápidas", "o Python passou a ser a linguagem mais usada na plataforma, puxado pelos projetos de IA", "o Python só é usado em investigação", "o C++ continua a ser a linguagem mais usada em IA"], answer: 1, explain: "Os projetos de IA levaram o Python ao primeiro lugar no GitHub." },
      { id: "q2", section: "s1", q: "Que nome de variável segue o PEP 8?", options: ["`PrecoTotal`", "`precoTotal`", "`preco_total`", "`PRECO-TOTAL`"], answer: 2, explain: "Variáveis e funções em minúsculas, com `_` a separar as palavras." },
      { id: "q3", section: "s1", q: "Como se vê o \"Zen of Python\"?", options: ["`help(zen)`", "`import this`", "`print(zen)`", "`pip install zen`"], answer: 1, explain: "Basta correr `import this`." },
      { id: "q4", section: "s2", q: "Com `nada = None`, o que imprime `print(type(nada))`?", options: ["`None`", "`<class 'NoneType'>`", "`<class 'null'>`", "Dá erro."], answer: 1, explain: "`None` é o único valor do tipo `NoneType`." },
      { id: "q5", section: "s2", q: "O que imprime `print(2 ** 10)`?", options: ["`20`", "`12`", "`1024`", "`100`"], answer: 2, explain: "`**` é a potência: 2 elevado a 10." },
      { id: "q6", section: "s2", q: "Segundo a aula, o que se usa para dinheiro em sistemas reais?", options: ["`float` com `==`", "O módulo `decimal`", "`int` com vírgula", "Texto (`str`)"], answer: 1, explain: "Os `float` guardam decimais em binário, com precisão limitada." },
      { id: "q7", section: "s2", q: "O que imprime `print(\"Python\"[0:3])`?", options: ["`Pyt`", "`Pyth`", "`yth`", "`Py`"], answer: 0, explain: "Os índices começam em 0 e a fatia exclui o índice 3." },
      { id: "q8", section: "s2", q: "O que imprime `print(int(\"42\") + 1, str(10) + \"0\")`?", options: ["`43 10`", "`421 100`", "`43 100`", "Dá `TypeError`."], answer: 2, explain: "`int(\"42\") + 1` soma números (43); `str(10) + \"0\"` junta texto (\"100\")." },
      { id: "q9", section: "s3", q: "Qual destas estruturas não pode mudar depois de criada?", options: ["Lista", "Tuplo", "Dicionário", "Conjunto"], answer: 1, explain: "O tuplo serve para grupos fixos, como coordenadas." },
      { id: "q10", section: "s3", q: "Com `produto = {\"nome\": \"Bola\", \"preco\": 12.5}`, o que acontece com `produto[\"cor\"]`?", options: ["Devolve `None`", "Devolve `\"\"`", "Dá `KeyError`", "Cria a chave \"cor\""], answer: 2, explain: "Com `[]`, uma chave que não existe dá `KeyError`; `get(\"cor\", \"sem cor\")` evitaria o erro." },
      { id: "q11", section: "s3", q: "O que imprime `print(len({\"spam\", \"promo\", \"spam\"}))`?", options: ["`3`", "`2`", "`1`", "Dá erro."], answer: 1, explain: "O conjunto elimina o \"spam\" repetido." },
      { id: "q12", section: "s3", q: "Como se chama `lat, lon = (38.72, -9.14)`?", options: ["Fatiar", "Desempacotar", "Concatenar", "Indexar"], answer: 1, explain: "Cada valor do tuplo vai para a sua variável." },
      { id: "q13", section: "s4", q: "O que imprime `for i, v in enumerate([\"a\", \"b\"]): print(i, v)`?", options: ["`a 0` e `b 1`", "`0 a` e `1 b`", "`1 a` e `2 b`", "`0` e `1`"], answer: 1, explain: "`enumerate` dá o índice (a começar em 0) e o valor ao mesmo tempo." },
      { id: "q14", section: "s4", q: "O que faz `continue` dentro de um ciclo?", options: ["Termina o ciclo", "Passa à iteração seguinte, saltando o resto do bloco", "Repete a iteração atual", "Sai da função"], answer: 1, explain: "`break` termina o ciclo; `continue` passa à iteração seguinte." },
      { id: "q15", section: "s4", q: "Em Python, o que define os blocos de código?", options: ["Chavetas `{ }`", "A indentação (4 espaços)", "As palavras `begin` e `end`", "O ponto e vírgula"], answer: 1, explain: "Uma indentação errada muda o significado ou dá `IndentationError`." },
      { id: "q16", section: "s4", q: "Depois de `n = 1` e `while n < 20: n *= 3` (um ciclo numa só linha), o que imprime `print(n)`?", options: ["`9`", "`18`", "`20`", "`27`"], answer: 3, explain: "n passa por 3, 9 e 27; com 27, a condição `n < 20` fica falsa e o ciclo termina." },
      { id: "q17", section: "s5", q: "Com a função `preco_com_iva` da aula, o que imprime `print(preco_com_iva(50, taxa=0.06))`?", options: ["`61.5`", "`53.0`", "`50.06`", "`56.0`"], answer: 1, explain: "50 × 1,06 = 53, arredondado a 2 casas: `53.0`. O valor por omissão (0.23) só se usa quando não se passa outro." },
      { id: "q18", section: "s5", q: "O que fazem os type hints como `list[float]` quando o programa corre?", options: ["O Python recusa valores de outro tipo", "Nada: o Python não os verifica ao correr, mas documentam o código e ferramentas como o `mypy` usam-nas", "Convertem os valores automaticamente", "Tornam o código mais rápido"], answer: 1, explain: "São documentação que as ferramentas conseguem ler." },
      { id: "q19", section: "s5", q: "Com `itens = [(\"luva\", 25.0), (\"bola\", 12.5), (\"boné\", 15.0)]`, o que devolve `max(itens, key=lambda item: item[1])`?", options: ["`('bola', 12.5)`", "`('luva', 25.0)`", "`('boné', 15.0)`", "`25.0`"], answer: 1, explain: "A `lambda` diz para comparar pelo preço; `max` devolve o par inteiro com o preço maior." },
      { id: "q20", section: "s6", q: "Que erro dá `\"10\" + 5`?", options: ["`ValueError`", "`TypeError`", "`SyntaxError`", "`NameError`"], answer: 1, explain: "Operação entre tipos incompatíveis: texto mais número." },
      { id: "q21", section: "s6", q: "O que imprime `from statistics import mean` seguido de `print(mean([1, 2, 3, 4]))`?", options: ["`2`", "`2.5`", "`10`", "`3`"], answer: 1, explain: "A média de 1, 2, 3 e 4 é 2.5. O `statistics` vem na biblioteca padrão." },
      { id: "q22", section: "s6", q: "Porque é má prática um `except:` vazio?", options: ["Porque é mais lento", "Porque apanha todos os erros e esconde falhas verdadeiras", "Porque não funciona com ficheiros", "Porque obriga a usar `finally`"], answer: 1, explain: "Vai contra a regra *errors should never pass silently*." },
      { id: "q23", section: "s7", q: "O que acontece aos ficheiros criados no Colab quando a sessão fecha?", options: ["Ficam no disco do computador", "Apagam-se, exceto os guardados no Drive", "Vão para o GitHub", "Ficam guardados para sempre na sessão"], answer: 1, explain: "Para os guardar, usar o Drive." },
      { id: "q24", section: "s7", q: "Como se recria noutro computador o ambiente registado em `requirements.txt`?", options: ["`pip freeze`", "`pip install -r requirements.txt`", "`python3 requirements.txt`", "`source requirements.txt`"], answer: 1, explain: "`pip freeze > requirements.txt` regista; `pip install -r` recria." },
      { id: "q25", section: "s8", q: "No relatório, o que devolve `max(totais, key=totais.get)`?", options: ["O maior total", "A loja (chave) com o maior total", "A lista ordenada", "O primeiro total"], answer: 1, explain: "Percorre as chaves e compara-as pelo valor: devolve 'Lisboa'." },
      { id: "q26", section: "s8", q: "Porque é que `ler_vendas` faz `linha[\"valor\"] = float(linha[\"valor\"])`?", options: ["Para arredondar os valores", "Porque o CSV devolve sempre texto e as contas precisam de números", "Para ordenar as lojas", "Porque `csv` não aceita inteiros"], answer: 1, explain: "Sem a conversão, `totais.get(v[\"loja\"], 0) + v[\"valor\"]` somaria o número 0 com o texto `'1500'`, e isso dá `TypeError`." },
    ],
    tf: [
      { id: "v1", section: "s2", q: "Em Python, `0.1 + 0.2 == 0.3` dá `True`.", answer: false, explain: "A soma dá `0.30000000000000004`: decimais não se comparam com `==`." },
      { id: "v2", section: "s2", q: "Em Python é preciso declarar o tipo de cada variável.", answer: false, explain: "O tipo é deduzido do valor." },
      { id: "v3", section: "s2", q: "Os índices negativos contam a partir do fim: `\"Python\"[-1]` é `\"n\"`.", answer: true, explain: "-1 é o último elemento." },
      { id: "v4", section: "s3", q: "O fatiamento `lista[1:3]` inclui o elemento de índice 3.", answer: false, explain: "Inclui o primeiro índice e exclui o último." },
      { id: "v5", section: "s3", q: "Os dicionários mantêm a ordem de inserção das chaves.", answer: true, explain: "É o que mostra o exemplo do produto: as chaves saem pela ordem em que foram criadas." },
      { id: "v6", section: "s3", q: "`b = a` cria uma cópia da lista `a`.", answer: false, explain: "Atribuir nunca copia: `b` passa a ser outro nome para a mesma lista. Para copiar, `a.copy()`." },
      { id: "v7", section: "s4", q: "Uma compreensão de lista pode ter um `if` para filtrar elementos.", answer: true, explain: "Por exemplo, `[x for x in range(10) if x % 2 == 0]`." },
      { id: "v8", section: "s5", q: "Uma função sem `return` devolve `None`.", answer: true, explain: "É o valor por omissão de qualquer função." },
      { id: "v9", section: "s5", q: "Uma variável criada dentro de uma função continua a existir depois de a função terminar.", answer: false, explain: "Só existe lá dentro; usá-la fora (sem outra variável com o mesmo nome) dá `NameError`." },
      { id: "v10", section: "s6", q: "O `csv.DictReader` devolve os números já convertidos em `int` ou `float`.", answer: false, explain: "O CSV devolve sempre texto; converte-se com `float()`." },
      { id: "v11", section: "s7", q: "O Python que vem com o macOS é o indicado para os projetos do curso.", answer: false, explain: "Instala-se uma versão recente e cria-se um ambiente virtual por projeto." },
      { id: "v12", section: "s7", q: "Células de um notebook corridas fora de ordem são a causa mais comum de resultados que ninguém consegue repetir.", answer: true, explain: "Antes de dar o trabalho por terminado, correr tudo de cima a baixo." },
    ],
  },

  // ---------------------------------------------------------------- CARTÕES
  flashcards: [
    { id: "f1", section: "s1", tag: "Conceitos", front: "Três razões para o Python ser a linguagem da IA", back: "Lê-se quase como pseudocódigo, tem as bibliotecas de referência da área e funciona como \"cola\" sobre código compilado muito rápido." },
    { id: "f2", section: "s1", tag: "Conceitos", front: "Como é que um programa de IA em Python pode ser tão rápido como um escrito em C?", back: "O Python só dá a ordem; as contas do NumPy ou do PyTorch correm em código C, C++ ou CUDA já compilado (Harris et al., 2020). Basta entregar o trabalho pesado às bibliotecas." },
    { id: "f3", section: "s1", tag: "Conceitos", front: "PEP 8", back: "O estilo oficial: nomes de variáveis e funções em minúsculas com `_` (`preco_total`), indentação de 4 espaços, linhas curtas." },
    { id: "f4", section: "s1", tag: "Conceitos", front: "As três regras do Zen of Python que guiam o curso", back: "*Beautiful is better than ugly*, *Readability counts*, *Errors should never pass silently*. Vê-se com `import this`." },
    { id: "f5", section: "s2", tag: "Tipos", front: "Os cinco tipos básicos", back: "`int` (inteiros), `float` (decimais), `str` (texto), `bool` (`True`/`False`), `None` (ausência de valor)." },
    { id: "f6", section: "s2", tag: "Tipos", front: "`/`, `//`, `%` e `**`", back: "Divisão normal, divisão inteira, resto e potência: `7 / 2, 7 // 2, 7 % 2, 2 ** 10` dá `3.5 3 1 1024`." },
    { id: "f7", section: "s2", tag: "Tipos", front: "Porque é que `0.1 + 0.2` dá `0.30000000000000004`?", back: "Os decimais são guardados em binário e 0,1 não tem representação exata. Nunca comparar decimais com `==`: usar `math.isclose(a, b)` ou arredondar os dois valores. E arredondar só no fim das contas." },
    { id: "f8", section: "s2", tag: "Tipos", front: "f-string com duas casas decimais", back: "`f\"{nome} pagou {preco:.2f} €\"` dá `Ana pagou 49.90 €`." },
    { id: "f9", section: "s2", tag: "Tipos", front: "Porque são essenciais `int()`, `float()` e `str()`?", back: "Tudo o que vem de um ficheiro ou de um formulário chega como texto." },
    { id: "f10", section: "s2", tag: "Tipos", front: "Índices em Python", back: "Começam em 0; os negativos contam a partir do fim: `\"Python\"[0]` é `P`, `\"Python\"[-1]` é `n`." },
    { id: "f11", section: "s3", tag: "Estruturas", front: "Lista vs. tuplo", back: "Os dois são ordenados. A lista pode mudar (sequências: preços, mensagens); o tuplo não (grupos fixos: coordenadas)." },
    { id: "f12", section: "s3", tag: "Estruturas", front: "Dicionário", back: "Registos com campos e pesquisa rápida por chave. `d.get(chave, omissão)` evita o `KeyError` quando a chave não existe." },
    { id: "f13", section: "s3", tag: "Estruturas", front: "Conjunto", back: "Valores únicos e testes \"está lá?\" rápidos (`x in s`). Os duplicados desaparecem; a ordem pode variar." },
    { id: "f14", section: "s3", tag: "Estruturas", front: "A regra do fatiamento", back: "`precos[1:3]` inclui o primeiro índice e exclui o último. Repete-se no NumPy e no pandas." },
    { id: "f15", section: "s3", tag: "Estruturas", front: "`b = a` com listas", back: "Não copia: `b` é outro nome para a mesma lista. Para copiar: `b = a.copy()`. Atribuir nunca copia." },
    { id: "f16", section: "s4", tag: "Fluxo", front: "O que define um bloco de código em Python?", back: "A indentação (4 espaços), não chavetas. Errada, muda o significado ou dá `IndentationError`." },
    { id: "f17", section: "s4", tag: "Fluxo", front: "`break` vs. `continue`", back: "`break` termina o ciclo; `continue` passa à iteração seguinte." },
    { id: "f18", section: "s4", tag: "Fluxo", front: "`enumerate` e `zip`", back: "`enumerate` dá índice e valor ao mesmo tempo; `zip` percorre duas listas em paralelo. Evitam `for i in range(len(lista))`." },
    { id: "f19", section: "s4", tag: "Fluxo", front: "O risco de um `while`", back: "Repete enquanto a condição for verdadeira; se nunca ficar falsa, o ciclo nunca acaba. No Colab, para-se com o botão de parar a célula." },
    { id: "f20", section: "s4", tag: "Fluxo", front: "Compreensão de lista e de dicionário", back: "`[f(x) for x in lista if cond]` e `{k: f(v) for k, v in d.items()}`: \"para cada x em…, se…, guarda…\"." },
    { id: "f21", section: "s5", tag: "Funções", front: "Valor por omissão de um parâmetro", back: "Em `def preco_com_iva(preco, taxa=0.23)`, `taxa` vale 0.23 se não se passar outro. Passá-lo pelo nome (`taxa=0.06`) torna a chamada mais clara." },
    { id: "f22", section: "s5", tag: "Funções", front: "`return` e `None`", back: "`return` devolve o resultado. Uma função sem `return` devolve `None`." },
    { id: "f23", section: "s5", tag: "Funções", front: "Docstring", back: "O texto entre aspas triplas que explica o que a função faz. Os editores e os assistentes de IA usam-na para perceber o código." },
    { id: "f24", section: "s5", tag: "Funções", front: "Type hints", back: "Anotações como `list[float]` e `-> tuple[...]`. O Python não as verifica ao correr; documentam o código e o `mypy` usa-as para encontrar erros." },
    { id: "f25", section: "s5", tag: "Funções", front: "Âmbito de uma variável criada numa função", back: "Só existe lá dentro. Boa prática: receber tudo por parâmetros e devolver com `return`, sem mexer em variáveis de fora." },
    { id: "f26", section: "s5", tag: "Funções", front: "`lambda`", back: "Uma função curta sem nome, sobretudo para dizer a `sorted`, `max` ou `min` por que critério comparar: `sorted(itens, key=lambda item: item[1])`." },
    { id: "f27", section: "s6", tag: "Ficheiros e erros", front: "Três pormenores ao ler ficheiros", back: "`with open(...)` fecha sozinho, mesmo com erro; `encoding=\"utf-8\"` trata bem os acentos; o CSV devolve sempre texto, que se converte com `float()`." },
    { id: "f28", section: "s6", tag: "Ficheiros e erros", front: "`try`/`except` bem usado", back: "Apanhar só o erro esperado (`ValueError`, `FileNotFoundError`), nunca todos com `except:` vazio, que esconde falhas verdadeiras." },
    { id: "f29", section: "s6", tag: "Ficheiros e erros", front: "`TypeError` vs. `ValueError`", back: "`TypeError`: tipos incompatíveis, como `\"10\" + 5`. `ValueError`: tipo certo, valor errado, como `float(\"doze\")`." },
    { id: "f30", section: "s6", tag: "Ficheiros e erros", front: "`NameError`, `KeyError`, `IndexError`", back: "Variável que não existe (muitas vezes um erro de escrita); chave que não existe no dicionário; índice fora da lista." },
    { id: "f31", section: "s6", tag: "Ficheiros e erros", front: "Módulo vs. pacote externo", back: "Um módulo é um ficheiro `.py` com funções (`csv`, `json`, `math` vêm na biblioteca padrão). Pacotes externos instalam-se com `pip install nome`; no Colab, `!pip install nome`." },
    { id: "f32", section: "s7", tag: "Ambiente", front: "Criar e ativar um ambiente virtual", back: "`python3 -m venv .venv` e depois `source .venv/bin/activate` (o terminal mostra `(.venv)`)." },
    { id: "f33", section: "s7", tag: "Ambiente", front: "`requirements.txt`", back: "`pip freeze > requirements.txt` regista as versões; `pip install -r requirements.txt` recria o mesmo ambiente noutro computador." },
    { id: "f34", section: "s7", tag: "Ambiente", front: "Colab vs. Python no computador", back: "Colab: sem instalação, GPU gratuita com limites, ficheiros apagam-se (exceto no Drive), Fases 0 a 3. Local: ficheiros no disco, Fases 4 e 5." },
    { id: "f35", section: "s8", tag: "Formatação", front: "`:<8`, `:>8.2f` e `:+.1f`", back: "Alinha à esquerda em 8 caracteres; alinha à direita com 2 casas; mostra sempre o sinal, com 1 casa." },
  ],

  // ---------------------------------------------------------------- NOTEBOOK
  notebook: {
    filename: "M2 — exercícios",
    cells: [
      {
        type: "md",
        source:
          "# M2 — Python para IA I: a linguagem\n\nOs exemplos da aula, pela ordem, e os exercícios de programação. Correr cada célula e alterá-la até perceber o que cada linha faz. Guardar no Drive, na pasta da Fase 0.",
      },
      { type: "md", source: "## 2. Variáveis e tipos de dados" },
      { type: "code", source: C_TIPOS },
      { type: "code", source: C_NUMEROS },
      { type: "code", source: C_TEXTO },
      { type: "md", source: "## 3. Estruturas de dados" },
      { type: "code", source: C_LISTAS },
      { type: "code", source: C_TUPLOS },
      { type: "code", source: C_DICIONARIOS },
      { type: "code", source: C_CONJUNTOS },
      { type: "code", source: C_ALIAS },
      { type: "md", source: "## 4. Controlo de fluxo" },
      { type: "code", source: C_IF },
      { type: "code", source: C_FOR },
      { type: "code", source: C_WHILE },
      { type: "code", source: C_COMPREENSOES },
      { type: "md", source: "## 5. Funções" },
      { type: "code", source: C_FUNCAO },
      { type: "code", source: C_ESTATISTICAS },
      { type: "code", source: C_AMBITO },
      { type: "code", source: C_LAMBDA },
      { type: "md", source: "## 6. Ficheiros, módulos e erros" },
      { type: "code", source: C_FICHEIROS },
      { type: "code", source: C_MODULOS },
      { type: "code", source: C_ERROS },
      { type: "md", source: "## 8. Exemplo completo: relatório de vendas\n\nO mesmo programa está em `codigo/relatorio_vendas.py`." },
      { type: "code", source: C_RELATORIO },
      { type: "md", source: "## Exercício 1\n\nSem correr: escrever o que cada linha imprime. Depois correr e explicar as que errou." },
      { type: "code", source: X1 },
      { type: "md", source: "## Exercício 3\n\nTrês erros: encontrar, dizer o tipo de cada um e corrigir para imprimir `20.0`." },
      { type: "code", source: X3 },
      { type: "md", source: "## Exercício 4\n\n`classificar_temperatura(t)`: frio abaixo de 15 °C, ameno de 15 a 25 °C (inclusive), quente acima de 25 °C." },
      { type: "code", source: "def classificar_temperatura(t):\n    ...\n\nprint([classificar_temperatura(t) for t in [10, 15, 25, 30]])\n" },
      { type: "md", source: "## Exercício 5\n\n`contar_palavras(texto)`, sem distinguir maiúsculas e ignorando `. , ! ? ; :`." },
      { type: "code", source: "def contar_palavras(texto):\n    ...\n\nprint(contar_palavras(\"O gato e o cão. O gato!\"))\n" },
      { type: "md", source: "## Exercício 6\n\nFizzBuzz de 1 a 15." },
      { type: "code", source: "for n in range(1, 16):\n    ...\n" },
      { type: "md", source: "## Exercício 7\n\nAnos para 1000 € duplicarem a 4% ao ano, com juros compostos." },
      { type: "code", source: "capital, anos = 1000, 0\n# while ...\n" },
      { type: "md", source: "## Exercício 8\n\n(a) Nomes dos produtos esgotados; (b) nome → preço com 10% de desconto, só acima de 50 €." },
      { type: "code", source: X8 + "\n\nesgotados = ...\npromo = ...\nprint(esgotados, promo)\n" },
      { type: "md", source: "## Exercício 9\n\nCriar `notas.csv` e escrever `ler_notas(caminho)`." },
      { type: "code", source: `with open("notas.csv", "w", encoding="utf-8") as f:\n    f.write("""${X9_CSV}\n""")\n\ndef ler_notas(caminho):\n    ...\n` },
      { type: "md", source: "## Exercício 10\n\n`palavras_suspeitas_encontradas(mensagem, suspeitas=...)`, com a lista do M1 como valor por omissão." },
      { type: "code", source: "def palavras_suspeitas_encontradas(mensagem, suspeitas=...):\n    ...\n\nprint(palavras_suspeitas_encontradas(\"URGENTE: prémio grátis!\"))\nprint(palavras_suspeitas_encontradas(\"Reunião às 10h\"))\n" },
      { type: "md", source: "## Exercício 11\n\nAcrescentar ao relatório (correr primeiro a célula da secção 8): média mensal de cada loja, total da rede por mês e melhor mês, gravação em `resumo_t1.json`." },
      { type: "code", source: "import json\n\ndef media_mensal_por_loja(vendas):\n    ...\n\ndef total_por_mes(vendas):\n    ...\n" },
      { type: "md", source: "## Exercício 12\n\n`nif_valido(nif)`: 9 dígitos, pesos 9 a 2, resto da divisão por 11." },
      { type: "code", source: "def nif_valido(nif):\n    ...\n\nfor n in [\"123456789\", \"123456780\", \"12345678\", \"12345678A\"]:\n    print(n, nif_valido(n))\n" },
      { type: "md", source: "## Notas\n\nO que aprendi neste módulo, em três frases:" },
    ],
  },
  source: "curso-engenharia-ia 2/modulo-02-python-i",
};
