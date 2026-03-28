import { Text, type TextProps } from "react-native";

import { useTheme } from "@/hooks/useTheme";
import { Typography } from "@/constants/theme";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: "h1" | "h2" | "h3" | "h4" | "body" | "small" | "link" | "data";
  glow?: boolean;
  glowColor?: string;
  uppercase?: boolean;
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = "body",
  glow,
  glowColor,
  uppercase,
  ...rest
}: ThemedTextProps) {
  const { theme, isDark } = useTheme();

  const getColor = () => {
    if (isDark && darkColor) {
      return darkColor;
    }

    if (!isDark && lightColor) {
      return lightColor;
    }

    if (type === "link") {
      return theme.link;
    }

    return theme.text;
  };

  const getTypeStyle = () => {
    switch (type) {
      case "h1":
        return Typography.h1;
      case "h2":
        return Typography.h2;
      case "h3":
        return Typography.h3;
      case "h4":
        return Typography.h4;
      case "body":
        return Typography.body;
      case "small":
        return Typography.small;
      case "link":
        return Typography.link;
      case "data":
        return Typography.data;
      default:
        return Typography.body;
    }
  };

  const glowStyle = glow
    ? {
      textShadowColor: glowColor || theme.primary,
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 6,
    }
    : {};

  const textTransform = uppercase ? { textTransform: "uppercase" as const } : {};

  return (
    <Text
      style={[
        { color: getColor() },
        getTypeStyle(),
        glowStyle,
        textTransform,
        style,
      ]}
      {...rest}
    />
  );
}
