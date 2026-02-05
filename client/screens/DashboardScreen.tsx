import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { format, subDays, addDays, isSameDay } from "date-fns";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInDown,
} from "react-native-reanimated";

const AnimatedView = Animated.createAnimatedComponent(View);

import { ThemedText } from "@/components/ThemedText";
import { MacroRing } from "@/components/MacroRing";
import { DailyReadinessCard } from "@/components/DailyReadinessCard";
import { Card } from "@/components/Card";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { storage, getUserProfile, getGeneratedProgram } from "@/lib/storage";
import { calculateRecoverySummary } from "@/lib/recovery";
import type { MacroTargets, DailyCheckIn, FoodEntry } from "@/types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<any>();

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [macroTargets, setMacroTargets] = useState<MacroTargets | null>(null);
  const [todayFood, setTodayFood] = useState<FoodEntry[]>([]);
  const [checkIns, setCheckIns] = useState<DailyCheckIn[]>([]);
  const [recoveryScore, setRecoveryScore] = useState<number | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const loadData = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const [userProfile, checkInData] = await Promise.all([
        getUserProfile(),
        storage.getDailyCheckIns(),
      ]);

      if (userProfile?.name) {
        setUserName(userProfile.name);
      }

      if (userProfile?.calculatedMacros) {
        setMacroTargets({
          calories: userProfile.calculatedMacros.calories,
          protein: userProfile.calculatedMacros.protein,
          carbs: userProfile.calculatedMacros.carbs,
          fat: userProfile.calculatedMacros.fat,
        });
      } else {
        const targets = await storage.getMacroTargets();
        setMacroTargets(targets || null);
      }

      setCheckIns(checkInData);

      const todayDate = format(new Date(), "yyyy-MM-dd");
      const todayEntries = await storage.getFoodEntries(todayDate);
      setTodayFood(todayEntries);

      const summary = calculateRecoverySummary(checkInData);
      setRecoveryScore(summary?.score ?? null);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const unsubscribe = navigation.addListener("focus", loadData);
    return unsubscribe;
  }, [loadData, navigation]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData(false);
    setRefreshing(false);
  }, [loadData]);

  const currentMacros = todayFood.reduce(
    (acc, entry) => ({
      calories: acc.calories + entry.calories,
      protein: acc.protein + entry.protein,
    }),
    { calories: 0, protein: 0 },
  );

  // Recovery History for Graph (last 7 days from actual data)
  const getRecoveryHistory = () => {
    const history: (number | null)[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const dStr = format(d, "yyyy-MM-dd");
      const checkIn = checkIns.find(c => c.date === dStr);
      // Use actual data or null for missing days
      history.push(checkIn?.readyScore ?? null);
    }
    return history;
  };

  // Weekly Calendar Generation
  const renderCalendarStrip = () => {
    const days = [];
    const startOfWeek = subDays(new Date(), new Date().getDay() - 1); // Start Monday

    for (let i = 0; i < 7; i++) {
      const d = addDays(startOfWeek, i);
      const isSelected = isSameDay(d, new Date()); // Highlight today
      const isToday = isSameDay(d, new Date());
      const dayKey = format(d, "yyyy-MM-dd");

      days.push(
        <View key={`calendar-${dayKey}`} style={[styles.dayColumn, isSelected && styles.selectedDayColumn]}>
          <ThemedText type="small" style={{ color: isSelected ? Colors.brand : theme.textSecondary, marginBottom: 4 }}>
            {format(d, "EEE")}
          </ThemedText>
          <ThemedText style={{ color: isSelected ? Colors.brand : theme.text, fontWeight: isSelected ? '700' : '400' }}>
            {format(d, "d")}
          </ThemedText>
          {/* Dot for activity */}
          <View style={[styles.activityDot, { backgroundColor: isSelected ? Colors.brand : 'transparent' }]} />
        </View>
      );
    }
    return <View style={styles.calendarStrip}>{days}</View>;
  };

  if (loading) {
    return <LoadingState message="Loading dashboard..." fullScreen />;
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to Load"
        message={error}
        onRetry={() => loadData()}
        fullScreen
      />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.headerContainer, { paddingTop: insets.top + Spacing.xl + 12 }]}>
        <View>
          <ThemedText style={{ color: theme.primary, fontWeight: '700', fontSize: 14, marginBottom: 4 }}>FitSync AI</ThemedText>
          <ThemedText type="h2" style={{ color: theme.text }}>Command Center</ThemedText>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable style={styles.bellButton} onPress={() => navigation.navigate("TierRanking")}>
            <Feather name="award" size={24} color={theme.primary} />
          </Pressable>
          <Pressable style={styles.bellButton}>
            <Feather name="bell" size={24} color={theme.text} />
            <View style={styles.bellBadge} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingBottom: tabBarHeight + Spacing.xl,
          paddingHorizontal: Spacing.lg,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
      >
        {/* Macro Tracking Section */}
        <AnimatedView entering={FadeInDown.duration(500).delay(100)}>
          <View style={styles.sectionHeader}>
            <ThemedText type="h4">Macro Tracking</ThemedText>
            <Feather name="sliders" size={20} color={theme.textSecondary} />
          </View>

          <View style={styles.macroRow}>
            {/* Progress (Calories) */}
            <MacroRing
              label="Progress"
              current={currentMacros.calories}
              target={macroTargets?.calories || 2500}
              color={Colors.dark.neonCyan}
              size={90}
              showPercentage
              unit="kcal"
            />

            {/* Volume (Protein) */}
            <MacroRing
              label="Volume"
              current={currentMacros.protein}
              target={macroTargets?.protein || 180}
              color="#A3E635"
              size={90}
              showPercentage
              unit="g"
            />

            {/* Metronome (Recovery/Sleep) - Mocked for now */}
            <MacroRing
              label="Metronome"
              current={7}
              target={8}
              color="#9B59B6"
              size={90}
              showPercentage
              unit="h"
            />
          </View>
          {/* Pagination Dots just for show to match mockup */}
          <View style={styles.paginationDots}>
            <View style={[styles.dot, { backgroundColor: theme.primary }]} />
            <View style={[styles.dot, { opacity: 0.3 }]} />
          </View>
        </AnimatedView>

        {/* Daily Readiness Section */}
        <AnimatedView entering={FadeInDown.duration(500).delay(200)}>
          <Pressable onPress={() => navigation.navigate("DailyCheckIn")}>
            <DailyReadinessCard
              score={recoveryScore}
              history={getRecoveryHistory()}
            />
          </Pressable>
        </AnimatedView>

        {/* Calendar Strip */}
        <AnimatedView entering={FadeInDown.duration(500).delay(300)}>
          {renderCalendarStrip()}
        </AnimatedView>

        {/* Bottom Nav Hint (visual overlap handled by tab bar) */}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bellButton: {
    padding: 8,
  },
  bellBadge: {
    position: 'absolute',
    right: 8,
    top: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.dark.error,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: Spacing.xl,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  calendarStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
  },
  dayColumn: {
    alignItems: 'center',
    gap: 2,
  },
  selectedDayColumn: {

  },
  activityDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
  }
});
