import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { OnboardingProvider } from "@/context/OnboardingContext";
import SignupScreen from "@/screens/onboarding/SignupScreen";
import WelcomeScreen from "@/screens/onboarding/WelcomeScreen";
import BasicProfileScreen from "@/screens/onboarding/BasicProfileScreen";
import GoalsScreen from "@/screens/onboarding/GoalsScreen";
import StrengthGoalsScreen from "@/screens/onboarding/StrengthGoalsScreen";
import HealthScreen from "@/screens/onboarding/HealthScreen";
import EquipmentScreen from "@/screens/onboarding/EquipmentScreen";
import CycleStatusScreen from "@/screens/onboarding/CycleStatusScreen";
import TrainingProgramScreen from "@/screens/onboarding/TrainingProgramScreen";
import ProgressPhotosScreen from "@/screens/onboarding/ProgressPhotosScreen";
import MacroCalculationScreen from "@/screens/onboarding/MacroCalculationScreen";
import OnboardingCompleteScreen from "@/screens/onboarding/OnboardingCompleteScreen";
import PhysiqueAnalysisScreen from "@/screens/onboarding/PhysiqueAnalysisScreen";

export type OnboardingStackParamList = {
  Signup: undefined;
  Welcome: undefined;
  BasicProfile: undefined;
  Goals: undefined;
  StrengthGoals: undefined;
  Health: undefined;
  Equipment: undefined;
  CycleStatus: undefined;
  TrainingProgram: undefined;
  ProgressPhotos: undefined;
  MacroCalculation: undefined;
  OnboardingComplete: undefined;
  PhysiqueAnalysis: { generatedProgram?: any };
};

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

function OnboardingScreens() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="BasicProfile" component={BasicProfileScreen} />
      <Stack.Screen name="Goals" component={GoalsScreen} />
      <Stack.Screen name="StrengthGoals" component={StrengthGoalsScreen} />
      <Stack.Screen name="Health" component={HealthScreen} />
      <Stack.Screen name="Equipment" component={EquipmentScreen} />
      <Stack.Screen name="CycleStatus" component={CycleStatusScreen} />
      <Stack.Screen name="ProgressPhotos" component={ProgressPhotosScreen} />
      <Stack.Screen name="PhysiqueAnalysis" component={PhysiqueAnalysisScreen} />
      <Stack.Screen name="MacroCalculation" component={MacroCalculationScreen} />
      <Stack.Screen name="TrainingProgram" component={TrainingProgramScreen} />
      <Stack.Screen name="OnboardingComplete" component={OnboardingCompleteScreen} />
    </Stack.Navigator>
  );
}

export default function OnboardingNavigator() {
  return (
    <OnboardingProvider>
      <OnboardingScreens />
    </OnboardingProvider>
  );
}
