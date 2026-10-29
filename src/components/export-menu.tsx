"use client";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import type { Period } from "@/lib/period";

const OPTIONS = [
  { format: "csv", label: "CSV (.csv)", icon: <path d="M4 1.5h5.5L13 5v9.5H4zM9.5 1.5V5H13M6.5 8.5h4M6.5 11h4" /> },
  { format: "xlsx", label: "Excel (.xlsx)", icon: <path d="M2.5 2.5h11v11h-11zM2.5 6.2h11M2.5 9.8h11M6.2 2.5v11" /> },
  { format: "pdf", label: "Reporte PDF (.pdf)", icon: <path d="M4 1.5h5.5L13 5v9.5H4zM9.5 1.5V5H13M6.5 9h4M6.5 11.5h2.5M6.5 6.5h1.5" /> },
] as const;

const Icon = ({ children }: { children: React.ReactNode }) => <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round">{children}</svg>;

function fileNameFrom(response: Response, fallback: string) {
  return /filename="?([^";]+)"?/.exec(response.headers.get("Content-Disposition") ?? "")?.[1] ?? fallback;
}

/** Botón "Exportar" con menú (CSV, Excel, PDF) para el periodo seleccionado. */
export function ExportMenu({ period }: { period: Period }) {
  const [open, setOpen] = useState(false);
  // Índice del elemento que recibe el foco al abrir (-1 = último).
  const [initialFocus, setInitialFocus] = useState(0);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => { if (!rootRef.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  useEffect(() => { if (open) itemRefs.current.at(initialFocus)?.focus(); }, [open, initialFocus]);

  const openAt = (index: number) => { setInitialFocus(index); setOpen(true); };
  const closeMenu = () => { setOpen(false); buttonRef.current?.focus(); };

  function onButtonKey(event: KeyboardEvent) {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") { event.preventDefault(); openAt(0); }
    if (event.key === "ArrowUp") { event.preventDefault(); openAt(-1); }
  }

  function onMenuKey(event: KeyboardEvent) {
    const items = itemRefs.current.filter(Boolean) as HTMLButtonElement[];
    const current = items.indexOf(document.activeElement as HTMLButtonElement);
    const moves: Record<string, number> = { ArrowDown: (current + 1) % items.length, ArrowUp: (current - 1 + items.length) % items.length, Home: 0, End: items.length - 1 };
    if (event.key in moves) { event.preventDefault(); items[moves[event.key]].focus(); }
    else if (event.key === "Escape") { event.preventDefault(); closeMenu(); }
    else if (event.key === "Tab") setOpen(false);
  }

  async function download(format: string, label: string) {
    closeMenu();
    setBusy(label);
    setError(null);
    try {
      const response = await fetch(`/api/export?format=${format}&period=${period}`, { cache: "no-store" });
      if (!response.ok) throw new Error((await response.json().catch(() => null))?.error ?? `Error ${response.status}`);
      const url = URL.createObjectURL(await response.blob());
      const link = Object.assign(document.createElement("a"), { href: url, download: fileNameFrom(response, `auditoria-5s.${format}`) });
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (reason) {
      setError(`No se pudo exportar ${label}. ${reason instanceof Error ? reason.message : ""}`.trim());
    } finally {
      setBusy(null);
    }
  }

  return <div className="export-menu" ref={rootRef}>
    <button ref={buttonRef} type="button" className="pill primary export-button" aria-haspopup="menu" aria-expanded={open} aria-controls={menuId} aria-busy={busy !== null} disabled={busy !== null} onClick={() => (open ? setOpen(false) : openAt(0))} onKeyDown={onButtonKey}>
      <Icon><path d="M8 2v8M4.5 7 8 10.5 11.5 7M2.5 13.5h11" /></Icon>
      {busy ? "Generando…" : "Exportar"}
      {!busy && <svg aria-hidden="true" width="10" height="10" viewBox="0 0 10 10"><path d="M2 3.5 5 6.5 8 3.5" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>}
    </button>
    {open && <ul id={menuId} role="menu" aria-label="Formatos de exportación" className="export-list" onKeyDown={onMenuKey}>
      {OPTIONS.map((option, i) => <li role="none" key={option.format}>
        <button ref={(node) => { itemRefs.current[i] = node; }} type="button" role="menuitem" tabIndex={-1} onClick={() => download(option.format, option.label)}><Icon>{option.icon}</Icon>{option.label}</button>
      </li>)}
    </ul>}
    {error && <p className="export-error" role="alert">{error}</p>}
  </div>;
}
