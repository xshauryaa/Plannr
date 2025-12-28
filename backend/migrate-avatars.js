import { neon } from "@neondatabase/serverless";
import { ENV } from "./src/config/env.js";

const sql = neon(ENV.DATABASE_URL);

async function migrateAvatars() {
  try {
    console.log("Starting avatar migration...");
    
    // Step 1: Add the new avatarName column
    console.log("Adding avatar_name column...");
    await sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "avatar_name" text`;
    
    // Step 2: Update existing users with random avatar names
    console.log("Updating existing users with random avatars...");
    const result = await sql`
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
      WHERE "avatar_name" IS NULL
    `;
    
    console.log(`Updated ${result.length || 0} users with random avatars`);
    
    // Step 3: Drop the old avatarUrl column
    console.log("Dropping avatar_url column...");
    await sql`ALTER TABLE "users" DROP COLUMN IF EXISTS "avatar_url"`;
    
    console.log("Migration completed successfully!");
    
    // Verify the changes
    const users = await sql`SELECT id, email, avatar_name FROM "users" LIMIT 5`;
    console.log("Sample users after migration:", users);
    
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

migrateAvatars();
