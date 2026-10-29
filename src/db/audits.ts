import { and, count, desc, eq, gte, inArray, ne, sql, type SQL } from "drizzle-orm";
import { z } from "zod";
import { questions } from "@/config/checklist";
import { ANSWER_VALUES, SHIFTS, type AnswerValue } from "@/config/scoring";
import { scoreAudit, sectionAverages, statusFor, type Answers } from "@/lib/scoring";
import type { Db } from "./client";
import { auditAnswers, audits } from "./schema";

const questionIds = new Set(questions.map((question) => question.id));

export const auditInputSchema = z.object({
  operator: z.string().trim().min(3, "El nombre del operador debe tener al menos 3 caracteres.").max(120),
  station: z.string().trim().min(2, "La estación debe tener al menos 2 caracteres.").max(120),
  shift: z.enum(SHIFTS, "Selecciona un turno válido."),
  comments: z.string().trim().max(1000, "Los comentarios no pueden pasar de 1000 caracteres.").optional().transform((value) => value || null),
  answers: z.record(z.string(), z.enum(ANSWER_VALUES)).refine((answers) => Object.keys(answers).length === questionIds.size && Object.keys(answers).every((id) => questionIds.has(id)), `Contesta las ${questionIds.size} preguntas.`),
});
export type AuditInput = z.input<typeof auditInputSchema>;

/** Valida y guarda una evaluación con sus respuestas en una sola transacción. Puntos y porcentaje se calculan aquí. */
export async function saveAudit(db: Db, input: unknown) {
  const data = auditInputSchema.parse(input);
  const { score, percentage } = scoreAudit(data.answers);
  return db.transaction(async (tx) => {
    const [audit] = await tx.insert(audits).values({ operator: data.operator, station: data.station, shift: data.shift, comments: data.comments, score, percentage }).returning({ id: audits.id });
    await tx.insert(auditAnswers).values(questions.map((question) => ({ auditId: audit.id, questionId: question.id, value: data.answers[question.id] })));
    return { id: audit.id, percentage };
  });
}

export async function listStations(db: Db) {
  return (await db.selectDistinct({ station: audits.station }).from(audits).orderBy(audits.station)).map((row) => row.station);
}

async function answersByAudit(db: Db, ids: string[]) {
  const map = new Map<string, Answers>(ids.map((id) => [id, {}]));
  if (!ids.length) return map;
  for (const row of await db.select().from(auditAnswers).where(inArray(auditAnswers.auditId, ids))) map.get(row.auditId)![row.questionId] = row.value;
  return map;
}

const since = (start: Date | null): SQL | undefined => (start ? gte(audits.createdAt, start) : undefined);

/** Datos del tablero para el periodo que inicia en `start` (`null` = todo el historial). */
export async function getDashboard(db: Db, start: Date | null) {
  const where = since(start);
  const [totals] = await db.select({ evaluations: count(), average: sql<number | null>`round(avg(${audits.percentage}))::int` }).from(audits).where(where);
  // Última evaluación de cada estación dentro del periodo (usa el índice station, created_at DESC).
  const latest = (await db.selectDistinctOn([audits.station]).from(audits).where(where).orderBy(audits.station, desc(audits.createdAt))).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  const latestAnswers = await answersByAudit(db, latest.map((audit) => audit.id));
  const failures = await db.select({ questionId: auditAnswers.questionId, no: sql<number>`count(*) filter (where ${auditAnswers.value} = 'no')::int`, parcial: sql<number>`count(*) filter (where ${auditAnswers.value} = 'parcial')::int` })
    .from(auditAnswers).innerJoin(audits, eq(audits.id, auditAnswers.auditId)).where(and(where, ne(auditAnswers.value, "si"))).groupBy(auditAnswers.questionId);
  const recent = await db.select().from(audits).where(where).orderBy(desc(audits.createdAt)).limit(20);
  const stationStatus = { success: 0, warning: 0, error: 0 };
  latest.forEach((audit) => stationStatus[statusFor(audit.percentage)]++);
  return {
    evaluations: totals.evaluations,
    average: totals.average,
    latest,
    stationStatus,
    sections: latest.length ? sectionAverages([...latestAnswers.values()]) : [],
    failures: failures.map((row) => ({ ...row, question: questions.find((q) => q.id === row.questionId)! })).filter((row) => row.question)
      .sort((a, b) => b.no + b.parcial - (a.no + a.parcial) || b.no - a.no).slice(0, 5),
    recent,
  };
}

/** Evaluación con sus respuestas, o `null` si el id no existe o no es válido. */
export async function getAuditDetail(db: Db, id: string) {
  if (!z.uuid().safeParse(id).success) return null;
  const [audit] = await db.select().from(audits).where(eq(audits.id, id));
  if (!audit) return null;
  return { ...audit, answers: (await answersByAudit(db, [id])).get(id)! };
}

/** Evaluaciones del periodo con sus 15 respuestas, más recientes primero. */
export async function getExportRows(db: Db, start: Date | null) {
  const rows = await db.select().from(audits).where(since(start)).orderBy(desc(audits.createdAt));
  const answers = await answersByAudit(db, rows.map((row) => row.id));
  return rows.map((row) => ({ ...row, answers: answers.get(row.id)! as Partial<Record<string, AnswerValue>> }));
}
