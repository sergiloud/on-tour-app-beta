import React from 'react';
import type { FlightResult } from '../../../travel/providers/types';
import { t } from '../../../../lib/i18n';
import { useSettings } from '../../../../context/SettingsContext';
import { Button } from '../../../../ui/Button';

export const PinnedDrawer: React.FC<{
  items: FlightResult[];
  onUnpin: (id: string)=>void;
  onAdd: (r: FlightResult)=>void;
}> = ({ items, onUnpin, onAdd }) => {
  const { fmtMoney } = useSettings();
  if (!items.length) return null;
  const [open, setOpen] = React.useState(false);

  // Floating Action Button (FAB) to show comparison
  if (!open) {
    return (
      <div className="fixed bottom-6 right-6 z-40" aria-live="polite" data-testid="pinned-fab-wrapper">
        <Button variant="primary" size="lg" onClick={() => setOpen(true)} className="shadow-glow rounded-full">
          {t('travel.compare.show') || 'Compare'} ({items.length})
        </Button>
      </div>
    );
  }

  return (
  <div className="glass rounded-lg p-4" role="region" aria-label={t('travel.compare.title') || 'Compare Pinned Flights'} aria-live="polite">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold" aria-live="polite" data-testid="pinned-drawer-header">{t('travel.compare.title') || 'Compare Pinned Flights'} ({items.length})</h3>
        <Button variant="soft" onClick={() => setOpen(false)}>{t('common.dismiss') || 'Dismiss'}</Button>
      </div>
      <div id="pinned-table" className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="text-left opacity-70">
            <tr>
              <th className="py-1 pr-2">{t('travel.from')||'From'} → {t('travel.to')||'To'}</th>
              <th className="py-1 pr-2">{t('common.date')||'Date'}</th>
              <th className="py-1 pr-2">{t('travel.nonstop')||'Nonstop'}</th>
              <th className="py-1 pr-2">{t('common.total')||'Total'}</th>
              <th className="py-1 pr-2">{t('common.actions')||'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {items.map(r => (
              <tr key={r.id} className="border-t border-white/10 hover:bg-white/5">
                <td className="py-1 pr-2 whitespace-nowrap">{r.origin}→{r.dest}</td>
                <td className="py-1 pr-2 whitespace-nowrap">{new Date(r.dep).toLocaleDateString(undefined, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                <td className="py-1 pr-2">{r.stops===0 ? (t('travel.flight_card.nonstop')||'nonstop') : `${r.stops} ${r.stops===1?(t('travel.flight_card.stop')||'stop'):(t('travel.flight_card.stops')||'stops')}`}</td>
                <td className="py-1 pr-2 whitespace-nowrap">{fmtMoney(r.price)}</td>
                <td className="py-1 pr-2">
                  <div className="flex gap-2">
                    <Button size="sm" variant="soft" onClick={()=> onAdd(r)}>{t('travel.add_to_trip')||'Add to trip'}</Button>
                    <Button size="sm" variant="ghost" onClick={()=> onUnpin(r.id)}>{t('travel.unpin')||'Unpin'}</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PinnedDrawer;
