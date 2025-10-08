import crypto from "node:crypto";
import { createClerkClient, verifyToken } from "@clerk/backend";
import { ENV } from "../config/env.js";
import { db } from "../config/db.js";
import { users } from "../db/schema.js";          // adjust if you split schemas
import { eq } from "drizzle-orm";

/**
 * requireAuth
 * 1) Reads Authorization: Bearer <token>
 * 2) Verifies with Clerk
 * 3) Upserts a "users" row (first request only)
 * 4) Attaches req.auth = { userId, clerkUserId, email }
 */
export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Missing bearer token" });

    // Dev fallback: allow tokens like "dev:<userId>:<email>"
    if (ENV.AUTH_DEV === "true" && token.startsWith("dev:")) {
      const [, devId = crypto.randomUUID(), email = null] = token.split(":");
      const userId = await upsertUser({ clerkUserId: devId, email });
      req.auth = { userId, clerkUserId: devId, email };
      return next();
    }

    // 1) Verify Clerk token
    const { payload } = await verifyToken(token, {
      secretKey: ENV.CLERK_SECRET_KEY,          // required
      // Optionally: authorizedParties: [ENV.APP_URL],
      //             clockSkewInMs: 5000,
    });

    const clerkUserId = payload.sub;
    if (!clerkUserId) return res.status(401).json({ error: "Invalid token (no sub)" });

    // 2) Optionally fetch email/displayName once (Clerk user lookup)
    const clerk = createClerkClient({ secretKey: ENV.CLERK_SECRET_KEY });
    let email = null, displayName = null, avatarUrl = null;
    try {
      const u = await clerk.users.getUser(clerkUserId);
      email = u?.emailAddresses?.[0]?.emailAddress ?? null;
      displayName = (u?.firstName || u?.lastName)
        ? `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim()
        : u?.username ?? null;
      avatarUrl = u?.imageUrl ?? null;
    } catch {
      // If Clerk user fetch fails, we still proceed with clerkUserId only
    }

    // 3) Upsert user in our DB and attach req.auth
    const userId = await upsertUser({ clerkUserId, email, displayName, avatarUrl });
    req.auth = { userId, clerkUserId, email };
    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(401).json({ error: "Unauthorized" });
  }
}

/** Insert user if not exists, return our internal user UUID */
async function upsertUser({ clerkUserId, email, displayName, avatarUrl }) {
  const existing = await db.select().from(users)
    .where(eq(users.clerkUserId, clerkUserId)).limit(1);

  if (existing.length) return existing[0].id;

  const now = new Date();
  const id = crypto.randomUUID();
  await db.insert(users).values({
    id,
    clerkUserId,
    email,
    displayName,
    avatarUrl,
    createdAt: now,
    updatedAt: now,
  });
  return id;
}
