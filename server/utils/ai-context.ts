import { db } from "../db";
import { eq, desc, and } from "drizzle-orm";
import {
  profiles,
  cycleInfo,
  macroTargets,
  generatedPrograms,
  dailyCheckIns,
  workoutSessions,
} from "@shared/schema";
import { decryptPayload } from "./encryption";

export async function buildAiContext(params: {
  profile?: any;
  profileId?: string;
  userId?: string;
}) {
  const { profile: incomingProfile, profileId, userId } = params;
  let dbProfile: any | null = null;

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
  let resolvedCycle: any | null = null;
  let resolvedMacros: any | null = null;
  let resolvedProgram: any | null = null;
  let recentCheckIns: any[] = [];
  let recentWorkouts: any[] = [];

  if (resolvedProfileId) {
    [resolvedCycle] = await db
      .select()
      .from(cycleInfo)
      .where(eq(cycleInfo.profileId, resolvedProfileId))
      .limit(1);
    if (resolvedCycle) {
      resolvedCycle = {
        ...resolvedCycle,
        compounds: decryptPayload(resolvedCycle.compounds),
      };
    }
    [resolvedMacros] = await db
      .select()
      .from(macroTargets)
      .where(eq(macroTargets.profileId, resolvedProfileId))
      .limit(1);
    [resolvedProgram] = await db
      .select()
      .from(generatedPrograms)
      .where(
        and(
          eq(generatedPrograms.profileId, resolvedProfileId),
          eq(generatedPrograms.isActive, true),
        ),
      )
      .limit(1);
    recentCheckIns = await db
      .select()
      .from(dailyCheckIns)
      .where(eq(dailyCheckIns.profileId, resolvedProfileId))
      .orderBy(desc(dailyCheckIns.createdAt))
      .limit(7);
    recentWorkouts = await db
      .select()
      .from(workoutSessions)
      .where(eq(workoutSessions.profileId, resolvedProfileId))
      .orderBy(desc(workoutSessions.createdAt))
      .limit(5);
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

  // Final validation log
  console.log("=== AI CONTEXT RESULT ===");
  console.log("Profile data:", {
    hasProfile: !!mergedProfile,
    hasCycleInfo: !!resolvedCycle,
    hasMacros: !!resolvedMacros,
    hasProgram: !!resolvedProgram,
    checkInsCount: recentCheckIns.length,
    workoutsCount: recentWorkouts.length,
  });
  console.log("Using defaults:", {
    profile: !mergedProfile ? "YES - NO PROFILE DATA" : "NO - USING LIVE DATA",
    cycleInfo: !resolvedCycle && !resolvedProfile?.cycleInfo ? "YES - NO CYCLE DATA" : "NO - USING LIVE DATA",
    macros: !resolvedMacros && !resolvedProfile?.calculatedMacros ? "YES - NO MACRO DATA" : "NO - USING LIVE DATA",
  });

  return {
    profile: mergedProfile,
    cycleInfo: resolvedCycle,
    macroTargets: resolvedMacros,
    program: resolvedProgram,
    checkIns: recentCheckIns,
    workouts: recentWorkouts,
  };
}
