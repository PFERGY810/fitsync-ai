import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { getUserProfile } from "@/lib/storage";
import { getApiUrl } from "@/lib/query-client";
import type { OnboardingProfile } from "@/types/onboarding";

interface LiftData {
  weight: number;
  bwRatio: number;
  classification: string;
}

interface StrengthAnalysis {
  currentLevel: {
    bench: LiftData;
    squat: LiftData;
    deadlift: LiftData;
    ohp: LiftData;
    pullups: { reps: number; classification: string };
  };
  adjustedTargets: Record<
    string,
    { target: number; timeline: string; realistic: boolean }
  >;
  programmingRecommendations: {
    frequency: string;
    repRanges: string;
    techniques: string[];
  };
  weakPoints: string[];
  priorityExercises: string[];
}

export default function StrengthGoalsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  const [profile, setProfile] = useState<OnboardingProfile | null>(null);
  const [currentLifts, setCurrentLifts] = useState({
    bench: "",
    squat: "",
    deadlift: "",
    ohp: "",
    pullups: "",
  });
  const [targetGoals, setTargetGoals] = useState({
    bench: "",
    squat: "",
    deadlift: "",
  });
  const [analysis, setAnalysis] = useState<StrengthAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const userProfile = await getUserProfile();
      setProfile(userProfile);
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeStrength = async () => {
    setAnalyzing(true);
    try {
      const response = await fetch(
        new URL("/api/coach/strength-goals", getApiUrl()).toString(),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            profile,
            currentLifts: {
              bench: parseInt(currentLifts.bench) || 0,
              squat: parseInt(currentLifts.squat) || 0,
              deadlift: parseInt(currentLifts.deadlift) || 0,
              ohp: parseInt(currentLifts.ohp) || 0,
              pullups: parseInt(currentLifts.pullups) || 0,
            },
            targetGoals: {
              bench: parseInt(targetGoals.bench) || 0,
              squat: parseInt(targetGoals.squat) || 0,
              deadlift: parseInt(targetGoals.deadlift) || 0,
            },
          }),
        },
      );

      if (!response.ok) throw new Error("Analysis failed");

      const data = await response.json();
      setAnalysis(data);
    } catch (error) {
      console.error("Error analyzing strength:", error);
    } finally {
      setAnalyzing(false);
    }
  };

  const getClassificationColor = (classification: string) => {
    switch (classification?.toLowerCase()) {
      case "beginner":
        return Colors.orange;
      case "novice":
        return Colors.yellow;
      case "intermediate":
        return Colors.blue;
      case "advanced":
        return Colors.green;
      case "elite":
        return Colors.purple;
      default:
        return theme.textSecondary;
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </ThemedView>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: headerHeight + Spacing.md,
          paddingBottom: insets.bottom + Spacing.xl,
        },
      ]}
    >
      <Card style={styles.card}>
        <ThemedText style={styles.sectionTitle}>
          Current Lifts (1RM or estimate)
        </ThemedText>

        <View style={styles.inputRow}>
          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Bench Press</ThemedText>
            <TextInput
              style={[
                styles.input,
                { color: theme.text, borderColor: theme.border },
              ]}
              value={currentLifts.bench}
              onChangeText={(text) =>
                setCurrentLifts({ ...currentLifts, bench: text })
              }
              placeholder="lbs"
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Squat</ThemedText>
            <TextInput
              style={[
                styles.input,
                { color: theme.text, borderColor: theme.border },
              ]}
              value={currentLifts.squat}
              onChangeText={(text) =>
                setCurrentLifts({ ...currentLifts, squat: text })
              }
              placeholder="lbs"
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.inputRow}>
          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Deadlift</ThemedText>
            <TextInput
              style={[
                styles.input,
                { color: theme.text, borderColor: theme.border },
              ]}
              value={currentLifts.deadlift}
              onChangeText={(text) =>
                setCurrentLifts({ ...currentLifts, deadlift: text })
              }
              placeholder="lbs"
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>OHP</ThemedText>
            <TextInput
              style={[
                styles.input,
                { color: theme.text, borderColor: theme.border },
              ]}
              value={currentLifts.ohp}
              onChangeText={(text) =>
                setCurrentLifts({ ...currentLifts, ohp: text })
              }
              placeholder="lbs"
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.inputRow}>
          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>
              Pull-ups (max reps)
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                { color: theme.text, borderColor: theme.border },
              ]}
              value={currentLifts.pullups}
              onChangeText={(text) =>
                setCurrentLifts({ ...currentLifts, pullups: text })
              }
              placeholder="reps"
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
            />
          </View>
        </View>
      </Card>

      <Card style={styles.card}>
        <ThemedText style={styles.sectionTitle}>Target Goals</ThemedText>

        <View style={styles.inputRow}>
          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Bench Target</ThemedText>
            <TextInput
              style={[
                styles.input,
                { color: theme.text, borderColor: theme.border },
              ]}
              value={targetGoals.bench}
              onChangeText={(text) =>
                setTargetGoals({ ...targetGoals, bench: text })
              }
              placeholder="lbs"
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Squat Target</ThemedText>
            <TextInput
              style={[
                styles.input,
                { color: theme.text, borderColor: theme.border },
              ]}
              value={targetGoals.squat}
              onChangeText={(text) =>
                setTargetGoals({ ...targetGoals, squat: text })
              }
              placeholder="lbs"
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.inputRow}>
          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Deadlift Target</ThemedText>
            <TextInput
              style={[
                styles.input,
                { color: theme.text, borderColor: theme.border },
              ]}
              value={targetGoals.deadlift}
              onChangeText={(text) =>
                setTargetGoals({ ...targetGoals, deadlift: text })
              }
              placeholder="lbs"
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
            />
          </View>
        </View>
      </Card>

      <Button
        onPress={analyzeStrength}
        disabled={analyzing || !currentLifts.bench}
        style={styles.analyzeButton}
      >
        {analyzing ? "Analyzing..." : "Analyze & Set Goals"}
      </Button>

      {analysis && (
        <>
          <Card style={styles.card}>
            <ThemedText style={styles.sectionTitle}>
              Current Strength Level
            </ThemedText>

            {analysis.currentLevel &&
              Object.entries(analysis.currentLevel).map(([lift, data]) => (
                <View key={lift} style={styles.liftRow}>
                  <ThemedText style={styles.liftName}>
                    {lift.charAt(0).toUpperCase() + lift.slice(1)}
                  </ThemedText>
                  <View style={styles.liftStats}>
                    {typeof data === "object" && "weight" in data ? (
                      <>
                        <ThemedText style={styles.liftWeight}>
                          {data.weight} lbs
                        </ThemedText>
                        <ThemedText style={styles.liftRatio}>
                          {data.bwRatio?.toFixed(2)}x BW
                        </ThemedText>
                        <View
                          style={[
                            styles.classificationBadge,
                            {
                              backgroundColor: getClassificationColor(
                                data.classification,
                              ),
                            },
                          ]}
                        >
                          <ThemedText style={styles.classificationText}>
                            {data.classification}
                          </ThemedText>
                        </View>
                      </>
                    ) : (
                      <>
                        <ThemedText style={styles.liftWeight}>
                          {(data as any).reps} reps
                        </ThemedText>
                        <View
                          style={[
                            styles.classificationBadge,
                            {
                              backgroundColor: getClassificationColor(
                                (data as any).classification,
                              ),
                            },
                          ]}
                        >
                          <ThemedText style={styles.classificationText}>
                            {(data as any).classification}
                          </ThemedText>
                        </View>
                      </>
                    )}
                  </View>
                </View>
              ))}
          </Card>

          <Card style={styles.card}>
            <ThemedText style={styles.sectionTitle}>
              Adjusted Targets
            </ThemedText>

            {analysis.adjustedTargets &&
              Object.entries(analysis.adjustedTargets).map(([lift, data]) => (
                <View key={lift} style={styles.targetRow}>
                  <View style={styles.targetInfo}>
                    <ThemedText style={styles.targetLift}>
                      {lift.charAt(0).toUpperCase() + lift.slice(1)}
                    </ThemedText>
                    <ThemedText
                      style={[styles.targetWeight, { color: Colors.accent }]}
                    >
                      {data.target} lbs
                    </ThemedText>
                  </View>
                  <View style={styles.targetMeta}>
                    <ThemedText style={styles.targetTimeline}>
                      {data.timeline}
                    </ThemedText>
                    {data.realistic ? (
                      <Feather
                        name="check-circle"
                        size={16}
                        color={Colors.green}
                      />
                    ) : (
                      <Feather
                        name="alert-circle"
                        size={16}
                        color={Colors.orange}
                      />
                    )}
                  </View>
                </View>
              ))}
          </Card>

          <Card style={styles.card}>
            <ThemedText style={styles.sectionTitle}>
              Programming Recommendations
            </ThemedText>

            {analysis.programmingRecommendations && (
              <>
                <View style={styles.recRow}>
                  <Feather
                    name="calendar"
                    size={16}
                    color={theme.textSecondary}
                  />
                  <ThemedText style={styles.recText}>
                    {analysis.programmingRecommendations.frequency}
                  </ThemedText>
                </View>
                <View style={styles.recRow}>
                  <Feather
                    name="repeat"
                    size={16}
                    color={theme.textSecondary}
                  />
                  <ThemedText style={styles.recText}>
                    {analysis.programmingRecommendations.repRanges}
                  </ThemedText>
                </View>
                {analysis.programmingRecommendations.techniques?.map(
                  (tech, idx) => (
                    <View key={idx} style={styles.recRow}>
                      <Feather
                        name="target"
                        size={16}
                        color={theme.textSecondary}
                      />
                      <ThemedText style={styles.recText}>{tech}</ThemedText>
                    </View>
                  ),
                )}
              </>
            )}
          </Card>

          {analysis.weakPoints && analysis.weakPoints.length > 0 && (
            <Card style={styles.card}>
              <ThemedText style={styles.sectionTitle}>
                Weak Points to Address
              </ThemedText>
              {analysis.weakPoints.map((point, idx) => (
                <View key={idx} style={styles.weakPointRow}>
                  <Feather
                    name="alert-triangle"
                    size={16}
                    color={Colors.orange}
                  />
                  <ThemedText style={styles.weakPointText}>{point}</ThemedText>
                </View>
              ))}
            </Card>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: Spacing.md,
  },
  inputRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    marginBottom: Spacing.xs,
    opacity: 0.7,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 16,
  },
  analyzeButton: {
    marginBottom: Spacing.lg,
  },
  liftRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  liftName: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  liftStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  liftWeight: {
    fontSize: 14,
    fontWeight: "600",
  },
  liftRatio: {
    fontSize: 12,
    opacity: 0.7,
  },
  classificationBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  classificationText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
    textTransform: "uppercase",
  },
  targetRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  targetInfo: {
    flex: 1,
  },
  targetLift: {
    fontSize: 14,
    opacity: 0.7,
  },
  targetWeight: {
    fontSize: 20,
    fontWeight: "700",
  },
  targetMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  targetTimeline: {
    fontSize: 12,
    opacity: 0.7,
  },
  recRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  recText: {
    fontSize: 14,
    flex: 1,
  },
  weakPointRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  weakPointText: {
    fontSize: 14,
    flex: 1,
  },
});
