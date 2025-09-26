// Lightweight forecasting engine (phase 1)
// Generates baseline, optimistic, pessimistic scenarios from historical net trend.
// Heuristic approach: compute average monthly net and apply growth modifiers.
import type { ForecastScenario, ForecastPoint } from './finance-types';
import { summarizeMonth } from './finance-calcs';
import { demoShows } from '../../../data/demo';

interface GenerateOptions {
  monthsForward?: number;
  refDate?: Date;
}

function monthKey(d: Date){ return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; }

function buildHistoryMonths(ref: Date, back: number){
  const arr: { key: string; net: number; income: number; expenses: number; }[] = [];
  for(let i=back;i>=1;i--){
    const d = new Date(ref); d.setMonth(d.getMonth()-i);
    const sum = summarizeMonth(demoShows, d.getMonth(), d.getFullYear());
    arr.push({ key: monthKey(d), net: sum.net, income: sum.income, expenses: sum.expenses });
  }
  return arr;
}

export function generateForecastScenarios(opts: GenerateOptions = {}): ForecastScenario[] {
  const { monthsForward = 6, refDate = new Date() } = opts;
  const history = buildHistoryMonths(refDate, 6);
  const avgNet = history.reduce((a,b)=> a + b.net, 0) / (history.length || 1);
  const volatility = Math.sqrt(history.reduce((a,b)=> a + Math.pow(b.net - avgNet,2),0) / (history.length || 1)) || 1;
  const baseGrowth = (avgNet / (history[history.length-1]?.net || avgNet || 1)) - 1 || 0;

  const scenarios: Array<{ meta: Omit<ForecastScenario,'series'>; growth: number; variance: number; }> = [
    { meta: { id:'baseline', label:'Baseline', kind:'baseline', confidence:0.6, assumptions:[`Growth ${(baseGrowth*100).toFixed(1)}%`] }, growth: baseGrowth, variance: 0.15 },
    { meta: { id:'optimistic', label:'Optimistic', kind:'optimistic', confidence:0.2, assumptions:['Improved ticket sales','Cost optimization'] }, growth: baseGrowth + 0.12, variance: 0.2 },
    { meta: { id:'pessimistic', label:'Pessimistic', kind:'pessimistic', confidence:0.2, assumptions:['Lower attendance','Increased logistics cost'] }, growth: baseGrowth - 0.15, variance: 0.25 }
  ];

  function buildSeries(growth: number, variance: number): ForecastPoint[] {
    const pts: ForecastPoint[] = [];
    let d = new Date(refDate);
    let last = history[history.length-1]?.net || avgNet || 0;
    for(let i=0;i<monthsForward;i++){
      d.setMonth(d.getMonth()+1);
      // Simple compounding with random-ish variance derived from volatility (deterministic using sin)
      const noise = Math.sin((i+1)*1.73) * volatility * variance;
      last = last * (1 + growth) + noise;
      pts.push({ month: monthKey(d), value: Math.round(last) });
    }
    return pts;
  }

  return scenarios.map(s => ({ ...s.meta, series: buildSeries(s.growth, s.variance) }));
}

export function selectScenario(scenarios: ForecastScenario[], id?: string){
  if(!scenarios?.length) return undefined;
  return scenarios.find(s => s.id === id) || scenarios[0];
}
