import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useRoute } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";

interface ExerciseGuidance {
  exerciseName: string;
  targetMuscle: string;
  secondaryMuscles: string[];
  setup: string;
  execution: string[];
  formCues: string[];
  commonMistakes: string[];
  mindMuscleConnection: string;
  breathing: string;
  progressions: string[];
  regressions: string[];
  recommendedTempo: string;
  repRecommendations: {
    strength: string;
    hypertrophy: string;
    endurance: string;
  };
}

export default function ExerciseDetailScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const route = useRoute<any>();

  const { exercise } = route.params || {};

  const [guidance, setGuidance] = useState<ExerciseGuidance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchExerciseGuidance();
  }, [exercise?.name]);

  const fetchExerciseGuidance = async () => {
    if (!exercise?.name) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        new URL("/api/coach/exercise-guidance", getApiUrl()).toString(),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            exerciseName: exercise.name,
            muscleGroup: exercise.muscleGroup?.toLowerCase() || "chest",
            userExperience: "intermediate",
          }),
        },
      );

      if (!response.ok) throw new Error("Failed to fetch guidance");

      const data = await response.json();
      setGuidance(data);
    } catch (err) {
      setError("Could not load exercise guidance");
      console.error("Error fetching exercise guidance:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderSection = (
    title: string,
    icon: string,
    content: React.ReactNode,
  ) => (
    <Card elevation={2} style={styles.section}>
      <View style={styles.sectionHeader}>
        <Feather name={icon as any} size={20} color={Colors.dark.primary} />
        <ThemedText type="h4" style={{ marginLeft: Spacing.sm }}>
          {title}
        </ThemedText>
      </View>
      {content}
    </Card>
  );

  const renderListItems = (items: string[] | undefined | null) => {
    if (!items || !Array.isArray(items) || items.length === 0) {
      return (
        <ThemedText type="body" style={{ color: theme.textSecondary }}>
          No specific guidance available
        </ThemedText>
      );
    }
    return (
      <View style={styles.list}>
        {items.map((item, index) => (
          <View key={index} style={styles.listItem}>
            <View
              style={[styles.bullet, { backgroundColor: Colors.dark.primary }]}
            />
            <ThemedText type="body" style={styles.listText}>
              {item}
            </ThemedText>
          </View>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: theme.backgroundRoot },
        ]}
      >
        <ActivityIndicator size="large" color={Colors.dark.primary} />
        <ThemedText
          type="body"
          style={{ marginTop: Spacing.lg, color: theme.textSecondary }}
        >
          Loading exercise guidance...
        </ThemedText>
      </View>
    );
  }

  if (error || !guidance) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: theme.backgroundRoot },
        ]}
      >
        <Feather name="alert-circle" size={48} color={Colors.dark.error} />
        <ThemedText
          type="body"
          style={{ marginTop: Spacing.lg, color: theme.textSecondary }}
        >
          {error || "No guidance available"}
        </ThemedText>
        <Button
          onPress={fetchExerciseGuidance}
          style={{ marginTop: Spacing.lg }}
        >
          Try Again
        </Button>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: insets.bottom + Spacing.xl,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <ThemedText type="h2">
          {guidance.exerciseName || exercise?.name || "Exercise Guide"}
        </ThemedText>
        <View style={styles.muscleInfo}>
          <View style={styles.primaryMuscle}>
            <Feather name="target" size={16} color={Colors.dark.primary} />
            <ThemedText
              type="body"
              style={{ marginLeft: Spacing.xs, color: Colors.dark.primary }}
            >
              {guidance.targetMuscle ||
                exercise?.muscleGroup ||
                "Primary muscle"}
            </ThemedText>
          </View>
          {guidance.secondaryMuscles &&
          Array.isArray(guidance.secondaryMuscles) &&
          guidance.secondaryMuscles.length > 0 ? (
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Also works: {guidance.secondaryMuscles.join(", ")}
            </ThemedText>
          ) : null}
        </View>
      </View>

      {exercise ? (
        <Card elevation={1} style={styles.prescriptionCard}>
          <ThemedText type="h4" style={{ marginBottom: Spacing.sm }}>
            {"Today's Prescription"}
          </ThemedText>
          <View style={styles.prescriptionRow}>
            <View style={styles.prescriptionItem}>
              <ThemedText type="h2" style={{ color: Colors.dark.primary }}>
                {exercise.sets}
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Sets
              </ThemedText>
            </View>
            <View style={styles.prescriptionItem}>
              <ThemedText type="h2" style={{ color: Colors.dark.primary }}>
                {exercise.reps || exercise.repRange}
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Reps
              </ThemedText>
            </View>
            <View style={styles.prescriptionItem}>
              <ThemedText type="h2" style={{ color: Colors.dark.warning }}>
                {exercise.targetRIR}
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                RIR
              </ThemedText>
            </View>
            {exercise.tempo ? (
              <View style={styles.prescriptionItem}>
                <ThemedText type="h3" style={{ color: theme.text }}>
                  {exercise.tempo}
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Tempo
                </ThemedText>
              </View>
            ) : null}
          </View>
        </Card>
      ) : null}

      {renderSection(
        "Setup",
        "settings",
        <ThemedText
          type="body"
          style={{ color: theme.textSecondary, lineHeight: 22 }}
        >
          {guidance.setup || "No setup instructions available"}
        </ThemedText>,
      )}

      {renderSection(
        "Execution",
        "play-circle",
        renderListItems(guidance.execution),
      )}

      {renderSection(
        "Form Cues",
        "check-circle",
        renderListItems(guidance.formCues),
      )}

      {renderSection(
        "Mind-Muscle Connection",
        "zap",
        <View
          style={[
            styles.highlightBox,
            { backgroundColor: "rgba(255, 69, 0, 0.15)" },
          ]}
        >
          <ThemedText type="body" style={{ color: theme.text, lineHeight: 22 }}>
            {guidance.mindMuscleConnection ||
              "Focus on feeling the target muscle throughout the movement"}
          </ThemedText>
        </View>,
      )}

      {renderSection(
        "Common Mistakes",
        "alert-triangle",
        <View>
          {guidance.commonMistakes &&
          Array.isArray(guidance.commonMistakes) &&
          guidance.commonMistakes.length > 0 ? (
            guidance.commonMistakes.map((mistake, index) => (
              <View key={index} style={styles.mistakeItem}>
                <Feather name="x-circle" size={16} color={Colors.dark.error} />
                <ThemedText
                  type="body"
                  style={{ marginLeft: Spacing.sm, color: theme.text, flex: 1 }}
                >
                  {mistake}
                </ThemedText>
              </View>
            ))
          ) : (
            <ThemedText type="body" style={{ color: theme.textSecondary }}>
              No common mistakes listed
            </ThemedText>
          )}
        </View>,
      )}

      {renderSection(
        "Breathing",
        "wind",
        <ThemedText
          type="body"
          style={{ color: theme.textSecondary, lineHeight: 22 }}
        >
          {guidance.breathing ||
            "Exhale during the effort phase, inhale during the return phase"}
        </ThemedText>,
      )}

      {guidance.repRecommendations
        ? renderSection(
            "Rep Recommendations",
            "bar-chart-2",
            <View style={styles.repGrid}>
              <View style={styles.repItem}>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Strength
                </ThemedText>
                <ThemedText type="h3" style={{ color: Colors.dark.primary }}>
                  {guidance.repRecommendations.strength || "3-5"}
                </ThemedText>
              </View>
              <View style={styles.repItem}>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Hypertrophy
                </ThemedText>
                <ThemedText type="h3" style={{ color: Colors.dark.success }}>
                  {guidance.repRecommendations.hypertrophy || "8-12"}
                </ThemedText>
              </View>
              <View style={styles.repItem}>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Endurance
                </ThemedText>
                <ThemedText type="h3" style={{ color: Colors.dark.warning }}>
                  {guidance.repRecommendations.endurance || "15-20"}
                </ThemedText>
              </View>
            </View>,
          )
        : null}

      {guidance.recommendedTempo ? (
        <View style={styles.tempoSection}>
          <ThemedText type="h4" style={{ marginBottom: Spacing.sm }}>
            Recommended Tempo
          </ThemedText>
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            {guidance.recommendedTempo}
          </ThemedText>
          <ThemedText
            type="small"
            style={{ color: theme.textSecondary, marginTop: Spacing.xs }}
          >
            Format: Eccentric - Pause at Bottom - Concentric - Pause at Top
          </ThemedText>
        </View>
      ) : null}

      {guidance.progressions?.length > 0
        ? renderSection(
            "Progressions",
            "trending-up",
            <View>
              {guidance.progressions.map((prog, index) => (
                <View key={index} style={styles.progressionItem}>
                  <View
                    style={[
                      styles.progressionBadge,
                      { backgroundColor: Colors.dark.success },
                    ]}
                  >
                    <ThemedText type="small" style={{ color: "#FFF" }}>
                      {index + 1}
                    </ThemedText>
                  </View>
                  <ThemedText
                    type="body"
                    style={{ marginLeft: Spacing.sm, flex: 1 }}
                  >
                    {prog}
                  </ThemedText>
                </View>
              ))}
            </View>,
          )
        : null}

      {guidance.regressions?.length > 0
        ? renderSection(
            "Regressions",
            "trending-down",
            <View>
              {guidance.regressions.map((reg, index) => (
                <View key={index} style={styles.progressionItem}>
                  <View
                    style={[
                      styles.progressionBadge,
                      { backgroundColor: theme.textSecondary },
                    ]}
                  >
                    <ThemedText type="small" style={{ color: "#FFF" }}>
                      {index + 1}
                    </ThemedText>
                  </View>
                  <ThemedText
                    type="body"
                    style={{ marginLeft: Spacing.sm, flex: 1 }}
                  >
                    {reg}
                  </ThemedText>
                </View>
              ))}
            </View>,
          )
        : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  muscleInfo: {
    marginTop: Spacing.sm,
  },
  primaryMuscle: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  prescriptionCard: {
    marginBottom: Spacing.xl,
    backgroundColor: "rgba(255, 69, 0, 0.1)",
  },
  prescriptionRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  prescriptionItem: {
    alignItems: "center",
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  list: {
    gap: Spacing.sm,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
    marginRight: Spacing.sm,
  },
  listText: {
    flex: 1,
    lineHeight: 22,
  },
  highlightBox: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  mistakeItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
  },
  repGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  repItem: {
    alignItems: "center",
  },
  tempoSection: {
    marginBottom: Spacing.xl,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  progressionItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  progressionBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
