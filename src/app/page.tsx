/* eslint-disable @next/next/no-html-link-for-pages */
import Image from "next/image";
import { db } from "@/db";
import { listStations } from "@/db/audits";
import { answerLegend } from "@/lib/scoring";
import { ChecklistForm } from "@/components/checklist-form";
export const dynamic = "force-dynamic";
export default async function Home() { const stations = await listStations(db); return <main className="shell"><header className="topbar"><a href="/" className="brand"><span className="brand-logo"><Image src="/safe-demo_logo-blc-Photoroom.png" alt="Safe Demo" width={72} height={50} priority /></span><span>5S<small>Auditoría de estaciones</small></span></a><nav className="nav"><a href="/dashboard">Ver dashboard</a><a className="pill soft" href="/dashboard">Historial</a></nav></header><section className="pagehead"><p className="eyebrow">Auditoría operativa</p><h1>Checklist<br />Por estación de trabajo.</h1><p className="lead">Marca el estado real de cada punto.</p><p><strong>Leyenda:</strong> {answerLegend()}</p></section><ChecklistForm stations={stations} /></main>; }
