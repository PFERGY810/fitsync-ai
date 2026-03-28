import React, { useState, useEffect } from "react";
import { StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";

import RootStackNavigator from "@/navigation/RootStackNavigator";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ConfigErrorScreen } from "@/components/ConfigErrorScreen";
import { AuthProvider } from "@/context/AuthContext";
import { useOfflineSync } from "@/hooks/useOfflineSync";

// Global Fetch Interceptor for Tunnel Bypass
// This ensures that ALL fetch requests (including direct usage in screens)
// send the bypass-tunnel-reminder header if they are hitting the tunnel.
const originalFetch = global.fetch;
global.fetch = async (input, init) => {
  const urlString = input.toString();
  // Check if we are hitting our tunnel (or any loca.lt URL)
  if (urlString.includes("loca.lt")) {
    console.log(`[Fetch Interceptor] Adding bypass header to: ${urlString}`);
    const newInit = init || {};
    const headers = new Headers(newInit.headers);
    headers.set("bypass-tunnel-reminder", "true");

    return originalFetch(input, {
      ...newInit,
      headers,
    });
  }
  return originalFetch(input, init);
};

function validateConfig(): string[] {
  const missing: string[] = [];
  if (!process.env.EXPO_PUBLIC_DOMAIN && !__DEV__) {
    missing.push("EXPO_PUBLIC_DOMAIN");
  }
  return missing;
}

export default function App() {
  useOfflineSync();
  const [configErrors, setConfigErrors] = useState<string[]>([]);
  const [showConfigError, setShowConfigError] = useState(false);

  useEffect(() => {
    const errors = validateConfig();
    setConfigErrors(errors);
    setShowConfigError(errors.length > 0 && !__DEV__);
  }, []);

  if (showConfigError) {
    return <ConfigErrorScreen missingVars={configErrors} />;
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <SafeAreaProvider>
            <GestureHandlerRootView style={styles.root}>
              <KeyboardProvider>
                <NavigationContainer>
                  <RootStackNavigator />
                </NavigationContainer>
                <StatusBar style="dark" />
              </KeyboardProvider>
            </GestureHandlerRootView>
          </SafeAreaProvider>
        </QueryClientProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F5F7FB",
  },
});
