// FitSync AI Design System - Spacing and Layout
export const spacing = {
  // Base spacing unit (4px)
  unit: 4,

  // Spacing scale
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
  32: 128,
  40: 160,
  48: 192,
  56: 224,
  64: 256,
} as const;

// Border radius scale
export const borderRadius = {
  none: 0,
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
} as const;

// Shadow definitions
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  base: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
} as const;

// Layout dimensions
export const layout = {
  // Screen breakpoints (for responsive design)
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  },

  // Container widths
  container: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  },

  // Common component sizes
  sizes: {
    // Button heights
    button: {
      sm: 32,
      base: 40,
      lg: 48,
      xl: 56,
    },

    // Input heights
    input: {
      sm: 32,
      base: 40,
      lg: 48,
    },

    // Icon sizes
    icon: {
      xs: 12,
      sm: 16,
      base: 20,
      lg: 24,
      xl: 32,
      '2xl': 40,
      '3xl': 48,
    },

    // Avatar sizes
    avatar: {
      xs: 24,
      sm: 32,
      base: 40,
      lg: 48,
      xl: 56,
      '2xl': 64,
      '3xl': 80,
    },

    // Card sizes
    card: {
      sm: 200,
      base: 300,
      lg: 400,
      xl: 500,
    },
  },

  // Z-index scale
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },
} as const;

// Animation and transition values
export const animation = {
  // Duration (in milliseconds)
  duration: {
    fast: 150,
    base: 200,
    slow: 300,
    slower: 500,
    slowest: 800,
  },

  // Easing curves
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },

  // Common animation presets
  presets: {
    fadeIn: {
      duration: 200,
      easing: 'ease-out',
    },
    slideIn: {
      duration: 300,
      easing: 'ease-out',
    },
    bounce: {
      duration: 500,
      easing: 'ease-out',
    },
    spring: {
      duration: 400,
      easing: 'ease-out',
    },
  },
} as const;

// Utility functions
export const getSpacing = (multiplier: keyof typeof spacing): number => {
  return spacing[multiplier];
};

export const createSpacing = (top: number, right?: number, bottom?: number, left?: number) => {
  return {
    paddingTop: top,
    paddingRight: right ?? top,
    paddingBottom: bottom ?? top,
    paddingLeft: left ?? right ?? top,
  };
};

export const createMargin = (top: number, right?: number, bottom?: number, left?: number) => {
  return {
    marginTop: top,
    marginRight: right ?? top,
    marginBottom: bottom ?? top,
    marginLeft: left ?? right ?? top,
  };
};