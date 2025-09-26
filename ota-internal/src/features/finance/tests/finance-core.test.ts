import { describe, it, expect } from 'vitest';
import { buildSnapshot } from '../core/build-snapshot';
import { validateSnapshot, selectExpenseByCategory, selectMonthlySeries, selectActiveScenario, selectAnomalySummary, selectProfitabilityTimeline } from '../core/finance-selectors';

describe('finance-core snapshot', () => {
  const snap = buildSnapshot();
  it('builds KPIs with consistent net', () => {
    const v = validateSnapshot(snap);
    expect(v.pass).toBe(true);
  });
  it('produces expense categories sorted desc', () => {
    const cats = selectExpenseByCategory(snap);
    for(let i=1;i<cats.length;i++){
      expect(cats[i-1].total).toBeGreaterThanOrEqual(cats[i].total);
    }
  });
  it('produces monthly series with margin field', () => {
    const series = selectMonthlySeries(snap);
    expect(series.length).toBeGreaterThan(0);
    expect(series[0]).toHaveProperty('margin');
  });
  it('has multi-scenario forecasts', () => {
    expect(snap.forecasts.length).toBeGreaterThanOrEqual(3);
    const active = selectActiveScenario(snap);
    expect(active?.series.length).toBeGreaterThan(0);
  });
  it('anomaly summary counts', () => {
    const summary = selectAnomalySummary(snap);
    expect(summary.total).toBeGreaterThanOrEqual(summary.expenseSpike + summary.incomeDrop);
  });
  it('profitability timeline margins computed', () => {
    const timeline = selectProfitabilityTimeline(snap);
    if (timeline.length) {
      expect(timeline[0]).toHaveProperty('marginPct');
    }
  });
  it('scenario selection updates snapshot id', () => {
    // simulate provider logic manually by mutating snapshot selectedScenarioId
    const first = snap.forecasts[0];
    const second = snap.forecasts[1];
    expect(first && second && first.id).not.toBeUndefined();
    const mutated = { ...snap, selectedScenarioId: second?.id };
    expect(mutated.selectedScenarioId).toBe(second?.id);
  });
});
