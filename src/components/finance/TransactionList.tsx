import React from 'react';
import { useTransactionsPaginated } from '../../hooks/useFirestoreScalable';
import { t } from '../../lib/i18n';
import { useSettingsStore } from '../../stores/settingsStore';

interface TransactionListProps {
  snapshotId: string;
  pageSize?: number;
}

export const TransactionList: React.FC<TransactionListProps> = ({ 
  snapshotId,
  pageSize = 50 
}) => {
  // Zustand: only re-renders when fmtMoney changes
  const fmtMoney = useSettingsStore(state => state.fmtMoney);
  const { 
    transactions, 
    loadMore, 
    hasMore, 
    isLoading, 
    error 
  } = useTransactionsPaginated(snapshotId, pageSize);

  if (error) {
    return (
      <div className="glass p-4 rounded-lg border border-red-500/20">
        <p className="text-red-500 text-sm">
          {t('errors.loadTransactions') || 'Error loading transactions'}: {error.message}
        </p>
      </div>
    );
  }

  if (isLoading && transactions.length === 0) {
    return (
      <div className="glass p-8 rounded-lg text-center">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-3/4 mx-auto"></div>
          <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-1/2 mx-auto"></div>
          <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-2/3 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="glass p-8 rounded-lg text-center">
        <p className="text-slate-500 dark:text-slate-400">
          {t('finance.noTransactions') || 'No transactions found'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Transaction List */}
      <div className="glass rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-100 dark:bg-slate-800/50 border-b border-theme">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider">
                {t('finance.date') || 'Date'}
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider">
                {t('finance.description') || 'Description'}
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider">
                {t('finance.category') || 'Category'}
              </th>
              <th className="text-right px-4 py-3 text-xs font-medium uppercase tracking-wider">
                {t('finance.amount') || 'Amount'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-theme">
            {transactions.map((tx) => (
              <tr 
                key={tx.id} 
                className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
              >
                <td className="px-4 py-3 text-sm">
                  {new Date(tx.date.seconds * 1000).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-sm">
                  {tx.description}
                  {tx.showId && (
                    <span className="ml-2 text-xs text-slate-500">
                      🎵 {tx.showId}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className="px-2 py-1 rounded-md bg-slate-200 dark:bg-slate-700 text-xs">
                    {tx.category}
                  </span>
                </td>
                <td className={`px-4 py-3 text-sm text-right font-medium ${
                  tx.type === 'income' 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {tx.type === 'income' ? '+' : '-'}
                  {fmtMoney(tx.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="px-6 py-2 rounded-lg bg-accent-500 hover:bg-accent-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-black font-medium transition-colors"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {t('actions.loading') || 'Loading...'}
              </span>
            ) : (
              <span>{t('actions.loadMore') || 'Load More'}</span>
            )}
          </button>
        </div>
      )}

      {/* Stats Footer */}
      <div className="text-center text-xs text-slate-500">
        {t('finance.showing') || 'Showing'} {transactions.length} {t('finance.transactions') || 'transactions'}
        {hasMore && ` • ${t('finance.moreAvailable') || 'More available'}`}
      </div>
    </div>
  );
};
