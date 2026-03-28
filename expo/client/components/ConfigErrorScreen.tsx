import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

interface ConfigErrorScreenProps {
  missingVars: string[];
  onDismiss?: () => void;
}

export function ConfigErrorScreen({
  missingVars,
  onDismiss,
}: ConfigErrorScreenProps) {
  const { theme } = useTheme();

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconContainer}>
          <Feather
            name="alert-triangle"
            size={64}
            color={Colors.dark.warning}
          />
        </View>

        <ThemedText type="h1" style={styles.title}>
          Configuration Required
        </ThemedText>

        <ThemedText
          type="body"
          style={[styles.message, { color: theme.textSecondary }]}
        >
          The app needs some environment variables to function properly.
        </ThemedText>

        <Card elevation={2} style={styles.errorCard}>
          <ThemedText type="h4" style={styles.errorTitle}>
            Missing Environment Variables:
          </ThemedText>
          {missingVars.map((varName) => (
            <View key={varName} style={styles.varRow}>
              <Feather name="x-circle" size={16} color={Colors.dark.error} />
              <ThemedText type="body" style={styles.varName}>
                {varName}
              </ThemedText>
            </View>
          ))}
        </Card>

        <Card elevation={2} style={styles.instructionsCard}>
          <ThemedText type="h4" style={styles.instructionsTitle}>
            Setup Instructions:
          </ThemedText>
          <ThemedText
            type="small"
            style={[styles.instruction, { color: theme.textSecondary }]}
          >
            1. Create a .env file in the project root
          </ThemedText>
          <ThemedText
            type="small"
            style={[styles.instruction, { color: theme.textSecondary }]}
          >
            2. Add: EXPO_PUBLIC_DOMAIN=your-domain.com
          </ThemedText>
          <ThemedText
            type="small"
            style={[styles.instruction, { color: theme.textSecondary }]}
          >
            3. Restart the Expo dev server
          </ThemedText>
        </Card>

        {__DEV__ && (
          <Card elevation={1} style={styles.devCard}>
            <ThemedText
              type="small"
              style={[styles.devText, { color: theme.textSecondary }]}
            >
              Development Mode: Using localhost fallback. Some features may not
              work without proper configuration.
            </ThemedText>
          </Card>
        )}

        {onDismiss && (
          <Button onPress={onDismiss} style={styles.dismissButton}>
            Continue Anyway (Dev Mode)
          </Button>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    marginBottom: Spacing.xl,
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  message: {
    textAlign: "center",
    marginBottom: Spacing.xl,
    lineHeight: 24,
  },
  errorCard: {
    width: "100%",
    marginBottom: Spacing.lg,
  },
  errorTitle: {
    marginBottom: Spacing.md,
    color: Colors.dark.error,
  },
  varRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  varName: {
    fontFamily: "monospace",
    color: Colors.dark.error,
  },
  instructionsCard: {
    width: "100%",
    marginBottom: Spacing.lg,
  },
  instructionsTitle: {
    marginBottom: Spacing.md,
  },
  instruction: {
    marginTop: Spacing.xs,
    lineHeight: 20,
  },
  devCard: {
    width: "100%",
    marginBottom: Spacing.lg,
    backgroundColor: Colors.dark.warning + "20",
  },
  devText: {
    lineHeight: 20,
  },
  dismissButton: {
    width: "100%",
    marginTop: Spacing.md,
  },
});
