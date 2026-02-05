import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";

import DashboardScreen from "@/screens/DashboardScreen";
import AICoachScreen from "@/screens/AICoachScreen";
import DailyCheckInScreen from "@/screens/DailyCheckInScreen";
import StrengthGoalsScreen from "@/screens/StrengthGoalsScreen";
import PostureAnalysisScreen from "@/screens/PostureAnalysisScreen";
import GroceryListScreen from "@/screens/GroceryListScreen";
import WarmupScreen from "@/screens/WarmupScreen";
import HealthmaxxScreen from "@/screens/HealthmaxxScreen";
import AnalyticsScreen from "@/screens/AnalyticsScreen";
import AchievementsScreen from "@/screens/AchievementsScreen";
import { HeaderTitle } from "@/components/HeaderTitle";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useTheme } from "@/hooks/useTheme";

export type DashboardStackParamList = {
  Dashboard: undefined;
  AICoach: undefined;
  DailyCheckIn: undefined;
  StrengthGoals: undefined;
  PostureAnalysis: undefined;
  GroceryList: undefined;
  Warmup: undefined;
  Healthmaxx: undefined;
  Analytics: undefined;
  Achievements: undefined;
};

const Stack = createNativeStackNavigator<DashboardStackParamList>();

export default function DashboardStackNavigator() {
  const screenOptions = useScreenOptions();
  const { theme } = useTheme();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={({ navigation }) => ({
          headerTitle: () => <HeaderTitle title="FitSync AI" />,
          headerRight: () => (
            <Pressable
              onPress={() => navigation.navigate("AICoach")}
              hitSlop={8}
            >
              <Feather name="cpu" size={22} color={theme.text} />
            </Pressable>
          ),
        })}
      />
      <Stack.Screen
        name="AICoach"
        component={AICoachScreen}
        options={{ headerTitle: "AI Coach" }}
      />
      <Stack.Screen
        name="DailyCheckIn"
        component={DailyCheckInScreen}
        options={{ headerTitle: "Daily Check-in" }}
      />
      <Stack.Screen
        name="StrengthGoals"
        component={StrengthGoalsScreen}
        options={{ headerTitle: "Strength Goals" }}
      />
      <Stack.Screen
        name="PostureAnalysis"
        component={PostureAnalysisScreen}
        options={{ headerTitle: "Posture Analysis" }}
      />
      <Stack.Screen
        name="GroceryList"
        component={GroceryListScreen}
        options={{ headerTitle: "Grocery List" }}
      />
      <Stack.Screen
        name="Warmup"
        component={WarmupScreen}
        options={{ headerTitle: "Warmup Protocol" }}
      />
      <Stack.Screen
        name="Healthmaxx"
        component={HealthmaxxScreen}
        options={{ headerTitle: "Healthmaxx" }}
      />
      <Stack.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{ headerTitle: "Analytics" }}
      />
      <Stack.Screen
        name="Achievements"
        component={AchievementsScreen}
        options={{ headerTitle: "Achievements" }}
      />
    </Stack.Navigator>
  );
}
