/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./views/**/*.ejs",
    "./public/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        primaryBlue: '#0d47a1', // Reference ke hisaab se adjust kar lenge
        lightGray: '#f5f7fa',
      }
    },
  },
  plugins: [],
}