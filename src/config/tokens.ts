// Fuente única de tokens de color. De aquí salen las variables CSS (:root, inyectado en
// src/app/layout.tsx), los colores de Tailwind y el tema de los exportadores (Excel/PDF).
export const tokens = {
  blue: "#1d559a",
  "blue-press": "#174682",
  navy: "#0e254e",
  gray: "#dfe1e7",
  surface: "#f3f4f7",
  tint: "#e8eef7",
  ink: "#0e254e",
  muted: "#5b6578",
  white: "#ffffff",
  success: "#1e7a4c",
  "success-bg": "#dcefe4",
  // *-ink: texto semáforo sobre su *-bg (los tonos base no alcanzan 4.5:1 a 12px).
  "success-ink": "#1d7448",
  warning: "#a36200",
  "warning-bg": "#fbecc8",
  "warning-ink": "#945900",
  error: "#c0332b",
  "error-bg": "#f8dcd9",
  "error-ink": "#b32f28",
} as const;

export type TokenName = keyof typeof tokens;

export const tokensCss = `:root{${Object.entries(tokens).map(([name, value]) => `--${name}:${value}`).join(";")}}`;
