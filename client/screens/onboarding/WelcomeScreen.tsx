import React, { useEffect } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withSequence,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { GlowingPanel } from "@/components/GlowingPanel";
import { Spacing, BorderRadius } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SPRING_CONFIG = {
  damping: 12,
  mass: 0.8,
  stiffness: 100,
};

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { theme } = useTheme();

  const logoScale = useSharedValue(0);
  const logoRotate = useSharedValue(-15);
  const titleOpacity = useSharedValue(0);
  const titleY = useSharedValue(30);
  const subtitleOpacity = useSharedValue(0);
  const feature1 = useSharedValue(0);
  const feature2 = useSharedValue(0);
  const feature3 = useSharedValue(0);
  const feature4 = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);
  const buttonY = useSharedValue(40);
  const pulseScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.3);

  useEffect(() => {
    logoScale.value = withSpring(1, SPRING_CONFIG);
    logoRotate.value = withSpring(0, { damping: 8, mass: 0.6, stiffness: 80 });

    titleOpacity.value = withDelay(200, withTiming(1, { duration: 400 }));
    titleY.value = withDelay(200, withSpring(0, SPRING_CONFIG));

    subtitleOpacity.value = withDelay(400, withTiming(1, { duration: 400 }));

    feature1.value = withDelay(500, withSpring(1, SPRING_CONFIG));
    feature2.value = withDelay(600, withSpring(1, SPRING_CONFIG));
    feature3.value = withDelay(700, withSpring(1, SPRING_CONFIG));
    feature4.value = withDelay(800, withSpring(1, SPRING_CONFIG));

    buttonOpacity.value = withDelay(900, withTiming(1, { duration: 300 }));
    buttonY.value = withDelay(900, withSpring(0, SPRING_CONFIG));

    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );

    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: logoScale.value },
      { rotate: `${logoRotate.value}deg` },
    ],
  }));

  const logoContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }));

  const subtitleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ translateY: buttonY.value }],
  }));

  const feature1Style = useAnimatedStyle(() => ({
    opacity: feature1.value,
    transform: [
      { translateX: interpolate(feature1.value, [0, 1], [-30, 0]) },
      { scale: feature1.value },
    ],
  }));

  const feature2Style = useAnimatedStyle(() => ({
    opacity: feature2.value,
    transform: [
      { translateX: interpolate(feature2.value, [0, 1], [-30, 0]) },
      { scale: feature2.value },
    ],
  }));

  const feature3Style = useAnimatedStyle(() => ({
    opacity: feature3.value,
    transform: [
      { translateX: interpolate(feature3.value, [0, 1], [-30, 0]) },
      { scale: feature3.value },
    ],
  }));

  const feature4Style = useAnimatedStyle(() => ({
    opacity: feature4.value,
    transform: [
      { translateX: interpolate(feature4.value, [0, 1], [-30, 0]) },
      { scale: feature4.value },
    ],
  }));

  const handleGetStarted = () => {
    navigation.navigate("BasicProfile");
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          backgroundColor: theme.backgroundRoot,
        },
      ]}
    >
      <LinearGradient
        colors={[
          theme.primary + "12",
          theme.backgroundSecondary,
          "transparent",
        ]}
        style={styles.gradient}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <View style={styles.content}>
        <AnimatedView style={[styles.logoContainer, logoContainerStyle]}>
          <AnimatedView style={[styles.glow, glowStyle]} />
          <AnimatedView style={[styles.logoWrapper, logoAnimatedStyle]}>
            <LinearGradient
              colors={[theme.primary, theme.info]}
              style={styles.logoGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Image
                source={require("../../../attached_assets/generated_images/fitsync_ai_app_icon.png")}
                style={styles.logoImage}
                contentFit="contain"
              />
            </LinearGradient>
          </AnimatedView>
        </AnimatedView>

        <AnimatedView style={titleAnimatedStyle}>
          <ThemedText type="h1" style={styles.title}>
            FitSync AI
          </ThemedText>
        </AnimatedView>

        <AnimatedView style={subtitleAnimatedStyle}>
          <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
            Your AI-Powered Hypertrophy Coach
          </ThemedText>
        </AnimatedView>

        <View style={styles.features}>
          <AnimatedView style={feature1Style}>
            <FeatureItem
              icon="target"
              title="Personalized Programs"
              description="Training tailored to your goals and experience"
            />
          </AnimatedView>
          <AnimatedView style={feature2Style}>
            <FeatureItem
              icon="zap"
              title="Smart Recovery"
              description="Daily check-ins that adapt your intensity"
            />
          </AnimatedView>
          <AnimatedView style={feature3Style}>
            <FeatureItem
              icon="pie-chart"
              title="Nutrition Optimization"
              description="Macros calculated for your specific needs"
            />
          </AnimatedView>
          <AnimatedView style={feature4Style}>
            <FeatureItem
              icon="trending-up"
              title="Progress Analysis"
              description="Visual tracking with AI-powered insights"
            />
          </AnimatedView>
        </View>
      </View>

      <AnimatedView style={[styles.footer, buttonAnimatedStyle]}>
        <ThemedText type="small" style={[styles.disclaimer, { color: theme.textSecondary }]}>
          This app provides AI-generated fitness guidance. Consult a healthcare
          provider before starting any new program.
        </ThemedText>

        <Button
          onPress={handleGetStarted}
          style={styles.button}
          testID="button-get-started"
        >
          Get Started
        </Button>
      </AnimatedView>
    </View>
  );
}

function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  const { theme } = useTheme();
  return (
    <GlowingPanel glowColor={theme.primary} style={styles.featurePanel}>
      <View style={styles.featureItem}>
        <View
          style={[
            styles.featureIcon,
            { backgroundColor: theme.backgroundSecondary },
          ]}
        >
          <Feather name={icon as any} size={18} color={theme.primary} />
        </View>
        <View style={styles.featureText}>
          <ThemedText type="body" style={styles.featureTitle}>
            {title}
          </ThemedText>
          <ThemedText type="small" style={[styles.featureDesc, { color: theme.textSecondary }]}>
            {description}
          </ThemedText>
        </View>
      </View>
    </GlowingPanel>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 400,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    marginBottom: Spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  glow: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(0, 215, 199, 0.15)",
  },
  logoWrapper: {
    shadowColor: "#00D7C7",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 32,
    elevation: 16,
  },
  logoGradient: {
    width: 100,
    height: 100,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  logoImage: {
    width: 64,
    height: 64,
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
    letterSpacing: -1,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: Spacing["3xl"],
  },
  features: {
    width: "100%",
    gap: Spacing.lg,
  },
  featurePanel: {
    marginBottom: Spacing.sm,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 0,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontWeight: "600",
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 13,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  disclaimer: {
    textAlign: "center",
    marginBottom: Spacing.lg,
    lineHeight: 18,
    opacity: 0.7,
  },
  button: {
    width: "100%",
  },
});
