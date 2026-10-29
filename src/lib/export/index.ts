import { z } from "zod";
import type { DashboardData } from "@/lib/dashboard-data";
import { DEFAULT_PERIOD, formatLocalDate, PERIOD_KEYS, type Period } from "@/lib/period";
import { buildCsv } from "./csv";
import { buildXlsx } from "./xlsx";

export const EXPORT_FORMATS = ["csv", "xlsx", "pdf"] as const;
export type ExportFormat = (typeof EXPORT_FORMATS)[number];

export const exportQuerySchema = z.object({
  format: z.enum(EXPORT_FORMATS, "Formato inválido: usa csv, xlsx o pdf."),
  period: z.enum(PERIOD_KEYS, `Periodo inválido: usa ${PERIOD_KEYS.join(", ")}.`).default(DEFAULT_PERIOD),
});

const CONTENT_TYPES: Record<ExportFormat, string> = {
  csv: "text/csv; charset=utf-8",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  pdf: "application/pdf",
};

/** auditoria-5s_{periodo}_{YYYY-MM-DD}.{ext}, con la fecha de generación en la zona horaria de planta. */
export const exportFileName = (period: Period, format: ExportFormat, generatedAt: Date, timeZone: string) => `auditoria-5s_${period}_${formatLocalDate(generatedAt, timeZone)}.${format}`;

export async function createExport(format: ExportFormat, data: DashboardData) {
  // El PDF se carga solo cuando se pide, para no inicializar react-pdf en CSV/Excel.
  const body = format === "csv" ? Buffer.from(buildCsv(data), "utf8") : format === "xlsx" ? await buildXlsx(data) : await (await import("./pdf/report")).buildPdf(data);
  return { body, contentType: CONTENT_TYPES[format], fileName: exportFileName(data.period, format, data.generatedAt, data.timeZone) };
}
