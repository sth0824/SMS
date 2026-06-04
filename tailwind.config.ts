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
        card: "10px",
        lg: "16px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        pop: "0 8px 24px rgba(0,0,0,0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
