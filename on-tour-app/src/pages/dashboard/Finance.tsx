import React from 'react';
// Classic widgets removed as v2 becomes the single experience
import { useSettings } from '../../context/SettingsContext';
import { Link } from 'react-router-dom';
import { t } from '../../lib/i18n';
import { prefetchByPath } from '../../routes/prefetch';
import { trackEvent } from '../../lib/telemetry';
import { isMonthClosed, monthKeyFromDate, setMonthClosed } from '../../features/finance/period';
import GlobalKPIBar from '../../components/dashboard/GlobalKPIBar';
import FinanceV2 from '../../components/finance/v2/FinanceV2';
import { useToast } from '../../ui/Toast';
import { announce } from '../../lib/announcer';

const Finance: React.FC = () => {
  const { dateRange } = useSettings();
  const toast = useToast();
  const monthKey = React.useMemo(()=> monthKeyFromDate(new Date(dateRange.to)), [dateRange.to]);
  const [closed, setClosed] = React.useState<boolean>(()=> isMonthClosed(monthKey));
  React.useEffect(()=> setClosed(isMonthClosed(monthKey)), [monthKey]);
  const toggleClose = () => {
    const next = !closed;
    setClosed(next);
    setMonthClosed(monthKey, next);
    try { trackEvent('finance.closeMonth', { month: monthKey, closed: next }); } catch {}
  };

  // v2 is the single view; A/B variant removed
  const [kpiHidden, setKpiHidden] = React.useState<boolean>(() => {
    try { return localStorage.getItem('dash:kpi:hidden') === '1'; } catch { return false; }
  });
  React.useEffect(() => {
    const onToggle = (e: any) => setKpiHidden(!!e?.detail?.hidden);
    window.addEventListener('kpi:hidden:toggle', onToggle);
    return () => window.removeEventListener('kpi:hidden:toggle', onToggle);
  }, []);
  return (
    <>
    {!kpiHidden && <GlobalKPIBar />}
    <div className="max-w-6xl mx-auto glass p-6 space-y-4 mt-4">
      <div className="flex items-center justify-between">
        <div className="text-sm opacity-80">{t('finance.overview')}</div>
        <Link
          to="/dashboard/story"
          className="text-[11px] px-2 py-1 rounded bg-white/10 hover:bg-white/20"
          onMouseEnter={()=>prefetchByPath('/dashboard/story')}
          onFocus={()=>prefetchByPath('/dashboard/story')}
          onClick={()=> trackEvent('nav.story.cta')}
        >{t('story.cta')}</Link>
      </div>
      <div className="flex items-center justify-end gap-2">
        <span className={`px-2 py-1 rounded text-[11px] ${closed? 'bg-emerald-500/20 text-emerald-200' : 'bg-amber-500/20 text-amber-200'}`}>{closed? t('finance.period.closed') || 'Closed' : t('finance.period.open') || 'Open'}</span>
        <button className="px-2 py-1 rounded bg-white/10 hover:bg-white/15 text-[11px]" onClick={toggleClose}>{closed? (t('finance.reopenMonth')||'Reopen Month') : (t('finance.closeMonth')||'Close Month')}</button>
      </div>
      <FinanceV2 />
    </div>
    </>
  );
};

export default Finance;