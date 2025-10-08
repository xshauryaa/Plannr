CREATE TABLE "blocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"schedule_id" uuid NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"start_at" integer NOT NULL,
	"end_at" integer NOT NULL,
	"block_date" date,
	"date_object" jsonb,
	"category" text,
	"metadata" jsonb,
	"priority" text,
	"deadline" date,
	"deadline_object" jsonb,
	"duration" integer,
	"frontend_id" text,
	"completed" boolean DEFAULT false NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"ui_mode" text DEFAULT 'system' NOT NULL,
	"notifications_enabled" boolean DEFAULT true NOT NULL,
	"lead_minutes" integer DEFAULT 10 NOT NULL,
	"min_gap_minutes" integer DEFAULT 15 NOT NULL,
	"max_work_hours_per_day" integer DEFAULT 8 NOT NULL,
	"weekend_policy" text DEFAULT 'allow' NOT NULL,
	"nickname" text,
	"version" integer DEFAULT 1 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "preferences_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"title" text NOT NULL,
	"period_start" date,
	"period_end" date,
	"day1_date" jsonb,
	"day1_day" text,
	"is_active" boolean DEFAULT false NOT NULL,
	"num_days" integer DEFAULT 7 NOT NULL,
	"min_gap" integer DEFAULT 15 NOT NULL,
	"working_hours_limit" integer DEFAULT 8 NOT NULL,
	"strategy" text DEFAULT 'EarliestFit' NOT NULL,
	"start_time" integer DEFAULT 900 NOT NULL,
	"end_time" integer DEFAULT 1700 NOT NULL,
	"metadata" jsonb,
	"version" integer DEFAULT 1 NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_user_id" text NOT NULL,
	"email" text NOT NULL,
	"display_name" text,
	"avatar_url" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "users_clerk_user_id_unique" UNIQUE("clerk_user_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_schedule_id_schedules_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."schedules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "preferences" ADD CONSTRAINT "preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "blocks_schedule_date_start_idx" ON "blocks" USING btree ("schedule_id","block_date","start_at");--> statement-breakpoint
CREATE INDEX "blocks_schedule_updated_idx" ON "blocks" USING btree ("schedule_id","updated_at");--> statement-breakpoint
CREATE INDEX "blocks_frontend_id_idx" ON "blocks" USING btree ("frontend_id");--> statement-breakpoint
CREATE INDEX "schedules_owner_active_idx" ON "schedules" USING btree ("owner_id","is_active");--> statement-breakpoint
CREATE INDEX "schedules_owner_updated_idx" ON "schedules" USING btree ("owner_id","updated_at");