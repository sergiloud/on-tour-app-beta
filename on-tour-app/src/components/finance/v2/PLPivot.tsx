import React from 'react';
import { useFinance } from '../../../context/FinanceContext';
import { useSettings } from '../../../context/SettingsContext';
import { t } from '../../../lib/i18n';

type Dim = 'Region'|'Country'|'Promoter'|'Route'|'Agency';
type SortKey = 'key'|'income'|'expenses'|'net'|'count'|'gm';

interface Props { onViewInPL?: (kind: 'Region'|'Country'|'Promoter'|'Route'|'Agency', value: string)=>void }

const PLPivot: React.FC<Props> = ({ onViewInPL }) => {
  const { v2 } = useFinance();
  const { fmtMoney } = useSettings();
  const [dim, setDim] = React.useState<Dim>('Region');
  const [sort, setSort] = React.useState<{ key: SortKey; dir: 'asc'|'desc' }>({ key: 'net', dir: 'desc' });
  const data = React.useMemo(() => {
    if (!v2) return [] as { key: string; income: number; expenses: number; net: number; count: number }[];
    const by = dim === 'Region' ? v2.breakdowns.region
      : dim === 'Country' ? v2.breakdowns.country
      : dim === 'Promoter' ? v2.breakdowns.promoter
      : dim === 'Route' ? v2.breakdowns.route
      : v2.breakdowns.agency;
    const rows = [...by].map(r => ({ ...r, gm: r.income ? (r.net / r.income) : 0 } as any));
    const m = sort.dir === 'asc' ? 1 : -1;
    rows.sort((a,b) => {
      const va = (sort.key === 'key') ? a.key : (a as any)[sort.key];
      const vb = (sort.key === 'key') ? b.key : (b as any)[sort.key];
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * m;
      return String(va).localeCompare(String(vb)) * m;
    });
    return rows;
  }, [v2, dim, sort]);

  const totals = React.useMemo(() => {
    return data.reduce((acc, r) => {
      acc.income += r.income; acc.expenses += r.expenses; acc.net += r.net; acc.count += r.count; return acc;
    }, { income: 0, expenses: 0, net: 0, count: 0 });
  }, [data]);

  const setSortKey = (key: SortKey) => setSort(prev => prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: key === 'key' ? 'asc' : 'desc' });

  return (
    <div className="p-3 rounded bg-white/5 border border-white/10 text-[12px]">
      <div className="flex items-center justify-between mb-2">
  <div className="font-medium">{t('finance.pivot') || 'Pivot'}</div>
        <div className="flex items-center gap-1 text-[11px]">
          {(['Region','Country','Promoter','Route','Agency'] as Dim[]).map(d => (
            <button key={d} onClick={()=>setDim(d)} className={`px-2 py-1 rounded ${dim===d ? 'bg-white/20' : 'bg-white/10 hover:bg-white/15'}`}>{d}</button>
          ))}
        </div>
      </div>
      <div className="overflow-auto max-h-[420px]">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-ink-900 text-[11px] opacity-80 z-10">
            <tr>
              <th className="text-left p-2" aria-sort={sort.key==='key'? (sort.dir==='asc'?'ascending':'descending') : 'none'}>
                <button className="hover:underline" onClick={()=>setSortKey('key')}>{t('finance.pivot.group') || 'Group'}{sort.key==='key' ? (sort.dir==='asc'?' ▲':' ▼') : ''}</button>
              </th>
              <th className="text-right p-2" aria-sort={sort.key==='income'? (sort.dir==='asc'?'ascending':'descending') : 'none'}>
                <button className="hover:underline float-right" onClick={()=>setSortKey('income')}>Income{sort.key==='income' ? (sort.dir==='asc'?' ▲':' ▼') : ''}</button>
              </th>
              <th className="text-right p-2" aria-sort={sort.key==='expenses'? (sort.dir==='asc'?'ascending':'descending') : 'none'}>
                <button className="hover:underline float-right" onClick={()=>setSortKey('expenses')}>Costs{sort.key==='expenses' ? (sort.dir==='asc'?' ▲':' ▼') : ''}</button>
              </th>
              <th className="text-right p-2" aria-sort={sort.key==='net'? (sort.dir==='asc'?'ascending':'descending') : 'none'}>
                <button className="hover:underline float-right" onClick={()=>setSortKey('net')}>Net{sort.key==='net' ? (sort.dir==='asc'?' ▲':' ▼') : ''}</button>
              </th>
              <th className="text-right p-2" aria-sort={sort.key==='gm'? (sort.dir==='asc'?'ascending':'descending') : 'none'}>
                <button className="hover:underline float-right" onClick={()=>setSortKey('gm')}>{t('finance.kpi.gm')||'GM%'}{sort.key==='gm' ? (sort.dir==='asc'?' ▲':' ▼') : ''}</button>
              </th>
              <th className="text-right p-2" aria-sort={sort.key==='count'? (sort.dir==='asc'?'ascending':'descending') : 'none'}>
                <button className="hover:underline float-right" onClick={()=>setSortKey('count')}>Shows{sort.key==='count' ? (sort.dir==='asc'?' ▲':' ▼') : ''}</button>
              </th>
              <th className="text-left p-2">{t('common.actions')||'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {data.map(r => (
              <tr key={r.key} className="border-t border-white/10">
                <td className="p-2">{r.key || '—'}</td>
                <td className="p-2 text-right tabular-nums">{fmtMoney(r.income)}</td>
                <td className="p-2 text-right tabular-nums">{fmtMoney(r.expenses)}</td>
                <td className="p-2 text-right tabular-nums">{fmtMoney(r.net)}</td>
                <td className="p-2 text-right tabular-nums">{Math.round((r as any).gm*100)}%</td>
                <td className="p-2 text-right tabular-nums">{r.count.toLocaleString()}</td>
                <td className="p-2">
                  <button
                    className="px-2 py-1 rounded bg-white/10 hover:bg-white/15 text-[11px]"
                    onClick={()=> onViewInPL?.(dim, r.key)}
                  >{t('shows.table.net')||'Net'} → P&L</button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="sticky bottom-0 bg-ink-900">
            <tr className="border-t border-white/10 font-medium">
              <td className="p-2">Total</td>
              <td className="p-2 text-right tabular-nums">{fmtMoney(totals.income)}</td>
              <td className="p-2 text-right tabular-nums">{fmtMoney(totals.expenses)}</td>
              <td className="p-2 text-right tabular-nums">{fmtMoney(totals.net)}</td>
              <td className="p-2 text-right tabular-nums">{totals.income ? Math.round((totals.net/totals.income)*100) : 0}%</td>
              <td className="p-2 text-right tabular-nums">{totals.count.toLocaleString()}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default PLPivot;
