import React from 'react';
import { useToast } from '../../../ui/Toast';
import { t } from '../../../lib/i18n';

const TargetsCard: React.FC = () => {
  const toast = useToast();
  const [targets, setTargets] = React.useState<{ revenue: number; net: number }>({ revenue: 0, net: 0 });
  const onBlur = () => {
    if (targets.revenue < 0 || targets.net < 0) {
      setTargets(prev => ({ revenue: Math.max(0, prev.revenue), net: Math.max(0, prev.net) }));
      toast.error(t('finance.targets.noNegative')||'Targets cannot be negative');
      return;
    }
    toast.success(t('finance.targets.saved')||'Targets saved');
  };
  return (
    <div className="p-3 rounded bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[12px]">
      <div className="font-medium mb-2">{t('finance.targets.title')||'Targets'}</div>
      <label className="block mb-2">
        <span className="block opacity-80 mb-1">{t('finance.targets.revenue')||'Revenue target'}</span>
        <input type="number" min={0} value={targets.revenue} onChange={e=> setTargets(s=>({ ...s, revenue: Number(e.target.value) }))} onBlur={onBlur} className="w-full px-2 py-1 rounded bg-slate-100 dark:bg-white/5 border border-white/10" />
      </label>
      <label className="block">
        <span className="block opacity-80 mb-1">{t('finance.targets.net')||'Net target'}</span>
        <input type="number" min={0} value={targets.net} onChange={e=> setTargets(s=>({ ...s, net: Number(e.target.value) }))} onBlur={onBlur} className="w-full px-2 py-1 rounded bg-slate-100 dark:bg-white/5 border border-white/10" />
      </label>
      <div className="text-[11px] opacity-80 mt-2">{t('finance.targets.hint')||'Targets are local to this device for now.'}</div>
    </div>
  );
};

export default TargetsCard;
