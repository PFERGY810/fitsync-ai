import React from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing } from "@/constants/theme";

interface CoachNotesCardProps {
  notes: string[];
  onPress?: () => void;
}

export function CoachNotesCard({ notes, onPress }: CoachNotesCardProps) {
  const { theme } = useTheme();

  return (
    <Card elevation={2} onPress={onPress} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Feather name="cpu" size={18} color={Colors.dark.primary} />
        </View>
        <ThemedText type="h4" style={styles.title}>
          Coach Notes
        </ThemedText>
      </View>
      {notes.length > 0 ? (
        notes.slice(0, 3).map((note, index) => (
          <View key={index} style={styles.noteItem}>
            <View
              style={[styles.bullet, { backgroundColor: Colors.dark.primary }]}
            />
            <ThemedText type="small" style={styles.noteText}>
              {note}
            </ThemedText>
          </View>
        ))
      ) : (
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          Complete your daily check-in to receive personalized recommendations.
        </ThemedText>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 69, 0, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.sm,
  },
  title: {
    flex: 1,
  },
  noteItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: Spacing.sm,
    marginTop: 7,
  },
  noteText: {
    flex: 1,
    lineHeight: 20,
  },
});
