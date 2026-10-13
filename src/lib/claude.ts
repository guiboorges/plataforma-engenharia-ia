// Acesso às capacidades do Artifact (db, user, sample, downloads).
// Fora de um Artifact (npm run dev) não há window.claude e tudo cai para o modo local.

type Use = (name: string) => Promise<any>;

function getUse(): Use | null {
  const c = (window as any).claude;
  return c && typeof c.use === "function" ? (c.use.bind(c) as Use) : null;
}

export const inArtifact = (): boolean => getUse() !== null;

const memo = new Map<string, Promise<any>>();

export function capability<T = any>(name: string): Promise<T | null> {
  const use = getUse();
  if (!use) return Promise.resolve(null);
  if (!memo.has(name)) memo.set(name, use(name).catch(() => null));
  return memo.get(name)!;
}

// ---------- Claude (sample)

export type SampleFn = ((input: string | { role: "user" | "assistant"; content: string }[], opts?: any) => Promise<{ text: string; truncated: boolean }>) & {
  json: <T = unknown>(input: any, opts?: any) => Promise<T>;
};

export const getSample = () => capability<SampleFn>("sample");

export function sampleErrorText(e: any): string {
  switch (e?.code) {
    case "not_granted":
    case "sampling_disabled":
    case "not_declared":
      return "O tutor não está autorizado nesta página.";
    case "rate_limited":
      return "Demasiados pedidos seguidos. Espere um pouco e tente outra vez.";
    case "session_expired":
      return "A sessão expirou. Volte a entrar no claude.ai.";
    case "refused":
      return "O Claude não respondeu a este pedido. Reformule a pergunta.";
    case "invalid_json":
      return "A correção veio num formato inesperado. Tente outra vez.";
    case "prompt_too_large":
      return "O texto é demasiado longo para enviar de uma vez.";
    case "cancelled":
      return "";
    default:
      return "Não foi possível falar com o Claude agora. Tente outra vez.";
  }
}

/** Erros que significam que o tutor não está disponível nesta visualização. */
export function isFatalSampleError(e: any): boolean {
  return ["not_granted", "sampling_disabled", "not_declared", "capability_disabled", "capability_removed"].includes(e?.code);
}

// ---------- Descarregar ficheiros

export type SaveResult = "saved" | "declined" | "unavailable" | "error";

export async function saveFile(filename: string, data: string | Blob, mime = "application/octet-stream"): Promise<SaveResult> {
  const downloads = await capability<any>("downloads");
  if (downloads) {
    try {
      await downloads.save({ filename, data });
      return "saved";
    } catch (e: any) {
      if (e?.code === "declined") return "declined";
      return "error";
    }
  }
  if (inArtifact()) return "unavailable";
  // modo local: download normal do browser
  const blob = typeof data === "string" ? new Blob([data], { type: mime }) : data;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return "saved";
}

export async function canSaveFiles(): Promise<boolean> {
  if (!inArtifact()) return true;
  return (await capability("downloads")) !== null;
}
