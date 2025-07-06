/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
        cormorant: ['Cormorant Garamond', 'serif'],
        unifraktur: ['UnifrakturMaguntia', 'cursive']
      },
      colors: {
        midnight: 'rgb(var(--color-midnight))',
        burgundy: 'rgb(var(--color-burgundy))',
        parchment: 'rgb(var(--color-parchment))',
        mystic: {
          900: '#1a1a2e',
          800: '#2d2d44',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};