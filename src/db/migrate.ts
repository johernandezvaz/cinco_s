import { pool } from "./index";
async function migrate() {
  await pool.query(`CREATE TABLE IF NOT EXISTS audits (id serial PRIMARY KEY, operator text NOT NULL, station text NOT NULL, shift text NOT NULL, comments text, score integer NOT NULL, percentage integer NOT NULL, created_at timestamptz NOT NULL DEFAULT now()); CREATE TABLE IF NOT EXISTS audit_answers (id serial PRIMARY KEY, audit_id integer NOT NULL REFERENCES audits(id) ON DELETE CASCADE, question_id text NOT NULL, value integer NOT NULL); CREATE INDEX IF NOT EXISTS audits_station_idx ON audits(station); CREATE INDEX IF NOT EXISTS audits_created_at_idx ON audits(created_at); CREATE INDEX IF NOT EXISTS audit_answers_audit_idx ON audit_answers(audit_id);`);
  await pool.end();
  console.log("Base de datos PostgreSQL lista.");
}
migrate().catch(async (error) => { await pool.end(); throw error; });
