import React, { useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { NeonButton } from "@/components/NeonButton";
import { Card } from "@/components/Card";
import { ProgressIndicator } from "@/components/ProgressIndicator";

import { useOnboarding } from "@/context/OnboardingContext";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius, Typography } from "@/constants/theme";
import { apiRequest } from "@/lib/query-client";

const AnimatedView = Animated.createAnimatedComponent(View);

// Equipment presets
const EQUIPMENT_PRESETS = [
  {
    id: "full-gym",
    name: "Full Commercial Gym",
    description: "Access to all standard gym equipment",
    icon: "home",
    equipment: [
      "barbell",
      "dumbbells",
      "cables",
      "squat-rack",
      "bench",
      "pull-up-bar",
      "leg-press",
      "smith-machine",
      "machines",
      "ez-bar",
      "dip-station",
    ],
  },
  {
    id: "home-barbell",
    name: "Home Gym (Barbell)",
    description: "Home setup with barbell and rack",
    icon: "box",
    equipment: [
      "barbell",
      "dumbbells",
      "squat-rack",
      "bench",
      "pull-up-bar",
      "ez-bar",
    ],
  },
  {
    id: "home-dumbbells",
    name: "Home Gym (Dumbbells)",
    description: "Dumbbells and basic equipment only",
    icon: "package",
    equipment: ["dumbbells", "bench", "pull-up-bar", "resistance-bands"],
  },
  {
    id: "bodyweight",
    name: "Bodyweight Only",
    description: "No equipment, calisthenics focused",
    icon: "user",
    equipment: ["pull-up-bar", "dip-station", "resistance-bands"],
  },
  {
    id: "planet-fitness",
    name: "Planet Fitness / Limited",
    description: "Smith machine, dumbbells, cables, no free barbells",
    icon: "globe",
    equipment: [
      "dumbbells",
      "cables",
      "smith-machine",
      "machines",
      "bench",
      "leg-press",
    ],
  },
  {
    id: "custom",
    name: "Custom Selection",
    description: "Select your specific equipment",
    icon: "settings",
    equipment: [],
  },
] as const;

// Individual equipment items
const EQUIPMENT_ITEMS = [
  { id: "barbell", name: "Barbell + Plates", icon: "minus" },
  { id: "dumbbells", name: "Dumbbells", icon: "more-horizontal" },
  { id: "cables", name: "Cables/Pulleys", icon: "git-pull-request" },
  { id: "squat-rack", name: "Squat Rack/Power Cage", icon: "square" },
  { id: "bench", name: "Bench (Flat/Incline/Decline)", icon: "sidebar" },
  { id: "pull-up-bar", name: "Pull-up Bar", icon: "arrow-up" },
  { id: "leg-press", name: "Leg Press", icon: "chevrons-down" },
  { id: "smith-machine", name: "Smith Machine", icon: "columns" },
  { id: "machines", name: "Cable Machines (Lat Pull, Rows, etc.)", icon: "grid" },
  { id: "ez-bar", name: "EZ Curl Bar", icon: "activity" },
  { id: "dip-station", name: "Dip Station/Parallel Bars", icon: "maximize-2" },
  { id: "resistance-bands", name: "Resistance Bands", icon: "link" },
  { id: "kettlebells", name: "Kettlebells", icon: "disc" },
  { id: "trap-bar", name: "Trap/Hex Bar", icon: "hexagon" },
  { id: "landmine", name: "Landmine Attachment", icon: "corner-up-right" },
] as const;

export default function EquipmentScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const { profile, updateProfile } = useOnboarding();

  const [selectedPreset, setSelectedPreset] = useState<string>(
    profile.equipment?.preset || "full-gym"
  );
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>(
    profile.equipment?.available || EQUIPMENT_PRESETS[0].equipment
  );
  const [showCustomize, setShowCustomize] = useState(false);
  
  // Gym location state
  const [gymName, setGymName] = useState(profile.equipment?.gymName || "");
  const [gymCity, setGymCity] = useState(profile.equipment?.gymCity || "");
  const [gymState, setGymState] = useState(profile.equipment?.gymState || "");
  const [isInferring, setIsInferring] = useState(false);
  const [inferenceResult, setInferenceResult] = useState<{
    gymType?: string;
    confidence?: string;
    notes?: string;
  } | null>(null);

  const handleInferEquipment = async () => {
    if (!gymName.trim()) return;
    
    setIsInferring(true);
    setInferenceResult(null);
    
    try {
      const response = await apiRequest("/api/coach/infer-equipment", {
        method: "POST",
        body: JSON.stringify({
          gymName: gymName.trim(),
          city: gymCity.trim(),
          state: gymState.trim(),
        }),
      });
      
      if (response.equipment && response.equipment.length > 0) {
        setSelectedEquipment(response.equipment);
        setSelectedPreset("custom");
        setShowCustomize(true);
        setInferenceResult({
          gymType: response.gymType,
          confidence: response.confidence,
          notes: response.notes,
        });
      }
    } catch (error) {
      console.error("Error inferring equipment:", error);
    } finally {
      setIsInferring(false);
    }
  };

  const handlePresetSelect = (presetId: string) => {
    setSelectedPreset(presetId);
    const preset = EQUIPMENT_PRESETS.find((p) => p.id === presetId);
    if (preset && presetId !== "custom") {
      setSelectedEquipment([...preset.equipment]);
      setShowCustomize(false);
    } else {
      setShowCustomize(true);
    }
  };

  const toggleEquipment = (equipmentId: string) => {
    setSelectedEquipment((prev) =>
      prev.includes(equipmentId)
        ? prev.filter((e) => e !== equipmentId)
        : [...prev, equipmentId]
    );
    // If they modify equipment after selecting a preset, switch to custom
    if (selectedPreset !== "custom") {
      setSelectedPreset("custom");
    }
  };

  const handleContinue = () => {
    updateProfile({
      equipment: {
        preset: selectedPreset,
        available: selectedEquipment,
        gymName: gymName.trim() || undefined,
        gymCity: gymCity.trim() || undefined,
        gymState: gymState.trim() || undefined,
      },
    });
    navigation.navigate("CycleStatus");
  };

  const handleBack = () => {
    navigation.goBack();
  };

  // Determine if current selection matches a preset
  const currentPresetMatch = useMemo(() => {
    if (selectedPreset === "custom") return null;
    const preset = EQUIPMENT_PRESETS.find((p) => p.id === selectedPreset);
    if (!preset) return null;
    const presetSet = new Set(preset.equipment);
    const selectedSet = new Set(selectedEquipment);
    if (presetSet.size !== selectedSet.size) return null;
    for (const item of presetSet) {
      if (!selectedSet.has(item)) return null;
    }
    return preset.id;
  }, [selectedPreset, selectedEquipment]);

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
          <ThemedText
            type="small"
            style={styles.osVersion}
            glow
            glowColor={Colors.dark.neonCyan}
          >
            FITSYNC OS v2.0
          </ThemedText>
          <ProgressIndicator currentStep={5} totalSteps={8} />
          <ThemedText
            type="h2"
            style={styles.title}
            glow
            glowColor={Colors.dark.neonCyan}
            uppercase
          >
            Your Equipment
          </ThemedText>

          <ThemedText
            type="body"
            style={[styles.subtitle, { color: theme.textSecondary }]}
          >
            Select your gym setup so we only program exercises you can actually
            do
          </ThemedText>

          {/* Gym Location Section */}
          <Card elevation={2} style={styles.gymLocationCard}>
            <View style={styles.gymLocationHeader}>
              <Feather name="map-pin" size={18} color={Colors.dark.neonCyan} />
              <ThemedText type="body" style={{ fontWeight: "600", marginLeft: Spacing.sm }}>
                Your Gym Location
              </ThemedText>
            </View>
            <ThemedText
              type="small"
              style={{ color: theme.textSecondary, marginBottom: Spacing.md }}
            >
              Enter your gym to auto-detect available equipment
            </ThemedText>
            
            <TextInput
              style={[
                styles.gymInput,
                {
                  backgroundColor: theme.backgroundSecondary,
                  color: theme.text,
                },
              ]}
              value={gymName}
              onChangeText={setGymName}
              placeholder="Gym Name (e.g., Planet Fitness, UT Austin Rec)"
              placeholderTextColor={theme.textSecondary}
            />
            
            <View style={styles.locationRow}>
              <TextInput
                style={[
                  styles.gymInput,
                  styles.cityInput,
                  {
                    backgroundColor: theme.backgroundSecondary,
                    color: theme.text,
                  },
                ]}
                value={gymCity}
                onChangeText={setGymCity}
                placeholder="City"
                placeholderTextColor={theme.textSecondary}
              />
              <TextInput
                style={[
                  styles.gymInput,
                  styles.stateInput,
                  {
                    backgroundColor: theme.backgroundSecondary,
                    color: theme.text,
                  },
                ]}
                value={gymState}
                onChangeText={setGymState}
                placeholder="State"
                placeholderTextColor={theme.textSecondary}
                maxLength={2}
                autoCapitalize="characters"
              />
            </View>
            
            <Pressable
              onPress={handleInferEquipment}
              disabled={!gymName.trim() || isInferring}
              style={[
                styles.inferButton,
                {
                  backgroundColor: gymName.trim() && !isInferring
                    ? Colors.dark.neonCyan + "20"
                    : "rgba(255,255,255,0.05)",
                  borderColor: gymName.trim() && !isInferring
                    ? Colors.dark.neonCyan
                    : "rgba(255,255,255,0.1)",
                },
              ]}
            >
              {isInferring ? (
                <ActivityIndicator size="small" color={Colors.dark.neonCyan} />
              ) : (
                <>
                  <Feather
                    name="zap"
                    size={16}
                    color={gymName.trim() ? Colors.dark.neonCyan : theme.textSecondary}
                  />
                  <ThemedText
                    type="body"
                    style={{
                      marginLeft: Spacing.sm,
                      color: gymName.trim() ? Colors.dark.neonCyan : theme.textSecondary,
                      fontWeight: "600",
                    }}
                  >
                    Auto-detect Equipment
                  </ThemedText>
                </>
              )}
            </Pressable>
            
            {inferenceResult && (
              <View style={styles.inferenceResult}>
                <View style={styles.inferenceRow}>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>
                    Type:
                  </ThemedText>
                  <ThemedText type="small" style={{ color: Colors.dark.neonCyan, marginLeft: Spacing.xs }}>
                    {inferenceResult.gymType}
                  </ThemedText>
                  <View style={[
                    styles.confidenceBadge,
                    {
                      backgroundColor: inferenceResult.confidence === "high"
                        ? Colors.dark.success + "20"
                        : inferenceResult.confidence === "medium"
                        ? Colors.dark.neonOrange + "20"
                        : "rgba(255,255,255,0.1)",
                    },
                  ]}>
                    <ThemedText
                      type="small"
                      style={{
                        color: inferenceResult.confidence === "high"
                          ? Colors.dark.success
                          : inferenceResult.confidence === "medium"
                          ? Colors.dark.neonOrange
                          : theme.textSecondary,
                        fontSize: 10,
                        textTransform: "uppercase",
                      }}
                    >
                      {inferenceResult.confidence} confidence
                    </ThemedText>
                  </View>
                </View>
                {inferenceResult.notes && (
                  <ThemedText
                    type="small"
                    style={{ color: theme.textSecondary, marginTop: Spacing.xs, lineHeight: 18 }}
                  >
                    {inferenceResult.notes}
                  </ThemedText>
                )}
              </View>
            )}
          </Card>

          {/* Preset Selection */}
          <ThemedText type="h4" style={styles.sectionTitle} uppercase>
            Quick Select
          </ThemedText>

          <View style={styles.presetsGrid}>
            {EQUIPMENT_PRESETS.map((preset) => (
              <Pressable
                key={preset.id}
                onPress={() => handlePresetSelect(preset.id)}
                style={[
                  styles.presetCard,
                  {
                    backgroundColor:
                      selectedPreset === preset.id
                        ? Colors.dark.neonCyan + "20"
                        : Colors.dark.panelBackground,
                    borderColor:
                      selectedPreset === preset.id
                        ? Colors.dark.neonCyan
                        : Colors.dark.panelBorder,
                    borderWidth: selectedPreset === preset.id ? 2 : 1,
                  },
                ]}
              >
                <View
                  style={[
                    styles.presetIcon,
                    {
                      backgroundColor:
                        selectedPreset === preset.id
                          ? Colors.dark.neonCyan + "30"
                          : "rgba(255,255,255,0.05)",
                    },
                  ]}
                >
                  <Feather
                    name={preset.icon as any}
                    size={24}
                    color={
                      selectedPreset === preset.id
                        ? Colors.dark.neonCyan
                        : theme.textSecondary
                    }
                  />
                </View>
                <View style={styles.presetText}>
                  <ThemedText
                    type="body"
                    style={{
                      fontWeight: "600",
                      color:
                        selectedPreset === preset.id
                          ? Colors.dark.neonCyan
                          : theme.text,
                    }}
                  >
                    {preset.name}
                  </ThemedText>
                  <ThemedText
                    type="small"
                    style={{ color: theme.textSecondary }}
                    numberOfLines={1}
                  >
                    {preset.description}
                  </ThemedText>
                </View>
                {selectedPreset === preset.id && (
                  <Feather
                    name="check-circle"
                    size={20}
                    color={Colors.dark.neonCyan}
                  />
                )}
              </Pressable>
            ))}
          </View>

          {/* Customize Button */}
          {!showCustomize && selectedPreset !== "custom" && (
            <Pressable
              onPress={() => setShowCustomize(true)}
              style={styles.customizeButton}
            >
              <Feather name="edit-2" size={16} color={Colors.dark.neonCyan} />
              <ThemedText
                type="small"
                style={{ color: Colors.dark.neonCyan, marginLeft: Spacing.xs }}
              >
                Customize Equipment List
              </ThemedText>
            </Pressable>
          )}

          {/* Equipment Checklist */}
          {(showCustomize || selectedPreset === "custom") && (
            <>
              <ThemedText
                type="h4"
                style={[styles.sectionTitle, { marginTop: Spacing.xl }]}
                uppercase
              >
                Equipment Checklist
              </ThemedText>

              <Card elevation={1} style={styles.checklistCard}>
                {EQUIPMENT_ITEMS.map((item, index) => (
                  <Pressable
                    key={item.id}
                    onPress={() => toggleEquipment(item.id)}
                    style={[
                      styles.checklistItem,
                      index < EQUIPMENT_ITEMS.length - 1 && styles.checklistItemBorder,
                    ]}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        selectedEquipment.includes(item.id) && {
                          backgroundColor: Colors.dark.neonCyan,
                          borderColor: Colors.dark.neonCyan,
                        },
                      ]}
                    >
                      {selectedEquipment.includes(item.id) && (
                        <Feather name="check" size={14} color="#000" />
                      )}
                    </View>
                    <Feather
                      name={item.icon as any}
                      size={18}
                      color={
                        selectedEquipment.includes(item.id)
                          ? Colors.dark.neonCyan
                          : theme.textSecondary
                      }
                      style={{ marginRight: Spacing.sm }}
                    />
                    <ThemedText
                      type="body"
                      style={{
                        flex: 1,
                        color: selectedEquipment.includes(item.id)
                          ? theme.text
                          : theme.textSecondary,
                      }}
                    >
                      {item.name}
                    </ThemedText>
                  </Pressable>
                ))}
              </Card>
            </>
          )}

          {/* Summary */}
          <View style={styles.summary}>
            <Feather
              name="check-square"
              size={16}
              color={Colors.dark.neonCyan}
            />
            <ThemedText
              type="small"
              style={{ color: theme.textSecondary, marginLeft: Spacing.xs }}
            >
              {selectedEquipment.length} equipment item
              {selectedEquipment.length !== 1 ? "s" : ""} selected
            </ThemedText>
          </View>
        </AnimatedView>
      </ScrollView>

      <View
        style={[styles.footer, { paddingBottom: insets.bottom + Spacing.lg }]}
      >
        <NeonButton
          title="Next Step"
          onPress={handleContinue}
          disabled={selectedEquipment.length === 0}
        />
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
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
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
    lineHeight: 22,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
    textAlign: "center",
    letterSpacing: 1,
  },
  presetsGrid: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  presetCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
  },
  presetIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  presetText: {
    flex: 1,
  },
  customizeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
  },
  checklistCard: {
    padding: 0,
    overflow: "hidden",
  },
  checklistItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  checklistItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  summary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.lg,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  gymLocationCard: {
    marginBottom: Spacing.xl,
    padding: Spacing.lg,
  },
  gymLocationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  gymInput: {
    height: 48,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.body.fontSize,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    marginBottom: Spacing.sm,
  },
  locationRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  cityInput: {
    flex: 2,
  },
  stateInput: {
    flex: 1,
  },
  inferButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginTop: Spacing.xs,
  },
  inferenceResult: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: BorderRadius.sm,
  },
  inferenceRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  confidenceBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
    marginLeft: Spacing.sm,
  },
});
