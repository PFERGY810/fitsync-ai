import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
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

import { GlowingPanel } from "@/components/GlowingPanel";
import { useOnboarding } from "@/context/OnboardingContext";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { COMMON_HEALTH_CONDITIONS } from "@/types/onboarding";
import { getApiUrl } from "@/lib/query-client";

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
}

interface MedicationSuggestion {
  name: string;
  source: string;
}

const FREQUENCY_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "twice_daily", label: "2x/day" },
  { value: "three_daily", label: "3x/day" },
  { value: "weekly", label: "Weekly" },
  { value: "as_needed", label: "As needed" },
];

const COMMON_MEDICATIONS = [
  {
    name: "Adderall",
    category: "stimulant",
    defaultDosage: "20mg",
    defaultFreq: "daily",
    icon: "zap",
  },
  {
    name: "Vyvanse",
    category: "stimulant",
    defaultDosage: "30mg",
    defaultFreq: "daily",
    icon: "zap",
  },
  {
    name: "Ritalin",
    category: "stimulant",
    defaultDosage: "10mg",
    defaultFreq: "twice_daily",
    icon: "zap",
  },
  {
    name: "Finasteride",
    category: "hair",
    defaultDosage: "1mg",
    defaultFreq: "daily",
    icon: "droplet",
  },
  {
    name: "Minoxidil (Oral)",
    category: "hair",
    defaultDosage: "2.5mg",
    defaultFreq: "daily",
    icon: "droplet",
  },
  {
    name: "Dutasteride",
    category: "hair",
    defaultDosage: "0.5mg",
    defaultFreq: "daily",
    icon: "droplet",
  },
  {
    name: "Eplerenone",
    category: "bp",
    defaultDosage: "25mg",
    defaultFreq: "daily",
    icon: "heart",
  },
  {
    name: "Lisinopril",
    category: "bp",
    defaultDosage: "10mg",
    defaultFreq: "daily",
    icon: "heart",
  },
  {
    name: "Amlodipine",
    category: "bp",
    defaultDosage: "5mg",
    defaultFreq: "daily",
    icon: "heart",
  },
  {
    name: "Levothyroxine",
    category: "thyroid",
    defaultDosage: "50mcg",
    defaultFreq: "daily",
    icon: "activity",
  },
  {
    name: "Metformin",
    category: "metabolic",
    defaultDosage: "500mg",
    defaultFreq: "twice_daily",
    icon: "activity",
  },
  {
    name: "Melatonin",
    category: "sleep",
    defaultDosage: "3mg",
    defaultFreq: "daily",
    icon: "moon",
  },
  {
    name: "Trazodone",
    category: "sleep",
    defaultDosage: "50mg",
    defaultFreq: "as_needed",
    icon: "moon",
  },
];

export default function HealthScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const { profile, updateProfile, getProgressForStep } = useOnboarding();
  const progress = getProgressForStep("health");

  const [selectedConditions, setSelectedConditions] = useState<string[]>(
    profile.healthConditions || [],
  );
  const [medications, setMedications] = useState<Medication[]>(
    profile.medicationsWithDosage || [],
  );
  const [allergies, setAllergies] = useState(
    profile.allergies?.join(", ") || "",
  );
  const [injuries, setInjuries] = useState(profile.injuries || "");
  const [bloodPressureMeds, setBloodPressureMeds] = useState(
    profile.bloodPressureMedication || false,
  );
  const [hasDoctor, setHasDoctor] = useState(profile.hasDoctor || false);
  const [medicationSearch, setMedicationSearch] = useState("");
  const [medicationSuggestions, setMedicationSuggestions] = useState<
    MedicationSuggestion[]
  >([]);
  const [medicationSearchLoading, setMedicationSearchLoading] = useState(false);

  const toggleCondition = (condition: string) => {
    setSelectedConditions((prev) =>
      prev.includes(condition)
        ? prev.filter((c) => c !== condition)
        : [...prev, condition],
    );
  };

  const addMedication = () => {
    setMedications([
      ...medications,
      { name: "", dosage: "", frequency: "daily" },
    ]);
  };

  const addMedicationFromSearch = (name: string) => {
    const exists = medications.some(
      (med) => med.name.toLowerCase() === name.toLowerCase(),
    );
    if (exists) {
      setMedicationSearch("");
      setMedicationSuggestions([]);
      return;
    }
    setMedications([
      ...medications,
      { name, dosage: "", frequency: "daily" },
    ]);
    setMedicationSearch("");
    setMedicationSuggestions([]);
  };

  const updateMedication = (index: number, updates: Partial<Medication>) => {
    setMedications(
      medications.map((med, i) => (i === index ? { ...med, ...updates } : med)),
    );
  };

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const handleContinue = () => {
    updateProfile({
      healthConditions: selectedConditions,
      medicationsWithDosage: medications.filter((m) => m.name.trim()),
      medications: medications.filter((m) => m.name.trim()).map((m) => m.name),
      allergies: allergies
        ? allergies
          .split(",")
          .map((a) => a.trim())
          .filter(Boolean)
        : [],
      injuries: injuries.trim() || undefined,
      bloodPressureMedication: bloodPressureMeds,
      hasDoctor,
    });
    navigation.navigate("Equipment");
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const [conditionSearch, setConditionSearch] = useState("");

  const filteredConditions = COMMON_HEALTH_CONDITIONS.filter((c) =>
    c.toLowerCase().includes(conditionSearch.toLowerCase()),
  );

  useEffect(() => {
    if (medicationSearch.trim().length < 2) {
      setMedicationSuggestions([]);
      return;
    }

    const handler = setTimeout(async () => {
      try {
        setMedicationSearchLoading(true);
        const response = await fetch(
          new URL(
            `/api/medications/search?q=${encodeURIComponent(
              medicationSearch.trim(),
            )}`,
            getApiUrl(),
          ).toString(),
        );
        if (!response.ok) {
          throw new Error("Failed to fetch medications");
        }
        const data = await response.json();
        setMedicationSuggestions(data.results || []);
      } catch (error) {
        console.error("Medication search error:", error);
        setMedicationSuggestions([]);
      } finally {
        setMedicationSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [medicationSearch]);

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View
        style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      >

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
          keyboardShouldPersistTaps="handled"
        >
          <AnimatedView entering={FadeInUp.duration(350)}>
            <ThemedText type="small" style={styles.osVersion} glow glowColor={Colors.dark.neonCyan}>
              FITSYNC OS v2.0
            </ThemedText>
            <ProgressIndicator currentStep={5} totalSteps={6} />
            <ThemedText type="h2" style={styles.title} glow glowColor={Colors.dark.neonCyan} uppercase>
              Health Profile & Medications
            </ThemedText>

            <Card elevation={2} style={styles.warningCard}>
              <View style={styles.warningHeader}>
                <Feather name="shield" size={20} color={Colors.dark.primary} />
                <ThemedText
                  type="body"
                  style={{ fontWeight: "600", marginLeft: Spacing.sm }}
                >
                  Your data is private
                </ThemedText>
              </View>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {
                  "This information stays on your device and is never shared. It's used only to personalize your recommendations."
                }
              </ThemedText>
            </Card>

            <ThemedText type="h4" style={styles.sectionTitle} uppercase>
              Conditions
            </ThemedText>
            <View style={styles.searchContainer}>
              <Feather name="search" size={18} color={Colors.dark.neonCyan} style={styles.searchIcon} />
              <TextInput
                style={[
                  styles.searchInput,
                  {
                    backgroundColor: theme.backgroundSecondary,
                    color: theme.text,
                    borderColor: Colors.dark.neonCyan + "40",
                    borderWidth: 1,
                  },
                ]}
                placeholder="Search for conditions..."
                placeholderTextColor={theme.textSecondary}
                value={conditionSearch}
                onChangeText={setConditionSearch}
              />
            </View>
            <View style={styles.conditionsGrid}>
              {filteredConditions.map((condition) => (
                <Pressable
                  key={condition}
                  onPress={() => toggleCondition(condition)}
                  style={[
                    styles.conditionChip,
                    {
                      backgroundColor: selectedConditions.includes(condition)
                        ? Colors.dark.neonCyan + "20"
                        : Colors.dark.panelBackground,
                      borderColor: selectedConditions.includes(condition)
                        ? Colors.dark.neonCyan
                        : Colors.dark.neonCyan + "40",
                      borderWidth: 1,
                    },
                  ]}
                >
                  <ThemedText
                    type="small"
                    style={{
                      color: selectedConditions.includes(condition)
                        ? Colors.dark.neonCyan
                        : theme.text,
                    }}
                  >
                    {condition}
                  </ThemedText>
                </Pressable>
              ))}
            </View>

            <ThemedText type="h4" style={styles.sectionTitle} uppercase>
              Medications
            </ThemedText>
            <View style={styles.searchContainer}>
              <Feather
                name="search"
                size={18}
                color={Colors.dark.neonCyan}
                style={styles.searchIcon}
              />
              <TextInput
                style={[
                  styles.searchInput,
                  {
                    backgroundColor: theme.backgroundSecondary,
                    color: theme.text,
                    borderColor: Colors.dark.neonCyan + "40",
                    borderWidth: 1,
                  },
                ]}
                placeholder="Search medications..."
                placeholderTextColor={theme.textSecondary}
                value={medicationSearch}
                onChangeText={setMedicationSearch}
              />
              {medicationSearchLoading ? (
                <ActivityIndicator
                  size="small"
                  color={Colors.dark.neonCyan}
                  style={styles.searchSpinner}
                />
              ) : null}
            </View>
            {medicationSuggestions.length > 0 ? (
              <View style={styles.suggestionList}>
                {medicationSuggestions.slice(0, 6).map((suggestion) => (
                  <Pressable
                    key={suggestion.name}
                    onPress={() => addMedicationFromSearch(suggestion.name)}
                    style={[
                      styles.suggestionItem,
                      { backgroundColor: theme.backgroundSecondary },
                    ]}
                  >
                    <ThemedText type="body" style={{ fontWeight: "600" }}>
                      {suggestion.name}
                    </ThemedText>
                    <ThemedText type="small" style={{ color: theme.textSecondary }}>
                      {suggestion.source}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            ) : null}
            <NeonButton
              title="Add Medication +"
              onPress={addMedication}
              style={styles.addMedButton}
            />

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: Spacing.md }}
            >
              <View style={styles.medicationsRow}>
                {medications.map((med, index) => {
                  const pillColors = [Colors.dark.neonGreen, Colors.dark.neonOrange, Colors.dark.neonPink];
                  const pillColor = pillColors[index % pillColors.length];
                  return (
                    <GlowingPanel
                      key={`med-${med.name || index}`}
                      glowColor={Colors.dark.neonCyan}
                      style={styles.medicationCard}
                    >
                      <View style={styles.medicationContent}>
                        <View
                          style={[
                            styles.pillIcon,
                            { backgroundColor: pillColor + "30", borderColor: pillColor + "60" },
                          ]}
                        >
                          <Feather name="droplet" size={20} color={pillColor} />
                        </View>
                        <View style={styles.medicationInfo}>
                          <TextInput
                            style={[
                              styles.medicationName,
                              {
                                color: theme.text,
                                borderBottomWidth: 1,
                                borderBottomColor: theme.textSecondary + "40",
                                paddingVertical: 2,
                                marginBottom: 4
                              }
                            ]}
                            value={med.name}
                            onChangeText={(text) => updateMedication(index, { name: text })}
                            placeholder="Medication Name"
                            placeholderTextColor={theme.textSecondary}
                          />
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                            <ThemedText type="small" style={{ color: theme.textSecondary, marginRight: 4 }}>
                              Dose:
                            </ThemedText>
                            <TextInput
                              style={{
                                color: theme.textSecondary,
                                borderBottomWidth: 1,
                                borderBottomColor: theme.textSecondary + "40",
                                paddingVertical: 0,
                                minWidth: 40,
                                fontSize: 12
                              }}
                              value={med.dosage}
                              onChangeText={(text) => updateMedication(index, { dosage: text })}
                              placeholder="10mg"
                              placeholderTextColor={theme.textSecondary + "80"}
                            />
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <ThemedText type="small" style={{ color: theme.textSecondary, marginRight: 4 }}>
                              Freq:
                            </ThemedText>
                            <TextInput
                              style={{
                                color: theme.textSecondary,
                                borderBottomWidth: 1,
                                borderBottomColor: theme.textSecondary + "40",
                                paddingVertical: 0,
                                minWidth: 40,
                                fontSize: 12
                              }}
                              value={med.frequency}
                              onChangeText={(text) => updateMedication(index, { frequency: text })}
                              placeholder="Daily"
                              placeholderTextColor={theme.textSecondary + "80"}
                            />
                          </View>
                        </View>
                        <Pressable
                          onPress={() => removeMedication(index)}
                          style={styles.removeMedButton}
                        >
                          <Feather name="x" size={18} color={theme.textSecondary} />
                        </Pressable>
                      </View>
                    </GlowingPanel>
                  );
                })}
              </View>
            </ScrollView>

            <Card elevation={2} style={styles.inputCard}>
              <View style={styles.inputGroup}>
                <ThemedText type="body" style={{ fontWeight: "600" }}>
                  Allergies
                </ThemedText>
                <ThemedText
                  type="small"
                  style={{
                    color: theme.textSecondary,
                    marginBottom: Spacing.sm,
                  }}
                >
                  Food or supplement allergies (separate with commas)
                </ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.backgroundSecondary,
                      color: theme.text,
                    },
                  ]}
                  value={allergies}
                  onChangeText={setAllergies}
                  placeholder="e.g., Shellfish, Lactose"
                  placeholderTextColor={theme.textSecondary}
                  returnKeyType="done"
                />
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.injuryHeader}>
                  <Feather name="alert-triangle" size={16} color={Colors.dark.neonOrange} style={{ marginRight: Spacing.xs }} />
                  <ThemedText type="body" style={{ fontWeight: "600" }}>
                    Injury History
                  </ThemedText>
                </View>
                <ThemedText
                  type="small"
                  style={{
                    color: theme.textSecondary,
                    marginBottom: Spacing.sm,
                  }}
                >
                  Describe any current or past injuries that may affect your training
                </ThemedText>
                <TextInput
                  style={[
                    styles.multilineInput,
                    {
                      backgroundColor: theme.backgroundSecondary,
                      color: theme.text,
                    },
                  ]}
                  value={injuries}
                  onChangeText={setInjuries}
                  placeholder="e.g., Rotator cuff tear 2 years ago - fully healed, Chronic lower back pain, ACL surgery 6 months ago - cleared for training"
                  placeholderTextColor={theme.textSecondary}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </Card>

            <Card elevation={2} style={styles.toggleCard}>
              <Pressable
                onPress={() => setBloodPressureMeds(!bloodPressureMeds)}
                style={styles.toggleRow}
              >
                <View style={styles.toggleContent}>
                  <ThemedText type="body" style={{ fontWeight: "600" }}>
                    On blood pressure medication?
                  </ThemedText>
                  <ThemedText
                    type="small"
                    style={{ color: theme.textSecondary }}
                  >
                    This affects stimulant recommendations
                  </ThemedText>
                </View>
                <View
                  style={[
                    styles.toggle,
                    {
                      backgroundColor: bloodPressureMeds
                        ? Colors.dark.primary
                        : theme.backgroundSecondary,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.toggleKnob,
                      {
                        transform: [{ translateX: bloodPressureMeds ? 20 : 0 }],
                      },
                    ]}
                  />
                </View>
              </Pressable>

              <View
                style={[
                  styles.divider,
                  { backgroundColor: theme.backgroundSecondary },
                ]}
              />

              <Pressable
                onPress={() => setHasDoctor(!hasDoctor)}
                style={styles.toggleRow}
              >
                <View style={styles.toggleContent}>
                  <ThemedText type="body" style={{ fontWeight: "600" }}>
                    Working with a doctor/coach?
                  </ThemedText>
                  <ThemedText
                    type="small"
                    style={{ color: theme.textSecondary }}
                  >
                    Monitoring bloodwork, health markers, etc.
                  </ThemedText>
                </View>
                <View
                  style={[
                    styles.toggle,
                    {
                      backgroundColor: hasDoctor
                        ? Colors.dark.primary
                        : theme.backgroundSecondary,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.toggleKnob,
                      { transform: [{ translateX: hasDoctor ? 20 : 0 }] },
                    ]}
                  />
                </View>
              </Pressable>
            </Card>
          </AnimatedView>
        </ScrollView>

        <View
          style={[styles.footer, { paddingBottom: insets.bottom + Spacing.lg }]}
        >
          <NeonButton title="Next Step" onPress={handleContinue} />
        </View>
      </View>
    </TouchableWithoutFeedback>
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
  warningCard: {
    marginBottom: Spacing.xl,
    backgroundColor: "rgba(255, 69, 0, 0.1)",
  },
  warningHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
    marginTop: Spacing.xl,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
    position: "relative",
  },
  searchIcon: {
    position: "absolute",
    left: Spacing.md,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    height: 44,
    borderRadius: BorderRadius.md,
    paddingLeft: Spacing.xl + Spacing.md,
    paddingRight: Spacing.md,
    fontSize: 14,
  },
  searchSpinner: {
    position: "absolute",
    right: Spacing.md,
  },
  suggestionList: {
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  suggestionItem: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: "transparent",
  },
  conditionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  conditionChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  addMedButton: {
    marginBottom: Spacing.md,
  },
  medicationsRow: {
    flexDirection: "row",
    gap: Spacing.md,
    paddingRight: Spacing.lg,
  },
  medicationCard: {
    minWidth: 180,
    marginRight: Spacing.sm,
  },
  medicationContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  pillIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontWeight: "600",
    marginBottom: 2,
  },
  removeMedButton: {
    padding: Spacing.xs,
  },
  quickMedsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    paddingRight: Spacing.lg,
  },
  quickMedChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },

  medicationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inputCard: {
    marginBottom: Spacing.lg,
    gap: Spacing.lg,
  },

  inputGroup: {
    marginBottom: Spacing.md,
  },
  input: {
    height: 48,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
  },
  multilineInput: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 16,
    minHeight: 100,
  },
  injuryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  freqButtons: {
    flexDirection: "row",
    gap: Spacing.xs,
  },
  freqButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.xs,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderStyle: "dashed",
    marginBottom: Spacing.xl,
  },
  toggleCard: {
    marginBottom: Spacing.lg,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  toggleContent: {
    flex: 1,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 4,
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFF",
  },
  divider: {
    height: 1,
    marginVertical: Spacing.sm,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
});
