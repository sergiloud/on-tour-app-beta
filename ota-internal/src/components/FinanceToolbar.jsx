import React, { useState, useEffect } from 'react';
import * as Finance from '../services/finance-integrations.js';
import { useFinanceData } from './finance-charts-professional.js';

/**
 * Unified Finance Toolbar
 * Controls: live toggle, scenario selection, refresh ML, export PDF, density switch
 */
export default function FinanceToolbar({ onScenarioChange, onDensityChange, onExport, onLiveToggle, onIntervalChange }) {
  const { forecasts, snapshot, anomalies } = useFinanceData({ live: true });
  const [live, setLive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [scenario, setScenario] = useState('baseline');
  const [density, setDensity] = useState('comfortable');
  const [interval, setIntervalMs] = useState(120000);

  const scenarioOptions = (forecasts || []).map((s, idx) => ({ key: s.id || `scenario-${idx}`, label: s.label || s.name || `Scenario ${idx+1}` }));

  useEffect(()=>{ onScenarioChange?.(scenario); }, [scenario]);
  useEffect(()=>{ onDensityChange?.(density); }, [density]);
  useEffect(()=>{ onLiveToggle?.(live); }, [live]);
  useEffect(()=>{ onIntervalChange?.(interval); }, [interval]);

  async function handleRefreshAll(){
    setLoading(true);
    try { await Finance.refreshAll(); }
    finally { setLoading(false); }
  }

  async function handleExport(){
    setLoading(true);
    try {
      const doc = await Finance.generateFinanceReport('financial');
      if(doc){
        // jsPDF instance expected
        try {
          doc.save?.(`finance-report-${new Date().toISOString().slice(0,10)}.pdf`);
        } catch(err){ console.warn('PDF save failed', err); }
      }
    } finally { setLoading(false); onExport?.(); }
  }

  const anomalyCount = anomalies?.length || 0;

  return (
    <div className="finance-toolbar" role="toolbar" aria-label="Finance analytics controls">
      <div className="group">
        <span className="label">Live</span>
        <button
          className={`toolbar-btn ${live ? 'active' : ''}`}
          onClick={()=> setLive(l => !l)}
          aria-pressed={live}
        >
          <span className={`status-dot ${live ? 'live' : ''}`}></span>
          {live ? 'On' : 'Off'}
        </button>
        <button className="toolbar-btn" onClick={handleRefreshAll} disabled={loading}>{loading ? 'Refreshing...' : 'Refresh'}</button>
      </div>

      <div className="group scenario-select">
        <span className="label">Scenario</span>
        <select className="scenario-input" value={scenario} onChange={e=> setScenario(e.target.value)}>
          <option value="baseline">Baseline</option>
          {scenarioOptions.map(opt => <option key={opt.key} value={opt.key}>{opt.label}</option>)}
        </select>
      </div>

      <div className="group">
        <span className="label">Density</span>
        <label className="density-switch">
          <input type="radio" name="density" value="comfortable" checked={density==='comfortable'} onChange={()=> setDensity('comfortable')} />
          <span className="pill">Comfort</span>
        </label>
        <label className="density-switch">
          <input type="radio" name="density" value="compact" checked={density==='compact'} onChange={()=> setDensity('compact')} />
          <span className="pill">Compact</span>
        </label>
      </div>

      <div className="group">
        <span className="label">ML</span>
        <button className="toolbar-btn" onClick={async ()=>{ setLoading(true); try { if(snapshot?.expenses) await Finance.classifyExpenses(snapshot.expenses); } finally { setLoading(false); } }}>Classify</button>
        <button className="toolbar-btn" onClick={async ()=>{ setLoading(true); try { if(snapshot?.expenses) await Finance.detectAnomalies(snapshot.expenses); } finally { setLoading(false); } }}>Detect</button>
        {anomalyCount > 0 && <span className={`anomaly-pill ${anomalyCount>5?'critical':''}`}>{anomalyCount} anomalies</span>}
      </div>

      <div className="group">
        <span className="label">Export</span>
        <button className="toolbar-btn" onClick={handleExport} disabled={loading}>{loading ? 'Exporting...' : 'PDF Report'}</button>
      </div>
      <div className="group">
        <span className="label">Refresh</span>
        <select className="scenario-input" value={interval} onChange={e=> setIntervalMs(Number(e.target.value))}>
          <option value={60000}>1m</option>
          <option value={120000}>2m</option>
          <option value={300000}>5m</option>
          <option value={600000}>10m</option>
        </select>
      </div>
    </div>
  );
}
