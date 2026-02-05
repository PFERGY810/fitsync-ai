import type { Express } from "express";
import OpenAI from "openai";
import { db } from "../db";
import { eq, desc, and } from "drizzle-orm";
import {
  profiles,
  cycleInfo,
  macroTargets,
  generatedPrograms,
  dailyCheckIns,
  workoutSessions,
  analysisJobs,
} from "@shared/schema";
import { buildAiContext } from "../utils/ai-context";
import { validatePhotos, sanitizeAiResponse, rateLimitMiddleware } from "../utils/validation";
import { validateProfilePayload } from "../validation";
import { encryptPayload } from "../utils/encryption";
import {
  HYPERTROPHY_SCIENCE,
  TRAINING_SPLITS,
  PROGRESSIVE_OVERLOAD_METHODS,
  MUSCLE_ANATOMY,
  BIOMECHANICS_PRINCIPLES,
  GOLDEN_RATIO_PROPORTIONS,
  STEROID_PHARMACOLOGY,
  CYCLE_PROTOCOLS,
  HGH_PROTOCOLS,
  INSULIN_PROTOCOLS,
  ANDROGEN_RECEPTOR_OPTIMIZATION,
  INSULIN_SENSITIVITY_OPTIMIZATION,
  SHBG_MANIPULATION,
  NUTRITION_SCIENCE,
  BODYBUILDING_NUTRITION,
  GROCERY_CATEGORIES,
  POSTURE_ISSUES,
  POSTURE_WARMUPS,
  POSTURE_SUPPLEMENTS,
  EXERCISE_FORM_DATABASE,
  STRENGTH_STANDARDS,
  WARMUP_TIMING,
  BODYBUILDING_COACHING,
  WEAK_POINT_PRIORITIZATION,
  AI_SYSTEM_CONTEXT,
  getMedicationImpacts,
} from "../knowledge";

const openai = new OpenAI({
  // Allow server to boot even if keys aren't set yet.
  // Requests will fail with 401 until a real key is provided.
  apiKey: process.env.OPENAI_API_KEY || "missing",
});

function parseBodyFatEstimate(estimate?: string): number | null {
  if (!estimate) return null;
  const matches = estimate.match(/\d+(\.\d+)?/g);
  if (!matches || matches.length === 0) return null;
  const values = matches.map((value) => parseFloat(value)).filter((v) => !Number.isNaN(v));
  if (!values.length) return null;
  const avg = values.reduce((sum, value) => sum + value, 0) / values.length;
  return avg / 100;
}

type PhysiqueAnalysisPayload = {
  photos: {
    front?: string;
    side?: string;
    back?: string;
    legs?: string;
  };
  profile?: any;
  userId?: string;
  profileId?: string;
};

export async function runPhysiqueAnalysis(payload: PhysiqueAnalysisPayload) {
  const { photos, profile: incomingProfile, userId, profileId } = payload;
  const aiContext = await buildAiContext({
    profile: incomingProfile,
    profileId,
    userId,
  });
  const profile = aiContext.profile || incomingProfile;

  console.log("=== PHYSIQUE ANALYSIS REQUEST ===");
  console.log("Photos received:", {
    front: photos?.front
      ? `${photos.front.substring(0, 50)}... (${photos.front.length} chars)`
      : "none",
    side: photos?.side
      ? `${photos.side.substring(0, 50)}... (${photos.side.length} chars)`
      : "none",
    back: photos?.back
      ? `${photos.back.substring(0, 50)}... (${photos.back.length} chars)`
      : "none",
    legs: photos?.legs
      ? `${photos.legs.substring(0, 50)}... (${photos.legs.length} chars)`
      : "none",
  });
  console.log("Profile stats:", {
    height: profile?.height,
    weight: profile?.weight,
    age: profile?.age,
    sex: profile?.sex,
    goal: profile?.goal,
  });

  const hasPhotos =
    photos && (photos.front || photos.side || photos.back || photos.legs);
  if (!hasPhotos) {
    throw new Error("No photos provided for analysis");
  }

  const photoDescriptions = [];
  if (photos?.front) photoDescriptions.push("front pose");
  if (photos?.side) photoDescriptions.push("side pose");
  if (photos?.back) photoDescriptions.push("back pose");
  if (photos?.legs) photoDescriptions.push("legs pose (quad focus)");

  const cycleContext =
    profile?.cycleInfo?.compounds?.length > 0
      ? `Enhanced lifter on: ${profile.cycleInfo.compounds.map((c: any) => `${c.name} ${c.dosageAmount}${c.dosageUnit}`).join(", ")}`
      : "Natural lifter";

  const strengthContext = profile?.strengthGoals
    ? `
Current Lifts:
- Bench: ${profile.strengthGoals.bench?.current || 0} lbs (target: ${profile.strengthGoals.bench?.target || 0} lbs)
- Squat: ${profile.strengthGoals.squat?.current || 0} lbs (target: ${profile.strengthGoals.squat?.target || 0} lbs)
- Deadlift: ${profile.strengthGoals.deadlift?.current || 0} lbs (target: ${profile.strengthGoals.deadlift?.target || 0} lbs)
- OHP: ${profile.strengthGoals.ohp?.current || 0} lbs (target: ${profile.strengthGoals.ohp?.target || 0} lbs)
- Pull-ups: ${profile.strengthGoals.pullups?.current || 0} reps (target: ${profile.strengthGoals.pullups?.target || 0} reps)`
    : "";

  // Determine which muscles are visible based on photo angles
  const visibleMuscles: string[] = [];
  const visiblePostureChecks: string[] = [];

  if (photos?.front) {
    visibleMuscles.push(
      "Chest (Pectorals)",
      "Shoulders (Front Deltoids)",
      "Arms (Biceps visible, Triceps partial)",
      "Core (Abs & Obliques)",
      "Quadriceps (front view)",
    );
    visiblePostureChecks.push(
      "shoulder symmetry",
      "rib flare",
      "hip alignment",
      "quad symmetry",
    );
  }
  if (photos?.side) {
    visibleMuscles.push(
      "Shoulders (Side Deltoids)",
      "Arms (Triceps profile)",
      "Glutes (side profile)",
      "Hamstrings (side view)",
      "Calves (side view)",
    );
    visiblePostureChecks.push(
      "anterior pelvic tilt",
      "kyphosis/rounded upper back",
      "forward head posture",
      "knee hyperextension",
    );
  }
  if (photos?.back) {
    visibleMuscles.push(
      "Back (Lats, Traps, Rhomboids)",
      "Shoulders (Rear Deltoids)",
      "Glutes (back view)",
      "Hamstrings (back view)",
      "Calves (back view)",
    );
    visiblePostureChecks.push(
      "scapular winging",
      "spinal alignment",
      "hip height symmetry",
      "lat width symmetry",
    );
  }
  if (photos?.legs) {
    visibleMuscles.push(
      "Quadriceps (detailed - vastus lateralis, rectus femoris, vastus medialis)",
      "Hamstrings (front view partial)",
      "Calves (gastrocnemius, soleus)",
      "Adductors",
    );
    visiblePostureChecks.push(
      "quad sweep development",
      "VMO development",
      "calf symmetry",
      "knee valgus",
    );
  }

  const prompt = `${AI_SYSTEM_CONTEXT}

You are an expert physique analyst performing REAL VISUAL ANALYSIS of these photos. This is NOT a generic assessment.

**CRITICAL: YOU MUST ACTUALLY LOOK AT THE PHOTOS AND DESCRIBE SPECIFIC VISUAL DETAILS**

**MANDATORY VISUAL DESCRIPTION REQUIREMENTS - YOU MUST INCLUDE ALL OF THESE:**

1. LIGHTING CONDITIONS: Describe the lighting (harsh gym lighting, natural window light, dim, shadows present, etc.)

2. VISIBLE VASCULARITY: 
   - Are veins visible? YES/NO
   - If YES, specify EXACTLY where: "biceps veins visible", "forearm vascularity prominent", "deltoid veins showing", "abdominal veins visible", "quad veins visible", etc.
   - If NO, state "no visible vascularity"

3. MUSCLE STRIATIONS:
   - Can you see striations? YES/NO
   - If YES, specify which muscles: "striations visible in deltoids when flexed", "quad striations visible", "chest striations showing", etc.
   - If NO, state "no visible striations"

4. ABDOMINAL DEFINITION:
   - How many "packs" are visible? (0, 2, 4, 6, 8)
   - Describe the definition: "upper abs visible but lower abs not defined", "full six-pack visible with deep separations", "abs barely visible", etc.

5. QUAD ANALYSIS (if legs photo provided):
   - Quad sweep appearance: "outer quad (vastus lateralis) shows good sweep", "vastus lateralis appears flat/underdeveloped", "quad sweep is minimal"
   - VMO (teardrop) visibility: "VMO clearly visible above knee", "VMO barely visible", "VMO not visible - underdeveloped"
   - Overall quad development: "quads appear well-developed with good separation", "quads look flat with minimal definition"

6. PUMP STATE:
   - Is this a pumped or relaxed state? "appears pumped - muscles look full", "relaxed state - minimal pump", "moderate pump visible"

7. POSE DESCRIPTION:
   - Describe the exact pose: "front pose with arms relaxed at sides", "side pose facing right", "back pose with arms relaxed", "legs pose showing quads"

PHOTO ANGLES PROVIDED: ${photoDescriptions.join(", ") || "none"}
VISIBLE MUSCLE GROUPS: ${visibleMuscles.join(", ") || "none"}
VISIBLE POSTURE CHECKS: ${visiblePostureChecks.join(", ") || "none"}

ATHLETE PROFILE:
Age: ${profile?.age || "Unknown"}
Weight: ${profile?.weight || "Unknown"} ${profile?.weightUnit || "lbs"}
Height: ${profile?.height || "Unknown"} ${profile?.heightUnit || "cm"}
Goal: ${profile?.goal || "Unknown"}
Experience: ${profile?.experienceLevel || "Unknown"}
Cycle Status: ${cycleContext}
${strengthContext}

Provide the response in JSON only, with this exact structure:
{
  "overallRating": 0-100,
  "overallSummary": "string",
  "bodyFatEstimate": "string with % range",
  "bodyFatConfidence": "low|medium|high",
  "symmetryScore": 0-100,
  "proportionScore": 0-100,
  "muscleRatings": [
    {
      "muscle": "string",
      "rating": 1-10,
      "status": "underdeveloped|average|strong|dominant",
      "observations": ["string (MUST reference specific visual details like striations, shadowing, or lack of thickness)"],
      "visualKeywords": ["<3-4 specific clinical/visual markers you see for this muscle (e.g., 'distal quad separation', 'lower lat insertion visibility', 'serratus anterior definition')>"],
      "priority": "high|medium|low"
    }
  ],
  "weakPoints": ["string"],
  "strongPoints": ["string"],
  "postureIssues": [
    {
      "issue": "string",
      "severity": "mild|moderate|severe",
      "description": "string"
    }
  ],
  "trainingRecommendations": ["string"],
  "nutritionNotes": ["string"],
  "priorityExercises": [
    {
      "exercise": "string",
      "sets": number,
      "reps": "string",
      "focus": "string"
    }
  ],
  "visualObservations": [
    "Lighting: <details>",
    "Vascularity: <details>",
    "Striations: <details>",
    "Abdominal definition: <details>",
    "Quad analysis: <details>",
    "Pump state: <details>",
    "Pose description: <details>"
  ],
  "cycleImpact": ${profile?.cycleInfo?.compounds?.length > 0 ? `"Your current protocol (${profile.cycleInfo.compounds.map((c: any) => c.name).join(", ")}) affects training: <specific recommendation>"` : "null"},
  "logicKeywords": ["<MANDATORY: 5-7 specific scientific/clinical keywords used in your logic (e.g., 'androgen receptor density', 'myofibrillar hypertrophy', 'half-life clearance', 'VMO-to-medial-distal ratio', etc.)>"]
}

RATING SCALE: 1-2=severely underdeveloped, 3-4=lagging, 5-6=average, 7-8=above average/strong, 9-10=exceptional/dominant

**DO NOT GIVE GENERIC SCORES.** If you rate quads as "6/average" but they look flat with no sweep in the photo, you are WRONG. Be HONEST.`;

  let responseData;

  if (hasPhotos) {
    const imageMessages: any[] = [];

    if (photos.front) {
      imageMessages.push({
        type: "image_url",
        image_url: { url: photos.front, detail: "high" },
      });
    }
    if (photos.side) {
      imageMessages.push({
        type: "image_url",
        image_url: { url: photos.side, detail: "high" },
      });
    }
    if (photos.back) {
      imageMessages.push({
        type: "image_url",
        image_url: { url: photos.back, detail: "high" },
      });
    }
    if (photos.legs) {
      imageMessages.push({
        type: "image_url",
        image_url: { url: photos.legs, detail: "high" },
      });
    }

    console.log("Analyzing physique with", imageMessages.length, "images");

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Use GPT-4o for vision capabilities
      messages: [
        {
          role: "system",
          content:
            "You are a brutally honest physique analyst. ACTUALLY LOOK at the provided photos and describe specific visual details you observe - veins, muscle separation, development levels, weak points. If quads look flat or underdeveloped, SAY SO. If there's no VMO teardrop visible, MENTION IT. Do NOT give generic 'average' scores to muscles that are clearly underdeveloped in the photos. Be HONEST like a real bodybuilding coach would be.",
        },
        {
          role: "user",
          content: [{ type: "text", text: prompt }, ...imageMessages],
        },
      ],
      max_tokens: 3000,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content || "{}";
    console.log("Physique analysis response received");
    responseData = JSON.parse(content);
  } else {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an expert physique analyst providing baseline assessments.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 3000,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content || "{}";
    responseData = JSON.parse(content);
  }

  const photoCoverage = {
    front: !!photos?.front,
    side: !!photos?.side,
    back: !!photos?.back,
    legs: !!photos?.legs,
  };
  const muscleVisibility: Record<string, boolean> = {
    chest: photoCoverage.front || photoCoverage.side,
    back: photoCoverage.back,
    shoulders: photoCoverage.front || photoCoverage.side || photoCoverage.back,
    arms: photoCoverage.front || photoCoverage.side || photoCoverage.back,
    abs: photoCoverage.front,
    core: photoCoverage.front,
    quads: photoCoverage.front || photoCoverage.legs,
    hamstrings: photoCoverage.side || photoCoverage.back || photoCoverage.legs,
    glutes: photoCoverage.side || photoCoverage.back,
    calves: photoCoverage.side || photoCoverage.back || photoCoverage.legs,
    legs:
      photoCoverage.front ||
      photoCoverage.side ||
      photoCoverage.back ||
      photoCoverage.legs,
  };
  const isMuscleVisible = (muscleName: string) => {
    const key = muscleName.toLowerCase();
    if (key.includes("chest") || key.includes("pec")) return muscleVisibility.chest;
    if (
      key.includes("back") ||
      key.includes("lat") ||
      key.includes("trap") ||
      key.includes("rhomboid")
    )
      return muscleVisibility.back;
    if (key.includes("shoulder") || key.includes("delt"))
      return muscleVisibility.shoulders;
    if (
      key.includes("arm") ||
      key.includes("bicep") ||
      key.includes("tricep")
    )
      return muscleVisibility.arms;
    if (key.includes("ab") || key.includes("core")) return muscleVisibility.abs;
    if (key.includes("quad")) return muscleVisibility.quads;
    if (key.includes("hamstring")) return muscleVisibility.hamstrings;
    if (key.includes("glute")) return muscleVisibility.glutes;
    if (key.includes("calf")) return muscleVisibility.calves;
    if (key.includes("leg")) return muscleVisibility.legs;
    return true;
  };

  responseData.muscleRatings = (responseData.muscleRatings || []).map(
    (rating: any) => {
      if (!rating?.muscle) return rating;
      if (!isMuscleVisible(rating.muscle)) {
        return {
          ...rating,
          rating: 0,
          status: "not_visible",
          observations: ["Not visible in uploaded photos"],
          priority: "low",
        };
      }
      return rating;
    },
  );

  const filterPoints = (points: any[]) =>
    (points || []).filter((point: any) => {
      if (typeof point !== "string") return true;
      return isMuscleVisible(point);
    });

  responseData.weakPoints = filterPoints(responseData.weakPoints);
  responseData.strongPoints = filterPoints(responseData.strongPoints);
  responseData.bodyFatConfidence =
    responseData.bodyFatConfidence ||
    (Object.values(photoCoverage).filter(Boolean).length >= 3
      ? "medium"
      : "low");
  responseData.photoCoverage = photoCoverage;
  responseData.createdAt = new Date().toISOString();

  // Sanitize AI response before returning
  const sanitizedResponse = sanitizeAiResponse(responseData);
  return sanitizedResponse;
}

export function registerCoachRoutes(app: Express) {
  // ============================================
  // AI COACH ENDPOINTS
  // ============================================

  app.post("/api/coach/chat", async (req, res) => {
    try {
      const {
        message,
        profile: incomingProfile,
        context,
        conversationHistory,
        userId,
        profileId,
      } = req.body;
      const aiContext = await buildAiContext({
        profile: incomingProfile,
        profileId,
        userId,
      });
      const profile = aiContext.profile || incomingProfile;
      const program = aiContext.program || context?.program;
      const macroTargets = aiContext.macroTargets || context?.macros;
      const physiqueAnalysis =
        profile?.physiqueAnalysis || context?.physiqueAnalysis;

      console.log("=== AI COACH CHAT REQUEST ===");
      console.log("Message:", message);
      console.log("Profile stats:", {
        age: profile?.age,
        weight: profile?.weight,
        height: profile?.height,
        goal: profile?.goal,
        experience: profile?.experienceLevel,
        isEnhanced: profile?.cycleInfo?.compounds?.length > 0,
      });
      console.log(
        "Conversation history length:",
        conversationHistory?.length || 0,
      );

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const isEnhanced = profile?.cycleInfo?.compounds?.length > 0;
      const cycleContext = isEnhanced
        ? `
CURRENT CYCLE PROTOCOL:
${profile.cycleInfo.compounds
          .map(
            (c: any) =>
              `- ${c.name}: ${c.dosageAmount}${c.dosageUnit} (${c.frequency || "2x/week"}, ${c.administrationMethod || "IM injection"})`,
          )
          .join("\n")}
Weeks In: ${profile.cycleInfo.weeksIn || 1}/${profile.cycleInfo.totalWeeks || 16}
Enhanced Status: YES - adjust all recommendations for improved recovery and nutrient partitioning`
        : "Enhanced Status: NO (Natural lifter)";

      const macroContext = macroTargets
        ? `
CURRENT MACROS:
- Calories: ${macroTargets.targetCalories || macroTargets.calories} kcal
- Protein: ${macroTargets.macros?.protein?.grams || macroTargets.protein}g
- Carbs: ${macroTargets.macros?.carbs?.grams || macroTargets.carbs}g
- Fat: ${macroTargets.macros?.fat?.grams || macroTargets.fat}g`
        : "";

      const programContext = program?.schedule
        ? `
CURRENT TRAINING PROGRAM: ${program.programName || "Custom"}
Training ${program.schedule?.length || 5} days per week`
        : "";

      const physiqueContext = physiqueAnalysis
        ? `
PHYSIQUE ANALYSIS:
- Overall Score: ${physiqueAnalysis.overallScore}/100
- Weak Points: ${physiqueAnalysis.weakPoints?.slice(0, 3).join(", ") || "None identified"}
- Strong Points: ${physiqueAnalysis.strongPoints?.slice(0, 3).join(", ") || "None identified"}
- Body Fat Estimate: ${physiqueAnalysis.bodyFatEstimate || "Unknown"}
${physiqueAnalysis.muscleRatings?.length > 0
          ? `- Muscle Ratings: ${physiqueAnalysis.muscleRatings
            .slice(0, 6)
            .map((m: any) => `${m.muscle}: ${m.rating}/10`)
            .join(", ")}`
          : ""
        }`
        : "";

      const strengthContext = profile?.strengthGoals
        ? `
STRENGTH GOALS:
- Bench Press: ${profile.strengthGoals.bench?.current || 0} lbs → ${profile.strengthGoals.bench?.target || 0} lbs
- Squat: ${profile.strengthGoals.squat?.current || 0} lbs → ${profile.strengthGoals.squat?.target || 0} lbs
- Deadlift: ${profile.strengthGoals.deadlift?.current || 0} lbs → ${profile.strengthGoals.deadlift?.target || 0} lbs
- OHP: ${profile.strengthGoals.ohp?.current || 0} lbs → ${profile.strengthGoals.ohp?.target || 0} lbs
- Pull-ups: ${profile.strengthGoals.pullups?.current || 0} reps → ${profile.strengthGoals.pullups?.target || 0} reps`
        : "";

      const medicationsList = profile?.medicationsWithDosage?.length
        ? profile.medicationsWithDosage
        : (profile?.medications || []).map((name: string) => ({ name }));
      const medicationImpacts = medicationsList?.length
        ? getMedicationImpacts(medicationsList)
        : null;
      const medicationsContext =
        medicationsList?.length > 0
          ? `
CURRENT MEDICATIONS:
${medicationsList.map((med: any) => `- ${med.name}${med.dosage ? ` (${med.dosage})` : ""}${med.frequency ? ` (${med.frequency})` : ""}`).join("\n")}`
          : "";
      const medicationImpactContext = medicationImpacts
        ? `
MEDICATION IMPACTS:
- Volume Multiplier: ${medicationImpacts.overallVolumeMultiplier.toFixed(2)}
- Frequency Multiplier: ${medicationImpacts.overallFrequencyMultiplier.toFixed(2)}
- Diet Impacts: ${medicationImpacts.dietImpacts.map((impact: any) => `${impact.medication}: ${impact.effects.map((e: any) => e.effect).join("; ")}`).join(" | ")}
- Training Impacts: ${medicationImpacts.trainingImpacts.map((impact: any) => `${impact.medication}: ${impact.effects.map((e: any) => e.effect).join("; ")}`).join(" | ")}
- Critical Notes: ${medicationImpacts.criticalNotes.join(" | ") || "None"}`
        : "";
      const checkInSummary = aiContext.checkIns?.length
        ? `
RECENT CHECK-INS (last ${aiContext.checkIns.length}):
${aiContext.checkIns.map((c: any) => `- ${c.date}: sleep ${c.sleepHours}h, stress ${c.stressLevel}/7, soreness ${c.sorenessLevel}/7, weight ${c.weight || "N/A"}`).join("\n")}`
        : "";
      const memoryContext = profile?.aiMemory
        ? `
AI MEMORY:
${JSON.stringify(profile.aiMemory)}`
        : "";

      const systemPrompt = `${AI_SYSTEM_CONTEXT}

You are FitSync AI Coach - an elite-level expert in hypertrophy training, nutrition, sports pharmacology, and performance optimization. 

YOUR PERSONALITY:
- Direct and confident like a seasoned coach
- Data-driven and evidence-based
- Personalized to this specific athlete
- No generic advice - everything is tailored to their stats, goals, and status

ATHLETE PROFILE:
- Age: ${profile?.age || "Unknown"} years
- Height: ${profile?.height || "Unknown"} ${profile?.heightUnit || "cm"}
- Weight: ${profile?.weight || "Unknown"} ${profile?.weightUnit || "lbs"}
- Sex: ${profile?.sex || "male"}
- Goal: ${profile?.goal?.toUpperCase() || "RECOMP"}
- Experience Level: ${profile?.experienceLevel?.toUpperCase() || "INTERMEDIATE"}
${cycleContext}
${macroContext}
${programContext}
${physiqueContext}
${strengthContext}
${medicationsContext}
${medicationImpactContext}
${checkInSummary}
${memoryContext}

COACHING GUIDELINES:
1. Address them by referencing their specific stats when relevant
2. Adjust all recommendations based on their enhanced/natural status
3. Consider their goal (${profile?.goal || "recomp"}) in every recommendation
4. Be specific with numbers: sets, reps, weights, macros, timing
5. Use markdown formatting for clarity (bold for emphasis, lists for structure)
6. If they're enhanced, factor in faster recovery and higher volume tolerance
7. Reference their weak points/physique analysis when discussing training`;

      const messages: Array<{
        role: "system" | "user" | "assistant";
        content: string;
      }> = [{ role: "system", content: systemPrompt }];

      if (conversationHistory && Array.isArray(conversationHistory)) {
        const recentHistory = conversationHistory.slice(-6);
        for (const msg of recentHistory) {
          messages.push({
            role: msg.role as "user" | "assistant",
            content: msg.content,
          });
        }
      }

      messages.push({ role: "user", content: message });

      console.log("Sending to OpenAI with", messages.length, "messages");

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: messages,
        temperature: 0.7,
        max_tokens: 1200,
      });

      const aiResponse =
        response.choices[0]?.message?.content ||
        "I couldn't generate a response. Please try again.";

      console.log("AI response received, length:", aiResponse.length);

      res.json({ response: aiResponse });
    } catch (error: any) {
      console.error("=== AI CHAT ERROR ===");
      console.error("Error type:", error?.constructor?.name);
      console.error("Error message:", error?.message);
      console.error("Error details:", JSON.stringify(error, null, 2));
      res.status(500).json({
        error: "Failed to process your question. Please try again.",
        details:
          process.env.NODE_ENV === "development" ? error?.message : undefined,
      });
    }
  });

  // Healthmaxx - AI health concerns analysis
  app.post("/api/coach/healthmaxx", async (req, res) => {
    try {
      const {
        concerns,
        profile: incomingProfile,
        userId,
        profileId,
      } = req.body;
      const aiContext = await buildAiContext({
        profile: incomingProfile,
        profileId,
        userId,
      });
      const profile = aiContext.profile || incomingProfile;

      if (!concerns || concerns.length === 0) {
        return res
          .status(400)
          .json({ error: "At least one health concern is required" });
      }

      console.log("=== HEALTHMAXX ANALYSIS ===");
      console.log("Concerns:", concerns);

      const isEnhanced = profile?.cycleInfo?.compounds?.length > 0;
      const cycleContext = isEnhanced
        ? `Enhanced lifter on: ${profile.cycleInfo.compounds.map((c: any) => `${c.name} ${c.dosageAmount}${c.dosageUnit}`).join(", ")}`
        : "Natural lifter";

      const medicationsList = profile?.medicationsWithDosage?.length
        ? profile.medicationsWithDosage
        : (profile?.medications || []).map((name: string) => ({ name }));
      const medicationsContext =
        medicationsList?.length > 0
          ? `Current medications: ${medicationsList.map((med: any) => med.name || med).join(", ")}`
          : "No current medications";

      const systemPrompt = `${AI_SYSTEM_CONTEXT}

You are a health optimization expert specializing in fitness and bodybuilding-related health concerns. You provide evidence-based recommendations for:
- Hair loss prevention and DHT management
- Thyroid and metabolic optimization  
- Sleep quality improvement
- Cardiovascular health
- Hormonal balance
- Mental health and stress management
- Digestive health

USER PROFILE:
- Age: ${profile?.age || "Unknown"} years
- Sex: ${profile?.sex || "male"}
- Goal: ${profile?.goal || "recomp"}
- ${cycleContext}
- ${medicationsContext}

GUIDELINES:
1. Be specific with supplement dosages and protocols
2. Mention potential interactions with their compounds/medications
3. Prioritize safety and suggest bloodwork when appropriate
4. Include lifestyle factors (sleep, stress, diet) not just supplements
5. Use markdown formatting for clarity
6. Be honest about what requires medical supervision`;

      const userPrompt = `Analyze these health concerns and provide a comprehensive optimization protocol:

CONCERNS: ${concerns.join(", ")}

For each concern:
1. Root cause analysis
2. Evidence-based interventions (supplements, lifestyle, diet)
3. Specific dosages and timing
4. Potential interactions or cautions
5. Expected timeline for improvement

Focus on practical, actionable recommendations.

At the very end of your response, include a mandatory section:
### LOGIC KEYWORDS
- List 5-7 specific scientific/clinical keywords used in your reasoning (e.g., 'SHBG binding', 'telogen effluvium', 'TSH-T3 conversion', etc.).`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const aiResponse =
        response.choices[0]?.message?.content ||
        "Unable to analyze health concerns.";
      console.log("Healthmaxx analysis complete");

      res.json({ response: aiResponse });
    } catch (error: any) {
      console.error("Healthmaxx error:", error?.message);
      res.status(500).json({ error: "Failed to analyze health concerns" });
    }
  });

  app.post("/api/coach/analyze", async (req, res) => {
    try {
      const { checkIn, profile } = req.body;

      if (!checkIn) {
        return res.status(400).json({ error: "Check-in data is required" });
      }

      const cycleContext =
        profile?.cycleInfo?.compounds?.length > 0
          ? `\nCurrent Protocol:\n${profile.cycleInfo.compounds
            .map(
              (c: any) =>
                `- ${c.name}: ${c.dosageAmount}${c.dosageUnit} ${c.frequency}`,
            )
            .join(
              "\n",
            )}\nWeeks into cycle: ${profile.cycleInfo.weeksIn}/${profile.cycleInfo.totalWeeks}`
          : "\nNatural lifter (no PED use)";

      const prompt = `You are an expert AI fitness and hypertrophy coach with deep knowledge of bodybuilding, powerlifting, and performance enhancement. Based on the following daily check-in data, provide 3 specific, actionable coaching notes.

${JSON.stringify(HYPERTROPHY_SCIENCE, null, 2)}

User Profile:
- Age: ${profile?.age || "Unknown"}
- Weight: ${profile?.weight || "Unknown"} ${profile?.weightUnit || "lbs"}
- Goal: ${profile?.goal || "recomp"}
- Experience: ${profile?.experienceLevel || "intermediate"}
${cycleContext}

Today's Check-In:
- Sleep: ${checkIn.sleepHours} hours
- Stress Level: ${checkIn.stressLevel}/7
- Muscle Soreness: ${checkIn.sorenessLevel}/7
- Current Weight: ${checkIn.weight} ${profile?.weightUnit || "lbs"}
- Notes: ${checkIn.notes || "None"}

Provide exactly 3 coaching recommendations that are:
1. Specific to their current state (sleep, stress, soreness)
2. Adjusted for their enhancement status if applicable
3. Actionable and practical for today's training/recovery

Format your response as JSON:
{"notes": ["specific note 1", "specific note 2", "specific note 3"], "logicKeywords": ["keyword1", "keyword2", "keyword3"]}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        max_completion_tokens: 600,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content || "{}";

      try {
        const parsed = JSON.parse(content);
        const notes = Array.isArray(parsed)
          ? parsed.slice(0, 3)
          : parsed.notes ||
          parsed.recommendations || [
            "Focus on quality sleep tonight to support recovery.",
            "Consider adjusting training intensity based on your soreness.",
            "Stay consistent with your nutrition plan.",
          ];

        res.json({ notes });
      } catch {
        res.json({
          notes: [
            "Focus on quality sleep tonight to support recovery.",
            "Consider adjusting training intensity based on your soreness.",
            "Stay consistent with your nutrition plan.",
          ],
        });
      }
    } catch (error) {
      console.error("Error in coach analysis:", error);
      res.json({
        notes: [
          "Focus on quality sleep tonight to support recovery.",
          "Consider adjusting training intensity based on your soreness.",
          "Stay consistent with your nutrition plan.",
        ],
      });
    }
  });

  app.post("/api/coach/analyze-physique", async (req, res) => {
    try {
      const { photos, profile } = req.body;

      if (
        !photos ||
        (!photos.front && !photos.side && !photos.back && !photos.legs)
      ) {
        return res
          .status(400)
          .json({ error: "At least one physique photo is required" });
      }

      const photoDescriptions = [];
      if (photos.front) photoDescriptions.push("front pose");
      if (photos.side) photoDescriptions.push("side pose");
      if (photos.back) photoDescriptions.push("back pose");
      if (photos.legs) photoDescriptions.push("legs pose (quad focus)");

      const cycleContext =
        profile?.cycleInfo?.compounds?.length > 0
          ? `Enhanced lifter running: ${profile.cycleInfo.compounds.map((c: any) => c.name).join(", ")}`
          : "Natural lifter";

      const goldenRatioContext = JSON.stringify(
        GOLDEN_RATIO_PROPORTIONS,
        null,
        2,
      );
      const anatomyContext = JSON.stringify(MUSCLE_ANATOMY, null, 2);
      const weakPointStrategies = JSON.stringify(
        WEAK_POINT_PRIORITIZATION,
        null,
        2,
      );

      const prompt = `${AI_SYSTEM_CONTEXT}

You are an expert physique analyst and bodybuilding coach with deep knowledge of the GOLDEN RATIO proportions used by classic bodybuilders like Steve Reeves.

GOLDEN RATIO PROPORTIONS REFERENCE:
${goldenRatioContext}

MUSCLE ANATOMY REFERENCE:
${anatomyContext}

WEAK POINT PRIORITIZATION STRATEGIES:
${weakPointStrategies}

User Stats:
- Height: ${profile?.height || "Unknown"} ${profile?.heightUnit || "cm"}
- Weight: ${profile?.weight || "Unknown"} ${profile?.weightUnit || "lbs"}
- Age: ${profile?.age || "Unknown"}
- Sex: ${profile?.sex || "male"}
- Goal: ${profile?.goal || "recomp"}
- Experience: ${profile?.experienceLevel || "intermediate"}
- Status: ${cycleContext}

Photos provided: ${photoDescriptions.join(", ")}

Analyze the physique photos and provide a COMPREHENSIVE assessment:

1. GOLDEN RATIO COMPARISON:
   - Calculate ideal proportions based on height/weight/sex
   - Compare current physique to golden ratio standards
   - Rate overall aesthetic score (1-100)
   - Identify which ratios are closest to ideal
   - Identify which ratios need the most work

2. MUSCLE GROUP RATINGS (1-10 each):
   - Rate each muscle group individually
   - Provide overall development score
   - Identify genetic advantages (insertions, shape, response)

3. WEAK POINTS ANALYSIS:
   - List specific lagging muscles with priority ranking
   - Recommend exercises targeting each weak point
   - Include techniques (drop sets, partials, etc.)

4. POSTURE ANALYSIS (if visible):
   - Check for anterior pelvic tilt
   - Check for rounded shoulders/kyphosis
   - Check for scapular winging
   - Check for rib flare

5. BODY FAT & COMPOSITION:
   - Estimated body fat percentage
   - Muscle maturity (1-10)
   - Vascularity assessment
   - Frame structure (clavicle width, waist, hip ratio)

6. PERSONALIZED RECOMMENDATIONS:
   - Training frequency per muscle group
   - Weekly set recommendations
   - Priority exercises for weak points
   - Timeline expectations

Format as JSON:
{
  "overallScore": 75,
  "goldenRatioAnalysis": {
    "shoulderToWaist": { "current": 1.4, "ideal": 1.618, "deviation": "-13%", "rating": 7 },
    "chestToWaist": { "current": 1.2, "ideal": 1.4, "deviation": "-14%", "rating": 6 },
    "armToNeck": { "current": 0.9, "ideal": 1.0, "deviation": "-10%", "rating": 7 }
  },
  "proportions": { "chest": 7, "back": 8, "shoulders": 6, "arms": 7, "quads": 7, "hamstrings": 6, "glutes": 6, "calves": 5 },
  "strongPoints": ["list of genetic advantages"],
  "weakPoints": [{ "muscle": "shoulders", "priority": 1, "exercises": ["lateral raises", "face pulls"], "techniques": ["drop sets", "partials"] }],
  "postureIssues": [{ "issue": "anterior pelvic tilt", "severity": "moderate", "fixes": ["hip flexor stretches", "glute bridges"] }],
  "bodyFat": "14%",
  "muscleMaturity": 6,
  "vascularity": "moderate",
  "frameAnalysis": { "clavicles": "medium", "waist": "narrow", "hips": "medium" },
  "trainingRecommendations": { "shoulders": { "setsPerWeek": 20, "frequency": 3, "priorityExercises": ["lateral raises"] } },
  "goalAdvice": "advice based on goal",
  "timeline": "expected improvements timeline"
}`;

      const imageMessages: any[] = [];

      if (photos.front) {
        imageMessages.push({
          type: "image_url",
          image_url: { url: photos.front, detail: "high" },
        });
      }
      if (photos.side) {
        imageMessages.push({
          type: "image_url",
          image_url: { url: photos.side, detail: "high" },
        });
      }
      if (photos.back) {
        imageMessages.push({
          type: "image_url",
          image_url: { url: photos.back, detail: "high" },
        });
      }
      if (photos.legs) {
        imageMessages.push({
          type: "image_url",
          image_url: { url: photos.legs, detail: "high" },
        });
      }

      console.log(
        "Analyzing physique with",
        imageMessages.length,
        "images (simple analysis)",
      );

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // Use GPT-4o for vision capabilities
        messages: [
          {
            role: "system",
            content:
              "You are an expert physique analyst and a n expert bodybuilding shgow judge. Analyze the provided photos and return a detailed JSON assessment breaking down each invididual muscle do not guess truly break down each musckle and return with a score and rating for each muscle groups based off measruements and proproritons from the photos..",
          },
          {
            role: "user",
            content: [{ type: "text", text: prompt }, ...imageMessages],
          },
        ],
        max_tokens: 2000,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content || "{}";
      console.log("Simple physique analysis response received");
      res.json(JSON.parse(content));
    } catch (error) {
      console.error("Error in physique analysis:", error);
      res.status(500).json({
        error: "Failed to analyze physique",
        message:
          "Vision analysis failed. Please retry with clear, well-lit photos.",
        retryable: true,
      });
    }
  });

  app.post("/api/coach/analyze-physique-detailed", rateLimitMiddleware(60000, 5), validatePhotos, async (req, res) => {
    try {
      const { photos, profile: incomingProfile, userId, profileId } = req.body;
      const resolvedProfileId = profileId || incomingProfile?.id || null;
      const hasPhotosInput =
        photos && (photos.front || photos.side || photos.back || photos.legs);
      if (!hasPhotosInput) {
        return res.status(400).json({
          error: "No photos provided",
          message:
            "Upload at least one photo (front, side, back, or legs) for analysis.",
          retryable: true,
        });
      }

      if (process.env.ASYNC_PHYSIQUE_ANALYSIS !== "false") {
        const [job] = await db
          .insert(analysisJobs)
          .values({
            profileId: resolvedProfileId,
            analysisType: "physique",
            status: "queued",
            requestPayload: encryptPayload({
              photos,
              profile: incomingProfile,
              userId,
              profileId: resolvedProfileId,
            }),
          })
          .returning();

        return res.json({
          jobId: job.id,
          status: job.status,
        });
      }
      const aiContext = await buildAiContext({
        profile: incomingProfile,
        profileId,
        userId,
      });
      const profile = aiContext.profile || incomingProfile;

      console.log("=== PHYSIQUE ANALYSIS REQUEST ===");
      console.log("Photos received:", {
        front: photos?.front
          ? `${photos.front.substring(0, 50)}... (${photos.front.length} chars)`
          : "none",
        side: photos?.side
          ? `${photos.side.substring(0, 50)}... (${photos.side.length} chars)`
          : "none",
        back: photos?.back
          ? `${photos.back.substring(0, 50)}... (${photos.back.length} chars)`
          : "none",
        legs: photos?.legs
          ? `${photos.legs.substring(0, 50)}... (${photos.legs.length} chars)`
          : "none",
      });
      console.log("Profile stats:", {
        height: profile?.height,
        weight: profile?.weight,
        age: profile?.age,
        sex: profile?.sex,
        goal: profile?.goal,
      });

      const hasPhotos =
        photos && (photos.front || photos.side || photos.back || photos.legs);
      if (!hasPhotos) {
        return res.status(400).json({
          error: "No photos provided",
          message:
            "Upload at least one photo (front, side, back, or legs) for analysis.",
          retryable: true,
        });
      }

      const photoDescriptions = [];
      if (photos?.front) photoDescriptions.push("front pose");
      if (photos?.side) photoDescriptions.push("side pose");
      if (photos?.back) photoDescriptions.push("back pose");
      if (photos?.legs) photoDescriptions.push("legs pose (quad focus)");

      const cycleContext =
        profile?.cycleInfo?.compounds?.length > 0
          ? `Enhanced lifter on: ${profile.cycleInfo.compounds.map((c: any) => `${c.name} ${c.dosageAmount}${c.dosageUnit}`).join(", ")}`
          : "Natural lifter";

      const strengthContext = profile?.strengthGoals
        ? `
Current Lifts:
- Bench: ${profile.strengthGoals.bench?.current || 0} lbs (target: ${profile.strengthGoals.bench?.target || 0} lbs)
- Squat: ${profile.strengthGoals.squat?.current || 0} lbs (target: ${profile.strengthGoals.squat?.target || 0} lbs)
- Deadlift: ${profile.strengthGoals.deadlift?.current || 0} lbs (target: ${profile.strengthGoals.deadlift?.target || 0} lbs)
- OHP: ${profile.strengthGoals.ohp?.current || 0} lbs (target: ${profile.strengthGoals.ohp?.target || 0} lbs)
- Pull-ups: ${profile.strengthGoals.pullups?.current || 0} reps (target: ${profile.strengthGoals.pullups?.target || 0} reps)`
        : "";

      // Determine which muscles are visible based on photo angles
      const visibleMuscles: string[] = [];
      const visiblePostureChecks: string[] = [];

      if (photos?.front) {
        visibleMuscles.push(
          "Chest (Pectorals)",
          "Shoulders (Front Deltoids)",
          "Arms (Biceps visible, Triceps partial)",
          "Core (Abs & Obliques)",
          "Quadriceps (front view)",
        );
        visiblePostureChecks.push(
          "shoulder symmetry",
          "rib flare",
          "hip alignment",
          "quad symmetry",
        );
      }
      if (photos?.side) {
        visibleMuscles.push(
          "Shoulders (Side Deltoids)",
          "Arms (Triceps profile)",
          "Glutes (side profile)",
          "Hamstrings (side view)",
          "Calves (side view)",
        );
        visiblePostureChecks.push(
          "anterior pelvic tilt",
          "kyphosis/rounded upper back",
          "forward head posture",
          "knee hyperextension",
        );
      }
      if (photos?.back) {
        visibleMuscles.push(
          "Back (Lats, Traps, Rhomboids)",
          "Shoulders (Rear Deltoids)",
          "Glutes (back view)",
          "Hamstrings (back view)",
          "Calves (back view)",
        );
        visiblePostureChecks.push(
          "scapular winging",
          "spinal alignment",
          "hip height symmetry",
          "lat width symmetry",
        );
      }
      if (photos?.legs) {
        visibleMuscles.push(
          "Quadriceps (detailed - vastus lateralis, rectus femoris, vastus medialis)",
          "Hamstrings (front view partial)",
          "Calves (gastrocnemius, soleus)",
          "Adductors",
        );
        visiblePostureChecks.push(
          "quad sweep development",
          "VMO development",
          "calf symmetry",
          "knee valgus",
        );
      }

      const prompt = `${AI_SYSTEM_CONTEXT}

You are an expert physique analyst performing REAL VISUAL ANALYSIS of these photos. This is NOT a generic assessment.

**CRITICAL: YOU MUST ACTUALLY LOOK AT THE PHOTOS AND DESCRIBE SPECIFIC VISUAL DETAILS**

**MANDATORY VISUAL DESCRIPTION REQUIREMENTS - YOU MUST INCLUDE ALL OF THESE:**

1. LIGHTING CONDITIONS: Describe the lighting (harsh gym lighting, natural window light, dim, shadows present, etc.)

2. VISIBLE VASCULARITY: 
   - Are veins visible? YES/NO
   - If YES, specify EXACTLY where: "biceps veins visible", "forearm vascularity prominent", "deltoid veins showing", "abdominal veins visible", "quad veins visible", etc.
   - If NO, state "no visible vascularity"

3. MUSCLE STRIATIONS:
   - Can you see striations? YES/NO
   - If YES, specify which muscles: "striations visible in deltoids when flexed", "quad striations visible", "chest striations showing", etc.
   - If NO, state "no visible striations"

4. ABDOMINAL DEFINITION:
   - How many "packs" are visible? (0, 2, 4, 6, 8)
   - Describe the definition: "upper abs visible but lower abs not defined", "full six-pack visible with deep separations", "abs barely visible", etc.

5. QUAD ANALYSIS (if legs photo provided):
   - Quad sweep appearance: "outer quad (vastus lateralis) shows good sweep", "vastus lateralis appears flat/underdeveloped", "quad sweep is minimal"
   - VMO (teardrop) visibility: "VMO clearly visible above knee", "VMO barely visible", "VMO not visible - underdeveloped"
   - Overall quad development: "quads appear well-developed with good separation", "quads look flat with minimal definition"

6. PUMP STATE:
   - Is this a pumped or relaxed state? "appears pumped - muscles look full", "relaxed state - minimal pump", "moderate pump visible"

7. POSE DESCRIPTION:
   - Describe the exact pose: "front pose with arms relaxed at sides", "side pose facing right", "back pose with arms relaxed", "legs pose showing quads"

PHOTO ANGLES PROVIDED: ${photoDescriptions.join(", ") || "none"}
VISIBLE MUSCLE GROUPS: ${visibleMuscles.join(", ") || "none"}
VISIBLE POSTURE CHECKS: ${visiblePostureChecks.join(", ") || "none"}

SCORING RULES:
- ONLY score muscles that are clearly visible in the provided photos.
- If a muscle group is NOT visible, set its rating to 0 and status to "not_visible".
- For not_visible muscles, observations must include "Not visible in uploaded photos".

User Stats:
- Height: ${profile?.height || "Unknown"} ${profile?.heightUnit || "cm"}
- Weight: ${profile?.weight || "Unknown"} ${profile?.weightUnit || "lbs"}  
- Age: ${profile?.age || "Unknown"}
- Sex: ${profile?.sex || "male"}
- Goal: ${profile?.goal || "recomp"}
- Experience: ${profile?.experienceLevel || "intermediate"}
- Status: ${cycleContext}
${strengthContext}

**OBSERVATION REQUIREMENTS FOR EACH MUSCLE:**
Your observations for EACH muscle MUST include SPECIFIC visual details that you actually see. Use phrases like:
- "I can see visible separation between [muscle heads] - specifically the [upper/lower] portion shows clear definition"
- "The [muscle] appears flat/underdeveloped - minimal thickness and no visible striations"
- "There is noticeable vascularity running across the [muscle] - veins visible in [specific location]"
- "The [muscle] lacks sweep/width - the outer portion appears underdeveloped compared to the inner portion"
- "The teardrop (VMO) is [clearly visible/barely visible/not visible] - [describe what you see]"
- "Striations visible when [contracted/relaxed] - specifically in the [muscle portion]"
- "Asymmetry observed: left [muscle] appears [larger/smaller] than right - approximately [X]% difference visible"
- "The [muscle] lacks the rounded/capped appearance - appears flat rather than full"

**VALIDATION CHECK:** If your response does NOT include specific visual descriptions (veins, striations, VMO, lighting, etc.), it will be rejected. Generic statements like "muscle looks good" or "average development" are NOT acceptable without specific visual evidence.

**HONEST ASSESSMENT REQUIREMENTS:**
- If quads look flat/small with no sweep → rating should be 3-5, NOT 6-7
- If there's no visible VMO (teardrop) → mention this as a weakness
- If arms are disproportionately small compared to torso → rate them lower
- If there's a noticeable weak point → call it out specifically, don't be diplomatic
- Average gym-goer physique = rating 4-5, not 6-7
- Only rate 7+ if the muscle genuinely stands out as well-developed

BODY FAT ESTIMATION (use visual markers you ACTUALLY observe):
- 8-10%: Visible abs with deep separations, vascularity in arms/delts/abs, striations visible
- 10-12%: Full six-pack visible, some vascularity, clear muscle separation
- 12-15%: Upper abs visible, lower abs fading, some definition
- 15-18%: Abs barely visible or not visible, smooth appearance
- 18-22%: No ab definition, noticeable fat around waist
- 22%+: Significant fat accumulation

Return JSON:
{
  "photoAnalysis": {
    "whatISee": "<MANDATORY: Describe 3-4 sentences with SPECIFIC visual details - lighting conditions, pose, visible veins (where), striations (which muscles), ab definition (how many packs), quad sweep/VMO (if legs visible), pump state>",
    "vascularity": "<MANDATORY: none/minimal/moderate/prominent - MUST specify WHERE: 'biceps veins visible', 'forearm vascularity', 'deltoid veins', 'abdominal veins', 'quad veins', or 'no visible vascularity'>",
    "absVisibility": "<MANDATORY: Describe exactly what you see - 'full six-pack visible with deep separations', 'upper 4 abs visible but lower abs not defined', 'abs barely visible', 'no ab definition visible'>",
    "overallImpression": "<One sentence honest impression based on SPECIFIC visual observations. AT LEAST 3 terms from your logicKeywords list MUST be referenced here to prove the scan was successful.>"
  },
  "overallScore": <1-100 - average gym-goer is 40-55, trained lifter 55-70, advanced 70-85, competitive 85+>,
  "goldenRatioScore": <1-100 based on shoulder-to-waist ratio you OBSERVE>,
  "symmetryScore": <1-100 for left-right balance you OBSERVE>,
  "bodyFatEstimate": "<X-Y%> based on visual markers you DESCRIBED",
  "bodyFatConfidence": "<low|medium|high>",
  "muscleRatings": [
    {
      "muscle": "<Muscle Name>",
      "rating": <1-10 - be HONEST, 5 is average, most muscles should be 4-6 unless exceptional>,
      "status": "<lagging|average|strong|dominant|not_visible>",
      "observations": ["<SPECIFIC visual detail you observed in the photo>", "<Another SPECIFIC detail>"],
      "visualKeywords": ["<3-4 specific clinical/visual markers you see for this muscle (e.g., 'distal quad separation', 'lower lat insertion visibility', 'serratus anterior definition')>"],
      "priority": "<high|medium|low>"
    }
  ],
  "postureIssues": [
    {
      "issue": "<Issue Name>",
      "severity": <1-10>,
      "status": "<good|mild|moderate|severe>",
      "observations": ["<What you SPECIFICALLY see in the photo>"],
      "corrections": ["<Exercise 1>", "<Exercise 2>"]
    }
  ],
  "weakPoints": ["<Your #1 lagging body part based on what you SEE>", "<#2 weak point>"],
  "strongPoints": ["<Body part that stands out as well-developed based on photos>"],
  "observations": ["<Personalized insight referencing ACTUAL photo details>"],
  "honestAdvice": "<One sentence of brutally honest advice based on what you observed>",
  "cycleImpact": ${profile?.cycleInfo?.compounds?.length > 0 ? `"Your current protocol (${profile.cycleInfo.compounds.map((c: any) => c.name).join(", ")}) affects training: <specific recommendation>"` : "null"},
  "logicKeywords": ["<MANDATORY: 5-7 specific scientific/clinical keywords used in your logic (e.g., 'androgen receptor density', 'myofibrillar hypertrophy', 'half-life clearance', 'VMO-to-medial-distal ratio', etc.)>"]
}

RATING SCALE: 1-2=severely underdeveloped, 3-4=lagging, 5-6=average, 7-8=above average/strong, 9-10=exceptional/dominant

**DO NOT GIVE GENERIC SCORES.** If you rate quads as "6/average" but they look flat with no sweep in the photo, you are WRONG. Be HONEST.`;

      let responseData;

      if (hasPhotos) {
        const imageMessages: any[] = [];

        if (photos.front) {
          imageMessages.push({
            type: "image_url",
            image_url: { url: photos.front, detail: "high" },
          });
        }
        if (photos.side) {
          imageMessages.push({
            type: "image_url",
            image_url: { url: photos.side, detail: "high" },
          });
        }
        if (photos.back) {
          imageMessages.push({
            type: "image_url",
            image_url: { url: photos.back, detail: "high" },
          });
        }
        if (photos.legs) {
          imageMessages.push({
            type: "image_url",
            image_url: { url: photos.legs, detail: "high" },
          });
        }

        console.log("Analyzing physique with", imageMessages.length, "images");

        const response = await openai.chat.completions.create({
          model: "gpt-4o", // Use GPT-4o for vision capabilities
          messages: [
            {
              role: "system",
              content:
                "You are a brutally honest physique analyst. ACTUALLY LOOK at the provided photos and describe specific visual details you observe - veins, muscle separation, development levels, weak points. If quads look flat or underdeveloped, SAY SO. If there's no VMO teardrop visible, MENTION IT. Do NOT give generic 'average' scores to muscles that are clearly underdeveloped in the photos. Be HONEST like a real bodybuilding coach would be.",
            },
            {
              role: "user",
              content: [{ type: "text", text: prompt }, ...imageMessages],
            },
          ],
          max_tokens: 3000,
          response_format: { type: "json_object" },
        });

        const content = response.choices[0]?.message?.content || "{}";
        console.log("Physique analysis response received");
        responseData = JSON.parse(content);
      } else {
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content:
                "You are an expert physique analyst providing baseline assessments.",
            },
            { role: "user", content: prompt },
          ],
          max_tokens: 3000,
          response_format: { type: "json_object" },
        });

        const content = response.choices[0]?.message?.content || "{}";
        responseData = JSON.parse(content);
      }

      const photoCoverage = {
        front: !!photos?.front,
        side: !!photos?.side,
        back: !!photos?.back,
        legs: !!photos?.legs,
      };
      const muscleVisibility: Record<string, boolean> = {
        chest: photoCoverage.front || photoCoverage.side,
        back: photoCoverage.back,
        shoulders:
          photoCoverage.front || photoCoverage.side || photoCoverage.back,
        arms: photoCoverage.front || photoCoverage.side || photoCoverage.back,
        abs: photoCoverage.front,
        core: photoCoverage.front,
        quads: photoCoverage.front || photoCoverage.legs,
        hamstrings:
          photoCoverage.side || photoCoverage.back || photoCoverage.legs,
        glutes: photoCoverage.side || photoCoverage.back,
        calves: photoCoverage.side || photoCoverage.back || photoCoverage.legs,
        legs:
          photoCoverage.front ||
          photoCoverage.side ||
          photoCoverage.back ||
          photoCoverage.legs,
      };
      const isMuscleVisible = (muscleName: string) => {
        const key = muscleName.toLowerCase();
        if (key.includes("chest") || key.includes("pec"))
          return muscleVisibility.chest;
        if (
          key.includes("back") ||
          key.includes("lat") ||
          key.includes("trap") ||
          key.includes("rhomboid")
        )
          return muscleVisibility.back;
        if (key.includes("shoulder") || key.includes("delt"))
          return muscleVisibility.shoulders;
        if (
          key.includes("arm") ||
          key.includes("bicep") ||
          key.includes("tricep")
        )
          return muscleVisibility.arms;
        if (
          key.includes("ab") ||
          key.includes("core") ||
          key.includes("oblique")
        )
          return muscleVisibility.core;
        if (key.includes("quad") || key.includes("adductor"))
          return muscleVisibility.quads;
        if (key.includes("hamstring")) return muscleVisibility.hamstrings;
        if (key.includes("glute")) return muscleVisibility.glutes;
        if (key.includes("calf")) return muscleVisibility.calves;
        if (key.includes("leg")) return muscleVisibility.legs;
        return true;
      };

      responseData.muscleRatings = (responseData.muscleRatings || []).map(
        (rating: any) => {
          if (!rating?.muscle) return rating;
          if (!isMuscleVisible(rating.muscle)) {
            return {
              ...rating,
              rating: 0,
              status: "not_visible",
              observations: ["Not visible in uploaded photos"],
              priority: "low",
            };
          }
          return rating;
        },
      );

      const filterPoints = (points: any[]) =>
        (points || []).filter((point: any) => {
          if (typeof point !== "string") return true;
          return isMuscleVisible(point);
        });

      responseData.weakPoints = filterPoints(responseData.weakPoints);
      responseData.strongPoints = filterPoints(responseData.strongPoints);
      responseData.bodyFatConfidence =
        responseData.bodyFatConfidence ||
        (Object.values(photoCoverage).filter(Boolean).length >= 3
          ? "medium"
          : "low");
      responseData.photoCoverage = photoCoverage;

      // Sanitize AI response before sending
      const sanitizedResponse = sanitizeAiResponse(responseData);
      res.json(sanitizedResponse);
    } catch (error) {
      console.error("Error in detailed physique analysis:", error);
      res.status(500).json({
        error: "Analysis failed",
        message:
          "Detailed physique analysis failed. Please retry with clear photos.",
        retryable: true,
      });
    }
  });

  app.get("/api/coach/analysis-jobs/:jobId", async (req, res) => {
    try {
      const jobId = req.params.jobId;
      const [job] = await db
        .select({
          id: analysisJobs.id,
          status: analysisJobs.status,
          analysisType: analysisJobs.analysisType,
          result: analysisJobs.result,
          error: analysisJobs.error,
          createdAt: analysisJobs.createdAt,
          updatedAt: analysisJobs.updatedAt,
          startedAt: analysisJobs.startedAt,
          completedAt: analysisJobs.completedAt,
        })
        .from(analysisJobs)
        .where(eq(analysisJobs.id, jobId))
        .limit(1);

      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }

      res.json(job);
    } catch (error) {
      console.error("Error fetching analysis job:", error);
      res.status(500).json({ error: "Failed to fetch job status" });
    }
  });

  app.post("/api/coach/generate-program", async (req, res) => {
    try {
      const {
        profile: incomingProfile,
        physiqueAnalysis: incomingPhysique,
        daysPerWeek,
        compoundResearch: incomingCompoundResearch,
        splitType,
        userId,
        profileId,
      } = req.body;
      const aiContext = await buildAiContext({
        profile: incomingProfile,
        profileId,
        userId,
      });
      const profile = aiContext.profile || incomingProfile;
      const macroTargets = aiContext.macroTargets || profile?.calculatedMacros;
      const physiqueAnalysis = profile?.physiqueAnalysis || incomingPhysique;
      const compoundResearch =
        profile?.compoundResearch || incomingCompoundResearch;

      // Debug logging to verify data received
      console.log("=== PROGRAM GENERATION REQUEST ===");
      console.log(
        "Profile received:",
        JSON.stringify(
          {
            weight: profile?.weight,
            weightUnit: profile?.weightUnit,
            height: profile?.height,
            heightUnit: profile?.heightUnit,
            age: profile?.age,
            sex: profile?.sex,
            goal: profile?.goal,
            experienceLevel: profile?.experienceLevel,
            isOnCycle: profile?.isOnCycle,
            cycleCompounds: profile?.cycleInfo?.compounds?.length || 0,
          },
          null,
          2,
        ),
      );

      // CRITICAL: Validate required profile fields - DO NOT use defaults
      const requiredFields = [
        "weight",
        "height",
        "age",
        "sex",
        "experienceLevel",
        "goal",
      ];
      const missingFields = requiredFields.filter((field) => !profile?.[field]);

      if (missingFields.length > 0) {
        console.error(
          "MISSING REQUIRED PROFILE FIELDS FOR PROGRAM:",
          missingFields,
        );
        return res.status(400).json({
          error: "Missing required profile data",
          missingFields,
          message: "Please complete your profile before generating a program.",
        });
      }

      // Validate values are reasonable
      if (profile.weight <= 0 || profile.weight > 500) {
        return res
          .status(400)
          .json({ error: "Invalid weight value. Please update your profile." });
      }
      if (profile.height <= 0 || profile.height > 300) {
        return res
          .status(400)
          .json({ error: "Invalid height value. Please update your profile." });
      }
      if (profile.age <= 0 || profile.age > 120) {
        return res
          .status(400)
          .json({ error: "Invalid age value. Please update your profile." });
      }

      console.log("VALIDATED - Using actual user data for program generation");

      const days = daysPerWeek ?? profile?.trainingProgram?.daysPerWeek;
      const selectedSplit = splitType ?? profile?.trainingProgram?.templateName;
      if (!days || !selectedSplit) {
        return res.status(400).json({
          error: "Missing training program setup",
          message:
            "Please select your training days per week and split type before generating a program.",
        });
      }

      const SPLIT_TEMPLATES: Record<
        string,
        { name: string; structure: string }
      > = {
        ppl: {
          name: "Push Pull Legs",
          structure: `Day 1: Push (Chest, Shoulders, Triceps)
Day 2: Pull (Back, Biceps, Rear Delts)
Day 3: Legs (Quads, Hamstrings, Glutes, Calves)
Day 4: Push (Chest, Shoulders, Triceps)
Day 5: Pull (Back, Biceps, Rear Delts)
Day 6: Legs (Quads, Hamstrings, Glutes, Calves)`,
        },
        "upper-lower": {
          name: "Upper/Lower Split",
          structure: `Day 1: Upper (Chest, Back, Shoulders, Arms)
Day 2: Lower (Quads, Hamstrings, Glutes, Calves)
Day 3: Upper (Chest, Back, Shoulders, Arms)
Day 4: Lower (Quads, Hamstrings, Glutes, Calves)`,
        },
        "bro-split": {
          name: "Bro Split",
          structure: `Day 1: Chest
Day 2: Back
Day 3: Shoulders
Day 4: Arms (Biceps, Triceps)
Day 5: Legs (Quads, Hamstrings, Glutes, Calves)`,
        },
        "full-body": {
          name: "Full Body",
          structure: `Day 1: Full Body A (Compound focus)
Day 2: Full Body B (Hypertrophy focus)
Day 3: Full Body C (Weak point focus)`,
        },
        arnold: {
          name: "Arnold Split",
          structure: `Day 1: Chest + Back
Day 2: Shoulders + Arms
Day 3: Legs
Day 4: Chest + Back
Day 5: Shoulders + Arms
Day 6: Legs`,
        },
      };

      const selectedTemplate =
        SPLIT_TEMPLATES[selectedSplit] || SPLIT_TEMPLATES["ppl"];
      const isEnhanced = profile?.cycleInfo?.compounds?.length > 0;
      const experienceLevel = profile?.experienceLevel;
      const goal = profile?.goal;
      const age = profile?.age;
      const weight = profile?.weight;
      const weightUnit = profile?.weightUnit || "lbs";
      const sex = profile?.sex;
      const macroContext = macroTargets
        ? `
CURRENT MACROS:
- Calories: ${macroTargets.calories || macroTargets.targetCalories} kcal
- Protein: ${macroTargets.protein || macroTargets?.macros?.protein?.grams}g
- Carbs: ${macroTargets.carbs || macroTargets?.macros?.carbs?.grams}g
- Fat: ${macroTargets.fat || macroTargets?.macros?.fat?.grams}g`
        : "";

      // Calculate user-specific volume guidelines based on stats
      const weightLbs = weightUnit === "kg" ? weight * 2.20462 : weight;

      // Base sets per muscle group per week - varies by experience and enhancement status
      let baseSetsPerMuscle: number;
      if (experienceLevel === "beginner") {
        baseSetsPerMuscle = isEnhanced ? 12 : 8;
      } else if (experienceLevel === "intermediate") {
        baseSetsPerMuscle = isEnhanced ? 18 : 14;
      } else {
        // advanced
        baseSetsPerMuscle = isEnhanced ? 24 : 18;
      }

      // Adjust for age (recovery decreases with age)
      if (age > 40) baseSetsPerMuscle = Math.round(baseSetsPerMuscle * 0.85);
      if (age > 50) baseSetsPerMuscle = Math.round(baseSetsPerMuscle * 0.75);

      // Rep range recommendations based on goal
      let primaryRepRange: string;
      let intensityGuidance: string;
      switch (goal) {
        case "cut":
          primaryRepRange =
            "8-15 reps (preserve strength with moderate volume)";
          intensityGuidance =
            "Focus on maintaining strength while in deficit. Limit drop sets (fatiguing).";
          break;
        case "bulk":
          primaryRepRange = "6-12 reps (heavy compounds, moderate isolation)";
          intensityGuidance =
            "Push intensity on compounds. Use drop sets and myo-reps for hypertrophy.";
          break;
        case "strength":
          primaryRepRange = "3-6 reps for compounds, 8-12 for accessories";
          intensityGuidance =
            "Prioritize progressive overload on main lifts. Longer rest periods (3-5 min).";
          break;
        default: // recomp
          primaryRepRange = "6-12 reps (balance of strength and hypertrophy)";
          intensityGuidance =
            "Mix of heavy and moderate work. Some metabolic finishers.";
      }

      console.log(
        `Volume calculation: ${baseSetsPerMuscle} sets/muscle, Rep range: ${primaryRepRange}`,
      );

      const cycleContext = isEnhanced
        ? `
ENHANCED ATHLETE STATUS: YES
Current Cycle Protocol:
${profile.cycleInfo.compounds
          .map(
            (c: any) =>
              `- ${c.name}: ${c.dosageAmount}${c.dosageUnit} (${c.frequency}, ${c.administrationMethod})`,
          )
          .join("\n")}
Cycle Week: ${profile.cycleInfo.weeksIn}/${profile.cycleInfo.totalWeeks}

ENHANCED TRAINING IMPLICATIONS:
- Recovery is 40-60% faster than natural
- Can handle 30-50% more weekly volume per muscle group
- Higher training frequency is productive (each muscle 2-3x/week vs 1-2x)
- Can train closer to failure more often (RIR 0-1)
- Benefits from higher intensity techniques: drop sets, rest-pause, forced reps
- Muscle protein synthesis elevated for longer (36-48 hours vs 24-36 hours)
- Joint recovery may lag behind muscle recovery - include prehab work`
        : `
NATURAL ATHLETE STATUS: YES (Not Enhanced)

NATURAL TRAINING IMPLICATIONS:
- Standard recovery timeline (48-72 hours per muscle group)
- Volume should stay within evidence-based limits (10-20 sets/muscle/week)
- Training closer to failure is MORE important (each set must count)
- RIR 1-2 is optimal - going to 0 RIR increases fatigue without proportional benefit
- Frequency of 2x/week per muscle is usually optimal
- Progressive overload in weight/reps is THE primary driver
- Avoid excessive intensity techniques that create systemic fatigue`;

      const weakPointContext =
        physiqueAnalysis?.weakPoints?.length > 0
          ? `
PRIORITY WEAK POINTS (Give 30-50% more volume):
${physiqueAnalysis.weakPoints.map((wp: string) => `- ${wp} → PRIORITIZE with 2-3 extra weekly sets and specialized exercise selection`).join("\n")}`
          : "";

      const proportionEntries = physiqueAnalysis?.proportions
        ? Object.entries(physiqueAnalysis.proportions)
        : (physiqueAnalysis?.muscleRatings || []).map((rating: any) => [
          rating.muscle,
          rating.rating,
        ]);
      const proportionContext = proportionEntries?.length
        ? `
MUSCLE DEVELOPMENT SCORES (1-10 scale):
${proportionEntries
          .map(([muscle, score]: [string, unknown]) => {
            const scoreNum =
              typeof score === "number" ? score : parseFloat(String(score));
            const priority =
              scoreNum <= 4
                ? "CRITICAL PRIORITY"
                : scoreNum <= 6
                  ? "Moderate Priority"
                  : "Maintenance";
            return `- ${muscle}: ${score}/10 [${priority}]`;
          })
          .join("\n")}`
        : "";

      const strengthContext = profile?.strengthGoals
        ? `
CURRENT STRENGTH LEVELS & TARGETS:
${Object.entries(profile.strengthGoals)
          .map(
            ([lift, data]: [string, any]) =>
              `- ${lift.toUpperCase()}: Current ${data.current} ${lift === "pullups" ? "reps" : "lbs"} → Target ${data.target} ${lift === "pullups" ? "reps" : "lbs"} (${Math.round((data.current / data.target) * 100)}% progress)`,
          )
          .join("\n")}

STRENGTH-FOCUSED PROGRAMMING REQUIREMENTS:
Based on these strength goals, the program should:
- Include primary compound movements (bench, squat, deadlift, OHP) at optimal rep ranges for strength (3-6 reps)
- Progress towards the specified targets through periodized loading
- Prioritize exercises that transfer to the main lifts
- For lifts furthest from targets, add accessory work addressing weak points`
        : "";

      const postureContext = physiqueAnalysis?.postureIssues?.length
        ? `
POSTURE FLAGS (address with warmups/correctives):
${physiqueAnalysis.postureIssues.map((issue: any) => `- ${issue.issue}: ${issue.status || issue.severity}`).join("\n")}`
        : "";

      const medicationsList = profile?.medicationsWithDosage?.length
        ? profile.medicationsWithDosage
        : (profile?.medications || []).map((name: string) => ({ name }));
      const medicationImpacts = medicationsList?.length
        ? getMedicationImpacts(medicationsList)
        : null;
      const medicationContext = medicationImpacts
        ? `
MEDICATION IMPACTS (modify volume/intensity accordingly):
- Volume multiplier: ${medicationImpacts.overallVolumeMultiplier.toFixed(2)}
- Frequency multiplier: ${medicationImpacts.overallFrequencyMultiplier.toFixed(2)}
- Training impacts: ${medicationImpacts.trainingImpacts.map((impact: any) => `${impact.medication}: ${impact.effects.map((e: any) => e.effect).join("; ")}`).join(" | ")}
- Critical notes: ${medicationImpacts.criticalNotes.join(" | ") || "None"}`
        : "";

      const compoundContext = compoundResearch
        ? `
COMPOUND-SPECIFIC TRAINING ADJUSTMENTS:
${Object.entries(compoundResearch)
          .map(
            ([name, research]: [string, any]) =>
              `${name}:
  - Volume multiplier: ${research.trainingAdjustments?.volumeMultiplier || 1}x
  - Frequency boost: ${research.trainingAdjustments?.frequencyMultiplier || 1}x
  - Notes: ${research.trainingAdjustments?.notes?.join("; ") || "Standard adjustments"}`,
          )
          .join("\n")}`
        : "";

      const evidenceBasedGuidelines = isEnhanced
        ? `
===== EVIDENCE-BASED GUIDELINES (ENHANCED ATHLETE) =====
Based on current sports science research for enhanced athletes:

VOLUME LANDMARKS (Israetel et al.):
- Minimum Effective Volume: 10 sets/muscle/week
- Maximum Adaptive Volume: 25-30 sets/muscle/week  
- Maximum Recoverable Volume: 35+ sets/muscle/week (can handle more due to enhanced recovery)

FREQUENCY:
- Can train each muscle 2-4x per week effectively
- Enhanced recovery allows higher frequency than natural
- MPS elevation extends to 36-48 hours (vs 24-36 natural)

INTENSITY:
- Can tolerate more sets to failure (0 RIR)
- Drop sets, rest-pause, myo-reps are highly effective
- Can recover from more intensity techniques per session

KEY RESEARCH:
- Schoenfeld et al. (2017): Higher volume = more hypertrophy up to ~20 sets/week for naturals
- Enhanced athletes benefit from even higher volumes (Bhasin et al., 1996)
- Nutrient partitioning improvements allow more aggressive training
`
        : `
===== EVIDENCE-BASED GUIDELINES (NATURAL ATHLETE) =====
Based on current sports science research for natural athletes:

VOLUME LANDMARKS (Israetel et al.):
- Minimum Effective Volume: 8 sets/muscle/week
- Maximum Adaptive Volume: 16-20 sets/muscle/week
- Maximum Recoverable Volume: 20-25 sets/muscle/week (individual variation)

FREQUENCY:
- Train each muscle 2x per week for optimal protein synthesis stimulation
- MPS elevation lasts 24-36 hours - training more frequently can be beneficial
- Allow 48-72 hours between training same muscle group

INTENSITY:
- RIR 1-3 for most sets (training to failure is not necessary for every set)
- Limit failure training to last set of an exercise
- Use intensity techniques sparingly (1-2 per workout)

KEY RESEARCH:
- Schoenfeld et al. (2017): Meta-analysis shows dose-response up to ~20 sets/week
- Wernbom et al. (2007): Optimal loading for hypertrophy
- Helms et al. (2015): Natural bodybuilding recommendations
`;

      const prompt = `You are an ELITE hypertrophy coach creating a TRULY INDIVIDUALIZED training program.

${JSON.stringify(HYPERTROPHY_SCIENCE, null, 2)}
${evidenceBasedGuidelines}

===== SELECTED TRAINING SPLIT =====
USER SELECTED: ${selectedTemplate.name} (${days} days/week)

REQUIRED SPLIT STRUCTURE - YOU MUST FOLLOW THIS EXACTLY:
${selectedTemplate.structure}

IMPORTANT: The user specifically chose this split. DO NOT change it to a different split type.

===== CRITICAL INSTRUCTION =====
DO NOT USE GENERIC SET/REP SCHEMES! The following patterns are FORBIDDEN unless specifically justified:
- 4x12 (generic hypertrophy)
- 3x15 (generic endurance)
- 3x10 (generic moderate)
- 4x10 (generic moderate)
- 3x8 (generic strength)

INSTEAD, prescribe VARIED, EXERCISE-SPECIFIC schemes based on:
1. Exercise position in workout (compounds early = lower reps, isolations later = higher reps)
2. Muscle fiber composition (legs tolerate higher reps, bis/tris respond to moderate)
3. Movement pattern (stretches respond to lower RIR, contractions can go to failure)
4. Individual weak points (priority muscles get specialized techniques)
5. Recovery status (enhanced vs natural determines intensity)

EXAMPLES OF PROPER INDIVIDUALIZATION:
- NOT: "Lat Pulldown 3x12" → YES: "Lat Pulldown 2x8-10 + 1x15-20 (2 heavy sets then 1 pump set)"
- NOT: "Bicep Curl 4x12" → YES: "Bicep Curl 3x10-12 RIR 1 with 2-sec squeeze at top"
- NOT: "Leg Press 4x10" → YES: "Leg Press 2x6-8 + 2x15-20 (heavy strength + metabolic stress)"

FOR WEAK POINTS, include advanced techniques like:
- Myo-reps (activation set + mini sets)
- Drop sets (for pump and metabolic stress)
- Rest-pause (for strength and recruitment)
- Stretch-focused partials (for lengthened hypertrophy)
- Slow eccentrics (for damage/tension)

===== USER PROFILE =====
Height: ${profile?.height || "Unknown"} ${profile?.heightUnit || "cm"}
Weight: ${weight} ${weightUnit} (${Math.round(weightLbs)} lbs)
Age: ${age} years
Sex: ${sex.toUpperCase()}
Primary Goal: ${goal.toUpperCase()}
Experience Level: ${experienceLevel.toUpperCase()}
Training Days Available: ${days}
Enhanced Status: ${isEnhanced ? "YES (on cycle)" : "NO (natural)"}
${cycleContext}
${macroContext}
${weakPointContext}
${proportionContext}
${strengthContext}
${postureContext}
${compoundContext}
${medicationContext}

===== SERVER-CALCULATED TRAINING PARAMETERS =====
THESE VALUES ARE MANDATORY - DO NOT DEVIATE:
- Target Sets Per Muscle Group Per Week: ${baseSetsPerMuscle} sets
- Primary Rep Range: ${primaryRepRange}
- Intensity Guidance: ${intensityGuidance}

The above values were calculated specifically for this ${age}-year-old ${experienceLevel} ${isEnhanced ? "enhanced" : "natural"} athlete with goal "${goal}".

===== EXERCISE DATABASE =====
${JSON.stringify(EXERCISE_FORM_DATABASE, null, 2)}

===== MACHINE VS FREE WEIGHT SELECTION GUIDELINES =====
Use a MIX of free weights, machines, and cables for optimal results. Select equipment based on:

WHEN TO PREFER MACHINES:
- Isolation exercises (better constant tension, safer failure training)
- Weak point work (machines allow focusing on target muscle without stabilizer fatigue)
- High rep pump work (cables/machines maintain tension throughout ROM)
- Drop sets and myo-reps (quick weight changes, no setup time)
- Training to absolute failure (safer than free weights at RIR 0)
- Older athletes or those with joint issues (reduced stabilizer demand)
- Chest: Pec deck, cable flies, machine press for isolation
- Back: Lat pulldown, cable rows, chest-supported row machines for lat focus
- Shoulders: Machine laterals, rear delt machine for isolation work
- Legs: Leg press/hack squat for quad focus without spine load, leg curls for hamstrings

WHEN TO PREFER FREE WEIGHTS:
- Primary compound movements (build overall strength and coordination)
- Early in workout when fresh (squats, deadlifts, bench, OHP)
- Strength-focused training (progressive overload on main lifts)
- Exercises where stabilizer work is beneficial

OPTIMAL MIX PER MUSCLE GROUP:
- Start with 1-2 free weight compounds, finish with 1-2 machine/cable isolations
- For weak points: Use MORE machine work to isolate the target muscle
- Example chest day: Barbell Bench → Incline DB Press → Machine Fly → Cable Fly (finisher)

===== PROGRAM REQUIREMENTS =====
Create a ${days}-day ${selectedTemplate.name} program that is COMPLETELY UNIQUE to this individual.

MANDATORY: Follow the ${selectedTemplate.name} structure exactly as specified above.
MANDATORY: Target approximately ${baseSetsPerMuscle} working sets per muscle group per week.
MANDATORY: Use ${primaryRepRange} as your primary rep range.

For EACH exercise, you MUST provide:
1. name: From exercise database
2. sets: Working sets (NOT including warm-ups)
3. repRange: SPECIFIC to this exercise's role (e.g., "5-7", "8-10", "12-15", "15-20+")
4. targetRIR: 0-3 based on exercise placement and recovery status
5. tempo: Specific tempo prescription (e.g., "3-1-1-0", "2-0-2-0")
6. formCues: 2-3 specific coaching cues
7. whatToFeel: The exact sensation/stretch/contraction to target
8. rationale: WHY this specific prescription for THIS ${age}-year-old ${experienceLevel} athlete (1 sentence)
9. intensityTechnique: (optional) For weak points: "drop set", "rest-pause", "myo-reps", etc.

WEEKLY VOLUME GUIDELINES (calculated for this specific user):
- Priority muscles: ${baseSetsPerMuscle + 4} sets/week
- Standard muscles: ${baseSetsPerMuscle} sets/week
- Maintenance muscles: ${Math.round(baseSetsPerMuscle * 0.7)} sets/week

Respond with valid JSON:
{
  "programName": "Specific descriptive name for THIS person",
  "programNotes": "2-3 sentences explaining the unique approach for this individual",
  "weeklyVolume": { "chest": 18, "back": 22, "shoulders": 14, "arms": 16, "legs": 20 },
  "enhancedProtocol": ${isEnhanced},
  "periodizationNote": "How to progress this program over 4-8 weeks",
  "schedule": [
    {
      "day": 1,
      "name": "Day Name - Focus Area",
      "muscleGroups": ["primary", "secondary"],
      "trainingGoal": "What this session specifically targets",
      "exercises": [
        {
          "name": "Exercise Name",
          "sets": 3,
          "repRange": "6-8",
          "targetRIR": 2,
          "tempo": "2-1-1-0",
          "formCues": ["Cue 1", "Cue 2"],
          "whatToFeel": "Specific sensation description",
          "rationale": "Why this prescription for this person",
          "intensityTechnique": null
        }
      ]
    }
  ]
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an elite hypertrophy coach. CRITICAL: You MUST generate a COMPLETE training program with EVERY training day fully populated.

MINIMUM REQUIREMENTS FOR EACH TRAINING DAY:
- Upper body days: 6-8 exercises minimum
- Lower body days: 5-7 exercises minimum
- Full body days: 7-9 exercises minimum

DO NOT return incomplete programs. Every day in the schedule must have a full exercise list.
If the split is 4 days, you must return 4 complete training days.
If the split is 5 days, you must return 5 complete training days.
If the split is 6 days, you must return 6 complete training days.

NEVER return a training day with fewer than 5 exercises.`,
          },
          { role: "user", content: prompt },
        ],
        max_completion_tokens: 16000,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content || "{}";
      const program = JSON.parse(content);

      // Validate the program is complete
      if (program.schedule && Array.isArray(program.schedule)) {
        const incompleteDays = program.schedule.filter(
          (day: any) => day.exercises && day.exercises.length < 5,
        );

        if (incompleteDays.length > 0) {
          console.warn(
            "Program has incomplete days:",
            incompleteDays.map((d: any) => d.name),
          );
        }

        // Ensure each day has proper exercise count
        const trainingDays = program.schedule.filter(
          (day: any) => day.exercises && day.exercises.length > 0,
        );

        console.log(
          `Generated program with ${trainingDays.length} training days, exercises per day:`,
          trainingDays.map(
            (d: any) => `${d.name}: ${d.exercises?.length || 0} exercises`,
          ),
        );
      }

      res.json(program);
    } catch (error) {
      console.error("Error generating program:", error);
      res.status(500).json({ error: "Failed to generate training program" });
    }
  });

  app.post("/api/coach/exercise-guidance", async (req, res) => {
    try {
      const { exerciseName, muscleGroup, userExperience, currentIssues } =
        req.body;

      const exerciseDb = EXERCISE_FORM_DATABASE[
        muscleGroup as keyof typeof EXERCISE_FORM_DATABASE
      ] as Record<string, any>;
      let exerciseInfo = null;

      if (exerciseDb) {
        const allExercises: Array<{
          name: string;
          primary: string;
          cues: string[];
        }> = [];
        Object.values(exerciseDb).forEach((category: any) => {
          if (Array.isArray(category)) {
            allExercises.push(...category);
          }
        });
        exerciseInfo = allExercises.find((e) =>
          e.name.toLowerCase().includes(exerciseName.toLowerCase()),
        );
      }

      const prompt = `You are an expert strength coach providing detailed exercise guidance.

Exercise: ${exerciseName}
Target Muscle: ${muscleGroup}
User Experience: ${userExperience || "intermediate"}
Current Issues/Concerns: ${currentIssues || "None specified"}

${exerciseInfo
          ? `
Known Exercise Info:
- Primary target: ${exerciseInfo.primary}
- Base cues: ${exerciseInfo.cues.join("; ")}
`
          : ""
        }

Provide comprehensive exercise guidance including:

1. SETUP: Exact positioning, grip, stance
2. EXECUTION: Step-by-step movement pattern
3. FORM CUES: Top 5 things to focus on
4. COMMON MISTAKES: What to avoid
5. MIND-MUSCLE CONNECTION: What to feel, where to feel it
6. BREATHING: When to inhale/exhale
7. PROGRESSIONS: How to make it harder over time
8. REGRESSIONS: Easier alternatives if needed
9. REP TEMPO: Recommended tempo and why
10. SET/REP RECOMMENDATIONS: Based on goal and experience

Format as JSON:
{
  "exerciseName": "name",
  "targetMuscle": "primary muscle",
  "secondaryMuscles": ["list"],
  "setup": "detailed setup instructions",
  "execution": ["step 1", "step 2", ...],
  "formCues": ["cue 1", "cue 2", ...],
  "commonMistakes": ["mistake 1", "mistake 2", ...],
  "mindMuscleConnection": "what to feel description",
  "breathing": "breathing pattern",
  "progressions": ["progression 1", ...],
  "regressions": ["regression 1", ...],
  "recommendedTempo": "2-1-2-0",
  "repRecommendations": { "strength": "3-5", "hypertrophy": "8-12", "endurance": "15-20" }
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        max_completion_tokens: 1500,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content || "{}";
      res.json(JSON.parse(content));
    } catch (error) {
      console.error("Error getting exercise guidance:", error);
      res.status(500).json({ error: "Failed to get exercise guidance" });
    }
  });

  app.post("/api/coach/calculate-macros", async (req, res) => {
    try {
      const { profile } = req.body;

      const profileValidation = validateProfilePayload(profile);
      if (!profileValidation.success) {
        return res.status(400).json({
          error: "Invalid profile payload",
          issues: profileValidation.error.issues,
        });
      }

      const requiredFields = ["height", "weight", "age", "sex"];
      const missingFields = requiredFields.filter((field) => !profile?.[field]);
      if (missingFields.length > 0) {
        return res.status(400).json({
          error: "Missing required profile data",
          missingFields,
          message: "Please complete your profile before calculating macros.",
        });
      }

      // Convert height to cm
      let heightCm: number;
      if (profile?.heightUnit === "in" || profile?.heightUnit === "ft") {
        // Height stored as total inches
        heightCm = profile.height * 2.54;
      } else {
        heightCm = profile.height;
      }

      // Convert weight to kg
      let weightKg: number;
      let weightLbs: number;
      if (profile?.weightUnit === "kg") {
        weightKg = profile.weight;
        weightLbs = weightKg * 2.205;
      } else {
        weightLbs = profile.weight;
        weightKg = weightLbs / 2.205;
      }

      const age = profile.age;
      const sex = profile.sex;
      const goal = profile?.goal || "recomp";
      const trainingDays = profile?.trainingProgram?.daysPerWeek || 5;
      const isEnhanced = profile?.cycleInfo?.compounds?.length > 0;

      // Mifflin-St Jeor BMR Formula
      let bmr: number;
      if (sex === "male") {
        bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
      } else {
        bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
      }

      // Activity multiplier based on training frequency
      let activityMultiplier: number;
      if (trainingDays >= 6) {
        activityMultiplier = 1.725; // Very active
      } else if (trainingDays >= 4) {
        activityMultiplier = 1.55; // Moderately active
      } else if (trainingDays >= 2) {
        activityMultiplier = 1.375; // Lightly active
      } else {
        activityMultiplier = 1.2; // Sedentary
      }

      // Enhanced athletes have slightly higher TDEE due to elevated metabolism
      if (isEnhanced) {
        activityMultiplier *= 1.05;
      }

      const tdee = Math.round(bmr * activityMultiplier);

      // Goal-based calorie adjustments
      let targetCalories: number;
      let goalDescription: string;

      switch (goal) {
        case "cut":
        case "aggressive_cut":
          targetCalories = Math.round(
            tdee - (goal === "aggressive_cut" ? 600 : 400),
          );
          goalDescription =
            "Caloric deficit for fat loss while preserving muscle";
          break;
        case "bulk":
        case "lean_bulk":
          targetCalories = Math.round(tdee + (goal === "bulk" ? 400 : 250));
          goalDescription = "Caloric surplus for muscle gain";
          break;
        case "recomp":
        default:
          // Recomp = slight deficit or maintenance
          targetCalories = Math.round(tdee - 100);
          goalDescription = "Near-maintenance for body recomposition";
          break;
      }

      // Protein calculation: 1.0g/lb for natural, 1.2g/lb for enhanced
      const proteinPerLb = isEnhanced ? 1.2 : 1.0;
      const proteinGrams = Math.round(weightLbs * proteinPerLb);
      const proteinCalories = proteinGrams * 4;

      // Fat calculation: 0.35g/lb minimum for hormone health
      const fatPerLb = isEnhanced ? 0.3 : 0.35;
      const fatGrams = Math.round(weightLbs * fatPerLb);
      const fatCalories = fatGrams * 9;

      // Remaining calories go to carbs
      const remainingCalories = targetCalories - proteinCalories - fatCalories;
      const carbGrams = Math.round(remainingCalories / 4);

      // Calculate percentages
      const proteinPct = Math.round((proteinCalories / targetCalories) * 100);
      const carbPct = Math.round(((carbGrams * 4) / targetCalories) * 100);
      const fatPct = Math.round((fatCalories / targetCalories) * 100);

      // Training day vs rest day adjustments
      const trainingDayCalories = targetCalories + 150;
      const restDayCalories = targetCalories - 100;
      const trainingDayCarbs = carbGrams + 40;
      const restDayCarbs = carbGrams - 25;

      // Fiber and water
      const fiberGrams = Math.round(carbGrams * 0.14); // ~14g per 100g carbs
      const waterLiters = Math.round((weightKg * 0.033 + 0.5) * 10) / 10; // 33ml per kg + extra for training

      // Get medication impacts if user has medications
      const allMedications: Array<{ name: string; dose?: string }> = [];

      // Collect cycle compounds (steroids)
      if (profile?.cycleInfo?.compounds?.length > 0) {
        for (const compound of profile.cycleInfo.compounds) {
          allMedications.push({ name: compound.name, dose: compound.dose });
        }
      }

      // Collect other medications (stimulants, BP meds, etc.)
      if (profile?.medications?.length > 0) {
        for (const med of profile.medications) {
          allMedications.push({ name: med.name, dose: med.dose });
        }
      }

      // Calculate medication impacts
      const { getMedicationImpacts } = await import("../knowledge/medications");
      const medicationImpacts = getMedicationImpacts(allMedications);

      // Build diet notes from medication impacts
      const dietNotes: string[] = [];
      for (const impact of medicationImpacts.dietImpacts) {
        for (const effect of impact.effects) {
          if (effect.severity !== "none" && effect.severity !== "low") {
            dietNotes.push(`${impact.medication}: ${effect.adjustment}`);
          }
        }
      }

      // Build training notes from medication impacts
      const trainingNotes: string[] = [];
      for (const impact of medicationImpacts.trainingImpacts) {
        for (const effect of impact.effects) {
          if (effect.severity !== "none") {
            trainingNotes.push(`${impact.medication}: ${effect.adjustment}`);
          }
        }
      }

      const result = {
        bmr: Math.round(bmr),
        tdee: tdee,
        targetCalories: targetCalories,
        trainingDayCalories: trainingDayCalories,
        restDayCalories: restDayCalories,
        macros: {
          protein: {
            grams: proteinGrams,
            perLb: proteinPerLb,
            percentage: proteinPct,
          },
          carbs: {
            grams: carbGrams,
            percentage: carbPct,
            trainingDay: trainingDayCarbs,
            restDay: restDayCarbs,
          },
          fat: {
            grams: fatGrams,
            perLb: fatPerLb,
            percentage: fatPct,
          },
        },
        trainingDayAdjustment: {
          calories: "+150",
          carbs: "+40g",
          description: "Higher carbs around training for performance",
        },
        restDayAdjustment: {
          calories: "-100",
          carbs: "-25g",
          description: "Slightly lower carbs on rest days",
        },
        fiber: Math.max(25, Math.min(40, fiberGrams)),
        water: `${waterLiters} liters`,
        micronutrientFocus: [
          "Vitamin D3 (2000-5000 IU)",
          "Magnesium (400-500mg)",
          "Zinc (30mg)",
          "Omega-3 fatty acids (2-3g EPA/DHA)",
          isEnhanced ? "NAC for liver support" : "Creatine monohydrate (5g)",
        ],
        mealTiming:
          trainingDays >= 5
            ? "Pre-workout meal 2-3 hours before, post-workout within 2 hours"
            : "Standard meal timing with protein at each meal",
        methodology: `Mifflin-St Jeor formula: BMR = ${Math.round(bmr)} kcal. Activity multiplier ${activityMultiplier.toFixed(2)} = TDEE ${tdee} kcal. ${goalDescription}. Protein at ${proteinPerLb}g/lb, fat at ${fatPerLb}g/lb, remaining calories from carbs.`,
        goal: goal,
        isEnhanced: isEnhanced,
        userStats: {
          heightCm: Math.round(heightCm),
          weightKg: Math.round(weightKg * 10) / 10,
          weightLbs: Math.round(weightLbs),
          age: age,
        },
        medicationImpacts: {
          dietNotes: dietNotes.slice(0, 10),
          trainingNotes: trainingNotes.slice(0, 10),
          volumeMultiplier: medicationImpacts.overallVolumeMultiplier,
          criticalNotes: medicationImpacts.criticalNotes.slice(0, 5),
        },
      };

      console.log("Macro calculation result:", JSON.stringify(result, null, 2));
      res.json(result);
    } catch (error) {
      console.error("Error calculating macros:", error);
      res.status(500).json({ error: "Failed to calculate macros" });
    }
  });

  // Get medication impacts for diet and training
  app.post("/api/coach/medication-impacts", async (req, res) => {
    try {
      const { medications, cycleInfo } = req.body;

      const allMedications: Array<{ name: string; dose?: string }> = [];

      if (cycleInfo?.compounds?.length > 0) {
        for (const compound of cycleInfo.compounds) {
          allMedications.push({ name: compound.name, dose: compound.dose });
        }
      }

      if (medications?.length > 0) {
        for (const med of medications) {
          allMedications.push({ name: med.name, dose: med.dose });
        }
      }

      const { getMedicationImpacts, MEDICATIONS_DATABASE } = await import(
        "../knowledge/medications"
      );
      const impacts = getMedicationImpacts(allMedications);

      res.json({
        success: true,
        medicationCount: allMedications.length,
        medications: allMedications,
        dietImpacts: impacts.dietImpacts,
        trainingImpacts: impacts.trainingImpacts,
        volumeMultiplier: impacts.overallVolumeMultiplier,
        frequencyMultiplier: impacts.overallFrequencyMultiplier,
        criticalNotes: impacts.criticalNotes,
        availableCategories: Object.keys(MEDICATIONS_DATABASE),
      });
    } catch (error) {
      console.error("Error getting medication impacts:", error);
      res.status(500).json({ error: "Failed to get medication impacts" });
    }
  });

  // Get available medications database
  app.get("/api/coach/medications-database", async (req, res) => {
    try {
      const { MEDICATIONS_DATABASE } = await import("../knowledge/medications");

      const simplified: Record<
        string,
        Array<{ key: string; name: string; class?: string }>
      > = {};

      for (const [category, meds] of Object.entries(MEDICATIONS_DATABASE)) {
        simplified[category] = Object.entries(meds).map(
          ([key, data]: [string, any]) => ({
            key,
            name: data.genericName || key,
            class: data.drugClass,
          }),
        );
      }

      res.json(simplified);
    } catch (error) {
      console.error("Error getting medications database:", error);
      res.status(500).json({ error: "Failed to get medications database" });
    }
  });

  app.post("/api/coach/program-advice", async (req, res) => {
    try {
      const { profile, recentCheckIns, muscleScores } = req.body;

      const cycleContext =
        profile?.cycleInfo?.compounds?.length > 0
          ? `Enhanced lifter on: ${profile.cycleInfo.compounds.map((c: any) => c.name).join(", ")}`
          : "Natural lifter";

      const prompt = `You are an AI hypertrophy coach. Analyze the following data and provide training program adjustments.

${JSON.stringify(HYPERTROPHY_SCIENCE, null, 2)}

User Profile:
${JSON.stringify(profile, null, 2)}

Enhancement Status: ${cycleContext}

Recent Check-ins (last 7 days):
${JSON.stringify(recentCheckIns, null, 2)}

Muscle Development Scores:
${JSON.stringify(muscleScores, null, 2)}

Based on this data, provide:
1. Any muscle groups that need additional volume
2. Any muscle groups that should have reduced volume
3. Overall recovery recommendations
4. Any weak point prioritization
5. Specific exercise substitutions if needed

Format as JSON with keys: additionalVolume, reducedVolume, recoveryNotes, weakPointPriority, exerciseSwaps`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        max_completion_tokens: 800,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content || "{}";
      res.json(JSON.parse(content));
    } catch (error) {
      console.error("Error in program advice:", error);
      res.status(500).json({ error: "Failed to generate program advice" });
    }
  });

  app.post("/api/coach/macro-adjustment", async (req, res) => {
    try {
      const { profile, weightTrend, currentMacros, goal } = req.body;

      const prompt = `You are an AI nutrition coach for bodybuilding. Based on the following data, recommend macro adjustments.

User Profile:
- Weight: ${profile?.weight || "Unknown"} lbs
- Goal: ${goal || "recomp"}

Weight Trend (last 7 days):
${JSON.stringify(weightTrend, null, 2)}

Current Macros:
${JSON.stringify(currentMacros, null, 2)}

Analyze the weight trend and recommend macro adjustments. Consider:
- If cutting: target 0.5-1% body weight loss per week
- If bulking: target 0.25-0.5% body weight gain per week
- If recomp: maintain weight with slight weekly fluctuations

Provide specific calorie and macro adjustments in JSON format:
{
  "calorieAdjustment": number (positive or negative),
  "proteinAdjustment": number,
  "carbAdjustment": number,
  "fatAdjustment": number,
  "reasoning": "brief explanation"
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        max_completion_tokens: 500,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content || "{}";
      res.json(JSON.parse(content));
    } catch (error) {
      console.error("Error in macro adjustment:", error);
      res.status(500).json({ error: "Failed to calculate macro adjustment" });
    }
  });

  app.post("/api/coach/strength-goals", async (req, res) => {
    try {
      const { profile, currentLifts, targetGoals } = req.body;

      const strengthStandards = JSON.stringify(STRENGTH_STANDARDS, null, 2);
      const cycleContext =
        profile?.cycleInfo?.compounds?.length > 0
          ? `Enhanced lifter on: ${profile.cycleInfo.compounds.map((c: any) => `${c.name} ${c.dosageAmount}${c.dosageUnit}`).join(", ")}`
          : "Natural lifter";

      const prompt = `${AI_SYSTEM_CONTEXT}

You are an expert strength coach. Analyze the user's current lifts and set REALISTIC strength goals.

STRENGTH STANDARDS (as multiple of bodyweight):
${strengthStandards}

USER PROFILE:
- Weight: ${profile?.weight || "Unknown"} ${profile?.weightUnit || "lbs"}
- Age: ${profile?.age || "Unknown"}
- Sex: ${profile?.sex || "male"}
- Experience: ${profile?.experienceLevel || "Unknown"}
- Status: ${cycleContext}

CURRENT LIFTS (1RM or estimated):
- Bench Press: ${currentLifts?.bench || "Unknown"} lbs
- Squat: ${currentLifts?.squat || "Unknown"} lbs
- Deadlift: ${currentLifts?.deadlift || "Unknown"} lbs
- Overhead Press: ${currentLifts?.ohp || "Unknown"} lbs
- Pull-ups: ${currentLifts?.pullups || "Unknown"} reps

USER'S TARGET GOALS:
${JSON.stringify(targetGoals || {}, null, 2)}

Analyze and provide:
1. Current strength level classification for each lift
2. Realistic adjusted targets based on experience and enhancement status
3. Timeline to reach goals
4. Weekly programming recommendations
5. Technique priorities to improve lifts

Enhanced lifters can typically:
- Progress 1.5-2x faster than natural
- Handle more volume and frequency
- Expect larger strength jumps
- Recover faster between sessions

Format as JSON:
{
  "currentLevel": {
    "bench": { "weight": 225, "bwRatio": 1.25, "classification": "intermediate" },
    "squat": { "weight": 315, "bwRatio": 1.75, "classification": "intermediate" },
    "deadlift": { "weight": 405, "bwRatio": 2.25, "classification": "advanced" },
    "ohp": { "weight": 135, "bwRatio": 0.75, "classification": "intermediate" },
    "pullups": { "reps": 12, "classification": "intermediate" }
  },
  "adjustedTargets": {
    "bench": { "target": 275, "timeline": "12 weeks", "realistic": true },
    "squat": { "target": 365, "timeline": "12 weeks", "realistic": true },
    "deadlift": { "target": 455, "timeline": "12 weeks", "realistic": true }
  },
  "programmingRecommendations": {
    "frequency": "bench 2x, squat 2x, deadlift 1.5x per week",
    "repRanges": "strength focus 3-5 reps, hypertrophy accessory 8-12",
    "techniques": ["pause reps", "tempo work", "progressive overload"]
  },
  "weakPoints": ["specific areas limiting each lift"],
  "priorityExercises": ["exercises to improve each lift"],
  "logicKeywords": ["<MANDATORY: 5-7 specific biomechanical/neuromuscular keywords used in your logic (e.g., 'stretch-shortening cycle', 'rate of force development', 'motor unit recruitment', 'leverage mechanics', etc.)>"]
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        max_completion_tokens: 1500,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content || "{}";
      res.json(JSON.parse(content));
    } catch (error) {
      console.error("Error in strength goals:", error);
      res.status(500).json({ error: "Failed to analyze strength goals" });
    }
  });

  app.post("/api/coach/analyze-posture", async (req, res) => {
    try {
      const { photos, profile } = req.body;

      const postureIssuesDb = JSON.stringify(POSTURE_ISSUES, null, 2);
      const postureSupplements = JSON.stringify(POSTURE_SUPPLEMENTS, null, 2);

      const prompt = `${AI_SYSTEM_CONTEXT}

You are an expert posture analyst and corrective exercise specialist.

POSTURE ISSUES DATABASE:
${postureIssuesDb}

POSTURE SUPPLEMENTS:
${postureSupplements}

USER PROFILE:
- Height: ${profile?.height || "Unknown"} ${profile?.heightUnit || "cm"}
- Weight: ${profile?.weight || "Unknown"} ${profile?.weightUnit || "lbs"}
- Age: ${profile?.age || "Unknown"}
- Occupation: ${profile?.occupation || "desk worker"}

Analyze the posture photos and provide a comprehensive assessment:

1. POSTURE ISSUES IDENTIFIED:
   - Anterior pelvic tilt (APT)
   - Posterior pelvic tilt
   - Upper crossed syndrome (rounded shoulders, forward head)
   - Lower crossed syndrome
   - Scapular winging
   - Rib flare
   - Kyphosis (excessive thoracic curve)
   - Lordosis (excessive lumbar curve)
   - Scoliosis (lateral curvature)
   - Knee valgus/varus

2. SEVERITY RATING (1-10) for each issue

3. CORRECTIVE PROTOCOL for each issue:
   - Stretches (with duration and frequency)
   - Strengthening exercises (with sets/reps)
   - Daily habits to practice
   - Recommended supplements
   - Equipment/braces if helpful

4. PRIORITY ORDER - which issues to address first

Format as JSON:
{
  "overallPostureScore": 65,
  "issues": [
    {
      "issue": "anterior pelvic tilt",
      "severity": 7,
      "description": "Visible excessive lumbar curve with protruding belly",
      "tightMuscles": ["hip flexors", "erector spinae"],
      "weakMuscles": ["glutes", "abdominals"],
      "stretches": [
        { "name": "couch stretch", "duration": "2 min each side", "frequency": "2x daily" }
      ],
      "strengthening": [
        { "name": "glute bridges", "sets": 3, "reps": 15, "cues": ["posterior pelvic tilt at top"] }
      ],
      "dailyHabits": ["practice posterior pelvic tilt when standing"],
      "supplements": ["magnesium for muscle relaxation"],
      "equipment": ["foam roller for quad release"],
      "timeline": "4-8 weeks with consistent work"
    }
  ],
  "priorityOrder": ["anterior pelvic tilt", "upper crossed syndrome"],
  "dailyRoutine": {
    "morning": ["5 min mobility routine"],
    "workDay": ["hourly posture breaks", "chin tucks"],
    "evening": ["stretching routine"]
  },
  "trainingAdjustments": ["reduce hip flexor dominant exercises", "add more glute work"]
}`;

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
      if (photos?.back) {
        imageMessages.push({
          type: "image_url",
          image_url: { url: photos.back, detail: "high" },
        });
      }

      console.log("Analyzing posture with", imageMessages.length, "images");

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // Use GPT-4o for vision capabilities
        messages: [
          {
            role: "system",
            content:
              "You are an expert posture analyst. Analyze the provided photos and return a detailed JSON assessment of postural issues with corrective protocols.",
          },
          {
            role: "user",
            content:
              imageMessages.length > 0
                ? [{ type: "text", text: prompt }, ...imageMessages]
                : prompt,
          },
        ],
        max_tokens: 2000,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content || "{}";
      console.log("Posture analysis response received");
      res.json(JSON.parse(content));
    } catch (error) {
      console.error("Error in posture analysis:", error);
      res.status(500).json({
        error: "Failed to analyze posture",
        message: "Posture analysis failed. Please retry with clear photos.",
        retryable: true,
      });
    }
  });

  app.post("/api/coach/grocery-list", async (req, res) => {
    try {
      const {
        profile,
        macroTargets,
        budget,
        budgetAmount,
        zipCode,
        preferences,
        location,
      } = req.body;
      if (
        !macroTargets?.calories ||
        !macroTargets?.protein ||
        !macroTargets?.carbs ||
        !macroTargets?.fat
      ) {
        return res.status(400).json({
          error: "Missing macro targets",
          message: "Set macro targets before generating a grocery list.",
        });
      }

      const groceryDb = JSON.stringify(GROCERY_CATEGORIES, null, 2);
      const nutritionContext = JSON.stringify(
        NUTRITION_SCIENCE.macronutrients,
        null,
        2,
      );

      const zipCodeInfo = zipCode
        ? `Zip Code: ${zipCode} (use for regional pricing context)`
        : "";

      const prompt = `${AI_SYSTEM_CONTEXT}

You are an expert nutrition coach creating a personalized grocery list.

GROCERY DATABASE:
${groceryDb}

NUTRITION SCIENCE:
${nutritionContext}

USER PROFILE:
- Daily Calories: ${macroTargets.calories}
- Protein Target: ${macroTargets.protein}g
- Carbs Target: ${macroTargets.carbs}g
- Fat Target: ${macroTargets.fat}g
- Budget Level: ${budget || "moderate"} (budget/moderate/premium)
- Weekly Budget Amount: $${budgetAmount || 150}
${zipCodeInfo}
- Dietary Preferences: ${preferences?.diet || "none"}
- Allergies: ${preferences?.allergies?.join(", ") || "none"}
- Location: ${location || "United States"}

Create a comprehensive grocery list for one week that fits within the $${budgetAmount || 150} budget:

1. Organize by store aisle/section
2. Include quantities based on macro targets
3. Calculate total macros and cost estimate
4. Include beverages (water, diet drinks, coffee)
5. Meal prep friendly items
6. Budget-appropriate choices

Format as JSON:
{
  "weeklyBudgetEstimate": "$150-180",
  "totalMacros": {
    "calories": 17500,
    "protein": 1260,
    "carbs": 1750,
    "fat": 560
  },
  "sections": [
    {
      "name": "Meat & Protein",
      "aisle": "Meat counter/Refrigerated",
      "items": [
        {
          "name": "Chicken breast",
          "quantity": "5 lbs",
          "cost": "$15-20",
          "macros": { "protein": 165, "carbs": 0, "fat": 10 },
          "mealPrepTip": "Season and bake in bulk"
        }
      ]
    },
    {
      "name": "Dairy & Eggs",
      "aisle": "Dairy section",
      "items": []
    },
    {
      "name": "Grains & Carbs",
      "aisle": "Dry goods",
      "items": []
    },
    {
      "name": "Produce",
      "aisle": "Produce section",
      "items": []
    },
    {
      "name": "Beverages",
      "aisle": "Beverage aisle",
      "items": [
        { "name": "Water (case)", "quantity": "2 cases", "note": "1 gallon daily minimum" },
        { "name": "Diet soda", "quantity": "1 pack", "note": "Zero calorie option" },
        { "name": "Coffee", "quantity": "1 bag", "note": "Pre-workout and metabolism" }
      ]
    }
  ],
  "mealPrepSuggestions": [
    "Sunday: Prep all proteins, cook rice in bulk",
    "Wednesday: Mid-week prep refresh"
  ],
  "quickMealIdeas": ["5 quick meal combinations from this list"]
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        max_completion_tokens: 2500,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content || "{}";
      res.json(JSON.parse(content));
    } catch (error) {
      console.error("Error generating grocery list:", error);
      res.status(500).json({ error: "Failed to generate grocery list" });
    }
  });

  app.post("/api/coach/analyze-form-video", async (req, res) => {
    try {
      const { videoFrames, exerciseName, muscleGroup, profile } = req.body;

      const exerciseDb = JSON.stringify(
        EXERCISE_FORM_DATABASE.compounds,
        null,
        2,
      );

      const prompt = `${AI_SYSTEM_CONTEXT}

You are an expert strength coach analyzing exercise form from video frames.

EXERCISE FORM DATABASE:
${exerciseDb}

EXERCISE BEING ANALYZED: ${exerciseName || "Unknown"}
TARGET MUSCLE GROUP: ${muscleGroup || "Unknown"}

USER PROFILE:
- Experience: ${profile?.experienceLevel || "intermediate"}
- Previous Injuries: ${profile?.injuries || "none reported"}

Analyze the form video frames and provide detailed feedback:

1. FORM ASSESSMENT (1-10):
   - Overall form score
   - Safety score
   - Efficiency score

2. POSITIVE ASPECTS:
   - What the user is doing well
   - Good positions/angles observed

3. CORRECTIONS NEEDED:
   - Specific issues observed
   - Safety concerns
   - Efficiency improvements

4. VISUAL CUE DESCRIPTIONS:
   - Describe where in the movement corrections are needed
   - Reference body positions (e.g., "at the bottom of the squat, knees are caving")

5. CORRECTIVE DRILLS:
   - Exercises to improve form
   - Mobility work if needed
   - Cue modifications

Format as JSON:
{
  "overallScore": 7,
  "safetyScore": 8,
  "efficiencyScore": 6,
  "positiveAspects": [
    { "aspect": "Good depth achieved", "timestamp": "bottom of movement" }
  ],
  "corrections": [
    {
      "issue": "Knee cave during ascent",
      "severity": "moderate",
      "timestamp": "coming up from bottom position",
      "visualDescription": "Knees collapsing inward about 15 degrees",
      "fix": "Push knees out over toes, think 'spread the floor'",
      "drill": "Banded squats to reinforce knee tracking"
    }
  ],
  "mobilityIssues": [
    { "area": "ankle mobility", "affects": "squat depth and knee tracking" }
  ],
  "recommendedDrills": [
    { "name": "Goblet squat pause", "purpose": "reinforce bottom position", "sets": "3x8" }
  ],
  "cuesheet": {
    "before": ["Brace core", "Spread floor with feet"],
    "during": ["Knees out", "Chest up"],
    "finish": ["Squeeze glutes", "Full lockout"]
  }
}`;

      const imageMessages: any[] = [];
      if (videoFrames && Array.isArray(videoFrames)) {
        videoFrames.slice(0, 5).forEach((frame: string) => {
          imageMessages.push({
            type: "image_url",
            image_url: { url: frame, detail: "high" },
          });
        });
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content:
              imageMessages.length > 0
                ? [{ type: "text", text: prompt }, ...imageMessages]
                : prompt,
          },
        ],
        max_completion_tokens: 1500,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content || "{}";
      res.json(JSON.parse(content));
    } catch (error) {
      console.error("Error analyzing form video:", error);
      res.status(500).json({ error: "Failed to analyze form video" });
    }
  });

  app.post("/api/coach/warmup-protocol", async (req, res) => {
    try {
      const { exercise, profile, workingWeight } = req.body;

      const warmupDb = JSON.stringify(POSTURE_WARMUPS, null, 2);
      const warmupTiming = JSON.stringify(WARMUP_TIMING, null, 2);

      const prompt = `${AI_SYSTEM_CONTEXT}

You are an expert strength coach creating a personalized warmup protocol.

WARMUP DATABASE:
${warmupDb}

WARMUP TIMING GUIDELINES:
${warmupTiming}

MAIN EXERCISE: ${exercise || "Bench Press"}
WORKING WEIGHT: ${workingWeight || 225} lbs
USER EXPERIENCE: ${profile?.experienceLevel || "intermediate"}
PREVIOUS INJURIES: ${profile?.injuries || "none"}

Create a comprehensive warmup protocol:

1. GENERAL WARMUP (5 min):
   - Light cardio to increase body temperature
   - Dynamic stretching

2. MOVEMENT-SPECIFIC MOBILITY:
   - Targeted mobility work
   - Activation exercises

3. RAMP-UP SETS:
   - Progressive loading to working weight
   - Specific weights and reps

4. TIMING:
   - Duration for each phase
   - Total warmup time
   - Rest between ramp-up sets

Format as JSON:
{
  "totalTime": "15-18 minutes",
  "phases": [
    {
      "name": "General Warmup",
      "duration": "5 minutes",
      "exercises": [
        { "name": "Light rowing or bike", "duration": "3 min", "intensity": "easy pace" },
        { "name": "Arm circles", "reps": "10 each direction" },
        { "name": "Jumping jacks", "reps": 20 }
      ]
    },
    {
      "name": "Movement Prep",
      "duration": "5 minutes",
      "exercises": [
        { "name": "Foam roll thoracic spine", "duration": "60 sec" },
        { "name": "Band dislocates", "reps": 15 },
        { "name": "Face pulls", "reps": 15, "cue": "External rotate at end" },
        { "name": "Scap push-ups", "reps": 10 }
      ]
    },
    {
      "name": "Ramp-Up Sets",
      "duration": "5-8 minutes",
      "sets": [
        { "weight": "bar only (45 lbs)", "reps": 15, "rest": "30 sec", "purpose": "groove pattern" },
        { "weight": "95 lbs", "reps": 10, "rest": "45 sec", "purpose": "light practice" },
        { "weight": "135 lbs", "reps": 5, "rest": "60 sec", "purpose": "moderate load" },
        { "weight": "185 lbs", "reps": 3, "rest": "90 sec", "purpose": "heavier practice" },
        { "weight": "205 lbs", "reps": 1, "rest": "2 min", "purpose": "CNS activation" }
      ]
    }
  ],
  "notes": [
    "Adjust ramp-up weights based on how you feel",
    "Take longer rest before first working set if needed"
  ],
  "injuryModifications": "Modifications if user has specific injuries"
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        max_completion_tokens: 1200,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content || "{}";
      res.json(JSON.parse(content));
    } catch (error) {
      console.error("Error generating warmup protocol:", error);
      res.status(500).json({ error: "Failed to generate warmup protocol" });
    }
  });

  app.get("/api/knowledge/exercises/:muscleGroup", (req, res) => {
    const { muscleGroup } = req.params;
    const exercises =
      EXERCISE_FORM_DATABASE.compounds[
      muscleGroup as keyof typeof EXERCISE_FORM_DATABASE.compounds
      ] ||
      EXERCISE_FORM_DATABASE.isolations[
      muscleGroup as keyof typeof EXERCISE_FORM_DATABASE.isolations
      ] ||
      null;

    if (exercises) {
      res.json(exercises);
    } else {
      res.status(404).json({ error: "Muscle group not found" });
    }
  });

  app.get("/api/knowledge/strength-standards", (req, res) => {
    res.json(STRENGTH_STANDARDS);
  });

  app.get("/api/knowledge/posture-issues", (req, res) => {
    res.json(POSTURE_ISSUES);
  });

  app.get("/api/knowledge/grocery-items", (req, res) => {
    res.json(GROCERY_CATEGORIES);
  });

  app.get("/api/compounds", (req, res) => {
    try {
      const compounds: any[] = [];
      let id = 1;

      // Transform injectable steroids (classes)
      for (const [key, data] of Object.entries(STEROID_PHARMACOLOGY.classes)) {
        const compound: any = data;
        const name = key.charAt(0).toUpperCase() + key.slice(1);

        let dosageInfo = "";
        if (compound.typicalDose) {
          if (typeof compound.typicalDose === "string") {
            dosageInfo = compound.typicalDose;
          } else {
            dosageInfo = Object.entries(compound.typicalDose)
              .map(([level, dose]) => `${level.toUpperCase()}: ${dose}`)
              .join(" | ");
          }
        }

        let esterInfo = "";
        if (compound.esters) {
          esterInfo = Object.entries(compound.esters)
            .map(
              ([ester, info]: [string, any]) =>
                `${ester.charAt(0).toUpperCase() + ester.slice(1)}: Half-life ${info.halfLife}, ${info.frequency}`,
            )
            .join("; ");
        } else if (compound.compounds) {
          esterInfo = Object.entries(compound.compounds)
            .map(
              ([variant, info]: [string, any]) =>
                `${info.tradeName || variant}: Half-life ${info.halfLife}, ${info.frequency}`,
            )
            .join("; ");
        } else if (compound.forms) {
          esterInfo = Object.entries(compound.forms)
            .map(
              ([form, info]: [string, any]) =>
                `${form.charAt(0).toUpperCase() + form.slice(1)} (${info.route}): Half-life ${info.halfLife}`,
            )
            .join("; ");
        }

        compounds.push({
          id: String(id++),
          name: compound.tradeName || name,
          category: "Injectable Anabolic Steroid",
          description:
            compound.description ||
            `${name} - ${compound.notes || "Injectable steroid compound"}`,
          commonDosages: dosageInfo || "Varies by protocol",
          cycleLength: compound.halfLife
            ? `Based on ${compound.halfLife} half-life`
            : "12-16 weeks typical",
          benefits: compound.effects || [],
          risks: compound.sideEffects || [],
          notes: [esterInfo, compound.notes].filter(Boolean).join(". "),
        });
      }

      // Transform oral steroids
      for (const [key, data] of Object.entries(STEROID_PHARMACOLOGY.orals)) {
        const oral: any = data;
        compounds.push({
          id: String(id++),
          name: oral.chemicalName || key.charAt(0).toUpperCase() + key.slice(1),
          category: "Oral Anabolic Steroid",
          description: `${key.charAt(0).toUpperCase() + key.slice(1)} - oral compound with ${oral.halfLife} half-life. ${oral.notes || ""}`,
          commonDosages: oral.typicalDose || "See protocol",
          cycleLength: oral.duration || "4-6 weeks max (hepatotoxicity)",
          benefits: oral.effects || [],
          risks: oral.sideEffects || [],
          notes:
            oral.notes ||
            `Half-life: ${oral.halfLife}. Liver support recommended.`,
        });
      }

      // Add HGH
      compounds.push({
        id: String(id++),
        name: "Human Growth Hormone (HGH)",
        category: "Peptide Hormone",
        description: HGH_PROTOCOLS.description,
        commonDosages: Object.entries(HGH_PROTOCOLS.dosing)
          .map(
            ([use, dose]) =>
              `${use.replace(/([A-Z])/g, " $1").trim()}: ${dose}`,
          )
          .join(" | "),
        cycleLength: "Continuous use (minimum 3-6 months for results)",
        benefits: HGH_PROTOCOLS.benefits,
        risks: HGH_PROTOCOLS.sideEffects,
        notes: `Timing: ${HGH_PROTOCOLS.timing.join("; ")}`,
      });

      // Add Insulin (with strong warning)
      compounds.push({
        id: String(id++),
        name: "Insulin",
        category: "Peptide Hormone",
        description: `${INSULIN_PROTOCOLS.warning}. Used for extreme nutrient partitioning.`,
        commonDosages: "5-15 IU post-workout (ADVANCED ONLY)",
        cycleLength: "Pre/post workout only, never before bed",
        benefits: [
          "Extreme nutrient shuttling",
          "Synergy with HGH",
          "Muscle fullness",
        ],
        risks: [
          "HYPOGLYCEMIA - CAN BE FATAL",
          "Requires constant carb availability",
          "Fat gain if misused",
        ],
        notes: `SAFETY RULES: ${INSULIN_PROTOCOLS.safetyRules.join("; ")}. ${INSULIN_PROTOCOLS.synergy}`,
      });

      // Add Ancillaries section
      // AIs
      for (const [key, ai] of Object.entries(
        STEROID_PHARMACOLOGY.ancillaries.aromataseInhibitors,
      )) {
        const aiData: any = ai;
        compounds.push({
          id: String(id++),
          name: aiData.tradeName || key,
          category: "Aromatase Inhibitor (Ancillary)",
          description: `${aiData.mechanism} - used to control estrogen during cycle`,
          commonDosages: aiData.dose,
          cycleLength: "As needed during cycle",
          benefits: [
            "Estrogen control",
            "Prevents gynecomastia",
            "Reduces water retention",
          ],
          risks: [
            "Can crash E2 if overdosed",
            "Joint pain from low E2",
            "Mood issues",
          ],
          notes: aiData.mechanism,
        });
      }

      // SERMs
      for (const [key, serm] of Object.entries(
        STEROID_PHARMACOLOGY.ancillaries.serms,
      )) {
        const sermData: any = serm;
        compounds.push({
          id: String(id++),
          name: sermData.tradeName || key,
          category: "SERM (Ancillary/PCT)",
          description: `${sermData.use} - selective estrogen receptor modulator`,
          commonDosages: sermData.dose,
          cycleLength: "PCT: 4-8 weeks, or as needed for gyno",
          benefits: [
            "Stimulates natural testosterone",
            "Blocks estrogen at receptor",
            "Essential for PCT",
          ],
          risks: [
            "Vision issues (Clomid)",
            "Mood swings possible",
            "May increase SHBG",
          ],
          notes: `Primary use: ${sermData.use}`,
        });
      }

      // Prolactin control
      for (const [key, med] of Object.entries(
        STEROID_PHARMACOLOGY.ancillaries.prolactinControl,
      )) {
        const medData: any = med;
        compounds.push({
          id: String(id++),
          name: key.charAt(0).toUpperCase() + key.slice(1),
          category: "Prolactin Control (Ancillary)",
          description: `${medData.use} - dopamine agonist`,
          commonDosages: medData.dose,
          cycleLength: "As needed with 19-nor compounds",
          benefits: [
            "Controls prolactin",
            "Prevents lactation/gyno from 19-nors",
            "Improved libido",
          ],
          risks: ["Nausea initially", "Can affect mood", "Expensive"],
          notes: medData.use,
        });
      }

      res.json({
        compounds,
        cycleProtocols: CYCLE_PROTOCOLS,
      });
    } catch (error) {
      console.error("Error fetching compounds:", error);
      res.status(500).json({ error: "Failed to fetch compound data" });
    }
  });

  app.post("/api/coach/research-training-science", async (req, res) => {
    try {
      const { topic, isEnhanced, experienceLevel, goal } = req.body;

      const searchContext = isEnhanced
        ? "enhanced athlete on anabolic steroids"
        : "natural athlete without performance enhancing drugs";

      const prompt = `You are an expert sports scientist and exercise physiologist. Research and provide current evidence-based recommendations.

RESEARCH TOPIC: ${topic || "optimal hypertrophy training"}
ATHLETE STATUS: ${searchContext}
EXPERIENCE LEVEL: ${experienceLevel || "intermediate"}
GOAL: ${goal || "hypertrophy"}

Based on the latest research from peer-reviewed journals (JSCR, Sports Medicine, IJSPP, etc.) and expert consensus, provide comprehensive recommendations:

1. VOLUME RECOMMENDATIONS:
   - Weekly sets per muscle group (minimum effective dose, maximum adaptive volume, maximum recoverable volume)
   - How to auto-regulate based on recovery markers
   - Enhanced vs natural volume considerations

2. FREQUENCY RECOMMENDATIONS:
   - Optimal training frequency per muscle group
   - Full body vs split considerations
   - Recovery windows for enhanced vs natural

3. INTENSITY RECOMMENDATIONS:
   - Proximity to failure (RIR/RPE guidelines)
   - Strength vs hypertrophy periodization
   - When to use intensity techniques

4. PROGRESSIVE OVERLOAD:
   - How to implement for this athlete type
   - Rate of progression expectations
   - Deload frequency and protocol

5. EXERCISE SELECTION:
   - Compound to isolation ratio
   - Movement pattern coverage
   - Lengthened vs shortened position bias

6. PERIODIZATION:
   - Recommended mesocycle structure
   - Wave loading or linear progression
   - When to introduce variation

Provide JSON format:
{
  "topic": "research topic",
  "athleteType": "natural|enhanced",
  "volumeRecommendations": {
    "minSetsPerMuscle": 8,
    "maxSetsPerMuscle": 20,
    "enhancedAdjustment": "+30-50% volume tolerable",
    "autoRegulation": ["fatigue markers", "performance drops", "etc."]
  },
  "frequencyRecommendations": {
    "optimalFrequency": "2-3x per week per muscle",
    "recoveryWindow": "48-72 hours",
    "splitSuggestion": "PPL or Upper/Lower",
    "rationale": "explanation"
  },
  "intensityRecommendations": {
    "rir": "1-3 RIR for most sets",
    "failureGuidelines": "when to go to failure",
    "intensityTechniques": ["which to use", "frequency"]
  },
  "progressiveOverload": {
    "strategy": "double progression or linear",
    "rateOfProgress": "expected weekly gains",
    "deloadProtocol": "frequency and structure"
  },
  "exerciseSelection": {
    "compoundRatio": "60-70% compounds",
    "movementPatterns": ["horizontal push", "vertical pull", "etc."],
    "lengthendBias": "prioritize stretch position exercises"
  },
  "periodization": {
    "mesocycleLength": "4-6 weeks",
    "progression": "linear or wave",
    "deloadWeek": "every 4-6 weeks"
  },
  "keyCitations": [
    "Schoenfeld et al. (2017) - Volume for hypertrophy",
    "Israetel et al. (2019) - Volume landmarks",
    "etc."
  ],
  "practicalApplication": [
    "Key takeaway 1",
    "Key takeaway 2"
  ]
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        max_completion_tokens: 2000,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content || "{}";
      res.json(JSON.parse(content));
    } catch (error) {
      console.error("Error researching training science:", error);
      res.status(500).json({ error: "Failed to research training science" });
    }
  });

  app.post("/api/coach/comprehensive-macros", async (req, res) => {
    try {
      const {
        profile: incomingProfile,
        physiqueAnalysis: incomingPhysique,
        compoundResearch: incomingCompoundResearch,
        userId,
        profileId,
      } = req.body;
      const aiContext = await buildAiContext({
        profile: incomingProfile,
        profileId,
        userId,
      });
      const profile = aiContext.profile || incomingProfile;
      const physiqueAnalysis = profile?.physiqueAnalysis || incomingPhysique;
      const compoundResearch =
        profile?.compoundResearch || incomingCompoundResearch;

      const profileValidation = validateProfilePayload(profile);
      if (!profileValidation.success) {
        return res.status(400).json({
          error: "Invalid profile payload",
          issues: profileValidation.error.issues,
        });
      }

      // CRITICAL: Validate required fields - DO NOT use defaults
      console.log("=== MACRO CALCULATION REQUEST ===");
      console.log(
        "Profile received:",
        JSON.stringify(
          {
            weight: profile?.weight,
            weightUnit: profile?.weightUnit,
            height: profile?.height,
            heightUnit: profile?.heightUnit,
            age: profile?.age,
            sex: profile?.sex,
            goal: profile?.goal,
          },
          null,
          2,
        ),
      );

      // Check for required fields - fail if missing
      const requiredFields = ["weight", "height", "age", "sex"];
      const missingFields = requiredFields.filter((field) => !profile?.[field]);

      if (missingFields.length > 0) {
        console.error("MISSING REQUIRED PROFILE FIELDS:", missingFields);
        return res.status(400).json({
          error: "Missing required profile data",
          missingFields,
          message:
            "Please complete your profile with height, weight, age, and sex before calculating macros.",
        });
      }

      // Validate the values are reasonable
      if (profile.weight <= 0 || profile.weight > 500) {
        return res.status(400).json({
          error: "Invalid weight value. Please enter a valid weight.",
        });
      }
      if (profile.height <= 0 || profile.height > 300) {
        return res.status(400).json({
          error: "Invalid height value. Please enter a valid height.",
        });
      }
      if (profile.age <= 0 || profile.age > 120) {
        return res.status(400).json({
          error: "Invalid age value. Please enter a valid age.",
        });
      }

      console.log("VALIDATED - Using actual user data for macro calculation");

      // Use actual values (we've validated they exist)
      const weight = profile.weight;
      const weightUnit = profile.weightUnit || "lbs";
      const height = profile.height;
      const heightUnit = profile.heightUnit || "cm";
      const age = profile.age;
      const sex = profile.sex;
      const goal = profile.goal || "recomp";
      const experienceLevel = profile?.experienceLevel || "intermediate";
      const trainingDays = profile?.trainingProgram?.daysPerWeek || 5;
      const isEnhanced =
        profile?.isOnCycle && profile?.cycleInfo?.compounds?.length > 0;
      const medicationsList = profile?.medicationsWithDosage?.length
        ? profile.medicationsWithDosage
        : (profile?.medications || []).map((name: string) => ({ name }));
      const medicationImpacts = medicationsList?.length
        ? getMedicationImpacts(medicationsList)
        : null;
      const medicationContext = medicationImpacts
        ? `
MEDICATION IMPACTS:
- Diet impacts: ${medicationImpacts.dietImpacts.map((impact: any) => `${impact.medication}: ${impact.effects.map((e: any) => e.effect).join("; ")}`).join(" | ")}
- Training impacts: ${medicationImpacts.trainingImpacts.map((impact: any) => `${impact.medication}: ${impact.effects.map((e: any) => e.effect).join("; ")}`).join(" | ")}
- Critical notes: ${medicationImpacts.criticalNotes.join(" | ") || "None"}`
        : "";

      // Convert to standard units for calculation
      const weightKg = weightUnit === "lbs" ? weight * 0.453592 : weight;
      const weightLbs = weightUnit === "kg" ? weight * 2.20462 : weight;
      // Handle height in inches (from ft/in input) or cm
      const heightCm = heightUnit === "in" ? height * 2.54 : height;

      // SERVER-SIDE BMR calculation using Mifflin-St Jeor (guaranteed accurate)
      let bmr: number;
      if (sex === "male") {
        bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
      } else {
        bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
      }
      bmr = Math.round(bmr);

      // Activity multiplier based on training days
      let activityMultiplier: number;
      if (trainingDays <= 2) activityMultiplier = 1.375;
      else if (trainingDays <= 3) activityMultiplier = 1.55;
      else if (trainingDays <= 5) activityMultiplier = 1.725;
      else activityMultiplier = 1.9;

      // Enhanced athletes get slightly higher multiplier due to increased recovery
      if (isEnhanced) {
        activityMultiplier *= 1.05;
      }

      const tdee = Math.round(bmr * activityMultiplier);

      // Goal-based calorie adjustment
      let calorieTarget: number;
      let calorieAdjustment: string;
      switch (goal) {
        case "cut":
          calorieTarget = Math.round(tdee * 0.8); // 20% deficit
          calorieAdjustment = "-20%";
          break;
        case "bulk":
          calorieTarget = Math.round(tdee * 1.15); // 15% surplus
          calorieAdjustment = "+15%";
          break;
        case "maintain":
          calorieTarget = tdee;
          calorieAdjustment = "0%";
          break;
        case "recomp":
        default:
          calorieTarget = Math.round(tdee * 0.95); // Slight deficit
          calorieAdjustment = "-5%";
          break;
      }

      // Protein calculation (based on lean body mass estimate)
      const bodyFatPercent =
        parseBodyFatEstimate(physiqueAnalysis?.bodyFatEstimate) ??
        (sex === "male" ? 0.16 : 0.23);
      const lbm = weightLbs * (1 - bodyFatPercent);
      const proteinPerLb = isEnhanced ? 1.2 : 1.0; // Higher for enhanced
      const proteinGrams = Math.round(lbm * proteinPerLb);

      // Fat calculation (0.35-0.4g per lb bodyweight)
      const fatGrams = Math.round(weightLbs * 0.38);

      // Carbs fill remaining calories
      const proteinCals = proteinGrams * 4;
      const fatCals = fatGrams * 9;
      const remainingCals = calorieTarget - proteinCals - fatCals;
      const carbGrams = Math.round(remainingCals / 4);

      // Rest day adjustments (lower carbs)
      const restDayCalories = Math.round(calorieTarget * 0.9);
      const restDayCarbs = Math.round(carbGrams * 0.75);

      console.log("=== SERVER CALCULATED VALUES ===");
      console.log(
        `BMR: ${bmr}, TDEE: ${tdee}, Target Calories: ${calorieTarget}`,
      );
      console.log(
        `Protein: ${proteinGrams}g, Carbs: ${carbGrams}g, Fat: ${fatGrams}g`,
      );

      const bodyFatEstimate =
        physiqueAnalysis?.bodyFatEstimate ||
        (sex === "male" ? "14-18%" : "20-25%");

      const cycleContext = isEnhanced
        ? `
ENHANCED ATHLETE - Current Protocol:
${profile.cycleInfo.compounds
          .map((c: any) => {
            const research = compoundResearch?.[c.name];
            const nutritionAdj = research?.nutritionAdjustments;
            return `- ${c.name}: ${c.dosageAmount}${c.dosageUnit} (${c.frequency || "2x/week"})
    ${nutritionAdj ? `→ Protein multiplier: ${nutritionAdj.proteinMultiplier}x, Calorie adj: ${nutritionAdj.calorieAdjustment}` : ""}`;
          })
          .join("\n")}
Cycle Week: ${profile.cycleInfo.weeksIn}/${profile.cycleInfo.totalWeeks}

ENHANCED NUTRITION IMPLICATIONS:
- Muscle protein synthesis elevated for 36-48 hours (vs 24-36 natural)
- Can utilize more protein per meal (60-80g vs 40-60g)
- Improved nutrient partitioning (more to muscle, less to fat)
- Faster glycogen replenishment
- Some compounds (Tren, DNP) increase metabolic rate significantly
- Some compounds (Deca, Dbol) cause water retention - sodium management important
- Androgens increase red blood cell count - hydration critical
- Oral compounds require liver support (NAC, TUDCA) - timing with meals
`
        : `
NATURAL ATHLETE - No Enhancement Protocol

NATURAL NUTRITION IMPLICATIONS:
- Standard muscle protein synthesis window (24-36 hours)
- Optimal protein per meal: 40-60g
- Standard nutrient partitioning
- Progressive approach to surplus/deficit required
- Meal timing can help but is not critical
- Focus on whole food quality over supplements
`;

      const physiqueContext = physiqueAnalysis
        ? `
PHYSIQUE ANALYSIS DATA (from computer vision):
- Body Fat Estimate: ${physiqueAnalysis.bodyFatEstimate || "Unknown"}
- Overall Development Score: ${physiqueAnalysis.overallScore || "N/A"}/100
- Muscle Maturity: ${physiqueAnalysis.muscleMaturity || "N/A"}/10

MUSCLE PROPORTIONS (affects lean mass calculation):
${physiqueAnalysis.proportions
          ? Object.entries(physiqueAnalysis.proportions)
            .map(([muscle, score]) => `- ${muscle}: ${score}/10`)
            .join("\n")
          : "Not available"
        }

FRAME ANALYSIS:
${physiqueAnalysis.frameAnalysis
          ? `
- Clavicles: ${physiqueAnalysis.frameAnalysis.clavicles}
- Waist: ${physiqueAnalysis.frameAnalysis.waist}
- Hips: ${physiqueAnalysis.frameAnalysis.hips}
`
          : "Frame analysis not available"
        }

WEAK POINTS (may need extra protein allocation):
${physiqueAnalysis.weakPoints?.slice(0, 3).join(", ") || "None identified"}

STRONG POINTS (maintenance volume):
${physiqueAnalysis.strongPoints?.slice(0, 3).join(", ") || "None identified"}
`
        : `
PHYSIQUE ANALYSIS: Not available - using standard calculations
`;

      const goalContext = {
        cut: {
          description: "CUTTING / FAT LOSS",
          calorieModifier:
            "Deficit of 300-500 calories (0.5-1% bodyweight loss per week)",
          proteinNote:
            "High protein critical for muscle preservation (1.1-1.4g/lb)",
          carbNote: "Moderate carbs around training, lower on rest days",
          fatNote: "Moderate fat for hormones (0.35-0.4g/lb minimum)",
        },
        bulk: {
          description: "BULKING / MUSCLE GAIN",
          calorieModifier:
            "Surplus of 200-400 calories (0.25-0.5% bodyweight gain per week)",
          proteinNote: "Elevated protein for muscle growth (1.0-1.2g/lb)",
          carbNote: "High carbs to fuel training and growth",
          fatNote: "Moderate fat for hormones and calories",
        },
        recomp: {
          description: "BODY RECOMPOSITION",
          calorieModifier: "At or slightly below maintenance (100-200 deficit)",
          proteinNote:
            "High protein for simultaneous muscle gain (1.1-1.3g/lb)",
          carbNote: "Cycle carbs: higher on training days, lower on rest days",
          fatNote: "Moderate fat for hormones",
        },
        maintain: {
          description: "MAINTENANCE",
          calorieModifier: "At maintenance TDEE",
          proteinNote: "Standard protein for muscle maintenance (1.0g/lb)",
          carbNote: "Moderate carbs based on activity",
          fatNote: "Moderate fat for hormones",
        },
      };

      const selectedGoal =
        goalContext[goal as keyof typeof goalContext] || goalContext.recomp;

      // Height in inches for display
      const heightInches = heightUnit === "cm" ? height / 2.54 : height;

      const prompt = `${AI_SYSTEM_CONTEXT}

You are an ELITE nutrition coach for bodybuilders and physique athletes. The server has already calculated baseline macros using precise formulas. Your job is to REFINE and OPTIMIZE these values based on the user's specific situation, goals, and any compound protocols.

===== USER PHYSICAL STATS =====
Height: ${heightCm.toFixed(1)} cm (${Math.floor(heightInches / 12)}'${Math.round(heightInches % 12)}")
Weight: ${weightKg.toFixed(1)} kg (${weightLbs.toFixed(1)} lbs)
Age: ${age}
Sex: ${sex}
Training Days/Week: ${trainingDays}
Experience Level: ${experienceLevel}
Enhanced Status: ${isEnhanced ? "YES" : "NO"}

===== SERVER-CALCULATED BASELINE (Mifflin-St Jeor) =====
BMR: ${bmr} kcal/day
Activity Multiplier: ${activityMultiplier.toFixed(2)}
TDEE: ${tdee} kcal/day
Goal Adjustment: ${calorieAdjustment}
Target Calories: ${calorieTarget} kcal/day

BASELINE MACROS:
- Protein: ${proteinGrams}g (${proteinPerLb}g per lb LBM)
- Carbs: ${carbGrams}g
- Fat: ${fatGrams}g

REST DAY TARGETS:
- Calories: ${restDayCalories} kcal/day
- Carbs: ${restDayCarbs}g (reduced)

IMPORTANT: These baseline values are ALREADY CALCULATED. You must use these as your starting point. You may adjust +/- 5-10% based on specific factors like compounds, body fat, physique analysis, but the values MUST be close to these baselines.

===== GOAL: ${selectedGoal.description} =====
${selectedGoal.calorieModifier}
${selectedGoal.proteinNote}
${selectedGoal.carbNote}
${selectedGoal.fatNote}

${cycleContext}
${physiqueContext}
${medicationContext}

===== YOUR TASK =====
1. Review the server-calculated baseline macros above
2. Apply minor adjustments based on user's specific protocol, physique analysis, and goals
3. Provide detailed explanation of your refinements
4. DO NOT deviate more than 10% from the baseline calculations unless there's a strong reason

STEP 4: Calculate lean body mass (LBM):
- Use body fat estimate from physique analysis if available
- LBM = Total Weight × (1 - Body Fat %)

STEP 5: Calculate protein based on LBM and status:
- Natural athlete: 1.0-1.2g per lb of LEAN body mass
- Enhanced athlete: 1.2-1.5g per lb of LEAN body mass
- Higher during cut, standard during bulk

STEP 6: Calculate fat minimum for hormones:
- Male: 0.35-0.45g per lb total bodyweight
- Female: 0.40-0.50g per lb total bodyweight
- Never go below 15% of total calories

STEP 7: Fill remaining calories with carbohydrates:
- (Remaining calories after protein and fat) ÷ 4 = carb grams
- Prioritize carbs around training

STEP 8: Apply compound-specific adjustments:
- Trenbolone: +10-15% metabolism, can be more aggressive with deficit
- Test/Deca: Standard multipliers
- HGH: Improved fat oxidation, can run lower carbs
- Oral compounds: Time nutrients around doses for liver support

===== OUTPUT REQUIREMENTS =====

You MUST provide EXTREMELY DETAILED output including:
1. Complete step-by-step calculation breakdown
2. All intermediate values (BMR, TDEE, LBM, etc.)
3. Final macro targets for TRAINING days and REST days
4. Meal timing recommendations
5. Supplement recommendations based on protocol
6. Hydration requirements
7. Micronutrient focus areas
8. Weekly adjustments based on progress

Return JSON:
{
  "calculationSteps": [
    {"step": "BMR Calculation", "formula": "formula used", "result": number, "explanation": "why this value"},
    {"step": "TDEE Calculation", "multiplier": 1.725, "result": number, "explanation": ""},
    {"step": "Lean Body Mass", "bodyFat": "15%", "lbm": number, "explanation": ""},
    {"step": "Goal Adjustment", "modifier": "-20%", "result": number, "explanation": ""},
    {"step": "Compound Adjustments", "adjustments": ["list"], "finalTDEE": number}
  ],
  "macroTargets": {
    "trainingDay": {
      "calories": number,
      "protein": {"grams": number, "perLbLBM": number, "percentage": number},
      "carbs": {"grams": number, "percentage": number},
      "fat": {"grams": number, "percentage": number},
      "fiber": number
    },
    "restDay": {
      "calories": number,
      "protein": {"grams": number, "perLbLBM": number, "percentage": number},
      "carbs": {"grams": number, "percentage": number},
      "fat": {"grams": number, "percentage": number},
      "fiber": number
    }
  },
  "mealTiming": {
    "mealsPerDay": 4,
    "preWorkout": {"timing": "1-2 hours before", "macros": "40g carbs, 30g protein", "notes": ""},
    "postWorkout": {"timing": "within 2 hours", "macros": "60g carbs, 40g protein", "notes": ""},
    "beforeBed": {"macros": "30g protein, minimal carbs", "notes": "casein or slow protein"}
  },
  "hydration": {
    "baseWater": "liters/day",
    "adjustments": "additional for training/compounds",
    "electrolytes": "sodium/potassium/magnesium recommendations"
  },
  "supplements": [
    {"name": "Creatine Monohydrate", "dose": "5g daily", "timing": "any time", "priority": "essential"},
    {"name": "Vitamin D3", "dose": "5000IU", "timing": "with fat", "priority": "important"}
  ],
  "micronutrientFocus": [
    {"nutrient": "Zinc", "importance": "testosterone production", "sources": "red meat, oysters"},
    {"nutrient": "Magnesium", "importance": "muscle function", "sources": "nuts, dark chocolate"}
  ],
  "weeklyAdjustments": {
    "ifWeightUp": "reduce calories by 100-150, primarily from carbs",
    "ifWeightDown": "increase calories by 100-150, primarily from carbs",
    "ifStrengthStall": "consider carb refeed day",
    "checkFrequency": "weekly weigh-in, morning after bathroom"
  },
  "protocolNotes": [
    "Specific notes based on compounds/status",
    "Timing recommendations",
    "Warning signs to watch for"
  ],
  "confidenceLevel": "high/medium/low",
  "methodology": "Summary of calculation approach"
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        max_completion_tokens: 3500,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content || "{}";
      res.json(JSON.parse(content));
    } catch (error) {
      console.error("Error calculating comprehensive macros:", error);
      res
        .status(500)
        .json({ error: "Failed to calculate comprehensive macros" });
    }
  });

  app.post("/api/coach/research-compound", async (req, res) => {
    try {
      const { compoundName, userGoal, cycleContext } = req.body;

      const prompt = `You are an expert sports medicine pharmacologist. Research and provide comprehensive information about "${compoundName}" for someone with goal: ${userGoal || "hypertrophy"}.
${cycleContext ? `Current cycle context: ${cycleContext}` : ""}

Provide DETAILED, ACTIONABLE information including:

1. MECHANISM OF ACTION
- How it works at the molecular/receptor level
- Primary effects on muscle protein synthesis, recovery, metabolism
- Half-life and pharmacokinetics

2. BENEFITS/PROS
- Specific benefits for hypertrophy/performance
- What users typically report experiencing
- Synergies with other compounds

3. SIDE EFFECTS/CONS  
- Common side effects and their frequency
- Serious risks and contraindications
- Individual variation factors

4. OPTIMAL DOSING PROTOCOLS
- Beginner/intermediate/advanced dosage ranges
- Timing recommendations (AM/PM, with food, etc.)
- Injection frequency if applicable
- Ester considerations if applicable

5. CYCLE RECOMMENDATIONS
- Typical cycle length
- Stacking considerations
- PCT requirements (if applicable)
- Support supplements recommended

6. TRAINING IMPLICATIONS
- Volume adjustments while using
- Recovery capacity changes
- Intensity modifications
- What to monitor during use

7. NUTRITION IMPLICATIONS
- Caloric adjustments
- Protein requirements
- Micronutrient considerations
- Hydration needs

8. MONITORING & BLOODWORK
- Key markers to track
- Frequency of testing
- Warning signs to watch

Format as JSON:
{
  "compoundName": "exact name",
  "classification": "testosterone/19-nor/dht/oral/peptide/serm/ai/gh",
  "mechanismOfAction": "detailed explanation",
  "halfLife": "duration",
  "benefits": ["benefit 1", "benefit 2", ...],
  "sideEffects": [
    {"effect": "name", "severity": "mild/moderate/severe", "frequency": "common/uncommon/rare", "mitigation": "how to reduce"}
  ],
  "dosingProtocols": {
    "beginner": {"dose": "Xmg", "frequency": "per week", "notes": ""},
    "intermediate": {"dose": "Xmg", "frequency": "per week", "notes": ""},
    "advanced": {"dose": "Xmg", "frequency": "per week", "notes": ""}
  },
  "cycleRecommendations": {
    "typicalLength": "X weeks",
    "minimumLength": "X weeks",
    "maximumLength": "X weeks",
    "pctRequired": true/false,
    "pctProtocol": "description if needed",
    "stacksWith": ["compound1", "compound2"],
    "avoidWith": ["compound1", "compound2"]
  },
  "trainingAdjustments": {
    "volumeMultiplier": 1.2,
    "frequencyMultiplier": 1.0,
    "recoveryBoost": "percentage",
    "notes": ["specific training recommendation 1", "recommendation 2"]
  },
  "nutritionAdjustments": {
    "proteinMultiplier": 1.1,
    "calorieAdjustment": "percentage or absolute",
    "hydrationNotes": "special hydration needs",
    "supplements": ["recommended supplement 1", "supplement 2"]
  },
  "bloodworkMarkers": ["marker 1", "marker 2"],
  "warningSignals": ["signal 1", "signal 2"],
  "overallRisk": "low/moderate/high",
  "effectiveness": "rating 1-10",
  "researchConfidence": "well-studied/moderately-studied/limited-research",
  "logicKeywords": ["<MANDATORY: 5-7 specific pharmacological/clinical keywords used in your logic (e.g., 'cyp3a4 inhibition', 'nitrogen retention', 'aromatization rate', 'shbg binding affinity', etc.)>"]
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        max_completion_tokens: 2500,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content || "{}";
      res.json(JSON.parse(content));
    } catch (error) {
      console.error("Error researching compound:", error);
      res.status(500).json({ error: "Failed to research compound" });
    }
  });

  // ============================================
  // Periodization Auto-Adjustment
  // ============================================
  app.post("/api/coach/periodization-adjust", async (req, res) => {
    try {
      const { profile: incomingProfile, profileId, userId } = req.body;
      const aiContext = await buildAiContext({
        profile: incomingProfile,
        profileId,
        userId,
      });
      const program = aiContext.program;

      if (!program?.schedule) {
        return res.status(404).json({ error: "No active program found" });
      }

      const checkIns = aiContext.checkIns || [];
      const workouts = aiContext.workouts || [];

      const avg = (values: number[]) =>
        values.length
          ? values.reduce((sum, v) => sum + v, 0) / values.length
          : 0;
      const avgSleep = avg(checkIns.map((c) => c.sleepHours || 0));
      const avgStress = avg(checkIns.map((c) => c.stressLevel || 0));
      const avgSoreness = avg(checkIns.map((c) => c.sorenessLevel || 0));

      const sleepScore = Math.min(avgSleep / 8, 1) * 50;
      const stressScore = (1 - (avgStress - 1) / 6) * 25;
      const sorenessScore = (1 - (avgSoreness - 1) / 6) * 25;
      const recoveryScore = Math.round(
        sleepScore + stressScore + sorenessScore,
      );

      const completedWorkouts = workouts.filter((w) => w.completed).length;
      const completionRate = workouts.length
        ? completedWorkouts / workouts.length
        : 0;

      const deloadSignal =
        recoveryScore < 55 || avgSoreness >= 5 || avgSleep < 6;
      let multiplier = 1;
      let adjustment = "maintain";

      if (deloadSignal) {
        multiplier = 0.85;
        adjustment = "deload";
      } else if (recoveryScore >= 75 && completionRate >= 0.6) {
        multiplier = 1.05;
        adjustment = "progress";
      }

      const adjustedSchedule = (program.schedule || []).map((day: any) => ({
        ...day,
        exercises: (day.exercises || []).map((ex: any) => ({
          ...ex,
          sets: Math.max(1, Math.round((Number(ex.sets) || 1) * multiplier)),
        })),
      }));

      const updatedNotes = [
        program.programNotes || "",
        `Weekly adjustment: ${adjustment} (x${multiplier.toFixed(2)})`,
      ]
        .filter(Boolean)
        .join("\n");

      await db
        .update(generatedPrograms)
        .set({ schedule: adjustedSchedule, programNotes: updatedNotes })
        .where(eq(generatedPrograms.id, program.id));

      res.json({
        adjustment,
        multiplier,
        recoveryScore,
        completionRate,
        deloadSignal,
        schedule: adjustedSchedule,
      });
    } catch (error) {
      console.error("Error adjusting periodization:", error);
      res.status(500).json({ error: "Failed to adjust program" });
    }
  });

}
