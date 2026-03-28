import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import {
  getUserProfile,
  getMacroTargets,
  saveUserProfile,
} from "@/lib/storage";
import { getApiUrl } from "@/lib/query-client";
import type { OnboardingProfile } from "@/types/onboarding";

interface GroceryItem {
  name: string;
  quantity: string;
  cost?: string;
  macros?: { protein: number; carbs: number; fat: number };
  mealPrepTip?: string;
  note?: string;
}

interface GrocerySection {
  name: string;
  aisle: string;
  items: GroceryItem[];
}

interface GroceryList {
  weeklyBudgetEstimate: string;
  totalMacros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  sections: GrocerySection[];
  mealPrepSuggestions: string[];
  quickMealIdeas: string[];
}

type BudgetLevel = "budget" | "moderate" | "premium";

export default function GroceryListScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  const [profile, setProfile] = useState<OnboardingProfile | null>(null);
  const [macroTargets, setMacroTargets] = useState<any>(null);
  const [budget, setBudget] = useState<BudgetLevel>("moderate");
  const [budgetAmount, setBudgetAmount] = useState("150");
  const [zipCode, setZipCode] = useState("");
  const [groceryList, setGroceryList] = useState<GroceryList | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(),
  );
  const [macroError, setMacroError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userProfile = await getUserProfile();
      const macros = await getMacroTargets();
      setProfile(userProfile);
      setMacroTargets(macros);
      if (userProfile?.budgetTier) {
        setBudget(userProfile.budgetTier);
      }
      if (typeof userProfile?.budgetAmount === "number") {
        setBudgetAmount(String(userProfile.budgetAmount));
      }
      if (userProfile?.zipCode) {
        setZipCode(userProfile.zipCode);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateGroceryList = async () => {
    setGenerating(true);
    try {
      if (!macroTargets) {
        setMacroError("Set macro targets before generating a grocery list.");
        setGenerating(false);
        return;
      }
      setMacroError(null);

      if (profile) {
        const updatedProfile = {
          ...profile,
          budgetTier: budget,
          budgetAmount: parseFloat(budgetAmount) || 150,
          zipCode: zipCode || undefined,
        };
        setProfile(updatedProfile);
        await saveUserProfile(updatedProfile);
      }

      const response = await fetch(
        new URL("/api/coach/grocery-list", getApiUrl()).toString(),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            profile,
            macroTargets,
            budget,
            budgetAmount: parseFloat(budgetAmount) || 150,
            zipCode: zipCode || undefined,
            preferences: {
              diet: (profile as any)?.diet || "none",
              allergies: (profile as any)?.allergies || [],
            },
          }),
        },
      );

      if (!response.ok) throw new Error("Generation failed");

      const data = await response.json();
      setGroceryList(data);
      if (data.sections) {
        setExpandedSections(
          new Set(data.sections.map((s: GrocerySection) => s.name)),
        );
      }
    } catch (error) {
      console.error("Error generating grocery list:", error);
    } finally {
      setGenerating(false);
    }
  };

  const toggleSection = (sectionName: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionName)) {
      newExpanded.delete(sectionName);
    } else {
      newExpanded.add(sectionName);
    }
    setExpandedSections(newExpanded);
  };

  const getBudgetColor = () => {
    switch (budget) {
      case "budget":
        return Colors.green;
      case "moderate":
        return Colors.blue;
      case "premium":
        return Colors.purple;
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </ThemedView>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: headerHeight + Spacing.md,
          paddingBottom: insets.bottom + Spacing.xl,
        },
      ]}
    >
      <Card style={styles.card}>
        <ThemedText style={styles.sectionTitle}>
          Weekly Grocery Budget
        </ThemedText>

        <View style={styles.budgetOptions}>
          {(["budget", "moderate", "premium"] as BudgetLevel[]).map((level) => (
            <Pressable
              key={level}
              style={[
                styles.budgetOption,
                {
                  borderColor:
                    budget === level ? getBudgetColor() : theme.border,
                },
                budget === level && {
                  backgroundColor: `${getBudgetColor()}20`,
                },
              ]}
              onPress={() => setBudget(level)}
            >
              <Feather
                name={
                  level === "budget"
                    ? "dollar-sign"
                    : level === "moderate"
                      ? "trending-up"
                      : "star"
                }
                size={20}
                color={
                  budget === level ? getBudgetColor() : theme.textSecondary
                }
              />
              <ThemedText
                style={[
                  styles.budgetLabel,
                  budget === level && { color: getBudgetColor() },
                ]}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        <View style={styles.inputRow}>
          <View style={styles.inputGroup}>
            <ThemedText
              style={[styles.inputLabel, { color: theme.textSecondary }]}
            >
              Budget Amount ($)
            </ThemedText>
            <TextInput
              style={[
                styles.budgetInput,
                {
                  backgroundColor: theme.backgroundSecondary,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              value={budgetAmount}
              onChangeText={setBudgetAmount}
              keyboardType="decimal-pad"
              placeholder="150"
              placeholderTextColor={theme.textSecondary}
              testID="input-budget-amount"
            />
          </View>
          <View style={styles.inputGroup}>
            <ThemedText
              style={[styles.inputLabel, { color: theme.textSecondary }]}
            >
              Zip Code (optional)
            </ThemedText>
            <TextInput
              style={[
                styles.budgetInput,
                {
                  backgroundColor: theme.backgroundSecondary,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              value={zipCode}
              onChangeText={setZipCode}
              keyboardType="number-pad"
              placeholder="e.g. 90210"
              placeholderTextColor={theme.textSecondary}
              maxLength={5}
              testID="input-zip-code"
            />
          </View>
        </View>
      </Card>

      <Card style={styles.card}>
        <ThemedText style={styles.sectionTitle}>Your Macro Targets</ThemedText>
        <View style={styles.macroRow}>
          <View style={styles.macroItem}>
            <ThemedText style={[styles.macroValue, { color: Colors.accent }]}>
              {macroTargets?.calories ?? "N/A"}
            </ThemedText>
            <ThemedText
              style={[styles.macroLabel, { color: theme.textSecondary }]}
            >
              Calories
            </ThemedText>
          </View>
          <View style={styles.macroItem}>
            <ThemedText style={[styles.macroValue, { color: Colors.red }]}>
              {macroTargets?.protein !== undefined
                ? `${macroTargets.protein}g`
                : "N/A"}
            </ThemedText>
            <ThemedText
              style={[styles.macroLabel, { color: theme.textSecondary }]}
            >
              Protein
            </ThemedText>
          </View>
          <View style={styles.macroItem}>
            <ThemedText style={[styles.macroValue, { color: Colors.blue }]}>
              {macroTargets?.carbs !== undefined
                ? `${macroTargets.carbs}g`
                : "N/A"}
            </ThemedText>
            <ThemedText
              style={[styles.macroLabel, { color: theme.textSecondary }]}
            >
              Carbs
            </ThemedText>
          </View>
          <View style={styles.macroItem}>
            <ThemedText style={[styles.macroValue, { color: Colors.yellow }]}>
              {macroTargets?.fat !== undefined ? `${macroTargets.fat}g` : "N/A"}
            </ThemedText>
            <ThemedText
              style={[styles.macroLabel, { color: theme.textSecondary }]}
            >
              Fat
            </ThemedText>
          </View>
        </View>
        {macroError ? (
          <ThemedText
            type="small"
            style={{ color: Colors.red, marginTop: Spacing.sm }}
          >
            {macroError}
          </ThemedText>
        ) : null}
      </Card>

      <Button
        onPress={generateGroceryList}
        disabled={generating}
        style={styles.generateButton}
      >
        {generating ? "Generating List..." : "Generate Grocery List"}
      </Button>

      {groceryList && (
        <>
          <Card style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Feather name="shopping-cart" size={20} color={Colors.accent} />
                <ThemedText style={styles.summaryLabel}>
                  Weekly Budget
                </ThemedText>
                <ThemedText
                  style={[styles.summaryValue, { color: Colors.accent }]}
                >
                  {groceryList.weeklyBudgetEstimate}
                </ThemedText>
              </View>
              <View style={styles.summaryItem}>
                <Feather name="activity" size={20} color={Colors.green} />
                <ThemedText style={styles.summaryLabel}>
                  Total Protein
                </ThemedText>
                <ThemedText
                  style={[styles.summaryValue, { color: Colors.green }]}
                >
                  {groceryList.totalMacros?.protein}g
                </ThemedText>
              </View>
            </View>
          </Card>

          {groceryList.sections?.map((section, idx) => (
            <Card key={idx} style={styles.sectionCard}>
              <Pressable
                style={styles.sectionHeader}
                onPress={() => toggleSection(section.name)}
              >
                <View style={styles.sectionInfo}>
                  <ThemedText style={styles.sectionName}>
                    {section.name}
                  </ThemedText>
                  <ThemedText
                    style={[styles.aisleText, { color: theme.textSecondary }]}
                  >
                    {section.aisle}
                  </ThemedText>
                </View>
                <View style={styles.sectionMeta}>
                  <ThemedText
                    style={[styles.itemCount, { color: theme.textSecondary }]}
                  >
                    {section.items?.length || 0} items
                  </ThemedText>
                  <Feather
                    name={
                      expandedSections.has(section.name)
                        ? "chevron-up"
                        : "chevron-down"
                    }
                    size={20}
                    color={theme.textSecondary}
                  />
                </View>
              </Pressable>

              {expandedSections.has(section.name) && section.items && (
                <View style={styles.itemsList}>
                  {section.items.map((item, itemIdx) => (
                    <View
                      key={itemIdx}
                      style={[
                        styles.itemRow,
                        { borderBottomColor: theme.border },
                      ]}
                    >
                      <View style={styles.itemInfo}>
                        <ThemedText style={styles.itemName}>
                          {item.name}
                        </ThemedText>
                        <ThemedText
                          style={[
                            styles.itemQuantity,
                            { color: theme.textSecondary },
                          ]}
                        >
                          {item.quantity}
                        </ThemedText>
                      </View>
                      {item.cost && (
                        <ThemedText
                          style={[styles.itemCost, { color: Colors.green }]}
                        >
                          {item.cost}
                        </ThemedText>
                      )}
                      {item.macros && (
                        <View style={styles.itemMacros}>
                          <ThemedText style={styles.itemMacroText}>
                            P:{item.macros.protein}g
                          </ThemedText>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </Card>
          ))}

          {groceryList.mealPrepSuggestions &&
            groceryList.mealPrepSuggestions.length > 0 && (
              <Card style={styles.card}>
                <ThemedText style={styles.sectionTitle}>
                  Meal Prep Tips
                </ThemedText>
                {groceryList.mealPrepSuggestions.map((tip, idx) => (
                  <View key={idx} style={styles.tipRow}>
                    <Feather
                      name="check-circle"
                      size={16}
                      color={Colors.green}
                    />
                    <ThemedText style={styles.tipText}>{tip}</ThemedText>
                  </View>
                ))}
              </Card>
            )}

          {groceryList.quickMealIdeas &&
            groceryList.quickMealIdeas.length > 0 && (
              <Card style={styles.card}>
                <ThemedText style={styles.sectionTitle}>
                  Quick Meal Ideas
                </ThemedText>
                {groceryList.quickMealIdeas.map((idea, idx) => (
                  <View key={idx} style={styles.mealRow}>
                    <ThemedText style={styles.mealNumber}>{idx + 1}</ThemedText>
                    <ThemedText style={styles.mealText}>{idea}</ThemedText>
                  </View>
                ))}
              </Card>
            )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: Spacing.md,
  },
  budgetOptions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  budgetOption: {
    flex: 1,
    borderWidth: 2,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: "center",
    gap: Spacing.xs,
  },
  budgetLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  inputRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    marginBottom: Spacing.xs,
  },
  budgetInput: {
    height: 44,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
    borderWidth: 1,
  },
  macroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  macroItem: {
    alignItems: "center",
  },
  macroValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  macroLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  generateButton: {
    marginBottom: Spacing.lg,
  },
  summaryCard: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  summaryItem: {
    alignItems: "center",
    gap: Spacing.xs,
  },
  summaryLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  sectionCard: {
    marginBottom: Spacing.sm,
    padding: Spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionInfo: {
    flex: 1,
  },
  sectionName: {
    fontSize: 16,
    fontWeight: "600",
  },
  aisleText: {
    fontSize: 12,
    marginTop: 2,
  },
  sectionMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  itemCount: {
    fontSize: 12,
  },
  itemsList: {
    marginTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
    paddingTop: Spacing.md,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "500",
  },
  itemQuantity: {
    fontSize: 12,
  },
  itemCost: {
    fontSize: 12,
    fontWeight: "600",
    marginRight: Spacing.sm,
  },
  itemMacros: {
    flexDirection: "row",
  },
  itemMacroText: {
    fontSize: 10,
    opacity: 0.7,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  tipText: {
    fontSize: 14,
    flex: 1,
  },
  mealRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  mealNumber: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.accent,
    width: 20,
  },
  mealText: {
    fontSize: 14,
    flex: 1,
  },
});
