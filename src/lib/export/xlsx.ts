import ExcelJS from "exceljs";
import { questions } from "@/config/checklist";
import { ANSWER_LABELS, STATUS_META, STATUS_THRESHOLDS, type AnswerValue, type AuditStatus } from "@/config/scoring";
import type { DashboardData } from "@/lib/dashboard-data";
import { localWallClock } from "@/lib/period";
import { questionHeader } from "./csv";
import { argb, statusColors, SYSTEM_NAME, theme } from "./theme";

export const SHEETS = ["Resumen", "Semáforo por estación", "Puntos que más fallan", "Promedio por S", "Registros"] as const;
export const EMPTY_MESSAGE = "Aún no hay check-lists en este periodo";

const PERCENT = "0%";
const DATE_TIME = "yyyy-mm-dd hh:mm";
const thin = { style: "thin" as const, color: { argb: argb(theme.gray) } };
const border = { top: thin, left: thin, bottom: thin, right: thin };
const answerStatus: Record<AnswerValue, AuditStatus> = { si: "success", parcial: "warning", no: "error" };

type Column = { header: string; width?: number; numFmt?: string; wrap?: boolean };
type Cell = string | number | Date | null;

const fill = (hex: string): ExcelJS.Fill => ({ type: "pattern", pattern: "solid", fgColor: { argb: argb(hex) } });

function paintStatus(cell: ExcelJS.Cell, status: AuditStatus) {
  cell.fill = fill(statusColors[status].bg);
  cell.font = { bold: true, color: { argb: argb(statusColors[status].ink) } };
}

function styleHeader(row: ExcelJS.Row) {
  row.eachCell((cell) => {
    cell.fill = fill(theme.navy);
    cell.font = { bold: true, color: { argb: argb(theme.white) } };
    cell.border = border;
    cell.alignment = { vertical: "middle", wrapText: true };
  });
  row.height = 30;
}

/** Tabla con encabezado navy, bordes gray y ancho de columna según el contenido. Devuelve las filas de datos. */
function addTable(ws: ExcelJS.Worksheet, startRow: number, columns: Column[], rows: Cell[][], options: { filter?: boolean } = {}) {
  columns.forEach((column, i) => (ws.getRow(startRow).getCell(i + 1).value = column.header));
  styleHeader(ws.getRow(startRow));
  const dataRows = rows.map((values, r) => {
    const row = ws.getRow(startRow + 1 + r);
    values.forEach((value, i) => {
      const cell = row.getCell(i + 1);
      cell.value = value;
      cell.border = border;
      cell.alignment = { vertical: "top", wrapText: columns[i].wrap ?? false };
      if (columns[i].numFmt && value !== null && typeof value !== "string") cell.numFmt = columns[i].numFmt!;
    });
    return row;
  });
  if (!rows.length) {
    const cell = ws.getRow(startRow + 1).getCell(1);
    cell.value = EMPTY_MESSAGE;
    cell.font = { italic: true, color: { argb: argb(theme.muted) } };
  }
  columns.forEach((column, i) => {
    const longest = Math.max(column.header.length * (column.wrap ? 0.6 : 1), ...rows.map((values) => (values[i] instanceof Date ? 16 : String(values[i] ?? "").length)));
    const current = ws.getColumn(i + 1).width ?? 0;
    ws.getColumn(i + 1).width = Math.max(current, column.width ?? Math.min(48, Math.max(10, Math.ceil(longest) + 2)));
  });
  if (options.filter) ws.autoFilter = { from: { row: startRow, column: 1 }, to: { row: startRow + Math.max(rows.length, 1), column: columns.length } };
  return dataRows;
}

const sheet = (wb: ExcelJS.Workbook, name: string) => wb.addWorksheet(name, { views: [{ state: "frozen", ySplit: 1 }], properties: { defaultRowHeight: 18 } });

export async function buildXlsx(data: DashboardData) {
  const wb = new ExcelJS.Workbook();
  wb.creator = SYSTEM_NAME;
  wb.created = data.generatedAt;
  const local = (date: Date) => localWallClock(date, data.timeZone);
  const pct = (value: number | null) => (value === null ? "—" : value / 100);

  // 1. Resumen
  const summary = sheet(wb, SHEETS[0]);
  summary.getCell("A1").value = SYSTEM_NAME;
  summary.getCell("A1").font = { bold: true, size: 16, color: { argb: argb(theme.navy) } };
  summary.getRow(1).height = 28;
  const meta: [string, Cell, string?][] = [["Periodo", data.periodLabel], ["Generado", local(data.generatedAt), DATE_TIME], ["Zona horaria", data.timeZone]];
  meta.forEach(([label, value, numFmt], i) => {
    const row = summary.getRow(2 + i);
    row.getCell(1).value = label;
    row.getCell(1).font = { bold: true, color: { argb: argb(theme.muted) } };
    row.getCell(2).value = value;
    row.getCell(2).alignment = { horizontal: "left" };
    if (numFmt) row.getCell(2).numFmt = numFmt;
  });
  const kpis = addTable(summary, 6, [{ header: "Indicador", width: 26 }, { header: "Valor", width: 30 }], [
    ["Promedio general", pct(data.kpis.average)],
    ["Estaciones evaluadas", data.kpis.stations],
    ["Cumplen", data.kpis.success],
    ["A mejorar", data.kpis.warning],
    ["Críticas", data.kpis.error],
  ]);
  kpis.forEach((row) => (row.getCell(2).alignment = { horizontal: "right" }));
  // Solo el promedio es porcentaje; los demás KPI son conteos de estaciones.
  if (data.kpis.average !== null) kpis[0].getCell(2).numFmt = PERCENT;
  const legend = addTable(summary, 13, [{ header: "Semáforo" }, { header: "Rango" }], [
    [STATUS_META.success.label, `≥ ${STATUS_THRESHOLDS.success}%`],
    [STATUS_META.warning.label, `${STATUS_THRESHOLDS.warning}–${STATUS_THRESHOLDS.success - 1}%`],
    [STATUS_META.error.label, `< ${STATUS_THRESHOLDS.warning}%`],
  ]);
  (["success", "warning", "error"] as const).forEach((status, i) => paintStatus(legend[i].getCell(1), status));

  // 2. Semáforo por estación
  const stations = sheet(wb, SHEETS[1]);
  addTable(stations, 1, [{ header: "Estación" }, { header: "Última evaluación", width: 18, numFmt: DATE_TIME }, { header: "Operador" }, { header: "Turno" }, { header: "Porcentaje", width: 12, numFmt: PERCENT }, { header: "Semáforo", width: 12 }],
    data.stations.map((row) => [row.station, local(row.createdAt), row.operator, row.shift, row.percentage / 100, STATUS_META[row.status].label]), { filter: true })
    .forEach((row, i) => paintStatus(row.getCell(6), data.stations[i].status));

  // 3. Puntos que más fallan
  const failures = sheet(wb, SHEETS[2]);
  addTable(failures, 1, [{ header: "Pregunta", width: 60, wrap: true }, { header: "S", width: 6 }, { header: "Nº de \"No\"", width: 10 }, { header: "Nº de \"Parcial\"", width: 12 }, { header: "Total", width: 8 }, { header: "% de incumplimiento", width: 16, numFmt: PERCENT }],
    data.failures.map((row) => [`${row.code} ${row.text}`, row.section, row.no, row.parcial, row.total, row.rate / 100]))
    .forEach((row, i) => paintStatus(row.getCell(5), data.failures[i].severity));

  // 4. Promedio por S
  const sections = sheet(wb, SHEETS[3]);
  addTable(sections, 1, [{ header: "S", width: 6 }, { header: "Nombre" }, { header: "Término japonés" }, { header: "Porcentaje promedio", width: 18, numFmt: PERCENT }],
    data.sections.map((row) => [`${row.number}S`, row.name, row.japanese, row.percentage / 100]));

  // 5. Registros
  const records = sheet(wb, SHEETS[4]);
  addTable(records, 1, [{ header: "Fecha", width: 17, numFmt: DATE_TIME }, { header: "Estación" }, { header: "Operador" }, { header: "Turno" }, { header: "Porcentaje", width: 12, numFmt: PERCENT }, { header: "Semáforo", width: 12 }, { header: "Comentarios", width: 40, wrap: true }, ...questions.map((q) => ({ header: questionHeader(q), width: 14, wrap: true }))],
    data.records.map((row) => [local(row.createdAt), row.station, row.operator, row.shift, row.percentage / 100, STATUS_META[row.status].label, row.comments, ...questions.map((q) => (row.answers[q.id] ? ANSWER_LABELS[row.answers[q.id]] : null))]), { filter: true })
    .forEach((row, i) => {
      const record = data.records[i];
      paintStatus(row.getCell(6), record.status);
      questions.forEach((q, n) => { const answer = record.answers[q.id]; if (answer) paintStatus(row.getCell(8 + n), answerStatus[answer]); });
    });
  records.getRow(1).height = 45;

  return Buffer.from(await wb.xlsx.writeBuffer());
}
