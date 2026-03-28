import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "./ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

interface ErrorStateProps {
  title?: string;
  message?: string;
  icon?: keyof typeof Feather.glyphMap;
  onRetry?: () => void;
  retryText?: string;
  fullScreen?: boolean;
}

export function ErrorState({
  title = "Something went wrong",
  message = "An error occurred. Please try again.",
  icon = "alert-circle",
  onRetry,
  retryText = "Try Again",
  fullScreen = false,
}: ErrorStateProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        fullScreen && styles.fullScreen,
        { backgroundColor: theme.backgroundRoot },
      ]}
    >
      <View style={styles.iconContainer}>
        <Feather name={icon} size={48} color={Colors.dark.error} />
      </View>
      <ThemedText type="h3" style={styles.title}>
        {title}
      </ThemedText>
      <ThemedText type="body" style={[styles.message, { color: theme.textSecondary }]}>
        {message}
      </ThemedText>
      {onRetry && (
        <Pressable
          style={[styles.retryButton, { backgroundColor: Colors.dark.primary }]}
          onPress={onRetry}
        >
          <Feather name="refresh-cw" size={16} color="#FFFFFF" />
          <ThemedText type="body" style={styles.retryText}>
            {retryText}
          </ThemedText>
        </Pressable>
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
  iconContainer: {
    marginBottom: Spacing.md,
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  message: {
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  retryText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});

export default ErrorState;
