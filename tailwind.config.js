/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./overlay.html",
    "./toolbar.html",
    "./src/renderer/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          bg: '#121316',
          panel: '#1e2024',
          accent: '#3b82f6',
          border: 'rgba(255, 255, 255, 0.1)',
        }
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glow': '0 0 15px rgba(59, 130, 246, 0.5)',
      }
    },
  },
  plugins: [],
};
