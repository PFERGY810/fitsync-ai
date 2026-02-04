import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { format } from "date-fns";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { MacroRing } from "@/components/MacroRing";
import { FoodEntryCard } from "@/components/FoodEntryCard";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { storage } from "@/lib/storage";
import type { MacroTargets, FoodEntry } from "@/types";

const QUICK_ADD_FOODS = [
  {
    name: "Chicken Breast (100g)",
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 4,
  },
  { name: "Eggs (2 large)", calories: 140, protein: 12, carbs: 1, fat: 10 },
  { name: "Rice (1 cup)", calories: 206, protein: 4, carbs: 45, fat: 0 },
  { name: "Oatmeal (1 cup)", calories: 150, protein: 5, carbs: 27, fat: 3 },
  { name: "Protein Shake", calories: 120, protein: 24, carbs: 3, fat: 1 },
  {
    name: "Greek Yogurt (1 cup)",
    calories: 100,
    protein: 17,
    carbs: 6,
    fat: 1,
  },
  { name: "Salmon (100g)", calories: 208, protein: 20, carbs: 0, fat: 13 },
  { name: "Almonds (1oz)", calories: 164, protein: 6, carbs: 6, fat: 14 },
];

export default function NutritionScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<any>();

  const [macroTargets, setMacroTargets] = useState<MacroTargets | null>(null);
  const [todayEntries, setTodayEntries] = useState<FoodEntry[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [customFood, setCustomFood] = useState({
    name: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
  });

  const today = format(new Date(), "yyyy-MM-dd");

  const loadData = useCallback(async () => {
    const [targets, entries] = await Promise.all([
      storage.getMacroTargets(),
      storage.getFoodEntries(today),
    ]);
    setMacroTargets(targets || null);
    setTodayEntries(entries);
  }, [today]);

  useEffect(() => {
    loadData();
    const unsubscribe = navigation.addListener("focus", loadData);
    return unsubscribe;
  }, [loadData, navigation]);

  const currentMacros = todayEntries.reduce(
    (acc, entry) => ({
      calories: acc.calories + entry.calories,
      protein: acc.protein + entry.protein,
      carbs: acc.carbs + entry.carbs,
      fat: acc.fat + entry.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  const handleQuickAdd = async (food: (typeof QUICK_ADD_FOODS)[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await storage.saveFoodEntry({ ...food, date: today });
    loadData();
  };

  const handleCustomAdd = async () => {
    if (!customFood.name || !customFood.calories) return;
    await storage.saveFoodEntry({
      name: customFood.name,
      calories: parseInt(customFood.calories) || 0,
      protein: parseInt(customFood.protein) || 0,
      carbs: parseInt(customFood.carbs) || 0,
      fat: parseInt(customFood.fat) || 0,
      date: today,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCustomFood({ name: "", calories: "", protein: "", carbs: "", fat: "" });
    setShowAddModal(false);
    loadData();
  };

  const handleDelete = async (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await storage.deleteFoodEntry(id);
    loadData();
  };

  const renderHeader = () => (
    <>
      {macroTargets ? (
        <View style={styles.summaryCard}>
          <View style={styles.calorieHeader}>
            <View>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Calories Remaining
              </ThemedText>
              <ThemedText style={styles.calorieValue}>
                {macroTargets.calories - currentMacros.calories}
              </ThemedText>
            </View>
            <View style={styles.calorieBreakdown}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {macroTargets.calories} - {currentMacros.calories} consumed
              </ThemedText>
            </View>
          </View>
          <View style={styles.macroRings}>
            <MacroRing
              label="Protein"
              current={currentMacros.protein}
              target={macroTargets.protein}
              color={Colors.dark.chartColors[1]}
              size={70}
            />
            <MacroRing
              label="Carbs"
              current={currentMacros.carbs}
              target={macroTargets.carbs}
              color={Colors.dark.chartColors[2]}
              size={70}
            />
            <MacroRing
              label="Fat"
              current={currentMacros.fat}
              target={macroTargets.fat}
              color={Colors.dark.chartColors[3]}
              size={70}
            />
          </View>
        </View>
      ) : (
        <View style={styles.summaryCard}>
          <ThemedText type="body" style={{ fontWeight: "700" }}>
            Macros not set
          </ThemedText>
          <ThemedText
            type="small"
            style={{ color: theme.textSecondary, marginTop: Spacing.xs }}
          >
            Finish onboarding or set your macro targets to enable tracking.
          </ThemedText>
        </View>
      )}

      <View style={styles.addFoodSection}>
        <View style={styles.addFoodButtons}>
          <Pressable
            onPress={() => navigation.navigate("BarcodeScanner")}
            style={[
              styles.addFoodButton,
              { backgroundColor: theme.backgroundSecondary },
            ]}
            testID="button-scan-barcode"
          >
            <View
              style={[
                styles.addFoodIcon,
                { backgroundColor: Colors.dark.primary + "20" },
              ]}
            >
              <Feather name="camera" size={22} color={Colors.dark.primary} />
            </View>
            <ThemedText type="body" style={{ fontWeight: "600" }}>
              Scan Barcode
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Quick food lookup
            </ThemedText>
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate("FoodSearch")}
            style={[
              styles.addFoodButton,
              { backgroundColor: theme.backgroundSecondary },
            ]}
            testID="button-search-food"
          >
            <View
              style={[
                styles.addFoodIcon,
                { backgroundColor: Colors.dark.primary + "20" },
              ]}
            >
              <Feather name="search" size={22} color={Colors.dark.primary} />
            </View>
            <ThemedText type="body" style={{ fontWeight: "600" }}>
              Search Foods
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              2M+ products
            </ThemedText>
          </Pressable>
        </View>
      </View>

      <View style={styles.quickAddSection}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Quick Add
        </ThemedText>
        <View style={styles.quickAddGrid}>
          {QUICK_ADD_FOODS.slice(0, 4).map((food, index) => (
            <Pressable
              key={index}
              onPress={() => handleQuickAdd(food)}
              style={({ pressed }) => [
                styles.quickAddItem,
                { backgroundColor: theme.backgroundSecondary },
                pressed && { opacity: 0.7 },
              ]}
            >
              <ThemedText type="small" numberOfLines={1}>
                {food.name}
              </ThemedText>
              <ThemedText type="small" style={{ color: Colors.dark.primary }}>
                {food.calories} cal
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.entriesHeader}>
        <ThemedText type="h4">{"Today's Food"}</ThemedText>
        <Pressable onPress={() => setShowAddModal(true)}>
          <Feather name="plus-circle" size={24} color={Colors.dark.primary} />
        </Pressable>
      </View>
    </>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <FlatList
        data={todayEntries}
        renderItem={({ item }) => (
          <FoodEntryCard entry={item} onDelete={() => handleDelete(item.id)} />
        )}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: tabBarHeight + Spacing.xl,
          paddingHorizontal: Spacing.lg,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <EmptyState
              image={require("../../assets/images/empty-states/empty-nutrition.png")}
              title="No Food Logged"
              description="Start tracking your nutrition by adding foods above."
            />
          </View>
        }
      />

      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <View style={styles.modalHeader}>
              <ThemedText type="h3">Add Custom Food</ThemedText>
              <Pressable onPress={() => setShowAddModal(false)}>
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.backgroundSecondary,
                  color: theme.text,
                },
              ]}
              placeholder="Food name"
              placeholderTextColor={theme.textSecondary}
              value={customFood.name}
              onChangeText={(text) =>
                setCustomFood({ ...customFood, name: text })
              }
            />
            <View style={styles.inputRow}>
              <TextInput
                style={[
                  styles.input,
                  styles.halfInput,
                  {
                    backgroundColor: theme.backgroundSecondary,
                    color: theme.text,
                  },
                ]}
                placeholder="Calories"
                placeholderTextColor={theme.textSecondary}
                keyboardType="number-pad"
                value={customFood.calories}
                onChangeText={(text) =>
                  setCustomFood({ ...customFood, calories: text })
                }
              />
              <TextInput
                style={[
                  styles.input,
                  styles.halfInput,
                  {
                    backgroundColor: theme.backgroundSecondary,
                    color: theme.text,
                  },
                ]}
                placeholder="Protein (g)"
                placeholderTextColor={theme.textSecondary}
                keyboardType="number-pad"
                value={customFood.protein}
                onChangeText={(text) =>
                  setCustomFood({ ...customFood, protein: text })
                }
              />
            </View>
            <View style={styles.inputRow}>
              <TextInput
                style={[
                  styles.input,
                  styles.halfInput,
                  {
                    backgroundColor: theme.backgroundSecondary,
                    color: theme.text,
                  },
                ]}
                placeholder="Carbs (g)"
                placeholderTextColor={theme.textSecondary}
                keyboardType="number-pad"
                value={customFood.carbs}
                onChangeText={(text) =>
                  setCustomFood({ ...customFood, carbs: text })
                }
              />
              <TextInput
                style={[
                  styles.input,
                  styles.halfInput,
                  {
                    backgroundColor: theme.backgroundSecondary,
                    color: theme.text,
                  },
                ]}
                placeholder="Fat (g)"
                placeholderTextColor={theme.textSecondary}
                keyboardType="number-pad"
                value={customFood.fat}
                onChangeText={(text) =>
                  setCustomFood({ ...customFood, fat: text })
                }
              />
            </View>
            <Button onPress={handleCustomAdd} style={styles.addButton}>
              Add Food
            </Button>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  summaryCard: {
    marginBottom: Spacing.xl,
  },
  calorieHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.lg,
  },
  calorieValue: {
    fontSize: 32,
    fontWeight: "700",
    color: Colors.dark.primary,
    marginTop: Spacing.xs,
  },
  calorieBreakdown: {
    alignItems: "flex-end",
  },
  macroRings: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  addFoodSection: {
    marginBottom: Spacing.lg,
  },
  addFoodButtons: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  addFoodButton: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  addFoodIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  quickAddSection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  quickAddGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  quickAddItem: {
    width: "48%",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  entriesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  emptyContainer: {
    marginTop: Spacing.xl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xl,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  input: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    fontSize: 16,
  },
  inputRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  addButton: {
    marginTop: Spacing.md,
  },
});
