import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { format, subDays, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { storage } from "@/lib/storage";
import type { DailyCheckIn, WorkoutSession, FoodEntry } from "@/types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CHART_HEIGHT = 180;

type TimeRange = "7d" | "30d" | "90d";

interface ProgressStats {
  weightChange: number;
  avgSleep: number;
  avgRecovery: number;
  workoutsCompleted: number;
  avgCalories: number;
  proteinAdherence: number;
}

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [checkIns, setCheckIns] = useState<DailyCheckIn[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [checkInData, workoutData, foodData] = await Promise.all([
        storage.getDailyCheckIns(),
        storage.getWorkoutSessions(),
        storage.getFoodEntries(),
      ]);
      setCheckIns(checkInData);
      setWorkouts(workoutData);
      setFoodEntries(foodData);
    } catch (err) {
      setError("Failed to load analytics data");
      console.error("Analytics load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const daysInRange = useMemo(() => {
    switch (timeRange) {
      case "7d":
        return 7;
      case "30d":
        return 30;
      case "90d":
        return 90;
      default:
        return 30;
    }
  }, [timeRange]);

  const filteredCheckIns = useMemo(() => {
    const cutoffDate = subDays(new Date(), daysInRange);
    return checkIns.filter((c) => new Date(c.date) >= cutoffDate);
  }, [checkIns, daysInRange]);

  const stats: ProgressStats = useMemo(() => {
    if (filteredCheckIns.length === 0) {
      return {
        weightChange: 0,
        avgSleep: 0,
        avgRecovery: 0,
        workoutsCompleted: 0,
        avgCalories: 0,
        proteinAdherence: 0,
      };
    }

    const sorted = [...filteredCheckIns].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const firstWeight = sorted[0]?.weight || 0;
    const lastWeight = sorted[sorted.length - 1]?.weight || 0;
    const weightChange = lastWeight - firstWeight;

    const avgSleep =
      filteredCheckIns.reduce((sum, c) => sum + (c.sleepHours || 0), 0) /
      filteredCheckIns.length;

    const avgRecovery =
      filteredCheckIns.reduce((sum, c) => sum + (c.recoveryScore || 0), 0) /
      filteredCheckIns.length;

    const cutoffDate = subDays(new Date(), daysInRange);
    const workoutsInRange = workouts.filter(
      (w) => new Date(w.date) >= cutoffDate && w.completed
    );

    const foodInRange = foodEntries.filter(
      (f) => new Date(f.date) >= cutoffDate
    );
    const avgCalories =
      foodInRange.length > 0
        ? foodInRange.reduce((sum, f) => sum + (f.calories || 0), 0) /
          (foodInRange.length / 3) // Rough estimate of days
        : 0;

    return {
      weightChange: Math.round(weightChange * 10) / 10,
      avgSleep: Math.round(avgSleep * 10) / 10,
      avgRecovery: Math.round(avgRecovery),
      workoutsCompleted: workoutsInRange.length,
      avgCalories: Math.round(avgCalories),
      proteinAdherence: 85, // Placeholder - would need target comparison
    };
  }, [filteredCheckIns, workouts, foodEntries, daysInRange]);

  const weightData = useMemo(() => {
    if (filteredCheckIns.length === 0) return [];
    const sorted = [...filteredCheckIns]
      .filter((c) => c.weight)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return sorted.slice(-14).map((c) => ({
      date: c.date,
      value: c.weight,
    }));
  }, [filteredCheckIns]);

  const renderTimeRangeButton = (range: TimeRange, label: string) => {
    const isActive = timeRange === range;
    return (
      <Pressable
        style={[
          styles.rangeButton,
          isActive && { backgroundColor: Colors.dark.primary },
        ]}
        onPress={() => setTimeRange(range)}
      >
        <ThemedText
          type="small"
          style={[styles.rangeText, isActive && { color: "#FFFFFF" }]}
        >
          {label}
        </ThemedText>
      </Pressable>
    );
  };

  const renderStatCard = (
    icon: keyof typeof Feather.glyphMap,
    label: string,
    value: string | number,
    unit?: string,
    trend?: "up" | "down" | "neutral"
  ) => (
    <Card style={styles.statCard} elevation={1}>
      <View style={styles.statIcon}>
        <Feather name={icon} size={20} color={Colors.dark.primary} />
      </View>
      <ThemedText type="small" style={styles.statLabel}>
        {label}
      </ThemedText>
      <View style={styles.statValueRow}>
        <ThemedText type="h3" style={styles.statValue}>
          {value}
        </ThemedText>
        {unit && (
          <ThemedText type="small" style={styles.statUnit}>
            {unit}
          </ThemedText>
        )}
        {trend && trend !== "neutral" && (
          <Feather
            name={trend === "up" ? "trending-up" : "trending-down"}
            size={14}
            color={
              trend === "up" ? Colors.dark.success : Colors.dark.error
            }
            style={{ marginLeft: 4 }}
          />
        )}
      </View>
    </Card>
  );

  const renderMiniChart = () => {
    if (weightData.length < 2) return null;

    const values = weightData.map((d) => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    return (
      <Card style={styles.chartCard} elevation={2}>
        <View style={styles.chartHeader}>
          <ThemedText type="h4">Weight Trend</ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Last {weightData.length} check-ins
          </ThemedText>
        </View>
        <View style={styles.chartContainer}>
          {weightData.map((point, index) => {
            const height = ((point.value - min) / range) * (CHART_HEIGHT - 40);
            const isLast = index === weightData.length - 1;
            return (
              <View key={point.date} style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: Math.max(height, 4),
                      backgroundColor: isLast
                        ? Colors.dark.primary
                        : Colors.dark.primary + "60",
                    },
                  ]}
                />
                {isLast && (
                  <ThemedText type="small" style={styles.barLabel}>
                    {point.value}
                  </ThemedText>
                )}
              </View>
            );
          })}
        </View>
      </Card>
    );
  };

  if (loading) {
    return <LoadingState message="Loading analytics..." fullScreen />;
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to Load"
        message={error}
        onRetry={loadData}
        fullScreen
      />
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: headerHeight + Spacing.md },
      ]}
    >
      {/* Time Range Selector */}
      <View style={styles.rangeSelector}>
        {renderTimeRangeButton("7d", "7 Days")}
        {renderTimeRangeButton("30d", "30 Days")}
        {renderTimeRangeButton("90d", "90 Days")}
      </View>

      {/* Summary Stats */}
      <ThemedText type="h4" style={styles.sectionTitle}>
        Progress Summary
      </ThemedText>
      <View style={styles.statsGrid}>
        {renderStatCard(
          "activity",
          "Weight Change",
          stats.weightChange > 0 ? `+${stats.weightChange}` : stats.weightChange,
          "lbs",
          stats.weightChange > 0 ? "up" : stats.weightChange < 0 ? "down" : "neutral"
        )}
        {renderStatCard("moon", "Avg Sleep", stats.avgSleep, "hrs")}
        {renderStatCard("heart", "Recovery", stats.avgRecovery, "%")}
        {renderStatCard("check-circle", "Workouts", stats.workoutsCompleted)}
      </View>

      {/* Weight Chart */}
      {renderMiniChart()}

      {/* Weekly Overview */}
      <ThemedText type="h4" style={styles.sectionTitle}>
        This Week
      </ThemedText>
      <Card style={styles.weekCard} elevation={1}>
        <View style={styles.weekRow}>
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((dayLabel, index) => {
            const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
            const currentDay = subDays(new Date(), -index);
            const dayDate = format(
              new Date(weekStart.getTime() + index * 24 * 60 * 60 * 1000),
              "yyyy-MM-dd"
            );
            const hasCheckIn = checkIns.some((c) => c.date === dayDate);
            const hasWorkout = workouts.some(
              (w) => w.date === dayDate && w.completed
            );
            const isPast =
              new Date(weekStart.getTime() + index * 24 * 60 * 60 * 1000) <=
              new Date();

            return (
              <View key={`week-day-${dayDate}`} style={styles.weekDay}>
                <ThemedText
                  type="small"
                  style={{ color: theme.textSecondary }}
                >
                  {dayLabel.charAt(0)}
                </ThemedText>
                <View
                  style={[
                    styles.dayIndicator,
                    hasCheckIn && styles.dayActive,
                    hasWorkout && styles.dayWorkout,
                    !isPast && styles.dayFuture,
                  ]}
                >
                  {hasWorkout && (
                    <Feather name="check" size={12} color="#FFFFFF" />
                  )}
                </View>
              </View>
            );
          })}
        </View>
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.dark.primary }]} />
            <ThemedText type="small">Check-in</ThemedText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.dark.success }]} />
            <ThemedText type="small">Workout</ThemedText>
          </View>
        </View>
      </Card>

      {/* Insights */}
      <ThemedText type="h4" style={styles.sectionTitle}>
        Insights
      </ThemedText>
      <Card style={styles.insightCard} elevation={1}>
        <View style={styles.insightRow}>
          <Feather name="trending-up" size={20} color={Colors.dark.success} />
          <ThemedText type="body" style={styles.insightText}>
            {stats.avgSleep >= 7
              ? "Great sleep consistency! Keep it up."
              : "Try to get more sleep for better recovery."}
          </ThemedText>
        </View>
      </Card>
      <Card style={styles.insightCard} elevation={1}>
        <View style={styles.insightRow}>
          <Feather name="activity" size={20} color={Colors.dark.primary} />
          <ThemedText type="body" style={styles.insightText}>
            {stats.workoutsCompleted >= daysInRange / 7 * 3
              ? "Training consistency is excellent!"
              : "Try to increase your workout frequency."}
          </ThemedText>
        </View>
      </Card>

      <View style={{ height: insets.bottom + Spacing.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  rangeSelector: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  rangeButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
  },
  rangeText: {
    fontWeight: "600",
  },
  sectionTitle: {
    marginBottom: Spacing.md,
    marginTop: Spacing.md,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  statCard: {
    width: (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.sm) / 2,
    padding: Spacing.md,
  },
  statIcon: {
    marginBottom: Spacing.xs,
  },
  statLabel: {
    opacity: 0.7,
    marginBottom: Spacing.xs,
  },
  statValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  statValue: {
    fontWeight: "700",
  },
  statUnit: {
    marginLeft: Spacing.xs,
    opacity: 0.7,
  },
  chartCard: {
    padding: Spacing.md,
    marginTop: Spacing.lg,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  chartContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: CHART_HEIGHT,
    gap: 4,
  },
  barContainer: {
    flex: 1,
    alignItems: "center",
  },
  bar: {
    width: "80%",
    borderRadius: BorderRadius.xs,
    minHeight: 4,
  },
  barLabel: {
    marginTop: Spacing.xs,
    fontSize: 10,
    fontWeight: "600",
  },
  weekCard: {
    padding: Spacing.md,
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  weekDay: {
    alignItems: "center",
    gap: Spacing.xs,
  },
  dayIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  dayActive: {
    backgroundColor: Colors.dark.primary + "40",
  },
  dayWorkout: {
    backgroundColor: Colors.dark.success,
  },
  dayFuture: {
    opacity: 0.3,
  },
  legendRow: {
    flexDirection: "row",
    gap: Spacing.lg,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  insightCard: {
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  insightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  insightText: {
    flex: 1,
  },
});
