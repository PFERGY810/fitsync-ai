import React, { useState, useEffect } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { OnboardingStackParamList } from "@/navigation/OnboardingNavigator";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { useOnboarding } from "@/context/OnboardingContext";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import {
  saveUserProfile,
  saveGeneratedProgram,
  getPhysiqueAnalysis,
} from "@/lib/storage";
import { getApiUrl } from "@/lib/query-client";

interface GeneratedProgram {
  programName: string;
  programNotes: string;
  weeklyVolume: Record<string, number>;
  enhancedProtocol?: boolean;
  periodizationNote?: string;
  schedule: Array<{
    day: number;
    name: string;
    muscleGroups: string[];
    trainingGoal?: string;
    exercises: Array<{
      name: string;
      sets: number;
      repRange: string;
      targetRIR: number;
      tempo: string;
      formCues: string[];
      whatToFeel?: string;
      rationale?: string;
      intensityTechnique?: string | null;
    }>;
  }>;
}

export default function OnboardingCompleteScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { profile } = useOnboarding();
  const navigation =
    useNavigation<NativeStackNavigationProp<OnboardingStackParamList>>();

  const [generating, setGenerating] = useState(true);
  const [generatedProgram, setGeneratedProgram] =
    useState<GeneratedProgram | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [canProceed, setCanProceed] = useState(false);

  useEffect(() => {
    generateAIProgram();
    // Allow proceeding after 5 seconds even if generation hasn't completed
    const proceedTimer = setTimeout(() => {
      setCanProceed(true);
    }, 5000);
    return () => clearTimeout(proceedTimer);
  }, []);

  const generateAIProgram = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const physiqueAnalysis = await getPhysiqueAnalysis();

      const response = await fetch(
        new URL("/api/coach/generate-program", getApiUrl()).toString(),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            profile,
            profileId: (profile as any)?.id,
            userId: (profile as any)?.userId,
            physiqueAnalysis,
            daysPerWeek: profile.trainingProgram?.daysPerWeek,
            splitType: profile.trainingProgram?.templateName,
            compoundResearch: profile.compoundResearch,
          }),
          signal: controller.signal,
        },
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${errorText}`);
      }

      const data = await response.json();
      setGeneratedProgram(data);
      await saveGeneratedProgram(data);
    } catch (err: any) {
      console.error("Error generating program:", err);
      if (err.name === "AbortError") {
        setError("Request timed out. Try again in dashboard.");
      } else {
        setError(
          "Using template program. AI optimization available in dashboard.",
        );
      }
    } finally {
      setGenerating(false);
      setCanProceed(true);
    }
  };

  const handleComplete = async () => {
    // Physique analysis already happened before this screen (if photos existed)
    // Now just save profile and go to main app
    console.log(
      "Saving profile with calculatedMacros:",
      profile.calculatedMacros,
    );

    await saveUserProfile({
      ...profile,
      onboardingComplete: true,
      createdAt: new Date().toISOString(),
    } as any);

    (navigation as any).reset({
      index: 0,
      routes: [{ name: "MainTabs" }],
    });
  };

  const goalLabel = {
    cut: "Cutting",
    bulk: "Bulking",
    recomp: "Body Recomposition",
    maintain: "Maintenance",
  }[profile.goal || "recomp"];

  if (generating && !canProceed) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: theme.backgroundRoot },
        ]}
      >
        <LinearGradient
          colors={["rgba(255, 69, 0, 0.15)", "transparent"]}
          style={styles.gradient}
        />
        <ActivityIndicator size="large" color={Colors.dark.primary} />
        <ThemedText
          type="h3"
          style={{ marginTop: Spacing.xl, textAlign: "center" }}
        >
          Building Your Program
        </ThemedText>
        <ThemedText
          type="body"
          style={{
            color: theme.textSecondary,
            marginTop: Spacing.sm,
            textAlign: "center",
            paddingHorizontal: Spacing.xl,
          }}
        >
          AI is analyzing your stats{profile.isOnCycle ? ", cycle," : ""} and
          goals to create your personalized training split...
        </ThemedText>
        <ThemedText
          type="small"
          style={{
            color: theme.textSecondary,
            marginTop: Spacing.lg,
            textAlign: "center",
            opacity: 0.7,
          }}
        >
          This should only take a few seconds...
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <LinearGradient
        colors={["rgba(255, 69, 0, 0.15)", "transparent"]}
        style={styles.gradient}
      />

      <View style={[styles.content, { paddingTop: insets.top + Spacing.xl }]}>
        <View style={styles.successIcon}>
          <Feather name="check" size={48} color="#FFF" />
        </View>

        <ThemedText type="h1" style={styles.title}>
          {"You're All Set!"}
        </ThemedText>

        <ThemedText
          type="body"
          style={[styles.subtitle, { color: theme.textSecondary }]}
        >
          {generatedProgram
            ? "Your AI-generated program is ready"
            : "Your personalized program is ready"}
        </ThemedText>

        <Card elevation={2} style={styles.summaryCard}>
          <ThemedText type="h4" style={{ marginBottom: Spacing.lg }}>
            Your Profile Summary
          </ThemedText>

          <SummaryRow icon="target" label="Goal" value={goalLabel} />
          <SummaryRow
            icon="bar-chart-2"
            label="Experience"
            value={
              (profile.experienceLevel?.charAt(0).toUpperCase() || "") +
              (profile.experienceLevel?.slice(1) || "") || "Intermediate"
            }
          />
          <SummaryRow
            icon="calendar"
            label="Training"
            value={
              generatedProgram?.programName ||
              `${profile.trainingProgram?.templateName?.toUpperCase() || "Custom"} (${profile.trainingProgram?.daysPerWeek || 4}x/week)`
            }
          />

          {profile.isOnCycle && profile.cycleInfo?.compounds?.length ? (
            <SummaryRow
              icon="activity"
              label="Protocol"
              value={`${profile.cycleInfo.compounds.length} compound${profile.cycleInfo.compounds.length > 1 ? "s" : ""} - Week ${profile.cycleInfo.weeksIn}/${profile.cycleInfo.totalWeeks}`}
            />
          ) : null}

          <View
            style={[
              styles.divider,
              { backgroundColor: theme.backgroundSecondary },
            ]}
          />

          <ThemedText
            type="body"
            style={{ fontWeight: "600", marginBottom: Spacing.md }}
          >
            Daily Targets
          </ThemedText>

          <View style={styles.macrosRow}>
            <MacroCircle
              value={profile.calculatedMacros?.calories}
              label="Calories"
              color={Colors.dark.primary}
            />
            <MacroCircle
              value={profile.calculatedMacros?.protein}
              label="Protein"
              unit="g"
              color={Colors.dark.protein}
            />
            <MacroCircle
              value={profile.calculatedMacros?.carbs}
              label="Carbs"
              unit="g"
              color={Colors.dark.carbs}
            />
            <MacroCircle
              value={profile.calculatedMacros?.fat}
              label="Fat"
              unit="g"
              color={Colors.dark.fat}
            />
          </View>
        </Card>

        {profile.isOnCycle && profile.cycleInfo?.compounds?.length ? (
          <Card
            elevation={1}
            style={[
              styles.programPreview,
              { borderLeftColor: Colors.dark.primary, borderLeftWidth: 3 },
            ]}
          >
            <View style={styles.programHeader}>
              <Feather name="zap" size={18} color={Colors.dark.primary} />
              <ThemedText
                type="body"
                style={{
                  fontWeight: "700",
                  marginLeft: Spacing.sm,
                  color: Colors.dark.primary,
                }}
              >
                Protocol Training Adjustments
              </ThemedText>
            </View>
            <View style={{ gap: Spacing.xs }}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Your program has been adjusted for enhanced recovery:
              </ThemedText>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: Spacing.sm,
                  marginTop: Spacing.sm,
                }}
              >
                <View
                  style={[
                    styles.adjustmentBadge,
                    { backgroundColor: "rgba(16, 185, 129, 0.15)" },
                  ]}
                >
                  <Feather
                    name="trending-up"
                    size={12}
                    color={Colors.dark.success}
                  />
                  <ThemedText
                    type="small"
                    style={{ color: Colors.dark.success, marginLeft: 4 }}
                  >
                    +30-50% Volume
                  </ThemedText>
                </View>
                <View
                  style={[
                    styles.adjustmentBadge,
                    { backgroundColor: "rgba(16, 185, 129, 0.15)" },
                  ]}
                >
                  <Feather
                    name="repeat"
                    size={12}
                    color={Colors.dark.success}
                  />
                  <ThemedText
                    type="small"
                    style={{ color: Colors.dark.success, marginLeft: 4 }}
                  >
                    Higher Frequency
                  </ThemedText>
                </View>
                <View
                  style={[
                    styles.adjustmentBadge,
                    { backgroundColor: "rgba(16, 185, 129, 0.15)" },
                  ]}
                >
                  <Feather name="zap" size={12} color={Colors.dark.success} />
                  <ThemedText
                    type="small"
                    style={{ color: Colors.dark.success, marginLeft: 4 }}
                  >
                    Train Closer to Failure
                  </ThemedText>
                </View>
              </View>
            </View>
          </Card>
        ) : null}

        {generatedProgram &&
          generatedProgram.schedule &&
          generatedProgram.schedule.length > 0 ? (
          <Card elevation={1} style={styles.programPreview}>
            <View style={styles.programHeader}>
              <Feather name="cpu" size={18} color={Colors.dark.primary} />
              <ThemedText
                type="body"
                style={{
                  fontWeight: "700",
                  marginLeft: Spacing.sm,
                  color: Colors.dark.primary,
                }}
              >
                AI-Generated Split
              </ThemedText>
            </View>
            <View style={styles.daysRow}>
              {(generatedProgram.schedule || []).slice(0, 5).map((day, i) => (
                <View key={i} style={styles.dayPreview}>
                  <ThemedText type="small" style={{ fontWeight: "600" }}>
                    Day {day.day}
                  </ThemedText>
                  <ThemedText
                    type="small"
                    style={{ color: theme.textSecondary }}
                  >
                    {day.muscleGroups?.[0] || "Training"}
                  </ThemedText>
                </View>
              ))}
            </View>
          </Card>
        ) : (
          <Card elevation={1} style={styles.aiCard}>
            <Feather name="cpu" size={20} color={Colors.dark.primary} />
            <View style={styles.aiContent}>
              <ThemedText type="body" style={{ fontWeight: "600" }}>
                AI Coach Ready
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {error ||
                  "Your program will adapt based on your daily check-ins"}
              </ThemedText>
            </View>
          </Card>
        )}
      </View>

      <View
        style={[styles.footer, { paddingBottom: insets.bottom + Spacing.xl }]}
      >
        <Button onPress={handleComplete} style={styles.button}>
          Start Training
        </Button>
      </View>
    </View>
  );
}

function SummaryRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  const { theme } = useTheme();
  return (
    <View style={styles.summaryRow}>
      <View style={styles.summaryLabel}>
        <Feather name={icon as any} size={16} color={theme.textSecondary} />
        <ThemedText
          type="body"
          style={{ color: theme.textSecondary, marginLeft: Spacing.sm }}
        >
          {label}
        </ThemedText>
      </View>
      <ThemedText
        type="body"
        style={{ fontWeight: "600", flex: 1, textAlign: "right" }}
      >
        {value}
      </ThemedText>
    </View>
  );
}

function MacroCircle({
  value,
  label,
  unit,
  color,
}: {
  value?: number;
  label: string;
  unit?: string;
  color: string;
}) {
  return (
    <View style={styles.macroCircle}>
      <ThemedText type="h4" style={{ color }}>
        {value !== undefined ? `${value}${unit || ""}` : "N/A"}
      </ThemedText>
      <ThemedText type="small" style={{ color: "rgba(255,255,255,0.6)" }}>
        {label}
      </ThemedText>
    </View>
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
  gradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 300,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    alignItems: "center",
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.dark.success,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  summaryCard: {
    width: "100%",
    marginBottom: Spacing.md,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  summaryLabel: {
    flexDirection: "row",
    alignItems: "center",
  },
  divider: {
    height: 1,
    marginVertical: Spacing.lg,
  },
  macrosRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  macroCircle: {
    alignItems: "center",
  },
  programPreview: {
    width: "100%",
    marginBottom: Spacing.md,
    backgroundColor: "rgba(255, 69, 0, 0.05)",
    borderWidth: 1,
    borderColor: Colors.dark.primary,
  },
  programHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  daysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dayPreview: {
    alignItems: "center",
  },
  aiCard: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
  },
  aiContent: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  adjustmentBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
  },
  button: {
    width: "100%",
  },
});
