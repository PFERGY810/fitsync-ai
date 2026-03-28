import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { useOnboarding } from "@/context/OnboardingContext";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import {
  DEFAULT_CALORIE_MULTIPLIER,
  DEFAULT_FAT_MULTIPLIER,
  DEFAULT_PROTEIN_MULTIPLIER,
  KG_TO_LB,
} from "@/constants/nutrition";
import { getApiUrl } from "@/lib/query-client";
import { getPhysiqueAnalysis } from "@/lib/storage";

interface CalculationStep {
  step: string;
  formula?: string;
  result?: number;
  explanation: string;
}

interface MacroTargets {
  trainingDay: {
    calories: number;
    protein: { grams: number; perLbLBM: number; percentage: number };
    carbs: { grams: number; percentage: number };
    fat: { grams: number; percentage: number };
    fiber: number;
  };
  restDay: {
    calories: number;
    protein: { grams: number; perLbLBM: number; percentage: number };
    carbs: { grams: number; percentage: number };
    fat: { grams: number; percentage: number };
    fiber: number;
  };
}

interface Supplement {
  name: string;
  dose: string;
  timing: string;
  priority: string;
}

interface MedicationImpacts {
  dietNotes: string[];
  trainingNotes: string[];
  volumeMultiplier: number;
  criticalNotes: string[];
}

interface ComprehensiveMacros {
  calculationSteps: CalculationStep[];
  macroTargets: MacroTargets;
  mealTiming: {
    mealsPerDay: number;
    preWorkout: { timing: string; macros: string; notes: string };
    postWorkout: { timing: string; macros: string; notes: string };
    beforeBed?: { macros: string; notes: string };
  };
  hydration: {
    baseWater: string;
    adjustments: string;
    electrolytes: string;
  };
  supplements: Supplement[];
  protocolNotes: string[];
  methodology: string;
  medicationImpacts?: MedicationImpacts;
}

export default function MacroCalculationScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const { profile, updateProfile, getProgressForStep } = useOnboarding();
  const progress = getProgressForStep("macro-calculation");

  const [loading, setLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState("Initializing AI analysis...");
  const [comprehensiveMacros, setComprehensiveMacros] =
    useState<ComprehensiveMacros | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    calculateComprehensiveMacros();
  }, []);

  const calculateComprehensiveMacros = async () => {
    try {
      setLoadingStep("Loading physique analysis data...");
      const physiqueAnalysis = await getPhysiqueAnalysis();

      setLoadingStep("Analyzing cycle protocol effects...");
      await new Promise((r) => setTimeout(r, 800));

      setLoadingStep("Calculating basal metabolic rate...");
      await new Promise((r) => setTimeout(r, 600));

      setLoadingStep("Computing total daily energy expenditure...");
      await new Promise((r) => setTimeout(r, 600));

      setLoadingStep("Applying goal-specific adjustments...");
      await new Promise((r) => setTimeout(r, 500));

      setLoadingStep("AI is calculating your personalized macros...");

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000);

      const response = await fetch(
        new URL("/api/coach/comprehensive-macros", getApiUrl()).toString(),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            profile,
            profileId: (profile as any)?.id,
            userId: (profile as any)?.userId,
            physiqueAnalysis,
            compoundResearch: profile.compoundResearch,
          }),
          signal: controller.signal,
        },
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error("Failed to calculate macros");
      }

      const data = await response.json();
      setComprehensiveMacros(data);

      const trainingMacros = data.macroTargets?.trainingDay;
      if (
        trainingMacros?.calories !== undefined &&
        trainingMacros?.protein?.grams !== undefined &&
        trainingMacros?.carbs?.grams !== undefined &&
        trainingMacros?.fat?.grams !== undefined
      ) {
        updateProfile({
          calculatedMacros: {
            calories: trainingMacros.calories,
            protein: trainingMacros.protein.grams,
            carbs: trainingMacros.carbs.grams,
            fat: trainingMacros.fat.grams,
            methodology: data.methodology || "AI-Comprehensive Analysis",
            trainingDayCalories: trainingMacros.calories,
            restDayCalories: data.macroTargets?.restDay?.calories,
          },
        });
      } else {
        setError("Macro calculation incomplete. Please retry.");
      }
    } catch (err: any) {
      console.error("Error calculating comprehensive macros:", err);
      if (err.name === "AbortError") {
        setError("Request timed out. Using estimated values.");
      } else {
        setError("Could not complete AI analysis. Using standard calculation.");
      }

      if (!profile.weight) {
        setError("Missing weight data. Update your profile and retry.");
        return;
      }
      const weight = profile.weight;
      const weightLbs =
        profile.weightUnit === "kg" ? weight * KG_TO_LB : weight;
      const calories = Math.round(weightLbs * DEFAULT_CALORIE_MULTIPLIER);
      const protein = Math.round(weightLbs * DEFAULT_PROTEIN_MULTIPLIER);
      const fat = Math.round(weightLbs * DEFAULT_FAT_MULTIPLIER);
      const carbs = Math.round((calories - protein * 4 - fat * 9) / 4);

      updateProfile({
        calculatedMacros: {
          calories,
          protein,
          carbs,
          fat,
          methodology: "Standard Calculation (AI unavailable)",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    navigation.navigate("TrainingProgram");
  };

  const handleBack = () => {
    navigation.goBack();
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
        <LinearGradient
          colors={["rgba(255, 69, 0, 0.15)", "transparent"]}
          style={styles.gradient}
        />
        <ActivityIndicator size="large" color={Colors.dark.primary} />
        <ThemedText
          type="h3"
          style={{ marginTop: Spacing.xl, textAlign: "center" }}
        >
          Calculating Your Macros
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
          {loadingStep}
        </ThemedText>
        <View style={styles.loadingSteps}>
          <LoadingStepIndicator
            label="Physique analysis"
            done={loadingStep !== "Loading physique analysis data..."}
          />
          <LoadingStepIndicator
            label="Cycle protocol effects"
            done={!loadingStep.includes("cycle")}
          />
          <LoadingStepIndicator
            label="BMR calculation"
            done={!loadingStep.includes("basal")}
          />
          <LoadingStepIndicator
            label="TDEE computation"
            done={!loadingStep.includes("energy")}
          />
          <LoadingStepIndicator
            label="AI macro optimization"
            done={!loadingStep.includes("personalized")}
          />
        </View>
      </View>
    );
  }

  const trainingMacros = comprehensiveMacros?.macroTargets?.trainingDay;
  const restMacros = comprehensiveMacros?.macroTargets?.restDay;
  const steps = comprehensiveMacros?.calculationSteps || [];

  const displayCalories =
    trainingMacros?.calories ?? profile.calculatedMacros?.calories;
  const displayProtein =
    trainingMacros?.protein?.grams ?? profile.calculatedMacros?.protein;
  const displayCarbs =
    trainingMacros?.carbs?.grams ?? profile.calculatedMacros?.carbs;
  const displayFat =
    trainingMacros?.fat?.grams ?? profile.calculatedMacros?.fat;

  const proteinPercent =
    displayCalories && displayProtein
      ? Math.round(((displayProtein * 4) / displayCalories) * 100)
      : 0;
  const carbsPercent =
    displayCalories && displayCarbs
      ? Math.round(((displayCarbs * 4) / displayCalories) * 100)
      : 0;
  const fatPercent =
    displayCalories && displayFat
      ? Math.round(((displayFat * 9) / displayCalories) * 100)
      : 0;

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
        <ThemedText type="h2" style={styles.title}>
          Your AI-Optimized Macros
        </ThemedText>
        <ThemedText
          type="body"
          style={[styles.subtitle, { color: theme.textSecondary }]}
        >
          {comprehensiveMacros
            ? "Comprehensive calculation using all your data"
            : "Calculated for your goals"}
        </ThemedText>

        {error ? (
          <Card
            elevation={1}
            style={[styles.errorCard, { borderColor: Colors.dark.primary }]}
          >
            <Feather
              name="alert-circle"
              size={18}
              color={Colors.dark.primary}
            />
            <ThemedText
              type="body"
              style={{
                marginLeft: Spacing.sm,
                flex: 1,
                color: theme.textSecondary,
              }}
            >
              {error}
            </ThemedText>
          </Card>
        ) : null}

        {steps.length > 0 ? (
          <Card elevation={2} style={styles.calculationCard}>
            <View style={styles.cardHeader}>
              <Feather name="cpu" size={18} color={Colors.dark.primary} />
              <ThemedText
                type="body"
                style={{ fontWeight: "700", marginLeft: Spacing.sm }}
              >
                AI Calculation Breakdown
              </ThemedText>
            </View>
            {steps.slice(0, 5).map((step, i) => (
              <View key={i} style={styles.stepRow}>
                <View style={styles.stepNumber}>
                  <ThemedText
                    type="small"
                    style={{ color: Colors.dark.primary, fontWeight: "700" }}
                  >
                    {i + 1}
                  </ThemedText>
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText type="body" style={{ fontWeight: "600" }}>
                    {step.step}
                  </ThemedText>
                  {step.result ? (
                    <ThemedText
                      type="small"
                      style={{ color: Colors.dark.primary }}
                    >
                      Result: {step.result}
                    </ThemedText>
                  ) : null}
                  <ThemedText
                    type="small"
                    style={{ color: theme.textSecondary }}
                  >
                    {step.explanation}
                  </ThemedText>
                </View>
              </View>
            ))}
          </Card>
        ) : null}

        <Card elevation={2} style={styles.macrosCard}>
          <ThemedText type="h3" style={{ marginBottom: Spacing.lg }}>
            Training Day Targets
          </ThemedText>

          <View style={styles.macroGrid}>
            <View style={styles.macroItem}>
              <View
                style={[
                  styles.macroCircle,
                  { borderColor: Colors.dark.primary },
                ]}
              >
                <ThemedText type="h2" style={{ color: Colors.dark.primary }}>
                  {displayCalories ?? "N/A"}
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  kcal
                </ThemedText>
              </View>
              <ThemedText
                type="body"
                style={{ marginTop: Spacing.sm, fontWeight: "600" }}
              >
                Calories
              </ThemedText>
            </View>
          </View>

          <View style={styles.macroRow}>
            <View style={styles.macroStat}>
              <View
                style={[
                  styles.macroIndicator,
                  { backgroundColor: Colors.dark.protein },
                ]}
              />
              <View style={{ flex: 1 }}>
                <ThemedText type="body" style={{ fontWeight: "600" }}>
                  Protein
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  {displayCalories && displayProtein
                    ? `${proteinPercent}% of calories`
                    : "Not available"}
                </ThemedText>
              </View>
              <ThemedText type="h3" style={{ color: Colors.dark.protein }}>
                {displayProtein !== undefined ? `${displayProtein}g` : "N/A"}
              </ThemedText>
            </View>
          </View>

          <View style={styles.macroRow}>
            <View style={styles.macroStat}>
              <View
                style={[
                  styles.macroIndicator,
                  { backgroundColor: Colors.dark.carbs },
                ]}
              />
              <View style={{ flex: 1 }}>
                <ThemedText type="body" style={{ fontWeight: "600" }}>
                  Carbs
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  {displayCalories && displayCarbs
                    ? `${carbsPercent}% of calories`
                    : "Not available"}
                </ThemedText>
              </View>
              <ThemedText type="h3" style={{ color: Colors.dark.carbs }}>
                {displayCarbs !== undefined ? `${displayCarbs}g` : "N/A"}
              </ThemedText>
            </View>
          </View>

          <View style={styles.macroRow}>
            <View style={styles.macroStat}>
              <View
                style={[
                  styles.macroIndicator,
                  { backgroundColor: Colors.dark.fat },
                ]}
              />
              <View style={{ flex: 1 }}>
                <ThemedText type="body" style={{ fontWeight: "600" }}>
                  Fat
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  {displayCalories && displayFat
                    ? `${fatPercent}% of calories`
                    : "Not available"}
                </ThemedText>
              </View>
              <ThemedText type="h3" style={{ color: Colors.dark.fat }}>
                {displayFat !== undefined ? `${displayFat}g` : "N/A"}
              </ThemedText>
            </View>
          </View>
        </Card>

        {restMacros ? (
          <Card elevation={1} style={styles.restDayCard}>
            <ThemedText
              type="body"
              style={{ fontWeight: "700", marginBottom: Spacing.md }}
            >
              Rest Day Adjustments
            </ThemedText>
            <View style={styles.restDayRow}>
              <ThemedText type="body" style={{ color: theme.textSecondary }}>
                Calories:
              </ThemedText>
              <ThemedText type="body" style={{ fontWeight: "600" }}>
                {restMacros.calories ?? "N/A"} kcal
              </ThemedText>
            </View>
            <View style={styles.restDayRow}>
              <ThemedText type="body" style={{ color: theme.textSecondary }}>
                Carbs:
              </ThemedText>
              <ThemedText type="body" style={{ fontWeight: "600" }}>
                {restMacros.carbs?.grams !== undefined
                  ? `${restMacros.carbs.grams}g`
                  : "N/A"}{" "}
                (reduced)
              </ThemedText>
            </View>
          </Card>
        ) : null}

        {comprehensiveMacros?.mealTiming ? (
          <Card elevation={1} style={styles.timingCard}>
            <View style={styles.cardHeader}>
              <Feather name="clock" size={18} color={Colors.dark.carbs} />
              <ThemedText
                type="body"
                style={{ fontWeight: "700", marginLeft: Spacing.sm }}
              >
                Meal Timing
              </ThemedText>
            </View>
            <View style={styles.timingRow}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Pre-Workout:
              </ThemedText>
              <ThemedText
                type="small"
                style={{ flex: 1, marginLeft: Spacing.sm }}
              >
                {comprehensiveMacros.mealTiming.preWorkout?.macros ||
                  "40g carbs, 30g protein"}
              </ThemedText>
            </View>
            <View style={styles.timingRow}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Post-Workout:
              </ThemedText>
              <ThemedText
                type="small"
                style={{ flex: 1, marginLeft: Spacing.sm }}
              >
                {comprehensiveMacros.mealTiming.postWorkout?.macros ||
                  "60g carbs, 40g protein"}
              </ThemedText>
            </View>
          </Card>
        ) : null}

        {comprehensiveMacros?.hydration ? (
          <Card elevation={1} style={styles.hydrationCard}>
            <View style={styles.cardHeader}>
              <Feather name="droplet" size={18} color="#4FC3F7" />
              <ThemedText
                type="body"
                style={{ fontWeight: "700", marginLeft: Spacing.sm }}
              >
                Hydration
              </ThemedText>
            </View>
            <ThemedText type="body">
              {comprehensiveMacros.hydration.baseWater}
            </ThemedText>
            <ThemedText
              type="small"
              style={{ color: theme.textSecondary, marginTop: Spacing.xs }}
            >
              {comprehensiveMacros.hydration.adjustments}
            </ThemedText>
          </Card>
        ) : null}

        {comprehensiveMacros?.supplements &&
        comprehensiveMacros.supplements.length > 0 ? (
          <Card elevation={1} style={styles.supplementCard}>
            <View style={styles.cardHeader}>
              <Feather name="package" size={18} color={Colors.dark.success} />
              <ThemedText
                type="body"
                style={{ fontWeight: "700", marginLeft: Spacing.sm }}
              >
                Recommended Supplements
              </ThemedText>
            </View>
            {comprehensiveMacros.supplements.slice(0, 4).map((supp, i) => (
              <View key={i} style={styles.supplementRow}>
                <View
                  style={[
                    styles.priorityDot,
                    {
                      backgroundColor:
                        supp.priority === "essential"
                          ? Colors.dark.primary
                          : supp.priority === "important"
                            ? Colors.dark.carbs
                            : theme.textSecondary,
                    },
                  ]}
                />
                <View style={{ flex: 1 }}>
                  <ThemedText type="body" style={{ fontWeight: "600" }}>
                    {supp.name}
                  </ThemedText>
                  <ThemedText
                    type="small"
                    style={{ color: theme.textSecondary }}
                  >
                    {supp.dose} - {supp.timing}
                  </ThemedText>
                </View>
              </View>
            ))}
          </Card>
        ) : null}

        {profile.isOnCycle && profile.cycleInfo?.compounds?.length ? (
          <Card elevation={1} style={styles.summaryCard}>
            <ThemedText
              type="small"
              style={{ color: theme.textSecondary, marginBottom: Spacing.sm }}
            >
              Current Protocol
            </ThemedText>
            {profile.cycleInfo.compounds.map((c: any, i: number) => (
              <ThemedText key={i} type="body" style={{ fontWeight: "500" }}>
                {c.name} - {c.dosageAmount}
                {c.dosageUnit}
              </ThemedText>
            ))}
            <ThemedText
              type="small"
              style={{ color: theme.textSecondary, marginTop: Spacing.sm }}
            >
              Week {profile.cycleInfo.weeksIn} of {profile.cycleInfo.totalWeeks}
            </ThemedText>
          </Card>
        ) : null}

        {comprehensiveMacros?.medicationImpacts &&
        (comprehensiveMacros.medicationImpacts.dietNotes.length > 0 ||
          comprehensiveMacros.medicationImpacts.trainingNotes.length > 0) ? (
          <Card
            elevation={1}
            style={[styles.medsCard, { borderColor: "#9C27B0" }]}
          >
            <View style={styles.cardHeader}>
              <Feather name="alert-triangle" size={18} color="#9C27B0" />
              <ThemedText
                type="body"
                style={{
                  fontWeight: "700",
                  marginLeft: Spacing.sm,
                  color: "#9C27B0",
                }}
              >
                Medication Impacts
              </ThemedText>
            </View>

            {comprehensiveMacros.medicationImpacts.dietNotes.length > 0 ? (
              <View style={styles.medSection}>
                <View style={styles.medSectionHeader}>
                  <Feather
                    name="coffee"
                    size={14}
                    color={theme.textSecondary}
                  />
                  <ThemedText
                    type="small"
                    style={{
                      fontWeight: "600",
                      marginLeft: Spacing.xs,
                      color: theme.text,
                    }}
                  >
                    Diet Adjustments
                  </ThemedText>
                </View>
                {comprehensiveMacros.medicationImpacts.dietNotes
                  .slice(0, 4)
                  .map((note, i) => (
                    <View key={i} style={styles.noteRow}>
                      <View
                        style={[styles.noteDot, { backgroundColor: "#9C27B0" }]}
                      />
                      <ThemedText
                        type="small"
                        style={{ flex: 1, color: theme.textSecondary }}
                      >
                        {note}
                      </ThemedText>
                    </View>
                  ))}
              </View>
            ) : null}

            {comprehensiveMacros.medicationImpacts.trainingNotes.length > 0 ? (
              <View style={[styles.medSection, { marginTop: Spacing.md }]}>
                <View style={styles.medSectionHeader}>
                  <Feather
                    name="activity"
                    size={14}
                    color={theme.textSecondary}
                  />
                  <ThemedText
                    type="small"
                    style={{
                      fontWeight: "600",
                      marginLeft: Spacing.xs,
                      color: theme.text,
                    }}
                  >
                    Training Adjustments
                  </ThemedText>
                </View>
                {comprehensiveMacros.medicationImpacts.trainingNotes
                  .slice(0, 4)
                  .map((note, i) => (
                    <View key={i} style={styles.noteRow}>
                      <View
                        style={[styles.noteDot, { backgroundColor: "#9C27B0" }]}
                      />
                      <ThemedText
                        type="small"
                        style={{ flex: 1, color: theme.textSecondary }}
                      >
                        {note}
                      </ThemedText>
                    </View>
                  ))}
              </View>
            ) : null}

            {comprehensiveMacros.medicationImpacts.volumeMultiplier < 0.98 ? (
              <View
                style={[
                  styles.volumeAdjustment,
                  { backgroundColor: "rgba(156, 39, 176, 0.1)" },
                ]}
              >
                <ThemedText
                  type="small"
                  style={{ color: "#9C27B0", fontWeight: "600" }}
                >
                  Volume Adjustment:{" "}
                  {Math.round(
                    (1 -
                      comprehensiveMacros.medicationImpacts.volumeMultiplier) *
                      100,
                  )}
                  % reduction recommended
                </ThemedText>
              </View>
            ) : null}
          </Card>
        ) : null}

        {comprehensiveMacros?.protocolNotes &&
        comprehensiveMacros.protocolNotes.length > 0 ? (
          <Card
            elevation={1}
            style={[styles.notesCard, { borderColor: Colors.dark.primary }]}
          >
            <View style={styles.cardHeader}>
              <Feather name="info" size={18} color={Colors.dark.primary} />
              <ThemedText
                type="body"
                style={{
                  fontWeight: "700",
                  marginLeft: Spacing.sm,
                  color: Colors.dark.primary,
                }}
              >
                Important Notes
              </ThemedText>
            </View>
            {comprehensiveMacros.protocolNotes.slice(0, 3).map((note, i) => (
              <View key={i} style={styles.noteRow}>
                <View
                  style={[
                    styles.noteDot,
                    { backgroundColor: Colors.dark.primary },
                  ]}
                />
                <ThemedText
                  type="small"
                  style={{ flex: 1, color: theme.textSecondary }}
                >
                  {note}
                </ThemedText>
              </View>
            ))}
          </Card>
        ) : null}
      </ScrollView>

      <View
        style={[styles.footer, { paddingBottom: insets.bottom + Spacing.lg }]}
      >
        <Button onPress={handleContinue} testID="button-complete-setup">
          Complete Setup
        </Button>
      </View>
    </View>
  );
}

function LoadingStepIndicator({
  label,
  done,
}: {
  label: string;
  done: boolean;
}) {
  const { theme } = useTheme();
  return (
    <View style={styles.loadingStepRow}>
      <Feather
        name={done ? "check-circle" : "circle"}
        size={16}
        color={done ? Colors.dark.success : theme.textSecondary}
      />
      <ThemedText
        type="small"
        style={{
          marginLeft: Spacing.sm,
          color: done ? Colors.dark.success : theme.textSecondary,
        }}
      >
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
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    marginBottom: Spacing.xl,
  },
  errorCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
    borderWidth: 1,
    backgroundColor: "rgba(255, 69, 0, 0.05)",
  },
  calculationCard: {
    marginBottom: Spacing.lg,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  stepRow: {
    flexDirection: "row",
    marginBottom: Spacing.md,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 69, 0, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  macrosCard: {
    marginBottom: Spacing.lg,
  },
  macroGrid: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  macroItem: {
    alignItems: "center",
  },
  macroCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  macroRow: {
    marginBottom: Spacing.md,
  },
  macroStat: {
    flexDirection: "row",
    alignItems: "center",
  },
  macroIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: Spacing.md,
  },
  restDayCard: {
    marginBottom: Spacing.lg,
  },
  restDayRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  timingCard: {
    marginBottom: Spacing.lg,
  },
  timingRow: {
    flexDirection: "row",
    marginBottom: Spacing.sm,
  },
  hydrationCard: {
    marginBottom: Spacing.lg,
  },
  supplementCard: {
    marginBottom: Spacing.lg,
  },
  supplementRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.sm,
    marginTop: 6,
  },
  summaryCard: {
    marginBottom: Spacing.lg,
  },
  medsCard: {
    marginBottom: Spacing.lg,
    borderWidth: 1,
    backgroundColor: "rgba(156, 39, 176, 0.05)",
  },
  medSection: {
    marginTop: Spacing.sm,
  },
  medSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  volumeAdjustment: {
    marginTop: Spacing.md,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  notesCard: {
    marginBottom: Spacing.lg,
    borderWidth: 1,
    backgroundColor: "rgba(255, 69, 0, 0.05)",
  },
  noteRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
  },
  noteDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: Spacing.sm,
    marginTop: 5,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  loadingSteps: {
    marginTop: Spacing.xl,
  },
  loadingStepRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
});
