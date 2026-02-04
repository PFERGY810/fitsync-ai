import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Pressable, Image, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, Colors, BorderRadius } from "@/constants/theme";
import { savePhysiqueAnalysis } from "@/lib/storage";
import { PhysiqueAnalysis } from "@/types";

export default function WeeklyCheckInScreen() {
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();
    const navigation = useNavigation<any>();
    const [analyzing, setAnalyzing] = useState(false);

    const handleAnalyze = async () => {
        setAnalyzing(true);

        // Mock Analysis Delay
        setTimeout(async () => {
            const mockAnalysis: PhysiqueAnalysis = {
                bodyFat: Number((12 + Math.random() * 5).toFixed(1)), // Random 12-17%
                proportions: Number((1.5 + Math.random() * 0.2).toFixed(2)),
                muscleGroups: {
                    chest: Math.random() > 0.5 ? 'strength' : 'neutral',
                    back: Math.random() > 0.5 ? 'strength' : 'weakness',
                    arms: 'strength',
                    legs: Math.random() > 0.5 ? 'weakness' : 'neutral',
                    abs: 'neutral',
                    shoulders: 'strength'
                },
                lastScanDate: new Date().toISOString()
            };

            await savePhysiqueAnalysis(mockAnalysis);
            setAnalyzing(false);

            Alert.alert("Analysis Complete", "Your physique has been analyzed. Updating your protocol...", [
                { text: "View Results", onPress: () => navigation.navigate("Looksmaxx") }
            ]);
        }, 2000);
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
                    Upload your front, side, and back photos for AI analysis.
                </ThemedText>

                {/* Photo Upload Placeholders */}
                <View style={styles.photosContainer}>
                    {['Front', 'Side', 'Back'].map((pose, index) => (
                        <Pressable key={pose} style={[styles.photoCard, { backgroundColor: theme.surface }]}>
                            <View style={[styles.photoPlaceholder, { backgroundColor: theme.background }]}>
                                <Feather name="camera" size={32} color={theme.textSecondary} />
                            </View>
                            <ThemedText type="body" style={{ marginTop: 8, fontWeight: '600' }}>{pose}</ThemedText>
                        </Pressable>
                    ))}
                </View>

                {/* Info Card */}
                <View style={[styles.infoCard, { backgroundColor: theme.surface }]}>
                    <Feather name="info" size={20} color={theme.primary} />
                    <ThemedText type="small" style={{ flex: 1, color: theme.text }}>
                        Ensure good lighting and consistent posing for accurate AI tracking.
                    </ThemedText>
                </View>

            </ScrollView>

            <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}>
                <Button
                    onPress={handleAnalyze}
                    style={styles.analyzeButton}
                    disabled={analyzing}
                >
                    {analyzing ? "Analyzing (AI)..." : "Run AI Analysis"}
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
    },
    photoPlaceholder: {
        width: '100%',
        aspectRatio: 0.8,
        borderRadius: BorderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoCard: {
        flexDirection: 'row',
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        gap: Spacing.sm,
        alignItems: 'center',
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
