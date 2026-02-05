import { db } from "../db";
import { eq, desc, and, gte } from "drizzle-orm";
import {
  profiles,
  cycleInfo,
  macroTargets,
  generatedPrograms,
  dailyCheckIns,
  workoutSessions,
} from "@shared/schema";
import { decryptPayload } from "./encryption";
import type {
  UserProfile,
  CycleInfo,
  MacroTargets,
  GeneratedProgram,
  DailyCheckIn,
  WorkoutSession,
  WorkoutAnalysis,
  CheckInTrends,
  Goals,
  AIContext,
  WorkoutExercise,
} from "../types";

// Helper to calculate workout volume and frequency
function analyzeWorkoutHistory(workouts: WorkoutSession[]): WorkoutAnalysis {
  if (!workouts.length) {
    return {
      weeklyVolume: 0,
      averageDuration: 0,
      consistency: "No data",
      recentMuscleGroups: [],
      progressTrend: "Unknown",
    };
  }

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const recentWorkouts = workouts.filter(
    (w) => new Date(w.createdAt) >= oneWeekAgo
  );

  const totalSets = workouts.reduce((sum, w) => {
    const sets = w.exercises?.reduce(
      (s: number, e: WorkoutExercise) => s + (e.completedSets?.length || 0),
      0
    );
    return sum + (sets || 0);
  }, 0);

  const avgDuration =
    workouts.reduce((sum, w) => sum + (w.duration || 0), 0) / workouts.length;

  // Analyze muscle groups hit
  const muscleGroups = new Set<string>();
  workouts.forEach((w) => {
    w.exercises?.forEach((e: WorkoutExercise) => {
      if (e.muscleGroup) muscleGroups.add(e.muscleGroup);
    });
  });

  // Determine consistency
  let consistency = "Low";
  if (recentWorkouts.length >= 5) consistency = "Excellent";
  else if (recentWorkouts.length >= 3) consistency = "Good";
  else if (recentWorkouts.length >= 1) consistency = "Moderate";

  return {
    weeklyVolume: recentWorkouts.length,
    averageDuration: Math.round(avgDuration),
    consistency,
    recentMuscleGroups: Array.from(muscleGroups).slice(0, 5),
    progressTrend: recentWorkouts.length >= 3 ? "Active" : "Declining",
  };
}

// Helper to analyze check-in trends
function analyzeCheckInTrends(checkIns: DailyCheckIn[]): CheckInTrends {
  if (!checkIns.length) {
    return {
      averageSleep: 0,
      averageStress: 0,
      averageSoreness: 0,
      weightTrend: "Unknown",
      energyLevel: "Unknown",
      recoveryQuality: "Unknown",
    };
  }

  const avgSleep =
    checkIns.reduce((sum, c) => sum + (c.sleepHours || 0), 0) / checkIns.length;
  const avgStress =
    checkIns.reduce((sum, c) => sum + (c.stressLevel || 0), 0) / checkIns.length;
  const avgSoreness =
    checkIns.reduce((sum, c) => sum + (c.sorenessLevel || 0), 0) / checkIns.length;

  // Weight trend
  const weights = checkIns.filter((c) => c.weight).map((c) => c.weight);
  let weightTrend = "Stable";
  if (weights.length >= 2) {
    const diff = weights[0] - weights[weights.length - 1];
    if (diff > 2) weightTrend = "Gaining";
    else if (diff < -2) weightTrend = "Losing";
  }

  // Recovery quality based on sleep and soreness
  let recoveryQuality = "Moderate";
  if (avgSleep >= 7 && avgSoreness <= 4) recoveryQuality = "Excellent";
  else if (avgSleep >= 6 && avgSoreness <= 5) recoveryQuality = "Good";
  else if (avgSleep < 6 || avgSoreness > 6) recoveryQuality = "Poor";

  // Energy level inference
  let energyLevel = "Moderate";
  if (avgSleep >= 7 && avgStress <= 3) energyLevel = "High";
  else if (avgSleep < 6 || avgStress > 5) energyLevel = "Low";

  return {
    averageSleep: Math.round(avgSleep * 10) / 10,
    averageStress: Math.round(avgStress * 10) / 10,
    averageSoreness: Math.round(avgSoreness * 10) / 10,
    weightTrend,
    energyLevel,
    recoveryQuality,
  };
}

// Format context for AI consumption
export function formatContextForAI(context: Partial<AIContext>): string {
  const parts: string[] = [];

  if (context.workoutAnalysis) {
    const wa = context.workoutAnalysis;
    parts.push(`WORKOUT HISTORY:
- Weekly Sessions: ${wa.weeklyVolume}
- Average Duration: ${wa.averageDuration} min
- Consistency: ${wa.consistency}
- Recent Focus: ${wa.recentMuscleGroups.join(", ") || "Various"}
- Trend: ${wa.progressTrend}`);
  }

  if (context.checkInTrends) {
    const ct = context.checkInTrends;
    parts.push(`RECOVERY STATUS:
- Sleep Average: ${ct.averageSleep}h/night
- Stress Level: ${ct.averageStress}/7
- Soreness: ${ct.averageSoreness}/7
- Recovery Quality: ${ct.recoveryQuality}
- Energy Level: ${ct.energyLevel}
- Weight Trend: ${ct.weightTrend}`);
  }

  if (context.goals) {
    parts.push(`GOALS:
- Primary: ${context.goals.primary || "Not set"}
- Target Weight: ${context.goals.targetWeight || "Not set"}
- Target Body Fat: ${context.goals.targetBodyFat || "Not set"}`);
  }

  return parts.join("\n\n");
}

export async function buildAiContext(params: {
  profile?: Partial<UserProfile>;
  profileId?: string;
  userId?: string;
}): Promise<AIContext> {
  const { profile: incomingProfile, profileId, userId } = params;
  let dbProfile: UserProfile | null = null;

  if (profileId) {
    [dbProfile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, profileId))
      .limit(1);
  } else if (userId) {
    [dbProfile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);
  } else if (incomingProfile?.id) {
    [dbProfile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, incomingProfile.id))
      .limit(1);
  }

  const decryptedProfile = dbProfile
    ? {
        ...dbProfile,
        medications: decryptPayload(dbProfile.medications),
        medicationsWithDosage: decryptPayload(dbProfile.medicationsWithDosage),
        allergies: decryptPayload(dbProfile.allergies),
        healthConditions: decryptPayload(dbProfile.healthConditions),
      }
    : null;

  const resolvedProfile = decryptedProfile
    ? { ...decryptedProfile, ...incomingProfile }
    : incomingProfile || null;
  if (resolvedProfile && resolvedProfile.gender && !resolvedProfile.sex) {
    resolvedProfile.sex = resolvedProfile.gender;
  }

  const resolvedProfileId = dbProfile?.id || incomingProfile?.id;
  let resolvedCycle: CycleInfo | null = null;
  let resolvedMacros: MacroTargets | null = null;
  let resolvedProgram: GeneratedProgram | null = null;
  let recentCheckIns: DailyCheckIn[] = [];
  let recentWorkouts: WorkoutSession[] = [];

  if (resolvedProfileId) {
    // Calculate date range once
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    // Run all queries in parallel for better performance
    const [
      cycleResult,
      macrosResult,
      programResult,
      checkInsResult,
      workoutsResult,
    ] = await Promise.all([
      // Get cycle info
      db
        .select()
        .from(cycleInfo)
        .where(eq(cycleInfo.profileId, resolvedProfileId))
        .limit(1),
      
      // Get macro targets
      db
        .select()
        .from(macroTargets)
        .where(eq(macroTargets.profileId, resolvedProfileId))
        .limit(1),
      
      // Get active program
      db
        .select()
        .from(generatedPrograms)
        .where(
          and(
            eq(generatedPrograms.profileId, resolvedProfileId),
            eq(generatedPrograms.isActive, true)
          )
        )
        .limit(1),
      
      // Get check-ins (last 14 days for better trend analysis)
      db
        .select()
        .from(dailyCheckIns)
        .where(
          and(
            eq(dailyCheckIns.profileId, resolvedProfileId),
            gte(dailyCheckIns.createdAt, twoWeeksAgo)
          )
        )
        .orderBy(desc(dailyCheckIns.createdAt))
        .limit(14),
      
      // Get workouts (last 14 days)
      db
        .select()
        .from(workoutSessions)
        .where(
          and(
            eq(workoutSessions.profileId, resolvedProfileId),
            gte(workoutSessions.createdAt, twoWeeksAgo)
          )
        )
        .orderBy(desc(workoutSessions.createdAt))
        .limit(10),
    ]);

    // Extract first results and apply decryption
    resolvedCycle = cycleResult[0] || null;
    if (resolvedCycle) {
      resolvedCycle = {
        ...resolvedCycle,
        compounds: decryptPayload(resolvedCycle.compounds),
      };
    }
    
    resolvedMacros = macrosResult[0] || null;
    resolvedProgram = programResult[0] || null;
    recentCheckIns = checkInsResult;
    recentWorkouts = workoutsResult;
  }

  const calculatedMacros = resolvedMacros
    ? {
        calories: resolvedMacros.calories,
        protein: resolvedMacros.protein,
        carbs: resolvedMacros.carbs,
        fat: resolvedMacros.fat,
      }
    : resolvedProfile?.calculatedMacros;

  const mergedProfile = resolvedProfile
    ? {
        ...resolvedProfile,
        cycleInfo: resolvedCycle || resolvedProfile?.cycleInfo,
        calculatedMacros,
        isOnCycle:
          resolvedProfile?.isOnCycle ?? !!resolvedCycle?.compounds?.length,
      }
    : null;

  // Analyze workout history
  const workoutAnalysis = analyzeWorkoutHistory(recentWorkouts);

  // Analyze check-in trends
  const checkInTrends = analyzeCheckInTrends(recentCheckIns);

  // Extract goals
  const goals = {
    primary: resolvedProfile?.goal,
    targetWeight: resolvedProfile?.targetWeight,
    targetBodyFat: resolvedProfile?.targetBodyFat,
    strengthGoals: resolvedProfile?.strengthGoals,
  };

  // Log context summary
  console.log("=== AI CONTEXT BUILT ===");
  console.log({
    hasProfile: !!mergedProfile,
    hasCycleInfo: !!resolvedCycle,
    hasMacros: !!resolvedMacros,
    hasProgram: !!resolvedProgram,
    checkInsCount: recentCheckIns.length,
    workoutsCount: recentWorkouts.length,
    recoveryQuality: checkInTrends.recoveryQuality,
    workoutConsistency: workoutAnalysis.consistency,
  });

  return {
    profile: mergedProfile,
    cycleInfo: resolvedCycle,
    macroTargets: resolvedMacros,
    program: resolvedProgram,
    checkIns: recentCheckIns,
    workouts: recentWorkouts,
    // Enhanced analysis
    workoutAnalysis,
    checkInTrends,
    goals,
    // Pre-formatted context string for direct AI use
    formattedContext: formatContextForAI({
      workoutAnalysis,
      checkInTrends,
      goals,
    }),
  };
}
