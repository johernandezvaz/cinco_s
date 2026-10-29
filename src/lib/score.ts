export type AuditStatus = "success" | "warning" | "error";
export const percentageFromValues = (values: number[]) => Math.round((values.reduce((sum, value) => sum + value, 0) / (values.length * 2)) * 100);
export const statusFor = (percentage: number): AuditStatus => percentage >= 85 ? "success" : percentage >= 70 ? "warning" : "error";
export const statusLabel = (percentage: number) => ({ success: "Cumple", warning: "Mejorar", error: "Crítico" }[statusFor(percentage)]);
