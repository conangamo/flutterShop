/**
 * Premium Admin Dashboard Theme
 * Synchronized with mobile app's luxurious aesthetic
 * Optimized for desktop browsers with web-specific enhancements
 */

export const adminTheme = {
  // === COLOR PALETTE ===
  colors: {
    // Background layers (depth hierarchy)
    bgPrimary: '#0A0A0F',      // Deepest background
    bgSurface: '#13131A',      // Cards, panels
    bgElevated: '#1C1C28',     // Inputs, elevated elements
    bgHover: '#252532',        // Hover states
    
    // Accent colors
    accent: '#6C63FF',         // Primary CTA
    accentSoft: '#6C63FF1A',   // 10% opacity
    accentGlow: '#6C63FF33',   // 20% opacity
    accentCoral: '#FF6584',    // Alerts, sale badges
    
    // Text scale
    textPrimary: '#F0F0F5',    // Headings, important text
    textSecondary: '#8888A0',  // Body text, metadata
    textMuted: '#444455',      // Disabled states
    
    // Semantic colors
    success: '#3ECF8E',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6',
    
    // Borders & dividers
    border: '#2A2A3A',
    borderLight: '#1F1F2D',
  },
  
  // === SPACING SCALE ===
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  
  // === BORDER RADIUS ===
  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    full: '9999px',
  },
  
  // === SHADOWS ===
  shadows: {
    card: '0 8px 32px rgba(10, 10, 15, 0.6)',
    accent: '0 4px 24px rgba(108, 99, 255, 0.25)',
    glow: '0 0 40px rgba(108, 99, 255, 0.15)',
    subtle: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  
  // === TYPOGRAPHY ===
  typography: {
    fontFamily: {
      base: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
    },
    fontSize: {
      xs: '11px',
      sm: '12px',
      base: '14px',
      md: '15px',
      lg: '16px',
      xl: '18px',
      '2xl': '20px',
      '3xl': '24px',
      '4xl': '32px',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      tight: '1.2',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
  
  // === TRANSITIONS ===
  transitions: {
    fast: 'all 0.15s ease-in-out',
    base: 'all 0.2s ease-in-out',
    slow: 'all 0.3s ease-in-out',
  },
  
  // === LAYOUT ===
  layout: {
    sidebarWidth: '280px',
    sidebarCollapsedWidth: '80px',
    headerHeight: '72px',
    maxContentWidth: '1600px',
  },
  
  // === STATUS BADGES ===
  statusColors: {
    pending: { bg: '#FEF3C7', fg: '#92400E', border: '#FDE68A' },
    processing: { bg: '#DBEAFE', fg: '#1E40AF', border: '#BFDBFE' },
    shipped: { bg: '#E0E7FF', fg: '#4338CA', border: '#C7D2FE' },
    delivered: { bg: '#D1FAE5', fg: '#065F46', border: '#A7F3D0' },
    cancelled: { bg: '#FEE2E2', fg: '#991B1B', border: '#FECACA' },
    active: { bg: '#D1FAE5', fg: '#065F46', border: '#A7F3D0' },
    inactive: { bg: '#F3F4F6', fg: '#374151', border: '#E5E7EB' },
    low: { bg: '#FEF3C7', fg: '#92400E', border: '#FDE68A' },
    out: { bg: '#FEE2E2', fg: '#991B1B', border: '#FECACA' },
  },
} as const;

export type AdminTheme = typeof adminTheme;
