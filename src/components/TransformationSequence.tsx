import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';

interface TransformationSequenceProps {
  className?: string;
}

/**
 * TransformationSequence - The core visual component of Project Metamorphosis
 *
 * This component creates a scroll-driven animation that transforms a chaotic Excel
 * spreadsheet into a clean, organized tour management dashboard. The animation
 * responds to user scroll, creating an immersive storytelling experience.
 */
export const TransformationSequence = ({ className }: TransformationSequenceProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  });

  // Smooth scroll progress for more natural animation
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  // Transform values for different animation phases
  const spreadsheetOpacity = useTransform(smoothProgress, [0, 0.3], [1, 0]);
  const dashboardOpacity = useTransform(smoothProgress, [0.4, 1], [0, 1]);

  // Row transformation animations
  const row1Y = useTransform(smoothProgress, [0.1, 0.4], [0, -200]);
  const row2Y = useTransform(smoothProgress, [0.15, 0.45], [0, -150]);
  const row3Y = useTransform(smoothProgress, [0.2, 0.5], [0, -100]);

  // Column transformations
  const dateColumnScale = useTransform(smoothProgress, [0.3, 0.6], [1, 0.8]);
  const cityColumnScale = useTransform(smoothProgress, [0.35, 0.65], [1, 0.8]);
  const venueColumnScale = useTransform(smoothProgress, [0.4, 0.7], [1, 0.8]);

  // Finance column morphing into KPI widget
  const financeColumnX = useTransform(smoothProgress, [0.5, 0.8], [0, 300]);
  const financeColumnY = useTransform(smoothProgress, [0.5, 0.8], [0, -50]);
  const financeColumnScale = useTransform(smoothProgress, [0.5, 0.8], [1, 0.6]);

  // Contact column morphing into contact hub
  const contactColumnX = useTransform(smoothProgress, [0.6, 0.9], [0, -300]);
  const contactColumnY = useTransform(smoothProgress, [0.6, 0.9], [0, -30]);

  return (
    <div ref={containerRef} className={`relative h-[300vh] ${className || ''}`}>
      {/* Fixed background */}
      <div className="sticky top-0 h-screen overflow-hidden bg-[var(--color-ink-900)]">
        {/* Excel Spreadsheet Layer */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          style={{ opacity: spreadsheetOpacity }}
        >
          <div className="w-full max-w-6xl mx-6">
            {/* Spreadsheet Header */}
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-white/10 px-6 py-3 text-left text-xs uppercase tracking-[0.35em] text-slate-300 dark:text-white/50 mb-4">
              <motion.span style={{ scale: dateColumnScale }}>Date</motion.span>
              <motion.span style={{ scale: cityColumnScale }}>City</motion.span>
              <motion.span style={{ scale: venueColumnScale }}>Venue</motion.span>
              <span>Contact</span>
              <motion.span style={{ x: financeColumnX, y: financeColumnY, scale: financeColumnScale }}>
                Flight #
              </motion.span>
              <motion.span style={{ x: financeColumnX, y: financeColumnY, scale: financeColumnScale }}>
                Hotel Conf.
              </motion.span>
              <motion.span style={{ x: financeColumnX, y: financeColumnY, scale: financeColumnScale }}>
                Fee
              </motion.span>
              <motion.span style={{ x: financeColumnX, y: financeColumnY, scale: financeColumnScale }}>
                Expenses
              </motion.span>
            </div>

            {/* Spreadsheet Rows */}
            <div className="space-y-4">
              <motion.div
                className="grid grid-cols-9 gap-3 px-6 py-4 rounded-lg border border-slate-200 dark:border-white/10 bg-black/40"
                style={{ y: row1Y }}
              >
                <span className="text-slate-500 dark:text-white/70">Apr 02</span>
                <span className="text-slate-500 dark:text-white/70">Madrid</span>
                <span className="text-slate-500 dark:text-white/70">WiZink Center</span>
                <span className="text-slate-500 dark:text-white/70">Sonia (promoter)</span>
                <span className="text-red-400">#REF!</span>
                <span className="text-red-400">#VALUE!</span>
                <span className="text-slate-500 dark:text-white/70">$42,500</span>
                <span className="text-red-400">#REF!</span>
                <span className="text-red-400 font-bold">-1,250.00</span>
              </motion.div>

              <motion.div
                className="grid grid-cols-9 gap-3 px-6 py-4 rounded-lg border border-slate-200 dark:border-white/10 bg-black/40"
                style={{ y: row2Y }}
              >
                <span className="text-slate-500 dark:text-white/70">Apr 05</span>
                <span className="text-slate-500 dark:text-white/70">Berlin</span>
                <span className="text-slate-500 dark:text-white/70">Tempodrom</span>
                <span className="text-slate-500 dark:text-white/70">Email??</span>
                <span className="text-red-400">#REF!</span>
                <span className="text-red-400">#VALUE!</span>
                <span className="text-slate-500 dark:text-white/70">$39,000</span>
                <span className="text-red-400">#REF!</span>
                <span className="text-red-400 font-bold">-850.00</span>
              </motion.div>

              <motion.div
                className="grid grid-cols-9 gap-3 px-6 py-4 rounded-lg border border-slate-200 dark:border-white/10 bg-black/40"
                style={{ y: row3Y }}
              >
                <span className="text-slate-500 dark:text-white/70">Apr 08</span>
                <span className="text-slate-500 dark:text-white/70">Amsterdam</span>
                <span className="text-slate-500 dark:text-white/70">AFAS Live</span>
                <span className="text-slate-500 dark:text-white/70">Sheet 4 →</span>
                <span className="text-red-400">#REF!</span>
                <span className="text-red-400">#VALUE!</span>
                <span className="text-slate-500 dark:text-white/70">$41,200</span>
                <span className="text-red-400">#REF!</span>
                <span className="text-red-400 font-bold">-2,100.00</span>
              </motion.div>
            </div>

            {/* Anonymous cursors */}
            <motion.div
              className="absolute top-20 left-32 w-2 h-4 bg-blue-400 rounded-sm"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div
              className="absolute top-32 right-48 w-2 h-4 bg-green-400 rounded-sm"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
            />
          </div>
        </motion.div>

        {/* Dashboard Layer */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          style={{ opacity: dashboardOpacity }}
        >
          <div className="w-full max-w-6xl mx-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Itinerary Card */}
            <motion.div
              className="rounded-2xl border border-slate-200 dark:border-white/10 bg-gradient-to-br from-black/60 to-black/40 p-6 shadow-2xl"
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 rounded-full bg-[var(--color-accent-500)]" />
                <span className="text-sm uppercase tracking-wide text-slate-400 dark:text-white/60">Tour Itinerary</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-100 dark:bg-white/5">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Madrid • WiZink Center</p>
                    <p className="text-sm text-slate-400 dark:text-white/60">Apr 02 • Soundcheck 16:00</p>
                  </div>
                  <span className="text-[var(--color-accent-500)]">✓ Confirmed</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-100 dark:bg-white/5">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Berlin • Tempodrom</p>
                    <p className="text-sm text-slate-400 dark:text-white/60">Apr 05 • Routing locked</p>
                  </div>
                  <span className="text-[var(--color-accent-500)]">✓ Confirmed</span>
                </div>
              </div>
            </motion.div>

            {/* KPI Widget */}
            <motion.div
              className="rounded-2xl border border-slate-200 dark:border-white/10 bg-gradient-to-br from-black/60 to-black/40 p-6 shadow-2xl"
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm uppercase tracking-wide text-slate-400 dark:text-white/60">Projected Net</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-xs text-emerald-400">Live</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-[var(--color-accent-500)]">$127,650</p>
                <p className="text-sm text-emerald-400 mt-2">+18.2% vs target</p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">$165,700</p>
                  <p className="text-xs text-slate-400 dark:text-white/60">Total Revenue</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">$38,050</p>
                  <p className="text-xs text-slate-400 dark:text-white/60">Total Expenses</p>
                </div>
              </div>
            </motion.div>

            {/* Contact Hub */}
            <motion.div
              className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-white/10 bg-gradient-to-br from-black/60 to-black/40 p-6 shadow-2xl"
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 rounded-full bg-[var(--color-accent-500)]" />
                <span className="text-sm uppercase tracking-wide text-slate-400 dark:text-white/60">Contact Hub</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-4 p-3 rounded-lg bg-slate-100 dark:bg-white/5">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-accent-500)] flex items-center justify-center text-black font-semibold">
                    S
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Sonia Vega</p>
                    <p className="text-sm text-slate-400 dark:text-white/60">Promoter • WiZink Center</p>
                  </div>
                  <button className="ml-auto px-3 py-1 rounded border border-slate-300 dark:border-white/20 text-xs uppercase tracking-wide text-slate-500 dark:text-white/70 hover:bg-slate-200 dark:bg-white/10">
                    Call
                  </button>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-lg bg-slate-100 dark:bg-white/5">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                    A
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Adam Reed</p>
                    <p className="text-sm text-slate-400 dark:text-white/60">Agency Lead</p>
                  </div>
                  <button className="ml-auto px-3 py-1 rounded border border-slate-300 dark:border-white/20 text-xs uppercase tracking-wide text-slate-500 dark:text-white/70 hover:bg-slate-200 dark:bg-white/10">
                    Message
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};