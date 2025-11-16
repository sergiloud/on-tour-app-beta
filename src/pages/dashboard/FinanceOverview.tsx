import React from 'react';
import PeriodSelector from '../../components/finance/PeriodSelector';
import { useSettings } from '../../context/SettingsContext';
import { t } from '../../lib/i18n';
import { useFinance } from '../../context/FinanceContext';
// Dynamic import for exportFinanceCsv to reduce bundle size
import { can } from '../../lib/tenants';
import GuardedAction from '../../components/common/GuardedAction';
import StatusBreakdown from '../../components/finance/StatusBreakdown';
import NetTimeline from '../../components/finance/NetTimeline';
import KpiCards from '../../components/finance/KpiCards';
import { trackEvent } from '../../lib/telemetry';

const Pill: React.FC<{ active?: boolean; onClick?: () => void; children: React.ReactNode }>=({ active, onClick, children })=> (
  <button onClick={onClick} className={`px-2 py-1 rounded-md text-[11px] border ${active? 'bg-accent-500 text-black border-transparent':'bg-interactive hover:bg-slate-200 dark:bg-white/10 border-theme'}`}>{children}</button>
);

const FinanceOverview: React.FC = () => {
  const { currency, comparePrev, setComparePrev, region, setRegion, fmtMoney } = useSettings();
  const { snapshot } = useFinance();

  React.useEffect(()=>{ try { trackEvent('overview.open'); } catch {} }, []);
  return (
    <div className="max-w-6xl mx-auto glass p-6 space-y-4 mt-4">
      {/* Top bar: Period, Compare, Currency, Region pills, Export */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-3">
          <PeriodSelector />
          <label className="flex items-center gap-1 text-[11px] select-none">
            <input type="checkbox" className="align-middle" checked={comparePrev} onChange={e=> setComparePrev(e.target.checked)} />
            <span>{t('finance.comparePrev') || 'Compare vs previous'}</span>
          </label>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 rounded-md bg-interactive text-[11px]">{currency}</span>
          <div className="flex items-center gap-1">
            <Pill active={region==='all'} onClick={()=> setRegion('all')}>{t('shows.filters.region.all')}</Pill>
            <Pill active={region==='EMEA'} onClick={()=> setRegion('EMEA')}>EMEA</Pill>
            <Pill active={region==='AMER'} onClick={()=> setRegion('AMER')}>AMER</Pill>
            <Pill active={region==='APAC'} onClick={()=> setRegion('APAC')}>APAC</Pill>
          </div>
          <GuardedAction scope="finance:export" className="px-2 py-1 rounded bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 text-[11px]" onClick={async ()=> { const { exportFinanceCsv } = await import('../../lib/finance/export'); exportFinanceCsv(snapshot.shows as any, { masked: false, columns: ['date','city','country','fee','status','net'] }); }}>
            {t('actions.exportCsv') || 'Export CSV'}
          </GuardedAction>
        </div>
      </div>

      <KpiCards />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <NetTimeline />
        <StatusBreakdown />
      </div>
    </div>
  );
};

export default FinanceOverview;
