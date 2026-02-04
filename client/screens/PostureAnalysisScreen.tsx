import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { getUserProfile } from "@/lib/storage";
import { getApiUrl } from "@/lib/query-client";
import type { OnboardingProfile } from "@/types/onboarding";

interface PostureIssue {
  issue: string;
  severity: number;
  description: string;
  tightMuscles: string[];
  weakMuscles: string[];
  stretches: { name: string; duration: string; frequency: string }[];
  strengthening: { name: string; sets: number; reps: number; cues: string[] }[];
  dailyHabits: string[];
  supplements: string[];
  equipment: string[];
  timeline: string;
}

interface PostureAnalysis {
  overallPostureScore: number;
  issues: PostureIssue[];
  priorityOrder: string[];
  dailyRoutine: {
    morning: string[];
    workDay: string[];
    evening: string[];
  };
  trainingAdjustments: string[];
}

export default function PostureAnalysisScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  const [profile, setProfile] = useState<OnboardingProfile | null>(null);
  const [photos, setPhotos] = useState<{
    front?: string;
    side?: string;
    back?: string;
  }>({});
  const [analysis, setAnalysis] = useState<PostureAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<PostureIssue | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const userProfile = await getUserProfile();
      setProfile(userProfile);
      if (userProfile?.progressPhotos) {
        setPhotos(userProfile.progressPhotos);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const pickPhoto = async (type: "front" | "side" | "back") => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setPhotos({
        ...photos,
        [type]: `data:image/jpeg;base64,${result.assets[0].base64}`,
      });
    }
  };

  const analyzePosture = async () => {
    if (!photos.front && !photos.side) {
      return;
    }

    setAnalyzing(true);
    try {
      const response = await fetch(
        new URL("/api/coach/analyze-posture", getApiUrl()).toString(),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ photos, profile }),
        },
      );

      if (!response.ok) throw new Error("Analysis failed");

      const data = await response.json();
      setAnalysis(data);
    } catch (error) {
      console.error("Error analyzing posture:", error);
    } finally {
      setAnalyzing(false);
    }
  };

  const getSeverityColor = (severity: number) => {
    if (severity <= 3) return Colors.green;
    if (severity <= 6) return Colors.orange;
    return Colors.red;
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
          Upload Posture Photos
        </ThemedText>
        <ThemedText
          style={[styles.description, { color: theme.textSecondary }]}
        >
          Stand naturally, relaxed posture. Front and side views work best.
        </ThemedText>

        <View style={styles.photoRow}>
          {(["front", "side", "back"] as const).map((type) => (
            <Pressable
              key={type}
              style={[styles.photoBox, { borderColor: theme.border }]}
              onPress={() => pickPhoto(type)}
            >
              {photos[type] ? (
                <Image source={{ uri: photos[type] }} style={styles.photo} />
              ) : (
                <>
                  <Feather
                    name="camera"
                    size={24}
                    color={theme.textSecondary}
                  />
                  <ThemedText
                    style={[styles.photoLabel, { color: theme.textSecondary }]}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </ThemedText>
                </>
              )}
            </Pressable>
          ))}
        </View>
      </Card>

      <Button
        onPress={analyzePosture}
        disabled={analyzing || (!photos.front && !photos.side)}
        style={styles.analyzeButton}
      >
        {analyzing ? "Analyzing Posture..." : "Analyze Posture"}
      </Button>

      {analysis && (
        <>
          <Card style={styles.scoreCard}>
            <ThemedText style={styles.scoreLabel}>
              Overall Posture Score
            </ThemedText>
            <ThemedText
              style={[
                styles.score,
                {
                  color: getSeverityColor(
                    10 - analysis.overallPostureScore / 10,
                  ),
                },
              ]}
            >
              {analysis.overallPostureScore}
            </ThemedText>
            <ThemedText
              style={[styles.scoreSubtext, { color: theme.textSecondary }]}
            >
              out of 100
            </ThemedText>
          </Card>

          {analysis.priorityOrder && analysis.priorityOrder.length > 0 && (
            <Card style={styles.card}>
              <ThemedText style={styles.sectionTitle}>
                Priority Order
              </ThemedText>
              {analysis.priorityOrder.map((issue, idx) => (
                <View key={idx} style={styles.priorityRow}>
                  <View
                    style={[
                      styles.priorityBadge,
                      { backgroundColor: Colors.accent },
                    ]}
                  >
                    <ThemedText style={styles.priorityNumber}>
                      {idx + 1}
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.priorityText}>{issue}</ThemedText>
                </View>
              ))}
            </Card>
          )}

          {analysis.issues && analysis.issues.length > 0 && (
            <Card style={styles.card}>
              <ThemedText style={styles.sectionTitle}>
                Issues Detected
              </ThemedText>

              {analysis.issues.map((issue, idx) => (
                <Pressable
                  key={idx}
                  style={[styles.issueCard, { borderColor: theme.border }]}
                  onPress={() =>
                    setSelectedIssue(
                      selectedIssue?.issue === issue.issue ? null : issue,
                    )
                  }
                >
                  <View style={styles.issueHeader}>
                    <ThemedText style={styles.issueName}>
                      {issue.issue}
                    </ThemedText>
                    <View style={styles.severityContainer}>
                      <ThemedText
                        style={[
                          styles.severityText,
                          { color: getSeverityColor(issue.severity) },
                        ]}
                      >
                        Severity: {issue.severity}/10
                      </ThemedText>
                      <Feather
                        name={
                          selectedIssue?.issue === issue.issue
                            ? "chevron-up"
                            : "chevron-down"
                        }
                        size={20}
                        color={theme.textSecondary}
                      />
                    </View>
                  </View>

                  {selectedIssue?.issue === issue.issue && (
                    <View style={styles.issueDetails}>
                      <ThemedText
                        style={[
                          styles.issueDescription,
                          { color: theme.textSecondary },
                        ]}
                      >
                        {issue.description}
                      </ThemedText>

                      {issue.tightMuscles && issue.tightMuscles.length > 0 && (
                        <View style={styles.muscleSection}>
                          <ThemedText style={styles.muscleLabel}>
                            Tight Muscles:
                          </ThemedText>
                          <ThemedText
                            style={[styles.muscleList, { color: Colors.red }]}
                          >
                            {issue.tightMuscles.join(", ")}
                          </ThemedText>
                        </View>
                      )}

                      {issue.weakMuscles && issue.weakMuscles.length > 0 && (
                        <View style={styles.muscleSection}>
                          <ThemedText style={styles.muscleLabel}>
                            Weak Muscles:
                          </ThemedText>
                          <ThemedText
                            style={[
                              styles.muscleList,
                              { color: Colors.orange },
                            ]}
                          >
                            {issue.weakMuscles.join(", ")}
                          </ThemedText>
                        </View>
                      )}

                      {issue.stretches && issue.stretches.length > 0 && (
                        <View style={styles.exerciseSection}>
                          <ThemedText style={styles.exerciseSectionTitle}>
                            Stretches
                          </ThemedText>
                          {issue.stretches.map((stretch, sIdx) => (
                            <View key={sIdx} style={styles.exerciseRow}>
                              <Feather
                                name="activity"
                                size={14}
                                color={Colors.blue}
                              />
                              <ThemedText style={styles.exerciseText}>
                                {stretch.name} - {stretch.duration} (
                                {stretch.frequency})
                              </ThemedText>
                            </View>
                          ))}
                        </View>
                      )}

                      {issue.strengthening &&
                        issue.strengthening.length > 0 && (
                          <View style={styles.exerciseSection}>
                            <ThemedText style={styles.exerciseSectionTitle}>
                              Strengthening
                            </ThemedText>
                            {issue.strengthening.map((exercise, eIdx) => (
                              <View key={eIdx} style={styles.exerciseRow}>
                                <Feather
                                  name="target"
                                  size={14}
                                  color={Colors.green}
                                />
                                <View style={styles.exerciseInfo}>
                                  <ThemedText style={styles.exerciseText}>
                                    {exercise.name} - {exercise.sets}x
                                    {exercise.reps}
                                  </ThemedText>
                                  {exercise.cues &&
                                    exercise.cues.length > 0 && (
                                      <ThemedText
                                        style={[
                                          styles.exerciseCue,
                                          { color: theme.textSecondary },
                                        ]}
                                      >
                                        Cue: {exercise.cues[0]}
                                      </ThemedText>
                                    )}
                                </View>
                              </View>
                            ))}
                          </View>
                        )}

                      {issue.dailyHabits && issue.dailyHabits.length > 0 && (
                        <View style={styles.exerciseSection}>
                          <ThemedText style={styles.exerciseSectionTitle}>
                            Daily Habits
                          </ThemedText>
                          {issue.dailyHabits.map((habit, hIdx) => (
                            <View key={hIdx} style={styles.exerciseRow}>
                              <Feather
                                name="check-circle"
                                size={14}
                                color={Colors.accent}
                              />
                              <ThemedText style={styles.exerciseText}>
                                {habit}
                              </ThemedText>
                            </View>
                          ))}
                        </View>
                      )}

                      <ThemedText
                        style={[styles.timeline, { color: Colors.accent }]}
                      >
                        Expected improvement: {issue.timeline}
                      </ThemedText>
                    </View>
                  )}
                </Pressable>
              ))}
            </Card>
          )}

          {analysis.dailyRoutine && (
            <Card style={styles.card}>
              <ThemedText style={styles.sectionTitle}>Daily Routine</ThemedText>

              {Object.entries(analysis.dailyRoutine).map(
                ([time, activities]) => (
                  <View key={time} style={styles.routineSection}>
                    <ThemedText style={styles.routineTime}>
                      {time.charAt(0).toUpperCase() + time.slice(1)}
                    </ThemedText>
                    {activities &&
                      activities.map((activity, idx) => (
                        <View key={idx} style={styles.routineRow}>
                          <Feather
                            name="clock"
                            size={12}
                            color={theme.textSecondary}
                          />
                          <ThemedText
                            style={[
                              styles.routineText,
                              { color: theme.textSecondary },
                            ]}
                          >
                            {activity}
                          </ThemedText>
                        </View>
                      ))}
                  </View>
                ),
              )}
            </Card>
          )}

          {analysis.trainingAdjustments &&
            analysis.trainingAdjustments.length > 0 && (
              <Card style={styles.card}>
                <ThemedText style={styles.sectionTitle}>
                  Training Adjustments
                </ThemedText>
                {analysis.trainingAdjustments.map((adjustment, idx) => (
                  <View key={idx} style={styles.adjustmentRow}>
                    <Feather
                      name="alert-circle"
                      size={16}
                      color={Colors.orange}
                    />
                    <ThemedText style={styles.adjustmentText}>
                      {adjustment}
                    </ThemedText>
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
  description: {
    fontSize: 14,
    marginBottom: Spacing.md,
  },
  photoRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  photoBox: {
    flex: 1,
    aspectRatio: 0.75,
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  photo: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  photoLabel: {
    fontSize: 12,
    marginTop: Spacing.xs,
  },
  analyzeButton: {
    marginBottom: Spacing.lg,
  },
  scoreCard: {
    marginBottom: Spacing.md,
    padding: Spacing.xl,
    alignItems: "center",
  },
  scoreLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  score: {
    fontSize: 64,
    fontWeight: "800",
  },
  scoreSubtext: {
    fontSize: 14,
  },
  priorityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  priorityBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  priorityNumber: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
  },
  priorityText: {
    fontSize: 14,
    flex: 1,
    textTransform: "capitalize",
  },
  issueCard: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  issueHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  issueName: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    textTransform: "capitalize",
  },
  severityContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  severityText: {
    fontSize: 12,
    fontWeight: "600",
  },
  issueDetails: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  issueDescription: {
    fontSize: 14,
    marginBottom: Spacing.md,
  },
  muscleSection: {
    marginBottom: Spacing.sm,
  },
  muscleLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  muscleList: {
    fontSize: 14,
  },
  exerciseSection: {
    marginTop: Spacing.md,
  },
  exerciseSectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: Spacing.sm,
  },
  exerciseRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseText: {
    fontSize: 13,
    flex: 1,
  },
  exerciseCue: {
    fontSize: 11,
    fontStyle: "italic",
    marginTop: 2,
  },
  timeline: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: Spacing.md,
  },
  routineSection: {
    marginBottom: Spacing.md,
  },
  routineTime: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  routineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: 2,
  },
  routineText: {
    fontSize: 13,
    flex: 1,
  },
  adjustmentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  adjustmentText: {
    fontSize: 14,
    flex: 1,
  },
});
