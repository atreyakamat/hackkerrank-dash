/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        hr: {
          green: '#2EC866',
          'green-light': '#00EA64',
          'green-dark': '#097B3E',
          'green-hover': '#24a152',
          dark: '#0E141E',
          'dark-nav': '#1B2733',
          'dark-card': '#151F2C',
          'dark-card-hover': '#1B2838',
          'dark-border': '#263545',
          'dark-subtle': '#334559',
          gold: '#FFA116',
          'gold-light': '#FFC01E',
          silver: '#94A3B8',
          bronze: '#CD7F32',
          blue: '#3B82F6',
          purple: '#8B5CF6',
          light: '#F8FAFC',
          'light-card': '#FFFFFF',
          'light-border': '#E2E8F0',
          'light-hover': '#F1F5F9'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      boxShadow: {
        'glow-green': '0 0 20px -3px rgba(46, 200, 102, 0.3)',
        'glow-gold': '0 0 20px -3px rgba(255, 161, 22, 0.3)',
        'card-dark': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}
