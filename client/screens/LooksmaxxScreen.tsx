import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useQuery } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { PhysiqueVisualizer } from "@/components/PhysiqueVisualizer";
import { AnalysisCard } from "@/components/AnalysisCard";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, Colors, BorderRadius } from "@/constants/theme";
import { getPhysiqueAnalysis } from "@/lib/storage";
import type { PhysiqueAnalysisResult } from "@/types/onboarding";

const AnimatedView = Animated.createAnimatedComponent(View);

export default function LooksmaxxScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<any>();

  const { data: analysis } = useQuery({
    queryKey: ["physiqueAnalysis"],
    queryFn: getPhysiqueAnalysis,
  });

  // Map the detailed analysis to visualizer format
  const getVisualizerData = () => {
    if (!analysis) {
      return {
        bodyFat: 15,
        proportions: 1.61,
        muscleGroups: {
          chest: 'neutral' as const,
          abs: 'neutral' as const,
          legs: 'neutral' as const,
          arms: 'neutral' as const,
          back: 'neutral' as const,
          shoulders: 'neutral' as const
        }
      };
    }

    // Parse body fat estimate (e.g., "12-15%")
    const bfMatch = analysis.bodyFatEstimate.match(/(\d+)/);
    const bodyFat = bfMatch ? parseInt(bfMatch[0]) : 15;

    // Map muscle ratings to strength/weakness/neutral
    const muscleGroups: Record<string, "strength" | "weakness" | "neutral"> = {};
    analysis.muscleRatings.forEach(m => {
      const name = m.muscle.toLowerCase();
      let status: "strength" | "weakness" | "neutral" = "neutral";
      if (m.status === 'strong' || m.status === 'dominant') status = 'strength';
      if (m.status === 'lagging') status = 'weakness';

      if (name.includes('chest')) muscleGroups.chest = status;
      if (name.includes('abs') || name.includes('core')) muscleGroups.abs = status;
      if (name.includes('leg') || name.includes('quad')) muscleGroups.legs = status;
      if (name.includes('arm') || name.includes('bicep') || name.includes('tricep')) muscleGroups.arms = status;
      if (name.includes('back') || name.includes('lat')) muscleGroups.back = status;
      if (name.includes('shoulder') || name.includes('delt')) muscleGroups.shoulders = status;
    });

    return {
      bodyFat,
      proportions: (analysis.goldenRatioScore / 100) * 2, // Mock scale for visualizer
      muscleGroups
    };
  };

  const visualData = getVisualizerData();

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <LinearGradient
        colors={[Colors.dark.primary + "20", "transparent"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.4 }}
      />

      <View style={[styles.header, { marginTop: insets.top + Spacing.sm }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="chevron-left" size={28} color={theme.text} />
        </Pressable>
        <ThemedText type="h4" style={styles.headerTitle}>Physique Scan</ThemedText>
        <Pressable style={styles.menuButton}>
          <Feather name="share-2" size={24} color={theme.text} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}>
        <AnimatedView entering={FadeInDown.duration(600).springify()}>
          <View style={styles.visualizerContainer}>
            <PhysiqueVisualizer
              bodyFat={visualData.bodyFat}
              proportions={visualData.proportions}
              muscleGroups={visualData.muscleGroups}
            />
          </View>
        </AnimatedView>

        <View style={styles.content}>
          <ThemedText type="h2" style={styles.title}>
            {analysis ? "AI Analysis Complete" : "No Scan Data"}
          </ThemedText>

          <ThemedText type="body" style={styles.subtitle}>
            {analysis
              ? (analysis as any).photoAnalysis?.overallImpression || analysis.observations[0]
              : "Upload photos to generate your first AI physique breakdown and measurements."}
          </ThemedText>

          {analysis && (
            <View style={styles.breakdownContainer}>
              <ThemedText type="h3" style={styles.sectionTitle}>Detailed Breakdown</ThemedText>

              {analysis.muscleRatings.map((muscle, index) => (
                <AnimatedView key={index} entering={FadeInUp.delay(200 + index * 100)}>
                  <AnalysisCard
                    muscle={muscle.muscle}
                    overallScore={Math.round((muscle.rating / 10) * 100)}
                    status={muscle.status}
                    observations={muscle.observations}
                    visualKeywords={muscle.visualKeywords}
                  />
                </AnimatedView>
              ))}

              {analysis.postureIssues.length > 0 && (
                <View style={styles.postureSection}>
                  <ThemedText type="h3" style={styles.sectionTitle}>Bio-Mechanical Scan</ThemedText>
                  {analysis.postureIssues.map((issue, i) => (
                    <View key={i} style={[styles.issueCard, { backgroundColor: theme.surface }]}>
                      <View style={styles.issueHeader}>
                        <ThemedText type="body" style={{ fontWeight: '700' }}>{issue.issue}</ThemedText>
                        <View style={[styles.severityBadge, { backgroundColor: issue.severity > 7 ? Colors.dark.error : Colors.dark.carbs }]}>
                          <ThemedText type="small" style={styles.severityText}>SEVERITY: {issue.severity}/10</ThemedText>
                        </View>
                      </View>
                      {issue.observations.map((obs, j) => (
                        <ThemedText key={j} type="small" style={{ color: theme.textSecondary, marginTop: 4 }}>
                          • {obs}
                        </ThemedText>
                      ))}
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      <Animated.View
        entering={FadeInDown.delay(500).springify()}
        style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}
      >
        <Button
          style={[styles.continueButton, { marginBottom: 12 }]}
          textStyle={{ fontSize: 18, fontWeight: '700' }}
          onPress={() => navigation.navigate("WeeklyCheckIn")}
        >
          {analysis ? "Take New Scan" : "Start First Scan"}
        </Button>
        <Button
          variant="secondary"
          onPress={() => navigation.navigate("MainTabs")}
        >
          Return to Dashboard
        </Button>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  headerTitle: {
    fontWeight: '700',
    letterSpacing: 1,
  },
  backButton: {
    padding: 8,
  },
  menuButton: {
    padding: 8,
  },
  visualizerContainer: {
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    marginTop: -20,
  },
  title: {
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    textAlign: 'center',
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  breakdownContainer: {
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontSize: 14,
    color: Colors.dark.neonCyan,
  },
  postureSection: {
    marginTop: Spacing.xl,
  },
  issueCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  issueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  severityText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFF',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    backgroundColor: 'rgba(10, 10, 10, 0.9)',
  },
  continueButton: {
    height: 56,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.dark.neonCyan,
    shadowColor: Colors.dark.neonCyan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  }
});
