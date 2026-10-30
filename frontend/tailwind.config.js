/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EFF6FF',  // Light blue background
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6', // Secondary blue
          600: '#2563EB', // Dominant Primary blue
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#172554', // Dark navy
          navy: '#172554',
          sidebar: '#0F172A',
        },
        surface: {
          DEFAULT: '#FFFFFF', // Card background
          subtle: '#F5F8FC',  // Main page background
          border: '#E2E8F0',  // Border
        },
        brand: {
          blue: '#2563EB',
          navy: '#172554',
          dark: '#0F172A',
          light: '#EFF6FF',
          bg: '#F5F8FC',
          card: '#FFFFFF',
          text: '#1E293B',
          muted: '#64748B',
          border: '#E2E8F0',
          success: '#15803D',
          warning: '#D97706',
          danger: '#DC2626',
        }
      },
      fontFamily: {
        sans: ['Arial', 'Helvetica', 'sans-serif'],
        nav: ['Helvetica', 'Arial', 'sans-serif'],
        serif: ['"Times New Roman"', 'Times', 'serif'],
        editorial: ['"Times New Roman"', 'Times', 'serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.04), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
      }
    },
  },
  plugins: [],
}
