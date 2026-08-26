/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          '"JetBrains Mono"',
          '"SF Mono"',
          'Menlo',
          'Consolas',
          'monospace',
        ],
      },
      colors: {
        canvas: '#09090b',
        surface: '#121215',
        'surface-subtle': '#18181b',
        'surface-elevated': '#202024',
        border: {
          subtle: '#27272a',
          DEFAULT: '#3f3f46',
          strong: '#52525b',
        },
        foreground: {
          DEFAULT: '#fafafa',
          secondary: '#a1a1aa',
          muted: '#71717a',
        },
        accent: {
          DEFAULT: '#3b82f6',
          hover: '#2563eb',
          subtle: 'rgba(59, 130, 246, 0.1)',
        },
        status: {
          success: '#10b981',
          'success-subtle': 'rgba(16, 185, 129, 0.12)',
          warning: '#f59e0b',
          'warning-subtle': 'rgba(245, 158, 11, 0.12)',
          danger: '#ef4444',
          'danger-subtle': 'rgba(239, 68, 68, 0.12)',
          info: '#0ea5e9',
          'info-subtle': 'rgba(14, 165, 233, 0.12)',
        },
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '10px',
        xl: '14px',
        '2xl': '18px',
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.35)',
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.4)',
        overlay: '0 12px 32px -4px rgba(0, 0, 0, 0.7), 0 4px 12px -2px rgba(0, 0, 0, 0.5)',
      },
    },
  },
  plugins: [],
};
