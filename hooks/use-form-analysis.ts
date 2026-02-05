import { useState } from 'react';
import { formAnalysisService } from '@/lib/ai/form-analysis';
import { useAIStore } from '@/stores/ai-store';
import { FormAnalysisRequest, FormAnalysisResponse } from '@/types/ai';

export const useFormAnalysis = () => {
  const [error, setError] = useState<string | null>(null);
  
  const {
    currentFormAnalysis,
    isAnalyzingForm,
    setCurrentFormAnalysis,
    setIsAnalyzingForm,
    addFormAnalysisToHistory,
    userProfile
  } = useAIStore();

  const analyzeForm = async (request: Omit<FormAnalysisRequest, 'userProfile'>): Promise<FormAnalysisResponse | null> => {
    try {
      setError(null);
      setIsAnalyzingForm(true);

      const fullRequest: FormAnalysisRequest = {
        ...request,
        userProfile
      };

      const analysis = await formAnalysisService.analyzeExerciseForm(fullRequest);
      
      setCurrentFormAnalysis(analysis);
      addFormAnalysisToHistory(analysis);
      
      return analysis;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze form';
      setError(errorMessage);
      return null;
    } finally {
      setIsAnalyzingForm(false);
    }
  };

  const analyzeSquatForm = async (backAngle?: number, kneeAlignment?: string, depth?: string) => {
    return analyzeForm({
      exercise: 'squat',
      metrics: {
        backAngle,
        kneeAlignment,
        depth
      }
    });
  };

  const analyzePushUpForm = async (userDescription?: string) => {
    return analyzeForm({
      exercise: 'push-up',
      userDescription
    });
  };

  const analyzeDeadliftForm = async (backAngle?: number, userDescription?: string) => {
    return analyzeForm({
      exercise: 'deadlift',
      metrics: {
        backAngle
      },
      userDescription
    });
  };

  return {
    currentFormAnalysis,
    isAnalyzingForm,
    error,
    analyzeForm,
    analyzeSquatForm,
    analyzePushUpForm,
    analyzeDeadliftForm
  };
};