import { and, desc, eq, gte, inArray, ne, sql } from "drizzle-orm";
import { questions } from "@/config/checklist";
import { TIME_ZONE } from "@/config/scoring";
import type { Db } from "@/db/client";
import { auditAnswers, audits } from "@/db/schema";
import { periodLabel, periodStart, type Period } from "@/lib/period";
import { average, sectionAverages, statusFor, toPercentage, type Answers } from "@/lib/scoring";

export const TOP_FAILURES = 5;

async function answersByAudit(db: Db, ids: string[]) {
  const map = new Map<string, Answers>(ids.map((id) => [id, {}]));
  // Por lotes para no exceder el límite de parámetros de PostgreSQL con periodos largos.
  for (let i = 0; i < ids.length; i += 5000) {
    for (const row of await db.select().from(auditAnswers).where(inArray(auditAnswers.auditId, ids.slice(i, i + 5000)))) map.get(row.auditId)![row.questionId] = row.value;
  }
  return map;
}

/**
 * Fuente única del tablero y de los exportadores (CSV, Excel, PDF).
 * Semáforo, KPI de estaciones y promedio por S usan la última evaluación de cada estación en el periodo;
 * el promedio general y los puntos que más fallan usan todas las evaluaciones del periodo.
 * `withAnswers: false` omite las respuestas de cada registro (el tablero no las necesita).
 */
export async function getDashboardData(period: Period, timeZone: string = TIME_ZONE, options: { db?: Db; now?: Date; withAnswers?: boolean } = {}) {
  const db = options.db ?? (await import("@/db")).db;
  const now = options.now ?? new Date();
  const start = periodStart(period, now, timeZone);
  const where = start ? gte(audits.createdAt, start) : undefined;

  const rows = await db.select().from(audits).where(where).orderBy(desc(audits.createdAt), audits.station);
  const records = rows.map((row) => ({ ...row, status: statusFor(row.percentage) }));

  // Última evaluación por estación: los registros ya vienen del más reciente al más antiguo.
  const seen = new Set<string>();
  const stations = records.filter((row) => !seen.has(row.station) && seen.add(row.station));

  const needed = options.withAnswers === false ? stations : records;
  const answers = await answersByAudit(db, needed.map((row) => row.id));

  const failureRows = await db.select({ questionId: auditAnswers.questionId, no: sql<number>`count(*) filter (where ${auditAnswers.value} = 'no')::int`, parcial: sql<number>`count(*) filter (where ${auditAnswers.value} = 'parcial')::int` })
    .from(auditAnswers).innerJoin(audits, eq(audits.id, auditAnswers.auditId)).where(and(where, ne(auditAnswers.value, "si"))).groupBy(auditAnswers.questionId);
  const failures = failureRows.flatMap((row) => {
    const question = questions.find((q) => q.id === row.questionId);
    if (!question) return [];
    const total = row.no + row.parcial;
    // Severidad: crítico si hay al menos tantos "No" como "Parcial".
    const severity: "error" | "warning" = row.no >= row.parcial ? "error" : "warning";
    return [{ questionId: row.questionId, code: question.code, short: question.short, text: question.text, section: question.section, no: row.no, parcial: row.parcial, total, rate: toPercentage(total, records.length), severity }];
  }).sort((a, b) => b.total - a.total || b.no - a.no || questions.findIndex((q) => q.id === a.questionId) - questions.findIndex((q) => q.id === b.questionId)).slice(0, TOP_FAILURES);

  return {
    period,
    periodLabel: periodLabel(period),
    timeZone,
    start,
    generatedAt: now,
    kpis: {
      average: average(records.map((row) => row.percentage)),
      evaluations: records.length,
      stations: stations.length,
      success: stations.filter((row) => row.status === "success").length,
      warning: stations.filter((row) => row.status === "warning").length,
      error: stations.filter((row) => row.status === "error").length,
    },
    stations,
    failures,
    sections: stations.length ? sectionAverages(stations.map((row) => answers.get(row.id)!)) : [],
    records: records.map((row) => ({ ...row, answers: answers.get(row.id) ?? {} })),
  };
}

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;
