import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
const AnimatedView = Animated.createAnimatedComponent(View);

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { PhysiqueVisualizer } from "@/components/PhysiqueVisualizer";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, Colors, BorderRadius } from "@/constants/theme";
import { useQuery } from "@tanstack/react-query";
import { getPhysiqueAnalysis } from "@/lib/storage";

export default function LooksmaxxScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<any>();

  const { data: analysis } = useQuery({
    queryKey: ["physiqueAnalysis"],
    queryFn: getPhysiqueAnalysis,
  });

  // Default data if no analysis exists
  const activeData = analysis || {
    bodyFat: 15,
    proportions: 1.61, // Golden Ratio approx
    muscleGroups: {
      chest: 'strength',
      abs: 'strength',
      legs: 'weakness',
      arms: 'neutral',
      back: 'strength',
      shoulders: 'strength'
    },
    lastScanDate: new Date().toISOString()
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      {/* Background Gradients for Atmosphere */}
      <LinearGradient
        colors={[Colors.dark.primary + "20", "transparent"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.4 }}
      />

      <View style={[styles.header, { marginTop: insets.top + Spacing.sm }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="chevron-left" size={28} color={theme.text} />
        </Pressable>
        <View style={styles.headerProgress}>
          <View style={[styles.progressSegment, { backgroundColor: theme.primary }]} />
          <View style={[styles.progressSegment, { backgroundColor: theme.primary }]} />
          <View style={[styles.progressSegment, { backgroundColor: theme.primary }]} />
          <View style={[styles.progressSegment, { backgroundColor: theme.textSecondary, opacity: 0.3 }]} />
        </View>
        <Pressable style={styles.menuButton}>
          <Feather name="more-horizontal" size={24} color={theme.text} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: Spacing.xl * 2 }}>
        <AnimatedView entering={FadeInDown.duration(600).springify()}>
          <View style={styles.visualizerContainer}>
            <PhysiqueVisualizer
              bodyFat={activeData.bodyFat}
              proportions={activeData.proportions}
              muscleGroups={activeData.muscleGroups}
            />
          </View>
        </AnimatedView>

        <View style={styles.infoSection}>
          <ThemedText type="h2" style={{ textAlign: 'center', marginBottom: Spacing.sm }}>
            AI Physique Analysis
          </ThemedText>
          <ThemedText type="body" style={{ textAlign: 'center', color: theme.textSecondary, paddingHorizontal: Spacing.xl }}>
            Your scan indicates excellent {activeData.muscleGroups.chest === 'strength' ? 'chest' : 'overall'} development. Focus on lower body hypertrophy to balance proportions.
          </ThemedText>
        </View>
      </ScrollView>

      <Animated.View
        entering={FadeInDown.delay(500).springify()}
        style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}
      >
        <Button
          style={[styles.continueButton, { marginBottom: 12 }]}
          textStyle={{ fontSize: 18, fontWeight: '700' }}
          onPress={() => navigation.navigate("WeeklyCheckIn")}
        >
          Update Physique
        </Button>
        <Button
          variant="secondary"
          onPress={() => navigation.navigate("MainTabs")}
        >
          Return to Dashboard
        </Button>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  backButton: {
    padding: 8,
  },
  menuButton: {
    padding: 8,
  },
  headerProgress: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
    marginHorizontal: Spacing.xl,
    height: 4,
  },
  progressSegment: {
    flex: 1,
    borderRadius: 2,
  },
  visualizerContainer: {
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  infoSection: {
    marginTop: -40, // Pull up to overlap slightly or close gap
    paddingHorizontal: Spacing.lg,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
    backgroundColor: 'transparent', // Or slight gradient overlay if needed
  },
  continueButton: {
    height: 56,
    borderRadius: BorderRadius.xl,
    shadowColor: Colors.dark.neonCyan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  }
});
