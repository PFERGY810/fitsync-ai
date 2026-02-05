import { useState } from 'react';
import { workoutPlannerService } from '@/lib/ai/workout-planner';
import { useAIStore } from '@/stores/ai-store';
import { useUserStore } from '@/stores/user-store';
import { WorkoutPlanRequest, WorkoutPlanResponse, PhysiqueAnalysisResult } from '@/types/ai';

export const useWorkoutPlanner = () => {
  const [error, setError] = useState<string | null>(null);
  
  const {
    currentWorkoutPlan,
    isGeneratingWorkoutPlan,
    setCurrentWorkoutPlan,
    setIsGeneratingWorkoutPlan,
    userProfile: aiProfile,
    currentPhysiqueAnalysis
  } = useAIStore();
  
  const { userProfile } = useUserStore();

  const generatePlan = async (request: WorkoutPlanRequest): Promise<WorkoutPlanResponse | null> => {
    try {
      setError(null);
      setIsGeneratingWorkoutPlan(true);

      // Enhanced request with physique analysis
      const enhancedRequest = {
        ...request,
        userStats: userProfile
      };

      const plan = await workoutPlannerService.generateWorkoutPlan(enhancedRequest, currentPhysiqueAnalysis as PhysiqueAnalysisResult | null);
      setCurrentWorkoutPlan(plan);
      
      return plan;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate workout plan';
      setError(errorMessage);
      return null;
    } finally {
      setIsGeneratingWorkoutPlan(false);
    }
  };

  const generatePhysiqueBasedPlan = async (daysPerWeek: number = 4, timePerSession: number = 60) => {
    if (!userProfile) {
      setError('User profile not found');
      return null;
    }

    // Determine goal based on physique analysis and user goals
    let primaryGoal: 'build_muscle' | 'lose_weight' | 'strength' | 'endurance' = 'build_muscle';
    
    if (currentPhysiqueAnalysis) {
      const { bodyFat, muscleMass } = currentPhysiqueAnalysis.metrics;
      
      // Determine primary goal based on physique metrics and user goals
      if (bodyFat > 20 && userProfile.goals.includes('Lose Weight')) {
        primaryGoal = 'lose_weight';
      } else if (muscleMass < 75 && userProfile.goals.includes('Build Muscle')) {
        primaryGoal = 'build_muscle';
      } else if (userProfile.goals.includes('Improve Strength')) {
        primaryGoal = 'strength';
      }
      
      // Include specific focus on weak points in the request
      const weakPointFocus = currentPhysiqueAnalysis.weakPoints?.map((wp: string) => `Focus on ${wp}`) || [];
      
      return generatePlan({
        goal: primaryGoal,
        experience: userProfile.experience,
        daysPerWeek,
        timePerSession,
        equipment: aiProfile.equipment,
        preferences: [
          ...(aiProfile.preferences || []), 
          ...weakPointFocus
        ],
        limitations: aiProfile.injuries
      });
    }

    // Fallback if no physique analysis is available
    return generatePlan({
      goal: primaryGoal,
      experience: userProfile.experience,
      daysPerWeek,
      timePerSession,
      equipment: aiProfile.equipment,
      preferences: aiProfile.preferences,
      limitations: aiProfile.injuries
    });
  };

  const generateMuscleBuilding = async (daysPerWeek: number = 4, timePerSession: number = 60) => {
    return generatePlan({
      goal: 'build_muscle',
      experience: userProfile?.experience || 'beginner',
      daysPerWeek,
      timePerSession,
      equipment: aiProfile.equipment,
      preferences: aiProfile.preferences
    });
  };

  const generateWeightLoss = async (daysPerWeek: number = 5, timePerSession: number = 45) => {
    return generatePlan({
      goal: 'lose_weight',
      experience: userProfile?.experience || 'beginner',
      daysPerWeek,
      timePerSession,
      equipment: aiProfile.equipment,
      preferences: aiProfile.preferences
    });
  };

  const generateStrength = async (daysPerWeek: number = 3, timePerSession: number = 75) => {
    return generatePlan({
      goal: 'strength',
      experience: userProfile?.experience || 'beginner',
      daysPerWeek,
      timePerSession,
      equipment: aiProfile.equipment,
      preferences: aiProfile.preferences
    });
  };

  const generateEndurance = async (daysPerWeek: number = 5, timePerSession: number = 45) => {
    return generatePlan({
      goal: 'endurance',
      experience: userProfile?.experience || 'beginner',
      daysPerWeek,
      timePerSession,
      equipment: aiProfile.equipment,
      preferences: aiProfile.preferences
    });
  };

  return {
    currentWorkoutPlan,
    isGeneratingWorkoutPlan,
    error,
    generatePlan,
    generatePhysiqueBasedPlan,
    generateMuscleBuilding,
    generateWeightLoss,
    generateStrength,
    generateEndurance
  };
};