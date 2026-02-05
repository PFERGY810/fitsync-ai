import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  Pressable,
  FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { storage } from "@/lib/storage";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type TabType = "achievements" | "leaderboard";

interface Achievement {
  id: string;
  type: string;
  title: string;
  description: string;
  icon: keyof typeof Feather.glyphMap;
  points: number;
  unlocked: boolean;
  progress: number;
  target: number;
  category: "training" | "nutrition" | "consistency" | "milestones";
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  avatar?: string;
  isCurrentUser: boolean;
}

// Achievement definitions
const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, "unlocked" | "progress">[] = [
  // Training achievements
  {
    id: "first-workout",
    type: "training",
    title: "First Steps",
    description: "Complete your first workout",
    icon: "play",
    points: 10,
    target: 1,
    category: "training",
  },
  {
    id: "week-warrior",
    type: "training",
    title: "Week Warrior",
    description: "Complete 5 workouts in a week",
    icon: "calendar",
    points: 25,
    target: 5,
    category: "training",
  },
  {
    id: "iron-dedication",
    type: "training",
    title: "Iron Dedication",
    description: "Complete 50 total workouts",
    icon: "award",
    points: 100,
    target: 50,
    category: "training",
  },
  {
    id: "century-club",
    type: "training",
    title: "Century Club",
    description: "Complete 100 total workouts",
    icon: "star",
    points: 250,
    target: 100,
    category: "training",
  },
  // Nutrition achievements
  {
    id: "macro-master",
    type: "nutrition",
    title: "Macro Master",
    description: "Hit your macro targets for 7 days straight",
    icon: "target",
    points: 50,
    target: 7,
    category: "nutrition",
  },
  {
    id: "food-logger",
    type: "nutrition",
    title: "Food Logger",
    description: "Log 100 food entries",
    icon: "edit-3",
    points: 30,
    target: 100,
    category: "nutrition",
  },
  {
    id: "protein-pro",
    type: "nutrition",
    title: "Protein Pro",
    description: "Hit protein goal 30 days in a row",
    icon: "zap",
    points: 75,
    target: 30,
    category: "nutrition",
  },
  // Consistency achievements
  {
    id: "early-bird",
    type: "consistency",
    title: "Early Bird",
    description: "Complete a check-in before 8 AM",
    icon: "sunrise",
    points: 10,
    target: 1,
    category: "consistency",
  },
  {
    id: "streak-starter",
    type: "consistency",
    title: "Streak Starter",
    description: "Maintain a 7-day check-in streak",
    icon: "trending-up",
    points: 25,
    target: 7,
    category: "consistency",
  },
  {
    id: "month-master",
    type: "consistency",
    title: "Month Master",
    description: "Maintain a 30-day check-in streak",
    icon: "award",
    points: 100,
    target: 30,
    category: "consistency",
  },
  // Milestone achievements
  {
    id: "weight-watcher",
    type: "milestones",
    title: "Weight Watcher",
    description: "Track your weight for 30 days",
    icon: "activity",
    points: 40,
    target: 30,
    category: "milestones",
  },
  {
    id: "photo-finisher",
    type: "milestones",
    title: "Photo Finisher",
    description: "Upload 10 progress photos",
    icon: "camera",
    points: 30,
    target: 10,
    category: "milestones",
  },
];

export default function AchievementsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("achievements");
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Load local data to calculate achievement progress
      const [workouts, checkIns, foodEntries, photos] = await Promise.all([
        storage.getWorkoutSessions(),
        storage.getDailyCheckIns(),
        storage.getFoodEntries(),
        storage.getPhysiquePhotos(),
      ]);

      // Calculate progress for each achievement
      const completedWorkouts = workouts.filter((w) => w.completed).length;
      const totalCheckIns = checkIns.length;
      const totalFoodEntries = foodEntries.length;
      const totalPhotos = photos.length;

      const calculatedAchievements: Achievement[] = ACHIEVEMENT_DEFINITIONS.map(
        (def) => {
          let progress = 0;

          switch (def.id) {
            case "first-workout":
            case "iron-dedication":
            case "century-club":
              progress = completedWorkouts;
              break;
            case "week-warrior":
              // Calculate workouts this week
              const weekStart = new Date();
              weekStart.setDate(weekStart.getDate() - weekStart.getDay());
              progress = workouts.filter(
                (w) => w.completed && new Date(w.date) >= weekStart
              ).length;
              break;
            case "food-logger":
              progress = totalFoodEntries;
              break;
            case "streak-starter":
            case "month-master":
              // Calculate check-in streak
              progress = Math.min(totalCheckIns, def.target);
              break;
            case "weight-watcher":
              progress = checkIns.filter((c) => c.weight).length;
              break;
            case "photo-finisher":
              progress = totalPhotos;
              break;
            default:
              progress = 0;
          }

          return {
            ...def,
            progress: Math.min(progress, def.target),
            unlocked: progress >= def.target,
          };
        }
      );

      setAchievements(calculatedAchievements);

      // Mock leaderboard data (would come from server in production)
      const mockLeaderboard: LeaderboardEntry[] = [
        { rank: 1, name: "FitnessPro", score: 2450, isCurrentUser: false },
        { rank: 2, name: "IronMike", score: 2180, isCurrentUser: false },
        { rank: 3, name: "GymRat99", score: 1920, isCurrentUser: false },
        { rank: 4, name: "You", score: calculatedAchievements.reduce((sum, a) => sum + (a.unlocked ? a.points : 0), 0), isCurrentUser: true },
        { rank: 5, name: "HealthyLiving", score: 1540, isCurrentUser: false },
        { rank: 6, name: "MuscleMike", score: 1320, isCurrentUser: false },
        { rank: 7, name: "FitFam", score: 1180, isCurrentUser: false },
        { rank: 8, name: "Gains4Days", score: 980, isCurrentUser: false },
        { rank: 9, name: "WorkoutWonder", score: 850, isCurrentUser: false },
        { rank: 10, name: "LiftLife", score: 720, isCurrentUser: false },
      ].sort((a, b) => b.score - a.score).map((e, i) => ({ ...e, rank: i + 1 }));

      setLeaderboard(mockLeaderboard);
    } catch (err) {
      setError("Failed to load achievements data");
      console.error("Achievements load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const totalPoints = useMemo(() => {
    return achievements.reduce(
      (sum, a) => sum + (a.unlocked ? a.points : 0),
      0
    );
  }, [achievements]);

  const unlockedCount = useMemo(() => {
    return achievements.filter((a) => a.unlocked).length;
  }, [achievements]);

  const categoryColor = (category: Achievement["category"]) => {
    switch (category) {
      case "training":
        return Colors.dark.primary;
      case "nutrition":
        return Colors.dark.success;
      case "consistency":
        return Colors.dark.warning;
      case "milestones":
        return "#9C27B0";
      default:
        return theme.textSecondary;
    }
  };

  const renderAchievementCard = (achievement: Achievement, index: number) => (
    <Animated.View
      key={achievement.id}
      entering={FadeInDown.delay(index * 50).duration(300)}
    >
      <Card
        style={[
          styles.achievementCard,
          !achievement.unlocked && styles.lockedCard,
        ]}
        elevation={achievement.unlocked ? 2 : 1}
      >
        <View
          style={[
            styles.achievementIcon,
            {
              backgroundColor: achievement.unlocked
                ? categoryColor(achievement.category) + "20"
                : theme.surface,
            },
          ]}
        >
          <Feather
            name={achievement.icon}
            size={24}
            color={
              achievement.unlocked
                ? categoryColor(achievement.category)
                : theme.textSecondary
            }
          />
        </View>
        <View style={styles.achievementContent}>
          <View style={styles.achievementHeader}>
            <ThemedText
              type="body"
              style={[
                styles.achievementTitle,
                !achievement.unlocked && { opacity: 0.6 },
              ]}
            >
              {achievement.title}
            </ThemedText>
            <ThemedText
              type="small"
              style={{ color: categoryColor(achievement.category) }}
            >
              {achievement.points} pts
            </ThemedText>
          </View>
          <ThemedText
            type="small"
            style={[styles.achievementDesc, { color: theme.textSecondary }]}
          >
            {achievement.description}
          </ThemedText>
          {!achievement.unlocked && (
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { backgroundColor: theme.surface }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${(achievement.progress / achievement.target) * 100}%`,
                      backgroundColor: categoryColor(achievement.category),
                    },
                  ]}
                />
              </View>
              <ThemedText type="small" style={styles.progressText}>
                {achievement.progress}/{achievement.target}
              </ThemedText>
            </View>
          )}
        </View>
        {achievement.unlocked && (
          <Feather name="check-circle" size={20} color={Colors.dark.success} />
        )}
      </Card>
    </Animated.View>
  );

  const renderLeaderboardItem = ({
    item,
    index,
  }: {
    item: LeaderboardEntry;
    index: number;
  }) => (
    <Animated.View entering={FadeInDown.delay(index * 30).duration(200)}>
      <Card
        style={[
          styles.leaderboardItem,
          item.isCurrentUser && styles.currentUserItem,
        ]}
        elevation={item.isCurrentUser ? 2 : 1}
      >
        <View
          style={[
            styles.rankBadge,
            item.rank <= 3 && styles.topRankBadge,
            item.rank === 1 && { backgroundColor: "#FFD700" },
            item.rank === 2 && { backgroundColor: "#C0C0C0" },
            item.rank === 3 && { backgroundColor: "#CD7F32" },
          ]}
        >
          <ThemedText
            type="small"
            style={[
              styles.rankText,
              item.rank <= 3 && { color: "#000" },
            ]}
          >
            {item.rank}
          </ThemedText>
        </View>
        <View style={styles.userInfo}>
          <View style={styles.avatarPlaceholder}>
            <Feather name="user" size={16} color={theme.textSecondary} />
          </View>
          <ThemedText
            type="body"
            style={[item.isCurrentUser && { fontWeight: "700" }]}
          >
            {item.name}
          </ThemedText>
        </View>
        <ThemedText type="h4" style={{ color: Colors.dark.primary }}>
          {item.score.toLocaleString()}
        </ThemedText>
      </Card>
    </Animated.View>
  );

  if (loading) {
    return <LoadingState message="Loading achievements..." fullScreen />;
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
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: headerHeight + Spacing.md },
        ]}
        stickyHeaderIndices={[1]}
      >
        {/* Stats Header */}
        <View style={styles.statsHeader}>
          <Card style={styles.statBox} elevation={2}>
            <ThemedText type="h2" style={styles.statNumber}>
              {totalPoints}
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Total Points
            </ThemedText>
          </Card>
          <Card style={styles.statBox} elevation={2}>
            <ThemedText type="h2" style={styles.statNumber}>
              {unlockedCount}/{achievements.length}
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Unlocked
            </ThemedText>
          </Card>
        </View>

        {/* Tab Selector */}
        <View style={[styles.tabContainer, { backgroundColor: theme.backgroundRoot }]}>
          <Pressable
            style={[
              styles.tab,
              activeTab === "achievements" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("achievements")}
          >
            <Feather
              name="award"
              size={18}
              color={
                activeTab === "achievements"
                  ? Colors.dark.primary
                  : theme.textSecondary
              }
            />
            <ThemedText
              type="body"
              style={[
                styles.tabText,
                activeTab === "achievements" && styles.activeTabText,
              ]}
            >
              Achievements
            </ThemedText>
          </Pressable>
          <Pressable
            style={[
              styles.tab,
              activeTab === "leaderboard" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("leaderboard")}
          >
            <Feather
              name="bar-chart-2"
              size={18}
              color={
                activeTab === "leaderboard"
                  ? Colors.dark.primary
                  : theme.textSecondary
              }
            />
            <ThemedText
              type="body"
              style={[
                styles.tabText,
                activeTab === "leaderboard" && styles.activeTabText,
              ]}
            >
              Leaderboard
            </ThemedText>
          </Pressable>
        </View>

        {/* Content */}
        {activeTab === "achievements" ? (
          <View style={styles.achievementsList}>
            {achievements.map((achievement, index) =>
              renderAchievementCard(achievement, index)
            )}
          </View>
        ) : (
          <View style={styles.leaderboardList}>
            {leaderboard.map((entry, index) =>
              renderLeaderboardItem({ item: entry, index })
            )}
          </View>
        )}

        <View style={{ height: insets.bottom + Spacing.xl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  statsHeader: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statBox: {
    flex: 1,
    padding: Spacing.md,
    alignItems: "center",
  },
  statNumber: {
    fontWeight: "700",
    color: Colors.dark.primary,
    marginBottom: Spacing.xs,
  },
  tabContainer: {
    flexDirection: "row",
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  activeTab: {
    backgroundColor: Colors.dark.primary + "20",
  },
  tabText: {
    fontWeight: "500",
  },
  activeTabText: {
    color: Colors.dark.primary,
    fontWeight: "600",
  },
  achievementsList: {
    gap: Spacing.sm,
  },
  achievementCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    gap: Spacing.md,
  },
  lockedCard: {
    opacity: 0.8,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  achievementContent: {
    flex: 1,
  },
  achievementHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  achievementTitle: {
    fontWeight: "600",
  },
  achievementDesc: {
    marginBottom: Spacing.xs,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  progressText: {
    minWidth: 40,
    textAlign: "right",
    opacity: 0.7,
  },
  leaderboardList: {
    gap: Spacing.sm,
  },
  leaderboardItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    gap: Spacing.md,
  },
  currentUserItem: {
    borderWidth: 1,
    borderColor: Colors.dark.primary,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  topRankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  rankText: {
    fontWeight: "700",
  },
  userInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
});
