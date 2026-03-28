import React, { useEffect, useMemo, useState, useCallback } from "react";
import { StyleSheet, View, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { ThemedText } from "@/components/ThemedText";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing } from "@/constants/theme";
import {
  getGeneratedProgram,
  getMacroTargets,
  getUserProfile,
} from "@/lib/storage";
import type { ProfileStackParamList } from "@/navigation/ProfileStackNavigator";
import type { MacroTargets, UserProfile } from "@/types";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [macroTargets, setMacroTargets] = useState<MacroTargets | null>(null);
  const [program, setProgram] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const [userProfile, macros, generatedProgram] = await Promise.all([
        getUserProfile(),
        getMacroTargets(),
        getGeneratedProgram(),
      ]);
      setProfile(userProfile);
      setMacroTargets(macros);
      setProgram(generatedProgram);
    } catch (err) {
      console.error("Error loading profile:", err);
      setError("Failed to load profile data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadProfile(false);
  }, [loadProfile]);

  const formattedHeight = useMemo(() => {
    if (!profile?.height) return "N/A";
    if (profile?.heightUnit === "cm") {
      return `${profile.height} cm`;
    }
    const totalInches = Number(profile.height) || 0;
    const feet = Math.floor(totalInches / 12);
    const inches = totalInches % 12;
    return `${feet}'${inches}"`;
  }, [profile]);

  const programCount = useMemo(() => {
    if (!program?.weeklySchedule) return 0;
    return Object.values(program.weeklySchedule).reduce(
      (sum: number, day: any) => sum + (day?.exercises?.length || 0),
      0,
    );
  }, [program]);

  if (loading) {
    return <LoadingState message="Loading profile..." fullScreen />;
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to Load"
        message={error}
        onRetry={() => loadProfile()}
        fullScreen
      />
    );
  }

  return (
    <KeyboardAwareScrollViewCompat
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: tabBarHeight + Spacing.xl,
        paddingHorizontal: Spacing.lg,
        gap: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Colors.dark.primary}
        />
      }
    >
      <Card>
        <ThemedText type="h3">Profile Summary</ThemedText>
        <View style={styles.row}>
          <ThemedText>Height: {formattedHeight}</ThemedText>
          <ThemedText>
            Weight: {profile?.weight || "N/A"} {profile?.weightUnit || "lbs"}
          </ThemedText>
        </View>
        <View style={styles.row}>
          <ThemedText>Goal: {profile?.goal || "N/A"}</ThemedText>
          <ThemedText>
            Experience: {profile?.experienceLevel || "N/A"}
          </ThemedText>
        </View>
      </Card>

      <Card>
        <ThemedText type="h3">Macros</ThemedText>
        <ThemedText style={styles.subtext}>
          Calories: {macroTargets?.calories ?? "N/A"}
        </ThemedText>
        <ThemedText style={styles.subtext}>
          Protein: {macroTargets?.protein ?? "N/A"}g
        </ThemedText>
        <ThemedText style={styles.subtext}>
          Carbs: {macroTargets?.carbs ?? "N/A"}g
        </ThemedText>
        <ThemedText style={styles.subtext}>
          Fat: {macroTargets?.fat ?? "N/A"}g
        </ThemedText>
      </Card>

      <Card>
        <ThemedText type="h3">Program Overview</ThemedText>
        <ThemedText style={styles.subtext}>
          Total exercises planned: {programCount}
        </ThemedText>
        <ThemedText style={styles.subtext}>
          Training days: {profile?.trainingDaysPerWeek || "N/A"}
        </ThemedText>
      </Card>

      <Card>
        <ThemedText type="h3">Physique Snapshot</ThemedText>
        <ThemedText style={styles.subtext}>
          Overall Score: {profile?.physiqueAnalysis?.overallScore ?? "N/A"}
        </ThemedText>
        <ThemedText style={styles.subtext}>
          Weak Points:{" "}
          {profile?.physiqueAnalysis?.weakPoints?.join(", ") || "N/A"}
        </ThemedText>
      </Card>

      <Card>
        <ThemedText type="h3">Looksmaxx</ThemedText>
        <ThemedText style={styles.subtext}>
          Facial analysis, protocols, and treatment tracking.
        </ThemedText>
        <Button
          onPress={() => navigation.navigate("Looksmaxx")}
          style={styles.primaryButton}
        >
          View Physique Analysis
        </Button>
      </Card>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  row: {
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  subtext: {
    marginTop: Spacing.xs,
    opacity: 0.7,
  },
  primaryButton: {
    marginTop: Spacing.md,
  },
});
