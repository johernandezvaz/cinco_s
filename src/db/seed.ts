import { db } from ".";
import { auditAnswers, audits } from "./schema";
import { questions } from "@/config/checklist";
import { percentageFromValues } from "@/lib/score";
const stations = ["Ensamble 3", "Torno CNC 2", "Soldadura 1", "Empaque A", "Inspección final"];
const operators = ["María López", "Jorge Ramírez", "Elena Cruz", "Carlos Méndez", "Rosa García"];
async function seed() { for (let i = 0; i < 30; i++) { const values = questions.map((_, n) => (i + n) % 11 === 0 ? 0 : (i * 3 + n) % 5 === 0 ? 1 : 2); const score = values.reduce<number>((a, b) => a + b, 0); const [audit] = await db.insert(audits).values({ operator: operators[i % operators.length], station: stations[i % stations.length], shift: ["1er turno", "2do turno", "3er turno"][i % 3], comments: i % 6 === 0 ? "Dar seguimiento a herramientas sin marca." : null, score, percentage: percentageFromValues(values), createdAt: new Date(Date.now() - i * 864e5) }).returning(); await db.insert(auditAnswers).values(questions.map((q, n) => ({ auditId: audit.id, questionId: q.id, value: values[n] }))); } console.log("Se crearon 30 auditorías de ejemplo."); }
seed().catch((error) => { console.error(error); process.exitCode = 1; });
