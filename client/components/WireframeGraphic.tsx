import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import Svg, { Path, Circle, Line } from "react-native-svg";
import { Colors } from "@/constants/theme";

interface WireframeGraphicProps {
  type: "barbell" | "dumbbell" | "body";
  size?: number;
  color?: string;
  style?: ViewStyle;
  opacity?: number;
}

export function WireframeGraphic({
  type,
  size = 200,
  color = Colors.dark.neonCyan,
  style,
  opacity = 0.3,
}: WireframeGraphicProps) {
  const renderBarbell = () => (
    <Svg width={size} height={size * 0.3} viewBox="0 0 200 60">
      {/* Bar */}
      <Line
        x1="20"
        y1="30"
        x2="180"
        y2="30"
        stroke={color}
        strokeWidth="2"
        opacity={opacity}
      />
      {/* Left weight */}
      <Path
        d="M 20 10 L 20 50 L 10 50 L 10 10 Z"
        fill="none"
        stroke={color}
        strokeWidth="2"
        opacity={opacity}
      />
      {/* Right weight */}
      <Path
        d="M 180 10 L 180 50 L 190 50 L 190 10 Z"
        fill="none"
        stroke={color}
        strokeWidth="2"
        opacity={opacity}
      />
      {/* Center collars */}
      <Circle cx="60" cy="30" r="3" fill={color} opacity={opacity} />
      <Circle cx="140" cy="30" r="3" fill={color} opacity={opacity} />
    </Svg>
  );

  const renderDumbbell = () => (
    <Svg width={size} height={size * 0.4} viewBox="0 0 200 80">
      {/* Left weight */}
      <Circle cx="30" cy="40" r="25" fill="none" stroke={color} strokeWidth="2" opacity={opacity} />
      {/* Right weight */}
      <Circle cx="170" cy="40" r="25" fill="none" stroke={color} strokeWidth="2" opacity={opacity} />
      {/* Handle */}
      <Line
        x1="55"
        y1="40"
        x2="145"
        y2="40"
        stroke={color}
        strokeWidth="3"
        opacity={opacity}
      />
      {/* Inner details */}
      <Circle cx="30" cy="40" r="15" fill="none" stroke={color} strokeWidth="1" opacity={opacity * 0.5} />
      <Circle cx="170" cy="40" r="15" fill="none" stroke={color} strokeWidth="1" opacity={opacity * 0.5} />
    </Svg>
  );

  const renderBody = () => (
    <Svg width={size} height={size * 1.5} viewBox="0 0 200 300">
      {/* Head */}
      <Circle cx="100" cy="30" r="20" fill="none" stroke={color} strokeWidth="2" opacity={opacity} />
      {/* Torso */}
      <Path
        d="M 100 50 L 100 150 L 80 150 L 80 120 L 100 120 L 100 50 Z"
        fill="none"
        stroke={color}
        strokeWidth="2"
        opacity={opacity}
      />
      <Path
        d="M 100 50 L 100 150 L 120 150 L 120 120 L 100 120 L 100 50 Z"
        fill="none"
        stroke={color}
        strokeWidth="2"
        opacity={opacity}
      />
      {/* Arms */}
      <Line x1="100" y1="80" x2="60" y2="100" stroke={color} strokeWidth="2" opacity={opacity} />
      <Line x1="100" y1="80" x2="140" y2="100" stroke={color} strokeWidth="2" opacity={opacity} />
      {/* Legs */}
      <Line x1="100" y1="150" x2="80" y2="250" stroke={color} strokeWidth="2" opacity={opacity} />
      <Line x1="100" y1="150" x2="120" y2="250" stroke={color} strokeWidth="2" opacity={opacity} />
    </Svg>
  );

  return (
    <View style={[styles.container, style]}>
      {type === "barbell" && renderBarbell()}
      {type === "dumbbell" && renderDumbbell()}
      {type === "body" && renderBody()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});
