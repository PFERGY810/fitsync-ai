import React from "react";
import { View, StyleSheet, ScrollView, Image, Dimensions, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
const AnimatedView = Animated.createAnimatedComponent(View);

import { ThemedText } from "@/components/ThemedText";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

const { width } = Dimensions.get("window");

import { useQuery } from "@tanstack/react-query";
import { getTierRanking } from "@/lib/storage";
import { TierRankingEntry } from "@/types";

// ...

export default function TierRankingScreen() {
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();
    const navigation = useNavigation<any>();

    const { data: leaderboard = [], isLoading, isError, refetch } = useQuery({
        queryKey: ["tierRanking"],
        queryFn: getTierRanking,
    });

    if (isLoading) {
        return <LoadingState message="Loading tier ranking..." fullScreen />;
    }

    if (isError) {
        return (
            <ErrorState
                title="Failed to Load"
                message="Could not load tier ranking data"
                onRetry={() => refetch()}
                fullScreen
            />
        );
    }

    const topThree = leaderboard.slice(0, 3);
    const rest = leaderboard.slice(3);

    const renderBadge = (item: TierRankingEntry, scale = 1) => {
        if (!item) return null;
        const isGold = item.rank === 1;
        const color = isGold ? '#FFD700' : item.rank === 2 ? '#C0C0C0' : '#CD7F32';

        return (
            <View style={[styles.badgeContainer, { transform: [{ scale }] }]}>
                <Feather name="award" size={40} color={color} style={styles.badgeIcon} />
                <ThemedText type="small" style={{ color: color, fontWeight: '700', marginTop: 4 }}>{item.tier}</ThemedText>

                <View style={[styles.avatarContainer, { borderColor: color }]}>
                    <View style={[styles.avatarPlaceholder, { backgroundColor: color + '40' }]}>
                        <ThemedText style={{ fontWeight: '700' }}>{item.name[0]}</ThemedText>
                    </View>
                </View>

                <ThemedText type="body" style={{ fontWeight: '600', marginTop: 8 }}>{item.name}</ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>{item.score}</ThemedText>
            </View>
        );
    };

    // Calculate strength stats from leaderboard data
    const getStrengthData = () => {
        if (leaderboard.length === 0) return [];
        // Use actual scores to generate chart heights (normalized to 100)
        const maxScore = Math.max(...leaderboard.map(l => l.score));
        return leaderboard.slice(0, 7).map(entry => ({
            height: Math.round((entry.score / maxScore) * 100),
            label: entry.name.charAt(0)
        }));
    };

    const strengthData = getStrengthData();

    const renderBarChart = () => {
        if (strengthData.length === 0) {
            return (
                <View style={styles.chartContainer}>
                    <View style={styles.chartHeader}>
                        <ThemedText type="h4">Strength Stats</ThemedText>
                    </View>
                    <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: 'center', paddingVertical: Spacing.xl }}>
                        No strength data available yet
                    </ThemedText>
                </View>
            );
        }

        return (
            <View style={styles.chartContainer}>
                <View style={styles.chartHeader}>
                    <ThemedText type="h4">Strength Stats</ThemedText>
                    <View style={styles.filterPill}>
                        <ThemedText type="small">Top {strengthData.length}</ThemedText>
                    </View>
                </View>
                <View style={styles.chartBars}>
                    {strengthData.map((item, i) => (
                        <View key={`strength-bar-${i}`} style={styles.barColumn}>
                            <View style={[styles.bar, { height: item.height, backgroundColor: Colors.dark.neonCyan }]} />
                            <ThemedText type="small" style={styles.barLabel}>{item.label}</ThemedText>
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
            {/* Header ... */}
            <View style={[styles.header, { marginTop: insets.top }]}>
                <Pressable onPress={() => navigation.goBack()} style={{ padding: 8 }}>
                    <Feather name="chevron-left" size={24} color={theme.text} />
                </Pressable>
                <ThemedText type="h4" style={{ flex: 1, textAlign: 'center', marginRight: 32 }}>
                    Hypertrophy Tier Ranking
                </ThemedText>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: Spacing.xl }}>
                {/* Top 3 Badges */}
                <View style={styles.topThreeContainer}>
                    <AnimatedView entering={FadeInDown.delay(200).springify()}>
                        {renderBadge(topThree.find(i => i.rank === 2) as TierRankingEntry, 0.9)}
                    </AnimatedView>
                    <AnimatedView entering={FadeInDown.delay(100).springify()} style={{ marginTop: -30 }}>
                        {renderBadge(topThree.find(i => i.rank === 1) as TierRankingEntry, 1.1)}
                    </AnimatedView>
                    <AnimatedView entering={FadeInDown.delay(300).springify()}>
                        {renderBadge(topThree.find(i => i.rank === 3) as TierRankingEntry, 0.9)}
                    </AnimatedView>
                </View>

                {/* List */}
                <View style={styles.listContainer}>
                    {rest.map((item, index) => (
                        <AnimatedView
                            key={item.rank}
                            entering={FadeInUp.delay(400 + index * 100)}
                            style={[styles.listItem, { backgroundColor: theme.surface }]}
                        >
                            <View style={styles.rankNumber}>
                                <Feather name="shield" size={16} color={Colors.brand} />
                            </View>
                            <View style={styles.listAvatar}>
                                <ThemedText>{item.name[0]}</ThemedText>
                            </View>
                            <View style={{ flex: 1 }}>
                                <ThemedText style={{ fontWeight: '600' }}>{item.name}</ThemedText>
                                <ThemedText type="small" style={{ color: theme.textSecondary }}>{item.tier} Tier</ThemedText>
                            </View>
                            <ThemedText style={{ fontWeight: '700' }}>{item.score}</ThemedText>
                        </AnimatedView>
                    ))}
                </View>

                {/* Strength Stats */}
                <AnimatedView entering={FadeInUp.delay(600)}>
                    {renderBarChart()}
                </AnimatedView>
            </ScrollView>
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
    topThreeContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.xl,
        gap: Spacing.md,
    },
    badgeContainer: {
        alignItems: 'center',
    },
    badgeIcon: {
        marginBottom: -10,
        zIndex: 1,
    },
    avatarContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 2,
        marginTop: 8,
        overflow: 'hidden',
    },
    avatarPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.xl,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.sm,
        gap: Spacing.md,
    },
    rankNumber: {
        width: 24,
        alignItems: 'center',
    },
    listAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
    },
    chartContainer: {
        paddingHorizontal: Spacing.lg,
    },
    chartHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    filterPill: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 16,
    },
    chartBars: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 150,
        paddingBottom: 20,
    },
    barColumn: {
        alignItems: 'center',
        gap: 8,
    },
    bar: {
        width: 8,
        borderRadius: 4,
    },
    barLabel: {
        opacity: 0.5,
    }
});
