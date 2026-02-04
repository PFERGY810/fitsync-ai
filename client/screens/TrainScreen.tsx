import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, FlatList, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { format, addDays, startOfWeek } from "date-fns";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { getUserProfile, getGeneratedProgram } from "@/lib/storage";
import type { Exercise } from "@/types";

const TEMPLATE_PROGRAMS: Record<
  string,
  Array<{
    day: string;
    muscleGroups: string[];
    exercises: Exercise[];
  }>
> = {
  ppl: [
    {
      day: "Monday",
      muscleGroups: ["Chest", "Shoulders", "Triceps"],
      exercises: [
        {
          id: "1",
          name: "Barbell Bench Press",
          muscleGroup: "Chest",
          sets: 4,
          reps: "6-8",
          targetRIR: 2,
          tempo: "3-1-1",
        },
        {
          id: "2",
          name: "Incline Dumbbell Press",
          muscleGroup: "Chest",
          sets: 3,
          reps: "8-10",
          targetRIR: 2,
        },
        {
          id: "3",
          name: "Cable Flyes",
          muscleGroup: "Chest",
          sets: 3,
          reps: "12-15",
          targetRIR: 1,
        },
        {
          id: "4",
          name: "Overhead Press",
          muscleGroup: "Shoulders",
          sets: 3,
          reps: "8-10",
          targetRIR: 2,
        },
        {
          id: "5",
          name: "Tricep Pushdowns",
          muscleGroup: "Triceps",
          sets: 3,
          reps: "10-12",
          targetRIR: 2,
        },
        {
          id: "6",
          name: "Overhead Extensions",
          muscleGroup: "Triceps",
          sets: 3,
          reps: "10-12",
          targetRIR: 2,
        },
      ],
    },
    {
      day: "Tuesday",
      muscleGroups: ["Back", "Biceps", "Rear Delts"],
      exercises: [
        {
          id: "7",
          name: "Barbell Rows",
          muscleGroup: "Back",
          sets: 4,
          reps: "6-8",
          targetRIR: 2,
          tempo: "2-1-2",
        },
        {
          id: "8",
          name: "Weighted Pull-Ups",
          muscleGroup: "Back",
          sets: 3,
          reps: "6-10",
          targetRIR: 2,
        },
        {
          id: "9",
          name: "Seated Cable Rows",
          muscleGroup: "Back",
          sets: 3,
          reps: "10-12",
          targetRIR: 2,
        },
        {
          id: "10",
          name: "Face Pulls",
          muscleGroup: "Rear Delts",
          sets: 3,
          reps: "15-20",
          targetRIR: 1,
        },
        {
          id: "11",
          name: "Barbell Curls",
          muscleGroup: "Biceps",
          sets: 3,
          reps: "8-10",
          targetRIR: 2,
        },
        {
          id: "12",
          name: "Hammer Curls",
          muscleGroup: "Biceps",
          sets: 2,
          reps: "10-12",
          targetRIR: 1,
        },
      ],
    },
    {
      day: "Wednesday",
      muscleGroups: ["Quads", "Hamstrings", "Glutes", "Calves"],
      exercises: [
        {
          id: "13",
          name: "Barbell Squats",
          muscleGroup: "Quads",
          sets: 4,
          reps: "6-8",
          targetRIR: 2,
          tempo: "3-1-1",
        },
        {
          id: "14",
          name: "Romanian Deadlifts",
          muscleGroup: "Hamstrings",
          sets: 3,
          reps: "8-10",
          targetRIR: 2,
        },
        {
          id: "15",
          name: "Leg Press",
          muscleGroup: "Quads",
          sets: 3,
          reps: "10-12",
          targetRIR: 2,
        },
        {
          id: "16",
          name: "Leg Curls",
          muscleGroup: "Hamstrings",
          sets: 3,
          reps: "10-12",
          targetRIR: 1,
        },
        {
          id: "17",
          name: "Hip Thrusts",
          muscleGroup: "Glutes",
          sets: 3,
          reps: "10-12",
          targetRIR: 2,
        },
        {
          id: "18",
          name: "Standing Calf Raises",
          muscleGroup: "Calves",
          sets: 4,
          reps: "12-15",
          targetRIR: 1,
        },
      ],
    },
    {
      day: "Thursday",
      muscleGroups: ["Chest", "Shoulders", "Triceps"],
      exercises: [
        {
          id: "19",
          name: "Incline Barbell Press",
          muscleGroup: "Chest",
          sets: 4,
          reps: "6-8",
          targetRIR: 2,
          tempo: "3-1-1",
        },
        {
          id: "20",
          name: "Dumbbell Bench Press",
          muscleGroup: "Chest",
          sets: 3,
          reps: "8-10",
          targetRIR: 2,
        },
        {
          id: "21",
          name: "Pec Deck",
          muscleGroup: "Chest",
          sets: 3,
          reps: "12-15",
          targetRIR: 1,
        },
        {
          id: "22",
          name: "Lateral Raises",
          muscleGroup: "Shoulders",
          sets: 4,
          reps: "12-15",
          targetRIR: 1,
        },
        {
          id: "23",
          name: "Close-Grip Bench",
          muscleGroup: "Triceps",
          sets: 3,
          reps: "8-10",
          targetRIR: 2,
        },
        {
          id: "24",
          name: "Rope Pushdowns",
          muscleGroup: "Triceps",
          sets: 3,
          reps: "12-15",
          targetRIR: 1,
        },
      ],
    },
    {
      day: "Friday",
      muscleGroups: ["Back", "Biceps", "Rear Delts"],
      exercises: [
        {
          id: "25",
          name: "Deadlifts",
          muscleGroup: "Back",
          sets: 4,
          reps: "5-6",
          targetRIR: 2,
          tempo: "2-1-1",
        },
        {
          id: "26",
          name: "Lat Pulldowns",
          muscleGroup: "Back",
          sets: 3,
          reps: "8-10",
          targetRIR: 2,
        },
        {
          id: "27",
          name: "T-Bar Rows",
          muscleGroup: "Back",
          sets: 3,
          reps: "8-10",
          targetRIR: 2,
        },
        {
          id: "28",
          name: "Reverse Pec Deck",
          muscleGroup: "Rear Delts",
          sets: 3,
          reps: "12-15",
          targetRIR: 1,
        },
        {
          id: "29",
          name: "Incline Dumbbell Curls",
          muscleGroup: "Biceps",
          sets: 3,
          reps: "10-12",
          targetRIR: 2,
        },
        {
          id: "30",
          name: "Preacher Curls",
          muscleGroup: "Biceps",
          sets: 2,
          reps: "10-12",
          targetRIR: 1,
        },
      ],
    },
    {
      day: "Saturday",
      muscleGroups: ["Quads", "Hamstrings", "Glutes", "Calves"],
      exercises: [
        {
          id: "31",
          name: "Front Squats",
          muscleGroup: "Quads",
          sets: 4,
          reps: "8-10",
          targetRIR: 2,
          tempo: "3-1-1",
        },
        {
          id: "32",
          name: "Stiff-Leg Deadlifts",
          muscleGroup: "Hamstrings",
          sets: 3,
          reps: "10-12",
          targetRIR: 2,
        },
        {
          id: "33",
          name: "Hack Squats",
          muscleGroup: "Quads",
          sets: 3,
          reps: "10-12",
          targetRIR: 2,
        },
        {
          id: "34",
          name: "Nordic Curls",
          muscleGroup: "Hamstrings",
          sets: 3,
          reps: "6-10",
          targetRIR: 2,
        },
        {
          id: "35",
          name: "Cable Pull-Throughs",
          muscleGroup: "Glutes",
          sets: 3,
          reps: "12-15",
          targetRIR: 1,
        },
        {
          id: "36",
          name: "Seated Calf Raises",
          muscleGroup: "Calves",
          sets: 4,
          reps: "15-20",
          targetRIR: 1,
        },
      ],
    },
    {
      day: "Sunday",
      muscleGroups: ["Rest"],
      exercises: [],
    },
  ],
  "upper-lower": [
    {
      day: "Monday",
      muscleGroups: ["Chest", "Back", "Shoulders", "Arms"],
      exercises: [
        {
          id: "1",
          name: "Barbell Bench Press",
          muscleGroup: "Chest",
          sets: 4,
          reps: "6-8",
          targetRIR: 2,
          tempo: "3-1-1",
        },
        {
          id: "2",
          name: "Barbell Rows",
          muscleGroup: "Back",
          sets: 4,
          reps: "6-8",
          targetRIR: 2,
          tempo: "2-1-2",
        },
        {
          id: "3",
          name: "Overhead Press",
          muscleGroup: "Shoulders",
          sets: 3,
          reps: "8-10",
          targetRIR: 2,
        },
        {
          id: "4",
          name: "Weighted Pull-Ups",
          muscleGroup: "Back",
          sets: 3,
          reps: "6-10",
          targetRIR: 2,
        },
        {
          id: "5",
          name: "Incline Dumbbell Press",
          muscleGroup: "Chest",
          sets: 3,
          reps: "8-10",
          targetRIR: 2,
        },
        {
          id: "6",
          name: "Lateral Raises",
          muscleGroup: "Shoulders",
          sets: 3,
          reps: "12-15",
          targetRIR: 1,
        },
        {
          id: "7",
          name: "Tricep Pushdowns",
          muscleGroup: "Triceps",
          sets: 3,
          reps: "10-12",
          targetRIR: 2,
        },
        {
          id: "8",
          name: "Barbell Curls",
          muscleGroup: "Biceps",
          sets: 3,
          reps: "8-10",
          targetRIR: 2,
        },
      ],
    },
    {
      day: "Tuesday",
      muscleGroups: ["Quads", "Hamstrings", "Glutes", "Calves"],
      exercises: [
        {
          id: "9",
          name: "Barbell Squats",
          muscleGroup: "Quads",
          sets: 4,
          reps: "6-8",
          targetRIR: 2,
          tempo: "3-1-1",
        },
        {
          id: "10",
          name: "Romanian Deadlifts",
          muscleGroup: "Hamstrings",
          sets: 4,
          reps: "8-10",
          targetRIR: 2,
        },
        {
          id: "11",
          name: "Leg Press",
          muscleGroup: "Quads",
          sets: 3,
          reps: "10-12",
          targetRIR: 2,
        },
        {
          id: "12",
          name: "Leg Curls",
          muscleGroup: "Hamstrings",
          sets: 3,
          reps: "10-12",
          targetRIR: 1,
        },
        {
          id: "13",
          name: "Hip Thrusts",
          muscleGroup: "Glutes",
          sets: 3,
          reps: "10-12",
          targetRIR: 2,
        },
        {
          id: "14",
          name: "Walking Lunges",
          muscleGroup: "Quads",
          sets: 3,
          reps: "10 each",
          targetRIR: 2,
        },
        {
          id: "15",
          name: "Standing Calf Raises",
          muscleGroup: "Calves",
          sets: 4,
          reps: "12-15",
          targetRIR: 1,
        },
      ],
    },
    {
      day: "Wednesday",
      muscleGroups: ["Rest"],
      exercises: [],
    },
    {
      day: "Thursday",
      muscleGroups: ["Chest", "Back", "Shoulders", "Arms"],
      exercises: [
        {
          id: "16",
          name: "Incline Barbell Press",
          muscleGroup: "Chest",
          sets: 4,
          reps: "6-8",
          targetRIR: 2,
          tempo: "3-1-1",
        },
        {
          id: "17",
          name: "Weighted Chin-Ups",
          muscleGroup: "Back",
          sets: 4,
          reps: "6-8",
          targetRIR: 2,
        },
        {
          id: "18",
          name: "Seated Dumbbell Press",
          muscleGroup: "Shoulders",
          sets: 3,
          reps: "8-10",
          targetRIR: 2,
        },
        {
          id: "19",
          name: "Seated Cable Rows",
          muscleGroup: "Back",
          sets: 3,
          reps: "10-12",
          targetRIR: 2,
        },
        {
          id: "20",
          name: "Cable Flyes",
          muscleGroup: "Chest",
          sets: 3,
          reps: "12-15",
          targetRIR: 1,
        },
        {
          id: "21",
          name: "Face Pulls",
          muscleGroup: "Rear Delts",
          sets: 3,
          reps: "15-20",
          targetRIR: 1,
        },
        {
          id: "22",
          name: "Overhead Extensions",
          muscleGroup: "Triceps",
          sets: 3,
          reps: "10-12",
          targetRIR: 2,
        },
        {
          id: "23",
          name: "Hammer Curls",
          muscleGroup: "Biceps",
          sets: 3,
          reps: "10-12",
          targetRIR: 2,
        },
      ],
    },
    {
      day: "Friday",
      muscleGroups: ["Quads", "Hamstrings", "Glutes", "Calves"],
      exercises: [
        {
          id: "24",
          name: "Front Squats",
          muscleGroup: "Quads",
          sets: 4,
          reps: "8-10",
          targetRIR: 2,
          tempo: "3-1-1",
        },
        {
          id: "25",
          name: "Stiff-Leg Deadlifts",
          muscleGroup: "Hamstrings",
          sets: 4,
          reps: "8-10",
          targetRIR: 2,
        },
        {
          id: "26",
          name: "Hack Squats",
          muscleGroup: "Quads",
          sets: 3,
          reps: "10-12",
          targetRIR: 2,
        },
        {
          id: "27",
          name: "Nordic Curls",
          muscleGroup: "Hamstrings",
          sets: 3,
          reps: "6-10",
          targetRIR: 2,
        },
        {
          id: "28",
          name: "Cable Pull-Throughs",
          muscleGroup: "Glutes",
          sets: 3,
          reps: "12-15",
          targetRIR: 1,
        },
        {
          id: "29",
          name: "Bulgarian Split Squats",
          muscleGroup: "Quads",
          sets: 3,
          reps: "8-10 each",
          targetRIR: 2,
        },
        {
          id: "30",
          name: "Seated Calf Raises",
          muscleGroup: "Calves",
          sets: 4,
          reps: "15-20",
          targetRIR: 1,
        },
      ],
    },
    {
      day: "Saturday",
      muscleGroups: ["Rest"],
      exercises: [],
    },
    {
      day: "Sunday",
      muscleGroups: ["Rest"],
      exercises: [],
    },
  ],
  "bro-split": [
    {
      day: "Monday",
      muscleGroups: ["Chest"],
      exercises: [
        {
          id: "1",
          name: "Barbell Bench Press",
          muscleGroup: "Chest",
          sets: 4,
          reps: "6-8",
          targetRIR: 2,
          tempo: "3-1-1",
        },
        {
          id: "2",
          name: "Incline Dumbbell Press",
          muscleGroup: "Chest",
          sets: 4,
          reps: "8-10",
          targetRIR: 2,
        },
        {
          id: "3",
          name: "Dumbbell Flyes",
          muscleGroup: "Chest",
          sets: 3,
          reps: "10-12",
          targetRIR: 1,
        },
        {
          id: "4",
          name: "Cable Crossovers",
          muscleGroup: "Chest",
          sets: 3,
          reps: "12-15",
          targetRIR: 1,
        },
        {
          id: "5",
          name: "Dips (Chest Lean)",
          muscleGroup: "Chest",
          sets: 3,
          reps: "8-12",
          targetRIR: 2,
        },
      ],
    },
    {
      day: "Tuesday",
      muscleGroups: ["Back"],
      exercises: [
        {
          id: "6",
          name: "Deadlifts",
          muscleGroup: "Back",
          sets: 4,
          reps: "5-6",
          targetRIR: 2,
          tempo: "2-1-1",
        },
        {
          id: "7",
          name: "Weighted Pull-Ups",
          muscleGroup: "Back",
          sets: 4,
          reps: "6-10",
          targetRIR: 2,
        },
        {
          id: "8",
          name: "Barbell Rows",
          muscleGroup: "Back",
          sets: 4,
          reps: "8-10",
          targetRIR: 2,
        },
        {
          id: "9",
          name: "Lat Pulldowns",
          muscleGroup: "Back",
          sets: 3,
          reps: "10-12",
          targetRIR: 2,
        },
        {
          id: "10",
          name: "Straight-Arm Pulldowns",
          muscleGroup: "Back",
          sets: 3,
          reps: "12-15",
          targetRIR: 1,
        },
      ],
    },
    {
      day: "Wednesday",
      muscleGroups: ["Shoulders"],
      exercises: [
        {
          id: "11",
          name: "Overhead Press",
          muscleGroup: "Shoulders",
          sets: 4,
          reps: "6-8",
          targetRIR: 2,
        },
        {
          id: "12",
          name: "Seated Dumbbell Press",
          muscleGroup: "Shoulders",
          sets: 3,
          reps: "8-10",
          targetRIR: 2,
        },
        {
          id: "13",
          name: "Lateral Raises",
          muscleGroup: "Shoulders",
          sets: 4,
          reps: "12-15",
          targetRIR: 1,
        },
        {
          id: "14",
          name: "Face Pulls",
          muscleGroup: "Rear Delts",
          sets: 4,
          reps: "15-20",
          targetRIR: 1,
        },
        {
          id: "15",
          name: "Reverse Pec Deck",
          muscleGroup: "Rear Delts",
          sets: 3,
          reps: "12-15",
          targetRIR: 1,
        },
      ],
    },
    {
      day: "Thursday",
      muscleGroups: ["Arms"],
      exercises: [
        {
          id: "16",
          name: "Close-Grip Bench Press",
          muscleGroup: "Triceps",
          sets: 4,
          reps: "6-8",
          targetRIR: 2,
        },
        {
          id: "17",
          name: "Barbell Curls",
          muscleGroup: "Biceps",
          sets: 4,
          reps: "8-10",
          targetRIR: 2,
        },
        {
          id: "18",
          name: "Skull Crushers",
          muscleGroup: "Triceps",
          sets: 3,
          reps: "10-12",
          targetRIR: 2,
        },
        {
          id: "19",
          name: "Incline Dumbbell Curls",
          muscleGroup: "Biceps",
          sets: 3,
          reps: "10-12",
          targetRIR: 2,
        },
        {
          id: "20",
          name: "Tricep Pushdowns",
          muscleGroup: "Triceps",
          sets: 3,
          reps: "12-15",
          targetRIR: 1,
        },
        {
          id: "21",
          name: "Hammer Curls",
          muscleGroup: "Biceps",
          sets: 3,
          reps: "10-12",
          targetRIR: 1,
        },
      ],
    },
    {
      day: "Friday",
      muscleGroups: ["Legs"],
      exercises: [
        {
          id: "22",
          name: "Barbell Squats",
          muscleGroup: "Quads",
          sets: 4,
          reps: "6-8",
          targetRIR: 2,
          tempo: "3-1-1",
        },
        {
          id: "23",
          name: "Romanian Deadlifts",
          muscleGroup: "Hamstrings",
          sets: 4,
          reps: "8-10",
          targetRIR: 2,
        },
        {
          id: "24",
          name: "Leg Press",
          muscleGroup: "Quads",
          sets: 3,
          reps: "10-12",
          targetRIR: 2,
        },
        {
          id: "25",
          name: "Leg Curls",
          muscleGroup: "Hamstrings",
          sets: 3,
          reps: "10-12",
          targetRIR: 1,
        },
        {
          id: "26",
          name: "Hip Thrusts",
          muscleGroup: "Glutes",
          sets: 3,
          reps: "10-12",
          targetRIR: 2,
        },
        {
          id: "27",
          name: "Standing Calf Raises",
          muscleGroup: "Calves",
          sets: 4,
          reps: "12-15",
          targetRIR: 1,
        },
      ],
    },
    {
      day: "Saturday",
      muscleGroups: ["Rest"],
      exercises: [],
    },
    {
      day: "Sunday",
      muscleGroups: ["Rest"],
      exercises: [],
    },
  ],
  "full-body": [
    {
      day: "Monday",
      muscleGroups: ["Full Body"],
      exercises: [
        {
          id: "1",
          name: "Barbell Squats",
          muscleGroup: "Quads",
          sets: 4,
          reps: "6-8",
          targetRIR: 2,
          tempo: "3-1-1",
        },
        {
          id: "2",
          name: "Barbell Bench Press",
          muscleGroup: "Chest",
          sets: 4,
          reps: "6-8",
          targetRIR: 2,
          tempo: "3-1-1",
        },
        {
          id: "3",
          name: "Barbell Rows",
          muscleGroup: "Back",
          sets: 4,
          reps: "6-8",
          targetRIR: 2,
        },
        {
          id: "4",
          name: "Romanian Deadlifts",
          muscleGroup: "Hamstrings",
          sets: 3,
          reps: "8-10",
          targetRIR: 2,
        },
        {
          id: "5",
          name: "Overhead Press",
          muscleGroup: "Shoulders",
          sets: 3,
          reps: "8-10",
          targetRIR: 2,
        },
        {
          id: "6",
          name: "Tricep Pushdowns",
          muscleGroup: "Triceps",
          sets: 2,
          reps: "10-12",
          targetRIR: 2,
        },
        {
          id: "7",
          name: "Barbell Curls",
          muscleGroup: "Biceps",
          sets: 2,
          reps: "10-12",
          targetRIR: 2,
        },
      ],
    },
    {
      day: "Tuesday",
      muscleGroups: ["Rest"],
      exercises: [],
    },
    {
      day: "Wednesday",
      muscleGroups: ["Full Body"],
      exercises: [
        {
          id: "8",
          name: "Deadlifts",
          muscleGroup: "Back",
          sets: 4,
          reps: "5-6",
          targetRIR: 2,
          tempo: "2-1-1",
        },
        {
          id: "9",
          name: "Incline Dumbbell Press",
          muscleGroup: "Chest",
          sets: 4,
          reps: "8-10",
          targetRIR: 2,
        },
        {
          id: "10",
          name: "Weighted Pull-Ups",
          muscleGroup: "Back",
          sets: 4,
          reps: "6-10",
          targetRIR: 2,
        },
        {
          id: "11",
          name: "Front Squats",
          muscleGroup: "Quads",
          sets: 3,
          reps: "8-10",
          targetRIR: 2,
        },
        {
          id: "12",
          name: "Lateral Raises",
          muscleGroup: "Shoulders",
          sets: 3,
          reps: "12-15",
          targetRIR: 1,
        },
        {
          id: "13",
          name: "Hammer Curls",
          muscleGroup: "Biceps",
          sets: 2,
          reps: "10-12",
          targetRIR: 2,
        },
        {
          id: "14",
          name: "Overhead Extensions",
          muscleGroup: "Triceps",
          sets: 2,
          reps: "10-12",
          targetRIR: 2,
        },
      ],
    },
    {
      day: "Thursday",
      muscleGroups: ["Rest"],
      exercises: [],
    },
    {
      day: "Friday",
      muscleGroups: ["Full Body"],
      exercises: [
        {
          id: "15",
          name: "Leg Press",
          muscleGroup: "Quads",
          sets: 4,
          reps: "8-10",
          targetRIR: 2,
        },
        {
          id: "16",
          name: "Dumbbell Bench Press",
          muscleGroup: "Chest",
          sets: 4,
          reps: "8-10",
          targetRIR: 2,
        },
        {
          id: "17",
          name: "Seated Cable Rows",
          muscleGroup: "Back",
          sets: 4,
          reps: "8-10",
          targetRIR: 2,
        },
        {
          id: "18",
          name: "Stiff-Leg Deadlifts",
          muscleGroup: "Hamstrings",
          sets: 3,
          reps: "10-12",
          targetRIR: 2,
        },
        {
          id: "19",
          name: "Seated Dumbbell Press",
          muscleGroup: "Shoulders",
          sets: 3,
          reps: "8-10",
          targetRIR: 2,
        },
        {
          id: "20",
          name: "EZ Bar Curls",
          muscleGroup: "Biceps",
          sets: 2,
          reps: "10-12",
          targetRIR: 2,
        },
        {
          id: "21",
          name: "Dips",
          muscleGroup: "Triceps",
          sets: 2,
          reps: "8-12",
          targetRIR: 2,
        },
      ],
    },
    {
      day: "Saturday",
      muscleGroups: ["Rest"],
      exercises: [],
    },
    {
      day: "Sunday",
      muscleGroups: ["Rest"],
      exercises: [],
    },
  ],
  arnold: [
    {
      day: "Monday",
      muscleGroups: ["Chest", "Back"],
      exercises: [
        {
          id: "1",
          name: "Barbell Bench Press",
          muscleGroup: "Chest",
          sets: 4,
          reps: "6-8",
          targetRIR: 2,
          tempo: "3-1-1",
        },
        {
          id: "2",
          name: "Weighted Pull-Ups",
          muscleGroup: "Back",
          sets: 4,
          reps: "6-10",
          targetRIR: 2,
        },
        {
          id: "3",
          name: "Incline Dumbbell Press",
          muscleGroup: "Chest",
          sets: 4,
          reps: "8-10",
          targetRIR: 2,
        },
        {
          id: "4",
          name: "Barbell Rows",
          muscleGroup: "Back",
          sets: 4,
          reps: "8-10",
          targetRIR: 2,
        },
        {
          id: "5",
          name: "Dumbbell Flyes",
          muscleGroup: "Chest",
          sets: 3,
          reps: "10-12",
          targetRIR: 1,
        },
        {
          id: "6",
          name: "Seated Cable Rows",
          muscleGroup: "Back",
          sets: 3,
          reps: "10-12",
          targetRIR: 2,
        },
        {
          id: "7",
          name: "Dips",
          muscleGroup: "Chest",
          sets: 3,
          reps: "8-12",
          targetRIR: 2,
        },
        {
          id: "8",
          name: "Straight-Arm Pulldowns",
          muscleGroup: "Back",
          sets: 3,
          reps: "12-15",
          targetRIR: 1,
        },
      ],
    },
    {
      day: "Tuesday",
      muscleGroups: ["Shoulders", "Arms"],
      exercises: [
        {
          id: "9",
          name: "Overhead Press",
          muscleGroup: "Shoulders",
          sets: 4,
          reps: "6-8",
          targetRIR: 2,
        },
        {
          id: "10",
          name: "Close-Grip Bench Press",
          muscleGroup: "Triceps",
          sets: 4,
          reps: "6-8",
          targetRIR: 2,
        },
        {
          id: "11",
          name: "Barbell Curls",
          muscleGroup: "Biceps",
          sets: 4,
          reps: "8-10",
          targetRIR: 2,
        },
        {
          id: "12",
          name: "Lateral Raises",
          muscleGroup: "Shoulders",
          sets: 4,
          reps: "12-15",
          targetRIR: 1,
        },
        {
          id: "13",
          name: "Skull Crushers",
          muscleGroup: "Triceps",
          sets: 3,
          reps: "10-12",
          targetRIR: 2,
        },
        {
          id: "14",
          name: "Hammer Curls",
          muscleGroup: "Biceps",
          sets: 3,
          reps: "10-12",
          targetRIR: 2,
        },
      ],
    },
    {
      day: "Wednesday",
      muscleGroups: ["Legs"],
      exercises: [
        {
          id: "15",
          name: "Barbell Squats",
          muscleGroup: "Quads",
          sets: 5,
          reps: "6-8",
          targetRIR: 2,
          tempo: "3-1-1",
        },
        {
          id: "16",
          name: "Romanian Deadlifts",
          muscleGroup: "Hamstrings",
          sets: 4,
          reps: "8-10",
          targetRIR: 2,
        },
        {
          id: "17",
          name: "Leg Press",
          muscleGroup: "Quads",
          sets: 3,
          reps: "10-12",
          targetRIR: 2,
        },
        {
          id: "18",
          name: "Leg Curls",
          muscleGroup: "Hamstrings",
          sets: 3,
          reps: "10-12",
          targetRIR: 1,
        },
        {
          id: "19",
          name: "Walking Lunges",
          muscleGroup: "Quads",
          sets: 3,
          reps: "10 each",
          targetRIR: 2,
        },
        {
          id: "20",
          name: "Standing Calf Raises",
          muscleGroup: "Calves",
          sets: 5,
          reps: "12-15",
          targetRIR: 1,
        },
      ],
    },
    {
      day: "Thursday",
      muscleGroups: ["Chest", "Back"],
      exercises: [
        {
          id: "21",
          name: "Incline Barbell Press",
          muscleGroup: "Chest",
          sets: 4,
          reps: "6-8",
          targetRIR: 2,
          tempo: "3-1-1",
        },
        {
          id: "22",
          name: "Weighted Chin-Ups",
          muscleGroup: "Back",
          sets: 4,
          reps: "6-10",
          targetRIR: 2,
        },
        {
          id: "23",
          name: "Dumbbell Bench Press",
          muscleGroup: "Chest",
          sets: 4,
          reps: "8-10",
          targetRIR: 2,
        },
        {
          id: "24",
          name: "T-Bar Rows",
          muscleGroup: "Back",
          sets: 4,
          reps: "8-10",
          targetRIR: 2,
        },
        {
          id: "25",
          name: "Cable Crossovers",
          muscleGroup: "Chest",
          sets: 3,
          reps: "12-15",
          targetRIR: 1,
        },
        {
          id: "26",
          name: "Lat Pulldowns",
          muscleGroup: "Back",
          sets: 3,
          reps: "10-12",
          targetRIR: 2,
        },
        {
          id: "27",
          name: "Pec Deck",
          muscleGroup: "Chest",
          sets: 3,
          reps: "12-15",
          targetRIR: 1,
        },
        {
          id: "28",
          name: "Face Pulls",
          muscleGroup: "Back",
          sets: 3,
          reps: "15-20",
          targetRIR: 1,
        },
      ],
    },
    {
      day: "Friday",
      muscleGroups: ["Shoulders", "Arms"],
      exercises: [
        {
          id: "29",
          name: "Seated Dumbbell Press",
          muscleGroup: "Shoulders",
          sets: 4,
          reps: "8-10",
          targetRIR: 2,
        },
        {
          id: "30",
          name: "Dips (Tricep Focus)",
          muscleGroup: "Triceps",
          sets: 4,
          reps: "8-12",
          targetRIR: 2,
        },
        {
          id: "31",
          name: "Preacher Curls",
          muscleGroup: "Biceps",
          sets: 4,
          reps: "8-10",
          targetRIR: 2,
        },
        {
          id: "32",
          name: "Rear Delt Flyes",
          muscleGroup: "Shoulders",
          sets: 4,
          reps: "12-15",
          targetRIR: 1,
        },
        {
          id: "33",
          name: "Rope Pushdowns",
          muscleGroup: "Triceps",
          sets: 3,
          reps: "12-15",
          targetRIR: 1,
        },
        {
          id: "34",
          name: "Concentration Curls",
          muscleGroup: "Biceps",
          sets: 3,
          reps: "10-12",
          targetRIR: 1,
        },
      ],
    },
    {
      day: "Saturday",
      muscleGroups: ["Legs"],
      exercises: [
        {
          id: "35",
          name: "Front Squats",
          muscleGroup: "Quads",
          sets: 4,
          reps: "8-10",
          targetRIR: 2,
          tempo: "3-1-1",
        },
        {
          id: "36",
          name: "Stiff-Leg Deadlifts",
          muscleGroup: "Hamstrings",
          sets: 4,
          reps: "8-10",
          targetRIR: 2,
        },
        {
          id: "37",
          name: "Hack Squats",
          muscleGroup: "Quads",
          sets: 3,
          reps: "10-12",
          targetRIR: 2,
        },
        {
          id: "38",
          name: "Nordic Curls",
          muscleGroup: "Hamstrings",
          sets: 3,
          reps: "6-10",
          targetRIR: 2,
        },
        {
          id: "39",
          name: "Hip Thrusts",
          muscleGroup: "Glutes",
          sets: 3,
          reps: "10-12",
          targetRIR: 2,
        },
        {
          id: "40",
          name: "Seated Calf Raises",
          muscleGroup: "Calves",
          sets: 5,
          reps: "15-20",
          targetRIR: 1,
        },
      ],
    },
    {
      day: "Sunday",
      muscleGroups: ["Rest"],
      exercises: [],
    },
  ],
};

const DEFAULT_PROGRAM = TEMPLATE_PROGRAMS["upper-lower"];

export default function TrainScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<any>();

  const [selectedDay, setSelectedDay] = useState(0);
  const [weeklyProgram, setWeeklyProgram] = useState(DEFAULT_PROGRAM);
  const [isAIGenerated, setIsAIGenerated] = useState(false);
  const [programName, setProgramName] = useState<string | null>(null);
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });

  const loadProgram = useCallback(async () => {
    const [profile, generatedProgram] = await Promise.all([
      getUserProfile(),
      getGeneratedProgram(),
    ]);

    if (generatedProgram?.schedule) {
      const converted = generatedProgram.schedule.map((day: any) => ({
        day: day.name || `Day ${day.day}`,
        muscleGroups: day.muscleGroups || ["Training"],
        exercises: (day.exercises || []).map((ex: any, idx: number) => ({
          id: `${day.day}-${idx}`,
          name: ex.name,
          muscleGroup: ex.muscleGroup || day.muscleGroups?.[0] || "General",
          sets: ex.sets || 3,
          reps: ex.repRange || ex.reps || "8-12",
          targetRIR: ex.targetRIR || ex.rir || 2,
          tempo: ex.tempo,
        })),
      }));
      while (converted.length < 7) {
        converted.push({
          day:
            [
              "Sunday",
              "Saturday",
              "Friday",
              "Thursday",
              "Wednesday",
              "Tuesday",
              "Monday",
            ][7 - converted.length] || "Rest Day",
          muscleGroups: ["Rest"],
          exercises: [],
        });
      }
      setWeeklyProgram(converted);
      setIsAIGenerated(true);
      setProgramName(generatedProgram.programName || "AI-Generated Program");
      return;
    }

    setIsAIGenerated(false);
    setProgramName(null);

    if (profile?.trainingProgram?.templateName) {
      const template = TEMPLATE_PROGRAMS[profile.trainingProgram.templateName];
      if (template) {
        setWeeklyProgram(template);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProgram();
    }, [loadProgram]),
  );

  useEffect(() => {
    const todayIndex = new Date().getDay();
    const mondayBasedIndex = todayIndex === 0 ? 6 : todayIndex - 1;
    setSelectedDay(mondayBasedIndex);
  }, []);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    return {
      name: format(date, "EEE"),
      date: format(date, "d"),
      fullDate: format(date, "yyyy-MM-dd"),
      isToday: format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd"),
    };
  });

  const currentDayProgram = weeklyProgram[selectedDay];

  const renderDayButton = (day: (typeof weekDays)[0], index: number) => {
    const isSelected = selectedDay === index;
    const program = weeklyProgram[index];
    const isRest = program.muscleGroups[0] === "Rest";

    return (
      <Pressable
        key={index}
        onPress={() => setSelectedDay(index)}
        style={[
          styles.dayButton,
          isSelected && { backgroundColor: Colors.dark.primary },
          day.isToday &&
            !isSelected && { borderColor: Colors.dark.primary, borderWidth: 2 },
        ]}
      >
        <ThemedText
          type="small"
          style={[styles.dayName, isSelected && { color: "#FFFFFF" }]}
        >
          {day.name}
        </ThemedText>
        <ThemedText
          style={[styles.dayDate, isSelected && { color: "#FFFFFF" }]}
        >
          {day.date}
        </ThemedText>
        {!isRest ? (
          <View
            style={[
              styles.indicator,
              { backgroundColor: isSelected ? "#FFFFFF" : Colors.dark.primary },
            ]}
          />
        ) : null}
      </Pressable>
    );
  };

  const renderExercise = ({ item }: { item: Exercise }) => (
    <Card
      elevation={2}
      style={styles.exerciseCard}
      onPress={() => navigation.navigate("WorkoutSession", { exercise: item })}
    >
      <View style={styles.exerciseHeader}>
        <View style={{ flex: 1 }}>
          <ThemedText type="body" style={{ fontWeight: "600" }}>
            {item.name}
          </ThemedText>
        </View>
        <Pressable
          onPress={() =>
            navigation.navigate("ExerciseDetail", { exercise: item })
          }
          hitSlop={8}
          style={styles.infoButton}
        >
          <Feather name="info" size={18} color={Colors.dark.primary} />
        </Pressable>
        <Feather name="chevron-right" size={20} color={theme.textSecondary} />
      </View>
      <View style={styles.exerciseDetails}>
        <View style={styles.detailChip}>
          <ThemedText type="small" style={{ color: Colors.dark.primary }}>
            {item.sets} x {item.reps}
          </ThemedText>
        </View>
        <View style={styles.detailChip}>
          <ThemedText type="small" style={{ color: Colors.dark.warning }}>
            RIR {item.targetRIR}
          </ThemedText>
        </View>
        {item.tempo ? (
          <View style={styles.detailChip}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {item.tempo}
            </ThemedText>
          </View>
        ) : null}
      </View>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.header, { paddingTop: headerHeight + Spacing.md }]}>
        {isAIGenerated && programName ? (
          <View style={styles.programBadge}>
            <Feather name="cpu" size={14} color={Colors.dark.success} />
            <ThemedText
              type="small"
              style={{ color: Colors.dark.success, marginLeft: Spacing.xs }}
            >
              {programName}
            </ThemedText>
          </View>
        ) : (
          <Pressable
            style={[
              styles.generateBanner,
              { backgroundColor: Colors.dark.primary + "20" },
            ]}
            onPress={() => navigation.navigate("AICoach")}
          >
            <View style={styles.bannerContent}>
              <Feather name="cpu" size={18} color={Colors.dark.primary} />
              <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                <ThemedText type="small" style={{ fontWeight: "600" }}>
                  Using Template Program
                </ThemedText>
                <ThemedText
                  type="small"
                  style={{ color: theme.textSecondary, fontSize: 12 }}
                >
                  Tap to generate a personalized AI program
                </ThemedText>
              </View>
              <Feather
                name="chevron-right"
                size={18}
                color={Colors.dark.primary}
              />
            </View>
          </Pressable>
        )}

        <View style={styles.weekRow}>{weekDays.map(renderDayButton)}</View>
        <View style={styles.dayInfo}>
          <ThemedText type="h3">{currentDayProgram.day}</ThemedText>
          <View style={styles.muscleTagsRow}>
            {currentDayProgram.muscleGroups.map((group, i) => (
              <View key={i} style={styles.muscleTag}>
                <ThemedText type="small" style={{ color: Colors.dark.primary }}>
                  {group}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>
      </View>

      <FlatList
        data={currentDayProgram.exercises}
        keyExtractor={(item) => item.id}
        renderItem={renderExercise}
        contentContainerStyle={[
          styles.exerciseList,
          { paddingBottom: tabBarHeight + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="coffee"
            title="Rest Day"
            description="No training scheduled. Focus on recovery, sleep, and nutrition today."
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
  },
  dayButton: {
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    minWidth: 44,
  },
  dayName: {
    marginBottom: 2,
  },
  dayDate: {
    fontSize: 18,
    fontWeight: "700",
  },
  indicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
  },
  dayInfo: {
    marginBottom: Spacing.sm,
  },
  muscleTagsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  muscleTag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
    backgroundColor: "rgba(255, 69, 0, 0.15)",
  },
  exerciseList: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  exerciseCard: {
    marginBottom: Spacing.md,
  },
  exerciseHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  infoButton: {
    padding: Spacing.xs,
    marginRight: Spacing.sm,
  },
  exerciseDetails: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  detailChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  programBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  generateBanner: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: "rgba(255, 69, 0, 0.3)",
  },
  bannerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
});
