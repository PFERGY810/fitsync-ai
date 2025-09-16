export interface FormAnalysisRequest {
  exercise: string;
  videoUri?: string;
  userDescription?: string;
  metrics?: {
    backAngle?: number;
    kneeAlignment?: string;
    depth?: string;
    duration?: number;
    frameCount?: number;
    consistency?: number;
    barPath?: string;
    lockout?: string;
    armAngle?: number;
    backArch?: string;
    overallForm?: number;
  };
  userProfile?: {
    experience: 'beginner' | 'intermediate' | 'advanced';
    goals: string[];
    injuries?: string[];
  };
}

export interface FormAnalysisResponse {
  exercise: string;
  overallScore: number; // 0-100
  metrics: {
    depth: {
      score: number;
      status: 'good' | 'needs_improvement' | 'poor';
      feedback: string;
    };
    backAngle: {
      score: number;
      angle: number;
      status: 'good' | 'needs_improvement' | 'poor';
      feedback: string;
    };
    kneeTracking: {
      score: number;
      status: 'good' | 'needs_improvement' | 'poor';
      feedback: string;
    };
  };
  improvements: string[];
  tips: string[];
  nextSteps: string[];
}

export interface WorkoutPlanRequest {
  goal: 'build_muscle' | 'lose_weight' | 'strength' | 'endurance';
  experience: 'beginner' | 'intermediate' | 'advanced';
  daysPerWeek: number;
  timePerSession: number; // minutes
  equipment: string[];
  preferences?: string[];
  limitations?: string[];
}

export interface WorkoutPlanResponse {
  plan: {
    name: string;
    duration: string; // "8 weeks"
    description: string;
    schedule: WorkoutDay[];
  };
  nutrition: {
    dailyCalories: number;
    macros: {
      protein: number;
      carbs: number;
      fats: number;
    };
    tips: string[];
  };
  progressTracking: {
    metrics: string[];
    checkpoints: string[];
  };
}

export interface WorkoutDay {
  day: string;
  type: string; // "Upper Body Strength"
  duration: number;
  exercises: Exercise[];
  restDay?: boolean;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string; // "8-12" or "30 seconds"
  weight?: string;
  notes?: string;
  targetMuscles: string[];
}

export interface NutritionRequest {
  goal: 'build_muscle' | 'lose_weight' | 'maintain';
  weight: number;
  height: number;
  age: number;
  gender: 'male' | 'female';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'very_active' | 'extra_active';
  dietaryRestrictions?: string[];
  preferences?: string[];
}

export interface NutritionResponse {
  dailyCalories: number;
  macros: {
    protein: { grams: number; percentage: number };
    carbs: { grams: number; percentage: number };
    fats: { grams: number; percentage: number };
  };
  mealPlan: {
    breakfast: MealSuggestion[];
    lunch: MealSuggestion[];
    dinner: MealSuggestion[];
    snacks: MealSuggestion[];
  };
  tips: string[];
  supplements?: string[];
  budgetBreakdown?: {
    weeklyTotal: number;
    categories: {
      protein: number;
      produce: number;
      grains: number;
      dairy: number;
      other: number;
    };
    tips: string[];
  };
}

export interface MealSuggestion {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  ingredients: string[];
  prepTime?: number;
  cost?: number;
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | { type: 'text' | 'image'; text?: string; image?: string }[];
}

export interface AIResponse {
  completion: string;
}

// PhysiqueAnalysisRequest interface
export interface PhysiqueAnalysisRequest {
  poseType: string;
  imageUri: string;
  notes?: string;
}

// MuscleGroupAnalysis interface
export interface MuscleGroupAnalysis {
  development: number; // 1-10 scale
  convexity: number; // 1-10 scale
  symmetry: number; // 1-10 scale
  notes: string;
}

// PhysiqueAnalysisResponse interface - matches what the AI service returns
export interface PhysiqueAnalysisResponse {
  poseType: string;
  date: string;
  metrics: {
    muscleMass: number;
    bodyFat: number;
    symmetry: number;
    posture: number;
    overallConvexity: number;
  };
  insights: string[];
  recommendations: string[];
  muscleGroups: {
    [key: string]: MuscleGroupAnalysis;
  };
  weakPoints: string[];
  strengthPoints: string[];
}

// Type alias for compatibility
export type PhysiqueAnalysisResult = PhysiqueAnalysisResponse;

// Form Analysis Metrics
export interface JointAngle {
  joint: string;
  angle: number;
  ideal: number;
  deviation: number;
  status: 'good' | 'needs_improvement' | 'poor';
}

export interface FormAnalysisMetrics {
  jointAngles: JointAngle[];
  tempo: {
    eccentric: number; // seconds
    concentric: number; // seconds
    isometric: number; // seconds
    status: 'good' | 'needs_improvement' | 'poor';
  };
  rangeOfMotion: {
    percentage: number;
    status: 'good' | 'needs_improvement' | 'poor';
  };
  stability: {
    score: number; // 1-10
    status: 'good' | 'needs_improvement' | 'poor';
  };
}

// Enhanced Form Analysis Response
export interface EnhancedFormAnalysisResponse extends FormAnalysisResponse {
  detailedMetrics: FormAnalysisMetrics;
  muscleActivation: {
    primary: { muscle: string; activation: number }[];
    secondary: { muscle: string; activation: number }[];
  };
  formCorrections: {
    priority: number;
    issue: string;
    correction: string;
    drills: string[];
  }[];
}

// Check-in data
export interface CheckInData {
  date: string;
  photos: {
    poseType: string;
    imageUri: string;
  }[];
  metrics: {
    weight: number;
    soreness: { [muscleGroup: string]: number }; // 1-10 scale
    energy: number; // 1-10 scale
    sleep: number; // hours
    stress: number; // 1-10 scale
  };
  notes: string;
}

// Progress tracking
export interface ProgressData {
  startDate: string;
  currentDate: string;
  physique: {
    initialAnalysis: PhysiqueAnalysisResult;
    currentAnalysis: PhysiqueAnalysisResult;
    changes: {
      [muscleGroup: string]: {
        development: number;
        convexity: number;
        symmetry: number;
      };
    };
  };
  performance: {
    exercises: {
      [exerciseName: string]: {
        initialWeight: number;
        currentWeight: number;
        initialReps: number;
        currentReps: number;
        percentageImprovement: number;
      };
    };
  };
  body: {
    initialWeight: number;
    currentWeight: number;
    initialBodyFat: number;
    currentBodyFat: number;
  };
  projections: {
    timeToGoal: number; // weeks
    expectedMuscleGain: number; // kg
    expectedFatLoss: number; // kg
  };
}