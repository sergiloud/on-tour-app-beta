import React, { useEffect, useMemo, useState, FormEvent } from 'react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import Input from '../../ui/Input';
import { t } from '../../lib/i18n';
import { Trip, getTrip, updateTrip, addSegment, removeSegment, addCost, removeCost, SegmentType, CostCategory, Currency } from '../../services/trips';
import { sumTripCosts, toCurrency } from '../../lib/travel/cost';
import { useSettings } from '../../context/SettingsContext';
import { trackEvent } from '../../lib/telemetry';
import GuardedAction from '../common/GuardedAction';
import { can } from '../../lib/tenants';

type Props = { id: string; onClose: () => void };

export const TripDetail: React.FC<Props> = ({ id, onClose }) => {
  const [trip, setTrip] = useState<Trip | undefined>(undefined);
  const { currency, fmtMoney } = useSettings();
  useEffect(() => { setTrip(getTrip(id)); }, [id]);
  
  const [showAddSegment, setShowAddSegment] = useState(false);
  const [showAddCost, setShowAddCost] = useState(false);


  const fx: Record<string, number> = { EUR: 1, USD: 1.06, GBP: 0.86 };
  const totals = useMemo(() => trip ? sumTripCosts(trip, currency, fx) : { total: 0, byCategory: {} }, [trip, currency]);

  if (!trip) return null;

  const handleAddSegment = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!can('travel:book')) return; // gated in read-only
    const formData = new FormData(e.currentTarget);
    const type = formData.get('type') as SegmentType || 'flight';
    addSegment(trip.id, { type, from: formData.get('from') as string, to: formData.get('to') as string, dep: formData.get('dep') as string });
    setTrip(getTrip(id));
    setShowAddSegment(false);
    trackEvent('travel.segment.add', { id: trip.id, type });
  };
  const removeSeg = (segId: string) => { if (!can('travel:book')) return; removeSegment(trip.id, segId); setTrip(getTrip(id)); trackEvent('travel.segment.remove', { id: trip.id }); };

  const handleAddCost = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!can('travel:book')) return; // gated in read-only
    const formData = new FormData(e.currentTarget);
    const category = (formData.get('category') as string) as CostCategory;
    const amount = Number(formData.get('amount'));
    const cur = (formData.get('currency') as string) as Currency;
    addCost(trip.id, { category, amount, currency: cur });
    setTrip(getTrip(id));
    setShowAddCost(false);
    trackEvent('travel.cost.add', { id: trip.id });
  };
  const removeTripCost = (costId: string) => { if (!can('travel:book')) return; removeCost(trip.id, costId); setTrip(getTrip(id)); trackEvent('travel.cost.remove', { id: trip.id }); };

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">{trip.title}</h3>
        <Button variant="soft" onClick={onClose}>{t('shows.dialog.close')||'Close'}</Button>
      </div>
      <div className="text-xs opacity-80">{t('common.status')||'Status'}: <span className="capitalize px-2 py-0.5 rounded-full bg-white/10">{trip.status}</span></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card className="p-3">
          <div className="text-xs font-semibold mb-2">{t('travel.segments')||'Segments'}</div>
          <ul className="text-sm space-y-1">
            {(trip.segments||[]).map(s => (
              <li key={s.id} className="flex items-center gap-2">
                <span className="opacity-80 capitalize">{s.type}</span>
                <span className="opacity-70">{s.from || ''} → {s.to || ''}</span>
                <span className="ml-auto">
                  <GuardedAction scope="travel:book" className="text-xs underline opacity-80 hover:opacity-100" onClick={()=> removeSeg(s.id)}>
                    {t('shows.views.delete')||'Delete'}
                  </GuardedAction>
                </span>
              </li>
            ))}
          </ul>
          {!showAddSegment && (
            <div className="mt-2">
              <GuardedAction
                scope="travel:book"
                className="relative inline-flex items-center justify-center font-semibold rounded-full focus-ring motion-safe:transition disabled:opacity-50 disabled:cursor-not-allowed active:scale-[.98] text-[11px] px-3 py-1.5 bg-white/8 hover:bg-white/12 text-white/90"
                onClick={() => setShowAddSegment(true)}
              >
                {t('common.add')||'Add'}
              </GuardedAction>
            </div>
          )}
          {showAddSegment && (
            <form onSubmit={handleAddSegment} className="mt-2 space-y-2 text-xs p-2 border-t border-white/10">
              <div className="grid grid-cols-3 gap-2">
                <Input name="from" placeholder={t('travel.from')||'From'} required />
                <Input name="to" placeholder={t('travel.to')||'To'} required />
                <Input name="dep" type="date" required />
              </div>
          <div className="flex items-center gap-2">
            <select name="type" defaultValue="flight" className="bg-white/5 rounded px-2 py-1 w-full max-w-[12rem] border border-transparent focus-ring">
              <option value="flight">{t('travel.segment.flight')||'Flight'}</option>
              <option value="hotel">{t('travel.segment.hotel')||'Hotel'}</option>
              <option value="ground">{t('travel.segment.ground')||'Ground'}</option>
                 </select>
                <Button type="submit" variant="primary" size="sm">{t('common.add')||'Add'}</Button>
                <Button variant="ghost" size="sm" onClick={() => setShowAddSegment(false)}>{t('common.cancel')||'Cancel'}</Button>
              </div>
            </form>
          )}
        </Card>
        <Card className="p-3">
          <div className="text-xs font-semibold mb-2">{t('common.costs')||'Costs'}</div>
          <ul className="text-sm space-y-1">
            {(trip.costs||[]).map(c => (
              <li key={c.id} className="flex items-center gap-2">
                <span className="opacity-80 capitalize">{c.category}</span>
                <span className="opacity-70">{fmtMoney(toCurrency(c.amount, c.currency || currency, currency, fx))}</span>
                <span className="ml-auto">
                  <GuardedAction scope="travel:book" className="text-xs underline opacity-80 hover:opacity-100" onClick={()=> removeTripCost(c.id)}>
                    {t('shows.views.delete')||'Delete'}
                  </GuardedAction>
                </span>
              </li>
            ))}
          </ul>
          {!showAddCost && (
            <div className="mt-2">
              <GuardedAction
                scope="travel:book"
                className="relative inline-flex items-center justify-center font-semibold rounded-full focus-ring motion-safe:transition disabled:opacity-50 disabled:cursor-not-allowed active:scale-[.98] text-[11px] px-3 py-1.5 bg-white/8 hover:bg-white/12 text-white/90"
                onClick={() => setShowAddCost(true)}
              >
                {t('common.add')||'Add'}
              </GuardedAction>
            </div>
          )}
          {showAddCost && (
            <form onSubmit={handleAddCost} className="mt-2 space-y-2 text-xs p-2 border-t border-white/10">
              <div className="grid grid-cols-3 gap-2">
                <select name="category" defaultValue="flight" className="bg-white/5 rounded px-2 py-1 w-full border border-transparent focus-ring">
                  <option value="flight">{t('cost.category.flight')||'Flight'}</option>
                  <option value="hotel">{t('cost.category.hotel')||'Hotel'}</option>
                  <option value="ground">{t('cost.category.ground')||'Ground'}</option>
                  <option value="taxes">{t('cost.category.taxes')||'Taxes'}</option>
                  <option value="fees">{t('cost.category.fees')||'Fees'}</option>
                  <option value="other">{t('cost.category.other')||'Other'}</option>
                </select>
                <Input name="amount" type="number" step="0.01" placeholder={t('shows.costs.amount')||'Amount'} required />
                <select name="currency" defaultValue={currency} className="bg-white/5 rounded px-2 py-1 w-full border border-transparent focus-ring">
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Button type="submit" variant="primary" size="sm">{t('common.add')||'Add'}</Button>
                <Button variant="ghost" size="sm" onClick={() => setShowAddCost(false)}>{t('common.cancel')||'Cancel'}</Button>
              </div>
            </form>
          )}
        </Card>
      </div>
      <div className="text-sm">{t('common.total')||'Total'}: <span className="font-semibold">{fmtMoney(totals.total)}</span></div>
    </div>
  );

};

export default TripDetail;
