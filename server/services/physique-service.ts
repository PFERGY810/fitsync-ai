import { buildAiContext } from "../utils/ai-context";
import { AI_SYSTEM_CONTEXT } from "../knowledge";
import { safeJsonParse } from "../utils/safe-json";
import { openai, withOpenAiRetry } from "../utils/openai-client";
import type { 
    PhysiqueAnalysisPayload, 
    PhysiqueAnalysisResult, 
    MuscleRating,
    CycleCompound 
} from "../types";

// Re-export type for backwards compatibility
export type { PhysiqueAnalysisPayload } from "../types";

export async function runPhysiqueAnalysis(payload: PhysiqueAnalysisPayload): Promise<PhysiqueAnalysisResult> {
    const { photos, profile: incomingProfile, userId, profileId } = payload;
    const aiContext = await buildAiContext({
        profile: incomingProfile,
        profileId,
        userId,
    });
    const profile = aiContext.profile || incomingProfile;

    const hasPhotos =
        photos && (photos.front || photos.side || photos.back || photos.legs);
    if (!hasPhotos) {
        throw new Error("No photos provided for analysis");
    }

    // Determine which muscles are visible based on photo angles
    const visibleMuscles: string[] = [];
    if (photos?.front) {
        visibleMuscles.push(
            "Chest (Pectorals)",
            "Shoulders (Front Deltoids)",
            "Arms (Biceps)",
            "Core (Abs & Obliques)",
            "Quadriceps",
        );
    }
    if (photos?.side) {
        visibleMuscles.push(
            "Shoulders (Side Deltoids)",
            "Glutes (side)",
            "Hamstrings (side)",
        );
    }
    if (photos?.back) {
        visibleMuscles.push(
            "Back (Lats, Traps)",
            "Shoulders (Rear Deltoids)",
            "Glutes (back)",
        );
    }

    const cycleContext = profile?.cycleInfo?.compounds?.length > 0
        ? `Enhanced lifter on: ${profile.cycleInfo.compounds.map((c: CycleCompound) => `${c.name} ${c.dosageAmount}${c.dosageUnit}`).join(", ")}`
        : "Natural lifter";

    const prompt = `${AI_SYSTEM_CONTEXT}

You are an expert physique analyst performing REAL VISUAL ANALYSIS of these photos. This is NOT a generic assessment.
Analyze the provided photos for:
1. Muscle development and symmetry (Score 1-10 for each major muscle group)
2. Body fat percentage estimate
3. Structural/postural issues visible
4. Weak points that need prioritization

MANDATORY VISUAL DESCRIPTION REQUIREMENTS:
- Lighting and shadow quality
- Vascularity and skin texture
- Muscle striations if visible
- Fullness vs flatness

User Context:
- Goal: ${profile?.goal || "Hypertrophy"}
- Experience: ${profile?.experienceLevel || "Intermediate"}
- ${cycleContext}

Visible Muscles to Rate: ${visibleMuscles.join(", ")}

Format your response as a JSON object:
{
  "muscles": [
    {
      "name": "muscle name",
      "rating": 1-10,
      "observations": "detailed visual observations",
      "visualKeywords": ["key visual markers seen"]
    }
  ],
  "bodyFatEstimate": {
    "value": "range like 12-14%",
    "logic": "visual markers justifying this"
  },
  "postureAssessment": {
    "issues": ["issue 1", "issue 2"],
    "notes": "visual cues for these issues"
  },
  "weakPoints": ["muscles that are underdeveloped or lagging - need extra focus/volume"],
  "strongPoints": ["muscles that are well-developed - can maintain with less volume"],
  "overallSummary": "2-3 sentences",
  "logicKeywords": ["5-7 specific keywords used in your logic"]
}`;

    type MessageContent = 
        | { type: "text"; text: string }
        | { type: "image_url"; image_url: { url: string } };

    const userContent: MessageContent[] = [{ type: "text", text: prompt }];

    // Add photos if they exist
    if (photos.front) userContent.push({ type: "image_url", image_url: { url: photos.front } });
    if (photos.side) userContent.push({ type: "image_url", image_url: { url: photos.side } });
    if (photos.back) userContent.push({ type: "image_url", image_url: { url: photos.back } });
    if (photos.legs) userContent.push({ type: "image_url", image_url: { url: photos.legs } });

    const response = await withOpenAiRetry(
        () => openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are an expert bodybuilding and physique analysis AI." },
                { role: "user", content: userContent }
            ],
            max_completion_tokens: 1500,
            response_format: { type: "json_object" },
        }),
        { context: "Physique analysis" }
    );

    const defaultAnalysis: PhysiqueAnalysisResult = {
        muscles: [],
        bodyFatEstimate: { value: "Unknown", logic: "Analysis failed" },
        postureAssessment: { issues: [], notes: "" },
        weakPoints: [],
        strongPoints: [],
        overallSummary: "Physique analysis could not be completed.",
        logicKeywords: []
    };
    const result = safeJsonParse<PhysiqueAnalysisResult>(response.choices[0]?.message?.content, defaultAnalysis);
    
    // Ensure consistent naming - migrate keyWeakPoints to weakPoints if present
    if (result.keyWeakPoints && !result.weakPoints?.length) {
        result.weakPoints = result.keyWeakPoints;
    }
    // Remove old field name for consistency
    delete result.keyWeakPoints;
    
    // Derive strongPoints from muscle ratings if not provided by AI
    if (!result.strongPoints?.length && result.muscles?.length) {
        result.strongPoints = result.muscles
            .filter((m: MuscleRating) => m.rating >= 7)
            .map((m: MuscleRating) => m.name);
    }
    
    // Derive weakPoints from muscle ratings if not provided by AI
    if (!result.weakPoints?.length && result.muscles?.length) {
        result.weakPoints = result.muscles
            .filter((m: MuscleRating) => m.rating <= 5)
            .map((m: MuscleRating) => m.name);
    }
    
    return result;
}
