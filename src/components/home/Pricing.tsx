import { useMemo } from 'react';
import type { PricingPlan } from '../../types/homeLegacy';

type PricingProps = {
  plans: PricingPlan[];
  currency?: string;
};

export function Pricing({ plans, currency = '$' }: PricingProps) {
  // Use native CSS media query instead of framer-motion hook
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  return (
    <div
      className={`grid gap-6 lg:grid-cols-2 ${prefersReducedMotion ? 'animate-fade-in-fast' : 'animate-slide-up'}`}
    >
      {plans.map((plan) => {
        const monthlyLabel = `${currency}${plan.monthly}`;
        const yearlyLabel = plan.yearly ? `${currency}${plan.yearly}` : null;
        return (
          <article
            key={plan.id}
            className={`glass flex h-full flex-col rounded-2xl border border-slate-100 dark:border-white/5 bg-white/5 p-6 shadow-sm transition-transform duration-[var(--dur)] ease-[var(--ease)] hover:-translate-y-1 hover:shadow-[var(--elev-2)] ${
              plan.popular ? 'ring-2 ring-accent-400/60 shadow-accent-400/20' : ''
            }`}
          >
            <header className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-accent-200">{plan.id}</p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{plan.name}</h3>
              </div>
              <div className="text-right">
                <p className="text-3xl font-semibold text-slate-900 dark:text-white">{monthlyLabel}</p>
                <p className="text-xs text-slate-400 dark:text-white/60">/ month</p>
                {yearlyLabel ? (
                  <p className="mt-1 text-xs text-accent-200">{yearlyLabel} / año</p>
                ) : null}
              </div>
            </header>
            <ul className="mt-6 space-y-2 text-sm text-slate-600 dark:text-white/80">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <span aria-hidden="true">•</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <a
                href={plan.ctaHref ?? '/contact'}
                className={`${plan.popular ? 'btn-primary' : 'btn-ghost'} inline-flex w-full justify-center`}
              >
                {plan.ctaLabel}
              </a>
            </div>
          </article>
        );
      })}
    </div>
  );
}
