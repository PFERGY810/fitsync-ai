import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import MainTabNavigator from "@/navigation/MainTabNavigator";
import OnboardingNavigator from "@/navigation/OnboardingNavigator";
import DailyCheckInScreen from "@/screens/DailyCheckInScreen";
import WorkoutSessionScreen from "@/screens/WorkoutSessionScreen";
import TierRankingScreen from "@/screens/TierRankingScreen";
import WeeklyCheckInScreen from "@/screens/WeeklyCheckInScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { isOnboardingComplete } from "@/lib/storage";
import { Colors } from "@/constants/theme";

export type RootStackParamList = {
  Onboarding: undefined;
  MainTabs: undefined;
  DailyCheckIn: undefined;
  WorkoutSession: { dayName: string };
  TierRanking: undefined;
  WeeklyCheckIn: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    try {
      // Add timeout to prevent blocking for too long
      const timeoutPromise = new Promise<boolean>((resolve) => {
        setTimeout(() => resolve(false), 2000);
      });

      const checkPromise = isOnboardingComplete();
      const complete = await Promise.race([checkPromise, timeoutPromise]);
      setHasCompletedOnboarding(complete);
    } catch (e) {
      console.error("Error checking onboarding:", e);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.dark.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={screenOptions}
      initialRouteName={hasCompletedOnboarding ? "MainTabs" : "Onboarding"}
    >
      <Stack.Screen
        name="Onboarding"
        component={OnboardingNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DailyCheckIn"
        component={DailyCheckInScreen}
        options={{
          presentation: "modal",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="WorkoutSession"
        component={WorkoutSessionScreen}
        options={{
          headerTitle: "Workout",
        }}
      />
      <Stack.Screen
        name="TierRanking"
        component={TierRankingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="WeeklyCheckIn"
        component={WeeklyCheckInScreen}
        options={{ presentation: "modal", headerShown: false }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.dark.backgroundRoot,
  },
});
