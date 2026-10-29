CREATE TABLE `audits` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `operator` text NOT NULL,
  `station` text NOT NULL,
  `shift` text NOT NULL,
  `comments` text,
  `score` integer NOT NULL,
  `percentage` integer NOT NULL,
  `created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `audit_answers` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `audit_id` integer NOT NULL REFERENCES `audits`(`id`) ON UPDATE no action ON DELETE cascade,
  `question_id` text NOT NULL,
  `value` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `audits_station_idx` ON `audits` (`station`);
--> statement-breakpoint
CREATE INDEX `audits_created_at_idx` ON `audits` (`created_at`);
