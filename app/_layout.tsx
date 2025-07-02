import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useRouter, useSegments } from 'expo-router';
import { useUserStore } from '@/stores/user-store';

export default function RootLayout() {
  const segments = useSegments();
  const router = useRouter();
  const { isOnboardingCompleted } = useUserStore();
  
  useEffect(() => {
    // Check if the user has completed onboarding
    const inAuthGroup = segments[0] === '(tabs)';
    const inOnboarding = segments[0] === 'onboarding';
    const inPhysiqueSetup = segments[0] === 'physique-setup';
    const inPhysiqueResults = segments[0] === 'physique-results';
    
    // If onboarding is not completed and user is not in onboarding, redirect to onboarding
    if (!isOnboardingCompleted() && !inOnboarding && !inPhysiqueSetup && !inPhysiqueResults) {
      router.replace('/onboarding');
    }
    
    // If onboarding is completed and user is in onboarding, redirect to home
    if (isOnboardingCompleted() && inOnboarding) {
      router.replace('/');
    }
  }, [segments, isOnboardingCompleted]);
  
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#121212',
        },
        headerTintColor: '#fff',
        contentStyle: {
          backgroundColor: '#121212',
        },
      }}
    />
  );
}