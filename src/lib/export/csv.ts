import { questions } from "@/config/checklist";
import { ANSWER_LABELS, STATUS_META } from "@/config/scoring";
import type { DashboardData } from "@/lib/dashboard-data";
import { formatLocalDateTime } from "@/lib/period";

export const BOM = "\uFEFF";

/** Evita que Excel interprete texto capturado como fórmula (=, +, -, @, tab, retorno). */
export const neutralizeFormula = (text: string) => (/^[=+\-@\t\r]/.test(text) ? `'${text}` : text);

/** Celda CSV: texto neutralizado y entre comillas, con comillas internas duplicadas. Comas y saltos quedan dentro de las comillas. */
export const csvCell = (value: string | number | null | undefined) => {
  if (typeof value === "number") return String(value);
  return `"${neutralizeFormula(value ?? "").replaceAll('"', '""')}"`;
};

export const csvLine = (cells: (string | number | null | undefined)[]) => cells.map(csvCell).join(",");

export const questionHeader = (question: (typeof questions)[number]) => `${question.code} ${question.short}`;

/** Todos los registros del periodo, sin columnas de puntos. UTF-8 con BOM, coma y CRLF. */
export function buildCsv(data: DashboardData) {
  const header = ["Fecha", "Estación", "Operador", "Turno", "Porcentaje", "Semáforo", "Comentarios", ...questions.map(questionHeader)];
  const rows = data.records.map((row) => [formatLocalDateTime(row.createdAt, data.timeZone), row.station, row.operator, row.shift, row.percentage, STATUS_META[row.status].label, row.comments, ...questions.map((q) => (row.answers[q.id] ? ANSWER_LABELS[row.answers[q.id]] : ""))]);
  return BOM + [header, ...rows].map(csvLine).join("\r\n") + "\r\n";
}
