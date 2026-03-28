import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { ThemedText } from "./ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing } from "@/constants/theme";

interface LoadingStateProps {
  message?: string;
  size?: "small" | "large";
  fullScreen?: boolean;
}

export function LoadingState({
  message = "Loading...",
  size = "large",
  fullScreen = false,
}: LoadingStateProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        fullScreen && styles.fullScreen,
        { backgroundColor: theme.backgroundRoot },
      ]}
    >
      <ActivityIndicator size={size} color={Colors.dark.primary} />
      {message && (
        <ThemedText type="body" style={styles.message}>
          {message}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
  },
  fullScreen: {
    flex: 1,
  },
  message: {
    marginTop: Spacing.md,
    textAlign: "center",
  },
});

export default LoadingState;
