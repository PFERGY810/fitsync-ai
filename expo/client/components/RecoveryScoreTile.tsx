import React from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing } from "@/constants/theme";

interface RecoveryScoreTileProps {
  score: number;
  onPress?: () => void;
}

function getScoreDetails(score: number) {
  if (score >= 80) {
    return {
      label: "Excellent",
      color: Colors.dark.success,
      icon: "trending-up" as const,
    };
  } else if (score >= 60) {
    return {
      label: "Good",
      color: Colors.dark.success,
      icon: "check-circle" as const,
    };
  } else if (score >= 40) {
    return {
      label: "Moderate",
      color: Colors.dark.warning,
      icon: "alert-circle" as const,
    };
  } else {
    return {
      label: "Low",
      color: Colors.dark.error,
      icon: "alert-triangle" as const,
    };
  }
}

export function RecoveryScoreTile({ score, onPress }: RecoveryScoreTileProps) {
  const { theme } = useTheme();
  const details = getScoreDetails(score);

  return (
    <Card elevation={2} onPress={onPress} style={styles.card}>
      <View style={styles.header}>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          Recovery Score
        </ThemedText>
        <Feather name={details.icon} size={20} color={details.color} />
      </View>
      <View style={styles.content}>
        <ThemedText style={[styles.score, { color: details.color }]}>
          {score}
        </ThemedText>
        <ThemedText type="small" style={{ color: details.color }}>
          {details.label}
        </ThemedText>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  content: {
    alignItems: "flex-start",
  },
  score: {
    fontSize: 32,
    fontWeight: "700",
  },
});
