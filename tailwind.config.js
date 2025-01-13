/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary-color)',
        secondary: 'var(--secondary)',
        tertiary: 'var(--tertiary)',
        customblack: 'var(--black)',
        customwhite: 'var(--white)',
      },
      boxShadow: {
        custom: 'var(--box-shadow)',
      },
      fontFamily: {
        custom: ['"Times New Roman"', 'serif'], 
      },
    },
  },
  plugins: [],
}

