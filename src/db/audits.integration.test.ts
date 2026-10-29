import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import type { AnswerValue } from "@/config/scoring";
import { getDashboardData } from "@/lib/dashboard-data";
import { auditInput as input, TEST_DB_URL, useTestDb } from "@/test/test-db";
import { getAuditDetail, listStations, saveAudit } from "./audits";
import { auditAnswers, audits } from "./schema";

describe.skipIf(!TEST_DB_URL)("persistencia en PostgreSQL (DATABASE_URL_TEST)", () => {
  const t = useTestDb();

  it("guarda la evaluación y sus 15 respuestas, con puntos calculados en el servidor", async () => {
    // 2 Parcial + 1 No: 30 − 2 − 2 = 26 pts → 87%.
    const saved = await saveAudit(t.db, { ...input("Línea A", { q1: "parcial", q5: "parcial", q9: "no" }), score: 30, percentage: 100 });
    expect(saved.percentage).toBe(87);
    const [row] = await t.db.select().from(audits).where(eq(audits.id, saved.id));
    expect(row).toMatchObject({ station: "Línea A", score: 26, percentage: 87, comments: null });
    const answers = await t.db.select().from(auditAnswers).where(eq(auditAnswers.auditId, saved.id));
    expect(answers).toHaveLength(15);
    expect(answers.find((a) => a.questionId === "q9")?.value).toBe("no");
  });

  it("rechaza datos inválidos sin escribir nada", async () => {
    const incomplete = input("Línea A");
    delete incomplete.answers.q15;
    await expect(saveAudit(t.db, incomplete)).rejects.toThrow();
    await expect(saveAudit(t.db, { ...input("Línea A"), shift: "4to turno" })).rejects.toThrow();
    await expect(saveAudit(t.db, input("Línea A", { q1: "tal vez" as AnswerValue }))).rejects.toThrow();
    expect(await t.db.$count(audits)).toBe(0);
  });

  it("la base aplica los CHECK y la unicidad por pregunta", async () => {
    await expect(t.db.insert(audits).values({ operator: "Operador de prueba", station: "Línea A", shift: "1er turno", score: 31, percentage: 100 })).rejects.toThrow();
    const { id } = await saveAudit(t.db, input("Línea A"));
    await expect(t.db.insert(auditAnswers).values({ auditId: id, questionId: "q1", value: "no" })).rejects.toThrow();
    await t.db.delete(audits).where(eq(audits.id, id));
    expect(await t.db.$count(auditAnswers)).toBe(0);
  });

  it("con la base vacía el tablero devuelve ceros y listas vacías", async () => {
    const data = await getDashboardData("all", "America/Mexico_City", { db: t.db });
    expect(data).toMatchObject({ kpis: { evaluations: 0, average: null, stations: 0, success: 0, warning: 0, error: 0 }, stations: [], sections: [], failures: [], records: [] });
    expect(await listStations(t.db)).toEqual([]);
  });

  it("el tablero usa la última evaluación de cada estación", async () => {
    const older = await saveAudit(t.db, input("Línea A", { q1: "no", q2: "no", q3: "no", q4: "no", q5: "no" })); // 20/30 → 67%
    await t.db.update(audits).set({ createdAt: new Date(Date.now() - 3_600_000) }).where(eq(audits.id, older.id));
    await saveAudit(t.db, input("Línea A", { q1: "parcial" })); // 29/30 → 97%
    await saveAudit(t.db, input("Línea B", { q1: "no", q4: "parcial", q7: "no", q10: "no" })); // 23/30 → 77%
    const data = await getDashboardData("all", "America/Mexico_City", { db: t.db });
    expect(data.kpis).toMatchObject({ evaluations: 3, average: 80, stations: 2, success: 1, warning: 1, error: 0 }); // (67 + 97 + 77) / 3
    expect(data.stations.map((a) => [a.station, a.percentage, a.status])).toEqual(expect.arrayContaining([["Línea A", 97, "success"], ["Línea B", 77, "warning"]]));
    // 1S con la última evaluación: Línea A 5/6 = 83%, Línea B 4/6 = 67% → 75%.
    expect(data.sections.find((s) => s.id === "seiri")?.percentage).toBe(75);
    expect(data.failures[0]).toMatchObject({ questionId: "q1", code: "1S-1", no: 2, parcial: 1, total: 3, rate: 100, severity: "error" });
    expect(data.records).toHaveLength(3);
    expect(data.records[0].answers).toMatchObject({ q1: expect.any(String) });
  });

  it("respeta el periodo en la zona horaria de planta", async () => {
    const old = await saveAudit(t.db, input("Línea A", { q1: "no" }));
    await t.db.update(audits).set({ createdAt: new Date("2020-01-01T12:00:00Z") }).where(eq(audits.id, old.id));
    await saveAudit(t.db, input("Línea B"));
    const week = await getDashboardData("7d", "America/Mexico_City", { db: t.db });
    expect(week.stations.map((a) => a.station)).toEqual(["Línea B"]);
    expect(week.failures).toEqual([]);
    expect(week.records).toHaveLength(1);
    expect((await getDashboardData("all", "America/Mexico_City", { db: t.db })).records).toHaveLength(2);
  });

  it("devuelve el detalle con sus respuestas", async () => {
    const { id } = await saveAudit(t.db, input("Línea A", { q3: "parcial", q12: "no" }));
    const detail = await getAuditDetail(t.db, id);
    expect(detail).toMatchObject({ station: "Línea A", percentage: 90 });
    expect(detail?.answers).toMatchObject({ q1: "si", q3: "parcial", q12: "no" });
    expect(await getAuditDetail(t.db, "no-es-un-uuid")).toBeNull();
    expect(await getAuditDetail(t.db, "00000000-0000-4000-8000-000000000000")).toBeNull();
  });
});
