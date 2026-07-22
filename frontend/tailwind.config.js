/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#1E2A3C',
          light: '#334156',
        },
        paper: '#EDEBE3',
        brass: {
          DEFAULT: '#8A6A2E',
          light: '#B08F4C',
          dark: '#5F4A1F',
        },
        status: {
          draft: '#6B7280',
          pending: '#8A6A2E',
          active: '#2F5D3A',
          executed: '#1F4E4A',
          rejected: '#8C3A2E',
          expired: '#6B5D4F',
        },
      },
      fontFamily: {
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
