import { useMemo } from 'react';

export type MonthCell = { dateStr: string; inMonth: boolean; weekend: boolean };

export function useCalendarMatrix(year: number, month: number, weekStartsOn: 0|1 = 1) {
  // month is 1-based
  return useMemo(()=>{
    const first = new Date(year, month-1, 1);
    const shift = (first.getDay() + (7 - weekStartsOn)) % 7; // 0 = weekStartsOn
    const daysInMonth = new Date(year, month, 0).getDate();
    const grid: MonthCell[][] = [];
    let row: MonthCell[] = [];
    const toDateOnly = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth()+1).padStart(2,'0');
      const day = String(d.getDate()).padStart(2,'0');
      return `${y}-${m}-${day}`;
    };
    // leading
    for (let i=0; i<shift; i++) {
      const d = new Date(year, month-1, 1 - (shift - i));
      const dow = d.getDay();
      row.push({ dateStr: toDateOnly(d), inMonth: false, weekend: dow===0 || dow===6 });
    }
    for (let day=1; day<=daysInMonth; day++) {
      const d = new Date(year, month-1, day);
      const dow = d.getDay();
      row.push({ dateStr: toDateOnly(d), inMonth: true, weekend: dow===0 || dow===6 });
      if (row.length === 7) { grid.push(row); row = []; }
    }
    if (row.length) {
      const needed = 7 - row.length;
      for (let i=1; i<=needed; i++) {
        const d = new Date(year, month-1, daysInMonth + i);
        const dow = d.getDay();
        row.push({ dateStr: toDateOnly(d), inMonth: false, weekend: dow===0 || dow===6 });
      }
      grid.push(row);
    }
    return grid;
  }, [year, month, weekStartsOn]);
}
