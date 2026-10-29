import { db } from "@/db";
import { getExportRows } from "@/db/audits";
import { questions } from "@/config/checklist";
import { ANSWER_LABELS, TIME_ZONE } from "@/config/scoring";
import { parsePeriod, periodStart } from "@/lib/period";
import { statusLabel } from "@/lib/scoring";

export const dynamic = "force-dynamic";

const dateTime = new Intl.DateTimeFormat("sv-SE", { timeZone: TIME_ZONE, dateStyle: "short", timeStyle: "short" });
// Comillas dobles y prefijo para que Excel no interprete el texto capturado como fórmula.
const cell = (value: string | number | null) => { const text = String(value ?? ""); return `"${(/^[=+\-@\t\r]/.test(text) ? `'${text}` : text).replaceAll('"', '""')}"`; };

export async function GET(request: Request) {
  const period = parsePeriod(new URL(request.url).searchParams.get("period"));
  const rows = await getExportRows(db, periodStart(period, new Date(), TIME_ZONE));
  const header = ["Fecha", "Estación", "Operador", "Turno", "Porcentaje", "Semáforo", "Comentarios", ...questions.map((q) => `${q.id.toUpperCase()} ${q.text}`)];
  const lines = rows.map((row) => [dateTime.format(row.createdAt), row.station, row.operator, row.shift, `${row.percentage}%`, statusLabel(row.percentage), row.comments, ...questions.map((q) => { const answer = row.answers[q.id]; return answer ? ANSWER_LABELS[answer] : ""; })]);
  const csv = [header, ...lines].map((line) => line.map(cell).join(",")).join("\r\n");
  return new Response(`﻿${csv}`, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename=auditorias-5s-${period}.csv` } });
}
