/**
 * Fitness Transformation Application Brand Guidelines
 * 
 * This file contains brand color constants, typography guidelines, and brand values
 * to maintain visual consistency across the application.
 */

// Primary Brand Colors
export const brandColors = {
  // Main color palette
  primary: 'hsl(162, 87%, 40%)', // Vibrant teal - main brand color
  primaryLight: 'hsl(162, 87%, 85%)', // Light teal for backgrounds
  primaryDark: 'hsl(162, 87%, 30%)', // Dark teal for contrast
  
  // Secondary accent colors
  accent: 'hsl(250, 80%, 60%)', // Purple accent for contrast and highlights
  accentLight: 'hsl(250, 80%, 90%)', 
  accentDark: 'hsl(250, 80%, 40%)',
  
  // Neutral shades
  gray: {
    100: 'hsl(220, 20%, 98%)',
    200: 'hsl(220, 15%, 95%)',
    300: 'hsl(220, 15%, 90%)',
    400: 'hsl(220, 15%, 75%)',
    500: 'hsl(220, 15%, 50%)',
    600: 'hsl(220, 15%, 30%)',
    700: 'hsl(220, 15%, 20%)',
    800: 'hsl(220, 15%, 15%)',
    900: 'hsl(220, 15%, 10%)',
  },
  
  // Semantic colors
  success: 'hsl(142, 76%, 45%)',
  warning: 'hsl(45, 100%, 60%)',
  error: 'hsl(0, 85%, 60%)',
  info: 'hsl(200, 85%, 50%)',
};

// Typography Scale (using rem to maintain accessibility)
export const typography = {
  fontFamily: {
    sans: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: '"JetBrains Mono", Menlo, Monaco, Consolas, monospace',
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px 
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
};

// Spacing Scale (using rem)
export const spacing = {
  0: '0',
  1: '0.25rem',    // 4px
  2: '0.5rem',     // 8px
  3: '0.75rem',    // 12px
  4: '1rem',       // 16px
  5: '1.25rem',    // 20px
  6: '1.5rem',     // 24px
  8: '2rem',       // 32px
  10: '2.5rem',    // 40px
  12: '3rem',      // 48px
  16: '4rem',      // 64px
  20: '5rem',      // 80px
  24: '6rem',      // 96px
  32: '8rem',      // 128px
};

// Border Radius
export const borderRadius = {
  none: '0',
  sm: '0.125rem',    // 2px
  md: '0.375rem',    // 6px
  lg: '0.5rem',      // 8px
  xl: '0.75rem',     // 12px
  '2xl': '1rem',     // 16px
  '3xl': '1.5rem',   // 24px
  full: '9999px',    // Circle/pill shapes
};

// Shadows
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
};

// Gradients
export const gradients = {
  primaryToAccent: 'linear-gradient(to right, hsl(162, 87%, 40%), hsl(250, 80%, 60%))',
  primaryToDark: 'linear-gradient(to bottom, hsl(162, 87%, 40%), hsl(162, 87%, 30%))',
  grayScale: 'linear-gradient(to bottom, hsl(220, 15%, 95%), hsl(220, 15%, 75%))',
};

// Animation durations
export const animation = {
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
};

// Breakpoints for responsive design
export const breakpoints = {
  xs: '480px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Brand values and principles (used in marketing copy)
export const brandValues = {
  tagline: "Transform Your Body. Transform Your Life.",
  principles: [
    "Scientific approach to fitness",
    "Personalized for your body",
    "Sustainable lifestyle changes",
    "Data-driven progress tracking",
    "Muscle-focused fat loss"
  ],
  userBenefits: [
    "Lose fat while maintaining muscle",
    "Energy levels optimized through nutrition",
    "Monitor progress with accurate metrics",
    "Custom plans based on your metabolism",
    "Long-term results, not quick fixes"
  ]
};