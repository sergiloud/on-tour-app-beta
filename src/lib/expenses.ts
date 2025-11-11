/**
 * Expenses Management for Danny Avila
 * Monthly recurring salaries for Sergio and Mike
 * Data stored ENCRYPTED using secureStorage
 */

import { secureStorage } from './secureStorage';

export type ExpenseCategory =
    | 'travel'
    | 'accommodation'
    | 'equipment'
    | 'marketing'
    | 'staff'
    | 'venue'
    | 'production'
    | 'other';

export interface Expense {
    id: string;
    date: string;
    category: ExpenseCategory;
    description: string;
    amount: number;
    currency: string;
    notes?: string;
    orgId?: string; // To link to Danny Avila's org
}

// Generate monthly expenses for Sergio and Mike from January to October 2025
function generateMonthlyExpenses(): Expense[] {
    const expenses: Expense[] = [];
    const months = [
        '2025-01-15',
        '2025-02-15',
        '2025-03-15',
        '2025-04-15',
        '2025-05-15',
        '2025-06-15',
        '2025-07-15',
        '2025-08-15',
        '2025-09-15',
        '2025-10-15',
    ];

    // Salary Sergio: 2000€ + 23% IVA = 2460€
    const sergioSalary = 2000;
    const sergioIVA = sergioSalary * 0.23;
    const sergioTotal = sergioSalary + sergioIVA;

    // Salary Mike: 1300€ + 23% IVA = 1599€
    const mikeSalary = 1300;
    const mikeIVA = mikeSalary * 0.23;
    const mikeTotal = mikeSalary + mikeIVA;

    months.forEach((date, index) => {
        // Sergio's salary
        expenses.push({
            id: `expense-sergio-salary-${index + 1}`,
            date,
            category: 'staff',
            description: 'Salary Sergio',
            amount: sergioTotal,
            currency: 'EUR',
            notes: `Monthly salary: €${sergioSalary} + 23% IVA (€${sergioIVA.toFixed(2)})`,
            orgId: 'org_artist_danny_avila',
        });

        // Mike's salary
        expenses.push({
            id: `expense-mike-salary-${index + 1}`,
            date,
            category: 'staff',
            description: 'Salary Mike',
            amount: mikeTotal,
            currency: 'EUR',
            notes: `Monthly salary: €${mikeSalary} + 23% IVA (€${mikeIVA.toFixed(2)})`,
            orgId: 'org_artist_danny_avila',
        });
    });

    return expenses;
}

export const INITIAL_EXPENSES: Expense[] = generateMonthlyExpenses();

// Backward compatibility
export const DEMO_EXPENSES = INITIAL_EXPENSES;

const EXPENSES_LS_KEY = 'finance-expenses-v1';

/**
 * Load expenses from secureStorage (ENCRYPTED)
 */
export function loadExpenses(): Expense[] {
    try {
        const expenses = secureStorage.getItem<Expense[]>(EXPENSES_LS_KEY);
        if (expenses && Array.isArray(expenses)) {
            return expenses;
        }
    } catch (err) {
        console.error('Failed to load expenses from secureStorage:', err);
    }
    return [];
}

/**
 * Save expenses to secureStorage (ENCRYPTED)
 */
export function saveExpenses(expenses: Expense[]): void {
    try {
        secureStorage.setItem(EXPENSES_LS_KEY, expenses);
    } catch (err) {
        console.error('Failed to save expenses to secureStorage:', err);
    }
}

/**
 * Load demo expense data
 * DISABLED FOR PRODUCTION BETA - all data should come from Firestore
 */
export function loadDemoExpenses(): { added: number; total: number } {
    console.log('[Expenses] Demo expense loading disabled for production');
    return { added: 0, total: 0 };
    
    /* COMMENTED OUT FOR PRODUCTION
    const existing = loadExpenses();
    const existingIds = new Set(existing.map(e => e.id));

    // Only add demo expenses that don't already exist
    const toAdd = DEMO_EXPENSES.filter(e => !existingIds.has(e.id));

    if (toAdd.length > 0) {
        const updated = [...existing, ...toAdd];
        saveExpenses(updated);
        return { added: toAdd.length, total: updated.length };
    }

    return { added: 0, total: existing.length };
    */
}

/**
 * Clear all expenses from secureStorage
 */
export function clearExpenses(): void {
    try {
        secureStorage.removeItem(EXPENSES_LS_KEY);
    } catch (err) {
        console.error('Failed to clear expenses from secureStorage:', err);
    }
}

/**
 * Force replace all expenses with initial data (wipes existing)
 */
export function forceReplaceExpenses(): { replaced: true; count: number } {
    saveExpenses(INITIAL_EXPENSES);
    return { replaced: true, count: INITIAL_EXPENSES.length };
}

// Backward compatibility
export const forceReplaceDemoExpenses = forceReplaceExpenses;

/**
 * Get total expenses for a specific month
 */
export function getTotalExpensesForMonth(year: number, month: number): number {
    const expenses = loadExpenses();
    const monthStr = `${year}-${String(month).padStart(2, '0')}`;

    return expenses
        .filter(e => e.date.startsWith(monthStr))
        .reduce((sum, e) => sum + e.amount, 0);
}

/**
 * Get expenses summary by category
 */
export function getExpensesByCategory(): Record<ExpenseCategory, number> {
    const expenses = loadExpenses();
    const summary: Record<string, number> = {};

    expenses.forEach(expense => {
        const current = summary[expense.category] || 0;
        summary[expense.category] = current + expense.amount;
    });

    return summary as Record<ExpenseCategory, number>;
}
