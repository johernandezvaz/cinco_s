import path from "node:path";
import type { AuditStatus } from "@/config/scoring";
import { tokens } from "@/config/tokens";

// Tema de los exportadores: reutiliza los tokens de la app, sin hex propios.
export const theme = tokens;

/** Pares semáforo: color fuerte (bordes, rellenos), fondo suave y texto legible sobre el fondo. */
export const statusColors: Record<AuditStatus, { strong: string; bg: string; ink: string }> = {
  success: { strong: tokens.success, bg: tokens["success-bg"], ink: tokens["success-ink"] },
  warning: { strong: tokens.warning, bg: tokens["warning-bg"], ink: tokens["warning-ink"] },
  error: { strong: tokens.error, bg: tokens["error-bg"], ink: tokens["error-ink"] },
};

/** Color en formato ARGB de Excel ("FF0E254E"). */
export const argb = (hex: string) => `FF${hex.replace("#", "").toUpperCase()}`;

export const SYSTEM_NAME = "Auditoría 5S de Estaciones";

/** Fuentes estáticas incluidas en el repo (src/assets/fonts), sin descargas en tiempo de ejecución. */
export const FONT_DIR = path.join(process.cwd(), "src", "assets", "fonts");
export const fonts = {
  body: { family: "Inter", files: [{ file: "Inter_400Regular.ttf", weight: 400 }, { file: "Inter_600SemiBold.ttf", weight: 600 }, { file: "Inter_700Bold.ttf", weight: 700 }] },
  heading: { family: "Barlow Condensed", files: [{ file: "BarlowCondensed_600SemiBold.ttf", weight: 600 }, { file: "BarlowCondensed_700Bold.ttf", weight: 700 }] },
} as const;
