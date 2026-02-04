import React, { ReactNode } from "react";
import { StyleSheet, Pressable, ViewStyle, StyleProp, TextStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing } from "@/constants/theme";

interface ButtonProps {
  onPress?: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  testID?: string;
  variant?: "primary" | "secondary" | "ghost";
  textStyle?: StyleProp<TextStyle>;
}

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
  energyThreshold: 0.001,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  onPress,
  children,
  style,
  disabled = false,
  testID,
  variant = "primary",
  textStyle,
}: ButtonProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withSpring(0.98, springConfig);
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      scale.value = withSpring(1, springConfig);
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "secondary":
        return {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          borderWidth: 1,
          textColor: theme.text,
        };
      case "ghost":
        return {
          backgroundColor: "transparent",
          borderColor: "transparent",
          borderWidth: 0,
          textColor: theme.link,
        };
      case "primary":
      default:
        return {
          backgroundColor: theme.primary,
          borderColor: theme.primary,
          borderWidth: 0,
          textColor: theme.buttonText,
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <AnimatedPressable
      onPress={disabled ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={[
        styles.button,
        {
          backgroundColor: variantStyles.backgroundColor,
          borderColor: variantStyles.borderColor,
          borderWidth: variantStyles.borderWidth,
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? "not-allowed" : "pointer",
          shadowColor: theme.cardShadow,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.2,
          shadowRadius: 12,
          elevation: 6,
        },
        style,
        animatedStyle,
      ]}
    >
      <ThemedText
        type="body"
        style={[
          styles.buttonText,
          {
            color: variantStyles.textColor,
          },
          textStyle,
        ]}
      >
        {children}
      </ThemedText>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontWeight: "600",
  },
});
