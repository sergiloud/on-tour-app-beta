// Deprecated: Vanity KPI grid removed per CTO Zenith directive focusing on narrative clarity over raw numbers.
// Keeping file temporarily for potential targeted reuse of feature cards (Map/Finance/Actions) sans vanity metrics.
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { t } from '../../lib/i18n';
import { MapPreview } from '../common/MapPreview';
import { MiniChart } from '../common/MiniChart';
import { ActionHubPreview } from '../common/ActionHubPreview';
import type { HomeContent } from '../../types/homeLegacy';

interface KPIGridProps {
  selectedPersona?: 'artist' | 'agency' | null;
  selectedMarker?: string | null;
  className?: string;
  onFeatureHover?: (feature: string | null) => void;
  highlightedFeature?: string | null;
  items?: HomeContent['kpis'];
}

const getPersonaFeatures = (persona: 'artist' | 'agency' | null) => {
  if (persona === 'artist') {
    return [
      {
        title: 'Map',
        desc: 'Track your tour route, venue capacities, and travel logistics in real-time.',
        demo: 'map-demo'
      },
      {
        title: 'Finance',
        desc: 'Monitor show revenues, expenses, and net profits with instant calculations.',
        demo: 'finance-demo'
      },
      {
        title: 'Actions',
        desc: 'Manage contracts, riders, and logistics with priority-based task tracking.',
        demo: 'action-demo'
      }
    ];
  } else if (persona === 'agency') {
    return [
      {
        title: 'Map',
        desc: 'Oversee multiple artist tours, venue bookings, and routing optimization.',
        demo: 'map-demo'
      },
      {
        title: 'Finance',
        desc: 'Track all client revenues, payments, and profitability across your roster.',
        demo: 'finance-demo'
      },
      {
        title: 'Actions',
        desc: 'Coordinate with venues, manage emergencies, and handle client communications.',
        demo: 'action-demo'
      }
    ];
  } else {
    // Default/generic descriptions
    return [
      {
        title: 'Map',
        desc: 'Live HUD with shows, route and risks.',
        demo: 'map-demo'
      },
      {
        title: 'Finance',
        desc: 'Monthly KPIs, pipeline and forecast.',
        demo: 'finance-demo'
      },
      {
        title: 'Actions',
        desc: 'Action Hub with priorities and shortcuts.',
        demo: 'action-demo'
      }
    ];
  }
};

const FeatureDemo: React.FC<{ type: string; selectedMarker?: string | null }> = ({ type, selectedMarker }) => {
  const [isVisible, setIsVisible] = useState(false);
  const demoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    if (demoRef.current) {
      observer.observe(demoRef.current);
    }

    return () => observer.disconnect();
  }, []);

  switch (type) {
    case 'map-demo':
      return (
        <div ref={demoRef} className="w-full h-20 flex items-center justify-center">
          <MapPreview animated={isVisible} selectedMarker={selectedMarker ?? null} className="w-40 h-16" />
        </div>
      );

    case 'finance-demo':
      return (
        <div ref={demoRef} className="w-full h-20 flex items-center justify-center">
          <MiniChart animated={isVisible} className="w-40 h-16" />
        </div>
      );

    case 'action-demo':
      return (
        <div ref={demoRef} className="w-full h-20 flex items-center justify-center">
          <ActionHubPreview animated={isVisible} className="w-40" />
        </div>
      );

    default:
      return (
        <div className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full transition-all duration-1000 ${
            isVisible ? 'bg-accent-400 animate-ping shadow-lg shadow-accent-400/50' : 'bg-gray-400'
          }`} />
        </div>
      );
  }
};

export const KPIGrid: React.FC<KPIGridProps> = ({
  selectedPersona = null,
  selectedMarker = null,
  className = '',
  onFeatureHover,
  highlightedFeature,
  items
}) => {
  if (items && items.length > 0) {
    return (
      <section
        className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-3 ${className}`}
        aria-label="Key performance indicators"
      >
        {items.map((item) => (
          <article
            key={item.id}
            className="glass flex h-full flex-col justify-between rounded-2xl border border-white/5 bg-white/5 p-6 shadow-sm transition-transform duration-[var(--dur)] ease-[var(--ease)] hover:-translate-y-1 hover:shadow-[var(--elev-2)]"
          >
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-accent-200">
                {item.label}
              </p>
              <p className="mt-4 text-4xl font-semibold text-white">{item.value}</p>
            </div>
            {item.description ? (
              <p className="mt-6 text-sm text-white/70">{item.description}</p>
            ) : null}
          </article>
        ))}
      </section>
    );
  }

  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const kpiFeatures = getPersonaFeatures(selectedPersona);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1 }
  };

  return (
    <section ref={sectionRef} id="features" className={`relative z-10 px-6 pb-16 md:pb-20 max-w-7xl mx-auto w-full ${className}`}>
      <motion.div
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
        variants={containerVariants}
      >
        <motion.h2
          variants={itemVariants}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-xl font-semibold tracking-wide text-accent-500 mb-4"
        >
          {t('inside.title') || "What you'll see inside"}
        </motion.h2>
        <motion.h3
          variants={itemVariants}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
          className="section-title mb-12"
        >
          A cockpit for modern touring
        </motion.h3>
        <motion.div
          variants={containerVariants}
          className="grid-auto-fit"
        >
          {kpiFeatures.map((f, index) => {
            const isActive = highlightedFeature === f.title;
            const isDimmed = highlightedFeature && !isActive;
            return (
              <motion.div
                key={f.title}
                variants={itemVariants}
                transition={{ duration: 0.7, ease: 'easeOut', delay: index * 0.1 }}
                className={`relative glass p-6 flex flex-col gap-4 group cursor-pointer hover:shadow-[var(--elev-2)] transition-all duration-300 border border-white/5 hover:border-accent-400/30 transform hover:scale-[1.02] hover:-translate-y-1 bg-gradient-to-br from-white/5 to-transparent hover:from-accent-500/10 hover:to-accent-400/5 ${isActive ? 'ring-2 ring-accent-500 shadow-lg shadow-accent-500/30 scale-105' : ''} ${isDimmed ? 'saturate-50 opacity-70' : ''}`}
                onMouseEnter={() => onFeatureHover?.(f.title)}
                onMouseLeave={() => onFeatureHover?.(null)}
                onFocus={() => onFeatureHover?.(f.title)}
                onBlur={() => onFeatureHover?.(null)}
                tabIndex={0}
                role="button"
                aria-label={`Learn more about ${f.title} feature`}
                aria-describedby={`desc-${f.title}`}
              >
                {/* Glowing border on hover */}
                <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-accent-400/50 group-hover:shadow-lg group-hover:shadow-accent-400/20 transition-all duration-300 pointer-events-none" />
                <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {f.title === 'Map' && (
                    <svg className="w-6 h-6 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  )}
                  {f.title === 'Finance' && (
                    <svg className="w-6 h-6 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  )}
                  {f.title === 'Actions' && (
                    <svg className="w-6 h-6 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  )}
                  <div className="font-medium tracking-tight">{f.title}</div>
                </div>
                <FeatureDemo type={f.demo} selectedMarker={selectedMarker} />
              </div>
              <p id={`desc-${f.title}`} className="text-sm leading-relaxed" style={{color:'var(--text-secondary)'}}>{f.desc}</p>
            </motion.div>
            );
          })}
        </motion.div>
      </motion.div>
    </section>
  );
};
