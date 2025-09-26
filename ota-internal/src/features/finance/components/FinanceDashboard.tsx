import React from 'react';
import { FinanceCoreProvider, useFinanceCore } from '../core/finance-core';
import ExecutiveSummary from './ExecutiveSummary';
import TransactionsTable from './TransactionsTable';
import ProfitabilityTimeline from './ProfitabilityTimeline';
import { ChartSkeleton, TableSkeleton, KpiSkeletonRow } from './Skeletons';
// Import charts directly (no lazy loading for now)
import { WaterfallChart, CashFlowTrendChart, CategoryDonutChart, RevenueBreakdownChart } from '../../components/finance-charts-professional.js';

// Simple KPI header component
function KPIHeader(){
  const { snapshot } = useFinanceCore();
  const k = snapshot?.kpis;
  return (
    <div className="kpi-grid" style={{display:'grid', gap:16, gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))'}}>
      {k && [
        { label:'Income', val:k.income },
        { label:'Expenses', val:k.expenses },
        { label:'Net', val:k.net },
        { label:'Margin', val: k.marginPct + '%' }
      ].map(item => (
        <div key={item.label} className="kpi-card" style={{padding:12, background:'var(--color-surface)', borderRadius:8}}>
          <div style={{fontSize:12, opacity:0.7}}>{item.label}</div>
          <div style={{fontSize:20, fontWeight:600}}>{typeof item.val === 'number' ? item.val.toLocaleString() : item.val}</div>
        </div>
      ))}
    </div>
  );
}

// Dashboard layout bridging existing professional charts
function DashboardContent(){
  const { snapshot } = useFinanceCore();
  
  // Debug: Log snapshot to verify data is loading
  React.useEffect(() => {
    console.log('[FinanceDashboard] Snapshot:', snapshot);
  }, [snapshot]);
  
  const expenses = snapshot?.expenses || [];
  const incomeTotal = expenses.filter(e=> e.type==='income').reduce((a: number, b: any)=> a + b.amount, 0);
  const expenseCats = Object.entries(expenses.filter(e=> e.type==='expense').reduce((acc,e)=> { acc[e.category] = (acc[e.category]||0)+e.amount; return acc; }, {} as Record<string, number>))
    .map(([name, amount]) => ({ name, amount, percentage: incomeTotal? Math.round((amount/incomeTotal)*100):0 }));
  
  // Fallback data for charts if no real data is available
  const fallbackExpenseCats = [
    { name: 'Venue', amount: 2500, percentage: 25 },
    { name: 'Travel', amount: 1800, percentage: 18 },
    { name: 'Equipment', amount: 1200, percentage: 12 },
    { name: 'Marketing', amount: 800, percentage: 8 },
    { name: 'Other', amount: 3700, percentage: 37 }
  ];
  
  const chartExpenseCats = expenseCats.length > 0 ? expenseCats : fallbackExpenseCats;

  return (
    <div style={{display:'flex', flexDirection:'column', gap:32}}>
      <ExecutiveSummary />
      <KPIHeader />
      <div className="charts-grid" style={{display:'grid', gap:16, gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))'}}>
        <div className="panel" style={{background:'var(--color-surface)', padding:12, borderRadius:8}}>
          <h3 style={{margin:'0 0 8px'}}>Cashflow Trend</h3>
          <CashFlowTrendChart live height={260} />
        </div>
        <div className="panel" style={{background:'var(--color-surface)', padding:12, borderRadius:8}}>
          <h3 style={{margin:'0 0 8px'}}>Waterfall</h3>
          <WaterfallChart live height={260} />
        </div>
        <div className="panel" style={{background:'var(--color-surface)', padding:12, borderRadius:8}}>
          <h3 style={{margin:'0 0 8px'}}>Expense Categories</h3>
          <CategoryDonutChart live data={chartExpenseCats} height={220} />
        </div>
        <div className="panel" style={{background:'var(--color-surface)', padding:12, borderRadius:8}}>
          <h3 style={{margin:'0 0 8px'}}>Revenue Breakdown</h3>
          <RevenueBreakdownChart live height={240} />
        </div>
        <div className="panel" style={{background:'var(--color-surface)', padding:12, borderRadius:8}}>
          <h3 style={{margin:'0 0 8px'}}>Profitability Timeline</h3>
          <ProfitabilityTimeline height={220} />
        </div>
      </div>
      <div>
        <h3 style={{margin:'8px 0'}}>Transactions</h3>
        <TransactionsTable height={360} />
      </div>
    </div>
  );
}

export function FinanceDashboard(){
  return (
    <FinanceCoreProvider>
      <DashboardContent />
    </FinanceCoreProvider>
  );
}

export default FinanceDashboard;
