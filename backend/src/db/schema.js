import {
  pgTable, uuid, text, timestamp, boolean, integer, jsonb, date, index, uniqueIndex
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkUserId: text("clerk_user_id").notNull().unique(),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const schedules = pgTable("schedules", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerId: uuid("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  // Support both period-based and day1-based scheduling
  periodStart: date("period_start"),
  periodEnd: date("period_end"),
  // Frontend Schedule model fields
  day1Date: jsonb("day1_date"), // Store ScheduleDate as {date: 7, month: 10, year: 2025}
  day1Day: text("day1_day"), // "Monday", "Tuesday", etc.
  isActive: boolean("is_active").notNull().default(false),
  // Additional fields from frontend Schedule model
  numDays: integer("num_days").notNull().default(7),
  minGap: integer("min_gap").notNull().default(15), // minutes
  workingHoursLimit: integer("working_hours_limit").notNull().default(8),
  strategy: text("strategy").notNull().default("EarliestFit"), // 'EarliestFit'|'BalancedWork'|'DeadlineOriented'
  startTime: integer("start_time").notNull().default(900), // Time24 format (e.g., 900 = 9:00 AM)
  endTime: integer("end_time").notNull().default(1700), // Time24 format (e.g., 1700 = 5:00 PM)
  metadata: jsonb("metadata"),
  version: integer("version").notNull().default(1),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (t) => [
  index("schedules_owner_active_idx").on(t.ownerId, t.isActive),
  index("schedules_owner_updated_idx").on(t.ownerId, t.updatedAt),
]);


export const blocks = pgTable("blocks", {
  id: uuid("id").defaultRandom().primaryKey(),
  scheduleId: uuid("schedule_id").notNull().references(() => schedules.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // 'rigid' | 'flexible' | 'break'
  title: text("title").notNull(), // Maps to 'name' in frontend
  // Time24 format for times
  startAt: integer("start_at").notNull(), // Time24 format (e.g., 930 = 9:30 AM)
  endAt: integer("end_at").notNull(), // Time24 format (e.g., 1030 = 10:30 AM)
  // Support both simple date and ScheduleDate object
  blockDate: date("block_date"), // Simple date for database queries
  dateObject: jsonb("date_object"), // ScheduleDate as {date: 7, month: 10, year: 2025}
  category: text("category"), // ActivityType enum
  // Enhanced metadata for frontend compatibility
  metadata: jsonb("metadata"), // Stores: activityType, priority, deadline, duration, frontendId
  // Direct fields for common properties
  priority: text("priority"), // 'LOW'|'MEDIUM'|'HIGH'
  deadline: date("deadline"), // Simple deadline date
  deadlineObject: jsonb("deadline_object"), // ScheduleDate object for deadline
  duration: integer("duration"), // Duration in minutes
  frontendId: text("frontend_id"), // Store frontend-generated IDs
  completed: boolean("completed").notNull().default(false),
  version: integer("version").notNull().default(1),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (t) => [
  index("blocks_schedule_date_start_idx").on(t.scheduleId, t.blockDate, t.startAt),
  index("blocks_schedule_updated_idx").on(t.scheduleId, t.updatedAt),
  index("blocks_frontend_id_idx").on(t.frontendId),
]);

export const preferences = pgTable("preferences", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  uiMode: text("ui_mode").notNull().default("system"), // 'light'|'dark'|'system'
  notificationsEnabled: boolean("notifications_enabled").notNull().default(true),
  leadMinutes: integer("lead_minutes").notNull().default(10),
  minGapMinutes: integer("min_gap_minutes").notNull().default(15),
  maxWorkHoursPerDay: integer("max_work_hours_per_day").notNull().default(8),
  weekendPolicy: text("weekend_policy").notNull().default("allow"),
  nickname: text("nickname"),
  version: integer("version").notNull().default(1),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
