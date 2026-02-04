import React, { useState, useEffect } from "react";
import { View, StyleSheet, TextInput, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { format } from "date-fns";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { Slider } from "@/components/Slider";
import { Card } from "@/components/Card";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { storage } from "@/lib/storage";
import { apiRequest, getApiUrl } from "@/lib/query-client";

export default function DailyCheckInScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation();

  const [sleepHours, setSleepHours] = useState(7);
  const [stressLevel, setStressLevel] = useState(3);
  const [sorenessLevel, setSorenessLevel] = useState(3);
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    const loadExisting = async () => {
      const existing = await storage.getTodayCheckIn();
      if (existing) {
        setSleepHours(existing.sleepHours);
        setStressLevel(existing.stressLevel);
        setSorenessLevel(existing.sorenessLevel);
        setWeight(existing.weight.toString());
        setNotes(existing.notes || "");
      }
    };
    loadExisting();
  }, []);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const checkIn = await storage.saveDailyCheckIn({
        date: today,
        sleepHours,
        stressLevel,
        sorenessLevel,
        weight: parseFloat(weight) || 0,
        notes: notes.trim() || undefined,
      });

      try {
        const response = await apiRequest("POST", "/api/coach/analyze", {
          checkIn,
          profile: await storage.getUserProfile(),
        });
        const data = await response.json();
        if (data.notes) {
          await storage.saveCoachNotes(data.notes);
        }
      } catch {}

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    } catch (error) {
      console.error("Error saving check-in:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStressLabel = (value: number) => {
    const labels = [
      "Very Low",
      "Low",
      "Mild",
      "Moderate",
      "High",
      "Very High",
      "Extreme",
    ];
    return labels[value - 1] || "Moderate";
  };

  const getSorenessLabel = (value: number) => {
    const labels = [
      "None",
      "Very Light",
      "Light",
      "Moderate",
      "Sore",
      "Very Sore",
      "Extreme",
    ];
    return labels[value - 1] || "Moderate";
  };

  return (
    <KeyboardAwareScrollViewCompat
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: insets.top + Spacing["4xl"],
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
    >
      <View style={styles.header}>
        <ThemedText type="h2">Daily Check-In</ThemedText>
        <ThemedText
          type="body"
          style={{ color: theme.textSecondary, marginTop: Spacing.xs }}
        >
          {format(new Date(), "EEEE, MMMM d")}
        </ThemedText>
      </View>

      <Card elevation={2} style={styles.section}>
        <Slider
          label="Sleep Duration"
          value={sleepHours}
          onValueChange={setSleepHours}
          minimumValue={3}
          maximumValue={12}
          step={0.5}
          valueFormatter={(val) => `${val} hours`}
        />

        <Slider
          label="Stress Level"
          value={stressLevel}
          onValueChange={setStressLevel}
          minimumValue={1}
          maximumValue={7}
          step={1}
          valueFormatter={getStressLabel}
        />

        <Slider
          label="Muscle Soreness"
          value={sorenessLevel}
          onValueChange={setSorenessLevel}
          minimumValue={1}
          maximumValue={7}
          step={1}
          valueFormatter={getSorenessLabel}
        />
      </Card>

      <Card elevation={2} style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Morning Weight
        </ThemedText>
        <View style={styles.weightInputContainer}>
          <TextInput
            style={[
              styles.weightInput,
              { backgroundColor: theme.backgroundSecondary, color: theme.text },
            ]}
            value={weight}
            onChangeText={setWeight}
            keyboardType="decimal-pad"
            placeholder="0.0"
            placeholderTextColor={theme.textSecondary}
          />
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            lbs
          </ThemedText>
        </View>
      </Card>

      <Card elevation={2} style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Notes (Optional)
        </ThemedText>
        <TextInput
          style={[
            styles.notesInput,
            { backgroundColor: theme.backgroundSecondary, color: theme.text },
          ]}
          value={notes}
          onChangeText={setNotes}
          placeholder="How are you feeling today?"
          placeholderTextColor={theme.textSecondary}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </Card>

      <Button
        onPress={handleSubmit}
        disabled={isLoading}
        style={styles.submitButton}
      >
        {isLoading ? "Saving..." : "Complete Check-In"}
      </Button>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  weightInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  weightInput: {
    flex: 1,
    height: 56,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    fontSize: 24,
    fontWeight: "600",
  },
  notesInput: {
    height: 100,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    fontSize: 16,
  },
  submitButton: {
    marginTop: Spacing.lg,
  },
});
