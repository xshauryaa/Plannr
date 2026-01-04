ALTER TABLE "schedules" ALTER COLUMN "strategy" SET DEFAULT 'earliest-fit';

-- Update existing data from PascalCase to kebab-case format
UPDATE "schedules" SET "strategy" = 'earliest-fit' WHERE "strategy" = 'EarliestFit';
UPDATE "schedules" SET "strategy" = 'balanced-work' WHERE "strategy" = 'BalancedWork';
UPDATE "schedules" SET "strategy" = 'deadline-oriented' WHERE "strategy" = 'DeadlineOriented';

-- Also update preferences table for consistency
UPDATE "preferences" SET "default_strategy" = 'earliest-fit' WHERE "default_strategy" = 'EarliestFit';
UPDATE "preferences" SET "default_strategy" = 'balanced-work' WHERE "default_strategy" = 'BalancedWork';
UPDATE "preferences" SET "default_strategy" = 'deadline-oriented' WHERE "default_strategy" = 'DeadlineOriented';