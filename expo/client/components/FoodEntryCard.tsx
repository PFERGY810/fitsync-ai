import React, { memo, useCallback } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing } from "@/constants/theme";
import type { FoodEntry } from "@/types";

interface FoodEntryCardProps {
  entry: FoodEntry;
  onDelete?: () => void;
}

export const FoodEntryCard = memo(function FoodEntryCard({ entry, onDelete }: FoodEntryCardProps) {
  const { theme } = useTheme();

  return (
    <Card elevation={1} style={styles.card}>
      <View style={styles.header}>
        <ThemedText type="body" style={{ fontWeight: "600", flex: 1 }}>
          {entry.name}
        </ThemedText>
        {onDelete ? (
          <Pressable onPress={onDelete} hitSlop={8}>
            <Feather name="x" size={18} color={theme.textSecondary} />
          </Pressable>
        ) : null}
      </View>
      <View style={styles.macros}>
        <View style={styles.macroItem}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Cal
          </ThemedText>
          <ThemedText
            style={[styles.macroValue, { color: Colors.dark.primary }]}
          >
            {entry.calories}
          </ThemedText>
        </View>
        <View style={styles.macroItem}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Protein
          </ThemedText>
          <ThemedText
            style={[styles.macroValue, { color: Colors.dark.chartColors[1] }]}
          >
            {entry.protein}g
          </ThemedText>
        </View>
        <View style={styles.macroItem}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Carbs
          </ThemedText>
          <ThemedText
            style={[styles.macroValue, { color: Colors.dark.chartColors[2] }]}
          >
            {entry.carbs}g
          </ThemedText>
        </View>
        <View style={styles.macroItem}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Fat
          </ThemedText>
          <ThemedText
            style={[styles.macroValue, { color: Colors.dark.chartColors[3] }]}
          >
            {entry.fat}g
          </ThemedText>
        </View>
      </View>
    </Card>
  );
});

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.sm,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  macros: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  macroItem: {
    alignItems: "center",
  },
  macroValue: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 2,
  },
});
