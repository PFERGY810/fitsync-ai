export type UnitSystem = 'metric' | 'imperial';

export interface MetricMeasurements {
  weight: number; // kg
  height: number; // cm
}

export interface ImperialMeasurements {
  weight: number; // lbs
  heightFeet: number;
  heightInches: number;
}

export const convertKgToLbs = (kg: number): number => {
  return Math.round(kg * 2.20462 * 10) / 10;
};

export const convertLbsToKg = (lbs: number): number => {
  return Math.round(lbs / 2.20462 * 10) / 10;
};

export const convertCmToFeetInches = (cm: number): { feet: number; inches: number } => {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
};

export const convertFeetInchesToCm = (feet: number, inches: number): number => {
  return Math.round((feet * 12 + inches) * 2.54);
};

export const formatWeight = (weight: number, unit: UnitSystem): string => {
  if (unit === 'imperial') {
    return `${convertKgToLbs(weight)} lbs`;
  }
  return `${weight} kg`;
};

export const formatHeight = (height: number, unit: UnitSystem): string => {
  if (unit === 'imperial') {
    const { feet, inches } = convertCmToFeetInches(height);
    return `${feet}'${inches}"`;
  }
  return `${height} cm`;
};

export const calculateBMI = (weight: number, height: number, weightUnit: UnitSystem = 'metric'): number => {
  // Convert to metric if needed
  const weightKg = weightUnit === 'imperial' ? convertLbsToKg(weight) : weight;
  const heightM = height / 100; // height is always stored in cm
  
  return Number((weightKg / (heightM * heightM)).toFixed(1));
};

export const getIdealWeightRange = (height: number, unit: UnitSystem): { min: number; max: number } => {
  const heightM = height / 100;
  const minBMI = 18.5;
  const maxBMI = 24.9;
  
  const minWeightKg = minBMI * heightM * heightM;
  const maxWeightKg = maxBMI * heightM * heightM;
  
  if (unit === 'imperial') {
    return {
      min: Math.round(convertKgToLbs(minWeightKg)),
      max: Math.round(convertKgToLbs(maxWeightKg))
    };
  }
  
  return {
    min: Math.round(minWeightKg),
    max: Math.round(maxWeightKg)
  };
};