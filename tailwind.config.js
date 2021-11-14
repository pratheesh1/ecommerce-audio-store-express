const { lightBlue, ...supportedColors } = require("tailwindcss/colors");

module.exports = {
  mode: "jit",
  purge: [
    "./views/**/*.{js,jsx,ts,tsx,hbs}",
    "./public/index.html",
    "./forms/**/*.{js,jsx,ts,tsx,hbs}",
  ],
  darkMode: "media", // or 'media' or 'class'
  theme: {
    extend: {
      colors: { ...supportedColors },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
