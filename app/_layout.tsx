import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useUserStore } from '@/stores/user-store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { trpc, trpcClient } from '@/lib/trpc';

const queryClient = new QueryClient();

function RootLayoutNav() {
  const segments = useSegments();
  const router = useRouter();
  const { isOnboardingCompleted } = useUserStore();
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  
  useEffect(() => {
    // Set navigation ready after a short delay to ensure the layout is mounted
    const timer = setTimeout(() => {
      setIsNavigationReady(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    // Only navigate after navigation is ready
    if (!isNavigationReady) return;
    
    // Add a small delay to ensure segments are populated
    const timer = setTimeout(() => {
      // Check if the user has completed onboarding
      const inOnboarding = segments[0] === 'onboarding';
      const inPhysiqueSetup = segments[0] === 'physique-setup';
      const inPhysiqueResults = segments[0] === 'physique-results';
      
      // If onboarding is not completed and user is not in onboarding flows, redirect to onboarding
      if (!isOnboardingCompleted() && !inOnboarding && !inPhysiqueSetup && !inPhysiqueResults) {
        router.replace('/onboarding');
      }
      
      // If onboarding is completed and user is in onboarding, redirect to home
      if (isOnboardingCompleted() && inOnboarding) {
        router.replace('/(tabs)');
      }
    }, 50);
    
    return () => clearTimeout(timer);
  }, [segments, isOnboardingCompleted, router, isNavigationReady]);
  
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