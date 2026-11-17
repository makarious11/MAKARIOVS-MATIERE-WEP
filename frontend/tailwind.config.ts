import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        paper: '#FDFBF7',
        paper2: '#F1EADA',
        ink: '#14110F',
        inkSoft: '#3A332D',
        wax: {
          DEFAULT: '#6B1D2F',
          light: '#8A1D2E',
          dark: '#521422',
        },
        gold: {
          DEFAULT: '#B08D57',
          light: '#C8A97A',
          dark: '#8C6E3D',
        },
      },
      fontFamily: {
        display: ['var(--font-cormorant)', 'Playfair Display', 'Georgia', 'serif'],
        script: ['var(--font-pinyon)', 'Italianno', 'cursive', 'serif'],
        body: ['var(--font-eb-garamond)', 'Jost', 'Georgia', 'serif'],
        arabic: ['var(--font-amiri)', 'serif'],
        'arabic-display': ['var(--font-noto-naskh)', 'var(--font-amiri)', 'serif'],
        'arabic-sans': ['var(--font-ibm-plex-arabic)', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        widest2: '0.25em',
        widest3: '0.35em',
        widest4: '0.45em',
      },
      transitionTimingFunction: {
        luxury: 'cubic-bezier(0.22, 1, 0.36, 1)',
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
