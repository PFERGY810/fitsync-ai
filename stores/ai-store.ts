import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FormAnalysisResponse, WorkoutPlanResponse, NutritionResponse, PhysiqueAnalysisResponse } from '@/types/ai';

interface AIState {
  // Form Analysis
  currentFormAnalysis: FormAnalysisResponse | null;
  formAnalysisHistory: FormAnalysisResponse[];
  isAnalyzingForm: boolean;
  
  // Physique Analysis
  currentPhysiqueAnalysis: PhysiqueAnalysisResponse | null;
  physiqueAnalysisHistory: PhysiqueAnalysisResponse[];
  isAnalyzingPhysique: boolean;
  
  // Workout Planning
  currentWorkoutPlan: WorkoutPlanResponse | null;
  isGeneratingWorkoutPlan: boolean;
  
  // Nutrition
  currentNutritionPlan: NutritionResponse | null;
  isGeneratingNutritionPlan: boolean;
  
  // User Profile for AI
  userProfile: {
    experience: 'beginner' | 'intermediate' | 'advanced';
    goals: string[];
    injuries: string[];
    preferences: string[];
    equipment: string[];
  };
  
  // Actions
  setCurrentFormAnalysis: (analysis: FormAnalysisResponse) => void;
  addFormAnalysisToHistory: (analysis: FormAnalysisResponse) => void;
  setIsAnalyzingForm: (isAnalyzing: boolean) => void;
  
  setCurrentPhysiqueAnalysis: (analysis: PhysiqueAnalysisResponse) => void;
  addPhysiqueAnalysisToHistory: (analysis: PhysiqueAnalysisResponse) => void;
  setIsAnalyzingPhysique: (isAnalyzing: boolean) => void;
  
  setCurrentWorkoutPlan: (plan: WorkoutPlanResponse) => void;
  setIsGeneratingWorkoutPlan: (isGenerating: boolean) => void;
  
  setCurrentNutritionPlan: (plan: NutritionResponse) => void;
  setIsGeneratingNutritionPlan: (isGenerating: boolean) => void;
  
  updateUserProfile: (profile: Partial<AIState['userProfile']>) => void;
  
  clearAllData: () => void;
}

export const useAIStore = create<AIState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentFormAnalysis: null,
      formAnalysisHistory: [],
      isAnalyzingForm: false,
      
      currentPhysiqueAnalysis: null,
      physiqueAnalysisHistory: [],
      isAnalyzingPhysique: false,
      
      currentWorkoutPlan: null,
      isGeneratingWorkoutPlan: false,
      
      currentNutritionPlan: null,
      isGeneratingNutritionPlan: false,
      
      userProfile: {
        experience: 'beginner',
        goals: [],
        injuries: [],
        preferences: [],
        equipment: []
      },
      
      // Actions
      setCurrentFormAnalysis: (analysis) => {
        set({ currentFormAnalysis: analysis });
      },
      
      addFormAnalysisToHistory: (analysis) => {
        const { formAnalysisHistory } = get();
        const updatedHistory = [analysis, ...formAnalysisHistory].slice(0, 10);
        set({ formAnalysisHistory: updatedHistory });
      },
      
      setIsAnalyzingForm: (isAnalyzing) => {
        set({ isAnalyzingForm: isAnalyzing });
      },
      
      setCurrentPhysiqueAnalysis: (analysis) => {
        set({ currentPhysiqueAnalysis: analysis });
      },
      
      addPhysiqueAnalysisToHistory: (analysis) => {
        const { physiqueAnalysisHistory } = get();
        const updatedHistory = [analysis, ...physiqueAnalysisHistory].slice(0, 20);
        set({ physiqueAnalysisHistory: updatedHistory });
      },
      
      setIsAnalyzingPhysique: (isAnalyzing) => {
        set({ isAnalyzingPhysique: isAnalyzing });
      },
      
      setCurrentWorkoutPlan: (plan) => {
        set({ currentWorkoutPlan: plan });
      },
      
      setIsGeneratingWorkoutPlan: (isGenerating) => {
        set({ isGeneratingWorkoutPlan: isGenerating });
      },
      
      setCurrentNutritionPlan: (plan) => {
        set({ currentNutritionPlan: plan });
      },
      
      setIsGeneratingNutritionPlan: (isGenerating) => {
        set({ isGeneratingNutritionPlan: isGenerating });
      },
      
      updateUserProfile: (profileUpdate) => {
        const { userProfile } = get();
        set({ 
          userProfile: { 
            ...userProfile, 
            ...profileUpdate 
          } 
        });
      },
      
      clearAllData: () => {
        set({
          currentFormAnalysis: null,
          formAnalysisHistory: [],
          currentPhysiqueAnalysis: null,
          physiqueAnalysisHistory: [],
          currentWorkoutPlan: null,
          currentNutritionPlan: null,
          userProfile: {
            experience: 'beginner',
            goals: [],
            injuries: [],
            preferences: [],
            equipment: []
          }
        });
      }
    }),
    {
      name: 'ai-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        currentWorkoutPlan: state.currentWorkoutPlan,
        currentNutritionPlan: state.currentNutritionPlan,
        currentPhysiqueAnalysis: state.currentPhysiqueAnalysis,
        formAnalysisHistory: state.formAnalysisHistory,
        physiqueAnalysisHistory: state.physiqueAnalysisHistory,
        userProfile: state.userProfile
      })
    }
  )
);