import { buildSnapshot } from '../src/finance/build-snapshot';
import { validateSnapshot, selectExpenseByCategory } from '../src/finance/finance-selectors';

(async function run(){
  const snap = buildSnapshot();
  const v = validateSnapshot(snap);
  const cat = selectExpenseByCategory(snap);
  const failures: string[] = [];
  if(!v.pass) failures.push(`Net mismatch: expected ${v.expectedNet} got kpiNet ${v.kpiNet}`);
  if(snap.anomalies && snap.anomalies.length > 0) {
    console.log(`Detected ${snap.anomalies.length} anomalies (informational).`);
  }
  if(cat.some(c => !isFinite(c.total))) failures.push('Non-finite category total');
  if(failures.length){
    console.error('\nFinance invariant check FAILED');
    failures.forEach(f => console.error('  -', f));
  // eslint-disable-next-line n/no-process-exit
  ;(globalThis as any).process?.exit(1);
  } else {
    console.log('Finance invariants OK');
    console.log(`Revenue: ${v.totalRevenue} | Expenses: ${v.totalExpenses} | Net: ${v.expectedNet}`);
  }
})();
