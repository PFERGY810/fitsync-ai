import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useQuery } from "@tanstack/react-query";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";

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

interface SearchResponse {
  foods: FoodItem[];
  page: number;
  pageSize: number;
  totalCount: number;
}

const QUICK_ADD_FOODS: FoodItem[] = [
  {
    name: "Chicken Breast (cooked)",
    brand: null,
    barcode: null,
    servingSize: 100,
    servingUnit: "g",
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    fiber: 0,
    sugar: 0,
    sodium: 74,
    source: "usda",
  },
  {
    name: "Egg (large)",
    brand: null,
    barcode: null,
    servingSize: 50,
    servingUnit: "g",
    calories: 72,
    protein: 6.3,
    carbs: 0.4,
    fat: 4.8,
    fiber: 0,
    sugar: 0.2,
    sodium: 71,
    source: "usda",
  },
  {
    name: "Egg Whites (1 cup)",
    brand: null,
    barcode: null,
    servingSize: 243,
    servingUnit: "g",
    calories: 126,
    protein: 26,
    carbs: 1.8,
    fat: 0.4,
    fiber: 0,
    sugar: 1.5,
    sodium: 403,
    source: "usda",
  },
  {
    name: "White Rice (cooked)",
    brand: null,
    barcode: null,
    servingSize: 158,
    servingUnit: "g",
    calories: 206,
    protein: 4.3,
    carbs: 45,
    fat: 0.4,
    fiber: 0.6,
    sugar: 0,
    sodium: 1.6,
    source: "usda",
  },
  {
    name: "Brown Rice (cooked)",
    brand: null,
    barcode: null,
    servingSize: 195,
    servingUnit: "g",
    calories: 216,
    protein: 5,
    carbs: 45,
    fat: 1.8,
    fiber: 3.5,
    sugar: 0.7,
    sodium: 10,
    source: "usda",
  },
  {
    name: "Oatmeal (cooked)",
    brand: null,
    barcode: null,
    servingSize: 234,
    servingUnit: "g",
    calories: 158,
    protein: 6,
    carbs: 27,
    fat: 3.2,
    fiber: 4,
    sugar: 1.1,
    sodium: 9,
    source: "usda",
  },
  {
    name: "Sweet Potato (baked)",
    brand: null,
    barcode: null,
    servingSize: 200,
    servingUnit: "g",
    calories: 180,
    protein: 4,
    carbs: 41,
    fat: 0.2,
    fiber: 6.6,
    sugar: 13,
    sodium: 72,
    source: "usda",
  },
  {
    name: "Broccoli (steamed)",
    brand: null,
    barcode: null,
    servingSize: 156,
    servingUnit: "g",
    calories: 55,
    protein: 3.7,
    carbs: 11,
    fat: 0.6,
    fiber: 5.1,
    sugar: 2.2,
    sodium: 64,
    source: "usda",
  },
  {
    name: "Salmon (baked)",
    brand: null,
    barcode: null,
    servingSize: 154,
    servingUnit: "g",
    calories: 367,
    protein: 39,
    carbs: 0,
    fat: 22,
    fiber: 0,
    sugar: 0,
    sodium: 109,
    source: "usda",
  },
  {
    name: "Ground Beef 93% Lean",
    brand: null,
    barcode: null,
    servingSize: 113,
    servingUnit: "g",
    calories: 170,
    protein: 23,
    carbs: 0,
    fat: 8,
    fiber: 0,
    sugar: 0,
    sodium: 76,
    source: "usda",
  },
  {
    name: "Greek Yogurt (nonfat)",
    brand: null,
    barcode: null,
    servingSize: 170,
    servingUnit: "g",
    calories: 100,
    protein: 17,
    carbs: 6,
    fat: 0.7,
    fiber: 0,
    sugar: 4,
    sodium: 56,
    source: "usda",
  },
  {
    name: "Whey Protein (1 scoop)",
    brand: null,
    barcode: null,
    servingSize: 30,
    servingUnit: "g",
    calories: 120,
    protein: 24,
    carbs: 3,
    fat: 1.5,
    fiber: 0,
    sugar: 1,
    sodium: 130,
    source: "typical",
  },
];

export default function FoodSearchScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<any>();

  const [searchText, setSearchText] = useState("");
  const debouncedSearch = useDebouncedValue(searchText, 500);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const { data, isLoading, error } = useQuery<SearchResponse>({
    queryKey: ["/api/food/search", debouncedSearch],
    enabled: debouncedSearch.length >= 2,
    queryFn: async () => {
      const apiUrl = getApiUrl();
      const response = await fetch(
        new URL(
          `/api/food/search?q=${encodeURIComponent(debouncedSearch)}`,
          apiUrl,
        ).toString(),
      );
      if (!response.ok) throw new Error("Search failed");
      return response.json();
    },
  });

  const handleSelectFood = async (food: FoodItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (food.fdcId) {
      setLoadingDetails(true);
      try {
        const apiUrl = getApiUrl();
        const response = await fetch(
          new URL(`/api/food/details/${food.fdcId}`, apiUrl).toString(),
        );
        if (response.ok) {
          const detailed = await response.json();
          navigation.navigate("AddFood", { food: detailed, servings: 1 });
          return;
        }
      } catch (error) {
        console.error("Error fetching USDA details:", error);
      } finally {
        setLoadingDetails(false);
      }
    }

    navigation.navigate("AddFood", { food, servings: 1 });
  };

  const renderFoodItem = useCallback(
    ({ item }: { item: FoodItem }) => (
      <Pressable
        onPress={() => handleSelectFood(item)}
        style={({ pressed }) => [
          styles.foodItem,
          { backgroundColor: theme.backgroundSecondary },
          pressed && { opacity: 0.7 },
        ]}
      >
        <View style={styles.foodInfo}>
          <ThemedText
            type="body"
            numberOfLines={1}
            style={{ fontWeight: "600" }}
          >
            {item.name}
          </ThemedText>
          {item.brand ? (
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {item.brand}
            </ThemedText>
          ) : null}
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {item.servingSize}
            {item.servingUnit}
          </ThemedText>
        </View>
        <View style={styles.foodMacros}>
          <ThemedText
            type="body"
            style={{ color: Colors.dark.primary, fontWeight: "700" }}
          >
            {item.calories} cal
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            P: {item.protein}g | C: {item.carbs}g | F: {item.fat}g
          </ThemedText>
        </View>
        <Feather name="chevron-right" size={20} color={theme.textSecondary} />
      </Pressable>
    ),
    [theme, navigation],
  );

  const showQuickAdd = searchText.length < 2;
  const displayData = showQuickAdd ? QUICK_ADD_FOODS : data?.foods || [];

  return (
    <ThemedView style={styles.container}>
      <View
        style={[
          styles.searchContainer,
          { paddingTop: insets.top + Spacing.md },
        ]}
      >
        <View
          style={[
            styles.searchBox,
            { backgroundColor: theme.backgroundSecondary },
          ]}
        >
          <Feather name="search" size={20} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search foods..."
            placeholderTextColor={theme.textSecondary}
            value={searchText}
            onChangeText={setSearchText}
            autoFocus
            testID="input-food-search"
          />
          {searchText.length > 0 ? (
            <Pressable onPress={() => setSearchText("")}>
              <Feather name="x-circle" size={20} color={theme.textSecondary} />
            </Pressable>
          ) : null}
        </View>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.cancelButton}
        >
          <ThemedText style={{ color: Colors.dark.primary }}>Cancel</ThemedText>
        </Pressable>
      </View>

      <View style={styles.headerRow}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          {showQuickAdd
            ? "Common Foods"
            : `Results (${data?.foods?.length || 0})`}
        </ThemedText>
        <Pressable
          onPress={() => navigation.navigate("BarcodeScanner")}
          style={styles.scanButton}
        >
          <Feather name="camera" size={18} color={Colors.dark.primary} />
          <ThemedText
            type="small"
            style={{ color: Colors.dark.primary, marginLeft: Spacing.xs }}
          >
            Scan
          </ThemedText>
        </Pressable>
      </View>

      {loadingDetails ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.dark.primary} />
          <ThemedText
            type="small"
            style={{ color: theme.textSecondary, marginTop: Spacing.sm }}
          >
            Loading nutrition details...
          </ThemedText>
        </View>
      ) : isLoading && searchText.length >= 2 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.dark.primary} />
          <ThemedText
            type="small"
            style={{ color: theme.textSecondary, marginTop: Spacing.sm }}
          >
            Searching...
          </ThemedText>
        </View>
      ) : error ? (
        <Card elevation={1} style={styles.errorCard}>
          <Feather name="alert-circle" size={24} color={Colors.dark.error} />
          <ThemedText
            type="body"
            style={{ marginTop: Spacing.sm, color: theme.textSecondary }}
          >
            Failed to search foods. Please try again.
          </ThemedText>
        </Card>
      ) : (
        <FlatList
          data={displayData}
          renderItem={renderFoodItem}
          keyExtractor={(item, index) =>
            `${item.barcode || item.name}-${index}`
          }
          contentContainerStyle={{
            paddingHorizontal: Spacing.lg,
            paddingBottom: insets.bottom + Spacing.xl,
          }}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
          ListEmptyComponent={
            searchText.length >= 2 ? (
              <View style={styles.emptyContainer}>
                <ThemedText type="body" style={{ color: theme.textSecondary }}>
                  {`No foods found for "${searchText}"`}
                </ThemedText>
                <ThemedText
                  type="small"
                  style={{ color: theme.textSecondary, marginTop: Spacing.sm }}
                >
                  Try a different search term or scan a barcode
                </ThemedText>
              </View>
            ) : null
          }
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: 16,
  },
  cancelButton: {
    marginLeft: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {},
  scanButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorCard: {
    margin: Spacing.lg,
    alignItems: "center",
    padding: Spacing.lg,
  },
  emptyContainer: {
    alignItems: "center",
    paddingTop: Spacing.xl,
  },
  foodItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  foodInfo: {
    flex: 1,
  },
  foodMacros: {
    alignItems: "flex-end",
    marginRight: Spacing.sm,
  },
});
