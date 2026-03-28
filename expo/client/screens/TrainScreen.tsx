import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { View, StyleSheet, FlatList, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { format, addDays, startOfWeek } from "date-fns";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { getUserProfile, getGeneratedProgram } from "@/lib/storage";
import { TEMPLATE_PROGRAMS, DEFAULT_PROGRAM } from "@/data/template-programs";
import type { Exercise } from "@/types";

// Memoized Exercise Card for better FlatList performance
const ExerciseCard = memo(function ExerciseCard({
  item,
  onPress,
  onInfoPress,
  theme,
}: {
  item: Exercise;
  onPress: () => void;
  onInfoPress: () => void;
  theme: ReturnType<typeof useTheme>["theme"];
}) {
  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [onPress]);

  return (
    <Card elevation={2} style={styles.exerciseCard} onPress={handlePress}>
      <View style={styles.exerciseHeader}>
        <View style={{ flex: 1 }}>
          <ThemedText type="body" style={{ fontWeight: "600" }}>
            {item.name}
          </ThemedText>
        </View>
        <Pressable
          onPress={onInfoPress}
          hitSlop={8}
          style={styles.infoButton}
        >
          <Feather name="info" size={18} color={Colors.dark.primary} />
        </Pressable>
        <Feather name="chevron-right" size={20} color={theme.textSecondary} />
      </View>
      <View style={styles.exerciseDetails}>
        <View style={styles.detailChip}>
          <ThemedText type="small" style={{ color: Colors.dark.primary }}>
            {item.sets} x {item.reps}
          </ThemedText>
        </View>
        <View style={styles.detailChip}>
          <ThemedText type="small" style={{ color: Colors.dark.warning }}>
            RIR {item.targetRIR}
          </ThemedText>
        </View>
        {item.tempo ? (
          <View style={styles.detailChip}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {item.tempo}
            </ThemedText>
          </View>
        ) : null}
      </View>
    </Card>
  );
});

// Memoized Day Button for week row
const DayButton = memo(function DayButton({
  day,
  index,
  isSelected,
  isRest,
  onSelect,
}: {
  day: { name: string; date: string; isToday: boolean };
  index: number;
  isSelected: boolean;
  isRest: boolean;
  onSelect: (index: number) => void;
}) {
  const handlePress = useCallback(() => {
    Haptics.selectionAsync();
    onSelect(index);
  }, [index, onSelect]);

  return (
    <Pressable
      onPress={handlePress}
      style={[
        styles.dayButton,
        isSelected && { backgroundColor: Colors.dark.primary },
        day.isToday && !isSelected && { borderColor: Colors.dark.primary, borderWidth: 2 },
      ]}
    >
      <ThemedText
        type="small"
        style={[styles.dayName, isSelected && { color: "#FFFFFF" }]}
      >
        {day.name}
      </ThemedText>
      <ThemedText style={[styles.dayDate, isSelected && { color: "#FFFFFF" }]}>
        {day.date}
      </ThemedText>
      {!isRest ? (
        <View
          style={[
            styles.indicator,
            { backgroundColor: isSelected ? "#FFFFFF" : Colors.dark.primary },
          ]}
        />
      ) : null}
    </Pressable>
  );
});

export default function TrainScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<any>();

  const [selectedDay, setSelectedDay] = useState(0);
  const [weeklyProgram, setWeeklyProgram] = useState(DEFAULT_PROGRAM);
  const [isAIGenerated, setIsAIGenerated] = useState(false);
  const [programName, setProgramName] = useState<string | null>(null);
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });

  const loadProgram = useCallback(async () => {
    const [profile, generatedProgram] = await Promise.all([
      getUserProfile(),
      getGeneratedProgram(),
    ]);

    if (generatedProgram?.schedule) {
      const converted = generatedProgram.schedule.map((day: any) => ({
        day: day.name || `Day ${day.day}`,
        muscleGroups: day.muscleGroups || ["Training"],
        exercises: (day.exercises || []).map((ex: any, idx: number) => ({
          id: `${day.day}-${idx}`,
          name: ex.name,
          muscleGroup: ex.muscleGroup || day.muscleGroups?.[0] || "General",
          sets: ex.sets || 3,
          reps: ex.repRange || ex.reps || "8-12",
          targetRIR: ex.targetRIR || ex.rir || 2,
          tempo: ex.tempo,
        })),
      }));
      while (converted.length < 7) {
        converted.push({
          day:
            [
              "Sunday",
              "Saturday",
              "Friday",
              "Thursday",
              "Wednesday",
              "Tuesday",
              "Monday",
            ][7 - converted.length] || "Rest Day",
          muscleGroups: ["Rest"],
          exercises: [],
        });
      }
      setWeeklyProgram(converted);
      setIsAIGenerated(true);
      setProgramName(generatedProgram.programName || "AI-Generated Program");
      return;
    }

    setIsAIGenerated(false);
    setProgramName(null);

    if (profile?.trainingProgram?.templateName) {
      const template = TEMPLATE_PROGRAMS[profile.trainingProgram.templateName];
      if (template) {
        setWeeklyProgram(template);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProgram();
    }, [loadProgram]),
  );

  useEffect(() => {
    const todayIndex = new Date().getDay();
    const mondayBasedIndex = todayIndex === 0 ? 6 : todayIndex - 1;
    setSelectedDay(mondayBasedIndex);
  }, []);

  // Memoize weekDays calculation
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(weekStart, i);
      return {
        name: format(date, "EEE"),
        date: format(date, "d"),
        fullDate: format(date, "yyyy-MM-dd"),
        isToday: format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd"),
      };
    });
  }, [weekStart]);

  const currentDayProgram = weeklyProgram[selectedDay];

  // Memoized day select handler
  const handleDaySelect = useCallback((index: number) => {
    setSelectedDay(index);
  }, []);

  // Memoized render function for exercises
  const renderExercise = useCallback(
    ({ item }: { item: Exercise }) => (
      <ExerciseCard
        item={item}
        theme={theme}
        onPress={() => navigation.navigate("WorkoutSession", { exercise: item })}
        onInfoPress={() => navigation.navigate("ExerciseDetail", { exercise: item })}
      />
    ),
    [theme, navigation]
  );

  // Key extractor memoized
  const keyExtractor = useCallback((item: Exercise) => item.id, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.header, { paddingTop: headerHeight + Spacing.md }]}>
        {isAIGenerated && programName ? (
          <View style={styles.programBadge}>
            <Feather name="cpu" size={14} color={Colors.dark.success} />
            <ThemedText
              type="small"
              style={{ color: Colors.dark.success, marginLeft: Spacing.xs }}
            >
              {programName}
            </ThemedText>
          </View>
        ) : (
          <Pressable
            style={[
              styles.generateBanner,
              { backgroundColor: Colors.dark.primary + "20" },
            ]}
            onPress={() => navigation.navigate("AICoach")}
          >
            <View style={styles.bannerContent}>
              <Feather name="cpu" size={18} color={Colors.dark.primary} />
              <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                <ThemedText type="small" style={{ fontWeight: "600" }}>
                  Using Template Program
                </ThemedText>
                <ThemedText
                  type="small"
                  style={{ color: theme.textSecondary, fontSize: 12 }}
                >
                  Tap to generate a personalized AI program
                </ThemedText>
              </View>
              <Feather
                name="chevron-right"
                size={18}
                color={Colors.dark.primary}
              />
            </View>
          </Pressable>
        )}

        <View style={styles.weekRow}>
          {weekDays.map((day, index) => (
            <DayButton
              key={`day-${day.date}`}
              day={day}
              index={index}
              isSelected={selectedDay === index}
              isRest={weeklyProgram[index].muscleGroups[0] === "Rest"}
              onSelect={handleDaySelect}
            />
          ))}
        </View>
        <View style={styles.dayInfo}>
          <ThemedText type="h3">{currentDayProgram.day}</ThemedText>
          <View style={styles.muscleTagsRow}>
            {currentDayProgram.muscleGroups.map((group) => (
              <View key={`muscle-${group}`} style={styles.muscleTag}>
                <ThemedText type="small" style={{ color: Colors.dark.primary }}>
                  {group}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>
      </View>

      <FlatList
        data={currentDayProgram.exercises}
        keyExtractor={keyExtractor}
        renderItem={renderExercise}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={5}
        contentContainerStyle={[
          styles.exerciseList,
          { paddingBottom: tabBarHeight + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="coffee"
            title="Rest Day"
            description="No training scheduled. Focus on recovery, sleep, and nutrition today."
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
  },
  dayButton: {
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    minWidth: 44,
  },
  dayName: {
    marginBottom: 2,
  },
  dayDate: {
    fontSize: 18,
    fontWeight: "700",
  },
  indicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
  },
  dayInfo: {
    marginBottom: Spacing.sm,
  },
  muscleTagsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  muscleTag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
    backgroundColor: "rgba(255, 69, 0, 0.15)",
  },
  exerciseList: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  exerciseCard: {
    marginBottom: Spacing.md,
  },
  exerciseHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  infoButton: {
    padding: Spacing.xs,
    marginRight: Spacing.sm,
  },
  exerciseDetails: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  detailChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  programBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  generateBanner: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: "rgba(255, 69, 0, 0.3)",
  },
  bannerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
});
