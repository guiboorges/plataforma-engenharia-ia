import React, { useState } from "react";
import { Seg } from "../../ui";
import { parseSlot, runIndex, runSlice, sliceCode, type Seq } from "./slicing";

// Explorador de índices e fatias (secção 3): mostra que posições a expressão escolhe e o que o Python imprime.

const SEQS: Seq[] = [
  { name: "precos", kind: "list", items: ["19.9", "45.0", "120.5", "8.75", "60.0"] },
  { name: "palavra", kind: "str", items: [..."Python"] },
];

type Mode = "slice" | "index";
type Preset = { mode: Mode; start: string; stop: string; step: string; label: string };

const PRESETS: Preset[] = [
  { mode: "slice", start: "1", stop: "3", step: "", label: "[1:3]" },
  { mode: "slice", start: "", stop: "3", step: "", label: "[:3]" },
  { mode: "slice", start: "-3", stop: "", step: "", label: "[-3:]" },
  { mode: "slice", start: "", stop: "", step: "2", label: "[::2]" },
  { mode: "slice", start: "", stop: "", step: "-1", label: "[::-1]" },
  { mode: "slice", start: "3", stop: "1", step: "", label: "[3:1]" },
  { mode: "slice", start: "1", stop: "100", step: "", label: "[1:100]" },
  { mode: "index", start: "-1", stop: "", step: "", label: "[-1]" },
  { mode: "index", start: "10", stop: "", step: "", label: "[10]" },
];

export function SliceExplorer() {
  const [seqId, setSeqId] = useState("0");
  const [mode, setMode] = useState<Mode>("slice");
  const [start, setStart] = useState("1");
  const [stop, setStop] = useState("3");
  const [step, setStep] = useState("");
  const seq = SEQS[Number(seqId)];
  const len = seq.items.length;

  const a = parseSlot(start);
  const b = parseSlot(stop);
  const c = parseSlot(step);
  const invalid = mode === "index" ? a === undefined || a === null : a === undefined || b === undefined || c === undefined;
  const res = invalid ? null : mode === "index" ? runIndex(seq, a as number) : runSlice(seq, a as number | null, b as number | null, c as number | null);
  const picked = res && res.ok ? res.picked : [];
  const order = new Map(picked.map((k, i) => [k, i + 1]));

  const apply = (p: Preset) => {
    setMode(p.mode);
    setStart(p.start);
    setStop(p.stop);
    setStep(p.step);
  };

  let note = "";
  if (invalid) note = mode === "index" ? "Escreva um número inteiro, por exemplo 0 ou -1." : "Cada campo leva um número inteiro ou fica vazio (usa o valor por omissão).";
  else if (res && !res.ok) note = mode === "index" ? `Só há índices de 0 a ${len - 1} (ou de -1 a -${len}): um índice fora da sequência dá erro.` : "O passo não pode ser 0.";
  else if (res && res.ok && mode === "slice" && picked.length === 0) note = "Nenhuma posição cumpre a regra: a fatia sai vazia, sem erro.";
  else if (res && res.ok && res.clipped) note = "Numa fatia, um limite fora da sequência não dá erro: é cortado ao tamanho.";
  else if (res && res.ok && mode === "slice") note = `Posições escolhidas, por esta ordem: ${picked.join(", ")}. O fim nunca entra.`;
  else if (res && res.ok) note = `O índice ${a} é a posição ${picked[0]}.`;

  const printedEmpty = res && res.ok && res.printed === "";

  return (
    <div className="m2-slice">
      <div className="m2-slice-top">
        <Seg
          label="Sequência"
          options={SEQS.map((s, i) => ({ id: String(i), label: s.kind === "list" ? "Lista precos" : "Texto palavra" }))}
          value={seqId}
          onChange={setSeqId}
        />
        <Seg
          label="Tipo de acesso"
          options={[
            { id: "slice", label: "Fatia [a:b:c]" },
            { id: "index", label: "Índice [i]" },
          ]}
          value={mode}
          onChange={(id) => setMode(id as Mode)}
        />
      </div>

      <p className="m2-slice-def mono">
        {seq.name} = {seq.kind === "list" ? `[${seq.items.join(", ")}]` : `"${seq.items.join("")}"`}
      </p>

      <div className="m2-cells" role="list" aria-label={`Elementos de ${seq.name}`}>
        {seq.items.map((it, k) => {
          const n = order.get(k);
          return (
            <div key={k} role="listitem" className={`m2-cell ${n ? "is-on" : ""}`}>
              <span className="sr-only">{`${it}: índice ${k} ou ${k - len}${n ? (mode === "slice" ? `, escolhido em ${n}.º lugar` : ", escolhido") : ""}`}</span>
              <span className="m2-cell-order mono" aria-hidden="true">
                {n && mode === "slice" ? n : ""}
              </span>
              <span className="m2-cell-val mono" aria-hidden="true">
                {it}
              </span>
              <span className="m2-cell-idx mono" aria-hidden="true">
                <span>{k}</span>
                <span>{k - len}</span>
              </span>
            </div>
          );
        })}
      </div>
      <p className="m2-legend small muted">Por baixo de cada elemento: o índice a contar do início e o índice negativo, a contar do fim.</p>

      <div className="m2-slice-inputs">
        <span className="mono m2-slice-code">{seq.name}[</span>
        <SlotInput label={mode === "index" ? "Índice" : "Início"} value={start} onChange={setStart} />
        {mode === "slice" && (
          <>
            <span className="mono m2-slice-code">:</span>
            <SlotInput label="Fim" value={stop} onChange={setStop} />
            <span className="mono m2-slice-code">:</span>
            <SlotInput label="Passo" value={step} onChange={setStep} />
          </>
        )}
        <span className="mono m2-slice-code">]</span>
      </div>

      <div className="row gap-sm wrap" role="group" aria-label="Exemplos">
        {PRESETS.map((p) => (
          <button key={p.label} type="button" className="pill mono" onClick={() => apply(p)}>
            {p.label}
          </button>
        ))}
      </div>

      <div className="widget-detail m2-console" aria-live="polite">
        <p className="mono m2-console-in">&gt;&gt;&gt; {sliceCode(seq, start, stop, step, mode)}</p>
        {res && res.ok && <p className="mono m2-console-out">{printedEmpty ? <span className="muted">(linha vazia: o texto está vazio)</span> : res.printed}</p>}
        {res && !res.ok && <p className="mono m2-console-err">{res.error}</p>}
        {note && <p className="muted small">{note}</p>}
      </div>
    </div>
  );
}

function SlotInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="m2-slot">
      <span className="sr-only">{label}</span>
      <input
        className="input input-sm mono"
        inputMode="numeric"
        value={value}
        placeholder={label.toLowerCase()}
        onChange={(e) => onChange(e.target.value)}
        size={5}
        aria-label={label}
      />
    </label>
  );
}
