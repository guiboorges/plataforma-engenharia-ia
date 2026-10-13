import { useEffect, useState } from "react";
import { capability } from "./claude";

/** Primeiro nome de quem está a ver (capacidade `user` com o âmbito "profile"); "" se não houver. */
export function useFirstName(): string {
  const [name, setName] = useState("");
  useEffect(() => {
    let alive = true;
    capability<any>("user").then(async (u) => {
      if (!u) return;
      try {
        const n: string = (await u.name()) || "";
        if (alive) setName(n.trim().split(/\s+/)[0] ?? "");
      } catch {
        /* sem nome */
      }
    });
    return () => {
      alive = false;
    };
  }, []);
  return name;
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

/** Todas as palavras da pesquisa aparecem no texto (sem acentos, sem maiúsculas). */
export function matches(text: string, query: string): boolean {
  const t = norm(text);
  return norm(query)
    .split(/\s+/)
    .filter(Boolean)
    .every((w) => t.includes(w));
}
