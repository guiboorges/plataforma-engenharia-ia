import type { Block, Exercise, ExamSpec, ModuleContent } from "../content/types";
import { MODULES, moduleMeta } from "../content/course";
import { plain } from "./md";
import type { Attempt } from "./store";
import { allQuestions } from "./exam";

// Instruções do tutor. A regra de ouro vem do plano: explicar um erro é válido; dar a resposta não é.

const COURSE_MAP = MODULES.map((m) => `${m.id} — ${m.title}`).join("; ");

export const TUTOR_RULES = `És o tutor do curso pessoal "Engenharia de IA" (30 módulos em 7 fases, até 3 horas por semana).
Regras:
- Escreve sempre em português europeu, de forma clara e direta, com frases curtas.
- Baseia-te no material do módulo que vem a seguir. Quando usares algo dele, diz a secção (por exemplo, "secção 4").
- Regra de ouro do curso: podes explicar conceitos, explicar erros e dar pistas, mas não dás a resposta de exercícios ou de perguntas de prova que o aluno ainda não tentou. Se ele a pedir, recusa com simpatia e dá uma pista ou uma pergunta que o ajude a pensar.
- Se a pergunta for sobre um tema de um módulo futuro, responde em poucas linhas e diz em que módulo é tratado. Mapa do curso: ${COURSE_MAP}.
- Usa Markdown simples: negrito, listas curtas, \`código\`. No máximo 180 palavras, salvo se o aluno pedir mais.`;

export function blocksText(blocks: Block[]): string {
  const out: string[] = [];
  for (const b of blocks) {
    switch (b.t) {
      case "p":
        out.push(plain(b.text));
        break;
      case "h3":
        out.push(`### ${b.text}`);
        break;
      case "list":
        b.items.forEach((it, i) => out.push(`${b.ordered ? `${i + 1}.` : "-"} ${plain(it)}`));
        break;
      case "table":
        out.push(b.head.map(plain).join(" | "));
        b.rows.forEach((r) => out.push(r.map(plain).join(" | ")));
        break;
      case "code":
        out.push("```python\n" + b.code + "\n```" + (b.output ? `\nResultado:\n${b.output}` : ""));
        break;
      case "callout":
        out.push(`${b.title ? b.title + ": " : ""}${plain(b.text)}`);
        break;
      default:
        break;
    }
  }
  return out.join("\n");
}

export function lessonText(c: ModuleContent): string {
  return c.lesson.map((s) => `## ${s.num}. ${s.title}\n${blocksText(s.blocks)}`).join("\n\n");
}

export function moduleContext(c: ModuleContent): string {
  const meta = moduleMeta(c.id);
  return `MÓDULO ${meta.id} — ${meta.title}
Objetivos: ${c.outcomes.join("; ")}.

AULA
${lessonText(c)}`;
}

export function exerciseAnswerText(ex: Exercise, answers: Record<string, any>): string {
  if (ex.kind === "classify") {
    return ex.items
      .map((it, i) => {
        const a = answers[it.id];
        const cat = typeof a === "number" ? ex.categories[a] : "(sem resposta)";
        const j = ex.justify && answers[`${it.id}:j`] ? ` — ${ex.justify}: ${answers[`${it.id}:j`]}` : "";
        return `${i + 1}. ${plain(it.text)} → ${cat}${j}`;
      })
      .join("\n");
  }
  if (ex.kind === "order") {
    const order: string[] = answers.order ?? [];
    return order.map((id, i) => `${i + 1}. ${ex.items.find((x) => x.id === id)?.text ?? id}`).join("\n");
  }
  return ex.fields.map((f) => `${f.label}:\n${answers[f.id] ?? "(em branco)"}`).join("\n\n");
}

export function exerciseFeedbackPrompt(c: ModuleContent, ex: Exercise, answers: Record<string, any>): string {
  const criteria = ex.kind === "text" ? `\nCritérios:\n${ex.criteria.map((x) => `- ${x}`).join("\n")}` : "";
  return `${TUTOR_RULES}

${moduleContext(c)}

---
O aluno já tentou o exercício ${ex.num} ("${ex.title}") e pede-te que expliques o que está certo e o que não está. Ele já pode ver a solução no gabarito.

Enunciado:
${blocksText(ex.prompt)}

Resposta do aluno:
${exerciseAnswerText(ex, answers)}

Solução de referência (gabarito):
${blocksText(ex.solution)}${criteria}

Tarefa: em 3 a 6 frases, diz o que está certo, o que falta ou está errado e porquê, com a secção da aula a rever. Termina com uma sugestão concreta. Não reescrevas a resposta completa por ele.`;
}

export type OpenGrade = Record<string, { criterios: Record<string, number>; comentario: string }>;

export function examGradingPrompt(c: ModuleContent | null, title: string, spec: ExamSpec, a: Attempt): string {
  const opens = allQuestions(spec).filter((q) => q.kind === "open");
  const blocks = opens
    .map((q) => {
      if (q.kind !== "open") return "";
      const crit = q.criteria.map((x) => `  [${x.id}] ${x.text} (máx. ${String(x.points).replace(".", ",")})`).join("\n");
      return `### Pergunta ${q.num} (id ${q.id}, ${String(q.points).replace(".", ",")} valores)
${plain(q.q)}
Critérios:
${crit}
Resposta-modelo: ${plain(q.model)}
Resposta do aluno:
"""
${String(a.answers[q.id] ?? "").trim() || "(em branco)"}
"""`;
    })
    .join("\n\n");
  const ids = opens.map((q) => `"${q.id}": {"criterios": {"c1": 0.5, ...}, "comentario": "..."}`).join(", ");
  return `És o corretor da ${title} do curso "Engenharia de IA". Corriges as perguntas abertas com os critérios e as respostas-modelo do gabarito oficial, de forma justa e exigente, em português europeu. O que conta é o raciocínio: a resposta-modelo é uma das formas certas de responder.
${c ? `\nMaterial do módulo, para referência:\n${lessonText(c).slice(0, 30000)}\n` : ""}
${blocks}

Para cada pergunta, dá a cada critério uma pontuação entre 0 e o máximo, em múltiplos de 0,25, e um comentário de 2 a 3 frases (o que está certo, o que falta, que secção rever). Resposta em branco vale 0.
Responde só com um objeto JSON, sem mais texto, com esta forma: {${ids}}`;
}

export function docExamGradingPrompt(moduleTitle: string, prova: string, gabarito: string, answers: string): string {
  return `És o corretor da prova do módulo "${moduleTitle}" do curso "Engenharia de IA". Corriges com as respostas-modelo e os critérios do gabarito oficial, de forma justa e exigente, em português europeu. Nas perguntas abertas o que conta é o raciocínio.

PROVA
${prova}

GABARITO
${gabarito}

RESPOSTAS DO ALUNO
"""
${answers.trim() || "(em branco)"}
"""

Responde só com um objeto JSON, sem mais texto, com esta forma:
{"perguntas": [{"numero": "1", "valores": 1, "maximo": 1, "comentario": "uma frase"}], "total": 15.5, "rever": ["secções da aula a rever"], "resumo": "2 a 3 frases"}`;
}
