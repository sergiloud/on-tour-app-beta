import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { t } from '../../lib/i18n';

// Import all dashboard components
import { FinancialHealthKPI } from './FinancialHealthKPI';
import { NextCriticalEventKPI } from './NextCriticalEventKPI';
import { KeyPerformanceKPI } from './KeyPerformanceKPI';
import { FinanceSummaryCard } from './FinanceSummaryCard';
import { ShowsSummaryCard } from './ShowsSummaryCard';
import { MissionControlSummaryCard } from './MissionControlSummaryCard';
import { ActivityFeed } from './ActivityFeed';
import { QuickActions, getDefaultQuickActions } from './QuickActions';
import { WelcomeCard } from './WelcomeCard';
import { DashboardSkeleton } from './Skeletons';
import { HeroSection } from './HeroSection';
import { ParallaxCard, ScrollTriggeredAnimation } from './ParallaxCard';

// Types for dashboard data
interface DashboardData {
  financialHealth: {
    value: number; // 0-100
    status: 'critical' | 'warning' | 'good';
    amount: number;
    currency: string;
    trend: number[];
  };
  nextEvent: {
    eventName: string;
    location: string;
    daysUntil: number;
    timeUntil?: string;
    urgency: 'low' | 'medium' | 'high' | 'critical';
  } | null;
  performance: {
    title: string;
    value: number;
    target: number;
    unit: string;
    trend: 'up' | 'down' | 'stable';
    status: 'excellent' | 'good' | 'warning' | 'poor';
    trendData: number[];
  };
  financeSummary: {
    netProfit: number;
    currency: string;
    trend: number[]; // Array of last 7 days/weeks values
    status: 'positive' | 'negative' | 'neutral';
  };
  showsSummary: {
    upcoming: Array<{
      id: string;
      name: string;
      date: string;
      city: string;
      status: 'confirmed' | 'pending' | 'cancelled';
    }>;
    totalShows: number;
  };
  missions: {
    pending: Array<{
      id: string;
      title: string;
      priority: 'high' | 'medium' | 'low';
      status: 'pending' | 'in_progress' | 'completed';
      assignee?: string;
    }>;
    total: number;
    completedToday: number;
  };
  activities: Array<{
    id: string;
    type: 'show_added' | 'finance_updated' | 'mission_completed' | 'travel_booked' | 'alert_triggered';
    title: string;
    description: string;
    timestamp: Date;
    priority?: 'high' | 'medium' | 'low';
    metadata?: Record<string, any>;
  }>;
}

interface ProactiveDashboardProps {
  userRole?: 'artist' | 'agency';
  isNewUser?: boolean;
}

export const ProactiveDashboard: React.FC<ProactiveDashboardProps> = ({
  userRole = 'artist',
  isNewUser = false
}) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Generate dynamic headline based on data
  const generateTodaysHeadline = (dashboardData: DashboardData) => {
    const today = new Date();

    // Check for today's shows
    const todaysShows = dashboardData.showsSummary.upcoming.filter(show => {
      const showDate = new Date(show.date);
      return showDate.toDateString() === today.toDateString();
    });

    if (todaysShows.length > 0) {
      return {
        text: `¡Show en ${todaysShows[0]!.city} esta noche!`,
        type: 'critical' as const,
        pulse: true
      };
    }

    // Check for critical financial alerts
    if (dashboardData.financialHealth.status === 'critical') {
      return {
        text: 'Atención: Salud financiera crítica',
        type: 'critical' as const,
        pulse: true
      };
    }

    // Check for high priority missions
    const highPriorityMissions = dashboardData.missions.pending.filter(m => m.priority === 'high');
    if (highPriorityMissions.length > 0) {
      return {
        text: `${highPriorityMissions.length} tareas críticas pendientes`,
        type: 'warning' as const,
        pulse: false
      };
    }

    // Check for upcoming events within 3 days
    if (dashboardData.nextEvent && dashboardData.nextEvent.daysUntil <= 3) {
      return {
        text: `Próximo: ${dashboardData.nextEvent.eventName} en ${dashboardData.nextEvent.daysUntil} días`,
        type: 'info' as const,
        pulse: false
      };
    }

    // Default success message
    return {
      text: 'Todo en orden para tu gira',
      type: 'success' as const,
      pulse: false
    };
  };

  // Simulate data loading
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock data - in real app this would come from APIs
      const mockData: DashboardData = {
        financialHealth: {
          value: 78,
          status: 'good' as const,
          amount: 125000,
          currency: 'EUR',
          trend: [75000, 82000, 95000, 110000, 125000]
        },
        nextEvent: {
          eventName: 'Madrid Arena Show',
          location: 'Madrid, Spain',
          daysUntil: 2,
          timeUntil: '48h 30m',
          urgency: 'high' as const
        },
        performance: {
          title: 'Monthly Performance',
          value: 85,
          target: 90,
          unit: '%',
          trend: 'up' as const,
          status: 'good' as const,
          trendData: [75, 78, 82, 85, 88, 85]
        },
        financeSummary: {
          netProfit: 125000,
          currency: 'EUR',
          trend: [120000, 118000, 122000, 125000],
          status: 'positive' as const
        },
        showsSummary: {
          upcoming: [
            {
              id: '1',
              name: 'Barcelona Concert',
              date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]!,
              city: 'Barcelona',
              status: 'confirmed' as const
            },
            {
              id: '2',
              name: 'Valencia Show',
              date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]!,
              city: 'Valencia',
              status: 'pending' as const
            }
          ],
          totalShows: 24
        },
        missions: {
          pending: [
            {
              id: '1',
              title: 'Book hotel for Madrid',
              priority: 'high',
              status: 'pending',
              assignee: 'Manager'
            },
            {
              id: '2',
              title: 'Review contract terms',
              priority: 'medium',
              status: 'in_progress'
            },
            {
              id: '3',
              title: 'Update social media posts',
              priority: 'low',
              status: 'pending'
            }
          ],
          total: 12,
          completedToday: 3
        },
        activities: [
          {
            id: '1',
            type: 'show_added',
            title: 'New show scheduled',
            description: 'Barcelona Concert added to calendar',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            priority: 'medium'
          },
          {
            id: '2',
            type: 'finance_updated',
            title: 'Revenue updated',
            description: 'Madrid show revenue: €45,000',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
          },
          {
            id: '3',
            type: 'mission_completed',
            title: 'Task completed',
            description: 'Sound check equipment verified',
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
            priority: 'high'
          }
        ]
      };

      setData(mockData);
      setLoading(false);
    };

    loadDashboardData();
  }, []);

  // Quick action handlers
  const handleAddShow = () => { /* TODO */ };
  const handleViewFinance = () => { /* TODO */ };
  const handleCreateMission = () => { /* TODO */ };
  const handleBookTravel = () => { /* TODO */ };
  const handleViewCalendar = () => { /* TODO */ };
  const handleExportData = () => { /* TODO */ };

  const quickActions = getDefaultQuickActions(
    handleAddShow,
    handleViewFinance,
    handleCreateMission,
    handleBookTravel,
    handleViewCalendar,
    handleExportData
  );

  // Show welcome card for new users
  if (isNewUser && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <WelcomeCard
          onGetStarted={() => setData({} as DashboardData)} // This would trigger data loading
          onImportData={() => { /* TODO */ }}
        />
      </div>
    );
  }

  // Show loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <DashboardSkeleton />
      </div>
    );
  }

  // Show error state if no data
  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
            <span className="text-2xl">❌</span>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            {t('dashboard.error.title') || 'Unable to load dashboard'}
          </h2>
          <p className="text-slate-400 mb-4">
            {t('dashboard.error.message') || 'Please try refreshing the page'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
          >
            {t('dashboard.error.retry') || 'Retry'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Hero Section */}
        <HeroSection
          userName="Danny"
          todaysHeadline={data ? generateTodaysHeadline(data) : { text: 'Cargando...', type: 'info', pulse: false }}
        />

        {/* KPI Row - Top Priority (Inverted Pyramid) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 1.0 }}
          >
            <FinancialHealthKPI
              value={data.financialHealth.value}
              status={data.financialHealth.status}
              amount={data.financialHealth.amount}
              currency={data.financialHealth.currency}
              trend={data.financialHealth.trend}
            />
          </motion.div>

          {data.nextEvent && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1.2 }}
            >
              <NextCriticalEventKPI
                eventName={data.nextEvent.eventName}
                location={data.nextEvent.location}
                daysUntil={data.nextEvent.daysUntil}
                timeUntil={data.nextEvent.timeUntil}
                urgency={data.nextEvent.urgency}
              />
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 1.4 }}
          >
            <KeyPerformanceKPI
              title={data.performance.title}
              value={data.performance.value}
              target={data.performance.target}
              unit={data.performance.unit}
              trend={data.performance.trend}
              status={data.performance.status}
              trendData={data.performance.trendData}
            />
          </motion.div>
        </motion.div>

        {/* Summary Cards Row */}
        <ScrollTriggeredAnimation threshold={0.1} delay={200}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ParallaxCard parallaxOffset={0.3}>
              <FinanceSummaryCard
                netProfit={data.financeSummary.netProfit}
                currency={data.financeSummary.currency}
                trend={data.financeSummary.trend}
                status={data.financeSummary.status}
              />
            </ParallaxCard>

            <ParallaxCard parallaxOffset={0.2}>
              <ShowsSummaryCard
                upcomingShows={data.showsSummary.upcoming}
                totalShows={data.showsSummary.totalShows}
              />
            </ParallaxCard>

            <ParallaxCard parallaxOffset={0.1}>
              <MissionControlSummaryCard
                pendingMissions={data.missions.pending}
                totalMissions={data.missions.total}
                completedToday={data.missions.completedToday}
              />
            </ParallaxCard>
          </div>
        </ScrollTriggeredAnimation>

        {/* Quick Actions */}
        <ScrollTriggeredAnimation threshold={0.1} delay={100} direction="up">
          <QuickActions actions={quickActions} />
        </ScrollTriggeredAnimation>

        {/* Activity Feed - Bottom of Pyramid */}
        <ScrollTriggeredAnimation threshold={0.1} delay={150} direction="up">
          <ActivityFeed activities={data.activities} />
        </ScrollTriggeredAnimation>
      </div>
    </div>
  );
};
