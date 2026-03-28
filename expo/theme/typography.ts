// FitSync AI Design System - Typography
export const typography = {
  // Font Families
  fontFamily: {
    primary: 'System', // Uses system font for best performance
    mono: 'Courier New',
  },

  // Font Sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 36,
    '6xl': 48,
    '7xl': 56,
    '8xl': 64,
  },

  // Font Weights
  fontWeight: {
    thin: '100' as const,
    extralight: '200' as const,
    light: '300' as const,
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
    black: '900' as const,
  },

  // Line Heights
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  // Letter Spacing
  letterSpacing: {
    tighter: -0.5,
    tight: -0.25,
    normal: 0,
    wide: 0.25,
    wider: 0.5,
    widest: 1,
  },

  // Text Styles (Predefined combinations)
  textStyles: {
    // Headers
    h1: {
      fontSize: 32,
      fontWeight: '700' as const,
      lineHeight: 1.25,
      letterSpacing: -0.5,
    },
    h2: {
      fontSize: 28,
      fontWeight: '600' as const,
      lineHeight: 1.25,
      letterSpacing: -0.25,
    },
    h3: {
      fontSize: 24,
      fontWeight: '600' as const,
      lineHeight: 1.375,
    },
    h4: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 1.375,
    },
    h5: {
      fontSize: 18,
      fontWeight: '500' as const,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: 16,
      fontWeight: '500' as const,
      lineHeight: 1.5,
    },

    // Body Text
    bodyLarge: {
      fontSize: 18,
      fontWeight: '400' as const,
      lineHeight: 1.625,
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 1.5,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 1.5,
    },

    // Labels and Captions
    label: {
      fontSize: 14,
      fontWeight: '500' as const,
      lineHeight: 1.375,
    },
    labelSmall: {
      fontSize: 12,
      fontWeight: '500' as const,
      lineHeight: 1.375,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 1.375,
    },

    // Buttons
    buttonLarge: {
      fontSize: 18,
      fontWeight: '600' as const,
      lineHeight: 1.25,
    },
    button: {
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 1.25,
    },
    buttonSmall: {
      fontSize: 14,
      fontWeight: '600' as const,
      lineHeight: 1.25,
    },

    // Special Text
    overline: {
      fontSize: 12,
      fontWeight: '600' as const,
      lineHeight: 1.25,
      letterSpacing: 1,
      textTransform: 'uppercase' as const,
    },
    code: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 1.5,
      fontFamily: 'Courier New',
    },

    // Metrics and Numbers
    metric: {
      fontSize: 24,
      fontWeight: '700' as const,
      lineHeight: 1.25,
    },
    metricLarge: {
      fontSize: 32,
      fontWeight: '700' as const,
      lineHeight: 1.25,
    },
    metricSmall: {
      fontSize: 18,
      fontWeight: '600' as const,
      lineHeight: 1.25,
    },
  },
} as const;

// Typography utility functions
export const getTextStyle = (style: keyof typeof typography.textStyles) => {
  return typography.textStyles[style];
};

export const createTextStyle = (
  fontSize: number,
  fontWeight: keyof typeof typography.fontWeight,
  lineHeight?: number,
  letterSpacing?: number
) => ({
  fontSize,
  fontWeight: typography.fontWeight[fontWeight],
  lineHeight: lineHeight || typography.lineHeight.normal,
  letterSpacing: letterSpacing || typography.letterSpacing.normal,
});