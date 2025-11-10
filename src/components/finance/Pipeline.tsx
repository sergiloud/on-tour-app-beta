import React, { useMemo } from 'react';
import { Card } from '../../ui/Card';
import { t } from '../../lib/i18n';
import { useSettings } from '../../context/SettingsContext';
import { useFinance } from '../../context/FinanceContext';
import { useToast } from '../../ui/Toast';
import { trackEvent } from '../../lib/telemetry';
import { announce } from '../../lib/announcer';

const STAGE_PROB: Record<'confirmed'|'pending'|'offer', number> = {
  confirmed: 1,
  pending: 0.6,
  offer: 0.3
};

const Pipeline: React.FC = () => {
  const { fmtMoney } = useSettings();
  const { snapshot: snap } = useFinance();
  const toast = useToast();
  const stages = useMemo(() => {
    const agg = { confirmed:{count:0,total:0}, pending:{count:0,total:0}, offer:{count:0,total:0} } as Record<'confirmed'|'pending'|'offer', {count:number; total:number}>;
    for (const s of snap.shows) { agg[s.status as 'confirmed'|'pending'|'offer'].count += 1; agg[s.status as 'confirmed'|'pending'|'offer'].total += s.fee; }
    const expected = (
      agg.confirmed.total * STAGE_PROB.confirmed +
      agg.pending.total * STAGE_PROB.pending +
      agg.offer.total * STAGE_PROB.offer
    );
    return { agg, expected: Math.round(expected) };
  }, [snap]);

  const copyReminder = async () => {
    const body = `${t('finance.pipeline')||'Pipeline'} — ${t('finance.pipeline.subtitle')||'Expected value'}: ${fmtMoney(stages.expected)}`;
    try { await navigator.clipboard.writeText(body); toast.success(t('common.copied')||'Copied ✓'); announce(t('common.copied')||'Copied ✓'); trackEvent('pipeline.reminder.send', { expected: stages.expected }); } catch {
      toast.info(body);
    }
  };

  return (
    <Card className="p-4 space-y-3">
  <h3 className="widget-title">{t('finance.pipeline')}</h3>
      <div className="text-xs opacity-70">{t('finance.pipeline.subtitle')}</div>
  <div className="flex items-center justify-between gap-2">
        <div className="text-lg font-semibold tabular-nums">{fmtMoney(stages.expected)}</div>
        <div className="flex items-center gap-1 text-[11px] opacity-80">
          <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/5 border border-white/10">100%</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/5 border border-white/10">60%</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/5 border border-white/10">30%</span>
        </div>
        <button className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:bg-white/15 border border-slate-200 dark:border-white/10 text-[11px]" onClick={copyReminder}>{t('common.reminder')||'Reminder'}</button>
      </div>
      <div className="grid grid-cols-3 gap-2 text-sm">
        {(['confirmed','pending','offer'] as const).map(k => (
          <Card key={k} className="p-2 border border-white/10">
            <div className="opacity-70 text-xs capitalize">{t(`finance.${k}`)}</div>
            <div className="font-semibold tabular-nums">{fmtMoney(stages.agg[k].total)}</div>
            <div className="text-[11px] opacity-70">{stages.agg[k].count} {t('finance.shows')}</div>
          </Card>
        ))}
      </div>
    </Card>
  );
};

export default Pipeline;
