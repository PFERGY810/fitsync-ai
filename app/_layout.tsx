import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useUserStore } from '@/stores/user-store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { trpc, trpcClient } from '@/lib/trpc';

const queryClient = new QueryClient();

function RootLayoutNav() {
  const segments = useSegments();
  const router = useRouter();
  const { isOnboardingCompleted } = useUserStore();
  
  useEffect(() => {
    // Use requestAnimationFrame to ensure navigation happens after layout is ready
    const handleNavigation = () => {
      requestAnimationFrame(() => {
        try {
          // Check if the user has completed onboarding
          const inOnboarding = segments[0] === 'onboarding';
          const inPhysiqueSetup = segments[0] === 'physique-setup';
          const inPhysiqueResults = segments[0] === 'physique-results';
          
          // If onboarding is not completed and user is not in onboarding flows, redirect to onboarding
          if (!isOnboardingCompleted() && !inOnboarding && !inPhysiqueSetup && !inPhysiqueResults) {
            console.log('Redirecting to onboarding - not completed');
            router.replace('/onboarding');
          }
          
          // If onboarding is completed and user is in onboarding, redirect to home
          if (isOnboardingCompleted() && inOnboarding) {
            console.log('Redirecting to tabs - onboarding completed');
            router.replace('/(tabs)');
          }
        } catch (error) {
          console.error('Navigation error:', error);
        }
      });
    };
    
    // Only run navigation logic if we have segments
    if (segments.length > 0) {
      handleNavigation();
    }
  }, [segments, isOnboardingCompleted, router]);
  
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