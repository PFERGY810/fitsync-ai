import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";

const AnimatedView = Animated.createAnimatedComponent(View);
import { Button } from "@/components/Button";
import { PhotoGrid } from "@/components/PhotoGrid";
import { useOnboarding } from "@/context/OnboardingContext";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing } from "@/constants/theme";

export default function ProgressPhotosScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const { profile, updateProfile, getProgressForStep } = useOnboarding();
  const progress = getProgressForStep("progress-photos");

  const [photos, setPhotos] = useState<Record<string, string[]>>({
    front: profile.progressPhotos?.front ? [profile.progressPhotos.front] : [],
    side: profile.progressPhotos?.side ? [profile.progressPhotos.side] : [],
    back: profile.progressPhotos?.back ? [profile.progressPhotos.back] : [],
    legs: profile.progressPhotos?.legs ? [profile.progressPhotos.legs] : [],
  });

  const handleAddPhoto = (type: string, uri: string) => {
    setPhotos((prev) => ({
      ...prev,
      [type]: [...(prev[type] || []), uri].slice(0, 3), // Max 3 photos per type
    }));
  };

  const handleRemovePhoto = (type: string, index: number) => {
    setPhotos((prev) => ({
      ...prev,
      [type]: (prev[type] || []).filter((_, i) => i !== index),
    }));
  };

  const handleContinue = () => {
    // Convert array of photos to single photo (for backward compatibility)
    // Use the first photo of each type
    updateProfile({
      progressPhotos: {
        front: photos.front?.[0],
        side: photos.side?.[0],
        back: photos.back?.[0],
        legs: photos.legs?.[0],
        dateTaken: new Date().toISOString(),
      },
    });

    // If photos were taken, go to PhysiqueAnalysis first so weak points inform the program
    const hasPhotos =
      photos.front?.length > 0 ||
      photos.side?.length > 0 ||
      photos.back?.length > 0 ||
      photos.legs?.length > 0;
    if (hasPhotos) {
      navigation.navigate("PhysiqueAnalysis");
    } else {
      navigation.navigate("Goals");
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const totalPhotos =
    (photos.front?.length || 0) +
    (photos.side?.length || 0) +
    (photos.back?.length || 0) +
    (photos.legs?.length || 0);

  const hasAnyPhotos = totalPhotos > 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Pressable onPress={handleBack} hitSlop={8}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </Pressable>
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBar,
              { backgroundColor: theme.backgroundSecondary },
            ]}
          >
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <AnimatedView entering={FadeInUp.duration(350)}>
          <ThemedText type="h2" style={styles.title}>
            Review Photos
          </ThemedText>
          <ThemedText
            type="body"
            style={[styles.subtitle, { color: theme.textSecondary }]}
          >
            Tip: The more photos you upload, the more accurate your results will be.
          </ThemedText>

          <PhotoGrid
            photos={photos}
            onAddPhoto={handleAddPhoto}
            onRemovePhoto={handleRemovePhoto}
          />

          <ThemedText
            type="small"
            style={[styles.skipNote, { color: theme.textSecondary }]}
          >
            Photos are optional but recommended for tracking progress. You can
            add them later in Settings.
          </ThemedText>
        </AnimatedView>
      </ScrollView>

      <View
        style={[styles.footer, { paddingBottom: insets.bottom + Spacing.lg }]}
      >
        <AnimatedView entering={FadeInUp.delay(200).duration(350)}>
          <Button onPress={handleContinue} testID="button-continue">
            {hasAnyPhotos ? `Analyze ${totalPhotos} Photo${totalPhotos !== 1 ? "s" : ""}` : "Skip for Now"}
          </Button>
        </AnimatedView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  progressContainer: {
    flex: 1,
    marginHorizontal: Spacing.lg,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.dark.primary,
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  skipNote: {
    textAlign: "center",
    lineHeight: 18,
    marginTop: Spacing.lg,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
});
