import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        base: {
          DEFAULT: "#0A0C10", // primary background
          panel: "#12151C", // card / panel surface
          raised: "#171B23", // hovered / raised surface
          border: "#1F242E", // hairline borders
          borderStrong: "#2A303C",
        },
        ink: {
          DEFAULT: "#E6E9EF", // primary text
          muted: "#8B93A1", // secondary text
          faint: "#565D6B", // tertiary / disabled text
        },
        signal: {
          DEFAULT: "#4DD8C4", // primary accent — signal cyan
          dim: "#3AA396",
          glow: "#7FEADC",
        },
        amber: {
          DEFAULT: "#D9A45B", // secondary accent — used sparingly
          dim: "#B8894A",
        },
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        body: ["var(--font-plex-sans)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
      backgroundImage: {
        "fine-grid":
          "linear-gradient(to right, #1a1e26 1px, transparent 1px), linear-gradient(to bottom, #1a1e26 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "40px 40px",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out forwards",
        "fade-in": "fade-in 0.8s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
