import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, sessions, messages, moodLogs, sessionSummaries, crisisAlerts, affirmations, breathingExercises, sessionExports } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ SESSION QUERIES ============

export async function createSession(sessionId: string, userId: number | null, language: string = "en") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(sessions).values({
    id: sessionId,
    userId,
    language,
    status: "active",
  });
}

export async function getSession(sessionId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(sessions).where(eq(sessions.id, sessionId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getUserSessions(userId: number, limit: number = 50, offset: number = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(sessions)
    .where(eq(sessions.userId, userId))
    .orderBy(desc(sessions.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function endSession(sessionId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(sessions)
    .set({ status: "ended", endedAt: new Date() })
    .where(eq(sessions.id, sessionId));
}

export async function updateSessionTitle(sessionId: string, title: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(sessions)
    .set({ title })
    .where(eq(sessions.id, sessionId));
}

// ============ MESSAGE QUERIES ============

export async function addMessage(messageId: string, sessionId: string, role: "user" | "assistant", content: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(messages).values({
    id: messageId,
    sessionId,
    role,
    content,
  });
}

export async function getSessionMessages(sessionId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(messages)
    .where(eq(messages.sessionId, sessionId))
    .orderBy(messages.createdAt);
}

// ============ MOOD QUERIES ============

export async function logMood(moodLogId: string, sessionId: string, userId: number | null, preMood: number | null, postMood: number | null, preNote?: string, postNote?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if mood log already exists
  const existing = await db
    .select()
    .from(moodLogs)
    .where(eq(moodLogs.id, moodLogId))
    .limit(1);

  if (existing.length > 0) {
    // Update existing mood log
    await db
      .update(moodLogs)
      .set({ preMood, postMood, preNote, postNote })
      .where(eq(moodLogs.id, moodLogId));
  } else {
    // Create new mood log
    await db.insert(moodLogs).values({
      id: moodLogId,
      sessionId,
      userId,
      preMood,
      postMood,
      preNote,
      postNote,
    });
  }
}

export async function updateMoodLog(moodLogId: string, postMood: number, postNote?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(moodLogs)
    .set({ postMood, postNote })
    .where(eq(moodLogs.id, moodLogId));
}

export async function getUserMoodLogs(userId: number, limit: number = 100) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(moodLogs)
    .where(eq(moodLogs.userId, userId))
    .orderBy(desc(moodLogs.createdAt))
    .limit(limit);
}

// ============ SESSION SUMMARY QUERIES ============

export async function createSessionSummary(summaryId: string, sessionId: string, fullSummary: string, keyTopics?: string, emotionalInsights?: string, suggestedNextSteps?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(sessionSummaries).values({
    id: summaryId,
    sessionId,
    fullSummary,
    keyTopics,
    emotionalInsights,
    suggestedNextSteps,
  });
}

export async function getSessionSummary(sessionId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(sessionSummaries)
    .where(eq(sessionSummaries.sessionId, sessionId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

// ============ CRISIS ALERT QUERIES ============

export async function logCrisisAlert(alertId: string, sessionId: string, userId: number | null, messageId: string, crisisType: "self_harm" | "suicide" | "harm_to_others", confidenceScore?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(crisisAlerts).values({
    id: alertId,
    sessionId,
    userId,
    messageId,
    crisisType,
    confidenceScore: confidenceScore ? confidenceScore.toString() as any : undefined,
    resourcesShown: true,
  });
}

export async function getCrisisAlerts(sessionId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(crisisAlerts)
    .where(eq(crisisAlerts.sessionId, sessionId));
}

// ============ AFFIRMATION QUERIES ============

export async function getRandomAffirmation(language: string = "en") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get a random affirmation for the language
  const result = await db
    .select()
    .from(affirmations)
    .where(eq(affirmations.language, language))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function getAllAffirmations(language: string = "en") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(affirmations)
    .where(eq(affirmations.language, language));
}

// ============ BREATHING EXERCISE QUERIES ============

export async function getBreathingExercises(language: string = "en") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(breathingExercises)
    .where(eq(breathingExercises.language, language));
}

export async function getBreathingExercise(exerciseId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(breathingExercises)
    .where(eq(breathingExercises.id, exerciseId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

// ============ SESSION EXPORT QUERIES ============

export async function createSessionExport(exportId: string, sessionId: string, userId: number | null, format: "pdf" | "text", fileKey?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(sessionExports).values({
    id: exportId,
    sessionId,
    userId,
    format,
    fileKey,
  });
}

export async function getSessionExports(sessionId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(sessionExports)
    .where(eq(sessionExports.sessionId, sessionId));
}
