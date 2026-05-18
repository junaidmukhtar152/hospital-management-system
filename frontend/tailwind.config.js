/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3498db',       // Main Blue
        secondary: '#1e3a8a',     // Dark Blue
        accent: '#2ecc71',        // Green
        danger: '#e74c3c',        // Red
        warning: '#f1c40f',       // Yellow
        lightblue: '#f0f7ff',     // Card background / light blue
        neutral: '#f4f7f6',       // Page background / gray
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
