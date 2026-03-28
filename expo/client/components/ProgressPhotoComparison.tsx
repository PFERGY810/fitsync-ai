import React from "react";
import { View, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

interface ProgressPhotoComparisonProps {
  frontPhoto?: string;
  backPhoto?: string;
  date?: string;
}

export function ProgressPhotoComparison({
  frontPhoto,
  backPhoto,
  date,
}: ProgressPhotoComparisonProps) {
  const { theme } = useTheme();

  if (!frontPhoto && !backPhoto) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ThemedText type="h3" style={styles.title}>
        Your Progress Photos
      </ThemedText>
      {date && (
        <ThemedText type="small" style={[styles.date, { color: theme.textSecondary }]}>
          {date}
        </ThemedText>
      )}
      <View style={styles.photosRow}>
        {frontPhoto && (
          <Card elevation={2} style={styles.photoCard}>
            <Image source={{ uri: frontPhoto }} style={styles.photo} contentFit="cover" />
            <ThemedText type="small" style={styles.photoLabel}>
              Front
            </ThemedText>
          </Card>
        )}
        {backPhoto && (
          <Card elevation={2} style={styles.photoCard}>
            <Image source={{ uri: backPhoto }} style={styles.photo} contentFit="cover" />
            <ThemedText type="small" style={styles.photoLabel}>
              Back
            </ThemedText>
          </Card>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xl,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  date: {
    marginBottom: Spacing.md,
  },
  photosRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  photoCard: {
    flex: 1,
    overflow: "hidden",
    padding: 0,
  },
  photo: {
    width: "100%",
    aspectRatio: 0.75,
    borderRadius: BorderRadius.md,
  },
  photoLabel: {
    padding: Spacing.sm,
    textAlign: "center",
    fontWeight: "600",
    textTransform: "uppercase",
  },
});
