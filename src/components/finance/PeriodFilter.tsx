import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronDown, X, TrendingUp } from 'lucide-react';
import { useFinancePeriod, ComparisonMode } from '../../context/FinancePeriodContext';

export type PeriodPreset =
  | 'last7days'
  | 'last30days'
  | 'thisMonth'
  | 'lastMonth'
  | 'thisQuarter'
  | 'lastQuarter'
  | 'thisYear'
  | 'yearToDate'
  | 'allTime'
  | 'custom';

export interface DateRange {
  startDate: string;
  endDate: string;
}

interface PeriodFilterProps {
  value: PeriodPreset;
  dateRange: DateRange;
  onChange: (preset: PeriodPreset, range: DateRange) => void;
}

const PERIOD_LABELS: Record<PeriodPreset, string> = {
  last7days: 'Últimos 7 días',
  last30days: 'Últimos 30 días',
  thisMonth: 'Este mes',
  lastMonth: 'Mes pasado',
  thisQuarter: 'Este trimestre',
  lastQuarter: 'Trimestre pasado',
  thisYear: 'Este año',
  yearToDate: 'Año hasta hoy',
  allTime: 'Todos los periodos',
  custom: 'Personalizado'
};

const calculateDateRange = (preset: PeriodPreset): DateRange => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0] || '';
  };

  switch (preset) {
    case 'last7days':
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(day - 7);
      return {
        startDate: formatDate(sevenDaysAgo),
        endDate: formatDate(now)
      };

    case 'last30days':
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(day - 30);
      return {
        startDate: formatDate(thirtyDaysAgo),
        endDate: formatDate(now)
      };

    case 'thisMonth':
      // "Este mes" debe incluir TODO el mes, no solo hasta hoy
      const lastDayOfThisMonth = new Date(year, month + 1, 0);
      return {
        startDate: formatDate(new Date(year, month, 1)),
        endDate: formatDate(lastDayOfThisMonth)
      };

    case 'lastMonth':
      const lastMonthStart = new Date(year, month - 1, 1);
      const lastMonthEnd = new Date(year, month, 0);
      return {
        startDate: formatDate(lastMonthStart),
        endDate: formatDate(lastMonthEnd)
      };

    case 'thisQuarter':
      // "Este trimestre" incluye TODO el trimestre
      const quarterStart = new Date(year, Math.floor(month / 3) * 3, 1);
      const quarterEnd = new Date(year, Math.floor(month / 3) * 3 + 3, 0);
      return {
        startDate: formatDate(quarterStart),
        endDate: formatDate(quarterEnd)
      };

    case 'lastQuarter':
      const currentQuarter = Math.floor(month / 3);
      const lastQuarter = currentQuarter === 0 ? 3 : currentQuarter - 1;
      const lastQuarterYear = currentQuarter === 0 ? year - 1 : year;
      const lastQuarterStart = new Date(lastQuarterYear, lastQuarter * 3, 1);
      const lastQuarterEnd = new Date(lastQuarterYear, lastQuarter * 3 + 3, 0);
      return {
        startDate: formatDate(lastQuarterStart),
        endDate: formatDate(lastQuarterEnd)
      };

    case 'thisYear':
      // "Este año" incluye TODO el año
      return {
        startDate: formatDate(new Date(year, 0, 1)),
        endDate: formatDate(new Date(year, 11, 31))
      };

    case 'yearToDate':
      // "Año en curso" solo hasta hoy
      return {
        startDate: formatDate(new Date(year, 0, 1)),
        endDate: formatDate(now)
      };

    case 'allTime':
      // "Toda la gira" debe incluir fechas pasadas Y futuras
      // Desde 2020 hasta 10 años en el futuro
      const futureDate = new Date(year + 10, 11, 31);
      return {
        startDate: '2020-01-01',
        endDate: formatDate(futureDate)
      };

    default:
      return {
        startDate: formatDate(now),
        endDate: formatDate(now)
      };
  }
};

const PeriodFilter: React.FC<PeriodFilterProps> = ({ value, dateRange, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCustomCalendar, setShowCustomCalendar] = useState(false);
  const [customStart, setCustomStart] = useState(dateRange.startDate);
  const [customEnd, setCustomEnd] = useState(dateRange.endDate);

  const { comparisonMode, comparisonDateRange, setComparisonMode } = useFinancePeriod();

  const handlePresetSelect = (preset: PeriodPreset) => {
    if (preset === 'custom') {
      setShowCustomCalendar(true);
      setIsOpen(false);
    } else {
      const range = calculateDateRange(preset);
      console.log(`[PeriodFilter] Seleccionado "${preset}": ${range.startDate} a ${range.endDate}`);
      onChange(preset, range);
      setIsOpen(false);
    }
  };

  const handleCustomApply = () => {
    console.log(`[PeriodFilter] Rango personalizado: ${customStart} a ${customEnd}`);
    onChange('custom', { startDate: customStart, endDate: customEnd });
    setShowCustomCalendar(false);
  };

  const formatDateRange = () => {
    if (value === 'custom') {
      const start = new Date(dateRange.startDate).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short'
      });
      const end = new Date(dateRange.endDate).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
      return `${start} - ${end}`;
    }
    return PERIOD_LABELS[value];
  };

  const formatComparisonRange = () => {
    if (!comparisonDateRange) return null;

    const start = new Date(comparisonDateRange.startDate).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short'
    });
    const end = new Date(comparisonDateRange.endDate).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    return `${start} - ${end}`;
  };

  return (
    <>
      <div className="relative flex items-center gap-3">
        {/* Period Selector */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="glass rounded-lg border border-slate-200 dark:border-white/10 px-4 py-2.5 hover:border-accent-500/30 transition-all flex items-center gap-3 min-w-[240px]"
        >
          <Calendar className="w-4 h-4 text-accent-400" />
          <div className="flex-1 text-left">
            <p className="text-[10px] uppercase tracking-wide text-slate-300 dark:text-white/40">PERÍODO</p>
            <p className="text-sm font-medium text-slate-900 dark:text-white">{formatDateRange()}</p>
          </div>
          <ChevronDown className={`w-4 h-4 text-slate-400 dark:text-white/60 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Comparison Mode Toggle */}
        <div className="flex items-center gap-2 glass rounded-lg border border-slate-200 dark:border-white/10 px-3 py-2">
          <TrendingUp className="w-4 h-4 text-accent-400" />
          <select
            value={comparisonMode}
            onChange={(e) => setComparisonMode(e.target.value as ComparisonMode)}
            className="bg-transparent text-sm text-slate-700 dark:text-slate-700 dark:text-white/90 focus:outline-none cursor-pointer"
          >
            <option value="none" className="bg-dark-800 text-slate-900 dark:text-white">Sin comparar</option>
            <option value="previous" className="bg-dark-800 text-slate-900 dark:text-white">vs. Período anterior</option>
            <option value="yearAgo" className="bg-dark-800 text-slate-900 dark:text-white">vs. Año pasado</option>
          </select>
        </div>

        {/* Comparison Range Display */}
        {comparisonMode !== 'none' && comparisonDateRange && (
          <div className="glass rounded-lg border border-accent-500/30 px-3 py-2 bg-accent-500/5">
            <p className="text-[10px] uppercase tracking-wide text-accent-400">COMPARANDO CON</p>
            <p className="text-sm font-medium text-slate-900 dark:text-white">{formatComparisonRange()}</p>
          </div>
        )}

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 mt-2 z-[9999] glass rounded-xl border border-slate-200 dark:border-white/10 shadow-xl min-w-[240px] overflow-hidden backdrop-blur-md"
            >
              <div className="p-2">
                {(Object.keys(PERIOD_LABELS) as PeriodPreset[]).map((preset) => (
                  <button
                    key={preset}
                    onClick={() => handlePresetSelect(preset)}
                    className={`w-full px-3 py-2 rounded-lg text-left text-sm transition-all ${
                      value === preset
                        ? 'bg-accent-500/20 text-white border border-accent-500/30'
                        : 'text-slate-500 dark:text-white/70 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-white border border-transparent'
                    }`}
                  >
                    {PERIOD_LABELS[preset]}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </div>

      {/* Custom Calendar Modal */}
      {showCustomCalendar && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={() => setShowCustomCalendar(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-xl border border-slate-200 dark:border-white/10 w-full max-w-md pointer-events-auto backdrop-blur-md"
            >
              <div className="px-6 py-5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">Rango Personalizado</h3>
                  <p className="text-xs text-slate-400 dark:text-white/40 mt-1">Selecciona las fechas de inicio y fin</p>
                </div>
                <button
                  onClick={() => setShowCustomCalendar(false)}
                  className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-accent-500/20 border border-slate-200 dark:border-white/10 hover:border-accent-500/30 flex items-center justify-center transition-all"
                >
                  <X className="w-4 h-4 text-slate-400 dark:text-white/60" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wide text-slate-400 dark:text-white/40 mb-2">
                    Fecha de inicio
                  </label>
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-slate-300 dark:border-white/20 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wide text-slate-400 dark:text-white/40 mb-2">
                    Fecha de inicio
                  </label>
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-accent-500/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wide text-slate-400 dark:text-white/40 mb-2">
                    Fecha de fin
                  </label>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    min={customStart}
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-accent-500/50 transition-colors"
                  />
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                  <button
                    onClick={() => setShowCustomCalendar(false)}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:bg-slate-200 dark:bg-white/10 hover:border-slate-300 dark:hover:border-white/20 text-white text-sm font-medium transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCustomApply}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-accent-500/20 border border-accent-500/30 hover:bg-accent-500/30 text-white text-sm font-medium transition-all"
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </>
  );
};

export default PeriodFilter;
