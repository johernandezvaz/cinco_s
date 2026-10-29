import { sql } from "drizzle-orm";
import { check, index, pgEnum, pgTable, smallint, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { ANSWER_VALUES, SHIFTS } from "../config/scoring";

export const shiftEnum = pgEnum("shift", SHIFTS);
export const answerValueEnum = pgEnum("answer_value", ANSWER_VALUES);

export const audits = pgTable("audits", {
  id: uuid("id").primaryKey().defaultRandom(),
  operator: text("operator").notNull(),
  station: text("station").notNull(),
  shift: shiftEnum("shift").notNull(),
  comments: text("comments"),
  score: smallint("score").notNull(),
  percentage: smallint("percentage").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  check("audits_score_range", sql`${t.score} BETWEEN 0 AND 30`),
  check("audits_percentage_range", sql`${t.percentage} BETWEEN 0 AND 100`),
  index("audits_station_created_at_idx").on(t.station, t.createdAt.desc()),
  index("audits_created_at_idx").on(t.createdAt.desc()),
]);

export const auditAnswers = pgTable("audit_answers", {
  id: uuid("id").primaryKey().defaultRandom(),
  auditId: uuid("audit_id").notNull().references(() => audits.id, { onDelete: "cascade" }),
  questionId: text("question_id").notNull(),
  value: answerValueEnum("value").notNull(),
}, (t) => [unique("audit_answers_audit_question_key").on(t.auditId, t.questionId)]);
