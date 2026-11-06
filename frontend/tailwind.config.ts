import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#fafafa",
          raised: "#ffffff",
          sunken: "#f4f4f5",
        },
        line: {
          DEFAULT: "#e4e4e7",
          strong: "#d4d4d8",
        },
        ink: {
          DEFAULT: "#18181b",
          soft: "#52525b",
          faint: "#a1a1aa",
        },
        accent: {
          DEFAULT: "#0070ba",
          hover: "#005ea6",
          soft: "#e6f2fa",
        },
        success: {
          DEFAULT: "#059669",
          soft: "#d1fae5",
        },
        danger: {
          DEFAULT: "#e11d48",
          soft: "#ffe4e6",
        },
        warning: {
          DEFAULT: "#d97706",
          soft: "#fef3c7",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
