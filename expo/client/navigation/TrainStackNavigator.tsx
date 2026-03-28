import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import TrainScreen from "@/screens/TrainScreen";
import WorkoutSessionScreen from "@/screens/WorkoutSessionScreen";
import ExerciseDetailScreen from "@/screens/ExerciseDetailScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import type { Exercise } from "@/types";

export type TrainStackParamList = {
  TrainMain: undefined;
  WorkoutSession: { exercise: Exercise };
  ExerciseDetail: { exercise: Exercise };
};

const Stack = createNativeStackNavigator<TrainStackParamList>();

export default function TrainStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="TrainMain"
        component={TrainScreen}
        options={{ headerTitle: "Program" }}
      />
      <Stack.Screen
        name="WorkoutSession"
        component={WorkoutSessionScreen}
        options={{ headerTitle: "Log Exercise" }}
      />
      <Stack.Screen
        name="ExerciseDetail"
        component={ExerciseDetailScreen}
        options={{ headerTitle: "Exercise Guide" }}
      />
    </Stack.Navigator>
  );
}
