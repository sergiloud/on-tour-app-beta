import React from 'react';
import { useFinance } from '../../../context/FinanceContext';
import { useSettings } from '../../../context/SettingsContext';
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { sumFees, type SupportedCurrency } from '../../../lib/fx';
import { loadSettings } from '../../../lib/persist';

/**
 * Settlement Intelligence - Professional Data View
 */
export const SettlementIntelligence: React.FC = () => {
    const { snapshot } = useFinance();
    const { fmtMoney } = useSettings();

    const settings = loadSettings() as any;
    const baseCurrency = (settings.currency || 'EUR') as SupportedCurrency;

    const confirmedShows = snapshot?.shows?.filter(s => s.status === 'confirmed') || [];
    const pendingShows = snapshot?.shows?.filter(s => s.status === 'pending') || [];
    const totalSettlement = sumFees(confirmedShows, baseCurrency);
    const pendingAmount = sumFees(pendingShows, baseCurrency);

    const totalShows = snapshot?.shows?.length || 0;
    const settledPercentage = totalShows > 0 ? Math.round((confirmedShows.length / totalShows) * 100) : 0;

    // Check for tax withholding alerts
    // Note: wht property not yet in FinanceShow type, keeping for future enhancement
    const whtShows = snapshot?.shows?.filter(s => (s as any).wht && (s as any).wht > 0) || [];
    const hasWHTAlert = whtShows.length > 0;

    if (confirmedShows.length === 0 && pendingShows.length === 0) return null;

    return (
        <div className="space-y-6">
            {/* Settlement Pipeline - Clean Data Grid */}
            <div className="bg-dark-800/50 rounded-lg border border-white/10 overflow-hidden">
                {/* Header */}
                <div className="px-8 py-4 border-b border-white/10 bg-dark-900/50">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider">
                            Settlement Pipeline
                        </h3>
                        <div className="text-xs text-white/30">
                            {totalShows} total shows
                        </div>
                    </div>
                </div>

                {/* Data Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5">
                    {/* Confirmed */}
                    <div className="p-8 bg-dark-800 hover:bg-dark-800/70 transition-colors">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-3">
                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                    <span className="text-xs font-medium text-white/40 uppercase tracking-wider">
                                        Confirmed
                                    </span>
                                </div>
                                <div className="text-3xl font-light text-white tabular-nums">
                                    {fmtMoney(totalSettlement)}
                                </div>
                            </div>
                        </div>
                        <div className="text-xs text-white/30">
                            {confirmedShows.length} show{confirmedShows.length !== 1 ? 's' : ''}
                        </div>
                    </div>

                    {/* Pending */}
                    <div className="p-8 bg-dark-800 hover:bg-dark-800/70 transition-colors">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-3">
                                    <Clock className="w-4 h-4 text-blue-400" />
                                    <span className="text-xs font-medium text-white/40 uppercase tracking-wider">
                                        Pending
                                    </span>
                                </div>
                                <div className="text-3xl font-light text-white tabular-nums">
                                    {fmtMoney(pendingAmount)}
                                </div>
                            </div>
                        </div>
                        <div className="text-xs text-white/30">
                            {pendingShows.length} show{pendingShows.length !== 1 ? 's' : ''}
                        </div>
                    </div>

                    {/* Progress */}
                    <div className="p-8 bg-dark-900 hover:bg-dark-900/70 transition-colors">
                        <div className="mb-3">
                            <span className="text-xs font-medium text-white/40 uppercase tracking-wider">
                                Completion
                            </span>
                        </div>
                        <div className="text-3xl font-light text-accent-400 tabular-nums mb-4">
                            {settledPercentage}%
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-accent-500 to-green-500 transition-all duration-300"
                                style={{ width: `${settledPercentage}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Alerts Section */}
            {hasWHTAlert && (
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                            <AlertTriangle className="w-5 h-5 text-amber-400" />
                        </div>
                        <div className="flex-1">
                            <div className="text-sm font-medium text-amber-400 mb-1">
                                Tax Withholding Alert
                            </div>
                            <div className="text-sm text-white/60">
                                {whtShows.length} show{whtShows.length !== 1 ? 's' : ''} with withholding tax requirements
                            </div>
                        </div>
                        <button className="px-4 py-2 text-xs font-medium text-amber-400 border border-amber-500/30 rounded hover:bg-amber-500/10 transition-colors">
                            Review
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettlementIntelligence;
