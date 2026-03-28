import React from "react";
import {
    View,
    StyleSheet,
    Pressable,
    Keyboard,
    TouchableWithoutFeedback,
    ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { ProgressIndicator } from "@/components/ProgressIndicator";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing } from "@/constants/theme";

const AnimatedView = Animated.createAnimatedComponent(View);

interface OnboardingLayoutProps {
    children: React.ReactNode;
    step: number;
    totalSteps?: number;
    title: string;
    subtitle?: string;
    osVersion?: string;
    onContinue: () => void;
    canContinue?: boolean;
    continueText?: string;
    showBack?: boolean;
    onBack?: () => void;
    contentStyle?: ViewStyle;
}

export function OnboardingLayout({
    children,
    step,
    totalSteps = 6,
    title,
    subtitle,
    osVersion = "FITSYNC OS v2.0",
    onContinue,
    canContinue = true,
    continueText = "Continue",
    showBack = true,
    onBack,
    contentStyle,
}: OnboardingLayoutProps) {
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();
    const navigation = useNavigation();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            navigation.goBack();
        }
    };

    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    return (
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
            <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
                <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
                    {showBack && (
                        <Pressable onPress={handleBack} hitSlop={8}>
                            <Feather name="arrow-left" size={24} color={theme.text} />
                        </Pressable>
                    )}
                    <View style={{ flex: 1 }} />
                    <View style={{ width: 24 }} />
                </View>

                <AnimatedView entering={FadeInUp.duration(350)} style={[styles.content, contentStyle]}>
                    <ThemedText type="small" style={styles.osVersion} glow glowColor={Colors.dark.neonCyan}>
                        {osVersion}
                    </ThemedText>
                    <ProgressIndicator currentStep={step} totalSteps={totalSteps} />
                    <ThemedText type="h2" style={styles.title} glow glowColor={Colors.dark.neonCyan}>
                        {title}
                    </ThemedText>
                    {subtitle && (
                        <ThemedText
                            type="body"
                            style={[styles.subtitle, { color: theme.textSecondary }]}
                        >
                            {subtitle}
                        </ThemedText>
                    )}
                    {children}
                </AnimatedView>

                <AnimatedView
                    entering={FadeInUp.delay(120).duration(350)}
                    style={[styles.footer, { paddingBottom: insets.bottom + Spacing.lg }]}
                >
                    <Button onPress={onContinue} disabled={!canContinue}>
                        {continueText}
                    </Button>
                </AnimatedView>
            </View>
        </TouchableWithoutFeedback>
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
    content: {
        flex: 1,
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.xl,
    },
    osVersion: {
        alignSelf: "center",
        fontSize: 11,
        letterSpacing: 1,
        marginBottom: Spacing.md,
    },
    title: {
        marginBottom: Spacing.xs,
    },
    subtitle: {
        marginBottom: Spacing.xl,
    },
    footer: {
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.lg,
    },
});
