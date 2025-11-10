import React, { useEffect, useRef, useState, useMemo, useCallback, memo } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useAnimation } from 'framer-motion';

// Optimized spring configurations
const SPRING_CONFIGS = {
  mouseTracking: {
    stiffness: 400,
    damping: 25,
    mass: 0.5,
    restDelta: 0.001
  },
  particles: {
    stiffness: 200,
    damping: 20,
    mass: 0.3,
    restDelta: 0.001
  }
} as const;

// Memoized particle component for better performance
const FloatingParticle = memo(({ particle, index }: { particle: any; index: number }) => (
  <motion.div
    className="absolute w-2 h-2 bg-accent-400/30 rounded-full"
    style={{
      left: `${particle.x}%`,
      top: `${particle.y}%`,
      willChange: 'transform, opacity'
    }}
    animate={{
      x: [0, particle.moveX, -particle.moveX, 0],
      y: [0, particle.moveY, -particle.moveY, 0],
      scale: [1, particle.scale, 0.5, 1],
      opacity: [0.3, 0.8, 0.2, 0.3]
    }}
    transition={{
      duration: particle.duration,
      repeat: Infinity,
      ease: "easeInOut",
      delay: particle.delay
    }}
  />
));

FloatingParticle.displayName = 'FloatingParticle';

export const ChaosHero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const controls = useAnimation();

  // Enhanced mouse tracking with performance optimizations
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Optimized spring configurations for liquid-like movement
  const springX = useSpring(mouseX, SPRING_CONFIGS.mouseTracking);
  const springY = useSpring(mouseY, SPRING_CONFIGS.mouseTracking);

  // 3D transform values for depth effects
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [15, -15]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-15, 15]);

  // Memoized floating particles for consistent performance
  const floatingParticles = useMemo(() => Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    moveX: (Math.random() - 0.5) * 100,
    moveY: (Math.random() - 0.5) * 100,
    scale: Math.random() * 0.5 + 0.5,
    duration: Math.random() * 4 + 6,
    delay: Math.random() * 2
  })), []);

  // Optimized mouse tracking with RAF
  useEffect(() => {
    let rafId: number;
    const handleMouseMove = (e: MouseEvent) => {
      if (rafId) cancelAnimationFrame(rafId);

      rafId = requestAnimationFrame(() => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Enhanced mouse tracking with bounds checking
        const deltaX = Math.max(-1, Math.min(1, (e.clientX - centerX) / rect.width));
        const deltaY = Math.max(-1, Math.min(1, (e.clientY - centerY) / rect.height));

        setMousePosition({ x: deltaX, y: deltaY });
        mouseX.set(deltaX * 0.5);
        mouseY.set(deltaY * 0.5);
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [mouseX, mouseY]);



  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        perspective: '1200px',
        transformStyle: 'preserve-3d'
      }}
    >
      {/* Liquid Glass Background Layers */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 30% 20%, rgba(34, 197, 94, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 70% 80%, rgba(37, 99, 235, 0.06) 0%, transparent 50%),
            linear-gradient(135deg, rgba(55, 65, 81, 0.03) 0%, transparent 100%)
          `,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          x: springX,
          y: springY,
        }}
      />

      {/* Optimized Floating Glass Particles */}
      {floatingParticles.map((particle, index) => (
        <FloatingParticle key={particle.id} particle={particle} index={index} />
      ))}

      {/* Chaotic Geometric Elements with Glass Effect */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-20 h-20"
        style={{
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(37, 99, 235, 0.1))',
          borderRadius: '50%',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          x: useTransform(springX, x => x * 60),
          y: useTransform(springY, y => y * 60),
          rotateX: useTransform(mouseY, [-0.5, 0.5], [10, -10]),
          rotateY: useTransform(mouseX, [-0.5, 0.5], [-10, 10]),
        }}
        animate={{
          rotate: [0, 180, 360],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <motion.div
        className="absolute top-1/3 right-1/3 w-16 h-16"
        style={{
          background: 'linear-gradient(45deg, rgba(37, 99, 235, 0.15), rgba(34, 197, 94, 0.1))',
          borderRadius: '20%',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          x: useTransform(springX, x => x * -40),
          y: useTransform(springY, y => y * -40),
          rotateX: useTransform(mouseY, [-0.5, 0.5], [-8, 8]),
          rotateY: useTransform(mouseX, [-0.5, 0.5], [8, -8]),
        }}
        animate={{
          rotate: [45, 225, 405],
          borderRadius: ['20%', '50%', '20%'],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />

      <motion.div
        className="absolute bottom-1/4 left-1/3 w-24 h-12"
        style={{
          background: 'linear-gradient(90deg, rgba(34, 197, 94, 0.12), rgba(37, 99, 235, 0.08))',
          borderRadius: '50%',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          x: useTransform(springX, x => x * 80),
          y: useTransform(springY, y => y * 80),
          rotateX: useTransform(mouseY, [-0.5, 0.5], [5, -5]),
          rotateY: useTransform(mouseX, [-0.5, 0.5], [-5, 5]),
        }}
        animate={{
          scaleX: [1, 1.8, 1],
          rotate: [0, 90, 180],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />

      {/* Glass Reflection Overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            linear-gradient(135deg,
              rgba(255, 255, 255, 0.03) 0%,
              transparent 30%,
              transparent 70%,
              rgba(255, 255, 255, 0.02) 100%
            )
          `,
          backdropFilter: 'blur(0.5px)',
        }}
      />

      {/* Main Content with Glass Morphism */}
      <motion.div
        className="relative z-10 text-center px-6 max-w-5xl mx-auto"
        style={{
          rotateX: useTransform(mouseY, [-0.5, 0.5], [5, -5]),
          rotateY: useTransform(mouseX, [-0.5, 0.5], [-5, 5]),
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Glass morphism container for title */}
        <motion.div
          className="backdrop-blur-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-8 md:p-12 mb-8"
          style={{
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          }}
          whileHover={{
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
            scale: 1.02,
          }}
          transition={{ duration: 0.3 }}
        >
          <motion.h1
            className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-accent-300 via-accent-400 to-accent-500 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{
              textShadow: '0 0 40px rgba(34, 197, 94, 0.3)',
              filter: 'drop-shadow(0 0 20px rgba(34, 197, 94, 0.2))'
            }}
          >
            Touring is Chaos.
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-slate-700 dark:text-slate-700 dark:text-white/90 mb-8 leading-relaxed max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          >
            Scattered setlists, endless rider negotiations, and last-minute venue changes.
            You're managing a world tour, but it feels like you're just surviving the road.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
          >
            <motion.button
              className="px-10 py-5 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-ink-900 font-bold rounded-2xl shadow-2xl hover:shadow-accent-500/25 transition-all duration-300 backdrop-blur-sm border border-white/10"
              whileHover={{
                scale: 1.05,
                boxShadow: '0 20px 40px rgba(34, 197, 94, 0.3)',
              }}
              whileTap={{ scale: 0.95 }}
              style={{
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
              }}
            >
              See the Solution
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Enhanced scroll indicator with glass effect */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="backdrop-blur-md bg-slate-200 dark:bg-slate-200 dark:bg-white/10 border border-slate-300 dark:border-white/20 rounded-full p-3 shadow-lg">
          <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center">
            <motion.div
              className="w-1 h-3 bg-white/60 rounded-full mt-2"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
};