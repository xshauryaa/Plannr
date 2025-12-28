-- Direct migration script to update users table
-- This should be run manually on the database

-- Step 1: Add the new avatarName column
ALTER TABLE "users" ADD COLUMN "avatar_name" text;

-- Step 2: Update existing users with random avatar names
UPDATE "users" 
SET "avatar_name" = (
  SELECT CASE (random() * 9)::integer
    WHEN 0 THEN 'bear'
    WHEN 1 THEN 'bunny'
    WHEN 2 THEN 'cat'
    WHEN 3 THEN 'croc'
    WHEN 4 THEN 'fox'
    WHEN 5 THEN 'hen'
    WHEN 6 THEN 'lion'
    WHEN 7 THEN 'puppy'
    ELSE 'squirrel'
  END
)
WHERE "avatar_name" IS NULL;

-- Step 3: Drop the old avatarUrl column
ALTER TABLE "users" DROP COLUMN IF EXISTS "avatar_url";
