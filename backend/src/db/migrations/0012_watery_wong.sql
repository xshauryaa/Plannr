CREATE TABLE "text_to_tasks_drafts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"order_index" integer NOT NULL,
	"title" text NOT NULL,
	"notes" text,
	"deadline" timestamp with time zone,
	"preferred_start" timestamp with time zone,
	"priority" text DEFAULT 'MEDIUM' NOT NULL,
	"duration_minutes" integer,
	"included" boolean DEFAULT true NOT NULL,
	"warnings" jsonb DEFAULT '[]',
	"confidence" real,
	"enrichment" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "text_to_tasks_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"status" text DEFAULT 'parsing' NOT NULL,
	"input_hash" text NOT NULL,
	"input_stats" jsonb,
	"date_range_start" timestamp with time zone,
	"date_range_end" timestamp with time zone,
	"llm_provider" text,
	"llm_model" text,
	"llm_tokens_in" integer,
	"llm_tokens_out" integer,
	"parse_latency_ms" integer,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "text_to_tasks_drafts" ADD CONSTRAINT "text_to_tasks_drafts_session_id_text_to_tasks_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."text_to_tasks_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "text_to_tasks_sessions" ADD CONSTRAINT "text_to_tasks_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "text_to_tasks_drafts_session_idx" ON "text_to_tasks_drafts" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "text_to_tasks_drafts_order_idx" ON "text_to_tasks_drafts" USING btree ("session_id","order_index");--> statement-breakpoint
CREATE INDEX "text_to_tasks_sessions_user_idx" ON "text_to_tasks_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "text_to_tasks_sessions_status_idx" ON "text_to_tasks_sessions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "text_to_tasks_sessions_hash_idx" ON "text_to_tasks_sessions" USING btree ("input_hash");