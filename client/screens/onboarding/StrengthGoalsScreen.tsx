import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Pressable, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInUp } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";

const AnimatedView = Animated.createAnimatedComponent(View);
import { Button } from "@/components/Button";
import { NeonButton } from "@/components/NeonButton";
import { Card } from "@/components/Card";
import { ProgressIndicator } from "@/components/ProgressIndicator";

import { WireframeGraphic } from "@/components/WireframeGraphic";
import { GlowingPanel } from "@/components/GlowingPanel";
import { OnboardingLayout } from "@/components/OnboardingLayout";
import { useOnboarding } from "@/context/OnboardingContext";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import type { StrengthGoals } from "@/types/onboarding";

const LIFTS = [
  {
    id: "bench",
    name: "Bench Press",
    icon: "activity",
    unit: "lbs",
    increment: 5,
    color: Colors.dark.neonOrange,
  },
  {
    id: "squat",
    name: "Squat",
    icon: "arrow-down",
    unit: "lbs",
    increment: 10,
    color: Colors.dark.neonCyan,
  },
  {
    id: "deadlift",
    name: "Deadlift",
    icon: "arrow-up",
    unit: "lbs",
    increment: 10,
    color: Colors.dark.neonOrange,
  },
  {
    id: "ohp",
    name: "Overhead Press",
    icon: "chevrons-up",
    unit: "lbs",
    increment: 5,
    color: Colors.dark.neonGreen,
  },
  {
    id: "pullups",
    name: "Pull-ups",
    icon: "maximize-2",
    unit: "reps",
    increment: 1,
    color: Colors.dark.neonPink,
  },
];

const getDefaultValues = (
  bodyWeight: number,
  experienceLevel: string,
  sex: string,
): Record<string, { current: number; target: number }> => {
  const bw = bodyWeight || 175;
  const isMale = sex !== "female";

  let currentMultipliers = { bench: 0.8, squat: 1.0, deadlift: 1.2, ohp: 0.5 };
  let targetMultipliers = {
    bench: 1.25,
    squat: 1.75,
    deadlift: 2.0,
    ohp: 0.75,
  };
  let pullupCurrent = 5;
  let pullupTarget = 12;

  if (experienceLevel === "beginner") {
    currentMultipliers = { bench: 0.5, squat: 0.6, deadlift: 0.8, ohp: 0.35 };
    targetMultipliers = { bench: 1.0, squat: 1.25, deadlift: 1.5, ohp: 0.6 };
    pullupCurrent = 2;
    pullupTarget = 10;
  } else if (experienceLevel === "advanced") {
    currentMultipliers = { bench: 1.25, squat: 1.5, deadlift: 1.75, ohp: 0.75 };
    targetMultipliers = { bench: 1.5, squat: 2.0, deadlift: 2.5, ohp: 1.0 };
    pullupCurrent = 12;
    pullupTarget = 20;
  }

  if (!isMale) {
    currentMultipliers = {
      bench: currentMultipliers.bench * 0.6,
      squat: currentMultipliers.squat * 0.7,
      deadlift: currentMultipliers.deadlift * 0.7,
      ohp: currentMultipliers.ohp * 0.55,
    };
    targetMultipliers = {
      bench: targetMultipliers.bench * 0.6,
      squat: targetMultipliers.squat * 0.7,
      deadlift: targetMultipliers.deadlift * 0.7,
      ohp: targetMultipliers.ohp * 0.55,
    };
    pullupCurrent = Math.max(1, Math.round(pullupCurrent * 0.5));
    pullupTarget = Math.round(pullupTarget * 0.6);
  }

  const roundTo = (val: number, nearest: number) =>
    Math.round(val / nearest) * nearest;

  return {
    bench: {
      current: roundTo(bw * currentMultipliers.bench, 5),
      target: roundTo(bw * targetMultipliers.bench, 5),
    },
    squat: {
      current: roundTo(bw * currentMultipliers.squat, 10),
      target: roundTo(bw * targetMultipliers.squat, 10),
    },
    deadlift: {
      current: roundTo(bw * currentMultipliers.deadlift, 10),
      target: roundTo(bw * targetMultipliers.deadlift, 10),
    },
    ohp: {
      current: roundTo(bw * currentMultipliers.ohp, 5),
      target: roundTo(bw * targetMultipliers.ohp, 5),
    },
    pullups: { current: pullupCurrent, target: pullupTarget },
  };
};


export default function StrengthGoalsScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const { profile, updateProfile } = useOnboarding();

  const defaultValues = getDefaultValues(
    profile.weight || 175,
    profile.experienceLevel || "intermediate",
    profile.sex || "male",
  );

  const [goals, setGoals] = useState<StrengthGoals>(
    profile.strengthGoals || {
      bench: defaultValues.bench,
      squat: defaultValues.squat,
      deadlift: defaultValues.deadlift,
      ohp: defaultValues.ohp,
      pullups: defaultValues.pullups,
    },
  );

  const adjustValue = (
    liftId: string,
    type: "current" | "target",
    delta: number,
  ) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setGoals((prev) => {
      const lift = prev[liftId as keyof StrengthGoals];
      const newValue = Math.max(0, lift[type] + delta);
      return {
        ...prev,
        [liftId]: {
          ...lift,
          [type]: newValue,
        },
      };
    });
  };

  const handleContinue = () => {
    updateProfile({ strengthGoals: goals });
    navigation.navigate("Health");
  };

  return (
    <OnboardingLayout
      step={4}
      title="Establish Strength Baselines"
      onContinue={handleContinue}
      contentStyle={styles.contentOverride}
    >
      <WireframeGraphic type="barbell" size={200} opacity={0.1} style={styles.wireframe} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <GlowingPanel glowColor={Colors.dark.neonCyan} style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <ThemedText type="small" style={styles.tableHeaderText} uppercase>
              Lift
            </ThemedText>
            <ThemedText type="small" style={styles.tableHeaderText} uppercase>
              Current (lbs)
            </ThemedText>
            <ThemedText type="small" style={styles.tableHeaderText} uppercase>
              Target (lbs)
            </ThemedText>
          </View>

          {LIFTS.map((lift) => {
            const liftGoals = goals[lift.id as keyof StrengthGoals];
            return (
              <View key={lift.id} style={styles.tableRow}>
                <View style={styles.liftCell}>
                  <View
                    style={[
                      styles.liftIcon,
                      { backgroundColor: lift.color + "20", borderColor: lift.color + "40" },
                    ]}
                  >
                    <Feather name={lift.icon as any} size={24} color={lift.color} />
                  </View>
                  <ThemedText type="small" style={styles.liftName}>
                    {lift.name}
                  </ThemedText>
                </View>
                <View style={styles.inputCell}>
                  <TextInput
                    style={[
                      styles.tableInput,
                      {
                        backgroundColor: theme.backgroundSecondary,
                        color: theme.text,
                        borderColor: Colors.dark.neonCyan + "40",
                        borderWidth: 1,
                      },
                    ]}
                    value={liftGoals.current.toString()}
                    onChangeText={(text) => {
                      const num = parseInt(text.replace(/[^0-9]/g, "")) || 0;
                      adjustValue(lift.id, "current", num - liftGoals.current);
                    }}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={theme.textSecondary}
                  />
                </View>
                <View style={styles.inputCell}>
                  <TextInput
                    style={[
                      styles.tableInput,
                      {
                        backgroundColor: theme.backgroundSecondary,
                        color: theme.text,
                        borderColor: Colors.dark.neonCyan + "40",
                        borderWidth: 1,
                      },
                    ]}
                    value={liftGoals.target.toString()}
                    onChangeText={(text) => {
                      const num = parseInt(text.replace(/[^0-9]/g, "")) || 0;
                      adjustValue(lift.id, "target", num - liftGoals.target);
                    }}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={theme.textSecondary}
                  />
                </View>
              </View>
            );
          })}
        </GlowingPanel>
      </ScrollView>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentOverride: {
    paddingHorizontal: 0, // Let scrollview handle padding if needed or adjust
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  progressContainer: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.dark.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  osVersion: {
    alignSelf: "center",
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  wireframe: {
    position: "absolute",
    top: 100,
    right: -50,
    opacity: 0.1,
    zIndex: 0,
  },
  title: {
    marginBottom: Spacing.xs,
    textAlign: "center",
  },
  subtitle: {
    marginBottom: Spacing.xl,
    textAlign: "center",
  },
  tableContainer: {
    marginBottom: Spacing.xl,
  },
  tableHeader: {
    flexDirection: "row",
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.panelBorder,
    marginBottom: Spacing.md,
  },
  tableHeaderText: {
    flex: 1,
    fontWeight: "700",
    fontSize: 11,
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.panelBorder + "40",
  },
  liftCell: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  liftIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  liftName: {
    fontWeight: "600",
    fontSize: 13,
  },
  inputCell: {
    flex: 1,
    paddingHorizontal: Spacing.xs,
  },
  tableInput: {
    height: 40,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
  },
});
