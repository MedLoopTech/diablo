import type { Config } from "tailwindcss";

// Palette ported verbatim from design-reference/sehat-90-prototype.jsx (`C` object).
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#F3F7F3",
        card: "#FFFFFF",
        ink: "#0C332B",
        "ink-soft": "#4C6A61",
        line: "#DEE9E1",
        primary: "#14664F",
        "primary-deep": "#0C4A39",
        mint: "#E3F0E8",
        marigold: "#EFA63C",
        "marigold-soft": "#FBEED6",
        coral: "#DF5F4C",
        "coral-soft": "#FBE4DF",
        blue: "#3D7EA6",
        "frame-dark": "#06231D",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        body: ["var(--font-outfit)", "Segoe UI", "sans-serif"],
      },
      borderRadius: {
        card: "20px",
        sheet: "28px",
      },
    },
  },
  plugins: [],
};

export default config;
