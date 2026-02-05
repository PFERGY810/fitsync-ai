export interface UserProfile {
  id: string;
  name?: string;
  height: number;
  heightUnit?: "cm" | "in";
  weight: number;
  weightUnit?: "lbs" | "kg";
  age: number;
  sex?: "male" | "female";
  gender?: string;
  goal: "cut" | "bulk" | "recomp" | "maintain";
  experienceLevel: "beginner" | "intermediate" | "advanced" | "elite";
  targetWeight?: number;
  targetTimeframe?: number;
  trainingProgram?: {
    templateName?: string;
    schedule?: Array<{
      day: number;
      name: string;
      muscleGroups: string[];
      exercises: Array<{
        name: string;
        sets: number;
        repRange?: string;
        targetRIR?: number;
      }>;
    }>;
  };
  trainingTemplate?: string;
  trainingDaysPerWeek?: number;
  medications?: string[];
  medicationsWithDosage?: Array<{
    name: string;
    dosage?: string;
    frequency?: string;
  }>;
  allergies?: string[];
  healthConditions?: string[];
  bloodPressureMedication?: boolean;
  hasDoctor?: boolean;
  strengthGoals?: {
    bench: { current: number; target: number };
    squat: { current: number; target: number };
    deadlift: { current: number; target: number };
    ohp: { current: number; target: number };
    pullups: { current: number; target: number };
  };
  budgetTier?: "budget" | "moderate" | "premium";
  budgetAmount?: number;
  zipCode?: string;
  locationCity?: string;
  locationState?: string;
  locationCountry?: string;
  calculatedMacros?: MacroTargets;
  cycleInfo?: {
    isEnhanced: boolean;
    weeksIn?: number;
    totalWeeks?: number;
    compounds?: Array<{
      name: string;
      dosageAmount: number;
      dosageUnit: string;
      frequency: string;
      administrationMethod: string;
    }>;
  };
  physiqueAnalysis?: {
    overallScore?: number;
    bodyFatEstimate?: string;
    muscleRatings?: Array<{ muscle: string; rating: number }>;
    weakPoints?: string[];
    strongPoints?: string[];
    postureFlags?: string[];
    logicKeywords?: string[];
  };
  compoundResearch?: Record<string, unknown>;
  onboardingCompleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DailyCheckIn {
  id: string;
  date: string;
  sleepHours: number;
  stressLevel: number;
  sorenessLevel: number;
  weight: number;
  notes?: string;
  recoveryScore?: number;
  readyScore?: number;
  restingHeartRate?: number;
  createdAt: string;
}

export interface MacroTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface FoodEntry {
  id: string;
  date: string;
  name: string;
  brand?: string;
  barcode?: string;
  servingSize?: number;
  servingUnit?: string;
  servings?: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  mealType?: string;
  source?: string;
  createdAt: string;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  sets: number;
  reps: string;
  targetRIR: number;
  tempo?: string;
}

export interface WorkoutSession {
  id: string;
  date: string;
  dayName: string;
  exercises: Exercise[];
  completed: boolean;
  notes?: string;
}

export interface SetLog {
  id: string;
  exerciseId: string;
  setNumber: number;
  weight: number;
  reps: number;
  rir: number;
  completed: boolean;
}

export interface WeeklyProgram {
  id: string;
  weekNumber: number;
  days: {
    day: string;
    muscleGroups: string[];
    exercises: Exercise[];
  }[];
}

export interface PhysiquePhoto {
  id: string;
  date: string;
  type: "front" | "side" | "back";
  uri: string;
  createdAt: string;
}

export interface ProgressData {
  weeklyWeight: { date: string; weight: number }[];
  muscleScores: { muscle: string; score: number; change: number }[];
  recoveryScore: number;
  coachNotes: string[];
}

export interface CompoundInfo {
  id: string;
  name: string;
  category: string;
  description: string;
  commonDosages: string;
  cycleLength: string;
  benefits: string[];
  risks: string[];
  notes: string;
}

export interface TierRankingEntry {
  rank: number;
  name: string;
  score: number;
  tier: "Gold" | "Silver" | "Bronze";
  avatar?: string;
  isCurrentUser?: boolean;
}

export interface PhysiqueAnalysis {
  bodyFat: number;
  proportions: number;
  muscleGroups: {
    chest: "strength" | "weakness" | "neutral";
    back: "strength" | "weakness" | "neutral";
    arms: "strength" | "weakness" | "neutral";
    legs: "strength" | "weakness" | "neutral";
    abs: "strength" | "weakness" | "neutral";
    shoulders: "strength" | "weakness" | "neutral";
  };
  lastScanDate: string;
}
