/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: 'rgb(var(--color-ink) / <alpha-value>)',
        faint: 'rgb(var(--color-faint) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        'accent-hover': 'rgb(var(--color-accent-hover) / <alpha-value>)',
        warn: 'rgb(var(--color-warn) / <alpha-value>)',
        bg: 'rgb(var(--color-bg) / <alpha-value>)',
        glow: 'var(--color-glow)',
      },
      boxShadow: {
        glow: 'var(--shadow-glow)',
      },
      fontFamily: {
        serif: ['"Linux Libertine"', '"Georgia"', '"Times New Roman"', 'serif'],
        sans: ['"Helvetica Neue"', '"Helvetica"', '"Arial"', 'sans-serif'],
        mono: ['"Cousine"', '"Courier New"', 'monospace'],
      },
      fontSize: {
        'title-xl': ['1.75rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'title-lg': ['1.4rem', { lineHeight: '1.25' }],
        'title-md': ['1.15rem', { lineHeight: '1.3' }],
      },
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
      },
      maxWidth: {
        content: '960px',
      },
    },
  },
  plugins: [],
};
