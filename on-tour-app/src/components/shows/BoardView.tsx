import React, { useMemo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { DemoShow } from '../../lib/demoShows';
import StatusBadge from '../../ui/StatusBadge';
import { countryLabel } from '../../lib/countries';
import { t } from '../../lib/i18n';

type Props = {
  rows: { s: DemoShow; net: number }[];
  onOpen: (s: DemoShow) => void;
  onPromote: (id: string) => void;
  statusOn: Record<'confirmed'|'pending'|'offer', boolean>;
  fmt: (n:number)=>string;
  lang: 'en'|'es';
};

const BoardView: React.FC<Props> = ({ rows, onOpen, onPromote, statusOn, fmt, lang }) => {
  const byStatus: Record<'confirmed'|'pending'|'offer', { s: DemoShow; net: number }[]> = { confirmed: [], pending: [], offer: [] };
  for (const r of rows) { (byStatus[r.s.status as 'confirmed'|'pending'|'offer']||byStatus.offer).push(r); }
  const cols: Array<{ key: 'offer'|'pending'|'confirmed'; title: string; tone: string }> = [
    { key: 'offer', title: t('shows.status.offer') || 'Offer', tone: 'bg-white/10' },
    { key: 'pending', title: t('shows.status.pending') || 'Pending', tone: 'bg-yellow-500/25' },
    { key: 'confirmed', title: t('shows.status.confirmed') || 'Confirmed', tone: 'bg-green-500/25' },
  ];
  const Column: React.FC<{ title: string; tone: string; items: { s: DemoShow; net: number }[]; enabled: boolean }>=({ title, tone, items, enabled })=>{
    const shown = useMemo(()=> enabled ? items : [], [enabled, items]);
    const sumFees = useMemo(()=> shown.reduce((acc, r) => acc + r.s.fee, 0), [shown]);
    const sumNet = useMemo(()=> shown.reduce((acc, r) => acc + r.net, 0), [shown]);
    const parentRef = useRef<HTMLDivElement|null>(null);
    const useVirt = shown.length > 60; // window when many cards
    const rowVirtualizer = useVirtualizer({
      count: useVirt ? shown.length : 0,
      getScrollElement: () => parentRef.current,
      estimateSize: () => 96,
      overscan: 10,
    });
    return (
      <div className="glass rounded-lg p-2 min-h-[200px] border border-white/10" role="region" aria-label={`${title} column`}>
        <div className={`h-1 w-full rounded-t ${tone} mb-2`} />
        <div className="flex items-center justify-between mb-1">
          <div className="text-xs uppercase tracking-wide opacity-80">{title}</div>
          <div className="text-[11px] opacity-70">{items.length}</div>
        </div>
        <div className="text-[11px] opacity-70 mb-2 flex items-center gap-3">
          <div>{t('shows.totals.fees') || 'Fees'}: <span className="tabular-nums font-medium">{fmt(sumFees)}</span></div>
          <div>{t('common.net') || 'Net'}: <span className="tabular-nums font-medium">{fmt(sumNet)}</span></div>
          {useVirt && <div className="ml-auto italic opacity-60">{t('shows.virtualized.hint')||'Virtualized list active'}</div>}
        </div>
        {!useVirt && (
          <div className="space-y-2 max-h-[70vh] overflow-auto" role="list" aria-label={`${title} list`} ref={parentRef}>
            {shown.length === 0 && (
              <div className="text-[12px] opacity-60 italic py-3 text-center">—</div>
            )}
            {shown.map(({ s, net }) => (
              <div key={s.id} className="rounded-md border border-white/12 bg-white/5 p-2 motion-safe:transition focus:outline-none focus:ring-2 focus:ring-accent-500/60" role="listitem">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-sm">{s.city}, {countryLabel(s.country, lang)}</div>
                  <div className="text-xs opacity-70">{fmt(s.fee)}</div>
                </div>
                <div className="flex items-center justify-between text-xs opacity-80 mt-1">
                  <div>{new Date(s.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
                  <div>{t('common.net')||'Net'}: <span className="tabular-nums">{fmt(net)}</span></div>
                </div>
                {s.status!=='confirmed' && (
                  <div className="mt-2 flex items-center gap-2 justify-end">
                    <button type="button" className="text-[11px] underline opacity-80 hover:opacity-100" onClick={()=> onOpen(s)}>{t('shows.edit')||'Edit'}</button>
                    <button type="button" className="text-[11px] underline opacity-80 hover:opacity-100" onClick={()=> onPromote(s.id)}>{t('shows.promote')||'Promote'}</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {useVirt && (
          <div className="max-h-[70vh] overflow-auto" role="list" aria-label={`${title} list`} ref={parentRef}>
            {shown.length === 0 && (
              <div className="text-[12px] opacity-60 italic py-3 text-center">—</div>
            )}
            <div className="relative" style={{ height: rowVirtualizer.getTotalSize() }}>
              {rowVirtualizer.getVirtualItems().map(vItem => {
                const { s, net } = shown[vItem.index]!;
                return (
                  <div
                    key={s.id}
                    role="listitem"
                    className="absolute top-0 left-0 right-0 p-2"
                    style={{ transform: `translateY(${vItem.start}px)` }}
                  >
                    <div className="rounded-md border border-white/12 bg-white/5 p-2 motion-safe:transition focus:outline-none focus:ring-2 focus:ring-accent-500/60">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-sm">{s.city}, {countryLabel(s.country, lang)}</div>
                        <div className="text-xs opacity-70">{fmt(s.fee)}</div>
                      </div>
                      <div className="flex items-center justify-between text-xs opacity-80 mt-1">
                        <div>{new Date(s.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
                        <div>{t('common.net')||'Net'}: <span className="tabular-nums">{fmt(net)}</span></div>
                      </div>
                      {s.status!=='confirmed' && (
                        <div className="mt-2 flex items-center gap-2 justify-end">
                          <button type="button" className="text-[11px] underline opacity-80 hover:opacity-100" onClick={()=> onOpen(s)}>{t('shows.edit')||'Edit'}</button>
                          <button type="button" className="text-[11px] underline opacity-80 hover:opacity-100" onClick={()=> onPromote(s.id)}>{t('shows.promote')||'Promote'}</button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {cols.map(c => (
        <Column key={c.key} title={c.title} tone={c.tone} items={(byStatus[c.key]||[])} enabled={statusOn[c.key]} />
      ))}
    </div>
  );
};

export default BoardView;
