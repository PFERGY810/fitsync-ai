import React from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Card } from "@/components/Card";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

interface AnalysisCardProps {
  muscle: string;
  overallScore: number;
  size?: number;
  definition?: number;
  symmetry?: number;
  proportion?: number;
  status: "lagging" | "average" | "strong" | "dominant" | "not_visible";
  observations?: string[];
  priorityExercises?: Array<{
    name: string;
    sets: string;
    reps: string;
    focus: string;
  }>;
  visualKeywords?: string[];
}

export function AnalysisCard({
  muscle,
  overallScore,
  size,
  definition,
  symmetry,
  proportion,
  status,
  observations = [],
  priorityExercises = [],
  visualKeywords = [],
}: AnalysisCardProps) {
  const { theme } = useTheme();

  const getStatusColor = () => {
    switch (status) {
      case "strong":
      case "dominant":
        return Colors.dark.success;
      case "average":
        return Colors.dark.carbs;
      case "lagging":
        return Colors.dark.primary;
      case "not_visible":
        return theme.textSecondary;
      default:
        return theme.textSecondary;
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case "strong":
        return "Strong";
      case "dominant":
        return "Dominant";
      case "average":
        return "Average";
      case "lagging":
        return "Lagging";
      case "not_visible":
        return "Not Visible";
      default:
        return (status as any).toUpperCase();
    }
  };

  if (status === "not_visible") {
    return null;
  }

  return (
    <Card elevation={2} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <ThemedText type="h4" style={styles.muscleName}>
            {muscle}
          </ThemedText>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor() },
            ]}
          >
            <ThemedText
              type="small"
              style={styles.statusText}
            >
              {getStatusLabel()}
            </ThemedText>
          </View>
        </View>
        <View style={styles.scoreContainer}>
          <ThemedText type="h2" style={[styles.score, { color: getStatusColor() }]}>
            {overallScore}
          </ThemedText>
          <ThemedText type="small" style={[styles.scoreLabel, { color: theme.textSecondary }]}>
            /100
          </ThemedText>
        </View>
      </View>

      {(size !== undefined || definition !== undefined || symmetry !== undefined || proportion !== undefined) && (
        <View style={styles.detailedScoring}>
          <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            Detailed Scoring:
          </ThemedText>
          <View style={styles.metricsRow}>
            {size !== undefined && (
              <View style={styles.metric}>
                <ThemedText type="small" style={[styles.metricLabel, { color: theme.textSecondary }]}>
                  Size
                </ThemedText>
                <ThemedText type="body" style={styles.metricValue}>
                  {size}
                </ThemedText>
              </View>
            )}
            {definition !== undefined && (
              <View style={styles.metric}>
                <ThemedText type="small" style={[styles.metricLabel, { color: theme.textSecondary }]}>
                  Definition
                </ThemedText>
                <ThemedText type="body" style={styles.metricValue}>
                  {definition}
                </ThemedText>
              </View>
            )}
            {symmetry !== undefined && (
              <View style={styles.metric}>
                <ThemedText type="small" style={[styles.metricLabel, { color: theme.textSecondary }]}>
                  Symmetry
                </ThemedText>
                <ThemedText type="body" style={styles.metricValue}>
                  {symmetry}
                </ThemedText>
              </View>
            )}
            {proportion !== undefined && (
              <View style={styles.metric}>
                <ThemedText type="small" style={[styles.metricLabel, { color: theme.textSecondary }]}>
                  Proportion
                </ThemedText>
                <ThemedText type="body" style={styles.metricValue}>
                  {proportion}
                </ThemedText>
              </View>
            )}
          </View>
        </View>
      )}

      {visualKeywords.length > 0 && (
        <View style={styles.keywordsContainer}>
          <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            Visual Markers:
          </ThemedText>
          <View style={styles.keywordsList}>
            {visualKeywords.map((kw, i) => (
              <View key={i} style={[styles.keywordChip, { backgroundColor: theme.backgroundSecondary }]}>
                <ThemedText type="small" style={styles.keywordText}>{kw}</ThemedText>
              </View>
            ))}
          </View>
        </View>
      )}

      {observations.length > 0 && (
        <View style={styles.observations}>
          <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            Observations:
          </ThemedText>
          {observations.map((obs, i) => (
            <View key={i} style={styles.observationRow}>
              <View style={[styles.dot, { backgroundColor: getStatusColor() }]} />
              <ThemedText type="small" style={[styles.observationText, { color: theme.textSecondary }]}>
                {obs}
              </ThemedText>
            </View>
          ))}
        </View>
      )}

      {priorityExercises.length > 0 && (
        <View style={styles.exercises}>
          <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            Priority Exercises:
          </ThemedText>
          {priorityExercises.map((exercise, i) => (
            <View key={i} style={styles.exerciseRow}>
              <Feather name="eye" size={16} color={Colors.dark.primary} />
              <View style={styles.exerciseInfo}>
                <ThemedText type="small" style={styles.exerciseName}>
                  {exercise.name}
                </ThemedText>
                <ThemedText type="small" style={[styles.exerciseDetails, { color: theme.textSecondary }]}>
                  {exercise.sets} sets × {exercise.reps} reps
                </ThemedText>
                {exercise.focus ? (
                  <ThemedText type="small" style={[styles.exerciseFocus, { color: theme.textSecondary }]}>
                    {exercise.focus}
                  </ThemedText>
                ) : null}
              </View>
              <ThemedText type="small" style={[styles.findSimilarLink, { color: Colors.dark.primary }]}>
                Find similar &gt;
              </ThemedText>
            </View>
          ))}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  headerLeft: {
    flex: 1,
  },
  muscleName: {
    marginBottom: Spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginTop: Spacing.xs,
  },
  statusText: {
    fontWeight: "700",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "#FFF",
  },
  scoreContainer: {
    alignItems: "flex-end",
  },
  score: {
    lineHeight: 32,
  },
  scoreLabel: {
    fontSize: 12,
    marginTop: -4,
  },
  detailedScoring: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(128, 128, 128, 0.2)",
  },
  metricsRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  metric: {
    flex: 1,
    alignItems: "center",
  },
  metricLabel: {
    fontSize: 10,
    marginBottom: 2,
  },
  metricValue: {
    fontWeight: "700",
    fontSize: 18,
  },
  observations: {
    marginTop: Spacing.md,
  },
  sectionTitle: {
    fontWeight: "600",
    marginBottom: Spacing.xs,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  observationRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: Spacing.xs,
    gap: Spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 4,
  },
  observationText: {
    flex: 1,
    lineHeight: 18,
  },
  exercises: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(128, 128, 128, 0.2)",
  },
  exerciseRow: {
    flexDirection: "row",
    marginTop: Spacing.sm,
    gap: Spacing.sm,
    alignItems: "flex-start",
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontWeight: "600",
    marginBottom: 2,
    fontSize: 13,
  },
  exerciseDetails: {
    fontSize: 11,
    marginBottom: 2,
  },
  exerciseFocus: {
    fontSize: 11,
    fontStyle: "italic",
  },
  findSimilarLink: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  keywordsContainer: {
    marginTop: Spacing.md,
  },
  keywordsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  keywordChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(128, 128, 128, 0.3)",
  },
  keywordText: {
    fontSize: 10,
    fontWeight: "600",
    opacity: 0.9,
  },
});
