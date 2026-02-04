export interface OnboardingProfile {
  id?: string;
  userId?: string;
  name?: string;
  // Basic Profile
  height: number;
  heightUnit: "cm" | "in";
  weight: number;
  weightUnit: "lbs" | "kg";
  age: number;
  sex: "male" | "female";

  // Goals & Experience
  goal: "cut" | "bulk" | "recomp" | "maintain";
  experienceLevel: "beginner" | "intermediate" | "advanced" | "elite";
  targetWeight?: number;
  targetTimeframe?: number; // weeks

  // Location & Budget
  budgetTier?: "budget" | "moderate" | "premium";
  budgetAmount?: number;
  zipCode?: string;
  locationCity?: string;
  locationState?: string;
  locationCountry?: string;

  // Health & Medications
  medications: string[];
  medicationsWithDosage: {
    name: string;
    dosage: string;
    frequency: string;
  }[];
  allergies: string[];
  healthConditions: string[];
  bloodPressureMedication: boolean;
  hasDoctor: boolean;

  // Cycle Status
  isOnCycle: boolean;
  cycleInfo?: {
    compounds: CycleCompound[];
    weeksIn: number;
    totalWeeks: number;
    pctPlanned: boolean;
  };

  // Training Program
  trainingProgram: TrainingProgramConfig;

  // Progress Photos
  progressPhotos: {
    front?: string;
    side?: string;
    back?: string;
    legs?: string;
    dateTaken: string;
  };

  // Compound Research (from AI analysis of cycles)
  compoundResearch?: {
    compounds: Array<{
      name: string;
      mechanism: string;
      effects: string[];
      sideEffects: string[];
      trainingAdjustments: string[];
      nutritionAdjustments: string[];
    }>;
    overallRecommendations: string[];
  };

  // Calculated Macros
  calculatedMacros?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    methodology: string;
    trainingDayCalories?: number;
    restDayCalories?: number;
  };

  // Strength Goals
  strengthGoals?: StrengthGoals;

  // Physique Analysis Results (from AI photo analysis)
  physiqueAnalysis?: PhysiqueAnalysisResult;

  // Internal AI memory for continuity
  aiMemory?: Record<string, any>;
}

export interface StrengthGoals {
  bench: { current: number; target: number };
  squat: { current: number; target: number };
  deadlift: { current: number; target: number };
  ohp: { current: number; target: number };
  pullups: { current: number; target: number };
}

export interface MuscleRating {
  muscle: string;
  rating: number;
  status: "lagging" | "average" | "strong" | "dominant" | "not_visible";
  observations: string[];
  priority: "high" | "medium" | "low";
}

export interface PostureIssue {
  issue: string;
  severity: number;
  status: "severe" | "moderate" | "mild" | "good";
  observations: string[];
  corrections: string[];
}

export interface PhysiqueAnalysisResult {
  overallScore: number;
  goldenRatioScore: number;
  muscleRatings: MuscleRating[];
  postureIssues: PostureIssue[];
  weakPoints: string[];
  strongPoints: string[];
  symmetryScore: number;
  bodyFatEstimate: string;
  bodyFatConfidence?: "low" | "medium" | "high";
  photoCoverage?: {
    front?: boolean;
    side?: boolean;
    back?: boolean;
    legs?: boolean;
  };
  observations: string[];
}

export type AdministrationMethod =
  | "injection_im"
  | "injection_subq"
  | "oral"
  | "sublingual"
  | "topical"
  | "nasal";

export type InjectionSite =
  | "glute"
  | "quad"
  | "delt"
  | "ventro_glute"
  | "chest"
  | "tricep"
  | "bicep"
  | "abdomen"
  | "rotate";

export interface CycleCompound {
  name: string;
  dosageAmount: number;
  dosageUnit: "mg" | "ml" | "iu" | "mcg";
  frequency: string;
  administrationMethod: AdministrationMethod;
  injectionSite?: InjectionSite;
  esterType?: string;
  halfLife?: string;
  timeOfDay?: "morning" | "evening" | "pre_workout" | "split" | "any";
  notes?: string;
}

export interface CompoundInfo {
  name: string;
  category:
    | "testosterone"
    | "19-nor"
    | "dht"
    | "oral"
    | "peptide"
    | "sarm"
    | "ai"
    | "pct"
    | "other";
  defaultEster?: string;
  defaultAdministration: AdministrationMethod;
  typicalDosageRange: {
    min: number;
    max: number;
    unit: "mg" | "ml" | "iu" | "mcg";
  };
  halfLife?: string;
  notes?: string;
}

export interface TrainingProgramConfig {
  type: "template" | "custom";
  templateName?: string;
  daysPerWeek: number;
  schedule: TrainingDay[];
}

export interface TrainingDay {
  dayOfWeek: string;
  name: string;
  muscleGroups: string[];
  exercises: ProgramExercise[];
}

export interface ProgramExercise {
  id: string;
  name: string;
  muscleGroup: string;
  sets: number;
  repRange: string;
  targetRIR: number;
  tempo?: string;
  notes?: string;
}

export type OnboardingStep =
  | "welcome"
  | "basic-profile"
  | "goals"
  | "strength-goals"
  | "health"
  | "cycle-status"
  | "progress-photos"
  | "physique-analysis"
  | "macro-calculation"
  | "training-program"
  | "complete";

export const ONBOARDING_STEPS: OnboardingStep[] = [
  "welcome",
  "basic-profile",
  "goals",
  "strength-goals",
  "health",
  "cycle-status",
  "progress-photos",
  "physique-analysis",
  "macro-calculation",
  "training-program",
  "complete",
];

export const PROGRAM_TEMPLATES = [
  {
    id: "ppl",
    name: "Push Pull Legs",
    description: "Classic 6-day split hitting each muscle group twice per week",
    daysPerWeek: 6,
  },
  {
    id: "upper-lower",
    name: "Upper/Lower",
    description: "4-day split alternating between upper and lower body",
    daysPerWeek: 4,
  },
  {
    id: "bro-split",
    name: "Bro Split",
    description: "5-day split with one muscle group per day",
    daysPerWeek: 5,
  },
  {
    id: "full-body",
    name: "Full Body",
    description: "3-day full body workouts for beginners or time-limited",
    daysPerWeek: 3,
  },
  {
    id: "arnold",
    name: "Arnold Split",
    description: "Chest/Back, Shoulders/Arms, Legs - classic high volume",
    daysPerWeek: 6,
  },
  {
    id: "custom",
    name: "Custom Program",
    description: "Build your own program from scratch",
    daysPerWeek: 0,
  },
];

export const COMMON_HEALTH_CONDITIONS = [
  "High blood pressure",
  "Heart condition",
  "Diabetes",
  "Thyroid disorder",
  "Joint issues",
  "Back problems",
  "Asthma",
  "Sleep apnea",
];

export const COMPOUND_DATABASE: CompoundInfo[] = [
  // Testosterone variants
  {
    name: "Testosterone Cypionate",
    category: "testosterone",
    defaultEster: "Cypionate",
    defaultAdministration: "injection_im",
    typicalDosageRange: { min: 100, max: 500, unit: "mg" },
    halfLife: "8 days",
    notes: "Long ester, inject 1-2x/week",
  },
  {
    name: "Testosterone Enanthate",
    category: "testosterone",
    defaultEster: "Enanthate",
    defaultAdministration: "injection_im",
    typicalDosageRange: { min: 100, max: 500, unit: "mg" },
    halfLife: "7 days",
    notes: "Long ester, inject 1-2x/week",
  },
  {
    name: "Testosterone Propionate",
    category: "testosterone",
    defaultEster: "Propionate",
    defaultAdministration: "injection_im",
    typicalDosageRange: { min: 50, max: 150, unit: "mg" },
    halfLife: "2 days",
    notes: "Short ester, inject EOD or ED",
  },
  {
    name: "Testosterone Undecanoate",
    category: "testosterone",
    defaultEster: "Undecanoate",
    defaultAdministration: "injection_im",
    typicalDosageRange: { min: 750, max: 1000, unit: "mg" },
    halfLife: "21 days",
    notes: "Very long ester, inject every 10-14 days",
  },
  // 19-Nor compounds
  {
    name: "Nandrolone Decanoate (Deca)",
    category: "19-nor",
    defaultEster: "Decanoate",
    defaultAdministration: "injection_im",
    typicalDosageRange: { min: 200, max: 600, unit: "mg" },
    halfLife: "15 days",
    notes: "Long ester, joint benefits, requires test base",
  },
  {
    name: "NPP (Nandrolone Phenylpropionate)",
    category: "19-nor",
    defaultEster: "Phenylpropionate",
    defaultAdministration: "injection_im",
    typicalDosageRange: { min: 100, max: 400, unit: "mg" },
    halfLife: "2.7 days",
    notes: "Short ester nandrolone, inject EOD",
  },
  {
    name: "Trenbolone Acetate",
    category: "19-nor",
    defaultEster: "Acetate",
    defaultAdministration: "injection_im",
    typicalDosageRange: { min: 150, max: 400, unit: "mg" },
    halfLife: "1 day",
    notes: "Very potent, inject ED or EOD",
  },
  {
    name: "Trenbolone Enanthate",
    category: "19-nor",
    defaultEster: "Enanthate",
    defaultAdministration: "injection_im",
    typicalDosageRange: { min: 200, max: 400, unit: "mg" },
    halfLife: "7 days",
    notes: "Long ester tren, inject 2x/week",
  },
  // DHT derivatives
  {
    name: "Masteron Propionate",
    category: "dht",
    defaultEster: "Propionate",
    defaultAdministration: "injection_im",
    typicalDosageRange: { min: 200, max: 400, unit: "mg" },
    halfLife: "2 days",
    notes: "Anti-estrogenic, hardening effect",
  },
  {
    name: "Masteron Enanthate",
    category: "dht",
    defaultEster: "Enanthate",
    defaultAdministration: "injection_im",
    typicalDosageRange: { min: 200, max: 400, unit: "mg" },
    halfLife: "7 days",
    notes: "Long ester masteron",
  },
  {
    name: "Boldenone (EQ)",
    category: "dht",
    defaultEster: "Undecylenate",
    defaultAdministration: "injection_im",
    typicalDosageRange: { min: 300, max: 700, unit: "mg" },
    halfLife: "14 days",
    notes: "Increased RBC, appetite, vascularity",
  },
  {
    name: "Primobolan Depot",
    category: "dht",
    defaultEster: "Enanthate",
    defaultAdministration: "injection_im",
    typicalDosageRange: { min: 400, max: 800, unit: "mg" },
    halfLife: "7 days",
    notes: "Mild, quality muscle, popular for cutting",
  },
  // Orals
  {
    name: "Anavar (Oxandrolone)",
    category: "oral",
    defaultAdministration: "oral",
    typicalDosageRange: { min: 20, max: 80, unit: "mg" },
    halfLife: "9 hours",
    notes: "Mild oral, split doses AM/PM",
  },
  {
    name: "Dianabol (Methandrostenolone)",
    category: "oral",
    defaultAdministration: "oral",
    typicalDosageRange: { min: 20, max: 50, unit: "mg" },
    halfLife: "4.5 hours",
    notes: "Wet gains, split doses throughout day",
  },
  {
    name: "Winstrol (Stanozolol)",
    category: "oral",
    defaultAdministration: "oral",
    typicalDosageRange: { min: 25, max: 50, unit: "mg" },
    halfLife: "9 hours",
    notes: "Dry look, joint drying effects",
  },
  {
    name: "Anadrol (Oxymetholone)",
    category: "oral",
    defaultAdministration: "oral",
    typicalDosageRange: { min: 25, max: 100, unit: "mg" },
    halfLife: "8 hours",
    notes: "Very powerful, rapid strength/size",
  },
  {
    name: "Turinabol",
    category: "oral",
    defaultAdministration: "oral",
    typicalDosageRange: { min: 40, max: 60, unit: "mg" },
    halfLife: "16 hours",
    notes: "Dry gains, lower hepatotoxicity",
  },
  {
    name: "Superdrol",
    category: "oral",
    defaultAdministration: "oral",
    typicalDosageRange: { min: 10, max: 20, unit: "mg" },
    halfLife: "8 hours",
    notes: "Very potent, limited to 4 weeks",
  },
  // Peptides & HGH
  {
    name: "HGH (Somatropin)",
    category: "peptide",
    defaultAdministration: "injection_subq",
    typicalDosageRange: { min: 2, max: 8, unit: "iu" },
    halfLife: "2 hours",
    notes: "Pin AM on empty stomach, or split AM/pre-bed",
  },
  {
    name: "HCG",
    category: "peptide",
    defaultAdministration: "injection_subq",
    typicalDosageRange: { min: 250, max: 500, unit: "iu" },
    halfLife: "24 hours",
    notes: "Maintains testicular function on cycle",
  },
  {
    name: "BPC-157",
    category: "peptide",
    defaultAdministration: "injection_subq",
    typicalDosageRange: { min: 250, max: 500, unit: "mcg" },
    halfLife: "4 hours",
    notes: "Healing peptide, inject near injury site",
  },
  {
    name: "TB-500",
    category: "peptide",
    defaultAdministration: "injection_subq",
    typicalDosageRange: { min: 2, max: 5, unit: "mg" },
    halfLife: "2 weeks",
    notes: "Systemic healing, can inject anywhere",
  },
  // Ancillaries - AIs
  {
    name: "Anastrozole (Arimidex)",
    category: "ai",
    defaultAdministration: "oral",
    typicalDosageRange: { min: 0.25, max: 1, unit: "mg" },
    halfLife: "46 hours",
    notes: "Aromatase inhibitor, use as needed",
  },
  {
    name: "Exemestane (Aromasin)",
    category: "ai",
    defaultAdministration: "oral",
    typicalDosageRange: { min: 12.5, max: 25, unit: "mg" },
    halfLife: "24 hours",
    notes: "Suicidal AI, take with fats",
  },
  // PCT
  {
    name: "Clomid (Clomiphene)",
    category: "pct",
    defaultAdministration: "oral",
    typicalDosageRange: { min: 25, max: 50, unit: "mg" },
    halfLife: "5 days",
    notes: "SERM for PCT",
  },
  {
    name: "Nolvadex (Tamoxifen)",
    category: "pct",
    defaultAdministration: "oral",
    typicalDosageRange: { min: 10, max: 40, unit: "mg" },
    halfLife: "7 days",
    notes: "SERM for PCT and gyno prevention",
  },
  {
    name: "Enclomiphene",
    category: "pct",
    defaultAdministration: "oral",
    typicalDosageRange: { min: 12.5, max: 25, unit: "mg" },
    halfLife: "10 hours",
    notes: "Newer SERM, pure isomer",
  },
  // TRT
  {
    name: "TRT (prescribed)",
    category: "testosterone",
    defaultAdministration: "injection_im",
    typicalDosageRange: { min: 100, max: 200, unit: "mg" },
    halfLife: "7-8 days",
    notes: "Doctor prescribed testosterone replacement",
  },
];

export const COMMON_COMPOUNDS = COMPOUND_DATABASE.map((c) => c.name);

export const ADMINISTRATION_LABELS: Record<AdministrationMethod, string> = {
  injection_im: "Intramuscular (IM)",
  injection_subq: "Subcutaneous (SubQ)",
  oral: "Oral",
  sublingual: "Sublingual",
  topical: "Topical/Cream",
  nasal: "Nasal Spray",
};

export const INJECTION_SITE_LABELS: Record<InjectionSite, string> = {
  glute: "Glute",
  quad: "Quad",
  delt: "Deltoid",
  ventro_glute: "Ventro Glute",
  chest: "Chest",
  tricep: "Tricep",
  bicep: "Bicep",
  abdomen: "Abdomen",
  rotate: "Rotate Sites",
};

export const FREQUENCY_OPTIONS = [
  { value: "daily", label: "Daily (ED)" },
  { value: "eod", label: "Every Other Day (EOD)" },
  { value: "3x_week", label: "3x per Week" },
  { value: "2x_week", label: "2x per Week" },
  { value: "weekly", label: "Once Weekly" },
  { value: "e10d", label: "Every 10 Days" },
  { value: "biweekly", label: "Every 2 Weeks" },
  { value: "as_needed", label: "As Needed" },
];
