import { FormAnalysisResponse } from '@/types/ai';

export const getFormAnalysisColor = (status: 'good' | 'needs_improvement' | 'poor'): string => {
  switch (status) {
    case 'good':
      return '#10B981'; // Green
    case 'needs_improvement':
      return '#F59E0B'; // Yellow
    case 'poor':
      return '#EF4444'; // Red
    default:
      return '#6B7280'; // Gray
  }
};

export const getFormAnalysisIcon = (status: 'good' | 'needs_improvement' | 'poor'): string => {
  switch (status) {
    case 'good':
      return 'CheckCircle';
    case 'needs_improvement':
      return 'AlertTriangle';
    case 'poor':
      return 'XCircle';
    default:
      return 'Info';
  }
};

export const formatCalories = (calories: number): string => {
  return calories.toLocaleString();
};

export const formatMacros = (grams: number, percentage: number): string => {
  return `${grams}g (${percentage}%)`;
};

export const getOverallFormGrade = (score: number): string => {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
};

export const getFormAnalysisSummary = (analysis: FormAnalysisResponse): string => {
  const goodMetrics = Object.values(analysis.metrics).filter(m => m.status === 'good').length;
  const totalMetrics = Object.values(analysis.metrics).length;
  
  if (goodMetrics === totalMetrics) {
    return 'Excellent form! Keep up the great work.';
  } else if (goodMetrics >= totalMetrics / 2) {
    return 'Good form with room for improvement.';
  } else {
    return 'Focus on the highlighted areas for better form.';
  }
};

export const calculateBMI = (weight: number, height: number): number => {
  // weight in kg, height in cm
  const heightInMeters = height / 100;
  return Number((weight / (heightInMeters * heightInMeters)).toFixed(1));
};

export const getBMICategory = (bmi: number): string => {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
};

export const formatWorkoutDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

export const getExperienceLevel = (level: string): { color: string; label: string } => {
  switch (level) {
    case 'beginner':
      return { color: '#10B981', label: 'Beginner' };
    case 'intermediate':
      return { color: '#F59E0B', label: 'Intermediate' };
    case 'advanced':
      return { color: '#EF4444', label: 'Advanced' };
    default:
      return { color: '#6B7280', label: 'Unknown' };
  }
};

export const generateMotivationalMessage = (analysis: FormAnalysisResponse): string => {
  const score = analysis.overallScore;
  
  if (score >= 90) {
    return "Outstanding form! You're setting a great example. 💪";
  } else if (score >= 80) {
    return "Great job! Small tweaks will make you even better. 🎯";
  } else if (score >= 70) {
    return "Good effort! Focus on the improvements and you'll excel. 📈";
  } else if (score >= 60) {
    return "Keep practicing! Every rep gets you closer to perfect form. 🔥";
  } else {
    return "Don't give up! Form takes time to develop. You've got this! 💪";
  }
};

export const prioritizeImprovements = (analysis: FormAnalysisResponse): string[] => {
  const metrics = analysis.metrics;
  const poorMetrics = Object.entries(metrics)
    .filter(([_, metric]) => metric.status === 'poor')
    .map(([key, _]) => key);
  
  const needsImprovementMetrics = Object.entries(metrics)
    .filter(([_, metric]) => metric.status === 'needs_improvement')
    .map(([key, _]) => key);
  
  // Return poor metrics first, then needs improvement
  return [...poorMetrics, ...needsImprovementMetrics];
};

export const formatExerciseName = (name: string): string => {
  return name
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const getWorkoutIntensity = (sets: number, reps: string): 'Low' | 'Moderate' | 'High' => {
  const avgReps = parseInt(reps.split('-')[0]) || parseInt(reps) || 10;
  const totalVolume = sets * avgReps;
  
  if (totalVolume < 20) return 'Low';
  if (totalVolume < 40) return 'Moderate';
  return 'High';
};