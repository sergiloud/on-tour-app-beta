import React from 'react';
import { useFinance } from '../../../context/FinanceContext';
import { useToast } from '../../../ui/Toast';
import { announce } from '../../../lib/announcer';
import { trackEvent } from '../../../lib/telemetry';
import { t } from '../../../lib/i18n';

const PipelineAR: React.FC<{ onViewBucket?: (bucket: '0-30'|'31-60'|'61-90'|'90+') => void }> = ({ onViewBucket }) => {
  const { v2 } = useFinance();
  const toast = useToast();
  const expected = v2?.expected;
  const aging = v2?.aging || [];
  const agingTotal = React.useMemo(()=> aging.reduce((a,b)=> a + b.amount, 0), [aging]);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[12px]">
      <div className="p-3 rounded bg-white/5 border border-white/10">
        <div className="font-medium mb-1">{t('finance.expected')||'Expected (stage-weighted)'}</div>
        {expected ? (
          <div className="flex items-center gap-3">
            <div>{t('common.total')||'Total'}: <span className="tabular-nums">{expected.total.toLocaleString()}</span></div>
            <div className="opacity-80">100: <span className="tabular-nums">{expected.stages.p100.toLocaleString()}</span></div>
            <div className="opacity-80">60: <span className="tabular-nums">{expected.stages.p60.toLocaleString()}</span></div>
            <div className="opacity-80">30: <span className="tabular-nums">{expected.stages.p30.toLocaleString()}</span></div>
          </div>
        ) : (
          <div className="opacity-80">{t('common.comingSoon')||'Coming soon'}</div>
        )}
      </div>
      <div className="p-3 rounded bg-white/5 border border-white/10">
        <div className="font-medium mb-1">{t('finance.ar.title')||'AR aging & top debtors'}</div>
        {aging.length ? (
          <div className="grid grid-cols-1 gap-2">
            {aging.map(b => (
              <div key={b.bucket} className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/10" title={`${b.bucket}: ${b.amount.toLocaleString()} (${agingTotal? Math.round((b.amount/agingTotal)*100):0}%)`}>
                <div className="flex items-center gap-3">
                  <div className="w-16">{b.bucket}</div>
                  <div className="tabular-nums">{b.amount.toLocaleString()}</div>
                  <div className="opacity-80">{agingTotal? Math.round((b.amount/agingTotal)*100):0}%</div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-2 py-1 rounded bg-white/10 hover:bg-white/15" onClick={()=>{ try { trackEvent('finance.ar.viewBucket', { bucket: b.bucket }); } catch {}; onViewBucket?.(b.bucket as any); }}>
                    {t('finance.ar.view') || 'View'}
                  </button>
                  <button className="px-2 py-1 rounded bg-white/10 hover:bg-white/15" onClick={()=>{ try { trackEvent('finance.ar.sendReminder', { bucket: b.bucket }); toast.success(t('finance.ar.reminder.queued')||'Reminder queued'); announce(t('finance.ar.reminder.queued')||'Reminder queued'); } catch {} }}>
                    {t('finance.ar.remind') || 'Remind'}
                  </button>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between px-2 pt-1 text-[11px] opacity-80">
              <div>{t('common.total')||'Total'}:</div>
              <div className="tabular-nums">{agingTotal.toLocaleString()}</div>
            </div>
          </div>
        ) : (
          <div className="opacity-80">{t('common.comingSoon')||'Coming soon'}</div>
        )}
      </div>
    </div>
  );
};

export default PipelineAR;
