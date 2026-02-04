import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import {
  getUserProfile,
  getGeneratedProgram,
  getTodayCheckIn,
} from "@/lib/storage";
import { getApiUrl } from "@/lib/query-client";
import type { DailyCheckIn } from "@/types";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [profile, setProfile] = useState<any>(null);
  const [program, setProgram] = useState<any>(null);
  const [checkIn, setCheckIn] = useState<DailyCheckIn | null>(null);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    loadData();
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const loadData = async () => {
    const [userProfile, generatedProgram, todayCheckIn] = await Promise.all([
      getUserProfile(),
      getGeneratedProgram(),
      getTodayCheckIn(),
    ]);
    console.log(
      "Home screen loaded profile:",
      JSON.stringify({
        calculatedMacros: userProfile?.calculatedMacros,
        macros: userProfile?.macros,
      }),
    );
    console.log("Home screen loaded program:", generatedProgram?.programName);
    setProfile(userProfile);
    setProgram(generatedProgram);
    setCheckIn(todayCheckIn);
    setLoading(false);
  };

  const calculateRecoveryScore = (): number => {
    if (!checkIn) return 0;
    const sleepScore = Math.min((checkIn.sleepHours || 0) / 8, 1) * 40;
    const stressScore = ((10 - (checkIn.stressLevel || 5)) / 10) * 30;
    const sorenessScore = ((10 - (checkIn.sorenessLevel || 5)) / 10) * 30;
    return Math.round(sleepScore + stressScore + sorenessScore);
  };

  const getRecoveryColor = (score: number): string => {
    if (score >= 80) return Colors.dark.success;
    if (score >= 60) return Colors.dark.primary;
    if (score >= 40) return Colors.dark.warning;
    return Colors.dark.error;
  };

  const getRecoveryLabel = (score: number): string => {
    if (score >= 80) return "Optimal";
    if (score >= 60) return "Good";
    if (score >= 40) return "Moderate";
    return "Low";
  };

  const recoveryScore = calculateRecoveryScore();

  const askQuestion = async () => {
    if (!question.trim() || asking) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: question.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");
    setAsking(true);

    try {
      const response = await fetch(
        new URL("/api/coach/chat", getApiUrl()).toString(),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: question.trim(),
            profile,
            profileId: profile?.id,
            userId: profile?.userId,
            context: {
              program,
              cycleInfo: profile?.cycleInfo,
              macros: profile?.calculatedMacros,
            },
          }),
        },
      );

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          data.response ||
          data.message ||
          "I'm here to help with your training and nutrition questions.",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I had trouble processing that. Try asking about training, nutrition, or your current program.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setAsking(false);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const getTodayWorkout = () => {
    if (!program?.schedule) return null;
    const dayOfWeek = new Date().getDay();
    const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    return program.schedule[dayIndex % program.schedule.length];
  };

  const todayWorkout = getTodayWorkout();

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: theme.backgroundRoot },
        ]}
      >
        <ActivityIndicator size="large" color={Colors.dark.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={headerHeight}
    >
      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: tabBarHeight + 100,
          paddingHorizontal: Spacing.lg,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <ThemedText type="h2" style={styles.greeting}>
          Welcome back{profile?.sex === "male" ? ", King" : ""}
        </ThemedText>

        <View style={styles.recoveryRow}>
          <Card elevation={2} style={styles.recoveryCard}>
            <View style={styles.recoveryContent}>
              <Feather
                name="heart"
                size={20}
                color={
                  checkIn
                    ? getRecoveryColor(recoveryScore)
                    : theme.textSecondary
                }
              />
              <View style={{ marginLeft: Spacing.md, flex: 1 }}>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Recovery
                </ThemedText>
                {checkIn ? (
                  <View style={styles.recoveryValue}>
                    <ThemedText
                      type="h3"
                      style={{ color: getRecoveryColor(recoveryScore) }}
                    >
                      {recoveryScore}%
                    </ThemedText>
                    <ThemedText
                      type="small"
                      style={{
                        color: getRecoveryColor(recoveryScore),
                        marginLeft: Spacing.sm,
                      }}
                    >
                      {getRecoveryLabel(recoveryScore)}
                    </ThemedText>
                  </View>
                ) : (
                  <ThemedText
                    type="body"
                    style={{ color: theme.textSecondary }}
                  >
                    No check-in today
                  </ThemedText>
                )}
              </View>
            </View>
          </Card>
          <Card elevation={2} style={styles.recoveryCard}>
            <View style={styles.recoveryContent}>
              <Feather name="moon" size={20} color={Colors.dark.info} />
              <View style={{ marginLeft: Spacing.md, flex: 1 }}>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Sleep
                </ThemedText>
                <ThemedText type="h3" style={{ color: Colors.dark.info }}>
                  {checkIn?.sleepHours || "--"} hrs
                </ThemedText>
              </View>
            </View>
          </Card>
        </View>

        <View style={styles.recoveryRow}>
          <Card elevation={2} style={styles.recoveryCard}>
            <View style={styles.recoveryContent}>
              <Feather name="zap" size={20} color={Colors.dark.warning} />
              <View style={{ marginLeft: Spacing.md, flex: 1 }}>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Stress
                </ThemedText>
                <ThemedText type="h3" style={{ color: Colors.dark.warning }}>
                  {checkIn?.stressLevel || "--"}/10
                </ThemedText>
              </View>
            </View>
          </Card>
          <Card elevation={2} style={styles.recoveryCard}>
            <View style={styles.recoveryContent}>
              <Feather name="thermometer" size={20} color={Colors.dark.error} />
              <View style={{ marginLeft: Spacing.md, flex: 1 }}>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Soreness
                </ThemedText>
                <ThemedText type="h3" style={{ color: Colors.dark.error }}>
                  {checkIn?.sorenessLevel || "--"}/10
                </ThemedText>
              </View>
            </View>
          </Card>
        </View>

        {profile?.isOnCycle && profile?.cycleInfo ? (
          <Card
            elevation={2}
            style={{ ...styles.cycleCard, borderColor: Colors.dark.primary }}
          >
            <View style={styles.cycleHeader}>
              <Feather name="activity" size={18} color={Colors.dark.primary} />
              <ThemedText
                type="body"
                style={{ fontWeight: "700", marginLeft: Spacing.sm }}
              >
                Current Cycle
              </ThemedText>
              <ThemedText
                type="small"
                style={{ color: theme.textSecondary, marginLeft: "auto" }}
              >
                Week {profile.cycleInfo.weeksIn}/{profile.cycleInfo.totalWeeks}
              </ThemedText>
            </View>
            <View style={styles.compoundsRow}>
              {profile.cycleInfo.compounds?.map((c: any, i: number) => (
                <View
                  key={i}
                  style={[
                    styles.compoundChip,
                    { backgroundColor: "rgba(255, 69, 0, 0.15)" },
                  ]}
                >
                  <ThemedText
                    type="small"
                    style={{ color: Colors.dark.primary }}
                  >
                    {c.name.split(" ")[0]} {c.dosageAmount}
                    {c.dosageUnit}
                  </ThemedText>
                </View>
              ))}
            </View>
          </Card>
        ) : null}

        {todayWorkout ? (
          <Card elevation={2} style={styles.workoutCard}>
            <View style={styles.workoutHeader}>
              <View>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  {"Today's Workout"}
                </ThemedText>
                <ThemedText type="h3">{todayWorkout.name}</ThemedText>
              </View>
              <View style={styles.muscleGroups}>
                {todayWorkout.muscleGroups?.map((mg: string, i: number) => (
                  <View
                    key={i}
                    style={[
                      styles.muscleTag,
                      { backgroundColor: Colors.dark.primary },
                    ]}
                  >
                    <ThemedText type="small" style={{ color: "#FFF" }}>
                      {mg}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </View>
            {todayWorkout.exercises?.slice(0, 4).map((ex: any, i: number) => (
              <View key={i} style={styles.exerciseRow}>
                <ThemedText type="body">{ex.name}</ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  {ex.sets}x{ex.repRange} RIR {ex.targetRIR}
                </ThemedText>
              </View>
            ))}
            {todayWorkout.exercises?.length > 4 ? (
              <ThemedText
                type="small"
                style={{ color: theme.textSecondary, marginTop: Spacing.sm }}
              >
                +{todayWorkout.exercises.length - 4} more exercises
              </ThemedText>
            ) : null}
          </Card>
        ) : null}

        <Card elevation={2} style={styles.macrosCard}>
          <ThemedText
            type="body"
            style={{ fontWeight: "600", marginBottom: Spacing.md }}
          >
            Daily Targets
          </ThemedText>
          <View style={styles.macrosGrid}>
            <View style={styles.macroItem}>
              <ThemedText type="h3" style={{ color: Colors.dark.primary }}>
                {profile?.calculatedMacros?.calories ?? "N/A"}
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                kcal
              </ThemedText>
            </View>
            <View style={styles.macroItem}>
              <ThemedText type="h3" style={{ color: Colors.dark.protein }}>
                {profile?.calculatedMacros?.protein !== undefined
                  ? `${profile.calculatedMacros.protein}g`
                  : "N/A"}
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Protein
              </ThemedText>
            </View>
            <View style={styles.macroItem}>
              <ThemedText type="h3" style={{ color: Colors.dark.carbs }}>
                {profile?.calculatedMacros?.carbs !== undefined
                  ? `${profile.calculatedMacros.carbs}g`
                  : "N/A"}
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Carbs
              </ThemedText>
            </View>
            <View style={styles.macroItem}>
              <ThemedText type="h3" style={{ color: Colors.dark.fat }}>
                {profile?.calculatedMacros?.fat !== undefined
                  ? `${profile.calculatedMacros.fat}g`
                  : "N/A"}
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Fat
              </ThemedText>
            </View>
          </View>
        </Card>

        <Card elevation={2} style={styles.chatCard}>
          <View style={styles.chatHeader}>
            <Feather name="cpu" size={18} color={Colors.dark.primary} />
            <ThemedText
              type="body"
              style={{ fontWeight: "700", marginLeft: Spacing.sm }}
            >
              Ask AI Coach
            </ThemedText>
          </View>

          {messages.length > 0 ? (
            <View style={styles.messagesContainer}>
              {messages.map((msg) => (
                <View
                  key={msg.id}
                  style={[
                    styles.messageRow,
                    msg.role === "user"
                      ? styles.userMessage
                      : styles.assistantMessage,
                  ]}
                >
                  <ThemedText
                    type="body"
                    style={msg.role === "user" ? { color: "#FFF" } : undefined}
                  >
                    {msg.content}
                  </ThemedText>
                </View>
              ))}
              {asking ? (
                <View style={styles.typingIndicator}>
                  <ActivityIndicator size="small" color={Colors.dark.primary} />
                  <ThemedText
                    type="small"
                    style={{
                      color: theme.textSecondary,
                      marginLeft: Spacing.sm,
                    }}
                  >
                    Thinking...
                  </ThemedText>
                </View>
              ) : null}
            </View>
          ) : (
            <ThemedText
              type="body"
              style={{ color: theme.textSecondary, marginBottom: Spacing.md }}
            >
              Ask about your training, nutrition, compounds, or get personalized
              advice.
            </ThemedText>
          )}
        </Card>
      </ScrollView>

      <View
        style={[
          styles.inputContainer,
          { paddingBottom: insets.bottom + Spacing.sm },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            { backgroundColor: theme.backgroundSecondary, color: theme.text },
          ]}
          placeholder="Ask a question..."
          placeholderTextColor={theme.textSecondary}
          value={question}
          onChangeText={setQuestion}
          onSubmitEditing={askQuestion}
          returnKeyType="send"
          editable={!asking}
        />
        <Pressable
          onPress={askQuestion}
          style={[styles.sendButton, { opacity: asking ? 0.5 : 1 }]}
          disabled={asking}
        >
          <Feather name="send" size={20} color="#FFF" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  greeting: {
    marginBottom: Spacing.lg,
  },
  recoveryRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  recoveryCard: {
    flex: 1,
  },
  recoveryContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  recoveryValue: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  cycleCard: {
    marginBottom: Spacing.md,
    backgroundColor: "rgba(255, 69, 0, 0.05)",
    borderWidth: 1,
  },
  cycleHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  compoundsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
  },
  compoundChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  workoutCard: {
    marginBottom: Spacing.md,
  },
  workoutHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  muscleGroups: {
    flexDirection: "row",
    gap: Spacing.xs,
  },
  muscleTag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  exerciseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  macrosCard: {
    marginBottom: Spacing.md,
  },
  macrosGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  macroItem: {
    alignItems: "center",
  },
  chatCard: {
    marginBottom: Spacing.xl,
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  messagesContainer: {
    marginTop: Spacing.sm,
  },
  messageRow: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    maxWidth: "90%",
  },
  userMessage: {
    backgroundColor: Colors.dark.primary,
    alignSelf: "flex-end",
  },
  assistantMessage: {
    backgroundColor: "rgba(255,255,255,0.1)",
    alignSelf: "flex-start",
  },
  typingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    height: 48,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.dark.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});
