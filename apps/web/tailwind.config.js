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
        'np-blue': '#4F46E5',      // Primary Northpoint blue (matches logo)
        'np-blue-light': '#6366F1', // Secondary blue shade
        'np-blue-dark': '#3B82F6',  // Tertiary blue shade
        'np-black': '#000000',
        'np-gray': '#F8FAFC',      // Very light gray for backgrounds
        'np-gray-dark': '#64748B',  // For secondary text
        // Standard blue colors for utility classes
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
        // Primary brand font - Inter for clean, professional look
        'brand': ['"Inter"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        // Secondary font for headings
        'heading': ['"Inter"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        // Body text font
        sans: ['"Inter"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        'brand-lg': ['2rem', { lineHeight: '2.5rem', fontWeight: '700' }],
        'brand-md': ['1.5rem', { lineHeight: '2rem', fontWeight: '600' }],
        'brand-sm': ['1.125rem', { lineHeight: '1.5rem', fontWeight: '500' }],
      },
    },
  },
  plugins: [],
}
