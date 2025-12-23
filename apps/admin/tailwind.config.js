/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Admin theme - slightly different accent for distinction
        accent: {
          light: "#60a5fa",
          DEFAULT: "#3b82f6",
          dark: "#2563eb",
        },
        surface: {
          50: "#18181b",
          100: "#1f1f23",
          200: "#27272a",
          300: "#3f3f46",
          400: "#52525b",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

