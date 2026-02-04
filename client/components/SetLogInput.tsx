import React, { useState } from "react";
import { View, StyleSheet, TextInput, Pressable } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import * as Haptics from "expo-haptics";

interface SetLogInputProps {
  setNumber: number;
  onComplete: (weight: number, reps: number, rir: number) => void;
  completed?: boolean;
  initialWeight?: number;
  initialReps?: number;
  initialRir?: number;
}

export function SetLogInput({
  setNumber,
  onComplete,
  completed = false,
  initialWeight = 0,
  initialReps = 0,
  initialRir = 2,
}: SetLogInputProps) {
  const { theme } = useTheme();
  const [weight, setWeight] = useState(initialWeight.toString());
  const [reps, setReps] = useState(initialReps.toString());
  const [rir, setRir] = useState(initialRir);

  const handleComplete = () => {
    const w = parseFloat(weight) || 0;
    const r = parseInt(reps) || 0;
    if (w > 0 && r > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onComplete(w, r, rir);
    }
  };

  const rirOptions = [0, 1, 2, 3, 4];

  return (
    <View style={[styles.container, completed && styles.completed]}>
      <View style={styles.setNumber}>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          Set {setNumber}
        </ThemedText>
      </View>
      <View style={styles.inputRow}>
        <View style={styles.inputGroup}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Weight
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: theme.backgroundSecondary, color: theme.text },
            ]}
            value={weight}
            onChangeText={setWeight}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor={theme.textSecondary}
            editable={!completed}
          />
        </View>
        <View style={styles.inputGroup}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Reps
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: theme.backgroundSecondary, color: theme.text },
            ]}
            value={reps}
            onChangeText={setReps}
            keyboardType="number-pad"
            placeholder="0"
            placeholderTextColor={theme.textSecondary}
            editable={!completed}
          />
        </View>
        <View style={styles.rirGroup}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            RIR
          </ThemedText>
          <View style={styles.rirButtons}>
            {rirOptions.map((option) => (
              <Pressable
                key={option}
                onPress={() => !completed && setRir(option)}
                style={[
                  styles.rirButton,
                  { backgroundColor: theme.backgroundSecondary },
                  rir === option && { backgroundColor: Colors.dark.primary },
                ]}
              >
                <ThemedText
                  type="small"
                  style={[
                    { fontWeight: "600" },
                    rir === option && { color: "#FFFFFF" },
                  ]}
                >
                  {option}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
      {!completed ? (
        <Pressable
          onPress={handleComplete}
          style={({ pressed }) => [
            styles.completeButton,
            { backgroundColor: Colors.dark.success },
            pressed && { opacity: 0.8 },
          ]}
        >
          <ThemedText
            type="small"
            style={{ color: "#FFFFFF", fontWeight: "600" }}
          >
            Log Set
          </ThemedText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  completed: {
    opacity: 0.5,
  },
  setNumber: {
    marginBottom: Spacing.sm,
  },
  inputRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  inputGroup: {
    flex: 1,
  },
  input: {
    height: 44,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.xs,
    fontSize: 16,
    fontWeight: "600",
  },
  rirGroup: {
    flex: 1.5,
  },
  rirButtons: {
    flexDirection: "row",
    gap: 4,
    marginTop: Spacing.xs,
  },
  rirButton: {
    flex: 1,
    height: 44,
    borderRadius: BorderRadius.xs,
    justifyContent: "center",
    alignItems: "center",
  },
  completeButton: {
    marginTop: Spacing.md,
    height: 40,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
  },
});
