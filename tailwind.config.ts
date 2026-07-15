import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0A0A0B",
        panel: "#141416",
        panelAlt: "#1B1B1E",
        border: "#2A2A2D",
        gold: "#C9A961",
        goldBright: "#E4C878",
        silver: "#9CA1AA",
        off: "#F3EFE6",
        dim: "#7B7B80",
        danger: "#B4553F",
      },
      fontFamily: {
        display: ["var(--font-oswald)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
