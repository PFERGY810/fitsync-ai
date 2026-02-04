import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

interface DailyReadinessCardProps {
    score: number;
    history: number[]; // Array of last 7 days scores
}

export function DailyReadinessCard({ score, history }: DailyReadinessCardProps) {
    const { theme } = useTheme();
    const screenWidth = Dimensions.get("window").width - Spacing.lg * 2;

    // Fill data if empty
    const chartData = {
        labels: ["M", "T", "W", "T", "F", "S", "S"],
        datasets: [
            {
                data: history.length > 0 ? history : [65, 70, 75, 72, 80, 82, score],
                color: (opacity = 1) => `rgba(0, 215, 199, ${opacity})`, // Cyan color
                strokeWidth: 3,
            },
        ],
    };

    const getScoreColor = (s: number) => {
        if (s >= 80) return Colors.dark.success;
        if (s >= 50) return Colors.dark.warning;
        return Colors.dark.error;
    };

    const scoreColor = getScoreColor(score);
    const isUp = history.length > 1 && score >= history[history.length - 2];

    return (
        <Card elevation={0} style={styles.card}>
            <LinearGradient
                colors={["rgba(255, 255, 255, 0.05)", "rgba(255, 255, 255, 0.02)"]}
                style={StyleSheet.absoluteFill}
            />

            <View style={styles.header}>
                <ThemedText type="h4" style={{ color: theme.text }}>
                    Daily Readiness
                </ThemedText>
                <Feather name="chevron-right" size={20} color={theme.textSecondary} />
            </View>

            <View style={styles.scoreRow}>
                <ThemedText style={[styles.scoreText]} lightColor="#fff" darkColor="#fff">
                    {score}
                </ThemedText>
                <View style={[styles.badge, { backgroundColor: isUp ? "rgba(46, 204, 113, 0.2)" : "rgba(231, 76, 60, 0.2)" }]}>
                    <Feather
                        name={isUp ? "trending-up" : "trending-down"}
                        size={16}
                        color={isUp ? Colors.dark.success : Colors.dark.error}
                    />
                </View>
            </View>

            <LineChart
                data={chartData}
                width={screenWidth - Spacing.lg} // Adjust for padding
                height={100}
                withDots={false}
                withInnerLines={false}
                withOuterLines={false}
                withVerticalLabels={true}
                withHorizontalLabels={false}
                chartConfig={{
                    backgroundColor: "transparent",
                    backgroundGradientFrom: "transparent",
                    backgroundGradientTo: "transparent",
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(0, 215, 199, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(160, 160, 160, ${opacity})`,
                    style: {
                        borderRadius: 16,
                    },
                    propsForBackgroundLines: {
                        strokeWidth: 0,
                    },
                }}
                bezier
                style={styles.chart}
            />
        </Card>
    );
}

const styles = StyleSheet.create({
    card: {
        padding: Spacing.lg,
        borderRadius: BorderRadius.xl,
        backgroundColor: "#1A1A1A", // Dark card background
        overflow: "hidden",
        marginBottom: Spacing.lg,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: Spacing.xs,
    },
    scoreRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: Spacing.md,
        gap: Spacing.sm,
    },
    scoreText: {
        fontSize: 40,
        fontWeight: "800",
        letterSpacing: -1,
        marginBottom: 8,
    },
    badge: {
        padding: 4,
        borderRadius: 8,
    },
    chart: {
        paddingRight: 0,
        paddingLeft: 0,
        marginLeft: -Spacing.md, // Offset to align with left edge
    },
});
