import { Platform } from "react-native";

// Premium dark theme - cyan accent matching reference mockups
export const Colors = {
  // Brand colors - cyan/teal accent from reference mockups
  brand: "#00D7C7",          // Cyan/teal (primary accent)
  brandSoft: "#00E5D3",      // Lighter cyan for hover states
  accent: "#00D084",         // Gains green (success)
  accentSoft: "#00D08420",   // Transparent accent for backgrounds

  // Status colors
  green: "#00D084",          // Success/gains
  blue: "#4A90E2",           // Info
  red: "#FF3B30",            // Error/danger
  orange: "#FFB800",         // Warning/form correction
  yellow: "#FFB800",         // Same as orange for consistency
  purple: "#BD10E0",         // Accent purple

  // Light theme (fallback - app defaults to dark)
  light: {
    text: "#FFFFFF",
    textSecondary: "#ABABAB",
    buttonText: "#0A0A0A",
    tabIconDefault: "#666666",
    tabIconSelected: "#00D7C7",
    link: "#4A90E2",
    background: "#0A0A0A",
    backgroundRoot: "#0A0A0A",
    backgroundDefault: "#1C1C1E",
    backgroundSecondary: "#2C2C2E",
    backgroundTertiary: "#3C3C3E",
    border: "#3C3C3E",
    success: "#00D084",
    warning: "#FFB800",
    error: "#FF3B30",
    info: "#4A90E2",
    primary: "#00D7C7",
    protein: "#4A90E2",
    carbs: "#F5A623",
    fat: "#00D084",
    chartColors: ["#00D7C7", "#00D084", "#4A90E2", "#F5A623", "#BD10E0"],
    surface: "#1C1C1E",
    surfaceAlt: "#2C2C2E",
    cardShadow: "rgba(0, 0, 0, 0.3)",
  },

  // Dark theme (primary)
  dark: {
    text: "#FFFFFF",
    textSecondary: "#ABABAB",
    buttonText: "#FFFFFF",
    tabIconDefault: "#666666",
    tabIconSelected: "#00D7C7",
    link: "#4A90E2",
    background: "#0A0A0A",           // Near-black
    backgroundRoot: "#0A0A0A",
    backgroundDefault: "#1C1C1E",    // Dark gray cards
    backgroundSecondary: "#2C2C2E",  // Surface elevated
    backgroundTertiary: "#3C3C3E",
    border: "#3C3C3E",
    success: "#00D084",              // Gains green
    warning: "#FFB800",              // Form correction yellow
    error: "#FF3B30",
    info: "#4A90E2",
    primary: "#00D7C7",              // Cyan/teal accent
    protein: "#4A90E2",
    carbs: "#F5A623",
    fat: "#00D084",
    chartColors: ["#00D7C7", "#00D084", "#4A90E2", "#F5A623", "#BD10E0"],
    surface: "#1C1C1E",
    surfaceAlt: "#2C2C2E",
    cardShadow: "rgba(0, 0, 0, 0.5)",

    // Glow/neon effects for premium feel
    neonCyan: "#00D084",
    neonBlue: "#4A90E2",
    neonTeal: "#00D084",
    neonAmber: "#F5A623",
    neonOrange: "#FF6B3D",
    neonPink: "#F472B6",
    neonGreen: "#00D084",
    glowCyan: "rgba(0, 208, 132, 0.25)",
    glowBlue: "rgba(74, 144, 226, 0.25)",
    glowTeal: "rgba(0, 208, 132, 0.25)",
    glowAmber: "rgba(245, 166, 35, 0.25)",
    glowOrange: "rgba(255, 107, 61, 0.3)",
    panelBackground: "rgba(28, 28, 30, 0.95)",
    panelBorder: "rgba(60, 60, 62, 0.6)",

    // Gradient colors
    gradientStart: "#00D7C7",
    gradientEnd: "#00E5D3",
    gradientSuccess: ["#00D084", "#00B875"],
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  inputHeight: 52,
  buttonHeight: 56,
};

export const BorderRadius = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 20,
  xl: 26,
  "2xl": 32,
  "3xl": 40,
  full: 9999,
};

export const Typography = {
  h1: {
    fontSize: 34,
    lineHeight: 42,
    fontWeight: "700" as const,
  },
  h2: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "700" as const,
  },
  h3: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "600" as const,
  },
  h4: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "400" as const,
  },
  link: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500" as const,
  },
  data: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "600" as const,
    fontFamily: Platform.select({
      ios: "ui-monospace",
      android: "monospace",
      default: "monospace",
    }),
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

// Shadow styles for cards
export const Shadows = {
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardHover: {
    shadowColor: Colors.brand,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  button: {
    shadowColor: Colors.brand,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
};
