import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { format } from "date-fns";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { storage } from "@/lib/storage";

interface FoodItem {
  name: string;
  brand: string | null;
  barcode: string | null;
  fdcId?: number;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  imageUrl?: string;
  source: string;
}

const MEAL_TYPES = [
  { id: "breakfast", label: "Breakfast", icon: "sunrise" },
  { id: "lunch", label: "Lunch", icon: "sun" },
  { id: "dinner", label: "Dinner", icon: "moon" },
  { id: "snack", label: "Snack", icon: "coffee" },
];

export default function AddFoodScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const food = route.params?.food as FoodItem;
  const initialServings = route.params?.servings || 1;

  const [servings, setServings] = useState(initialServings);
  const [mealType, setMealType] = useState("lunch");
  const [saving, setSaving] = useState(false);

  if (!food) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <ThemedText>No food selected</ThemedText>
      </ThemedView>
    );
  }

  const adjustedCalories = Math.round(food.calories * servings);
  const adjustedProtein = Math.round(food.protein * servings * 10) / 10;
  const adjustedCarbs = Math.round(food.carbs * servings * 10) / 10;
  const adjustedFat = Math.round(food.fat * servings * 10) / 10;
  const adjustedFiber = Math.round((food.fiber || 0) * servings * 10) / 10;

  const handleSave = async () => {
    setSaving(true);
    try {
      const today = format(new Date(), "yyyy-MM-dd");

      await storage.saveFoodEntry({
        name: food.name,
        brand: food.brand || undefined,
        barcode: food.barcode || undefined,
        servingSize: food.servingSize,
        servingUnit: food.servingUnit,
        servings,
        calories: adjustedCalories,
        protein: adjustedProtein,
        carbs: adjustedCarbs,
        fat: adjustedFat,
        fiber: adjustedFiber,
        mealType,
        source: food.source,
        date: today,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.navigate("NutritionMain");
    } catch (error) {
      console.error("Error saving food:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + Spacing.lg,
            paddingBottom: insets.bottom + 100,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={24} color={theme.text} />
          </Pressable>
          <ThemedText type="h3">Add Food</ThemedText>
          <View style={{ width: 40 }} />
        </View>

        <Card elevation={2} style={styles.foodCard}>
          <ThemedText type="h4" numberOfLines={2}>
            {food.name}
          </ThemedText>
          {food.brand ? (
            <ThemedText
              type="small"
              style={{ color: theme.textSecondary, marginTop: Spacing.xs }}
            >
              {food.brand}
            </ThemedText>
          ) : null}
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Serving: {food.servingSize}
            {food.servingUnit}
          </ThemedText>
        </Card>

        <Card elevation={1} style={styles.servingsCard}>
          <ThemedText type="body" style={{ fontWeight: "600" }}>
            Number of Servings
          </ThemedText>
          <View style={styles.servingsControls}>
            <Pressable
              onPress={() => setServings(Math.max(0.25, servings - 0.25))}
              style={[
                styles.servingButton,
                { backgroundColor: theme.backgroundSecondary },
              ]}
            >
              <Feather name="minus" size={20} color={theme.text} />
            </Pressable>
            <TextInput
              style={[
                styles.servingsInput,
                {
                  color: theme.text,
                  backgroundColor: theme.backgroundSecondary,
                },
              ]}
              value={servings.toString()}
              onChangeText={(text) => {
                const num = parseFloat(text);
                if (!isNaN(num) && num > 0) setServings(num);
              }}
              keyboardType="decimal-pad"
              textAlign="center"
            />
            <Pressable
              onPress={() => setServings(servings + 0.25)}
              style={[
                styles.servingButton,
                { backgroundColor: theme.backgroundSecondary },
              ]}
            >
              <Feather name="plus" size={20} color={theme.text} />
            </Pressable>
          </View>
        </Card>

        <Card elevation={2} style={styles.nutritionCard}>
          <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>
            Nutrition ({servings} serving{servings !== 1 ? "s" : ""})
          </ThemedText>

          <View style={styles.calorieRow}>
            <ThemedText type="h2" style={{ color: Colors.dark.primary }}>
              {adjustedCalories}
            </ThemedText>
            <ThemedText
              type="body"
              style={{ color: theme.textSecondary, marginLeft: Spacing.sm }}
            >
              calories
            </ThemedText>
          </View>

          <View style={styles.macroRow}>
            <View style={styles.macroItem}>
              <View
                style={[
                  styles.macroBar,
                  { backgroundColor: Colors.dark.protein },
                ]}
              />
              <ThemedText type="body" style={{ fontWeight: "600" }}>
                {adjustedProtein}g
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Protein
              </ThemedText>
            </View>
            <View style={styles.macroItem}>
              <View
                style={[
                  styles.macroBar,
                  { backgroundColor: Colors.dark.carbs },
                ]}
              />
              <ThemedText type="body" style={{ fontWeight: "600" }}>
                {adjustedCarbs}g
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Carbs
              </ThemedText>
            </View>
            <View style={styles.macroItem}>
              <View
                style={[styles.macroBar, { backgroundColor: Colors.dark.fat }]}
              />
              <ThemedText type="body" style={{ fontWeight: "600" }}>
                {adjustedFat}g
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Fat
              </ThemedText>
            </View>
          </View>

          {adjustedFiber > 0 ? (
            <View style={styles.extraNutrient}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Fiber: {adjustedFiber}g
              </ThemedText>
            </View>
          ) : null}
        </Card>

        <Card elevation={1} style={styles.mealCard}>
          <ThemedText
            type="body"
            style={{ fontWeight: "600", marginBottom: Spacing.md }}
          >
            Meal Type
          </ThemedText>
          <View style={styles.mealGrid}>
            {MEAL_TYPES.map((meal) => (
              <Pressable
                key={meal.id}
                onPress={() => {
                  setMealType(meal.id);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={[
                  styles.mealOption,
                  { backgroundColor: theme.backgroundSecondary },
                  mealType === meal.id && {
                    backgroundColor: Colors.dark.primary + "20",
                    borderColor: Colors.dark.primary,
                  },
                ]}
              >
                <Feather
                  name={meal.icon as any}
                  size={20}
                  color={
                    mealType === meal.id
                      ? Colors.dark.primary
                      : theme.textSecondary
                  }
                />
                <ThemedText
                  type="small"
                  style={[
                    { marginTop: Spacing.xs },
                    mealType === meal.id && { color: Colors.dark.primary },
                  ]}
                >
                  {meal.label}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </Card>
      </ScrollView>

      <View
        style={[styles.footer, { paddingBottom: insets.bottom + Spacing.lg }]}
      >
        <Button onPress={handleSave} disabled={saving} testID="button-add-food">
          {saving ? "Adding..." : "Add to Food Log"}
        </Button>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  foodCard: {
    marginBottom: Spacing.md,
  },
  servingsCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  servingsControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  servingButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  servingsInput: {
    width: 70,
    height: 40,
    borderRadius: BorderRadius.sm,
    marginHorizontal: Spacing.sm,
    fontSize: 18,
    fontWeight: "600",
  },
  nutritionCard: {
    marginBottom: Spacing.md,
  },
  calorieRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: Spacing.lg,
  },
  macroRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  macroItem: {
    alignItems: "center",
  },
  macroBar: {
    width: 4,
    height: 30,
    borderRadius: 2,
    marginBottom: Spacing.xs,
  },
  extraNutrient: {
    marginTop: Spacing.md,
    alignItems: "center",
  },
  mealCard: {
    marginBottom: Spacing.lg,
  },
  mealGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  mealOption: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.md,
    marginHorizontal: Spacing.xs,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: "transparent",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
});
