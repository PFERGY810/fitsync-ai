import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Card } from "@/components/Card";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

interface PriorityExercise {
  name: string;
  sets: string;
  reps: string;
  focus: string;
}

interface PriorityExerciseCardProps {
  exercises: PriorityExercise[];
  title?: string;
  onFindSimilar?: (exerciseName: string) => void;
}

export function PriorityExerciseCard({
  exercises,
  title = "Priority Exercises",
  onFindSimilar,
}: PriorityExerciseCardProps) {
  const { theme } = useTheme();

  if (!exercises || exercises.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ThemedText type="h3" style={styles.title}>
        {title}
      </ThemedText>
      {exercises.map((exercise, index) => (
        <Card key={index} elevation={1} style={styles.exerciseCard}>
          <View style={styles.exerciseHeader}>
            <View style={styles.exerciseIcon}>
              <Feather name="target" size={18} color={Colors.dark.primary} />
            </View>
            <View style={styles.exerciseInfo}>
              <ThemedText type="body" style={styles.exerciseName}>
                {exercise.name}
              </ThemedText>
              <View style={styles.exerciseDetails}>
                <ThemedText type="small" style={[styles.detailText, { color: theme.textSecondary }]}>
                  Sets: {exercise.sets}
                </ThemedText>
                <ThemedText type="small" style={[styles.detailText, { color: theme.textSecondary }]}>
                  Reps: {exercise.reps}
                </ThemedText>
              </View>
              <ThemedText type="small" style={[styles.focusText, { color: theme.textSecondary }]}>
                Focus: {exercise.focus}
              </ThemedText>
            </View>
            {onFindSimilar && (
              <Pressable
                style={styles.findSimilarButton}
                onPress={() => onFindSimilar(exercise.name)}
              >
                <Feather name="search" size={16} color={Colors.dark.primary} />
                <ThemedText type="small" style={[styles.findSimilarText, { color: Colors.dark.primary }]}>
                  Find similar
                </ThemedText>
              </Pressable>
            )}
          </View>
        </Card>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xl,
  },
  title: {
    marginBottom: Spacing.md,
  },
  exerciseCard: {
    marginBottom: Spacing.md,
  },
  exerciseHeader: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  exerciseIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.dark.primary + "20",
    justifyContent: "center",
    alignItems: "center",
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontWeight: "700",
    marginBottom: Spacing.xs,
  },
  exerciseDetails: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.xs,
  },
  detailText: {
    fontSize: 12,
  },
  focusText: {
    fontSize: 12,
    fontStyle: "italic",
  },
  findSimilarButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.dark.primary + "10",
  },
  findSimilarText: {
    fontSize: 11,
    fontWeight: "600",
  },
});
