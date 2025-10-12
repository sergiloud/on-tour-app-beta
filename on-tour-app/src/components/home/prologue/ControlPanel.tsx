import React, { useState, useRef, useEffect, useMemo, useCallback, memo } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useAnimation } from 'framer-motion';

interface ControlPanelProps {
  onFeatureActivate?: (feature: string) => void;
  activeFeatures?: string[];
}

// Optimized spring configurations for performance
const SPRING_CONFIGS = {
  mouseTracking: {
    stiffness: 400,
    damping: 40,
    mass: 0.5,
    restDelta: 0.001
  },
  cardHover: {
    stiffness: 300,
    damping: 35,
    mass: 0.6,
    restDelta: 0.001
  }
} as const;

// Memoized CategoryButton component for performance
const CategoryButton = memo(({
  category,
  index,
  selectedCategory,
  onClick
}: {
  category: { id: string; label: string };
  index: number;
  selectedCategory: string;
  onClick: (id: string) => void;
}) => (
  <motion.button
    className={`relative px-8 py-4 rounded-2xl font-semibold transition-all duration-500 overflow-hidden ${
      selectedCategory === category.id
        ? 'text-ink-900 shadow-2xl'
        : 'text-gray-300 hover:text-white backdrop-blur-md bg-white/5 border border-white/10'
    }`}
    onClick={() => onClick(category.id)}
    initial={{ opacity: 0, scale: 0.8 }}
    whileInView={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    viewport={{ once: true }}
    whileHover={{
      scale: 1.05,
      boxShadow: selectedCategory === category.id
        ? '0 20px 40px rgba(34, 197, 94, 0.3)'
        : '0 10px 30px rgba(255, 255, 255, 0.1)'
    }}
    whileTap={{ scale: 0.95 }}
  >
    {/* Glass background for active state */}
    {selectedCategory === category.id && (
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-accent-400 to-accent-500"
        layoutId="activeCategory"
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
    )}

    {/* Glass effect overlay */}
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
    />

    <span className="relative z-10">{category.label}</span>
  </motion.button>
));

CategoryButton.displayName = 'CategoryButton';

// Memoized FeatureCard component for performance
const FeatureCard = memo(({
  feature,
  index,
  activeFeatures,
  onFeatureActivate
}: {
  feature: any;
  index: number;
  activeFeatures: string[];
  onFeatureActivate?: ((feature: string) => void) | undefined;
}) => (
  <motion.div
    className={`relative group overflow-hidden rounded-3xl transition-all duration-700 cursor-pointer ${
      activeFeatures.includes(feature.id)
        ? 'scale-105'
        : 'hover:scale-105'
    }`}
    initial={{ opacity: 0, y: 40, scale: 0.9 }}
    whileInView={{ opacity: 1, y: 0, scale: 1 }}
    transition={{
      duration: 0.6,
      delay: index * 0.1,
      type: "spring",
      stiffness: 100
    }}
    viewport={{ once: true }}
    whileHover={{
      y: -8,
      transition: { duration: 0.3 }
    }}
    onClick={() => onFeatureActivate?.(feature.id)}
    style={{
      transformStyle: 'preserve-3d',
    }}
  >
    {/* Glass morphism card */}
    <motion.div
      className="relative h-full backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 overflow-hidden"
      style={{
        boxShadow: activeFeatures.includes(feature.id)
          ? '0 20px 60px rgba(34, 197, 94, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
          : '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      }}
      whileHover={{
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
      }}
      transition={{ duration: 0.3 }}
    >
      {/* Animated background gradient */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        }}
      />

      {/* Active indicator with liquid animation */}
      {activeFeatures.includes(feature.id) && (
        <motion.div
          className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-r from-accent-400 to-accent-500 rounded-full flex items-center justify-center shadow-2xl"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 25,
            delay: 0.2
          }}
        >
          <motion.span
            className="text-ink-900 text-lg font-bold"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            ✓
          </motion.span>
        </motion.div>
      )}

      <div className="relative z-10">
        {/* Icon with glass effect */}
        <motion.div
          className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 backdrop-blur-md bg-white/10 border border-white/20 shadow-lg"
          whileHover={{
            scale: 1.1,
            rotate: 5,
            boxShadow: '0 15px 30px rgba(34, 197, 94, 0.2)'
          }}
          transition={{ duration: 0.3 }}
        >
          <div className={`text-accent-400 group-hover:text-accent-300 transition-colors duration-300`}>
            {feature.icon}
          </div>
        </motion.div>

        <motion.h3
          className="text-2xl font-bold text-white mb-4 group-hover:text-accent-200 transition-colors duration-300"
          layoutId={`title-${feature.id}`}
        >
          {feature.name}
        </motion.h3>

        <motion.p
          className="text-gray-300 text-sm leading-relaxed mb-6 group-hover:text-gray-200 transition-colors duration-300"
          layoutId={`desc-${feature.id}`}
        >
          {feature.description}
        </motion.p>

        {/* Category badge with glass effect */}
        <motion.div
          className="flex items-center justify-start pt-4 border-t border-white/10"
          whileHover={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
          transition={{ duration: 0.3 }}
        >
          <span className="px-4 py-2 backdrop-blur-md bg-white/5 border border-white/10 rounded-full text-xs font-medium text-gray-300 capitalize">
            {feature.category}
          </span>
        </motion.div>
      </div>

      {/* Subtle glass reflection */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      />

      {/* Hover glow effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-accent-500/5 via-transparent to-accent-600/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      />
    </motion.div>
  </motion.div>
));

FeatureCard.displayName = 'FeatureCard';

export const ControlPanel: React.FC<ControlPanelProps> = ({
  onFeatureActivate,
  activeFeatures = []
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'planning' | 'execution' | 'analysis'>('all');
  const containerRef = useRef<HTMLDivElement>(null);

  // Enhanced mouse tracking for glass effects with RAF optimization
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, SPRING_CONFIGS.mouseTracking);
  const springY = useSpring(mouseY, SPRING_CONFIGS.mouseTracking);

  useEffect(() => {
    let rafId: number;
    let isTracking = true;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isTracking || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = (e.clientX - centerX) / rect.width;
      const deltaY = (e.clientY - centerY) / rect.height;

      // Use RAF for smooth updates
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (isTracking) {
          mouseX.set(deltaX * 0.5);
          mouseY.set(deltaY * 0.5);
        }
      });
    };

    const throttledHandleMouseMove = (e: MouseEvent) => {
      handleMouseMove(e);
    };

    window.addEventListener('mousemove', throttledHandleMouseMove, { passive: true });
    return () => {
      isTracking = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', throttledHandleMouseMove);
    };
  }, [mouseX, mouseY]);

  // Memoized features array for performance
  const features = useMemo(() => [
    {
      id: 'smart-calendar',
      name: 'Smart Calendar',
      description: 'AI-powered scheduling that optimizes your tour route, venue availability, and load-in times.',
      category: 'planning',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      gradient: 'from-accent-400 to-accent-500'
    },
    {
      id: 'finance-tracker',
      name: 'Finance Tracker',
      description: 'Real-time revenue tracking with automatic expense categorization, merch sales, and profit projections.',
      category: 'analysis',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: 'from-accent-500 to-accent-600'
    },
    {
      id: 'alert-system',
      name: 'Alert System',
      description: 'Get notified instantly about schedule changes, weather issues, and ticket sales milestones.',
      category: 'execution',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.868 12.683A17.925 17.925 0 0112 21c7.962 0 12-1.21 12-2.683m-12 2.683a17.925 17.925 0 01-7.132-8.317M12 21c4.411 0 8-4.03 8-9s-3.589-9-8-9-8 4.03-8 9a9.06 9.06 0 001.832 5.683L4 21l4.868-8.317z" />
        </svg>
      ),
      gradient: 'from-accent-600 to-accent-700'
    },
    {
      id: 'venue-matching',
      name: 'Venue Matching',
      description: 'Find perfect venues based on capacity, acoustics, technical specs, and historical performance data.',
      category: 'planning',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      gradient: 'from-accent-300 to-accent-400'
    },
    {
      id: 'team-collaboration',
      name: 'Team Collaboration',
      description: 'Share setlists, stage plots, and updates with your entire tour team in real-time.',
      category: 'execution',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      gradient: 'from-accent-400 to-accent-500'
    },
    {
      id: 'analytics-dashboard',
      name: 'Analytics Dashboard',
      description: 'Comprehensive insights into ticket sales, audience demographics, and performance trends.',
      category: 'analysis',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      gradient: 'from-accent-500 to-accent-600'
    }
  ], []);

  // Memoized filtered features for performance
  const filteredFeatures = useMemo(() =>
    selectedCategory === 'all'
      ? features
      : features.filter(f => f.category === selectedCategory),
    [selectedCategory, features]
  );

  // Memoized categories array
  const categories = useMemo(() => [
    { id: 'all', label: 'All Features' },
    { id: 'planning', label: 'Planning' },
    { id: 'execution', label: 'Execution' },
    { id: 'analysis', label: 'Analysis' }
  ], []);

  return (
    <div ref={containerRef} className="w-full max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <motion.h2
          className="text-5xl md:text-6xl font-bold text-white mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          Take Control of Your Tour
        </motion.h2>
        <motion.p
          className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          Click any feature below to see how our intelligent system brings order to tour chaos.
        </motion.p>
      </div>

      {/* Category Filter - Enhanced Glass Design */}
      <motion.div
        className="flex flex-wrap justify-center gap-4 mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        viewport={{ once: true }}
      >
        {categories.map((category, index) => (
          <CategoryButton
            key={category.id}
            category={category}
            index={index}
            selectedCategory={selectedCategory}
            onClick={(id) => setSelectedCategory(id as any)}
          />
        ))}
      </motion.div>

      {/* Feature Grid - Premium Glass Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        viewport={{ once: true }}
      >
        {filteredFeatures.map((feature, index) => (
          <FeatureCard
            key={feature.id}
            feature={feature}
            index={index}
            activeFeatures={activeFeatures}
            onFeatureActivate={onFeatureActivate}
          />
        ))}
      </motion.div>
    </div>
  );
};