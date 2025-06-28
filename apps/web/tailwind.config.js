/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'np-white': '#FFFFFF',
        'np-blue': '#2355FF',
        'np-black': '#000000',
        'np-gray': '#F2F2F2',
      },
      fontFamily: {
        instrument: ['"Instrument Sans"', 'sans-serif'],
        serif: ['"Cormorant Garamond"', 'serif'],
      },
    },
  },
  plugins: [],
}
