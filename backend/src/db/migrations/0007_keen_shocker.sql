CREATE TABLE "days" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"schedule_id" uuid NOT NULL,
	"day_number" integer NOT NULL,
	"day_name" text NOT NULL,
	"date" date NOT NULL,
	"date_object" jsonb NOT NULL,
	"day_start_time" integer,
	"day_end_time" integer,
	"is_weekend" boolean DEFAULT false NOT NULL,
	"is_holiday" boolean DEFAULT false NOT NULL,
	"max_working_hours" integer,
	"min_gap" integer DEFAULT 15 NOT NULL,
	"metadata" jsonb,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "blocks" RENAME COLUMN "schedule_id" TO "day_id";--> statement-breakpoint
ALTER TABLE "blocks" DROP CONSTRAINT "blocks_schedule_id_schedules_id_fk";
--> statement-breakpoint
DROP INDEX "blocks_schedule_date_start_idx";--> statement-breakpoint
DROP INDEX "blocks_schedule_updated_idx";--> statement-breakpoint
ALTER TABLE "days" ADD CONSTRAINT "days_schedule_id_schedules_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."schedules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "days_schedule_day_number_idx" ON "days" USING btree ("schedule_id","day_number");--> statement-breakpoint
CREATE UNIQUE INDEX "days_schedule_date_idx" ON "days" USING btree ("schedule_id","date");--> statement-breakpoint
CREATE INDEX "days_schedule_updated_idx" ON "days" USING btree ("schedule_id","updated_at");--> statement-breakpoint
CREATE INDEX "days_date_idx" ON "days" USING btree ("date");--> statement-breakpoint
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_day_id_days_id_fk" FOREIGN KEY ("day_id") REFERENCES "public"."days"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "blocks_day_start_idx" ON "blocks" USING btree ("day_id","start_at");--> statement-breakpoint
CREATE INDEX "blocks_day_updated_idx" ON "blocks" USING btree ("day_id","updated_at");--> statement-breakpoint
CREATE INDEX "blocks_date_start_idx" ON "blocks" USING btree ("block_date","start_at");