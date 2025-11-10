/**
 * Design System - Tokens Centralizados
 * Definición centralizada de colores, espaciados, tipografía y efectos
 */

// ═══════════════════════════════════════════════════════════════════════
// COLOR TOKENS
// ═══════════════════════════════════════════════════════════════════════

export const colorTokens = {
  // Primarios
  primary: {
    50: 'rgb(240, 249, 255)',    // sky-50
    100: 'rgb(224, 242, 254)',   // sky-100
    200: 'rgb(186, 230, 253)',   // sky-200
    300: 'rgb(125, 211, 252)',   // sky-300
    400: 'rgb(56, 189, 248)',    // sky-400
    500: 'rgb(14, 165, 233)',    // sky-500
    600: 'rgb(2, 132, 199)',     // sky-600
    700: 'rgb(3, 105, 160)',     // sky-700
    800: 'rgb(7, 89, 133)',      // sky-800
    900: 'rgb(12, 74, 110)',     // sky-900
  },

  // Acentos
  accent: {
    purple: 'rgb(168, 85, 247)',  // purple-500
    pink: 'rgb(236, 72, 153)',    // pink-500
    cyan: 'rgb(34, 211, 238)',    // cyan-500
  },

  // Estados
  state: {
    success: 'rgb(34, 197, 94)',     // green-500
    warning: 'rgb(245, 158, 11)',    // amber-500
    critical: 'rgb(239, 68, 68)',    // red-500
    info: 'rgb(59, 130, 246)',       // blue-500
  },

  // Escala de grises
  gray: {
    50: 'rgb(250, 250, 250)',    // slate-50
    100: 'rgb(241, 245, 249)',   // slate-100
    200: 'rgb(226, 232, 240)',   // slate-200
    300: 'rgb(203, 213, 225)',   // slate-300
    400: 'rgb(148, 163, 184)',   // slate-400
    500: 'rgb(100, 116, 139)',   // slate-500
    600: 'rgb(71, 85, 105)',     // slate-600
    700: 'rgb(51, 65, 85)',      // slate-700
    800: 'rgb(30, 41, 59)',      // slate-800
    900: 'rgb(15, 23, 42)',      // slate-900
  },

  // Semánticos
  semantic: {
    background: 'rgb(15, 23, 42)',           // dark bg
    surface: 'rgb(30, 41, 59)',              // card surface
    border: 'rgb(51, 65, 85)',               // border
    text: {
      primary: 'rgb(248, 250, 252)',         // white/slate-50
      secondary: 'rgb(148, 163, 184)',       // slate-400
      muted: 'rgb(100, 116, 139)',           // slate-500
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════
// SPACING TOKENS (Tailwind scale: 4px base)
// ═══════════════════════════════════════════════════════════════════════

export const spacingTokens = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '2.5rem',  // 40px
  '3xl': '3rem',    // 48px
  '4xl': '4rem',    // 64px
};

// Padding presets para componentes
export const paddingPresets = {
  tight: 'p-3',      // p-3: 12px
  default: 'p-4',    // p-4: 16px
  relaxed: 'p-6',    // p-6: 24px
  spacious: 'p-8',   // p-8: 32px
};

// Gap presets para grillas y layouts
export const gapPresets = {
  tight: 'gap-2',    // 8px
  default: 'gap-3',  // 12px
  relaxed: 'gap-4',  // 16px
  spacious: 'gap-6', // 24px
};

// ═══════════════════════════════════════════════════════════════════════
// TYPOGRAPY TOKENS
// ═══════════════════════════════════════════════════════════════════════

export const typographyTokens = {
  // Headings
  h1: 'text-4xl md:text-5xl font-bold',
  h2: 'text-3xl md:text-4xl font-bold',
  h3: 'text-2xl md:text-3xl font-semibold',
  h4: 'text-xl md:text-2xl font-semibold',
  h5: 'text-lg font-semibold',
  h6: 'text-base font-semibold',

  // Body text
  body: 'text-base leading-relaxed',
  bodySmall: 'text-sm leading-relaxed',
  bodyXs: 'text-xs leading-relaxed',

  // Labels
  label: 'text-sm font-medium',
  labelSmall: 'text-xs font-medium uppercase tracking-wide',

  // Mono (para código)
  mono: 'font-mono text-sm',
};

// ═══════════════════════════════════════════════════════════════════════
// BORDER RADIUS TOKENS
// ═══════════════════════════════════════════════════════════════════════

export const borderRadiusTokens = {
  none: 'rounded-none',
  sm: 'rounded-lg',        // 8px
  md: 'rounded-xl',        // 12px
  lg: 'rounded-2xl',       // 16px
  full: 'rounded-full',
};

// ═══════════════════════════════════════════════════════════════════════
// SHADOW TOKENS (Profundidad)
// ═══════════════════════════════════════════════════════════════════════

export const shadowTokens = {
  none: 'shadow-none',
  sm: 'shadow-sm',         // Elevación leve
  md: 'shadow-md',         // Elevación media
  lg: 'shadow-lg',         // Elevación alta
  xl: 'shadow-xl',         // Elevación muy alta
  glow: 'shadow-lg shadow-blue-500/20', // Brillo azul
};

// ═══════════════════════════════════════════════════════════════════════
// TRANSITION TOKENS (Duraciones y timing)
// ═══════════════════════════════════════════════════════════════════════

export const transitionTokens = {
  // Duraciones (en ms)
  duration: {
    fast: 0.15,      // Micro-interacciones
    normal: 0.3,     // Interacciones principales
    slow: 0.5,       // Entradas/salidas
    verySlow: 0.8,   // Animaciones grandes
  },

  // Easing
  easing: {
    easeOut: 'easeOut',
    easeIn: 'easeIn',
    easeInOut: 'easeInOut',
    circOut: 'circOut',
  },

  // Clases Tailwind
  classes: {
    fast: 'transition-all duration-150',
    normal: 'transition-all duration-300',
    slow: 'transition-all duration-500',
  },
};

// ═══════════════════════════════════════════════════════════════════════
// BUTTON STYLE PRESETS
// ═══════════════════════════════════════════════════════════════════════

export const buttonVariants = {
  // Primario (Acciones principales)
  primary: 'px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-medium transition-all duration-200',

  // Secundario (Acciones secundarias)
  secondary: 'px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium border border-white/20 transition-all duration-200',

  // Outline (Sin fondo)
  outline: 'px-4 py-2 rounded-lg border border-white/30 hover:border-white/50 text-white font-medium transition-all duration-200',

  // Ghost (Mínimo)
  ghost: 'px-4 py-2 text-white hover:bg-white/10 font-medium transition-all duration-200',

  // Danger (Acciones destructivas)
  danger: 'px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 font-medium border border-red-500/30 transition-all duration-200',

  // Success (Confirmación)
  success: 'px-4 py-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 font-medium border border-green-500/30 transition-all duration-200',

  // Icon (Solo icono)
  icon: 'p-2 rounded-lg hover:bg-white/10 text-white transition-all duration-200',

  // Small
  small: 'px-2 py-1 text-sm rounded-lg',

  // Large
  large: 'px-6 py-3 text-base rounded-lg',
};

// ═══════════════════════════════════════════════════════════════════════
// CARD STYLE PRESETS
// ═══════════════════════════════════════════════════════════════════════

export const cardVariants = {
  // Elevated (Con sombra)
  elevated: 'p-6 rounded-xl bg-white/5 border border-white/10 shadow-lg',

  // Filled (Fondo color)
  filled: 'p-6 rounded-xl bg-white/10 border border-white/20',

  // Outlined (Solo borde)
  outlined: 'p-6 rounded-xl border-2 border-white/30 bg-transparent',

  // Gradient (Con gradiente sutil)
  gradient: 'p-6 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20',

  // Compact (Espaciado reducido)
  compact: 'p-4 rounded-lg bg-white/5 border border-white/10',

  // Interactive (Interactivo con hover)
  interactive: 'p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 cursor-pointer transition-all duration-200',
};

// ═══════════════════════════════════════════════════════════════════════
// INPUT STYLE PRESETS
// ═══════════════════════════════════════════════════════════════════════

export const inputVariants = {
  default: `
    w-full px-4 py-2 rounded-lg
    bg-white/5 border border-white/20
    text-white placeholder-slate-500
    focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent
    transition-all duration-200
  `,

  compact: `
    w-full px-3 py-1.5 text-sm rounded-lg
    bg-white/5 border border-white/20
    text-white placeholder-slate-500
    focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent
    transition-all duration-200
  `,

  filled: `
    w-full px-4 py-2 rounded-lg
    bg-white/10 border border-white/30
    text-white placeholder-slate-400
    focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white/15
    transition-all duration-200
  `,
};

// ═══════════════════════════════════════════════════════════════════════
// BADGE STYLE PRESETS
// ═══════════════════════════════════════════════════════════════════════

export const badgeVariants = {
  primary: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-sky-500/20 text-sky-300 border border-sky-500/30',
  success: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30',
  warning: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30',
  danger: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/30',
  neutral: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-500/20 text-slate-300 border border-slate-500/30',
};

// ═══════════════════════════════════════════════════════════════════════
// ANIMATION PRESETS (Framer Motion)
// ═══════════════════════════════════════════════════════════════════════

export const animationPresets = {
  // Fade
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 },
  },

  fadeInUp: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.3 },
  },

  fadeInDown: {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 },
    transition: { duration: 0.3 },
  },

  // Scale
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.3 },
  },

  // Slide
  slideInLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.3 },
  },

  slideInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { duration: 0.3 },
  },

  // Hover effects
  hoverScale: {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
    transition: { duration: 0.2 },
  },

  hoverLift: {
    whileHover: { y: -2 },
    whileTap: { y: 0 },
    transition: { duration: 0.2 },
  },

  // Stagger (para listas)
  staggerContainer: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },

  staggerItem: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
  },
};

// ═══════════════════════════════════════════════════════════════════════
// RESPONSIVE BREAKPOINTS
// ═══════════════════════════════════════════════════════════════════════

export const breakpoints = {
  xs: '0px',      // Extra small
  sm: '640px',    // Small phones
  md: '768px',    // Tablets
  lg: '1024px',   // Laptops
  xl: '1280px',   // Desktops
  '2xl': '1536px', // Large desktops
};

// ═══════════════════════════════════════════════════════════════════════
// Z-INDEX SCALE (Estratificación de elementos)
// ═══════════════════════════════════════════════════════════════════════

export const zIndexScale = {
  base: 0,           // Contenido normal
  dropdown: 10,      // Dropdowns
  sticky: 20,        // Headers sticky
  fixed: 30,         // Sidebars fixed
  modal: 40,         // Modales
  tooltip: 50,       // Tooltips
  notification: 60,  // Notificaciones
};
