import React, { useState } from 'react';
import type { Cost } from '../../types/shows';
import { t } from '../../lib/i18n';

type Props = {
  onAdd: (c: Cost) => void;
  fmt: (n: number) => string; // kept for API consistency though not used here yet
};

// Controlled cost editor component
const CostEditor: React.FC<Props> = ({ onAdd }) => {
  const [type, setType] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [desc, setDesc] = useState('');
  const canAdd = type.trim().length > 0 && !!parseFloat(amount);
  const add = () => {
    if (!canAdd) return;
    const id = (()=>{ try { return crypto.randomUUID(); } catch { return Math.random().toString(36).slice(2, 8); } })();
    onAdd({ id, type: type.trim(), amount: parseFloat(amount), desc: desc.trim() || undefined });
    setType('');
    setAmount('');
    setDesc('');
  };
  return (
    <div className="flex gap-2 items-end">
      <div className="flex-1">
        <label className="block opacity-80 mb-1">{t('shows.costs.type') || 'Type'}</label>
        <input
          className="w-full px-3 py-2 rounded bg-white/5 border border-white/12 hover:border-white/20 focus-ring motion-safe:transition-colors"
          placeholder={t('shows.costs.placeholder') || 'Travel / Production / Marketing'}
          value={type}
          onChange={(e) => setType(e.target.value)}
        />
      </div>
      <div>
        <label className="block opacity-80 mb-1">{t('shows.costs.amount') || 'Amount'}</label>
        <input
          type="number"
          className="px-3 py-2 rounded bg-white/5 border border-white/12 hover:border-white/20 focus-ring motion-safe:transition-colors w-36"
          aria-label={t('shows.costs.amount') || 'Amount'}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <div className="flex-1">
        <label className="block opacity-80 mb-1">{t('shows.costs.desc') || 'Description'}</label>
        <input
          className="w-full px-3 py-2 rounded bg-white/5 border border-white/12 hover:border-white/20 focus-ring motion-safe:transition-colors"
          placeholder={t('common.optional') || 'Optional'}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
      </div>
      <button
        className="px-3 py-2 rounded-full bg-accent-500 text-black shadow-glow hover:brightness-110 motion-safe:transition disabled:opacity-60 disabled:cursor-not-allowed"
        disabled={!canAdd}
        onClick={add}
      >
        {t('common.add') || 'Add'}
      </button>
    </div>
  );
};

export default CostEditor;
