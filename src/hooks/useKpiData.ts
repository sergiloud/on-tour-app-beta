import { useEffect, useRef, useState } from 'react';
import { useAnimatedNumber } from './useAnimatedNumber';

export interface RawKpiState {
  yearNet: number;
  pending: number;
  netMonth: number;
  incomeMonth: number;
  costsMonth: number;
}

const TARGETS: RawKpiState = {
  yearNet: 250000,
  pending: 50000,
  netMonth: 60000,
  incomeMonth: 120000,
  costsMonth: 60000
};

export interface KpiSource {
  subscribe: (cb: (s: RawKpiState) => void) => () => void;
  targets: RawKpiState;
}

// Default mock incremental source
class IncrementalMockSource implements KpiSource {
  targets = TARGETS;
  private state: RawKpiState = { yearNet:0,pending:0,netMonth:0,incomeMonth:0,costsMonth:0 };
  subscribe(cb: (s: RawKpiState)=>void) {
    cb(this.state);
    const id = setInterval(()=>{
      this.state = {
        yearNet: Math.min(this.targets.yearNet, this.state.yearNet + Math.random()*4000),
        pending: Math.min(this.targets.pending, this.state.pending + Math.random()*800),
        netMonth: Math.min(this.targets.netMonth, this.state.netMonth + Math.random()*1200),
        incomeMonth: Math.min(this.targets.incomeMonth, this.state.incomeMonth + Math.random()*2500),
        costsMonth: Math.min(this.targets.costsMonth, this.state.costsMonth + Math.random()*2000)
      };
      cb(this.state);
    }, 1800);
    return () => clearInterval(id);
  }
}

let defaultSource: KpiSource | null = null;
export function getDefaultKpiSource(): KpiSource {
  if (!defaultSource) defaultSource = new IncrementalMockSource();
  return defaultSource;
}

export function useKpiData(source: KpiSource = getDefaultKpiSource()) {
  const [raw, setRaw] = useState<RawKpiState>({
    yearNet: 0,
    pending: 0,
    netMonth: 0,
    incomeMonth: 0,
    costsMonth: 0
  });
  const mounted = useRef(false);
  useEffect(()=>{
    mounted.current = true;
    const unsub = source.subscribe(s => { if (mounted.current) setRaw(s); });
    return ()=>{ mounted.current = false; unsub(); };
  }, [source]);

  // Animated formatted strings
  const yearNet = useAnimatedNumber(raw.yearNet, { format: v => '€' + v.toFixed(0) });
  const pending = useAnimatedNumber(raw.pending, { format: v => '€' + v.toFixed(0) });
  const netMonth = useAnimatedNumber(raw.netMonth, { format: v => '€' + v.toFixed(0) });
  const incomeMonth = useAnimatedNumber(raw.incomeMonth, { format: v => '€' + v.toFixed(0) });
  const costsMonth = useAnimatedNumber(raw.costsMonth, { format: v => '€' + v.toFixed(0) });

  return {
    raw,
  display: { yearNet, pending, netMonth, incomeMonth, costsMonth },
  targets: source.targets
  };
}
