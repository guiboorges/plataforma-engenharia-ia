# Engenharia de IA — plataforma de estudo

**Uma plataforma que construí para estudar Engenharia de IA por conta própria, com a disciplina de um curso a sério.**

30 módulos em 7 fases, de outubro de 2026 a maio de 2028: da introdução à IA e Python até deep learning, LLMs e sistemas em produção.

**[▶ Experimentar a demo](https://guiboorges.github.io/plataforma-engenharia-ia/)** · o progresso fica guardado no seu browser

![Ecrã "Hoje": progresso, horas de estudo e próxima sessão](docs/screenshots/hoje.png)

## Porque existe

Aprender sozinho é fácil de começar e difícil de manter. Os cursos online dão vídeos e exercícios soltos, mas não dão um plano, prazos, provas a sério nem forma de saber se está mesmo a aprender.

Esta plataforma junta tudo isso num só lugar:

- **Um plano com datas.** Cada módulo tem semanas marcadas no calendário (com pausas de Natal e de verão) e uma meta de 3 horas por semana. O ecrã *Hoje* diz qual é a próxima sessão e se estou em dia.
- **Avaliação que não deixa fazer batota.** O gabarito de cada exercício só abre depois de entregar uma tentativa. A prova é cronometrada e sem consulta: durante a prova não se vê mais nada. Aprovação com 14 em 20; abaixo disso, só se repete uma semana depois.
- **Aprender fazendo.** Os diagramas das aulas viram widgets interativos: correr o k-means passo a passo, mexer no PCA, ver um gráfico SHAP a construir-se.
- **Não esquecer.** Cartões de revisão espaçada aparecem à medida que se lê a aula.

## O que tem

| Área | O que faz |
|---|---|
| **Hoje** | Próxima sessão de estudo, horas da semana, cartões para rever, estado face ao plano |
| **Módulos** | Plano, Aula, Apostila, Exercícios, Prova, Gabarito e Notas |
| **Widgets** | Grelha de Russell & Norvig, linha do tempo da IA, laboratório de spam (Naive Bayes igual ao scikit-learn), slicing e aliasing em Python, broadcasting e group-by, transformações lineares e SVD, k-means, DBSCAN, PCA, validação cruzada, limiares de decisão, SHAP |
| **Exercícios** | Corrigem-se sozinhos quando podem; os escritos corrigem-se com os critérios do gabarito |
| **Provas** | Cronómetro, sem consulta, escolha múltipla corrigida automaticamente |
| **Percurso e Calendário** | As 7 fases, os 30 módulos e o plano semana a semana |
| **Projetos e Certificações** | Grelhas dos mini-projetos, do projeto final e das certificações a fazer |
| **Tutor** | Explica a aula e os erros com o Claude, sem dar respostas a exercícios por fazer (só na versão Artifact do claude.ai) |

<table>
  <tr>
    <td width="60%"><img src="docs/screenshots/aula.png" alt="Aula do módulo 10, aprendizagem não supervisionada"></td>
    <td width="40%"><img src="docs/screenshots/widget-kmeans.png" alt="Widget interativo de k-means"></td>
  </tr>
  <tr>
    <td align="center"><sub>Aula com secções, código testado e fontes citadas</sub></td>
    <td align="center"><sub>Widget de k-means: escolher k, o início e avançar passo a passo</sub></td>
  </tr>
</table>

![Percurso: as 7 fases e os módulos de cada uma](docs/screenshots/percurso.png)

## Como foi feito

- **Código:** React 18 + TypeScript + Vite, sem bibliotecas de UI. O sistema visual está em [`design/DESIGN.md`](design/DESIGN.md).
- **Conteúdo:** o material do curso (aulas, apostilas, exercícios, provas e gabaritos) foi criado por mim com o Claude. Os resultados de código são verificados em Python com scikit-learn antes de entrarem nas aulas.
- **Onde corre:** como Artifact no claude.ai (com tutor e progresso na conta) ou como site estático (progresso no `localStorage`).

## Correr localmente

```bash
npm install
npm run dev          # http://localhost:5173
npm run build:pages  # site estático em dist/ (o mesmo da demo)
```

Nas Definições pode mudar a data de início e a meta semanal, e guardar ou importar uma cópia de segurança do progresso.

## Estrutura

```
src/
  content/      plano do curso, módulos interativos (m1.ts … m11.ts) e fechos de fase
  components/   ecrãs, exercícios, provas e os widgets de cada módulo
  lib/          progresso, calendário, provas, revisão espaçada, Naive Bayes, tutor
  styles/       tokens (tema escuro e claro) e estilos por área
scripts/        sincronização do material do curso e builds (Artifact e GitHub Pages)
```

---

### In English

A self-study platform I built to learn AI Engineering on my own: 30 modules across 7 phases (Oct 2026 – May 2028), with a dated study plan, interactive lesson widgets (k-means, PCA, SHAP, Naive Bayes…), auto-graded exercises, timed closed-book exams, spaced-repetition flashcards and a Claude-powered tutor. Built with React, TypeScript and Vite; course material written with Claude. **[Try the demo](https://guiboorges.github.io/plataforma-engenharia-ia/)** (Portuguese).
