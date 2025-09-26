// Dynamic mount for professional finance charts (TSX)
import React from 'react';
import { createRoot } from 'react-dom/client';
import { FinanceCoreProvider } from './features/finance/core/finance-core';

let mounted = false;
export async function mountFinanceCharts(){
  if (mounted){ console.log('[finance-mount] already mounted'); return; }
  const host = document.getElementById('professional-finance-charts');
  if (!host){ console.warn('[finance-mount] host container #professional-finance-charts not found'); return; }
  console.log('[finance-mount] mounting charts...');
  try {
    // Prefer full original JS first (has complete implementations) then TSX simplified
    let mod: any;
    try {
      mod = await import('./components/finance-charts-professional.js');
  console.log('[finance-mount] loaded .js implementation');
    } catch(jsErr){
      console.log('[finance-mount] .js load failed, trying .tsx', jsErr);
      try { mod = await import('./components/finance-charts-professional.tsx'); console.log('[finance-mount] loaded .tsx'); } catch(tsxErr){
        console.log('[finance-mount] .tsx load failed, trying .jsx', tsxErr);
        mod = await import('./components/finance-charts-professional.jsx');
        console.log('[finance-mount] loaded .jsx');
      }
    }
    const { WaterfallChart, CashFlowTrendChart, CategoryDonutChart, RevenueBreakdownChart } = mod || {};
    console.log('[finance-mount] component availability', {
      WaterfallChart: !!WaterfallChart,
      CashFlowTrendChart: !!CashFlowTrendChart,
      CategoryDonutChart: !!CategoryDonutChart,
      RevenueBreakdownChart: !!RevenueBreakdownChart
    });
    if (!WaterfallChart && !CashFlowTrendChart){
      host.innerHTML = '<div class="panel fin-panel" style="background:var(--color-surface);padding:12px;border-radius:8px;">Finance charts code not loaded</div>';
      console.warn('[finance-mount] aborting render – no components exported');
      return;
    }
    const root = createRoot(host);
    root.render(
      <FinanceCoreProvider>
        <div style={{display:'grid', gap:16, gridTemplateColumns:'repeat(auto-fit,minmax(340px,1fr))'}}>
          <div className="panel fin-panel" style={{background:'var(--color-surface)', padding:12, borderRadius:8}}>
            <h3 style={{margin:'0 0 8px'}}>Cash Flow Trend</h3>
            {CashFlowTrendChart ? <CashFlowTrendChart live height={260} /> : <div className="fin-chart-placeholder">CashFlowTrendChart missing</div>}
          </div>
            <div className="panel fin-panel" style={{background:'var(--color-surface)', padding:12, borderRadius:8}}>
            <h3 style={{margin:'0 0 8px'}}>Waterfall</h3>
            {WaterfallChart ? <WaterfallChart live height={260} /> : <div className="fin-chart-placeholder">WaterfallChart missing</div>}
          </div>
          <div className="panel fin-panel" style={{background:'var(--color-surface)', padding:12, borderRadius:8}}>
            <h3 style={{margin:'0 0 8px'}}>Expense Categories</h3>
            {CategoryDonutChart ? <CategoryDonutChart live height={220} /> : <div className="fin-chart-placeholder">CategoryDonutChart missing</div>}
          </div>
          <div className="panel fin-panel" style={{background:'var(--color-surface)', padding:12, borderRadius:8}}>
            <h3 style={{margin:'0 0 8px'}}>Revenue Breakdown</h3>
            {RevenueBreakdownChart ? <RevenueBreakdownChart live height={240} /> : <div className="fin-chart-placeholder">RevenueBreakdownChart missing</div>}
          </div>
        </div>
      </FinanceCoreProvider>
    );
    mounted = true;
  console.log('[finance-mount] mount complete');
  } catch (e){
    console.warn('[mountFinanceCharts] failed', e);
  }
}

;(window as any).mountFinanceCharts = mountFinanceCharts;
