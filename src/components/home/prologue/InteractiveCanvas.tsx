import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useAnimation } from 'framer-motion';
import { sanitizeName } from '../../../lib/sanitize';

// Optimized spring configurations
const SPRING_CONFIGS = {
  mouseTracking: {
    stiffness: 400,
    damping: 40,
    mass: 0.5,
    restDelta: 0.001
  },
  transitions: {
    stiffness: 300,
    damping: 35,
    mass: 0.6,
    restDelta: 0.001
  }
} as const;

// Glass orb type definition
interface GlassOrb {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
}

// Memoized floating orb component
const FloatingOrb = memo(({ orb, index }: { orb: GlassOrb; index: number }) => {
  return (
    <motion.div
      className="absolute rounded-full backdrop-blur-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 will-change-transform"
      style={{
        width: orb.size,
        height: orb.size,
        left: `${orb.x}%`,
        top: `${orb.y}%`,
        willChange: 'transform',
      }}
      animate={{
        x: [0, 30, -20, 0],
        y: [0, -25, 15, 0],
        scale: [1, 1.2, 0.8, 1],
        opacity: [0.3, 0.6, 0.2, 0.3]
      }}
      transition={{
        duration: 8 + orb.delay,
        repeat: Infinity,
        ease: "easeInOut",
        delay: orb.delay,
        restDelta: 0.001,
      }}
    />
  );
});

FloatingOrb.displayName = 'FloatingOrb';

interface InteractiveCanvasProps {
  isActive?: boolean;
  onFeatureClick?: (feature: string) => void;
}

export const InteractiveCanvas: React.FC<InteractiveCanvasProps> = ({
  isActive = false,
  onFeatureClick
}) => {
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);
  const [activeDemo, setActiveDemo] = useState<'dashboard' | 'calendar' | 'finance'>('dashboard');
  const containerRef = useRef<HTMLDivElement>(null);

  // Enhanced mouse tracking with performance optimizations
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, SPRING_CONFIGS.mouseTracking);
  const springY = useSpring(mouseY, SPRING_CONFIGS.mouseTracking);

  // 3D rotation transforms
  const rotateX = useTransform(springY, [-0.5, 0.5], [15, -15]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-15, 15]);

  // Memoized floating orbs for consistent performance
  const floatingOrbs = useMemo(() => Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 20 + 10,
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

        mouseX.set(deltaX * 0.3);
        mouseY.set(deltaY * 0.3);
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [mouseX, mouseY]);

  // Simulate live data updates with more sophisticated data
  const [liveData, setLiveData] = useState({
    shows: 24,
    revenue: 125000,
    tickets: 8500,
    alerts: 3,
    profitMargin: 68,
    avgPerShow: 23400
  });

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setLiveData(prev => ({
        shows: Math.max(20, prev.shows + Math.floor(Math.random() * 5) - 2),
        revenue: Math.max(100000, prev.revenue + Math.floor(Math.random() * 8000) - 4000),
        tickets: Math.max(7000, prev.tickets + Math.floor(Math.random() * 200) - 100),
        alerts: Math.max(0, prev.alerts + Math.floor(Math.random() * 3) - 1),
        profitMargin: Math.max(60, Math.min(75, prev.profitMargin + Math.floor(Math.random() * 5) - 2)),
        avgPerShow: Math.max(20000, prev.avgPerShow + Math.floor(Math.random() * 2000) - 1000)
      }));
    }, 2500);

    return () => clearInterval(interval);
  }, [isActive]);

  const features = [
    { id: 'dashboard', label: 'Dashboard', x: 20, y: 20 },
    { id: 'calendar', label: 'Calendar', x: 60, y: 20 },
    { id: 'finance', label: 'Finance', x: 20, y: 60 },
    { id: 'shows', label: 'Shows', x: 60, y: 60 }
  ];

  // Floating glass orbs for ambient effect
  const glassOrbs = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 20 + 10,
    delay: Math.random() * 2
  }));

  return (
    <motion.div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      style={{
        perspective: '1000px',
        transformStyle: 'preserve-3d'
      }}
    >
      {/* Optimized Floating glass orbs background */}
      <div className="absolute inset-0 pointer-events-none">
        {floatingOrbs.map((orb, index) => (
          <FloatingOrb key={orb.id} orb={orb} index={index} />
        ))}
      </div>

      {/* Main glass container with 3D effect */}
      <motion.div
        className="relative w-full h-full backdrop-blur-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-2xl"
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d'
        }}
        whileHover={{
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Dynamic glass reflection */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Browser-like header with glass effect */}
        <motion.div
          className="relative backdrop-blur-md bg-slate-100 dark:bg-white/5 px-6 py-4 flex items-center gap-3 border-b border-white/10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex gap-2">
            <motion.div
              className="w-3 h-3 bg-red-500/80 backdrop-blur-sm rounded-full border border-red-400/30"
              whileHover={{ scale: 1.2, backgroundColor: 'rgba(239, 68, 68, 0.9)' }}
            />
            <motion.div
              className="w-3 h-3 bg-yellow-500/80 backdrop-blur-sm rounded-full border border-yellow-400/30"
              whileHover={{ scale: 1.2, backgroundColor: 'rgba(234, 179, 8, 0.9)' }}
            />
            <motion.div
              className="w-3 h-3 bg-green-500/80 backdrop-blur-sm rounded-full border border-green-400/30"
              whileHover={{ scale: 1.2, backgroundColor: 'rgba(34, 197, 94, 0.9)' }}
            />
          </div>
          <motion.div
            className="flex-1 backdrop-blur-sm bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2 text-sm text-gray-300 text-center shadow-inner"
            whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
          >
            on-tour-app.com/{activeDemo}
          </motion.div>

          {/* Live indicator */}
          <motion.div
            className="flex items-center gap-2 px-3 py-1 backdrop-blur-sm bg-green-500/10 border border-green-500/20 rounded-full"
            animate={{ opacity: [1, 0.7, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.div
              className="w-2 h-2 bg-green-400 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-xs text-green-400 font-medium">LIVE</span>
          </motion.div>
        </motion.div>

        {/* Main canvas area with glass panels */}
        <div className="relative h-full p-8">
          {/* Feature navigation with glass buttons */}
          <motion.div
            className="absolute top-6 right-6 flex gap-3 z-10"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {features.map((feature, index) => (
              <motion.button
                key={feature.id}
                className={`relative w-4 h-4 rounded-full backdrop-blur-md border transition-all duration-500 overflow-hidden ${activeDemo === feature.id
                  ? 'bg-accent-500/80 border-accent-400/50 shadow-lg shadow-accent-500/30'
                  : 'bg-slate-200 dark:bg-white/10 border-slate-300 dark:border-white/20 hover:bg-white/20'
                  }`}
                whileHover={{
                  scale: 1.3,
                  boxShadow: activeDemo === feature.id
                    ? '0 0 20px rgba(34, 197, 94, 0.5)'
                    : '0 0 15px rgba(255, 255, 255, 0.2)'
                }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setActiveDemo(feature.id as any)}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 200
                }}
              >
                {/* Active pulse effect */}
                {activeDemo === feature.id && (
                  <motion.div
                    className="absolute inset-0 bg-accent-400 rounded-full"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 0, 0.5]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                )}
              </motion.button>
            ))}
          </motion.div>

          <AnimatePresence mode="wait">
            {activeDemo === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 30, rotateX: -15 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                exit={{ opacity: 0, y: -30, rotateX: 15 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
                className="h-full space-y-8"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* KPI Cards with premium glass design */}
                <motion.div
                  className="grid grid-cols-2 md:grid-cols-4 gap-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  {[
                    { label: 'Total Shows', value: liveData.shows, change: '+2', color: 'text-accent-400', icon: '🎪' },
                    { label: 'Revenue', value: `$${liveData.revenue.toLocaleString()}`, change: '+$8.2k', color: 'text-accent-500', icon: '💰' },
                    { label: 'Tickets Sold', value: liveData.tickets.toLocaleString(), change: '+127', color: 'text-accent-600', icon: '🎫' },
                    { label: 'Active Alerts', value: liveData.alerts, change: liveData.alerts > 0 ? '-1' : '0', color: 'text-red-400', icon: '🚨' }
                  ].map((kpi, index) => (
                    <motion.div
                      key={kpi.label}
                      className="relative group overflow-hidden"
                      initial={{ opacity: 0, scale: 0.8, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{
                        duration: 0.5,
                        delay: index * 0.1,
                        type: "spring",
                        stiffness: 150
                      }}
                      whileHover={{
                        y: -8,
                        scale: 1.05,
                        transition: { duration: 0.3 }
                      }}
                    >
                      <motion.div
                        className="relative backdrop-blur-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 h-full shadow-lg"
                        whileHover={{
                          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
                          backgroundColor: 'rgba(255, 255, 255, 0.08)'
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        {/* Icon with glass effect */}
                        <motion.div
                          className="text-2xl mb-3"
                          animate={{
                            rotate: [0, 5, -5, 0],
                          }}
                          transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: index * 0.5
                          }}
                        >
                          {kpi.icon}
                        </motion.div>

                        <div className="text-sm text-gray-400 mb-2 font-medium">{kpi.label}</div>
                        <motion.div
                          className={`text-2xl font-bold mb-2 ${kpi.color}`}
                          key={kpi.value}
                          initial={{ scale: 1.1 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          {kpi.value}
                        </motion.div>
                        <motion.div
                          className="text-xs text-gray-500 px-2 py-1 backdrop-blur-sm bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full inline-block"
                          whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                        >
                          {kpi.change} this week
                        </motion.div>

                        {/* Subtle glass highlight */}
                        <motion.div
                          className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-slate-100/20 to-transparent dark:from-white/10 dark:to-transparent rounded-full blur-xl"
                          animate={{
                            opacity: [0.3, 0.6, 0.3],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: index * 0.3
                          }}
                        />
                      </motion.div>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Mini calendar preview with glass design */}
                <motion.div
                  className="backdrop-blur-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  whileHover={{
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)'
                  }}
                >
                  <motion.h3
                    className="text-xl font-bold text-white mb-6 flex items-center gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <span className="text-2xl">📅</span>
                    Upcoming Shows
                  </motion.h3>
                  <div className="space-y-4">
                    {[
                      { date: 'Dec 15', venue: 'Madison Square Garden', city: 'NYC', status: 'confirmed' },
                      { date: 'Dec 18', venue: 'The Forum', city: 'LA', status: 'confirmed' },
                      { date: 'Dec 22', venue: 'United Center', city: 'Chicago', status: 'pending' }
                    ].map((show, index) => (
                      <motion.div
                        key={show.date}
                        className="relative flex items-center justify-between p-4 backdrop-blur-sm bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl group cursor-pointer overflow-hidden"
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: 0.8 + index * 0.1,
                          type: "spring",
                          stiffness: 100
                        }}
                        whileHover={{
                          x: 8,
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)'
                        }}
                        onClick={() => onFeatureClick?.('calendar')}
                      >
                        {/* Status indicator */}
                        <motion.div
                          className={`absolute left-0 top-0 bottom-0 w-1 ${show.status === 'confirmed' ? 'bg-accent-500' : 'bg-yellow-500'
                            }`}
                          initial={{ scaleY: 0 }}
                          animate={{ scaleY: 1 }}
                          transition={{ delay: 1 + index * 0.1, duration: 0.3 }}
                        />

                        <div className="ml-4">
                          <motion.div
                            className="font-semibold text-white text-lg group-hover:text-accent-200 transition-colors"
                            layoutId={`venue-${show.date}`}
                          >
                            {sanitizeName(show.venue)}
                          </motion.div>
                          <motion.div
                            className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors"
                            layoutId={`city-${show.date}`}
                          >
                            {sanitizeName(show.city)}
                          </motion.div>
                        </div>
                        <motion.div
                          className="text-right mr-4"
                          layoutId={`date-${show.date}`}
                        >
                          <div className="text-lg font-bold text-accent-400 group-hover:text-accent-300 transition-colors">
                            {show.date}
                          </div>
                          <div className={`text-xs px-2 py-1 rounded-full backdrop-blur-sm border ${show.status === 'confirmed'
                            ? 'bg-accent-500/20 border-accent-500/30 text-accent-300'
                            : 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300'
                            }`}>
                            {show.status}
                          </div>
                        </motion.div>

                        {/* Hover glow */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-accent-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}

            {activeDemo === 'calendar' && (
              <motion.div
                key="calendar"
                initial={{ opacity: 0, y: 30, rotateX: -15 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                exit={{ opacity: 0, y: -30, rotateX: 15 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
                className="h-full"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <motion.div
                  className="backdrop-blur-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 h-full shadow-lg"
                  whileHover={{
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)'
                  }}
                >
                  <motion.h3
                    className="text-xl font-bold text-white mb-6 flex items-center gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <span className="text-2xl">📅</span>
                    Tour Calendar
                  </motion.h3>

                  {/* Calendar header */}
                  <motion.div
                    className="grid grid-cols-7 gap-2 mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                      <motion.div
                        key={day}
                        className="text-center text-sm font-semibold text-gray-300 py-3 backdrop-blur-sm bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + index * 0.05 }}
                      >
                        {day}
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Calendar grid */}
                  <motion.div
                    className="grid grid-cols-7 gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    {Array.from({ length: 35 }, (_, i) => {
                      const hasShow = [5, 12, 19, 26].includes(i);
                      const isToday = i === 7;
                      return (
                        <motion.div
                          key={i}
                          className={`aspect-square flex items-center justify-center text-sm rounded-xl cursor-pointer transition-all duration-300 backdrop-blur-sm border relative overflow-hidden ${hasShow
                            ? 'bg-accent-500/20 border-accent-400/30 text-accent-200 shadow-lg shadow-accent-500/20'
                            : isToday
                              ? 'bg-slate-200 dark:bg-white/10 border-slate-300 dark:border-white/20 text-white font-bold'
                              : 'bg-white/5 border-slate-200 dark:border-white/10 text-gray-300 hover:bg-slate-200 dark:bg-white/10 hover:border-white/20'
                            }`}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{
                            delay: 0.7 + (i % 7) * 0.02 + Math.floor(i / 7) * 0.05,
                            type: "spring",
                            stiffness: 200
                          }}
                          whileHover={{
                            scale: 1.1,
                            boxShadow: hasShow
                              ? '0 10px 20px rgba(34, 197, 94, 0.3)'
                              : '0 5px 15px rgba(255, 255, 255, 0.1)'
                          }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => hasShow && onFeatureClick?.('calendar')}
                        >
                          {i + 1}

                          {/* Show indicator */}
                          {hasShow && (
                            <motion.div
                              className="absolute -top-1 -right-1 w-3 h-3 bg-accent-400 rounded-full border-2 border-white"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{
                                delay: 1 + i * 0.1,
                                type: "spring",
                                stiffness: 300
                              }}
                            />
                          )}

                          {/* Today indicator */}
                          {isToday && (
                            <motion.div
                              className="absolute inset-0 border-2 border-accent-400 rounded-xl"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 1.2 }}
                            />
                          )}
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </motion.div>
              </motion.div>
            )}

            {activeDemo === 'finance' && (
              <motion.div
                key="finance"
                initial={{ opacity: 0, y: 30, rotateX: -15 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                exit={{ opacity: 0, y: -30, rotateX: 15 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
                className="h-full"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <motion.div
                  className="backdrop-blur-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-8 h-full shadow-lg"
                  whileHover={{
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)'
                  }}
                >
                  <motion.h3
                    className="text-2xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <span className="text-3xl">💰</span>
                    Financial Overview
                  </motion.h3>

                  <div className="space-y-8">
                    {/* Main revenue display */}
                    <motion.div
                      className="text-center py-8"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <div className="text-gray-400 mb-4 text-lg">Tour Revenue</div>
                      <motion.div
                        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-accent-400 mb-4"
                        key={liveData.revenue}
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        ${liveData.revenue.toLocaleString()}
                      </motion.div>
                      <motion.div
                        className="w-full backdrop-blur-sm bg-slate-200 dark:bg-slate-200 dark:bg-white/10 border border-slate-300 dark:border-white/20 rounded-full h-3 overflow-hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                      >
                        <motion.div
                          className="bg-gradient-to-r from-accent-500 to-accent-400 h-full rounded-full shadow-lg"
                          initial={{ width: 0 }}
                          animate={{ width: '75%' }}
                          transition={{ duration: 1.5, delay: 0.8, ease: "easeOut" }}
                        />
                      </motion.div>
                      <div className="text-sm text-gray-400 mt-2">75% of annual goal</div>
                    </motion.div>

                    {/* Stats grid */}
                    <motion.div
                      className="grid grid-cols-2 gap-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1 }}
                    >
                      <motion.div
                        className="text-center p-6 backdrop-blur-sm bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl"
                        whileHover={{
                          scale: 1.05,
                          boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)',
                          backgroundColor: 'rgba(255, 255, 255, 0.08)'
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <motion.div
                          className="text-4xl font-bold text-accent-500 mb-2"
                          key={liveData.profitMargin}
                          initial={{ scale: 1.1 }}
                          animate={{ scale: 1 }}
                        >
                          {liveData.profitMargin}%
                        </motion.div>
                        <div className="text-sm text-gray-400">Profit Margin</div>
                        <motion.div
                          className="w-full bg-slate-200 dark:bg-slate-200 dark:bg-white/10 rounded-full h-1 mt-3 overflow-hidden"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1.2 }}
                        >
                          <motion.div
                            className="bg-accent-500 h-full rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${liveData.profitMargin}%` }}
                            transition={{ duration: 1, delay: 1.4 }}
                          />
                        </motion.div>
                      </motion.div>

                      <motion.div
                        className="text-center p-6 backdrop-blur-sm bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl"
                        whileHover={{
                          scale: 1.05,
                          boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)',
                          backgroundColor: 'rgba(255, 255, 255, 0.08)'
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <motion.div
                          className="text-4xl font-bold text-accent-600 mb-2"
                          key={liveData.avgPerShow}
                          initial={{ scale: 1.1 }}
                          animate={{ scale: 1 }}
                        >
                          ${Math.round(liveData.avgPerShow / 1000)}k
                        </motion.div>
                        <div className="text-sm text-gray-400">Avg per Show</div>
                        <motion.div
                          className="w-full bg-slate-200 dark:bg-slate-200 dark:bg-white/10 rounded-full h-1 mt-3 overflow-hidden"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1.2 }}
                        >
                          <motion.div
                            className="bg-accent-600 h-full rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: '80%' }}
                            transition={{ duration: 1, delay: 1.4 }}
                          />
                        </motion.div>
                      </motion.div>
                    </motion.div>

                    {/* Expense breakdown */}
                    <motion.div
                      className="space-y-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.6 }}
                    >
                      <h4 className="text-lg font-semibold text-white mb-4">Top Expenses</h4>
                      {[
                        { category: 'Venue Rental', amount: 45000, percentage: 36 },
                        { category: 'Crew & Staff', amount: 32000, percentage: 26 },
                        { category: 'Equipment', amount: 25000, percentage: 20 },
                        { category: 'Marketing', amount: 18000, percentage: 14 }
                      ].map((expense, index) => (
                        <motion.div
                          key={expense.category}
                          className="flex items-center justify-between p-4 backdrop-blur-sm bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1.8 + index * 0.1 }}
                          whileHover={{
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                            x: 8
                          }}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-3 h-3 bg-accent-500 rounded-full"></div>
                            <span className="text-gray-300">{expense.category}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-slate-900 dark:text-white font-semibold">${expense.amount.toLocaleString()}</div>
                            <div className="text-sm text-gray-400">{expense.percentage}%</div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Interactive overlay for feature highlights */}
          <AnimatePresence>
            {hoveredFeature && (
              <motion.div
                className="absolute inset-0 backdrop-blur-md bg-black/60 flex items-center justify-center z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="backdrop-blur-xl bg-slate-200 dark:bg-slate-200 dark:bg-white/10 border border-slate-300 dark:border-white/20 p-8 rounded-3xl max-w-md mx-4 shadow-2xl"
                  initial={{ scale: 0.8, opacity: 0, rotateX: -20 }}
                  animate={{ scale: 1, opacity: 1, rotateX: 0 }}
                  exit={{ scale: 0.8, opacity: 0, rotateX: 20 }}
                  transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <motion.h4
                    className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <span className="text-3xl">
                      {features.find(f => f.id === hoveredFeature)?.id === 'dashboard' ? '📊' :
                        features.find(f => f.id === hoveredFeature)?.id === 'calendar' ? '📅' :
                          features.find(f => f.id === hoveredFeature)?.id === 'finance' ? '💰' : '🎪'}
                    </span>
                    {features.find(f => f.id === hoveredFeature)?.label}
                  </motion.h4>
                  <motion.p
                    className="text-gray-300 text-base leading-relaxed mb-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    Click to explore this feature in detail and see how it transforms your tour management workflow with real-time insights and intelligent automation.
                  </motion.p>
                  <motion.button
                    className="w-full py-3 px-6 backdrop-blur-md bg-accent-500/20 border border-accent-400/30 rounded-xl text-accent-200 font-semibold hover:bg-accent-500/30 transition-all duration-300"
                    whileHover={{
                      scale: 1.02,
                      boxShadow: '0 10px 20px rgba(34, 197, 94, 0.3)'
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onFeatureClick?.(hoveredFeature)}
                  >
                    Explore Feature
                  </motion.button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};
