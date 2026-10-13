// Esquema do conteúdo do curso. Cada módulo novo segue ModuleContent (ver CLAUDE.md).
//
// Texto "Inline" aceita uma marcação mínima:
//   **negrito**, *itálico*, `código`, [texto](https://url) e [texto](#s3) para ligar a uma secção da aula.

export type Inline = string;

/** Widgets do M1 (src/components/widgets/index.tsx) ou de outro módulo, registados em src/components/widgets/mN/index.tsx. */
export type WidgetName = string;

export type Block =
  | { t: "p"; text: Inline }
  | { t: "h3"; text: string }
  | { t: "list"; items: Inline[]; ordered?: boolean }
  | { t: "table"; head: Inline[]; rows: Inline[][]; caption?: string }
  | { t: "code"; code: string; title?: string; output?: string }
  | { t: "callout"; tone: "key" | "lesson" | "warn" | "info"; title?: string; text: Inline }
  | { t: "widget"; name: WidgetName; caption?: string }
  /** Imagem da pasta do módulo (por exemplo "img/01-ecossistema-python.png"), embutida pela sincronização. */
  | { t: "figure"; src: string; alt: string; caption?: string }
  | { t: "check"; id: string; q: Inline; options: Inline[]; answer: number; explain: Inline };

export type LessonSection = {
  id: string; // "s1"
  num: number;
  title: string;
  minutes: number;
  blocks: Block[];
};

export type TaskLink =
  | { kind: "section"; id: string }
  | { kind: "tab"; tab: ModuleTab }
  | { kind: "url"; href: string };

export type SessionPlan = {
  id: string; // "w1s1"
  label: string; // "Semana 1 · sessão 1"
  minutes: number;
  tasks: { id: string; text: Inline; link?: TaskLink }[];
};

export type Reference = { text: Inline; href?: string };

type ExerciseBase = {
  id: string; // "e1"
  num: number;
  title: string;
  part: string; // id da parte (ver ModuleContent.exerciseParts)
  session: string; // id da sessão em que se faz
  minutes: number;
  sections: string[]; // secções da aula que o exercício trabalha
  prompt: Block[];
  solution: Block[];
};

export type ClassifyExercise = ExerciseBase & {
  kind: "classify";
  categories: string[];
  items: { id: string; text: Inline; answer: number; explain?: Inline }[];
  /** Se existir, cada item ganha um campo de texto com este rótulo (justificação, correção…). */
  justify?: string;
};

/** Os itens estão na ordem certa; a plataforma baralha-os ao mostrar. */
export type OrderExercise = ExerciseBase & {
  kind: "order";
  items: { id: string; text: Inline; detail: string }[];
};

/** Resposta escrita (texto ou código), corrigida pelo próprio aluno com critérios e, se quiser, pelo tutor. */
export type TextExercise = ExerciseBase & {
  kind: "text";
  fields: { id: string; label: string; rows: number; mono?: boolean; placeholder?: string }[];
  criteria: string[];
};

export type Exercise = ClassifyExercise | OrderExercise | TextExercise;

export type McqQuestion = {
  id: string;
  section: string;
  q: Inline;
  options: Inline[];
  answer: number;
  explain: Inline;
};

export type TfQuestion = { id: string; section: string; q: Inline; answer: boolean; explain: Inline };

/** Pergunta da prova oficial. As de escolha múltipla corrigem-se sozinhas; as abertas com os critérios do gabarito. */
export type ExamQuestion =
  | {
      kind: "mcq";
      id: string;
      num: number;
      section: string;
      q: Inline;
      options: Inline[];
      answer: number;
      points: number;
      explain?: Inline;
      /** Blocos mostrados a seguir ao enunciado (código, tabelas). */
      context?: Block[];
    }
  | {
      kind: "open";
      id: string;
      num: number;
      section: string;
      q: Inline;
      rows: number;
      points: number;
      criteria: Criterion[];
      model: Inline;
      context?: Block[];
      /** Resposta-modelo longa (com código), mostrada depois de `model`. */
      modelBlocks?: Block[];
    };

export type ExamSpec = {
  minutes: number;
  total: number;
  pass: number;
  groups: { title: string; note?: string; questions: ExamQuestion[] }[];
};

/** Banco de perguntas extra para simulados de treino (não conta para a nota). */
export type PracticeBank = { mcq: McqQuestion[]; tf: TfQuestion[] };

/** Cartão de revisão espaçada; fica disponível quando a secção da aula é marcada como lida. */
export type Flashcard = { id: string; section: string; front: Inline; back: Inline; tag: string };

export type NotebookCell = { type: "md" | "code"; source: string };

export type ModuleContent = {
  id: string;
  duration: string;
  outcomes: string[];
  intro: Inline;
  sessions: SessionPlan[];
  goldenRule: Inline;
  lesson: LessonSection[];
  readings: { required: Reference[]; complementary: Reference[]; cited: string[] };
  apostila: { intro?: Inline; sections: { title: string; blocks: Block[] }[] };
  exerciseParts: { id: string; title: string; note?: Inline }[];
  exercises: Exercise[];
  exam: ExamSpec;
  /** Nota final do gabarito, mostrada depois da prova. */
  examReviewNote?: Inline;
  practice: PracticeBank;
  flashcards: Flashcard[];
  notebook: { filename: string; cells: NotebookCell[] };
  /** De onde veio o conteúdo (pasta do curso). */
  source?: string;
};

export type ModuleTab = "plano" | "aula" | "apostila" | "exercicios" | "prova" | "gabarito" | "notas";

// ---- Plano do curso ----

export type Criterion = { id: string; text: string; points: number };

export type PhaseMeta = {
  id: string; // "F0"
  num: number;
  title: string;
  weeks: number; // inclui a semana de fecho
  goal: string;
  modules: string[];
  closing: { exam: string; project: { title: string; description: string; rubric: Criterion[] } };
};

export type ModuleMeta = {
  id: string; // "M1"
  num: number;
  phase: string;
  title: string;
  learn: string;
  readings: string[];
  weeks: number;
  note?: string;
};

export type Certification = {
  id: string;
  name: string;
  provider: "AWS" | "Microsoft" | "Google Cloud" | "NVIDIA" | "Databricks";
  level: "Fundamental" | "Associado" | "Profissional";
  format: string;
  when: string;
  url?: string;
  role: "principal" | "recomendada" | "opcional" | "alternativa" | "depois";
};

export type Book = { title: string; purpose: string; modules: string; href?: string };

// ---- Fecho de fase (pasta fase-NN-exame-e-mini-projeto)

export type PhaseClosing = {
  phase: string; // "F0"
  source?: string;
  intro: Inline;
  /** Passa-se à fase seguinte com exam ≥ passRule.exam e mini-projeto ≥ passRule.project. */
  passRule: { exam: number; project: number };
  sessions: { label: string; what: Inline; time: string }[];
  retakeNote: Inline;
  portfolioNote?: Inline;
  examRules: Inline;
  exam: ExamSpec;
  /** Perguntas do exame → módulo a rever (tabela "Se a nota ficar abaixo de 14"). */
  examReview: { questions: number[]; module: string; sections?: number[] }[];
  project: {
    title: string;
    intro: Block[];
    questions: { n: number; title: string; text: Inline }[];
    questionsNote?: Inline;
    deliverables: Block[];
    rubric: { id: string; text: string; detail: Inline; points: number }[];
    references: Reference[];
    /** Secção opcional do enunciado ("Para ir mais longe"), mostrada depois do que entregar. */
    extra?: { title: string; blocks: Block[] };
  };
  /** Valores de referência do mini-projeto (gabarito), só depois de terminar. */
  projectKey: Block[];
  notebook?: { filename: string; cells: NotebookCell[] };
};
