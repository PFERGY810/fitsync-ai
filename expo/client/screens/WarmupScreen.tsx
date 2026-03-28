import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { DEFAULT_WORKING_WEIGHT_LBS } from "@/constants/training";
import { getUserProfile } from "@/lib/storage";
import { getApiUrl } from "@/lib/query-client";
import type { OnboardingProfile } from "@/types/onboarding";

interface WarmupExercise {
  name: string;
  duration?: string;
  reps?: number | string;
  intensity?: string;
  cue?: string;
  weight?: string;
  rest?: string;
  purpose?: string;
}

interface WarmupPhase {
  name: string;
  duration: string;
  exercises: WarmupExercise[];
}

interface WarmupProtocol {
  totalTime: string;
  phases: WarmupPhase[];
  notes: string[];
  injuryModifications?: string;
}

type ExerciseType =
  | "Bench Press"
  | "Squat"
  | "Deadlift"
  | "Overhead Press"
  | "Pull-ups";

const EXERCISES: { name: ExerciseType; icon: string }[] = [
  { name: "Bench Press", icon: "chevrons-right" },
  { name: "Squat", icon: "chevrons-down" },
  { name: "Deadlift", icon: "arrow-up" },
  { name: "Overhead Press", icon: "arrow-up-circle" },
  { name: "Pull-ups", icon: "maximize-2" },
];

export default function WarmupScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  const [profile, setProfile] = useState<OnboardingProfile | null>(null);
  const [selectedExercise, setSelectedExercise] =
    useState<ExerciseType>("Bench Press");
  const [workingWeight, setWorkingWeight] = useState(
    DEFAULT_WORKING_WEIGHT_LBS.toString(),
  );
  const [warmupProtocol, setWarmupProtocol] = useState<WarmupProtocol | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activePhaseIdx, setActivePhaseIdx] = useState<number | null>(null);
  const [activeExerciseIdx, setActiveExerciseIdx] = useState<number | null>(
    null,
  );
  const [timerActive, setTimerActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    loadProfile();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (timerActive && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive]);

  useEffect(() => {
    if (timerActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [timerActive]);

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

  const generateWarmup = async () => {
    setGenerating(true);
    try {
      const response = await fetch(
        new URL("/api/coach/warmup-protocol", getApiUrl()).toString(),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            exercise: selectedExercise,
            workingWeight:
              parseInt(workingWeight, 10) || DEFAULT_WORKING_WEIGHT_LBS,
            profile,
          }),
        },
      );

      if (!response.ok) throw new Error("Generation failed");

      const data = await response.json();
      setWarmupProtocol(data);
      setActivePhaseIdx(null);
      setActiveExerciseIdx(null);
    } catch (error) {
      console.error("Error generating warmup:", error);
    } finally {
      setGenerating(false);
    }
  };

  const startTimer = (seconds: number) => {
    setTimeRemaining(seconds);
    setTimerActive(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const stopTimer = () => {
    setTimerActive(false);
    setTimeRemaining(0);
  };

  const parseDuration = (duration: string): number => {
    const match = duration.match(/(\d+)/);
    if (match) {
      const num = parseInt(match[1]);
      if (duration.includes("min")) return num * 60;
      return num;
    }
    return 60;
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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
      {timerActive && (
        <Card style={[styles.timerCard, { backgroundColor: Colors.accent }]}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <ThemedText style={styles.timerText}>
              {formatTime(timeRemaining)}
            </ThemedText>
          </Animated.View>
          <Button onPress={stopTimer} style={styles.stopButton}>
            Stop Timer
          </Button>
        </Card>
      )}

      <Card style={styles.card}>
        <ThemedText style={styles.sectionTitle}>Select Exercise</ThemedText>

        <View style={styles.exerciseGrid}>
          {EXERCISES.map((exercise) => (
            <Pressable
              key={exercise.name}
              style={[
                styles.exerciseOption,
                {
                  borderColor:
                    selectedExercise === exercise.name
                      ? Colors.accent
                      : theme.border,
                },
                selectedExercise === exercise.name && {
                  backgroundColor: `${Colors.accent}20`,
                },
              ]}
              onPress={() => setSelectedExercise(exercise.name)}
            >
              <Feather
                name={exercise.icon as any}
                size={24}
                color={
                  selectedExercise === exercise.name
                    ? Colors.accent
                    : theme.textSecondary
                }
              />
              <ThemedText
                style={[
                  styles.exerciseName,
                  selectedExercise === exercise.name && {
                    color: Colors.accent,
                  },
                ]}
              >
                {exercise.name}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </Card>

      <Card style={styles.card}>
        <ThemedText style={styles.sectionTitle}>Working Weight</ThemedText>
        <View style={styles.weightRow}>
          <Pressable
            style={[styles.weightButton, { borderColor: theme.border }]}
            onPress={() =>
              setWorkingWeight(
                String(Math.max(45, parseInt(workingWeight) - 10)),
              )
            }
          >
            <Feather name="minus" size={20} color={theme.text} />
          </Pressable>
          <View style={styles.weightDisplay}>
            <ThemedText style={styles.weightValue}>{workingWeight}</ThemedText>
            <ThemedText
              style={[styles.weightUnit, { color: theme.textSecondary }]}
            >
              lbs
            </ThemedText>
          </View>
          <Pressable
            style={[styles.weightButton, { borderColor: theme.border }]}
            onPress={() =>
              setWorkingWeight(String(parseInt(workingWeight) + 10))
            }
          >
            <Feather name="plus" size={20} color={theme.text} />
          </Pressable>
        </View>
      </Card>

      <Button
        onPress={generateWarmup}
        disabled={generating}
        style={styles.generateButton}
      >
        {generating ? "Generating Warmup..." : "Generate Warmup Protocol"}
      </Button>

      {warmupProtocol && (
        <>
          <Card style={styles.totalTimeCard}>
            <Feather name="clock" size={24} color={Colors.accent} />
            <ThemedText style={styles.totalTimeLabel}>
              Total Warmup Time
            </ThemedText>
            <ThemedText style={[styles.totalTime, { color: Colors.accent }]}>
              {warmupProtocol.totalTime}
            </ThemedText>
          </Card>

          {warmupProtocol.phases?.map((phase, phaseIdx) => (
            <Card key={phaseIdx} style={styles.phaseCard}>
              <View style={styles.phaseHeader}>
                <View
                  style={[
                    styles.phaseBadge,
                    { backgroundColor: Colors.accent },
                  ]}
                >
                  <ThemedText style={styles.phaseNumber}>
                    {phaseIdx + 1}
                  </ThemedText>
                </View>
                <View style={styles.phaseInfo}>
                  <ThemedText style={styles.phaseName}>{phase.name}</ThemedText>
                  <ThemedText
                    style={[
                      styles.phaseDuration,
                      { color: theme.textSecondary },
                    ]}
                  >
                    {phase.duration}
                  </ThemedText>
                </View>
              </View>

              <View style={styles.exercisesList}>
                {phase.exercises?.map((exercise, exerciseIdx) => (
                  <Pressable
                    key={exerciseIdx}
                    style={[
                      styles.exerciseRow,
                      { borderColor: theme.border },
                      activePhaseIdx === phaseIdx &&
                        activeExerciseIdx === exerciseIdx && {
                          backgroundColor: `${Colors.accent}20`,
                        },
                    ]}
                    onPress={() => {
                      setActivePhaseIdx(phaseIdx);
                      setActiveExerciseIdx(exerciseIdx);
                      if (exercise.duration) {
                        startTimer(parseDuration(exercise.duration));
                      } else if (exercise.rest) {
                        startTimer(parseDuration(exercise.rest));
                      }
                    }}
                  >
                    <View style={styles.exerciseMain}>
                      <ThemedText style={styles.exerciseItemName}>
                        {exercise.name}
                      </ThemedText>
                      <View style={styles.exerciseDetails}>
                        {exercise.duration && (
                          <ThemedText
                            style={[
                              styles.exerciseDetail,
                              { color: Colors.blue },
                            ]}
                          >
                            {exercise.duration}
                          </ThemedText>
                        )}
                        {exercise.reps && (
                          <ThemedText
                            style={[
                              styles.exerciseDetail,
                              { color: Colors.green },
                            ]}
                          >
                            {exercise.reps} reps
                          </ThemedText>
                        )}
                        {exercise.weight && (
                          <ThemedText
                            style={[
                              styles.exerciseDetail,
                              { color: Colors.orange },
                            ]}
                          >
                            {exercise.weight}
                          </ThemedText>
                        )}
                        {exercise.rest && (
                          <ThemedText
                            style={[
                              styles.exerciseDetail,
                              { color: theme.textSecondary },
                            ]}
                          >
                            Rest: {exercise.rest}
                          </ThemedText>
                        )}
                      </View>
                      {exercise.purpose && (
                        <ThemedText
                          style={[
                            styles.exercisePurpose,
                            { color: theme.textSecondary },
                          ]}
                        >
                          {exercise.purpose}
                        </ThemedText>
                      )}
                      {exercise.cue && (
                        <ThemedText
                          style={[styles.exerciseCue, { color: Colors.accent }]}
                        >
                          Cue: {exercise.cue}
                        </ThemedText>
                      )}
                    </View>
                    <Feather
                      name="play-circle"
                      size={24}
                      color={Colors.accent}
                      style={styles.playIcon}
                    />
                  </Pressable>
                ))}
              </View>
            </Card>
          ))}

          {warmupProtocol.notes && warmupProtocol.notes.length > 0 && (
            <Card style={styles.card}>
              <ThemedText style={styles.sectionTitle}>Notes</ThemedText>
              {warmupProtocol.notes.map((note, idx) => (
                <View key={idx} style={styles.noteRow}>
                  <Feather name="info" size={14} color={theme.textSecondary} />
                  <ThemedText
                    style={[styles.noteText, { color: theme.textSecondary }]}
                  >
                    {note}
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
  timerCard: {
    marginBottom: Spacing.md,
    padding: Spacing.xl,
    alignItems: "center",
  },
  timerText: {
    fontSize: 64,
    fontWeight: "800",
    color: "#fff",
  },
  stopButton: {
    marginTop: Spacing.md,
  },
  exerciseGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  exerciseOption: {
    width: "48%",
    borderWidth: 2,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: "center",
    gap: Spacing.xs,
  },
  exerciseName: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  weightRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.lg,
  },
  weightButton: {
    width: 48,
    height: 48,
    borderWidth: 2,
    borderRadius: BorderRadius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  weightDisplay: {
    alignItems: "center",
  },
  weightValue: {
    fontSize: 36,
    fontWeight: "800",
  },
  weightUnit: {
    fontSize: 14,
  },
  generateButton: {
    marginBottom: Spacing.lg,
  },
  totalTimeCard: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    alignItems: "center",
    gap: Spacing.xs,
  },
  totalTimeLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  totalTime: {
    fontSize: 28,
    fontWeight: "700",
  },
  phaseCard: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  phaseHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  phaseBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  phaseNumber: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
  phaseInfo: {
    flex: 1,
  },
  phaseName: {
    fontSize: 16,
    fontWeight: "600",
  },
  phaseDuration: {
    fontSize: 12,
  },
  exercisesList: {
    gap: Spacing.sm,
  },
  exerciseRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
  },
  exerciseMain: {
    flex: 1,
  },
  exerciseItemName: {
    fontSize: 14,
    fontWeight: "600",
  },
  exerciseDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginTop: 4,
  },
  exerciseDetail: {
    fontSize: 12,
    fontWeight: "500",
  },
  exercisePurpose: {
    fontSize: 11,
    marginTop: 4,
    fontStyle: "italic",
  },
  exerciseCue: {
    fontSize: 11,
    marginTop: 2,
  },
  playIcon: {
    marginLeft: Spacing.sm,
  },
  noteRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  noteText: {
    fontSize: 13,
    flex: 1,
  },
});
