import React from 'react';
import { useFinance } from '../../../context/FinanceContext';
import { useSettings } from '../../../context/SettingsContext';
import { selectBreakdownsV2 } from '../../../features/finance/selectors.v2';
import { announce } from '../../../lib/announcer';
import { t } from '../../../lib/i18n';

const tabs = ['Region','Agency','Country','Promoter','Route'] as const;
type TabKind = typeof tabs[number];

type Props = {
  onSelect?: (kind: TabKind, value: string) => void;
};

const MarginBreakdown: React.FC<Props> = ({ onSelect }) => {
  const [active, setActive] = React.useState<typeof tabs[number]>('Region');
  const { v2, compareSnapshot } = useFinance();
  const { comparePrev } = useSettings();
  const data = React.useMemo(() => {
    if (!v2) return [] as { key: string; net: number; income: number; expenses: number; count: number }[];
    switch (active) {
      case 'Region': return v2.breakdowns.region;
      case 'Agency': return v2.breakdowns.agency;
      case 'Country': return v2.breakdowns.country;
      case 'Promoter': return v2.breakdowns.promoter;
      case 'Route': return v2.breakdowns.route;
      default: return [];
    }
  }, [v2, active]);
  const prevData = React.useMemo(() => {
    if (!comparePrev || !compareSnapshot) return null as null | Record<string, number>;
    const prev = selectBreakdownsV2(compareSnapshot);
    let arr: { key: string; net: number }[] = [];
    switch (active) {
      case 'Region': arr = prev.region; break;
      case 'Agency': arr = prev.agency; break;
      case 'Country': arr = prev.country; break;
      case 'Promoter': arr = prev.promoter; break;
      case 'Route': arr = prev.route; break;
    }
    const map: Record<string, number> = {};
    arr.forEach(r => { map[r.key] = r.net; });
    return map;
  }, [comparePrev, compareSnapshot, active]);
  return (
    <div className="p-3 rounded bg-white/5 border border-white/10">
      <div className="flex gap-2 mb-2 text-[11px]" aria-label={t('finance.breakdown.by')||'Breakdown by'}>
        {tabs.map(tab => (
          <button key={tab} className={`px-2 py-1 rounded ${active===tab? 'bg-white/20' : 'bg-white/10 hover:bg-white/15'}`} onClick={()=>{ setActive(tab); try { announce(`Breakdown by ${tab}`); } catch {} }}>{tab}</button>
        ))}
      </div>
      {data.length === 0 ? (
        <div className="text-[12px] opacity-80">{t('finance.breakdown.empty')||'No breakdown available'} — {t('common.comingSoon')||'coming soon'}</div>
      ) : (
        <div className="text-[12px] grid grid-cols-1 md:grid-cols-2 gap-2">
          {data.slice(0, 8).map(row => (
            <button
              key={row.key}
              className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/10 hover:bg-white/10 text-left"
              title={prevData && prevData[row.key] != null ? `${t('finance.deltaVsPrev')||'Δ vs prev'}: ${(row.net - prevData[row.key]).toLocaleString()}` : undefined}
              onClick={() => onSelect?.(active, row.key)}
            >
              <div className="truncate pr-2">{row.key || '—'}</div>
              <div className="tabular-nums text-right">
                <div>{row.net.toLocaleString()}</div>
                {prevData && prevData[row.key] != null && (
                  <div className={`text-[11px] ${row.net - prevData[row.key] >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>{t('finance.delta')||'Δ'} {(row.net - prevData[row.key]).toLocaleString()}</div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MarginBreakdown;
