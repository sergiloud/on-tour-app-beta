// Plain JS mount (no TS/JSX) to ensure export survives tree-shaking
import React from 'react';
import { createRoot } from 'react-dom/client';
import { FinanceCoreProvider } from './features/finance/core/finance-core';

export async function mountFinanceCharts(){
  const host = document.getElementById('professional-finance-charts');
  if(!host){ console.log('[finance-mount-js] host missing'); return; }
  if(host.__mounted){ console.log('[finance-mount-js] already mounted'); return; }
  console.log('[finance-mount-js] mounting...');
  let mod;
  try {
    mod = await import('./components/finance-charts-professional.jsx');
  } catch(e){
    console.warn('[finance-mount-js] load .jsx failed', e);
    try { mod = await import('./components/finance-charts-professional.tsx'); } catch(e2){ console.warn('[finance-mount-js] load .tsx failed', e2); }
  }
  const { WaterfallChart, CashFlowTrendChart, CategoryDonutChart, RevenueBreakdownChart } = mod || {};
  if(!WaterfallChart && !CashFlowTrendChart){
    host.innerHTML = '<div class="panel fin-panel" style="background:var(--color-surface);padding:12px;border-radius:8px;">Finance charts bundle not available</div>';
    return;
  }
  const root = createRoot(host);
  root.render(React.createElement(FinanceCoreProvider, null, React.createElement('div', { style:{display:'grid',gap:16,gridTemplateColumns:'repeat(auto-fit,minmax(340px,1fr))'}},
    React.createElement('div',{className:'panel fin-panel', style:{background:'var(--color-surface)',padding:12,borderRadius:8}},
      React.createElement('h3',{style:{margin:'0 0 8px'}},'Cash Flow Trend'),
      CashFlowTrendChart ? React.createElement(CashFlowTrendChart,{live:true,height:260}) : 'Missing'
    ),
    React.createElement('div',{className:'panel fin-panel', style:{background:'var(--color-surface)',padding:12,borderRadius:8}},
      React.createElement('h3',{style:{margin:'0 0 8px'}},'Waterfall'),
      WaterfallChart ? React.createElement(WaterfallChart,{live:true,height:260}) : 'Missing'
    ),
    React.createElement('div',{className:'panel fin-panel', style:{background:'var(--color-surface)',padding:12,borderRadius:8}},
      React.createElement('h3',{style:{margin:'0 0 8px'}},'Expense Categories'),
      CategoryDonutChart ? React.createElement(CategoryDonutChart,{live:true,height:220}) : 'Missing'
    ),
    React.createElement('div',{className:'panel fin-panel', style:{background:'var(--color-surface)',padding:12,borderRadius:8}},
      React.createElement('h3',{style:{margin:'0 0 8px'}},'Revenue Breakdown'),
      RevenueBreakdownChart ? React.createElement(RevenueBreakdownChart,{live:true,height:240}) : 'Missing'
    )
  )));
  host.__mounted = true;
  console.log('[finance-mount-js] mounted');
}

window.mountFinanceCharts = mountFinanceCharts;
