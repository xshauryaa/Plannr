import {
  pgTable, uuid, text, timestamp, boolean, integer, jsonb, date, index, uniqueIndex
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkUserId: text("clerk_user_id").notNull().unique(),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  avatarName: text("avatar_name"),
  onboarded: boolean("onboarded").notNull().default(false),
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
  strategy: text("strategy").notNull().default("earliest-fit"), // 'earliest-fit'|'balanced-work'|'deadline-oriented'
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

export const days = pgTable("days", {
  id: uuid("id").defaultRandom().primaryKey(),
  scheduleId: uuid("schedule_id").notNull().references(() => schedules.id, { onDelete: "cascade" }),
  dayNumber: integer("day_number").notNull(), // 1, 2, 3, etc. (relative to schedule start)
  dayName: text("day_name").notNull(), // "Monday", "Tuesday", etc.
  date: date("date").notNull(), // YYYY-MM-DD format for database queries
  dateObject: jsonb("date_object").notNull(), // ScheduleDate as {date: 7, month: 10, year: 2025}
  // Day-level scheduling metadata
  dayStartTime: integer("day_start_time"), // Override schedule default start time for this day
  dayEndTime: integer("day_end_time"), // Override schedule default end time for this day
  isWeekend: boolean("is_weekend").notNull().default(false),
  isHoliday: boolean("is_holiday").notNull().default(false),
  // Day-level preferences and constraints
  maxWorkingHours: integer("max_working_hours"), // Override schedule default for this day
  minGap: integer("min_gap").notNull().default(15), // Minimum gap between events for this day in minutes
  // Metadata for day-level features
  metadata: jsonb("metadata"), // Store day-specific settings, preferences, etc.
  version: integer("version").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (t) => [
  // Ensure unique day numbers within a schedule
  uniqueIndex("days_schedule_day_number_idx").on(t.scheduleId, t.dayNumber),
  // Ensure unique dates within a schedule (prevent duplicate days)
  uniqueIndex("days_schedule_date_idx").on(t.scheduleId, t.date),
  // Index for efficient day lookups by schedule
  index("days_schedule_updated_idx").on(t.scheduleId, t.updatedAt),
  // Index for date-based queries
  index("days_date_idx").on(t.date),
]);

export const blocks = pgTable("blocks", {
  id: uuid("id").defaultRandom().primaryKey(),
  dayId: uuid("day_id").notNull().references(() => days.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // 'rigid' | 'flexible' | 'break'
  title: text("title").notNull(), // Maps to 'name' in frontend
  // Time24 format for times
  startAt: integer("start_at").notNull(), // Time24 format (e.g., 930 = 9:30 AM)
  endAt: integer("end_at").notNull(), // Time24 format (e.g., 1030 = 10:30 AM)
  // Support both simple date and ScheduleDate object (kept for backwards compatibility during migration)
  blockDate: date("block_date"), // Simple date for database queries - will be deprecated after migration
  dateObject: jsonb("date_object"), // ScheduleDate as {date: 7, month: 10, year: 2025} - will be moved to days table
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
  index("blocks_day_start_idx").on(t.dayId, t.startAt), // Primary index for day-based queries
  index("blocks_day_updated_idx").on(t.dayId, t.updatedAt), // For sorting blocks by update time within a day
  index("blocks_frontend_id_idx").on(t.frontendId),
  // Keep legacy date index temporarily for migration compatibility
  index("blocks_date_start_idx").on(t.blockDate, t.startAt),
]);

export const preferences = pgTable("preferences", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  uiMode: text("ui_mode").notNull().default("light"), // 'light'|'dark'
  notificationsEnabled: boolean("notifications_enabled").notNull().default(true),
  leadMinutes: integer("lead_minutes").notNull().default(10),
  minGapMinutes: integer("min_gap_minutes").notNull().default(15),
  maxWorkHoursPerDay: integer("max_work_hours_per_day").notNull().default(8),
  weekendPolicy: text("weekend_policy").notNull().default("allow"),
  defaultStrategy: text("default_strategy").notNull().default("earliest-fit"), // 'earliest-fit'|'balanced-work'|'deadline-oriented'
  nickname: text("nickname"),
  version: integer("version").notNull().default(1),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// User integration connections tracking
export const integrations = pgTable("integrations", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  googleCalendar: boolean("google_calendar").notNull().default(false),
  todoist: boolean("todoist").notNull().default(false),
  notion: boolean("notion").notNull().default(false),
  googleTasks: boolean("google_tasks").notNull().default(false),
  microsoftTodo: boolean("microsoft_todo").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (t) => [
  index("integrations_user_idx").on(t.userId),
]);

// Provider connections for OAuth tokens (Microsoft To-Do import)
export const providerConnections = pgTable("provider_connections", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(), // 'microsoft', 'google', etc.
  providerUserId: text("provider_user_id").notNull(), // User ID from the provider
  displayName: text("display_name"), // User's display name from provider
  email: text("email"), // User's email from provider
  encryptedAccessToken: text("encrypted_access_token").notNull(), // AES-256-GCM encrypted
  encryptedRefreshToken: text("encrypted_refresh_token"), // Optional refresh token
  tokenExpiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  scopes: text("scopes"), // Space-separated list of granted scopes
  lastSyncAt: timestamp("last_sync_at", { withTimezone: true }),
  metadata: jsonb("metadata"), // Additional provider-specific data
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
  userProviderIdx: index("provider_connections_user_provider_idx").on(table.userId, table.provider),
}));

// Import sessions for tracking import progress
export const importSessions = pgTable("import_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(), // 'microsoft', 'google', etc.
  sessionType: text("session_type").notNull(), // 'oauth_pending', 'task_import', etc.
  status: text("status").notNull().default("in_progress"), // 'in_progress', 'completed', 'failed', etc.
  state: text("state"), // OAuth state parameter for security
  metadata: jsonb("metadata"), // Session-specific data
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
  userSessionIdx: index("import_sessions_user_idx").on(table.userId),
  stateIdx: index("import_sessions_state_idx").on(table.state),
}));

// Task drafts from import before being converted to schedules
export const taskDrafts = pgTable("task_drafts", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id").notNull().references(() => importSessions.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date", { withTimezone: true }),
  priority: text("priority").notNull().default("medium"), // 'low', 'medium', 'high'
  estimatedDuration: integer("estimated_duration").notNull(), // in minutes
  tags: jsonb("tags").default("[]"), // Array of tag strings
  isCompleted: boolean("is_completed").notNull().default(false),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  providerTaskId: text("provider_task_id").notNull(), // Original task ID from provider
  providerListId: text("provider_list_id"), // Original list ID from provider
  providerData: jsonb("provider_data"), // Original task data from provider
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
  sessionIdx: index("task_drafts_session_idx").on(table.sessionId),
  providerTaskIdx: index("task_drafts_provider_task_idx").on(table.providerTaskId),
}));
