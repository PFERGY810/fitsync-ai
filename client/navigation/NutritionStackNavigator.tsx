import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import NutritionScreen from "@/screens/NutritionScreen";
import BarcodeScannerScreen from "@/screens/BarcodeScannerScreen";
import FoodSearchScreen from "@/screens/FoodSearchScreen";
import AddFoodScreen from "@/screens/AddFoodScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type NutritionStackParamList = {
  NutritionMain: undefined;
  BarcodeScanner: undefined;
  FoodSearch: undefined;
  AddFood: { food: any; servings?: number };
};

const Stack = createNativeStackNavigator<NutritionStackParamList>();

export default function NutritionStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="NutritionMain"
        component={NutritionScreen}
        options={{ headerTitle: "Nutrition" }}
      />
      <Stack.Screen
        name="BarcodeScanner"
        component={BarcodeScannerScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="FoodSearch"
        component={FoodSearchScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddFood"
        component={AddFoodScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
