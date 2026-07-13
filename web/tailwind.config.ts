import type { Config } from "tailwindcss";

/**
 * Tailwind theme mapped onto the CSS-variable design tokens in globals.css.
 * Components reference semantic names (primary, surface, positive…) so light
 * and dark mode are a single class flip on <html>.
 */
const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        surface: "hsl(var(--surface))",
        "surface-raised": "hsl(var(--surface-raised))",
        foreground: "hsl(var(--text))",
        muted: "hsl(var(--text-muted))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: "hsl(var(--secondary))",
        accent: "hsl(var(--accent))",
        gold: "hsl(var(--gold))",
        positive: "hsl(var(--positive))",
        warning: "hsl(var(--warning))",
        negative: "hsl(var(--negative))",
        info: "hsl(var(--info))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
          6: "hsl(var(--chart-6))",
        },
      },
      borderColor: {
        border: "hsl(var(--border))",
        DEFAULT: "hsl(var(--border))",
      },
    },
  },
  plugins: [],
};
export default config;
