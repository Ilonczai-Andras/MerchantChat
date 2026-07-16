import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Base Brand Colors
        brand: {
          primary: "var(--color-brand-primary)",
          secondary: "var(--color-brand-secondary)",
          accent: "var(--color-brand-accent)",
          dark: "var(--color-brand-dark)",
        },
        // Semantic System Colors
        success: "var(--color-success-500)",
        warning: "var(--color-warning-500)",
        error: "var(--color-error-500)",
        info: "var(--color-info-500)",
      },

      backgroundColor: {
        primary: "var(--color-brand-primary)",
        secondary: "var(--color-brand-secondary)",
        tertiary: "var(--color-brand-tertiary)",
      },

      textColor: {
        primary: "var(--color-text-primary)",
        secondary: "var(--color-text-secondary)",
        tertiary: "var(--color-text-tertiary)",
        quaternary: "var(--color-text-quaternary)",
        muted: "var(--color-text-muted)",
        inverse: "var(--color-text-inverse)",
      },

      borderColor: {
        base: "var(--color-border)",
        light: "var(--color-border-light)",
        strong: "var(--color-border-strong)",
      },

      fontFamily: {
        serif: "var(--font-serif)",
        sans: "var(--font-sans)",
        mono: "var(--font-mono)",
      },

      fontWeight: {
        thin: "var(--font-weight-thin)",
        normal: "var(--font-weight-regular)",
        medium: "var(--font-weight-medium)",
        semibold: "var(--font-weight-semibold)",
        bold: "var(--font-weight-bold)",
      },

      spacing: {
        xs: "var(--spacing-xs)",
        sm: "var(--spacing-sm)",
        md: "var(--spacing-md)",
        lg: "var(--spacing-lg)",
        xl: "var(--spacing-xl)",
        "2xl": "var(--spacing-2xl)",
        "3xl": "var(--spacing-3xl)",
        "4xl": "var(--spacing-4xl)",
      },

      borderRadius: {
        none: "var(--radius-none)",
        xs: "var(--radius-xs)",
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        "3xl": "var(--radius-3xl)",
        full: "var(--radius-full)",
      },

      boxShadow: {
        none: "var(--shadow-none)",
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        base: "var(--shadow-md)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        "2xl": "var(--shadow-2xl)",
        inner: "var(--shadow-inner)",
        "elevation-1": "var(--shadow-elevation-1)",
        "elevation-2": "var(--shadow-elevation-2)",
        "elevation-3": "var(--shadow-elevation-3)",
        "elevation-4": "var(--shadow-elevation-4)",
      },

      transitionDuration: {
        fast: "var(--animation-duration-fast)",
        base: "var(--animation-duration-base)",
        slow: "var(--animation-duration-slow)",
      },

      zIndex: {
        hide: "var(--z-index-hide)",
        base: "var(--z-index-base)",
        dropdown: "var(--z-index-dropdown)",
        sticky: "var(--z-index-sticky)",
        fixed: "var(--z-index-fixed)",
        "modal-backdrop": "var(--z-index-modal-backdrop)",
        modal: "var(--z-index-modal)",
        popover: "var(--z-index-popover)",
        tooltip: "var(--z-index-tooltip)",
        notification: "var(--z-index-notification)",
      },
    },
  },
  plugins: [],
};

export default config;