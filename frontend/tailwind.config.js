/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      colors: {
        navy: '#0B1F3A',
        indigo: {
          DEFAULT: '#4F46E5',
          50: '#EEF2FF',
          700: '#4338CA'
        },
        teal: {
          DEFAULT: '#0EA5A4',
          50: '#F0FDFA',
          600: '#0D9488',
          700: '#0F766E'
        },
        ink: '#0F172A',
        mute: '#64748B',
        bg: '#F8FAFC'
      }
    }
  },
  plugins: []
};
