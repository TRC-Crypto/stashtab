/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        yield: {
          light: "#00ff88",
          DEFAULT: "#00d974",
          dark: "#00b861",
        },
        surface: {
          50: "#18181b",
          100: "#1f1f23",
          200: "#27272a",
          300: "#3f3f46",
          400: "#52525b",
        },
      },
    },
  },
  plugins: [],
};

