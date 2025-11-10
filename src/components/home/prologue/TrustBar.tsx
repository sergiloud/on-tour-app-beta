import React, { useRef, useEffect, useMemo, useCallback, memo } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useAnimation } from 'framer-motion';

interface TrustBarProps {
  showMetrics?: boolean;
  className?: string;
}

// Optimized spring configurations for performance
const SPRING_CONFIGS = {
  mouseTracking: {
    stiffness: 300,
    damping: 35,
    mass: 0.5,
    restDelta: 0.001
  },
  animations: {
    stiffness: 200,
    damping: 30,
    mass: 0.6,
    restDelta: 0.001
  }
} as const;

// Memoized FloatingElement component for performance
const FloatingElement = memo(({
  element
}: {
  element: {
    id: number;
    x: number;
    y: number;
    size: number;
    delay: number;
    duration: number;
  };
}) => (
  <motion.div
    className="absolute rounded-full backdrop-blur-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 will-change-transform"
    style={{
      width: element.size,
      height: element.size,
      left: `${element.x}%`,
      top: `${element.y}%`,
      willChange: 'transform',
    }}
    animate={{
      x: [0, 20, -15, 0],
      y: [0, -25, 10, 0],
      scale: [1, 1.3, 0.7, 1],
      opacity: [0.2, 0.5, 0.1, 0.2]
    }}
    transition={{
      duration: element.duration,
      repeat: Infinity,
      ease: "easeInOut",
      delay: element.delay,
      restDelta: 0.001,
    }}
  />
));

FloatingElement.displayName = 'FloatingElement';

export const TrustBar: React.FC<TrustBarProps> = ({
  showMetrics = false,
  className = ""
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Enhanced mouse tracking for subtle glass effects with RAF optimization
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
          mouseX.set(deltaX * 0.1);
          mouseY.set(deltaY * 0.1);
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

  // Memoized floating decorative elements for performance
  const floatingElements = useMemo(() => Array.from({ length: 6 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 8 + 4,
    delay: Math.random() * 3,
    duration: Math.random() * 4 + 6
  })), []);

  // Memoized trust metrics for performance
  const trustMetrics = useMemo(() => [
    { label: 'Active Tours', value: 1200, suffix: '+', icon: '🎪' },
    { label: 'Happy Artists', value: 850, suffix: '+', icon: '🎤' },
    { label: 'Venues Managed', value: 2500, suffix: '+', icon: '🏟️' },
    { label: 'Revenue Saved', value: 15, suffix: 'M+', icon: '💰' }
  ], []);

  return (
    <section
      ref={containerRef}
      className={`relative w-full py-24 px-6 overflow-hidden ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.6) 50%, rgba(0, 0, 0, 0.8) 100%)',
      }}
    >
      {/* Floating decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        {floatingElements.map((element) => (
          <FloatingElement key={element.id} element={element} />
        ))}
      </div>

      {/* Dynamic glass reflection */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-white/20 to-transparent"
        animate={{
          opacity: [0.3, 0.7, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Trust Metrics Section */}
        {showMetrics && (
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {trustMetrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                className="text-center group"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 150
                }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <motion.div
                  className="text-4xl mb-3"
                  animate={{
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.5
                  }}
                >
                  {metric.icon}
                </motion.div>
                <motion.div
                  className="text-3xl md:text-4xl font-bold text-accent-400 mb-2 group-hover:text-accent-300 transition-colors"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.3 + index * 0.1,
                    type: "spring",
                    stiffness: 200
                  }}
                  viewport={{ once: true }}
                >
                  {metric.value.toLocaleString()}{metric.suffix}
                </motion.div>
                <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                  {metric.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Main CTA Section with Premium Glass Design */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          {/* Glass morphism container */}
          <motion.div
            className="inline-block backdrop-blur-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-12 shadow-2xl mb-12"
            whileHover={{
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              backgroundColor: 'rgba(255, 255, 255, 0.08)'
            }}
            transition={{ duration: 0.3 }}
          >
            <motion.h2
              className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              viewport={{ once: true }}
            >
              Ready to Transform
              <motion.span
                className="block text-accent-400"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                viewport={{ once: true }}
              >
                Your Tour Experience?
              </motion.span>
            </motion.h2>

            <motion.p
              className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              viewport={{ once: true }}
            >
              Join thousands of artists and tour managers who have transformed chaos into control.
              Start your free trial today and experience the difference.
            </motion.p>

            {/* Premium CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.1 }}
              viewport={{ once: true }}
            >
              {/* Primary CTA with advanced glass effects */}
              <motion.button
                className="relative group overflow-hidden px-12 py-5 bg-gradient-to-r from-accent-500 to-accent-600 text-ink-900 font-bold text-xl rounded-2xl shadow-2xl transition-all duration-500"
                whileHover={{
                  scale: 1.05,
                  boxShadow: '0 20px 40px rgba(34, 197, 94, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                }}
                whileTap={{ scale: 0.95 }}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{
                  duration: 0.6,
                  delay: 1.2,
                  type: "spring",
                  stiffness: 150
                }}
                viewport={{ once: true }}
              >
                {/* Animated background gradient */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-accent-400 to-accent-500"
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />

                {/* Glass reflection effect */}
                <motion.div
                  className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
                  animate={{
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />

                <span className="relative z-10 flex items-center gap-3">
                  <span>Start Free Trial</span>
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    →
                  </motion.span>
                </span>
              </motion.button>

              {/* Secondary CTA with glass design */}
              <motion.button
                className="relative group px-12 py-5 backdrop-blur-xl bg-slate-200 dark:bg-slate-200 dark:bg-white/10 border-2 border-slate-300 dark:border-white/20 text-white font-bold text-xl rounded-2xl transition-all duration-500 overflow-hidden"
                whileHover={{
                  scale: 1.05,
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  borderColor: 'rgba(255, 255, 255, 0.4)',
                  boxShadow: '0 15px 30px rgba(255, 255, 255, 0.1)'
                }}
                whileTap={{ scale: 0.95 }}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{
                  duration: 0.6,
                  delay: 1.3,
                  type: "spring",
                  stiffness: 150
                }}
                viewport={{ once: true }}
              >
                {/* Subtle glass highlight */}
                <motion.div
                  className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />

                <span className="relative z-10 flex items-center gap-3">
                  <span>Watch Demo</span>
                  <motion.span
                    className="text-accent-400"
                    animate={{ rotate: [0, 360] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  >
                    ▶
                  </motion.span>
                </span>
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Trust indicators with glass badges */}
          <motion.div
            className="flex flex-wrap justify-center items-center gap-6 mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.5 }}
            viewport={{ once: true }}
          >
            {[
              { icon: '🔒', text: 'Enterprise Security' },
              { icon: '⚡', text: '99.9% Uptime' },
              { icon: '🎯', text: '24/7 Support' },
              { icon: '🌟', text: 'Award Winning' }
            ].map((badge, index) => (
              <motion.div
                key={badge.text}
                className="flex items-center gap-2 px-4 py-2 backdrop-blur-md bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full text-sm text-gray-300"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.5,
                  delay: 1.6 + index * 0.1,
                  type: "spring",
                  stiffness: 200
                }}
                viewport={{ once: true }}
                whileHover={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  scale: 1.05
                }}
              >
                <span className="text-lg">{badge.icon}</span>
                <span>{badge.text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Footer note with glass styling */}
          <motion.div
            className="backdrop-blur-md bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-8 py-6 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.8 }}
            viewport={{ once: true }}
            whileHover={{
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)'
            }}
          >
            <motion.p
              className="text-gray-300 text-lg leading-relaxed"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 2.0 }}
              viewport={{ once: true }}
            >
              <motion.span
                className="text-accent-400 font-semibold"
                animate={{
                  textShadow: [
                    '0 0 0px rgba(34, 197, 94, 0)',
                    '0 0 10px rgba(34, 197, 94, 0.5)',
                    '0 0 0px rgba(34, 197, 94, 0)'
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                No credit card required
              </motion.span>
              {' • '}
              <span className="text-slate-900 dark:text-white">14-day free trial</span>
              {' • '}
              <span className="text-slate-900 dark:text-white">Cancel anytime</span>
            </motion.p>

            {/* Subtle animated underline */}
            <motion.div
              className="w-24 h-px bg-gradient-to-r from-accent-500 to-accent-400 mx-auto mt-4 rounded-full"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 2.2 }}
              viewport={{ once: true }}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};