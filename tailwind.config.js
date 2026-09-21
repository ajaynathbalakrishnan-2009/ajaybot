/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#0a0d14',
          'bg-light': '#f8fafc',
          sidebar: '#07090e',
          'sidebar-light': '#f1f5f9',
          surface: '#111726',
          'surface-light': '#ffffff',
          'surface-hover': '#172033',
          'surface-hover-light': '#e2e8f0',
          border: '#1e293b',
          'border-light': '#e2e8f0',
          text: '#f8fafc',
          'text-light': '#0f172a',
          muted: '#94a3b8',
          'muted-light': '#64748b',
          primary: '#6366f1', // Electric Indigo
          'primary-hover': '#4f46e5',
          'primary-light': '#e0e7ff',
          'primary-glow': 'rgba(99, 102, 241, 0.18)',
          cyan: '#06b6d4',
          emerald: '#10b981',
          violet: '#8b5cf6',
          amber: '#f59e0b',
        }
      },
      fontFamily: {
        display: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'sans-serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'brand-input': '0 4px 20px -2px rgba(99, 102, 241, 0.12), 0 2px 6px -1px rgba(0, 0, 0, 0.06)',
        'brand-glow': '0 0 25px -5px rgba(99, 102, 241, 0.35)',
        'brand-cyan-glow': '0 0 25px -5px rgba(6, 182, 212, 0.35)',
        'brand-card': '0 4px 14px 0 rgba(0, 0, 0, 0.08)',
        'brand-popover': '0 12px 32px -4px rgba(0, 0, 0, 0.45), 0 4px 12px -2px rgba(0, 0, 0, 0.25)',
      }
    },
  },
  plugins: [],
}
