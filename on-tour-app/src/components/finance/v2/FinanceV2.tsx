import React from 'react';
import PeriodSelector from '../../finance/PeriodSelector';
import { t } from '../../../lib/i18n';
import OverviewHeader from './OverviewHeader';
import KpiBar from './KpiBar';
import MarginBreakdown from './MarginBreakdown';
import PipelineAR from './PipelineAR';
import TargetsCard from './TargetsCard';
import PLTable from './PLTable';
import PLPivot from './PLPivot';
import { announce } from '../../../lib/announcer';
import { useFinance } from '../../../context/FinanceContext';
import { exportFinanceCsv } from '../../../lib/finance/export';
import { useToast } from '../../../ui/Toast';
import { trackEvent } from '../../../lib/telemetry';

const FinanceV2: React.FC = () => {
  const { snapshot } = useFinance();
  const toast = useToast();
  // Drill-through filter lifted here and passed down
  const [plFilter, setPlFilter] = React.useState<{ kind: 'Region'|'Agency'|'Country'|'Promoter'|'Route'|'Aging'; value: string } | null>(null);
  return (
    <div className="relative space-y-4">
      <OverviewHeader />
      <div className="flex items-center justify-between">
        <div className="text-sm opacity-80">{t('finance.overview') || 'Finance overview'}</div>
        <div className="flex items-center gap-2">
          <PeriodSelector />
          <button
            className="px-2 py-1 rounded bg-white/10 hover:bg-white/15 text-[11px]"
            onClick={()=>{
              try { trackEvent('finance.export.start', { type:'csv' }); } catch {}
              exportFinanceCsv(snapshot.shows as any, { masked: false, columns: ['date','city','country','venue','promoter','fee','status','route','net'] });
              try { toast.success(t('finance.export.csv.success')||'Exported \u2713'); announce(t('finance.export.csv.success')||'Exported \u2713'); } catch {}
            }}
          >{t('actions.exportCsv') || 'Export CSV'}</button>
          <button
            className="px-2 py-1 rounded bg-white/10 hover:bg-white/15 text-[11px]"
            onClick={async ()=>{
              try { trackEvent('finance.export.start', { type:'xlsx' }); } catch {}
              const XLSX = await import('xlsx');
              const rows = (snapshot.shows as any[]).map((s:any)=>{
                const cost = typeof s.cost === 'number' ? s.cost : 0;
                const net = Math.round((s.fee||0) - cost);
                return {
                  Date: s.date,
                  City: s.city,
                  Country: s.country,
                  Venue: s.venue || '',
                  Promoter: s.promoter || '',
                  Fee: s.fee || 0,
                  Cost: cost,
                  Net: net,
                  Status: s.status,
                  Route: s.route || '',
                };
              });
              const ws = XLSX.utils.json_to_sheet(rows as any);
              const wb = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(wb, ws, 'Finance');
              XLSX.writeFile(wb, `finance-${new Date().toISOString().slice(0,10)}.xlsx`);
              try { trackEvent('finance.export.complete', { type:'xlsx', count: rows.length }); } catch {}
              try { toast.success(t('finance.export.xlsx.success')||'Exported \u2713'); announce(t('finance.export.xlsx.success')||'Exported \u2713'); } catch {}
            }}
          >Export XLSX</button>
        </div>
      </div>
      <KpiBar />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <MarginBreakdown onSelect={(kind: 'Region'|'Agency'|'Country'|'Promoter'|'Route', value: string) => setPlFilter({ kind, value })} />
        </div>
        <div className="lg:col-span-1">
          <TargetsCard />
        </div>
      </div>
  <PipelineAR onViewBucket={(bucket)=>{ setPlFilter({ kind:'Aging', value: bucket }); try { announce(`Filtered P&L by AR bucket ${bucket}`); } catch {} }} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PLTable filter={plFilter} onClearFilter={() => setPlFilter(null)} />
        <PLPivot onViewInPL={(kind, value)=> setPlFilter({ kind, value })} />
      </div>
  <div className="text-[12px] opacity-80">{t('finance.v2.footer') || 'AR top debtors and row actions coming next.'}</div>
    </div>
  );
};

export default FinanceV2;
