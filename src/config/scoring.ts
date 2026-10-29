// Única fuente de verdad de puntos, umbrales del semáforo y zona horaria del tablero.

export const ANSWER_VALUES = ["si", "parcial", "no"] as const;
export type AnswerValue = (typeof ANSWER_VALUES)[number];

export const ANSWER_POINTS: Record<AnswerValue, number> = { si: 2, parcial: 1, no: 0 };

export const ANSWER_OPTIONS: { value: AnswerValue; label: string; meaning: string }[] = [
  { value: "si", label: "Sí", meaning: "se cumple" },
  { value: "parcial", label: "Parcial", meaning: "se cumple a medias" },
  { value: "no", label: "No", meaning: "no se cumple" },
];

export const ANSWER_LABELS = Object.fromEntries(ANSWER_OPTIONS.map((option) => [option.value, option.label])) as Record<AnswerValue, string>;

export type AuditStatus = "success" | "warning" | "error";

// Porcentaje mínimo (inclusive) para cada estado; por debajo de `warning` es crítico.
export const STATUS_THRESHOLDS = { success: 85, warning: 70 } as const;

export const STATUS_META: Record<AuditStatus, { label: string; icon: string }> = {
  success: { label: "Cumple", icon: "✓" },
  warning: { label: "Mejorar", icon: "◐" },
  error: { label: "Crítico", icon: "✕" },
};

export const SHIFTS = ["1er turno", "2do turno", "3er turno"] as const;
export type Shift = (typeof SHIFTS)[number];

export const TIME_ZONE = process.env.APP_TIME_ZONE || "America/Mexico_City";
