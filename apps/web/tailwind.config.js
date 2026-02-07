/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: '#202122',
        faint: '#54595d',
        border: '#a2a9b1',
        surface: '#f8f9fa',
        accent: '#3366cc',
        'accent-hover': '#2a4b8d',
        warn: '#b32424',
      },
      fontFamily: {
        serif: ['"Linux Libertine"', '"Georgia"', '"Times New Roman"', 'serif'],
        sans: ['"Helvetica Neue"', '"Helvetica"', '"Arial"', 'sans-serif'],
        mono: ['"Cousine"', '"Courier New"', 'monospace'],
      },
      fontSize: {
        'title-xl': ['2.4rem', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
        'title-lg': ['1.8rem', { lineHeight: '1.2' }],
        'title-md': ['1.35rem', { lineHeight: '1.3' }],
      },
      maxWidth: {
        content: '960px',
      },
    },
  },
  plugins: [],
};
