import { eq } from "drizzle-orm";
import { z } from "zod";
import { questions } from "@/config/checklist";
import { ANSWER_VALUES, SHIFTS } from "@/config/scoring";
import { scoreAudit, type Answers } from "@/lib/scoring";
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

/** Evaluación con sus respuestas, o `null` si el id no existe o no es válido. */
export async function getAuditDetail(db: Db, id: string) {
  if (!z.uuid().safeParse(id).success) return null;
  const [audit] = await db.select().from(audits).where(eq(audits.id, id));
  if (!audit) return null;
  const answers: Answers = {};
  for (const row of await db.select().from(auditAnswers).where(eq(auditAnswers.auditId, id))) answers[row.questionId] = row.value;
  return { ...audit, answers };
}
