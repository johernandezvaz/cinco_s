"use server";
import { z } from "zod";
import { db } from "@/db";
import { auditAnswers, audits } from "@/db/schema";
import { questions } from "@/config/checklist";
import { percentageFromValues } from "@/lib/score";
import { revalidatePath } from "next/cache";

const payloadSchema = z.object({ operator: z.string().trim().min(3).max(120), station: z.string().trim().min(2).max(120), shift: z.enum(["1er turno", "2do turno", "3er turno"]), comments: z.string().trim().max(1000).optional(), answers: z.array(z.object({ questionId: z.string(), value: z.union([z.literal(0), z.literal(1), z.literal(2)]) })).length(questions.length) });
export async function submitAudit(input: unknown) {
  const data = payloadSchema.parse(input);
  const ids = new Set(data.answers.map((answer) => answer.questionId));
  if (ids.size !== questions.length || questions.some((question) => !ids.has(question.id))) throw new Error("Faltan respuestas válidas.");
  const score = data.answers.reduce((sum, answer) => sum + answer.value, 0);
  const percentage = percentageFromValues(data.answers.map((answer) => answer.value));
  const [audit] = await db.insert(audits).values({ operator: data.operator, station: data.station, shift: data.shift, comments: data.comments || null, score, percentage, createdAt: new Date() }).returning();
  await db.insert(auditAnswers).values(data.answers.map((answer) => ({ auditId: audit.id, questionId: answer.questionId, value: answer.value })));
  revalidatePath("/dashboard");
  return { percentage };
}
