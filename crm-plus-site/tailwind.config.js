/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./styles/**/*.{css,scss}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: "#E10600",
          dark: "#070708",
          surface: "#0F0F10",
          border: "#1F1F22",
          text: "#C5C5C5",
        },
      },
    },
  },
  plugins: [],
};
