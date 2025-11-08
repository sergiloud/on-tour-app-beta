import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Download, Plus } from 'lucide-react';
import { t } from '../../lib/i18n';
import GuardedAction from '../../components/common/GuardedAction';

const OrgReports: React.FC = () => {
  const rows = [
    { id: 1, name: 'Monthly Summary', items: 12, date: 'Nov 2025' },
    { id: 2, name: 'Open Invoices', items: 4, date: 'Oct 2025' },
  ];

  const onExport = () => {
    const csv = 'name,items,date\n' + rows.map(r => `${r.name},${r.items},${r.date}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reports.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="px-4 sm:px-6 flex flex-col gap-4 lg:gap-5 pb-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-slate-900/40 to-slate-800/20 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:shadow-md hover:shadow-accent-500/5">
        <div className="relative px-6 pt-5 pb-4 border-b border-white/10 bg-gradient-to-r from-transparent via-white/5 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 rounded-full bg-gradient-to-b from-accent-500 to-blue-500" />
              <div>
                <h1 className="text-lg font-semibold tracking-tight text-white">
                  {t('org.reports.title') || 'Reports'}
                </h1>
                <p className="text-xs text-white/60 mt-1">View and export your analytics</p>
              </div>
            </div>

            <motion.button
              onClick={onExport}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-500/10 border border-accent-500/20 hover:border-accent-500/40 text-accent-500 font-medium text-sm transition-all"
            >
              <Download className="w-4 h-4" />
              Export All
            </motion.button>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-slate-900/40 to-slate-800/20 backdrop-blur-sm transition-all duration-300">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-6 py-3 text-left text-xs font-semibold text-white/70 tracking-wider">
                  {t('common.name') || 'Name'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white/70 tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white/70 tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-white/70 tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {rows.map((report, idx) => (
                <motion.tr
                  key={report.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-accent-500/10 flex items-center justify-center flex-shrink-0">
                        <BarChart3 className="w-4 h-4 text-accent-500" />
                      </div>
                      <span className="text-sm font-medium text-white">{report.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-white/70">{report.date}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-white/70">{report.items} entries</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <Download className="w-4 h-4 text-white/60 hover:text-accent-500" />
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {rows.length === 0 && (
          <div className="px-6 py-12 text-center">
            <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm text-white/70 mb-1">No reports yet</p>
            <p className="text-xs text-white/50">Reports will appear here as you generate them</p>
          </div>
        )}
      </div>

      {/* Generate Report CTA */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="relative overflow-hidden rounded-lg border border-accent-500/25 bg-gradient-to-br from-accent-500/8 via-transparent to-transparent backdrop-blur-sm hover:border-accent-500/40 hover:shadow-md hover:shadow-accent-500/10 transition-all cursor-pointer p-5"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Plus className="w-5 h-5 text-accent-500" />
            <div>
              <h3 className="text-sm font-semibold text-white">Generate New Report</h3>
              <p className="text-xs text-white/60 mt-0.5">Create a custom report for your needs</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Export Button (Mobile) */}
      <GuardedAction
        scope="finance:export"
        onClick={onExport}
        className="sm:hidden w-full px-4 py-2 rounded-lg bg-accent-500/10 border border-accent-500/20 hover:border-accent-500/40 text-accent-500 font-medium text-sm transition-all flex items-center justify-center gap-2"
      >
        <Download className="w-4 h-4" />
        {t('common.export') || 'Export'}
      </GuardedAction>
    </div>
  );
};

export default OrgReports;
