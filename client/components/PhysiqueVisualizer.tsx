import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Svg, { Path, Circle, Defs, LinearGradient, Stop, G, Rect } from "react-native-svg";
import Animated, {
    useSharedValue,
    useAnimatedProps,
    withRepeat,
    withTiming,
    Easing
} from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/theme";

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface PhysiqueVisualizerProps {
    bodyFat: number;
    proportions: number;
    muscleGroups: Record<string, "strength" | "weakness" | "neutral">;
}

const { width } = Dimensions.get("window");

export function PhysiqueVisualizer({ bodyFat, proportions, muscleGroups }: PhysiqueVisualizerProps) {
    const scanLineY = useSharedValue(0);

    useEffect(() => {
        scanLineY.value = withRepeat(
            withTiming(400, { duration: 3000, easing: Easing.linear }),
            -1,
            false
        );
    }, []);

    const getColor = (group: string) => {
        const status = muscleGroups[group];
        if (status === "strength") return Colors.dark.success; // Green
        if (status === "weakness") return Colors.dark.error;   // Red
        return "rgba(0, 215, 199, 0.3)"; // Cyan default low opacity
    };

    const chestColor = getColor("chest");
    const absColor = getColor("abs");
    const legsColor = getColor("legs");
    const armsColor = getColor("arms");

    return (
        <View style={styles.container}>
            <Svg width={300} height={420} viewBox="0 0 300 420">
                <Defs>
                    <LinearGradient id="scanGradient" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0" stopColor="transparent" stopOpacity="0" />
                        <Stop offset="0.5" stopColor={Colors.dark.neonCyan} stopOpacity="0.8" />
                        <Stop offset="1" stopColor="transparent" stopOpacity="0" />
                    </LinearGradient>
                </Defs>

                {/* --- BODY WIREFRAME -- */}

                {/* Head */}
                <Circle cx="150" cy="40" r="25" stroke={Colors.dark.neonCyan} strokeWidth="2" fill="none" opacity="0.6" />

                {/* Neck */}
                <Path d="M135 60 L135 80 L165 80 L165 60" stroke={Colors.dark.neonCyan} strokeWidth="2" fill="none" opacity="0.6" />

                {/* Chest (Pecs) */}
                <G>
                    <Path
                        d="M100 80 L200 80 L190 140 L150 150 L110 140 Z"
                        stroke={chestColor}
                        strokeWidth="2"
                        fill={chestColor}
                        fillOpacity="0.1"
                    />
                    <Path d="M150 80 L150 150" stroke={Colors.dark.backgroundRoot} strokeWidth="2" />
                </G>

                {/* Abs */}
                <G>
                    <Path
                        d="M120 150 L180 150 L175 240 L125 240 Z"
                        stroke={absColor}
                        strokeWidth="2"
                        fill={absColor}
                        fillOpacity="0.1"
                    />
                    {/* Ab lines */}
                    <Path d="M120 180 L180 180" stroke={absColor} strokeWidth="1" opacity="0.5" />
                    <Path d="M122 210 L178 210" stroke={absColor} strokeWidth="1" opacity="0.5" />
                    <Path d="M150 150 L150 240" stroke={absColor} strokeWidth="1" opacity="0.5" />
                </G>

                {/* Shoulders // Delts */}
                <Path d="M100 80 L70 95 L75 130 L105 110 Z" stroke={armsColor} strokeWidth="2" fill={armsColor} fillOpacity="0.1" />
                <Path d="M200 80 L230 95 L225 130 L195 110 Z" stroke={armsColor} strokeWidth="2" fill={armsColor} fillOpacity="0.1" />

                {/* Arms // Biceps/Triceps */}
                <Path d="M70 130 L60 200 L85 200 L95 130 Z" stroke={armsColor} strokeWidth="2" fill={armsColor} fillOpacity="0.1" />
                <Path d="M230 130 L240 200 L215 200 L205 130 Z" stroke={armsColor} strokeWidth="2" fill={armsColor} fillOpacity="0.1" />

                {/* Forearms */}
                <Path d="M60 200 L50 270 L80 270 L85 200 Z" stroke={armsColor} strokeWidth="2" fill="none" opacity="0.4" />
                <Path d="M240 200 L250 270 L220 270 L215 200 Z" stroke={armsColor} strokeWidth="2" fill="none" opacity="0.4" />

                {/* Hips */}
                <Path d="M125 240 L175 240 L190 270 L110 270 Z" stroke={legsColor} strokeWidth="2" fill={legsColor} fillOpacity="0.1" />

                {/* Legs // Quads */}
                <G>
                    <Path
                        d="M110 270 L145 270 L140 380 L115 380 Z"
                        stroke={legsColor}
                        strokeWidth="2"
                        fill={legsColor}
                        fillOpacity="0.1"
                    />
                    <Path
                        d="M190 270 L155 270 L160 380 L185 380 Z"
                        stroke={legsColor}
                        strokeWidth="2"
                        fill={legsColor}
                        fillOpacity="0.1"
                    />
                </G>

                {/* Calves */}
                <Path d="M115 380 L140 380 L135 450 L120 450 Z" stroke={legsColor} strokeWidth="2" fill="none" opacity="0.4" />
                <Path d="M185 380 L160 380 L165 450 L180 450 Z" stroke={legsColor} strokeWidth="2" fill="none" opacity="0.4" />

            </Svg>

            {/* Floating Stats Labels */}
            <View style={[styles.statBadge, { top: 80, left: 0 }]}>
                <ThemedText type="small" style={{ color: Colors.dark.error, fontWeight: '700' }}>Body Fat</ThemedText>
                <ThemedText type="h4" style={{ color: Colors.dark.error }}>{bodyFat}%</ThemedText>
            </View>

            <View style={[styles.statBadge, { top: 80, right: 0 }]}>
                <ThemedText type="small" style={{ color: Colors.dark.success, fontWeight: '700' }}>Proportions</ThemedText>
                <ThemedText type="h4" style={{ color: Colors.dark.success }}>{proportions.toFixed(2)}</ThemedText>
                <View style={[styles.tag, { backgroundColor: 'rgba(46, 204, 113, 0.2)' }]}>
                    <ThemedText type="small" style={{ fontSize: 10, color: Colors.dark.success }}>Greek God</ThemedText>
                </View>
            </View>

            <View style={[styles.statBadge, { bottom: 100, left: 10 }]}>
                <ThemedText type="small" style={{ color: Colors.dark.success }}>Body Fat</ThemedText>
                <ThemedText type="h4" style={{ color: Colors.dark.success }}>37%</ThemedText>
            </View>
            <View style={[styles.statBadge, { bottom: 100, right: 10 }]}>
                <ThemedText type="small" style={{ color: Colors.dark.success }}>Proportions</ThemedText>
                <ThemedText type="h4" style={{ color: Colors.dark.success }}>115</ThemedText>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        justifyContent: "center",
        height: 450,
    },
    statBadge: {
        position: 'absolute',
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 8,
        borderRadius: 8,
        alignItems: 'center',
    },
    tag: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginTop: 2,
    }
});
