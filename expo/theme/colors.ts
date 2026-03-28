// FitSync AI Design System - Colors
export const colors = {
  // Primary Brand Colors
  primary: {
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1', // Main brand color
    600: '#4F46E5',
    700: '#4338CA',
    800: '#3730A3',
    900: '#312E81',
  },

  // Secondary Colors
  secondary: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981', // Success/Growth color
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },

  // Accent Colors
  accent: {
    orange: {
      50: '#FFF7ED',
      100: '#FFEDD5',
      200: '#FED7AA',
      300: '#FDBA74',
      400: '#FB923C',
      500: '#F59E0B', // Warning/Energy color
      600: '#D97706',
      700: '#B45309',
      800: '#92400E',
      900: '#78350F',
    },
    red: {
      50: '#FEF2F2',
      100: '#FEE2E2',
      200: '#FECACA',
      300: '#FCA5A5',
      400: '#F87171',
      500: '#EF4444', // Error/Intensity color
      600: '#DC2626',
      700: '#B91C1C',
      800: '#991B1B',
      900: '#7F1D1D',
    },
  },

  // Neutral Colors (Dark Theme)
  neutral: {
    0: '#FFFFFF',
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    850: '#1A202C',
    900: '#111827',
    950: '#0A0A0A', // Main background
  },

  // Semantic Colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#6366F1',

  // Background Colors
  background: {
    primary: '#0A0A0A',
    secondary: '#111827',
    tertiary: '#1F2937',
    card: '#111827',
    elevated: '#1A202C',
  },

  // Text Colors
  text: {
    primary: '#FFFFFF',
    secondary: '#D1D5DB',
    tertiary: '#9CA3AF',
    quaternary: '#6B7280',
    inverse: '#0A0A0A',
  },

  // Border Colors
  border: {
    primary: '#374151',
    secondary: '#1F2937',
    tertiary: '#111827',
    focus: '#6366F1',
  },

  // Gradient Colors
  gradients: {
    primary: ['#6366F1', '#4F46E5'],
    secondary: ['#10B981', '#059669'],
    accent: ['#F59E0B', '#D97706'],
    dark: ['#0A0A0A', '#111827'],
    card: ['#111827', '#1F2937'],
  },

  // Muscle Group Colors (for charts and analysis)
  muscleGroups: {
    chest: '#EF4444',
    shoulders: '#F59E0B',
    arms: '#6366F1',
    back: '#10B981',
    core: '#8B5CF6',
    legs: '#F97316',
    glutes: '#EC4899',
    calves: '#06B6D4',
  },

  // Status Colors
  status: {
    excellent: '#10B981',
    good: '#84CC16',
    average: '#F59E0B',
    poor: '#EF4444',
    needsImprovement: '#F97316',
  },

  // Workout Intensity Colors
  intensity: {
    low: '#10B981',
    moderate: '#F59E0B',
    high: '#EF4444',
    extreme: '#DC2626',
  },
} as const;

// Color utility functions
export const getColorWithOpacity = (color: string, opacity: number): string => {
  return `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
};

export const getMuscleGroupColor = (muscleGroup: string): string => {
  const normalizedGroup = muscleGroup.toLowerCase();
  
  if (normalizedGroup.includes('chest')) return colors.muscleGroups.chest;
  if (normalizedGroup.includes('shoulder')) return colors.muscleGroups.shoulders;
  if (normalizedGroup.includes('arm') || normalizedGroup.includes('bicep') || normalizedGroup.includes('tricep')) return colors.muscleGroups.arms;
  if (normalizedGroup.includes('back') || normalizedGroup.includes('lat')) return colors.muscleGroups.back;
  if (normalizedGroup.includes('core') || normalizedGroup.includes('abs')) return colors.muscleGroups.core;
  if (normalizedGroup.includes('leg') || normalizedGroup.includes('quad') || normalizedGroup.includes('hamstring')) return colors.muscleGroups.legs;
  if (normalizedGroup.includes('glute')) return colors.muscleGroups.glutes;
  if (normalizedGroup.includes('calf')) return colors.muscleGroups.calves;
  
  return colors.primary[500]; // Default color
};

export const getStatusColor = (score: number): string => {
  if (score >= 9) return colors.status.excellent;
  if (score >= 7) return colors.status.good;
  if (score >= 5) return colors.status.average;
  if (score >= 3) return colors.status.poor;
  return colors.status.needsImprovement;
};