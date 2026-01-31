/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1e1f24',
        sand: '#f6f4f1',
        stone: '#e8e0d8',
        accent: '#ff7a45',
        teal: '#1f7a8c',
        navy: '#223a5e',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 20px 60px rgba(30, 31, 36, 0.1)',
      },
      borderRadius: {
        xl: '18px',
      },
    },
  },
  plugins: [],
}
