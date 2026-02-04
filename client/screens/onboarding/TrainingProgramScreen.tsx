import React, { useState } from "react";
import { View, StyleSheet, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";

const AnimatedView = Animated.createAnimatedComponent(View);
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { useOnboarding } from "@/context/OnboardingContext";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import {
  PROGRAM_TEMPLATES,
  TrainingProgramConfig,
  TrainingDay,
} from "@/types/onboarding";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const MUSCLE_GROUPS = [
  "Chest",
  "Back",
  "Shoulders",
  "Biceps",
  "Triceps",
  "Quads",
  "Hamstrings",
  "Glutes",
  "Calves",
  "Core",
];

export default function TrainingProgramScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const { profile, updateProfile, getProgressForStep } = useOnboarding();
  const progress = getProgressForStep("training-program");

  const [selectedTemplate, setSelectedTemplate] = useState(
    profile.trainingProgram?.templateName || "ppl",
  );
  const [customDays, setCustomDays] = useState<string[]>([]);
  const [customMusclesByDay, setCustomMusclesByDay] = useState<
    Record<string, string[]>
  >({});

  const template = PROGRAM_TEMPLATES.find((t) => t.id === selectedTemplate);
  const isCustom = selectedTemplate === "custom";

  const toggleCustomDay = (day: string) => {
    setCustomDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const toggleMuscleForDay = (day: string, muscle: string) => {
    setCustomMusclesByDay((prev) => {
      const dayMuscles = prev[day] || [];
      return {
        ...prev,
        [day]: dayMuscles.includes(muscle)
          ? dayMuscles.filter((m) => m !== muscle)
          : [...dayMuscles, muscle],
      };
    });
  };

  const handleContinue = () => {
    const programConfig: TrainingProgramConfig = {
      type: isCustom ? "custom" : "template",
      templateName: selectedTemplate,
      daysPerWeek: isCustom ? customDays.length : template?.daysPerWeek || 4,
      schedule: isCustom
        ? customDays.map((day) => ({
          dayOfWeek: day,
          name: customMusclesByDay[day]?.join(" / ") || "Training",
          muscleGroups: customMusclesByDay[day] || [],
          exercises: [],
        }))
        : [],
    };

    updateProfile({ trainingProgram: programConfig });
    navigation.navigate("OnboardingComplete");
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const canContinue = isCustom
    ? customDays.length > 0 &&
    customDays.every((day) => (customMusclesByDay[day]?.length || 0) > 0)
    : true;

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Pressable onPress={handleBack} hitSlop={8}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </Pressable>
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBar,
              { backgroundColor: theme.backgroundSecondary },
            ]}
          >
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <AnimatedView entering={FadeInUp.duration(350)}>
          <ThemedText type="h2" style={styles.title}>
            Training Program
          </ThemedText>
          <ThemedText
            type="body"
            style={[styles.subtitle, { color: theme.textSecondary }]}
          >
            Choose a template or build your own weekly split
          </ThemedText>

          <View style={styles.templateGrid}>
            {PROGRAM_TEMPLATES.map((t) => (
              <Pressable
                key={t.id}
                onPress={() => setSelectedTemplate(t.id)}
                style={[
                  styles.templateCard,
                  { backgroundColor: theme.backgroundSecondary },
                  selectedTemplate === t.id && {
                    borderColor: Colors.dark.primary,
                    borderWidth: 2,
                  },
                ]}
              >
                <View style={styles.templateHeader}>
                  <ThemedText type="body" style={{ fontWeight: "700" }}>
                    {t.name}
                  </ThemedText>
                  {t.daysPerWeek > 0 ? (
                    <View
                      style={[
                        styles.daysBadge,
                        { backgroundColor: theme.backgroundTertiary },
                      ]}
                    >
                      <ThemedText type="small">
                        {t.daysPerWeek}x/week
                      </ThemedText>
                    </View>
                  ) : null}
                </View>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  {t.description}
                </ThemedText>
                {selectedTemplate === t.id ? (
                  <View style={styles.checkmark}>
                    <Feather name="check" size={16} color="#FFF" />
                  </View>
                ) : null}
              </Pressable>
            ))}
          </View>

          {isCustom ? (
            <>
              <ThemedText type="h4" style={styles.sectionTitle}>
                Select Training Days
              </ThemedText>
              <View style={styles.daysGrid}>
                {DAYS_OF_WEEK.map((day) => (
                  <Pressable
                    key={day}
                    onPress={() => toggleCustomDay(day)}
                    style={[
                      styles.dayChip,
                      { backgroundColor: theme.backgroundSecondary },
                      customDays.includes(day) && {
                        backgroundColor: Colors.dark.primary,
                      },
                    ]}
                  >
                    <ThemedText
                      type="small"
                      style={
                        customDays.includes(day)
                          ? { color: "#FFF", fontWeight: "600" }
                          : undefined
                      }
                    >
                      {day.slice(0, 3)}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>

              {customDays.length > 0 ? (
                <>
                  <ThemedText type="h4" style={styles.sectionTitle}>
                    Assign Muscle Groups
                  </ThemedText>
                  {customDays.map((day) => (
                    <Card key={day} elevation={1} style={styles.dayCard}>
                      <ThemedText
                        type="body"
                        style={{ fontWeight: "600", marginBottom: Spacing.md }}
                      >
                        {day}
                      </ThemedText>
                      <View style={styles.musclesGrid}>
                        {MUSCLE_GROUPS.map((muscle) => {
                          const isSelected =
                            customMusclesByDay[day]?.includes(muscle);
                          return (
                            <Pressable
                              key={muscle}
                              onPress={() => toggleMuscleForDay(day, muscle)}
                              style={[
                                styles.muscleChip,
                                { backgroundColor: theme.backgroundSecondary },
                                isSelected && {
                                  backgroundColor: "rgba(255, 69, 0, 0.2)",
                                  borderColor: Colors.dark.primary,
                                  borderWidth: 1,
                                },
                              ]}
                            >
                              <ThemedText
                                type="small"
                                style={
                                  isSelected
                                    ? { color: Colors.dark.primary }
                                    : undefined
                                }
                              >
                                {muscle}
                              </ThemedText>
                            </Pressable>
                          );
                        })}
                      </View>
                    </Card>
                  ))}
                </>
              ) : null}
            </>
          ) : (
            <Card elevation={2} style={styles.previewCard}>
              <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>
                Program Preview
              </ThemedText>
              {selectedTemplate === "ppl" ? (
                <>
                  <PreviewDay
                    day="Mon/Thu"
                    muscles="Push (Chest, Shoulders, Triceps)"
                  />
                  <PreviewDay
                    day="Tue/Fri"
                    muscles="Pull (Back, Biceps, Rear Delts)"
                  />
                  <PreviewDay
                    day="Wed/Sat"
                    muscles="Legs (Quads, Hamstrings, Glutes, Calves)"
                  />
                </>
              ) : selectedTemplate === "upper-lower" ? (
                <>
                  <PreviewDay day="Mon/Thu" muscles="Upper Body" />
                  <PreviewDay day="Tue/Fri" muscles="Lower Body" />
                </>
              ) : selectedTemplate === "bro-split" ? (
                <>
                  <PreviewDay day="Monday" muscles="Chest" />
                  <PreviewDay day="Tuesday" muscles="Back" />
                  <PreviewDay day="Wednesday" muscles="Shoulders" />
                  <PreviewDay day="Thursday" muscles="Arms" />
                  <PreviewDay day="Friday" muscles="Legs" />
                </>
              ) : selectedTemplate === "full-body" ? (
                <>
                  <PreviewDay day="Mon/Wed/Fri" muscles="Full Body" />
                </>
              ) : selectedTemplate === "arnold" ? (
                <>
                  <PreviewDay day="Mon/Thu" muscles="Chest & Back" />
                  <PreviewDay day="Tue/Fri" muscles="Shoulders & Arms" />
                  <PreviewDay day="Wed/Sat" muscles="Legs" />
                </>
              ) : null}
              <ThemedText
                type="small"
                style={{ color: theme.textSecondary, marginTop: Spacing.md }}
              >
                AI will generate your specific exercises based on your
                experience level and goals
              </ThemedText>
            </Card>
          )}
        </AnimatedView>
      </ScrollView>

      <View
        style={[styles.footer, { paddingBottom: insets.bottom + Spacing.lg }]}
      >
        <Button
          onPress={handleContinue}
          disabled={!canContinue}
          testID="button-continue"
        >
          Continue
        </Button>
      </View>
    </View>
  );
}

function PreviewDay({ day, muscles }: { day: string; muscles: string }) {
  const { theme } = useTheme();
  return (
    <View style={styles.previewDay}>
      <ThemedText type="body" style={{ fontWeight: "600", minWidth: 80 }}>
        {day}
      </ThemedText>
      <ThemedText type="body" style={{ color: theme.textSecondary }}>
        {muscles}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  progressContainer: {
    flex: 1,
    marginHorizontal: Spacing.lg,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.dark.primary,
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    marginBottom: Spacing.xl,
  },
  templateGrid: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  templateCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    position: "relative",
  },
  templateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  daysBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  checkmark: {
    position: "absolute",
    top: Spacing.md,
    right: Spacing.md,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.dark.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  daysGrid: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  dayChip: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
  },
  dayCard: {
    marginBottom: Spacing.md,
  },
  musclesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  muscleChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  previewCard: {},
  previewDay: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
});
