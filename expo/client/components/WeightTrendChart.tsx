import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing } from "@/constants/theme";

interface WeightTrendChartProps {
  data: { date: string; weight: number }[];
  onPress?: () => void;
}

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function standardDeviation(values: number[]) {
  if (values.length < 2) return 0;
  const avg = average(values);
  const variance =
    values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length;
  return Math.sqrt(variance);
}

function linearRegression(values: number[]) {
  if (values.length === 0) return { slope: 0, intercept: 0 };
  const n = values.length;
  const sumX = values.reduce((sum, _, i) => sum + i, 0);
  const sumY = values.reduce((sum, v) => sum + v, 0);
  const sumXY = values.reduce((sum, v, i) => sum + i * v, 0);
  const sumX2 = values.reduce((sum, _, i) => sum + i * i, 0);
  const denominator = n * sumX2 - sumX * sumX;
  const slope = denominator === 0 ? 0 : (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

export function WeightTrendChart({ data, onPress }: WeightTrendChartProps) {
  const { theme } = useTheme();
  const screenWidth =
    Dimensions.get("window").width - Spacing.lg * 2 - Spacing.xl * 2;

  const cleanedData = [...data]
    .filter((d) => d.weight > 0)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const displayData = cleanedData.slice(-14);
  const weights = displayData.map((d) => d.weight);
  const rollingAvg = weights.map((_, idx) => {
    const start = Math.max(0, idx - 6);
    return average(weights.slice(start, idx + 1));
  });
  const { slope } = linearRegression(weights);
  const weeklyTrend = slope * 7;

  const chartData =
    displayData.length > 0
      ? {
          labels: displayData.map((d) => {
            const date = new Date(d.date);
            return `${date.getMonth() + 1}/${date.getDate()}`;
          }),
          datasets: [
            {
              data: weights,
              color: () => Colors.dark.primary,
              strokeWidth: 2,
            },
            {
              data: rollingAvg,
              color: () => Colors.dark.info,
              strokeWidth: 2,
            },
          ],
        }
      : {
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          datasets: [{ data: [0, 0, 0, 0, 0, 0, 0] }],
        };

  const last7 = weights.slice(-7);
  const prev7 = weights.slice(-14, -7);
  const currentAvg = average(last7);
  const previousAvg = average(prev7);
  const weeklyDelta = currentAvg - previousAvg;
  const variance = standardDeviation(last7);

  const changeColor =
    weeklyDelta > 0
      ? Colors.dark.error
      : weeklyDelta < 0
        ? Colors.dark.success
        : theme.textSecondary;

  return (
    <Card elevation={2} onPress={onPress} style={styles.card}>
      <View style={styles.header}>
        <View>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Weight Trend (14 days)
          </ThemedText>
          <View style={styles.valueRow}>
            <ThemedText style={styles.currentWeight}>
              {currentAvg > 0 ? `${currentAvg.toFixed(1)} lbs` : "--"}
            </ThemedText>
            {weeklyDelta !== 0 ? (
              <ThemedText
                type="small"
                style={{ color: changeColor, marginLeft: Spacing.sm }}
              >
                {weeklyDelta > 0 ? "+" : ""}
                {weeklyDelta.toFixed(1)} lbs / wk
              </ThemedText>
            ) : null}
          </View>
          {weights.length > 0 ? (
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Variance: {variance.toFixed(1)} | Trend:{" "}
              {weeklyTrend > 0 ? "+" : ""}
              {weeklyTrend.toFixed(1)} lbs/wk
            </ThemedText>
          ) : null}
        </View>
      </View>
      {data.length > 1 ? (
        <LineChart
          data={chartData}
          width={screenWidth}
          height={120}
          withHorizontalLabels={false}
          withVerticalLabels={true}
          withDots={true}
          withInnerLines={false}
          withOuterLines={false}
          chartConfig={{
            backgroundColor: "transparent",
            backgroundGradientFrom: "transparent",
            backgroundGradientTo: "transparent",
            decimalPlaces: 0,
            color: () => Colors.dark.primary,
            labelColor: () => theme.textSecondary,
            propsForDots: {
              r: "4",
              strokeWidth: "2",
              stroke: Colors.dark.primary,
            },
          }}
          bezier
          style={styles.chart}
        />
      ) : (
        <View style={styles.emptyState}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Log your daily weight to see trends
          </ThemedText>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.sm,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: Spacing.xs,
  },
  currentWeight: {
    fontSize: 24,
    fontWeight: "700",
  },
  chart: {
    marginLeft: -Spacing.lg,
    marginTop: Spacing.sm,
  },
  emptyState: {
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
});
