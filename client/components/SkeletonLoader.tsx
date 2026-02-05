import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors, BorderRadius, Spacing } from "@/constants/theme";

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

// Individual skeleton element with shimmer effect
export function Skeleton({
  width = "100%",
  height = 20,
  borderRadius = BorderRadius.sm,
  style,
}: SkeletonProps) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [shimmerAnim]);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  return (
    <View
      style={[
        styles.skeleton,
        { width: width as any, height, borderRadius },
        style,
      ]}
    >
      <Animated.View
        style={[styles.shimmer, { transform: [{ translateX }] }]}
      >
        <LinearGradient
          colors={["transparent", "rgba(255,255,255,0.1)", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

// Skeleton for a card with title and details
export function CardSkeleton({ style }: { style?: ViewStyle }) {
  return (
    <View style={[styles.cardSkeleton, style]}>
      <Skeleton width="70%" height={18} style={{ marginBottom: Spacing.sm }} />
      <Skeleton width="40%" height={14} style={{ marginBottom: Spacing.xs }} />
      <View style={styles.chipRow}>
        <Skeleton width={60} height={24} borderRadius={BorderRadius.xs} />
        <Skeleton width={50} height={24} borderRadius={BorderRadius.xs} />
        <Skeleton width={70} height={24} borderRadius={BorderRadius.xs} />
      </View>
    </View>
  );
}

// Skeleton for exercise list
export function ExerciseListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <View style={styles.listContainer}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} style={{ marginBottom: Spacing.md }} />
      ))}
    </View>
  );
}

// Skeleton for profile section
export function ProfileSkeleton() {
  return (
    <View style={styles.profileSkeleton}>
      <Skeleton
        width={80}
        height={80}
        borderRadius={40}
        style={{ marginBottom: Spacing.md }}
      />
      <Skeleton width={150} height={24} style={{ marginBottom: Spacing.sm }} />
      <Skeleton width={100} height={16} />
    </View>
  );
}

// Skeleton for stat card
export function StatSkeleton() {
  return (
    <View style={styles.statSkeleton}>
      <Skeleton width={40} height={40} borderRadius={20} />
      <View style={{ flex: 1, marginLeft: Spacing.md }}>
        <Skeleton width="60%" height={14} style={{ marginBottom: Spacing.xs }} />
        <Skeleton width="40%" height={24} />
      </View>
    </View>
  );
}

// Skeleton for chart
export function ChartSkeleton({ height = 200 }: { height?: number }) {
  return (
    <View style={[styles.chartSkeleton, { height }]}>
      <View style={styles.chartBars}>
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton
            key={i}
            width={30}
            height={40 + Math.random() * 100}
            borderRadius={BorderRadius.xs}
          />
        ))}
      </View>
      <Skeleton width="100%" height={1} style={{ marginTop: Spacing.md }} />
      <View style={styles.chartLabels}>
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} width={20} height={12} />
        ))}
      </View>
    </View>
  );
}

// Skeleton for macro ring
export function MacroRingSkeleton() {
  return (
    <View style={styles.macroRingSkeleton}>
      <Skeleton width={120} height={120} borderRadius={60} />
      <View style={{ marginLeft: Spacing.lg }}>
        <Skeleton width={80} height={16} style={{ marginBottom: Spacing.sm }} />
        <Skeleton width={100} height={24} style={{ marginBottom: Spacing.sm }} />
        <Skeleton width={60} height={14} />
      </View>
    </View>
  );
}

// Full screen loading skeleton
export function ScreenSkeleton({ type = "list" }: { type?: "list" | "profile" | "analytics" }) {
  if (type === "profile") {
    return (
      <View style={styles.screenContainer}>
        <ProfileSkeleton />
        <View style={styles.statsRow}>
          <StatSkeleton />
          <StatSkeleton />
        </View>
        <CardSkeleton style={{ marginTop: Spacing.lg }} />
        <CardSkeleton style={{ marginTop: Spacing.md }} />
      </View>
    );
  }

  if (type === "analytics") {
    return (
      <View style={styles.screenContainer}>
        <ChartSkeleton />
        <View style={styles.statsRow}>
          <StatSkeleton />
          <StatSkeleton />
        </View>
        <MacroRingSkeleton />
      </View>
    );
  }

  return (
    <View style={styles.screenContainer}>
      <ExerciseListSkeleton />
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    overflow: "hidden",
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
    width: 200,
  },
  cardSkeleton: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  chipRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  listContainer: {
    padding: Spacing.lg,
  },
  profileSkeleton: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  statSkeleton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    flex: 1,
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
  },
  chartSkeleton: {
    padding: Spacing.lg,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: BorderRadius.md,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
  },
  chartBars: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    flex: 1,
  },
  chartLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: Spacing.sm,
  },
  macroRingSkeleton: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: BorderRadius.md,
  },
  screenContainer: {
    flex: 1,
  },
});
