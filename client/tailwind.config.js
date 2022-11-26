const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    fontFamily: {
      serif: ["Poppins", ...defaultTheme.fontFamily.serif],
    },
    extend: {},
  },
  plugins: [],
};
