import React from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Card } from "@/components/Card";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

interface Insight {
  issue: string;
  severity: number;
  status: "good" | "mild" | "moderate" | "severe";
  observations: string[];
  corrections?: string[];
}

interface KeyInsightsCardProps {
  insights: Insight[];
  title?: string;
}

export function KeyInsightsCard({ insights, title = "Key Insights" }: KeyInsightsCardProps) {
  const { theme } = useTheme();

  if (!insights || insights.length === 0) {
    return null;
  }

  const getSeverityColor = (severity: number, status: string) => {
    if (status === "good") return Colors.dark.success;
    if (status === "mild") return Colors.dark.carbs;
    if (status === "moderate") return Colors.dark.primary;
    if (status === "severe") return Colors.dark.error;
    return theme.textSecondary;
  };

  const getSeverityIcon = (status: string) => {
    if (status === "good") return "check-circle";
    if (status === "mild") return "info";
    if (status === "moderate" || status === "severe") return "alert-triangle";
    return "alert-circle";
  };

  return (
    <View style={styles.container}>
      <ThemedText type="h3" style={styles.title}>
        {title}
      </ThemedText>
      {insights.map((insight, index) => (
        <Card key={index} elevation={1} style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <View style={styles.insightHeaderLeft}>
              <Feather
                name={getSeverityIcon(insight.status) as any}
                size={18}
                color={getSeverityColor(insight.severity, insight.status)}
              />
              <ThemedText type="body" style={styles.insightTitle}>
                {insight.issue}
              </ThemedText>
            </View>
            <View
              style={[
                styles.severityBadge,
                { backgroundColor: getSeverityColor(insight.severity, insight.status) + "20" },
              ]}
            >
              <ThemedText
                type="small"
                style={[
                  styles.severityText,
                  { color: getSeverityColor(insight.severity, insight.status) },
                ]}
              >
                {insight.status.toUpperCase()}
              </ThemedText>
            </View>
          </View>

          {insight.observations.length > 0 && (
            <View style={styles.observations}>
              {insight.observations.map((obs, i) => (
                <View key={i} style={styles.observationRow}>
                  <View
                    style={[
                      styles.dot,
                      { backgroundColor: getSeverityColor(insight.severity, insight.status) },
                    ]}
                  />
                  <ThemedText type="small" style={[styles.observationText, { color: theme.textSecondary }]}>
                    {obs}
                  </ThemedText>
                </View>
              ))}
            </View>
          )}

          {insight.corrections && insight.corrections.length > 0 && (
            <View style={styles.corrections}>
              <ThemedText
                type="small"
                style={[styles.correctionsTitle, { color: Colors.dark.success }]}
              >
                Corrections:
              </ThemedText>
              {insight.corrections.map((corr, i) => (
                <View key={i} style={styles.correctionRow}>
                  <Feather name="check" size={12} color={Colors.dark.success} />
                  <ThemedText type="small" style={[styles.correctionText, { color: theme.textSecondary }]}>
                    {corr}
                  </ThemedText>
                </View>
              ))}
            </View>
          )}
        </Card>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xl,
  },
  title: {
    marginBottom: Spacing.md,
  },
  insightCard: {
    marginBottom: Spacing.md,
  },
  insightHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
  },
  insightHeaderLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  insightTitle: {
    fontWeight: "700",
    flex: 1,
  },
  severityBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  severityText: {
    fontWeight: "700",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  observations: {
    marginTop: Spacing.sm,
  },
  observationRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: Spacing.xs,
    gap: Spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 4,
  },
  observationText: {
    flex: 1,
    lineHeight: 18,
  },
  corrections: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(128, 128, 128, 0.2)",
  },
  correctionsTitle: {
    fontWeight: "600",
    marginBottom: Spacing.xs,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  correctionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: Spacing.xs,
    gap: Spacing.xs,
  },
  correctionText: {
    flex: 1,
    lineHeight: 18,
  },
});
