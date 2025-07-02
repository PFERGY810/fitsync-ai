import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Apple, Target, TrendingUp, Clock } from 'lucide-react-native';
import { useNutritionAdvisor } from '@/hooks/use-nutrition-advisor';
import { useUserStore } from '@/stores/user-store';

export default function NutritionScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { currentNutritionPlan, isGeneratingNutritionPlan, generatePhysiqueBasedPlan } = useNutritionAdvisor();
  const { userProfile } = useUserStore();

  useEffect(() => {
    // Generate physique-based nutrition plan if none exists
    if (!currentNutritionPlan && userProfile) {
      generatePhysiqueBasedPlan();
    }

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, currentNutritionPlan, userProfile]);

  if (isGeneratingNutritionPlan) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" />
        <Text style={styles.loadingText}>Analyzing your physique and generating personalized nutrition plan...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Nutrition</Text>
        <Text style={styles.subtitle}>AI-powered meal planning based on your physique</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.cardsContainer, { opacity: fadeAnim }]}>
          
          {/* Daily Overview */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today's Goals</Text>
            <View style={styles.overviewCard}>
              <View style={styles.caloriesSection}>
                <View style={styles.caloriesHeader}>
                  <Target size={20} color="#6366F1" />
                  <Text style={styles.caloriesTitle}>Daily Calories</Text>
                </View>
                <Text style={styles.caloriesValue}>
                  {currentNutritionPlan ? currentNutritionPlan.dailyCalories.toLocaleString() : '2,850'}
                </Text>
                <Text style={styles.caloriesSubtext}>kcal target</Text>
              </View>
              
              <View style={styles.progressRing}>
                <Text style={styles.ringProgressText}>68%</Text>
                <Text style={styles.ringProgressLabel}>consumed</Text>
              </View>
            </View>
          </View>

          {/* Macros */}
          {currentNutritionPlan && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Macronutrients</Text>
              <View style={styles.macrosContainer}>
                <View style={styles.macroCard}>
                  <View style={styles.macroHeader}>
                    <View style={[styles.macroIndicator, { backgroundColor: '#6366F1' }]} />
                    <Text style={styles.macroLabel}>Protein</Text>
                  </View>
                  <Text style={styles.macroValue}>{currentNutritionPlan.macros.protein.grams}g</Text>
                  <Text style={styles.macroPercentage}>{currentNutritionPlan.macros.protein.percentage}%</Text>
                  <View style={styles.macroProgress}>
                    <View style={[styles.macroProgressFill, { width: '75%', backgroundColor: '#6366F1' }]} />
                  </View>
                </View>

                <View style={styles.macroCard}>
                  <View style={styles.macroHeader}>
                    <View style={[styles.macroIndicator, { backgroundColor: '#10B981' }]} />
                    <Text style={styles.macroLabel}>Carbs</Text>
                  </View>
                  <Text style={styles.macroValue}>{currentNutritionPlan.macros.carbs.grams}g</Text>
                  <Text style={styles.macroPercentage}>{currentNutritionPlan.macros.carbs.percentage}%</Text>
                  <View style={styles.macroProgress}>
                    <View style={[styles.macroProgressFill, { width: '60%', backgroundColor: '#10B981' }]} />
                  </View>
                </View>

                <View style={styles.macroCard}>
                  <View style={styles.macroHeader}>
                    <View style={[styles.macroIndicator, { backgroundColor: '#F59E0B' }]} />
                    <Text style={styles.macroLabel}>Fats</Text>
                  </View>
                  <Text style={styles.macroValue}>{currentNutritionPlan.macros.fats.grams}g</Text>
                  <Text style={styles.macroPercentage}>{currentNutritionPlan.macros.fats.percentage}%</Text>
                  <View style={styles.macroProgress}>
                    <View style={[styles.macroProgressFill, { width: '80%', backgroundColor: '#F59E0B' }]} />
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Meal Plan */}
          {currentNutritionPlan && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Today's Meals</Text>
              <View style={styles.mealsContainer}>
                
                <View style={styles.mealCard}>
                  <View style={styles.mealHeader}>
                    <Text style={styles.mealTitle}>Breakfast</Text>
                    <Clock size={16} color="#9CA3AF" />
                  </View>
                  {currentNutritionPlan.mealPlan.breakfast.map((meal, index) => (
                    <View key={index} style={styles.mealItem}>
                      <Text style={styles.mealName}>{meal.name}</Text>
                      <Text style={styles.mealCalories}>{meal.calories} kcal</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.mealCard}>
                  <View style={styles.mealHeader}>
                    <Text style={styles.mealTitle}>Lunch</Text>
                    <Clock size={16} color="#9CA3AF" />
                  </View>
                  {currentNutritionPlan.mealPlan.lunch.map((meal, index) => (
                    <View key={index} style={styles.mealItem}>
                      <Text style={styles.mealName}>{meal.name}</Text>
                      <Text style={styles.mealCalories}>{meal.calories} kcal</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.mealCard}>
                  <View style={styles.mealHeader}>
                    <Text style={styles.mealTitle}>Dinner</Text>
                    <Clock size={16} color="#9CA3AF" />
                  </View>
                  {currentNutritionPlan.mealPlan.dinner.map((meal, index) => (
                    <View key={index} style={styles.mealItem}>
                      <Text style={styles.mealName}>{meal.name}</Text>
                      <Text style={styles.mealCalories}>{meal.calories} kcal</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.mealCard}>
                  <View style={styles.mealHeader}>
                    <Text style={styles.mealTitle}>Snacks</Text>
                    <Apple size={16} color="#9CA3AF" />
                  </View>
                  {currentNutritionPlan.mealPlan.snacks.map((meal, index) => (
                    <View key={index} style={styles.mealItem}>
                      <Text style={styles.mealName}>{meal.name}</Text>
                      <Text style={styles.mealCalories}>{meal.calories} kcal</Text>
                    </View>
                  ))}
                </View>

              </View>
            </View>
          )}

          {/* Weekly Progress */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <TrendingUp size={20} color="#6366F1" />
              <Text style={styles.sectionTitle}>This Week</Text>
            </View>
            <View style={styles.progressCard}>
              <View style={styles.progressItem}>
                <Text style={styles.progressLabel}>Calorie Goal</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: '85%' }]} />
                </View>
                <Text style={styles.progressText}>85% avg</Text>
              </View>
              
              <View style={styles.progressItem}>
                <Text style={styles.progressLabel}>Protein Target</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: '92%', backgroundColor: '#10B981' }]} />
                </View>
                <Text style={styles.progressText}>92% avg</Text>
              </View>
              
              <View style={styles.progressItem}>
                <Text style={styles.progressLabel}>Meal Consistency</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: '78%', backgroundColor: '#F59E0B' }]} />
                </View>
                <Text style={styles.progressText}>78% avg</Text>
              </View>
            </View>
          </View>

          {/* AI Tips */}
          {currentNutritionPlan && currentNutritionPlan.tips.length > 0 && (
            <View style={styles.tipsCard}>
              <Text style={styles.tipsTitle}>AI Nutrition Tips</Text>
              {currentNutritionPlan.tips.map((tip, index) => (
                <Text key={index} style={styles.tipText}>• {tip}</Text>
              ))}
            </View>
          )}

          {/* Supplements */}
          {currentNutritionPlan && currentNutritionPlan.supplements && currentNutritionPlan.supplements.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recommended Supplements</Text>
              <View style={styles.supplementsContainer}>
                {currentNutritionPlan.supplements.map((supplement, index) => (
                  <View key={index} style={styles.supplementItem}>
                    <Text style={styles.supplementName}>{supplement}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 24,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: '#9CA3AF',
    fontSize: 16,
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  cardsContainer: {
    paddingBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  overviewCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#374151',
  },
  caloriesSection: {
    flex: 1,
  },
  caloriesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  caloriesTitle: {
    color: '#D1D5DB',
    fontSize: 14,
    fontWeight: '500',
  },
  caloriesValue: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  caloriesSubtext: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  progressRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#6366F1',
  },
  ringProgressText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  ringProgressLabel: {
    color: '#9CA3AF',
    fontSize: 10,
  },
  macrosContainer: {
    gap: 12,
  },
  macroCard: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  macroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  macroIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  macroLabel: {
    color: '#D1D5DB',
    fontSize: 14,
    fontWeight: '500',
  },
  macroValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  macroPercentage: {
    color: '#9CA3AF',
    fontSize: 12,
    marginBottom: 8,
  },
  macroProgress: {
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
    overflow: 'hidden',
  },
  macroProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  mealsContainer: {
    gap: 16,
  },
  mealCard: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mealTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  mealItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealName: {
    color: '#D1D5DB',
    fontSize: 14,
    flex: 1,
  },
  mealCalories: {
    color: '#6366F1',
    fontSize: 12,
    fontWeight: '500',
  },
  progressCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#374151',
    gap: 16,
  },
  progressItem: {
    gap: 8,
  },
  progressLabel: {
    color: '#D1D5DB',
    fontSize: 14,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 4,
  },
  progressText: {
    color: '#9CA3AF',
    fontSize: 12,
    textAlign: 'right',
  },
  tipsCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#6366F1',
    marginBottom: 24,
  },
  tipsTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  tipText: {
    color: '#D1D5DB',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  supplementsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  supplementItem: {
    backgroundColor: '#1F2937',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  supplementName: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '500',
  },
});