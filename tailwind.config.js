/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
        background: 'rgb(var(--color-background) / <alpha-value>)',
        'background-light': 'rgb(var(--color-background-light) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        warning: 'rgb(var(--color-warning) / <alpha-value>)',
        'soft-blue': 'rgb(var(--color-soft-blue) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
      },
      boxShadow: {
        neon: '0 0 10px rgba(0, 0, 0, 0.1)',
        'neon-purple': '0 0 10px rgba(51, 51, 51, 0.1)',
        'neon-green': '0 0 10px rgba(102, 102, 102, 0.1)',
      },

      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
        'peep-blink': 'peep-blink 2s ease-in-out infinite',
      },
      keyframes: {
        'peep-blink': {
          '0%, 100%': { transform: 'scaleY(1)', opacity: 1 },
          '45%, 55%': { transform: 'scaleY(0.1)', opacity: 0.5 },
          '50%': { transform: 'scaleY(0)', opacity: 0 },
        }
      }
    },
  },
  plugins: []
};

