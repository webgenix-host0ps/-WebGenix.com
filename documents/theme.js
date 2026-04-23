/**
 * Webgenix Theme Configuration
 * 
 * A complete, reusable design system for Webgenix-branded projects.
 * Use this file to import theme values in JavaScript/TypeScript projects.
 * 
 * @version 1.0.0
 */

// ============================================
// 1. COLORS
// ============================================

export const colors = {
  // Dark neutral base (backgrounds/surfaces)
  dark: {
    900: '#0a0a0a', // Primary background
    800: '#141414', // Card backgrounds, sections
    700: '#1a1a1a', // Elevated surfaces
    600: '#262626', // Borders, dividers
  },

  // Text hierarchy
  text: {
    primary: '#fafafa',   // Headings, primary text
    secondary: '#a1a1a1', // Body text, descriptions
    muted: '#525252',     // Captions, helper text
  },

  // Accent colors (primary action)
  accent: {
    DEFAULT: '#3b82f6',
    hover: '#2563eb',
    light: '#60a5fa',
  },

  // Semantic colors (state)
  semantic: {
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
  },

  // Terminal/UI colors
  ui: {
    red: '#ef4444',
    yellow: '#eab308',
    green: '#22c55e',
  },
};

// ============================================
// 2. TYPOGRAPHY
// ============================================

export const typography = {
  fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  
  fontUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  
  sizes: {
    h1: {
      DEFAULT: ['2.25rem', { lineHeight: '1.25', fontWeight: '600' }],   // 36px
      sm: ['3rem', { lineHeight: '1.25', fontWeight: '600' }],           // 48px
      lg: ['3.75rem', { lineHeight: '1.25', fontWeight: '600' }],        // 60px
    },
    h1Hero: {
      DEFAULT: ['3rem', { lineHeight: '1.25', fontWeight: '700', letterSpacing: '-0.025em' }], // 48px
      lg: ['4.5rem', { lineHeight: '1.25', fontWeight: '700', letterSpacing: '-0.025em' }],   // 72px
    },
    h2: {
      DEFAULT: ['1.875rem', { lineHeight: '1.25', fontWeight: '600' }],   // 30px
      lg: ['2.25rem', { lineHeight: '1.25', fontWeight: '600' }],        // 36px
    },
    h3: {
      DEFAULT: ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],    // 20px
    },
    h4: {
      DEFAULT: ['1.125rem', { lineHeight: '1.4', fontWeight: '600' }],    // 18px
      alt: ['1rem', { lineHeight: '1.4', fontWeight: '600' }],             // 16px
    },
    bodyLarge: {
      DEFAULT: ['1.125rem', { lineHeight: '1.6' }],                        // 18px
      sm: ['1.25rem', { lineHeight: '1.6' }],                              // 20px
    },
    body: {
      DEFAULT: ['1rem', { lineHeight: '1.6' }],                             // 16px
    },
    bodySmall: {
      DEFAULT: ['0.875rem', { lineHeight: '1.5' }],                         // 14px
    },
    caption: {
      DEFAULT: ['0.75rem', { lineHeight: '1.4', fontWeight: '500', letterSpacing: '0.05em' }], // 12px
    },
  },

  weights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  lineHeights: {
    tight: 1.25,
    normal: 1.6,
    relaxed: 1.75,
  },
};

// ============================================
// 3. SPACING & LAYOUT
// ============================================

export const spacing = {
  // Container max widths
  containers: {
    '7xl': '1280px',
    '6xl': '1152px',
    '5xl': '1024px',
    '4xl': '896px',
    '3xl': '768px',
    'md': '448px',
  },

  // Section padding
  section: {
    y: {
      DEFAULT: '96px',  // py-24
      lg: '128px',      // lg:py-32
    },
    x: {
      DEFAULT: '24px',  // px-6
      lg: '32px',       // lg:px-8
    },
  },

  // Element gaps
  gap: {
    4: '16px',
    6: '24px',
    8: '32px',
    12: '48px',
    16: '64px',
  },

  // Header
  header: {
    height: '80px',     // h-20
    offset: '80px',     // pt-20 for main content
  },
};

// ============================================
// 4. COMPONENT STYLES
// ============================================

export const components = {
  // Button variants
  button: {
    base: `
      inline-flex items-center justify-center
      font-medium rounded-lg
      transition-all duration-200
      focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-dark-900
      disabled:opacity-50 disabled:cursor-not-allowed
    `,
    
    variants: {
      primary: {
        background: colors.accent.DEFAULT,
        text: '#ffffff',
        border: 'none',
        shadow: '0 10px 15px -3px rgba(59, 130, 246, 0.2)',
        hover: {
          background: colors.accent.hover,
          shadow: '0 20px 25px -5px rgba(59, 130, 246, 0.3)',
        },
      },
      secondary: {
        background: 'transparent',
        text: colors.text.primary,
        border: `1px solid ${colors.dark[600]}`,
        shadow: 'none',
        hover: {
          background: colors.dark[700],
          border: `1px solid #404040`,
        },
      },
    },

    sizes: {
      small: {
        padding: '8px 16px',
        fontSize: '0.875rem',
      },
      default: {
        padding: '12px 24px',
        fontSize: '1rem',
      },
      large: {
        padding: '16px 32px',
        fontSize: '1.125rem',
      },
    },
  },

  // Card styles
  card: {
    standard: {
      background: 'rgba(20, 20, 20, 0.5)',
      border: `1px solid ${colors.dark[600]}`,
      borderRadius: '1rem', // rounded-2xl
      padding: '24px',
    },
    glass: {
      background: 'rgba(20, 20, 20, 0.6)',
      backdropFilter: 'blur(24px)',
      border: '1px solid rgba(38, 38, 38, 0.6)',
      borderRadius: '1rem',
      padding: '32px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
    },
    feature: {
      background: 'rgba(20, 20, 20, 0.5)',
      border: `1px solid ${colors.dark[600]}`,
      borderRadius: '1rem',
      padding: '24px',
      hoverBorder: `1px solid rgba(59, 130, 246, 0.5)`,
    },
  },

  // Form elements
  form: {
    input: {
      width: '100%',
      padding: '12px 16px',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      background: 'rgba(26, 26, 26, 0.8)',
      border: `1px solid ${colors.dark[600]}`,
      color: colors.text.primary,
      placeholder: colors.text.muted,
      focus: {
        outline: 'none',
        borderColor: colors.accent.DEFAULT,
        boxShadow: '0 0 0 1px rgba(59, 130, 246, 1)',
      },
      transition: 'all 0.2s ease',
    },
    label: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: colors.text.secondary,
      marginBottom: '8px',
    },
    checkbox: {
      width: '16px',
      height: '16px',
      borderRadius: '0.25rem',
      border: `1px solid ${colors.dark[600]}`,
      background: colors.dark[700],
      accent: colors.accent.DEFAULT,
    },
  },

  // Badge styles
  badge: {
    ai: {
      background: 'rgba(59, 130, 246, 0.2)',
      text: colors.accent.DEFAULT,
      border: '1px solid rgba(59, 130, 246, 0.3)',
    },
    popular: {
      background: 'rgba(34, 197, 94, 0.1)',
      text: colors.semantic.success,
      border: '1px solid rgba(34, 197, 94, 0.3)',
    },
    comingSoon: {
      background: 'rgba(245, 158, 11, 0.1)',
      text: 'rgba(245, 158, 11, 0.8)',
      border: '1px solid rgba(245, 158, 11, 0.2)',
    },
  },

  // Header/Navigation
  header: {
    position: 'fixed',
    background: 'rgba(10, 10, 10, 0.9)',
    backdropFilter: 'blur(24px)',
    borderBottom: '1px solid rgba(38, 38, 38, 0.5)',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  },
};

// ============================================
// 5. EFFECTS & ANIMATIONS
// ============================================

export const effects = {
  // Shadows
  shadows: {
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    accent: {
      lg: '0 10px 15px -3px rgba(59, 130, 246, 0.2)',
      xl: '0 20px 25px -5px rgba(59, 130, 246, 0.3)',
    },
  },

  // Transitions
  transitions: {
    fast: 'all 0.2s ease',
    medium: 'all 0.3s ease-in-out',
    slow: 'all 0.5s ease',
  },

  // Blur
  blur: {
    md: 'blur(12px)',
    xl: 'blur(24px)',
  },

  // Border radius
  radius: {
    sm: '0.375rem',    // rounded-lg
    md: '0.5rem',      // rounded-xl
    lg: '0.75rem',     // rounded-2xl
    full: '9999px',
  },
};

// ============================================
// 6. BREAKPOINTS
// ============================================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// ============================================
// 7. CSS CUSTOM PROPERTIES (for :root)
// ============================================

export const cssVariables = `
  /* Dark neutral base */
  --color-dark-900: ${colors.dark[900]};
  --color-dark-800: ${colors.dark[800]};
  --color-dark-700: ${colors.dark[700]};
  --color-dark-600: ${colors.dark[600]};
  
  /* Text hierarchy */
  --color-text-primary: ${colors.text.primary};
  --color-text-secondary: ${colors.text.secondary};
  --color-text-muted: ${colors.text.muted};
  
  /* Accent */
  --color-accent: ${colors.accent.DEFAULT};
  --color-accent-hover: ${colors.accent.hover};
  
  /* Semantic */
  --color-success: ${colors.semantic.success};
  --color-warning: ${colors.semantic.warning};
  
  /* Typography */
  --font-family-sans: ${typography.fontFamily};
`;

// ============================================
// 8. TAILWIND CONFIG (v4 format)
// ============================================

export const tailwindConfig = `
@import "tailwindcss";

@theme {
  /* Dark neutral base */
  --color-dark-900: ${colors.dark[900]};
  --color-dark-800: ${colors.dark[800]};
  --color-dark-700: ${colors.dark[700]};
  --color-dark-600: ${colors.dark[600]};
  
  /* Text hierarchy */
  --color-text-primary: ${colors.text.primary};
  --color-text-secondary: ${colors.text.secondary};
  --color-text-muted: ${colors.text.muted};
  
  /* Accent */
  --color-accent: ${colors.accent.DEFAULT};
  --color-accent-hover: ${colors.accent.hover};
  
  /* Semantic */
  --color-success: ${colors.semantic.success};
  --color-warning: ${colors.semantic.warning};
  
  /* Typography */
  --font-family-sans: ${typography.fontFamily};
}
`;

// ============================================
// 9. UTILITY CLASSES
// ============================================

export const utilityClasses = {
  // Container
  container: 'max-w-7xl mx-auto px-6 lg:px-8',
  containerNarrow: 'max-w-3xl mx-auto px-6',

  // Section
  section: 'py-24 lg:py-32',
  sectionHeader: 'text-center mb-16',

  // Typography
  heading1: 'text-4xl sm:text-5xl lg:text-6xl font-semibold text-text-primary leading-tight',
  heading2: 'text-3xl lg:text-4xl font-semibold text-text-primary leading-tight',
  bodyLarge: 'text-lg sm:text-xl text-text-secondary',
  body: 'text-base text-text-secondary',
  bodySmall: 'text-sm text-text-secondary',
  caption: 'text-xs text-text-muted',

  // Cards
  card: 'bg-dark-800/50 border border-dark-700 rounded-2xl p-6',
  cardHover: 'hover:border-accent/50 transition-colors',

  // Interactive
  link: 'text-accent hover:text-accent-hover transition-colors',
  focusRing: 'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-dark-900',
};

// ============================================
// 10. EXPORTS
// ============================================

export default {
  colors,
  typography,
  spacing,
  components,
  effects,
  breakpoints,
  cssVariables,
  tailwindConfig,
  utilityClasses,
};
