import { useState } from 'react';
import { physiqueAnalyzerService } from '@/lib/ai/physique-analyzer';
import { useAIStore } from '@/stores/ai-store';
import { useUserStore } from '@/stores/user-store';
import { PhysiqueAnalysisRequest, PhysiqueAnalysisResult } from '@/types/ai';

export const usePhysiqueAnalysis = () => {
  const [currentAnalysis, setCurrentAnalysis] = useState<PhysiqueAnalysisResult | null>(null);
  const [progressHistory, setProgressHistory] = useState<PhysiqueAnalysisResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { userProfile } = useUserStore();
  const { 
    setCurrentPhysiqueAnalysis, 
    addPhysiqueAnalysisToHistory,
    currentPhysiqueAnalysis
  } = useAIStore();

  const analyzePhysique = async (request: PhysiqueAnalysisRequest): Promise<PhysiqueAnalysisResult | null> => {
    try {
      setError(null);
      setIsAnalyzing(true);

      // Use the enhanced physique analyzer service
      const analysis = await physiqueAnalyzerService.analyzePhysique(
        request.imageUri,
        request.poseType,
        userProfile
      );

      setCurrentAnalysis(analysis);
      setProgressHistory(prev => [analysis, ...prev].slice(0, 20)); // Keep last 20
      
      // Store in global state for use in workout and nutrition planning
      setCurrentPhysiqueAnalysis(analysis);
      addPhysiqueAnalysisToHistory(analysis);
      
      return analysis;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze physique';
      setError(errorMessage);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    currentAnalysis: currentAnalysis || currentPhysiqueAnalysis,
    progressHistory,
    isAnalyzing,
    error,
    analyzePhysique
  };
};