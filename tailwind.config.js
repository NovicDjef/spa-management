/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Palette spa douce et apaisante
        spa: {
          rose: {
            50: '#fdf4f5',
            100: '#fce7ea',
            200: '#f9d0d6',
            300: '#f4a8b4',
            400: '#ed7a8e',
            500: '#e24965',
            600: '#d02e52',
            700: '#b02343',
            800: '#93203f',
            900: '#7d1f3a',
          },
          lavande: {
            50: '#f7f5fc',
            100: '#ede9f8',
            200: '#ddd6f3',
            300: '#c4b6ea',
            400: '#a78dde',
            500: '#8e67d0',
            600: '#7a4cbf',
            700: '#693da7',
            800: '#583589',
            900: '#4a2d70',
          },
          menthe: {
            50: '#f0fdf8',
            100: '#dcfcef',
            200: '#bbf7de',
            300: '#86efc6',
            400: '#4ddea7',
            500: '#26c68c',
            600: '#17a172',
            700: '#14805d',
            800: '#14654c',
            900: '#12533f',
          },
          beige: {
            50: '#faf9f7',
            100: '#f5f2ed',
            200: '#e8e2d8',
            300: '#d7cdbf',
            400: '#c2b4a0',
            500: '#af9b85',
            600: '#9b8571',
            700: '#816d5d',
            800: '#6b5c4f',
            900: '#584d43',
          },
        },
        primary: '#e24965', // Rose spa
        secondary: '#8e67d0', // Lavande
        accent: '#26c68c', // Menthe
        neutral: '#f5f2ed', // Beige clair
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(226, 73, 101, 0.1), 0 10px 20px -2px rgba(226, 73, 101, 0.04)',
        'soft-lg': '0 10px 40px -10px rgba(226, 73, 101, 0.15)',
      },
    },
  },
  plugins: [],
}
