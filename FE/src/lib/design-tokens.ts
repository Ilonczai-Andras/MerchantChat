/**
 * MerchantChat Design Tokens
 * 
 * A carefully considered palette for a B2B chatbot admin panel.
 * The design prioritizes clarity and trust over trendiness.
 * 
 * Usage: Import this file in your Tailwind config and components
 */

export const colors = {
  // Primary: A sophisticated slate-blue that reads corporate without being cold
  primary: {
    50: "#f0f4f9",
    100: "#d9e4f1",
    200: "#b8cfe5",
    300: "#7fa8d1",
    400: "#5990c3",
    500: "#4078b5", // Main primary
    600: "#35639d",
    700: "#2d4f7e",
    800: "#263d5e",
    900: "#1f2d43",
  },

  // Accent: A warm terracotta for CTAs and highlights — human touch, not cold
  accent: {
    50: "#fef5f0",
    100: "#fee3d8",
    200: "#fcc5b3",
    300: "#f9a080",
    400: "#f57d52",
    500: "#e85c2f", // Main accent
    600: "#c94a24",
    700: "#a8361d",
    800: "#8b2a17",
    900: "#6f2114",
  },

  // Neutral: Grays with slight warm bias for approachability
  neutral: {
    50: "#f9f8f7",
    100: "#f1efed",
    200: "#e6e3e0",
    300: "#d6d1ca",
    400: "#b8ada3",
    500: "#9a8f86",
    600: "#7a7168",
    700: "#5d544a",
    800: "#423d36",
    900: "#2a251f",
  },

  // Semantic colors
  success: "#059669", // Emerald for positive actions
  warning: "#d97706", // Amber for caution
  error: "#dc2626", // Red for destructive actions
  info: "#0891b2", // Cyan for information

  // Backgrounds
  bg: {
    primary: "#ffffff",
    secondary: "#f9f8f7",
    tertiary: "#f1efed",
  },

  // Borders
  border: "#e6e3e0",
  
  // Text
  text: {
    primary: "#2a251f",
    secondary: "#5d544a",
    tertiary: "#9a8f86",
    inverse: "#ffffff",
  },
} as const;

export const typography = {
  // Display: Elegant serif for headlines — conveys reliability and craftsmanship
  display: {
    fontFamily: '"Merriweather", serif',
    weights: {
      bold: 700,
      semibold: 600,
    },
    sizes: {
      lg: { fontSize: "2.5rem", lineHeight: "1.2", letterSpacing: "-0.02em" }, // ~40px
      md: { fontSize: "2rem", lineHeight: "1.25", letterSpacing: "-0.015em" }, // ~32px
      sm: { fontSize: "1.5rem", lineHeight: "1.3", letterSpacing: "-0.01em" }, // ~24px
    },
  },

  // Body: Clean, modern sans-serif for readability
  body: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    weights: {
      regular: 400,
      medium: 500,
      semibold: 600,
    },
    sizes: {
      lg: { fontSize: "1.125rem", lineHeight: "1.5" }, // ~18px
      base: { fontSize: "1rem", lineHeight: "1.6" }, // ~16px
      sm: { fontSize: "0.875rem", lineHeight: "1.5" }, // ~14px
      xs: { fontSize: "0.75rem", lineHeight: "1.4" }, // ~12px
    },
  },

  // Mono: For codes, variables, technical content
  mono: {
    fontFamily: '"Fira Code", "Courier New", monospace',
    weights: {
      regular: 400,
      medium: 500,
    },
  },
} as const;

export const spacing = {
  xs: "0.25rem", // 4px
  sm: "0.5rem", // 8px
  md: "1rem", // 16px
  lg: "1.5rem", // 24px
  xl: "2rem", // 32px
  "2xl": "3rem", // 48px
  "3xl": "4rem", // 64px
} as const;

export const borderRadius = {
  none: "0",
  sm: "0.25rem", // 4px — minimal, professional
  md: "0.5rem", // 8px
  lg: "0.75rem", // 12px
  xl: "1rem", // 16px
  full: "9999px",
} as const;

export const shadows = {
  none: "none",
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
} as const;

// Animation: Subtle, human-paced
export const animation = {
  duration: {
    fast: "150ms",
    base: "250ms",
    slow: "350ms",
  },
  easing: {
    easeOut: "cubic-bezier(0.4, 0, 0.2, 1)",
    easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
} as const;