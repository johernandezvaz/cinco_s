import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { theme, statusColors } from "@/lib/export/theme";
import { tokens, tokensCss } from "./tokens";

const css = readFileSync("src/app/globals.css", "utf8");
const layout = readFileSync("src/app/layout.tsx", "utf8");

describe("tokens sincronizados entre app y exportadores", () => {
  it("globals.css no define colores propios", () => {
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(css).not.toMatch(/:root\s*\{/);
  });
  it("toda variable de color usada en globals.css existe en tokens.ts", () => {
    const used = new Set([...css.matchAll(/var\(--([a-z-]+)\)/g)].map((m) => m[1]).filter((name) => !name.startsWith("font-")));
    expect([...used].filter((name) => !(name in tokens))).toEqual([]);
  });
  it("el :root inyectado contiene todos los tokens y el layout lo usa", () => {
    Object.entries(tokens).forEach(([name, value]) => expect(tokensCss).toContain(`--${name}:${value}`));
    expect(layout).toContain("tokensCss");
  });
  it("el tema de exportación es el mismo objeto de tokens", () => {
    expect(theme).toBe(tokens);
    expect(statusColors.warning).toEqual({ strong: tokens.warning, bg: tokens["warning-bg"], ink: tokens["warning-ink"] });
  });
  it("ningún archivo de exportación repite hex", () => {
    for (const file of ["theme.ts", "csv.ts", "xlsx.ts", "index.ts", "pdf/report.tsx", "pdf/components.tsx", "pdf/styles.ts", "pdf/fonts.ts"]) expect(readFileSync(`src/lib/export/${file}`, "utf8")).not.toMatch(/#[0-9a-f]{6}\b/i);
  });
});
