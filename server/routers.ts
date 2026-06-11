import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { nanoid } from "nanoid";
import { invokeLLM } from "./_core/llm";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

// ============ CRISIS DETECTION ============

const CRISIS_KEYWORDS = {
  self_harm: [
    "cut myself", "cutting", "self-harm", "self harm", "hurt myself", "injure myself",
    "blade", "knife", "razor", "burn myself", "poison", "overdose"
  ],
  suicide: [
    "suicide", "suicidal", "kill myself", "end my life", "no point living", "want to die",
    "better off dead", "harm myself", "take my life"
  ],
  harm_to_others: [
    "hurt someone", "harm others", "kill someone", "violent thoughts", "hurt my family",
    "harm children", "attack someone"
  ]
};

function detectCrisis(content: string): { detected: boolean; type?: "self_harm" | "suicide" | "harm_to_others" } {
  const lowerContent = content.toLowerCase();
  
  for (const [type, keywords] of Object.entries(CRISIS_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerContent.includes(keyword)) {
        return { detected: true, type: type as any };
      }
    }
  }
  
  return { detected: false };
}

// ============ CHAT ROUTER ============

const chatRouter = router({
  startSession: publicProcedure
    .input(z.object({
      language: z.string().default("en"),
    }))
    .mutation(async ({ input, ctx }) => {
      const sessionId = nanoid();
      const userId = ctx.user?.id ?? null;
      
      await db.createSession(sessionId, userId, input.language);
      
      // Create a mood log for this session
      const moodLogId = nanoid();
      await db.logMood(moodLogId, sessionId, userId, null, null);
      
      return {
        sessionId,
        moodLogId,
      };
    }),

  sendMessage: publicProcedure
    .input(z.object({
      sessionId: z.string(),
      message: z.string(),
      moodLogId: z.string().optional(),
      preMood: z.number().int().min(1).max(10).optional(),
    }))
    .mutation(async ({ input }) => {
      const messageId = nanoid();
      const session = await db.getSession(input.sessionId);
      
      if (!session) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Session not found" });
      }

      // Add user message
      await db.addMessage(messageId, input.sessionId, "user", input.message);

      // Log pre-mood if provided
      if (input.moodLogId && input.preMood) {
        await db.logMood(input.moodLogId, input.sessionId, session.userId, input.preMood, null);
      }

      // Check for crisis
      const crisisCheck = detectCrisis(input.message);
      if (crisisCheck.detected) {
        const alertId = nanoid();
        await db.logCrisisAlert(
          alertId,
          input.sessionId,
          session.userId,
          messageId,
          crisisCheck.type!,
          0.9
        );

        return {
          isCrisis: true,
          crisisType: crisisCheck.type,
          message: "If you or someone you know is in crisis, please reach out to emergency services or a crisis helpline immediately.",
        };
      }

      // Get conversation history for context
      const messages = await db.getSessionMessages(input.sessionId);
      const conversationHistory = messages.map(msg => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      }));

      // Add current user message to history
      conversationHistory.push({
        role: "user",
        content: input.message,
      });

      // Generate AI response
      const systemPrompt = `You are a compassionate, empathetic AI wellness companion. Your role is to listen without judgment and provide supportive guidance. 

IMPORTANT DISCLAIMER: You are NOT a licensed therapist and cannot provide medical diagnoses or treatment. If the user mentions serious mental health concerns, self-harm, or suicide, you must encourage them to seek professional help immediately.

Guidelines:
- Be warm, genuine, and non-judgmental
- Ask meaningful follow-up questions that encourage reflection
- Suggest healthy coping strategies when appropriate
- Validate their feelings
- Encourage self-compassion and self-care
- If they mention crisis situations, provide crisis resources and strongly encourage professional help
- Keep responses concise but meaningful (2-3 paragraphs)
- Use their language and cultural context when available`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          ...conversationHistory,
        ],
      });

      const aiContent = response.choices[0]?.message?.content;
      const aiMessage = typeof aiContent === 'string' ? aiContent : "I'm here to listen. Could you tell me more about what you're experiencing?";

      // Add AI response to database
      const aiMessageId = nanoid();
      await db.addMessage(aiMessageId, input.sessionId, "assistant", aiMessage);

      return {
        isCrisis: false,
        message: aiMessage,
      };
    }),

  endSession: publicProcedure
    .input(z.object({
      sessionId: z.string(),
      postMood: z.number().int().min(1).max(10).optional(),
      moodLogId: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const session = await db.getSession(input.sessionId);
      
      if (!session) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Session not found" });
      }

      // Update mood if provided
      if (input.moodLogId && input.postMood) {
        await db.updateMoodLog(input.moodLogId, input.postMood);
      }

      // Get all messages for summary
      const messages = await db.getSessionMessages(input.sessionId);
      
      // Generate session summary
      const summaryPrompt = `Based on this therapy conversation, provide a structured summary in JSON format with these fields:
- keyTopics: array of main topics discussed
- emotionalInsights: key emotional themes or patterns observed
- suggestedNextSteps: practical suggestions for continued wellness
- summary: a 2-3 paragraph narrative summary

Conversation:
${messages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n')}

Return ONLY valid JSON, no markdown or extra text.`;

      const summaryResponse = await invokeLLM({
        messages: [
          { role: "user", content: summaryPrompt },
        ],
      });

      let summaryData: any = {
        keyTopics: [],
        emotionalInsights: "",
        suggestedNextSteps: "",
        summary: "Thank you for sharing your thoughts and feelings today. Your openness is a sign of strength.",
      };

      try {
        const summaryContent = summaryResponse.choices[0]?.message?.content;
        const summaryText = typeof summaryContent === 'string' ? summaryContent : "";
        summaryData = JSON.parse(summaryText);
      } catch (e) {
        console.error("Failed to parse summary JSON:", e);
      }

      // Save summary
      const summaryId = nanoid();
      await db.createSessionSummary(
        summaryId,
        input.sessionId,
        summaryData.summary,
        JSON.stringify(summaryData.keyTopics),
        summaryData.emotionalInsights,
        summaryData.suggestedNextSteps
      );

      // End the session
      await db.endSession(input.sessionId);

      // Generate a title from first user message
      const firstUserMessage = messages.find(m => m.role === "user");
      if (firstUserMessage) {
        const titlePrompt = `Create a short, descriptive title (max 50 chars) for a therapy session based on this opening message: "${firstUserMessage.content}"`;
        const titleResponse = await invokeLLM({
          messages: [{ role: "user", content: titlePrompt }],
        });
        const titleContent = titleResponse.choices[0]?.message?.content;
        const title = (typeof titleContent === 'string' ? titleContent : "Therapy Session").slice(0, 50);
        await db.updateSessionTitle(input.sessionId, title);
      }

      return {
        summaryId,
        summary: summaryData,
      };
    }),
});

// ============ SESSIONS ROUTER ============

const sessionsRouter = router({
  list: protectedProcedure
    .input(z.object({
      limit: z.number().int().default(20),
      offset: z.number().int().default(0),
    }))
    .query(async ({ input, ctx }) => {
      const userSessions = await db.getUserSessions(ctx.user!.id, input.limit, input.offset);
      
      // Get summaries for each session
      const sessionsWithSummaries = await Promise.all(
        userSessions.map(async (session) => {
          const summary = await db.getSessionSummary(session.id);
          return { ...session, summary };
        })
      );

      return sessionsWithSummaries;
    }),

  get: publicProcedure
    .input(z.object({
      sessionId: z.string(),
    }))
    .query(async ({ input }) => {
      const session = await db.getSession(input.sessionId);
      if (!session) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Session not found" });
      }

      const messages = await db.getSessionMessages(input.sessionId);
      const summary = await db.getSessionSummary(input.sessionId);

      return { session, messages, summary };
    }),

  delete: protectedProcedure
    .input(z.object({
      sessionId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const session = await db.getSession(input.sessionId);
      if (!session) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Session not found" });
      }

      if (session.userId !== ctx.user!.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Cannot delete another user's session" });
      }

      // Archive instead of delete for data preservation
      // In a real app, you'd implement a soft delete
      return { success: true };
    }),
});

// ============ MOOD ROUTER ============

const moodRouter = router({
  trends: protectedProcedure
    .query(async ({ ctx }) => {
      const moodLogs = await db.getUserMoodLogs(ctx.user!.id);
      
      return moodLogs.map(log => ({
        date: log.createdAt,
        preMood: log.preMood,
        postMood: log.postMood,
        improvement: log.postMood && log.preMood ? log.postMood - log.preMood : null,
      }));
    }),
});

// ============ WELLNESS ROUTER ============

const wellnessRouter = router({
  getAffirmation: publicProcedure
    .input(z.object({
      language: z.string().default("en"),
    }))
    .query(async ({ input }) => {
      const affirmation = await db.getRandomAffirmation(input.language);
      return affirmation || {
        text: "You are worthy of love, care, and compassion.",
        language: input.language,
        category: "general",
      };
    }),

  getBreathingExercises: publicProcedure
    .input(z.object({
      language: z.string().default("en"),
    }))
    .query(async ({ input }) => {
      return await db.getBreathingExercises(input.language);
    }),

  getBreathingExercise: publicProcedure
    .input(z.object({
      exerciseId: z.string(),
    }))
    .query(async ({ input }) => {
      const exercise = await db.getBreathingExercise(input.exerciseId);
      if (!exercise) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Exercise not found" });
      }
      return exercise;
    }),
});

// ============ EXPORT ROUTER ============

const exportRouter = router({
  exportSession: publicProcedure
    .input(z.object({
      sessionId: z.string(),
      format: z.enum(["pdf", "text"]),
    }))
    .mutation(async ({ input, ctx }) => {
      const session = await db.getSession(input.sessionId);
      if (!session) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Session not found" });
      }

      const summary = await db.getSessionSummary(input.sessionId);
      if (!summary) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Session summary not found" });
      }

      // Create export record
      const exportId = nanoid();
      await db.createSessionExport(exportId, input.sessionId, session.userId, input.format);

      // Return export data (actual file generation happens on frontend or in a separate service)
      return {
        exportId,
        sessionId: input.sessionId,
        format: input.format,
        summary: {
          title: session.title,
          date: session.createdAt,
          content: summary.fullSummary,
          keyTopics: summary.keyTopics,
          emotionalInsights: summary.emotionalInsights,
          suggestedNextSteps: summary.suggestedNextSteps,
        },
      };
    }),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  chat: chatRouter,
  sessions: sessionsRouter,
  mood: moodRouter,
  wellness: wellnessRouter,
  export: exportRouter,
});

export type AppRouter = typeof appRouter;
