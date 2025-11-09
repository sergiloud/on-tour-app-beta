import React from 'react';
import { listTrips, createTrip } from '../../services/trips';
import { t } from '../../lib/i18n';
import TripSummaryBadge from './TripSummaryBadge';
import { can } from '../../lib/tenants';

type Props = {
  title?: string;
  defaultTitle?: string;
  onCancel: ()=>void;
  onConfirm: (tripId: string)=>void;
};

export const QuickTripPicker: React.FC<Props> = ({ title, defaultTitle, onCancel, onConfirm }) => {
  const trips = listTrips();
  const [selected, setSelected] = React.useState<string | 'new' | undefined>(trips[0]?.id);
  const [newTitle, setNewTitle] = React.useState<string>(defaultTitle || title || t('travel.trip.new')||'New Trip');
  // naive extraction of path badges from titles like "MAD → BCN → LIS" for preview
  const pathFromTitle = (s: string | undefined) => {
    if (!s) return [] as string[];
    const parts = s.split(/→|->|—|-/).map(x=> x.trim()).filter(Boolean);
    return parts.length>=2 ? parts.slice(0,5) : [];
  };

  const confirm = () => {
    if (!can('travel:book')) return; // gated in read-only
    if (selected==='new' || !trips.length) {
      const id = createTrip({ title: newTitle || (t('travel.trip.new')||'New Trip'), status: 'planned' }).id;
      onConfirm(id);
    } else if (selected) {
      onConfirm(selected);
    }
  };

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />
      <div className="relative glass rounded-md p-4 w-[min(520px,92vw)]">
        <div className="text-sm font-semibold mb-2">{title || (t('travel.add_to_trip')||'Add to trip')}</div>
        <div className="mb-2">
          <TripSummaryBadge path={pathFromTitle(newTitle)} />
        </div>
        <div className="space-y-2 text-sm">
          {trips.length>0 ? (
            <div className="space-y-1">
              {trips.map(trip=> (
                <label key={trip.id} className="flex items-center gap-2">
                  <input type="radio" name="trip" value={trip.id} checked={selected===trip.id} onChange={()=> setSelected(trip.id)} />
                  <span className="opacity-80">{trip.title}</span>
                </label>
              ))}
              <label className="flex items-center gap-2">
                <input type="radio" name="trip" value="new" checked={selected==='new'} onChange={()=> setSelected('new')} />
                <span className="opacity-80">{t('travel.trip.new')||'New Trip'}</span>
              </label>
              {selected==='new' && (
                <input type="text" className="w-full bg-slate-100 dark:bg-white/5 rounded px-2 py-1" value={newTitle} onChange={e=> setNewTitle(e.target.value)} />
              )}
            </div>
          ) : (
            <div className="space-y-1">
              <div className="text-xs opacity-70">{t('travel.trip.new')||'New Trip'}</div>
              <input type="text" className="w-full bg-slate-100 dark:bg-white/5 rounded px-2 py-1" value={newTitle} onChange={e=> setNewTitle(e.target.value)} />
            </div>
          )}
        </div>
        <div className="mt-3 flex justify-end gap-2 text-sm">
          <button className="px-2 py-1 rounded bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:bg-white/10" onClick={onCancel}>{t('common.cancel')||'Cancel'}</button>
          <button className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-200 dark:bg-white/10 hover:bg-white/15" onClick={confirm}>{t('common.add')||'Add'}</button>
        </div>
      </div>
    </div>
  );
};

export default QuickTripPicker;
