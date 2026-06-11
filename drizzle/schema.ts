import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  /** User's preferred language (ISO 639-1 code, e.g., 'en', 'es', 'fr') */
  preferredLanguage: varchar("preferredLanguage", { length: 10 }).default("en").notNull(),
  /** User's preferred theme ('light' or 'dark') */
  preferredTheme: mysqlEnum("preferredTheme", ["light", "dark"]).default("light").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Therapy sessions table - stores individual chat sessions
 * Can be associated with a user (authenticated) or anonymous
 */
export const sessions = mysqlTable("sessions", {
  id: varchar("id", { length: 64 }).primaryKey(), // UUID
  userId: int("userId"), // NULL for anonymous sessions
  title: varchar("title", { length: 255 }), // Auto-generated or user-provided
  /** Session status: active, ended, archived */
  status: mysqlEnum("status", ["active", "ended", "archived"]).default("active").notNull(),
  /** Language used in this session */
  language: varchar("language", { length: 10 }).default("en").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  endedAt: timestamp("endedAt"),
});

export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;

/**
 * Chat messages table - stores individual messages in a session
 */
export const messages = mysqlTable("messages", {
  id: varchar("id", { length: 64 }).primaryKey(), // UUID
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  /** 'user' or 'assistant' */
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

/**
 * Session summaries table - stores AI-generated summaries
 */
export const sessionSummaries = mysqlTable("sessionSummaries", {
  id: varchar("id", { length: 64 }).primaryKey(), // UUID
  sessionId: varchar("sessionId", { length: 64 }).notNull().unique(),
  /** Key topics discussed in the session */
  keyTopics: text("keyTopics"), // JSON array as string
  /** Emotional insights from the conversation */
  emotionalInsights: text("emotionalInsights"),
  /** Suggested next steps or coping strategies */
  suggestedNextSteps: text("suggestedNextSteps"),
  /** Full summary text */
  fullSummary: text("fullSummary").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SessionSummary = typeof sessionSummaries.$inferSelect;
export type InsertSessionSummary = typeof sessionSummaries.$inferInsert;

/**
 * Mood logs table - tracks user mood before and after sessions
 */
export const moodLogs = mysqlTable("moodLogs", {
  id: varchar("id", { length: 64 }).primaryKey(), // UUID
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  userId: int("userId"), // NULL for anonymous sessions
  /** Pre-session mood (1-10 scale) */
  preMood: int("preMood"),
  /** Post-session mood (1-10 scale) */
  postMood: int("postMood"),
  /** Optional mood note/reason */
  preNote: text("preNote"),
  postNote: text("postNote"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MoodLog = typeof moodLogs.$inferSelect;
export type InsertMoodLog = typeof moodLogs.$inferInsert;

/**
 * Crisis alerts table - logs detected crisis messages for safety monitoring
 */
export const crisisAlerts = mysqlTable("crisisAlerts", {
  id: varchar("id", { length: 64 }).primaryKey(), // UUID
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  userId: int("userId"), // NULL for anonymous sessions
  messageId: varchar("messageId", { length: 64 }).notNull(),
  /** Type of crisis detected: 'self_harm', 'suicide', 'harm_to_others' */
  crisisType: mysqlEnum("crisisType", ["self_harm", "suicide", "harm_to_others"]).notNull(),
  /** Confidence score (0-1) of the detection */
  confidenceScore: decimal("confidenceScore", { precision: 3, scale: 2 }),
  /** Whether the user was shown emergency resources */
  resourcesShown: boolean("resourcesShown").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CrisisAlert = typeof crisisAlerts.$inferSelect;
export type InsertCrisisAlert = typeof crisisAlerts.$inferInsert;

/**
 * Affirmations table - stores daily affirmations
 */
export const affirmations = mysqlTable("affirmations", {
  id: varchar("id", { length: 64 }).primaryKey(), // UUID
  /** Affirmation text */
  text: text("text").notNull(),
  /** Language of the affirmation */
  language: varchar("language", { length: 10 }).default("en").notNull(),
  /** Category: 'general', 'anxiety', 'depression', 'stress', etc. */
  category: varchar("category", { length: 50 }).default("general").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Affirmation = typeof affirmations.$inferSelect;
export type InsertAffirmation = typeof affirmations.$inferInsert;

/**
 * Breathing exercises table - stores guided breathing exercise content
 */
export const breathingExercises = mysqlTable("breathingExercises", {
  id: varchar("id", { length: 64 }).primaryKey(), // UUID
  /** Exercise name */
  name: varchar("name", { length: 255 }).notNull(),
  /** Description of the exercise */
  description: text("description"),
  /** Language of the exercise */
  language: varchar("language", { length: 10 }).default("en").notNull(),
  /** Duration in seconds */
  durationSeconds: int("durationSeconds").notNull(),
  /** Exercise instructions as JSON */
  instructions: text("instructions"), // JSON array of steps
  /** Breathing pattern: 'box', '4-7-8', 'alternate-nostril', etc. */
  pattern: varchar("pattern", { length: 50 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BreathingExercise = typeof breathingExercises.$inferSelect;
export type InsertBreathingExercise = typeof breathingExercises.$inferInsert;

/**
 * Session exports table - tracks exported sessions for audit/analytics
 */
export const sessionExports = mysqlTable("sessionExports", {
  id: varchar("id", { length: 64 }).primaryKey(), // UUID
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  userId: int("userId"), // NULL for anonymous sessions
  /** Export format: 'pdf', 'text' */
  format: mysqlEnum("format", ["pdf", "text"]).notNull(),
  /** Storage key for the exported file */
  fileKey: varchar("fileKey", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SessionExport = typeof sessionExports.$inferSelect;
export type InsertSessionExport = typeof sessionExports.$inferInsert;
