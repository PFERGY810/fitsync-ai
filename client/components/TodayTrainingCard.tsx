import React from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

interface TodayTrainingCardProps {
  dayName: string;
  muscleGroups: string[];
  exerciseCount: number;
  onPress?: () => void;
}

export function TodayTrainingCard({
  dayName,
  muscleGroups,
  exerciseCount,
  onPress,
}: TodayTrainingCardProps) {
  const { theme } = useTheme();

  return (
    <Card elevation={2} onPress={onPress} style={styles.card}>
      <View style={styles.header}>
        <View>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {"Today's Training"}
          </ThemedText>
          <ThemedText type="h3" style={styles.dayName}>
            {dayName}
          </ThemedText>
        </View>
        <View style={styles.iconContainer}>
          <Feather name="activity" size={24} color={Colors.dark.primary} />
        </View>
      </View>
      <View style={styles.muscleGroups}>
        {muscleGroups.map((group, index) => (
          <View
            key={index}
            style={[
              styles.muscleTag,
              { backgroundColor: "rgba(255, 69, 0, 0.15)" },
            ]}
          >
            <ThemedText type="small" style={{ color: Colors.dark.primary }}>
              {group}
            </ThemedText>
          </View>
        ))}
      </View>
      <View style={styles.footer}>
        <Feather name="list" size={16} color={theme.textSecondary} />
        <ThemedText
          type="small"
          style={[styles.exerciseCount, { color: theme.textSecondary }]}
        >
          {exerciseCount} exercises
        </ThemedText>
        <Feather name="chevron-right" size={20} color={Colors.dark.primary} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {},
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  dayName: {
    marginTop: Spacing.xs,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: "rgba(255, 69, 0, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  muscleGroups: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  muscleTag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
  },
  exerciseCount: {
    flex: 1,
    marginLeft: Spacing.xs,
  },
});
