import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { getUserProfile } from "@/lib/storage";
import { getApiUrl } from "@/lib/query-client";
import type { CompoundInfo, UserProfile } from "@/types";

export default function CompoundInfoScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [compounds, setCompounds] = useState<CompoundInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    getUserProfile().then(setProfile);
    fetchCompounds();
  }, []);

  const fetchCompounds = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        new URL("/api/compounds", getApiUrl()).toString(),
      );
      if (!response.ok) {
        throw new Error("Failed to fetch compound data");
      }
      const data = await response.json();
      setCompounds(data.compounds || []);
    } catch (err: any) {
      console.error("Error fetching compounds:", err);
      setError(err.message || "Failed to load compound data");
    } finally {
      setLoading(false);
    }
  };

  const categories = [...new Set(compounds.map((c) => c.category))];
  const filteredCompounds = selectedCategory
    ? compounds.filter((c) => c.category === selectedCategory)
    : compounds;

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: Spacing.xl,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
    >
      <Card
        elevation={3}
        style={[
          styles.disclaimerCard,
          { backgroundColor: Colors.dark.warning + "20" },
        ]}
      >
        <View style={styles.disclaimerHeader}>
          <Feather
            name="alert-triangle"
            size={24}
            color={Colors.dark.warning}
          />
          <ThemedText
            type="h4"
            style={[styles.disclaimerTitle, { color: Colors.dark.warning }]}
          >
            Important Disclaimer
          </ThemedText>
        </View>
        <ThemedText type="small" style={styles.disclaimerText}>
          This information is provided for educational purposes only. I am an AI
          assistant, not a medical doctor, licensed physician, or healthcare
          professional. I do not condone, recommend, or encourage the use of any
          performance-enhancing substances.
        </ThemedText>
        <ThemedText
          type="small"
          style={[styles.disclaimerText, { marginTop: Spacing.sm }]}
        >
          The information below represents commonly discussed protocols among
          competitive bodybuilders and is being relayed for informational
          purposes only. Always consult with a qualified healthcare provider
          before making any decisions about your health.
        </ThemedText>
        <ThemedText
          type="small"
          style={[
            styles.disclaimerText,
            { marginTop: Spacing.sm, fontWeight: "600" },
          ]}
        >
          Use of these substances without medical supervision is illegal in many
          jurisdictions and carries significant health risks.
        </ThemedText>
      </Card>

      {profile ? (
        <Card elevation={2} style={styles.profileCard}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Your Profile
          </ThemedText>
          <ThemedText type="body" style={{ marginTop: Spacing.xs }}>
            Age: {profile.age} | Weight: {profile.weight} lbs | Experience:{" "}
            {profile.experienceLevel}
          </ThemedText>
        </Card>
      ) : null}

      <ThemedText type="h3" style={styles.sectionTitle}>
        Compound Database ({compounds.length} compounds)
      </ThemedText>

      {categories.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContainer}
        >
          <Pressable
            onPress={() => setSelectedCategory(null)}
            style={[
              styles.categoryChip,
              {
                backgroundColor:
                  selectedCategory === null
                    ? Colors.dark.primary
                    : theme.backgroundSecondary,
              },
            ]}
          >
            <ThemedText
              type="small"
              style={{ color: selectedCategory === null ? "#fff" : theme.text }}
            >
              All
            </ThemedText>
          </Pressable>
          {categories.map((cat: string) => (
            <Pressable
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={[
                styles.categoryChip,
                {
                  backgroundColor:
                    selectedCategory === cat
                      ? Colors.dark.primary
                      : theme.backgroundSecondary,
                },
              ]}
            >
              <ThemedText
                type="small"
                style={{
                  color: selectedCategory === cat ? "#fff" : theme.text,
                }}
              >
                {cat}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.dark.primary} />
          <ThemedText
            type="body"
            style={{ marginTop: Spacing.md, color: theme.textSecondary }}
          >
            Loading compound data from knowledge base...
          </ThemedText>
        </View>
      ) : error ? (
        <Card
          elevation={2}
          style={[
            styles.errorCard,
            { backgroundColor: Colors.dark.error + "20" },
          ]}
        >
          <Feather name="alert-circle" size={24} color={Colors.dark.error} />
          <ThemedText
            type="body"
            style={{ color: Colors.dark.error, marginTop: Spacing.sm }}
          >
            {error}
          </ThemedText>
          <Pressable
            onPress={fetchCompounds}
            style={[
              styles.retryButton,
              { backgroundColor: Colors.dark.primary },
            ]}
          >
            <ThemedText type="small" style={{ color: "#fff" }}>
              Retry
            </ThemedText>
          </Pressable>
        </Card>
      ) : (
        filteredCompounds.map((compound: CompoundInfo) => (
          <Card key={compound.id} elevation={2} style={styles.compoundCard}>
            <Pressable
              onPress={() => toggleExpand(compound.id)}
              style={styles.compoundHeader}
            >
              <View style={styles.compoundTitleRow}>
                <ThemedText type="h4">{compound.name}</ThemedText>
                <Feather
                  name={
                    expandedId === compound.id ? "chevron-up" : "chevron-down"
                  }
                  size={20}
                  color={theme.textSecondary}
                />
              </View>
              <ThemedText type="small" style={{ color: Colors.dark.primary }}>
                {compound.category}
              </ThemedText>
            </Pressable>

            {expandedId === compound.id ? (
              <View style={styles.compoundDetails}>
                <ThemedText type="body" style={styles.description}>
                  {compound.description}
                </ThemedText>

                <View style={styles.detailSection}>
                  <ThemedText
                    type="small"
                    style={[styles.detailLabel, { color: theme.textSecondary }]}
                  >
                    Common Dosages (Reported)
                  </ThemedText>
                  <ThemedText type="body">{compound.commonDosages}</ThemedText>
                </View>

                <View style={styles.detailSection}>
                  <ThemedText
                    type="small"
                    style={[styles.detailLabel, { color: theme.textSecondary }]}
                  >
                    Typical Cycle Length
                  </ThemedText>
                  <ThemedText type="body">{compound.cycleLength}</ThemedText>
                </View>

                <View style={styles.detailSection}>
                  <ThemedText
                    type="small"
                    style={[styles.detailLabel, { color: Colors.dark.success }]}
                  >
                    Reported Benefits
                  </ThemedText>
                  {compound.benefits.map((benefit: string, i: number) => (
                    <View key={i} style={styles.listItem}>
                      <View
                        style={[
                          styles.bullet,
                          { backgroundColor: Colors.dark.success },
                        ]}
                      />
                      <ThemedText type="small">{benefit}</ThemedText>
                    </View>
                  ))}
                </View>

                <View style={styles.detailSection}>
                  <ThemedText
                    type="small"
                    style={[styles.detailLabel, { color: Colors.dark.error }]}
                  >
                    Known Risks
                  </ThemedText>
                  {compound.risks.map((risk: string, i: number) => (
                    <View key={i} style={styles.listItem}>
                      <View
                        style={[
                          styles.bullet,
                          { backgroundColor: Colors.dark.error },
                        ]}
                      />
                      <ThemedText type="small">{risk}</ThemedText>
                    </View>
                  ))}
                </View>

                <View
                  style={[
                    styles.notesBox,
                    { backgroundColor: theme.backgroundSecondary },
                  ]}
                >
                  <ThemedText
                    type="small"
                    style={{ fontWeight: "600", marginBottom: Spacing.xs }}
                  >
                    Additional Notes
                  </ThemedText>
                  <ThemedText
                    type="small"
                    style={{ color: theme.textSecondary }}
                  >
                    {compound.notes}
                  </ThemedText>
                </View>
              </View>
            ) : null}
          </Card>
        ))
      )}

      <Card
        elevation={2}
        style={[
          styles.footerCard,
          { backgroundColor: theme.backgroundSecondary },
        ]}
      >
        <ThemedText
          type="small"
          style={{ color: theme.textSecondary, textAlign: "center" }}
        >
          This information is compiled from publicly available educational
          resources and discussions within the bodybuilding community. It is not
          medical advice. Consult a healthcare professional for personalized
          guidance.
        </ThemedText>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  disclaimerCard: {
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.dark.warning,
  },
  disclaimerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  disclaimerTitle: {
    marginLeft: Spacing.sm,
  },
  disclaimerText: {
    lineHeight: 20,
  },
  profileCard: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
  compoundCard: {
    marginBottom: Spacing.md,
  },
  compoundHeader: {
    paddingBottom: Spacing.sm,
  },
  compoundTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  compoundDetails: {
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  description: {
    marginBottom: Spacing.lg,
    lineHeight: 24,
  },
  detailSection: {
    marginBottom: Spacing.lg,
  },
  detailLabel: {
    fontWeight: "600",
    marginBottom: Spacing.sm,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: Spacing.xs,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: Spacing.sm,
    marginTop: 6,
  },
  notesBox: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  footerCard: {
    marginTop: Spacing.lg,
  },
  categoryScroll: {
    marginBottom: Spacing.lg,
    marginHorizontal: -Spacing.lg,
  },
  categoryContainer: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing["2xl"],
  },
  errorCard: {
    alignItems: "center",
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.dark.error,
  },
  retryButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.md,
  },
});
