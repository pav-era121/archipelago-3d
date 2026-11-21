/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        isle: {
          q1: '#ef4444', // Red / Crimson Volcanic Forge (Do)
          q2: '#10b981', // Emerald Zen Sanctuary (Schedule)
          q3: '#f59e0b', // Amber Dispatch Dock (Delegate)
          q4: '#8b5cf6', // Violet Cosmic Void (Eliminate)
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
