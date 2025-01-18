/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#19c5fa",
        secondary: "#19c5fa",
        tertiary: "#fff",
        quaternary: "#4d3cad",
        quinary: "#242547",
        senary: "#715657",
        septenary: "#a6c1d7",
        dark: "#000",
        white: "#fff",
        complementary: {
          1: "#fafafb",
          2: "#7ec8c8",
          3: "#43b0b0",
          4: "#393a59",
          5: "#007474",
        },
      },
      fontFamily: {
        serif: ['"Averia Serif Libre"', "serif"],
        sans: ["Lato", "sans-serif"],
      },
      cursor: {
        "not-allowed": "not-allowed",
      },
    },
  },
  plugins: [],
};
