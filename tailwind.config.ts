import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#071019',
        panel: '#0b1622',
        panelSoft: '#102131',
        accent: '#78f5c2',
        accentSoft: '#3dd6a6',
        text: '#f4f7fb',
        muted: '#8aa1b6',
        border: 'rgba(148, 163, 184, 0.18)',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(120, 245, 194, 0.15), 0 24px 80px rgba(0, 0, 0, 0.35)',
      },
      backgroundImage: {
        'radial-grid':
          'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 0)',
      },
    },
  },
  plugins: [],
} satisfies Config;

