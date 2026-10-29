import type { Config } from "tailwindcss";
import { tokens } from "./src/config/tokens";
// Los valores viven en src/config/tokens.ts; Tailwind referencia sus variables CSS.
const colors = Object.fromEntries(Object.keys(tokens).map((name) => [name, `var(--${name})`]));
export default { content: ["./src/**/*.{ts,tsx}"], theme: { extend: { colors, borderRadius: { control: "4px", card: "8px" }, fontFamily: { sans: ["var(--font-inter)", "system-ui", "sans-serif"], condensed: ["var(--font-condensed)", "sans-serif"] } } } } satisfies Config;
