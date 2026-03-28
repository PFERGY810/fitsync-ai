import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ProfileScreen from "@/screens/ProfileScreen";
import LooksmaxxScreen from "@/screens/LooksmaxxScreen";
import FacialAnalysisScreen from "@/screens/FacialAnalysisScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type ProfileStackParamList = {
  Profile: undefined;
  Looksmaxx: undefined;
  FacialAnalysis: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: "Profile",
        }}
      />
      <Stack.Screen
        name="Looksmaxx"
        component={LooksmaxxScreen}
        options={{
          title: "Looksmaxx",
        }}
      />
      <Stack.Screen
        name="FacialAnalysis"
        component={FacialAnalysisScreen}
        options={{
          title: "Facial Analysis",
        }}
      />
    </Stack.Navigator>
  );
}
