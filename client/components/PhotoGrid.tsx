import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { PhotoUploadSection } from "./PhotoUploadSection";
import { Card } from "./Card";
import { ThemedText } from "./ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";

interface PhotoGridProps {
  photos: Record<string, string[]>;
  onAddPhoto: (type: string, uri: string) => void;
  onRemovePhoto: (type: string, index: number) => void;
}

const PHOTO_TYPES = [
  {
    id: "front",
    label: "Front View",
    description: "Arms relaxed at sides",
    icon: "user",
  },
  {
    id: "side",
    label: "Side View",
    description: "Profile facing right",
    icon: "arrow-right",
  },
  {
    id: "back",
    label: "Back View",
    description: "Arms relaxed, back visible",
    icon: "arrow-up",
  },
  {
    id: "legs",
    label: "Legs View",
    description: "Front pose showing quads",
    icon: "trending-up",
  },
] as const;

export function PhotoGrid({ photos, onAddPhoto, onRemovePhoto }: PhotoGridProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Card elevation={2} style={styles.tipCard}>
        <View style={styles.tipHeader}>
          <Feather name="camera" size={20} color={Colors.dark.primary} />
          <ThemedText type="body" style={styles.tipTitle}>
            Photo Tips
          </ThemedText>
        </View>
        <ThemedText type="small" style={[styles.tipText, { color: theme.textSecondary }]}>
          {"\u2022"} Use consistent lighting{"\n"}
          {"\u2022"} Same location for future comparisons{"\n"}
          {"\u2022"} Relaxed pose, natural posture{"\n"}
          {"\u2022"} Morning photos (fasted) are most consistent
        </ThemedText>
      </Card>

      {PHOTO_TYPES.map((type) => (
        <PhotoUploadSection
          key={type.id}
          type={type.id as any}
          label={type.label}
          description={type.description}
          icon={type.icon}
          photos={photos[type.id] || []}
          maxPhotos={3}
          onAddPhoto={onAddPhoto}
          onRemovePhoto={onRemovePhoto}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.lg,
  },
  tipCard: {
    marginBottom: Spacing.md,
  },
  tipHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  tipTitle: {
    fontWeight: "600",
  },
  tipText: {
    lineHeight: 20,
  },
});
