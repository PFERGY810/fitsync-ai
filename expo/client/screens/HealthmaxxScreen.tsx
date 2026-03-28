import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
const AnimatedView = Animated.createAnimatedComponent(View);
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { getUserProfile } from "@/lib/storage";
import { getApiUrl } from "@/lib/query-client";
import type { OnboardingProfile } from "@/types/onboarding";

interface HealthConcern {
  id: string;
  name: string;
  icon: keyof typeof Feather.glyphMap;
  description: string;
  category:
  | "hair"
  | "hormones"
  | "sleep"
  | "digestive"
  | "cardiovascular"
  | "metabolic"
  | "mental";
}

const HEALTH_CONCERNS: HealthConcern[] = [
  {
    id: "hair-loss",
    name: "Hair Loss / Thinning",
    icon: "wind",
    description: "MPB, DHT sensitivity, shedding",
    category: "hair",
  },
  {
    id: "thyroid",
    name: "Thyroid Issues",
    icon: "thermometer",
    description: "Hypo/hyperthyroidism, TSH levels",
    category: "hormones",
  },
  {
    id: "sleep",
    name: "Sleep Problems",
    icon: "moon",
    description: "Insomnia, sleep apnea, poor quality",
    category: "sleep",
  },
  {
    id: "fatigue",
    name: "Chronic Fatigue",
    icon: "battery",
    description: "Low energy, exhaustion",
    category: "mental",
  },
  {
    id: "digestion",
    name: "Digestive Issues",
    icon: "activity",
    description: "Bloating, IBS, food sensitivities",
    category: "digestive",
  },
  {
    id: "high-bp",
    name: "High Blood Pressure",
    icon: "heart",
    description: "Hypertension, cardiovascular strain",
    category: "cardiovascular",
  },
  {
    id: "anxiety",
    name: "Anxiety / Stress",
    icon: "alert-circle",
    description: "Cortisol, mental health",
    category: "mental",
  },
  {
    id: "libido",
    name: "Low Libido",
    icon: "zap",
    description: "Hormonal imbalance, drive",
    category: "hormones",
  },
  {
    id: "acne",
    name: "Acne / Skin Issues",
    icon: "droplet",
    description: "Hormonal acne, skin health",
    category: "hormones",
  },
  {
    id: "weight-gain",
    name: "Stubborn Weight Gain",
    icon: "trending-up",
    description: "Metabolic issues, insulin",
    category: "metabolic",
  },
  {
    id: "brain-fog",
    name: "Brain Fog",
    icon: "cloud",
    description: "Cognitive issues, focus",
    category: "mental",
  },
  {
    id: "joint-pain",
    name: "Joint Pain",
    icon: "target",
    description: "Inflammation, mobility",
    category: "metabolic",
  },
];

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function HealthmaxxScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  const [profile, setProfile] = useState<OnboardingProfile | null>(null);
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [customConcern, setCustomConcern] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const userProfile = await getUserProfile();
      setProfile(userProfile);
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const toggleConcern = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedConcerns((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const analyzeHealthConcerns = async () => {
    if (selectedConcerns.length === 0 && !customConcern.trim()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsAnalyzing(true);
    setShowAnalysis(true);

    const selectedNames = selectedConcerns.map(
      (id) => HEALTH_CONCERNS.find((c) => c.id === id)?.name || id,
    );
    const allConcerns = [...selectedNames];
    if (customConcern.trim()) allConcerns.push(customConcern.trim());

    try {
      const response = await fetch(
        new URL("/api/coach/healthmaxx", getApiUrl()).toString(),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            concerns: allConcerns,
            profile: profile,
            profileId: (profile as any)?.id,
            userId: (profile as any)?.userId,
          }),
        },
      );

      if (!response.ok) throw new Error("Analysis failed");

      const data = await response.json();
      setChatMessages([
        {
          id: "1",
          role: "assistant",
          content: data.response,
        },
      ]);
    } catch (error: any) {
      console.error("Health analysis error:", error);
      setChatMessages([
        {
          id: "1",
          role: "assistant",
          content: `Sorry, I couldn't analyze your health concerns. Please try again.`,
        },
      ]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderConcern = ({
    item,
    index,
  }: {
    item: HealthConcern;
    index: number;
  }) => {
    const isSelected = selectedConcerns.includes(item.id);
    return (
      <AnimatedView entering={FadeInUp.duration(300).delay(index * 30)}>
        <Pressable
          onPress={() => toggleConcern(item.id)}
          style={[
            styles.concernCard,
            {
              backgroundColor: isSelected
                ? Colors.dark.primary + "30"
                : theme.backgroundSecondary,
              borderColor: isSelected ? Colors.dark.primary : "transparent",
              borderWidth: isSelected ? 2 : 0,
            },
          ]}
        >
          <View
            style={[
              styles.concernIcon,
              {
                backgroundColor: isSelected
                  ? Colors.dark.primary
                  : theme.backgroundRoot,
              },
            ]}
          >
            <Feather
              name={item.icon}
              size={20}
              color={isSelected ? "#fff" : theme.textSecondary}
            />
          </View>
          <View style={styles.concernInfo}>
            <ThemedText type="body" style={{ fontWeight: "600" }}>
              {item.name}
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {item.description}
            </ThemedText>
          </View>
          {isSelected ? (
            <Feather
              name="check-circle"
              size={22}
              color={Colors.dark.primary}
            />
          ) : null}
        </Pressable>
      </AnimatedView>
    );
  };

  return (
    <ThemedView style={styles.container}>
      {!showAnalysis ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: headerHeight + Spacing.lg,
              paddingBottom: insets.bottom + 120,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <AnimatedView entering={FadeInDown.duration(400)}>
            <ThemedText type="h2" style={styles.title}>
              Healthmaxx
            </ThemedText>
            <ThemedText
              type="body"
              style={[styles.subtitle, { color: theme.textSecondary }]}
            >
              Select your health concerns for personalized AI analysis and
              recommendations
            </ThemedText>
          </AnimatedView>

          <View style={styles.concernsGrid}>
            {HEALTH_CONCERNS.map((concern, index) => (
              <View key={concern.id} style={styles.concernWrapper}>
                {renderConcern({ item: concern, index })}
              </View>
            ))}
          </View>

          <View style={styles.customSection}>
            <ThemedText type="h4" style={{ marginBottom: Spacing.sm }}>
              Other Concerns
            </ThemedText>
            <TextInput
              style={[
                styles.customInput,
                {
                  backgroundColor: theme.backgroundSecondary,
                  color: theme.text,
                },
              ]}
              placeholder="Describe any other health concerns..."
              placeholderTextColor={theme.textSecondary}
              value={customConcern}
              onChangeText={setCustomConcern}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.selectedSummary}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {selectedConcerns.length} concern
              {selectedConcerns.length !== 1 ? "s" : ""} selected
              {customConcern.trim() ? " + custom input" : ""}
            </ThemedText>
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: headerHeight + Spacing.lg,
              paddingBottom: insets.bottom + 100,
            },
          ]}
        >
          <Pressable
            onPress={() => {
              setShowAnalysis(false);
              setChatMessages([]);
            }}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={20} color={theme.text} />
            <ThemedText type="body" style={{ marginLeft: Spacing.xs }}>
              Back to Selection
            </ThemedText>
          </Pressable>

          <ThemedText type="h2" style={styles.title}>
            Health Analysis
          </ThemedText>

          <View style={styles.selectedTags}>
            {selectedConcerns.map((id) => {
              const concern = HEALTH_CONCERNS.find((c) => c.id === id);
              return concern ? (
                <View
                  key={id}
                  style={[
                    styles.tag,
                    { backgroundColor: Colors.dark.primary + "30" },
                  ]}
                >
                  <Feather
                    name={concern.icon}
                    size={14}
                    color={Colors.dark.primary}
                  />
                  <ThemedText
                    type="small"
                    style={{ color: Colors.dark.primary, marginLeft: 4 }}
                  >
                    {concern.name}
                  </ThemedText>
                </View>
              ) : null;
            })}
            {customConcern.trim() ? (
              <View
                style={[
                  styles.tag,
                  { backgroundColor: Colors.dark.success + "30" },
                ]}
              >
                <ThemedText type="small" style={{ color: Colors.dark.success }}>
                  {customConcern.slice(0, 30)}...
                </ThemedText>
              </View>
            ) : null}
          </View>

          {isAnalyzing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.dark.primary} />
              <ThemedText
                type="body"
                style={{ marginTop: Spacing.md, color: theme.textSecondary }}
              >
                Analyzing your health concerns...
              </ThemedText>
            </View>
          ) : (
            chatMessages.map((msg) => (
              <Card key={msg.id} style={styles.analysisCard}>
                <View
                  style={[
                    styles.aiIcon,
                    { backgroundColor: Colors.dark.primary },
                  ]}
                >
                  <Feather name="cpu" size={18} color="#fff" />
                </View>
                <ThemedText type="body" style={{ lineHeight: 24 }}>
                  {msg.content}
                </ThemedText>
              </Card>
            ))
          )}
        </ScrollView>
      )}

      {!showAnalysis ? (
        <AnimatedView
          entering={FadeInUp.duration(300)}
          style={[
            styles.analyzeButtonContainer,
            { paddingBottom: insets.bottom + Spacing.md },
          ]}
        >
          <Pressable
            onPress={analyzeHealthConcerns}
            disabled={selectedConcerns.length === 0 && !customConcern.trim()}
            style={[
              styles.analyzeButton,
              {
                backgroundColor:
                  selectedConcerns.length === 0 && !customConcern.trim()
                    ? theme.textSecondary
                    : Colors.dark.primary,
              },
            ]}
          >
            <Feather name="zap" size={20} color="#fff" />
            <ThemedText
              type="body"
              style={{
                color: "#fff",
                fontWeight: "700",
                marginLeft: Spacing.sm,
              }}
            >
              Analyze & Get Recommendations
            </ThemedText>
          </Pressable>
        </AnimatedView>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  concernsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -Spacing.xs,
  },
  concernWrapper: {
    width: "50%",
    paddingHorizontal: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  concernCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  concernIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  concernInfo: {
    flex: 1,
  },
  customSection: {
    marginTop: Spacing.xl,
  },
  customInput: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    minHeight: 80,
    fontSize: 15,
  },
  selectedSummary: {
    marginTop: Spacing.lg,
    alignItems: "center",
  },
  analyzeButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    backgroundColor: "rgba(0,0,0,0.9)",
  },
  analyzeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md + 4,
    borderRadius: BorderRadius.xl,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  selectedTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: Spacing.lg,
    gap: Spacing.xs,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing["3xl"],
  },
  analysisCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  aiIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
});
