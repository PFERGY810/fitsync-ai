import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserProfile {
  name: string;
  age: number;
  gender: 'male' | 'female';
  height: number; // in cm
  weight: number; // in kg
  experience: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
  injuries: string[];
  zipCode?: string;
  weeklyBudget?: number;
  onboardingCompleted: boolean;
}

interface UserState {
  userProfile: UserProfile | null;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  clearUserProfile: () => void;
  isOnboardingCompleted: () => boolean;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      userProfile: null,
      
      updateUserProfile: (profile) => {
        const currentProfile = get().userProfile;
        set({ 
          userProfile: { 
            ...currentProfile as UserProfile, 
            ...profile 
          } 
        });
      },
      
      clearUserProfile: () => {
        set({ userProfile: null });
      },
      
      isOnboardingCompleted: () => {
        const { userProfile } = get();
        return !!userProfile?.onboardingCompleted;
      }
    }),
    {
      name: 'user-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);