export type Kind = 'risk' | 'urgency' | 'opportunity' | 'offer' | 'finrisk';
export type HubAction = { id:string; kind:Kind; label:string; meta?:string; score:number; date?:string; dismissKey:string; amount?:number; status?:string; city?:string; impact?: 'high'|'med'|'low'; country?: string };

export function computeActions(now: Date, shows: Array<{id:string; date:string; city:string; fee:number; status:string; country?: string}>, travel: Array<{id:string; date:string; title?:string}>): HubAction[] {
  const DAY = 86400000; const nowTs = +now; const items: HubAction[] = [];
  const feeWeight = (fee: number) => Math.min(60, Math.log10(1 + Math.max(0, fee)) * 18);
  // Overdue invoices (older pending beyond now)
  shows.filter(s => String(s.status).toLowerCase() === 'pending').forEach(s => {
    const diff = Math.round((nowTs - +new Date(s.date))/DAY);
    if (diff > 0) {
      const score = 110 + diff + feeWeight(s.fee);
      const impact = score > 130 ? 'high' : score > 110 ? 'med' : 'low';
  items.push({ id:s.id, kind:'risk', label:`Invoice overdue • ${s.city}` , meta:`${diff}d overdue`, score, date:s.date, dismissKey:`risk:${s.id}`, amount:s.fee, status:s.status as any, city:s.city, impact, country: s.country });
    }
  });
  // Pending soon (pending/tentative/offer within 10 days)
  shows.filter(s => ['pending','offer'].includes(String(s.status))).forEach(s => {
    const diffDays = Math.round((+new Date(s.date)-nowTs)/DAY);
    if (diffDays >=0 && diffDays <= 10){
      const score = 70 + (10-diffDays) + feeWeight(s.fee);
      const dayLabel = diffDays===0 ? 'today' : `${diffDays}d`;
      const impact = score > 110 ? 'high' : score > 90 ? 'med' : 'low';
      items.push({ id:s.id, kind:'urgency', label: `${s.status} • ${s.city}`, meta: `${dayLabel}`, score, date:s.date, dismissKey:`urg:${s.id}`, amount:s.fee, status:s.status as any, city:s.city, impact, country: s.country });
    }
  });
  // Confirmed missing travel within 14 days
  shows.filter(s => String(s.status)==='confirmed').forEach(s => {
    const diffDays = Math.round((+new Date(s.date)-nowTs)/DAY);
    if (diffDays >=0 && diffDays <=14){
      const hasTravel = travel.some(t => { const td = new Date(t.date); return Math.abs((+td - +new Date(s.date))/DAY) <= 1; });
      if (!hasTravel){
        const score = 55 + (14-diffDays) + feeWeight(s.fee)/2;
        const impact = score > 80 ? 'med' : 'low';
    items.push({ id:s.id, kind:'opportunity', label: `Add travel • ${s.city}`, meta: `${diffDays}d`, score, date:s.date, dismissKey:`opp:${s.id}`, amount:s.fee, status:s.status as any, city:s.city, impact, country: s.country });
      }
    }
  });
  // Offer follow-up further out (5-30d)
  shows.filter(s => ['offer'].includes(String(s.status))).forEach(s => {
    const diffDays = Math.round((+new Date(s.date)-nowTs)/DAY);
    if (diffDays >=5 && diffDays <=30){
      const score = 65 + (25 - Math.min(diffDays,25)) + feeWeight(s.fee)/3;
      const impact = score > 90 ? 'med' : 'low';
  items.push({ id:s.id, kind:'offer', label: `Follow up • ${s.city}`, meta: `${diffDays}d out`, score, date:s.date, dismissKey:`off:${s.id}`, amount:s.fee, status:s.status as any, city:s.city, impact, country: s.country });
    }
  });
  // Financial risk: projected loss if fee below model cost baseline
  shows.forEach(s => {
    const cost = s.fee * 0.55; // pessimistic cost vs EXPENSE_RATE 0.45
    if (s.fee - cost < 0) {
      const diffDays = Math.round((+new Date(s.date)-nowTs)/DAY);
      const decay = Math.max(0, 30 - diffDays);
      const score = 85 + decay + feeWeight(Math.abs(s.fee - cost));
      const impact = score > 110 ? 'high' : score > 95 ? 'med' : 'low';
  items.push({ id:s.id, kind:'finrisk', label:`Projected loss • ${s.city}`, meta:`in ${diffDays}d`, score, date:s.date, dismissKey:`fin:${s.id}`, amount:s.fee, status:s.status as any, city:s.city, impact, country: s.country });
    }
  });
  return items.sort((a,b)=> b.score - a.score || (a.date||'').localeCompare(b.date||''));
}
