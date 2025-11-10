import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, MotionValue } from 'framer-motion';

/**
 * Zenith version of the Metamorphosis centerpiece.
 * - Chaotic "Excel" grid (irregular cells, truncated text, discordant colors)
 * - Data chips animate along SVG path arcs into orderly UI targets
 * - Ripple pulse when chips land
 */
export interface MetamorphosisZenithProps {
  className?: string;
  scrollProgress?: MotionValue<number> | number; // Accept both MotionValue and number for flexibility
}

const XIcon = () => (
  <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ArrowUpIcon = () => (
  <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
  </svg>
);

const ProblemIcon = () => (
  <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

interface ChipSpec { id: string; label: React.ReactNode; color: string; delay: number; pathId: string; }

const CHAOTIC_CHIPS: ChipSpec[] = [
  { id: 'c1', label: <>Madrid ES €12,000 ❌ Double-booked catering</>, color: 'bg-red-400/70', delay: 0.05, pathId: 'p1' },
  { id: 'c2', label: 'Paris FR €18,000 ⚠️ Venue capacity unknown', color: 'bg-orange-400/70', delay: 0.15, pathId: 'p2' },
  { id: 'c3', label: 'FX Rate Error ❌ Lost €2,400', color: 'bg-red-500/70', delay: 0.25, pathId: 'p3' },
  { id: 'c4', label: 'Berlin DE €15,000 ❓ Hotel overbooked?', color: 'bg-yellow-400/70', delay: 0.35, pathId: 'p4' },
  { id: 'c5', label: 'Amsterdam NL ❌ Transport chaos', color: 'bg-red-400/70', delay: 0.45, pathId: 'p5' },
  { id: 'c6', label: 'Crew payments ⚠️ Manual calculation errors', color: 'bg-amber-400/70', delay: 0.55, pathId: 'p6' },
  { id: 'c7', label: 'Merch sales ❓ Estimates vs reality', color: 'bg-orange-400/70', delay: 0.65, pathId: 'p7' },
  { id: 'c8', label: 'Total profit ❌ Cannot calculate accurately', color: 'bg-red-500/70', delay: 0.75, pathId: 'p8' }
];

// Orderly target slots
const TARGET_SLOTS = [
  { id: 't1', label: 'Madrid Show', sub: 'Auto-confirmed — no double bookings' },
  { id: 't2', label: 'Paris Venue', sub: 'Real-time capacity tracking' },
  { id: 't3', label: 'FX Rates', sub: 'Auto-calculated — zero errors' },
  { id: 't4', label: 'Berlin Hotel', sub: 'Smart overbooking alerts' },
  { id: 't5', label: 'Amsterdam Transport', sub: 'Optimized routing — 40% savings' },
  { id: 't6', label: 'Crew Payments', sub: 'Automated calculations — 100% accurate' },
  { id: 't7', label: 'Merch Sales', sub: 'Real-time tracking vs projections' },
  { id: 't8', label: 'Total Profit', sub: 'Live dashboard — instant insights' }
];

// Helper animates chip along path length using CSS offset-path if supported; fallback to framer position tween
function useAnimateChips(reduced: boolean, replayTick: number, onAllDone: () => void, trigger: boolean) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (reduced || !trigger) { onAllDone(); return; }
    const root = containerRef.current; if (!root) { onAllDone(); return; }
    const supports = CSS.supports?.('offset-path', 'path("M0,0 L10,10")');
    const paths = Array.from(root.querySelectorAll('path[data-arc]')) as SVGPathElement[];
    let finished = 0;
    const totalChips = CHAOTIC_CHIPS.length;
    const handleFinish = (chip: ChipSpec) => {
      const landing = root.querySelector(`[data-target='${chip.pathId}']`);
      if (landing) {
        landing.classList.add('after:animate-[ping_0.9s_ease-out]');
        landing.animate([
          { boxShadow: '0 0 0 0 rgba(191,255,0,0.6)' },
          { boxShadow: '0 0 0 18px rgba(191,255,0,0)' }
        ], { duration: 600, easing: 'ease-out' });
      }
      finished++;
      if (finished === totalChips) {
        // Fade chips out gently after brief pause
        setTimeout(() => {
          CHAOTIC_CHIPS.forEach(c => {
            const chipEl = root.querySelector(`[data-chip='${c.id}']`) as HTMLElement | null;
            if (chipEl) {
              chipEl.animate([
                { opacity: 1, filter: 'blur(0px)' },
                { opacity: 0, filter: 'blur(2px)' }
              ], { duration: 600, easing: 'ease', fill: 'forwards' });
            }
          });
        }, 500);
        onAllDone();
      }
    };
    CHAOTIC_CHIPS.forEach(chip => {
      const el = root.querySelector(`[data-chip='${chip.id}']`) as HTMLElement | null;
      const path = paths.find(p => p.id === chip.pathId);
      if (!el || !path) return;
      // Reset starting styles
      el.style.opacity = '0';
      el.style.filter = 'blur(1px)';
      el.style.transform = 'translate(0,0)';
      if (supports) {
        const d = path.getAttribute('d');
        if (!d) { handleFinish(chip); return; }
        el.style.offsetPath = `path('${d}')`;
        el.style.offsetRotate = '0deg';
        const anim = el.animate([
          { offsetDistance: '0%', opacity: 0, filter: 'blur(2px)' },
          { offsetDistance: '5%', opacity: 1, filter: 'blur(0px)' },
          { offsetDistance: '100%', opacity: 1 }
        ], { duration: 1800, delay: chip.delay * 1000 + 300, easing: 'cubic-bezier(.73,.01,.27,1)', fill: 'forwards' });
        anim.addEventListener('finish', () => handleFinish(chip));
      } else {
        // Fallback path sampling
        try {
          const total = path.getTotalLength();
          const start = performance.now();
          const run = (now: number) => {
            const t = Math.min(1, (now - start - chip.delay * 1000 - 300) / 1800);
            if (t < 0) { requestAnimationFrame(run); return; }
            const pt = path.getPointAtLength(total * t);
            el.style.transform = `translate(${pt.x}px,${pt.y}px)`;
            el.style.opacity = t < 0.05 ? String(t/0.05) : '1';
            el.style.filter = t < 0.05 ? 'blur(1px)' : 'blur(0px)';
            if (t < 1) requestAnimationFrame(run); else handleFinish(chip);
          };
          requestAnimationFrame(run);
        } catch { handleFinish(chip); }
      }
    });
  }, [reduced, replayTick, onAllDone]);
  return containerRef;
}

export const MetamorphosisZenith: React.FC<MetamorphosisZenithProps> = ({
  className = '',
  scrollProgress = 0
}) => {
  const reduced = !!useReducedMotion();
  const [replayTick, setReplayTick] = useState(0);
  const [done, setDone] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentScrollProgress, setCurrentScrollProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(0);
  const onAllDone = useCallback(() => setDone(true), []);

  // Handle scroll progress - could be MotionValue or number
  useEffect(() => {
    if (scrollProgress instanceof Object && 'get' in scrollProgress) {
      // It's a MotionValue
      const unsubscribe = scrollProgress.on('change', (value) => {
        setCurrentScrollProgress(value);
        // Calculate phase based on scroll progress
        if (value < 0.3) setCurrentPhase(0); // Chaos
        else if (value < 0.6) setCurrentPhase(1); // Transformation
        else setCurrentPhase(2); // Clarity
      });
      return unsubscribe;
    } else {
      // It's a number
      const value = scrollProgress as number;
      setCurrentScrollProgress(value);
      if (value < 0.3) setCurrentPhase(0);
      else if (value < 0.6) setCurrentPhase(1);
      else setCurrentPhase(2);
      return undefined;
    }
  }, [scrollProgress]);

  // Trigger animation when scroll progress reaches certain point
  useEffect(() => {
    if (currentScrollProgress > 0.35 && !hasStarted) {
      setHasStarted(true);
    }
  }, [currentScrollProgress, hasStarted]);

  const containerRef = useAnimateChips(reduced, replayTick, onAllDone, hasStarted);

  return (
    <section className={`relative w-full max-w-7xl mx-auto px-6 py-24 md:py-32 grid gap-16 lg:grid-cols-2 items-center ${className}`} aria-label="Data chaos transforming into clarity">
      {/* Phase 0: Chaos - Only show chaotic spreadsheet */}
      {currentPhase === 0 && (
        <div className="relative">
          <div className="glass rounded-xl p-6 border border-red-400/20 bg-gradient-to-br from-red-500/5 to-red-400/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-red-400/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-red-400">Excel Chaos</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5"><ProblemIcon /></span>
                <span>Double-booked venues and catering disasters</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5"><ProblemIcon /></span>
                <span>Manual FX calculations losing €2,400+ per tour</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5"><ProblemIcon /></span>
                <span>Transport chaos with overlapping schedules</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5"><ProblemIcon /></span>
                <span>Cannot calculate real profit margins accurately</span>
              </div>
            </div>
            <div className="mt-6 bg-slate-100 dark:bg-white/5 rounded-lg p-3">
              <div className="grid grid-cols-4 gap-1 text-xs sm:text-[10px] font-mono">
                <div className="bg-red-300/20 text-red-900 p-1 rounded">#VALUE!</div>
                <div className="bg-yellow-300/20 text-yellow-900 p-1 rounded">Madrid €12k</div>
                <div className="bg-transparent p-1 rounded"></div>
                <div className="bg-orange-300/20 text-orange-900 p-1 rounded">DOUBLE?</div>
                <div className="bg-blue-300/20 text-blue-900 p-1 rounded">Paris ???</div>
                <div className="bg-green-300/20 text-green-900 p-1 rounded">FX ERR</div>
                <div className="bg-purple-300/20 text-purple-900 p-1 rounded">Lost €2400</div>
                <div className="bg-red-300/20 text-red-900 p-1 rounded">CHAOS</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Phase 1: Transformation - Show chaos transforming */}
      {currentPhase === 1 && (
        <>
          <div className="relative">
            <div className="grid grid-cols-6 gap-1 text-xs sm:text-[10px] font-mono w-full max-w-md">
              {Array.from({ length: 54 }).map((_, i) => {
                const noisy = i % 7 === 0;
                const clash = i % 11 === 0;
                const empty = i % 13 === 0;
                return (
                  <div
                    key={i}
                    className={`h-6 flex items-center px-1 rounded-sm overflow-hidden border border-slate-100 dark:border-white/5 whitespace-nowrap ${noisy ? 'bg-red-300/30 text-ink-900 font-semibold' : clash ? 'bg-yellow-300/30 text-ink-900' : empty ? 'bg-transparent' : 'bg-white/5'} ${i===5 ? 'col-span-2' : ''}`}
                  >
                    {!empty && (noisy ? '##### # MISMATCH ####' : clash ? '!=?! cost drift' : 'Fee 12000… cuts')}
                  </div>
                );
              })}
            </div>
            {/* Chips launching from messy zones into paths */}
            <div className="absolute inset-0 pointer-events-none" ref={containerRef}>
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 260">
                {CHAOTIC_CHIPS.map(c => (
                  <path key={c.id} id={c.pathId} data-arc d={`M${40 + Math.random()*40},${40 + Math.random()*160} C${120+Math.random()*40},${20+Math.random()*80} ${220+Math.random()*40},${120+Math.random()*80} 340,${40 + Math.random()*160}`} stroke="none" fill="none" />
                ))}
              </svg>
              {CHAOTIC_CHIPS.map(chip => (
                <div
                  key={chip.id}
                  data-chip={chip.id}
                  className={`absolute top-0 left-0 translate-x-0 translate-y-0 rounded-md px-2 py-1 text-xs sm:text-[10px] font-medium text-ink-900 shadow-md backdrop-blur-sm ${chip.color}`}
                  style={{ filter: 'blur(1px)', opacity: 0 }}
                >{chip.label}</div>
              ))}
              {!reduced && (
                <button
                  type="button"
                  onClick={() => { setDone(false); setReplayTick(t => t + 1); }}
                  className={`absolute -bottom-10 left-0 text-xs sm:text-[11px] px-3 py-1.5 rounded-md bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:bg-white/15 border border-slate-200 dark:border-white/10 backdrop-blur-md transition ${done ? 'opacity-100' : 'opacity-0 pointer-events-none'} focus:outline-none focus:ring-2 focus:ring-accent-400`}
                  aria-label="Replay transformation"
                >Replay</button>
              )}
            </div>
          </div>

          {/* Orderly targets */}
          <div className="relative grid gap-4">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-4">From scattered noise to a living control panel</h2>
            <p className="text-sm md:text-base opacity-80 max-w-md mb-6">Instead of spreadsheets mutating chaotically and critical context buried in comments, every data point flows into a single orchestrated surface. The system reconciles, validates, and highlights what matters.</p>
            <div className="space-y-4">
              {TARGET_SLOTS.map((t, idx) => (
                <motion.div
                  key={t.id}
                  data-target={`p${idx+1}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ delay: 0.2 + idx * 0.1, duration: 0.6 }}
                  className="relative glass rounded-lg px-4 py-3 border border-slate-200 dark:border-white/10 overflow-hidden"
                >
                  <div className="text-sm font-semibold">{t.label}</div>
                  <div className="text-xs sm:text-[11px] opacity-70">{t.sub}</div>
                  <div className="absolute inset-0 pointer-events-none rounded-lg after:content-[''] after:absolute after:inset-0 after:rounded-lg" />
                </motion.div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Phase 2: Clarity - Show the clean app interface */}
      {currentPhase === 2 && (
        <div className="relative">
          <div className="glass rounded-xl p-6 border border-accent-400/20 bg-gradient-to-br from-accent-500/5 to-accent-400/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-accent-400/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-accent-400">Tour Control Center</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium">Madrid Show</span>
                <span className="text-accent-400">Confirmed ✓</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium">Paris Capacity</span>
                <span className="text-accent-400">+250 seats</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium">FX Rate EUR/USD</span>
                <span className="text-accent-400">1.0842</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium">Transport Savings</span>
                <span className="text-accent-400">€3,200</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium">Net Profit Margin</span>
                <span className="text-accent-400">+24.7%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default MetamorphosisZenith;