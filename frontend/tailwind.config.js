/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "media",
  theme: {
    extend: {
      // Colorway estrictamente blanco/negro/grises — sin verde ni naranja de marca
      colors: {
        ink: {
          DEFAULT: "#0a0a0a",
          900: "#0a0a0a",
          800: "#171717",
          700: "#262626",
        },
        paper: {
          DEFAULT: "#ffffff",
          50: "#fafafa",
          100: "#f5f5f5",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.06)",
      },
    },
  },
  plugins: [],
};
