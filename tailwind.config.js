/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./screens/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./utils/**/*.{js,ts,jsx,tsx}"
  ],
  safelist: [
    'animate-shimmer',
    'animate-slideUp',
    'animate-slideDown',
    'animate-fadeIn',
    'animate-pulse',
    'animate-bounce',
    'animate-spin',
    'bg-gradient-to-r',
    'bg-gradient-to-br',
    'from-indigo-500',
    'via-violet-500',
    'to-purple-500',
    'from-indigo-50',
    'via-violet-50',
    'to-purple-50',
    'from-emerald-50',
    'to-green-50',
    'text-indigo-600',
    'text-indigo-700',
    'text-violet-700',
    'text-emerald-700',
    'border-indigo-100',
    'border-violet-100',
    'border-emerald-100'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      colors: {
        // Colores personalizados Tribu Impulsa
        'tribu-primary': '#6161FF',
        'tribu-success': '#00CA72',
        'tribu-warning': '#FFCC00',
        'tribu-danger': '#FB275D',
        'tribu-dark': '#181B34',
        'tribu-gray': '#7C8193',
        'tribu-light': '#F5F7FB'
      },
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
        'slideUp': 'slideUp 0.3s ease-out',
        'slideDown': 'slideDown 0.3s ease-out',
        'fadeIn': 'fadeIn 0.2s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        }
      }
    }
  },
  plugins: []
}
