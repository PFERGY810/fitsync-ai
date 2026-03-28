import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { usePhysiqueAnalysis } from '@/hooks/use-physique-analysis';
import { useWorkoutPlanner } from '@/hooks/use-workout-planner';
import { useNutritionAdvisor } from '@/hooks/use-nutrition-advisor';
import { ArrowRight, Dumbbell, Utensils, ChevronRight, Award, Target, TrendingUp } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export const PhysiqueResults = () => {
  const router = useRouter();
  const { currentAnalysis } = usePhysiqueAnalysis();
  const { generatePhysiqueBasedPlan: generateWorkoutPlan, isGeneratingWorkoutPlan } = useWorkoutPlanner();
  const { generatePhysiqueBasedPlan: generateNutritionPlan, isGeneratingNutritionPlan } = useNutritionAdvisor();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  
  useEffect(() => {
    // Staggered animation
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
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();
  }, []);
  
  const handleGenerateWorkoutPlan = async () => {
    await generateWorkoutPlan();
    router.push('/(tabs)/workouts');
  };
  
  const handleGenerateNutritionPlan = async () => {
    await generateNutritionPlan();
    router.push('/(tabs)/nutrition');
  };
  
  if (!currentAnalysis) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>No Analysis Available</Text>
        <Text style={styles.subtitle}>Please complete a physique analysis first.</Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.push('/physique-setup')}
        >
          <Text style={styles.buttonText}>Start Analysis</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  const { metrics, insights, recommendations, muscleGroups, weakPoints, strengthPoints } = currentAnalysis;
  
  // Calculate overall score
  const overallScore = Math.round(
    (metrics.muscleMass / 100 * 40) + 
    ((10 - Math.abs(metrics.bodyFat - 15)) / 10 * 20) + 
    (metrics.symmetry / 10 * 20) + 
    (metrics.posture / 10 * 10) + 
    (metrics.overallConvexity / 10 * 10)
  );
  
  return (
    <ScrollView style={styles.container}>
      <Animated.View style={[
        styles.content,
        { 
          opacity: fadeAnim,
          transform: [
            { translateY: translateAnim },
            { scale: scaleAnim }
          ]
        }
      ]}>
        <Text style={styles.title}>Physique Analysis</Text>
        <Text style={styles.subtitle}>AI-powered assessment of your current physique</Text>
        
        <View style={styles.scoreCard}>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreValue}>{overallScore}</Text>
            <Text style={styles.scoreLabel}>SCORE</Text>
          </View>
          <View style={styles.scoreDetails}>
            <Text style={styles.scoreTitle}>Overall Assessment</Text>
            <Text style={styles.scoreDescription}>
              Based on muscle mass, body fat, symmetry, posture, and muscular development
            </Text>
          </View>
        </View>
        
        <View style={styles.metricsContainer}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{metrics.muscleMass}%</Text>
            <Text style={styles.metricLabel}>Muscle Mass</Text>
          </View>
          
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{metrics.bodyFat}%</Text>
            <Text style={styles.metricLabel}>Body Fat</Text>
          </View>
          
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{metrics.symmetry}/10</Text>
            <Text style={styles.metricLabel}>Symmetry</Text>
          </View>
          
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{metrics.posture}/10</Text>
            <Text style={styles.metricLabel}>Posture</Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Award size={20} color="#6366F1" />
            <Text style={styles.sectionTitle}>Strengths</Text>
          </View>
          {strengthPoints.length > 0 ? (
            strengthPoints.map((point, index) => (
              <View key={`strength-${index}`} style={styles.listItem}>
                <View style={[styles.listItemBullet, styles.strengthBullet]} />
                <Text style={styles.listItemText}>{point}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyListItem}>No specific strength points identified</Text>
          )}
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Target size={20} color="#F59E0B" />
            <Text style={styles.sectionTitle}>Areas to Focus On</Text>
          </View>
          {weakPoints.length > 0 ? (
            weakPoints.map((point, index) => (
              <View key={`weak-${index}`} style={styles.listItem}>
                <View style={[styles.listItemBullet, styles.weakPointBullet]} />
                <Text style={styles.listItemText}>{point}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyListItem}>No specific weak points identified</Text>
          )}
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TrendingUp size={20} color="#10B981" />
            <Text style={styles.sectionTitle}>Insights</Text>
          </View>
          {insights.map((insight, index) => (
            <View key={`insight-${index}`} style={styles.listItem}>
              <View style={styles.listItemBullet} />
              <Text style={styles.listItemText}>{insight}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Muscle Group Analysis</Text>
          {Object.entries(muscleGroups).map(([group, data]) => (
            <View key={group} style={styles.muscleGroupItem}>
              <View style={styles.muscleGroupHeader}>
                <Text style={styles.muscleGroupName}>{group}</Text>
                <View style={styles.muscleGroupScores}>
                  <Text style={[
                    styles.muscleGroupScore, 
                    data.development >= 8 ? styles.highScore : 
                    data.development <= 5 ? styles.lowScore : 
                    styles.mediumScore
                  ]}>
                    {data.development}/10
                  </Text>
                </View>
              </View>
              
              <View style={styles.muscleGroupMetrics}>
                <View style={styles.metricBar}>
                  <Text style={styles.metricBarLabel}>Development</Text>
                  <View style={styles.metricBarContainer}>
                    <View style={[
                      styles.metricBarFill, 
                      { width: `${data.development * 10}%` },
                      data.development >= 8 ? styles.highScoreBar : 
                      data.development <= 5 ? styles.lowScoreBar : 
                      styles.mediumScoreBar
                    ]} />
                  </View>
                </View>
                
                <View style={styles.metricBar}>
                  <Text style={styles.metricBarLabel}>Symmetry</Text>
                  <View style={styles.metricBarContainer}>
                    <View style={[
                      styles.metricBarFill, 
                      { width: `${data.symmetry * 10}%` },
                      data.symmetry >= 8 ? styles.highScoreBar : 
                      data.symmetry <= 5 ? styles.lowScoreBar : 
                      styles.mediumScoreBar
                    ]} />
                  </View>
                </View>
                
                <View style={styles.metricBar}>
                  <Text style={styles.metricBarLabel}>Convexity</Text>
                  <View style={styles.metricBarContainer}>
                    <View style={[
                      styles.metricBarFill, 
                      { width: `${data.convexity * 10}%` },
                      data.convexity >= 8 ? styles.highScoreBar : 
                      data.convexity <= 5 ? styles.lowScoreBar : 
                      styles.mediumScoreBar
                    ]} />
                  </View>
                </View>
              </View>
              
              <Text style={styles.muscleGroupNotes}>{data.notes}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommendations</Text>
          {recommendations.map((recommendation, index) => (
            <View key={`recommendation-${index}`} style={styles.listItem}>
              <View style={styles.listItemBullet} />
              <Text style={styles.listItemText}>{recommendation}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleGenerateWorkoutPlan}
            disabled={isGeneratingWorkoutPlan}
          >
            <LinearGradient
              colors={['#6366F1', '#4F46E5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <View style={styles.actionButtonContent}>
                <Dumbbell size={24} color="#fff" />
                <Text style={styles.actionButtonText}>
                  {isGeneratingWorkoutPlan ? 'Generating...' : 'Generate Workout Plan'}
                </Text>
                <ChevronRight size={20} color="#fff" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleGenerateNutritionPlan}
            disabled={isGeneratingNutritionPlan}
          >
            <LinearGradient
              colors={['#FF4500', '#FF7E50']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <View style={styles.actionButtonContent}>
                <Utensils size={24} color="#fff" />
                <Text style={styles.actionButtonText}>
                  {isGeneratingNutritionPlan ? 'Generating...' : 'Generate Nutrition Plan'}
                </Text>
                <ChevronRight size={20} color="#fff" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 24,
  },
  scoreCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1E1B4B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6366F1',
  },
  scoreLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 2,
  },
  scoreDetails: {
    flex: 1,
  },
  scoreTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  scoreDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6366F1',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#374151',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  listItemBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6366F1',
    marginTop: 6,
    marginRight: 12,
  },
  strengthBullet: {
    backgroundColor: '#10B981',
  },
  weakPointBullet: {
    backgroundColor: '#F59E0B',
  },
  listItemText: {
    fontSize: 14,
    color: '#D1D5DB',
    flex: 1,
    lineHeight: 20,
  },
  emptyListItem: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  muscleGroupItem: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
    paddingBottom: 16,
  },
  muscleGroupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  muscleGroupName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'capitalize',
  },
  muscleGroupScores: {
    flexDirection: 'row',
    gap: 8,
  },
  muscleGroupScore: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6366F1',
  },
  highScore: {
    color: '#10B981',
  },
  mediumScore: {
    color: '#F59E0B',
  },
  lowScore: {
    color: '#EF4444',
  },
  muscleGroupMetrics: {
    marginBottom: 12,
  },
  metricBar: {
    marginBottom: 8,
  },
  metricBarLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  metricBarContainer: {
    height: 6,
    backgroundColor: '#1F2937',
    borderRadius: 3,
    overflow: 'hidden',
  },
  metricBarFill: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 3,
  },
  highScoreBar: {
    backgroundColor: '#10B981',
  },
  mediumScoreBar: {
    backgroundColor: '#F59E0B',
  },
  lowScoreBar: {
    backgroundColor: '#EF4444',
  },
  muscleGroupNotes: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  actionButtons: {
    marginBottom: 32,
    gap: 16,
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradientButton: {
    padding: 16,
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    flex: 1,
    marginLeft: 12,
  },
  button: {
    backgroundColor: '#6366F1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default PhysiqueResults;