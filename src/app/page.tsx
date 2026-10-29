/* eslint-disable @next/next/no-html-link-for-pages */
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { audits } from "@/db/schema";
import { ChecklistForm } from "@/components/checklist-form";
export const dynamic = "force-dynamic";
export default async function Home() { const stations = (await db.selectDistinct({ station: audits.station }).from(audits)).map((row) => row.station); return <main className="shell"><header className="topbar"><a href="/" className="brand">5S<span>Auditoría de estaciones</span></a><nav className="nav"><a href="/dashboard">Ver dashboard</a><a className="pill soft" href="/dashboard">Historial</a></nav></header><section className="pagehead"><p className="eyebrow">Auditoría operativa</p><h1>Revisa tu estación.<br />Mejora el siguiente turno.</h1><p className="lead">Marca el estado real de cada punto. Una respuesta clara hoy mantiene el área segura, ordenada y lista para producir.</p><p><strong>Leyenda:</strong> Sí = 2 pts · Parcial = 1 pt · No = 0 pts</p></section><ChecklistForm stations={stations} /></main>; }
