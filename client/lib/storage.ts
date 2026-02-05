import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { v4 as uuidv4 } from "uuid";
import { getApiUrl, apiRequest } from "./query-client";
import type {
  UserProfile,
  DailyCheckIn,
  MacroTargets,
  FoodEntry,
  WorkoutSession,
  SetLog,
  WeeklyProgram,
  PhysiquePhoto,
  TierRankingEntry,
} from "@/types";
import type { PhysiqueAnalysisResult } from "@/types/onboarding";

// Type definitions for data structures
export type CycleInfo = {
  isEnhanced: boolean;
  weeksIn?: number;
  totalWeeks?: number;
  compounds?: Array<{
    name: string;
    dosageAmount: number;
    dosageUnit: string;
    frequency: string;
    administrationMethod: string;
    injectionSite?: string;
    timeOfDay?: string;
  }>;
};

export type GeneratedProgram = {
  programName?: string;
  programNotes?: string;
  weeklyVolume?: Record<string, number>;
  enhancedProtocol?: boolean;
  periodizationNote?: string;
  schedule?: Array<{
    day: number;
    name: string;
    muscleGroups: string[];
    exercises: Array<{
      name: string;
      sets: number;
      repRange?: string;
      reps?: string;
      targetRIR?: number;
      rir?: number;
      tempo?: string;
      formCues?: string[];
      whatToFeel?: string;
      rationale?: string;
      muscleGroup?: string;
    }>;
  }>;
  logicKeywords?: string[];
};

type OfflinePayload = {
  profileId: string;
  checkIn?: Omit<DailyCheckIn, "id" | "createdAt">;
  entry?: Omit<FoodEntry, "id" | "createdAt">;
};

const KEYS = {
  USER_PROFILE: "fitsync_user_profile",
  DAILY_CHECKINS: "fitsync_daily_checkins",
  MACRO_TARGETS: "fitsync_macro_targets",
  FOOD_ENTRIES: "fitsync_food_entries",
  WORKOUT_SESSIONS: "fitsync_workout_sessions",
  SET_LOGS: "fitsync_set_logs",
  WEEKLY_PROGRAM: "fitsync_weekly_program",
  PHYSIQUE_PHOTOS: "fitsync_physique_photos",
  ONBOARDING_COMPLETE: "fitsync_onboarding_complete",
  COACH_NOTES: "fitsync_coach_notes",
  GENERATED_PROGRAM: "fitsync_generated_program",
  PROFILE_ID: "fitsync_profile_id",
  PHYSIQUE_ANALYSIS: "fitsync_physique_analysis",
  TIER_RANKING: "fitsync_tier_ranking",
  OFFLINE_QUEUE: "fitsync_offline_queue",
};

type OfflineWriteType = "checkin" | "food-entry";

type OfflineWrite = {
  id: string;
  type: OfflineWriteType;
  payload: OfflinePayload;
  createdAt: string;
};

async function isOnline(): Promise<boolean> {
  const state = await NetInfo.fetch();
  return Boolean(state.isConnected && state.isInternetReachable !== false);
}

async function enqueueOfflineWrite(
  type: OfflineWriteType,
  payload: OfflinePayload,
): Promise<void> {
  const queue = await getItem<OfflineWrite[]>(KEYS.OFFLINE_QUEUE, []);
  const nextQueue = [
    ...queue,
    { id: uuidv4(), type, payload, createdAt: new Date().toISOString() },
  ];
  await setItem(KEYS.OFFLINE_QUEUE, nextQueue);
}

async function syncCheckIn(
  profileId: string,
  checkIn: Omit<DailyCheckIn, "id" | "createdAt">,
) {
  await apiRequest("POST", "/api/check-in", { profileId, ...checkIn });
}

async function syncFoodEntry(
  profileId: string,
  entry: Omit<FoodEntry, "id" | "createdAt">,
) {
  await apiRequest("POST", "/api/food/entries", {
    profileId,
    date: entry.date,
    food: entry,
    mealType: entry.mealType,
    servings: entry.servings || 1,
  });
}

export async function flushOfflineQueue(): Promise<void> {
  const queue = await getItem<OfflineWrite[]>(KEYS.OFFLINE_QUEUE, []);
  if (!queue.length) return;

  const remaining: OfflineWrite[] = [];
  for (const item of queue) {
    try {
      if (item.type === "checkin") {
        await syncCheckIn(item.payload.profileId, item.payload.checkIn);
      } else if (item.type === "food-entry") {
        await syncFoodEntry(item.payload.profileId, item.payload.entry);
      }
    } catch (error) {
      console.error("Offline sync failed:", error);
      remaining.push(item);
    }
  }

  await setItem(KEYS.OFFLINE_QUEUE, remaining);
}

async function getItem<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
  } catch {
    return defaultValue;
  }
}

async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Error saving to storage:", e);
  }
}

export async function resetAllData(): Promise<boolean> {
  try {
    // Clear local storage first
    await AsyncStorage.multiRemove(Object.values(KEYS));
    await AsyncStorage.clear();

    // Reset server-side data
    const profileId = await getProfileId();
    const deletePath = profileId ? `/api/profile/${profileId}` : "/api/profile";
    await apiRequest("DELETE", deletePath);

    console.log("All data reset successfully");
    return true;
  } catch (error) {
    console.error("Error resetting data:", error);
    // Still clear local storage even if server fails
    await AsyncStorage.multiRemove(Object.values(KEYS));
    await AsyncStorage.clear();
    return true;
  }
}

export async function saveUserProfile(profile: Partial<UserProfile>): Promise<UserProfile | Partial<UserProfile>> {
  await setItem(KEYS.USER_PROFILE, profile);

  try {
    const response = await apiRequest("POST", "/api/profile", profile);
    const savedProfile = await response.json();
    if (savedProfile?.id) {
      await setItem(KEYS.PROFILE_ID, savedProfile.id);
    }
    return savedProfile;
  } catch (error) {
    console.error("Error syncing profile to server:", error);
  }

  return profile;
}

export async function getUserProfile(): Promise<UserProfile | null> {
  const localProfile = await getItem<UserProfile | null>(KEYS.USER_PROFILE, null);

  try {
    const response = await apiRequest("GET", "/api/profile");
    const serverProfile = await response.json();
    if (serverProfile) {
      if (!serverProfile.sex && serverProfile.gender) {
        serverProfile.sex = serverProfile.gender;
      }
      await setItem(KEYS.USER_PROFILE, serverProfile);
      if (serverProfile.id) {
        await setItem(KEYS.PROFILE_ID, serverProfile.id);
      }
      return serverProfile;
    }
  } catch (error) {
    console.log("Using local profile, server unavailable");
  }

  if (localProfile && !localProfile.sex && localProfile.gender) {
    localProfile.sex = localProfile.gender;
  }
  return localProfile;
}

export async function getProfileId(): Promise<string | null> {
  return getItem<string | null>(KEYS.PROFILE_ID, null);
}

export async function isOnboardingComplete(): Promise<boolean> {
  // Fast path: check local storage first without server call
  try {
    const localProfile = await getItem<UserProfile | null>(KEYS.USER_PROFILE, null);
    if (localProfile?.onboardingCompleted === true) {
      return true;
    }

    // If no local profile or not complete, try server with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    try {
      const response = await fetch(
        new URL("/api/profile", getApiUrl()).toString(),
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);

      if (response.ok) {
        const serverProfile = await response.json();
        if (serverProfile) {
          await setItem(KEYS.USER_PROFILE, serverProfile);
          return serverProfile?.onboardingCompleted === true || serverProfile?.onboardingComplete === true;
        }
      }
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      // Network error or timeout - use local data
      console.log("Using local onboarding status, server unavailable");
    }

    return false;
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    return false;
  }
}

export async function getMacroTargets(): Promise<MacroTargets | null> {
  return getItem<MacroTargets | null>(KEYS.MACRO_TARGETS, null);
}

export async function saveMacroTargets(targets: MacroTargets): Promise<void> {
  await setItem(KEYS.MACRO_TARGETS, targets);

  try {
    const profileId = await getProfileId();
    if (profileId) {
      await apiRequest("POST", "/api/macros", { profileId, ...targets });
    }
  } catch (error) {
    console.error("Error syncing macros to server:", error);
  }
}

export async function saveGeneratedProgram(program: GeneratedProgram): Promise<void> {
  await setItem(KEYS.GENERATED_PROGRAM, program);

  try {
    const profileId = await getProfileId();
    if (profileId) {
      await apiRequest("POST", "/api/program", { profileId, ...program });
    }
  } catch (error) {
    console.error("Error syncing program to server:", error);
  }
}

export async function getGeneratedProgram(): Promise<GeneratedProgram | null> {
  const localProgram = await getItem<GeneratedProgram | null>(KEYS.GENERATED_PROGRAM, null);

  try {
    const profileId = await getProfileId();
    if (profileId) {
      const response = await apiRequest("GET", `/api/program/${profileId}`);
      const serverProgram = await response.json();
      if (serverProgram) {
        await setItem(KEYS.GENERATED_PROGRAM, serverProgram);
        return serverProgram;
      }
    }
  } catch (error) {
    console.log("Using local program, server unavailable");
  }

  return localProgram;
}

export async function getTodayCheckIn(): Promise<DailyCheckIn | null> {
  const checkIns = await getItem<DailyCheckIn[]>(KEYS.DAILY_CHECKINS, []);
  const today = new Date().toISOString().split("T")[0];
  return checkIns.find((c) => c.date === today) || null;
}

export async function saveDailyCheckIn(
  checkIn: Omit<DailyCheckIn, "id" | "createdAt">,
): Promise<DailyCheckIn> {
  const checkIns = await getItem<DailyCheckIn[]>(KEYS.DAILY_CHECKINS, []);
  const existing = checkIns.find((c) => c.date === checkIn.date);
  const newCheckIn: DailyCheckIn = {
    ...checkIn,
    id: existing?.id || uuidv4(),
    createdAt: existing?.createdAt || new Date().toISOString(),
  };
  const updated = existing
    ? checkIns.map((c) => (c.id === existing.id ? newCheckIn : c))
    : [...checkIns, newCheckIn];
  await setItem(KEYS.DAILY_CHECKINS, updated);

  try {
    const profileId = await getProfileId();
    if (profileId) {
      const online = await isOnline();
      if (online) {
        await syncCheckIn(profileId, checkIn);
      } else {
        await enqueueOfflineWrite("checkin", { profileId, checkIn });
      }
    }
  } catch (error) {
    console.error("Error syncing check-in to server:", error);
    const profileId = await getProfileId();
    if (profileId) {
      await enqueueOfflineWrite("checkin", { profileId, checkIn });
    }
  }

  return newCheckIn;
}

export async function saveProgressPhoto(
  photoType: string,
  photoData: string,
): Promise<void> {
  try {
    const profileId = await getProfileId();
    if (profileId) {
      await apiRequest("POST", "/api/photos", {
        profileId,
        photoType,
        photoData,
        dateTaken: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Error saving photo to server:", error);
  }
}

export async function saveCycleInfo(cycleData: CycleInfo): Promise<void> {
  try {
    const profileId = await getProfileId();
    if (profileId) {
      await apiRequest("POST", "/api/cycle-info", { profileId, ...cycleData });
    }
  } catch (error) {
    console.error("Error saving cycle info to server:", error);
  }
}

export async function savePhysiqueAnalysis(analysis: PhysiqueAnalysisResult): Promise<void> {
  await setItem(KEYS.PHYSIQUE_ANALYSIS, analysis);

  try {
    const existingProfile = await getUserProfile();
    if (existingProfile) {
      await saveUserProfile({
        ...existingProfile,
        physiqueAnalysis: analysis,
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Error syncing physique analysis to server:", error);
  }
}

export async function getTierRanking(): Promise<TierRankingEntry[]> {
  const localRanking = await getItem<TierRankingEntry[]>(KEYS.TIER_RANKING, []);

  try {
    const response = await apiRequest("GET", "/api/coach/tier-ranking");
    const serverRanking = await response.json();
    if (serverRanking && Array.isArray(serverRanking)) {
      await setItem(KEYS.TIER_RANKING, serverRanking);
      return serverRanking;
    }
  } catch (error) {
    console.log("Using local tier ranking, server unavailable");
  }

  return localRanking;
}

export async function saveTierRanking(
  ranking: TierRankingEntry[],
): Promise<void> {
  await setItem(KEYS.TIER_RANKING, ranking);
}

export async function getPhysiqueAnalysis(): Promise<PhysiqueAnalysisResult | null> {
  return getItem<PhysiqueAnalysisResult | null>(KEYS.PHYSIQUE_ANALYSIS, null);
}

export const storage = {
  async getUserProfile(): Promise<UserProfile | null> {
    return getUserProfile();
  },

  async saveUserProfile(
    profile: Omit<UserProfile, "id" | "createdAt" | "updatedAt">,
  ): Promise<UserProfile> {
    const now = new Date().toISOString();
    const existing = await this.getUserProfile();
    const userProfile: UserProfile = {
      ...(existing || {}),
      ...profile,
      id: existing?.id || uuidv4(),
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };
    await saveUserProfile(userProfile);
    return userProfile;
  },

  async getDailyCheckIns(): Promise<DailyCheckIn[]> {
    return getItem<DailyCheckIn[]>(KEYS.DAILY_CHECKINS, []);
  },

  async saveDailyCheckIn(
    checkIn: Omit<DailyCheckIn, "id" | "createdAt">,
  ): Promise<DailyCheckIn> {
    return saveDailyCheckIn(checkIn);
  },

  async getTodayCheckIn(): Promise<DailyCheckIn | null> {
    return getTodayCheckIn();
  },

  async getMacroTargets(): Promise<MacroTargets | null> {
    return getMacroTargets();
  },

  async saveMacroTargets(targets: MacroTargets): Promise<void> {
    await saveMacroTargets(targets);
  },

  async getFoodEntries(date?: string): Promise<FoodEntry[]> {
    const entries = await getItem<FoodEntry[]>(KEYS.FOOD_ENTRIES, []);
    if (date) {
      return entries.filter((e) => e.date === date);
    }
    return entries;
  },

  async saveFoodEntry(
    entry: Omit<FoodEntry, "id" | "createdAt">,
  ): Promise<FoodEntry> {
    const entries = await this.getFoodEntries();
    const newEntry: FoodEntry = {
      ...entry,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    await setItem(KEYS.FOOD_ENTRIES, [...entries, newEntry]);
    try {
      const profileId = await getProfileId();
      if (profileId) {
        const online = await isOnline();
        if (online) {
          await syncFoodEntry(profileId, entry);
        } else {
          await enqueueOfflineWrite("food-entry", { profileId, entry });
        }
      }
    } catch (error) {
      console.error("Error syncing food entry to server:", error);
      const profileId = await getProfileId();
      if (profileId) {
        await enqueueOfflineWrite("food-entry", { profileId, entry });
      }
    }
    return newEntry;
  },

  async deleteFoodEntry(id: string): Promise<void> {
    const entries = await this.getFoodEntries();
    await setItem(
      KEYS.FOOD_ENTRIES,
      entries.filter((e) => e.id !== id),
    );
  },

  async getWeeklyProgram(): Promise<WeeklyProgram | null> {
    return getItem<WeeklyProgram | null>(KEYS.WEEKLY_PROGRAM, null);
  },

  async saveWeeklyProgram(program: WeeklyProgram): Promise<void> {
    await setItem(KEYS.WEEKLY_PROGRAM, program);
  },

  async getWorkoutSessions(): Promise<WorkoutSession[]> {
    return getItem<WorkoutSession[]>(KEYS.WORKOUT_SESSIONS, []);
  },

  async saveWorkoutSession(
    session: Omit<WorkoutSession, "id">,
  ): Promise<WorkoutSession> {
    const sessions = await this.getWorkoutSessions();
    const newSession: WorkoutSession = {
      ...session,
      id: uuidv4(),
    };
    await setItem(KEYS.WORKOUT_SESSIONS, [...sessions, newSession]);
    return newSession;
  },

  async updateWorkoutSession(session: WorkoutSession): Promise<void> {
    const sessions = await this.getWorkoutSessions();
    await setItem(
      KEYS.WORKOUT_SESSIONS,
      sessions.map((s) => (s.id === session.id ? session : s)),
    );
  },

  async getSetLogs(sessionId?: string): Promise<SetLog[]> {
    const logs = await getItem<SetLog[]>(KEYS.SET_LOGS, []);
    return sessionId
      ? logs.filter((l) => l.exerciseId.startsWith(sessionId))
      : logs;
  },

  async saveSetLog(log: Omit<SetLog, "id">): Promise<SetLog> {
    const logs = await getItem<SetLog[]>(KEYS.SET_LOGS, []);
    const newLog: SetLog = { ...log, id: uuidv4() };
    await setItem(KEYS.SET_LOGS, [...logs, newLog]);
    return newLog;
  },

  async getPhysiquePhotos(): Promise<PhysiquePhoto[]> {
    return getItem<PhysiquePhoto[]>(KEYS.PHYSIQUE_PHOTOS, []);
  },

  async savePhysiquePhoto(
    photo: Omit<PhysiquePhoto, "id" | "createdAt">,
  ): Promise<PhysiquePhoto> {
    const photos = await this.getPhysiquePhotos();
    const newPhoto: PhysiquePhoto = {
      ...photo,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    await setItem(KEYS.PHYSIQUE_PHOTOS, [...photos, newPhoto]);

    if (photo.uri) {
      await saveProgressPhoto(photo.type || "front", photo.uri);
    }

    return newPhoto;
  },

  async isOnboardingComplete(): Promise<boolean> {
    return isOnboardingComplete();
  },

  async setOnboardingComplete(complete: boolean): Promise<void> {
    await setItem(KEYS.ONBOARDING_COMPLETE, complete);
  },

  async getCoachNotes(): Promise<string[]> {
    return getItem<string[]>(KEYS.COACH_NOTES, []);
  },

  async saveCoachNotes(notes: string[]): Promise<void> {
    await setItem(KEYS.COACH_NOTES, notes);
  },

  async clearAllData(): Promise<void> {
    await resetAllData();
  },
};
