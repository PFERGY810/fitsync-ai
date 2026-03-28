import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from "react-native-reanimated";
const AnimatedView = Animated.createAnimatedComponent(View);

import { ThemedText } from "./ThemedText";
import { Colors, Spacing } from "@/constants/theme";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  glowColor?: string;
}

export function ProgressIndicator({
  currentStep,
  totalSteps,
  glowColor = Colors.dark.neonCyan,
}: ProgressIndicatorProps) {
  const pulse = useSharedValue(1);

  React.useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: pulse.value * 0.8 + 0.2,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.segments}>
        {Array.from({ length: totalSteps }).map((_, index) => {
          const isActive = index < currentStep;
          const isCurrent = index === currentStep - 1;

          return (
            <View key={index} style={styles.segmentContainer}>
              <View
                style={[
                  styles.segment,
                  {
                    backgroundColor: isActive
                      ? glowColor
                      : "rgba(255, 255, 255, 0.1)",
                  },
                ]}
              >
                {isCurrent && (
                  <AnimatedView
                    style={[
                      styles.glowPulse,
                      {
                        backgroundColor: glowColor,
                      },
                      animatedStyle,
                    ]}
                  />
                )}
              </View>
            </View>
          );
        })}
      </View>
      <ThemedText type="small" style={styles.stepText}>
        Step {currentStep} of {totalSteps}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: Spacing.md,
  },
  segments: {
    flexDirection: "row",
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  segmentContainer: {
    position: "relative",
  },
  segment: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  glowPulse: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 2,
  },
  stepText: {
    color: Colors.dark.textSecondary,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
