"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { saveAudit } from "@/db/audits";

export type SubmitResult = { ok: true; id: string; percentage: number } | { ok: false; error: string };

export async function submitAudit(input: unknown): Promise<SubmitResult> {
  try {
    const saved = await saveAudit(db, input);
    revalidatePath("/dashboard");
    revalidatePath("/");
    return { ok: true, ...saved };
  } catch (error) {
    if (error instanceof z.ZodError) return { ok: false, error: `Revisa los datos: ${[...new Set(error.issues.map((issue) => issue.message))].join(" · ")}` };
    console.error("No se pudo guardar la evaluación", error);
    return { ok: false, error: "No se pudo guardar la evaluación. Revisa la conexión e inténtalo de nuevo; tus respuestas siguen en el formulario." };
  }
}
