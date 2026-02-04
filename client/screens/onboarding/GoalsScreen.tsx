import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";

const AnimatedView = Animated.createAnimatedComponent(View);
import { Button } from "@/components/Button";
import { NeonButton } from "@/components/NeonButton";
import { Card } from "@/components/Card";
import { ProgressIndicator } from "@/components/ProgressIndicator";

import { useOnboarding } from "@/context/OnboardingContext";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

const GOALS = [
  {
    id: "cut",
    name: "CUT",
    description: "Lose body fat while preserving muscle mass",
    icon: "trending-down",
    color: Colors.dark.neonCyan,
    iconType: "lean",
  },
  {
    id: "bulk",
    name: "BULK",
    description: "Maximize muscle growth with a caloric surplus",
    icon: "trending-up",
    color: Colors.dark.neonOrange,
    iconType: "muscular",
  },
  {
    id: "recomp",
    name: "RECOMP",
    description: "Build muscle while losing fat simultaneously",
    icon: "refresh-cw",
    color: Colors.dark.neonPink,
    iconType: "balance",
  },
  {
    id: "maintain",
    name: "MAINTAIN",
    description: "Keep current physique while improving strength",
    icon: "minus",
    color: Colors.dark.neonGreen,
    iconType: "outstretched",
  },
] as const;

const EXPERIENCE_LEVELS = [
  {
    id: "beginner",
    name: "Beginner",
    description: "Less than 1 year of consistent training",
  },
  {
    id: "intermediate",
    name: "Intermediate",
    description: "1-3 years of consistent training",
  },
  {
    id: "advanced",
    name: "Advanced",
    description: "3+ years of serious, structured training",
  },
  {
    id: "elite",
    name: "Elite/Competitor",
    description: "Competitive bodybuilding or physique experience",
  },
] as const;

export default function GoalsScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const { profile, updateProfile, getProgressForStep } = useOnboarding();
  const progress = getProgressForStep("goals");

  const [goal, setGoal] = useState<(typeof GOALS)[number]["id"]>(
    profile.goal || "recomp",
  );
  const [experience, setExperience] = useState<
    (typeof EXPERIENCE_LEVELS)[number]["id"]
  >(profile.experienceLevel || "intermediate");
  const [targetWeight, setTargetWeight] = useState(
    profile.targetWeight?.toString() || "",
  );

  const handleContinue = () => {
    updateProfile({
      goal,
      experienceLevel: experience,
      targetWeight: targetWeight ? parseFloat(targetWeight) : undefined,
    });
    navigation.navigate("StrengthGoals");
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>

      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Pressable onPress={handleBack} hitSlop={8}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </Pressable>
        <View style={{ flex: 1 }} />
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <AnimatedView entering={FadeInUp.duration(350)}>
          <ThemedText type="small" style={styles.osVersion} glow glowColor={Colors.dark.neonCyan}>
            FITSYNC OS v2.0
          </ThemedText>
          <ProgressIndicator currentStep={3} totalSteps={6} />
          <ThemedText type="h2" style={styles.title} glow glowColor={Colors.dark.neonCyan} uppercase>
            Define Your Mission
          </ThemedText>

          <ThemedText
            type="body"
            style={[styles.subtitle, { color: theme.textSecondary }]}
          >
            This determines your training and nutrition approach
          </ThemedText>

          <View style={styles.optionsGrid}>
            {GOALS.map((g) => (
              <Pressable
                key={g.id}
                onPress={() => setGoal(g.id)}
                style={[
                  styles.goalOption,
                  {
                    backgroundColor: goal === g.id ? g.color + "20" : Colors.dark.panelBackground,
                    borderColor: goal === g.id ? g.color : Colors.dark.panelBorder,
                    borderWidth: goal === g.id ? 2 : 1,
                  },
                ]}
              >
                <View
                  style={[
                    styles.goalIcon,
                    {
                      backgroundColor: goal === g.id ? g.color + "30" : g.color + "10",
                      borderColor: g.color,
                      borderWidth: 1,
                    },
                  ]}
                >
                  <Feather
                    name={g.icon as any}
                    size={32}
                    color={g.color}
                  />
                </View>
                <ThemedText
                  type="body"
                  style={{
                    fontWeight: "700",
                    color: goal === g.id ? g.color : theme.text,
                  }}
                  glow={goal === g.id}
                  glowColor={g.color}
                >
                  {g.name}
                </ThemedText>
              </Pressable>
            ))}
          </View>

          {goal === "cut" || goal === "bulk" ? (
            <Card elevation={2} style={styles.targetCard}>
              <ThemedText
                type="body"
                style={{ fontWeight: "600", marginBottom: Spacing.sm }}
              >
                Target Weight (optional)
              </ThemedText>
              <View style={styles.inputWithUnit}>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.backgroundSecondary,
                      color: theme.text,
                    },
                  ]}
                  value={targetWeight}
                  onChangeText={setTargetWeight}
                  keyboardType="decimal-pad"
                  placeholder="185"
                  placeholderTextColor={theme.textSecondary}
                />
                <View
                  style={[
                    styles.unitButton,
                    { backgroundColor: theme.backgroundTertiary },
                  ]}
                >
                  <ThemedText type="small">
                    {profile.weightUnit || "lbs"}
                  </ThemedText>
                </View>
              </View>
            </Card>
          ) : null}

          <ThemedText type="h3" style={styles.sectionTitle} uppercase>
            Training Experience
          </ThemedText>

          <View style={styles.experienceSlider}>
            <View style={styles.sliderTrack}>
              {EXPERIENCE_LEVELS.map((e, index) => {
                const isSelected = experience === e.id;
                const segmentIndex = EXPERIENCE_LEVELS.findIndex((exp) => exp.id === experience);
                return (
                  <Pressable
                    key={e.id}
                    onPress={() => setExperience(e.id)}
                    hitSlop={{ top: 20, bottom: 20 }}
                    style={[
                      styles.sliderSegment,
                      {
                        backgroundColor: index <= segmentIndex
                          ? Colors.dark.neonCyan
                          : "rgba(255, 255, 255, 0.1)",
                      },
                    ]}
                  />
                );
              })}
            </View>
            <View style={styles.experienceLabels}>
              {EXPERIENCE_LEVELS.map((e) => (
                <Pressable key={e.id} onPress={() => setExperience(e.id)} hitSlop={10}>
                  <ThemedText
                    type="small"
                    style={[
                      styles.experienceLabel,
                      {
                        color:
                          experience === e.id
                            ? Colors.dark.neonCyan
                            : theme.textSecondary,
                      },
                    ]}
                    uppercase
                    glow={experience === e.id}
                    glowColor={Colors.dark.neonCyan}
                  >
                    {e.name}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </View>
        </AnimatedView>
      </ScrollView>

      <View
        style={[styles.footer, { paddingBottom: insets.bottom + Spacing.lg }]}
      >
        <NeonButton title="Next Step" onPress={handleContinue} />
      </View>
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
  osVersion: {
    alignSelf: "center",
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  title: {
    marginBottom: Spacing.xs,
    textAlign: "center",
  },
  subtitle: {
    marginBottom: Spacing.xl,
    textAlign: "center",
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
    justifyContent: "space-between",
  },
  goalOption: {
    width: "47%",
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    gap: Spacing.sm,
    minHeight: 160,
    justifyContent: "center",
  },
  goalIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  targetCard: {
    marginBottom: Spacing.xl,
  },
  inputWithUnit: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    height: 52,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    fontSize: 18,
    fontWeight: "600",
  },
  unitButton: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  experienceSlider: {
    marginBottom: Spacing.xl,
  },
  sliderTrack: {
    flexDirection: "row",
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: Spacing.md,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  sliderSegment: {
    flex: 1,
    height: "100%",
  },
  experienceLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  experienceLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
});
