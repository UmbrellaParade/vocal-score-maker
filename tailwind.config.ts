import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#080b12",
        panel: "#111827",
        rain: "#22d3ee",
        coral: "#fb7185",
        moss: "#84cc16",
        amberline: "#f59e0b",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(34, 211, 238, 0.18), 0 20px 60px rgba(0, 0, 0, 0.32)",
      },
    },
  },
  plugins: [],
};

export default config;
