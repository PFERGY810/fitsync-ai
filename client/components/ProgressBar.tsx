import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
const AnimatedView = Animated.createAnimatedComponent(View);
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing } from "@/constants/theme";

interface ProgressBarProps {
  label: string;
  current: number;
  target: number;
  color: string;
  showValue?: boolean;
  unit?: string;
}

export function ProgressBar({
  label,
  current,
  target,
  color,
  showValue = true,
  unit = "g",
}: ProgressBarProps) {
  const { theme } = useTheme();
  const progress = Math.min(current / target, 1);

  const animatedStyle = useAnimatedStyle(() => ({
    width: withTiming(`${progress * 100}%`, { duration: 500 }),
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="small" style={{ fontWeight: "600" }}>
          {label}
        </ThemedText>
        {showValue ? (
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {current}
            {unit} / {target}
            {unit}
          </ThemedText>
        ) : null}
      </View>
      <View
        style={[styles.track, { backgroundColor: theme.backgroundSecondary }]}
      >
        <AnimatedView
          style={[styles.fill, { backgroundColor: color }, animatedStyle]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.xs,
  },
  track: {
    height: 8,
    borderRadius: BorderRadius.full,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: BorderRadius.full,
  },
});
