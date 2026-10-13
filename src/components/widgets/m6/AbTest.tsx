import React, { useMemo, useState } from "react";
import { aaTests, abTest, bootstrap, sampleSize } from "./ab";
import { HistChart, niceTicks, stepDigits } from "./charts";
import { fmt, histogram, pct } from "./stats";

// Teste A/B de duas proporções (secção 6): fórmula (erro padrão, z, valor-p, intervalo de 95%), tamanho da amostra
// para um poder de 80%, bootstrap com 5000 reamostragens e 2000 testes A/A. Com os dados da aula: valor-p 0,063,
// intervalo de −0,04 a +1,54 pontos percentuais e 9097 visitas por versão.

type Vals = { na: string; ca: string; nb: string; cb: string };
const PRESETS: { label: string; v: Vals }[] = [
  { label: "Botão novo (aula)", v: { na: "4000", ca: "120", nb: "4000", cb: "150" } },
  { label: "As mesmas taxas, 4 vezes mais visitas", v: { na: "16000", ca: "480", nb: "16000", cb: "600" } },
];
const BOOT = 5_000;
const AA = 2_000;

const toInt = (s: string) => (/^\s*\d+\s*$/.test(s.replace(/\s/g, "")) ? Number(s.replace(/\s/g, "")) : null);
/** diferença em pontos percentuais, com sinal: 0.0154 → "+1,54" */
const pp = (x: number, d = 2) => `${x > 0 ? "+" : ""}${fmt(x * 100, d)}`;

export function AbTest() {
  const [v, setV] = useState<Vals>(PRESETS[0].v);
  // simulações pedidas: a semente e os dados para que foram pedidas (mudar os dados apaga-as)
  const [boot, setBoot] = useState<{ seed: number; key: string } | null>(null);
  const [aa, setAa] = useState<{ seed: number; key: string } | null>(null);
  const na = toInt(v.na);
  const ca = toInt(v.ca);
  const nb = toInt(v.nb);
  const cb = toInt(v.cb);
  const valid = na !== null && ca !== null && nb !== null && cb !== null && na > 0 && nb > 0 && ca <= na && cb <= nb;
  const r = valid ? abTest(ca!, na!, cb!, nb!) : null;
  const key = `${v.na}|${v.ca}|${v.nb}|${v.cb}`;
  const set = (k: keyof Vals) => (e: React.ChangeEvent<HTMLInputElement>) => setV({ ...v, [k]: e.target.value });
  const active = PRESETS.find((p) => JSON.stringify(p.v) === JSON.stringify(v));

  const bt = useMemo(() => (r && boot?.key === key ? bootstrap(ca!, na!, cb!, nb!, BOOT, boot.seed) : null), [boot, key]); // r, ca… dependem só de key
  const aaRes = useMemo(() => (r && aa?.key === key ? aaTests(na!, r.pa, AA, aa.seed) : null), [aa, key]);
  const need = r ? sampleSize(r.pa, r.pb) : Infinity;

  return (
    <div className="m6-ab">
      <div className="m6-presets" role="group" aria-label="Exemplos">
        {PRESETS.map((p) => (
          <button key={p.label} type="button" className={`pill ${active === p ? "is-on" : ""}`} aria-pressed={active === p} onClick={() => setV(p.v)}>
            {p.label}
          </button>
        ))}
      </div>
      <div className="m6-ab-in">
        {(["a", "b"] as const).map((g) => (
          <fieldset key={g} className="m6-ab-group">
            <legend className="small">Versão {g.toUpperCase()}</legend>
            <label className="m6-field">
              <span className="small muted">Visitas</span>
              <input className="input input-sm mono" inputMode="numeric" value={v[`n${g}`]} onChange={set(`n${g}`)} aria-invalid={toInt(v[`n${g}`]) === null} />
            </label>
            <label className="m6-field">
              <span className="small muted">Compras</span>
              <input className="input input-sm mono" inputMode="numeric" value={v[`c${g}`]} onChange={set(`c${g}`)} aria-invalid={toInt(v[`c${g}`]) === null} />
            </label>
          </fieldset>
        ))}
      </div>

      {!r ? (
        <p className="widget-detail small">Escreva números inteiros: as visitas maiores do que zero e as compras entre zero e o número de visitas.</p>
      ) : (
        <>
          <div className="table-wrap">
            <table className="m6-tbl">
              <tbody>
                <tr>
                  <td>Conversão A · B</td>
                  <td className="m6-num mono">
                    {pct(r.pa, 2)} · {pct(r.pb, 2)}
                  </td>
                </tr>
                <tr>
                  <td>Diferença B − A</td>
                  <td className="m6-num mono">{pp(r.dif)} p.p.</td>
                </tr>
                <tr>
                  <td>Erro padrão da diferença</td>
                  <td className="m6-num mono">{fmt(r.ep * 100, 3)} p.p.</td>
                </tr>
                <tr>
                  <td>z = diferença / erro padrão</td>
                  <td className="m6-num mono">{Number.isFinite(r.z) ? fmt(r.z, 2) : "—"}</td>
                </tr>
                <tr>
                  <td>Valor-p (bilateral)</td>
                  <td className="m6-num mono">{Number.isNaN(r.p) ? "—" : r.p < 0.0001 ? "< 0,0001" : fmt(r.p, 4)}</td>
                </tr>
                <tr>
                  <td>Intervalo de 95%: dif ± 1,96 erros padrão</td>
                  <td className="m6-num mono">
                    {pp(r.lo)} a {pp(r.hi)} p.p.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <CiLine lo={r.lo} hi={r.hi} dif={r.dif} />

          <div className="widget-detail">
            {Number.isNaN(r.p) ? (
              <p className="widget-detail-title">As duas taxas são 0% (ou 100%): o erro padrão é zero e o teste não se pode calcular.</p>
            ) : r.lo <= 0 && r.hi >= 0 ? (
              <>
                <p className="widget-detail-title">O intervalo inclui o zero: ainda não se sabe.</p>
                <p className="small muted">
                  Os dados são compatíveis com nenhum efeito e com efeitos de até {pp(r.lo < 0 && -r.lo > r.hi ? r.lo : r.hi)} pontos. Isto não prova que B e A
                  são iguais: faltam dados.
                </p>
              </>
            ) : (
              <>
                <p className="widget-detail-title">O intervalo não inclui o zero: a diferença dificilmente se explica só por acaso.</p>
                <p className="small muted">
                  O efeito real pode estar em qualquer ponto do intervalo, de {pp(r.lo)} a {pp(r.hi)} pontos.
                </p>
              </>
            )}
            <p className="small muted">
              {Number.isFinite(need)
                ? `Para detetar uma passagem de ${pct(r.pa, 2)} para ${pct(r.pb, 2)} em 80% das vezes, com o limiar de 0,05, são precisas ${fmt(need)} visitas por versão. Este teste tem ${fmt(Math.min(na!, nb!))}${Math.min(na!, nb!) < need ? `, ${pct(Math.min(na!, nb!) / need, 0)} do necessário` : ", o suficiente"}.`
                : "Com as duas taxas iguais não há efeito para detetar: o tamanho da amostra não está definido."}
            </p>
          </div>

          {r.ep > 0 && (
            <div className="m6-sim">
              <div className="row gap-sm wrap center-y">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setBoot({ seed: bt && boot ? boot.seed + 1 : 4, key })}>
                  {bt ? "Repetir o bootstrap" : `Bootstrap: ${fmt(BOOT)} reamostragens`}
                </button>
                {bt && boot && <span className="small muted">semente {boot.seed}</span>}
              </div>
              {bt && <BootView bt={bt} dif={r.dif} />}
            </div>
          )}

          {r.pa > 0 && r.pa < 1 && (
            <div className="m6-sim">
              <div className="row gap-sm wrap center-y">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setAa({ seed: aaRes && aa ? aa.seed + 1 : 5, key })}>
                  {aaRes ? "Repetir os testes A/A" : `Simular ${fmt(AA)} testes A/A`}
                </button>
                <span className="small muted">
                  {fmt(na!)} visitas por versão, as duas com {pct(r.pa, 2)}
                </span>
              </div>
              {aaRes && <AaView frac={aaRes.frac} pvals={aaRes.pvals} />}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/** O intervalo de 95% numa reta, com o zero marcado. */
function CiLine({ lo, hi, dif }: { lo: number; hi: number; dif: number }) {
  const span = Math.max(hi - lo, 1e-9);
  const a = Math.min(lo, 0) - span * 0.25;
  const b = Math.max(hi, 0) + span * 0.25;
  const x = (v: number) => `${((v - a) / (b - a)) * 100}%`;
  return (
    <div
      className="m6-ci"
      role="img"
      aria-label={`Intervalo de 95% de ${pp(lo)} a ${pp(hi)} pontos percentuais; o zero ${lo <= 0 && hi >= 0 ? "está dentro" : "está fora"}`}
    >
      <span className="m6-ci-axis" />
      <span className="m6-ci-zero" style={{ left: x(0) }}>
        <span className="small muted">0</span>
      </span>
      <span className="m6-ci-bar" style={{ left: x(lo), width: `${((hi - lo) / (b - a)) * 100}%` }} />
      <span className="m6-ci-dot" style={{ left: x(dif) }} />
    </div>
  );
}

function BootView({ bt, dif }: { bt: ReturnType<typeof bootstrap>; dif: number }) {
  const sorted = Float64Array.from(bt.difs).sort();
  const lo = sorted[0];
  const hi = sorted[sorted.length - 1];
  const pad = Math.max((hi - lo) * 0.04, 1e-4);
  const h = histogram(bt.difs, lo - pad, hi + pad, 48);
  return (
    <>
      <HistChart
        edges={h.edges}
        heights={h.counts}
        lo={lo - pad}
        hi={hi + pad}
        yMax={Math.max(...h.counts) * 1.08}
        band={[bt.lo, bt.hi]}
        vlines={[
          { at: 0, kind: "zero" },
          { at: dif, kind: "obs" },
        ]}
        ticks={niceTicks(lo - pad, hi + pad, (x, step) => fmt(x * 100, stepDigits(step * 100)), 6)}
        label={`Distribuição bootstrap da diferença B − A; intervalo de 95% de ${pp(bt.lo)} a ${pp(bt.hi)} pontos`}
      />
      <p className="small muted">
        Diferença B − A em pontos percentuais. <span className="m6-key m6-key-band" aria-hidden="true" /> intervalo de 95% (percentis 2,5 e 97,5) ·{" "}
        <span className="m6-key m6-key-zero" aria-hidden="true" /> diferença zero · <span className="m6-key m6-key-obs" aria-hidden="true" /> diferença
        observada
      </p>
      <p className="small">
        Intervalo bootstrap: <span className="mono">{pp(bt.lo)}</span> a <span className="mono">{pp(bt.hi)}</span> p.p. Reamostragens com B pior ou igual a A:{" "}
        <span className="mono">{pct(bt.fracLe0, 1)}</span>.
      </p>
    </>
  );
}

function AaView({ frac, pvals }: { frac: number; pvals: Float64Array }) {
  const valid = Array.from(pvals).filter((p) => !Number.isNaN(p));
  const h = histogram(valid, 0, 1, 20);
  return (
    <>
      <HistChart
        edges={h.edges}
        heights={h.counts}
        lo={0}
        hi={1}
        yMax={Math.max(...h.counts, 1) * 1.1}
        hiBins={(i) => i === 0}
        ticks={[0, 0.05, 0.25, 0.5, 0.75, 1].map((x) => ({ at: x, label: fmt(x, x === 0 || x === 1 ? 0 : x === 0.5 ? 1 : 2) }))}
        label={`Valores-p de ${fmt(AA)} testes A/A; ${pct(frac)} ficam abaixo de 0,05`}
      />
      <p className="small muted">
        Valores-p dos {fmt(AA)} testes. <span className="m6-key m6-key-hi" aria-hidden="true" /> abaixo de 0,05: "vencedores" falsos.
      </p>
      <p className="small">
        <span className="mono">{pct(frac, 1)}</span> dos testes A/A dão "significativo" sem haver diferença nenhuma. O limiar de 0,05 promete cerca de 5%; com poucas compras por versão, a fração pode afastar-se um pouco disso.
      </p>
    </>
  );
}
