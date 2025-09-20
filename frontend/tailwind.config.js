/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        primary: {
          light: "#8b5cf6", // violet-500
          DEFAULT: "#6d28d9", // violet-700
          dark: "#5b21b6", // violet-800
        },
        secondary: {
          light: "#34d399", // emerald-400
          DEFAULT: "#10b981", // emerald-500
          dark: "#059669", // emerald-600
        },
        gray: {
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827",
        },
      },
    },
  },
  plugins: [],
};
