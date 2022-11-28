const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    fontFamily: {
      serif: ["Poppins", ...defaultTheme.fontFamily.serif],
    },
    extend: {
      colors: {
        neutral: {
          grey: "#404555",
          black: "#121317",
          divider: "#DCDEE5",
          charcoal: "#606880",
          light: "#F7F7F7",
        },
        accent: {
          "royal-blue": {
            4: "#2558E5",
          },
        },
        primary: {
          4: "#F1C12B",
          5: "#CDA425",
        },
        system: {
          danger: {
            4: "#D92D20",
          },
        },
      },
    },
  },
  plugins: [],
};
