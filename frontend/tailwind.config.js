/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        // Intelly Design System Colors
        yellow: {
          50: "#FFFDF5",
          100: "#FFF9E6",
          200: "#FFF3CC",
          300: "#FFE66D", // Primary Yellow
        },
        pink: {
          50: "#FFF5FC",
          100: "#FFEAF8",
          200: "#FFB5E8", // Primary Pink
        },
        blue: {
          50: "#F5F9FF",
          100: "#E6F1FF",
          200: "#B4D4FF", // Primary Blue
        },
        green: {
          50: "#F7FBF7",
          100: "#E8F4E8",
          200: "#C1E1C1", // Primary Green
        },
        neutral: {
          50: "#F8F8F6",
          100: "#F0F0ED",
          200: "#E0E0DB",
          300: "#C8C8C0",
          400: "#A0A098",
          500: "#787870",
          600: "#5A5A54",
          700: "#3F3F3B",
          800: "#2A2A27",
          900: "#1A1A1A",
        },
      },
    },
  },
  plugins: [],
};
