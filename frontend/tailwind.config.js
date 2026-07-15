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
        // "Pine" — the primary brand hue, standing in for Tailwind's default
        // violet-* scale everywhere it's already used across the app.
        violet: {
          50: '#eefaf6',
          100: '#d3f3e9',
          200: '#a3e6d2',
          300: '#6dd3b8',
          400: '#3ab89c',
          500: '#1f9d84',
          600: '#14806b',
          700: '#106657',
          800: '#0f5145',
          900: '#0e423a',
          950: '#062621',
        },
        // "Gold" — the secondary/gradient-partner hue, standing in for
        // Tailwind's default indigo-* scale. Pine-to-Gold reads as a trail
        // map / sunrise-over-ridgeline, tying back to "Learning Path".
        indigo: {
          50: '#fff9eb',
          100: '#ffefc2',
          200: '#ffe08a',
          300: '#ffcb4d',
          400: '#ffb320',
          500: '#f59c0a',
          600: '#d97e06',
          700: '#b35f08',
          800: '#8f4a0c',
          900: '#763d0f',
          950: '#431f05',
        },
        primary: {
          50: '#eefaf6',
          100: '#d3f3e9',
          200: '#a3e6d2',
          300: '#6dd3b8',
          400: '#3ab89c',
          500: '#1f9d84',
          600: '#14806b',
          700: '#106657',
          800: '#0f5145',
          900: '#0e423a',
          950: '#062621',
        },
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'drift': 'drift 18s ease-in-out infinite',
      },
      keyframes: {
        drift: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(20px, -20px)' },
        },
      },
    },
  },
  plugins: [],
}
