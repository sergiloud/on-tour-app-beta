import { useMemo } from 'react';
import { useAnimatedNumber } from './useAnimatedNumber';
import { useSettings } from '../context/SettingsContext';
import { useFinance } from '../context/FinanceContext';

export function useFinanceKpis() {
  const { currency } = useSettings();
  const { kpis: raw, targets } = useFinance();

  const fmt = (v: number) => new Intl.NumberFormat(undefined, { style:'currency', currency }).format(v);
  const yearNet = useAnimatedNumber(raw.yearNet, { format: fmt });
  const pending = useAnimatedNumber(raw.pending, { format: fmt });
  const netMonth = useAnimatedNumber(raw.netMonth, { format: fmt });
  const incomeMonth = useAnimatedNumber(raw.incomeMonth, { format: fmt });
  const costsMonth = useAnimatedNumber(raw.costsMonth, { format: fmt });

  // Targets now come from FinanceContext (persisted)
  const effectiveTargets = useMemo(() => targets, [targets]);

  return { raw, display: { yearNet, pending, netMonth, incomeMonth, costsMonth }, targets: effectiveTargets };
}
