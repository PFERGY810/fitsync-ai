// FitSync AI Design System - Main Theme Export
import { colors } from './colors';
import { typography } from './typography';
import { spacing, borderRadius, shadows, layout, animation } from './layout';

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  layout,
  animation,
} as const;

// Export individual modules for convenience
export { colors } from './colors';
export { typography } from './typography';
export { spacing, borderRadius, shadows, layout, animation } from './layout';

// Theme type for TypeScript
export type Theme = typeof theme;

// Common style combinations
export const commonStyles = {
  // Card styles
  card: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing[5],
    borderWidth: 1,
    borderColor: colors.border.primary,
    ...shadows.base,
  },

  // Button styles
  button: {
    primary: {
      backgroundColor: colors.primary[500],
      borderRadius: borderRadius.base,
      paddingVertical: spacing[3],
      paddingHorizontal: spacing[5],
      ...shadows.sm,
    },
    secondary: {
      backgroundColor: colors.background.tertiary,
      borderRadius: borderRadius.base,
      paddingVertical: spacing[3],
      paddingHorizontal: spacing[5],
      borderWidth: 1,
      borderColor: colors.border.primary,
    },
  },

  // Input styles
  input: {
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.base,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderWidth: 1,
    borderColor: colors.border.primary,
    color: colors.text.primary,
    fontSize: typography.fontSize.base,
  },

  // Text styles with colors
  text: {
    primary: {
      color: colors.text.primary,
      ...typography.textStyles.body,
    },
    secondary: {
      color: colors.text.secondary,
      ...typography.textStyles.body,
    },
    caption: {
      color: colors.text.tertiary,
      ...typography.textStyles.caption,
    },
  },

  // Layout containers
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },

  // Screen padding
  screenPadding: {
    paddingHorizontal: spacing[5],
  },

  // Section spacing
  section: {
    marginBottom: spacing[6],
  },
} as const;

export default theme;