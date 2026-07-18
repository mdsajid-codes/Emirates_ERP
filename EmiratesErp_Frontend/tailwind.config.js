/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Using CSS variables for theming
        background: 'var(--color-background)',
        'background-muted': 'var(--color-background-muted)',
        foreground: 'var(--color-foreground)',
        'foreground-muted': 'var(--color-foreground-muted)',
        primary: 'var(--color-primary)',
        'primary-foreground': 'var(--color-primary-foreground)',
        card: 'var(--color-card)',
        'card-foreground': 'var(--color-card-foreground)',
        border: 'var(--color-border)',
        input: 'var(--color-input)',
        
        // Extended
        sidebar: {
          bg: 'var(--color-sidebar-bg)',
          text: 'var(--color-sidebar-text)',
          active: 'var(--color-sidebar-active)',
          hover: 'var(--color-sidebar-hover)'
        },
        header: {
          bg: 'var(--color-header-bg)',
          text: 'var(--color-header-text)'
        },
        error: 'var(--color-error)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        info: 'var(--color-info)'
      },
      borderRadius: {
        theme: 'var(--theme-border-radius)'
      },
      fontFamily: {
        sans: ['var(--font-family-sans)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}