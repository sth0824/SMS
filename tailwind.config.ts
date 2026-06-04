import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        samsung: {
          DEFAULT: "#1428A0",
          hover: "#2E4BC6",
          pale: "#EAEDF9",
          deep: "#0B1A6E",
        },
        tag: {
          vacation: "#FF6B4A",
          annual: "#16A085",
          training: "#8E44AD",
          out: "#F39C12",
          etc: "#717171",
        },
        gray: {
          900: "#1A1A1A",
          700: "#3C3C3C",
          500: "#717171",
          400: "#9A9A9A",
          300: "#D4D4D4",
          200: "#E5E7EB",
          100: "#F4F5F7",
        },
        success: "#16A085",
        danger: "#E74C3C",
        warning: "#F39C12",
      },
      fontFamily: {
        sans: ["Pretendard", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "12px",
        lg: "18px",
        xl: "24px",
      },
      boxShadow: {
        xs: "0 1px 2px rgba(16,24,64,0.04)",
        card: "0 1px 2px rgba(16,24,64,0.04), 0 4px 16px -8px rgba(16,24,64,0.08)",
        elevated:
          "0 2px 4px rgba(16,24,64,0.04), 0 12px 32px -12px rgba(16,24,64,0.14)",
        pop: "0 8px 16px -8px rgba(16,24,64,0.12), 0 24px 48px -16px rgba(16,24,64,0.24)",
        glow: "0 8px 24px -6px rgba(20,40,160,0.18)",
      },
    },
  },
  plugins: [],
};

export default config;
