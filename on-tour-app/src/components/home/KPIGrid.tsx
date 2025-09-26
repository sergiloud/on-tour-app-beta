import React from 'react';

const kpiFeatures = [
  { title: 'Finance intelligence', desc: 'Real-time KPIs, forecasts and settlement clarity.' },
  { title: 'Travel orchestration', desc: 'Flights, hotels and transfers anchored to shows.' },
  { title: 'Mission Control', desc: 'Unified map + HUD to anticipate issues.' },
  { title: 'Offline ready', desc: 'Designed for spotty venue Wi‑Fi & roaming.' },
  { title: 'Role permissions', desc: 'Manager ↔ Artist context switching built‑in.' },
  { title: 'Action Hub', desc: 'Prioritized tasks & anomalies surfaced early.' },
];

export const KPIGrid: React.FC = () => {
  return (
  <section id="features" className="relative z-10 px-6 pb-12 md:pb-16 max-w-7xl mx-auto w-full">
      <h2 className="text-xl font-semibold tracking-wide text-accent-500 mb-3">What you get</h2>
      <h3 className="section-title mb-10">A cockpit for modern touring</h3>
      <div className="grid-auto-fit">
        {kpiFeatures.map(f => (
          <div key={f.title} className="glass p-5 flex flex-col gap-2">
            <div className="font-medium tracking-tight">{f.title}</div>
            <p className="text-sm leading-relaxed" style={{color:'var(--text-secondary)'}}>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
