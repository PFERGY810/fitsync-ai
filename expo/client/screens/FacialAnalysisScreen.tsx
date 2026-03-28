import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { getUserProfile } from "@/lib/storage";
import { getApiUrl } from "@/lib/query-client";
import type { UserProfile } from "@/types";

interface FacialMetric {
  value: string;
  notes: string;
}

interface FacialAnalysis {
  overallAssessment: string;
  gonialAngle: FacialMetric;
  maxillaryProjection: FacialMetric;
  zygomaticWidth: FacialMetric;
  buccalFat: FacialMetric;
  mandibleWidth: FacialMetric;
  facialThirds: FacialMetric;
  canthalTilt: FacialMetric;
  ipd: FacialMetric;
  noseChinAlignment: FacialMetric;
  confidence: string;
}

export default function FacialAnalysisScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [photos, setPhotos] = useState<{
    front?: string;
    side?: string;
    angle?: string;
  }>({});
  const [analysis, setAnalysis] = useState<FacialAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const userProfile = await getUserProfile();
      setProfile(userProfile);
    } catch (err) {
      console.error("Error loading profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const pickPhoto = async (type: "front" | "side" | "angle") => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.9,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setPhotos({
        ...photos,
        [type]: `data:image/jpeg;base64,${result.assets[0].base64}`,
      });
    }
  };

  const analyzeFace = async () => {
    if (!photos.front && !photos.side && !photos.angle) {
      setError("Please upload at least one facial photo.");
      return;
    }

    setAnalyzing(true);
    setError(null);
    try {
      const response = await fetch(
        new URL("/api/looksmaxx/analyze-face", getApiUrl()).toString(),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ photos, profile, profileId: profile?.id }),
        },
      );

      if (!response.ok) throw new Error("Analysis failed");

      const data = await response.json();
      setAnalysis(data?.analysis || null);
    } catch (err) {
      console.error("Error analyzing face:", err);
      setError("Failed to analyze facial photos.");
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.md,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.lg,
        gap: Spacing.lg,
      }}
    >
      <Card>
        <ThemedText type="h3">Upload Facial Photos</ThemedText>
        <ThemedText style={styles.subtext}>
          Use front and side photos with even lighting and a neutral expression.
        </ThemedText>

        <View style={styles.photoRow}>
          {(["front", "side", "angle"] as const).map((type) => (
            <Pressable
              key={type}
              style={[styles.photoBox, { borderColor: theme.border }]}
              onPress={() => pickPhoto(type)}
            >
              {photos[type] ? (
                <Image source={{ uri: photos[type] }} style={styles.photo} />
              ) : (
                <>
                  <Feather
                    name="camera"
                    size={24}
                    color={theme.textSecondary}
                  />
                  <ThemedText style={styles.photoLabel}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </ThemedText>
                </>
              )}
            </Pressable>
          ))}
        </View>
      </Card>

      <Button
        onPress={analyzeFace}
        disabled={analyzing}
        style={styles.analyzeButton}
      >
        {analyzing ? "Analyzing..." : "Analyze Face"}
      </Button>

      {error && (
        <Card style={styles.errorCard}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </Card>
      )}

      {analysis && (
        <Card>
          <ThemedText type="h3">Analysis Summary</ThemedText>
          <ThemedText style={styles.subtext}>
            {analysis.overallAssessment}
          </ThemedText>

          <View style={styles.metricList}>
            {(
              [
                ["Gonial Angle", analysis.gonialAngle],
                ["Maxillary Projection", analysis.maxillaryProjection],
                ["Zygomatic Width", analysis.zygomaticWidth],
                ["Buccal Fat", analysis.buccalFat],
                ["Mandible Width", analysis.mandibleWidth],
                ["Facial Thirds", analysis.facialThirds],
                ["Canthal Tilt", analysis.canthalTilt],
                ["IPD", analysis.ipd],
                ["Nose-Chin Alignment", analysis.noseChinAlignment],
              ] as const
            ).map(([label, metric]) => (
              <View key={label} style={styles.metricRow}>
                <ThemedText type="body">{label}</ThemedText>
                <ThemedText style={styles.subtext}>
                  {metric?.value || "not_visible"} - {metric?.notes || ""}
                </ThemedText>
              </View>
            ))}
          </View>

          <ThemedText style={styles.subtext}>
            Confidence: {analysis.confidence}
          </ThemedText>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  subtext: {
    marginTop: Spacing.xs,
    opacity: 0.7,
  },
  photoRow: {
    marginTop: Spacing.md,
    flexDirection: "row",
    gap: Spacing.sm,
  },
  photoBox: {
    flex: 1,
    height: 140,
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  photoLabel: {
    marginTop: Spacing.xs,
    opacity: 0.7,
  },
  analyzeButton: {
    marginTop: Spacing.md,
  },
  metricList: {
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  metricRow: {
    gap: Spacing.xs,
  },
  errorCard: {
    borderWidth: 1,
    borderColor: Colors.red,
  },
  errorText: {
    color: Colors.red,
  },
});
