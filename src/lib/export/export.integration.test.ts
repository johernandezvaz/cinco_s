import { eq } from "drizzle-orm";
import ExcelJS from "exceljs";
import { describe, expect, it } from "vitest";
import { audits } from "@/db/schema";
import { saveAudit } from "@/db/audits";
import { getDashboardData } from "@/lib/dashboard-data";
import { auditInput, TEST_DB_URL, useTestDb } from "@/test/test-db";
import { createExport, type ExportFormat } from "./index";
import { SHEETS } from "./xlsx";

const TZ = "America/Mexico_City";
const pdfPages = (pdf: Buffer) => pdf.toString("latin1").match(/\/Type\s*\/Page(?![s\w])/g)?.length ?? 0;

async function readXlsx(buffer: Buffer) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer as unknown as ArrayBuffer);
  return wb;
}
/** Filas de datos de una hoja con encabezado en la fila 1 (ignora el mensaje de estado vacío). */
const dataRows = (ws: ExcelJS.Worksheet) => ws.getRows(2, Math.max(ws.rowCount - 1, 1))!.filter((row) => row.getCell(1).value !== null && !String(row.getCell(1).value).startsWith("Aún no hay"));

describe.skipIf(!TEST_DB_URL)("exportaciones contra PostgreSQL (DATABASE_URL_TEST)", () => {
  const t = useTestDb();

  it.each(["csv", "xlsx", "pdf"] as ExportFormat[])("con la base vacía genera %s válido", async (format) => {
    const data = await getDashboardData("7d", TZ, { db: t.db });
    const file = await createExport(format, data);
    expect(file.fileName).toMatch(new RegExp(`^auditoria-5s_7d_\\d{4}-\\d{2}-\\d{2}\\.${format}$`));
    if (format === "csv") expect(file.body.toString("utf8").replace(/^﻿/, "").trim().split("\r\n")).toHaveLength(1);
    if (format === "pdf") { expect(file.body.subarray(0, 4).toString()).toBe("%PDF"); expect(pdfPages(file.body)).toBeGreaterThanOrEqual(1); }
    if (format === "xlsx") expect((await readXlsx(file.body)).worksheets.map((ws) => ws.name)).toEqual([...SHEETS]);
  });

  it("Excel, CSV y PDF coinciden con getDashboardData", async () => {
    await saveAudit(t.db, auditInput("Línea A", { q1: "parcial", q4: "no", q7: "parcial", q10: "no", q13: "parcial" })); // 23/30 → 77%
    await saveAudit(t.db, auditInput("Línea B", { q2: "no", q8: "parcial" }, { comments: "Revisar fuga, línea 2" })); // 27/30 → 90%
    await saveAudit(t.db, auditInput("Línea C", { q1: "no", q2: "no", q3: "no", q4: "no", q5: "no", q6: "no" })); // 18/30 → 60%
    const data = await getDashboardData("7d", TZ, { db: t.db });

    const wb = await readXlsx((await createExport("xlsx", data)).body);
    expect(wb.worksheets.map((ws) => ws.name)).toEqual([...SHEETS]);

    const summary = wb.getWorksheet("Resumen")!;
    const kpi = (label: string) => summary.getColumn(1).values.findIndex((v) => v === label);
    expect(summary.getRow(kpi("Promedio general")).getCell(2).value).toBeCloseTo(data.kpis.average! / 100);
    expect(summary.getRow(kpi("Promedio general")).getCell(2).numFmt).toBe("0%");
    expect(summary.getRow(kpi("Estaciones evaluadas")).getCell(2).value).toBe(3);
    ["Estaciones evaluadas", "Cumplen", "A mejorar", "Críticas"].forEach((label) => expect(summary.getRow(kpi(label)).getCell(2).numFmt ?? "General").not.toContain("%"));
    expect(summary.getRow(kpi("Cumplen")).getCell(2).value).toBe(data.kpis.success);
    expect(summary.getRow(kpi("A mejorar")).getCell(2).value).toBe(data.kpis.warning);
    expect(summary.getRow(kpi("Críticas")).getCell(2).value).toBe(data.kpis.error);

    const stations = wb.getWorksheet("Semáforo por estación")!;
    const stationRows = dataRows(stations);
    expect(stationRows.map((row) => [row.getCell(1).value, row.getCell(5).value, row.getCell(6).value])).toEqual(data.stations.map((s) => [s.station, s.percentage / 100, { success: "Cumple", warning: "Mejorar", error: "Crítico" }[s.status]]));
    expect(stationRows[0].getCell(5).numFmt).toBe("0%");
    expect(stationRows[0].getCell(2).value).toBeInstanceOf(Date);
    expect(stations.autoFilter).toBeTruthy();
    expect(stations.views[0]).toMatchObject({ state: "frozen", ySplit: 1 });

    const sections = dataRows(wb.getWorksheet("Promedio por S")!);
    expect(sections.map((row) => row.getCell(4).value)).toEqual(data.sections.map((s) => s.percentage / 100));

    const failures = dataRows(wb.getWorksheet("Puntos que más fallan")!);
    expect(failures.map((row) => [row.getCell(3).value, row.getCell(4).value, row.getCell(5).value])).toEqual(data.failures.map((f) => [f.no, f.parcial, f.total]));

    const records = wb.getWorksheet("Registros")!;
    expect(dataRows(records)).toHaveLength(data.records.length);
    expect(records.autoFilter).toBeTruthy();
    expect(typeof dataRows(records)[0].getCell(5).value).toBe("number");

    const csv = (await createExport("csv", data)).body.toString("utf8");
    expect(csv.trim().split("\r\n")).toHaveLength(data.records.length + 1);
    data.records.forEach((r) => expect(csv).toContain(`"${r.station}","Operador de prueba","1er turno",${r.percentage},`));

    const pdf = (await createExport("pdf", data)).body;
    expect(pdf.subarray(0, 4).toString()).toBe("%PDF");
    expect(pdfPages(pdf)).toBeGreaterThanOrEqual(2);
  }, 30_000);

  it("los tres formatos respetan el periodo", async () => {
    for (let i = 0; i < 70; i++) {
      const { id } = await saveAudit(t.db, auditInput(`Antigua ${i}`, { q1: "no" }));
      await t.db.update(audits).set({ createdAt: new Date("2020-01-01T12:00:00Z") }).where(eq(audits.id, id));
    }
    await saveAudit(t.db, auditInput("Reciente"));
    const week = await getDashboardData("7d", TZ, { db: t.db });
    const all = await getDashboardData("all", TZ, { db: t.db });

    const csvLines = async (data: typeof week) => (await createExport("csv", data)).body.toString("utf8").trim().split("\r\n").length - 1;
    expect(await csvLines(week)).toBe(1);
    expect(await csvLines(all)).toBe(71);

    const xlsxRecords = async (data: typeof week) => dataRows((await readXlsx((await createExport("xlsx", data)).body)).getWorksheet("Registros")!).length;
    expect(await xlsxRecords(week)).toBe(1);
    expect(await xlsxRecords(all)).toBe(71);

    // 71 estaciones y 71 registros obligan a paginar; una sola cabe en menos páginas.
    expect(pdfPages((await createExport("pdf", all)).body)).toBeGreaterThan(pdfPages((await createExport("pdf", week)).body));
  }, 60_000);
});
