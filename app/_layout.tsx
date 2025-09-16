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
  const [hasNavigated, setHasNavigated] = useState(false);
  
  useEffect(() => {
    // Wait for the navigation to be ready
    const timer = setTimeout(() => {
      setIsNavigationReady(true);
    }, 200);
    
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    if (!isNavigationReady || hasNavigated) {
      return;
    }
    
    const handleNavigation = () => {
      try {
        // Get current route info
        const currentSegment = segments?.[0];
        const onboardingCompleted = isOnboardingCompleted();
        
        // Define onboarding-related routes
        const onboardingRoutes = ['onboarding', 'physique-setup', 'physique-results'];
        const isInOnboardingFlow = currentSegment && onboardingRoutes.includes(currentSegment);
        
        console.log('Navigation check:', {
          currentSegment,
          onboardingCompleted,
          isInOnboardingFlow,
          segments
        });
        
        // If onboarding is not completed and user is not in onboarding flows
        if (!onboardingCompleted && !isInOnboardingFlow) {
          console.log('Redirecting to onboarding - not completed');
          setHasNavigated(true);
          router.replace('/onboarding');
          return;
        }
        
        // If onboarding is completed and user is in onboarding flow
        if (onboardingCompleted && isInOnboardingFlow) {
          console.log('Redirecting to tabs - onboarding completed');
          setHasNavigated(true);
          router.replace('/(tabs)');
          return;
        }
        
        // If no segments (root), redirect based on onboarding status
        if (!currentSegment || currentSegment === '') {
          if (onboardingCompleted) {
            console.log('Redirecting to tabs from root');
            setHasNavigated(true);
            router.replace('/(tabs)');
          } else {
            console.log('Redirecting to onboarding from root');
            setHasNavigated(true);
            router.replace('/onboarding');
          }
        }
      } catch (error) {
        console.error('Navigation error:', error);
      }
    };
    
    // Use a delay to ensure the router is fully ready
    const navigationTimer = setTimeout(handleNavigation, 100);
    return () => clearTimeout(navigationTimer);
  }, [segments, isOnboardingCompleted, router, isNavigationReady, hasNavigated]);
  
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