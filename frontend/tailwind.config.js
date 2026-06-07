/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        espana: {
          sand: '#F7F4EB',
          red: '#D01C1F',
          gold: '#FFC400',
          charcoal: '#1E293B',
        },
        brand: {
          light: '#F7F4EB',
          50: '#F7F4EB',   // Pueblo Blanco (Warm Sand Background)
          100: '#F0EAE0',  // Slightly darker sand for cards/buttons
          200: '#E3D8C6',  // Warm border divider
          300: '#D1C1AA',
          400: '#BCA78B',
          500: '#C86B32',  // Barro Cocido (Terracotta)
          600: '#A85827',
          700: '#684C2D',
          800: '#4C361F',
          900: '#1E293B',  // Charcoal text color
        },
        terracotta: '#C86B32',
        sand: '#F7F4EB',
        charcoal: '#1E293B',
        accent: {
          emerald: '#10b981',
          teal: '#14b8a6',
          indigo: '#D01C1F', // Rojo Sangría (Flag Red)
          violet: '#FFC400', // Oro Vivo (Flag Gold)
        },
        indigo: {
          50: '#FFF1F1',
          100: '#FFE1E1',
          200: '#FFC7C7',
          300: '#FFA0A0',
          400: '#FF6C6C',
          500: '#EA2E2E',
          600: '#D01C1F', // Rojo Sangría (Flag Red)
          700: '#B21316',
          800: '#930E11',
          900: '#7A0C0E',
        },
        violet: {
          50: '#FFFDF0',
          100: '#FFF8CC',
          200: '#FFF099',
          300: '#FFE566',
          400: '#FFD933',
          500: '#FFC400', // Oro Vivo (Flag Gold)
          600: '#DDAA00',
          700: '#B78D00',
          800: '#917000',
          900: '#705700',
        },
        purple: {
          50: '#FFFDF0',
          100: '#FFF8CC',
          200: '#FFF099',
          300: '#FFE566',
          400: '#FFD933',
          500: '#FFC400', // Oro Vivo (Flag Gold)
          600: '#DDAA00',
          700: '#B78D00',
          800: '#917000',
          900: '#705700',
        }
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
