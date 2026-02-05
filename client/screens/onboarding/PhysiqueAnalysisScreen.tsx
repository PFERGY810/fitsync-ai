import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { ScoreGauge } from "@/components/ScoreGauge";
import { ProgressPhotoComparison } from "@/components/ProgressPhotoComparison";
import { AnalysisCard } from "@/components/AnalysisCard";
import { KeyInsightsCard } from "@/components/KeyInsightsCard";
import { PriorityExerciseCard } from "@/components/PriorityExerciseCard";

import { WireframeGraphic } from "@/components/WireframeGraphic";
import { GlowingPanel } from "@/components/GlowingPanel";
import { useOnboarding } from "@/context/OnboardingContext";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import { savePhysiqueAnalysis } from "@/lib/storage";
import { convertPhotosToBase64 } from "@/lib/image-utils";
import type { PhysiqueAnalysisResult } from "@/types/onboarding";

const AnimatedView = Animated.createAnimatedComponent(View);

export default function PhysiqueAnalysisScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const { profile } = useOnboarding();

  const [analyzing, setAnalyzing] = useState(true);
  const [analysis, setAnalysis] = useState<PhysiqueAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState<string>("queued");
  const [showSkip, setShowSkip] = useState(false);

  useEffect(() => {
    analyzePhysique();
    // Show skip button after 15 seconds
    const skipTimer = setTimeout(() => {
      setShowSkip(true);
    }, 15000);
    return () => clearTimeout(skipTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSkip = () => {
    setAnalyzing(false);
    setError("Analysis skipped. Proceeding with your program.");
  };

  const pollAnalysisJob = async (jobId: string) => {
    const start = Date.now();
    const timeoutMs = 240000;

    while (Date.now() - start < timeoutMs) {
      const response = await fetch(
        new URL(`/api/coach/analysis-jobs/${jobId}`, getApiUrl()).toString(),
      );

      if (!response.ok) {
        throw new Error("Failed to fetch analysis status");
      }

      const job = await response.json();
      setAnalysisStatus(job.status);

      if (job.status === "completed") {
        return job.result;
      }

      if (job.status === "failed") {
        throw new Error(job.error || "Analysis failed");
      }

      await new Promise((r) => setTimeout(r, 2000));
    }

    throw new Error("Analysis timed out. Please try again.");
  };

  const analyzePhysique = async (retryCount = 0) => {
    const MAX_RETRIES = 2;

    try {
      const base64Photos = await convertPhotosToBase64({
        front: profile.progressPhotos?.front,
        side: profile.progressPhotos?.side,
        back: profile.progressPhotos?.back,
        legs: profile.progressPhotos?.legs,
      });

      const response = await fetch(
        new URL("/api/coach/analyze-physique-detailed", getApiUrl()).toString(),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            photos: base64Photos,
            profileId: (profile as any)?.id,
            profile: {
              height: profile.height,
              heightUnit: profile.heightUnit,
              weight: profile.weight,
              weightUnit: profile.weightUnit,
              age: profile.age,
              sex: profile.sex,
              goal: profile.goal,
              experienceLevel: profile.experienceLevel,
              cycleInfo: profile.cycleInfo,
              isOnCycle: profile.isOnCycle,
              strengthGoals: profile.strengthGoals,
            },
          }),
        },
      );
      if (!response.ok) throw new Error("Failed to start analysis");

      const data = await response.json();
      if (!data?.jobId) {
        throw new Error("Analysis job not created");
      }

      const result = await pollAnalysisJob(data.jobId);
      setAnalysis(result);
    } catch (err: any) {
      console.error("Physique analysis error:", err);

      // Retry on network failures (not timeouts)
      if (err.name !== "AbortError" && retryCount < MAX_RETRIES) {
        console.log(
          `Retrying physique analysis (attempt ${retryCount + 2}/${MAX_RETRIES + 1})...`,
        );
        await new Promise((r) => setTimeout(r, 2000)); // Wait 2s before retry
        return analyzePhysique(retryCount + 1);
      }

      setError(
        err?.message ||
        "Unable to complete analysis. Proceeding with your program.",
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const handleComplete = async () => {
    if (analysis) {
      // Save physique analysis to profile so program generation can use weak points
      await savePhysiqueAnalysis(analysis);
    }
    // Continue to goals selection
    navigation.navigate("Goals" as never);
  };

  if (analyzing) {
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
        <ActivityIndicator size="large" color={theme.primary} />
        <ThemedText
          type="h3"
          style={{ marginTop: Spacing.xl, textAlign: "center" }}
        >
          {analysisStatus === "running"
            ? "Analyzing Your Physique"
            : "Preparing Analysis"}
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
          {analysisStatus === "running"
            ? "AI is examining your photos to provide detailed muscle-by-muscle ratings and posture analysis."
            : "We're queuing your analysis and will start shortly."}
        </ThemedText>
        {showSkip && (
          <Button
            onPress={handleSkip}
            style={{ marginTop: Spacing.xl }}
            variant="secondary"
          >
            Skip Analysis
          </Button>
        )}
      </View>
    );
  }

  if (error || !analysis) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: theme.backgroundRoot },
        ]}
      >
        <Feather name="alert-circle" size={64} color={Colors.dark.primary} />
        <ThemedText
          type="h3"
          style={{ marginTop: Spacing.xl, textAlign: "center" }}
        >
          Analysis Unavailable
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
          {error ||
            "We couldn't analyze your photos. Your program is still ready!"}
        </ThemedText>
        <Button onPress={handleComplete} style={{ marginTop: Spacing.xl }}>
          Continue to Macros
        </Button>
      </View>
    );
  }

  // Format date for display
  const analysisDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Extract priority exercises from analysis if available
  const priorityExercises = (analysis as any).priorityExercises || [];

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>

      <LinearGradient
        colors={[Colors.dark.neonCyan + "15", Colors.dark.neonBlue + "10", "transparent"]}
        style={styles.gradient}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingTop: insets.top + Spacing.xl,
          paddingBottom: insets.bottom + 120,
          paddingHorizontal: Spacing.lg,
        }}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText type="small" style={styles.osVersion} glow glowColor={Colors.dark.neonCyan}>
          FITSYNC OS v2.0
        </ThemedText>
        <AnimatedView entering={FadeInDown.duration(400)} style={styles.header}>
          <ThemedText type="h2" style={styles.title} glow glowColor={Colors.dark.neonCyan} uppercase>
            Bio-Scan Analysis
          </ThemedText>
          <ThemedText type="small" style={[styles.date, { color: theme.textSecondary }]}>
            {analysisDate}
          </ThemedText>
        </AnimatedView>

        {/* Central Wireframe with Scanning Effect */}
        <AnimatedView entering={FadeInUp.delay(100).duration(400)} style={styles.wireframeContainer}>
          <WireframeGraphic type="body" size={200} opacity={0.4} />
          <View style={styles.scanningLine} />
        </AnimatedView>

        {/* Biometric Synthesis Panel */}
        <AnimatedView entering={FadeInUp.delay(200).duration(400)}>
          <GlowingPanel glowColor={Colors.dark.neonCyan} style={styles.biometricPanel}>
            <ThemedText type="h4" style={styles.panelTitle} uppercase glow glowColor={Colors.dark.neonCyan}>
              Biometric Synthesis
            </ThemedText>
            <View style={styles.metricRow}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>Body Fat:</ThemedText>
              <ThemedText type="body" style={{ color: Colors.dark.neonCyan, fontWeight: "700" }}>
                {(analysis as any).bodyFatEstimate ||
                  (typeof (analysis as any).bodyFatPercentage === "number"
                    ? `${(analysis as any).bodyFatPercentage.toFixed(1)}%`
                    : "N/A")}
              </ThemedText>
            </View>
            <View style={styles.metricRow}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>Symmetry Score:</ThemedText>
              <ThemedText type="body" style={{ color: Colors.dark.neonCyan, fontWeight: "700" }}>
                {analysis.overallScore}/100
              </ThemedText>
            </View>
            <View style={styles.metricRow}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>Posture Index:</ThemedText>
              <ThemedText type="body" style={{ color: Colors.dark.neonCyan, fontWeight: "700" }}>
                {analysis.postureIssues.length > 0 ? "Needs Attention" : "Good"}
              </ThemedText>
            </View>
          </GlowingPanel>
        </AnimatedView>

        {/* Target Acquisition Panel */}
        <AnimatedView entering={FadeInUp.delay(300).duration(400)}>
          <GlowingPanel glowColor={Colors.dark.neonOrange} style={styles.targetPanel}>
            <ThemedText type="h4" style={styles.panelTitle} uppercase glow glowColor={Colors.dark.neonOrange}>
              Target Acquisition (Weak Points)
            </ThemedText>
            {analysis.weakPoints.map((point) => (
              <View key={`weakpoint-${point}`} style={styles.weakPointTag}>
                <ThemedText type="small" style={{ color: Colors.dark.neonOrange }}>
                  {point}
                </ThemedText>
              </View>
            ))}
          </GlowingPanel>
        </AnimatedView>

        {/* Progress Bar */}
        <AnimatedView entering={FadeInUp.delay(400).duration(400)}>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: "100%" }]} />
            </View>
            <ThemedText type="small" style={styles.progressBarText} glow glowColor={Colors.dark.neonCyan}>
              ANALYSIS COMPLETE. GENERATING PROTOCOLS...
            </ThemedText>
          </View>
        </AnimatedView>

        {/* Overall Score Gauge */}
        <AnimatedView entering={FadeInUp.delay(500).duration(400)} style={styles.scoreGaugeContainer}>
          <ScoreGauge
            score={analysis.overallScore}
            maxScore={100}
            label="SCORE"
            size={140}
            strokeWidth={14}
          />
        </AnimatedView>

        {/* Progress Photos Comparison */}
        <AnimatedView entering={FadeInUp.delay(200).duration(400)}>
          <ProgressPhotoComparison
            frontPhoto={profile.progressPhotos?.front}
            backPhoto={profile.progressPhotos?.back}
            date={analysisDate}
          />
        </AnimatedView>

        {/* Overall Assessment Card */}
        <AnimatedView entering={FadeInUp.delay(300).duration(400)}>
          <Card elevation={2} style={styles.assessmentCard}>
            <View style={styles.assessmentHeader}>
              <Feather name="cpu" size={20} color={Colors.dark.primary} />
              <ThemedText type="h4" style={styles.assessmentTitle}>
                AI Coach Feedback
              </ThemedText>
            </View>
            {(analysis as any).photoAnalysis?.overallImpression && (
              <ThemedText
                type="body"
                style={[styles.assessmentText, { color: theme.textSecondary }]}
              >
                {(analysis as any).photoAnalysis.overallImpression}
              </ThemedText>
            )}
            {analysis.observations.length > 0 && (
              <View style={styles.observationsList}>
                {analysis.observations.map((note, i) => (
                  <ThemedText
                    key={i}
                    type="body"
                    style={[
                      styles.observationText,
                      { color: theme.textSecondary },
                    ]}
                  >
                    {note}
                  </ThemedText>
                ))}
              </View>
            )}
          </Card>
        </AnimatedView>

        {/* Key Insights */}
        {analysis.postureIssues.length > 0 && (
          <AnimatedView entering={FadeInUp.delay(400).duration(400)}>
            <KeyInsightsCard insights={analysis.postureIssues} />
          </AnimatedView>
        )}

        {/* Muscle Group Analysis */}
        <AnimatedView entering={FadeInUp.delay(500).duration(400)}>
          <ThemedText type="h3" style={styles.sectionTitle}>
            Muscle Group Analysis
          </ThemedText>
        </AnimatedView>

        {analysis.muscleRatings
          .filter((m) => m.status !== "not_visible")
          .map((muscle, index) => {
            // Convert rating from 1-10 scale to 1-100 for display
            const overallScore = Math.round((muscle.rating / 10) * 100);

            // Extract detailed metrics if available (from analysis response)
            const detailedMetrics = (muscle as any).detailedMetrics;

            return (
              <AnimatedView key={index} entering={FadeInUp.delay(600 + index * 50).duration(400)}>
                <AnalysisCard
                  muscle={muscle.muscle}
                  overallScore={overallScore}
                  size={detailedMetrics?.size}
                  definition={detailedMetrics?.definition}
                  symmetry={detailedMetrics?.symmetry}
                  proportion={detailedMetrics?.proportion}
                  status={muscle.status}
                  observations={muscle.observations}
                  visualKeywords={(muscle as any).visualKeywords || []}
                  priorityExercises={
                    (muscle as any).priorityExercises?.map((ex: any) => ({
                      name: ex.name || ex.exercise,
                      sets: ex.sets || "4",
                      reps: ex.reps || "8-12",
                      focus: ex.focus || ex.cue || "",
                    })) || []
                  }
                />
              </AnimatedView>
            );
          })}

        {/* Priority Exercises */}
        {priorityExercises.length > 0 && (
          <PriorityExerciseCard exercises={priorityExercises} />
        )}

        {/* Strong Points & Weak Points */}
        {(analysis.strongPoints.length > 0 || analysis.weakPoints.length > 0) && (
          <Card elevation={2} style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryColumn}>
                <View style={styles.summaryHeader}>
                  <Feather name="thumbs-up" size={16} color={Colors.dark.success} />
                  <ThemedText type="body" style={styles.summaryTitle}>
                    Strong Points
                  </ThemedText>
                </View>
                {analysis.strongPoints.map((point, i) => (
                  <View key={i} style={styles.summaryPoint}>
                    <View style={[styles.summaryDot, { backgroundColor: Colors.dark.success }]} />
                    <ThemedText type="small" style={[styles.summaryText, { color: theme.textSecondary }]}>
                      {point}
                    </ThemedText>
                  </View>
                ))}
              </View>

              {analysis.weakPoints.length > 0 && (
                <>
                  <View style={[styles.summaryDivider, { backgroundColor: theme.backgroundSecondary }]} />
                  <View style={styles.summaryColumn}>
                    <View style={styles.summaryHeader}>
                      <Feather name="target" size={16} color={Colors.dark.primary} />
                      <ThemedText type="body" style={styles.summaryTitle}>
                        Priority Areas
                      </ThemedText>
                    </View>
                    {analysis.weakPoints.map((point, i) => (
                      <View key={i} style={styles.summaryPoint}>
                        <View style={[styles.summaryDot, { backgroundColor: Colors.dark.primary }]} />
                        <ThemedText type="small" style={[styles.summaryText, { color: theme.textSecondary }]}>
                          {point}
                        </ThemedText>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </View>
          </Card>
        )}

        {/* Cycle Impact */}
        {(analysis as any).cycleImpact && (
          <Card
            elevation={1}
            style={[
              styles.cycleCard,
              { borderLeftColor: Colors.dark.primary, borderLeftWidth: 3 },
            ]}
          >
            <View style={styles.cycleHeader}>
              <Feather name="zap" size={18} color={Colors.dark.primary} />
              <ThemedText type="body" style={styles.cycleTitle}>
                Protocol Training Impact
              </ThemedText>
            </View>
            <ThemedText type="body" style={[styles.cycleText, { color: theme.textSecondary }]}>
              {(analysis as any).cycleImpact}
            </ThemedText>
          </Card>
        )}
      </ScrollView>

      <View
        style={[styles.footer, { paddingBottom: insets.bottom + Spacing.lg }]}
      >
        <Button onPress={handleComplete} testID="button-start-training">
          Start Training
        </Button>
      </View>
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
    paddingHorizontal: Spacing.xl,
  },
  gradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 400,
  },
  scrollView: {
    flex: 1,
  },
  osVersion: {
    alignSelf: "center",
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  header: {
    marginBottom: Spacing.xl,
    alignItems: "center",
  },
  title: {
    marginBottom: Spacing.xs,
    textAlign: "center",
  },
  date: {
    fontSize: 12,
  },
  wireframeContainer: {
    alignItems: "center",
    marginBottom: Spacing.xl,
    position: "relative",
    height: 250,
    justifyContent: "center",
  },
  scanningLine: {
    position: "absolute",
    width: "100%",
    height: 2,
    backgroundColor: Colors.dark.neonCyan,
    shadowColor: Colors.dark.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    top: "50%",
    transform: [{ translateY: -1 }],
  },
  biometricPanel: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  targetPanel: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  panelTitle: {
    marginBottom: Spacing.md,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  weakPointTag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.dark.neonOrange + "20",
    marginBottom: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.dark.neonOrange + "40",
  },
  progressBarContainer: {
    marginBottom: Spacing.xl,
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    overflow: "hidden",
    marginBottom: Spacing.sm,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: Colors.dark.neonCyan,
    borderRadius: 3,
  },
  progressBarText: {
    fontSize: 10,
    letterSpacing: 1,
    textAlign: "center",
  },
  scoreGaugeContainer: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  assessmentCard: {
    marginBottom: Spacing.xl,
  },
  assessmentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  assessmentTitle: {
    fontWeight: "700",
  },
  assessmentText: {
    lineHeight: 22,
    marginBottom: Spacing.sm,
  },
  observationsList: {
    gap: Spacing.sm,
  },
  observationText: {
    lineHeight: 22,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
  summaryCard: {
    marginBottom: Spacing.xl,
  },
  summaryRow: {
    flexDirection: "row",
    gap: Spacing.lg,
  },
  summaryColumn: {
    flex: 1,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  summaryTitle: {
    fontWeight: "600",
  },
  summaryPoint: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: Spacing.xs,
    gap: Spacing.xs,
  },
  summaryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 4,
  },
  summaryText: {
    flex: 1,
    lineHeight: 18,
  },
  summaryDivider: {
    width: 1,
    marginVertical: Spacing.xs,
  },
  cycleCard: {
    marginBottom: Spacing.xl,
  },
  cycleHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  cycleTitle: {
    fontWeight: "700",
  },
  cycleText: {
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(10, 10, 10, 0.95)",
  },
});
