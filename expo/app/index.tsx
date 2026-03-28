import React from 'react';
import { Redirect } from 'expo-router';
import { useUserStore } from '@/stores/user-store';

export default function Index() {
  const { isOnboardingCompleted } = useUserStore();
  
  // Check onboarding status and redirect accordingly
  if (isOnboardingCompleted()) {
    return <Redirect href="/(tabs)" />;
  } else {
    return <Redirect href="/onboarding" />;
  }
}