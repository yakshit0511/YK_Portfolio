import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)', surface: 'var(--color-surface)', 'surface-2': 'var(--color-surface-2)',
        primary: 'var(--color-primary)', glow: 'var(--color-glow)', accent: 'var(--color-accent)',
        text: 'var(--color-text)', muted: 'var(--color-muted)',
      },
      fontFamily: {
        heading: ['Sora', 'sans-serif'], body: ['Inter', 'sans-serif'], mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config;
