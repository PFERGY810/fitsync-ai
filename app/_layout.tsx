import { useEffect, useState, useCallback } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useUserStore } from '@/stores/user-store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { trpc, trpcClient } from '@/lib/trpc';

const queryClient = new QueryClient();

function RootLayoutNav() {
  const segments = useSegments();
  const router = useRouter();
  const userStore = useUserStore();
  const [isNavigating, setIsNavigating] = useState(false);
  
  const handleNavigation = useCallback(() => {
    if (isNavigating) return;
    
    const currentSegment = segments?.[0];
    const onboardingCompleted = userStore.isOnboardingCompleted();
    
    // Define onboarding-related routes
    const onboardingRoutes = ['onboarding', 'physique-setup', 'physique-results'];
    const isInOnboardingFlow = currentSegment && onboardingRoutes.includes(currentSegment);
    
    console.log('Navigation check:', {
      currentSegment,
      onboardingCompleted,
      isInOnboardingFlow,
      segments: segments?.slice(0, 2) // Limit logging
    });
    
    // Only redirect if we're at the root or in the wrong flow
    if (!currentSegment || currentSegment === '') {
      setIsNavigating(true);
      // At root, redirect based on onboarding status
      if (onboardingCompleted) {
        console.log('Redirecting to tabs from root');
        router.replace('/(tabs)');
      } else {
        console.log('Redirecting to onboarding from root');
        router.replace('/onboarding');
      }
    } else if (!onboardingCompleted && !isInOnboardingFlow && currentSegment === '(tabs)') {
      setIsNavigating(true);
      // User is in tabs but hasn't completed onboarding
      console.log('Redirecting to onboarding - not completed');
      router.replace('/onboarding');
    } else if (onboardingCompleted && isInOnboardingFlow) {
      setIsNavigating(true);
      // User completed onboarding but is still in onboarding flow
      console.log('Redirecting to tabs - onboarding completed');
      router.replace('/(tabs)');
    }
  }, [segments, userStore, router, isNavigating]);
  
  useEffect(() => {
    // Reset navigation flag when segments change
    setIsNavigating(false);
  }, [segments]);
  
  useEffect(() => {
    // Small delay to ensure router is ready
    const timer = setTimeout(handleNavigation, 100);
    return () => clearTimeout(timer);
  }, [handleNavigation]);
  
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
    >
      <Stack.Screen name="onboarding/index" options={{ headerShown: false }} />
      <Stack.Screen name="physique-setup/index" options={{ headerShown: false }} />
      <Stack.Screen name="physique-results/index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <RootLayoutNav />
      </QueryClientProvider>
    </trpc.Provider>
  );
}