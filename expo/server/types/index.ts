/**
 * Server-side TypeScript types
 * Centralizes all type definitions used across server code
 */

// ============ Profile Types ============

export interface StrengthGoals {
  bench: { current: number; target: number };
  squat: { current: number; target: number };
  deadlift: { current: number; target: number };
  ohp: { current: number; target: number };
  pullups: { current: number; target: number };
}

export interface MedicationWithDosage {
  name: string;
  dosage?: string;
  frequency?: string;
}

export interface EquipmentConfig {
  preset: string;
  available: string[];
  gymName?: string;
  gymCity?: string;
  gymState?: string;
}

export interface CycleCompound {
  name: string;
  dosageAmount: number;
  dosageUnit: string;
  frequency: string;
  administrationMethod: string;
  injectionSite?: string;
  timeOfDay?: string;
}

export interface CycleInfo {
  id?: string;
  profileId?: string;
  isEnhanced?: boolean;
  weeksIn?: number;
  totalWeeks?: number;
  compounds?: CycleCompound[];
}

export interface UserProfile {
  id?: string;
  userId?: string;
  name?: string;
  age?: number;
  height?: number;
  heightUnit?: string;
  weight?: number;
  weightUnit?: string;
  gender?: string;
  sex?: string;
  goal?: string;
  experienceLevel?: string;
  activityLevel?: string;
  trainingDaysPerWeek?: number;
  trainingTemplate?: string;
  targetWeight?: number;
  targetTimeframe?: number;
  targetBodyFat?: number;
  medications?: string[];
  medicationsWithDosage?: MedicationWithDosage[];
  allergies?: string[];
  healthConditions?: string[];
  injuries?: string;
  equipment?: EquipmentConfig;
  strengthGoals?: StrengthGoals;
  cycleInfo?: CycleInfo;
  calculatedMacros?: MacroTargets;
  isOnCycle?: boolean;
  physiqueAnalysis?: PhysiqueAnalysisResult;
  compoundResearch?: CompoundResearch[];
}

// ============ Macro Types ============

export interface MacroTargets {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

// ============ Physique Analysis Types ============

export interface MuscleRating {
  name: string;
  rating: number;
  observations?: string;
  visualKeywords?: string[];
}

export interface BodyFatEstimate {
  value: string;
  logic: string;
}

export interface PostureAssessment {
  issues: string[];
  notes?: string;
}

export interface PhysiqueAnalysisResult {
  muscles: MuscleRating[];
  bodyFatEstimate: BodyFatEstimate;
  postureAssessment?: PostureAssessment;
  weakPoints: string[];
  strongPoints: string[];
  keyWeakPoints?: string[]; // Legacy field, migrated to weakPoints
  overallSummary?: string;
  logicKeywords?: string[];
}

// ============ Program Types ============

export interface ExerciseSet {
  weight?: number;
  reps?: number;
  rir?: number;
  completed?: boolean;
}

export interface ProgramExercise {
  name: string;
  sets: number;
  repRange: string;
  targetRIR?: number;
  tempo?: string;
  formCues?: string[];
  whatToFeel?: string;
  rationale?: string;
  muscleGroup?: string;
  completedSets?: ExerciseSet[];
}

export interface ProgramDay {
  day: number;
  name: string;
  muscleGroups: string[];
  exercises: ProgramExercise[];
}

export interface WeeklyVolume {
  chest?: number;
  back?: number;
  shoulders?: number;
  biceps?: number;
  triceps?: number;
  quads?: number;
  hamstrings?: number;
  glutes?: number;
  calves?: number;
  abs?: number;
}

export interface GeneratedProgram {
  programName: string;
  programNotes?: string;
  weeklyVolume?: WeeklyVolume;
  enhancedProtocol?: boolean;
  periodizationNote?: string;
  schedule: ProgramDay[];
  weakPointPriorities?: string[];
  equipmentAdaptations?: string[];
  injuryModifications?: string[];
  logicKeywords?: string[];
}

// ============ Workout Types ============

export interface WorkoutExercise {
  name: string;
  muscleGroup?: string;
  sets?: number;
  completedSets?: ExerciseSet[];
}

export interface WorkoutSession {
  id?: string;
  profileId?: string;
  exercises?: WorkoutExercise[];
  duration?: number;
  createdAt?: Date;
}

// ============ Check-in Types ============

export interface DailyCheckIn {
  id?: string;
  profileId?: string;
  date?: string;
  weight?: number;
  sleepHours?: number;
  stressLevel?: number;
  sorenessLevel?: number;
  notes?: string;
  createdAt?: Date;
}

// ============ Analysis Types ============

export interface WorkoutAnalysis {
  weeklyVolume: number;
  averageDuration: number;
  consistency: string;
  recentMuscleGroups: string[];
  progressTrend: string;
}

export interface CheckInTrends {
  averageSleep: number;
  averageStress: number;
  averageSoreness: number;
  weightTrend: string;
  energyLevel: string;
  recoveryQuality: string;
}

export interface Goals {
  primary?: string;
  targetWeight?: number;
  targetBodyFat?: number;
  strengthGoals?: StrengthGoals;
}

// ============ AI Context Types ============

export interface AIContext {
  profile: UserProfile | null;
  cycleInfo: CycleInfo | null;
  macroTargets: MacroTargets | null;
  program: GeneratedProgram | null;
  checkIns: DailyCheckIn[];
  workouts: WorkoutSession[];
  workoutAnalysis: WorkoutAnalysis;
  checkInTrends: CheckInTrends;
  goals: Goals;
  formattedContext: string;
}

// ============ API Payload Types ============

export interface ProgramGenerationPayload {
  profile?: UserProfile;
  profileId?: string;
  userId?: string;
  physiqueAnalysis?: PhysiqueAnalysisResult;
  daysPerWeek?: number;
  splitType?: string;
  compoundResearch?: CompoundResearch[];
}

export interface PhysiqueAnalysisPayload {
  photos: {
    front?: string;
    side?: string;
    back?: string;
    legs?: string;
  };
  profile?: UserProfile;
  userId?: string;
  profileId?: string;
}

// ============ Compound Research Types ============

export interface CompoundResearch {
  name: string;
  category?: string;
  description?: string;
  benefits?: string[];
  risks?: string[];
  dosageRange?: string;
  halfLife?: string;
}

// ============ Food/Nutrition Types ============

export interface FoodNutrient {
  nutrientId?: number;
  nutrientName?: string;
  value?: number;
  unitName?: string;
}

export interface UsdaFood {
  fdcId: number;
  description: string;
  brandOwner?: string;
  foodNutrients?: FoodNutrient[];
  servingSize?: number;
  servingSizeUnit?: string;
}

export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize?: number;
  servingUnit?: string;
  source?: string;
}

// ============ Encryption Types ============

export type EncryptableData = 
  | string[] 
  | MedicationWithDosage[] 
  | CycleCompound[] 
  | Record<string, unknown>
  | null 
  | undefined;

// ============ Medication Impact Types ============

export interface MedicationImpactEffect {
  effect: string;
  severity?: string;
  notes?: string;
}

export interface MedicationImpact {
  medication: string;
  effects: MedicationImpactEffect[];
}

export interface MedicationImpacts {
  overallVolumeMultiplier: number;
  overallFrequencyMultiplier: number;
  dietImpacts: MedicationImpact[];
  trainingImpacts: MedicationImpact[];
  criticalNotes: string[];
}

// ============ Search Types ============

export interface SearchSnippet {
  title: string;
  snippet: string;
  link?: string;
}

// ============ Compound Database Types ============

export interface EsterInfo {
  halfLife: string;
  frequency: string;
  tradeName?: string;
  route?: string;
}

export interface CompoundData {
  tradeName?: string;
  chemicalName?: string;
  description?: string;
  notes?: string;
  typicalDose?: string | Record<string, string>;
  esters?: Record<string, EsterInfo>;
  compounds?: Record<string, EsterInfo>;
  forms?: Record<string, EsterInfo>;
  effects?: string[];
  sideEffects?: string[];
  halfLife?: string;
  duration?: string;
  mechanism?: string;
  dose?: string;
}

export interface TransformedCompound {
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
