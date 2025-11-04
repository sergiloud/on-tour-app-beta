import React, { useMemo } from 'react';
import { Card } from '../../../ui/Card';
import { useFinanceSnapshot } from '../../../hooks/useFinanceSnapshot';
import { t } from '../../../lib/i18n';
import { trackEvent } from '../../../lib/telemetry';
import { agenciesForShow, computeCommission } from '../../../lib/agencies';
import { sanitizeName } from '../../../lib/sanitize';

interface Insight {
  id: string;
  title: string;
  description: string;
  type: 'positive' | 'warning' | 'info';
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface KeyInsightsProps {
  onFilterChange?: (filter: { kind: 'Region' | 'Agency' | 'Country' | 'Promoter' | 'Route' | 'Aging'; value: string }) => void;
}

const KeyInsights: React.FC<KeyInsightsProps> = ({ onFilterChange }) => {
  const { allShows, snapshot, targets, compareMonthlySeries, fmtMoney, comparePrev, bookingAgencies, managementAgencies } = useFinanceSnapshot();

  const insights = useMemo<Insight[]>(() => {
    const insightsList: Insight[] = [];

    // Calculate agency commissions
    const shows = (allShows as any[]) || [];
    const confirmedShows = shows.filter(s => s.status !== 'offer');
    let totalAgencyCommissions = 0;
    const commissionsByAgency: Record<string, { name: string; amount: number }> = {};

    confirmedShows.forEach(show => {
      const applicable = agenciesForShow(show, bookingAgencies, managementAgencies);
      const allAgencies = [...applicable.booking, ...applicable.management];

      allAgencies.forEach(agency => {
        const commission = computeCommission(show, [agency]);
        if (commission > 0) {
          totalAgencyCommissions += commission;
          if (!commissionsByAgency[agency.id]) {
            commissionsByAgency[agency.id] = { name: agency.name, amount: 0 };
          }
          const entry = commissionsByAgency[agency.id];
          if (entry) entry.amount += commission;
        }
      });
    });

    // Agency Commission Insight
    if (totalAgencyCommissions > 0) {
      const totalRevenue = snapshot.year.income || 1;
      const commissionPct = (totalAgencyCommissions / totalRevenue) * 100;
      const topAgency = Object.values(commissionsByAgency).sort((a, b) => b.amount - a.amount)[0];

      if (topAgency) {
        insightsList.push({
          id: 'agency-commissions',
          title: 'Agency Commissions',
          description: `${fmtMoney(totalAgencyCommissions)} in agency fees this year (${commissionPct.toFixed(1)}% of revenue). Top: ${sanitizeName(topAgency.name)} with ${fmtMoney(topAgency.amount)}.`,
          type: commissionPct > 20 ? 'warning' : 'info',
          action: {
            label: 'View breakdown',
            onClick: () => {
              trackEvent('finance.insight.click', { type: 'agency-commissions' });
              onFilterChange?.({ kind: 'Agency', value: topAgency.name });
            }
          }
        });
      }
    }

    // 1. Most profitable show/location
    const profitableShows = snapshot.shows
      .filter(show => show.status === 'confirmed')
      .map(show => ({
        ...show,
        net: (show.fee || 0) - (typeof (show as any).cost === 'number' ? (show as any).cost : 0)
      }))
      .sort((a, b) => b.net - a.net);

    if (profitableShows.length > 0) {
      const topShow = profitableShows[0];
      if (!topShow) return insightsList;

      const avgNet = profitableShows.reduce((sum, show) => sum + show.net, 0) / profitableShows.length;
      const pctAboveAvg = Math.round(((topShow.net - avgNet) / Math.max(1, avgNet)) * 100);

      if (pctAboveAvg > 10) {
        const cityName = topShow.city ?? topShow.venue ?? 'Unknown';
        insightsList.push({
          id: 'top-show',
          title: t('finance.insights.topShow.title') || 'Top Performing Show',
          description: `${cityName} generated ${fmtMoney(topShow.net)}, ${pctAboveAvg}% above your average.`,
          type: 'positive',
          action: topShow.city ? {
            label: t('finance.insights.filterByCity') || 'Filter by city',
            onClick: () => {
              if (!topShow.city) return;
              trackEvent('finance.insight.click', { type: 'top-show', value: topShow.city });
              onFilterChange?.({ kind: 'Region', value: topShow.city });
            }
          } : undefined
        });
      }
    }

    // 2. Travel costs trend
    if (comparePrev && compareMonthlySeries) {
      const currentMonthCosts = snapshot.month.expenses || 0;
      const prevMonthCosts = compareMonthlySeries.costs?.[compareMonthlySeries.costs.length - 1] || 0;

      if (prevMonthCosts > 0) {
        const costIncrease = ((currentMonthCosts - prevMonthCosts) / prevMonthCosts) * 100;
        if (Math.abs(costIncrease) > 15) {
          insightsList.push({
            id: 'travel-costs',
            title: t('finance.insights.travelCosts.title') || 'Travel Costs Trend',
            description: `Travel costs ${costIncrease > 0 ? 'increased' : 'decreased'} by ${Math.abs(Math.round(costIncrease))}% compared to last month.`,
            type: costIncrease > 0 ? 'warning' : 'positive',
            action: {
              label: t('finance.insights.viewBreakdown') || 'View breakdown',
              onClick: () => {
                trackEvent('finance.insight.click', { type: 'travel-costs' });
                onFilterChange?.({ kind: 'Route', value: 'travel' });
              }
            }
          });
        }
      }
    }

    // 3. Pending invoices
    const pendingAmount = snapshot.pending || 0;
    const overdueCount = snapshot.shows.filter(show =>
      show.status === 'confirmed' &&
      new Date(show.date) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length;

    if (pendingAmount > 0 || overdueCount > 0) {
      let description = '';
      if (pendingAmount > 0) {
        description = `${t('finance.insights.pendingAmount') || 'You have'} ${fmtMoney(pendingAmount)} ${t('finance.insights.inPendingInvoices') || 'in pending invoices'}.`;
      }
      if (overdueCount > 0) {
        description += ` ${overdueCount} ${t('finance.insights.overdueInvoices') || 'invoices are over 30 days old'}.`;
      }

      insightsList.push({
        id: 'pending-invoices',
        title: t('finance.insights.pendingInvoices.title') || 'Accounts Receivable',
        description: description.trim(),
        type: overdueCount > 0 ? 'warning' : 'info',
        action: overdueCount > 0 ? {
          label: t('finance.insights.viewOverdue') || 'View overdue',
          onClick: () => {
            trackEvent('finance.insight.click', { type: 'pending-invoices' });
            onFilterChange?.({ kind: 'Aging', value: 'overdue' });
          }
        } : undefined
      });
    }

    // 4. Target performance
    const target = targets.netMonth || 0;
    if (target > 0) {
      const currentNet = snapshot.month.net || 0;
      const progress = (currentNet / target) * 100;

      if (progress >= 90) {
        insightsList.push({
          id: 'target-progress',
          title: t('finance.insights.targetProgress.title') || 'Target Progress',
          description: `You're at ${Math.round(progress)}% of your monthly net target of ${fmtMoney(target)}.`,
          type: progress >= 100 ? 'positive' : 'info'
        });
      } else if (progress < 75) {
        insightsList.push({
          id: 'target-progress',
          title: t('finance.insights.targetProgress.title') || 'Target Progress',
          description: `You're at ${Math.round(progress)}% of your monthly net target. Consider focusing on high-value opportunities.`,
          type: 'warning'
        });
      }
    }

    // Limit to 3 most relevant insights
    return insightsList.slice(0, 3);
  }, [snapshot, targets, compareMonthlySeries, comparePrev, fmtMoney, onFilterChange]);

  if (insights.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium opacity-90">
        {t('finance.insights.title') || 'Key Insights'}
      </h3>
      <div className="grid gap-3">
        {insights.map((insight) => (
          <Card
            key={insight.id}
            className={`p-4 border border-white/10 glass cursor-pointer transition-all hover:bg-white/5 ${insight.type === 'positive' ? 'border-emerald-500/30 bg-emerald-500/5' :
              insight.type === 'warning' ? 'border-amber-500/30 bg-amber-500/5' :
                'border-blue-500/30 bg-blue-500/5'
              }`}
            onClick={insight.action?.onClick}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-sm font-medium mb-1">{insight.title}</h4>
                <p className="text-sm opacity-80">{insight.description}</p>
              </div>
              {insight.action && (
                <button
                  className="ml-3 px-2 py-1 text-xs rounded bg-white/10 hover:bg-white/20 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    insight.action?.onClick();
                  }}
                >
                  {insight.action.label}
                </button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default KeyInsights;
