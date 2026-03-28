import React, { memo } from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

export interface MacroRingProps {
  label: string;
  current: number;
  target: number;
  color: string;
  size?: number;
  showPercentage?: boolean;
  unit?: string;
}

export const MacroRing = memo(function MacroRing({
  label,
  current,
  target,
  color,
  size = 80,
  showPercentage = false,
  unit = "g",
}: MacroRingProps) {
  const { theme } = useTheme();
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const rawProgress = target > 0 ? current / target : 0;
  const progress = Math.min(rawProgress, 1);
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View style={styles.container}>
      <View style={[styles.ringContainer, { width: size, height: size }]}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={theme.backgroundSecondary}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>
        <View style={styles.textContainer}>
          <ThemedText style={[styles.valueText, { color }]}>
            {showPercentage
              ? `${Math.round(rawProgress * 100)}%`
              : `${current}${unit}`}
          </ThemedText>
        </View>
      </View>
      <ThemedText type="small" style={styles.labelText}>
        {label}
      </ThemedText>
      {!showPercentage && (
        <ThemedText
          type="small"
          style={[styles.targetText, { color: theme.textSecondary }]}
        >
          / {target}
          {unit}
        </ThemedText>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  ringContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  valueText: {
    fontSize: 14,
    fontWeight: "600",
  },
  labelText: {
    marginTop: Spacing.xs,
    fontWeight: "600",
  },
  targetText: {
    marginTop: 2,
  },
});
