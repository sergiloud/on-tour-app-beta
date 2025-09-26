import React from 'react';

interface HeroProps { className?: string }

export const Hero: React.FC<HeroProps> = ({ className = '' }) => {
  return (
    <section className={`relative w-full ${className}`}>
      <div className="max-w-xl pr-2 md:pr-6 relative z-10">
        <h1 className="section-title mb-6 text-glow">Your tour, elevated</h1>
  <p className="text-lg leading-relaxed mb-8 opacity-80" style={{color:'var(--text-secondary)'}}>Command performance, finance, and logistics from a single glass dashboard. Built for artists, managers and fast‑moving teams on the road.</p>
        <div className="flex flex-wrap gap-4 mb-8">
          <button className="btn-primary">Start free</button>
          <button className="btn-ghost">Live demo</button>
        </div>
  <ul className="grid gap-3 text-sm" style={{color:'var(--text-secondary)'}}>
          <li className="flex items-start gap-2"><span className="badge-soft">Finance</span><span>Real‑time settlements & net projections</span></li>
          <li className="flex items-start gap-2"><span className="badge-soft">Logistics</span><span>Flights, hotels & routing unified</span></li>
          <li className="flex items-start gap-2"><span className="badge-soft">Mission</span><span>Map HUD with actionable KPIs</span></li>
        </ul>
      </div>
    </section>
  );
};
