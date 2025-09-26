import React, { useEffect, useState } from 'react';
import { useAnimatedNumber } from '../../hooks/useAnimatedNumber';
import { MapPreview } from '../map/MapPreview';

interface DashboardTeaserProps { className?: string }

export const DashboardTeaser: React.FC<DashboardTeaserProps> = ({ className = '' }) => {
  const [yearNet, setYearNet] = useState(0);
  const [pending, setPending] = useState(0);
  const [monthNet, setMonthNet] = useState(0);

  // Simulate streaming demo updates
  useEffect(() => {
    const interval = setInterval(() => {
      setYearNet(v => Math.min(250000, v + Math.random() * 4000));
      setPending(v => Math.min(50000, v + Math.random() * 800));
      setMonthNet(v => Math.min(60000, v + Math.random() * 1200));
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const yearNetDisplay = useAnimatedNumber(yearNet, { format: v => '€' + v.toFixed(0) });
  const pendingDisplay = useAnimatedNumber(pending, { format: v => '€' + v.toFixed(0) });
  const monthNetDisplay = useAnimatedNumber(monthNet, { format: v => '€' + v.toFixed(0) });

  const progress = Math.min(1, yearNet / 250000);

  return (
  <div className={`relative z-10 grid gap-6 sm:grid-cols-2 w-full max-w-2xl ${className}`}>
      <div className="glass p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-xs tracking-wide uppercase font-medium" style={{color:'var(--text-secondary)'}}>Year Net</span>
          <span className="badge-soft">Live</span>
        </div>
        <div className="text-3xl font-semibold tracking-tight tabular-nums">{yearNetDisplay}</div>
        <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
          <span className="block h-full bg-accent-500/80 transition-all duration-700" style={{ width: `${Math.max(progress * 100, 4)}%` }} />
        </div>
        <div className="text-xs" style={{color:'var(--text-secondary)'}}>Target €250k • Demo feed</div>
      </div>
      <div className="glass p-5 flex flex-col gap-3">
        <span className="text-xs tracking-wide uppercase font-medium" style={{color:'var(--text-secondary)'}}>Itinerary</span>
        <div className="grid gap-2 text-sm">
          <div className="flex items-center justify-between"><span style={{color:'var(--text-primary)'}}>Berlin</span><span className="badge-soft">Confirmed</span></div>
          <div className="flex items-center justify-between"><span style={{color:'var(--text-primary)'}}>Paris</span><span className="badge-soft">Pending</span></div>
          <div className="flex items-center justify-between"><span style={{color:'var(--text-primary)'}}>Madrid</span><span className="badge-soft">Offer</span></div>
        </div>
        <button className="btn-ghost mt-2 text-xs px-3 py-2">View all</button>
      </div>
  <div className="glass sm:col-span-2 p-5 flex flex-col md:flex-row gap-5 items-center">
        <div className="flex-1">
          <div className="text-xs tracking-wide uppercase font-medium mb-2" style={{color:'var(--text-secondary)'}}>Mission HUD</div>
          <div className="flex gap-6">
            <div>
              <div className="text-xs" style={{color:'var(--text-secondary)'}}>Next Show</div>
              <div className="font-semibold tracking-tight">—</div>
            </div>
            <div>
              <div className="text-xs" style={{color:'var(--text-secondary)'}}>Pending</div>
              <div className="font-semibold tracking-tight tabular-nums">{pendingDisplay}</div>
            </div>
            <div>
              <div className="text-xs" style={{color:'var(--text-secondary)'}}>Net (Month)</div>
              <div className="font-semibold tracking-tight tabular-nums">{monthNetDisplay}</div>
            </div>
          </div>
        </div>
        <MapPreview
          className="h-28 aspect-video w-full md:w-64"
          center={{ lat: 10, lng: 10 }}
          markers={[
            { id: 'ber', label: 'BER', lat: 52.52, lng: 13.405, accent: true },
            { id: 'par', label: 'PAR', lat: 48.8566, lng: 2.3522 },
            { id: 'mad', label: 'MAD', lat: 40.4168, lng: -3.7038 }
          ]}
          onMarkerClick={(m) => console.log('marker', m.id)}
        />
      </div>
    </div>
  );
};
