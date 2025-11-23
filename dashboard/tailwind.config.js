/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#0f0f23',
        'dark-card': '#1a1a3a',
        'dark-border': '#2a2a4a',
        'accent': '#4ecdc4',
        'text-primary': '#e0e0e0',
        'text-secondary': '#95a5a6',
      },
    },
  },
  plugins: [],
}


