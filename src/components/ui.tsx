import React, { useEffect, useId, useRef, useState } from "react";

// Componentes base do sistema visual (ver design/DESIGN.md).

// ---------- ícones (traço 1.5, 24×24)

const PATHS: Record<string, string> = {
  home: "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
  grid: "M4 4h6.5v6.5H4z M13.5 4H20v6.5h-6.5z M4 13.5h6.5V20H4z M13.5 13.5H20V20h-6.5z",
  route: "M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z M18 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4z M8 17h7.5a3.5 3.5 0 0 0 0-7h-7a3.5 3.5 0 0 1 0-7H16",
  book: "M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z",
  cards: "M4 8.5h11.5v11.5H4z M8.5 4H20v11.5",
  folder: "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
  folderPlus: "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M12 10.5v5 M9.5 13h5",
  calendar: "M4 6.5A1.5 1.5 0 0 1 5.5 5h13A1.5 1.5 0 0 1 20 6.5v12a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5z M4 10h16 M8.5 3v4 M15.5 3v4",
  award: "M12 3a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11z M8.6 13 7 21l5-3 5 3-1.6-8",
  library: "M5 4h3v16H5z M10 4h3v16h-3z M15.5 5.2l2.9-.8 4 15.4-2.9.8z",
  sliders: "M4 6h9 M17 6h3 M15 4v4 M4 12h3 M11 12h9 M9 10v4 M4 18h11 M19 18h1 M17 16v4",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z M20 20l-3.5-3.5",
  updown: "M8 9l4-4 4 4 M8 15l4 4 4-4",
  play: "M7 5l12 7-12 7z",
  stop: "M6 6h12v12H6z",
  check: "M5 12.5l4.5 4.5L19 7",
  lock: "M6 11h12v9H6z M8.5 11V8a3.5 3.5 0 0 1 7 0v3",
  right: "M9 6l6 6-6 6",
  left: "M15 6l-6 6 6 6",
  up: "M6 15l6-6 6 6",
  down: "M6 9l6 6 6-6",
  caret: "M10 8l4 4-4 4",
  external: "M14 4h6v6 M20 4l-9 9 M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5",
  copy: "M9 9h11v11H9z M5 15H4V4h11v1",
  download: "M12 4v11 M7 10l5 5 5-5 M5 20h14",
  sparkle: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z M19 15l.7 1.8 1.8.7-1.8.7L19 20l-.7-1.8-1.8-.7 1.8-.7z",
  clock: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M12 7v5l3 2",
  x: "M6 6l12 12 M18 6L6 18",
  menu: "M4 7h16 M4 12h16 M4 17h16",
  flag: "M5 21V4 M5 4h11l-2 4 2 4H5",
  refresh: "M20 11a8 8 0 1 0-2.3 5.7 M20 5v6h-6",
  pencil: "M4 20h4L19 9l-4-4L4 16z M14 6l4 4",
  list: "M9 6h11 M9 12h11 M9 18h11 M4.5 6h.01 M4.5 12h.01 M4.5 18h.01",
  file: "M6 3h8l4 4v14H6z M14 3v4h4 M9 12h6 M9 16h6",
  target: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z M12 11a1 1 0 1 0 0 2 1 1 0 0 0 0-2z",
  timer: "M10 2h4 M12 14l3-3 M12 6a8 8 0 1 0 0 16 8 8 0 0 0 0-16z",
  eye: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  send: "M4 12l16-8-6 16-2-7z",
  cloud: "M7 18h10a4 4 0 0 0 .5-7.97A6 6 0 0 0 6 10a4 4 0 0 0 1 8z",
  laptop: "M4 6h16v10H4z M2 19h20",
  plus: "M12 5v14 M5 12h14",
  trash: "M4 7h16 M9 7V4h6v3 M6 7l1 13h10l1-13",
  code: "M8 8l-4 4 4 4 M16 8l4 4-4 4 M13.5 5l-3 14",
  info: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M12 11v6 M12 7.5v.01",
  chart: "M4 20V10 M10 20V4 M16 20v-7 M21 20H3",
  share: "M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M8.6 13.5l6.8 4 M15.4 6.5l-6.8 4",
  arrowRight: "M5 12h14 M13 6l6 6-6 6",
  layers: "M12 3 2 8l10 5 10-5z M2 13l10 5 10-5",
  cap: "M2 9l10-5 10 5-10 5z M6 11v5c3 2 9 2 12 0v-5 M22 9v5",
};

export function Icon({ name, size = 16, className }: { name: keyof typeof PATHS | string; size?: number; className?: string }) {
  return (
    <svg
      className={"icon " + (className ?? "")}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={PATHS[name] ?? ""} />
    </svg>
  );
}

// ---------- botões

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "quiet";
  size?: "sm" | "md";
  icon?: string;
  iconRight?: string;
};

export function Button({ variant = "secondary", size = "md", icon, iconRight, className, children, ...rest }: BtnProps) {
  return (
    <button type="button" className={`btn btn-${variant} btn-${size} ${className ?? ""}`} {...rest}>
      {icon && <Icon name={icon} size={size === "sm" ? 14 : 16} />}
      {children && <span>{children}</span>}
      {iconRight && <Icon name={iconRight} size={size === "sm" ? 14 : 16} />}
    </button>
  );
}

/** Botão com confirmação na própria página (o viewer não mostra confirm()). */
export function ConfirmButton({
  label,
  confirmLabel,
  question,
  onConfirm,
  variant = "secondary",
  icon,
  size = "md",
  disabled,
}: {
  label: string;
  confirmLabel: string;
  question: string;
  onConfirm: () => void;
  variant?: BtnProps["variant"];
  icon?: string;
  size?: "sm" | "md";
  disabled?: boolean;
}) {
  const [asking, setAsking] = useState(false);
  if (!asking)
    return (
      <Button variant={variant} icon={icon} size={size} disabled={disabled} onClick={() => setAsking(true)}>
        {label}
      </Button>
    );
  return (
    <span className="confirm" role="group" aria-label={question}>
      <span className="confirm-q">{question}</span>
      <Button
        variant={variant === "danger" ? "danger" : "primary"}
        size="sm"
        onClick={() => {
          setAsking(false);
          onConfirm();
        }}
      >
        {confirmLabel}
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setAsking(false)}>
        Cancelar
      </Button>
    </span>
  );
}

// ---------- indicadores

export function Chip({
  tone = "neutral",
  children,
  icon,
}: {
  tone?: "neutral" | "ok" | "warn" | "bad" | "info" | "accent" | "marker";
  children: React.ReactNode;
  icon?: string;
}) {
  return (
    <span className={`chip chip-${tone}`}>
      {icon && <Icon name={icon} size={12} />}
      {children}
    </span>
  );
}

export function Kbd({ children }: { children: React.ReactNode }) {
  return <kbd className="kbd">{children}</kbd>;
}

export function Bar({ value, tone = "accent", label, thin }: { value: number; tone?: string; label?: string; thin?: boolean }) {
  const v = Math.max(0, Math.min(1, value));
  return (
    <div className={`bar ${thin ? "bar-thin" : ""}`} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(v * 100)} aria-label={label}>
      <div className={`bar-fill tone-${tone}`} style={{ width: `${v * 100}%` }} />
    </div>
  );
}

export function Ring({ value, size = 40, stroke = 4, label, color }: { value: number; size?: number; stroke?: number; label?: React.ReactNode; color?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  return (
    <span className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color ?? "var(--text)"}
          strokeWidth={stroke}
          strokeDasharray={`${c * v} ${c}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      {label !== undefined && <span className="ring-label">{label}</span>}
    </span>
  );
}

export function Checkbox({ checked, onChange, label, id }: { checked: boolean; onChange: (v: boolean) => void; label: React.ReactNode; id: string }) {
  return (
    <label className={`check ${checked ? "is-checked" : ""}`} htmlFor={id}>
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="check-box" aria-hidden="true">
        <Icon name="check" size={12} />
      </span>
      <span className="check-label">{label}</span>
    </label>
  );
}

export function CopyButton({ text, label = "Copiar" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  const ref = useRef<number>();
  useEffect(() => () => window.clearTimeout(ref.current), []);
  return (
    <Button
      size="sm"
      variant="ghost"
      icon={done ? "check" : "copy"}
      onClick={() => {
        navigator.clipboard
          ?.writeText(text)
          .then(() => {
            setDone(true);
            ref.current = window.setTimeout(() => setDone(false), 1600);
          })
          .catch(() => {
            const ta = document.createElement("textarea");
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            try {
              document.execCommand("copy");
              setDone(true);
            } catch {
              /* sem cópia */
            }
            ta.remove();
          });
      }}
    >
      {done ? "Copiado" : label}
    </Button>
  );
}

export function Empty({ icon = "info", title, children }: { icon?: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="empty">
      <Icon name={icon} size={20} />
      <div>
        <p className="empty-title">{title}</p>
        {children && <div className="empty-body">{children}</div>}
      </div>
    </div>
  );
}

// ---------- estrutura de página

export type Crumb = { label: string; icon?: string; onClick?: () => void };

/** Migalhas + título da página + ações à direita. Todas as páginas começam com ele. */
export function PageHeader({ crumbs, title, subtitle, actions }: { crumbs: Crumb[]; title: React.ReactNode; subtitle?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <header className="page-head">
      <nav className="page-crumbs" aria-label="Onde está">
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="crumb-sep">/</span>}
            {c.icon && <Icon name={c.icon} size={16} />}
            {c.onClick && i < crumbs.length - 1 ? (
              <button type="button" className="crumb" onClick={c.onClick}>
                {c.label}
              </button>
            ) : (
              <span className="crumb-current" aria-current={i === crumbs.length - 1 ? "page" : undefined}>
                {c.label}
              </span>
            )}
          </React.Fragment>
        ))}
      </nav>
      <div className="page-title">
        <div>
          <h1>{title}</h1>
          {subtitle && <div className="page-sub">{subtitle}</div>}
        </div>
        {actions && <div className="page-actions">{actions}</div>}
      </div>
    </header>
  );
}

export function Card({
  title,
  actions,
  children,
  className,
  id,
  ariaLabel,
}: {
  title?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  id?: string;
  ariaLabel?: string;
}) {
  return (
    <section className={`card ${className ?? ""}`} id={id} aria-label={ariaLabel}>
      {(title || actions) && (
        <header className="card-head">
          {typeof title === "string" ? <h2 className="card-title">{title}</h2> : title}
          {actions && <div className="row gap-sm wrap">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  );
}

export type SegOption = { id: string; label: string; icon?: string; done?: boolean };

/** Controlo segmentado: separadores e filtros. */
export function Seg({ options, value, onChange, label, scroll }: { options: SegOption[]; value: string; onChange: (id: string) => void; label: string; scroll?: boolean }) {
  return (
    <div className={`seg ${scroll ? "seg-scroll" : ""}`} role="tablist" aria-label={label}>
      {options.map((o) => (
        <button key={o.id} type="button" role="tab" aria-selected={value === o.id} className={value === o.id ? "is-on" : ""} onClick={() => onChange(o.id)}>
          {o.icon && <Icon name={o.icon} size={14} />}
          {o.label}
          {o.done && (
            <span className="seg-done" aria-label="concluído">
              <Icon name="check" size={9} />
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ---------- cartões de número e de pasta

export function StatTile({
  label,
  value,
  unit,
  note,
  illus,
  onClick,
}: {
  label: string;
  value: React.ReactNode;
  unit?: string;
  note?: React.ReactNode;
  illus: IllusKind;
  onClick?: () => void;
}) {
  const inner = (
    <>
      <span className="stat-main">
        <span className="stat-label">{label}</span>
        <span>
          <span className="stat-value">{value}</span>
          {unit && <span className="stat-unit">{unit}</span>}
        </span>
        {note && <span className="stat-note">{note}</span>}
      </span>
      <span className="stat-art" aria-hidden="true">
        <Illus kind={illus} />
      </span>
    </>
  );
  return onClick ? (
    <button type="button" className="stat-tile" onClick={onClick}>
      {inner}
    </button>
  ) : (
    <div className="stat-tile">{inner}</div>
  );
}

export function FolderCard({
  meta,
  title,
  desc,
  footer,
  onOpen,
  muted,
  dot,
  className,
}: {
  className?: string;
  meta?: React.ReactNode;
  title: React.ReactNode;
  desc?: React.ReactNode;
  footer?: React.ReactNode;
  onOpen?: () => void;
  muted?: boolean;
  /** número da fase para o ponto de cor no separador da pasta */
  dot?: number;
}) {
  return (
    <article className={`folder-card ${muted ? "is-muted" : ""} ${className ?? ""}`}>
      <div className="folder-top">
        <FolderArt dot={dot} />
        {meta && <div className="folder-meta">{meta}</div>}
      </div>
      <div className="folder-body">
        {onOpen ? (
          <button type="button" className="folder-title" onClick={onOpen}>
            {title}
          </button>
        ) : (
          <p className="folder-title">{title}</p>
        )}
        {desc && <p className="folder-desc">{desc}</p>}
      </div>
      {footer && <div className="folder-foot">{footer}</div>}
    </article>
  );
}

function FolderArt({ dot }: { dot?: number }) {
  const gid = useId().replace(/:/g, "");
  return (
    <svg width="84" height="62" viewBox="0 0 84 62" aria-hidden="true">
      <defs>
        <linearGradient id={`fg${gid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: "var(--illus-a)" }} />
          <stop offset="1" style={{ stopColor: "var(--illus-b)" }} />
        </linearGradient>
      </defs>
      <path d="M2 8a6 6 0 0 1 6-6h18l6 6h44a6 6 0 0 1 6 6v40a6 6 0 0 1-6 6H8a6 6 0 0 1-6-6z" fill="var(--illus-b)" stroke="var(--illus-line)" />
      <path d="M2 16a6 6 0 0 1 6-6h68a6 6 0 0 1 6 6v38a6 6 0 0 1-6 6H8a6 6 0 0 1-6-6z" fill={`url(#fg${gid})`} stroke="var(--illus-line)" />
      <path d="M64 50h10" stroke="var(--illus-hi)" strokeWidth="2" strokeLinecap="round" />
      {dot !== undefined && <circle cx="12" cy="6" r="2.5" className={`fc-${dot}`} fill="currentColor" />}
    </svg>
  );
}

/** Círculos sobrepostos (como os avatares da referência) com as partes de um módulo. */
export function PartsStack({ parts }: { parts: { label: string; value: number; short?: string }[] }) {
  // iniciais; se duas partes começam pela mesma letra (Aula, Apostila), usa duas letras
  const first = parts.map((p) => p.label[0]);
  const short = parts.map((p, i) => p.short ?? (first.filter((f) => f === first[i]).length > 1 ? p.label.slice(0, 2) : first[i]));
  return (
    <span className="parts-stack" aria-label={parts.map((p) => `${p.label}: ${p.value >= 1 ? "feito" : p.value > 0 ? "em curso" : "por fazer"}`).join(", ")}>
      {parts.map((p, i) => (
        <span key={p.label} className={p.value >= 1 ? "is-done" : p.value > 0 ? "is-partial" : ""} title={p.label}>
          {short[i]}
        </span>
      ))}
    </span>
  );
}

// ---------- ilustrações dos cartões de número (cinzentos, com relevo discreto)

export type IllusKind = "docs" | "check" | "folder" | "clock" | "cards" | "calendar" | "cap" | "chart";

export function Illus({ kind, size = 56 }: { kind: IllusKind; size?: number }) {
  const gid = useId().replace(/:/g, "");
  const g = `url(#ig${gid})`;
  const line = "var(--illus-line)";
  const hi = "var(--illus-hi)";
  const defs = (
    <defs>
      <linearGradient id={`ig${gid}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" style={{ stopColor: "var(--illus-a)" }} />
        <stop offset="1" style={{ stopColor: "var(--illus-b)" }} />
      </linearGradient>
    </defs>
  );
  let body: React.ReactNode;
  switch (kind) {
    case "docs":
      body = (
        <>
          <rect x="17" y="9" width="28" height="36" rx="4" fill="var(--illus-b)" stroke={line} />
          <rect x="13" y="12" width="28" height="36" rx="4" fill="var(--illus-b)" stroke={line} />
          <rect x="9" y="15" width="28" height="36" rx="4" fill={g} stroke={line} />
          <path d="M15 22h10 M15 33h16 M15 38h16 M15 43h12" stroke={hi} strokeWidth="1.6" strokeLinecap="round" />
        </>
      );
      break;
    case "check":
      body = (
        <>
          <rect x="12" y="12" width="32" height="32" rx="7" fill={g} stroke={line} />
          <path d="M20 28.5l5.5 5.5L37 22" stroke={hi} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </>
      );
      break;
    case "folder":
      body = (
        <>
          <path d="M7 16a4 4 0 0 1 4-4h11l4 4h19a4 4 0 0 1 4 4v20a4 4 0 0 1-4 4H11a4 4 0 0 1-4-4z" fill="var(--illus-b)" stroke={line} />
          <path d="M7 21a4 4 0 0 1 4-4h34a4 4 0 0 1 4 4v19a4 4 0 0 1-4 4H11a4 4 0 0 1-4-4z" fill={g} stroke={line} />
          <path d="M37 38h7" stroke={hi} strokeWidth="1.8" strokeLinecap="round" />
        </>
      );
      break;
    case "clock":
      body = (
        <>
          <circle cx="28" cy="28" r="17" fill={g} stroke={line} />
          <circle cx="28" cy="28" r="12.5" fill="none" stroke={line} strokeDasharray="1 4.2" />
          <path d="M28 20v8l5.5 3.5" stroke={hi} strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      );
      break;
    case "cards":
      body = (
        <>
          <rect x="19" y="10" width="26" height="34" rx="4" fill="var(--illus-b)" stroke={line} transform="rotate(10 32 27)" />
          <rect x="11" y="13" width="26" height="34" rx="4" fill={g} stroke={line} transform="rotate(-6 24 30)" />
          <path d="M17 24h12 M17 30h9" stroke={hi} strokeWidth="1.6" strokeLinecap="round" transform="rotate(-6 24 30)" />
        </>
      );
      break;
    case "calendar":
      body = (
        <>
          <rect x="10" y="13" width="36" height="32" rx="6" fill={g} stroke={line} />
          <path d="M10 22h36 M19 9v7 M37 9v7" stroke={line} strokeLinecap="round" />
          {[0, 1, 2, 3].map((c) => [0, 1, 2].map((r) => <rect key={`${c}${r}`} x={16 + c * 7} y={27 + r * 5.5} width="3.5" height="3" rx="1" fill={c === 2 && r === 1 ? hi : line} />))}
        </>
      );
      break;
    case "cap":
      body = (
        <>
          <path d="M6 23l22-10 22 10-22 10z" fill={g} stroke={line} strokeLinejoin="round" />
          <path d="M15 28v8c6 5 20 5 26 0v-8" fill="var(--illus-b)" stroke={line} />
          <path d="M50 23v10" stroke={hi} strokeWidth="1.8" strokeLinecap="round" />
        </>
      );
      break;
    case "chart":
      body = (
        <>
          <rect x="10" y="10" width="36" height="36" rx="7" fill={g} stroke={line} />
          <path d="M18 38v-8 M25 38V22 M32 38v-11 M39 38V18" stroke={hi} strokeWidth="2.4" strokeLinecap="round" />
        </>
      );
      break;
  }
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" aria-hidden="true">
      {defs}
      {body}
    </svg>
  );
}

// ---------- utilidades

export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(t);
  }, [intervalMs]);
  return now;
}

export function fmtClock(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return h ? `${h}:${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}` : `${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}
