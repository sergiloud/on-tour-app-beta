import React from 'react';

/**
 * ContactsListSkeleton - Skeleton screen para lista de contactos
 * Muestra UI instantánea mientras cargan los datos
 */
export const ContactsListSkeleton: React.FC = () => {
  return (
    <div className="space-y-2 animate-pulse">
      {[...Array(10)].map((_, i) => (
        <div key={i} className="bg-surface-card rounded-lg p-4 border border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-white/10" />
            
            {/* Info */}
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-1/4" />
              <div className="h-3 bg-slate-200 dark:bg-white/10 rounded w-1/3" />
            </div>
            
            {/* Actions */}
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-white/10" />
              <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-white/10" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * ShowsTableSkeleton - Skeleton para tabla de shows
 */
export const ShowsTableSkeleton: React.FC = () => {
  return (
    <div className="space-y-1 animate-pulse">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-surface-card rounded-lg p-4 border border-slate-200 dark:border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-12 h-12 rounded-lg bg-slate-200 dark:bg-white/10" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-1/4" />
                <div className="h-3 bg-slate-200 dark:bg-white/10 rounded w-1/3" />
              </div>
            </div>
            <div className="w-20 h-6 rounded bg-slate-200 dark:bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * KPICardsSkeleton - Skeleton para KPI cards
 */
export const KPICardsSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-surface-card rounded-xl p-6 border border-slate-200 dark:border-white/10 animate-pulse">
          <div className="space-y-3">
            <div className="h-3 bg-slate-200 dark:bg-white/10 rounded w-1/2" />
            <div className="h-8 bg-slate-200 dark:bg-white/10 rounded w-3/4" />
            <div className="h-2 bg-slate-200 dark:bg-white/10 rounded w-full" />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * ChartSkeleton - Skeleton para gráficos
 */
export const ChartSkeleton: React.FC<{ height?: string }> = ({ height = 'h-64' }) => {
  return (
    <div className={`bg-surface-card rounded-xl p-6 border border-slate-200 dark:border-white/10 ${height} animate-pulse`}>
      <div className="h-full flex flex-col">
        <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-1/4 mb-4" />
        <div className="flex-1 flex items-end gap-2">
          {[...Array(12)].map((_, i) => (
            <div 
              key={i} 
              className="flex-1 bg-slate-200 dark:bg-white/10 rounded-t"
              style={{ height: `${Math.random() * 60 + 20}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * CalendarSkeleton - Skeleton para calendario
 */
export const CalendarSkeleton: React.FC = () => {
  return (
    <div className="bg-surface-card rounded-xl p-6 border border-slate-200 dark:border-white/10 animate-pulse">
      <div className="grid grid-cols-7 gap-2 mb-4">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="h-8 bg-slate-200 dark:bg-white/10 rounded" />
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {[...Array(35)].map((_, i) => (
          <div 
            key={i} 
            className="aspect-square bg-slate-200 dark:bg-white/10 rounded"
            style={{ opacity: Math.random() * 0.5 + 0.3 }}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * TableSkeleton - Skeleton genérico para tablas
 */
export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ 
  rows = 10, 
  cols = 5 
}) => {
  return (
    <div className="space-y-1 animate-pulse">
      {/* Header */}
      <div className="grid gap-4 p-4 bg-surface-card rounded-lg border border-slate-200 dark:border-white/10" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {[...Array(cols)].map((_, i) => (
          <div key={i} className="h-4 bg-slate-200 dark:bg-white/10 rounded" />
        ))}
      </div>
      
      {/* Rows */}
      {[...Array(rows)].map((_, rowIndex) => (
        <div key={rowIndex} className="grid gap-4 p-4 bg-surface-card rounded-lg border border-slate-200 dark:border-white/10" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {[...Array(cols)].map((_, colIndex) => (
            <div 
              key={colIndex} 
              className="h-4 bg-slate-200 dark:bg-white/10 rounded" 
              style={{ width: `${Math.random() * 40 + 60}%` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};
