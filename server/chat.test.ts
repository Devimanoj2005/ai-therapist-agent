import { describe, expect, it, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { nanoid } from "nanoid";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createTestContext(userId?: number): TrpcContext {
  const user: AuthenticatedUser | undefined = userId
    ? {
        id: userId,
        openId: `test-user-${userId}`,
        email: `test${userId}@example.com`,
        name: `Test User ${userId}`,
        loginMethod: "manus",
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      }
    : undefined;

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("chat router", () => {
  describe("startSession", () => {
    it("creates a new session for anonymous user", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.chat.startSession({ language: "en" });

      expect(result.sessionId).toBeDefined();
      expect(result.moodLogId).toBeDefined();
      expect(typeof result.sessionId).toBe("string");
      expect(typeof result.moodLogId).toBe("string");
    });

    it("creates a new session for authenticated user", async () => {
      const ctx = createTestContext(1);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.chat.startSession({ language: "en" });

      expect(result.sessionId).toBeDefined();
      expect(result.moodLogId).toBeDefined();
    });

    it("supports different languages", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.chat.startSession({ language: "es" });

      expect(result.sessionId).toBeDefined();
    });
  });

  describe("sendMessage", () => {
    it("sends a message and receives a response", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      // Start a session first
      const sessionResult = await caller.chat.startSession({ language: "en" });

      // Send a message
      const messageResult = await caller.chat.sendMessage({
        sessionId: sessionResult.sessionId,
        message: "I've been feeling anxious lately",
        moodLogId: sessionResult.moodLogId,
        preMood: 4,
      });

      expect(messageResult.isCrisis).toBe(false);
      expect(messageResult.message).toBeDefined();
      expect(typeof messageResult.message).toBe("string");
      expect(messageResult.message.length).toBeGreaterThan(0);
    });

    it("detects crisis keywords - suicide", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const sessionResult = await caller.chat.startSession({ language: "en" });

      const messageResult = await caller.chat.sendMessage({
        sessionId: sessionResult.sessionId,
        message: "I want to end my life",
        moodLogId: sessionResult.moodLogId,
        preMood: 1,
      });

      expect(messageResult.isCrisis).toBe(true);
      expect(messageResult.crisisType).toBe("suicide");
      expect(messageResult.message).toContain("crisis");
    });

    it("detects crisis keywords - self harm", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const sessionResult = await caller.chat.startSession({ language: "en" });

      const messageResult = await caller.chat.sendMessage({
        sessionId: sessionResult.sessionId,
        message: "I've been cutting myself",
        moodLogId: sessionResult.moodLogId,
        preMood: 2,
      });

      expect(messageResult.isCrisis).toBe(true);
      expect(messageResult.crisisType).toBe("self_harm");
    });

    it("detects crisis keywords - harm to others", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const sessionResult = await caller.chat.startSession({ language: "en" });

      const messageResult = await caller.chat.sendMessage({
        sessionId: sessionResult.sessionId,
        message: "I have violent thoughts about hurting someone",
        moodLogId: sessionResult.moodLogId,
        preMood: 3,
      });

      expect(messageResult.isCrisis).toBe(true);
      expect(messageResult.crisisType).toBe("harm_to_others");
    });

    it("handles non-existent session", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.chat.sendMessage({
          sessionId: "non-existent-session",
          message: "Hello",
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.code).toBe("NOT_FOUND");
      }
    });
  });

  describe("endSession", () => {
    it("ends a session and generates a summary", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      // Start a session
      const sessionResult = await caller.chat.startSession({ language: "en" });

      // Send a message
      await caller.chat.sendMessage({
        sessionId: sessionResult.sessionId,
        message: "I've been working on my anxiety",
        moodLogId: sessionResult.moodLogId,
        preMood: 5,
      });

      // End the session
      const endResult = await caller.chat.endSession({
        sessionId: sessionResult.sessionId,
        moodLogId: sessionResult.moodLogId,
        postMood: 7,
      });

      expect(endResult.summaryId).toBeDefined();
      expect(endResult.summary).toBeDefined();
      expect(endResult.summary.summary).toBeDefined();
      expect(typeof endResult.summary.summary).toBe("string");
    });

    it("handles non-existent session", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.chat.endSession({
          sessionId: "non-existent-session",
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.code).toBe("NOT_FOUND");
      }
    });
  });
});

describe("sessions router", () => {
  describe("list", () => {
    it("requires authentication", async () => {
      const ctx = createTestContext(); // No user ID = anonymous
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.sessions.list({ limit: 20 });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.code).toBe("UNAUTHORIZED");
      }
    });

    it("returns empty list for user with no sessions", async () => {
      const ctx = createTestContext(1);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.sessions.list({ limit: 20 });

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe("get", () => {
    it("retrieves a session by ID", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      // Create a session
      const sessionResult = await caller.chat.startSession({ language: "en" });

      // Get the session
      const getResult = await caller.sessions.get({
        sessionId: sessionResult.sessionId,
      });

      expect(getResult.session).toBeDefined();
      expect(getResult.session.id).toBe(sessionResult.sessionId);
      expect(getResult.messages).toBeDefined();
      expect(Array.isArray(getResult.messages)).toBe(true);
    });

    it("handles non-existent session", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.sessions.get({ sessionId: "non-existent" });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.code).toBe("NOT_FOUND");
      }
    });
  });
});

describe("mood router", () => {
  describe("trends", () => {
    it("requires authentication", async () => {
      const ctx = createTestContext(); // No user ID = anonymous
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.mood.trends();
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.code).toBe("UNAUTHORIZED");
      }
    });

    it("returns mood trends for authenticated user", async () => {
      const ctx = createTestContext(1);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.mood.trends();

      expect(Array.isArray(result)).toBe(true);
    });
  });
});

describe("wellness router", () => {
  describe("getAffirmation", () => {
    it("returns an affirmation", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.wellness.getAffirmation({ language: "en" });

      expect(result).toBeDefined();
      expect(result.text).toBeDefined();
      expect(typeof result.text).toBe("string");
      expect(result.text.length).toBeGreaterThan(0);
    });

    it("supports different languages", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.wellness.getAffirmation({ language: "es" });

      expect(result).toBeDefined();
      expect(result.text).toBeDefined();
    });
  });

  describe("getBreathingExercises", () => {
    it("returns breathing exercises", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.wellness.getBreathingExercises({ language: "en" });

      expect(Array.isArray(result)).toBe(true);
    });
  });
});

describe("export router", () => {
  describe("exportSession", () => {
    it("exports a session as text", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      // Create and end a session
      const sessionResult = await caller.chat.startSession({ language: "en" });
      await caller.chat.sendMessage({
        sessionId: sessionResult.sessionId,
        message: "I'm feeling better today",
        moodLogId: sessionResult.moodLogId,
        preMood: 5,
      });
      await caller.chat.endSession({
        sessionId: sessionResult.sessionId,
        moodLogId: sessionResult.moodLogId,
        postMood: 8,
      });

      // Export the session
      const exportResult = await caller.export.exportSession({
        sessionId: sessionResult.sessionId,
        format: "text",
      });

      expect(exportResult.exportId).toBeDefined();
      expect(exportResult.format).toBe("text");
      expect(exportResult.summary).toBeDefined();
      expect(exportResult.summary.content).toBeDefined();
    });

    it("handles non-existent session", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.export.exportSession({
          sessionId: "non-existent",
          format: "text",
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.code).toBe("NOT_FOUND");
      }
    });
  });
});
