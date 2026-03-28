import React from "react";
import { View, StyleSheet } from "react-native";
import RNSlider from "@react-native-community/slider";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, Colors } from "@/constants/theme";

interface SliderProps {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  minimumValue: number;
  maximumValue: number;
  step?: number;
  showValue?: boolean;
  valueFormatter?: (value: number) => string;
}

export function Slider({
  label,
  value,
  onValueChange,
  minimumValue,
  maximumValue,
  step = 1,
  showValue = true,
  valueFormatter,
}: SliderProps) {
  const { theme } = useTheme();
  const displayValue = valueFormatter
    ? valueFormatter(value)
    : value.toString();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="body" style={{ fontWeight: "600" }}>
          {label}
        </ThemedText>
        {showValue ? (
          <ThemedText
            type="body"
            style={{ color: Colors.dark.primary, fontWeight: "600" }}
          >
            {displayValue}
          </ThemedText>
        ) : null}
      </View>
      <RNSlider
        style={styles.slider}
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        step={step}
        value={value}
        onValueChange={onValueChange}
        minimumTrackTintColor={Colors.dark.primary}
        maximumTrackTintColor={theme.backgroundSecondary}
        thumbTintColor={Colors.dark.primary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  slider: {
    width: "100%",
    height: 40,
  },
});
