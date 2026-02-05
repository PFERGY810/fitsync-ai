import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Pressable, Image, Alert, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, Colors, BorderRadius } from "@/constants/theme";
import { savePhysiqueAnalysis, getProfileId } from "@/lib/storage";
import { getApiUrl } from "@/lib/query-client";
import { convertPhotosToBase64 } from "@/lib/image-utils";

export default function WeeklyCheckInScreen() {
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();
    const navigation = useNavigation<any>();

    const [analyzing, setAnalyzing] = useState(false);
    const [analysisStatus, setAnalysisStatus] = useState<string>("");
    const [photos, setPhotos] = useState<{
        Front?: string;
        Side?: string;
        Back?: string;
    }>({});

    const pickImage = async (pose: 'Front' | 'Side' | 'Back') => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 5],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0].uri) {
            setPhotos(prev => ({ ...prev, [pose]: result.assets[0].uri }));
        }
    };

    const pollAnalysisJob = async (jobId: string) => {
        const start = Date.now();
        const timeoutMs = 240000;

        while (Date.now() - start < timeoutMs) {
            const response = await fetch(
                new URL(`/api/coach/analysis-jobs/${jobId}`, getApiUrl()).toString()
            );

            if (!response.ok) {
                throw new Error("Failed to fetch analysis status");
            }

            const job = await response.json();
            setAnalysisStatus(job.status === 'processing' ? "AI is analyzing your photos..." : job.status);

            if (job.status === "completed") {
                return job.result;
            }

            if (job.status === "failed") {
                throw new Error(job.error || "Analysis failed");
            }

            await new Promise((r) => setTimeout(r, 2000));
        }

        throw new Error("Analysis timed out. Please try again.");
    };

    const handleAnalyze = async () => {
        if (!photos.Front && !photos.Side && !photos.Back) {
            Alert.alert("Missing Photos", "Please upload at least one photo for analysis.");
            return;
        }

        setAnalyzing(true);
        setAnalysisStatus("Preparing photos...");

        try {
            const profileId = await getProfileId();
            const base64Photos = await convertPhotosToBase64({
                front: photos.Front,
                side: photos.Side,
                back: photos.Back,
            });

            setAnalysisStatus("Uploading to AI Coach...");
            const response = await fetch(
                new URL("/api/coach/analyze-physique-detailed", getApiUrl()).toString(),
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        photos: base64Photos,
                        profileId,
                    }),
                },
            );

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || "Failed to start analysis");
            }

            const { jobId } = await response.json();
            const result = await pollAnalysisJob(jobId);

            await savePhysiqueAnalysis(result);
            setAnalyzing(false);

            Alert.alert("Analysis Complete", "Your physique has been analyzed. View your detailed breakdown now.", [
                { text: "View Results", onPress: () => navigation.navigate("Looksmaxx") }
            ]);
        } catch (error: any) {
            console.error("Analysis error:", error);
            setAnalyzing(false);
            Alert.alert("Analysis Failed", error.message || "Something went wrong during analysis.");
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
            {/* Header */}
            <View style={[styles.header, { marginTop: insets.top }]}>
                <Pressable onPress={() => navigation.goBack()} style={{ padding: 8 }}>
                    <Feather name="chevron-left" size={24} color={theme.text} />
                </Pressable>
                <ThemedText type="h4" style={{ flex: 1, textAlign: 'center', marginRight: 32 }}>
                    Weekly Check-In
                </ThemedText>
            </View>

            <ScrollView contentContainerStyle={{ padding: Spacing.lg, paddingBottom: Spacing.xl * 2 }}>
                <ThemedText type="h2" style={{ marginBottom: Spacing.sm }}>
                    Physique Update
                </ThemedText>
                <ThemedText type="body" style={{ color: theme.textSecondary, marginBottom: Spacing.xl }}>
                    Upload your front, side, and back photos for AI analysis. The AI will look for specific visual markers like muscle separation and vascularity.
                </ThemedText>

                {/* Photo Upload Container */}
                <View style={styles.photosContainer}>
                    {(['Front', 'Side', 'Back'] as const).map((pose) => (
                        <Pressable
                            key={pose}
                            style={[
                                styles.photoCard,
                                { backgroundColor: theme.surface },
                                photos[pose] && { borderColor: Colors.dark.neonCyan, borderWidth: 1 }
                            ]}
                            onPress={() => pickImage(pose)}
                        >
                            <View style={[styles.photoPlaceholder, { backgroundColor: theme.background }]}>
                                {photos[pose] ? (
                                    <Image source={{ uri: photos[pose] }} style={styles.photoImage} />
                                ) : (
                                    <View style={styles.emptyIconContainer}>
                                        <Feather name="camera" size={32} color={theme.textSecondary} />
                                    </View>
                                )}
                            </View>
                            <ThemedText type="body" style={{ marginTop: 8, fontWeight: '600' }}>{pose}</ThemedText>
                            {photos[pose] && (
                                <View style={styles.successBadge}>
                                    <Feather name="check" size={12} color="#FFF" />
                                </View>
                            )}
                        </Pressable>
                    ))}
                </View>

                {/* Info Card */}
                <View style={[styles.infoCard, { backgroundColor: theme.surface }]}>
                    <Feather name="shield" size={20} color={Colors.dark.neonCyan} />
                    <ThemedText type="small" style={{ flex: 1, color: theme.text }}>
                        Your photos are processed privately by our AI and not stored on public servers. Consistent lighting is key for accurate tracking.
                    </ThemedText>
                </View>

                {analyzing && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={Colors.dark.neonCyan} />
                        <ThemedText style={{ marginTop: 12, color: Colors.dark.neonCyan }}>{analysisStatus}</ThemedText>
                    </View>
                )}

            </ScrollView>

            <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}>
                <Button
                    onPress={handleAnalyze}
                    style={styles.analyzeButton}
                    disabled={analyzing}
                >
                    {analyzing ? "AI Scanning..." : "Run AI Analysis"}
                </Button>
            </View>
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
        paddingHorizontal: Spacing.md,
        marginBottom: Spacing.lg,
    },
    photosContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Spacing.xl,
        gap: 8,
    },
    photoCard: {
        flex: 1,
        padding: Spacing.sm,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        position: 'relative',
    },
    photoPlaceholder: {
        width: '100%',
        aspectRatio: 0.8,
        borderRadius: BorderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    photoImage: {
        width: '100%',
        height: '100%',
    },
    emptyIconContainer: {
        opacity: 0.5,
    },
    successBadge: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: Colors.dark.success,
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoCard: {
        flexDirection: 'row',
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        gap: Spacing.sm,
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    loadingContainer: {
        alignItems: 'center',
        marginVertical: Spacing.lg,
    },
    footer: {
        paddingHorizontal: Spacing.lg,
    },
    analyzeButton: {
        shadowColor: Colors.dark.neonCyan,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    }
});
