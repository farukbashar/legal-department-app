/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // "ink" now drives all primary text/dark surfaces — deep slate instead of navy
        ink: {
          DEFAULT: '#0F172A',
          light: '#475569',
        },
        // "paper" is now the cool app background instead of warm parchment
        paper: '#F1F5F9',
        // "brass" is now the primary accent — indigo instead of ochre
        brass: {
          DEFAULT: '#6366F1',
          light: '#818CF8',
          dark: '#4338CA',
        },
        status: {
          draft: '#64748B',
          pending: '#D97706',
          active: '#059669',
          executed: '#0E7490',
          rejected: '#DC2626',
          expired: '#78716C',
        },
      },
      fontFamily: {
        // headings render via font-serif across the app — repointed to a bold
        // display sans so every h1/h2 becomes modern-SaaS style automatically
        serif: ['"Inter"', 'system-ui', 'sans-serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        // every card/button/input in the app uses `rounded-sm` — bumping this
        // one token gives the whole product softer, more modern corners
        sm: '0.75rem',
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(15,23,42,0.04), 0 2px 8px -2px rgba(15,23,42,0.08)',
        'card-hover': '0 2px 4px 0 rgba(15,23,42,0.06), 0 8px 20px -4px rgba(15,23,42,0.12)',
      },
    },
  },
  plugins: [],
};
