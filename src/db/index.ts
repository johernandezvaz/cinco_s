import { createDb } from "./client";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL no está configurada. Añádela en .env.local (ver .env.example).");

// Reutiliza la conexión entre recargas del servidor de desarrollo.
const cached = globalThis as typeof globalThis & { __auditDb?: ReturnType<typeof createDb> };
cached.__auditDb ??= createDb(process.env.DATABASE_URL);

export const db = cached.__auditDb.db;
