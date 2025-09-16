import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments, useNavigationContainerRef } from 'expo-router';
import { useUserStore } from '@/stores/user-store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { trpc, trpcClient } from '@/lib/trpc';

const queryClient = new QueryClient();

function RootLayoutNav() {
  const segments = useSegments();
  const router = useRouter();
  const navigationRef = useNavigationContainerRef();
  const { isOnboardingCompleted } = useUserStore();
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  
  useEffect(() => {
    // Wait for navigation to be ready
    let timeoutId: NodeJS.Timeout;
    
    const checkNavigation = () => {
      if (navigationRef?.isReady()) {
        setIsNavigationReady(true);
      } else {
        timeoutId = setTimeout(checkNavigation, 50);
      }
    };
    
    checkNavigation();
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [navigationRef]);
  
  useEffect(() => {
    // Only navigate after navigation is ready and segments are available
    if (!isNavigationReady || !navigationRef?.isReady()) return;
    
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
  }, [segments, isOnboardingCompleted, router, isNavigationReady, navigationRef]);
  
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