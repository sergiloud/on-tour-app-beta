import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, DollarSign, FileText, TrendingUp, Download, Filter, Calendar } from 'lucide-react';
import { usePullToRefresh } from '../../../../hooks/usePullToRefresh';
import { haptic } from '../../../../lib/haptics';

interface Report {
  id: string;
  type: 'financial' | 'tour' | 'tax';
  title: string;
  period: string;
  date: string;
  revenue?: number;
  expenses?: number;
  profit?: number;
  shows?: number;
  status: 'draft' | 'final';
}

const mockReports: Report[] = [
  {
    id: '1',
    type: 'financial',
    title: 'Q4 2024 Financial Report',
    period: 'Oct - Dec 2024',
    date: '2024-12-31',
    revenue: 145000,
    expenses: 89000,
    profit: 56000,
    status: 'final'
  },
  {
    id: '2',
    type: 'tour',
    title: 'European Tour Summary',
    period: 'Nov 2024',
    date: '2024-11-30',
    shows: 12,
    revenue: 89000,
    expenses: 52000,
    profit: 37000,
    status: 'final'
  },
  {
    id: '3',
    type: 'tax',
    title: 'Tax Report 2024',
    period: 'Full Year 2024',
    date: '2024-12-31',
    revenue: 450000,
    expenses: 280000,
    status: 'draft'
  },
  {
    id: '4',
    type: 'financial',
    title: 'Q3 2024 Financial Report',
    period: 'Jul - Sep 2024',
    date: '2024-09-30',
    revenue: 98000,
    expenses: 61000,
    profit: 37000,
    status: 'final'
  },
  {
    id: '5',
    type: 'tour',
    title: 'Summer Festival Circuit',
    period: 'Jun - Aug 2024',
    date: '2024-08-31',
    shows: 18,
    revenue: 125000,
    expenses: 78000,
    profit: 47000,
    status: 'final'
  }
];

export const ReportsApp: React.FC = () => {
  const [reports, setReports] = useState(mockReports);
  const [selectedType, setSelectedType] = useState<'all' | 'financial' | 'tour' | 'tax'>('all');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleRefresh = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    haptic('success');
  };

  const { isRefreshing } = usePullToRefresh({ onRefresh: handleRefresh });

  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const matchesType = selectedType === 'all' || report.type === selectedType;
      const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           report.period.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [reports, selectedType, searchQuery]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getTypeIcon = (type: Report['type']) => {
    switch (type) {
      case 'financial': return DollarSign;
      case 'tour': return BarChart3;
      case 'tax': return FileText;
    }
  };

  const getTypeColor = (type: Report['type']) => {
    switch (type) {
      case 'financial': return 'from-green-500/20 to-green-600/20 border-green-500/30';
      case 'tour': return 'from-blue-500/20 to-blue-600/20 border-blue-500/30';
      case 'tax': return 'from-purple-500/20 to-purple-600/20 border-purple-500/30';
    }
  };

  const handleExport = (report: Report) => {
    haptic('success');
    // Simulate export
    console.log('Exporting report:', report.id);
  };

  return (
    <div className="h-full bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white flex flex-col">
      {/* Header - Desktop Style */}
      <div className="sticky top-0 z-10 bg-gray-900/60 backdrop-blur-xl border-b border-white/10 px-5 pt-5 pb-4">
        <h1 className="text-xl font-bold tracking-tight">Reports</h1>
        
        {/* Search */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 pl-10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          <Filter className="absolute left-3 top-3.5 w-4 h-4 text-white/40" />
        </div>

        {/* Type Filter */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {['all', 'financial', 'tour', 'tax'].map((type) => (
            <button
              key={type}
              onClick={() => {
                setSelectedType(type as typeof selectedType);
                haptic('selection');
              }}
              className={`px-4 py-2 rounded-lg capitalize whitespace-nowrap transition-all touch-optimized ${
                selectedType === type
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Reports List */}
      <div className="flex-1 overflow-y-auto px-5 py-4 smooth-scroll">
        {isRefreshing && (
          <div className="text-center py-4">
            <div className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin-optimized" />
          </div>
        )}

        <div className="space-y-3">
          {filteredReports.map((report, index) => {
            const Icon = getTypeIcon(report.type);
            return (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: Math.min(index * 0.03, 0.15),
                  duration: 0.2,
                  ease: 'easeOut',
                }}
                onClick={() => {
                  setSelectedReport(report);
                  haptic('light');
                }}
                className={`bg-gradient-to-br ${getTypeColor(report.type)} border rounded-lg px-4 py-3 cursor-pointer hover:scale-[0.98] transition-transform card-list-item touch-optimized`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{report.title}</h3>
                      <p className="text-xs text-white/60">{report.period}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    report.status === 'final' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {report.status}
                  </span>
                </div>

                {report.revenue !== undefined && (
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white/5 rounded-lg p-2">
                      <div className="text-xs text-white/60">Revenue</div>
                      <div className="font-semibold text-green-400">{formatCurrency(report.revenue)}</div>
                    </div>
                    {report.expenses !== undefined && (
                      <div className="bg-white/5 rounded-lg p-2">
                        <div className="text-xs text-white/60">Expenses</div>
                        <div className="font-semibold text-red-400">{formatCurrency(report.expenses)}</div>
                      </div>
                    )}
                    {report.profit !== undefined && (
                      <div className="bg-white/5 rounded-lg p-2">
                        <div className="text-xs text-white/60">Profit</div>
                        <div className="font-semibold text-blue-400">{formatCurrency(report.profit)}</div>
                      </div>
                    )}
                    {report.shows !== undefined && !report.expenses && (
                      <div className="bg-white/5 rounded-lg p-2">
                        <div className="text-xs text-white/60">Shows</div>
                        <div className="font-semibold">{report.shows}</div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end"
          onClick={() => setSelectedReport(null)}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-gray-900 rounded-t-2xl px-5 py-5 max-h-[80vh] overflow-y-auto"
          >
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6" />
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                {(() => {
                  const Icon = getTypeIcon(selectedReport.type);
                  return <Icon className="w-6 h-6 text-blue-400" />;
                })()}
                <div>
                  <h2 className="text-base font-bold">{selectedReport.title}</h2>
                  <p className="text-sm text-white/60">{selectedReport.period}</p>
                </div>
              </div>
              <span className={`text-xs px-3 py-1.5 rounded-full ${
                selectedReport.status === 'final' 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-yellow-500/20 text-yellow-400'
              }`}>
                {selectedReport.status}
              </span>
            </div>

            {selectedReport.revenue !== undefined && (
              <div className="space-y-3 mb-6">
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-3">
                  <div className="text-sm text-white/60 mb-1">Total Revenue</div>
                  <div className="text-lg font-bold text-green-400">{formatCurrency(selectedReport.revenue)}</div>
                </div>
                
                {selectedReport.expenses !== undefined && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
                    <div className="text-sm text-white/60 mb-1">Total Expenses</div>
                    <div className="text-lg font-bold text-red-400">{formatCurrency(selectedReport.expenses)}</div>
                  </div>
                )}

                {selectedReport.profit !== undefined && (
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg px-4 py-3">
                    <div className="text-sm text-white/60 mb-1">Net Profit</div>
                    <div className="text-lg font-bold text-blue-400 flex items-center gap-2">
                      {formatCurrency(selectedReport.profit)}
                      <TrendingUp className="w-5 h-5" />
                    </div>
                  </div>
                )}

                {selectedReport.shows !== undefined && (
                  <div className="bg-white/5 rounded-lg px-4 py-3">
                    <div className="text-sm text-white/60 mb-1">Total Shows</div>
                    <div className="text-lg font-bold">{selectedReport.shows}</div>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleExport(selectedReport)}
                className="bg-blue-500 hover:bg-blue-600 rounded-lg py-2.5 font-semibold text-sm flex items-center justify-center gap-2 transition-all"
              >
                <Download className="w-4 h-4" />
                Export PDF
              </button>
              <button
                onClick={() => setSelectedReport(null)}
                className="bg-white/10 rounded-lg py-2.5 font-semibold text-sm hover:bg-white/20 transition-all"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};
