import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Calendar, Target, TrendingUp, Zap, Camera, Image as ImageIcon, Dumbbell } from 'lucide-react-native';
import { useUserStore } from '@/stores/user-store';
import { useAIStore } from '@/stores/ai-store';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(30)).current;
  const { userProfile } = useUserStore();
  const { currentPhysiqueAnalysis, currentWorkoutPlan, currentNutritionPlan } = useAIStore();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(translateAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();
  }, [fadeAnim, translateAnim]);

  const handleFormAnalysis = () => {
    router.push('/(tabs)/form-analysis');
  };

  const handlePhysiqueAnalysis = () => {
    router.push('/(tabs)/physique-analysis');
  };

  const handleWorkouts = () => {
    router.push('/(tabs)/workouts');
  };

  const handleNutrition = () => {
    router.push('/(tabs)/nutrition');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getName = () => {
    return userProfile?.name || 'Fitness Enthusiast';
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={['#0A0A0A', '#111827']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}!</Text>
            <Text style={styles.username}>{getName()}</Text>
          </View>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>FitSync AI</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={[
          styles.cardsContainer, 
          { 
            opacity: fadeAnim,
            transform: [{ translateY: translateAnim }]
          }
        ]}>
          
          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity 
                style={styles.quickAction} 
                onPress={handleFormAnalysis}
              >
                <LinearGradient
                  colors={['#1E1B4B', '#2E3A8C']}
                  style={styles.quickActionGradient}
                >
                  <Camera size={24} color="#6366F1" />
                  <Text style={styles.quickActionText}>Form Analysis</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickAction} 
                onPress={handlePhysiqueAnalysis}
              >
                <LinearGradient
                  colors={['#064E3B', '#065F46']}
                  style={styles.quickActionGradient}
                >
                  <ImageIcon size={24} color="#10B981" />
                  <Text style={styles.quickActionText}>Physique Tracking</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickAction} 
                onPress={handleWorkouts}
              >
                <LinearGradient
                  colors={['#422006', '#633308']}
                  style={styles.quickActionGradient}
                >
                  <Dumbbell size={24} color="#F59E0B" />
                  <Text style={styles.quickActionText}>Workouts</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickAction} 
                onPress={handleNutrition}
              >
                <LinearGradient
                  colors={['#4C0519', '#6B0D23']}
                  style={styles.quickActionGradient}
                >
                  <Target size={24} color="#EF4444" />
                  <Text style={styles.quickActionText}>Nutrition</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Today's Overview */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today's Overview</Text>
            <View style={styles.statsRow}>
              <View style={[styles.statCard, styles.statCardHalf]}>
                <View style={styles.statHeader}>
                  <Calendar size={20} color="#6366F1" />
                  <Text style={styles.statTitle}>Workout</Text>
                </View>
                <Text style={styles.statValue}>
                  {currentWorkoutPlan?.plan?.schedule?.[0]?.type || 'Upper Body'}
                </Text>
                <Text style={styles.statSubtext}>
                  {currentWorkoutPlan?.plan?.schedule?.[0]?.duration || 45} min planned
                </Text>
              </View>

              <View style={[styles.statCard, styles.statCardHalf]}>
                <View style={styles.statHeader}>
                  <Target size={20} color="#10B981" />
                  <Text style={styles.statTitle}>Calories</Text>
                </View>
                <Text style={styles.statValue}>
                  {currentNutritionPlan?.dailyCalories?.toLocaleString() || '2,850'}
                </Text>
                <Text style={styles.statSubtext}>target today</Text>
              </View>
            </View>
          </View>

          {/* Physique Analysis */}
          {currentPhysiqueAnalysis ? (
            <TouchableOpacity 
              style={styles.card}
              onPress={handlePhysiqueAnalysis}
            >
              <View style={styles.cardHeader}>
                <ImageIcon size={20} color="#10B981" />
                <Text style={styles.cardTitle}>Physique Analysis</Text>
              </View>
              <View style={styles.physiqueContainer}>
                <View style={styles.physiqueMetrics}>
                  <View style={styles.physiqueMetric}>
                    <Text style={styles.physiqueMetricValue}>
                      {currentPhysiqueAnalysis.metrics.muscleMass}%
                    </Text>
                    <Text style={styles.physiqueMetricLabel}>Muscle Mass</Text>
                  </View>
                  <View style={styles.physiqueMetric}>
                    <Text style={styles.physiqueMetricValue}>
                      {currentPhysiqueAnalysis.metrics.bodyFat}%
                    </Text>
                    <Text style={styles.physiqueMetricLabel}>Body Fat</Text>
                  </View>
                  <View style={styles.physiqueMetric}>
                    <Text style={styles.physiqueMetricValue}>
                      {currentPhysiqueAnalysis.metrics.symmetry}/10
                    </Text>
                    <Text style={styles.physiqueMetricLabel}>Symmetry</Text>
                  </View>
                </View>
                <View style={styles.physiqueActions}>
                  <Text style={styles.physiqueDate}>
                    Last updated: {currentPhysiqueAnalysis.date}
                  </Text>
                  <TouchableOpacity style={styles.updateButton}>
                    <Text style={styles.updateButtonText}>Update</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.card}
              onPress={handlePhysiqueAnalysis}
            >
              <View style={styles.emptyPhysiqueContainer}>
                <ImageIcon size={32} color="#6B7280" />
                <Text style={styles.emptyPhysiqueTitle}>No Physique Analysis</Text>
                <Text style={styles.emptyPhysiqueText}>
                  Upload photos to get personalized workout and nutrition plans
                </Text>
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  style={styles.startAnalysisButton}
                >
                  <Text style={styles.startAnalysisText}>Start Analysis</Text>
                </LinearGradient>
              </View>
            </TouchableOpacity>
          )}

          {/* Progress This Week */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <TrendingUp size={20} color="#F59E0B" />
              <Text style={styles.cardTitle}>This Week's Progress</Text>
            </View>
            <View style={styles.progressContainer}>
              <View style={styles.progressItem}>
                <Text style={styles.progressLabel}>Workouts Completed</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: '60%' }]} />
                </View>
                <Text style={styles.progressText}>3/5</Text>
              </View>
              <View style={styles.progressItem}>
                <Text style={styles.progressLabel}>Form Analysis Sessions</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: '40%', backgroundColor: '#10B981' }]} />
                </View>
                <Text style={styles.progressText}>2/5</Text>
              </View>
            </View>
          </View>

          {/* Recent Activity */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Zap size={20} color="#EF4444" />
              <Text style={styles.cardTitle}>Recent Activity</Text>
            </View>
            <View style={styles.activityContainer}>
              <View style={styles.activityItem}>
                <Text style={styles.activityEmoji}>🏋️</Text>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>Squat form analyzed</Text>
                  <Text style={styles.activityTime}>2 hours ago</Text>
                </View>
                <Text style={styles.activityScore}>85/100</Text>
              </View>
              
              <View style={styles.activityItem}>
                <Text style={styles.activityEmoji}>📸</Text>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>Progress photo uploaded</Text>
                  <Text style={styles.activityTime}>Yesterday</Text>
                </View>
                <Text style={styles.activityBadge}>New</Text>
              </View>
              
              <View style={styles.activityItem}>
                <Text style={styles.activityEmoji}>💪</Text>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>Chest workout completed</Text>
                  <Text style={styles.activityTime}>2 days ago</Text>
                </View>
                <Text style={styles.activityDuration}>45 min</Text>
              </View>
            </View>
          </View>

          {/* AI Recommendations */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>AI Recommendations</Text>
            <View style={styles.recommendationsContainer}>
              <TouchableOpacity style={styles.recommendation} onPress={handleWorkouts}>
                <Text style={styles.recommendationTitle}>Focus on Lower Body</Text>
                <Text style={styles.recommendationText}>
                  Based on your recent upper body sessions, it's time for legs!
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.recommendation} onPress={handleFormAnalysis}>
                <Text style={styles.recommendationTitle}>Improve Deadlift Form</Text>
                <Text style={styles.recommendationText}>
                  Upload a video to get personalized form feedback
                </Text>
              </TouchableOpacity>
            </View>
          </View>

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
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
  },
  username: {
    color: '#9CA3AF',
    fontSize: 16,
    marginTop: 2,
  },
  logoContainer: {
    backgroundColor: '#1E1B4B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  logoText: {
    color: '#6366F1',
    fontWeight: 'bold',
    fontSize: 14,
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
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickAction: {
    width: '48%',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  quickActionGradient: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
  },
  quickActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#374151',
  },
  statCardHalf: {
    flex: 1,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  statTitle: {
    color: '#D1D5DB',
    fontSize: 14,
    fontWeight: '500',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statSubtext: {
    color: '#6B7280',
    fontSize: 12,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  physiqueContainer: {
    gap: 16,
  },
  physiqueMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  physiqueMetric: {
    alignItems: 'center',
  },
  physiqueMetricValue: {
    color: '#10B981',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  physiqueMetricLabel: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  physiqueActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1F2937',
    paddingTop: 16,
  },
  physiqueDate: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  updateButton: {
    backgroundColor: '#1E1B4B',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  updateButtonText: {
    color: '#6366F1',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyPhysiqueContainer: {
    alignItems: 'center',
    padding: 20,
  },
  emptyPhysiqueTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyPhysiqueText: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  startAnalysisButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  startAnalysisText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  progressContainer: {
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
  activityContainer: {
    gap: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activityEmoji: {
    fontSize: 20,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  activityTime: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 2,
  },
  activityScore: {
    color: '#6366F1',
    fontSize: 12,
    fontWeight: '600',
  },
  activityBadge: {
    backgroundColor: '#10B981',
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  activityDuration: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  recommendationsContainer: {
    gap: 12,
    marginTop: 12,
  },
  recommendation: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#6366F1',
  },
  recommendationTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  recommendationText: {
    color: '#D1D5DB',
    fontSize: 12,
    lineHeight: 16,
  },
});