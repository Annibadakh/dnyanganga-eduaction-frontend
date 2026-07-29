/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.15s ease-out',
      },
      colors: {
        primary: 'var(--primary-color)',
        secondary: 'var(--secondary)',
        tertiary: 'var(--tertiary)',
        customblack: 'var(--black)',
        customwhite: 'var(--white)',
        fourthcolor: 'var(--fourthcolor)',
        customgray: 'var(--gray)',
      },
      boxShadow: {
        custom: 'var(--box-shadow)',
      },
      fontFamily: {
        custom: ['Be Vietnam Pro', 'Times New Roman', 'serif'],
      },
      before: ['hover', 'focus'],
      after: ['hover', 'focus'],
    },
  },
  plugins: [],
}

