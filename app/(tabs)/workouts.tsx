import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Dumbbell, Calendar, Target, Clock, Plus } from 'lucide-react-native';
import { useWorkoutPlanner } from '@/hooks/use-workout-planner';
import { useUserStore } from '@/stores/user-store';

export default function WorkoutsScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { currentWorkoutPlan, isGeneratingWorkoutPlan, generatePhysiqueBasedPlan } = useWorkoutPlanner();
  const { userProfile } = useUserStore();

  useEffect(() => {
    // Generate physique-based workout plan if none exists
    if (!currentWorkoutPlan && userProfile) {
      generatePhysiqueBasedPlan(4, 60);
    }

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, currentWorkoutPlan, userProfile]);

  const handleCreateWorkout = () => {
    // Navigate to workout creation
    console.log('Create new workout');
  };

  const handleStartWorkout = (workout: any) => {
    // Navigate to workout session
    console.log('Start workout:', workout);
  };

  if (isGeneratingWorkoutPlan) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" />
        <Text style={styles.loadingText}>Analyzing your physique and generating personalized workout plan...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Workouts</Text>
        <Text style={styles.subtitle}>AI-powered training plans based on your physique</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.cardsContainer, { opacity: fadeAnim }]}>
          
          {/* Current Plan Overview */}
          {currentWorkoutPlan && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Current Plan</Text>
              <View style={styles.planCard}>
                <View style={styles.planHeader}>
                  <Text style={styles.planName}>{currentWorkoutPlan.plan.name}</Text>
                  <View style={styles.planBadge}>
                    <Text style={styles.planBadgeText}>Physique-Based</Text>
                  </View>
                </View>
                <Text style={styles.planDescription}>{currentWorkoutPlan.plan.description}</Text>
                
                <View style={styles.planStats}>
                  <View style={styles.planStat}>
                    <Calendar size={16} color="#6366F1" />
                    <Text style={styles.planStatText}>{currentWorkoutPlan.plan.duration}</Text>
                  </View>
                  <View style={styles.planStat}>
                    <Target size={16} color="#10B981" />
                    <Text style={styles.planStatText}>
                      {currentWorkoutPlan.plan.schedule.filter(day => !day.restDay).length} workouts/week
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Today's Workout */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today's Workout</Text>
            {currentWorkoutPlan && currentWorkoutPlan.plan.schedule.length > 0 ? (
              <View style={styles.todayCard}>
                <View style={styles.todayHeader}>
                  <View style={styles.todayIcon}>
                    <Dumbbell size={24} color="#6366F1" />
                  </View>
                  <View style={styles.todayContent}>
                    <Text style={styles.todayTitle}>
                      {currentWorkoutPlan.plan.schedule[0]?.type || 'Upper Body Strength'}
                    </Text>
                    <View style={styles.todayMeta}>
                      <Clock size={14} color="#9CA3AF" />
                      <Text style={styles.todayDuration}>
                        {currentWorkoutPlan.plan.schedule[0]?.duration || 45} min
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={styles.startButton}
                    onPress={() => handleStartWorkout(currentWorkoutPlan.plan.schedule[0])}
                  >
                    <Text style={styles.startButtonText}>Start</Text>
                  </TouchableOpacity>
                </View>
                
                {currentWorkoutPlan.plan.schedule[0]?.exercises && (
                  <View style={styles.exercisesList}>
                    <Text style={styles.exercisesTitle}>Exercises ({currentWorkoutPlan.plan.schedule[0].exercises.length})</Text>
                    {currentWorkoutPlan.plan.schedule[0].exercises.slice(0, 3).map((exercise, index) => (
                      <View key={index} style={styles.exerciseItem}>
                        <Text style={styles.exerciseName}>{exercise.name}</Text>
                        <Text style={styles.exerciseDetails}>
                          {exercise.sets} sets × {exercise.reps} reps
                        </Text>
                      </View>
                    ))}
                    {currentWorkoutPlan.plan.schedule[0].exercises.length > 3 && (
                      <Text style={styles.moreExercises}>
                        +{currentWorkoutPlan.plan.schedule[0].exercises.length - 3} more exercises
                      </Text>
                    )}
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.restDayCard}>
                <Text style={styles.restDayTitle}>Rest Day</Text>
                <Text style={styles.restDayText}>Take time to recover and prepare for tomorrow</Text>
              </View>
            )}
          </View>

          {/* Weekly Schedule */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>This Week</Text>
            {currentWorkoutPlan ? (
              <View style={styles.scheduleContainer}>
                {currentWorkoutPlan.plan.schedule.map((day, index) => (
                  <View key={index} style={styles.scheduleDay}>
                    <View style={styles.scheduleDayHeader}>
                      <Text style={styles.scheduleDayName}>{day.day}</Text>
                      {day.restDay ? (
                        <View style={styles.restBadge}>
                          <Text style={styles.restBadgeText}>Rest</Text>
                        </View>
                      ) : (
                        <View style={styles.workoutBadge}>
                          <Text style={styles.workoutBadgeText}>{day.duration}min</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.scheduleDayType}>
                      {day.restDay ? 'Recovery day' : day.type}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <TouchableOpacity style={styles.createPlanButton} onPress={handleCreateWorkout}>
                <Plus size={24} color="#6366F1" />
                <Text style={styles.createPlanText}>Create Workout Plan</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Quick Stats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Progress</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>12</Text>
                <Text style={styles.statLabel}>Workouts</Text>
                <Text style={styles.statSubtext}>this month</Text>
              </View>
              
              <View style={styles.statCard}>
                <Text style={styles.statValue}>8.5</Text>
                <Text style={styles.statLabel}>Avg Score</Text>
                <Text style={styles.statSubtext}>form rating</Text>
              </View>
              
              <View style={styles.statCard}>
                <Text style={styles.statValue}>45</Text>
                <Text style={styles.statLabel}>Minutes</Text>
                <Text style={styles.statSubtext}>avg session</Text>
              </View>
              
              <View style={styles.statCard}>
                <Text style={styles.statValue}>85%</Text>
                <Text style={styles.statLabel}>Consistency</Text>
                <Text style={styles.statSubtext}>this week</Text>
              </View>
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
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  planCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#374151',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  planBadge: {
    backgroundColor: '#1E1B4B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  planBadgeText: {
    color: '#6366F1',
    fontSize: 12,
    fontWeight: '600',
  },
  planDescription: {
    color: '#9CA3AF',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  planStats: {
    flexDirection: 'row',
    gap: 16,
  },
  planStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  planStatText: {
    color: '#D1D5DB',
    fontSize: 12,
  },
  todayCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#374151',
  },
  todayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  todayIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1E1B4B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  todayContent: {
    flex: 1,
  },
  todayTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  todayMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  todayDuration: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  startButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  exercisesList: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
  },
  exercisesTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  exerciseName: {
    color: '#D1D5DB',
    fontSize: 14,
    flex: 1,
  },
  exerciseDetails: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  moreExercises: {
    color: '#6366F1',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 4,
  },
  restDayCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  restDayTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  restDayText: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
  },
  scheduleContainer: {
    gap: 12,
  },
  scheduleDay: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  scheduleDayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  scheduleDayName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  restBadge: {
    backgroundColor: '#374151',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  restBadgeText: {
    color: '#9CA3AF',
    fontSize: 10,
    fontWeight: '500',
  },
  workoutBadge: {
    backgroundColor: '#1E1B4B',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  workoutBadgeText: {
    color: '#6366F1',
    fontSize: 10,
    fontWeight: '500',
  },
  scheduleDayType: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  createPlanButton: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#374151',
    borderStyle: 'dashed',
  },
  createPlanText: {
    color: '#6366F1',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  statValue: {
    color: '#6366F1',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  statSubtext: {
    color: '#9CA3AF',
    fontSize: 10,
  },
});