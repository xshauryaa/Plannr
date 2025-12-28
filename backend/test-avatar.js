// Test script to verify avatar functionality
import { neon } from "@neondatabase/serverless";
import { ENV } from "./src/config/env.js";

const sql = neon(ENV.DATABASE_URL);

async function testAvatarSystem() {
  try {
    console.log("Testing avatar system...");
    
    // Get a sample user
    const users = await sql`SELECT id, email, avatar_name FROM "users" LIMIT 1`;
    
    if (users.length === 0) {
      console.log("No users found in database");
      return;
    }
    
    const user = users[0];
    console.log("Sample user:", user);
    
    // Test that avatar_name exists
    if (user.avatar_name) {
      console.log("✅ avatar_name column exists and has data");
    } else {
      console.log("❌ avatar_name is null for this user");
    }
    
    // Test updating avatar
    const newAvatar = 'lion';
    const updated = await sql`
      UPDATE "users" 
      SET "avatar_name" = ${newAvatar}
      WHERE id = ${user.id}
      RETURNING id, email, avatar_name
    `;
    
    console.log("Updated user:", updated[0]);
    
    // Verify the schema change worked
    const schemaCheck = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('avatar_name', 'avatar_url')
    `;
    
    console.log("Current user table columns:", schemaCheck);
    
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testAvatarSystem();
