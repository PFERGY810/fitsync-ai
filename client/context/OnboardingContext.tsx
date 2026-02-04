import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from "react";
import type { OnboardingProfile, OnboardingStep } from "@/types/onboarding";
import { getApiUrl } from "@/lib/query-client";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface OnboardingContextType {
  currentStep: OnboardingStep;
  stepIndex: number;
  profile: Partial<OnboardingProfile>;
  updateProfile: (updates: Partial<OnboardingProfile>) => void;
  setStep: (step: OnboardingStep) => void;
  getProgressForStep: (step: OnboardingStep) => number;
  saveProfileToServer: (userId: string) => Promise<void>;
}

const defaultProfile: Partial<OnboardingProfile> = {
  heightUnit: "cm",
  weightUnit: "lbs",
  sex: "male",
  goal: "recomp",
  experienceLevel: "intermediate",
  medications: [],
  medicationsWithDosage: [],
  allergies: [],
  healthConditions: [],
  bloodPressureMedication: false,
  hasDoctor: false,
  isOnCycle: false,
  budgetTier: "moderate" as const,
  budgetAmount: 150,
  zipCode: "",
  trainingProgram: {
    type: "template",
    daysPerWeek: 4,
    schedule: [],
  },
  progressPhotos: {
    dateTaken: new Date().toISOString(),
  },
};

const STEPS: OnboardingStep[] = [
  "welcome",
  "basic-profile",
  "goals",
  "strength-goals",
  "health",
  "cycle-status",
  "progress-photos",
  "physique-analysis",
  "macro-calculation",
  "training-program",
  "complete",
];

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined,
);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [profile, setProfile] =
    useState<Partial<OnboardingProfile>>(defaultProfile);

  const currentStep = STEPS[stepIndex];

  const updateProfile = useCallback((updates: Partial<OnboardingProfile>) => {
    setProfile((prev) => {
      const newProfile = { ...prev, ...updates };
      return newProfile;
    });
  }, []);

  const setStep = useCallback((step: OnboardingStep) => {
    const index = STEPS.indexOf(step);
    if (index !== -1) {
      setStepIndex(index);
    }
  }, []);

  const getProgressForStep = useCallback((step: OnboardingStep) => {
    const index = STEPS.indexOf(step);
    if (index === -1) return 0;
    return ((index + 1) / STEPS.length) * 100;
  }, []);

  const saveProfileToServer = useCallback(
    async (userId: string) => {
      try {
        console.log("=== SAVING PROFILE TO SERVER ===");
        console.log("UserId:", userId);
        console.log("Profile data:", JSON.stringify(profile, null, 2));

        const response = await fetch(
          new URL(`/api/auth/profile/${userId}`, getApiUrl()).toString(),
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "bypass-tunnel-reminder": "true"
            },
            body: JSON.stringify({
              name: profile.name,
              age: profile.age,
              height: profile.height,
              heightUnit: profile.heightUnit,
              weight: profile.weight,
              weightUnit: profile.weightUnit,
              sex: profile.sex,
              goal: profile.goal,
              experienceLevel: profile.experienceLevel,
              targetWeight: profile.targetWeight,
              targetTimeframe: profile.targetTimeframe,
              isOnCycle: profile.isOnCycle,
              cycleInfo: profile.cycleInfo,
              trainingProgram: profile.trainingProgram,
              strengthGoals: profile.strengthGoals,
              medications: profile.medications,
              medicationsWithDosage: profile.medicationsWithDosage,
              allergies: profile.allergies,
              healthConditions: profile.healthConditions,
              bloodPressureMedication: profile.bloodPressureMedication,
              hasDoctor: profile.hasDoctor,
              budgetTier: profile.budgetTier,
              budgetAmount: profile.budgetAmount,
              zipCode: profile.zipCode,
              locationCity: profile.locationCity,
              locationState: profile.locationState,
              locationCountry: profile.locationCountry,
              physiqueAnalysis: profile.physiqueAnalysis,
              compoundResearch: profile.compoundResearch,
              calculatedMacros: profile.calculatedMacros,
              onboardingComplete: true,
            }),
          },
        );

        if (response.ok) {
          console.log("Profile saved to server successfully");
        } else {
          console.error("Failed to save profile to server");
        }
      } catch (error) {
        console.error("Error saving profile to server:", error);
      }
    },
    [profile],
  );

  return (
    <OnboardingContext.Provider
      value={{
        currentStep,
        stepIndex,
        profile,
        updateProfile,
        setStep,
        getProgressForStep,
        saveProfileToServer,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }
  return context;
}
