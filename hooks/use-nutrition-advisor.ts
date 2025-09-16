import { useState } from 'react';
import { nutritionAdvisorService } from '@/lib/ai/nutrition-advisor';
import { useAIStore } from '@/stores/ai-store';
import { useUserStore } from '@/stores/user-store';
import { NutritionRequest, NutritionResponse, PhysiqueAnalysisResponse } from '@/types/ai';

export const useNutritionAdvisor = () => {
  const [error, setError] = useState<string | null>(null);
  
  const {
    currentNutritionPlan,
    isGeneratingNutritionPlan,
    setCurrentNutritionPlan,
    setIsGeneratingNutritionPlan,
    currentPhysiqueAnalysis
  } = useAIStore();
  
  const { userProfile } = useUserStore();

  const generateNutritionPlan = async (request: NutritionRequest): Promise<NutritionResponse | null> => {
    try {
      setError(null);
      setIsGeneratingNutritionPlan(true);

      // Get ZIP code and budget from user profile
      const zipCode = userProfile?.zipCode || '';
      const weeklyBudget = userProfile?.weeklyBudget || 100;

      const plan = await nutritionAdvisorService.generateNutritionPlan(
        request, 
        currentPhysiqueAnalysis as PhysiqueAnalysisResponse | null,
        zipCode,
        weeklyBudget
      );
      
      setCurrentNutritionPlan(plan);
      
      return plan;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate nutrition plan';
      setError(errorMessage);
      return null;
    } finally {
      setIsGeneratingNutritionPlan(false);
    }
  };

  const generatePhysiqueBasedPlan = async () => {
    if (!userProfile) {
      setError('User profile not found');
      return null;
    }

    // Determine goal based on physique analysis
    let primaryGoal: 'build_muscle' | 'lose_weight' | 'maintain' = 'maintain';
    
    if (currentPhysiqueAnalysis) {
      const { bodyFat, muscleMass } = currentPhysiqueAnalysis.metrics;
      
      if (bodyFat > (userProfile.gender === 'male' ? 18 : 25)) {
        primaryGoal = 'lose_weight';
      } else if (muscleMass < 75 || userProfile.goals.includes('Build Muscle')) {
        primaryGoal = 'build_muscle';
      }
    } else if (userProfile.goals.includes('Lose Weight')) {
      primaryGoal = 'lose_weight';
    } else if (userProfile.goals.includes('Build Muscle')) {
      primaryGoal = 'build_muscle';
    }

    // Determine activity level based on experience and goals
    let activityLevel: 'sedentary' | 'light' | 'moderate' | 'very_active' | 'extra_active' = 'moderate';
    
    if (userProfile.experience === 'advanced') {
      activityLevel = 'very_active';
    } else if (userProfile.experience === 'intermediate') {
      activityLevel = 'moderate';
    } else {
      activityLevel = 'light';
    }

    return generateNutritionPlan({
      goal: primaryGoal,
      weight: userProfile.weight,
      height: userProfile.height,
      age: userProfile.age,
      gender: userProfile.gender,
      activityLevel
    });
  };

  const generateMuscleGainPlan = async (weight: number, height: number, age: number, gender: 'male' | 'female') => {
    return generateNutritionPlan({
      goal: 'build_muscle',
      weight,
      height,
      age,
      gender,
      activityLevel: 'very_active'
    });
  };

  const generateWeightLossPlan = async (weight: number, height: number, age: number, gender: 'male' | 'female') => {
    return generateNutritionPlan({
      goal: 'lose_weight',
      weight,
      height,
      age,
      gender,
      activityLevel: 'moderate'
    });
  };

  const generateMaintenancePlan = async (weight: number, height: number, age: number, gender: 'male' | 'female') => {
    return generateNutritionPlan({
      goal: 'maintain',
      weight,
      height,
      age,
      gender,
      activityLevel: 'moderate'
    });
  };

  return {
    currentNutritionPlan,
    isGeneratingNutritionPlan,
    error,
    generateNutritionPlan,
    generatePhysiqueBasedPlan,
    generateMuscleGainPlan,
    generateWeightLossPlan,
    generateMaintenancePlan
  };
};