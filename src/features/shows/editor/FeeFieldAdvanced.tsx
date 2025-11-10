import React, { useMemo } from 'react';
import { t } from '../../../lib/i18n';

export interface FeeFieldAdvancedProps {
  fee: number | undefined;
  onFeeChange: (fee: number | undefined) => void;
  costs: number;
  whtPct?: number;
  currency: string;
  currencySymbol: string;
  label?: string;
  help?: string;
  error?: string;
  disabled?: boolean;
  fmtMoney: (amount: number) => string;
  onOpenCostsTab?: () => void;
  // FX rate fields
  fxRate?: number;
  fxRateDate?: string;
  fxRateSource?: string;
  onFxRateChange?: (rate: number | undefined) => void;
  onFxRateDateChange?: (date: string | undefined) => void;
  onFxRateSourceChange?: (source: string) => void;
  baseCurrency?: string;
}

/**
 * Advanced Fee Field with:
 * - Currency prefix (€, $, etc)
 * - Real-time net profit calculation
 * - Visual breakdown of fee, costs, WHT, and net
 * - FX rate locking for accounting compliance
 * - Mini financial dashboard
 */
export const FeeFieldAdvanced: React.FC<FeeFieldAdvancedProps> = ({
  fee,
  onFeeChange,
  costs,
  whtPct = 0,
  currency,
  currencySymbol,
  label,
  help,
  error,
  disabled = false,
  fmtMoney,
  onOpenCostsTab,
  fxRate,
  fxRateDate,
  fxRateSource = 'system',
  onFxRateChange,
  onFxRateDateChange,
  onFxRateSourceChange,
  baseCurrency = 'EUR',
}) => {
  // Calculate derived values
  const calculations = useMemo(() => {
    const f = fee ?? 0;
    const c = costs ?? 0;
    const wht = Math.round(f * (whtPct / 100));
    const net = f - c - wht;
    const profitMargin = f > 0 ? Math.round((net / f) * 100) : 0;

    return { fee: f, costs: c, wht, net, profitMargin };
  }, [fee, costs, whtPct]);

  const handleFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '' || val === '-') {
      onFeeChange(undefined);
    } else {
      const num = Number(val);
      if (!isNaN(num)) {
        onFeeChange(Math.round(num));
      }
    }
  };

  // Determine color based on profit margin
  const getMarginColor = (margin: number): string => {
    if (margin >= 60) return 'text-green-300';
    if (margin >= 40) return 'text-green-400';
    if (margin >= 20) return 'text-yellow-300';
    if (margin >= 0) return 'text-orange-300';
    return 'text-red-300';
  };

  const getBgColor = (margin: number): string => {
    if (margin >= 60) return 'from-green-500/20 via-green-500/10 to-green-500/5';
    if (margin >= 40) return 'from-green-500/15 via-green-500/8 to-green-500/3';
    if (margin >= 20) return 'from-yellow-500/15 via-yellow-500/8 to-yellow-500/3';
    if (margin >= 0) return 'from-orange-500/15 via-orange-500/8 to-orange-500/3';
    return 'from-red-500/20 via-red-500/10 to-red-500/5';
  };

  return (
    <div className="space-y-3">
      {/* Label and Help */}
      {label && (
        <div className="flex items-center gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/70">
            {label}
          </label>
          {help && (
            <span className="text-[9px] lowercase tracking-normal opacity-50 font-normal">
              {help}
            </span>
          )}
        </div>
      )}

      {/* Fee Input Field */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-accent-300 pointer-events-none">
          {currencySymbol}
        </div>
        <input
          type="number"
          disabled={disabled}
          value={fee ?? ''}
          onChange={handleFeeChange}
          className="w-full pl-6 pr-3 py-1.5 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-white/15 focus:border-accent-500 focus:bg-slate-300 dark:bg-white/15 focus:shadow-lg focus:shadow-accent-500/10 focus:ring-1 focus:ring-accent-500/20 transition-all text-white placeholder:text-slate-400 dark:placeholder:text-slate-300 dark:text-white/30 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          placeholder={t('shows.editor.placeholder.fee') || 'Enter fee...'}
          min={0}
          step={1}
        />
      </div>

      {error && <p className="text-[10px] text-red-400">{error}</p>}

      {/* FX Rate Management Section (if currency is not base) */}
      {currency && currency !== baseCurrency && (
        <div className="space-y-1.5 p-2.5 rounded-md bg-blue-500/10 border border-blue-500/30">
          <p className="text-[9px] font-semibold uppercase tracking-wide text-blue-200">
            {t('shows.editor.fxRate.title') || 'Exchange Rate Lock'}
          </p>

          {/* FX Rate Display/Input */}
          <div className="flex items-center gap-1.5">
            <div className="flex-1">
              <label className="text-[9px] uppercase tracking-wide text-slate-400 dark:text-white/60 font-medium block mb-0.5">
                {currency} → {baseCurrency}
              </label>
              <input
                type="number"
                value={fxRate ?? ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (onFxRateChange) {
                    if (val === '' || val === '-') {
                      onFxRateChange(undefined);
                    } else {
                      const num = Number(val);
                      if (!isNaN(num) && num > 0) {
                        onFxRateChange(Number(num.toFixed(6)));
                      }
                    }
                  }
                }}
                placeholder="1.0000"
                step="0.0001"
                min="0.0001"
                max="99.9999"
                className="w-full px-2 py-1 rounded-sm bg-slate-100 dark:bg-white/5 border border-blue-500/30 hover:border-blue-500/50 focus:border-blue-400 focus:bg-slate-200 dark:bg-slate-200 dark:bg-white/10 text-xs text-white placeholder:text-slate-400 dark:placeholder:text-slate-300 dark:text-white/30 transition-all"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                // Get today's date
                const today = new Date().toISOString().split('T')[0];
                if (onFxRateDateChange) onFxRateDateChange(today);
                if (onFxRateSourceChange) onFxRateSourceChange('today');
              }}
              className="px-2 py-1 rounded-sm bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 hover:border-blue-500/60 text-blue-200 hover:text-blue-100 text-[8px] font-medium whitespace-nowrap transition-all h-fit"
              title={t('shows.editor.fxRate.updateToday') || 'Update to today rate'}
            >
              📅 Today
            </button>
          </div>

          {/* FX Rate Date */}
          <div>
            <label className="text-[9px] uppercase tracking-wide text-slate-400 dark:text-white/60 font-medium block mb-0.5">
              {t('shows.editor.fxRate.date') || 'Rate Date'}
            </label>
            <input
              type="date"
              value={fxRateDate || ''}
              onChange={(e) => {
                if (onFxRateDateChange) {
                  const val = e.target.value;
                  onFxRateDateChange(val || undefined);
                  if (val && onFxRateSourceChange) {
                    onFxRateSourceChange('locked');
                  }
                }
              }}
              className="w-full px-2 py-1 rounded-sm bg-slate-100 dark:bg-white/5 border border-blue-500/30 hover:border-blue-500/50 focus:border-blue-400 focus:bg-slate-200 dark:bg-slate-200 dark:bg-white/10 text-xs text-white placeholder:text-slate-400 dark:placeholder:text-slate-300 dark:text-white/30 transition-all"
            />
          </div>

          {/* FX Rate Source Badge */}
          {fxRate && (
            <div className="flex items-center gap-1.5 pt-0.5 text-[8px]">
              <span className="px-1.5 py-0.5 rounded-full bg-blue-500/30 border border-blue-500/50 text-blue-200 font-medium">
                {fxRateSource === 'locked' ? '🔒 Locked' : fxRateSource === 'today' ? '📅 Today' : '⚙️ System'}
              </span>
              <span className="text-slate-300 dark:text-white/50">
                {fxRateDate ? new Date(fxRateDate + 'T00:00:00').toLocaleDateString() : 'No date set'}
              </span>
            </div>
          )}

          {/* FX Calculation Preview */}
          {fxRate && fee && (
            <div className="pt-1 border-t border-blue-500/20 text-[9px] space-y-0.5">
              <div className="flex justify-between">
                <span className="text-slate-400 dark:text-white/60">{fee} {currency} @</span>
                <span className="text-blue-200">{fxRate.toFixed(4)}</span>
              </div>
              <div className="flex justify-between font-semibold text-blue-100">
                <span>=</span>
                <span>{(fee * fxRate).toFixed(2)} {baseCurrency}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Financial Breakdown Dashboard */}
      {calculations.fee > 0 && (
        <div className={`bg-gradient-to-br ${getBgColor(calculations.profitMargin)} border border-slate-200 dark:border-white/10 rounded-md p-2.5 space-y-2.5`}>
          {/* Top Row: Fee and Costs */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] uppercase tracking-wide text-slate-300 dark:text-white/50 font-semibold">
                {t('shows.editor.summary.fee') || 'Fee'}
              </span>
              <span className="text-sm font-bold text-white/80">
                {fmtMoney(calculations.fee)}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center justify-between gap-1.5">
                <span className="text-[9px] uppercase tracking-wide text-slate-300 dark:text-white/50 font-semibold">
                  {t('shows.editor.summary.costs') || 'Costs'}
                </span>
                {onOpenCostsTab && calculations.costs > 0 && (
                  <button
                    type="button"
                    onClick={onOpenCostsTab}
                    className="text-[8px] px-1.5 py-0.5 rounded-sm bg-slate-200 dark:bg-slate-200 dark:bg-white/10 hover:bg-white/20 text-accent-300 hover:text-accent-200 font-medium transition-all duration-200 hover:scale-105 active:scale-95"
                    title={t('shows.editor.costs.manage') || 'Manage costs'}
                  >
                    ✏️ Edit
                  </button>
                )}
              </div>
              <span className="text-sm font-bold text-red-300/80">
                -{fmtMoney(calculations.costs)}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-slate-200 dark:bg-white/10"></div>

          {/* Bottom Row: WHT and Net */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] uppercase tracking-wide text-slate-300 dark:text-white/50 font-semibold">
                {t('shows.editor.summary.wht') || 'WHT'} ({whtPct}%)
              </span>
              <span className="text-sm font-bold text-orange-300/80">
                -{fmtMoney(calculations.wht)}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] uppercase tracking-wide text-slate-300 dark:text-white/50 font-semibold">
                {t('shows.editor.summary.net') || 'Est. Net'}
              </span>
              <div className="flex items-center gap-1.5">
                <span className={`text-sm font-bold ${getMarginColor(calculations.profitMargin)}`}>
                  {fmtMoney(calculations.net)}
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${getMarginColor(
                    calculations.profitMargin
                  )} bg-white/10`}
                >
                  {calculations.profitMargin}%
                </span>
              </div>
            </div>
          </div>

          {/* Profit Margin Indicator */}
          <div className="flex items-center gap-2 pt-0.5">
            <div className="flex-1 h-0.5 bg-slate-200 dark:bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 bg-gradient-to-r ${
                  calculations.profitMargin >= 60
                    ? 'from-green-500 to-green-400 w-full'
                    : calculations.profitMargin >= 40
                    ? 'from-green-500 to-yellow-400'
                    : calculations.profitMargin >= 20
                    ? 'from-yellow-500 to-orange-400'
                    : calculations.profitMargin >= 0
                    ? 'from-orange-500 to-red-400'
                    : 'from-red-500 to-red-600'
                }`}
                style={{
                  width: `${Math.max(5, Math.min(100, calculations.profitMargin))}%`,
                }}
              />
            </div>
            <span className="text-[9px] text-slate-400 dark:text-white/60 font-medium min-w-fit">
              {calculations.profitMargin >= 0 ? 'Profitable' : 'At loss'}
            </span>
          </div>
        </div>
      )}

      {/* Empty state hint */}
      {!calculations.fee && (
        <div className="text-[10px] text-slate-300 dark:text-white/50 italic">
          {t('shows.editor.fee.hint') || 'Enter fee amount to see financial breakdown'}
        </div>
      )}
    </div>
  );
};

export default FeeFieldAdvanced;
