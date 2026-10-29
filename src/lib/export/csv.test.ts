import { describe, expect, it } from "vitest";
import type { DashboardData } from "@/lib/dashboard-data";
import { BOM, buildCsv, csvCell, csvLine, neutralizeFormula } from "./csv";

describe("CSV", () => {
  it("escapa comillas, comas y saltos de línea dentro de comillas", () => {
    expect(csvCell('Dijo "hola"')).toBe('"Dijo ""hola"""');
    expect(csvCell("Ensamble, línea 3")).toBe('"Ensamble, línea 3"');
    expect(csvCell("primera\nsegunda")).toBe('"primera\nsegunda"');
    expect(csvCell(null)).toBe('""');
    expect(csvCell(87)).toBe("87");
    expect(csvLine(["a,b", 'c"d'])).toBe('"a,b","c""d"');
  });

  it.each(["=SUMA(A1)", "+1", "-1", "@cmd", "\tx", "\rx"])("neutraliza fórmulas: %j", (value) => {
    expect(neutralizeFormula(value)).toBe(`'${value}`);
    expect(csvCell(value).startsWith(`"'`)).toBe(true);
  });

  it("no altera texto normal", () => expect(neutralizeFormula("Línea 1")).toBe("Línea 1"));

  it("lleva BOM, CRLF y una fila por registro", () => {
    const createdAt = new Date("2026-10-29T18:05:00Z");
    const record = { id: "x", station: '=HYPERLINK("x")', operator: "Ana, López", shift: "1er turno", comments: "línea 1\nlínea 2", score: 26, percentage: 87, createdAt, status: "success", answers: { q1: "si", q2: "parcial", q3: "no" } };
    const csv = buildCsv({ timeZone: "America/Mexico_City", records: [record] } as unknown as DashboardData);
    expect(csv.startsWith(BOM)).toBe(true);
    const lines = csv.slice(1).split("\r\n");
    expect(lines.at(-1)).toBe("");
    expect(lines[0]).toContain('"1S-1 Solo lo necesario"');
    expect(lines[0]).not.toMatch(/punt/i);
    expect(lines[1]).toContain('"2026-10-29 12:05","\'=HYPERLINK(""x"")","Ana, López","1er turno",87,"Cumple","línea 1\nlínea 2","Sí","Parcial","No"');
  });
});
