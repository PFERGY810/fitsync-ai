/**
 * Template workout programs for training screen
 * Extracted from TrainScreen.tsx for better code organization
 */
import type { Exercise } from "@/types";

export type TrainingDay = {
  day: string;
  muscleGroups: string[];
  exercises: Exercise[];
};

export type TemplateProgram = TrainingDay[];

export const TEMPLATE_PROGRAMS: Record<string, TemplateProgram> = {
  ppl: [
    {
      day: "Monday",
      muscleGroups: ["Chest", "Shoulders", "Triceps"],
      exercises: [
        { id: "1", name: "Barbell Bench Press", muscleGroup: "Chest", sets: 4, reps: "6-8", targetRIR: 2, tempo: "3-1-1" },
        { id: "2", name: "Incline Dumbbell Press", muscleGroup: "Chest", sets: 3, reps: "8-10", targetRIR: 2 },
        { id: "3", name: "Cable Flyes", muscleGroup: "Chest", sets: 3, reps: "12-15", targetRIR: 1 },
        { id: "4", name: "Overhead Press", muscleGroup: "Shoulders", sets: 3, reps: "8-10", targetRIR: 2 },
        { id: "5", name: "Tricep Pushdowns", muscleGroup: "Triceps", sets: 3, reps: "10-12", targetRIR: 2 },
        { id: "6", name: "Overhead Extensions", muscleGroup: "Triceps", sets: 3, reps: "10-12", targetRIR: 2 },
      ],
    },
    {
      day: "Tuesday",
      muscleGroups: ["Back", "Biceps", "Rear Delts"],
      exercises: [
        { id: "7", name: "Barbell Rows", muscleGroup: "Back", sets: 4, reps: "6-8", targetRIR: 2, tempo: "2-1-2" },
        { id: "8", name: "Weighted Pull-Ups", muscleGroup: "Back", sets: 3, reps: "6-10", targetRIR: 2 },
        { id: "9", name: "Seated Cable Rows", muscleGroup: "Back", sets: 3, reps: "10-12", targetRIR: 2 },
        { id: "10", name: "Face Pulls", muscleGroup: "Rear Delts", sets: 3, reps: "15-20", targetRIR: 1 },
        { id: "11", name: "Barbell Curls", muscleGroup: "Biceps", sets: 3, reps: "8-10", targetRIR: 2 },
        { id: "12", name: "Hammer Curls", muscleGroup: "Biceps", sets: 2, reps: "10-12", targetRIR: 1 },
      ],
    },
    {
      day: "Wednesday",
      muscleGroups: ["Quads", "Hamstrings", "Glutes", "Calves"],
      exercises: [
        { id: "13", name: "Barbell Squats", muscleGroup: "Quads", sets: 4, reps: "6-8", targetRIR: 2, tempo: "3-1-1" },
        { id: "14", name: "Romanian Deadlifts", muscleGroup: "Hamstrings", sets: 3, reps: "8-10", targetRIR: 2 },
        { id: "15", name: "Leg Press", muscleGroup: "Quads", sets: 3, reps: "10-12", targetRIR: 2 },
        { id: "16", name: "Leg Curls", muscleGroup: "Hamstrings", sets: 3, reps: "10-12", targetRIR: 1 },
        { id: "17", name: "Hip Thrusts", muscleGroup: "Glutes", sets: 3, reps: "10-12", targetRIR: 2 },
        { id: "18", name: "Standing Calf Raises", muscleGroup: "Calves", sets: 4, reps: "12-15", targetRIR: 1 },
      ],
    },
    {
      day: "Thursday",
      muscleGroups: ["Chest", "Shoulders", "Triceps"],
      exercises: [
        { id: "19", name: "Incline Barbell Press", muscleGroup: "Chest", sets: 4, reps: "6-8", targetRIR: 2, tempo: "3-1-1" },
        { id: "20", name: "Dumbbell Bench Press", muscleGroup: "Chest", sets: 3, reps: "8-10", targetRIR: 2 },
        { id: "21", name: "Pec Deck", muscleGroup: "Chest", sets: 3, reps: "12-15", targetRIR: 1 },
        { id: "22", name: "Lateral Raises", muscleGroup: "Shoulders", sets: 4, reps: "12-15", targetRIR: 1 },
        { id: "23", name: "Close-Grip Bench", muscleGroup: "Triceps", sets: 3, reps: "8-10", targetRIR: 2 },
        { id: "24", name: "Rope Pushdowns", muscleGroup: "Triceps", sets: 3, reps: "12-15", targetRIR: 1 },
      ],
    },
    {
      day: "Friday",
      muscleGroups: ["Back", "Biceps", "Rear Delts"],
      exercises: [
        { id: "25", name: "Deadlifts", muscleGroup: "Back", sets: 4, reps: "5-6", targetRIR: 2, tempo: "2-1-1" },
        { id: "26", name: "Lat Pulldowns", muscleGroup: "Back", sets: 3, reps: "8-10", targetRIR: 2 },
        { id: "27", name: "T-Bar Rows", muscleGroup: "Back", sets: 3, reps: "8-10", targetRIR: 2 },
        { id: "28", name: "Reverse Pec Deck", muscleGroup: "Rear Delts", sets: 3, reps: "12-15", targetRIR: 1 },
        { id: "29", name: "Incline Dumbbell Curls", muscleGroup: "Biceps", sets: 3, reps: "10-12", targetRIR: 2 },
        { id: "30", name: "Preacher Curls", muscleGroup: "Biceps", sets: 2, reps: "10-12", targetRIR: 1 },
      ],
    },
    {
      day: "Saturday",
      muscleGroups: ["Quads", "Hamstrings", "Glutes", "Calves"],
      exercises: [
        { id: "31", name: "Front Squats", muscleGroup: "Quads", sets: 4, reps: "8-10", targetRIR: 2, tempo: "3-1-1" },
        { id: "32", name: "Stiff-Leg Deadlifts", muscleGroup: "Hamstrings", sets: 3, reps: "10-12", targetRIR: 2 },
        { id: "33", name: "Hack Squats", muscleGroup: "Quads", sets: 3, reps: "10-12", targetRIR: 2 },
        { id: "34", name: "Nordic Curls", muscleGroup: "Hamstrings", sets: 3, reps: "6-10", targetRIR: 2 },
        { id: "35", name: "Cable Pull-Throughs", muscleGroup: "Glutes", sets: 3, reps: "12-15", targetRIR: 1 },
        { id: "36", name: "Seated Calf Raises", muscleGroup: "Calves", sets: 4, reps: "15-20", targetRIR: 1 },
      ],
    },
    { day: "Sunday", muscleGroups: ["Rest"], exercises: [] },
  ],
  "upper-lower": [
    {
      day: "Monday",
      muscleGroups: ["Chest", "Back", "Shoulders", "Arms"],
      exercises: [
        { id: "1", name: "Barbell Bench Press", muscleGroup: "Chest", sets: 4, reps: "6-8", targetRIR: 2, tempo: "3-1-1" },
        { id: "2", name: "Barbell Rows", muscleGroup: "Back", sets: 4, reps: "6-8", targetRIR: 2, tempo: "2-1-2" },
        { id: "3", name: "Overhead Press", muscleGroup: "Shoulders", sets: 3, reps: "8-10", targetRIR: 2 },
        { id: "4", name: "Weighted Pull-Ups", muscleGroup: "Back", sets: 3, reps: "6-10", targetRIR: 2 },
        { id: "5", name: "Incline Dumbbell Press", muscleGroup: "Chest", sets: 3, reps: "8-10", targetRIR: 2 },
        { id: "6", name: "Lateral Raises", muscleGroup: "Shoulders", sets: 3, reps: "12-15", targetRIR: 1 },
        { id: "7", name: "Tricep Pushdowns", muscleGroup: "Triceps", sets: 3, reps: "10-12", targetRIR: 2 },
        { id: "8", name: "Barbell Curls", muscleGroup: "Biceps", sets: 3, reps: "8-10", targetRIR: 2 },
      ],
    },
    {
      day: "Tuesday",
      muscleGroups: ["Quads", "Hamstrings", "Glutes", "Calves"],
      exercises: [
        { id: "9", name: "Barbell Squats", muscleGroup: "Quads", sets: 4, reps: "6-8", targetRIR: 2, tempo: "3-1-1" },
        { id: "10", name: "Romanian Deadlifts", muscleGroup: "Hamstrings", sets: 4, reps: "8-10", targetRIR: 2 },
        { id: "11", name: "Leg Press", muscleGroup: "Quads", sets: 3, reps: "10-12", targetRIR: 2 },
        { id: "12", name: "Leg Curls", muscleGroup: "Hamstrings", sets: 3, reps: "10-12", targetRIR: 1 },
        { id: "13", name: "Hip Thrusts", muscleGroup: "Glutes", sets: 3, reps: "10-12", targetRIR: 2 },
        { id: "14", name: "Walking Lunges", muscleGroup: "Quads", sets: 3, reps: "10 each", targetRIR: 2 },
        { id: "15", name: "Standing Calf Raises", muscleGroup: "Calves", sets: 4, reps: "12-15", targetRIR: 1 },
      ],
    },
    { day: "Wednesday", muscleGroups: ["Rest"], exercises: [] },
    {
      day: "Thursday",
      muscleGroups: ["Chest", "Back", "Shoulders", "Arms"],
      exercises: [
        { id: "16", name: "Incline Barbell Press", muscleGroup: "Chest", sets: 4, reps: "6-8", targetRIR: 2, tempo: "3-1-1" },
        { id: "17", name: "Weighted Chin-Ups", muscleGroup: "Back", sets: 4, reps: "6-8", targetRIR: 2 },
        { id: "18", name: "Seated Dumbbell Press", muscleGroup: "Shoulders", sets: 3, reps: "8-10", targetRIR: 2 },
        { id: "19", name: "Seated Cable Rows", muscleGroup: "Back", sets: 3, reps: "10-12", targetRIR: 2 },
        { id: "20", name: "Cable Flyes", muscleGroup: "Chest", sets: 3, reps: "12-15", targetRIR: 1 },
        { id: "21", name: "Face Pulls", muscleGroup: "Rear Delts", sets: 3, reps: "15-20", targetRIR: 1 },
        { id: "22", name: "Overhead Extensions", muscleGroup: "Triceps", sets: 3, reps: "10-12", targetRIR: 2 },
        { id: "23", name: "Hammer Curls", muscleGroup: "Biceps", sets: 3, reps: "10-12", targetRIR: 2 },
      ],
    },
    {
      day: "Friday",
      muscleGroups: ["Quads", "Hamstrings", "Glutes", "Calves"],
      exercises: [
        { id: "24", name: "Front Squats", muscleGroup: "Quads", sets: 4, reps: "8-10", targetRIR: 2, tempo: "3-1-1" },
        { id: "25", name: "Stiff-Leg Deadlifts", muscleGroup: "Hamstrings", sets: 4, reps: "8-10", targetRIR: 2 },
        { id: "26", name: "Hack Squats", muscleGroup: "Quads", sets: 3, reps: "10-12", targetRIR: 2 },
        { id: "27", name: "Nordic Curls", muscleGroup: "Hamstrings", sets: 3, reps: "6-10", targetRIR: 2 },
        { id: "28", name: "Cable Pull-Throughs", muscleGroup: "Glutes", sets: 3, reps: "12-15", targetRIR: 1 },
        { id: "29", name: "Bulgarian Split Squats", muscleGroup: "Quads", sets: 3, reps: "8-10 each", targetRIR: 2 },
        { id: "30", name: "Seated Calf Raises", muscleGroup: "Calves", sets: 4, reps: "15-20", targetRIR: 1 },
      ],
    },
    { day: "Saturday", muscleGroups: ["Rest"], exercises: [] },
    { day: "Sunday", muscleGroups: ["Rest"], exercises: [] },
  ],
  "bro-split": [
    {
      day: "Monday",
      muscleGroups: ["Chest"],
      exercises: [
        { id: "1", name: "Barbell Bench Press", muscleGroup: "Chest", sets: 4, reps: "6-8", targetRIR: 2, tempo: "3-1-1" },
        { id: "2", name: "Incline Dumbbell Press", muscleGroup: "Chest", sets: 4, reps: "8-10", targetRIR: 2 },
        { id: "3", name: "Dumbbell Flyes", muscleGroup: "Chest", sets: 3, reps: "10-12", targetRIR: 1 },
        { id: "4", name: "Cable Crossovers", muscleGroup: "Chest", sets: 3, reps: "12-15", targetRIR: 1 },
        { id: "5", name: "Dips (Chest Lean)", muscleGroup: "Chest", sets: 3, reps: "8-12", targetRIR: 2 },
      ],
    },
    {
      day: "Tuesday",
      muscleGroups: ["Back"],
      exercises: [
        { id: "6", name: "Deadlifts", muscleGroup: "Back", sets: 4, reps: "5-6", targetRIR: 2, tempo: "2-1-1" },
        { id: "7", name: "Weighted Pull-Ups", muscleGroup: "Back", sets: 4, reps: "6-10", targetRIR: 2 },
        { id: "8", name: "Barbell Rows", muscleGroup: "Back", sets: 4, reps: "8-10", targetRIR: 2 },
        { id: "9", name: "Lat Pulldowns", muscleGroup: "Back", sets: 3, reps: "10-12", targetRIR: 2 },
        { id: "10", name: "Straight-Arm Pulldowns", muscleGroup: "Back", sets: 3, reps: "12-15", targetRIR: 1 },
      ],
    },
    {
      day: "Wednesday",
      muscleGroups: ["Shoulders"],
      exercises: [
        { id: "11", name: "Overhead Press", muscleGroup: "Shoulders", sets: 4, reps: "6-8", targetRIR: 2 },
        { id: "12", name: "Seated Dumbbell Press", muscleGroup: "Shoulders", sets: 3, reps: "8-10", targetRIR: 2 },
        { id: "13", name: "Lateral Raises", muscleGroup: "Shoulders", sets: 4, reps: "12-15", targetRIR: 1 },
        { id: "14", name: "Face Pulls", muscleGroup: "Rear Delts", sets: 4, reps: "15-20", targetRIR: 1 },
        { id: "15", name: "Reverse Pec Deck", muscleGroup: "Rear Delts", sets: 3, reps: "12-15", targetRIR: 1 },
      ],
    },
    {
      day: "Thursday",
      muscleGroups: ["Arms"],
      exercises: [
        { id: "16", name: "Close-Grip Bench Press", muscleGroup: "Triceps", sets: 4, reps: "6-8", targetRIR: 2 },
        { id: "17", name: "Barbell Curls", muscleGroup: "Biceps", sets: 4, reps: "8-10", targetRIR: 2 },
        { id: "18", name: "Skull Crushers", muscleGroup: "Triceps", sets: 3, reps: "10-12", targetRIR: 2 },
        { id: "19", name: "Incline Dumbbell Curls", muscleGroup: "Biceps", sets: 3, reps: "10-12", targetRIR: 2 },
        { id: "20", name: "Tricep Pushdowns", muscleGroup: "Triceps", sets: 3, reps: "12-15", targetRIR: 1 },
        { id: "21", name: "Hammer Curls", muscleGroup: "Biceps", sets: 3, reps: "10-12", targetRIR: 1 },
      ],
    },
    {
      day: "Friday",
      muscleGroups: ["Legs"],
      exercises: [
        { id: "22", name: "Barbell Squats", muscleGroup: "Quads", sets: 4, reps: "6-8", targetRIR: 2, tempo: "3-1-1" },
        { id: "23", name: "Romanian Deadlifts", muscleGroup: "Hamstrings", sets: 4, reps: "8-10", targetRIR: 2 },
        { id: "24", name: "Leg Press", muscleGroup: "Quads", sets: 3, reps: "10-12", targetRIR: 2 },
        { id: "25", name: "Leg Curls", muscleGroup: "Hamstrings", sets: 3, reps: "10-12", targetRIR: 1 },
        { id: "26", name: "Hip Thrusts", muscleGroup: "Glutes", sets: 3, reps: "10-12", targetRIR: 2 },
        { id: "27", name: "Standing Calf Raises", muscleGroup: "Calves", sets: 4, reps: "12-15", targetRIR: 1 },
      ],
    },
    { day: "Saturday", muscleGroups: ["Rest"], exercises: [] },
    { day: "Sunday", muscleGroups: ["Rest"], exercises: [] },
  ],
  "full-body": [
    {
      day: "Monday",
      muscleGroups: ["Full Body"],
      exercises: [
        { id: "1", name: "Barbell Squats", muscleGroup: "Quads", sets: 4, reps: "6-8", targetRIR: 2, tempo: "3-1-1" },
        { id: "2", name: "Barbell Bench Press", muscleGroup: "Chest", sets: 4, reps: "6-8", targetRIR: 2, tempo: "3-1-1" },
        { id: "3", name: "Barbell Rows", muscleGroup: "Back", sets: 4, reps: "6-8", targetRIR: 2 },
        { id: "4", name: "Romanian Deadlifts", muscleGroup: "Hamstrings", sets: 3, reps: "8-10", targetRIR: 2 },
        { id: "5", name: "Overhead Press", muscleGroup: "Shoulders", sets: 3, reps: "8-10", targetRIR: 2 },
        { id: "6", name: "Tricep Pushdowns", muscleGroup: "Triceps", sets: 2, reps: "10-12", targetRIR: 2 },
        { id: "7", name: "Barbell Curls", muscleGroup: "Biceps", sets: 2, reps: "10-12", targetRIR: 2 },
      ],
    },
    { day: "Tuesday", muscleGroups: ["Rest"], exercises: [] },
    {
      day: "Wednesday",
      muscleGroups: ["Full Body"],
      exercises: [
        { id: "8", name: "Deadlifts", muscleGroup: "Back", sets: 4, reps: "5-6", targetRIR: 2, tempo: "2-1-1" },
        { id: "9", name: "Incline Dumbbell Press", muscleGroup: "Chest", sets: 4, reps: "8-10", targetRIR: 2 },
        { id: "10", name: "Weighted Pull-Ups", muscleGroup: "Back", sets: 4, reps: "6-10", targetRIR: 2 },
        { id: "11", name: "Front Squats", muscleGroup: "Quads", sets: 3, reps: "8-10", targetRIR: 2 },
        { id: "12", name: "Lateral Raises", muscleGroup: "Shoulders", sets: 3, reps: "12-15", targetRIR: 1 },
        { id: "13", name: "Hammer Curls", muscleGroup: "Biceps", sets: 2, reps: "10-12", targetRIR: 2 },
        { id: "14", name: "Overhead Extensions", muscleGroup: "Triceps", sets: 2, reps: "10-12", targetRIR: 2 },
      ],
    },
    { day: "Thursday", muscleGroups: ["Rest"], exercises: [] },
    {
      day: "Friday",
      muscleGroups: ["Full Body"],
      exercises: [
        { id: "15", name: "Leg Press", muscleGroup: "Quads", sets: 4, reps: "8-10", targetRIR: 2 },
        { id: "16", name: "Dumbbell Bench Press", muscleGroup: "Chest", sets: 4, reps: "8-10", targetRIR: 2 },
        { id: "17", name: "Seated Cable Rows", muscleGroup: "Back", sets: 4, reps: "8-10", targetRIR: 2 },
        { id: "18", name: "Stiff-Leg Deadlifts", muscleGroup: "Hamstrings", sets: 3, reps: "10-12", targetRIR: 2 },
        { id: "19", name: "Seated Dumbbell Press", muscleGroup: "Shoulders", sets: 3, reps: "8-10", targetRIR: 2 },
        { id: "20", name: "EZ Bar Curls", muscleGroup: "Biceps", sets: 2, reps: "10-12", targetRIR: 2 },
        { id: "21", name: "Dips", muscleGroup: "Triceps", sets: 2, reps: "8-12", targetRIR: 2 },
      ],
    },
    { day: "Saturday", muscleGroups: ["Rest"], exercises: [] },
    { day: "Sunday", muscleGroups: ["Rest"], exercises: [] },
  ],
  arnold: [
    {
      day: "Monday",
      muscleGroups: ["Chest", "Back"],
      exercises: [
        { id: "1", name: "Barbell Bench Press", muscleGroup: "Chest", sets: 4, reps: "6-8", targetRIR: 2, tempo: "3-1-1" },
        { id: "2", name: "Weighted Pull-Ups", muscleGroup: "Back", sets: 4, reps: "6-10", targetRIR: 2 },
        { id: "3", name: "Incline Dumbbell Press", muscleGroup: "Chest", sets: 4, reps: "8-10", targetRIR: 2 },
        { id: "4", name: "Barbell Rows", muscleGroup: "Back", sets: 4, reps: "8-10", targetRIR: 2 },
        { id: "5", name: "Dumbbell Flyes", muscleGroup: "Chest", sets: 3, reps: "10-12", targetRIR: 1 },
        { id: "6", name: "Seated Cable Rows", muscleGroup: "Back", sets: 3, reps: "10-12", targetRIR: 2 },
        { id: "7", name: "Dips", muscleGroup: "Chest", sets: 3, reps: "8-12", targetRIR: 2 },
        { id: "8", name: "Straight-Arm Pulldowns", muscleGroup: "Back", sets: 3, reps: "12-15", targetRIR: 1 },
      ],
    },
    {
      day: "Tuesday",
      muscleGroups: ["Shoulders", "Arms"],
      exercises: [
        { id: "9", name: "Overhead Press", muscleGroup: "Shoulders", sets: 4, reps: "6-8", targetRIR: 2 },
        { id: "10", name: "Close-Grip Bench Press", muscleGroup: "Triceps", sets: 4, reps: "6-8", targetRIR: 2 },
        { id: "11", name: "Barbell Curls", muscleGroup: "Biceps", sets: 4, reps: "8-10", targetRIR: 2 },
        { id: "12", name: "Lateral Raises", muscleGroup: "Shoulders", sets: 4, reps: "12-15", targetRIR: 1 },
        { id: "13", name: "Skull Crushers", muscleGroup: "Triceps", sets: 3, reps: "10-12", targetRIR: 2 },
        { id: "14", name: "Hammer Curls", muscleGroup: "Biceps", sets: 3, reps: "10-12", targetRIR: 2 },
      ],
    },
    {
      day: "Wednesday",
      muscleGroups: ["Legs"],
      exercises: [
        { id: "15", name: "Barbell Squats", muscleGroup: "Quads", sets: 5, reps: "6-8", targetRIR: 2, tempo: "3-1-1" },
        { id: "16", name: "Romanian Deadlifts", muscleGroup: "Hamstrings", sets: 4, reps: "8-10", targetRIR: 2 },
        { id: "17", name: "Leg Press", muscleGroup: "Quads", sets: 3, reps: "10-12", targetRIR: 2 },
        { id: "18", name: "Leg Curls", muscleGroup: "Hamstrings", sets: 3, reps: "10-12", targetRIR: 1 },
        { id: "19", name: "Walking Lunges", muscleGroup: "Quads", sets: 3, reps: "10 each", targetRIR: 2 },
        { id: "20", name: "Standing Calf Raises", muscleGroup: "Calves", sets: 5, reps: "12-15", targetRIR: 1 },
      ],
    },
    {
      day: "Thursday",
      muscleGroups: ["Chest", "Back"],
      exercises: [
        { id: "21", name: "Incline Barbell Press", muscleGroup: "Chest", sets: 4, reps: "6-8", targetRIR: 2, tempo: "3-1-1" },
        { id: "22", name: "Weighted Chin-Ups", muscleGroup: "Back", sets: 4, reps: "6-10", targetRIR: 2 },
        { id: "23", name: "Dumbbell Bench Press", muscleGroup: "Chest", sets: 4, reps: "8-10", targetRIR: 2 },
        { id: "24", name: "T-Bar Rows", muscleGroup: "Back", sets: 4, reps: "8-10", targetRIR: 2 },
        { id: "25", name: "Cable Crossovers", muscleGroup: "Chest", sets: 3, reps: "12-15", targetRIR: 1 },
        { id: "26", name: "Lat Pulldowns", muscleGroup: "Back", sets: 3, reps: "10-12", targetRIR: 2 },
        { id: "27", name: "Pec Deck", muscleGroup: "Chest", sets: 3, reps: "12-15", targetRIR: 1 },
        { id: "28", name: "Face Pulls", muscleGroup: "Back", sets: 3, reps: "15-20", targetRIR: 1 },
      ],
    },
    {
      day: "Friday",
      muscleGroups: ["Shoulders", "Arms"],
      exercises: [
        { id: "29", name: "Seated Dumbbell Press", muscleGroup: "Shoulders", sets: 4, reps: "8-10", targetRIR: 2 },
        { id: "30", name: "Dips (Tricep Focus)", muscleGroup: "Triceps", sets: 4, reps: "8-12", targetRIR: 2 },
        { id: "31", name: "Preacher Curls", muscleGroup: "Biceps", sets: 4, reps: "8-10", targetRIR: 2 },
        { id: "32", name: "Rear Delt Flyes", muscleGroup: "Shoulders", sets: 4, reps: "12-15", targetRIR: 1 },
        { id: "33", name: "Rope Pushdowns", muscleGroup: "Triceps", sets: 3, reps: "12-15", targetRIR: 1 },
        { id: "34", name: "Concentration Curls", muscleGroup: "Biceps", sets: 3, reps: "10-12", targetRIR: 1 },
      ],
    },
    {
      day: "Saturday",
      muscleGroups: ["Legs"],
      exercises: [
        { id: "35", name: "Front Squats", muscleGroup: "Quads", sets: 4, reps: "8-10", targetRIR: 2, tempo: "3-1-1" },
        { id: "36", name: "Stiff-Leg Deadlifts", muscleGroup: "Hamstrings", sets: 4, reps: "8-10", targetRIR: 2 },
        { id: "37", name: "Hack Squats", muscleGroup: "Quads", sets: 3, reps: "10-12", targetRIR: 2 },
        { id: "38", name: "Nordic Curls", muscleGroup: "Hamstrings", sets: 3, reps: "6-10", targetRIR: 2 },
        { id: "39", name: "Hip Thrusts", muscleGroup: "Glutes", sets: 3, reps: "10-12", targetRIR: 2 },
        { id: "40", name: "Seated Calf Raises", muscleGroup: "Calves", sets: 5, reps: "15-20", targetRIR: 1 },
      ],
    },
    { day: "Sunday", muscleGroups: ["Rest"], exercises: [] },
  ],
};

export const DEFAULT_PROGRAM = TEMPLATE_PROGRAMS["upper-lower"];
