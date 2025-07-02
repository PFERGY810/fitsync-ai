import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, Animated } from 'react-native';
import { Redirect } from 'expo-router';
import { useUserStore } from '@/stores/user-store';
import { LinearGradient } from 'expo-linear-gradient';

export default function Index() {
  const { isOnboardingCompleted } = useUserStore();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.9)).current;
  
  useEffect(() => {
    // Splash screen animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ]).start();
    
    // Redirect after animation
    const timer = setTimeout(() => {
      // No explicit redirect here, we'll use the conditional below
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // If onboarding is completed, redirect to tabs
  if (isOnboardingCompleted()) {
    return <Redirect href="/(tabs)" />;
  }
  
  // Otherwise, show splash screen and then redirect to onboarding
  return (
    <LinearGradient
      colors={['#0A0A0A', '#111827']}
      style={styles.container}
    >
      <Animated.View 
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <View style={styles.logoIconContainer}>
          <Text style={styles.logoIcon}>🔥</Text>
        </View>
        <Text style={styles.logoText}>FitSync AI</Text>
        <Text style={styles.tagline}>AI-powered fitness coaching</Text>
      </Animated.View>
      
      <Redirect href="/onboarding" />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#1E1B4B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoIcon: {
    fontSize: 40,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#9CA3AF',
  },
});