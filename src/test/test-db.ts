import { sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { afterAll, afterEach, beforeAll } from "vitest";
import { questions } from "@/config/checklist";
import type { AnswerValue } from "@/config/scoring";
import type { AuditInput } from "@/db/audits";
import { createDb, type Db } from "@/db/client";
import { auditAnswers, audits } from "@/db/schema";

export const TEST_DB_URL = process.env.DATABASE_URL_TEST;
if (TEST_DB_URL && TEST_DB_URL === process.env.DATABASE_URL) throw new Error("DATABASE_URL_TEST no puede ser la misma base que DATABASE_URL: las pruebas vacían las tablas.");

/** Conecta a DATABASE_URL_TEST, aplica migraciones y vacía las tablas después de cada prueba. */
export function useTestDb() {
  let connection: ReturnType<typeof createDb> | undefined;
  const handle = { get db(): Db { return connection!.db; } };
  beforeAll(async () => {
    connection = createDb(TEST_DB_URL!);
    await migrate(connection.db, { migrationsFolder: "./drizzle" });
  });
  afterEach(async () => { await connection!.db.execute(sql`TRUNCATE ${audits}, ${auditAnswers} CASCADE`); });
  afterAll(async () => { await connection?.client.end(); });
  return handle;
}

/** Respuestas con `si` salvo las indicadas. */
export const answersWith = (overrides: Record<string, AnswerValue> = {}) => Object.fromEntries(questions.map((q) => [q.id, overrides[q.id] ?? "si"])) as Record<string, AnswerValue>;

/** Captura de prueba creada por cada test (no hay datos compartidos). */
export const auditInput = (station: string, overrides: Record<string, AnswerValue> = {}, extra: Partial<AuditInput> = {}): AuditInput => ({ operator: "Operador de prueba", station, shift: "1er turno", comments: "", answers: answersWith(overrides), ...extra });
