import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  integer,
  real,
  boolean,
  timestamp,
  jsonb,
  serial,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  username: text("username"),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => conversations.id),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const profiles = pgTable("profiles", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  name: text("name"),
  age: integer("age"),
  height: real("height"),
  heightUnit: text("height_unit").default("cm"),
  weight: real("weight"),
  weightUnit: text("weight_unit").default("lbs"),
  gender: text("gender"),
  goal: text("goal"),
  experienceLevel: text("experience_level"),
  activityLevel: text("activity_level"),
  trainingDaysPerWeek: integer("training_days_per_week"),
  trainingTemplate: text("training_template"),
  trainingProgram: jsonb("training_program"),
  targetWeight: real("target_weight"),
  targetTimeframe: integer("target_timeframe"),
  medications: jsonb("medications").$type<string[]>(),
  medicationsWithDosage: jsonb("medications_with_dosage").$type<
    Array<{
      name: string;
      dosage?: string;
      frequency?: string;
    }>
  >(),
  allergies: jsonb("allergies").$type<string[]>(),
  healthConditions: jsonb("health_conditions").$type<string[]>(),
  bloodPressureMedication: boolean("blood_pressure_medication").default(false),
  hasDoctor: boolean("has_doctor").default(false),
  strengthGoals: jsonb("strength_goals").$type<{
    bench: { current: number; target: number };
    squat: { current: number; target: number };
    deadlift: { current: number; target: number };
    ohp: { current: number; target: number };
    pullups: { current: number; target: number };
  }>(),
  budgetTier: text("budget_tier"),
  budgetAmount: real("budget_amount"),
  zipCode: text("zip_code"),
  locationCity: text("location_city"),
  locationState: text("location_state"),
  locationCountry: text("location_country"),
  physiqueAnalysis: jsonb("physique_analysis"),
  compoundResearch: jsonb("compound_research"),
  aiMemory: jsonb("ai_memory"),
  onboardingCompleted: boolean("onboarding_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const cycleInfo = pgTable("cycle_info", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id").references(() => profiles.id),
  isEnhanced: boolean("is_enhanced").default(false),
  weeksIn: integer("weeks_in"),
  totalWeeks: integer("total_weeks"),
  compounds: jsonb("compounds").$type<
    Array<{
      name: string;
      dosageAmount: number;
      dosageUnit: string;
      frequency: string;
      administrationMethod: string;
      injectionSite?: string;
      timeOfDay?: string;
    }>
  >(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const macroTargets = pgTable("macro_targets", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id").references(() => profiles.id),
  calories: integer("calories"),
  protein: integer("protein"),
  carbs: integer("carbs"),
  fat: integer("fat"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const dailyCheckIns = pgTable("daily_check_ins", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id").references(() => profiles.id),
  date: text("date").notNull(),
  weight: real("weight"),
  sleepHours: real("sleep_hours"),
  stressLevel: integer("stress_level"),
  sorenessLevel: integer("soreness_level"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const progressPhotos = pgTable("progress_photos", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id").references(() => profiles.id),
  photoType: text("photo_type"),
  photoData: text("photo_data"),
  dateTaken: text("date_taken"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const analysisJobs = pgTable("analysis_jobs", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id").references(() => profiles.id),
  analysisType: text("analysis_type").notNull(),
  status: text("status").default("queued"),
  requestPayload: jsonb("request_payload"),
  result: jsonb("result"),
  error: text("error"),
  attempts: integer("attempts").default(0),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const generatedPrograms = pgTable("generated_programs", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id").references(() => profiles.id),
  programName: text("program_name"),
  programNotes: text("program_notes"),
  weeklyVolume: jsonb("weekly_volume"),
  schedule: jsonb("schedule").$type<
    Array<{
      day: number;
      name: string;
      muscleGroups: string[];
      exercises: Array<{
        name: string;
        sets: number;
        repRange: string;
        targetRIR: number;
        tempo?: string;
        formCues?: string[];
        whatToFeel?: string;
      }>;
    }>
  >(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const workoutSessions = pgTable("workout_sessions", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id").references(() => profiles.id),
  programId: varchar("program_id").references(() => generatedPrograms.id),
  dayNumber: integer("day_number"),
  date: text("date"),
  completed: boolean("completed").default(false),
  notes: text("notes"),
  exercises: jsonb("exercises").$type<
    Array<{
      name: string;
      sets: Array<{
        reps: number;
        weight: number;
        rir: number;
      }>;
    }>
  >(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const looksmaxxAnalyses = pgTable("looksmaxx_analyses", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id").references(() => profiles.id),
  analysis: jsonb("analysis"),
  photoType: text("photo_type"),
  photoData: text("photo_data"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const looksmaxxProtocols = pgTable("looksmaxx_protocols", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id").references(() => profiles.id),
  protocolType: text("protocol_type"),
  payload: jsonb("payload"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const looksmaxxTreatments = pgTable("looksmaxx_treatments", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id").references(() => profiles.id),
  treatmentType: text("treatment_type"),
  durationMinutes: integer("duration_minutes"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const foodEntries = pgTable("food_entries", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id").references(() => profiles.id),
  date: text("date").notNull(),
  name: text("name"),
  brand: text("brand"),
  barcode: text("barcode"),
  servingSize: real("serving_size"),
  servingUnit: text("serving_unit"),
  servings: real("servings").default(1),
  calories: integer("calories"),
  protein: real("protein"),
  carbs: real("carbs"),
  fat: real("fat"),
  fiber: real("fiber"),
  sugar: real("sugar"),
  sodium: real("sodium"),
  mealType: text("meal_type"),
  source: text("source"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  username: true,
  password: true,
});

export const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCheckInSchema = createInsertSchema(dailyCheckIns).omit({
  id: true,
  createdAt: true,
});

export const insertPhotoSchema = createInsertSchema(progressPhotos).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type CycleInfo = typeof cycleInfo.$inferSelect;
export type MacroTargets = typeof macroTargets.$inferSelect;
export type DailyCheckIn = typeof dailyCheckIns.$inferSelect;
export type ProgressPhoto = typeof progressPhotos.$inferSelect;
export type GeneratedProgram = typeof generatedPrograms.$inferSelect;
export type WorkoutSession = typeof workoutSessions.$inferSelect;
export type FoodEntry = typeof foodEntries.$inferSelect;
export type LooksmaxxAnalysis = typeof looksmaxxAnalyses.$inferSelect;
export type LooksmaxxProtocol = typeof looksmaxxProtocols.$inferSelect;
export type LooksmaxxTreatment = typeof looksmaxxTreatments.$inferSelect;
