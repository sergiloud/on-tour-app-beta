import type { HomeContent } from '../types/homeLegacy';

const trustLogos = ['Live Nation', 'WME', 'UTA', 'C3 Presents', 'Artist Nation'];

export const homeES: HomeContent = {
  nav: [
    { id: 'features', label: 'Features', href: '#features' },
    { id: 'pricing', label: 'Pricing', href: '#pricing' },
    { id: 'testimonials', label: 'Casos de éxito', href: '#testimonials' },
    { id: 'cta', label: 'Empezar gratis', href: '#cta', ariaLabel: 'Ir a la llamada a la acción final' }
  ],
  hero: {
    title: 'De caos a control. De datos a decisiones.',
    subtitle: 'La plataforma que convierte el caos de gestionar giras en decisiones inteligentes. IA proactiva + UX premium + gestión completa offline-first. Todo en una app.',
    primaryCta: 'Empezar gratis',
    primaryHref: '/register',
    secondaryCta: 'Ver demo en vivo',
    secondaryHref: '/demo'
  },
  trust: trustLogos,
  features: [
    {
      id: 'finance',
      title: 'Settlement con 1 clic',
      description: 'Olvídate de Excel. Settlement automático, proyecciones en tiempo real, y control financiero total. Tus números siempre actualizados.',
      icon: '💸'
    },
    {
      id: 'travel',
      title: 'Funciona offline',
      description: 'IndexedDB + sync robusto. Gestiona tu gira en el avión, backstage, o donde sea. Cuando vuelva internet, todo se sincroniza automáticamente.',
      icon: '✈️'
    },
    {
      id: 'ia',
      title: 'IA proactiva',
      description: 'Quick Entry NLP, ActionHub inteligente, Health Score predictivo. Te avisa de problemas antes de que ocurran. Tu copiloto en la gira.',
      icon: '🤖'
    },
    {
      id: 'esign',
      title: 'Contratos digitales',
      description: 'E-sign integrado, templates por país (US/UK/EU/ES), búsqueda full-text con OCR. Cierra deals más rápido, sin imprimir papeles.',
      icon: '📝'
    }
  ],
  kpis: [
    { id: 'tours', label: 'Tours gestionados', value: '120+', description: 'Operaciones orquestadas por equipos híbridos' },
    { id: 'savings', label: 'Ahorro medio', value: '12%', description: 'Reducción en gastos de viaje por ruta optimizada' },
    { id: 'time', label: 'Horas ahorradas', value: '8h/sem', description: 'Automatización de reportes y cierres' }
  ],
  testimonials: [
    {
      id: 'tm-a',
      quote: 'Dejamos de perder 8 horas semanales en Excel. Ahora el settlement es automático y las proyecciones son confiables. El equipo duerme tranquilo.',
      author: 'Ana León',
      role: 'Tour Manager · 45 shows/año'
    },
    {
      id: 'agent-b',
      quote: 'Coordinamos 5 giras simultáneas con visibilidad total del margen. La IA nos avisa de problemas antes de que exploten. Game changer.',
      author: 'Luis Ortega',
      role: 'Soundwave Management · 12 artistas'
    },
    {
      id: 'artist-c',
      quote: 'Antes usaba 4 apps diferentes. Ahora todo está en On Tour: finanzas, logística, contratos, inbox. Y funciona offline en el tour bus.',
      author: 'Maria Santos',
      role: 'DJ/Productora · 80 shows/año'
    }
  ],
  pricing: [
    {
      id: 'free',
      name: 'Free',
      monthly: 0,
      yearly: 0,
      features: ['10 shows/mes', '1 tour activo', '2 team members', 'Features básicos'],
      ctaLabel: 'Empezar gratis',
      ctaHref: '/register',
      popular: false
    },
    {
      id: 'indie',
      name: 'Indie',
      monthly: 19,
      yearly: 205,
      features: ['50 shows/mes', '5 team members', 'Offline mode', 'E-sign (10 docs/mes)', 'Email support'],
      ctaLabel: 'Probar 14 días gratis',
      ctaHref: '/register',
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro',
      monthly: 49,
      yearly: 529,
      features: ['Shows ilimitados', '15 team members', 'IA avanzada', 'Settlement automático', 'Analytics completo', 'Priority support'],
      ctaLabel: 'Probar Pro',
      ctaHref: '/register',
      popular: true
    },
    {
      id: 'agency',
      name: 'Agency',
      monthly: 99,
      yearly: 1069,
      features: ['Multi-roster', '50 team members', 'API access', 'White-label', 'Advanced permissions', 'Dedicated support'],
      ctaLabel: 'Hablar con ventas',
      ctaHref: '/contact',
      popular: false
    }
  ],
  finalCta: {
    title: 'De caos a control en menos de 5 minutos',
    subtitle: 'Únete a 120+ tour managers que ya dejaron Excel atrás. Gratis para siempre, sin tarjeta de crédito.',
    cta: 'Empezar gratis ahora',
    href: '/register'
  }
};

export const homeEN: HomeContent = {
  ...homeES,
  nav: [
    { id: 'features', label: 'Features', href: '#features' },
    { id: 'pricing', label: 'Pricing', href: '#pricing' },
    { id: 'testimonials', label: 'Success stories', href: '#testimonials' },
    { id: 'cta', label: 'Start free', href: '#cta', ariaLabel: 'Jump to final call to action' }
  ],
  hero: {
    title: 'From chaos to control. From data to decisions.',
    subtitle: 'The platform that turns tour management chaos into intelligent decisions. Proactive AI + premium UX + complete offline-first management. All in one app.',
    primaryCta: 'Start free',
    primaryHref: '/register',
    secondaryCta: 'Watch live demo',
    secondaryHref: '/demo'
  },
  features: [
    {
      id: 'finance',
      title: '1-click settlements',
      description: 'Forget Excel. Automatic settlements, real-time projections, and total financial control. Your numbers always up to date.',
      icon: '💸'
    },
    {
      id: 'travel',
      title: 'Works offline',
      description: 'IndexedDB + robust sync. Manage your tour on the plane, backstage, or anywhere. When internet returns, everything syncs automatically.',
      icon: '✈️'
    },
    {
      id: 'ia',
      title: 'Proactive AI',
      description: 'Quick Entry NLP, intelligent ActionHub, predictive Health Score. Warns you of problems before they happen. Your tour copilot.',
      icon: '🤖'
    },
    {
      id: 'esign',
      title: 'Digital contracts',
      description: 'Integrated e-sign, country templates (US/UK/EU/ES), full-text search with OCR. Close deals faster, no paper printing.',
      icon: '📝'
    }
  ],
  testimonials: [
    {
      id: 'tm-a',
      quote: 'We stopped wasting 8 hours/week on Excel. Now settlement is automatic and projections are reliable. The team sleeps peacefully.',
      author: 'Ana León',
      role: 'Tour Manager · 45 shows/year'
    },
    {
      id: 'agent-b',
      quote: 'We coordinate 5 simultaneous tours with total margin visibility. AI warns us of problems before they explode. Game changer.',
      author: 'Luis Ortega',
      role: 'Soundwave Management · 12 artists'
    },
    {
      id: 'artist-c',
      quote: 'Before I used 4 different apps. Now everything is in On Tour: finance, logistics, contracts, inbox. And it works offline on the tour bus.',
      author: 'Maria Santos',
      role: 'DJ/Producer · 80 shows/year'
    }
  ],
  pricing: [
    {
      id: 'free',
      name: 'Free',
      monthly: 0,
      yearly: 0,
      features: ['10 shows/month', '1 active tour', '2 team members', 'Basic features'],
      ctaLabel: 'Start free',
      ctaHref: '/register',
      popular: false
    },
    {
      id: 'indie',
      name: 'Indie',
      monthly: 19,
      yearly: 205,
      features: ['50 shows/month', '5 team members', 'Offline mode', 'E-sign (10 docs/month)', 'Email support'],
      ctaLabel: 'Try 14 days free',
      ctaHref: '/register',
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro',
      monthly: 49,
      yearly: 529,
      features: ['Unlimited shows', '15 team members', 'Advanced AI', 'Automatic settlement', 'Complete analytics', 'Priority support'],
      ctaLabel: 'Try Pro',
      ctaHref: '/register',
      popular: true
    },
    {
      id: 'agency',
      name: 'Agency',
      monthly: 99,
      yearly: 1069,
      features: ['Multi-roster', '50 team members', 'API access', 'White-label', 'Advanced permissions', 'Dedicated support'],
      ctaLabel: 'Talk to sales',
      ctaHref: '/contact',
      popular: false
    }
  ],
  finalCta: {
    title: 'From chaos to control in less than 5 minutes',
    subtitle: 'Join 120+ tour managers who already left Excel behind. Free forever, no credit card required.',
    cta: 'Start free now',
    href: '/register'
  }
};

export const homeContentByLang = {
  es: homeES,
  en: homeEN
} as const;
