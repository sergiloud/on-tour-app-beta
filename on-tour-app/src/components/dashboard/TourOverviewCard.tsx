import React, { useMemo } from 'react';
import { Card } from '../../ui/Card';
import { showStore } from '../../shared/showStore';
import { useSettings } from '../../context/SettingsContext';

const STAGE_PROB: Record<'confirmed'|'pending'|'offer'|'canceled'|'archived', number> = {
  confirmed: 1,
  pending: 0.6,
  offer: 0.3,
  canceled: 0,
  archived: 0
};

export const TourOverviewCard: React.FC = () => {
  const { fmtMoney } = useSettings();
  const data = useMemo(() => {
    const now = Date.now();
    const in30 = now + 30*24*60*60*1000;
    const shows = showStore.getAll();
    const upcoming = shows.filter(s => {
      const t = new Date(s.date).getTime();
      return t >= now && t <= in30;
    }).sort((a,b)=> new Date(a.date).getTime() - new Date(b.date).getTime());
    const confirmed = upcoming.filter(s=>s.status==='confirmed').length;
    const pending = upcoming.filter(s=>s.status==='pending').length;
    const offer = upcoming.filter(s=>s.status==='offer').length;
    const expected = Math.round(upcoming.reduce((acc,s)=> acc + s.fee * STAGE_PROB[s.status], 0));
    const days = Array.from({length: 10}).map((_,i)=>{
      const start = now + i*3*24*60*60*1000;
      const end = start + 3*24*60*60*1000;
      const sum = upcoming.filter(s=>{ const t = new Date(s.date).getTime(); return t>=start && t<end; }).reduce((a,s)=> a + s.fee*STAGE_PROB[s.status], 0);
      return Math.round(sum);
    });
    const max = Math.max(1, ...days);
    return { upcomingCount: upcoming.length, confirmed, pending, offer, expected, days, max };
  }, []);

  return (
    <Card className="p-4 flex flex-col gap-3" aria-label="Tour overview">
      <header className="flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-tight">Tour Overview</h3>
        <div className="text-[11px] opacity-70">Next 30 days</div>
      </header>
      <div className="grid grid-cols-3 gap-2 text-sm">
        <Card className="p-2 border border-white/10"><div className="opacity-70 text-xs">Upcoming</div><div className="font-semibold">{data.upcomingCount} shows</div></Card>
        <Card className="p-2 border border-white/10"><div className="opacity-70 text-xs">Expected value</div><div className="font-semibold">{fmtMoney(data.expected)}</div></Card>
        <Card className="p-2 border border-white/10"><div className="opacity-70 text-xs">Confirmed</div><div className="font-semibold">{data.confirmed}</div></Card>
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <Card className="p-2 flex items-center justify-between"><span>Pending</span><strong className="text-amber-300">{data.pending}</strong></Card>
        <Card className="p-2 flex items-center justify-between"><span>Offer</span><strong className="text-sky-300">{data.offer}</strong></Card>
        <div className="p-2 rounded-xl glass">
          <div className="opacity-70 text-[11px] mb-1">Expected (10 buckets)</div>
          <div className="h-12 flex items-end gap-1 overflow-hidden">
            {data.days.map((v,i)=>{
              const h = Math.round((v/data.max)*100);
              return <div key={i} className="flex-1 min-w-[6px] bg-gradient-to-t from-accent-500/20 to-accent-500/80 rounded-sm" style={{height:`${h}%`}} aria-hidden />;
            })}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TourOverviewCard;
