import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { SetLogInput } from "@/components/SetLogInput";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import type { Exercise, SetLog } from "@/types";

export default function WorkoutSessionScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<any>();

  const exercise: Exercise = route.params?.exercise || {
    id: "1",
    name: "Barbell Bench Press",
    muscleGroup: "Chest",
    sets: 4,
    reps: "6-8",
    targetRIR: 2,
    tempo: "3-1-1",
  };

  const [completedSets, setCompletedSets] = useState<SetLog[]>([]);

  const handleSetComplete = (
    setNumber: number,
    weight: number,
    reps: number,
    rir: number,
  ) => {
    setCompletedSets((prev) => [
      ...prev,
      {
        id: `${exercise.id}-${setNumber}`,
        exerciseId: exercise.id,
        setNumber,
        weight,
        reps,
        rir,
        completed: true,
      },
    ]);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const isSetCompleted = (setNumber: number) => {
    return completedSets.some((s) => s.setNumber === setNumber);
  };

  const allSetsCompleted = completedSets.length >= exercise.sets;

  const handleFinish = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    navigation.goBack();
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: Spacing.xl,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
    >
      <Card elevation={2} style={styles.exerciseInfo}>
        <ThemedText type="h2">{exercise.name}</ThemedText>
        <ThemedText
          type="body"
          style={{ color: theme.textSecondary, marginTop: Spacing.xs }}
        >
          {exercise.muscleGroup}
        </ThemedText>

        <View style={styles.targetRow}>
          <View style={styles.targetItem}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Target Sets
            </ThemedText>
            <ThemedText style={styles.targetValue}>{exercise.sets}</ThemedText>
          </View>
          <View style={styles.targetItem}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Target Reps
            </ThemedText>
            <ThemedText style={styles.targetValue}>{exercise.reps}</ThemedText>
          </View>
          <View style={styles.targetItem}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Target RIR
            </ThemedText>
            <ThemedText
              style={[styles.targetValue, { color: Colors.dark.warning }]}
            >
              {exercise.targetRIR}
            </ThemedText>
          </View>
          {exercise.tempo ? (
            <View style={styles.targetItem}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Tempo
              </ThemedText>
              <ThemedText style={styles.targetValue}>
                {exercise.tempo}
              </ThemedText>
            </View>
          ) : null}
        </View>
      </Card>

      <View style={styles.progressContainer}>
        <ThemedText type="h4">
          Progress: {completedSets.length} / {exercise.sets} sets
        </ThemedText>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${(completedSets.length / exercise.sets) * 100}%` },
            ]}
          />
        </View>
      </View>

      <Card elevation={2} style={styles.setsCard}>
        <ThemedText type="h4" style={styles.setsTitle}>
          Log Your Sets
        </ThemedText>
        {Array.from({ length: exercise.sets }, (_, i) => i + 1).map(
          (setNumber) => (
            <SetLogInput
              key={setNumber}
              setNumber={setNumber}
              onComplete={(weight, reps, rir) =>
                handleSetComplete(setNumber, weight, reps, rir)
              }
              completed={isSetCompleted(setNumber)}
              initialRir={exercise.targetRIR}
            />
          ),
        )}
      </Card>

      {allSetsCompleted ? (
        <Button onPress={handleFinish} style={styles.finishButton}>
          Complete Exercise
        </Button>
      ) : null}

      {completedSets.length > 0 ? (
        <Card elevation={1} style={styles.summaryCard}>
          <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>
            Set Summary
          </ThemedText>
          {completedSets.map((set, index) => (
            <View key={set.id} style={styles.summaryRow}>
              <ThemedText type="small">Set {set.setNumber}</ThemedText>
              <ThemedText type="small" style={{ color: Colors.dark.primary }}>
                {set.weight} lbs x {set.reps} reps
              </ThemedText>
              <ThemedText type="small" style={{ color: Colors.dark.warning }}>
                RIR {set.rir}
              </ThemedText>
            </View>
          ))}
        </Card>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  exerciseInfo: {
    marginBottom: Spacing.lg,
  },
  targetRow: {
    flexDirection: "row",
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  targetItem: {
    flex: 1,
    alignItems: "center",
  },
  targetValue: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: Spacing.xs,
  },
  progressContainer: {
    marginBottom: Spacing.lg,
  },
  progressBar: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: BorderRadius.full,
    marginTop: Spacing.sm,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.dark.success,
    borderRadius: BorderRadius.full,
  },
  setsCard: {
    marginBottom: Spacing.lg,
  },
  setsTitle: {
    marginBottom: Spacing.md,
  },
  finishButton: {
    marginBottom: Spacing.lg,
  },
  summaryCard: {
    marginBottom: Spacing.lg,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
});
