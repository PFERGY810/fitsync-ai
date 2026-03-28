import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import type { Exercise } from "@/types";

interface ExerciseCardProps {
  exercise: Exercise;
  onPress?: () => void;
  onUploadForm?: () => void;
  completed?: boolean;
}

export function ExerciseCard({
  exercise,
  onPress,
  onUploadForm,
  completed,
}: ExerciseCardProps) {
  const { theme } = useTheme();

  return (
    <Card
      elevation={2}
      onPress={onPress}
      style={[styles.card, completed && styles.completed]}
    >
      <View style={styles.header}>
        <View style={styles.nameContainer}>
          <ThemedText
            type="h4"
            style={completed ? { opacity: 0.6 } : undefined}
          >
            {exercise.name}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {exercise.muscleGroup}
          </ThemedText>
        </View>
        {onUploadForm ? (
          <Pressable
            onPress={onUploadForm}
            style={({ pressed }) => [
              styles.uploadButton,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Feather name="video" size={18} color={Colors.dark.primary} />
          </Pressable>
        ) : null}
      </View>
      <View style={styles.details}>
        <View style={styles.detailItem}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Sets
          </ThemedText>
          <ThemedText style={styles.detailValue}>{exercise.sets}</ThemedText>
        </View>
        <View style={styles.detailItem}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Reps
          </ThemedText>
          <ThemedText style={styles.detailValue}>{exercise.reps}</ThemedText>
        </View>
        <View style={styles.detailItem}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            RIR
          </ThemedText>
          <ThemedText
            style={[styles.detailValue, { color: Colors.dark.warning }]}
          >
            {exercise.targetRIR}
          </ThemedText>
        </View>
        {exercise.tempo ? (
          <View style={styles.detailItem}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Tempo
            </ThemedText>
            <ThemedText style={styles.detailValue}>{exercise.tempo}</ThemedText>
          </View>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
  },
  completed: {
    opacity: 0.6,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  nameContainer: {
    flex: 1,
  },
  uploadButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    backgroundColor: "rgba(255, 69, 0, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  details: {
    flexDirection: "row",
    gap: Spacing.xl,
  },
  detailItem: {
    alignItems: "center",
  },
  detailValue: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: Spacing.xs,
  },
});
