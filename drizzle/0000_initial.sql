CREATE TYPE "public"."answer_value" AS ENUM('si', 'parcial', 'no');--> statement-breakpoint
CREATE TYPE "public"."shift" AS ENUM('1er turno', '2do turno', '3er turno');--> statement-breakpoint
CREATE TABLE "audit_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"audit_id" uuid NOT NULL,
	"question_id" text NOT NULL,
	"value" "answer_value" NOT NULL,
	CONSTRAINT "audit_answers_audit_question_key" UNIQUE("audit_id","question_id")
);
--> statement-breakpoint
CREATE TABLE "audits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"operator" text NOT NULL,
	"station" text NOT NULL,
	"shift" "shift" NOT NULL,
	"comments" text,
	"score" smallint NOT NULL,
	"percentage" smallint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "audits_score_range" CHECK ("audits"."score" BETWEEN 0 AND 30),
	CONSTRAINT "audits_percentage_range" CHECK ("audits"."percentage" BETWEEN 0 AND 100)
);
--> statement-breakpoint
ALTER TABLE "audit_answers" ADD CONSTRAINT "audit_answers_audit_id_audits_id_fk" FOREIGN KEY ("audit_id") REFERENCES "public"."audits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audits_station_created_at_idx" ON "audits" USING btree ("station","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "audits_created_at_idx" ON "audits" USING btree ("created_at" DESC NULLS LAST);