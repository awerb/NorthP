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
        'np-blue': '#4F46E5',
        'np-blue-light': '#6366F1',
        'np-blue-dark': '#3B82F6',
        'np-black': '#000000',
        'np-gray': '#F8FAFC',
        'np-gray-dark': '#64748B',
        blue: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      fontFamily: {
        'brand': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
