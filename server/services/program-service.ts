import { buildAiContext } from "../utils/ai-context";
import { AI_SYSTEM_CONTEXT } from "../knowledge";
import { safeJsonParse } from "../utils/safe-json";
import { openai, withOpenAiRetry } from "../utils/openai-client";
import type { 
    ProgramGenerationPayload, 
    GeneratedProgram, 
    StrengthGoals, 
    CycleInfo, 
    MedicationWithDosage,
    EquipmentConfig 
} from "../types";

function formatStrengthGoals(strengthGoals: StrengthGoals | undefined): string {
    if (!strengthGoals) return "Not provided";
    const lines: string[] = [];
    if (strengthGoals.bench) lines.push(`  - Bench Press: ${strengthGoals.bench.current} lbs (target: ${strengthGoals.bench.target} lbs)`);
    if (strengthGoals.squat) lines.push(`  - Squat: ${strengthGoals.squat.current} lbs (target: ${strengthGoals.squat.target} lbs)`);
    if (strengthGoals.deadlift) lines.push(`  - Deadlift: ${strengthGoals.deadlift.current} lbs (target: ${strengthGoals.deadlift.target} lbs)`);
    if (strengthGoals.ohp) lines.push(`  - Overhead Press: ${strengthGoals.ohp.current} lbs (target: ${strengthGoals.ohp.target} lbs)`);
    if (strengthGoals.pullups) lines.push(`  - Pull-ups: ${strengthGoals.pullups.current} reps (target: ${strengthGoals.pullups.target} reps)`);
    return lines.length > 0 ? lines.join("\n") : "Not provided";
}

function formatCycleInfo(cycleInfo: CycleInfo | undefined): string {
    if (!cycleInfo?.compounds?.length) return "Natural athlete (no PEDs)";
    const lines: string[] = [];
    lines.push(`  - Status: Enhanced (${cycleInfo.weeksIn || 0} weeks in, ${cycleInfo.totalWeeks || 0} planned total weeks)`);
    for (const c of cycleInfo.compounds) {
        lines.push(`  - ${c.name}: ${c.dosageAmount}${c.dosageUnit} ${c.frequency} (${c.administrationMethod}${c.injectionSite ? ` - ${c.injectionSite}` : ""}${c.timeOfDay ? ` - ${c.timeOfDay}` : ""})`);
    }
    return lines.join("\n");
}

function formatMedications(meds: MedicationWithDosage[] | undefined): string {
    if (!meds?.length) return "None";
    return meds.map(m => `  - ${m.name}${m.dosage ? ` (${m.dosage})` : ""}${m.frequency ? ` - ${m.frequency}` : ""}`).join("\n");
}

function formatEquipment(equipment: EquipmentConfig | undefined): string {
    if (!equipment) return "Full commercial gym (assumed)";
    const lines: string[] = [];
    lines.push(`  - Setup Type: ${equipment.preset || "Custom"}`);
    if (equipment.available?.length) {
        lines.push(`  - Available Equipment: ${equipment.available.join(", ")}`);
    }
    return lines.join("\n");
}

export async function generateProgram(payload: ProgramGenerationPayload): Promise<GeneratedProgram> {
    const { profile: incomingProfile, profileId, userId, physiqueAnalysis, daysPerWeek, splitType, compoundResearch } = payload;

    const aiContext = await buildAiContext({
        profile: incomingProfile,
        profileId,
        userId,
    });
    const profile = aiContext.profile || incomingProfile;

    const isEnhanced = profile?.cycleInfo?.compounds?.length > 0;

    // Extract weak points and strong points from physique analysis
    const weakPoints = physiqueAnalysis?.weakPoints || physiqueAnalysis?.keyWeakPoints || [];
    const strongPoints = physiqueAnalysis?.strongPoints || [];

    const prompt = `${AI_SYSTEM_CONTEXT}

Generate a FULLY PERSONALIZED weekly training program for this specific athlete. DO NOT use generic templates - every aspect must be tailored to their unique profile, goals, limitations, and available equipment.

=== ATHLETE PROFILE ===

DEMOGRAPHICS:
- Age: ${profile?.age || "Not specified"}
- Sex: ${profile?.gender || "Not specified"}
- Height: ${profile?.height || "Not specified"} ${profile?.heightUnit || "cm"}
- Current Weight: ${profile?.weight || "Not specified"} ${profile?.weightUnit || "lbs"}
- Target Weight: ${profile?.targetWeight || "Not specified"} ${profile?.weightUnit || "lbs"}

TRAINING BACKGROUND:
- Experience Level: ${profile?.experienceLevel || "Intermediate"}
- Activity Level: ${profile?.activityLevel || "Moderate"}
- Training Days Available: ${daysPerWeek || profile?.trainingDaysPerWeek || 4} days/week
- Preferred Split Style: ${splitType || profile?.trainingTemplate || "PPL"}

PRIMARY GOAL: ${profile?.goal || "Not specified"}

CURRENT STRENGTH LEVELS & TARGETS:
${formatStrengthGoals(profile?.strengthGoals)}

=== PHYSIQUE ASSESSMENT ===

WEAK POINTS (require extra volume/focus):
${weakPoints.length ? weakPoints.map((w: string) => `  - ${w}`).join("\n") : "  - No specific weak points identified"}

STRONG POINTS (maintenance volume sufficient):
${strongPoints.length ? strongPoints.map((s: string) => `  - ${s}`).join("\n") : "  - No specific strong points identified"}

ADDITIONAL PHYSIQUE ANALYSIS:
${JSON.stringify(physiqueAnalysis || {}, null, 2)}

=== EQUIPMENT & LIMITATIONS ===

AVAILABLE EQUIPMENT:
${formatEquipment(profile?.equipment)}

INJURY HISTORY & LIMITATIONS:
${profile?.injuries || "None reported"}

HEALTH CONDITIONS:
${profile?.healthConditions?.length ? profile.healthConditions.join(", ") : "None reported"}

=== ENHANCEMENT STATUS ===

${formatCycleInfo(profile?.cycleInfo)}

COMPOUND RESEARCH CONTEXT:
${JSON.stringify(compoundResearch || [], null, 2)}

=== MEDICATIONS ===

CURRENT MEDICATIONS (consider interactions & side effects):
${formatMedications(profile?.medicationsWithDosage)}

=== PROGRAM REQUIREMENTS ===

1. EXERCISE SELECTION must:
   - Only include exercises possible with the available equipment
   - Avoid movements that aggravate reported injuries
   - Prioritize weak points with additional volume (2-4 extra sets/week)
   - Include appropriate exercise variations based on experience level
   - Account for any medication side effects (e.g., joint issues, fatigue)

2. VOLUME & INTENSITY must:
   - Match the athlete's recovery capacity (consider enhanced vs natural)
   - Scale appropriately for experience level
   - Account for activity level outside the gym
   - Progress toward strength targets listed above

3. PROGRAM STRUCTURE must:
   - Fit the available training days (${daysPerWeek || profile?.trainingDaysPerWeek || 4} days)
   - Use the preferred split style when practical
   - Include appropriate rest periods for the goal (hypertrophy vs strength)

Provide a JSON response with:
{
  "programName": "Specific descriptive name reflecting this athlete's needs",
  "programNotes": "Detailed rationale explaining why this specific program was designed for this athlete, referencing their weak points, equipment, limitations, and goals",
  "weeklyVolume": { "chest": number, "back": number, "shoulders": number, "biceps": number, "triceps": number, "quads": number, "hamstrings": number, "glutes": number, "calves": number, "abs": number },
  "enhancedProtocol": boolean,
  "periodizationNote": "Specific progression strategy for this athlete's goals and experience",
  "schedule": [
    {
      "day": number,
      "name": "Day Name",
      "muscleGroups": ["primary", "secondary"],
      "exercises": [
        {
          "name": "Exercise Name",
          "sets": number,
          "repRange": "8-12",
          "targetRIR": 2,
          "tempo": "2-1-2-0",
          "formCues": ["cue 1", "cue 2"],
          "whatToFeel": "muscle sensation",
          "rationale": "Why this specific exercise was chosen for THIS athlete"
        }
      ]
    }
  ],
  "weakPointPriorities": ["List of weak points being specifically addressed"],
  "equipmentAdaptations": ["Any exercise substitutions made due to equipment limitations"],
  "injuryModifications": ["Any modifications made for reported injuries"],
  "logicKeywords": ["5-7 specific keywords describing this program"]
}`;

    const response = await withOpenAiRetry(
        () => openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }],
            max_completion_tokens: 3000,
            response_format: { type: "json_object" },
        }),
        { context: "Generate training program" }
    );

    const defaultProgram: GeneratedProgram = {
        programName: "Default Program",
        programNotes: "Program generation failed. Using defaults.",
        weeklyVolume: {},
        enhancedProtocol: false,
        periodizationNote: "",
        schedule: [],
        logicKeywords: []
    };
    return safeJsonParse<GeneratedProgram>(response.choices[0]?.message?.content, defaultProgram);
}
