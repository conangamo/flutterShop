/** @type {import('tailwindcss').Config} */
module.exports = {
    
      content: [
        "./app/**/*.{js,ts,tsx}",
        "./components/**/*.{js,ts,tsx}",
        "./features/**/*.{js,ts,tsx}",
      ],
    
    presets: [require("nativewind/preset")],
    theme: {
      extend: {
        colors: {
          // === BACKGROUND SCALE ===
          // Use these for layering depth in the UI
          'bg-primary': '#0A0A0F',     // Deepest background (root screens)
          'bg-surface': '#13131A',     // Cards, modals, bottom sheets
          'bg-elevated': '#1C1C28',    // Inputs, elevated rows, nav bar

          // === ACCENT COLORS ===
          'accent':       '#6C63FF',   // Primary CTA, active states, highlights
          'accent-soft':  '#6C63FF1A', // 10% opacity accent (for ghost buttons)
          'accent-glow':  '#6C63FF33', // 20% opacity accent (for shadows/glows)
          'accent-coral': '#FF6584',   // Sale badges, wishlist, alerts

          // === TEXT SCALE ===
          'text-primary':   '#F0F0F5', // Headings, prices, important labels
          'text-secondary': '#8888A0', // Body text, placeholders, metadata
          'text-muted':     '#444455', // Disabled states, inactive tab icons

          // === SEMANTIC COLORS ===
          'semantic-success':  '#3ECF8E',
          'semantic-warning':  '#F59E0B',
          'semantic-border':   '#2A2A3A', // Subtle dividers and card outlines
        },
        fontFamily: {
          // Use whatever font is already configured in the project.
          // If no custom font exists, leave this section as-is.
        },
        borderRadius: {
          // These map to the design system's rounding scale
          'card':   '16px', // rounded-card  → product cards, major containers
          'button': '12px', // rounded-button → all interactive buttons
          'chip':   '9999px', // rounded-chip  → category filters, status badges
        },
        boxShadow: {
          // Deep, accent-tinted shadow for cards and elevated surfaces
          'card':   '0 8px 32px rgba(10, 10, 15, 0.6)',
          'accent': '0 4px 24px rgba(108, 99, 255, 0.25)',
          'glow':   '0 0 40px rgba(108, 99, 255, 0.15)',
        },
      },
    },
    plugins: [],
  }
