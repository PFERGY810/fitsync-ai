import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { BorderRadius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";

interface GlowingPanelProps {
  children: React.ReactNode;
  glowColor?: string;
  borderColor?: string;
  backgroundColor?: string;
  style?: ViewStyle;
  elevation?: number;
}

export function GlowingPanel({
  children,
  glowColor,
  borderColor,
  backgroundColor,
  style,
  elevation = 2,
}: GlowingPanelProps) {
  const { theme } = useTheme();
  const resolvedGlow = glowColor || theme.primary;
  const resolvedBorder = borderColor || theme.border;
  const resolvedBackground = backgroundColor || theme.surface;
  const glowAlpha = resolvedGlow.includes("rgba") ? resolvedGlow : `${resolvedGlow}1A`;

  return (
    <View
      style={[
        styles.container,
        {
          shadowColor: theme.cardShadow,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.15,
          shadowRadius: 16,
          elevation: elevation * 3,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.panel,
          {
            backgroundColor: resolvedBackground,
            borderColor: resolvedBorder,
          },
        ]}
      >
        {children}
      </View>
      {/* Outer glow effect */}
      <View
        style={[
          styles.glow,
          {
            backgroundColor: glowAlpha,
          },
        ]}
        pointerEvents="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  panel: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    position: "relative",
    zIndex: 1,
  },
  glow: {
    position: "absolute",
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: BorderRadius.md + 2,
    opacity: 0.5,
    zIndex: 0,
  },
});
