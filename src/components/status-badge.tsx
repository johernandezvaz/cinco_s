import { ANSWER_LABELS, STATUS_META, type AnswerValue, type AuditStatus } from "@/config/scoring";
import { statusFor } from "@/lib/scoring";

const answerStatus: Record<AnswerValue, AuditStatus> = { si: "success", parcial: "warning", no: "error" };

/** Semáforo con ícono y texto; opcionalmente antepone el porcentaje. */
export function StatusBadge({ percentage, showPercentage = false }: { percentage: number; showPercentage?: boolean }) {
  const status = statusFor(percentage);
  return <span className={`status ${status}`}><span aria-hidden="true">{STATUS_META[status].icon}</span> {showPercentage ? `${percentage}% · ` : ""}{STATUS_META[status].label}</span>;
}

export function AnswerBadge({ value }: { value: AnswerValue | undefined }) {
  if (!value) return <span className="status">—</span>;
  const status = answerStatus[value];
  return <span className={`status ${status}`}><span aria-hidden="true">{STATUS_META[status].icon}</span> {ANSWER_LABELS[value]}</span>;
}
