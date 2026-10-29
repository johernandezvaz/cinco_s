import { checklist, questions, type ChecklistSection } from "@/config/checklist";
import { ANSWER_OPTIONS, ANSWER_POINTS, STATUS_META, STATUS_THRESHOLDS, type AnswerValue, type AuditStatus } from "@/config/scoring";

export type Answers = Record<string, AnswerValue>;

const BEST = Math.max(...Object.values(ANSWER_POINTS));

/** Puntos máximos de una evaluación completa (15 × 2 = 30). */
export const MAX_SCORE = questions.length * BEST;

/** Puntos máximos de una sección (3 × 2 = 6). */
export const sectionMaxScore = (section: ChecklistSection) => section.questions.length * BEST;

export const pointsFor = (answer: AnswerValue) => ANSWER_POINTS[answer];

export const toPercentage = (points: number, max: number) => (max > 0 ? Math.round((points / max) * 100) : 0);

/** Calcula puntos y porcentaje de una evaluación; exige las 15 respuestas. */
export function scoreAudit(answers: Answers) {
  const missing = questions.filter((question) => answers[question.id] === undefined);
  if (missing.length) throw new Error(`Faltan respuestas: ${missing.map((q) => q.id).join(", ")}`);
  const score = questions.reduce((sum, question) => sum + pointsFor(answers[question.id]), 0);
  return { score, percentage: toPercentage(score, MAX_SCORE) };
}

/** Porcentaje de una sección sobre su máximo (6). Las preguntas sin respuesta cuentan 0. */
export function sectionPercentage(section: ChecklistSection, answers: Answers) {
  const points = section.questions.reduce((sum, question) => sum + (answers[question.id] ? pointsFor(answers[question.id]) : 0), 0);
  return toPercentage(points, sectionMaxScore(section));
}

/** Promedio por S entre varias evaluaciones (una por estación). */
export function sectionAverages(evaluations: Answers[]) {
  return checklist.map((section) => ({ ...section, percentage: average(evaluations.map((answers) => sectionPercentage(section, answers))) ?? 0 }));
}

/** Promedio redondeado; `null` si no hay valores. */
export function average(values: number[]) {
  return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : null;
}

export const statusFor = (percentage: number): AuditStatus => (percentage >= STATUS_THRESHOLDS.success ? "success" : percentage >= STATUS_THRESHOLDS.warning ? "warning" : "error");

export const statusLabel = (percentage: number) => STATUS_META[statusFor(percentage)].label;

/** Leyenda del formulario: el único lugar de la interfaz donde se muestran puntos. */
export const answerLegend = () => ANSWER_OPTIONS.map(({ value, label, meaning }) => `${label} = ${meaning} (${ANSWER_POINTS[value]} ${ANSWER_POINTS[value] === 1 ? "pt" : "pts"})`).join(" · ");

/** Nota de metodología del reporte PDF: único lugar del reporte con puntos. */
export const methodologyNote = () => `${ANSWER_OPTIONS.map(({ value, label }) => `${label} = ${ANSWER_POINTS[value]} ${ANSWER_POINTS[value] === 1 ? "pt" : "pts"}`).join(" · ")}. Porcentaje = puntos / ${MAX_SCORE} × 100.`;
