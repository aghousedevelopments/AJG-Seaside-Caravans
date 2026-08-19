/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        sage: {
          50: "#f4f6f1",
          100: "#e6ebe0",
          200: "#cdd8c2",
          300: "#aec19c",
          400: "#8fa878",
          500: "#728d5c",
          600: "#587047",
          700: "#46583a",
          800: "#3a4830",
          900: "#313c2a",
          950: "#1a2015",
        },
        shell: {
          50: "#fdfbf7",
          100: "#faf5ec",
          200: "#f3e9d4",
        },
        tide: {
          600: "#b3382c",
          700: "#8f2c22",
        },
        accent: {
          50: "#fdf1ef",
          100: "#fbdedb",
          200: "#f5b7b0",
          300: "#ea8a7f",
          400: "#dc5f50",
          500: "#c8402e",
          600: "#a83124",
          700: "#8a271d",
          800: "#6f2019",
          900: "#5a1c17",
        },
      },
      fontFamily: {
        display: ["Georgia", "Cambria", "'Times New Roman'", "serif"],
        body: ["-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "Roboto", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 20px -4px rgba(49, 60, 42, 0.15)",
      },
    },
  },
  plugins: [],
};
