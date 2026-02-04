import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  Modal,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { NeonButton } from "@/components/NeonButton";
import { Card } from "@/components/Card";
import { ProgressIndicator } from "@/components/ProgressIndicator";

import { GlowingPanel } from "@/components/GlowingPanel";
import { useOnboarding } from "@/context/OnboardingContext";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import {
  COMPOUND_DATABASE,
  CycleCompound,
  CompoundInfo,
  AdministrationMethod,
  ADMINISTRATION_LABELS,
  FREQUENCY_OPTIONS,
} from "@/types/onboarding";

interface CompoundResearch {
  compoundName: string;
  classification: string;
  mechanismOfAction: string;
  halfLife: string;
  benefits: string[];
  sideEffects: Array<{
    effect: string;
    severity: string;
    frequency: string;
    mitigation: string;
  }>;
  trainingAdjustments: {
    volumeMultiplier: number;
    frequencyMultiplier: number;
    recoveryBoost: string;
    notes: string[];
  };
  nutritionAdjustments: {
    proteinMultiplier: number;
    calorieAdjustment: string;
  };
  overallRisk: string;
  effectiveness: number;
}

const DOSAGE_STEPS: Record<string, number> = {
  mg: 25,
  ml: 0.1,
  iu: 1,
  mcg: 50,
};

export default function CycleStatusScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const { profile, updateProfile, getProgressForStep } = useOnboarding();
  const progress = getProgressForStep("cycle-status");

  const [isOnCycle, setIsOnCycle] = useState(profile.isOnCycle || false);
  const [compounds, setCompounds] = useState<CycleCompound[]>(
    profile.cycleInfo?.compounds || [],
  );
  const [weeksIn, setWeeksIn] = useState(profile.cycleInfo?.weeksIn || 0);
  const [totalWeeks, setTotalWeeks] = useState(
    profile.cycleInfo?.totalWeeks || 12,
  );
  const [pctPlanned, setPctPlanned] = useState(
    profile.cycleInfo?.pctPlanned || false,
  );
  const [showCompoundPicker, setShowCompoundPicker] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [researchingCompounds, setResearchingCompounds] = useState<Set<string>>(
    new Set(),
  );
  const [compoundResearch, setCompoundResearch] = useState<
    Record<string, CompoundResearch>
  >({});
  const [showResearchModal, setShowResearchModal] = useState<string | null>(
    null,
  );
  const [compoundSearch, setCompoundSearch] = useState("");
  const [compoundSuggestions, setCompoundSuggestions] = useState<
    { name: string; source: string; metadata?: Record<string, string> }[]
  >([]);
  const [compoundSearchLoading, setCompoundSearchLoading] = useState(false);

  const categories = [
    { value: "all", label: "All" },
    { value: "testosterone", label: "Test" },
    { value: "19-nor", label: "19-Nor" },
    { value: "dht", label: "DHT" },
    { value: "oral", label: "Orals" },
    { value: "peptide", label: "Peptides" },
    { value: "ai", label: "AI" },
    { value: "pct", label: "PCT" },
  ];

  const filteredCompounds =
    filterCategory === "all"
      ? COMPOUND_DATABASE
      : COMPOUND_DATABASE.filter((c) => c.category === filterCategory);

  const researchCompound = async (compoundName: string) => {
    setResearchingCompounds((prev) => new Set(prev).add(compoundName));

    try {
      const response = await fetch(
        new URL("/api/coach/research-compound", getApiUrl()).toString(),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            compoundName,
            userGoal: profile.goal,
            cycleContext:
              compounds.length > 0
                ? compounds
                  .map((c) => `${c.name} ${c.dosageAmount}${c.dosageUnit}`)
                  .join(", ")
                : undefined,
          }),
        },
      );

      if (response.ok) {
        const research = await response.json();
        setCompoundResearch((prev) => ({ ...prev, [compoundName]: research }));
      }
    } catch (error) {
      console.error("Error researching compound:", error);
    } finally {
      setResearchingCompounds((prev) => {
        const next = new Set(prev);
        next.delete(compoundName);
        return next;
      });
    }
  };

  const addCompound = (compoundInfo: CompoundInfo) => {
    const newCompound: CycleCompound = {
      name: compoundInfo.name,
      dosageAmount: compoundInfo.typicalDosageRange.min,
      dosageUnit: compoundInfo.typicalDosageRange.unit,
      frequency: compoundInfo.defaultAdministration.includes("injection")
        ? "2x_week"
        : "daily",
      administrationMethod: compoundInfo.defaultAdministration,
      esterType: compoundInfo.defaultEster,
      halfLife: compoundInfo.halfLife,
      timeOfDay: "any",
    };
    setCompounds([...compounds, newCompound]);
    setShowCompoundPicker(false);

    researchCompound(compoundInfo.name);
  };

  const addCompoundFromSearch = (name: string) => {
    const exists = compounds.some(
      (compound) => compound.name.toLowerCase() === name.toLowerCase(),
    );
    if (exists) {
      setCompoundSearch("");
      setCompoundSuggestions([]);
      return;
    }
    const newCompound: CycleCompound = {
      name,
      dosageAmount: 0,
      dosageUnit: "mg",
      frequency: "weekly",
      administrationMethod: "oral",
      timeOfDay: "any",
    };
    setCompounds([...compounds, newCompound]);
    setCompoundSearch("");
    setCompoundSuggestions([]);
    researchCompound(name);
  };

  const updateCompound = (index: number, updates: Partial<CycleCompound>) => {
    setCompounds((prev) =>
      prev.map((c, i) => (i === index ? { ...c, ...updates } : c)),
    );
  };

  const removeCompound = (index: number) => {
    setCompounds((prev) => prev.filter((_, i) => i !== index));
  };

  const adjustDosage = (index: number, increment: boolean) => {
    const compound = compounds[index];
    const step = DOSAGE_STEPS[compound.dosageUnit] || 25;
    const newDosage = increment
      ? compound.dosageAmount + step
      : Math.max(0, compound.dosageAmount - step);
    updateCompound(index, { dosageAmount: Math.round(newDosage * 10) / 10 });
  };

  const handleContinue = () => {
    updateProfile({
      isOnCycle,
      cycleInfo: isOnCycle
        ? {
          compounds,
          weeksIn,
          totalWeeks,
          pctPlanned,
        }
        : undefined,
    });
    navigation.navigate("MacroCalculation");
  };

  const handleBack = () => {
    navigation.goBack();
  };

  useEffect(() => {
    if (compoundSearch.trim().length < 2) {
      setCompoundSuggestions([]);
      return;
    }

    const handler = setTimeout(async () => {
      try {
        setCompoundSearchLoading(true);
        const response = await fetch(
          new URL(
            `/api/compounds/search?q=${encodeURIComponent(
              compoundSearch.trim(),
            )}`,
            getApiUrl(),
          ).toString(),
        );
        if (!response.ok) {
          throw new Error("Failed to fetch compounds");
        }
        const data = await response.json();
        setCompoundSuggestions(data.results || []);
      } catch (error) {
        console.error("Compound search error:", error);
        setCompoundSuggestions([]);
      } finally {
        setCompoundSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [compoundSearch]);

  const renderCompoundCard = (compound: CycleCompound, index: number) => {
    const isResearching = researchingCompounds.has(compound.name);
    const research = compoundResearch[compound.name];

    return (
      <Card key={index} elevation={1} style={styles.compoundCard}>
        <View style={styles.compoundHeader}>
          <View style={{ flex: 1 }}>
            <ThemedText type="body" style={{ fontWeight: "700" }}>
              {compound.name}
            </ThemedText>
            {compound.halfLife ? (
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Half-life: {compound.halfLife}
              </ThemedText>
            ) : null}
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: Spacing.sm,
            }}
          >
            {isResearching ? (
              <View style={styles.researchBadge}>
                <ActivityIndicator size="small" color={Colors.dark.primary} />
                <ThemedText
                  type="small"
                  style={{ color: Colors.dark.primary, marginLeft: 4 }}
                >
                  Researching...
                </ThemedText>
              </View>
            ) : research ? (
              <Pressable
                onPress={() => setShowResearchModal(compound.name)}
                style={[
                  styles.researchBadge,
                  { backgroundColor: Colors.dark.success + "20" },
                ]}
              >
                <Feather
                  name="book-open"
                  size={14}
                  color={Colors.dark.success}
                />
                <ThemedText
                  type="small"
                  style={{ color: Colors.dark.success, marginLeft: 4 }}
                >
                  View Research
                </ThemedText>
              </Pressable>
            ) : null}
            <Pressable
              onPress={() => removeCompound(index)}
              hitSlop={12}
              style={styles.deleteButton}
            >
              <Feather name="x" size={20} color={Colors.dark.error} />
            </Pressable>
          </View>
        </View>

        {research ? (
          <View
            style={[
              styles.researchSummary,
              { backgroundColor: theme.backgroundSecondary },
            ]}
          >
            <View style={styles.researchRow}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Effectiveness:
              </ThemedText>
              <ThemedText
                type="small"
                style={{ color: Colors.dark.success, fontWeight: "600" }}
              >
                {research.effectiveness}/10
              </ThemedText>
            </View>
            <View style={styles.researchRow}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Risk Level:
              </ThemedText>
              <ThemedText
                type="small"
                style={{
                  color:
                    research.overallRisk === "low"
                      ? Colors.dark.success
                      : research.overallRisk === "moderate"
                        ? Colors.dark.carbs
                        : Colors.dark.error,
                  fontWeight: "600",
                }}
              >
                {research.overallRisk}
              </ThemedText>
            </View>
            <View style={styles.researchRow}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Volume Boost:
              </ThemedText>
              <ThemedText
                type="small"
                style={{ color: Colors.dark.primary, fontWeight: "600" }}
              >
                +
                {Math.round(
                  (research.trainingAdjustments?.volumeMultiplier - 1) * 100,
                ) || 0}
                %
              </ThemedText>
            </View>
          </View>
        ) : null}

        <View style={styles.dosageSection}>
          <ThemedText
            type="small"
            style={{ color: theme.textSecondary, marginBottom: Spacing.sm }}
          >
            Dosage
          </ThemedText>
          <View style={styles.dosageRow}>
            <Pressable
              onPress={() => adjustDosage(index, false)}
              style={[
                styles.dosageButton,
                { backgroundColor: theme.backgroundSecondary },
              ]}
            >
              <Feather name="minus" size={20} color={theme.text} />
            </Pressable>
            <View
              style={[
                styles.dosageDisplay,
                { backgroundColor: theme.backgroundSecondary },
              ]}
            >
              <TextInput
                style={{
                  fontSize: 20,
                  fontWeight: "700",
                  color: theme.text,
                  textAlign: "center",
                  minWidth: 50,
                  padding: 0
                }}
                value={compound.dosageAmount.toString()}
                onChangeText={(text) => {
                  const cleaned = text.replace(/[^0-9.]/g, "");
                  if (cleaned === "" || cleaned === ".") {
                    updateCompound(index, { dosageAmount: 0 }); // Or keep string in local state if needed, but here we update context? 0 is safe for now.
                  } else {
                    const val = parseFloat(cleaned);
                    updateCompound(index, { dosageAmount: val });
                  }
                }}
                keyboardType="numeric"
                selectTextOnFocus
              />
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {compound.dosageUnit}
              </ThemedText>
            </View>
            <Pressable
              onPress={() => adjustDosage(index, true)}
              style={[
                styles.dosageButton,
                { backgroundColor: theme.backgroundSecondary },
              ]}
            >
              <Feather name="plus" size={20} color={theme.text} />
            </Pressable>
          </View>

          <View style={styles.unitRow}>
            {(["mg", "ml", "iu", "mcg"] as const).map((unit) => (
              <Pressable
                key={unit}
                onPress={() => updateCompound(index, { dosageUnit: unit })}
                style={[
                  styles.unitChip,
                  { backgroundColor: theme.backgroundSecondary },
                  compound.dosageUnit === unit && {
                    backgroundColor: Colors.dark.primary,
                  },
                ]}
              >
                <ThemedText
                  type="small"
                  style={
                    compound.dosageUnit === unit
                      ? { color: "#FFF", fontWeight: "600" }
                      : undefined
                  }
                >
                  {unit}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.optionSection}>
          <ThemedText
            type="small"
            style={{ color: theme.textSecondary, marginBottom: Spacing.sm }}
          >
            Frequency
          </ThemedText>
          <View style={styles.optionRow}>
            {FREQUENCY_OPTIONS.slice(0, 5).map((freq) => (
              <Pressable
                key={freq.value}
                onPress={() => updateCompound(index, { frequency: freq.value })}
                style={[
                  styles.optionChip,
                  { backgroundColor: theme.backgroundSecondary },
                  compound.frequency === freq.value && {
                    backgroundColor: Colors.dark.primary,
                  },
                ]}
              >
                <ThemedText
                  type="small"
                  style={
                    compound.frequency === freq.value
                      ? { color: "#FFF", fontWeight: "600" }
                      : undefined
                  }
                >
                  {freq.label}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.optionSection}>
          <ThemedText
            type="small"
            style={{ color: theme.textSecondary, marginBottom: Spacing.sm }}
          >
            Administration
          </ThemedText>
          <View style={styles.optionRow}>
            {(Object.keys(ADMINISTRATION_LABELS) as AdministrationMethod[]).map(
              (method) => (
                <Pressable
                  key={method}
                  onPress={() =>
                    updateCompound(index, { administrationMethod: method })
                  }
                  style={[
                    styles.optionChip,
                    { backgroundColor: theme.backgroundSecondary },
                    compound.administrationMethod === method && {
                      backgroundColor: Colors.dark.primary,
                    },
                  ]}
                >
                  <ThemedText
                    type="small"
                    style={
                      compound.administrationMethod === method
                        ? { color: "#FFF", fontWeight: "600" }
                        : undefined
                    }
                  >
                    {ADMINISTRATION_LABELS[method]}
                  </ThemedText>
                </Pressable>
              ),
            )}
          </View>
        </View>
      </Card>
    );
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
        keyboardShouldPersistTaps="handled"
      >
        <ThemedText type="small" style={styles.osVersion} glow glowColor={Colors.dark.neonOrange}>
          FITSYNC OS v2.0
        </ThemedText>
        <ProgressIndicator currentStep={6} totalSteps={6} />
        <ThemedText type="h2" style={styles.title} glow glowColor={Colors.dark.neonOrange} uppercase>
          Cycle Status Declaration
        </ThemedText>

        <Card
          elevation={2}
          style={{ ...styles.disclaimerCard, borderColor: Colors.dark.warning }}
        >
          <View style={styles.disclaimerHeader}>
            <Feather
              name="alert-triangle"
              size={20}
              color={Colors.dark.warning}
            />
            <ThemedText
              type="body"
              style={{
                fontWeight: "600",
                marginLeft: Spacing.sm,
                color: Colors.dark.warning,
              }}
            >
              For Tracking Only
            </ThemedText>
          </View>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            This data optimizes training recommendations. Always consult with a
            physician.
          </ThemedText>
        </Card>

        <GlowingPanel
          glowColor={isOnCycle ? Colors.dark.neonAmber : Colors.dark.neonCyan}
          style={styles.toggleContainer}
        >
          <View style={styles.toggleSwitch}>
            <Pressable
              onPress={() => setIsOnCycle(false)}
              style={[
                styles.toggleSegment,
                {
                  backgroundColor: !isOnCycle ? Colors.dark.neonCyan + "30" : "transparent",
                  borderColor: Colors.dark.neonCyan,
                  borderWidth: !isOnCycle ? 2 : 1,
                },
              ]}
            >
              <ThemedText
                type="body"
                style={{
                  fontWeight: "700",
                  color: !isOnCycle ? Colors.dark.neonCyan : theme.textSecondary,
                }}
                glow={!isOnCycle}
                glowColor={Colors.dark.neonCyan}
                uppercase
              >
                Natural
              </ThemedText>
            </Pressable>
            <Pressable
              onPress={() => setIsOnCycle(true)}
              style={[
                styles.toggleSegment,
                {
                  backgroundColor: isOnCycle ? Colors.dark.neonAmber + "30" : "transparent",
                  borderColor: Colors.dark.neonAmber,
                  borderWidth: isOnCycle ? 2 : 1,
                },
              ]}
            >
              <ThemedText
                type="body"
                style={{
                  fontWeight: "700",
                  color: isOnCycle ? Colors.dark.neonAmber : theme.textSecondary,
                }}
                glow={isOnCycle}
                glowColor={Colors.dark.neonAmber}
                uppercase
              >
                Enhanced
              </ThemedText>
            </Pressable>
          </View>
        </GlowingPanel>

        {isOnCycle && (
          <GlowingPanel glowColor={Colors.dark.neonAmber} style={styles.warningBox}>
            <ThemedText
              type="small"
              style={{
                color: Colors.dark.neonAmber,
                fontWeight: "600",
                textAlign: "center",
              }}
            >
              WARNING: Enhanced status requires careful monitoring. Consult a medical professional. This is not medical advice.
            </ThemedText>
          </GlowingPanel>
        )}

        {isOnCycle ? (
          <>
            <Card elevation={2} style={styles.timelineCard}>
              <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>
                Cycle Timeline
              </ThemedText>

              <View style={styles.timelineRow}>
                <View style={styles.timelineInput}>
                  <ThemedText
                    type="small"
                    style={{
                      color: theme.textSecondary,
                      marginBottom: Spacing.sm,
                    }}
                  >
                    Weeks Into Cycle
                  </ThemedText>
                  <View style={styles.stepperRow}>
                    <Pressable
                      onPress={() => setWeeksIn(Math.max(0, weeksIn - 1))}
                      style={[
                        styles.stepperButton,
                        { backgroundColor: theme.backgroundSecondary },
                      ]}
                    >
                      <Feather name="minus" size={18} color={theme.text} />
                    </Pressable>
                    <View
                      style={[
                        styles.stepperDisplay,
                        { backgroundColor: theme.backgroundSecondary },
                      ]}
                    >
                      <TextInput
                        style={[styles.stepperValue, { color: theme.text, padding: 0 }]}
                        value={weeksIn.toString()}
                        onChangeText={(text) => {
                          const val = parseInt(text.replace(/[^0-9]/g, "")) || 0;
                          setWeeksIn(val);
                        }}
                        keyboardType="numeric"
                        selectTextOnFocus
                      />
                    </View>
                    <Pressable
                      onPress={() => setWeeksIn(weeksIn + 1)}
                      style={[
                        styles.stepperButton,
                        { backgroundColor: theme.backgroundSecondary },
                      ]}
                    >
                      <Feather name="plus" size={18} color={theme.text} />
                    </Pressable>
                  </View>
                </View>

                <View style={styles.timelineInput}>
                  <ThemedText
                    type="small"
                    style={{
                      color: theme.textSecondary,
                      marginBottom: Spacing.sm,
                    }}
                  >
                    Total Weeks Planned
                  </ThemedText>
                  <View style={styles.stepperRow}>
                    <Pressable
                      onPress={() => setTotalWeeks(Math.max(1, totalWeeks - 1))}
                      style={[
                        styles.stepperButton,
                        { backgroundColor: theme.backgroundSecondary },
                      ]}
                    >
                      <Feather name="minus" size={18} color={theme.text} />
                    </Pressable>
                    <View
                      style={[
                        styles.stepperDisplay,
                        { backgroundColor: theme.backgroundSecondary },
                      ]}
                    >
                      <TextInput
                        style={[styles.stepperValue, { color: theme.text, padding: 0 }]}
                        value={totalWeeks.toString()}
                        onChangeText={(text) => {
                          const val = parseInt(text.replace(/[^0-9]/g, "")) || 0;
                          setTotalWeeks(Math.max(1, val));
                        }}
                        keyboardType="numeric"
                        selectTextOnFocus
                      />
                    </View>
                    <Pressable
                      onPress={() => setTotalWeeks(totalWeeks + 1)}
                      style={[
                        styles.stepperButton,
                        { backgroundColor: theme.backgroundSecondary },
                      ]}
                    >
                      <Feather name="plus" size={18} color={theme.text} />
                    </Pressable>
                  </View>
                </View>
              </View>

              <Pressable
                onPress={() => setPctPlanned(!pctPlanned)}
                style={styles.toggleRow}
              >
                <ThemedText type="body">PCT Planned?</ThemedText>
                <View
                  style={[
                    styles.toggle,
                    {
                      backgroundColor: pctPlanned
                        ? Colors.dark.primary
                        : theme.backgroundSecondary,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.toggleKnob,
                      { transform: [{ translateX: pctPlanned ? 20 : 0 }] },
                    ]}
                  />
                </View>
              </Pressable>
            </Card>

            <ThemedText type="h4" style={styles.sectionTitle} uppercase>
              Compound Stack
            </ThemedText>
            <View style={styles.compoundSearchRow}>
              <View style={styles.searchContainer}>
                <Feather name="search" size={18} color={Colors.dark.neonAmber} style={styles.searchIcon} />
                <TextInput
                  style={[
                    styles.searchInput,
                    {
                      backgroundColor: theme.backgroundSecondary,
                      color: theme.text,
                      borderColor: Colors.dark.neonAmber + "40",
                      borderWidth: 1,
                    },
                  ]}
                  placeholder="Search for compounds..."
                  placeholderTextColor={theme.textSecondary}
                  value={compoundSearch}
                  onChangeText={setCompoundSearch}
                />
                {compoundSearchLoading ? (
                  <ActivityIndicator
                    size="small"
                    color={Colors.dark.neonAmber}
                    style={styles.searchSpinner}
                  />
                ) : null}
              </View>
              <NeonButton
                title="Add Compound"
                onPress={() => setShowCompoundPicker(true)}
                variant="amber"
                style={styles.addCompoundButton}
              />
            </View>
            {compoundSuggestions.length > 0 ? (
              <View style={styles.suggestionList}>
                {compoundSuggestions.slice(0, 6).map((suggestion) => (
                  <Pressable
                    key={suggestion.name}
                    onPress={() => addCompoundFromSearch(suggestion.name)}
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
            <View style={styles.compoundTags}>
              {compounds.map((compound, index) => (
                <GlowingPanel
                  key={index}
                  glowColor={Colors.dark.neonAmber}
                  style={styles.compoundTag}
                >
                  <ThemedText type="small" style={{ color: Colors.dark.neonAmber }}>
                    {compound.name}
                  </ThemedText>
                  <Pressable
                    onPress={() => removeCompound(index)}
                    style={styles.tagRemoveButton}
                  >
                    <Feather name="x" size={14} color={Colors.dark.neonAmber} />
                  </Pressable>
                </GlowingPanel>
              ))}
            </View>
          </>
        ) : null}
      </ScrollView>

      <View
        style={[styles.footer, { paddingBottom: insets.bottom + Spacing.lg }]}
      >
        <NeonButton
          title="Complete Registration"
          onPress={handleContinue}
          variant="amber"
        />
      </View>

      <Modal
        visible={showCompoundPicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCompoundPicker(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowCompoundPicker(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.modalContent,
                  { backgroundColor: theme.backgroundDefault },
                ]}
              >
                <View style={styles.modalHeader}>
                  <ThemedText type="h3">Add Compound</ThemedText>
                  <Pressable onPress={() => setShowCompoundPicker(false)}>
                    <Feather name="x" size={24} color={theme.text} />
                  </Pressable>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.categoryFilter}
                >
                  {categories.map((cat) => (
                    <Pressable
                      key={cat.value}
                      onPress={() => setFilterCategory(cat.value)}
                      style={[
                        styles.categoryChip,
                        { backgroundColor: theme.backgroundSecondary },
                        filterCategory === cat.value && {
                          backgroundColor: Colors.dark.primary,
                        },
                      ]}
                    >
                      <ThemedText
                        type="small"
                        style={
                          filterCategory === cat.value
                            ? { color: "#FFF", fontWeight: "600" }
                            : undefined
                        }
                      >
                        {cat.label}
                      </ThemedText>
                    </Pressable>
                  ))}
                </ScrollView>

                <ScrollView
                  style={styles.compoundList}
                  showsVerticalScrollIndicator={false}
                >
                  {filteredCompounds.map((comp) => (
                    <Pressable
                      key={comp.name}
                      onPress={() => addCompound(comp)}
                      style={[
                        styles.compoundItem,
                        { backgroundColor: theme.backgroundSecondary },
                      ]}
                    >
                      <View style={{ flex: 1 }}>
                        <ThemedText type="body" style={{ fontWeight: "600" }}>
                          {comp.name}
                        </ThemedText>
                        <ThemedText
                          type="small"
                          style={{ color: theme.textSecondary }}
                        >
                          {comp.typicalDosageRange.min}-
                          {comp.typicalDosageRange.max}{" "}
                          {comp.typicalDosageRange.unit}
                        </ThemedText>
                      </View>
                      <Feather
                        name="plus-circle"
                        size={24}
                        color={Colors.dark.primary}
                      />
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        visible={showResearchModal !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setShowResearchModal(null)}
      >
        <TouchableWithoutFeedback onPress={() => setShowResearchModal(null)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.researchModalContent,
                  { backgroundColor: theme.backgroundRoot },
                ]}
              >
                <View style={styles.modalHeader}>
                  <ThemedText type="h4">
                    {showResearchModal} Research
                  </ThemedText>
                  <Pressable
                    onPress={() => setShowResearchModal(null)}
                    hitSlop={12}
                  >
                    <Feather name="x" size={24} color={theme.text} />
                  </Pressable>
                </View>

                {showResearchModal && compoundResearch[showResearchModal] ? (
                  <ScrollView showsVerticalScrollIndicator={false}>
                    {(() => {
                      const research = compoundResearch[showResearchModal!];
                      return (
                        <>
                          <View style={styles.researchSection}>
                            <ThemedText
                              type="body"
                              style={styles.researchSectionTitle}
                            >
                              Mechanism of Action
                            </ThemedText>
                            <ThemedText
                              type="small"
                              style={{ color: theme.textSecondary }}
                            >
                              {research.mechanismOfAction}
                            </ThemedText>
                          </View>

                          <View style={styles.researchSection}>
                            <ThemedText
                              type="body"
                              style={styles.researchSectionTitle}
                            >
                              Benefits
                            </ThemedText>
                            {research.benefits?.map((benefit, i) => (
                              <View key={i} style={styles.benefitItem}>
                                <Feather
                                  name="check-circle"
                                  size={16}
                                  color={Colors.dark.success}
                                />
                                <ThemedText
                                  type="small"
                                  style={{
                                    flex: 1,
                                    color: theme.textSecondary,
                                  }}
                                >
                                  {benefit}
                                </ThemedText>
                              </View>
                            ))}
                          </View>

                          <View style={styles.researchSection}>
                            <ThemedText
                              type="body"
                              style={styles.researchSectionTitle}
                            >
                              Side Effects
                            </ThemedText>
                            {research.sideEffects?.map((se, i) => (
                              <View
                                key={i}
                                style={[
                                  styles.sideEffectCard,
                                  {
                                    backgroundColor:
                                      se.severity === "severe"
                                        ? Colors.dark.error + "20"
                                        : se.severity === "moderate"
                                          ? Colors.dark.carbs + "20"
                                          : theme.backgroundSecondary,
                                  },
                                ]}
                              >
                                <View
                                  style={{
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  <ThemedText
                                    type="small"
                                    style={{ fontWeight: "600" }}
                                  >
                                    {se.effect}
                                  </ThemedText>
                                  <ThemedText
                                    type="small"
                                    style={{
                                      color:
                                        se.severity === "severe"
                                          ? Colors.dark.error
                                          : se.severity === "moderate"
                                            ? Colors.dark.carbs
                                            : theme.textSecondary,
                                    }}
                                  >
                                    {se.severity} ({se.frequency})
                                  </ThemedText>
                                </View>
                                <ThemedText
                                  type="small"
                                  style={{
                                    color: theme.textSecondary,
                                    marginTop: 2,
                                  }}
                                >
                                  Mitigation: {se.mitigation}
                                </ThemedText>
                              </View>
                            ))}
                          </View>

                          <View style={styles.researchSection}>
                            <ThemedText
                              type="body"
                              style={styles.researchSectionTitle}
                            >
                              Training Adjustments
                            </ThemedText>
                            {research.trainingAdjustments?.notes?.map(
                              (note, i) => (
                                <View key={i} style={styles.benefitItem}>
                                  <Feather
                                    name="trending-up"
                                    size={16}
                                    color={Colors.dark.primary}
                                  />
                                  <ThemedText
                                    type="small"
                                    style={{
                                      flex: 1,
                                      color: theme.textSecondary,
                                    }}
                                  >
                                    {note}
                                  </ThemedText>
                                </View>
                              ),
                            )}
                          </View>
                        </>
                      );
                    })()}
                  </ScrollView>
                ) : (
                  <View
                    style={{
                      alignItems: "center",
                      paddingVertical: Spacing.xl,
                    }}
                  >
                    <ActivityIndicator
                      size="large"
                      color={Colors.dark.primary}
                    />
                  </View>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
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
    marginBottom: Spacing.lg,
    textAlign: "center",
  },
  toggleContainer: {
    marginBottom: Spacing.lg,
  },
  toggleSwitch: {
    flexDirection: "row",
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  toggleSegment: {
    flex: 1,
    paddingVertical: Spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  warningBox: {
    marginBottom: Spacing.xl,
    padding: Spacing.md,
  },
  compoundSearchRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  searchContainer: {
    flex: 1,
    position: "relative",
  },
  searchIcon: {
    position: "absolute",
    left: Spacing.md,
    top: 14,
    zIndex: 1,
  },
  searchInput: {
    height: 44,
    borderRadius: BorderRadius.md,
    paddingLeft: Spacing.xl + Spacing.md,
    paddingRight: Spacing.md,
    fontSize: 14,
  },
  searchSpinner: {
    position: "absolute",
    right: Spacing.md,
    top: 12,
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
  addCompoundButton: {
    paddingHorizontal: Spacing.md,
  },
  compoundTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  compoundTag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  tagRemoveButton: {
    padding: 2,
  },
  timelineCard: {
    marginBottom: Spacing.xl,
  },
  timelineRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  timelineInput: {
    flex: 1,
  },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  stepperButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  stepperDisplay: {
    flex: 1,
    height: 44,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  stepperValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  compoundCard: {
    marginBottom: Spacing.md,
  },
  compoundHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  deleteButton: {
    padding: Spacing.xs,
  },
  dosageSection: {
    marginBottom: Spacing.md,
  },
  dosageRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  dosageButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  dosageDisplay: {
    flex: 1,
    height: 48,
    borderRadius: BorderRadius.sm,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.sm,
  },
  dosageValue: {
    fontSize: 24,
    fontWeight: "700",
  },
  unitRow: {
    flexDirection: "row",
    gap: Spacing.xs,
  },
  unitChip: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.xs,
  },
  optionSection: {
    marginBottom: Spacing.md,
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
  },
  optionChip: {
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
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  disclaimerCard: {
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderStyle: "dashed",
    backgroundColor: Colors.dark.warning + "10",
  },
  disclaimerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    maxHeight: "80%",
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  categoryFilter: {
    marginBottom: Spacing.md,
  },
  categoryChip: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.xs,
    marginRight: Spacing.xs,
  },
  compoundList: {
    maxHeight: 400,
    minHeight: 300,
  },
  compoundItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  researchBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.xs,
  },
  researchSummary: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
    gap: 4,
  },
  researchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  researchModalContent: {
    maxHeight: "85%",
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
  },
  researchSection: {
    marginBottom: Spacing.lg,
  },
  researchSectionTitle: {
    marginBottom: Spacing.sm,
    fontWeight: "700",
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  sideEffectCard: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
});
