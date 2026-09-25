/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sarkari: {
          navy: '#0B2545',
          darkNavy: '#07182C',
          blue: '#134074',
          lightBlue: '#EEF4F8',
          saffron: '#E86100',
          lightSaffron: '#FFF4EB',
          green: '#107E3E',
          lightGreen: '#EAF7EE',
          gold: '#D97706',
          bg: '#F8FAFC',
          card: '#FFFFFF',
          border: '#E2E8F0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'sarkari': '0 4px 20px -2px rgba(11, 37, 69, 0.08), 0 2px 6px -1px rgba(11, 37, 69, 0.04)',
        'sarkari-hover': '0 12px 28px -4px rgba(11, 37, 69, 0.12), 0 4px 10px -2px rgba(11, 37, 69, 0.06)',
      },
    },
  },
  plugins: [],
};
