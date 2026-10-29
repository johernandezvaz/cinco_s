import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// DATABASE_URL_TEST vive en .env.local (Next no lo carga cuando NODE_ENV=test).
if (existsSync(".env.local")) process.loadEnvFile(".env.local");

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  // Las pruebas de integración comparten una sola base de pruebas, así que los archivos no corren en paralelo.
  test: { fileParallelism: false },
});
