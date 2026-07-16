import type { Config } from "tailwindcss";
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from "./src/lib/design-tokens";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ...colors.semantic,
        primary: colors.primary,
        accent: colors.accent,
        neutral: colors.neutral,
      },
      fontFamily: {
        sans: typography.body.fontFamily.split(","),
        serif: typography.display.fontFamily.split(","),
        mono: typography.mono.fontFamily.split(","),
      },
      spacing,
      borderRadius,
      boxShadow: shadows,
    },
  },
  plugins: [],
};

export default config;