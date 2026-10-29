import { eq, sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { questions } from "@/config/checklist";
import type { AnswerValue } from "@/config/scoring";
import { getAuditDetail, getDashboard, getExportRows, listStations, saveAudit, type AuditInput } from "./audits";
import { createDb, type Db } from "./client";
import { auditAnswers, audits } from "./schema";

const url = process.env.DATABASE_URL_TEST;
if (url && url === process.env.DATABASE_URL) throw new Error("DATABASE_URL_TEST no puede ser la misma base que DATABASE_URL: las pruebas vacían las tablas.");

/** Respuestas con `si` salvo las indicadas. */
const answersWith = (overrides: Record<string, AnswerValue> = {}) => Object.fromEntries(questions.map((q) => [q.id, overrides[q.id] ?? "si"])) as Record<string, AnswerValue>;
const input = (station: string, overrides: Record<string, AnswerValue> = {}): AuditInput => ({ operator: "Operador de prueba", station, shift: "1er turno", comments: "", answers: answersWith(overrides) });

describe.skipIf(!url)("persistencia en PostgreSQL (DATABASE_URL_TEST)", () => {
  let connection: ReturnType<typeof createDb>;
  let db: Db;
  beforeAll(async () => {
    connection = createDb(url!);
    db = connection.db;
    await migrate(db, { migrationsFolder: "./drizzle" });
  });
  afterEach(async () => { await db.execute(sql`TRUNCATE ${audits}, ${auditAnswers} CASCADE`); });
  afterAll(async () => { await connection?.client.end(); });

  it("guarda la evaluación y sus 15 respuestas, con puntos calculados en el servidor", async () => {
    // 2 Parcial + 1 No: 30 − 2 − 2 = 26 pts → 87%.
    const saved = await saveAudit(db, { ...input("Línea A", { q1: "parcial", q5: "parcial", q9: "no" }), score: 30, percentage: 100 });
    expect(saved.percentage).toBe(87);
    const [row] = await db.select().from(audits).where(eq(audits.id, saved.id));
    expect(row).toMatchObject({ station: "Línea A", score: 26, percentage: 87, comments: null });
    const answers = await db.select().from(auditAnswers).where(eq(auditAnswers.auditId, saved.id));
    expect(answers).toHaveLength(15);
    expect(answers.find((a) => a.questionId === "q9")?.value).toBe("no");
  });

  it("rechaza datos inválidos sin escribir nada", async () => {
    const incomplete = input("Línea A");
    delete incomplete.answers.q15;
    await expect(saveAudit(db, incomplete)).rejects.toThrow();
    await expect(saveAudit(db, { ...input("Línea A"), shift: "4to turno" })).rejects.toThrow();
    await expect(saveAudit(db, input("Línea A", { q1: "tal vez" as AnswerValue }))).rejects.toThrow();
    expect(await db.$count(audits)).toBe(0);
  });

  it("la base aplica los CHECK y la unicidad por pregunta", async () => {
    await expect(db.insert(audits).values({ operator: "Operador de prueba", station: "Línea A", shift: "1er turno", score: 31, percentage: 100 })).rejects.toThrow();
    const { id } = await saveAudit(db, input("Línea A"));
    await expect(db.insert(auditAnswers).values({ auditId: id, questionId: "q1", value: "no" })).rejects.toThrow();
    await db.delete(audits).where(eq(audits.id, id));
    expect(await db.$count(auditAnswers)).toBe(0);
  });

  it("con la base vacía el tablero devuelve ceros y listas vacías", async () => {
    const data = await getDashboard(db, null);
    expect(data).toMatchObject({ evaluations: 0, average: null, latest: [], sections: [], failures: [], recent: [], stationStatus: { success: 0, warning: 0, error: 0 } });
    expect(await listStations(db)).toEqual([]);
  });

  it("el tablero usa la última evaluación de cada estación", async () => {
    const older = await saveAudit(db, input("Línea A", { q1: "no", q2: "no", q3: "no", q4: "no", q5: "no" })); // 20/30 → 67%
    await db.update(audits).set({ createdAt: new Date(Date.now() - 3_600_000) }).where(eq(audits.id, older.id));
    await saveAudit(db, input("Línea A", { q1: "parcial" })); // 29/30 → 97%
    await saveAudit(db, input("Línea B", { q1: "no", q4: "parcial", q7: "no", q10: "no" })); // 23/30 → 77%
    const data = await getDashboard(db, null);
    expect(data.evaluations).toBe(3);
    expect(data.average).toBe(80); // (67 + 97 + 77) / 3
    expect(data.latest.map((a) => [a.station, a.percentage])).toEqual(expect.arrayContaining([["Línea A", 97], ["Línea B", 77]]));
    expect(data.latest).toHaveLength(2);
    expect(data.stationStatus).toEqual({ success: 1, warning: 1, error: 0 });
    // 1S con la última evaluación: Línea A 5/6 = 83%, Línea B 4/6 = 67% → 75%.
    expect(data.sections.find((s) => s.id === "seiri")?.percentage).toBe(75);
    expect(data.failures[0]).toMatchObject({ questionId: "q1", no: 2, parcial: 1 });
    expect(data.recent).toHaveLength(3);
  });

  it("respeta el inicio del periodo", async () => {
    const old = await saveAudit(db, input("Línea A", { q1: "no" }));
    await db.update(audits).set({ createdAt: new Date("2020-01-01T12:00:00Z") }).where(eq(audits.id, old.id));
    await saveAudit(db, input("Línea B"));
    const recent = await getDashboard(db, new Date("2021-01-01T00:00:00Z"));
    expect(recent.latest.map((a) => a.station)).toEqual(["Línea B"]);
    expect(recent.failures).toEqual([]);
    expect((await getExportRows(db, new Date("2021-01-01T00:00:00Z"))).map((r) => r.station)).toEqual(["Línea B"]);
    expect(await getExportRows(db, null)).toHaveLength(2);
  });

  it("devuelve el detalle con sus respuestas", async () => {
    const { id } = await saveAudit(db, input("Línea A", { q3: "parcial", q12: "no" }));
    const detail = await getAuditDetail(db, id);
    expect(detail).toMatchObject({ station: "Línea A", percentage: 90 });
    expect(detail?.answers).toMatchObject({ q1: "si", q3: "parcial", q12: "no" });
    expect(await getAuditDetail(db, "no-es-un-uuid")).toBeNull();
    expect(await getAuditDetail(db, "00000000-0000-4000-8000-000000000000")).toBeNull();
  });
});
