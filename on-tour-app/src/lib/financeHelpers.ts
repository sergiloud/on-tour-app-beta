import { differenceInDays, format, parseISO, startOfDay, startOfMonth, startOfQuarter } from 'date-fns';
import { es } from 'date-fns/locale';

export type GroupingMode = 'day' | 'month' | 'quarter';

export interface GroupedDataPoint {
  label: string;
  date: string;
  income: number;
  expenses: number;
  net: number;
}

/**
 * Determina el modo de agrupación automático basado en el rango de fechas
 */
export const determineGroupingMode = (startDate: string, endDate: string): GroupingMode => {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  const daysDiff = differenceInDays(end, start);

  if (daysDiff <= 45) {
    return 'day'; // Menos de 45 días: agrupar por día
  } else if (daysDiff <= 180) {
    return 'month'; // 45-180 días: agrupar por mes
  } else {
    return 'quarter'; // Más de 180 días: agrupar por trimestre
  }
};

/**
 * Agrupa transacciones por periodo según el modo especificado
 */
export const groupTransactionsByPeriod = (
  transactions: Array<{
    date: string;
    type: 'income' | 'expense';
    amount: number;
    status: 'paid' | 'pending';
  }>,
  mode: GroupingMode,
  startDate: string,
  endDate: string
): GroupedDataPoint[] => {
  // Solo considerar transacciones pagadas
  const paidTransactions = transactions.filter(t => t.status === 'paid');

  // Agrupar por clave de periodo
  const groups: Record<string, { income: number; expenses: number; date: Date }> = {};

  paidTransactions.forEach(transaction => {
    const date = parseISO(transaction.date);
    let key: string;
    let periodDate: Date;

    switch (mode) {
      case 'day':
        periodDate = startOfDay(date);
        key = format(periodDate, 'yyyy-MM-dd');
        break;
      case 'month':
        periodDate = startOfMonth(date);
        key = format(periodDate, 'yyyy-MM');
        break;
      case 'quarter':
        periodDate = startOfQuarter(date);
        key = format(periodDate, 'yyyy-QQQ');
        break;
    }

    if (!groups[key]) {
      groups[key] = { income: 0, expenses: 0, date: periodDate };
    }

    if (transaction.type === 'income') {
      groups[key].income += transaction.amount;
    } else {
      groups[key].expenses += transaction.amount;
    }
  });

  // Convertir a array y ordenar
  const result = Object.entries(groups)
    .map(([key, data]) => {
      let label: string;
      switch (mode) {
        case 'day':
          label = format(data.date, 'd MMM', { locale: es });
          break;
        case 'month':
          label = format(data.date, 'MMM yyyy', { locale: es });
          break;
        case 'quarter':
          label = format(data.date, 'QQQ yyyy', { locale: es });
          break;
      }

      return {
        label,
        date: key,
        income: data.income,
        expenses: data.expenses,
        net: data.income - data.expenses
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  return result;
};

/**
 * Calcula datos acumulados para el gráfico de presupuesto vs real
 */
export const calculateAccumulatedBudget = (
  transactions: Array<{
    date: string;
    type: 'income' | 'expense';
    amount: number;
    status: 'paid' | 'pending';
  }>,
  budgetPerDay: number,
  startDate: string,
  endDate: string
): Array<{ date: string; label: string; budgetAcc: number; realAcc: number; difference: number }> => {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  const daysDiff = differenceInDays(end, start);

  // Agrupar gastos por día
  const expensesByDay: Record<string, number> = {};
  transactions
    .filter(t => t.type === 'expense' && t.status === 'paid')
    .forEach(t => {
      const key = format(parseISO(t.date), 'yyyy-MM-dd');
      expensesByDay[key] = (expensesByDay[key] || 0) + t.amount;
    });

  // Calcular acumulados
  const result: Array<{ date: string; label: string; budgetAcc: number; realAcc: number; difference: number }> = [];
  let realAcc = 0;

  // Determinar step basado en duración
  const step = daysDiff > 90 ? 7 : daysDiff > 30 ? 3 : 1;

  for (let i = 0; i <= daysDiff; i += step) {
    const currentDate = new Date(start);
    currentDate.setDate(start.getDate() + i);
    const key = format(currentDate, 'yyyy-MM-dd');

    // Acumular gastos reales hasta esta fecha
    for (let j = i - step + 1; j <= i; j++) {
      const checkDate = new Date(start);
      checkDate.setDate(start.getDate() + j);
      const checkKey = format(checkDate, 'yyyy-MM-dd');
      realAcc += expensesByDay[checkKey] || 0;
    }

    const budgetAcc = budgetPerDay * (i + 1);
    const label = format(currentDate, 'd MMM', { locale: es });

    result.push({
      date: key,
      label,
      budgetAcc,
      realAcc,
      difference: budgetAcc - realAcc
    });
  }

  return result;
};
