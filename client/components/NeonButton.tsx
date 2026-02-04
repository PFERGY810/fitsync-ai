import React from "react";
import { Pressable, StyleSheet, ViewStyle, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { ThemedText } from "./ThemedText";
import { BorderRadius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedView = Animated.createAnimatedComponent(View);

interface NeonButtonProps {
  title: string;
  onPress: () => void;
  glowColor?: string;
  backgroundColor?: string;
  textColor?: string;
  style?: ViewStyle;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "amber";
}

export function NeonButton({
  title,
  onPress,
  glowColor,
  backgroundColor,
  textColor,
  style,
  disabled = false,
  variant = "primary",
}: NeonButtonProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const glowIntensity = useSharedValue(0.12);

  const getVariantColors = () => {
    switch (variant) {
      case "amber":
        return {
          glow: theme.warning,
          bg: theme.warning,
          border: theme.warning,
          text: theme.buttonText,
        };
      case "secondary":
        return {
          glow: theme.link,
          bg: theme.surface,
          border: theme.border,
          text: theme.text,
        };
      default:
        return {
          glow: theme.primary,
          bg: theme.primary,
          border: theme.primary,
          text: theme.buttonText,
        };
    }
  };

  const colors = getVariantColors();
  const finalGlowColor = glowColor || colors.glow;
  const finalBgColor = backgroundColor || colors.bg;
  const borderColor = colors.border;
  const finalTextColor = textColor || colors.text;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowIntensity.value,
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.95, { duration: 100 });
    glowIntensity.value = withTiming(0.6, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 100 });
    glowIntensity.value = withTiming(0.3, { duration: 100 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[animatedStyle, style]}
    >
      <View
        style={[
          styles.button,
          {
            backgroundColor: finalBgColor,
            borderColor,
            shadowColor: finalGlowColor,
            opacity: disabled ? 0.6 : 1,
          },
        ]}
      >
        <AnimatedView
          style={[
            styles.glow,
            {
              backgroundColor: finalGlowColor,
            },
            glowStyle,
          ]}
          pointerEvents="none"
        />
        <ThemedText
          type="body"
          style={[
            styles.text,
            {
              color: finalTextColor,
            },
          ]}
        >
          {title}
        </ThemedText>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  glow: {
    position: "absolute",
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: BorderRadius.md,
  },
  text: {
    fontWeight: "700",
    fontSize: 16,
    position: "relative",
    zIndex: 1,
  },
});
