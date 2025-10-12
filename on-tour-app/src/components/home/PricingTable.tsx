import React from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { homeES } from '../../content/home';
import { t } from '../../lib/i18n';

/**
 * PricingTable Component
 *
 * Displays a responsive pricing comparison table with 4 plans.
 * The "Pro" plan is visually highlighted as the most popular choice.
 *
 * Features:
 * - Responsive grid (stack on mobile, 4 columns on desktop)
 * - Pro plan highlighted with accent border and "Most Popular" badge
 * - Feature list with checkmarks
 * - CTA buttons for each plan
 * - Smooth hover animations with framer-motion
 */
export const PricingTable: React.FC = () => {
    const { pricing } = homeES;

    return (
        <section id="pricing" className="py-24 px-6 relative">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent-500/5 to-transparent pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-4xl md:text-5xl font-bold mb-4"
                    >
                        {t('pricing.title')}{' '}
                        <span className="text-accent-500">{t('pricing.titleHighlight')}</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-lg text-white/60 max-w-2xl mx-auto"
                    >
                        {t('pricing.subtitle')}
                    </motion.p>
                </div>

                {/* Pricing Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {pricing.map((plan, index) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ y: -8, transition: { duration: 0.2 } }}
                            className={`
                relative p-8 rounded-2xl backdrop-blur-xl
                ${plan.popular
                                    ? 'border-2 border-accent-500 bg-accent-500/10'
                                    : 'border border-white/10 glass'
                                }
              `}
                        >
                            {/* Most Popular Badge */}
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                    <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-500 text-ink-900 text-sm font-semibold">
                                        <Sparkles className="w-4 h-4" />
                                        {t('pricing.mostPopular')}
                                    </div>
                                </div>
                            )}

                            {/* Plan Name */}
                            <div className="mb-6">
                                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-bold text-accent-500">
                                        ${plan.monthly}
                                    </span>
                                    <span className="text-white/60">/mes</span>
                                </div>
                                {plan.yearly && plan.yearly > 0 && (
                                    <p className="text-sm text-white/40 mt-2">
                                        ${plan.yearly}/año (ahorra ${Math.round((plan.monthly * 12 - plan.yearly) / (plan.monthly * 12) * 100)}%)
                                    </p>
                                )}
                            </div>

                            {/* Features List */}
                            <ul className="space-y-3 mb-8">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        <Check className="w-5 h-5 text-accent-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-white/80 text-sm">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* CTA Button */}
                            <a
                                href={plan.ctaHref}
                                className={`
                  block w-full py-3 px-6 rounded-lg text-center font-semibold
                  transition-all duration-200
                  ${plan.popular
                                        ? 'bg-accent-500 text-ink-900 hover:bg-accent-400'
                                        : 'glass hover:bg-white/10 border border-white/20'
                                    }
                `}
                            >
                                {plan.ctaLabel}
                            </a>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom Note */}
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="text-center text-white/40 text-sm mt-12"
                >
                    {t('pricing.allPlansInclude')}{' '}
                    <a href="/contact" className="text-accent-500 hover:underline">
                        {t('pricing.needCustom')}
                    </a>
                </motion.p>
            </div>
        </section>
    );
};
