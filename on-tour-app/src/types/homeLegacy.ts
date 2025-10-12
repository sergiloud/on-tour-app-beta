export type Persona = 'artist' | 'agency' | null;

export type KpiType = 'pending' | 'monthNet' | 'yearNet';

export interface Coordinates {
  x: number;
  y: number;
}

export interface TargetCoordinates {
  pending: Coordinates;
  monthNet: Coordinates;
  yearNet: Coordinates;
}

export type NavLink = {
  id: string;
  label: string;
  href: string;
  ariaLabel?: string;
};

export type Feature = {
  id: string;
  title: string;
  description: string;
  icon?: string;
};

export type Testimonial = {
  id: string;
  quote: string;
  author: string;
  role: string;
  avatarUrl?: string;
};

export type PricingPlan = {
  id: string;
  name: string;
  monthly: number;
  yearly?: number;
  features: string[];
  ctaLabel: string;
  ctaHref?: string;
  popular?: boolean;
};

export type HeroContent = {
  title: string;
  subtitle: string;
  primaryCta: string;
  primaryHref?: string;
  secondaryCta?: string;
  secondaryHref?: string;
  imageUrl?: string;
};

export type FinalCta = {
  title: string;
  subtitle: string;
  cta: string;
  href?: string;
};

export type HomeContent = {
  nav: NavLink[];
  hero: HeroContent;
  trust: string[];
  features: Feature[];
  kpis: { id: string; label: string; value: string; description?: string }[];
  testimonials: Testimonial[];
  pricing: PricingPlan[];
  finalCta: FinalCta;
};

export type LocalizedHomeContent = {
  es: HomeContent;
  en: HomeContent;
};
