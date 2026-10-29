import type { Config } from "tailwindcss";
export default { content: ["./src/**/*.{ts,tsx}"], theme: { extend: { colors: { blue: "#1d559a", navy: "#0e254e", gray: "#dfe1e7", surface: "#f3f4f7", tint: "#e8eef7" }, borderRadius: { control: "4px", card: "8px" } } } } satisfies Config;
