import type { Express } from "express";
import OpenAI from "openai";
import { db } from "../db";
import { eq, desc } from "drizzle-orm";
import { looksmaxxAnalyses, looksmaxxProtocols, looksmaxxTreatments } from "@shared/schema";
import { buildAiContext } from "../utils/ai-context";
import { validatePhotos, sanitizeAiResponse, rateLimitMiddleware } from "../utils/validation";
import { AI_SYSTEM_CONTEXT, LOOKSMAXXING_KNOWLEDGE, LOOKSMAXXING_DISCLAIMER } from "../knowledge";

const openai = new OpenAI({
  // Allow server to boot even if keys aren't set yet.
  // Requests will fail with 401 until a real key is provided.
  apiKey: process.env.OPENAI_API_KEY || "missing",
});

export function registerLooksmaxxRoutes(app: Express) {
  // ============================================
  // Looksmaxx API Endpoints
  // ============================================
  app.post("/api/looksmaxx/analyze-face", async (req, res) => {
    try {
      const { photos, profile: incomingProfile, userId, profileId } = req.body;
      const aiContext = await buildAiContext({
        profile: incomingProfile,
        profileId,
        userId,
      });
      const profile = aiContext.profile || incomingProfile;
      const resolvedProfileId =
        aiContext.profile?.id || incomingProfile?.id || profileId;

      if (!photos?.front && !photos?.side && !photos?.angle) {
        return res.status(400).json({
          error: "No photos provided",
          message: "Upload front or side facial photos for analysis.",
        });
      }

      const imageMessages: any[] = [];
      if (photos?.front) {
        imageMessages.push({
          type: "image_url",
          image_url: { url: photos.front, detail: "high" },
        });
      }
      if (photos?.side) {
        imageMessages.push({
          type: "image_url",
          image_url: { url: photos.side, detail: "high" },
        });
      }
      if (photos?.angle) {
        imageMessages.push({
          type: "image_url",
          image_url: { url: photos.angle, detail: "high" },
        });
      }

      const prompt = `${AI_SYSTEM_CONTEXT}

You are an expert facial aesthetics analyst. Provide a neutral, descriptive analysis based only on what is visible.
If a feature is not visible, use "not_visible".

Return JSON:
{
  "overallAssessment": "1-2 sentence summary",
  "gonialAngle": { "value": "estimate or not_visible", "notes": "short note" },
  "maxillaryProjection": { "value": "estimate or not_visible", "notes": "short note" },
  "zygomaticWidth": { "value": "estimate or not_visible", "notes": "short note" },
  "buccalFat": { "value": "low/medium/high/not_visible", "notes": "short note" },
  "mandibleWidth": { "value": "estimate or not_visible", "notes": "short note" },
  "facialThirds": { "value": "balanced/imbalanced/not_visible", "notes": "short note" },
  "canthalTilt": { "value": "estimate or not_visible", "notes": "short note" },
  "ipd": { "value": "estimate or not_visible", "notes": "short note" },
  "noseChinAlignment": { "value": "aligned/misaligned/not_visible", "notes": "short note" },
  "confidence": "low/medium/high"
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "Return only JSON." },
          {
            role: "user",
            content: [{ type: "text", text: prompt }, ...imageMessages],
          },
        ],
        max_tokens: 1500,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content || "{}";
      const analysis = JSON.parse(content);

      if (resolvedProfileId) {
        await db.insert(looksmaxxAnalyses).values({
          profileId: resolvedProfileId,
          analysis,
          photoType: "face",
          photoData: photos?.front || photos?.side || photos?.angle || null,
        });
      }

      // Sanitize AI response before sending
      const sanitizedAnalysis = sanitizeAiResponse(analysis);
      res.json({ analysis: sanitizedAnalysis, disclaimer: LOOKSMAXXING_DISCLAIMER });
    } catch (error) {
      console.error("[Looksmaxx] analyze-face error:", error);
      res.status(500).json({ error: "Failed to analyze face" });
    }
  });

  app.post("/api/looksmaxx/generate-protocol", async (req, res) => {
    try {
      const {
        profile: incomingProfile,
        protocolType,
        userId,
        profileId,
      } = req.body;
      const aiContext = await buildAiContext({
        profile: incomingProfile,
        profileId,
        userId,
      });
      const profile = aiContext.profile || incomingProfile;
      const resolvedProfileId =
        aiContext.profile?.id || incomingProfile?.id || profileId;

      if (!protocolType) {
        return res.status(400).json({ error: "protocolType is required" });
      }

      const protocol =
        LOOKSMAXXING_KNOWLEDGE.protocols[
        protocolType as keyof typeof LOOKSMAXXING_KNOWLEDGE.protocols
        ];
      if (!protocol) {
        return res.status(404).json({ error: "Unknown protocol type" });
      }

      const payload = {
        protocolType,
        protocol,
        profileSummary: {
          age: profile?.age || "Unknown",
          sex: profile?.sex || "Unknown",
          goal: profile?.goal || "Unknown",
        },
        disclaimer: LOOKSMAXXING_DISCLAIMER,
      };

      if (resolvedProfileId) {
        await db.insert(looksmaxxProtocols).values({
          profileId: resolvedProfileId,
          protocolType,
          payload,
        });
      }

      res.json(payload);
    } catch (error) {
      console.error("[Looksmaxx] generate-protocol error:", error);
      res.status(500).json({ error: "Failed to generate protocol" });
    }
  });

  app.get("/api/looksmaxx/compounds", async (req, res) => {
    res.json({
      compounds: LOOKSMAXXING_KNOWLEDGE.boneGrowthMethods.compounds,
      skinPeptides: LOOKSMAXXING_KNOWLEDGE.skinOptimization.peptides,
      disclaimer: LOOKSMAXXING_DISCLAIMER,
    });
  });

  app.post("/api/looksmaxx/log-treatment", async (req, res) => {
    try {
      const { profileId, treatmentType, durationMinutes, notes } = req.body;
      if (!profileId || !treatmentType) {
        return res
          .status(400)
          .json({ error: "profileId and treatmentType are required" });
      }

      const [entry] = await db
        .insert(looksmaxxTreatments)
        .values({
          profileId,
          treatmentType,
          durationMinutes: durationMinutes || null,
          notes: notes || null,
        })
        .returning();

      res.json(entry);
    } catch (error) {
      console.error("[Looksmaxx] log-treatment error:", error);
      res.status(500).json({ error: "Failed to log treatment" });
    }
  });

  app.get("/api/looksmaxx/progress", async (req, res) => {
    try {
      const profileId = req.query.profileId as string;
      if (!profileId) {
        return res.status(400).json({ error: "profileId is required" });
      }

      const analyses = await db
        .select()
        .from(looksmaxxAnalyses)
        .where(eq(looksmaxxAnalyses.profileId, profileId))
        .orderBy(desc(looksmaxxAnalyses.createdAt))
        .limit(10);

      const treatments = await db
        .select()
        .from(looksmaxxTreatments)
        .where(eq(looksmaxxTreatments.profileId, profileId))
        .orderBy(desc(looksmaxxTreatments.createdAt))
        .limit(30);

      res.json({ analyses, treatments });
    } catch (error) {
      console.error("[Looksmaxx] progress error:", error);
      res.status(500).json({ error: "Failed to fetch progress" });
    }
  });
}
