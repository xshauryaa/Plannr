ALTER TABLE "users" RENAME COLUMN "avatar_url" TO "avatar_name";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "onboarded" boolean DEFAULT false NOT NULL;