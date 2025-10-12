import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { Feature } from '../../types/homeLegacy';

type FeatureGalleryProps = {
  className?: string;
  features?: Feature[];
  highlightedFeatureId?: string | null;
};

const defaultFeatures: Feature[] = [
  {
    id: 'finance',
    title: 'Financial Control',
    description: 'Track every settlement in real time with instant forecasts.',
    icon: '💸'
  },
  {
    id: 'travel',
    title: 'Smart Routing',
    description: 'Minimize travel time with AI-optimised routes.',
    icon: '✈️'
  },
  {
    id: 'actions',
    title: 'Action Hub',
    description: 'Priority-based tasking to keep every show on track.',
    icon: '🛰️'
  }
];

export const FeatureGallery: React.FC<FeatureGalleryProps> = ({
  className = '',
  features,
  highlightedFeatureId = null
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const resolvedFeatures = useMemo(() => {
    if (!features || features.length === 0) {
      return defaultFeatures;
    }
    return features;
  }, [features]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: prefersReducedMotion
        ? undefined
        : {
            staggerChildren: 0.18,
            delayChildren: 0.1
          }
    }
  } as const;

  const itemVariants = prefersReducedMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 32, scale: 0.98 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: 0.45, ease: 'easeOut' as const }
        }
      };

  return (
    <section
      ref={sectionRef}
      className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-3 ${className}`}
      aria-label="Feature gallery"
    >
      <motion.div
        initial="hidden"
        animate={isVisible ? 'visible' : 'hidden'}
        variants={containerVariants}
        className="contents"
      >
        {resolvedFeatures.map((feature) => {
          const isHighlighted = highlightedFeatureId === feature.id;
          return (
            <motion.article
              key={feature.id}
              variants={itemVariants}
              className={`glass relative flex h-full flex-col justify-between rounded-2xl border border-white/5 bg-white/5 p-6 shadow-sm transition-transform duration-[var(--dur)] ease-[var(--ease)] hover:-translate-y-1 hover:shadow-[var(--elev-2)] ${
                isHighlighted ? 'ring-2 ring-accent-400/60 shadow-accent-400/20' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl" aria-hidden="true">
                  {feature.icon ?? '✨'}
                </div>
                <div>
                  <h3 className="text-lg font-semibold tracking-tight text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-white/70">
                    {feature.description}
                  </p>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between text-xs text-white/50">
                <span>{feature.id.toUpperCase()}</span>
                <span aria-hidden="true">•••</span>
              </div>
            </motion.article>
          );
        })}
      </motion.div>
    </section>
  );
};