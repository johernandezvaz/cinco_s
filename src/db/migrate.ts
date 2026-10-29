import { loadEnvConfig } from "@next/env";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { createDb } from "./client";

loadEnvConfig(process.cwd());
const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL no está configurada. Añádela en .env.local (ver .env.example).");

const { client, db } = createDb(url);
migrate(db, { migrationsFolder: "./drizzle" })
  .then(() => console.log("Migraciones aplicadas."))
  .finally(() => client.end());
